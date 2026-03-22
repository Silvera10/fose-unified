/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Reporte SIFSE (render-sifse.js)
   Mapeo de rubros internos → códigos SIFSE del MEN,
   catálogo editable de fuentes/gastos, vista previa
   y exportación del reporte trimestral acumulado.
══════════════════════════════════════════════════════════ */

var _sifseTrim = 1;

/* ═══════════════════════════════════════════════════════
   A) HELPERS DE CÁLCULO (presupuesto acumulado)
═══════════════════════════════════════════════════════ */

function _sifseDefEg(d, cod, tMax){
  const r = (d.rubros||[]).find(x => x.cod === cod);
  if(!r) return 0;
  let v = Number(r.ini||0);
  for(let t=1; t<=tMax; t++){
    const m = getMods(d, cod, t);
    v += m.adi - m.red + m.cre - m.cco;
  }
  return v;
}

function _sifseDefIng(d, cod, tMax){
  const r = (d.rubros_ing||[]).find(x => x.cod === cod);
  if(!r) return 0;
  let v = Number(r.ini||0);
  for(let t=1; t<=tMax; t++){
    const m = getModsIng(d, cod, t);
    v += m.adi - m.red + m.cre - m.cco;
  }
  return v;
}

function _sifseCompAcum(d, cod, tMax){
  let s=0; for(let t=1;t<=tMax;t++) s += getCompromisoEgTrim(d,cod,t); return s;
}
function _sifseObligAcum(d, cod, tMax){
  let s=0; for(let t=1;t<=tMax;t++) s += getGastos(d,cod,t); return s;
}
function _sifsePagosAcum(d, cod, tMax){
  let s=0; for(let t=1;t<=tMax;t++) s += getPagoEgTrim(d,cod,t); return s;
}
function _sifseRecAcum(d, cod, tMax){
  let s=0; for(let t=1;t<=tMax;t++) s += getRecaudoEfectivoIng(d,cod,t); return s;
}

/* ═══════════════════════════════════════════════════════
   B) MOTOR DE CÁLCULO — Agrupación por códigos SIFSE
═══════════════════════════════════════════════════════ */

function _sifseCalcIngresos(d, tMax){
  const cat = d.sifse_catalogo || {fuentes:[]};
  const map = d.sifse_map_ing || {};
  const rubros = (d.rubros_ing||[]).filter(r => !r.esGrupo);
  const agg = {};

  rubros.forEach(r => {
    const cf = map[r.cod];
    if(!cf) return;
    if(!agg[cf]) agg[cf] = {ini:0, def:0, rec:0};
    agg[cf].ini += Number(r.ini||0);
    agg[cf].def += _sifseDefIng(d, r.cod, tMax);
    agg[cf].rec += _sifseRecAcum(d, r.cod, tMax);
  });

  const fm = {};
  (cat.fuentes||[]).forEach(f => fm[f.cod] = f.nom);

  return Object.entries(agg).map(([c, v]) => ({
    codF: Number(c), nomF: fm[c] || 'Fuente '+c,
    ini: v.ini, def: v.def,
    // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
    rec: (v.rec > v.def && v.def >= 0) ? v.def : v.rec
  })).sort((a,b) => a.codF - b.codF);
}

