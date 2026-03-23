/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Motor de Plantillas Jinja2 → HTML
   Procesa las plantillas del directorio docs/ y genera
   documentos oficiales listos para imprimir.
══════════════════════════════════════════════════════════ */

/* ── Cache de plantillas ── */
const _tplCache = {};

/* ── Escudo de Colombia en base64 (se carga al inicio) ── */
let _escudoBase64 = '';
(function(){
  fetch('img/escudo_colombia.png')
    .then(r => r.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => { _escudoBase64 = reader.result; };
      reader.readAsDataURL(blob);
    })
    .catch(() => { _escudoBase64 = 'img/escudo_colombia.png'; });
})();

/* ── Obtener plantilla (prioridad: archivo .html → DOC_TEMPLATES fallback) ── */
async function fetchTemplate(name){
  if(_tplCache[name]) return _tplCache[name];
  const key = name.startsWith('docs/') ? name : 'docs/' + name;

  // 1° Intentar cargar el archivo .html directamente
  try {
    const resp = await fetch(key);
    if(resp.ok){
      const txt = await resp.text();
      if(txt && txt.trim().length > 10){
        _tplCache[name] = txt;
        return txt;
      }
    }
  } catch(e){ /* silenciar — intentar fallback */ }

  // 2° Fallback: plantillas embebidas (doc-templates.js)
  if(typeof DOC_TEMPLATES !== 'undefined' && DOC_TEMPLATES[key]){
    _tplCache[name] = DOC_TEMPLATES[key];
    return DOC_TEMPLATES[key];
  }

  throw new Error('No se pudo cargar la plantilla: '+key);
}

