/* ══════════════════════════════════════════════════════════
   render-acuerdos.js · Listado de Acuerdos Presupuestales
   ══════════════════════════════════════════════════════════ */

R.acuerdos = function(){
  const el = $('page-acuerdos');
  if (!el) return;

  const d = DB.load();
  const acuerdos = d.acuerdos || [];

  // Ordenar por fecha descendente
  const sorted = [...acuerdos].sort((a,b) => (b.fecha||'').localeCompare(a.fecha||''));

  const tipoLabel = {adicion:'Adición', reduccion:'Reducción', traslado:'Traslado'};
  const tipoColor = {adicion:'#1a7a3a', reduccion:'#c8960c', traslado:'#0056a6'};
  const tipoIcon  = {adicion:'bi-plus-circle-fill', reduccion:'bi-dash-circle-fill', traslado:'bi-arrow-left-right'};
  const tipoBg    = {adicion:'#e8f5e9', reduccion:'#fff8e1', traslado:'#e3f2fd'};

  let totAdi=0, totRed=0, totTras=0;
  let rows = '';

  sorted.forEach(ac => {
    const totalAc = Number(ac.total_eg)||Number(ac.total_ing)||Number(ac.total_cre)||0;
    const tipo = ac.tipo || 'adicion';
    if(tipo==='adicion') totAdi += totalAc;
    else if(tipo==='reduccion') totRed += totalAc;
    else totTras += totalAc;

    const fechaFmt = ac.fecha ? ac.fecha.split('-').reverse().join('/') : '';
    const trimNom = {1:'T1',2:'T2',3:'T3',4:'T4'};

    rows += `<tr style="border-left:4px solid ${tipoColor[tipo]}">
      <td class="ctr fw-bold">${ac.numero||'—'}</td>
      <td class="ctr">
        <span class="badge" style="background:${tipoColor[tipo]};font-size:10px">
          <i class="bi ${tipoIcon[tipo]} me-1"></i>${tipoLabel[tipo]||tipo}
        </span>
      </td>
      <td class="ctr">${fechaFmt}</td>
      <td class="ctr"><span class="badge bg-secondary" style="font-size:10px">${trimNom[ac.trim]||'—'}</span></td>
      <td>${ac.concepto||''}</td>
      <td class="text-end fw-bold" style="color:${tipoColor[tipo]}">$ ${fmt(totalAc)}</td>
      <td class="ctr" style="white-space:nowrap">
        <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="abrirModalAcuerdoPres('${ac.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarAcuerdoPres('${ac.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
        <button class="btn btn-sm btn-outline-success py-0 px-1" onclick="generarDocAcuerdoPres('${ac.id}')" title="Generar Documento"><i class="bi bi-file-earmark-text"></i></button>
        <button class="btn btn-sm btn-outline-dark py-0 px-1" onclick="imprimirDocAcuerdoPres('${ac.id}')" title="Imprimir"><i class="bi bi-printer"></i></button>
        <button class="btn btn-sm btn-outline-info py-0 px-1" onclick="exportarAcuerdoWord('${ac.id}')" title="Exportar a Word"><i class="bi bi-file-earmark-word"></i></button>
      </td></tr>`;
  });

  // KPIs resumen
  const kpis = `<div class="row g-2 mb-3">
    <div class="col-md-3">
      <div class="card" style="border-left:4px solid #1a7a3a">
        <div class="card-body py-2 px-3">
          <div class="text-muted small">Total Adiciones</div>
          <div class="fw-bold" style="color:#1a7a3a;font-size:16px">$ ${fmt(totAdi)}</div>
          <div class="text-muted" style="font-size:10px">${sorted.filter(a=>a.tipo==='adicion').length} acuerdo(s)</div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card" style="border-left:4px solid #c8960c">
        <div class="card-body py-2 px-3">
          <div class="text-muted small">Total Reducciones</div>
          <div class="fw-bold" style="color:#c8960c;font-size:16px">$ ${fmt(totRed)}</div>
          <div class="text-muted" style="font-size:10px">${sorted.filter(a=>a.tipo==='reduccion').length} acuerdo(s)</div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card" style="border-left:4px solid #0056a6">
        <div class="card-body py-2 px-3">
          <div class="text-muted small">Total Traslados</div>
          <div class="fw-bold" style="color:#0056a6;font-size:16px">$ ${fmt(totTras)}</div>
          <div class="text-muted" style="font-size:10px">${sorted.filter(a=>a.tipo==='traslado').length} acuerdo(s)</div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card" style="border-left:4px solid #6c757d">
        <div class="card-body py-2 px-3">
          <div class="text-muted small">Total Acuerdos</div>
          <div class="fw-bold" style="color:#6c757d;font-size:16px">${acuerdos.length}</div>
          <div class="text-muted" style="font-size:10px">Vigencia ${d.config.vigencia||new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  </div>`;

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-clipboard-check me-2" style="color:#1a7a3a"></i>Acuerdos Presupuestales (${acuerdos.length})</h5>
      <button class="btn btn-success btn-sm" onclick="abrirModalAcuerdoPres()"><i class="bi bi-plus-circle me-1"></i>Nuevo Acuerdo</button>
    </div>
    ${kpis}
    <div class="card">
      <div class="card-body p-0">
        ${acuerdos.length ? `<div class="table-responsive"><table class="tg">
          <thead><tr>
            <th class="ctr" style="width:90px">N° Acuerdo</th>
            <th class="ctr" style="width:100px">Tipo</th>
            <th class="ctr" style="width:95px">Fecha</th>
            <th class="ctr" style="width:50px">Trim.</th>
            <th>Concepto</th>
            <th class="text-end" style="width:140px">Valor Total</th>
            <th class="ctr" style="width:140px">Acciones</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>` : `<div class="text-center py-5">
          <i class="bi bi-clipboard-x text-muted" style="font-size:3rem"></i>
          <p class="text-muted mt-2">Sin acuerdos presupuestales registrados.<br>
          Haga clic en <strong>"Nuevo Acuerdo"</strong> para crear una adición, reducción o traslado.</p>
        </div>`}
      </div>
    </div>`;
};
