import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Topbar.css";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.email?.split("@")[0] || "User";

  return (
    <div className="topbar">
      <input
        className="topbar-search"
        placeholder="Search groups, students, or lecturers..."
      />

      <div className="topbar-user" ref={menuRef}>
        <div className="user-trigger" onClick={() => setOpen(!open)}>
          <div className="user-info">
            <strong>{displayName}</strong>
          </div>
          <div className="avatar">{avatarLetter}</div>
        </div>

        {open && (
          <div className="dropdown">
            <button>View Profile</button>
            <button>Settings</button>
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
