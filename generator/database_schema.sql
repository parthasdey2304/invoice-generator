-- Invoice Generator Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create invoices table
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    transport_name TEXT,
    gcn TEXT,
    place_of_supply TEXT,
    number_of_bags INTEGER DEFAULT 0,
    pdf_link TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0,
    receiver_id UUID REFERENCES receivers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receivers table
CREATE TABLE receivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    gst_in TEXT,
    state TEXT,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    hsn_code TEXT,
    quantity DECIMAL(10,2) DEFAULT 0,
    rate DECIMAL(10,2) DEFAULT 0,
    amount DECIMAL(10,2) DEFAULT 0
);

-- Create tax_details table
CREATE TABLE tax_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    cgst DECIMAL(10,2) DEFAULT 0,
    sgst DECIMAL(10,2) DEFAULT 0,
    igst DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    less_discount DECIMAL(10,2) DEFAULT 0,
    rounded_off DECIMAL(10,2) DEFAULT 0,
    show_cgst BOOLEAN DEFAULT false,
    show_sgst BOOLEAN DEFAULT false,
    show_igst BOOLEAN DEFAULT false,
    show_other_charges BOOLEAN DEFAULT false,
    show_less_discount BOOLEAN DEFAULT false,
    show_rounded_off BOOLEAN DEFAULT false
);

-- Create bank_details table
CREATE TABLE bank_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bank_name TEXT NOT NULL,
    branch TEXT,
    account_no TEXT UNIQUE,
    ifsc_code TEXT,
    is_default BOOLEAN DEFAULT false
);

-- Create item_suggestions table
CREATE TABLE item_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description TEXT UNIQUE NOT NULL,
    hsn_code TEXT,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_field_history table
CREATE TABLE form_field_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_name TEXT NOT NULL,
    field_value TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_name, field_value)
);

-- Add foreign key constraint for receiver_id in invoices
ALTER TABLE invoices 
ADD CONSTRAINT fk_invoices_receiver 
FOREIGN KEY (receiver_id) REFERENCES receivers(id);

-- Create indexes for better performance
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_receiver ON invoices(receiver_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_tax_details_invoice ON tax_details(invoice_id);
CREATE INDEX idx_item_suggestions_usage ON item_suggestions(usage_count DESC);
CREATE INDEX idx_form_field_history_field ON form_field_history(field_name, usage_count DESC);

-- Insert default bank details
INSERT INTO bank_details (bank_name, branch, account_no, ifsc_code, is_default) VALUES
('STATE BANK OF INDIA', 'TANGRA', '43776936082', 'SBIN0003737', true)
ON CONFLICT (account_no) DO NOTHING;

-- Insert initial item suggestions (from existing hardcoded list)
INSERT INTO item_suggestions (description, hsn_code, usage_count) VALUES
('2 MODULAR CONCEALED MS BOXES', '853810', 1),
('3 MODULAR CONCEALED MS BOXES', '853810', 1),
('4 MODULAR CONCEALED MS BOXES', '853810', 1),
('6 MODULAR CONCEALED MS BOXES', '853810', 1),
('8 MODULAR CONCEALED MS BOXES', '853810', 1),
('12 MODULAR CONCEALED MS BOXES', '853810', 1),
('16 MODULAR CONCEALED MS BOXES', '853810', 1),
('18 MODULAR CONCEALED MS BOXES', '853810', 1),
('3 X 3 X 2 CONCEALED MS BOXES', '853810', 1),
('4 X 4 X 2 CONCEALED MS BOXES', '853810', 1),
('6 X 4 X 2 CONCEALED MS BOXES', '853810', 1),
('7 X 4 X 2 CONCEALED MS BOXES', '853810', 1),
('8 X 6 X 2 CONCEALED MS BOXES', '853810', 1),
('10 X 12 X 2 CONCEALED MS BOXES', '853810', 1),
('4 X 8 X 2 CONCEALED MS BOXES', '853810', 1),
('4 X 10 X 2 CONCEALED MS BOXES', '853810', 1),
('8 X 6 X 3 CONCEALED MS BOXES', '853810', 1),
('8 X 10 X 3 CONCEALED MS BOXES', '853810', 1),
('8 X 10 X 2 CONCEALED MS BOXES', '853810', 1),
('8 X 12 X 3 CONCEALED MS BOXES', '853810', 1),
('8 X 12 X 2 CONCEALED MS BOXES', '853810', 1),
('4 X 12 X 2 CONCEALED MS BOXES', '853810', 1),
('6 X 4 X 2½ CONCEALED MS BOXES', '853810', 1),
('4 X 4 X 2½ CONCEALED MS BOXES', '853810', 1),
('8 X 6 X 2½ CONCEALED MS BOXES', '853810', 1),
('12 X 14 X 2 CONCEALED MS BOXES', '853810', 1),
('10 X 14 X 2 CONCEALED MS BOXES', '853810', 1),
('FAN BOX WITH ROD', '853810', 1),
('3 LED BOWL', '853810', 1),
('6 LED BOWL', '853810', 1),
('4.5 LED BOWL', '853810', 1),
('12 LED BOWL', '853810', 1),
('8 SQUARE CONCEALED MS BOXES', '853810', 1),
('HEXAGON FAN BOX', '853810', 1),
('HEXAGON FAN BOX WITH ROD', '853810', 1)
ON CONFLICT (description) DO NOTHING;

-- Enable Row Level Security (RLS) - Optional for future use
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_field_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (modify as needed for authentication)
CREATE POLICY "Enable all operations for public" ON invoices FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON receivers FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON invoice_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON tax_details FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON bank_details FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON item_suggestions FOR ALL USING (true);
CREATE POLICY "Enable all operations for public" ON form_field_history FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at 
BEFORE UPDATE ON invoices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