function _sifseCalcGastos(d, tMax){
  const cat = d.sifse_catalogo || {fuentes:[], gastos:[]};
  const map = d.sifse_map_eg || {};
  const mapIng = d.sifse_map_ing || {};
  const rubros = (d.rubros||[]).filter(r => !r.esGrupo);
  const agg = {};

  /* Lookup: contrato_full id → fuente interna (rubro_ing cod) */
  const fuenteLookup = {};
  (d.contratos_full||[]).forEach(cf => {
    if(cf.id && cf.fuente) fuenteLookup[cf.id] = cf.fuente;
  });

  /* Helper: obtener fuente interna de un registro trimestral */
  function _getFuenteInt(entry){
    if(entry.fuente) return entry.fuente;
    if(entry.contrato_full_id && fuenteLookup[entry.contrato_full_id])
      return fuenteLookup[entry.contrato_full_id];
    return '';
  }

  /* Helper: convertir fuente interna → código SIFSE de fuente */
  function _toSifseFuente(fuenteInt, defaultSifse){
    if(!fuenteInt) return defaultSifse;
    const mapped = mapIng[fuenteInt];
    return mapped ? String(mapped) : defaultSifse;
  }

  rubros.forEach(r => {
    const m = map[r.cod];
    if(!m || !m.gasto) return;
    const defaultFuenteSifse = m.fuente || '';
    const codGasto = m.gasto;

    /* ─── Encontrar todas las fuentes SIFSE usadas para este rubro ─── */
    const fuentesSifse = new Set();
    if(defaultFuenteSifse) fuentesSifse.add(defaultFuenteSifse);

    (d.contratos_full||[]).filter(cf => cf.rubro === r.cod && cf.fuente)
      .forEach(cf => {
        const fs = _toSifseFuente(cf.fuente, defaultFuenteSifse);
        if(fs) fuentesSifse.add(fs);
      });

    /* Si no hay fuentes, usar la del mapeo */
    if(!fuentesSifse.size && defaultFuenteSifse) fuentesSifse.add(defaultFuenteSifse);
    if(!fuentesSifse.size) return;

    /* ─── Calcular comp/oblig/pagos por fuente SIFSE ─── */
    fuentesSifse.forEach(fSifse => {
      const k = fSifse + '|' + codGasto;
      if(!agg[k]) agg[k] = {fuente:fSifse, gasto:codGasto, ini:0, def:0, comp:0, oblig:0, pagos:0};

      for(let t = 1; t <= tMax; t++){
        /* Compromisos */
        agg[k].comp += (d.compromisos_eg||[])
          .filter(e => e.cod === r.cod && Number(e.trim) === t
            && _toSifseFuente(_getFuenteInt(e), defaultFuenteSifse) === fSifse)
          .reduce((s,e) => s + (Number(e.valor)||0), 0);

        /* Obligaciones (gastos registrados) */
        agg[k].oblig += (d.contratos||[])
          .filter(c => c.cod_rubro === r.cod && Number(c.trim) === t
            && _toSifseFuente(_getFuenteInt(c), defaultFuenteSifse) === fSifse)
          .reduce((s,c) => s + (Number(c.valor)||0), 0);

        /* Pagos — leer desde contratos_full[].pagos[] (pagos efectuados con egreso) */
        agg[k].pagos += (d.contratos_full||[])
          .filter(cf => cf.rubro === r.cod
            && _toSifseFuente(cf.fuente || _getFuenteInt(cf), defaultFuenteSifse) === fSifse)
          .reduce((s, cf) => {
            return s + (cf.pagos||[])
              .filter(p => {
                if(!p.fecha_pago || !p.num_egreso) return false;
                const m = Number(String(p.fecha_pago).split('-')[1]||0);
                const trimP = m<=3?1 : m<=6?2 : m<=9?3 : 4;
                return trimP === t;
              })
              .reduce((sp, p) => sp + (Number(p.valor)||0), 0);
          }, 0);
      }
    });

    /* ─── Distribuir Presup. Inicial y Definitivo por fuente ─── */
    const totalDef = _sifseDefEg(d, r.cod, tMax);
    const totalIni = Number(r.ini || 0);

    /* Sumar valor de contratos de fuentes NO-default */
    const allocOtras = {};
    let sumaOtras = 0;
    (d.contratos_full||[]).filter(cf => cf.rubro === r.cod && cf.fuente).forEach(cf => {
      const fs = _toSifseFuente(cf.fuente, defaultFuenteSifse);
      if(fs !== defaultFuenteSifse){
        if(!allocOtras[fs]) allocOtras[fs] = 0;
        allocOtras[fs] += Number(cf.valor) || 0;
        sumaOtras += Number(cf.valor) || 0;
      }
    });

    fuentesSifse.forEach(fSifse => {
      const k = fSifse + '|' + codGasto;
      if(fSifse === defaultFuenteSifse){
        /* Fuente principal: ini completo, def = total - asignado a otras */
        agg[k].ini += totalIni;
        agg[k].def += Math.max(0, totalDef - sumaOtras);
      } else {
        /* Fuentes adicionales: ini=0, def = valor contratos de esa fuente */
        agg[k].def += allocOtras[fSifse] || 0;
      }
    });
  });

  const fm = {}, gm = {};
  (cat.fuentes||[]).forEach(f => fm[f.cod] = f.nom);
  (cat.gastos||[]).forEach(g => gm[g.cod] = g.nom);

  return Object.values(agg).map(v => ({
    codF: Number(v.fuente), nomF: fm[v.fuente] || 'Fuente '+v.fuente,
    codG: Number(v.gasto),  nomG: gm[v.gasto]  || 'Gasto '+v.gasto,
    ini: v.ini, def: v.def, comp: v.comp, oblig: v.oblig, pagos: v.pagos
  })).sort((a,b) => a.codF - b.codF || a.codG - b.codG);
}

