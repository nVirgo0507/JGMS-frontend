import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTER_URL } from "../consts/router.const";
import {
  getDashboardPathByRole,
  getStoredUser,
  getUserRole,
} from "../utils/auth";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={ROUTER_URL.COMMON.LOGIN}
      />
    );
  }

  const role = getUserRole(user);

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate replace to={getDashboardPathByRole(role)} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
