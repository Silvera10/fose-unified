/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Integración con Supabase
   Backend en la nube: auth, sync, multi-usuario
══════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN — Pegue aquí sus credenciales de Supabase
// (Ver docs/guia-supabase.html para instrucciones)
// ═══════════════════════════════════════════════════════
const SUPABASE_URL = 'https://ejmhhegmqaztavjguojw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbWhoZWdtcWF6dGF2amd1b2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTYxODgsImV4cCI6MjA4ODgzMjE4OH0.1WR3fhwj9Kr95puAmkCuMlcCJcoDLNlwc6sE_NZfnLQ';

const SB = {
  client: null,
  _syncing: false,
  _lastSync: null,
  _error: null,
  _saveTimer: null,      // debounce timer para save
  _saveQueue: null,       // datos pendientes de guardar
  _saveMetaTimer: null,
  _configured: false,

  /* ── Inicializar cliente Supabase ── */
  init(){
    if (SUPABASE_URL === 'https://TU-PROYECTO.supabase.co' ||
        SUPABASE_ANON_KEY === 'TU-ANON-KEY-AQUI'){
      console.warn('Supabase no configurado. La app funciona solo con datos locales.');
      this._configured = false;
      return;
    }
    if (typeof supabase === 'undefined' || !supabase.createClient){
      console.warn('Supabase JS no cargado. La app funciona solo con datos locales.');
      this._configured = false;
      return;
    }
    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this._configured = true;

    // Flush pendiente al cerrar
    window.addEventListener('beforeunload', () => this._flushSave());
  },

  isActive(){ return this._configured && this.client !== null; },

  /* ══════════════════════════════════════════════════════
     AUTENTICACIÓN
  ══════════════════════════════════════════════════════ */

  async getUser(){
    if (!this.isActive()) return null;
    const { data } = await this.client.auth.getSession();
    return data.session?.user || null;
  },

  async login(email, password){
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data.user;
  },

  async register(email, password, nombre){
    const { data, error } = await this.client.auth.signUp({
      email, password,
      options: { data: { nombre } }
    });
    if (error) throw new Error(error.message);
    return data.user;
  },

  async logout(){
    if (!this.isActive()) return;
    this._flushSave();
    await this.client.auth.signOut();
  },

  /* ══════════════════════════════════════════════════════
     CRUD — METADATOS DEL USUARIO
  ══════════════════════════════════════════════════════ */

  async fetchMeta(){
    const user = await this.getUser();
    if (!user) return null;
    const { data, error } = await this.client
      .from('app_meta').select('*').eq('user_id', user.id).single();
    if (error && error.code !== 'PGRST116') console.warn('fetchMeta:', error.message);
    return data;
  },

  async saveMeta(meta){
    if (!this.isActive()) return;
    const user = await this.getUser();
    if (!user) return;
    // Debounce meta saves
    clearTimeout(this._saveMetaTimer);
    this._saveMetaTimer = setTimeout(async () => {
      try {
        await this.client.from('app_meta').upsert({
          user_id: user.id,
          active_inst_id: meta.activeId || '',
          cambios: meta.cambios || 0
        });
      } catch(e){ console.warn('saveMeta error:', e); }
    }, 1000);
  },

  /* ══════════════════════════════════════════════════════
     CRUD — INSTITUCIONES
  ══════════════════════════════════════════════════════ */

  async fetchInstituciones(){
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await this.client
      .from('user_instituciones')
      .select('inst_id, role, instituciones(id, nombre)')
      .eq('user_id', user.id);
    if (error){ console.warn('fetchInstituciones:', error.message); return []; }
    return (data||[]).map(r => ({
      id: r.inst_id,
      nombre: r.instituciones?.nombre || '',
      role: r.role
    }));
  },

  async fetchInstData(instId){
    const { data, error } = await this.client
      .from('instituciones').select('data').eq('id', instId).single();
    if (error){ console.warn('fetchInstData:', error.message); return null; }
    return data?.data || null;
  },

  /* ── Guardar datos de institución (debounceado 2s) ── */
  saveInstData(instId, d){
    if (!this.isActive()) return;
    this._saveQueue = { instId, data: d };
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._flushSave(), 2000);
    this.updateSyncIndicator('syncing');
  },

  async _flushSave(){
    clearTimeout(this._saveTimer);
    if (!this._saveQueue) return;
    const { instId, data } = this._saveQueue;
    this._saveQueue = null;
    this._syncing = true;
    this.updateSyncIndicator('syncing');
    try {
      const { error } = await this.client
        .from('instituciones')
        .update({ data, nombre: (data.config||{}).institucion || '' })
        .eq('id', instId);
      if (error) throw error;
      this._lastSync = new Date();
      this._error = null;
      this.updateSyncIndicator('ok');
    } catch(e){
      console.error('Supabase save error:', e);
      this._error = e.message;
      this.updateSyncIndicator('error');
    }
    this._syncing = false;
  },

  async createInst(id, nombre, data){
    if (!this.isActive()) return;
    const user = await this.getUser();
    if (!user) return;
    try {
      // Insertar institución
      const { error: e1 } = await this.client.from('instituciones').insert({
        id, nombre, data: data || {}, owner_id: user.id
      });
      if (e1) throw e1;
      // Crear acceso owner
      const { error: e2 } = await this.client.from('user_instituciones').insert({
        user_id: user.id, inst_id: id, role: 'owner'
      });
      if (e2) console.warn('createInst access:', e2.message);
    } catch(e){
      console.error('createInst error:', e);
    }
  },

  async deleteInst(instId){
    if (!this.isActive()) return;
    try {
      await this.client.from('instituciones').delete().eq('id', instId);
    } catch(e){ console.error('deleteInst error:', e); }
  },

  async renameInst(instId, nombre){
    if (!this.isActive()) return;
    try {
      await this.client.from('instituciones').update({ nombre }).eq('id', instId);
    } catch(e){ console.error('renameInst error:', e); }
  },

  /* ══════════════════════════════════════════════════════
     CRUD — PERSONAS
  ══════════════════════════════════════════════════════ */

  async fetchPersonas(){
    const user = await this.getUser();
    if (!user) return [];
    const { data, error } = await this.client
      .from('personas').select('id, data').eq('owner_id', user.id);
    if (error){ console.warn('fetchPersonas:', error.message); return []; }
    return (data||[]).map(r => ({ id: r.id, ...(r.data||{}) }));
  },

  async savePersonas(arr){
    if (!this.isActive()) return;
    const user = await this.getUser();
    if (!user) return;
    try {
      // Eliminar existentes y re-insertar
      await this.client.from('personas').delete().eq('owner_id', user.id);
      if (arr && arr.length){
        const rows = arr.map(p => ({
          id: p.id || ('per_' + Date.now() + Math.random().toString(36).slice(2,6)),
          owner_id: user.id,
          data: p
        }));
        // Insertar en lotes de 100
        for (let i=0; i<rows.length; i+=100){
          await this.client.from('personas').insert(rows.slice(i, i+100));
        }
      }
    } catch(e){ console.error('savePersonas error:', e); }
  },

  /* ══════════════════════════════════════════════════════
     COMPARTIR INSTITUCIÓN (multi-usuario)
  ══════════════════════════════════════════════════════ */

  async compartirInstitucion(instId, email, role='editor'){
    if (!this.isActive()) return { ok: false, msg: 'Supabase no activo' };
    try {
      // Buscar usuario por email
      const { data: perfiles } = await this.client
        .from('profiles').select('id').eq('email', email).single();
      if (!perfiles) return { ok: false, msg: 'No se encontró usuario con ese correo' };
      // Crear acceso
      const { error } = await this.client.from('user_instituciones').insert({
        user_id: perfiles.id, inst_id: instId, role
      });
      if (error) return { ok: false, msg: error.message };
      return { ok: true, msg: 'Acceso compartido exitosamente' };
    } catch(e){
      return { ok: false, msg: e.message };
    }
  },

  async quitarAcceso(instId, userId){
    if (!this.isActive()) return;
    await this.client.from('user_instituciones')
      .delete().eq('inst_id', instId).eq('user_id', userId);
  },

  async listarAccesos(instId){
    if (!this.isActive()) return [];
    const { data } = await this.client
      .from('user_instituciones')
      .select('user_id, role, profiles(email, nombre)')
      .eq('inst_id', instId);
    return (data||[]).map(r => ({
      userId: r.user_id,
      role: r.role,
      email: r.profiles?.email || '',
      nombre: r.profiles?.nombre || ''
    }));
  },

  /* ══════════════════════════════════════════════════════
     MIGRACIÓN — Subir datos locales al servidor
  ══════════════════════════════════════════════════════ */

  async migrarDatosLocales(){
    if (!this.isActive()) return;
    const user = await this.getUser();
    if (!user) return;

    // Verificar si ya tiene datos en Supabase
    const instCloud = await this.fetchInstituciones();
    if (instCloud.length > 0) return false; // Ya tiene datos

    // Verificar si hay datos locales
    const localInsts = DB.getInstituciones();
    if (!localInsts.length) return false; // No hay datos locales

    // Subir cada institución
    for (const inst of localInsts){
      const data = await DB._get('instituciones', inst.id);
      if (data){
        await this.createInst(inst.id, inst.nombre, data);
      }
    }

    // Subir personas
    if (DB._personas && DB._personas.length){
      await this.savePersonas(DB._personas);
    }

    // Guardar meta
    await this.saveMeta(DB._meta);

    return true; // Se migraron datos
  },

  /* ══════════════════════════════════════════════════════
     UI — INDICADOR DE SYNC
  ══════════════════════════════════════════════════════ */

  updateSyncIndicator(status){
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.classList.remove('bg-success','bg-warning','bg-danger','bg-secondary');
    switch(status){
      case 'ok':
        el.classList.add('bg-success');
        el.innerHTML = '<i class="bi bi-cloud-check"></i>';
        el.title = 'Sincronizado — ' + new Date().toLocaleTimeString('es-CO');
        break;
      case 'syncing':
        el.classList.add('bg-warning');
        el.innerHTML = '<i class="bi bi-cloud-arrow-up"></i>';
        el.title = 'Guardando en la nube...';
        break;
      case 'error':
        el.classList.add('bg-danger');
        el.innerHTML = '<i class="bi bi-cloud-slash"></i>';
        el.title = 'Error de sincronización: ' + (this._error||'');
        break;
      default:
        el.classList.add('bg-secondary');
        el.innerHTML = '<i class="bi bi-cloud-slash"></i>';
        el.title = 'Sin conexión al servidor';
    }
  },

  /* ══════════════════════════════════════════════════════
     UI — AUTH (Login/Register/Logout)
  ══════════════════════════════════════════════════════ */

  showAuthOverlay(){
    const el = document.getElementById('auth-overlay');
    if (el) el.style.display = 'flex';
  },

  hideAuthOverlay(){
    const el = document.getElementById('auth-overlay');
    if (el) el.style.display = 'none';
  }
};

