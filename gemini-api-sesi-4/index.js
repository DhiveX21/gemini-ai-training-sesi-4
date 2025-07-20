const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.BASE_URL : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.get('/', (req, res) => {
  res.send('Gemini Flash API is running');
});

app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in the request body.' });
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ output: response.text() });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const prompt = req.body.prompt || 'Analyze this image';
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Content = buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const imagePart = {
      inlineData: {
        data: base64Content,
        mimeType: mimeType,
      },
    };
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;

    let output;
    if (response && typeof response.text === 'function') {
      output = response.text();
    } else if (response && response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      output = response.candidates[0].content.parts[0].text;
    } else {
      output = 'No output from Gemini API';
    }

    res.json({ output });
  } catch (error) {
    console.error('Error generating content from image:', error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(filePath);
  }
}); 

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const prompt = req.body.prompt || 'Analyze this document';
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Content = buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const documentPart = {
      inlineData: {
        data: base64Content,
        mimeType: mimeType,
      },
    };
    const result = await model.generateContent([documentPart, prompt]);
    const response = await result.response;

    let output;
    if (response && typeof response.text === 'function') {
      output = response.text();
    } else if (response && response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      output = response.candidates[0].content.parts[0].text;
    } else {
      output = 'No output from Gemini API';
    }

    res.json({ output });
  } catch (error) {
    console.error('Error generating content from document:', error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const prompt = req.body.prompt || 'Analyze this audio';
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Content = buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const audioPart = {
      inlineData: {
        data: base64Content,
        mimeType: mimeType,
      },
    };
    const result = await model.generateContent([audioPart, prompt]);
    const response = await result.response;

    let output;
    if (response && typeof response.text === 'function') {
      output = response.text();
    } else if (response && response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      output = response.candidates[0].content.parts[0].text;
    } else {
      output = 'No output from Gemini API';
    }

    res.json({ output });
  } catch (error) {
    console.error('Error generating content from audio:', error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.listen(PORT, () => {
  console.log(`Gemini API Server is running on port ${PORT}`);
});

module.exports = app;