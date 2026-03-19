/* ══════════════════════════════════════════════════════════
   ACCIONES — Cuentas por Pagar (Vigencias Anteriores)
   CRUD + Comprobante de Egreso
   NO afecta presupuesto de la vigencia actual.
══════════════════════════════════════════════════════════ */

function _cxpCalcNeto(){
  const v = Number($('cxp-valor').value) || 0;
  const r = Number($('cxp-retencion').value) || 0;
  $('cxp-neto').value = v - r;
}

function _cxpSigEgreso(){
  const d = DB.load();
  const nums = [
    ...((d.contratos_full||[]).flatMap(c => (c.pagos||[]).map(p => Number(p.num_egreso)||0))),
    ...((d.contratos_full||[]).map(c => Number(c.num_egreso)||0)),
    ...((d.pagos_dian||[]).map(p => Number(p.num_egreso)||0)),
    ...((d.contratos||[]).map(c => Number(c.comp)||0)),
    ...((d.cuentas_por_pagar||[]).map(p => Number(p.num_egreso)||0))
  ].filter(n => n > 0);
  return nums.length ? Math.max(...nums.reduce((a,b) => Math.max(a,b), 0)) + 1
    : (Number((d.config||{}).vigencia||2026)*1000 + 1);
}

function buscarPersonaCxP(q){
  if(!q || q.length < 3) return;
  const d = DB.load();
  const personas = d.personas || [];
  const match = personas.find(p => (p.nombre||'').toUpperCase().includes(q.toUpperCase()));
  if(match){
    if($('cxp-nit')) $('cxp-nit').value = match.numdoc || match.num_documento || '';
    if($('cxp-banco')) $('cxp-banco').value = match.banco || match.nombre_banco || '';
    if($('cxp-cuenta')) $('cxp-cuenta').value = match.cuenta_banco || match.cuenta_bancaria || '';
    if($('cxp-tipo-cuenta')) $('cxp-tipo-cuenta').value = match.tipo_cuenta || 'Ahorros';
    if($('cxp-telefono')) $('cxp-telefono').value = match.telefono || match.celular || '';
    if($('cxp-email')) $('cxp-email').value = match.email || '';
  }
}

function buscarPersonaCxPDoc(q){
  if(!q || q.length < 3) return;
  const d = DB.load();
  const personas = d.personas || [];
  const match = personas.find(p => (p.numdoc||p.num_documento||'').includes(q));
  if(match){
    if($('cxp-beneficiario')) $('cxp-beneficiario').value = match.nombre || '';
    if($('cxp-banco')) $('cxp-banco').value = match.banco || match.nombre_banco || '';
    if($('cxp-cuenta')) $('cxp-cuenta').value = match.cuenta_banco || match.cuenta_bancaria || '';
    if($('cxp-tipo-cuenta')) $('cxp-tipo-cuenta').value = match.tipo_cuenta || 'Ahorros';
    if($('cxp-telefono')) $('cxp-telefono').value = match.telefono || match.celular || '';
    if($('cxp-email')) $('cxp-email').value = match.email || '';
  }
}

function abrirModalCuentaPagar(id){
  const d = DB.load();
  const campos = ['cxp-egreso','cxp-fecha','cxp-vigencia-ant','cxp-contrato-ref',
    'cxp-beneficiario','cxp-nit','cxp-banco','cxp-cuenta','cxp-telefono','cxp-email',
    'cxp-valor','cxp-retencion','cxp-neto','cxp-concepto-ret','cxp-concepto'];

  if(id){
    // Editar
    const p = (d.cuentas_por_pagar||[]).find(x => x.id === id);
    if(!p){ toast('Registro no encontrado','danger'); return; }
    $('cxp-id').value = p.id;
    $('cxp-egreso').value = p.num_egreso || '';
    $('cxp-fecha').value = p.fecha || '';
    $('cxp-vigencia-ant').value = p.vigencia_anterior || '';
    $('cxp-contrato-ref').value = p.contrato_ref || '';
    $('cxp-beneficiario').value = p.beneficiario || '';
    $('cxp-nit').value = p.nit || '';
    $('cxp-banco').value = p.banco || '';
    $('cxp-cuenta').value = p.cuenta || '';
    $('cxp-tipo-cuenta').value = p.tipo_cuenta || 'Ahorros';
    $('cxp-telefono').value = p.telefono || '';
    $('cxp-email').value = p.email || '';
    $('cxp-valor').value = p.valor || '';
    $('cxp-retencion').value = p.retencion || 0;
    $('cxp-neto').value = p.neto || '';
    $('cxp-concepto-ret').value = p.concepto_retencion || '';
    $('cxp-concepto').value = p.concepto || '';
  } else {
    // Nuevo
    $('cxp-id').value = '';
    campos.forEach(id => { if($(id)) $(id).value = ''; });
    $('cxp-retencion').value = 0;
    $('cxp-tipo-cuenta').value = 'Ahorros';
    $('cxp-vigencia-ant').value = Number((d.config||{}).vigencia||2026) - 1;

    // Auto-consecutivo egreso
    const nums = [
      ...((d.contratos_full||[]).flatMap(c => (c.pagos||[]).map(p => Number(p.num_egreso)||0))),
      ...((d.contratos_full||[]).map(c => Number(c.num_egreso)||0)),
      ...((d.pagos_dian||[]).map(p => Number(p.num_egreso)||0)),
      ...((d.contratos||[]).map(c => Number(c.comp)||0)),
      ...((d.cuentas_por_pagar||[]).map(p => Number(p.num_egreso)||0))
    ].filter(n => n > 0);
    const sig = nums.length ? nums.reduce((a,b) => Math.max(a,b), 0) + 1
      : (Number((d.config||{}).vigencia||2026)*1000 + 1);
    $('cxp-egreso').value = String(sig);
  }

  if(typeof safeModal === 'function') safeModal('mCuentaPagar');
  else new bootstrap.Modal($('mCuentaPagar')).show();
}

