/* ══════════════════════════════════════════════════════════
   RENDER — Cuentas por Pagar (Vigencias Anteriores)
   Pagos de obligaciones de años anteriores que NO afectan
   el presupuesto de la vigencia actual.
══════════════════════════════════════════════════════════ */

R.cuentasPagar = function(){
  const el = $('page-cuentas-pagar');
  if(!el) return;
  const d = DB.load();
  const lista = (d.cuentas_por_pagar || []).slice().sort((a,b) => (b.fecha||'').localeCompare(a.fecha||''));

  let totalBruto = 0, totalRet = 0, totalNeto = 0;
  lista.forEach(p => {
    totalBruto += Number(p.valor)||0;
    totalRet += Number(p.retencion)||0;
    totalNeto += Number(p.neto)||0;
  });

  // KPIs
  const kpis = `
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <div class="card text-center" style="border-left:4px solid #6c757d">
          <div class="card-body py-2">
            <div class="small text-muted">Total Registros</div>
            <div class="fw-bold" style="font-size:18px">${lista.length}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center" style="border-left:4px solid #0d6efd">
          <div class="card-body py-2">
            <div class="small text-muted">Total Bruto</div>
            <div class="fw-bold text-primary" style="font-size:16px">$ ${fmt(totalBruto)}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center" style="border-left:4px solid #dc3545">
          <div class="card-body py-2">
            <div class="small text-muted">Total Retención</div>
            <div class="fw-bold text-danger" style="font-size:16px">$ ${fmt(totalRet)}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center" style="border-left:4px solid #198754">
          <div class="card-body py-2">
            <div class="small text-muted">Total Neto Pagado</div>
            <div class="fw-bold text-success" style="font-size:16px">$ ${fmt(totalNeto)}</div>
          </div>
        </div>
      </div>
    </div>`;

  // Tabla
  let filas = '';
  if(lista.length === 0){
    filas = '<tr><td colspan="9" class="text-center text-muted py-3">Sin cuentas por pagar registradas</td></tr>';
  } else {
    lista.forEach((p, i) => {
      filas += `<tr>
        <td class="ctr">${i+1}</td>
        <td><strong>${p.num_egreso||'—'}</strong></td>
        <td>${p.fecha||'—'}</td>
        <td>${p.vigencia_anterior||'—'}</td>
        <td><code style="font-size:10px">${p.contrato_ref||'—'}</code></td>
        <td>${p.beneficiario||'—'}<br><small class="text-muted">${p.nit||''}</small></td>
        <td class="num">${fmt(p.valor||0)}</td>
        <td class="num">${fmt(p.neto||0)}</td>
        <td class="ctr">
          <button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalCuentaPagar('${p.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarCuentaPagar('${p.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
          <button class="btn btn-sm btn-outline-dark py-0 px-1" onclick="imprimirCxP('${p.id}')" title="Comp. Egreso"><i class="bi bi-printer"></i></button>
        </td>
      </tr>`;
    });
  }

  el.innerHTML = `
    <h5 class="mb-3"><i class="bi bi-clock-history me-2"></i>Cuentas por Pagar — Vigencias Anteriores
      <small class="text-muted">(${lista.length})</small>
      <button class="btn btn-success btn-sm float-end" onclick="abrirModalCuentaPagar()">
        <i class="bi bi-plus-circle me-1"></i>Nuevo Pago</button>
    </h5>
    <div class="alert alert-secondary py-2" style="font-size:11px">
      <i class="bi bi-info-circle me-1"></i>
      Registre aquí los pagos de obligaciones de vigencias anteriores. Estos pagos <strong>NO afectan</strong>
      el presupuesto de la vigencia actual — solo generan el consecutivo de egreso y el comprobante.
    </div>
    ${kpis}
    <div class="table-responsive">
      <table class="table table-sm table-bordered table-hover mb-0" style="font-size:11px">
        <thead class="table-dark">
          <tr>
            <th>#</th><th>N° Egreso</th><th>Fecha</th><th>Vig.</th><th>Contrato Ref.</th>
            <th>Beneficiario</th><th>Valor</th><th>Neto</th><th>Acc.</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
        ${lista.length ? `<tfoot class="table-secondary">
          <tr class="fw-bold">
            <td colspan="6" class="text-end">TOTALES:</td>
            <td class="num">${fmt(totalBruto)}</td>
            <td class="num">${fmt(totalNeto)}</td>
            <td></td>
          </tr>
        </tfoot>` : ''}
      </table>
    </div>`;
};
