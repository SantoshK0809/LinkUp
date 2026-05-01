// import React from "react";
// import { Video, HistoryIcon, ContactRound } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";

// const LoggedInNav = () => {
//   const navigate = useNavigate();
//   return (
//     <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
//       <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
//         {/* Left: Logo + Links */}
//         <div className="flex items-center gap-8">
//           {/* Logo */}
//           <a
//             href="/"
//             className="flex items-center gap-2 text-lg font-semibold text-gray-900"
//           >
//             <Video className="w-5 h-5 text-blue-600" />
//             LinkUp
//           </a>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-5">
//           <button className="text-base  hidden sm:block flex gap-1 border border-gray-300 px-4 rounded-full py-1 hover:border-gray-500 items-center text-gray-600 hover:text-gray-900 transition cursor-pointer">
//             <HistoryIcon size={20} />
//             History
//           </button>
//           <Link
//             to="/meetings"
//             className="text-base border border-gray-300 px-4 rounded-full py-1 flex gap-1 items-center hover:border-gray-400 text-gray-600 hover:text-gray-900 transition cursor-pointer"
//           >
//             <ContactRound size={20} />
//             Meetings
//           </Link>

//           <button
//             to="/login"
//             onClick={() => {
//               localStorage.removeItem("token");
//               navigate("/login");
//             }}
//             className="bg-blue-400 flex items-center text-center font-semibold justify-center text-white text-sm px-4 cursor-pointer py-2 w-24 rounded-full hidden sm:block hover:bg-blue-600 transition"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default LoggedInNav;

import React, { useState } from "react";
import { Video, HistoryIcon, ContactRound, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const LoggedInNav = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-gray-900"
        >
          <Video className="w-5 h-5 text-blue-600" />
          LinkUp
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/history"
            className="flex cursor-pointer gap-1 border border-gray-300 px-4 py-1 rounded-full items-center text-gray-600 hover:text-gray-900 hover:border-gray-500 transition"
          >
            <HistoryIcon size={18} />
            History
          </Link>

          <Link
            to="/create-meeting"
            className="flex gap-1 border border-gray-300 px-4 py-1 rounded-full items-center text-gray-600 hover:text-gray-900 hover:border-gray-500 transition"
          >
            <ContactRound size={18} />
            Create Meeting
          </Link>

          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 text-sm font-medium cursor-pointer rounded-full hover:bg-blue-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-3 px-4 pb-4 border-t border-gray-200 bg-white">
          <button className="flex gap-2 items-center text-gray-700">
            <HistoryIcon size={18} />
            History
          </button>

          <Link
            to="/meetings"
            className="flex gap-2 items-center text-gray-700"
            onClick={() => setOpen(false)}
          >
            <ContactRound size={18} />
            Meetings
          </Link>

          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default LoggedInNav;