function guardarCuentaPagar(){
  const fecha = $('cxp-fecha').value;
  const beneficiario = ($('cxp-beneficiario').value||'').trim();
  const valor = Number($('cxp-valor').value) || 0;
  const concepto = ($('cxp-concepto').value||'').trim();

  if(!fecha || !beneficiario || valor <= 0 || !concepto){
    toast('Complete los campos obligatorios: Fecha, Beneficiario, Valor y Concepto','danger');
    return;
  }

  const d = DB.load();
  if(!d.cuentas_por_pagar) d.cuentas_por_pagar = [];

  const id = $('cxp-id').value || uid();
  const registro = {
    id: id,
    num_egreso: ($('cxp-egreso').value||'').trim(),
    fecha: fecha,
    vigencia_anterior: $('cxp-vigencia-ant').value || '',
    contrato_ref: ($('cxp-contrato-ref').value||'').trim(),
    beneficiario: beneficiario,
    nit: ($('cxp-nit').value||'').trim(),
    banco: ($('cxp-banco').value||'').trim(),
    cuenta: ($('cxp-cuenta').value||'').trim(),
    tipo_cuenta: $('cxp-tipo-cuenta').value || 'Ahorros',
    telefono: ($('cxp-telefono').value||'').trim(),
    email: ($('cxp-email').value||'').trim(),
    valor: valor,
    retencion: Number($('cxp-retencion').value) || 0,
    neto: Number($('cxp-neto').value) || valor,
    concepto_retencion: ($('cxp-concepto-ret').value||'').trim(),
    concepto: concepto
  };

  const idx = d.cuentas_por_pagar.findIndex(x => x.id === id);
  if(idx >= 0) d.cuentas_por_pagar[idx] = registro;
  else d.cuentas_por_pagar.push(registro);

  DB.save(d);
  bootstrap.Modal.getInstance($('mCuentaPagar'))?.hide();
  R.cuentasPagar();
  toast('Cuenta por pagar guardada');
}

function eliminarCuentaPagar(id){
  if(!confirm('¿Eliminar este registro de cuenta por pagar?')) return;
  const d = DB.load();
  d.cuentas_por_pagar = (d.cuentas_por_pagar||[]).filter(x => x.id !== id);
  DB.save(d);
  R.cuentasPagar();
  toast('Registro eliminado','warning');
}

