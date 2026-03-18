/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Capa de Protección Anti-Fallas (guard.js)
   Se carga ANTES de todos los demás scripts.
   Protege contra: errores JS, pérdida de datos, DOM nulo.
══════════════════════════════════════════════════════════ */

/* ── A) CAPTURA GLOBAL DE ERRORES ── */

window.onerror = function(msg, url, line, col, error){
  console.error('[GUARD] Error capturado:', msg, '\n  en:', url, 'línea:', line);
  // Mostrar toast si ya existe la función (se carga después)
  setTimeout(() => {
    if(typeof toast === 'function'){
      const archivo = url ? url.split('/').pop() : '?';
      toast(`Error en ${archivo} (línea ${line}): ${msg}`, 'danger');
    }
  }, 100);
  // Retornar true para evitar que el error se propague al console del navegador
  return false;
};

window.onunhandledrejection = function(event){
  const reason = event.reason;
  const msg = reason instanceof Error ? reason.message : String(reason || 'Error async desconocido');
  console.error('[GUARD] Promesa rechazada:', msg, reason);
  setTimeout(() => {
    if(typeof toast === 'function'){
      toast('Error async: ' + msg.substring(0, 80), 'danger');
    }
  }, 100);
};

/* ── B) AUTO-BACKUP DE EMERGENCIA (localStorage) ── */

const BACKUP_KEY = 'fose_emergency_backup';
const BACKUP_INTERVAL = 120000; // 2 minutos

function _autoBackup(){
  try {
    if(typeof DB === 'undefined' || !DB._mem || !DB._mem.config) return;
    const snapshot = {
      ts: Date.now(),
      fecha: new Date().toLocaleString('es-CO'),
      instId: DB.getActiveId ? DB.getActiveId() : '',
      instNombre: (DB._mem.config || {}).institucion || 'Sin nombre',
      data: DB._mem
    };
    // También guardar personas por separado
    if(DB._personas && DB._personas.length > 0){
      snapshot.personas = DB._personas;
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
  } catch(e){
    // localStorage lleno o no disponible — ignorar silenciosamente
    console.warn('[GUARD] Auto-backup falló:', e.message);
  }
}

// Iniciar auto-backup cuando la app esté lista
document.addEventListener('DOMContentLoaded', () => {
  // Primer backup a los 30 segundos (dar tiempo a que cargue)
  setTimeout(_autoBackup, 30000);
  // Luego cada 2 minutos
  setInterval(_autoBackup, BACKUP_INTERVAL);
});

// También hacer backup antes de cerrar la página
window.addEventListener('beforeunload', _autoBackup);

/* ── Verificar si existe backup de emergencia ── */
function _tieneBackupEmergencia(){
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if(!raw) return null;
    const b = JSON.parse(raw);
    if(!b || !b.data || !b.ts) return null;
    return b;
  } catch(e){
    return null;
  }
}

/* ── Restaurar backup de emergencia ── */
async function _restaurarBackupEmergencia(){
  try {
    const b = _tieneBackupEmergencia();
    if(!b || !b.data) {
      if(typeof toast === 'function') toast('No hay backup de emergencia disponible','warning');
      return false;
    }

    // Validar datos mínimos
    if(!b.data.config){
      if(typeof toast === 'function') toast('Backup corrupto — no se puede restaurar','danger');
      return false;
    }

    // Restaurar datos de la institución
    const id = b.instId || DB.getActiveId();
    if(!id){
      if(typeof toast === 'function') toast('No hay institución activa para restaurar','danger');
      return false;
    }

    DB._mem = b.data;
    await DB._put('instituciones', id, b.data);

    // Restaurar personas si existen en el backup
    if(b.personas && Array.isArray(b.personas)){
      DB._personas = b.personas;
      await DB._put('personas', 'all', b.personas);
    }

    if(typeof toast === 'function'){
      toast(`Datos restaurados desde backup (${b.fecha})`, 'success');
    }

    // Recargar interfaz
    if(typeof navUpdate === 'function') navUpdate();
    if(typeof R !== 'undefined' && R.config) R.config();

    return true;
  } catch(e){
    console.error('[GUARD] Error restaurando backup:', e);
    if(typeof toast === 'function') toast('Error restaurando: ' + e.message, 'danger');
    return false;
  }
}

