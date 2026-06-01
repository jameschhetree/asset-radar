"use client";

import { useState, useEffect, useCallback } from "react";
import LoginGate from "@/components/LoginGate";
import ListingCard from "@/components/ListingCard";
import {
  Radar,
  TrendingUp,
  AlertTriangle,
  Eye,
  Lock,
  XCircle,
  BookOpen,
  CheckCircle,
  Activity,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";

interface Listing {
  id: string;
  name: string;
  source: string;
  url: string;
  askingPrice: number | null;
  monthlyProfit: number | null;
  monthlyRevenue: number | null;
  score: number;
  status: string;
  niche: string;
  assetType: string;
  monetization: string;
  withinBudget: boolean;
  createdAt: string;
}

interface SourceHealth {
  source: string;
  lastSuccess: string | null;
  lastFailure: string | null;
  consecutiveFails: number;
  isPaused: boolean;
}

type ViewKey =
  | "new"
  | "top"
  | "review"
  | "watchlist"
  | "private"
  | "rejected"
  | "newsletter"
  | "acquired"
  | "health"
  | "digest";

const VIEWS: { key: ViewKey; label: string; icon: React.ReactNode }[] = [
  { key: "new", label: "New Deals", icon: <Radar size={14} /> },
  { key: "top", label: "Top Scores", icon: <TrendingUp size={14} /> },
  { key: "review", label: "Needs Review", icon: <AlertTriangle size={14} /> },
  { key: "watchlist", label: "Watchlist", icon: <Eye size={14} /> },
  { key: "private", label: "Private Targets", icon: <Lock size={14} /> },
  { key: "rejected", label: "Auto-Rejected", icon: <XCircle size={14} /> },
  { key: "newsletter", label: "Newsletter", icon: <BookOpen size={14} /> },
  { key: "acquired", label: "Acquired", icon: <CheckCircle size={14} /> },
  { key: "health", label: "Source Health", icon: <Activity size={14} /> },
  { key: "digest", label: "Digest Archive", icon: <FileText size={14} /> },
];

const VIEW_TO_STATUS: Record<string, string | null> = {
  new: null, // all live listings sorted by createdAt desc (handled below)
  top: null, // all, sorted by score
  review: "NeedsReview",
  watchlist: "Watchlist",
  private: "PrivateTarget",
  rejected: "AutoRejected",
  newsletter: "NewsletterCandidate",
  acquired: "Acquired",
};

const VIEW_EXCLUDE_STATUS: Record<string, string[]> = {
  new: ["AutoRejected", "Acquired"],
};

export default function AdminDashboard() {
  const [view, setView] = useState<ViewKey>("new");
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceHealthData, setSourceHealthData] = useState<SourceHealth[]>([]);
  const [digestData, setDigestData] = useState<
    Array<{ id: string; content: string; listings: number; sentAt: string }>
  >([]);

  const fetchListings = useCallback(async () => {
    if (view === "health" || view === "digest") return;

    setLoading(true);
    try {
      const status = VIEW_TO_STATUS[view];
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (view === "top") {
        params.set("sort", "score");
        params.set("order", "desc");
      }
      params.set("limit", "100");

      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      let rows = data.listings || [];
      const exclude = VIEW_EXCLUDE_STATUS[view];
      if (exclude && exclude.length > 0) {
        rows = rows.filter((r: Listing) => !exclude.includes(r.status));
      }
      setListings(rows);
      setTotal(exclude ? rows.length : data.total || 0);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const runIngestion = async () => {
    setIngesting(true);
    try {
      const res = await fetch("/api/cron/ingest");
      const data = await res.json();
      if (data.success) {
        fetchListings();
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIngesting(false);
    }
  };

  const filteredListings = searchTerm
    ? listings.filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : listings;

  // Stats
  const totalListings = listings.length;
  const avgScore =
    totalListings > 0
      ? Math.round(listings.reduce((s, l) => s + l.score, 0) / totalListings)
      : 0;
  const inBudget = listings.filter((l) => l.withinBudget).length;

  return (
    <LoginGate>
      <div className="min-h-screen bg-ar-black flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-ar-black-border bg-ar-black-light flex-shrink-0 flex flex-col">
          <div className="p-5 border-b border-ar-black-border">
            <p className="text-[9px] tracking-[0.3em] uppercase text-ar-gold mb-1">
              Private Intelligence
            </p>
            <h1
              className="text-xl text-cream tracking-wide"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Asset Radar
            </h1>
          </div>

          <nav className="flex-1 py-3">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-wide transition-colors ${
                  view === v.key
                    ? "text-cream bg-ar-green/10 border-l-2 border-ar-green"
                    : "text-text-secondary hover:text-cream hover:bg-ar-black-card border-l-2 border-transparent"
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </nav>

          {/* Run Scan button */}
          <div className="p-4 border-t border-ar-black-border">
            <button
              onClick={runIngestion}
              disabled={ingesting}
              className="w-full flex items-center justify-center gap-2 bg-ar-green hover:bg-ar-green-light text-cream py-2.5 rounded text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={ingesting ? "animate-spin" : ""}
              />
              {ingesting ? "Scanning..." : "Run Scan"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="border-b border-ar-black-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2
                className="text-lg text-cream"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {VIEWS.find((v) => v.key === view)?.label}
              </h2>
              <p className="text-text-dim text-[10px] tracking-wider uppercase mt-0.5">
                {total} listings
              </p>
            </div>

            {view !== "health" && view !== "digest" && (
              <div className="flex items-center gap-4">
                {/* Stats pills */}
                <div className="flex items-center gap-3 text-[10px] tracking-wider uppercase">
                  <span className="text-text-dim">
                    Avg Score:{" "}
                    <span className="text-cream font-mono">{avgScore}</span>
                  </span>
                  <span className="text-ar-black-border">|</span>
                  <span className="text-text-dim">
                    In Budget:{" "}
                    <span className="text-ar-green font-mono">{inBudget}</span>
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="bg-ar-black-card border border-ar-black-border rounded pl-8 pr-3 py-2 text-xs text-cream placeholder:text-text-dim focus:outline-none focus:border-ar-green transition-colors w-48"
                  />
                </div>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-text-dim text-sm">Loading...</div>
              </div>
            ) : view === "health" ? (
              <SourceHealthView data={sourceHealthData} />
            ) : view === "digest" ? (
              <DigestArchiveView data={digestData} />
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Radar size={32} className="text-ar-black-border mb-3" />
                <p className="text-text-dim text-sm">No listings found</p>
                <p className="text-text-dim text-xs mt-1">
                  Run a scan to import new deals
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </LoginGate>
  );
}

function SourceHealthView({ data }: { data: SourceHealth[] }) {
  const [healthData, setHealthData] = useState<SourceHealth[]>(data);

  useEffect(() => {
    fetch("/api/listings?limit=0")
      .then(() =>
        fetch("/api/source-health")
          .then((r) => r.json())
          .then((d) => setHealthData(d.sources || []))
          .catch(() => {})
      )
      .catch(() => {});
  }, []);

  if (healthData.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity size={32} className="text-ar-black-border mx-auto mb-3" />
        <p className="text-text-dim text-sm">No source data yet</p>
        <p className="text-text-dim text-xs mt-1">Run your first scan</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {healthData.map((sh) => (
        <div
          key={sh.source}
          className="bg-ar-black-card border border-ar-black-border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-cream text-sm font-medium">{sh.source}</h3>
            <p className="text-text-dim text-xs mt-1">
              Last success:{" "}
              {sh.lastSuccess
                ? new Date(sh.lastSuccess).toLocaleString()
                : "Never"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sh.isPaused ? (
              <span className="text-ar-red-light text-[10px] tracking-wider uppercase">
                Paused
              </span>
            ) : sh.consecutiveFails > 0 ? (
              <span className="text-ar-gold text-[10px] tracking-wider uppercase">
                {sh.consecutiveFails} failures
              </span>
            ) : (
              <span className="text-ar-green text-[10px] tracking-wider uppercase">
                Healthy
              </span>
            )}
            <div
              className={`w-2 h-2 rounded-full ${
                sh.isPaused
                  ? "bg-ar-red"
                  : sh.consecutiveFails > 0
                    ? "bg-ar-gold"
                    : "bg-ar-green"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DigestArchiveView({
  data,
}: {
  data: Array<{
    id: string;
    content: string;
    listings: number;
    sentAt: string;
  }>;
}) {
  const [digests, setDigests] = useState(data);

  useEffect(() => {
    fetch("/api/digest-archive")
      .then((r) => r.json())
      .then((d) => setDigests(d.digests || []))
      .catch(() => {});
  }, []);

  if (digests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={32} className="text-ar-black-border mx-auto mb-3" />
        <p className="text-text-dim text-sm">No digests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {digests.map((d) => (
        <div
          key={d.id}
          className="bg-ar-black-card border border-ar-black-border rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-dim text-[10px] tracking-wider uppercase">
              {new Date(d.sentAt).toLocaleString()}
            </p>
            <span className="text-text-dim text-[10px]">
              {d.listings} listings
            </span>
          </div>
          <pre className="text-cream text-xs whitespace-pre-wrap font-mono leading-relaxed">
            {d.content}
          </pre>
        </div>
      ))}
    </div>
  );
}
