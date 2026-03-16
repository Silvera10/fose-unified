/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Utilidades
══════════════════════════════════════════════════════════ */

const $  = id => document.getElementById(id);
const fmt = n => Number(n||0).toLocaleString('es-CO',{minimumFractionDigits:0,maximumFractionDigits:0});
const uid = () => Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
const today = () => new Date().toISOString().slice(0,10);

const MESES_TRIM = {1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12]};
const MES_NOMBRE = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const GRUPO_LABELS = {
  '2':'GASTOS','2.1':'FUNCIONAMIENTO','2.1.1':'SERVICIOS PERSONALES',
  '2.1.2':'GASTOS GENERALES','2.1.3':'TRANSFERENCIAS',
  '2.2':'INVERSIÓN','2.2.1':'PROYECTOS DE INVERSIÓN',
  'A':'INGRESOS','A.1':'OPERACIONALES','A.2':'NO OPERACIONALES',
  'A.3':'TRANSFERENCIAS Y APORTES'
};

const GRUPO_LABELS_ING = {
  '1':'INGRESOS CORRIENTES',
  '2.1':'TRANSFERENCIAS DEL SISTEMA GENERAL DE PARTICIPACIONES',
  '3.1':'GRUPO 3.1'
};

/* ── Toast de notificación ── */
let _toastEl = null;
function toast(msg, type='success'){
  if (!_toastEl){
    const div = document.createElement('div');
    div.id = 'app-toast';
    div.className = 'position-fixed bottom-0 end-0 p-3';
    div.style.zIndex = '11000';
    div.innerHTML = `<div class="toast align-items-center border-0" role="alert">
      <div class="d-flex"><div class="toast-body" id="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`;
    document.body.appendChild(div);
    _toastEl = div.querySelector('.toast');
  }
  const colors = {success:'bg-success text-white',warning:'bg-warning text-dark',danger:'bg-danger text-white',info:'bg-info text-dark'};
  _toastEl.className = 'toast align-items-center border-0 ' + (colors[type]||colors.success);
  $('toast-body').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(_toastEl,{delay:2500}).show();
}

/* ── Nivel jerárquico de un código presupuestal ── */
function getNivel(cod){
  if (!cod) return 0;
  return cod.split('.').length;
}

/* ── Suma inicial de hojas bajo un padre ── */
function sumarIniHojas(rubros, padCod){
  return rubros.filter(r => r.cod.startsWith(padCod+'.') && !r.esGrupo)
    .reduce((s,r) => s + (Number(r.ini)||0), 0);
}

/* ── Ordenar rubros por código natural ── */
function sortarRubros(arr){
  return arr.sort((a,b) => {
    const pa = a.cod.split('.'), pb = b.cod.split('.');
    for (let i=0; i<Math.max(pa.length,pb.length); i++){
      const na = pa[i]||'', nb = pb[i]||'';
      const ia = parseInt(na), ib = parseInt(nb);
      if (!isNaN(ia) && !isNaN(ib)){
        if (ia !== ib) return ia - ib;
      } else {
        const cmp = na.localeCompare(nb);
        if (cmp !== 0) return cmp;
      }
    }
    return 0;
  });
}

/* ── Número a letras (Español-Colombia) ── */
function numALetras(n){
  if(n === 0 || n === null || n === undefined) return 'CERO PESOS MONEDA CORRIENTE';

  const un = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE',
    'DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE',
    'VEINTE','VEINTIÚN','VEINTIDÓS','VEINTITRÉS','VEINTICUATRO','VEINTICINCO','VEINTISÉIS',
    'VEINTISIETE','VEINTIOCHO','VEINTINUEVE'];
  const dec = ['','','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const cen = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS',
    'SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];

  function conv(x){
    if(x === 0) return '';
    if(x < 30) return un[x];
    if(x < 100){
      const d = Math.floor(x/10), u = x%10;
      return dec[d] + (u ? ' Y ' + un[u] : '');
    }
    if(x === 100) return 'CIEN';
    if(x < 1000){
      const c = Math.floor(x/100), r = x%100;
      return cen[c] + (r ? ' ' + conv(r) : '');
    }
    if(x < 1000000){
      const m = Math.floor(x/1000), r = x%1000;
      if(m === 1) return 'MIL' + (r ? ' ' + conv(r) : '');
      return conv(m) + ' MIL' + (r ? ' ' + conv(r) : '');
    }
    if(x < 1000000000000){ // hasta billones
      const m = Math.floor(x/1000000), r = x%1000000;
      if(m === 1) return 'UN MILLÓN' + (r ? ' ' + conv(r) : '');
      return conv(m) + ' MILLONES' + (r ? ' ' + conv(r) : '');
    }
    return String(x); // fallback
  }

  const entero = Math.floor(Math.abs(n));
  const cents = Math.round((Math.abs(n) - entero) * 100);
  const pref = n < 0 ? 'MENOS ' : '';
  let texto = conv(entero);
  if(!texto) texto = 'CERO';

  if(cents > 0){
    return pref + texto + ' PESOS CON ' + (cents < 10 ? '0' : '') + cents + '/100 MONEDA CORRIENTE';
  }
  return pref + texto + ' PESOS MONEDA CORRIENTE';
}

/* ── Opciones de rubros con saldo presupuestal ── */
function optsEg(d, trim, selected){
  return d.rubros.filter(r=>!r.esGrupo).map(r=>{
    const saldo = typeof getPresupDisp==='function' ? getPresupDisp(d,r.cod,trim) : 0;
    const sel = r.cod===selected ? ' selected' : '';
    return `<option value="${r.cod}"${sel}>${r.cod} - ${r.con} [Disp: ${fmt(saldo)}]</option>`;
  }).join('');
}

function optsIng(d, trim, selected){
  return (d.rubros_ing||[]).filter(r=>!r.esGrupo).map(r=>{
    const saldo = typeof getPresupDispIng==='function' ? getPresupDispIng(d,r.cod,trim) : 0;
    const sel = r.cod===selected ? ' selected' : '';
    return `<option value="${r.cod}"${sel}>${r.cod} - ${r.con} [Disp: ${fmt(saldo)}]</option>`;
  }).join('');
}