/* ══════════════════════════════════════════════════════════
   RESOLVER HERENCIA {% extends %} + {% block %}
══════════════════════════════════════════════════════════ */
async function resolveInheritance(html){
  // Detectar {% extends "docs/base_doc.html" %}
  const extMatch = html.match(/\{%\s*extends\s*["']([^"']+)["']\s*%\}/);
  if(!extMatch) return html;

  // Nombre del archivo base (quitar 'docs/' si viene)
  let baseName = extMatch[1].replace(/^docs\//, '');
  const baseHtml = await fetchTemplate(baseName);

  // Extraer bloques del hijo
  const childBlocks = {};
  const blockRe = /\{%\s*block\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endblock\s*%\}/g;
  let m;
  while((m = blockRe.exec(html)) !== null){
    childBlocks[m[1]] = m[2].trim();
  }

  // Reemplazar bloques en el base
  let result = baseHtml.replace(/\{%\s*block\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endblock\s*%\}/g,
    (full, name, defaultContent) => {
      return childBlocks[name] !== undefined ? childBlocks[name] : defaultContent.trim();
    }
  );

  // Quitar la línea extends del resultado
  result = result.replace(/\{%\s*extends\s*["'][^"']+["']\s*%\}\s*/g, '');

  return result;
}

/* ══════════════════════════════════════════════════════════
   FUNCIONES HELPER para las plantillas
══════════════════════════════════════════════════════════ */
function _formatId(n){
  if(!n) return '';
  const s = String(n);
  // Separar DV si tiene guión (e.g. "900222065-4")
  const parts = s.split('-');
  const num = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? num + '-' + parts[1] : num;
}

function _formatMoneda(n){
  const v = Number(n)||0;
  return '$ ' + Math.round(v).toLocaleString('es-CO');
}

function _buildTablaEspec(items){
  if(!items || !items.length) return '';
  let html = `<table style="width:100%;border-collapse:collapse;font-size:9.5pt;margin:8px 0">
    <thead><tr style="background:#555;color:#fff;font-weight:bold;text-align:center">
      <th style="padding:5px;border:1px solid #555;width:6%">Ítem</th>
      <th style="padding:5px;border:1px solid #555">Descripción</th>
      <th style="padding:5px;border:1px solid #555;width:12%">Cantidad</th>
      <th style="padding:5px;border:1px solid #555;width:12%">Unidad</th>
    </tr></thead><tbody>`;
  items.forEach((it, i) => {
    html += `<tr>
      <td style="padding:4px 6px;border:1px solid #aaa;text-align:center">${i+1}</td>
      <td style="padding:4px 6px;border:1px solid #aaa">${it.descripcion||''}</td>
      <td style="padding:4px 6px;border:1px solid #aaa;text-align:center">${it.cantidad||''}</td>
      <td style="padding:4px 6px;border:1px solid #aaa;text-align:center">${it.unidad||''}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function _fechaLarga(f){
  if(!f || !String(f).trim()) return '_______________';
  const d = new Date(f+'T12:00:00');
  if(isNaN(d.getTime())) return '_______________';
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return d.getDate()+' de '+meses[d.getMonth()]+' de '+d.getFullYear();
}

/* Igual que _fechaLarga pero retorna '' en vez de guiones cuando no hay fecha */
function _fechaLargaOrEmpty(f){
  if(!f || !String(f).trim()) return '';
  const d = new Date(f+'T12:00:00');
  if(isNaN(d.getTime())) return '';
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return d.getDate()+' de '+meses[d.getMonth()]+' de '+d.getFullYear();
}

/* ══════════════════════════════════════════════════════════
   EVALUADOR DE EXPRESIONES Jinja2
══════════════════════════════════════════════════════════ */
function _evalExpr(expr, ctx){
  expr = expr.trim();

  // Manejar filtros pipe: expr | filter
  const pipeIdx = _findPipeOutsideStrings(expr);
  if(pipeIdx > 0){
    const base = expr.substring(0, pipeIdx).trim();
    const filters = expr.substring(pipeIdx+1).trim().split('|').map(f=>f.trim());
    let val = _evalExpr(base, ctx);
    filters.forEach(f => {
      if(f === 'upper') val = String(val||'').toUpperCase();
      else if(f === 'lower') val = String(val||'').toLowerCase();
      else if(f === 'int') val = parseInt(val)||0;
      else if(f === 'string') val = String(val||'');
      else if(f === 'list') val = Array.isArray(val)?val:[val];
      else if(f === 'trim' || f === 'strip') val = String(val||'').trim();
      else if(f.startsWith('join')){
        const jm = f.match(/join\(['"]([^'"]*)['"]\)/);
        val = Array.isArray(val) ? val.join(jm?jm[1]:', ') : String(val||'');
      }
      else if(f.startsWith('selectattr')){
        const sm = f.match(/selectattr\(['"]([^'"]*)['"]\)/);
        if(sm && Array.isArray(val)) val = val.filter(x=>x[sm[1]]);
      }
      else if(f.startsWith('map')){
        const mm = f.match(/attribute=['"]([^'"]*)['"]/);
        if(mm && Array.isArray(val)) val = val.map(x=>x[mm[1]]);
      }
    });
    return val;
  }

  // Manejar ternario: val if cond else other
  const ternMatch = expr.match(/^(.+?)\s+if\s+(.+?)\s+else\s+(.+)$/);
  if(ternMatch){
    const cond = _evalExpr(ternMatch[2], ctx);
    return cond ? _evalExpr(ternMatch[1], ctx) : _evalExpr(ternMatch[3], ctx);
  }

  // Manejar 'is defined'
  if(expr.match(/\s+is\s+defined$/)){
    const vname = expr.replace(/\s+is\s+defined$/, '').trim();
    return _resolveVar(vname, ctx) !== undefined;
  }

  // Manejar 'or' (default): expr or 'fallback'
  const orMatch = expr.match(/^(.+?)\s+or\s+(.+)$/);
  if(orMatch){
    const left = _evalExpr(orMatch[1], ctx);
    if(left) return left;
    return _evalExpr(orMatch[2], ctx);
  }

  // Manejar 'in': 'X' in expr
  const inMatch = expr.match(/^(.+?)\s+in\s+(.+)$/);
  if(inMatch){
    const needle = _evalExpr(inMatch[1], ctx);
    const haystack = _evalExpr(inMatch[2], ctx);
    if(typeof haystack === 'string') return haystack.includes(String(needle));
    if(Array.isArray(haystack)) return haystack.includes(needle);
    if(typeof haystack === 'object' && haystack) return String(needle) in haystack;
    return false;
  }

  // Manejar 'not'
  if(expr.startsWith('not ')){
    return !_evalExpr(expr.substring(4), ctx);
  }

  // Manejar 'and' / 'or' lógicos
  const andIdx = expr.indexOf(' and ');
  if(andIdx > 0) return _evalExpr(expr.substring(0,andIdx), ctx) && _evalExpr(expr.substring(andIdx+5), ctx);
  const orIdx2 = expr.indexOf(' or ');
  if(orIdx2 > 0){
    const l = _evalExpr(expr.substring(0,orIdx2), ctx);
    return l ? l : _evalExpr(expr.substring(orIdx2+4), ctx);
  }

  // Manejar comparaciones: ==, !=, <, >, <=, >=
  const cmpOps = ['===','!==','==','!=','<=','>=','<','>'];
  for(const op of cmpOps){
    const ci = expr.indexOf(op);
    if(ci > 0 && expr[ci-1]!=='!' && expr[ci-1]!=='<' && expr[ci-1]!=='>'){
      const l = _evalExpr(expr.substring(0,ci), ctx);
      const r = _evalExpr(expr.substring(ci+op.length), ctx);
      switch(op){
        case '==': case '===': return l==r;
        case '!=': case '!==': return l!=r;
        case '<': return l<r; case '>': return l>r;
        case '<=': return l<=r; case '>=': return l>=r;
      }
    }
  }

  // Manejar operaciones aritméticas: *, +, -
  const mulMatch = expr.match(/^(.+?)\s*\*\s*(.+)$/);
  if(mulMatch){
    const l = Number(_evalExpr(mulMatch[1], ctx))||0;
    const r = Number(_evalExpr(mulMatch[2], ctx))||0;
    return l * r;
  }

  // Manejar funciones: format_id(expr), format_moneda(expr)
  const fnMatch = expr.match(/^(\w+)\((.+)\)$/);
  if(fnMatch){
    const fnName = fnMatch[1], args = fnMatch[2];
    const argVal = _evalExpr(args, ctx);
    if(fnName === 'format_id') return _formatId(argVal);
    if(fnName === 'format_moneda') return _formatMoneda(argVal);
    // Métodos de string
    if(fnName === 'strip' || fnName === 'trim') return String(argVal||'').trim();
    return argVal;
  }

  // Manejar métodos: expr.strip(), expr.split('\n'), expr.upper()
  const methMatch = expr.match(/^(.+)\.(\w+)\(([^)]*)\)$/);
  if(methMatch){
    const obj = _evalExpr(methMatch[1], ctx);
    const meth = methMatch[2];
    const marg = methMatch[3].replace(/^['"]|['"]$/g, '');
    if(meth === 'strip' || meth === 'trim') return String(obj||'').trim();
    if(meth === 'split') return String(obj||'').split(marg);
    if(meth === 'upper') return String(obj||'').toUpperCase();
    if(meth === 'lower') return String(obj||'').toLowerCase();
    if(meth === 'startswith') return String(obj||'').startsWith(marg);
    if(meth === 'endswith') return String(obj||'').endsWith(marg);
    return obj;
  }

  // String literal
  if((expr.startsWith("'") && expr.endsWith("'")) || (expr.startsWith('"') && expr.endsWith('"')))
    return expr.slice(1,-1);

  // Number literal
  if(/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

  // Boolean
  if(expr === 'true' || expr === 'True') return true;
  if(expr === 'false' || expr === 'False') return false;
  if(expr === 'none' || expr === 'None' || expr === 'null') return null;

  // Variable lookup
  return _resolveVar(expr, ctx);
}

/* Buscar '|' fuera de comillas y paréntesis */
function _findPipeOutsideStrings(expr){
  let depth = 0, inStr = false, strChar = '';
  for(let i=0; i<expr.length; i++){
    const ch = expr[i];
    if(inStr){ if(ch===strChar) inStr=false; continue; }
    if(ch==="'" || ch==='"'){ inStr=true; strChar=ch; continue; }
    if(ch==='(') depth++;
    if(ch===')') depth--;
    if(ch==='|' && depth===0 && !inStr) return i;
  }
  return -1;
}

/* Resolver variable con notación punto: ctx.a.b.c */
function _resolveVar(name, ctx){
  if(!name || !ctx) return undefined;
  name = name.trim();
  // Acceso a diccionario: obj[key]
  const bracketMatch = name.match(/^(.+?)\[(.+)\]$/);
  if(bracketMatch){
    const obj = _resolveVar(bracketMatch[1], ctx);
    const key = _evalExpr(bracketMatch[2], ctx);
    return obj ? obj[key] : undefined;
  }
  const parts = name.split('.');
  let val = ctx;
  for(const p of parts){
    if(val===undefined || val===null) return undefined;
    val = val[p];
  }
  return val;
}

/* ══════════════════════════════════════════════════════════
   PROCESADOR DE BLOQUES {% if %}, {% for %}, {% set %}
══════════════════════════════════════════════════════════ */
function _processBlocks(html, ctx){
  // Procesar {% set %} primero
  html = html.replace(/\{%\s*set\s+(\w+)\s*=\s*(.+?)\s*%\}/g, (m, name, expr) => {
    ctx[name] = _evalExpr(expr, ctx);
    return '';
  });

  // Procesar {% if %}...{% elif %}...{% else %}...{% endif %}
  html = _processIf(html, ctx);

  // Procesar {% for %}...{% endfor %}
  html = _processFor(html, ctx);

  // Procesar {{ expr }} variables
  html = html.replace(/\{\{([\s\S]*?)\}\}/g, (m, expr) => {
    const val = _evalExpr(expr, ctx);
    if(val === undefined || val === null) return '';
    return String(val);
  });

  return html;
}

/* Procesar {% if %} con soporte de anidación */
function _processIf(html, ctx){
  let changed = true;
  let safety = 0;
  while(changed && safety++ < 50){
    changed = false;
    // Buscar el {% if %} más interno (sin if anidados dentro)
    const re = /\{%\s*if\s+([\s\S]*?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/;
    const m = re.exec(html);
    if(!m) break;
    changed = true;

    const fullMatch = m[0];
    const condition = m[1];
    let body = m[2];

    // Separar elif/else
    let chosen = '';
    const parts = _splitIfParts(body);
    let found = false;

    // Evaluar if principal
    if(_evalExpr(condition, ctx)){
      chosen = parts[0].content;
      found = true;
    }

    // Evaluar elifs
    if(!found){
      for(let i=1; i<parts.length; i++){
        if(parts[i].type === 'elif'){
          if(_evalExpr(parts[i].condition, ctx)){
            chosen = parts[i].content;
            found = true;
            break;
          }
        } else if(parts[i].type === 'else'){
          chosen = parts[i].content;
          found = true;
          break;
        }
      }
    }

    html = html.replace(fullMatch, chosen);
  }
  return html;
}

/* Separar bloques if/elif/else */
function _splitIfParts(body){
  const parts = [];
  let current = {type: 'if', content: '', condition: ''};
  const lines = body.split('\n');
  let buf = [];

  for(const line of lines){
    const elifM = line.match(/\{%\s*elif\s+([\s\S]*?)\s*%\}/);
    const elseM = line.match(/\{%\s*else\s*%\}/);

    if(elifM){
      // Texto antes del tag va al bloque anterior
      const before = line.substring(0, line.indexOf(elifM[0]));
      if(before.trim()) buf.push(before);
      current.content = buf.join('\n');
      parts.push(current);
      current = {type:'elif', content:'', condition: elifM[1]};
      buf = [];
      // Texto después del tag va al nuevo bloque
      const after = line.substring(line.indexOf(elifM[0]) + elifM[0].length);
      if(after.trim()) buf.push(after);
    } else if(elseM){
      const before = line.substring(0, line.indexOf(elseM[0]));
      if(before.trim()) buf.push(before);
      current.content = buf.join('\n');
      parts.push(current);
      current = {type:'else', content:'', condition:''};
      buf = [];
      const after = line.substring(line.indexOf(elseM[0]) + elseM[0].length);
      if(after.trim()) buf.push(after);
    } else {
      buf.push(line);
    }
  }
  current.content = buf.join('\n');
  parts.push(current);
  return parts;
}

/* Procesar {% for %} */
function _processFor(html, ctx){
  let changed = true;
  let safety = 0;
  while(changed && safety++ < 50){
    changed = false;
    const re = /\{%\s*for\s+(\w+)\s+in\s+([\s\S]*?)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/;
    const m = re.exec(html);
    if(!m) break;
    changed = true;

    const varName = m[1];
    const iterExpr = m[2];
    const body = m[3];

    const iterable = _evalExpr(iterExpr, ctx);
    let result = '';

    if(Array.isArray(iterable)){
      iterable.forEach((item, idx) => {
        const loopCtx = Object.assign({}, ctx);
        loopCtx[varName] = item;
        loopCtx.loop = {index0: idx, index: idx+1, first: idx===0, last: idx===iterable.length-1};
        result += _processBlocks(body, loopCtx);
      });
    }

    html = html.replace(m[0], result);
  }
  return html;
}

/* ══════════════════════════════════════════════════════════
   CONSTRUIR CONTEXTO desde datos del contrato + config
══════════════════════════════════════════════════════════ */
function buildDocContext(contrato, d, templateName){
  const c = contrato;
  const cfg = d.config || {};
  const personas = d.personas || [];

  // Buscar persona del contratista
  const personaC = personas.find(p =>
    p.numdoc === c.contratista_numdoc || p.nombre === c.contratista_nombre
  );

  // Buscar persona del supervisor
  const personaS = personas.find(p =>
    p.nombre === c.supervisor || p.cargo === c.supervisor_cargo
  );

  // Buscar rubro — con múltiples estrategias de búsqueda
  let rubro = null;
  let _rubroCod = c.rubro || '';
  let _rubroNom = '';

  // Estrategia 1: buscar por código directo
  if(_rubroCod) rubro = (d.rubros||[]).find(r => r.cod === _rubroCod);

  // Estrategia 2: si no encontró, buscar por rubro_nombre guardado
  if(!rubro && c.rubro_nombre){
    const saved = (c.rubro_nombre||'').trim();
    // rubro_nombre puede ser "2.1.2.01 - Honorarios" o solo "Honorarios"
    const matchCod = saved.match(/^([\d.]+)\s*[-–—]\s*/);
    if(matchCod){
      _rubroCod = _rubroCod || matchCod[1];
      const nomPart = saved.replace(/^[\d.]+\s*[-–—]\s*/, '');
      rubro = (d.rubros||[]).find(r => r.cod === matchCod[1]) ||
              (d.rubros||[]).find(r => r.con === nomPart);
    } else {
      // Buscar por nombre exacto
      rubro = (d.rubros||[]).find(r => r.con === saved || (r.cod + ' - ' + r.con) === saved);
    }
    if(rubro && !_rubroCod) _rubroCod = rubro.cod;
  }

  // Nombre limpio del rubro
  _rubroNom = rubro ? rubro.con : (c.rubro_nombre||'').replace(/^[\d.]+\s*[-–—]\s*/, '');

  // Items UNSPSC
  const items = (c.items || []).map(it => ({
    unsp: it.codigo || it.unsp || '',
    nombre: it.descripcion || it.nombre || '',
    cantidad: it.cantidad || 0,
    valor_unitario: it.valor_unit || it.valor_unitario || 0,
    valor_total: it.valor_total || 0
  }));

  // Valores financieros (usa campos de Información Contable)
  const valor_total = Number(c.valor) || 0;
  const valor_iva = Number(c.iva) || Number(c.valor_iva) || 0;
  const retencion_pct = Number(c.retencion_pct) || 0;
  // Recalcular retención desde el porcentaje para evitar valores corruptos
  // (bug histórico: el punto de miles se interpretaba como decimal al guardar)
  const retencion_guardada = Number(c.retencion_valor) || Number(c.retencion) || 0;
  const base_retencion = valor_total - valor_iva;
  const retencion = retencion_pct > 0
    ? Math.round(base_retencion * retencion_pct / 100)
    : retencion_guardada;
  const neto = valor_total - retencion;
  const retencion_cuenta = c.retencion_cuenta || '';
  const retencion_concepto = c.retencion_concepto || 'Retención en la Fuente';
  const reteica = Number(c.reteica) || 0;

  // Cotizaciones (desde array o formato plano cot1/cot2/cot3)
  let cotizaciones = [];
  if(Array.isArray(c.cotizaciones) && c.cotizaciones.length){
    cotizaciones = c.cotizaciones.map(cot => ({
      nombre: cot.nombre||'',
      cc: cot.nit||cot.cc||'',
      valor: Number(cot.valor)||0,
      municipio: cot.municipio||'',
      telefono: cot.telefono||'',
      email: cot.email||'',
      rep_legal: cot.rep_legal||'',
      documentacion: cot.documentacion||'',
      seleccionada: cot.seleccionada||false,
      fecha: cot.fecha||'',
      hora: cot.hora||'',
      ampm: cot.ampm||'AM'
    }));
  } else {
    for(let i=1; i<=3; i++){
      const cot = c['cot'+i+'_nombre'] ? {
        nombre: c['cot'+i+'_nombre']||'',
        cc: c['cot'+i+'_cc']||'',
        valor: Number(c['cot'+i+'_valor'])||0,
        municipio: c['cot'+i+'_municipio']||'',
        telefono: c['cot'+i+'_telefono']||'',
        email: c['cot'+i+'_email']||'',
        fecha: c['cot'+i+'_fecha']||'',
        hora: c['cot'+i+'_hora']||'',
        ampm: c['cot'+i+'_ampm']||'AM',
        rep_legal: c['cot'+i+'_rep_legal']||'',
        documentacion: c['cot'+i+'_documentacion']||''
      } : null;
      if(cot) cotizaciones.push(cot);
    }
  }
  // Cotización seleccionada (la que CUMPLE)
  const cotSeleccionada = cotizaciones.find(c => c.seleccionada || c.documentacion === 'CUMPLE') || cotizaciones[0] || {};

  // Determinar artículo correcto según nombre de institución
  const _nom = (cfg.institucion||'').toUpperCase();
  const _esMasc = _nom.startsWith('CENTRO') || _nom.startsWith('COLEGIO') || _nom.startsWith('LICEO');
  const _art = _esMasc ? 'el' : 'la';
  const _Art = _esMasc ? 'El' : 'La';
  const _del = _esMasc ? 'del' : 'de la';
  const _Del = _esMasc ? 'Del' : 'De la';
  const _al = _esMasc ? 'al' : 'a la';

  const ctx = {
    // Institución
    inst_nombre: cfg.institucion || '',
    inst_art: _art, inst_Art: _Art,
    inst_del: _del, inst_Del: _Del,
    inst_al: _al,
    inst_nit: (cfg.nit||'') + (cfg.dv ? '-'+cfg.dv : ''),
    inst_dv: cfg.dv || '',
    inst_municipio: cfg.municipio || '',
    inst_departamento: cfg.departamento || 'Bolívar',
    inst_dane: cfg.ciudad || '',
    inst_dir: cfg.direccion || '',
    inst_email: cfg.email || '',
    secretaria: cfg.secretaria || 'SECRETARÍA DE EDUCACIÓN',
    unidad_ejecutora: cfg.unidad_ejecutora || '',
    anio: c.vigencia_fiscal || cfg.vigencia || new Date().getFullYear(),
    vigencia_contrato: c.fecha_suscripcion ? String(c.fecha_suscripcion).split('-')[0] : (c.vigencia_fiscal || cfg.vigencia || new Date().getFullYear()),

    // Rector
    rector: cfg.rector || '',
    cc_rector: cfg.idRector || cfg.cc_rector || '',
    firma_rector_img: cfg.firma_rector || '',

    // Contrato — si tiene referencia a contrato anterior, usar ese número
    numero: c.ref_contrato_anterior || c.numero || '',
    numero_actual: c.numero || '',
    tipo_contrato: c.tipo_contrato || c.tipo || 'Contrato de Prestación de Servicios',
    modalidad_seleccion: c.modalidad || 'Mínima Cuantía',
    objeto: c.objeto || '',
    justificacion_necesidad: c.justificacion_necesidad || '',
    especificaciones_tecnicas: c.especificaciones_tecnicas || [],
    tiene_especificaciones: (c.especificaciones_tecnicas && c.especificaciones_tecnicas.length > 0) ? true : false,
    tabla_especificaciones: _buildTablaEspec(c.especificaciones_tecnicas),
    obligaciones: c.obligaciones || '',
    forma_pago: c.forma_pago || 'Pago único',
    dias_duracion: c.dias_duracion || c.plazo || '',
    plazo_valor: c.plazo || c.dias_duracion || '',
    plazo_unidad_texto: (c.plazo_unidad === 'meses') ? 'meses calendario' : 'días calendario',

    // Valores
    valor_total: valor_total,
    valor_letras: numALetras(valor_total),
    retencion: retencion,
    retencion_pct: retencion_pct,
    total_deducciones: valor_total - neto,
    neto: neto,
    neto_letras: numALetras(neto),
    valor_iva: valor_iva,
    reteica: reteica,
    valor_pagado: Number(c.valor_pagado) || 0,
    penal_10pct: Math.round(valor_total * 0.10),
    penal_10pct_letras: numALetras(Math.round(valor_total * 0.10)),

    // Presupuesto
    rubro_codigo: _rubroCod,
    rubro_nombre: _rubroNom,
    fuente: c.fuente || 'FSE',
    fuente_nombre: (function(){
      const codF = c.fuente || '';
      // Buscar en catálogo SIFSE
      if(d.sifse_catalogo && d.sifse_catalogo.fuentes){
        const f = d.sifse_catalogo.fuentes.find(x => x.cod === codF);
        if(f && f.nom) return f.nom;
      }
      // Buscar en rubros de ingreso
      if(d.rubros_ing){
        const ri = d.rubros_ing.find(x => x.cod === codF);
        if(ri && (ri.con || ri.nombre)) return ri.con || ri.nombre;
      }
      // Fallback mapa legacy
      const legacy = {'1':'SGP – Calidad','2':'Gratuidad','3':'Recursos Propios','4':'Aportes Departamento','5':'Recursos Propios IE'};
      return legacy[codF] || codF;
    })(),
    ref_contrato_anterior: c.ref_contrato_anterior || '',
    num_cdp: c.cdp || '',
    num_rp: c.rp || '',
    num_egreso: c.num_egreso || '',
    num_op: c.num_op || '',
    num_factura: c.num_factura || '',
    saldo_ppto: c.saldo_ppto || 0,
    saldo_compromiso: c.saldo_compromiso || valor_total,

    // Contable — cadena: contrato → rubro → código/nombre del rubro
    cuenta_contable: c.cuenta_contable || (rubro ? rubro.cuenta_contable : '') || _rubroCod || '',
    nombre_cuenta: c.nombre_cuenta || (rubro ? rubro.nombre_cuenta : '') || _rubroNom || '',
    ret_cuenta: retencion_cuenta || c.ret_cuenta || '236505',
    ret_concepto: retencion_concepto || 'Retención en la Fuente por Pagar',
    banco_sel: (function(){
      const idx = c.banco_inst_sel || '1';
      return c['banco_'+idx] || c['banco_inst_'+idx] || c.banco_inst_1 || cfg.banco || '';
    })(),
    cta_sel: (function(){
      const idx = c.banco_inst_sel || '1';
      return c['cuenta_'+idx] || c['cta_inst_'+idx] || c.cta_inst_1 || cfg.cuenta_banco || '';
    })(),

    // Contratista
    nombre_contratista: c.contratista_nombre || '',
    tipo_id_contratista: c.contratista_tipodoc || 'C.C.',
    num_id_contratista: c.contratista_numdoc || '',
    sexo_contratista: c.contratista_sexo || (personaC ? personaC.sexo : 'M'),
    es_empresa: (c.contratista_tipodoc === 'NIT') || (c.contratista_sexo === 'E') || /S\.?A\.?S|LTDA|S\.A\b|E\.?S\.?T/i.test(c.contratista_nombre || ''),
    celular_contratista: c.contratista_telefono || c.contratista_celular || (personaC ? personaC.celular : ''),
    email_contratista: c.contratista_email || (personaC ? personaC.email : ''),
    municipio_contratista: c.contratista_municipio || (personaC ? personaC.municipio : '') || cotSeleccionada.municipio || '',
    direccion_contratista: c.contratista_direccion || (personaC ? personaC.direccion : ''),
    banco_contratista: c.contratista_banco || (personaC ? personaC.banco : ''),
    tipo_cuenta: c.contratista_tipocuenta || c.contratista_tipo_cuenta || (personaC ? personaC.tipo_cuenta : ''),
    cuenta_banco: c.contratista_numcuenta || c.contratista_cuenta || (personaC ? personaC.cuenta_banco : ''),
    rep_legal_nombre: c.contratista_replegal || c.rep_legal_nombre || '',
    rep_legal_cc: c.contratista_replegal_cc || c.rep_legal_cc || '',
    firma_contratista: (personaC ? personaC.firma : '') || '',

    // Supervisor
    nombre_supervisor: c.supervisor || '',
    cargo_supervisor: 'Rector(a)',

    // Fechas (raw y largas)
    fecha_cdp: c.fecha_cdp || '',
    fecha_rp: c.fecha_rp || '',
    fecha_inicio: c.fecha_inicio || '',
    fecha_fin: c.fecha_fin || '',
    fecha_egreso: c.fecha_egreso || '',
    fecha_estudio_previo: c.fecha_estudio_previo || '',
    fecha_evaluacion: c.fecha_evaluacion || '',
    fecha_presentacion_oferta: c.fecha_presentacion_oferta || '',
    fecha_aprobacion_plan_compras: cfg.fecha_paa || c.fecha_aprobacion_plan_compras || '',
    fecha_modificacion_plan_compras: cfg.fecha_mod_paa || c.fecha_modificacion_plan_compras || '',
    fecha_suscripcion: c.fecha_suscripcion || '',
    fecha_contrato: c.fecha_suscripcion || c.fecha_contrato || c.fecha_inicio || '',
    fecha_invitacion: c.fecha_invitacion || c.fecha_presentacion_oferta || c.fecha_estudio_previo || '',
    // Fechas adicionales del flujo contractual
    fecha_carta_propuesta: c.fecha_carta_propuesta || '',
    fecha_aceptacion: c.fecha_aceptacion || '',
    fecha_acta_recibido: c.fecha_acta_recibido || '',
    fecha_pago: c.fecha_pago || '',
    fecha_liquidacion: c.fecha_liquidacion || '',
    fecha_acta_inicio: c.fecha_acta_inicio || '',
    fecha_acta_final: c.fecha_acta_final || '',

    // Fechas en formato largo
    fecha_cdp_larga: _fechaLarga(c.fecha_cdp),
    fecha_rp_larga: _fechaLarga(c.fecha_rp),
    fecha_inicio_larga: _fechaLarga(c.fecha_inicio),
    fecha_suscripcion_larga: _fechaLarga(c.fecha_suscripcion || c.fecha_inicio),
    fecha_fin_larga: _fechaLarga(c.fecha_fin),
    fecha_egreso_larga: _fechaLarga(c.fecha_egreso),
    fecha_estudio_previo_larga: _fechaLarga(c.fecha_estudio_previo),
    fecha_evaluacion_larga: _fechaLarga(c.fecha_evaluacion),
    fecha_presentacion_oferta_larga: _fechaLarga(c.fecha_presentacion_oferta),
    fecha_invitacion_larga: _fechaLarga(c.fecha_invitacion || c.fecha_presentacion_oferta || c.fecha_estudio_previo),
    fecha_aprobacion_plan_compras_larga: _fechaLargaOrEmpty(cfg.fecha_paa || c.fecha_aprobacion_plan_compras),
    fecha_modificacion_plan_compras_larga: _fechaLargaOrEmpty(cfg.fecha_mod_paa || c.fecha_modificacion_plan_compras),
    // Fechas largas adicionales
    fecha_carta_propuesta_larga: _fechaLarga(c.fecha_carta_propuesta),
    fecha_aceptacion_larga: _fechaLarga(c.fecha_aceptacion),
    fecha_acta_recibido_larga: _fechaLarga(c.fecha_acta_recibido),
    fecha_pago_larga: _fechaLarga(c.fecha_pago),
    fecha_liquidacion_larga: _fechaLarga(c.fecha_liquidacion),
    fecha_acta_inicio_larga: _fechaLarga(c.fecha_acta_inicio),
    fecha_acta_final_larga: _fechaLarga(c.fecha_acta_final),
    hoy_largo: _fechaLarga(new Date().toISOString().slice(0,10)),

    // Items UNSPSC
    items: items,
    codigos_unspsc: items.filter(it => it.unsp).map(it => it.unsp),
    codigos_unspsc_texto: items.filter(it => it.unsp).map(it => it.unsp).join('; ') || '—',

    // Cotizaciones
    cotizaciones: cotizaciones,
    cot: cotizaciones,
    cot_seleccionada: cotSeleccionada,

    // Cotizaciones individuales (cot1, cot2, cot3)
    cot1_nombre: (cotizaciones[0]||{}).nombre || '',
    cot1_cc: (cotizaciones[0]||{}).cc || '',
    cot1_valor: (cotizaciones[0]||{}).valor || 0,
    cot1_municipio: (cotizaciones[0]||{}).municipio || '',
    cot1_telefono: (cotizaciones[0]||{}).telefono || '',
    cot1_email: (cotizaciones[0]||{}).email || '',
    cot1_fecha: (cotizaciones[0]||{}).fecha || '',
    cot1_hora: (cotizaciones[0]||{}).hora || '',
    cot1_ampm: (cotizaciones[0]||{}).ampm || ((cotizaciones[0]||{}).hora||'').replace(/.*\s/,'') || 'AM',
    cot1_documentacion: (cotizaciones[0]||{}).documentacion || '',
    cot1_rep_legal: (cotizaciones[0]||{}).rep_legal || '',

    cot2_nombre: (cotizaciones[1]||{}).nombre || '',
    cot2_cc: (cotizaciones[1]||{}).cc || '',
    cot2_valor: (cotizaciones[1]||{}).valor || 0,
    cot2_municipio: (cotizaciones[1]||{}).municipio || '',
    cot2_telefono: (cotizaciones[1]||{}).telefono || '',
    cot2_email: (cotizaciones[1]||{}).email || '',
    cot2_fecha: (cotizaciones[1]||{}).fecha || '',
    cot2_hora: (cotizaciones[1]||{}).hora || '',
    cot2_ampm: (cotizaciones[1]||{}).ampm || ((cotizaciones[1]||{}).hora||'').replace(/.*\s/,'') || 'AM',
    cot2_documentacion: (cotizaciones[1]||{}).documentacion || '',
    cot2_rep_legal: (cotizaciones[1]||{}).rep_legal || '',

    cot3_nombre: (cotizaciones[2]||{}).nombre || '',
    cot3_cc: (cotizaciones[2]||{}).cc || '',
    cot3_valor: (cotizaciones[2]||{}).valor || 0,
    cot3_municipio: (cotizaciones[2]||{}).municipio || '',
    cot3_telefono: (cotizaciones[2]||{}).telefono || '',
    cot3_email: (cotizaciones[2]||{}).email || '',
    cot3_fecha: (cotizaciones[2]||{}).fecha || '',
    cot3_hora: (cotizaciones[2]||{}).hora || '',
    cot3_ampm: (cotizaciones[2]||{}).ampm || ((cotizaciones[2]||{}).hora||'').replace(/.*\s/,'') || 'AM',
    cot3_documentacion: (cotizaciones[2]||{}).documentacion || '',
    cot3_rep_legal: (cotizaciones[2]||{}).rep_legal || '',

    // Cotizaciones: fechas largas y valores en letras (pre-calculados)
    cot1_fecha_larga: _fechaLargaOrEmpty((cotizaciones[0]||{}).fecha),
    cot1_valor_letras: (cotizaciones[0]||{}).valor ? numALetras((cotizaciones[0]||{}).valor) : '',
    cot1_valor_fmt: (cotizaciones[0]||{}).valor ? _formatMoneda((cotizaciones[0]||{}).valor) : '—',
    cot1_es_sel: ((cotizaciones[0]||{}).nombre || '') === (c.contratista_nombre || ''),

    cot2_fecha_larga: _fechaLargaOrEmpty((cotizaciones[1]||{}).fecha),
    cot2_valor_letras: (cotizaciones[1]||{}).valor ? numALetras((cotizaciones[1]||{}).valor) : '',
    cot2_valor_fmt: (cotizaciones[1]||{}).valor ? _formatMoneda((cotizaciones[1]||{}).valor) : '—',
    cot2_es_sel: ((cotizaciones[1]||{}).nombre || '') === (c.contratista_nombre || ''),

    cot3_fecha_larga: _fechaLargaOrEmpty((cotizaciones[2]||{}).fecha),
    cot3_valor_letras: (cotizaciones[2]||{}).valor ? numALetras((cotizaciones[2]||{}).valor) : '',
    cot3_valor_fmt: (cotizaciones[2]||{}).valor ? _formatMoneda((cotizaciones[2]||{}).valor) : '—',
    cot3_es_sel: ((cotizaciones[2]||{}).nombre || '') === (c.contratista_nombre || ''),

    // Total cotizantes registrados
    total_cotizantes: cotizaciones.filter(x => x.nombre).length,

    // Tabla de evaluación: filas pre-construidas (evita anidación de {% if %})
    eval_filas_html: _buildEvalFilas(cotizaciones, c.contratista_nombre || ''),
    eval_verificacion_html: _buildEvalVerificacion(cotizaciones, c.contratista_nombre || ''),
    eval_nota_html: _buildEvalNota(cotizaciones, (templateName||'').includes('garantia')),

    // Habeas Data: placeholders (se llenan después de construir ctx)
    habeas_autorizacion_html: '',
    habeas_firma_html: '',

    // Funciones helper (disponibles como funciones dentro de {{ }})
    format_id: _formatId,
    format_moneda: _formatMoneda,

    // URL placeholder (reemplazar Jinja2 url_for)
    url_for: function(){ return ''; }
  };

  // Habeas Data: bloques pre-construidos (evita {% if %} anidados en template)
  ctx.habeas_autorizacion_html = _buildHabeasAutorizacion(ctx);
  ctx.habeas_firma_html        = _buildHabeasFirma(ctx);
  ctx.habeas_constancia_html   = _buildHabeasConstancia(ctx);

  // Código de expediente por tipo de documento
  const _docCodes = {
    'certificacion_plan_compras':'PRE-01', 'cert_plan_compras':'PRE-01',
    'estudio_previo':'PRE-02', 'estudio_previo_garantia':'PRE-02',
    'solicitud_cdp':'PRE-03',
    'cdp':'PRE-04',
    'invitacion':'PRE-05', 'invitacion2':'PRE-05', 'invitacion3':'PRE-05', 'invitacion_garantia':'PRE-05',
    'carta_propuesta':'PRE-07',
    'evaluacion':'PRE-08', 'evaluacion_garantia':'PRE-08',
    'aceptacion':'PRE-09',
    'contrato':'CON-01', 'contrato2':'CON-01',
    'rp':'CON-02',
    'acta_inicio':'CON-03',
    'orden_compra':'EJE-01',
    'informe_contratista':'EJE-03',
    'informe_supervisor':'EJE-04',
    'acta_recibido':'EJE-05',
    'orden_pago':'PAG-01',
    'egreso':'PAG-02',
    'acta_liquidacion':'PAG-03',
    'habeas_data':'DOC-09', 'carta_juramentada':'DOC-10'
  };
  const _tplKey = (templateName||'').replace(/\.html$/,'').replace(/^docs\//,'');
  ctx.doc_code = _docCodes[_tplKey] || '';
  ctx._tplKey = _tplKey;

  return ctx;
}

/* ── Construir filas HTML de la tabla de evaluación ── */
function _buildEvalFilas(cotizaciones, nombreContratista){
  let html = '';
  cotizaciones.forEach((cot, i) => {
    if(!cot.nombre) return;
    const esSel = cot.nombre === nombreContratista;
    const fechaL = _fechaLargaOrEmpty(cot.fecha);
    const valorFmt = cot.valor ? _formatMoneda(cot.valor) : '—';
    const valorLetras = cot.valor ? numALetras(cot.valor) : '';
    html += `<tr${esSel ? ' class="ev-fila-sel"' : ''}>
        <td class="ev-item">${i+1}</td>
        <td>
          <strong>${cot.nombre}</strong>
          ${cot.cc ? '<br><small style="color:#555">CC/NIT ' + _formatId(cot.cc) + '</small>' : ''}
        </td>
        <td class="ev-fecha">${fechaL || '—'}</td>
        <td class="ev-hora">${cot.hora || '—'}</td>
        <td class="ev-valor">
          <strong>${valorFmt}</strong>
          ${valorLetras ? '<small>(' + valorLetras + ')</small>' : ''}
        </td>
        <td${esSel ? ' class="ev-seleccion"' : ''} style="text-align:center">
          ${esSel ? '✔ SELECCIONADO' : ''}
        </td>
      </tr>`;
  });
  return html;
}

/* ── Construir sección de verificación de requisitos ── */
function _buildEvalVerificacion(cotizaciones, nombreContratista){
  let html = '';
  let num = 0;
  cotizaciones.forEach(cot => {
    if(!cot.nombre) return;
    num++;
    const esSel = cot.nombre === nombreContratista;
    html += `<p>
          — <strong>Proponente ${num}: ${cot.nombre}</strong> —
          ${esSel
            ? '<span class="ev-cumple-txt">CUMPLE</span> con todos los requisitos técnicos, jurídicos y económicos exigidos.'
            : '<span class="ev-nocumple-txt">NO CUMPLE</span>. Documentación incompleta o no subsanada dentro del plazo establecido.'}
        </p>`;
  });
  return html;
}

/* ── Construir párrafo NOTA SOBRE COTIZACIONES (dinámico) ── */
function _buildEvalNota(cotizaciones, esGarantia){
  const recibidas = cotizaciones.filter(x => x.nombre).length;
  const total = 3; // siempre se solicitan 3
  const verbo = recibidas === 1 ? 'Se recibió' : 'Se recibieron';
  const solicitadas = esGarantia ? '' : ' solicitadas';
  let texto = `<strong>NOTA SOBRE COTIZACIONES:</strong> ${verbo} <strong>${recibidas}</strong> de <strong>${total}</strong> cotizaciones${solicitadas}.`;
  if(recibidas < total){
    texto += ` Se dejó constancia de que el proceso estuvo abierto durante el plazo previsto y que la ausencia de más proponentes obedeció a la falta de interés del mercado, no a restricción alguna de la convocatoria.`;
  }
  return texto;
}

/* ── Construir bloque AUTORIZACIÓN de Habeas Data (evita {% if %} anidados) ── */
function _buildHabeasAutorizacion(ctx){
  const sexo = ctx.sexo_contratista;
  const rep   = ctx.rep_legal_nombre;
  if(sexo === 'E' && rep){
    return `Yo, <strong>${rep}</strong>, identificado(a) con cédula de
        ciudadanía N.° <strong>${_formatId(ctx.rep_legal_cc)}</strong>, actuando en calidad
        de representante legal de <strong>${ctx.nombre_contratista}</strong>
        (NIT ${_formatId(ctx.num_id_contratista)}),`;
  }
  const genero = sexo === 'F' ? 'identificada' : 'identificado';
  return `Yo, <strong>${ctx.nombre_contratista}</strong>,
        ${genero} con ${ctx.tipo_id_contratista} N.° <strong>${_formatId(ctx.num_id_contratista)}</strong>,`;
}

/* ── Construir bloque FIRMA de Habeas Data (incluye fecha) ── */
function _buildHabeasFirma(ctx){
  const sexo = ctx.sexo_contratista;
  const rep   = ctx.rep_legal_nombre;

  let h = '';
  if(sexo === 'E' && rep){
    h += `<p class="hd-firma-nombre">${rep}</p>
            <p class="hd-firma-cargo">CC N.° ${_formatId(ctx.rep_legal_cc)}</p>
            <p class="hd-firma-cargo">Representante Legal</p>
            <p class="hd-firma-cargo">${ctx.nombre_contratista}</p>`;
  } else {
    h += `<p class="hd-firma-nombre">${ctx.nombre_contratista}</p>
            <p class="hd-firma-cargo">${ctx.tipo_id_contratista} N.° ${_formatId(ctx.num_id_contratista)}</p>
            <p class="hd-firma-cargo">Titular de los Datos Personales</p>`;
  }
  return h;
}

/* ── Construir línea "Para constancia se firma…" de Habeas Data ── */
function _buildHabeasConstancia(ctx){
  const municipio = ctx.inst_municipio || '_______________';
  const raw = ctx.fecha_inicio || '';
  if(!raw){
    return `<p style="font-size:9.5pt;text-align:justify;margin-top:18px;">Para constancia se firma en la ciudad de <strong>${municipio}</strong>, a los ______ días del mes de ______________ de ________.</p>`;
  }
  const d = new Date(raw + 'T12:00:00');
  const dia = d.getDate();
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const mes = meses[d.getMonth()];
  const anio = d.getFullYear();
  return `<p style="font-size:9.5pt;text-align:justify;margin-top:18px;">Para constancia se firma en la ciudad de <strong>${municipio}</strong>, a los <strong>${dia}</strong> días del mes de <strong>${mes}</strong> de <strong>${anio}</strong>.</p>`;
}

/* ══════════════════════════════════════════════════════════
   INYECCIÓN DE FIRMAS — función compartida
   Inyecta firma del rector y contratista UNA SOLA VEZ
══════════════════════════════════════════════════════════ */
function _inyectarFirmas(html, ctx){
  // Documentos que firma SOLO el contratista (no el rector)
  const _soloContratista = ['carta_juramentada','habeas_data','carta_propuesta','informe_contratista'];

  // ── Firma del Rector ──
  // Estrategia: buscar la ÚLTIMA aparición del nombre del rector que esté
  // en una sección de firma (parte final del documento), e inyectar UNA sola vez.
  if(ctx.firma_rector_img && !_soloContratista.includes(ctx._tplKey)){
    const rName = (ctx.rector||'').trim();
    if(rName){
      const firmaImgR = `<img src="${ctx.firma_rector_img}" style="max-height:80px;max-width:250px;display:block;margin:0 auto 2px" alt="Firma Rector">`;
      const rEsc = rName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const rUpper = rName.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

      // Buscar TODAS las posiciones donde aparece el nombre (normal o uppercase)
      // dentro de tags de firma (<p> con strong o con clase firma-nombre)
      // y solo inyectar en la ÚLTIMA (que es la sección de firma al final del doc)
      const patronesFirma = [
        new RegExp(`(<p[^>]*firma-nombre[^>]*>\\s*(?:<strong>\\s*)?)(${rEsc}|${rUpper})`, 'g'),
        new RegExp(`(<p>\\s*<strong>\\s*)(${rEsc}|${rUpper})(\\s*</strong>\\s*</p>)`, 'g'),
        // Patrón más amplio: buscar el nombre del rector en cualquier <p> o <strong> en zona de firma
        new RegExp(`(<(?:p|strong)[^>]*>\\s*)(${rUpper})`, 'g')
      ];

      let ultimaPosicion = -1;
      let ultimoMatch = null;
      let ultimoPatronIdx = -1;

      patronesFirma.forEach((re, idx) => {
        let m;
        while((m = re.exec(html)) !== null){
          // Solo considerar si está en la segunda mitad del documento (zona de firmas)
          if(m.index > html.length * 0.4 && m.index > ultimaPosicion){
            ultimaPosicion = m.index;
            ultimoMatch = m;
            ultimoPatronIdx = idx;
          }
        }
      });

      if(ultimoMatch && ultimaPosicion >= 0){
        // Insertar la firma justo ANTES de este match
        html = html.substring(0, ultimaPosicion) + firmaImgR + html.substring(ultimaPosicion);
      }
    }
  }

  // ── Firma del Contratista ──
  // Solo inyectar si el nombre del contratista está DENTRO de un div/section con clase "firma"
  // Esto evita inyectar en zonas de destinatario (como en Aceptación de Oferta)
  if(ctx.firma_contratista){
    const cName = (ctx.nombre_contratista||'').trim();
    if(cName){
      const firmaImgC = `<img src="${ctx.firma_contratista}" style="max-height:80px;max-width:250px;display:block;margin:0 auto 2px" alt="Firma Contratista">`;
      const cEsc = cName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const cUpper = cName.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

      // Buscar con clase firma-nombre (más confiable)
      const patronesFirma = [
        new RegExp(`(<p[^>]*firma-nombre[^>]*>\\s*(?:<strong>\\s*)?)(${cEsc}|${cUpper})`, 'g'),
        new RegExp(`(<p>\\s*<strong>\\s*)(${cEsc}|${cUpper})(\\s*</strong>\\s*</p>)`, 'g')
      ];

      let ultimaPosicion = -1;

      patronesFirma.forEach((re, pIdx) => {
        let m;
        while((m = re.exec(html)) !== null){
          if(m.index > html.length * 0.4 && m.index > ultimaPosicion){
            // Patrón 0 (firma-nombre class): siempre confiable
            if(pIdx === 0){
              ultimaPosicion = m.index;
            } else {
              // Patrón 1 (genérico): verificar que está en sección de firma
              // Buscar hacia atrás un div con clase "firma" (max 500 chars)
              const ctxBefore = html.substring(Math.max(0, m.index - 500), m.index);
              const ctxAfter  = html.substring(m.index, Math.min(html.length, m.index + 400));
              // Debe estar dentro de un contenedor de firma Y tener label "CONTRATISTA" cerca
              const enDivFirma = /class="[^"]*firma[^"]*"/.test(ctxBefore);
              const tieneLabel = ctxAfter.includes('EL CONTRATISTA') || ctxAfter.includes('LA EMPRESA CONTRATISTA') || ctxAfter.includes('LA CONTRATISTA') || ctxAfter.includes('Proponente') || ctxAfter.includes('Contratista') || ctxAfter.includes('DECLARANTE') || ctxAfter.includes('Titular de los Datos');
              if(enDivFirma && tieneLabel){
                ultimaPosicion = m.index;
              }
            }
          }
        }
      });

      if(ultimaPosicion >= 0){
        html = html.substring(0, ultimaPosicion) + firmaImgC + html.substring(ultimaPosicion);
      }
    }
  }

  return html;
}

/* ══════════════════════════════════════════════════════════
   FUNCIÓN PRINCIPAL: Generar y abrir documento
══════════════════════════════════════════════════════════ */
async function generarDocumento(templateName, contratoId, pagoIdx){
  const d = DB.load();
  const contrato = (d.contratos_full||[]).find(x => x.id === contratoId);
  if(!contrato){ toast('Contrato no encontrado','danger'); return; }

  try {
    // 1. Fetch template
    let html = await fetchTemplate(templateName);

    // 2. Resolver herencia extends/block
    html = await resolveInheritance(html);

    // 3. Reemplazar url_for con ruta real del escudo
    html = html.replace(/\{\{\s*url_for\([^)]*escudo_colombia[^)]*\)\s*\}\}/g, _escudoBase64 || 'img/escudo_colombia.png');
    html = html.replace(/\{\{\s*url_for\([^)]*\)\s*\}\}/g, '');

    // 4. Construir contexto
    const ctx = buildDocContext(contrato, d, templateName);

    // 4b. Si tiene pago específico, sobreescribir valores del pago
    if(pagoIdx !== undefined && pagoIdx !== null) pagoIdx = Number(pagoIdx);
    if(typeof pagoIdx === 'number' && !isNaN(pagoIdx) && contrato.pagos && contrato.pagos[pagoIdx]){
      const pago = contrato.pagos[pagoIdx];
      const pagos = contrato.pagos;
      ctx.num_egreso = pago.num_egreso || '';
      ctx.num_factura = pago.num_factura || '';
      ctx.num_op = pago.num_op || '';
      ctx.banco_pago = pago.banco_pago || '';
      ctx.cuenta_pago = pago.cuenta_pago || '';
      ctx.valor_total = Number(pago.valor) || 0;
      ctx.valor_letras = typeof numALetras === 'function' ? numALetras(ctx.valor_total) : '';
      ctx.retencion = Number(pago.retencion_valor) || 0;
      ctx.neto = ctx.valor_total - ctx.retencion;
      ctx.neto_letras = typeof numALetras === 'function' ? numALetras(ctx.neto) : '';
      ctx.total_deducciones = ctx.retencion;
      ctx.pago_numero = pagoIdx + 1;
      ctx.pago_total = pagos.length;
      ctx.pago_nota = pago.nota || ('Pago ' + (pagoIdx + 1) + ' de ' + pagos.length);

      // Período del pago para informes (contratista/supervisor)
      ctx.fecha_pago = pago.fecha_pago || '';
      ctx.fecha_pago_larga = _fechaLarga(pago.fecha_pago);
      ctx.fecha_egreso = pago.fecha_pago || '';
      ctx.fecha_egreso_larga = _fechaLarga(pago.fecha_pago);

      // Calcular período del informe:
      // - Desde: fecha de inicio del contrato (o fecha estimada del pago anterior para pagos parciales)
      // - Hasta: fecha de fin del contrato (para pago único) o fecha estimada del pago (para parciales)
      const fechaInicioC = contrato.fecha_inicio || '';
      const fechaFinC = contrato.fecha_fin || '';
      const prevPago = pagoIdx > 0 ? pagos[pagoIdx - 1] : null;

      if(pagos.length <= 1){
        // Pago único: período = toda la duración del contrato
        ctx.pago_periodo_desde = fechaInicioC;
        ctx.pago_periodo_hasta = fechaFinC;
      } else {
        // Pagos parciales: período = desde pago anterior hasta este pago
        ctx.pago_periodo_desde = prevPago ? (prevPago.fecha_estimada || prevPago.fecha_pago || fechaInicioC) : fechaInicioC;
        ctx.pago_periodo_hasta = pago.fecha_estimada || pago.fecha_pago || fechaFinC;
      }
      ctx.pago_periodo_desde_larga = _fechaLarga(ctx.pago_periodo_desde);
      ctx.pago_periodo_hasta_larga = _fechaLarga(ctx.pago_periodo_hasta);
      ctx.pago_periodo_texto = 'Del ' + _fechaLarga(ctx.pago_periodo_desde) + ' al ' + _fechaLarga(ctx.pago_periodo_hasta);

      // Fecha de elaboración = fecha de terminación del contrato
      ctx.fecha_elaboracion = fechaFinC;
      ctx.fecha_elaboracion_larga = _fechaLarga(fechaFinC);

      // Acumulado de pagos realizados hasta este índice
      let acumulado = 0;
      for(let i = 0; i <= pagoIdx; i++) acumulado += Number(pagos[i].valor) || 0;
      ctx.pago_acumulado = acumulado;
      ctx.valor_contrato = Number(contrato.valor) || 0;
      ctx.pago_saldo = ctx.valor_contrato - acumulado;
    }

    // 4b. Fecha de elaboración = fecha fin del contrato (siempre)
    if(!ctx.fecha_elaboracion_larga){
      ctx.fecha_elaboracion = contrato.fecha_fin || '';
      ctx.fecha_elaboracion_larga = _fechaLarga(contrato.fecha_fin);
    }

    // 5. Procesar bloques y variables
    html = _processBlocks(html, ctx);

    // 5b. Inyectar firmas (rector y contratista) — UNA SOLA VEZ cada una
    html = _inyectarFirmas(html, ctx);

    // 5b2. Inyectar código de expediente (justo después del <!-- DOC_CODE --> marcador)
    if(ctx.doc_code){
      const badge = `<div style="text-align:right;margin:-10px 0 8px 0;font-size:8pt;font-weight:bold;color:#666;font-family:monospace;letter-spacing:0.5px">${ctx.doc_code}</div>`;
      html = html.replace('<!-- DOC_CODE -->', badge);
    }

    // 5c. Inyectar CSS global: firma sin línea + ajuste automático de impresión
    html = html.replace('</head>', `<style>
      /* ═══ FIRMAS: sin bordes ni líneas ═══ */
      [class*="firma-linea"], [class*="firma-bloque"], [class*="firma-wrap"],
      [class*="firma-section"], [class*="firma-grid"] {
        border: none !important; border-top: none !important; border-bottom: none !important;
      }
      [class*="firma-linea"] *, [class*="firma-bloque"] *, [class*="firma-wrap"] *,
      [class*="firma-section"] *, [class*="firma-grid"] * {
        border: none !important; border-top: none !important; border-bottom: none !important;
      }
      /* Tablas de firma: sin bordes nunca */
      [class*="firma-tabla"], [class*="firma-tabla"] td, [class*="firma-tabla"] th,
      [class*="firma-tabla"] tr, [class*="firma-tabla"] table {
        border: none !important; border-collapse: collapse !important;
      }
      /* ═══ AJUSTE AUTOMÁTICO DE IMPRESIÓN ═══ */
      @media print {
        @page { size: Letter; margin: 1.5cm 1.5cm 0.8cm 2cm; }
        body { font-size: 10pt !important; margin: 0 !important; padding: 0 !important; }
        /* Tablas de datos (excluir tablas de firma) */
        table:not([class*="firma"]) { width: 100% !important; table-layout: auto !important; font-size: 9pt !important; }
        table:not([class*="firma"]) td, table:not([class*="firma"]) th {
          padding: 3px 4px !important; word-wrap: break-word !important; overflow-wrap: break-word !important;
        }
        tr { page-break-inside: avoid !important; }
        img { max-width: 100% !important; height: auto !important; }
        h1,h2,h3 { margin: 6px 0 !important; }
        p { margin: 3px 0 !important; line-height: 1.4 !important; }
        .header-inst { margin-bottom: 8px !important; }
        /* Firmas: no cortar */
        [class*="firma"] { page-break-inside: avoid !important; }
        [class*="firma-linea"], [class*="firma-bloque"] { margin-top: 10px !important; padding-top: 0 !important; }
      }
      /* Reducir espacio de firmas y compactar */
      [class*="firma-section"], [class*="firma-grid"], [class*="firma-tabla"] {
        margin-top: 20px !important;
      }
      [class*="firma-grid"] {
        gap: 20px !important; justify-content: center !important;
      }
      [class*="firma-block"], [class*="firma-bloque"] {
        flex: 0 1 45% !important;
      }
      [class*="firma-linea"], [class*="firma-bloque"] {
        margin-top: 10px !important; padding-top: 5px !important;
      }
    </style></head>`);

    // 5d. Agregar script para ocultar headers/footers al imprimir
    html = html.replace('</body>', `
    <script>
      // Al imprimir, ocultar headers/footers del navegador
      window.addEventListener('beforeprint', function(){
        document.title = ' '; // Título vacío = sin header
      });
    </script>
    </body>`);

    // 6. Limpiar tags Jinja2 residuales
    html = html.replace(/\{%[\s\S]*?%\}/g, '');
    html = html.replace(/\{\{[\s\S]*?\}\}/g, '');

    // 7. Abrir en nueva ventana
    const w = window.open('', '_blank');
    if(!w){ toast('Permita ventanas emergentes para imprimir','danger'); return; }
    w.document.write(html);
    w.document.close();

    toast('Documento generado correctamente');
  } catch(err){
    console.error('Error generando documento:', err);
    toast('Error: '+err.message, 'danger');
  }
}

/* ══════════════════════════════════════════════════════════
   COMPROBANTE DE EGRESO DIAN — contexto + generación
══════════════════════════════════════════════════════════ */

function buildDianEgresoContext(pago, d){
  const c   = d.config || {};
  const v   = Number(pago.valor) || 0;

  return {
    /* Institución */
    inst_nombre:       c.institucion || '',
    inst_nit:          c.nit || '',
    inst_dv:           c.dv || '',
    inst_municipio:    c.municipio || '',
    inst_departamento: c.departamento || '',
    inst_dane:         c.ciudad || '',
    inst_dir:          c.direccion || '',
    inst_email:        c.email || '',
    anio:              c.vigencia || String(new Date().getFullYear()),
    rector:            c.rector || '',
    cc_rector:         c.idRector || '',
    firma_rector_img:  c.firma_rector || '',

    /* Pago */
    num_egreso:            pago.num_egreso || '',
    fecha:                 pago.fecha || '',
    fecha_larga:           _fechaLarga(pago.fecha),
    concepto:              pago.concepto || '',
    periodo:               pago.periodo || '',
    formulario_dian:       pago.formulario_dian || '',

    /* Presupuesto */
    rubro_codigo:          pago.rubro_codigo || '',
    rubro_nombre:          pago.rubro_nombre || '',
    fuente:                pago.fuente || 'FSE',
    num_cdp:               pago.num_cdp || '',
    num_rp:                pago.num_rp || '',

    /* Valor */
    valor:                 v,
    valor_fmt:             _formatMoneda(v),
    valor_letras:          numALetras(v),

    /* Beneficiario */
    beneficiario:          pago.beneficiario || 'DIAN',
    nit_beneficiario:      pago.nit_beneficiario || '',
    nit_beneficiario_fmt:  _formatId(pago.nit_beneficiario || ''),
    medio_pago:            pago.medio_pago || '',
    banco_origen:          pago.banco_origen || '',
    cuenta_banco_inst:     (function(){
      // Buscar cuenta que corresponda al banco_origen del pago
      // Normalizar acentos para evitar diferencias À vs Á etc.
      const _norm = s => (s||'').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
      const bo = _norm(pago.banco_origen);
      for(let i=1;i<=3;i++){
        const b = _norm(c['banco_'+i]||c['banco_inst_'+i]||'');
        if(b && bo && b === bo) return c['cuenta_'+i]||c['cta_inst_'+i]||'';
      }
      return c.cuenta_1 || c.cta_inst_1 || c.cuenta_banco || '';
    })(),
    num_comprobante_banco: pago.num_comprobante_banco || '',

    /* Contabilidad */
    cuenta_contable:       pago.cuenta_contable || '',
    nombre_cuenta:         pago.nombre_cuenta || '',

    /* Observaciones */
    observaciones:         pago.observaciones || '',

    /* Funciones helper */
    format_id:     _formatId,
    format_moneda: _formatMoneda
  };
}

async function generarDocumentoDian(pagoId){
  const d = DB.load();
  const pago = (d.pagos_dian||[]).find(x => x.id === pagoId);
  if(!pago){ toast('Pago no encontrado','danger'); return; }

  try {
    // 1. Obtener template
    let html = await fetchTemplate('docs/egreso_dian.html');

    // 2. Resolver herencia
    html = await resolveInheritance(html);

    // 3. Limpiar url_for
    html = html.replace(/\{\{\s*url_for\([^)]*\)\s*\}\}/g, '');

    // 4. Contexto
    const ctx = buildDianEgresoContext(pago, d);

    // 5. Procesar bloques y variables
    html = _processBlocks(html, ctx);

    // 6. Limpiar residuales
    html = html.replace(/\{%[\s\S]*?%\}/g, '');
    html = html.replace(/\{\{[\s\S]*?\}\}/g, '');

    // 6b. Inyectar CSS de impresión para DIAN
    html = html.replace('</head>', `<style>
      @media print {
        @page { size: Letter; margin: 1.5cm 1.5cm 1.5cm 2cm; }
        body { font-size: 10pt !important; margin: 0 !important; padding: 0 !important; }
        table { width: 100% !important; font-size: 9pt !important; }
        td, th { padding: 3px 4px !important; word-wrap: break-word !important; }
        tr { page-break-inside: avoid !important; }
        img { max-width: 100% !important; height: auto !important; }
        [class*="firma"] { page-break-inside: avoid !important; }
      }
    </style></head>`);

    // 6c. Inyectar firma del rector
    const _cfg = d.config || {};
    const firmaImg = _cfg.firma_rector;
    if(firmaImg){
      const firmaTag = `<img src="${firmaImg}" style="max-height:80px;max-width:250px;display:block;margin:0 auto 2px" alt="Firma Rector">`;
      const rName = (_cfg.rector||'').trim();
      const rNameUp = rName.toUpperCase();
      const _kw = ['Rector', 'Ordenador', rName, rNameUp].filter(Boolean).map(k => k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
      html = html.replace(
        new RegExp(`(<div[^>]*(?:\\w+-firma-linea|\\w+-firma-bloque)[^>]*>)([\\s\\S]{0,500}?(?:${_kw}))`, 'gi'),
        (m, div, after) => m.includes('Firma Rector') ? m : div + firmaTag + after
      );
    }
    // Quitar líneas de firma
    html = html.replace(/border-top:\s*[\d.]+px\s+solid\s+#000/gi, 'border-top:none');

    // 7. Abrir en ventana nueva
    const w = window.open('', '_blank');
    if(!w){ toast('Permita ventanas emergentes para imprimir','danger'); return; }
    w.document.write(html);
    w.document.close();

    toast('Comprobante generado correctamente');
  } catch(err){
    console.error('Error generando comprobante DIAN:', err);
    toast('Error: '+err.message, 'danger');
  }
}

/* ══════════════════════════════════════════════════════════
   CATÁLOGO DE DOCUMENTOS — 24 plantillas del expediente
══════════════════════════════════════════════════════════ */
const DOC_CATALOG = [
  // ── 1. Fase Precontractual (Planeación y Disponibilidad) ──
  { id:'cert_plan_compras',    name:'Cert. Plan de Compras',     file:'certificacion_plan_compras.html',   icon:'bi-card-checklist',       color:'#6610f2',  etapa:'pre' },
  { id:'solicitud_cdp',        name:'Solicitud de CDP',          file:'solicitud_cdp.html',                icon:'bi-file-earmark-text',    color:'#6c757d',  etapa:'pre' },
  { id:'cdp',                  name:'CDP',                       file:'cdp.html',                          icon:'bi-file-earmark-check',   color:'#0d6efd',  etapa:'pre' },
  { id:'estudio_previo',       name:'Estudio Previo',            file:'estudio_previo.html',               icon:'bi-file-earmark-ruled',   color:'#0dcaf0',  etapa:'pre' },
  { id:'estudio_previo_gar',   name:'Estudio Previo Ley Garantías', file:'estudio_previo_garantia.html',   icon:'bi-shield-check',         color:'#0dcaf0',  etapa:'pre' },
  { id:'invitacion',           name:'Invitación a Ofertar',      file:'invitacion.html',                   icon:'bi-envelope-paper',       color:'#fd7e14',  etapa:'pre' },
  { id:'invitacion2',          name:'Invitación a Ofertar 2',    file:'invitacion2.html',                  icon:'bi-envelope-paper',       color:'#fd7e14',  etapa:'pre' },
  { id:'invitacion3',          name:'Invitación a Ofertar 3',    file:'invitacion3.html',                  icon:'bi-envelope-paper',       color:'#fd7e14',  etapa:'pre' },
  { id:'invitacion_gar',       name:'Invitación Ley Garantías',  file:'invitacion_garantia.html',          icon:'bi-shield-check',         color:'#fd7e14',  etapa:'pre' },
  // ── 2. Fase de Oferta, Evaluación y Selección ──
  { id:'carta_propuesta',      name:'Carta de Propuesta',        file:'carta_propuesta.html',              icon:'bi-file-text',            color:'#20c997',  etapa:'sel' },
  { id:'evaluacion',           name:'Evaluación de Oferta',      file:'evaluacion.html',                   icon:'bi-clipboard-data',       color:'#e83e8c',  etapa:'sel' },
  { id:'evaluacion_gar',       name:'Evaluación Ley Garantías',  file:'evaluacion_garantia.html',          icon:'bi-shield-check',         color:'#e83e8c',  etapa:'sel' },
  { id:'aceptacion',           name:'Aceptación de Oferta',      file:'aceptacion.html',                   icon:'bi-check2-circle',        color:'#198754',  etapa:'sel' },
  { id:'habeas_data',          name:'Habeas Data',               file:'habeas_data.html',                  icon:'bi-shield-lock',          color:'#6c757d',  etapa:'sel' },
  // ── 3. Fase Contractual (Firma, RP, Inicio) ──
  { id:'contrato',             name:'Contrato',                  file:'contrato.html',                     icon:'bi-file-earmark-medical', color:'#1a6b3c',  etapa:'con' },
  { id:'contrato2',            name:'Prestación Serv. Contables',file:'contrato2.html',                    icon:'bi-file-earmark-medical', color:'#0d6efd',  etapa:'con' },
  { id:'rp',                   name:'Registro Presupuestal',     file:'rp.html',                           icon:'bi-file-earmark-lock',    color:'#198754',  etapa:'con' },
  { id:'acta_inicio',          name:'Acta de Inicio',            file:'acta_inicio.html',                  icon:'bi-play-circle',          color:'#17a2b8',  etapa:'con' },
  { id:'orden_compra',         name:'Orden de Compra/Servicio',  file:'orden_compra.html',                 icon:'bi-cart-check',           color:'#fd7e14',  etapa:'con' },
  { id:'carta_juramentada',    name:'Carta Juramentada',         file:'carta_juramentada.html',            icon:'bi-patch-check',          color:'#6f42c1',  etapa:'con' },
  // ── 4. Fase de Ejecución y Seguimiento ──
  { id:'informe_contratista',  name:'Informe Contratista',       file:'informe_contratista.html',          icon:'bi-person-lines-fill',    color:'#0d6efd',  etapa:'eje' },
  { id:'informe_supervisor',   name:'Informe Supervisor',        file:'informe_supervisor.html',           icon:'bi-person-check',         color:'#198754',  etapa:'eje' },
  { id:'acta_recibido',        name:'Acta de Recibido',          file:'acta_recibido.html',                icon:'bi-check2-square',        color:'#20c997',  etapa:'eje' },
  // ── 5. Fase de Pago y Liquidación ──
  { id:'orden_pago',           name:'Orden de Pago',             file:'orden_pago.html',                   icon:'bi-cash-stack',           color:'#dc3545',  etapa:'pag' },
  { id:'egreso',               name:'Comprobante de Egreso',     file:'egreso.html',                       icon:'bi-receipt',              color:'#dc3545',  etapa:'pag' },
  { id:'acta_liquidacion',     name:'Acta de Liquidación',       file:'acta_liquidacion.html',             icon:'bi-file-earmark-x',       color:'#6c757d',  etapa:'pag' }
];

/* ══════════════════════════════════════════════════════════
   IMPRESIÓN AGRUPADA: Fase Pre Contractual + Expediente Completo
══════════════════════════════════════════════════════════ */

// Genera HTML de un documento SIN abrir ventana (retorna string)
async function _generarDocHTML(templateName, contratoId, pagoIdx){
  const d = DB.load();
  const contrato = (d.contratos_full||[]).find(x => x.id === contratoId);
  if(!contrato) throw new Error('Contrato no encontrado');

  let html = await fetchTemplate(templateName);
  html = await resolveInheritance(html);
  html = html.replace(/\{\{\s*url_for\([^)]*escudo_colombia[^)]*\)\s*\}\}/g, _escudoBase64 || 'img/escudo_colombia.png');
  html = html.replace(/\{\{\s*url_for\([^)]*\)\s*\}\}/g, '');

  const ctx = buildDocContext(contrato, d, templateName);

  if(pagoIdx !== undefined && pagoIdx !== null) pagoIdx = Number(pagoIdx);
  if(typeof pagoIdx === 'number' && !isNaN(pagoIdx) && contrato.pagos && contrato.pagos[pagoIdx]){
    const pago = contrato.pagos[pagoIdx];
    const pagos = contrato.pagos;
    ctx.num_egreso = pago.num_egreso || '';
    ctx.num_factura = pago.num_factura || '';
    ctx.num_op = pago.num_op || '';
    ctx.banco_pago = pago.banco_pago || '';
    ctx.cuenta_pago = pago.cuenta_pago || '';
    ctx.valor_total = Number(pago.valor) || 0;
    ctx.valor_letras = typeof numALetras === 'function' ? numALetras(ctx.valor_total) : '';
    ctx.retencion = Number(pago.retencion_valor) || 0;
    ctx.neto = ctx.valor_total - ctx.retencion;
    ctx.neto_letras = typeof numALetras === 'function' ? numALetras(ctx.neto) : '';
    ctx.total_deducciones = ctx.retencion;
    ctx.pago_numero = pagoIdx + 1;
    ctx.pago_total = pagos.length;
    ctx.pago_nota = pago.nota || ('Pago ' + (pagoIdx + 1) + ' de ' + pagos.length);
    ctx.fecha_pago = pago.fecha_pago || '';
    ctx.fecha_pago_larga = _fechaLarga(pago.fecha_pago);
    ctx.fecha_egreso = pago.fecha_pago || '';
    ctx.fecha_egreso_larga = _fechaLarga(pago.fecha_pago);
    const fechaInicioC = contrato.fecha_inicio || '';
    const fechaFinC = contrato.fecha_fin || '';
    const prevPago = pagoIdx > 0 ? pagos[pagoIdx - 1] : null;
    if(pagos.length <= 1){
      ctx.pago_periodo_desde = fechaInicioC;
      ctx.pago_periodo_hasta = fechaFinC;
    } else {
      ctx.pago_periodo_desde = prevPago ? prevPago.fecha_pago || fechaInicioC : fechaInicioC;
      ctx.pago_periodo_hasta = pago.fecha_pago || fechaFinC;
    }
    ctx.pago_periodo_desde_larga = _fechaLarga(ctx.pago_periodo_desde);
    ctx.pago_periodo_hasta_larga = _fechaLarga(ctx.pago_periodo_hasta);
    ctx.fecha_elaboracion = contrato.fecha_fin || '';
    ctx.fecha_elaboracion_larga = _fechaLarga(contrato.fecha_fin);
    let acumulado = 0;
    for(let i = 0; i <= pagoIdx; i++) acumulado += Number(pagos[i].valor) || 0;
    ctx.pago_acumulado = acumulado;
    ctx.valor_contrato = Number(contrato.valor) || 0;
    ctx.pago_saldo = ctx.valor_contrato - acumulado;
  }
  if(!ctx.fecha_elaboracion_larga){
    ctx.fecha_elaboracion = contrato.fecha_fin || '';
    ctx.fecha_elaboracion_larga = _fechaLarga(contrato.fecha_fin);
  }

  html = _processBlocks(html, ctx);

  // Inyectar firmas usando la función compartida
  html = _inyectarFirmas(html, ctx);

  // Inyectar código de expediente
  if(ctx.doc_code){
    const badge = `<div style="text-align:right;margin:-10px 0 8px 0;font-size:8pt;font-weight:bold;color:#666;font-family:monospace;letter-spacing:0.5px">${ctx.doc_code}</div>`;
    html = html.replace('<!-- DOC_CODE -->', badge);
  }

  // Limpiar Jinja2 residuales
  html = html.replace(/\{%[\s\S]*?%\}/g, '');
  html = html.replace(/\{\{[\s\S]*?\}\}/g, '');

  // Retornar HTML completo (lo usará la función de impresión agrupada)
  return html;
}

// Definición de los dos grupos de documentos
const DOC_GRUPO_PRECONTRACTUAL = [
  'cdp.html',
  'estudio_previo.html',
  'estudio_previo_garantia.html',
  'invitacion.html',
  'invitacion2.html',
  'invitacion3.html',
  'invitacion_garantia.html'
];

const DOC_GRUPO_EXPEDIENTE = [
  'contrato.html',
  'contrato2.html',
  'certificacion_plan_compras.html',
  'solicitud_cdp.html',
  'cdp.html',
  'rp.html',
  'estudio_previo.html',
  'estudio_previo_garantia.html',
  'invitacion.html',
  'invitacion2.html',
  'invitacion3.html',
  'invitacion_garantia.html',
  'evaluacion.html',
  'evaluacion_garantia.html',
  'carta_propuesta.html',
  'carta_juramentada.html',
  'aceptacion.html',
  'habeas_data.html',
  'acta_inicio.html',
  'informe_contratista.html',
  'informe_supervisor.html',
  'acta_recibido.html',
  'orden_pago.html',
  'egreso.html',
  'acta_liquidacion.html'
];

async function imprimirGrupoDocumentos(contratoId, grupo, selectedTemplates){
  const templates = selectedTemplates || (grupo === 'pre' ? DOC_GRUPO_PRECONTRACTUAL : DOC_GRUPO_EXPEDIENTE);
  const label = grupo === 'pre' ? 'Fase Pre Contractual' : 'Expediente Completo';

  const d = DB.load();
  const contrato = (d.contratos_full||[]).find(x => x.id === contratoId);
  if(!contrato){ toast('Contrato no encontrado','danger'); return; }
  const pagos = contrato.pagos || [];

  toast(`Generando ${label}... por favor espere`, 'info');

  // Recopilar HTML completo de cada documento
  const docsHTML = [];
  for(const tpl of templates){
    try {
      const esPagoDoc = ['orden_pago.html','egreso.html','informe_contratista.html','informe_supervisor.html'].includes(tpl);
      if(esPagoDoc && pagos.length > 0){
        const pagosRealizados = pagos.filter(p => p.fecha_pago);
        if(pagosRealizados.length > 0){
          for(const p of pagosRealizados){
            const idx = pagos.indexOf(p);
            docsHTML.push(await _generarDocHTML(tpl, contratoId, idx));
          }
        } else {
          docsHTML.push(await _generarDocHTML(tpl, contratoId));
        }
      } else {
        docsHTML.push(await _generarDocHTML(tpl, contratoId));
      }
    } catch(e){
      console.warn('Error generando', tpl, e.message);
    }
  }

  if(docsHTML.length === 0){
    toast('No se pudieron generar los documentos', 'danger');
    return;
  }

  // De cada HTML completo, extraer: todos los <style> del head + contenido del body
  // y encapsular cada doc en un <article> con sus propios estilos scoped
  const secciones = docsHTML.map((fullHTML, idx) => {
    // Extraer todos los <style> (incluye los inyectados por doc-engine)
    const estilos = [];
    fullHTML.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (m, css) => { estilos.push(css); });

    // Extraer body
    const bm = fullHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let body = bm ? bm[1] : fullHTML;

    // Remover barra no-print de cada documento individual
    body = body.replace(/<div[^>]*class="no-print"[\s\S]*?<\/div>/i, '');
    // Remover scripts individuales
    body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
    // Remover margin-top del wrapper (era para la barra)
    body = body.replace(/style="margin-top:\s*50px"/gi, '');

    // Scope: agregar prefijo doc-N a las clases para evitar conflictos
    // Más simple: envolver estilos en un scope con id único
    const scopeId = 'doc-' + idx;

    // Re-scope estilos: agregar #doc-N antes de cada selector
    const scopedCSS = estilos.map(css => {
      // Eliminar @media screen (tiene body con border que no queremos)
      css = css.replace(/@media\s+screen\s*\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
      // No re-scope @page ni @media (son globales)
      return css.replace(/([^{}@]+)\{/g, (m, selectors) => {
        if(selectors.includes('@')) return m;
        const scoped = selectors.split(',').map(s => {
          s = s.trim();
          if(!s || s.startsWith('@')) return s;
          // body/html: solo heredar font/color, no borders/margins
          if(s === 'body' || s === 'html') return '#' + scopeId;
          return '#' + scopeId + ' ' + s;
        }).join(', ');
        return scoped + ' {';
      });
    }).join('\n')
    // Eliminar border/padding/margin/max-width del scope ID (vienen de body)
    .replace(new RegExp('#' + scopeId + '\\s*\\{[^}]*\\}', 'g'), m => {
      return m.replace(/border[^;]*;/g, '').replace(/padding[^;]*;/g, '').replace(/margin[^;]*;/g, '').replace(/max-width[^;]*;/g, '').replace(/background[^;]*;/g, '');
    });

    return `<style>${scopedCSS}</style>
<article id="${scopeId}" class="doc-seccion" ${idx > 0 ? 'style="page-break-before:always"' : ''}>
${body}
</article>`;
  });

  const combinedBody = secciones.join('\n<hr class="no-print" style="border:3px dashed #07a;margin:40px 0">\n');

  const finalHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${label} — Contrato ${contrato.numero||'S/N'}</title>
<style>
  @page { size: Letter; margin: 1.5cm 1.5cm 0.8cm 2cm; }
  body { margin: 0; padding: 0; color: #000; }
  /* Contenedores: sin bordes */
  article.doc-seccion,
  [id^="doc-"] {
    border: none !important; box-shadow: none !important;
    padding: 0 !important; max-width: none !important;
    margin: 0 !important; outline: none !important;
  }
  /* Firmas: sin bordes nunca */
  [class*="firma-linea"], [class*="firma-bloque"], [class*="firma-wrap"],
  [class*="firma-section"], [class*="firma-grid"],
  [class*="firma-linea"] *, [class*="firma-bloque"] *, [class*="firma-wrap"] *,
  [class*="firma-section"] *, [class*="firma-grid"] *,
  [class*="firma-tabla"], [class*="firma-tabla"] td, [class*="firma-tabla"] th,
  [class*="firma-tabla"] tr {
    border: none !important;
  }
  /* Firmas compactas */
  [class*="firma-grid"] { gap: 20px !important; justify-content: center !important; }
  [class*="firma-block"], [class*="firma-bloque"] { flex: 0 1 45% !important; }
  /* hr separador solo visible en pantalla, no en impresión */
  hr { display: none; }
  @media screen { hr.no-print { display: block; } }
  @media print {
    .no-print { display: none !important; }
    hr { display: none !important; }
    article.doc-seccion, [id^="doc-"] {
      border: none !important; box-shadow: none !important;
      padding: 0 !important; outline: none !important;
    }
    table:not([class*="firma"]) { width: 100% !important; table-layout: auto !important; }
    table:not([class*="firma"]) td, table:not([class*="firma"]) th {
      word-wrap: break-word !important; overflow-wrap: break-word !important;
    }
    tr { page-break-inside: avoid !important; }
    [class*="firma"] { page-break-inside: avoid !important; }
  }
</style></head>
<body>
<div class="no-print" style="background:#2c3e50;color:#fff;padding:8px 16px;text-align:right;font-family:Arial;font-size:12px;position:fixed;top:0;left:0;right:0;z-index:100">
  <span style="float:left;font-size:13px;font-weight:bold">${label} — ${secciones.length} documentos</span>
  <button onclick="window.print()" style="background:#27ae60;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:12px;margin-right:8px"><b>Imprimir Todo</b></button>
  <button onclick="window.close()" style="background:#e74c3c;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:12px">Cerrar</button>
</div>
<div style="margin-top:50px">
${combinedBody}
</div>
<script>window.addEventListener('beforeprint',function(){document.title=' '});</script>
</body></html>`;

  const w = window.open('', '_blank');
  if(!w){ toast('Permita ventanas emergentes','danger'); return; }
  w.document.write(finalHTML);
  w.document.close();
  toast(`${label}: ${secciones.length} documentos generados`);
}

/* ══════════════════════════════════════════════════════════
   DESCARGAR EXPEDIENTE COMO PDFs INDIVIDUALES
   Cada documento se descarga como PDF separado a Descargas
══════════════════════════════════════════════════════════ */
const _DOC_FILENAMES = {
  'certificacion_plan_compras.html': 'PRE-01_Certificacion_Plan_Compras',
  'estudio_previo.html': 'PRE-02_Estudio_Previo',
  'estudio_previo_garantia.html': 'PRE-02_Estudio_Previo_Ley_Garantias',
  'solicitud_cdp.html': 'PRE-03_Solicitud_CDP',
  'cdp.html': 'PRE-04_CDP',
  'invitacion.html': 'PRE-05_Invitacion_a_Ofertar',
  'invitacion2.html': 'PRE-05_Invitacion_a_Ofertar_2',
  'invitacion3.html': 'PRE-05_Invitacion_a_Ofertar_3',
  'invitacion_garantia.html': 'PRE-05_Invitacion_Ley_Garantias',
  'carta_propuesta.html': 'PRE-07_Carta_de_Propuesta',
  'evaluacion.html': 'PRE-08_Evaluacion_de_Ofertas',
  'evaluacion_garantia.html': 'PRE-08_Evaluacion_Ley_Garantias',
  'aceptacion.html': 'PRE-09_Aceptacion_de_Oferta',
  'contrato.html': 'CON-01_Contrato',
  'contrato2.html': 'CON-01_Contrato_Prestacion_Servicios',
  'rp.html': 'CON-02_Registro_Presupuestal',
  'acta_inicio.html': 'CON-03_Acta_de_Inicio',
  'habeas_data.html': 'DOC-09_Habeas_Data',
  'carta_juramentada.html': 'DOC-10_Carta_Juramentada',
  'orden_compra.html': 'EJE-01_Orden_de_Compra',
  'informe_contratista.html': 'EJE-03_Informe_Contratista',
  'informe_supervisor.html': 'EJE-04_Informe_Supervisor',
  'acta_recibido.html': 'EJE-05_Acta_Recibido',
  'orden_pago.html': 'PAG-01_Orden_de_Pago',
  'egreso.html': 'PAG-02_Comprobante_de_Egreso',
  'acta_liquidacion.html': 'PAG-03_Acta_de_Liquidacion'
};

/* ── Modal selector de documentos para descarga ── */
function mostrarSelectorDescarga(contratoId){
  const etapas = [
    { key:'pre', label:'Fase Precontractual' },
    { key:'sel', label:'Oferta y Evaluación' },
    { key:'con', label:'Documentos Contractuales' },
    { key:'eje', label:'Ejecución y Seguimiento' },
    { key:'pag', label:'Pago y Liquidación' }
  ];

  const disponibles = DOC_CATALOG;

  let body = `<div class="mb-2">
    <button class="btn btn-sm btn-outline-primary me-1" onclick="document.querySelectorAll('#dlg-desc-checks input').forEach(c=>c.checked=true)">Todos</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="document.querySelectorAll('#dlg-desc-checks input').forEach(c=>c.checked=false)">Ninguno</button>
  </div><div id="dlg-desc-checks">`;

  etapas.forEach(et => {
    const docs = disponibles.filter(d => d.etapa === et.key);
    if(!docs.length) return;
    body += `<div class="mb-2"><strong class="small text-muted">${et.label}</strong>`;
    docs.forEach(d => {
      const code = _DOC_FILENAMES[d.file] ? _DOC_FILENAMES[d.file].split('_')[0] : '';
      body += `<div class="form-check"><input class="form-check-input" type="checkbox" value="${d.file}" id="dl-${d.id}" checked>
        <label class="form-check-label small" for="dl-${d.id}">${code ? '<code>'+code+'</code> ' : ''}${d.name}</label></div>`;
    });
    body += `</div>`;
  });
  body += `</div>`;

  // Usar modal de Bootstrap existente o crear uno dinámico
  let modal = document.getElementById('modalDescarga');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'modalDescarga';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.innerHTML = `<div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header py-2">
          <h6 class="modal-title fw-bold">Seleccionar documentos para descargar</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="modalDescarga-body"></div>
        <div class="modal-footer py-2">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary btn-sm fw-bold" id="btnDescargarSel">
            <i class="bi bi-download me-1"></i>Descargar seleccionados
          </button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('modalDescarga-body').innerHTML = body;
  document.getElementById('btnDescargarSel').onclick = () => {
    const checks = document.querySelectorAll('#dlg-desc-checks input:checked');
    const selected = Array.from(checks).map(c => c.value);
    if(!selected.length){ toast('Seleccione al menos un documento','warning'); return; }
    bootstrap.Modal.getInstance(modal).hide();
    descargarExpedientePDFs(contratoId, selected);
  };

  new bootstrap.Modal(modal).show();
}

function mostrarSelectorImpresion(contratoId){
  const etapas = [
    { key:'pre', label:'Fase Precontractual' },
    { key:'sel', label:'Oferta y Evaluación' },
    { key:'con', label:'Documentos Contractuales' },
    { key:'eje', label:'Ejecución y Seguimiento' },
    { key:'pag', label:'Pago y Liquidación' }
  ];

  const disponibles = DOC_CATALOG;

  let body = `<div class="mb-2">
    <button class="btn btn-sm btn-outline-primary me-1" onclick="document.querySelectorAll('#dlg-imp-checks input').forEach(c=>c.checked=true)">Todos</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="document.querySelectorAll('#dlg-imp-checks input').forEach(c=>c.checked=false)">Ninguno</button>
  </div><div id="dlg-imp-checks">`;

  etapas.forEach(et => {
    const docs = disponibles.filter(d => d.etapa === et.key);
    if(!docs.length) return;
    body += `<div class="mb-2"><strong class="small text-muted">${et.label}</strong>`;
    docs.forEach(d => {
      const code = _DOC_FILENAMES[d.file] ? _DOC_FILENAMES[d.file].split('_')[0] : '';
      body += `<div class="form-check"><input class="form-check-input" type="checkbox" value="${d.file}" id="im-${d.id}" checked>
        <label class="form-check-label small" for="im-${d.id}">${code ? '<code>'+code+'</code> ' : ''}${d.name}</label></div>`;
    });
    body += `</div>`;
  });
  body += `</div>`;

  let modal = document.getElementById('modalImpresion');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'modalImpresion';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.innerHTML = `<div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header py-2">
          <h6 class="modal-title fw-bold">Seleccionar documentos para imprimir</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="modalImpresion-body"></div>
        <div class="modal-footer py-2">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary btn-sm fw-bold" id="btnImprimirSel">
            <i class="bi bi-printer me-1"></i>Imprimir seleccionados
          </button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('modalImpresion-body').innerHTML = body;
  document.getElementById('btnImprimirSel').onclick = () => {
    const checks = document.querySelectorAll('#dlg-imp-checks input:checked');
    const selected = Array.from(checks).map(c => c.value);
    if(!selected.length){ toast('Seleccione al menos un documento','warning'); return; }
    bootstrap.Modal.getInstance(modal).hide();
    imprimirGrupoDocumentos(contratoId, 'exp', selected);
  };

  new bootstrap.Modal(modal).show();
}

async function descargarExpedientePDFs(contratoId, selectedTemplates){
  const d = DB.load();
  const contrato = (d.contratos_full||[]).find(x => x.id === contratoId);
  if(!contrato){ toast('Contrato no encontrado','danger'); return; }
  const pagos = contrato.pagos || [];
  const numContrato = contrato.numero || contratoId;

  const templates = selectedTemplates || DOC_GRUPO_EXPEDIENTE;

  // Construir cola de documentos a imprimir
  const cola = [];
  for(const tpl of templates){
    try {
      const esPagoDoc = ['orden_pago.html','egreso.html','informe_contratista.html','informe_supervisor.html'].includes(tpl);
      const pagosRealizados = pagos.filter(p => p.fecha_pago);
      if(esPagoDoc && pagosRealizados.length > 0){
        for(const p of pagosRealizados){
          const idx = pagos.indexOf(p);
          const htmlDoc = await _generarDocHTML(tpl, contratoId, idx);
          const baseName = _DOC_FILENAMES[tpl] || tpl.replace('.html','');
          cola.push({ html: htmlDoc, name: `${baseName}_Pago${idx+1}_${numContrato}` });
        }
      } else {
        const htmlDoc = await _generarDocHTML(tpl, contratoId);
        const baseName = _DOC_FILENAMES[tpl] || tpl.replace('.html','');
        cola.push({ html: htmlDoc, name: `${baseName}_${numContrato}` });
      }
    } catch(e){
      console.warn('Error generando', tpl, e.message);
    }
  }

  if(!cola.length){ toast('No se generaron documentos','warning'); return; }

  // Descargar cada documento como archivo HTML
  for(let i = 0; i < cola.length; i++){
    let htmlDoc = cola[i].html;
    // Limpiar botones de impresión y ajustar margen
    htmlDoc = htmlDoc.replace(/<button[^>]*class="print-btn[^>]*>[\s\S]*?<\/button>/gi, '');
    htmlDoc = htmlDoc.replace(/style="margin-top:\s*50px"/gi, 'style="margin-top:0"');
    // Forzar fondo blanco y márgenes de impresión en el HTML descargado
    const printCSS = `<style>@media print{body{background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:letter;margin:0}}</style>`;
    htmlDoc = htmlDoc.replace('</head>', printCSS + '</head>');

    const fileName = cola[i].name + '.html';
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    // Esperar un poco entre descargas para que el navegador no las bloquee
    await new Promise(r => setTimeout(r, 300));
  }

  toast(`${cola.length} documentos descargados como HTML en su carpeta Descargas. Abra cada uno y use Ctrl+P → Guardar como PDF → Márgenes: Ninguno.`,'success');
}

/* ══════════════════════════════════════════════════════════
   RENDERIZAR PANEL DE DOCUMENTOS para un contrato
══════════════════════════════════════════════════════════ */
function renderDocPanel(contratoId){
  const d = DB.load();
  const contrato = (d.contratos_full||[]).find(x => x.id === contratoId);
  const pagos = contrato ? (contrato.pagos || []) : [];

  const etapas = [
    { key:'pre', label:'Fase Precontractual',       icon:'bi-clipboard-check',      color:'text-success' },
    { key:'sel', label:'Oferta y Evaluación',        icon:'bi-search',               color:'text-primary' },
    { key:'con', label:'Documentos Contractuales',   icon:'bi-file-earmark-medical', color:'text-warning' },
    { key:'eje', label:'Ejecución y Seguimiento',    icon:'bi-bar-chart-line',       color:'text-info' },
    { key:'pag', label:'Pago y Cierre',              icon:'bi-cash-stack',           color:'text-danger' }
  ];

  function docBtn(doc, cId){
    return `<button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 py-0 px-2"
      onclick="generarDocumento('${doc.file}','${cId}')"
      style="border-color:${doc.color};color:${doc.color};font-size:11px"
      title="${doc.name}">
      <i class="bi ${doc.icon}"></i>${doc.name}
    </button>`;
  }

  // Genera botones de Orden de Pago / Egreso solo por cada pago YA REALIZADO
  function pagosBtns(doc, cId){
    if(pagos.length <= 1){
      // Pago único: si tiene datos de pago, pasar pagoIdx=0 para que el documento los use
      if(pagos.length === 1 && pagos[0].fecha_pago){
        return `<button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 py-0 px-2"
          onclick="generarDocumento('${doc.file}','${cId}',0)"
          style="border-color:${doc.color};color:${doc.color};font-size:11px">
          <i class="bi ${doc.icon}"></i>${doc.name}</button>`;
      }
      return docBtn(doc, cId);
    }
    const pagosRealizados = pagos.filter(p => p.fecha_pago);
    const pagosPendientes = pagos.length - pagosRealizados.length;
    if(pagosRealizados.length === 0){
      return `<span class="text-muted small d-flex align-items-center gap-1 py-0 px-2" style="font-size:10px">
        <i class="bi bi-hourglass-split"></i>${pagos.length} pagos pendientes — registre pagos para generar ${doc.name}</span>`;
    }
    let btns = pagosRealizados.map(p => {
      const idx = pagos.indexOf(p);
      const label = doc.name + ' #' + (idx+1) + (p.num_egreso ? ' (Eg.' + p.num_egreso + ')' : '');
      return `<button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 py-0 px-2"
        onclick="generarDocumento('${doc.file}','${cId}',${idx})"
        style="border-color:${doc.color};color:${doc.color};font-size:11px"
        title="${label}">
        <i class="bi ${doc.icon}"></i>${label}
      </button>`;
    }).join('');
    if(pagosPendientes > 0){
      btns += `<span class="text-muted small d-flex align-items-center gap-1 py-0 px-2" style="font-size:10px">
        <i class="bi bi-clock"></i>${pagosPendientes} pago(s) pendiente(s)</span>`;
    }
    return btns;
  }

  let html = '<p class="text-muted mb-2" style="font-size:11px"><i class="bi bi-info-circle me-1"></i>Haga clic en cada documento para generarlo. Use Ctrl+P para imprimir o guardar como PDF.</p>';

  // Botones de impresión agrupada
  html += `<div class="d-flex flex-wrap gap-2 mb-3">
    <button class="btn btn-success btn-sm fw-bold" onclick="imprimirGrupoDocumentos('${contratoId}','pre')" title="Imprimir CDP, Estudio Previo, Invitaciones">
      <i class="bi bi-printer me-1"></i>🖨️ Fase Pre Contractual
    </button>
    <button class="btn btn-primary btn-sm fw-bold" onclick="mostrarSelectorImpresion('${contratoId}')" title="Seleccionar documentos del expediente para imprimir">
      <i class="bi bi-printer me-1"></i>🖨️ Expediente Completo
    </button>
    <button class="btn btn-outline-secondary btn-sm fw-bold" onclick="mostrarSelectorDescarga('${contratoId}')" title="Seleccionar documentos para descargar">
      <i class="bi bi-download me-1"></i>📁 Descargar Docs
    </button>
  </div>`;

  etapas.forEach(et => {
    const docs = DOC_CATALOG.filter(d => d.etapa === et.key);
    const btns = docs.map(doc => {
      if(doc.id === 'orden_pago' || doc.id === 'egreso' || doc.id === 'informe_contratista' || doc.id === 'informe_supervisor') return pagosBtns(doc, contratoId);
      return docBtn(doc, contratoId);
    }).join('');
    html += `<div class="mb-3">
      <h6 class="small fw-bold ${et.color} border-bottom pb-1 mb-2"><i class="bi ${et.icon} me-1"></i>${et.label}</h6>
      <div class="d-flex flex-wrap gap-2">${btns}</div>
    </div>`;
  });

  return html;
}

/* ══════════════════════════════════════════════════════════
   MODAL: Panel de documentos
══════════════════════════════════════════════════════════ */
function abrirPanelDocumentos(contratoId){
  const d = DB.load();
  const c = (d.contratos_full||[]).find(x => x.id === contratoId);
  if(!c){ toast('Contrato no encontrado','danger'); return; }

  let modal = $('mDocumentos');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'mDocumentos';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header py-2" style="background:#1a6b3c;color:#fff">
          <h6 class="modal-title"><i class="bi bi-file-earmark-medical me-2"></i>Documentos — Contrato N° ${c.numero||'S/N'}</h6>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info small py-2 mb-3">
            <i class="bi bi-info-circle me-1"></i>
            <strong>${c.contratista_nombre||'—'}</strong> | Valor: <strong>${fmt(c.valor)}</strong>
            | ${(c.objeto||'').substring(0,120)}${(c.objeto||'').length>120?'...':''}
          </div>
          ${renderDocPanel(contratoId)}
        </div>
        <div class="modal-footer py-1">
          <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>`;

  new bootstrap.Modal(modal).show();
}
