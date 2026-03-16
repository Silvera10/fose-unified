/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Configuración (render)
══════════════════════════════════════════════════════════ */

R.config = function(){
  const d = DB.load();
  const c = d.config;
  const el = $('page-config');
  if (!el) return;

  // Helper para secciones acordeón
  const _acc = (id, icon, title, color, body, open) =>
    `<div class="accordion-item mb-2" style="border-radius:8px;overflow:hidden;border:1px solid #dee2e6">
      <h2 class="accordion-header">
        <button class="accordion-button ${open?'':'collapsed'}" type="button"
          data-bs-toggle="collapse" data-bs-target="#acc-${id}"
          style="padding:8px 12px;font-size:13px;font-weight:600;background:${color};color:#fff">
          <i class="bi ${icon} me-2"></i>${title}
        </button>
      </h2>
      <div id="acc-${id}" class="accordion-collapse collapse ${open?'show':''}">
        <div class="accordion-body" style="padding:12px">${body}</div>
      </div>
    </div>`;

  // ═══ 1. INSTITUCIONES — Tarjetas ═══
  const instBody = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="small text-muted">${DB.getInstituciones().length} institución(es) registrada(s)</span>
      <button class="btn btn-primary btn-sm" onclick="abrirModalInstForm()"><i class="bi bi-plus-lg me-1"></i>Nueva Institución</button>
    </div>
    <div class="row g-2" id="inst-lista"></div>`;

  // ═══ 2. INSTITUCIÓN ACTIVA ═══
  const activaBody = `
    <div style="font-size:12px">
      <div class="row g-1">
        <div class="col-md-12"><strong style="font-size:14px">${c.institucion||'Sin nombre'}</strong>
          ${c.secretaria?` <span class="text-muted">| ${c.secretaria}</span>`:''}</div>
      </div>
      <div class="row g-1 mt-2">
        <div class="col-md-3"><span class="text-muted">NIT:</span> <strong>${c.nit||'—'}${c.dv?'-'+c.dv:''}</strong></div>
        <div class="col-md-3"><span class="text-muted">Rector(a):</span> <strong>${c.rector||'—'}</strong></div>
        <div class="col-md-2"><span class="text-muted">CC:</span> ${c.idRector||'—'}</div>
        <div class="col-md-2"><span class="text-muted">Vigencia:</span> <strong>${c.vigencia||'—'}</strong></div>
        <div class="col-md-2"><span class="text-muted">SMLV:</span> ${fmt(c.smlv||0)}</div>
      </div>
      <div class="row g-1 mt-1">
        <div class="col-md-3"><span class="text-muted">Depto:</span> ${c.departamento||'—'}</div>
        <div class="col-md-3"><span class="text-muted">Municipio:</span> ${c.municipio||'—'}</div>
        <div class="col-md-3"><span class="text-muted">DANE:</span> ${c.ciudad||'—'}</div>
        <div class="col-md-3"><span class="text-muted">Dir:</span> ${c.direccion||'—'}</div>
      </div>
      ${c.acuerdo||c.fecha_paa||c.fecha_mod_paa?`<div class="row g-1 mt-1">
        <div class="col-md-4"><span class="text-muted">Acuerdo:</span> ${c.acuerdo||'—'}</div>
        <div class="col-md-4"><span class="text-muted">Aprob. PAA:</span> ${c.fecha_paa||'—'}</div>
        <div class="col-md-4"><span class="text-muted">Modif. PAA:</span> ${c.fecha_mod_paa||'—'}</div>
      </div>`:''}
      <div class="mt-2">
        <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:10px" onclick="abrirModalInstForm(DB.getActiveId())"><i class="bi bi-pencil me-1"></i>Editar Institución</button>
      </div>
    </div>`;

  // ═══ 3. BACKUP ═══
  const backupBody = `
    <div class="d-flex gap-2 flex-wrap mb-2">
      <button class="btn btn-success btn-sm" onclick="exportarTodas()"><i class="bi bi-download me-1"></i>Exportar Backup JSON</button>
      <button class="btn btn-outline-primary btn-sm" onclick="$('inp-restore').click()"><i class="bi bi-upload me-1"></i>Restaurar Backup</button>
      <input type="file" id="inp-restore" class="d-none" accept=".json" onchange="restaurarBackup(this)">
      <button class="btn btn-outline-success btn-sm" onclick="backupHTML()"><i class="bi bi-file-earmark-code me-1"></i>Backup HTML</button>
    </div>
    <div id="backup-alert" class="alert alert-warning small py-1 d-none">
      <i class="bi bi-exclamation-triangle me-1"></i><span id="backup-alert-msg"></span>
    </div>
    <div class="small text-muted" id="backup-carpeta-lbl">No configurada</div>`;

  // ═══ 4. IMPORTAR ═══
  const importBody = `
    <div class="d-flex gap-2 flex-wrap mb-2">
      <button class="btn btn-outline-warning btn-sm" onclick="$('inp-fose').click()"><i class="bi bi-filetype-html me-1"></i>Importar FOSE HTML</button>
      <input type="file" id="inp-fose" class="d-none" accept=".html,.htm" onchange="importarFOSE(this)">
      <button class="btn btn-outline-info btn-sm" onclick="$('inp-sqlite').click()"><i class="bi bi-filetype-json me-1"></i>Importar SQLite JSON</button>
      <input type="file" id="inp-sqlite" class="d-none" accept=".json" onchange="importarSQLiteJSON(this)">
      <button class="btn btn-outline-secondary btn-sm" onclick="cargarUNSPSC()"><i class="bi bi-tag me-1"></i>Cargar Catálogo UNSPSC</button>
    </div>
    <div id="import-progress" class="d-none">
      <div class="progress" style="height:8px"><div class="progress-bar" id="import-bar" style="width:0%"></div></div>
      <div class="small text-muted mt-1" id="import-msg"></div>
    </div>`;

  // ═══ 5. MULTI-VIGENCIA ═══
  const vigBody = `
    <p class="small text-muted mb-2">Cree una copia de la institución activa para una nueva vigencia fiscal. Se copiarán rubros y configuración, pero NO contratos, pagos ni ejecución.</p>
    <div class="d-flex gap-2 align-items-end">
      <div>
        <label class="form-label small fw-bold mb-0">Nueva Vigencia (año)</label>
        <input type="number" class="form-control form-control-sm" id="inp-nueva-vigencia" min="2020" max="2035" value="${Number(c.vigencia||2026)+1}" style="width:100px">
      </div>
      <button class="btn btn-warning btn-sm" onclick="duplicarVigencia($('inp-nueva-vigencia').value)"><i class="bi bi-copy me-1"></i>Crear Vigencia</button>
    </div>`;

  el.innerHTML = `
    <h5 class="mb-3"><i class="bi bi-gear me-2" style="color:var(--azul)"></i>Configuración del Sistema</h5>
    <div class="accordion" id="acc-config">
      ${_acc('inst',    'bi-building',        'Instituciones Educativas',  'linear-gradient(135deg,#1a3a5c,#2980b9)', instBody,   true)}
      ${_acc('activa',  'bi-building-check',  'Institución Activa',       'linear-gradient(135deg,#1a7a3a,#27ae60)', activaBody, true)}
      ${_acc('backup',  'bi-shield-check',    'Respaldo y Restauración',  'linear-gradient(135deg,#555,#777)',       backupBody, false)}
      ${_acc('import',  'bi-box-arrow-in-down','Importar Datos',          'linear-gradient(135deg,#c8960c,#f1c40f)', importBody, false)}
      ${_acc('vigencia','bi-calendar-range',  'Multi-Vigencia',           'linear-gradient(135deg,#c8960c,#f39c12)', vigBody,    false)}
    </div>
    <div class="card mt-2">
      <div class="card-body py-2">
        <div class="d-flex justify-content-between align-items-center">
          <span class="small text-muted">FOSE Unified v1.0 — Sistema de Control Presupuestal para FSE</span>
          <span class="small text-muted">Cambios sin respaldar: <strong>${DB.getChg()}</strong></span>
        </div>
      </div>
    </div>`;

  renderListaInstituciones();
};
