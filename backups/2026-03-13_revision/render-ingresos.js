/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Hoja de Ingresos (Presupuesto General de Ingresos)
══════════════════════════════════════════════════════════ */

R.ingresosGeneral = function(){
  const d = DB.load();
  const el = $('page-ingresos');
  if (!el) return;

  const rubros = d.rubros_ing || [];
  let rows = '';
  let totalIni = 0, totalDef = 0;

  rubros.forEach((r, idx) => {
    const nivel = getNivel(r.cod);
    const esGrupo = !!r.esGrupo;
    const ini = esGrupo ? sumarIniHojas(rubros, r.cod) : (Number(r.ini)||0);
    const def = esGrupo ? sumarHojasIng(d, r.cod, cod => getPresupDefIng(d, cod)) : getPresupDefIng(d, r.cod);
    const mods = def - ini;
    const label = GRUPO_LABELS[r.cod] || r.con;

    if (esGrupo && nivel <= 2){
      rows += `<tr class="${nivel===1?'gtot':'gh'}">
        <td>${r.cod}</td><td colspan="2">${label}</td>
        <td class="num">${fmt(ini)}</td><td class="num">${fmt(mods)}</td>
        <td class="num">${fmt(def)}</td><td></td></tr>`;
    } else if (esGrupo){
      rows += `<tr class="sub"><td>${r.cod}</td><td colspan="2">${label}</td>
        <td class="num">${fmt(ini)}</td><td class="num">${fmt(mods)}</td>
        <td class="num">${fmt(def)}</td><td></td></tr>`;
    } else {
      rows += `<tr>
        <td>${r.cod}</td><td>${r.guia||''}</td><td>${r.con}${r.en_banco?' <i class="bi bi-bank text-success" title="Recaudo en banco"></i>':''}</td>
        <td class="num"><input class="inp" type="number" value="${r.ini||0}" min="0" data-iidx="${idx}"></td>
        <td class="num">${fmt(mods)}</td>
        <td class="num fw-bold">${fmt(def)}</td>
        <td class="ctr">
          <button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalRubroIng(${idx})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarRubroIng(${idx})"><i class="bi bi-trash"></i></button>
        </td></tr>`;
      totalIni += Number(r.ini)||0;
      totalDef += def;
    }
  });

  // Totales
  let gTotalIni=0, gTotalDef=0;
  rubros.filter(r => getNivel(r.cod)===1).forEach(r => {
    gTotalIni += sumarIniHojas(rubros, r.cod);
    gTotalDef += sumarHojasIng(d, r.cod, cod => getPresupDefIng(d, cod));
  });
  if (rubros.filter(r=>getNivel(r.cod)===1).length === 0){
    gTotalIni = totalIni; gTotalDef = totalDef;
  }

  // Tabla de ingresos registrados
  let ingRows = '';
  (d.ingresos||[]).sort((a,b) => (a.fecha||'').localeCompare(b.fecha||'')).forEach(i => {
    const fuente = rubros.find(r=>r.cod===i.cod_fuente);
    ingRows += `<tr>
      <td>${i.fecha||''}</td>
      <td>T${i.trim}</td>
      <td>${i.cod_fuente}</td>
      <td>${fuente?fuente.con:''}</td>
      <td>${i.concepto||''}</td>
      <td class="ctr"><span class="badge ${i.naturaleza==='adicion'?'bg-success':'bg-warning text-dark'}">${i.naturaleza||'adicion'}</span></td>
      <td class="num">${fmt(i.valor)}</td>
      <td class="ctr">
        <button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalIngreso(${i.trim},'${i.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarIngreso('${i.id}')"><i class="bi bi-trash"></i></button>
      </td></tr>`;
  });

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cash-coin me-2" style="color:var(--verde)"></i>Hoja de Ingresos</h5>
      <div class="d-flex gap-1">
        <button class="btn btn-outline-secondary btn-sm" onclick="imprimirHojaIngresos()"><i class="bi bi-printer me-1"></i>Imprimir</button>
        <button class="btn btn-success btn-sm" onclick="abrirModalRubroIng()"><i class="bi bi-plus-lg me-1"></i>Nueva Fuente</button>
        <button class="btn btn-primary btn-sm" onclick="guardarPresupIng()"><i class="bi bi-save me-1"></i>Guardar Apropiaciones</button>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-header ch-verde py-1"><i class="bi bi-table me-1"></i>Presupuesto de Ingresos</div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="tg">
            <thead><tr><th>Código</th><th>Guía</th><th>Concepto</th><th>Aprop. Inicial</th><th>Modificaciones</th><th>Presup. Definitivo</th><th>Acc.</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr class="gtot"><td colspan="3" class="text-end fw-bold">TOTAL GENERAL INGRESOS</td>
              <td class="num fw-bold">${fmt(gTotalIni)}</td><td class="num fw-bold">${fmt(gTotalDef-gTotalIni)}</td>
              <td class="num fw-bold">${fmt(gTotalDef)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
    </div>

    ${(d.ingresos||[]).length > 0 ? `
    <div class="card">
      <div class="card-header ch-verde py-1"><i class="bi bi-list-check me-1"></i>Ingresos Registrados (${d.ingresos.length})</div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="tg">
            <thead><tr><th>Fecha</th><th>Trim.</th><th>Código</th><th>Fuente</th><th>Concepto</th><th>Nat.</th><th>Valor</th><th>Acc.</th></tr></thead>
            <tbody>${ingRows}</tbody>
          </table>
        </div>
      </div>
    </div>` : ''}`;
};
