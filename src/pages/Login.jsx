import React, { useState, useContext } from "react";
import { BadgeCheck, Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, MapPin, ShieldCheck } from "lucide-react";
import { AppContext } from "../context/AppContextInstance.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      setShowSuccess(true);
      window.setTimeout(() => {
        nav("/");
      }, 500);
      return;
    }
    setErr(res.message || "Login failed");
  };

  return (
    <div className="min-h-screen bg-[#eef3ec]">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="w-full max-w-sm border border-[#d8e3d4] bg-white px-6 py-7 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#cfe1d0] bg-[#edf6ec] text-[#1f5f3b]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-4 text-lg font-semibold text-[#173b23]">Login Successful</p>
          </div>
        </div>
      )}

      <div className="h-4 w-full bg-[#1f5f3b]" />

      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden border border-[#cfd8cb] bg-white shadow-[0_18px_45px_rgba(31,95,59,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border-b border-[#dbe4d7] bg-[#f6faf4] px-8 py-10 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center gap-2 border-l-4 border-[#1f5f3b] bg-[#e8f1e6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f5f3b]">
              <ShieldCheck className="h-4 w-4" />
              Authorized Access
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="border border-[#d5dfd1] bg-white p-3 shadow-sm">
                <img
                  src="/logo.jpg"
                  alt="Sana Kishan Logo"
                  className="h-20 w-20 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#173b23]">
                  महिला साना किसान
                </h1>
                <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold tracking-[0.08em] text-[#2f6942]">
                  <BadgeCheck className="h-4 w-4" />
                  कस्टम हायरिङ
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#2f6942]">
                  <MapPin className="h-4 w-4" />
                  लक्ष्मीनिया गाउँपालिका - 7
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-5">
              <div className="border-l-4 border-[#1f5f3b] bg-white px-5 py-4 shadow-sm">
                <h2 className="text-lg font-semibold text-[#173b23]">Dashboard Login</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Use your assigned admin credentials to access products, bookings,
                  members, support, and category management.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-[#dbe4d7] bg-white px-4 py-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6942]">
                    <Building2 className="h-4 w-4" />
                    Access Area
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Secure administrative dashboard for official operational use.
                  </p>
                </div>
                <div className="border border-[#dbe4d7] bg-white px-4 py-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6942]">
                    <ShieldCheck className="h-4 w-4" />
                    Sign-In Note
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Only approved users should access and update dashboard records.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-8 py-10 lg:px-10">
            <div className="mx-auto w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="border border-[#d5dfd1] bg-[#f6faf4] p-2.5 text-[#1f5f3b]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#173b23]">Sign In</h2>
                  <p className="text-sm text-slate-600">Enter your login details below.</p>
                </div>
              </div>

              {err && (
                <div className="mt-6 border border-[#dcb7b7] bg-[#fbf0f0] px-4 py-3 text-sm text-[#8b2f2f]">
                  {err}
                </div>
              )}

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#234a2f]">
                    Email
                  </label>
                  <div className="flex items-center border border-[#cfd8cb] bg-[#fbfdfb] focus-within:border-[#2f6942] focus-within:ring-2 focus-within:ring-[#d7e6d8]">
                    <span className="px-3 text-[#2f6942]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-transparent px-1 py-3 text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#234a2f]">
                    Password
                  </label>
                  <div className="flex items-center border border-[#cfd8cb] bg-[#fbfdfb] focus-within:border-[#2f6942] focus-within:ring-2 focus-within:ring-[#d7e6d8]">
                    <span className="px-3 text-[#2f6942]">
                      <LockKeyhole className="h-4 w-4" />
                    </span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-transparent px-1 py-3 text-gray-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="px-3 text-[#2f6942] hover:text-[#173b23]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border border-[#184d30] bg-[#1f5f3b] px-4 py-3 font-semibold text-white transition hover:bg-[#184d30] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Signing In..." : "Login"}
                </button>
              </form>

              <div className="mt-8 border-t border-[#e1e7de] pt-4 text-xs leading-5 text-slate-500">
                Protected access for authorized dashboard users only.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
