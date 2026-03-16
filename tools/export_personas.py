#!/usr/bin/env python3
"""
Exporta la tabla 'personas' de la base SQLite del sistema_contractual a JSON.

Uso:
  python3 export_personas.py                      # usa ruta por defecto
  python3 export_personas.py /ruta/a/contratos.db # ruta personalizada
  python3 export_personas.py /ruta/a/contratos.db personas.json  # con archivo de salida

El JSON resultante se puede importar directamente en FOSE Unified
desde la pagina Directorio de Personas > boton "Importar JSON".
"""
import sqlite3, json, sys, os

# Ruta por defecto del sistema_contractual
DEFAULT_DB = os.path.expanduser(
    '~/Library/CloudStorage/OneDrive-Personal/Instituciones Educativas/'
    'Presupuestales_Programas/sistema_contractual/instance/contratos.db'
)

def export_personas(db_path, out_path='personas.json'):
    if not os.path.isfile(db_path):
        # Intentar también sin /instance/
        alt = db_path.replace('/instance/', '/')
        if os.path.isfile(alt):
            db_path = alt
        else:
            print(f'ERROR: No se encontro la base de datos en:\n  {db_path}')
            sys.exit(1)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    personas = [dict(row) for row in
                conn.execute('SELECT * FROM personas ORDER BY nombres_apellidos COLLATE NOCASE').fetchall()]
    conn.close()

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(personas, f, ensure_ascii=False, indent=2)

    print(f'Exportadas {len(personas)} personas -> {out_path}')
    for p in personas:
        print(f'  - {p.get("nombres_apellidos","?")} ({p.get("tipo_documento","CC")} {p.get("num_documento","")})')

if __name__ == '__main__':
    db = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB
    out = sys.argv[2] if len(sys.argv) > 2 else 'personas.json'
    export_personas(db, out)
