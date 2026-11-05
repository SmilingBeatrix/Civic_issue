import React, { useState } from "react";

interface ReportFormProps {
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ user, onOpenAuth }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="card locked-container">
        <div className="locked-icon-wrapper">🔒</div>
        <h2 className="card-title" style={{ fontSize: "24px" }}>
          Citizen Authentication Required
        </h2>
        <p className="locked-desc">
          To ensure reliable reports and follow-up updates, only verified
          account holders may register public issues.
        </p>
        <button
          onClick={onOpenAuth}
          className="btn-primary"
          style={{ padding: "12px 32px" }}
        >
          Sign In or Register Now
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://civic-issue-e82d.onrender.com/api/complaints",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category, description, imageUrl }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSubmittedId(data.complaintId);
        setTitle("");
        setDescription("");
        setImageUrl("");
      } else {
        alert(data.error);
      }
    } catch {
      alert(
        "Error submitting complaint. Make sure backend is running on port 5000.",
      );
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">File a Public Issue</h2>
        <span className="badge-user">Logged in as {user.name}</span>
      </div>

      {submittedId && (
        <div className="alert-success">
          <strong>Grievance Logged!</strong> Your tracking ID is:{" "}
          <strong>{submittedId}</strong>. Use this in the "Track Issue" tab to
          monitor its status.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Issue Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Deep crater pothole near Main Square"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Roads">Roads & Pavements</option>
            <option value="Sanitation">Waste & Sanitation</option>
            <option value="Electricity">Streetlights & Power</option>
            <option value="Water Supply">Water Leakage & Drainage</option>
            <option value="Other">Other Public Hazard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Evidence Image URL</label>
          <input
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-example..."
          />
        </div>

        <div className="form-group">
          <label>Incident Details & Landmark</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the exact location, approximate dimensions, and hazards..."
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit Incident Report
        </button>
      </form>
    </div>
  );
};
