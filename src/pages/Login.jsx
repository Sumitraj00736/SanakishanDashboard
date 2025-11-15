import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      nav("/");
    } else {
      setErr(res.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        className="w-full max-w-md bg-green-700 p-8 rounded-xl shadow-lg transform transition-all duration-500 ease-out animate-slide-up"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
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
              className="w-full p-3 bg-white/90 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 hover:border-green-400 text-gray-800 placeholder-gray-400"
            />
            <label className="absolute -top-2 left-3 bg-green-700 px-1 text-xs font-medium text-gre00">
              Email
            </label>
          </div>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full p-3 bg-white/90 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 hover:border-green-400 text-gray-800 placeholder-gray-400"
            />
            <label className="absolute -top-2 left-3 bg-green-700 px-1 text-xs font-medium text-green-200">
              Password
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-green-300 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}