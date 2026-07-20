import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy, Download, Grip, Link2, LockKeyhole, Plus, Save, Sparkles, Trash2, Wrench, X,
} from "lucide-react";
import { TALENTS } from "../game/data";
import type { StatName, TalentBranch } from "../game/types";

const TALENT_DRAFT_STORAGE_KEY = "emberfall.talent-devtool.v1";
const DEVTOOL_CODE = "bajs321";

type TalentNodeKind = "class" | "passive" | "ability";
type PassiveBonus = StatName | "armor" | "magicResistance" | "physicalPower" | "magicalPower" | "maxHp" | "maxEnergy" | "energyRegen" | "critChance" | "hitChance" | "dodgeChance" | "initiative";
type DirectPassiveBonus = Exclude<PassiveBonus, StatName>;

interface TalentDraftNode {
  id: string;
  name: string;
  description: string;
  branch: TalentBranch;
  kind: TalentNodeKind;
  tier: number;
  cost: number;
  requires: string[];
  position: { x: number; y: number };
  icon: string;
  passiveBonus: PassiveBonus | "";
  passiveAmount: number;
  abilityId: string;
  effectNotes: string;
}

interface TalentDraft {
  version: 1;
  nodes: TalentDraftNode[];
}

const BRANCH_OPTIONS: Array<{ id: TalentBranch; label: string }> = [
  { id: "core", label: "Core" },
  { id: "brute", label: "Brute" },
  { id: "shadow", label: "Shadow" },
  { id: "arcanist", label: "Arcanist" },
];

const PASSIVE_OPTIONS: Array<{ id: PassiveBonus; label: string }> = [
  { id: "strength", label: "Strength" },
  { id: "agility", label: "Agility" },
  { id: "intelligence", label: "Intelligence" },
  { id: "vitality", label: "Vitality" },
  { id: "luck", label: "Luck" },
  { id: "armor", label: "Armor" },
  { id: "magicResistance", label: "Magic Resistance" },
  { id: "physicalPower", label: "Physical Power" },
  { id: "magicalPower", label: "Magical Power" },
  { id: "maxHp", label: "Max Health" },
  { id: "maxEnergy", label: "Max Energy" },
  { id: "energyRegen", label: "Energy Regeneration" },
  { id: "critChance", label: "Critical Strike Chance" },
  { id: "hitChance", label: "Hit Chance" },
  { id: "dodgeChance", label: "Dodge Chance" },
  { id: "initiative", label: "Initiative" },
];

const DIRECT_PASSIVE_BONUSES: DirectPassiveBonus[] = [
  "armor", "magicResistance", "physicalPower", "magicalPower", "maxHp", "maxEnergy", "energyRegen", "critChance", "hitChance", "dodgeChance", "initiative",
];

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
  origin: { x: 50, y: 50 },
  arcanist_1: { x: 50, y: 18 },
  brute_1: { x: 22, y: 72 },
  shadow_1: { x: 78, y: 72 },
};

function passiveFromTalent(talent: (typeof TALENTS)[number]): Pick<TalentDraftNode, "passiveBonus" | "passiveAmount"> {
  const stats = talent.combat?.passive?.stats;
  const stat = stats && (Object.keys(stats)[0] as StatName | undefined);
  if (stat) return { passiveBonus: stat, passiveAmount: stats[stat] ?? 0 };
  const passive = talent.combat?.passive;
  if (passive) {
    const key = DIRECT_PASSIVE_BONUSES.find((candidate) => passive[candidate] !== undefined);
    if (key) return { passiveBonus: key, passiveAmount: Number(passive[key] ?? 0) };
  }
  return { passiveBonus: "", passiveAmount: 0 };
}

