import React, { useEffect, useState } from "react";

interface ComplaintItem {
  complaintId: string;
  title: string;
  category: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

export const WorkerDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(
        "https://civic-issue-e82d.onrender.com/api/complaints",
      );
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      const res = await fetch(
        `https://civic-issue-e82d.onrender.com/api/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === complaintId
              ? { ...c, status: newStatus as any }
              : c,
          ),
        );
      }
    } catch {
      alert("Failed to update complaint status");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Municipal Worker Action Queue</h2>
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          Total Issues: {complaints.length}
        </span>
      </div>

      {complaints.length === 0 ? (
        <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
          No complaints filed yet.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="complaint-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Incident Details</th>
                <th>Domain</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item.complaintId}>
                  <td style={{ fontWeight: 600 }}>{item.complaintId}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    <span
                      className={`status-badge status-${item.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="table-select"
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.complaintId, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
