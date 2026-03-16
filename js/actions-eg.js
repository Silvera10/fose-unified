/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Acciones de Egresos
══════════════════════════════════════════════════════════ */

/* ── Guardar apropiaciones iniciales desde la hoja de gastos ── */
function guardarPresupBase(){
  const d = DB.load();
  document.querySelectorAll('.inp[data-idx]').forEach(inp => {
    const idx = Number(inp.dataset.idx);
    if (d.rubros[idx] && !d.rubros[idx].esGrupo){
      d.rubros[idx].ini = Number(inp.value) || 0;
    }
  });
  DB.save(d);
  R.general();
  toast('Apropiaciones iniciales guardadas');
}

/* ── Actualizar totales de egresos en UI ── */
function actualizarTotalesEg(){
  R.general();
}

/* ── CRUD Rubros de Egreso ── */
function abrirModalRubro(idx=null){
  const d = DB.load();
  $('mr-idx').value = idx !== null ? idx : '';
  $('tit-mr').textContent = idx !== null ? 'Editar Rubro' : 'Nuevo Rubro de Egreso';
  if (idx !== null){
    const r = (d.rubros||[])[idx];
    if(!r){ toast('Rubro no encontrado','danger'); return; }
    $('mr-cod').value = r.cod; $('mr-guia').value = r.guia||'';
    $('mr-tipo').value = r.tipo||'fun'; $('mr-con').value = r.con;
    $('mr-ini').value = r.ini||0; $('mr-esGrupo').checked = !!r.esGrupo;
    if($('mr-cuenta')) $('mr-cuenta').value = r.cuenta_contable||'';
    if($('mr-nombre-cuenta')) $('mr-nombre-cuenta').value = r.nombre_cuenta||'';
  } else {
    $('mr-cod').value=''; $('mr-guia').value=''; $('mr-tipo').value='fun';
    $('mr-con').value=''; $('mr-ini').value=''; $('mr-esGrupo').checked=false;
    if($('mr-cuenta')) $('mr-cuenta').value = '';
    if($('mr-nombre-cuenta')) $('mr-nombre-cuenta').value = '';
  }
  toggleIniModal();
  actualizarNivelBadge();
  new bootstrap.Modal($('mRubro')).show();
}

function guardarRubro(){
  const cod=$('mr-cod').value.trim(), con=$('mr-con').value.trim();
  if (!cod||!con){ toast('Código y concepto son obligatorios','danger'); return; }
  const d = DB.load();
  const esGrupo = $('mr-esGrupo').checked;
  const r = {
    cod, guia:$('mr-guia').value.trim(), tipo:$('mr-tipo').value,
    con, ini: esGrupo ? 0 : (Number($('mr-ini').value)||0), esGrupo,
    cuenta_contable: $('mr-cuenta') ? $('mr-cuenta').value.trim() : '',
    nombre_cuenta: $('mr-nombre-cuenta') ? $('mr-nombre-cuenta').value.trim() : ''
  };
  const idx = $('mr-idx').value;
  if (idx !== ''){
    d.rubros[Number(idx)] = {...d.rubros[Number(idx)], ...r};
  } else {
    d.rubros.push(r);
    if (!d.mods[cod]) d.mods[cod] = {};
    [1,2,3,4].forEach(t => { if(!d.mods[cod][t]) d.mods[cod][t]={adi:0,red:0,cre:0,cco:0}; });
  }
  d.rubros = sortarRubros(d.rubros);
  DB.save(d);
  bootstrap.Modal.getInstance($('mRubro')).hide();
  R.general(); toast('Rubro guardado');
  _verificarBalancePresupuestal();
}

function eliminarRubro(idx){
  const d = DB.load();
  const r = (d.rubros||[])[idx];
  if(!r) return;

  const cod = r.cod;
  const afectaciones = [];

  // Modificaciones presupuestales
  const mods = (d.mods_eg||[]).filter(m => m.cod === cod);
  if(mods.length) afectaciones.push(`${mods.length} modificación(es) presupuestal(es)`);

  // Gastos registrados
  const gastos = (d.contratos||[]).filter(c => c.cod === cod);
  if(gastos.length) afectaciones.push(`${gastos.length} gasto(s) registrado(s)`);

  // Compromisos
  const comp = (d.compromisos_eg||[]).filter(c => c.cod === cod);
  if(comp.length) afectaciones.push(`${comp.length} compromiso(s)`);

  // Contratos
  const ctos = (d.contratos_full||[]).filter(c => c.rubro === cod);
  if(ctos.length) afectaciones.push(`${ctos.length} contrato(s)`);

  if(afectaciones.length > 0){
    alert(`⚠️ No se puede eliminar el rubro "${cod} - ${r.con}" porque tiene:\n\n• ${afectaciones.join('\n• ')}\n\nPrimero elimine estos movimientos desde el trimestre correspondiente.`);
    return;
  }

  if (!confirm(`¿Eliminar el rubro "${r.cod} - ${r.con}"?`)) return;
  delete d.mods[r.cod];
  d.rubros.splice(idx, 1);
  d.rubros = sortarRubros(d.rubros);
  DB.save(d); R.general(); toast('Rubro eliminado','warning');
  _verificarBalancePresupuestal();
}

/* ── Modificaciones presupuestales ── */
function autoTrimMod(){
  const f = $('mm-fecha').value;
  if(f){
    const m = Number(f.split('-')[1]);
    const trim = m<=3?1:m<=6?2:m<=9?3:4;
    $('mm-trim').value = trim;
  }
}

function setModPpto(tipo){
  $('mm-ppto').value = tipo;
  $('mm-btn-eg').className  = tipo==='eg'  ? 'btn btn-warning btn-sm' : 'btn btn-outline-warning btn-sm';
  $('mm-btn-ing').className = tipo==='ing' ? 'btn btn-success btn-sm' : 'btn btn-outline-success btn-sm';
  const d = DB.load();
  const trim = Number($('mm-trim').value)||1;
  $('mm-rubro').innerHTML = tipo==='ing' ? optsIng(d,trim) : optsEg(d,trim);
  actualizarSaldoMod();
}

