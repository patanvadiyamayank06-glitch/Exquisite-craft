import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const CartPage = ({ onCartUpdated, currentUser }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const totalPrice = useMemo(() => items.reduce((s, i) => s + Number(i.price) * i.quantity, 0), [items]);

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
    if (!form.name || !form.address || !form.phone) { alert("Please fill all fields."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authStore.getToken()}` },
        body: JSON.stringify({ customerName: form.name, address: form.address, phone: form.phone })
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
    <main className="page-container py-20 text-center">
      <p className="text-brown-light">Loading cart...</p>
    </main>
  );

  if (orderDone) return (
    <main className="page-container py-24 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="section-title text-2xl mb-2">Order Placed!</h2>
      <p className="text-brown-light text-sm mb-8">Thank you! We'll start crafting your order right away.</p>
      <Link to="/" className="btn-primary rounded-full px-8 py-3 text-sm">Continue Shopping</Link>
    </main>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="section-title text-2xl md:text-3xl mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-brown-light mb-6">Your cart is empty.</p>
          <Link to="/" className="btn-primary rounded-full px-8 py-3 text-sm">Shop Now</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Items */}
          <section className="md:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                <img src={item.custom_design_url || item.product_image}
                  alt={item.name}
                  className="w-20 h-24 md:w-24 md:h-28 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown-dark text-sm leading-snug">{item.name}</h3>
                  <p className="text-xs text-brown-light mt-0.5">{item.model}</p>
                  <p className="font-bold text-brown-dark mt-1">₹{Number(item.price).toLocaleString()}</p>

                  <div className="flex items-center gap-3 mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-brown-pale rounded-full overflow-hidden">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-brown hover:bg-brown-pale transition-colors text-lg">−</button>
                      <span className="w-8 text-center text-sm font-medium text-brown-dark">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-brown hover:bg-brown-pale transition-colors text-lg">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1">Remove</button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brown-dark">₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Checkout */}
          <aside className="card p-5 h-fit space-y-4">
            <h2 className="font-display text-xl font-bold text-brown-dark">Order Summary</h2>

            <div className="flex justify-between text-sm border-b border-brown-pale pb-3">
              <span className="text-brown-light">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold text-brown-dark">₹{totalPrice.toLocaleString()}</span>
            </div>

            {!currentUser && (
              <div className="bg-brown-pale rounded-xl p-3 text-sm text-brown-dark">
                <Link to="/login" className="font-semibold underline">Login</Link> to place your order.
              </div>
            )}

            <form onSubmit={checkout} className="space-y-3">
              <input type="text" placeholder="Full Name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field" />
              <textarea placeholder="Delivery Address" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="input-field resize-none" rows={3} />
              <input type="tel" placeholder="Phone Number" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-field" />
              <button type="submit"
                disabled={isSubmitting || !currentUser}
                className="btn-primary w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
                {isSubmitting ? "Placing Order..." : `Place Order · ₹${totalPrice.toLocaleString()}`}
              </button>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
};

export default CartPage;
