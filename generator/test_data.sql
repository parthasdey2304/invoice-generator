-- Test Data for Invoice Generator
-- Run this after running the main setup script to add sample data

-- Insert a sample receiver
INSERT INTO receivers (id, name, address, gst_in, state, code) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ACME Corporation', '123 Business Street, Tech City', '22AAAAA0000A1Z5', 'Gujarat', 'GJ')
ON CONFLICT (id) DO NOTHING;

-- Insert a sample invoice
INSERT INTO invoices (
    id, 
    invoice_no, 
    invoice_date, 
    transport_name, 
    gcn, 
    place_of_supply, 
    number_of_bags, 
    total_amount, 
    receiver_id
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    'INV-2025-001',
    '2025-06-20',
    'Express Transport',
    'GCN123456',
    'Gujarat',
    5,
    15000.00,
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (invoice_no) DO NOTHING;

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, description, hsn_code, quantity, rate, amount) VALUES
('660e8400-e29b-41d4-a716-446655440001', '4 MODULAR CONCEALED MS BOXES', '853810', 10, 500.00, 5000.00),
('660e8400-e29b-41d4-a716-446655440001', '6 MODULAR CONCEALED MS BOXES', '853810', 15, 600.00, 9000.00)
ON CONFLICT DO NOTHING;

-- Insert sample tax details
INSERT INTO tax_details (
    invoice_id, 
    cgst, 
    sgst, 
    igst, 
    other_charges, 
    less_discount, 
    rounded_off,
    show_cgst,
    show_sgst,
    show_igst
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    630.00,
    630.00,
    0.00,
    100.00,
    0.00,
    0.00,
    true,
    true,
    false
)
ON CONFLICT DO NOTHING;

-- Insert another sample invoice for better testing
INSERT INTO invoices (
    id, 
    invoice_no, 
    invoice_date, 
    transport_name, 
    gcn, 
    place_of_supply, 
    number_of_bags, 
    total_amount, 
    receiver_id
) VALUES (
    '770e8400-e29b-41d4-a716-446655440002',
    'INV-2025-002',
    '2025-06-19',
    'Fast Delivery',
    'GCN789012',
    'Gujarat',
    3,
    8500.00,
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (invoice_no) DO NOTHING;

-- Insert items for second invoice
INSERT INTO invoice_items (invoice_id, description, hsn_code, quantity, rate, amount) VALUES
('770e8400-e29b-41d4-a716-446655440002', '8 MODULAR CONCEALED MS BOXES', '853810', 12, 700.00, 8400.00)
ON CONFLICT DO NOTHING;

-- Insert tax details for second invoice
INSERT INTO tax_details (
    invoice_id, 
    cgst, 
    sgst, 
    igst, 
    other_charges, 
    less_discount, 
    rounded_off,
    show_cgst,
    show_sgst
) VALUES (
    '770e8400-e29b-41d4-a716-446655440002',
    378.00,
    378.00,
    0.00,
    0.00,
    0.00,
    0.00,
    true,
    true
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$ BEGIN
    RAISE NOTICE 'Sample test data inserted successfully! You should now see 2 invoices in the dashboard.';
END $$;
