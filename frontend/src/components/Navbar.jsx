
// import { Video } from "lucide-react";

// export const Navbar = () => {
//   return (
//     <nav className="sticky top-0 z-50 glass-surface border-x-0 border-t-0">
//       <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
//         <div className="flex items-center gap-8">
//           <a href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tighter text-foreground">
//             <Video className="h-5 w-5 text-accent" />
//             LinkUp
//           </a>

//           <div className="hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
//             <a href="#features" className="hover:text-foreground">Solutions</a>
//             <a href="#how" className="hover:text-foreground">Resources</a>
//             <a href="#stats" className="hover:text-foreground">Pricing</a>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button variant="ghost" size="sm">Sign In</button>
//           <button size="sm" className="rounded-full bg-primary px-5">
//             Join Free
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };


import { Video } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">

        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Video className="w-5 h-5 text-blue-600" />
            LinkUp
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Solutions</a>
            <a href="#how" className="hover:text-gray-900 transition">Resources</a>
            <a href="#stats" className="hover:text-gray-900 transition">Pricing</a>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          <button className="text-sm text-gray-600 hover:text-gray-900 transition">
            Sign In
          </button>

          <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-700 transition">
            Join Free
          </button>
        </div>

      </div>
    </nav>
  );
};