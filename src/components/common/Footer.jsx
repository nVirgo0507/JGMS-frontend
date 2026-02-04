import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-8 md:flex-row md:items-center">
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} JGMS — Capstone tracking platform.
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="#features"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            Tính năng
          </a>
          <Link
            to="/login"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
