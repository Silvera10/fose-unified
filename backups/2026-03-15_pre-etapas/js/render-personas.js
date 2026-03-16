/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Directorio de Personas (render)
══════════════════════════════════════════════════════════ */

R.personas = function(){
  const el = $('page-personas');
  if (!el) return;

  const personas = DB._personas || [];

  let rows = '';
  personas.sort((a,b) => (a.nombre||'').localeCompare(b.nombre||'')).forEach(p => {
    rows += `<tr class="persona-row" ondblclick="abrirModalPersona('${p.id}')">
      <td>${p.nombre||''}</td>
      <td>${p.tipodoc||p.tipo_documento||'CC'}</td>
      <td>${p.numdoc||p.num_documento||''}</td>
      <td>${p.municipio||''}</td>
      <td>${p.telefono||p.celular||''}</td>
      <td>${p.email||''}</td>
      <td>${p.banco||p.nombre_banco||''}</td>
      <td class="ctr">
        <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="abrirModalPersona('${p.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarPersona('${p.id}')"><i class="bi bi-trash"></i></button>
      </td></tr>`;
  });

  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-people me-2" style="color:var(--azul)"></i>Directorio de Personas (${personas.length})</h5>
      <div>
        <label class="btn btn-outline-success btn-sm me-1" title="Importar personas desde Excel (.xlsx)">
          <i class="bi bi-file-earmark-excel me-1"></i>Importar Excel
          <input type="file" accept=".xlsx,.xls" style="display:none" onchange="_importarPersonasExcel(this)">
        </label>
        <label class="btn btn-outline-secondary btn-sm me-1" title="Importar personas desde JSON">
          <i class="bi bi-upload me-1"></i>Importar JSON
          <input type="file" accept=".json" style="display:none" onchange="_importarPersonasFile(this)">
        </label>
        <button class="btn btn-primary btn-sm" onclick="abrirModalPersona()"><i class="bi bi-person-plus me-1"></i>Nueva Persona</button>
      </div>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${personas.length ? `<div class="table-responsive"><table class="tg">
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Documento</th><th>Municipio</th><th>Teléfono</th><th>Email</th><th>Banco</th><th>Acc.</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>` : '<p class="text-muted text-center py-4">Sin personas registradas. Puede importar desde JSON o agregar manualmente.</p>'}
      </div>
    </div>`;

  // Actualizar datalist
  if(typeof _actualizarDatalistPersonas === 'function') _actualizarDatalistPersonas();
};

/* Manejar importación de archivo Excel (.xlsx) de personas */
async function _importarPersonasExcel(input){
  const file = input.files[0];
  if(!file) return;
  try {
    const buf = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const ws = wb.worksheets[0];
    if(!ws){ toast('La hoja está vacía','warning'); input.value=''; return; }

    // Función para extraer texto de una celda ExcelJS (puede ser richText, objeto, etc.)
    function _cellText(cell){
      let v = cell.value;
      if(v === null || v === undefined) return '';
      if(typeof v === 'object'){
        if(v.richText) return v.richText.map(r => r.text || '').join('');
        if(v.text) return String(v.text);
        if(v.result !== undefined) return String(v.result); // fórmulas
        if(v.hyperlink) return v.text || v.hyperlink || '';
        return String(v);
      }
      return String(v);
    }

    // Normalizar texto para comparar encabezados
    function _norm(s){
      return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_\-\.]/g,' ').replace(/\s+/g,' ').trim();
    }

    // Buscar fila de encabezados (puede estar en fila 1, 2 o 3)
    let headers = {};  // { colNumber: textoNormalizado }
    let headerRow = 0;
    for(let r = 1; r <= Math.min(5, ws.rowCount); r++){
      const row = ws.getRow(r);
      const celdas = {};
      let count = 0;
      row.eachCell({ includeEmpty: false }, (cell, colNum) => {
        const txt = _norm(_cellText(cell));
        if(txt){
          celdas[colNum] = txt;
          count++;
        }
      });
      // La fila con más celdas de texto (mínimo 3) es probablemente el encabezado
      if(count >= 3 && count > Object.keys(headers).length){
        headers = celdas;
        headerRow = r;
      }
    }

    console.log('Fila de encabezados detectada:', headerRow);
    console.log('Encabezados Excel detectados:', headers);

    if(!headerRow || Object.keys(headers).length === 0){
      toast('No se detectaron encabezados en el archivo Excel','danger');
      input.value=''; return;
    }

    // Mapeo flexible de columnas → campos de persona
    const MAP = {
      nombre:    ['nombre','nombres','nombres y apellidos','nombres_apellidos','nombre completo','contratista','razon social'],
      tipodoc:   ['tipo doc','tipo documento','tipo_documento','tipodoc','tipo id','tipo'],
      numdoc:    ['documento','num documento','num_documento','numdoc','cc','nit','cedula','numero documento','numero id','identificacion','no documento','no. documento'],
      telefono:  ['telefono','celular','tel','cel','movil','contacto'],
      email:     ['email','correo','correo electronico','e-mail','mail'],
      direccion: ['direccion','dir','domicilio'],
      municipio: ['municipio','ciudad','localidad','poblacion'],
      cargo:     ['cargo','profesion','oficio','ocupacion'],
      banco:     ['banco','nombre banco','nombre_banco','entidad bancaria','entidad financiera'],
      tipo_cuenta: ['tipo cuenta','tipo_cuenta','tipocuenta','clase cuenta'],
      cuenta_banco: ['cuenta','num cuenta','numero cuenta','cuenta bancaria','cuenta_bancaria','no cuenta','no. cuenta','n de cuenta','numcuenta'],
      rep_legal: ['rep legal','representante legal','rep_legal','rep_legal_nombre','representante'],
      rep_legal_cc: ['cc rep legal','cc representante','rep_legal_cc','rep_legal_num_documento','doc representante']
    };

    // Encontrar qué columna corresponde a cada campo (matching flexible)
    const colMap = {};
    for(const [field, aliases] of Object.entries(MAP)){
      for(const [colStr, headerText] of Object.entries(headers)){
        const col = Number(colStr);
        // Primero: coincidencia exacta
        if(aliases.includes(headerText)){
          colMap[field] = col;
          break;
        }
        // Segundo: el encabezado contiene un alias o viceversa
        for(const alias of aliases){
          if(headerText.includes(alias) || alias.includes(headerText)){
            if(!colMap[field]) colMap[field] = col;
            break;
          }
        }
      }
    }

    console.log('Columnas mapeadas:', colMap);
    if(!colMap.nombre && !colMap.numdoc){
      const found = Object.values(headers).join(', ');
      toast('No se encontraron columnas "Nombre" o "Documento". Encabezados detectados: ' + (found||'(ninguno)'), 'danger');
      input.value=''; return;
    }

    // Leer filas de datos usando eachRow (más confiable que ws.rowCount)
    const registros = [];
    let filasLeidas = 0;
    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if(rowNumber <= headerRow) return; // saltar filas antes/en el encabezado
      filasLeidas++;
      const obj = {};
      for(const [field, col] of Object.entries(colMap)){
        const cell = row.getCell(col);
        const val = _cellText(cell);
        obj[field] = val.trim();
      }
      if(obj.nombre || obj.numdoc) registros.push(obj);
    });

    console.log(`Excel: ${filasLeidas} filas de datos leídas, ${registros.length} registros válidos`);
    if(!registros.length){ toast('No se encontraron registros en el Excel','warning'); input.value=''; return; }

    // Usar importarPersonasJSON para guardar (ya maneja duplicados)
    const n = importarPersonasJSON(registros);
    const duplicados = registros.length - n;
    if(n > 0){
      let msg = `${n} personas importadas desde Excel correctamente`;
      if(duplicados > 0) msg += ` (${duplicados} duplicados omitidos)`;
      toast(msg,'success');
      R.personas();
    } else {
      toast(`No se importaron personas (${duplicados} ya existían en el directorio)`,'warning');
    }
  } catch(err){
    console.error('Error importando Excel:', err);
    toast('Error al leer el Excel: ' + err.message, 'danger');
  }
  input.value = '';
}

/* Manejar importación de archivo JSON de personas */
function _importarPersonasFile(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const data = JSON.parse(e.target.result);
      const n = importarPersonasJSON(data);
      if(n > 0){
        toast(`${n} personas importadas correctamente`,'success');
        R.personas();
      } else {
        toast('No se importaron personas (posibles duplicados)','warning');
      }
    } catch(err){
      toast('Error al leer el archivo: ' + err.message, 'danger');
    }
  };
  reader.readAsText(file);
  input.value = '';
}
