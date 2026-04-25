import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";
import Logo from "../components/Logo";

const RegisterPage = ({ onAuthChanged }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      authStore.setSession(data.token, data.user);
      onAuthChanged?.();
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </div>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-bold text-brown-dark mb-1">Create account</h1>
          <p className="text-sm text-brown-light mb-6">Join Exquisite Craft today</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field" required />
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field" required />
            <input type="password" placeholder="Password (min 6 chars)" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input-field" required minLength={6} />
            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full rounded-full py-3.5 text-sm font-semibold mt-1 disabled:opacity-50">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-brown-light">
            Already have an account?{" "}
            <Link to="/login" className="text-brown font-semibold hover:text-brown-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
