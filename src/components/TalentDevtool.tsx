import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Circle, Copy, Download, Grid3X3, Hand, Link2, LockKeyhole, Maximize2, Minus, Plus, Save, Search, Sparkles, Square, Trash2, Wrench, X,
} from "lucide-react";
import { ABILITIES, TALENTS, TALENT_TREE_CANVAS } from "../game/data";
import { STATUS_EFFECTS } from "../game/statusEffects";
import type { AbilityRange, StatName, TalentBranch } from "../game/types";

const TALENT_DRAFT_STORAGE_KEY = "emberfall.talent-devtool.v1";
const TALENT_SNAP_STORAGE_KEY = "emberfall.talent-devtool.snap-to-grid";
const DEVTOOL_CODE = "bajs321";
const DEFAULT_CANVAS_WIDTH = 2200;
const DEFAULT_CANVAS_HEIGHT = 1500;
// Preserve the editor's original 1.25% grid, expressed as fixed world units so
// expanding the canvas never changes the spacing beneath existing nodes.
const SNAP_GRID_X = DEFAULT_CANVAS_WIDTH * 0.0125;
const SNAP_GRID_Y = DEFAULT_CANVAS_HEIGHT * 0.0125;
const CANVAS_EDGE_ROOM = 260;
const CANVAS_GROW_WIDTH = SNAP_GRID_X * 22;
const CANVAS_GROW_HEIGHT = SNAP_GRID_Y * 24;
const MIN_CANVAS_ZOOM = 0.15;
const MAX_CANVAS_ZOOM = 2;
const DEFAULT_CANVAS_ZOOM = 0.65;
const CANVAS_ZOOM_STEP = 0.1;

type TalentNodeKind = "class" | "passive" | "ability";
type TalentNodeShape = "circle" | "square";
type PassiveBonus = StatName | "armor" | "magicResistance" | "physicalPower" | "magicalPower" | "maxHp" | "maxEnergy" | "energyRegen" | "critChance" | "hitChance" | "dodgeChance" | "initiative";
type DirectPassiveBonus = Exclude<PassiveBonus, StatName>;

interface TalentPassiveBonus {
  id: string;
  bonus: PassiveBonus;
  amount: number;
}

interface TalentDraftNode {
  id: string;
  name: string;
  description: string;
  branch: TalentBranch;
  kind: TalentNodeKind;
  cost: number;
  requires: string[];
  position: { x: number; y: number };
  icon: string;
  shape: TalentNodeShape;
  passiveBonuses: TalentPassiveBonus[];
  abilityId: string;
  abilityEnergyCost: number;
  abilityCooldownTurns: number;
  abilityRange: AbilityRange;
  effectNotes: string;
}

interface LegacyTalentDraftNode extends Omit<TalentDraftNode, "shape" | "passiveBonuses" | "abilityEnergyCost" | "abilityCooldownTurns" | "abilityRange"> {
  tier?: number;
  shape?: TalentNodeShape;
  passiveBonuses?: TalentPassiveBonus[];
  abilityEnergyCost?: number;
  abilityCooldownTurns?: number;
  abilityRange?: AbilityRange;
  passiveBonus?: PassiveBonus | "";
  passiveAmount?: number;
}

interface TalentDraft {
  version: 1;
  sourceSignature: string;
  layoutSignature: string;
  canvas: { width: number; height: number };
  grid: { x: number; y: number };
  nodes: TalentDraftNode[];
}

