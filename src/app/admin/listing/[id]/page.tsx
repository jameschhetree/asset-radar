"use client";

import { useState, useEffect, use } from "react";
import LoginGate from "@/components/LoginGate";
import ScoreBar from "@/components/ScoreBar";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Lock,
  XCircle,
  CheckCircle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  name: string;
  url: string;
  source: string;
  askingPrice: number | null;
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  revenueMultiple: number | null;
  profitMultiple: number | null;
  assetType: string;
  niche: string;
  age: string;
  trafficSources: string;
  monthlyVisitors: number | null;
  emailListSize: number | null;
  monetization: string;
  techStack: string;
  ownerWorkload: string;
  reasonForSale: string;
  sellerClaims: string;
  evidenceAvailable: string;
  riskNotes: string;
  upsideNotes: string;
  withinBudget: boolean;
  status: string;
  score: number;
  scoreBreakdown: Record<string, number> | null;
  dealMemo: string | null;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
}

const STATUS_ACTIONS = [
  { status: "NeedsReview", label: "Review", icon: <Eye size={12} /> },
  { status: "Watchlist", label: "Watch", icon: <Eye size={12} /> },
  { status: "PrivateTarget", label: "Private", icon: <Lock size={12} /> },
  { status: "NewsletterCandidate", label: "Newsletter", icon: <BookOpen size={12} /> },
  { status: "Acquired", label: "Acquired", icon: <CheckCircle size={12} /> },
  { status: "Passed", label: "Pass", icon: <XCircle size={12} /> },
];

const SCORE_LABELS: Record<string, string> = {
  valuationQuality: "Valuation",
  nicheQuality: "Niche",
  trafficQuality: "Traffic",
  revenueQuality: "Revenue",
  monetizationUpside: "Monetization",
  aiImprovementPotential: "AI Potential",
  workloadSimplicity: "Workload",
  resalePotential: "Resale",
  riskLevel: "Risk (low=bad)",
  scamRisk: "Legitimacy",
};

