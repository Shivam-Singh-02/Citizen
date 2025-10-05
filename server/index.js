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

// Endpoint to update report status to 'Resolved'
app.put('/api/reports/:id/resolve', (req, res) => {
  const reportId = parseInt(req.params.id);
  const db = readDb();
  const reportIndex = db.reports.findIndex(r => r.id === reportId);

  if (reportIndex === -1) {
    return res.status(404).send('Report not found.');
  }

  db.reports[reportIndex].status = 'Resolved';
  writeDb(db);

  res.status(200).json(db.reports[reportIndex]);
});

// Endpoint to update report status to 'Reported' (Reopen)
app.put('/api/reports/:id/reopen', (req, res) => {
  const reportId = parseInt(req.params.id);
  const db = readDb();
  const reportIndex = db.reports.findIndex(r => r.id === reportId);

  if (reportIndex === -1) {
    return res.status(404).send('Report not found.');
  }

  db.reports[reportIndex].status = 'Reported';
  writeDb(db);

  res.status(200).json(db.reports[reportIndex]);
});

// Endpoint to delete a report
app.delete('/api/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const db = readDb();
  const initialLength = db.reports.length;
  db.reports = db.reports.filter(r => r.id !== reportId);
  
  if (db.reports.length === initialLength) {
    return res.status(404).send('Report not found.');
  }

  writeDb(db);
  res.status(204).send(); // No content for successful deletion
});


// Endpoint to handle the report submission
app.post('/api/report', upload.single('image'), async (req, res) => {
  const { latitude, longitude, issueDescription } = req.body; // Added issueDescription
  const image = req.file;

  if (!image || !latitude || !longitude || !issueDescription) { // Added issueDescription validation
    return res.status(400).send('Missing image, location, or issue description data.');
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
      issueDescription, // Added issueDescription
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