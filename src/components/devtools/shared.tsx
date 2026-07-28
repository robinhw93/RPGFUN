import { ArrowUp, BookOpen, ClipboardList, Copy, Download, Gem, Gift, Image, LockKeyhole, Plus, Save, Skull, Trash2, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ENEMIES, ITEMS } from "../../game/data";
import { MAX_LEVEL } from "../../game/progression";
import type { AdventureDefinition, AdventureEventDefinition, AdventureEventOutcome, EnemyAbilityDefinition, EnemyBehaviorKind, EnemyTemplate, GearSetDefinition, InventoryItem, ItemDropDefinition, QuestDefinition, QuestlineDefinition, StatName } from "../../game/types";

export type DevtoolKind = "talentDevtool" | "enemyDevtool" | "eventDevtool" | "adventureDevtool" | "itemDevtool" | "questDevtool" | "portraitDevtool";

export const DEVTOOL_CODE = "bajs321";
export const ENEMY_DRAFT_STORAGE_KEY = "emberfall.enemy-devtool.v1";
export const EVENT_DRAFT_STORAGE_KEY = "emberfall.event-devtool.v1";
export const ADVENTURE_DRAFT_STORAGE_KEY = "emberfall.adventure-devtool.v1";
export const ITEM_DRAFT_STORAGE_KEY = "emberfall.item-devtool.v1";
export const QUEST_DRAFT_STORAGE_KEY = "emberfall.quest-devtool.v1";

export interface EnemyDraft {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  portraitUrl: string;
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
  startingEnergy: number;
  startingStatuses?: EnemyTemplate["startingStatuses"];
  dropTable: ItemDropDefinition[];
  abilities: EnemyAbilityDraft[];
  behaviorNotes: string;
  behavior: EnemyBehaviorKind;
  ai?: EnemyTemplate["ai"];
  maxActionsPerTurn: number;
  healOnAllyDeath?: EnemyTemplate["healOnAllyDeath"];
  accent: string;
}

export interface EnemyAbilityDraft extends Omit<EnemyAbilityDefinition, "description"> {
  effect: string;
}

export type EnemyEditableStats = Pick<EnemyDraft,
  "maxHp" | "physicalPower" | "spellPower" | "armor" | "magicResistance" |
  "hitChance" | "dodgeChance" | "critChance" | "energyRegen" | "maxEnergy" | "startingEnergy"
>;

export interface EnemyExchange { format: "arkenfall-enemies"; version: 3; enemies: EnemyDraft[] }
export interface EventExchange { format: "arkenfall-events"; version: 2; events: AdventureEventDefinition[] }
export interface AdventureExchange { format: "arkenfall-adventures"; version: 1; adventures: AdventureDefinition[] }
export interface ItemExchange { format: "arkenfall-items"; version: 1; items: InventoryItem[]; sets: GearSetDefinition[] }
export interface QuestExchange { format: "arkenfall-quests"; version: 1; quests: QuestDefinition[]; questlines: QuestlineDefinition[] }

