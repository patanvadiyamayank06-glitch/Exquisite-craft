import { useState } from "react";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "#e53e3e" : "none"} stroke={filled ? "#e53e3e" : "#9ca3af"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 inline" fill="#c49a6c" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ProductCard = ({ product, onAddedToCart }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [msg, setMsg] = useState("");
  const [avgRating] = useState(Number(product.rating) || 0);
  const [numReviews] = useState(product.num_reviews || 0);

  const mrp = Math.round(product.price * 1.2);
  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          model: product.model,
          price: product.price,
          productImage: product.image,
          quantity: 1,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onAddedToCart?.(data);
      flash("✓ Added to cart");
    } catch { flash("⚠ Could not add"); }
    finally { setIsAdding(false); }
  };

  const handleWishlist = async () => {
    const token = authStore.getToken();
    if (!token) { flash("⚠ Login to wishlist"); return; }
    if (isWishlisted) return;
    setIsWishlisting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id })
      });
      if (res.ok) setIsWishlisted(true);
    } catch {}
    finally { setIsWishlisting(false); }
  };

  return (
    <article className="group flex flex-col bg-white">
      <div className="relative overflow-hidden bg-brown-pale aspect-[2/3]">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <button onClick={handleWishlist} disabled={isWishlisting}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-card transition-all"
          aria-label="Wishlist">
          <HeartIcon filled={isWishlisted} />
        </button>
        {product.featured && (
          <span className="absolute top-2.5 left-2.5 bg-brown text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 pt-3 pb-4 px-1">
        <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2">{product.name}</h3>
        {avgRating > 0 && (
          <p className="mt-1 text-xs text-brown-light flex items-center gap-1">
            <StarIcon /> {avgRating.toFixed(1)} <span className="text-gray-300">·</span> {numReviews} reviews
          </p>
        )}
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-base font-bold text-brown-dark">₹{product.price}</span>
          <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
        </div>
        <button onClick={handleAddToCart} disabled={isAdding}
          className="btn-outline mt-3 w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-full disabled:opacity-50">
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
        {msg && (
          <p className="mt-1.5 text-xs text-center" style={{ color: msg.startsWith("✓") ? "#2d6a4f" : "#b5451b" }}>
            {msg}
          </p>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
