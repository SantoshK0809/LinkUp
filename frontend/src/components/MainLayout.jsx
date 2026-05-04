// import React from "react";

// const MainLayout = () => {
//   return (
//     <div className="flex flex-col h-screen bg-gray-950 text-white">
//       {/* HEADER */}
//       <header className="px-6 py-3 bg-gray-900 flex justify-between items-center border-b border-gray-800">
//         <h1 className="text-sm font-semibold">LinkUp</h1>
//         <span className="text-xs text-gray-400">
//           {videos.length + 1} participants
//         </span>
//       </header>

//       {/* MAIN AREA */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* MAIN VIDEO */}
//         <div className="flex-1 p-3">
//           <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
//             {/* 🔴 ACTIVE USER */}
//             {activeUser?.videoEnabled ? (
//               <RemoteVideo stream={activeUser.stream} />
//             ) : (
//               <Avatar name={activeUser?.userName} />
//             )}

//             <div className="absolute bottom-3 left-3 text-sm bg-black/50 px-3 py-1 rounded-full">
//               {activeUser?.userName || "You"}
//             </div>
//           </div>
//         </div>

//         {/* SIDE THUMBNAILS */}
//         <div className="w-44 flex flex-col gap-2 p-2 overflow-y-auto bg-gray-900 border-l border-gray-800">
//           {[selfUser, ...videos].map((user) => {
//             const isVideoOn =
//               user.stream?.getVideoTracks?.()[0]?.enabled ?? true;

//             return (
//               <div
//                 key={user.socketId}
//                 onClick={() => setActiveUser(user)}
//                 className="relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
//               >
//                 {isVideoOn ? (
//                   <RemoteVideo stream={user.stream} />
//                 ) : (
//                   <Avatar name={user.userName} />
//                 )}

//                 <div className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-2 py-0.5 rounded">
//                   {user.userName || "User"}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-gray-900/80 backdrop-blur px-6 py-3 rounded-full shadow-xl">
//         <button
//           onClick={handleVideo}
//           className={`p-3 rounded-full ${video ? "bg-gray-700" : "bg-red-500"}`}
//         >
//           {video ? <VideocamIcon /> : <VideocamOffIcon />}
//         </button>

//         <button
//           onClick={handleAudio}
//           className={`p-3 rounded-full ${audio ? "bg-gray-700" : "bg-red-500"}`}
//         >
//           {audio ? <MicIcon /> : <MicOffIcon />}
//         </button>

//         <button onClick={handleEndCall} className="p-3 bg-red-600 rounded-full">
//           <CallEndIcon />
//         </button>
//       </footer>
//     </div>
//   );
// };

// export default MainLayout;
