/* ══════════════════════════════════════════════════════════
   actions-pagos-dian.js  ·  CRUD Pagos DIAN / Impuestos
   ══════════════════════════════════════════════════════════ */

/* ── Mapeo concepto → cuenta contable predeterminada ── */
const _PD_CUENTAS = {
  'Retención en la Fuente': {cuenta:'236505', nombre:'Retención en la Fuente por Pagar'},
  'IVA':                     {cuenta:'240804', nombre:'IVA por Pagar'},
  'Retención de ICA':        {cuenta:'236801', nombre:'Retención de ICA por Pagar'},
  'Estampilla Pro-Desarrollo':{cuenta:'244001', nombre:'Estampilla Pro-Desarrollo por Pagar'},
  'Estampilla Pro-Cultura':  {cuenta:'244002', nombre:'Estampilla Pro-Cultura por Pagar'},
  'Estampilla Pro-Anciano':  {cuenta:'244003', nombre:'Estampilla Pro-Anciano por Pagar'},
  'Aportes Parafiscales':    {cuenta:'237006', nombre:'Aportes Parafiscales por Pagar'},
  'Seguridad Social':        {cuenta:'237005', nombre:'Seguridad Social por Pagar'}
};

/* ── Auto-llenar cuenta contable según concepto seleccionado ── */
function _pdConceptoChange(){
  const concepto = $('pd-concepto')?.value || '';
  const map = _PD_CUENTAS[concepto];
  if(map){
    if($('pd-cuenta')) $('pd-cuenta').value = map.cuenta;
    if($('pd-nombre-cuenta')) $('pd-nombre-cuenta').value = map.nombre;
  }
}

/* ── Valor en letras (actualización en vivo) ── */
function _pdActualizarLetras(){
  const v = Number($('pd-valor')?.value) || 0;
  const el = $('pd-valor-letras');
  if(el) el.textContent = v > 0 ? numALetras(v) : '—';
}


/* ── Cargar bancos de la institución activa ── */
function _pdCargarBancos(){
  const sel = $('pd-banco');
  if(!sel) return [];
  const d = DB.load();
  const cfg = d.config || {};

  // Solo cuentas bancarias configuradas en esta institución
  const cuentas = [];
  for(let i = 1; i <= 3; i++){
    const banco = (cfg['banco_' + i] || '').trim();
    const cuenta = (cfg['cuenta_' + i] || '').trim();
    const tipo = cfg['tipo_cuenta_' + i] || 'Ahorros';
    if(banco) cuentas.push({ banco, cuenta, tipo });
  }
  // Legacy: campo "banco" sin número
  if(cuentas.length === 0 && cfg.banco) cuentas.push({ banco: cfg.banco.trim(), cuenta: cfg.cuenta_banco || '', tipo: 'Ahorros' });

  sel.innerHTML = '<option value="">— Seleccionar —</option>';
  if(cuentas.length === 0){
    sel.innerHTML += '<option value="" disabled>⚠ No hay cuentas configuradas</option>';
    return [];
  }
  cuentas.forEach(c => {
    const label = c.cuenta ? c.banco + ' — ' + c.tipo + ' ' + c.cuenta : c.banco;
    sel.innerHTML += `<option value="${c.banco}">${label}</option>`;
  });

  return cuentas.map(c => c.banco);
}

/* ── Obtener banco predeterminado (último usado o primer banco de la institución) ── */
function _pdBancoPredeterminado(){
  const d = DB.load();
  const pagos = d.pagos_dian || [];
  // Buscar el banco del último pago DIAN que tenga banco_origen
  for(let i = pagos.length - 1; i >= 0; i--){
    if(pagos[i].banco_origen) return pagos[i].banco_origen;
  }
  // Si no hay pagos previos, usar el primer banco de la institución
  const cfg = d.config || {};
  if(cfg.banco_1) return cfg.banco_1.trim();
  if(cfg.banco_2) return cfg.banco_2.trim();
  if(cfg.banco_3) return cfg.banco_3.trim();
  return '';
}