/* ── C) SAFE MODAL — Abrir modales sin crash ── */

function safeModal(id){
  const el = document.getElementById(id);
  if(!el){
    console.warn('[GUARD] Modal no encontrado:', id);
    return { show(){}, hide(){} };
  }
  try {
    return new bootstrap.Modal(el);
  } catch(e){
    console.error('[GUARD] Error creando modal:', id, e);
    return { show(){}, hide(){} };
  }
}

/* ── D) VALIDAR ESTRUCTURA DE DATOS ── */

function _validarDatos(d){
  if(!d || typeof d !== 'object') return d;
  // Estructura mínima requerida
  if(!d.config)          d.config = {};
  if(!d.rubros)          d.rubros = [];
  if(!d.mods)            d.mods = {};
  if(!d.rubros_ing)        d.rubros_ing = [];
  if(!d.mods_ing)          d.mods_ing = {};
  if(!d.mods_eg)           d.mods_eg = [];
  if(!d.mods_ing_form)     d.mods_ing_form = [];
  if(!d.ingresos)          d.ingresos = [];
  if(!d.recaudos_ing_mes)  d.recaudos_ing_mes = {};
  if(!d.contratos_full)    d.contratos_full = [];
  if(!d.contratos)         d.contratos = [];
  if(!d.cdps_eg)           d.cdps_eg = [];
  if(!d.compromisos_eg)    d.compromisos_eg = [];
  if(!d.pagos_eg)          d.pagos_eg = [];
  if(!d.pagos_dian)        d.pagos_dian = [];
  if(!d.acuerdos)          d.acuerdos = [];
  if(!d._adiciones_banco)  d._adiciones_banco = [];
  // SIFSE — Reporte al Ministerio de Educación
  if(!d.sifse_catalogo)  d.sifse_catalogo = {fuentes:[], gastos:[]};
  if(!d.sifse_map_eg)    d.sifse_map_eg = {};
  if(!d.sifse_map_ing)   d.sifse_map_ing = {};
  // Limpiar CDPs, gastos y compromisos huérfanos (contrato_full_id apunta a contrato que ya no existe)
  if(d.contratos_full){
    const idsContratos = new Set((d.contratos_full).map(c => c.id));
    // Si tiene contrato_full_id → el contrato debe existir. Si no tiene → es manual, se conserva.
    if(d.cdps_eg){
      d.cdps_eg = d.cdps_eg.filter(e =>
        !e.contrato_full_id || idsContratos.has(e.contrato_full_id)
      );
    }
    if(d.contratos){
      d.contratos = d.contratos.filter(g =>
        !g.contrato_full_id || idsContratos.has(g.contrato_full_id)
      );
    }
    if(d.compromisos_eg){
      d.compromisos_eg = d.compromisos_eg.filter(e =>
        !e.contrato_full_id || idsContratos.has(e.contrato_full_id)
      );
    }
    // NOTA: La migración legacy gasto→compromiso fue eliminada.
    // _syncContratoTrimestral() ahora maneja correctamente:
    //   - "En ejecución" sin pagos → compromiso por valor total
    //   - "En ejecución" con pagos parciales → gastos por pagos realizados + compromiso por saldo
    //   - "Liquidado" → gastos por cada pago
  }
  // Limpiar prefijos (Borrador) y (Pendiente) de campos de contratos y gastos
  if(d.contratos_full){
    d.contratos_full.forEach(cto => {
      if(cto.numero && cto.numero.startsWith('(Borrador)'))
        cto.numero = cto.numero.replace(/^\(Borrador\)/, '');
      if(cto.objeto && cto.objeto.startsWith('(Pendiente)'))
        cto.objeto = cto.objeto.replace(/^\(Pendiente\)/, '');
    });
  }
  if(d.contratos){
    d.contratos.forEach(g => {
      if(g.ncon && g.ncon.startsWith('(Borrador)'))
        g.ncon = g.ncon.replace(/^\(Borrador\)/, '');
      if(g.concepto && g.concepto.startsWith('(Pendiente)'))
        g.concepto = g.concepto.replace(/^\(Pendiente\)/, '');
    });
  }
  // Corregir fechas con año 00XX → 20XX en contratos existentes
  if(d.contratos_full && typeof _fixAnio === 'function'){
    const camposFecha = ['fecha_inicio','fecha_fin','fecha_cdp','fecha_rp','fecha_egreso',
      'fecha_pago','fecha_acta_inicio','fecha_acta_final','fecha_liquidacion',
      'fecha_estudio_previo','fecha_creacion','fecha_evaluacion',
      'fecha_presentacion_oferta','fecha_carta_propuesta','fecha_aceptacion',
      'fecha_acta_recibido','fecha_aprobacion_plan_compras','fecha_modificacion_plan_compras'];
    d.contratos_full.forEach(cto => {
      camposFecha.forEach(f => { if(cto[f]) cto[f] = _fixAnio(cto[f]); });
    });
  }
  // Config mínimo
  if(!d.config.institucion && d.config.institucion !== '') d.config.institucion = '';
  if(!d.config.vigencia) d.config.vigencia = String(new Date().getFullYear());
  return d;
}

