import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Copy, Download, LockKeyhole, Plus, Save, Skull, Trash2, Wrench, X } from "lucide-react";
import { ADVENTURES, ADVENTURE_EVENTS, ENEMIES } from "../game/data";
import type { AdventureDefinition, AdventureEventChoice, AdventureEventDefinition, AdventureEventOutcome, AdventureStageEntry, StatName } from "../game/types";

export type DevtoolKind = "talentDevtool" | "enemyDevtool" | "eventDevtool" | "adventureDevtool";

const DEVTOOL_CODE = "bajs321";
export const ENEMY_DRAFT_STORAGE_KEY = "emberfall.enemy-devtool.v1";
export const EVENT_DRAFT_STORAGE_KEY = "emberfall.event-devtool.v1";
export const ADVENTURE_DRAFT_STORAGE_KEY = "emberfall.adventure-devtool.v1";

interface EnemyDraft {
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

interface EnemyAbilityDraft {
  id: string;
  name: string;
  energyCost: number;
  cooldownTurns: number;
  effect: string;
}

interface EnemyExchange { format: "emberfall-enemies"; version: 2; enemies: EnemyDraft[] }
interface EventExchange { format: "emberfall-events"; version: 1; events: AdventureEventDefinition[] }
interface AdventureExchange { format: "emberfall-adventures"; version: 1; adventures: AdventureDefinition[] }

const EMPTY_OUTCOME: AdventureEventOutcome = { text: "", health: 0, gold: 0, experience: 0, talentPoints: 0, attributePoints: 0 };
const STAT_OPTIONS: Array<{ id: StatName; label: string }> = [
  { id: "strength", label: "Strength" }, { id: "agility", label: "Agility" }, { id: "intelligence", label: "Intelligence" }, { id: "vitality", label: "Vitality" }, { id: "luck", label: "Luck" },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readExchange<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyJson(value: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
}

function useLocalDraft<T>(key: string, fallback: T, normalize: (value: T) => T = (value) => value) {
  const [draft, setDraft] = useState<T>(() => normalize(readExchange(key, fallback)));
  const [message, setMessage] = useState("Changes save automatically in this browser");
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(draft)); }, [draft, key]);
  const save = () => { window.localStorage.setItem(key, JSON.stringify(draft)); setMessage("Draft saved locally"); };
  return { draft, setDraft, message, setMessage, save };
}

function useModalScrollLock() {
  useEffect(() => {
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, []);
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
      </div>}
    </section>
  </div>;
}

