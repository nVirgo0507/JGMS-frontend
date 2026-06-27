import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BaseService } from "../../config/basic.service";
import { ROUTER_URL } from "../../consts/router.const";
import { LOCAL_STORAGE } from "../../consts/const";
import { decodeJWT, getDashboardPathByRole } from "../../utils/auth";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", studentCode: "" });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("JIRA_SSO_PROFILE");
    if (!stored) {
      navigate(ROUTER_URL.COMMON.LOGIN);
      return;
    }
    setProfile(JSON.parse(stored));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: profile.email,
        name: profile.name,
        jiraAccountId: profile.accountId,
        phone: form.phone,
        studentCode: form.studentCode
      };

      const response = await BaseService.post({
        url: "/api/auth/sso/jira/register",
        payload
      });

      if (response?.data?.accessToken) {
        const accessToken = response.data.accessToken;
        const decodedToken = decodeJWT(accessToken);
        const userRole = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decodedToken?.role;
        const userData = { accessToken, role: userRole, email: decodedToken?.email || decodedToken?.sub, fullName: profile.name };
        
        localStorage.setItem(LOCAL_STORAGE.AUTH_USER, JSON.stringify(userData));
        localStorage.removeItem("JIRA_SSO_PROFILE");
        toast.success("Account created successfully!");
        
        // Use location.href to force a full re-mount so AuthContext initializes with the new token
        window.location.href = getDashboardPathByRole(userRole);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete profile");
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur p-8">
        <h2 className="text-3xl font-semibold text-slate-900 mb-2">Complete Your Profile</h2>
        <p className="text-sm text-slate-600 mb-8">
          Welcome <b className="text-teal-600">{profile.name}</b>! We just need a few more details to set up your Student account.
        </p>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0912345678"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Student Code</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              name="studentCode"
              value={form.studentCode}
              onChange={handleChange}
              placeholder="SE123456"
              required
            />
          </div>
          <button
            className="w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            type="submit"
          >
            Finish & Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
