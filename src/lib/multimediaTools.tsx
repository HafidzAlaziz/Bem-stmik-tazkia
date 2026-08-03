import React from "react";
import { IconType, IconBaseProps } from "react-icons";
import {
  SiFigma,
  SiBlender,
  SiSketch,
} from "react-icons/si";
import {
  FaVideo,
  FaCamera,
  FaMusic,
  FaPenNib,
} from "react-icons/fa";

const createAdobeIcon = (text: string) => {
  return function AdobeIcon({ size, ...props }: IconBaseProps) {
    return (
      <svg viewBox="0 0 24 24" width={size || "1em"} height={size || "1em"} {...props}>
        <rect width="24" height="24" rx="4" fill="currentColor" />
        <text x="50%" y="50%" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dy=".35em">{text}</text>
      </svg>
    );
  };
};

const CustomCanvaIcon = ({ size, ...props }: IconBaseProps) => (
  <svg viewBox="0 0 24 24" width={size || "1em"} height={size || "1em"} {...props}>
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    <text x="50%" y="50%" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dy=".35em">C</text>
  </svg>
);

const CustomCapcutIcon = ({ size, ...props }: IconBaseProps) => (
  <svg viewBox="0 0 24 24" width={size || "1em"} height={size || "1em"} {...props}>
    <rect width="24" height="24" rx="12" fill="currentColor" />
    <path d="M7 7h10l-5 10L7 7z" fill="white" />
  </svg>
);

const PsIcon = createAdobeIcon("Ps");
const AiIcon = createAdobeIcon("Ai");
const PrIcon = createAdobeIcon("Pr");
const AeIcon = createAdobeIcon("Ae");
const LrIcon = createAdobeIcon("Lr");

export interface MultimediaToolItem {
  id: string;
  label: string;
  color: string;
  icon: IconType;
  category: "Desain Grafis" | "UI/UX Design" | "Video Editing" | "Animasi & 3D" | "Lainnya";
}

export const MULTIMEDIA_TOOLS: MultimediaToolItem[] = [
  // Desain Grafis
  { id: "photoshop", label: "Adobe Photoshop", color: "#31A8FF", icon: PsIcon, category: "Desain Grafis" },
  { id: "illustrator", label: "Adobe Illustrator", color: "#FF9A00", icon: AiIcon, category: "Desain Grafis" },
  { id: "canva", label: "Canva", color: "#00C4CC", icon: CustomCanvaIcon, category: "Desain Grafis" },
  
  // UI/UX Design
  { id: "figma", label: "Figma", color: "#F24E1E", icon: SiFigma, category: "UI/UX Design" },
  { id: "sketch", label: "Sketch", color: "#F7B500", icon: SiSketch, category: "UI/UX Design" },

  // Video Editing
  { id: "premiere", label: "Adobe Premiere Pro", color: "#9999FF", icon: PrIcon, category: "Video Editing" },
  { id: "aftereffects", label: "Adobe After Effects", color: "#9999FF", icon: AeIcon, category: "Video Editing" },
  { id: "capcut", label: "CapCut", color: "#000000", icon: CustomCapcutIcon, category: "Video Editing" },
  { id: "davinci", label: "DaVinci Resolve", color: "#4B4D4B", icon: FaVideo, category: "Video Editing" },
  
  // Animasi & 3D
  { id: "blender", label: "Blender", color: "#F5792A", icon: SiBlender, category: "Animasi & 3D" },
  
  // Lainnya
  { id: "lightroom", label: "Adobe Lightroom", color: "#31A8FF", icon: LrIcon, category: "Lainnya" },
  { id: "photography", label: "Fotografi", color: "#1E293B", icon: FaCamera, category: "Lainnya" },
  { id: "audio", label: "Audio Editing", color: "#10B981", icon: FaMusic, category: "Lainnya" },
  { id: "illustration", label: "Digital Illustration", color: "#E11D48", icon: FaPenNib, category: "Lainnya" },
];

export function getMultimediaTool(label: string): MultimediaToolItem | undefined {
  return MULTIMEDIA_TOOLS.find(
    (t) =>
      t.label.toLowerCase() === label.toLowerCase() ||
      t.id.toLowerCase() === label.toLowerCase()
  );
}
