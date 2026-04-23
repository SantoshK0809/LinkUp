// import { Zap, Mic, Shield, Monitor, MessageSquare, Calendar } from "lucide-react";

// const features = [
//   { icon: Zap, title: "Ultra-Low Latency", desc: "Lag under 50ms." },
//   { icon: Mic, title: "Neural Audio", desc: "AI noise cancellation." },
//   { icon: Shield, title: "Security", desc: "End-to-end encryption." },
//   { icon: Monitor, title: "Screen Share", desc: "HD sharing." },
//   { icon: MessageSquare, title: "Chat", desc: "Real-time messaging." },
//   { icon: Calendar, title: "Scheduling", desc: "Auto reminders." },
// ];

// export const Features = () => {
//   return (
//     <section id="features">
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {features.map(({ icon: Icon, title, desc }) => (
//           <div key={title}>
//             <Icon />
//             <h3>{title}</h3>
//             <p>{desc}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };


import { Zap, Mic, Shield, Monitor, MessageSquare, Calendar } from "lucide-react";

const features = [
  { icon: Zap, title: "Ultra-Low Latency", desc: "Lag under 50ms." },
  { icon: Mic, title: "Neural Audio", desc: "AI noise cancellation." },
  { icon: Shield, title: "Security", desc: "End-to-end encryption." },
  { icon: Monitor, title: "Screen Share", desc: "HD sharing." },
  { icon: MessageSquare, title: "Chat", desc: "Real-time messaging." },
  { icon: Calendar, title: "Scheduling", desc: "Auto reminders." },
];

export const Features = () => {
  return (
    <section id="features" className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Everything you need to communicate
          </h2>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Powerful features designed for seamless collaboration
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition"
            >
              
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 mb-4 group-hover:bg-blue-100 transition">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};