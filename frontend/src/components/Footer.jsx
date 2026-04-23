// import { Video } from "lucide-react";

// export const Footer = () => {
//   return (
//     <footer>
//       <div>
//         <Video />
//         <span>LinkUp</span>
//       </div>

//       <p>© 2026 LinkUp. All rights reserved.</p>
//     </footer>
//   );
// };

import { Video } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <Video className="w-5 h-5 text-blue-500" />
          <span>LinkUp</span>
        </div>

        {/* Middle: Navigation */}
        <nav className="flex flex-wrap gap-6 text-sm justify-center">
          <a href="#" className="hover:text-white transition">About</a>
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </nav>

        {/* Right: Copyright */}
        <div className="text-xs text-gray-500 text-center md:text-right">
          © 2026 LinkUp. All rights reserved.
        </div>

      </div>
    </footer>
  );
};