export const EMPTY_OUTCOME: AdventureEventOutcome = { text: "", effects: [] };
export const STAT_OPTIONS: Array<{ id: StatName; label: string }> = [
  { id: "strength", label: "Strength" }, { id: "agility", label: "Agility" }, { id: "intelligence", label: "Intelligence" }, { id: "vitality", label: "Vitality" }, { id: "luck", label: "Luck" },
];

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeReadableInternalId(seed: unknown, fallback: string) {
  if (typeof seed !== "string") return fallback;
  const slug = seed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

export function ensureInternalId(
  value: unknown,
  prefix: string,
  usedIds: Set<string>,
  readableSeed?: unknown,
): string {
  if (typeof value === "string" && value.length <= 96 && /^[a-z0-9_-]+$/i.test(value) && !usedIds.has(value)) {
    usedIds.add(value);
    return value;
  }
  const base = makeReadableInternalId(readableSeed, prefix);
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
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

export async function saveLiveCatalog(kind: "enemies" | "events" | "adventures" | "items" | "quests", exchange: EnemyExchange | EventExchange | AdventureExchange | ItemExchange | QuestExchange) {
  const response = await fetch("/__arkenfall/content-catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, exchange }),
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !result?.ok) throw new Error(result?.error ?? "The live source could not be updated. Run the game through the local Vite development server.");
}

export function JsonObjectField({ label, value, onCommit }: { label: string; value: Record<string, unknown>; onCommit: (value: Record<string, unknown>) => void }) {
  const serialized = JSON.stringify(value, null, 2);
  const [draft, setDraft] = useState(serialized);
  const [error, setError] = useState("");
  useEffect(() => { setDraft(serialized); setError(""); }, [serialized]);
  const commit = () => {
    try {
      const parsed = JSON.parse(draft) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Enter one JSON object.");
      onCommit(parsed as Record<string, unknown>);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid JSON.");
    }
  };
  return <label className="wide-field"><span>{label}</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} spellCheck={false} />{error && <small className="field-error">{error}</small>}</label>;
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

export function localItems(): Array<{ id: string; name: string }> {
  const stored = readExchange<ItemExchange | null>(ITEM_DRAFT_STORAGE_KEY, null);
  return [...new Map([...(stored?.items ?? []), ...ITEMS].map((item) => [item.id, item])).values()]
    .map((item) => ({ id: item.id, name: item.name }));
}

export function DevtoolAccessDialog({
  onClose,
  onOpen,
  onLevelUp,
  onGrantItem,
  characterLevel,
  levelUpDisabled,
}: {
  onClose: () => void;
  onOpen: (tool: DevtoolKind) => void;
  onLevelUp: () => void;
  onGrantItem: (itemId: string, quantity: number) => void;
  characterLevel: number;
  levelUpDisabled: boolean;
}) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [grantItemOpen, setGrantItemOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(ITEMS[0]?.id ?? "");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useModalScrollLock();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code !== DEVTOOL_CODE) { setCode(""); setError("Wrong access code."); inputRef.current?.focus(); return; }
    setUnlocked(true);
  };

  const levelUp = () => {
    if (levelUpDisabled || characterLevel >= MAX_LEVEL) return;
    onLevelUp();
    setActionMessage(`Level ${characterLevel + 1} reached. +3 Attribute Points and +1 Talent Point.`);
  };

  const grantItem = (event: React.FormEvent) => {
    event.preventDefault();
    const item = ITEMS.find((candidate) => candidate.id === selectedItemId);
    if (!item) return;
    const quantity = Math.min(99, Math.max(1, Math.floor(itemQuantity)));
    onGrantItem(item.id, quantity);
    setItemQuantity(quantity);
    setActionMessage(`${item.name}${quantity > 1 ? ` x${quantity}` : ""} added to Inventory.`);
  };

  return <div className="devtool-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="devtool-gate devtool-launcher" role="dialog" aria-modal="true" aria-labelledby="devtool-access-title">
      <button type="button" className="devtool-close" onClick={onClose} aria-label="Close"><X size={17} /></button>
      <span className="devtool-gate-icon">{unlocked ? <Wrench size={22} /> : <LockKeyhole size={22} />}</span>
      <p className="eyebrow">Developer Tools</p>
      <h2 id="devtool-access-title">{unlocked ? "Developer tools" : "Restricted Tools"}</h2>
      {!unlocked ? <>
        <p>Enter the developer code to continue.</p>
        <form onSubmit={submit}>
          <label htmlFor="devtool-code">Access code</label>
          <input ref={inputRef} id="devtool-code" type="password" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} autoComplete="off" />
          {error && <small className="devtool-gate-error" role="alert">{error}</small>}
          <button type="submit" className="primary-button" disabled={!code}>Unlock tools</button>
        </form>
      </> : <>
        <div className="devtool-launcher-grid">
          <button onClick={() => onOpen("talentDevtool")}><BookOpen /><span><strong>Talent Editor</strong><small>Talents, abilities and connections</small></span></button>
          <button onClick={() => onOpen("enemyDevtool")}><Skull /><span><strong>Create Enemy</strong><small>Stats, abilities and behavior</small></span></button>
          <button onClick={() => onOpen("eventDevtool")}><Copy /><span><strong>Event Manager</strong><small>Choices, checks and merchants</small></span></button>
          <button onClick={() => onOpen("adventureDevtool")}><Wrench /><span><strong>Adventure Editor</strong><small>Stages, chances and prerequisites</small></span></button>
          <button onClick={() => onOpen("itemDevtool")}><Gem /><span><strong>Item Editor</strong><small>Gear, sets, consumables and other items</small></span></button>
          <button onClick={() => onOpen("questDevtool")}><ClipboardList /><span><strong>Quest Editor</strong><small>Quests, goals and questlines</small></span></button>
          <button onClick={() => onOpen("portraitDevtool")}><Image /><span><strong>Portrait Editor</strong><small>Artwork and combat portrait crops</small></span></button>
        </div>
        <div className="devtool-test-actions">
          <p>Character testing</p>
          <div>
            <button type="button" onClick={levelUp} disabled={levelUpDisabled || characterLevel >= MAX_LEVEL}>
              <ArrowUp /><span><strong>Level up</strong><small>{characterLevel >= MAX_LEVEL ? "Maximum level reached" : levelUpDisabled ? "Unavailable during active combat" : `Advance from level ${characterLevel}`}</small></span>
            </button>
            <button type="button" className={grantItemOpen ? "selected" : ""} onClick={() => { setGrantItemOpen((current) => !current); setActionMessage(""); }}>
              <Gift /><span><strong>Grant item</strong><small>Choose a live item and quantity</small></span>
            </button>
          </div>
          {grantItemOpen && (
            <form className="devtool-grant-item" onSubmit={grantItem}>
              <label htmlFor="devtool-grant-item-select">Item</label>
              <select id="devtool-grant-item-select" value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
                {[...ITEMS].sort((left, right) => left.name.localeCompare(right.name)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <label htmlFor="devtool-grant-item-quantity">Quantity</label>
              <input id="devtool-grant-item-quantity" type="number" min={1} max={99} step={1} value={itemQuantity} onChange={(event) => setItemQuantity(Number(event.target.value))} />
              <button type="submit" className="primary-button" disabled={!selectedItemId}>Grant item</button>
            </form>
          )}
          {actionMessage && <small className="devtool-action-message" role="status" aria-live="polite">{actionMessage}</small>}
        </div>
      </>}
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

export function NumberField({ label, value, onChange, step = 1, min, max }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number; max?: number }) {
  return <label><span>{label}</span><input type="number" value={value} step={step} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function TextField({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className={textarea ? "wide-field" : ""}><span>{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

export function DropTableEditor({ entries, items, onChange, title = "Drop table", allowDuplicateItems = false }: {
  entries: ItemDropDefinition[];
  items: Array<{ id: string; name: string }>;
  onChange: (entries: ItemDropDefinition[]) => void;
  title?: string;
  allowDuplicateItems?: boolean;
}) {
  const addDrop = () => {
    const item = allowDuplicateItems
      ? items[0]
      : items.find((candidate) => !entries.some((entry) => entry.itemId === candidate.id)) ?? items[0];
    if (!item) return;
    onChange([...entries, { itemId: item.id, chance: 1 }]);
  };
  return <fieldset className="drop-table-editor wide-field">
    <legend>{title}</legend>
    <p>{allowDuplicateItems ? "Each row rolls independently, including repeated items. A combat can award several items or none." : "Each item rolls independently. A combat can award several items or none."}</p>
    <div className="drop-table-rows">
      {entries.map((entry, index) => <div className="drop-table-row" key={`${entry.itemId}-${index}`}>
        <label><span>Item</span><select value={entry.itemId} onChange={(event) => onChange(entries.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, itemId: event.target.value } : candidate))}>{items.map((item) => <option value={item.id} key={item.id} disabled={!allowDuplicateItems && item.id !== entry.itemId && entries.some((candidate) => candidate.itemId === item.id)}>{item.name}</option>)}</select></label>
        <NumberField label="Drop chance %" value={entry.chance} min={0} max={100} step={0.1} onChange={(chance) => onChange(entries.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, chance: Math.min(100, Math.max(0, chance)) } : candidate))} />
        <button type="button" onClick={() => onChange(entries.filter((_, candidateIndex) => candidateIndex !== index))} aria-label={`Remove ${items.find((item) => item.id === entry.itemId)?.name ?? "item"} drop`}><Trash2 size={14} /> Remove</button>
      </div>)}
      {entries.length === 0 && <span className="empty-editor-copy">Nothing can drop from this table.</span>}
    </div>
    <button type="button" className="secondary-editor-button" onClick={addDrop} disabled={items.length === 0 || (!allowDuplicateItems && entries.length >= items.length)}><Plus size={14} /> Add item drop</button>
  </fieldset>;
}
