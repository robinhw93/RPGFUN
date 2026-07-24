import { BookOpen, Copy, Download, Image, LockKeyhole, Save, Skull, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ENEMIES } from "../../game/data";
import type { AbilityRange, AdventureDefinition, AdventureEventDefinition, AdventureEventOutcome, StatName } from "../../game/types";

export type DevtoolKind = "talentDevtool" | "enemyDevtool" | "eventDevtool" | "adventureDevtool" | "portraitDevtool";

export const DEVTOOL_CODE = "bajs321";
export const ENEMY_DRAFT_STORAGE_KEY = "emberfall.enemy-devtool.v1";
export const EVENT_DRAFT_STORAGE_KEY = "emberfall.event-devtool.v1";
export const ADVENTURE_DRAFT_STORAGE_KEY = "emberfall.adventure-devtool.v1";

export interface EnemyDraft {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  physicalPower: number;
  spellPower: number;
  armor: number;
  magicResistance: number;
  hitChance: number;
  dodgeChance: number;
  critChance: number;
  energyRegen: number;
  maxEnergy: number;
  abilities: EnemyAbilityDraft[];
  behaviorNotes: string;
  accent: string;
}

export interface EnemyAbilityDraft {
  id: string;
  name: string;
  energyCost: number;
  cooldownTurns: number;
  range: AbilityRange;
  effect: string;
}

export type EnemyEditableStats = Pick<EnemyDraft,
  "maxHp" | "physicalPower" | "spellPower" | "armor" | "magicResistance" |
  "hitChance" | "dodgeChance" | "critChance" | "energyRegen" | "maxEnergy"
>;

export interface EnemyExchange { format: "arkenfall-enemies"; version: 3; enemies: EnemyDraft[] }
export interface EventExchange { format: "arkenfall-events"; version: 2; events: AdventureEventDefinition[] }
export interface AdventureExchange { format: "arkenfall-adventures"; version: 1; adventures: AdventureDefinition[] }

export const EMPTY_OUTCOME: AdventureEventOutcome = { text: "", effects: [] };
export const STAT_OPTIONS: Array<{ id: StatName; label: string }> = [
  { id: "strength", label: "Strength" }, { id: "agility", label: "Agility" }, { id: "intelligence", label: "Intelligence" }, { id: "vitality", label: "Vitality" }, { id: "luck", label: "Luck" },
];

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function readExchange<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyJson(value: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
}

export async function saveLiveCatalog(kind: "events" | "adventures", exchange: EventExchange | AdventureExchange) {
  const response = await fetch("/__arkenfall/content-catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, exchange }),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !result?.ok) throw new Error(result?.error ?? "The live source could not be updated. Run the game through the local Vite development server.");
}

export function useLocalDraft<T>(key: string, fallback: T, normalize: (value: T) => T = (value) => value) {
  const [draft, setDraft] = useState<T>(() => normalize(readExchange(key, fallback)));
  const [message, setMessage] = useState("Changes save automatically in this browser");
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(draft)); }, [draft, key]);
  const save = () => { window.localStorage.setItem(key, JSON.stringify(draft)); setMessage("Draft saved locally"); };
  return { draft, setDraft, message, setMessage, save };
}

export function useModalScrollLock() {
  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, []);
}

export function localEnemies(): Array<{ id: string; name: string }> {
  const stored = readExchange<EnemyExchange | null>(ENEMY_DRAFT_STORAGE_KEY, null);
  return [...new Map([...(stored?.enemies ?? []), ...Object.values(ENEMIES)].map((enemy) => [enemy.id, enemy])).values()]
    .map((enemy) => ({ id: enemy.id, name: enemy.name }));
}

export function DevtoolAccessDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (tool: DevtoolKind) => void }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useModalScrollLock();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code !== DEVTOOL_CODE) { setCode(""); setError("Wrong access code."); inputRef.current?.focus(); return; }
    setUnlocked(true);
  };

  return <div className="devtool-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="devtool-gate devtool-launcher" role="dialog" aria-modal="true" aria-labelledby="devtool-access-title">
      <button type="button" className="devtool-close" onClick={onClose} aria-label="Close"><X size={17} /></button>
      <span className="devtool-gate-icon">{unlocked ? <Wrench size={22} /> : <LockKeyhole size={22} />}</span>
      <p className="eyebrow">Developer Tools</p>
      <h2 id="devtool-access-title">{unlocked ? "Choose an editor" : "Restricted Tools"}</h2>
      {!unlocked ? <>
        <p>Enter the developer code to continue.</p>
        <form onSubmit={submit}>
          <label htmlFor="devtool-code">Access code</label>
          <input ref={inputRef} id="devtool-code" type="password" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} autoComplete="off" />
          {error && <small className="devtool-gate-error" role="alert">{error}</small>}
          <button type="submit" className="primary-button" disabled={!code}>Unlock tools</button>
        </form>
      </> : <div className="devtool-launcher-grid">
        <button onClick={() => onOpen("talentDevtool")}><BookOpen /><span><strong>Talent Editor</strong><small>Talents, abilities and connections</small></span></button>
        <button onClick={() => onOpen("enemyDevtool")}><Skull /><span><strong>Create Enemy</strong><small>Stats, abilities and behavior</small></span></button>
        <button onClick={() => onOpen("eventDevtool")}><Copy /><span><strong>Event Manager</strong><small>Scenarios, choices and rolls</small></span></button>
        <button onClick={() => onOpen("adventureDevtool")}><Wrench /><span><strong>Adventure Editor</strong><small>Stages, chances and prerequisites</small></span></button>
        <button onClick={() => onOpen("portraitDevtool")}><Image /><span><strong>Portrait Editor</strong><small>Artwork and combat portrait crops</small></span></button>
      </div>}
    </section>
  </div>;
}

export function EditorShell({ title, description, message, onSave, onCopy, onExport, onExit, children }: {
  title: string; description: string; message: string; onSave: () => void; onCopy: () => void; onExport: () => void; onExit: () => void; children: React.ReactNode;
}) {
  return <section className="content-devtool-page">
    <header className="content-devtool-header">
      <div><p className="eyebrow"><Wrench size={13} /> Developer Tool</p><h1>{title}</h1><p>{description}</p></div>
      <div className="content-devtool-actions"><span aria-live="polite">{message}</span><button onClick={onSave}><Save size={15} /> Save</button><button onClick={onCopy}><Copy size={15} /> Copy for Codex</button><button onClick={onExport}><Download size={15} /> Export JSON</button><button className="devtool-exit" onClick={onExit}><X size={15} /> Exit</button></div>
    </header>
    {children}
  </section>;
}

export function NumberField({ label, value, onChange, step = 1, min }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number }) {
  return <label><span>{label}</span><input type="number" value={value} step={step} min={min} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function TextField({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className={textarea ? "wide-field" : ""}><span>{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}
