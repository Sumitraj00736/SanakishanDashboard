import React from "react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Rotating Ring */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-b-white animate-spin-slow"></div>
        <div className="absolute inset-0 rounded-full border-4 border-l-green-700 border-r-white animate-spin-reverse"></div>
      </div>

      {/* Bouncing Dots */}
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-green-700 rounded-full animate-bounce delay-300"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-450"></div>
      </div>

      <p className="mt-4 text-green-700 font-medium animate-pulse">Loading...</p>

      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 2.5s linear infinite;
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-reverse {
            animation: spin-reverse 1.8s linear infinite;
          }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-450 { animation-delay: 0.45s; }
        `}
      </style>
    </div>
  );
}
