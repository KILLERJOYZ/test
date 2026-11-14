export type SupportedLocale = "vi";

export interface AdviserStrings {
  brandTitle: string;
  brandSubtitle: string;
  heroTitle: string;
  refreshAction: string;
  refreshBusy: string;
  bootLoading: string;
  bootFailedNotice: string;
  exportRawData: string;
  restoreInitialData: string;
  acknowledge: string;
  close: string;
  closeSheetBackdrop: string;
  adjustNeeds: string;
  checkExternalQuote: string;
  needsModalTitle: string;
  quoteModalTitle: string;
  historyModalTitle: string;
  deleteConfirmTitle: string;
  deleteConfirmAction: string;
  deleteWorking: string;
  cancel: string;
  saveDecision: string;
  saveComparisonDecision: string;
  reportDataDiscrepancy: string;
  openHistorySnapshot: string;
  deleteSavedSnapshot: string;
  compareAction: string;
  removeCompareAction: string;
  viewConfigAction: string;
  searchPlaceholder: string;
  savedSearchPlaceholder: string;
  allSources: string;
  sortByFit: string;
  sortByPrice: string;
  sortByTotal: string;
  sortByName: string;
  showExcluded: string;
  hideExcluded: string;
  unknownValue: string;
  buyNow: string;
  buyingOptionsTitle: string;
  visitRetailer: string;
  copilotAction: string;
  loadMore: string;
  tabs: {
    advisor: string;
    explore: string;
    compare: string;
    saved: string;
    settings: string;
  };
}

export const VI: AdviserStrings = {
  brandTitle: "lựa.",
  brandSubtitle: "Thiết bị thật. Quyết định có căn cứ.",
  heroTitle: "Máy nào hợp việc của bạn?",
  refreshAction: "Cập nhật",
  refreshBusy: "Đang kiểm tra…",
  bootLoading: "Đang khôi phục quyết định…",
  bootFailedNotice:
    "Không đọc được dữ liệu đã lưu. Tạm khóa ghi để bảo vệ dữ liệu.",
  exportRawData: "Xuất dữ liệu gốc",
  restoreInitialData: "Khôi phục bằng dữ liệu ban đầu",
  acknowledge: "Đã hiểu",
  close: "Đóng",
  closeSheetBackdrop: "Đóng bảng chi tiết",
  adjustNeeds: "Điều chỉnh nhu cầu",
  checkExternalQuote: "Kiểm tra báo giá ngoài",
  needsModalTitle: "Nhu cầu của bạn",
  quoteModalTitle: "Kiểm tra báo giá ngoài",
  historyModalTitle: "Quyết định lịch sử",
  deleteConfirmTitle: "Xác nhận xóa",
  deleteConfirmAction: "Xác nhận xóa",
  deleteWorking: "Đang xóa…",
  cancel: "Hủy",
  saveDecision: "Lưu quyết định này",
  saveComparisonDecision: "Lưu quyết định so sánh",
  reportDataDiscrepancy: "Báo thông tin sai",
  openHistorySnapshot: "Mở bản lịch sử",
  deleteSavedSnapshot: "Xóa bản lưu",
  compareAction: "So sánh",
  removeCompareAction: "Bỏ so sánh",
  viewConfigAction: "Xem cấu hình",
  searchPlaceholder: "Tìm tên máy, CPU, RAM hoặc nhà bán",
  savedSearchPlaceholder: "Tìm bản lưu theo tên nhóm, tên máy, nguồn hoặc ngày",
  allSources: "Mọi nguồn",
  sortByFit: "Sắp xếp: độ phù hợp",
  sortByPrice: "Sắp xếp: giá niêm yết",
  sortByTotal: "Sắp xếp: tổng chi phí",
  sortByName: "Sắp xếp: tên",
  showExcluded: "Hiện máy không đạt",
  hideExcluded: "Ẩn máy không đạt",
  unknownValue: "Chưa rõ",
  buyNow: "Mua ngay",
  buyingOptionsTitle: "Tùy chọn cấu hình & nơi bán",
  visitRetailer: "Đến cửa hàng",
  copilotAction: "Tư vấn tự do bằng AI",
  loadMore: "Xem thêm cấu hình",
  tabs: {
    advisor: "Tư vấn",
    explore: "Khám phá",
    compare: "So sánh",
    saved: "Đã lưu",
    settings: "Cài đặt",
  },
};

const DICTIONARIES: Record<SupportedLocale, AdviserStrings> = {
  vi: VI,
};

export function getStrings(locale: SupportedLocale = "vi"): AdviserStrings {
  return DICTIONARIES[locale] ?? VI;
}

export function formatVndDigits(raw: string): string {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseVndDigits(formatted: string): string {
  return String(formatted ?? "").replace(/\D/g, "");
}

export function formatVnd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount) || amount < 0) {
    return VI.unknownValue;
  }
  return formatVndDigits(String(Math.round(amount))) + " ₫";
}

