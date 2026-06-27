import os

files_to_patch = [
    r"d:\SWPFE\JGMS-frontend\src\pages\auth\Login.jsx",
    r"d:\SWPFE\JGMS-frontend\src\pages\auth\Register.jsx"
]

target_block = """              <div className="flex flex-wrap gap-3">
                <button
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  Google
                </button>
                <button
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  Microsoft
                </button>
                <button
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300"
                  type="button"
                >
                  GitHub
                </button>
              </div>"""

replacement_block = """              <div className="grid grid-cols-2 gap-3">
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
              </div>"""

for fp in files_to_patch:
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()
        
        content = content.replace(target_block, replacement_block)
        
        with open(fp, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {os.path.basename(fp)}")

print("Done patching frontend UI!")
