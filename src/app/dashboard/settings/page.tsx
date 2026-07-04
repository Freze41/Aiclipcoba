"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Bell, Palette, Save, Check } from "lucide-react";

type UserInfo = {
  id: number;
  name: string;
  email: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    clipComplete: true,
    weeklyDigest: true,
    aiSuggestions: false,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="h-8 w-32 skeleton rounded mb-6" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="h-4 w-48 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded" />
          <div className="h-4 w-48 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              key: "clipComplete" as const,
              label: "Clip Processing Complete",
              desc: "Get notified when AI finishes generating clips",
            },
            {
              key: "weeklyDigest" as const,
              label: "Weekly Performance Digest",
              desc: "Receive a weekly summary of your clip performance",
            },
            {
              key: "aiSuggestions" as const,
              label: "AI Suggestions",
              desc: "Get AI-powered suggestions for improving your clips",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifSettings((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }))
                }
                className={`w-11 h-6 rounded-full transition relative ${
                  notifSettings[item.key] ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    notifSettings[item.key] ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">AI Preferences</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Default Clip Duration
            </label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
              <option>15 seconds</option>
              <option>30 seconds</option>
              <option selected>45 seconds</option>
              <option>60 seconds</option>
              <option>90 seconds</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              AI Sensitivity
            </label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
              <option>Low — Fewer, higher quality clips</option>
              <option selected>Medium — Balanced</option>
              <option>High — More clips, wider coverage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Auto-publish Threshold
            </label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none">
              <option>Disabled</option>
              <option>Score 90+ (Very High Quality)</option>
              <option>Score 80+ (High Quality)</option>
              <option>Score 70+ (Good Quality)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
