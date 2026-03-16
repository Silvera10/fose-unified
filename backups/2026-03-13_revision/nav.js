/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Navegación entre páginas
══════════════════════════════════════════════════════════ */

let _currentPage = 'dash';

function navTo(pageId, link){
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Mostrar la seleccionada
  const page = $('page-'+pageId);
  if (page) page.classList.add('active');
  // Actualizar sidebar
  document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
  if (link) link.classList.add('active');
  else {
    const el = document.querySelector(`.sidebar .nav-link[data-page="${pageId}"]`);
    if (el) el.classList.add('active');
  }
  _currentPage = pageId;
  // Renderizar la página si es necesario
  _renderPage(pageId);
  // Scroll al inicio
  window.scrollTo(0,0);
}

function _renderPage(pageId){
  if (!DB._mem) return;
  switch(pageId){
    case 'dash':       if (typeof R !== 'undefined' && R.dash) R.dash(); break;
    case 'general':    if (typeof R !== 'undefined' && R.general) R.general(); break;
    case 'ingresos':   if (typeof R !== 'undefined' && R.ingresosGeneral) R.ingresosGeneral(); break;
    case 'trim1':      if (typeof R !== 'undefined' && R.trimestre) R.trimestre(1); break;
    case 'trim2':      if (typeof R !== 'undefined' && R.trimestre) R.trimestre(2); break;
    case 'trim3':      if (typeof R !== 'undefined' && R.trimestre) R.trimestre(3); break;
    case 'trim4':      if (typeof R !== 'undefined' && R.trimestre) R.trimestre(4); break;
    case 'contratos':  if (typeof R !== 'undefined' && R.contratos) R.contratos(); break;
    case 'personas':   if (typeof R !== 'undefined' && R.personas) R.personas(); break;
    case 'pagos-dian': if (typeof R !== 'undefined' && R.pagosDian) R.pagosDian(); break;
    case 'acuerdos':   if (typeof R !== 'undefined' && R.acuerdos) R.acuerdos(); break;
    case 'informes':   if (typeof R !== 'undefined' && R.informe) R.informe(); break;
    case 'sifse':      if (typeof R !== 'undefined' && R.sifse) R.sifse(); break;
    case 'conciliacion': if (typeof R !== 'undefined' && R.conciliacion) R.conciliacion(); break;
    case 'auditoria':  if (typeof R !== 'undefined' && R.auditoria) R.auditoria(); break;
    case 'config':     if (typeof R !== 'undefined' && R.config) R.config(); break;
  }
}

function navUpdate(){
  const d = DB.load();
  const c = d.config;
  const nom = $('nav-inst-nombre');
  if (nom) nom.textContent = c.institucion || '';
  const vig = $('nav-vig');
  if (vig) vig.textContent = c.vigencia || '';
}
