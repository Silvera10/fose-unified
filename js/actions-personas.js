/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Acciones de Personas (CRUD)
══════════════════════════════════════════════════════════ */

function abrirModalPersona(id=null){
  $('tit-mper').textContent = id ? 'Editar Persona' : 'Nueva Persona';
  if(id){
    const p = (DB._personas||[]).find(x=>x.id===id);
    if(!p) return;
    $('mp-id').value = id;
    $('mp-nombre').value = p.nombre||'';
    $('mp-cargo').value = p.cargo||'';
    $('mp-tipodoc').value = p.tipodoc||'CC';
    $('mp-numdoc').value = p.numdoc||'';
    $('mp-telefono').value = p.telefono||p.celular||'';
    $('mp-email').value = p.email||'';
    $('mp-direccion').value = p.direccion||'';
    $('mp-municipio').value = p.municipio||'';
    $('mp-banco').value = p.banco||p.nombre_banco||'';
    $('mp-tipocuenta').value = p.tipo_cuenta||p.tipocuenta||'Ahorros';
    $('mp-numcuenta').value = p.numcuenta||p.cuenta_banco||p.cuenta_bancaria||'';
    $('mp-replegal').value = p.rep_legal||p.rep_legal_nombre||'';
    $('mp-replegal-cc').value = p.rep_legal_cc||p.rep_legal_num_documento||'';
  } else {
    $('mp-id').value = '';
    ['mp-nombre','mp-cargo','mp-numdoc','mp-telefono','mp-email','mp-direccion',
     'mp-municipio','mp-banco','mp-numcuenta','mp-replegal','mp-replegal-cc'
    ].forEach(id => $(id).value = '');
    $('mp-tipodoc').value = 'CC'; $('mp-tipocuenta').value = 'Ahorros';
  }
  new bootstrap.Modal($('mPersona')).show();
}

function guardarPersona(){
  const nombre = $('mp-nombre').value.trim();
  const numdoc = $('mp-numdoc').value.trim();
  if(!nombre||!numdoc){ toast('Nombre y Documento son obligatorios','danger'); return; }

  const p = {
    id: $('mp-id').value || uid(),
    nombre,
    cargo: $('mp-cargo').value.trim(),
    tipodoc: $('mp-tipodoc').value,
    numdoc,
    telefono: $('mp-telefono').value.trim(),
    celular: $('mp-telefono').value.trim(),
    email: $('mp-email').value.trim(),
    direccion: $('mp-direccion').value.trim(),
    municipio: $('mp-municipio').value.trim(),
    banco: $('mp-banco').value.trim(),
    nombre_banco: $('mp-banco').value.trim(),
    tipo_cuenta: $('mp-tipocuenta').value,
    cuenta_banco: $('mp-numcuenta').value.trim(),
    cuenta_bancaria: $('mp-numcuenta').value.trim(),
    rep_legal: $('mp-replegal').value.trim(),
    rep_legal_nombre: $('mp-replegal').value.trim(),
    rep_legal_cc: $('mp-replegal-cc').value.trim(),
    rep_legal_num_documento: $('mp-replegal-cc').value.trim()
  };

  const personas = DB._personas || [];
  const idx = personas.findIndex(x=>x.id===p.id);
  if(idx>=0) personas[idx]=p; else personas.push(p);
  DB.savePersonas(personas);
  bootstrap.Modal.getInstance($('mPersona')).hide();
  _actualizarDatalistPersonas();
  R.personas(); toast('Persona guardada');
}

function eliminarPersona(id){
  if(!confirm('Eliminar esta persona del directorio?')) return;
  const personas = (DB._personas||[]).filter(p=>p.id!==id);
  DB.savePersonas(personas);
  _actualizarDatalistPersonas();
  R.personas(); toast('Persona eliminada','warning');
}

/* ── Importar personas desde JSON (sistema_contractual SQLite export) ── */
function importarPersonasJSON(json){
  try {
    const arr = typeof json === 'string' ? JSON.parse(json) : json;
    if(!Array.isArray(arr) || !arr.length){
      toast('No se encontraron personas en el archivo','danger'); return 0;
    }
    const personas = DB._personas || [];
    let agregadas = 0;
    arr.forEach(r => {
      // Mapear campos del SQLite a formato FOSE Unified
      const p = {
        id: uid(),
        nombre: r.nombres_apellidos || r.nombre || '',
        cargo: r.cargo || '',
        tipodoc: r.tipo_documento || r.tipodoc || 'CC',
        numdoc: r.num_documento || r.numdoc || '',
        telefono: r.celular || r.telefono || '',
        celular: r.celular || r.telefono || '',
        email: r.email || '',
        direccion: r.direccion || '',
        municipio: r.municipio || '',
        banco: r.nombre_banco || r.banco || '',
        nombre_banco: r.nombre_banco || r.banco || '',
        tipo_cuenta: r.tipo_cuenta || 'Ahorros',
        cuenta_banco: r.cuenta_bancaria || r.cuenta_banco || r.numcuenta || '',
        cuenta_bancaria: r.cuenta_bancaria || r.cuenta_banco || r.numcuenta || '',
        rep_legal: r.rep_legal_nombre || r.rep_legal || '',
        rep_legal_nombre: r.rep_legal_nombre || r.rep_legal || '',
        rep_legal_cc: r.rep_legal_num_documento || r.rep_legal_cc || '',
        rep_legal_num_documento: r.rep_legal_num_documento || r.rep_legal_cc || ''
      };
      // Evitar duplicados: por num_documento si tiene, o por nombre si no tiene doc
      if(!p.nombre && !p.numdoc) return; // saltar filas vacías
      const yaExiste = p.numdoc
        ? personas.some(x => (x.numdoc||x.num_documento||'') === p.numdoc)
        : personas.some(x => (x.nombre||'').toLowerCase() === p.nombre.toLowerCase());
      if(!yaExiste){
        personas.push(p);
        agregadas++;
      }
    });
    DB.savePersonas(personas);
    _actualizarDatalistPersonas();
    return agregadas;
  } catch(e){
    console.error('Error importando personas:', e);
    toast('Error al importar: ' + e.message, 'danger');
    return 0;
  }
}

/* ── Actualizar datalist de personas para autocompletado ── */
function _actualizarDatalistPersonas(){
  const dl = $('dl-personas');
  if(!dl) return;
  const personas = DB._personas || [];
  dl.innerHTML = personas.map(p =>
    `<option value="${(p.nombre||'').replace(/"/g,'&quot;')}">${p.numdoc||''} — ${p.tipodoc||'CC'}</option>`
  ).join('');
}
