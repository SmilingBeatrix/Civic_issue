import React, { useState } from "react";

interface ComplaintDetails {
  complaintId: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

export const TrackIssue: React.FC = () => {
  const [id, setId] = useState("");
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setComplaint(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/complaints/${id.trim()}`,
      );
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Track Grievance Status</h2>
      </div>

      <form onSubmit={handleTrack} className="track-search-bar">
        <input
          type="text"
          placeholder="Enter Complaint ID (e.g. CIVIC-123456)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">
          Lookup
        </button>
      </form>

      {notFound && (
        <div className="alert-error">
          No record found matching ID <strong>{id}</strong>. Please verify the
          code and retry.
        </div>
      )}

      {complaint && (
        <div className="complaint-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0e294b" }}>
              {complaint.title}
            </h3>
            <span
              className={`status-badge status-${complaint.status.toLowerCase().replace(" ", "-")}`}
            >
              {complaint.status}
            </span>
          </div>

          <div className="complaint-meta-grid">
            <div className="meta-item">
              <span>Tracking Code</span>
              <strong>{complaint.complaintId}</strong>
            </div>
            <div className="meta-item">
              <span>Department</span>
              <strong>{complaint.category}</strong>
            </div>
            <div className="meta-item">
              <span>Report Date</span>
              <strong>
                {new Date(complaint.createdAt).toLocaleDateString()}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            {complaint.description}
          </p>

          {complaint.imageUrl && (
            <div>
              <img
                src={complaint.imageUrl}
                alt="Complaint Evidence"
                className="complaint-img"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
