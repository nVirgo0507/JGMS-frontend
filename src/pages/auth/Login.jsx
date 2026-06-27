import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTER_URL } from "../../consts/router.const";

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const result = await login({
      email: form.email,
      password: form.password,
    });

    if (!result.success && result.errors) {
      // Xử lý validation errors
      const fieldErrors = {};
      Object.keys(result.errors).forEach((field) => {
        const fieldName = field.charAt(0).toLowerCase() + field.slice(1);
        fieldErrors[fieldName] =
          result.errors[field][0] || result.errors[field];
      });
      setErrors(fieldErrors);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-100 via-slate-50 to-white p-10 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                JGMS Access
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
                Centralize progress, reports, and student teams.
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Log in with your institutional account to manage deliverables
                and stay aligned with milestones.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-8 p-8 sm:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">
                Sign in
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Welcome to JGMS
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your role to access the right dashboard.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className={`w-full rounded-xl border ${errors.email ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="name@company.com"
                  type="email"
                  value={form.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className={`w-full rounded-xl border ${errors.password ? "border-red-400" : "border-slate-200"} bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30`}
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    className="h-4 w-4 rounded border-slate-300 bg-white text-teal-500 focus:ring-teal-500"
                    type="checkbox"
                  />
                  Remember me
                </label>
                <button
                  className="text-xs font-semibold text-teal-600 transition hover:text-teal-500"
                  type="button"
                >
                  Forgot?
                </button>
              </div>
              <button
                className="w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-white"
                type="submit"
              >
                Sign in
              </button>
            </form>
            <p className="text-sm text-slate-600">
              Need an account?{" "}
              <Link
                to={ROUTER_URL.COMMON.REGISTER}
                className="font-semibold text-teal-600 transition hover:text-teal-500"
              >
                Create one
              </Link>
            </p>
            <div className="space-y-4 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                Or continue with
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  Google
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  Microsoft
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  GitHub
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#0052CC] bg-[#0052CC]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0052CC] transition hover:bg-[#0052CC] hover:text-white group"
                  type="button"
                  onClick={() => window.location.href = "http://localhost:5284/api/jira/auth/login?state=sso"}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.53 12.008c0-2.827-2.28-5.116-5.105-5.116-2.83 0-5.12 2.29-5.12 5.116 0 2.822 2.29 5.11 5.12 5.11 2.825 0 5.105-2.288 5.105-5.11zM11.53 19.34c0-2.585-2.096-4.686-4.685-4.686-2.593 0-4.693 2.1-4.693 4.687 0 2.594 2.1 4.695 4.693 4.695 2.589 0 4.685-2.1 4.685-4.694zM22.695 12.008c0-2.827-2.29-5.116-5.116-5.116-2.826 0-5.112 2.29-5.112 5.116 0 2.822 2.286 5.11 5.112 5.11 2.826 0 5.116-2.288 5.116-5.11zM22.695 19.34c0-2.585-2.29-4.686-5.116-4.686-2.826 0-5.112 2.1-5.112 4.687 0 2.594 2.286 4.695 5.112 4.695 2.826 0 5.116-2.1 5.116-4.694zM16.945 4.654c0-2.586-2.095-4.686-4.685-4.686-2.594 0-4.694 2.1-4.694 4.686 0 2.592 2.1 4.693 4.694 4.693 2.59 0 4.685-2.1 4.685-4.693z"/></svg>
                  Jira
                </button>
              </div>
              <p>By continuing, you agree to our terms and privacy policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
