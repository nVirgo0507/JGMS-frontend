import { Link } from "react-router-dom";

const FeatureIcon = ({ variant = "emerald" }) => {
  const ring =
    variant === "sky"
      ? "bg-sky-500/15 text-sky-300 ring-sky-500/25"
      : variant === "amber"
        ? "bg-amber-500/15 text-amber-200 ring-amber-500/25"
        : "bg-emerald-500/15 text-emerald-200 ring-emerald-500/25";

  return (
    <span
      className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${ring}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="opacity-95"
      >
        <path
          d="M7 12l3 3 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
    <div className="text-2xl font-semibold text-slate-900">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
      {label}
    </div>
  </div>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
    {children}
  </div>
);

const features = [
  {
    title: "SRS từ Jira",
    desc: "Chuyển Epic/Story thành cấu trúc tài liệu rõ ràng, chuẩn hóa yêu cầu và giảm thời gian viết tay.",
    variant: "emerald",
  },
  {
    title: "Báo cáo đội nhóm",
    desc: "Tổng hợp phân công, tiến độ, kết quả theo tuần/sprint để bám sát kế hoạch học kỳ.",
    variant: "sky",
  },
  {
    title: "Đánh giá đóng góp",
    desc: "Phân tích commit/PR, tần suất và mức ảnh hưởng để giảng viên đánh giá công bằng.",
    variant: "amber",
  },
];

const steps = [
  {
    k: "01",
    title: "Kết nối Jira & GitHub",
    desc: "Đồng bộ dự án, sprint, issue và hoạt động code theo thời gian thực.",
  },
  {
    k: "02",
    title: "Tự động hóa tài liệu",
    desc: "Sinh khung SRS, mapping yêu cầu và theo dõi thay đổi xuyên suốt sprint.",
  },
  {
    k: "03",
    title: "Báo cáo & đánh giá",
    desc: "Dashboard minh bạch: tiến độ, trách nhiệm, đóng góp và chất lượng.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-sky-500/15 blur-[80px]" />
        <div className="absolute -right-24 top-10 h-[480px] w-[480px] rounded-full bg-emerald-500/10 blur-[90px]" />
        <div className="absolute bottom-[-240px] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[110px]" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
      </div>
<div className="relative mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid gap-10 pb-12 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] text-slate-600">
                Capstone tracking
              </span>
              <span className="text-xs text-slate-500">
                Minh bạch · Có hệ thống · Dễ đánh giá
              </span>
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Theo dõi tiến độ đồ án{" "}
              <span className="bg-gradient-to-r from-sky-300 via-emerald-200 to-fuchsia-300 bg-clip-text text-transparent">
                minh bạch
              </span>{" "}
              và{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-sky-200 to-white bg-clip-text text-transparent">
                chuẩn hóa
              </span>
              .
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              Nền tảng giúp đội dự án chuyển yêu cầu từ Jira thành tài liệu SRS,
              tổng hợp phân công &amp; tiến độ theo sprint, đồng thời phân tích
              đóng góp GitHub để giảng viên đánh giá công bằng.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Bắt đầu ngay
              </Link>
              <a
                href="#features"
                className="rounded-full border border-slate-200 bg-slate-50 px-7 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Xem tính năng
              </a>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <Stat label="Tự động hóa" value="SRS / Sprint" />
              <Stat label="Báo cáo" value="Theo tuần" />
              <Stat label="Đánh giá" value="Theo đóng góp" />
            </div>
          </div>

          {/* Mock dashboard */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Dashboard preview
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    Bảng điều khiển thống nhất
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">Sprint 05</span>
                    <span className="text-slate-500">Tuần này</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-300 to-sky-300" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Hoàn thành 17/25</span>
                    <span>68%</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Jira
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Epic/Story → SRS items
                    </div>
                    <div className="mt-4 flex gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 w-3 rounded-full bg-slate-200"
                          style={{ opacity: 0.25 + i * 0.07 }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      GitHub
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Commit/PR contribution
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-1">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 rounded bg-emerald-400/20"
                          style={{ opacity: 0.15 + (i % 7) * 0.07 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/50 p-4 text-sm text-slate-600">
                  Dành cho{" "}
                  <span className="font-semibold text-slate-900">sinh viên</span>,{" "}
                  <span className="font-semibold text-slate-900">trưởng nhóm</span>{" "}
                  và{" "}
                  <span className="font-semibold text-slate-900">giảng viên</span>{" "}
                  trong học phần đồ án phần mềm.
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Tính năng chính
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Tập trung vào minh bạch &amp; hiệu quả
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                Từ yêu cầu → tài liệu → tiến độ → đánh giá. Mọi thứ được đồng bộ
                và thể hiện rõ ràng, dễ theo dõi cho cả nhóm và giảng viên.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <div className="flex items-start gap-4">
                  <FeatureIcon variant={f.variant} />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-10">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Quy trình
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  3 bước triển khai trong nhóm
                </h2>
              </div>
              <div className="text-sm text-slate-600">
                Thiết kế để onboarding nhanh trong tuần đầu sprint.
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-slate-200 bg-white/40 p-6"
                >
                  <div className="text-xs font-semibold text-slate-500">
                    {s.k}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {s.title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Sẵn sàng để bắt đầu?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Đăng nhập để tạo workspace dự án đầu tiên.
                </div>
              </div>
              <Link
                to="/login"
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Đi tới đăng nhập
              </Link>
            </div>
          </div>
        </section>

      </div>
</div>
  );
}





