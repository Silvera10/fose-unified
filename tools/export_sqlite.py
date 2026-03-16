#!/usr/bin/env python3
"""Exporta datos de una base SQLite de contratos a JSON para FOSE Unified."""
import sqlite3, json, sys

def export_db(db_path, out_path='sqlite_export.json'):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    data = {}
    for table in ['instituciones', 'contratos', 'personas']:
        cur.execute(f'SELECT * FROM {table}')
        data[table] = [dict(row) for row in cur.fetchall()]
    conn.close()
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Exportado: {len(data["instituciones"])} instituciones, '
          f'{len(data["contratos"])} contratos, {len(data["personas"])} personas -> {out_path}')

if __name__ == '__main__':
    db = sys.argv[1] if len(sys.argv) > 1 else 'contratos.db'
    out = sys.argv[2] if len(sys.argv) > 2 else 'sqlite_export.json'
    export_db(db, out)
