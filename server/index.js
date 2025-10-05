const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;
const dbPath = path.join(__dirname, 'db.json');

// Enable CORS for all routes
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Helper function to read the database
const readDb = () => {
  const dbData = fs.readFileSync(dbPath);
  return JSON.parse(dbData);
};

// Helper function to write to the database
const writeDb = (dbData) => {
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});

const upload = multer({ storage: storage });

// Endpoint to get all reports
app.get('/api/reports', (req, res) => {
  const db = readDb();
  res.status(200).json(db.reports);
});

// Endpoint to handle the report submission
app.post('/api/report', upload.single('image'), async (req, res) => {
  const { latitude, longitude } = req.body;
  const image = req.file;

  if (!image || !latitude || !longitude) {
    return res.status(400).send('Missing image or location data.');
  }

  try {
    // 1. Reverse Geocoding
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const geoResponse = await fetch(geoUrl, { headers: { 'User-Agent': 'CitizenApp/1.0' } });
    const geoData = await geoResponse.json();
    const address = geoData.display_name;

    let civicData = null;
    if (address && address.toLowerCase().includes('pune')) {
      civicData = {
        mla: 'Bapusaheb Tukaram Pathare (Wadgaon Sheri)',
        mp: 'Murlidhar Mohol (Pune)',
        municipalCorporation: 'Pune Municipal Corporation (PMC)',
      };
    }

    const newReport = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      latitude,
      longitude,
      address,
      image: image.filename,
      civicData,
      status: 'Reported', // Initial status
    };

    const db = readDb();
    db.reports.push(newReport);
    writeDb(db);

    res.status(200).send({
      message: 'Report submitted successfully!',
      report: newReport,
    });

  } catch (error) {
    console.error('Error during report submission:', error);
    res.status(500).send('An error occurred while processing your report.');
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the Citizen server!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});