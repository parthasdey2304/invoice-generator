# Invoice Generator - Enhanced Version

A modern React-based invoice generator with Supabase database integration, featuring a comprehensive dashboard and advanced invoice management capabilities.

## 🚀 Features

### ✅ Completed Features

- **Supabase Database Integration**: Complete database schema with proper relationships
- **Enhanced Invoice Form**: 
  - Checkboxes for tax field visibility (CGST, SGST, IGST, Other Charges, Less Discount, Round off)
  - Database-backed autocomplete suggestions for all form fields
  - Item management with popup modal
  - Add/remove items functionality
- **Navigation & Routing**: Clean navigation between form and dashboard
- **Dashboard**: 
  - Summary cards with analytics
  - Comprehensive invoice table with filtering
  - Date-wise filtering and search
  - Pagination
  - Detailed invoice view modal
- **PDF Generation**: Enhanced with conditional field display based on checkbox selections

## 🛠️ Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to the SQL Editor
3. Run the SQL script from `database_schema.sql` to create all necessary tables
4. Get your project URL and anon key from Settings > API

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.jsx              # Main navigation component
│   ├── InvoiceForm.jsx            # Enhanced form with Supabase integration
│   ├── InvoiceGenerator.jsx       # PDF generation component
│   ├── ItemManagementModal.jsx    # Item management popup
│   ├── dashboard/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── SummaryCards.jsx       # Analytics summary cards
│   │   ├── FilterBar.jsx          # Filtering controls
│   │   ├── InvoiceTable.jsx       # Invoice data table
│   │   └── InvoiceDetailsModal.jsx # Detailed invoice view
│   └── old_components/            # Backup of previous versions
├── pages/
│   └── Dashboard.jsx              # Dashboard page
├── services/
│   ├── supabase.js               # Supabase client configuration
│   └── invoiceService.js         # Database operations
└── App.jsx                       # Main app with routing
```

## 🗄️ Database Schema

The application uses the following tables:

- **invoices**: Main invoice records
- **receivers**: Customer information
- **invoice_items**: Invoice line items
- **tax_details**: Tax information with visibility flags
- **bank_details**: Bank account information
- **item_suggestions**: Autocomplete suggestions for items
- **form_field_history**: Form field autocomplete history

## 🎯 Usage

### Creating Invoices

1. Navigate to the home page
2. Fill out the invoice form with:
   - Invoice details (number, date, transport info)
   - Receiver/customer details
   - Items (with database suggestions)
   - Tax details (with visibility checkboxes)
   - Bank details
3. Check/uncheck tax field visibility as needed
4. Click "Generate Invoice" to save to database and create PDF

### Managing Items

1. Click "📦 Manage Items" button on the form
2. Add new items with descriptions and HSN codes
3. Search existing items
4. Edit item descriptions and HSN codes

### Using the Dashboard

1. Navigate to "📊 Dashboard"
2. View summary analytics
3. Filter invoices by date range, customer, amount
4. Click on any invoice row to view detailed information
5. Export data to CSV (coming soon)

## 🔧 Development Status

### ✅ Phase 1 Completed: Foundation
- ✅ Supabase setup and database schema
- ✅ Basic service files
- ✅ Routing structure

### ✅ Phase 2 Completed: Enhanced Form
- ✅ Checkbox visibility controls for tax fields
- ✅ Database integration for form data
- ✅ Item management modal
- ✅ Dropdown suggestions from database

### ✅ Phase 3 Completed: Dashboard Development
- ✅ Basic dashboard layout
- ✅ Data table with filtering
- ✅ Summary cards and analytics
- ✅ Invoice details modal

### 🚧 Phase 4 In Progress: PDF & Polish
- ✅ Navigation component
- ✅ Updated old_components with current versions
- 🔄 PDF generation with conditional fields (needs testing)
- 🔄 CSV export functionality (placeholder implemented)

## 🔮 Future Enhancements

- User authentication and multi-tenant support
- Email integration for invoice sending
- Payment tracking
- Advanced reporting and analytics
- Mobile app
- Template customization
- Bulk operations

## 🐛 Known Issues

- CSV export functionality is placeholder (button exists but needs implementation)
- PDF generation needs testing with new conditional field visibility
- Error handling can be improved
- Mobile responsiveness needs optimization

## 📝 Notes

- The application maintains backward compatibility with existing `InvoiceGenerator.jsx`
- Old components are preserved in `old_components/` directory
- All data is stored in Supabase with proper relationships
- Form suggestions are dynamically loaded from database usage history

## 🤝 Contributing

1. Set up the development environment as described above
2. Make your changes
3. Test thoroughly with Supabase integration
4. Submit pull request

---

**Important**: Make sure to set up your Supabase database and update the environment variables before running the application.
