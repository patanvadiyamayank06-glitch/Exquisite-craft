import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = authStore.getToken();

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    fetch(`${API_BASE_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const addToCart = async (item) => {
    try {
      await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.product.id,
          name: item.product.name,
          model: item.product.model,
          price: item.product.price,
          productImage: item.product.image,
          quantity: 1,
        })
      });
    } catch {}
  };

  if (!token) return (
    <main className="page-container py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="section-title text-xl mb-2">Login Required</h2>
      <p className="text-brown-light text-sm mb-6">Please login to view your wishlist.</p>
      <Link to="/login" className="btn-primary rounded-full px-8 py-3 text-sm">Login</Link>
    </main>
  );

  if (isLoading) return (
    <main className="page-container py-20 text-center">
      <p className="text-brown-light">Loading wishlist...</p>
    </main>
  );

  return (
    <main className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title text-2xl md:text-3xl">Wishlist</h1>
        <span className="text-sm text-brown-light">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🤍</div>
          <p className="text-brown-light mb-6">Your wishlist is empty.</p>
          <Link to="/" className="btn-primary rounded-full px-8 py-3 text-sm">Browse Cases</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(item => (
            <div key={item.id} className="card overflow-hidden group">
              <div className="relative aspect-[3/4] overflow-hidden bg-brown-pale">
                <img src={item.product.image} alt={item.product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <button onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition-all shadow-card text-sm"
                  aria-label="Remove">✕</button>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-brown-dark line-clamp-2">{item.product.name}</p>
                <p className="text-xs text-brown-light">{item.product.model}</p>
                <p className="font-bold text-brown-dark">₹{item.product.price}</p>
                <button onClick={() => addToCart(item)}
                  className="btn-outline w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-full">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
