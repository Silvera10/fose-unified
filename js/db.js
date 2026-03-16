/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Capa de datos (IndexedDB + cache en memoria)

   Almacena datos de instituciones educativas en IndexedDB.
   Mantiene un cache en memoria (_mem) para lecturas síncronas
   que preservan el patrón FOSE existente (DB.load() síncrono).
══════════════════════════════════════════════════════════ */

const DB = {
  _dbName: 'fose_unified_v1',
  _dbVersion: 1,
  _db: null,         // IndexedDB instance
  _mem: null,        // cache en memoria de institución activa
  _meta: null,       // {instituciones:[], activeId:'', cambios:0}
  _unspsc: null,     // cache UNSPSC en memoria (cargado bajo demanda)
  _personas: null,   // cache personas en memoria

  /* ── Inicializar IndexedDB ── */
  async init(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this._dbName, this._dbVersion);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('meta'))
          db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('instituciones'))
          db.createObjectStore('instituciones');
        if (!db.objectStoreNames.contains('personas'))
          db.createObjectStore('personas');
        if (!db.objectStoreNames.contains('unspsc'))
          db.createObjectStore('unspsc');
      };
      req.onsuccess = e => {
        this._db = e.target.result;
        resolve();
      };
      req.onerror = e => reject(e.target.error);
    });
  },

  /* ── Helpers IDB ── */
  _tx(store, mode='readonly'){
    return this._db.transaction(store, mode).objectStore(store);
  },
  _get(store, key){
    return new Promise((resolve, reject) => {
      const req = this._tx(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  _put(store, key, val){
    return new Promise((resolve, reject) => {
      const req = this._tx(store, 'readwrite').put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  _del(store, key){
    return new Promise((resolve, reject) => {
      const req = this._tx(store, 'readwrite').delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /* ── Meta (lista instituciones, activa, cambios) ── */
  async loadMeta(){
    let m = await this._get('meta', 'app');
    if (!m) m = {instituciones:[], activeId:'', cambios:0};
    this._meta = m;
    return m;
  },
  async saveMeta(){
    await this._put('meta', 'app', this._meta);
    // Sync con Supabase
    if (typeof SB !== 'undefined' && SB.isActive()) SB.saveMeta(this._meta);
  },

  /* ── Instituciones ── */
  getInstituciones(){ return (this._meta||{}).instituciones || []; },
  getActiveId(){ return (this._meta||{}).activeId || ''; },

  async setActive(id){
    this._meta.activeId = id;
    await this.saveMeta();
    // Precargar datos en memoria
    const d = await this._get('instituciones', id);
    this._mem = d || this.initVacio();
  },

  async addInst(nombre, vigencia){
    const id = 'inst_' + uid();
    this._meta.instituciones.push({id, nombre, vigencia: vigencia||''});
    this._meta.activeId = id;
    await this.saveMeta();
    // Sync con Supabase
    if (typeof SB !== 'undefined' && SB.isActive()){
      await SB.createInst(id, nombre, this.initVacio(nombre));
    }
    return id;
  },

  async renameInst(id, nombre, vigencia){
    const inst = this._meta.instituciones.find(i => i.id === id);
    if (inst){ inst.nombre = nombre; if(vigencia !== undefined) inst.vigencia = vigencia; }
    await this.saveMeta();
    if (typeof SB !== 'undefined' && SB.isActive()) SB.renameInst(id, nombre);
  },

  async deleteInst(id){
    this._meta.instituciones = this._meta.instituciones.filter(i => i.id !== id);
    await this._del('instituciones', id);
    if (typeof SB !== 'undefined' && SB.isActive()) SB.deleteInst(id);
    if (this._meta.activeId === id){
      this._meta.activeId = this._meta.instituciones.length
        ? this._meta.instituciones[0].id : '';
      if (this._meta.activeId){
        const d = await this._get('instituciones', this._meta.activeId);
        this._mem = d || this.initVacio();
      } else {
        this._mem = null;
      }
    }
    await this.saveMeta();
  },

  /* ── CRUD datos institución (síncrono via cache) ── */
  load(){
    if (!this._mem) this._mem = this.initVacio();
    // Validar estructura mínima (previene crashes por datos incompletos)
    if(typeof _validarDatos === 'function') _validarDatos(this._mem);
    // Inyectar personas compartidas para acceso síncrono
    this._mem.personas = this._personas || [];
    return this._mem;
  },

  save(d){
    // Protección: si no se pasa argumento, usar _mem actual
    if(!d) d = this._mem;
    if(!d || typeof d !== 'object' || !d.config){
      console.error('DB.save() — datos inválidos, operación cancelada');
      if(typeof toast === 'function') toast('Error interno: datos inválidos, no se guardó','danger');
      return;
    }
    // Validar estructura mínima
    if(typeof _validarDatos === 'function') _validarDatos(d);
    this._mem = d;
    // Incrementar cambios
    if (this._meta) this._meta.cambios = (this._meta.cambios||0) + 1;
    // Registrar en historial de auditoría
    if(typeof _registrarAuditoria === 'function') _registrarAuditoria(d);
    // Backup de emergencia en localStorage
    try {
      localStorage.setItem('fose_emergency_backup', JSON.stringify({
        ts: Date.now(), fecha: new Date().toLocaleString('es-CO'),
        instId: this.getActiveId(), instNombre: (d.config||{}).institucion||'',
        data: d, personas: this._personas || []
      }));
    } catch(e){ /* localStorage lleno — ignorar */ }
    // Persistir asincrónicamente en IndexedDB
    const id = this.getActiveId();
    if (id && this._db){
      this._put('instituciones', id, d).catch(e => {
        console.error('DB save error:', e);
        if(typeof toast === 'function') toast('Error guardando en base de datos. Verifique espacio en disco.','danger');
      });
      this.saveMeta().catch(e => console.error('DB meta save error:', e));
      // Sync con Supabase (debounceado)
      if (typeof SB !== 'undefined' && SB.isActive()) SB.saveInstData(id, d);
    }
  },

  getChg(){ return (this._meta||{}).cambios || 0; },
  resetChg(){
    if (this._meta) this._meta.cambios = 0;
    this.saveMeta().catch(() => {});
  },

  /* ── Precargar institución activa en memoria ── */
  async preload(){
    const id = this.getActiveId();
    if (id){
      const d = await this._get('instituciones', id);
      this._mem = d || this.initVacio();
    }
    // Cargar UNSPSC: primero desde IndexedDB, si no existe desde archivo JSON
    await this.loadUNSPSC();
    if(!this._unspsc || this._unspsc.length === 0){
      try {
        const resp = await fetch('data/unspsc.json');
        if(resp.ok){
          const arr = await resp.json();
          // Normalizar campos del JSON al formato interno
          this._unspsc = arr.map(u => ({
            codigo: u.codigo_producto || u.codigo || '',
            nombre: u.nombre_producto || u.nombre || '',
            clase: u.nombre_clase || '',
            familia: u.nombre_familia || '',
            segmento_nombre: u.nombre_segmento || ''
          }));
          await this.saveUNSPSC(this._unspsc);
        }
      } catch(e){ console.warn('No se pudo cargar UNSPSC:', e); }
    }
  },

  /* ── Estructura vacía de una institución ── */
  initVacio(nombre, nit, rector, idRector, dv, depto, mpio, dir, email, vigencia){
    return {
      config: {
        secretaria: 'SECRETARÍA DE EDUCACIÓN',
        institucion: nombre || '',
        nit: nit || '',
        dv: dv || '',
        departamento: depto || '',
        municipio: mpio || '',
        direccion: dir || '',
        email: email || '',
        rector: rector || '',
        idRector: idRector || '',
        vigencia: vigencia || String(new Date().getFullYear()),
        smlv: 1423500,
        ciudad: mpio || '',
        acuerdo: '',
        cierre: {numero:'',fecha:'',fundamento:'',cuentas:[],por_pagar:[]}
      },
      rubros: [],
      rubros_ing: [],
      mods: {},
      mods_eg: [],
      mods_ing: {},
      mods_ing_form: [],
      contratos: [],    // gastos simples (ex-FOSE contratos)
      ingresos: [],
      recaudos_ing_mes: {},
      compromisos_eg: [],
      cdps_eg: [],        // disponibilidades (CDPs) por rubro/trimestre
      pagos_eg: [],
      contratos_full: [], // contratos detallados (91 campos del SQLite)
      pagos_dian: [],      // pagos a DIAN / impuestos (egresos no contractuales)
      acuerdos: [],        // acuerdos presupuestales
      _adiciones_banco: [],// adiciones desde extracto bancario
      /* ── SIFSE — Reporte al Ministerio de Educación ── */
      sifse_catalogo: {
        fuentes: [
          {cod:1,nom:'Ingresos operacionales'},{cod:2,nom:'Gratuidad'},
          {cod:3,nom:'Otras transferencias recursos públicos'},
          {cod:4,nom:'Cobros ciclo complementario escuelas normales'},
          {cod:6,nom:'Transferencia municipales de calidad SGP'},
          {cod:28,nom:'FOME'},
          {cod:32,nom:'Superávit-Gratuidad'},{cod:33,nom:'Superávit-Recursos Propios'},
          {cod:34,nom:'Superávit-FOME'},
          {cod:35,nom:'Rendimientos Financieros-Gratuidad'},
          {cod:36,nom:'Rendimientos Financieros-Recursos Propios'},
          {cod:37,nom:'Rendimientos Financieros-FOME'},
          {cod:38,nom:'Reintegros-Gratuidad'},{cod:39,nom:'Reintegros-Recursos Propios'},
          {cod:40,nom:'Reintegros-FOME'},{cod:41,nom:'Otros Recursos de Capital'}
        ],
        gastos: [
          {cod:7,nom:'Adquisición de bienes'},{cod:8,nom:'Arrendamiento de bienes'},
          {cod:9,nom:'Acueducto, alcantarillado y aseo'},{cod:10,nom:'Energía'},
          {cod:11,nom:'Teléfono'},{cod:12,nom:'Internet'},
          {cod:13,nom:'Otros servicios públicos'},{cod:14,nom:'Seguros'},
          {cod:15,nom:'Contratación de servicios técnicos profesionales'},
          {cod:16,nom:'Impresos y publicaciones'},
          {cod:17,nom:'Horas cátedra ciclo complementario'},
          {cod:18,nom:'Otros gastos generales'},
          {cod:19,nom:'Construcción ampliación y adecuación de infraestructura'},
          {cod:20,nom:'Mantenimiento de infraestructura educativa'},
          {cod:21,nom:'Dotación institucional de infraestructura'},
          {cod:22,nom:'Dotación material y medios pedagógicos'},
          {cod:23,nom:'Transporte escolar'},
          {cod:24,nom:'Sostenimiento de semovientes y proyectos pedagógicos'},
          {cod:25,nom:'Alimentación para jornada extendida'},
          {cod:26,nom:'Actividades pedagógicas'},
          {cod:27,nom:'Acciones de mejoramiento gestión escolar y académica'},
          {cod:29,nom:'Elementos de Protección Personal (EPP)'},
          {cod:30,nom:'Condiciones Sanitarias'},
          {cod:31,nom:'Adecuación de Infraestructura (Emergencia)'}
        ]
      },
      sifse_map_eg: {},     // {"2.1.2.01": {fuente:2, gasto:7}, ...}
      sifse_map_ing: {}     // {"1.1.01": 2, ...}
    };
  },

  /* ── Personas (compartidas entre instituciones) ── */
  async loadPersonas(){
    if (this._personas) return this._personas;
    // Intentar cargar desde Supabase primero
    if (typeof SB !== 'undefined' && SB.isActive()){
      try {
        const cloud = await SB.fetchPersonas();
        if (cloud && cloud.length > 0){
          this._personas = cloud;
          await this._put('personas', 'all', cloud);
          return this._personas;
        }
      } catch(e){ console.warn('loadPersonas cloud error:', e); }
    }
    // Cargar desde local
    const p = await this._get('personas', 'all');
    this._personas = p || [];
    // Si hay personas locales pero no en la nube, subirlas
    if (this._personas.length > 0 && typeof SB !== 'undefined' && SB.isActive()){
      SB.savePersonas(this._personas);
    }
    return this._personas;
  },
  async savePersonas(arr){
    this._personas = arr;
    await this._put('personas', 'all', arr);
    if (typeof SB !== 'undefined' && SB.isActive()) SB.savePersonas(arr);
  },

  /* ── UNSPSC (carga bajo demanda) ── */
  async loadUNSPSC(){
    if (this._unspsc) return this._unspsc;
    const u = await this._get('unspsc', 'catalogo');
    this._unspsc = u || [];
    return this._unspsc;
  },
  async saveUNSPSC(arr){
    this._unspsc = arr;
    await this._put('unspsc', 'catalogo', arr);
  },
  searchUNSPSC(query, limit=30){
    if (!this._unspsc || !query) return [];
    const q = query.toLowerCase();
    const results = [];
    for (let i=0; i<this._unspsc.length && results.length<limit; i++){
      const u = this._unspsc[i];
      if ((u.codigo && u.codigo.includes(q)) ||
          (u.nombre && u.nombre.toLowerCase().includes(q))){
        results.push(u);
      }
    }
    return results;
  },

  /* ── Exportar todos los datos (para backup) ── */
  async exportarTodo(){
    const result = {meta: this._meta, instituciones: {}, personas: this._personas||[]};
    for (const inst of this.getInstituciones()){
      const d = await this._get('instituciones', inst.id);
      if (d) result.instituciones[inst.id] = d;
    }
    return result;
  },

  /* ── Importar datos completos (restaurar backup) ── */
  async importarTodo(data){
    if (data.meta){
      this._meta = data.meta;
      await this.saveMeta();
    }
    if (data.instituciones){
      for (const [id, d] of Object.entries(data.instituciones)){
        await this._put('instituciones', id, d);
      }
    }
    if (data.personas){
      await this.savePersonas(data.personas);
    }
    await this.preload();
  },

  /* ── Cargar todo desde Supabase ── */
  async loadFromSupabase(){
    if (typeof SB === 'undefined' || !SB.isActive()) return false;
    try {
      // Cargar lista de instituciones
      const instList = await SB.fetchInstituciones();
      if (!instList.length) return false;

      // Cargar meta
      const meta = await SB.fetchMeta();
      // Respetar activeId local si ya fue cambiado por setActive()
      let localActiveId = this._meta && this._meta.activeId ? this._meta.activeId : null;
      // Fallback: si cambiarInstitucion guardó en localStorage
      if(!localActiveId){ try { const ls = localStorage.getItem('fose_activeId'); if(ls){ localActiveId = ls; localStorage.removeItem('fose_activeId'); } } catch(e){} }
      this._meta = {
        instituciones: instList.map(i => ({id: i.id, nombre: i.nombre, vigencia: i.vigencia||''})),
        activeId: localActiveId || (meta && meta.active_inst_id) || instList[0].id,
        cambios: (meta && meta.cambios) || 0
      };

      // Cargar datos de institución activa
      const data = await SB.fetchInstData(this._meta.activeId);
      this._mem = data || this.initVacio();

      // Cargar personas
      this._personas = await SB.fetchPersonas();

      // Guardar en IndexedDB local (cache para carga rápida)
      await this.saveMeta();
      await this._put('instituciones', this._meta.activeId, this._mem);
      await this._put('personas', 'all', this._personas);

      return true;
    } catch(e){
      console.error('loadFromSupabase error:', e);
      return false;
    }
  },

  /* ── Migrar desde localStorage (FOSE legacy) ── */
  async migrarDesdeLocalStorage(){
    const listK = 'fose_v4_instituciones';
    const actK  = 'fose_v4_activa';
    const raw = localStorage.getItem(listK);
    if (!raw) return false;
    try {
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || !list.length) return false;
      this._meta.instituciones = list;
      this._meta.activeId = localStorage.getItem(actK) || list[0].id;
      await this.saveMeta();
      for (const inst of list){
        const dataRaw = localStorage.getItem('fose_v4_inst_' + inst.id);
        if (dataRaw){
          const d = JSON.parse(dataRaw);
          // Asegurar estructura unificada
          if (!d.contratos_full) d.contratos_full = [];
          if (!d.pagos_eg) d.pagos_eg = [];
          if (!d.compromisos_eg) d.compromisos_eg = [];
          if (!d.cdps_eg) d.cdps_eg = [];
          await this._put('instituciones', inst.id, d);
        }
      }
      await this.preload();
      return true;
    } catch(e){
      console.error('Error migración localStorage:', e);
      return false;
    }
  }
};
