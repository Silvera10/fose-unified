/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Inicialización de la aplicación
══════════════════════════════════════════════════════════ */

async function _initApp(){
  const loading = $('loading-overlay');
  const bar = $('loading-bar-fill');
  const txt = $('loading-text');
  const setProgress = (pct, msg) => {
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = msg;
  };

  try {
    setProgress(5, 'Iniciando base de datos...');
    await DB.init();

    // ── Inicializar Supabase ──
    setProgress(10, 'Conectando al servidor...');
    if (typeof SB !== 'undefined') SB.init();

    // ── Gate de autenticación ──
    if (typeof SB !== 'undefined' && SB.isActive()){
      const user = await SB.getUser();
      if (!user){
        // No hay sesión — mostrar login
        if (loading) loading.style.display = 'none';
        SB.showAuthOverlay();
        return; // _initApp se re-ejecuta después de login exitoso
      }

      // Usuario autenticado — mostrar botón logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) btnLogout.style.display = '';

      // Intentar cargar desde Supabase
      setProgress(15, 'Descargando datos del servidor...');
      const loadedFromCloud = await DB.loadFromSupabase();

      if (loadedFromCloud){
        setProgress(25, 'Datos del servidor cargados');
        SB.updateSyncIndicator('ok');
      } else {
        // No hay datos en Supabase — cargar locales y ofrecer migración
        setProgress(20, 'Cargando metadatos locales...');
        await DB.loadMeta();

        if (DB.getInstituciones().length > 0){
          // Hay datos locales pero no en Supabase — ofrecer migración
          setProgress(25, 'Migrando datos al servidor...');
          const migrado = await SB.migrarDatosLocales();
          if (migrado){
            if (typeof toast === 'function') toast('Datos locales subidos al servidor');
            SB.updateSyncIndicator('ok');
          }
          await DB.preload();
        } else {
          // Sin datos en ningún lado — flujo normal de primera vez
          await _initSinDatos(setProgress);
        }
      }
    } else {
      // Supabase NO configurado — flujo original sin cloud
      setProgress(20, 'Cargando metadatos...');
      await DB.loadMeta();

      if (DB.getInstituciones().length === 0){
        await _initSinDatos(setProgress);
      } else {
        setProgress(40, 'Cargando institución activa...');
        await DB.preload();
      }
    }

    setProgress(50, 'Cargando directorio de personas...');
    await DB.loadPersonas();
    if(typeof _actualizarDatalistPersonas === 'function') _actualizarDatalistPersonas();

    // ── Auto-importar personas desde sqlite_export.json si no hay personas ──
    if((!DB._personas || DB._personas.length === 0) && typeof importarPersonasJSON === 'function'){
      try {
        setProgress(55, 'Importando directorio de personas...');
        const resp = await fetch('data/sqlite_export.json');
        if(resp.ok){
          const json = await resp.json();
          if(json.personas && json.personas.length > 0){
            const n = importarPersonasJSON(json.personas);
            if(n > 0){
              console.log(`[INIT] ${n} personas importadas desde sqlite_export.json`);
              if(typeof toast === 'function') toast(`${n} personas importadas del respaldo`, 'success');
            }
          }
        }
      } catch(e){ console.warn('[INIT] No se pudo importar personas:', e.message); }
    }

    setProgress(60, 'Cargando festivos colombianos...');
    if(typeof _cargarFestivos === 'function') await _cargarFestivos();

    setProgress(70, 'Renderizando interfaz...');
    navUpdate();

    // Renderizar página inicial
    if (typeof R !== 'undefined'){
      if (R.dash) R.dash();
      if (R.config) R.config();
    }

    // Inicializar snapshot de auditoría para detectar cambios
    if(typeof _auditPrev !== 'undefined' && typeof _snapshotCounts === 'function'){
      const dAudit = DB.load();
      if(dAudit) _auditPrev = _snapshotCounts(dAudit);
    }

    setProgress(90, 'Verificando respaldos...');
    // verificarBackupAlInicio() se llama si existe

    setProgress(100, 'Listo');
    setTimeout(() => {
      if (loading) loading.style.display = 'none';
    }, 300);

  } catch(e) {
    console.error('Error de inicialización:', e);
    setProgress(100, 'Error: ' + e.message);
    if (loading){
      loading.innerHTML = `<div class="text-center">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size:3rem"></i>
        <h5 class="mt-3 text-danger">Error de inicialización</h5>
        <p class="text-muted">${e.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
      </div>`;
    }
  }
}

