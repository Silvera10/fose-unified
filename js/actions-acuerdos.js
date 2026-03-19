/* ══════════════════════════════════════════════════════════
   actions-acuerdos.js · CRUD Acuerdos Presupuestales
   + Generación de documento oficial
   ══════════════════════════════════════════════════════════ */

/* ── Opciones de rubros para los selects ── */
let _acpOptEg = '', _acpOptIng = '';

function _acpRefrescarOpts(){
  const d = DB.load();
  const trim = Number(($('acp-trim')||{}).value)||1;
  _acpOptEg  = optsEg(d,trim);
  _acpOptIng = optsIng(d,trim);
}

/* ── Consecutivo automático ── */
function _acpSiguienteNumero(tipo){
  const d = DB.load();
  const prefijos = {adicion:'AD', reduccion:'RE', traslado:'TR'};
  const pref = prefijos[tipo] || 'AC';
  const acuerdos = (d.acuerdos||[]).filter(a => a.tipo === tipo);
  const nums = acuerdos.map(a => {
    const m = (a.numero||'').match(/(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 0;
  return pref + '-' + String(max + 1).padStart(3, '0');
}

/* ── Texto base de considerandos según tipo ── */
function _acpConsiderandosBase(tipo){
  const d = DB.load();
  const vig = d.config.vigencia || new Date().getFullYear();
  const base = `Que de conformidad con lo establecido en la Ley 715 de 2001, el Decreto 4791 de 2008 y el Decreto 1075 de 2015, el Consejo Directivo es el órgano competente para autorizar adiciones, reducciones y traslados presupuestales del Fondo de Servicios Educativos.\n\nQue el presupuesto del Fondo de Servicios Educativos debe atender las necesidades prioritarias de la institución educativa, garantizando la adecuada prestación del servicio educativo.\n\n`;
  if(tipo === 'adicion')
    return base + `Que existen recursos disponibles que deben ser incorporados al presupuesto de la vigencia fiscal ${vig}, con el fin de atender las necesidades de funcionamiento e inversión de la institución.\n\nQue en cumplimiento del principio de equilibrio presupuestal, toda adición al presupuesto de gastos debe estar respaldada con una fuente de ingreso de igual cuantía.\n\nQue en mérito de lo expuesto, el Consejo Directivo procede a autorizar la presente adición presupuestal.`;
  if(tipo === 'reduccion')
    return base + `Que se hace necesario ajustar el presupuesto de la vigencia fiscal ${vig} reduciendo algunas partidas presupuestales para adecuarlo a las necesidades reales de la institución.\n\nQue los recursos objeto de reducción no se encuentran comprometidos ni en proceso de ejecución.\n\nQue en mérito de lo expuesto, el Consejo Directivo procede a autorizar la presente reducción presupuestal.`;
  return base + `Que se hace necesario trasladar recursos entre rubros presupuestales para la vigencia fiscal ${vig}, con el fin de atender necesidades prioritarias de la institución educativa.\n\nQue el traslado presupuestal no afecta compromisos adquiridos y permite una mejor ejecución de los recursos del Fondo de Servicios Educativos.\n\nQue en mérito de lo expuesto, el Consejo Directivo procede a autorizar el presente traslado presupuestal.`;
}

/* ── Auto-trimestre desde fecha ── */
function _acpAutoTrim(){
  const f = $('acp-fecha').value;
  if(f){
    const m = Number(f.split('-')[1]);
    $('acp-trim').value = m<=3?1:m<=6?2:m<=9?3:4;
  }
}

/* ── Cambiar tipo de acuerdo (mostrar/ocultar secciones) ── */
function _acpCambiarTipo(){
  const tipo = $('acp-tipo').value;
  const esT = tipo === 'traslado';
  $('acp-sec-ing').classList.toggle('d-none', esT);
  $('acp-sec-eg').classList.toggle('d-none', esT);
  $('acp-sec-cre').classList.toggle('d-none', !esT);
  $('acp-sec-cco').classList.toggle('d-none', !esT);
  // Auto-generar número
  if(!$('acp-id').value){
    $('acp-numero').value = _acpSiguienteNumero(tipo);
  }
  // Actualizar color del header
  const colores = {adicion:'linear-gradient(135deg,#1a7a3a,#27ae60)', reduccion:'linear-gradient(135deg,#c8960c,#e6ac00)', traslado:'linear-gradient(135deg,#0056a6,#2980b9)'};
  $('mAcuerdoPres-header').style.background = colores[tipo] || colores.adicion;
  // Asegurar al menos 1 fila en las secciones visibles
  if(esT){
    if(!$('acp-tabla-cre').children.length) _acpAgregarFila('cre');
    if(!$('acp-tabla-cco').children.length) _acpAgregarFila('cco');
  } else {
    if(!$('acp-tabla-ing').children.length) _acpAgregarFila('ing');
    if(!$('acp-tabla-eg').children.length) _acpAgregarFila('eg');
  }
  _acpActualizarTotales();
}

/* ── Agregar fila a una tabla ── */
function _acpAgregarFila(lado, codPre='', valPre=''){
  const mapId = {ing:'acp-tabla-ing', eg:'acp-tabla-eg', cre:'acp-tabla-cre', cco:'acp-tabla-cco'};
  const esIng = lado === 'ing';
  const opts = esIng ? _acpOptIng : _acpOptEg;
  const tbody = $(mapId[lado]);
  if(!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><select class="form-select form-select-sm py-0" style="font-size:11px">${opts}</select></td>
    <td><input type="number" class="form-control form-control-sm py-0 text-end" style="font-size:11px" placeholder="0" min="0" oninput="_acpActualizarTotales()" value="${valPre}"></td>
    <td class="ctr"><button class="btn btn-sm btn-outline-danger py-0 px-1" style="font-size:10px" onclick="this.closest('tr').remove();_acpActualizarTotales()">X</button></td>`;
  tbody.appendChild(tr);
  if(codPre) tr.querySelector('select').value = codPre;
}

/* ── Actualizar totales ── */
function _acpActualizarTotales(){
  const sum = id => {
    const el = $(id);
    if(!el) return 0;
    return Array.from(el.querySelectorAll('input[type=number]')).reduce((s,e)=>s+(Number(e.value)||0),0);
  };
  const esT = $('acp-tipo').value === 'traslado';
  const tIng = esT?0:sum('acp-tabla-ing'), tEg = esT?0:sum('acp-tabla-eg');
  const tCre = esT?sum('acp-tabla-cre'):0, tCco = esT?sum('acp-tabla-cco'):0;
  $('acp-total-ing').textContent = '$ ' + fmt(tIng);
  $('acp-total-eg').textContent  = '$ ' + fmt(tEg);
  $('acp-total-cre').textContent = '$ ' + fmt(tCre);
  $('acp-total-cco').textContent = '$ ' + fmt(tCco);
  const bal = $('acp-balance');
  if(esT){
    const ok = Math.abs(tCre-tCco)<1;
    bal.textContent = ok ? `CUADRA: Créditos = Contracréditos = $ ${fmt(tCre)}` : `NO CUADRA | Crédito: $ ${fmt(tCre)} | Contracrédito: $ ${fmt(tCco)}`;
    bal.style.cssText = `display:block;padding:6px 12px;border-radius:5px;font-size:12px;font-weight:bold;text-align:center;${ok?'background:#e8f5e9;color:#1b5e20':'background:#ffebee;color:#c62828'}`;
  } else if(tIng>0||tEg>0){
    const ok = Math.abs(tIng-tEg)<1;
    bal.textContent = ok ? `CUADRA: Ingresos = Egresos = $ ${fmt(tIng)}` : `NO CUADRA | Ingresos: $ ${fmt(tIng)} | Egresos: $ ${fmt(tEg)}`;
    bal.style.cssText = `display:block;padding:6px 12px;border-radius:5px;font-size:12px;font-weight:bold;text-align:center;${ok?'background:#e8f5e9;color:#1b5e20':'background:#ffebee;color:#c62828'}`;
  } else { bal.style.display='none'; }
}

/* ── Obtener filas de una tabla ── */
function _acpGetFilas(tbodyId){
  const el = $(tbodyId);
  if(!el) return [];
  return Array.from(el.querySelectorAll('tr')).map(tr => {
    const sel = tr.querySelector('select');
    const inp = tr.querySelector('input[type=number]');
    const cod = sel ? sel.value : '';
    const nombre = sel ? sel.options[sel.selectedIndex]?.textContent||'' : '';
    return { cod, nombre, valor: Number(inp?.value)||0 };
  }).filter(f => f.cod && f.valor > 0);
}

/* ══════════════════════════════════════════════════════════
   ABRIR MODAL (nuevo o editar)
   ══════════════════════════════════════════════════════════ */
function abrirModalAcuerdoPres(id=null){
  _acpRefrescarOpts();
  // Limpiar tablas
  ['acp-tabla-ing','acp-tabla-eg','acp-tabla-cre','acp-tabla-cco'].forEach(t => { if($(t)) $(t).innerHTML=''; });

  if(id){
    // EDITAR
    const d = DB.load();
    const ac = (d.acuerdos||[]).find(a=>a.id===id);
    if(!ac){ toast('Acuerdo no encontrado','danger'); return; }
    $('tit-macpres').innerHTML = '<i class="bi bi-pencil me-1"></i>Editar Acuerdo — ' + (ac.numero||'');
    $('acp-id').value = id;
    $('acp-tipo').value = ac.tipo || 'adicion';
    $('acp-numero').value = ac.numero || '';
    $('acp-fecha').value = ac.fecha || '';
    $('acp-trim').value = ac.trim || 1;
    $('acp-concepto').value = ac.concepto || '';
    $('acp-considerandos').value = ac.considerandos || '';
    _acpCambiarTipo();
    // Restaurar filas
    (ac.filas_ing||[]).forEach(f => _acpAgregarFila('ing', f.cod, f.valor));
    (ac.filas_eg||[]).forEach(f => _acpAgregarFila('eg', f.cod, f.valor));
    (ac.filas_cre||[]).forEach(f => _acpAgregarFila('cre', f.cod, f.valor));
    (ac.filas_cco||[]).forEach(f => _acpAgregarFila('cco', f.cod, f.valor));
  } else {
    // NUEVO
    $('tit-macpres').innerHTML = '<i class="bi bi-clipboard-check me-1"></i>Nuevo Acuerdo Presupuestal';
    $('acp-id').value = '';
    $('acp-tipo').value = 'adicion';
    $('acp-fecha').value = today();
    $('acp-concepto').value = '';
    $('acp-considerandos').value = _acpConsiderandosBase('adicion');
    _acpAutoTrim();
    _acpCambiarTipo();
  }
  $('acp-aviso').innerHTML = '';
  _acpActualizarTotales();
  new bootstrap.Modal($('mAcuerdoPres')).show();
}

/* ══════════════════════════════════════════════════════════
   GUARDAR ACUERDO
   ══════════════════════════════════════════════════════════ */
function guardarAcuerdoPres(){
  const tipo = $('acp-tipo').value;
  const numero = $('acp-numero').value.trim();
  const fecha = $('acp-fecha').value;
  const trim = Number($('acp-trim').value)||1;
  const considerandos = $('acp-considerandos').value.trim();

  // Auto-generar concepto según tipo (campo oculto desde la interfaz)
  const tipoLabels = {adicion:'Adición presupuestal',reduccion:'Reducción presupuestal',traslado:'Traslado presupuestal'};
  const concepto = $('acp-concepto').value.trim() || (tipoLabels[tipo]||tipo) + ' — Acuerdo ' + numero;

  if(!numero || !fecha){
    $('acp-aviso').innerHTML = '<div class="alert alert-danger py-1 px-2 small">Complete N° Acuerdo y Fecha.</div>';
    return;
  }

  const esT = tipo === 'traslado';
  const filasIng = esT ? [] : _acpGetFilas('acp-tabla-ing');
  const filasEg  = esT ? [] : _acpGetFilas('acp-tabla-eg');
  const filasCre = esT ? _acpGetFilas('acp-tabla-cre') : [];
  const filasCco = esT ? _acpGetFilas('acp-tabla-cco') : [];

  // Validaciones
  if(!esT && filasEg.length === 0){
    $('acp-aviso').innerHTML = '<div class="alert alert-danger py-1 px-2 small">Agregue al menos un rubro de egreso.</div>';
    return;
  }
  if(esT && (filasCre.length === 0 || filasCco.length === 0)){
    $('acp-aviso').innerHTML = '<div class="alert alert-danger py-1 px-2 small">Agregue rubros de crédito y contracrédito.</div>';
    return;
  }
  if(esT){
    const tCre = filasCre.reduce((s,f)=>s+f.valor,0);
    const tCco = filasCco.reduce((s,f)=>s+f.valor,0);
    if(Math.abs(tCre-tCco) >= 1){
      $('acp-aviso').innerHTML = '<div class="alert alert-danger py-1 px-2 small">El traslado no cuadra: Crédito y Contracrédito deben ser iguales.</div>';
      return;
    }
  }
  if(!esT){
    const tIng = filasIng.reduce((s,f)=>s+f.valor,0);
    const tEg  = filasEg.reduce((s,f)=>s+f.valor,0);
    if(tIng > 0 && tEg > 0 && Math.abs(tIng-tEg) >= 1){
      if(!confirm(`Ingresos (${fmt(tIng)}) y Egresos (${fmt(tEg)}) no cuadran.\n¿Guardar de todas formas?`)) return;
    }
  }

  const d = DB.load();
  if(!d.acuerdos) d.acuerdos = [];
  if(!d.mods_eg) d.mods_eg = [];
  if(!d.mods_ing_form) d.mods_ing_form = [];

  const idEdit = $('acp-id').value;
  const mes = Number((fecha||'').split('-')[1])||1;

  // Si es edición, eliminar registros previos de mods vinculados a este acuerdo
  if(idEdit){
    const oldAc = d.acuerdos.find(a=>a.id===idEdit);
    if(oldAc && oldAc._mod_ids){
      const modSet = new Set(oldAc._mod_ids);
      // Eliminar mods_eg y mods_ing_form vinculados
      d.mods_eg = d.mods_eg.filter(e => !modSet.has(e.id));
      d.mods_ing_form = d.mods_ing_form.filter(e => !modSet.has(e.id));
      // Recalcular los rubros afectados del acuerdo anterior
      const afEgOld = new Set(), afIngOld = new Set();
      (oldAc.filas_eg||[]).forEach(f => afEgOld.add(f.cod));
      (oldAc.filas_cre||[]).forEach(f => afEgOld.add(f.cod));
      (oldAc.filas_cco||[]).forEach(f => afEgOld.add(f.cod));
      (oldAc.filas_ing||[]).forEach(f => afIngOld.add(f.cod));
      afEgOld.forEach(cod => recalcularMods(d, cod, oldAc.trim||1));
      afIngOld.forEach(cod => { if(typeof recalcularModsIng === 'function') recalcularModsIng(d, cod, oldAc.trim||1); });
    }
  }

  // Crear registros individuales de modificaciones
  const modIds = [];
  const afEg = new Set(), afIng = new Set();

  // Adición/Reducción: ingresos y egresos
  filasIng.forEach(f => {
    const modId = uid();
    modIds.push(modId);
    d.mods_ing_form.push({id:modId, cod:f.cod, trim, mes, fecha, acuerdo:numero, concepto, tipo, valor:f.valor});
    afIng.add(f.cod);
  });
  filasEg.forEach(f => {
    const modId = uid();
    modIds.push(modId);
    d.mods_eg.push({id:modId, cod:f.cod, trim, mes, fecha, acuerdo:numero, concepto, tipo, valor:f.valor});
    afEg.add(f.cod);
  });

  // Traslado: crédito y contracrédito
  filasCre.forEach(f => {
    const modId = uid();
    modIds.push(modId);
    d.mods_eg.push({id:modId, cod:f.cod, trim, mes, fecha, acuerdo:numero, concepto, tipo:'credito', valor:f.valor});
    afEg.add(f.cod);
  });
  filasCco.forEach(f => {
    const modId = uid();
    modIds.push(modId);
    d.mods_eg.push({id:modId, cod:f.cod, trim, mes, fecha, acuerdo:numero, concepto, tipo:'contracredito', valor:f.valor});
    afEg.add(f.cod);
  });

  // Recalcular mods para rubros afectados
  afEg.forEach(cod => recalcularMods(d, cod, trim));
  afIng.forEach(cod => { if(typeof recalcularModsIng === 'function') recalcularModsIng(d, cod, trim); });

  // Recalcular recaudos desde cero (evita duplicaciones al editar)
  if(typeof _recalcularRecaudosIng === 'function') _recalcularRecaudosIng(d);

  // Guardar registro padre del acuerdo
  const acuerdo = {
    id: idEdit || uid(),
    tipo, numero, fecha, trim, concepto, considerandos,
    filas_ing: filasIng, filas_eg: filasEg,
    filas_cre: filasCre, filas_cco: filasCco,
    total_ing: filasIng.reduce((s,f)=>s+f.valor,0),
    total_eg:  filasEg.reduce((s,f)=>s+f.valor,0),
    total_cre: filasCre.reduce((s,f)=>s+f.valor,0),
    total_cco: filasCco.reduce((s,f)=>s+f.valor,0),
    _mod_ids: modIds,
    fecha_creacion: idEdit ? (d.acuerdos.find(a=>a.id===idEdit)||{}).fecha_creacion || today() : today()
  };

  const idx = d.acuerdos.findIndex(a=>a.id===acuerdo.id);
  if(idx >= 0) d.acuerdos[idx] = acuerdo;
  else d.acuerdos.push(acuerdo);

  DB.save(d);
  bootstrap.Modal.getInstance($('mAcuerdoPres')).hide();
  R.acuerdos();

  const tipoNom = {adicion:'Adición',reduccion:'Reducción',traslado:'Traslado'};
  toast(`Acuerdo ${numero} (${tipoNom[tipo]}) guardado y aplicado al presupuesto`);
  if(typeof _verificarBalancePresupuestal === 'function') _verificarBalancePresupuestal();
}

/* ══════════════════════════════════════════════════════════
   ELIMINAR ACUERDO
   ══════════════════════════════════════════════════════════ */
function eliminarAcuerdoPres(id){
  if(!confirm('¿Eliminar este acuerdo?\n\nSe revertirán las modificaciones presupuestales asociadas.')) return;
  const d = DB.load();
  const ac = (d.acuerdos||[]).find(a=>a.id===id);
  if(!ac) return;

  // Eliminar mods vinculados
  if(ac._mod_ids){
    const modSet = new Set(ac._mod_ids);
    d.mods_eg = (d.mods_eg||[]).filter(e => !modSet.has(e.id));
    d.mods_ing_form = (d.mods_ing_form||[]).filter(e => !modSet.has(e.id));
    // Restar auto-recaudos de ingresos
    if(ac.tipo === 'adicion' && ac.filas_ing){
      const mes = Number((ac.fecha||'').split('-')[1])||1;
      ac.filas_ing.forEach(f => {
        if(d.recaudos_ing_mes && d.recaudos_ing_mes[f.cod]){
          const prev = Number(d.recaudos_ing_mes[f.cod][mes])||0;
          d.recaudos_ing_mes[f.cod][mes] = Math.max(0, prev - f.valor);
        }
      });
    }
  }

  // Recalcular rubros afectados
  const trim = ac.trim || 1;
  (ac.filas_eg||[]).forEach(f => recalcularMods(d, f.cod, trim));
  (ac.filas_cre||[]).forEach(f => recalcularMods(d, f.cod, trim));
  (ac.filas_cco||[]).forEach(f => recalcularMods(d, f.cod, trim));
  (ac.filas_ing||[]).forEach(f => { if(typeof recalcularModsIng === 'function') recalcularModsIng(d, f.cod, trim); });

  // Eliminar acuerdo
  d.acuerdos = d.acuerdos.filter(a=>a.id!==id);
  DB.save(d);
  R.acuerdos();
  toast('Acuerdo eliminado y presupuesto revertido','warning');
  if(typeof _verificarBalancePresupuestal === 'function') _verificarBalancePresupuestal();
}

/* ══════════════════════════════════════════════════════════
   GENERAR DOCUMENTO DEL ACUERDO (HTML para imprimir)
   ══════════════════════════════════════════════════════════ */
function generarDocAcuerdoPres(id){
  const d = DB.load();
  const ac = (d.acuerdos||[]).find(a=>a.id===id);
  if(!ac){ toast('Acuerdo no encontrado','danger'); return; }

  const html = _buildDocAcuerdo(d, ac);
  // Abrir en nueva ventana
  const w = window.open('','_blank','width=850,height=1000');
  w.document.write(html);
  w.document.close();
}

function imprimirDocAcuerdoPres(id){
  const d = DB.load();
  const ac = (d.acuerdos||[]).find(a=>a.id===id);
  if(!ac){ toast('Acuerdo no encontrado','danger'); return; }

  const html = _buildDocAcuerdo(d, ac);
  const w = window.open('','_blank','width=850,height=1000');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

/* ── Construir HTML del documento ── */
function _buildDocAcuerdo(d, ac){
  const cfg = d.config || {};
  const inst = cfg.institucion || '[NOMBRE INSTITUCIÓN]';
  const muni = cfg.municipio || '[MUNICIPIO]';
  const dept = cfg.departamento || '[DEPARTAMENTO]';
  const vig  = cfg.vigencia || new Date().getFullYear();
  const rector = cfg.rector || '';
  const ccRector = cfg.idRector || '';

  const tipoLabel = {adicion:'ADICIÓN', reduccion:'REDUCCIÓN', traslado:'TRASLADO PRESUPUESTAL'};
  const tipoPrep  = {adicion:'una adición', reduccion:'una reducción', traslado:'un traslado presupuestal'};

  // Formatear fecha en letras
  const meses = ['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const fp = (ac.fecha||'').split('-');
  const dia = Number(fp[2])||1, mesN = Number(fp[1])||1, anio = fp[0]||vig;
  const fechaLetras = `${dia} días del mes de ${meses[mesN]} ${anio}`;

  // Construir considerandos como párrafos
  let consParrafos = (ac.considerandos||'').split('\n').filter(l=>l.trim()).map(l =>
    `<p style="text-align:justify;margin:0 0 8px;line-height:1.6">${l.trim()}</p>`
  ).join('');
  // Agregar el concepto como último considerando
  if(ac.concepto){
    consParrafos += `<p style="text-align:justify;margin:0 0 8px;line-height:1.6"><strong>Que</strong> el presente acuerdo se realiza con el fin de: ${ac.concepto}.</p>`;
  }

  // Tablas según tipo
  let articulosHTML = '';
  let artNum = 1;

  if(ac.tipo === 'adicion' || ac.tipo === 'reduccion'){
    const accion = ac.tipo === 'adicion' ? 'Adiciónese' : 'Redúzcase';
    const totalIng = ac.total_ing || 0;
    const totalEg  = ac.total_eg || 0;

    // Art 1: Ingresos
    if(ac.filas_ing && ac.filas_ing.length > 0){
      let rowsIng = ac.filas_ing.map(f =>
        `<tr><td style="padding:4px 8px;border:1px solid #999">${f.cod}</td>
         <td style="padding:4px 8px;border:1px solid #999">${f.nombre||f.cod}</td>
         <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(f.valor)}</td></tr>`
      ).join('');
      articulosHTML += `<p style="text-align:justify;line-height:1.6;margin:16px 0 8px"><strong>ARTÍCULO ${_numRomano(artNum)}. ${ac.tipo==='adicion'?'ADICIÓN':'REDUCCIÓN'} AL PRESUPUESTO DE INGRESOS:</strong> ${accion} al Presupuesto de Ingresos del ${inst} para la vigencia fiscal ${vig}, la suma de ${numALetras(totalIng)} ($ ${fmt(totalIng)}), distribuidos así:</p>
      <table style="width:100%;border-collapse:collapse;font-size:10pt;margin:8px 0 16px">
        <thead><tr style="background:#e8e8e8;font-weight:bold">
          <th style="padding:4px 8px;border:1px solid #999;width:100px">CÓDIGO</th>
          <th style="padding:4px 8px;border:1px solid #999">RUBRO</th>
          <th style="padding:4px 8px;border:1px solid #999;width:150px;text-align:right">VALOR</th>
        </tr></thead>
        <tbody>${rowsIng}</tbody>
        <tfoot><tr style="font-weight:bold;background:#f0f0f0">
          <td style="padding:4px 8px;border:1px solid #999"></td>
          <td style="padding:4px 8px;border:1px solid #999;text-align:right">TOTAL</td>
          <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(totalIng)}</td>
        </tr></tfoot>
      </table>`;
      artNum++;
    }

    // Art 2: Egresos
    if(ac.filas_eg && ac.filas_eg.length > 0){
      let rowsEg = ac.filas_eg.map(f =>
        `<tr><td style="padding:4px 8px;border:1px solid #999">${f.cod}</td>
         <td style="padding:4px 8px;border:1px solid #999">${f.nombre||f.cod}</td>
         <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(f.valor)}</td></tr>`
      ).join('');
      articulosHTML += `<p style="text-align:justify;line-height:1.6;margin:16px 0 8px"><strong>ARTÍCULO ${_numRomano(artNum)}. ${ac.tipo==='adicion'?'ADICIÓN':'REDUCCIÓN'} AL PRESUPUESTO DE GASTOS:</strong> ${accion} al Presupuesto de Gastos del ${inst} para la vigencia fiscal ${vig}, la suma de ${numALetras(totalEg)} ($ ${fmt(totalEg)}), en las siguientes cuentas:</p>
      <table style="width:100%;border-collapse:collapse;font-size:10pt;margin:8px 0 16px">
        <thead><tr style="background:#e8e8e8;font-weight:bold">
          <th style="padding:4px 8px;border:1px solid #999;width:100px">CÓDIGO</th>
          <th style="padding:4px 8px;border:1px solid #999">RUBRO</th>
          <th style="padding:4px 8px;border:1px solid #999;width:150px;text-align:right">VALOR</th>
        </tr></thead>
        <tbody>${rowsEg}</tbody>
        <tfoot><tr style="font-weight:bold;background:#f0f0f0">
          <td style="padding:4px 8px;border:1px solid #999"></td>
          <td style="padding:4px 8px;border:1px solid #999;text-align:right">TOTAL</td>
          <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(totalEg)}</td>
        </tr></tfoot>
      </table>`;
      artNum++;
    }
  }

  if(ac.tipo === 'traslado'){
    const totalCco = ac.total_cco || 0;
    const totalCre = ac.total_cre || 0;

    // Art 1: Contracrédito
    let rowsCco = (ac.filas_cco||[]).map(f =>
      `<tr><td style="padding:4px 8px;border:1px solid #999">${f.cod}</td>
       <td style="padding:4px 8px;border:1px solid #999">${f.nombre||f.cod}</td>
       <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(f.valor)}</td></tr>`
    ).join('');
    articulosHTML += `<p style="text-align:justify;line-height:1.6;margin:16px 0 8px"><strong>ARTÍCULO ${_numRomano(artNum)}. CONTRACRÉDITO:</strong> Redúzcase del Presupuesto de Gastos del ${inst} para la vigencia fiscal ${vig}, la suma de ${numALetras(totalCco)} ($ ${fmt(totalCco)}), de los siguientes rubros:</p>
    <table style="width:100%;border-collapse:collapse;font-size:10pt;margin:8px 0 16px">
      <thead><tr style="background:#f5b7b1;font-weight:bold">
        <th style="padding:4px 8px;border:1px solid #999;width:100px">CÓDIGO</th>
        <th style="padding:4px 8px;border:1px solid #999">RUBRO</th>
        <th style="padding:4px 8px;border:1px solid #999;width:150px;text-align:right">VALOR</th>
      </tr></thead>
      <tbody>${rowsCco}</tbody>
      <tfoot><tr style="font-weight:bold;background:#fadbd8">
        <td style="padding:4px 8px;border:1px solid #999"></td>
        <td style="padding:4px 8px;border:1px solid #999;text-align:right">TOTAL</td>
        <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(totalCco)}</td>
      </tr></tfoot>
    </table>`;
    artNum++;

    // Art 2: Crédito
    let rowsCre = (ac.filas_cre||[]).map(f =>
      `<tr><td style="padding:4px 8px;border:1px solid #999">${f.cod}</td>
       <td style="padding:4px 8px;border:1px solid #999">${f.nombre||f.cod}</td>
       <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(f.valor)}</td></tr>`
    ).join('');
    articulosHTML += `<p style="text-align:justify;line-height:1.6;margin:16px 0 8px"><strong>ARTÍCULO ${_numRomano(artNum)}. CRÉDITO:</strong> Adiciónese al Presupuesto de Gastos del ${inst} para la vigencia fiscal ${vig}, la suma de ${numALetras(totalCre)} ($ ${fmt(totalCre)}), en los siguientes rubros:</p>
    <table style="width:100%;border-collapse:collapse;font-size:10pt;margin:8px 0 16px">
      <thead><tr style="background:#d6eaf8;font-weight:bold">
        <th style="padding:4px 8px;border:1px solid #999;width:100px">CÓDIGO</th>
        <th style="padding:4px 8px;border:1px solid #999">RUBRO</th>
        <th style="padding:4px 8px;border:1px solid #999;width:150px;text-align:right">VALOR</th>
      </tr></thead>
      <tbody>${rowsCre}</tbody>
      <tfoot><tr style="font-weight:bold;background:#ebf5fb">
        <td style="padding:4px 8px;border:1px solid #999"></td>
        <td style="padding:4px 8px;border:1px solid #999;text-align:right">TOTAL</td>
        <td style="padding:4px 8px;border:1px solid #999;text-align:right">$ ${fmt(totalCre)}</td>
      </tr></tfoot>
    </table>`;
    artNum++;
  }

  // Firmas del Consejo Directivo
  const miembrosCD = [
    {cargo:'Rector(a)', nombre: rector, cc: ccRector},
    {cargo:'Repte de los Docentes', nombre:'', cc:''},
    {cargo:'Repte de los Docentes', nombre:'', cc:''},
    {cargo:'Repte de los Padres de Familia', nombre:'', cc:''},
    {cargo:'Repte de los Padres de Familia', nombre:'', cc:''},
    {cargo:'Repte de los Estudiantes', nombre:'', cc:''},
    {cargo:'Repte de los Exalumnos', nombre:'', cc:''},
    {cargo:'Repte del Sector Productivo', nombre:'', cc:''}
  ];

  const _firmaImg = cfg.firma_rector || '';
  let firmasHTML = '<div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:40px">';
  miembrosCD.forEach((m, idx) => {
    const esFirmaRector = idx === 0 && _firmaImg;
    firmasHTML += `<div style="width:45%;text-align:center;margin-bottom:30px">
      ${esFirmaRector ? '<img src="'+_firmaImg+'" style="max-height:75px;max-width:250px;display:block;margin:0 auto 3px" alt="Firma">' : ''}
      <div style="border-bottom:1px solid #333;width:80%;margin:0 auto 4px">&nbsp;</div>
      <div style="font-weight:bold;font-size:10pt">${m.nombre||''}</div>
      <div style="font-size:9pt">C.C. No. ${m.cc || '_______________'}</div>
      <div style="font-size:9pt;font-style:italic">${m.cargo}</div>
    </div>`;
  });
  firmasHTML += '</div>';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Acuerdo ${ac.numero} — ${inst}</title>
<style>
  @page { size: letter; margin: 20mm 18mm 20mm 22mm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.5; }
  @media print { body { margin: 0; } .no-print { display: none !important; } }
</style></head><body>
<div class="no-print" style="background:#2c3e50;color:#fff;padding:8px 16px;text-align:right;font-family:Arial;font-size:12px;position:fixed;top:0;left:0;right:0;z-index:100">
  <button onclick="window.print()" style="background:#27ae60;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:12px;margin-right:8px"><b>Imprimir / PDF</b></button>
  <button onclick="window.close()" style="background:#e74c3c;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:12px">Cerrar</button>
</div>
<div style="margin-top:50px">

<h2 style="text-align:center;margin:0 0 4px;font-size:13pt">ACUERDO DE ${tipoLabel[ac.tipo]||'MODIFICACIÓN'} No: ${ac.numero}</h2>
<p style="text-align:center;font-size:11pt;margin:0 0 20px">del ${dia} de ${meses[mesN]} del ${anio}</p>

<p style="text-align:justify;line-height:1.6;margin:0 0 12px">Por medio del cual, se realiza ${tipoPrep[ac.tipo]||'una modificación'} en el presupuesto del Fondo de Servicios Educativos, se modifica el plan de compras y el PAC, del <strong>${inst}</strong> para la vigencia fiscal de ${vig}.</p>

<p style="text-align:justify;line-height:1.6;margin:0 0 12px">El Consejo Directivo, en el uso de las facultades legales, especial las conferidas en la Ley 715 de 2001 y el Decreto 4791 de 2008, 4807 de 2012, 1075 de 2015 y</p>

<h3 style="text-align:center;margin:16px 0 12px;font-size:12pt">CONSIDERANDO:</h3>
${consParrafos}

<p style="text-align:justify;line-height:1.6;margin:12px 0 8px">Que, con base a las anteriores consideraciones,</p>

<h3 style="text-align:center;margin:16px 0 12px;font-size:12pt">ACUERDA:</h3>
${articulosHTML}

<h3 style="text-align:center;margin:30px 0 12px;font-size:12pt">COMUNÍQUESE Y CÚMPLASE</h3>
<p style="text-align:justify;line-height:1.6;margin:0 0 8px">Dado en ${muni} a los ${fechaLetras}. Firman los integrantes del Consejo Directivo:</p>

${firmasHTML}

</div></body></html>`;
}

