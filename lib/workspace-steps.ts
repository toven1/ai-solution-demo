import {
  BarChart3,
  ClipboardCheck,
  FileDown,
  FileText,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Network,
  PanelsTopLeft,
  Share2,
  Target,
  Users
} from "lucide-react";

export const workspaceSteps = [
  ["개요", "overview", LayoutDashboard],
  ["추가 질문", "questions", HelpCircle],
  ["시장조사", "research", BarChart3],
  ["경쟁사", "competitors", Network],
  ["페르소나", "personas", Users],
  ["BM Canvas", "canvas", PanelsTopLeft],
  ["MVP", "mvp", Target],
  ["검증 실험", "experiments", FlaskConical],
  ["사업계획서", "plan", FileText],
  ["IR 요약", "one-pager", ClipboardCheck],
  ["마케팅 카피", "copy", Megaphone],
  ["Export", "export", FileDown],
  ["멘토 공유", "share", Share2]
] as const;

export type WorkspaceStep = (typeof workspaceSteps)[number][1];
