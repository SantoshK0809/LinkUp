import React from "react";

const Avatar = ({ userName }) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 text-3xl font-semibold text-gray-300">
      {userName?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

export default Avatar;
