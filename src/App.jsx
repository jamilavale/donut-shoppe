import React, { useState, useEffect, useMemo } from "react";
import { Plus, Minus, Coffee, Users, RotateCcw, Receipt, X, Check, DollarSign } from "lucide-react";

// ─── Menu (Interweave Donut Shoppe — Sept 2025) ──────────────────────────────
// Items are alphabetized within each section; related variants stay adjacent.
const MENU = [
  {
    section: "Donuts & Pastries",
    items: [
      { id: "fritter",     name: "Apple Fritter",          price: 1.75 },
      { id: "cake",        name: "Cake",                   price: 1.50 },
      { id: "cinn_roll",   name: "Cinnamon Roll",          price: 1.75 },
      { id: "filled",      name: "Filled Donut",           price: 2.00, note: "Cream/Rasp" },
      { id: "holes",       name: "Donut Holes",            price: 0.25, note: "4/$1" },
      { id: "glazed",      name: "Glazed",                 price: 1.25 },
      { id: "kol_cheese",  name: "Kolachi · Cheese",       price: 1.75 },
      { id: "kol_jal",     name: "Kolachi · Jalapeño",     price: 1.75 },
      { id: "kol_plain",   name: "Kolachi · Plain",        price: 1.75 },
      { id: "muffin",      name: "Muffins",                price: 3.75 },
      { id: "sour_cream",  name: "Sour Cream",             price: 1.75 },
      { id: "choc_sour",   name: "Sour Cream · Choc",      price: 1.75 },
      { id: "sprinkles",   name: "Sprinkles",              price: 1.50 },
      { id: "vegan",       name: "Vegan",                  price: 3.75 },
    ],
  },
  {
    section: "Snacks",
    items: [
      { id: "cheezit",  name: "Cheez-It",         price: 0.75 },
      { id: "chips",    name: "Chips/Pretzels",   price: 1.00 },
      { id: "fruitbar", name: "Fruit Bar",        price: 1.00 },
      { id: "gum",      name: "Gum/Mints",        price: 2.00 },
      { id: "hershey",  name: "Hershey Candy",    price: 2.00 },
      { id: "kindbar",  name: "Kind Bar",         price: 2.00 },
      { id: "nutella",  name: "Nutella Snack",    price: 2.00 },
      { id: "protbar",  name: "Protein Bar",      price: 2.00 },
      { id: "trailmix", name: "Trail Mix",        price: 1.00 },
    ],
  },
  {
    section: "Yogurt & Fruit",
    items: [
      { id: "gogo",     name: "GoGo Squeeze",     price: 1.25 },
      { id: "mandarin", name: "Mandarin Cup",     price: 1.25 },
    ],
  },
  {
    section: "Drinks",
    items: [
      { id: "bai",      name: "Bai Supertea",     price: 2.75 },
      { id: "water",    name: "Bottled Water",    price: 0.50 },
      { id: "coconut",  name: "Coconut Juice",    price: 2.50 },
      { id: "frap",     name: "Frappuccino",      price: 3.00 },
      { id: "gatorade", name: "Gatorade",         price: 1.25 },
      { id: "icetea",   name: "Ice Tea",          price: 1.00 },
      { id: "juice",    name: "Juice Box",        price: 0.75 },
      { id: "milk",     name: "Milk",             price: 1.75 },
      { id: "shake",    name: "Premier Protein",  price: 3.50 },
      { id: "soft",     name: "Soft Drinks",      price: 1.00 },
      { id: "sparkle",  name: "Sparkling Water",  price: 1.00 },
      { id: "topo",     name: "Topo Chico",       price: 2.50 },
      { id: "vitamin",  name: "Vitaminwater",     price: 2.00 },
    ],
  },
];

const FLAT = MENU.flatMap(s => s.items);
const NAME = Object.fromEntries(FLAT.map(i => [i.id, i.name]));
const PRICE = Object.fromEntries(FLAT.map(i => [i.id, i.price]));
const fmt = n => `$${n.toFixed(2)}`;

const STORE_KEY = "interweave_shift_v2";

