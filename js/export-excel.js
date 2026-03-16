/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Exportación Excel (ExcelJS)
   Replica exacta de los informes HTML/PDF
══════════════════════════════════════════════════════════ */

/* ── Helpers de estilo ── */
const _XS = {
  hdrAzul:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF003D7A'}},
  hdrVerde:  {type:'pattern',pattern:'solid',fgColor:{argb:'FF1B5E20'}},
  hdrPurp:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF4A148C'}},
  hdrMarron: {type:'pattern',pattern:'solid',fgColor:{argb:'FF795548'}},
  hdrGris:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF37474F'}},
  grpNiv1:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF1A237E'}},
  grpNiv2:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF283593'}},
  grpNiv3:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF3949AB'}},
  grpNiv4:   {type:'pattern',pattern:'solid',fgColor:{argb:'FFE8EAF6'}},
  grpIngN1:  {type:'pattern',pattern:'solid',fgColor:{argb:'FF1B5E20'}},
  grpIngN2:  {type:'pattern',pattern:'solid',fgColor:{argb:'FF2E7D32'}},
  grpIngN3:  {type:'pattern',pattern:'solid',fgColor:{argb:'FF388E3C'}},
  grpIngN4:  {type:'pattern',pattern:'solid',fgColor:{argb:'FFC8E6C9'}},
  subFill:   {type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF9C4'}},
  totFill:   {type:'pattern',pattern:'solid',fgColor:{argb:'FF1A237E'}},
  fontWhite: {bold:true, color:{argb:'FFFFFFFF'}, size:9},
  fontBold:  {bold:true, size:9},
  fontNorm:  {size:9},
  numFmt:    '#,##0',
  pctFmt:    '0.0"%"',
  border:    {top:{style:'thin'},left:{style:'thin'},right:{style:'thin'},bottom:{style:'thin'}}
};

function _xHdr(ws, lastCol, d, titulo){
  _xPageSetup(ws);
  const c = d.config;
  const endCol = String.fromCharCode(64 + Math.min(lastCol, 26));
  ws.mergeCells(`A1:${endCol}1`);
  ws.getCell('A1').value = `${c.secretaria||'SECRETARÍA DE EDUCACIÓN'} — ${c.institucion||''}`;
  ws.getCell('A1').font = {bold:true, size:11}; ws.getCell('A1').alignment = {horizontal:'center'};
  ws.mergeCells(`A2:${endCol}2`);
  ws.getCell('A2').value = `NIT: ${c.nit||''}${c.dv?'-'+c.dv:''} — ${c.municipio||''}, ${c.departamento||''}`;
  ws.getCell('A2').font = {size:9}; ws.getCell('A2').alignment = {horizontal:'center'};
  ws.mergeCells(`A3:${endCol}3`);
  ws.getCell('A3').value = titulo;
  ws.getCell('A3').font = {bold:true, size:11}; ws.getCell('A3').alignment = {horizontal:'center'};
}

function _xCell(row, col, val, opts={}){
  const cell = row.getCell(col);
  cell.value = val;
  if(opts.fill) cell.fill = opts.fill;
  if(opts.font) cell.font = opts.font;
  if(opts.numFmt) cell.numFmt = opts.numFmt;
  if(opts.align) cell.alignment = opts.align;
  cell.border = _XS.border;
  return cell;
}

/* ── Configurar página para impresión: Carta, Horizontal, Ajustar a 1 página ── */
function _xPageSetup(ws){
  ws.pageSetup = {
    paperSize: 1,              // 1 = Letter (Carta)
    orientation: 'landscape',  // Horizontal
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,            // 0 = tantas páginas como necesite en alto
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
  };
  ws.properties.defaultRowHeight = 13;
}

/* ══════════════════════════════════════════════════════════ */

async function exportarInformeExcel(){
  const tipo = ($('inf-tipo')||{}).value || 'egresos';
  const trim = Number(($('inf-trim')||{}).value);
  const d = DB.load();
  const c = d.config;
  const esTrim = trim > 0;
  const TRIM_NOM = {0:'Acumulado Anual',1:'T1 Ene-Mar',2:'T2 Abr-Jun',3:'T3 Jul-Sep',4:'T4 Oct-Dic'};

  const wb = new ExcelJS.Workbook();
  wb.creator = 'FOSE Unified';
  wb.created = new Date();

  switch(tipo){
    case 'egresos':    _excelEgresos(wb, d, trim); break;
    case 'ingresos':   _excelIngresos(wb, d, trim); break;
    case 'pac':        _excelPAC(wb, d, trim); break;
    case 'pac-ejec':   _excelPACEjecutado(wb, d, trim); break;
    case 'mods-eg':    _excelModificaciones(wb, d, trim, 'egresos'); break;
    case 'mods-ing':   _excelModificaciones(wb, d, trim, 'ingresos'); break;
    case 'contratos':  _excelRelacionGastos(wb, d, trim); break;
    case 'cierre':     _excelCierre(wb, d); break;
    case 'documentos': _excelDocumentosExpedidos(wb, d, trim); break;
    case 'balance':      _excelBalance(wb, d, trim); break;
    case 'contraloria':  _excelContraloria(wb, d, trim); break;
    default:             _excelEgresos(wb, d, trim);
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tipo}_${(c.institucion||'inst').replace(/\s+/g,'_')}_${esTrim?'T'+trim:'Anual'}_${today()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Excel exportado');
}

/* ══════════════════════════════════════════════════════════
   1. EJECUCIÓN DE EGRESOS — Replica completa (19+ columnas)
══════════════════════════════════════════════════════════ */
function _excelEgresos(wb, d, trim){
  const ws = wb.addWorksheet('Egresos');
  const esTrim = trim > 0;
  const MESES_NOM = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const TRIM_NOM2 = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = d.config.vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM2[trim]} INFORME TRIMESTRAL DE ${vig}` : `VIGENCIA FISCAL ${vig}`;

  // Columnas: Cod | Concepto | SI | Adi | Red | Cre | Cco | PD | Mes1..MesN | TotalAcum | CompAcum | TotalComp | Saldo | PagPer | PagAcum | PorPagar | %
  const nCols = 8 + nMes + 7;
  _xHdr(ws, nCols, d, `INFORME DE EJECUCIÓN PRESUPUESTAL DE EGRESOS — ${periodoLbl}`);

  // Header row
  const hr = ws.getRow(5);
  const hdrs = ['Rub. Presup.','Identificación','Presup. Inicial','Adiciones','Reducciones','Créditos','Contracréditos','Presup. Definitivo'];
  mesesCols.forEach(m => hdrs.push(MESES_NOM[m]));
  hdrs.push('Total Acum.','Comp. Acum.','Total Comp.','Saldo Aprob.','Pagos Periodo','Pagos Acum.','Por Pagar','% Ejec.');
  hdrs.forEach((h,i) => _xCell(hr, i+1, h, {fill:_XS.hdrAzul, font:_XS.fontWhite, align:{horizontal:'center',wrapText:true}}));

  // Anchos
  const widths = [12,40,14,14,14,14,14,14];
  for(let i=0;i<nMes;i++) widths.push(13);
  widths.push(14,14,14,14,14,14,14,8);
  ws.columns = widths.map(w => ({width:w}));

  let r = 6;
  const grupos = [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  let gSI=0,gAdi=0,gRed=0,gCre=0,gCco=0,gPD=0,gMes=new Array(nMes).fill(0),gGas=0,gComp=0,gSaldo=0,gPagPer=0,gPagAcum=0;

  grupos.forEach(g => {
    const realRubros = d.rubros.filter(x => x.tipo === g.tipo);
    if(!realRubros.length) return;
    const realCodes = new Set(realRubros.map(x => x.cod));
    const vMap = new Map();
    realRubros.forEach(x => {
      const parts = x.cod.split('.');
      for(let len=1;len<parts.length;len++){
        const prefix = parts.slice(0,len).join('.');
        if(!realCodes.has(prefix) && !vMap.has(prefix))
          vMap.set(prefix, {cod:prefix, con:GRUPO_LABELS[prefix]||('Grupo '+prefix), ini:0, tipo:g.tipo, esGrupo:true, _isVirtual:true});
      }
    });
    const combinada = sortarRubros([...realRubros, ...Array.from(vMap.values())]);

    combinada.forEach(rb => {
      const _tieneHijas = d.rubros.some(x => x.tipo===g.tipo && !x.esGrupo && x.cod.startsWith(rb.cod+'.'));
      const isGrp = (rb._isVirtual || rb.esGrupo === true) && _tieneHijas;
      const n = Math.min(getNivel(rb.cod), 5);
      const row = ws.getRow(r);

      if(isGrp){
        const hijos = d.rubros.filter(x => x.tipo===g.tipo && !x.esGrupo && x.cod.startsWith(rb.cod+'.'));
        let pSI=0,pAdi=0,pRed=0,pCre=0,pCco=0,pPD=0,pCdpMes=new Array(nMes).fill(0),pCdpAcum=0,pCompAcum=0,pCompTotal=0,pSaldo=0,pPagPer=0,pPagAcum=0,pPorPagar=0;
        hijos.forEach(x => {
          let si2,adi2,red2,cre2,cco2,pd2,cdpM2,cdpAcum2,comp2,compTotal2,pagTrim2,pagAcum2;
          if(esTrim){
            const m2=getMods(d,x.cod,trim);
            si2=getSaldoInicial(d,x.cod,trim);adi2=Number(m2.adi);red2=Number(m2.red);
            cre2=Number(m2.cre);cco2=Number(m2.cco);pd2=getPresupDisp(d,x.cod,trim);
            cdpM2=mesesCols.map(mn=>getCdpMes(d,x.cod,mn));
            const cdpPrev2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCdpEgTrim(d,x.cod,t2),0):0;
            cdpAcum2=cdpPrev2+getCdpEgTrim(d,x.cod,trim);
            comp2=getCompromisoEgTrim(d,x.cod,trim);
            const compPrev2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCompromisoEgTrim(d,x.cod,t2),0):0;
            compTotal2=compPrev2+comp2;
            pagTrim2=getGastos(d,x.cod,trim);
            pagAcum2=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getGastos(d,x.cod,t2),0):0;
          } else {
            si2=Number(x.ini);adi2=0;red2=0;cre2=0;cco2=0;
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
          cdpM2.forEach((v,i)=>pCdpMes[i]+=v);pCdpAcum+=cdpAcum2;pCompAcum+=comp2;pCompTotal+=compTotal2;
          pSaldo+=esTrim?(pd2-comp2):(pd2-compTotal2);pPagPer+=pagTrim2;pPagAcum+=pagAcum2;
          pPorPagar+=Math.max(0,compTotal2-pagTrim2-pagAcum2);
        });
        const grpFills = [null,_XS.grpNiv1,_XS.grpNiv2,_XS.grpNiv3,_XS.grpNiv4];
        const fill = grpFills[n] || _XS.grpNiv4;
        const font = n<=3 ? {bold:true,color:{argb:'FFFFFFFF'},size:9} : {bold:true,size:9};
        _xCell(row,1,rb.cod,{fill,font});
        _xCell(row,2,(rb.con||'').toUpperCase(),{fill,font});
        const vals = [pSI,pAdi,pRed,pCre,pCco,pPD,...pCdpMes,pCdpAcum,pCompAcum,pCompTotal,pSaldo,pPagPer,pPagAcum,pPorPagar];
        vals.forEach((v,i) => _xCell(row,i+3,v,{fill,font,numFmt:_XS.numFmt}));
        _xCell(row,nCols,pPD>0?(pCompTotal/pPD*100):0,{fill,font,numFmt:_XS.pctFmt});
      } else {
        let si,adi,red,cre,cco,pd,cdpMes,cdpAcum,comp,compTotal,pagTrim,pagAcumPrev,porPagar;
        if(esTrim){
          const m=getMods(d,rb.cod,trim);
          si=getSaldoInicial(d,rb.cod,trim);adi=Number(m.adi);red=Number(m.red);
          cre=Number(m.cre);cco=Number(m.cco);pd=getPresupDisp(d,rb.cod,trim);
          cdpMes=mesesCols.map(mn=>getCdpMes(d,rb.cod,mn));
          const cdpPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCdpEgTrim(d,rb.cod,t2),0):0;
          cdpAcum=cdpPrev+getCdpEgTrim(d,rb.cod,trim);
          comp=getCompromisoEgTrim(d,rb.cod,trim);
          const compPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getCompromisoEgTrim(d,rb.cod,t2),0):0;
          compTotal=compPrev+comp;
          pagTrim=getGastos(d,rb.cod,trim);
          pagAcumPrev=trim>1?[1,2,3,4].filter(t2=>t2<trim).reduce((s,t2)=>s+getGastos(d,rb.cod,t2),0):0;
        } else {
          si=Number(rb.ini);adi=0;red=0;cre=0;cco=0;
          for(let tt=1;tt<=4;tt++){const m=getMods(d,rb.cod,tt);adi+=Number(m.adi);red+=Number(m.red);cre+=Number(m.cre);cco+=Number(m.cco);}
          pd=si+adi-red+cre-cco;
          cdpMes=mesesCols.map(mn=>getCdpMes(d,rb.cod,mn));
          cdpAcum=0;for(let tt=1;tt<=4;tt++)cdpAcum+=getCdpEgTrim(d,rb.cod,tt);
          compTotal=0;for(let tt=1;tt<=4;tt++)compTotal+=getCompromisoEgTrim(d,rb.cod,tt);
          comp=compTotal;
          pagTrim=0;for(let tt=1;tt<=4;tt++)pagTrim+=getGastos(d,rb.cod,tt);
          pagAcumPrev=0;
        }
        porPagar=Math.max(0,compTotal-pagTrim-pagAcumPrev);
        const saldo=esTrim ? (pd-comp) : (pd-compTotal);
        gSI+=si;gAdi+=adi;gRed+=red;gCre+=cre;gCco+=cco;gPD+=pd;
        cdpMes.forEach((v,i)=>gMes[i]+=v);gGas+=cdpAcum;gComp+=compTotal;gSaldo+=saldo;gPagPer+=pagTrim;gPagAcum+=pagAcumPrev;

        _xCell(row,1,rb.cod,{font:_XS.fontNorm});
        _xCell(row,2,rb.con,{font:_XS.fontNorm});
        const vals = [si,adi,red,cre,cco,pd,...cdpMes,cdpAcum,comp,compTotal,saldo,pagTrim,pagAcumPrev,porPagar];
        vals.forEach((v,i) => _xCell(row,i+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
        _xCell(row,nCols,pd>0?(compTotal/pd*100):0,{numFmt:_XS.pctFmt,font:_XS.fontNorm});
      }
      r++;
    });
  });

  // TOTALES
  const gPorPagar = Math.max(0, gComp - gPagPer - gPagAcum);
  const totRow = ws.getRow(r);
  _xCell(totRow,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRow,2,'TOTALES',{fill:_XS.totFill,font:_XS.fontWhite});
  const totVals = [gSI,gAdi,gRed,gCre,gCco,gPD,...gMes,gGas,gComp,gComp,gSaldo,gPagPer,gPagAcum,gPorPagar];
  totVals.forEach((v,i) => _xCell(totRow,i+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(totRow,nCols,gPD>0?(gComp/gPD*100):0,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.pctFmt});
}

/* ══════════════════════════════════════════════════════════
   2. EJECUCIÓN DE INGRESOS — Replica completa
══════════════════════════════════════════════════════════ */
function _excelIngresos(wb, d, trim){
  const ws = wb.addWorksheet('Ingresos');
  const esTrim = trim > 0;
  const MESES_NOM = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const TRIM_NOM2 = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const vig = d.config.vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM2[trim]} TRIMESTRE DE ${vig}` : `VIGENCIA FISCAL ${vig}`;

  // Cod | Concepto | SI | Adi | Red | PD | Mes1..MesN | Recaudos | Saldo | %
  const nCols = 6 + nMes + 3;
  _xHdr(ws, nCols, d, `INFORME DE EJECUCIÓN PRESUPUESTAL DE INGRESOS — ${periodoLbl}`);

  const hr = ws.getRow(5);
  const hdrs = ['Código','Descripción','Presup. Inicial','Adiciones','Reducciones','Presup. Definitivo'];
  mesesCols.forEach(m => hdrs.push(MESES_NOM[m]));
  hdrs.push('Recaudos','Saldo por Recaudar','% Recaudo');
  hdrs.forEach((h,i) => _xCell(hr, i+1, h, {fill:_XS.hdrVerde, font:_XS.fontWhite, align:{horizontal:'center',wrapText:true}}));

  const widths = [12,40,14,14,14,14];
  for(let i=0;i<nMes;i++) widths.push(13);
  widths.push(14,14,8);
  ws.columns = widths.map(w => ({width:w}));

  const ri = d.rubros_ing || [];
  const iRealCods = new Set(ri.map(x=>x.cod));
  const iVirtMap = new Map();
  ri.forEach(x => {
    const parts = x.cod.split('.');
    for(let len=1;len<parts.length;len++){
      const prefix=parts.slice(0,len).join('.');
      if(!iRealCods.has(prefix)&&!iVirtMap.has(prefix))
        iVirtMap.set(prefix,{cod:prefix,con:GRUPO_LABELS_ING[prefix]||('Grupo '+prefix),esGrupo:true,_isVirtual:true,ini:0});
    }
  });
  const iCombinada = sortarRubros([...ri,...Array.from(iVirtMap.values())]);

  let r = 6;
  let gSI=0,gAdi=0,gRed=0,gPD=0,gMes=new Array(nMes).fill(0),gRec=0,gSaldo=0;

  iCombinada.forEach(rb => {
    const _tieneHijasIng = (d.rubros_ing||[]).some(x => !x.esGrupo && x.cod.startsWith(rb.cod+'.'));
    const isGrp = (rb._isVirtual || rb.esGrupo===true) && _tieneHijasIng;
    const n = Math.min(getNivel(rb.cod),5);
    const row = ws.getRow(r);

    let si,adi,red,pd,mesV,rec,saldo;
    if(isGrp){
      const hijos = getHijosIng(d, rb.cod);
      si = hijos.reduce((s,x)=>s+getSaldoInicialIng(d,x.cod,esTrim?trim:1),0);
      if(esTrim){
        adi=hijos.reduce((s,x)=>{const m=getModsIng(d,x.cod,trim);return s+Number(m.adi)+Number(m.cre);},0);
        red=hijos.reduce((s,x)=>{const m=getModsIng(d,x.cod,trim);return s+Number(m.red)+Number(m.cco);},0);
      } else {
        adi=hijos.reduce((s,x)=>s+getModsAnioIng(d,x.cod,'adi')+getModsAnioIng(d,x.cod,'cre'),0);
        red=hijos.reduce((s,x)=>s+getModsAnioIng(d,x.cod,'red')+getModsAnioIng(d,x.cod,'cco'),0);
      }
      pd=si+adi-red;
      mesV=mesesCols.map(mn=>hijos.reduce((s,x)=>s+getMovimIngMes(d,x.cod,mn),0));
      rec=hijos.reduce((s,x)=>s+getRecaudoEfectivoIng(d,x.cod,esTrim?trim:0),0);
      // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
      if(rec > pd && pd >= 0) rec = pd;
      saldo=Math.max(0, pd-rec);
      const grpFills=[null,_XS.grpIngN1,_XS.grpIngN2,_XS.grpIngN3,_XS.grpIngN4];
      const fill=grpFills[n]||_XS.grpIngN4;
      const font=n<=3?{bold:true,color:{argb:'FFFFFFFF'},size:9}:{bold:true,size:9};
      _xCell(row,1,rb.cod,{fill,font});
      _xCell(row,2,(rb.con||'').toUpperCase(),{fill,font});
      [si,adi,red,pd,...mesV,rec,saldo].forEach((v,i)=>_xCell(row,i+3,v,{fill,font,numFmt:_XS.numFmt}));
      _xCell(row,nCols,pd>0?(rec/pd*100):0,{fill,font,numFmt:_XS.pctFmt});
    } else {
      if(esTrim){
        si=getSaldoInicialIng(d,rb.cod,trim);
        const mi=getModsIng(d,rb.cod,trim);
        adi=Number(mi.adi)+Number(mi.cre);red=Number(mi.red)+Number(mi.cco);
        pd=getPresupDispIng(d,rb.cod,trim);
      } else {
        si=Number(rb.ini);
        adi=getModsAnioIng(d,rb.cod,'adi')+getModsAnioIng(d,rb.cod,'cre');
        red=getModsAnioIng(d,rb.cod,'red')+getModsAnioIng(d,rb.cod,'cco');
        pd=si+adi-red;
      }
      mesV=mesesCols.map(mn=>getMovimIngMes(d,rb.cod,mn));
      rec=esTrim?getRecaudoEfectivoIng(d,rb.cod,trim):getRecaudoEfectivoIng(d,rb.cod,0);
      // Recaudo no puede superar el definitivo (reducciones son movimientos internos)
      if(rec > pd && pd >= 0) rec = pd;
      saldo=Math.max(0, pd-rec);
      gSI+=si;gAdi+=adi;gRed+=red;gPD+=pd;mesV.forEach((v,i)=>gMes[i]+=v);gRec+=rec;gSaldo+=saldo;
      _xCell(row,1,rb.cod,{font:_XS.fontNorm});
      _xCell(row,2,rb.con,{font:_XS.fontNorm});
      [si,adi,red,pd,...mesV,rec,saldo].forEach((v,i)=>_xCell(row,i+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
      _xCell(row,nCols,pd>0?(rec/pd*100):0,{numFmt:_XS.pctFmt,font:_XS.fontNorm});
    }
    r++;
  });

  // Seguridad en totales: recaudo no puede superar definitivo (reducciones son movidas internas)
  if(gRec > gPD && gPD >= 0) gRec = gPD;
  gSaldo = Math.max(0, gPD - gRec);
  const totRow = ws.getRow(r);
  _xCell(totRow,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRow,2,'TOTALES',{fill:_XS.totFill,font:_XS.fontWhite});
  [gSI,gAdi,gRed,gPD,...gMes,gRec,gSaldo].forEach((v,i)=>_xCell(totRow,i+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(totRow,nCols,gPD>0?Math.min(100,gRec/gPD*100):0,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.pctFmt});
}

/* ══════════════════════════════════════════════════════════
   3. PAC MENSUALIZADO — Egresos + Ingresos
══════════════════════════════════════════════════════════ */
function _excelPAC(wb, d, trim){
  const esTrim = trim > 0;
  const MN = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;

  const TRIM_NOM_PAC = {1:'T1 (Ene-Mar)',2:'T2 (Abr-Jun)',3:'T3 (Jul-Sep)',4:'T4 (Oct-Dic)'};
  const pacPeriodo = esTrim ? TRIM_NOM_PAC[trim] : 'Anual';
  // Egresos
  const wsE = wb.addWorksheet('PAC Egresos');
  const nColsE = esTrim ? 3+6+nMes+3 : 3+2+nMes+3;
  _xHdr(wsE, nColsE, d, `PLAN ANUAL MENSUALIZADO DE CAJA — EGRESOS — ${pacPeriodo}`);

  const hrE = wsE.getRow(5);
  const hdrsE = ['Cuenta','Guía','Concepto'];
  if(esTrim) hdrsE.push('Saldo Inicial','Adición','Reducción','Crédito','Contracréd.','Presup. Disp.');
  else hdrsE.push('Pres. Inicial','Presup. Def.');
  mesesCols.forEach(m => hdrsE.push(MN[m]));
  hdrsE.push('Total Ejec.','Saldo Final','%');
  hdrsE.forEach((h,i) => _xCell(hrE,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));

  let rE = 6;
  const grupos = [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}];
  let gSI=0,gPD=0,gMes=new Array(nMes).fill(0),gTot=0,gSF=0;

  grupos.forEach(g => {
    const list = d.rubros.filter(x=>x.tipo===g.tipo && !x.esGrupo);
    if(!list.length) return;
    const gRow = wsE.getRow(rE);
    for(let c=1;c<=nColsE;c++) _xCell(gRow,c,c===1?g.label:'',{fill:_XS.hdrGris,font:_XS.fontWhite});
    rE++;

    list.forEach(rb => {
      let si,adi,red,cre,cco,pd,mesV;
      if(esTrim){
        const m=getMods(d,rb.cod,trim);
        si=getSaldoInicial(d,rb.cod,trim);adi=Number(m.adi);red=Number(m.red);
        cre=Number(m.cre);cco=Number(m.cco);pd=getPresupDisp(d,rb.cod,trim);
        mesV=mesesCols.map(mn=>getGastosMes(d,rb.cod,mn));
      } else {
        si=Number(rb.ini);adi=0;red=0;cre=0;cco=0;
        for(let tt=1;tt<=4;tt++){const m=getMods(d,rb.cod,tt);adi+=Number(m.adi);red+=Number(m.red);cre+=Number(m.cre);cco+=Number(m.cco);}
        pd=si+adi-red+cre-cco;
        mesV=mesesCols.map(mn=>getGastosMes(d,rb.cod,mn));
      }
      const tot=mesV.reduce((a,b)=>a+b,0);const sf=pd-tot;
      gSI+=si;gPD+=pd;mesV.forEach((v,i)=>gMes[i]+=v);gTot+=tot;gSF+=sf;

      const row=wsE.getRow(rE);
      _xCell(row,1,rb.cod,{font:_XS.fontNorm});
      _xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
      _xCell(row,3,rb.con,{font:_XS.fontNorm});
      let col=4;
      if(esTrim) [si,adi,red,cre,cco,pd].forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
      else [si,pd].forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
      mesV.forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
      _xCell(row,col++,tot,{numFmt:_XS.numFmt,font:_XS.fontNorm});
      _xCell(row,col++,sf,{numFmt:_XS.numFmt,font:_XS.fontNorm});
      _xCell(row,col,pd>0?(tot/pd*100):0,{numFmt:_XS.pctFmt,font:_XS.fontNorm});
      rE++;
    });
  });

  const totRowE=wsE.getRow(rE);
  _xCell(totRowE,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRowE,2,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRowE,3,'TOTAL EGRESOS',{fill:_XS.totFill,font:_XS.fontWhite});
  let colT=4;
  if(esTrim) [gSI,0,0,0,0,gPD].forEach(v=>{_xCell(totRowE,colT++,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});});
  else [gSI,gPD].forEach(v=>{_xCell(totRowE,colT++,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});});
  gMes.forEach(v=>{_xCell(totRowE,colT++,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});});
  _xCell(totRowE,colT++,gTot,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  _xCell(totRowE,colT++,gSF,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  _xCell(totRowE,colT,gPD>0?(gTot/gPD*100):0,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.pctFmt});

  // Ingresos (segunda hoja)
  const wsI = wb.addWorksheet('PAC Ingresos');
  _xHdr(wsI, nColsE, d, `PLAN ANUAL MENSUALIZADO DE CAJA — INGRESOS — ${pacPeriodo}`);
  const hrI = wsI.getRow(5);
  hdrsE.forEach((h,i) => _xCell(hrI,i+1,h,{fill:_XS.hdrVerde,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));

  let rI = 6;
  const ri = d.rubros_ing || [];
  ri.filter(x=>!x.esGrupo).forEach(rb => {
    let si,adi,red,cre,cco,pd,mesV;
    if(esTrim){
      si=getSaldoInicialIng(d,rb.cod,trim);
      const mi=getModsIng(d,rb.cod,trim);
      adi=Number(mi.adi);red=Number(mi.red);cre=Number(mi.cre);cco=Number(mi.cco);
      pd=getPresupDispIng(d,rb.cod,trim);
    } else {
      si=Number(rb.ini);
      adi=getModsAnioIng(d,rb.cod,'adi');red=getModsAnioIng(d,rb.cod,'red');
      cre=getModsAnioIng(d,rb.cod,'cre');cco=getModsAnioIng(d,rb.cod,'cco');
      pd=si+adi-red+cre-cco;
    }
    mesV=mesesCols.map(mn=>getMovimIngMes(d,rb.cod,mn));
    const tot=mesV.reduce((a,b)=>a+b,0);
    const row=wsI.getRow(rI);
    _xCell(row,1,rb.cod,{font:_XS.fontNorm});
    _xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
    _xCell(row,3,rb.con,{font:_XS.fontNorm});
    let col=4;
    if(esTrim) [si,adi,red,cre,cco,pd].forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
    else [si,pd].forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
    mesV.forEach(v=>{_xCell(row,col++,v,{numFmt:_XS.numFmt,font:_XS.fontNorm});});
    _xCell(row,col++,tot,{numFmt:_XS.numFmt,font:_XS.fontNorm});
    _xCell(row,col++,pd-tot,{numFmt:_XS.numFmt,font:_XS.fontNorm});
    _xCell(row,col,pd>0?(tot/pd*100):0,{numFmt:_XS.pctFmt,font:_XS.fontNorm});
    rI++;
  });
}

/* ══════════════════════════════════════════════════════════
   4. PAC EJECUTADO — Ingresos vs Egresos con saldo acumulado
══════════════════════════════════════════════════════════ */
function _excelPACEjecutado(wb, d, trim){
  const esTrim = trim > 0;
  const MN = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const mesesCols = esTrim ? MESES_TRIM[trim] : [1,2,3,4,5,6,7,8,9,10,11,12];
  const nMes = mesesCols.length;
  const nCols = 4 + nMes;

  const ws = wb.addWorksheet('PAC Ejecutado');
  const TRIM_NOM_PE = {1:'T1 (Ene-Mar)',2:'T2 (Abr-Jun)',3:'T3 (Jul-Sep)',4:'T4 (Oct-Dic)'};
  _xHdr(ws, nCols, d, `PAC EJECUTADO — INGRESOS vs EGRESOS — ${esTrim ? TRIM_NOM_PE[trim] : 'Anual'}`);

  const hr = ws.getRow(5);
  const hdrs = ['Cuenta','Guía','Concepto','Presup. Disp.'];
  mesesCols.forEach(m => hdrs.push(MN[m]));
  hdrs.forEach((h,i) => _xCell(hr,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));

  let r = 6;
  // Ingresos
  const sepIng = ws.getRow(r);
  for(let c=1;c<=nCols;c++) _xCell(sepIng,c,c===1?'INGRESOS':'',{fill:_XS.hdrVerde,font:_XS.fontWhite});
  r++;
  let gPD_ing=0, gMes_ing=new Array(nMes).fill(0);
  (d.rubros_ing||[]).filter(x=>!x.esGrupo).forEach(rb => {
    const pd=esTrim?getPresupDispIng(d,rb.cod,trim):(()=>{const ma=getModsAnioIng(d,rb.cod,'adi')-getModsAnioIng(d,rb.cod,'red')+getModsAnioIng(d,rb.cod,'cre')-getModsAnioIng(d,rb.cod,'cco');return Number(rb.ini)+ma;})();
    const mesV=mesesCols.map(mn=>getMovimIngMes(d,rb.cod,mn));
    gPD_ing+=pd;mesV.forEach((v,i)=>gMes_ing[i]+=v);
    const row=ws.getRow(r);
    _xCell(row,1,rb.cod,{font:_XS.fontNorm});_xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
    _xCell(row,3,rb.con,{font:_XS.fontNorm});_xCell(row,4,pd,{numFmt:_XS.numFmt,font:_XS.fontNorm});
    mesV.forEach((v,i)=>_xCell(row,5+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    r++;
  });
  const totIng=ws.getRow(r);
  _xCell(totIng,1,'',{fill:_XS.hdrVerde,font:_XS.fontWhite});_xCell(totIng,2,'',{fill:_XS.hdrVerde,font:_XS.fontWhite});
  _xCell(totIng,3,'TOTAL INGRESOS',{fill:_XS.hdrVerde,font:_XS.fontWhite});
  _xCell(totIng,4,gPD_ing,{fill:_XS.hdrVerde,font:_XS.fontWhite,numFmt:_XS.numFmt});
  gMes_ing.forEach((v,i)=>_xCell(totIng,5+i,v,{fill:_XS.hdrVerde,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  r++;

  // Egresos
  const sepEg = ws.getRow(r);
  for(let c=1;c<=nCols;c++) _xCell(sepEg,c,c===1?'EGRESOS':'',{fill:_XS.hdrAzul,font:_XS.fontWhite});
  r++;
  let gPD_eg=0, gMes_eg=new Array(nMes).fill(0);
  [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}].forEach(g => {
    const list=d.rubros.filter(x=>x.tipo===g.tipo&&!x.esGrupo);
    if(!list.length)return;
    list.forEach(rb => {
      const pd=esTrim?getPresupDisp(d,rb.cod,trim):(()=>{let ma=0;for(let tt=1;tt<=4;tt++){const m=getMods(d,rb.cod,tt);ma+=Number(m.adi)-Number(m.red)+Number(m.cre)-Number(m.cco);}return Number(rb.ini)+ma;})();
      const mesV=mesesCols.map(mn=>getGastosMes(d,rb.cod,mn));
      gPD_eg+=pd;mesV.forEach((v,i)=>gMes_eg[i]+=v);
      const row=ws.getRow(r);
      _xCell(row,1,rb.cod,{font:_XS.fontNorm});_xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
      _xCell(row,3,rb.con,{font:_XS.fontNorm});_xCell(row,4,pd,{numFmt:_XS.numFmt,font:_XS.fontNorm});
      mesV.forEach((v,i)=>_xCell(row,5+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
      r++;
    });
  });
  const totEg=ws.getRow(r);
  _xCell(totEg,1,'',{fill:_XS.hdrAzul,font:_XS.fontWhite});_xCell(totEg,2,'',{fill:_XS.hdrAzul,font:_XS.fontWhite});
  _xCell(totEg,3,'TOTAL EGRESOS',{fill:_XS.hdrAzul,font:_XS.fontWhite});
  _xCell(totEg,4,gPD_eg,{fill:_XS.hdrAzul,font:_XS.fontWhite,numFmt:_XS.numFmt});
  gMes_eg.forEach((v,i)=>_xCell(totEg,5+i,v,{fill:_XS.hdrAzul,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  r++;

  // Saldo acumulado
  const saldoPresupIni=(d.rubros_ing||[]).filter(x=>!x.esGrupo).reduce((s,x)=>s+Number(x.ini||0),0);
  let saldoAcum=saldoPresupIni;
  if(esTrim&&trim>1){
    for(let t2=1;t2<trim;t2++){
      MESES_TRIM[t2].forEach(mn=>{
        const ingMn=(d.rubros_ing||[]).filter(x=>!x.esGrupo).reduce((s,x)=>s+getMovimIngMes(d,x.cod,mn),0);
        const gasMn=d.rubros.filter(x=>!x.esGrupo).reduce((s,x)=>s+getGastosMes(d,x.cod,mn),0);
        saldoAcum+=ingMn-gasMn;
      });
    }
  }
  let acum=saldoAcum;
  const saldoRow=ws.getRow(r);
  _xCell(saldoRow,1,'',{fill:_XS.hdrGris,font:_XS.fontWhite});_xCell(saldoRow,2,'',{fill:_XS.hdrGris,font:_XS.fontWhite});
  _xCell(saldoRow,3,`SALDO ACUMULADO (Ini: ${fmt(saldoPresupIni)})`,{fill:_XS.hdrGris,font:_XS.fontWhite});
  _xCell(saldoRow,4,'',{fill:_XS.hdrGris,font:_XS.fontWhite});
  gMes_ing.forEach((ing,i)=>{
    acum+=ing-gMes_eg[i];
    _xCell(saldoRow,5+i,acum,{fill:_XS.hdrGris,font:_XS.fontWhite,numFmt:_XS.numFmt});
  });
}

/* ══════════════════════════════════════════════════════════
   5. MODIFICACIONES PRESUPUESTALES
══════════════════════════════════════════════════════════ */
function _excelModificaciones(wb, d, trim, tipo){
  const esTrim = trim > 0;
  const TRIM_NOM2 = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const periodoLabel = esTrim ? `${TRIM_NOM2[trim]} TRIMESTRE` : 'ACUMULADO ANUAL';

  if(tipo === 'egresos'){
    const ws = wb.addWorksheet('Modif. Egresos');
    _xHdr(ws, 7, d, `MODIFICACIONES PRESUPUESTALES — EGRESOS — ${periodoLabel}`);
    const hr=ws.getRow(5);
    ['N°','Fecha','N° Acuerdo','Tipo','Rubro / Concepto','Detalle','Valor'].forEach((h,i)=>
      _xCell(hr,i+1,h,{fill:_XS.hdrMarron,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
    ws.columns=[{width:5},{width:12},{width:16},{width:16},{width:40},{width:30},{width:16}];

    const modsEg = d.mods_eg || [];
    const lista = esTrim ? modsEg.filter(e=>Number(e.trim)===trim).sort((a,b)=>a.fecha.localeCompare(b.fecha))
      : modsEg.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
    const tipoNom={adicion:'Adición',reduccion:'Reducción',credito:'Crédito',contracredito:'Contracrédito'};
    let r=6,totAdi=0,totRed=0,totCre=0,totCco=0;
    lista.forEach((e,i)=>{
      const rb=d.rubros.find(x=>x.cod===e.cod);
      if(e.tipo==='adicion')totAdi+=Number(e.valor);
      else if(e.tipo==='reduccion')totRed+=Number(e.valor);
      else if(e.tipo==='credito')totCre+=Number(e.valor);
      else if(e.tipo==='contracredito')totCco+=Number(e.valor);
      const row=ws.getRow(r);
      _xCell(row,1,i+1,{font:_XS.fontNorm});_xCell(row,2,e.fecha,{font:_XS.fontNorm});
      _xCell(row,3,e.acuerdo||'',{font:_XS.fontNorm});
      _xCell(row,4,(!esTrim?'T'+e.trim+' ':'')+tipoNom[e.tipo]||e.tipo,{font:_XS.fontNorm});
      _xCell(row,5,e.cod+(rb?' — '+rb.con:''),{font:_XS.fontNorm});
      _xCell(row,6,e.concepto||'',{font:_XS.fontNorm});
      _xCell(row,7,Number(e.valor),{numFmt:_XS.numFmt,font:_XS.fontNorm});
      r++;
    });
    if(lista.length){
      const totRow=ws.getRow(r);
      _xCell(totRow,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
      for(let c=2;c<=5;c++)_xCell(totRow,c,'',{fill:_XS.totFill,font:_XS.fontWhite});
      _xCell(totRow,6,`Adi:${fmt(totAdi)} Red:${fmt(totRed)} Cré:${fmt(totCre)} Cco:${fmt(totCco)}`,{fill:_XS.totFill,font:_XS.fontWhite});
      _xCell(totRow,7,totAdi+totCre-totRed-totCco,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
    }
  } else {
    // Ingresos
    const ws = wb.addWorksheet('Modif. Ingresos');
    _xHdr(ws, 8, d, `MODIFICACIONES PRESUPUESTALES — INGRESOS — ${periodoLabel}`);
    const hr=ws.getRow(5);
    ['Cuenta','Guía','Concepto','Adición','Reducción','Crédito','Contracréd.','Neto'].forEach((h,i)=>
      _xCell(hr,i+1,h,{fill:_XS.hdrVerde,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
    ws.columns=[{width:12},{width:8},{width:40},{width:14},{width:14},{width:14},{width:14},{width:14}];

    let r=6,gAdi=0,gRed=0,gCre=0,gCco=0;
    (d.rubros_ing||[]).forEach(rb=>{
      let adi,red,cre,cco;
      if(rb.esGrupo){
        if(esTrim){adi=getModGrupoIng(d,rb.cod,'adi',trim);red=getModGrupoIng(d,rb.cod,'red',trim);
          cre=getModGrupoIng(d,rb.cod,'cre',trim);cco=getModGrupoIng(d,rb.cod,'cco',trim);}
        else{adi=getModGrupoAnioIng(d,rb.cod,'adi');red=getModGrupoAnioIng(d,rb.cod,'red');
          cre=getModGrupoAnioIng(d,rb.cod,'cre');cco=getModGrupoAnioIng(d,rb.cod,'cco');}
        const row=ws.getRow(r);
        row.font={bold:true,size:9};
        _xCell(row,1,rb.cod,{fill:_XS.subFill,font:_XS.fontBold});
        _xCell(row,2,'',{fill:_XS.subFill,font:_XS.fontBold});
        _xCell(row,3,rb.con,{fill:_XS.subFill,font:_XS.fontBold});
        [adi,red,cre,cco,adi-red+cre-cco].forEach((v,i)=>_xCell(row,4+i,v,{fill:_XS.subFill,font:_XS.fontBold,numFmt:_XS.numFmt}));
      } else {
        if(esTrim){const mi=getModsIng(d,rb.cod,trim);adi=Number(mi.adi);red=Number(mi.red);cre=Number(mi.cre);cco=Number(mi.cco);}
        else{adi=getModsAnioIng(d,rb.cod,'adi');red=getModsAnioIng(d,rb.cod,'red');cre=getModsAnioIng(d,rb.cod,'cre');cco=getModsAnioIng(d,rb.cod,'cco');}
        gAdi+=adi;gRed+=red;gCre+=cre;gCco+=cco;
        const row=ws.getRow(r);
        _xCell(row,1,rb.cod,{font:_XS.fontNorm});_xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
        _xCell(row,3,rb.con,{font:_XS.fontNorm});
        [adi,red,cre,cco,adi-red+cre-cco].forEach((v,i)=>_xCell(row,4+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
      }
      r++;
    });
    const totRow=ws.getRow(r);
    for(let c=1;c<=3;c++)_xCell(totRow,c,c===3?'TOTAL INGRESOS':'',{fill:_XS.totFill,font:_XS.fontWhite});
    [gAdi,gRed,gCre,gCco,gAdi-gRed+gCre-gCco].forEach((v,i)=>_xCell(totRow,4+i,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  }
}

/* ══════════════════════════════════════════════════════════
   6. RELACIÓN DE GASTOS — 18 columnas
══════════════════════════════════════════════════════════ */
function _excelRelacionGastos(wb, d, trim){
  const ws = wb.addWorksheet('Relación Gastos');
  const esTrim = trim > 0;
  const nCols = 19;
  const TRIM_NOM = {1:'Trimestre 1 (Ene-Mar)',2:'Trimestre 2 (Abr-Jun)',3:'Trimestre 3 (Jul-Sep)',4:'Trimestre 4 (Oct-Dic)'};
  const periodoTxt = esTrim ? TRIM_NOM[trim] : 'Acumulado Anual';
  _xHdr(ws, nCols, d, `RELACIÓN DE GASTOS — ${periodoTxt} — Vigencia ${d.config.vigencia||''}`);

  const hr=ws.getRow(5);
  ['#','Trim.','Fecha','Tipo Doc.','N° Doc.','Fecha CDP','N° CDP','Fecha RP','N° RP','Comp.',
   'Concepto','Proveedor','Rubro','Concepto Rubro','Fecha Contrato','N° Contrato','Valor','Pub.','Cont.'].forEach((h,i)=>
    _xCell(hr,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws.columns=[{width:4},{width:10},{width:11},{width:8},{width:12},{width:11},{width:10},{width:11},{width:10},{width:8},
    {width:35},{width:25},{width:14},{width:30},{width:11},{width:12},{width:15},{width:5},{width:5}];

  let cs = esTrim ? (d.contratos||[]).filter(c=>Number(c.trim)===trim) : [...(d.contratos||[])];
  cs = cs.sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  const tl={1:'T1',2:'T2',3:'T3',4:'T4'};

  let r=6,tot=0;
  cs.forEach((c,i)=>{
    tot+=Number(c.valor);
    const row=ws.getRow(r);
    const vals=[i+1,tl[c.trim]||'T'+c.trim,c.fecha||'',c.tipodoc||'',c.numdoc||'',
      c.fecha_cdp||'',c.cdp||'',c.fecha_rp||'',c.rp||'',c.comp||'',
      c.concepto||'',c.prov||'',c.cod_rubro||'',_nombreRubro(d,c.cod_rubro),c.fecha_contrato||'',c.ncon||'',
      Number(c.valor)||0,c.pub?'SÍ':'NO',c.cont?'SÍ':'NO'];
    vals.forEach((v,j)=>{
      const opts={font:_XS.fontNorm};
      if(j===16) opts.numFmt=_XS.numFmt;
      _xCell(row,j+1,v,opts);
    });
    r++;
  });
  const totRow=ws.getRow(r);
  for(let c=1;c<=16;c++)_xCell(totRow,c,c===1?'TOTAL':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRow,17,tot,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  _xCell(totRow,18,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRow,19,'',{fill:_XS.totFill,font:_XS.fontWhite});
}

/* ══════════════════════════════════════════════════════════
   7. RESOLUCIÓN DE CIERRE — Resumen (Ingresos + Egresos + Ejecución)
══════════════════════════════════════════════════════════ */
function _excelCierre(wb, d){
  const c = d.config;
  const ci = c.cierre || {};
  const vig = c.vigencia || '';

  // Hoja 1: Ingresos del cierre
  const ws1 = wb.addWorksheet('Cierre Ingresos');
  _xHdr(ws1, 10, d, `RESOLUCIÓN DE CIERRE ${vig} — INGRESOS`);
  const hr1=ws1.getRow(5);
  ['Cuenta','Guía','Concepto','Inicial','Adición','Reducción','Crédito','Contracréd.','Presup. Final','Recaudado'].forEach((h,i)=>
    _xCell(hr1,i+1,h,{fill:_XS.hdrVerde,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws1.columns=[{width:12},{width:8},{width:35},{width:14},{width:14},{width:14},{width:14},{width:14},{width:14},{width:14}];

  let r1=6,gIngSI=0,gIngFin=0,gIngRec=0;
  (d.rubros_ing||[]).filter(x=>!x.esGrupo).forEach(rb=>{
    const si=Number(rb.ini)||0;
    let adi=0,red=0,cre=0,cco=0,rec=0;
    [1,2,3,4].forEach(t=>{
      const mi=getModsIng(d,rb.cod,t);adi+=Number(mi.adi);red+=Number(mi.red);cre+=Number(mi.cre);cco+=Number(mi.cco);
      if(typeof getRecaudoEfectivoIng==='function') rec+=getRecaudoEfectivoIng(d,rb.cod,t);
    });
    const fin=si+adi-red+cre-cco;
    // Cap: recaudo no puede superar el definitivo
    if(rec > fin && fin >= 0) rec = fin;
    gIngSI+=si;gIngFin+=fin;gIngRec+=rec;
    const row=ws1.getRow(r1);
    _xCell(row,1,rb.cod,{font:_XS.fontNorm});_xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
    _xCell(row,3,rb.con,{font:_XS.fontNorm});
    [si,adi,red,cre,cco,fin,rec].forEach((v,i)=>_xCell(row,4+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    r1++;
  });
  // Cap total recaudo
  if(gIngRec > gIngFin && gIngFin >= 0) gIngRec = gIngFin;
  const totI1=ws1.getRow(r1);
  for(let c=1;c<=3;c++)_xCell(totI1,c,c===3?'TOTAL INGRESOS':'',{fill:_XS.totFill,font:_XS.fontWhite});
  for(let c=4;c<=10;c++)_xCell(totI1,c,c===9?gIngFin:c===10?gIngRec:c===4?gIngSI:0,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});

  // Hoja 2: Egresos del cierre
  const ws2 = wb.addWorksheet('Cierre Egresos');
  _xHdr(ws2, 10, d, `RESOLUCIÓN DE CIERRE ${vig} — EGRESOS`);
  const hr2=ws2.getRow(5);
  ['Cuenta','Guía','Concepto','Inicial','Adición','Reducción','Crédito','Contracréd.','Presup. Final','Ejecutado'].forEach((h,i)=>
    _xCell(hr2,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws2.columns=[{width:12},{width:8},{width:35},{width:14},{width:14},{width:14},{width:14},{width:14},{width:14},{width:14}];

  let r2=6,gEgSI=0,gEgFin=0,gEgGas=0;
  [{tipo:'fun',label:'FUNCIONAMIENTO'},{tipo:'inv',label:'INVERSIÓN'}].forEach(g=>{
    const list=d.rubros.filter(x=>x.tipo===g.tipo&&!x.esGrupo);
    if(!list.length)return;
    const gRow=ws2.getRow(r2);
    for(let c=1;c<=10;c++)_xCell(gRow,c,c===1?g.label:'',{fill:_XS.hdrGris,font:_XS.fontWhite});
    r2++;
    list.forEach(rb=>{
      const si=Number(rb.ini)||0;
      let adi=0,red=0,cre=0,cco=0,gas=0;
      [1,2,3,4].forEach(t=>{const m=getMods(d,rb.cod,t);adi+=Number(m.adi);red+=Number(m.red);cre+=Number(m.cre);cco+=Number(m.cco);gas+=getGastos(d,rb.cod,t);});
      const fin=si+adi-red+cre-cco;
      gEgSI+=si;gEgFin+=fin;gEgGas+=gas;
      const row=ws2.getRow(r2);
      _xCell(row,1,rb.cod,{font:_XS.fontNorm});_xCell(row,2,rb.guia||'',{font:_XS.fontNorm});
      _xCell(row,3,rb.con,{font:_XS.fontNorm});
      [si,adi,red,cre,cco,fin,gas].forEach((v,i)=>_xCell(row,4+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
      r2++;
    });
  });
  const totE2=ws2.getRow(r2);
  for(let c=1;c<=3;c++)_xCell(totE2,c,c===3?'TOTAL EGRESOS':'',{fill:_XS.totFill,font:_XS.fontWhite});
  [gEgSI,0,0,0,0,gEgFin,gEgGas].forEach((v,i)=>_xCell(totE2,4+i,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));

  // Hoja 3: Resumen ejecución
  const ws3 = wb.addWorksheet('Cierre Resumen');
  _xHdr(ws3, 5, d, `RESOLUCIÓN DE CIERRE ${vig} — RESUMEN DE EJECUCIÓN`);
  const hr3=ws3.getRow(5);
  ['Concepto','Presup. Final','Recaudado/Ejecutado','Saldo','% Ejecución'].forEach((h,i)=>
    _xCell(hr3,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws3.columns=[{width:40},{width:16},{width:16},{width:16},{width:12}];

  const r3a=ws3.getRow(6);
  _xCell(r3a,1,'INGRESOS',{font:_XS.fontBold});
  [gIngFin,gIngFin,0].forEach((v,i)=>_xCell(r3a,2+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
  _xCell(r3a,5,100,{numFmt:_XS.pctFmt,font:_XS.fontNorm});

  const r3b=ws3.getRow(7);
  _xCell(r3b,1,'EGRESOS',{font:_XS.fontBold});
  [gEgFin,gEgGas,gEgFin-gEgGas].forEach((v,i)=>_xCell(r3b,2+i,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
  _xCell(r3b,5,gEgFin>0?(gEgGas/gEgFin*100):0,{numFmt:_XS.pctFmt,font:_XS.fontNorm});

  const superavit=gIngFin-gEgGas;
  const r3c=ws3.getRow(8);
  _xCell(r3c,1,'SUPERÁVIT PRESUPUESTAL',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(r3c,2,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(r3c,3,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(r3c,4,superavit,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  _xCell(r3c,5,'',{fill:_XS.totFill,font:_XS.fontWhite});

  // Tesorería y cuentas por pagar
  r2 = 10;
  const r3d=ws3.getRow(r2);
  _xCell(r3d,1,'SALDOS DE TESORERÍA',{fill:_XS.hdrMarron,font:_XS.fontWhite});
  for(let c=2;c<=5;c++)_xCell(r3d,c,'',{fill:_XS.hdrMarron,font:_XS.fontWhite});
  r2++;
  let cuentas=ci.cuentas||[];
  // Pre-cargar bancos de config institucional si no hay cuentas de cierre
  if(!cuentas.length){
    cuentas=[];
    const cfg=d.config||{};
    if(cfg.banco_1) cuentas.push({banco:cfg.banco_1,tipo:cfg.tipo_cuenta_1||'Ahorros',numero:cfg.cuenta_1||'',saldo:0});
    if(cfg.banco_2) cuentas.push({banco:cfg.banco_2,tipo:cfg.tipo_cuenta_2||'Ahorros',numero:cfg.cuenta_2||'',saldo:0});
    if(cfg.banco_3) cuentas.push({banco:cfg.banco_3,tipo:cfg.tipo_cuenta_3||'Ahorros',numero:cfg.cuenta_3||'',saldo:0});
  }
  cuentas.forEach((x,i)=>{
    const row=ws3.getRow(r2);
    _xCell(row,1,x.banco||'',{font:_XS.fontNorm});_xCell(row,2,x.tipo||'',{font:_XS.fontNorm});
    _xCell(row,3,x.numero||'',{font:_XS.fontNorm});_xCell(row,4,Number(x.saldo||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r2++;
  });
  const totTes=cuentas.reduce((s,x)=>s+Number(x.saldo||0),0);
  const rTes=ws3.getRow(r2);
  _xCell(rTes,1,'TOTAL TESORERÍA',{font:_XS.fontBold});
  for(let c=2;c<=3;c++)_xCell(rTes,c,'',{font:_XS.fontBold});
  _xCell(rTes,4,totTes,{numFmt:_XS.numFmt,font:_XS.fontBold});
  r2+=2;

  const porPagar=ci.por_pagar||[];
  const rPP=ws3.getRow(r2);
  _xCell(rPP,1,'CUENTAS POR PAGAR',{fill:_XS.hdrMarron,font:_XS.fontWhite});
  for(let c=2;c<=5;c++)_xCell(rPP,c,'',{fill:_XS.hdrMarron,font:_XS.fontWhite});
  r2++;
  porPagar.forEach(p=>{
    const row=ws3.getRow(r2);
    _xCell(row,1,p.concepto||'',{font:_XS.fontNorm});
    for(let c=2;c<=3;c++)_xCell(row,c,'',{font:_XS.fontNorm});
    _xCell(row,4,Number(p.valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r2++;
  });
  const totPagar=porPagar.reduce((s,p)=>s+Number(p.valor||0),0);
  const rTP=ws3.getRow(r2);
  _xCell(rTP,1,'TOTAL CUENTAS POR PAGAR',{font:_XS.fontBold});
  for(let c=2;c<=3;c++)_xCell(rTP,c,'',{font:_XS.fontBold});
  _xCell(rTP,4,totPagar,{numFmt:_XS.numFmt,font:_XS.fontBold});
  r2+=2;

  const superFin=totTes-totPagar;
  const rSF=ws3.getRow(r2);
  _xCell(rSF,1,superFin>=0?'SUPERÁVIT FINANCIERO':'DÉFICIT FINANCIERO',{fill:_XS.totFill,font:_XS.fontWhite});
  for(let c=2;c<=3;c++)_xCell(rSF,c,'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(rSF,4,superFin,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
}

/* ══════════════════════════════════════════════════════════
   8. DOCUMENTOS EXPEDIDOS — CDPs, RPs, Egresos Contratos, DIAN
══════════════════════════════════════════════════════════ */
function _excelDocumentosExpedidos(wb, d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const periodoLabel = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE` : 'ACUMULADO ANUAL';
  const _fx = typeof _fixAnio === 'function' ? _fixAnio : (f=>f);

  function trimDeFecha(fecha){
    if(!fecha) return 0;
    const m = Number(String(fecha).split('-')[1]);
    for(const [t,meses] of Object.entries(MESES_TRIM)){
      if(meses.includes(m)) return Number(t);
    }
    return 0;
  }
  function nombreRubro(cod){
    const r = (d.rubros||[]).find(x=>x.cod===cod);
    return r ? r.con : '';
  }

  /* ── Hoja 1: RESUMEN ── */
  const wsR = wb.addWorksheet('Resumen');
  _xHdr(wsR, 4, d, `RELACIÓN DE DOCUMENTOS EXPEDIDOS — ${periodoLabel}`);
  const hrR = wsR.getRow(5);
  ['Tipo de Documento','Cantidad','Valor Total',''].forEach((h,i)=>
    _xCell(hrR,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  wsR.columns=[{width:40},{width:12},{width:18},{width:5}];

  let contratos = (d.contratos_full||[]).filter(c=>c.cdp);
  if(esTrim) contratos = contratos.filter(c=>trimDeFecha(_fx(c.fecha_cdp))===trim);
  let contratosRP = (d.contratos_full||[]).filter(c=>c.rp);
  if(esTrim) contratosRP = contratosRP.filter(c=>trimDeFecha(_fx(c.fecha_rp))===trim);
  let contratosEg = (d.contratos_full||[]).filter(c=>c.num_egreso);
  if(esTrim) contratosEg = contratosEg.filter(c=>trimDeFecha(_fx(c.fecha_egreso))===trim);
  let gastosDian = (d.pagos_dian||[]);
  if(esTrim) gastosDian = gastosDian.filter(g=>Number(g.trim)===trim);

  const totCDP = contratos.reduce((s,c)=>s+Number(c.valor||0),0);
  const totRP = contratosRP.reduce((s,c)=>s+Number(c.valor||0),0);
  const totEgCto = contratosEg.reduce((s,c)=>s+Number(c.valor||0),0);
  const totDian = gastosDian.reduce((s,g)=>s+Number(g.valor||0),0);

  const resumen = [
    ['CDPs Expedidos', contratos.length, totCDP],
    ['Registros Presupuestales (RP)', contratosRP.length, totRP],
    ['Egresos — Contratos', contratosEg.length, totEgCto],
    ['Egresos — DIAN / Impuestos', gastosDian.length, totDian]
  ];
  let rR = 6;
  resumen.forEach((item,i)=>{
    const row = wsR.getRow(rR);
    _xCell(row,1,item[0],{font:_XS.fontNorm});
    _xCell(row,2,item[1],{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,3,item[2],{numFmt:_XS.numFmt,font:_XS.fontNorm});
    rR++;
  });
  const totDocRow = wsR.getRow(rR);
  _xCell(totDocRow,1,'TOTAL DOCUMENTOS',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totDocRow,2,contratos.length+contratosRP.length+contratosEg.length+gastosDian.length,{fill:_XS.totFill,font:_XS.fontWhite,align:{horizontal:'center'}});
  _xCell(totDocRow,3,totCDP+totRP+totEgCto+totDian,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});

  /* ── Hoja 2: CDPs ── */
  const ws1 = wb.addWorksheet('CDPs');
  _xHdr(ws1, 9, d, `CERTIFICADOS DE DISPONIBILIDAD PRESUPUESTAL (CDP) — ${periodoLabel}`);
  const hr1 = ws1.getRow(5);
  ['#','N° CDP','Fecha','N° Contrato','Beneficiario','Rubro','Concepto Rubro','Objeto','Valor'].forEach((h,i)=>
    _xCell(hr1,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws1.columns=[{width:4},{width:10},{width:12},{width:14},{width:30},{width:12},{width:25},{width:30},{width:16}];

  let r1=6;
  contratos.sort((a,b)=>(_fx(a.fecha_cdp)||'').localeCompare(_fx(b.fecha_cdp)||'')).forEach((c,i)=>{
    const row=ws1.getRow(r1);
    _xCell(row,1,i+1,{font:_XS.fontNorm});_xCell(row,2,c.cdp||'',{font:_XS.fontBold});
    _xCell(row,3,_fx(c.fecha_cdp)||'',{font:_XS.fontNorm});_xCell(row,4,c.numero||'',{font:_XS.fontNorm});
    _xCell(row,5,c.contratista_nombre||'',{font:_XS.fontNorm});_xCell(row,6,c.rubro||'',{font:_XS.fontNorm});
    _xCell(row,7,nombreRubro(c.rubro),{font:_XS.fontNorm});_xCell(row,8,c.objeto||'',{font:_XS.fontNorm});
    _xCell(row,9,Number(c.valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r1++;
  });
  const totCDPRow=ws1.getRow(r1);
  for(let c=1;c<=8;c++)_xCell(totCDPRow,c,c===8?'TOTAL CDPs':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totCDPRow,9,totCDP,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});

  /* ── Hoja 3: RPs ── */
  const ws2 = wb.addWorksheet('RPs');
  _xHdr(ws2, 9, d, `REGISTROS PRESUPUESTALES (RP) — ${periodoLabel}`);
  const hr2 = ws2.getRow(5);
  ['#','N° RP','Fecha','N° CDP','N° Contrato','Beneficiario','Rubro','Objeto','Valor'].forEach((h,i)=>
    _xCell(hr2,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws2.columns=[{width:4},{width:12},{width:12},{width:10},{width:14},{width:30},{width:12},{width:30},{width:16}];

  let r2=6;
  contratosRP.sort((a,b)=>(_fx(a.fecha_rp)||'').localeCompare(_fx(b.fecha_rp)||'')).forEach((c,i)=>{
    const row=ws2.getRow(r2);
    _xCell(row,1,i+1,{font:_XS.fontNorm});_xCell(row,2,c.rp||'',{font:_XS.fontBold});
    _xCell(row,3,_fx(c.fecha_rp)||'',{font:_XS.fontNorm});_xCell(row,4,c.cdp||'',{font:_XS.fontNorm});
    _xCell(row,5,c.numero||'',{font:_XS.fontNorm});_xCell(row,6,c.contratista_nombre||'',{font:_XS.fontNorm});
    _xCell(row,7,c.rubro||'',{font:_XS.fontNorm});_xCell(row,8,c.objeto||'',{font:_XS.fontNorm});
    _xCell(row,9,Number(c.valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r2++;
  });
  const totRPRow=ws2.getRow(r2);
  for(let c=1;c<=8;c++)_xCell(totRPRow,c,c===8?'TOTAL RPs':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totRPRow,9,totRP,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});

  /* ── Hoja 4: Egresos Contratos ── */
  const ws3 = wb.addWorksheet('Egresos Contratos');
  _xHdr(ws3, 10, d, `COMPROBANTES DE EGRESO — CONTRATOS — ${periodoLabel}`);
  const hr3 = ws3.getRow(5);
  ['#','N° Egreso','Fecha','CDP','RP','Contrato','Beneficiario','Rubro','Valor','Retención'].forEach((h,i)=>
    _xCell(hr3,i+1,h,{fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FFC62828'}},font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws3.columns=[{width:4},{width:12},{width:12},{width:10},{width:12},{width:14},{width:30},{width:12},{width:16},{width:14}];

  let r3=6;
  contratosEg.sort((a,b)=>(_fx(a.fecha_egreso)||'').localeCompare(_fx(b.fecha_egreso)||'')).forEach((c,i)=>{
    const row=ws3.getRow(r3);
    _xCell(row,1,i+1,{font:_XS.fontNorm});_xCell(row,2,c.num_egreso||'',{font:_XS.fontBold});
    _xCell(row,3,_fx(c.fecha_egreso)||'',{font:_XS.fontNorm});_xCell(row,4,c.cdp||'',{font:_XS.fontNorm});
    _xCell(row,5,c.rp||'',{font:_XS.fontNorm});_xCell(row,6,c.numero||'',{font:_XS.fontNorm});
    _xCell(row,7,c.contratista_nombre||'',{font:_XS.fontNorm});_xCell(row,8,c.rubro||'',{font:_XS.fontNorm});
    _xCell(row,9,Number(c.valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    _xCell(row,10,Number(c.retencion_valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r3++;
  });
  const totEgRow=ws3.getRow(r3);
  for(let c=1;c<=8;c++)_xCell(totEgRow,c,c===8?'TOTAL EGRESOS':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totEgRow,9,totEgCto,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  _xCell(totEgRow,10,contratosEg.reduce((s,c)=>s+Number(c.retencion_valor||0),0),{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});

  /* ── Hoja 5: DIAN ── */
  const ws4 = wb.addWorksheet('DIAN');
  _xHdr(ws4, 8, d, `COMPROBANTES DE EGRESO — DIAN / IMPUESTOS — ${periodoLabel}`);
  const hr4 = ws4.getRow(5);
  ['#','N° Egreso','Fecha','Concepto','Periodo','NIT','Cuenta','Valor'].forEach((h,i)=>
    _xCell(hr4,i+1,h,{fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FFE65100'}},font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws4.columns=[{width:4},{width:12},{width:12},{width:25},{width:20},{width:14},{width:14},{width:16}];

  let r4=6;
  gastosDian.sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).forEach((g,i)=>{
    const row=ws4.getRow(r4);
    _xCell(row,1,i+1,{font:_XS.fontNorm});_xCell(row,2,g.num_egreso||'',{font:_XS.fontBold});
    _xCell(row,3,g.fecha||'',{font:_XS.fontNorm});_xCell(row,4,g.concepto||'',{font:_XS.fontNorm});
    _xCell(row,5,g.periodo||'',{font:_XS.fontNorm});_xCell(row,6,g.nit||'',{font:_XS.fontNorm});
    _xCell(row,7,g.cuenta||'',{font:_XS.fontNorm});
    _xCell(row,8,Number(g.valor||0),{numFmt:_XS.numFmt,font:_XS.fontNorm});
    r4++;
  });
  const totDianRow=ws4.getRow(r4);
  for(let c=1;c<=7;c++)_xCell(totDianRow,c,c===7?'TOTAL DIAN':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(totDianRow,8,totDian,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
}

/* ══════════════════════════════════════════════════════════
   BALANCE PRESUPUESTAL — Ingresos vs Egresos
══════════════════════════════════════════════════════════ */
function _excelBalance(wb, d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = {1:'Trimestre 1',2:'Trimestre 2',3:'Trimestre 3',4:'Trimestre 4'};
  const periodoTxt = esTrim ? TRIM_NOM[trim] : 'Acumulado Anual';

  // ── Hoja INGRESOS ──
  const ws1 = wb.addWorksheet('Ingresos');
  _xPageSetup(ws1);
  _xHdr(ws1, 8, d, `BALANCE PRESUPUESTAL — INGRESOS — ${periodoTxt}`);
  const h1 = ws1.getRow(5);
  ['Cuenta','Concepto','Pres. Inicial','Adiciones','Reducciones','Pres. Definitivo','Recaudado','% Recaudo'].forEach((h,i)=>
    _xCell(h1,i+1,h,{fill:_XS.hdrVerde,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws1.columns=[{width:14},{width:40},{width:16},{width:16},{width:16},{width:18},{width:18},{width:10}];

  let r1=6, tIni=0, tAdi=0, tRed=0, tDef=0, tRec=0;
  (d.rubros_ing||[]).filter(r=>!r.esGrupo).forEach(r => {
    const ini=Number(r.ini||0);
    let adi=0, red=0, pd=0, rec=0;
    if(esTrim){ const mi=getModsIng(d,r.cod,trim); adi=Number(mi.adi)+Number(mi.cre); red=Number(mi.red)+Number(mi.cco); pd=getPresupDispIng(d,r.cod,trim); rec=getRecaudoEfectivoIng(d,r.cod,trim); }
    else { adi=getModsAnioIng(d,r.cod,'adi')+getModsAnioIng(d,r.cod,'cre'); red=getModsAnioIng(d,r.cod,'red')+getModsAnioIng(d,r.cod,'cco'); pd=ini+adi-red; rec=getRecaudoEfectivoIng(d,r.cod,0); }
    tIni+=ini; tAdi+=adi; tRed+=red; tDef+=pd; tRec+=rec;
    const row=ws1.getRow(r1);
    _xCell(row,1,r.cod,{font:_XS.fontNorm}); _xCell(row,2,r.con,{font:_XS.fontNorm});
    [ini,adi,red,pd,rec].forEach((v,j)=>_xCell(row,j+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    _xCell(row,8,pd>0?rec/pd:'',{numFmt:'0.0%',font:_XS.fontNorm}); r1++;
  });
  const tR1=ws1.getRow(r1);
  _xCell(tR1,1,'',{fill:_XS.totFill,font:_XS.fontWhite}); _xCell(tR1,2,'TOTAL INGRESOS',{fill:_XS.totFill,font:_XS.fontWhite});
  [tIni,tAdi,tRed,tDef,tRec].forEach((v,j)=>_xCell(tR1,j+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(tR1,8,tDef>0?tRec/tDef:'',{fill:_XS.totFill,font:_XS.fontWhite,numFmt:'0.0%'});

  // ── Hoja EGRESOS ──
  const ws2 = wb.addWorksheet('Egresos');
  _xPageSetup(ws2);
  _xHdr(ws2, 10, d, `BALANCE PRESUPUESTAL — EGRESOS — ${periodoTxt}`);
  const h2 = ws2.getRow(5);
  ['Cuenta','Concepto','Pres. Inicial','Adiciones','Reducciones','Pres. Definitivo','Ejecutado','Compromisos','Saldo','% Ejec'].forEach((h,i)=>
    _xCell(h2,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws2.columns=[{width:14},{width:40},{width:16},{width:16},{width:16},{width:18},{width:16},{width:16},{width:16},{width:10}];

  let r2=6, eIni=0, eAdi=0, eRed=0, eDef=0, eEjec=0, eComp=0;
  d.rubros.filter(r=>!r.esGrupo).forEach(r => {
    const ini=Number(r.ini||0);
    let adi=0, red=0, pd=0, gas=0, comp=0;
    if(esTrim){ const m=getMods(d,r.cod,trim); adi=Number(m.adi); red=Number(m.red)+Number(m.cre ? 0 : 0); pd=getPresupDisp(d,r.cod,trim); gas=getGastos(d,r.cod,trim); comp=getCompromisoEgTrim(d,r.cod,trim); adi+=Number(m.cre); red+=Number(m.cco); }
    else { for(let tt=1;tt<=4;tt++){const m=getMods(d,r.cod,tt);adi+=Number(m.adi)+Number(m.cre);red+=Number(m.red)+Number(m.cco);gas+=getGastos(d,r.cod,tt);comp+=getCompromisoEgTrim(d,r.cod,tt);} pd=ini+adi-red; }
    eIni+=ini; eAdi+=adi; eRed+=red; eDef+=pd; eEjec+=gas; eComp+=comp;
    const saldo=pd-gas-comp;
    const row=ws2.getRow(r2);
    _xCell(row,1,r.cod,{font:_XS.fontNorm}); _xCell(row,2,r.con,{font:_XS.fontNorm});
    [ini,adi,red,pd,gas,comp,saldo].forEach((v,j)=>_xCell(row,j+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    _xCell(row,10,pd>0?(gas+comp)/pd:'',{numFmt:'0.0%',font:_XS.fontNorm}); r2++;
  });
  const tR2=ws2.getRow(r2);
  _xCell(tR2,1,'',{fill:_XS.totFill,font:_XS.fontWhite}); _xCell(tR2,2,'TOTAL EGRESOS',{fill:_XS.totFill,font:_XS.fontWhite});
  const eSaldo=eDef-eEjec-eComp;
  [eIni,eAdi,eRed,eDef,eEjec,eComp,eSaldo].forEach((v,j)=>_xCell(tR2,j+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(tR2,10,eDef>0?(eEjec+eComp)/eDef:'',{fill:_XS.totFill,font:_XS.fontWhite,numFmt:'0.0%'});

  // ── Hoja RESUMEN ──
  const ws3 = wb.addWorksheet('Resumen Balance');
  _xPageSetup(ws3);
  _xHdr(ws3, 3, d, `CUADRO RESUMEN — BALANCE PRESUPUESTAL — ${periodoTxt}`);
  ws3.columns=[{width:45},{width:22},{width:12}];
  const hR=ws3.getRow(5);
  _xCell(hR,1,'Concepto',{fill:_XS.hdrAzul,font:_XS.fontWhite});
  _xCell(hR,2,'Valor',{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center'}});
  _xCell(hR,3,'',{fill:_XS.hdrAzul,font:_XS.fontWhite});

  const resumen = [
    ['Total Presupuesto Ingresos', tDef],
    ['Total Presupuesto Egresos', eDef],
    ['DIFERENCIA (Superávit / Déficit)', tDef-eDef],
    ['',''],
    ['Total Recaudado', tRec],
    ['Total Ejecutado (Pagos)', eEjec],
    ['Compromisos sin Pagar', eComp],
    ['DISPONIBLE EN CAJA (Recaudado − Ejecutado)', tRec-eEjec]
  ];
  let r3=6;
  resumen.forEach(([label,val]) => {
    const row=ws3.getRow(r3);
    const isTot = label.startsWith('DIS') || label.startsWith('DIF');
    _xCell(row,1,label,{font:isTot?{bold:true,size:11}:_XS.fontNorm});
    if(val!=='') _xCell(row,2,val,{numFmt:_XS.numFmt,font:isTot?{bold:true,size:11}:_XS.fontNorm});
    r3++;
  });
}

/* ══════════════════════════════════════════════════════════
   INFORME PARA CONTRALORÍA — Excel
══════════════════════════════════════════════════════════ */
function _excelContraloria(wb, d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = {1:'Trimestre 1',2:'Trimestre 2',3:'Trimestre 3',4:'Trimestre 4'};
  const periodoTxt = esTrim ? TRIM_NOM[trim] : 'Acumulado Anual';

  // ── Hoja 1: INGRESOS ──
  const ws1 = wb.addWorksheet('Ingresos Contraloría');
  _xPageSetup(ws1);
  _xHdr(ws1, 6, d, `INFORME CONTRALORÍA — INGRESOS — ${periodoTxt}`);
  const h1 = ws1.getRow(5);
  ['Cuenta','Concepto','Pres. Inicial','Pres. Definitivo','Recaudado','% Recaudo'].forEach((h,i)=>
    _xCell(h1,i+1,h,{fill:_XS.hdrVerde,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws1.columns=[{width:14},{width:40},{width:16},{width:18},{width:18},{width:10}];

  let r1=6, tIni=0, tDef=0, tRec=0;
  (d.rubros_ing||[]).filter(r=>!r.esGrupo).forEach(r => {
    const ini=Number(r.ini||0);
    let pd=0, rec=0;
    if(esTrim){ pd=typeof getPresupDispIng==='function'?getPresupDispIng(d,r.cod,trim):ini; rec=typeof getRecaudoEfectivoIng==='function'?getRecaudoEfectivoIng(d,r.cod,trim):0; }
    else { const mi1=getModsAnioIng(d,r.cod,'adi'),mi2=getModsAnioIng(d,r.cod,'cre'),mr1=getModsAnioIng(d,r.cod,'red'),mr2=getModsAnioIng(d,r.cod,'cco'); pd=ini+mi1+mi2-mr1-mr2; rec=typeof getRecaudoEfectivoIng==='function'?getRecaudoEfectivoIng(d,r.cod,0):0; }
    tIni+=ini; tDef+=pd; tRec+=rec;
    const row=ws1.getRow(r1);
    _xCell(row,1,r.cod,{font:_XS.fontNorm}); _xCell(row,2,r.con,{font:_XS.fontNorm});
    [ini,pd,rec].forEach((v,j)=>_xCell(row,j+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    _xCell(row,6,pd>0?rec/pd:'',{numFmt:'0.0%',font:_XS.fontNorm}); r1++;
  });
  const tR1=ws1.getRow(r1);
  _xCell(tR1,1,'',{fill:_XS.totFill,font:_XS.fontWhite}); _xCell(tR1,2,'TOTAL INGRESOS',{fill:_XS.totFill,font:_XS.fontWhite});
  [tIni,tDef,tRec].forEach((v,j)=>_xCell(tR1,j+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(tR1,6,tDef>0?tRec/tDef:'',{fill:_XS.totFill,font:_XS.fontWhite,numFmt:'0.0%'});

  // ── Hoja 2: EGRESOS ──
  const ws2 = wb.addWorksheet('Egresos Contraloría');
  _xPageSetup(ws2);
  _xHdr(ws2, 8, d, `INFORME CONTRALORÍA — EGRESOS — ${periodoTxt}`);
  const h2 = ws2.getRow(5);
  ['Cuenta','Concepto','Pres. Inicial','Pres. Definitivo','Compromisos','Pagado','Saldo','% Ejec'].forEach((h,i)=>
    _xCell(h2,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws2.columns=[{width:14},{width:40},{width:16},{width:18},{width:16},{width:16},{width:16},{width:10}];

  let r2=6, eIni=0, eDef=0, eComp=0, ePag=0;
  d.rubros.filter(r=>!r.esGrupo).forEach(r => {
    const ini=Number(r.ini||0);
    let pd=0, gas=0, comp=0;
    if(esTrim){ pd=typeof getPresupDisp==='function'?getPresupDisp(d,r.cod,trim):ini; gas=typeof getGastos==='function'?getGastos(d,r.cod,trim):0; comp=typeof getCompromisoEgTrim==='function'?getCompromisoEgTrim(d,r.cod,trim):0; }
    else { for(let tt=1;tt<=4;tt++){const m=getMods(d,r.cod,tt);pd+=Number(m.adi)-Number(m.red)+Number(m.cre)-Number(m.cco);gas+=typeof getGastos==='function'?getGastos(d,r.cod,tt):0;comp+=typeof getCompromisoEgTrim==='function'?getCompromisoEgTrim(d,r.cod,tt):0;} pd+=ini; }
    eIni+=ini; eDef+=pd; eComp+=comp; ePag+=gas;
    const saldo=pd-gas-comp;
    const row=ws2.getRow(r2);
    _xCell(row,1,r.cod,{font:_XS.fontNorm}); _xCell(row,2,r.con,{font:_XS.fontNorm});
    [ini,pd,comp,gas,saldo].forEach((v,j)=>_xCell(row,j+3,v,{numFmt:_XS.numFmt,font:_XS.fontNorm}));
    _xCell(row,8,pd>0?(gas+comp)/pd:'',{numFmt:'0.0%',font:_XS.fontNorm}); r2++;
  });
  const tR2=ws2.getRow(r2);
  _xCell(tR2,1,'',{fill:_XS.totFill,font:_XS.fontWhite}); _xCell(tR2,2,'TOTAL EGRESOS',{fill:_XS.totFill,font:_XS.fontWhite});
  [eIni,eDef,eComp,ePag,eDef-ePag-eComp].forEach((v,j)=>_xCell(tR2,j+3,v,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt}));
  _xCell(tR2,8,eDef>0?(ePag+eComp)/eDef:'',{fill:_XS.totFill,font:_XS.fontWhite,numFmt:'0.0%'});

  // ── Hoja 3: CONTRATOS ──
  const ws3 = wb.addWorksheet('Contratos Contraloría');
  _xPageSetup(ws3);
  _xHdr(ws3, 8, d, `INFORME CONTRALORÍA — CONTRATOS — ${periodoTxt}`);
  const h3 = ws3.getRow(5);
  ['#','N° Contrato','Objeto','Contratista','Valor','Inicio','Fin','Estado'].forEach((h,i)=>
    _xCell(h3,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws3.columns=[{width:5},{width:14},{width:40},{width:25},{width:18},{width:12},{width:12},{width:12}];

  const contratos = d.contratos_full || [];
  const ctFiltro = esTrim ? contratos.filter(c => {
    if(!c.fecha_cdp) return false;
    const m=Number(c.fecha_cdp.split('-')[1]);
    const tMeses={1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]};
    return tMeses[trim].includes(m);
  }) : contratos;

  let r3=6, totalCt=0;
  ctFiltro.forEach((c,i) => {
    const val=Number(c.valor||0); totalCt+=val;
    const row=ws3.getRow(r3);
    _xCell(row,1,i+1,{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,2,c.numero||'',{font:_XS.fontNorm});
    _xCell(row,3,c.objeto||'',{font:_XS.fontNorm,align:{wrapText:true}});
    _xCell(row,4,c.contratista_nombre||'',{font:_XS.fontNorm});
    _xCell(row,5,val,{numFmt:_XS.numFmt,font:_XS.fontNorm});
    _xCell(row,6,c.fecha_inicio||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,7,c.fecha_fin||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,8,c.estado||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    r3++;
  });
  const tR3=ws3.getRow(r3);
  _xCell(tR3,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
  for(let c=2;c<=4;c++) _xCell(tR3,c,c===2?'TOTAL CONTRATOS':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(tR3,5,totalCt,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  for(let c=6;c<=8;c++) _xCell(tR3,c,'',{fill:_XS.totFill,font:_XS.fontWhite});

  // ── Hoja 4: PAGOS DIAN ──
  const ws4 = wb.addWorksheet('Pagos DIAN Contraloría');
  _xPageSetup(ws4);
  _xHdr(ws4, 6, d, `INFORME CONTRALORÍA — PAGOS DIAN — ${periodoTxt}`);
  const h4 = ws4.getRow(5);
  ['#','Concepto','Período','Valor','Fecha','N° Egreso'].forEach((h,i)=>
    _xCell(h4,i+1,h,{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center',wrapText:true}}));
  ws4.columns=[{width:5},{width:30},{width:14},{width:18},{width:12},{width:12}];

  const pagosDian = d.pagos_dian || [];
  const pdFiltro = esTrim ? pagosDian.filter(p => {
    if(!p.fecha) return false;
    const m=Number(p.fecha.split('-')[1]);
    const tMeses={1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]};
    return tMeses[trim].includes(m);
  }) : pagosDian;

  let r4=6, totalPd=0;
  pdFiltro.forEach((p,i) => {
    const val=Number(p.valor||0); totalPd+=val;
    const row=ws4.getRow(r4);
    _xCell(row,1,i+1,{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,2,p.concepto||'',{font:_XS.fontNorm});
    _xCell(row,3,p.periodo||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,4,val,{numFmt:_XS.numFmt,font:_XS.fontNorm});
    _xCell(row,5,p.fecha||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    _xCell(row,6,p.num_egreso||'',{font:_XS.fontNorm,align:{horizontal:'center'}});
    r4++;
  });
  const tR4=ws4.getRow(r4);
  _xCell(tR4,1,'',{fill:_XS.totFill,font:_XS.fontWhite});
  for(let c=2;c<=3;c++) _xCell(tR4,c,c===2?'TOTAL PAGOS DIAN':'',{fill:_XS.totFill,font:_XS.fontWhite});
  _xCell(tR4,4,totalPd,{fill:_XS.totFill,font:_XS.fontWhite,numFmt:_XS.numFmt});
  for(let c=5;c<=6;c++) _xCell(tR4,c,'',{fill:_XS.totFill,font:_XS.fontWhite});

  // ── Hoja 5: RESUMEN ──
  const ws5 = wb.addWorksheet('Resumen Contraloría');
  _xPageSetup(ws5);
  _xHdr(ws5, 2, d, `INFORME CONTRALORÍA — RESUMEN — ${periodoTxt}`);
  ws5.columns=[{width:50},{width:22}];
  const hR=ws5.getRow(5);
  _xCell(hR,1,'Concepto',{fill:_XS.hdrAzul,font:_XS.fontWhite});
  _xCell(hR,2,'Valor',{fill:_XS.hdrAzul,font:_XS.fontWhite,align:{horizontal:'center'}});

  const resumen = [
    ['Presupuesto Definitivo Ingresos', tDef],
    ['Presupuesto Definitivo Egresos', eDef],
    ['Total Recaudado', tRec],
    ['Total Pagado (Contratos)', ePag],
    ['Total Pagado (DIAN)', totalPd],
    ['Compromisos Pendientes', eComp],
    ['DISPONIBLE (Recaudado - Pagado - DIAN)', tRec - ePag - totalPd]
  ];
  let r5=6;
  resumen.forEach(([label,val]) => {
    const row=ws5.getRow(r5);
    const isTot = label.startsWith('DIS');
    _xCell(row,1,label,{font:isTot?{bold:true,size:11}:_XS.fontNorm, fill:isTot?_XS.totFill:undefined, ...(isTot?{font:_XS.fontWhite}:{})});
    _xCell(row,2,val,{numFmt:_XS.numFmt,font:isTot?_XS.fontWhite:_XS.fontNorm, fill:isTot?_XS.totFill:undefined});
    r5++;
  });
}
