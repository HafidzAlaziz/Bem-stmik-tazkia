"use client";

import { useState } from "react";
import { FiGithub, FiExternalLink, FiHeart, FiLayers, FiEye, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import Image from "next/image";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  demo_url?: string;
  github_url?: string;
  cover_image?: string;
  likes_count: number;
  is_featured?: boolean;
}

interface ProjectCardProps {
  project: ProjectData;
  onLike?: (projectId: string) => void;
}

export default function ProjectCard({ project, onLike }: ProjectCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(project.likes_count || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!liked) {
      setLiked(true);
      setLikes((prev) => prev + 1);
      if (onLike) onLike(project.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/20 hover:shadow-[0_8px_30px_rgba(27,64,134,0.08)] transition-all duration-300 group flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-variant/30">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5">
            <FiLayers size={36} className="mb-2 text-primary/40" />
            <span className="text-xs font-bold text-on-surface-variant">Project Showcase</span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <span className="text-[var(--color-secondary)] text-xs font-bold tracking-wider uppercase mb-3 block">
          {project.tech_stack?.slice(0, 2).join(" • ") || "Project"}
        </span>
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-[var(--color-on-surface-variant)] text-sm mb-6 line-clamp-3 flex-grow">
          {project.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-auto mb-4 text-on-surface-variant text-sm">
          <div
            onClick={handleLike}
            className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-red-500 transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0 -ml-1">
              {liked ? (
                <DotLottieReact src="/animations/Heart Animated.lottie" autoplay loop={false} />
              ) : (
                <FiHeart className="text-on-surface-variant/70 group-hover/stat:text-red-500 transition-colors" />
              )}
            </div>
            <span className={liked ? "text-red-500 font-bold" : "text-on-surface-variant"}>
              {likes}
            </span>
          </div>
          <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-blue-500 transition-colors">
            <FiEye className="text-on-surface-variant/70 group-hover/stat:text-blue-500 transition-colors" />
            <span>{(project as any).views || 0}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          <span className="text-on-surface-variant/70 text-sm">
            {(project as any).created_at ? new Date((project as any).created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
          </span>
          <a
            href={project.demo_url || project.github_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[var(--color-primary)] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            View Details <FiArrowRight />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
