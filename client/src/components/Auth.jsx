import { useState } from "react";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");

  const login = () => {
    if (!email || !email.trim()) return;

    const normalizedEmail = email.trim().toLowerCase();
    localStorage.setItem("user", normalizedEmail);
    onLogin(normalizedEmail);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <button onClick={login}>Continue</button>
    </div>
  );
}
