/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Informes Oficiales (formato idéntico al FOSE original)
══════════════════════════════════════════════════════════ */

R.informe = function(){
  const d = DB.load();
  const el = $('page-informes');
  if (!el) return;

  el.innerHTML = `
    <h5 class="mb-3 no-print"><i class="bi bi-printer me-2" style="color:var(--azul)"></i>Informes Oficiales</h5>
    <div class="row g-2 mb-3 no-print">
      <div class="col-md-3">
        <label class="form-label small fw-bold">Trimestre</label>
        <select class="form-select form-select-sm" id="inf-trim" onchange="_renderInforme()">
          <option value="1">T1 — Ene/Feb/Mar</option><option value="2">T2 — Abr/May/Jun</option>
          <option value="3">T3 — Jul/Ago/Sep</option><option value="4">T4 — Oct/Nov/Dic</option>
          <option value="0">Acumulado Anual</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label small fw-bold">Informe</label>
        <select class="form-select form-select-sm" id="inf-tipo" onchange="_renderInforme()">
          <option value="egresos">Ejecución de Egresos</option>
          <option value="ingresos">Ejecución de Ingresos</option>
          <option value="pac">PAC Mensualizado</option>
          <option value="pac-ejec">PAC Ejecutado</option>
          <option value="mods-eg">Modificaciones — Egresos</option>
          <option value="mods-ing">Modificaciones — Ingresos</option>
          <option value="contratos">Relación de Gastos</option>
          <option value="documentos">Documentos Expedidos</option>
          <option value="balance">Balance Presupuestal</option>
          <option value="contraloria">Informe para Contraloría</option>
          <option value="cierre">Resolución de Cierre</option>
        </select>
      </div>
      <div class="col-md-6 d-flex align-items-end gap-1">
        <button class="btn btn-primary btn-sm" onclick="_renderInforme()"><i class="bi bi-eye me-1"></i>Ver</button>
        <button class="btn btn-success btn-sm" onclick="window.print()"><i class="bi bi-printer me-1"></i>Imprimir</button>
        <button class="btn btn-outline-success btn-sm" onclick="exportarInformeExcel()"><i class="bi bi-file-earmark-excel me-1"></i>Excel</button>
        <button class="btn btn-outline-secondary btn-sm" onclick="abrirModalCierre()"><i class="bi bi-file-earmark-lock me-1"></i>Datos Cierre</button>
      </div>
    </div>
    <div id="inf-contenido"></div>`;

  _renderInforme();
};

function _renderInforme(){
  const tipo = ($('inf-tipo')||{}).value || 'egresos';
  const trim = Number(($('inf-trim')||{}).value);
  const d = DB.load();
  const cont = $('inf-contenido');
  if (!cont) return;

  switch(tipo){
    case 'egresos':    cont.innerHTML = genEgresos(d, trim); break;
    case 'ingresos':   cont.innerHTML = genIngresos(d, trim); break;
    case 'pac':        cont.innerHTML = genPAC(d, trim); break;
    case 'pac-ejec':   cont.innerHTML = genPACEjecutado(d, trim); break;
    case 'mods-eg':    cont.innerHTML = genModificaciones(d, trim, 'egresos'); break;
    case 'mods-ing':   cont.innerHTML = genModificaciones(d, trim, 'ingresos'); break;
    case 'contratos':  cont.innerHTML = genContratos(d, trim); break;
    case 'documentos': cont.innerHTML = genDocumentosExpedidos(d, trim); break;
    case 'balance':    cont.innerHTML = genBalancePresupuestal(d, trim); break;
    case 'contraloria': cont.innerHTML = genInformeContraloria(d, trim); break;
    case 'cierre':     cont.innerHTML = genCierre(d); break;
    default:           cont.innerHTML = '<p class="text-muted">Seleccione un informe</p>';
  }
}

/* ── Encabezado común ── */
function _infHdr(d, titulo, subtitulo){
  const c = d.config;
  return `<div class="inf-hdr">
    <p>REPÚBLICA DE COLOMBIA</p>
    <p>${c.secretaria||'SECRETARÍA DE EDUCACIÓN'}</p>
    <h5>${c.institucion||''}</h5>
    <p>NIT: ${c.nit||''}${c.dv?'-'+c.dv:''} — ${c.municipio||''}, ${c.departamento||''}</p>
    <h5>${titulo}</h5>
    ${subtitulo?`<p>${subtitulo}</p>`:''}
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   1. INFORME DE EJECUCIÓN DE EGRESOS — Formato oficial completo
   19+ columnas: Rub | Ident | SI | Adi | Red | Cre | Cco | PD |
   Meses... | Total Acum | Compromisos | Total Compr | Saldo | Pagos(3) | %
══════════════════════════════════════════════════════════ */
function genEgresos(d, trim){
  const esTrim = trim > 0;
  const MESES_NOM = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const TRIM_FEC = {1:'01 DE ENERO HASTA 31 DE MARZO',2:'01 DE ABRIL HASTA 30 DE JUNIO',
    3:'01 DE JULIO HASTA 30 DE SEPTIEMBRE',4:'01 DE OCTUBRE HASTA 31 DE DICIEMBRE'};
  const cfg = d.config || {};
  const vig = cfg.vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM[trim]} INFORME TRIMESTRAL DE ${vig}` : `VIGENCIA FISCAL ${vig}`;

  const egNivCfg = {
    1:{bg:'#1a237e',clr:'#fff',fw:'800',pad:0},
    2:{bg:'#283593',clr:'#fff',fw:'700',pad:10},
    3:{bg:'#3949ab',clr:'#fff',fw:'600',pad:20},
    4:{bg:'#e8eaf6',clr:'#1a237e',fw:'600',pad:30},
    5:{bg:'#f8f9fa',clr:'#333',fw:'400',pad:40}
  };

  const grupos = [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  let gSI=0,gAdi=0,gRed=0,gCre=0,gCco=0,gPD=0;
  let gMes=new Array(nMes).fill(0),gGas=0,gComp=0,gSaldo=0,gPagPer=0,gPagAcum=0;
  let rows = '';

  grupos.forEach(g => {
    const realRubros = d.rubros.filter(r => r.tipo === g.tipo);
    if (!realRubros.length) return;
    const realCodes = new Set(realRubros.map(r => r.cod));
    const vMap = new Map();
    realRubros.forEach(r => {
      const parts = r.cod.split('.');
      for (let len=1; len<parts.length; len++){
        const prefix = parts.slice(0,len).join('.');
        if (!realCodes.has(prefix) && !vMap.has(prefix))
          vMap.set(prefix, {cod:prefix, con:GRUPO_LABELS[prefix]||('Grupo '+prefix), ini:0, tipo:g.tipo, esGrupo:true, _isVirtual:true});
      }
    });
    const combinada = sortarRubros([...realRubros, ...Array.from(vMap.values())]);

    let sSI=0,sAdi=0,sRed=0,sCre=0,sCco=0,sPD=0;
    let sMes=new Array(nMes).fill(0),sGas=0,sComp=0,sSaldo=0,sPagPer=0,sPagAcum=0;

    combinada.forEach(r => {
      const _tieneHijas = d.rubros.some(x => x.tipo===g.tipo && !x.esGrupo && x.cod.startsWith(r.cod+'.'));
      const isGrp = (r._isVirtual || r.esGrupo === true) && _tieneHijas;
      const n = Math.min(getNivel(r.cod), 5);
      const cfg2 = egNivCfg[n];

      if (isGrp){
        const hijos = d.rubros.filter(x => x.tipo===g.tipo && !x.esGrupo && x.cod.startsWith(r.cod+'.'));
        let pSI=0,pAdi=0,pRed=0,pCre=0,pCco=0,pPD=0,pCdpMes=new Array(nMes).fill(0),pCdpAcum=0,pComp=0,pCompTotal=0,pSaldo=0,pPagPer=0,pPagAcum=0,pPorPagar=0;
        hijos.forEach(x => {
          let si2,adi2,red2,cre2,cco2,pd2,cdpM2,cdpAcum2,comp2,compTotal2,pagTrim2,pagAcum2;
          if (esTrim){
            const m2=getMods(d,x.cod,trim);
            si2=getSaldoInicial(d,x.cod,trim); adi2=Number(m2.adi); red2=Number(m2.red);
            cre2=Number(m2.cre); cco2=Number(m2.cco); pd2=getPresupDisp(d,x.cod,trim);
            cdpM2=mesesCols.map(mn=>getCdpMes(d,x.cod,mn));
            const cdpPrev2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCdpEgTrim(d,x.cod,t2),0):0;
            cdpAcum2=cdpPrev2+getCdpEgTrim(d,x.cod,trim);
            comp2=getCompromisoEgTrim(d,x.cod,trim);
            const compPrev2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCompromisoEgTrim(d,x.cod,t2),0):0;
            compTotal2=compPrev2+comp2;
            pagTrim2=getGastos(d,x.cod,trim);
            pagAcum2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getGastos(d,x.cod,t2),0):0;
          } else {
            si2=Number(x.ini); adi2=0;red2=0;cre2=0;cco2=0;
            for(let tt=1;tt<=4;tt++){const m2=getMods(d,x.cod,tt);adi2+=Number(m2.adi);red2+=Number(m2.red);cre2+=Number(m2.cre);cco2+=Number(m2.cco);}
            pd2=si2+adi2-red2+cre2-cco2;
            cdpM2=mesesCols.map(mn=>getCdpMes(d,x.cod,mn));
            cdpAcum2=0;for(let tt=1;tt<=4;tt++)cdpAcum2+=getCdpEgTrim(d,x.cod,tt);
            compTotal2=0;for(let tt=1;tt<=4;tt++)compTotal2+=getCompromisoEgTrim(d,x.cod,tt);
            comp2=compTotal2;
            pagTrim2=0;for(let tt=1;tt<=4;tt++)pagTrim2+=getGastos(d,x.cod,tt);
            pagAcum2=0;
          }
          pSI+=si2;pAdi+=adi2;pRed+=red2;pCre+=cre2;pCco+=cco2;pPD+=pd2;
          cdpM2.forEach((v,i)=>pCdpMes[i]+=v);pCdpAcum+=cdpAcum2;pComp+=comp2;pCompTotal+=compTotal2;
          pSaldo+=esTrim?(pd2-comp2):(pd2-compTotal2);pPagPer+=pagTrim2;pPagAcum+=pagAcum2;
          pPorPagar+=Math.max(0,compTotal2-pagTrim2-pagAcum2);
        });
        const pP = pPD>0 ? (pCompTotal/pPD*100).toFixed(1) : '0.0';
        rows += `<tr style="background:${cfg2.bg};color:${cfg2.clr};font-weight:${cfg2.fw};font-size:10px">
          <td colspan="2" style="padding-left:${cfg2.pad}px"><strong>${r.con.toUpperCase()}</strong>
           <code style="font-size:8px;opacity:.7;color:${cfg2.clr}">${r.cod}</code></td>
          <td class="num">${pSI>0?fmt(pSI):'—'}</td>
          <td class="num">${pAdi>0?fmt(pAdi):'—'}</td><td class="num">${pRed>0?fmt(pRed):'—'}</td>
          <td class="num">${pCre>0?fmt(pCre):'—'}</td><td class="num">${pCco>0?fmt(pCco):'—'}</td>
          <td class="num">${pPD>0?fmt(pPD):'—'}</td>
          ${pCdpMes.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
          <td class="num">${pCdpAcum>0?fmt(pCdpAcum):'—'}</td>
          <td class="num">${pComp>0?fmt(pComp):'—'}</td>
          <td class="num">${pCompTotal>0?fmt(pCompTotal):'—'}</td>
          <td class="num${pSaldo<0?' saldo-neg':''}">${fmt(pSaldo)}</td>
          <td class="num">${pPagPer>0?fmt(pPagPer):'—'}</td><td class="num">${pPagAcum>0?fmt(pPagAcum):'—'}</td>
          <td class="num">${pPorPagar>0?fmt(pPorPagar):'—'}</td>
          <td class="ctr">${pPD>0?pP+'%':'—'}</td></tr>`;
      } else {
        let si,adi,red,cre,cco,pd,cdpMes,cdpAcum,comp,compTotal,pagTrim,pagAcumPrev,porPagar;
        if (esTrim){
          const m=getMods(d,r.cod,trim);
          si=getSaldoInicial(d,r.cod,trim);adi=Number(m.adi);red=Number(m.red);
          cre=Number(m.cre);cco=Number(m.cco);pd=getPresupDisp(d,r.cod,trim);
          cdpMes=mesesCols.map(mn=>getCdpMes(d,r.cod,mn));
          const cdpPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCdpEgTrim(d,r.cod,t2),0):0;
          cdpAcum=cdpPrev+getCdpEgTrim(d,r.cod,trim);
          comp=getCompromisoEgTrim(d,r.cod,trim);
          const compPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCompromisoEgTrim(d,r.cod,t2),0):0;
          compTotal=compPrev+comp;
          pagTrim=getGastos(d,r.cod,trim);
          pagAcumPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getGastos(d,r.cod,t2),0):0;
        } else {
          si=Number(r.ini);adi=0;red=0;cre=0;cco=0;
          for(let tt=1;tt<=4;tt++){const m=getMods(d,r.cod,tt);adi+=Number(m.adi);red+=Number(m.red);cre+=Number(m.cre);cco+=Number(m.cco);}
          pd=si+adi-red+cre-cco;
          cdpMes=mesesCols.map(mn=>getCdpMes(d,r.cod,mn));
          cdpAcum=0;for(let tt=1;tt<=4;tt++)cdpAcum+=getCdpEgTrim(d,r.cod,tt);
          compTotal=0;for(let tt=1;tt<=4;tt++)compTotal+=getCompromisoEgTrim(d,r.cod,tt);
          comp=compTotal;
          pagTrim=0;for(let tt=1;tt<=4;tt++)pagTrim+=getGastos(d,r.cod,tt);
          pagAcumPrev=0;
        }
        porPagar=Math.max(0,compTotal-pagTrim-pagAcumPrev);
        const saldo=esTrim ? (pd-comp) : (pd-compTotal);  // esTrim: PD ya descuenta comp anteriores
        const p=pd>0?(compTotal/pd*100).toFixed(1):'0.0';

        sSI+=si;sAdi+=adi;sRed+=red;sCre+=cre;sCco+=cco;sPD+=pd;
        cdpMes.forEach((v,i)=>sMes[i]+=v);sGas+=cdpAcum;sComp+=compTotal;sSaldo+=saldo;sPagPer+=pagTrim;sPagAcum+=pagAcumPrev;

        rows += `<tr>
          <td style="padding-left:${cfg2.pad}px"><code style="font-size:10px">${r.cod}</code></td>
          <td style="text-align:left">${r.con}</td>
          <td class="num">${fmt(si)}</td>
          <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
          <td class="num">${cre>0?fmt(cre):'—'}</td><td class="num">${cco>0?fmt(cco):'—'}</td>
          <td class="num fw-bold">${fmt(pd)}</td>
          ${cdpMes.map(v=>'<td class="num">'+(v>0?fmt(v):'—')+'</td>').join('')}
          <td class="num">${cdpAcum>0?fmt(cdpAcum):'—'}</td>
          <td class="num">${comp>0?fmt(comp):'—'}</td>
          <td class="num">${compTotal>0?fmt(compTotal):'—'}</td>
          <td class="num${saldo<0?' saldo-neg':''}">${fmt(saldo)}</td>
          <td class="num">${pagTrim>0?fmt(pagTrim):'—'}</td>
          <td class="num">${pagAcumPrev>0?fmt(pagAcumPrev):'—'}</td>
          <td class="num">${porPagar>0?fmt(porPagar):'—'}</td>
          <td class="ctr">${p}%</td></tr>`;
      }
    });

    gSI+=sSI;gAdi+=sAdi;gRed+=sRed;gCre+=sCre;gCco+=sCco;gPD+=sPD;
    gMes.forEach((_,i)=>gMes[i]+=sMes[i]);
    gGas+=sGas;gComp+=sComp;gSaldo+=sSaldo;gPagPer+=sPagPer;gPagAcum+=sPagAcum;
  });

  const gPorPagar = Math.max(0, gComp - gPagPer - gPagAcum);
  const gP = gPD>0 ? (gComp/gPD*100).toFixed(1) : '0.0';
  rows += `<tr class="gtot"><td colspan="2">TOTALES</td>
    <td class="num">${fmt(gSI)}</td><td class="num">${fmt(gAdi)}</td><td class="num">${fmt(gRed)}</td>
    <td class="num">${fmt(gCre)}</td><td class="num">${fmt(gCco)}</td><td class="num">${fmt(gPD)}</td>
    ${gMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}
    <td class="num">${fmt(gGas)}</td><td class="num">${fmt(gComp)}</td><td class="num">${fmt(gComp)}</td>
    <td class="num${gSaldo<0?' saldo-neg':''}">${fmt(gSaldo)}</td>
    <td class="num">${fmt(gPagPer)}</td><td class="num">${fmt(gPagAcum)}</td><td class="num">${fmt(gPorPagar)}</td>
    <td class="ctr">${gP}%</td></tr>`;

  // Apéndice: acuerdos
  const modsEg = d.mods_eg || [];
  const modsInf = esTrim ? modsEg.filter(e=>Number(e.trim)===trim).sort((a,b)=>a.fecha.localeCompare(b.fecha))
    : modsEg.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const tipoBadge = {adicion:'Adición',reduccion:'Reducción',credito:'Crédito',contracredito:'Contracrédito'};
  let acRows = modsInf.length ? modsInf.map((e,i)=>{
    const rb = d.rubros.find(r=>r.cod===e.cod);
    return `<tr><td class="ctr">${i+1}</td><td>${e.fecha}</td><td>${e.acuerdo||'—'}</td>
      <td>${tipoBadge[e.tipo]||e.tipo}${!esTrim?' (T'+e.trim+')':''}</td>
      <td>${e.cod}${rb?' — '+rb.con:''}</td><td>${e.concepto||'—'}</td>
      <td class="num">${fmt(e.valor)}</td></tr>`;
  }).join('') : '<tr><td colspan="7" class="ctr" style="color:#888;padding:8px">Sin modificaciones</td></tr>';

  const thMeses = mesesCols.map(m=>'<th>'+MESES_NOM[m]+'</th>').join('');

  return _infHdr(d, 'INFORME DE EJECUCIÓN PRESUPUESTAL DE EGRESOS', `${periodoLbl}`) +
  `<table class="ti"><thead>
    <tr>
      <th rowspan="2">Rub.<br>Presupuestal</th>
      <th rowspan="2" style="min-width:160px;text-align:left">Identificación</th>
      <th rowspan="2">Presup.<br>Inicial<br><small style="font-weight:normal;font-size:9px">(3)</small></th>
      <th colspan="2">MODIFICACIONES</th>
      <th colspan="2">TRASLADOS</th>
      <th rowspan="2">Presup.<br>Definitivo<br><small style="font-weight:normal;font-size:9px">(8)=3+4-5+6-7</small></th>
      <th colspan="${nMes+1}" style="background:#1b5e20;color:#fff">DISPONIBILIDADES</th>
      <th colspan="2" style="background:#4a148c;color:#fff">COMPROMISOS</th>
      <th rowspan="2">Saldo<br>Apropiación</th>
      <th colspan="3" style="background:#1a237e;color:#fff">PAGOS</th>
      <th rowspan="2">%<br>Ejec.</th>
    </tr><tr>
      <th>Adiciones<br><small style="font-weight:normal;font-size:9px">(4)</small></th>
      <th>Reducciones<br><small style="font-weight:normal;font-size:9px">(5)</small></th>
      <th>Créditos<br><small style="font-weight:normal;font-size:9px">(6)</small></th>
      <th>Contracréditos<br><small style="font-weight:normal;font-size:9px">(7)</small></th>
      ${thMeses}<th>Total<br>Acumulado</th>
      <th>Acumulado</th><th>Total<br>Compr.</th>
      <th>Del Mes</th><th>Acumulados</th><th>Por Pagar</th>
    </tr>
  </thead><tbody>${rows}</tbody></table>
  <br><table class="ti no-print" style="margin-top:12px"><thead>
    <tr><th colspan="7" style="background:#795548;color:#fff;text-align:left;padding:6px 8px">
      ACUERDOS Y RESOLUCIONES PRESUPUESTALES${esTrim?' — '+TRIM_NOM[trim]+' TRIMESTRE':' — ACUMULADO ANUAL'}
    </th></tr>
    <tr><th>N°</th><th>Fecha</th><th>N° Acuerdo</th><th>Tipo</th><th>Rubro</th><th>Concepto</th><th>Valor</th></tr>
  </thead><tbody>${acRows}</tbody></table>`;
}

