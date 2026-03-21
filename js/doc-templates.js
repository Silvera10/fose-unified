/* ══════════════════════════════════════════════════════════
   FOSE UNIFIED — Plantillas de documentos embebidas
   (Generado automáticamente — no editar manualmente)
   Total: 25 plantillas
══════════════════════════════════════════════════════════ */

const DOC_TEMPLATES = {};

DOC_TEMPLATES["docs/aceptacion.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Aceptación de Oferta — {{ numero }}{% endblock %}
{% block doc_titulo %}ACEPTACIÓN DE OFERTA{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ACEPTACIÓN DE OFERTA  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Fecha y lugar ────────────────────────────────── */
.ao-fecha {
  text-align: right;
  font-size: 9.5pt;
  margin: 0 0 14px;
}

/* ── Bloque destinatario ──────────────────────────── */
.ao-destinatario {
  margin: 0 0 12px;
  font-size: 9.5pt;
  line-height: 1.45;
}
.ao-destinatario p { margin: 0; }

/* ── Asunto ───────────────────────────────────────── */
.ao-asunto {
  margin: 0 0 14px;
  font-size: 9.5pt;
  line-height: 1.45;
  border-left: 4px solid #333;
  padding-left: 10px;
  background: #fff;
  padding-top: 4px;
  padding-bottom: 4px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Cuerpo de la carta ───────────────────────────── */
.ao-body {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
}
.ao-body p { margin: 0 0 9px; }

/* ── Secciones ────────────────────────────────────── */
.ao-section {
  margin: 12px 0;
}
.ao-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Tabla de términos ────────────────────────────── */
table.ao-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 8px;
  font-size: 9.5pt;
}
table.ao-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  width: 22%;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ao-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Lista de requisitos ──────────────────────────── */
.ao-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0;
  line-height: 1.45;
}
.ao-section ol li { margin-bottom: 4px; text-align: justify; }
.ao-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}

/* ── Cierre y firma ───────────────────────────────── */
.ao-cierre {
  font-size: 9.5pt;
  margin: 12px 0 6px;
  line-height: 1.45;
}
.ao-firma-section {
  margin-top: 15px;
}
table.ao-firma-tabla {
  width: 50%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.ao-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
}
.ao-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ao-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ao-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<!-- ── Fecha y lugar ──────────────────────────────────────────── -->
<p class="ao-fecha">
  {{ inst_municipio }},
  {{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else hoy_largo }}
</p>

