import React, { useState, useEffect, useRef, useCallback } from "react";

// ==========================================
// Shared helpers
// ==========================================
const API_BASE = "https://civic-issue-e82d.onrender.com";
const normalizeEmail = (email?: string | null): string =>
  (email || "").trim().toLowerCase();

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem("civic_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

// ==========================================
// 1. Types & Interfaces
// ==========================================
interface User {
  name: string;
  email: string;
  role: "citizen" | "worker";
}

interface Complaint {
  complaintId: string;
  userEmail?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

// ==========================================
// 2. CityPulse Brand Logo (unchanged)
// ==========================================
const CityPulseLogo: React.FC = () => (
  <svg
    className="brand-icon"
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      width: "40px",
      height: "46px",
      display: "block",
      cursor: "pointer",
    }}
  >
    <path
      d="M50 5C27.9 5 10 22.9 10 45C10 74 50 115 50 115C50 115 90 74 90 45C90 22.9 72.1 5 50 5Z"
      fill="#0e294b"
    />
    <rect x="25" y="44" width="14" height="22" rx="2" fill="#38bdf8" />
    <rect x="42" y="28" width="16" height="38" rx="2" fill="#38bdf8" />
    <rect x="61" y="42" width="14" height="24" rx="2" fill="#38bdf8" />
    <rect x="28" y="48" width="3" height="3" fill="#0e294b" />
    <rect x="33" y="48" width="3" height="3" fill="#0e294b" />
    <rect x="46" y="34" width="3" height="3" fill="#0e294b" />
    <rect x="52" y="34" width="3" height="3" fill="#0e294b" />
    <rect x="46" y="41" width="3" height="3" fill="#0e294b" />
    <rect x="52" y="41" width="3" height="3" fill="#0e294b" />
    <path
      d="M18 64H39L44 56L51 74L57 60L61 64H82"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ==========================================
// 3. Auth Modal (unchanged, small endpoint fix)
// ==========================================
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "citizen" | "worker";
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = "citizen",
  onSuccess,
}) => {
  const [targetRole, setTargetRole] = useState<"citizen" | "worker">(
    defaultRole,
  );
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTargetRole(defaultRole);
  }, [defaultRole]);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const cleanEmail = normalizeEmail(email);
    const payload = isLogin
      ? { email: cleanEmail, password, role: targetRole }
      : { name: name.trim(), email: cleanEmail, password, role: targetRole };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("civic_user", JSON.stringify(data.user));
        localStorage.setItem("civic_token", data.token);
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError(
        "Backend service unreachable. Ensure backend is running on port 5000.",
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "18px",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTargetRole("citizen");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              background: targetRole === "citizen" ? "#0284c7" : "transparent",
              color: targetRole === "citizen" ? "#ffffff" : "#64748b",
            }}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetRole("worker");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              background: targetRole === "worker" ? "#0e294b" : "transparent",
              color: targetRole === "worker" ? "#ffffff" : "#64748b",
            }}
          >
            Admin / Staff
          </button>
        </div>

        <div className="modal-header">
          <h3>
            {isLogin
              ? targetRole === "citizen"
                ? "Citizen Sign In"
                : "Admin & Staff Sign In"
              : targetRole === "citizen"
                ? "Register Citizen Account"
                : "Register Staff Account"}
          </h3>
          <p>
            {targetRole === "citizen"
              ? "Report civic hazards and track their live updates"
              : "Authorized municipal dispatch & worker triage portal"}
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            style={{ marginTop: "10px" }}
          >
            {isLogin
              ? `Log In as ${targetRole === "citizen" ? "Citizen" : "Staff"}`
              : "Register Account"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Need an account? " : "Already registered? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register here" : "Sign in here"}
          </span>
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 4. Report Form (with post-submit → history hook)
// ==========================================
interface ReportFormProps {
  user: User | null;
  onOpenAuth: (role: "citizen" | "worker") => void;
  onGoToTrack: (id: string) => void;
  onComplaintSubmitted: () => void; // triggers refresh on My Reports
}

const ReportForm: React.FC<ReportFormProps> = ({
  user,
  onOpenAuth,
  onGoToTrack,
  onComplaintSubmitted,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="card locked-container">
        <div className="locked-icon-wrapper">🔒</div>
        <h2 className="card-title" style={{ fontSize: "24px" }}>
          Citizen Authentication Required
        </h2>
        <p className="locked-desc">
          Only registered citizens can lodge public grievances. Please sign in
          or register to proceed.
        </p>
        <button
          onClick={() => onOpenAuth("citizen")}
          className="btn-primary"
          style={{ padding: "12px 32px" }}
        >
          Citizen Sign In / Register
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please choose an evidence photo.");
      return;
    }
    setIsSubmitting(true);
    setSubmittedId(null);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          imageUrl: base64Image,
          userEmail: normalizeEmail(user.email),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedId(data.complaintId || data._id);
        setTitle("");
        setDescription("");
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onComplaintSubmitted(); // ⬅️ new: refresh My Reports immediately
      } else {
        alert(data.error || "Failed to submit grievance.");
      }
    } catch {
      alert(
        "Failed to submit grievance. Make sure backend is running on port 5000.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">File a Public Issue</h2>
        <span className="badge-user">
          Logged in as: <strong>{user.name}</strong> ({user.email})
        </span>
      </div>

      {submittedId && (
        <div
          className="alert-success"
          style={{ margin: "20px 0", padding: "16px", borderRadius: "8px" }}
        >
          <div
            style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}
          >
            🎉 Grievance Logged Successfully!
          </div>
          <div>
            Your Official Tracking ID is:{" "}
            <strong
              style={{
                fontSize: "18px",
                color: "#0369a1",
                textDecoration: "underline",
              }}
            >
              {submittedId}
            </strong>
          </div>
          <p style={{ fontSize: "13px", marginTop: "6px", color: "#075985" }}>
            This has been linked to your email (<strong>{user.email}</strong>).
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => onGoToTrack(submittedId)}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              Track This Ticket Now →
            </button>
            <button
              onClick={() => {
                /* triggers refresh via parent */ window.dispatchEvent(
                  new Event("open-my-reports"),
                );
              }}
              className="btn-secondary"
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              📋 View in My History
            </button>
          </div>
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
          <label>Upload Evidence Photo</label>
          <input
            type="file"
            accept="image/*"
            required
            ref={fileInputRef}
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="form-group">
          <label>Incident Details & Landmark</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the exact location, prominent landmarks, and hazards..."
          />
        </div>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting Report..." : "Submit Incident Report"}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 5. Citizen's "My Reports" — fixed
// ==========================================
interface MyReportsProps {
  user: User | null;
  onOpenAuth: (role: "citizen" | "worker") => void;
  onSelectReportToTrack: (id: string) => void;
  refreshSignal: number; // parent increments this to force a refetch
}

const MyReports: React.FC<MyReportsProps> = ({
  user,
  onOpenAuth,
  onSelectReportToTrack,
  refreshSignal,
}) => {
  const [reports, setReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMyReports = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const email = normalizeEmail(user.email);
    if (!email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `${API_BASE}/api/complaints/user/${encodeURIComponent(email)}`,
      );
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setReports([]);
      setErrorMsg(
        err instanceof Error
          ? `Could not load your history: ${err.message}`
          : "Could not load your history.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports, refreshSignal]);

  if (!user) {
    return (
      <div className="card locked-container">
        <div className="locked-icon-wrapper">📋</div>
        <h2 className="card-title" style={{ fontSize: "24px" }}>
          View Your Grievance History
        </h2>
        <p className="locked-desc">
          Sign in to view all complaints you have submitted with their tracking
          IDs and live progress.
        </p>
        <button
          onClick={() => onOpenAuth("citizen")}
          className="btn-primary"
          style={{ padding: "12px 32px" }}
        >
          Citizen Sign In
        </button>
      </div>
    );
  }

  const filtered = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.complaintId.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="card-title">My Filed Grievances</h2>
          <div style={{ marginTop: "4px", fontSize: "13px", color: "#475569" }}>
            Account Email:{" "}
            <strong style={{ color: "#0284c7" }}>{user.email}</strong>
          </div>
        </div>
        <button
          onClick={fetchMyReports}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: "13px" }}
        >
          ⟳ Refresh
        </button>
      </div>

      {errorMsg && (
        <div className="alert-error" style={{ margin: "0 0 16px 0" }}>
          {errorMsg}
        </div>
      )}

      {reports.length > 0 && (
        <input
          type="text"
          placeholder="Search by ID, title, category or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        />
      )}

      {loading ? (
        <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
          Loading your reports...
        </p>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>
            No grievances found for this account.
          </p>
          <span style={{ fontSize: "13px" }}>
            Submit an issue using the <strong>Report Grievance</strong> tab
            above.
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
          No reports match "<strong>{searchQuery}</strong>".
        </p>
      ) : (
        <div className="table-responsive">
          <table className="complaint-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Title & Category</th>
                <th>Filed On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.complaintId}>
                  <td
                    style={{
                      fontWeight: 700,
                      color: "#0284c7",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.complaintId}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      {r.category}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      {r.description.slice(0, 60)}
                      {r.description.length > 60 ? "…" : ""}
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${r.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onSelectReportToTrack(r.complaintId)}
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Track Details →
                    </button>
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

// ==========================================
// 6. Track Issue — fixed
// ==========================================
interface TrackIssueProps {
  initialId?: string;
}

const TrackIssue: React.FC<TrackIssueProps> = ({ initialId = "" }) => {
  const [searchVal, setSearchVal] = useState(initialId);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchComplaint = useCallback(async (val: string) => {
    const q = val.trim();
    if (!q) return;
    setNotFound(false);
    setComplaint(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/complaints/${encodeURIComponent(q)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && (data.complaintId || data._id)) {
          setComplaint(data);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever a *new* initialId is injected (e.g. "Track This Ticket")
  useEffect(() => {
    if (initialId) {
      setSearchVal(initialId);
      fetchComplaint(initialId);
    }
  }, [initialId, fetchComplaint]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(searchVal);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Track Grievance Status</h2>
      </div>

      <form onSubmit={handleTrack} className="track-search-bar">
        <input
          type="text"
          placeholder="Enter Grievance ID (CIVIC-...) or Registered Email"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Searching..." : "Lookup"}
        </button>
      </form>

      {notFound && (
        <div className="alert-error" style={{ marginTop: "16px" }}>
          No records found matching <strong>{searchVal}</strong>.
        </div>
      )}

      {complaint && (
        <div className="complaint-card" style={{ marginTop: "20px" }}>
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
              <strong style={{ color: "#0284c7" }}>
                {complaint.complaintId}
              </strong>
            </div>
            <div className="meta-item">
              <span>Category</span>
              <strong>{complaint.category}</strong>
            </div>
            <div className="meta-item">
              <span>Reported Date</span>
              <strong>
                {new Date(complaint.createdAt).toLocaleDateString()}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            {complaint.description}
          </p>

          {complaint.imageUrl && (
            <div style={{ marginTop: "14px" }}>
              <img
                src={complaint.imageUrl}
                alt="Evidence"
                className="complaint-img"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. Worker Dashboard (unchanged)
// ==========================================
interface WorkerDashboardProps {
  user: User | null;
  onOpenAuth: (role: "citizen" | "worker") => void;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  user,
  onOpenAuth,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    if (user && user.role === "worker") fetchComplaints();
  }, [user]);

  if (!user || user.role !== "worker") {
    return (
      <div className="card locked-container">
        <div
          className="locked-icon-wrapper"
          style={{ background: "#fef2f2", borderColor: "#fecaca" }}
        >
          🛡️
        </div>
        <h2 className="card-title" style={{ fontSize: "24px" }}>
          Staff & Admin Access Only
        </h2>
        <p className="locked-desc">
          This portal is reserved for municipal workers and administrators to
          inspect, triage, and resolve issues.
        </p>
        <button
          onClick={() => onOpenAuth("worker")}
          className="btn-primary"
          style={{ background: "#0e294b", padding: "12px 32px" }}
        >
          Staff & Admin Sign In
        </button>
      </div>
    );
  }

  const handleStatusChange = async (
    complaintId: string,
    newStatus: "Pending" | "In Progress" | "Resolved",
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === complaintId ? { ...c, status: newStatus } : c,
          ),
        );
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm(`Permanently delete record ${complaintId}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${complaintId}`, {
        method: "DELETE",
      });
      if (res.ok)
        setComplaints((prev) =>
          prev.filter((c) => c.complaintId !== complaintId),
        );
      else alert("Failed to delete complaint");
    } catch {
      alert("Error contacting server");
    }
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved",
  ).length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    return (
      matchesStatus &&
      (c.complaintId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Complaints", value: totalCount, color: "#0e294b" },
          { label: "Pending Triage", value: pendingCount, color: "#d97706" },
          { label: "In Progress", value: inProgressCount, color: "#0284c7" },
          { label: "Resolved", value: resolvedCount, color: "#059669" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: "18px",
              textAlign: "center",
              borderTop: `4px solid ${stat.color}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: stat.color,
                marginTop: "4px",
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className="card-title">Municipal Worker Action Queue</h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Staff Operator: <strong>{user.name}</strong>
            </span>
          </div>
          <button
            onClick={fetchComplaints}
            className="btn-secondary"
            style={{ padding: "6px 14px" }}
          >
            ⟳ Refresh Queue
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by ID, keyword, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: "220px",
              padding: "9px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="table-select"
            style={{ padding: "9px 14px", borderRadius: "6px" }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {filteredComplaints.length === 0 ? (
          <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
            No complaints found.
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
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((item) => (
                  <tr key={item.complaintId}>
                    <td style={{ fontWeight: 600 }}>{item.complaintId}</td>
                    <td>
                      <div>{item.title}</div>
                      {item.imageUrl && (
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "12px", color: "#0284c7" }}
                        >
                          View Image Evidence ↗
                        </a>
                      )}
                    </td>
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
                          handleStatusChange(
                            item.complaintId,
                            e.target.value as
                              | "Pending"
                              | "In Progress"
                              | "Resolved",
                          )
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteComplaint(item.complaintId)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 8. Main Application
// ==========================================
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"report" | "my-reports" | "track">(
    "report",
  );
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRoleMode, setAuthRoleMode] = useState<"citizen" | "worker">(
    "citizen",
  );
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0); // forces MyReports to refetch

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) setUser(stored);
  }, []);

  // Listen for the "View in My History" event from ReportForm
  useEffect(() => {
    const handler = () => {
      setActiveTab("my-reports");
      setReportsRefreshKey((k) => k + 1);
    };
    window.addEventListener("open-my-reports", handler);
    return () => window.removeEventListener("open-my-reports", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("civic_user");
    localStorage.removeItem("civic_token");
    setUser(null);
  };

  const openAuthWithRole = (role: "citizen" | "worker") => {
    setAuthRoleMode(role);
    setIsAuthOpen(true);
  };

  const handleGoToTrack = (id: string) => {
    setSelectedTrackId(id);
    setActiveTab("track");
  };

  const handleComplaintSubmitted = () => {
    // Bump refresh key so next time My Reports mounts, it refetches.
    setReportsRefreshKey((k) => k + 1);
  };

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="nav-container">
          <div
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <CityPulseLogo />
            <span className="brand-text">
              City<span>Pulse</span>
            </span>
            {user?.role === "worker" && (
              <span
                style={{
                  fontSize: "11px",
                  background: "#0e294b",
                  color: "#38bdf8",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  marginLeft: "6px",
                }}
              >
                STAFF CONSOLE
              </span>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <div
                className="user-badge"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div style={{ textAlign: "right", lineHeight: "1.3" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0e294b",
                    }}
                  >
                    {user.role === "worker" ? "Staff" : "Citizen"}: {user.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    ✉️ {user.email}
                  </div>
                </div>
                <button className="btn-secondary" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-secondary"
                  onClick={() => openAuthWithRole("worker")}
                >
                  Staff Login
                </button>
                <button
                  className="btn-primary"
                  onClick={() => openAuthWithRole("citizen")}
                >
                  Citizen Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {user?.role === "worker" ? (
        <main
          className="container"
          style={{ marginTop: "30px", marginBottom: "60px" }}
        >
          <WorkerDashboard user={user} onOpenAuth={openAuthWithRole} />
        </main>
      ) : (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="hero-pill">Official Municipal Grievance Desk</div>
              <h1 className="hero-title">Welcome to CityPulse</h1>
              <p className="hero-subtitle">
                A real-time civic portal connecting residents directly with
                local authorities. Report infrastructure hazards, track
                resolutions, and monitor live city status.
              </p>
            </div>
          </section>

          <main
            className="container"
            id="action-portal"
            style={{ marginTop: "24px" }}
          >
            <div className="tabs-wrapper">
              <div className="tabs">
                <button
                  className={activeTab === "report" ? "active" : ""}
                  onClick={() => setActiveTab("report")}
                >
                  Report Grievance
                </button>
                <button
                  className={activeTab === "my-reports" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("my-reports");
                    setReportsRefreshKey((k) => k + 1); // fetch fresh data whenever the user opens history
                  }}
                >
                  My Filed Reports {user ? `(${user.name.split(" ")[0]})` : ""}
                </button>
                <button
                  className={activeTab === "track" ? "active" : ""}
                  onClick={() => setActiveTab("track")}
                >
                  Track Issue
                </button>
              </div>
            </div>

            {activeTab === "report" && (
              <ReportForm
                user={user}
                onOpenAuth={openAuthWithRole}
                onGoToTrack={handleGoToTrack}
                onComplaintSubmitted={handleComplaintSubmitted}
              />
            )}
            {activeTab === "my-reports" && (
              <MyReports
                user={user}
                onOpenAuth={openAuthWithRole}
                onSelectReportToTrack={handleGoToTrack}
                refreshSignal={reportsRefreshKey}
              />
            )}
            {activeTab === "track" && (
              <TrackIssue initialId={selectedTrackId} />
            )}
          </main>
        </>
      )}

      <footer className="footer" style={{ marginTop: "60px" }}>
        <p>
          &copy; {new Date().getFullYear()} CityPulse Municipal Operations.
          Empowering citizen-first governance.
        </p>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        defaultRole={authRoleMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
};

export default App;
