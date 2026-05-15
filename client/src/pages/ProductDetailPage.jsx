import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? "#e53e3e" : "none"} stroke={filled ? "#e53e3e" : "currentColor"} strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "#c49a6c" : "none"} stroke="#c49a6c" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ProductDetailPage = ({ onCartUpdated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [msg, setMsg] = useState("");
  const [qty, setQty] = useState(1);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          const found = data.find(p => String(p.id) === String(id));
          setProduct(found || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
          quantity: qty,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCartUpdated?.(data);
      flash("✓ Added to cart!");
    } catch { flash("⚠ Could not add to cart"); }
    finally { setIsAdding(false); }
  };

  const handleWishlist = async () => {
    const token = authStore.getToken();
    if (!token) { flash("⚠ Please login to wishlist"); return; }
    if (isWishlisted) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id })
      });
      if (res.ok) { setIsWishlisted(true); flash("♥ Added to wishlist"); }
    } catch {}
  };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdf8f4" }}>
      <div className="w-10 h-10 border-2 border-brown border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (!product) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdf8f4" }}>
      <div className="text-center">
        <p className="text-brown-light mb-4">Product not found.</p>
        <Link to="/" className="btn-primary rounded-full px-6 py-2.5 text-sm">Back to Shop</Link>
      </div>
    </main>
  );

  const mrp = Math.round(Number(product.price) * 1.2);
  const discount = Math.round(((mrp - Number(product.price)) / mrp) * 100);
  const related = allProducts.filter(p => p.model === product.model && p.id !== product.id).slice(0, 4);

  return (
    <main style={{ backgroundColor: "#fdf8f4", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs" style={{ color: "#c49a6c" }}>
          <Link to="/" className="hover:text-brown transition-colors">Home</Link>
          <span>/</span>
          <span style={{ color: "#8B5E3C" }}>{product.name}</span>
        </nav>
      </div>

      {/* Product section */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* Image */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] relative"
              style={{ backgroundColor: "#f5ede3" }}>
              <img src={product.image} alt={product.name}
                className="w-full h-full object-contain p-4"
                style={{ mixBlendMode: "multiply" }} />
              {product.featured && (
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: "#8B5E3C" }}>
                  ⭐ Featured
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: "#e53e3e" }}>
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnail row — show related same-model products as "more photos" */}
            {related.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                <div className="flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2"
                  style={{ borderColor: "#8B5E3C", backgroundColor: "#f5ede3" }}>
                  <img src={product.image} alt="" className="w-full h-full object-contain p-1"
                    style={{ mixBlendMode: "multiply" }} />
                </div>
                {related.map(p => (
                  <button key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                    className="flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: "#e8d5c4", backgroundColor: "#f5ede3" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#8B5E3C"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e8d5c4"}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1"
                      style={{ mixBlendMode: "multiply" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Title & model */}
            <div>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: "#f5ede3", color: "#8B5E3C" }}>
                {product.model}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-snug"
                style={{ color: "#3b1f0e" }}>
                {product.name}
              </h1>

              {/* Rating */}
              {Number(product.rating) > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <StarIcon key={n} filled={n <= Math.round(Number(product.rating))} />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "#8B5E3C" }}>
                    {Number(product.rating).toFixed(1)} ({product.num_reviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: "#3b1f0e" }}>
                ₹{Number(product.price).toLocaleString()}
              </span>
              <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
              {discount > 0 && (
                <span className="text-sm font-semibold" style={{ color: "#2d6a4f" }}>
                  {discount}% off
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: "#5a3a20" }}>
              {product.description}
            </p>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: "#e8d5c4" }} />

            {/* Qty */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={{ color: "#3b1f0e" }}>Quantity</span>
              <div className="flex items-center rounded-full overflow-hidden"
                style={{ border: "1px solid #e8d5c4" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-lg transition-colors"
                  style={{ color: "#8B5E3C" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5ede3"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  −
                </button>
                <span className="w-10 text-center font-semibold" style={{ color: "#3b1f0e" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-lg transition-colors"
                  style={{ color: "#8B5E3C" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5ede3"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={isAdding}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: "#8B5E3C" }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#3b1f0e"; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8B5E3C"}>
                {isAdding ? "Adding..." : `Add to Cart · ₹${(Number(product.price) * qty).toLocaleString()}`}
              </button>
              <button onClick={handleWishlist}
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0"
                style={{ border: "1px solid #e8d5c4", backgroundColor: isWishlisted ? "#fff0f0" : "#fff", color: "#8B5E3C" }}
                aria-label="Wishlist">
                <HeartIcon filled={isWishlisted} />
              </button>
            </div>

            {msg && (
              <p className="text-sm text-center font-medium"
                style={{ color: msg.startsWith("✓") || msg.startsWith("♥") ? "#2d6a4f" : "#b5451b" }}>
                {msg}
              </p>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: "✋", label: "Handcrafted" },
                { icon: "📦", label: "Fast Delivery" },
                { icon: "🎨", label: "Customizable" },
              ].map(f => (
                <div key={f.label} className="text-center py-3 rounded-xl"
                  style={{ backgroundColor: "#f5ede3" }}>
                  <div className="text-xl mb-1">{f.icon}</div>
                  <p className="text-xs font-medium" style={{ color: "#8B5E3C" }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 border-t" style={{ borderColor: "#e8d5c4" }}>
          <h2 className="font-display text-xl font-bold mb-6" style={{ color: "#3b1f0e" }}>
            More {product.model} Cases
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p.id} to={`/product/${p.id}`}
                className="group bg-white rounded-2xl overflow-hidden transition-all hover:shadow-medium">
                <div className="aspect-[2/3] overflow-hidden" style={{ backgroundColor: "#f5ede3" }}>
                  <img src={p.image} alt={p.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    style={{ mixBlendMode: "multiply" }} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium line-clamp-2" style={{ color: "#3b1f0e" }}>{p.name}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: "#8B5E3C" }}>₹{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetailPage;
