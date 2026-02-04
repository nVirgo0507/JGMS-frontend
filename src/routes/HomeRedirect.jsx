import { Navigate } from "react-router-dom";
import { ROUTER_URL } from "../consts/router.const";
import { getDashboardPathByRole, getStoredUser, getUserRole } from "../utils/auth";

const HomeRedirect = () => {
  const user = getStoredUser();
  if (!user) {
    return <Navigate replace to={ROUTER_URL.COMMON.LOGIN} />;
  }

  const role = getUserRole(user);
  return <Navigate replace to={getDashboardPathByRole(role)} />;
};

export default HomeRedirect;
