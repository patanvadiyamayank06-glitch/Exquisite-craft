import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../lib/auth";
import { API_BASE_URL } from "../lib/config";
import Logo from "../components/Logo";

const LoginPage = ({ onAuthChanged }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      authStore.setSession(data.token, data.user);
      onAuthChanged?.();
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo className="h-16 w-auto" />
        </div>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-bold text-brown-dark mb-1">Welcome back</h1>
          <p className="text-sm text-brown-light mb-6">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field" required />
            <input type="password" placeholder="Password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input-field" required />
            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full rounded-full py-3.5 text-sm font-semibold mt-1 disabled:opacity-50">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-brown-light">
            New here?{" "}
            <Link to="/register" className="text-brown font-semibold hover:text-brown-dark transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
