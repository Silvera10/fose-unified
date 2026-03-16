/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Exportación Excel SIFSE (export-sifse.js)
   Genera archivo .xlsx con 2 hojas:
     1) REPORTE DE INGRESOS PRESUPUESTALES
     2) REPORTE DE GASTOS PRESUPUESTALES
   Formato plano para carga directa al sistema SIFSE del MEN.
══════════════════════════════════════════════════════════ */

async function exportarSIFSE(trim){
  try {
    if(typeof ExcelJS === 'undefined'){
      toast('ExcelJS no está disponible. Verifique conexión a internet.', 'danger');
      return;
    }

    const d = DB.load();
    const c = d.config || {};
    const dane = c.ciudad || '';
    const anio = c.vigencia || String(new Date().getFullYear());

    if(!dane){
      toast('Configure el código DANE en la pestaña de Configuración.', 'warning');
      return;
    }

    const ingData  = _sifseCalcIngresos(d, trim);
    const gastData = _sifseCalcGastos(d, trim);

    if(!ingData.length && !gastData.length){
      toast('No hay datos mapeados para exportar. Configure el mapeo SIFSE primero.', 'warning');
      return;
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'FOSE Unified';
    wb.created = new Date();

    /* ═══ HOJA 1: INGRESOS ═══ */
    _excelSifseIngresos(wb, d, trim, dane, anio, ingData);

    /* ═══ HOJA 2: GASTOS ═══ */
    _excelSifseGastos(wb, d, trim, dane, anio, gastData);

    /* ═══ Descargar ═══ */
    const buf  = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SIFSE_${dane}_${anio}_T${trim}_${today()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);

    toast(`Reporte SIFSE T${trim} exportado exitosamente`, 'success');

  } catch(e){
    console.error('Error exportando SIFSE:', e);
    toast('Error al exportar: ' + e.message, 'danger');
  }
}

/* ═══════════════════════════════════════════════════════
   Hoja 1: REPORTE DE INGRESOS PRESUPUESTALES
═══════════════════════════════════════════════════════ */

function _excelSifseIngresos(wb, d, trim, dane, anio, data){
  const ws = wb.addWorksheet('REPORTE INGRESOS PRESUPUESTALES');
  const c  = d.config || {};
  const nCols = 7;

  /* Encabezado institucional (3 filas) */
  _sifseXHdr(ws, nCols, c, 'REPORTE DE INGRESOS PRESUPUESTALES — SIFSE');

  /* Fila 4: info */
  const r4 = ws.getRow(4);
  ws.mergeCells('A4:G4');
  r4.getCell(1).value = `DANE: ${dane}  |  Vigencia: ${anio}  |  Trimestre: ${trim} ${trim>1?'(Acumulado)':''}`;
  r4.getCell(1).font = {size:9, italic:true};
  r4.getCell(1).alignment = {horizontal:'center'};
  r4.height = 18;

  /* Fila 5: encabezados columnas */
  const hdrs = [
    'Código Establecimiento', 'Año', 'Trimestre',
    'Fuente de Ingreso',
    'Presupuesto Inicial', 'Presupuesto Definitivo', 'Monto Recaudado'
  ];
  const hr = ws.getRow(5);
  hdrs.forEach((h, i) => {
    const cell = hr.getCell(i+1);
    cell.value = h;
    cell.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FF145E2C'}};
    cell.font = {bold:true, color:{argb:'FFFFFFFF'}, size:9};
    cell.alignment = {horizontal:'center', vertical:'middle', wrapText:true};
    cell.border = _XS.border;
  });
  hr.height = 30;

  /* Anchos columnas */
  ws.columns = [
    {width:22}, {width:8}, {width:10},
    {width:20},
    {width:20}, {width:22}, {width:20}
  ];

  /* Filas de datos */
  let r = 6;
  let totIni=0, totDef=0, totRec=0;

  data.forEach(row => {
    totIni += row.ini; totDef += row.def; totRec += row.rec;
    const xr = ws.getRow(r);
    _xCell(xr, 1, dane,     {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 2, Number(anio), {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 3, trim,     {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 4, row.codF, {font:_XS.fontBold, align:{horizontal:'center'}});
    _xCell(xr, 5, row.ini,  {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 6, row.def,  {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 7, row.rec,  {font:_XS.fontNorm, numFmt:_XS.numFmt});
    r++;
  });

  /* Fila totales */
  if(data.length){
    const tr = ws.getRow(r);
    ws.mergeCells(`A${r}:D${r}`);
    _xCell(tr, 1, 'TOTALES', {fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FF145E2C'}},
      font:_XS.fontWhite, align:{horizontal:'right'}});
    _xCell(tr, 5, totIni,  {fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FF145E2C'}}, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 6, totDef,  {fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FF145E2C'}}, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 7, totRec,  {fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FF145E2C'}}, font:_XS.fontWhite, numFmt:_XS.numFmt});
    // Borders en celdas merge
    for(let c=2; c<=4; c++) tr.getCell(c).border = _XS.border;
  }
}

/* ═══════════════════════════════════════════════════════
   Hoja 2: REPORTE DE GASTOS PRESUPUESTALES
═══════════════════════════════════════════════════════ */

function _excelSifseGastos(wb, d, trim, dane, anio, data){
  const ws = wb.addWorksheet('REPORTE GASTOS PRESUPUESTALES');
  const c  = d.config || {};
  const nCols = 10;

  /* Encabezado institucional */
  _sifseXHdr(ws, nCols, c, 'REPORTE DE GASTOS PRESUPUESTALES — SIFSE');

  /* Fila 4: info */
  const r4 = ws.getRow(4);
  ws.mergeCells('A4:J4');
  r4.getCell(1).value = `DANE: ${dane}  |  Vigencia: ${anio}  |  Trimestre: ${trim} ${trim>1?'(Acumulado)':''}`;
  r4.getCell(1).font = {size:9, italic:true};
  r4.getCell(1).alignment = {horizontal:'center'};
  r4.height = 18;

  /* Fila 5: encabezados columnas */
  const hdrs = [
    'Código Establecimiento', 'Año', 'Trimestre',
    'Fuente de Ingreso', 'Item Detalle',
    'Presupuesto Inicial', 'Presupuesto Definitivo',
    'Compromisos', 'Obligaciones', 'Pagos'
  ];
  const hr = ws.getRow(5);
  hdrs.forEach((h, i) => {
    const cell = hr.getCell(i+1);
    cell.value = h;
    cell.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FF795548'}};
    cell.font = {bold:true, color:{argb:'FFFFFFFF'}, size:9};
    cell.alignment = {horizontal:'center', vertical:'middle', wrapText:true};
    cell.border = _XS.border;
  });
  hr.height = 30;

  /* Anchos columnas */
  ws.columns = [
    {width:22}, {width:8}, {width:10},
    {width:20}, {width:15},
    {width:20}, {width:22},
    {width:18}, {width:18}, {width:18}
  ];

  /* Filas de datos */
  let r = 6;
  let gt = {ini:0, def:0, comp:0, oblig:0, pagos:0};

  data.forEach(row => {
    gt.ini+=row.ini; gt.def+=row.def; gt.comp+=row.comp; gt.oblig+=row.oblig; gt.pagos+=row.pagos;
    const xr = ws.getRow(r);
    _xCell(xr, 1,  dane,      {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 2,  Number(anio), {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 3,  trim,      {font:_XS.fontNorm, align:{horizontal:'center'}});
    _xCell(xr, 4,  row.codF,  {font:_XS.fontBold, align:{horizontal:'center'}});
    _xCell(xr, 5,  row.codG,  {font:_XS.fontBold, align:{horizontal:'center'}});
    _xCell(xr, 6,  row.ini,   {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 7,  row.def,   {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 8,  row.comp,  {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 9,  row.oblig, {font:_XS.fontNorm, numFmt:_XS.numFmt});
    _xCell(xr, 10, row.pagos, {font:_XS.fontNorm, numFmt:_XS.numFmt});
    r++;
  });

  /* Fila totales */
  if(data.length){
    const tr = ws.getRow(r);
    ws.mergeCells(`A${r}:E${r}`);
    const totFill = {type:'pattern', pattern:'solid', fgColor:{argb:'FF795548'}};
    _xCell(tr, 1,  'TOTALES',  {fill:totFill, font:_XS.fontWhite, align:{horizontal:'right'}});
    _xCell(tr, 6,  gt.ini,     {fill:totFill, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 7,  gt.def,     {fill:totFill, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 8,  gt.comp,    {fill:totFill, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 9,  gt.oblig,   {fill:totFill, font:_XS.fontWhite, numFmt:_XS.numFmt});
    _xCell(tr, 10, gt.pagos,   {fill:totFill, font:_XS.fontWhite, numFmt:_XS.numFmt});
    // Borders en celdas merge
    for(let c=2; c<=5; c++) tr.getCell(c).border = _XS.border;
  }
}

/* ═══════════════════════════════════════════════════════
   Encabezado SIFSE (3 filas institucionales)
═══════════════════════════════════════════════════════ */

function _sifseXHdr(ws, nCols, c, titulo){
  const colLetter = String.fromCharCode(64 + nCols);

  /* Fila 1: Secretaría + Institución */
  const r1 = ws.getRow(1);
  ws.mergeCells(`A1:${colLetter}1`);
  r1.getCell(1).value = `${c.secretaria||'SECRETARÍA DE EDUCACIÓN'} — ${c.institucion||''}`;
  r1.getCell(1).font = {bold:true, size:11};
  r1.getCell(1).alignment = {horizontal:'center'};
  r1.height = 22;

  /* Fila 2: NIT + Municipio */
  const r2 = ws.getRow(2);
  ws.mergeCells(`A2:${colLetter}2`);
  r2.getCell(1).value = `NIT: ${c.nit||''}${c.dv?'-'+c.dv:''} — ${c.municipio||''}, ${c.departamento||''}`;
  r2.getCell(1).font = {size:9};
  r2.getCell(1).alignment = {horizontal:'center'};
  r2.height = 18;

  /* Fila 3: Título reporte */
  const r3 = ws.getRow(3);
  ws.mergeCells(`A3:${colLetter}3`);
  r3.getCell(1).value = titulo;
  r3.getCell(1).font = {bold:true, size:11};
  r3.getCell(1).alignment = {horizontal:'center'};
  r3.height = 22;
}
