import { supabase } from './supabase.js'

export const invoiceService = {
  // Create a new invoice
  async createInvoice(invoiceData) {
    try {
      // First, create the main invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_no: invoiceData.invoiceNo,
          invoice_date: invoiceData.invoiceDate,
          transport_name: invoiceData.transportName,
          gcn: invoiceData.gcn,
          place_of_supply: invoiceData.placeOfSupply,
          number_of_bags: parseInt(invoiceData.numberOfBags) || 0,
          pdf_link: invoiceData.pdfLink,
          total_amount: this.calculateTotalAmount(invoiceData)
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create receiver record
      const { data: receiver, error: receiverError } = await supabase
        .from('receivers')
        .insert({
          name: invoiceData.receiverName,
          address: invoiceData.receiverAddress,
          gst_in: invoiceData.receiverGST,
          state: invoiceData.receiverState,
          code: invoiceData.receiverCode
        })
        .select()
        .single()

      if (receiverError) throw receiverError

      // Update invoice with receiver_id
      await supabase
        .from('invoices')
        .update({ receiver_id: receiver.id })
        .eq('id', invoice.id)

      // Create invoice items
      const itemsToInsert = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        hsn_code: item.hsnCode,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      // Create tax details
      const { error: taxError } = await supabase
        .from('tax_details')
        .insert({
          invoice_id: invoice.id,
          cgst: parseFloat(invoiceData.taxDetails.cgst) || 0,
          sgst: parseFloat(invoiceData.taxDetails.sgst) || 0,
          igst: parseFloat(invoiceData.taxDetails.igst) || 0,
          other_charges: parseFloat(invoiceData.taxDetails.otherCharges) || 0,
          less_discount: parseFloat(invoiceData.taxDetails.lessDiscount) || 0,
          rounded_off: parseFloat(invoiceData.taxDetails.roundedOff) || 0,
          show_cgst: invoiceData.taxDetails.showCgst || false,
          show_sgst: invoiceData.taxDetails.showSgst || false,
          show_igst: invoiceData.taxDetails.showIgst || false,
          show_other_charges: invoiceData.taxDetails.showOtherCharges || false,
          show_less_discount: invoiceData.taxDetails.showLessDiscount || false,
          show_rounded_off: invoiceData.taxDetails.showRoundedOff || false
        })

      if (taxError) throw taxError

      // Update item suggestions usage
      for (const item of invoiceData.items) {
        if (item.description) {
          await this.updateItemSuggestion(item.description, item.hsnCode)
        }
      }

      // Update form field history
      await this.updateFormFieldHistory(invoiceData)

      return { success: true, invoice }
    } catch (error) {      console.error('Error creating invoice:', error)
      return { success: false, error: error.message }
    }
  },

  // Get all invoices with pagination
  async getInvoices(page = 1, limit = 10, filters = {}) {
    try {
      console.log('Fetching invoices with filters:', filters);
        // Build base query with filters
      let baseQuery = supabase.from('invoices').select('*');
      
      // Apply filters to base query
      if (filters.startDate && filters.endDate) {
        baseQuery = baseQuery.gte('invoice_date', filters.startDate).lte('invoice_date', filters.endDate);
      }
      if (filters.minAmount && filters.maxAmount) {
        baseQuery = baseQuery.gte('total_amount', filters.minAmount).lte('total_amount', filters.maxAmount);
      }

      // Get total count with same filters
      const { count } = await baseQuery.select('*', { count: 'exact', head: true });

      // Get paginated invoices with filters and sorting
      const { data: invoices, error: invoicesError } = await baseQuery
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        throw invoicesError;
      }

      if (!invoices || invoices.length === 0) {
        console.log('No invoices found');
        return {
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
          }
        };
      }

      console.log('Raw invoices fetched:', invoices.length);

      // Get all unique receiver IDs
      const receiverIds = [...new Set(invoices.map(inv => inv.receiver_id).filter(Boolean))];
      
      // Fetch all receivers in one query
      let receiversMap = {};
      if (receiverIds.length > 0) {
        const { data: receivers, error: receiversError } = await supabase
          .from('receivers')
          .select('id, name, address, gst_in, state')
          .in('id', receiverIds);
        
        if (receiversError) {
          console.warn('Error fetching receivers:', receiversError);
        } else if (receivers) {
          receiversMap = receivers.reduce((map, receiver) => {
            map[receiver.id] = receiver;
            return map;
          }, {});
        }
      }

      // Get all invoice IDs for batch fetching
      const invoiceIds = invoices.map(inv => inv.id);

      // Fetch all invoice items in one query
      const { data: allItems, error: itemsError } = await supabase
        .from('invoice_items')
        .select('invoice_id, description, quantity, rate, amount, hsn_code')
        .in('invoice_id', invoiceIds);

      if (itemsError) {
        console.warn('Error fetching invoice items:', itemsError);
      }

      // Fetch all tax details in one query
      const { data: allTaxDetails, error: taxError } = await supabase
        .from('tax_details')
        .select('invoice_id, cgst, sgst, igst, other_charges, less_discount, rounded_off')
        .in('invoice_id', invoiceIds);

      if (taxError) {
        console.warn('Error fetching tax details:', taxError);
      }

      // Group items and tax details by invoice_id
      const itemsMap = {};
      const taxDetailsMap = {};

      if (allItems) {
        allItems.forEach(item => {
          if (!itemsMap[item.invoice_id]) {
            itemsMap[item.invoice_id] = [];
          }
          itemsMap[item.invoice_id].push(item);
        });
      }

      if (allTaxDetails) {
        allTaxDetails.forEach(tax => {
          taxDetailsMap[tax.invoice_id] = tax;
        });
      }

      // Enrich invoices with related data
      const enrichedInvoices = invoices.map(invoice => ({
        ...invoice,
        receivers: receiversMap[invoice.receiver_id] || null,
        invoice_items: itemsMap[invoice.id] || [],
        tax_details: taxDetailsMap[invoice.id] || {}
      }));      // Apply customer filter if specified
      let filteredInvoices = enrichedInvoices;
      if (filters.customer && filters.customer.trim()) {
        filteredInvoices = enrichedInvoices.filter(invoice => 
          invoice.receivers?.name?.toLowerCase().includes(filters.customer.toLowerCase().trim())
        );
        
        // Recalculate pagination for filtered results
        const totalFiltered = filteredInvoices.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        filteredInvoices = filteredInvoices.slice(startIndex, endIndex);
        
        console.log('Applied customer filter, filtered invoices:', totalFiltered);
        
        return {
          success: true,
          data: filteredInvoices,
          pagination: {
            page,
            limit,
            total: totalFiltered,
            pages: Math.ceil(totalFiltered / limit)
          }
        };
      }

      console.log('Enriched invoices:', filteredInvoices.length);

      return {
        success: true,
        data: filteredInvoices,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error in getInvoices:', error);
      return { 
        success: false, 
        error: error.message, 
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      };    }
  },

  // Simplified getInvoices that avoids all joins - use this if foreign key issues persist
  async getInvoicesSimple(page = 1, limit = 10, filters = {}) {
    try {
      console.log('Using simplified invoice fetch...');
      
      // Get invoices only, no joins
      const { data: invoices, error: invoicesError, count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        throw invoicesError;
      }

      console.log('Fetched invoices:', invoices?.length || 0);

      // Return basic invoice data without joins
      return {
        success: true,
        data: invoices || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error in getInvoicesSimple:', error);
      return { 
        success: false, 
        error: error.message, 
        data: [],
        pagination: { page, limit, total: 0, pages: 0 }
      };
    }
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          receivers (*),
          invoice_items (*),
          tax_details (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      return { success: false, error: error.message }
    }
  },

  // Update invoice
  async updateInvoice(id, invoiceData) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_no: invoiceData.invoiceNo,
          invoice_date: invoiceData.invoiceDate,
          transport_name: invoiceData.transportName,
          gcn: invoiceData.gcn,
          place_of_supply: invoiceData.placeOfSupply,
          number_of_bags: parseInt(invoiceData.numberOfBags) || 0,
          pdf_link: invoiceData.pdfLink,
          total_amount: this.calculateTotalAmount(invoiceData),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating invoice:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete invoice
  async deleteInvoice(id) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      return { success: false, error: error.message }
    }
  },

  // Get item suggestions
  async getItemSuggestions(searchTerm = '') {
    try {
      let query = supabase
        .from('item_suggestions')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(50)

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching item suggestions:', error)
      return { success: false, error: error.message }
    }
  },

  // Update item suggestion usage
  async updateItemSuggestion(description, hsnCode) {
    try {
      // Check if suggestion exists
      const { data: existing } = await supabase
        .from('item_suggestions')
        .select('*')
        .eq('description', description)
        .single()

      if (existing) {
        // Update usage count
        await supabase
          .from('item_suggestions')
          .update({ usage_count: existing.usage_count + 1 })
          .eq('id', existing.id)
      } else {
        // Create new suggestion
        await supabase
          .from('item_suggestions')
          .insert({
            description,
            hsn_code: hsnCode,
            usage_count: 1
          })
      }
    } catch (error) {
      console.error('Error updating item suggestion:', error)
    }
  },

  // Delete item suggestion
  async deleteItemSuggestion(itemId) {
    try {
      const { error } = await supabase
        .from('item_suggestions')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting item suggestion:', error)
      return { success: false, error: error.message }
    }
  },

  // Get form field history for autocomplete
  async getFormFieldHistory(fieldName, searchTerm = '') {
    try {
      let query = supabase
        .from('form_field_history')
        .select('field_value')
        .eq('field_name', fieldName)
        .order('usage_count', { ascending: false })
        .limit(10)

      if (searchTerm) {
        query = query.ilike('field_value', `%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data.map(item => item.field_value) }
    } catch (error) {
      console.error('Error fetching form field history:', error)
      return { success: false, error: error.message }
    }
  },

  // Update form field history
  async updateFormFieldHistory(invoiceData) {
    const fieldsToTrack = [
      { name: 'transportName', value: invoiceData.transportName },
      { name: 'placeOfSupply', value: invoiceData.placeOfSupply },
      { name: 'receiverName', value: invoiceData.receiverName },
      { name: 'receiverAddress', value: invoiceData.receiverAddress },
      { name: 'receiverState', value: invoiceData.receiverState }
    ]

    for (const field of fieldsToTrack) {
      if (field.value && field.value.trim()) {
        try {
          const { data: existing } = await supabase
            .from('form_field_history')
            .select('*')
            .eq('field_name', field.name)
            .eq('field_value', field.value)
            .single()

          if (existing) {
            await supabase
              .from('form_field_history')
              .update({ 
                usage_count: existing.usage_count + 1,
                last_used: new Date().toISOString()
              })
              .eq('id', existing.id)
          } else {
            await supabase
              .from('form_field_history')
              .insert({
                field_name: field.name,
                field_value: field.value,
                usage_count: 1,
                last_used: new Date().toISOString()
              })
          }
        } catch (error) {
          console.error(`Error updating field history for ${field.name}:`, error)
        }
      }
    }
  },
  // Get dashboard analytics
  async getDashboardAnalytics() {
    try {
      const { count: totalInvoicesCount, error: totalError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

      if (totalError) throw totalError

      const { data: totalRevenue, error: revenueError } = await supabase
        .from('invoices')
        .select('total_amount')

      if (revenueError) throw revenueError

      const { data: taxSummary, error: taxError } = await supabase
        .from('tax_details')
        .select('cgst, sgst, igst')

      if (taxError) throw taxError

      const revenue = (totalRevenue || []).reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0)
      const taxes = (taxSummary || []).reduce((acc, tax) => ({
        cgst: acc.cgst + (tax.cgst || 0),
        sgst: acc.sgst + (tax.sgst || 0),
        igst: acc.igst + (tax.igst || 0)
      }), { cgst: 0, sgst: 0, igst: 0 })

      return {
        success: true,
        data: {
          totalInvoices: totalInvoicesCount || 0,
          totalRevenue: revenue,
          totalTaxes: taxes,
          totalTaxAmount: taxes.cgst + taxes.sgst + taxes.igst
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error)
      return { success: false, error: error.message }
    }
  },

  // Debug function to test database connectivity
  async testConnection() {
    try {
      console.log('Testing database connection...');
      
      // Test basic table access
      const { data: invoicesTest, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, invoice_no')
        .limit(1);
      
      console.log('Invoices table test:', { data: invoicesTest, error: invoicesError });
      
      const { data: receiversTest, error: receiversError } = await supabase
        .from('receivers')
        .select('id, name')
        .limit(1);
      
      console.log('Receivers table test:', { data: receiversTest, error: receiversError });
      
      const { data: itemsTest, error: itemsError } = await supabase
        .from('invoice_items')
        .select('id, description')
        .limit(1);
      
      console.log('Invoice items table test:', { data: itemsTest, error: itemsError });
      
      return { 
        success: true, 
        results: { 
          invoices: { data: invoicesTest, error: invoicesError },
          receivers: { data: receiversTest, error: receiversError },
          items: { data: itemsTest, error: itemsError }
        }
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate total amount helper
  calculateTotalAmount(invoiceData) {
    const itemsTotal = invoiceData.items.reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0))
    }, 0)

    const cgst = parseFloat(invoiceData.taxDetails.cgst) || 0
    const sgst = parseFloat(invoiceData.taxDetails.sgst) || 0
    const igst = parseFloat(invoiceData.taxDetails.igst) || 0
    const otherCharges = parseFloat(invoiceData.taxDetails.otherCharges) || 0
    const lessDiscount = parseFloat(invoiceData.taxDetails.lessDiscount) || 0
    const roundedOff = parseFloat(invoiceData.taxDetails.roundedOff) || 0

    return itemsTotal + cgst + sgst + igst + otherCharges - lessDiscount + roundedOff
  }
}
