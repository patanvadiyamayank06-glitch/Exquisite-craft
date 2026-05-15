import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const CartPage = ({ onCartUpdated, currentUser }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", mobileCompany: "", mobileModel: "" });

  const totalPrice = useMemo(() => items.reduce((s, i) => s + Number(i.price) * i.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/cart`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) { setItems(data); onCartUpdated?.(); } })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(prev => prev.map(item => item.id === id ? data : item));
      onCartUpdated?.();
    } catch (err) { alert(err.message); }
  };

  const removeItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(prev => prev.filter(item => item.id !== id));
      onCartUpdated?.();
    } catch (err) { alert(err.message); }
  };

  const checkout = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone || !form.mobileCompany || !form.mobileModel) {
      alert("Please fill all fields including mobile company and model.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authStore.getToken()}` },
        body: JSON.stringify({
          customerName: form.name,
          address: form.address,
          phone: form.phone,
          mobileInfo: `${form.mobileCompany} ${form.mobileModel}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems([]);
      setOrderDone(true);
      onCartUpdated?.();
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdf8f4" }}>
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-brown border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-brown-light">Loading your cart...</p>
      </div>
    </main>
  );

  if (orderDone) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#fdf8f4" }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ backgroundColor: "#f5ede3" }}>🎉</div>
        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "#3b1f0e" }}>Order Placed!</h2>
        <p className="text-sm mb-8" style={{ color: "#8B5E3C" }}>
          Thank you! We'll start crafting your order with love right away.
        </p>
        <Link to="/" className="btn-primary rounded-full px-8 py-3 text-sm inline-block">
          Continue Shopping
        </Link>
      </div>
    </main>
  );

  if (items.length === 0) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#fdf8f4" }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ backgroundColor: "#f5ede3" }}>🛍️</div>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "#3b1f0e" }}>Your cart is empty</h2>
        <p className="text-sm mb-8" style={{ color: "#8B5E3C" }}>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-primary rounded-full px-8 py-3 text-sm inline-block">Browse Cases</Link>
      </div>
    </main>
  );

  return (
    <main style={{ backgroundColor: "#fdf8f4", minHeight: "100vh" }}>
      {/* Header bar */}
      <div className="border-b" style={{ backgroundColor: "#fff", borderColor: "#e8d5c4" }}>
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: "#3b1f0e" }}>Shopping Cart</h1>
            <p className="text-xs mt-0.5" style={{ color: "#8B5E3C" }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
          <Link to="/" className="text-sm font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: "#8B5E3C" }}
            onMouseEnter={e => e.currentTarget.style.color = "#3b1f0e"}
            onMouseLeave={e => e.currentTarget.style.color = "#8B5E3C"}>
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Cart Items — takes 3/5 */}
          <section className="lg:col-span-3 space-y-3">
            {items.map((item, idx) => (
              <div key={item.id}
                className="flex gap-4 p-4 rounded-2xl transition-all"
                style={{ backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(59,31,14,0.06)" }}>

                {/* Image */}
                <div className="relative flex-shrink-0">
                  <img src={item.custom_design_url || item.product_image}
                    alt={item.name}
                    className="rounded-xl object-cover"
                    style={{ width: 88, height: 108 }} />
                  {item.custom_design_url && (
                    <span className="absolute -top-1.5 -right-1.5 text-xs bg-brown text-white px-1.5 py-0.5 rounded-full font-semibold">
                      Custom
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-snug" style={{ color: "#3b1f0e" }}>{item.name}</h3>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "#f5ede3", color: "#8B5E3C" }}>
                          {item.model}
                        </span>
                      </div>
                      <p className="font-bold text-sm flex-shrink-0" style={{ color: "#3b1f0e" }}>
                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#c49a6c" }}>₹{Number(item.price).toLocaleString()} each</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center rounded-full overflow-hidden"
                      style={{ border: "1px solid #e8d5c4" }}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors"
                        style={{ color: "#8B5E3C" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5ede3"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" style={{ color: "#3b1f0e" }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-base font-medium transition-colors"
                        style={{ color: "#8B5E3C" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5ede3"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-lg"
                      style={{ color: "#c49a6c" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#e53e3e"; e.currentTarget.style.backgroundColor = "#fff5f5"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#c49a6c"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <TrashIcon /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Order Summary — takes 2/5 */}
          <aside className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden sticky top-24"
              style={{ boxShadow: "0 4px 24px rgba(59,31,14,0.08)" }}>

              {/* Summary header */}
              <div className="px-6 py-5" style={{ backgroundColor: "#3b1f0e" }}>
                <h2 className="font-display text-lg font-bold text-white">Order Summary</h2>
              </div>

              <div className="bg-white px-6 py-5 space-y-4">
                {/* Item breakdown */}
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2" style={{ color: "#8B5E3C" }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium flex-shrink-0" style={{ color: "#3b1f0e" }}>
                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3" style={{ borderColor: "#e8d5c4" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: "#8B5E3C" }}>
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="text-xl font-bold" style={{ color: "#3b1f0e" }}>
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#c49a6c" }}>Free delivery included</p>
                </div>
              </div>

              {/* Delivery form */}
              <div className="bg-white border-t px-6 pb-6 space-y-3" style={{ borderColor: "#e8d5c4" }}>
                <p className="text-xs font-semibold uppercase tracking-wider pt-4" style={{ color: "#c49a6c" }}>
                  Delivery Details
                </p>

                {!currentUser && (
                  <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "#f5ede3", color: "#3b1f0e" }}>
                    <Link to="/login" className="font-semibold underline">Login</Link> to place your order.
                  </div>
                )}

                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field text-sm" />

                {/* Mobile company + model side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.mobileCompany}
                    onChange={e => setForm(p => ({ ...p, mobileCompany: e.target.value }))}
                    className="input-field text-sm"
                    style={{ color: form.mobileCompany ? "#3b1f0e" : "#9ca3af" }}>
                    <option value="" disabled>Company</option>
                    <option>Apple</option>
                    <option>Samsung</option>
                    <option>OnePlus</option>
                    <option>Xiaomi</option>
                    <option>Realme</option>
                    <option>Vivo</option>
                    <option>Oppo</option>
                    <option>Nothing</option>
                    <option>Other</option>
                  </select>
                  <input type="text" placeholder="Model (e.g. 15 Pro)" value={form.mobileModel}
                    onChange={e => setForm(p => ({ ...p, mobileModel: e.target.value }))}
                    className="input-field text-sm" />
                </div>

                <textarea placeholder="Delivery Address" value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="input-field text-sm resize-none" rows={2} />
                <input type="tel" placeholder="Phone Number" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="input-field text-sm" />

                <button onClick={checkout}
                  disabled={isSubmitting || !currentUser}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 mt-2"
                  style={{ backgroundColor: "#8B5E3C" }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#3b1f0e"; }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B5E3C"}>
                  {isSubmitting ? "Placing Order..." : `Place Order · ₹${totalPrice.toLocaleString()}`}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default CartPage;
