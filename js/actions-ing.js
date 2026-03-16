/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Acciones de Ingresos
══════════════════════════════════════════════════════════ */

/* ── CRUD Rubros de Ingreso ── */
function abrirModalRubroIng(idx=null){
  const d = DB.load();
  $('mri-idx').value = idx !== null ? idx : '';
  $('tit-mri').textContent = idx !== null ? 'Editar Rubro de Ingreso' : 'Nuevo Rubro de Ingreso';
  if (idx !== null){
    const r = (d.rubros_ing||[])[idx];
    if(!r){ toast('Rubro no encontrado','danger'); return; }
    $('mri-cod').value = r.cod; $('mri-guia').value = r.guia||'';
    $('mri-con').value = r.con; $('mri-ini').value = r.ini||0;
    $('mri-esGrupo').checked = !!r.esGrupo;
    $('mri-enBanco').checked = !!r.en_banco;
  } else {
    $('mri-cod').value=''; $('mri-guia').value=''; $('mri-con').value=''; $('mri-ini').value='';
    $('mri-esGrupo').checked = false; $('mri-enBanco').checked = false;
  }
  toggleIniModalIng();
  actualizarNivelBadgeIng();
  new bootstrap.Modal($('mRubroIng')).show();
}

function guardarRubroIng(){
  const cod=$('mri-cod').value.trim(), con=$('mri-con').value.trim();
  const esGrupo = $('mri-esGrupo').checked;
  const ini = esGrupo ? 0 : (Number($('mri-ini').value)||0);
  const en_banco = !esGrupo && $('mri-enBanco').checked;
  if(!cod||!con){ toast('Código y Concepto son obligatorios','danger'); return; }
  const d = DB.load();
  if(!d.rubros_ing) d.rubros_ing = [];
  const idx = $('mri-idx').value;
  const r = {cod, guia:$('mri-guia').value.trim(), con, ini, esGrupo, en_banco};
  if(idx!==''){
    d.rubros_ing[Number(idx)] = r;
  } else {
    d.rubros_ing.push(r);
  }
  d.rubros_ing = sortarRubros(d.rubros_ing);
  DB.save(d);
  bootstrap.Modal.getInstance($('mRubroIng')).hide();
  R.ingresosGeneral(); toast('Rubro de ingreso guardado');
  _verificarBalancePresupuestal();
}

function eliminarRubroIng(idx){
  const d = DB.load();
  const r = (d.rubros_ing||[])[idx];
  if(!r) return;

  // Verificar si el rubro tiene movimientos en algún trimestre
  const cod = r.cod;
  const afectaciones = [];

  // Modificaciones presupuestales (adiciones, reducciones, etc.)
  const mods = (d.mods_ing_form||[]).filter(m => m.cod === cod);
  if(mods.length) afectaciones.push(`${mods.length} modificación(es) presupuestal(es)`);

  // Ingresos registrados
  const ings = (d.ingresos||[]).filter(i => i.cod_fuente === cod);
  if(ings.length) afectaciones.push(`${ings.length} ingreso(s) registrado(s)`);

  // Recaudos manuales
  const rec = (d.recaudos_ing_mes||{})[cod];
  const tieneRecaudo = rec && Object.values(rec).some(v => Number(v) > 0);
  if(tieneRecaudo) afectaciones.push('recaudos registrados');

  // Acuerdos presupuestales
  const acuerdos = (d.acuerdos||[]).filter(a =>
    (a.items_ing||[]).some(it => it.cod === cod));
  if(acuerdos.length) afectaciones.push(`${acuerdos.length} acuerdo(s) presupuestal(es)`);

  if(afectaciones.length > 0){
    alert(`⚠️ No se puede eliminar el rubro "${cod} - ${r.con}" porque tiene:\n\n• ${afectaciones.join('\n• ')}\n\nPrimero elimine estos movimientos desde el trimestre correspondiente.`);
    return;
  }

  if(!confirm(`¿Eliminar la fuente "${r.con}"?`)) return;
  d.rubros_ing.splice(idx, 1);
  d.rubros_ing = sortarRubros(d.rubros_ing);
  DB.save(d); R.ingresosGeneral(); toast('Fuente eliminada','warning');
  _verificarBalancePresupuestal();
}

