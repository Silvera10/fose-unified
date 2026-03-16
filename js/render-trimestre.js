/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Vista de Ejecución Trimestral
   Encabezados idénticos al formato oficial FOSE
══════════════════════════════════════════════════════════ */

window._vistaActiva = window._vistaActiva || {};

R.trimestre = function(t){
  const d = DB.load();
  const el = $('page-trim'+t);
  if (!el) return;

  const vistaActual = window._vistaActiva[t] || 'all';
  const tColors = {1:'#1a7a3a',2:'#0056a6',3:'#c8960c',4:'#8b0000'};
  const tNames = {1:'Trimestre 1 — Enero / Febrero / Marzo',2:'Trimestre 2 — Abril / Mayo / Junio',
    3:'Trimestre 3 — Julio / Agosto / Septiembre',4:'Trimestre 4 — Octubre / Noviembre / Diciembre'};
  const meses = MESES_TRIM[t];

  /* ═══════════════════════════════════════════════════════
     A) EJECUCIÓN PRESUPUESTAL DE EGRESOS — Formato oficial
     Cols: Rub.Presup | Guía | Identificación | Presup.Inicial(3) |
           MODIFICACIONES: Adiciones(4) | Reducciones(5) |
           TRASLADOS: Créditos(6) | Contracréditos(7) |
           Presup.Definitivo(8)=3+4-5+6-7 |
           DISPONIBILIDADES: Mes1 | Mes2 | Mes3 | Total Acumulado |
           COMPROMISOS: Acumulado | Total Compr. |
           Saldo Apropiación |
           PAGOS: Del Mes | Acumulados | Por Pagar |
           % Ejec.
  ═══════════════════════════════════════════════════════ */
  let egRows = '';
  let totSI=0,totAdi=0,totRed=0,totCre=0,totCco=0,totPD=0;
  let totCdpM=[0,0,0],totCdpAcum=0,totComp=0,totCompTotal=0,totSaldo=0;
  let totPagPer=0,totPagAcum=0,totPorPagar=0;

  d.rubros.forEach(r => {
    // Si esGrupo pero NO tiene hojas hijas reales, tratar como hoja
    const tieneHijas = !!r.esGrupo && d.rubros.some(h => h.cod.startsWith(r.cod+'.') && !h.esGrupo);
    const esGrupo = !!r.esGrupo && tieneHijas;
    const nivel = getNivel(r.cod);

    if (esGrupo){
      const si = sumarHojasEg(d, r.cod, cod => getSaldoInicial(d, cod, t));
      const m = {
        adi: sumarHojasEg(d, r.cod, cod => getMods(d, cod, t).adi),
        red: sumarHojasEg(d, r.cod, cod => getMods(d, cod, t).red),
        cre: sumarHojasEg(d, r.cod, cod => getMods(d, cod, t).cre),
        cco: sumarHojasEg(d, r.cod, cod => getMods(d, cod, t).cco)
      };
      const pd = sumarHojasEg(d, r.cod, cod => getPresupDisp(d, cod, t));
      // CDPs (Disponibilidades) por mes
      const cdpM = meses.map(mes => sumarHojasEg(d, r.cod, cod => getCdpMes(d, cod, mes)));
      const cdpAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+sumarHojasEg(d,r.cod,cod=>getCdpEgTrim(d,cod,t2)),0) : 0;
      const cdpTrim = sumarHojasEg(d, r.cod, cod => getCdpEgTrim(d, cod, t));
      const cdpTotal = cdpAcumPrev + cdpTrim;
      // Compromisos (RPs)
      const comp = sumarHojasEg(d, r.cod, cod => getCompromisoEgTrim(d, cod, t));
      const compAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+sumarHojasEg(d,r.cod,cod=>getCompromisoEgTrim(d,cod,t2)),0) : 0;
      const compTotal = compAcumPrev + comp;
      // Pagos reales
      const pagTrim = sumarHojasEg(d, r.cod, cod => getGastos(d, cod, t));
      const pagAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+sumarHojasEg(d,r.cod,cod=>getGastos(d,cod,t2)),0) : 0;
      const porPagar = Math.max(0, compTotal - pagTrim - pagAcumPrev);
      const saldo = pd - comp;  // Solo compromisos del trimestre actual (PD ya descuenta anteriores)
      const pct = pd>0 ? (compTotal/pd*100).toFixed(1) : '0.0';
      const cls = nivel<=2 ? (nivel===1?'gtot':'gh') : 'sub';
      const label = GRUPO_LABELS[r.cod] || r.con;

      egRows += `<tr class="${cls}">
        <td>${r.cod}</td><td class="ctr">—</td><td>${label}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${fmt(m.adi)}</td><td class="num">${fmt(m.red)}</td>
        <td class="num">${fmt(m.cre)}</td><td class="num">${fmt(m.cco)}</td>
        <td class="num">${fmt(pd)}</td>
        ${cdpM.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${cdpTotal?fmt(cdpTotal):'—'}</td>
        <td class="num">${compAcumPrev?fmt(compAcumPrev):'—'}</td>
        <td class="num">${compTotal?fmt(compTotal):'—'}</td>
        <td class="num ${saldo<0?'text-danger fw-bold':''}">${fmt(saldo)}</td>
        <td class="num">${pagTrim?fmt(pagTrim):'—'}</td>
        <td class="num">${pagAcumPrev?fmt(pagAcumPrev):'—'}</td>
        <td class="num">${porPagar?fmt(porPagar):'—'}</td>
        <td class="ctr">${pd>0?pct+'%':'—'}</td></tr>`;
    } else {
      const si = getSaldoInicial(d, r.cod, t);
      const m = getMods(d, r.cod, t);
      const pd = getPresupDisp(d, r.cod, t);
      // CDPs (Disponibilidades) por mes
      const cdpM = meses.map(mes => getCdpMes(d, r.cod, mes));
      const cdpAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+getCdpEgTrim(d,r.cod,t2),0) : 0;
      const cdpTrim = getCdpEgTrim(d, r.cod, t);
      const cdpTotal = cdpAcumPrev + cdpTrim;
      // Compromisos (RPs)
      const comp = getCompromisoEgTrim(d, r.cod, t);
      const compAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+getCompromisoEgTrim(d,r.cod,t2),0) : 0;
      const compTotal = compAcumPrev + comp;
      // Pagos reales
      const pagTrim = getGastos(d, r.cod, t);
      const pagAcumPrev = t>1 ? [1,2,3,4].filter(t2=>t2<t).reduce((s,t2)=>s+getGastos(d,r.cod,t2),0) : 0;
      const porPagar = Math.max(0, compTotal - pagTrim - pagAcumPrev);
      const saldo = pd - comp;  // Solo compromisos del trimestre actual (PD ya descuenta anteriores)
      const pct = pd>0 ? (compTotal/pd*100).toFixed(1) : '0.0';

      totSI+=si; totAdi+=m.adi; totRed+=m.red; totCre+=m.cre; totCco+=m.cco;
      totPD+=pd; totCdpM[0]+=cdpM[0]; totCdpM[1]+=cdpM[1]; totCdpM[2]+=cdpM[2];
      totCdpAcum+=cdpTotal; totComp+=compAcumPrev; totCompTotal+=compTotal;
      totSaldo+=saldo; totPagPer+=pagTrim; totPagAcum+=pagAcumPrev; totPorPagar+=porPagar;

      egRows += `<tr>
        <td>${r.cod}</td><td class="ctr">${r.guia||''}</td><td>${r.con}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${m.adi?fmt(m.adi):'—'}</td><td class="num">${m.red?fmt(m.red):'—'}</td>
        <td class="num">${m.cre?fmt(m.cre):'—'}</td><td class="num">${m.cco?fmt(m.cco):'—'}</td>
        <td class="num fw-bold">${fmt(pd)}</td>
        ${cdpM.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${cdpTotal?fmt(cdpTotal):'—'}</td>
        <td class="num">${compAcumPrev?fmt(compAcumPrev):'—'}</td>
        <td class="num">${compTotal?fmt(compTotal):'—'}</td>
        <td class="num ${saldo<0?'text-danger fw-bold':''}">${fmt(saldo)}</td>
        <td class="num">${pagTrim?fmt(pagTrim):'—'}</td>
        <td class="num">${pagAcumPrev?fmt(pagAcumPrev):'—'}</td>
        <td class="num">${porPagar?fmt(porPagar):'—'}</td>
        <td class="ctr">${pd>0?pct+'%':'—'}</td></tr>`;
    }
  });

  const gPctEg = totPD>0 ? (totCompTotal/totPD*100).toFixed(1) : '0.0';

  /* ═══════════════════════════════════════════════════════
     B) EJECUCIÓN PRESUPUESTAL DE INGRESOS — Formato oficial
     Cols: Código Presup. | Guía | Descripción | Presup.Inicial(1) |
           MODIFICACIONES: Adiciones(2) | Reducciones(3) |
           Presup.Definitivo(4)=1+2-3 |
           MOVIMIENTOS MENSUALES: Mes1 | Mes2 | Mes3 |
           Recaudos(5) | Saldo por Recaudar(6)=4-5 | % por Recaudar
  ═══════════════════════════════════════════════════════ */
  let ingRows = '';
  let iTotSI=0,iTotAdi=0,iTotRed=0,iTotCre=0,iTotCco=0,iTotPD=0;
  let iTotM=[0,0,0], iTotRec=0, iTotSaldo=0;

  (d.rubros_ing||[]).forEach(r => {
    const tieneHijasIng = !!r.esGrupo && (d.rubros_ing||[]).some(h => h.cod.startsWith(r.cod+'.') && !h.esGrupo);
    const esGrupo = !!r.esGrupo && tieneHijasIng;
    const nivel = getNivel(r.cod);

    if (esGrupo){
      const si = sumarHojasIng(d, r.cod, cod => getSaldoInicialIng(d, cod, t));
      const adi = sumarHojasIng(d, r.cod, cod => Number(getModsIng(d,cod,t).adi));
      const red = sumarHojasIng(d, r.cod, cod => Number(getModsIng(d,cod,t).red));
      const cre = sumarHojasIng(d, r.cod, cod => Number(getModsIng(d,cod,t).cre));
      const cco = sumarHojasIng(d, r.cod, cod => Number(getModsIng(d,cod,t).cco));
      const pd = sumarHojasIng(d, r.cod, cod => getPresupDispIng(d, cod, t));
      const rm = meses.map(mes => sumarHojasIng(d, r.cod, cod => getRecaudoMesTotal(d, cod, mes)));
      const rec = sumarHojasIng(d, r.cod, cod => getRecaudoEfectivoIng(d, cod, t));
      const saldo = pd - rec;
      const pct = pd>0 ? (rec/pd*100).toFixed(1) : '0.0';
      const cls = nivel<=2 ? (nivel===1?'gtot':'gh') : 'sub';
      const label = GRUPO_LABELS[r.cod] || r.con;

      ingRows += `<tr class="${cls}">
        <td>${r.cod}</td><td class="ctr">—</td><td>${label}</td>
        <td class="num">${si?fmt(si):'—'}</td>
        <td class="num">${adi?fmt(adi):'—'}</td><td class="num">${red?fmt(red):'—'}</td>
        <td class="num">${cre?fmt(cre):'—'}</td><td class="num">${cco?fmt(cco):'—'}</td>
        <td class="num">${pd?fmt(pd):'—'}</td>
        ${rm.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${rec?fmt(rec):'—'}</td>
        <td class="num ${saldo<0?'text-danger fw-bold':''}">${saldo?fmt(saldo):'—'}</td>
        <td class="ctr">${pd>0?pct+'%':'—'}</td></tr>`;
    } else {
      const si = getSaldoInicialIng(d, r.cod, t);
      const mi = getModsIng(d, r.cod, t);
      const adi = Number(mi.adi);
      const red = Number(mi.red);
      const cre = Number(mi.cre);
      const cco = Number(mi.cco);
      const pd = getPresupDispIng(d, r.cod, t);
      const rm = meses.map(mes => getRecaudoMesTotal(d, r.cod, mes));
      const rec = getRecaudoEfectivoIng(d, r.cod, t);
      const saldo = pd - rec;
      const pct = pd>0 ? (rec/pd*100).toFixed(1) : '0.0';

      iTotSI+=si; iTotAdi+=adi; iTotRed+=red; iTotCre+=cre; iTotCco+=cco; iTotPD+=pd;
      iTotM[0]+=rm[0]; iTotM[1]+=rm[1]; iTotM[2]+=rm[2];
      iTotRec+=rec; iTotSaldo+=saldo;

      ingRows += `<tr>
        <td>${r.cod}</td><td class="ctr">${r.guia||''}</td><td>${r.con}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${adi?fmt(adi):'—'}</td><td class="num">${red?fmt(red):'—'}</td>
        <td class="num">${cre?fmt(cre):'—'}</td><td class="num">${cco?fmt(cco):'—'}</td>
        <td class="num fw-bold">${fmt(pd)}</td>
        ${rm.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${rec?fmt(rec):'—'}</td>
        <td class="num ${saldo<0?'text-danger fw-bold':''}">${fmt(saldo)}</td>
        <td class="ctr">${pd>0?pct+'%':'—'}</td></tr>`;
    }
  });

  const gPctIng = iTotPD>0 ? (iTotRec/iTotPD*100).toFixed(1) : '0.0';

  /* ═══════════════════════════════════════════════════════
     C) KPIs
  ═══════════════════════════════════════════════════════ */
  const pctEjec = totPD>0 ? Math.round(totCompTotal/totPD*100) : 0;
  const pctRec  = iTotPD>0 ? Math.round(iTotRec/iTotPD*100) : 0;

  /* ═══════════════════════════════════════════════════════
     D) MODIFICACIONES DE EGRESOS
  ═══════════════════════════════════════════════════════ */
  const modsEg = (d.mods_eg||[]).filter(e => Number(e.trim)===t)
    .sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));
  let modRows = '';
  // IDs de mods que pertenecen a un Acuerdo Presupuestal
  const _acuerdoModIds = new Set();
  (d.acuerdos||[]).forEach(ac => (ac._mod_ids||[]).forEach(mid => _acuerdoModIds.add(mid)));

  modsEg.forEach(e => {
    const tipoLbl = {adicion:'Adición',reduccion:'Reducción',credito:'Crédito',contracredito:'Contracrédito'};
    const tipoCls = {adicion:'bg-success',reduccion:'bg-danger',credito:'bg-info',contracredito:'bg-warning text-dark'};
    const esDeAcuerdo = _acuerdoModIds.has(e.id);
    const accBtns = esDeAcuerdo
      ? `<span class="text-muted small" title="Creada desde Acuerdos Presupuestales — elimine desde allí"><i class="bi bi-lock-fill"></i></span>`
      : `<button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalModEg(${t},'${e.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarModEg('${e.id}')"><i class="bi bi-trash"></i></button>`;
    modRows += `<tr>
      <td>${e.fecha||''}</td><td>${e.acuerdo||''}</td><td>${e.concepto||''}</td>
      <td>${e.cod}</td>
      <td class="ctr"><span class="badge ${tipoCls[e.tipo]||''}" style="font-size:10px">${tipoLbl[e.tipo]||e.tipo}</span></td>
      <td class="num">${fmt(e.valor)}</td>
      <td class="ctr">${accBtns}</td></tr>`;
  });

  /* ═══════════════════════════════════════════════════════
     E) MODIFICACIONES DE INGRESOS
  ═══════════════════════════════════════════════════════ */
  const modsIng = (d.mods_ing_form||[]).filter(e => Number(e.trim)===t)
    .sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));
  let modIngRows = '';
  modsIng.forEach(e => {
    const tipoLbl = {adicion:'Adición',reduccion:'Reducción',credito:'Crédito',contracredito:'Contracrédito'};
    const tipoCls = {adicion:'bg-success',reduccion:'bg-danger',credito:'bg-info',contracredito:'bg-warning text-dark'};
    const esDeAcuerdo = _acuerdoModIds.has(e.id);
    const accBtns = esDeAcuerdo
      ? `<span class="text-muted small" title="Creada desde Acuerdos Presupuestales — elimine desde allí"><i class="bi bi-lock-fill"></i></span>`
      : `<button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalModEg(${t},'${e.id}','ing')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarModIng('${e.id}')"><i class="bi bi-trash"></i></button>`;
    modIngRows += `<tr>
      <td>${e.fecha||''}</td><td>${e.acuerdo||''}</td><td>${e.concepto||''}</td>
      <td>${e.cod}</td>
      <td class="ctr"><span class="badge ${tipoCls[e.tipo]||''}" style="font-size:10px">${tipoLbl[e.tipo]||e.tipo}</span></td>
      <td class="num">${fmt(e.valor)}</td>
      <td class="ctr">${accBtns}</td></tr>`;
  });

  /* ═══════════════════════════════════════════════════════
     F) GASTOS REGISTRADOS
  ═══════════════════════════════════════════════════════ */
  const gastos = (d.contratos||[]).filter(c => Number(c.trim)===t)
    .sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));
  let gasRows = '';
  let gasTotal = 0;
  let gasRetTotal = 0;
  let gasNetoTotal = 0;
  gastos.forEach(c => {
    gasTotal += Number(c.valor)||0;
    const esContrato = c.origen === 'contrato';
    const retVal = Number(c.retencion_valor)||0;
    const netoVal = Number(c.neto_pagar)||0;
    if(esContrato){ gasRetTotal += retVal; gasNetoTotal += netoVal; }

    // Badge de origen
    const badge = esContrato
      ? '<span class="badge bg-primary" style="font-size:8px">Cto</span> '
      : '';

    // Botones diferenciados: contrato → ver contrato; manual → editar/eliminar
    const accBtns = esContrato
      ? `<button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="abrirModalContrato('${c.contrato_full_id}')" title="Editar Contrato"><i class="bi bi-file-text"></i></button>`
      : `<button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalGasto(${t},'${c.id}')"><i class="bi bi-pencil"></i></button>
         <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarGasto('${c.id}',${t})"><i class="bi bi-trash"></i></button>`;

    gasRows += `<tr${esContrato ? ' style="background:#f0f7ff"' : ''}>
      <td>${c.fecha||''}</td>
      <td>${MES_NOMBRE[c.mes]||''}</td>
      <td>${c.comp||''}</td>
      <td>${c.cod_rubro}</td>
      <td>${badge}${c.prov||''}</td>
      <td style="max-width:220px">${c.concepto||''}</td>
      <td class="num">${fmt(c.valor)}</td>
      <td class="num">${retVal > 0 ? fmt(retVal) : '—'}</td>
      <td class="num">${retVal > 0 ? fmt(netoVal) : '—'}</td>
      <td class="ctr">${accBtns}</td></tr>`;
  });

  /* ═══════════════════════════════════════════════════════
     G) INGRESOS REGISTRADOS
  ═══════════════════════════════════════════════════════ */
  const ingRegs = (d.ingresos||[]).filter(i => Number(i.trim)===t)
    .sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));
  let ingRegRows = '';
  let ingRegTotal = 0;
  ingRegs.forEach(i => {
    ingRegTotal += Number(i.valor)||0;
    const fuente = (d.rubros_ing||[]).find(r=>r.cod===i.cod_fuente);
    ingRegRows += `<tr>
      <td>${i.fecha||''}</td>
      <td>${MES_NOMBRE[i.mes]||''}</td>
      <td>${i.cod_fuente}</td>
      <td>${fuente?fuente.con:''}</td>
      <td>${i.concepto||''}</td>
      <td class="ctr"><span class="badge ${i.naturaleza==='adicion'?'bg-success':'bg-warning text-dark'}" style="font-size:10px">${i.naturaleza||'adicion'}</span></td>
      <td class="num">${fmt(i.valor)}</td>
      <td class="ctr">
        <button class="btn btn-sm btn-outline-warning py-0 px-1" onclick="abrirModalIngreso(${t},'${i.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarIngreso('${i.id}')"><i class="bi bi-trash"></i></button>
      </td></tr>`;
  });

  /* ═══════════════════════════════════════════════════════
     H) RECAUDOS MENSUALES
  ═══════════════════════════════════════════════════════ */
  let recaudoRows = '';
  let recaudoTotales = [0,0,0,0];
  (d.rubros_ing||[]).filter(r=>!r.esGrupo).forEach(r => {
    const r1 = getRecaudoMes(d, r.cod, meses[0]);
    const r2 = getRecaudoMes(d, r.cod, meses[1]);
    const r3 = getRecaudoMes(d, r.cod, meses[2]);
    const total = r1 + r2 + r3;
    if (r1 || r2 || r3){
      recaudoRows += `<tr>
        <td>${r.cod}</td><td>${r.con}</td>
        <td class="num">${fmt(r1)}</td>
        <td class="num">${fmt(r2)}</td>
        <td class="num">${fmt(r3)}</td>
        <td class="num fw-bold">${fmt(total)}</td>
        <td class="ctr">
          <button class="btn btn-sm btn-outline-success py-0 px-1" onclick="abrirModalRecaudo(${t},'${r.cod}')" title="Editar recaudos"><i class="bi bi-pencil"></i></button>
        </td></tr>`;
      recaudoTotales[0]+=r1; recaudoTotales[1]+=r2; recaudoTotales[2]+=r3; recaudoTotales[3]+=total;
    }
  });

  /* ═══════════════════════════════════════════════════════
     RENDER COMPLETO
  ═══════════════════════════════════════════════════════ */
  el.innerHTML = `
    <h5 class="mb-2" style="color:${tColors[t]}"><i class="bi bi-calendar3 me-2"></i>${tNames[t]}</h5>

    <!-- KPIs -->
    <div class="row g-2 mb-3">
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:${tColors[t]}">
        <div class="kv" style="color:${tColors[t]}">${fmt(totPD)}</div><div class="kl">Presup. Definitivo Egresos</div></div></div>
      <div class="col-md-3"><div class="card kpi e p-2">
        <div class="kv">${fmt(totCompTotal)}</div><div class="kl">Comprometido Egresos (${pctEjec}%)</div>
        <div class="pbar mt-1"><div class="pbar-f" style="width:${Math.min(pctEjec,100)}%;background:${tColors[t]}"></div></div></div></div>
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:var(--verde)">
        <div class="kv" style="color:var(--verde)">${fmt(iTotPD)}</div><div class="kl">Presup. Definitivo Ingresos</div></div></div>
      <div class="col-md-3"><div class="card kpi p-2" style="border-left-color:var(--verde)">
        <div class="kv" style="color:var(--verde)">${fmt(iTotRec)}</div><div class="kl">Recaudado Ingresos (${pctRec}%)</div>
        <div class="pbar mt-1"><div class="pbar-f" style="width:${Math.min(pctRec,100)}%;background:var(--verde)"></div></div></div></div>
    </div>

    <!-- Barra de acciones -->
    <div class="trim-acciones d-flex gap-1 flex-wrap align-items-center">
      <button class="btn btn-sm btn-primary" onclick="abrirModalGasto(${t})"><i class="bi bi-plus-circle me-1"></i>Registrar Gasto</button>
      <button class="btn btn-sm btn-outline-warning" onclick="abrirModalAcuerdo(${t})"><i class="bi bi-bank me-1"></i>Movimiento Bancario</button>
      <button class="btn btn-sm btn-outline-info" onclick="abrirModalCompEg(${t})"><i class="bi bi-clipboard-check me-1"></i>Compromiso</button>
      <div class="ms-auto d-flex gap-1">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary ${vistaActual==='eg'?'active':''}" id="btn-vista-eg-${t}" onclick="toggleVistaTrim('eg',${t})"><i class="bi bi-arrow-down-circle me-1"></i>Egresos</button>
          <button class="btn btn-outline-secondary ${vistaActual==='ing'?'active':''}" id="btn-vista-ing-${t}" onclick="toggleVistaTrim('ing',${t})"><i class="bi bi-arrow-up-circle me-1"></i>Ingresos</button>
          <button class="btn btn-outline-secondary ${vistaActual==='all'?'active':''}" id="btn-vista-all-${t}" onclick="toggleVistaTrim('all',${t})"><i class="bi bi-grid me-1"></i>Todo</button>
        </div>
      </div>
    </div>

    <!-- ═══ TABLA EJECUCIÓN EGRESOS (formato oficial) ═══ -->
    <div id="blk-eg-${t}" style="${vistaActual==='ing'?'display:none':''}">
      <div class="card mb-3">
        <div class="card-header py-1" style="background:${tColors[t]};color:#fff"><i class="bi bi-table me-1"></i>Ejecución Presupuestal de Egresos</div>
        <div class="card-body p-0">
          <div class="text-center py-2 border-bottom" style="font-size:11px;line-height:1.5">
            <div class="fw-bold" style="font-size:12px">FONDO DE SERVICIOS EDUCATIVOS</div>
            <div class="fw-bold">${d.config.institucion || 'INSTITUCIÓN EDUCATIVA'}</div>
            <div>NIT: ${d.config.nit || '—'}${d.config.ciudad ? ' — DANE: '+d.config.ciudad : ''}</div>
            <div>${d.config.municipio || ''}${d.config.departamento ? ', Dpto. de '+d.config.departamento : ''}</div>
            <div class="fw-bold mt-1" style="font-size:12px">EJECUCIÓN PRESUPUESTAL DE EGRESOS</div>
            <div>Vigencia ${d.config.vigencia || new Date().getFullYear()} — ${tNames[t]}</div>
          </div>
          <div class="table-responsive">
            <table class="tg" style="font-size:10px">
              <thead><tr>
                <th rowspan="2">Rub.<br>Presupuestal</th>
                <th rowspan="2">Guía</th>
                <th rowspan="2" style="min-width:130px">Identificación</th>
                <th rowspan="2">Presup.<br>Inicial<br><small style="font-weight:normal;font-size:9px">(3)</small></th>
                <th colspan="2" style="background:#d4edda">MODIFICACIONES</th>
                <th colspan="2" style="background:#cce5ff">TRASLADOS</th>
                <th rowspan="2">Presup.<br>Definitivo<br><small style="font-weight:normal;font-size:9px">(8)=3+4-5+6-7</small></th>
                <th colspan="4" style="background:#1b5e20;color:#fff">DISPONIBILIDADES</th>
                <th colspan="2" style="background:#4a148c;color:#fff">COMPROMISOS</th>
                <th rowspan="2">Saldo<br>Apropiación</th>
                <th colspan="3" style="background:#1a237e;color:#fff">PAGOS</th>
                <th rowspan="2">%<br>Ejec.</th>
              </tr><tr>
                <th style="background:#d4edda">Adiciones<br><small style="font-weight:normal;font-size:9px">(4)</small></th>
                <th style="background:#d4edda">Reducciones<br><small style="font-weight:normal;font-size:9px">(5)</small></th>
                <th style="background:#cce5ff">Créditos<br><small style="font-weight:normal;font-size:9px">(6)</small></th>
                <th style="background:#cce5ff">Contracréditos<br><small style="font-weight:normal;font-size:9px">(7)</small></th>
                <th>${MES_NOMBRE[meses[0]]}</th><th>${MES_NOMBRE[meses[1]]}</th><th>${MES_NOMBRE[meses[2]]}</th>
                <th>Total<br>Acumulado</th>
                <th>Acumulado<br><small style="font-weight:normal;font-size:9px">(Compromisos)</small></th>
                <th>Total<br>Compr.</th>
                <th>Del Mes</th><th>Acumulados</th><th>Por Pagar</th>
              </tr></thead>
              <tbody>${egRows}</tbody>
              <tfoot><tr class="gtot">
                <td colspan="3" class="text-end fw-bold">TOTALES EGRESOS</td>
                <td class="num fw-bold">${fmt(totSI)}</td>
                <td class="num fw-bold">${fmt(totAdi)}</td><td class="num fw-bold">${fmt(totRed)}</td>
                <td class="num fw-bold">${fmt(totCre)}</td><td class="num fw-bold">${fmt(totCco)}</td>
                <td class="num fw-bold">${fmt(totPD)}</td>
                <td class="num fw-bold">${fmt(totCdpM[0])}</td><td class="num fw-bold">${fmt(totCdpM[1])}</td><td class="num fw-bold">${fmt(totCdpM[2])}</td>
                <td class="num fw-bold">${fmt(totCdpAcum)}</td>
                <td class="num fw-bold">${fmt(totComp)}</td>
                <td class="num fw-bold">${fmt(totCompTotal)}</td>
                <td class="num fw-bold ${totSaldo<0?'text-danger':''}">${fmt(totSaldo)}</td>
                <td class="num fw-bold">${fmt(totPagPer)}</td>
                <td class="num fw-bold">${fmt(totPagAcum)}</td>
                <td class="num fw-bold">${fmt(totPorPagar)}</td>
                <td class="ctr fw-bold">${gPctEg}%</td>
              </tr></tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Modificaciones Egresos -->
      <div id="mod-eg-${t}">
        <div class="card mb-3">
          <div class="card-header ch-dorado py-1"><i class="bi bi-sliders me-1"></i>Modificaciones Presupuestales — Egresos (${modsEg.length})</div>
          <div class="card-body p-0">
            ${modsEg.length ? `<div class="table-responsive"><table class="tg">
              <thead><tr><th>Fecha</th><th>Acuerdo</th><th>Concepto</th><th>Rubro</th><th>Tipo</th><th>Valor</th><th>Acc.</th></tr></thead>
              <tbody>${modRows}</tbody>
            </table></div>` : '<p class="text-muted small p-2 mb-0">Sin modificaciones registradas</p>'}
          </div>
        </div>
      </div>

      <!-- Gastos del trimestre -->
      <div class="card mb-3">
        <div class="card-header py-1" style="background:${tColors[t]};color:#fff"><i class="bi bi-receipt me-1"></i>Gastos Registrados (${gastos.length}) — Total: ${fmt(gasTotal)}${gasRetTotal > 0 ? ` | Retención: ${fmt(gasRetTotal)} | Neto: ${fmt(gasNetoTotal)}` : ''}</div>
        <div class="card-body p-0">
          ${gastos.length ? `<div class="table-responsive"><table class="tg">
            <thead><tr><th>Fecha</th><th>Mes</th><th>Comp.</th><th>Rubro</th><th>Proveedor</th><th>Concepto</th><th>Valor</th><th>Retención</th><th>Neto</th><th>Acc.</th></tr></thead>
            <tbody>${gasRows}</tbody>
          </table></div>` : '<p class="text-muted small p-2 mb-0">Sin gastos registrados en este trimestre</p>'}
        </div>
      </div>
    </div>

    <!-- ═══ BARRA DE ACCIONES INGRESOS ═══ -->
    <div id="blk-ing-${t}" style="${vistaActual==='eg'?'display:none':''}">
      <div class="trim-acciones d-flex gap-1 flex-wrap align-items-center mb-2">
        <button class="btn btn-sm btn-success" onclick="abrirModalIngreso(${t})"><i class="bi bi-plus-circle me-1"></i>Registrar Ingreso</button>
        <button class="btn btn-sm btn-outline-success" onclick="abrirModalModEg(${t},null,'ing')"><i class="bi bi-sliders me-1"></i>Modificación Ingresos</button>
        <button class="btn btn-sm btn-outline-info" onclick="abrirModalRecaudo(${t})"><i class="bi bi-bank me-1"></i>Registrar Recaudo</button>
      </div>

      <!-- ═══ TABLA EJECUCIÓN INGRESOS (formato oficial) ═══ -->
      <div class="card mb-3">
        <div class="card-header py-1" style="background:var(--verde);color:#fff"><i class="bi bi-table me-1"></i>Ejecución Presupuestal de Ingresos</div>
        <div class="card-body p-0">
          <div class="text-center py-2 border-bottom" style="font-size:11px;line-height:1.5">
            <div class="fw-bold" style="font-size:12px">FONDO DE SERVICIOS EDUCATIVOS</div>
            <div class="fw-bold">${d.config.institucion || 'INSTITUCIÓN EDUCATIVA'}</div>
            <div>NIT: ${d.config.nit || '—'}${d.config.ciudad ? ' — DANE: '+d.config.ciudad : ''}</div>
            <div>${d.config.municipio || ''}${d.config.departamento ? ', Dpto. de '+d.config.departamento : ''}</div>
            <div class="fw-bold mt-1" style="font-size:12px">EJECUCIÓN PRESUPUESTAL DE INGRESOS</div>
            <div>Vigencia ${d.config.vigencia || new Date().getFullYear()} — ${tNames[t]}</div>
          </div>
          <div class="table-responsive">
            <table class="tg" style="font-size:10px">
              <thead><tr>
                <th rowspan="2">Código<br>Presup.</th>
                <th rowspan="2">Guía</th>
                <th rowspan="2" style="min-width:130px">Descripción</th>
                <th rowspan="2">Presup.<br>Inicial<br><small style="font-weight:normal;font-size:9px">(3)</small></th>
                <th colspan="2" style="background:#d4edda">MODIFICACIONES</th>
                <th colspan="2" style="background:#cce5ff">TRASLADOS</th>
                <th rowspan="2">Presup.<br>Definitivo<br><small style="font-weight:normal;font-size:9px">(8)=3+4-5+6-7</small></th>
                <th colspan="3" style="background:#e8f5e9">MOVIMIENTOS MENSUALES</th>
                <th rowspan="2">Recaudos<br><small style="font-weight:normal;font-size:9px">(9)</small></th>
                <th rowspan="2">Saldo por<br>Recaudar<br><small style="font-weight:normal;font-size:9px">(10)=8-9</small></th>
                <th rowspan="2">% por<br>Recaudar</th>
              </tr><tr>
                <th style="background:#d4edda">Adiciones<br><small style="font-weight:normal;font-size:9px">(4)</small></th>
                <th style="background:#d4edda">Reducciones<br><small style="font-weight:normal;font-size:9px">(5)</small></th>
                <th style="background:#cce5ff">Créditos<br><small style="font-weight:normal;font-size:9px">(6)</small></th>
                <th style="background:#cce5ff">Contracréditos<br><small style="font-weight:normal;font-size:9px">(7)</small></th>
                <th>${MES_NOMBRE[meses[0]]}</th><th>${MES_NOMBRE[meses[1]]}</th><th>${MES_NOMBRE[meses[2]]}</th>
              </tr></thead>
              <tbody>${ingRows}</tbody>
              <tfoot><tr class="gtot">
                <td colspan="3" class="text-end fw-bold">TOTALES INGRESOS</td>
                <td class="num fw-bold">${fmt(iTotSI)}</td>
                <td class="num fw-bold">${fmt(iTotAdi)}</td><td class="num fw-bold">${fmt(iTotRed)}</td>
                <td class="num fw-bold">${fmt(iTotCre)}</td><td class="num fw-bold">${fmt(iTotCco)}</td>
                <td class="num fw-bold">${fmt(iTotPD)}</td>
                <td class="num fw-bold">${fmt(iTotM[0])}</td><td class="num fw-bold">${fmt(iTotM[1])}</td><td class="num fw-bold">${fmt(iTotM[2])}</td>
                <td class="num fw-bold">${fmt(iTotRec)}</td>
                <td class="num fw-bold ${iTotSaldo<0?'text-danger':''}">${fmt(iTotSaldo)}</td>
                <td class="ctr fw-bold">${gPctIng}%</td>
              </tr></tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Modificaciones Ingresos -->
      <div id="mod-ing-${t}">
        <div class="card mb-3">
          <div class="card-header ch-verde py-1 d-flex justify-content-between align-items-center"><span><i class="bi bi-sliders me-1"></i>Modificaciones Presupuestales — Ingresos (${modsIng.length})</span><button class="btn btn-sm btn-outline-light py-0 px-1" onclick="abrirModalModEg(${t},null,'ing')" title="Agregar modificación de ingresos"><i class="bi bi-plus-lg"></i></button></div>
          <div class="card-body p-0">
            ${modsIng.length ? `<div class="table-responsive"><table class="tg">
              <thead><tr><th>Fecha</th><th>Acuerdo</th><th>Concepto</th><th>Rubro</th><th>Tipo</th><th>Valor</th><th>Acc.</th></tr></thead>
              <tbody>${modIngRows}</tbody>
            </table></div>` : '<p class="text-muted small p-2 mb-0">Sin modificaciones de ingresos</p>'}
          </div>
        </div>
      </div>

      <!-- Ingresos registrados -->
      <div class="card mb-3">
        <div class="card-header py-1" style="background:var(--verde);color:#fff"><i class="bi bi-cash-coin me-1"></i>Ingresos Registrados (${ingRegs.length}) — Total: ${fmt(ingRegTotal)}</div>
        <div class="card-body p-0">
          ${ingRegs.length ? `<div class="table-responsive"><table class="tg">
            <thead><tr><th>Fecha</th><th>Mes</th><th>Código</th><th>Fuente</th><th>Concepto</th><th>Nat.</th><th>Valor</th><th>Acc.</th></tr></thead>
            <tbody>${ingRegRows}</tbody>
          </table></div>` : '<p class="text-muted small p-2 mb-0">Sin ingresos registrados en este trimestre</p>'}
        </div>
      </div>

      <!-- Recaudos Mensuales -->
      <div class="card mb-3">
        <div class="card-header py-1" style="background:#17a2b8;color:#fff"><i class="bi bi-bank me-1"></i>Recaudos Efectivos por Fuente</div>
        <div class="card-body p-0">
          ${recaudoRows ? `<div class="table-responsive"><table class="tg">
            <thead><tr><th>Código</th><th>Fuente</th>
              <th>${MES_NOMBRE[meses[0]]}</th><th>${MES_NOMBRE[meses[1]]}</th><th>${MES_NOMBRE[meses[2]]}</th>
              <th>Total</th><th>Acc.</th></tr></thead>
            <tbody>${recaudoRows}</tbody>
            <tfoot><tr class="gtot">
              <td colspan="2" class="text-end fw-bold">TOTALES</td>
              <td class="num fw-bold">${fmt(recaudoTotales[0])}</td>
              <td class="num fw-bold">${fmt(recaudoTotales[1])}</td>
              <td class="num fw-bold">${fmt(recaudoTotales[2])}</td>
              <td class="num fw-bold">${fmt(recaudoTotales[3])}</td>
              <td></td>
            </tr></tfoot>
          </table></div>` : '<p class="text-muted small p-2 mb-0">Sin recaudos efectivos registrados.</p>'}
        </div>
      </div>
    </div>`;
};

