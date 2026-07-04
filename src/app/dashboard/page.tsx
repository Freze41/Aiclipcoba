"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import {
  FolderOpen,
  Film,
  Scissors,
  Eye,
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";

type Stats = {
  projects: number;
  videos: number;
  clips: number;
  totalViews: number;
  totalLikes: number;
  avgAiScore: number;
  publishedClips: number;
  processingClips: number;
  completedClips: number;
};

type ClipRow = {
  id: number;
  title: string;
  aiScore: number | null;
  status: string;
  views: number;
  likes: number;
  isPublished: boolean;
  createdAt: string;
  videoTitle: string | null;
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentClips, setRecentClips] = useState<ClipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/clips").then((r) => r.json()),
    ]).then(([statsData, clipsData]) => {
      setStats(statsData.stats);
      setRecentClips(clipsData.clips?.slice(0, 5) || []);
      setLoading(false);
    });
  }, []);

  const statusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    processing: "bg-amber-100 text-amber-700",
    pending: "bg-slate-100 text-slate-600",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here&apos;s your content overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              label="Total Projects"
              value={stats.projects}
              icon={<FolderOpen className="w-5 h-5" />}
              color="brand"
            />
            <StatCard
              label="Source Videos"
              value={stats.videos}
              icon={<Film className="w-5 h-5" />}
              color="orange"
            />
            <StatCard
              label="AI Clips Generated"
              value={stats.clips}
              icon={<Scissors className="w-5 h-5" />}
              color="green"
              trend={stats.processingClips > 0 ? `${stats.processingClips} processing` : undefined}
            />
            <StatCard
              label="Total Views"
              value={formatNumber(stats.totalViews)}
              icon={<Eye className="w-5 h-5" />}
              color="brand"
              trend={`${formatNumber(stats.totalLikes)} likes`}
            />
          </>
        ) : null}
      </div>

      {/* Secondary Stats */}
      {stats && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Avg AI Score</span>
            </div>
            <p className="text-3xl font-bold">{stats.avgAiScore}/100</p>
            <p className="text-sm opacity-70 mt-1">Across all clips</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Published Clips</span>
            </div>
            <p className="text-3xl font-bold">{stats.publishedClips}</p>
            <p className="text-sm opacity-70 mt-1">
              {stats.clips > 0
                ? `${Math.round((stats.publishedClips / stats.clips) * 100)}% publish rate`
                : "No clips yet"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">Processing</span>
            </div>
            <p className="text-3xl font-bold">{stats.processingClips}</p>
            <p className="text-sm opacity-70 mt-1">Clips being analyzed</p>
          </div>
        </div>
      )}

      {/* Recent Clips Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Clips</h2>
            <p className="text-sm text-slate-500">Latest AI-generated clips</p>
          </div>
          <Link
            href="/dashboard/clips"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded" />
                  <div className="h-3 w-32 skeleton rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentClips.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-600">No clips yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              Upload a video to start generating AI clips
            </p>
            <Link
              href="/dashboard/videos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
            >
              <Film className="w-4 h-4" /> Add Source Video
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase bg-slate-50">
                  <th className="px-6 py-3 text-left font-medium">Clip</th>
                  <th className="px-6 py-3 text-left font-medium">Source</th>
                  <th className="px-6 py-3 text-left font-medium">AI Score</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentClips.map((clip) => (
                  <tr key={clip.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{clip.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 truncate max-w-[200px]">
                        {clip.videoTitle || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                          <span className="text-xs font-bold text-brand-600">
                            {clip.aiScore || "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[clip.status] || statusColors.pending
                        }`}
                      >
                        {clip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Eye className="w-3.5 h-3.5" />
                          {formatNumber(clip.views)}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Heart className="w-3.5 h-3.5" />
                          {formatNumber(clip.likes)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
