/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Acciones de Contratos (CRUD + UNSPSC)
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   AUDITORÍA DE CONSECUTIVOS — Compartida por Contratos y Pagos DIAN
   ══════════════════════════════════════════════════════════ */

// ID del registro que se está editando (para excluirlo de la validación)
let _auditExcluirId = '';

/** Obtener todos los valores usados para un campo dado */
function _getValoresUsados(campo){
  const d = DB.load();
  const contratos = d.contratos_full || [];
  const pagosDian = d.pagos_dian || [];
  const excId = _auditExcluirId;
  switch(campo){
    case 'numero':
      return contratos.filter(c => c.id !== excId && c.numero).map(c => ({val:c.numero, ref:'Cto '+c.numero}));
    case 'cdp':
      return contratos.filter(c => c.id !== excId && c.cdp).map(c => ({val:c.cdp, ref:'Cto '+c.numero}));
    case 'rp':
      return contratos.filter(c => c.id !== excId && c.rp).map(c => ({val:c.rp, ref:'Cto '+c.numero}));
    case 'egreso':
      return [
        ...contratos.filter(c => c.id !== excId && c.num_egreso).map(c => ({val:c.num_egreso, ref:'Cto '+c.numero})),
        ...contratos.filter(c => c.id !== excId).flatMap(c => (c.pagos||[]).filter(p => p.num_egreso).map(p => ({val:p.num_egreso, ref:'Cto '+c.numero+' (pago)'}))),
        ...pagosDian.filter(p => p.id !== excId && p.num_egreso).map(p => ({val:p.num_egreso, ref:'DIAN '+p.concepto}))
      ];
    default: return [];
  }
}

