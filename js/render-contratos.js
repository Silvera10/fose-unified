/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Módulo de Contratos (render)
══════════════════════════════════════════════════════════ */

R.contratos = function(){
  const d = DB.load();
  const el = $('page-contratos');
  if (!el) return;

  const contratos = d.contratos_full || [];
  const estadoClases = {
    'En elaboracion':'estado-elaboracion','Firmado':'estado-firmado',
    'En ejecucion':'estado-ejecucion','Ejecutado':'estado-ejecutado','Liquidado':'estado-liquidado'
  };

  // Estadísticas
  const stats = {};
  let totalVal = 0;
  contratos.forEach(c => {
    const est = c.estado || 'En ejecucion';
    stats[est] = (stats[est]||0) + 1;
    totalVal += Number(c.valor)||0;
  });

  // KPIs
  let kpis = `<div class="row g-2 mb-3">
    <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:#6f42c1">
      <div class="kv" style="color:#6f42c1">${contratos.length}</div><div class="kl">Total Contratos</div></div></div>
    <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:var(--dorado)">
      <div class="kv" style="color:var(--dorado)">${fmt(totalVal)}</div><div class="kl">Valor Total</div></div></div>
    <div class="col-md-3"><div class="card kpi e p-2">
      <div class="kv">${stats['En ejecucion']||0}</div><div class="kl">En Ejecución</div></div></div>
    <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:#6c757d">
      <div class="kv" style="color:#6c757d">${stats['Liquidado']||0}</div><div class="kl">Liquidados</div></div></div>
  </div>`;

  // Listado
  let cards = '';
  if (contratos.length === 0){
    cards = '<p class="text-muted text-center py-4">No hay contratos registrados. Use el botón "Nuevo Contrato" para crear uno.</p>';
  } else {
    contratos.sort((a,b) => (b.fecha_inicio||'').localeCompare(a.fecha_inicio||'')).forEach(c => {
      const est = c.estado || 'En ejecucion';
      const id = c.id;
      const _fx = typeof _fixAnio === 'function' ? _fixAnio : (f=>f);
      const diasBadge = typeof _calcDiasRestantes === 'function' ? _calcDiasRestantes(c.fecha_fin) : '';
      cards += `<div class="card contrato-card mb-2">
        <div class="card-body p-2">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <span class="fw-bold" style="font-size:13px;color:var(--azul)">Contrato N° ${c.numero||'S/N'}</span>
              <span class="estado-badge ${estadoClases[est]||''} ms-2">${est}</span>${diasBadge}
              <div class="text-muted mt-1" style="font-size:11px">
                <strong>Tipo:</strong> ${c.tipo||''} | <strong>Modalidad:</strong> ${c.modalidad||''}
              </div>
              <div style="font-size:11px;max-width:600px" class="mt-1">${c.objeto||''}</div>
              <div class="text-muted mt-1" style="font-size:10px">
                <i class="bi bi-person me-1"></i>${c.contratista_nombre||'—'}
                <span class="ms-2"><i class="bi bi-calendar me-1"></i>${_fx(c.fecha_inicio)||'—'} a ${_fx(c.fecha_fin)||'—'}</span>
                ${c.cdp?`<span class="ms-2">CDP: ${c.cdp}</span>`:''}
                ${c.rp?`<span class="ms-2">RP: ${c.rp}</span>`:''}
                ${(c.items||[]).length?`<span class="ms-2"><i class="bi bi-box-seam me-1"></i>UNSPSC: ${c.items.map(i=>i.codigo).join(' : ')}</span>`:''}
              </div>
              ${(function(){
                const pagos = c.pagos || [];
                if(pagos.length <= 1) return '';
                const totalPagado = pagos.filter(p=>p.fecha_pago).reduce((s,p)=>s+(Number(p.valor)||0),0);
                const valorC = Number(c.valor)||0;
                const pct = valorC > 0 ? Math.round(totalPagado / valorC * 100) : 0;
                const pagosConFecha = pagos.filter(p=>p.fecha_pago).length;
                return '<div class="mt-1" style="font-size:10px">' +
                  '<i class="bi bi-cash-coin text-success me-1"></i>' +
                  '<strong>Pagos:</strong> ' + pagosConFecha + '/' + pagos.length +
                  ' <span class="text-muted">(' + (c.forma_pago||'') + ')</span>' +
                  ' — Pagado: $' + fmt(totalPagado) + ' de $' + fmt(valorC) +
                  ' <span class="ms-1">' +
                  '<div class="progress d-inline-flex" style="width:80px;height:6px;vertical-align:middle">' +
                  '<div class="progress-bar bg-success" style="width:' + pct + '%"></div></div>' +
                  ' ' + pct + '%</span></div>';
              })()}
              <!-- Botón de documentos -->
              <div class="mt-2">
                <button class="btn btn-outline-dark py-0 px-2" style="font-size:10px" onclick="abrirPanelDocumentos('${id}')" title="Ver los 24 documentos del expediente">
                  <i class="bi bi-grid me-1"></i>Documentos (24)</button>
              </div>
            </div>
            <div class="text-end">
              <div class="fw-bold" style="color:var(--dorado)">${fmt(c.valor)}</div>
              <div class="mt-1 d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="abrirModalContrato('${id}')" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarContrato('${id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    });
  }

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-file-earmark-text me-2" style="color:var(--azul2)"></i>Gestión de Contratos</h5>
      <button class="btn btn-primary btn-sm" onclick="abrirModalContrato()"><i class="bi bi-plus-lg me-1"></i>Nuevo Contrato</button>
    </div>
    ${kpis}
    ${cards}`;
};
