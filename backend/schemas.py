from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class RequirementsModel(BaseModel):
    budget: int = Field(default=25000000, ge=1, le=1000000000)
    minRam: int = Field(default=0, ge=0, le=1024)
    minStorage: int = Field(default=0, ge=0, le=100000)
    os: str = Field(default="", max_length=100)
    tasks: List[str] = Field(default_factory=list, max_length=5)

    @field_validator("tasks")
    @classmethod
    def validate_tasks(cls, v: List[str]) -> List[str]:
        if len(v) > 5:
            raise ValueError("Tối đa 5 tác vụ.")
        if len(set(v)) != len(v):
            raise ValueError("Các tác vụ không được trùng nhau.")
        for item in v:
            if not isinstance(item, str) or len(item) == 0 or len(item) > 100:
                raise ValueError("Tác vụ phải là chuỗi từ 1 đến 100 ký tự.")
        return v


class ListingModel(BaseModel):
    id: str
    name: str
    source: str
    url: str
    condition: Literal["new", "used", "unknown"] = "new"
    observedAt: str
    ram: Optional[int] = None
    storage: Optional[int] = None
    cpu: Optional[str] = None
    os: Optional[str] = None
    screen: Optional[str] = None
    weight: Optional[str] = None
    advertisedPrice: Optional[int] = None
    shipping: Optional[int] = None
    fees: Optional[int] = None
    stock: Literal["unknown"] = "unknown"
    identity: Literal["unreviewed"] = "unreviewed"
    rawHash: str

    # Các trường mở rộng cho giao diện phong phú
    brand: Optional[str] = None
    model: Optional[str] = None
    gpu: Optional[str] = None
    battery: Optional[str] = None
    thumbnail: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)
    media: Optional[Dict[str, Any]] = None
    priceOriginal: Optional[int] = None
    discountPercent: Optional[float] = None
    installment: Optional[str] = None
    ratingAverage: Optional[float] = None
    ratingCount: Optional[int] = None
    availability: Optional[str] = "in_stock"


class CatalogModel(BaseModel):
    schemaVersion: int = 1
    revision: str
    importedAt: str
    listings: List[ListingModel]


class CatalogResponse(BaseModel):
    catalog: CatalogModel
    checkedAt: str
    sourceState: str = "repository_snapshot"


class HealthResponse(BaseModel):
    status: str = "ok"
    db: str = "connected"
    laptopCount: int
    ai: str = "rules_fallback"
    refresh: str = "postgresql"
    checkedAt: str


class AdviceContextModel(BaseModel):
    catalogRevision: str
    decisionRevision: int
    focusId: str
    requestId: str


class AdviceRequest(BaseModel):
    context: AdviceContextModel
    requirements: RequirementsModel
    message: str = Field(..., max_length=2000)


class AdviceResponse(BaseModel):
    context: AdviceContextModel
    text: str
    proposal: Optional[RequirementsModel] = None
    mode: str = "provider"


class CompareRequest(BaseModel):
    ids: List[str] = Field(..., min_length=1, max_length=4)
    requirements: RequirementsModel


class CompareResponse(BaseModel):
    items: List[ListingModel]
    assessments: List[Dict[str, Any]]
    summary: str


class ReportRequest(BaseModel):
    listingId: str = Field(..., min_length=1, max_length=200)
    category: Literal["price", "spec", "stock", "link"]
    note: str = Field(default="", max_length=500)


class ReportRecord(BaseModel):
    id: str
    listingId: str
    category: Literal["price", "spec", "stock", "link"]
    note: str
    status: str = "open"
    createdAt: str


class ReportResponse(BaseModel):
    report: ReportRecord


# --- Phase 4: Hybrid AI Agent Schemas (STT 2.0, 3.0, 4.0, 23.0) ---


class NanoDraftModel(BaseModel):
    budget: Optional[int] = Field(default=None, ge=1, le=1000000000)
    minRam: Optional[int] = Field(default=None, ge=0, le=1024)
    minStorage: Optional[int] = Field(default=None, ge=0, le=100000)
    os: Optional[str] = Field(default=None, max_length=100)
    tasks: Optional[List[str]] = Field(default=None, max_length=5)
    maxWeightKg: Optional[float] = Field(default=None, gt=0, le=20.0)


