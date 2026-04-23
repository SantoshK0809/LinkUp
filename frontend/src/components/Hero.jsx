// import { useState } from "react";

// import { toast } from "sonner";

// export const Hero = () => {
//   const [code, setCode] = useState("");

//   const handleJoin = () => {
//     if (!code.trim()) {
//       toast.error("Please enter a meeting code");
//       return;
//     }
//     toast.success(`Joining meeting ${code.trim()}...`);
//   };

//   const handleStart = () => {
//     toast.success("Starting a new meeting...");
//   };

//   return (
//     <section className="px-6 pt-24 pb-32">
//       <div className="mx-auto max-w-4xl text-center">
//         <h1 className="text-5xl sm:text-7xl">
//           Video clarity for the <span className="italic">obsessed</span>.
//         </h1>

//         <p className="mt-8 text-lg">
//           High-fidelity video conferencing that feels real.
//         </p>

//         <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
//           <input
//             type="text"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             placeholder="Enter meeting code"
//             className="border px-4 py-2"
//           />

//           <button className="bg-blue-400 p-3 rounded-2xl w-20 text-white" onClick={handleJoin}>Join</button>

//           <button onClick={handleStart} variant="outline">
//             Start Meeting
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };


import { useState } from "react";
import { toast } from "sonner";

export const Hero = () => {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }
    toast.success(`Joining meeting ${code.trim()}...`);
  };

  const handleStart = () => {
    toast.success("Starting a new meeting...");
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-3xl text-center">

        {/* Heading */}
        <h1 className="text-4xl font-semibold leading-tight text-gray-900 sm:text-6xl">
          Video clarity for the <span className="italic text-gray-500">obsessed</span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base text-gray-600 sm:text-lg">
          High-quality video meetings that feel like you're in the same room.
        </p>

        {/* Input + Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center">

          {/* Input group */}
          <div className="flex w-full max-w-md overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500">

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Enter meeting code"
              className="flex-1 px-5 py-3 text-sm outline-none"
            />

            <button
              onClick={handleJoin}
              className="bg-blue-600 px-6 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Join
            </button>
          </div>

          {/* OR separator */}
          <span className="text-sm text-gray-400 font-medium">OR</span>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Start Meeting
          </button>
        </div>
      </div>
    </section>
  );
};
