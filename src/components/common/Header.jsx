import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full bg-white border-b border-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 transition hover:opacity-90"
        >
          <div className="flex items-center gap-1">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
            <span className="text-lg font-bold text-slate-900">
              SWP391 JGMS
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <a href="#features" className="hover:text-slate-900 transition">
            Features
          </a>
          <a href="#documentation" className="hover:text-slate-900 transition">
            Documentation
          </a>
          <a href="#about" className="hover:text-slate-900 transition">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