/* ── Números romanos (hasta 10) ── */
function _numRomano(n){
  const rom = ['','PRIMERO','SEGUNDO','TERCERO','CUARTO','QUINTO','SEXTO','SÉPTIMO','OCTAVO','NOVENO','DÉCIMO'];
  return rom[n] || String(n);
}

/* ══════════════════════════════════════════════════════════
   EXPORTAR ACUERDO A WORD (.docx)
   Para que el rector pueda agregar membrete
   ══════════════════════════════════════════════════════════ */
async function exportarAcuerdoWord(acuerdoId){
  if(typeof docx === 'undefined'){
    toast('Librería docx no disponible. Recargue la página.','danger');
    return;
  }

  const d = DB.load();
  const ac = (d.acuerdos||[]).find(a => a.id === acuerdoId);
  if(!ac){ toast('Acuerdo no encontrado','danger'); return; }

  const cfg = d.config || {};
  const inst = cfg.institucion || '[NOMBRE INSTITUCIÓN]';
  const nit  = cfg.nit || '';
  const dv   = cfg.dv || '';
  const muni = cfg.municipio || '[MUNICIPIO]';
  const dept = cfg.departamento || '[DEPARTAMENTO]';
  const vig  = cfg.vigencia || new Date().getFullYear();
  const rector = cfg.rector || '';
  const ccRector = cfg.idRector || '';

  const tipoLabel = {adicion:'ADICIÓN', reduccion:'REDUCCIÓN', traslado:'TRASLADO PRESUPUESTAL'};
  const tipoPrep  = {adicion:'una adición', reduccion:'una reducción', traslado:'un traslado presupuestal'};

  const meses = ['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const fp = (ac.fecha||'').split('-');
  const dia = Number(fp[2])||1, mesN = Number(fp[1])||1, anio = fp[0]||vig;

  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel } = docx;

  const border = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const noBorder = { style: BorderStyle.NONE, size: 0 };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  // Helper: párrafo centrado
  const pCenter = (text, opts={}) => new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts.after || 100 },
    children: [new TextRun({ text, bold: opts.bold || false, size: opts.size || 22, font: 'Arial' })]
  });

  // Helper: párrafo justificado
  const pJust = (text, opts={}) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: opts.after || 120, line: 276 },
    children: Array.isArray(text)
      ? text.map(t => new TextRun({ text: t.text||t, bold: t.bold||false, size: t.size||22, font: 'Arial' }))
      : [new TextRun({ text, size: opts.size || 22, font: 'Arial', bold: opts.bold||false })]
  });

  // Helper: fila de tabla presupuestal
  const tRow = (cod, nombre, valor, isHeader, headerColor) => {
    const fill = isHeader ? (headerColor||'E8E8E8') : 'FFFFFF';
    return new TableRow({
      children: [
        new TableCell({ borders, width:{size:1500,type:WidthType.DXA},
          shading:{fill, type:ShadingType.CLEAR},
          margins:{top:40,bottom:40,left:80,right:80},
          children:[new Paragraph({children:[new TextRun({text:cod,bold:isHeader,size:20,font:'Arial'})]})]
        }),
        new TableCell({ borders, width:{size:5500,type:WidthType.DXA},
          shading:{fill, type:ShadingType.CLEAR},
          margins:{top:40,bottom:40,left:80,right:80},
          children:[new Paragraph({children:[new TextRun({text:nombre,bold:isHeader,size:20,font:'Arial'})]})]
        }),
        new TableCell({ borders, width:{size:2360,type:WidthType.DXA},
          shading:{fill, type:ShadingType.CLEAR},
          margins:{top:40,bottom:40,left:80,right:80},
          children:[new Paragraph({alignment:AlignmentType.RIGHT,
            children:[new TextRun({text:valor,bold:isHeader,size:20,font:'Arial'})]})]
        })
      ]
    });
  };

  // ═══ CONTENIDO DEL DOCUMENTO ═══
  const children = [];

  // ── Espacio para membrete del rector (3 líneas vacías) ──
  children.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 22 })] }));
  children.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', size: 22 })] }));
  children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: ' ', size: 22 })] }));

  // ── Encabezado institucional ──
  children.push(pCenter(inst, { bold: true, size: 24 }));
  children.push(pCenter('NIT: ' + (nit ? nit + (dv ? '-' + dv : '') : '') + (cfg.ciudad ? ' — DANE: ' + cfg.ciudad : ''), { size: 18 }));
  children.push(pCenter(muni + ', Dpto. de ' + dept, { size: 18, after: 300 }));

  // ── Título del acuerdo ──
  children.push(pCenter('ACUERDO DE ' + (tipoLabel[ac.tipo]||'MODIFICACIÓN') + ' No: ' + ac.numero, { bold: true, size: 26, after: 60 }));
  children.push(pCenter('del ' + dia + ' de ' + meses[mesN] + ' del ' + anio, { size: 22, after: 300 }));

  // ── Preámbulo ──
  children.push(pJust([
    { text: 'Por medio del cual, se realiza ' },
    { text: tipoPrep[ac.tipo]||'una modificación' },
    { text: ' en el presupuesto del Fondo de Servicios Educativos, se modifica el plan de compras y el PAC, del ' },
    { text: inst, bold: true },
    { text: ' para la vigencia fiscal de ' + vig + '.' }
  ]));

  children.push(pJust('El Consejo Directivo, en el uso de las facultades legales, especial las conferidas en la Ley 715 de 2001 y el Decreto 4791 de 2008, 4807 de 2012, 1075 de 2015 y'));

  // ── CONSIDERANDO ──
  children.push(pCenter('CONSIDERANDO:', { bold: true, size: 24, after: 200 }));
  const consLineas = (ac.considerandos||'').split('\n').filter(l => l.trim());
  consLineas.forEach(linea => {
    children.push(pJust(linea.trim()));
  });
  if(ac.concepto){
    children.push(pJust([
      { text: 'Que ', bold: true },
      { text: 'el presente acuerdo se realiza con el fin de: ' + ac.concepto + '.' }
    ]));
  }

  children.push(pJust('Que, con base a las anteriores consideraciones,', { after: 200 }));

  // ── ACUERDA ──
  children.push(pCenter('ACUERDA:', { bold: true, size: 24, after: 200 }));

  let artNum = 1;

  // ── Artículos según tipo ──
  if(ac.tipo === 'adicion' || ac.tipo === 'reduccion'){
    const accion = ac.tipo === 'adicion' ? 'Adiciónese' : 'Redúzcase';
    const label = ac.tipo === 'adicion' ? 'ADICIÓN' : 'REDUCCIÓN';

    // Ingresos
    if(ac.filas_ing && ac.filas_ing.length > 0){
      const totalIng = ac.total_ing || 0;
      children.push(pJust([
        { text: 'ARTÍCULO ' + _numRomano(artNum) + '. ' + label + ' AL PRESUPUESTO DE INGRESOS: ', bold: true },
        { text: accion + ' al Presupuesto de Ingresos del ' + inst + ' para la vigencia fiscal ' + vig + ', la suma de ' + numALetras(totalIng) + ' ($ ' + fmt(totalIng) + '), distribuidos así:' }
      ]));
      const rows = [tRow('CÓDIGO', 'RUBRO', 'VALOR', true)];
      ac.filas_ing.forEach(f => rows.push(tRow(f.cod, f.nombre||f.cod, '$ ' + fmt(f.valor), false)));
      rows.push(tRow('', 'TOTAL', '$ ' + fmt(totalIng), true, 'F0F0F0'));
      children.push(new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1500, 5500, 2360],
        rows
      }));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
      artNum++;
    }

    // Egresos
    if(ac.filas_eg && ac.filas_eg.length > 0){
      const totalEg = ac.total_eg || 0;
      children.push(pJust([
        { text: 'ARTÍCULO ' + _numRomano(artNum) + '. ' + label + ' AL PRESUPUESTO DE GASTOS: ', bold: true },
        { text: accion + ' al Presupuesto de Gastos del ' + inst + ' para la vigencia fiscal ' + vig + ', la suma de ' + numALetras(totalEg) + ' ($ ' + fmt(totalEg) + '), en las siguientes cuentas:' }
      ]));
      const rows = [tRow('CÓDIGO', 'RUBRO', 'VALOR', true)];
      ac.filas_eg.forEach(f => rows.push(tRow(f.cod, f.nombre||f.cod, '$ ' + fmt(f.valor), false)));
      rows.push(tRow('', 'TOTAL', '$ ' + fmt(totalEg), true, 'F0F0F0'));
      children.push(new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1500, 5500, 2360],
        rows
      }));
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
      artNum++;
    }
  }

  if(ac.tipo === 'traslado'){
    // Contracrédito
    const totalCco = ac.total_cco || 0;
    children.push(pJust([
      { text: 'ARTÍCULO ' + _numRomano(artNum) + '. CONTRACRÉDITO: ', bold: true },
      { text: 'Redúzcase del Presupuesto de Gastos del ' + inst + ' para la vigencia fiscal ' + vig + ', la suma de ' + numALetras(totalCco) + ' ($ ' + fmt(totalCco) + '), de los siguientes rubros:' }
    ]));
    const rowsCco = [tRow('CÓDIGO', 'RUBRO', 'VALOR', true, 'F5B7B1')];
    (ac.filas_cco||[]).forEach(f => rowsCco.push(tRow(f.cod, f.nombre||f.cod, '$ ' + fmt(f.valor), false)));
    rowsCco.push(tRow('', 'TOTAL', '$ ' + fmt(totalCco), true, 'FADBD8'));
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1500, 5500, 2360],
      rows: rowsCco
    }));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    artNum++;

    // Crédito
    const totalCre = ac.total_cre || 0;
    children.push(pJust([
      { text: 'ARTÍCULO ' + _numRomano(artNum) + '. CRÉDITO: ', bold: true },
      { text: 'Adiciónese al Presupuesto de Gastos del ' + inst + ' para la vigencia fiscal ' + vig + ', la suma de ' + numALetras(totalCre) + ' ($ ' + fmt(totalCre) + '), en los siguientes rubros:' }
    ]));
    const rowsCre = [tRow('CÓDIGO', 'RUBRO', 'VALOR', true, 'D6EAF8')];
    (ac.filas_cre||[]).forEach(f => rowsCre.push(tRow(f.cod, f.nombre||f.cod, '$ ' + fmt(f.valor), false)));
    rowsCre.push(tRow('', 'TOTAL', '$ ' + fmt(totalCre), true, 'EBF5FB'));
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1500, 5500, 2360],
      rows: rowsCre
    }));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    artNum++;
  }

  // ── COMUNÍQUESE Y CÚMPLASE ──
  children.push(pCenter('COMUNÍQUESE Y CÚMPLASE', { bold: true, size: 24, after: 200 }));
  children.push(pJust('Dado en ' + muni + ' a los ' + dia + ' días del mes de ' + meses[mesN] + ' ' + anio + '. Firman los integrantes del Consejo Directivo:'));
  children.push(new Paragraph({ spacing: { after: 400 }, children: [] }));

  // ── Firmas del Consejo Directivo ──
  const miembrosCD = [
    { cargo: 'Rector(a)', nombre: rector, cc: ccRector },
    { cargo: 'Repte de los Docentes', nombre: '', cc: '' },
    { cargo: 'Repte de los Docentes', nombre: '', cc: '' },
    { cargo: 'Repte de los Padres de Familia', nombre: '', cc: '' },
    { cargo: 'Repte de los Padres de Familia', nombre: '', cc: '' },
    { cargo: 'Repte de los Estudiantes', nombre: '', cc: '' },
    { cargo: 'Repte de los Exalumnos', nombre: '', cc: '' },
    { cargo: 'Repte del Sector Productivo', nombre: '', cc: '' }
  ];

  // Firmas en pares (2 por fila) usando tabla sin bordes
  for(let i = 0; i < miembrosCD.length; i += 2){
    const m1 = miembrosCD[i];
    const m2 = miembrosCD[i+1];

    const firmaCell = (m) => {
      if(!m) return new TableCell({
        borders: noBorders, width:{size:4680,type:WidthType.DXA},
        children: [new Paragraph({children:[]})]
      });
      return new TableCell({
        borders: noBorders,
        width: { size: 4680, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({ spacing:{after:0}, children:[] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:20},
            children: [new TextRun({text:'_______________________________', size:20, font:'Arial'})] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:20},
            children: [new TextRun({text: m.nombre||'', bold:true, size:20, font:'Arial'})] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:20},
            children: [new TextRun({text:'C.C. No. '+(m.cc||'_______________'), size:18, font:'Arial'})] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:60},
            children: [new TextRun({text: m.cargo, italics:true, size:18, font:'Arial'})] })
        ]
      });
    };

    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4680, 4680],
      rows: [new TableRow({ children: [firmaCell(m1), firmaCell(m2)] })]
    }));
  }

  // ═══ CREAR DOCUMENTO ═══
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 22 } }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1296, bottom: 1440, left: 1584 }
        }
      },
      children
    }]
  });

  // ═══ DESCARGAR ═══
  try {
    const buffer = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(buffer);
    link.download = 'Acuerdo_' + (ac.numero||'').replace(/[^a-zA-Z0-9-]/g,'_') + '_' + inst.substring(0,30).replace(/[^a-zA-Z0-9]/g,'_') + '.docx';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('Acuerdo exportado a Word (.docx)', 'success');
  } catch(err){
    console.error('Error exportando a Word:', err);
    toast('Error al exportar: ' + err.message, 'danger');
  }
}
