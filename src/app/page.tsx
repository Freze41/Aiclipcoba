"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  async function handleDemoLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Failed to load demo data");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">ClipperAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowLogin(true); setShowRegister(false); setError(""); }}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => { setShowRegister(true); setShowLogin(false); setError(""); }}
            className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-sm text-brand-300">AI-Powered Clip Detection</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Turn Long Videos Into{" "}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Viral Clips
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            ClipperAI automatically detects the most engaging moments in your videos,
            generates clips, and scores them for virality — all powered by advanced AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="px-8 py-3.5 text-base font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-lg shadow-brand-600/25"
            >
              {loading ? "Loading Demo..." : "Try Live Demo →"}
            </button>
            <button
              onClick={() => { setShowRegister(true); setShowLogin(false); setError(""); }}
              className="px-8 py-3.5 text-base font-semibold text-white border border-slate-600 rounded-xl hover:bg-slate-800 transition"
            >
              Create Account
            </button>
          </div>
          {error && !showLogin && !showRegister && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            {
              icon: "🤖",
              title: "AI Clip Detection",
              desc: "Our AI scans your entire video and identifies the most engaging, shareable moments automatically.",
            },
            {
              icon: "⚡",
              title: "Instant Processing",
              desc: "Get clips in seconds, not hours. Our pipeline handles videos up to 4 hours long with ease.",
            },
            {
              icon: "📊",
              title: "Virality Scoring",
              desc: "Each clip gets an AI-generated virality score so you know which clips will perform best.",
            },
            {
              icon: "🎯",
              title: "Smart Tagging",
              desc: "Auto-generated tags and descriptions optimized for each platform's algorithm.",
            },
            {
              icon: "📱",
              title: "Multi-Platform Export",
              desc: "Export clips optimized for TikTok, YouTube Shorts, Instagram Reels, and more.",
            },
            {
              icon: "📈",
              title: "Analytics Dashboard",
              desc: "Track views, likes, and engagement across all your clips in one place.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-brand-500/30 transition"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-white mt-4 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Auth Modal */}
      {(showLogin || showRegister) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {showLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <button
                onClick={() => { setShowLogin(false); setShowRegister(false); setError(""); }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-4">
              {showRegister && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
              >
                {loading ? "Please wait..." : showLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLogin(!showLogin);
                  setShowRegister(!showRegister);
                  setError("");
                }}
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                {showLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => { setShowLogin(false); setShowRegister(false); handleDemoLogin(); }}
                className="w-full py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                🚀 Try Demo Account Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
