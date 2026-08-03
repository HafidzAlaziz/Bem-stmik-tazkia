import { IconType } from "react-icons";
import { FaAws, FaJava, FaCss3Alt } from "react-icons/fa";
import {
  SiHtml5, SiJavascript, SiTypescript, 
  SiReact, SiNextdotjs, SiVuedotjs, SiAngular, SiSvelte,
  SiNodedotjs, SiExpress, SiNestjs,
  SiPython, SiDjango, SiFlask,
  SiPhp, SiLaravel, SiCodeigniter,
  SiSpring, SiKotlin, SiSwift,
  SiFlutter, SiDart,
  SiCplusplus, SiDotnet,
  SiRuby, SiRubyonrails,
  SiGo, SiRust,
  SiPostgresql, SiMysql, SiMongodb, SiFirebase, SiSupabase, SiRedis,
  SiDocker, SiKubernetes, SiVercel,
  SiTailwindcss, SiBootstrap, SiMui, SiChakraui,
  SiPrisma, SiSequelize, SiGraphql, SiApollographql,
  SiLinux, SiUbuntu, SiNginx, SiApache,
  SiAndroid, SiApple, SiExpo, SiIonic,
  SiVite, SiNuxt, SiRedux, SiGit, SiGithub
} from "react-icons/si";

export interface TechStackItem {
  id: string;
  label: string;
  color: string;
  icon: IconType;
  category: "Language" | "Frontend" | "Backend" | "Mobile" | "Database" | "DevOps" | "UI Framework" | "Other";
}

