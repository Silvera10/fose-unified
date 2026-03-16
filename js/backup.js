/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Backup y Restauración
══════════════════════════════════════════════════════════ */

/* ── Exportar backup JSON completo ── */
async function exportarTodas(){
  try {
    const data = await DB.exportarTodo();
    data._format = 'fose_unified_v1';
    data._date = new Date().toISOString();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const c = DB.load().config;
    a.href = url;
    a.download = `fose_backup_${(c.institucion||'app').replace(/\s+/g,'_')}_${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    DB.resetChg();
    actualizarBtnBackup(0);
    toast('Backup exportado');
  } catch(e){
    toast('Error al exportar: ' + e.message, 'danger');
  }
}

/* ── Restaurar backup JSON ── */
async function restaurarBackup(input){
  const file = input.files[0];
  if(!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if(data._format !== 'fose_unified_v1'){
      toast('Formato de backup no reconocido','danger'); return;
    }
    if(!confirm('Restaurar este backup reemplazará TODOS los datos actuales. ¿Continuar?')) return;
    await DB.importarTodo(data);
    navUpdate();
    recargarApp();
    toast('Backup restaurado exitosamente');
  } catch(e){
    toast('Error al restaurar: ' + e.message, 'danger');
  }
  input.value = '';
}

/* ── Backup HTML (programa + datos en un solo archivo) ── */
async function backupHTML(){
  try {
    const data = await DB.exportarTodo();
    data._format = 'fose_unified_v1';
    data._date = new Date().toISOString();

    // Obtener HTML actual
    let html = document.documentElement.outerHTML;

    // Insertar datos como script JSON dentro del HTML
    const dataScript = `<script id="fose-backup-embed" type="application/json">${JSON.stringify(data)}<\/script>`;
    html = html.replace('</body>', dataScript + '\n</body>');
    html = '<!DOCTYPE html>\n' + html;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const c = DB.load().config;
    a.href = url;
    a.download = `fose_${(c.institucion||'app').replace(/\s+/g,'_')}_${c.vigencia||''}_backup_${today()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup HTML exportado');
  } catch(e){
    toast('Error al exportar HTML: ' + e.message, 'danger');
  }
}

/* ── Actualizar botón de backup ── */
function actualizarBtnBackup(n){
  const badge = $('badge-chg');
  if(!badge) return;
  if(n > 0){
    badge.textContent = n;
    badge.classList.remove('d-none');
    $('btn-exportar').classList.replace('btn-success','btn-warning');
  } else {
    badge.classList.add('d-none');
    $('btn-exportar').classList.replace('btn-warning','btn-success');
  }
}

/* ── Verificar backup al inicio ── */
function verificarBackupAlInicio(){
  const n = DB.getChg();
  if(n > 0) actualizarBtnBackup(n);
}

function recargarApp(){
  DB._mem = null;
  const loadFn = (typeof SB !== 'undefined' && SB.isActive())
    ? DB.loadFromSupabase() : DB.preload();
  loadFn.then(() => {
    navUpdate();
    _renderPage(_currentPage);
  });
}

function cambiarInstitucion(id){
  DB.setActive(id).then(() => {
    recargarApp();
    toast('Institución cargada');
  });
}

/* ── Multi-Institución ── */
function renderListaInstituciones(){
  const list = DB.getInstituciones();
  const actId = DB.getActiveId();
  const el = $('inst-lista');
  if(!el) return;
  if(!list.length){
    el.innerHTML = '<div class="col-12"><p class="text-muted small">Sin instituciones</p></div>';
    return;
  }
  // Obtener vigencia real desde los datos de cada institución
  const tarjetas = list.map(i => {
    const esActiva = i.id===actId;
    const vig = i.vigencia || '';
    const borde = esActiva ? 'border:2px solid #27ae60' : 'border:1px solid #dee2e6';
    const bg = esActiva ? 'background:linear-gradient(135deg,#f1f8e9,#e8f5e9)' : 'background:#fff';
    return `<div class="col-md-6">
      <div class="card h-100" style="${borde};${bg};border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s"
        onclick="cambiarInstitucion('${i.id}')"
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,.15)'"
        onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1" style="font-size:13px;font-weight:700">
                <i class="bi bi-building me-1" style="color:${esActiva?'#27ae60':'#1a3a5c'}"></i>${i.nombre}
              </h6>
              ${esActiva?'<span class="badge bg-success" style="font-size:9px">ACTIVA</span>':'<span class="badge bg-secondary" style="font-size:9px">INACTIVA</span>'}
              ${vig?` <span class="badge bg-primary" style="font-size:9px">Vigencia ${vig}</span>`:''}
            </div>
            <div class="d-flex gap-1" onclick="event.stopPropagation()">
              <button class="btn btn-outline-warning btn-sm py-0 px-1" style="font-size:10px" onclick="abrirModalInstForm('${i.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
              ${list.length>1?`<button class="btn btn-outline-danger btn-sm py-0 px-1" style="font-size:10px" onclick="eliminarInstitucion('${i.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>`:''}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  el.innerHTML = tarjetas;

  // Actualizar dropdown del navbar
  const dd = $('dd-instituciones');
  if(dd){
    dd.innerHTML = list.map(i =>
      `<li><a class="dropdown-item ${i.id===actId?'active':''}" href="#" onclick="cambiarInstitucion('${i.id}');return false">${i.nombre}${i.vigencia?' <small class="text-muted">('+i.vigencia+')</small>':''}</a></li>`
    ).join('');
  }
}

function toggleCopiarRubros(){
  const activo = $('chk-copiar-rubros').checked;
  $('div-inst-origen').classList.toggle('d-none', !activo);
  if(activo){
    const list = DB.getInstituciones();
    $('sel-inst-origen').innerHTML = list.map(i=>`<option value="${i.id}">${i.nombre}</option>`).join('');
  }
}

function abrirModalInstForm(id=null){
  $('inp-inst-id').value = id||'';
  $('inp-inst-sec').value = ''; $('inp-inst-nueva').value = '';
  $('inp-inst-nit').value = ''; $('inp-inst-dv').value = '';
  $('inp-inst-depto').value = ''; $('inp-inst-mpio').value = '';
  $('inp-inst-ciu').value = ''; $('inp-inst-dir').value = '';
  $('inp-inst-email').value = '';
  $('inp-inst-vigencia').value = String(new Date().getFullYear());
  $('inp-inst-rector').value = ''; $('inp-inst-idrector').value = '';
  $('inp-inst-smlv').value = 1423500;
  $('inp-inst-acuerdo').value = '';
  $('inp-inst-fecha-paa').value = ''; $('inp-inst-fecha-mod-paa').value = '';
  $('chk-copiar-rubros').checked = false;
  $('div-inst-origen').classList.add('d-none');
  window._firmaRectorBase64 = '';
  _mostrarPreviewFirma('');

  if(id){
    const inst = DB.getInstituciones().find(i=>i.id===id);
    if(inst) $('inp-inst-nueva').value = inst.nombre;
    if(id === DB.getActiveId()){
      const c = DB.load().config;
      $('inp-inst-sec').value = c.secretaria||'';
      $('inp-inst-nit').value = c.nit||''; $('inp-inst-dv').value = c.dv||'';
      $('inp-inst-depto').value = c.departamento||''; $('inp-inst-mpio').value = c.municipio||'';
      $('inp-inst-ciu').value = c.ciudad||''; $('inp-inst-dir').value = c.direccion||'';
      $('inp-inst-email').value = c.email||'';
      $('inp-inst-vigencia').value = c.vigencia||''; $('inp-inst-rector').value = c.rector||'';
      $('inp-inst-idrector').value = c.idRector||'';
      $('inp-inst-smlv').value = c.smlv||1423500;
      $('inp-inst-acuerdo').value = c.acuerdo||'';
      $('inp-inst-fecha-paa').value = c.fecha_paa||'';
      $('inp-inst-fecha-mod-paa').value = c.fecha_mod_paa||'';
      // Mostrar preview de firma si existe
      window._firmaRectorBase64 = c.firma_rector||'';
      _mostrarPreviewFirma(c.firma_rector||'');
      // Cargar cuentas bancarias
      $('inp-inst-banco1').value = c.banco_1||'';
      $('inp-inst-cta1').value = c.cuenta_1||'';
      $('inp-inst-tipocta1').value = c.tipo_cuenta_1||'Ahorros';
      $('inp-inst-banco2').value = c.banco_2||'';
      $('inp-inst-cta2').value = c.cuenta_2||'';
      $('inp-inst-tipocta2').value = c.tipo_cuenta_2||'Ahorros';
      $('inp-inst-banco3').value = c.banco_3||'';
      $('inp-inst-cta3').value = c.cuenta_3||'';
      $('inp-inst-tipocta3').value = c.tipo_cuenta_3||'Ahorros';
    }
    $('tit-minst').textContent = 'Editar Institución';
    $('div-copiar-rubros-bloque').classList.add('d-none');
  } else {
    $('tit-minst').textContent = 'Nueva Institución Educativa';
    $('div-copiar-rubros-bloque').classList.remove('d-none');
  }
  new bootstrap.Modal($('mInst')).show();
}

async function guardarInstitucion(){
  const editId = $('inp-inst-id').value.trim();
  const nombre = $('inp-inst-nueva').value.trim();
  if(!nombre){ toast('El nombre es obligatorio','warning'); return; }

  // Recoger todos los campos del formulario unificado
  const campos = {
    secretaria: $('inp-inst-sec').value.trim(),
    institucion: nombre,
    nit: $('inp-inst-nit').value.trim(),
    dv: $('inp-inst-dv').value.trim(),
    departamento: $('inp-inst-depto').value.trim(),
    municipio: $('inp-inst-mpio').value.trim(),
    ciudad: $('inp-inst-ciu').value.trim(),
    direccion: $('inp-inst-dir').value.trim(),
    email: $('inp-inst-email').value.trim(),
    rector: $('inp-inst-rector').value.trim(),
    idRector: $('inp-inst-idrector').value.trim(),
    vigencia: $('inp-inst-vigencia').value.trim(),
    smlv: Number($('inp-inst-smlv').value) || 1423500,
    acuerdo: $('inp-inst-acuerdo').value.trim(),
    fecha_paa: $('inp-inst-fecha-paa').value,
    fecha_mod_paa: $('inp-inst-fecha-mod-paa').value,
    firma_rector: window._firmaRectorBase64 || '',
    // Cuentas bancarias institucionales
    banco_1: $('inp-inst-banco1').value.trim(),
    cuenta_1: $('inp-inst-cta1').value.trim(),
    tipo_cuenta_1: $('inp-inst-tipocta1').value,
    banco_2: $('inp-inst-banco2').value.trim(),
    cuenta_2: $('inp-inst-cta2').value.trim(),
    tipo_cuenta_2: $('inp-inst-tipocta2').value,
    banco_3: $('inp-inst-banco3').value.trim(),
    cuenta_3: $('inp-inst-cta3').value.trim(),
    tipo_cuenta_3: $('inp-inst-tipocta3').value
  };

  if(editId){
    await DB.renameInst(editId, nombre, campos.vigencia);
    if(editId === DB.getActiveId()){
      const d = DB.load();
      const oldCierre = d.config.cierre || {};
      Object.assign(d.config, campos);
      d.config.cierre = oldCierre;
      DB.save(d);
    }
    bootstrap.Modal.getInstance($('mInst')).hide();
    navUpdate(); renderListaInstituciones();
    if(typeof R !== 'undefined' && R.config) R.config();
    toast(`Institución "${nombre}" actualizada`);
    return;
  }

  // Crear nueva
  const id = await DB.addInst(nombre, campos.vigencia);
  let d = DB.initVacio(nombre, campos.nit, campos.rector,
    campos.idRector, campos.dv, campos.departamento, campos.municipio,
    campos.direccion, campos.email, campos.vigencia
  );
  // Asignar campos adicionales
  d.config.secretaria = campos.secretaria;
  d.config.ciudad = campos.ciudad;
  d.config.smlv = campos.smlv;
  d.config.acuerdo = campos.acuerdo;
  d.config.fecha_paa = campos.fecha_paa;
  d.config.fecha_mod_paa = campos.fecha_mod_paa;

  if($('chk-copiar-rubros').checked){
    const origenId = $('sel-inst-origen').value;
    try {
      const origen = await DB._get('instituciones', origenId);
      if(origen){
        d.rubros = (origen.rubros||[]).map(r => ({cod:r.cod,guia:r.guia||'',con:r.con,tipo:r.tipo||'fun',esGrupo:r.esGrupo||false,ini:0,
          cuenta_contable:r.cuenta_contable||'',sifse_fuente:r.sifse_fuente||'',sifse_item:r.sifse_item||''}));
        d.rubros_ing = (origen.rubros_ing||[]).map(r => ({cod:r.cod,guia:r.guia||'',con:r.con,esGrupo:r.esGrupo||false,ini:0,
          en_banco:r.en_banco||false,sifse_fuente:r.sifse_fuente||''}));
        // Copiar mapeo SIFSE si existe
        if(origen.sifse_mapeo) d.sifse_mapeo = JSON.parse(JSON.stringify(origen.sifse_mapeo));
        d.mods = {};
        d.rubros.forEach(r => { d.mods[r.cod]={1:{adi:0,red:0,cre:0,cco:0},2:{adi:0,red:0,cre:0,cco:0},3:{adi:0,red:0,cre:0,cco:0},4:{adi:0,red:0,cre:0,cco:0}}; });
      }
    } catch(e){ console.warn('Error copiando rubros:', e); }
  }

  await DB._put('instituciones', id, d);
  await DB.setActive(id);
  bootstrap.Modal.getInstance($('mInst')).hide();
  navUpdate(); renderListaInstituciones(); recargarApp();
  toast(`Institución "${nombre}" creada`);
}

async function eliminarInstitucion(id){
  const inst = DB.getInstituciones().find(i=>i.id===id);
  if(!inst) return;
  if(id === DB.getActiveId() && DB.getInstituciones().length <= 1){
    toast('No puede eliminar la única institución activa','danger');
    return;
  }
  if(!confirm(`Eliminar "${inst.nombre}"? Se borrarán TODOS sus datos.`)) return;
  if(!confirm(`Segunda confirmación: ¿borrar "${inst.nombre}" permanentemente?`)) return;
  await DB.deleteInst(id);
  navUpdate(); renderListaInstituciones(); recargarApp();
  toast('Institución eliminada','warning');
}

/* ── Cierre presupuestal ── */
function cuentaRowHTML(i){
  return `<div class="ci-row row g-1 mb-1 align-items-center" data-idx="${i}">
    <div class="col-md-4"><input class="form-control form-control-sm" data-f="banco" placeholder="Banco"></div>
    <div class="col-md-3"><select class="form-select form-select-sm" data-f="tipo"><option>Ahorros</option><option>Corriente</option><option>Fiducia</option></select></div>
    <div class="col-md-3"><input class="form-control form-control-sm" data-f="numero" placeholder="N° Cuenta"></div>
    <div class="col-md-2 d-flex gap-1">
      <input type="number" class="form-control form-control-sm" data-f="saldo" placeholder="Saldo" min="0">
      <button class="btn btn-outline-danger btn-sm px-1" onclick="this.closest('.ci-row').remove()"><i class="bi bi-trash"></i></button>
    </div></div>`;
}

function pagarRowHTML(i){
  return `<div class="ci-row row g-1 mb-1 align-items-center" data-idx="${i}">
    <div class="col-md-8"><input class="form-control form-control-sm" data-f="concepto" placeholder="Concepto"></div>
    <div class="col-md-4 d-flex gap-1">
      <input type="number" class="form-control form-control-sm" data-f="valor" placeholder="Valor" min="0">
      <button class="btn btn-outline-danger btn-sm px-1" onclick="this.closest('.ci-row').remove()"><i class="bi bi-trash"></i></button>
    </div></div>`;
}

function addCuentaRow(){
  const cont=$('ci-cuentas-rows');
  cont.insertAdjacentHTML('beforeend', cuentaRowHTML(cont.querySelectorAll('.ci-row').length));
}

function addPagarRow(){
  const cont=$('ci-pagar-rows');
  cont.insertAdjacentHTML('beforeend', pagarRowHTML(cont.querySelectorAll('.ci-row').length));
}

function abrirModalCierre(){
  const d = DB.load();
  const ci = d.config.cierre || {};
  $('ci-numero').value = ci.numero||'';
  $('ci-fecha').value = ci.fecha||'';
  $('ci-ciudad').value = ci.ciudad!==undefined ? ci.ciudad : (d.config.ciudad||'');
  $('ci-fundamento').value = ci.fundamento||'Decreto 111 de 1996, Ley 715 de 2001';
  // Pre-cargar cuentas: del cierre, o de la config institucional si no hay
  let _cuentasCi = ci.cuentas || [];
  if(!_cuentasCi.length){
    _cuentasCi = [];
    const cfg = d.config;
    if(cfg.banco_1) _cuentasCi.push({ banco: cfg.banco_1, tipo: cfg.tipo_cuenta_1||'Ahorros', numero: cfg.cuenta_1||'', saldo: 0 });
    if(cfg.banco_2) _cuentasCi.push({ banco: cfg.banco_2, tipo: cfg.tipo_cuenta_2||'Ahorros', numero: cfg.cuenta_2||'', saldo: 0 });
    if(cfg.banco_3) _cuentasCi.push({ banco: cfg.banco_3, tipo: cfg.tipo_cuenta_3||'Ahorros', numero: cfg.cuenta_3||'', saldo: 0 });
  }
  $('ci-cuentas-rows').innerHTML = _cuentasCi.map((_,i)=>cuentaRowHTML(i)).join('');
  $('ci-pagar-rows').innerHTML = (ci.por_pagar||[]).map((_,i)=>pagarRowHTML(i)).join('');
  // Llenar valores
  _cuentasCi.forEach((c,i) => {
    const row = $('ci-cuentas-rows').querySelectorAll('.ci-row')[i];
    if(!row) return;
    const el=f=>row.querySelector(`[data-f="${f}"]`);
    if(el('banco')) el('banco').value=c.banco||'';
    if(el('tipo')) el('tipo').value=c.tipo||'Ahorros';
    if(el('numero')) el('numero').value=c.numero||'';
    if(el('saldo')) el('saldo').value=c.saldo||'';
  });
  (ci.por_pagar||[]).forEach((p,i) => {
    const row = $('ci-pagar-rows').querySelectorAll('.ci-row')[i];
    if(!row) return;
    const el=f=>row.querySelector(`[data-f="${f}"]`);
    if(el('concepto')) el('concepto').value=p.concepto||'';
    if(el('valor')) el('valor').value=p.valor||'';
  });
  new bootstrap.Modal($('mCierre')).show();
}

function guardarCierre(){
  const d = DB.load();
  const numero = $('ci-numero').value.trim();
  const fecha = $('ci-fecha').value;
  if(!numero){ toast('Ingrese N° de Resolución','warning'); return; }
  if(!fecha){ toast('Ingrese la fecha','warning'); return; }
  const cuentas = [];
  $('ci-cuentas-rows').querySelectorAll('.ci-row').forEach(row => {
    const banco=row.querySelector('[data-f="banco"]')?.value.trim()||'';
    const tipo=row.querySelector('[data-f="tipo"]')?.value||'Ahorros';
    const num=row.querySelector('[data-f="numero"]')?.value.trim()||'';
    const saldo=Number(row.querySelector('[data-f="saldo"]')?.value)||0;
    if(banco||num||saldo>0) cuentas.push({banco,tipo,numero:num,saldo});
  });
  const por_pagar = [];
  $('ci-pagar-rows').querySelectorAll('.ci-row').forEach(row => {
    const concepto=row.querySelector('[data-f="concepto"]')?.value.trim()||'';
    const valor=Number(row.querySelector('[data-f="valor"]')?.value)||0;
    if(concepto||valor>0) por_pagar.push({concepto,valor});
  });
  d.config.cierre = {numero,fecha,ciudad:$('ci-ciudad').value.trim(),fundamento:$('ci-fundamento').value.trim(),cuentas,por_pagar};
  DB.save(d);
  bootstrap.Modal.getInstance($('mCierre'))?.hide();
  // Regenerar informe si está en la vista de cierre
  if(typeof _renderInforme === 'function') _renderInforme();
  toast('Datos del cierre guardados');
}

/* ══════════════════════════════════════════════════════════
   FIRMA DEL RECTOR — Cargar imagen y preview
══════════════════════════════════════════════════════════ */
window._firmaRectorBase64 = '';

function _cargarFirmaRector(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(file.size > 500000){ toast('La imagen no debe superar 500KB','warning'); input.value=''; return; }
  const reader = new FileReader();
  reader.onload = function(e){
    window._firmaRectorBase64 = e.target.result;
    _mostrarPreviewFirma(e.target.result);
    toast('Firma cargada — recuerde guardar la institución');
  };
  reader.readAsDataURL(file);
}

function _mostrarPreviewFirma(base64){
  const el = $('prev-firma-rector');
  if(!el) return;
  if(base64){
    el.innerHTML = `<img src="${base64}" style="max-height:50px;max-width:200px;border:1px solid #ddd;border-radius:4px;padding:2px" alt="Firma">
      <button class="btn btn-outline-danger btn-sm py-0 px-1 ms-1" onclick="_quitarFirmaRector()" title="Quitar firma"><i class="bi bi-x"></i></button>`;
  } else {
    el.innerHTML = '<small class="text-muted">Sin firma cargada</small>';
  }
}

function _quitarFirmaRector(){
  window._firmaRectorBase64 = '';
  _mostrarPreviewFirma('');
  const inp = $('inp-inst-firma');
  if(inp) inp.value = '';
}
