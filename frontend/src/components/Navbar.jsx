import { Video } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
            <Video className="w-5 h-5 text-blue-600" />
            LinkUp
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5">
          <button className="text-base text-gray-600 hover:text-gray-900 transition cursor-pointer">
            Join as Guest
          </button>
          <Link
            to="/register"
            className="text-base text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            Register
          </Link>

          <Link
            to="/login"
            className="bg-blue-400 flex items-center text-center font-semibold justify-center text-white text-sm px-4 cursor-pointer py-2 w-24 rounded-full hidden sm:block hover:bg-blue-600 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};
