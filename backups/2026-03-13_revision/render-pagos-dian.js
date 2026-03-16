/* ══════════════════════════════════════════════════════════
   render-pagos-dian.js  ·  Listado de Pagos DIAN / Impuestos
   ══════════════════════════════════════════════════════════ */

R.pagosDian = function(){
  const el = $('page-pagos-dian');
  if (!el) return;

  const d  = DB.load();
  const pagos = d.pagos_dian || [];

  // Ordenar por fecha descendente, luego por num_egreso
  const sorted = [...pagos].sort((a,b) => {
    const fa = a.fecha || '', fb = b.fecha || '';
    if (fa !== fb) return fb.localeCompare(fa);
    return (b.num_egreso||'').localeCompare(a.num_egreso||'');
  });

  let total = 0;
  let rows  = '';
  sorted.forEach(p => {
    const v = Number(p.valor) || 0;
    total += v;
    const fechaFmt = p.fecha ? p.fecha.split('-').reverse().join('/') : '';
    rows += `<tr class="pago-dian-row" ondblclick="abrirModalPagoDian('${p.id}')">
      <td class="ctr">${p.num_egreso||'—'}</td>
      <td class="ctr">${fechaFmt}</td>
      <td>${p.concepto||''}</td>
      <td>${p.periodo||''}</td>
      <td class="text-end">$ ${fmt(v)}</td>
      <td>${p.beneficiario||''}</td>
      <td class="ctr" style="white-space:nowrap">
        <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="abrirModalPagoDian('${p.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarPagoDian('${p.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
        <button class="btn btn-sm btn-outline-success py-0 px-1" onclick="generarDocumentoDian('${p.id}')" title="Imprimir Comprobante"><i class="bi bi-printer"></i></button>
      </td></tr>`;
  });

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cash-coin me-2" style="color:var(--azul)"></i>Pagos DIAN / Impuestos (${pagos.length})</h5>
      <button class="btn btn-primary btn-sm" onclick="abrirModalPagoDian()"><i class="bi bi-plus-circle me-1"></i>Nuevo Pago</button>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${pagos.length ? `<div class="table-responsive"><table class="tg">
          <thead><tr>
            <th class="ctr" style="width:80px">N° Egreso</th>
            <th class="ctr" style="width:95px">Fecha</th>
            <th>Concepto</th>
            <th>Período</th>
            <th class="text-end" style="width:130px">Valor</th>
            <th>Beneficiario</th>
            <th class="ctr" style="width:110px">Acciones</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="font-weight:bold;background:#f0f0f0">
              <td colspan="4" class="text-end">TOTAL:</td>
              <td class="text-end">$ ${fmt(total)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table></div>` : '<p class="text-muted text-center py-4"><i class="bi bi-inbox me-1"></i>Sin pagos registrados. Haga clic en "Nuevo Pago" para agregar uno.</p>'}
      </div>
    </div>`;
};
