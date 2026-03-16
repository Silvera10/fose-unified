/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Dashboard Renderer
══════════════════════════════════════════════════════════ */

const R = window.R || {};
// Almacenar instancias de Chart.js para destruirlas antes de recrear
R._charts = R._charts || {};

R.dash = function(){
  const d = DB.load();
  const c = d.config;
  const el = $('page-dash');
  if (!el) return;

  // Totales presupuestales
  let totalDef = 0, totalEjec = 0;
  let totalDefIng = 0;

  d.rubros.filter(r => !r.esGrupo).forEach(r => {
    totalDef += getPresupDef(d, r.cod);
    for (let t=1; t<=4; t++) totalEjec += getGastos(d, r.cod, t);
  });

  let totalRecIng = 0;
  (d.rubros_ing||[]).filter(r => !r.esGrupo).forEach(r => {
    totalDefIng += getPresupDefIng(d, r.cod);
    totalRecIng += getRecaudoEfectivoIng(d, r.cod, 0);
  });

  const pctEjec = totalDef > 0 ? Math.round(totalEjec/totalDef*100) : 0;
  const saldo = totalDef - totalEjec;

  // ═══ Verificar balance: Ingresos vs Egresos ═══
  const diffPresup = totalDefIng - totalDef;
  const presupCuadra = Math.abs(diffPresup) < 1;
  let alertaBalance = '';
  if(!presupCuadra && (totalDefIng > 0 || totalDef > 0)){
    const esExceso = diffPresup < 0;
    alertaBalance = `
    <div class="alert ${esExceso ? 'alert-danger' : 'alert-warning'} py-2 px-3 mb-3 d-flex align-items-center" style="border-radius:8px;border-left:5px solid ${esExceso ? '#dc3545' : '#ffc107'}">
      <div style="font-size:28px;margin-right:12px"><i class="bi ${esExceso ? 'bi-exclamation-triangle-fill text-danger' : 'bi-info-circle-fill text-warning'}"></i></div>
      <div>
        <div class="fw-bold" style="font-size:13px">${esExceso ? '⛔ ¡PRESUPUESTO DESCUADRADO!' : '⚠️ PRESUPUESTO DESBALANCEADO'}</div>
        <div style="font-size:12px">
          <strong>Ingresos:</strong> $ ${fmt(totalDefIng)} &nbsp;|&nbsp;
          <strong>Egresos:</strong> $ ${fmt(totalDef)} &nbsp;|&nbsp;
          <strong>Diferencia:</strong> <span style="color:${esExceso ? '#dc3545' : '#e65100'};font-weight:700">$ ${fmt(Math.abs(diffPresup))}</span>
          ${esExceso ? ' <em>(Los egresos superan los ingresos)</em>' : ' <em>(Los ingresos superan los egresos)</em>'}
        </div>
        <div style="font-size:11px;margin-top:4px"><i class="bi bi-arrow-right-circle me-1"></i>
          ${esExceso
            ? 'Debe <strong>reducir egresos</strong> o <strong>aumentar ingresos</strong> mediante un acuerdo de modificación presupuestal.'
            : 'Debe <strong>asignar</strong> el excedente de ingresos a rubros de egreso para que el presupuesto quede equilibrado.'}
        </div>
      </div>
    </div>`;
  } else if(presupCuadra && totalDefIng > 0){
    alertaBalance = `
    <div class="alert alert-success py-2 px-3 mb-3 d-flex align-items-center" style="border-radius:8px;border-left:5px solid #198754">
      <i class="bi bi-check-circle-fill text-success me-2" style="font-size:20px"></i>
      <span style="font-size:12px"><strong>✅ Presupuesto equilibrado:</strong> Ingresos = Egresos = <strong>$ ${fmt(totalDefIng)}</strong></span>
    </div>`;
  }

  // Contratos detallados
  const nContratos = (d.contratos_full||[]).length;
  const valContratos = (d.contratos_full||[]).reduce((s,c) => s + (Number(c.valor)||0), 0);

  // ═══ Alertas de vencimiento de contratos ═══
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const _diasEntre = (f1,f2) => Math.ceil((f2-f1)/(1000*60*60*24));
  let alertasVenc = '';
  const contratosActivos = (d.contratos_full||[]).filter(ct =>
    ct.fecha_fin && (ct.estado||'').toLowerCase() !== 'liquidado'
  );
  const proximosVencer = contratosActivos.map(ct => {
    const ff = new Date(ct.fecha_fin + 'T12:00:00');
    const dias = _diasEntre(hoy, ff);
    return { ...ct, diasRestantes: dias };
  }).filter(ct => ct.diasRestantes <= 30)
    .sort((a,b) => a.diasRestantes - b.diasRestantes);

  if(proximosVencer.length > 0){
    let filas = proximosVencer.map(ct => {
      let badge, color;
      if(ct.diasRestantes < 0){
        badge = `<span class="badge bg-danger">VENCIDO hace ${Math.abs(ct.diasRestantes)} días</span>`;
        color = '#ffebee';
      } else if(ct.diasRestantes <= 7){
        badge = `<span class="badge bg-danger">${ct.diasRestantes} días</span>`;
        color = '#fff3e0';
      } else if(ct.diasRestantes <= 15){
        badge = `<span class="badge bg-warning text-dark">${ct.diasRestantes} días</span>`;
        color = '#fffde7';
      } else {
        badge = `<span class="badge bg-info text-dark">${ct.diasRestantes} días</span>`;
        color = '#f5f5f5';
      }
      return `<tr style="background:${color}">
        <td class="small">${ct.numero||'S/N'}</td>
        <td class="small" style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ct.contratista_nombre||ct.objeto||''}</td>
        <td class="small">${ct.fecha_fin||''}</td>
        <td class="small text-center">${badge}</td>
      </tr>`;
    }).join('');
    const vencidos = proximosVencer.filter(ct=>ct.diasRestantes<0).length;
    const iconAlerta = vencidos > 0 ? 'bi-exclamation-triangle-fill text-danger' : 'bi-clock-history text-warning';
    alertasVenc = `
    <div class="card mb-3" style="border-left:4px solid ${vencidos>0?'#dc3545':'#ffc107'}">
      <div class="card-header py-1" style="background:${vencidos>0?'#dc3545':'#ff9800'};color:#fff;font-size:12px">
        <i class="bi ${iconAlerta} me-1"></i>
        Contratos Próximos a Vencer (${proximosVencer.length})
        ${vencidos>0?'<span class="badge bg-light text-danger ms-2">'+vencidos+' vencido(s)</span>':''}
      </div>
      <div class="card-body p-0">
        <table class="table table-sm mb-0" style="font-size:11px">
          <thead><tr style="background:#f8f9fa"><th>N° Contrato</th><th>Contratista / Objeto</th><th>Fecha Fin</th><th class="text-center">Tiempo</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>`;
  }

  // KPIs por trimestre
  let trimHtml = '';
  const tColors = ['#1a7a3a','#0056a6','#c8960c','#8b0000'];
  const tNames = ['T1 Ene-Mar','T2 Abr-Jun','T3 Jul-Sep','T4 Oct-Dic'];
  for (let t=1; t<=4; t++){
    let pd=0, gst=0;
    d.rubros.filter(r=>!r.esGrupo).forEach(r => {
      pd  += getPresupDisp(d, r.cod, t);
      gst += getGastos(d, r.cod, t);
    });
    const pct = pd>0 ? Math.round(gst/pd*100) : 0;
    trimHtml += `<div class="col-md-3">
      <div class="card">
        <div class="card-body p-2">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small fw-bold" style="color:${tColors[t-1]}">${tNames[t-1]}</span>
            <span class="badge" style="background:${tColors[t-1]};font-size:10px">${pct}%</span>
          </div>
          <div class="pbar"><div class="pbar-f" style="width:${Math.min(pct,100)}%;background:${tColors[t-1]}"></div></div>
          <div class="d-flex justify-content-between mt-1" style="font-size:10px">
            <span class="text-muted">Disp: ${fmt(pd)}</span>
            <span>Ejec: ${fmt(gst)}</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  el.innerHTML = `
    <h5 class="mb-3"><i class="bi bi-speedometer2 me-2" style="color:var(--dorado)"></i>Dashboard — ${c.institucion||'Sin nombre'} <span class="badge bg-warning text-dark ms-2" style="font-size:11px">Vigencia ${c.vigencia||''}</span></h5>

    <!-- Alerta de balance presupuestal -->
    ${alertaBalance}

    <!-- Alertas de vencimiento -->
    ${alertasVenc}

    <!-- KPIs principales -->
    <div class="row g-2 mb-3">
      <div class="col-md-3"><div class="card kpi p-2">
        <div class="kv">${fmt(totalDef)}</div><div class="kl">Presupuesto Definitivo Egresos</div></div></div>
      <div class="col-md-3"><div class="card kpi e p-2">
        <div class="kv">${fmt(totalEjec)}</div><div class="kl">Total Ejecutado</div>
        <div class="pbar mt-1"><div class="pbar-f" style="width:${Math.min(pctEjec,100)}%;background:var(--verde)"></div></div>
        <div class="text-end small text-muted">${pctEjec}%</div></div></div>
      <div class="col-md-3"><div class="card kpi p p-2">
        <div class="kv">${fmt(saldo)}</div><div class="kl">Saldo Disponible</div></div></div>
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:var(--verde)">
        <div class="kv" style="color:var(--verde)">${fmt(totalDefIng)}</div><div class="kl">Presupuesto Definitivo Ingresos</div></div></div>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:#198754">
        <div class="kv" style="color:#198754">${fmt(totalRecIng)}</div><div class="kl">Total Recaudado Ingresos</div>
        <div class="pbar mt-1"><div class="pbar-f" style="width:${Math.min(totalDefIng>0?Math.round(totalRecIng/totalDefIng*100):0,100)}%;background:#198754"></div></div>
        <div class="text-end small text-muted">${totalDefIng>0?Math.round(totalRecIng/totalDefIng*100):0}%</div></div></div>
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:#6f42c1">
        <div class="kv" style="color:#6f42c1">${nContratos}</div><div class="kl">Contratos Registrados</div></div></div>
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:#6f42c1">
        <div class="kv" style="color:#6f42c1">${fmt(valContratos)}</div><div class="kl">Valor Total Contratos</div></div></div>
    </div>

    <!-- Ejecución trimestral -->
    <h6 class="mb-2"><i class="bi bi-bar-chart-line me-2"></i>Ejecución por Trimestre</h6>
    <div class="row g-2 mb-3">${trimHtml}</div>

    <!-- Gráfico -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card"><div class="card-header ch-azul py-1"><i class="bi bi-pie-chart me-1"></i>Distribución Presupuestal</div>
        <div class="card-body p-2"><canvas id="chart-dist" height="200"></canvas></div></div>
      </div>
      <div class="col-md-6">
        <div class="card"><div class="card-header ch-verde py-1"><i class="bi bi-bar-chart me-1"></i>Ejecución Trimestral</div>
        <div class="card-body p-2"><canvas id="chart-trim" height="200"></canvas></div></div>
      </div>
    </div>`;

  // Renderizar gráficos
  _renderCharts(d);
};

function _renderCharts(d){
  // Gráfico de distribución por tipo
  const tipos = {};
  d.rubros.filter(r => !r.esGrupo).forEach(r => {
    const tipo = r.tipo === 'inv' ? 'Inversión' : 'Funcionamiento';
    tipos[tipo] = (tipos[tipo]||0) + getPresupDef(d, r.cod);
  });

  const ctxDist = document.getElementById('chart-dist');
  if (ctxDist){
    if(R._charts.dist) R._charts.dist.destroy();
    R._charts.dist = new Chart(ctxDist, {
      type:'doughnut',
      data:{
        labels: Object.keys(tipos),
        datasets:[{data: Object.values(tipos), backgroundColor:['#0056a6','#c8960c','#1a7a3a','#fd7e14']}]
      },
      options:{responsive:true, plugins:{legend:{position:'bottom',labels:{font:{size:11}}}}}
    });
  }

  // Gráfico de ejecución trimestral
  const trimData = {disp:[], ejec:[]};
  for (let t=1; t<=4; t++){
    let pd=0, gst=0;
    d.rubros.filter(r=>!r.esGrupo).forEach(r => {
      pd += getPresupDisp(d, r.cod, t);
      gst += getGastos(d, r.cod, t);
    });
    trimData.disp.push(pd);
    trimData.ejec.push(gst);
  }

  const ctxTrim = document.getElementById('chart-trim');
  if (ctxTrim){
    if(R._charts.trim) R._charts.trim.destroy();
    R._charts.trim = new Chart(ctxTrim, {
      type:'bar',
      data:{
        labels:['T1','T2','T3','T4'],
        datasets:[
          {label:'Disponible',data:trimData.disp,backgroundColor:'rgba(0,86,166,.3)',borderColor:'#0056a6',borderWidth:1},
          {label:'Ejecutado',data:trimData.ejec,backgroundColor:'rgba(26,122,58,.6)',borderColor:'#1a7a3a',borderWidth:1}
        ]
      },
      options:{responsive:true, scales:{y:{beginAtZero:true,ticks:{callback:v=>fmt(v)}}},
        plugins:{legend:{position:'bottom',labels:{font:{size:11}}}}}
    });
  }
}