/** Obtener último consecutivo */
function _ultimoConsecutivo(campo){
  const items = _getValoresUsados(campo);
  if(!items.length) return null;
  items.sort((a,b) => {
    const na = parseInt(a.val), nb = parseInt(b.val);
    if(!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.val.localeCompare(b.val);
  });
  return items[items.length - 1].val;
}

/** Verificar si un valor ya está en uso; retorna la referencia si duplicado */
function _buscarDuplicado(campo, valor){
  if(!valor) return null;
  const v = valor.trim();
  const items = _getValoresUsados(campo);
  const dup = items.find(i => i.val.trim() === v);
  return dup || null;
}

/** Mostrar hint de último consecutivo + validar duplicado (llamada desde oninput) */
function _auditarCampo(inputId, hintId, campo){
  const input = $(inputId);
  const hint = $(hintId);
  if(!input || !hint) return;
  const valor = input.value.trim();
  const dup = _buscarDuplicado(campo, valor);
  if(valor && dup){
    hint.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>' +
      '<span class="text-danger fw-bold">N° "' + valor + '" ya existe → ' + dup.ref + '</span>';
    input.style.borderColor = '#dc3545';
    input.style.background = '#fff5f5';
  } else {
    input.style.borderColor = '';
    input.style.background = '';
    const ult = _ultimoConsecutivo(campo);
    hint.innerHTML = ult
      ? '<i class="bi bi-info-circle text-primary me-1"></i>Último: <strong>' + ult + '</strong>'
      : '';
  }
}

/** Mostrar hints iniciales al abrir modal (sin validar duplicado aún) */
function _mostrarHintsIniciales(campos){
  campos.forEach(([inputId, hintId, campo]) => {
    const hint = $(hintId);
    if(!hint) return;
    const ult = _ultimoConsecutivo(campo);
    hint.innerHTML = ult
      ? '<i class="bi bi-info-circle text-primary me-1"></i>Último: <strong>' + ult + '</strong>'
      : '';
    // Si ya tiene valor, validar duplicado
    const input = $(inputId);
    if(input && input.value.trim()) _auditarCampo(inputId, hintId, campo);
  });
}

/** Validar todos los campos de consecutivos antes de guardar.
 *  Retorna true si hay duplicados (impide guardar). */
function _validarDuplicados(campos){
  let hayError = false;
  campos.forEach(([inputId, hintId, campo, etiqueta]) => {
    const input = $(inputId);
    if(!input) return;
    const valor = input.value.trim();
    if(!valor) return;
    const dup = _buscarDuplicado(campo, valor);
    if(dup){
      hayError = true;
      _auditarCampo(inputId, hintId, campo);
    }
  });
  if(hayError){
    toast('Hay números duplicados. Corrija antes de guardar.','danger');
  }
  return hayError;
}

/* ── Días hábiles Colombia (excluye fines de semana + festivos) ── */

/* Festivos colombianos 2024-2030 (embebidos para compatibilidad con file://) */
const _FESTIVOS_DATA = [
  ["2024-01-01","Año Nuevo"],["2024-01-08","Día de los Reyes Magos"],["2024-03-25","Día de San José"],
  ["2024-03-28","Jueves Santo"],["2024-03-29","Viernes Santo"],["2024-05-01","Día del Trabajo"],
  ["2024-05-13","Ascensión del Señor"],["2024-06-03","Corpus Christi"],["2024-06-10","Sagrado Corazón de Jesús"],
  ["2024-07-01","San Pedro y San Pablo"],["2024-07-20","Día de la Independencia"],["2024-08-07","Batalla de Boyacá"],
  ["2024-08-19","Asunción de la Virgen"],["2024-10-14","Día de la Raza"],["2024-11-04","Todos los Santos"],
  ["2024-11-11","Independencia de Cartagena"],["2024-12-08","Inmaculada Concepción"],["2024-12-25","Navidad"],
  ["2025-01-01","Año Nuevo"],["2025-01-06","Día de los Reyes Magos"],["2025-03-24","Día de San José"],
  ["2025-04-17","Jueves Santo"],["2025-04-18","Viernes Santo"],["2025-05-01","Día del Trabajo"],
  ["2025-06-02","Ascensión del Señor"],["2025-06-23","Corpus Christi"],["2025-06-30","Sagrado Corazón de Jesús"],
  ["2025-07-20","Día de la Independencia"],["2025-08-07","Batalla de Boyacá"],["2025-08-18","Asunción de la Virgen"],
  ["2025-10-13","Día de la Raza"],["2025-11-03","Todos los Santos"],["2025-11-17","Independencia de Cartagena"],
  ["2025-12-08","Inmaculada Concepción"],["2025-12-25","Navidad"],
  ["2026-01-01","Año Nuevo"],["2026-01-12","Día de los Reyes Magos"],["2026-03-23","Día de San José"],
  ["2026-04-02","Jueves Santo"],["2026-04-03","Viernes Santo"],["2026-05-01","Día del Trabajo"],
  ["2026-05-18","Ascensión del Señor"],["2026-06-08","Corpus Christi"],["2026-06-15","Sagrado Corazón de Jesús"],
  ["2026-06-29","San Pedro y San Pablo"],["2026-07-20","Día de la Independencia"],["2026-08-07","Batalla de Boyacá"],
  ["2026-08-17","Asunción de la Virgen"],["2026-10-12","Día de la Raza"],["2026-11-02","Todos los Santos"],
  ["2026-11-16","Independencia de Cartagena"],["2026-12-08","Inmaculada Concepción"],["2026-12-25","Navidad"],
  ["2027-01-01","Año Nuevo"],["2027-01-11","Día de los Reyes Magos"],["2027-03-22","Día de San José"],
  ["2027-03-25","Jueves Santo"],["2027-03-26","Viernes Santo"],["2027-05-01","Día del Trabajo"],
  ["2027-05-10","Ascensión del Señor"],["2027-05-31","Corpus Christi"],["2027-06-07","Sagrado Corazón de Jesús"],
  ["2027-07-05","San Pedro y San Pablo"],["2027-07-20","Día de la Independencia"],["2027-08-07","Batalla de Boyacá"],
  ["2027-08-16","Asunción de la Virgen"],["2027-10-18","Día de la Raza"],["2027-11-01","Todos los Santos"],
  ["2027-11-15","Independencia de Cartagena"],["2027-12-08","Inmaculada Concepción"],["2027-12-25","Navidad"],
  ["2028-01-01","Año Nuevo"],["2028-01-10","Día de los Reyes Magos"],["2028-03-20","Día de San José"],
  ["2028-04-13","Jueves Santo"],["2028-04-14","Viernes Santo"],["2028-05-01","Día del Trabajo"],
  ["2028-05-29","Ascensión del Señor"],["2028-06-19","Corpus Christi"],["2028-06-26","Sagrado Corazón de Jesús"],
  ["2028-07-03","San Pedro y San Pablo"],["2028-07-20","Día de la Independencia"],["2028-08-07","Batalla de Boyacá"],
  ["2028-08-21","Asunción de la Virgen"],["2028-10-16","Día de la Raza"],["2028-11-06","Todos los Santos"],
  ["2028-11-13","Independencia de Cartagena"],["2028-12-08","Inmaculada Concepción"],["2028-12-25","Navidad"],
  ["2029-01-01","Año Nuevo"],["2029-01-08","Día de los Reyes Magos"],["2029-03-19","Día de San José"],
  ["2029-03-29","Jueves Santo"],["2029-03-30","Viernes Santo"],["2029-05-01","Día del Trabajo"],
  ["2029-05-14","Ascensión del Señor"],["2029-06-04","Corpus Christi"],["2029-06-11","Sagrado Corazón de Jesús"],
  ["2029-07-02","San Pedro y San Pablo"],["2029-07-20","Día de la Independencia"],["2029-08-07","Batalla de Boyacá"],
  ["2029-08-20","Asunción de la Virgen"],["2029-10-15","Día de la Raza"],["2029-11-05","Todos los Santos"],
  ["2029-11-12","Independencia de Cartagena"],["2029-12-08","Inmaculada Concepción"],["2029-12-25","Navidad"],
  ["2030-01-01","Año Nuevo"],["2030-01-07","Día de los Reyes Magos"],["2030-03-25","Día de San José"],
  ["2030-04-18","Jueves Santo"],["2030-04-19","Viernes Santo"],["2030-05-01","Día del Trabajo"],
  ["2030-06-03","Ascensión del Señor"],["2030-06-24","Corpus Christi"],["2030-07-01","San Pedro y San Pablo"],
  ["2030-07-20","Día de la Independencia"],["2030-08-07","Batalla de Boyacá"],["2030-08-19","Asunción de la Virgen"],
  ["2030-10-14","Día de la Raza"],["2030-11-04","Todos los Santos"],["2030-11-11","Independencia de Cartagena"],
  ["2030-12-08","Inmaculada Concepción"],["2030-12-25","Navidad"]
];
const _festivosSet = new Set();
const _festivosNombres = {};
_FESTIVOS_DATA.forEach(([f,n]) => { _festivosSet.add(f); _festivosNombres[f] = n; });

/* _cargarFestivos se mantiene como no-op para compatibilidad con init.js */
async function _cargarFestivos(){ /* datos ya embebidos */ }

/* Verificar si una fecha (YYYY-MM-DD) es festivo */
function _esFestivo(fechaStr){
  return _festivosSet.has(fechaStr);
}

/* Nombre del festivo */
function _nombreFestivo(fechaStr){
  return _festivosNombres[fechaStr] || 'Festivo';
}

/* Verificar si una fecha es día NO hábil (fin de semana o festivo) */
function _esNoHabil(d){
  const dow = d.getDay();
  if(dow === 0 || dow === 6) return true;
  return _esFestivo(d.toISOString().slice(0,10));
}

/* Sumar días hábiles (excluye sáb, dom y festivos colombianos) */
function _addDias(fechaStr, dias){
  const d = new Date(fechaStr + 'T12:00:00');
  let restantes = dias;
  while(restantes > 0){
    d.setDate(d.getDate() + 1);
    if(!_esNoHabil(d)) restantes--;
  }
  return d.toISOString().slice(0,10);
}

/* Ajustar fecha al siguiente día hábil si cae en no hábil */
function _ajustarHabil(fechaStr){
  if(!fechaStr) return fechaStr;
  const d = new Date(fechaStr + 'T12:00:00');
  while(_esNoHabil(d)){
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0,10);
}

/* Validar fecha manual: si es no hábil, corregir y avisar */
/* ── Cargar datos del Rector en Supervisión ── */
function _cargarRectorSupervisor(){
  const d = DB.load();
  const rector = d.config.rector || '';
  const idRector = d.config.idRector || '';
  if(!rector){
    toast('No hay datos del Rector en la configuración de la institución','warning');
    return;
  }
  $('mc-sv-nombre').value = rector;
  $('mc-sv-tipodoc').value = 'CC';
  $('mc-sv-numdoc').value = idRector;
  $('mc-sv-cargo').value = 'Rector(a)';
  toast('Datos del Rector cargados en Supervisión');
}

function validarFechaHabil(inp){
  if(!inp.value) return;
  // Corregir año < 100 (ej: 0025 → 2025)
  inp.value = _fixAnio(inp.value);
  const d = new Date(inp.value + 'T12:00:00');
  if(_esNoHabil(d)){
    const eraFestivo = _esFestivo(inp.value);
    const nombre = eraFestivo ? _nombreFestivo(inp.value) : '';
    inp.value = _ajustarHabil(inp.value);
    toast(eraFestivo
      ? `Fecha ajustada: ${nombre} (festivo colombiano)`
      : 'Fecha ajustada al siguiente día hábil (lun-vie)', 'warning');
  }
}

function _autoFechasContrato(force){
  // force=true: recalcular TODO (cuando el usuario cambia una fecha manualmente)
  // force=false/undefined: solo llenar campos vacíos (al cargar contrato guardado)
  const _si = (id, val) => { if(force || !$(id).value) $(id).value = val; };

  let fechaCDP = $('mc-pp-fecha-cdp').value;
  if(fechaCDP){
    fechaCDP = _ajustarHabil(fechaCDP);
    $('mc-pp-fecha-cdp').value = fechaCDP;

    // ═══ Plan de compras: tomar fechas de config o usar CDP ═══
    const d0 = DB.load();
    _si('mc-fecha-plan-compras', d0.config.fecha_paa || fechaCDP);
    _si('mc-fecha-mod-plan', d0.config.fecha_mod_paa || fechaCDP);

    // ═══ Fase Precontractual ═══
    const dia1 = _addDias(fechaCDP, 1);                        // CDP + 1 hábil
    const dia2 = _addDias(fechaCDP, 2);                        // CDP + 2 hábiles
    const dia3 = _addDias(fechaCDP, 3);                        // CDP + 3 hábiles
    const dia4 = _addDias(fechaCDP, 4);                        // CDP + 4 hábiles
    _si('mc-fecha-estudio',         dia1);                     // Estudio Previo + Invitación (día 1)
    _si('mc-fecha-ofertas',         dia2);                     // Recepción de Ofertas (día 2)
    _si('mc-fecha-carta-propuesta', dia2);                     // Carta Propuesta (día 2)
    _si('mc-fecha-evaluacion',      dia3);                     // Evaluación y Selección (día 3)
    _si('mc-fecha-aceptacion',      dia3);                     // Aceptación Oferta (día 3)

    // ═══ Fase Contractual ═══
    _si('mc-fecha-inicio',          dia4);                     // Fecha Contrato (día 4)
    _si('mc-pp-fecha-rp',           dia4);                     // RP
    _si('mc-sv-fecha-inicio',       $('mc-fecha-inicio').value);  // Acta Inicio = misma Fecha Inicio
  }

  // ═══ Cálculo: Fecha Fin = Fecha Inicio + Plazo ═══
  // Usar Fecha Inicio del contrato (no Acta Inicio, que es posterior y puede no existir aún)
  const fechaInicio = $('mc-fecha-inicio').value;
  const fechaBase = fechaInicio;
  const plazo = Number($('mc-plazo').value) || 0;
  const unidad = ($('mc-plazo-unidad')||{}).value || 'dias';
  if(fechaBase && plazo > 0){
    let fechaFin;
    if(unidad === 'meses'){
      // N meses calendario — el día de inicio cuenta como día 1
      // Ej: 2 meses desde 15/ene = 14/mar (un día antes de la misma fecha N meses después)
      // Ej: 1 mes desde 31/ene = 27/feb (último día del mes si no alcanza, -1)
      const fi = new Date(fechaBase + 'T12:00:00');
      const diaOrig = fi.getDate();
      fi.setMonth(fi.getMonth() + plazo);
      // Si el mes destino tiene menos días, JS desborda al siguiente mes — corregir
      if(fi.getDate() < diaOrig) fi.setDate(0); // ir al último día del mes anterior
      fi.setDate(fi.getDate() - 1); // día anterior = último día del plazo
      fechaFin = fi.toISOString().split('T')[0];
    } else {
      // Plazo en días calendario — el día de inicio cuenta como día 1
      // Ej: 5 días desde 20/mar → 20(1),21(2),22(3),23(4),24(5) = termina 24/mar
      const fi = new Date(fechaBase + 'T12:00:00');
      fi.setDate(fi.getDate() + plazo - 1);
      fechaFin = fi.toISOString().split('T')[0];
    }
    $('mc-fecha-fin').value = fechaFin;

    // ═══ Fase de Cierre: relativas a Fecha Fin ═══
    // Fecha Fin es calendario (puede caer sáb/dom); actos administrativos en día hábil
    const fechaFinHabil = _ajustarHabil(fechaFin);
    $('mc-sv-fecha-final').value = fechaFinHabil;                   // Acta Final = Fecha Fin o sig. hábil
    if($('mc-sv-fecha-liquidacion'))
      $('mc-sv-fecha-liquidacion').value = _addDias(fechaFinHabil, 1); // Liquidación = Acta Final + 1 hábil
    _si('mc-fecha-acta-recibido',   fechaFinHabil);                 // Acta Recibido (solo si vacía)
    if($('mc-pg-egreso-modo').value === 'auto'){
      _aplicarFechaEgresoAuto(fechaFin);
    }
  }
}

// Recalcular Fecha Fin cuando cambia el Acta de Inicio
function _recalcFechaFinDesdeActa(){
  const plazo = Number($('mc-plazo').value) || 0;
  if(plazo > 0) _autoFechasContrato();
}

/* Auto-generar N° RP y N° Egreso cuando se digita el N° de Contrato (solo si están vacíos) */
/** Auto-generar RP cuando se digita N° Contrato (NO genera CDP, ese va al abrir modal) */
function _autoRP(){
  const d = DB.load();
  const _editId = $('mc-id').value || '';
  const _otros = (d.contratos_full||[]).filter(c => c.id !== _editId);
  // Auto RP (formato RP001, RP002...) — solo si hay N° Contrato
  const numContrato = $('mc-numero').value.trim();
  if(numContrato && !$('mc-pp-rp').value){
    const _rpNums = _otros.map(c => {
      const m = String(c.rp||'').match(/(\d+)/); return m ? Number(m[1]) : 0;
    }).filter(n=>n>0);
    const _sig = _rpNums.length ? Math.max(..._rpNums) + 1 : 1;
    $('mc-pp-rp').value = 'RP' + String(_sig).padStart(3,'0');
  }
}

/* Aplicar fecha de egreso automática (fin + 2 para pago, fin + 3 para liquidación) */
function _aplicarFechaEgresoAuto(fechaFin){
  if(!fechaFin) fechaFin = $('mc-fecha-fin').value;
  if(!fechaFin) return;
  const fechaEgreso = _addDias(fechaFin, 2);
  if(!$('mc-pg-fecha-egreso').value)      $('mc-pg-fecha-egreso').value      = fechaEgreso;       // Egreso = Fin+2
  if(!$('mc-pg-fecha').value)             $('mc-pg-fecha').value             = fechaEgreso;       // Orden Pago = Egreso
  // Liquidación se calcula en _autoFechasContrato() desde Fecha Fin, no desde el egreso
}


/* ── Información Contable: Retenciones colombianas ── */
const RETENCIONES = [
  { id:1, concepto:'Ret. Compras ND',           pct:2.5,  cuenta:'243608'   },
  { id:2, concepto:'Ret. DC',                   pct:3.5,  cuenta:'243609'   },
  { id:3, concepto:'Ret. Servicios ND',         pct:6,    cuenta:'24360502' },
  { id:4, concepto:'Ret. 4%',                   pct:4,    cuenta:'24360501' },
  { id:5, concepto:'Ret. Honorarios',           pct:10,   cuenta:'2436030'  },
  { id:6, concepto:'Ret. 0%',                   pct:0,    cuenta:''         },
  { id:7, concepto:'Ret. IVA Régimen Simple',   pct:15,   cuenta:'243625'   }
];

/* ── Cálculo automático de retención, neto y asiento contable ── */
function calcRetencionContrato(){
  const valorTotal = Number($('mc-valor')?.value) || 0;
  const iva = Number($('mc-pg-iva')?.value) || 0;
  const base = valorTotal - iva;

  // Mostrar base
  if($('mc-pg-base')) $('mc-pg-base').value = fmt(base);

  // Obtener tipo de retención seleccionado
  const sel = $('mc-pg-tipo-ret');
  const opt = sel ? sel.options[sel.selectedIndex] : null;
  const retId = sel ? Number(sel.value) : 0;
  const pct = opt && opt.dataset.pct ? Number(opt.dataset.pct) : 0;
  const cuenta = opt && opt.dataset.cuenta ? opt.dataset.cuenta : '';
  const retConcepto = opt && opt.value ? opt.textContent.split('—')[0].trim() : '';

  // Mostrar porcentaje
  if($('mc-pg-pct-ret')) $('mc-pg-pct-ret').value = retId ? pct + '%' : '';

  // Calcular retención: tipo 7 calcula sobre IVA, los demás sobre base
  let valorRet = 0;
  if(retId === 7){
    valorRet = Math.round(iva * pct / 100);
  } else if(retId > 0){
    valorRet = Math.round(base * pct / 100);
  }

  // Neto a pagar = valor total - retención
  const neto = valorTotal - valorRet;

  // Mostrar valores
  if($('mc-pg-retencion')) $('mc-pg-retencion').value = fmt(valorRet);
  if($('mc-pg-neto')) $('mc-pg-neto').value = fmt(neto);

  // Actualizar asiento contable
  const cuentaContable = $('mc-pp-cuenta-contable')?.value || '';
  const nombreCuenta = $('mc-pp-nombre-cuenta')?.value || '';
  const rubroCod = $('mc-pp-rubro')?.value || '';
  const rubroNombre = $('mc-pp-rubro-nombre')?.value || '';
  // Código = cuenta contable PUC; si no hay, usar código del rubro como respaldo
  const codAsiento = cuentaContable || rubroCod || '—';
  // Nombre = nombre de la cuenta contable; si no hay, usar nombre del rubro
  const nomAsiento = nombreCuenta || rubroNombre || 'Cuenta Presupuestal';

  // Fila 1: Débito (cuenta presupuestal)
  if($('ac-cod1')) $('ac-cod1').textContent = codAsiento;
  if($('ac-nom1')) $('ac-nom1').textContent = nomAsiento;
  if($('ac-deb1')) $('ac-deb1').textContent = valorTotal ? fmt(valorTotal) : '–';

  // Fila 2: Crédito retención
  if($('ac-cod2')) $('ac-cod2').textContent = cuenta || '—';
  if($('ac-nom2')) $('ac-nom2').textContent = retConcepto || 'Retención en la Fuente';
  if($('ac-cred2')) $('ac-cred2').textContent = valorRet ? fmt(valorRet) : '–';

  // Fila 3: Crédito cuentas por pagar (neto)
  if($('ac-cred3')) $('ac-cred3').textContent = neto ? fmt(neto) : '–';
}

/* ══════════════════════════════════════════════════════════
   DATOS BÁSICOS — Validación en tiempo real
══════════════════════════════════════════════════════════ */

/** Validar campos de datos básicos y mostrar alerta de campos vacíos */
function _validarDatosBasicos(){
  const alerta = $('alerta-datos-basicos');
  if(!alerta) return;

  const campos = [
    {id:'mc-numero',    label:'N° Contrato'},
    {id:'mc-valor',     label:'Valor Total'},
    {id:'mc-fecha-inicio', label:'Fecha Inicio'},
    {id:'mc-plazo',     label:'Plazo'}
  ];
  const vacios = [];
  campos.forEach(c => {
    const el = $(c.id);
    if(!el) return;
    const vacio = !el.value || !el.value.trim() || (c.id === 'mc-valor' && Number(el.value) <= 0);
    el.classList.toggle('border-warning', vacio);
    if(vacio) vacios.push(c.label);
  });

  // Advertencia especial: plazo digitado → confirmar unidad (días vs meses)
  const plazo = Number(($('mc-plazo')||{}).value) || 0;
  const unidad = ($('mc-plazo-unidad')||{}).value || 'dias';
  let avisoUnidad = '';
  if(plazo > 0){
    const unidadTexto = unidad === 'meses' ? 'MESES' : 'DÍAS';
    avisoUnidad = ' | Plazo: <strong>' + plazo + ' ' + unidadTexto + '</strong> — verifique que la unidad sea correcta';
  }

  if(vacios.length > 0){
    alerta.className = 'alert alert-warning py-1 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i>Sin llenar: <strong>' + vacios.join(', ') + '</strong>' + avisoUnidad;
    alerta.style.display = '';
  } else if(avisoUnidad){
    alerta.className = 'alert alert-info py-1 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-info-circle-fill me-1"></i>Datos completos' + avisoUnidad;
    alerta.style.display = '';
  } else {
    alerta.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════════════
   COTIZACIONES — Validación y auto-copia
══════════════════════════════════════════════════════════ */

/* Validar cotizaciones: sin duplicados + exactamente 1 CUMPLE */
function _validarCotizaciones(){
  const alerta = $('alerta-cot');
  if(!alerta) return true;

  // 0. Revisar campos vacíos en cotizaciones que tienen nombre
  const camposReq = ['nombre','nit','valor','fecha','hora','municipio','doc'];
  const camposLabel = {nombre:'Proveedor',nit:'NIT/CC',valor:'Valor',fecha:'Fecha',hora:'Hora',municipio:'Municipio',doc:'Documentación'};
  let faltantes = [];
  [0,1,2].forEach(i => {
    const nombre = ($(`mc-cot${i}-nombre`)||{}).value||'';
    if(!nombre.trim()) return; // cotización vacía, no validar
    camposReq.forEach(campo => {
      const el = $(`mc-cot${i}-${campo}`);
      if(!el) return;
      const vacio = !el.value || !el.value.trim();
      if(vacio) faltantes.push(`Cot.${i+1}: ${camposLabel[campo]}`);
      // Resaltar campos vacíos con borde amarillo
      el.classList.toggle('border-warning', vacio);
    });
  });

  // 1. Verificar nombres duplicados (solo los que tienen valor)
  const nombres = [0,1,2].map(i => {
    const el = $(`mc-cot${i}-nombre`);
    return el ? el.value.trim().toUpperCase() : '';
  }).filter(v => v !== '');

  if(nombres.length !== new Set(nombres).size){
    alerta.className = 'alert alert-danger py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Hay <strong>proveedores duplicados</strong>. Cada cotización debe ser de un proveedor diferente.';
    alerta.style.display = '';
    return false;
  }

  // 2. Verificar estado de documentación
  const docs = [0,1,2].map(i => {
    const s = $(`mc-cot${i}-doc`);
    return s ? s.value : '';
  });
  const cumples = docs.filter(v => v === 'CUMPLE').length;
  const noCumples = docs.filter(v => v === 'NO CUMPLE').length;
  const hayCots = docs.some(v => v !== '');

  if(cumples > 1){
    alerta.className = 'alert alert-danger py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Solo <strong>una cotización</strong> puede tener documentación "CUMPLE".';
    alerta.style.display = '';
    return false;
  } else if(faltantes.length > 0){
    alerta.className = 'alert alert-warning py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Campos sin llenar: <strong>' + faltantes.join(', ') + '</strong>';
    alerta.style.display = '';
    return true; // advertencia, no bloquea
  } else if(hayCots && cumples === 0){
    alerta.className = 'alert alert-warning py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Debe seleccionar <strong>una cotización como CUMPLE</strong>.';
    alerta.style.display = '';
    return true;
  } else if(cumples === 1 && noCumples === 2){
    alerta.className = 'alert alert-success py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Cotizaciones correctas: 1 CUMPLE, 2 NO CUMPLE.';
    alerta.style.display = '';
    return true;
  } else if(cumples === 1){
    alerta.className = 'alert alert-info py-2 px-3 mb-2 small fw-semibold';
    alerta.innerHTML = '<i class="bi bi-info-circle-fill me-2"></i>1 CUMPLE seleccionada. Falta marcar las otras como NO CUMPLE.';
    alerta.style.display = '';
    return true;
  } else {
    alerta.style.display = 'none';
    return true;
  }
}

/* Auto-completar contratista desde cotización CUMPLE + directorio de personas */
function _autoCompletarContratista(){
  const panel = $('mc-panel-contratista');

  // 1. Buscar cotización con CUMPLE
  let cotCumple = null;
  for(let i = 0; i < 3; i++){
    const doc = $(`mc-cot${i}-doc`);
    if(doc && doc.value === 'CUMPLE'){
      cotCumple = {
        nombre:    $(`mc-cot${i}-nombre`)?.value || '',
        nit:       $(`mc-cot${i}-nit`)?.value || '',
        municipio: $(`mc-cot${i}-municipio`)?.value || '',
        email:     $(`mc-cot${i}-email`)?.value || '',
        replegal:  $(`mc-cot${i}-replegal`)?.value || ''
      };
      break;
    }
  }
  if(!cotCumple){
    // Sin CUMPLE: ocultar panel y limpiar campos ocultos
    if(panel) panel.style.display = 'none';
    return;
  }

  // 2. Buscar persona en directorio usando NIT de la cotización CUMPLE
  let persona = null;
  const nitCot = cotCumple.nit.trim();
  if(nitCot){
    const d = DB.load();
    persona = (d.personas||[]).find(p => (p.numdoc||'') === nitCot);
  }

  // 3. Mapeo: campo → [fuente cotización, fuente persona]
  const campos = [
    ['mc-ct-nombre',      cotCumple.nombre,    persona?.nombre],
    ['mc-ct-numdoc',      cotCumple.nit,       persona?.numdoc],
    ['mc-ct-tipodoc',     null,                persona?.tipodoc],
    ['mc-ct-municipio',   cotCumple.municipio, persona?.municipio],
    ['mc-ct-email',       cotCumple.email,     persona?.email],
    ['mc-ct-direccion',   null,                persona?.direccion],
    ['mc-ct-telefono',    null,                persona?.telefono || persona?.celular],
    ['mc-ct-banco',       null,                persona?.banco],
    ['mc-ct-tipocuenta',  null,                persona?.tipo_cuenta],
    ['mc-ct-numcuenta',   null,                persona?.cuenta_banco],
    ['mc-ct-replegal',    cotCumple.replegal,  persona?.rep_legal],
    ['mc-ct-replegal-cc', null,                persona?.rep_legal_cc]
  ];

  // Llenar campos ocultos (para documentos y guardado)
  campos.forEach(([id, valCot, valPersona]) => {
    const el = $(id);
    if(!el) return;
    el.value = valCot || valPersona || '';
  });

  // 4. Generar panel resumen visual
  if(!panel) return;
  const _v = (id) => $(id)?.value || '';
  const nombre = _v('mc-ct-nombre');
  const tipodoc = _v('mc-ct-tipodoc');
  const numdoc = _v('mc-ct-numdoc');
  const municipio = _v('mc-ct-municipio');
  const direccion = _v('mc-ct-direccion');
  const telefono = _v('mc-ct-telefono');
  const email = _v('mc-ct-email');
  const banco = _v('mc-ct-banco');
  const tipocuenta = _v('mc-ct-tipocuenta');
  const numcuenta = _v('mc-ct-numcuenta');
  const replegal = _v('mc-ct-replegal');
  const replegalcc = _v('mc-ct-replegal-cc');

  const iconOk = '<i class="bi bi-check-circle-fill text-success me-1"></i>';
  const iconWarn = '<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>';
  const enDirectorio = !!persona;

  // Fila auxiliar
  const _fila = (lbl, val) => val ? `<tr><td style="padding:2px 8px;color:#555;width:140px">${lbl}</td><td style="padding:2px 8px;font-weight:600">${val}</td></tr>` : '';

  let repLegalHtml = '';
  if(tipodoc === 'NIT' && replegal){
    repLegalHtml = `
      <tr><td colspan="2" style="padding:4px 8px 2px;border-top:1px solid #dee2e6">
        <span class="fw-bold text-muted" style="font-size:10px"><i class="bi bi-person-badge me-1"></i>Representante Legal</span></td></tr>
      ${_fila('Nombre', replegal)}
      ${_fila('CC', replegalcc)}`;
  }

  const btnRegistrar = !enDirectorio && numdoc
    ? `<button class="btn btn-sm btn-outline-primary mt-1" onclick="_registrarContratistaEnDirectorio()">
         <i class="bi bi-person-plus me-1"></i>Registrar en Directorio de Personas
       </button>` : '';

  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,${enDirectorio ? '#e8f5e9' : '#fff8e1'},${enDirectorio ? '#f0f7f0' : '#fffde7'});
      border:1px solid ${enDirectorio ? '#a5d6a7' : '#ffe082'};border-radius:8px;padding:10px 14px;margin-top:8px">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="fw-bold" style="font-size:12px;color:${enDirectorio ? '#1b5e20' : '#e65100'}">
          ${enDirectorio ? iconOk : iconWarn}Contratista Seleccionado
        </span>
        <span class="badge ${enDirectorio ? 'bg-success' : 'bg-warning text-dark'}" style="font-size:9px">
          ${enDirectorio ? 'En directorio' : 'No está en directorio'}
        </span>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        ${_fila('Nombre', nombre)}
        ${_fila(tipodoc || 'Doc.', numdoc)}
        ${_fila('Municipio', municipio)}
        ${_fila('Dirección', direccion)}
        ${_fila('Teléfono', telefono)}
        ${_fila('Email', email)}
        ${_fila('Banco', banco ? (banco + (numcuenta ? ' — ' + tipocuenta + ' ' + numcuenta : '')) : '')}
        ${repLegalHtml}
      </table>
      ${btnRegistrar}
    </div>`;
  panel.style.display = 'block';
}

/* Registrar contratista actual en el directorio de personas */
function _registrarContratistaEnDirectorio(){
  const _v = (id) => $(id)?.value || '';
  const nombre = _v('mc-ct-nombre');
  const numdoc = _v('mc-ct-numdoc');
  if(!nombre || !numdoc){
    toast('Faltan nombre y documento del contratista','danger');
    return;
  }
  const d = DB.load();
  // Verificar que no exista ya
  if((d.personas||[]).find(p => p.numdoc === numdoc)){
    toast('Esta persona ya existe en el directorio','warning');
    return;
  }
  const p = {
    id: uid(),
    nombre,
    cargo: '',
    tipodoc: _v('mc-ct-tipodoc') || 'CC',
    numdoc,
    telefono: _v('mc-ct-telefono'),
    celular: _v('mc-ct-telefono'),
    email: _v('mc-ct-email'),
    direccion: _v('mc-ct-direccion'),
    municipio: _v('mc-ct-municipio'),
    banco: _v('mc-ct-banco'),
    nombre_banco: _v('mc-ct-banco'),
    tipo_cuenta: _v('mc-ct-tipocuenta') || 'Ahorros',
    cuenta_banco: _v('mc-ct-numcuenta'),
    cuenta_bancaria: _v('mc-ct-numcuenta'),
    rep_legal: _v('mc-ct-replegal'),
    rep_legal_nombre: _v('mc-ct-replegal'),
    rep_legal_cc: _v('mc-ct-replegal-cc'),
    rep_legal_num_documento: _v('mc-ct-replegal-cc')
  };
  if(!d.personas) d.personas = [];
  d.personas.push(p);
  DB.save(d);
  toast('Persona registrada en el directorio','success');
  // Refrescar panel para mostrar "En directorio"
  _autoCompletarContratista();
}

/* Mostrar panel resumen del contratista desde campos ocultos ya llenados
   (usado al cargar contrato existente) */
function _mostrarPanelContratista(){
  const panel = $('mc-panel-contratista');
  if(!panel) return;
  const _v = (id) => $(id)?.value || '';
  const nombre = _v('mc-ct-nombre');
  const numdoc = _v('mc-ct-numdoc');

  // Si no hay contratista, ocultar
  if(!nombre && !numdoc){
    panel.style.display = 'none';
    return;
  }

  // Verificar si está en directorio
  const d = DB.load();
  const enDirectorio = numdoc ? !!(d.personas||[]).find(p => (p.numdoc||'') === numdoc) : false;

  const tipodoc = _v('mc-ct-tipodoc');
  const municipio = _v('mc-ct-municipio');
  const direccion = _v('mc-ct-direccion');
  const telefono = _v('mc-ct-telefono');
  const email = _v('mc-ct-email');
  const banco = _v('mc-ct-banco');
  const tipocuenta = _v('mc-ct-tipocuenta');
  const numcuenta = _v('mc-ct-numcuenta');
  const replegal = _v('mc-ct-replegal');
  const replegalcc = _v('mc-ct-replegal-cc');

  const iconOk = '<i class="bi bi-check-circle-fill text-success me-1"></i>';
  const iconWarn = '<i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>';
  const _fila = (lbl, val) => val ? `<tr><td style="padding:2px 8px;color:#555;width:140px">${lbl}</td><td style="padding:2px 8px;font-weight:600">${val}</td></tr>` : '';

  let repLegalHtml = '';
  if(tipodoc === 'NIT' && replegal){
    repLegalHtml = `
      <tr><td colspan="2" style="padding:4px 8px 2px;border-top:1px solid #dee2e6">
        <span class="fw-bold text-muted" style="font-size:10px"><i class="bi bi-person-badge me-1"></i>Representante Legal</span></td></tr>
      ${_fila('Nombre', replegal)}
      ${_fila('CC', replegalcc)}`;
  }

  const btnRegistrar = !enDirectorio && numdoc
    ? `<button class="btn btn-sm btn-outline-primary mt-1" onclick="_registrarContratistaEnDirectorio()">
         <i class="bi bi-person-plus me-1"></i>Registrar en Directorio de Personas
       </button>` : '';

  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,${enDirectorio ? '#e8f5e9' : '#fff8e1'},${enDirectorio ? '#f0f7f0' : '#fffde7'});
      border:1px solid ${enDirectorio ? '#a5d6a7' : '#ffe082'};border-radius:8px;padding:10px 14px;margin-top:8px">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="fw-bold" style="font-size:12px;color:${enDirectorio ? '#1b5e20' : '#e65100'}">
          ${enDirectorio ? iconOk : iconWarn}Contratista
        </span>
        <span class="badge ${enDirectorio ? 'bg-success' : 'bg-warning text-dark'}" style="font-size:9px">
          ${enDirectorio ? 'En directorio' : 'No está en directorio'}
        </span>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        ${_fila('Nombre', nombre)}
        ${_fila(tipodoc || 'Doc.', numdoc)}
        ${_fila('Municipio', municipio)}
        ${_fila('Dirección', direccion)}
        ${_fila('Teléfono', telefono)}
        ${_fila('Email', email)}
        ${_fila('Banco', banco ? (banco + (numcuenta ? ' — ' + tipocuenta + ' ' + numcuenta : '')) : '')}
        ${repLegalHtml}
      </table>
      ${btnRegistrar}
    </div>`;
  panel.style.display = 'block';
}

/* Cuando cambia documentación de cotización: auto-copia datos a contratista si CUMPLE */
function cotDocChange(n){
  _validarCotizaciones();

  const doc = $(`mc-cot${n}-doc`);
  if(!doc || doc.value !== 'CUMPLE') return;

  // Datos de la cotización CUMPLE
  const nombre = $(`mc-cot${n}-nombre`)?.value || '';
  const nit = $(`mc-cot${n}-nit`)?.value || '';
  const municipio = $(`mc-cot${n}-municipio`)?.value || '';
  const email = $(`mc-cot${n}-email`)?.value || '';
  const replegal = $(`mc-cot${n}-replegal`)?.value || '';

  // Copiar datos básicos de la cotización al contratista
  if($('mc-ct-nombre')) $('mc-ct-nombre').value = nombre;
  if($('mc-ct-numdoc')) $('mc-ct-numdoc').value = nit;
  if($('mc-ct-municipio')) $('mc-ct-municipio').value = municipio;
  if($('mc-ct-email')) $('mc-ct-email').value = email;
  if($('mc-ct-replegal')) $('mc-ct-replegal').value = replegal;

  // Buscar persona en directorio por NIT para llenar campos adicionales
  if(nit){
    const d = DB.load();
    const persona = (d.personas||[]).find(p => (p.numdoc||'') === nit);
    if(persona){
      if($('mc-ct-tipodoc') && persona.tipodoc) $('mc-ct-tipodoc').value = persona.tipodoc;
      if($('mc-ct-direccion') && persona.direccion) $('mc-ct-direccion').value = persona.direccion;
      if($('mc-ct-telefono') && (persona.telefono||persona.celular)) $('mc-ct-telefono').value = persona.telefono || persona.celular;
      if($('mc-ct-banco') && persona.banco) $('mc-ct-banco').value = persona.banco;
      if($('mc-ct-tipocuenta') && persona.tipo_cuenta) $('mc-ct-tipocuenta').value = persona.tipo_cuenta;
      if($('mc-ct-numcuenta') && persona.cuenta_banco) $('mc-ct-numcuenta').value = persona.cuenta_banco;
      if($('mc-ct-replegal-cc') && persona.rep_legal_cc) $('mc-ct-replegal-cc').value = persona.rep_legal_cc;
      // Llenar campos que la cotización no tenía (si están vacíos)
      if(!municipio && persona.municipio && $('mc-ct-municipio')) $('mc-ct-municipio').value = persona.municipio;
      if(!email && persona.email && $('mc-ct-email')) $('mc-ct-email').value = persona.email;
      if(!replegal && persona.rep_legal && $('mc-ct-replegal')) $('mc-ct-replegal').value = persona.rep_legal;
    }
  }

  // Marcar como seleccionada (sel = 1) y las otras como no
  [0,1,2].forEach(i => {
    const sel = $(`mc-cot${i}-sel`);
    if(sel) sel.value = (i === n) ? '1' : '';
  });

  // Generar panel visual del contratista
  _mostrarPanelContratista();

  // Aviso
  const aviso = $('aviso-cotizacion');
  if(aviso){
    aviso.textContent = `✓ Datos de Cotización ${n+1} copiados a Datos del Contratista`;
    aviso.style.display = '';
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
  }
}

/* Limpiar todos los campos de una cotización */
function limpiarCot(n){
  ['nombre','nit','valor','hora','fecha','municipio','replegal','email'].forEach(campo => {
    const el = $(`mc-cot${n}-${campo}`);
    if(el) el.value = '';
  });
  const doc = $(`mc-cot${n}-doc`);
  if(doc) doc.value = '';
  const sel = $(`mc-cot${n}-sel`);
  if(sel) sel.value = '';
  // Quitar resaltado de campos vacíos
  $(`mc-cot${n}-nombre`)?.classList.remove('border-warning');
  $(`mc-cot${n}-fecha`)?.classList.remove('border-warning');
  $(`mc-cot${n}-hora`)?.classList.remove('border-warning');
  $(`mc-cot${n}-municipio`)?.classList.remove('border-warning');
  _validarCotizaciones();
}

/* Buscar persona en directorio local para cotización */
function buscarPersonaCot(n, inp){
  const q = inp.value.trim().toLowerCase();
  if(q.length < 2) return;
  const d = DB.load();
  const personas = d.personas || [];
  const match = personas.find(p =>
    (p.nombre||'').toLowerCase().includes(q) || (p.numdoc||'').includes(q)
  );
  if(match){
    if($(`mc-cot${n}-nit`)) $(`mc-cot${n}-nit`).value = match.numdoc || '';
    if($(`mc-cot${n}-municipio`)) $(`mc-cot${n}-municipio`).value = match.municipio || '';
    if($(`mc-cot${n}-email`)) $(`mc-cot${n}-email`).value = match.email || '';
    if($(`mc-cot${n}-replegal`)) $(`mc-cot${n}-replegal`).value = match.rep_legal || '';
  }
}

/* Buscar persona por número de documento en cotización */
function buscarPersonaCotPorDoc(n, inp){
  const q = inp.value.trim();
  if(q.length < 3) return;
  const d = DB.load();
  const personas = d.personas || [];
  const match = personas.find(p => (p.numdoc||'').includes(q));
  if(match){
    if($(`mc-cot${n}-nombre`)) $(`mc-cot${n}-nombre`).value = match.nombre || '';
    if($(`mc-cot${n}-municipio`)) $(`mc-cot${n}-municipio`).value = match.municipio || '';
    if($(`mc-cot${n}-email`)) $(`mc-cot${n}-email`).value = match.email || '';
    if($(`mc-cot${n}-replegal`)) $(`mc-cot${n}-replegal`).value = match.rep_legal || '';
  }
}

/* ══════════════════════════════════════════════════════════
   CONTRATISTA — Autocomplete persona + Rep Legal toggle
══════════════════════════════════════════════════════════ */

/* Buscar persona en directorio local para contratista */
/* (buscarContratistaPersona ya no se usa: la búsqueda ocurre
   automáticamente vía _autoCompletarContratista al seleccionar CUMPLE) */

/* toggleRepLegal ya no se usa: el panel visual muestra la sección
   de Rep Legal automáticamente cuando tipodoc === NIT */

/* ══════════════════════════════════════════════════════════
   PRESUPUESTO — Cálculo de saldos y auto-llenado de rubro
══════════════════════════════════════════════════════════ */

/* Resaltar fila del banco seleccionado y mostrar info */
function _resaltarBancoSel(){
  const sel = $('mc-pp-banco-sel')?.value || '1';
  [1,2,3].forEach(n => {
    const row = $('mc-banco-row'+n);
    if(row){
      row.style.background = (String(n) === sel) ? '#d1e7dd' : '';
      row.style.fontWeight = (String(n) === sel) ? '600' : '';
    }
  });
  const banco = $('mc-pp-banco'+sel)?.value || '';
  const cta = $('mc-pp-cta'+sel)?.value || '';
  const info = $('mc-banco-sel-nombre');
  if(info) info.textContent = banco ? (banco + ' — Cta. ' + cta) : '—';
}

/* Bloquear/Desbloquear todos los campos del contrato cuando rubro no tiene saldo */
function _bloquearCamposContrato(bloquear){
  // IDs de campos que NO se bloquean (para que pueda cambiar el rubro)
  const excluir = ['mc-pp-rubro','mc-pp-fuente','mc-pp-vigencia','mc-id'];
  // Buscar todos los inputs, selects, textareas y botones dentro del modal
  const modal = document.getElementById('mContrato');
  if(!modal) return;
  const campos = modal.querySelectorAll('input, select, textarea, button');
  campos.forEach(el => {
    if(excluir.includes(el.id)) return;
    if(el.closest('.modal-footer')) return; // No bloquear botones del footer (Cancelar)
    if(bloquear){
      el.disabled = true;
      el.style.opacity = '0.5';
      el.style.pointerEvents = 'none';
    } else {
      el.disabled = false;
      el.style.opacity = '';
      el.style.pointerEvents = '';
    }
  });
  // Bloquear/desbloquear las pestañas también (excepto Presupuesto)
  const tabs = modal.querySelectorAll('#mc-tabs .nav-link');
  tabs.forEach(tab => {
    if(tab.getAttribute('href') === '#mc-tab-presup') return;
    if(bloquear){
      tab.classList.add('disabled');
      tab.style.opacity = '0.4';
      tab.style.pointerEvents = 'none';
    } else {
      tab.classList.remove('disabled');
      tab.style.opacity = '';
      tab.style.pointerEvents = '';
    }
  });
}

/* Mostrar panel informativo del saldo presupuestal del rubro seleccionado */
function _mostrarInfoSaldoRubro(cod, pDef, cdpOtros, saldoDisp){
  const panel = $('mc-pp-info-saldo');
  if(!panel) return;
  const colorSaldo = saldoDisp <= 0 ? '#dc3545' : '#198754';
  const iconAlert = saldoDisp <= 0
    ? '<i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>'
    : '<i class="bi bi-check-circle-fill text-success me-1"></i>';
  panel.innerHTML = `
    <div style="background:linear-gradient(135deg,#e8f4fd,#f0f7ff);border:1px solid #b6d4fe;
      border-radius:8px;padding:8px 12px;font-size:11px;margin-top:6px">
      <div class="fw-bold text-primary mb-1" style="font-size:11px">
        <i class="bi bi-info-circle me-1"></i>Información Presupuestal — ${cod}
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <tr>
          <td style="padding:2px 4px">P. Definitivo</td>
          <td style="padding:2px 4px;text-align:right;font-weight:600">$ ${fmt(pDef)}</td>
        </tr>
        <tr>
          <td style="padding:2px 4px">CDPs otros contratos</td>
          <td style="padding:2px 4px;text-align:right;font-weight:600;color:#dc3545">– $ ${fmt(cdpOtros)}</td>
        </tr>
        <tr style="border-top:1px solid #90c4f9">
          <td style="padding:3px 4px;font-weight:700">${iconAlert}Saldo Disponible</td>
          <td style="padding:3px 4px;text-align:right;font-weight:700;font-size:13px;color:${colorSaldo}">$ ${fmt(saldoDisp)}</td>
        </tr>
      </table>
    </div>`;
}

/* Calcular saldos: Compromiso = Valor CDP, Nuevo Saldo = Saldo Ppto - Compromiso */
function calcSaldosContrato(){
  const saldo = Number($('mc-pp-saldo-ppto')?.value) || 0;
  const comp = Number($('mc-pp-valor-cdp')?.value) || 0;
  const nuevo = saldo - comp;

  // Sincronizar: Valor Total del contrato = Valor CDP
  if($('mc-valor') && comp) $('mc-valor').value = comp;

  // Actualizar campo oculto
  if($('mc-pp-saldo-compromiso')) $('mc-pp-saldo-compromiso').value = comp;

  // Actualizar displays
  if($('mc-pp-comp-disp')) $('mc-pp-comp-disp').textContent = comp ? '$ ' + fmt(comp) : '–';
  if($('mc-pp-nuevo-saldo')){
    $('mc-pp-nuevo-saldo').textContent = saldo ? '$ ' + fmt(nuevo) : '–';
    $('mc-pp-nuevo-saldo').style.color = nuevo < 0 ? '#dc3545' : '#198754';
  }

  // ═══ Alerta: valor excede saldo disponible ═══
  const alerta = $('mc-alerta-saldo');
  if(alerta){
    if(comp > 0 && saldo > 0 && nuevo < 0){
      const excede = Math.abs(nuevo);
      alerta.innerHTML = `
        <div class="alert alert-danger py-2 px-3 mb-0 mt-2" style="font-size:11px">
          <i class="bi bi-exclamation-octagon-fill me-1"></i>
          <strong>¡Sin presupuesto suficiente!</strong> El valor del contrato
          <strong>($ ${fmt(comp)})</strong> excede el saldo disponible
          <strong>($ ${fmt(saldo)})</strong> por <strong>$ ${fmt(excede)}</strong>.
          <br><i class="bi bi-arrow-right-circle me-1 mt-1"></i>
          Debe realizar un <strong>traslado presupuestal</strong> o
          <strong>reducir el valor</strong> del contrato antes de continuar.
        </div>`;
      alerta.style.display = '';
    } else {
      alerta.innerHTML = '';
      alerta.style.display = 'none';
    }
  }

  // Recalcular retención (depende de valor total)
  calcRetencionContrato();
}

/* ═══ Limpiar campos de una etapa específica ═══ */
function _limpiarEtapa(n){
  const campos = {
    1: ['mc-numero','mc-valor','mc-plazo','mc-objeto'],
    3: ['mc-pp-rp','mc-pp-fecha-rp'],
    4: ['mc-sv-fecha-inicio','mc-sv-fecha-final'],
    5: ['mc-sv-fecha-liquidacion']
  };
  const lista = campos[n];
  if(!lista) return;
  if(!confirm('¿Limpiar los campos de la Etapa '+n+'?')) return;
  lista.forEach(id => { if($(id)) $(id).value = ''; });
  toast('Etapa '+n+' limpiada','warning');
}

/* ═══ Control de visibilidad de etapas según Estado del contrato ═══
   Solo oculta/muestra — NO borra datos de campos ocultos.
   ─────────────────────────────────────────────────────────────────
   Borrador     → Etapa 1 | Tabs: Presupuesto, Datos, Cotizaciones, Supervisión
   Contratado   → + Etapa 3 (RP) | + Tab Documentos
   En ejecución → + Etapa 4 (Actas) | + Tab Pagos
   Terminado    → + Etapa 5 (Liquidación)
   Liquidado    → Todo visible
*/
function _actualizarEtapasEstado(){
  const estado = ($('mc-estado')||{}).value || 'En ejecucion';
  const nivel = estado === 'Borrador' ? 0
              : estado === 'Contratado' ? 1
              : estado === 'En ejecucion' ? 2
              : 3; // Terminado o Liquidado

  // Etapas dentro de Datos Básicos
  const e3 = $('mc-etapa3');
  const e4 = $('mc-etapa4');
  const e5 = $('mc-etapa5');
  if(e3) e3.style.display = nivel >= 1 ? '' : 'none';
  if(e4) e4.style.display = nivel >= 2 ? '' : 'none';
  if(e5) e5.style.display = nivel >= 3 ? '' : 'none';

  // Tabs: Pagos (desde En ejecución), Documentos (desde Contratado)
  const tabPagos = $('mc-tab-li-pagos');
  const tabDocs  = $('mc-tab-li-docs');
  if(tabPagos) tabPagos.style.display = nivel >= 2 ? '' : 'none';
  if(tabDocs)  tabDocs.style.display  = nivel >= 1 ? '' : 'none';

  // Si el tab activo quedó oculto, volver al primero (Presupuesto)
  if((nivel < 2 && document.querySelector('#mc-tab-pagos.active')) ||
     (nivel < 1 && document.querySelector('#mc-tab-docs.active'))){
    const tabPresup = document.querySelector('a[href="#mc-tab-presup"]');
    if(tabPresup) new bootstrap.Tab(tabPresup).show();
  }
}

/* Calcular días restantes del contrato y devolver badge HTML */
function _fixAnio(fecha){
  if(!fecha) return fecha;
  const p = String(fecha).split('-');
  if(p.length === 3 && Number(p[0]) > 0 && Number(p[0]) < 100){
    p[0] = String(Number(p[0]) + 2000);
    return p.join('-');
  }
  return fecha;
}

function _calcDiasRestantes(fechaFin){
  if(!fechaFin) return '';
  fechaFin = _fixAnio(fechaFin);
  const partes = String(fechaFin).split('-');
  if(partes.length !== 3) return '';
  const anio = Number(partes[0]), mesF = Number(partes[1]) - 1, dia = Number(partes[2]);
  if(!anio || anio < 2000) return '';
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fin = new Date(anio, mesF, dia);
  const diff = Math.round((fin - hoy) / 86400000);

  let color, icon, texto;
  if(diff < 0){
    color = '#6c757d'; icon = 'bi-calendar-x'; texto = 'Vencido hace ' + Math.abs(diff) + ' días';
  } else if(diff === 0){
    color = '#dc3545'; icon = 'bi-alarm'; texto = '¡Vence hoy!';
  } else if(diff <= 7){
    color = '#dc3545'; icon = 'bi-exclamation-triangle-fill'; texto = diff + ' días restantes';
  } else if(diff <= 30){
    color = '#e65100'; icon = 'bi-clock-history'; texto = diff + ' días restantes';
  } else {
    color = '#198754'; icon = 'bi-calendar-check'; texto = diff + ' días restantes';
  }

  return ` <span class="badge ms-2" style="background:${color};font-size:10px;font-weight:500;vertical-align:middle">
    <i class="bi ${icon} me-1"></i>${texto}</span>`;
}

function abrirModalContrato(id=null){
  const d = DB.load();

  // Poblar rubros presupuestales
  $('mc-pp-rubro').innerHTML = '<option value="">— Sin asignar —</option>' + optsEg(d,1);
  $('mc-pp-vigencia').value = d.config.vigencia || '';

  // Poblar fuentes desde rubros de ingreso (disponible = presupuesto definitivo anual)
  const _fuenteOpts = (d.rubros_ing||[]).filter(r=>!r.esGrupo).map(r=>{
    // Presupuesto definitivo = inicial + todas las modificaciones del año
    let presupDef = Number(r.ini) || 0;
    for(let t=1;t<=4;t++){
      const m = typeof getModsIng==='function' ? getModsIng(d,r.cod,t) : {adi:0,red:0,cre:0,cco:0};
      presupDef += m.adi - m.red + m.cre - m.cco;
    }
    return `<option value="${r.cod}">${r.cod} — ${r.con} [Disp: ${fmt(presupDef)}]</option>`;
  }).join('');
  $('mc-pp-fuente').innerHTML = '<option value="">— Seleccionar Fuente —</option>' + _fuenteOpts;

  // Limpiar items UNSPSC
  $('mc-items-tabla').innerHTML = '';
  $('mc-unspsc-results').classList.add('d-none');
  $('mc-unspsc-search').value = '';

  if(id){
    const c = (d.contratos_full||[]).find(x=>x.id===id);
    if(!c) return;
    // Título + días restantes
    const _diasRest = _calcDiasRestantes(c.fecha_fin);
    $('tit-mcon').innerHTML = '<i class="bi bi-file-earmark-text me-1"></i>Contrato N° ' +
      (c.numero||'(Borrador)') + _diasRest;
    $('mc-id').value = id;
    // Datos básicos
    $('mc-numero').value = (c.numero||'').replace(/^\(Borrador\)/,''); $('mc-tipo').value = c.tipo||'';
    if($('mc-ref-anterior')) $('mc-ref-anterior').value = c.ref_contrato_anterior||'';
    $('mc-modalidad').value = c.modalidad||''; $('mc-estado').value = c.estado||'En ejecucion';
    $('mc-objeto').value = (c.objeto||'').replace(/^\(Pendiente\)/,''); $('mc-obligaciones').value = c.obligaciones||'';
    $('mc-valor').value = c.valor||''; $('mc-fecha-inicio').value = c.fecha_inicio||'';
    $('mc-fecha-fin').value = c.fecha_fin||''; $('mc-plazo').value = c.plazo||'';
    if($('mc-plazo-unidad')) $('mc-plazo-unidad').value = c.plazo_unidad||'dias';
    // Fechas proceso
    $('mc-fecha-estudio').value = c.fecha_estudio_previo||'';
    $('mc-fecha-ofertas').value = c.fecha_presentacion_oferta||'';
    $('mc-fecha-evaluacion').value = c.fecha_evaluacion||'';
    $('mc-forma-pago').value = c.forma_pago||'';
    $('mc-fecha-plan-compras').value = c.fecha_aprobacion_plan_compras || d.config.fecha_paa || '';
    $('mc-fecha-mod-plan').value = c.fecha_modificacion_plan_compras || d.config.fecha_mod_paa || '';
    $('mc-fecha-creacion').value = c.fecha_creacion||'';
    // Fechas auto (ocultas)
    $('mc-fecha-carta-propuesta').value = c.fecha_carta_propuesta||'';
    $('mc-fecha-aceptacion').value = c.fecha_aceptacion||'';
    $('mc-fecha-acta-recibido').value = c.fecha_acta_recibido||'';
    // Contratista
    $('mc-ct-nombre').value = c.contratista_nombre||'';
    $('mc-ct-tipodoc').value = c.contratista_tipodoc||'CC';
    $('mc-ct-numdoc').value = c.contratista_numdoc||'';
    $('mc-ct-municipio').value = c.contratista_municipio||'';
    $('mc-ct-direccion').value = c.contratista_direccion||'';
    $('mc-ct-telefono').value = c.contratista_telefono||'';
    $('mc-ct-email').value = c.contratista_email||'';
    $('mc-ct-banco').value = c.contratista_banco||'';
    $('mc-ct-tipocuenta').value = c.contratista_tipocuenta||'Ahorros';
    $('mc-ct-numcuenta').value = c.contratista_numcuenta||'';
    if($('mc-ct-replegal')) $('mc-ct-replegal').value = c.contratista_replegal||'';
    if($('mc-ct-replegal-cc')) $('mc-ct-replegal-cc').value = c.contratista_replegal_cc||'';
    // Mostrar panel resumen del contratista
    _mostrarPanelContratista();
    // Presupuesto
    $('mc-pp-rubro').value = c.rubro||''; $('mc-pp-fuente').value = c.fuente||'';
    $('mc-pp-cdp').value = c.cdp||''; $('mc-pp-fecha-cdp').value = c.fecha_cdp||'';
    $('mc-pp-valor-cdp').value = c.valor_cdp||'';
    $('mc-pp-rp').value = c.rp||''; $('mc-pp-fecha-rp').value = c.fecha_rp||'';
    $('mc-pp-valor-rp').value = c.valor_rp||'';
    $('mc-pp-saldo-cdp').value = c.saldo_cdp||''; $('mc-pp-saldo-rp').value = c.saldo_rp||'';
    $('mc-pp-saldo-contrato').value = c.saldo_contrato||'';
    // Cuenta contable y nombre: si el contrato no las tiene, buscar del rubro
    const _rubroObj = c.rubro ? (d.rubros||[]).find(r => r.cod === c.rubro) : null;
    $('mc-pp-cuenta-contable').value = c.cuenta_contable || (_rubroObj ? _rubroObj.cuenta_contable : '') || '';
    if($('mc-pp-nombre-cuenta')) $('mc-pp-nombre-cuenta').value = c.nombre_cuenta || (_rubroObj ? _rubroObj.nombre_cuenta : '') || '';
    $('mc-pp-saldo-compromiso').value = c.saldo_compromiso||'';
    $('mc-pp-rubro-nombre').value = c.rubro_nombre||'';
    // ═══ Recalcular saldo presupuestal en tiempo real ═══
    if(c.rubro){
      const pDef = typeof getPresupDef === 'function' ? getPresupDef(d, c.rubro) : 0;
      const cdpOtros = (d.contratos_full||[])
        .filter(x => x.rubro === c.rubro && x.id !== id)
        .reduce((s,x) => s + (Number(x.valor_cdp)||0), 0);
      const saldoDisp = pDef - cdpOtros;
      $('mc-pp-saldo-ppto').value = saldoDisp;
      _mostrarInfoSaldoRubro(c.rubro, pDef, cdpOtros, saldoDisp);
    } else {
      $('mc-pp-saldo-ppto').value = c.saldo_ppto||'';
    }
    // Bancos institución
    $('mc-pp-banco1').value = c.banco_inst_1||'';
    $('mc-pp-cta1').value = c.cta_inst_1||'';
    $('mc-pp-banco2').value = c.banco_inst_2||'';
    $('mc-pp-cta2').value = c.cta_inst_2||'';
    $('mc-pp-banco3').value = c.banco_inst_3||'';
    $('mc-pp-cta3').value = c.cta_inst_3||'';
    $('mc-pp-banco-sel').value = c.banco_inst_sel||'1';
    // Cotizaciones (con campos extendidos)
    (c.cotizaciones||[]).forEach((cot, i) => {
      if(i >= 3) return;
      if($(`mc-cot${i}-nombre`))    $(`mc-cot${i}-nombre`).value = cot.nombre||'';
      if($(`mc-cot${i}-nit`))       $(`mc-cot${i}-nit`).value = cot.nit||cot.cc||'';
      if($(`mc-cot${i}-valor`))     $(`mc-cot${i}-valor`).value = cot.valor||'';
      if($(`mc-cot${i}-sel`))       $(`mc-cot${i}-sel`).value = cot.seleccionada ? '1' : '';
      if($(`mc-cot${i}-doc`))       $(`mc-cot${i}-doc`).value = cot.documentacion||'';
      if($(`mc-cot${i}-fecha`))     $(`mc-cot${i}-fecha`).value = cot.fecha||'';
      if($(`mc-cot${i}-hora`)){
        // Compatibilidad: si tiene hora legacy "9:00" + ampm "AM", combinar
        let horaVal = cot.hora || '';
        if(horaVal && cot.ampm && !horaVal.includes('AM') && !horaVal.includes('PM') && !horaVal.includes('M')){
          horaVal = horaVal + ' ' + cot.ampm;
        }
        $(`mc-cot${i}-hora`).value = horaVal;
      }
      if($(`mc-cot${i}-municipio`)) $(`mc-cot${i}-municipio`).value = cot.municipio||'';
      if($(`mc-cot${i}-replegal`))  $(`mc-cot${i}-replegal`).value = cot.rep_legal||'';
      if($(`mc-cot${i}-email`))     $(`mc-cot${i}-email`).value = cot.email||'';
    });
    // Validar cotizaciones y datos básicos cargados
    _validarCotizaciones();
    _validarDatosBasicos();
    // (No llamar _autoCompletarContratista aquí: los datos del contratista
    //  ya fueron cargados desde el contrato guardado y el panel ya se mostró)
    // Items UNSPSC
    (c.items||[]).forEach(item => _agregarItemRow(item));
    // Pagos / Información Contable
    $('mc-pg-iva').value = c.iva||0;
    if(c.retencion_id) $('mc-pg-tipo-ret').value = c.retencion_id;
    if($('mc-pg-reteica')) $('mc-pg-reteica').value = c.reteica||0;
    if($('mc-pg-valor-pagado')) $('mc-pg-valor-pagado').value = c.valor_pagado||'';
    $('mc-pg-egreso').value = c.num_egreso||'';
    $('mc-pg-factura').value = c.num_factura||'';
    $('mc-pg-fecha').value = c.fecha_pago||'';
    $('mc-pg-egreso-modo').value = c.egreso_modo||'auto';
    $('mc-pg-fecha-egreso').value = c.fecha_egreso||'';
    // Aplicar estilo según modo
    if(c.egreso_modo === 'manual'){
      $('mc-pg-fecha-egreso').readOnly = false;
      $('mc-pg-fecha-egreso').style.background = '';
    } else {
      $('mc-pg-fecha-egreso').readOnly = true;
      $('mc-pg-fecha-egreso').style.background = '#f0f7f0';
    }
    // Cargar pagos parciales (migración lazy si es pago único legacy)
    _migratePagos(c);
    _pagosTemp = (c.pagos || []).map(p => ({...p}));
    _pagoEditIdx = -1;
    _renderPagosTabla();
    // Recalcular campos auto (base, retención, neto, asiento, saldos)
    calcRetencionContrato();
    calcSaldosContrato();
    // Supervisión — si está vacío, usar datos del Rector
    $('mc-sv-nombre').value = c.supervisor_nombre || d.config.rector || '';
    $('mc-sv-tipodoc').value = c.supervisor_tipodoc || 'CC';
    $('mc-sv-numdoc').value = c.supervisor_numdoc || d.config.idRector || '';
    $('mc-sv-cargo').value = c.cargo_supervisor || 'Rector(a)';
    $('mc-sv-fecha-inicio').value = c.fecha_acta_inicio||'';
    $('mc-sv-fecha-final').value = c.fecha_acta_final||'';
    $('mc-sv-fecha-liquidacion').value = c.fecha_liquidacion||'';
    $('mc-sv-observaciones').value = c.observaciones||'';
    // ═══ Recalcular Fecha Fin con días calendario ═══
    // Corrige contratos guardados con el cálculo anterior (días hábiles)
    if($('mc-fecha-inicio').value && Number($('mc-plazo').value) > 0){
      _autoFechasContrato();
    }
  } else {
    $('tit-mcon').innerHTML = '<i class="bi bi-file-earmark-text me-1"></i>Nuevo Contrato';
    $('mc-id').value = '';
    // Limpiar todos los campos
    ['mc-numero','mc-objeto','mc-obligaciones','mc-valor','mc-fecha-inicio','mc-fecha-fin','mc-plazo',
     'mc-fecha-estudio','mc-fecha-ofertas','mc-fecha-evaluacion',
     'mc-fecha-plan-compras','mc-fecha-mod-plan','mc-fecha-creacion',
     'mc-fecha-carta-propuesta','mc-fecha-aceptacion','mc-fecha-acta-recibido',
     'mc-ct-nombre','mc-ct-numdoc','mc-ct-municipio','mc-ct-direccion','mc-ct-telefono','mc-ct-email','mc-ct-banco','mc-ct-numcuenta',
     'mc-ct-replegal','mc-ct-replegal-cc',
     'mc-pp-cdp','mc-pp-fecha-cdp','mc-pp-valor-cdp','mc-pp-rp','mc-pp-fecha-rp','mc-pp-valor-rp',
     'mc-pp-saldo-cdp','mc-pp-saldo-rp','mc-pp-saldo-contrato',
     'mc-pp-cuenta-contable','mc-pp-saldo-ppto','mc-pp-saldo-compromiso','mc-pp-rubro-nombre',
     'mc-pp-banco1','mc-pp-cta1','mc-pp-banco2','mc-pp-cta2','mc-pp-banco3','mc-pp-cta3',
     'mc-pg-iva','mc-pg-reteica','mc-pg-valor-pagado','mc-pg-egreso','mc-pg-factura','mc-pg-fecha',
     'mc-pg-fecha-egreso',
     'mc-sv-nombre','mc-sv-numdoc','mc-sv-cargo','mc-sv-fecha-inicio','mc-sv-fecha-final','mc-sv-fecha-liquidacion','mc-sv-observaciones'
    ].forEach(id => { if($(id)) $(id).value = ''; });
    $('mc-tipo').value = '';
    $('mc-modalidad').value = 'Contratación Directa';
    $('mc-estado').value = 'Borrador';
    $('mc-forma-pago').value = 'Pago único';
    if($('mc-plazo-unidad')) $('mc-plazo-unidad').value = 'dias';
    $('mc-ct-tipodoc').value = 'CC'; $('mc-ct-tipocuenta').value = 'Ahorros';
    $('mc-pp-rubro').value = ''; $('mc-pp-fuente').value = ''; $('mc-pp-banco-sel').value = '1';
    $('mc-pg-tipo-ret').value = ''; $('mc-pg-pct-ret').value = '';
    $('mc-pg-base').value = ''; $('mc-pg-retencion').value = ''; $('mc-pg-neto').value = '';
    $('mc-pg-egreso-modo').value = 'auto';
    $('mc-pg-fecha-egreso').readOnly = true;
    $('mc-pg-fecha-egreso').style.background = '#f0f7f0';
    // Auto-consecutivo de N° Contrato — se genera al abrir modal nuevo
    const _d_tmp = DB.load();
    const _vig = _d_tmp.config?.vigencia || new Date().getFullYear();
    const _ctoNums = (_d_tmp.contratos_full||[]).map(c => {
      const m = String(c.numero||'').match(/(\d+)/); return m ? Number(m[1]) : 0;
    }).filter(n=>n>0);
    const _sigCtoNum = _ctoNums.length ? Math.max(..._ctoNums) + 1 : 1;
    $('mc-numero').value = 'CTO' + _vig + String(_sigCtoNum).padStart(3,'0');
    // Disparar auto-RP ahora que mc-numero tiene valor
    setTimeout(() => _autoRP(), 50);
    // Auto-consecutivo de N° CDP (formato CDP001, CDP002...) — se genera al abrir modal
    const _cdpNums = (_d_tmp.contratos_full||[]).map(c => {
      const m = String(c.cdp||'').match(/(\d+)/); return m ? Number(m[1]) : 0;
    }).filter(n=>n>0);
    const _sigCDPNum = _cdpNums.length ? Math.max(..._cdpNums) + 1 : 1;
    $('mc-pp-cdp').value = 'CDP' + String(_sigCDPNum).padStart(3,'0');
    // N° RP se genera cuando se digita el N° Contrato (ver _autoRP)
    $('mc-pp-rp').value = '';
    // Pre-cargar bancos desde configuración institucional
    const _cfg = _d_tmp.config || {};
    if(_cfg.banco_1){ $('mc-pp-banco1').value = _cfg.banco_1; $('mc-pp-cta1').value = _cfg.cuenta_1||''; }
    if(_cfg.banco_2){ $('mc-pp-banco2').value = _cfg.banco_2; $('mc-pp-cta2').value = _cfg.cuenta_2||''; }
    if(_cfg.banco_3){ $('mc-pp-banco3').value = _cfg.banco_3; $('mc-pp-cta3').value = _cfg.cuenta_3||''; }
    ['ac-cod1','ac-nom1','ac-deb1','ac-cod2','ac-nom2','ac-cred2','ac-cred3'].forEach(id => { if($(id)) $(id).textContent = ''; });
    if($('mc-pp-comp-disp')) $('mc-pp-comp-disp').textContent = '–';
    if($('mc-pp-nuevo-saldo')) $('mc-pp-nuevo-saldo').textContent = '–';
    if($('mc-pp-info-saldo')) $('mc-pp-info-saldo').innerHTML = '';
    if($('mc-alerta-saldo')){ $('mc-alerta-saldo').innerHTML = ''; $('mc-alerta-saldo').style.display = 'none'; }
    $('mc-sv-tipodoc').value = 'CC';
    // Pre-llenar supervisor con datos del Rector
    $('mc-sv-nombre').value = d.config.rector || '';
    $('mc-sv-numdoc').value = d.config.idRector || '';
    $('mc-sv-cargo').value = 'Rector(a)';
    [0,1,2].forEach(i => {
      $(`mc-cot${i}-nombre`).value=''; $(`mc-cot${i}-nit`).value='';
      $(`mc-cot${i}-valor`).value=''; $(`mc-cot${i}-sel`).value='';
      $(`mc-cot${i}-doc`).value=''; $(`mc-cot${i}-fecha`).value='';
      $(`mc-cot${i}-hora`).value='';
      $(`mc-cot${i}-municipio`).value=''; $(`mc-cot${i}-replegal`).value='';
      $(`mc-cot${i}-email`).value='';
    });
    // Reset alertas y rep legal
    if($('alerta-cot')) $('alerta-cot').style.display = 'none';
    if($('aviso-cotizacion')) $('aviso-cotizacion').style.display = 'none';
    if($('aviso-contratista')) $('aviso-contratista').style.display = 'none';
    if($('mc-rep-legal-section')) $('mc-rep-legal-section').classList.add('d-none');
    if($('mc-panel-contratista')){ $('mc-panel-contratista').innerHTML = ''; $('mc-panel-contratista').style.display = 'none'; }
    // Resetear pagos parciales
    _pagosTemp = [];
    _pagoEditIdx = -1;
    _renderPagosTabla();
  }

  // Auto-fill rubro nombre, cuenta contable y saldo presupuestal cuando cambia
  $('mc-pp-rubro').onchange = function(){
    const sel = this.options[this.selectedIndex];
    $('mc-pp-rubro-nombre').value = sel ? sel.textContent : '';
    const cod = this.value;

    // ═══ SIEMPRE limpiar saldo y panel primero ═══
    $('mc-pp-saldo-ppto').value = '';
    $('mc-pp-cuenta-contable').value = '';
    if($('mc-pp-nombre-cuenta')) $('mc-pp-nombre-cuenta').value = '';
    if($('mc-pp-info-saldo')) $('mc-pp-info-saldo').innerHTML = '';

    if(cod){
      const d2 = DB.load();
      const rubro = d2.rubros.find(r => r.cod === cod);
      // Auto-llenar cuenta contable y nombre cuenta desde el rubro
      if(rubro && rubro.cuenta_contable) $('mc-pp-cuenta-contable').value = rubro.cuenta_contable;
      if(rubro && rubro.nombre_cuenta && $('mc-pp-nombre-cuenta')) $('mc-pp-nombre-cuenta').value = rubro.nombre_cuenta;
      // ═══ Auto-calcular Saldo Presupuestal ═══
      const pDef = typeof getPresupDef === 'function' ? getPresupDef(d2, cod) : 0;
      const contratoActualId = $('mc-id').value || '';
      const cdpOtros = (d2.contratos_full||[])
        .filter(c => c.rubro === cod && c.id !== contratoActualId)
        .reduce((s,c) => s + (Number(c.valor_cdp)||0), 0);
      const saldoDisp = pDef - cdpOtros;
      // Forzar actualización del campo (limpiar y re-asignar)
      $('mc-pp-saldo-ppto').value = '';
      $('mc-pp-saldo-ppto').value = String(saldoDisp);
      // Mostrar detalle informativo
      _mostrarInfoSaldoRubro(cod, pDef, cdpOtros, saldoDisp);

      // ═══ ALERTA: Rubro sin saldo disponible — BLOQUEAR y mostrar rubros con saldo ═══
      if(saldoDisp <= 0){
        const rubroNombre = sel ? sel.textContent : cod;
        const alertaDiv = $('mc-alerta-saldo');
        if(alertaDiv){
          // Buscar rubros que SÍ tienen saldo disponible
          let htmlRubrosDisp = '';
          const contratoId = $('mc-id').value || '';
          d2.rubros.forEach(r => {
            const pDefR = typeof getPresupDef === 'function' ? getPresupDef(d2, r.cod) : 0;
            if(pDefR <= 0) return;
            const cdpR = (d2.contratos_full||[])
              .filter(c => c.rubro === r.cod && c.id !== contratoId)
              .reduce((s,c) => s + (Number(c.valor_cdp)||0), 0);
            const saldoR = pDefR - cdpR;
            if(saldoR > 0){
              htmlRubrosDisp += '<tr style="cursor:pointer" onclick="$(\'mc-pp-rubro\').value=\'' + r.cod + '\';$(\'mc-pp-rubro\').dispatchEvent(new Event(\'change\'))">' +
                '<td class="ps-2"><i class="bi bi-arrow-right-circle text-success me-1"></i><strong>' + r.cod + '</strong></td>' +
                '<td>' + (r.nombre||r.cod) + '</td>' +
                '<td class="text-end pe-2 fw-bold" style="color:#198754">$ ' + saldoR.toLocaleString('es-CO') + '</td></tr>';
            }
          });

          alertaDiv.style.display = 'block';
          alertaDiv.className = 'alert alert-danger py-2 px-3 mb-2 small';
          alertaDiv.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>' +
            '<strong>⛔ ¡SIN SALDO DISPONIBLE!</strong><br>' +
            'El rubro <strong>' + rubroNombre + '</strong> tiene saldo de <strong style="color:#dc3545">$ ' + saldoDisp.toLocaleString('es-CO') + '</strong>.<br>' +
            '<i class="bi bi-arrow-right-circle me-1"></i>Debe realizar un <strong>traslado presupuestal</strong> antes de crear un contrato con este rubro.' +
            (htmlRubrosDisp ?
              '<hr class="my-2">' +
              '<div class="fw-bold mb-1" style="color:#198754"><i class="bi bi-check-circle me-1"></i>Rubros con saldo disponible (clic para seleccionar):</div>' +
              '<table class="table table-sm table-bordered mb-0" style="font-size:10px;background:#fff;border-radius:5px;overflow:hidden">' +
              '<thead><tr style="background:#d5f5e3"><th class="ps-2">Código</th><th>Nombre</th><th class="text-end pe-2">Saldo Disponible</th></tr></thead>' +
              '<tbody>' + htmlRubrosDisp + '</tbody></table>'
              : '<hr class="my-2"><div class="text-warning fw-bold"><i class="bi bi-info-circle me-1"></i>No hay rubros con saldo disponible. Debe realizar un traslado presupuestal.</div>'
            );
        }
        if(typeof toast === 'function'){
          toast('⛔ El rubro "' + rubroNombre + '" NO tiene saldo. Debe hacer un traslado presupuestal.', 'danger');
        }
        // BLOQUEAR todos los campos del modal excepto rubro, fuente, vigencia
        _bloquearCamposContrato(true);
        setTimeout(() => { $('mc-pp-rubro').focus(); }, 200);
      } else {
        // Desbloquear campos y limpiar alerta
        const alertaDiv = $('mc-alerta-saldo');
        // Solo mostrar alerta verde de saldo disponible en contratos NUEVOS (sin ID guardado)
        const esNuevo = !$('mc-id').value;
        if(alertaDiv && esNuevo){
          alertaDiv.style.display = 'block';
          alertaDiv.className = 'alert alert-success py-2 px-3 mb-2 small';
          alertaDiv.innerHTML = '<i class="bi bi-check-circle-fill me-2 text-success"></i>' +
            '<strong>Saldo disponible para comprometer:</strong> ' +
            '<span class="fw-bold" style="font-size:14px;color:#198754">$ ' + saldoDisp.toLocaleString('es-CO') + '</span>' +
            (cdpOtros > 0 ? ' <span class="text-muted">(Comprometido en otros contratos: $ ' + cdpOtros.toLocaleString('es-CO') + ')</span>' : '');
        } else if(alertaDiv){
          alertaDiv.style.display = 'none';
          alertaDiv.innerHTML = '';
        }
        _bloquearCamposContrato(false);
      }
    }
    // Recalcular asiento contable y saldos
    calcRetencionContrato();
    calcSaldosContrato();
  };

  // Resaltar banco seleccionado
  _resaltarBancoSel();

  // Actualizar info banco al escribir
  ['mc-pp-banco1','mc-pp-cta1','mc-pp-banco2','mc-pp-cta2','mc-pp-banco3','mc-pp-cta3'].forEach(id => {
    if($(id)) $(id).oninput = _resaltarBancoSel;
  });

  // Poblar panel de documentos (planillas)
  const docsPanel = $('mc-docs-panel');
  if(docsPanel){
    if(id){
      docsPanel.innerHTML = renderDocPanel(id);
    } else {
      docsPanel.innerHTML = '<p class="text-muted text-center py-4"><i class="bi bi-info-circle me-1"></i>Guarde el contrato primero para poder generar los documentos del expediente.</p>';
    }
  }

  // ═══ Auditoría de consecutivos ═══
  _auditExcluirId = id || '';
  _mostrarHintsIniciales([
    ['mc-numero',    'hint-numero',  'numero'],
    ['mc-pp-cdp',    'hint-cdp',     'cdp'],
    ['mc-pp-rp',     'hint-rp',      'rp'],
    ['mc-pg-egreso', 'hint-egreso',  'egreso']
  ]);

  // Actualizar visibilidad de etapas según estado
  _actualizarEtapasEstado();

  // Ir a primera tab
  const firstTab = document.querySelector('#mc-tabs .nav-link');
  if(firstTab) new bootstrap.Tab(firstTab).show();
  new bootstrap.Modal($('mContrato')).show();
}

/* ══════════════════════════════════════════════════════════
   PAGOS PARCIALES — Gestión de múltiples pagos por contrato
   ══════════════════════════════════════════════════════════ */

let _pagosTemp = [];
let _pagoEditIdx = -1; // índice del pago en edición (-1 = ninguno)

/** Migración lazy: convierte pago único legacy a pagos[]
 *  Solo migra si hay num_egreso (prueba definitiva de pago en FOSE) */
function _migratePagos(c){
  if(c.pagos && c.pagos.length > 0) return;
  // Solo migrar si hay número de egreso real
  if(c.num_egreso){
    c.pagos = [{
      id: uid(),
      valor: Number(c.valor) || 0,
      fecha_pago: c.fecha_pago || '',
      num_egreso: c.num_egreso || '',
      fecha_egreso: c.fecha_egreso || '',
      num_factura: c.num_factura || '',
      retencion_valor: Number(c.retencion_valor) || 0,
      retencion_concepto: c.retencion_concepto || '',
      neto_pagar: Number(c.neto_pagar) || 0,
      reteica: Number(c.reteica) || 0,
      nota: 'Pago único'
    }];
  } else {
    c.pagos = [];
  }
}

/** Renderiza la tabla de pagos desde _pagosTemp */
function _renderPagosTabla(){
  const tbody = $('mc-pagos-tbody');
  if(!tbody) return;
  const valorContrato = Number($('mc-valor').value) || 0;
  let totalPagado = 0;

  let totalRealPagado = 0;
  tbody.innerHTML = _pagosTemp.map((p, i) => {
    totalPagado += Number(p.valor) || 0;
    const tieneEgreso = !!(p.fecha_pago && p.num_egreso);
    const pagado = tieneEgreso;
    if(pagado) totalRealPagado += Number(p.valor) || 0;
    const tm = _trimDeFecha(p.fecha_pago);
    const esEditando = (i === _pagoEditIdx);
    // Mostrar fecha real o fecha estimada como referencia
    let fechaDisplay = '';
    if(p.fecha_pago && p.num_egreso){
      // Pago efectuado: tiene fecha + egreso
      fechaDisplay = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>' + p.fecha_pago + '</span>';
    } else if(p.fecha_pago){
      // Fecha programada pero sin egreso — pendiente de pago
      fechaDisplay = '<span class="text-primary"><i class="bi bi-calendar-check me-1"></i>' + p.fecha_pago + ' <small class="text-muted">(sin egreso)</small></span>';
    } else if(p.fecha_estimada){
      fechaDisplay = '<span class="text-muted" title="Fecha estimada — pendiente de pago"><i class="bi bi-clock me-1"></i>' + p.fecha_estimada + '</span>';
    } else {
      fechaDisplay = '<span class="text-warning"><i class="bi bi-hourglass-split me-1"></i>Pendiente</span>';
    }
    return `<tr${esEditando ? ' style="background:#fff3cd"' : pagado ? '' : ' style="opacity:0.7"'}>
      <td class="text-center">${i + 1}</td>
      <td>${fechaDisplay}</td>
      <td>${p.num_egreso || '<span class="text-muted">—</span>'}</td>
      <td>${p.num_factura || '—'}</td>
      <td class="text-end">${fmt(p.valor)}</td>
      <td class="text-end">${fmt(p.retencion_valor)}</td>
      <td class="text-end fw-bold">${fmt(p.neto_pagar)}</td>
      <td class="text-center">${tm ? 'T' + tm.trim : '—'}</td>
      <td class="text-center">
        <button class="btn btn-sm ${pagado ? 'btn-outline-secondary' : 'btn-success'} p-0 px-1" onclick="_editarPago(${i})" title="${pagado ? 'Editar' : 'Registrar Pago'}"><i class="bi ${pagado ? 'bi-pencil' : 'bi-cash-coin'}"></i></button>
        <button class="btn btn-sm btn-outline-danger p-0 px-1" onclick="_eliminarPago(${i})" title="Eliminar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');

  if($('mc-pagos-count')) $('mc-pagos-count').textContent = _pagosTemp.length;
  if($('mc-pagos-total')) $('mc-pagos-total').textContent = '$' + fmt(totalPagado);
  if($('mc-pagos-pendiente')) $('mc-pagos-pendiente').textContent = '$' + fmt(Math.max(0, valorContrato - totalPagado));
}

/** Agregar un nuevo pago con el saldo restante */
function _agregarPago(){
  const valorContrato = Number($('mc-valor').value) || 0;
  const totalYaPagado = _pagosTemp.reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const saldoPendiente = valorContrato - totalYaPagado;

  if(saldoPendiente <= 0){
    toast('El contrato ya est\u00e1 totalmente pagado', 'warning');
    return;
  }

  // Leer retenciones del calculador actual
  const retSel = $('mc-pg-tipo-ret');
  const opt = retSel ? retSel.options[retSel.selectedIndex] : null;
  const retConcepto = opt && opt.value ? opt.textContent.split('—')[0].trim() : '';
  const reteica = $('mc-pg-reteica') ? Number($('mc-pg-reteica').value) || 0 : 0;

  // Retención total del contrato (ya calculada en el formulario — formato "300.000" colombiano)
  const retTotalContrato = Number(String($('mc-pg-retencion')?.value||'0').replace(/\./g,'').replace(/[^\d-]/g,'')) || 0;

  // Retención proporcional al valor de este pago respecto al total del contrato
  const proporcion = valorContrato > 0 ? saldoPendiente / valorContrato : 1;
  let retValor = Math.round(retTotalContrato * proporcion);

  // Si es pago único (primer y único pago), usar la retención exacta del calculador
  if(_pagosTemp.length === 0 && saldoPendiente === valorContrato){
    retValor = retTotalContrato;
  }

  // Auto-consecutivo de egreso (excluir el contrato actual para no saltar consecutivos)
  const d = DB.load();
  const _editId = $('mc-id').value || '';
  const _numEgs = [
    ...((d.contratos_full||[]).filter(c => c.id !== _editId).flatMap(c => (c.pagos||[]).map(p=>Number(p.num_egreso)||0))),
    ...((d.contratos_full||[]).filter(c => c.id !== _editId).map(c=>Number(c.num_egreso)||0)),
    ...((d.pagos_dian||[]).map(p=>Number(p.num_egreso)||0)),
    ...((d.contratos||[]).filter(c => c.contrato_full_id !== _editId).map(c=>Number(c.comp)||0)),
    ..._pagosTemp.map(p=>Number(p.num_egreso)||0)
  ].filter(n=>n>0);
  const _sigEg = _numEgs.length ? Math.max(..._numEgs) + 1 : (Number(d.config.vigencia||2026)*1000 + 1);

  _pagosTemp.push({
    id: uid(),
    valor: saldoPendiente,
    fecha_pago: '',
    num_egreso: String(_sigEg),
    fecha_egreso: '',
    num_factura: '',
    retencion_valor: retValor,
    retencion_concepto: retConcepto,
    neto_pagar: saldoPendiente - retValor,
    reteica: reteica,
    nota: 'Pago ' + (_pagosTemp.length + 1)
  });

  _renderPagosTabla();
  _editarPago(_pagosTemp.length - 1);
}

/** Auto-generar pagos según Forma de Pago + Plazo */
function _autoGenerarPagos(){
  const formaPago = $('mc-forma-pago').value;
  const valorContrato = Number($('mc-valor').value) || 0;
  const plazo = Number($('mc-plazo').value) || 0;
  const unidad = ($('mc-plazo-unidad')||{}).value || 'dias';
  const fechaActaInicio = $('mc-sv-fecha-inicio').value;
  const fechaInicio = $('mc-fecha-inicio').value;
  const fechaBase = fechaActaInicio || fechaInicio;

  if(valorContrato <= 0 || plazo <= 0) return;

  // Calcular número de pagos según forma de pago
  let numPagos = 1;
  let mesesPorPago = 1;
  const plazoMeses = unidad === 'meses' ? plazo : Math.max(1, Math.round(plazo / 30));

  switch(formaPago){
    case 'Pago único':
      if(_pagosTemp.length === 0) toast('Pago único — use "Agregar Pago" para registrar el pago', 'info');
      return;
    case 'Pagos mensuales':
      mesesPorPago = 1;
      numPagos = plazoMeses;
      break;
    case 'Pagos bimestrales':
      mesesPorPago = 2;
      numPagos = Math.max(1, Math.ceil(plazoMeses / 2));
      break;
    case 'Pagos trimestrales':
      mesesPorPago = 3;
      numPagos = Math.max(1, Math.ceil(plazoMeses / 3));
      break;
    case 'Pagos semestrales':
      mesesPorPago = 6;
      numPagos = Math.max(1, Math.ceil(plazoMeses / 6));
      break;
    case 'Anticipos y saldo':
      numPagos = 2; break;
    default:
      return; // "Otra" → no auto-generar
  }

  // Si ya hay pagos con datos ingresados, preguntar antes de reemplazar
  const pagosConDatos = _pagosTemp.filter(p => p.fecha_pago || p.num_factura);
  if(pagosConDatos.length > 0){
    if(!confirm('Ya hay ' + _pagosTemp.length + ' pago(s) registrados.\n\n¿Desea reemplazarlos con ' + numPagos + ' pagos (' + formaPago + ')?')) return;
  }

  // Leer retenciones del calculador (valor ya calculado en el formulario)
  const retSel = $('mc-pg-tipo-ret');
  const opt = retSel ? retSel.options[retSel.selectedIndex] : null;
  const retConceptoAuto = opt && opt.value ? opt.textContent.split('—')[0].trim() : '';
  const retTotalContrato = Number(String($('mc-pg-retencion')?.value||'0').replace(/\./g,'').replace(/[^\d-]/g,'')) || 0;
  const reteica = $('mc-pg-reteica') ? Number($('mc-pg-reteica').value) || 0 : 0;

  // Calcular valor por pago
  const valorPorPago = Math.floor(valorContrato / numPagos);
  const valorUltimo = valorContrato - (valorPorPago * (numPagos - 1)); // ajuste centavos

  // Calcular fechas estimadas (referencia, no son las fechas reales de pago)
  _pagosTemp = [];
  for(let i = 0; i < numPagos; i++){
    const val = (i === numPagos - 1) ? valorUltimo : valorPorPago;
    // Retención proporcional al valor de cada pago
    const prop = valorContrato > 0 ? val / valorContrato : 1;
    let retValor = Math.round(retTotalContrato * prop);

    // Fecha estimada de cuándo tocaría pagar (solo referencia)
    let fechaEstimada = '';
    if(fechaBase && numPagos > 1){
      const fp = new Date(fechaBase + 'T12:00:00');
      if(formaPago === 'Anticipos y saldo'){
        if(i > 0){
          const fechaFin = $('mc-fecha-fin').value;
          if(fechaFin) fp.setTime(new Date(fechaFin + 'T12:00:00').getTime());
        }
      } else {
        fp.setMonth(fp.getMonth() + (mesesPorPago * i));
      }
      fechaEstimada = fp.toISOString().split('T')[0];
    }

    let nota = '';
    if(formaPago === 'Anticipos y saldo'){
      nota = i === 0 ? 'Anticipo (50%)' : 'Saldo final (50%)';
    } else {
      nota = 'Pago ' + (i + 1) + ' de ' + numPagos;
    }

    _pagosTemp.push({
      id: uid(),
      valor: val,
      fecha_pago: '',              // vacío — se llena cuando se paga realmente
      fecha_estimada: fechaEstimada, // referencia para el usuario
      num_egreso: '',              // vacío — se auto-genera al registrar el pago
      fecha_egreso: '',
      num_factura: '',
      retencion_valor: retValor,
      retencion_concepto: retConceptoAuto,
      neto_pagar: val - retValor,
      reteica: reteica,
      nota: nota
    });
  }

  _pagoEditIdx = -1;
  const panel = $('mc-pago-edit-panel');
  if(panel) panel.style.display = 'none';
  _renderPagosTabla();

  if(numPagos > 1){
    toast(numPagos + ' pagos generados (' + formaPago + ')', 'success');
  }
}

/** Cargar un pago en los campos de edición inline */
var _pagoEditBackup = null; // Respaldo del pago antes de editar (para revertir al cancelar)

function _editarPago(idx){
  if(idx < 0 || idx >= _pagosTemp.length) return;
  _pagoEditIdx = idx;
  const p = _pagosTemp[idx];

  // Respaldar estado original del pago (para revertir si cancela)
  _pagoEditBackup = {...p};

  // Si no tiene egreso, auto-generar al momento de registrar el pago
  if(!p.num_egreso){
    const d = DB.load();
    const _editId = $('mc-id').value || '';
    const _otros = (d.contratos_full||[]).filter(c => c.id !== _editId);
    const _numEgs = [
      ..._otros.flatMap(c => (c.pagos||[]).map(pp=>Number(pp.num_egreso)||0)),
      ..._otros.map(c=>Number(c.num_egreso)||0),
      ...((d.pagos_dian||[]).map(pp=>Number(pp.num_egreso)||0)),
      ...((d.contratos||[]).filter(c => c.contrato_full_id !== _editId).map(c=>Number(c.comp)||0)),
      ..._pagosTemp.map(pp=>Number(pp.num_egreso)||0)
    ].filter(n=>n>0);
    const _sigEg = _numEgs.length ? Math.max(..._numEgs) + 1 : (Number(d.config.vigencia||2026)*1000 + 1);
    p.num_egreso = String(_sigEg);
  }

  // Si no tiene fecha, pre-llenar con fecha estimada o fecha actual
  const fechaPreLlenar = p.fecha_pago || p.fecha_estimada || new Date().toISOString().split('T')[0];

  // Si el pago no tiene retención pero el calculador sí, cargarla proporcionalmente
  if(!p.retencion_valor || p.retencion_valor === 0){
    const retTotalCalc = Number(String($('mc-pg-retencion')?.value||'0').replace(/\./g,'').replace(/[^\d-]/g,'')) || 0;
    if(retTotalCalc > 0){
      const valorContrato = Number($('mc-valor').value) || 0;
      const proporcion = valorContrato > 0 ? (Number(p.valor)||0) / valorContrato : 1;
      p.retencion_valor = Math.round(retTotalCalc * proporcion);
      p.neto_pagar = (Number(p.valor)||0) - p.retencion_valor;
      const retSel = $('mc-pg-tipo-ret');
      const optRet = retSel ? retSel.options[retSel.selectedIndex] : null;
      if(optRet && optRet.value && !p.retencion_concepto){
        p.retencion_concepto = optRet.textContent.split('—')[0].trim();
      }
    }
  }

  // Mostrar formulario inline de edición
  const panel = $('mc-pago-edit-panel');
  if(panel) panel.style.display = '';
  if($('mc-pe-idx')) $('mc-pe-idx').textContent = (idx + 1);
  if($('mc-pe-valor')) $('mc-pe-valor').value = p.valor || '';
  if($('mc-pe-fecha')) $('mc-pe-fecha').value = p.fecha_pago || fechaPreLlenar;
  if($('mc-pe-egreso')) $('mc-pe-egreso').value = p.num_egreso || '';
  if($('mc-pe-factura')) $('mc-pe-factura').value = p.num_factura || '';
  if($('mc-pe-retencion')) $('mc-pe-retencion').value = p.retencion_valor || 0;
  if($('mc-pe-neto')) $('mc-pe-neto').value = p.neto_pagar || '';
  if($('mc-pe-nota')) $('mc-pe-nota').value = p.nota || '';

  _renderPagosTabla();
}

/** Guardar cambios del pago en edición */
function _guardarPagoEditado(){
  if(_pagoEditIdx < 0 || _pagoEditIdx >= _pagosTemp.length) return;
  const p = _pagosTemp[_pagoEditIdx];

  const fechaPago = $('mc-pe-fecha').value || '';
  // Validar que la fecha del pago sea posterior al Acta de Inicio
  const actaInicio = $('mc-sv-fecha-inicio').value || $('mc-fecha-inicio').value || '';
  if(fechaPago && actaInicio && fechaPago < actaInicio){
    toast('La fecha del pago no puede ser anterior al Acta de Inicio (' + actaInicio + ')', 'error');
    return;
  }

  const nuevoValor = Number($('mc-pe-valor').value) || 0;
  if(nuevoValor <= 0){
    toast('El valor del pago debe ser mayor a $0', 'error');
    return;
  }
  // Validar que la suma de todos los pagos no exceda el valor del contrato
  const valorContrato = Number($('mc-valor').value) || 0;
  const sumaOtros = _pagosTemp.reduce((s, pp, i) => s + (i === _pagoEditIdx ? 0 : (Number(pp.valor) || 0)), 0);
  if(sumaOtros + nuevoValor > valorContrato){
    toast('La suma de pagos ($' + (sumaOtros + nuevoValor).toLocaleString() + ') excede el valor del contrato ($' + valorContrato.toLocaleString() + ')', 'error');
    return;
  }

  p.valor = nuevoValor;
  p.fecha_pago = fechaPago;
  p.num_egreso = $('mc-pe-egreso').value.trim();
  p.num_factura = $('mc-pe-factura').value.trim();
  p.retencion_valor = Number($('mc-pe-retencion').value) || 0;
  p.neto_pagar = p.valor - p.retencion_valor;
  p.nota = $('mc-pe-nota') ? $('mc-pe-nota').value.trim() : '';

  if($('mc-pe-neto')) $('mc-pe-neto').value = p.neto_pagar;

  _pagoEditIdx = -1;
  _pagoEditBackup = null; // Guardado exitoso — no se necesita revertir
  const panel = $('mc-pago-edit-panel');
  if(panel) panel.style.display = 'none';
  _renderPagosTabla();

  // Verificar si todos los pagos tienen egreso generado → auto-cambiar a Liquidado
  // Requiere fecha_pago + num_egreso + fecha_egreso (egreso realmente expedido, no solo pre-asignado)
  const todosPagados = _pagosTemp.length > 0 && _pagosTemp.every(pp => pp.fecha_pago && pp.num_egreso && pp.fecha_egreso);
  if(todosPagados && $('mc-estado').value === 'En ejecucion'){
    $('mc-estado').value = 'Liquidado';
    toast('Todos los pagos con egreso generado — Estado cambiado a Liquidado', 'success');
  } else {
    toast('Pago actualizado');
  }
}

/** Limpiar pago — quitar fecha y egreso para que vuelva a "pendiente" */
function _limpiarPago(){
  if(_pagoEditIdx < 0 || _pagoEditIdx >= _pagosTemp.length) return;
  if(!confirm('¿Limpiar este pago? Se quitarán la fecha, egreso y factura.\nEl pago volverá a estado pendiente.')) return;
  const p = _pagosTemp[_pagoEditIdx];
  p.fecha_pago = '';
  p.num_egreso = '';
  p.fecha_egreso = '';
  p.num_factura = '';
  p.retencion_valor = 0;
  p.neto_pagar = p.valor;
  p.fecha_estimada = '';
  _pagoEditIdx = -1;
  _pagoEditBackup = null;
  const panel = $('mc-pago-edit-panel');
  if(panel) panel.style.display = 'none';
  _renderPagosTabla();
  // Si estaba Liquidado, volver a En ejecución (ya no todos están pagados)
  if($('mc-estado').value === 'Liquidado'){
    $('mc-estado').value = 'En ejecucion';
    toast('Pago limpiado — Estado cambiado a En ejecución', 'info');
  } else {
    toast('Pago limpiado — vuelve a pendiente', 'info');
  }
}

/** Cancelar edición del pago — revierte cambios hechos por _editarPago */
function _cancelarPagoEdit(){
  // Revertir el pago al estado original (antes de auto-generar egreso, etc.)
  if(_pagoEditIdx >= 0 && _pagoEditIdx < _pagosTemp.length && _pagoEditBackup){
    _pagosTemp[_pagoEditIdx] = {..._pagoEditBackup};
  }
  _pagoEditIdx = -1;
  _pagoEditBackup = null;
  const panel = $('mc-pago-edit-panel');
  if(panel) panel.style.display = 'none';
  _renderPagosTabla();
}

/** Recalcular neto en el formulario de edición de pago */
function _recalcNetoPago(){
  const val = Number($('mc-pe-valor').value) || 0;
  const ret = Number($('mc-pe-retencion').value) || 0;
  if($('mc-pe-neto')) $('mc-pe-neto').value = val - ret;
}

/** Eliminar un pago */
function _eliminarPago(idx){
  if(!confirm('\u00bfEliminar pago #' + (idx + 1) + '?')) return;
  _pagosTemp.splice(idx, 1);
  if(_pagoEditIdx === idx){
    _pagoEditIdx = -1;
    const panel = $('mc-pago-edit-panel');
    if(panel) panel.style.display = 'none';
  } else if(_pagoEditIdx > idx){
    _pagoEditIdx--;
  }
  _renderPagosTabla();
}

/** Validar pagos antes de guardar */
function _validarPagos(pagos, valorContrato){
  // No validar pagos si el estado no permite pagos (Borrador/Contratado)
  const estado = ($('mc-estado')||{}).value || 'Borrador';
  if(estado === 'Borrador' || estado === 'Contratado') return true;

  const totalPagos = pagos.reduce((s, p) => s + (Number(p.valor) || 0), 0);
  if(totalPagos > valorContrato * 1.001){
    toast('La suma de pagos ($' + fmt(totalPagos) + ') excede el valor del contrato ($' + fmt(valorContrato) + ')', 'danger');
    return false;
  }
  for(let i = 0; i < pagos.length; i++){
    const p = pagos[i];
    if(Number(p.valor) <= 0){
      toast('El pago #' + (i + 1) + ' tiene valor $0 o negativo.', 'warning');
      return false;
    }
  }
  return true;
}

/* ══════════════════════════════════════════════════════════
   AUTO-REGISTRO EN EJECUCIÓN TRIMESTRAL DESDE CONTRATO
   • En ejecución → Compromiso (d.compromisos_eg)
   • Liquidado    → Gasto (d.contratos)
   ══════════════════════════════════════════════════════════ */

/** Obtener trimestre desde una fecha YYYY-MM-DD */
function _trimDeFecha(fecha){
  if(!fecha) return null;
  const p = String(fecha).split('-');
  if(p.length !== 3) return null;
  const mes = Number(p[1]);
  for(const [t, meses] of Object.entries(MESES_TRIM)){
    if(meses.includes(mes)) return {trim: Number(t), mes};
  }
  return {trim: 4, mes};
}

/**
 * Sincroniza el contrato con la ejecución trimestral (FOSE Colombia).
 *
 * Orden: LIMPIAR → CDP → PAGOS → COMPROMISO
 * (Pagos antes de compromiso porque en Liquidado el compromiso = totalPagado)
 *
 * | Estado        | CDP      | Compromiso          | Gasto                    |
 * |---------------|----------|---------------------|--------------------------|
 * | Borrador      | SÍ       | SÍ (valorCDP)       | NO                       |
 * | Contratado    | SÍ       | SÍ (valorCDP)       | NO                       |
 * | En ejecución  | SÍ       | SÍ (valorCDP)       | SÍ (fecha+egreso)        |
 * | Terminado     | SÍ       | SÍ (valorCDP)       | SÍ (fecha+egreso)        |
 * | Liquidado     | SÍ       | SÍ (totalPagado)    | SÍ (fecha+egreso)        |
 */
function _syncContratoTrimestral(contrato, d){
  const valor = Number(contrato.valor) || 0;
  const valorCDP = Number(contrato.valor_cdp) || valor;
  const estado = contrato.estado || '';
  const rubro = contrato.rubro || '';

  if(!d.compromisos_eg) d.compromisos_eg = [];
  if(!d.cdps_eg) d.cdps_eg = [];
  if(!d.contratos) d.contratos = [];

  // ═══ PASO 1: LIMPIAR registros anteriores de este contrato ═══
  d.cdps_eg = d.cdps_eg.filter(e => e.contrato_full_id !== contrato.id);
  d.compromisos_eg = d.compromisos_eg.filter(e => e.contrato_full_id !== contrato.id);
  d.contratos = d.contratos.filter(g => g.contrato_full_id !== contrato.id);
  contrato.gasto_trim_id = '';
  contrato.compromiso_trim_id = '';

  // Si no hay rubro ni valor, no hay nada que registrar
  if(!rubro || (valor <= 0 && valorCDP <= 0)) return;

  const pagos = contrato.pagos || [];
  // Un pago cuenta como "pagado" SOLO si tiene fecha_pago + num_egreso + valor > 0
  const pagosReales = pagos.filter(p => p.fecha_pago && p.num_egreso && Number(p.valor) > 0);
  let totalPagado = pagosReales.reduce((s, p) => s + (Number(p.valor) || 0), 0);

  // Helper: registrar UN gasto desde un pago
  function _pushGasto(pago){
    const tm = _trimDeFecha(pago.fecha_pago);
    if(!tm) return;
    d.contratos.push({
      id:             uid(),
      trim:           tm.trim,
      mes:            tm.mes,
      fecha:          pago.fecha_pago,
      comp:           pago.num_egreso || '',
      concepto:       contrato.objeto || '',
      prov:           contrato.contratista_nombre || '',
      tipodoc:        contrato.contratista_tipodoc || 'CC',
      numdoc:         contrato.contratista_numdoc || '',
      fecha_cdp:      contrato.fecha_cdp || '',
      cdp:            contrato.cdp || '',
      fecha_rp:       contrato.fecha_rp || '',
      rp:             contrato.rp || '',
      fecha_contrato: contrato.fecha_inicio || '',
      ncon:           contrato.numero || '',
      cod_rubro:      rubro,
      fuente:         contrato.fuente || '',
      valor:          Number(pago.valor) || 0,
      pub:            false,
      cont:           false,
      origen:              'contrato',
      contrato_full_id:    contrato.id,
      pago_id:             pago.id || '',
      retencion_valor:     Number(pago.retencion_valor) || 0,
      retencion_concepto:  pago.retencion_concepto || '',
      neto_pagar:          Number(pago.neto_pagar) || 0,
      reteica:             Number(pago.reteica) || 0
    });
  }

  // Trimestre de referencia (fecha CDP)
  const fechaCDP = contrato.fecha_cdp || '';
  const tmCDP = fechaCDP ? _trimDeFecha(fechaCDP) : null;

  // ═══ PASO 2: REGISTRAR CDP (DISPONIBILIDAD) ═══
  // Se registra SIEMPRE que haya fecha CDP y valor — cualquier estado
  if(tmCDP && valorCDP > 0){
    d.cdps_eg.push({
      id:               uid(),
      cod:              rubro,
      fuente:           contrato.fuente || '',
      trim:             tmCDP.trim,
      mes:              tmCDP.mes,
      valor:            valorCDP,
      cdp:              contrato.cdp || '',
      origen:           'contrato',
      contrato_full_id: contrato.id
    });
  }

  // ═══ PASO 3: REGISTRAR PAGOS/GASTOS ═══
  // Solo desde "En ejecución" en adelante — requiere fecha_pago + num_egreso
  if(estado === 'En ejecucion' || estado === 'Terminado' || estado === 'Liquidado'){
    if(pagosReales.length > 0){
      pagosReales.forEach(p => _pushGasto(p));
    } else if(estado === 'Liquidado'){
      // Fallback legacy: un solo gasto — requiere num_egreso
      const fechaEgreso = contrato.fecha_egreso;
      if(fechaEgreso && contrato.num_egreso){
        const tmE = _trimDeFecha(fechaEgreso);
        if(tmE){
          const gastoVal = valorCDP || valor;
          const gastoId = uid();
          d.contratos.push({
            id: gastoId, trim: tmE.trim, mes: tmE.mes, fecha: fechaEgreso,
            comp: contrato.num_egreso||'', concepto: contrato.objeto||'',
            prov: contrato.contratista_nombre||'', tipodoc: contrato.contratista_tipodoc||'CC',
            numdoc: contrato.contratista_numdoc||'', fecha_cdp: contrato.fecha_cdp||'',
            cdp: contrato.cdp||'', fecha_rp: contrato.fecha_rp||'', rp: contrato.rp||'',
            fecha_contrato: contrato.fecha_inicio||'', ncon: contrato.numero||'',
            cod_rubro: rubro, fuente: contrato.fuente||'', valor: gastoVal,
            pub: false, cont: false, origen: 'contrato', contrato_full_id: contrato.id,
            retencion_valor: Number(contrato.retencion_valor)||0,
            retencion_concepto: contrato.retencion_concepto||'',
            neto_pagar: Number(contrato.neto_pagar)||0, reteica: Number(contrato.reteica)||0
          });
          contrato.gasto_trim_id = gastoId;
          totalPagado = gastoVal; // Actualizar para cálculo del compromiso
        }
      }
    }
  }

  // ═══ PASO 4: REGISTRAR COMPROMISO ═══
  // Se registra SIEMPRE que haya CDP — INCLUYENDO Liquidado
  // Liquidado: compromiso = totalPagado (libera presupuesto sobrante al saldo)
  // Otros estados: compromiso = valorCDP (reserva completa)
  if(tmCDP){
    const valorComp = (estado === 'Liquidado') ? totalPagado : (valorCDP || valor);
    if(valorComp > 0){
      const compId = uid();
      d.compromisos_eg.push({
        id:               compId,
        cod:              rubro,
        fuente:           contrato.fuente || '',
        trim:             tmCDP.trim,
        mes:              tmCDP.mes,
        valor:            valorComp,
        origen:           'contrato',
        contrato_full_id: contrato.id
      });
      contrato.compromiso_trim_id = compId;
    }
  }
}

/* ══════════════════════════════════════════════════════════ */

function guardarContrato(){
  const numero = $('mc-numero').value.trim();
  const objeto = $('mc-objeto').value.trim();
  const valor = Number($('mc-valor').value);
  const incompleto = !numero || !objeto || valor<=0;
  // Ya no bloquea — permite guardar como borrador con datos parciales

  // ═══ Validar saldo presupuestal: impedir guardar si saldo es 0 o negativo ═══
  const _saldoPpto = Number($('mc-pp-saldo-ppto')?.value) || 0;
  const _valorCDP = Number($('mc-pp-valor-cdp')?.value) || 0;
  const _rubro = $('mc-pp-rubro')?.value || '';
  if(_rubro && _saldoPpto <= 0){
    toast('⛔ El rubro seleccionado NO tiene saldo disponible. Debe realizar un traslado presupuestal antes de crear este contrato.','danger');
    const tabPresup = document.querySelector('[href="#mc-tab-presup"]');
    if(tabPresup) new bootstrap.Tab(tabPresup).show();
    return;
  }
  if(_rubro && _valorCDP > 0 && _saldoPpto > 0 && _valorCDP > _saldoPpto){
    toast('El valor del CDP excede el saldo disponible del rubro ($' + _saldoPpto.toLocaleString('es-CO') + '). Realice un traslado presupuestal o reduzca el valor.','danger');
    const tabPresup = document.querySelector('[href="#mc-tab-presup"]');
    if(tabPresup) new bootstrap.Tab(tabPresup).show();
    return;
  }

  // ═══ Validar saldo de fuente de ingreso ═══
  const _fuente = $('mc-pp-fuente')?.value || '';
  if(_fuente && valor > 0){
    const d_tmp = DB.load();
    // Presupuesto definitivo = inicial + todas las modificaciones del año
    const _rFuente = (d_tmp.rubros_ing||[]).find(r=>r.cod===_fuente);
    let saldoFuente = _rFuente ? (Number(_rFuente.ini)||0) : 0;
    for(let t=1;t<=4;t++){
      const m = typeof getModsIng==='function' ? getModsIng(d_tmp,_fuente,t) : {adi:0,red:0,cre:0,cco:0};
      saldoFuente += m.adi - m.red + m.cre - m.cco;
    }
    // Descontar contratos ya existentes con esta fuente (excepto el que estamos editando)
    const idEdit = $('mc-id').value || '';
    const gastosFuente = (d_tmp.contratos_full||[])
      .filter(c => c.fuente === _fuente && c.id !== idEdit)
      .reduce((s,c) => s + (Number(c.valor)||0), 0);
    const disponibleFuente = saldoFuente - gastosFuente;
    if(disponibleFuente <= 0){
      toast('⛔ La fuente "' + _fuente + '" no tiene saldo disponible. Recaudado insuficiente.','danger');
      const tabPresup = document.querySelector('[href="#mc-tab-presup"]');
      if(tabPresup) new bootstrap.Tab(tabPresup).show();
      return;
    }
    if(valor > disponibleFuente){
      if(!confirm('⚠️ El valor del contrato ($' + fmt(valor) + ') supera el disponible de la fuente ($' + fmt(disponibleFuente) + ').\n\n¿Desea continuar de todas formas?')){
        return;
      }
    }
  }

  // ═══ Auditoría: impedir guardar con números duplicados ═══
  _auditExcluirId = $('mc-id').value || '';
  // Sincronizar campo oculto de egreso con primer pago
  if(_pagosTemp.length > 0 && $('mc-pg-egreso')){
    $('mc-pg-egreso').value = _pagosTemp[0].num_egreso || '';
  }
  if(_validarDuplicados([
    ['mc-numero',    'hint-numero',  'numero',  'N° Contrato'],
    ['mc-pp-cdp',    'hint-cdp',     'cdp',     'N° CDP'],
    ['mc-pp-rp',     'hint-rp',      'rp',      'N° RP'],
    ['mc-pg-egreso', 'hint-egreso',  'egreso',  'N° Egreso']
  ])) return;

  // ═══ Validación de etapas según estado ═══
  {
    const estado = ($('mc-estado')||{}).value || 'Borrador';
    const nivel = estado === 'Borrador' ? 0
                : estado === 'Contratado' ? 1
                : estado === 'En ejecucion' ? 2
                : 3;
    const avisos = [];
    // Contratado o superior: necesita RP
    if(nivel >= 1 && !($('mc-pp-rp')?.value||'').trim())
      avisos.push('Etapa 3: Falta N° de RP');
    if(nivel >= 1 && !($('mc-pp-fecha-rp')?.value||''))
      avisos.push('Etapa 3: Falta Fecha RP');
    // En ejecución o superior: necesita actas
    if(nivel >= 2 && !($('mc-sv-fecha-inicio')?.value||''))
      avisos.push('Etapa 4: Falta Fecha Acta Inicio');
    if(nivel >= 2 && !($('mc-sv-fecha-final')?.value||''))
      avisos.push('Etapa 4: Falta Fecha Acta Final');
    // Terminado/Liquidado: necesita liquidación
    if(nivel >= 3 && !($('mc-sv-fecha-liquidacion')?.value||''))
      avisos.push('Etapa 5: Falta Fecha Liquidación');

    if(avisos.length){
      const msg = 'El estado "' + estado + '" requiere completar:\n\n' +
        avisos.map(a => '• ' + a).join('\n') +
        '\n\n¿Desea guardar de todos modos?';
      if(!confirm(msg)) return;
    }
  }

  // ═══ Validación cronológica de fechas del proceso contractual ═══
  {
    const _f = id => { const v = $(id)?.value; return v ? new Date(v+'T00:00:00') : null; };
    const fCdp       = _f('mc-pp-fecha-cdp');
    const fEstudio   = _f('mc-fecha-estudio');
    const fOfertas   = _f('mc-fecha-ofertas');
    const fEval      = _f('mc-fecha-evaluacion');
    const fAcept     = _f('mc-fecha-aceptacion');
    const fContrato  = _f('mc-fecha-inicio');
    const fRp        = _f('mc-pp-fecha-rp');
    const fActaIni   = _f('mc-sv-fecha-inicio');
    const fFin       = _f('mc-fecha-fin');
    const fActaFin   = _f('mc-sv-fecha-final');
    const fEgreso    = _f('mc-pg-fecha-egreso');
    const fLiquid    = _f('mc-sv-fecha-liquidacion');

    const secuencia = [
      // Fase precontractual (secuencial)
      [fCdp,      fEstudio,  'CDP',                'Estudio Previo'],
      [fEstudio,  fOfertas,  'Estudio Previo',     'Presentación Ofertas'],
      [fOfertas,  fEval,     'Presentación Ofertas','Evaluación'],
      [fEval,     fAcept,    'Evaluación',          'Aceptación'],
      // Fase contractual (secuencial)
      [fAcept,    fContrato, 'Aceptación',          'Fecha Contrato'],
      [fContrato, fRp,       'Fecha Contrato',      'RP'],
      [fRp,       fActaIni,  'RP',                  'Acta de Inicio'],
      [fActaIni,  fFin,      'Acta de Inicio',      'Fecha Fin'],
      [fFin,      fActaFin,  'Fecha Fin',           'Acta Final'],
      [fActaFin,  fLiquid,   'Acta Final',          'Liquidación'],
      // Egreso: solo validar que sea después del Acta Inicio (pagos pueden ser durante la ejecución)
      [fActaIni,  fEgreso,   'Acta de Inicio',      'Egreso']
    ];
    const errores = [];
    for(const [a, b, na, nb] of secuencia){
      if(a && b && a > b) errores.push(`${na} (${a.toISOString().slice(0,10)}) es posterior a ${nb} (${b.toISOString().slice(0,10)})`);
    }
    if(errores.length){
      const msg = 'Las fechas no siguen el orden cronológico del proceso contractual:\n\n' +
        errores.map(e => '• ' + e).join('\n') +
        '\n\n¿Desea guardar de todos modos?';
      if(!confirm(msg)) return;
    }
  }

  // Recopilar cotizaciones (con campos extendidos)
  const cotizaciones = [0,1,2].map(i => ({
    nombre: $(`mc-cot${i}-nombre`).value.trim(),
    nit: $(`mc-cot${i}-nit`).value.trim(),
    valor: Number($(`mc-cot${i}-valor`).value)||0,
    seleccionada: $(`mc-cot${i}-sel`).value === '1',
    documentacion: $(`mc-cot${i}-doc`).value,
    fecha: $(`mc-cot${i}-fecha`).value,
    hora: $(`mc-cot${i}-hora`).value,
    municipio: $(`mc-cot${i}-municipio`).value.trim(),
    rep_legal: $(`mc-cot${i}-replegal`).value.trim(),
    email: $(`mc-cot${i}-email`).value.trim()
  })).filter(c => c.nombre || c.valor);

  // ═══ Auto-registrar proveedores nuevos en el Directorio de Personas ═══
  const personas = DB._personas || [];
  let personasAgregadas = 0;
  cotizaciones.forEach(cot => {
    if(!cot.nombre || !cot.nit) return;
    const yaExiste = personas.some(p =>
      (p.numdoc||'') === cot.nit || (p.nombre||'').toLowerCase() === cot.nombre.toLowerCase()
    );
    if(!yaExiste){
      personas.push({
        id: uid(),
        nombre: cot.nombre,
        cargo: '',
        tipodoc: 'CC',
        numdoc: cot.nit,
        telefono: '',
        celular: '',
        email: cot.email || '',
        direccion: '',
        municipio: cot.municipio || '',
        banco: '', nombre_banco: '',
        tipo_cuenta: 'Ahorros',
        cuenta_banco: '', cuenta_bancaria: '',
        rep_legal: cot.rep_legal || '',
        rep_legal_nombre: cot.rep_legal || '',
        rep_legal_cc: '', rep_legal_num_documento: ''
      });
      personasAgregadas++;
    }
  });
  if(personasAgregadas){
    DB.savePersonas(personas);
    _actualizarDatalistPersonas();
  }

  // Recopilar items UNSPSC (solo código)
  const items = [];
  $('mc-items-tabla').querySelectorAll('tr').forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if(tds.length >= 1){
      const codigo = tds[0].textContent.trim();
      if(codigo) items.push({ codigo });
    }
  });

  // ═══ Auto-guardar pago en edición si quedó abierto ═══
  if(_pagoEditIdx >= 0 && _pagoEditIdx < _pagosTemp.length){
    const _pePanel = $('mc-pago-edit-panel');
    if(_pePanel && _pePanel.style.display !== 'none'){
      const _pe = _pagosTemp[_pagoEditIdx];
      _pe.valor = Number($('mc-pe-valor').value) || _pe.valor;
      _pe.fecha_pago = $('mc-pe-fecha').value || _pe.fecha_pago;
      _pe.num_egreso = ($('mc-pe-egreso').value||'').trim() || _pe.num_egreso;
      _pe.num_factura = ($('mc-pe-factura').value||'').trim() || _pe.num_factura;
      _pe.retencion_valor = Number($('mc-pe-retencion').value) || _pe.retencion_valor;
      _pe.neto_pagar = _pe.valor - _pe.retencion_valor;
      _pagoEditIdx = -1;
      _pePanel.style.display = 'none';
    }
  }

  // ═══ Validar pagos parciales ═══
  if(_pagosTemp.length > 0 && !_validarPagos(_pagosTemp, valor)) return;

  // Respetar estado seleccionado; si incompleto y no eligió estado, usar Borrador
  let estadoFinal = $('mc-estado').value || (incompleto ? 'Borrador' : 'En ejecucion');

  // Auto-liquidar si todos los pagos tienen fecha, egreso Y fecha de egreso (egreso realmente expedido)
  if(_pagosTemp.length > 0 && _pagosTemp.every(pp => pp.fecha_pago && pp.num_egreso && pp.fecha_egreso) && estadoFinal === 'En ejecucion'){
    estadoFinal = 'Liquidado';
    toast('Todos los pagos con egreso generado — Estado cambiado a Liquidado', 'success');
  }

  const c = {
    id: $('mc-id').value || uid(),
    numero: numero, tipo:$('mc-tipo').value, modalidad:$('mc-modalidad').value,
    ref_contrato_anterior: $('mc-ref-anterior')?.value?.trim()||'',
    estado:estadoFinal, objeto: objeto, obligaciones:$('mc-obligaciones').value.trim(),
    valor, fecha_inicio:_fixAnio($('mc-fecha-inicio').value), fecha_fin:_fixAnio($('mc-fecha-fin').value),
    plazo:Number($('mc-plazo').value)||0,
    plazo_unidad:($('mc-plazo-unidad')||{}).value||'dias',
    // Fechas proceso
    fecha_estudio_previo:_fixAnio($('mc-fecha-estudio').value),
    fecha_presentacion_oferta:_fixAnio($('mc-fecha-ofertas').value),
    fecha_evaluacion:_fixAnio($('mc-fecha-evaluacion').value),
    forma_pago:$('mc-forma-pago').value,
    fecha_aprobacion_plan_compras:_fixAnio($('mc-fecha-plan-compras').value),
    fecha_modificacion_plan_compras:_fixAnio($('mc-fecha-mod-plan').value),
    fecha_creacion:_fixAnio($('mc-fecha-creacion').value),
    fecha_carta_propuesta:_fixAnio($('mc-fecha-carta-propuesta').value),
    fecha_aceptacion:_fixAnio($('mc-fecha-aceptacion').value),
    fecha_acta_recibido:_fixAnio($('mc-fecha-acta-recibido').value),
    // Contratista
    contratista_nombre:$('mc-ct-nombre').value.trim(),
    contratista_tipodoc:$('mc-ct-tipodoc').value,
    contratista_numdoc:$('mc-ct-numdoc').value.trim(),
    contratista_municipio:$('mc-ct-municipio')?.value?.trim()||'',
    contratista_direccion:$('mc-ct-direccion')?.value?.trim()||'',
    contratista_telefono:$('mc-ct-telefono')?.value?.trim()||'',
    contratista_email:$('mc-ct-email')?.value?.trim()||'',
    contratista_banco:$('mc-ct-banco')?.value?.trim()||'',
    contratista_tipocuenta:$('mc-ct-tipocuenta')?.value||'',
    contratista_numcuenta:$('mc-ct-numcuenta')?.value?.trim()||'',
    contratista_replegal:$('mc-ct-replegal')?.value?.trim()||'',
    contratista_replegal_cc:$('mc-ct-replegal-cc')?.value?.trim()||'',
    // Presupuesto
    rubro:$('mc-pp-rubro').value, fuente:$('mc-pp-fuente').value,
    vigencia_fiscal:$('mc-pp-vigencia').value,
    cdp:$('mc-pp-cdp').value.trim(), fecha_cdp:_fixAnio($('mc-pp-fecha-cdp').value),
    valor_cdp:Number($('mc-pp-valor-cdp').value)||0,
    rp:$('mc-pp-rp').value.trim(), fecha_rp:_fixAnio($('mc-pp-fecha-rp').value),
    valor_rp:Number($('mc-pp-valor-rp').value)||0,
    saldo_cdp:Number($('mc-pp-saldo-cdp').value)||0,
    saldo_rp:Number($('mc-pp-saldo-rp').value)||0,
    saldo_contrato:Number($('mc-pp-saldo-contrato').value)||0,
    cuenta_contable:$('mc-pp-cuenta-contable').value.trim(),
    nombre_cuenta:$('mc-pp-nombre-cuenta') ? $('mc-pp-nombre-cuenta').value.trim() : '',
    saldo_ppto:Number($('mc-pp-saldo-ppto').value)||0,
    saldo_compromiso:Number($('mc-pp-saldo-compromiso').value)||0,
    rubro_nombre:$('mc-pp-rubro-nombre').value.trim(),
    // Bancos institución
    banco_inst_1:$('mc-pp-banco1').value.trim(),
    cta_inst_1:$('mc-pp-cta1').value.trim(),
    banco_inst_2:$('mc-pp-banco2').value.trim(),
    cta_inst_2:$('mc-pp-cta2').value.trim(),
    banco_inst_3:$('mc-pp-banco3').value.trim(),
    cta_inst_3:$('mc-pp-cta3').value.trim(),
    banco_inst_sel:$('mc-pp-banco-sel').value,
    // Cotizaciones e items
    cotizaciones, items,
    // Pagos / Información Contable
    iva:Number($('mc-pg-iva').value)||0,
    retencion_id:$('mc-pg-tipo-ret').value||'',
    retencion_pct:(function(){ const o=$('mc-pg-tipo-ret').options[$('mc-pg-tipo-ret').selectedIndex]; return o&&o.dataset.pct?Number(o.dataset.pct):0; })(),
    retencion_cuenta:(function(){ const o=$('mc-pg-tipo-ret').options[$('mc-pg-tipo-ret').selectedIndex]; return o&&o.dataset.cuenta?o.dataset.cuenta:''; })(),
    retencion_concepto:(function(){ const o=$('mc-pg-tipo-ret').options[$('mc-pg-tipo-ret').selectedIndex]; return o&&o.value?o.textContent.split('—')[0].trim():''; })(),
    retencion_valor:Number(String($('mc-pg-retencion').value||'0').replace(/[^\d]/g,''))||0,
    neto_pagar:Number(String($('mc-pg-neto').value||'0').replace(/[^\d]/g,''))||0,
    reteica:$('mc-pg-reteica') ? Number($('mc-pg-reteica').value)||0 : 0,
    valor_pagado:$('mc-pg-valor-pagado') ? Number($('mc-pg-valor-pagado').value)||0 : 0,
    // Pagos parciales
    pagos: _pagosTemp.slice(),
    // Legacy (compatibilidad con plantillas): datos del primer pago
    num_egreso: _pagosTemp.length ? _pagosTemp[0].num_egreso||'' : $('mc-pg-egreso').value.trim(),
    num_factura: _pagosTemp.length ? _pagosTemp[0].num_factura||'' : $('mc-pg-factura').value.trim(),
    fecha_pago: _pagosTemp.length ? _pagosTemp[0].fecha_pago||'' : _fixAnio($('mc-pg-fecha').value),
    fecha_egreso: _pagosTemp.length ? _pagosTemp[0].fecha_egreso||'' : _fixAnio($('mc-pg-fecha-egreso').value),
    egreso_modo: $('mc-pg-egreso-modo').value,
    // Supervisión
    supervisor_nombre:$('mc-sv-nombre').value.trim(),
    supervisor_tipodoc:$('mc-sv-tipodoc').value,
    supervisor_numdoc:$('mc-sv-numdoc').value.trim(),
    cargo_supervisor:$('mc-sv-cargo').value.trim(),
    fecha_acta_inicio:_fixAnio($('mc-sv-fecha-inicio').value),
    fecha_acta_final:_fixAnio($('mc-sv-fecha-final').value),
    fecha_liquidacion:_fixAnio($('mc-sv-fecha-liquidacion').value),
    observaciones:$('mc-sv-observaciones').value.trim()
  };

  const d = DB.load();
  if(!d.contratos_full) d.contratos_full = [];

  // ═══ Preservar IDs de vínculo (no están en el formulario) ═══
  const ctoAnterior = d.contratos_full.find(x => x.id === c.id);
  if(ctoAnterior){
    if(ctoAnterior.gasto_trim_id)      c.gasto_trim_id      = ctoAnterior.gasto_trim_id;
    if(ctoAnterior.compromiso_trim_id) c.compromiso_trim_id = ctoAnterior.compromiso_trim_id;
  }

  const idx = d.contratos_full.findIndex(x=>x.id===c.id);
  if(idx>=0) d.contratos_full[idx]=c; else d.contratos_full.push(c);

  // ═══ Auto-registrar compromiso o gasto en ejecución trimestral ═══
  _syncContratoTrimestral(c, d);

  DB.save(d);
  bootstrap.Modal.getInstance($('mContrato')).hide();
  R.contratos();
  // Re-renderizar vista activa si es trimestral, dash o informes
  if(typeof _currentPage!=='undefined'){
    const cp=_currentPage;
    if(cp.startsWith('trim')) R.trimestre(Number(cp.replace('trim','')));
    else if(cp==='dash' && R.dash) R.dash();
  }
  if(incompleto){
    toast('Contrato guardado como borrador — faltan N° Contrato, Objeto o Valor','warning');
  } else {
    toast('Contrato guardado');
  }
}

function eliminarContrato(id){
  if(!confirm('Eliminar este contrato?')) return;
  const d = DB.load();
  // ═══ Eliminar CDP, compromiso, gastos y contrato vinculados ═══
  d.cdps_eg        = (d.cdps_eg||[]).filter(e => e.contrato_full_id !== id);
  d.contratos      = (d.contratos||[]).filter(g => g.contrato_full_id !== id);
  d.compromisos_eg = (d.compromisos_eg||[]).filter(e => e.contrato_full_id !== id);
  d.contratos_full = (d.contratos_full||[]).filter(c=>c.id!==id);
  DB.save(d); R.contratos(); toast('Contrato eliminado','warning');
}

/* ── UNSPSC Search ── */
function buscarUNSPSC(query){
  const results = DB.searchUNSPSC(query, 20);
  const cont = $('mc-unspsc-results');
  if(!results.length || !query){
    cont.classList.add('d-none');
    return;
  }
  cont.classList.remove('d-none');
  cont.innerHTML = results.map(u =>
    `<div class="unspsc-item" onclick="_selUNSPSC('${u.codigo}','${(u.nombre||'').replace(/'/g,"\\'")}')">
      <code>${u.codigo||''}</code> — ${u.nombre||''} <span class="text-muted" style="font-size:9px">${u.segmento_nombre||''}</span>
    </div>`
  ).join('');
}

function _selUNSPSC(codigo, nombre){
  $('mc-unspsc-results').classList.add('d-none');
  $('mc-unspsc-search').value = '';
  _agregarItemRow({codigo, descripcion:nombre, cantidad:1, valor_unit:0, valor_total:0});
}

function anexarUNSPSCManual(){
  const inp = $('mc-unspsc-manual');
  const codigo = inp.value.trim();
  if(!codigo){ toast('Digite un código UNSPSC','danger'); return; }
  _agregarItemRow({codigo});
  inp.value = '';
}

function _agregarItemRow(item){
  const tbody = $('mc-items-tabla');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${item.codigo||''}</td>
    <td class="ctr" style="width:30px"><button class="btn btn-sm btn-outline-danger py-0 px-1" style="font-size:10px" onclick="this.closest('tr').remove()">X</button></td>`;
  tbody.appendChild(tr);
}

/* ══════════════════════════════════════════════════════════
   FUNCIÓN DE PRUEBA: Crear contratos ejemplo por cada estado
   Uso: _crearContratosEjemplo()  (desde consola o botón)
   Crea 5 contratos sobre el PRIMER rubro hoja de egresos.
   Luego _eliminarContratosEjemplo() los borra todos.
══════════════════════════════════════════════════════════ */
function _crearContratosEjemplo(){
  const d = DB.load();
  const hoja = d.rubros.find(r => !r.esGrupo);
  if(!hoja){ toast('No hay rubros de egresos configurados','danger'); return; }
  const rubro = hoja.cod;
  const fuente = (d.rubros_ing||[]).find(r=>!r.esGrupo)?.cod || '';

  // Limpiar ejemplos anteriores
  _eliminarContratosEjemplo(true);

  const ejemplos = [
    // ── 1. BORRADOR ──
    // Solo tiene CDP. Compromiso = valor CDP. Sin pagos.
    // Efecto: CDP ✓, Compromiso ✓, Gasto ✗
    {
      id: '_ejemplo_borrador',
      numero: 'EJ-001', tipo: 'Prestación de servicios', modalidad: 'Mínima cuantía',
      estado: 'Borrador',
      objeto: 'EJEMPLO: Borrador — Solo CDP y Compromiso, sin pagos',
      valor: 100000, valor_cdp: 100000,
      rubro, fuente,
      cdp: 'CDP-EJ-001', fecha_cdp: '2026-01-15',
      rp: '', fecha_rp: '',
      contratista_nombre: 'Proveedor Ejemplo 1',
      contratista_tipodoc: 'CC', contratista_numdoc: '111111',
      fecha_inicio: '', fecha_fin: '',
      pagos: []
    },

    // ── 2. CONTRATADO ──
    // Tiene CDP + RP. Compromiso = valor CDP. Sin pagos.
    // Efecto: CDP ✓, Compromiso ✓, Gasto ✗
    {
      id: '_ejemplo_contratado',
      numero: 'EJ-002', tipo: 'Compraventa', modalidad: 'Mínima cuantía',
      estado: 'Contratado',
      objeto: 'EJEMPLO: Contratado — CDP + RP + Compromiso, sin pagos',
      valor: 200000, valor_cdp: 200000,
      rubro, fuente,
      cdp: 'CDP-EJ-002', fecha_cdp: '2026-01-20',
      rp: 'RP-EJ-002', fecha_rp: '2026-02-01',
      contratista_nombre: 'Proveedor Ejemplo 2',
      contratista_tipodoc: 'NIT', contratista_numdoc: '222222',
      fecha_inicio: '2026-02-01', fecha_fin: '2026-06-30',
      pagos: []
    },

    // ── 3. EN EJECUCIÓN — con pago parcial ──
    // CDP + Compromiso + 1 pago con egreso.
    // Efecto: CDP ✓, Compromiso ✓ (=valorCDP), Gasto ✓ (solo el pago real)
    {
      id: '_ejemplo_en_ejecucion',
      numero: 'EJ-003', tipo: 'Prestación de servicios', modalidad: 'Mínima cuantía',
      estado: 'En ejecucion',
      objeto: 'EJEMPLO: En Ejecución — Pago parcial 150K de 300K',
      valor: 300000, valor_cdp: 300000,
      rubro, fuente,
      cdp: 'CDP-EJ-003', fecha_cdp: '2026-02-01',
      rp: 'RP-EJ-003', fecha_rp: '2026-02-10',
      contratista_nombre: 'Proveedor Ejemplo 3',
      contratista_tipodoc: 'CC', contratista_numdoc: '333333',
      fecha_inicio: '2026-02-10', fecha_fin: '2026-05-30',
      fecha_acta_inicio: '2026-02-10', fecha_acta_final: '2026-05-30',
      pagos: [{
        id: uid(), valor: 150000,
        fecha_pago: '2026-03-15', num_egreso: 'EG-EJ-003-A',
        fecha_egreso: '2026-03-15', num_factura: 'FAC-001',
        retencion_valor: 0, neto_pagar: 150000, reteica: 0,
        nota: 'Primer pago (50%)'
      }]
    },

    // ── 4. TERMINADO — pagos completos ──
    // CDP + Compromiso + 2 pagos con egreso (completo).
    // Efecto: CDP ✓, Compromiso ✓ (=valorCDP), Gasto ✓ (ambos pagos)
    {
      id: '_ejemplo_terminado',
      numero: 'EJ-004', tipo: 'Suministro', modalidad: 'Mínima cuantía',
      estado: 'Terminado',
      objeto: 'EJEMPLO: Terminado — 2 pagos completos (200K + 200K = 400K)',
      valor: 400000, valor_cdp: 400000,
      rubro, fuente,
      cdp: 'CDP-EJ-004', fecha_cdp: '2026-01-10',
      rp: 'RP-EJ-004', fecha_rp: '2026-01-20',
      contratista_nombre: 'Proveedor Ejemplo 4',
      contratista_tipodoc: 'NIT', contratista_numdoc: '444444',
      fecha_inicio: '2026-01-20', fecha_fin: '2026-03-20',
      fecha_acta_inicio: '2026-01-20', fecha_acta_final: '2026-03-20',
      pagos: [
        {
          id: uid(), valor: 200000,
          fecha_pago: '2026-02-15', num_egreso: 'EG-EJ-004-A',
          fecha_egreso: '2026-02-15', num_factura: 'FAC-004A',
          retencion_valor: 0, neto_pagar: 200000, reteica: 0,
          nota: 'Pago 1 de 2'
        },
        {
          id: uid(), valor: 200000,
          fecha_pago: '2026-03-15', num_egreso: 'EG-EJ-004-B',
          fecha_egreso: '2026-03-15', num_factura: 'FAC-004B',
          retencion_valor: 0, neto_pagar: 200000, reteica: 0,
          nota: 'Pago 2 de 2 (final)'
        }
      ]
    },

    // ── 5. LIQUIDADO — pagó menos que el CDP ──
    // CDP=500K, pero solo pagó 350K. Compromiso = totalPagado (350K), libera 150K al saldo.
    // Efecto: CDP ✓ (500K), Compromiso ✓ (350K ← totalPagado), Gasto ✓ (350K)
    {
      id: '_ejemplo_liquidado',
      numero: 'EJ-005', tipo: 'Prestación de servicios', modalidad: 'Mínima cuantía',
      estado: 'Liquidado',
      objeto: 'EJEMPLO: Liquidado — CDP 500K, pagó 350K, libera 150K',
      valor: 500000, valor_cdp: 500000,
      rubro, fuente,
      cdp: 'CDP-EJ-005', fecha_cdp: '2026-01-05',
      rp: 'RP-EJ-005', fecha_rp: '2026-01-15',
      contratista_nombre: 'Proveedor Ejemplo 5',
      contratista_tipodoc: 'CC', contratista_numdoc: '555555',
      fecha_inicio: '2026-01-15', fecha_fin: '2026-02-28',
      fecha_acta_inicio: '2026-01-15', fecha_acta_final: '2026-02-28',
      fecha_liquidacion: '2026-03-10',
      pagos: [
        {
          id: uid(), valor: 200000,
          fecha_pago: '2026-02-01', num_egreso: 'EG-EJ-005-A',
          fecha_egreso: '2026-02-01', num_factura: 'FAC-005A',
          retencion_valor: 0, neto_pagar: 200000, reteica: 0,
          nota: 'Primer pago'
        },
        {
          id: uid(), valor: 150000,
          fecha_pago: '2026-03-01', num_egreso: 'EG-EJ-005-B',
          fecha_egreso: '2026-03-01', num_factura: 'FAC-005B',
          retencion_valor: 0, neto_pagar: 150000, reteica: 0,
          nota: 'Pago final (ajustado a lo realmente ejecutado)'
        }
      ]
    }
  ];

  // Insertar y sincronizar cada uno
  const d2 = DB.load();
  if(!d2.contratos_full) d2.contratos_full = [];
  ejemplos.forEach(c => {
    // Agregar campos faltantes
    c.vigencia_fiscal = String(d2.config?.vigencia || new Date().getFullYear());
    c.forma_pago = c.pagos.length > 1 ? 'Pago parcial' : 'Pago único';
    d2.contratos_full.push(c);
    _syncContratoTrimestral(c, d2);
  });
  DB.save(d2);

  // Mostrar resumen en consola
  console.log('═══ CONTRATOS EJEMPLO CREADOS ═══');
  console.log('Rubro:', rubro, '| Fuente:', fuente);
  console.table([
    {Estado:'Borrador',     Valor:'100K', CDP:'100K', Compromiso:'100K', Gasto:'0',    PorPagar:'100K', Nota:'Solo CDP+Comp'},
    {Estado:'Contratado',   Valor:'200K', CDP:'200K', Compromiso:'200K', Gasto:'0',    PorPagar:'200K', Nota:'CDP+RP+Comp'},
    {Estado:'En ejecución', Valor:'300K', CDP:'300K', Compromiso:'300K', Gasto:'150K', PorPagar:'150K', Nota:'Pago parcial 50%'},
    {Estado:'Terminado',    Valor:'400K', CDP:'400K', Compromiso:'400K', Gasto:'400K', PorPagar:'0',    Nota:'2 pagos completos'},
    {Estado:'Liquidado',    Valor:'500K', CDP:'500K', Compromiso:'350K', Gasto:'350K', PorPagar:'0',    Nota:'Libera 150K sobrante'}
  ]);
  console.log('Total CDP: 1.500K | Total Comp: 1.350K | Total Gasto: 900K');
  console.log('Para eliminar: _eliminarContratosEjemplo()');

  // Refrescar vistas
  if(typeof R !== 'undefined'){
    R.contratos();
    if(typeof _currentPage!=='undefined'){
      const cp=_currentPage;
      if(cp.startsWith('trim')) R.trimestre(Number(cp.replace('trim','')));
      else if(cp==='dash' && R.dash) R.dash();
    }
  }
  toast('✅ 5 contratos ejemplo creados en rubro ' + rubro, 'success');
}

function _eliminarContratosEjemplo(silent){
  const d = DB.load();
  const ids = ['_ejemplo_borrador','_ejemplo_contratado','_ejemplo_en_ejecucion','_ejemplo_terminado','_ejemplo_liquidado'];
  let count = 0;
  ids.forEach(id => {
    if(d.contratos_full && d.contratos_full.some(c => c.id === id)){
      d.cdps_eg        = (d.cdps_eg||[]).filter(e => e.contrato_full_id !== id);
      d.contratos      = (d.contratos||[]).filter(g => g.contrato_full_id !== id);
      d.compromisos_eg = (d.compromisos_eg||[]).filter(e => e.contrato_full_id !== id);
      d.contratos_full = d.contratos_full.filter(c => c.id !== id);
      count++;
    }
  });
  DB.save(d);
  if(!silent){
    if(typeof R !== 'undefined'){
      R.contratos();
      if(typeof _currentPage!=='undefined'){
        const cp=_currentPage;
        if(cp.startsWith('trim')) R.trimestre(Number(cp.replace('trim','')));
      }
    }
    toast(count + ' contratos ejemplo eliminados', 'warning');
  }
}