function actualizarSaldoMod(){
  const cod = $('mm-rubro').value;
  const trim = Number($('mm-trim').value);
  const tipo = $('mm-tipo').value;
  const valor = Number($('mm-valor').value)||0;
  const ppto = $('mm-ppto').value;
  if(!cod || !trim){ $('mm-saldo-info').innerHTML=''; return; }
  const d = DB.load();
  const esRest = tipo==='reduccion'||tipo==='contracredito';

  if(ppto === 'ing'){
    const rb = (d.rubros_ing||[]).find(r=>r.cod===cod);
    const ini = rb ? Number(rb.ini||0) : 0;
    const pd = getPresupDispIng(d, cod, trim);
    const def = getPresupDefIng(d, cod);
    const rec = getRecaudoEfectivoIng(d, cod, trim);
    const porRec = pd - rec;
    const suficiente = !esRest || valor <= pd;
    const alertCls = !esRest ? 'alert-info' : (suficiente ? 'alert-success' : 'alert-warning');

    $('mm-saldo-info').innerHTML = `
      <div class="alert ${alertCls} py-2 px-3 mb-0" style="font-size:11.5px;border-left:4px solid #145e2c">
        <div class="fw-bold mb-1" style="color:#145e2c">
          <i class="bi bi-info-circle me-1"></i>${rb ? rb.con : cod}
        </div>
        <div class="d-flex flex-wrap gap-3">
          <span><strong>P. Inicial:</strong> ${fmt(ini)}</span>
          <span><strong>P. Definitivo:</strong> ${fmt(def)}</span>
          <span><strong>P. Disponible T${trim}:</strong> <span class="fw-bold">${fmt(pd)}</span></span>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-1">
          <span><strong>Recaudado:</strong> ${fmt(rec)}</span>
          <span><strong>Por recaudar:</strong> <span class="${porRec>0?'text-danger':'text-success'} fw-bold">${fmt(porRec)}</span></span>
          ${esRest && valor>0 ? `<span>| <strong>Monto:</strong> <span class="${suficiente?'text-success':'text-danger'} fw-bold">${fmt(valor)}</span></span>` : ''}
        </div>
      </div>`;
  } else {
    const rb = (d.rubros||[]).find(r=>r.cod===cod);
    const ini = rb ? Number(rb.ini||0) : 0;
    const def = getPresupDef(d, cod);
    const pd = getPresupDisp(d, cod, trim);
    const gas = getGastos(d, cod, trim);
    const comp = getCompromisoEgTrim(d, cod, trim);
    const pagos = getPagoEgTrim(d, cod, trim);
    const saldo = pd - gas;
    const suficiente = !esRest || valor <= saldo;
    const alertCls = !esRest ? 'alert-info' : (suficiente ? 'alert-success' : 'alert-warning');

    $('mm-saldo-info').innerHTML = `
      <div class="alert ${alertCls} py-2 px-3 mb-0" style="font-size:11.5px;border-left:4px solid #003d7a">
        <div class="fw-bold mb-1" style="color:#003d7a">
          <i class="bi bi-info-circle me-1"></i>${rb ? rb.con : cod}
        </div>
        <div class="d-flex flex-wrap gap-3">
          <span><strong>P. Inicial:</strong> ${fmt(ini)}</span>
          <span><strong>P. Definitivo:</strong> ${fmt(def)}</span>
          <span><strong>P. Disponible T${trim}:</strong> <span class="fw-bold">${fmt(pd)}</span></span>
        </div>
        <div class="d-flex flex-wrap gap-3 mt-1">
          <span><strong>Compromisos:</strong> ${fmt(comp)}</span>
          <span><strong>Obligaciones:</strong> ${fmt(gas)}</span>
          <span><strong>Pagos:</strong> ${fmt(pagos)}</span>
          <span><strong>Saldo:</strong> <span class="${saldo<0?'text-danger':'text-success'} fw-bold">${fmt(saldo)}</span></span>
          ${esRest && valor>0 ? `<span>| <strong>Monto:</strong> <span class="${suficiente?'text-success':'text-danger'} fw-bold">${fmt(valor)}</span></span>` : ''}
        </div>
      </div>`;
  }
  $('mm-aviso').innerHTML = '';
}

function abrirModalModEg(trim, id=null, ppto='eg'){
  const d = DB.load();
  const trimNom = {1:'T1 (Ene-Mar)',2:'T2 (Abr-Jun)',3:'T3 (Jul-Sep)',4:'T4 (Oct-Dic)'};
  // Llenar selectores
  $('mm-rubro-ing').innerHTML = optsIng(d,trim);
  $('mm-rubro').innerHTML = optsEg(d,trim);
  $('mm-trim-nombre').textContent = trimNom[trim]||'T'+trim;

  // Limpiar IDs de edición
  window._editBancoId = null;
  window._editModIngId = null;
  window._editModEgId = null;

  if(id){
    // Buscar en _adiciones_banco por cualquiera de sus IDs
    const ab = (d._adiciones_banco||[]).find(x=>x.id===id || x._id_ing===id || x._id_eg===id);
    if(ab){
      // Edición de adición bancaria existente
      window._editBancoId = ab.id;
      window._editModIngId = ab._id_ing;
      window._editModEgId = ab._id_eg;
      $('mm-trim').value=ab.trim;
      $('mm-fecha').value=ab.fecha; $('mm-concepto').value=ab.concepto||'';
      $('mm-rubro-ing').value=ab.cod_ing; $('mm-rubro').value=ab.cod_eg;
      $('mm-valor').value=ab.valor;
    } else {
      // Mod antigua sin registro banco — guardar IDs para limpiar al guardar
      const modIng = (d.mods_ing_form||[]).find(x=>x.id===id);
      const modEg = (d.mods_eg||[]).find(x=>x.id===id);
      if(modIng) window._editModIngId = modIng.id;
      if(modEg) window._editModEgId = modEg.id;
      const mod = modIng || modEg;
      if(!mod) return;
      $('mm-trim').value=mod.trim;
      $('mm-fecha').value=mod.fecha; $('mm-concepto').value=mod.concepto||'';
      if(modIng) $('mm-rubro-ing').value=mod.cod;
      if(modEg) $('mm-rubro').value=mod.cod;
      $('mm-valor').value=mod.valor;
    }
  } else {
    $('mm-trim').value=trim;
    $('mm-fecha').value=today(); $('mm-concepto').value=''; $('mm-valor').value='';
  }
  $('mm-aviso').innerHTML=''; $('mm-saldo-info').innerHTML='';
  actualizarSaldoMod();
  new bootstrap.Modal($('mModEg')).show();
}

