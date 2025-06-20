-- Foreign Key Relationship Fix for Supabase
-- Run this if you're getting "Could not find a relationship" errors

-- First, check if the foreign key constraint exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('invoices', 'invoice_items', 'tax_details');

-- Drop and recreate the foreign key constraint if it doesn't exist
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_receiver_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES receivers(id);

-- Ensure other foreign keys are properly set
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_fkey;
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE tax_details DROP CONSTRAINT IF EXISTS tax_details_invoice_id_fkey;
ALTER TABLE tax_details ADD CONSTRAINT tax_details_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

-- Refresh the Supabase schema cache (this might help)
NOTIFY pgrst, 'reload schema';

-- Verify the constraints were created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('invoices', 'invoice_items', 'tax_details');
