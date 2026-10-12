import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./Dashboard.css";

// --- Category helpers ---
const guessCategory = (name = "") => {
  const n = name.toLowerCase();
  if (/(netflix|spotify|prime|showmax|youtube|disney|hulu|music|video)/.test(n)) return "Streaming";
  if (/(data|airtime|mtn|glo|airtel|9mobile|internet|wifi)/.test(n)) return "Telecom";
  if (/(adobe|notion|figma|google|office|canva|dropbox|github)/.test(n)) return "Productivity";
  if (/(bank|loan|paypal|paystack|flutterwave)/.test(n)) return "Finance";
  return "Other";
};

// --- Donut Chart ---
const DonutChart = ({ items, total, formatMoney, onSelect, selected }) => {
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const size = 180;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const GAP = 0.012;
  const active = selected || hovered;

  const segments = useMemo(() => items.map((seg, index) => {
    const rawPct = total > 0 ? seg.value / total : 0;
    const pct = Math.max(rawPct - GAP, 0);
    const offset = items.slice(0, index).reduce((sum, s) => sum + (total > 0 ? s.value / total : 0), 0);
    return { ...seg, pct, offset, rawPct };
  }), [items, total]);

  const toggleSelect = (label) => onSelect?.(selected === label ? null : label);

  return (
    <div className="donutWrap">
      <div className="donutSvgWrap">
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--donut-track)" strokeWidth={stroke} />
          {segments.map((seg, idx) => {
            const dash = seg.pct * c;
            const dashArray = mounted ? `${dash} ${c - dash}` : `0 ${c}`;
            const isActive = active === seg.label;
            const isDimmed = active && !isActive;
            return (
              <circle
                key={seg.label}
                cx={size/2} cy={size/2} r={r}
                fill="none" stroke={seg.color}
                strokeWidth={isDimmed ? stroke - 4 : stroke}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={-seg.offset * c}
                transform={`rotate(-90 ${size/2} ${size/2})`}
                style={{
                  opacity: isDimmed ? 0.35 : 1,
                  transition: `stroke-dasharray 650ms ease ${idx * 60}ms, opacity 200ms`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(seg.label)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggleSelect(seg.label)}
              />
            );
          })}
        </svg>
        <div className="donutCenter">
          <div className="donutCenterLabel">Total</div>
          <div className="donutCenterValue">{formatMoney(total)}</div>
        </div>
      </div>
      <div className="donutLegend">
        {segments.map((seg) => {
          const isActive = active === seg.label;
          const isDimmed = active && !isActive;
          return (
            <div key={seg.label} className="donutLegendItem"
              style={{ opacity: isDimmed ? 0.4 : 1 }}
              onMouseEnter={() => setHovered(seg.label)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => toggleSelect(seg.label)}
            >
              <span className="donutLegendDot" style={{ background: seg.color }} />
              <span>{seg.label}</span>
            </div>
          );
        })}
      </div>
      {selected && (
        <button className="donutClearBtn" onClick={() => onSelect?.(null)}>Clear filter</button>
      )}
    </div>
  );
};

// --- Date helpers ---
const toLocalDate = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const nextMonthlyDueDate = (dueDate) => {
  const today = startOfDay(new Date());
  let next = startOfDay(dueDate);
  while (next < today) next = new Date(next.getFullYear(), next.getMonth() + 1, next.getDate());
  return next;
};
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from([...atob(base64)].map((c) => c.charCodeAt(0)));
};
const formatDueDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = toLocalDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// --- Icons ---
const IconSpend   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconSubs    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8"/></svg>;
const IconRenewal = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconSavings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M18 2v4h4"/></svg>;
const IconBell    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconChevron = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>;

// --- SubLogo ---
const SubLogo = ({ name }) => {
  const map = {
    netflix: { bg: "#E50914" }, spotify: { bg: "#1DB954" },
    prime: { bg: "#00A8E1" }, youtube: { bg: "#FF0000" },
    hulu: { bg: "#3DBB3D" }, showmax: { bg: "#E50914" },
    disney: { bg: "#113CCF" }, duolingo: { bg: "#58CC02" },
    chatgpt: { bg: "#10a37f" },
  };
  const key = Object.keys(map).find((k) => name?.toLowerCase().includes(k));
  const bg = key ? map[key].bg : "#6B7280";
  return <div className="subLogo" style={{ background: bg }}>{name?.[0]?.toUpperCase() || "?"}</div>;
};

