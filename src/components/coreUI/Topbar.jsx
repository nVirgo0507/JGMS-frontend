import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTER_URL } from "../../consts/router.const";
import "./Topbar.css";

export default function Topbar({
  isSidebarCollapsed = false,
  onSidebarToggle = () => {},
}) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleProfile = () => {
    setOpen(false);
    const role = user?.role?.toLowerCase();
    if (role === 'admin') navigate(ROUTER_URL.ADMIN.PROFILE);
    else if (role === 'lecturer') navigate(ROUTER_URL.LECTURER.PROFILE);
    else if (role === 'student') navigate(ROUTER_URL.STUDENT.PROFILE);
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const avatarLetter = (user?.fullName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="topbar">
      <button
        type="button"
        className="topbar-sidebar-toggle"
        onClick={onSidebarToggle}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isSidebarCollapsed}
      >
        <span className="topbar-sidebar-toggle__icon" aria-hidden="true">
          {isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
      </button>

      <div className="topbar-user" ref={menuRef}>
        <div className="user-trigger" onClick={() => setOpen(!open)}>
          <div className="user-info">
            <strong>{displayName}</strong>
          </div>
          <div className="avatar">{avatarLetter}</div>
        </div>

        {open && (
          <div className="dropdown">
            <button onClick={handleProfile}>View Profile</button>
            <hr />
            <button className="danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
