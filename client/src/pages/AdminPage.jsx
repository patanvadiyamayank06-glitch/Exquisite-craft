import { useEffect, useState } from "react";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";

const initialForm = {
  name: "",
  model: "iPhone",
  price: "",
  image: "",
  description: "",
  featured: false
};

const StatCard = ({ label, value, icon, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-soft flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-widest" style={{ color: "#c49a6c" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: "#3b1f0e" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#8B5E3C" }}>{sub}</p>}
    </div>
  </div>
);

const AdminPage = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [incomeStats, setIncomeStats] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const token = authStore.getToken();

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    if (res.ok) setProducts(data);
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setOrders(data);
  };

  const fetchIncomeStats = async () => {
    const res = await fetch(`${API_BASE_URL}/api/orders/income-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setIncomeStats(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchIncomeStats();
  }, []);

  const uploadImage = async () => {
    if (!imageFile) return form.image;
    const formData = new FormData();
    formData.append("designImage", imageFile);
    const res = await fetch(`${API_BASE_URL}/api/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    return data.imageUrl;
  };

  const resetForm = () => {
    setForm(initialForm);
    setImageFile(null);
    setEditingId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const imageUrl = await uploadImage();
      const payload = { ...form, image: imageUrl, price: Number(form.price) };
      const res = await fetch(
        editingId ? `${API_BASE_URL}/api/products/${editingId}` : `${API_BASE_URL}/api/products`,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product");
      await fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setImageFile(null);
    setForm({
      name: product.name,
      model: product.model,
      price: product.price,
      image: product.image,
      description: product.description,
      featured: Boolean(product.featured)
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Failed to delete");
    fetchProducts();
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMonthIncome = Number(incomeStats?.currentMonth?.income || 0);
  const currentYearIncome = Number(incomeStats?.currentYear?.income || 0);
  const currentMonthOrders = Number(incomeStats?.currentMonth?.order_count || 0);
  const currentYearOrders = Number(incomeStats?.currentYear?.order_count || 0);

  // Bar chart max value for scaling
  const monthlyData = incomeStats?.monthly || [];
  const maxMonthlyIncome = Math.max(...monthlyData.map(m => Number(m.income)), 1);

  const yearlyData = incomeStats?.yearly || [];
  const maxYearlyIncome = Math.max(...yearlyData.map(y => Number(y.income)), 1);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-2xl font-bold" style={{ color: "#3b1f0e" }}>Admin access required.</p>
      </main>
    );
  }

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "orders", label: `Orders (${orders.length})`, icon: "📦" },
    { key: "products", label: "Products", icon: "🛍️" },
  ];

  return (
    <main style={{ backgroundColor: "#fdf8f4", minHeight: "100vh" }}>
      {/* Header */}
      <div className="px-6 py-6 border-b" style={{ backgroundColor: "#fff", borderColor: "#e8d5c4" }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#3b1f0e", fontFamily: "'Playfair Display', serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8B5E3C" }}>Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-sm font-semibold rounded-full transition"
                style={activeTab === tab.key
                  ? { backgroundColor: "#8B5E3C", color: "#fff" }
                  : { backgroundColor: "#f5ede4", color: "#8B5E3C" }
                }>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="This Month" value={`₹${currentMonthIncome.toLocaleString()}`} icon="📅" sub={`${currentMonthOrders} orders`} />
              <StatCard label="This Year" value={`₹${currentYearIncome.toLocaleString()}`} icon="📆" sub={`${currentYearOrders} orders`} />
              <StatCard label="Total Products" value={products.length} icon="🛍️" />
              <StatCard label="Total Orders" value={orders.length} icon="📦" />
            </div>

            {/* Monthly Income Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-lg mb-1" style={{ color: "#3b1f0e" }}>Monthly Income — {new Date().getFullYear()}</h2>
              <p className="text-xs mb-5" style={{ color: "#8B5E3C" }}>Revenue per month this year</p>
              <div className="relative" style={{ height: "180px" }}>
                {/* Gridlines */}
                {[0,25,50,75,100].map(pct => (
                  <div key={pct} className="absolute w-full border-t border-gray-100" style={{ bottom: `${pct}%` }} />
                ))}
                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-1 px-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = monthlyData.find(m => Number(m.month) === i + 1);
                    const income = month ? Number(month.income) : 0;
                    const heightPct = maxMonthlyIncome > 0 && income > 0
                      ? Math.max((income / maxMonthlyIncome) * 100, 5)
                      : 3;
                    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    const isCurrentMonth = i + 1 === new Date().getMonth() + 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: "100%" }}>
                        {income > 0 && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                            ₹{income.toLocaleString()}
                          </div>
                        )}
                        <div
                          style={{
                            width: "100%",
                            height: `${heightPct}%`,
                            backgroundColor: income > 0
                              ? (isCurrentMonth ? "#8B5E3C" : "#c49a6c")
                              : "#f0e8e0",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.5s ease"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Month labels */}
              <div className="flex gap-1 px-1 mt-2">
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <div key={m} className="flex-1 text-center">
                    <span className="text-xs" style={{
                      color: i + 1 === new Date().getMonth() + 1 ? "#8B5E3C" : "#aaa",
                      fontWeight: i + 1 === new Date().getMonth() + 1 ? 700 : 400
                    }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yearly Income Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-lg mb-1" style={{ color: "#3b1f0e" }}>Yearly Income</h2>
              <p className="text-xs mb-5" style={{ color: "#8B5E3C" }}>Revenue per year (last 5 years)</p>
              {yearlyData.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {yearlyData.map(y => {
                    const income = Number(y.income);
                    const pct = Math.max((income / maxYearlyIncome) * 100, 2);
                    const isCurrentYear = Number(y.year) === new Date().getFullYear();
                    return (
                      <div key={y.year} className="flex items-center gap-4">
                        <span className="text-sm font-semibold w-12 text-right" style={{ color: "#3b1f0e" }}>{y.year}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center px-3 transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: isCurrentYear ? "#8B5E3C" : "#c49a6c" }}
                          >
                            <span className="text-xs text-white font-semibold whitespace-nowrap">
                              ₹{income.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-16">{y.order_count} orders</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#3b1f0e" }}>Recent Orders</h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-4 shadow-soft">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#3b1f0e" }}>{order.customer_name}</p>
                        <p className="text-xs" style={{ color: "#8B5E3C" }}>{order.phone} · {order.address}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: "#8B5E3C" }}>₹{Number(order.total_price).toLocaleString()}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Placed</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                          <img
                            src={item.image || item.customDesignUrl}
                            alt={item.name}
                            className="h-8 w-8 rounded object-cover"
                            onError={e => { e.target.style.display = "none"; }}
                          />
                          <span className="text-xs text-gray-600">{item.name} ×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-gray-400 bg-white p-5 rounded-xl">No orders yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ color: "#3b1f0e" }}>All Orders</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 bg-white p-6 rounded-xl shadow-soft">No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-5 shadow-soft space-y-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold" style={{ color: "#3b1f0e" }}>{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.phone} · {order.address}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{ color: "#8B5E3C" }}>₹{Number(order.total_price).toLocaleString()}</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Placed</span>
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img
                          src={item.image || item.customDesignUrl}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#3b1f0e" }}>{item.name}</p>
                          <p className="text-xs text-gray-400">{item.model} × {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold flex-shrink-0" style={{ color: "#8B5E3C" }}>
                          ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid gap-8 md:grid-cols-3">
            {/* Form */}
            <section className="bg-white rounded-2xl p-5 shadow-soft md:col-span-1 h-fit">
              <h2 className="font-bold text-lg mb-4" style={{ color: "#3b1f0e" }}>
                {editingId ? "✏️ Edit Product" : "➕ Add Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Product name" required
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400" />
                <select value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400">
                  <option>iPhone</option>
                  <option>Samsung</option>
                  <option>OnePlus</option>
                </select>
                <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Price (₹)" type="number" min="0" required
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400" />
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description" rows={3} required
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400" />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Product Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-gray-200 p-2 text-sm" />
                </div>
                {form.image && !imageFile && (
                  <img src={form.image} alt="Current" className="h-24 w-full rounded-xl object-cover" />
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured}
                    onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                    className="rounded" />
                  <span style={{ color: "#8B5E3C" }}>Featured product</span>
                </label>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={isSaving}
                    className="flex-1 rounded-full py-2 text-sm font-semibold text-white disabled:opacity-60 transition"
                    style={{ backgroundColor: "#8B5E3C" }}>
                    {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm}
                      className="rounded-full px-4 py-2 text-sm border"
                      style={{ borderColor: "#8B5E3C", color: "#8B5E3C" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Product List */}
            <section className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400 bg-white" />
                <span className="text-sm text-gray-400">{filteredProducts.length} items</span>
              </div>
              {filteredProducts.map(product => (
                <div key={product.id}
                  className="bg-white rounded-xl p-4 shadow-soft flex items-center gap-4">
                  <img src={product.image} alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "#3b1f0e" }}>{product.name}</p>
                    <p className="text-xs text-gray-500">{product.model} · ₹{product.price}</p>
                    {product.featured && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ Featured</span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(product)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                      style={{ backgroundColor: "#f5ede4", color: "#8B5E3C" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                      style={{ backgroundColor: "#fde8e8", color: "#c0392b" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-sm text-gray-400 bg-white p-5 rounded-xl">No products found.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminPage;