<!-- ── Destinatario ──────────────────────────────────────────── -->
<div class="ao-destinatario">
  <p>
    {% if sexo_contratista == 'F' %}Señora:
    {% elif es_empresa %}Señor(a):
    {% else %}Señor:{% endif %}
  </p>
  {% if es_empresa and rep_legal_nombre %}
    <p><strong>{{ rep_legal_nombre }}</strong></p>
    <p>CC N.° {{ format_id(rep_legal_cc) }}</p>
    <p>Representante Legal de <strong>{{ nombre_contratista }}</strong></p>
    <p>NIT {{ format_id(num_id_contratista) }}</p>
  {% else %}
    <p><strong>{{ nombre_contratista }}</strong></p>
    <p>{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
  {% endif %}
  <p>{{ direccion_contratista }}</p>
  <p>{{ municipio_contratista }}</p>
</div>

<!-- ── Asunto ────────────────────────────────────────────────── -->
<div class="ao-asunto">
  <strong>Asunto:</strong> Notificación de Aceptación de Oferta —
  Proceso de {{ modalidad_seleccion }} — Contrato N.° {{ numero }}.
</div>

<!-- ── Cuerpo ────────────────────────────────────────────────── -->
<div class="ao-body">
  <p>
    {% if sexo_contratista == 'F' %}Apreciada señora:
    {% elif es_empresa %}Apreciado(a) señor(a):
    {% else %}Apreciado señor:{% endif %}
  </p>

  <p>
    En nombre de {{ inst_art }}
    <strong>{{ inst_nombre }}</strong>, NIT <strong>{{ format_id(inst_nit) }}</strong>,
    y en mi calidad de Rector(a) de la misma, me complace comunicarle que, surtido el
    proceso de selección correspondiente a la modalidad de
    <strong>{{ modalidad_seleccion }}</strong>, y de conformidad con el informe de
    evaluación de ofertas, su propuesta ha sido seleccionada como la más favorable
    para los intereses de la institución.
  </p>

  <p>
    En consecuencia, se le notifica formalmente la
    <strong>ACEPTACIÓN DE SU OFERTA</strong> y se le comunica que procederemos a la
    suscripción del contrato correspondiente, en los siguientes términos:
  </p>
</div>

<!-- ── TÉRMINOS DE LA CONTRATACIÓN ─────────────────────────── -->
<div class="ao-section">
  <div class="ao-section-titulo">Términos de la Contratación</div>
  <table class="ao-tabla">
    <tr>
      <th>Objeto</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>Valor del contrato</th>
      <td colspan="3">
        <strong>{{ format_moneda(valor_total) }}</strong>
        ({{ valor_letras }})
      </td>
    </tr>
    <tr>
      <th>Plazo de ejecución</th>
      <td colspan="3">
        {{ plazo_valor }} {{ plazo_unidad_texto }}, contados desde la suscripción del acta de inicio.
      </td>
    </tr>
    <tr>
      <th>Fecha inicio estimada</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha terminación estimada</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>CDP de respaldo</th>
      <td>N.° {{ num_cdp }} del {{ fecha_cdp_larga }}</td>
      <th>Rubro presupuestal</th>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
    </tr>
    <tr>
      <th>Fuente</th>
      <td colspan="3">{{ fuente }} — {{ fuente_nombre }}</td>
    </tr>
  </table>
</div>

<!-- ── FORMA DE PAGO ────────────────────────────────────────── -->
<div class="ao-section">
  <div class="ao-section-titulo">Forma de Pago</div>
  {% set fp = forma_pago or 'Pago único' %}
  <p>
    {% if fp == 'Pagos mensuales' %}
      El pago se realizará en <strong>pagos mensuales</strong>, dentro de los quince (15)
      días hábiles siguientes al vencimiento de cada mes de ejecución, previa verificación
      del cumplimiento parcial por parte del supervisor designado.
    {% elif fp == 'Pagos bimestrales' %}
      El pago se realizará en <strong>pagos bimestrales</strong>, dentro de los veinte (20)
      días hábiles siguientes al vencimiento de cada bimestre de ejecución, previa verificación
      del cumplimiento parcial por parte del supervisor designado.
    {% elif fp == 'Pagos trimestrales' %}
      El pago se realizará en <strong>pagos trimestrales</strong>, dentro de los veinte (20)
      días hábiles siguientes al vencimiento de cada trimestre de ejecución, previa verificación
      del cumplimiento parcial por parte del supervisor designado.
    {% elif fp == 'Pagos semestrales' %}
      El pago se realizará en <strong>pagos semestrales</strong>, dentro de los treinta (30)
      días hábiles siguientes al vencimiento de cada semestre de ejecución, previa verificación
      del cumplimiento parcial por parte del supervisor designado.
    {% elif fp == 'Anticipos y saldo' %}
      El pago se realizará mediante <strong>anticipo y pago del saldo</strong>. El anticipo,
      equivalente al cincuenta por ciento (50%) del valor total, se desembolsará dentro de los
      quince (15) días hábiles siguientes a la suscripción del acta de inicio. El saldo se
      pagará dentro de los treinta (30) días hábiles siguientes a la entrega total del objeto contractual.
    {% else %}
      El pago se realizará en un <strong>único pago</strong>, dentro de los dos (2)
      días hábiles siguientes a la presentación de los documentos requeridos, previa verificación
      del cumplimiento del objeto contractual por parte del supervisor designado.
    {% endif %}
    Se aplicarán las retenciones de ley correspondientes.
  </p>
  <p>
    El pago neto estimado, descontadas las retenciones de ley por valor de
    <strong>{{ format_moneda(total_deducciones) }}</strong>, es de
    <strong>{{ format_moneda(neto) }}</strong>
    ({{ neto_letras }}).
  </p>
</div>

<!-- ── Citación ───────────────────────────────────────────────── -->
<div class="ao-body" style="margin-top:10px;">
  <p>
    Se solicita
    {% if sexo_contratista == 'F' %}a la contratista
    {% elif es_empresa %}a la empresa contratista
    {% else %}al contratista{% endif %}
    presentarse en las instalaciones de la Institución Educativa para la suscripción
    del contrato o emisión de la orden de compra,
    dentro de los <strong>dos (2) días hábiles</strong> siguientes a la recepción de la
    presente comunicación.
  </p>
</div>

<!-- ── Cierre ────────────────────────────────────────────────── -->
<div class="ao-cierre">
  <p>
    Agradecemos su participación en el proceso y esperamos contar con su disposición
    para iniciar prontamente la ejecución contractual.
  </p>
  <p>Cordialmente,</p>
</div>

<!-- ── Firma ─────────────────────────────────────────────────── -->
<div class="ao-firma-section">
  <table class="ao-firma-tabla">
    <tr>
      <td>
        <div class="ao-firma-linea" style="border:none">
          <p class="ao-firma-nombre">{{ rector }}</p>
          <p class="ao-firma-cargo">CC N.° {{ format_id(cc_rector) }}</p>
          <p class="ao-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ao-firma-cargo">{{ inst_nombre }}</p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/acta_inicio.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Acta de Inicio — {{ numero }}{% endblock %}
{% block doc_titulo %}ACTA DE INICIO DE CONTRATO{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ACTA DE INICIO  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ai-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Párrafo introductorio ────────────────────────── */
.ai-intro {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 12px;
}

/* ── Secciones ────────────────────────────────────── */
.ai-section {
  margin: 10px 0 12px;
}
.ai-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ai-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}

/* ── Tablas de datos ──────────────────────────────── */
table.ai-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 8px;
  font-size: 9.5pt;
}
table.ai-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ai-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
/* Cabeceras de grupo (LA INSTITUCIÓN / EL CONTRATISTA / SUPERVISOR) */
table.ai-tabla .ai-grupo {
  background: #eee;
  color: #000;
  font-weight: bold;
  font-size: 9pt;
  letter-spacing: 0.5px;
  padding: 5px 10px;
  border: 1.5px solid #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Lugar y fecha ────────────────────────────────── */
.ai-lugar {
  font-size: 9.5pt;
  text-align: justify;
  margin: 10px 0;
  line-height: 1.45;
}

/* ── Firmas  (3 columnas) ─────────────────────────── */
.ai-firma-section {
  margin-top: 15px;
}
table.ai-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.ai-firma-tabla td {
  width: 33.33%;
  text-align: center;
  padding: 0 10px;
  border: none;
  vertical-align: bottom;
}
.ai-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ai-firma-nombre {
  font-size: 9pt;
  font-weight: bold;
  margin: 2px 0;
}
.ai-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="ai-numero">Contrato N.° {{ numero }}</p>

<!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
<p class="ai-intro">
  En el municipio de <strong>{{ inst_municipio }}</strong>,
  {{ inst_departamento }}, siendo el día <strong>{{ fecha_suscripcion_larga }}</strong>,
  en las instalaciones de
  {{ inst_art }}
  <strong>{{ inst_nombre }}</strong>, NIT <strong>{{ format_id(inst_nit) }}</strong>,
  ubicada en {{ inst_dir }}, se reunieron las partes que suscriben el presente
  contrato, con el fin de dar inicio formal a su ejecución.
</p>

<!-- ── 1. PARTES PRESENTES ────────────────────────────────────── -->
<div class="ai-section">
  <div class="ai-section-titulo">1. Partes Presentes</div>
  <table class="ai-tabla">
    <!-- LA INSTITUCIÓN -->
    <tr><td colspan="4" class="ai-grupo">LA INSTITUCIÓN</td></tr>
    <tr>
      <th style="width:22%">Nombre</th>
      <td colspan="3">{{ rector }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>C.C.</td>
      <th style="width:16%">Número</th>
      <td>{{ format_id(cc_rector) }}</td>
    </tr>
    <tr>
      <th>Cargo</th>
      <td>Rector(a) — Ordenador del Gasto</td>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
    </tr>
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>

    <!-- EL CONTRATISTA -->
    <tr><td colspan="4" class="ai-grupo">EL CONTRATISTA</td></tr>
    <tr>
      <th>Nombre</th>
      <td colspan="3">{{ nombre_contratista }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    {% if es_empresa and rep_legal_nombre %}
    <tr>
      <th>Representante Legal</th>
      <td colspan="3">{{ rep_legal_nombre }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>C.C.</td>
      <th>Número</th>
      <td>{{ format_id(rep_legal_cc) }}</td>
    </tr>
    {% endif %}
    <tr>
      <th>Dirección</th>
      <td>{{ direccion_contratista }}</td>
      <th>Municipio</th>
      <td>{{ municipio_contratista }}</td>
    </tr>
    <tr>
      <th>Teléfono / Celular</th>
      <td>{{ celular_contratista }}</td>
      <th>Correo electrónico</th>
      <td>{{ email_contratista }}</td>
    </tr>

    <!-- SUPERVISOR -->
    <tr><td colspan="4" class="ai-grupo">SUPERVISOR DEL CONTRATO</td></tr>
    <tr>
      <th>Nombre</th>
      <td colspan="3">{{ nombre_supervisor if nombre_supervisor else rector }}</td>
    </tr>
    <tr>
      <th>Cargo</th>
      <td colspan="3">{{ cargo_supervisor if cargo_supervisor else 'Rector(a)' }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. DATOS DEL CONTRATO ──────────────────────────────────── -->
<div class="ai-section">
  <div class="ai-section-titulo">2. Datos del Contrato</div>
  <table class="ai-tabla">
    <tr>
      <th style="width:22%">Contrato N.°</th>
      <td>{{ numero }}</td>
      <th style="width:22%">Tipo de contrato</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>Objeto</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>Valor total</th>
      <td>{{ format_moneda(valor_total) }}</td>
      <th>Valor en letras</th>
      <td>{{ valor_letras }}</td>
    </tr>
    <tr>
      <th>Forma de pago</th>
      <td colspan="3">{{ forma_pago or 'Pago único' }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }} &nbsp;·&nbsp; {{ fecha_cdp_larga }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }} &nbsp;·&nbsp; {{ fecha_rp_larga }}</td>
    </tr>
    <tr>
      <th>Rubro presupuestal</th>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
      <th>Fuente</th>
      <td>{{ fuente }} — {{ fuente_nombre }}</td>
    </tr>
  </table>
</div>

<!-- ── 3. FECHAS DE EJECUCIÓN ─────────────────────────────────── -->
<div class="ai-section">
  <div class="ai-section-titulo">3. Fechas de Ejecución</div>
  <table class="ai-tabla">
    <tr>
      <th style="width:30%">Fecha de inicio</th>
      <td><strong>{{ fecha_inicio_larga }}</strong></td>
    </tr>
    <tr>
      <th>Fecha de terminación</th>
      <td><strong>{{ fecha_fin_larga }}</strong></td>
    </tr>
    <tr>
      <th>Duración pactada</th>
      <td><strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong></td>
    </tr>
  </table>
</div>

<!-- ── 4. DECLARACIÓN DE INICIO ───────────────────────────────── -->
<div class="ai-section">
  <div class="ai-section-titulo">4. Declaración de Inicio</div>
  <p>
    Las partes presentes declaran que a la fecha de suscripción de la presente
    acta se encuentran cumplidos los requisitos de perfeccionamiento y ejecución
    del contrato N.° <strong>{{ numero }}</strong>, razón por la cual
    <strong>se da inicio formal a la ejecución del contrato</strong>.
    {% if es_empresa %}
      La empresa contratista
    {% elif sexo_contratista == 'F' %}
      La contratista
    {% else %}
      El contratista
    {% endif %}
    se compromete a ejecutar el objeto contractual en el plazo pactado y en las
    condiciones establecidas en el contrato.
  </p>
  <p>
    El supervisor designado, <strong>{{ nombre_supervisor if nombre_supervisor else rector }}</strong>, se
    compromete a realizar el seguimiento y control del contrato de conformidad
    con sus obligaciones legales y las instrucciones de la Rectoría.
  </p>
</div>

<!-- ── 5. OBSERVACIONES ───────────────────────────────────────── -->
<div class="ai-section">
  <div class="ai-section-titulo">5. Observaciones</div>
  <p>
    Las partes manifiestan no tener observaciones adicionales al momento de
    suscribir la presente acta. Cualquier novedad o circunstancia que se
    presente durante la ejecución del contrato deberá comunicarse
    oportunamente al supervisor y a la Rectoría de la institución.
  </p>
</div>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="ai-lugar">
  En constancia de lo anterior, se firma la presente acta en
  <strong>{{ inst_municipio }}</strong>, el <strong>{{ fecha_inicio_larga }}</strong>.
</p>

<!-- ── FIRMAS  (2 columnas) ───────────────────────────────────── -->
<div class="ai-firma-section">
  <table class="ai-firma-tabla">
    <tr>
      <!-- Rector -->
      <td>
        <div class="ai-firma-linea" style="border:none">
          <p class="ai-firma-nombre">{{ rector }}</p>
          <p class="ai-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="ai-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ai-firma-cargo">{{ inst_nombre }}</p>
          <p class="ai-firma-cargo"><strong>LA INSTITUCIÓN</strong></p>
        </div>
      </td>
      <!-- Contratista -->
      <td>
        <div class="ai-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ai-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ai-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ai-firma-cargo">Representante Legal</p>
            <p class="ai-firma-cargo">{{ nombre_contratista }}</p>
            <p class="ai-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ai-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ai-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="ai-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="ai-firma-cargo"><strong>EL CONTRATISTA</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/acta_liquidacion.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Acta de Liquidación — {{ numero }}{% endblock %}
{% block doc_titulo %}ACTA DE LIQUIDACIÓN BILATERAL{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ACTA DE LIQUIDACIÓN  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.al-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Texto de apertura ────────────────────────────── */
.al-apertura {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 12px;
}

/* ── Secciones ────────────────────────────────────── */
.al-section {
  margin: 10px 0 12px;
}
.al-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.al-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.al-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.al-section ol li {
  margin-bottom: 5px;
  text-align: justify;
}

/* ── Tabla de datos generales ─────────────────────── */
table.al-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.al-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 22%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.al-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
/* Sub-encabezados de partes */
.al-parte-hdr {
  background: #eee;
  color: #000;
  font-weight: bold;
  font-size: 9.5pt;
  padding: 5px 9px;
  text-align: center;
  letter-spacing: 0.5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Tabla financiera ─────────────────────────────── */
table.al-data {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.al-data thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 9px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.al-data tbody td {
  padding: 5px 9px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
table.al-data tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.al-data tfoot td {
  padding: 6px 9px;
  border: 1.5px solid #bbb;
  background: #eee;
  font-weight: bold;
  font-size: 9.5pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Caja de cierre ───────────────────────────────── */
.al-cierre {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 10px 0 0;
}

/* ── Firma ────────────────────────────────────────── */
.al-firma-section {
  margin-top: 15px;
}
table.al-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.al-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 12px;
  border: none;
  vertical-align: bottom;
}
table.al-firma-tabla.al-firma-tres td {
  width: 33.33%;
}
.al-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.al-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.al-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}

/* ── Firma supervisor (fila inferior centrada) ────── */
.al-firma-sup {
  margin-top: 15px;
}
table.al-firma-sup-tabla {
  width: 60%;
  margin: 0 auto;
  border-collapse: collapse;
  border: none;
}
table.al-firma-sup-tabla td {
  text-align: center;
  padding: 0 12px;
  border: none;
  vertical-align: bottom;
}
</style>
{% endblock %}

{% block doc_content %}

{% set supervisor = nombre_supervisor if nombre_supervisor else rector %}
{% set cargo_sup  = cargo_supervisor  if cargo_supervisor  else 'Rector(a)' %}

<p class="al-numero">Contrato N.° {{ numero }}</p>

<!-- ── APERTURA ───────────────────────────────────────────────── -->
<p class="al-apertura">
  En el municipio de <strong>{{ inst_municipio }}</strong>,
  departamento de <strong>{{ inst_departamento or 'Bolívar' }}</strong>,
  a los <strong>{{ fecha_fin_larga }}</strong>, en las instalaciones de la
  <strong>{{ inst_nombre }}</strong>, se reunieron las partes del contrato
  referenciado con el fin de proceder a su liquidación bilateral, de
  conformidad con lo establecido en la Ley 80 de 1993 y el artículo
  2.2.1.2.8.1 del Decreto 1082 de 2015.
</p>

<!-- ── 1. PARTES INTERVINIENTES ──────────────────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">1. Partes Intervinientes</div>
  <table class="al-tabla">
    <!-- LA INSTITUCIÓN -->
    <tr>
      <td colspan="4" class="al-parte-hdr">LA INSTITUCIÓN</td>
    </tr>
    <tr>
      <th>Nombre</th>
      <td>{{ inst_nombre }}</td>
      <th>NIT</th>
      <td>{{ format_id(inst_nit) }}</td>
    </tr>
    <tr>
      <th>Representante Legal</th>
      <td>{{ rector }}</td>
      <th>C.C.</th>
      <td>{{ format_id(cc_rector) }}</td>
    </tr>
    <tr>
      <th>Cargo</th>
      <td colspan="3">Rector(a) — Ordenador del Gasto</td>
    </tr>
    <!-- EL CONTRATISTA -->
    <tr>
      <td colspan="4" class="al-parte-hdr">
        {% if es_empresa %}LA EMPRESA CONTRATISTA
        {% elif sexo_contratista == 'F' %}LA CONTRATISTA
        {% else %}EL CONTRATISTA{% endif %}
      </td>
    </tr>
    <tr>
      <th>Nombre</th>
      <td>{{ nombre_contratista }}</td>
      <th>{{ tipo_id_contratista }}</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Dirección</th>
      <td>{{ direccion_contratista }}</td>
      <th>Municipio</th>
      <td>{{ municipio_contratista }}</td>
    </tr>
    {% if es_empresa and rep_legal_nombre %}
    <tr>
      <th>Repr. Legal</th>
      <td>{{ rep_legal_nombre }}</td>
      <th>C.C.</th>
      <td>{{ format_id(rep_legal_cc) }}</td>
    </tr>
    {% endif %}
  </table>
</div>

<!-- ── 2. IDENTIFICACIÓN DEL CONTRATO ─────────────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">2. Identificación del Contrato</div>
  <table class="al-tabla">
    <tr>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
      <th>Tipo</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>Objeto</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>Modalidad</th>
      <td>{{ modalidad_seleccion }}</td>
      <th>Fecha de suscripción</th>
      <td>{{ fecha_inicio_larga }}</td>
    </tr>
    <tr>
      <th>Fecha de inicio</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha de terminación</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Duración pactada</th>
      <td>{{ plazo_valor }} {{ plazo_unidad_texto }}</td>
      <th>Supervisor</th>
      <td>{{ supervisor }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }} &nbsp;·&nbsp; {{ fecha_cdp_larga }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }} &nbsp;·&nbsp; {{ fecha_rp_larga }}</td>
    </tr>
    <tr>
      <th>Rubro presupuestal</th>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
      <th>Fuente</th>
      <td>{{ fuente }} — {{ fuente_nombre }}</td>
    </tr>
  </table>
</div>

<!-- ── 3. BALANCE FINANCIERO DEL CONTRATO ─────────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">3. Balance Financiero del Contrato</div>
  <table class="al-data">
    <thead>
      <tr>
        <th style="width:70%">Concepto</th>
        <th style="width:30%">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Valor total del contrato</td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
      </tr>
      <tr>
        <td>(−) Retención en la Fuente aplicada (Cta. {{ ret_cuenta or '236505' }})</td>
        <td style="text-align:right">− {{ format_moneda(retencion) }}</td>
      </tr>
      <tr>
        <td>Valor neto cancelado
          {% if es_empresa %}a la empresa contratista
          {% elif sexo_contratista == 'F' %}a la contratista
          {% else %}al contratista{% endif %}
        </td>
        <td style="text-align:right"><strong>{{ format_moneda(neto) }}</strong></td>
      </tr>
      <tr>
        <td>Saldo por pagar
          {% if es_empresa %}a la empresa contratista
          {% elif sexo_contratista == 'F' %}a la contratista
          {% else %}al contratista{% endif %}
        </td>
        <td style="text-align:right; color:#333"><strong>{{ format_moneda(0) }}</strong></td>
      </tr>
      <tr>
        <td>Saldo a favor de la institución</td>
        <td style="text-align:right; color:#333"><strong>{{ format_moneda(0) }}</strong></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>Valor total cancelado (bruto)</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
      </tr>
    </tfoot>
  </table>
  <p><strong>Valor total en letras:</strong> {{ valor_letras }}.</p>
</div>

<!-- ── 4. ESTADO DE EJECUCIÓN ─────────────────────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">4. Estado de Ejecución del Objeto Contractual</div>
  <p>
    Las partes declaran que el objeto del contrato N.°
    <strong>{{ numero }}</strong> fue ejecutado en su totalidad, a entera
    satisfacción de la institución, de conformidad con las condiciones
    técnicas y de calidad pactadas.
    {% if es_empresa %}La empresa supervisora designada
    {% else %}El(La) supervisor(a) designado(a){% endif %},
    <strong>{{ supervisor }}</strong>, emitió concepto favorable sobre
    la ejecución del contrato.
  </p>
</div>

<!-- ── 5. DECLARACIÓN DE LIQUIDACIÓN BILATERAL ────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">5. Declaración de Liquidación Bilateral</div>
  <p>Las partes suscritas, de mutuo acuerdo, declaran:</p>
  <ol>
    <li>
      Que el contrato N.° <strong>{{ numero }}</strong> fue ejecutado en su
      totalidad y a satisfacción de <strong>LA INSTITUCIÓN</strong>.
    </li>
    <li>
      Que se han cancelado la totalidad de las obligaciones económicas
      derivadas del contrato, sin que existan saldos pendientes de pago a
      favor
      {% if es_empresa %}de la empresa contratista
      {% elif sexo_contratista == 'F' %}de la contratista
      {% else %}del contratista{% endif %}
      o de la institución.
    </li>
    <li>
      Que con la suscripción de la presente acta queda
      <strong>LIQUIDADO BILATERALMENTE</strong> el contrato N.°
      <strong>{{ numero }}</strong>, no quedando ninguna obligación pendiente
      entre las partes derivada de la ejecución del mismo.
    </li>
    <li>
      Que las partes renuncian a cualquier reclamación futura derivada del
      objeto y ejecución del presente contrato, salvo los casos de dolo o
      culpa grave expresamente establecidos en la ley.
    </li>
  </ol>
</div>

<!-- ── 6. OBSERVACIONES ───────────────────────────────────────── -->
<div class="al-section">
  <div class="al-section-titulo">6. Observaciones</div>
  <p>
    Las partes manifiestan que no tienen observaciones adicionales y que la
    liquidación del contrato se realiza de manera voluntaria y de mutuo
    acuerdo, sin que existan reclamaciones, peticiones ni inconformidades
    pendientes entre sí.
  </p>
</div>

<!-- ── CIERRE ─────────────────────────────────────────────────── -->
<p class="al-cierre">
  En constancia de lo anterior, las partes suscriben la presente acta de
  liquidación bilateral en <strong>{{ inst_municipio }}</strong>,
  el <strong>{{ fecha_fin_larga }}</strong>.
</p>

<!-- ── FIRMAS — LA INSTITUCIÓN / EL CONTRATISTA ──────────────── -->
<div class="al-firma-section">
  <table class="al-firma-tabla">
    <tr>
      <!-- Rector / Institución -->
      <td>
        <div class="al-firma-linea" style="border:none">
          <p class="al-firma-nombre">{{ rector }}</p>
          <p class="al-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="al-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="al-firma-cargo">{{ inst_nombre }}</p>
          <p class="al-firma-cargo">NIT {{ format_id(inst_nit) }}</p>
          <p class="al-firma-cargo"><strong>LA INSTITUCIÓN</strong></p>
        </div>
      </td>
      <!-- Contratista -->
      <td>
        <div class="al-firma-linea" style="border:none">
          <p class="al-firma-nombre">{{ nombre_contratista }}</p>
          <p class="al-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
          <p class="al-firma-cargo">
            {% if es_empresa %}LA EMPRESA CONTRATISTA
            {% elif sexo_contratista == 'F' %}LA CONTRATISTA
            {% else %}EL CONTRATISTA{% endif %}
          </p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/acta_recibido.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Acta de Recibido a Satisfacción — {{ numero }}{% endblock %}
{% block doc_titulo %}ACTA DE RECIBIDO A SATISFACCIÓN{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ACTA DE RECIBIDO A SATISFACCIÓN  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ar-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Párrafo introductorio ────────────────────────── */
.ar-intro {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 12px;
}

/* ── Secciones ────────────────────────────────────── */
.ar-section {
  margin: 10px 0 12px;
}
.ar-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ar-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}

/* ── Tabla de identificación ──────────────────────── */
table.ar-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ar-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 22%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ar-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Tabla de bienes/servicios ────────────────────── */
table.ar-items {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
  page-break-inside: auto;
}
table.ar-items thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 8px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ar-items tbody td {
  padding: 5px 8px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9pt;
  line-height: 1.4;
}
table.ar-items tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ar-items tfoot td {
  padding: 5px 8px;
  border: 1.5px solid #bbb;
  background: #eee;
  font-weight: bold;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Tabla de verificación ────────────────────────── */
table.ar-verif {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ar-verif thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 9px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ar-verif tbody td {
  padding: 5px 9px;
  border: 1.5px solid #bbb;
  font-size: 9.5pt;
  line-height: 1.4;
}
table.ar-verif tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Estados ──────────────────────────────────────── */
.ar-si {
  text-align: center;
  font-weight: bold;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ar-conforme {
  text-align: center;
  font-weight: bold;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Caja de satisfacción ─────────────────────────── */
.ar-satisfaccion {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 14px;
  margin: 4px 0;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ar-satisfaccion p { margin: 5px 0; }

/* ── Lugar y fecha ────────────────────────────────── */
.ar-lugar {
  font-size: 9.5pt;
  text-align: justify;
  margin: 10px 0 6px;
  line-height: 1.45;
}

/* ── Firmas (2 columnas) ──────────────────────────── */
.ar-firma-section {
  margin-top: 15px;
}
table.ar-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.ar-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 20px;
  border: none;
  vertical-align: bottom;
}
.ar-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ar-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ar-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

{% set supervisor = nombre_supervisor if nombre_supervisor else rector %}
{% set cargo_sup  = cargo_supervisor  if cargo_supervisor  else 'Rector(a)' %}

<p class="ar-numero">Contrato N.° {{ numero }}</p>

<!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
<p class="ar-intro">
  En el municipio de <strong>{{ inst_municipio }}</strong>,
  {{ inst_departamento }}, siendo el día <strong>{{ fecha_fin_larga }}</strong>,
  el suscrito supervisor y
  {% if es_empresa %}la empresa contratista
  {% elif sexo_contratista == 'F' %}la contratista
  {% else %}el contratista{% endif %}
  del contrato referenciado, proceden a suscribir la presente acta de recibido
  a satisfacción.
</p>

<!-- ── 1. IDENTIFICACIÓN DEL CONTRATO ────────────────────────── -->
<div class="ar-section">
  <div class="ar-section-titulo">1. Identificación del Contrato</div>
  <table class="ar-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
    </tr>
    <tr>
      <th>Objeto del contrato</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>
        {% if es_empresa %}Empresa contratista
        {% elif sexo_contratista == 'F' %}Contratista
        {% else %}Contratista{% endif %}
      </th>
      <td colspan="3">
        {{ nombre_contratista }}
        {% if es_empresa and rep_legal_nombre %}
          <br><small style="color:#555">Repr. Legal: {{ rep_legal_nombre }}, CC {{ format_id(rep_legal_cc) }}</small>
        {% endif %}
      </td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Valor total</th>
      <td>{{ format_moneda(valor_total) }}</td>
      <th>Duración</th>
      <td>{{ plazo_valor }} {{ plazo_unidad_texto }}</td>
    </tr>
    <tr>
      <th>Fecha de inicio</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha de terminación</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Supervisor</th>
      <td>{{ supervisor }}</td>
      <th>Cargo</th>
      <td>{{ cargo_sup }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. VERIFICACIÓN DE CUMPLIMIENTO ───────────────────────── -->
<div class="ar-section">
  <div class="ar-section-titulo">2. Verificación de Cumplimiento</div>
  <table class="ar-verif">
    <thead>
      <tr>
        <th style="width:57%">Criterio de Verificación</th>
        <th style="width:13%">Resultado</th>
        <th style="width:30%">Observación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>El bien / servicio corresponde al objeto contractual</td>
        <td class="ar-si">SÍ</td>
        <td>Verificado conforme al contrato.</td>
      </tr>
      <tr>
        <td>Las cantidades coinciden con lo pactado</td>
        <td class="ar-si">SÍ</td>
        <td>Verificado.</td>
      </tr>
      <tr>
        <td>La calidad cumple las especificaciones técnicas</td>
        <td class="ar-si">SÍ</td>
        <td>Sin observaciones técnicas.</td>
      </tr>
      <tr>
        <td>Entregado dentro del plazo pactado</td>
        <td class="ar-si">SÍ</td>
        <td>Entregado en término.</td>
      </tr>
      <tr>
        <td>Documentación completa y en orden</td>
        <td class="ar-si">SÍ</td>
        <td>Factura / cuenta de cobro presentada.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ── 3. DECLARACIÓN DE RECIBIDO ────────────────────────────── -->
<div class="ar-section">
  <div class="ar-section-titulo">3. Declaración de Recibido a Satisfacción</div>
  <div class="ar-satisfaccion">
    <p>
      El supervisor del contrato N.° <strong>{{ numero }}</strong>,
      <strong>{{ supervisor }}</strong>, en calidad de {{ cargo_sup }}, certifica que
      los bienes y/o servicios entregados por
      {% if es_empresa and rep_legal_nombre %}
        la empresa contratista <strong>{{ nombre_contratista }}</strong>
        (NIT {{ format_id(num_id_contratista) }}),
        representada por <strong>{{ rep_legal_nombre }}</strong>,
        CC N.° {{ format_id(rep_legal_cc) }},
      {% elif sexo_contratista == 'F' %}
        la contratista <strong>{{ nombre_contratista }}</strong>,
        {{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }},
      {% else %}
        el contratista <strong>{{ nombre_contratista }}</strong>,
        {{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }},
      {% endif %}
      correspondientes al objeto contractual: <em>{{ objeto }}</em>, han sido
      recibidos a <strong>ENTERA SATISFACCIÓN</strong>, cumpliendo con las
      especificaciones técnicas, condiciones de calidad y demás requisitos
      establecidos en el contrato.
    </p>
    <p>
      <strong>No se presentan observaciones ni inconformidades.</strong>
      En consecuencia, se avala el trámite del pago correspondiente por la suma de
      <strong>{{ format_moneda(valor_total) }}</strong>
      ({{ valor_letras }}).
    </p>
  </div>
</div>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="ar-lugar">
  En constancia de lo anterior, las partes suscriben la presente acta en
  <strong>{{ inst_municipio }}</strong>, el <strong>{{ fecha_fin_larga }}</strong>.
</p>

<!-- ── FIRMAS (2 columnas) ───────────────────────────────────── -->
<div class="ar-firma-section">
  <table class="ar-firma-tabla">
    <tr>
      <!-- Rector -->
      <td>
        <div class="ar-firma-linea" style="border:none">
          <p class="ar-firma-nombre">{{ rector }}</p>
          <p class="ar-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="ar-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ar-firma-cargo">{{ inst_nombre }}</p>
        </div>
      </td>
      <!-- Contratista -->
      <td>
        <div class="ar-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ar-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ar-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ar-firma-cargo">Representante Legal</p>
            <p class="ar-firma-cargo">{{ nombre_contratista }}</p>
            <p class="ar-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ar-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ar-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="ar-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="ar-firma-cargo"><strong>
            {% if es_empresa %}LA EMPRESA CONTRATISTA
            {% elif sexo_contratista == 'F' %}LA CONTRATISTA
            {% else %}EL CONTRATISTA{% endif %}
          </strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/base_doc.html"] = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{% block doc_title %}Documento{% endblock %} — {{ numero }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; background: #fff; }
    @page { size: Letter; margin: 1.5cm 1.5cm 0.8cm 2cm; }
    @media screen { body { max-width: 21cm; margin: 20px auto; padding: 2cm; border: 1px solid #ccc; } }
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; padding: 0; border: none; font-size: 10pt; }
      table { width: 100% !important; table-layout: auto !important; font-size: 9pt; }
      td, th { padding: 3px 4px !important; word-wrap: break-word; overflow-wrap: break-word; }
      tr { page-break-inside: avoid; }
      .seccion { page-break-inside: avoid; }
      [class*="-firma"], [class*="firma-"], .firma-block, .firma-linea {
        margin-top: 10px !important;
      }
      [class*="-firma-linea"], .firma-linea {
        margin-top: 20px !important;
      }
      img { max-width: 100% !important; height: auto !important; }
      h1, h2, h3 { margin: 6px 0 !important; }
      p { margin: 4px 0 !important; }
      .header-inst { margin-bottom: 10px !important; }
    }

    .header-inst { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 15px;
      display: flex; align-items: center; gap: 12px; position: relative; }
    .doc-code { position: absolute; top: 0; right: 0; font-size: 10pt; font-weight: bold;
      color: #555; background: #f0f0f0; padding: 3px 10px; border: 1.5px solid #999;
      border-radius: 3px; letter-spacing: 0.5px; font-family: 'Courier New', monospace;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-code:empty { display: none; }
    .header-escudo { flex: 0 0 auto; }
    .header-escudo img { width: 70px; height: auto;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header-texto { flex: 1; text-align: center; }
    .header-inst .inst-nombre { font-size: 13pt; font-weight: bold; text-transform: uppercase; }
    .header-inst .inst-nit { font-size: 10pt; }
    .header-inst .doc-titulo { font-size: 12pt; font-weight: bold; text-transform: uppercase;
      background: none; color: #000; padding: 4px 12px; border: 2px solid #000; border-radius: 4px; margin-top: 6px; display: inline-block; }

    .seccion { margin: 12px 0; }
    .seccion-titulo { font-weight: bold; text-transform: uppercase; background: #eee;
      padding: 4px 8px; border-left: 4px solid #333; margin-bottom: 6px; font-size: 10pt; }
    .campo { margin: 4px 0; }
    .campo-label { font-weight: bold; display: inline; }
    .campo-valor { display: inline; }

    table.datos { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10pt; }
    table.datos th { background: #eee; color: #000; padding: 5px 8px; text-align: left; font-size: 9.5pt; border: 1px solid #999; }
    table.datos td { padding: 4px 8px; border-bottom: 1px solid #ddd; }
    table.datos .total-row { font-weight: bold; background: #f5f5f5; }

    table.info { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10pt; }
    table.info td { padding: 3px 6px; border: 1px solid #ccc; }
    table.info td:first-child { font-weight: bold; background: #f5f5f5; width: 35%; }

    .firma-block { margin-top: 15px; }
    .firma-linea, [class*="-firma-linea"], [class*="-firma-bloque"] { border-top: none !important; border: none !important; }
    .firma-linea { width: 250px; text-align: center; padding-top: 4px; margin-top: 10px; }
    .firma-nombre { font-weight: bold; text-transform: uppercase; }
    [class$="-firma-nombre"] { text-transform: uppercase; }
    .firma-cargo { font-size: 9.5pt; }

    .texto-legal { font-size: 9pt; text-align: justify; margin: 8px 0; }
    .numero-contrato { font-size: 16pt; font-weight: bold; color: #333; text-align: center; margin: 10px 0; }
    .valor-total { font-size: 13pt; font-weight: bold; color: #333; }

    .print-btn {
      position: fixed; top: 10px; right: 10px; z-index: 999;
      background: #eee; color: #333; border: 1px solid #999; padding: 10px 20px;
      border-radius: 8px; cursor: pointer; font-size: 14px;
    }
  </style>
  {% block extra_css %}{% endblock %}
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / PDF</button>

<div class="header-inst">
  <div class="header-escudo">
    <img src="{{ url_for('static', filename='img/escudo_colombia.png') }}"
         alt="Escudo de Colombia"
         onerror="this.style.display='none'">
  </div>
  <div class="header-texto">
    <div class="inst-nombre">{{ inst_nombre }}</div>
    <div class="inst-nit">NIT: {{ format_id(inst_nit) }}{% if inst_dane %} — DANE: {{ inst_dane }}{% endif %}</div>
    <div class="inst-nit">{{ inst_municipio }}, Dpto. de {{ inst_departamento or 'Bolívar' }}</div>
    <div><span class="doc-titulo">{% block doc_titulo %}Documento{% endblock %}</span></div>
  </div>
  </div>
<!-- DOC_CODE -->

{% block doc_content %}{% endblock %}

</body>
</html>
`;

DOC_TEMPLATES["docs/carta_juramentada.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Declaración Juramentada — {{ numero }}{% endblock %}
{% block doc_titulo %}DECLARACIÓN JURAMENTADA DE INEXISTENCIA DE INHABILIDADES, INCOMPATIBILIDADES Y CONFLICTOS DE INTERÉS{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   CARTA JURAMENTADA  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.cj-numero {
  text-align: center;
  font-size: 10pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Lugar y fecha / Destinatario ────────────────── */
.cj-lugar {
  font-size: 9.5pt;
  margin: 0 0 10px;
  line-height: 1.45;
}
.cj-destinatario {
  font-size: 9.5pt;
  margin: 0 0 12px;
  line-height: 1.45;
}
.cj-saludo {
  font-size: 9.5pt;
  margin: 0 0 8px;
}

/* ── Párrafo introductorio ────────────────────────── */
.cj-intro {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 14px;
}

/* ── Secciones ────────────────────────────────────── */
.cj-section {
  margin: 10px 0 12px;
}
.cj-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.cj-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.cj-section ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.cj-section ul li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Ítem de declaración ──────────────────────────── */
.cj-item {
  margin: 8px 0 10px;
}
.cj-item-titulo {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 0 0 4px;
  color: #333;
}
.cj-item p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 3px 0;
  line-height: 1.45;
}
.cj-item ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 4px 0 6px;
  line-height: 1.45;
}
.cj-item ul li {
  margin-bottom: 3px;
  text-align: justify;
}

/* ── Nota legal ───────────────────────────────────── */
.cj-nota {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 14px;
  margin: 14px 0 6px;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.cj-nota-titulo {
  font-size: 9.5pt;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 0 0 6px;
}
.cj-nota p {
  font-size: 9pt;
  color: #333;
  text-align: justify;
  margin: 0;
  line-height: 1.45;
}

/* ── Firma ────────────────────────────────────────── */
.cj-firma-section {
  margin-top: 15px;
}
table.cj-firma-tabla {
  width: 50%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.cj-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
}
.cj-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.cj-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.cj-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="cj-numero">Contrato N.° {{ numero }}</p>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="cj-lugar">
  <strong>Lugar y fecha:</strong>
  {{ municipio_contratista }}, {{ fecha_inicio_larga }}
</p>

<!-- ── Destinatario ───────────────────────────────────────────── -->
<p class="cj-destinatario">
  <strong>Señor(a):</strong><br>
  <strong>{{ rector | upper }}</strong><br>
  Rector(a)<br>
  {{ inst_nombre }}<br>
  NIT {{ format_id(inst_nit) }}<br>
  {{ inst_municipio }}, {{ inst_departamento }}
</p>

<!-- ── Saludo ─────────────────────────────────────────────────── -->
<p class="cj-saludo">Respetado(a) señor(a) Rector(a):</p>

<!-- ── Párrafo introductorio ──────────────────────────────────── -->
<p class="cj-intro">
  {% if es_empresa and rep_legal_nombre %}
    El(La) suscrito(a), <strong>{{ rep_legal_nombre }}</strong>,
    identificado(a) con CC N.° <strong>{{ format_id(rep_legal_cc) }}</strong>,
    actuando en representación legal de <strong>{{ nombre_contratista }}</strong>
    (NIT {{ format_id(num_id_contratista) }}),
    domiciliado(a) en {{ direccion_contratista }}, {{ municipio_contratista }},
  {% elif sexo_contratista == 'F' %}
    La suscrita, <strong>{{ nombre_contratista }}</strong>, mayor de edad,
    domiciliada en {{ direccion_contratista }}, {{ municipio_contratista }},
    identificada con {{ tipo_id_contratista }} N.°
    <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% else %}
    El suscrito, <strong>{{ nombre_contratista }}</strong>, mayor de edad,
    domiciliado en {{ direccion_contratista }}, {{ municipio_contratista }},
    identificado con {{ tipo_id_contratista }} N.°
    <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% endif %}
  en el marco del proceso de contratación N.° <strong>{{ numero }}</strong>
  adelantado por
  {{ inst_art }}
  <strong>{{ inst_nombre }}</strong>, por medio del presente documento y
  <strong>BAJO LA GRAVEDAD DEL JURAMENTO</strong>, manifiesto y declaro lo siguiente:
</p>

<!-- ── DECLARACIONES ──────────────────────────────────────────── -->
<div class="cj-section">
  <div class="cj-section-titulo">Declaraciones</div>

  <div class="cj-item">
    <p class="cj-item-titulo">PRIMERO — Inexistencia de Inhabilidades (Art. 8, Ley 80 de 1993)</p>
    <p>Que <strong>NO</strong> me encuentro incurso(a) en ninguna de las causales de inhabilidad previstas en el artículo 8 de la Ley 80 de 1993, en especial:</p>
    <ul>
      <li>No he sido condenado(a) mediante sentencia ejecutoriada por delitos contra la administración pública, cohecho, concusión, enriquecimiento ilícito u otros delitos que impliquen pérdida de derechos políticos.</li>
      <li>No me encuentro sancionado(a) disciplinariamente con destitución o inhabilidad general.</li>
      <li>No estoy reportado(a) en el Boletín de Responsables Fiscales de la Contraloría General de la República.</li>
      <li>No he sido declarado(a) responsable de actos de corrupción ni sancionado(a) con inhabilidad para contratar con el Estado.</li>
      <li>No tengo la calidad de funcionario(a) público(a) o empleado(a) oficial, ni relación de parentesco con los funcionarios de la institución que pueda generar una inhabilidad.</li>
    </ul>
  </div>

  <div class="cj-item">
    <p class="cj-item-titulo">SEGUNDO — Inexistencia de Incompatibilidades (Art. 9, Ley 80 de 1993)</p>
    <p>
      Que <strong>NO</strong> me encuentro incurso(a) en ninguna de las causales de incompatibilidad
      establecidas en el artículo 9 de la Ley 80 de 1993 ni en ninguna otra norma que me impida
      contratar con {{ inst_art }} {{ inst_nombre }}.
    </p>
  </div>

  <div class="cj-item">
    <p class="cj-item-titulo">TERCERO — Inexistencia de Conflictos de Interés</p>
    <p>
      Que <strong>NO</strong> existe ninguna situación que pueda generar un conflicto de interés con
      {{ inst_art }}
      <strong>{{ inst_nombre }}</strong> o con los funcionarios vinculados al proceso de contratación
      N.° <strong>{{ numero }}</strong>. En caso de que durante la ejecución del contrato surja algún
      conflicto de interés, me comprometo a informarlo de manera inmediata a la institución.
    </p>
  </div>

  <div class="cj-item">
    <p class="cj-item-titulo">CUARTO — Cumplimiento de Obligaciones con el Sistema General de Seguridad Social</p>
    <p>
      Que me encuentro al día en el pago de mis aportes al Sistema General de Seguridad Social en
      Salud, Pensión y Riesgos Laborales, cuando dicha obligación me aplica de acuerdo con la
      normativa vigente.
    </p>
  </div>

  <div class="cj-item">
    <p class="cj-item-titulo">QUINTO — Veracidad de la Información</p>
    <p>
      Que toda la información y documentación aportada en el marco del proceso de contratación
      N.° <strong>{{ numero }}</strong> es veraz, completa y verificable. Soy consciente de que la
      falsedad en la presente declaración acarreará las consecuencias legales previstas en el
      Código Penal colombiano.
    </p>
  </div>
</div>

<!-- ── FUNDAMENTO LEGAL ───────────────────────────────────────── -->
<div class="cj-section">
  <div class="cj-section-titulo">Fundamento Legal</div>
  <p>La presente declaración se realiza en cumplimiento de lo dispuesto en:</p>
  <ul>
    <li>Artículo 8 de la Ley 80 de 1993 — Inhabilidades para contratar con el Estado.</li>
    <li>Artículo 9 de la Ley 80 de 1993 — Incompatibilidades para contratar.</li>
    <li>Ley 1474 de 2011 — Estatuto Anticorrupción.</li>
    <li>Artículo 40 de la Ley 734 de 2002 — Código Disciplinario Único.</li>
    <li>Demás normas concordantes y complementarias vigentes.</li>
  </ul>
</div>

<!-- ── NOTA LEGAL ─────────────────────────────────────────────── -->
<div class="cj-nota">
  <p class="cj-nota-titulo">NOTA IMPORTANTE</p>
  <p>
    La suscripción del presente documento tiene valor jurídico de declaración bajo la gravedad del
    juramento, de conformidad con lo establecido en el artículo 294 del Código General del Proceso
    (Ley 1564 de 2012). La falsedad en esta declaración constituye delito de falsedad en documento
    privado y/o fraude procesal, sancionados por el Código Penal colombiano.
  </p>
</div>

<!-- ── FIRMA ─────────────────────────────────────────────────── -->
<div class="cj-firma-section">
  <table class="cj-firma-tabla">
    <tr>
      <td>
        <div class="cj-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="cj-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="cj-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="cj-firma-cargo">Representante Legal</p>
            <p class="cj-firma-nombre" style="font-size:8.5pt;font-weight:normal">{{ nombre_contratista }}</p>
            <p class="cj-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="cj-firma-nombre">{{ nombre_contratista }}</p>
            <p class="cj-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="cj-firma-cargo">{{ direccion_contratista }}, {{ municipio_contratista }}</p>
            <p class="cj-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="cj-firma-cargo"><strong>DECLARANTE</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/carta_propuesta.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Carta de Propuesta — {{ numero }}{% endblock %}
{% block doc_titulo %}CARTA DE PRESENTACIÓN DE PROPUESTA{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     CARTA DE PROPUESTA — estilos de impresión
     ══════════════════════════════════════════════ */

  /* Tabla cabecera institucional */
  table.cp-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.cp-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.cp-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  /* Bloque lugar y fecha */
  .cp-fecha {
    text-align: right;
    font-size: 10pt;
    margin: 10px 0 12px;
  }

  /* Bloque destinatario */
  .cp-destinatario {
    margin: 0 0 14px;
    padding: 8px 0 8px 18px;
    border-left: 3px solid #333;
    font-size: 10pt;
    line-height: 1.45;
    }
  .cp-destinatario p          { margin: 1px 0; }
  .cp-destinatario p.cp-dest-label { color: #555; font-size: 9.5pt; margin-bottom: 2px; }
  .cp-destinatario p.cp-dest-nombre { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; }
  .cp-destinatario p.cp-dest-cargo  { font-style: italic; color: #444; }
  .cp-destinatario p.cp-dest-inst   { font-weight: bold; }
  .cp-destinatario p.cp-dest-lugar  { color: #555; }

  /* Línea "obrando en..." */
  .cp-obrando {
    font-size: 10pt;
    font-style: italic;
    color: #333;
    border-bottom: 1px dashed #aaa;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }

  /* Asunto */
  .cp-asunto {
    margin: 10px 0 14px;
    font-size: 10pt;
    line-height: 1.45;
    text-align: justify;
  }

  /* Párrafos de cuerpo */
  .cp-body {
    margin: 0 0 12px;
  }
  .cp-body p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }

  /* Secciones numeradas */
  .cp-section {
    margin: 12px 0;
    }
  .cp-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .cp-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .cp-section ol {
    font-size: 10pt;
    padding-left: 22px;
    margin: 5px 0;
    line-height: 1.45;
  }
  .cp-section ol li {
    margin-bottom: 4px;
    text-align: justify;
  }

  /* Tabla de datos del proponente */
  table.cp-data {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 10px;
    font-size: 9.5pt;
    }
  table.cp-data th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 22%;
    text-align: left;
    white-space: nowrap;
  }
  table.cp-data td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  /* Tabla de ítems / propuesta económica */
  table.cp-items {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 6px;
    font-size: 9.5pt;
    }
  table.cp-items thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.cp-items thead th.left { text-align: left; }
  table.cp-items tbody td {
    padding: 4px 7px;
    border: 1px solid #ccc;
    vertical-align: top;
    line-height: 1.35;
  }
  table.cp-items tbody tr:nth-child(even) td { background: #f5f5f5; }
  table.cp-items tfoot td {
    padding: 5px 7px;
    border: 1px solid #aaa;
    font-weight: bold;
    background: #eee;
  }

  /* Valor en letras */
  .cp-letras {
    font-size: 9.5pt;
    margin: 6px 0 10px;
    padding: 5px 10px;
    border-left: 3px solid #333;
    background: #fff;
  }

  /* Firma */
  .cp-firma-section {
    margin-top: 10px;
  }
  .cp-firma-block {
    display: inline-block;
    text-align: center;
    min-width: 240px;
  }
  .cp-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .cp-firma-block p {
    font-size: 10pt;
    margin: 2px 0;
  }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla institucional -->
<table class="cp-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha de Presentación</th>
    <td colspan="3">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- Lugar y fecha -->
<div class="cp-fecha">
  <p>{{ municipio_contratista }}, {{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else hoy_largo }}</p>
</div>

<!-- Destinatario -->
<div class="cp-destinatario">
  <p class="cp-dest-label">Señor(a):</p>
  <p class="cp-dest-nombre">{{ rector }}</p>
  <p class="cp-dest-cargo">Rector(a)</p>
  <p class="cp-dest-inst">{{ inst_nombre }}</p>
  <p class="cp-dest-lugar">{{ inst_municipio }}, {{ inst_departamento }}</p>
</div>

<!-- Asunto -->
<div class="cp-asunto">
  <p>
    <strong>Asunto:</strong> Invitación a presentar cotización para proceso de Mínima Cuantía —
    Contratación hasta veinte (20) Salarios Mínimos Legales Mensuales Vigentes (SMLMV),
    conforme al artículo 2.2.1.2.1.5.2 del Decreto 1082 de 2015.
  </p>
</div>

<!-- Cuerpo -->
<div class="cp-body">
  <p>
    {% if es_empresa and rep_legal_nombre %}
      Yo, <strong>{{ rep_legal_nombre }}</strong>, identificado(a) con
      CC N.° <strong>{{ format_id(rep_legal_cc) }}</strong>, actuando en representación de
      <strong>{{ nombre_contratista }}</strong>,
      NIT N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
      en mi calidad de oferente, presento formalmente mi oferta dentro del
      procedimiento de contratación de la referencia, manifestando lo siguiente:
    {% else %}
      Yo, <strong>{{ nombre_contratista }}</strong>, identificado(a) con
      {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
      actuando en nombre propio, en mi calidad de oferente, presento formalmente
      mi oferta dentro del procedimiento de contratación de la referencia,
      manifestando lo siguiente:
    {% endif %}
  </p>
</div>

<!-- Declaraciones a–g -->
<div class="cp-section">
  <ol type="a">
    <li>
      Declaro haber leído y comprendido en su totalidad los documentos de la
      invitación pública y sus anexos, sin formular reservas o condicionamientos.
    </li>
    <li>
      Me comprometo a ejecutar el objeto contractual consistente en:
      &ldquo;<strong>{{ objeto }}</strong>&rdquo;,
      garantizando la continuidad del servicio durante la vigencia contractual.
      El servicio deberá cumplir con los requerimientos funcionales, técnicos y
      de seguridad definidos por
      {{ inst_art }}
      <strong>{{ inst_nombre }}</strong>, así como permitir la correcta
      administración de la información institucional.
    </li>
    <li>
      Declaro contar con la idoneidad, capacidad técnica y jurídica necesarias
      para cumplir las obligaciones derivadas del contrato.
    </li>
    <li>
      Manifiesto que tengo plena capacidad legal para contratar y que no me
      encuentro incurso(a) en causales de inhabilidad o incompatibilidad
      previstas en la Constitución y la ley.
    </li>
    <li>
      Declaro que presento una única oferta dentro del presente proceso y que
      la información y documentos aportados son veraces y verificables.
    </li>
    <li>
      La presente oferta tendrá una vigencia de treinta (30) días calendario,
      contados a partir de la fecha de cierre de la invitación.
    </li>
    <li>
      Entiendo que la aceptación de esta oferta por parte de
      {{ inst_art }}
      <strong>{{ inst_nombre }}</strong> constituye la manifestación de voluntad
      para la suscripción de la respectiva orden de compra o contrato, conforme
      al procedimiento establecido para procesos de contratación menores o
      iguales a veinte (20) salarios mínimos mensuales legales vigentes (SMMLV).
      Dicha aceptación generará los efectos legales y presupuestales
      correspondientes, conforme a la Ley 80 de 1993, el Decreto 4791 de 2008
      y el Decreto 1082 de 2015.
    </li>
  </ol>
</div>

<!-- Domicilio de notificaciones -->
<div class="cp-section">
  <p>
    Igualmente señalo como lugar donde recibiré notificaciones, comunicaciones
    y requerimientos relacionados con esta contratación, el siguiente:
  </p>
  <p><strong>Dirección:</strong> {{ direccion_contratista }}</p>
  <p><strong>Municipio:</strong> {{ municipio_contratista }}</p>
  <p><strong>Celular:</strong> {{ celular_contratista }}</p>
  <p><strong>Email:</strong> {{ email_contratista }}</p>
  <p style="margin-top:10px; text-align:justify;">
    Este será el domicilio oficial para efectos del presente proceso contractual,
    en cumplimiento de lo establecido en la normatividad vigente y para garantizar
    una comunicación oportuna y efectiva con la entidad contratante.
  </p>
</div>

<!-- Firma -->
<div class="cp-firma-section">
  <div class="cp-firma-block">
    <div class="cp-firma-linea" style="border:none">
      {% if es_empresa and rep_legal_nombre %}
        <p><strong>{{ rep_legal_nombre }}</strong></p>
        <p>CC N.° {{ rep_legal_cc }}</p>
        <p>Representante Legal</p>
        <p>{{ nombre_contratista }}</p>
      {% else %}
        <p><strong>{{ nombre_contratista }}</strong></p>
        <p>{{ tipo_id_contratista }} N.° {{ num_id_contratista }}</p>
        <p>Proponente / Contratista</p>
      {% endif %}
      <p>Cel.: {{ celular_contratista }}</p>
      <p>{{ email_contratista }}</p>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/cdp.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}CDP N.° {{ num_cdp }} — {{ numero }}{% endblock %}
{% block doc_titulo %}CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     CDP — estilos específicos de impresión
     ══════════════════════════════════════════════ */

  .cdp-numero {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    color: #333;
    letter-spacing: 1px;
    margin: 8px 0 14px;
  }

  /* Tabla cabecera institucional */
  table.cdp-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.cdp-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.cdp-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  /* Secciones */
  .cdp-section {
    margin: 12px 0;
    }
  .cdp-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .cdp-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 6px 0;
    line-height: 1.45;
  }

  /* Concepto de la Disponibilidad */
  .cdp-concepto-bloque {
    font-size: 10pt;
    text-align: justify;
    line-height: 1.45;
    border: 1px solid #ccc;
    border-top: none;
    padding: 8px 10px;
    margin-bottom: 12px;
    }

  /* Tabla detalle presupuestal */
  table.cdp-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px;
    font-size: 9.5pt;
    }
  table.cdp-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.cdp-table thead th.left { text-align: left; }
  table.cdp-table tbody td {
    padding: 5px 7px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  table.cdp-table tfoot td {
    padding: 5px 7px;
    border: 1px solid #aaa;
    font-weight: bold;
    background: #eee;
  }
  .cdp-table td.right  { text-align: right;  font-weight: bold; }
  .cdp-table td.center { text-align: center; }

  /* Tabla saldos control interno */
  table.cdp-saldos {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 14px;
    font-size: 9.5pt;
    }
  table.cdp-saldos .cdp-saldos-title {
    background: #eee;
    color: #000;
    text-align: center;
    font-weight: bold;
    padding: 5px 8px;
    font-size: 9.5pt;
    border: 1px solid #999;
  }
  table.cdp-saldos thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #aaa;
    font-size: 9pt;
  }
  table.cdp-saldos tbody td {
    padding: 4px 7px;
    border: 1px solid #ccc;
  }
  /* Inputs dentro de la tabla de saldos */
  .cdp-saldos input[type="number"] {
    width: 100%;
    border: none;
    background: #f5f5f5;
    text-align: right;
    font-size: 9.5pt;
    padding: 3px 4px;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
  }
  .cdp-saldos input[type="number"]:focus {
    outline: 2px solid #333;
    background: #fff;
  }
  .cdp-saldos .nuevo-saldo {
    text-align: right;
    font-weight: bold;
    color: #333;
    padding: 3px 4px;
    font-size: 9.5pt;
  }
  @media print {
    .cdp-saldos input[type="number"] {
      background: transparent;
      border-bottom: 1px solid #999;
    }
  }

  /* Valor certificado destacado */
  .cdp-valor-box {
    border: 2px solid #333;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 10px 0;
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    color: #333;
    }
  .cdp-valor-box .letras {
    font-size: 9.5pt;
    font-weight: normal;
    color: #333;
    display: block;
    margin-top: 3px;
  }

  /* Firmas dos columnas */
  .cdp-firma-section {
    margin-top: 15px;
  }
  .cdp-firma-grid {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 10px;
  }
  .cdp-firma-block {
    flex: 0 1 45%;
    text-align: center;
  }
  .cdp-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .cdp-firma-block p {
    font-size: 10pt;
    margin: 2px 0;
  }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Número CDP destacado -->
<div class="cdp-numero">CDP N.° {{ num_cdp }}</div>

<!-- Tabla de datos institucionales -->
<table class="cdp-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Fecha de Expedición</th>
    <td>{{ fecha_cdp_larga }}</td>
  </tr>
  <tr>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
    <th>Vigencia</th>
    <td>{{ anio }}</td>
  </tr>
</table>

<!-- Párrafo de certificación — firmado por el Rector/a -->
<div class="cdp-section">
  <p>
    El (la) suscrito(a) Rector(a), en uso de sus facultades legales y en especial
    las conferidas por el Decreto Ley 111 de 1996, artículo 71, y de conformidad
    con el Decreto 4791 de 2008 y el artículo 11 de la Ley 715 de 2001, certifica
    que, una vez revisados los saldos presupuestales correspondientes a la vigencia
    <strong>{{ anio }}</strong>, se expide el presente Certificado de Disponibilidad
    Presupuestal (CDP) dejando afectado el presupuesto del Fondo de Servicios
    Educativos – FOSE, así:
  </p>
</div>

<!-- Concepto de la Disponibilidad -->
<div class="cdp-section-titulo">Concepto de la Disponibilidad</div>
<div class="cdp-concepto-bloque">{{ objeto }}</div>

<!-- Valor certificado -->
<div class="cdp-valor-box">
  {{ format_moneda(valor_total) }}
  <span class="letras">{{ valor_letras }}</span>
</div>

<!-- Detalle presupuestal -->
<div class="cdp-section">
  <div class="cdp-section-titulo">Detalle Presupuestal</div>
  <table class="cdp-table">
    <thead>
      <tr>
        <th class="left" style="width:38%">Rubro Presupuestal</th>
        <th style="width:20%">Fuente de Financiación</th>
        <th style="width:12%">CF</th>
        <th style="width:30%; text-align:right">Valor Certificado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
        <td class="center">{{ fuente }} — {{ fuente_nombre }}</td>
        <td class="center">&nbsp;</td>
        <td class="right">{{ format_moneda(valor_total) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:right">TOTAL CERTIFICADO:</td>
        <td class="right">{{ format_moneda(valor_total) }}</td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- Saldos por rubro — control interno -->
<table class="cdp-saldos">
  <tr>
    <td colspan="4" class="cdp-saldos-title">SALDOS POR RUBRO — CONTROL INTERNO</td>
  </tr>
  <thead>
    <tr>
      <th style="width:40%">RUBROS</th>
      <th style="width:20%">Saldo Presupuestal</th>
      <th style="width:20%">Compromiso</th>
      <th style="width:20%">Nuevo Saldo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
      <td>
        <input type="number" id="saldo_ppto" min="0" step="1"
               value="{{ saldo_ppto | int if saldo_ppto else '' }}"
               placeholder="Digite el saldo"
               oninput="calcularNuevoSaldo()">
      </td>
      <td>
        <input type="number" id="compromiso" min="0" step="1"
               value="{{ saldo_compromiso | int if saldo_compromiso else valor_total | int }}"
               oninput="calcularNuevoSaldo()">
      </td>
      <td>
        <div class="nuevo-saldo" id="nuevo_saldo">—</div>
      </td>
    </tr>
  </tbody>
</table>

<script>
  // Formatea número como moneda colombiana sin símbolo $
  function fmtCOP(n) {
    if (isNaN(n)) return '—';
    return '$ ' + Math.round(n).toLocaleString('es-CO');
  }
  function calcularNuevoSaldo() {
    const saldo = parseFloat(document.getElementById('saldo_ppto').value) || 0;
    const comp  = parseFloat(document.getElementById('compromiso').value)  || 0;
    const nuevo = saldo - comp;
    const el    = document.getElementById('nuevo_saldo');
    el.textContent = fmtCOP(nuevo);
    el.style.color = nuevo >= 0 ? '#333' : '#555';
  }
  // Inicializar con el valor del compromiso ya cargado
  window.addEventListener('load', calcularNuevoSaldo);
</script>

<!-- Vigencia y condiciones -->
<div class="cdp-section">
  <div class="cdp-section-titulo">Vigencia y Condiciones</div>
  <p>
    El presente Certificado de Disponibilidad Presupuestal tiene una vigencia de
    <strong>treinta (30) días calendario</strong> contados a partir de la fecha de
    su expedición, y quedará sin efecto si dentro de dicho término no se expide el
    correspondiente Registro Presupuestal.
  </p>
  <p>
    La expedición de este certificado no implica compromiso presupuestal alguno.
    El compromiso definitivo solo se perfeccionará con la expedición del Registro
    Presupuestal respectivo, una vez suscrito el contrato.
  </p>
</div>

<!-- Firma -->
<div class="cdp-firma-section">
  <div class="cdp-firma-block" style="text-align:center;max-width:320px;margin:0 auto">
    <div class="cdp-firma-linea" style="border:none">
      <p><strong>{{ rector | upper }}</strong></p>
      <p>C.C. {{ format_id(cc_rector) }}</p>
      <p>Rector(a) — Ordenador del Gasto</p>
      <p>{{ inst_nombre }}</p>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/certificacion_plan_compras.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Cert. Plan de Compras{% endblock %}
{% block doc_titulo %}Certificación Plan Anual de Adquisiciones{% endblock %}

{% block extra_css %}
<style>
  @page { size: letter portrait; margin: 12mm 14mm 10mm 18mm; }

  /* ── Caja con borde y fondo gris claro ── */
  .cpc-caja {
    border: 1px solid #b0b0b0;
    background: #fff;
    padding: 11px 16px;
    margin-bottom: 7px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
      break-inside: avoid;
  }

  /* ── Banda de título oscuro ── */
  .cpc-titulo {
    background: #eee;
    color: #000;
    text-align: center;
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    padding: 10px 14px;
    letter-spacing: 0.4px;
    margin-bottom: 7px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Ordenador del gasto ── */
  .cpc-ordenador {
    text-align: center;
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1.45;
  }

  /* ── CERTIFICA ── */
  .cpc-certifica {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    letter-spacing: 2px;
    padding: 2px 0;
  }

  /* ── Textos ── */
  .cpc-texto {
    text-align: justify;
    font-size: 10.5pt;
    line-height: 1.45;
  }
  .cpc-texto-italic {
    text-align: justify;
    font-size: 10.5pt;
    line-height: 1.45;
    font-style: italic;
  }

  /* ── Tabla UNSPSC ── */
  .cpc-tabla-wrap {
    margin-bottom: 7px;
      break-inside: avoid;
  }
  .cpc-tabla {
    width: 100%;
    border-collapse: collapse;
  }
  .cpc-tabla thead th {
    background: #eee;
    color: #000;
    font-weight: bold;
    text-align: center;
    padding: 8px 7px;
    font-size: 10pt;
    border: 1.5px solid #999;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cpc-tabla tbody td {
    border: 1px solid #999;
    padding: 10px 10px;
    vertical-align: middle;
    font-size: 10pt;
    line-height: 1.45;
  }
  .cpc-tabla tbody td.tc { text-align: center; }
  .cpc-tabla tbody td.tj { text-align: justify; }

  /* ── Firma ── */
  .cpc-firma-wrap {
    margin-top: 15px;
      break-inside: avoid;
  }
  .cpc-firma-etiq {
    font-size: 10pt;
    color: #555;
    margin-bottom: 48px;
  }
  .cpc-firma-bloque, .cpc-firma-bloque * {
    border-top: none !important;
    border: none !important;
  }
  .cpc-firma-bloque {
    width: 60%;
    padding-top: 5px;
  }
  .cpc-firma-bloque p { font-size: 10.5pt; line-height: 1.45; }
</style>
{% endblock %}

{% block doc_content %}

  <!-- 1. Banda de título del certificado -->
  <div class="cpc-titulo">
    Certificación de Inclusión de Bien o Servicio en el Plan Anual de Adquisiciones
  </div>

  <!-- 2. Ordenador del gasto -->
  <div class="cpc-caja">
    <p class="cpc-ordenador">
      El suscrito Ordenador del Gasto {{ inst_del }} {{ inst_nombre }}
    </p>
  </div>

  <!-- 3. CERTIFICA -->
  <div class="cpc-caja">
    <p class="cpc-certifica">CERTIFICA</p>
  </div>

  <!-- 4. Párrafo introductorio -->
  <div>
    <p class="cpc-texto">
      Que el bien o servicio que se describe a continuación se encuentra incluido en el
      Plan General de Compras, aprobado por el Consejo Directivo para la vigencia fiscal
      <strong>{{ anio }}</strong>
    </p>
  </div>

  <!-- 5. Tabla de ítems UNSPSC -->
  <div class="cpc-tabla-wrap">
    <table class="cpc-tabla">
      <thead>
        <tr>
          <th style="width:18%">Códigos UNSPSC</th>
          <th style="width:15%">Rubro</th>
          <th style="width:67%">Descripción del Bien o Servicio</th>
        </tr>
      </thead>
      <tbody>
                <tr>
          <td class="tc" style="line-height:1.7">
            {{ codigos_unspsc_texto }}
          </td>
          <td class="tc">{{ rubro_codigo or '—' }}</td>
          <td class="tj">{{ objeto or '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 6. Párrafo: acuerdo Consejo Directivo -->
  <div>
    <p class="cpc-texto">
      Lo anterior, conforme al Acuerdo aprobado por el Consejo Directivo, de fecha
      <strong>{{ fecha_aprobacion_plan_compras_larga or '___________________' }}</strong>{% if fecha_modificacion_plan_compras_larga %},
      y plan de compras modificado <strong>{{ fecha_modificacion_plan_compras_larga }}</strong>{% endif %}.
    </p>
  </div>

  <!-- 7. Párrafo: expedición del certificado -->
  <div>
    <p class="cpc-texto-italic">
      La presente certificación se expide para el inicio del proceso de contratación del
      bien o servicio <strong>{{ fecha_cdp_larga or hoy_largo }}</strong>
    </p>
  </div>

  <!-- 8. Firma -->
  <div class="cpc-firma-wrap">
    <div class="cpc-firma-bloque" style="border:none;border-top:none">
      {% if firma_rector_img %}<img src="{{ firma_rector_img }}" style="max-height:120px;max-width:300px;display:block;margin:0 0 2px" alt="Firma">{% endif %}
      <p><strong>{{ (rector or '________________________________') | upper }}</strong></p>
      {% if cc_rector %}<p>C.C. {{ format_id(cc_rector) }}</p>{% endif %}
      <p>Rector(a) — Ordenador del Gasto</p>
      <p>{{ inst_nombre }}</p>
    </div>
  </div>

{% endblock %}
`;

DOC_TEMPLATES["docs/contrato.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}{{ tipo_contrato }} N.° {{ numero }}{% endblock %}
{% block doc_titulo %}{{ tipo_contrato | upper }}{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   CONTRATO  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ct-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 10px;
  letter-spacing: 0.5px;
}

/* ── Párrafo introductorio ────────────────────────── */
.ct-intro {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 10px;
}

/* ── Cláusulas ────────────────────────────────────── */
.ct-clausula {
  margin: 6px 0 8px;
}
.ct-clausula-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 7px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ct-clausula p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 3px 0;
  line-height: 1.45;
}
.ct-clausula ol,
.ct-clausula ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 3px 0 5px;
  line-height: 1.45;
}
.ct-clausula ol li,
.ct-clausula ul li {
  margin-bottom: 2px;
  text-align: justify;
}

/* ── Tabla Ítems / Bienes y Servicios (UNSPSC) ────── */
table.ct-unspsc {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
}
table.ct-unspsc thead th {
  background: #555;
  color: #fff;
  font-weight: bold;
  text-align: center;
  padding: 6px 6px;
  border: 1.5px solid #555;
  letter-spacing: 0.3px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ct-unspsc tbody td {
  padding: 5px 6px;
  border: 1.5px solid #aaa;
  text-align: center;
  font-size: 9pt;
  line-height: 1.4;
}
table.ct-unspsc tbody td.ct-unspsc-nombre {
  text-align: left;
}

/* ── Lugar y fecha de suscripción ─────────────────── */
.ct-lugar {
  font-size: 9.5pt;
  text-align: justify;
  margin: 4px 0 10px;
  line-height: 1.45;
}

/* ── Firmas ───────────────────────────────────────── */
.ct-firma-section {
  margin-top: 15px;
}
table.ct-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.ct-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 20px;
  border: none;
  vertical-align: bottom;
}
.ct-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 25px;
}
.ct-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ct-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="ct-numero">N.° {{ numero }}</p>

<!-- ── PARTES ────────────────────────────────────────────────── -->
<p class="ct-intro">
  Entre los suscritos, a saber: <strong>{{ rector }}</strong>, mayor de edad,
  identificado(a) con C.C. N.° <strong>{{ format_id(cc_rector) }}</strong>, actuando en
  calidad de Rector(a) y Ordenador del Gasto de
  {{ inst_art }}
  <strong>{{ inst_nombre }}</strong>,
  NIT <strong>{{ format_id(inst_nit) }}</strong>, con domicilio en {{ inst_dir }},
  {{ inst_municipio }}, {{ inst_departamento }}, correo electrónico {{ inst_email }},
  quien en adelante se denominará <strong>"EL CONTRATANTE"</strong>; y de otra parte,
  {% if es_empresa and rep_legal_nombre %}
    la empresa <strong>{{ nombre_contratista }}</strong>,
    NIT <strong>{{ format_id(num_id_contratista) }}</strong>,
    representada legalmente por <strong>{{ rep_legal_nombre }}</strong>,
    identificado(a) con C.C. N.° <strong>{{ format_id(rep_legal_cc) }}</strong>,
  {% elif es_empresa %}
    la empresa <strong>{{ nombre_contratista }}</strong>,
    NIT <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% elif sexo_contratista == 'F' %}
    <strong>{{ nombre_contratista }}</strong>, mayor de edad, identificada
    con {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% else %}
    <strong>{{ nombre_contratista }}</strong>, mayor de edad, identificado
    con {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% endif %}
  con domicilio en {{ direccion_contratista }}, {{ municipio_contratista }},
  teléfono {{ celular_contratista }}, correo electrónico {{ email_contratista }},
  quien en adelante se denominará <strong>"EL CONTRATISTA"</strong>, hemos convenido
  en celebrar el presente contrato, que se regirá por las siguientes cláusulas y,
  en lo no previsto, por las normas generales del derecho y especialmente por la
  Ley 80 de 1993, la Ley 1150 de 2007, el Decreto 1082 de 2015 y demás normas concordantes:
</p>

<!-- ── CLÁUSULA PRIMERA ───────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Primera — Objeto</div>
  <p>
    <strong>EL CONTRATISTA</strong> se obliga para con
    <strong>EL CONTRATANTE</strong> a: <strong>{{ objeto }}</strong>,
    de conformidad con las condiciones técnicas establecidas en el estudio
    previo, la propuesta presentada por el contratista y las instrucciones
    impartidas por el supervisor del contrato.
  </p>
</div>

<!-- ── CLÁUSULA SEGUNDA ───────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Segunda — Valor</div>
  <p>
    El valor total del presente contrato es la suma de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), incluido el IVA y demás
    impuestos que apliquen, suma que será pagada con cargo al rubro
    presupuestal <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    fuente <strong>{{ fuente }} — {{ fuente_nombre }}</strong>, amparado en el CDP N.°
    <strong>{{ num_cdp }}</strong> expedido el
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- ── CLÁUSULA TERCERA ───────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Tercera — Forma de Pago</div>
  {% set fp = forma_pago or 'Pago único' %}
  <p>
    {% if fp == 'Pagos mensuales' %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato en <strong>pagos mensuales</strong>, dentro de los
      quince (15) días hábiles siguientes al vencimiento de cada mes de ejecución,
      previa presentación de la factura o cuenta de cobro y suscripción del acta
      parcial de cumplimiento por parte del supervisor.
    {% elif fp == 'Pagos bimestrales' %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato en <strong>pagos bimestrales</strong>, dentro de los
      veinte (20) días hábiles siguientes al vencimiento de cada bimestre de
      ejecución, previa presentación de la factura o cuenta de cobro y suscripción
      del acta parcial de cumplimiento por parte del supervisor.
    {% elif fp == 'Pagos trimestrales' %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato en <strong>pagos trimestrales</strong>, dentro de los
      veinte (20) días hábiles siguientes al vencimiento de cada trimestre de
      ejecución, previa presentación de la factura o cuenta de cobro y suscripción
      del acta parcial de cumplimiento por parte del supervisor.
    {% elif fp == 'Pagos semestrales' %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato en <strong>pagos semestrales</strong>, dentro de los
      treinta (30) días hábiles siguientes al vencimiento de cada semestre de
      ejecución, previa presentación de la factura o cuenta de cobro y suscripción
      del acta parcial de cumplimiento por parte del supervisor.
    {% elif fp == 'Anticipos y saldo' %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato mediante <strong>anticipo y pago del saldo</strong>.
      El anticipo, equivalente al cincuenta por ciento (50%) del valor total, se
      desembolsará dentro de los quince (15) días hábiles siguientes a la
      suscripción del acta de inicio. El saldo restante se pagará dentro de los
      treinta (30) días hábiles siguientes a la presentación de los documentos
      que acrediten la ejecución total del objeto contractual, previa suscripción
      del acta de recibido a satisfacción por parte del supervisor.
    {% else %}
      <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
      el valor del contrato en un <strong>único pago</strong>, dentro de los
      dos (2) días hábiles siguientes a la presentación de los documentos
      que acrediten la ejecución total del objeto contractual, previa suscripción
      del acta de recibido a satisfacción por parte del supervisor.
    {% endif %}
    {% if fp != 'Anticipos y saldo' %}
      Para el trámite del pago deberán cumplirse los siguientes requisitos:
    {% endif %}
  </p>
  <ol>
    <li>Factura o cuenta de cobro debidamente expedida a nombre {{ inst_del }} <strong>{{ inst_nombre }}</strong>.</li>
    <li>Acta de recibido a satisfacción firmada por el supervisor.</li>
    <li>Informe final de actividades (cuando aplique).</li>
    <li>Certificado de pago de aportes al Sistema General de Seguridad Social (cuando aplique).</li>
    <li>Certificación bancaria vigente.</li>
  </ol>
  <p>
    {{ inst_Art }} <strong>{{ inst_nombre }}</strong> efectuará las retenciones en la fuente y demás descuentos
    de ley que correspondan. El pago neto estimado, descontada la retención
    en la fuente de <strong>{{ format_moneda(retencion) }}</strong>, es de
    <strong>{{ format_moneda(neto) }}</strong>
    (<strong>{{ neto_letras }}</strong>).
  </p>
</div>

<!-- ── CLÁUSULA CUARTA ────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Cuarta — Duración</div>
  <p>
    El plazo de ejecución del presente contrato es de
    <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>, contados a partir de
    la suscripción del acta de inicio, previo cumplimiento de los requisitos
    de perfeccionamiento y ejecución del contrato.
  </p>
  <p>
    <strong>Fecha estimada de inicio:</strong> {{ fecha_inicio_larga }}&nbsp;&nbsp;
    <strong>Fecha estimada de terminación:</strong> {{ fecha_fin_larga }}
  </p>
  <p>
    Este plazo podrá ser prorrogado por mutuo acuerdo entre las partes,
    mediante adición o modificación del contrato, siempre que exista
    disponibilidad presupuestal y justificación suficiente.
  </p>
</div>

<!-- ── CLÁUSULA QUINTA ────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Quinta — Obligaciones del Contratista</div>
  <p>
    Además de las obligaciones generales derivadas del presente contrato,
    <strong>EL CONTRATISTA</strong> se compromete a:
  </p>
  {% if obligaciones %}
  <p>{{ obligaciones }}</p>
  {% else %}
  <ol>
    <li>Ejecutar el objeto del contrato en las condiciones de tiempo, modo y lugar pactadas.</li>
    <li>Cumplir con las especificaciones técnicas y de calidad requeridas.</li>
    <li>Atender oportunamente las instrucciones del supervisor del contrato.</li>
    <li>Presentar los informes, soportes y actas requeridas por el supervisor.</li>
    <li>No ceder ni subcontratar el contrato sin previa autorización escrita {{ inst_del }} <strong>{{ inst_nombre }}</strong>.</li>
    <li>Guardar confidencialidad sobre la información institucional a la que tenga acceso.</li>
    <li>Mantener al día los aportes al Sistema General de Seguridad Social, cuando sea aplicable.</li>
    <li>Cumplir con las normas ambientales, laborales y de seguridad que apliquen al objeto contratado.</li>
    <li>Informar oportunamente cualquier circunstancia que pueda afectar la ejecución del contrato.</li>
    <li>Suscribir el acta de inicio, los informes y el acta de liquidación del contrato.</li>
  </ol>
  {% endif %}
</div>

<!-- ── CLÁUSULA SEXTA ─────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Sexta — Obligaciones del Contratante</div>
  <p><strong>EL CONTRATANTE</strong> se obliga a:</p>
  <ol>
    <li>Pagar el valor del contrato en los términos y condiciones pactadas en la Cláusula Tercera.</li>
    <li>Suministrar oportunamente la información y documentación necesaria para la ejecución del contrato.</li>
    <li>Designar un supervisor que realice el seguimiento técnico, financiero, contable y jurídico del contrato.</li>
    <li>Expedir las certificaciones y constancias que el contratista requiera dentro del marco del contrato.</li>
    <li>Tramitar oportunamente los documentos necesarios para el perfeccionamiento, legalización y ejecución del contrato.</li>
    <li>Recibir a satisfacción los bienes o servicios objeto del contrato, una vez verificado el cumplimiento de las condiciones pactadas.</li>
  </ol>
</div>

<!-- ── CLÁUSULA SÉPTIMA ───────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Séptima — Supervisión</div>
  <p>
    La supervisión del presente contrato estará a cargo de
    <strong>{{ rector }}</strong>, identificado(a) con C.C. N.°
    <strong>{{ format_id(cc_rector) }}</strong>, en su calidad de Rector(a) y
    Ordenador del Gasto {{ inst_del }} <strong>{{ inst_nombre }}</strong>,
    o de quien este designe o haga sus veces. El supervisor ejercerá seguimiento
    y control sobre los aspectos técnicos, financieros, contables, jurídicos y
    administrativos del contrato, verificando el cumplimiento del objeto, las
    obligaciones pactadas y los plazos establecidos, de conformidad con lo
    dispuesto en la Ley 1474 de 2011 y el Manual de Supervisión e Interventoría
    {{ inst_del }} <strong>{{ inst_nombre }}</strong>.
  </p>
</div>

<!-- ── CLÁUSULA OCTAVA ────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Octava — Inhabilidades e Incompatibilidades</div>
  <p>
    <strong>EL CONTRATISTA</strong> declara, bajo la gravedad del juramento,
    que no se encuentra incurso en ninguna de las inhabilidades,
    incompatibilidades o conflictos de interés previstos en la Constitución
    Política y en la ley, especialmente en los artículos 8 y 9 de la Ley 80
    de 1993, la Ley 1474 de 2011 y demás normas concordantes. El incumplimiento
    de esta declaración acarreará la nulidad absoluta del contrato y las
    sanciones previstas en la ley.
  </p>
</div>

<!-- ── CLÁUSULA NOVENA ────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Novena — Prohibición de Cesión</div>
  <p>
    <strong>EL CONTRATISTA</strong> no podrá ceder total ni parcialmente
    el presente contrato sin la previa autorización expresa y escrita de
    <strong>EL CONTRATANTE</strong>. Tampoco podrá subcontratar la totalidad
    del objeto del contrato. La violación de esta prohibición dará lugar a la
    terminación unilateral del contrato y a las acciones legales pertinentes.
  </p>
</div>

<!-- ── CLÁUSULA DÉCIMA ────────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima — Cláusula Penal Compensatoria</div>
  <p>
    En caso de incumplimiento imputable a <strong>EL CONTRATISTA</strong>,
    este deberá pagar a <strong>EL CONTRATANTE</strong> a título de
    cláusula penal compensatoria, una suma equivalente al
    <strong>diez por ciento (10%)</strong> del valor total del contrato,
    es decir, la suma de
    <strong>{{ format_moneda(penal_10pct) }}</strong>
    (<strong>{{ penal_10pct_letras }}</strong>).
    Este valor podrá hacerse efectivo directamente por {{ inst_art }} <strong>{{ inst_nombre }}</strong>,
    mediante descuento de las sumas que se le adeuden al contratista o
    mediante los mecanismos establecidos en la ley, sin perjuicio de las
    demás acciones a que haya lugar.
  </p>
</div>

<!-- ── CLÁUSULA DÉCIMA PRIMERA ────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Primera — Documentos del Contrato</div>
  <p>
    Forman parte integral del presente contrato y tienen igual valor
    jurídico que él, los siguientes documentos:
  </p>
  <ol>
    <li>El Estudio Previo y de Conveniencia.</li>
    <li>La invitación a cotizar y sus anexos.</li>
    <li>La propuesta presentada por el contratista.</li>
    <li>El informe de evaluación y recomendación de adjudicación.</li>
    <li>El CDP N.° {{ num_cdp }} y el RP N.° {{ num_rp }}.</li>
    <li>Los demás documentos que se generen durante la ejecución del contrato.</li>
  </ol>
</div>

<!-- ── CLÁUSULA DÉCIMA SEGUNDA ────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Segunda — Perfeccionamiento y Ejecución</div>
  <p>
    El presente contrato se perfecciona con la firma de las partes. Para su
    ejecución se requiere:
  </p>
  <ol>
    <li>La existencia del CDP y del RP que amparen el compromiso presupuestal.</li>
    <li>La suscripción del acta de inicio por las partes y el supervisor.</li>
    <li>El cumplimiento de los demás requisitos establecidos en la ley y en el presente contrato.</li>
  </ol>
</div>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="ct-lugar">
  En señal de conformidad y aceptación con el contenido del presente contrato,
  las partes lo suscriben en {{ inst_municipio }}, el {{ fecha_suscripcion_larga }}.
</p>

<!-- ── FIRMAS ─────────────────────────────────────────────────── -->
<div class="ct-firma-section">
  <table class="ct-firma-tabla">
    <tr>
      <td>
        <div class="ct-firma-linea" style="border:none">
          <p class="ct-firma-nombre">{{ rector }}</p>
          <p class="ct-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="ct-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ct-firma-cargo">{{ inst_nombre }}</p>
          <p class="ct-firma-cargo">NIT {{ format_id(inst_nit) }}</p>
          <p class="ct-firma-cargo"><strong>EL CONTRATANTE</strong></p>
        </div>
      </td>
      <td>
        <div class="ct-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ct-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ct-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ct-firma-cargo">Representante Legal</p>
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% elif es_empresa %}
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="ct-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="ct-firma-cargo"><strong>EL CONTRATISTA</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/contrato2.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES DE APOYO A LA GESTIÓN CONTABLE N.° {{ numero }}{% endblock %}
{% block doc_titulo %}CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES DE APOYO A LA GESTIÓN CONTABLE{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   CONTRATO PRESTACIÓN SERVICIOS CONTABLES  ·  estilos
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ct-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 10px;
  letter-spacing: 0.5px;
}

/* ── Párrafo introductorio ────────────────────────── */
.ct-intro {
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  margin: 0 0 10px;
}

/* ── Cláusulas ────────────────────────────────────── */
.ct-clausula {
  margin: 6px 0 8px;
}
.ct-clausula-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 7px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ct-clausula p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 3px 0;
  line-height: 1.45;
}
.ct-clausula ol,
.ct-clausula ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 3px 0 5px;
  line-height: 1.45;
}
.ct-clausula ol li,
.ct-clausula ul li {
  margin-bottom: 2px;
  text-align: justify;
}

/* ── Tabla Ítems / Bienes y Servicios (UNSPSC) ────── */
table.ct-unspsc {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
}
table.ct-unspsc thead th {
  background: #555;
  color: #fff;
  font-weight: bold;
  text-align: center;
  padding: 6px 6px;
  border: 1.5px solid #555;
  letter-spacing: 0.3px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ct-unspsc tbody td {
  padding: 5px 6px;
  border: 1.5px solid #aaa;
  text-align: center;
  font-size: 9pt;
  line-height: 1.4;
}
table.ct-unspsc tbody td.ct-unspsc-nombre {
  text-align: left;
}

/* ── Lugar y fecha de suscripción ─────────────────── */
.ct-lugar {
  font-size: 9.5pt;
  text-align: justify;
  margin: 4px 0 10px;
  line-height: 1.45;
}

/* ── Firmas ───────────────────────────────────────── */
.ct-firma-section {
  margin-top: 15px;
}
table.ct-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.ct-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 20px;
  border: none;
  vertical-align: bottom;
}
.ct-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 25px;
}
.ct-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ct-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="ct-numero">N.° {{ numero }}</p>

<!-- ── PARTES ────────────────────────────────────────────────── -->
<p class="ct-intro">
  Entre los suscritos, a saber: <strong>{{ rector }}</strong>, mayor de edad,
  identificado(a) con C.C. N.° <strong>{{ format_id(cc_rector) }}</strong>, actuando en
  calidad de Rector(a) y Ordenador del Gasto de
  {{ inst_art }}
  <strong>{{ inst_nombre }}</strong>,
  NIT <strong>{{ format_id(inst_nit) }}</strong>, con domicilio en {{ inst_dir }},
  {{ inst_municipio }}, {{ inst_departamento }}, correo electrónico {{ inst_email }},
  quien en adelante se denominará <strong>"EL CONTRATANTE"</strong>; y de otra parte,
  {% if es_empresa and rep_legal_nombre %}
    la empresa <strong>{{ nombre_contratista }}</strong>,
    NIT <strong>{{ format_id(num_id_contratista) }}</strong>,
    representada legalmente por <strong>{{ rep_legal_nombre }}</strong>,
    identificado(a) con C.C. N.° <strong>{{ format_id(rep_legal_cc) }}</strong>,
  {% elif es_empresa %}
    la empresa <strong>{{ nombre_contratista }}</strong>,
    NIT <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% elif sexo_contratista == 'F' %}
    <strong>{{ nombre_contratista }}</strong>, mayor de edad, identificada
    con {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% else %}
    <strong>{{ nombre_contratista }}</strong>, mayor de edad, identificado
    con {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
  {% endif %}
  con domicilio en {{ direccion_contratista }}, {{ municipio_contratista }},
  teléfono {{ celular_contratista }}, correo electrónico {{ email_contratista }},
  quien en adelante se denominará <strong>"EL CONTRATISTA"</strong>, hemos convenido
  en celebrar el presente <strong>CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES
  DE APOYO A LA GESTIÓN CONTABLE</strong>, que se regirá por las siguientes cláusulas y,
  en lo no previsto, por las normas generales del derecho y especialmente por la
  Ley 80 de 1993, la Ley 1150 de 2007, el Decreto 1082 de 2015, el Decreto 4791 de 2008,
  la Resolución 533 de 2015 de la Contaduría General de la Nación y demás normas concordantes:
</p>

<!-- ── CLÁUSULA PRIMERA ───────────────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Primera — Objeto</div>
  <p>
    <strong>EL CONTRATISTA</strong> se obliga para con
    <strong>EL CONTRATANTE</strong> a: <strong>{{ objeto }}</strong>,
    de conformidad con las condiciones técnicas establecidas en el estudio
    previo, la propuesta presentada por el contratista y las instrucciones
    impartidas por el supervisor del contrato, en cumplimiento del Marco Normativo
    para Entidades de Gobierno adoptado mediante Resolución 533 de 2015 de la
    Contaduría General de la Nación y sus modificaciones.
  </p>
</div>

<!-- ── CLÁUSULA SEGUNDA — SERVICIOS INCLUIDOS ─────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Segunda — Servicios Incluidos</div>
  <p>Los servicios objeto del presente contrato comprenden:</p>

  <p class="ct-sub-titulo">A. Contabilidad del FOSE:</p>
  <ol>
    <li>Registro contable de todas las operaciones del FOSE bajo el Marco Normativo para Entidades de Gobierno (CGN): ingresos, gastos, activos, pasivos y patrimonio.</li>
    <li>Aplicación del Plan de Cuentas para Entidades de Gobierno (Catálogo General de Cuentas — CGN).</li>
    <li>Registro y control de los activos fijos de la institución (propiedad, planta y equipo) con aplicación de depreciaciones según normativa CGN.</li>
    <li>Conciliaciones bancarias mensuales de las cuentas del FOSE.</li>
    <li>Control y registro de los fondos rotatorios o cajas menores cuando existan.</li>
    <li>Archivo y custodia digital de los soportes contables.</li>
  </ol>

  <p class="ct-sub-titulo">B. Estados Financieros:</p>
  <ol start="7">
    <li>Elaboración periódica del Estado de Situación Financiera (Balance General).</li>
    <li>Estado de Resultados del Período (Estado de Actividad Financiera, Económica, Social y Ambiental).</li>
    <li>Estado de Cambios en el Patrimonio.</li>
    <li>Estado de Flujos de Efectivo.</li>
    <li>Notas a los estados financieros conforme a la normativa CGN.</li>
  </ol>

  <p class="ct-sub-titulo">C. Reportes al CHIP y Entes de Control:</p>
  <ol start="12">
    <li>Captura y envío de información contable al sistema CHIP (Consolidador de Hacienda e Información Pública) en los plazos fijados por la CGN.</li>
    <li>Elaboración y presentación de los informes contables periódicos a la Secretaría de Educación Departamental o Municipal.</li>
    <li>Atención de requerimientos de la Contraloría General de la República, Contraloría Departamental o Municipal, Personería y demás entes de control.</li>
    <li>Apoyo en la preparación de la rendición de cuentas ante los entes de control fiscal.</li>
  </ol>

  <p class="ct-sub-titulo">D. Gestión Presupuestal del FOSE:</p>
  <ol start="16">
    <li>Elaboración y seguimiento del Presupuesto de Ingresos y Gastos del FOSE, conforme al Decreto 4791 de 2008.</li>
    <li>Registro de las operaciones presupuestales: disponibilidades, registros, compromisos y obligaciones.</li>
    <li>Elaboración del Plan Anual de Adquisiciones (Plan de Compras) del FOSE.</li>
    <li>Elaboración de los informes de ejecución presupuestal mensual y anual.</li>
    <li>Apoyo en el cierre presupuestal y contable de fin de año fiscal.</li>
  </ol>

  <p class="ct-sub-titulo">E. Nómina y Seguridad Social (si aplica):</p>
  <ol start="21">
    <li>Liquidación mensual de la nómina del personal pagado con recursos del FOSE (servicios generales, vigilancia u otros cargos financiados con FOSE).</li>
    <li>Elaboración de planillas de seguridad social y parafiscales.</li>
  </ol>

  <p class="ct-sub-titulo">F. Otros Servicios:</p>
  <ol start="23">
    <li>Asesoría en materia contractual y presupuestal del FOSE conforme al Decreto 4791 de 2008.</li>
    <li>Acompañamiento en auditorías internas o externas relacionadas con el FOSE.</li>
    <li>Los demás servicios que las partes acuerden mediante otrosí.</li>
  </ol>

  <p class="ct-paragrafo"><strong>PARÁGRAFO:</strong> Los servicios de los literales E y F se prestarán únicamente si las partes lo acuerdan expresamente. Los literales A, B, C y D son parte integral del contrato.</p>
</div>

<!-- ── CLÁUSULA TERCERA — PROFESIONAL ASIGNADO ───────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Tercera — Ejecución del Servicio mediante Profesional Asignado</div>
  <p>
    <strong>EL CONTRATISTA</strong> prestará los servicios pactados a través de un contador público asignado internamente con conocimiento y experiencia en contabilidad pública y normativa CGN. Dicho profesional actuará en nombre, bajo la dirección y en representación exclusiva de <strong>EL CONTRATISTA</strong>, siendo la empresa la única responsable del servicio frente a <strong>EL CONTRATANTE</strong>.
  </p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO:</strong> La identidad del profesional asignado podrá ser informada a <strong>EL CONTRATANTE</strong> a título de referencia. Sin embargo, toda comunicación, instrucción o acuerdo sobre el servicio deberá canalizarse a través de <strong>EL CONTRATISTA</strong>. El profesional asignado no tendrá relación contractual, laboral ni comercial directa con <strong>EL CONTRATANTE</strong>.</p>
</div>

<!-- ── CLÁUSULA CUARTA — SUSTITUCIÓN DEL PROFESIONAL ─────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Cuarta — Sustitución del Profesional Asignado</div>
  <p>
    <strong>EL CONTRATISTA</strong> se reserva el derecho de sustituir en cualquier momento al profesional asignado, siempre que el nuevo profesional cuente con las mismas calidades técnicas, profesionales y con conocimiento en contabilidad pública y normativa CGN. El cambio de profesional no constituirá incumplimiento del contrato, siempre que se garantice la continuidad y calidad del servicio.
  </p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO:</strong> <strong>EL CONTRATISTA</strong> notificará a <strong>EL CONTRATANTE</strong> cualquier cambio de profesional con cinco (5) días hábiles de anticipación, salvo en casos de fuerza mayor o retiro intempestivo, en cuyo caso la sustitución podrá ser inmediata.</p>
</div>

<!-- ── CLÁUSULA QUINTA — PROHIBICIÓN CONTRATACIÓN DIRECTA ────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Quinta — Prohibición de Contratación Directa del Profesional Asignado</div>
  <p>
    <strong>EL CONTRATANTE</strong> se obliga a no contratar directa ni indirectamente, bajo ninguna modalidad, al profesional que <strong>EL CONTRATISTA</strong> le asigne, ni durante la vigencia del contrato ni dentro de los dos (2) años siguientes a su terminación.
  </p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO — CLÁUSULA PENAL:</strong> El incumplimiento de esta prohibición generará a favor de <strong>EL CONTRATISTA</strong> una pena convencional equivalente a doce (12) mensualidades del valor del presente contrato, sin perjuicio de las demás acciones legales que procedan.</p>
</div>

<!-- ── CLÁUSULA SEXTA — OBLIGACIONES DEL CONTRATANTE ─────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Sexta — Obligaciones de EL CONTRATANTE</div>
  <p><strong>EL CONTRATANTE</strong> se obliga a:</p>
  <ol>
    <li>Suministrar oportunamente a <strong>EL CONTRATISTA</strong> todos los soportes contables, extractos bancarios, facturas, contratos, actos administrativos y demás documentos necesarios para el registro contable del FOSE.</li>
    <li>Entregar los soportes con suficiente anticipación a las fechas de cierre y presentación de informes ante el CHIP y los entes de control.</li>
    <li>Pagar los honorarios en los plazos y condiciones pactadas.</li>
    <li>Informar oportunamente a <strong>EL CONTRATISTA</strong> sobre requerimientos de entes de control, auditorías o visitas fiscales relacionadas con la contabilidad del FOSE.</li>
    <li>Garantizar acceso al sistema contable y a las plataformas institucionales requeridas para la prestación del servicio (CHIP, sistema de gestión institucional, entre otros).</li>
    <li>Autorizar al profesional asignado por <strong>EL CONTRATISTA</strong> para el ingreso a las instalaciones y sistemas de <strong>EL CONTRATANTE</strong> en los horarios acordados.</li>
    <li>Cumplir la prohibición de contratación directa del profesional asignado, conforme a la cláusula quinta.</li>
    <li>Proveer la firma del Rector(a) y del ordenador del gasto en los documentos contables y presupuestales que así lo requieran, dentro de los plazos establecidos.</li>
  </ol>
</div>

<!-- ── CLÁUSULA SÉPTIMA — OBLIGACIONES DEL CONTRATISTA ────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Séptima — Obligaciones de EL CONTRATISTA</div>
  <p><strong>EL CONTRATISTA</strong> se obliga a:</p>
  <ol>
    <li>Prestar los servicios con idoneidad, diligencia y estricto cumplimiento del Marco Normativo para Entidades de Gobierno y demás normas aplicables al FOSE.</li>
    <li>Entregar los estados financieros, informes de ejecución presupuestal y demás reportes en los plazos acordados con <strong>EL CONTRATANTE</strong> y dentro de los términos exigidos por la CGN, la Secretaría de Educación y los entes de control.</li>
    <li>Asegurar la correcta y oportuna transmisión de la información al sistema CHIP.</li>
    <li>Asignar un profesional con conocimiento y experiencia en contabilidad pública sector educativo y garantizar su sustitución en caso necesario.</li>
    <li>Mantener estricta confidencialidad sobre la información financiera, presupuestal y contable de <strong>EL CONTRATANTE</strong>.</li>
    <li>Informar oportunamente a <strong>EL CONTRATANTE</strong> sobre cambios normativos de la CGN, la Secretaría de Educación o entes de control que afecten el manejo contable del FOSE.</li>
    <li>Responder por errores u omisiones en el servicio que sean directamente imputables a <strong>EL CONTRATISTA</strong>, siempre que <strong>EL CONTRATANTE</strong> haya entregado la información completa y oportuna.</li>
  </ol>
</div>

<!-- ── CLÁUSULA OCTAVA — DURACIÓN ────────────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Octava — Duración</div>
  <p>
    El presente contrato tendrá una duración de
    <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>, contados a partir de
    la suscripción del acta de inicio, prorrogable de mutuo acuerdo mediante comunicación escrita con al menos quince (15) días de antelación a su vencimiento.
  </p>
  <p>
    <strong>Fecha estimada de inicio:</strong> {{ fecha_inicio_larga }}&nbsp;&nbsp;
    <strong>Fecha estimada de terminación:</strong> {{ fecha_fin_larga }}
  </p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO:</strong> En caso de que el contrato finalice antes del cierre contable y presupuestal del año fiscal en curso, <strong>EL CONTRATISTA</strong> se obliga a entregar a <strong>EL CONTRATANTE</strong> todos los archivos, registros contables, claves de acceso al CHIP y demás documentación en su poder, dentro de los diez (10) días hábiles siguientes a la terminación.</p>
</div>

<!-- ── CLÁUSULA NOVENA — VALOR Y FORMA DE PAGO ───────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Novena — Valor y Forma de Pago</div>
  <p>
    El valor total del presente contrato es la suma de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), con cargo al rubro
    presupuestal <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    fuente <strong>{{ fuente }} — {{ fuente_nombre }}</strong>, amparado en el CDP N.°
    <strong>{{ num_cdp }}</strong> expedido el
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
  {% set fp = forma_pago or 'Pagos mensuales' %}
  <p>
    <strong>EL CONTRATANTE</strong> pagará a <strong>EL CONTRATISTA</strong>
    {% if fp == 'Pagos mensuales' %}
      en <strong>pagos mensuales</strong>, dentro de los primeros diez (10) días hábiles de cada mes, previa presentación de la factura de venta y del informe de actividades del mes anterior.
    {% elif fp == 'Pagos bimestrales' %}
      en <strong>pagos bimestrales</strong>, dentro de los veinte (20) días hábiles siguientes al vencimiento de cada bimestre de ejecución, previa presentación de la factura de venta y del informe de actividades.
    {% elif fp == 'Pagos trimestrales' %}
      en <strong>pagos trimestrales</strong>, dentro de los veinte (20) días hábiles siguientes al vencimiento de cada trimestre, previa presentación de la factura de venta y del informe de actividades.
    {% else %}
      en un <strong>único pago</strong>, dentro de los quince (15) días hábiles siguientes a la terminación del contrato, previa presentación de la factura de venta y del informe final de actividades.
    {% endif %}
  </p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO PRIMERO:</strong> El pago está sujeto a las disponibilidades presupuestales del FOSE y al cumplimiento del procedimiento de contratación establecido en el Decreto 4791 de 2008 y las directrices de la Secretaría de Educación.</p>
  <p class="ct-paragrafo"><strong>PARÁGRAFO SEGUNDO:</strong> Sobre el valor del contrato se aplicará retención en la fuente a título de renta y de ICA conforme a las tarifas legales vigentes. El pago neto estimado, descontada la retención en la fuente de <strong>{{ format_moneda(retencion) }}</strong>, es de <strong>{{ format_moneda(neto) }}</strong> (<strong>{{ neto_letras }}</strong>).</p>
</div>

<!-- ── CLÁUSULA DÉCIMA — CONFIDENCIALIDAD ────────────────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima — Confidencialidad</div>
  <p>
    Ambas partes se obligan a mantener en estricta reserva toda la información financiera, contable, presupuestal e institucional a la que accedan con ocasión del presente contrato. Esta obligación subsistirá por tres (3) años contados desde la terminación del contrato.
  </p>
</div>

<!-- ── CLÁUSULA DÉCIMA PRIMERA — NATURALEZA DEL CONTRATO ──────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Primera — Naturaleza del Contrato e Independencia</div>
  <p>
    El presente contrato es de naturaleza civil y NO genera relación laboral entre las partes ni entre <strong>EL CONTRATANTE</strong> y el profesional asignado por <strong>EL CONTRATISTA</strong>. <strong>EL CONTRATISTA</strong> es el único responsable de las obligaciones laborales y de seguridad social del personal que asigne para la prestación del servicio.
  </p>
</div>

<!-- ── CLÁUSULA DÉCIMA SEGUNDA — CAUSALES DE TERMINACIÓN ──────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Segunda — Causales de Terminación</div>
  <p>El presente contrato podrá terminarse por:</p>
  <ol>
    <li>Mutuo acuerdo entre las partes.</li>
    <li>Incumplimiento de las obligaciones de cualquiera de las partes, previa notificación escrita con quince (15) días de antelación.</li>
    <li>Mora en el pago de dos (2) o más mensualidades consecutivas.</li>
    <li>Violación de la prohibición de contratación directa del profesional asignado.</li>
    <li>Supresión o liquidación del Fondo de Servicios Educativos por disposición legal o administrativa.</li>
    <li>Vencimiento del plazo sin prórroga.</li>
    <li>Fuerza mayor o caso fortuito debidamente comprobado.</li>
  </ol>
</div>

<!-- ── CLÁUSULA DÉCIMA TERCERA — ENTREGA DE INFORMACIÓN ────────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Tercera — Entrega de Información al Finalizar el Contrato</div>
  <p>
    A la terminación del contrato, por cualquier causa, <strong>EL CONTRATISTA</strong> entregará a <strong>EL CONTRATANTE</strong> en un plazo máximo de diez (10) días hábiles:
  </p>
  <ol>
    <li>Los libros contables del FOSE actualizados a la fecha de terminación (en formato físico y/o digital).</li>
    <li>Los archivos del sistema contable utilizado, incluyendo copias de seguridad.</li>
    <li>Las credenciales y claves de acceso al CHIP y demás plataformas.</li>
    <li>Los soportes físicos y digitales de las operaciones registradas durante la vigencia del contrato.</li>
    <li>Un informe de empalme que permita la continuidad del servicio contable.</li>
  </ol>
</div>

<!-- ── CLÁUSULA DÉCIMA CUARTA — SOLUCIÓN DE CONTROVERSIAS ──────── -->
<div class="ct-clausula">
  <div class="ct-clausula-titulo">Cláusula Décima Cuarta — Solución de Controversias</div>
  <p>
    Las controversias serán resueltas en primera instancia de manera directa entre las partes. De no lograrse acuerdo, se acudirá a los jueces competentes de {{ inst_municipio }}, {{ inst_departamento }}, sin perjuicio de los mecanismos alternativos de solución de conflictos.
  </p>
</div>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="ct-lugar">
  En señal de conformidad y aceptación con el contenido del presente contrato,
  las partes lo suscriben en {{ inst_municipio }}, el {{ fecha_suscripcion_larga }}.
</p>

<!-- ── FIRMAS ─────────────────────────────────────────────────── -->
<div class="ct-firma-section">
  <table class="ct-firma-tabla">
    <tr>
      <td>
        <div class="ct-firma-linea" style="border:none">
          <p class="ct-firma-nombre">{{ rector }}</p>
          <p class="ct-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="ct-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ct-firma-cargo">{{ inst_nombre }}</p>
          <p class="ct-firma-cargo">NIT {{ format_id(inst_nit) }}</p>
          <p class="ct-firma-cargo"><strong>EL CONTRATANTE</strong></p>
        </div>
      </td>
      <td>
        <div class="ct-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ct-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ct-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ct-firma-cargo">Representante Legal</p>
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% elif es_empresa %}
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ct-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ct-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="ct-firma-cargo">Contador(a) Público(a)</p>
            <p class="ct-firma-cargo">T.P. N.° _______________</p>
            <p class="ct-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="ct-firma-cargo"><strong>EL CONTRATISTA</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/egreso.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Comprobante de Egreso — {{ numero }}{% endblock %}
{% block doc_titulo %}COMPROBANTE DE EGRESO{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   COMPROBANTE DE EGRESO  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ce-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Secciones ────────────────────────────────────── */
.ce-section {
  margin: 10px 0 12px;
}
.ce-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ce-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.ce-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.ce-section ol li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Tabla de datos generales ─────────────────────── */
table.ce-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ce-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 22%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ce-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Tablas de datos financieros ──────────────────── */
table.ce-data {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ce-data thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 9px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ce-data tbody td {
  padding: 5px 9px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
table.ce-data tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ce-data tfoot td {
  padding: 6px 9px;
  border: 1.5px solid #bbb;
  background: #eee;
  font-weight: bold;
  font-size: 9.5pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Caja de letras / declaración ─────────────────── */
.ce-letras-box {
  border: 1.5px solid #aaa;
  border-radius: 3px;
  padding: 8px 12px;
  margin: 6px 0 0;
  background: #fff;
  font-size: 9.5pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ce-letras-box p { margin: 3px 0; }

/* ── Declaración de recibo ────────────────────────── */
.ce-declaracion {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 14px;
  margin: 4px 0;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ce-declaracion p { margin: 4px 0; }

/* ── Firma ────────────────────────────────────────── */
.ce-firma-section {
  margin-top: 15px;
}
table.ce-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.ce-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 12px;
  border: none;
  vertical-align: bottom;
}
.ce-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ce-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ce-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

{% set supervisor = nombre_supervisor if nombre_supervisor else rector %}
{% set cargo_sup  = cargo_supervisor  if cargo_supervisor  else 'Rector(a)' %}

<p class="ce-numero">
  Egreso N.° <strong>{{ num_egreso or '—' }}</strong>
  <span style="font-weight:normal; color:#555; font-size:9pt">&nbsp;·&nbsp; Contrato N.° {{ numero }}</span>
</p>

<!-- ── 1. DATOS GENERALES ─────────────────────────────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">1. Datos Generales</div>
  <table class="ce-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Fecha de egreso</th>
      <td>{{ fecha_egreso_larga or fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>N.° de Egreso</th>
      <td><strong>{{ num_egreso or numero }}</strong></td>
      <th>Tipo de contrato</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>
        {% if es_empresa %}Empresa / Beneficiario
        {% elif sexo_contratista == 'F' %}Beneficiaria
        {% else %}Beneficiario{% endif %}
      </th>
      <td colspan="3">
        <strong>{{ nombre_contratista }}</strong>
        {% if es_empresa and rep_legal_nombre %}
          <br><small style="color:#555">Repr. Legal: {{ rep_legal_nombre }}, C.C. {{ format_id(rep_legal_cc) }}</small>
        {% endif %}
      </td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Teléfono</th>
      <td>{{ celular_contratista }}</td>
      <th>Municipio</th>
      <td>{{ municipio_contratista }}</td>
    </tr>
    <tr>
      <th>Concepto</th>
      <td colspan="3">{% if pago_numero %}{{ pago_nota }} — {% endif %}Pago contrato N.° <strong>{{ numero }}</strong> — {{ objeto }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }} &nbsp;·&nbsp; {{ fecha_cdp_larga }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }} &nbsp;·&nbsp; {{ fecha_rp_larga }}</td>
    </tr>
    <tr>
      <th>N.° Factura / Cta. de Cobro</th>
      <td colspan="3">{{ num_factura or '—' }}</td>
    </tr>
    <tr>
      <th>Rubro presupuestal</th>
      <td colspan="3">{{ rubro_codigo }} — {{ rubro_nombre }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. VALORES ─────────────────────────────────────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">2. Valores</div>
  <table class="ce-data">
    <thead>
      <tr>
        <th style="width:65%">Concepto</th>
        <th style="width:35%">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Valor bruto del contrato</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
      </tr>
      {% if valor_iva and valor_iva > 0 %}
      <tr>
        <td style="padding-left:24px; color:#555">Del cual IVA discriminado</td>
        <td style="text-align:right; color:#555">{{ format_moneda(valor_iva) }}</td>
      </tr>
      {% endif %}
      <tr>
        <td>(−) Retención en la Fuente (Cta. {{ ret_cuenta or '236505' }})</td>
        <td style="text-align:right">− {{ format_moneda(retencion) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td><strong>VALOR NETO PAGADO</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(neto) }}</strong></td>
      </tr>
    </tfoot>
  </table>
  <div class="ce-letras-box">
    <p><strong>Valor neto en letras:</strong> {{ neto_letras }}</p>
  </div>
</div>

<!-- ── 3. INFORMACIÓN BANCARIA DEL BENEFICIARIO ───────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">3. Información Bancaria del Beneficiario</div>
  <table class="ce-tabla">
    <tr>
      <th>Banco</th>
      <td>{{ banco_contratista }}</td>
      <th>Tipo de cuenta</th>
      <td>{{ tipo_cuenta }}</td>
    </tr>
    <tr>
      <th>N.° de cuenta</th>
      <td colspan="3"><strong>{{ cuenta_banco }}</strong></td>
    </tr>
    <tr>
      <th>Titular</th>
      <td colspan="3">{{ nombre_contratista }}</td>
    </tr>
    <tr>
      <th>Forma de pago</th>
      <td colspan="3">Transferencia electrónica / ACH</td>
    </tr>
  </table>
</div>

<!-- ── 4. COMPROBANTE CONTABLE ────────────────────────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">4. Comprobante Contable</div>
  <table class="ce-data">
    <thead>
      <tr>
        <th style="width:16%">Código Cuenta</th>
        <th style="width:44%">Nombre de la Cuenta</th>
        <th style="width:20%">DEBE</th>
        <th style="width:20%">HABER</th>
      </tr>
    </thead>
    <tbody>
      <!-- Fila 1: cuenta contable del rubro -->
      <tr>
        <td style="text-align:center">{{ cuenta_contable or rubro_codigo }}</td>
        <td>{{ nombre_cuenta or rubro_nombre }}</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:right"></td>
      </tr>
      <!-- Fila 2: banco institucional seleccionado -->
      <tr>
        <td style="text-align:center">111005</td>
        <td>{{ banco_sel or 'BANCOS — Cuenta Institucional' }}{% if cta_sel %} — Cta. {{ cta_sel }}{% endif %}</td>
        <td style="text-align:right"></td>
        <td style="text-align:right">{{ format_moneda(neto) }}</td>
      </tr>
      <!-- Fila 3: retención en la fuente -->
      <tr>
        <td style="text-align:center">{{ ret_cuenta or '236505' }}</td>
        <td>{{ ret_concepto or 'Retención en la Fuente por Pagar' }}</td>
        <td style="text-align:right"></td>
        <td style="text-align:right">{{ format_moneda(retencion) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right"><strong>TOTALES:</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- ── 5. DOCUMENTOS SOPORTE ─────────────────────────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">5. Documentos Soporte</div>
  <p>Se adjuntan los siguientes documentos soporte:</p>
  <ol>
    <li>Factura o cuenta de cobro del contratista.</li>
    <li>Acta de recibido a satisfacción suscrita por el supervisor.</li>
    <li>Informe de supervisión del contrato N.° {{ numero }}.</li>
    <li>Informe de actividades del contratista.</li>
    <li>CDP N.° {{ num_cdp }} del {{ fecha_cdp_larga }}.</li>
    <li>RP N.° {{ num_rp }} del {{ fecha_rp_larga }}.</li>
    <li>Comprobante de pago de seguridad social (cuando aplique).</li>
    <li>Certificación bancaria del beneficiario.</li>
  </ol>
</div>

<!-- ── 6. DECLARACIÓN ─────────────────────────────────────────── -->
<div class="ce-section">
  <div class="ce-section-titulo">6. Declaración</div>
  <div class="ce-declaracion">
    <p>
      Revisada la documentación soporte y verificado el cumplimiento del objeto
      contractual del contrato N.° <strong>{{ numero }}</strong>,
      {% if es_empresa %}la empresa contratista
      {% elif sexo_contratista == 'F' %}la contratista
      {% else %}el contratista{% endif %}
      <strong>{{ nombre_contratista }}</strong> declara haber recibido
      conforme la suma de <strong>{{ format_moneda(neto) }}</strong>
      ({{ neto_letras }}) mediante transferencia a la cuenta
      <strong>{{ tipo_cuenta }}</strong> N.° <strong>{{ cuenta_banco }}</strong>
      del banco <strong>{{ banco_contratista }}</strong>,
      en calidad de {% if pago_numero %}{{ pago_nota }} del{% else %}pago del{% endif %} contrato referenciado.
    </p>
  </div>
</div>

<!-- ── FIRMAS ─────────────────────────────────────────────────── -->
<div class="ce-firma-section">
  <table class="ce-firma-tabla">
    <tr>
      <!-- Aprobó -->
      <td>
        <div class="ce-firma-linea" style="border:none">
          <p class="ce-firma-nombre">{{ rector }}</p>
          <p class="ce-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="ce-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ce-firma-cargo">{{ inst_nombre }}</p>
          <p class="ce-firma-cargo"><strong>APROBÓ</strong></p>
        </div>
      </td>
      <!-- Recibí conforme -->
      <td>
        <div class="ce-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ce-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ce-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ce-firma-cargo">Representante Legal</p>
            <p class="ce-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ce-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% elif es_empresa %}
            <p class="ce-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ce-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ce-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ce-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
          {% endif %}
          <p class="ce-firma-cargo">Beneficiario(a)</p>
          <p class="ce-firma-cargo"><strong>RECIBÍ CONFORME</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/estudio_previo.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Estudio Previo — {{ numero }}{% endblock %}
{% block doc_titulo %}ESTUDIO PREVIO{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     Estudio Previo — estilos específicos de impresión
     ══════════════════════════════════════════════ */

  /* Subtítulo bajo el encabezado institucional */
  .ep-subtitle {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    color: #333;
    margin: 8px 0 14px;
    letter-spacing: .3px;
  }

  /* Tabla de datos de cabecera (institución / fecha) */
  table.ep-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.ep-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 18%;
    text-align: left;
    white-space: nowrap;
  }
  table.ep-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 32%;
  }

  /* Sección genérica */
  .ep-section {
    margin: 10px 0;
    }
  .ep-section h3 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 6px;
  }
  .ep-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .ep-section ul,
  .ep-section ol {
    font-size: 10pt;
    text-align: justify;
    padding-left: 22px;
    margin: 5px 0;
    line-height: 1.45;
  }
  .ep-section li {
    margin-bottom: 3px;
  }

  /* Tablas de datos dentro de secciones */
  table.ep-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 10px;
    font-size: 9.5pt;
    }
  table.ep-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.ep-table tbody td {
    padding: 4px 7px;
    border: 1px solid #ccc;
    vertical-align: top;
    line-height: 1.35;
  }
  table.ep-table tbody tr:nth-child(even) td {
    background: #f5f5f5;
  }
  table.ep-table tfoot td {
    padding: 5px 7px;
    border: 1px solid #aaa;
    font-weight: bold;
    background: #eee;
  }

  /* Bloque de firmas */
  .ep-firma-section {
    margin-top: 15px;
  }
  .ep-firma-section h3 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 8px;
  }
  .ep-firma-section > p {
    font-size: 10pt;
    text-align: justify;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  .ep-firma-grid {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 8px;
  }
  .ep-firma-block {
    flex: 0 1 45%;
    text-align: center;
  }
  .ep-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .ep-firma-block p {
    font-size: 10pt;
    margin: 2px 0;
  }

  /* Print: evitar cortes en tablas y firmas */
  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla de datos generales -->
<table class="ep-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha Elaboración</th>
    <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- ─────────── SECCIÓN 1 ─────────── -->
<div class="ep-section">
  <h3>1. Modalidad de Selección y Tipo de Contrato</h3>
  <p>
    De conformidad con lo establecido en la Ley 80 de 1993, la Ley 1150 de 2007 y
    el Decreto 1082 de 2015, la presente contratación se adelanta bajo la modalidad
    de <strong>{{ modalidad_seleccion }}</strong>, siendo el tipo de contrato a
    suscribir un <strong>{{ tipo_contrato }}</strong>.
  </p>
  <p>
    La modalidad de selección se justifica en razón a que el valor del contrato no
    supera el monto establecido para procesos de Mínima Cuantía, conforme al
    presupuesto anual de la entidad y los límites fijados por la normativa vigente.
  </p>
</div>

<!-- ─────────── SECCIÓN 2 ─────────── -->
<div class="ep-section">
  <h3>2. Descripción de la Necesidad</h3>
  <p>
    {{ inst_Art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT <strong>{{ format_id(inst_nit) }}</strong>,
    ha identificado la necesidad de contratar lo siguiente, con el fin de garantizar
    el adecuado funcionamiento institucional y el cumplimiento de sus objetivos misionales:
  </p>
  <p><strong>Necesidad identificada:</strong> {{ objeto }}</p>
  <p>
    La satisfacción de esta necesidad resulta indispensable para el normal desarrollo
    de las actividades académicas y administrativas de la institución, conforme a los
    planes y programas institucionales vigentes para la vigencia fiscal correspondiente.
  </p>
</div>

<!-- ─────────── SECCIÓN 3 ─────────── -->
<div class="ep-section">
  <h3>3. Objeto del Contrato y Clasificación UNSPSC</h3>
  <p><strong>Objeto:</strong> {{ objeto }}</p>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:30%">Clasificación UNSPSC</th>
        <th>Descripción del Objeto</th>
      </tr>
    </thead>
    <tbody>
            <tr>
        <td style="text-align:center; font-weight:bold; letter-spacing:0.5px;">
            {{ codigos_unspsc_texto }}
        </td>
        <td>{{ objeto }}</td>
      </tr>
    </tbody>
  </table>
  <p>
    El rubro presupuestal afectado corresponde a
    <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    con fuente de financiación <strong>{{ fuente }} — {{ fuente_nombre }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 4 ─────────── -->
<div class="ep-section">
  <h3>4. Condiciones Técnicas y Especificaciones del Bien o Servicio</h3>
  <p>El bien o servicio requerido deberá cumplir con las siguientes condiciones técnicas mínimas:</p>
  <ul>
    <li>Cumplir estrictamente con el objeto contractual descrito.</li>
    <li>Ser entregado o prestado en el lugar y dentro del plazo acordado.</li>
    <li>Reunir los requisitos de calidad exigidos para este tipo de bien o servicio.</li>
    <li>El contratista deberá acreditar experiencia y capacidad técnica suficiente.</li>
    <li>Atender las instrucciones impartidas por el supervisor del contrato.</li>
  </ul>
</div>

<!-- ─────────── SECCIÓN 5 ─────────── -->
<div class="ep-section">
  <h3>5. Obligaciones del Contratista</h3>
  {% if obligaciones and obligaciones.strip() %}
    {% for linea in obligaciones.split('\\n') %}
      {% if linea.strip() %}<p>{{ linea.strip() }}</p>{% endif %}
    {% endfor %}
  {% else %}
  <ul>
    <li>Ejecutar el objeto del contrato en las condiciones de tiempo, modo y lugar pactadas.</li>
    <li>Cumplir con las especificaciones técnicas requeridas.</li>
    <li>Presentar los informes y soportes que requiera el supervisor.</li>
    <li>Guardar confidencialidad sobre la información institucional.</li>
    <li>No ceder el contrato sin previa autorización escrita de la entidad.</li>
    <li>Afiliarse y mantener al día el pago de aportes al Sistema General de Seguridad Social.</li>
  </ul>
  {% endif %}
</div>

<!-- ─────────── SECCIÓN 6 ─────────── -->
<div class="ep-section">
  <h3>6. Análisis del Sector y Referenciación de Precios de Mercado</h3>
  <p>
    Con el fin de establecer el valor del contrato, se realizó una consulta de precios
    en el mercado. El análisis arrojó como valor de referencia la
    suma de <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), el cual corresponde al valor total del contrato,
    amparado mediante Certificado de Disponibilidad Presupuestal (CDP)
    N.° <strong>{{ num_cdp }}</strong> de fecha <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 7 ─────────── -->
<div class="ep-section">
  <h3>7. Análisis de Riesgos</h3>
  <p>
    A continuación se identifican los principales riesgos asociados al proceso contractual
    y las medidas de mitigación propuestas:
  </p>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:16%">Tipo de Riesgo</th>
        <th style="width:42%">Descripción</th>
        <th style="width:42%">Medidas de Mitigación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Operativo</strong></td>
        <td>Incumplimiento en la entrega o prestación del servicio en los plazos pactados.</td>
        <td>Supervisión continua, actas parciales de avance, aplicación de cláusula penal.</td>
      </tr>
      <tr>
        <td><strong>Financiero</strong></td>
        <td>Insuficiencia de recursos presupuestales para el pago.</td>
        <td>Verificación previa de disponibilidad presupuestal mediante CDP y RP.</td>
      </tr>
      <tr>
        <td><strong>Jurídico</strong></td>
        <td>Inhabilidades o incompatibilidades del contratista.</td>
        <td>Verificación en el SECOP, SIRI y boletines de responsables fiscales.</td>
      </tr>
      <tr>
        <td><strong>Técnico</strong></td>
        <td>Bien o servicio que no cumple con las especificaciones requeridas.</td>
        <td>Supervisión técnica, rechazo y reposición del bien o servicio no conforme.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ─────────── SECCIÓN 8 ─────────── -->
<div class="ep-section">
  <h3>8. Documentación Requerida para el Pago</h3>
  <p>Para el trámite del pago, el contratista deberá presentar:</p>
  <ol>
    <li>Factura o cuenta de cobro a nombre de la institución.</li>
    <li>Certificado de pago de aportes al Sistema General de Seguridad Social (cuando aplique).</li>
    <li>Informe de actividades o acta de recibido a satisfacción suscrita por el supervisor.</li>
    <li>Paz y salvo de obligaciones con la entidad (si aplica).</li>
    <li>Copia del Registro Único Tributario (RUT) actualizado.</li>
    <li>Certificación bancaria vigente.</li>
  </ol>
</div>

<!-- ─────────── SECCIÓN 9 ─────────── -->
<div class="ep-section">
  <h3>9. Justificación de la Contratación</h3>
  <p>
    La presente contratación es conveniente y necesaria para la institución, toda vez
    que permite dar cumplimiento a los objetivos misionales y al plan de mejoramiento
    institucional. La adquisición se encuentra debidamente presupuestada en el rubro
    <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>, con disponibilidad
    certificada mediante CDP N.° <strong>{{ num_cdp }}</strong> del
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 10 ─────────── -->
<div class="ep-section">
  <h3>10. Plazo de Ejecución del Contrato</h3>
  <p>
    El plazo de ejecución del contrato será de <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>,
    contados a partir de la suscripción del acta de inicio.
  </p>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:50%">Concepto</th>
        <th style="width:50%; text-align:center">Detalle</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Duración del Contrato</td>
        <td style="text-align:center"><strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong></td>
      </tr>
      <tr>
        <td>Fecha Estimada de Inicio</td>
        <td style="text-align:center">{{ fecha_inicio_larga if fecha_inicio_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Fecha Estimada de Terminación</td>
        <td style="text-align:center">{{ fecha_fin_larga if fecha_fin_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ─────────── SECCIÓN 11 ─────────── -->
<div class="ep-section">
  <h3>11. Cronograma del Proceso</h3>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:60%">Actividad</th>
        <th style="width:40%; text-align:center">Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Publicación del Estudio Previo e Invitación</td>
        <td style="text-align:center">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Recepción de Ofertas</td>
        <td style="text-align:center">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Evaluación y Selección de Ofertas</td>
        <td style="text-align:center">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Suscripción del Contrato (Registro Presupuestal)</td>
        <td style="text-align:center">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ─────────── FIRMAS ─────────── -->
<div class="ep-firma-section">
  <h3>Aprobación</h3>
  <p>
    El presente Estudio Previo ha sido elaborado y revisado por la
    dependencia competente, y se somete a consideración y aprobación del(la) Rector(a)
    de la institución.
  </p>
  <div class="ep-firma-grid">
    <div class="ep-firma-block">
      <div class="ep-firma-linea" style="border:none">
        <p><strong>{{ rector | upper }}</strong></p>
        <p>C.C. {{ format_id(cc_rector) }}</p>
        <p>Rector(a) — Ordenador del Gasto</p>
        <p>{{ inst_nombre }}</p>
      </div>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/estudio_previo_garantia.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Estudio Previo — Ley Garantías — {{ numero }}{% endblock %}
{% block doc_titulo %}ESTUDIO PREVIO — LEY GARANTÍAS ELECTORALES{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     Estudio Previo Ley Garantías — estilos de impresión
     ══════════════════════════════════════════════ */

  table.ep-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.ep-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 18%;
    text-align: left;
    white-space: nowrap;
  }
  table.ep-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 32%;
  }

  .ep-section {
    margin: 10px 0;
    }
  .ep-section h3 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 6px;
  }
  .ep-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .ep-section ul,
  .ep-section ol {
    font-size: 10pt;
    text-align: justify;
    padding-left: 22px;
    margin: 5px 0;
    line-height: 1.45;
  }
  .ep-section li { margin-bottom: 3px; }

  table.ep-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 10px;
    font-size: 9.5pt;
    }
  table.ep-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.ep-table thead th.center { text-align: center; }
  table.ep-table tbody td {
    padding: 4px 7px;
    border: 1px solid #ccc;
    vertical-align: top;
    line-height: 1.35;
  }
  table.ep-table tbody tr:nth-child(even) td { background: #f5f5f5; }
  table.ep-table tfoot td {
    padding: 5px 7px;
    border: 1px solid #aaa;
    font-weight: bold;
    background: #eee;
  }

  /* Bloque de firmas */
  .ep-firma-section {
    margin-top: 15px;
  }
  .ep-firma-section h3 {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 8px;
  }
  .ep-firma-section > p {
    font-size: 10pt;
    text-align: justify;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  .ep-firma-grid { display: flex; gap: 20px; justify-content: center; margin-top: 8px; }
  .ep-firma-block { flex: 0 1 45%; text-align: center; }
  .ep-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .ep-firma-block p { font-size: 10pt; margin: 2px 0; }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla de datos generales -->
<table class="ep-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha Elaboración</th>
    <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
  </tr>
  <tr>
    <th>CDP de Respaldo</th>
    <td>{{ num_cdp }}</td>
    <th>Fecha CDP</th>
    <td>{{ fecha_cdp_larga }}</td>
  </tr>
</table>

<!-- NECESIDAD PAA -->
<div class="ep-section">
  <h3>Necesidad (Según Línea PAA)</h3>
  <p>
    La presente necesidad se encuentra incluida en el Plan Anual de Adquisiciones (PAA)
    de la vigencia fiscal correspondiente, conforme a la línea de inversión aprobada por
    el Consejo Directivo del Fondo de Servicios Educativos. La adquisición del bien o
    servicio es indispensable para garantizar la continuidad de las actividades misionales
    de la Institución Educativa y responde a los objetivos del Proyecto Educativo
    Institucional (PEI).
  </p>
</div>

<!-- FUNDAMENTOS JURÍDICOS -->
<div class="ep-section">
  <h3>Fundamentos Jurídicos que Sustentan la Convocatoria bajo esta Modalidad</h3>
  <p>
    Son normas aplicables para la modalidad de régimen especial (reglamento de 20 SMLMV,
    dispuesto en artículo 13 de la ley 715 de 2001), las siguientes: 1- Criterios
    específicos del artículo 2.3.1.6.3.17 del decreto 1075 de 2015 que corresponden al
    artículo 17 del decreto 4791 de 2008 y 2- Principios contractuales de la ley 80 de 1993.
  </p>
  <p>
    El monto requerido para atender la necesidad objeto de esta convocatoria no supera 20
    SMLMV, por lo que es aplicable la modalidad de régimen especial para establecimientos
    educativos oficiales, según la cual, las adquisiciones de bienes y servicios que se
    encuentren en el rango indicado se adelantan con observancia de lo dispuesto en el
    Reglamento aprobado por el consejo directivo.
  </p>
  <p>
    En consecuencia, el proceso derivado de este análisis se rige por lo determinado en el
    manual de contratación institucional, subtítulo respectivo a lineamientos del reglamento
    interno.
  </p>
  <p>
    La presente convocatoria reúne los requisitos para un régimen especial con respecto a
    un pliego de condiciones, según lo dispuesto en el numeral 5 del artículo 24 de la
    ley 80 de 1993.
  </p>
</div>

<!-- ─────────── SECCIÓN 1 ─────────── -->
<div class="ep-section">
  <h3>1. Modalidad de Selección y Tipo de Contrato</h3>
  <p>
    De conformidad con el artículo 13 de la Ley 715 de 2001, el Decreto 4791 de 2008 y
    el artículo 2.3.1.6.3.17 del Decreto 1075 de 2015, la presente contratación se adelanta
    bajo la modalidad de <strong>{{ modalidad_seleccion }}</strong> — régimen especial FSE
    (≤ 20 SMLMV), siendo el tipo de contrato a suscribir un <strong>{{ tipo_contrato }}</strong>.
  </p>
  <p>
    La modalidad se justifica porque el valor del contrato no supera el límite de veinte (20)
    Salarios Mínimos Legales Mensuales Vigentes (SMLMV), conforme al presupuesto anual de la
    entidad. El proceso se adelanta durante el período de Ley de Garantías Electorales
    (Ley 996 de 2005), por lo que se aplica la circular vigente de Colombia Compra Eficiente y se garantiza la
    participación de una pluralidad de oferentes con criterios objetivos de evaluación.
  </p>
</div>

<!-- ─────────── SECCIÓN 2 ─────────── -->
<div class="ep-section">
  <h3>2. Descripción de la Necesidad</h3>
  <p>
    {{ inst_Art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT <strong>{{ format_id(inst_nit) }}</strong>,
    ha identificado la necesidad de contratar lo siguiente, con el fin de garantizar
    el adecuado funcionamiento institucional y el cumplimiento de sus objetivos misionales:
  </p>
  <p><strong>Necesidad identificada:</strong> {{ objeto }}</p>
  <p>
    La satisfacción de esta necesidad resulta indispensable para el normal desarrollo de
    las actividades académicas y administrativas de la institución, conforme a los planes
    y programas institucionales vigentes para la vigencia fiscal correspondiente.
  </p>
</div>

<!-- ─────────── SECCIÓN 3 ─────────── -->
<div class="ep-section">
  <h3>3. Objeto del Contrato y Clasificación UNSPSC</h3>
  <p><strong>Objeto:</strong> {{ objeto }}</p>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:30%">Clasificación UNSPSC</th>
        <th>Descripción del Objeto</th>
      </tr>
    </thead>
    <tbody>
            <tr>
        <td style="text-align:center; font-weight:bold; letter-spacing:0.5px;">
            {{ codigos_unspsc_texto }}
        </td>
        <td>{{ objeto }}</td>
      </tr>
    </tbody>
  </table>
  <p>
    El rubro presupuestal afectado corresponde a
    <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    con fuente de financiación <strong>{{ fuente }} — {{ fuente_nombre }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 4 ─────────── -->
<div class="ep-section">
  <h3>4. Condiciones Técnicas y Especificaciones del Bien o Servicio</h3>
  <p>El bien o servicio requerido deberá cumplir con las siguientes condiciones técnicas mínimas:</p>
  <ul>
    <li>Cumplir estrictamente con el objeto contractual descrito.</li>
    <li>Ser entregado o prestado en el lugar y dentro del plazo acordado.</li>
    <li>Reunir los requisitos de calidad exigidos para este tipo de bien o servicio.</li>
    <li>El contratista deberá acreditar experiencia y capacidad técnica suficiente.</li>
    <li>Atender las instrucciones impartidas por el supervisor del contrato.</li>
  </ul>
</div>

<!-- ─────────── SECCIÓN 5 ─────────── -->
<div class="ep-section">
  <h3>5. Obligaciones del Contratista</h3>
  {% if obligaciones and obligaciones.strip() %}
    {% for linea in obligaciones.split('\\n') %}
      {% if linea.strip() %}<p>{{ linea.strip() }}</p>{% endif %}
    {% endfor %}
  {% else %}
  <ul>
    <li>Ejecutar el objeto del contrato en las condiciones de tiempo, modo y lugar pactadas.</li>
    <li>Cumplir con las especificaciones técnicas requeridas.</li>
    <li>Presentar los informes y soportes que requiera el supervisor.</li>
    <li>Guardar confidencialidad sobre la información institucional.</li>
    <li>No ceder el contrato sin previa autorización escrita de la entidad.</li>
    <li>Afiliarse y mantener al día el pago de aportes al Sistema General de Seguridad Social.</li>
  </ul>
  {% endif %}
</div>

<!-- ─────────── SECCIÓN 6 ─────────── -->
<div class="ep-section">
  <h3>6. Análisis del Sector y Referenciación de Precios de Mercado</h3>
  <p>
    Con el fin de establecer el valor del contrato, se realizó una consulta de precios en
    el mercado. El análisis arrojó como valor de referencia la suma de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), el cual corresponde al valor total del contrato,
    amparado mediante Certificado de Disponibilidad Presupuestal (CDP)
    N.° <strong>{{ num_cdp }}</strong> de fecha <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 7 ─────────── -->
<div class="ep-section">
  <h3>7. Análisis de Riesgos</h3>
  <p>
    A continuación se identifican los principales riesgos asociados al proceso contractual
    y las medidas de mitigación propuestas:
  </p>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:16%">Tipo de Riesgo</th>
        <th style="width:42%">Descripción</th>
        <th style="width:42%">Medidas de Mitigación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Operativo</strong></td>
        <td>Incumplimiento en la entrega o prestación del servicio en los plazos pactados.</td>
        <td>Supervisión continua, actas parciales de avance, aplicación de cláusula penal.</td>
      </tr>
      <tr>
        <td><strong>Financiero</strong></td>
        <td>Insuficiencia de recursos presupuestales para el pago.</td>
        <td>Verificación previa de disponibilidad presupuestal mediante CDP y RP.</td>
      </tr>
      <tr>
        <td><strong>Jurídico</strong></td>
        <td>Inhabilidades o incompatibilidades del contratista.</td>
        <td>Verificación en el SECOP, SIRI y boletines de responsables fiscales.</td>
      </tr>
      <tr>
        <td><strong>Técnico</strong></td>
        <td>Bien o servicio que no cumple con las especificaciones requeridas.</td>
        <td>Supervisión técnica, rechazo y reposición del bien o servicio no conforme.</td>
      </tr>
      <tr>
        <td><strong>Electoral</strong></td>
        <td>Cuestionamiento del proceso por adelantarse en período de Ley de Garantías.</td>
        <td>Invitación general, pluralidad de oferentes, publicación en SECOP y aplicación
            del Concepto del Consejo de Estado Exp. 2.382/2018 y la circular vigente de Colombia Compra Eficiente.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ─────────── SECCIÓN 8 ─────────── -->
<div class="ep-section">
  <h3>8. Documentación Requerida para el Pago</h3>
  <p>Para el trámite del pago, el contratista deberá presentar:</p>
  <ol>
    <li>Factura o cuenta de cobro a nombre de la institución.</li>
    <li>Certificado de pago de aportes al Sistema General de Seguridad Social (cuando aplique).</li>
    <li>Informe de actividades o acta de recibido a satisfacción suscrita por el supervisor.</li>
    <li>Paz y salvo de obligaciones con la entidad (si aplica).</li>
    <li>Copia del Registro Único Tributario (RUT) actualizado.</li>
    <li>Certificación bancaria vigente.</li>
  </ol>
</div>

<!-- ─────────── SECCIÓN 9 ─────────── -->
<div class="ep-section">
  <h3>9. Justificación de la Contratación</h3>
  <p>
    La presente contratación es conveniente y necesaria para la institución, toda vez que
    permite dar cumplimiento a los objetivos misionales y al plan de mejoramiento
    institucional. La adquisición se encuentra debidamente presupuestada en el rubro
    <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>, con disponibilidad
    certificada mediante CDP N.° <strong>{{ num_cdp }}</strong> del
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- ─────────── SECCIÓN 10 ─────────── -->
<div class="ep-section">
  <h3>10. Cronograma del Proceso</h3>
  <table class="ep-table">
    <thead>
      <tr>
        <th style="width:60%">Actividad</th>
        <th class="center" style="width:40%">Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Publicación del Estudio Previo e Invitación</td>
        <td style="text-align:center">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Recepción de Ofertas</td>
        <td style="text-align:center">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Evaluación y Selección de Ofertas</td>
        <td style="text-align:center">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Suscripción del Contrato (Registro Presupuestal)</td>
        <td style="text-align:center">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ─────────── SECCIÓN 11 ─────────── -->
<div class="ep-section">
  <h3>11. Observaciones Legales — Ley de Garantías Electorales</h3>
  <p>
    El presente procedimiento se rige por las normas propias del Fondo de Servicios
    Educativos, conforme al Decreto 4791 de 2008 y al Manual Interno de Contratación
    de la Institución Educativa.
  </p>
  <p>
    <strong>CUMPLIMIENTO DE LA LEY DE GARANTÍAS ELECTORALES:</strong> El presente proceso
    se adelanta dentro del período de restricción electoral previsto en la Ley 996 de 2005
    y sus reglamentaciones vigentes para el período electoral correspondiente. La presente convocatoria es de
    carácter <strong>GENERAL</strong>, no dirigida a proveedor específico, y permite la
    participación de una <strong>PLURALIDAD DE OFERENTES</strong> con criterios objetivos
    de evaluación. En consecuencia, conforme al Concepto del
    Consejo de Estado, Sala de Consulta y Servicio Civil, Exp. 2.382/2018, y la circular
    vigente que Colombia Compra Eficiente expida para cada período electoral, este proceso
    <strong>NO</strong> constituye 'contratación directa' en los términos del artículo 33
    de la Ley de Garantías, y puede adelantarse válidamente durante el período electoral.
  </p>
  <p>
    La información contractual será publicada en el SECOP con fines de transparencia y
    trazabilidad del proceso.
  </p>
</div>

<!-- ─────────── SECCIÓN 12 ─────────── -->
<div class="ep-section">
  <h3>12. Fundamento Legal</h3>
  <ul>
    <li>Ley 80 de 1993 — Estatuto General de Contratación Pública.</li>
    <li>Ley 715 de 2001 — Art. 13: Régimen especial establecimientos educativos.</li>
    <li>Ley 996 de 2005 — Ley de Garantías Electorales.</li>
    <li>Decreto 4791 de 2008 — Manual de Contratación del Fondo de Servicios Educativos.</li>
    <li>Decreto 1082 de 2015 — Decreto Único Reglamentario.</li>
    <li>Decreto 1075 de 2015 — Art. 2.3.1.6.3.17: Criterios de contratación FSE.</li>
    <li>Ley 1474 de 2011 — Estatuto Anticorrupción.</li>
    <li>Circular vigente de Colombia Compra Eficiente — Lineamientos contratación en período electoral.</li>
    <li>Concepto Consejo de Estado, Sala de Consulta y Servicio Civil, Exp. 2.382/2018.</li>
  </ul>
</div>

<!-- COMPROMISO DE TRANSPARENCIA -->
<div class="ep-section">
  <h3>Compromiso de Transparencia, Buenas Prácticas y Medidas Anticorrupción</h3>
  <p>
    La Institución Educativa, en cumplimiento de la Ley 1474 de 2011 (Estatuto
    Anticorrupción) y demás normas concordantes, se compromete a adelantar el presente
    proceso contractual con sujeción a los principios de transparencia, responsabilidad,
    selección objetiva y moralidad administrativa. Se invita a los participantes a denunciar
    cualquier acto de corrupción ante los organismos de control competentes. Se promueve el
    ejercicio de veedurías ciudadanas conforme a la Ley 850 de 2003.
  </p>
</div>

<!-- ─────────── FIRMAS ─────────── -->
<div class="ep-firma-section">
  <h3>Aprobación</h3>
  <p>
    El presente Estudio Previo ha sido elaborado y revisado por la dependencia competente,
    y se somete a consideración y aprobación del(la) Rector(a) de la institución.
  </p>
  <div class="ep-firma-grid">
    <div class="ep-firma-block">
      <div class="ep-firma-linea" style="border:none">
        <p><strong>{{ rector | upper }}</strong></p>
        <p>C.C. {{ format_id(cc_rector) }}</p>
        <p>Rector(a) — Ordenador del Gasto</p>
        <p>{{ inst_nombre }}</p>
      </div>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/evaluacion.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Evaluación de Oferta — {{ numero }}{% endblock %}
{% block doc_titulo %}EVALUACIÓN DE OFERTA{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   EVALUACIÓN DE OFERTA  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Tabla cabecera institucional ─────────────────── */
table.ev-info {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 14px;
  font-size: 9.5pt;
}
table.ev-info th {
  background: #f0f0f0;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #999;
  width: 19%;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-info td {
  padding: 5px 9px;
  border: 1.5px solid #999;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Secciones numeradas ──────────────────────────── */
.ev-section {
  margin: 12px 0 16px;
}
.ev-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ev-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.ev-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.ev-section ol li {
  margin-bottom: 5px;
  text-align: justify;
}

/* ── Tablas de evaluación ─────────────────────────── */
table.ev-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 8px;
  font-size: 9pt;
}
table.ev-table thead th {
  background: #eee;
  color: #000;
  padding: 6px 8px;
  text-align: center;
  font-weight: bold;
  border: 1.5px solid #999;
  line-height: 1.35;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-table thead th.left {
  text-align: left;
}
table.ev-table tbody td {
  padding: 5px 8px;
  border: 1px solid #bbb;
  vertical-align: middle;
  font-size: 9pt;
  line-height: 1.35;
}
table.ev-table tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-table tfoot td {
  padding: 6px 8px;
  border: 1.5px solid #999;
  font-weight: bold;
  background: #eee;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Fila del proponente seleccionado ─────────────── */
tr.ev-fila-sel td {
  background: #e0e0e0 !important;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
td.ev-seleccion {
  color: #000;
  font-weight: bold;
  text-align: center;
  font-size: 8.5pt;
}
td.ev-item {
  text-align: center;
  font-weight: bold;
  color: #333;
}
td.ev-valor {
  text-align: right;
}
td.ev-valor small {
  display: block;
  font-size: 7.5pt;
  color: #555;
  font-style: italic;
  margin-top: 2px;
  text-align: left;
  line-height: 1.3;
}
td.ev-hora {
  text-align: center;
  white-space: nowrap;
}
td.ev-fecha {
  text-align: center;
  font-size: 8.5pt;
}

/* ── Bloque NOTA de cotizaciones ─────────────────── */
.ev-nota {
  background: #fff;
  border: 1px solid #bbb;
  border-left: 4px solid #333;
  padding: 9px 13px;
  margin: 8px 0 4px;
  font-size: 9.5pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ev-nota p { margin: 4px 0; text-align: justify; }
.ev-cumple-txt  { color: #000; font-weight: bold; }
.ev-nocumple-txt{ color: #000; font-weight: bold; text-decoration: underline; }

/* ── Caja de recomendación ────────────────────────── */
.ev-recomendacion {
  margin: 9px 0 4px;
  padding: 10px 14px;
  border: 2px solid #333;
  border-radius: 3px;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Firmas (tabla para compatibilidad print) ─────── */
.ev-firma-section {
  margin-top: 15px;
}
table.ev-firma-tabla {
  width: 82%;
  margin: 0 auto;
  border-collapse: collapse;
  border: none;
}
table.ev-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 24px;
  border: none;
  vertical-align: bottom;
}
.ev-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ev-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ev-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<!-- ── ENCABEZADO INSTITUCIONAL ─────────────────────────────── -->
<table class="ev-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha Evaluación</th>
    <td colspan="3">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- ── 1. PROPUESTAS RECIBIDAS / EVALUACIÓN ECONÓMICA ───────── -->
<div class="ev-section">
  <div class="ev-section-titulo">1. Propuestas Recibidas y Evaluación Económica</div>
  <p>
    En el marco del proceso de <strong>{{ modalidad_seleccion }}</strong> se recibieron
    las siguientes propuestas económicas, evaluadas con base en el criterio de
    <strong>menor precio que cumpla los requisitos habilitantes</strong>,
    conforme a lo establecido en la invitación a cotizar:
  </p>

  <table class="ev-table">
    <colgroup>
      <col style="width:5%">
      <col style="width:28%">
      <col style="width:20%">
      <col style="width:11%">
      <col style="width:27%">
      <col style="width:9%">
    </colgroup>
    <thead>
      <tr>
        <th>Ítem</th>
        <th class="left">Proponente</th>
        <th>Fecha de Presentación</th>
        <th>Hora</th>
        <th>Valor de la Propuesta</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      {{ eval_filas_html }}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right">Valor oferta seleccionada:</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- ── 2. VERIFICACIÓN DE REQUISITOS HABILITANTES ───────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">2. Verificación de Requisitos Habilitantes</div>
  <p>
    Revisada la documentación aportada por los proponentes participantes en el proceso,
    se verificó el cumplimiento de los requisitos jurídicos, técnicos y económicos exigidos
    en la invitación pública. Los resultados de dicha verificación se presentan a
    continuación:
  </p>

  <div class="ev-nota">
    <p>{{ eval_nota_html }}</p>
    {{ eval_verificacion_html }}
  </div>
</div>

<!-- ── 3. ANÁLISIS Y RECOMENDACIÓN ──────────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">3. Análisis y Recomendación</div>
  <p>Efectuada la evaluación de las propuestas recibidas, se concluye lo siguiente:</p>
  <ol>
    <li>
      {% if es_empresa %}La empresa proponente
      {% elif sexo_contratista == 'F' %}La proponente
      {% else %}El proponente{% endif %}
      <strong>{{ nombre_contratista }}</strong>,
      {{ tipo_id_contratista }} N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
      presentó la propuesta de menor valor dentro del presupuesto oficial establecido y
      cumplió con la totalidad de los requisitos habilitantes exigidos en la invitación.
    </li>
    <li>
      El valor propuesto de <strong>{{ format_moneda(valor_total) }}</strong>
      (<em>{{ valor_letras }}</em>) se ajusta al presupuesto oficial y resulta razonable
      conforme al estudio previo de mercado.
    </li>
    <li>
      No se presentaron observaciones ni impedimentos que afecten la selección del proponente.
    </li>
  </ol>

  <div class="ev-recomendacion">
    En consecuencia, se <strong>RECOMIENDA</strong> a la Rectoría de
    {{ inst_art }}
    <strong>{{ inst_nombre }}</strong> proceder a la
    <strong>ACEPTACIÓN DE LA OFERTA</strong> presentada por
    <strong>{{ nombre_contratista }}</strong>, por la suma de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<em>{{ valor_letras }}</em>), para la ejecución del objeto:
    <em>{{ objeto }}</em>.
  </div>
</div>

<!-- ── 4. OBSERVACIONES ──────────────────────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">4. Observaciones</div>
  <p>
    El presente informe de evaluación queda disponible para consulta de los interesados,
    en cumplimiento de los principios de transparencia y publicidad que rigen la
    contratación estatal en Colombia.
  </p>
</div>

<!-- ── 5. PUBLICACIÓN ─────────────────────────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">5. Publicación</div>
  <p>
    La presente evaluación se publicará en el portal del SECOP II.
  </p>
</div>

<!-- ── FIRMAS ────────────────────────────────────────────────── -->
<div class="ev-firma-section">
  <table class="ev-firma-tabla">
    <tr>
      <td>
        <div class="ev-firma-linea" style="border:none">
          <p class="ev-firma-nombre">{{ rector }}</p>
          <p class="ev-firma-cargo">CC N.° {{ format_id(cc_rector) }}</p>
          <p class="ev-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ev-firma-cargo">{{ inst_nombre }}</p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/evaluacion_garantia.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Evaluación de Oferta Ley de Garantías — {{ numero }}{% endblock %}
{% block doc_titulo %}EVALUACIÓN DE OFERTA LEY DE GARANTÍAS{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   EVALUACIÓN DE OFERTA LEY DE GARANTÍAS  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Tabla cabecera institucional ─────────────────── */
table.ev-info {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 14px;
  font-size: 9.5pt;
}
table.ev-info th {
  background: #f0f0f0;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #999;
  width: 19%;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-info td {
  padding: 5px 9px;
  border: 1.5px solid #999;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Secciones numeradas ──────────────────────────── */
.ev-section {
  margin: 12px 0 16px;
}
.ev-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ev-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.ev-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.ev-section ol li {
  margin-bottom: 5px;
  text-align: justify;
}

/* ── Tablas de evaluación ─────────────────────────── */
table.ev-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 8px;
  font-size: 9pt;
}
table.ev-table thead th {
  background: #eee;
  color: #000;
  padding: 6px 8px;
  text-align: center;
  font-weight: bold;
  border: 1.5px solid #999;
  line-height: 1.35;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-table thead th.left {
  text-align: left;
}
table.ev-table tbody td {
  padding: 5px 8px;
  border: 1px solid #bbb;
  vertical-align: middle;
  font-size: 9pt;
  line-height: 1.35;
}
table.ev-table tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ev-table tfoot td {
  padding: 6px 8px;
  border: 1.5px solid #999;
  font-weight: bold;
  background: #eee;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Fila del proponente seleccionado ─────────────── */
tr.ev-fila-sel td {
  background: #e0e0e0 !important;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
td.ev-seleccion {
  color: #000;
  font-weight: bold;
  text-align: center;
  font-size: 8.5pt;
}
td.ev-item {
  text-align: center;
  font-weight: bold;
  color: #333;
}
td.ev-valor {
  text-align: right;
}
td.ev-valor small {
  display: block;
  font-size: 7.5pt;
  color: #555;
  font-style: italic;
  margin-top: 2px;
  text-align: left;
  line-height: 1.3;
}
td.ev-hora {
  text-align: center;
  white-space: nowrap;
}
td.ev-fecha {
  text-align: center;
  font-size: 8.5pt;
}

/* ── Bloque NOTA de cotizaciones ─────────────────── */
.ev-nota {
  background: #fff;
  border: 1px solid #bbb;
  border-left: 4px solid #333;
  padding: 9px 13px;
  margin: 8px 0 4px;
  font-size: 9.5pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ev-nota p { margin: 4px 0; text-align: justify; }
.ev-cumple-txt  { color: #000; font-weight: bold; }
.ev-nocumple-txt{ color: #000; font-weight: bold; text-decoration: underline; }

/* ── Caja de recomendación ────────────────────────── */
.ev-recomendacion {
  margin: 9px 0 4px;
  padding: 10px 14px;
  border: 2px solid #333;
  border-radius: 3px;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Firmas (tabla para compatibilidad print) ─────── */
.ev-firma-section {
  margin-top: 15px;
}
table.ev-firma-tabla {
  width: 82%;
  margin: 0 auto;
  border-collapse: collapse;
  border: none;
}
table.ev-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 24px;
  border: none;
  vertical-align: bottom;
}
.ev-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ev-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ev-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<!-- ── ENCABEZADO INSTITUCIONAL ─────────────────────────────── -->
<table class="ev-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha Evaluación</th>
    <td colspan="3">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- ── 1. PROPUESTAS RECIBIDAS / EVALUACIÓN ECONÓMICA ───────── -->
<div class="ev-section">
  <div class="ev-section-titulo">1. Propuestas Recibidas y Evaluación Económica</div>
  <p>
    En el marco del proceso de <strong>{{ modalidad_seleccion }}</strong>, en aplicación de la
    <strong>Ley de Garantías Electorales</strong>, se recibieron las siguientes propuestas
    económicas, evaluadas con base en los principios de
    <strong>transparencia, selección objetiva e igualdad de oportunidades</strong>,
    verificando el cumplimiento de los requisitos habilitantes conforme a lo establecido
    en la invitación a cotizar:
  </p>

  <table class="ev-table">
    <colgroup>
      <col style="width:5%">
      <col style="width:28%">
      <col style="width:20%">
      <col style="width:11%">
      <col style="width:27%">
      <col style="width:9%">
    </colgroup>
    <thead>
      <tr>
        <th>Ítem</th>
        <th class="left">Proponente</th>
        <th>Fecha de Presentación</th>
        <th>Hora</th>
        <th>Valor de la Propuesta</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      {{ eval_filas_html }}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right">Valor oferta seleccionada:</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- ── 2. VERIFICACIÓN DE REQUISITOS HABILITANTES ───────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">2. Verificación de Requisitos Habilitantes</div>
  <p>
    Revisada la documentación aportada por los proponentes participantes en el proceso,
    se verificó el cumplimiento de los requisitos jurídicos, técnicos y económicos exigidos
    en la invitación pública. Los resultados de dicha verificación se presentan a
    continuación:
  </p>

  <div class="ev-nota">
    <p>{{ eval_nota_html }}</p>
    {{ eval_verificacion_html }}
  </div>
</div>

<!-- ── 3. CRITERIO Y METODOLOGÍA DE EVALUACIÓN ───────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">3. Criterio y Metodología de Evaluación</div>
  <p>
    La evaluación se realizó conforme a los principios de planeación, transparencia,
    economía y selección objetiva, aplicables al Fondo de Servicios Educativos, bajo
    el procedimiento especial de contratación hasta 20 SMLMV, de conformidad con el
    <strong>Decreto 4791 de 2008</strong> y el Manual Interno de Contratación de la
    Institución Educativa.
  </p>
  <p>La metodología de evaluación se fundamentó en:</p>
  <ul style="font-size:9.5pt; margin:4px 0; padding-left:20px; line-height:1.6;">
    <li>Verificación del cumplimiento de los requisitos habilitantes.</li>
    <li>Análisis técnico del ajuste de la oferta a las especificaciones definidas.</li>
    <li>Verificación del valor ofertado frente al presupuesto oficial estimado.</li>
  </ul>
</div>

<!-- ── 4. CONCLUSIONES DE LA EVALUACIÓN ──────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">4. Conclusiones de la Evaluación</div>

  <p>
    Una vez revisadas las propuestas, se evidenció que todos los proponentes presentaron
    ofertas por el mismo valor. No obstante,
    {% if es_empresa %}la empresa
    {% elif sexo_contratista == 'F' %}la proponente
    {% else %}el proponente{% endif %}:
    <strong>{{ nombre_contratista }}</strong>,
    {% if es_empresa and rep_legal_nombre %}
      con NIT N.° <strong>{{ format_id(num_id_contratista) }}</strong>,
      representada legalmente por <strong>{{ rep_legal_nombre }}</strong>,
      CC N.° <strong>{{ format_id(rep_legal_cc) }}</strong>,
    {% else %}
      con documento de identidad {{ tipo_id_contratista }} N.°
      <strong>{{ format_id(num_id_contratista) }}</strong>,
    {% endif %}
    fue quien cumplió con la totalidad de los requisitos jurídicos, técnicos y documentales
    exigidos en la invitación, por lo cual se recomienda su selección por un valor de
    <strong>{{ format_moneda(valor_total) }}</strong>
    ({{ valor_letras }}).
  </p>

  <p>
    La presente evaluación se realiza el
    <strong>{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else hoy_largo }}</strong>,
    fecha que se encuentra dentro del período de aplicación de la
    <strong>Ley 996 de 2005 (Ley de Garantías Electorales)</strong>, vigente para el
    período electoral correspondiente a la vigencia {{ anio }}.
  </p>

  <p>
    Con fundamento en la <strong>circular vigente expedida por Colombia Compra Eficiente
    para el respectivo período electoral</strong>, y el Concepto del Consejo de Estado,
    Sala de Consulta y Servicio Civil, Exp. 2.382 del 8 de mayo de 2018, el procedimiento
    de selección utilizado <strong>NO constituye 'contratación directa'</strong> en los
    términos del artículo 33 de dicha Ley, por cuanto incluyó: (i) convocatoria pública
    de carácter <strong>GENERAL</strong>, no dirigida a proveedor específico; y
    (ii) apertura a la participación de una <strong>PLURALIDAD DE OFERENTES</strong>,
    con criterios objetivos de evaluación técnica y económica, conforme al procedimiento
    especial del Fondo de Servicios Educativos establecido en el
    <strong>Decreto 4791 de 2008</strong>.
  </p>
</div>

<!-- ── 5. CONSIDERACIONES LEY DE GARANTÍAS ELECTORALES ──────── -->
<div class="ev-section">
  <div class="ev-section-titulo">5. Consideraciones Sobre Ley de Garantías Electorales</div>
  <p>
    La presente evaluación se realiza dentro del período de aplicación de la
    <strong>Ley 996 de 2005 (Ley de Garantías Electorales)</strong>, vigente para el
    período electoral correspondiente a la vigencia {{ anio }}.
  </p>
  <p>
    Se verifica que el proceso de selección cumple los siguientes requisitos para no
    constituir <em>'contratación directa'</em> en los términos del artículo 33 de la
    Ley 996/2005:
  </p>
  <ul style="font-size:9.5pt; margin:6px 0; padding-left:20px; line-height:1.7; list-style:none;">
    <li>&#10003; La invitación fue general y pública, no dirigida a proveedor específico.</li>
    <li>&#10003; El proceso permitió la participación de una pluralidad de oferentes.</li>
    <li>&#10003; Se fijaron criterios objetivos: técnico (cumple/no cumple) y económico (menor precio).</li>
    <li>&#10003; Se publicó en SECOP con fines de transparencia y trazabilidad.</li>
  </ul>
</div>

<!-- ── 6. OBSERVACIONES ──────────────────────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">6. Observaciones</div>
  <p>
    El presente informe de evaluación queda disponible para consulta de los interesados,
    en cumplimiento de los principios de transparencia y publicidad que rigen la
    contratación estatal en Colombia, y en observancia de las restricciones establecidas
    por la Ley de Garantías Electorales.
  </p>
</div>

<!-- ── 5. PUBLICACIÓN ─────────────────────────────────────────── -->
<div class="ev-section">
  <div class="ev-section-titulo">7. Publicación</div>
  <p>
    La presente evaluación se publicará en el portal del SECOP II.
  </p>
</div>

<!-- ── FIRMAS ────────────────────────────────────────────────── -->
<div class="ev-firma-section">
  <table class="ev-firma-tabla">
    <tr>
      <td>
        <div class="ev-firma-linea" style="border:none">
          <p class="ev-firma-nombre">{{ rector }}</p>
          <p class="ev-firma-cargo">CC N.° {{ format_id(cc_rector) }}</p>
          <p class="ev-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="ev-firma-cargo">{{ inst_nombre }}</p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/habeas_data.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Autorización Tratamiento de Datos — {{ numero }}{% endblock %}
{% block doc_titulo %}AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   HABEAS DATA  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Subtítulo legal ──────────────────────────────── */
.hd-subtitulo {
  text-align: center;
  font-size: 9pt;
  color: #444;
  margin: -6px 0 14px;
  font-style: italic;
}

/* ── Secciones ────────────────────────────────────── */
.hd-section {
  margin: 12px 0 14px;
}
.hd-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.hd-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.hd-section ul,
.hd-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.hd-section ul li,
.hd-section ol li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Tablas de datos ──────────────────────────────── */
table.hd-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0 10px;
  font-size: 9.5pt;
}
table.hd-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  width: 22%;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.hd-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Caja de Autorización ─────────────────────────── */
.hd-autorizacion {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 12px 16px;
  margin: 12px 0 6px;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.hd-autorizacion p { margin: 5px 0; }

/* ── Firma ────────────────────────────────────────── */
.hd-firma-section {
  margin-top: 15px;
}
table.hd-firma-tabla {
  width: 50%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.hd-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
}
.hd-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.hd-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.hd-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="hd-subtitulo">(Habeas Data — Ley 1581 de 2012) &nbsp;·&nbsp; Contrato N.° {{ numero }}</p>

<!-- ── 1. FUNDAMENTO LEGAL ───────────────────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">1. Fundamento Legal</div>
  <p>
    De conformidad con lo establecido en la <strong>Ley Estatutaria 1581 de 2012</strong>
    (Ley de Protección de Datos Personales) y su decreto reglamentario
    <strong>Decreto 1377 de 2013</strong>, {{ inst_art }} <strong>{{ inst_nombre }}</strong>,
    NIT <strong>{{ format_id(inst_nit) }}</strong>, en calidad de responsable del tratamiento
    de datos personales, informa y solicita al titular la siguiente autorización.
  </p>
</div>

<!-- ── 2. DATOS DE LA INSTITUCIÓN ───────────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">2. Datos de la Institución Responsable del Tratamiento</div>
  <table class="hd-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>NIT</td>
      <th>Número</th>
      <td>{{ format_id(inst_nit) }}</td>
    </tr>
    <tr>
      <th>Municipio</th>
      <td colspan="3">{{ inst_municipio }}, {{ inst_departamento }}</td>
    </tr>
    <tr>
      <th>Dirección</th>
      <td>{{ inst_dir }}</td>
      <th>Correo electrónico</th>
      <td>{{ inst_email }}</td>
    </tr>
    <tr>
      <th>Representante Legal</th>
      <td colspan="3">{{ rector }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>C.C.</td>
      <th>Número</th>
      <td>{{ format_id(cc_rector) }}</td>
    </tr>
  </table>
</div>

<!-- ── 3. DATOS DEL TITULAR ─────────────────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">3. Datos del Titular</div>
  <table class="hd-tabla">
    <tr>
      <th>Nombre completo</th>
      <td colspan="3">{{ nombre_contratista }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    {% if es_empresa and rep_legal_nombre %}
    <tr>
      <th>Representante Legal</th>
      <td colspan="3">{{ rep_legal_nombre }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>C.C.</td>
      <th>Número</th>
      <td>{{ format_id(rep_legal_cc) }}</td>
    </tr>
    {% endif %}
    <tr>
      <th>Dirección</th>
      <td>{{ direccion_contratista }}</td>
      <th>Municipio</th>
      <td>{{ municipio_contratista }}</td>
    </tr>
    <tr>
      <th>Teléfono / Celular</th>
      <td>{{ celular_contratista }}</td>
      <th>Correo electrónico</th>
      <td>{{ email_contratista }}</td>
    </tr>
  </table>
</div>

<!-- ── 4. DATOS OBJETO DE TRATAMIENTO ───────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">4. Datos Personales Objeto de Tratamiento</div>
  <p>Los datos personales que serán objeto de tratamiento incluyen:</p>
  <ul>
    <li>Datos de identificación: nombre, documento de identidad, RUT.</li>
    <li>Datos de contacto: dirección, teléfono, correo electrónico.</li>
    <li>Datos financieros: información bancaria, cuenta de pago.</li>
    <li>Datos contractuales: contrato suscrito, objeto, valor, fechas de ejecución.</li>
    <li>Datos de seguridad social: afiliación y pago de aportes (cuando aplique).</li>
    <li>Datos de experiencia y capacidad: certificaciones, hoja de vida (cuando aplique).</li>
  </ul>
</div>

<!-- ── 5. FINALIDADES DEL TRATAMIENTO ───────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">5. Finalidades del Tratamiento</div>
  <p>
    Los datos personales del titular serán utilizados exclusivamente para las
    siguientes finalidades:
  </p>
  <ol>
    <li>
      Gestión, ejecución, seguimiento y liquidación del contrato N.°
      <strong>{{ numero }}</strong>.
    </li>
    <li>
      Cumplimiento de obligaciones legales, fiscales, contables y
      administrativas derivadas de la relación contractual.
    </li>
    <li>
      Reporte a organismos de control y vigilancia (Contraloría, Superintendencias,
      SECOP, etc.) cuando sea requerido por la ley.
    </li>
    <li>
      Trámite de pagos, retenciones y demás gestiones financieras relacionadas
      con el contrato.
    </li>
    <li>
      Archivo y conservación de la documentación contractual conforme a las
      tablas de retención documental de la institución.
    </li>
    <li>
      Verificación de inhabilidades, incompatibilidades y antecedentes del
      contratista ante las bases de datos públicas habilitadas para tal fin.
    </li>
  </ol>
</div>

<!-- ── 6. DERECHOS DEL TITULAR ──────────────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">6. Derechos del Titular</div>
  <p>
    De conformidad con la Ley 1581 de 2012, el titular de los datos personales
    tiene los siguientes derechos:
  </p>
  <ul>
    <li><strong>Conocer</strong> los datos personales que la institución tiene sobre él.</li>
    <li><strong>Actualizar</strong> sus datos cuando estos sean inexactos o incompletos.</li>
    <li><strong>Rectificar</strong> la información que sea incorrecta.</li>
    <li>
      <strong>Solicitar prueba</strong> de la autorización otorgada para el
      tratamiento de sus datos.
    </li>
    <li>
      <strong>Revocar la autorización</strong> y/o solicitar la supresión de
      sus datos, salvo cuando exista un deber legal de conservarlos.
    </li>
    <li>
      <strong>Presentar quejas</strong> ante la Superintendencia de Industria
      y Comercio por infracción a la Ley 1581 de 2012.
    </li>
  </ul>
  <p>
    Para ejercer sus derechos, el titular podrá dirigirse al correo electrónico
    <strong>{{ inst_email }}</strong> o a la dirección
    <strong>{{ inst_dir }}, {{ inst_municipio }}</strong>.
  </p>
</div>

<!-- ── 7. TRANSFERENCIA Y TRANSMISIÓN ───────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">7. Transferencia y Transmisión de Datos</div>
  <p>
    Los datos personales del titular podrán ser compartidos con entidades
    del Estado, organismos de control, entidades financieras y demás
    destinatarios que la ley exija, únicamente en el marco de las obligaciones
    legales de la institución y con las garantías de seguridad requeridas.
    No se realizará transferencia internacional de datos.
  </p>
</div>

<!-- ── 8. AUTORIZACIÓN ──────────────────────────────────────── -->
<div class="hd-section">
  <div class="hd-section-titulo">8. Autorización</div>
  <div class="hd-autorizacion">
    <p>
      {{ habeas_autorizacion_html }}
      mediante la suscripción del presente documento, de manera libre, previa,
      expresa, informada e inequívoca, <strong>AUTORIZO</strong> a
      {{ inst_art }}
      <strong>{{ inst_nombre }}</strong>, NIT {{ format_id(inst_nit) }}, para recolectar,
      almacenar, usar, circular y suprimir mis datos personales con las
      finalidades descritas en el presente documento y de conformidad con la
      Ley 1581 de 2012 y el Decreto 1377 de 2013.
    </p>
    <p>
      Declaro que he sido informado(a) sobre mis derechos como titular de datos
      personales y que la presente autorización es otorgada de manera voluntaria.
    </p>
  </div>
</div>

<!-- ── FIRMA ─────────────────────────────────────────────────── -->
<div class="hd-firma-section">
  <table class="hd-firma-tabla">
    <tr>
      <td>
        <div class="hd-firma-linea" style="border:none">
          {{ habeas_firma_html }}
        </div>
      </td>
    </tr>
  </table>
</div>

{{ habeas_constancia_html }}

{% endblock %}
`;

DOC_TEMPLATES["docs/informe_contratista.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Informe de Actividades — {{ numero }}{% endblock %}
{% block doc_titulo %}INFORME DE ACTIVIDADES DEL CONTRATISTA{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   INFORME CONTRATISTA  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.ic-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Secciones ────────────────────────────────────── */
.ic-section {
  margin: 10px 0 12px;
}
.ic-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.ic-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.ic-section ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.ic-section ul li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Tablas de datos ──────────────────────────────── */
table.ic-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ic-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 24%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ic-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Tabla de actividades ─────────────────────────── */
table.ic-actividades {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
  page-break-inside: auto;
}
table.ic-actividades thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 8px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ic-actividades tbody td {
  padding: 5px 8px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9pt;
  line-height: 1.4;
  min-height: 28px;
}
table.ic-actividades tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Tabla de avance ──────────────────────────────── */
table.ic-avance {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.ic-avance thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 9px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ic-avance tbody td {
  padding: 5px 9px;
  border: 1.5px solid #bbb;
  font-size: 9.5pt;
}
table.ic-avance tbody tr:last-child td {
  background: #eee;
  font-weight: bold;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Firma ────────────────────────────────────────── */
.ic-firma-section {
  margin-top: 15px;
}
table.ic-firma-tabla {
  width: 50%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.ic-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
}
.ic-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.ic-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ic-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="ic-numero">Contrato N.° {{ numero }}</p>

<!-- ── 1. IDENTIFICACIÓN DEL CONTRATO ────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">1. Identificación del Contrato</div>
  <table class="ic-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
    </tr>
    <tr>
      <th>Objeto del contrato</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>
        {% if es_empresa %}Empresa contratista
        {% elif sexo_contratista == 'F' %}Contratista
        {% else %}Contratista{% endif %}
      </th>
      <td colspan="3">
        {{ nombre_contratista }}
        {% if es_empresa and rep_legal_nombre %}
          <br><small style="color:#555">Repr. Legal: {{ rep_legal_nombre }}, CC {{ format_id(rep_legal_cc) }}</small>
        {% endif %}
      </td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Valor total del contrato</th>
      <td>{{ format_moneda(valor_total) }}</td>
      <th>Duración</th>
      <td>{{ plazo_valor }} {{ plazo_unidad_texto }}</td>
    </tr>
    <tr>
      <th>Fecha de inicio</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha de terminación</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Supervisor</th>
      <td>{{ nombre_supervisor if nombre_supervisor else rector }}</td>
      <th>Cargo</th>
      <td>{{ cargo_supervisor if cargo_supervisor else 'Rector(a)' }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. PERÍODO DEL INFORME ─────────────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">2. Período del Informe</div>
  <table class="ic-tabla">
    {% if pago_numero %}
    <tr>
      <th>Pago</th>
      <td>{{ pago_nota }}</td>
    </tr>
    <tr>
      <th>Período reportado</th>
      <td>{{ pago_periodo_texto }}</td>
    </tr>
    <tr>
      <th>Fecha de elaboración</th>
      <td>{{ fecha_elaboracion_larga }}</td>
    </tr>
    {% else %}
    <tr>
      <th>Período reportado</th>
      <td>Del {{ fecha_inicio_larga }} al {{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Fecha de elaboración</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    {% endif %}
  </table>
</div>

<!-- ── 3. ACTIVIDADES REALIZADAS ──────────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">3. Actividades Realizadas Durante el Período</div>
  <table class="ic-actividades">
    <thead>
      <tr>
        <th style="width:5%">N.°</th>
        <th style="width:40%">Actividad Realizada</th>
        <th style="width:20%">Fecha</th>
        <th style="width:20%">Producto / Entregable</th>
        <th style="width:15%">Observaciones</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center">1</td>
        <td>{{ objeto }}</td>
        {% if pago_numero %}
        <td style="text-align:center">{{ pago_periodo_desde_larga }}<br>— {{ pago_periodo_hasta_larga }}</td>
        {% else %}
        <td style="text-align:center">{{ fecha_inicio_larga }}<br>— {{ fecha_fin_larga }}</td>
        {% endif %}
        <td>Según objeto contractual</td>
        <td>Ejecutado</td>
      </tr>
      <tr>
        <td style="text-align:center">2</td>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center">3</td>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td style="text-align:center">4</td>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ── 4. AVANCE DE EJECUCIÓN ─────────────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">4. Avance de Ejecución</div>
  {% if pago_numero %}
  <table class="ic-avance">
    <thead>
      <tr>
        <th style="width:50%">Concepto</th>
        <th style="width:30%">Valor</th>
        <th style="width:20%">Porcentaje</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Valor total del contrato</td>
        <td style="text-align:right">{{ format_moneda(valor_contrato) }}</td>
        <td style="text-align:center">100%</td>
      </tr>
      <tr>
        <td>Valor de este pago ({{ pago_nota }})</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:center">{{ Math.round(valor_total * 100 / valor_contrato) }}%</td>
      </tr>
      <tr>
        <td>Acumulado pagado</td>
        <td style="text-align:right">{{ format_moneda(pago_acumulado) }}</td>
        <td style="text-align:center">{{ Math.round(pago_acumulado * 100 / valor_contrato) }}%</td>
      </tr>
      <tr>
        <td>Saldo pendiente de ejecución</td>
        <td style="text-align:right">{{ format_moneda(pago_saldo) }}</td>
        <td style="text-align:center">{{ Math.round(pago_saldo * 100 / valor_contrato) }}%</td>
      </tr>
    </tbody>
  </table>
  {% else %}
  <table class="ic-avance">
    <thead>
      <tr>
        <th style="width:50%">Concepto</th>
        <th style="width:30%">Valor</th>
        <th style="width:20%">Porcentaje</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Valor total del contrato</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:center">100%</td>
      </tr>
      <tr>
        <td>Valor ejecutado en el período</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:center">100%</td>
      </tr>
      <tr>
        <td>Saldo pendiente de ejecución</td>
        <td style="text-align:right">{{ format_moneda(0) }}</td>
        <td style="text-align:center">0%</td>
      </tr>
    </tbody>
  </table>
  {% endif %}
</div>

<!-- ── 5. DIFICULTADES Y NOVEDADES ───────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">5. Dificultades y Novedades</div>
  <p>
    Durante el período reportado no se presentaron dificultades ni novedades
    que afectaran el normal desarrollo del objeto contractual. Las actividades
    se ejecutaron conforme a lo planeado y en los plazos establecidos.
  </p>
</div>

<!-- ── 6. CONCLUSIONES ───────────────────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">6. Conclusiones</div>
  <p>
    {% if es_empresa %}
      La empresa contratista informa
    {% elif sexo_contratista == 'F' %}
      La suscrita contratista informa
    {% else %}
      El suscrito contratista informa
    {% endif %}
    que las obligaciones y actividades correspondientes al período reportado
    han sido ejecutadas a cabalidad, en cumplimiento del objeto del contrato
    N.° <strong>{{ numero }}</strong> y de las instrucciones impartidas por el
    supervisor designado.
  </p>
  {% if pago_numero %}
  <p>
    El presente informe corresponde al <strong>{{ pago_nota }}</strong>,
    por un valor de <strong>{{ format_moneda(valor_total) }}</strong>,
    conforme a la forma de pago establecida en el contrato ({{ forma_pago }}).
  </p>
  {% else %}
  <p>
    El objeto contractual ha sido cumplido en su totalidad, dentro del plazo
    establecido y con los estándares de calidad requeridos por la institución,
    por lo que se solicita al supervisor la suscripción del acta de recibido
    a satisfacción correspondiente.
  </p>
  {% endif %}
</div>

<!-- ── 7. DOCUMENTOS ADJUNTOS ────────────────────────────────── -->
<div class="ic-section">
  <div class="ic-section-titulo">7. Documentos Adjuntos</div>
  <ul>
    <li>Soportes y evidencias de las actividades realizadas.</li>
    <li>Registros fotográficos o materiales producidos (cuando aplique).</li>
    <li>Comprobante de pago de seguridad social (cuando aplique).</li>
    <li>Factura o cuenta de cobro.</li>
  </ul>
</div>

<!-- ── FIRMA ──────────────────────────────────────────────────── -->
<div class="ic-firma-section">
  <table class="ic-firma-tabla">
    <tr>
      <td>
        <div class="ic-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="ic-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="ic-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="ic-firma-cargo">Representante Legal</p>
            <p class="ic-firma-cargo">{{ nombre_contratista }}</p>
            <p class="ic-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="ic-firma-nombre">{{ nombre_contratista }}</p>
            <p class="ic-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
          {% endif %}
          <p class="ic-firma-cargo">Contrato N.° {{ numero }}</p>
          <p class="ic-firma-cargo"><strong>EL CONTRATISTA</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/informe_supervisor.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Informe de Supervisión — {{ numero }}{% endblock %}
{% block doc_titulo %}INFORME DE SUPERVISIÓN DEL CONTRATO{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   INFORME SUPERVISOR  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.is-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 10px;
  letter-spacing: 0.5px;
}

/* ── Secciones ────────────────────────────────────── */
.is-section {
  margin: 6px 0 8px;
}
.is-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.is-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.is-section ul {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.is-section ul li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Tabla de datos ───────────────────────────────── */
table.is-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.is-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 24%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.is-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Tablas de seguimiento ────────────────────────── */
table.is-data {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
}
table.is-data thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 8px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.is-data tbody td {
  padding: 5px 8px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9pt;
  line-height: 1.4;
}
table.is-data tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.is-data tfoot td {
  padding: 5px 8px;
  border: 1.5px solid #bbb;
  background: #eee;
  font-weight: bold;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Estados CUMPLE / NO CUMPLE ───────────────────── */
.is-cumple {
  text-align: center;
  font-weight: bold;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.is-no-cumple {
  text-align: center;
  font-weight: bold;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.is-completado {
  text-align: center;
  font-weight: bold;
  color: #333;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Caja de concepto ─────────────────────────────── */
.is-concepto {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 14px;
  margin: 4px 0;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.is-concepto p { margin: 4px 0; }

/* ── Firma ────────────────────────────────────────── */
.is-firma-section {
  margin-top: 15px;
}
table.is-firma-tabla {
  width: 50%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.is-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
}
.is-firma-linea {
  border-top: none;
  padding-top: 4px;
  margin-top: 10px;
}
.is-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.is-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

{% set supervisor = nombre_supervisor if nombre_supervisor else rector %}
{% set cargo_sup  = cargo_supervisor  if cargo_supervisor  else 'Rector(a)' %}

<p class="is-numero">Contrato N.° {{ numero }}</p>

<!-- ── 1. IDENTIFICACIÓN DEL CONTRATO ────────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">1. Identificación del Contrato</div>
  <table class="is-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
    </tr>
    <tr>
      <th>Tipo de contrato</th>
      <td>{{ tipo_contrato }}</td>
      <th>Modalidad</th>
      <td>{{ modalidad_seleccion }}</td>
    </tr>
    <tr>
      <th>Objeto</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>
        {% if es_empresa %}Empresa contratista
        {% elif sexo_contratista == 'F' %}Contratista
        {% else %}Contratista{% endif %}
      </th>
      <td colspan="3">
        {{ nombre_contratista }}
        {% if es_empresa and rep_legal_nombre %}
          <br><small style="color:#555">Repr. Legal: {{ rep_legal_nombre }}, CC {{ format_id(rep_legal_cc) }}</small>
        {% endif %}
      </td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Valor total</th>
      <td>{{ format_moneda(valor_total) }}</td>
      <th>Duración</th>
      <td>{{ plazo_valor }} {{ plazo_unidad_texto }}</td>
    </tr>
    <tr>
      <th>Fecha de inicio</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha de terminación</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }}</td>
    </tr>
    <tr>
      <th>Supervisor</th>
      <td>{{ supervisor }}</td>
      <th>Cargo</th>
      <td>{{ cargo_sup }}</td>
    </tr>
    {% if pago_numero %}
    <tr>
      <th>Pago</th>
      <td>{{ pago_nota }}</td>
      <th>Fecha del informe</th>
      <td>{{ fecha_elaboracion_larga }}</td>
    </tr>
    <tr>
      <th>Período supervisado</th>
      <td colspan="3">{{ pago_periodo_texto }}</td>
    </tr>
    {% else %}
    <tr>
      <th>Fecha del informe</th>
      <td colspan="3">{{ fecha_fin_larga }}</td>
    </tr>
    {% endif %}
  </table>
</div>

<!-- ── 2. SEGUIMIENTO FINANCIERO ──────────────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">2. Seguimiento Financiero</div>
  {% if pago_numero %}
  <table class="is-data">
    <thead>
      <tr>
        <th style="width:36%">Concepto</th>
        <th style="width:16%">Valor Contrato</th>
        <th style="width:16%">Este Pago</th>
        <th style="width:16%">Acumulado</th>
        <th style="width:16%">Saldo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ objeto }}</td>
        <td style="text-align:right">{{ format_moneda(valor_contrato) }}</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:right">{{ format_moneda(pago_acumulado) }}</td>
        <td style="text-align:right">{{ format_moneda(pago_saldo) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td><strong>% AVANCE</strong></td>
        <td style="text-align:center"><strong>100%</strong></td>
        <td style="text-align:center"><strong>{{ Math.round(valor_total * 100 / valor_contrato) }}%</strong></td>
        <td style="text-align:center"><strong>{{ Math.round(pago_acumulado * 100 / valor_contrato) }}%</strong></td>
        <td style="text-align:center"><strong>{{ Math.round(pago_saldo * 100 / valor_contrato) }}%</strong></td>
      </tr>
    </tfoot>
  </table>
  {% else %}
  <table class="is-data">
    <thead>
      <tr>
        <th style="width:36%">Concepto</th>
        <th style="width:16%">Valor Pactado</th>
        <th style="width:16%">Valor Ejecutado</th>
        <th style="width:16%">Valor Pendiente</th>
        <th style="width:16%">% Avance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ objeto }}</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:right">{{ format_moneda(0) }}</td>
        <td style="text-align:center"><strong>100%</strong></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td><strong>TOTAL</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(0) }}</strong></td>
        <td style="text-align:center"><strong>100%</strong></td>
      </tr>
    </tfoot>
  </table>
  {% endif %}
</div>

<!-- ── 3. VERIFICACIÓN DE CUMPLIMIENTO ───────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">3. Verificación de Cumplimiento Contractual</div>
  <table class="is-data">
    <thead>
      <tr>
        <th style="width:55%">Obligación / Condición</th>
        <th style="width:15%">Estado</th>
        <th style="width:30%">Observación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cumplimiento del objeto contractual</td>
        <td class="is-cumple">CUMPLE</td>
        <td>El objeto fue ejecutado satisfactoriamente.</td>
      </tr>
      <tr>
        <td>Cumplimiento del plazo de ejecución</td>
        <td class="is-cumple">CUMPLE</td>
        <td>Entregado dentro del plazo pactado.</td>
      </tr>
      <tr>
        <td>Calidad técnica de los bienes / servicios</td>
        <td class="is-cumple">CUMPLE</td>
        <td>Los entregables cumplen las especificaciones requeridas.</td>
      </tr>
      <tr>
        <td>Pago de aportes a Seguridad Social (si aplica)</td>
        <td class="is-cumple">CUMPLE</td>
        <td>Aportes verificados y al día.</td>
      </tr>
      <tr>
        <td>Presentación de informes requeridos</td>
        <td class="is-cumple">CUMPLE</td>
        <td>Informe del contratista presentado y verificado.</td>
      </tr>
      <tr>
        <td>Prohibición de cesión del contrato</td>
        <td class="is-cumple">CUMPLE</td>
        <td>No se evidenció cesión no autorizada.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ── 4. SEGUIMIENTO AL PLAN DE TRABAJO ─────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">4. Seguimiento al Plan de Trabajo</div>
  <table class="is-data">
    <thead>
      <tr>
        <th style="width:36%">Actividad</th>
        <th style="width:22%">Fecha Programada</th>
        <th style="width:22%">Fecha Real</th>
        <th style="width:20%">Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ objeto }}</td>
        {% if pago_numero %}
        <td style="text-align:center">{{ pago_periodo_desde_larga }}<br>— {{ pago_periodo_hasta_larga }}</td>
        <td style="text-align:center">{{ pago_periodo_desde_larga }}<br>— {{ pago_periodo_hasta_larga }}</td>
        {% else %}
        <td style="text-align:center">{{ fecha_inicio_larga }}<br>— {{ fecha_fin_larga }}</td>
        <td style="text-align:center">{{ fecha_inicio_larga }}<br>— {{ fecha_fin_larga }}</td>
        {% endif %}
        <td class="is-completado">COMPLETADO</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ── 5. OBSERVACIONES DEL SUPERVISOR ───────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">5. Observaciones del Supervisor</div>
  <p>
    El suscrito supervisor, una vez verificado el cumplimiento del objeto
    contractual, los informes presentados por
    {% if es_empresa %}la empresa contratista
    {% elif sexo_contratista == 'F' %}la contratista
    {% else %}el contratista{% endif %}
    y los documentos soporte correspondientes, conceptúa favorablemente sobre
    la ejecución del contrato N.° <strong>{{ numero }}</strong> y recomienda:
  </p>
  <ul>
    {% if pago_numero %}
    <li>Proceder al trámite de la orden de pago correspondiente al <strong>{{ pago_nota }}</strong>, por valor de <strong>{{ format_moneda(valor_total) }}</strong>.</li>
    {% else %}
    <li>Proceder al trámite de la orden de pago correspondiente, toda vez que el objeto contractual fue ejecutado a satisfacción.</li>
    <li>Suscribir el acta de recibido a satisfacción y la liquidación del contrato.</li>
    {% endif %}
  </ul>
</div>

<!-- ── 6. CONCEPTO DEL SUPERVISOR ────────────────────────────── -->
<div class="is-section">
  <div class="is-section-titulo">6. Concepto del Supervisor</div>
  <div class="is-concepto">
    <p>
      El supervisor <strong>AVALA</strong> el pago a
      {% if es_empresa %}la empresa contratista
      {% elif sexo_contratista == 'F' %}la contratista
      {% else %}el contratista{% endif %}
      <strong>{{ nombre_contratista }}</strong>,
      {% if pago_numero %}
      por la suma de <strong>{{ format_moneda(valor_total) }}</strong>
      (<strong>{{ valor_letras }}</strong>), correspondiente al <strong>{{ pago_nota }}</strong>,
      conforme a la forma de pago establecida ({{ forma_pago }}) en el
      contrato N.° <strong>{{ numero }}</strong>.
      {% else %}
      por la suma de <strong>{{ format_moneda(valor_total) }}</strong>
      (<strong>{{ valor_letras }}</strong>), toda vez que el objeto contractual
      fue ejecutado a satisfacción conforme a las condiciones pactadas en el
      contrato N.° <strong>{{ numero }}</strong>.
      {% endif %}
    </p>
    <p>
      El valor neto a pagar, descontada la retención en la fuente de
      <strong>{{ format_moneda(retencion) }}</strong>, es de
      <strong>{{ format_moneda(neto) }}</strong>
      (<strong>{{ neto_letras }}</strong>).
    </p>
  </div>
</div>

<!-- ── FIRMA ──────────────────────────────────────────────────── -->
<div class="is-firma-section">
  <table class="is-firma-tabla">
    <tr>
      <td>
        <div class="is-firma-linea" style="border:none">
          <p class="is-firma-nombre">{{ rector }}</p>
          <p class="is-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="is-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="is-firma-cargo">{{ inst_nombre }}</p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/invitacion.html"] = `{% extends "docs/base_doc.html" %}
{% block doc_title %}Invitación a Cotizar – {{ numero }}{% endblock %}
{% block doc_titulo %}INVITACIÓN A COTIZAR{% endblock %}

{% block extra_css %}
<style>
  .inv-tabla { width:100%; border-collapse:collapse; margin-bottom:12px; font-size:10pt; }
  .inv-tabla td, .inv-tabla th { padding:4px 8px; border:1px solid #adadad; }
  .inv-tabla th { background:#f0f0f0; font-weight:bold; width:22%; }
  .inv-hdr-verde th { background:#eee; color:#000; font-weight:bold; border:1px solid #999; }
  .inv-fila-alt { background:#f8fdf7; }
  .inv-seccion { background:#eee; font-weight:bold; padding:3px 8px; margin:14px 0 6px 0; border-left:4px solid #333; font-size:10pt; }
  .inv-parrafo { text-align:justify; margin:6px 0; font-size:10.5pt; }
  .inv-num { text-align:center; }
  .inv-firma { text-align:center; margin-top:15px; }
  .inv-firma-linea { border-top:none; width:260px; margin:10px auto 4px auto; padding-top:4px; }
  ul.inv-list { margin:6px 0 6px 24px; }
  ul.inv-list li { margin:2px 0; font-size:10.5pt; }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla de identificación de la institución -->
<table class="inv-tabla">
  <tbody>
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Municipio</th>
      <td>{{ inst_municipio }}, {{ inst_departamento or 'Bolívar' }}</td>
    </tr>
    <tr>
      <th>Fecha</th>
      <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
    </tr>
  </tbody>
</table>

<!-- Destinatario -->
<p class="inv-parrafo"><strong>Señor(a):</strong></p>
<p class="inv-parrafo"><strong>{{ nombre_contratista }}</strong></p>
<p class="inv-parrafo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
<p class="inv-parrafo">{{ municipio_contratista }}</p>

<p class="inv-parrafo"><strong>Asunto:</strong> Invitación a presentar cotización para proceso de Mínima Cuantía – Contratación hasta veinte (20) Salarios Mínimos Legales Mensuales Vigentes (SMLMV), conforme al artículo 2.2.1.2.1.5.2 del Decreto 1082 de 2015.</p>

<p class="inv-parrafo">Apreciado(a) señor(a):</p>
<p class="inv-parrafo">
  {{ inst_Art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT <strong>{{ format_id(inst_nit) }}</strong>,
  con domicilio en {{ inst_dir }}, {{ inst_municipio }}, {{ inst_departamento or 'Bolívar' }},
  en uso de las facultades que le confiere la ley, lo(a) invita respetuosamente a presentar
  cotización para la contratación que se describe a continuación.
</p>

<!-- 1. OBJETO -->
<div class="inv-seccion">1. OBJETO DEL CONTRATO</div>
<p class="inv-parrafo">{{ objeto }}</p>

<!-- 2. CLASIFICACIÓN UNSPSC -->
<div class="inv-seccion">2. CLASIFICACIÓN UNSPSC</div>
<table class="inv-tabla">
  <thead>
    <tr class="inv-hdr-verde">
      <th style="width:30%">Código UNSPSC</th>
      <th>Descripción del Bien / Servicio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="inv-num"><strong>{{ codigos_unspsc_texto }}</strong></td>
      <td>{{ objeto }}</td>
    </tr>
  </tbody>
</table>

<!-- 3. PRESUPUESTO OFICIAL -->
<div class="inv-seccion">3. PRESUPUESTO OFICIAL</div>
<p class="inv-parrafo">
  El presupuesto oficial estimado para la presente contratación es de
  <strong>{{ format_moneda(valor_total) }}</strong>
  (<strong>{{ valor_letras }}</strong>), IVA incluido si aplica,
  correspondiente al rubro presupuestal <strong>{{ rubro_codigo }} – {{ rubro_nombre }}</strong>,
  con CDP N.° <strong>{{ num_cdp }}</strong> expedido el <strong>{{ fecha_cdp_larga }}</strong>.
</p>

<!-- 4. PLAZO DE EJECUCIÓN -->
<div class="inv-seccion">4. PLAZO DE EJECUCIÓN</div>
<p class="inv-parrafo">
  El plazo de ejecución será de <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>,
  contados a partir de la suscripción del acta de inicio, previo cumplimiento de los
  requisitos de perfeccionamiento y ejecución del contrato.
</p>
<p class="inv-parrafo">
  <strong>Fecha estimada de inicio:</strong> {{ fecha_inicio_larga }}
  &nbsp;&nbsp;&nbsp;
  <strong>Fecha estimada de terminación:</strong> {{ fecha_fin_larga }}
</p>

<!-- 5. CRONOGRAMA DEL PROCESO -->
<div class="inv-seccion">5. CRONOGRAMA DEL PROCESO</div>
<table class="inv-tabla">
  <thead>
    <tr class="inv-hdr-verde">
      <th>Actividad</th>
      <th style="width:38%;text-align:center">Fecha</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Publicación del Estudio Previo e Invitación</td>
      <td class="inv-num">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
    </tr>
    <tr class="inv-fila-alt">
      <td>Presentación de Ofertas</td>
      <td class="inv-num">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
    </tr>
    <tr>
      <td>Evaluación de Ofertas</td>
      <td class="inv-num">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
    </tr>
    <tr class="inv-fila-alt">
      <td>Suscripción del Contrato (Registro Presupuestal)</td>
      <td class="inv-num">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
    </tr>
  </tbody>
</table>

<!-- 6. FORMA DE PAGO -->
<div class="inv-seccion">6. FORMA DE PAGO</div>
<p class="inv-parrafo">
  El pago se realizará en la modalidad de <strong>{{ forma_pago or 'pago único' }}</strong>,
  previo cumplimiento del objeto contractual, presentación de la cuenta de cobro o factura,
  acta de recibido a satisfacción suscrita por el supervisor, y demás documentos requeridos
  para el pago. La entidad aplicará la retención en la fuente y demás descuentos de ley vigentes.
</p>

<!-- 7. REQUISITOS HABILITANTES -->
<div class="inv-seccion">7. REQUISITOS HABILITANTES</div>
<table class="inv-tabla">
  <thead>
    <tr class="inv-hdr-verde">
      <th style="width:4%">#</th>
      <th style="width:24%">Documento</th>
      <th style="width:40%">Descripción</th>
      <th style="width:18%">Vigencia</th>
      <th style="width:14%">Aplicación</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="inv-num">1</td>
      <td>Existencia y representación legal</td>
      <td>Expedido por cámara de comercio u organismo que otorga reconocimiento.</td>
      <td>Expedición no superior a 30 días</td>
      <td>Personas que ejerzan actividades mercantiles</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">2</td>
      <td>Fotocopia documento de identidad</td>
      <td>Documento de identidad del interesado, proveedor o contratista.</td>
      <td>N/A</td>
      <td>Persona natural y/o representante legal</td>
    </tr>
    <tr>
      <td class="inv-num">3</td>
      <td>RUT - Registro Único Tributario</td>
      <td>Detalla actividades económicas y responsabilidades tributarias.</td>
      <td>N/A</td>
      <td>Personas naturales y jurídicas</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">4</td>
      <td>Seguridad social</td>
      <td>Constancia de afiliación o planilla de pago al SGSS.</td>
      <td>Afiliación vigente al presentar propuesta</td>
      <td>Persona natural y jurídica</td>
    </tr>
    <tr>
      <td class="inv-num">5</td>
      <td>Antecedentes disciplinarios - Procuraduría</td>
      <td>Revela antecedentes disciplinarios de personas.</td>
      <td>Expedición no superior a 30 días</td>
      <td>Persona natural, jurídica y representante legal</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">6</td>
      <td>Antecedentes medidas correctivas - RNMC</td>
      <td>Registro Nacional de Medidas Correctivas - Código de Policía.</td>
      <td>Vigente sin registro de inhabilidad</td>
      <td>Representante legal y persona natural</td>
    </tr>
    <tr>
      <td class="inv-num">7</td>
      <td>Paz y salvo fiscal - Contraloría General</td>
      <td>Revela obligaciones fiscales de personas naturales y jurídicas.</td>
      <td>Expedición no superior a 30 días</td>
      <td>Persona natural, jurídica y representante legal</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">8</td>
      <td>Formato único hoja de vida</td>
      <td>Instrumento técnico para contratos de prestación de servicios.</td>
      <td>Actualizada al momento de presentación</td>
      <td>Contratos de prestación de servicios</td>
    </tr>
    <tr>
      <td class="inv-num">9</td>
      <td>Certificado inhabilidades e incompatibilidades</td>
      <td>Constancia de NO estar incurso en inhabilidad o incompatibilidad.</td>
      <td>Vigente al momento de participación</td>
      <td>Persona natural y representante legal</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">10</td>
      <td>Registro inhabilidades por delitos sexuales</td>
      <td>Acredita ausencia de delitos sexuales contra menores de edad.</td>
      <td>Vigente al momento de presentación</td>
      <td>Persona natural y representante legal / persona jurídica</td>
    </tr>
    <tr>
      <td class="inv-num">11</td>
      <td>Oferta o propuesta económica</td>
      <td>Presentada en términos de la invitación para bienes o servicios.</td>
      <td>Según cronograma del proceso</td>
      <td>Según condiciones de la invitación</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">12</td>
      <td>REDAM - Deudores alimentarios morosos</td>
      <td>Constancia de NO tener anotación en el Registro de Deudores Alimentarios Morosos.</td>
      <td>Expedición no superior a 90 días</td>
      <td>Persona natural y representante legal / persona jurídica</td>
    </tr>
    <tr>
      <td class="inv-num">13</td>
      <td>Autorización tratamiento de datos</td>
      <td>Autoriza el tratamiento y publicidad de datos de proponentes.</td>
      <td>Al momento de presentar propuesta</td>
      <td>Persona natural y jurídica</td>
    </tr>
    <tr class="inv-fila-alt">
      <td class="inv-num">14</td>
      <td>Carta de presentación de oferta</td>
      <td>Escrito de aceptación de condiciones de la invitación.</td>
      <td>Fecha máxima = fecha de presentación</td>
      <td>Persona natural y jurídica interesada</td>
    </tr>
    <tr>
      <td class="inv-num">15</td>
      <td>Antecedentes judiciales</td>
      <td>Certificado de Antecedentes Judiciales.</td>
      <td>Expedición no superior a 30 días</td>
      <td>Personas naturales y representantes legales</td>
    </tr>
  </tbody>
</table>

<!-- 8. CRITERIO DE EVALUACIÓN -->
<div class="inv-seccion">8. CRITERIO DE EVALUACIÓN Y SELECCIÓN</div>
<p class="inv-parrafo">
  La selección se realizará por el criterio de <strong>menor precio que cumpla con los
  requisitos habilitantes</strong>. Únicamente se evaluará económicamente la oferta que
  cumpla la totalidad de los requisitos del numeral anterior.
</p>

<!-- 9. PRESENTACIÓN DE LA PROPUESTA -->
<div class="inv-seccion">9. PRESENTACIÓN DE LA PROPUESTA</div>
<p class="inv-parrafo">
  La cotización deberá presentarse por escrito, dirigida al(la) Rector(a) de la
  <strong>{{ inst_nombre }}</strong>, {{ inst_dir }}, {{ inst_municipio }},
  o al correo electrónico <strong>{{ inst_email }}</strong>,
  dentro del término señalado para el efecto.
</p>
<p class="inv-parrafo">
  La propuesta económica deberá especificar el valor unitario y total de cada ítem,
  IVA discriminado si aplica, y el valor total de la propuesta.
</p>

<!-- 10. FUNDAMENTO LEGAL -->
<div class="inv-seccion">10. FUNDAMENTO LEGAL</div>
<p class="inv-parrafo">El presente proceso de contratación se rige por:</p>
<ul class="inv-list">
  <li>Ley 80 de 1993 – Estatuto General de Contratación Pública.</li>
  <li>Ley 1150 de 2007 – Medidas para la eficiencia y transparencia en la contratación pública.</li>
  <li>Decreto 1082 de 2015 – Decreto Único Reglamentario del sector de planeación nacional.</li>
  <li>Ley 1474 de 2011 – Estatuto Anticorrupción.</li>
  <li>Demás normas concordantes y complementarias.</li>
</ul>

<!-- Firma -->
<div class="inv-firma">
  <div class="inv-firma-linea" style="border:none"></div>
  <p><strong>{{ rector | upper }}</strong></p>
  <p>C.C. {{ format_id(cc_rector) }}</p>
  <p>Rector(a) — Ordenador del Gasto</p>
  <p>{{ inst_nombre }}</p>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/invitacion2.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Invitación a Ofertar — {{ numero }}{% endblock %}
{% block doc_titulo %}INVITACIÓN A OFERTAR{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     INVITACIÓN A OFERTAR 2 — estilos de impresión
     ══════════════════════════════════════════════ */

  table.inv2-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.inv2-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.inv2-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  .inv2-destinatario {
    margin: 10px 0 14px;
    padding: 8px 12px;
    border-left: 4px solid #333;
    background: #fff;
    font-size: 10pt;
    line-height: 1.45;
    }
  .inv2-destinatario p { margin: 0; }

  .inv2-asunto {
    margin: 10px 0 14px;
    font-size: 10pt;
    line-height: 1.45;
    text-align: justify;
  }

  .inv2-section {
    margin: 12px 0;
    }
  .inv2-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .inv2-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .inv2-section ul {
    margin: 5px 0 5px 20px;
    font-size: 10pt;
    line-height: 1.45;
  }
  .inv2-section h4 {
    font-size: 10pt;
    margin: 8px 0 3px;
    color: #333;
  }

  table.inv2-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px;
    font-size: 9.5pt;
    }
  table.inv2-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 8px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.inv2-table thead th.left { text-align: left; }
  table.inv2-table tbody td {
    padding: 5px 8px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  table.inv2-table tbody tr:nth-child(even) td { background: #f5f5f5; }

  .inv2-firma-section {
    margin-top: 15px;
  }
  .inv2-firma-block {
    display: inline-block;
    text-align: center;
    min-width: 220px;
  }
  .inv2-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .inv2-firma-block p { font-size: 10pt; margin: 2px 0; }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla institucional -->
<table class="inv2-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha</th>
    <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- Destinatario — datos Cotización 2 -->
<div class="inv2-destinatario">
  <p><strong>Señor(a):</strong></p>
  <p><strong>{{ cot2_nombre }}</strong></p>
  <p>CC/NIT N.° {{ format_id(cot2_cc) }}</p>
  <p>{{ cot2_municipio }}</p>
</div>

<!-- Asunto -->
<div class="inv2-asunto">
  <p>
    <strong>Asunto:</strong> Invitación a presentar oferta para proceso de contratación
    de Mínima Cuantía — artículo 2.2.1.2.1.5.2 del Decreto 1082 de 2015.
  </p>
</div>

<!-- Saludo -->
<div class="inv2-section">
  <p>Apreciado(a) señor(a):</p>
  <p>
    {{ inst_Art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT <strong>{{ format_id(inst_nit) }}</strong>,
    con domicilio en {{ inst_dir }}, {{ inst_municipio }}, {{ inst_departamento }},
    le extiende cordial invitación a presentar su oferta para la siguiente contratación,
    en el marco de las facultades que le confiere la normatividad vigente.
  </p>
</div>

<!-- 1. OBJETO -->
<div class="inv2-section">
  <div class="inv2-section-titulo">1. Objeto del Contrato</div>
  <p>{{ objeto }}</p>
</div>

<!-- 2. CLASIFICACIÓN UNSPSC -->
<div class="inv2-section">
  <div class="inv2-section-titulo">2. Clasificación UNSPSC</div>
  <table class="inv2-table">
    <thead>
      <tr>
        <th class="left" style="width:30%">Código UNSPSC</th>
        <th class="left">Descripción del Bien / Servicio</th>
      </tr>
    </thead>
    <tbody>
            <tr>
        <td style="text-align:center; font-weight:bold; letter-spacing:0.5px;">
            {{ codigos_unspsc_texto }}
        </td>
        <td>{{ objeto }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 3. PRESUPUESTO -->
<div class="inv2-section">
  <div class="inv2-section-titulo">3. Presupuesto Oficial</div>
  <p>
    El valor estimado de la contratación es de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), IVA incluido si aplica,
    con cargo al rubro <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    amparado con CDP N.° <strong>{{ num_cdp }}</strong> del
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- 4. PLAZO -->
<div class="inv2-section">
  <div class="inv2-section-titulo">4. Plazo de Ejecución</div>
  <p>
    <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>, contados a partir del acta de inicio.
  </p>
  <p>
    <strong>Inicio estimado:</strong> {{ fecha_inicio_larga }}&nbsp;&nbsp;&nbsp;
    <strong>Terminación estimada:</strong> {{ fecha_fin_larga }}
  </p>
</div>

<!-- 5. CRONOGRAMA -->
<div class="inv2-section">
  <div class="inv2-section-titulo">5. Cronograma del Proceso</div>
  <table class="inv2-table">
    <thead>
      <tr>
        <th class="left" style="width:60%">Actividad</th>
        <th style="width:40%">Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Publicación del Estudio Previo e Invitación</td>
        <td style="text-align:center">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Recepción de Ofertas</td>
        <td style="text-align:center">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Evaluación y Selección</td>
        <td style="text-align:center">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Suscripción del Contrato</td>
        <td style="text-align:center">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 6. CONDICIONES DE LA OFERTA -->
<div class="inv2-section">
  <div class="inv2-section-titulo">6. Condiciones de la Oferta</div>
  <p>La oferta deberá presentarse de manera escrita o por correo electrónico a
     <strong>{{ inst_email }}</strong>, antes de la fecha límite señalada en el cronograma,
     y deberá contener como mínimo:</p>
  <ul>
    <li>Descripción detallada del bien o servicio ofrecido.</li>
    <li>Valor total de la oferta (unitarios e IVA discriminado, si aplica).</li>
    <li>Plazo de entrega o ejecución.</li>
    <li>Datos de contacto del oferente.</li>
  </ul>
</div>

<!-- 7. FORMA DE PAGO -->
<div class="inv2-section">
  <div class="inv2-section-titulo">7. Forma de Pago</div>
  <p>
    El pago se realizará en la modalidad de <strong>{{ forma_pago or 'pago único' }}</strong>,
    previo cumplimiento del objeto, presentación de factura o cuenta de cobro,
    acta de recibido a satisfacción y demás documentos requeridos. Se aplicarán retenciones
    y descuentos de ley.
  </p>
</div>

<!-- 8. REQUISITOS HABILITANTES -->
<div class="inv2-section">
  <div class="inv2-section-titulo">8. Requisitos Habilitantes</div>
  <table class="inv2-table">
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th class="left" style="width:28%">Documento</th>
        <th class="left" style="width:32%">Descripción</th>
        <th class="left" style="width:18%">Vigencia</th>
        <th class="left" style="width:18%">Aplicación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center">1</td>
        <td>Existencia y representación legal</td>
        <td>Expedido por cámara de comercio u organismo que otorga reconocimiento.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas que ejerzan actividades mercantiles</td>
      </tr>
      <tr>
        <td style="text-align:center">2</td>
        <td>Fotocopia documento de identidad</td>
        <td>Documento de identidad del interesado, proveedor o contratista.</td>
        <td>N/A</td>
        <td>Persona natural y/o representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">3</td>
        <td>RUT - Registro Único Tributario</td>
        <td>Detalla actividades económicas y responsabilidades tributarias.</td>
        <td>N/A</td>
        <td>Personas naturales y jurídicas</td>
      </tr>
      <tr>
        <td style="text-align:center">4</td>
        <td>Seguridad social</td>
        <td>Constancia de afiliación o planilla de pago al SGSS.</td>
        <td>Afiliación vigente al presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">5</td>
        <td>Antecedentes disciplinarios - Procuraduría</td>
        <td>Revela antecedentes disciplinarios de personas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">6</td>
        <td>Antecedentes medidas correctivas - RNMC</td>
        <td>Registro Nacional de Medidas Correctivas - Código de Policía.</td>
        <td>Vigente sin registro de inhabilidad</td>
        <td>Representante legal y persona natural</td>
      </tr>
      <tr>
        <td style="text-align:center">7</td>
        <td>Paz y salvo fiscal - Contraloría General</td>
        <td>Revela obligaciones fiscales de personas naturales y jurídicas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">8</td>
        <td>Formato único hoja de vida</td>
        <td>Instrumento técnico para contratos de prestación de servicios.</td>
        <td>Actualizada al momento de presentación</td>
        <td>Contratos de prestación de servicios</td>
      </tr>
      <tr>
        <td style="text-align:center">9</td>
        <td>Certificado inhabilidades e incompatibilidades</td>
        <td>Constancia de NO estar incurso en inhabilidad o incompatibilidad.</td>
        <td>Vigente al momento de participación</td>
        <td>Persona natural y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">10</td>
        <td>Registro inhabilidades por delitos sexuales</td>
        <td>Acredita ausencia de delitos sexuales contra menores de edad.</td>
        <td>Vigente al momento de presentación</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">11</td>
        <td>Oferta o propuesta económica</td>
        <td>Presentada en términos de la invitación para bienes o servicios.</td>
        <td>Según cronograma del proceso</td>
        <td>Según condiciones de la invitación</td>
      </tr>
      <tr>
        <td style="text-align:center">12</td>
        <td>REDAM - Deudores alimentarios morosos</td>
        <td>Constancia de NO tener anotación en el Registro de Deudores Alimentarios Morosos.</td>
        <td>Expedición no superior a 90 días</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">13</td>
        <td>Autorización tratamiento de datos</td>
        <td>Autoriza el tratamiento y publicidad de datos de proponentes.</td>
        <td>Al momento de presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">14</td>
        <td>Carta de presentación de oferta</td>
        <td>Escrito de aceptación de condiciones de la invitación.</td>
        <td>Fecha máxima = fecha de presentación</td>
        <td>Persona natural y jurídica interesada</td>
      </tr>
      <tr>
        <td style="text-align:center">15</td>
        <td>Antecedentes judiciales</td>
        <td>Certificado de Antecedentes Judiciales.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas naturales y representantes legales</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 9. CRITERIO DE SELECCIÓN -->
<div class="inv2-section">
  <div class="inv2-section-titulo">9. Criterio de Selección</div>
  <p>
    Se seleccionará la oferta de <strong>menor precio</strong> que cumpla
    íntegramente con los requisitos habilitantes establecidos.
  </p>
</div>

<!-- 10. FUNDAMENTO LEGAL -->
<div class="inv2-section">
  <div class="inv2-section-titulo">10. Fundamento Legal</div>
  <ul>
    <li>Ley 80 de 1993 — Estatuto General de Contratación Pública.</li>
    <li>Ley 1150 de 2007 — Eficiencia y transparencia contractual.</li>
    <li>Decreto 1082 de 2015 — Decreto Único Reglamentario.</li>
    <li>Ley 1474 de 2011 — Estatuto Anticorrupción.</li>
    <li>Demás normas concordantes y complementarias.</li>
  </ul>
</div>

<!-- Firma -->
<div class="inv2-firma-section">
  <div class="inv2-firma-block">
    <div class="inv2-firma-linea" style="border:none">
      <p><strong>{{ rector | upper }}</strong></p>
      <p>C.C. {{ format_id(cc_rector) }}</p>
      <p>Rector(a) — Ordenador del Gasto</p>
      <p>{{ inst_nombre }}</p>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/invitacion3.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Invitación a Ofertar 3 — {{ numero }}{% endblock %}
{% block doc_titulo %}INVITACIÓN A OFERTAR{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     INVITACIÓN A OFERTAR 3 — estilos de impresión
     ══════════════════════════════════════════════ */

  table.inv3-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.inv3-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.inv3-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  .inv3-destinatario {
    margin: 10px 0 14px;
    padding: 8px 12px;
    border-left: 4px solid #333;
    background: #fff;
    font-size: 10pt;
    line-height: 1.45;
    }
  .inv3-destinatario p { margin: 0; }

  .inv3-asunto {
    margin: 10px 0 14px;
    font-size: 10pt;
    line-height: 1.45;
    text-align: justify;
  }

  .inv3-section {
    margin: 12px 0;
    }
  .inv3-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .inv3-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .inv3-section ul {
    margin: 5px 0 5px 20px;
    font-size: 10pt;
    line-height: 1.45;
  }
  .inv3-section h4 {
    font-size: 10pt;
    margin: 8px 0 3px;
    color: #333;
  }

  table.inv3-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px;
    font-size: 9.5pt;
    }
  table.inv3-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 8px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.inv3-table thead th.left { text-align: left; }
  table.inv3-table tbody td {
    padding: 5px 8px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  table.inv3-table tbody tr:nth-child(even) td { background: #f5f5f5; }

  .inv3-firma-section {
    margin-top: 15px;
  }
  .inv3-firma-block {
    display: inline-block;
    text-align: center;
    min-width: 220px;
  }
  .inv3-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .inv3-firma-block p { font-size: 10pt; margin: 2px 0; }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla institucional -->
<table class="inv3-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha</th>
    <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- Destinatario — datos Cotización 3 -->
<div class="inv3-destinatario">
  <p><strong>Señor(a):</strong></p>
  <p><strong>{{ cot3_nombre }}</strong></p>
  <p>CC/NIT N.° {{ format_id(cot3_cc) }}</p>
  <p>{{ cot3_municipio }}</p>
</div>

<!-- Asunto -->
<div class="inv3-asunto">
  <p>
    <strong>Asunto:</strong> Invitación a presentar oferta para proceso de contratación
    de Mínima Cuantía — artículo 2.2.1.2.1.5.2 del Decreto 1082 de 2015.
  </p>
</div>

<!-- Saludo -->
<div class="inv3-section">
  <p>Apreciado(a) señor(a):</p>
  <p>
    {{ inst_Art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT <strong>{{ format_id(inst_nit) }}</strong>,
    con domicilio en {{ inst_dir }}, {{ inst_municipio }}, {{ inst_departamento }},
    le extiende cordial invitación a presentar su oferta para la siguiente contratación,
    en el marco de las facultades que le confiere la normatividad vigente.
  </p>
</div>

<!-- 1. OBJETO -->
<div class="inv3-section">
  <div class="inv3-section-titulo">1. Objeto del Contrato</div>
  <p>{{ objeto }}</p>
</div>

<!-- 2. CLASIFICACIÓN UNSPSC -->
<div class="inv3-section">
  <div class="inv3-section-titulo">2. Clasificación UNSPSC</div>
  <table class="inv3-table">
    <thead>
      <tr>
        <th class="left" style="width:30%">Código UNSPSC</th>
        <th class="left">Descripción del Bien / Servicio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center; font-weight:bold; letter-spacing:0.5px;">
            {{ codigos_unspsc_texto }}
        </td>
        <td>{{ objeto }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 3. PRESUPUESTO -->
<div class="inv3-section">
  <div class="inv3-section-titulo">3. Presupuesto Oficial</div>
  <p>
    El valor estimado de la contratación es de
    <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), IVA incluido si aplica,
    con cargo al rubro <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>,
    amparado con CDP N.° <strong>{{ num_cdp }}</strong> del
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- 4. PLAZO -->
<div class="inv3-section">
  <div class="inv3-section-titulo">4. Plazo de Ejecución</div>
  <p>
    <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong>, contados a partir del acta de inicio.
  </p>
  <p>
    <strong>Inicio estimado:</strong> {{ fecha_inicio_larga }}&nbsp;&nbsp;&nbsp;
    <strong>Terminación estimada:</strong> {{ fecha_fin_larga }}
  </p>
</div>

<!-- 5. CRONOGRAMA -->
<div class="inv3-section">
  <div class="inv3-section-titulo">5. Cronograma del Proceso</div>
  <table class="inv3-table">
    <thead>
      <tr>
        <th class="left" style="width:60%">Actividad</th>
        <th style="width:40%">Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Publicación del Estudio Previo e Invitación</td>
        <td style="text-align:center">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Recepción de Ofertas</td>
        <td style="text-align:center">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Evaluación y Selección</td>
        <td style="text-align:center">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Suscripción del Contrato</td>
        <td style="text-align:center">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 6. CONDICIONES DE LA OFERTA -->
<div class="inv3-section">
  <div class="inv3-section-titulo">6. Condiciones de la Oferta</div>
  <p>La oferta deberá presentarse de manera escrita o por correo electrónico a
     <strong>{{ inst_email }}</strong>, antes de la fecha límite señalada en el cronograma,
     y deberá contener como mínimo:</p>
  <ul>
    <li>Descripción detallada del bien o servicio ofrecido.</li>
    <li>Valor total de la oferta (unitarios e IVA discriminado, si aplica).</li>
    <li>Plazo de entrega o ejecución.</li>
    <li>Datos de contacto del oferente.</li>
  </ul>
</div>

<!-- 7. FORMA DE PAGO -->
<div class="inv3-section">
  <div class="inv3-section-titulo">7. Forma de Pago</div>
  <p>
    El pago se realizará en la modalidad de <strong>{{ forma_pago or 'pago único' }}</strong>,
    previo cumplimiento del objeto, presentación de factura o cuenta de cobro,
    acta de recibido a satisfacción y demás documentos requeridos. Se aplicarán retenciones
    y descuentos de ley.
  </p>
</div>

<!-- 8. REQUISITOS HABILITANTES -->
<div class="inv3-section">
  <div class="inv3-section-titulo">8. Requisitos Habilitantes</div>
  <table class="inv3-table">
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th class="left" style="width:28%">Documento</th>
        <th class="left" style="width:32%">Descripción</th>
        <th class="left" style="width:18%">Vigencia</th>
        <th class="left" style="width:18%">Aplicación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center">1</td>
        <td>Existencia y representación legal</td>
        <td>Expedido por cámara de comercio u organismo que otorga reconocimiento.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas que ejerzan actividades mercantiles</td>
      </tr>
      <tr>
        <td style="text-align:center">2</td>
        <td>Fotocopia documento de identidad</td>
        <td>Documento de identidad del interesado, proveedor o contratista.</td>
        <td>N/A</td>
        <td>Persona natural y/o representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">3</td>
        <td>RUT - Registro Único Tributario</td>
        <td>Detalla actividades económicas y responsabilidades tributarias.</td>
        <td>N/A</td>
        <td>Personas naturales y jurídicas</td>
      </tr>
      <tr>
        <td style="text-align:center">4</td>
        <td>Seguridad social</td>
        <td>Constancia de afiliación o planilla de pago al SGSS.</td>
        <td>Afiliación vigente al presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">5</td>
        <td>Antecedentes disciplinarios - Procuraduría</td>
        <td>Revela antecedentes disciplinarios de personas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">6</td>
        <td>Antecedentes medidas correctivas - RNMC</td>
        <td>Registro Nacional de Medidas Correctivas - Código de Policía.</td>
        <td>Vigente sin registro de inhabilidad</td>
        <td>Representante legal y persona natural</td>
      </tr>
      <tr>
        <td style="text-align:center">7</td>
        <td>Paz y salvo fiscal - Contraloría General</td>
        <td>Revela obligaciones fiscales de personas naturales y jurídicas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">8</td>
        <td>Formato único hoja de vida</td>
        <td>Instrumento técnico para contratos de prestación de servicios.</td>
        <td>Actualizada al momento de presentación</td>
        <td>Contratos de prestación de servicios</td>
      </tr>
      <tr>
        <td style="text-align:center">9</td>
        <td>Certificado inhabilidades e incompatibilidades</td>
        <td>Constancia de NO estar incurso en inhabilidad o incompatibilidad.</td>
        <td>Vigente al momento de participación</td>
        <td>Persona natural y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">10</td>
        <td>Registro inhabilidades por delitos sexuales</td>
        <td>Acredita ausencia de delitos sexuales contra menores de edad.</td>
        <td>Vigente al momento de presentación</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">11</td>
        <td>Oferta o propuesta económica</td>
        <td>Presentada en términos de la invitación para bienes o servicios.</td>
        <td>Según cronograma del proceso</td>
        <td>Según condiciones de la invitación</td>
      </tr>
      <tr>
        <td style="text-align:center">12</td>
        <td>REDAM - Deudores alimentarios morosos</td>
        <td>Constancia de NO tener anotación en el Registro de Deudores Alimentarios Morosos.</td>
        <td>Expedición no superior a 90 días</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">13</td>
        <td>Autorización tratamiento de datos</td>
        <td>Autoriza el tratamiento y publicidad de datos de proponentes.</td>
        <td>Al momento de presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">14</td>
        <td>Carta de presentación de oferta</td>
        <td>Escrito de aceptación de condiciones de la invitación.</td>
        <td>Fecha máxima = fecha de presentación</td>
        <td>Persona natural y jurídica interesada</td>
      </tr>
      <tr>
        <td style="text-align:center">15</td>
        <td>Antecedentes judiciales</td>
        <td>Certificado de Antecedentes Judiciales.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas naturales y representantes legales</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 9. CRITERIO DE SELECCIÓN -->
<div class="inv3-section">
  <div class="inv3-section-titulo">9. Criterio de Selección</div>
  <p>
    Se seleccionará la oferta de <strong>menor precio</strong> que cumpla
    íntegramente con los requisitos habilitantes establecidos.
  </p>
</div>

<!-- 10. FUNDAMENTO LEGAL -->
<div class="inv3-section">
  <div class="inv3-section-titulo">10. Fundamento Legal</div>
  <ul>
    <li>Ley 80 de 1993 — Estatuto General de Contratación Pública.</li>
    <li>Ley 1150 de 2007 — Eficiencia y transparencia contractual.</li>
    <li>Decreto 1082 de 2015 — Decreto Único Reglamentario.</li>
    <li>Ley 1474 de 2011 — Estatuto Anticorrupción.</li>
    <li>Demás normas concordantes y complementarias.</li>
  </ul>
</div>

<!-- Firma -->
<div class="inv3-firma-section">
  <div class="inv3-firma-block">
    <div class="inv3-firma-linea" style="border:none">
      <p><strong>{{ rector | upper }}</strong></p>
      <p>C.C. {{ format_id(cc_rector) }}</p>
      <p>Rector(a) — Ordenador del Gasto</p>
      <p>{{ inst_nombre }}</p>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/invitacion_garantia.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Invitación — Ley de Garantías — {{ numero }}{% endblock %}
{% block doc_titulo %}INVITACIÓN A OFERTAR — LEY GARANTÍAS{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     INVITACIÓN LEY GARANTÍAS — estilos de impresión
     ══════════════════════════════════════════════ */

  table.invg-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.invg-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.invg-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  .invg-destinatario {
    margin: 10px 0 14px;
    padding: 8px 12px;
    border-left: 4px solid #333;
    background: #fff;
    font-size: 10pt;
    line-height: 1.45;
    }
  .invg-destinatario p { margin: 0; }

  .invg-asunto {
    margin: 10px 0 14px;
    font-size: 10pt;
    line-height: 1.45;
    text-align: justify;
  }

  .invg-section {
    margin: 12px 0;
    }
  .invg-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .invg-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 5px 0;
    line-height: 1.45;
  }
  .invg-section ul {
    margin: 5px 0 5px 20px;
    font-size: 10pt;
    line-height: 1.45;
  }
  .invg-section h4 {
    font-size: 10pt;
    margin: 8px 0 3px;
    color: #333;
  }

  table.invg-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px;
    font-size: 9.5pt;
    }
  table.invg-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 8px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.invg-table thead th.left { text-align: left; }
  table.invg-table tbody td {
    padding: 5px 8px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  table.invg-table tbody tr:nth-child(even) td { background: #f5f5f5; }

  /* Bloque de garantías destacado */
  .invg-garantia-box {
    border: 2px solid #333;
    border-radius: 4px;
    padding: 10px 14px;
    margin: 10px 0;
    background: #fff;
    }
  .invg-garantia-box .invg-garantia-titulo {
    font-weight: bold;
    font-size: 10pt;
    color: #333;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .invg-garantia-box table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
  }
  .invg-garantia-box table th {
    background: #eee;
    color: #000;
    padding: 4px 8px;
    text-align: left;
    border: 1px solid #999;
  }
  .invg-garantia-box table td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  .invg-firma-section {
    margin-top: 15px;
  }
  .invg-firma-block {
    display: inline-block;
    text-align: center;
    min-width: 220px;
  }
  .invg-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .invg-firma-block p { font-size: 10pt; margin: 2px 0; }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla institucional -->
<table class="invg-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
  </tr>
  <tr>
    <th>Fecha</th>
    <td colspan="3">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else hoy_largo }}</td>
  </tr>
</table>

<!-- Asunto -->
<div class="invg-asunto">
  <p>
    <strong>Asunto:</strong> Invitación general a presentar oferta – Procedimiento especial
    FSE (≤ 20 SMLMV) | Aplicación Ley de Garantías Electorales
  </p>
</div>

<!-- Introducción general -->
<div class="invg-section">
  <p>
    Desde {{ inst_art }} <strong>{{ inst_nombre }}</strong>, identificada con NIT No. <strong>{{ format_id(inst_nit) }}</strong>,
    en su calidad de entidad de régimen especial, se permite invitar de manera general y no
    dirigida a proveedor específico a las personas naturales y/o jurídicas interesadas en
    presentar oferta para la contratación de bienes y/o servicios requeridos para el
    cumplimiento de su misión institucional, cuyo objeto es: <strong>{{ objeto }}</strong>
  </p>
  <p>
    El servicio deberá cumplir con los requerimientos funcionales, técnicos y de seguridad
    definidos por la Institución Educativa, así como permitir la correcta administración de
    la información académica institucional.
  </p>
  <p>
    La presente invitación se realiza conforme a lo dispuesto en el Decreto 4791 de 2008,
    el Manual Interno de Contratación del Fondo de Servicios Educativos y las disposiciones
    aplicables durante el período de Ley de Garantías Electorales, con el propósito exclusivo
    de obtener elementos de comparación que permitan aplicar los principios de planeación,
    transparencia y selección objetiva.
  </p>
  <p>
    La presente invitación no constituye un proceso de selección pública, ni genera obligación
    de adjudicación para la Institución Educativa.
  </p>
</div>

<!-- NECESIDAD -->
<div class="invg-section">
  <div class="invg-section-titulo">Necesidad (Según Línea PAA)</div>
  <p>
    La presente necesidad se encuentra incluida en el Plan Anual de Adquisiciones (PAA) de
    la vigencia fiscal correspondiente, conforme a la línea de inversión aprobada por el
    Consejo Directivo del Fondo de Servicios Educativos. La adquisición del bien o servicio
    es indispensable para garantizar la continuidad de las actividades misionales de la
    Institución Educativa y responde a los objetivos del Proyecto Educativo Institucional (PEI).
  </p>
</div>

<!-- FUNDAMENTOS JURÍDICOS -->
<div class="invg-section">
  <div class="invg-section-titulo">Fundamentos Jurídicos que Sustentan la Convocatoria bajo esta Modalidad</div>
  <p>
    Son normas aplicables para la modalidad de régimen especial (reglamento de 20 SMLMV,
    dispuesto en artículo 13 de la ley 715 de 2001), las siguientes: 1- Criterios específicos
    del artículo 2.3.1.6.3.17 del decreto 1075 de 2015 que corresponden al artículo 17 del
    decreto 4791 de 2008 y 2- Principios contractuales de la ley 80 de 1993.
  </p>
  <p>
    El monto requerido para atender la necesidad objeto de esta convocatoria no supera 20
    SMLMV, por lo que es aplicable la modalidad de régimen especial para establecimientos
    educativos oficiales, según la cual, las adquisiciones de bienes y servicios que se
    encuentren en el rango indicado se adelantan con observancia de lo dispuesto en el
    Reglamento aprobado por el consejo directivo.
  </p>
  <p>
    En consecuencia, el proceso derivado de este análisis se rige por lo determinado en el
    manual de contratación institucional, subtítulo respectivo a lineamientos del reglamento
    interno.
  </p>
  <p>
    La presente convocatoria reúne los requisitos para un régimen especial con respecto a un
    pliego de condiciones, según lo dispuesto en el numeral 5 del artículo 24 de la ley 80
    de 1993.
  </p>
</div>

<!-- 1. OBJETO -->
<div class="invg-section">
  <div class="invg-section-titulo">1. Objeto del Contrato</div>
  <p>{{ objeto }}</p>
</div>

<!-- 2. CLASIFICACIÓN UNSPSC -->
<div class="invg-section">
  <div class="invg-section-titulo">2. Clasificación UNSPSC</div>
  <table class="invg-table">
    <thead>
      <tr>
        <th class="left" style="width:30%">Código UNSPSC</th>
        <th class="left">Descripción del Bien / Servicio</th>
      </tr>
    </thead>
    <tbody>
            <tr>
        <td style="text-align:center; font-weight:bold; letter-spacing:0.5px;">
            {{ codigos_unspsc_texto }}
        </td>
        <td>{{ objeto }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 3. PRESUPUESTO -->
<div class="invg-section">
  <div class="invg-section-titulo">3. Presupuesto Oficial</div>
  <p>
    El valor estimado es de <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), IVA incluido si aplica, con cargo al rubro
    <strong>{{ rubro_codigo }} — {{ rubro_nombre }}</strong>, amparado con CDP N.°
    <strong>{{ num_cdp }}</strong> del <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
</div>

<!-- 4. PLAZO -->
<div class="invg-section">
  <div class="invg-section-titulo">4. Plazo de Ejecución</div>
  <p>
    <strong>{{ plazo_valor }} {{ plazo_unidad_texto }}</strong> contados a partir del acta de inicio,
    previo cumplimiento de los requisitos de perfeccionamiento y ejecución, incluida
    la constitución y aprobación de la póliza de garantía (si aplica).
  </p>
  <p>
    <strong>Inicio estimado:</strong> {{ fecha_inicio_larga }}&nbsp;&nbsp;&nbsp;
    <strong>Terminación estimada:</strong> {{ fecha_fin_larga }}
  </p>
</div>

<!-- 5. CRONOGRAMA -->
<div class="invg-section">
  <div class="invg-section-titulo">5. Cronograma del Proceso</div>
  <table class="invg-table">
    <thead>
      <tr>
        <th class="left" style="width:60%">Actividad</th>
        <th style="width:40%">Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Publicación del Estudio Previo e Invitación</td>
        <td style="text-align:center">{{ fecha_estudio_previo_larga if fecha_estudio_previo_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Recepción de Ofertas</td>
        <td style="text-align:center">{{ fecha_presentacion_oferta_larga if fecha_presentacion_oferta_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Evaluación y Selección</td>
        <td style="text-align:center">{{ fecha_evaluacion_larga if fecha_evaluacion_larga is defined else '—' }}</td>
      </tr>
      <tr>
        <td>Suscripción del Contrato y aprobación de garantía</td>
        <td style="text-align:center">{{ fecha_rp_larga if fecha_rp_larga is defined else '—' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 6. FORMA DE PAGO -->
<div class="invg-section">
  <div class="invg-section-titulo">6. Forma de Pago</div>
  <p>
    El pago se realizará en la modalidad de <strong>{{ forma_pago or 'pago único' }}</strong>,
    previo cumplimiento del objeto contractual, presentación de factura o cuenta de cobro,
    acta de recibido a satisfacción, póliza aprobada y demás documentos requeridos.
    Se aplicarán retenciones y descuentos de ley.
  </p>
</div>

<!-- 7. REQUISITOS HABILITANTES — tabla -->
<div class="invg-section">
  <div class="invg-section-titulo">7. Requisitos Habilitantes</div>
  <table class="invg-table">
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th class="left" style="width:28%">Documento</th>
        <th class="left" style="width:32%">Descripción</th>
        <th class="left" style="width:18%">Vigencia</th>
        <th class="left" style="width:18%">Aplicación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align:center">1</td>
        <td>Existencia y representación legal</td>
        <td>Expedido por cámara de comercio u organismo que otorga reconocimiento.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas que ejerzan actividades mercantiles</td>
      </tr>
      <tr>
        <td style="text-align:center">2</td>
        <td>Fotocopia documento de identidad</td>
        <td>Documento de identidad del interesado, proveedor o contratista.</td>
        <td>N/A</td>
        <td>Persona natural y/o representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">3</td>
        <td>RUT - Registro Único Tributario</td>
        <td>Detalla actividades económicas y responsabilidades tributarias.</td>
        <td>N/A</td>
        <td>Personas naturales y jurídicas</td>
      </tr>
      <tr>
        <td style="text-align:center">4</td>
        <td>Seguridad social</td>
        <td>Constancia de afiliación o planilla de pago al SGSS.</td>
        <td>Afiliación vigente al presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">5</td>
        <td>Antecedentes disciplinarios - Procuraduría</td>
        <td>Revela antecedentes disciplinarios de personas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">6</td>
        <td>Antecedentes medidas correctivas - RNMC</td>
        <td>Registro Nacional de Medidas Correctivas - Código de Policía.</td>
        <td>Vigente sin registro de inhabilidad</td>
        <td>Representante legal y persona natural</td>
      </tr>
      <tr>
        <td style="text-align:center">7</td>
        <td>Paz y salvo fiscal - Contraloría General</td>
        <td>Revela obligaciones fiscales de personas naturales y jurídicas.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Persona natural, jurídica y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">8</td>
        <td>Formato único hoja de vida</td>
        <td>Instrumento técnico para contratos de prestación de servicios.</td>
        <td>Actualizada al momento de presentación</td>
        <td>Contratos de prestación de servicios</td>
      </tr>
      <tr>
        <td style="text-align:center">9</td>
        <td>Certificado inhabilidades e incompatibilidades</td>
        <td>Constancia de NO estar incurso en inhabilidad o incompatibilidad.</td>
        <td>Vigente al momento de participación</td>
        <td>Persona natural y representante legal</td>
      </tr>
      <tr>
        <td style="text-align:center">10</td>
        <td>Registro inhabilidades por delitos sexuales</td>
        <td>Acredita ausencia de delitos sexuales contra menores de edad.</td>
        <td>Vigente al momento de presentación</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">11</td>
        <td>Oferta o propuesta económica</td>
        <td>Presentada en términos de la invitación para bienes o servicios.</td>
        <td>Según cronograma del proceso</td>
        <td>Según condiciones de la invitación</td>
      </tr>
      <tr>
        <td style="text-align:center">12</td>
        <td>REDAM - Deudores alimentarios morosos</td>
        <td>Constancia de NO tener anotación en el Registro de Deudores Alimentarios Morosos.</td>
        <td>Expedición no superior a 90 días</td>
        <td>Persona natural y representante legal / persona jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">13</td>
        <td>Autorización tratamiento de datos</td>
        <td>Autoriza el tratamiento y publicidad de datos de proponentes.</td>
        <td>Al momento de presentar propuesta</td>
        <td>Persona natural y jurídica</td>
      </tr>
      <tr>
        <td style="text-align:center">14</td>
        <td>Carta de presentación de oferta</td>
        <td>Escrito de aceptación de condiciones de la invitación.</td>
        <td>Fecha máxima = fecha de presentación</td>
        <td>Persona natural y jurídica interesada</td>
      </tr>
      <tr>
        <td style="text-align:center">15</td>
        <td>Antecedentes judiciales</td>
        <td>Certificado de Antecedentes Judiciales.</td>
        <td>Expedición no superior a 30 días</td>
        <td>Personas naturales y representantes legales</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- 8. CRITERIO DE SELECCIÓN -->
<div class="invg-section">
  <div class="invg-section-titulo">8. Criterio de Selección</div>
  <ul>
    <li><strong>Técnico:</strong> Cumple / No cumple las especificaciones mínimas.</li>
    <li><strong>Desempate:</strong> Preferencia por mayor garantía, menor plazo o sorteo, según manual de contratación.</li>
  </ul>
</div>

<!-- 9. OBSERVACIONES LEGALES Y ADMINISTRATIVAS -->
<div class="invg-section">
  <div class="invg-section-titulo">9. Observaciones Legales y Administrativas</div>
  <p>
    El presente procedimiento se rige por las normas propias del Fondo de Servicios
    Educativos, conforme al Decreto 4791 de 2008 y al Manual Interno de Contratación
    de la Institución Educativa.
  </p>
  <p>
    <strong>CUMPLIMIENTO DE LA LEY DE GARANTÍAS ELECTORALES:</strong> El presente proceso
    se adelanta dentro del período de restricción electoral previsto en la Ley 996 de 2005
    y sus reglamentaciones vigentes para el período electoral correspondiente. La presente invitación es de
    carácter <strong>GENERAL</strong>, no dirigida a proveedor específico, y permite la
    participación de una <strong>PLURALIDAD DE OFERENTES</strong> con criterios objetivos
    de evaluación. En consecuencia, conforme al Concepto del
    Consejo de Estado, Sala de Consulta y Servicio Civil, Exp. 2.382/2018, y la circular
    vigente que Colombia Compra Eficiente expida para cada período electoral, este proceso
    <strong>NO</strong> constituye 'contratación directa' en los términos del artículo 33
    de la Ley de Garantías, y puede adelantarse válidamente durante el período electoral.
  </p>
  <p>
    La información contractual será publicada en el SECOP con fines de transparencia y
    trazabilidad del proceso.
  </p>
</div>

<!-- 10. PRESENTACIÓN DE LA OFERTA -->
<div class="invg-section">
  <div class="invg-section-titulo">10. Presentación de la Oferta</div>
  <p>
    La oferta deberá presentarse de manera escrita, dirigida al(la) Rector(a) de la
    <strong>{{ inst_nombre }}</strong>, {{ inst_dir }}, {{ inst_municipio }},
    o al correo <strong>{{ inst_email }}</strong>, dentro del plazo señalado en el
    cronograma. Deberá incluir valor total, discriminado por ítems e IVA si aplica,
    y manifestación expresa de capacidad para constituir la póliza de garantía (si aplica).
  </p>
</div>

<!-- 11. FUNDAMENTO LEGAL -->
<div class="invg-section">
  <div class="invg-section-titulo">11. Fundamento Legal</div>
  <ul>
    <li>Ley 80 de 1993 — Estatuto General de Contratación Pública.</li>
    <li>Ley 1150 de 2007 — Art. 7: Garantías en la contratación estatal.</li>
    <li>Ley 715 de 2001 — Art. 13: Régimen especial establecimientos educativos.</li>
    <li>Decreto 4791 de 2008 — Manual de Contratación del Fondo de Servicios Educativos.</li>
    <li>Decreto 1075 de 2015 — Art. 2.3.1.6.3.17: Criterios de contratación.</li>
    <li>Ley 1474 de 2011 — Estatuto Anticorrupción.</li>
    <li>Circular vigente de Colombia Compra Eficiente — Lineamientos contratación en período electoral.</li>
    <li>Concepto Consejo de Estado, Sala de Consulta y Servicio Civil, Exp. 2.382/2018.</li>
  </ul>
</div>

<!-- COMPROMISO DE TRANSPARENCIA -->
<div class="invg-section">
  <div class="invg-section-titulo">Compromiso de Transparencia, Buenas Prácticas y Medidas Anticorrupción</div>
  <p>
    La Institución Educativa, en cumplimiento de la Ley 1474 de 2011 (Estatuto
    Anticorrupción) y demás normas concordantes, se compromete a adelantar el presente
    proceso contractual con sujeción a los principios de transparencia, responsabilidad,
    selección objetiva y moralidad administrativa. Se invita a los participantes a denunciar
    cualquier acto de corrupción ante los organismos de control competentes. Se promueve el
    ejercicio de veedurías ciudadanas conforme a la Ley 850 de 2003.
  </p>
</div>

<!-- Firma -->
<div class="invg-firma-section">
  <div class="invg-firma-block">
    <div class="invg-firma-linea" style="border:none">
      <p><strong>{{ rector | upper }}</strong></p>
      <p>C.C. {{ format_id(cc_rector) }}</p>
      <p>Rector(a) — Ordenador del Gasto</p>
      <p>{{ inst_nombre }}</p>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/orden_compra.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Orden de Compra/Servicio — {{ numero }}{% endblock %}
{% block doc_titulo %}ORDEN DE COMPRA / SERVICIO{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ORDEN DE COMPRA / SERVICIO  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.oc-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Secciones ────────────────────────────────────── */
.oc-section {
  margin: 10px 0 12px;
}
.oc-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.oc-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 4px 0;
  line-height: 1.45;
}

/* ── Tabla de datos generales ─────────────────────── */
table.oc-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 10px;
  font-size: 9.5pt;
}
table.oc-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 20%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.oc-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Lugar y fecha ────────────────────────────────── */
.oc-lugar {
  font-size: 9.5pt;
  text-align: justify;
  margin: 10px 0 6px;
  line-height: 1.45;
}

/* ── Firmas ───────────────────────────────────────── */
.oc-firma-section {
  margin-top: 15px;
}
table.oc-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.oc-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 20px;
  border: none;
  vertical-align: bottom;
}
.oc-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
}
.oc-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.oc-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="oc-numero">Contrato N.° {{ numero }}</p>

<!-- ── 1. DATOS GENERALES ─────────────────────────────────────── -->
<div class="oc-section">
  <div class="oc-section-titulo">1. Datos Generales</div>
  <table class="oc-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Fecha</th>
      <td>{{ fecha_inicio_larga }}</td>
    </tr>
    <tr>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
      <th>Tipo de contrato</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }} &nbsp;·&nbsp; {{ fecha_cdp_larga }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }} &nbsp;·&nbsp; {{ fecha_rp_larga }}</td>
    </tr>
    <tr>
      <th>Rubro presupuestal</th>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
      <th>Fuente</th>
      <td>{{ fuente }} — {{ fuente_nombre }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. DATOS DEL PROVEEDOR / CONTRATISTA ───────────────────── -->
<div class="oc-section">
  <div class="oc-section-titulo">2. Proveedor / Contratista</div>
  <table class="oc-tabla">
    <tr>
      <th>Nombre / Razón social</th>
      <td colspan="3">{{ nombre_contratista }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    {% if es_empresa and rep_legal_nombre %}
    <tr>
      <th>Representante Legal</th>
      <td colspan="3">{{ rep_legal_nombre }}</td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>C.C.</td>
      <th>Número</th>
      <td>{{ format_id(rep_legal_cc) }}</td>
    </tr>
    {% endif %}
    <tr>
      <th>Dirección</th>
      <td>{{ direccion_contratista }}</td>
      <th>Municipio</th>
      <td>{{ municipio_contratista }}</td>
    </tr>
    <tr>
      <th>Teléfono / Celular</th>
      <td>{{ celular_contratista }}</td>
      <th>Correo electrónico</th>
      <td>{{ email_contratista }}</td>
    </tr>
    <tr>
      <th>Banco</th>
      <td>{{ banco_contratista }}</td>
      <th>Tipo de cuenta</th>
      <td>{{ tipo_cuenta }}</td>
    </tr>
    <tr>
      <th>N.° de cuenta</th>
      <td colspan="3">{{ cuenta_banco }}</td>
    </tr>
  </table>
</div>

<!-- ── 3. OBJETO ──────────────────────────────────────────────── -->
<div class="oc-section">
  <div class="oc-section-titulo">3. Objeto</div>
  <p>{{ objeto }}</p>
</div>

<!-- ── 4. CONDICIONES DE PAGO ─────────────────────────────────── -->
<div class="oc-section">
  <div class="oc-section-titulo">4. Condiciones de Pago</div>
  {% set fp = forma_pago or 'Pago único' %}
  <p>
    {% if fp == 'Pagos mensuales' %}
      El pago se realizará en <strong>pagos mensuales</strong>, dentro de los quince (15)
      días hábiles siguientes al vencimiento de cada mes de ejecución,
    {% elif fp == 'Pagos bimestrales' %}
      El pago se realizará en <strong>pagos bimestrales</strong>, dentro de los veinte (20)
      días hábiles siguientes al vencimiento de cada bimestre,
    {% elif fp == 'Pagos trimestrales' %}
      El pago se realizará en <strong>pagos trimestrales</strong>, dentro de los veinte (20)
      días hábiles siguientes al vencimiento de cada trimestre,
    {% elif fp == 'Pagos semestrales' %}
      El pago se realizará en <strong>pagos semestrales</strong>, dentro de los treinta (30)
      días hábiles siguientes al vencimiento de cada semestre,
    {% elif fp == 'Anticipos y saldo' %}
      El pago se realizará mediante <strong>anticipo y pago del saldo</strong>. El anticipo,
      equivalente al cincuenta por ciento (50%) del valor total, se desembolsará dentro de
      los quince (15) días hábiles siguientes a la suscripción del acta de inicio; el saldo
      dentro de los treinta (30) días hábiles siguientes a la entrega total del objeto,
    {% else %}
      El pago se realizará en un <strong>único desembolso</strong>, dentro de los dos (2)
      días hábiles siguientes a la presentación de la factura o cuenta de cobro,
    {% endif %}
    mediante transferencia bancaria a la cuenta <strong>{{ tipo_cuenta }}</strong>
    N.° <strong>{{ cuenta_banco }}</strong> del banco <strong>{{ banco_contratista }}</strong>,
    a nombre de <strong>{{ nombre_contratista }}</strong>, previa suscripción del acta de
    recibido a satisfacción por parte del supervisor.
  </p>
  <p>
    <strong>Plazo de ejecución:</strong> {{ plazo_valor }} {{ plazo_unidad_texto }}. &nbsp;
    <strong>Inicio:</strong> {{ fecha_inicio_larga }}. &nbsp;
    <strong>Terminación:</strong> {{ fecha_fin_larga }}.
  </p>
</div>

<!-- ── Lugar y fecha ──────────────────────────────────────────── -->
<p class="oc-lugar">
  La presente orden es expedida en <strong>{{ inst_municipio }}</strong>,
  el <strong>{{ fecha_inicio_larga }}</strong>.
</p>

<!-- ── FIRMAS ─────────────────────────────────────────────────── -->
<div class="oc-firma-section">
  <table class="oc-firma-tabla">
    <tr>
      <!-- Rector -->
      <td>
        <div class="oc-firma-linea" style="border:none">
          <p class="oc-firma-nombre">{{ rector }}</p>
          <p class="oc-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
          <p class="oc-firma-cargo">Rector(a) — Ordenador del Gasto</p>
          <p class="oc-firma-cargo">{{ inst_nombre }}</p>
          <p class="oc-firma-cargo"><strong>EXPIDIÓ</strong></p>
        </div>
      </td>
      <!-- Contratista -->
      <td>
        <div class="oc-firma-linea" style="border:none">
          {% if es_empresa and rep_legal_nombre %}
            <p class="oc-firma-nombre">{{ rep_legal_nombre }}</p>
            <p class="oc-firma-cargo">C.C. N.° {{ format_id(rep_legal_cc) }}</p>
            <p class="oc-firma-cargo">Representante Legal</p>
            <p class="oc-firma-nombre">{{ nombre_contratista }}</p>
            <p class="oc-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% elif es_empresa %}
            <p class="oc-firma-nombre">{{ nombre_contratista }}</p>
            <p class="oc-firma-cargo">NIT {{ format_id(num_id_contratista) }}</p>
          {% else %}
            <p class="oc-firma-nombre">{{ nombre_contratista }}</p>
            <p class="oc-firma-cargo">{{ tipo_id_contratista }} N.° {{ format_id(num_id_contratista) }}</p>
            <p class="oc-firma-cargo">Cel.: {{ celular_contratista }}</p>
          {% endif %}
          <p class="oc-firma-cargo"><strong>RECIBÍ CONFORME</strong></p>
        </div>
      </td>
    </tr>
  </table>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/orden_pago.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Orden de Pago — {{ numero }}{% endblock %}
{% block doc_titulo %}ORDEN DE PAGO{% endblock %}

{% block extra_css %}
<style>
/* ══════════════════════════════════════════════════════
   ORDEN DE PAGO  ·  estilos pantalla + impresión
   ══════════════════════════════════════════════════════ */

@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}

/* ── Número de contrato ───────────────────────────── */
.op-numero {
  text-align: center;
  font-size: 10.5pt;
  font-weight: bold;
  color: #333;
  margin: -8px 0 14px;
  letter-spacing: 0.5px;
}

/* ── Secciones ────────────────────────────────────── */
.op-section {
  margin: 10px 0 12px;
}
.op-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 8px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.op-section p {
  font-size: 9.5pt;
  text-align: justify;
  margin: 5px 0;
  line-height: 1.45;
}
.op-section ol {
  font-size: 9.5pt;
  padding-left: 22px;
  margin: 5px 0 8px;
  line-height: 1.45;
}
.op-section ol li {
  margin-bottom: 4px;
  text-align: justify;
}

/* ── Tabla de datos generales ─────────────────────── */
table.op-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.op-tabla th {
  background: #eee;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
  width: 22%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.op-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #aaa;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}

/* ── Tablas de datos financieros ──────────────────── */
table.op-data {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9.5pt;
}
table.op-data thead th {
  background: #eee;
  color: #000;
  font-weight: bold;
  padding: 6px 9px;
  border: 1.5px solid #333;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.op-data tbody td {
  padding: 5px 9px;
  border: 1.5px solid #bbb;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
table.op-data tbody tr:nth-child(even) td {
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.op-data tfoot td {
  padding: 6px 9px;
  border: 1.5px solid #bbb;
  background: #eee;
  font-weight: bold;
  font-size: 9.5pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Tabla Imputación Presupuestal ────────────────── */
table.op-imputacion {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 6px;
  font-size: 9pt;
}
table.op-imputacion td,
table.op-imputacion th {
  border: 1.5px solid #999;
  padding: 5px 8px;
  vertical-align: middle;
  line-height: 1.4;
}
.op-imp-titulo {
  background: #eee;
  font-weight: bold;
  font-size: 9.5pt;
  text-align: center;
  letter-spacing: 0.3px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.op-imp-sector-hdr {
  background: #eee;
  font-weight: bold;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.op-imp-col-hdr {
  background: #eee;
  font-weight: bold;
  font-size: 9pt;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.op-imp-total {
  background: #eee;
  font-weight: bold;
  font-size: 9pt;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Caja de autorización ─────────────────────────── */
.op-autorizacion {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 14px;
  margin: 4px 0;
  background: #fff;
  font-size: 9.5pt;
  text-align: justify;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.op-autorizacion p { margin: 4px 0; }

/* ── Firma ────────────────────────────────────────── */
.op-firma-section {
  margin-top: 15px;
}
table.op-firma-tabla {
  width: 100%;
  border-collapse: collapse;
  border: none;
}
table.op-firma-tabla td {
  width: 50%;
  text-align: center;
  padding: 0 12px;
  border: none;
  vertical-align: bottom;
}
.op-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin-top: 10px;
  text-align: center;
}
.op-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
  text-align: center;
}
.op-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  text-align: center;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

{% set supervisor = nombre_supervisor if nombre_supervisor else rector %}
{% set cargo_sup  = cargo_supervisor  if cargo_supervisor  else 'Rector(a)' %}
{% set fp = forma_pago or 'Pago único' %}
{% set _fuentes_map = {'1':'SGP – Calidad','2':'Gratuidad','3':'Recursos Propios','4':'Aportes Departamento','5':'Recursos Propios IE'} %}
{% set _nom_fuente = _fuentes_map[fuente|string] if fuente|string in _fuentes_map else fuente %}

<p class="op-numero">
  Orden de Pago N.° <strong>{{ num_op or num_egreso or '—' }}</strong>
  <span style="font-weight:normal; color:#555; font-size:9pt">&nbsp;·&nbsp; Contrato N.° {{ numero }}</span>
  {% if pago_numero %}
  <br><span style="font-weight:normal; color:#8e44ad; font-size:9pt">{{ pago_nota }}</span>
  {% endif %}
</p>

<!-- ── 1. DATOS GENERALES ─────────────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">1. Datos Generales</div>
  <table class="op-tabla">
    <tr>
      <th>Institución</th>
      <td colspan="3">{{ inst_nombre }}</td>
    </tr>
    <tr>
      <th>NIT Institución</th>
      <td>{{ format_id(inst_nit) }}</td>
      <th>Fecha</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
      <th>Tipo de contrato</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>
        {% if es_empresa %}Empresa / Beneficiario
        {% elif sexo_contratista == 'F' %}Beneficiaria
        {% else %}Beneficiario{% endif %}
      </th>
      <td colspan="3">
        {{ nombre_contratista }}
        {% if es_empresa and rep_legal_nombre %}
          <br><small style="color:#555">Repr. Legal: {{ rep_legal_nombre }}, C.C. {{ format_id(rep_legal_cc) }}</small>
        {% endif %}
      </td>
    </tr>
    <tr>
      <th>Tipo de identificación</th>
      <td>{{ tipo_id_contratista }}</td>
      <th>Número</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Concepto del pago</th>
      <td colspan="3">{{ fp }} — {{ objeto }}</td>
    </tr>
    <tr>
      <th>CDP N.°</th>
      <td>{{ num_cdp }} &nbsp;·&nbsp; {{ fecha_cdp_larga }}</td>
      <th>RP N.°</th>
      <td>{{ num_rp }} &nbsp;·&nbsp; {{ fecha_rp_larga }}</td>
    </tr>
    <tr>
      <th>Rubro presupuestal</th>
      <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
      <th>Fuente</th>
      <td>{{ fuente }} — {{ fuente_nombre }}</td>
    </tr>
    <tr>
      <th>Banco</th>
      <td>{{ banco_contratista }}</td>
      <th>Tipo de cuenta</th>
      <td>{{ tipo_cuenta }}</td>
    </tr>
    <tr>
      <th>N.° de cuenta</th>
      <td colspan="3">{{ cuenta_banco }}</td>
    </tr>
    <tr>
      <th>N.° Factura / Cta. de Cobro</th>
      <td colspan="3">{{ num_factura or '—' }}</td>
    </tr>
  </table>
</div>

<!-- ── 2. RESUMEN DE PAGO ─────────────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">2. Resumen de Pago</div>
  <table class="op-data">
    <thead>
      <tr>
        <th style="width:60%">Concepto</th>
        <th style="width:40%">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Valor total del contrato</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
      </tr>
      <tr>
        <td>Retención en la Fuente (Cta. {{ ret_cuenta or '236505' }})</td>
        <td style="text-align:right">− {{ format_moneda(retencion) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td><strong>VALOR NETO A PAGAR</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(neto) }}</strong></td>
      </tr>
    </tfoot>
  </table>
  <p>
    <strong>Valor neto en letras:</strong> {{ neto_letras }}
  </p>
</div>

<!-- ── 3. IMPUTACIÓN PRESUPUESTAL ─────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">3. Imputación Presupuestal</div>
  <table class="op-imputacion">
    <!-- Título principal -->
    <tr>
      <th colspan="5" class="op-imp-titulo">3) IMPUTACIÓN PRESUPUESTAL</th>
    </tr>
    <!-- Sub-encabezados Sector -->
    <tr>
      <th colspan="2" class="op-imp-sector-hdr" style="text-align:center">SECTOR</th>
      <th colspan="3" class="op-imp-sector-hdr">NOMBRE DEL SECTOR PRESUPUESTAL</th>
    </tr>
    <!-- Datos del sector -->
    <tr>
      <td colspan="2" style="text-align:center;font-weight:bold">01</td>
      <td colspan="3">SEDE PRINCIPAL</td>
    </tr>
    <!-- Fila separadora -->
    <tr>
      <td colspan="5" style="border-left:none;border-right:none;padding:2px">&nbsp;</td>
    </tr>
    <!-- Encabezados de columna -->
    <tr>
      <th class="op-imp-col-hdr" style="width:12%">Rubro Gasto</th>
      <th class="op-imp-col-hdr" style="width:34%">Nombre de rubro presupuestal</th>
      <th class="op-imp-col-hdr" style="width:8%">fuente</th>
      <th class="op-imp-col-hdr" style="width:26%">Nombre de la fuente</th>
      <th class="op-imp-col-hdr" style="width:20%">Valor Obligación</th>
    </tr>
    <!-- Fila de datos -->
    <tr>
      <td style="text-align:center">{{ rubro_codigo }}</td>
      <td>{{ rubro_nombre }}</td>
      <td style="text-align:center">{{ fuente }} — {{ fuente_nombre }}</td>
      <td>{{ _nom_fuente }}</td>
      <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
    </tr>
    <!-- Filas vacías adicionales -->
    <tr>
      <td>&nbsp;</td><td></td><td></td><td></td>
      <td style="text-align:right">{{ format_moneda(0) }}</td>
    </tr>
    <tr>
      <td>&nbsp;</td><td></td><td></td><td></td><td></td>
    </tr>
    <!-- Total -->
    <tr>
      <td colspan="3" style="border:none"></td>
      <td class="op-imp-total">Total Obligación</td>
      <td class="op-imp-total" style="text-align:right">{{ format_moneda(valor_total) }}</td>
    </tr>
  </table>
</div>

<!-- ── 4. REGISTRO CONTABLE ───────────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">4. Registro Contable</div>
  <table class="op-data">
    <thead>
      <tr>
        <th style="width:16%">Código Cuenta</th>
        <th style="width:44%">Nombre de la Cuenta</th>
        <th style="width:20%">DEBE</th>
        <th style="width:20%">HABER</th>
      </tr>
    </thead>
    <tbody>
      <!-- Fila 1: cuenta contable del rubro (= fila 1 del Asiento Contable sección 9) -->
      <tr>
        <td style="text-align:center">{{ cuenta_contable or rubro_codigo }}</td>
        <td>{{ nombre_cuenta or rubro_nombre }}</td>
        <td style="text-align:right">{{ format_moneda(valor_total) }}</td>
        <td style="text-align:right"></td>
      </tr>
      <!-- Fila 2: banco institucional seleccionado -->
      <tr>
        <td style="text-align:center">111005</td>
        <td>{{ banco_sel or 'BANCOS — Cuenta Institucional' }}{% if cta_sel %} — Cta. {{ cta_sel }}{% endif %}</td>
        <td style="text-align:right"></td>
        <td style="text-align:right">{{ format_moneda(neto) }}</td>
      </tr>
      <!-- Fila 3: retención en la fuente -->
      <tr>
        <td style="text-align:center">{{ ret_cuenta or '236505' }}</td>
        <td>{{ ret_concepto or 'Retención en la Fuente por Pagar' }}</td>
        <td style="text-align:right"></td>
        <td style="text-align:right">{{ format_moneda(retencion) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right"><strong>TOTALES:</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
        <td style="text-align:right"><strong>{{ format_moneda(valor_total) }}</strong></td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- ── 5. SOPORTE DOCUMENTAL ─────────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">5. Soporte Documental</div>
  <p>Se adjuntan los siguientes documentos soporte:</p>
  <ol>
    <li>Factura o cuenta de cobro del contratista.</li>
    <li>Acta de recibido a satisfacción suscrita por el supervisor.</li>
    <li>Informe de supervisión del contrato N.° {{ numero }}.</li>
    <li>Informe de actividades del contratista.</li>
    <li>CDP N.° {{ num_cdp }} del {{ fecha_cdp_larga }}.</li>
    <li>RP N.° {{ num_rp }} del {{ fecha_rp_larga }}.</li>
    <li>Comprobante de pago de seguridad social (cuando aplique).</li>
    <li>Certificación bancaria del beneficiario.</li>
  </ol>
</div>

<!-- ── 6. AUTORIZACIÓN ────────────────────────────────────────── -->
<div class="op-section">
  <div class="op-section-titulo">6. Autorización de Pago</div>
  <div class="op-autorizacion">
    <p>
      Revisada la documentación soporte y verificado el cumplimiento del objeto
      contractual del contrato N.° <strong>{{ numero }}</strong>, se autoriza el
      pago mediante transferencia a la cuenta <strong>{{ tipo_cuenta }}</strong>
      N.° <strong>{{ cuenta_banco }}</strong> del banco
      <strong>{{ banco_contratista }}</strong>, a nombre de
      {% if es_empresa %}la empresa contratista
      {% elif sexo_contratista == 'F' %}la contratista
      {% else %}el contratista{% endif %}
      <strong>{{ nombre_contratista }}</strong>, por los siguientes valores:
    </p>
    <p>
      Valor bruto: <strong>{{ format_moneda(valor_total) }}</strong> —
      Retención en la Fuente (Cta. {{ ret_cuenta or '236505' }}): <strong>{{ format_moneda(retencion) }}</strong> —
      <strong>Valor neto a pagar: {{ format_moneda(neto) }}</strong>.
    </p>
  </div>
</div>

<!-- ── FIRMA ──────────────────────────────────────────────────── -->
<div class="op-firma-section">
  <div class="op-firma-linea" style="width:60%; margin:10px auto 0">
    <p class="op-firma-nombre">{{ rector }}</p>
    <p class="op-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
    <p class="op-firma-cargo">Rector(a) — Ordenador del Gasto</p>
    <p class="op-firma-cargo">{{ inst_nombre }}</p>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/rp.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}RP N.° {{ num_rp }} — {{ numero }}{% endblock %}
{% block doc_titulo %}REGISTRO PRESUPUESTAL{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     RP — estilos específicos de impresión
     ══════════════════════════════════════════════ */

  .rp-numero {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    color: #333;
    letter-spacing: 1px;
    margin: 8px 0 14px;
  }

  /* Tabla cabecera institucional */
  table.rp-info {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
    font-size: 9.5pt;
    }
  table.rp-info th {
    background: #f5f5f5;
    font-weight: bold;
    padding: 4px 8px;
    border: 1px solid #bbb;
    width: 20%;
    text-align: left;
    white-space: nowrap;
  }
  table.rp-info td {
    padding: 4px 8px;
    border: 1px solid #bbb;
  }

  /* Secciones genéricas */
  .rp-section {
    margin: 12px 0;
    }
  .rp-section-titulo {
    font-size: 10pt;
    font-weight: bold;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border-left: 4px solid #333;
    margin-bottom: 7px;
  }
  .rp-section p {
    font-size: 10pt;
    text-align: justify;
    margin: 6px 0;
    line-height: 1.45;
  }

  /* Tabla detalle presupuestal */
  table.rp-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px;
    font-size: 9.5pt;
    }
  table.rp-table thead th {
    background: #eee;
    color: #000;
    padding: 5px 7px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #999;
  }
  table.rp-table thead th.left { text-align: left; }
  table.rp-table tbody td {
    padding: 5px 7px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  table.rp-table tfoot td {
    padding: 5px 7px;
    border: 1px solid #aaa;
    font-weight: bold;
    background: #eee;
  }
  .rp-table td.right  { text-align: right; font-weight: bold; }
  .rp-table td.center { text-align: center; }

  /* Valor destacado */
  .rp-valor-box {
    border: 2px solid #333;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 10px 0;
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    color: #333;
    }
  .rp-valor-box .letras {
    font-size: 9.5pt;
    font-weight: normal;
    color: #333;
    display: block;
    margin-top: 3px;
  }

  /* Firmas dos columnas */
  .rp-firma-section {
    margin-top: 15px;
  }
  .rp-firma-grid {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 10px;
  }
  .rp-firma-block {
    flex: 0 1 45%;
    text-align: center;
  }
  .rp-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
  }
  .rp-firma-block p {
    font-size: 10pt;
    margin: 2px 0;
  }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Tabla de datos institucionales -->
<table class="rp-info">
  <tr>
    <th>Institución</th>
    <td colspan="3">{{ inst_nombre }}</td>
  </tr>
  <tr>
    <th>NIT</th>
    <td>{{ format_id(inst_nit) }}</td>
    <th>Fecha de Expedición</th>
    <td>{{ fecha_rp_larga if fecha_rp_larga is defined else fecha_rp }}</td>
  </tr>
  <tr>
    <th>Municipio</th>
    <td>{{ inst_municipio }}, {{ inst_departamento }}</td>
    <th>N.° RP</th>
    <td><strong>{{ num_rp }}</strong></td>
  </tr>
  <tr>
    <th>CDP de Respaldo</th>
    <td>{{ num_cdp }}</td>
    <th>Fecha CDP</th>
    <td>{{ fecha_cdp_larga }}</td>
  </tr>
</table>

<!-- Párrafo de certificación -->
<div class="rp-section">
  <p>
    El (la) suscrito(a) Rector(a), en uso de sus facultades legales y en especial
    las conferidas por el Decreto Ley 111 de 1996 (artículo 71), y de conformidad
    con el Decreto 4791 de 2008 y el artículo 11 de la Ley 715 de 2001, certifica
    que, una vez revisados los saldos presupuestales correspondientes a la vigencia
    <strong>{{ anio }}</strong> y elaborado el Certificado de Disponibilidad
    Presupuestal (CDP) previo, se expide el presente Registro Presupuestal (RP)
    dejando afectado el presupuesto del Fondo de Servicios Educativos – FOSE, así:
  </p>
</div>

<!-- Datos del Compromiso Contractual -->
<div class="rp-section">
  <div class="rp-section-titulo">Datos del Compromiso Contractual</div>
  <table class="rp-info">
    <tr>
      <th>Contrato N.°</th>
      <td>{{ numero }}</td>
      <th>Tipo de Contrato</th>
      <td>{{ tipo_contrato }}</td>
    </tr>
    <tr>
      <th>Contratista</th>
      <td>{{ nombre_contratista }}</td>
      <th>{{ tipo_id_contratista }}</th>
      <td>{{ format_id(num_id_contratista) }}</td>
    </tr>
    <tr>
      <th>Objeto</th>
      <td colspan="3">{{ objeto }}</td>
    </tr>
    <tr>
      <th>Fecha de Inicio</th>
      <td>{{ fecha_inicio_larga }}</td>
      <th>Fecha de Terminación</th>
      <td>{{ fecha_fin_larga }}</td>
    </tr>
    <tr>
      <th>Duración</th>
      <td colspan="3">{{ plazo_valor }} {{ plazo_unidad_texto }}</td>
    </tr>
  </table>
</div>

<!-- Valor comprometido -->
<div class="rp-valor-box">
  {{ format_moneda(valor_total) }}
  <span class="letras">{{ valor_letras }}</span>
</div>

<!-- Detalle Presupuestal -->
<div class="rp-section">
  <div class="rp-section-titulo">Detalle del Registro Presupuestal</div>
  <table class="rp-table">
    <thead>
      <tr>
        <th class="left" style="width:45%">Rubro Presupuestal</th>
        <th style="width:25%">Fuente de Financiación</th>
        <th style="width:30%; text-align:right">Valor Comprometido</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ rubro_codigo }} — {{ rubro_nombre }}</td>
        <td class="center">{{ fuente }} — {{ fuente_nombre }}</td>
        <td class="right">{{ format_moneda(valor_total) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="text-align:right">TOTAL COMPROMETIDO:</td>
        <td class="right">{{ format_moneda(valor_total) }}</td>
      </tr>
    </tfoot>
  </table>
</div>

<!-- Certificación -->
<div class="rp-section">
  <div class="rp-section-titulo">Certificación</div>
  <p>
    El (la) suscrito(a) Rector(a) {{ inst_del }} <strong>{{ inst_nombre }}</strong>,
    NIT <strong>{{ format_id(inst_nit) }}</strong>, certifica que se ha efectuado el
    <strong>REGISTRO PRESUPUESTAL</strong> del compromiso contractual descrito,
    afectando definitivamente el presupuesto del Fondo de Servicios Educativos – FOSE
    por la suma de <strong>{{ format_moneda(valor_total) }}</strong>
    (<strong>{{ valor_letras }}</strong>), de conformidad con el
    CDP N.° <strong>{{ num_cdp }}</strong> de fecha
    <strong>{{ fecha_cdp_larga }}</strong>.
  </p>
  <p>
    Con la expedición del presente Registro Presupuestal queda en firme el compromiso
    presupuestal de la institución frente al contratista
    <strong>{{ nombre_contratista }}</strong>, en los términos del contrato
    N.° <strong>{{ numero }}</strong>. Este documento se expide en cumplimiento de lo
    dispuesto en el Decreto Ley 111 de 1996 y demás normas del Estatuto Orgánico del
    Presupuesto.
  </p>
</div>

<!-- Firmas -->
<div class="rp-firma-section">
  <div class="rp-firma-grid">
    <div class="rp-firma-block">
      <div class="rp-firma-linea" style="border:none">
        <p><strong>{{ rector | upper }}</strong></p>
        <p>C.C. {{ format_id(cc_rector) }}</p>
        <p>Rector(a) — Ordenador del Gasto</p>
        <p>{{ inst_nombre }}</p>
      </div>
    </div>
  </div>
</div>

{% endblock %}
`;

DOC_TEMPLATES["docs/solicitud_cdp.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Solicitud CDP — {{ numero }}{% endblock %}
{% block doc_titulo %}SOLICITUD DE CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL{% endblock %}

{% block extra_css %}
<style>
  /* ══════════════════════════════════════════════
     Solicitud CDP — estilos específicos de impresión
     ══════════════════════════════════════════════ */

  .sc-lugar-fecha {
    text-align: right;
    font-size: 10pt;
    margin: 10px 0 16px;
  }

  .sc-destinatario {
    font-size: 10pt;
    margin-bottom: 14px;
    line-height: 1.45;
  }
  .sc-destinatario p { margin: 1px 0; }

  .sc-asunto {
    font-size: 10pt;
    margin-bottom: 14px;
    border-left: 4px solid #333;
    padding: 5px 8px;
    background: #fff;
  }

  .sc-cuerpo {
    font-size: 10pt;
    text-align: justify;
    line-height: 1.45;
  }
  .sc-cuerpo p { margin: 8px 0; }

  .sc-subtitulo {
    font-size: 10.5pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    background: #eee;
    padding: 5px 8px;
    border: 1px solid #333;
    margin: 14px 0 4px;
    page-break-after: avoid;
    letter-spacing: .5px;
  }

  .sc-bloque {
    font-size: 10pt;
    text-align: justify;
    line-height: 1.45;
    border: 1px solid #ccc;
    border-top: none;
    padding: 8px 10px;
    margin-bottom: 10px;
    }

  .sc-valor-linea {
    font-size: 10pt;
    margin: 6px 0 2px;
    padding: 0 2px;
  }

  /* Tabla expediente */
  table.sc-exp-table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 12px;
    font-size: 9.5pt;
    }
  table.sc-exp-table td {
    padding: 4px 8px;
    border: 1px solid #ccc;
    vertical-align: top;
    line-height: 1.35;
  }
  table.sc-exp-table td.sc-exp-label {
    font-weight: bold;
    background: #f5f5f5;
    width: 18%;
    white-space: nowrap;
  }

  /* Firma */
  .sc-firma-section {
    margin-top: 15px;
  }
  .sc-firma-linea {
    border-top: none;
    margin-top: 10px;
    padding-top: 5px;
    width: 260px;
  }
  .sc-firma-section p {
    font-size: 10pt;
    margin: 2px 0;
  }

  @media print {
  }
</style>
{% endblock %}

{% block doc_content %}

<!-- Lugar y fecha: fecha del CDP -->
<div class="sc-lugar-fecha">
  {{ inst_municipio }},
  {% if fecha_cdp_larga is defined and fecha_cdp_larga %}
    {{ fecha_cdp_larga }}
  {% else %}
    {{ hoy_largo }}
  {% endif %}
</div>

<!-- Destinatario -->
<div class="sc-destinatario">
  <p><strong>Señor(a):</strong></p>
  <p><strong>TESORERO(A) / ALMACENISTA</strong></p>
  <p>{{ inst_nombre }}</p>
  <p>{{ inst_municipio }}, {{ inst_departamento }}</p>
</div>

<!-- Asunto -->
<div class="sc-asunto">
  <strong>Asunto:</strong> Solicitud de Certificado de Disponibilidad Presupuestal
  para el proceso contractual N.° {{ numero }}.
</div>

<!-- Cuerpo -->
<div class="sc-cuerpo">

  <p>
    En atención al Plan Anual de Adquisiciones previsto para la vigencia
    <strong>{{ anio }}</strong>, aprobado por el Consejo Directivo y de conformidad
    con lo dispuesto para el manejo de los recursos del Fondo de Servicios
    Educativos, me permito solicitar la expedición del Certificado de
    Disponibilidad Presupuestal, previa verificación de la existencia de recursos
    en tesorería, de acuerdo con la siguiente información:
  </p>

  <!-- OBJETO -->
  <div class="sc-subtitulo">Objeto</div>
  <div class="sc-bloque">
    {{ objeto }}
  </div>

  <p class="sc-valor-linea">
    <strong>Valor del contrato:</strong> {{ format_moneda(valor_total) }}
    &nbsp;({{ valor_letras }})
  </p>

  <!-- RUBRO -->
  <div class="sc-subtitulo">Rubro</div>
  <div class="sc-bloque">
    <strong>{{ rubro_codigo }}</strong> — {{ rubro_nombre }}<br>
    <strong>Fuente de financiación:</strong> {{ fuente }} — {{ fuente_nombre }}
  </div>

  <p>
    En cumplimiento de la autonomía de gestión de los Fondos de Servicios Educativos
    (FOSE), se emite la presente certificación de disponibilidad de recursos como paso
    previo al proceso de selección, según lo estipulado en el Decreto 1075 de 2015
    y el manual de contratación de la institución.
  </p>

  <p>Agradezco su pronta atención a la presente solicitud.</p>

  <p>Cordialmente,</p>
</div>

<!-- Firma -->
<div class="sc-firma-section">
  <div class="sc-firma-linea" style="border:none">
    <p><strong>{{ rector | upper }}</strong></p>
    <p>C.C. {{ format_id(cc_rector) }}</p>
    <p>Rector(a) — Ordenador del Gasto</p>
    <p>{{ inst_nombre }}</p>
  </div>
</div>

{% endblock %}
`;

/* ══════════════════════════════════════════════════════════
   COMPROBANTE DE EGRESO DIAN / IMPUESTOS
══════════════════════════════════════════════════════════ */
DOC_TEMPLATES["docs/egreso_dian.html"] = `{% extends "docs/base_doc.html" %}

{% block doc_title %}Comprobante de Egreso — {{ num_egreso }}{% endblock %}
{% block doc_titulo %}COMPROBANTE DE EGRESO{% endblock %}

{% block extra_css %}
<style>
@page {
  size: letter portrait;
  margin: 12mm 14mm 10mm 18mm;
}
.ed-numero {
  text-align: center;
  font-size: 12pt;
  font-weight: bold;
  margin: -4px 0 14px;
  color: #333;
}
.ed-section {
  margin: 10px 0 12px;
}
.ed-section-titulo {
  font-size: 10pt;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eee;
  padding: 5px 10px;
  border-left: 5px solid #333;
  margin-bottom: 6px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ed-tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 4px 0 8px;
  font-size: 9.5pt;
}
table.ed-tabla th {
  background: #f5f5f5;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #999;
  text-align: left;
  width: 25%;
  white-space: nowrap;
  vertical-align: top;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ed-tabla td {
  padding: 5px 9px;
  border: 1.5px solid #999;
  vertical-align: top;
  font-size: 9.5pt;
  line-height: 1.4;
}
.ed-valor-box {
  border: 2px solid #333;
  border-radius: 3px;
  padding: 10px 16px;
  margin: 8px 0;
  text-align: center;
}
.ed-valor-monto {
  font-size: 14pt;
  font-weight: bold;
  color: #333;
}
.ed-valor-letras {
  font-size: 9pt;
  color: #555;
  font-style: italic;
  margin-top: 4px;
}
table.ed-contable {
  width: 100%;
  border-collapse: collapse;
  margin: 4px 0 8px;
  font-size: 9.5pt;
}
table.ed-contable th {
  background: #f5f5f5;
  font-weight: bold;
  padding: 5px 9px;
  border: 1.5px solid #999;
  text-align: center;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
table.ed-contable td {
  padding: 5px 9px;
  border: 1.5px solid #999;
  font-size: 9.5pt;
}
.ed-observaciones {
  font-size: 9pt;
  color: #444;
  margin: 8px 0 4px;
  font-style: italic;
}
.ed-firma-section {
  margin-top: 15px;
}
table.ed-firma-tabla {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  border: none;
}
table.ed-firma-tabla td {
  text-align: center;
  padding: 0;
  border: none;
  vertical-align: bottom;
  width: 50%;
}
.ed-firma-linea {
  border-top: none;
  padding-top: 6px;
  margin: 10px 30px 0;
}
.ed-firma-nombre {
  font-size: 9.5pt;
  font-weight: bold;
  margin: 2px 0;
}
.ed-firma-cargo {
  font-size: 8.5pt;
  margin: 1px 0;
  color: #222;
}
</style>
{% endblock %}

{% block doc_content %}

<p class="ed-numero">Egreso N.° {{ num_egreso }}</p>

<!-- 1. DATOS DEL PAGO -->
<div class="ed-section">
  <div class="ed-section-titulo">1. Datos del Pago</div>
  <table class="ed-tabla">
    <tr>
      <th>Concepto</th>
      <td colspan="3">{{ concepto }}</td>
    </tr>
    <tr>
      <th>Período</th>
      <td>{{ periodo }}</td>
      <th>Fecha</th>
      <td>{{ fecha_larga }}</td>
    </tr>
    <tr>
      <th>N° Formulario DIAN</th>
      <td colspan="3">{{ formulario_dian }}</td>
    </tr>
  </table>
</div>

<!-- 2. VALOR -->
<div class="ed-section">
  <div class="ed-section-titulo">2. Valor</div>
  <div class="ed-valor-box">
    <div class="ed-valor-monto">{{ valor_fmt }}</div>
    <div class="ed-valor-letras">({{ valor_letras }})</div>
  </div>
</div>

<!-- 3. BENEFICIARIO Y PAGO -->
<div class="ed-section">
  <div class="ed-section-titulo">3. Beneficiario y Forma de Pago</div>
  <table class="ed-tabla">
    <tr>
      <th>Beneficiario</th>
      <td colspan="3">{{ beneficiario }}</td>
    </tr>
    <tr>
      <th>NIT</th>
      <td>{{ nit_beneficiario_fmt }}</td>
      <th>Medio de Pago</th>
      <td>{{ medio_pago }}</td>
    </tr>
    <tr>
      <th>Banco Origen</th>
      <td>{{ banco_origen }} — Cta. {{ cuenta_banco_inst }}</td>
      <th>Comprobante Bancario</th>
      <td>{{ num_comprobante_banco }}</td>
    </tr>
  </table>
</div>

<!-- 4. REGISTRO CONTABLE -->
<div class="ed-section">
  <div class="ed-section-titulo">4. Registro Contable</div>
  <table class="ed-contable">
    <thead>
      <tr>
        <th style="width:20%">Cuenta</th>
        <th>Concepto</th>
        <th style="width:20%">Débito</th>
        <th style="width:20%">Crédito</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">{{ cuenta_contable }}</td>
        <td>{{ nombre_cuenta }}</td>
        <td class="text-end">{{ valor_fmt }}</td>
        <td></td>
      </tr>
      <tr>
        <td class="text-center">1110</td>
        <td>Bancos y Corporaciones</td>
        <td></td>
        <td class="text-end">{{ valor_fmt }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="font-weight:bold;background:#f5f5f5">
        <td colspan="2" class="text-end">TOTALES</td>
        <td class="text-end">{{ valor_fmt }}</td>
        <td class="text-end">{{ valor_fmt }}</td>
      </tr>
    </tfoot>
  </table>
</div>

{% if observaciones %}
<p class="ed-observaciones"><strong>Observaciones:</strong> {{ observaciones }}</p>
{% endif %}

<!-- FIRMAS -->
<div class="ed-firma-section">
  <div style="text-align:center;max-width:320px;margin:0 auto">
    <div class="ed-firma-linea" style="border:none">
      <p class="ed-firma-nombre">{{ rector }}</p>
      <p class="ed-firma-cargo">C.C. N.° {{ format_id(cc_rector) }}</p>
      <p class="ed-firma-cargo">Rector(a)</p>
      <p class="ed-firma-cargo">Ordenador del Gasto</p>
    </div>
  </div>
</div>

{% endblock %}
`;

