import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className="text-2xl transition-transform hover:scale-110"
        style={{ color: n <= value ? "#c49a6c" : "#e8d5c4" }}>
        ★
      </button>
    ))}
  </div>
);

const ReviewPage = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const token = authStore.getToken();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { setError("Please select a product."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${selected.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  if (!token) return (
    <main className="page-container py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="section-title text-xl mb-2">Login Required</h2>
      <p className="text-brown-light text-sm mb-6">Please login to leave a review.</p>
      <Link to="/login" className="btn-primary rounded-full px-8 py-3 text-sm">Login</Link>
    </main>
  );

  if (done) return (
    <main className="page-container py-24 text-center">
      <div className="text-5xl mb-4">🙏</div>
      <h2 className="section-title text-2xl mb-2">Thank You!</h2>
      <p className="text-brown-light text-sm mb-8">Your review has been submitted.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setDone(false); setSelected(null); setComment(""); setRating(5); }}
          className="btn-outline rounded-full px-6 py-2.5 text-sm">
          Review Another
        </button>
        <Link to="/" className="btn-primary rounded-full px-6 py-2.5 text-sm">Back to Shop</Link>
      </div>
    </main>
  );

  return (
    <main className="page-container py-12">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-brown-light mb-2">Share Your Experience</p>
        <h1 className="section-title text-3xl mb-2">Leave a Review</h1>
        <p className="text-sm text-brown max-w-sm mx-auto">
          Bought one of our cases? We'd love to hear what you think!
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">

          {/* Product selector */}
          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wider block mb-3">
              Select Product
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {products.map(p => (
                <button key={p.id} type="button" onClick={() => setSelected(p)}
                  className="flex items-center gap-2 p-2 rounded-xl border text-left transition-all"
                  style={selected?.id === p.id
                    ? { borderColor: "#8B5E3C", backgroundColor: "#f5ede3" }
                    : { borderColor: "#e8d5c4", backgroundColor: "#fff" }
                  }>
                  <img src={p.image} alt={p.name}
                    className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
                  <span className="text-xs font-medium text-brown-dark line-clamp-2">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected product preview */}
          {selected && (
            <div className="flex items-center gap-3 bg-brown-pale rounded-xl p-3">
              <img src={selected.image} alt={selected.name}
                className="w-12 h-14 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-semibold text-brown-dark">{selected.name}</p>
                <p className="text-xs text-brown-light">{selected.model} · ₹{selected.price}</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wider block mb-2">
              Your Rating
            </label>
            <StarPicker value={rating} onChange={setRating} />
            <p className="text-xs text-brown-light mt-1">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wider block mb-2">
              Your Review
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={4} placeholder="Tell us about your experience with this case..."
              className="input-field resize-none" required />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting || !selected}
            className="btn-primary w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ReviewPage;
