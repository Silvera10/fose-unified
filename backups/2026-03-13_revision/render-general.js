/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Hoja de Gastos (Presupuesto General de Egresos)
══════════════════════════════════════════════════════════ */

R.general = function(){
  const d = DB.load();
  const el = $('page-general');
  if (!el) return;

  let rows = '';
  let totalIni = 0, totalDef = 0;
  const rubros = d.rubros || [];

  rubros.forEach((r, idx) => {
    const nivel = getNivel(r.cod);
    const esGrupo = !!r.esGrupo;
    const ini = esGrupo ? sumarIniHojas(rubros, r.cod) : (Number(r.ini)||0);
    const def = esGrupo ? sumarHojasEg(d, r.cod, cod => getPresupDef(d, cod)) : getPresupDef(d, r.cod);
    const mods = def - ini;
    const label = GRUPO_LABELS[r.cod] || r.con;

    if (esGrupo && nivel <= 2){
      // Grupo grande
      rows += `<tr class="${nivel===1?'gtot':'gh'}">
        <td>${r.cod}</td>
        <td colspan="2">${label}</td>
        <td class="num">${fmt(ini)}</td>
        <td class="num">${fmt(mods)}</td>
        <td class="num">${fmt(def)}</td>
        <td></td></tr>`;
    } else if (esGrupo){
      // Sub-grupo
      rows += `<tr class="sub"><td>${r.cod}</td>
        <td colspan="2">${label}</td>
        <td class="num">${fmt(ini)}</td>
        <td class="num">${fmt(mods)}</td>
        <td class="num">${fmt(def)}</td>
        <td></td></tr>`;
    } else {
      // Hoja
      const ctaIcon = r.cuenta_contable
        ? `<i class="bi bi-check-circle-fill text-success" title="Cuenta contable: ${r.cuenta_contable}" style="cursor:help"></i>`
        : `<i class="bi bi-exclamation-triangle-fill text-warning" title="Sin cuenta contable asignada" style="cursor:help"></i>`;
      rows += `<tr>
        <td>${r.cod}</td>
        <td>${r.guia||''}</td>
        <td>${r.con} ${ctaIcon}</td>
        <td class="num"><input class="inp" type="number" value="${r.ini||0}" min="0"
            onchange="this.closest('tr').querySelector('[data-idx]').dataset.changed='1'"
            data-idx="${idx}"></td>
        <td class="num">${fmt(mods)}</td>
        <td class="num fw-bold">${fmt(def)}</td>
        <td class="ctr">
          <button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalRubro(${idx})" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarRubro(${idx})" title="Eliminar"><i class="bi bi-trash"></i></button>
        </td></tr>`;
      totalIni += Number(r.ini)||0;
      totalDef += def;
    }
  });

  // Totales generales (sumar solo nivel 1)
  let gTotalIni=0, gTotalDef=0;
  rubros.filter(r => getNivel(r.cod)===1).forEach(r => {
    gTotalIni += sumarIniHojas(rubros, r.cod);
    gTotalDef += sumarHojasEg(d, r.cod, cod => getPresupDef(d, cod));
  });
  if (rubros.filter(r=>getNivel(r.cod)===1).length === 0){
    gTotalIni = totalIni;
    gTotalDef = totalDef;
  }

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-journal-text me-2" style="color:var(--azul)"></i>Hoja de Gastos — Presupuesto de Egresos</h5>
      <div class="d-flex gap-1">
        <button class="btn btn-outline-secondary btn-sm" onclick="imprimirHojaEgresos()"><i class="bi bi-printer me-1"></i>Imprimir</button>
        <button class="btn btn-primary btn-sm" onclick="abrirModalRubro()"><i class="bi bi-plus-lg me-1"></i>Nuevo Rubro</button>
        <button class="btn btn-success btn-sm" onclick="guardarPresupBase()"><i class="bi bi-save me-1"></i>Guardar Apropiaciones</button>
      </div>
    </div>
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="tg">
            <thead><tr>
              <th style="width:100px">Código</th>
              <th style="width:80px">Guía</th>
              <th>Concepto</th>
              <th style="width:120px">Aprop. Inicial</th>
              <th style="width:120px">Modificaciones</th>
              <th style="width:120px">Presup. Definitivo</th>
              <th style="width:70px">Acc.</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr class="gtot">
              <td colspan="3" class="text-end fw-bold">TOTAL GENERAL EGRESOS</td>
              <td class="num fw-bold">${fmt(gTotalIni)}</td>
              <td class="num fw-bold">${fmt(gTotalDef - gTotalIni)}</td>
              <td class="num fw-bold">${fmt(gTotalDef)}</td>
              <td></td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>`;
};

/* Helpers para modal de rubro */
function toggleIniModal(){
  const esGrupo = $('mr-esGrupo').checked;
  const wrap = $('mr-ini-wrap');
  if (wrap) wrap.style.display = esGrupo ? 'none' : '';
  const ctaWrap = $('mr-cta-wrap');
  if (ctaWrap) ctaWrap.style.display = esGrupo ? 'none' : '';
}

function actualizarNivelBadge(){
  const cod = $('mr-cod').value.trim();
  const badge = $('mr-nivel-badge');
  if (!badge) return;
  if (!cod){ badge.textContent = ''; return; }
  const n = getNivel(cod);
  badge.innerHTML = `Nivel: <strong>${n}</strong> ${n<=2?'(Grupo principal)':n===3?'(Sub-grupo)':'(Detalle)'}`;
}

function toggleIniModalIng(){
  const wrap = $('mri-ini-wrap');
  if (wrap) wrap.style.display = $('mri-esGrupo').checked ? 'none' : '';
}

function actualizarNivelBadgeIng(){
  const cod = $('mri-cod').value.trim();
  const badge = $('mri-nivel-badge');
  if (!badge) return;
  if (!cod){ badge.textContent = ''; return; }
  const n = getNivel(cod);
  badge.innerHTML = `Nivel: <strong>${n}</strong>`;
}
