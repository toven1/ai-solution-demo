"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function lines(value: string[]) {
  return value.join("\n");
}

function split(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function Toast({ toast }: { toast: { type: "success" | "error"; message: string } | null }) {
  if (!toast) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border bg-white p-3 text-sm shadow-sm">
      {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : <XCircle className="h-4 w-4 text-red-600" />}
      <span className={toast.type === "success" ? "text-teal-900" : "text-red-700"}>{toast.message}</span>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  return [toast, setToast] as const;
}

export function PersonaEditor({ projectId, personas }: { projectId: string; personas: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(personas);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  useEffect(() => setItems(personas), [personas]);

  async function generate() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/personas/generate`, { method: "POST" });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: "페르소나 3개를 생성했습니다." } : { type: "error", message: "생성에 실패했습니다." });
    router.refresh();
  }
  async function save() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/personas`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personas: items }) });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: "페르소나가 저장되었습니다." } : { type: "error", message: "저장에 실패했습니다." });
    router.refresh();
  }
  const update = (i: number, key: string, value: any) => setItems((current) => current.map((item, index) => index === i ? { ...item, [key]: value } : item));
  return (
    <Card><CardHeader className="flex flex-row justify-between gap-4 space-y-0"><div><CardTitle>Persona Page</CardTitle><CardDescription>페르소나 3개를 생성하고 수정합니다.</CardDescription></div><Button onClick={generate} disabled={busy}><Sparkles className="h-4 w-4" />{items.length ? "재생성" : "생성"}</Button></CardHeader><CardContent><Toast toast={toast} />{items.length === 0 ? <EmptyState title="페르소나가 없습니다" description="생성 버튼을 누르면 MockAI가 3개 페르소나를 만들고 DB에 저장합니다." /> : <div className="grid gap-4">{items.map((p, i) => <div key={p.id} className="grid gap-3 rounded-md border p-4"><Input value={p.name} onChange={(e) => update(i, "name", e.target.value)} /><Input value={p.segment} onChange={(e) => update(i, "segment", e.target.value)} /><Textarea value={p.description} onChange={(e) => update(i, "description", e.target.value)} /><Textarea value={lines(p.jobsToBeDone)} onChange={(e) => update(i, "jobsToBeDone", split(e.target.value))} placeholder="Job-to-be-Done" /><Textarea value={lines(p.pains)} onChange={(e) => update(i, "pains", split(e.target.value))} placeholder="Pain Point" /><Textarea value={lines(p.gains)} onChange={(e) => update(i, "gains", split(e.target.value))} placeholder="Gain" /><Textarea value={lines(p.buyingTriggers)} onChange={(e) => update(i, "buyingTriggers", split(e.target.value))} placeholder="구매 동기" /><Textarea value={lines(p.objections)} onChange={(e) => update(i, "objections", split(e.target.value))} placeholder="반대 이유" /><Textarea value={lines(p.interviewQuestions)} onChange={(e) => update(i, "interviewQuestions", split(e.target.value))} placeholder="인터뷰 질문" /></div>)}<Button onClick={save} disabled={busy}>저장하기</Button></div>}</CardContent></Card>
  );
}

export function BMCanvasEditor({ projectId, canvas }: { projectId: string; canvas: any | null }) {
  const router = useRouter();
  const blank = { customerSegments: "", valuePropositions: "", channels: "", customerRelationships: "", revenueStreams: "", keyResources: "", keyActivities: "", keyPartners: "", costStructure: "" };
  const [item, setItem] = useState(canvas ?? blank);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  useEffect(() => setItem(canvas ?? blank), [canvas]);
  async function generate() { setBusy(true); const res = await fetch(`/api/projects/${projectId}/canvas/generate`, { method: "POST" }); setBusy(false); setToast(res.ok ? { type: "success", message: "BM Canvas를 생성했습니다." } : { type: "error", message: "생성에 실패했습니다." }); router.refresh(); }
  async function save() { setBusy(true); const res = await fetch(`/api/projects/${projectId}/canvas`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) }); setBusy(false); setToast(res.ok ? { type: "success", message: "BM Canvas가 저장되었습니다." } : { type: "error", message: "저장에 실패했습니다." }); router.refresh(); }
  const fields = [["customerSegments","Customer Segments"],["valuePropositions","Value Propositions"],["channels","Channels"],["customerRelationships","Customer Relationships"],["revenueStreams","Revenue Streams"],["keyResources","Key Resources"],["keyActivities","Key Activities"],["keyPartners","Key Partners"],["costStructure","Cost Structure"]];
  return <Card><CardHeader className="flex flex-row justify-between gap-4 space-y-0"><div><CardTitle>BM Canvas Page</CardTitle><CardDescription>9개 블록을 수정합니다.</CardDescription></div><Button onClick={generate} disabled={busy}><Sparkles className="h-4 w-4" />{canvas ? "재생성" : "생성"}</Button></CardHeader><CardContent><Toast toast={toast} /><div className="grid gap-3 md:grid-cols-2">{fields.map(([key,label]) => <div key={key} className="grid gap-2"><div className="text-sm font-medium">{label}</div><Textarea value={item[key] ?? ""} onChange={(e)=>setItem((c:any)=>({...c,[key]:e.target.value}))} /></div>)}</div><Button className="mt-4" onClick={save} disabled={busy}>저장하기</Button></CardContent></Card>;
}