/* ── E) INDICADOR VISUAL DE ESTADO ── */

function _mostrarEstadoGuard(){
  console.log('%c[GUARD] ✓ Capa de protección activa', 'color: #1a7a3a; font-weight: bold');
  console.log('%c  • Captura global de errores: ✓', 'color: #555');
  console.log('%c  • Auto-backup cada 2 min: ✓', 'color: #555');
  console.log('%c  • Validación de datos: ✓', 'color: #555');
  const b = _tieneBackupEmergencia();
  if(b){
    console.log(`%c  • Último backup: ${b.fecha} (${b.instNombre})`, 'color: #555');
  } else {
    console.log('%c  • Sin backup previo', 'color: #999');
  }
}
document.addEventListener('DOMContentLoaded', _mostrarEstadoGuard);

/* ── F) RECORDATORIO MENSUAL DE BACKUP ── */
function _verificarRecordatorioBackup(){
  try {
    const KEY = 'fose_last_backup_reminder';
    const ultimo = localStorage.getItem(KEY);
    const ahora = Date.now();
    const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

    // Si nunca se ha mostrado o pasaron 30 días
    if(!ultimo || (ahora - Number(ultimo)) > TREINTA_DIAS){
      // Esperar 10 segundos para que la app cargue completamente
      setTimeout(()=>{
        const banner = document.createElement('div');
        banner.id = 'backup-reminder-banner';
        banner.innerHTML = `
          <div style="position:fixed;bottom:60px;left:50%;transform:translateX(-50%);z-index:99999;
            background:linear-gradient(135deg,#f39c12,#e67e22);color:#fff;padding:12px 20px;
            border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.3);font-size:13px;
            max-width:500px;text-align:center;font-family:sans-serif">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">
              ⚠️ Recordatorio de Seguridad
            </div>
            <div>
              Ha pasado más de <strong>30 días</strong> sin descargar un backup.<br>
              Descargue un <strong>Backup JSON</strong> desde Configuración para mayor seguridad.
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;justify-content:center">
              <button onclick="localStorage.setItem('${KEY}',Date.now());this.closest('#backup-reminder-banner').remove()"
                style="background:#fff;color:#e67e22;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px">
                Ya lo hice ✓
              </button>
              <button onclick="localStorage.setItem('${KEY}',Date.now());this.closest('#backup-reminder-banner').remove();navTo('config')"
                style="background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.5);padding:6px 16px;border-radius:6px;cursor:pointer;font-size:12px">
                Ir a Configuración →
              </button>
              <button onclick="this.closest('#backup-reminder-banner').remove()"
                style="background:transparent;color:rgba(255,255,255,0.7);border:none;padding:6px 8px;cursor:pointer;font-size:11px">
                Después
              </button>
            </div>
          </div>`;
        document.body.appendChild(banner);
      }, 10000);
    }
  } catch(e){ /* silenciar errores */ }
}
document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(_verificarRecordatorioBackup, 5000); });