function createInitialDraft(): TalentDraft {
  return {
    version: 1,
    nodes: TALENTS.map((talent) => ({
      id: talent.id,
      name: talent.name,
      description: talent.description,
      branch: talent.branch,
      kind: talent.tier <= 1 ? "class" : talent.abilityId ? "ability" : "passive",
      tier: talent.tier,
      cost: talent.cost,
      requires: [...talent.requires],
      position: INITIAL_POSITIONS[talent.id] ?? { x: 50, y: 50 },
      icon: talent.branch === "arcanist" ? "✧" : talent.branch === "shadow" ? "◈" : talent.branch === "brute" ? "◆" : "✦",
      ...passiveFromTalent(talent),
      abilityId: talent.abilityId ?? "",
      effectNotes: "",
    })),
  };
}

function isTalentDraft(value: unknown): value is TalentDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TalentDraft>;
  return candidate.version === 1 && Array.isArray(candidate.nodes) && candidate.nodes.every((node) => (
    node && typeof node.id === "string" && typeof node.name === "string" && Array.isArray(node.requires)
    && typeof node.position?.x === "number" && typeof node.position?.y === "number"
  ));
}

function loadDraft(): TalentDraft {
  try {
    const stored = window.localStorage.getItem(TALENT_DRAFT_STORAGE_KEY);
    if (!stored) return createInitialDraft();
    const parsed: unknown = JSON.parse(stored);
    return isTalentDraft(parsed) ? parsed : createInitialDraft();
  } catch {
    return createInitialDraft();
  }
}

function exportDraft(draft: TalentDraft): string {
  return JSON.stringify({
    format: "emberfall-talent-tree",
    version: draft.version,
    note: "Positions use percentages measured from the top-left of the talent canvas.",
    nodes: draft.nodes,
  }, null, 2);
}

function useModalScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, [active]);
}

export function TalentDevtoolAccessDialog({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useModalScrollLock(true);

  useEffect(() => {
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code !== DEVTOOL_CODE) {
      setError("Wrong access code.");
      setCode("");
      inputRef.current?.focus();
      return;
    }
    onUnlock();
  };

  return (
    <div className="devtool-gate-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="devtool-gate" role="dialog" aria-modal="true" aria-labelledby="devtool-access-title">
        <button type="button" className="devtool-close" onClick={onClose} aria-label="Close"><X size={17} /></button>
        <span className="devtool-gate-icon"><LockKeyhole size={22} /></span>
        <p className="eyebrow">Restricted Tool</p>
        <h2 id="devtool-access-title">Talent Editor</h2>
        <p>Enter the developer code to continue.</p>
        <form onSubmit={submit}>
          <label htmlFor="devtool-code">Access code</label>
          <input ref={inputRef} id="devtool-code" type="password" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} autoComplete="off" />
          {error && <small className="devtool-gate-error" role="alert">{error}</small>}
          <button type="submit" className="primary-button" disabled={!code}>Unlock editor</button>
        </form>
      </section>
    </div>
  );
}

