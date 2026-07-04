"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Scissors,
  Plus,
  X,
  Trash2,
  Edit3,
  Eye,
  Heart,
  Sparkles,
  Filter,
  Search,
  Globe,
  GlobeLock,
  MoreVertical,
  Zap,
} from "lucide-react";

type Clip = {
  id: number;
  sourceVideoId: number;
  projectId: number;
  title: string;
  description: string | null;
  startTime: number;
  endTime: number;
  status: string;
  aiScore: number | null;
  tags: string | null;
  views: number;
  likes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  videoTitle: string | null;
};

type Video = {
  id: number;
  title: string;
  projectId: number;
};

type Project = {
  id: number;
  name: string;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClip, setEditClip] = useState<Clip | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    sourceVideoId: "",
    projectId: "",
    startTime: "0",
    endTime: "30",
    tags: "",
  });

  const fetchData = useCallback(async () => {
    const [cRes, vRes, pRes] = await Promise.all([
      fetch("/api/clips"),
      fetch("/api/videos"),
      fetch("/api/projects"),
    ]);
    const [cData, vData, pData] = await Promise.all([
      cRes.json(),
      vRes.json(),
      pRes.json(),
    ]);
    setClips(cData.clips || []);
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

    if (editClip) {
      const res = await fetch(`/api/clips/${editClip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          startTime: parseInt(form.startTime),
          endTime: parseInt(form.endTime),
          tags: form.tags,
        }),
      });
      const data = await res.json();
      setClips((prev) =>
        prev.map((c) =>
          c.id === editClip.id ? { ...c, ...data.clip, videoTitle: c.videoTitle } : c
        )
      );
    } else {
      const body = {
        title: form.title,
        description: form.description,
        sourceVideoId: parseInt(form.sourceVideoId),
        projectId: parseInt(form.projectId),
        startTime: parseInt(form.startTime),
        endTime: parseInt(form.endTime),
        tags: form.tags,
      };

      // Optimistic
      const tempId = Date.now();
      const sourceVideo = videos.find((v) => v.id === body.sourceVideoId);
      const optimistic: Clip = {
        id: tempId,
        ...body,
        status: "processing",
        aiScore: null,
        views: 0,
        likes: 0,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        videoTitle: sourceVideo?.title || null,
      };
      setClips((prev) => [optimistic, ...prev]);

      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setClips((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? { ...data.clip, videoTitle: sourceVideo?.title || null }
            : c
        )
      );
    }

    setSaving(false);
    setShowModal(false);
    setEditClip(null);
    resetForm();
  }

  function resetForm() {
    setForm({
      title: "",
      description: "",
      sourceVideoId: "",
      projectId: "",
      startTime: "0",
      endTime: "30",
      tags: "",
    });
  }

  async function handleDelete(id: number) {
    setClips((prev) => prev.filter((c) => c.id !== id));
    setActiveMenu(null);
    await fetch(`/api/clips/${id}`, { method: "DELETE" });
  }

  async function togglePublish(clip: Clip) {
    const newVal = !clip.isPublished;
    setClips((prev) =>
      prev.map((c) => (c.id === clip.id ? { ...c, isPublished: newVal } : c))
    );
    setActiveMenu(null);
    await fetch(`/api/clips/${clip.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: newVal }),
    });
  }

  function openEdit(clip: Clip) {
    setEditClip(clip);
    setForm({
      title: clip.title,
      description: clip.description || "",
      sourceVideoId: clip.sourceVideoId.toString(),
      projectId: clip.projectId.toString(),
      startTime: clip.startTime.toString(),
      endTime: clip.endTime.toString(),
      tags: clip.tags || "",
    });
    setShowModal(true);
    setActiveMenu(null);
  }

  const filteredClips = clips.filter((clip) => {
    const matchesSearch =
      clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clip.tags || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || clip.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    processing: "bg-amber-100 text-amber-700",
    pending: "bg-slate-100 text-slate-600",
    failed: "bg-red-100 text-red-700",
  };

  function getScoreColor(score: number | null): string {
    if (!score) return "text-slate-400";
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-brand-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-500";
  }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Clips</h1>
          <p className="text-slate-500 mt-1">
            AI-generated clips from your videos
          </p>
        </div>
        <button
          onClick={() => {
            setEditClip(null);
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Clip
        </button>
      </div>

      {/* Filters */}
      {!loading && clips.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clips..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {["all", "completed", "processing", "pending"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                  filterStatus === status
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex gap-3">
                <div className="w-20 h-16 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded mb-2" />
                  <div className="h-3 w-32 skeleton rounded mb-2" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && clips.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No clips yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Add source videos and let AI automatically detect and generate the best clips.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" /> Create First Clip
          </button>
        </div>
      )}

      {/* Clips Grid */}
      {!loading && filteredClips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClips.map((clip) => (
            <div
              key={clip.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                {/* AI Score Badge */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                  <Sparkles className={`w-4 h-4 ${getScoreColor(clip.aiScore)}`} />
                  <span
                    className={`text-lg font-bold ${getScoreColor(clip.aiScore)}`}
                  >
                    {clip.aiScore || "—"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {clip.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {clip.videoTitle || "Unknown source"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[clip.status] || statusColors.pending
                        }`}
                      >
                        {clip.status}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === clip.id ? null : clip.id
                            )
                          }
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === clip.id && (
                          <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fadeIn">
                            <button
                              onClick={() => openEdit(clip)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Clip
                            </button>
                            <button
                              onClick={() => togglePublish(clip)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              {clip.isPublished ? (
                                <>
                                  <GlobeLock className="w-3.5 h-3.5" /> Unpublish
                                </>
                              ) : (
                                <>
                                  <Globe className="w-3.5 h-3.5" /> Publish
                                </>
                              )}
                            </button>
                            <hr className="my-1 border-slate-100" />
                            <button
                              onClick={() => handleDelete(clip.id)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {clip.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {clip.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-xs text-slate-400">
                      {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
                    </span>
                    {clip.isPublished && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <Globe className="w-3 h-3" /> Published
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="w-3 h-3" />
                      {formatNumber(clip.views)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Heart className="w-3 h-3" />
                      {formatNumber(clip.likes)}
                    </span>
                  </div>

                  {clip.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {clip.tags.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results after filter */}
      {!loading && clips.length > 0 && filteredClips.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">No matching clips</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {editClip ? "Edit Clip" : "Create Clip"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditClip(null);
                }}
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
                  placeholder="e.g., Epic Clutch Moment"
                />
              </div>
              {!editClip && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project
                    </label>
                    <select
                      required
                      value={form.projectId}
                      onChange={(e) =>
                        setForm({ ...form, projectId: e.target.value, sourceVideoId: "" })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
                    >
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Source Video
                    </label>
                    <select
                      required
                      value={form.sourceVideoId}
                      onChange={(e) =>
                        setForm({ ...form, sourceVideoId: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
                    >
                      <option value="">Select video</option>
                      {videos
                        .filter(
                          (v) =>
                            !form.projectId ||
                            v.projectId === parseInt(form.projectId)
                        )
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm resize-none"
                  placeholder="Brief description of this clip"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time (sec)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Time (sec)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  placeholder="highlight, funny, clutch"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditClip(null);
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editClip
                    ? "Update Clip"
                    : "Generate Clip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
