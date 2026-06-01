"use client";

import ScoreBar from "./ScoreBar";
import { useRouter } from "next/navigation";

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

const STATUS_COLORS: Record<string, string> = {
  New: "text-cream border-cream/20",
  NeedsReview: "text-ar-gold border-ar-gold/30",
  AutoRejected: "text-ar-red-light border-ar-red/30",
  Watchlist: "text-ar-green-light border-ar-green/30",
  PrivateTarget: "text-ar-gold border-ar-gold/30",
  FollowUp: "text-cream-muted border-cream-muted/30",
  NewsletterCandidate: "text-text-secondary border-text-secondary/30",
  Acquired: "text-ar-green border-ar-green/30",
  Passed: "text-text-dim border-text-dim/30",
};

const STATUS_LABELS: Record<string, string> = {
  New: "NEW",
  NeedsReview: "REVIEW",
  AutoRejected: "REJECTED",
  Watchlist: "WATCH",
  PrivateTarget: "PRIVATE",
  FollowUp: "FOLLOW UP",
  NewsletterCandidate: "NEWSLETTER",
  Acquired: "ACQUIRED",
  Passed: "PASSED",
};

export default function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const paybackMonths =
    listing.monthlyProfit && listing.monthlyProfit > 0 && listing.askingPrice
      ? Math.round(listing.askingPrice / listing.monthlyProfit)
      : null;

  return (
    <div
      onClick={() => router.push(`/admin/listing/${listing.id}`)}
      className="bg-ar-black-card border border-ar-black-border rounded-lg p-5 cursor-pointer card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {listing.withinBudget && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-ar-green flex-shrink-0" />
            )}
            <h3
              className="text-cream text-sm font-medium truncate"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {listing.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-text-dim">
            <span>{listing.source}</span>
            <span className="text-ar-black-border">|</span>
            <span>{listing.niche || listing.assetType}</span>
          </div>
        </div>

        <span
          className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 rounded ${STATUS_COLORS[listing.status] || "text-text-dim border-text-dim/30"}`}
        >
          {STATUS_LABELS[listing.status] || listing.status}
        </span>
      </div>

      {/* Score */}
      <div className="mb-3">
        <ScoreBar score={listing.score} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-text-dim text-[10px] uppercase tracking-wider mb-0.5">
            Price
          </p>
          <p className="text-cream font-mono">
            {listing.askingPrice
              ? "$" + listing.askingPrice.toLocaleString()
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-text-dim text-[10px] uppercase tracking-wider mb-0.5">
            Profit/mo
          </p>
          <p className="text-cream font-mono">
            {listing.monthlyProfit
              ? "$" + listing.monthlyProfit.toLocaleString()
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-text-dim text-[10px] uppercase tracking-wider mb-0.5">
            Payback
          </p>
          <p className="text-cream font-mono">
            {paybackMonths ? paybackMonths + "mo" : "--"}
          </p>
        </div>
      </div>
    </div>
  );
}
