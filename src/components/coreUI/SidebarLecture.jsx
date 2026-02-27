import { NavLink } from "react-router-dom";

export default function SidebarLecturer() {
  return (
    <aside className="sidebar">
      <h2 className="logo">University Portal</h2>

      <nav className="menu">
        <NavLink to="/lecturer">Dashboard</NavLink>
        <NavLink to="/lecturer/groups">Group Overview</NavLink>
        <NavLink to="/lecturer/tasks">Requirements & Tasks</NavLink>
        <NavLink to="/lecturer/reports">Reports</NavLink>
      </nav>
    </aside>
  );
}