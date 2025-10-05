import React, { useState, useEffect } from 'react';

function Dashboard({ showDashboard }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = () => {
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
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateReportStatus = (reportId, newStatus) => {
    fetch(`http://localhost:3001/api/reports/${reportId}/${newStatus.toLowerCase()}`, {
      method: 'PUT',
    })
      .then((response) => response.json())
      .then((updatedReport) => {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? updatedReport : report
          )
        );
      })
      .catch((error) => {
        console.error(`Error ${newStatus.toLowerCase()}ing report:`, error);
        setError(`Failed to ${newStatus.toLowerCase()} report.`);
      });
  };

  const handleDelete = (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    fetch(`http://localhost:3001/api/reports/${reportId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.status === 204) {
          setReports((prevReports) => prevReports.filter((report) => report.id !== reportId));
        } else {
          throw new Error('Failed to delete report.');
        }
      })
      .catch((error) => {
        console.error('Error deleting report:', error);
        setError('Failed to delete report.');
      });
  };

  const handleEscalate = (report) => {
    if (!report.civicData || !report.address || !report.latitude || !report.longitude || !report.issueDescription) return;

    const recipients = [
      'mla.pune@placeholder.gov.in', // Placeholder
      'mp.pune@placeholder.gov.in',   // Placeholder
    ].join(',');

    const subject = `Request for Intervention: Unresolved Civic Issue - ${report.issueDescription} at ${report.address}`;

    const body = `Dear Esteemed Representative,

I am writing to respectfully request your urgent intervention regarding a persistent civic issue at the following location:
Location: ${report.address}
GPS Coordinates: (Latitude: ${report.latitude}, Longitude: ${report.longitude})

The specific issue is: ${report.issueDescription}. This problem continues to pose a significant safety hazard and inconvenience to the residents of this area. A photograph of the issue is attached for your reference.

This matter was previously reported to the municipal authority, but unfortunately, a satisfactory resolution has not yet been achieved.

As our elected representative, your support in ensuring the timely resolution of this issue would be invaluable. We kindly request your assistance in urging the relevant municipal departments to take immediate and effective action.

The responsible authorities for this jurisdiction are:
- MLA: ${report.civicData.mla}
- MP: ${report.civicData.mp}
- Municipal Body: ${report.civicData.municipalCorporation}

We look forward to your prompt attention to this critical community concern.

Thank you for your dedication to public service.

Sincerely,

A Concerned and Vigilant Citizen
    `;

    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

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
                <div className="d-flex justify-content-end mt-3">
                  {report.status === 'Reported' && (
                    <> {/* Use a fragment to group multiple elements */}
                      <button className="btn btn-success btn-sm me-2" onClick={() => updateReportStatus(report.id, 'Resolved')}>
                        Resolve
                      </button>
                      <button className="btn btn-danger btn-sm me-2" onClick={() => handleEscalate(report)}>
                        Escalate
                      </button>
                    </>
                  )}
                  {report.status === 'Resolved' && (
                    <button className="btn btn-warning btn-sm me-2" onClick={() => updateReportStatus(report.id, 'Reopen')}>
                      Reopen
                    </button>
                  )}
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(report.id)}>
                    <i className="bi bi-trash"></i> Delete
                  </button>
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