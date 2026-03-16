/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Cálculos de Ingresos
══════════════════════════════════════════════════════════ */

/* Modificaciones de ingresos (desde cache mods_ing) */
function getModsIng(d, cod, trim){
  if (!d.mods_ing || !d.mods_ing[cod] || !d.mods_ing[cod][trim])
    return {adi:0, red:0, cre:0, cco:0};
  const m = d.mods_ing[cod][trim];
  return {adi:Number(m.adi)||0, red:Number(m.red)||0, cre:Number(m.cre)||0, cco:Number(m.cco)||0};
}

/* Total ingresos registrados para una fuente/trimestre */
function getIngresosT(d, cod, trim){
  return (d.ingresos||[])
    .filter(i => i.cod_fuente === cod && Number(i.trim) === trim)
    .reduce((s,i) => s + (Number(i.valor)||0), 0);
}

/* Recalcular modificaciones de ingresos (adi/red/cre/cco) */
function recalcularModsIng(d, cod, trim){
  if (!d.mods_ing) d.mods_ing = {};
  if (!d.mods_ing[cod]) d.mods_ing[cod] = {};
  if (!d.mods_ing[cod][trim]) d.mods_ing[cod][trim] = {adi:0, red:0, cre:0, cco:0};

  let totalAdi = 0, totalRed = 0, totalCre = 0, totalCco = 0;

  // Desde ingresos registrados (naturaleza = adicion o reduccion)
  (d.ingresos||[]).filter(i => i.cod_fuente === cod && Number(i.trim) === trim).forEach(i => {
    if (i.naturaleza === 'adicion')   totalAdi += Number(i.valor)||0;
    if (i.naturaleza === 'reduccion') totalRed += Number(i.valor)||0;
  });

  // Desde mods_ing_form (formularios de modificación y acuerdos)
  (d.mods_ing_form||[]).filter(e => e.cod === cod && Number(e.trim) === trim).forEach(e => {
    if (e.tipo === 'adicion')        totalAdi += Number(e.valor)||0;
    if (e.tipo === 'reduccion')      totalRed += Number(e.valor)||0;
    if (e.tipo === 'credito')        totalCre += Number(e.valor)||0;
    if (e.tipo === 'contracredito')  totalCco += Number(e.valor)||0;
  });

  d.mods_ing[cod][trim].adi = totalAdi;
  d.mods_ing[cod][trim].red = totalRed;
  d.mods_ing[cod][trim].cre = totalCre;
  d.mods_ing[cod][trim].cco = totalCco;
}

/* Saldo inicial de ingreso en un trimestre */
function getSaldoInicialIng(d, cod, trim){
  const r = (d.rubros_ing||[]).find(x => x.cod === cod);
  if (!r) return 0;
  if (!trim || trim <= 1) return Number(r.ini)||0;
  return getSaldoFinalIng(d, cod, trim - 1);
}

/* Presupuesto Disponible Ingreso */
function getPresupDispIng(d, cod, trim){
  const si = getSaldoInicialIng(d, cod, trim);
  const m = getModsIng(d, cod, trim);
  return si + m.adi - m.red + m.cre - m.cco;
}

/* Saldo final ingreso */
function getSaldoFinalIng(d, cod, trim){
  return getPresupDispIng(d, cod, trim);
}

/* Recaudo efectivo de ingreso en un mes (solo desde recaudos_ing_mes) */
function getRecaudoMes(d, cod, mes){
  return Number(((d.recaudos_ing_mes||{})[cod]||{})[mes]) || 0;
}

/* Recaudo total mensual = recaudos_ing_mes + ingresos registrados del mes */
function getRecaudoMesTotal(d, cod, mes){
  let total = getRecaudoMes(d, cod, mes);
  // Sumar ingresos registrados en ese mes
  total += (d.ingresos||[])
    .filter(i => i.cod_fuente === cod && Number(i.mes) === mes)
    .reduce((s,i) => s + (Number(i.valor)||0), 0);
  return total;
}

