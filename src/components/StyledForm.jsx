import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const StyledForm = () => {
  return (
    <form>
      <TextField label="GST Number" variant="outlined" />
      {/* More fields... */}
      <Button variant="contained" color="primary">Submit</Button>
    </form>
  );
};

export default StyledForm;
