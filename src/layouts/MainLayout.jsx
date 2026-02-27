import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

const MainLayout = () => (
  <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-teal-300/60 blur-3xl" />
      <div className="absolute -right-32 bottom-12 h-72 w-72 rounded-full bg-sky-300/60 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(226,232,240,0.85))]" />
    </div>
    <div className="relative z-10">
      <Header />
      <Outlet />
    </div>
  </div>
);

export default MainLayout;
