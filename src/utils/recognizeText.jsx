import Tesseract from 'tesseract.js';

const recognizeText = (imagePath) => {
  return Tesseract.recognize(
    imagePath,
    'eng',
    {
      logger: (m) => console.log(m),
    }
  ).then(({ data: { text } }) => {
    console.log(text);
    return text;
  });
};

export default recognizeText;
