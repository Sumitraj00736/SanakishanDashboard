import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContextInstance.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [pressing, setPressing] = useState(false); // new state for press effect
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setPressing(true); // start press effect
    setTimeout(() => setPressing(false), 150); // release after 150ms
    const res = await login(email, password);
    if (res.success) {
      nav("/");
    } else {
      setErr(res.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md border-8 border-green-700 rounded-2xl shadow-2xl p-8 bg-white relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-700 px-8 py-2 rounded-xl shadow-lg text-white text-3xl font-bold tracking-widest animate-slide-down">
          SanaKishan
        </div>

        <h2 className="text-2xl font-bold mb-6 text-green-800 text-center mt-12">
          Admin Login
        </h2>

        {err && (
          <div className="mb-4 text-red-200 bg-red-800/50 p-3 rounded-md text-sm animate-pulse">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div className="relative">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 hover:border-green-400 text-gray-800 placeholder-gray-400 bg-green-50"
            />
            <label className="absolute -top-2 left-3 bg-green-50 px-1 text-xs font-medium text-green-700">
              Email
            </label>
          </div>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 hover:border-green-400 text-gray-800 placeholder-gray-400 bg-green-50"
            />
            <label className="absolute -top-2 left-3 bg-green-50 px-1 text-xs font-medium text-green-700">
              Password
            </label>
          </div>
          
          {/* Pressable Login Button */}
          <button
            type="submit"
            className={`w-full bg-green-700 text-white py-3 rounded-lg font-semibold 
                        transition-transform duration-150 shadow-md 
                        ${pressing ? "scale-90 bg-green-800 shadow-inner" : "scale-100"}`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