/* ── Funciones globales para los botones de auth ── */

async function doLogin(){
  const email = document.getElementById('auth-email')?.value.trim();
  const pass = document.getElementById('auth-pass')?.value;
  const errEl = document.getElementById('auth-error');
  if (!email || !pass){
    if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'Ingrese correo y contraseña'; }
    return;
  }
  try {
    if (errEl) errEl.style.display = 'none';
    document.getElementById('btn-login').disabled = true;
    document.getElementById('btn-login').textContent = 'Ingresando...';
    await SB.login(email, pass);
    SB.hideAuthOverlay();
    await _initApp();
  } catch(e){
    if (errEl){ errEl.style.display = 'block'; errEl.textContent = e.message; }
  } finally {
    const btn = document.getElementById('btn-login');
    if (btn){ btn.disabled = false; btn.textContent = 'Ingresar'; }
  }
}

async function doRegister(){
  const nombre = document.getElementById('reg-nombre')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const pass = document.getElementById('reg-pass')?.value;
  const errEl = document.getElementById('auth-error');
  if (!nombre || !email || !pass){
    if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'Complete todos los campos'; }
    return;
  }
  if (pass.length < 6){
    if (errEl){ errEl.style.display = 'block'; errEl.textContent = 'La contraseña debe tener mínimo 6 caracteres'; }
    return;
  }
  try {
    if (errEl) errEl.style.display = 'none';
    document.getElementById('btn-register').disabled = true;
    document.getElementById('btn-register').textContent = 'Creando cuenta...';
    await SB.register(email, pass, nombre);
    SB.hideAuthOverlay();
    await _initApp();
  } catch(e){
    if (errEl){ errEl.style.display = 'block'; errEl.textContent = e.message; }
  } finally {
    const btn = document.getElementById('btn-register');
    if (btn){ btn.disabled = false; btn.textContent = 'Crear cuenta'; }
  }
}

async function doLogout(){
  if (!confirm('¿Cerrar sesión?')) return;
  await SB.logout();
  DB._mem = null;
  DB._meta = null;
  DB._personas = null;
  SB.showAuthOverlay();
  // Limpiar UI
  const content = document.getElementById('main-content');
  if (content) content.innerHTML = '';
}

/* ── Compartir institución (desde UI) ── */
async function compartirInstitucionUI(){
  const instId = DB.getActiveId();
  if (!instId){ toast('No hay institución activa','warning'); return; }
  const email = prompt('Ingrese el correo del usuario con quien desea compartir:');
  if (!email) return;
  const result = await SB.compartirInstitucion(instId, email.trim(), 'editor');
  toast(result.msg, result.ok ? 'success' : 'danger');
}
