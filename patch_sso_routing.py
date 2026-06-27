import re
import os

callback_file = r"d:\SWPFE\JGMS-frontend\src\pages\student\JiraCallback.jsx"
with open(callback_file, "r", encoding="utf-8") as f:
    callback_content = f.read()

# 1. Add new imports to JiraCallback.jsx
imports_pattern = r'import \{ ROUTER_URL \} from "../../consts/router.const";'
imports_replacement = """import { ROUTER_URL } from "../../consts/router.const";
import { LOCAL_STORAGE } from "../../consts/const";
import { decodeJWT, getDashboardPathByRole } from "../../utils/auth";"""
callback_content = callback_content.replace(imports_pattern, imports_replacement)

# 2. Add isSso detection
group_code_pattern = r'const groupCode = searchParams\.get\("state"\); // We passed groupCode in the state!'
group_code_replacement = """const groupCode = searchParams.get("state"); // We passed groupCode in the state!
  const isSso = groupCode === "sso";"""
callback_content = callback_content.replace(group_code_pattern, group_code_replacement)

# 3. Replace exchangeTokens function
exchange_pattern = r"""    // 1\. Exchange code for tokens
    const exchangeTokens = async \(\) => \{
      try \{
        // C# backend expects exactly a JSON string primitive for \[FromBody\] string code
        const response = await BaseService\.post\(\{
          url: "/api/jira/auth/callback",
          payload: `"\$\{code\}"`, 
          headers: \{ "Content-Type": "application/json" \}
        \}\);
        
        if \(response\?\.data\) \{
          setTokens\(response\.data\);
          setStatus\("project"\);
        \} else \{
          throw new Error\("Failed to retrieve tokens from backend\."\);
        \}
      \} catch \(err\) \{
        setStatus\("error"\);
        setErrorMsg\(err\.response\?\.data\?\.message \|\| err\.message \|\| "Failed to exchange Atlassian tokens\."\);
      \}
    \};

    exchangeTokens\(\);
  \}, \[code, groupCode\]\);"""

exchange_replacement = """    // 1. Exchange code for tokens
    const exchangeTokens = async () => {
      try {
        if (isSso) {
          // --- SSO Flow ---
          const response = await BaseService.post({
            url: "/api/auth/sso/jira/callback",
            payload: { code }
          });
          
          if (response?.data?.isNewUser) {
            localStorage.setItem("JIRA_SSO_PROFILE", JSON.stringify(response.data.profile));
            navigate("/register/complete-profile");
          } else if (response?.data?.accessToken) {
            const accessToken = response.data.accessToken;
            const decodedToken = decodeJWT(accessToken);
            const userRole = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken?.role;
            const userData = { accessToken, role: userRole, email: decodedToken?.email || decodedToken?.sub };
            localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(userData));
            toast.success("Login successful!");
            window.location.href = getDashboardPathByRole(userRole);
          } else {
            throw new Error("Invalid SSO response from server.");
          }
        } else {
          // --- Project Linking Flow ---
          // C# backend expects exactly a JSON string primitive for [FromBody] string code
          const response = await BaseService.post({
            url: "/api/jira/auth/callback",
            payload: `"${code}"`, 
            headers: { "Content-Type": "application/json" }
          });
          
          if (response?.data) {
            setTokens(response.data);
            setStatus("project");
          } else {
            throw new Error("Failed to retrieve tokens from backend.");
          }
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.response?.data?.message || err.message || "Failed to exchange Atlassian tokens.");
      }
    };

    exchangeTokens();
  }, [code, groupCode, isSso, navigate]);"""

callback_content = re.sub(exchange_pattern, exchange_replacement, callback_content)

with open(callback_file, "w", encoding="utf-8") as f:
    f.write(callback_content)


# --- 4. Update AppRoutes.jsx ---
routes_file = r"d:\SWPFE\JGMS-frontend\src\routes\AppRoutes.jsx"
with open(routes_file, "r", encoding="utf-8") as f:
    routes_content = f.read()

# Add import
import_routes = r'import RegisterPage from "../pages/auth/Register";'
import_routes_repl = """import RegisterPage from "../pages/auth/Register";
import CompleteProfilePage from "../pages/auth/CompleteProfile";"""
routes_content = routes_content.replace(import_routes, import_routes_repl)

# Add Route
route_pattern = r'<Route path=\{ROUTER_URL\.COMMON\.REGISTER\} element=\{<RegisterPage />\} />'
route_repl = """<Route path={ROUTER_URL.COMMON.REGISTER} element={<RegisterPage />} />
        <Route path="/register/complete-profile" element={<CompleteProfilePage />} />"""
routes_content = routes_content.replace(route_pattern, route_repl)

with open(routes_file, "w", encoding="utf-8") as f:
    f.write(routes_content)

print("JiraCallback and AppRoutes patched successfully!")
