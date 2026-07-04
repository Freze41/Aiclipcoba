"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FolderOpen,
  Plus,
  X,
  Trash2,
  Edit3,
  Film,
  Scissors,
  MoreVertical,
} from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  clipCount: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editProject) {
      const res = await fetch(`/api/projects/${editProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? { ...p, ...data.project } : p))
      );
    } else {
      // Optimistic add
      const tempId = Date.now();
      const optimistic: Project = {
        id: tempId,
        name: form.name,
        description: form.description,
        clipCount: 0,
        videoCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [optimistic, ...prev]);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === tempId ? { ...data.project, clipCount: 0, videoCount: 0 } : p
        )
      );
    }
    setSaving(false);
    setShowModal(false);
    setEditProject(null);
    setForm({ name: "", description: "" });
  }

  async function handleDelete(id: number) {
    // Optimistic delete
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveMenu(null);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  }

  function openEdit(project: Project) {
    setEditProject(project);
    setForm({ name: project.name, description: project.description || "" });
    setShowModal(true);
    setActiveMenu(null);
  }

  function openCreate() {
    setEditProject(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            Organize your content into projects
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="h-5 w-40 skeleton rounded mb-3" />
              <div className="h-4 w-full skeleton rounded mb-2" />
              <div className="h-4 w-3/4 skeleton rounded mb-4" />
              <div className="flex gap-4">
                <div className="h-4 w-20 skeleton rounded" />
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No projects yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first project to organize your source videos and AI-generated clips.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-brand-600" />
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === project.id ? null : project.id)
                    }
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeMenu === project.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fadeIn">
                      <button
                        onClick={() => openEdit(project)}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {project.description || "No description"}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" />
                  {project.videoCount} videos
                </span>
                <span className="flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5" />
                  {project.clipCount} clips
                </span>
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
                {editProject ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditProject(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  placeholder="e.g., Gaming Highlights"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm resize-none"
                  placeholder="What's this project about?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditProject(null);
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
                    : editProject
                    ? "Update Project"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
