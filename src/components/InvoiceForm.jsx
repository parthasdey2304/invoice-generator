import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const InvoiceForm = ({ initialValues, onSubmit }) => {
  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({
      gstNumber: Yup.string().required('Required'),
      transporterName: Yup.string().required('Required'),
      invoiceNumber: Yup.string().required('Required'),
      invoiceDate: Yup.string().required('Required'),
      items: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required('Required'),
          price: Yup.number().required('Required'),
          quantity: Yup.number().required('Required'),
        })
      ).required('Required'),
    }),
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        name="gstNumber"
        label="GST Number"
        value={formik.values.gstNumber}
        onChange={formik.handleChange}
        error={formik.touched.gstNumber && Boolean(formik.errors.gstNumber)}
        helperText={formik.touched.gstNumber && formik.errors.gstNumber}
      />
      <TextField
        name="transporterName"
        label="Transporter Name"
        value={formik.values.transporterName}
        onChange={formik.handleChange}
        error={formik.touched.transporterName && Boolean(formik.errors.transporterName)}
        helperText={formik.touched.transporterName && formik.errors.transporterName}
      />
      <TextField
        name="invoiceNumber"
        label="Invoice Number"
        value={formik.values.invoiceNumber}
        onChange={formik.handleChange}
        error={formik.touched.invoiceNumber && Boolean(formik.errors.invoiceNumber)}
        helperText={formik.touched.invoiceNumber && formik.errors.invoiceNumber}
      />
      <TextField
        name="invoiceDate"
        label="Invoice Date"
        value={formik.values.invoiceDate}
        onChange={formik.handleChange}
        error={formik.touched.invoiceDate && Boolean(formik.errors.invoiceDate)}
        helperText={formik.touched.invoiceDate && formik.errors.invoiceDate}
      />
      {/* Add fields for items */}
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};

export default InvoiceForm;
