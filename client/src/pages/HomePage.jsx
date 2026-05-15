import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import { API_BASE_URL } from "../lib/config";

const features = [
  { icon: "🎨", label: "100% Customizable", desc: "Your design, your way" },
  { icon: "✋", label: "Handcrafted", desc: "Made with care & love" },
  { icon: "📦", label: "Fast Delivery", desc: "Quick & safe shipping" },
  { icon: "💬", label: "24/7 Support", desc: "Always here for you" },
];

const HomePage = ({ onCartUpdated }) => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProductList(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-cream">
      <Banner />

      {/* Features strip */}
      <div className="border-b border-brown-pale" style={{ backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brown-pale">
            {features.map(f => (
              <div key={f.label} className="flex items-center gap-3 py-5 px-4 md:px-6">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-brown-dark">{f.label}</p>
                  <p className="text-xs text-brown-light hidden md:block">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Design CTA */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8"
          style={{ backgroundColor: "#3b1f0e" }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: "#c49a6c" }}>Exclusive Service</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Design Your Own Case</h2>
            <p className="text-sm mt-1" style={{ color: "#d4a574" }}>Upload your photo or artwork — we'll craft it into a stunning case.</p>
          </div>
          <Link to="/custom-design"
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all"
            style={{ backgroundColor: "#c49a6c", color: "#fff" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#8B5E3C"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#c49a6c"}>
            Start Designing →
          </Link>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 pb-16" id="products">
        <div className="mb-8">
          <h2 className="section-title text-2xl md:text-3xl">Our Cases</h2>
          <p className="text-sm text-brown-light mt-1">{productList.length} products</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white animate-pulse">
                <div className="aspect-[2/3] bg-brown-pale/50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-brown-pale/50 rounded w-3/4" />
                  <div className="h-3 bg-brown-pale/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : productList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brown-light text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productList.map(product => (
              <ProductCard key={product.id} product={product} onAddedToCart={onCartUpdated} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
