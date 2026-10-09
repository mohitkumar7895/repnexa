export function WhyChooseUs() {
  const pillars = [
    {
      icon: "🛡️",
      color: "bg-orange-100 text-orange-600",
      title: "4 checks first",
      desc: "Green ID, then entry.",
    },
    {
      icon: "🛡️",
      color: "bg-purple-100 text-purple-600",
      title: "Zero Advance Payment",
      desc: "Pay after the test.",
    },
    {
      icon: "⏱️",
      color: "bg-pink-100 text-pink-600",
      title: "Your city only",
      desc: "No match, no visit.",
    },
    {
      icon: "🏷️",
      color: "bg-emerald-100 text-emerald-600",
      title: "Doorstep Satisfaction",
      desc: "Test first. Then pay.",
    },
  ];

  return (
    <section className="py-10 md:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
            The Repnexa Quality
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1 leading-tight">
            Why Indian Households Trust Repnexa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Clear checks. Clear bill.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-6">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 md:p-6 flex items-center gap-3 md:flex-col md:items-start"
            >
              <div className={`shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl ${p.color} flex items-center justify-center text-xl md:text-2xl`}>
                {p.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Choose Service & Time",
      desc: "Appliance, issue, time.",
      badgeColor: "bg-slate-900",
    },
    {
      num: 2,
      title: "Technician Matched",
      desc: "Cleared technician in your city.",
      badgeColor: "bg-slate-900",
    },
    {
      num: 3,
      title: "Doorstep OTP & Repair",
      desc: "Green ID. OTP after the test.",
      badgeColor: "bg-slate-900",
    },
    {
      num: 4,
      title: "Test & Digital Invoice",
      desc: "Test, pay, invoice.",
      badgeColor: "bg-emerald-600",
    },
  ];

  return (
    <section id="how-it-works" className="py-10 md:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block">
            Seamless Execution
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1 leading-tight">
            How Doorstep Repair Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Book, match, test, pay.
          </p>
        </div>

        <div className="mt-6 md:mt-12 rounded-3xl border border-slate-200 bg-gradient-to-b from-purple-50 to-white p-4 sm:p-8">
          <ol className="md:hidden">
            {steps.map((s, i) => (
              <li key={s.num} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < steps.length - 1 && (
                  <span className="absolute left-5 top-11 bottom-0 w-px -translate-x-1/2 bg-purple-200" />
                )}
                <span className={`relative z-10 shrink-0 w-10 h-10 rounded-full ${s.badgeColor} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                  {s.num}
                </span>
                <div className="min-w-0 pt-1.5">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <ol className="hidden md:grid md:grid-cols-4 md:gap-6">
            {steps.map((s, i) => (
              <li key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <span className="absolute top-6 left-12 right-[-1.5rem] h-px bg-purple-200" />
                )}
                <div className={`relative z-10 w-12 h-12 rounded-full ${s.badgeColor} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                  {s.num}
                </div>
                <h3 className="mt-4 font-bold text-sm text-slate-900 leading-snug">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
