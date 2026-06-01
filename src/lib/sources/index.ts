import { SourceAdapter } from "../types";
import { flippaAdapter } from "./flippa";
import { motionInvestAdapter } from "./motioninvest";

export const adapters: SourceAdapter[] = [
  flippaAdapter,
  motionInvestAdapter,
];

export { flippaAdapter, motionInvestAdapter };
