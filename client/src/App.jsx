import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import WishlistPage from "./pages/WishlistPage";
import CustomDesignPage from "./pages/CustomDesignPage";
import Logo from "./components/Logo";
import ReviewPage from "./pages/ReviewPage";
import { authStore } from "./lib/auth";

const CartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const App = () => {
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const fetchCartCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`);
      const data = await res.json();
      if (!res.ok) return;
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    } catch { setCartCount(0); }
  };

  useEffect(() => {
    fetchCartCount();
    setCurrentUser(authStore.getUser());
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    authStore.clearSession();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-brown-pale">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <Logo className="h-12 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brown">
            <Link to="/" className="hover:text-brown-dark transition-colors">Shop</Link>
            <Link to="/custom-design" className="hover:text-brown-dark transition-colors">Custom Design</Link>
            <Link to="/wishlist" className="hover:text-brown-dark transition-colors flex items-center gap-1.5">
              <HeartIcon /> Wishlist
            </Link>
            {currentUser?.role === "admin" && (
              <Link to="/admin" className="hover:text-brown-dark transition-colors">Admin</Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-sm text-brown-dark font-medium">Hi, {currentUser.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="text-sm text-brown hover:text-brown-dark transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-brown hover:text-brown-dark transition-colors font-medium">Login</Link>
            )}
            <Link to="/cart" className="btn-primary relative flex items-center gap-2 px-4 py-2 rounded-full">
              <CartIcon />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brown-dark text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative text-brown p-1">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brown text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-brown p-1" aria-label="Menu">
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-brown-pale px-4 py-4 space-y-1">
            {[
              { to: "/", label: "Shop" },
              { to: "/custom-design", label: "Custom Design" },
              { to: "/wishlist", label: "Wishlist" },
              ...(currentUser?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="block px-3 py-2.5 text-sm font-medium text-brown hover:text-brown-dark hover:bg-brown-pale rounded-xl transition-colors">
                {label}
              </Link>
            ))}
            <div className="border-t border-brown-pale pt-3 mt-3">
              {currentUser ? (
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-brown-dark font-medium">Hi, {currentUser.name.split(" ")[0]}</span>
                  <button onClick={handleLogout} className="text-sm text-brown hover:text-brown-dark">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="block px-3 py-2.5 text-sm font-medium text-brown hover:text-brown-dark hover:bg-brown-pale rounded-xl transition-colors">
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<HomePage onCartUpdated={fetchCartCount} />} />
        <Route path="/cart" element={<CartPage onCartUpdated={fetchCartCount} currentUser={currentUser} />} />
        <Route path="/login" element={<LoginPage onAuthChanged={() => setCurrentUser(authStore.getUser())} />} />
        <Route path="/register" element={<RegisterPage onAuthChanged={() => setCurrentUser(authStore.getUser())} />} />
        <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/custom-design" element={<CustomDesignPage onCartUpdated={fetchCartCount} />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>

      {/* Footer */}
      <footer className="border-t border-brown-pale mt-16 py-10 text-center" style={{ backgroundColor: "#fdf8f4" }}>
        <div className="mx-auto max-w-7xl px-4 space-y-4">
          <a href="https://www.instagram.com/exquisite_craft12" target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Follow on Instagram
          </a>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link to="/custom-design" className="text-brown hover:text-brown-dark transition-colors">Custom Design</Link>
            <span className="text-brown-pale">·</span>
            <Link to="/review" className="text-brown hover:text-brown-dark transition-colors font-medium">⭐ Leave a Review</Link>
            <span className="text-brown-pale">·</span>
            <Link to="/wishlist" className="text-brown hover:text-brown-dark transition-colors">Wishlist</Link>
          </div>
          <p className="text-xs text-brown-light">© 2026 Exquisite Craft · Handcrafted with love</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
