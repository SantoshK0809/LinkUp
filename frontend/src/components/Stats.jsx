// const stats = [
//   { value: "99.98%", label: "Uptime" },
//   { value: "142ms", label: "Latency" },
//   { value: "8.2k", label: "Users" },
//   { value: "4.9/5", label: "Rating" },
// ];

// export const Stats = () => {
//   return (
//     <section id="stats">
//       {stats.map((s) => (
//         <div key={s.label}>
//           <h3>{s.value}</h3>
//           <p>{s.label}</p>
//         </div>
//       ))}
//     </section>
//   );
// };


const stats = [
  { value: "99.98%", label: "Uptime" },
  { value: "142ms", label: "Latency" },
  { value: "8.2k", label: "Users" },
  { value: "4.9/5", label: "Rating" },
];

export const Stats = () => {
  return (
    <section id="stats" className="bg-white py-16 px-4 border-y border-gray-200">
      <div className="max-w-6xl mx-auto">

        {/* Grid */}
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">

          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center"
            >
              {/* Value */}
              <h3 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
                {s.value}
              </h3>

              {/* Label */}
              <p className="mt-2 text-xs font-medium uppercase tracking-widest text-gray-500">
                {s.label}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};