/* ── Inicialización cuando no hay datos (primera vez) ── */
async function _initSinDatos(setProgress){
  setProgress(30, 'Buscando datos previos...');
  const migrated = await DB.migrarDesdeLocalStorage();
  if (!migrated){
    // Verificar si hay backup de emergencia
    const backupEmg = typeof _tieneBackupEmergencia === 'function' ? _tieneBackupEmergencia() : null;
    if(backupEmg && backupEmg.data && backupEmg.data.config){
      setProgress(35, 'Backup de emergencia encontrado...');
      const restaurar = confirm(
        `Se encontró un backup de emergencia:\n` +
        `• Institución: ${backupEmg.instNombre || 'Sin nombre'}\n` +
        `• Fecha: ${backupEmg.fecha || 'Desconocida'}\n\n` +
        `¿Desea restaurar estos datos?`
      );
      if(restaurar){
        setProgress(38, 'Restaurando backup...');
        const id = await DB.addInst(backupEmg.instNombre || 'Institución Restaurada');
        DB._mem = backupEmg.data;
        if(typeof _validarDatos === 'function') _validarDatos(DB._mem);
        await DB._put('instituciones', id, backupEmg.data);
        // Restaurar personas si existen
        if(backupEmg.personas && Array.isArray(backupEmg.personas)){
          DB._personas = backupEmg.personas;
          await DB._put('personas', 'all', backupEmg.personas);
        }
      } else {
        setProgress(40, 'Creando institución de ejemplo...');
        const id = await DB.addInst('Mi Institución Educativa');
        const d = DB.initVacio('Mi Institución Educativa');
        DB._mem = d;
        await DB._put('instituciones', id, d);
      }
    } else {
      setProgress(40, 'Creando institución de ejemplo...');
      const id = await DB.addInst('Mi Institución Educativa');
      const d = DB.initVacio('Mi Institución Educativa');
      DB._mem = d;
      await DB._put('instituciones', id, d);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   CORRECCIÓN AUTOMÁTICA DE FECHAS — Año 00XX → 20XX
══════════════════════════════════════════════════════════ */
function _corregirFechasGlobal(){
  document.addEventListener('change', function(e){
    const el = e.target;
    if(!el || el.type !== 'date' || !el.value) return;
    if(typeof _fixAnio === 'function'){
      const corregido = _fixAnio(el.value);
      if(corregido !== el.value){
        el.value = corregido;
        toast('Año corregido automáticamente a ' + corregido.split('-')[0], 'info');
      }
    }
  }, true);
}

/* ══════════════════════════════════════════════════════════
   MAYÚSCULAS AUTOMÁTICAS — Todos los campos de texto en MAYÚSCULA
══════════════════════════════════════════════════════════ */
function _forzarMayusculas(){
  // Excluir campos de email, password, búsqueda UNSPSC y campos hidden
  const EXCLUIR = ['auth-email','auth-pass','reg-email','reg-pass','mc-unspsc-search'];
  document.addEventListener('input', function(e){
    const el = e.target;
    if(!el || el.type === 'hidden' || el.type === 'date' || el.type === 'number' ||
       el.type === 'email' || el.type === 'password' || el.type === 'file' ||
       el.tagName === 'SELECT') return;
    if(EXCLUIR.includes(el.id)) return;
    // Solo aplicar a inputs text y textarea con clase form-control
    if((el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search' || !el.type)) ||
        el.tagName === 'TEXTAREA'){
      const start = el.selectionStart, end = el.selectionEnd;
      el.value = el.value.toUpperCase();
      // Restaurar posición del cursor
      if(typeof start === 'number') el.setSelectionRange(start, end);
    }
  }, true);
}

// Iniciar cuando el DOM esté listo
/* Refrescar app: limpia datos inconsistentes y recarga la vista */
function _refrescarApp(){
  _limpiarRecaudosBanco();
  const page = document.querySelector('.page:not([style*="display: none"])');
  if(page && page.id) navTo(page.id.replace('page-',''));
  toast('Datos refrescados');
}

/* Reconstruir recaudos al iniciar — usa _recalcularRecaudosIng de actions-eg.js */
function _limpiarRecaudosBanco(){
  const d = DB.load();
  if(!d.rubros_ing) return;
  if(typeof _recalcularRecaudosIng === 'function'){
    _recalcularRecaudosIng(d);
    DB.save(d);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  _corregirFechasGlobal();
  _forzarMayusculas();
  _initApp();
  // Limpiar recaudos DESPUÉS de que DB esté inicializada
  _limpiarRecaudosBanco();
});
