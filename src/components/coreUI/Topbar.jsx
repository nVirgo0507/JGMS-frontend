import { useState, useRef, useEffect } from "react";
import "./Topbar.css";

export default function Topbar({ user }) {
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

  return (
    <div className="topbar">
      <input
        className="topbar-search"
        placeholder="Search groups, students, or lecturers..."
      />

      <div className="topbar-user" ref={menuRef}>
        <div
          className="user-trigger"
          onClick={() => setOpen(!open)}
        >
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
            {/* <span>System Administrator</span> */}
          </div>
          <div className="avatar">{user.avatar}</div>
        </div>

        {open && (
          <div className="dropdown">
            <button>View Profile</button>
            <button>Settings</button>
            <hr />

            {user.role === "System Adminstrator" && 
            (<button>System Settings</button>)}
            <button className="danger">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