export function TalentDevtool({ onExit }: { onExit: () => void }) {
  const [draft, setDraft] = useState<TalentDraft>(loadDraft);
  const [selectedId, setSelectedId] = useState(() => loadDraft().nodes[0]?.id ?? "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Draft saved locally");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const selected = draft.nodes.find((node) => node.id === selectedId) ?? draft.nodes[0];

  useEffect(() => {
    window.localStorage.setItem(TALENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    const scroller = canvasScrollRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
  }, []);

  useEffect(() => { setDeleteArmed(false); }, [selectedId]);

  const connections = useMemo(() => draft.nodes.flatMap((node) => node.requires.map((parentId) => {
    const parent = draft.nodes.find((candidate) => candidate.id === parentId);
    return parent ? { id: `${parent.id}-${node.id}`, from: parent.position, to: node.position } : null;
  })).filter((connection): connection is NonNullable<typeof connection> => Boolean(connection)), [draft.nodes]);

  const updateSelected = (patch: Partial<TalentDraftNode>) => {
    if (!selected) return;
    setDraft((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === selected.id ? { ...node, ...patch } : node) }));
  };

  const addNode = () => {
    const nextNumber = Math.max(0, ...draft.nodes.map((node) => Number(node.id.match(/talent_(\d+)/)?.[1] ?? 0))) + 1;
    const id = `talent_${nextNumber}`;
    const parent = selected ?? draft.nodes[0];
    const node: TalentDraftNode = {
      id,
      name: "New Talent",
      description: "Describe what this talent does for the player.",
      branch: parent?.branch === "core" ? "brute" : parent?.branch ?? "brute",
      kind: "passive",
      tier: Math.max(1, (parent?.tier ?? 0) + 1),
      cost: 1,
      requires: parent ? [parent.id] : [],
      position: { x: Math.min(90, (parent?.position.x ?? 50) + 8), y: Math.min(90, (parent?.position.y ?? 50) + 16) },
      icon: "✦",
      passiveBonus: "",
      passiveAmount: 0,
      abilityId: "",
      effectNotes: "",
    };
    setDraft((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedId(id);
    setMessage("Talent created");
  };

  const deleteSelected = () => {
    if (!selected || selected.id === "origin") return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    setDraft((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== selected.id).map((node) => ({ ...node, requires: node.requires.filter((id) => id !== selected.id) })),
    }));
    setSelectedId("origin");
    setDeleteArmed(false);
    setMessage("Talent deleted");
  };

  const toggleRequirement = (requirementId: string) => {
    if (!selected || requirementId === selected.id) return;
    const requires = selected.requires.includes(requirementId)
      ? selected.requires.filter((id) => id !== requirementId)
      : [...selected.requires, requirementId];
    updateSelected({ requires });
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(7, Math.min(93, ((clientY - rect.top) / rect.height) * 100));
    setDraft((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === draggingId ? { ...node, position: { x, y } } : node) }));
  };

  const saveDraft = () => {
    window.localStorage.setItem(TALENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setMessage("Draft saved locally");
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(exportDraft(draft));
      setMessage("JSON copied — paste it into Codex");
    } catch {
      setMessage("Clipboard access was blocked. Use Export JSON instead.");
    }
  };

  const downloadDraft = () => {
    const url = URL.createObjectURL(new Blob([exportDraft(draft)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "emberfall-talents.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON exported");
  };

  return (
    <section className="talent-devtool-page">
      <header className="talent-devtool-header">
        <div><p className="eyebrow"><Wrench size={13} /> Developer Tool</p><h1>Talent Editor</h1><p>Place nodes, define their effects, and connect the paths players can follow.</p></div>
        <div className="talent-devtool-actions">
          <span aria-live="polite">{message}</span>
          <button type="button" onClick={saveDraft}><Save size={15} /> Save</button>
          <button type="button" onClick={copyDraft}><Copy size={15} /> Copy for Codex</button>
          <button type="button" onClick={downloadDraft}><Download size={15} /> Export JSON</button>
          <button type="button" className="devtool-exit" onClick={onExit}><X size={15} /> Exit</button>
        </div>
      </header>

      <div className="talent-devtool-layout">
        <div className="talent-canvas-shell">
          <div className="talent-canvas-toolbar">
            <span><Grip size={15} /> Drag talents to place them</span>
            <button type="button" onClick={addNode}><Plus size={15} /> Add talent</button>
          </div>
          <div ref={canvasScrollRef} className="talent-canvas-scroll">
            <div
              ref={canvasRef}
              className="talent-dev-canvas"
              onPointerMove={(event) => updateDragPosition(event.clientX, event.clientY)}
              onPointerUp={() => setDraggingId(null)}
              onPointerCancel={() => setDraggingId(null)}
            >
              <svg className="talent-connection-layer" aria-hidden="true">
                {connections.map((connection) => <line key={connection.id} x1={`${connection.from.x}%`} y1={`${connection.from.y}%`} x2={`${connection.to.x}%`} y2={`${connection.to.y}%`} />)}
              </svg>
              {draft.nodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  className={`talent-dev-node ${node.branch} ${selected?.id === node.id ? "selected" : ""}`}
                  style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    canvasRef.current?.setPointerCapture(event.pointerId);
                    setSelectedId(node.id);
                    setDraggingId(node.id);
                  }}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span>{node.icon || "✦"}</span>
                  <strong>{node.name}</strong>
                  <small>{node.kind} · tier {node.tier}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selected && (
          <aside className="talent-inspector">
            <div className="talent-inspector-title"><div><p className="eyebrow">Selected Talent</p><h2>{selected.name}</h2></div><span>{selected.id}</span></div>
            <div className="talent-form-grid two-columns">
              <label><span>Name</span><input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></label>
              <label><span>Icon</span><input value={selected.icon} maxLength={3} onChange={(event) => updateSelected({ icon: event.target.value })} /></label>
            </div>
            <label className="talent-form-field"><span>Player-facing description</span><textarea rows={3} value={selected.description} onChange={(event) => updateSelected({ description: event.target.value })} /></label>
            <div className="talent-form-grid two-columns">
              <label><span>Branch</span><select value={selected.branch} onChange={(event) => updateSelected({ branch: event.target.value as TalentBranch })}>{BRANCH_OPTIONS.map((branch) => <option key={branch.id} value={branch.id}>{branch.label}</option>)}</select></label>
              <label><span>Talent type</span><select value={selected.kind} onChange={(event) => updateSelected({ kind: event.target.value as TalentNodeKind })}><option value="class">Class node</option><option value="passive">Passive</option><option value="ability">Ability</option></select></label>
              <label><span>Tier</span><input type="number" min={0} value={selected.tier} onChange={(event) => updateSelected({ tier: Math.max(0, Number(event.target.value)) })} /></label>
              <label><span>Point cost</span><input type="number" min={0} value={selected.cost} onChange={(event) => updateSelected({ cost: Math.max(0, Number(event.target.value)) })} /></label>
            </div>

            <div className="talent-inspector-section">
              <h3><Sparkles size={15} /> Effect</h3>
              {selected.kind === "ability" ? (
                <label className="talent-form-field"><span>Ability ID</span><input value={selected.abilityId} placeholder="e.g. crushingBlow" onChange={(event) => updateSelected({ abilityId: event.target.value })} /></label>
              ) : (
                <div className="talent-form-grid passive-row">
                  <label><span>Passive bonus</span><select value={selected.passiveBonus} onChange={(event) => updateSelected({ passiveBonus: event.target.value as PassiveBonus | "" })}><option value="">No direct stat</option>{PASSIVE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                  <label><span>Amount</span><input type="number" step="0.01" value={selected.passiveAmount} onChange={(event) => updateSelected({ passiveAmount: Number(event.target.value) })} /></label>
                </div>
              )}
              <label className="talent-form-field"><span>Effect and proc notes</span><textarea rows={4} value={selected.effectNotes} placeholder="Example: 20% chance on hit to apply Burn for 3 turns." onChange={(event) => updateSelected({ effectNotes: event.target.value })} /></label>
            </div>

            <div className="talent-inspector-section">
              <h3><Link2 size={15} /> Connections</h3>
              <p>Select every talent that must be unlocked before this one.</p>
              <div className="talent-requirement-list">
                {draft.nodes.filter((node) => node.id !== selected.id).map((node) => (
                  <label key={node.id}>
                    <input type="checkbox" checked={selected.requires.includes(node.id)} onChange={() => toggleRequirement(node.id)} />
                    <span className={`branch-dot ${node.branch}`} />
                    <strong>{node.name}</strong>
                    <small>{node.id}</small>
                  </label>
                ))}
              </div>
            </div>

            {selected.id !== "origin" && <button type="button" className={`talent-delete ${deleteArmed ? "armed" : ""}`} onClick={deleteSelected}><Trash2 size={15} /> {deleteArmed ? "Click again to delete" : "Delete talent"}</button>}
          </aside>
        )}
      </div>
    </section>
  );
}
