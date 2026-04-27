import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
    <section className="min-h-screen flex items-center px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT SIDE */}
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            NOW SUPPORTING 4K SPATIAL AUDIO
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 leading-tight">
            Video clarity for the{" "}
            <span className="italic text-gray-500">obsessed</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            High-quality video meetings that feel like you're in the same room.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4  sm:items-center">
            <Link
              to="/home"
              className="h-12 w-full bg-blue-400 flex items-center justify-center sm:w-auto min-w-[160px] rounded-full border border-gray-300 px-6 text-sm font-medium text-white hover:bg-blue-600 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE (IMAGE) */}
        <div className="hidden md:block">
          <img
            src="https://etimg.etb2bimg.com/photo/89287012.cms"
            alt="Video call preview"
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};
