import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email.trim()) return;
    onLogin(email.trim().toLowerCase());
  };

  return (
    <div className="auth-page">
      <div style={styles.page}>
        <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Track and manage your subscriptions
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Continue
        </button>
      </div>
    </div>
  </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    padding: 16,
    fontFamily: "Inter, system-ui, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 360,
    background: "#fff",
    padding: "28px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  title: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 6,
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px 0",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};
