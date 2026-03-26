import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LOCAL_STORAGE } from "../consts/const";
import { ROUTER_URL } from "../consts/router.const";
import { decodeJWT, getDashboardPathByRole } from "../utils/auth";
import { AuthService } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Async load profile details if the JWT lacks fullName
  useEffect(() => {
    const fetchMissingProfile = async () => {
      if (!user || user.fullName || !user.role) return;
      
      try {
        let fetchedName = null;
        const sub = user.sub || decodeJWT(user.accessToken)?.sub;
        
        if (user.role.toLowerCase() === "admin" && sub) {
          const { AdminUserService } = await import("../services/admin/adminUser.service");
          const res = await AdminUserService.getUser(sub);
          fetchedName = res.data?.fullName;
        } else if (user.role.toLowerCase() === "student") {
          const { StudentService } = await import("../services/student.service");
          const res = await StudentService.getProfile();
          fetchedName = res.data?.fullName;
        } else if (user.role.toLowerCase() === "lecturer") {
          const { LecturerService } = await import("../services/lecturer.service");
          const res = await LecturerService.getProfile();
          fetchedName = res.data?.fullName;
        }

        if (fetchedName) {
          setUser(prev => {
            const updated = { ...prev, fullName: fetchedName };
            localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to fetch missing profile for navbar name:", err);
      }
    };
    
    fetchMissingProfile();
  }, [user]);

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem(LOCAL_STORAGE.AUTH_USER);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // If fullName is missing (old session), try to extract from stored token
          if (!userData.fullName && userData.accessToken) {
            const decoded = decodeJWT(userData.accessToken);
            userData.fullName =
              decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
              decoded?.fullName ||
              decoded?.name ||
              decoded?.given_name ||
              null;
            // Persist the enriched object back
            localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(userData));
          }
          setUser(userData);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);

      if (response?.data) {
        const accessToken = response.data.accessToken;
        const decodedToken = decodeJWT(accessToken);
        const userRole =
          decodedToken?.[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || decodedToken?.role;

        // Try common claim names for the user's display name
        const fullName =
          decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decodedToken?.fullName ||
          decodedToken?.name ||
          decodedToken?.given_name ||
          response.data?.fullName ||
          null;

        const userData = {
          ...response.data,
          role: userRole,
          email: decodedToken?.email || decodedToken?.sub,
          fullName,
        };

        localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(userData));
        setUser(userData);

        toast.success("Login successful!");

        const dashboardPath = getDashboardPathByRole(userRole);
        navigate(dashboardPath || ROUTER_URL.COMMON.LOGIN);

        return { success: true, data: userData };
      }
    } catch (error) {
      console.error("Login failed:", error);

      const errorData = error?.response?.data;

      if (errorData?.errors) {
        // Return validation errors để component xử lý
        return { success: false, errors: errorData.errors };
      } else if (errorData?.message) {
        toast.error(errorData.message);
        return { success: false, message: errorData.message };
      } else {
        toast.error("Login failed. Please try again.");
        return { success: false, message: "Login failed" };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
    setUser(null);
    toast.info("Logged out successfully");
    navigate(ROUTER_URL.COMMON.LOGIN);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
