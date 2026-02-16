"use client";

import { useState, useEffect, useCallback } from "react";

interface Application {
  id: number;
  full_name: string;
  work_email: string;
  agency_name: string;
  website: string | null;
  active_clients_range: string;
  role: string | null;
  primary_services: string;
  biggest_challenge: string;
  qualified_status: string;
  pipeline_stage: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  submitted_at: string;
}

interface Stats {
  total: number;
  qualified: number;
  disqualified: number;
  review: number;
}

const STAGE_OPTIONS = ["NEW", "CONTACTED", "ONBOARDING", "ACTIVE", "DECLINED"];
const STATUS_COLORS: Record<string, string> = {
  qualified: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  disqualified: "bg-red-500/10 text-red-400 border-red-500/20",
  review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};
const STAGE_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400",
  CONTACTED: "bg-purple-500/10 text-purple-400",
  ONBOARDING: "bg-emerald-500/10 text-emerald-400",
  ACTIVE: "bg-green-500/10 text-green-400",
  DECLINED: "bg-zinc-500/10 text-zinc-400",
};

export default function SubmissionsDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterSource) params.set("source", filterSource);
    if (filterCampaign) params.set("campaign", filterCampaign);

    try {
      const res = await fetch(`/api/beta/submissions?${params}`);
      const data = await res.json();
      if (data.ok) {
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
    setLoading(false);
  }, [filterStatus, filterSource, filterCampaign]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateStage(id: number, stage: string) {
    try {
      await fetch("/api/beta/submissions/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pipeline_stage: stage }),
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, pipeline_stage: stage } : a))
      );
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-[#e8e8ed]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Beta Submissions
          </h1>
          <p className="mt-2 text-sm text-[#8888a0]">
            GEO Monitor — Internal Pipeline Dashboard
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} color="text-white" />
            <StatCard label="Qualified" value={stats.qualified} color="text-emerald-400" />
            <StatCard label="Disqualified" value={stats.disqualified} color="text-red-400" />
            <StatCard label="Review" value={stats.review} color="text-yellow-400" />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#1a1a2e] bg-[#0c0c12] px-4 py-2 text-sm text-[#e8e8ed] outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
            <option value="review">Review</option>
          </select>
          <input
            type="text"
            placeholder="Filter by source..."
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-lg border border-[#1a1a2e] bg-[#0c0c12] px-4 py-2 text-sm text-[#e8e8ed] outline-none placeholder:text-[#55556a] focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Filter by campaign..."
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="rounded-lg border border-[#1a1a2e] bg-[#0c0c12] px-4 py-2 text-sm text-[#e8e8ed] outline-none placeholder:text-[#55556a] focus:border-emerald-500"
          />
          <button
            onClick={fetchData}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center text-[#55556a]">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center text-[#55556a]">
            No submissions yet. Applications will appear here once traffic starts.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1a1a2e]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a1a2e] bg-[#0c0c12]">
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Date</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Name</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Agency</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Clients</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Source</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]">Stage</th>
                  <th className="px-4 py-3 font-medium text-[#8888a0]"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-[#1a1a2e] transition hover:bg-[#0c0c12] cursor-pointer"
                    onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  >
                    <td className="px-4 py-3 text-[#8888a0]">
                      {new Date(app.submitted_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.full_name}</div>
                      <div className="text-xs text-[#55556a]">{app.work_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{app.agency_name}</div>
                      {app.website && (
                        <div className="text-xs text-[#55556a]">{app.website}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{app.active_clients_range}</td>
                    <td className="px-4 py-3 text-[#8888a0]">
                      {app.utm_source || "direct"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[app.qualified_status] || ""
                        }`}
                      >
                        {app.qualified_status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.pipeline_stage}
                        onChange={(e) => updateStage(app.id, e.target.value)}
                        className={`rounded-md px-2 py-1 text-xs font-medium outline-none ${
                          STAGE_COLORS[app.pipeline_stage] || "bg-[#1a1a2e] text-[#8888a0]"
                        }`}
                      >
                        {STAGE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#55556a]">
                      <svg
                        className={`h-4 w-4 transition ${expanded === app.id ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Expanded detail rows */}
            {expanded && (() => {
              const app = applications.find((a) => a.id === expanded);
              if (!app) return null;
              return (
                <div className="border-t border-[#1a1a2e] bg-[#0c0c12] px-6 py-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs font-medium text-[#55556a]">Role</div>
                      <div className="mt-1 text-sm">{app.role || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#55556a]">Services</div>
                      <div className="mt-1 text-sm">{app.primary_services}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#55556a]">Campaign</div>
                      <div className="mt-1 text-sm">{app.utm_campaign || "—"}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-medium text-[#55556a]">Biggest challenge</div>
                    <div className="mt-1 text-sm leading-relaxed text-[#8888a0]">
                      {app.biggest_challenge}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-[#1a1a2e] bg-[#10101a] p-5">
      <div className="text-xs font-medium text-[#55556a]">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
