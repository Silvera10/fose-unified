/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Funcionalidades Extras
   1. Historial de Cambios / Auditoría
   2. Conciliación Bancaria
   3. Informe para Contraloría
   4. Multi-vigencia
══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   1. HISTORIAL DE CAMBIOS / AUDITORÍA
────────────────────────────────────────────────────────── */

// Registrar cambios automáticamente (llamado desde DB.save)
let _auditPrev = null;
function _registrarAuditoria(d){
  if(!d || !d.config) return;
  const log = d._audit_log || [];
  const ahora = new Date();
  const entrada = {
    ts: ahora.toISOString(),
    fecha: ahora.toLocaleDateString('es-CO'),
    hora: ahora.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
    resumen: _detectarCambios(d)
  };
  if(!entrada.resumen) return; // No registrar si no se detectó cambio significativo
  log.push(entrada);
  // Mantener máximo 200 entradas
  if(log.length > 200) log.splice(0, log.length - 200);
  d._audit_log = log;
}

function _detectarCambios(d){
  // Detectar qué cambió comparando con snapshot anterior
  if(!_auditPrev){
    _auditPrev = _snapshotCounts(d);
    return null; // Primer guardado, no registrar
  }
  const prev = _auditPrev;
  const curr = _snapshotCounts(d);
  _auditPrev = curr;

  const cambios = [];
  if(curr.contratos !== prev.contratos){
    cambios.push(curr.contratos > prev.contratos ? 'Contrato agregado' : 'Contrato eliminado');
  }
  if(curr.pagosDian !== prev.pagosDian){
    cambios.push(curr.pagosDian > prev.pagosDian ? 'Pago DIAN agregado' : 'Pago DIAN eliminado');
  }
  if(curr.acuerdos !== prev.acuerdos){
    cambios.push(curr.acuerdos > prev.acuerdos ? 'Acuerdo presupuestal agregado' : 'Acuerdo eliminado');
  }
  if(curr.personas !== prev.personas){
    cambios.push(curr.personas > prev.personas ? 'Persona agregada al directorio' : 'Persona eliminada');
  }
  // Detectar cambios en rubros (modificaciones presupuestales)
  if(JSON.stringify(curr.modsHash) !== JSON.stringify(prev.modsHash)){
    cambios.push('Modificación presupuestal de egresos');
  }
  if(JSON.stringify(curr.modsIngHash) !== JSON.stringify(prev.modsIngHash)){
    cambios.push('Modificación presupuestal de ingresos');
  }
  // Detectar cambios en config
  if(curr.configHash !== prev.configHash){
    cambios.push('Configuración institucional actualizada');
  }
  // Detectar cambios en ejecución trimestral
  if(JSON.stringify(curr.trimHash) !== JSON.stringify(prev.trimHash)){
    cambios.push('Ejecución trimestral actualizada');
  }
  // Si no detectamos cambios específicos pero algo cambió
  if(!cambios.length) cambios.push('Datos actualizados');
  return cambios.join('; ');
}

function _snapshotCounts(d){
  return {
    contratos: (d.contratos_full||[]).length,
    pagosDian: (d.pagos_dian||[]).length,
    acuerdos: (d.acuerdos||[]).length,
    personas: 0, // personas se manejan aparte
    modsHash: _hashObj(d.mods||{}),
    modsIngHash: _hashObj(d.mods_ing||{}),
    configHash: _hashObj({inst:d.config.institucion, rector:d.config.rector, vig:d.config.vigencia,
      banco1:d.config.banco_1, cierre:d.config.cierre}),
    trimHash: _hashObj((d.trim||{}))
  };
}

function _hashObj(obj){
  try { return JSON.stringify(obj).length; } catch(e){ return 0; }
}