export default function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generatingMemo, setGeneratingMemo] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!listing) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setListing(updated);
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoginGate>
        <div className="min-h-screen bg-ar-black flex items-center justify-center">
          <Loader2 size={24} className="text-ar-green animate-spin" />
        </div>
      </LoginGate>
    );
  }

  if (!listing) {
    return (
      <LoginGate>
        <div className="min-h-screen bg-ar-black flex items-center justify-center">
          <p className="text-text-dim">Listing not found</p>
        </div>
      </LoginGate>
    );
  }

  const paybackMonths =
    listing.monthlyProfit && listing.monthlyProfit > 0 && listing.askingPrice
      ? Math.round(listing.askingPrice / listing.monthlyProfit)
      : null;

  return (
    <LoginGate>
      <div className="min-h-screen bg-ar-black">
        {/* Top bar */}
        <header className="border-b border-ar-black-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="text-text-secondary hover:text-cream transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1
                className="text-xl text-cream"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {listing.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-text-dim text-[10px] tracking-wider uppercase">
                  {listing.source}
                </span>
                {listing.withinBudget && (
                  <>
                    <span className="text-ar-black-border text-[10px]">|</span>
                    <span className="text-ar-green text-[10px] tracking-wider uppercase">
                      In Budget
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-text-secondary hover:text-cream text-xs transition-colors"
          >
            View Listing <ExternalLink size={12} />
          </a>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-6">
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action.status}
                onClick={() => updateStatus(action.status)}
                disabled={updating || listing.status === action.status}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] tracking-wider uppercase border transition-colors ${
                  listing.status === action.status
                    ? "bg-ar-green/20 border-ar-green text-ar-green"
                    : "border-ar-black-border text-text-secondary hover:text-cream hover:border-ar-green-dim"
                } disabled:opacity-50`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Key metrics */}
            <div className="lg:col-span-1 space-y-4">
              {/* Score */}
              <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-ar-gold mb-3">
                  Overall Score
                </p>
                <div className="text-center mb-4">
                  <span
                    className={`text-4xl font-mono ${
                      listing.score >= 70
                        ? "text-ar-green"
                        : listing.score >= 50
                          ? "text-ar-gold"
                          : "text-ar-red-light"
                    }`}
                  >
                    {listing.score}
                  </span>
                  <span className="text-text-dim text-sm">/100</span>
                </div>

                {listing.scoreBreakdown && (
                  <div className="space-y-2">
                    {Object.entries(listing.scoreBreakdown).map(
                      ([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-text-dim text-[10px] uppercase tracking-wider">
                              {SCORE_LABELS[key] || key}
                            </span>
                            <span className="text-cream text-[10px] font-mono">
                              {value as number}/10
                            </span>
                          </div>
                          <ScoreBar
                            score={(value as number) * 10}
                            size="sm"
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Financials */}
              <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-ar-gold mb-3">
                  Deal Math
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "Asking Price",
                      value: listing.askingPrice
                        ? "$" + listing.askingPrice.toLocaleString()
                        : "--",
                    },
                    {
                      label: "Monthly Revenue",
                      value: listing.monthlyRevenue
                        ? "$" + listing.monthlyRevenue.toLocaleString()
                        : "--",
                    },
                    {
                      label: "Monthly Profit",
                      value: listing.monthlyProfit
                        ? "$" + listing.monthlyProfit.toLocaleString()
                        : "--",
                    },
                    {
                      label: "Payback Period",
                      value: paybackMonths ? paybackMonths + " months" : "--",
                    },
                    {
                      label: "Revenue Multiple",
                      value: listing.revenueMultiple
                        ? listing.revenueMultiple.toFixed(1) + "x"
                        : "--",
                    },
                    {
                      label: "Profit Multiple",
                      value: listing.profitMultiple
                        ? listing.profitMultiple.toFixed(1) + "x"
                        : "--",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-text-dim text-xs">
                        {row.label}
                      </span>
                      <span className="text-cream text-xs font-mono">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asset details */}
              <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-ar-gold mb-3">
                  Asset Details
                </p>
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Type", value: listing.assetType },
                    { label: "Niche", value: listing.niche },
                    { label: "Age", value: listing.age },
                    { label: "Traffic Sources", value: listing.trafficSources },
                    {
                      label: "Monthly Visitors",
                      value: listing.monthlyVisitors?.toLocaleString(),
                    },
                    { label: "Monetization", value: listing.monetization },
                    { label: "Tech Stack", value: listing.techStack },
                    { label: "Owner Workload", value: listing.ownerWorkload },
                    { label: "Reason for Sale", value: listing.reasonForSale },
                    {
                      label: "Evidence",
                      value: listing.evidenceAvailable,
                    },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <div key={row.label}>
                        <p className="text-text-dim text-[10px] uppercase tracking-wider mb-0.5">
                          {row.label}
                        </p>
                        <p className="text-cream">{row.value}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right column - Deal memo and claims */}
            <div className="lg:col-span-2 space-y-4">
              {/* Seller claims */}
              {listing.sellerClaims && (
                <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-ar-gold mb-3">
                    Seller Claims
                  </p>
                  <p className="text-cream text-sm leading-relaxed">
                    {listing.sellerClaims}
                  </p>
                </div>
              )}

              {/* Deal memo */}
              <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-ar-gold">
                    Deal Memo
                  </p>
                  <button
                    onClick={async () => {
                      setGeneratingMemo(true);
                      try {
                        const res = await fetch(`/api/listings/${listing.id}/memo`, { method: "POST" });
                        const data = await res.json();
                        if (data.success && data.memo) {
                          setListing({ ...listing, dealMemo: data.memo });
                        }
                      } catch (err) {
                        console.error("Memo generation failed:", err);
                      } finally {
                        setGeneratingMemo(false);
                      }
                    }}
                    disabled={generatingMemo}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] tracking-wider uppercase border border-ar-black-border text-text-secondary hover:text-cream hover:border-ar-green-dim transition-colors disabled:opacity-50"
                  >
                    {generatingMemo ? (
                      <><Loader2 size={10} className="animate-spin" /> Generating...</>
                    ) : (
                      <>{listing.dealMemo ? "Regenerate" : "Generate"} Memo</>
                    )}
                  </button>
                </div>
                {listing.dealMemo ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div
                      className="text-cream text-sm leading-relaxed whitespace-pre-wrap font-mono"
                      style={{ fontSize: "12px", lineHeight: "1.7" }}
                    >
                      {listing.dealMemo}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-dim text-sm">
                      No deal memo generated
                    </p>
                    <p className="text-text-dim text-xs mt-1">
                      Click "Generate Memo" above
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-ar-black-card border border-ar-black-border rounded-lg p-5">
                <div className="flex items-center gap-6 text-[10px] tracking-wider uppercase text-text-dim">
                  <span>
                    First Seen:{" "}
                    {new Date(listing.firstSeen).toLocaleDateString()}
                  </span>
                  <span>
                    Last Seen:{" "}
                    {new Date(listing.lastSeen).toLocaleDateString()}
                  </span>
                  <span>
                    Imported:{" "}
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoginGate>
  );
}