/* ── Toggle vista Egresos / Ingresos / Todo ── */
function toggleVistaTrim(vista, t){
  const eg  = $('blk-eg-'+t);
  const ing = $('blk-ing-'+t);
  if (!eg || !ing) return;
  window._vistaActiva[t] = vista;
  if (vista === 'eg')      { eg.style.display = ''; ing.style.display = 'none'; }
  else if (vista === 'ing'){ eg.style.display = 'none'; ing.style.display = ''; }
  else                     { eg.style.display = ''; ing.style.display = ''; }
  ['eg','ing','all'].forEach(v => {
    const btn = $('btn-vista-'+v+'-'+t);
    if (btn) btn.className = v===vista ? 'btn btn-outline-secondary active' : 'btn btn-outline-secondary';
  });
}

/* ── Modal de Recaudo Mensual ── */
function abrirModalRecaudo(trim, codPre){
  const d = DB.load();
  const meses = MESES_TRIM[trim];
  const fuentes = (d.rubros_ing||[]).filter(r=>!r.esGrupo);
  if (fuentes.length === 0){ toast('No hay fuentes de ingreso configuradas.','warning'); return; }
  let fuenteOpts = optsIng(d, trim, codPre);
  const cod = codPre || fuentes[0].cod;
  const v1 = getRecaudoMes(d, cod, meses[0]);
  const v2 = getRecaudoMes(d, cod, meses[1]);
  const v3 = getRecaudoMes(d, cod, meses[2]);
  let modal = $('mRecaudo');
  if (!modal){ modal = document.createElement('div'); modal.id = 'mRecaudo'; modal.className = 'modal fade'; modal.tabIndex = -1; document.body.appendChild(modal); }
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header py-2" style="background:var(--verde);color:#fff">
          <h6 class="modal-title"><i class="bi bi-bank me-2"></i>Recaudo Efectivo Mensual — ${['','T1','T2','T3','T4'][trim]}</h6>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label fw-bold">Fuente de Ingreso</label>
            <select class="form-select" id="rec-fuente" onchange="cargarRecaudoFuente(${trim})">${fuenteOpts}</select></div>
          <div class="row g-2">
            <div class="col-md-4"><label class="form-label small">${MES_NOMBRE[meses[0]]}</label>
              <input type="number" class="form-control" id="rec-m1" min="0" value="${v1}"></div>
            <div class="col-md-4"><label class="form-label small">${MES_NOMBRE[meses[1]]}</label>
              <input type="number" class="form-control" id="rec-m2" min="0" value="${v2}"></div>
            <div class="col-md-4"><label class="form-label small">${MES_NOMBRE[meses[2]]}</label>
              <input type="number" class="form-control" id="rec-m3" min="0" value="${v3}"></div>
          </div>
          <input type="hidden" id="rec-trim" value="${trim}">
        </div>
        <div class="modal-footer py-1">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-success btn-sm" onclick="guardarRecaudo()"><i class="bi bi-save me-1"></i>Guardar Recaudo</button>
        </div>
      </div>
    </div>`;
  new bootstrap.Modal(modal).show();
}

function cargarRecaudoFuente(trim){
  const d = DB.load();
  const cod = $('rec-fuente').value;
  const meses = MESES_TRIM[trim];
  $('rec-m1').value = getRecaudoMes(d, cod, meses[0]);
  $('rec-m2').value = getRecaudoMes(d, cod, meses[1]);
  $('rec-m3').value = getRecaudoMes(d, cod, meses[2]);
}

function guardarRecaudo(){
  const d = DB.load();
  const trim = Number($('rec-trim').value);
  const cod = $('rec-fuente').value;
  const meses = MESES_TRIM[trim];
  if (!d.recaudos_ing_mes) d.recaudos_ing_mes = {};
  if (!d.recaudos_ing_mes[cod]) d.recaudos_ing_mes[cod] = {};
  d.recaudos_ing_mes[cod][meses[0]] = Number($('rec-m1').value) || 0;
  d.recaudos_ing_mes[cod][meses[1]] = Number($('rec-m2').value) || 0;
  d.recaudos_ing_mes[cod][meses[2]] = Number($('rec-m3').value) || 0;
  DB.save(d);
  bootstrap.Modal.getInstance($('mRecaudo')).hide();
  R.trimestre(trim);
  toast('Recaudo mensual guardado');
}