/* ── Guardar Adición Bancaria (crea par ingreso + egreso) ── */
function guardarAdicionBancaria(){
  const fecha=$('mm-fecha').value, concepto=$('mm-concepto').value.trim();
  const codIng=$('mm-rubro-ing').value, codEg=$('mm-rubro').value;
  const valor=Number($('mm-valor').value);
  if(!fecha||!concepto||!codIng||!codEg||valor<=0){
    $('mm-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small">Complete todos los campos</div>`;
    return;
  }
  const d = DB.load();
  const trim = Number($('mm-trim').value)||1;
  const mes = Number(fecha.split('-')[1])||1;

  // SIEMPRE eliminar mods anteriores si existen (edición)
  if(window._editModIngId){
    const old = (d.mods_ing_form||[]).find(x=>x.id===window._editModIngId);
    d.mods_ing_form = (d.mods_ing_form||[]).filter(x=>x.id!==window._editModIngId);
    if(old) recalcularModsIng(d, old.cod, Number(old.trim));
  }
  if(window._editModEgId){
    const old = (d.mods_eg||[]).find(x=>x.id===window._editModEgId);
    d.mods_eg = (d.mods_eg||[]).filter(x=>x.id!==window._editModEgId);
    if(old) recalcularMods(d, old.cod, Number(old.trim));
  }
  if(window._editBancoId){
    d._adiciones_banco = (d._adiciones_banco||[]).filter(x=>x.id!==window._editBancoId);
  }

  // Crear mod de ingreso
  const idIng = uid();
  if(!d.mods_ing_form) d.mods_ing_form = [];
  d.mods_ing_form.push({id:idIng, trim, mes, fecha, acuerdo:'', concepto, cod:codIng, tipo:'adicion', valor});
  recalcularModsIng(d, codIng, trim);

  // Crear mod de egreso
  const idEg = uid();
  if(!d.mods_eg) d.mods_eg = [];
  d.mods_eg.push({id:idEg, trim, mes, fecha, acuerdo:'', concepto, cod:codEg, tipo:'adicion', valor});
  recalcularMods(d, codEg, trim);

  // Guardar registro de adición bancaria
  if(!d._adiciones_banco) d._adiciones_banco = [];
  d._adiciones_banco.push({id:uid(), trim, mes, fecha, concepto, cod_ing:codIng, cod_eg:codEg, valor, _id_ing:idIng, _id_eg:idEg});

  // Recalcular recaudos desde cero
  _recalcularRecaudosIng(d);

  DB.save(d);
  bootstrap.Modal.getInstance($('mModEg')).hide();
  R.trimestre(trim); toast('Adición bancaria guardada (Ingreso + Egreso)');
  _verificarBalancePresupuestal();

  // Limpiar referencias
  window._editBancoId = null;
  window._editModIngId = null;
  window._editModEgId = null;
}

/* Recalcular recaudos_ing_mes desde mods_ing_form (fuente única de verdad) */
function _recalcularRecaudosIng(d){
  const rec = {};
  (d.mods_ing_form||[]).forEach(m => {
    if(m.tipo !== 'adicion' && m.tipo !== 'credito') return;
    const rb = (d.rubros_ing||[]).find(r=>r.cod===m.cod);
    if(rb && rb.en_banco) return;
    if(!rec[m.cod]) rec[m.cod] = {};
    const mes = Number(m.mes)||1;
    rec[m.cod][mes] = (rec[m.cod][mes]||0) + Number(m.valor);
  });
  // Conservar recaudos de rubros que no tienen mods (recaudos manuales)
  const viejo = d.recaudos_ing_mes || {};
  Object.keys(viejo).forEach(cod => {
    const rb = (d.rubros_ing||[]).find(r=>r.cod===cod);
    if(rb && rb.en_banco){ delete viejo[cod]; return; }
    const tieneMods = (d.mods_ing_form||[]).some(m=>m.cod===cod && (m.tipo==='adicion'||m.tipo==='credito'));
    if(!tieneMods) rec[cod] = viejo[cod]; // conservar recaudos manuales
  });
  d.recaudos_ing_mes = rec;
}

function guardarModEg(){
  const fecha=$('mm-fecha').value, acuerdo=$('mm-acuerdo').value.trim();
  const concepto=$('mm-concepto').value.trim(), cod=$('mm-rubro').value;
  const tipo=$('mm-tipo').value, valor=Number($('mm-valor').value);
  const ppto=$('mm-ppto').value;
  if(!fecha||!acuerdo||!concepto||!cod||valor<=0){
    $('mm-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small">Complete todos los campos (*)</div>`;
    return;
  }
  const d = DB.load();
  const trim = Number($('mm-trim').value)||1;
  const mes = Number(fecha.split('-')[1])||1;
  const idEdit = $('mm-id').value;

  if(ppto === 'ing'){
    if(!d.mods_ing_form) d.mods_ing_form = [];
    const reg = {id: idEdit||uid(), trim, mes, fecha, acuerdo, concepto, cod, tipo, valor};
    const idx = d.mods_ing_form.findIndex(e=>e.id===reg.id);
    const oldRec = idx>=0 ? {...d.mods_ing_form[idx]} : null;
    if(idx>=0) d.mods_ing_form[idx]=reg; else d.mods_ing_form.push(reg);
    recalcularModsIng(d, cod, trim);
    if(oldRec && (oldRec.cod!==cod || Number(oldRec.trim)!==trim))
      recalcularModsIng(d, oldRec.cod, Number(oldRec.trim));

    /* ── Auto-recaudo: solo si el rubro NO tiene en_banco ──
       Rubros con en_banco=true ya cuentan todo como recaudado automáticamente */
    const _rbIng = (d.rubros_ing||[]).find(r=>r.cod===cod);
    if(!_rbIng || !_rbIng.en_banco){
      if(tipo === 'adicion' || tipo === 'credito'){
        if(!d.recaudos_ing_mes) d.recaudos_ing_mes = {};
        if(!d.recaudos_ing_mes[cod]) d.recaudos_ing_mes[cod] = {};
        const recPrev = Number(d.recaudos_ing_mes[cod][mes]) || 0;
        if(oldRec && oldRec.cod === cod && Number(oldRec.mes) === mes
          && (oldRec.tipo === 'adicion' || oldRec.tipo === 'credito')){
          d.recaudos_ing_mes[cod][mes] = recPrev - Number(oldRec.valor) + valor;
        } else {
          d.recaudos_ing_mes[cod][mes] = recPrev + valor;
        }
      }
      if(oldRec && (oldRec.tipo === 'adicion' || oldRec.tipo === 'credito')
        && (tipo === 'reduccion' || tipo === 'contracredito')){
        if(d.recaudos_ing_mes && d.recaudos_ing_mes[oldRec.cod]){
          const prev = Number(d.recaudos_ing_mes[oldRec.cod][oldRec.mes]) || 0;
          d.recaudos_ing_mes[oldRec.cod][oldRec.mes] = Math.max(0, prev - Number(oldRec.valor));
        }
      }
    }

    DB.save(d);
    bootstrap.Modal.getInstance($('mModEg')).hide();
    R.trimestre(trim); toast('Modificación de Ingresos guardada');
    _verificarBalancePresupuestal();
    return;
  }

  // Validación para reducción/contracrédito
  if(tipo==='reduccion'||tipo==='contracredito'){
    const pd = getPresupDisp(d, cod, trim);
    const gas = getGastos(d, cod, trim);
    let saldAdj = pd - gas;
    if(idEdit){
      const old = (d.mods_eg||[]).find(e=>e.id===idEdit);
      if(old && old.cod===cod && old.trim===trim && old.tipo===tipo) saldAdj += Number(old.valor);
    }
    if(valor > saldAdj){
      $('mm-aviso').innerHTML=`<div class="alert alert-danger py-2 px-2 small">
        El monto (${fmt(valor)}) supera el saldo disponible (${fmt(saldAdj)}).</div>`;
      return;
    }
  }

  if(!d.mods_eg) d.mods_eg = [];
  const reg = {id: idEdit||uid(), trim, mes, fecha, acuerdo, concepto, cod, tipo, valor};
  const idx = d.mods_eg.findIndex(e=>e.id===reg.id);
  const oldRec = idx>=0 ? {...d.mods_eg[idx]} : null;
  if(idx>=0) d.mods_eg[idx]=reg; else d.mods_eg.push(reg);
  recalcularMods(d, cod, trim);
  if(oldRec && (oldRec.cod!==cod || Number(oldRec.trim)!==trim))
    recalcularMods(d, oldRec.cod, Number(oldRec.trim));
  DB.save(d);
  bootstrap.Modal.getInstance($('mModEg')).hide();
  R.trimestre(trim); toast('Modificación guardada');
  _verificarBalancePresupuestal();
}

function eliminarModEg(id){
  if(!confirm('Eliminar esta modificación?')) return;
  const d = DB.load();
  const reg = (d.mods_eg||[]).find(e=>e.id===id);
  d.mods_eg = (d.mods_eg||[]).filter(e=>e.id!==id);
  if(reg) recalcularMods(d, reg.cod, reg.trim);
  DB.save(d); R.trimestre(reg ? reg.trim : 1); toast('Modificación eliminada','warning');
  _verificarBalancePresupuestal();
}

function eliminarModIng(id){
  if(!confirm('Eliminar esta modificación de ingresos?')) return;
  const d = DB.load();
  const reg = (d.mods_ing_form||[]).find(e=>e.id===id);
  d.mods_ing_form = (d.mods_ing_form||[]).filter(e=>e.id!==id);
  if(reg){
    recalcularModsIng(d, reg.cod, Number(reg.trim));
    // Restar auto-recaudo si era adición/crédito (solo si no es en_banco)
    const _delRb = (d.rubros_ing||[]).find(r=>r.cod===reg.cod);
    if(!_delRb || !_delRb.en_banco){
      if((reg.tipo === 'adicion' || reg.tipo === 'credito')
        && d.recaudos_ing_mes && d.recaudos_ing_mes[reg.cod]){
        const prev = Number(d.recaudos_ing_mes[reg.cod][reg.mes]) || 0;
        d.recaudos_ing_mes[reg.cod][reg.mes] = Math.max(0, prev - Number(reg.valor));
      }
    }
  }
  DB.save(d); R.trimestre(reg ? Number(reg.trim) : 1); toast('Modificación eliminada','warning');
  _verificarBalancePresupuestal();
}

function toggleModTrim(tipo, t){
  $('mod-eg-'+t).style.display  = tipo==='eg'  ? '' : 'none';
  $('mod-ing-'+t).style.display = tipo==='ing' ? '' : 'none';
  $('btn-modeg-'+t).className  = tipo==='eg'  ? 'btn btn-light active' : 'btn btn-outline-light';
  $('btn-moding-'+t).className = tipo==='ing' ? 'btn btn-light active' : 'btn btn-outline-light';
}

/* ── Acuerdo Multi-Rubro ── */
function abrirModalAcuerdo(trim){
  const d = DB.load();
  const hdrColors = {1:'#1a7a3a',2:'#0056a6',3:'#c8960c',4:'#8b0000'};
  const trimNom = {1:'T1',2:'T2',3:'T3',4:'T4'};
  $('mAcuerdo-hdr').style.background = hdrColors[trim]||'var(--dorado)';
  $('mac-trim-nom').textContent = trimNom[trim];
  $('mac-trim').value = trim;
  $('mac-fecha').value = today();
  $('mac-acuerdo').value = '';
  $('mac-concepto').value = '';
  $('mac-tipo').value = 'adicion';
  $('mac-aviso').innerHTML = '';
  $('mac-balance').style.display = 'none';
  ['mac-tabla-ing','mac-tabla-eg','mac-tabla-cre','mac-tabla-cco'].forEach(id => $(id).innerHTML = '');
  window._macOptEg  = optsEg(d,trim);
  window._macOptIng = optsIng(d,trim);
  agregarFilaAcuerdo('ing');
  agregarFilaAcuerdo('eg');
  cambiarTipoAcuerdo();
  new bootstrap.Modal($('mAcuerdo')).show();
}

function cambiarTipoAcuerdo(){
  const esT = $('mac-tipo').value === 'traslado';
  $('mac-sec-ing').classList.toggle('d-none', esT);
  $('mac-sec-eg-simple').classList.toggle('d-none', esT);
  $('mac-sec-cre').classList.toggle('d-none', !esT);
  $('mac-sec-cco').classList.toggle('d-none', !esT);
  if (esT){
    if ($('mac-tabla-cre').children.length === 0) agregarFilaAcuerdo('cre');
    if ($('mac-tabla-cco').children.length === 0) agregarFilaAcuerdo('cco');
  }
  actualizarTotalesAcuerdo();
}

function agregarFilaAcuerdo(lado){
  const mapId = {ing:'mac-tabla-ing', eg:'mac-tabla-eg', cre:'mac-tabla-cre', cco:'mac-tabla-cco'};
  const tipoRubro = (lado === 'ing') ? 'ing' : 'eg';
  const opts = (lado === 'ing') ? window._macOptIng : window._macOptEg;
  const tbody = $(mapId[lado]);
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>
      <div class="d-flex gap-1 align-items-center">
        <select class="form-select form-select-sm py-0 mac-sel" data-tipo="${tipoRubro}" style="font-size:11px">${opts}</select>
        <button class="btn btn-sm btn-outline-success py-0 px-1" style="font-size:10px;white-space:nowrap" onclick="crearRubroRapido('${tipoRubro}',this)" title="Crear nuevo rubro">+</button>
      </div>
    </td>
    <td><input type="number" class="form-control form-control-sm py-0 text-end" style="font-size:11px;min-width:120px" placeholder="0" min="0" oninput="actualizarTotalesAcuerdo()"></td>
    <td class="ctr"><button class="btn btn-sm btn-outline-danger py-0 px-1" style="font-size:10px" onclick="this.closest('tr').remove();actualizarTotalesAcuerdo()">X</button></td>`;
  tbody.appendChild(tr);
}

/* ── Crear rubro rápido desde el modal Acuerdo ── */
function crearRubroRapido(tipo, btnEl){
  // Encontrar el <td> padre de la fila y mostrar el mini-form debajo del select
  const td = btnEl.closest('td');
  // Si ya hay un mini-form abierto en esta fila, quitarlo
  const existente = td.querySelector('.mini-rubro-form');
  if (existente){ existente.remove(); return; }
  // Cerrar otros mini-forms abiertos
  document.querySelectorAll('.mini-rubro-form').forEach(el => el.remove());

  const esIng = tipo === 'ing';
  const form = document.createElement('div');
  form.className = 'mini-rubro-form border rounded p-2 mt-1';
  form.style.cssText = 'background:#f8f9fa;font-size:11px;';
  form.innerHTML = `
    <div class="fw-bold mb-1" style="color:${esIng?'var(--verde)':'var(--azul)'}">
      <i class="bi bi-plus-circle me-1"></i>Nuevo Rubro de ${esIng?'Ingreso':'Egreso'}
    </div>
    <div class="row g-1 mb-1">
      <div class="col-3">
        <input class="form-control form-control-sm py-0" style="font-size:11px" id="_nr_cod" placeholder="Código *" title="Ej: 2.1.2.01 o A.1.01">
      </div>
      <div class="${esIng?'col-6':'col-4'}">
        <input class="form-control form-control-sm py-0" style="font-size:11px" id="_nr_con" placeholder="Concepto *" title="Nombre del rubro">
      </div>
      ${!esIng ? '<div class="col-2"><select class="form-select form-select-sm py-0" style="font-size:11px" id="_nr_tipo"><option value="fun">Func.</option><option value="inv">Invers.</option></select></div>' : ''}
      <div class="col-3 d-flex gap-1">
        <button class="btn btn-success btn-sm py-0 px-2 flex-fill" style="font-size:10px" onclick="guardarRubroRapido('${tipo}',this)"><i class="bi bi-check-lg"></i> Crear</button>
        <button class="btn btn-secondary btn-sm py-0 px-1" style="font-size:10px" onclick="this.closest('.mini-rubro-form').remove()">✕</button>
      </div>
    </div>
    <div class="text-muted" style="font-size:10px"><i class="bi bi-info-circle me-1"></i>Saldo inicial $0. Edite desde la Hoja de ${esIng?'Ingresos':'Gastos'}.</div>
    <div id="_nr_aviso" class="text-danger small"></div>`;
  td.appendChild(form);
  form.querySelector('#_nr_cod').focus();
}

function guardarRubroRapido(tipo, btnEl){
  const cod = $('_nr_cod').value.trim();
  const con = $('_nr_con').value.trim();
  if (!cod || !con){
    $('_nr_aviso').textContent = 'Código y Concepto son obligatorios';
    return;
  }

  const d = DB.load();
  const esIng = tipo === 'ing';

  if (esIng){
    // Verificar duplicado
    if ((d.rubros_ing||[]).find(r => r.cod === cod)){
      $('_nr_aviso').textContent = 'Ya existe un rubro de ingreso con ese código';
      return;
    }
    if (!d.rubros_ing) d.rubros_ing = [];
    d.rubros_ing.push({
      cod, con, ini: 0, esGrupo: false, en_banco: false,
      guia: ''
    });
    d.rubros_ing = sortarRubros(d.rubros_ing);
  } else {
    // Verificar duplicado
    if (d.rubros.find(r => r.cod === cod)){
      $('_nr_aviso').textContent = 'Ya existe un rubro de egreso con ese código';
      return;
    }
    d.rubros.push({
      cod, con, ini: 0, esGrupo: false,
      guia: '',
      tipo: ($('_nr_tipo')?$('_nr_tipo').value:'fun')
    });
    // Inicializar mods para el nuevo rubro
    if (!d.mods[cod]) d.mods[cod] = {};
    [1,2,3,4].forEach(t => { if(!d.mods[cod][t]) d.mods[cod][t]={adi:0,red:0,cre:0,cco:0}; });
    d.rubros = sortarRubros(d.rubros);
  }
  DB.save(d);

  // Cerrar mini-form
  document.querySelectorAll('.mini-rubro-form').forEach(el => el.remove());

  // Refrescar las opciones de todos los dropdowns del modal
  _refrescarDropdownsAcuerdo(cod);
  toast(`Rubro ${cod} — ${con} creado`);
}

function _refrescarDropdownsAcuerdo(seleccionarCod){
  const d = DB.load();
  // Reconstruir opciones
  const trim = Number($('mac-trim').value)||1;
  window._macOptEg  = optsEg(d,trim);
  window._macOptIng = optsIng(d,trim);

  // Actualizar todos los selects dentro del modal Acuerdo
  document.querySelectorAll('#mAcuerdo select.mac-sel').forEach(sel => {
    const valAnterior = sel.value;
    const esIng = sel.dataset.tipo === 'ing';
    sel.innerHTML = esIng ? window._macOptIng : window._macOptEg;
    // Restaurar valor previo o seleccionar el nuevo
    if (seleccionarCod && sel.closest('tr') === document.querySelectorAll('#mAcuerdo select.mac-sel:last-of-type')[0]?.closest('tr')){
      sel.value = seleccionarCod;
    } else if (valAnterior) {
      sel.value = valAnterior;
    }
  });

  // Seleccionar el rubro nuevo en el select de la fila donde se hizo clic
  // Buscar el último select que perdió su valor (el de la fila actual)
  document.querySelectorAll('#mAcuerdo select.mac-sel').forEach(sel => {
    if (!sel.value && seleccionarCod){
      sel.value = seleccionarCod;
    }
  });
}

function actualizarTotalesAcuerdo(){
  const sum = id => Array.from($(id).querySelectorAll('input[type=number]')).reduce((s,el) => s + (Number(el.value)||0), 0);
  const esT = $('mac-tipo').value === 'traslado';
  const tIng=esT?0:sum('mac-tabla-ing'), tEg=esT?0:sum('mac-tabla-eg');
  const tCre=esT?sum('mac-tabla-cre'):0, tCco=esT?sum('mac-tabla-cco'):0;
  $('mac-total-ing').textContent = fmt(tIng);
  $('mac-total-eg').textContent = fmt(tEg);
  $('mac-total-cre').textContent = fmt(tCre);
  $('mac-total-cco').textContent = fmt(tCco);
  const bal = $('mac-balance');
  if(esT){
    const ok = Math.abs(tCre-tCco)<1;
    bal.textContent = ok ? `CUADRA: Créditos = Contracréditos = ${fmt(tCre)}` : `NO CUADRA | Cré: ${fmt(tCre)} | CContra: ${fmt(tCco)}`;
    bal.style.cssText = `display:block;padding:3px 8px;border-radius:4px;font-size:12px;${ok?'background:#e8f5e9;color:#1b5e20':'background:#ffebee;color:#c62828'}`;
  } else if(tIng>0||tEg>0){
    const ok = Math.abs(tIng-tEg)<1;
    bal.textContent = ok ? `CUADRA: Ing = Eg = ${fmt(tIng)}` : `NO CUADRA | Ing: ${fmt(tIng)} | Eg: ${fmt(tEg)}`;
    bal.style.cssText = `display:block;padding:3px 8px;border-radius:4px;font-size:12px;${ok?'background:#e8f5e9;color:#1b5e20':'background:#ffebee;color:#c62828'}`;
  } else { bal.style.display='none'; }
}

function guardarAcuerdo(){
  const fecha=$('mac-fecha').value, acuerdo=$('mac-acuerdo').value.trim();
  const concepto=$('mac-concepto').value.trim(), tipo=$('mac-tipo').value;
  const trim=Number($('mac-trim').value);
  if(!fecha||!concepto){
    $('mac-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small mt-2">Complete Fecha y Concepto.</div>`;
    return;
  }
  const esT = tipo==='traslado';
  const getFilas = id => Array.from($(id).querySelectorAll('tr'))
    .map(tr => ({cod:tr.querySelector('select').value, valor:Number(tr.querySelector('input[type=number]').value)||0}))
    .filter(f => f.valor>0);
  const filasIng=esT?[]:getFilas('mac-tabla-ing'), filasEg=esT?[]:getFilas('mac-tabla-eg');
  const filasCre=esT?getFilas('mac-tabla-cre'):[], filasCco=esT?getFilas('mac-tabla-cco'):[];

  if(!esT && filasEg.length===0){
    $('mac-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small mt-2">Agregue al menos un egreso.</div>`;return;}
  if(esT && (filasCre.length===0||filasCco.length===0)){
    $('mac-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small mt-2">Agregue créditos y contracréditos.</div>`;return;}
  if(esT){
    const tCre=filasCre.reduce((s,f)=>s+f.valor,0), tCco=filasCco.reduce((s,f)=>s+f.valor,0);
    if(Math.abs(tCre-tCco)>=1){
      $('mac-aviso').innerHTML=`<div class="alert alert-danger py-1 px-2 small mt-2">El traslado no cuadra.</div>`;return;}
  }

  const mes = Number((fecha||'').split('-')[1])||1;
  const d = DB.load();
  if(!d.mods_eg) d.mods_eg=[];
  if(!d.mods_ing_form) d.mods_ing_form=[];
  const afEg=new Set(), afIng=new Set();

  filasEg.forEach(f => { d.mods_eg.push({id:uid(),cod:f.cod,trim,mes,fecha,acuerdo,concepto,tipo,valor:f.valor}); afEg.add(f.cod); });
  filasCre.forEach(f => { d.mods_eg.push({id:uid(),cod:f.cod,trim,mes,fecha,acuerdo,concepto,tipo:'credito',valor:f.valor}); afEg.add(f.cod); });
  filasCco.forEach(f => { d.mods_eg.push({id:uid(),cod:f.cod,trim,mes,fecha,acuerdo,concepto,tipo:'contracredito',valor:f.valor}); afEg.add(f.cod); });
  filasIng.forEach(f => { d.mods_ing_form.push({id:uid(),cod:f.cod,trim,mes,fecha,acuerdo,concepto,tipo,valor:f.valor}); afIng.add(f.cod); });

  afEg.forEach(cod => recalcularMods(d, cod, trim));
  afIng.forEach(cod => recalcularModsIng(d, cod, trim));
  DB.save(d);
  bootstrap.Modal.getInstance($('mAcuerdo')).hide();
  R.trimestre(trim);
  const _nEg = filasEg.length+filasCre.length+filasCco.length;
  const _nIng = filasIng.length;
  toast(`Movimiento registrado (${_nEg} egresos${_nIng?', '+_nIng+' ingresos':''})`);

  // ═══ Verificar balance después de guardar acuerdo ═══
  _verificarBalancePresupuestal();
}

/* ── Gastos ── */
function autoMes(){
  const f = $('mg-fecha').value;
  if(f){ const m = Number(f.split('-')[1]); if(m) $('mg-mes').value = m; }
}

function filtrarMesesModal(trim){
  const meses = MESES_TRIM[trim] || [1,2,3];
  $('mg-mes').value = meses[0];
}

function abrirModalGasto(trim, id=null){
  const d = DB.load();
  $('mg-rubro').innerHTML = optsEg(d,trim);
  $('mg-trim').value = trim;
  filtrarMesesModal(trim);
  const hdrColors = {1:'#1a7a3a',2:'#0056a6',3:'#c8960c',4:'#8b0000'};
  $('mGasto-header').style.background = hdrColors[trim]||'var(--azul)';
  const trimNom = {1:'T1',2:'T2',3:'T3',4:'T4'};

  if(id){
    const c = d.contratos.find(x=>x.id===id);
    if(!c) return;
    // Proteger gastos vinculados a contratos
    if(c.origen === 'contrato'){
      toast('Este gasto fue generado desde un contrato. Edítelo desde Gestión de Contratos.','warning');
      return;
    }
    $('mg-id').value=id; $('tit-mg').textContent='Editar Gasto '+trimNom[trim];
    $('mg-fecha').value=c.fecha; $('mg-mes').value=c.mes||MESES_TRIM[trim][0];
    $('mg-comp').value=c.comp||''; $('mg-prov').value=c.prov;
    $('mg-tipodoc').value=c.tipodoc||'CC'; $('mg-numdoc').value=c.numdoc||'';
    $('mg-concepto').value=c.concepto;
    $('mg-fecha-cdp').value=c.fecha_cdp||''; $('mg-cdp').value=c.cdp||'';
    $('mg-fecha-rp').value=c.fecha_rp||''; $('mg-rp').value=c.rp||'';
    $('mg-fecha-contrato').value=c.fecha_contrato||''; $('mg-ncon').value=c.ncon||'';
    $('mg-rubro').value=c.cod_rubro;
    $('mg-valor').value=c.valor; $('mg-pub').checked=!!c.pub; $('mg-cont').checked=!!c.cont;
  } else {
    $('mg-id').value=''; $('tit-mg').textContent='Registrar Gasto — '+trimNom[trim];
    $('mg-fecha').value=today(); autoMes();
    $('mg-comp').value=''; $('mg-prov').value='';
    $('mg-tipodoc').value='CC'; $('mg-numdoc').value='';
    $('mg-concepto').value='';
    $('mg-fecha-cdp').value=''; $('mg-cdp').value='';
    $('mg-fecha-rp').value=''; $('mg-rp').value='';
    $('mg-fecha-contrato').value=''; $('mg-ncon').value='';
    $('mg-valor').value=''; $('mg-pub').checked=false; $('mg-cont').checked=false;
  }
  $('mg-aviso').innerHTML='';
  mostrarSaldo();
  new bootstrap.Modal($('mGasto')).show();
}

function mostrarSaldo(){
  const d = DB.load();
  const trim = Number($('mg-trim').value);
  const cod = $('mg-rubro').value;
  if(!cod) return;
  const pd = getPresupDisp(d, cod, trim);
  const gas = d.contratos.filter(c=>c.cod_rubro===cod&&Number(c.trim)===trim&&c.id!==($('mg-id').value||'__'))
    .reduce((s,c)=>s+Number(c.valor),0);
  const saldo = pd - gas;
  const val = Number($('mg-valor').value)||0;
  const cls = val > saldo ? 'warning' : 'info';
  $('mg-aviso').innerHTML = `<div class="alert alert-${cls} py-1 px-2 small mb-0">
    P.Disp T${trim}: ${fmt(pd)} | Ejecutado: ${fmt(gas)} | <strong>Saldo: ${fmt(saldo)}</strong>
    ${val>saldo?'<br><i class="bi bi-exclamation-triangle text-danger"></i> Supera el saldo':''}
  </div>`;
}

function guardarGasto(){
  const fecha=$('mg-fecha').value, concepto=$('mg-concepto').value.trim();
  const prov=$('mg-prov').value.trim(), valor=Number($('mg-valor').value);
  const cod_rubro=$('mg-rubro').value;
  if(!fecha||!concepto||valor<=0||!cod_rubro){
    toast('Complete los campos obligatorios','danger'); return;
  }
  const d = DB.load();
  // Validar que el rubro exista en el presupuesto
  const rubroExiste = (d.rubros||[]).find(r => r.cod === cod_rubro && !r.esGrupo);
  if(!rubroExiste){
    toast('El rubro "'+cod_rubro+'" no existe en el presupuesto. Verifique.','danger'); return;
  }
  const trim = Number($('mg-trim').value);
  const c = {
    id: $('mg-id').value||uid(), trim, mes:Number($('mg-mes').value),
    fecha, comp:$('mg-comp').value.trim(), concepto, prov,
    tipodoc:$('mg-tipodoc').value, numdoc:$('mg-numdoc').value.trim(),
    fecha_cdp:$('mg-fecha-cdp').value, cdp:$('mg-cdp').value.trim(),
    fecha_rp:$('mg-fecha-rp').value, rp:$('mg-rp').value.trim(),
    fecha_contrato:$('mg-fecha-contrato').value, ncon:$('mg-ncon').value.trim(),
    cod_rubro, valor, pub:$('mg-pub').checked, cont:$('mg-cont').checked
  };
  const idx = d.contratos.findIndex(x=>x.id===c.id);
  if(idx>=0) d.contratos[idx]=c; else d.contratos.push(c);
  DB.save(d);
  bootstrap.Modal.getInstance($('mGasto')).hide();
  R.trimestre(trim); toast('Gasto guardado');
}

function eliminarGasto(id, trim){
  const d = DB.load();
  // Proteger gastos vinculados a contratos
  const gasto = (d.contratos||[]).find(c => c.id === id);
  if(gasto && gasto.origen === 'contrato'){
    toast('Este gasto está vinculado a un contrato. Elimínelo desde Gestión de Contratos.','warning');
    return;
  }
  if(!confirm('Eliminar este gasto?')) return;
  d.contratos = d.contratos.filter(c=>c.id!==id);
  DB.save(d); R.trimestre(trim); toast('Gasto eliminado','warning');
  _verificarBalancePresupuestal();
}

/* ── Compromisos ── */
function abrirModalCompEg(trim, id){
  const d = DB.load();
  $('mce-trim').value = trim; $('mce-id').value = id||'';
  $('mce-aviso').innerHTML = '';
  $('mce-rubro').innerHTML = optsEg(d,trim);
  if(id){
    const e = (d.compromisos_eg||[]).find(x=>x.id===id);
    if(e){ $('mce-rubro').value=e.cod; $('mce-valor').value=e.valor; }
    $('tit-mce').textContent = 'Editar Compromiso';
  } else {
    $('mce-valor').value = ''; $('tit-mce').textContent = 'Registrar Compromiso';
  }
  new bootstrap.Modal($('mCompEg')).show();
}

function guardarCompEg(){
  const cod=$('mce-rubro').value, trim=Number($('mce-trim').value);
  const valor=Number($('mce-valor').value), id=$('mce-id').value;
  if(!cod||!(valor>=0)){ alert('Complete todos los campos.'); return; }
  const d = DB.load();
  if(!d.compromisos_eg) d.compromisos_eg = [];
  d.compromisos_eg = d.compromisos_eg.filter(e => !((e.cod===cod&&Number(e.trim)===trim)||(id&&e.id===id)));
  if(valor>0) d.compromisos_eg.push({id:id||uid(), cod, trim, valor});
  DB.save(d);
  bootstrap.Modal.getInstance($('mCompEg')).hide();
  if(trim>0) R.trimestre(trim);
  toast('Compromiso guardado');
}

function eliminarCompEg(id){
  if(!confirm('Eliminar este compromiso?')) return;
  const d = DB.load();
  const e = (d.compromisos_eg||[]).find(x=>x.id===id);
  d.compromisos_eg = (d.compromisos_eg||[]).filter(x=>x.id!==id);
  DB.save(d);
  if(e && Number(e.trim)>0) R.trimestre(Number(e.trim));
  toast('Compromiso eliminado');
}

/* ── Imprimir Hoja de Egresos ── */
function imprimirHojaEgresos(){
  const d = DB.load();
  const cfg = d.config||{};
  const rubros = d.rubros||[];
  let rows = '';
  let gTotalIni=0, gTotalDef=0;

  rubros.forEach(r => {
    const nivel = getNivel(r.cod);
    const esGrupo = !!r.esGrupo;
    const ini = esGrupo ? sumarIniHojas(rubros, r.cod) : (Number(r.ini)||0);
    const def = esGrupo ? sumarHojasEg(d, r.cod, cod => getPresupDef(d, cod)) : getPresupDef(d, r.cod);
    const mods = def - ini;
    const label = GRUPO_LABELS[r.cod] || r.con;
    const ctaOk = !esGrupo && r.cuenta_contable;
    const ctaBadge = esGrupo ? '' : (ctaOk
      ? '<span style="color:#198754;font-size:11px"> ✔ '+r.cuenta_contable+'</span>'
      : '<span style="color:#cc8800;font-size:11px"> ⚠ Sin cuenta</span>');

    if(esGrupo && nivel<=2){
      rows += '<tr style="background:#003d7a;color:#fff;font-weight:bold"><td>'+r.cod+'</td><td colspan="2">'+label+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
      if(nivel===1){ gTotalIni+=sumarIniHojas(rubros,r.cod); gTotalDef+=sumarHojasEg(d,r.cod,cod=>getPresupDef(d,cod)); }
    } else if(esGrupo){
      rows += '<tr style="background:#e8f0fe;font-weight:bold"><td>'+r.cod+'</td><td colspan="2">'+label+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
    } else {
      rows += '<tr><td>'+r.cod+'</td><td>'+(r.guia||'')+'</td><td>'+r.con+ctaBadge+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
    }
  });

  if(rubros.filter(r=>getNivel(r.cod)===1).length===0){ gTotalIni=0; gTotalDef=0; rubros.filter(r=>!r.esGrupo).forEach(r=>{gTotalIni+=Number(r.ini)||0; gTotalDef+=getPresupDef(d,r.cod);}); }

  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Hoja de Egresos</title>
<style>
  @page{size:letter landscape;margin:1.5cm}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;margin:0;padding:15px}
  .hdr{text-align:center;margin-bottom:15px}
  .hdr h3{margin:3px 0;font-size:14px}
  .hdr p{margin:2px 0;font-size:11px;color:#555}
  table{width:100%;border-collapse:collapse}
  th{background:#003d7a;color:#fff;padding:5px 8px;text-align:center;font-size:10px}
  td{padding:4px 8px;border-bottom:1px solid #ddd;font-size:10px}
  .n{text-align:right;font-variant-numeric:tabular-nums}
  .tot{background:#003d7a;color:#fff;font-weight:bold}
  @media print{body{padding:0}}
</style></head><body>
<div class="hdr">
  <p>REPÚBLICA DE COLOMBIA</p>
  <p>${cfg.secretaria||'SECRETARÍA DE EDUCACIÓN'}</p>
  <h3>${cfg.nombre||'INSTITUCIÓN EDUCATIVA'}</h3>
  <p>NIT: ${cfg.nit||''} — ${cfg.municipio||''}, ${cfg.departamento||''}</p>
  <h3>PRESUPUESTO DE EGRESOS — Vigencia ${cfg.vigencia||new Date().getFullYear()}</h3>
</div>
<table>
  <thead><tr><th>Código</th><th>Guía</th><th>Concepto</th><th>Aprop. Inicial</th><th>Modificaciones</th><th>Presup. Definitivo</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr class="tot"><td colspan="3" style="text-align:right">TOTAL GENERAL EGRESOS</td><td class="n">${fmt(gTotalIni)}</td><td class="n">${fmt(gTotalDef-gTotalIni)}</td><td class="n">${fmt(gTotalDef)}</td></tr></tfoot>
</table>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
  w.document.close();
}

/* ── Imprimir Hoja de Ingresos ── */
function imprimirHojaIngresos(){
  const d = DB.load();
  const cfg = d.config||{};
  const rubros = d.rubros_ing||[];
  let rows = '';
  let gTotalIni=0, gTotalDef=0;

  rubros.forEach(r => {
    const nivel = getNivel(r.cod);
    const esGrupo = !!r.esGrupo;
    const ini = esGrupo ? sumarIniHojas(rubros, r.cod) : (Number(r.ini)||0);
    const def = esGrupo ? sumarHojasIng(d, r.cod, cod => getPresupDefIng(d, cod)) : getPresupDefIng(d, r.cod);
    const mods = def - ini;
    const label = GRUPO_LABELS[r.cod] || r.con;
    const bancoIcon = !esGrupo && r.en_banco ? ' <span style="color:#198754;font-size:10px">🏦</span>' : '';

    if(esGrupo && nivel<=2){
      rows += '<tr style="background:#1a6b3a;color:#fff;font-weight:bold"><td>'+r.cod+'</td><td colspan="2">'+label+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
      if(nivel===1){ gTotalIni+=sumarIniHojas(rubros,r.cod); gTotalDef+=sumarHojasIng(d,r.cod,cod=>getPresupDefIng(d,cod)); }
    } else if(esGrupo){
      rows += '<tr style="background:#e8f5e9;font-weight:bold"><td>'+r.cod+'</td><td colspan="2">'+label+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
    } else {
      rows += '<tr><td>'+r.cod+'</td><td>'+(r.guia||'')+'</td><td>'+r.con+bancoIcon+'</td><td class="n">'+fmt(ini)+'</td><td class="n">'+fmt(mods)+'</td><td class="n">'+fmt(def)+'</td></tr>';
    }
  });

  if(rubros.filter(r=>getNivel(r.cod)===1).length===0){ gTotalIni=0; gTotalDef=0; rubros.filter(r=>!r.esGrupo).forEach(r=>{gTotalIni+=Number(r.ini)||0; gTotalDef+=getPresupDefIng(d,r.cod);}); }

  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Hoja de Ingresos</title>
<style>
  @page{size:letter landscape;margin:1.5cm}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;margin:0;padding:15px}
  .hdr{text-align:center;margin-bottom:15px}
  .hdr h3{margin:3px 0;font-size:14px}
  .hdr p{margin:2px 0;font-size:11px;color:#555}
  table{width:100%;border-collapse:collapse}
  th{background:#1a6b3a;color:#fff;padding:5px 8px;text-align:center;font-size:10px}
  td{padding:4px 8px;border-bottom:1px solid #ddd;font-size:10px}
  .n{text-align:right;font-variant-numeric:tabular-nums}
  .tot{background:#1a6b3a;color:#fff;font-weight:bold}
  @media print{body{padding:0}}
</style></head><body>
<div class="hdr">
  <p>REPÚBLICA DE COLOMBIA</p>
  <p>${cfg.secretaria||'SECRETARÍA DE EDUCACIÓN'}</p>
  <h3>${cfg.nombre||'INSTITUCIÓN EDUCATIVA'}</h3>
  <p>NIT: ${cfg.nit||''} — ${cfg.municipio||''}, ${cfg.departamento||''}</p>
  <h3>PRESUPUESTO DE INGRESOS — Vigencia ${cfg.vigencia||new Date().getFullYear()}</h3>
</div>
<table>
  <thead><tr><th>Código</th><th>Guía</th><th>Concepto</th><th>Aprop. Inicial</th><th>Modificaciones</th><th>Presup. Definitivo</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr class="tot"><td colspan="3" style="text-align:right">TOTAL GENERAL INGRESOS</td><td class="n">${fmt(gTotalIni)}</td><td class="n">${fmt(gTotalDef-gTotalIni)}</td><td class="n">${fmt(gTotalDef)}</td></tr></tfoot>
</table>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
  w.document.close();
}
