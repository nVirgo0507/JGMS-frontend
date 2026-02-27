import { NavLink } from "react-router-dom";
import {getStoreUser, getUserRole} from "../../utils/auth"
import {ROLE} from "../../consts/const"
import { ROUTER_URL } from "../../consts/router.const";
import "./Sidebar.css";

const menuByRole = {
  [ROLE.ADMIN]: [
    {label: "Dashboard", path: ROUTER_URL.ADMIN.DASHBOARD},
    {label: "Manage Group", path: "./admin/groups"},
    {label: "Manage Lecturers",path: "./admin/lectures"}
  ],
  [ROLE.LECTURER]: [
    {lable: "Dashboard",path: ROUTER_URL.LECTURER.DASHBOARD},
    {label: "Group Overview", path: "./lecturer/groups"},
    {label: "Reports", path: "/lecturer/reports"}
  ],
  [ROLE.TEAM_LEADER]: [
    {label: "Dashboard",path: ROUTER_URL.TEAM_LEADER.DASHBOARD},
    {labebl: "My team",path: "./leader/team"},
    {label: "Tasks",path: "./leader/tasks"}
  ],
  [ROLE.TEAM_MEMBER]: [
    {label: "Dashboard",path: ROUTER_URL.TEAM_MEMBER.DASHBOARD},
    {label: "My tasks", path: "./member/tasks"}
  ]
}

export default function Sidebar() {
  const user = getStoreUser()
  const role = getUserRole()
  const menu = menuByRole[role] || []

  return (
    <aside className="sidebar">
      <h2 className="logo">{role}</h2>

      <nav className="menu">
        {
          menu.map((item) => {
            <NavLink key={item.path} to={item.path} end>
              {item.label}
            </NavLink>
          })
        }
      </nav>
    </aside>
  );
}