import { IconType } from "react-icons";
import {
  SiGooglescholar,
  SiGoogledocs,
  SiGoogleforms,
  SiGoogledrive,
  SiGooglesheets,
  SiZotero,
  SiLatex,
  SiR,
  SiPython,
  SiJupyter,
  SiObsidian,
  SiNotion,
  SiFigma,
  SiMiro,
  SiCanvas,
  SiYoutube,
} from "react-icons/si";
import {
  FaFlask,
  FaChartBar,
  FaSearch,
  FaUsers,
  FaFilePdf,
  FaMicroscope,
  FaDatabase,
  FaClipboardList,
  FaBrain,
  FaQuoteRight,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaChartPie,
} from "react-icons/fa";
import { MdBiotech, MdCalculate, MdBook } from "react-icons/md";

export interface KTIToolItem {
  id: string;
  label: string;
  color: string;
  icon: IconType;
  category:
    | "Metodologi"
    | "Referensi & Sitasi"
    | "Analisis Data"
    | "Penulisan"
    | "Pengumpulan Data"
    | "Visualisasi"
    | "Kolaborasi";
}

export const KTI_TOOLS: KTIToolItem[] = [
  // ── Metodologi ──────────────────────────────────────────────────────────
  {
    id: "kuantitatif",
    label: "Kuantitatif",
    color: "#3B82F6",
    icon: FaChartBar,
    category: "Metodologi",
  },
  {
    id: "kualitatif",
    label: "Kualitatif",
    color: "#8B5CF6",
    icon: FaUsers,
    category: "Metodologi",
  },
  {
    id: "mixed-method",
    label: "Mixed Method",
    color: "#EC4899",
    icon: FaBrain,
    category: "Metodologi",
  },
  {
    id: "studi-literatur",
    label: "Studi Literatur",
    color: "#F59E0B",
    icon: FaSearch,
    category: "Metodologi",
  },
  {
    id: "eksperimen",
    label: "Eksperimen",
    color: "#10B981",
    icon: FaFlask,
    category: "Metodologi",
  },
  {
    id: "observasi",
    label: "Observasi",
    color: "#06B6D4",
    icon: FaMicroscope,
    category: "Metodologi",
  },
  {
    id: "wawancara",
    label: "Wawancara",
    color: "#F97316",
    icon: FaUsers,
    category: "Metodologi",
  },
  {
    id: "survei",
    label: "Survei",
    color: "#EF4444",
    icon: FaClipboardList,
    category: "Metodologi",
  },
  {
    id: "systematic-review",
    label: "Systematic Review",
    color: "#7C3AED",
    icon: FaSearch,
    category: "Metodologi",
  },
  {
    id: "case-study",
    label: "Studi Kasus",
    color: "#0EA5E9",
    icon: MdBiotech,
    category: "Metodologi",
  },

  // ── Referensi & Sitasi ──────────────────────────────────────────────────
  {
    id: "google-scholar",
    label: "Google Scholar",
    color: "#4285F4",
    icon: SiGooglescholar,
    category: "Referensi & Sitasi",
  },
  {
    id: "zotero",
    label: "Zotero",
    color: "#CC2936",
    icon: SiZotero,
    category: "Referensi & Sitasi",
  },
  {
    id: "mendeley",
    label: "Mendeley",
    color: "#9B1D20",
    icon: FaQuoteRight,
    category: "Referensi & Sitasi",
  },
  {
    id: "endnote",
    label: "EndNote",
    color: "#1D6FA4",
    icon: MdBook,
    category: "Referensi & Sitasi",
  },
  {
    id: "ieee-scopus",
    label: "IEEE / Scopus",
    color: "#00629B",
    icon: FaDatabase,
    category: "Referensi & Sitasi",
  },

  // ── Analisis Data ───────────────────────────────────────────────────────
  {
    id: "spss",
    label: "SPSS",
    color: "#054ADA",
    icon: MdCalculate,
    category: "Analisis Data",
  },
  {
    id: "r-language",
    label: "R Studio",
    color: "#276DC3",
    icon: SiR,
    category: "Analisis Data",
  },
  {
    id: "python-data",
    label: "Python (Pandas/NumPy)",
    color: "#3776AB",
    icon: SiPython,
    category: "Analisis Data",
  },
  {
    id: "excel-analysis",
    label: "Microsoft Excel",
    color: "#217346",
    icon: FaFileExcel,
    category: "Analisis Data",
  },
  {
    id: "google-sheets",
    label: "Google Sheets",
    color: "#34A853",
    icon: SiGooglesheets,
    category: "Analisis Data",
  },
  {
    id: "tableau",
    label: "Tableau",
    color: "#E97627",
    icon: FaChartPie,
    category: "Analisis Data",
  },
  {
    id: "jupyter",
    label: "Jupyter Notebook",
    color: "#F37626",
    icon: SiJupyter,
    category: "Analisis Data",
  },
  {
    id: "smartpls",
    label: "SmartPLS",
    color: "#2E7D32",
    icon: FaChartBar,
    category: "Analisis Data",
  },
  {
    id: "nvivo",
    label: "NVivo",
    color: "#5C4033",
    icon: FaBrain,
    category: "Analisis Data",
  },

  // ── Penulisan ───────────────────────────────────────────────────────────
  {
    id: "ms-word",
    label: "Microsoft Word",
    color: "#2B579A",
    icon: FaFileWord,
    category: "Penulisan",
  },
  {
    id: "latex",
    label: "LaTeX / Overleaf",
    color: "#008080",
    icon: SiLatex,
    category: "Penulisan",
  },
  {
    id: "google-docs",
    label: "Google Docs",
    color: "#4285F4",
    icon: SiGoogledocs,
    category: "Penulisan",
  },
  {
    id: "notion",
    label: "Notion",
    color: "#000000",
    icon: SiNotion,
    category: "Penulisan",
  },
  {
    id: "obsidian",
    label: "Obsidian",
    color: "#7C3AED",
    icon: SiObsidian,
    category: "Penulisan",
  },

  // ── Pengumpulan Data ────────────────────────────────────────────────────
  {
    id: "google-forms",
    label: "Google Forms",
    color: "#7E57C2",
    icon: SiGoogleforms,
    category: "Pengumpulan Data",
  },
  {
    id: "google-drive",
    label: "Google Drive",
    color: "#4285F4",
    icon: SiGoogledrive,
    category: "Pengumpulan Data",
  },
  {
    id: "pdf-referensi",
    label: "PDF / Jurnal Online",
    color: "#E53E3E",
    icon: FaFilePdf,
    category: "Pengumpulan Data",
  },
  {
    id: "youtube-referensi",
    label: "YouTube",
    color: "#FF0000",
    icon: SiYoutube,
    category: "Pengumpulan Data",
  },

  // ── Visualisasi ─────────────────────────────────────────────────────────
  {
    id: "figma-kti",
    label: "Figma",
    color: "#F24E1E",
    icon: SiFigma,
    category: "Visualisasi",
  },
  {
    id: "canva-kti",
    label: "Canva",
    color: "#00C4CC",
    icon: SiCanvas,
    category: "Visualisasi",
  },
  {
    id: "powerpoint",
    label: "PowerPoint",
    color: "#D24726",
    icon: FaFilePowerpoint,
    category: "Visualisasi",
  },

  // ── Kolaborasi ──────────────────────────────────────────────────────────
  {
    id: "miro",
    label: "Miro",
    color: "#FFD02F",
    icon: SiMiro,
    category: "Kolaborasi",
  },
  {
    id: "notion-collab",
    label: "Notion (Kolaborasi)",
    color: "#000000",
    icon: SiNotion,
    category: "Kolaborasi",
  },
];

export function getKTITool(label: string): KTIToolItem | undefined {
  return KTI_TOOLS.find(
    (t) =>
      t.label.toLowerCase() === label.toLowerCase() ||
      t.id.toLowerCase() === label.toLowerCase()
  );
}
