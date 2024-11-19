from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import json
import os

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('/tmp/invoice.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_no TEXT,
                  invoice_date TEXT,
                  transport_name TEXT,
                  gcn TEXT,
                  place_of_supply TEXT,
                  receiver_name TEXT,
                  receiver_address TEXT,
                  receiver_gst TEXT,
                  receiver_state TEXT,
                  receiver_code TEXT,
                  items TEXT,
                  bank_details TEXT,
                  tax_details TEXT,
                  number_of_bags INTEGER,
                  pdf_link TEXT)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    query = request.args.get('query', '')
    date_filter = request.args.get('invoice_date', '')

    conn = sqlite3.connect('/tmp/invoice.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    sql_query = "SELECT * FROM invoices WHERE 1=1"
    params = []

    if query:
        sql_query += " AND (invoice_no LIKE ? OR receiver_name LIKE ? OR receiver_gst LIKE ?)"
        query_param = f"%{query}%"
        params.extend([query_param, query_param, query_param])

    if date_filter:
        sql_query += " AND invoice_date = ?"
        params.append(date_filter)

    c.execute(sql_query, params)
    invoices_data = c.fetchall()
    conn.close()

    invoices = []
    for invoice in invoices_data:
        invoice_dict = dict(invoice)
        
        # Check if 'items' and 'tax_details' are strings before parsing them as JSON
        if isinstance(invoice_dict['items'], str):
            invoice_dict['items'] = json.loads(invoice_dict['items'])
        if isinstance(invoice_dict['tax_details'], str):
            invoice_dict['tax_details'] = json.loads(invoice_dict['tax_details'])
        
        invoices.append(invoice_dict)

    return jsonify(invoices)


@app.route('/api/invoice/<int:invoice_id>/download', methods=['GET'])
def download_invoice(invoice_id):
    conn = sqlite3.connect('/tmp/invoice.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    invoice = c.fetchone()
    conn.close()

    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    invoice_data = dict(invoice)
    invoice_data['items'] = json.loads(invoice_data['items'])
    invoice_data['tax_details'] = json.loads(invoice_data['tax_details'])

    # Save as JSON file
    file_path = f"/tmp/invoice_{invoice_id}.json"
    with open(file_path, 'w') as f:
        json.dump(invoice_data, f)

    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