/* ═══════════════════════════════════════════════════════
   C) RENDER PRINCIPAL
═══════════════════════════════════════════════════════ */

R.sifse = function(){
  const d = DB.load();
  const pg = $('page-sifse');
  if(!pg) return;

  // Auto-populate catálogo si está vacío (instituciones existentes)
  if(!d.sifse_catalogo || !(d.sifse_catalogo.fuentes||[]).length){
    const def = DB.initVacio();
    d.sifse_catalogo = JSON.parse(JSON.stringify(def.sifse_catalogo));
    DB.save(d);
  }

  pg.innerHTML = `
  <div class="px-3 py-2">
    <h5 class="mb-3">
      <i class="bi bi-file-earmark-spreadsheet me-2"></i>
      Reporte SIFSE — Sistema de Información Financiera del FSE
    </h5>

    <ul class="nav nav-tabs" id="sifse-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" id="sifse-t-mapeo" data-bs-toggle="tab"
           href="#sifse-tab-mapeo" role="tab">
          <i class="bi bi-diagram-3 me-1"></i>Mapeo de Rubros</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="sifse-t-catalogo" data-bs-toggle="tab"
           href="#sifse-tab-catalogo" role="tab">
          <i class="bi bi-list-check me-1"></i>Catálogo SIFSE</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="sifse-t-preview" data-bs-toggle="tab"
           href="#sifse-tab-preview" role="tab">
          <i class="bi bi-eye me-1"></i>Vista Previa + Exportar</a>
      </li>
    </ul>

    <div class="tab-content pt-3">
      <div class="tab-pane fade show active" id="sifse-tab-mapeo" role="tabpanel"></div>
      <div class="tab-pane fade" id="sifse-tab-catalogo" role="tabpanel"></div>
      <div class="tab-pane fade" id="sifse-tab-preview" role="tabpanel"></div>
    </div>
  </div>`;

  _sifseRenderMapeo();

  // Refrescar pestaña al cambiar
  document.getElementById('sifse-t-catalogo').addEventListener('shown.bs.tab', _sifseRenderCatalogo);
  document.getElementById('sifse-t-preview').addEventListener('shown.bs.tab', _sifseRenderPreview);
};

/* ═══════════════════════════════════════════════════════
   D) PESTAÑA MAPEO DE RUBROS
═══════════════════════════════════════════════════════ */

function _sifseOptsF(cat, sel){
  let h = '<option value="">— Sin asignar —</option>';
  (cat.fuentes||[]).forEach(f => {
    h += `<option value="${f.cod}"${Number(sel)===f.cod?' selected':''}>${f.cod} — ${f.nom}</option>`;
  });
  return h;
}

function _sifseOptsG(cat, sel){
  let h = '<option value="">— Sin asignar —</option>';
  (cat.gastos||[]).forEach(g => {
    h += `<option value="${g.cod}"${Number(sel)===g.cod?' selected':''}>${g.cod} — ${g.nom}</option>`;
  });
  return h;
}