export const TECH_STACKS: TechStackItem[] = [
  // Languages
  { id: "html5", label: "HTML5", color: "#E34F26", icon: SiHtml5, category: "Frontend" },
  { id: "css", label: "CSS", color: "#1572B6", icon: FaCss3Alt, category: "Frontend" },
  { id: "javascript", label: "JavaScript", color: "#F7DF1E", icon: SiJavascript, category: "Language" },
  { id: "typescript", label: "TypeScript", color: "#3178C6", icon: SiTypescript, category: "Language" },
  { id: "python", label: "Python", color: "#3776AB", icon: SiPython, category: "Language" },
  { id: "php", label: "PHP", color: "#777BB4", icon: SiPhp, category: "Language" },
  { id: "java", label: "Java", color: "#007396", icon: FaJava, category: "Language" },
  { id: "kotlin", label: "Kotlin", color: "#7F52FF", icon: SiKotlin, category: "Language" },
  { id: "swift", label: "Swift", color: "#F05138", icon: SiSwift, category: "Language" },
  { id: "dart", label: "Dart", color: "#0175C2", icon: SiDart, category: "Language" },
  { id: "cpp", label: "C++", color: "#00599C", icon: SiCplusplus, category: "Language" },
  { id: "ruby", label: "Ruby", color: "#CC342D", icon: SiRuby, category: "Language" },
  { id: "go", label: "Go", color: "#00ADD8", icon: SiGo, category: "Language" },
  { id: "rust", label: "Rust", color: "#000000", icon: SiRust, category: "Language" },

  // Frontend
  { id: "react", label: "React", color: "#61DAFB", icon: SiReact, category: "Frontend" },
  { id: "nextjs", label: "Next.js", color: "#000000", icon: SiNextdotjs, category: "Frontend" },
  { id: "vue", label: "Vue.js", color: "#4FC08D", icon: SiVuedotjs, category: "Frontend" },
  { id: "nuxt", label: "Nuxt.js", color: "#00DC82", icon: SiNuxt, category: "Frontend" },
  { id: "angular", label: "Angular", color: "#DD0031", icon: SiAngular, category: "Frontend" },
  { id: "svelte", label: "Svelte", color: "#FF3E00", icon: SiSvelte, category: "Frontend" },
  { id: "vite", label: "Vite", color: "#646CFF", icon: SiVite, category: "Frontend" },
  { id: "redux", label: "Redux", color: "#764ABC", icon: SiRedux, category: "Frontend" },

  // Backend
  { id: "nodejs", label: "Node.js", color: "#339933", icon: SiNodedotjs, category: "Backend" },
  { id: "express", label: "Express", color: "#000000", icon: SiExpress, category: "Backend" },
  { id: "nestjs", label: "NestJS", color: "#E0234E", icon: SiNestjs, category: "Backend" },
  { id: "django", label: "Django", color: "#092E20", icon: SiDjango, category: "Backend" },
  { id: "flask", label: "Flask", color: "#000000", icon: SiFlask, category: "Backend" },
  { id: "laravel", label: "Laravel", color: "#FF2D20", icon: SiLaravel, category: "Backend" },
  { id: "codeigniter", label: "CodeIgniter", color: "#EF4223", icon: SiCodeigniter, category: "Backend" },
  { id: "spring", label: "Spring Boot", color: "#6DB33F", icon: SiSpring, category: "Backend" },
  { id: "dotnet", label: ".NET", color: "#512BD4", icon: SiDotnet, category: "Backend" },
  { id: "rails", label: "Ruby on Rails", color: "#CC0000", icon: SiRubyonrails, category: "Backend" },

  // Mobile
  { id: "flutter", label: "Flutter", color: "#02569B", icon: SiFlutter, category: "Mobile" },
  { id: "reactnative", label: "React Native", color: "#61DAFB", icon: SiReact, category: "Mobile" },
  { id: "expo", label: "Expo", color: "#000000", icon: SiExpo, category: "Mobile" },
  { id: "android", label: "Android", color: "#3DDC84", icon: SiAndroid, category: "Mobile" },
  { id: "ios", label: "iOS (Apple)", color: "#000000", icon: SiApple, category: "Mobile" },
  { id: "ionic", label: "Ionic", color: "#3880FF", icon: SiIonic, category: "Mobile" },

  // Database & ORM
  { id: "postgresql", label: "PostgreSQL", color: "#4169E1", icon: SiPostgresql, category: "Database" },
  { id: "mysql", label: "MySQL", color: "#4479A1", icon: SiMysql, category: "Database" },
  { id: "mongodb", label: "MongoDB", color: "#47A248", icon: SiMongodb, category: "Database" },
  { id: "redis", label: "Redis", color: "#DC382D", icon: SiRedis, category: "Database" },
  { id: "firebase", label: "Firebase", color: "#FFCA28", icon: SiFirebase, category: "Database" },
  { id: "supabase", label: "Supabase", color: "#3ECF8E", icon: SiSupabase, category: "Database" },
  { id: "prisma", label: "Prisma", color: "#2D3748", icon: SiPrisma, category: "Database" },
  { id: "sequelize", label: "Sequelize", color: "#52B0E7", icon: SiSequelize, category: "Database" },

  // UI Framework
  { id: "tailwindcss", label: "Tailwind CSS", color: "#06B6D4", icon: SiTailwindcss, category: "UI Framework" },
  { id: "bootstrap", label: "Bootstrap", color: "#7952B3", icon: SiBootstrap, category: "UI Framework" },
  { id: "mui", label: "Material UI", color: "#007FFF", icon: SiMui, category: "UI Framework" },
  { id: "chakraui", label: "Chakra UI", color: "#319795", icon: SiChakraui, category: "UI Framework" },

  // DevOps & Others
  { id: "docker", label: "Docker", color: "#2496ED", icon: SiDocker, category: "DevOps" },
  { id: "kubernetes", label: "Kubernetes", color: "#326CE5", icon: SiKubernetes, category: "DevOps" },
  { id: "aws", label: "AWS", color: "#232F3E", icon: FaAws, category: "DevOps" },
  { id: "vercel", label: "Vercel", color: "#000000", icon: SiVercel, category: "DevOps" },
  { id: "linux", label: "Linux", color: "#FCC624", icon: SiLinux, category: "DevOps" },
  { id: "ubuntu", label: "Ubuntu", color: "#E95420", icon: SiUbuntu, category: "DevOps" },
  { id: "nginx", label: "Nginx", color: "#009639", icon: SiNginx, category: "DevOps" },
  { id: "apache", label: "Apache", color: "#D22128", icon: SiApache, category: "DevOps" },
  { id: "git", label: "Git", color: "#F05032", icon: SiGit, category: "Other" },
  { id: "github", label: "GitHub", color: "#181717", icon: SiGithub, category: "Other" },
  { id: "graphql", label: "GraphQL", color: "#E10098", icon: SiGraphql, category: "Other" },
  { id: "apollo", label: "Apollo", color: "#311C87", icon: SiApollographql, category: "Other" }
];

export function getTechStack(label: string): TechStackItem | undefined {
  return TECH_STACKS.find(t => t.label.toLowerCase() === label.toLowerCase() || t.id.toLowerCase() === label.toLowerCase());
}
