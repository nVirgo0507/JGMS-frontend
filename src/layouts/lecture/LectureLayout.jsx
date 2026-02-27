import { Outlet } from "react-router-dom";
import SidebarLecturer from "../../components/coreUI/SidebarLecturer";
import Topbar from "../../components/coreUI/Topbar";

export default function LecturerLayout() {
  return (
    <div className="admin-layout">
      <SidebarLecturer />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}