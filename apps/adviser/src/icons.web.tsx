import {
  Compass,
  ArrowLeftRight,
  Bookmark,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Code2,
  BookOpen,
  PenTool,
  Layers,
  Feather,
  Wallet,
  Cpu,
  ShieldCheck,
  Info,
  Settings2,
  RotateCcw,
  Send,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Download,
  AlertCircle,
  MapPin,
  LayoutGrid,
} from "lucide-react";
const map: Record<string, typeof Compass> = {
  compass: Compass,
  compare: ArrowLeftRight,
  bookmark: Bookmark,
  up: ArrowUpRight,
  right: ArrowRight,
  left: ArrowLeft,
  search: Search,
  filter: SlidersHorizontal,
  plus: Plus,
  check: Check,
  x: X,
  down: ChevronDown,
  chevron: ChevronRight,
  code: Code2,
  book: BookOpen,
  pen: PenTool,
  layers: Layers,
  feather: Feather,
  wallet: Wallet,
  cpu: Cpu,
  shield: ShieldCheck,
  info: Info,
  settings: Settings2,
  reset: RotateCcw,
  send: Send,
  circlecheck: CheckCircle2,
  external: ExternalLink,
  more: MoreHorizontal,
  trash: Trash2,
  download: Download,
  alert: AlertCircle,
  pin: MapPin,
  grid: LayoutGrid,
};
export function Icon({
  name,
  size = 20,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const I = map[name] || Compass;
  return (
    <I
      size={size}
      color={color}
      strokeWidth={1.65}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    />
  );
}