function guardarPresupIng(){
  const d = DB.load();
  document.querySelectorAll('.inp[data-iidx]').forEach(inp => {
    const idx = Number(inp.dataset.iidx);
    if(d.rubros_ing[idx]) d.rubros_ing[idx].ini = Number(inp.value)||0;
  });
  DB.save(d); R.ingresosGeneral(); toast('Presupuesto de ingresos guardado');
  _verificarBalancePresupuestal();
}

/* ── Registrar Ingresos ── */
function autoMesIng(){
  const f=$('mi-fecha').value;
  if(f){
    const m=Number(f.split('-')[1]);
    if(m) $('mi-mes').value=m;
    const trim = m<=3?1:m<=6?2:m<=9?3:4;
    $('mi-trim').value=trim;
  }
}

function abrirModalIngreso(trim, id=null){
  const d = DB.load();
  $('mi-fuente').innerHTML = optsIng(d,trim);
  $('tit-mi').textContent = id ? 'Editar Ingreso' : 'Registrar Ingreso';
  if(id){
    const ing = d.ingresos.find(x=>x.id===id);
    if(!ing) return;
    $('mi-id').value=id; $('mi-fecha').value=ing.fecha;
    $('mi-mes').value=ing.mes; $('mi-trim').value=ing.trim;
    $('mi-concepto').value=ing.concepto; $('mi-fuente').value=ing.cod_fuente;
    $('mi-naturaleza').value=ing.naturaleza||'adicion'; $('mi-valor').value=ing.valor;
  } else {
    $('mi-id').value=''; $('mi-fecha').value=today(); autoMesIng();
    $('mi-concepto').value=''; $('mi-naturaleza').value='adicion'; $('mi-valor').value='';
  }
  new bootstrap.Modal($('mIngreso')).show();
}

function guardarIngreso(){
  const fecha=$('mi-fecha').value, concepto=$('mi-concepto').value.trim();
  const cod_fuente=$('mi-fuente').value, valor=Number($('mi-valor').value);
  const naturaleza=$('mi-naturaleza').value;
  if(!fecha||!concepto||!cod_fuente||valor<=0){
    toast('Complete Fecha, Concepto, Fuente y Valor','danger'); return;
  }
  const d = DB.load();
  const trim = Number($('mi-trim').value)||1;
  const ing = {
    id: $('mi-id').value||uid(), trim, mes:Number($('mi-mes').value),
    fecha, concepto, cod_fuente, valor, naturaleza
  };
  const idx = d.ingresos.findIndex(x=>x.id===ing.id);
  if(idx>=0){
    const prev = d.ingresos[idx];
    if(prev.cod_fuente!==ing.cod_fuente || prev.trim!==ing.trim)
      recalcularModsIng(d, prev.cod_fuente, prev.trim);
    d.ingresos[idx]=ing;
  } else {
    d.ingresos.push(ing);
  }
  recalcularModsIng(d, ing.cod_fuente, ing.trim);
  DB.save(d);
  bootstrap.Modal.getInstance($('mIngreso')).hide();
  R.ingresosGeneral();
  // Refrescar vista de trimestre si está visible
  R.trimestre(ing.trim);
  toast('Ingreso guardado');
}

function eliminarIngreso(id){
  if(!confirm('Eliminar este ingreso?')) return;
  const d = DB.load();
  const ing = d.ingresos.find(i=>i.id===id);
  d.ingresos = d.ingresos.filter(i=>i.id!==id);
  if(ing) recalcularModsIng(d, ing.cod_fuente, ing.trim);
  DB.save(d);
  R.ingresosGeneral();
  if(ing) R.trimestre(Number(ing.trim));
  toast('Ingreso eliminado','warning');
}

/* ── Guardar modificaciones inline de ingresos ── */
function guardarModIngInline(inp){
  const cod = inp.dataset.cod, f = inp.dataset.f, t = Number(inp.dataset.t);
  const d = DB.load();
  if(!d.mods_ing) d.mods_ing = {};
  if(!d.mods_ing[cod]) d.mods_ing[cod] = {};
  if(!d.mods_ing[cod][t]) d.mods_ing[cod][t] = {adi:0,red:0,cre:0,cco:0};
  d.mods_ing[cod][t][f] = Number(inp.value) || 0;
  DB.save(d);
  inp.style.borderColor = '#1a7a3a';
  inp.style.background = '#d4edda';
  setTimeout(() => { inp.style.borderColor = ''; inp.style.background = ''; }, 900);
}
