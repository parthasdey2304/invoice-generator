from flask import Flask, render_template, request, jsonify
import sqlite3
import json
import os

app = Flask(__name__)

# Database setup
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
    conn = sqlite3.connect('/tmp/invoice.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM invoices ORDER BY invoice_date DESC")
    invoices_data = c.fetchall()
    conn.close()

    invoices = []
    for invoice in invoices_data:
        invoice_dict = dict(invoice)
        invoice_dict['items'] = json.loads(invoice_dict['items'])
        invoice_dict['tax_details'] = json.loads(invoice_dict['tax_details'])
        invoices.append(invoice_dict)

    return render_template("index.html", invoices=invoices)

@app.route('/api/invoice', methods=['POST'])
def create_invoice():
    data = request.json

    # Convert items, bank_details, and tax_details to JSON strings
    items_json = json.dumps(data['items'])
    bank_details_json = json.dumps(data['bankDetails'])
    tax_details_json = json.dumps(data['taxDetails'])

    conn = sqlite3.connect('/tmp/invoice.db')
    c = conn.cursor()
    
    try:
        c.execute('''INSERT INTO invoices 
                     (invoice_no, invoice_date, transport_name, gcn, place_of_supply,
                      receiver_name, receiver_address, receiver_gst, receiver_state,
                      receiver_code, items, bank_details, tax_details, number_of_bags, pdf_link)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (data['invoiceNo'], data['invoiceDate'], data['transportName'],
                   data['gcn'], data['placeOfSupply'], data['receiverName'],
                   data['receiverAddress'], data['receiverGST'], data['receiverState'],
                   data['receiverCode'], items_json, bank_details_json, tax_details_json,
                   data['numberOfBags'], data['pdfLink']))
        
        conn.commit()
        return jsonify({"message": "Invoice created successfully"}), 201
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

@app.template_filter('from_json')
def from_json(value):
    return json.loads(value)

if __name__ == '__main__':
    app.run(debug=True)
