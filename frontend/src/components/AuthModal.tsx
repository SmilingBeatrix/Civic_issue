import React, { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`https://civic-issue-e82d.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("civic_user", JSON.stringify(data.user));
        localStorage.setItem("civic_token", data.token);
        onSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError(
        "Backend service unreachable. Check if server is running on port 5000.",
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <h3>
            {isLogin ? "Citizen Portal Login" : "Register Citizen Account"}
          </h3>
          <p>
            {isLogin
              ? "Access your civic dashboard and file issues"
              : "Create an account to track and report incidents"}
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
            style={{ marginTop: "8px" }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account yet? " : "Already registered? "}
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
