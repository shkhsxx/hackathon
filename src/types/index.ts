// ─── Database Row Types (maps 1:1 to Supabase tables) ───────────────────────

export type BodyShape =
  | "triangle"
  | "inverted_triangle"
  | "rectangle"
  | "hourglass"
  | "oval";

export type ShoulderWidth = "narrow" | "medium" | "wide";
export type WaistLine = "narrow" | "medium" | "wide";
export type BodyBalance = "upper-heavy" | "balanced" | "lower-heavy";
export type Category = "top" | "bottom" | "outer" | "accessory";

// ─── Supabase DB Models ──────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  created_at: string;
}

export interface DbAnalysis {
  id: string;
  user_id: string;
  image_url: string;
  body_shape: BodyShape;
  shoulder_width: ShoulderWidth;
  waist_line: WaistLine;
  body_balance: BodyBalance;
  confidence: number;
  created_at: string;
}

export interface DbRecommendation {
  id: string;
  analysis_id: string;
  recommendation_json: RecommendationPayload;
  explanation: string;
  created_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  category: Category;
  fit_type: string;
  image_url: string;
  price: number;
}

export interface DbWishlist {
  id: string;
  user_id: string;
  product_id: string;
}

// ─── AI Payload Types ────────────────────────────────────────────────────────

export interface BodyAnalysisResult {
  bodyShape: BodyShape;
  shoulderWidth: ShoulderWidth;
  waistLine: WaistLine;
  bodyBalance: BodyBalance;
  confidence: number;
}

export interface RecommendationPayload {
  recommendedFits: string[];
  tops: string[];
  bottoms: string[];
  outers: string[];
  avoid: string[];
}

// ─── API Request/Response Types ──────────────────────────────────────────────

// POST /api/upload
export interface UploadRequest {
  file: File;
}

export interface UploadResponse {
  imageUrl: string;
  path: string;
}

// POST /api/analyze
export interface AnalyzeRequest {
  imageUrl: string;
  userId: string;
}

export interface AnalyzeResponse {
  analysisId: string;
  bodyShape: BodyShape;
  shoulderWidth: ShoulderWidth;
  waistLine: WaistLine;
  bodyBalance: BodyBalance;
  confidence: number;
}

// POST /api/recommend
export interface RecommendRequest {
  analysisId: string;
}

export interface RecommendResponse {
  recommendationId: string;
  recommendation: RecommendationPayload;
  explanation: string;
  products: DbProduct[];
}

// GET /api/products
export interface ProductsQuery {
  bodyShape?: BodyShape;
  category?: Category;
  limit?: number;
  offset?: number;
}

export interface ProductsResponse {
  products: DbProduct[];
  total: number;
}

// GET /api/history
export interface HistoryItem {
  analysis: DbAnalysis;
  recommendation: DbRecommendation | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
}

// ─── UI State Types ──────────────────────────────────────────────────────────

export type AnalysisStep = "idle" | "uploading" | "analyzing" | "done" | "error";

export interface AnalysisState {
  step: AnalysisStep;
  imageUrl?: string;
  analysisId?: string;
  recommendationId?: string;
  error?: string;
}

// ─── Body Shape Meta (for UI display) ───────────────────────────────────────

export const BODY_SHAPE_META: Record<
  BodyShape,
  { label: string; description: string; emoji: string; color: string }
> = {
  triangle: {
    label: "삼각형 체형",
    description: "어깨보다 하체가 넓은 체형",
    emoji: "▽",
    color: "bg-orange-100 text-orange-700",
  },
  inverted_triangle: {
    label: "역삼각형 체형",
    description: "어깨가 넓고 하체가 좁은 체형",
    emoji: "△",
    color: "bg-blue-100 text-blue-700",
  },
  rectangle: {
    label: "직사각형 체형",
    description: "어깨·허리·힙의 너비가 비슷한 체형",
    emoji: "▭",
    color: "bg-green-100 text-green-700",
  },
  hourglass: {
    label: "모래시계 체형",
    description: "어깨와 힙이 넓고 허리가 잘록한 체형",
    emoji: "⧗",
    color: "bg-purple-100 text-purple-700",
  },
  oval: {
    label: "타원형 체형",
    description: "복부 쪽이 넓고 둥근 체형",
    emoji: "○",
    color: "bg-rose-100 text-rose-700",
  },
};