export function MVPFeatureEditor({ projectId, features }: { projectId: string; features: any[] }) {
  const router = useRouter(); const [items,setItems]=useState(features); const [busy,setBusy]=useState(false); const [toast,setToast]=useToast(); useEffect(()=>setItems(features),[features]);
  async function generate(){setBusy(true); const res=await fetch(`/api/projects/${projectId}/mvp/generate`,{method:"POST"}); setBusy(false); setToast(res.ok?{type:"success",message:"MVP 기능 후보를 생성했습니다."}:{type:"error",message:"생성에 실패했습니다."}); router.refresh();}
  async function save(){setBusy(true); const res=await fetch(`/api/projects/${projectId}/mvp`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({features:items})}); setBusy(false); setToast(res.ok?{type:"success",message:"MVP 기능이 저장되었습니다."}:{type:"error",message:"저장에 실패했습니다."}); router.refresh();}
  const update=(i:number,key:string,value:any)=>setItems(c=>c.map((it,idx)=>idx===i?{...it,[key]:value}:it));
  return <Card><CardHeader className="flex flex-row justify-between gap-4 space-y-0"><div><CardTitle>MVP Planning Page</CardTitle><CardDescription>RICE와 MoSCoW 기준으로 기능 후보를 관리합니다.</CardDescription></div><Button onClick={generate} disabled={busy}><Sparkles className="h-4 w-4" />{items.length?"재생성":"생성"}</Button></CardHeader><CardContent><Toast toast={toast}/>{items.length===0?<EmptyState title="MVP 기능 후보가 없습니다" description="생성 버튼을 눌러 기능 후보를 만드세요."/>:<div className="grid gap-3">{items.map((f,i)=><div key={f.id} className="grid gap-2 rounded-md border p-3"><Input value={f.title} onChange={e=>update(i,"title",e.target.value)}/><Textarea value={f.description??""} onChange={e=>update(i,"description",e.target.value)}/><div className="grid grid-cols-3 gap-2 md:grid-cols-7">{["reach","impact","confidence","effort","riceScore","priority","moscowCategory"].map(k=><Input key={k} value={f[k]??""} onChange={e=>update(i,k,["moscowCategory"].includes(k)?e.target.value:Number(e.target.value))} />)}</div></div>)}<Button onClick={save} disabled={busy}>저장하기</Button></div>}</CardContent></Card>;
}

export function ValidationExperimentEditor({ projectId, experiments }: { projectId: string; experiments: any[] }) {
  const router = useRouter(); const [items,setItems]=useState(experiments); const [busy,setBusy]=useState(false); const [toast,setToast]=useToast(); useEffect(()=>setItems(experiments),[experiments]);
  async function generate(){setBusy(true); const res=await fetch(`/api/projects/${projectId}/experiments/generate`,{method:"POST"}); setBusy(false); setToast(res.ok?{type:"success",message:"검증 실험을 생성했습니다."}:{type:"error",message:"생성에 실패했습니다."}); router.refresh();}
  async function save(){setBusy(true); const res=await fetch(`/api/projects/${projectId}/experiments`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({experiments:items})}); setBusy(false); setToast(res.ok?{type:"success",message:"검증 실험이 저장되었습니다."}:{type:"error",message:"저장에 실패했습니다."}); router.refresh();}
  const update=(i:number,key:string,value:string)=>setItems(c=>c.map((it,idx)=>idx===i?{...it,[key]:value}:it));
  return <Card><CardHeader className="flex flex-row justify-between gap-4 space-y-0"><div><CardTitle>Validation Experiment Page</CardTitle><CardDescription>가설, 실험 방법, 성공 기준, 피벗 기준을 관리합니다.</CardDescription></div><Button onClick={generate} disabled={busy}><Sparkles className="h-4 w-4" />{items.length?"재생성":"생성"}</Button></CardHeader><CardContent><Toast toast={toast}/>{items.length===0?<EmptyState title="검증 실험이 없습니다" description="생성 버튼을 눌러 검증 가설을 만드세요."/>:<div className="grid gap-3">{items.map((e,i)=><div key={e.id} className="grid gap-2 rounded-md border p-3">{["hypothesis","method","successMetric","requiredData","estimatedCost","pivotCriteria","timeline","status"].map(k=><Textarea key={k} value={e[k]??""} onChange={ev=>update(i,k,ev.target.value)} placeholder={k}/>)}</div>)}<Button onClick={save} disabled={busy}>저장하기</Button></div>}</CardContent></Card>;
}
