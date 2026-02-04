import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              JG
            </span>
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">JGMS</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