function _sifseRenderMapeo(){
  const d = DB.load();
  const cat = d.sifse_catalogo || {fuentes:[], gastos:[]};
  const mapEg = d.sifse_map_eg || {};
  const mapIng = d.sifse_map_ing || {};

  const rubrosEg  = (d.rubros||[]).filter(r => !r.esGrupo);
  const rubrosIng = (d.rubros_ing||[]).filter(r => !r.esGrupo);
  const mappedEg  = rubrosEg.filter(r => mapEg[r.cod] && mapEg[r.cod].fuente && mapEg[r.cod].gasto).length;
  const mappedIng = rubrosIng.filter(r => mapIng[r.cod]).length;

  /* ── Filas Egresos ── */
  let egRows = '';
  if(!rubrosEg.length){
    egRows = '<tr><td colspan="5" class="text-center text-muted py-3">No hay rubros de egresos configurados</td></tr>';
  } else {
    rubrosEg.forEach(r => {
      const m = mapEg[r.cod] || {};
      const ok = m.fuente && m.gasto;
      egRows += `<tr data-sifse-eg="${r.cod}" style="${ok?'':'background:#fff9c4'}">
        <td><code style="font-size:11px">${r.cod}</code></td>
        <td style="font-size:12px">${r.con||''}</td>
        <td><select class="form-select form-select-sm" style="font-size:11px;min-width:180px"
              onchange="_sifseMapEg('${r.cod}','fuente',this.value)">${_sifseOptsF(cat, m.fuente)}</select></td>
        <td><select class="form-select form-select-sm" style="font-size:11px;min-width:200px"
              onchange="_sifseMapEg('${r.cod}','gasto',this.value)">${_sifseOptsG(cat, m.gasto)}</select></td>
        <td class="text-center"><span class="sifse-status">${ok
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-exclamation-triangle-fill text-warning"></i>'}</span></td>
      </tr>`;
    });
  }

  /* ── Filas Ingresos ── */
  let ingRows = '';
  if(!rubrosIng.length){
    ingRows = '<tr><td colspan="4" class="text-center text-muted py-3">No hay rubros de ingresos configurados</td></tr>';
  } else {
    rubrosIng.forEach(r => {
      const sel = mapIng[r.cod];
      const ok = !!sel;
      ingRows += `<tr data-sifse-ing="${r.cod}" style="${ok?'':'background:#fff9c4'}">
        <td><code style="font-size:11px">${r.cod}</code></td>
        <td style="font-size:12px">${r.con||''}</td>
        <td><select class="form-select form-select-sm" style="font-size:11px;min-width:220px"
              onchange="_sifseMapIng('${r.cod}',this.value)">${_sifseOptsF(cat, sel)}</select></td>
        <td class="text-center"><span class="sifse-status">${ok
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-exclamation-triangle-fill text-warning"></i>'}</span></td>
      </tr>`;
    });
  }

  const el = document.getElementById('sifse-tab-mapeo');
  if(!el) return;

  el.innerHTML = `
    <div class="alert alert-info py-2" style="font-size:13px">
      <i class="bi bi-info-circle me-1"></i>
      Asigne a cada rubro presupuestal interno el código SIFSE correspondiente del MEN.
      Los rubros sin mapear <span style="background:#fff9c4;padding:0 4px">(amarillo)</span> no se incluirán en el reporte.
    </div>

    <!-- EGRESOS -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#795548;color:#fff">
        <div class="d-flex justify-content-between align-items-center">
          <span><i class="bi bi-arrow-up-circle me-1"></i>Rubros de Egresos</span>
          <span class="badge bg-light text-dark" id="sifse-cnt-eg">${mappedEg} de ${rubrosEg.length} mapeados</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover mb-0" style="font-size:12px">
          <thead style="background:#f5f5f5"><tr>
            <th style="width:100px">Código</th>
            <th>Concepto</th>
            <th style="width:220px">Fuente SIFSE</th>
            <th style="width:240px">Item Gasto SIFSE</th>
            <th style="width:40px;text-align:center"><i class="bi bi-check2-all"></i></th>
          </tr></thead>
          <tbody>${egRows}</tbody>
        </table>
      </div>
    </div>

    <!-- INGRESOS -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#145e2c;color:#fff">
        <div class="d-flex justify-content-between align-items-center">
          <span><i class="bi bi-arrow-down-circle me-1"></i>Rubros de Ingresos</span>
          <span class="badge bg-light text-dark" id="sifse-cnt-ing">${mappedIng} de ${rubrosIng.length} mapeados</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover mb-0" style="font-size:12px">
          <thead style="background:#f5f5f5"><tr>
            <th style="width:100px">Código</th>
            <th>Concepto</th>
            <th style="width:260px">Fuente SIFSE</th>
            <th style="width:40px;text-align:center"><i class="bi bi-check2-all"></i></th>
          </tr></thead>
          <tbody>${ingRows}</tbody>
        </table>
      </div>
    </div>`;
}

/* ── Handlers Mapeo ── */

