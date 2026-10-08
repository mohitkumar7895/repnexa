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
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
            The Repnexa Quality
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Why Indian Households Trust Repnexa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Clear checks. Clear bill.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className={`w-12 h-12 rounded-lg ${p.color} flex items-center justify-center text-2xl font-bold`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
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
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block">
            Seamless Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            How Doorstep Repair Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Book, match, test, pay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((s) => (
            <div key={s.num} className="text-center space-y-3 p-4">
              <div className={`w-12 h-12 rounded-full ${s.badgeColor} text-white font-black text-sm flex items-center justify-center mx-auto shadow-md`}>
                {s.num}
              </div>
              <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