class CopilotRequest(BaseModel):
    sessionId: str = Field(default="default", min_length=1, max_length=120)
    message: str = Field(..., min_length=1, max_length=2000)
    requirements: RequirementsModel = Field(default_factory=RequirementsModel)
    nanoDraft: Optional[NanoDraftModel] = None
    preferOffline: bool = False


class CopilotShortlistItem(BaseModel):
    listing: ListingModel
    assessment: Dict[str, Any]
    tradeoffSummary: str
    allowedFacts: Dict[str, str]


class CopilotResponse(BaseModel):
    sessionId: str
    catalogRevision: str
    mode: Literal["online_langgraph_chatgpt", "offline_rules_nano"]
    assistantReply: str
    clarifyingQuestions: List[str] = Field(default_factory=list)
    proposedRequirements: Optional[RequirementsModel] = None
    requiresConfirmation: bool = True
    extractedConstraints: Dict[str, Any] = Field(default_factory=dict)
    shortlist: List[CopilotShortlistItem] = Field(default_factory=list)


class ProactiveRequest(BaseModel):
    requirements: RequirementsModel = Field(default_factory=RequirementsModel)
    currentListingId: Optional[str] = Field(default=None, max_length=200)
    recentListingIds: List[str] = Field(default_factory=list, max_length=30)
    compareIds: List[str] = Field(default_factory=list, max_length=4)
    preferOffline: bool = False


class ProactiveResponse(BaseModel):
    triggered: bool
    signalType: Optional[Literal["blind_spot", "indecision_compare", "better_value_alternative"]] = None
    headline: str = ""
    detail: str = ""
    citedListingIds: List[str] = Field(default_factory=list)
    suggestedAction: Optional[Literal["compare", "open_listing", "adjust_needs"]] = None
    mode: Literal["online_langgraph_chatgpt", "offline_rules_nano"]


class ReviewSynthesizeRequest(BaseModel):
    listingId: str = Field(..., min_length=1, max_length=200)
    reviewText: str = Field(..., min_length=1, max_length=20000)
    sourceName: str = Field(default="Bài đánh giá độc lập", min_length=1, max_length=200)
    sourceUrl: str = Field(default="https://example.com/review", min_length=1, max_length=1000)
    publish: bool = True
    preferOffline: bool = False


class ReviewSynthesisResponse(BaseModel):
    listingId: str
    performance: str
    thermals_noise: str
    battery_real: str
    quirks_cons: str
    skuMatched: bool
    sourceName: str
    sourceUrl: str
    checkedAt: str
    status: Literal["published", "staged_review", "rejected_sku_mismatch"]
    synthesisBasis: str = "external_review"
    conflictReason: Optional[str] = None
    mode: Literal["online_langgraph_chatgpt", "offline_rules_nano"] = "offline_rules_nano"


class ScrapedListingInput(BaseModel):
    id: str = Field(..., min_length=1, max_length=200)
    name: str = Field(..., min_length=1, max_length=500)
    source: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., min_length=1, max_length=1000)
    advertisedPrice: Optional[int] = None
    ram: Optional[int] = None
    storage: Optional[int] = None
    cpu: Optional[str] = None
    gpu: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    os: Optional[str] = None
    screen: Optional[str] = None
    condition: str = "new"


class EntityQaRequest(BaseModel):
    listings: List[ScrapedListingInput] = Field(..., min_length=1, max_length=200)
    preferOffline: bool = False


class EntityQaItemResult(BaseModel):
    id: str
    name: str
    source: str
    url: str
    familyKey: str
    variantSku: str
    flags: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    siblingMedianPrice: Optional[int] = None
    deviationRatio: Optional[float] = None


class EntityQaResponse(BaseModel):
    readyForBatchApprove: List[EntityQaItemResult] = Field(default_factory=list)
    flaggedForReview: List[EntityQaItemResult] = Field(default_factory=list)
    mode: Literal["online_langgraph_chatgpt", "offline_rules_nano"]