function _sifseMapEg(cod, campo, val){
  const d = DB.load();
  if(!d.sifse_map_eg) d.sifse_map_eg = {};
  if(!d.sifse_map_eg[cod]) d.sifse_map_eg[cod] = {};
  d.sifse_map_eg[cod][campo] = val ? Number(val) : '';
  if(!d.sifse_map_eg[cod].fuente && !d.sifse_map_eg[cod].gasto){
    delete d.sifse_map_eg[cod];
  }
  DB.save(d);

  const m = d.sifse_map_eg[cod];
  const ok = m && m.fuente && m.gasto;
  const row = document.querySelector(`[data-sifse-eg="${cod}"]`);
  if(row){
    row.style.background = ok ? '' : '#fff9c4';
    const ic = row.querySelector('.sifse-status');
    if(ic) ic.innerHTML = ok
      ? '<i class="bi bi-check-circle-fill text-success"></i>'
      : '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
  }
  _sifseActualizarContadores();
}

function _sifseMapIng(cod, val){
  const d = DB.load();
  if(!d.sifse_map_ing) d.sifse_map_ing = {};
  if(val) d.sifse_map_ing[cod] = Number(val);
  else delete d.sifse_map_ing[cod];
  DB.save(d);

  const ok = !!val;
  const row = document.querySelector(`[data-sifse-ing="${cod}"]`);
  if(row){
    row.style.background = ok ? '' : '#fff9c4';
    const ic = row.querySelector('.sifse-status');
    if(ic) ic.innerHTML = ok
      ? '<i class="bi bi-check-circle-fill text-success"></i>'
      : '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
  }
  _sifseActualizarContadores();
}

function _sifseActualizarContadores(){
  const d = DB.load();
  const mapEg = d.sifse_map_eg || {};
  const mapIng = d.sifse_map_ing || {};
  const nEg  = (d.rubros||[]).filter(r => !r.esGrupo);
  const nIng = (d.rubros_ing||[]).filter(r => !r.esGrupo);
  const mEg  = nEg.filter(r => mapEg[r.cod] && mapEg[r.cod].fuente && mapEg[r.cod].gasto).length;
  const mIng = nIng.filter(r => mapIng[r.cod]).length;
  const e1 = document.getElementById('sifse-cnt-eg');
  const e2 = document.getElementById('sifse-cnt-ing');
  if(e1) e1.textContent = `${mEg} de ${nEg.length} mapeados`;
  if(e2) e2.textContent = `${mIng} de ${nIng.length} mapeados`;
}

/* ═══════════════════════════════════════════════════════
   E) PESTAÑA CATÁLOGO SIFSE
═══════════════════════════════════════════════════════ */