/* ══════════════════════════════════════════════════════════
   2. INFORME DE EJECUCIÓN DE INGRESOS — Formato oficial completo
══════════════════════════════════════════════════════════ */
function genIngresos(d, trim){
  const esTrim = trim > 0;
  const MESES_NOM = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const cfg = d.config || {};
  const vig = cfg.vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE DE ${vig}` : `VIGENCIA FISCAL ${vig}`;

  const ri = d.rubros_ing || [];
  // Grupos virtuales
  const iRealCods = new Set(ri.map(r => r.cod));
  const iVirtMap = new Map();
  ri.forEach(r => {
    const parts = r.cod.split('.');
    for (let len=1; len<parts.length; len++){
      const prefix = parts.slice(0,len).join('.');
      if (!iRealCods.has(prefix) && !iVirtMap.has(prefix))
        iVirtMap.set(prefix, {cod:prefix, con:GRUPO_LABELS_ING[prefix]||('Grupo '+prefix), esGrupo:true, _isVirtual:true, ini:0});
    }
  });
  const iCombinada = sortarRubros([...ri, ...Array.from(iVirtMap.values())]);

  let gSI=0,gAdi=0,gRed=0,gPD=0,gMes=new Array(nMes).fill(0),gRec=0,gSaldo=0;
  let rows = '';

  iCombinada.forEach(r => {
    const _tieneHijasIng = (d.rubros_ing||[]).some(x => !x.esGrupo && x.cod.startsWith(r.cod+'.'));
    const isGrp = (r._isVirtual || r.esGrupo === true) && _tieneHijasIng;
    const n = Math.min(getNivel(r.cod), 5);
    const pad = (n-1)*10;

    let si,adi,red,pd,mesV,rec,saldo,p;
    if (isGrp){
      const hijos = getHijosIng(d, r.cod);
      si = hijos.reduce((s,x)=>s+getSaldoInicialIng(d,x.cod,esTrim?trim:1),0);
      if (esTrim){
        adi = hijos.reduce((s,x)=>{const m=getModsIng(d,x.cod,trim);return s+Number(m.adi)+Number(m.cre);},0);
        red = hijos.reduce((s,x)=>{const m=getModsIng(d,x.cod,trim);return s+Number(m.red)+Number(m.cco);},0);
      } else {
        adi = hijos.reduce((s,x)=>s+getModsAnioIng(d,x.cod,'adi')+getModsAnioIng(d,x.cod,'cre'),0);
        red = hijos.reduce((s,x)=>s+getModsAnioIng(d,x.cod,'red')+getModsAnioIng(d,x.cod,'cco'),0);
      }
      pd = si+adi-red;
      mesV = mesesCols.map(mn=>hijos.reduce((s,x)=>s+getMovimIngMes(d,x.cod,mn),0));
      rec = hijos.reduce((s,x)=>s+getRecaudoEfectivoIng(d,x.cod,esTrim?trim:0),0);
      // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
      if(rec > pd && pd >= 0) rec = pd;
      saldo = Math.max(0, pd-rec);
      p = pd>0?(rec/pd*100).toFixed(1):'0.0';
      const bg = n===1?'#1b5e20':n===2?'#2e7d32':n===3?'#388e3c':'#c8e6c9';
      const clr = n<=3?'#fff':'#1b5e20';
      rows += `<tr style="background:${bg};color:${clr};font-weight:${n<=2?'800':'600'};font-size:10px">
        <td style="padding-left:${pad}px"><code style="font-size:9px;color:${clr}">${r.cod}</code></td>
        <td style="text-align:left;padding-left:${pad+4}px">${r.con.toUpperCase()}</td>
        <td class="num">${si>0?fmt(si):'—'}</td>
        <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
        <td class="num">${pd>0?fmt(pd):'—'}</td>
        ${mesV.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${rec?fmt(rec):'—'}</td>
        <td class="num${saldo<0?' saldo-neg':''}">${fmt(saldo)}</td>
        <td class="ctr">${pd>0?p+'%':'—'}</td></tr>`;
    } else {
      if (esTrim){
        si = getSaldoInicialIng(d,r.cod,trim);
        const mi = getModsIng(d,r.cod,trim);
        adi = Number(mi.adi)+Number(mi.cre);
        red = Number(mi.red)+Number(mi.cco);
        pd = getPresupDispIng(d,r.cod,trim);
      } else {
        si = Number(r.ini);
        adi = getModsAnioIng(d,r.cod,'adi')+getModsAnioIng(d,r.cod,'cre');
        red = getModsAnioIng(d,r.cod,'red')+getModsAnioIng(d,r.cod,'cco');
        pd = si+adi-red;
      }
      mesV = mesesCols.map(mn=>getMovimIngMes(d,r.cod,mn));
      rec = esTrim ? getRecaudoEfectivoIng(d,r.cod,trim) : getRecaudoEfectivoIng(d,r.cod,0);
      // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
      if(rec > pd && pd >= 0) rec = pd;
      saldo = Math.max(0, pd-rec);
      p = pd>0?(rec/pd*100).toFixed(1):'0.0';
      gSI+=si;gAdi+=adi;gRed+=red;gPD+=pd;mesV.forEach((v,i)=>gMes[i]+=v);gRec+=rec;gSaldo+=saldo;
      rows += `<tr>
        <td style="padding-left:${pad}px">${r.cod}</td>
        <td style="text-align:left;padding-left:${pad+4}px">${r.con}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
        <td class="num fw-bold">${fmt(pd)}</td>
        ${mesV.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="num">${rec?fmt(rec):'—'}</td>
        <td class="num${saldo<0?' saldo-neg':''}">${fmt(saldo)}</td>
        <td class="ctr">${p}%</td></tr>`;
    }
  });

  // Seguridad en totales: recaudo no puede superar definitivo (reducciones son movidas internas)
  if(gRec > gPD && gPD >= 0) gRec = gPD;
  gSaldo = Math.max(0, gPD - gRec);
  const gP = gPD>0?Math.min(100, gRec/gPD*100).toFixed(1):'0.0';
  rows += `<tr class="gtot"><td colspan="2">TOTALES</td>
    <td class="num">${fmt(gSI)}</td><td class="num">${fmt(gAdi)}</td><td class="num">${fmt(gRed)}</td>
    <td class="num">${fmt(gPD)}</td>
    ${gMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}
    <td class="num">${fmt(gRec)}</td><td class="num">${fmt(gSaldo)}</td><td class="ctr">${gP}%</td></tr>`;

  const thMeses = mesesCols.map(m=>'<th rowspan="2">'+MESES_NOM[m]+'</th>').join('');

  return _infHdr(d, 'INFORME DE EJECUCIÓN PRESUPUESTAL DE INGRESOS', periodoLbl) +
  `<table class="ti"><thead>
    <tr>
      <th rowspan="2">Código<br>Presup.</th>
      <th rowspan="2" style="min-width:160px;text-align:left">Descripción</th>
      <th rowspan="2">Presup.<br>Inicial<br><small style="font-weight:normal;font-size:9px">(1)</small></th>
      <th colspan="2">MODIFICACIONES</th>
      <th rowspan="2">Presup.<br>Definitivo<br><small style="font-weight:normal;font-size:9px">(4)=1+2-3</small></th>
      ${thMeses}
      <th rowspan="2">Recaudos<br><small style="font-weight:normal;font-size:9px">(5)</small></th>
      <th rowspan="2">Saldo por<br>Recaudar<br><small style="font-weight:normal;font-size:9px">(6)=4-5</small></th>
      <th rowspan="2">% por<br>Recaudar</th>
    </tr><tr>
      <th>Adiciones<br><small style="font-weight:normal;font-size:9px">(2)</small></th>
      <th>Reducciones<br><small style="font-weight:normal;font-size:9px">(3)</small></th>
    </tr>
  </thead><tbody>${rows}</tbody></table>`;
}

/* ══════════════════════════════════════════════════════════
   3. PAC MENSUALIZADO (Egresos + Ingresos combinado)
══════════════════════════════════════════════════════════ */
function genPAC(d, trim){
  const esTrim = trim > 0;
  const MN = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = (d.config||{}).vigencia || new Date().getFullYear();
  const periodoLblPAC = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE — Vigencia ${vig}` : `Acumulado Anual — Vigencia ${vig}`;
  const grupos = [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  const sepStyle = 'margin:18px 0 6px;padding:5px 10px;font-weight:700;font-size:10.5px;letter-spacing:.6px;border-radius:2px;color:#fff';
  let rows = '';
  let gSI=0,gAdi=0,gRed=0,gCre=0,gCco=0,gPD=0,gMes=new Array(mesesCols.length).fill(0),gTot=0,gSF=0;

  grupos.forEach(g => {
    const list = d.rubros.filter(r => r.tipo===g.tipo && !r.esGrupo);
    if (!list.length) return;
    let sSI=0,sAdi=0,sRed=0,sCre=0,sCco=0,sPD=0,sMes=new Array(mesesCols.length).fill(0),sTot=0,sSF=0;
    const nCols = esTrim ? 14 : 17;
    rows += `<tr class="ghead"><td colspan="${nCols}">${g.label}</td></tr>`;

    list.forEach(r => {
      let si,adi2,red2,cre2,cco2,pd,mesV;
      if (esTrim){
        const m=getMods(d,r.cod,trim);
        si=getSaldoInicial(d,r.cod,trim);adi2=Number(m.adi);red2=Number(m.red);
        cre2=Number(m.cre);cco2=Number(m.cco);pd=getPresupDisp(d,r.cod,trim);
        mesV=mesesCols.map(mn=>getGastosMes(d,r.cod,mn));
      } else {
        si=Number(r.ini);adi2=0;red2=0;cre2=0;cco2=0;
        for(let tt=1;tt<=4;tt++){const m=getMods(d,r.cod,tt);adi2+=Number(m.adi);red2+=Number(m.red);cre2+=Number(m.cre);cco2+=Number(m.cco);}
        pd=si+adi2-red2+cre2-cco2;
        mesV=mesesCols.map(mn=>getGastosMes(d,r.cod,mn));
      }
      const tot=mesV.reduce((a,b)=>a+b,0);const sf=pd-tot;const p=pd>0?(tot/pd*100).toFixed(1):'0.0';
      sSI+=si;sAdi+=adi2;sRed+=red2;sCre+=cre2;sCco+=cco2;sPD+=pd;mesV.forEach((v,i)=>sMes[i]+=v);sTot+=tot;sSF+=sf;
      if(esTrim){
        rows += `<tr><td>${r.cod}</td><td class="ctr">${r.guia||''}</td><td style="text-align:left">${r.con}</td>
          <td class="num">${fmt(si)}</td>
          <td class="num">${adi2>0?fmt(adi2):'—'}</td><td class="num">${red2>0?fmt(red2):'—'}</td>
          <td class="num">${cre2>0?fmt(cre2):'—'}</td><td class="num">${cco2>0?fmt(cco2):'—'}</td>
          <td class="num">${fmt(pd)}</td>
          ${mesV.map(v=>'<td class="num">'+(v>0?fmt(v):'—')+'</td>').join('')}
          <td class="num">${tot>0?fmt(tot):'—'}</td><td class="num ${sf<0?'saldo-neg':''}">${fmt(sf)}</td>
          <td class="ctr">${p}%</td></tr>`;
      } else {
        rows += `<tr><td>${r.cod}</td><td class="ctr">${r.guia||''}</td><td style="text-align:left">${r.con}</td>
          <td class="num">${fmt(si)}</td><td class="num">${fmt(pd)}</td>
          ${mesV.map(v=>'<td class="num">'+(v>0?fmt(v):'—')+'</td>').join('')}
          <td class="num">${tot>0?fmt(tot):'—'}</td><td class="num ${sf<0?'saldo-neg':''}">${fmt(sf)}</td>
          <td class="ctr">${p}%</td></tr>`;
      }
    });
    gSI+=sSI;gAdi+=sAdi;gRed+=sRed;gCre+=sCre;gCco+=sCco;gPD+=sPD;
    sMes.forEach((v,i)=>gMes[i]+=v);gTot+=sTot;gSF+=sSF;
  });

  const gP = gPD>0?(gTot/gPD*100).toFixed(1):'0.0';
  if(esTrim){
    rows += `<tr class="gtot"><td colspan="3">TOTAL EGRESOS</td>
      <td class="num">${fmt(gSI)}</td><td class="num">${fmt(gAdi)}</td><td class="num">${fmt(gRed)}</td>
      <td class="num">${fmt(gCre)}</td><td class="num">${fmt(gCco)}</td><td class="num">${fmt(gPD)}</td>
      ${gMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}
      <td class="num">${fmt(gTot)}</td><td class="num ${gSF<0?'saldo-neg':''}">${fmt(gSF)}</td>
      <td class="ctr">${gP}%</td></tr>`;
    const egTable = `<table class="ti"><thead><tr>
      <th>Cuenta</th><th>Guía</th><th style="min-width:140px;text-align:left">Concepto</th>
      <th>Saldo<br>Inicial</th><th>Adición</th><th>Reducción</th><th>Crédito</th><th>Contracrédito</th>
      <th>Presup.<br>Disponible</th>
      ${mesesCols.map(m=>'<th>'+MN[m]+'</th>').join('')}
      <th>Total<br>Ejecutado</th><th>Saldo<br>Final</th><th>%</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    return _infHdr(d, 'PLAN ANUAL MENSUALIZADO DE CAJA', periodoLblPAC) +
    `<div style="${sepStyle};background:#1a5276">▼ EGRESOS</div>${egTable}
    <div style="${sepStyle};background:#145e2c;margin-top:24px">▼ INGRESOS</div>${genPACIngresos(d, trim)}`;
  } else {
    rows += `<tr class="gtot"><td colspan="3">TOTAL EGRESOS</td>
      <td class="num">${fmt(gSI)}</td><td class="num">${fmt(gPD)}</td>
      ${gMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}
      <td class="num">${fmt(gTot)}</td><td class="num ${gSF<0?'saldo-neg':''}">${fmt(gSF)}</td>
      <td class="ctr">${gP}%</td></tr>`;
    const egTable = `<table class="ti"><thead><tr>
      <th>Cuenta</th><th>Guía</th><th style="min-width:140px;text-align:left">Concepto</th>
      <th>Pres.<br>Inicial</th><th>Presup.<br>Definitivo</th>
      ${mesesCols.map(m=>'<th>'+MN[m]+'</th>').join('')}
      <th>Total<br>Ejecutado</th><th>Saldo</th><th>%</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    return _infHdr(d, 'PLAN ANUAL MENSUALIZADO DE CAJA', periodoLblPAC) +
    `<div style="${sepStyle};background:#1a5276">▼ EGRESOS</div>${egTable}
    <div style="${sepStyle};background:#145e2c;margin-top:24px">▼ INGRESOS</div>${genPACIngresos(d, trim)}`;
  }
}

/* ── PAC Ingresos (sub-tabla del PAC) ── */
function genPACIngresos(d, trim){
  const esTrim = trim > 0;
  const MN = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const ri = d.rubros_ing || [];
  let rows = '';
  let gSI=0,gAdi=0,gRed=0,gCre=0,gCco=0,gPD=0,gMes=new Array(mesesCols.length).fill(0),gTot=0;

  ri.forEach(r => {
    let si,adi,red,cre,cco,pd,mesV,tot,p;
    if (r.esGrupo){
      const hijos = getHijosIng(d, r.cod);
      if (esTrim){
        si = hijos.reduce((s,x)=>s+getSaldoInicialIng(d,x.cod,trim),0);
        adi = getModGrupoIng(d,r.cod,'adi',trim); red = getModGrupoIng(d,r.cod,'red',trim);
        cre = getModGrupoIng(d,r.cod,'cre',trim); cco = getModGrupoIng(d,r.cod,'cco',trim);
      } else {
        si = hijos.reduce((s,x)=>s+Number(x.ini),0);
        adi = getModGrupoAnioIng(d,r.cod,'adi'); red = getModGrupoAnioIng(d,r.cod,'red');
        cre = getModGrupoAnioIng(d,r.cod,'cre'); cco = getModGrupoAnioIng(d,r.cod,'cco');
      }
      pd = si+adi-red+cre-cco;
      mesV = mesesCols.map(mn=>hijos.reduce((s,x)=>s+getMovimIngMes(d,x.cod,mn),0));
      tot = mesV.reduce((a,b)=>a+b,0);
      p = pd>0?(tot/pd*100).toFixed(1):'0.0';
      rows += `<tr style="background:#fffde7;font-weight:600;font-size:10px">
        <td>${r.cod}</td><td class="ctr">—</td><td style="text-align:left">${r.con}</td>
        <td class="num">${si>0?fmt(si):'—'}</td>
        <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
        <td class="num">${cre>0?fmt(cre):'—'}</td><td class="num">${cco>0?fmt(cco):'—'}</td>
        <td class="num">${pd>0?fmt(pd):'—'}</td>
        ${mesV.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="ctr">${pd>0?p+'%':'—'}</td></tr>`;
    } else {
      if (esTrim){
        si = getSaldoInicialIng(d,r.cod,trim);
        const mi = getModsIng(d,r.cod,trim);
        adi=Number(mi.adi);red=Number(mi.red);cre=Number(mi.cre);cco=Number(mi.cco);
        pd = getPresupDispIng(d,r.cod,trim);
      } else {
        si = Number(r.ini);
        adi = getModsAnioIng(d,r.cod,'adi'); red = getModsAnioIng(d,r.cod,'red');
        cre = getModsAnioIng(d,r.cod,'cre'); cco = getModsAnioIng(d,r.cod,'cco');
        pd = si+adi-red+cre-cco;
      }
      mesV = mesesCols.map(mn=>getMovimIngMes(d,r.cod,mn));
      tot = mesV.reduce((a,b)=>a+b,0);
      p = pd>0?(tot/pd*100).toFixed(1):'0.0';
      gSI+=si;gAdi+=adi;gRed+=red;gCre+=cre;gCco+=cco;gPD+=pd;mesV.forEach((v,i)=>gMes[i]+=v);gTot+=tot;
      rows += `<tr><td>${r.cod}</td><td class="ctr">${r.guia||'—'}</td><td style="text-align:left">${r.con}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
        <td class="num">${cre>0?fmt(cre):'—'}</td><td class="num">${cco>0?fmt(cco):'—'}</td>
        <td class="num fw-bold">${fmt(pd)}</td>
        ${mesV.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}
        <td class="ctr">${p}%</td></tr>`;
    }
  });

  rows += `<tr class="gtot"><td colspan="3">TOTAL INGRESOS</td>
    <td class="num">${fmt(gSI)}</td><td class="num">${fmt(gAdi)}</td><td class="num">${fmt(gRed)}</td>
    <td class="num">${fmt(gCre)}</td><td class="num">${fmt(gCco)}</td><td class="num">${fmt(gPD)}</td>
    ${gMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}
    <td class="ctr">${gPD>0?(gTot/gPD*100).toFixed(1):'0.0'}%</td></tr>`;

  return `<table class="ti"><thead><tr>
    <th>Cuenta</th><th>Guía</th><th style="min-width:140px;text-align:left">Concepto</th>
    <th>Saldo<br>Inicial</th><th>Adición</th><th>Reducción</th><th>Crédito</th><th>Contracrédito</th>
    <th>Presup.<br>Disponible</th>
    ${mesesCols.map(m=>'<th>'+MN[m]+'</th>').join('')}
    <th>%<br>Recaudo</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

/* ══════════════════════════════════════════════════════════
   4. PAC EJECUTADO — Ingresos + Egresos + Saldo Acumulado
══════════════════════════════════════════════════════════ */
function genPACEjecutado(d, trim){
  const esTrim = trim > 0;
  const MN = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = (d.config||{}).vigencia || new Date().getFullYear();
  const periodoLblPE = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE — Vigencia ${vig}` : `Acumulado Anual — Vigencia ${vig}`;
  const sepStyle = 'margin:18px 0 6px;padding:5px 10px;font-weight:700;font-size:10.5px;letter-spacing:.6px;border-radius:2px;color:#fff';
  const thCols = `<th>Cuenta</th><th>Guía</th><th style="min-width:140px;text-align:left">Concepto</th>
    <th>Presup.<br>Disponible</th>${mesesCols.map(m=>'<th>'+MN[m]+'</th>').join('')}`;

  // INGRESOS
  const ri = d.rubros_ing || [];
  let rowsIng = '';
  let gPD_ing=0, gMes_ing=new Array(nMes).fill(0);
  ri.filter(r=>!r.esGrupo).forEach(r => {
    const pd = esTrim ? getPresupDispIng(d,r.cod,trim) : (()=>{const ma=getModsAnioIng(d,r.cod,'adi')-getModsAnioIng(d,r.cod,'red')+getModsAnioIng(d,r.cod,'cre')-getModsAnioIng(d,r.cod,'cco');return Number(r.ini)+ma;})();
    const mesV = mesesCols.map(mn=>getMovimIngMes(d,r.cod,mn));
    gPD_ing+=pd;mesV.forEach((v,i)=>gMes_ing[i]+=v);
    rowsIng += `<tr><td>${r.cod}</td><td class="ctr">${r.guia||'—'}</td><td style="text-align:left">${r.con}</td>
      <td class="num fw-bold">${fmt(pd)}</td>
      ${mesV.map(v=>'<td class="num">'+(v?fmt(v):'—')+'</td>').join('')}</tr>`;
  });
  rowsIng += `<tr class="gtot"><td colspan="3">TOTAL INGRESOS</td><td class="num">${fmt(gPD_ing)}</td>
    ${gMes_ing.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}</tr>`;

  // EGRESOS
  const grupos = [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  let rowsEg = '';
  let gPD_eg=0, gMes_eg=new Array(nMes).fill(0);
  grupos.forEach(g => {
    const list = d.rubros.filter(r=>r.tipo===g.tipo && !r.esGrupo);
    if (!list.length) return;
    let sPD=0,sMes=new Array(nMes).fill(0);
    rowsEg += `<tr class="ghead"><td colspan="${4+nMes}">${g.label}</td></tr>`;
    list.forEach(r => {
      const pd = esTrim ? getPresupDisp(d,r.cod,trim) : (()=>{let ma=0;for(let tt=1;tt<=4;tt++){const m=getMods(d,r.cod,tt);ma+=Number(m.adi)-Number(m.red)+Number(m.cre)-Number(m.cco);}return Number(r.ini)+ma;})();
      const mesV = mesesCols.map(mn=>getGastosMes(d,r.cod,mn));
      sPD+=pd;mesV.forEach((v,i)=>sMes[i]+=v);
      rowsEg += `<tr><td>${r.cod}</td><td class="ctr">${r.guia||'—'}</td><td style="text-align:left">${r.con}</td>
        <td class="num">${fmt(pd)}</td>${mesV.map(v=>'<td class="num">'+(v>0?fmt(v):'—')+'</td>').join('')}</tr>`;
    });
    gPD_eg+=sPD;sMes.forEach((v,i)=>gMes_eg[i]+=v);
    rowsEg += `<tr class="sub"><td colspan="3">SUBTOTAL ${g.label}</td><td class="num">${fmt(sPD)}</td>
      ${sMes.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}</tr>`;
  });
  rowsEg += `<tr class="gtot"><td colspan="3">TOTAL EGRESOS</td><td class="num">${fmt(gPD_eg)}</td>
    ${gMes_eg.map(v=>'<td class="num">'+fmt(v)+'</td>').join('')}</tr>`;

  // SALDO ACUMULADO
  const saldoPresupIni = (d.rubros_ing||[]).filter(r=>!r.esGrupo).reduce((s,r)=>s+Number(r.ini||0),0);
  let saldoAcum = saldoPresupIni;
  if (esTrim && trim>1){
    for(let t2=1;t2<trim;t2++){
      MESES_TRIM[t2].forEach(mn => {
        const ingMn = (d.rubros_ing||[]).filter(r=>!r.esGrupo).reduce((s,r)=>s+getMovimIngMes(d,r.cod,mn),0);
        const gasMn = d.rubros.filter(r=>!r.esGrupo).reduce((s,r)=>s+getGastosMes(d,r.cod,mn),0);
        saldoAcum += ingMn - gasMn;
      });
    }
  }
  let acum = saldoAcum;
  const saldoMeses = gMes_ing.map((ing,i) => { acum += ing - gMes_eg[i]; return acum; });

  const saldoTable = `<table class="ti" style="margin-top:0;border-top:3px solid #1a5276"><tbody>
    <tr style="background:#e8f5e9"><td colspan="3" style="font-weight:700;color:#145e2c;font-size:10px">▲ TOTAL INGRESOS</td>
      <td class="num fw-bold" style="color:#145e2c">${fmt(gPD_ing)}</td>
      ${gMes_ing.map(v=>'<td class="num" style="color:#145e2c">'+(v>0?fmt(v):'—')+'</td>').join('')}</tr>
    <tr style="background:#fce4ec"><td colspan="3" style="font-weight:700;color:#b71c1c;font-size:10px">▼ TOTAL EGRESOS</td>
      <td class="num fw-bold" style="color:#b71c1c">${fmt(gPD_eg)}</td>
      ${gMes_eg.map(v=>'<td class="num" style="color:#b71c1c">'+(v>0?fmt(v):'—')+'</td>').join('')}</tr>
    <tr style="background:#1a5276;color:#fff;font-weight:800;font-size:11px">
      <td colspan="3">SALDO ACUMULADO <small style="font-weight:400;font-size:9px">(Ppto. Inicial: ${fmt(saldoPresupIni)})</small></td>
      <td class="num">—</td>
      ${saldoMeses.map(v=>'<td class="num '+(v<0?'saldo-neg':'')+'" style="color:'+(v<0?'#ffcdd2':'#fff')+'">'+fmt(v)+'</td>').join('')}</tr>
  </tbody></table>`;

  return _infHdr(d, 'PAC EJECUTADO — EJECUCIÓN MENSUAL DE CAJA', periodoLblPE) +
  `<div style="${sepStyle};background:#145e2c">▼ INGRESOS</div>
    <table class="ti"><thead><tr>${thCols}</tr></thead><tbody>${rowsIng}</tbody></table>
    <div style="${sepStyle};background:#1a5276;margin-top:20px">▼ EGRESOS</div>
    <table class="ti"><thead><tr>${thCols}</tr></thead><tbody>${rowsEg}</tbody></table>
    <div style="${sepStyle};background:#37474f;margin-top:20px">▼ RESUMEN DE CAJA — SALDO MES A MES</div>${saldoTable}`;
}

/* ══════════════════════════════════════════════════════════
   5. MODIFICACIONES PRESUPUESTALES — Egresos o Ingresos
══════════════════════════════════════════════════════════ */
function genModificaciones(d, trim, tipo){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const periodoLabel = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE` : 'ACUMULADO ANUAL';

  if (tipo === 'egresos'){
    const modsEg = d.mods_eg || [];
    const lista = esTrim ? modsEg.filter(e=>Number(e.trim)===trim).sort((a,b)=>a.fecha.localeCompare(b.fecha))
      : modsEg.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
    const tipoBadge = {
      adicion:'<span style="color:#1a7a3a;font-weight:700">Adición</span>',
      reduccion:'<span style="color:#c8960c;font-weight:700">Reducción</span>',
      credito:'<span style="color:#0056a6;font-weight:700">Crédito</span>',
      contracredito:'<span style="color:#8b0000;font-weight:700">Contracrédito</span>'
    };
    let totAdi=0,totRed=0,totCre=0,totCco=0;
    const rows = lista.length ? lista.map((e,i) => {
      const rb = d.rubros.find(r=>r.cod===e.cod);
      if(e.tipo==='adicion') totAdi+=Number(e.valor);
      else if(e.tipo==='reduccion') totRed+=Number(e.valor);
      else if(e.tipo==='credito') totCre+=Number(e.valor);
      else if(e.tipo==='contracredito') totCco+=Number(e.valor);
      return `<tr><td class="ctr">${i+1}</td><td>${e.fecha}</td><td>${e.acuerdo||'—'}</td>
        <td>${!esTrim?'T'+e.trim+' — ':''}${tipoBadge[e.tipo]||e.tipo}</td>
        <td><code style="font-size:10px">${e.cod}</code>${rb?'<br><small style="color:#555">'+rb.con+'</small>':''}</td>
        <td>${e.concepto||'—'}</td><td class="num">${fmt(e.valor)}</td></tr>`;
    }).join('') : '<tr><td colspan="7" class="ctr" style="color:#888;padding:10px">Sin modificaciones</td></tr>';

    const totRow = lista.length ? `<tr class="gtot"><td colspan="3">TOTALES</td><td></td><td></td>
      <td style="text-align:right;font-size:10px">Adi: ${fmt(totAdi)} | Red: ${fmt(totRed)} | Cré: ${fmt(totCre)} | Cco: ${fmt(totCco)}</td>
      <td class="num">${fmt(totAdi+totCre-totRed-totCco)}</td></tr>` : '';

    return _infHdr(d, 'MODIFICACIONES PRESUPUESTALES — EGRESOS', periodoLabel) +
    `<table class="ti"><thead>
      <tr><th>N°</th><th>Fecha</th><th>N° Acuerdo</th><th>Tipo Operación</th><th>Rubro</th><th>Concepto</th><th>Valor</th></tr>
    </thead><tbody>${rows}${totRow}</tbody></table>`;

  } else {
    // INGRESOS — Formato idéntico al de egresos (lista de registros individuales)
    const modsIng = d.mods_ing_form || [];
    const lista = esTrim ? modsIng.filter(e=>Number(e.trim)===trim).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''))
      : modsIng.slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
    const tipoBadge = {
      adicion:'<span style="color:#1a7a3a;font-weight:700">Adición</span>',
      reduccion:'<span style="color:#c8960c;font-weight:700">Reducción</span>',
      credito:'<span style="color:#0056a6;font-weight:700">Crédito</span>',
      contracredito:'<span style="color:#8b0000;font-weight:700">Contracrédito</span>'
    };
    let totAdi=0,totRed=0,totCre=0,totCco=0;
    const rows = lista.length ? lista.map((e,i) => {
      const rb = (d.rubros_ing||[]).find(r=>r.cod===e.cod);
      if(e.tipo==='adicion') totAdi+=Number(e.valor);
      else if(e.tipo==='reduccion') totRed+=Number(e.valor);
      else if(e.tipo==='credito') totCre+=Number(e.valor);
      else if(e.tipo==='contracredito') totCco+=Number(e.valor);
      return `<tr><td class="ctr">${i+1}</td><td>${e.fecha}</td><td>${e.acuerdo||'—'}</td>
        <td>${!esTrim?'T'+e.trim+' — ':''}${tipoBadge[e.tipo]||e.tipo}</td>
        <td><code style="font-size:10px">${e.cod}</code>${rb?'<br><small style="color:#555">'+rb.con+'</small>':''}</td>
        <td>${e.concepto||'—'}</td><td class="num">${fmt(e.valor)}</td></tr>`;
    }).join('') : '<tr><td colspan="7" class="ctr" style="color:#888;padding:10px">Sin modificaciones de ingresos</td></tr>';

    const totRow = lista.length ? `<tr class="gtot"><td colspan="3">TOTALES</td><td></td><td></td>
      <td style="text-align:right;font-size:10px">Adi: ${fmt(totAdi)} | Red: ${fmt(totRed)} | Cré: ${fmt(totCre)} | Cco: ${fmt(totCco)}</td>
      <td class="num">${fmt(totAdi+totCre-totRed-totCco)}</td></tr>` : '';

    return _infHdr(d, 'MODIFICACIONES PRESUPUESTALES — INGRESOS', periodoLabel) +
    `<table class="ti"><thead>
      <tr><th>N°</th><th>Fecha</th><th>N° Acuerdo</th><th>Tipo Operación</th><th>Rubro</th><th>Concepto</th><th>Valor</th></tr>
    </thead><tbody>${rows}${totRow}</tbody></table>`;
  }
}

/* ══════════════════════════════════════════════════════════
   6. RELACIÓN DE GASTOS — 18 columnas como el original
══════════════════════════════════════════════════════════ */
/* ── Helper: nombre del rubro a partir del código ── */
function _nombreRubro(d, cod){
  if(!cod) return '';
  const r = (d.rubros||[]).find(x=>x.cod===cod);
  return r ? r.con : '';
}

function genContratos(d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = d.config.vigencia || new Date().getFullYear();
  const cfg = d.config || {};
  const periodoLabel = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE — Vigencia ${vig}` : `Acumulado Anual — Vigencia ${vig}`;
  let cs = esTrim ? (d.contratos||[]).filter(c=>Number(c.trim)===trim) : [...(d.contratos||[])];
  cs = cs.sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  const tot = cs.reduce((s,c)=>s+Number(c.valor),0);
  const totNeto = cs.reduce((s,c)=>s+Number(c.neto_pagar||c.valor),0);

  // Buscar datos completos del contrato_full si existe
  function _fullData(c){
    if(!c.contrato_full_id) return {};
    return (d.contratos_full||[]).find(cf=>cf.id===c.contrato_full_id) || {};
  }

  const tl = {1:'T1 – Ene/Mar',2:'T2 – Abr/Jun',3:'T3 – Jul/Sep',4:'T4 – Oct/Dic'};
  let rows = cs.length ? cs.map((c,i)=>{
    const cf = _fullData(c);
    const banco = c.banco_pago || cf.banco_pago || '';
    const cuenta = c.cuenta_pago || cf.cuenta_pago || '';
    const op = c.num_op || cf.num_op || '';
    const neto = Number(c.neto_pagar) || Number(c.valor) || 0;
    const fuente = c.fuente || cf.fuente || '';
    const ue = cfg.unidad_ejecutora || '';
    return `<tr>
    <td class="ctr">${i+1}</td>
    <td>${c.comp||'—'}</td>
    <td>${c.fecha||''}</td>
    <td>${banco||'—'}</td><td>${cuenta||'—'}</td>
    <td style="text-align:left">${c.prov||''}</td>
    <td>${c.numdoc||'—'}</td>
    <td>${c.rp||'—'}</td>
    <td>${c.cdp||'—'}</td>
    <td>${op||'—'}</td>
    <td class="ctr">${vig}</td>
    <td style="text-align:left">${c.concepto||''}</td>
    <td class="num">${fmt(c.valor)}</td>
    <td class="num">${fmt(neto)}</td>
    <td>${c.cod_rubro}</td><td style="text-align:left;font-size:9px">${_nombreRubro(d,c.cod_rubro)}</td>
    <td>${fuente||'—'}</td>
    <td>${ue||'—'}</td>
  </tr>`;}).join('') : '<tr><td colspan="18" class="ctr">Sin registros</td></tr>';
  rows += `<tr class="gtot"><td colspan="12" style="text-align:right">TOTAL</td>
    <td class="num">${fmt(tot)}</td><td class="num">${fmt(totNeto)}</td><td colspan="4"></td></tr>`;

  // Encabezado del banco institucional
  const bancoInst = cfg.banco_1 ? `BANCO: 1 &nbsp;&nbsp; NOMBRE BANCO: ${cfg.banco_1} ${cfg.tipo_cuenta_1||''} ${cfg.cuenta_1||''}` : '';

  return _infHdr(d, 'RELACIÓN DE GASTOS', periodoLabel) +
  (bancoInst ? `<div style="text-align:center;font-size:11px;margin-bottom:6px"><b>${bancoInst}</b></div>` : '') +
  `<table class="ti" style="font-size:10px"><thead><tr>
    <th>#</th><th>#C.E.</th><th>Fecha</th>
    <th>Banco</th><th>#Cuenta</th>
    <th style="text-align:left">Beneficiario</th><th>NIT/Cédula</th>
    <th>#R.P.</th><th>#D.P.</th><th>#O.P.</th>
    <th>Vig.</th>
    <th style="text-align:left">Detalle</th>
    <th>Vr. Obligac.</th><th>Pago Neto</th>
    <th>Rubro</th><th style="text-align:left">Concepto Rubro</th>
    <th>Fuente</th><th>Unidad Ejecutora</th>
  </tr></thead><tbody>${rows}</tbody></table>`;
}

/* ══════════════════════════════════════════════════════════
   7. DOCUMENTOS EXPEDIDOS — CDPs, RPs, Egresos (Contratos + DIAN)
   Informe consolidado para análisis integral
══════════════════════════════════════════════════════════ */
function genDocumentosExpedidos(d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const periodoLabel = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE` : 'ACUMULADO ANUAL';
  const _fx = typeof _fixAnio === 'function' ? _fixAnio : (f=>f);

  /* ── Utilidad: mes de una fecha ISO → trimestre ── */
  function trimDeFecha(fecha){
    if(!fecha) return 0;
    const m = Number(String(fecha).split('-')[1]);
    for(const [t,meses] of Object.entries(MESES_TRIM)){
      if(meses.includes(m)) return Number(t);
    }
    return 0;
  }

  /* ── Nombre del rubro ── */
  function nombreRubro(cod){ return _nombreRubro(d, cod); }

  /* ══ SECCIÓN 1 — CDPs EXPEDIDOS ══ */
  let contratos = (d.contratos_full||[]).filter(c => c.cdp);
  if(esTrim) contratos = contratos.filter(c => trimDeFecha(_fx(c.fecha_cdp)) === trim);
  contratos = contratos.sort((a,b) => (_fx(a.fecha_cdp)||'').localeCompare(_fx(b.fecha_cdp)||''));

  let totCDP = 0;
  let rowsCDP = contratos.length ? contratos.map((c,i) => {
    const v = Number(c.valor)||0;
    totCDP += v;
    return `<tr ${i%2?'style="background:#F5F7FA"':''}>
      <td class="ctr" style="padding:5px">${i+1}</td>
      <td class="ctr fw-bold" style="padding:5px">${c.cdp||'—'}</td>
      <td style="padding:5px">${_fx(c.fecha_cdp)||'—'}</td>
      <td style="padding:5px">${c.numero||'—'}</td>
      <td style="text-align:left;padding:5px">${c.contratista_nombre||'—'}</td>
      <td style="padding:5px;color:#003D7A;font-weight:600">${c.rubro||'—'}</td>
      <td style="text-align:left;max-width:180px;font-size:9px;padding:5px">${nombreRubro(c.rubro)}</td>
      <td style="text-align:left;max-width:200px;font-size:9px;padding:5px">${c.objeto||'—'}</td>
      <td class="num" style="padding:5px">${fmt(v)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="9" class="ctr" style="color:#888;padding:10px">Sin CDPs expedidos</td></tr>';
  if(contratos.length){
    rowsCDP += `<tr style="background:#003D7A;color:#fff;font-weight:700"><td colspan="8" style="text-align:right;padding:6px 10px">TOTAL CDPs</td>
      <td class="num" style="padding:6px 10px">${fmt(totCDP)}</td></tr>`;
  }

  const _secHdr = 'background:#003D7A;color:#fff;text-align:left;padding:8px 10px;font-size:11px;letter-spacing:0.5px';
  const _thStyle = 'background:#E8EDF2;color:#003D7A;font-weight:700;padding:6px 8px;border-bottom:2px solid #003D7A;font-size:9px';
  const _trAlt = (i) => i%2===0 ? '' : 'style="background:#F5F7FA"';

  const tablaCDP = `<table class="ti" style="font-size:10px;border-collapse:collapse;border:1px solid #D0D7DE"><thead>
    <tr><th colspan="9" style="${_secHdr}">CERTIFICADOS DE DISPONIBILIDAD PRESUPUESTAL (CDP) — ${periodoLabel}</th></tr>
    <tr><th style="${_thStyle}">#</th><th style="${_thStyle}">N° CDP</th><th style="${_thStyle}">Fecha</th><th style="${_thStyle}">N° Contrato</th><th style="${_thStyle};text-align:left">Beneficiario</th>
      <th style="${_thStyle}">Rubro</th><th style="${_thStyle};text-align:left">Concepto Rubro</th><th style="${_thStyle};text-align:left">Objeto</th><th style="${_thStyle}">Valor</th></tr>
  </thead><tbody>${rowsCDP}</tbody></table>`;

  /* ══ SECCIÓN 2 — RPs EXPEDIDOS ══ */
  let contratosRP = (d.contratos_full||[]).filter(c => c.rp);
  if(esTrim) contratosRP = contratosRP.filter(c => trimDeFecha(_fx(c.fecha_rp)) === trim);
  contratosRP = contratosRP.sort((a,b) => (_fx(a.fecha_rp)||'').localeCompare(_fx(b.fecha_rp)||''));

  let totRP = 0;
  let rowsRP = contratosRP.length ? contratosRP.map((c,i) => {
    const v = Number(c.valor)||0;
    totRP += v;
    return `<tr ${i%2?'style="background:#F5F7FA"':''}>
      <td class="ctr" style="padding:5px">${i+1}</td>
      <td class="ctr fw-bold" style="padding:5px">${c.rp||'—'}</td>
      <td style="padding:5px">${_fx(c.fecha_rp)||'—'}</td>
      <td style="padding:5px">${c.cdp||'—'}</td>
      <td style="padding:5px">${c.numero||'—'}</td>
      <td style="text-align:left;padding:5px">${c.contratista_nombre||'—'}</td>
      <td style="padding:5px;color:#003D7A;font-weight:600">${c.rubro||'—'}</td>
      <td style="text-align:left;max-width:180px;font-size:9px;padding:5px">${_nombreRubro(d,c.rubro)}</td>
      <td style="text-align:left;max-width:200px;font-size:9px;padding:5px">${c.objeto||'—'}</td>
      <td class="num" style="padding:5px">${fmt(v)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="10" class="ctr" style="color:#888;padding:10px">Sin RPs expedidos</td></tr>';
  if(contratosRP.length){
    rowsRP += `<tr style="background:#003D7A;color:#fff;font-weight:700"><td colspan="9" style="text-align:right;padding:6px 10px">TOTAL RPs</td>
      <td class="num" style="padding:6px 10px">${fmt(totRP)}</td></tr>`;
  }

  const tablaRP = `<table class="ti" style="font-size:10px;margin-top:20px;border-collapse:collapse;border:1px solid #D0D7DE"><thead>
    <tr><th colspan="10" style="${_secHdr}">REGISTROS PRESUPUESTALES (RP) — ${periodoLabel}</th></tr>
    <tr><th style="${_thStyle}">#</th><th style="${_thStyle}">N° RP</th><th style="${_thStyle}">Fecha</th><th style="${_thStyle}">N° CDP</th><th style="${_thStyle}">N° Contrato</th><th style="${_thStyle};text-align:left">Beneficiario</th>
      <th style="${_thStyle}">Rubro</th><th style="${_thStyle};text-align:left">Concepto Rubro</th><th style="${_thStyle};text-align:left">Objeto</th><th style="${_thStyle}">Valor</th></tr>
  </thead><tbody>${rowsRP}</tbody></table>`;

  /* ══ SECCIÓN 3 — EGRESOS DE CONTRATOS ══ */
  let contratosEg = (d.contratos_full||[]).filter(c => c.num_egreso);
  if(esTrim) contratosEg = contratosEg.filter(c => trimDeFecha(_fx(c.fecha_egreso)) === trim);
  contratosEg = contratosEg.sort((a,b) => (_fx(a.fecha_egreso)||'').localeCompare(_fx(b.fecha_egreso)||''));

  let totEgCto = 0;
  let rowsEgCto = contratosEg.length ? contratosEg.map((c,i) => {
    const v = Number(c.valor)||0;
    const ret = Number(c.retencion_valor)||0;
    const neto = Number(c.neto_pagar)||0;
    totEgCto += v;
    return `<tr ${i%2?'style="background:#F5F7FA"':''}>
      <td class="ctr" style="padding:5px">${i+1}</td>
      <td class="ctr fw-bold" style="padding:5px">${c.num_egreso||'—'}</td>
      <td style="padding:5px">${_fx(c.fecha_egreso)||'—'}</td>
      <td style="padding:5px">${c.cdp||'—'}</td>
      <td style="padding:5px">${c.rp||'—'}</td>
      <td style="padding:5px">${c.numero||'—'}</td>
      <td style="text-align:left;padding:5px">${c.contratista_nombre||'—'}</td>
      <td style="padding:5px;color:#003D7A;font-weight:600">${c.rubro||'—'}</td>
      <td style="text-align:left;max-width:180px;font-size:9px;padding:5px">${_nombreRubro(d,c.rubro)}</td>
      <td class="num" style="padding:5px">${fmt(v)}</td>
      <td class="num" style="padding:5px">${ret>0?fmt(ret):'—'}</td>
      <td class="num" style="padding:5px">${ret>0?fmt(neto):'—'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="12" class="ctr" style="color:#888;padding:10px">Sin egresos de contratos</td></tr>';
  if(contratosEg.length){
    rowsEgCto += `<tr style="background:#003D7A;color:#fff;font-weight:700"><td colspan="9" style="text-align:right;padding:6px 10px">TOTAL EGRESOS CONTRATOS</td>
      <td class="num" style="padding:6px 10px">${fmt(totEgCto)}</td><td colspan="2" style="background:#003D7A"></td></tr>`;
  }

  const tablaEgCto = `<table class="ti" style="font-size:10px;margin-top:20px;border-collapse:collapse;border:1px solid #D0D7DE"><thead>
    <tr><th colspan="12" style="${_secHdr}">COMPROBANTES DE EGRESO — CONTRATOS — ${periodoLabel}</th></tr>
    <tr><th style="${_thStyle}">#</th><th style="${_thStyle}">N° Egreso</th><th style="${_thStyle}">Fecha</th><th style="${_thStyle}">CDP</th><th style="${_thStyle}">RP</th><th style="${_thStyle}">Contrato</th>
      <th style="${_thStyle};text-align:left">Beneficiario</th><th style="${_thStyle}">Rubro</th><th style="${_thStyle};text-align:left">Concepto Rubro</th><th style="${_thStyle}">Valor</th><th style="${_thStyle}">Retención</th><th style="${_thStyle}">Neto</th></tr>
  </thead><tbody>${rowsEgCto}</tbody></table>`;

  /* ══ SECCIÓN 4 — EGRESOS DIAN ══ */
  let pagosDian = (d.pagos_dian||[]).slice();
  if(esTrim) pagosDian = pagosDian.filter(p => trimDeFecha(p.fecha) === trim);
  pagosDian = pagosDian.sort((a,b) => (a.fecha||'').localeCompare(b.fecha||''));

  let totDian = 0;
  let rowsDian = pagosDian.length ? pagosDian.map((p,i) => {
    const v = Number(p.valor)||0;
    totDian += v;
    return `<tr ${i%2?'style="background:#F5F7FA"':''}>
      <td class="ctr" style="padding:5px">${i+1}</td>
      <td class="ctr fw-bold" style="padding:5px">${p.num_egreso||'—'}</td>
      <td style="padding:5px">${p.fecha||'—'}</td>
      <td style="text-align:left;padding:5px">${p.concepto||'—'}</td>
      <td style="padding:5px">${p.periodo||'—'}</td>
      <td style="text-align:left;padding:5px">${p.beneficiario||'—'}</td>
      <td style="padding:5px">${p.nit_beneficiario||'—'}</td>
      <td style="padding:5px;color:#003D7A;font-weight:600">${p.cuenta_contable||'—'}</td>
      <td style="text-align:left;font-size:9px;padding:5px">${p.nombre_cuenta||'—'}</td>
      <td class="num" style="padding:5px">${fmt(v)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="10" class="ctr" style="color:#888;padding:10px">Sin pagos DIAN</td></tr>';
  if(pagosDian.length){
    rowsDian += `<tr style="background:#003D7A;color:#fff;font-weight:700"><td colspan="9" style="text-align:right;padding:6px 10px">TOTAL EGRESOS DIAN</td>
      <td class="num" style="padding:6px 10px">${fmt(totDian)}</td></tr>`;
  }

  const tablaDian = `<table class="ti" style="font-size:10px;margin-top:20px;border-collapse:collapse;border:1px solid #D0D7DE"><thead>
    <tr><th colspan="10" style="${_secHdr}">COMPROBANTES DE EGRESO — DIAN / IMPUESTOS — ${periodoLabel}</th></tr>
    <tr><th style="${_thStyle}">#</th><th style="${_thStyle}">N° Egreso</th><th style="${_thStyle}">Fecha</th><th style="${_thStyle};text-align:left">Concepto</th><th style="${_thStyle}">Período</th>
      <th style="${_thStyle};text-align:left">Beneficiario</th><th style="${_thStyle}">NIT</th><th style="${_thStyle}">Cuenta</th><th style="${_thStyle};text-align:left">Nombre Cuenta</th><th style="${_thStyle}">Valor</th></tr>
  </thead><tbody>${rowsDian}</tbody></table>`;

  /* ══ RESUMEN GENERAL ══ */
  const totalGeneral = totCDP + totRP + totEgCto + totDian;
  const numDocs = contratos.length + contratosRP.length + contratosEg.length + pagosDian.length;
  const resumen = `<table class="ti" style="font-size:10px;margin-top:20px;max-width:620px;border-collapse:collapse;border:1px solid #D0D7DE"><thead>
    <tr><th colspan="3" style="${_secHdr}">RESUMEN GENERAL — ${periodoLabel}</th></tr>
    <tr><th style="${_thStyle};text-align:left;width:60%">Documento</th><th style="${_thStyle};width:15%">Cantidad</th><th style="${_thStyle};width:25%">Valor</th></tr>
  </thead><tbody>
    <tr><td style="text-align:left;padding:6px 10px">CDPs Expedidos</td><td class="ctr" style="padding:6px">${contratos.length}</td><td class="num" style="padding:6px 10px">${fmt(totCDP)}</td></tr>
    <tr style="background:#F5F7FA"><td style="text-align:left;padding:6px 10px">Registros Presupuestales (RP)</td><td class="ctr" style="padding:6px">${contratosRP.length}</td><td class="num" style="padding:6px 10px">${fmt(totRP)}</td></tr>
    <tr><td style="text-align:left;padding:6px 10px">Egresos — Contratos</td><td class="ctr" style="padding:6px">${contratosEg.length}</td><td class="num" style="padding:6px 10px">${fmt(totEgCto)}</td></tr>
    <tr style="background:#F5F7FA"><td style="text-align:left;padding:6px 10px">Egresos — DIAN / Impuestos</td><td class="ctr" style="padding:6px">${pagosDian.length}</td><td class="num" style="padding:6px 10px">${fmt(totDian)}</td></tr>
    <tr style="background:#003D7A;color:#fff;font-weight:700"><td style="text-align:left;padding:8px 10px">TOTAL DOCUMENTOS</td><td class="ctr" style="padding:8px">${numDocs}</td><td class="num" style="padding:8px 10px">${fmt(totalGeneral)}</td></tr>
  </tbody></table>`;

  return _infHdr(d, 'RELACIÓN DE DOCUMENTOS EXPEDIDOS', `Vigencia ${d.config.vigencia} — ${periodoLabel}`) +
    resumen + tablaCDP + tablaRP + tablaEgCto + tablaDian;
}

/* ══════════════════════════════════════════════════════════
   8b. BALANCE PRESUPUESTAL — Ingresos vs Egresos consolidado
══════════════════════════════════════════════════════════ */
function genBalancePresupuestal(d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = (d.config||{}).vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE — Vigencia ${vig}` : `Acumulado Anual — Vigencia ${vig}`;

  // ═══ INGRESOS ═══
  let ingIni=0, ingAdi=0, ingRed=0, ingDef=0, ingRec=0;
  const rowsIng = (d.rubros_ing||[]).filter(r=>!r.esGrupo).map(r => {
    const ini = Number(r.ini||0);
    let adi=0, red=0, pd=0, rec=0;
    if(esTrim){
      const mi = getModsIng(d,r.cod,trim);
      adi = Number(mi.adi)+Number(mi.cre);
      red = Number(mi.red)+Number(mi.cco);
      pd = getPresupDispIng(d,r.cod,trim);
      rec = getRecaudoEfectivoIng(d,r.cod,trim);
    } else {
      adi = getModsAnioIng(d,r.cod,'adi')+getModsAnioIng(d,r.cod,'cre');
      red = getModsAnioIng(d,r.cod,'red')+getModsAnioIng(d,r.cod,'cco');
      pd = ini+adi-red;
      rec = getRecaudoEfectivoIng(d,r.cod,0);
    }
    // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
    if(rec > pd && pd >= 0) rec = pd;
    ingIni+=ini; ingAdi+=adi; ingRed+=red; ingDef+=pd; ingRec+=rec;
    const pct = pd>0?(rec/pd*100).toFixed(1):'0.0';
    return `<tr>
      <td style="padding-left:8px"><code style="font-size:10px">${r.cod}</code></td>
      <td style="text-align:left">${r.con}</td>
      <td class="num">${fmt(ini)}</td>
      <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
      <td class="num fw-bold">${fmt(pd)}</td>
      <td class="num">${rec>0?fmt(rec):'—'}</td>
      <td class="ctr">${pct}%</td></tr>`;
  }).join('');

  // Seguridad en totales: recaudo no puede superar definitivo
  if(ingRec > ingDef && ingDef >= 0) ingRec = ingDef;
  const pctIngRec = ingDef>0?Math.min(100, ingRec/ingDef*100).toFixed(1):'0.0';

  // ═══ EGRESOS ═══
  let egIni=0, egAdi=0, egRed=0, egCre=0, egCco=0, egDef=0, egEjec=0, egComp=0;
  const rowsEg = d.rubros.filter(r=>!r.esGrupo).map(r => {
    const ini = Number(r.ini||0);
    let adi=0, red=0, cre=0, cco=0, pd=0, gas=0, comp=0;
    if(esTrim){
      const m=getMods(d,r.cod,trim);
      adi=Number(m.adi); red=Number(m.red); cre=Number(m.cre); cco=Number(m.cco);
      pd=getPresupDisp(d,r.cod,trim);
      gas=getGastos(d,r.cod,trim);
      comp=getCompromisoEgTrim(d,r.cod,trim);
    } else {
      for(let tt=1;tt<=4;tt++){
        const m=getMods(d,r.cod,tt);
        adi+=Number(m.adi); red+=Number(m.red); cre+=Number(m.cre); cco+=Number(m.cco);
        gas+=getGastos(d,r.cod,tt);
        comp+=getCompromisoEgTrim(d,r.cod,tt);
      }
      pd=ini+adi-red+cre-cco;
    }
    const saldo = pd-gas-comp;
    egIni+=ini; egAdi+=adi; egRed+=red; egCre+=cre; egCco+=cco; egDef+=pd; egEjec+=gas; egComp+=comp;
    const pct = pd>0?((gas+comp)/pd*100).toFixed(1):'0.0';
    return `<tr>
      <td style="padding-left:8px"><code style="font-size:10px">${r.cod}</code></td>
      <td style="text-align:left">${r.con}</td>
      <td class="num">${fmt(ini)}</td>
      <td class="num">${adi>0?fmt(adi):'—'}</td><td class="num">${red>0?fmt(red):'—'}</td>
      <td class="num fw-bold">${fmt(pd)}</td>
      <td class="num">${gas>0?fmt(gas):'—'}</td>
      <td class="num">${comp>0?fmt(comp):'—'}</td>
      <td class="num${saldo<0?' saldo-neg':''}">${fmt(saldo)}</td>
      <td class="ctr">${pct}%</td></tr>`;
  }).join('');

  const egSaldo = egDef-egEjec-egComp;
  const pctEgEjec = egDef>0?((egEjec+egComp)/egDef*100).toFixed(1):'0.0';

  // ═══ RESUMEN BALANCE ═══
  const diff = ingDef - egDef;
  const equilibrado = Math.abs(diff) < 1;
  const diffRec = ingRec - egEjec;

  const clsBalance = equilibrado ? 'background:#e8f5e9;color:#1b5e20' : 'background:#ffebee;color:#b71c1c';
  const iconBalance = equilibrado ? '✅' : '⚠️';

  return _infHdr(d, 'BALANCE PRESUPUESTAL', periodoLbl) +
  `<div style="margin:10px 0;padding:10px;border-radius:6px;font-size:11px;${clsBalance}">
    <strong>${iconBalance} ${equilibrado ? 'PRESUPUESTO EQUILIBRADO' : 'PRESUPUESTO DESBALANCEADO'}</strong>
    — Ingresos: <strong>${fmt(ingDef)}</strong> | Egresos: <strong>${fmt(egDef)}</strong>
    ${!equilibrado ? '| Diferencia: <strong style="color:#c62828">'+fmt(Math.abs(diff))+'</strong>' : ''}
  </div>

  <h6 style="color:#145e2c;margin:14px 0 6px;font-size:12px"><i class="bi bi-arrow-down-circle me-1"></i>INGRESOS</h6>
  <table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th style="text-align:left">Concepto</th>
    <th>Pres. Inicial</th><th>Adiciones</th><th>Reducciones</th><th>Pres. Definitivo</th>
    <th>Recaudado</th><th>% Recaudo</th>
  </tr></thead><tbody>${rowsIng}
  <tr class="gtot"><td colspan="2">TOTAL INGRESOS</td>
    <td class="num">${fmt(ingIni)}</td><td class="num">${fmt(ingAdi)}</td><td class="num">${fmt(ingRed)}</td>
    <td class="num">${fmt(ingDef)}</td><td class="num">${fmt(ingRec)}</td><td class="ctr">${pctIngRec}%</td></tr>
  </tbody></table>

  <h6 style="color:#1a237e;margin:18px 0 6px;font-size:12px"><i class="bi bi-arrow-up-circle me-1"></i>EGRESOS</h6>
  <table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th style="text-align:left">Concepto</th>
    <th>Pres. Inicial</th><th>Adiciones</th><th>Reducciones</th><th>Pres. Definitivo</th>
    <th>Ejecutado</th><th>Compromisos</th><th>Saldo</th><th>% Ejec</th>
  </tr></thead><tbody>${rowsEg}
  <tr class="gtot"><td colspan="2">TOTAL EGRESOS</td>
    <td class="num">${fmt(egIni)}</td><td class="num">${fmt(egAdi)}</td><td class="num">${fmt(egRed)}</td>
    <td class="num">${fmt(egDef)}</td><td class="num">${fmt(egEjec)}</td><td class="num">${fmt(egComp)}</td>
    <td class="num${egSaldo<0?' saldo-neg':''}">${fmt(egSaldo)}</td><td class="ctr">${pctEgEjec}%</td></tr>
  </tbody></table>

  <h6 style="color:#37474f;margin:18px 0 6px;font-size:12px"><i class="bi bi-balance-scale me-1"></i>CUADRO RESUMEN</h6>
  <table class="ti" style="font-size:11px;max-width:600px"><tbody>
    <tr style="background:#e8f5e9"><td style="padding:8px;font-weight:700;color:#145e2c">Total Presupuesto Ingresos</td>
      <td class="num" style="padding:8px;font-weight:700;color:#145e2c">${fmt(ingDef)}</td></tr>
    <tr style="background:#e3f2fd"><td style="padding:8px;font-weight:700;color:#1a237e">Total Presupuesto Egresos</td>
      <td class="num" style="padding:8px;font-weight:700;color:#1a237e">${fmt(egDef)}</td></tr>
    <tr style="background:${equilibrado?'#c8e6c9':'#ffcdd2'}"><td style="padding:8px;font-weight:800">DIFERENCIA (Superávit / Déficit)</td>
      <td class="num" style="padding:8px;font-weight:800;color:${diff>=0?'#1b5e20':'#b71c1c'}">${diff>=0?'+':''}${fmt(diff)}</td></tr>
    <tr><td colspan="2" style="height:10px;border:none"></td></tr>
    <tr style="background:#e8f5e9"><td style="padding:8px;font-weight:700;color:#145e2c">Total Recaudado</td>
      <td class="num" style="padding:8px;color:#145e2c">${fmt(ingRec)}</td></tr>
    <tr style="background:#e3f2fd"><td style="padding:8px;font-weight:700;color:#1a237e">Total Ejecutado (Pagos)</td>
      <td class="num" style="padding:8px;color:#1a237e">${fmt(egEjec)}</td></tr>
    <tr style="background:#fff3e0"><td style="padding:8px;font-weight:700;color:#e65100">Compromisos sin Pagar</td>
      <td class="num" style="padding:8px;color:#e65100">${fmt(egComp)}</td></tr>
    <tr style="background:#263238;color:#fff"><td style="padding:8px;font-weight:800">DISPONIBLE EN CAJA (Recaudado − Ejecutado)</td>
      <td class="num" style="padding:8px;font-weight:800;color:${diffRec>=0?'#a5d6a7':'#ef9a9a'}">${fmt(diffRec)}</td></tr>
  </tbody></table>`;
}

/* ══════════════════════════════════════════════════════════
   9. RESOLUCIÓN DE CIERRE PRESUPUESTAL — 7 Artículos
   (Formato completo: Ingresos, Egresos por grupo,
    Ejecución, Tesorería, Ctas x Pagar, Superávit, Firmas)
══════════════════════════════════════════════════════════ */
function genCierre(d){
  const c  = d.config;
  const ci = c.cierre || {};
  const vig = c.vigencia || '';

  // ── Formatear fecha ──
  function fmtFecha(iso){
    if(!iso) return '_____ de ____________ de _____';
    const [y,m,dy] = iso.split('-');
    const meses = ['','enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${Number(dy)} de ${meses[Number(m)]} de ${y}`;
  }
  const fechaRes  = fmtFecha(ci.fecha);
  const ciudadRes = ci.ciudad || c.ciudad || c.municipio || '';

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 1 — INGRESOS
  // ═══════════════════════════════════════════════════════
  const ri = (d.rubros_ing||[]).filter(r=>!r.esGrupo);
  let gIngSI=0,gIngAdi=0,gIngRed=0,gIngCre=0,gIngCco=0,gIngFin=0,gIngRec=0;
  let rowsIng = '';
  ri.forEach(r=>{
    const si = Number(r.ini)||0;
    let adi=0,red=0,cre=0,cco=0;
    [1,2,3,4].forEach(t=>{
      const mi = getModsIng(d,r.cod,t);
      adi+=Number(mi.adi); red+=Number(mi.red);
      cre+=Number(mi.cre); cco+=Number(mi.cco);
    });
    const fin = si+adi-red+cre-cco;
    const rec = fin; // FSE: ingresos se recaudan al 100% (SGP)
    gIngSI+=si;gIngAdi+=adi;gIngRed+=red;gIngCre+=cre;gIngCco+=cco;gIngFin+=fin;gIngRec+=rec;
    rowsIng+=`<tr>
      <td>${r.cod}</td><td class="ctr">${r.guia||'—'}</td>
      <td style="text-align:left">${r.con}</td>
      <td class="num">${fmt(si)}</td>
      <td class="num">${adi>0?fmt(adi):'—'}</td>
      <td class="num">${red>0?fmt(red):'—'}</td>
      <td class="num">${cre>0?fmt(cre):'—'}</td>
      <td class="num">${cco>0?fmt(cco):'—'}</td>
      <td class="num fw-bold">${fmt(fin)}</td>
      <td class="num fw-bold" style="color:var(--verde)">${fmt(fin)}</td>
    </tr>`;
  });
  rowsIng+=`<tr class="gtot"><td colspan="3">TOTAL INGRESOS</td>
    <td class="num">${fmt(gIngSI)}</td>
    <td class="num">${fmt(gIngAdi)}</td><td class="num">${fmt(gIngRed)}</td>
    <td class="num">${fmt(gIngCre)}</td><td class="num">${fmt(gIngCco)}</td>
    <td class="num">${fmt(gIngFin)}</td><td class="num">${fmt(gIngRec)}</td>
  </tr>`;
  const tablaIng=`<table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th>Guía MEN</th>
    <th style="min-width:160px;text-align:left">Concepto</th>
    <th>Inicial</th><th>Adición</th><th>Reducción</th>
    <th>Crédito</th><th>Contracrédito</th>
    <th>Presup. Final</th><th>Recaudado</th>
  </tr></thead><tbody>${rowsIng}</tbody></table>`;

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 2 — EGRESOS (agrupados por Func / Inversión)
  // ═══════════════════════════════════════════════════════
  const grupos=[{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  let gEgSI=0,gEgAdi=0,gEgRed=0,gEgCre=0,gEgCco=0,gEgFin=0,gEgGas=0;
  let rowsEg='';
  grupos.forEach(g=>{
    const list = d.rubros.filter(r=>r.tipo===g.tipo && !r.esGrupo);
    if(!list.length) return;
    let sSI=0,sAdi=0,sRed=0,sCre=0,sCco=0,sFin=0,sGas=0;
    rowsEg+=`<tr class="ghead"><td colspan="10">${g.label}</td></tr>`;
    list.forEach(r=>{
      const si=Number(r.ini)||0;
      let adi=0,red=0,cre=0,cco=0,gas=0;
      [1,2,3,4].forEach(t=>{
        const m=getMods(d,r.cod,t);
        adi+=Number(m.adi);red+=Number(m.red);cre+=Number(m.cre);cco+=Number(m.cco);
        gas+=getGastos(d,r.cod,t);
      });
      const fin=si+adi-red+cre-cco;
      sSI+=si;sAdi+=adi;sRed+=red;sCre+=cre;sCco+=cco;sFin+=fin;sGas+=gas;
      rowsEg+=`<tr>
        <td>${r.cod}</td><td class="ctr">${r.guia||'—'}</td>
        <td style="text-align:left">${r.con}</td>
        <td class="num">${fmt(si)}</td>
        <td class="num">${adi>0?fmt(adi):'—'}</td>
        <td class="num">${red>0?fmt(red):'—'}</td>
        <td class="num">${cre>0?fmt(cre):'—'}</td>
        <td class="num">${cco>0?fmt(cco):'—'}</td>
        <td class="num fw-bold">${fmt(fin)}</td>
        <td class="num" style="color:var(--rojo)">${gas>0?fmt(gas):'—'}</td>
      </tr>`;
    });
    gEgSI+=sSI;gEgAdi+=sAdi;gEgRed+=sRed;gEgCre+=sCre;gEgCco+=sCco;gEgFin+=sFin;gEgGas+=sGas;
    rowsEg+=`<tr class="sub"><td colspan="3">SUBTOTAL ${g.label}</td>
      <td class="num">${fmt(sSI)}</td>
      <td class="num">${fmt(sAdi)}</td><td class="num">${fmt(sRed)}</td>
      <td class="num">${fmt(sCre)}</td><td class="num">${fmt(sCco)}</td>
      <td class="num">${fmt(sFin)}</td><td class="num">${fmt(sGas)}</td>
    </tr>`;
  });
  rowsEg+=`<tr class="gtot"><td colspan="3">TOTAL EGRESOS</td>
    <td class="num">${fmt(gEgSI)}</td>
    <td class="num">${fmt(gEgAdi)}</td><td class="num">${fmt(gEgRed)}</td>
    <td class="num">${fmt(gEgCre)}</td><td class="num">${fmt(gEgCco)}</td>
    <td class="num">${fmt(gEgFin)}</td><td class="num">${fmt(gEgGas)}</td>
  </tr>`;
  const tablaEg=`<table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th>Guía MEN</th>
    <th style="min-width:140px;text-align:left">Concepto</th>
    <th>Inicial</th><th>Adición</th><th>Reducción</th>
    <th>Crédito</th><th>Contracrédito</th>
    <th>Presup. Final</th><th>Ejecutado</th>
  </tr></thead><tbody>${rowsEg}</tbody></table>`;

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 3 — EJECUCIÓN PRESUPUESTAL
  // ═══════════════════════════════════════════════════════
  const superavit = gIngRec - gEgGas;
  const pEjec     = gEgFin > 0 ? (gEgGas/gEgFin*100).toFixed(1) : '0.0';
  const pRecaudo  = gIngFin > 0 ? (gIngRec/gIngFin*100).toFixed(1) : '0.0';
  const tablaEjec=`<table class="ti" style="font-size:10px"><thead><tr>
    <th style="text-align:left">Concepto</th>
    <th>Presupuesto Final</th><th>Recaudado / Ejecutado</th>
    <th>Saldo</th><th>% Ejecución</th>
  </tr></thead><tbody>
    <tr>
      <td>INGRESOS (recaudado al 100%)</td>
      <td class="num">${fmt(gIngFin)}</td>
      <td class="num fw-bold" style="color:var(--verde)">${fmt(gIngFin)}</td>
      <td class="num">—</td>
      <td class="ctr fw-bold">100.0%</td>
    </tr>
    <tr>
      <td>EGRESOS</td>
      <td class="num">${fmt(gEgFin)}</td>
      <td class="num" style="color:var(--rojo)">${fmt(gEgGas)}</td>
      <td class="num ${(gEgFin-gEgGas)<0?'saldo-neg':''}">${fmt(gEgFin-gEgGas)}</td>
      <td class="ctr">${pEjec}%</td>
    </tr>
    <tr class="gtot">
      <td>SUPERÁVIT PRESUPUESTAL (Ingresos – Egresos ejecutados)</td>
      <td class="num"></td><td class="num"></td>
      <td class="num ${superavit<0?'saldo-neg':''}">${fmt(superavit)}</td>
      <td></td>
    </tr>
  </tbody></table>`;

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 4 — SALDOS DE TESORERÍA
  // ═══════════════════════════════════════════════════════
  let cuentas = ci.cuentas || [];
  // Si no hay cuentas de cierre, pre-cargar bancos de la config institucional
  if(!cuentas.length){
    cuentas = [];
    if(c.banco_1) cuentas.push({ banco: c.banco_1, tipo: c.tipo_cuenta_1||'Ahorros', numero: c.cuenta_1||'', saldo: 0 });
    if(c.banco_2) cuentas.push({ banco: c.banco_2, tipo: c.tipo_cuenta_2||'Ahorros', numero: c.cuenta_2||'', saldo: 0 });
    if(c.banco_3) cuentas.push({ banco: c.banco_3, tipo: c.tipo_cuenta_3||'Ahorros', numero: c.cuenta_3||'', saldo: 0 });
  }
  const totTesor = cuentas.reduce((s,x)=>s+Number(x.saldo||0),0);
  const rowsTes  = cuentas.length
    ? cuentas.map((x,i)=>`<tr>
        <td class="ctr">${i+1}</td>
        <td>${x.banco||'—'}</td>
        <td class="ctr">${x.tipo||'—'}</td>
        <td>${x.numero||'—'}</td>
        <td class="num">${fmt(Number(x.saldo||0))}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" class="ctr text-muted">Sin cuentas registradas — use el botón "Datos Cierre"</td></tr>`;
  const tablaTesor=`<table class="ti" style="font-size:10px"><thead><tr>
    <th>#</th><th>Banco</th><th>Tipo de Cuenta</th><th>N° Cuenta</th><th>Saldo</th>
  </tr></thead><tbody>
    ${rowsTes}
    <tr class="gtot"><td colspan="4" style="text-align:right">TOTAL TESORERÍA</td>
      <td class="num">${fmt(totTesor)}</td></tr>
  </tbody></table>`;

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 5 — CUENTAS POR PAGAR
  // ═══════════════════════════════════════════════════════
  const porPagar  = ci.por_pagar || [];
  const totPagar  = porPagar.reduce((s,p)=>s+Number(p.valor||0),0);
  const rowsPagar = porPagar.length
    ? porPagar.map((p,i)=>`<tr>
        <td class="ctr">${i+1}</td>
        <td>${p.concepto||'—'}</td>
        <td class="num">${fmt(Number(p.valor||0))}</td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="ctr text-muted">Sin cuentas por pagar registradas</td></tr>`;
  const tablaPagar=`<table class="ti" style="font-size:10px"><thead><tr>
    <th>#</th><th>Concepto</th><th>Valor</th>
  </tr></thead><tbody>
    ${rowsPagar}
    <tr class="gtot"><td colspan="2" style="text-align:right">TOTAL CUENTAS POR PAGAR</td>
      <td class="num">${fmt(totPagar)}</td></tr>
  </tbody></table>`;

  // ═══════════════════════════════════════════════════════
  // ARTÍCULO 6 — SUPERÁVIT / DÉFICIT FINANCIERO
  // ═══════════════════════════════════════════════════════
  const superFin   = totTesor - totPagar;
  const superLabel = superFin >= 0 ? 'SUPERÁVIT FINANCIERO' : 'DÉFICIT FINANCIERO';
  const superColor = superFin >= 0 ? 'var(--verde)' : 'var(--rojo)';

  // ═══════════════════════════════════════════════════════
  // ESTILOS DE LA RESOLUCIÓN
  // ═══════════════════════════════════════════════════════
  const style=`<style>
    .res-header{text-align:center;margin-bottom:18px;font-family:Arial,sans-serif}
    .res-header h4{font-size:14px;font-weight:700;text-transform:uppercase;margin:2px 0}
    .res-header p{font-size:11px;margin:2px 0}
    .res-art{margin:16px 0;font-family:Arial,sans-serif;font-size:11px;text-align:justify}
    .res-art .art-title{font-weight:700;text-transform:uppercase;margin-bottom:4px}
    .res-art .art-body{margin-left:0}
    .res-valores{display:flex;gap:24px;justify-content:center;margin:10px 0;font-size:11px}
    .res-val-box{text-align:center;border:1px solid #ccc;padding:8px 16px;border-radius:4px}
    .res-val-box .v-num{font-size:14px;font-weight:700;color:var(--azul)}
    .res-val-box .v-lbl{font-size:9px;text-transform:uppercase;color:#666}
    @media print{.no-print{display:none!important}.res-firmas{page-break-inside:avoid}}
  </style>`;

  // ═══════════════════════════════════════════════════════
  // ENSAMBLAR LA RESOLUCIÓN COMPLETA
  // ═══════════════════════════════════════════════════════
  const fundamento = ci.fundamento || 'Decreto 111 de 1996, Ley 715 de 2001';
  const numRes = ci.numero ? `No. ${ci.numero}` : 'No. ___';

  return `${style}
<div class="res-header">
  <p>${c.secretaria||'SECRETARÍA DE EDUCACIÓN'}</p>
  <h4>${c.institucion||'INSTITUCIÓN EDUCATIVA'}</h4>
  <p>NIT: ${c.nit||'—'}${c.dv?'-'+c.dv:''} &nbsp;|&nbsp; ${ciudadRes||'—'}</p>
  <hr style="border-top:2px solid #5d4037;margin:8px 0">
  <h4>RESOLUCIÓN RECTORAL ${numRes}</h4>
  <p style="font-size:11px">${fechaRes}</p>
  <p style="font-weight:700">POR LA CUAL SE HACE EL CIERRE PRESUPUESTAL DE LA VIGENCIA FISCAL ${vig}</p>
  <hr style="border-top:1px solid #5d4037;margin:8px 0">
</div>

<div class="res-art">
  <div class="art-body">
    <strong>EL RECTOR(A) DE LA ${(c.institucion||'INSTITUCIÓN EDUCATIVA').toUpperCase()}</strong><br><br>
    En uso de las atribuciones legales y en cumplimiento de lo dispuesto en el ${fundamento}, y demás normas concordantes sobre administración del presupuesto de las instituciones educativas;
  </div>
</div>

<div class="res-art" style="text-align:center;font-weight:700;font-size:12px;margin:8px 0">RESUELVE:</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 1°. ADOPTAR el resultado de la ejecución del Presupuesto de INGRESOS de la vigencia ${vig}, así:</div>
  <div class="art-body">${tablaIng}
    <p style="margin-top:6px">
      PARÁGRAFO: Los Ingresos de la vigencia ${vig} corresponden en su totalidad a transferencias del Sistema General de Participaciones (SGP) y demás fuentes reconocidas, recaudados en su totalidad por la institución. El total de Ingresos asciende a la suma de
      <strong>${fmt(gIngFin)}</strong> (${numALetras(gIngFin)}), equivalente al <strong>100%</strong> del presupuesto definitivo aprobado.
    </p>
  </div>
</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 2°. ADOPTAR el resultado de la ejecución del Presupuesto de EGRESOS de la vigencia ${vig}, así:</div>
  <div class="art-body">${tablaEg}
    <p style="margin-top:6px">
      PARÁGRAFO: El total de Egresos ejecutados durante la vigencia ${vig} asciende a la suma de
      <strong>${fmt(gEgGas)}</strong> (${numALetras(gEgGas)}), sobre un presupuesto final de
      <strong>${fmt(gEgFin)}</strong> (${numALetras(gEgFin)}), representando una ejecución del <strong>${pEjec}%</strong>.
    </p>
  </div>
</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 3°. DETERMINAR la ejecución presupuestal global de la vigencia ${vig}, así:</div>
  <div class="art-body">${tablaEjec}
    <p style="margin-top:6px">
      El superávit presupuestal resultante (Ingresos recaudados menos Egresos ejecutados) es de
      <strong style="color:${superavit>=0?'var(--verde)':'var(--rojo)'}">${fmt(superavit)}</strong>
      (${numALetras(Math.abs(superavit))}).
    </p>
  </div>
</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 4°. El saldo de TESORERÍA al cierre de la vigencia ${vig} es el siguiente:</div>
  <div class="art-body">${tablaTesor}
    <p style="margin-top:6px">
      Total en Tesorería: <strong>${fmt(totTesor)}</strong> (${numALetras(totTesor)}).
    </p>
  </div>
</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 5°. Las CUENTAS POR PAGAR al cierre de la vigencia ${vig} son:</div>
  <div class="art-body">${tablaPagar}
    <p style="margin-top:6px">
      Total Cuentas por Pagar: <strong>${fmt(totPagar)}</strong> (${numALetras(totPagar)}).
    </p>
  </div>
</div>

<div class="res-art">
  <div class="art-title">ARTÍCULO 6°. DETERMINAR el resultado financiero al cierre de la vigencia ${vig}:</div>
  <div class="art-body">
    <table class="ti" style="font-size:10px;max-width:400px"><tbody>
      <tr><td>Saldo en Tesorería</td><td class="num">${fmt(totTesor)}</td></tr>
      <tr><td>Menos: Cuentas por Pagar</td><td class="num">( ${fmt(totPagar)} )</td></tr>
      <tr class="gtot"><td>${superLabel}</td><td class="num" style="color:${superColor}">${fmt(Math.abs(superFin))}</td></tr>
    </tbody></table>
    <p style="margin-top:8px">
      El <strong>${superLabel}</strong> financiero al cierre de la vigencia ${vig} es de
      <strong style="color:${superColor}">${fmt(Math.abs(superFin))}</strong>
      (${numALetras(Math.abs(superFin))}).
    </p>
  </div>
</div>

<div class="res-art res-firmas" style="margin-top:32px">
  <div class="art-title">ARTÍCULO 7°. La presente Resolución rige a partir de la fecha de su expedición.</div>
  <div style="margin-top:8px">
    DADA EN ${ciudadRes.toUpperCase()||'___'}, a los ${fechaRes}.
  </div>
  <div class="row mt-5" style="font-size:11px">
    <div class="col-5 text-center">
      <div style="border-top:1px solid #000;margin-top:50px;padding-top:4px">
        <strong>RECTOR(A)</strong><br>${c.rector||'___________________'}<br>
        <span style="font-size:9px">C.C. ${c.idRector||'___________________'}</span>
      </div>
    </div>
    <div class="col-5 text-center">
      <div style="border-top:1px solid #000;margin-top:50px;padding-top:4px">
        <strong>TESORERO(A)</strong><br>&nbsp;<br>
        <span style="font-size:9px">C.C. ___________________</span>
      </div>
    </div>
  </div>
</div>`;
}