/* Recaudo efectivo de ingreso acumulado en un trimestre (o anual si trim=0) */
function getRecaudoEfectivoIng(d, cod, trim){
  // Si el rubro se recauda en banco → 100% recaudado (SGP, transferencias)
  const rubro = (d.rubros_ing||[]).find(x => x.cod === cod);
  if(rubro && rubro.en_banco){
    // trim=0 → presupuesto definitivo anual; trim>0 → presupuesto disponible del trimestre
    return trim > 0 ? getPresupDispIng(d, cod, trim) : getPresupDefIng(d, cod);
  }
  if(trim === 0){
    // Anual: sumar recaudos de los 4 trimestres
    let total = 0;
    for(let t=1; t<=4; t++){
      const meses = MESES_TRIM[t] || [];
      meses.forEach(m => { total += getRecaudoMes(d, cod, m); });
      total += getIngresosT(d, cod, t);
    }
    return total;
  }
  // Acumulativo: sumar desde T1 hasta el trimestre actual
  // (la plata que entró al banco en T1 sigue disponible en T2, T3, T4)
  let total = 0;
  for(let t=1; t<=trim; t++){
    const meses = MESES_TRIM[t] || [];
    meses.forEach(m => { total += getRecaudoMes(d, cod, m); });
    total += getIngresosT(d, cod, t);
  }
  return total;
}

/* Presupuesto Definitivo Ingreso (acumulado) */
function getPresupDefIng(d, cod){
  const r = (d.rubros_ing||[]).find(x => x.cod === cod);
  let ini = r ? (Number(r.ini)||0) : 0;
  let totalMods = 0;
  for (let t=1; t<=4; t++){
    const m = getModsIng(d, cod, t);
    totalMods += m.adi - m.red + m.cre - m.cco;
  }
  return ini + totalMods;
}

/* Sumar valores de hojas hijas para un grupo (ingresos) */
function sumarHojasIng(d, padCod, fn){
  return (d.rubros_ing||[])
    .filter(r => r.cod.startsWith(padCod+'.') && !r.esGrupo)
    .reduce((s,r) => s + fn(r.cod), 0);
}

/* Hijos directos (detalle, no-grupo) de un código padre de ingreso */
function getHijosIng(d, padCod){
  return (d.rubros_ing||[]).filter(x => !x.esGrupo && x.cod.startsWith(padCod + '.'));
}

/* Movimiento neto de ingreso en un mes (desde mods_ing_form) */
function getMovimIngMes(d, cod, mes){
  // Recaudos reales del mes (no modificaciones presupuestales)
  let total = Number(((d.recaudos_ing_mes||{})[cod]||{})[mes]) || 0;
  // + ingresos registrados en ese mes
  total += (d.ingresos||[])
    .filter(i => i.cod_fuente === cod && Number(i.mes) === mes)
    .reduce((s,i) => s + (Number(i.valor)||0), 0);
  return total;
}

/* Mods totales de un grupo de ingreso en un trimestre específico */
function getModGrupoIng(d, cod, f, trim){
  return getHijosIng(d, cod).reduce((s,x) => {
    const m = getModsIng(d, x.cod, trim);
    return s + Number(m[f]);
  }, 0);
}

/* Suma de mods de un DETALLE de ingreso a lo largo del año */
function getModsAnioIng(d, cod, field){
  return [1,2,3,4].reduce((s,t) => {
    const m = getModsIng(d, cod, t);
    return s + Number(m[field]);
  }, 0);
}

/* Suma de mods de un GRUPO de ingreso a lo largo del año */
function getModGrupoAnioIng(d, cod, field){
  return getHijosIng(d, cod).reduce((s,x) => s + getModsAnioIng(d, x.cod, field), 0);
}

/* Presupuesto Inicial de ingreso (grupo → suma hijos, detalle → r.ini) */
function getIniIng(d, cod){
  const r = (d.rubros_ing||[]).find(x => x.cod === cod);
  if (!r) return 0;
  if (r.esGrupo) return getHijosIng(d, cod).reduce((s,x) => s + (Number(x.ini)||0), 0);
  return Number(r.ini)||0;
}