const BRANCH_OPTIONS: Array<{ id: TalentBranch; label: string }> = [
  { id: "core", label: "Core" },
  { id: "brute", label: "Brute" },
  { id: "shadow", label: "Shadow" },
  { id: "arcanist", label: "Arcanist" },
  { id: "cultist", label: "Cultist" },
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
const PERCENT_PASSIVE_BONUSES = new Set<PassiveBonus>(["critChance", "hitChance", "dodgeChance"]);

const STATUS_LIBRARY = Object.values(STATUS_EFFECTS).sort((left, right) => left.name.localeCompare(right.name));

function passiveBonusesFromTalent(talent: (typeof TALENTS)[number]): TalentPassiveBonus[] {
  const bonuses: TalentPassiveBonus[] = [];
  const stats = talent.combat?.passive?.stats;
  if (stats) {
    (Object.keys(stats) as StatName[]).forEach((stat) => {
      const amount = stats[stat];
      if (amount !== undefined) bonuses.push({ id: `${talent.id}-${stat}`, bonus: stat, amount });
    });
  }
  const passive = talent.combat?.passive;
  if (passive) {
    DIRECT_PASSIVE_BONUSES.forEach((bonus) => {
      const amount = passive[bonus];
      if (amount !== undefined) bonuses.push({ id: `${talent.id}-${bonus}`, bonus, amount: Number(amount) * (PERCENT_PASSIVE_BONUSES.has(bonus) ? 100 : 1) });
    });
  }
  return bonuses;
}

function abilityNumbers(abilityId: string, effectNotes: string, energyCost?: number, cooldownTurns?: number): { energyCost: number; cooldownTurns: number } {
  const ability = abilityId ? ABILITIES[abilityId] : undefined;
  const notedEnergy = effectNotes.match(/cost:\s*(\d+)\s*energy/i)?.[1];
  const notedCooldown = effectNotes.match(/cooldown:\s*(\d+)\s*turn/i)?.[1];
  return {
    energyCost: Math.max(0, Math.round(Number(energyCost ?? ability?.energyCost ?? notedEnergy ?? 0))),
    cooldownTurns: Math.max(0, Math.round(Number(cooldownTurns ?? ability?.cooldownTurns ?? notedCooldown ?? 0))),
  };
}

function createGameDataNodes(): TalentDraftNode[] {
  return TALENTS.map((talent) => {
    const ability = talent.abilityId ? ABILITIES[talent.abilityId] : undefined;
    return {
      id: talent.id,
      name: talent.name,
      description: talent.description,
      branch: talent.branch,
      kind: talent.kind,
      cost: talent.cost,
      requires: [...talent.requires],
      position: { ...talent.position },
      icon: talent.icon,
      shape: talent.shape,
      passiveBonuses: passiveBonusesFromTalent(talent),
      abilityId: talent.abilityId ?? "",
      abilityEnergyCost: talent.abilityEnergyCost ?? ability?.energyCost ?? 0,
      abilityCooldownTurns: talent.abilityCooldownTurns ?? ability?.cooldownTurns ?? 0,
      abilityRange: talent.abilityRange ?? ability?.range ?? "melee",
      effectNotes: talent.effectNotes ?? "",
    };
  });
}

function getGameDataSignature(nodes: TalentDraftNode[]): string {
  const content = JSON.stringify(nodes.map((node) => ({
    id: node.id,
    name: node.name,
    description: node.description,
    branch: node.branch,
    kind: node.kind,
    cost: node.cost,
    passiveBonuses: node.passiveBonuses,
    abilityId: node.abilityId,
    abilityEnergyCost: node.abilityEnergyCost,
    abilityCooldownTurns: node.abilityCooldownTurns,
    abilityRange: node.abilityRange,
    effectNotes: node.effectNotes,
  })));
  let hash = 2166136261;
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function getGameLayoutSignature(nodes: TalentDraftNode[]): string {
  const layout = JSON.stringify({
    canvas: TALENT_TREE_CANVAS,
    nodes: nodes.map((node) => ({
      id: node.id,
      requires: node.requires,
      position: node.position,
      icon: node.icon,
      shape: node.shape,
    })),
  });
  let hash = 2166136261;
  for (let index = 0; index < layout.length; index += 1) {
    hash ^= layout.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function createInitialDraft(): TalentDraft {
  const nodes = createGameDataNodes();
  return ensureCanvasRoom({
    version: 1,
    sourceSignature: getGameDataSignature(nodes),
    layoutSignature: getGameLayoutSignature(nodes),
    canvas: { width: TALENT_TREE_CANVAS.width, height: TALENT_TREE_CANVAS.height },
    grid: { x: SNAP_GRID_X, y: SNAP_GRID_Y },
    nodes,
  });
}

function isStoredTalentDraft(value: unknown): value is { version: 1; sourceSignature?: string; layoutSignature?: string; canvas?: { width: number; height: number }; grid?: { x: number; y: number }; nodes: LegacyTalentDraftNode[] } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TalentDraft>;
  return candidate.version === 1 && Array.isArray(candidate.nodes) && candidate.nodes.every((node) => (
    node && typeof node.id === "string" && typeof node.name === "string" && Array.isArray(node.requires)
    && typeof node.position?.x === "number" && typeof node.position?.y === "number"
  ));
}

function normalizeDraft(draft: { version: 1; sourceSignature?: string; layoutSignature?: string; canvas?: { width: number; height: number }; grid?: { x: number; y: number }; nodes: LegacyTalentDraftNode[] }): TalentDraft {
  const canvas = {
    width: Math.max(DEFAULT_CANVAS_WIDTH, Number(draft.canvas?.width) || DEFAULT_CANVAS_WIDTH),
    height: Math.max(DEFAULT_CANVAS_HEIGHT, Number(draft.canvas?.height) || DEFAULT_CANVAS_HEIGHT),
  };
  const repairChangedGrid = Boolean(draft.canvas && !draft.grid);
  return ensureCanvasRoom({
    version: 1,
    sourceSignature: draft.sourceSignature ?? "",
    layoutSignature: draft.layoutSignature ?? "",
    canvas,
    grid: { x: SNAP_GRID_X, y: SNAP_GRID_Y },
    nodes: draft.nodes.map((node) => {
      const numbers = abilityNumbers(node.abilityId ?? "", node.effectNotes ?? "", node.abilityEnergyCost, node.abilityCooldownTurns);
      const migratedBonus = node.passiveBonus
        ? [{ id: `${node.id}-${node.passiveBonus}`, bonus: node.passiveBonus, amount: Number(node.passiveAmount ?? 0) }]
        : [];
      return {
        id: node.id,
        name: node.name,
        description: node.description,
        branch: node.branch,
        kind: node.kind,
        cost: Number(node.cost) || 0,
        requires: [...node.requires],
        position: repairChangedGrid ? {
          x: Math.round((node.position.x / 100 * canvas.width) / SNAP_GRID_X) * SNAP_GRID_X / canvas.width * 100,
          y: Math.round((node.position.y / 100 * canvas.height) / SNAP_GRID_Y) * SNAP_GRID_Y / canvas.height * 100,
        } : node.position,
        icon: node.icon ?? "✦",
        shape: node.shape === "circle" ? "circle" : "square",
        passiveBonuses: Array.isArray(node.passiveBonuses) ? node.passiveBonuses : migratedBonus,
        abilityId: node.abilityId ?? "",
        abilityEnergyCost: numbers.energyCost,
        abilityCooldownTurns: numbers.cooldownTurns,
        abilityRange: node.abilityRange === "ranged" || node.abilityRange === "melee" ? node.abilityRange : ABILITIES[node.abilityId ?? ""]?.range ?? "melee",
        effectNotes: node.effectNotes ?? "",
      };
    }),
  });
}

function syncDraftWithGameData(draft: TalentDraft): TalentDraft {
  const gameNodes = createGameDataNodes();
  const sourceSignature = getGameDataSignature(gameNodes);
  const layoutSignature = getGameLayoutSignature(gameNodes);
  const contentChanged = draft.sourceSignature !== sourceSignature;
  const layoutChanged = draft.layoutSignature !== layoutSignature;
  if (!contentChanged && !layoutChanged) return draft;

  const gameNodesById = new Map(gameNodes.map((node) => [node.id, node]));
  const draftNodeIds = new Set(draft.nodes.map((node) => node.id));
  const syncedNodes = draft.nodes.map((node) => {
    const gameNode = gameNodesById.get(node.id);
    if (!gameNode) return node;
    return {
      ...node,
      ...(contentChanged ? {
        name: gameNode.name,
        description: gameNode.description,
        branch: gameNode.branch,
        kind: gameNode.kind,
        cost: gameNode.cost,
        passiveBonuses: gameNode.passiveBonuses,
        abilityId: gameNode.abilityId,
        abilityEnergyCost: gameNode.abilityEnergyCost,
        abilityCooldownTurns: gameNode.abilityCooldownTurns,
        abilityRange: gameNode.abilityRange,
        effectNotes: gameNode.effectNotes,
      } : {}),
      ...(layoutChanged ? {
        requires: gameNode.requires,
        position: gameNode.position,
        icon: gameNode.icon,
        shape: gameNode.shape,
      } : {}),
    };
  });

  gameNodes.forEach((node) => {
    if (!draftNodeIds.has(node.id)) syncedNodes.push(node);
  });

  return ensureCanvasRoom({
    ...draft,
    sourceSignature,
    layoutSignature,
    canvas: layoutChanged ? { ...TALENT_TREE_CANVAS } : draft.canvas,
    nodes: syncedNodes,
  });
}

function ensureCanvasRoom(draft: TalentDraft): TalentDraft {
  if (draft.nodes.length === 0) return draft;
  const width = draft.canvas.width;
  const height = draft.canvas.height;
  const absolute = draft.nodes.map((node) => ({ node, x: node.position.x / 100 * width, y: node.position.y / 100 * height }));
  const minX = Math.min(...absolute.map((item) => item.x));
  const maxX = Math.max(...absolute.map((item) => item.x));
  const minY = Math.min(...absolute.map((item) => item.y));
  const maxY = Math.max(...absolute.map((item) => item.y));
  const addLeft = minX < CANVAS_EDGE_ROOM ? CANVAS_GROW_WIDTH : 0;
  const addRight = maxX > width - CANVAS_EDGE_ROOM ? CANVAS_GROW_WIDTH : 0;
  const addTop = minY < CANVAS_EDGE_ROOM ? CANVAS_GROW_HEIGHT : 0;
  const addBottom = maxY > height - CANVAS_EDGE_ROOM ? CANVAS_GROW_HEIGHT : 0;
  if (!addLeft && !addRight && !addTop && !addBottom) return draft;
  const nextWidth = width + addLeft + addRight;
  const nextHeight = height + addTop + addBottom;
  return {
    ...draft,
    canvas: { width: nextWidth, height: nextHeight },
    nodes: absolute.map(({ node, x, y }) => ({
      ...node,
      position: {
        x: Math.round((x + addLeft) / nextWidth * 100000) / 1000,
        y: Math.round((y + addTop) / nextHeight * 100000) / 1000,
      },
    })),
  };
}

function normalizeUndirectedConnections(draft: TalentDraft): TalentDraft {
  const nodeIds = new Set(draft.nodes.map((node) => node.id));
  const seen = new Set<string>();
  return {
    ...draft,
    nodes: draft.nodes.map((node) => ({
      ...node,
      requires: node.requires.filter((connectionId) => {
        if (connectionId === node.id || !nodeIds.has(connectionId)) return false;
        const edgeId = [node.id, connectionId].sort().join("::");
        if (seen.has(edgeId)) return false;
        seen.add(edgeId);
        return true;
      }),
    })),
  };
}

function loadDraft(): TalentDraft {
  try {
    const stored = window.localStorage.getItem(TALENT_DRAFT_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    const loaded = isStoredTalentDraft(parsed) ? syncDraftWithGameData(normalizeDraft(parsed)) : createInitialDraft();
    return normalizeUndirectedConnections(loaded);
  } catch {
    return createInitialDraft();
  }
}

function loadSnapPreference(): boolean {
  return window.localStorage.getItem(TALENT_SNAP_STORAGE_KEY) !== "false";
}

function clampCanvasZoom(zoom: number): number {
  return Math.max(MIN_CANVAS_ZOOM, Math.min(MAX_CANVAS_ZOOM, Math.round(zoom * 100) / 100));
}

function exportDraft(draft: TalentDraft): string {
  return JSON.stringify({
    format: "emberfall-talent-tree",
    version: draft.version,
    note: "Positions use percentages measured from the top-left of the talent canvas. Canvas dimensions expand automatically.",
    canvas: draft.canvas,
    grid: draft.grid,
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
  const branchCounts = useMemo(() => ({
    shadow: draft.nodes.filter((node) => node.branch === "shadow").length,
    arcanist: draft.nodes.filter((node) => node.branch === "arcanist").length,
    brute: draft.nodes.filter((node) => node.branch === "brute").length,
    cultist: draft.nodes.filter((node) => node.branch === "cultist").length,
  }), [draft.nodes]);
  const [selectedId, setSelectedId] = useState("origin");
  const [snapToGrid, setSnapToGrid] = useState(loadSnapPreference);
  const [canvasZoom, setCanvasZoom] = useState(DEFAULT_CANVAS_ZOOM);
  const [isFitView, setIsFitView] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");
  const [message, setMessage] = useState("Draft saved locally");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const draggingIdRef = useRef<string | null>(null);
  const zoomRef = useRef(DEFAULT_CANVAS_ZOOM);
  const panRef = useRef<{ pointerId: number; x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const selected = draft.nodes.find((node) => node.id === selectedId) ?? draft.nodes[0];

  useEffect(() => {
    window.localStorage.setItem(TALENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(TALENT_SNAP_STORAGE_KEY, String(snapToGrid));
  }, [snapToGrid]);

  useEffect(() => {
    const scroller = canvasScrollRef.current;
    if (!scroller) return;
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
      scroller.scrollTop = Math.max(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => { setDeleteArmed(false); }, [selectedId]);

  const connections = useMemo(() => draft.nodes.flatMap((node) => node.requires.map((parentId) => {
    const parent = draft.nodes.find((candidate) => candidate.id === parentId);
    return parent ? { id: `${parent.id}-${node.id}`, from: parent.position, to: node.position } : null;
  })).filter((connection): connection is NonNullable<typeof connection> => Boolean(connection)), [draft.nodes]);
  const visibleStatuses = useMemo(() => {
    const query = statusQuery.trim().toLocaleLowerCase();
    if (!query) return STATUS_LIBRARY;
    return STATUS_LIBRARY.filter((status) => `${status.name} ${status.kind} ${status.description}`.toLocaleLowerCase().includes(query));
  }, [statusQuery]);

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
      cost: 1,
      requires: parent ? [parent.id] : [],
      position: {
        x: Math.round(((parent?.position.x ?? 50) / 100 * draft.canvas.width + SNAP_GRID_X * 6) / SNAP_GRID_X) * SNAP_GRID_X / draft.canvas.width * 100,
        y: Math.round(((parent?.position.y ?? 50) / 100 * draft.canvas.height + SNAP_GRID_Y * 8) / SNAP_GRID_Y) * SNAP_GRID_Y / draft.canvas.height * 100,
      },
      icon: "✦",
      shape: "circle",
      passiveBonuses: [],
      abilityId: "",
      abilityEnergyCost: 0,
      abilityCooldownTurns: 0,
      abilityRange: "melee",
      effectNotes: "",
    };
    setDraft((current) => ensureCanvasRoom({ ...current, nodes: [...current.nodes, node] }));
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
    const reverse = draft.nodes.find((node) => node.id === requirementId);
    const connected = selected.requires.includes(requirementId) || Boolean(reverse?.requires.includes(selected.id));
    setDraft((current) => ({
      ...current,
      nodes: current.nodes.map((node) => {
        if (node.id === selected.id) {
          const withoutConnection = node.requires.filter((id) => id !== requirementId);
          return { ...node, requires: connected ? withoutConnection : [...withoutConnection, requirementId] };
        }
        if (node.id === requirementId) return { ...node, requires: node.requires.filter((id) => id !== selected.id) };
        return node;
      }),
    }));
  };

  const addPassiveBonus = () => {
    if (!selected) return;
    const usedBonuses = new Set(selected.passiveBonuses.map((item) => item.bonus));
    const bonus = PASSIVE_OPTIONS.find((option) => !usedBonuses.has(option.id))?.id ?? "strength";
    const nextNumber = Math.max(0, ...selected.passiveBonuses.map((item) => Number(item.id.match(/-(\d+)$/)?.[1] ?? 0))) + 1;
    updateSelected({ passiveBonuses: [...selected.passiveBonuses, { id: `${selected.id}-bonus-${nextNumber}`, bonus, amount: 1 }] });
  };

  const updatePassiveBonus = (id: string, patch: Partial<Omit<TalentPassiveBonus, "id">>) => {
    if (!selected) return;
    updateSelected({ passiveBonuses: selected.passiveBonuses.map((bonus) => bonus.id === id ? { ...bonus, ...patch } : bonus) });
  };

  const removePassiveBonus = (id: string) => {
    if (!selected) return;
    updateSelected({ passiveBonuses: selected.passiveBonuses.filter((bonus) => bonus.id !== id) });
  };

  const toggleSnapToGrid = () => {
    setSnapToGrid((current) => {
      setMessage(`Snap to grid ${current ? "disabled" : "enabled"}`);
      return !current;
    });
  };

  const zoomCanvasTo = (requestedZoom: number, anchorClientX?: number, anchorClientY?: number) => {
    const scroller = canvasScrollRef.current;
    const canvas = canvasRef.current;
    const nextZoom = clampCanvasZoom(requestedZoom);
    if (!scroller || !canvas || nextZoom === zoomRef.current) return;
    const rect = scroller.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const resolvedClientX = anchorClientX ?? rect.left + scroller.clientWidth / 2;
    const resolvedClientY = anchorClientY ?? rect.top + scroller.clientHeight / 2;
    const anchorX = resolvedClientX - rect.left;
    const anchorY = resolvedClientY - rect.top;
    const worldX = (resolvedClientX - canvasRect.left) / zoomRef.current;
    const worldY = (resolvedClientY - canvasRect.top) / zoomRef.current;
    zoomRef.current = nextZoom;
    setIsFitView(false);
    setCanvasZoom(nextZoom);
    window.requestAnimationFrame(() => {
      scroller.scrollLeft = worldX * nextZoom - anchorX;
      scroller.scrollTop = worldY * nextZoom - anchorY;
    });
  };

  const fitCanvas = () => {
    const scroller = canvasScrollRef.current;
    if (!scroller) return;
    const nextZoom = clampCanvasZoom(Math.min(scroller.clientWidth / draft.canvas.width, scroller.clientHeight / draft.canvas.height) * 0.94);
    zoomRef.current = nextZoom;
    setIsFitView(true);
    setCanvasZoom(nextZoom);
    window.requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
      scroller.scrollTop = Math.max(0, (scroller.scrollHeight - scroller.clientHeight) / 2);
    });
    setMessage("Talent tree fitted to view");
  };

  const beginCanvasPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIdRef.current || (event.pointerType === "mouse" && event.button !== 0 && event.button !== 1)) return;
    const scroller = canvasScrollRef.current;
    if (!scroller) return;
    event.preventDefault();
    canvasRef.current?.setPointerCapture(event.pointerId);
    panRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: scroller.scrollLeft, scrollTop: scroller.scrollTop };
    setIsPanning(true);
  };

  const moveCanvasPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const scroller = canvasScrollRef.current;
    if (pan && pan.pointerId === event.pointerId && scroller) {
      event.preventDefault();
      scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
      scroller.scrollTop = pan.scrollTop - (event.clientY - pan.y);
      return;
    }
    updateDragPosition(event.clientX, event.clientY);
  };

  const endCanvasPointer = (pointerId: number) => {
    if (panRef.current?.pointerId === pointerId) {
      panRef.current = null;
      setIsPanning(false);
    }
    draggingIdRef.current = null;
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    const draggingId = draggingIdRef.current;
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / rect.width * draft.canvas.width;
    const rawY = (clientY - rect.top) / rect.height * draft.canvas.height;
    const absoluteX = Math.max(0, Math.min(draft.canvas.width, snapToGrid ? Math.round(rawX / SNAP_GRID_X) * SNAP_GRID_X : Math.round(rawX)));
    const absoluteY = Math.max(0, Math.min(draft.canvas.height, snapToGrid ? Math.round(rawY / SNAP_GRID_Y) * SNAP_GRID_Y : Math.round(rawY)));
    const positioned: TalentDraft = {
      ...draft,
      nodes: draft.nodes.map((node) => node.id === draggingId ? {
        ...node,
        position: { x: absoluteX / draft.canvas.width * 100, y: absoluteY / draft.canvas.height * 100 },
      } : node),
    };
    const expanded = ensureCanvasRoom(positioned);
    const addedLeft = absoluteX < CANVAS_EDGE_ROOM && expanded.canvas.width > draft.canvas.width;
    const addedTop = absoluteY < CANVAS_EDGE_ROOM && expanded.canvas.height > draft.canvas.height;
    setIsFitView(false);
    setDraft(expanded);
    if (addedLeft || addedTop) {
      window.requestAnimationFrame(() => {
        const scroller = canvasScrollRef.current;
        if (!scroller) return;
        if (addedLeft) scroller.scrollLeft += CANVAS_GROW_WIDTH * zoomRef.current;
        if (addedTop) scroller.scrollTop += CANVAS_GROW_HEIGHT * zoomRef.current;
      });
    }
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
        <div className="talent-devtool-heading">
          <p className="eyebrow"><Wrench size={13} /> Developer Tool</p>
          <h1>Talent Editor</h1>
          <div className="talent-branch-counters" aria-label="Talent nodes by branch">
            <span className="shadow"><small>Shadow</small><strong>{branchCounts.shadow}</strong></span>
            <span className="arcanist"><small>Arcanist</small><strong>{branchCounts.arcanist}</strong></span>
            <span className="brute"><small>Brute</small><strong>{branchCounts.brute}</strong></span>
            <span className="cultist"><small>Cultist</small><strong>{branchCounts.cultist}</strong></span>
          </div>
          <p>Place nodes, define their effects, and connect the paths players can follow.</p>
        </div>
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
            <span><Hand size={15} /> Drag empty space to pan</span>
            <div className="talent-canvas-toolbar-actions">
              <div className="talent-zoom-controls" aria-label="Talent tree zoom controls">
                <button type="button" onClick={() => zoomCanvasTo(canvasZoom - CANVAS_ZOOM_STEP)} aria-label="Zoom out"><Minus size={14} /></button>
                <output aria-label="Current zoom">{Math.round(canvasZoom * 100)}%</output>
                <button type="button" onClick={() => zoomCanvasTo(canvasZoom + CANVAS_ZOOM_STEP)} aria-label="Zoom in"><Plus size={14} /></button>
                <button type="button" onClick={fitCanvas} aria-label="Fit talent tree to view"><Maximize2 size={14} /><span>Fit</span></button>
              </div>
              <button type="button" className={snapToGrid ? "active" : ""} aria-pressed={snapToGrid} onClick={toggleSnapToGrid}><Grid3X3 size={15} /> Snap to grid <small>{snapToGrid ? "On" : "Off"}</small></button>
              <button type="button" onClick={addNode}><Plus size={15} /> Add talent</button>
            </div>
          </div>
          <div
            ref={canvasScrollRef}
            className={isFitView ? "talent-canvas-scroll fit-view" : "talent-canvas-scroll"}
            onWheel={(event) => {
              if (!event.ctrlKey && !event.metaKey) return;
              event.preventDefault();
              zoomCanvasTo(canvasZoom - Math.sign(event.deltaY) * CANVAS_ZOOM_STEP, event.clientX, event.clientY);
            }}
          >
            <div className="talent-canvas-zoom-surface" style={{ width: draft.canvas.width * canvasZoom, height: draft.canvas.height * canvasZoom }}>
              <div
                ref={canvasRef}
                className={`talent-dev-canvas ${isPanning ? "panning" : ""}`}
                style={{ width: draft.canvas.width, height: draft.canvas.height, transform: `scale(${canvasZoom})` }}
                onPointerDown={beginCanvasPan}
                onPointerMove={moveCanvasPointer}
                onPointerUp={(event) => endCanvasPointer(event.pointerId)}
                onPointerCancel={(event) => endCanvasPointer(event.pointerId)}
                onLostPointerCapture={(event) => endCanvasPointer(event.pointerId)}
                onContextMenu={(event) => event.preventDefault()}
              >
              <svg className="talent-connection-layer" aria-hidden="true">
                {connections.map((connection) => <line key={connection.id} x1={`${connection.from.x}%`} y1={`${connection.from.y}%`} x2={`${connection.to.x}%`} y2={`${connection.to.y}%`} />)}
              </svg>
              {draft.nodes.map((node) => (
                <button
                  type="button"
                  key={node.id}
                  className={`talent-dev-node ${node.branch} ${node.shape} ${selected?.id === node.id ? "selected" : ""}`}
                  style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
                  onPointerDown={(event) => {
                    if (event.pointerType === "mouse" && event.button !== 0) return;
                    event.preventDefault();
                    canvasRef.current?.setPointerCapture(event.pointerId);
                    setSelectedId(node.id);
                    draggingIdRef.current = node.id;
                  }}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span>{node.icon || "✦"}</span>
                  <strong>{node.name}</strong>
                  <small>{node.kind}</small>
                </button>
              ))}
              </div>
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
              <label><span>Node shape</span><select value={selected.shape} onChange={(event) => updateSelected({ shape: event.target.value as TalentNodeShape })}><option value="circle">Circle</option><option value="square">Square</option></select></label>
              <label><span>Point cost</span><input type="number" min={0} value={selected.cost} onChange={(event) => updateSelected({ cost: Math.max(0, Number(event.target.value)) })} /></label>
            </div>

            <div className="talent-inspector-section">
              <h3><Sparkles size={15} /> Effect</h3>
              {selected.kind === "ability" ? (
                <>
                  <label className="talent-form-field"><span>Ability ID</span><input value={selected.abilityId} placeholder="e.g. crushingBlow" onChange={(event) => updateSelected({ abilityId: event.target.value })} /></label>
                  <div className="talent-form-grid two-columns">
                    <label><span>Energy cost</span><input type="number" min={0} step={1} value={selected.abilityEnergyCost} onChange={(event) => updateSelected({ abilityEnergyCost: Math.max(0, Math.round(Number(event.target.value))) })} /></label>
                    <label><span>Cooldown (turns)</span><input type="number" min={0} step={1} value={selected.abilityCooldownTurns} onChange={(event) => updateSelected({ abilityCooldownTurns: Math.max(0, Math.round(Number(event.target.value))) })} /></label>
                  </div>
                  <label className="talent-form-field"><span>Attack range</span><select value={selected.abilityRange} onChange={(event) => updateSelected({ abilityRange: event.target.value as AbilityRange })}><option value="melee">Melee</option><option value="ranged">Ranged</option></select></label>
                </>
              ) : null}
              <div className="talent-passive-heading"><span>Passive bonuses</span><button type="button" onClick={addPassiveBonus}><Plus size={13} /> Add bonus</button></div>
              {selected.passiveBonuses.length === 0 ? <p className="talent-passive-empty">No passive bonuses added.</p> : (
                <div className="talent-passive-list">
                  {selected.passiveBonuses.map((passive) => (
                    <div className="talent-passive-row" key={passive.id}>
                      <label><span>Bonus</span><select value={passive.bonus} onChange={(event) => updatePassiveBonus(passive.id, { bonus: event.target.value as PassiveBonus })}>{PASSIVE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                      <label><span>Amount</span><input type="number" step="0.01" value={passive.amount} onChange={(event) => updatePassiveBonus(passive.id, { amount: Number(event.target.value) })} /></label>
                      <button type="button" onClick={() => removePassiveBonus(passive.id)} aria-label={`Remove ${PASSIVE_OPTIONS.find((option) => option.id === passive.bonus)?.label ?? "bonus"}`}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="talent-form-field"><span>Effect and proc notes</span><textarea rows={4} value={selected.effectNotes} placeholder="Example: 20% chance on hit to apply Burn for 3 turns." onChange={(event) => updateSelected({ effectNotes: event.target.value })} /></label>
            </div>

            <div className="talent-inspector-section">
              <h3><Link2 size={15} /> Connections</h3>
              <p>Connections work both ways. Unlocking any connected talent makes this node available.</p>
              <div className="talent-requirement-list">
                {draft.nodes.filter((node) => node.id !== selected.id).map((node) => (
                  <label key={node.id}>
                    <input type="checkbox" checked={selected.requires.includes(node.id) || node.requires.includes(selected.id)} onChange={() => toggleRequirement(node.id)} />
                    <span className={`branch-dot ${node.branch}`} />
                    <strong>{node.name}</strong>
                    <small>{node.id}</small>
                  </label>
                ))}
              </div>
            </div>

            <div className="talent-inspector-section talent-status-library">
              <h3><BookOpen size={15} /> Buffs & Debuffs</h3>
              <p>Search the combat status library while designing effects.</p>
              <label className="talent-status-search"><Search size={14} /><input type="search" value={statusQuery} placeholder="Search statuses" aria-label="Search statuses" onChange={(event) => setStatusQuery(event.target.value)} /></label>
              {(["buff", "debuff"] as const).map((kind) => {
                const statuses = visibleStatuses.filter((status) => status.kind === kind);
                if (statuses.length === 0) return null;
                return (
                  <div className={`talent-status-group ${kind}`} key={kind}>
                    <strong>{kind === "buff" ? "Buffs" : "Debuffs"}</strong>
                    {statuses.map((status) => (
                      <details key={status.id}>
                        <summary><span>{kind === "buff" ? <Circle size={9} /> : <Square size={9} />}{status.name}</span><small>{status.permanent ? "Permanent" : `${status.duration} ${status.duration === 1 ? "turn" : "turns"}`}</small></summary>
                        <p>{status.description}</p>
                      </details>
                    ))}
                  </div>
                );
              })}
              {visibleStatuses.length === 0 && <p className="talent-status-empty">No statuses match that search.</p>}
            </div>

            {selected.id !== "origin" && <button type="button" className={`talent-delete ${deleteArmed ? "armed" : ""}`} onClick={deleteSelected}><Trash2 size={15} /> {deleteArmed ? "Click again to delete" : "Delete talent"}</button>}
          </aside>
        )}
      </div>
    </section>
  );
}
