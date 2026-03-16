/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Importadores de Datos
══════════════════════════════════════════════════════════ */

/* ── Importar FOSE HTML (backup con datos embebidos) ── */
async function importarFOSE(input){
  const file = input.files[0];
  if(!file) return;
  const setP = (pct, msg) => {
    $('import-progress').classList.remove('d-none');
    $('import-bar').style.width = pct+'%';
    $('import-msg').textContent = msg;
  };

  try {
    setP(10, 'Leyendo archivo HTML...');
    const text = await file.text();

    // Buscar datos embebidos en <script id="fose-backup-embed">
    setP(30, 'Buscando datos embebidos...');
    let foseData = null;

    // Método 1: fose-backup-embed script tag
    const m1 = text.match(/<script[^>]+id\s*=\s*["']fose-backup-embed["'][^>]*>([\s\S]*?)<\/script>/i);
    if(m1 && m1[1].trim()){
      try { foseData = JSON.parse(m1[1].trim()); } catch(e){}
    }

    // Método 2: fose-data script tag
    if(!foseData){
      const m2 = text.match(/<script[^>]+id\s*=\s*["']fose-data["'][^>]*>([\s\S]*?)<\/script>/i);
      if(m2 && m2[1].trim()){
        try { foseData = JSON.parse(m2[1].trim()); } catch(e){}
      }
    }

    // Método 3: Buscar datos en localStorage embebidos en el HTML
    if(!foseData){
      const m3 = text.match(/localStorage\.setItem\s*\(\s*["']fose_v4_inst_[^"']+["']\s*,\s*["']([\s\S]*?)["']\s*\)/);
      if(m3){
        try { foseData = JSON.parse(m3[1]); } catch(e){}
      }
    }

    if(!foseData){
      // Método 4: Buscar cualquier JSON grande en el HTML que parezca datos FOSE
      const jsonBlocks = text.match(/\{[\s\S]*?"config"[\s\S]*?"rubros"[\s\S]*?\}/g);
      if(jsonBlocks){
        for(const block of jsonBlocks){
          try {
            const parsed = JSON.parse(block);
            if(parsed.config && parsed.rubros){
              foseData = parsed; break;
            }
          } catch(e){}
        }
      }
    }

    if(!foseData){
      toast('No se encontraron datos en el archivo HTML','danger');
      setP(100, 'Error: sin datos');
      input.value = '';
      return;
    }

    setP(50, 'Procesando datos...');

    // Si viene como formato fose_unified_v1, restaurar directamente
    if(foseData._format === 'fose_unified_v1'){
      await DB.importarTodo(foseData);
      navUpdate(); recargarApp();
      setP(100, 'Importación completa');
      toast('Datos FOSE Unified restaurados');
      input.value = '';
      return;
    }

    // Si viene como datos FOSE legacy (un solo objeto de institución)
    if(foseData.config && foseData.rubros){
      setP(70, 'Importando institución FOSE...');
      const nombre = foseData.config.institucion || 'Importada FOSE';
      const id = await DB.addInst(nombre);

      // Mapear estructura: FOSE usa "contratos" para gastos simples
      const d = {
        config: foseData.config || {},
        rubros: foseData.rubros || [],
        rubros_ing: foseData.rubros_ing || [],
        mods: foseData.mods || {},
        mods_eg: foseData.mods_eg || [],
        mods_ing: foseData.mods_ing || {},
        mods_ing_form: foseData.mods_ing_form || [],
        contratos: foseData.contratos || [],  // gastos simples
        ingresos: foseData.ingresos || [],
        recaudos_ing_mes: foseData.recaudos_ing_mes || {},
        compromisos_eg: foseData.compromisos_eg || [],
        pagos_eg: foseData.pagos_eg || [],
        contratos_full: foseData.contratos_full || [],
        pagos_dian: foseData.pagos_dian || []
      };

      // Asegurar cierre
      if(!d.config.cierre) d.config.cierre = {numero:'',fecha:'',fundamento:'',cuentas:[],por_pagar:[]};

      await DB._put('instituciones', id, d);
      await DB.setActive(id);

      // Importar personas si existen
      if(foseData.personas && Array.isArray(foseData.personas) && foseData.personas.length){
        setP(85, `Importando ${foseData.personas.length} personas...`);
        const existentes = DB._personas || [];
        foseData.personas.forEach(p => {
          const doc = String(p.numdoc || p.num_documento || '');
          if(doc && !existentes.find(x => String(x.numdoc) === doc)){
            existentes.push(p);
          }
        });
        await DB.savePersonas(existentes);
      }

      navUpdate(); recargarApp();
      setP(100, `Importada: ${nombre}`);
      toast(`Institución "${nombre}" importada desde FOSE`);
    }

    // Si viene como lista de instituciones (backup multi)
    else if(foseData.fose_v4_instituciones || foseData.instituciones){
      setP(60, 'Importando múltiples instituciones...');
      const rawList = foseData.fose_v4_instituciones || foseData.instituciones;
      let list;
      try { list = typeof rawList === 'string' ? JSON.parse(rawList) : rawList; } catch(e){ list = []; }

      for(const inst of list){
        const dataKey = `fose_v4_inst_${inst.id}`;
        const rawData = foseData[dataKey];
        if(!rawData) continue;
        const instData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const id = await DB.addInst(inst.nombre);
        instData.contratos_full = instData.contratos_full || [];
        if(!instData.config.cierre) instData.config.cierre = {numero:'',fecha:'',fundamento:'',cuentas:[],por_pagar:[]};
        await DB._put('instituciones', id, instData);
      }

      if(DB.getInstituciones().length > 0){
        await DB.setActive(DB.getInstituciones()[0].id);
      }
      navUpdate(); recargarApp();
      setP(100, `${list.length} instituciones importadas`);
      toast(`${list.length} instituciones importadas desde FOSE`);
    }

  } catch(e){
    console.error('Error importando FOSE:', e);
    toast('Error al importar: ' + e.message, 'danger');
    setP(100, 'Error');
  }
  input.value = '';
}

/* ── Importar datos SQLite exportados a JSON ── */
async function importarSQLiteJSON(input){
  const file = input.files[0];
  if(!file) return;
  const setP = (pct, msg) => {
    $('import-progress').classList.remove('d-none');
    $('import-bar').style.width = pct+'%';
    $('import-msg').textContent = msg;
  };

  try {
    setP(10, 'Leyendo archivo JSON...');
    const data = JSON.parse(await file.text());

    // Importar personas
    if(data.personas && data.personas.length){
      setP(30, `Importando ${data.personas.length} personas...`);
      const personas = DB._personas || [];
      data.personas.forEach(p => {
        const docNum = String(p.num_documento || p.cedula || p.numdoc || '');
        if(!personas.find(x => x.numdoc === docNum)){
          personas.push({
            id: uid(),
            nombre: p.nombres_apellidos || p.nombre || '',
            cargo: p.cargo || '',
            tipodoc: p.tipo_documento || p.tipo_doc || 'CC',
            numdoc: docNum,
            telefono: p.celular || p.telefono || '',
            email: p.email || '',
            direccion: p.direccion || '',
            banco: p.nombre_banco || p.banco || '',
            tipocuenta: p.tipo_cuenta || 'Ahorros',
            numcuenta: p.cuenta_bancaria || p.cuenta_numero || '',
            municipio: p.municipio || '',
            rep_legal_nombre: p.rep_legal_nombre || '',
            rep_legal_numdoc: p.rep_legal_num_documento || ''
          });
        }
      });
      await DB.savePersonas(personas);
    }

    // Importar instituciones con contratos
    if(data.instituciones && data.instituciones.length){
      setP(50, 'Importando instituciones...');
      for(const inst of data.instituciones){
        const nombre = inst.nombre || inst.institucion || 'Importada';
        const existing = DB.getInstituciones().find(i => i.nombre === nombre);
        let id;
        if(existing){
          id = existing.id;
        } else {
          id = await DB.addInst(nombre);
          const d = DB.initVacio(nombre, inst.nit||'', inst.rector||'', inst.cc_rector||'',
            inst.dv||'', inst.departamento||'', inst.municipio||'',
            inst.direccion||'', inst.email||'', inst.vigencia||'');
          await DB._put('instituciones', id, d);
        }

        // Importar contratos de esta institución
        const contratos = (data.contratos||[]).filter(c =>
          c.institucion_id === inst.id || c.institucion_nombre === inst.nombre
        );
        if(contratos.length){
          setP(70, `Importando ${contratos.length} contratos de ${nombre}...`);
          const instData = await DB._get('instituciones', id) || DB.initVacio();

          contratos.forEach(c => {
            // Normalizar cotizaciones con todos los campos extendidos
            const cotizaciones = [];
            for(let i=1; i<=3; i++){
              const cot = {
                nombre: c[`cot${i}_nombre`]||'',
                nit: c[`cot${i}_cc`]||c[`cot${i}_nit`]||'',
                valor: Number(c[`cot${i}_valor`])||0,
                seleccionada: !!c[`cot${i}_seleccionada`],
                hora: c[`cot${i}_hora`]||'',
                ampm: c[`cot${i}_ampm`]||'AM',
                fecha: c[`cot${i}_fecha`]||'',
                municipio: c[`cot${i}_municipio`]||'',
                rep_legal: c[`cot${i}_rep_legal`]||'',
                email: c[`cot${i}_email`]||'',
                documentacion: c[`cot${i}_documentacion`]||''
              };
              if(cot.nombre || cot.valor) cotizaciones.push(cot);
            }

            // Normalizar items UNSPSC desde items_json
            let items = [];
            if(c.items_json){
              try {
                const rawItems = typeof c.items_json === 'string' ? JSON.parse(c.items_json) : c.items_json;
                items = rawItems.map(it => ({
                  codigo: it.unsp || it.codigo || '',
                  descripcion: it.descripcion || '',
                  cantidad: Number(it.cantidad)||0,
                  valor_unit: Number(it.valor_unitario)||0,
                  valor_total: Number(it.valor_total)||0,
                  unidad: it.unidad||'UND',
                  cod_clase: it.cod_clase||'',
                  nom_clase: it.nom_clase||''
                }));
              } catch(e){ console.warn('Error parseando items_json:', e); }
            }

            instData.contratos_full.push({
              id: uid(),
              numero: c.numero || c.numero_contrato || '',
              tipo: c.tipo_contrato || c.tipo || '',
              modalidad: c.modalidad_seleccion || c.modalidad || '',
              estado: c.estado || 'En ejecucion',
              objeto: c.objeto || '',
              obligaciones: c.obligaciones === 'None' ? '' : (c.obligaciones||''),
              valor: Number(c.valor_total || c.valor) || 0,
              fecha_inicio: c.fecha_inicio || '',
              fecha_fin: c.fecha_fin || c.fecha_terminacion || '',
              plazo: Number(c.dias_duracion || c.plazo) || 0,
              // Fechas proceso
              fecha_estudio_previo: c.fecha_estudio_previo || '',
              fecha_presentacion_oferta: c.fecha_presentacion_oferta || '',
              fecha_evaluacion: c.fecha_evaluacion || '',
              forma_pago: c.forma_pago || '',
              fecha_aprobacion_plan_compras: c.fecha_aprobacion_plan_compras || '',
              fecha_modificacion_plan_compras: c.fecha_modificacion_plan_compras || '',
              fecha_creacion: c.fecha_creacion || '',
              // Contratista
              contratista_nombre: c.nombre_contratista || c.contratista_nombre || c.contratista || '',
              contratista_tipodoc: c.tipo_id_contratista || c.contratista_tipo_doc || 'CC',
              contratista_numdoc: String(c.num_id_contratista || c.contratista_cedula || c.contratista_numdoc || ''),
              contratista_direccion: c.direccion_contratista || c.contratista_direccion || '',
              contratista_telefono: c.celular_contratista || c.contratista_telefono || '',
              contratista_email: c.email_contratista || c.contratista_email || '',
              contratista_banco: c.banco_contratista || c.contratista_banco || '',
              contratista_tipocuenta: c.tipo_cuenta || c.contratista_tipo_cuenta || 'Ahorros',
              contratista_numcuenta: c.cuenta_banco || c.contratista_cuenta_numero || '',
              // Presupuesto
              rubro: c.rubro_codigo || c.rubro || '',
              rubro_nombre: c.rubro_nombre || '',
              fuente: c.fuente || 'FSE',
              cuenta_contable: c.cuenta_contable || '',
              cdp: c.num_cdp || c.cdp || '',
              fecha_cdp: c.fecha_cdp || '',
              rp: c.num_rp || c.rp || '',
              fecha_rp: c.fecha_rp || '',
              saldo_cdp: Number(c.saldo_cdp) || 0,
              saldo_rp: Number(c.saldo_rp) || 0,
              saldo_contrato: Number(c.saldo_contrato) || 0,
              saldo_ppto: Number(c.saldo_ppto) || 0,
              saldo_compromiso: Number(c.saldo_compromiso) || 0,
              // Bancos institución
              banco_inst_1: c.banco_inst_1 || '',
              cta_inst_1: c.cta_inst_1 || '',
              banco_inst_2: c.banco_inst_2 || '',
              cta_inst_2: c.cta_inst_2 || '',
              banco_inst_3: c.banco_inst_3 || '',
              cta_inst_3: c.cta_inst_3 || '',
              banco_inst_sel: c.banco_inst_sel || '1',
              // Cotizaciones e items
              cotizaciones,
              items,
              // Pagos parciales
              pagos: c.pagos || [],
              // Pagos legacy
              retefuente: Number(c.retencion || c.retefuente) || 0,
              reteica: Number(c.reteica) || 0,
              iva: Number(c.valor_iva || c.iva) || 0,
              neto_pagar: Number(c.neto_pagar) || 0,
              num_egreso: c.num_egreso || c.numero_egreso || '',
              num_factura: c.num_factura || c.numero_factura || '',
              fecha_pago: c.fecha_pago || '',
              fecha_egreso: c.fecha_egreso || '',
              valor_pagado: Number(c.valor_pagado) || 0,
              // Supervisión
              supervisor_nombre: c.nombre_supervisor || c.supervisor_nombre || '',
              supervisor_tipodoc: c.supervisor_tipo_doc || 'CC',
              supervisor_numdoc: String(c.supervisor_cedula || c.supervisor_numdoc || ''),
              cargo_supervisor: c.cargo_supervisor || '',
              fecha_acta_inicio: c.fecha_acta_inicio || c.fecha_inicio || '',
              fecha_acta_final: c.fecha_acta_final || '',
              fecha_liquidacion: c.fecha_liquidacion || '',
              observaciones: c.observaciones || ''
            });
          });

          await DB._put('instituciones', id, instData);
        }
      }

      if(DB.getInstituciones().length > 0 && !DB.getActiveId()){
        await DB.setActive(DB.getInstituciones()[0].id);
      }
    }

    navUpdate(); recargarApp();
    setP(100, 'Importación SQLite completa');
    toast('Datos SQLite importados exitosamente');

  } catch(e){
    console.error('Error importando SQLite:', e);
    toast('Error: ' + e.message, 'danger');
    setP(100, 'Error');
  }
  input.value = '';
}

/* ── Cargar catálogo UNSPSC desde data/unspsc.json ── */
async function cargarUNSPSC(){
  const setP = (pct, msg) => {
    $('import-progress').classList.remove('d-none');
    $('import-bar').style.width = pct+'%';
    $('import-msg').textContent = msg;
  };

  try {
    setP(10, 'Cargando catálogo UNSPSC...');
    const resp = await fetch('data/unspsc.json');
    if(!resp.ok) throw new Error('No se encontró data/unspsc.json');
    setP(40, 'Parseando catálogo...');
    const data = await resp.json();

    // Normalizar formato
    const catalogo = data.map(u => ({
      codigo: u.codigo || u.code || '',
      nombre: u.nombre || u.name || u.descripcion || '',
      nivel: u.nivel || u.level || '',
      segmento: u.segmento || '',
      segmento_nombre: u.segmento_nombre || '',
      familia: u.familia || '',
      familia_nombre: u.familia_nombre || '',
      clase: u.clase || '',
      clase_nombre: u.clase_nombre || ''
    }));

    setP(70, `Guardando ${catalogo.length} productos en IndexedDB...`);
    await DB.saveUNSPSC(catalogo);
    setP(100, `${catalogo.length} productos UNSPSC cargados`);
    toast(`Catálogo UNSPSC cargado (${catalogo.length} productos)`);
  } catch(e){
    console.error('Error cargando UNSPSC:', e);
    toast('Error: ' + e.message, 'danger');
    setP(100, 'Error');
  }
}
