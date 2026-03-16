/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Cálculos de Egresos
   Funciones puras que operan sobre los datos (d = DB.load())
══════════════════════════════════════════════════════════ */

/* Modificaciones de un rubro en un trimestre (desde cache mods) */
function getMods(d, cod, trim){
  if (!d.mods || !d.mods[cod] || !d.mods[cod][trim])
    return {adi:0, red:0, cre:0, cco:0};
  const m = d.mods[cod][trim];
  return {adi:Number(m.adi)||0, red:Number(m.red)||0, cre:Number(m.cre)||0, cco:Number(m.cco)||0};
}

/* Recalcular cache mods desde mods_eg (registros individuales) */
function recalcularMods(d, cod, trim){
  if (!d.mods) d.mods = {};
  if (!d.mods[cod]) d.mods[cod] = {};
  d.mods[cod][trim] = {adi:0, red:0, cre:0, cco:0};
  (d.mods_eg||[]).forEach(e => {
    if (e.cod === cod && Number(e.trim) === trim){
      const t = e.tipo;
      if (t==='adicion')        d.mods[cod][trim].adi += Number(e.valor)||0;
      else if (t==='reduccion') d.mods[cod][trim].red += Number(e.valor)||0;
      else if (t==='credito')   d.mods[cod][trim].cre += Number(e.valor)||0;
      else if (t==='contracredito') d.mods[cod][trim].cco += Number(e.valor)||0;
    }
  });
}

/* Total de gastos ejecutados en un rubro/trimestre */
function getGastos(d, cod, trim){
  return (d.contratos||[])
    .filter(c => c.cod_rubro === cod && Number(c.trim) === trim)
    .reduce((s,c) => s + (Number(c.valor)||0), 0);
}

/* Gastos de un rubro en un mes específico */
function getGastosMes(d, cod, mes){
  return (d.contratos||[])
    .filter(c => c.cod_rubro === cod && Number(c.mes) === mes)
    .reduce((s,c) => s + (Number(c.valor)||0), 0);
}

/* Gastos acumulados hasta un trimestre (inclusive) */
function getGastosHasta(d, cod, trim){
  let total = 0;
  for (let t=1; t<=trim; t++) total += getGastos(d, cod, t);
  return total;
}

/* Saldo inicial de un rubro en un trimestre:
   T1 = Apropiación Inicial
   T2+ = Saldo final del trimestre anterior */
function getSaldoInicial(d, cod, trim){
  const r = d.rubros.find(x => x.cod === cod);
  if (!r) return 0;
  if (!trim || trim <= 1) return Number(r.ini)||0;
  return getSaldoFinal(d, cod, trim - 1);
}

/* Presupuesto Definitivo (acumulado hasta el trimestre) */
function getPresupDef(d, cod){
  const r = d.rubros.find(x => x.cod === cod);
  let ini = r ? (Number(r.ini)||0) : 0;
  let totalMods = 0;
  for (let t=1; t<=4; t++){
    const m = getMods(d, cod, t);
    totalMods += m.adi - m.red + m.cre - m.cco;
  }
  return ini + totalMods;
}

/* Presupuesto Disponible en un trimestre */
function getPresupDisp(d, cod, trim){
  const si = getSaldoInicial(d, cod, trim);
  const m = getMods(d, cod, trim);
  return si + m.adi - m.red + m.cre - m.cco;
}

/* Saldo final de un trimestre (Presup. Disponible - Gastos - Compromisos) */
function getSaldoFinal(d, cod, trim){
  return getPresupDisp(d, cod, trim) - getGastos(d, cod, trim) - getCompromisoEgTrim(d, cod, trim);
}

/* Compromiso registrado para un rubro/trimestre */
function getCompromisoEgTrim(d, cod, trim){
  return (d.compromisos_eg||[])
    .filter(e => e.cod === cod && Number(e.trim) === trim)
    .reduce((s,e) => s + (Number(e.valor)||0), 0);
}

/* Compromiso de un rubro en un mes específico (para PAC) */
function getCompromisoMes(d, cod, mes){
  return (d.compromisos_eg||[])
    .filter(e => e.cod === cod && Number(e.mes) === mes)
    .reduce((s,e) => s + (Number(e.valor)||0), 0);
}

/* Pago registrado para un rubro/trimestre */
function getPagoEgTrim(d, cod, trim){
  return (d.pagos_eg||[])
    .filter(e => e.cod === cod && Number(e.trim) === trim)
    .reduce((s,e) => s + (Number(e.valor)||0), 0);
}

/* Verificar balance del presupuesto en un trimestre */
function calcBalanceTrim(t){
  const d = DB.load();
  let totalIng = 0, totalEg = 0;
  (d.rubros_ing||[]).filter(r => !r.esGrupo).forEach(r => {
    totalIng += getPresupDispIng(d, r.cod, t);
  });
  d.rubros.filter(r => !r.esGrupo).forEach(r => {
    totalEg += getPresupDisp(d, r.cod, t);
  });
  return {totalIng, totalEg, diff: totalIng - totalEg, ok: Math.abs(totalIng - totalEg) < 1};
}

/* ═══ Verificar balance presupuestal global y mostrar alerta ═══ */
function _verificarBalancePresupuestal(){
  const d = DB.load();
  let totalIng = 0, totalEg = 0;
  (d.rubros_ing||[]).filter(r => !r.esGrupo).forEach(r => {
    totalIng += getPresupDefIng(d, r.cod);
  });
  d.rubros.filter(r => !r.esGrupo).forEach(r => {
    totalEg += getPresupDef(d, r.cod);
  });
  const diff = totalIng - totalEg;
  const cuadra = Math.abs(diff) < 1;

  if(!cuadra && (totalIng > 0 || totalEg > 0)){
    const esExceso = diff < 0;
    const msg = esExceso
      ? '⛔ ¡PRESUPUESTO DESCUADRADO! Los egresos ($' + fmt(totalEg) + ') superan los ingresos ($' + fmt(totalIng) + ') por $' + fmt(Math.abs(diff)) + '. Debe realizar un ajuste.'
      : '⚠️ Presupuesto desbalanceado. Los ingresos ($' + fmt(totalIng) + ') superan los egresos ($' + fmt(totalEg) + ') por $' + fmt(Math.abs(diff)) + '. Asigne el excedente.';
    if(typeof toast === 'function') toast(msg, esExceso ? 'danger' : 'warning');
  } else if(cuadra && totalIng > 0){
    if(typeof toast === 'function') toast('✅ Presupuesto equilibrado: Ingresos = Egresos = $' + fmt(totalIng), 'success');
  }
}

/* Sumar valores de hojas hijas para un grupo (egresos) */
function sumarHojasEg(d, padCod, fn){
  return d.rubros
    .filter(r => r.cod.startsWith(padCod+'.') && !r.esGrupo)
    .reduce((s,r) => s + fn(r.cod), 0);
}
