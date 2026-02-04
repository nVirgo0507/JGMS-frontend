import { useRoutes } from "react-router-dom";
import { ROUTER_URL } from "../consts/router.const";
import { ROLE } from "../consts/const";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageGroups from "../pages/Admin/ManageGroups";
import ManageLectures from "../pages/Admin/ManageLecture";
import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";
import HomePage from "../pages/common/Home";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () =>
  useRoutes([
    {
      element: <MainLayout />,
      children: [
        { path: ROUTER_URL.COMMON.HOME, element: <HomePage /> },
        { path: ROUTER_URL.COMMON.LOGIN, element: <LoginPage /> },
        { path: ROUTER_URL.COMMON.REGISTER, element: <RegisterPage /> },
      ],
    },
    {
      element: <ProtectedRoute allowedRoles={[ROLE.ADMIN]} />,
      children: [
        {
          path: ROUTER_URL.ADMIN.DASHBOARD,
          element: <AdminLayout />,
          children: [
            { index: true, element: <Dashboard /> },
            { path: "groups", element: <ManageGroups /> },
            { path: "lectures", element: <ManageLectures /> },
          ],
        },
      ],
    },
  ]);

export default AppRoutes;