function EditorShell({ title, description, message, onSave, onCopy, onExport, onExit, children }: {
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

function NumberField({ label, value, onChange, step = 1, min }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number }) {
  return <label><span>{label}</span><input type="number" value={value} step={step} min={min} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function TextField({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className={textarea ? "wide-field" : ""}><span>{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

function canonicalEnemyExchange(): EnemyExchange {
  return {
    format: "emberfall-enemies",
    version: 2,
    enemies: Object.values(ENEMIES).map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      title: enemy.title,
      maxHp: enemy.maxHp,
      physicalPower: enemy.physicalPower,
      spellPower: enemy.spellPower,
      armor: enemy.armor,
      magicResistance: enemy.magicResistance,
      hitChance: enemy.hitChance * 100,
      dodgeChance: enemy.dodgeChance * 100,
      critChance: enemy.critChance * 100,
      energyRegen: enemy.energyRegen,
      maxEnergy: enemy.maxEnergy,
      abilities: enemy.abilities.map((ability) => ({
        id: ability.id,
        name: ability.name,
        energyCost: ability.energyCost,
        cooldownTurns: 0,
        effect: ability.description,
      })),
      behaviorNotes: enemy.behaviorNotes,
      accent: enemy.accent,
    })),
  };
}

function normalizeEnemyExchange(exchange: EnemyExchange): EnemyExchange {
  const fallbackById = ENEMIES;
  return {
    format: "emberfall-enemies",
    version: 2,
    enemies: (Array.isArray(exchange?.enemies) ? exchange.enemies : []).map((enemy) => {
      const legacy = enemy as Partial<EnemyDraft> & { power?: number; damageType?: string; energyCost?: number; intentText?: string; attackDescription?: string; abilitiesNotes?: string };
      const fallback = legacy.id ? fallbackById[legacy.id] : undefined;
      const legacyPower = finiteNumber(legacy.power, 0);
      const fallbackAbilities: EnemyAbilityDraft[] = (fallback?.abilities ?? []).map((ability) => ({
        id: ability.id,
        name: ability.name,
        energyCost: ability.energyCost,
        cooldownTurns: 0,
        effect: ability.description,
      }));
      const rawAbilities: Array<Partial<EnemyAbilityDraft> & { description?: string }> = Array.isArray(legacy.abilities) ? legacy.abilities : fallbackAbilities;
      const abilities = rawAbilities.map((ability, index) => {
        const raw = ability as Partial<EnemyAbilityDraft> & { description?: string };
        return {
          id: raw.id ?? makeId("enemy-ability"),
          name: raw.name ?? `Ability ${index + 1}`,
          energyCost: finiteNumber(raw.energyCost, 0),
          cooldownTurns: finiteNumber(raw.cooldownTurns, 0),
          effect: raw.effect ?? raw.description ?? "",
        };
      });
      if (legacy.abilitiesNotes && abilities.length === 1) abilities[0] = { ...abilities[0], effect: legacy.abilitiesNotes };
      const legacyEffect = legacy.abilitiesNotes ?? legacy.attackDescription;
      if (legacyEffect && abilities.length === 0) abilities.push({
        id: makeId("enemy-ability"),
        name: legacy.intentText?.split(" · ")[0] || "New Ability",
        energyCost: finiteNumber(legacy.energyCost, 0),
        cooldownTurns: 0,
        effect: legacyEffect,
      });
      return {
        id: legacy.id ?? makeId("enemy"),
        name: legacy.name ?? "New Enemy",
        title: legacy.title ?? "Creature",
        maxHp: finiteNumber(legacy.maxHp, fallback?.maxHp ?? 30),
        physicalPower: finiteNumber(legacy.physicalPower, fallback?.physicalPower ?? (legacy.damageType === "physical" ? legacyPower : 0)),
        spellPower: finiteNumber(legacy.spellPower, fallback?.spellPower ?? (legacy.damageType && legacy.damageType !== "physical" ? legacyPower : 0)),
        armor: finiteNumber(legacy.armor, fallback?.armor ?? 0),
        magicResistance: finiteNumber(legacy.magicResistance, fallback?.magicResistance ?? 0),
        hitChance: finiteNumber(legacy.hitChance, fallback ? fallback.hitChance * 100 : 95),
        dodgeChance: finiteNumber(legacy.dodgeChance, fallback ? fallback.dodgeChance * 100 : 5),
        critChance: finiteNumber(legacy.critChance, fallback ? fallback.critChance * 100 : 5),
        energyRegen: finiteNumber(legacy.energyRegen, fallback?.energyRegen ?? 1),
        maxEnergy: finiteNumber(legacy.maxEnergy, fallback?.maxEnergy ?? 10),
        abilities,
        behaviorNotes: legacy.behaviorNotes ?? fallback?.behaviorNotes ?? "",
        accent: legacy.accent ?? fallback?.accent ?? "#79a86d",
      };
    }),
  };
}

export function EnemyDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<EnemyExchange>(ENEMY_DRAFT_STORAGE_KEY, canonicalEnemyExchange(), normalizeEnemyExchange);
  const [selectedId, setSelectedId] = useState(store.draft.enemies[0]?.id ?? "");
  const selected = store.draft.enemies.find((enemy) => enemy.id === selectedId) ?? store.draft.enemies[0];
  const update = (change: Partial<EnemyDraft>) => store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.map((enemy) => enemy.id === selected?.id ? { ...enemy, ...change } : enemy) }));
  const updateAbility = (abilityId: string, change: Partial<EnemyAbilityDraft>) => update({ abilities: selected.abilities.map((ability) => ability.id === abilityId ? { ...ability, ...change } : ability) });
  const addAbility = () => update({ abilities: [...selected.abilities, { id: makeId("enemy-ability"), name: "New Ability", energyCost: 0, cooldownTurns: 0, effect: "" }] });
  const add = () => {
    const id = makeId("enemy");
    const enemy: EnemyDraft = { id, name: "New Enemy", title: "Creature", maxHp: 30, physicalPower: 6, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 95, dodgeChance: 5, critChance: 5, energyRegen: 1, maxEnergy: 10, abilities: [], behaviorNotes: "", accent: "#79a86d" };
    store.setDraft((draft) => ({ ...draft, enemies: [...draft.enemies, enemy] })); setSelectedId(id);
  };
  const remove = () => { if (!selected) return; store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.filter((enemy) => enemy.id !== selected.id) })); setSelectedId(store.draft.enemies.find((enemy) => enemy.id !== selected.id)?.id ?? ""); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  return <EditorShell title="Create Enemy" description="Build enemy stat blocks and describe their abilities and combat priorities." message={store.message} onSave={store.save} onCopy={copy} onExport={() => { downloadJson("emberfall-enemies.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New enemy</button>{store.draft.enemies.map((enemy) => <button className={enemy.id === selected?.id ? "selected" : ""} key={enemy.id} onClick={() => setSelectedId(enemy.id)}><strong>{enemy.name}</strong><small>{enemy.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Enemy Definition</p><h2>{selected.name}</h2></div><button className="danger-icon-button" onClick={remove}><Trash2 size={15} /> Delete</button></div><div className="content-form-grid">
        <TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><TextField label="Title" value={selected.title} onChange={(title) => update({ title })} /><TextField label="Accent color" value={selected.accent} onChange={(accent) => update({ accent })} />
        <NumberField label="Health" value={selected.maxHp} min={1} onChange={(maxHp) => update({ maxHp })} /><NumberField label="Physical Power" value={selected.physicalPower} min={0} onChange={(physicalPower) => update({ physicalPower })} /><NumberField label="Spell Power" value={selected.spellPower} min={0} onChange={(spellPower) => update({ spellPower })} /><NumberField label="Armor" value={selected.armor} min={0} onChange={(armor) => update({ armor })} /><NumberField label="Magic Resistance" value={selected.magicResistance} min={0} onChange={(magicResistance) => update({ magicResistance })} />
        <NumberField label="Hit Chance %" value={selected.hitChance} step={0.1} onChange={(hitChance) => update({ hitChance })} /><NumberField label="Dodge Chance %" value={selected.dodgeChance} step={0.1} onChange={(dodgeChance) => update({ dodgeChance })} /><NumberField label="Crit Chance %" value={selected.critChance} step={0.1} onChange={(critChance) => update({ critChance })} /><NumberField label="Energy Regeneration" value={selected.energyRegen} min={0} onChange={(energyRegen) => update({ energyRegen })} />
        <NumberField label="Max Energy" value={selected.maxEnergy} min={1} onChange={(maxEnergy) => update({ maxEnergy })} />
        <div className="enemy-ability-editor-list wide-field"><div className="enemy-ability-editor-heading"><div><span>Abilities</span><small>Add every ability this enemy can use.</small></div><button type="button" className="secondary-editor-button" onClick={addAbility}><Plus size={14} /> Add ability</button></div>
          {selected.abilities.length === 0 && <p className="empty-editor-copy">No abilities added yet.</p>}
          {selected.abilities.map((ability, index) => <article className="enemy-ability-editor" key={ability.id}><header><strong>Ability {index + 1}</strong><button type="button" onClick={() => update({ abilities: selected.abilities.filter((item) => item.id !== ability.id) })}><Trash2 size={14} /> Remove</button></header><div className="content-form-grid"><TextField label="Name" value={ability.name} onChange={(name) => updateAbility(ability.id, { name })} /><NumberField label="Energy Cost" value={ability.energyCost} min={0} onChange={(energyCost) => updateAbility(ability.id, { energyCost })} /><NumberField label="Cooldown" value={ability.cooldownTurns} min={0} onChange={(cooldownTurns) => updateAbility(ability.id, { cooldownTurns })} /><TextField label="Effect" value={ability.effect} onChange={(effect) => updateAbility(ability.id, { effect })} textarea /></div></article>)}
        </div>
        <TextField label="How they use their abilities" value={selected.behaviorNotes} onChange={(behaviorNotes) => update({ behaviorNotes })} textarea />
      </div></section>}
    </div>
  </EditorShell>;
}

function canonicalEventExchange(): EventExchange { return { format: "emberfall-events", version: 1, events: Object.values(ADVENTURE_EVENTS).map((event) => structuredClone(event)) }; }
function blankChoice(index: number): AdventureEventChoice { return { id: makeId("choice"), label: `Choice ${index}`, description: "", stat: "strength", threshold: 60, success: { ...EMPTY_OUTCOME, text: "Success." }, failure: { ...EMPTY_OUTCOME, text: "Failure." } }; }

function OutcomeFields({ title, outcome, onChange }: { title: string; outcome: AdventureEventOutcome; onChange: (outcome: AdventureEventOutcome) => void }) {
  return <fieldset className="outcome-fields"><legend>{title}</legend><TextField label="Outcome text" value={outcome.text} onChange={(text) => onChange({ ...outcome, text })} textarea />
    <div className="outcome-number-grid"><NumberField label="Health" value={outcome.health} onChange={(health) => onChange({ ...outcome, health })} /><NumberField label="Gold" value={outcome.gold} onChange={(gold) => onChange({ ...outcome, gold })} /><NumberField label="Experience" value={outcome.experience} onChange={(experience) => onChange({ ...outcome, experience })} /><NumberField label="Talent Points" value={outcome.talentPoints} onChange={(talentPoints) => onChange({ ...outcome, talentPoints })} /><NumberField label="Attribute Points" value={outcome.attributePoints} onChange={(attributePoints) => onChange({ ...outcome, attributePoints })} /></div>
  </fieldset>;
}

export function EventDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<EventExchange>(EVENT_DRAFT_STORAGE_KEY, canonicalEventExchange());
  const [selectedId, setSelectedId] = useState(store.draft.events[0]?.id ?? "");
  const selected = store.draft.events.find((event) => event.id === selectedId) ?? store.draft.events[0];
  const update = (change: Partial<AdventureEventDefinition>) => store.setDraft((draft) => ({ ...draft, events: draft.events.map((event) => event.id === selected?.id ? { ...event, ...change } : event) }));
  const updateChoice = (choiceId: string, change: Partial<AdventureEventChoice>) => update({ choices: selected.choices.map((choice) => choice.id === choiceId ? { ...choice, ...change } : choice) });
  const add = () => { const id = makeId("event"); const next = { id, name: "New Event", eyebrow: "Unknown Event", description: "Describe the scenario.", choices: [blankChoice(1), blankChoice(2)] }; store.setDraft((draft) => ({ ...draft, events: [...draft.events, next] })); setSelectedId(id); };
  const remove = () => { if (!selected) return; store.setDraft((draft) => ({ ...draft, events: draft.events.filter((event) => event.id !== selected.id) })); setSelectedId(store.draft.events.find((event) => event.id !== selected.id)?.id ?? ""); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  return <EditorShell title="Event Manager" description="Create two- or three-choice events resolved by d100 plus a selected attribute." message={store.message} onSave={store.save} onCopy={copy} onExport={() => { downloadJson("emberfall-events.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New event</button>{store.draft.events.map((event) => <button className={event.id === selected?.id ? "selected" : ""} key={event.id} onClick={() => setSelectedId(event.id)}><strong>{event.name}</strong><small>{event.choices.length} choices</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Event Definition</p><h2>{selected.name}</h2></div><button className="danger-icon-button" onClick={remove}><Trash2 size={15} /> Delete</button></div><div className="content-form-grid"><TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><TextField label="Eyebrow" value={selected.eyebrow} onChange={(eyebrow) => update({ eyebrow })} /><TextField label="Scenario" value={selected.description} onChange={(description) => update({ description })} textarea /></div>
        <div className="choice-editor-list">{selected.choices.map((choice, index) => <article className="choice-editor" key={choice.id}><header><strong>Choice {index + 1}</strong>{selected.choices.length > 2 && <button onClick={() => update({ choices: selected.choices.filter((item) => item.id !== choice.id) })}><Trash2 size={14} /> Remove</button>}</header><div className="content-form-grid"><TextField label="Choice ID" value={choice.id} onChange={(id) => updateChoice(choice.id, { id })} /><TextField label="Button label" value={choice.label} onChange={(label) => updateChoice(choice.id, { label })} /><TextField label="Choice description" value={choice.description} onChange={(description) => updateChoice(choice.id, { description })} textarea /><label><span>Attribute</span><select value={choice.stat} onChange={(event) => updateChoice(choice.id, { stat: event.target.value as StatName })}>{STAT_OPTIONS.map((stat) => <option key={stat.id} value={stat.id}>{stat.label}</option>)}</select></label><NumberField label="Success threshold" value={choice.threshold} min={1} onChange={(threshold) => updateChoice(choice.id, { threshold })} /></div><div className="choice-outcomes"><OutcomeFields title="On success" outcome={choice.success} onChange={(success) => updateChoice(choice.id, { success })} /><OutcomeFields title="On failure" outcome={choice.failure} onChange={(failure) => updateChoice(choice.id, { failure })} /></div></article>)}</div>
        {selected.choices.length < 3 && <button className="secondary-editor-button" onClick={() => update({ choices: [...selected.choices, blankChoice(selected.choices.length + 1)] })}><Plus size={14} /> Add third choice</button>}
      </section>}
    </div>
  </EditorShell>;
}

function canonicalAdventureExchange(): AdventureExchange { return { format: "emberfall-adventures", version: 1, adventures: ADVENTURES.map((adventure) => structuredClone(adventure)) }; }
function localEnemyIds() { const stored = readExchange<EnemyExchange | null>(ENEMY_DRAFT_STORAGE_KEY, null); return [...new Set([...(stored?.enemies.map((enemy) => enemy.id) ?? []), ...Object.keys(ENEMIES)])]; }
function localEvents() { const stored = readExchange<EventExchange | null>(EVENT_DRAFT_STORAGE_KEY, null); return [...new Map([...(stored?.events ?? []), ...Object.values(ADVENTURE_EVENTS)].map((event) => [event.id, event])).values()]; }

export function AdventureDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<AdventureExchange>(ADVENTURE_DRAFT_STORAGE_KEY, canonicalAdventureExchange());
  const [selectedId, setSelectedId] = useState(store.draft.adventures[0]?.id ?? "");
  const selected = store.draft.adventures.find((adventure) => adventure.id === selectedId) ?? store.draft.adventures[0];
  const enemyIds = useMemo(localEnemyIds, []); const events = useMemo(localEvents, []);
  const update = (change: Partial<AdventureDefinition>) => store.setDraft((draft) => ({ ...draft, adventures: draft.adventures.map((adventure) => adventure.id === selected?.id ? { ...adventure, ...change } : adventure) }));
  const updateStage = (stageId: string, change: Partial<AdventureDefinition["stages"][number]>) => update({ stages: selected.stages.map((stage) => stage.id === stageId ? { ...stage, ...change } : stage) });
  const updateEntry = (stageId: string, entryId: string, change: Partial<AdventureStageEntry>) => updateStage(stageId, { entries: selected.stages.find((stage) => stage.id === stageId)!.entries.map((entry) => entry.id === entryId ? { ...entry, ...change } : entry) });
  const add = () => { const id = makeId("adventure"); const adventure: AdventureDefinition = { id, name: "New Adventure", description: "", recommendedLevel: 1, theme: "windsong_forest", stages: [{ id: makeId("stage"), name: "Stage 1", entries: [] }], completionTitle: "Adventure Complete", completionDescription: "" }; store.setDraft((draft) => ({ ...draft, adventures: [...draft.adventures, adventure] })); setSelectedId(id); };
  const addEntry = (stageId: string) => { const entry: AdventureStageEntry = { id: makeId("entry"), type: "combat", chance: 100, eyebrow: "Encounter", title: "New Encounter", description: "", enemyIds: [], reward: { experience: 50, gold: 8, loot: true } }; const stage = selected.stages.find((item) => item.id === stageId)!; updateStage(stageId, { entries: [...stage.entries, entry] }); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  return <EditorShell title="Adventure Editor" description="Build adventures from stages with unlimited weighted combat and event possibilities." message={store.message} onSave={store.save} onCopy={copy} onExport={() => { downloadJson("emberfall-adventures.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New adventure</button>{store.draft.adventures.map((adventure) => <button className={adventure.id === selected?.id ? "selected" : ""} key={adventure.id} onClick={() => setSelectedId(adventure.id)}><strong>{adventure.name}</strong><small>{adventure.stages.length} stages</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Adventure Definition</p><h2>{selected.name}</h2></div></div><div className="content-form-grid"><TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><NumberField label="Recommended level" value={selected.recommendedLevel} min={1} onChange={(recommendedLevel) => update({ recommendedLevel })} /><label><span>Required completed adventure</span><select value={selected.prerequisiteAdventureId ?? ""} onChange={(event) => update({ prerequisiteAdventureId: event.target.value || undefined })}><option value="">None</option>{store.draft.adventures.filter((adventure) => adventure.id !== selected.id).map((adventure) => <option value={adventure.id} key={adventure.id}>{adventure.name}</option>)}</select></label><TextField label="Description" value={selected.description} onChange={(description) => update({ description })} textarea /><TextField label="Completion title" value={selected.completionTitle} onChange={(completionTitle) => update({ completionTitle })} /><TextField label="Completion description" value={selected.completionDescription} onChange={(completionDescription) => update({ completionDescription })} textarea /></div>
        <div className="stage-editor-list">{selected.stages.map((stage, stageIndex) => { const chanceTotal = stage.entries.reduce((sum, entry) => sum + entry.chance, 0); return <article className="stage-editor" key={stage.id}><header><div><small>Stage {stageIndex + 1}</small><input value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} /></div><span className={chanceTotal === 100 ? "valid" : "warning"}>{chanceTotal}% total</span><button onClick={() => update({ stages: selected.stages.filter((item) => item.id !== stage.id) })} disabled={selected.stages.length === 1}><Trash2 size={14} /> Remove stage</button></header>
          <div className="stage-entry-list">{stage.entries.map((entry) => <section className="stage-entry" key={entry.id}><div className="stage-entry-heading"><strong>{entry.title}</strong><button onClick={() => updateStage(stage.id, { entries: stage.entries.filter((item) => item.id !== entry.id) })}><Trash2 size={13} /></button></div><div className="content-form-grid"><TextField label="Entry ID" value={entry.id} onChange={(id) => updateEntry(stage.id, entry.id, { id })} /><label><span>Type</span><select value={entry.type} onChange={(event) => updateEntry(stage.id, entry.id, { type: event.target.value as AdventureStageEntry["type"], eventId: event.target.value === "event" ? events[0]?.id : undefined, enemyIds: event.target.value === "event" ? undefined : [] })}><option value="combat">Combat</option><option value="event">Event</option><option value="boss">Boss</option></select></label><NumberField label="Chance %" value={entry.chance} min={0} onChange={(chance) => updateEntry(stage.id, entry.id, { chance })} /><TextField label="Title" value={entry.title} onChange={(title) => updateEntry(stage.id, entry.id, { title })} /><TextField label="Eyebrow" value={entry.eyebrow} onChange={(eyebrow) => updateEntry(stage.id, entry.id, { eyebrow })} /><TextField label="Description" value={entry.description} onChange={(description) => updateEntry(stage.id, entry.id, { description })} textarea />
            {entry.type === "event" ? <label className="wide-field"><span>Event</span><select value={entry.eventId ?? ""} onChange={(event) => updateEntry(stage.id, entry.id, { eventId: event.target.value })}>{events.map((event) => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label> : <>
              <fieldset className="enemy-picker wide-field"><legend>Enemies</legend>{enemyIds.map((enemyId) => { const count = entry.enemyIds?.filter((id) => id === enemyId).length ?? 0; return <label key={enemyId}><span>{enemyId}</span><input type="number" min={0} value={count} aria-label={`${enemyId} count`} onChange={(event) => { const nextCount = Math.max(0, Math.floor(Number(event.target.value))); const withoutEnemy = (entry.enemyIds ?? []).filter((id) => id !== enemyId); updateEntry(stage.id, entry.id, { enemyIds: [...withoutEnemy, ...Array.from({ length: nextCount }, () => enemyId)] }); }} /></label>; })}</fieldset>
              <fieldset className="encounter-reward-fields wide-field"><legend>Victory reward</legend><NumberField label="Experience" value={entry.reward?.experience ?? 0} min={0} onChange={(experience) => updateEntry(stage.id, entry.id, { reward: { experience, gold: entry.reward?.gold ?? 0, loot: entry.reward?.loot ?? false } })} /><NumberField label="Gold" value={entry.reward?.gold ?? 0} min={0} onChange={(gold) => updateEntry(stage.id, entry.id, { reward: { experience: entry.reward?.experience ?? 0, gold, loot: entry.reward?.loot ?? false } })} /><label><span>Loot roll</span><input type="checkbox" checked={entry.reward?.loot ?? false} onChange={(event) => updateEntry(stage.id, entry.id, { reward: { experience: entry.reward?.experience ?? 0, gold: entry.reward?.gold ?? 0, loot: event.target.checked } })} /></label></fieldset>
            </>}
          </div></section>)}</div><button className="secondary-editor-button" onClick={() => addEntry(stage.id)}><Plus size={14} /> Add stage possibility</button>
        </article>; })}</div><button className="secondary-editor-button add-stage-button" onClick={() => update({ stages: [...selected.stages, { id: makeId("stage"), name: `Stage ${selected.stages.length + 1}`, entries: [] }] })}><Plus size={14} /> Add stage</button>
      </section>}
    </div>
  </EditorShell>;
}