/* ── Abrir modal (nuevo o editar) ── */
function abrirModalPagoDian(id=null){
  $('tit-mpd').textContent = id ? 'Editar Pago DIAN' : 'Nuevo Pago DIAN';

  // Cargar bancos de la institución activa
  const bancos = _pdCargarBancos();

  // Vincular evento concepto → auto-llenar cuenta contable
  if($('pd-concepto')) $('pd-concepto').onchange = _pdConceptoChange;

  if(id){
    // ═══ EDITAR pago existente ═══
    const d = DB.load();
    const p = (d.pagos_dian||[]).find(x => x.id === id);
    if(!p) return;
    $('pd-id').value            = id;
    $('pd-num-egreso').value    = p.num_egreso || '';
    $('pd-fecha').value         = p.fecha || '';
    $('pd-concepto').value      = p.concepto || '';
    $('pd-periodo').value       = p.periodo || '';
    $('pd-formulario').value    = p.formulario_dian || '';
    $('pd-valor').value         = p.valor || '';
    $('pd-beneficiario').value  = p.beneficiario || 'DIAN - Dirección de Impuestos y Aduanas Nacionales';
    $('pd-nit').value           = p.nit_beneficiario || '800197268';
    $('pd-medio').value         = p.medio_pago || 'Transferencia electrónica';
    $('pd-banco').value         = p.banco_origen || '';
    $('pd-comprobante-banco').value = p.num_comprobante_banco || '';
    $('pd-cuenta').value        = p.cuenta_contable || '';
    $('pd-nombre-cuenta').value = p.nombre_cuenta || '';
    $('pd-observaciones').value = p.observaciones || '';
  } else {
    // ═══ NUEVO pago — pre-llenar campos fijos ═══
    $('pd-id').value            = '';
    // Auto-consecutivo de egreso (mismo algoritmo que contratos)
    const _dTmp = DB.load();
    const _numEgs = [
      ...((_dTmp.contratos_full||[]).map(c=>Number(c.num_egreso)||0)),
      ...((_dTmp.pagos_dian||[]).map(p=>Number(p.num_egreso)||0)),
      ...((_dTmp.contratos||[]).map(c=>Number(c.comp)||0))
    ].filter(n=>n>0);
    const _sigEg = _numEgs.length ? Math.max(..._numEgs) + 1 : (Number(_dTmp.config.vigencia||2026)*1000 + 1);
    $('pd-num-egreso').value    = String(_sigEg);
    $('pd-fecha').value         = today();
    $('pd-concepto').value      = 'Retención en la Fuente';
    $('pd-periodo').value       = '';
    $('pd-formulario').value    = '';
    $('pd-valor').value         = '';
    // Beneficiario y pago — siempre los mismos
    $('pd-beneficiario').value  = 'DIAN - Dirección de Impuestos y Aduanas Nacionales';
    $('pd-nit').value           = '800197268';
    $('pd-medio').value         = 'Transferencia electrónica';
    // Banco — auto-seleccionar el más usado
    const bancoDef = _pdBancoPredeterminado();
    $('pd-banco').value         = bancoDef;
    $('pd-comprobante-banco').value = '';
    // Contabilidad — cuenta de retención por defecto
    const mapDef = _PD_CUENTAS['Retención en la Fuente'] || {};
    $('pd-cuenta').value        = mapDef.cuenta || '236505';
    $('pd-nombre-cuenta').value = mapDef.nombre || 'Retención en la Fuente por Pagar';
    $('pd-observaciones').value = '';
  }

  // ═══ Auditoría de consecutivos ═══
  _auditExcluirId = id || '';
  _mostrarHintsIniciales([
    ['pd-num-egreso', 'hint-pd-egreso', 'egreso']
  ]);

  _pdActualizarLetras();
  new bootstrap.Modal($('mPagoDian')).show();
}

/* ── Guardar pago ── */
function guardarPagoDian(){
  const numEgreso = $('pd-num-egreso').value.trim();
  const fecha     = $('pd-fecha').value.trim();
  const concepto  = $('pd-concepto').value.trim();
  const valor     = Number($('pd-valor').value) || 0;

  if(!numEgreso || !fecha || !concepto){
    toast('N° Egreso, Fecha y Concepto son obligatorios','danger');
    return;
  }
  if(valor <= 0){
    toast('El valor debe ser mayor a cero','danger');
    return;
  }

  // ═══ Auditoría: impedir guardar con N° Egreso duplicado ═══
  _auditExcluirId = $('pd-id').value || '';
  if(_validarDuplicados([
    ['pd-num-egreso', 'hint-pd-egreso', 'egreso', 'N° Egreso']
  ])) return;

  const pago = {
    id:                   $('pd-id').value || uid(),
    num_egreso:           numEgreso,
    fecha:                fecha,
    concepto:             concepto,
    periodo:              $('pd-periodo').value.trim(),
    formulario_dian:      $('pd-formulario').value.trim(),
    valor:                valor,
    cuenta_contable:      $('pd-cuenta').value.trim(),
    nombre_cuenta:        $('pd-nombre-cuenta').value.trim(),
    medio_pago:           $('pd-medio').value.trim(),
    banco_origen:         $('pd-banco').value.trim(),
    num_comprobante_banco:$('pd-comprobante-banco').value.trim(),
    beneficiario:         $('pd-beneficiario').value.trim(),
    nit_beneficiario:     $('pd-nit').value.trim(),
    observaciones:        $('pd-observaciones').value.trim()
  };

  const d = DB.load();
  if(!d.pagos_dian) d.pagos_dian = [];
  const idx = d.pagos_dian.findIndex(x => x.id === pago.id);
  if(idx >= 0) d.pagos_dian[idx] = pago;
  else d.pagos_dian.push(pago);

  DB.save(d);
  bootstrap.Modal.getInstance($('mPagoDian')).hide();
  R.pagosDian();
  toast('Pago guardado correctamente');
}

/* ── Eliminar pago ── */
function eliminarPagoDian(id){
  if(!confirm('¿Eliminar este pago del registro?')) return;
  const d = DB.load();
  d.pagos_dian = (d.pagos_dian||[]).filter(p => p.id !== id);
  DB.save(d);
  R.pagosDian();
  toast('Pago eliminado','warning');
}
