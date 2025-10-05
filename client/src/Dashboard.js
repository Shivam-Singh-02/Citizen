import React, { useState, useEffect } from 'react';

function Dashboard({ showDashboard }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/reports')
      .then((response) => response.json())
      .then((data) => {
        setReports(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Sort by newest first
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching reports:', error);
        setError('Failed to fetch reports.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Complaints Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => showDashboard(false)}>
          Back to Report Form
        </button>
      </div>
      {loading && <p>Loading reports...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div className="list-group">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="list-group-item list-group-item-action flex-column align-items-start mb-3">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Report ID: {report.id}</h5>
                  <small>{new Date(report.timestamp).toLocaleString()}</small>
                </div>
                <p className="mb-1"><strong>Address:</strong> {report.address}</p>
                <p className="mb-1"><strong>Status:</strong> <span className={`badge bg-${report.status === 'Reported' ? 'warning' : 'success'}`}>{report.status}</span></p>
                <div className="mt-2">
                    <img src={`http://localhost:3001/uploads/${report.image}`} alt="Issue" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '5px' }} />
                </div>
              </div>
            ))
          ) : (
            <p>No reports found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
