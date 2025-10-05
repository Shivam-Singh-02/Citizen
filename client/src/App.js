import React, { useState } from 'react';
import Dashboard from './Dashboard'; // Import the Dashboard component

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [civicData, setCivicData] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false); // New state for dashboard

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSuccess(null);
    setError(null);
    setAddress(null);
    setCivicData(null);
  };

  const handleReport = () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setAddress(null);
    setCivicData(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        fetch('http://localhost:3001/api/report', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              setSuccess(data.message);
              setAddress(data.report.address); // Use data.report.address
              setSelectedFile(null); // Clear file input
              document.getElementById('formFile').value = null;

              // --- MOCK CIVIC DATA ---
              if (data.report.address && data.report.address.toLowerCase().includes('pune')) {
                setCivicData({
                  mla: 'Bapusaheb Tukaram Pathare (Wadgaon Sheri)',
                  mp: 'Murlidhar Mohol (Pune)',
                  municipalCorporation: 'Pune Municipal Corporation (PMC)',
                });
              }
              // --- END MOCK CIVIC DATA ---

            } else {
              setError('Failed to submit report.');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            setError('An error occurred while submitting the report.');
          })
          .finally(() => {
            setLoading(false);
          });
      },
      () => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  const handleDraftEmail = () => {
    if (!civicData || !address || !location) return;

    const recipients = [
      'info@punecorporation.org',
      'mla.pune@placeholder.gov.in', // Placeholder
      'mp.pune@placeholder.gov.in',   // Placeholder
    ].join(',');

    const subject = `Formal Complaint & Request for Information: Civic Issue at ${address}`;

    const body = `To the Concerned Department Head,

This is a formal complaint regarding a significant civic issue requiring your immediate attention at the following location:
Location: ${address}
GPS Coordinates: (Latitude: ${location.latitude}, Longitude: ${location.longitude})

The issue is a [Please specify issue, e.g., large pothole, broken streetlight, uncleared garbage]. This poses a direct safety hazard to the residents of this area and is a failure of public maintenance. A photograph of the issue is attached for your reference.

The responsible authorities for this jurisdiction have been identified as:
- MLA: ${civicData.mla}
- MP: ${civicData.mp}
- Municipal Body: ${civicData.municipalCorporation}

As per the citizens' charter and the duties of the municipal corporation, it is your responsibility to ensure the safety and upkeep of public infrastructure.

I demand immediate action to rectify this problem.

Furthermore, pursuant to the Right to Information Act, 2005, I formally request the following information within the statutory 30-day period:
1.  The name and contact details of the contractor awarded the tender for the construction and maintenance of this infrastructure.
2.  The stipulated duration of the maintenance contract and its official end date.
3.  A copy of the service level agreement (SLA) for the maintenance of this infrastructure.

Please acknowledge receipt of this complaint within 48 hours and provide a specific timeline for its resolution.

Failure to act on this formal complaint will compel me to escalate this matter to the appropriate higher authorities.

Sincerely,

A Concerned and Vigilant Citizen

---
This complaint was generated and filed via the Citizen Complaint Portal.
    `;

    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <>
      {!showDashboard ? (
        <div className="container mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-center">Citizen Complaint Portal</h1>
            <button className="btn btn-info" onClick={() => setShowDashboard(true)}>
              View Dashboard
            </button>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Report a Civic Issue</h5>
              <p className="card-text">Upload an image of the issue (e.g., pothole, broken streetlight) and we'll help you report it.</p>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div className="mb-3">
                <label htmlFor="formFile" className="form-label">Upload or Take a Picture</label>
                <input className="form-control" type="file" id="formFile" onChange={handleFileChange} accept="image/*" capture="environment" />
              </div>
              <button className="btn btn-primary" onClick={handleReport} disabled={loading}>
                {loading ? 'Submitting...' : 'Get Location & Submit Report'}
              </button>
              
              { !loading && (address || civicData) &&
                <div className="mt-4">
                  <hr />
                  { address && <div><h6>Detected Address:</h6><p>{address}</p></div> }
                  { civicData && 
                    <div className="mt-3">
                      <h6>Responsible Authorities:</h6>
                      <ul className="list-group">
                        <li className="list-group-item"><strong>MLA:</strong> {civicData.mla}</li>
                        <li className="list-group-item"><strong>MP:</strong> {civicData.mp}</li>
                        <li className="list-group-item"><strong>Municipal Body:</strong> {civicData.municipalCorporation}</li>
                      </ul>
                      <button className="btn btn-success mt-3" onClick={handleDraftEmail}>
                        Draft Email to Authorities
                      </button>
                      <p className="mt-2 small text-muted">
                        This will open your default email client. Please remember to manually attach the image of the issue.
                      </p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      ) : (
        <Dashboard showDashboard={setShowDashboard} />
      )}
    </>
  );
}

export default App;