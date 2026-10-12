import { useState } from "react";

export default function AddSubscription({ user: userProp }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const user = userProp || localStorage.getItem("user");

  const save = () => {
    if (!name || !amount || !user) return;

    const key = `subs_${user}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    existing.push({
      name,
      amount: Number(amount),
      dueDate: dueDate || "",
    });

    localStorage.setItem(key, JSON.stringify(existing));
    window.location.href = "/";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add subscription</h2>

      <input
        placeholder="App name (Netflix)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <input
        placeholder="Monthly amount (₦)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        placeholder="Due date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ marginTop: 12 }}
      />

      <button
        onClick={save}
        style={{
          marginTop: 20,
          background: "#3b82f6",
          color: "#fff",
          width: "100%",
        }}
      >
        Save
      </button>
    </div>
  );
}
