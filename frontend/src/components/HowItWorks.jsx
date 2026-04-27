// const steps = [
//   { n: "01", title: "Generate link", desc: "Create room." },
//   { n: "02", title: "Invite team", desc: "Share link." },
//   { n: "03", title: "Start meeting", desc: "Connect instantly." },
// ];

// export const HowItWorks = () => {
//   return (
//     <section id="how">
//       {steps.map((s) => (
//         <div key={s.n}>
//           <h2>{s.n}</h2>
//           <h3>{s.title}</h3>
//           <p>{s.desc}</p>
//         </div>
//       ))}
//     </section>
//   );
// };

// const steps = [
//   { n: "01", title: "Generate link", desc: "Create your meeting room instantly." },
//   { n: "02", title: "Invite team", desc: "Share the link with your participants." },
//   { n: "03", title: "Start meeting", desc: "Connect and collaborate in real-time." },
// ];

const steps = [
  {
    n: "01",
    title: "Generate link",
    desc: "One click creates a unique, secure room with permanent persistence options.",
  },
  {
    n: "02",
    title: "Invite team",
    desc: "Share via Slack, Email, or SMS. No account required for participants to join.",
  },
  {
    n: "03",
    title: "Begin sync",
    desc: "Connect instantly with HD video and spatial audio synced across all devices.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how" className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        {/* <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Get started in just three simple steps
          </p> 
        </div> */}

        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Designed for Speed
          </h2>
          <p className="mt-4 text-muted-foreground">Three steps to clarity.</p>
        </div>

        {/* Steps */}
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((s, index) => (
            <div key={s.n} className="relative text-center">
              {/* Connector line (desktop only) */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-[2px] bg-gray-200 -translate-x-2/6" />
              )}

              {/* Step Number */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-md">
                {s.n}
              </div>

              {/* Title */}
              <h3 className="mt-6 text-lg font-medium text-gray-900">
                {s.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
