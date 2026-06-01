export interface NormalizedListing {
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
  sourceHash: string;
}

export interface ScoreResult {
  totalScore: number;
  breakdown: {
    valuationQuality: number;
    nicheQuality: number;
    trafficQuality: number;
    revenueQuality: number;
    monetizationUpside: number;
    aiImprovementPotential: number;
    workloadSimplicity: number;
    resalePotential: number;
    riskLevel: number;
    scamRisk: number;
  };
  autoRejectReasons: string[];
  shouldAutoReject: boolean;
}

export interface SourceAdapter {
  name: string;
  fetch(): Promise<NormalizedListing[]>;
}