function _sifseRenderCatalogo(){
  const d = DB.load();
  const cat = d.sifse_catalogo || {fuentes:[], gastos:[]};

  /* Filas fuentes */
  let fRows = '';
  (cat.fuentes||[]).forEach(f => {
    fRows += `<tr>
      <td class="text-center"><strong>${f.cod}</strong></td>
      <td>${f.nom}</td>
      <td class="text-center" style="width:90px">
        <button class="btn btn-sm btn-outline-primary py-0 px-1 me-1" title="Editar"
          onclick="_sifseEditCat('fuentes',${f.cod})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" title="Eliminar"
          onclick="_sifseDelCat('fuentes',${f.cod})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  });

  /* Filas gastos */
  let gRows = '';
  (cat.gastos||[]).forEach(g => {
    gRows += `<tr>
      <td class="text-center"><strong>${g.cod}</strong></td>
      <td>${g.nom}</td>
      <td class="text-center" style="width:90px">
        <button class="btn btn-sm btn-outline-primary py-0 px-1 me-1" title="Editar"
          onclick="_sifseEditCat('gastos',${g.cod})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" title="Eliminar"
          onclick="_sifseDelCat('gastos',${g.cod})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  });

  const el = document.getElementById('sifse-tab-catalogo');
  if(!el) return;

  el.innerHTML = `
    <div class="alert alert-secondary py-2" style="font-size:13px">
      <i class="bi bi-info-circle me-1"></i>
      Catálogo de códigos SIFSE establecidos por el MEN. Puede agregar, editar o eliminar según necesidad.
    </div>

    <div class="row">
      <!-- FUENTES DE INGRESO -->
      <div class="col-lg-6 mb-3">
        <div class="card">
          <div class="card-header py-2" style="background:#145e2c;color:#fff">
            <i class="bi bi-arrow-down-circle me-1"></i>Fuentes de Ingreso (${(cat.fuentes||[]).length})
          </div>
          <div class="table-responsive" style="max-height:400px;overflow-y:auto">
            <table class="table table-sm table-hover mb-0" style="font-size:12px">
              <thead style="background:#f5f5f5;position:sticky;top:0"><tr>
                <th style="width:60px;text-align:center">Cód.</th><th>Nombre</th><th style="width:90px;text-align:center">Acciones</th>
              </tr></thead>
              <tbody>${fRows}</tbody>
            </table>
          </div>
          <div class="card-footer py-2">
            <div class="input-group input-group-sm">
              <input type="number" id="sifse-add-f-cod" class="form-control" style="max-width:70px" placeholder="Cód.">
              <input type="text" id="sifse-add-f-nom" class="form-control" placeholder="Nombre de la fuente">
              <button class="btn btn-success" onclick="_sifseAddCat('fuentes')"><i class="bi bi-plus-lg"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- ITEMS DE GASTO -->
      <div class="col-lg-6 mb-3">
        <div class="card">
          <div class="card-header py-2" style="background:#795548;color:#fff">
            <i class="bi bi-arrow-up-circle me-1"></i>Items de Gasto (${(cat.gastos||[]).length})
          </div>
          <div class="table-responsive" style="max-height:400px;overflow-y:auto">
            <table class="table table-sm table-hover mb-0" style="font-size:12px">
              <thead style="background:#f5f5f5;position:sticky;top:0"><tr>
                <th style="width:60px;text-align:center">Cód.</th><th>Nombre</th><th style="width:90px;text-align:center">Acciones</th>
              </tr></thead>
              <tbody>${gRows}</tbody>
            </table>
          </div>
          <div class="card-footer py-2">
            <div class="input-group input-group-sm">
              <input type="number" id="sifse-add-g-cod" class="form-control" style="max-width:70px" placeholder="Cód.">
              <input type="text" id="sifse-add-g-nom" class="form-control" placeholder="Nombre del gasto">
              <button class="btn btn-success" onclick="_sifseAddCat('gastos')"><i class="bi bi-plus-lg"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-2">
      <button class="btn btn-outline-secondary btn-sm" onclick="_sifseResetCat()">
        <i class="bi bi-arrow-counterclockwise me-1"></i>Restablecer Catálogo Predeterminado
      </button>
    </div>`;
}

/* ── Handlers Catálogo ── */

function _sifseAddCat(tipo){
  const d = DB.load();
  const pre = tipo === 'fuentes' ? 'f' : 'g';
  const codEl = document.getElementById(`sifse-add-${pre}-cod`);
  const nomEl = document.getElementById(`sifse-add-${pre}-nom`);
  if(!codEl || !nomEl) return;

  const cod = Number(codEl.value);
  const nom = (nomEl.value||'').trim();
  if(!cod || !nom){
    toast('Ingrese código y nombre', 'warning');
    return;
  }

  const arr = d.sifse_catalogo[tipo] || [];
  if(arr.find(x => x.cod === cod)){
    toast('Ya existe un registro con código ' + cod, 'warning');
    return;
  }

  arr.push({cod, nom});
  arr.sort((a,b) => a.cod - b.cod);
  d.sifse_catalogo[tipo] = arr;
  DB.save(d);
  toast('Código SIFSE agregado', 'success');
  _sifseRenderCatalogo();
}

function _sifseEditCat(tipo, cod){
  const d = DB.load();
  const arr = d.sifse_catalogo[tipo] || [];
  const item = arr.find(x => x.cod === cod);
  if(!item) return;

  const nuevo = prompt('Nombre para código ' + cod + ':', item.nom);
  if(nuevo !== null && nuevo.trim()){
    item.nom = nuevo.trim();
    DB.save(d);
    toast('Código SIFSE actualizado', 'success');
    _sifseRenderCatalogo();
  }
}

function _sifseDelCat(tipo, cod){
  if(!confirm('¿Eliminar código SIFSE ' + cod + '?')) return;
  const d = DB.load();
  d.sifse_catalogo[tipo] = (d.sifse_catalogo[tipo]||[]).filter(x => x.cod !== cod);
  DB.save(d);
  toast('Código SIFSE eliminado', 'info');
  _sifseRenderCatalogo();
}

function _sifseResetCat(){
  if(!confirm('¿Restablecer el catálogo SIFSE a los valores predeterminados del MEN?\nLos códigos personalizados se perderán.')) return;
  const d = DB.load();
  const def = DB.initVacio();
  d.sifse_catalogo = JSON.parse(JSON.stringify(def.sifse_catalogo));
  DB.save(d);
  toast('Catálogo SIFSE restablecido', 'success');
  _sifseRenderCatalogo();
}

/* ═══════════════════════════════════════════════════════
   F) PESTAÑA VISTA PREVIA + EXPORTAR
═══════════════════════════════════════════════════════ */

function _sifseRenderPreview(){
  const d = DB.load();
  const c = d.config || {};
  const tMax = _sifseTrim;

  const dane = c.ciudad || '—';
  const anio = c.vigencia || new Date().getFullYear();

  /* Conteo rubros sin mapear */
  const mapEg = d.sifse_map_eg || {};
  const mapIng = d.sifse_map_ing || {};
  const egSin  = (d.rubros||[]).filter(r => !r.esGrupo && !(mapEg[r.cod] && mapEg[r.cod].fuente && mapEg[r.cod].gasto)).length;
  const ingSin = (d.rubros_ing||[]).filter(r => !r.esGrupo && !mapIng[r.cod]).length;
  const totalSin = egSin + ingSin;

  /* Calcular datos */
  const ingData  = _sifseCalcIngresos(d, tMax);
  const gastData = _sifseCalcGastos(d, tMax);

  /* Tabla Ingresos */
  let ingRows = '';
  let totIni=0, totDef=0, totRec=0;
  ingData.forEach(row => {
    totIni += row.ini; totDef += row.def; totRec += row.rec;
    ingRows += `<tr>
      <td class="text-center">${dane}</td><td class="text-center">${anio}</td><td class="text-center">${tMax}</td>
      <td class="text-center"><strong>${row.codF}</strong></td>
      <td class="text-end">${fmt(row.ini)}</td><td class="text-end">${fmt(row.def)}</td><td class="text-end">${fmt(row.rec)}</td>
    </tr>`;
  });
  if(!ingData.length) ingRows = '<tr><td colspan="7" class="text-center text-muted py-2">Sin datos de ingresos mapeados</td></tr>';
  // Seguridad en totales: recaudo no puede superar definitivo (reducciones son movidas internas)
  if(totRec > totDef && totDef >= 0) totRec = totDef;
  const ingTot = ingData.length ? `<tr style="background:#1B5E20;color:#fff;font-weight:700">
    <td colspan="4" style="text-align:right">TOTALES</td>
    <td class="text-end">${fmt(totIni)}</td><td class="text-end">${fmt(totDef)}</td><td class="text-end">${fmt(totRec)}</td>
  </tr>` : '';

  /* Tabla Gastos */
  let gastRows = '';
  let gt={ini:0,def:0,comp:0,oblig:0,pagos:0};
  gastData.forEach(row => {
    gt.ini+=row.ini; gt.def+=row.def; gt.comp+=row.comp; gt.oblig+=row.oblig; gt.pagos+=row.pagos;
    gastRows += `<tr>
      <td class="text-center">${dane}</td><td class="text-center">${anio}</td><td class="text-center">${tMax}</td>
      <td class="text-center"><strong>${row.codF}</strong></td><td class="text-center"><strong>${row.codG}</strong></td>
      <td class="text-end">${fmt(row.ini)}</td><td class="text-end">${fmt(row.def)}</td>
      <td class="text-end">${fmt(row.comp)}</td><td class="text-end">${fmt(row.oblig)}</td><td class="text-end">${fmt(row.pagos)}</td>
    </tr>`;
  });
  if(!gastData.length) gastRows = '<tr><td colspan="10" class="text-center text-muted py-2">Sin datos de gastos mapeados</td></tr>';
  const gastTot = gastData.length ? `<tr style="background:#795548;color:#fff;font-weight:700">
    <td colspan="5" style="text-align:right">TOTALES</td>
    <td class="text-end">${fmt(gt.ini)}</td><td class="text-end">${fmt(gt.def)}</td>
    <td class="text-end">${fmt(gt.comp)}</td><td class="text-end">${fmt(gt.oblig)}</td><td class="text-end">${fmt(gt.pagos)}</td>
  </tr>` : '';

  const el = document.getElementById('sifse-tab-preview');
  if(!el) return;

  el.innerHTML = `
    <!-- Selector de trimestre -->
    <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
      <span class="fw-bold" style="font-size:13px">Trimestre:</span>
      <div class="btn-group btn-group-sm" role="group">
        ${[1,2,3,4].map(t => `<button class="btn ${t===tMax?'btn-primary':'btn-outline-primary'}"
          onclick="_sifseCambiarTrim(${t})">T${t}${t>1?' (acum.)':''}</button>`).join('')}
      </div>
      <span style="font-size:12px;color:#555">
        <i class="bi bi-building me-1"></i>DANE: <strong>${dane}</strong> | Vigencia: <strong>${anio}</strong>
      </span>
    </div>

    ${totalSin > 0 ? `<div class="alert alert-warning py-2" style="font-size:12px">
      <i class="bi bi-exclamation-triangle me-1"></i>
      <strong>${totalSin} rubro(s) sin mapear</strong> (${egSin} egresos, ${ingSin} ingresos).
      Vaya a la pestaña "Mapeo de Rubros" para asignar códigos SIFSE.
    </div>` : `<div class="alert alert-success py-2" style="font-size:12px">
      <i class="bi bi-check-circle me-1"></i> Todos los rubros están mapeados.
    </div>`}

    <!-- INGRESOS -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#145e2c;color:#fff">
        <i class="bi bi-arrow-down-circle me-1"></i>REPORTE DE INGRESOS PRESUPUESTALES — T${tMax} ${tMax>1?'(Acumulado)':''}
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0" style="font-size:12px">
          <thead style="background:#e8f5e9"><tr>
            <th class="text-center" style="width:80px">Cód. Estab.</th>
            <th class="text-center" style="width:50px">Año</th>
            <th class="text-center" style="width:50px">Trim.</th>
            <th class="text-center" style="width:80px">Fuente Ingreso</th>
            <th class="text-end">Presup. Inicial</th>
            <th class="text-end">Presup. Definitivo</th>
            <th class="text-end">Monto Recaudado</th>
          </tr></thead>
          <tbody>${ingRows}${ingTot}</tbody>
        </table>
      </div>
    </div>

    <!-- GASTOS -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#795548;color:#fff">
        <i class="bi bi-arrow-up-circle me-1"></i>REPORTE DE GASTOS PRESUPUESTALES — T${tMax} ${tMax>1?'(Acumulado)':''}
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0" style="font-size:12px">
          <thead style="background:#efebe9"><tr>
            <th class="text-center" style="width:80px">Cód. Estab.</th>
            <th class="text-center" style="width:50px">Año</th>
            <th class="text-center" style="width:50px">Trim.</th>
            <th class="text-center" style="width:80px">Fuente Ingreso</th>
            <th class="text-center" style="width:80px">Item Detalle</th>
            <th class="text-end">Presup. Inicial</th>
            <th class="text-end">Presup. Definitivo</th>
            <th class="text-end">Compromisos</th>
            <th class="text-end">Obligaciones</th>
            <th class="text-end">Pagos</th>
          </tr></thead>
          <tbody>${gastRows}${gastTot}</tbody>
        </table>
      </div>
    </div>

    <!-- Botón Exportar -->
    <div class="text-center mt-3 mb-4">
      <button class="btn btn-success btn-lg" onclick="exportarSIFSE(${tMax})" ${!ingData.length && !gastData.length ? 'disabled' : ''}>
        <i class="bi bi-file-earmark-excel me-2"></i>Exportar Reporte SIFSE a Excel
      </button>
      ${!ingData.length && !gastData.length ? '<div class="text-muted mt-1" style="font-size:12px">Primero debe mapear al menos un rubro en la pestaña "Mapeo".</div>' : ''}
    </div>`;
}

function _sifseCambiarTrim(t){
  _sifseTrim = t;
  _sifseRenderPreview();
}
