"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Film,
  Plus,
  X,
  Trash2,
  Clock,
  HardDrive,
  Scissors,
  Upload,
  MoreVertical,
} from "lucide-react";

type Video = {
  id: number;
  projectId: number;
  title: string;
  originalUrl: string | null;
  durationSeconds: number | null;
  fileSize: string | null;
  platform: string | null;
  createdAt: string;
  clipCount: number;
};

type Project = {
  id: number;
  name: string;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

const platforms = ["YouTube", "Twitch", "TikTok", "Spotify", "GoPro", "Other"];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    projectId: "",
    platform: "YouTube",
    durationSeconds: "",
    fileSize: "",
  });

  const fetchData = useCallback(async () => {
    const [vRes, pRes] = await Promise.all([
      fetch("/api/videos"),
      fetch("/api/projects"),
    ]);
    const [vData, pData] = await Promise.all([vRes.json(), pRes.json()]);
    setVideos(vData.videos || []);
    setProjects(pData.projects || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title: form.title,
      projectId: parseInt(form.projectId),
      platform: form.platform,
      durationSeconds: form.durationSeconds
        ? parseInt(form.durationSeconds)
        : null,
      fileSize: form.fileSize || null,
    };

    // Optimistic
    const tempId = Date.now();
    const optimistic: Video = {
      id: tempId,
      ...body,
      originalUrl: null,
      createdAt: new Date().toISOString(),
      clipCount: 0,
    };
    setVideos((prev) => [optimistic, ...prev]);
    setShowModal(false);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setVideos((prev) =>
      prev.map((v) => (v.id === tempId ? { ...data.video, clipCount: 0 } : v))
    );

    setSaving(false);
    setForm({
      title: "",
      projectId: "",
      platform: "YouTube",
      durationSeconds: "",
      fileSize: "",
    });
  }

  async function handleDelete(id: number) {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setActiveMenu(null);
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
  }

  const platformColors: Record<string, string> = {
    YouTube: "bg-red-100 text-red-700",
    Twitch: "bg-purple-100 text-purple-700",
    TikTok: "bg-pink-100 text-pink-700",
    Spotify: "bg-green-100 text-green-700",
    GoPro: "bg-blue-100 text-blue-700",
    Other: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Source Videos</h1>
          <p className="text-slate-500 mt-1">
            Upload long-form content to generate clips
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className="w-16 h-12 skeleton rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-60 skeleton rounded mb-2" />
                <div className="h-3 w-40 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && videos.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No source videos yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Add your first video to start generating AI-powered clips.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" /> Add First Video
          </button>
        </div>
      )}

      {/* Videos List */}
      {!loading && videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Film className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {video.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        {video.platform && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              platformColors[video.platform] ||
                              platformColors.Other
                            }`}
                          >
                            {video.platform}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(video.durationSeconds)}
                        </span>
                        {video.fileSize && (
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {video.fileSize}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          {video.clipCount} clips
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === video.id ? null : video.id
                          )
                        }
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === video.id && (
                        <div className="absolute right-0 top-8 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fadeIn">
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Add Source Video
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  placeholder="e.g., Stream Highlights #42"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project
                </label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) =>
                    setForm({ ...form, projectId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={form.platform}
                    onChange={(e) =>
                      setForm({ ...form, platform: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (sec)
                  </label>
                  <input
                    type="number"
                    value={form.durationSeconds}
                    onChange={(e) =>
                      setForm({ ...form, durationSeconds: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                    placeholder="3600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Size
                </label>
                <input
                  type="text"
                  value={form.fileSize}
                  onChange={(e) =>
                    setForm({ ...form, fileSize: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  placeholder="e.g., 2.5 GB"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