// Renderizar página de auditoría
R.auditoria = function(){
  const d = DB.load();
  const log = (d._audit_log || []).slice().reverse(); // Más reciente primero
  const cont = $('page-auditoria');
  if(!cont) return;

  const filas = log.length
    ? log.map((e,i) => `<tr${i%2?' style="background:#f8f9fa"':''}>
        <td class="text-center" style="font-size:11px">${e.fecha}</td>
        <td class="text-center" style="font-size:11px">${e.hora}</td>
        <td style="font-size:11px">${e.resumen}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" class="text-center text-muted py-3">Sin registros de cambios aún. Los cambios se registran automáticamente al guardar.</td></tr>';

  cont.innerHTML = `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h5 class="mb-0"><i class="bi bi-clock-history me-2 text-primary"></i>Historial de Cambios</h5>
      <div>
        <span class="badge bg-primary me-2">${log.length} registros</span>
        <button class="btn btn-outline-danger btn-sm" onclick="if(confirm('¿Limpiar todo el historial?')){const d=DB.load();d._audit_log=[];DB.save(d);R.auditoria();}">
          <i class="bi bi-trash me-1"></i>Limpiar</button>
      </div>
    </div>
    <table class="table table-bordered table-sm" style="font-size:12px">
      <thead style="background:#1a3a5c;color:#fff">
        <tr><th style="width:100px" class="text-center">Fecha</th>
            <th style="width:70px" class="text-center">Hora</th>
            <th>Acción Realizada</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>`;
};


/* ──────────────────────────────────────────────────────────
   2. CONCILIACIÓN BANCARIA
────────────────────────────────────────────────────────── */

R.conciliacion = function(){
  const d = DB.load();
  const cfg = d.config || {};
  const cont = $('page-conciliacion');
  if(!cont) return;

  // Obtener bancos de la config
  const bancos = [];
  if(cfg.banco_1) bancos.push({ nombre: cfg.banco_1, cuenta: cfg.cuenta_1||'', tipo: cfg.tipo_cuenta_1||'Ahorros' });
  if(cfg.banco_2) bancos.push({ nombre: cfg.banco_2, cuenta: cfg.cuenta_2||'', tipo: cfg.tipo_cuenta_2||'Ahorros' });
  if(cfg.banco_3) bancos.push({ nombre: cfg.banco_3, cuenta: cfg.cuenta_3||'', tipo: cfg.tipo_cuenta_3||'Ahorros' });

  // Calcular ingresos REALMENTE recaudados (solo lo digitado, sin asumir en_banco=100%)
  let totalRecaudo = 0;
  (d.rubros_ing||[]).filter(r=>!r.esGrupo).forEach(r => {
    for(let t=1;t<=4;t++){
      const meses = {1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]}[t]||[];
      meses.forEach(m => { totalRecaudo += Number(((d.recaudos_ing_mes||{})[r.cod]||{})[m]) || 0; });
      totalRecaudo += (d.ingresos||[]).filter(i => i.cod_fuente === r.cod && Number(i.trim) === t)
        .reduce((s,i) => s + (Number(i.valor)||0), 0);
    }
  });

  // Calcular egresos EFECTIVAMENTE PAGADOS (gastos ejecutados por rubro)
  let totalEgresos = 0;
  (d.rubros||[]).filter(r=>!r.esGrupo).forEach(r => {
    for(let t=1;t<=4;t++) totalEgresos += (typeof getGastos==='function' ? getGastos(d,r.cod,t) : 0);
  });
  let totalDian = 0;
  (d.pagos_dian||[]).forEach(p => { totalDian += Number(p.valor||0); });
  const totalPagos = totalEgresos + totalDian;

  // Saldo conciliado
  const saldoBanco = Number(cfg.saldo_banco_conciliacion||0);
  const saldoLibros = totalRecaudo - totalPagos;
  const diferencia = saldoBanco - saldoLibros;

  // Datos de conciliación guardados
  const conc = d._conciliacion || {};

  const bancosHTML = bancos.length
    ? bancos.map((b,i) => `<tr>
        <td>${b.nombre}</td>
        <td class="text-center">${b.tipo}</td>
        <td>${b.cuenta}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" class="text-muted text-center">Registre bancos en Editar Institución</td></tr>';

  cont.innerHTML = `
    <h5 class="mb-3"><i class="bi bi-bank2 me-2 text-primary"></i>Conciliación Bancaria
      <small class="text-muted">— Vigencia ${cfg.vigencia||''}</small></h5>

    <!-- Cuentas bancarias -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#1a3a5c;color:#fff"><i class="bi bi-bank me-1"></i>Cuentas Bancarias Registradas</div>
      <div class="card-body p-0">
        <table class="table table-sm table-bordered mb-0" style="font-size:12px">
          <thead><tr><th>Banco</th><th class="text-center">Tipo</th><th>N° Cuenta</th></tr></thead>
          <tbody>${bancosHTML}</tbody>
        </table>
      </div>
    </div>

    <!-- Resumen -->
    <div class="row g-3 mb-3">
      <div class="col-md-4">
        <div class="card border-success">
          <div class="card-body text-center py-2">
            <div class="small text-muted">Total Recaudado (Ingresos)</div>
            <div class="fs-5 fw-bold text-success">${fmt(totalRecaudo)}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-danger">
          <div class="card-body text-center py-2">
            <div class="small text-muted">Total Pagado (Egresos + DIAN)</div>
            <div class="fs-5 fw-bold text-danger">${fmt(totalPagos)}</div>
            <div class="small text-muted">Contratos: ${fmt(totalEgresos)} | DIAN: ${fmt(totalDian)}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-primary">
          <div class="card-body text-center py-2">
            <div class="small text-muted">Saldo en Libros</div>
            <div class="fs-5 fw-bold text-primary">${fmt(saldoLibros)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario conciliación -->
    <div class="card mb-3">
      <div class="card-header py-2" style="background:#2c3e50;color:#fff"><i class="bi bi-clipboard-check me-1"></i>Conciliación</div>
      <div class="card-body">
        <div class="row g-2 mb-2">
          <div class="col-md-3">
            <label class="form-label small fw-bold">Fecha Conciliación</label>
            <input type="date" class="form-control form-control-sm" id="conc-fecha" value="${conc.fecha||''}">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold">Saldo según Extracto Bancario</label>
            <input type="number" class="form-control form-control-sm" id="conc-saldo-banco" value="${conc.saldo_banco||''}" oninput="_calcConciliacion()">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold">Saldo en Libros</label>
            <input type="number" class="form-control form-control-sm bg-light" id="conc-saldo-libros" value="${saldoLibros}" readonly>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold">Diferencia</label>
            <input type="number" class="form-control form-control-sm" id="conc-diferencia" readonly
              style="font-weight:700;${diferencia===0?'background:#e8f5e9;color:#1b5e20':'background:#ffebee;color:#b71c1c'}">
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label small">Cheques Pendientes / Notas Débito</label>
            <input type="number" class="form-control form-control-sm" id="conc-cheques" value="${conc.cheques||0}" oninput="_calcConciliacion()">
          </div>
          <div class="col-md-6">
            <label class="form-label small">Consignaciones en Tránsito / Notas Crédito</label>
            <input type="number" class="form-control form-control-sm" id="conc-transito" value="${conc.transito||0}" oninput="_calcConciliacion()">
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label small">Observaciones</label>
          <textarea class="form-control form-control-sm" id="conc-obs" rows="2">${conc.observaciones||''}</textarea>
        </div>
        <button class="btn btn-primary btn-sm" onclick="_guardarConciliacion()"><i class="bi bi-check-lg me-1"></i>Guardar Conciliación</button>
      </div>
    </div>`;

  _calcConciliacion();
};

function _calcConciliacion(){
  const saldoBanco = Number($('conc-saldo-banco')?.value||0);
  const saldoLibros = Number($('conc-saldo-libros')?.value||0);
  const cheques = Number($('conc-cheques')?.value||0);
  const transito = Number($('conc-transito')?.value||0);
  const saldoConciliado = saldoBanco - cheques + transito;
  const diferencia = saldoConciliado - saldoLibros;
  const el = $('conc-diferencia');
  if(el){
    el.value = diferencia;
    el.style.background = Math.abs(diferencia) < 1 ? '#e8f5e9' : '#ffebee';
    el.style.color = Math.abs(diferencia) < 1 ? '#1b5e20' : '#b71c1c';
  }
}

function _guardarConciliacion(){
  const d = DB.load();
  d._conciliacion = {
    fecha: $('conc-fecha').value,
    saldo_banco: Number($('conc-saldo-banco').value)||0,
    cheques: Number($('conc-cheques').value)||0,
    transito: Number($('conc-transito').value)||0,
    observaciones: $('conc-obs').value.trim()
  };
  DB.save(d);
  toast('Conciliación guardada');
}


/* ──────────────────────────────────────────────────────────
   3. INFORME PARA CONTRALORÍA
────────────────────────────────────────────────────────── */

function genInformeContraloria(d, trim){
  const esTrim = trim > 0;
  const TRIM_NOM = ['','PRIMER','SEGUNDO','TERCER','CUARTO'];
  const cfg = d.config || {};
  const vig = cfg.vigencia || new Date().getFullYear();
  const periodoLbl = esTrim ? `${TRIM_NOM[trim]} TRIMESTRE — Vigencia ${vig}` : `Acumulado Anual — Vigencia ${vig}`;

  // ═══ INGRESOS ═══
  let ingIni=0, ingDef=0, ingRec=0;
  const rowsIng = (d.rubros_ing||[]).filter(r=>!r.esGrupo).map(r => {
    const ini = Number(r.ini||0);
    let pd=0, rec=0;
    if(esTrim){
      pd = typeof getPresupDispIng==='function' ? getPresupDispIng(d,r.cod,trim) : ini;
      rec = typeof getRecaudoEfectivoIng==='function' ? getRecaudoEfectivoIng(d,r.cod,trim) : 0;
    } else {
      const mi1=getModsAnioIng(d,r.cod,'adi'), mi2=getModsAnioIng(d,r.cod,'cre');
      const mr1=getModsAnioIng(d,r.cod,'red'), mr2=getModsAnioIng(d,r.cod,'cco');
      pd = ini+mi1+mi2-mr1-mr2;
      rec = typeof getRecaudoEfectivoIng==='function' ? getRecaudoEfectivoIng(d,r.cod,0) : 0;
    }
    ingIni+=ini; ingDef+=pd; ingRec+=rec;
    const pct = pd>0?(rec/pd*100).toFixed(1):'0.0';
    return `<tr>
      <td><code>${r.cod}</code></td>
      <td style="text-align:left">${r.con}</td>
      <td class="num">${fmt(ini)}</td>
      <td class="num fw-bold">${fmt(pd)}</td>
      <td class="num">${rec>0?fmt(rec):'—'}</td>
      <td class="ctr">${pct}%</td></tr>`;
  }).join('');

  // ═══ EGRESOS ═══
  let egIni=0, egDef=0, egComp=0, egPag=0;
  const rowsEg = d.rubros.filter(r=>!r.esGrupo).map(r => {
    const ini = Number(r.ini||0);
    let pd=0, gas=0, comp=0;
    if(esTrim){
      pd = typeof getPresupDisp==='function' ? getPresupDisp(d,r.cod,trim) : ini;
      gas = typeof getGastos==='function' ? getGastos(d,r.cod,trim) : 0;
      comp = typeof getCompromisoEgTrim==='function' ? getCompromisoEgTrim(d,r.cod,trim) : 0;
    } else {
      for(let tt=1;tt<=4;tt++){
        const m=getMods(d,r.cod,tt);
        pd+=Number(m.adi)-Number(m.red)+Number(m.cre)-Number(m.cco);
        gas+=typeof getGastos==='function'?getGastos(d,r.cod,tt):0;
        comp+=typeof getCompromisoEgTrim==='function'?getCompromisoEgTrim(d,r.cod,tt):0;
      }
      pd+=ini;
    }
    const saldo = pd-gas-comp;
    egIni+=ini; egDef+=pd; egComp+=comp; egPag+=gas;
    const pct = pd>0?((gas+comp)/pd*100).toFixed(1):'0.0';
    return `<tr>
      <td><code>${r.cod}</code></td>
      <td style="text-align:left">${r.con}</td>
      <td class="num">${fmt(ini)}</td>
      <td class="num fw-bold">${fmt(pd)}</td>
      <td class="num">${comp>0?fmt(comp):'—'}</td>
      <td class="num">${gas>0?fmt(gas):'—'}</td>
      <td class="num${saldo<0?' saldo-neg':''}">${fmt(saldo)}</td>
      <td class="ctr">${pct}%</td></tr>`;
  }).join('');

  // ═══ CONTRATOS ═══
  const contratos = d.contratos_full || [];
  const ctFiltro = esTrim ? contratos.filter(c => {
    if(!c.fecha_cdp) return false;
    const m = Number(c.fecha_cdp.split('-')[1]);
    const tMeses = {1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]};
    return tMeses[trim].includes(m);
  }) : contratos;

  const rowsCt = ctFiltro.map((c,i) => `<tr>
    <td class="ctr">${i+1}</td>
    <td>${c.numero||'—'}</td>
    <td style="text-align:left;max-width:200px;overflow:hidden;text-overflow:ellipsis">${c.objeto||'—'}</td>
    <td>${c.contratista_nombre||'—'}</td>
    <td class="num">${fmt(Number(c.valor||0))}</td>
    <td class="ctr">${c.fecha_inicio||'—'}</td>
    <td class="ctr">${c.fecha_fin||'—'}</td>
    <td class="ctr">${c.estado||'—'}</td>
  </tr>`).join('') || '<tr><td colspan="8" class="ctr text-muted">Sin contratos en el período</td></tr>';

  const totalCt = ctFiltro.reduce((s,c)=>s+Number(c.valor||0),0);

  // ═══ PAGOS DIAN ═══
  const pagosDian = d.pagos_dian || [];
  const pdFiltro = esTrim ? pagosDian.filter(p => {
    if(!p.fecha) return false;
    const m = Number(p.fecha.split('-')[1]);
    const tMeses = {1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]};
    return tMeses[trim].includes(m);
  }) : pagosDian;

  const rowsPd = pdFiltro.map((p,i) => `<tr>
    <td class="ctr">${i+1}</td>
    <td>${p.concepto||'—'}</td>
    <td>${p.periodo||'—'}</td>
    <td class="num">${fmt(Number(p.valor||0))}</td>
    <td class="ctr">${p.fecha||'—'}</td>
    <td>${p.num_egreso||'—'}</td>
  </tr>`).join('') || '<tr><td colspan="6" class="ctr text-muted">Sin pagos DIAN en el período</td></tr>';

  const totalPd = pdFiltro.reduce((s,p)=>s+Number(p.valor||0),0);

  return _infHdr(d, 'INFORME DE GESTIÓN PRESUPUESTAL PARA CONTRALORÍA', periodoLbl) +
  `<div style="margin:8px 0;padding:8px;background:#e8eaf6;border-left:4px solid #283593;font-size:10px;line-height:1.5">
    <strong>Institución:</strong> ${cfg.institucion||''} | <strong>NIT:</strong> ${cfg.nit||''}${cfg.dv?'-'+cfg.dv:''} |
    <strong>Rector(a):</strong> ${cfg.rector||''} | <strong>Municipio:</strong> ${cfg.municipio||''}, ${cfg.departamento||''}
  </div>

  <h6 style="color:#1a237e;margin:14px 0 6px;font-size:11px"><i class="bi bi-arrow-down-circle me-1"></i>1. EJECUCIÓN DE INGRESOS</h6>
  <table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th style="text-align:left">Concepto</th>
    <th>Pres. Inicial</th><th>Pres. Definitivo</th><th>Recaudado</th><th>% Recaudo</th>
  </tr></thead><tbody>${rowsIng}
  <tr class="gtot"><td colspan="2">TOTAL INGRESOS</td>
    <td class="num">${fmt(ingIni)}</td><td class="num">${fmt(ingDef)}</td>
    <td class="num">${fmt(ingRec)}</td><td class="ctr">${ingDef>0?(ingRec/ingDef*100).toFixed(1):'0.0'}%</td></tr>
  </tbody></table>

  <h6 style="color:#1a237e;margin:14px 0 6px;font-size:11px"><i class="bi bi-arrow-up-circle me-1"></i>2. EJECUCIÓN DE EGRESOS</h6>
  <table class="ti" style="font-size:10px"><thead><tr>
    <th>Cuenta</th><th style="text-align:left">Concepto</th>
    <th>Pres. Inicial</th><th>Pres. Definitivo</th><th>Compromisos</th><th>Pagado</th><th>Saldo</th><th>% Ejec</th>
  </tr></thead><tbody>${rowsEg}
  <tr class="gtot"><td colspan="2">TOTAL EGRESOS</td>
    <td class="num">${fmt(egIni)}</td><td class="num">${fmt(egDef)}</td>
    <td class="num">${fmt(egComp)}</td><td class="num">${fmt(egPag)}</td>
    <td class="num">${fmt(egDef-egPag-egComp)}</td>
    <td class="ctr">${egDef>0?((egPag+egComp)/egDef*100).toFixed(1):'0.0'}%</td></tr>
  </tbody></table>

  <h6 style="color:#1a237e;margin:14px 0 6px;font-size:11px"><i class="bi bi-file-earmark-text me-1"></i>3. RELACIÓN DE CONTRATOS (${ctFiltro.length})</h6>
  <table class="ti" style="font-size:9px"><thead><tr>
    <th>#</th><th>N° Contrato</th><th style="text-align:left">Objeto</th><th>Contratista</th>
    <th>Valor</th><th>Inicio</th><th>Fin</th><th>Estado</th>
  </tr></thead><tbody>${rowsCt}
  <tr class="gtot"><td colspan="4">TOTAL CONTRATOS</td>
    <td class="num">${fmt(totalCt)}</td><td colspan="3"></td></tr>
  </tbody></table>

  <h6 style="color:#1a237e;margin:14px 0 6px;font-size:11px"><i class="bi bi-cash-coin me-1"></i>4. PAGOS DIAN / IMPUESTOS (${pdFiltro.length})</h6>
  <table class="ti" style="font-size:10px"><thead><tr>
    <th>#</th><th>Concepto</th><th>Período</th><th>Valor</th><th>Fecha</th><th>N° Egreso</th>
  </tr></thead><tbody>${rowsPd}
  <tr class="gtot"><td colspan="3">TOTAL PAGOS DIAN</td>
    <td class="num">${fmt(totalPd)}</td><td colspan="2"></td></tr>
  </tbody></table>

  <h6 style="color:#37474f;margin:14px 0 6px;font-size:11px"><i class="bi bi-balance-scale me-1"></i>5. RESUMEN GENERAL</h6>
  <table class="ti" style="font-size:10px;max-width:500px"><tbody>
    <tr style="background:#e8f5e9"><td style="padding:6px 8px;font-weight:700">Presupuesto Definitivo Ingresos</td>
      <td class="num" style="padding:6px 8px;font-weight:700">${fmt(ingDef)}</td></tr>
    <tr style="background:#e3f2fd"><td style="padding:6px 8px;font-weight:700">Presupuesto Definitivo Egresos</td>
      <td class="num" style="padding:6px 8px;font-weight:700">${fmt(egDef)}</td></tr>
    <tr><td style="padding:6px 8px">Total Recaudado</td><td class="num" style="padding:6px 8px">${fmt(ingRec)}</td></tr>
    <tr><td style="padding:6px 8px">Total Pagado (Contratos)</td><td class="num" style="padding:6px 8px">${fmt(egPag)}</td></tr>
    <tr><td style="padding:6px 8px">Total Pagado (DIAN)</td><td class="num" style="padding:6px 8px">${fmt(totalPd)}</td></tr>
    <tr><td style="padding:6px 8px">Compromisos Pendientes</td><td class="num" style="padding:6px 8px">${fmt(egComp)}</td></tr>
    <tr style="background:#263238;color:#fff"><td style="padding:6px 8px;font-weight:800">DISPONIBLE (Recaudado - Pagado - DIAN)</td>
      <td class="num" style="padding:6px 8px;font-weight:800">${fmt(ingRec - egPag - totalPd)}</td></tr>
  </tbody></table>`;
}