function imprimirCxP(id){
  const d = DB.load();
  const p = (d.cuentas_por_pagar||[]).find(x => x.id === id);
  if(!p){ toast('Registro no encontrado','danger'); return; }

  const c = d.config || {};
  const firmaImg = c.firma_rector;
  const firmaTag = firmaImg ? `<img src="${firmaImg}" style="max-height:120px;max-width:300px;display:block;margin:0 auto 4px" alt="Firma">` : '';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Comprobante de Egreso — ${p.num_egreso}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:Arial,sans-serif; font-size:11pt; color:#000; max-width:21cm; margin:20px auto; padding:2cm; }
      @page { size:Letter; margin:1.5cm 1.5cm 1.5cm 2cm; }
      @media print { body { margin:0; padding:0; font-size:10pt; } .no-print{display:none!important} table{font-size:9pt} }
      h2 { text-align:center; margin:10px 0; }
      .inst { text-align:center; margin-bottom:15px; }
      .inst .nombre { font-size:13pt; font-weight:bold; }
      .inst .nit { font-size:10pt; }
      .titulo { text-align:center; font-size:12pt; font-weight:bold; border:2px solid #000;
        padding:6px 20px; display:inline-block; margin:10px auto; }
      table { width:100%; border-collapse:collapse; margin:8px 0; }
      th, td { border:1px solid #999; padding:5px 8px; text-align:left; }
      th { background:#eee; font-weight:bold; font-size:10pt; }
      .num { text-align:right; }
      .center { text-align:center; }
      .firma { text-align:center; margin-top:50px; }
      .firma-nombre { font-weight:bold; margin-top:4px; }
      .seccion { font-weight:bold; background:#eee; padding:4px 8px; margin:12px 0 6px;
        border-left:4px solid #333; font-size:10pt; }
      .badge-cxp { background:#6c757d; color:#fff; padding:2px 10px; border-radius:4px;
        font-size:9pt; display:inline-block; margin-top:4px; }
    </style>
  </head><body>
    <button class="no-print" onclick="window.print()" style="position:fixed;top:10px;right:10px;
      padding:8px 16px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer">
      🖨 Imprimir</button>

    <div class="inst">
      <div class="nombre">${c.institucion||''}</div>
      <div class="nit">NIT: ${c.nit||''}${c.dv?'-'+c.dv:''}${c.ciudad?' — DANE: '+c.ciudad:''}</div>
      <div class="nit">${c.municipio||''}, Dpto. de ${c.departamento||''}</div>
      <div style="margin:10px 0"><span class="titulo">COMPROBANTE DE EGRESO</span></div>
      <div style="font-size:11pt"><strong>Egreso N.° ${p.num_egreso||''}</strong></div>
      <div class="badge-cxp">CUENTA POR PAGAR — Vigencia ${p.vigencia_anterior||''}</div>
    </div>

    <div class="seccion">1. DATOS DEL PAGO</div>
    <table>
      <tr><th>Concepto</th><td colspan="3">${p.concepto||''}</td></tr>
      <tr><th>Contrato Ref.</th><td>${p.contrato_ref||'—'}</td>
          <th>Vigencia Anterior</th><td>${p.vigencia_anterior||'—'}</td></tr>
      <tr><th>Fecha de Pago</th><td>${typeof _fechaLarga==='function'?_fechaLarga(p.fecha):p.fecha}</td>
          <th>N° Egreso</th><td>${p.num_egreso||'—'}</td></tr>
    </table>

    <div class="seccion">2. VALOR</div>
    <table>
      <tr><th class="center" style="width:50%">Valor Bruto</th><th class="center">Retención</th><th class="center">Neto a Pagar</th></tr>
      <tr><td class="num" style="font-size:13pt;font-weight:bold">$ ${fmt(p.valor||0)}</td>
          <td class="num">$ ${fmt(p.retencion||0)}${p.concepto_retencion?' ('+p.concepto_retencion+')':''}</td>
          <td class="num" style="font-size:13pt;font-weight:bold;color:#198754">$ ${fmt(p.neto||0)}</td></tr>
      <tr><td colspan="3" style="text-align:center;font-style:italic;font-size:10pt">
          (${typeof numALetras==='function'?numALetras(p.neto||0):''})</td></tr>
    </table>

    <div class="seccion">3. BENEFICIARIO</div>
    <table>
      <tr><th>Beneficiario</th><td>${p.beneficiario||''}</td>
          <th>NIT / CC</th><td>${p.nit||''}</td></tr>
      <tr><th>Banco</th><td>${p.banco||'—'}</td>
          <th>Tipo Cuenta</th><td>${p.tipo_cuenta||'—'}</td></tr>
      <tr><th>N° Cuenta</th><td>${p.cuenta||'—'}</td>
          <th>Teléfono</th><td>${p.telefono||'—'}</td></tr>
    </table>

    <div style="margin-top:40px;display:flex;justify-content:space-around">
      <div class="firma">
        ${firmaTag}
        <div class="firma-nombre">${c.rector||''}</div>
        <div>C.C. ${c.idRector||''}</div>
        <div>Rector(a) — Ordenador del Gasto</div>
      </div>
      <div class="firma">
        <div class="firma-nombre">${p.beneficiario||''}</div>
        <div>${p.nit||''}</div>
        <div>Beneficiario(a)</div>
        <div>RECIBÍ CONFORME</div>
      </div>
    </div>
  </body></html>`;

  const w = window.open('', '_blank');
  if(!w){ toast('Permita ventanas emergentes','danger'); return; }
  w.document.write(html);
  w.document.close();
  toast('Comprobante generado');
}