export default function App() {
  const [order, setOrder] = useState({});
  const [shift, setShift] = useState({ sold: {}, staffCount: 0, revenue: 0, transactions: 0 });
  const [tendered, setTendered] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setShift(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(shift)); } catch (e) {}
  }, [shift]);

  const orderTotal = useMemo(
    () => Object.entries(order).reduce((s, [id, q]) => s + PRICE[id] * q, 0),
    [order]
  );

  const tenderNum = parseFloat(tendered) || 0;
  const change = tenderNum - orderTotal;

  const bump = (id, delta) => {
    setOrder(o => {
      const next = { ...o, [id]: Math.max(0, (o[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1400);
  };

  const tallyStaff = () => {
    setShift(s => ({ ...s, staffCount: s.staffCount + 1 }));
    flash(`Staff freebie tallied · ${shift.staffCount + 1} total`);
  };

  const undoStaff = () => {
    if (shift.staffCount === 0) return;
    setShift(s => ({ ...s, staffCount: Math.max(0, s.staffCount - 1) }));
    flash("Removed last staff tally");
  };

  const completeOrder = () => {
    if (orderTotal === 0) return;
    if (tenderNum > 0 && change < 0) {
      flash("Not enough cash tendered");
      return;
    }
    setShift(s => {
      const sold = { ...s.sold };
      Object.entries(order).forEach(([id, q]) => {
        sold[id] = (sold[id] || 0) + q;
      });
      return {
        ...s,
        sold,
        revenue: s.revenue + orderTotal,
        transactions: s.transactions + 1,
      };
    });
    flash(`Order complete · ${fmt(orderTotal)}`);
    setOrder({});
    setTendered("");
  };

  const cancelOrder = () => {
    setOrder({});
    setTendered("");
  };

  const resetShift = () => {
    setShift({ sold: {}, staffCount: 0, revenue: 0, transactions: 0 });
    setOrder({});
    setTendered("");
    setConfirmReset(false);
    setShowSummary(false);
    flash("Shift reset");
  };

  const changeBreakdown = useMemo(() => {
    if (change <= 0) return [];
    let cents = Math.round(change * 100);
    const denoms = [
      [2000, "$20"], [1000, "$10"], [500, "$5"], [100, "$1"],
      [25, "qtr"], [10, "dime"], [5, "nickel"], [1, "penny"],
    ];
    const out = [];
    for (const [v, label] of denoms) {
      const n = Math.floor(cents / v);
      if (n > 0) {
        out.push({ label: n > 1 && !label.startsWith("$") ? label + "s" : label, count: n });
        cents -= n * v;
      }
    }
    return out;
  }, [change]);

  const orderLines = Object.entries(order);
  const hasOrder = orderLines.length > 0;

  const summary = useMemo(() => {
    const soldEntries = FLAT.map(i => ({
      ...i,
      qty: shift.sold[i.id] || 0,
    }));
    const totalSold = soldEntries.reduce((s, x) => s + x.qty, 0);
    const unsold = soldEntries.filter(x => x.qty === 0);
    const sold = soldEntries.filter(x => x.qty > 0).sort((a, b) => b.qty - a.qty);
    return { totalSold, unsold, sold };
  }, [shift]);

  return (
    <div className="app">
      <style>{css}</style>

      {/* ─── Header ─── */}
      <header className="hdr">
        <div className="hdr-l">
          <div className="logo">
            <span className="logo-dot" />
            <span className="logo-dot logo-dot-2" />
          </div>
          <div>
            <h1>Interweave Donut Shoppe</h1>
            <p className="sub">Sunday Register</p>
          </div>
        </div>
        <div className="hdr-clock">
          <span className="clock-time">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="clock-date">{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="hdr-r">
          <div className="staff-group">
            <button
              className="staff-btn"
              onClick={tallyStaff}
              title="Tap to tally a staff freebie"
            >
              <Users size={16} />
              <span className="staff-lbl">Staff freebie</span>
              <span className="staff-num">{shift.staffCount}</span>
            </button>
            <button
              className="staff-undo"
              onClick={undoStaff}
              disabled={shift.staffCount === 0}
              title="Remove last staff tally"
              aria-label="Remove last staff tally"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
          </div>
          <button className="btn-summary" onClick={() => setShowSummary(true)}>
            <Receipt size={16} /> Summary
          </button>
        </div>
      </header>

      <div className="body">
        {/* ─── Menu side: all sections visible ─── */}
        <main className="menu">
          {MENU.map(section => (
            <div key={section.section} className="section">
              <h2 className="sec-hdr">{section.section}</h2>
              <div className="grid">
                {section.items.map(it => {
                  const q = order[it.id] || 0;
                  return (
                    <button
                      key={it.id}
                      className={`item ${q > 0 ? "item-on" : ""}`}
                      onClick={() => bump(it.id, 1)}
                      onContextMenu={(e) => { e.preventDefault(); bump(it.id, -1); }}
                      title={`Tap to add · right-click to remove${it.note ? ` · ${it.note}` : ""}`}
                    >
                      {q > 0 && (
                        <span
                          className="item-minus"
                          onClick={(e) => { e.stopPropagation(); bump(it.id, -1); }}
                          title="Remove one"
                        >
                          <Minus size={11} strokeWidth={3} />
                        </span>
                      )}
                      {q > 0 && <span className="item-q">{q}</span>}
                      <span className="item-name">{it.name}</span>
                      <span className="item-price">
                        {fmt(it.price)}{it.note && <em> · {it.note}</em>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </main>

        {/* ─── Order side ─── */}
        <aside className="ticket">
          <div className="ticket-hdr">
            <Coffee size={16} />
            <span>Order</span>
            {hasOrder && (
              <button className="x" onClick={cancelOrder} title="Clear order">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ticket-body">
            {!hasOrder && (
              <div className="empty">
                <Coffee size={28} strokeWidth={1.2} />
                <p>Tap items to start</p>
              </div>
            )}
            {hasOrder && (
              <ul className="lines">
                {orderLines.map(([id, q]) => (
                  <li key={id} className="line">
                    <span className="line-q">{q}×</span>
                    <span className="line-n">{NAME[id]}</span>
                    <span className="line-p">{fmt(PRICE[id] * q)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="totals">
            <div className="total-big">
              <span>Total</span>
              <span>{fmt(orderTotal)}</span>
            </div>

            <div className="tender-input">
              <DollarSign size={14} />
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="Cash tendered"
                value={tendered}
                onChange={e => setTendered(e.target.value)}
                disabled={!hasOrder}
              />
            </div>

            <div className="quick">
              {[5, 10, 20, 50].map(v => (
                <button key={v}
                  className="quick-b"
                  disabled={!hasOrder}
                  onClick={() => setTendered(String(v.toFixed(2)))}>
                  ${v}
                </button>
              ))}
              <button className="quick-b" disabled={!hasOrder}
                onClick={() => setTendered(orderTotal.toFixed(2))}>
                Exact
              </button>
            </div>

            {tenderNum > 0 && hasOrder && (
              <div className={`change ${change < 0 ? "change-bad" : ""}`}>
                <div className="change-row">
                  <span>{change >= 0 ? "Change" : "Owed"}</span>
                  <span className="change-amt">{fmt(Math.abs(change))}</span>
                </div>
                {change > 0 && changeBreakdown.length > 0 && (
                  <div className="change-break">
                    {changeBreakdown.map((b, i) => (
                      <span key={i} className="chip">
                        {b.count}× {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              className="complete"
              disabled={!hasOrder}
              onClick={completeOrder}
            >
              <Check size={16} /> Complete order
            </button>
          </div>
        </aside>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* ─── Summary modal ─── */}
      {showSummary && (
        <div className="modal-bg" onClick={() => setShowSummary(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>End of Shift Summary</h2>
              <button className="x" onClick={() => setShowSummary(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-stats">
              <div className="m-stat">
                <span className="m-n">{summary.totalSold}</span>
                <span className="m-l">items sold</span>
              </div>
              <div className="m-stat">
                <span className="m-n">{fmt(shift.revenue)}</span>
                <span className="m-l">revenue</span>
              </div>
              <div className="m-stat">
                <span className="m-n">{shift.transactions}</span>
                <span className="m-l">orders</span>
              </div>
              <div className="m-stat">
                <span className="m-n">{shift.staffCount}</span>
                <span className="m-l">staff freebies</span>
              </div>
            </div>

            <div className="modal-cols">
              <section>
                <h3>Sold</h3>
                {summary.sold.length === 0 ? (
                  <p className="muted">No sales yet.</p>
                ) : (
                  <ul className="sumlist">
                    {summary.sold.map(x => (
                      <li key={x.id}>
                        <span className="sl-q">{x.qty}</span>
                        <span className="sl-n">{x.name}</span>
                        <span className="sl-p">{fmt(x.qty * x.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3>Didn't sell</h3>
                {summary.unsold.length === 0 ? (
                  <p className="muted">Everything moved.</p>
                ) : (
                  <ul className="sumlist sumlist-unsold">
                    {summary.unsold.map(x => (
                      <li key={x.id}><span className="sl-n">{x.name}</span></li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="modal-foot">
              {!confirmReset ? (
                <button className="reset" onClick={() => setConfirmReset(true)}>
                  <RotateCcw size={16} /> Reset shift
                </button>
              ) : (
                <div className="confirm">
                  <span>Erase all shift totals?</span>
                  <button className="reset reset-yes" onClick={resetShift}>Yes, reset</button>
                  <button className="reset reset-no" onClick={() => setConfirmReset(false)}>Cancel</button>
                </div>
              )}
              <button className="done" onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --cream: #FDF6EC;
  --cream-2: #F7EAD4;
  --sugar: #FFFCF7;
  --ink: #2A1810;
  --ink-soft: #5C3D2E;
  --pink: #E8869B;
  --pink-deep: #D14E72;
  --choc: #6B3410;
  --choc-light: #A0612E;
  --gold: #D9962B;
  --green: #4F7A4A;
  --red: #B83A2E;
  --line: #E8D9BF;
  --shadow: 0 1px 0 rgba(107,52,16,.04), 0 8px 24px -12px rgba(107,52,16,.18);
}

* { box-sizing: border-box; }
body { margin: 0; }

.app {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background:
    radial-gradient(circle at 12% 8%, rgba(232,134,155,.08), transparent 40%),
    radial-gradient(circle at 88% 92%, rgba(217,150,43,.07), transparent 45%),
    var(--cream);
  color: var(--ink);
  min-height: 100vh;
  height: 100vh;
  padding: 10px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.hdr {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; flex-wrap: wrap;
  background: var(--sugar);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px 14px;
  margin-bottom: 10px;
  box-shadow: var(--shadow);
  flex-shrink: 0;
}
.hdr-l { display: flex; align-items: center; gap: 12px; }
.logo {
  width: 36px; height: 36px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #FFE9C7, #F0C079 60%, #C7873E 100%);
  position: relative;
  box-shadow: inset 0 0 0 5px rgba(255,255,255,.35), 0 4px 12px rgba(160,97,46,.3);
}
.logo::after {
  content: ""; position: absolute; inset: 11px;
  border-radius: 50%; background: var(--cream);
  box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
}
.logo-dot { position: absolute; width: 4px; height: 4px; border-radius: 50%;
  background: var(--pink-deep); top: 7px; left: 10px; z-index: 2; }
.logo-dot-2 { background: var(--choc); top: 20px; right: 8px; left: auto; }

.hdr h1 {
  font-family: 'Fraunces', serif;
  font-weight: 900;
  font-size: 18px;
  margin: 0;
  letter-spacing: -0.01em;
  font-variation-settings: 'opsz' 144;
}
.sub { margin: 1px 0 0; font-size: 10px; color: var(--ink-soft);
  letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }

.hdr-clock {
  display: flex; flex-direction: column; align-items: center;
  margin: 0 auto;
}
.clock-time {
  font-family: 'Fraunces', serif;
  font-weight: 700; font-size: 20px;
  letter-spacing: 0.02em;
  color: var(--ink);
  line-height: 1;
}
.clock-date {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-soft);
  margin-top: 2px;
}

.hdr-r { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* Staff freebie group — main button + undo */
.staff-group {
  display: inline-flex;
  align-items: stretch;
  gap: 0;
}
.staff-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #FFF1E0, #FCE3C5);
  border: 1.5px dashed var(--choc-light);
  border-right: none;
  color: var(--choc);
  border-radius: 10px 0 0 10px;
  padding: 8px 12px;
  font-family: inherit; font-weight: 700; font-size: 12px;
  cursor: pointer;
  transition: all .12s ease;
}
.staff-btn:hover {
  background: linear-gradient(135deg, #FCE3C5, #F9D29C);
  border-style: solid;
}
.staff-btn:active { transform: translateY(1px); }
.staff-lbl { letter-spacing: 0.05em; text-transform: uppercase; }
.staff-num {
  background: var(--choc); color: var(--cream);
  font-family: 'Fraunces', serif; font-weight: 900;
  border-radius: 999px;
  padding: 2px 9px;
  min-width: 24px; text-align: center;
  font-size: 13px;
}

.staff-undo {
  background: var(--cream-2);
  border: 1.5px dashed var(--choc-light);
  color: var(--choc);
  border-radius: 0 10px 10px 0;
  padding: 0 10px;
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s ease;
}
.staff-undo:hover:not(:disabled) {
  background: var(--red);
  color: white;
  border-color: var(--red);
  border-style: solid;
}
.staff-undo:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stat { display: flex; flex-direction: column; align-items: flex-end; line-height: 1; }
.stat-n { font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px; }
.stat-money .stat-n { color: var(--green); }
.stat-l { font-size: 9px; color: var(--ink-soft);
  letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px; font-weight: 600; }

.btn-summary {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--ink); color: var(--cream);
  border: none; border-radius: 8px;
  padding: 9px 12px; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.btn-summary:hover { background: var(--choc); }

/* Body — fixed height, no scroll */
.body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 10px;
  flex: 1;
  min-height: 0;
}
@media (max-width: 1100px) { .body { grid-template-columns: 1fr 260px; } }
@media (max-width: 880px) {
  .body { grid-template-columns: 1fr; }
  .app { height: auto; overflow: visible; }
  .totals {
    position: sticky;
    bottom: 0;
    z-index: 10;
    box-shadow: 0 -4px 16px rgba(42,24,16,.12);
  }
}

/* Menu */
.menu {
  background: var(--sugar);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: var(--shadow);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px;
}
.section { display: flex; flex-direction: column; gap: 6px; }
.sec-hdr {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 13px;
  margin: 4px 0 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
  padding-bottom: 4px;
  border-bottom: 1.5px solid var(--line);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 5px;
}

.item {
  position: relative;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 7px 8px 6px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  display: flex; flex-direction: column; gap: 1px;
  min-height: 50px;
  transition: all .1s ease;
}
.item:hover {
  background: var(--cream-2);
  border-color: var(--choc-light);
}
.item:active { transform: scale(0.97); }
.item-on {
  background: linear-gradient(180deg, #FFF1E0, #FCE3C5);
  border-color: var(--gold);
  box-shadow: 0 0 0 1.5px rgba(217,150,43,.4);
}
.item-name {
  font-weight: 600;
  font-size: 11.5px;
  line-height: 1.2;
  color: var(--ink);
}
.item-price {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 12.5px;
  color: var(--choc);
  margin-top: 2px;
}
.item-price em {
  font-style: normal; font-weight: 500;
  font-size: 9.5px; color: var(--ink-soft);
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-left: 2px;
}
.item-q {
  position: absolute;
  top: -6px; right: -4px;
  background: var(--pink-deep);
  color: white;
  font-family: 'Fraunces', serif;
  font-weight: 900;
  font-size: 11px;
  border-radius: 999px;
  min-width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 5px;
  box-shadow: 0 2px 4px rgba(209,78,114,.4);
  z-index: 2;
}
.item-minus {
  position: absolute;
  top: -6px; left: -4px;
  background: var(--ink);
  color: white;
  border-radius: 999px;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background .12s;
}
.item-minus:hover { background: var(--red); }

/* Ticket */
.ticket {
  background: var(--sugar);
  border: 1px solid var(--line);
  border-radius: 12px;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow);
  overflow: hidden;
  min-height: 0;
}
.ticket-hdr {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 12px;
  border-bottom: 1px dashed var(--line);
  font-weight: 700;
  font-size: 13px;
  background: var(--cream);
}
.ticket-hdr .x { margin-left: auto; }

.ticket-body {
  flex: 1; overflow-y: auto;
  padding: 6px 12px;
  min-height: 60px;
}
.empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; padding: 20px 0;
  color: var(--ink-soft);
}
.empty p { margin: 0; font-size: 12px; }

.lines { list-style: none; margin: 0; padding: 0; }
.line {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 6px; align-items: baseline;
  padding: 5px 0;
  border-bottom: 1px dotted var(--line);
  font-size: 12.5px;
}
.line:last-child { border-bottom: none; }
.line-q { font-family: 'Fraunces', serif; font-weight: 700; color: var(--pink-deep); font-size: 13px; }
.line-n { color: var(--ink); }
.line-p { font-family: 'Fraunces', serif; font-weight: 600; color: var(--choc); }

/* Totals */
.totals {
  padding: 10px 12px;
  border-top: 1px solid var(--line);
  background: var(--cream);
}
.total-big {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 18px;
  border-bottom: 2px solid var(--ink);
  padding-bottom: 6px;
  margin-bottom: 9px;
}

.tender-input {
  display: flex; align-items: center; gap: 5px;
  background: var(--sugar);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 10px;
  margin-bottom: 7px;
  transition: border-color .15s;
}
.tender-input:focus-within { border-color: var(--pink-deep); }
.tender-input input {
  flex: 1; border: none; outline: none; background: transparent;
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 16px;
  padding: 8px 0; color: var(--ink);
  width: 100%; min-width: 0;
}
.tender-input input::placeholder {
  font-weight: 500; color: var(--ink-soft); font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.quick { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
.quick-b {
  flex: 1; min-width: 38px;
  background: var(--sugar);
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 6px 0;
  font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  color: var(--ink); transition: all .12s;
}
.quick-b:hover:not(:disabled) { background: var(--cream-2); border-color: var(--choc-light); }
.quick-b:disabled { opacity: 0.35; cursor: not-allowed; }

.change {
  background: linear-gradient(135deg, #EAF4E8, #DDEDD8);
  border: 1px solid var(--green);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.change-bad {
  background: linear-gradient(135deg, #F8E2E0, #F0CCC8);
  border-color: var(--red);
}
.change-row { display: flex; justify-content: space-between; align-items: baseline; }
.change-row > span:first-child {
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-soft); font-weight: 700;
}
.change-amt {
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px;
  color: var(--green);
}
.change-bad .change-amt { color: var(--red); }
.change-break { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px; }
.chip {
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(79,122,74,.3);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10.5px; font-weight: 600;
  color: var(--ink);
}

.complete {
  width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: var(--pink-deep); color: white;
  border: none; border-radius: 10px;
  padding: 11px;
  font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all .15s;
  box-shadow: 0 3px 0 #8A2545;
}
.complete:hover:not(:disabled) { background: #C13E62; }
.complete:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 #8A2545; }
.complete:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

.x {
  background: transparent; border: none;
  width: 26px; height: 26px; border-radius: 6px;
  cursor: pointer; color: var(--ink-soft);
  display: flex; align-items: center; justify-content: center;
}
.x:hover { background: var(--cream-2); color: var(--ink); }

/* Toast */
.toast {
  position: fixed;
  bottom: 20px; left: 50%; transform: translateX(-50%);
  background: var(--ink); color: var(--cream);
  padding: 9px 16px; border-radius: 999px;
  font-size: 12.5px; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,.2);
  animation: slideUp .25s ease-out;
  z-index: 100;
}
@keyframes slideUp {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

/* Modal */
.modal-bg {
  position: fixed; inset: 0;
  background: rgba(42,24,16,.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 50;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  background: var(--sugar);
  border-radius: 16px;
  width: 100%; max-width: 760px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.4);
}
.modal-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}
.modal-hdr h2 {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-weight: 900; font-size: 22px;
}

.modal-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; padding: 16px 20px;
}
@media (max-width: 600px) { .modal-stats { grid-template-columns: repeat(2, 1fr); } }
.m-stat {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.m-n { font-family: 'Fraunces', serif; font-weight: 900; font-size: 24px; line-height: 1; }
.m-l { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-soft); font-weight: 600; }

.modal-cols {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; padding: 0 20px 16px;
  overflow-y: auto;
}
@media (max-width: 600px) { .modal-cols { grid-template-columns: 1fr; } }
.modal-cols section {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
}
.modal-cols h3 {
  margin: 0 0 8px;
  font-family: 'Fraunces', serif;
  font-size: 16px; font-weight: 700;
  padding-bottom: 6px; border-bottom: 1px dashed var(--line);
}
.muted { color: var(--ink-soft); font-size: 13px; font-style: italic; margin: 0; }
.sumlist { list-style: none; margin: 0; padding: 0; }
.sumlist li {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  gap: 6px; align-items: baseline;
  padding: 4px 0; font-size: 13px;
  border-bottom: 1px dotted var(--line);
}
.sumlist li:last-child { border-bottom: none; }
.sumlist-unsold li { grid-template-columns: 1fr; color: var(--ink-soft); }
.sl-q { font-family: 'Fraunces', serif; font-weight: 700; color: var(--pink-deep); }
.sl-p { font-family: 'Fraunces', serif; font-weight: 600; color: var(--choc); font-size: 12px; }

.modal-foot {
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; flex-wrap: wrap;
  padding: 14px 20px;
  border-top: 1px solid var(--line);
  background: var(--cream);
  border-radius: 0 0 16px 16px;
}
.reset {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent;
  border: 1px solid var(--red); color: var(--red);
  border-radius: 9px;
  padding: 8px 12px;
  font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all .12s;
}
.reset:hover { background: var(--red); color: white; }
.confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; }
.reset-yes { background: var(--red); color: white; border-color: var(--red); }
.reset-no { border-color: var(--line); color: var(--ink-soft); }
.done {
  background: var(--ink); color: var(--cream);
  border: none; border-radius: 9px;
  padding: 9px 16px;
  font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.done:hover { background: var(--choc); }
`;