/* ──────────────────────────────────────────────────────────
   4. MULTI-VIGENCIA
────────────────────────────────────────────────────────── */

// La multi-vigencia se maneja a través de la gestión de instituciones.
// Cada institución puede tener una vigencia diferente (config.vigencia).
// Para cambiar de vigencia, se crea una nueva "institución" con la misma
// info pero vigencia diferente, o se cambia en Editar Institución.
// Aquí agregamos un atajo para duplicar la vigencia actual.

function duplicarVigencia(nuevaVigencia){
  if(!nuevaVigencia || isNaN(Number(nuevaVigencia))){
    toast('Ingrese un año válido','warning'); return;
  }
  const d = DB.load();
  const cfg = d.config;
  const vigActual = cfg.vigencia || '';
  if(nuevaVigencia === vigActual){
    toast('La vigencia ya es '+nuevaVigencia,'warning'); return;
  }
  if(!confirm(`¿Crear copia de "${cfg.institucion}" para vigencia ${nuevaVigencia}?\n\nSe copiarán: rubros, fuentes de ingreso y configuración.\nNO se copiarán: contratos, pagos, ejecución trimestral ni acuerdos.`)) return;

  // Crear nueva institución con los mismos rubros pero sin datos de ejecución
  const nuevoNombre = cfg.institucion + ' — Vigencia ' + nuevaVigencia;
  DB.addInst(nuevoNombre).then(async (id) => {
    const newD = DB.initVacio(nuevoNombre, cfg.nit, cfg.rector, cfg.idRector,
      cfg.dv, cfg.departamento, cfg.municipio, cfg.direccion, cfg.email, nuevaVigencia);
    // Copiar config extendida
    newD.config.secretaria = cfg.secretaria||'';
    newD.config.ciudad = cfg.ciudad||'';
    newD.config.smlv = cfg.smlv||1423500;
    newD.config.acuerdo = cfg.acuerdo||'';
    newD.config.firma_rector = cfg.firma_rector||'';
    newD.config.banco_1 = cfg.banco_1||''; newD.config.cuenta_1 = cfg.cuenta_1||''; newD.config.tipo_cuenta_1 = cfg.tipo_cuenta_1||'';
    newD.config.banco_2 = cfg.banco_2||''; newD.config.cuenta_2 = cfg.cuenta_2||''; newD.config.tipo_cuenta_2 = cfg.tipo_cuenta_2||'';
    newD.config.banco_3 = cfg.banco_3||''; newD.config.cuenta_3 = cfg.cuenta_3||''; newD.config.tipo_cuenta_3 = cfg.tipo_cuenta_3||'';
    // Copiar rubros de egresos (sin valores)
    newD.rubros = (d.rubros||[]).map(r => ({
      cod:r.cod, guia:r.guia||'', con:r.con, tipo:r.tipo||'fun', esGrupo:r.esGrupo||false, ini:0,
      cuenta_contable:r.cuenta_contable||'', sifse_fuente:r.sifse_fuente||'', sifse_item:r.sifse_item||''
    }));
    newD.rubros_ing = (d.rubros_ing||[]).map(r => ({
      cod:r.cod, guia:r.guia||'', con:r.con, esGrupo:r.esGrupo||false, ini:0,
      en_banco:r.en_banco||false, sifse_fuente:r.sifse_fuente||''
    }));
    // Inicializar mods vacíos
    newD.mods = {};
    newD.rubros.forEach(r => { newD.mods[r.cod]={1:{adi:0,red:0,cre:0,cco:0},2:{adi:0,red:0,cre:0,cco:0},3:{adi:0,red:0,cre:0,cco:0},4:{adi:0,red:0,cre:0,cco:0}}; });
    newD.mods_ing = {};
    newD.rubros_ing.forEach(r => { newD.mods_ing[r.cod]={1:{adi:0,red:0,cre:0,cco:0},2:{adi:0,red:0,cre:0,cco:0},3:{adi:0,red:0,cre:0,cco:0},4:{adi:0,red:0,cre:0,cco:0}}; });
    // Copiar mapeo SIFSE
    if(d.sifse_mapeo) newD.sifse_mapeo = JSON.parse(JSON.stringify(d.sifse_mapeo));

    await DB._put('instituciones', id, newD);
    await DB.setActive(id);
    navUpdate(); renderListaInstituciones(); recargarApp();
    toast(`Vigencia ${nuevaVigencia} creada exitosamente. Se copiaron rubros y configuración.`);
  }).catch(e => { console.error(e); toast('Error creando vigencia','danger'); });
}
