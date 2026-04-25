import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../lib/config";

const models = ["iPhone", "Samsung", "OnePlus", "Other"];

const CustomDesignPage = ({ onCartUpdated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ model: "iPhone", name: "", price: 350 });

  const previewUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("designImage", selectedFile);
      const res = await fetch(`${API_BASE_URL}/api/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUploadedUrl(data.imageUrl);
    } catch (err) { alert(err.message); }
    finally { setIsUploading(false); }
  };

  const handleAddToCart = async () => {
    if (!uploadedUrl) { alert("Please upload your design first."); return; }
    if (!form.name.trim()) { alert("Please enter a case name."); return; }
    setIsAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: `custom-${Date.now()}`,
          name: form.name || "Custom Design Case",
          model: form.model,
          price: form.price,
          productImage: uploadedUrl,
          quantity: 1,
          customDesignUrl: uploadedUrl,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCartUpdated?.(data);
      setDone(true);
    } catch (err) { alert(err.message); }
    finally { setIsAdding(false); }
  };

  if (done) {
    return (
      <main className="page-container flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="section-title text-2xl mb-2">Added to Cart!</h2>
        <p className="text-brown-light text-sm mb-8">Your custom design case has been added to your cart.</p>
        <div className="flex gap-3">
          <button onClick={() => { setDone(false); setSelectedFile(null); setUploadedUrl(""); setForm({ model: "iPhone", name: "", price: 350 }); }}
            className="btn-outline rounded-full px-6 py-2.5 text-sm">
            Design Another
          </button>
          <Link to="/cart" className="btn-primary rounded-full px-6 py-2.5 text-sm">View Cart →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-brown-light mb-2">Exclusive Service</p>
        <h1 className="section-title text-3xl md:text-4xl mb-3">Design Your Own Case</h1>
        <p className="text-brown text-sm max-w-md mx-auto">
          Upload your favourite photo, artwork, or design — we'll handcraft it into a beautiful phone case.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Upload area */}
        <div className="space-y-4">
          <h2 className="font-semibold text-brown-dark">1. Upload Your Design</h2>

          <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all
            ${selectedFile ? "border-brown bg-brown-pale/30" : "border-brown-pale hover:border-brown bg-white"}`}
            style={{ minHeight: 220 }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-56 object-contain rounded-2xl p-2" />
            ) : (
              <div className="text-center p-8">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-sm font-medium text-brown-dark">Click to upload image</p>
                <p className="text-xs text-brown-light mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { setSelectedFile(e.target.files?.[0] || null); setUploadedUrl(""); }} />
          </label>

          {selectedFile && !uploadedUrl && (
            <button onClick={handleUpload} disabled={isUploading}
              className="btn-primary w-full rounded-full py-3 text-sm font-semibold disabled:opacity-50">
              {isUploading ? "Uploading..." : "Upload Design"}
            </button>
          )}

          {uploadedUrl && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
              <span>✓</span> Design uploaded successfully!
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-5">
          <h2 className="font-semibold text-brown-dark">2. Customise Your Order</h2>

          <div className="card p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-brown-dark uppercase tracking-wider block mb-1.5">Case Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. My Custom Case"
                className="input-field" />
            </div>

            <div>
              <label className="text-xs font-semibold text-brown-dark uppercase tracking-wider block mb-1.5">Phone Model</label>
              <div className="grid grid-cols-2 gap-2">
                {models.map(m => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, model: m }))}
                    className="py-2.5 text-sm font-medium rounded-xl border transition-all"
                    style={form.model === m
                      ? { backgroundColor: "#8B5E3C", color: "#fff", borderColor: "#8B5E3C" }
                      : { backgroundColor: "#fff", color: "#8B5E3C", borderColor: "#e8d5c4" }
                    }>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-brown-pale pt-4 flex items-center justify-between">
              <span className="text-sm text-brown-light">Price</span>
              <span className="text-xl font-bold text-brown-dark">₹{form.price}</span>
            </div>
          </div>

          <button onClick={handleAddToCart} disabled={isAdding || !uploadedUrl}
            className="btn-primary w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
            {isAdding ? "Adding to Cart..." : "Add to Cart →"}
          </button>

          {!uploadedUrl && (
            <p className="text-xs text-center text-brown-light">Upload your design first to continue</p>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-center font-display text-xl font-bold text-brown-dark mb-8">How It Works</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { step: "01", title: "Upload", desc: "Share your photo or design" },
            { step: "02", title: "We Craft", desc: "Handmade with care & precision" },
            { step: "03", title: "Delivered", desc: "Shipped safely to your door" },
          ].map(s => (
            <div key={s.step} className="space-y-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto text-sm font-bold text-white"
                style={{ backgroundColor: "#8B5E3C" }}>
                {s.step}
              </div>
              <p className="font-semibold text-brown-dark text-sm">{s.title}</p>
              <p className="text-xs text-brown-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CustomDesignPage;