// --- Toggle ---
const Toggle = ({ checked, onChange }) => (
  <button type="button" className={`toggle ${checked ? "toggle--on" : "toggle--off"}`}
    onClick={() => onChange?.(!checked)} aria-checked={checked} role="switch">
    <span className="toggleThumb" />
  </button>
);

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [subs, setSubs] = useState(() => JSON.parse(localStorage.getItem(`subs_${user}`) || "[]"));
  const [currency, setCurrency] = useState(() => localStorage.getItem(`currency_${user}`) || "NGN");
  const [pushStatus, setPushStatus] = useState("idle");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeToggles, setActiveToggles] = useState(() =>
    JSON.parse(localStorage.getItem(`toggles_${user}`) || "{}")
  );

  const saveSubs = (updated) => { setSubs(updated); localStorage.setItem(`subs_${user}`, JSON.stringify(updated)); };
  const deleteSub = (index) => saveSubs(subs.filter((_, i) => i !== index));
  const editSubAmount = (index) => {
    const raw = window.prompt("Enter new amount", String(subs[index]?.amount ?? ""));
    if (raw == null) return;
    const next = Number(raw);
    if (Number.isNaN(next) || next < 0) { window.alert("Enter a valid number."); return; }
    saveSubs(subs.map((s, i) => i === index ? { ...s, amount: String(next) } : s));
  };
  const toggleActive = (index) => {
    const next = { ...activeToggles, [index]: !activeToggles[index] };
    setActiveToggles(next);
    localStorage.setItem(`toggles_${user}`, JSON.stringify(next));
  };

  const total = useMemo(() => subs.reduce((acc, s) => acc + Number(s.amount || 0), 0), [subs]);
  const activeSubs = useMemo(() => subs.filter((_, i) => activeToggles[i] !== false), [subs, activeToggles]);

  const expiringSoon = useMemo(() => {
    const today = startOfDay(new Date());
    return subs.filter((s) => {
      if (!s.dueDate) return false;
      const p = toLocalDate(s.dueDate); if (!p) return false;
      return Math.round((nextMonthlyDueDate(p) - today) / 86400000) <= 30;
    });
  }, [subs]);

  const upcomingRenewals = expiringSoon.length;
  const potentialSavings = useMemo(() => Math.round(total * 0.15), [total]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

  const visibleSubs = useMemo(() => {
    if (!selectedCategory) return subs;
    return subs.filter((s) => (s.category || guessCategory(s.name)) === selectedCategory);
  }, [subs, selectedCategory]);

  const categoryData = useMemo(() => {
    const map = new Map();
    for (const s of subs) {
      const amt = Number(s.amount || 0); if (!amt) continue;
      const cat = s.category || guessCategory(s.name);
      map.set(cat, (map.get(cat) || 0) + amt);
    }
    const colors = { Streaming: "#2563eb", Finance: "#60a5fa", Productivity: "#93c5fd", Telecom: "#38bdf8", Other: "#d1d5db" };
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value, color: colors[label] || colors.Other }))
      .sort((a, b) => b.value - a.value);
  }, [subs]);

  const reminders = useMemo(() => {
    const today = startOfDay(new Date());
    return subs.flatMap((sub) => {
      if (!sub.dueDate) return [];
      const p = toLocalDate(sub.dueDate); if (!p) return [];
      const nextDue = nextMonthlyDueDate(p);
      const daysUntil = Math.round((nextDue - today) / 86400000);
      return daysUntil <= 7 ? [{ sub, daysUntil, nextDue }] : [];
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [subs]);

  useEffect(() => {
    if (!user || !("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [user]);

  const enablePush = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) { setPushStatus("unsupported"); return; }
    setPushStatus("working");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { setPushStatus("denied"); return; }
    try {
      const ready = await navigator.serviceWorker.ready;
      let sub = await ready.pushManager.getSubscription();
      if (!sub) {
        const res = await fetch("/api/push/vapid-public-key");
        const data = await res.json();
        sub = await ready.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(data.publicKey) });
      }
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      setPushStatus("enabled");
    } catch { setPushStatus("error"); }
  };

  const dashNav = [
    { label: "Overview", icon: "⊞", active: true },
    { label: "Subscriptions", icon: "☰" },
    { label: "Renewal & Alerts", icon: "⏰" },
    { label: "Spending & Insights", icon: "📈" },
    { label: "Alternatives", icon: "⇄" },
  ];
  const generalNav = [
    { label: "Currency Settings", icon: "$" },
    { label: "Notifications", icon: "🔔" },
    { label: "Settings", icon: "⚙" },
    { label: "Log out", icon: "↩", action: onLogout },
  ];

  return (
    <div className="dashPage">
      <div className="dashShell">

        {/* ── Sidebar ── */}
        <aside className="dashSidebar">
          <div className="dashBrand">
            <div className="dashLogoMark">S</div>
            <span className="dashBrandText">SORA</span>
          </div>

          <div className="dashSearchWrap">
            <svg className="dashSearchIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="dashSearch" placeholder="Search" />
            <span className="dashSearchCmd">⌘K</span>
          </div>

          <div className="dashNavGroup">
            <div className="dashNavGroupLabel">Dashboard</div>
            <nav className="dashNav">
              {dashNav.map((item) => (
                <button key={item.label} className={`dashNavItem ${item.active ? "dashNavItem--active" : ""}`} type="button">
                  <span className="dashNavIcon">{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="dashNavGroup dashNavGroup--bottom">
            <div className="dashNavGroupLabel">General</div>
            <nav className="dashNav">
              {generalNav.map((item) => (
                <button key={item.label} className="dashNavItem" type="button" onClick={item.action}>
                  <span className="dashNavIcon">{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="dashSidebarFooter">
            <button className="dashNavItem dashNavItem--muted" type="button">
              <span className="dashNavIcon">?</span>Help &amp; Support
            </button>
            <button className="dashNavItem dashNavItem--upgrade" type="button">
              <span className="dashNavIcon">↑</span>Upgrade Plan
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="dashMain">

          {/* Topbar */}
          <div className="dashTopbar">
            <div className="dashTopLeft">
              <h1 className="dashTitle">Overview</h1>
              <p className="dashWelcome">Welcome back, {user || "there"}!</p>
            </div>
            <div className="dashTopRight">
              <select value={currency}
                onChange={(e) => { setCurrency(e.target.value); localStorage.setItem(`currency_${user}`, e.target.value); }}
                className="dashCurrencySelect">
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
              </select>
              <button className="dashIconBtn" onClick={enablePush} aria-label="Notifications">
                <IconBell />
                {pushStatus === "enabled" && <span className="dashNotifDot" />}
              </button>
              <div className="dashAvatar">{user?.[0]?.toUpperCase() || "U"}</div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="dashContent">

            {/* Stat Cards */}
            <div className="dashStatsRow">
              <div className="dashStatCard">
                <div className="dashStatTop">
                  <span className="dashStatLabel">Total Monthly Spending</span>
                  <span className="dashStatIcon dashStatIcon--blue"><IconSpend /></span>
                </div>
                <div className="dashStatValue">{formatMoney(total)}</div>
                <div className="dashStatSub">/mo</div>
              </div>
              <div className="dashStatCard">
                <div className="dashStatTop">
                  <span className="dashStatLabel">Active Subscriptions</span>
                  <span className="dashStatIcon dashStatIcon--green"><IconSubs /></span>
                </div>
                <div className="dashStatValue dashStatValue--row">
                  {activeSubs.length}
                  {expiringSoon.length > 0 && (
                    <span className="dashStatBadge dashStatBadge--warn">⚠ {expiringSoon.length} expiring</span>
                  )}
                </div>
              </div>
              <div className="dashStatCard">
                <div className="dashStatTop">
                  <span className="dashStatLabel">Upcoming Renewals</span>
                  <span className="dashStatIcon dashStatIcon--orange"><IconRenewal /></span>
                </div>
                <div className="dashStatValue dashStatValue--row">
                  {upcomingRenewals}
                  <span className="dashStatBadge dashStatBadge--blue">Next 30 days</span>
                </div>
              </div>
              <div className="dashStatCard">
                <div className="dashStatTop">
                  <span className="dashStatLabel">Potential Savings</span>
                  <span className="dashStatIcon dashStatIcon--purple"><IconSavings /></span>
                </div>
                <div className="dashStatValue">{formatMoney(potentialSavings)}</div>
                <div className="dashStatSub">/mo</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="dashContentGrid">

              {/* LEFT */}
              <div className="dashLeft">
                <div className="dashCard">
                  <div className="dashCardHeader">
                    <h3 className="dashCardTitle">Active subscriptions</h3>
                    <button className="dashViewMore" onClick={() => navigate("/add")}>+ Add new</button>
                  </div>

                  {subs.length === 0 ? (
                    <div>
                      <p className="dashEmpty">No subscriptions yet.</p>
                      <button className="dashAddBtn" onClick={() => navigate("/add")}>+ Add subscription</button>
                    </div>
                  ) : (
                    <>
                      <table className="subTable">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Monthly Cost</th>
                            <th>Renewal Date</th>
                            <th>Status</th>
                            <th>Active</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleSubs.map((sub, i) => {
                            const idx = subs.indexOf(sub);
                            const isOn = activeToggles[idx] !== false;
                            return (
                              <tr key={i} className="subRow">
                                <td>
                                  <div className="subNameCell">
                                    <SubLogo name={sub.name} />
                                    <span className="subName">{sub.name}</span>
                                  </div>
                                </td>
                                <td className="subAmount">{formatMoney(Number(sub.amount || 0))}</td>
                                <td className="subDate">{formatDueDate(sub.dueDate)}</td>
                                <td>
                                  <span className={`subStatus ${isOn ? "subStatus--active" : "subStatus--inactive"}`}>
                                    {isOn ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td><Toggle checked={isOn} onChange={() => toggleActive(idx)} /></td>
                                <td>
                                  <div className="subActions">
                                    <button className="subEditBtn" onClick={() => editSubAmount(idx)}>Edit</button>
                                    <button className="subDeleteBtn" onClick={() => deleteSub(idx)}>✕</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <button className="dashAddBtn" onClick={() => navigate("/add")}>+ Add subscription</button>
                    </>
                  )}
                </div>

                {/* Alerts + Alternatives */}
                <div className="dashBottomRow">
                  <div className="dashCard">
                    <div className="dashCardHeader">
                      <h3 className="dashCardTitle">Alert &amp; Warnings</h3>
                      <span className="dashCardMeta">Upcoming dues</span>
                    </div>
                    {reminders.length === 0 ? (
                      <p className="dashEmpty">No upcoming reminders.</p>
                    ) : (
                      <div className="alertList">
                        {reminders.map((r) => (
                          <div key={`${r.sub.name}_${r.nextDue.toISOString()}`} className="alertItem">
                            <span className="alertBell">🔔</span>
                            <span className="alertText">{r.sub.name} renews in {r.daysUntil} day{r.daysUntil !== 1 ? "s" : ""}</span>
                            <span className="alertChevron"><IconChevron /></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="dashCard">
                    <div className="dashCardHeader">
                      <h3 className="dashCardTitle">Cheaper &amp; Alternatives</h3>
                    </div>
                    <div className="altGrid">
                      {[{ name: "Hulu", price: 12000, bg: "#3DBB3D" }, { name: "Showmax", price: 11000, bg: "#E50914" }].map((alt) => (
                        <div key={alt.name} className="altCard">
                          <div className="altLogo" style={{ background: alt.bg }}>{alt.name[0]}</div>
                          <div className="altName">{alt.name}</div>
                          <div className="altPrice">{formatMoney(alt.price)} <span>/mo</span></div>
                          <button className="altBtn">Switch</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Donut */}
              <div className="dashRight">
                <div className="dashCard">
                  <div className="dashCardHeader">
                    <h3 className="dashCardTitle">Spend by Category</h3>
                    <span className="dashCardMeta">This month</span>
                  </div>
                  {total <= 0 ? (
                    <p className="dashEmpty">Add subscriptions to see breakdown.</p>
                  ) : (
                    <DonutChart items={categoryData} total={total} formatMoney={formatMoney}
                      onSelect={setSelectedCategory} selected={selectedCategory} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
