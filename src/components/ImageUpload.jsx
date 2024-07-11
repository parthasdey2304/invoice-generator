import React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';

const ImageUpload = ({ onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onImageUpload(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div>
      <input type="file" accept="image/png,jpg,jpeg" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
};

export default ImageUpload;
