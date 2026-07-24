import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ADVENTURE_EVENTS, ENEMIES, ITEMS } from "../../game/data";
import { getAdventureEventOutcomeEffects } from "../../game/eventOutcomes";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import type { AdventureEventChoice, AdventureEventDefinition, AdventureEventOutcome, AdventureEventOutcomeEffect, StatName, StatusEffectId } from "../../game/types";
import { copyJson, downloadJson, EditorShell, EMPTY_OUTCOME, EVENT_DRAFT_STORAGE_KEY, localEnemies, makeId, NumberField, saveLiveCatalog, STAT_OPTIONS, TextField, useLocalDraft, type EventExchange } from "./shared";

export function normalizeOutcome(outcome: AdventureEventOutcome): AdventureEventOutcome {
  return { text: outcome.text ?? "", effects: structuredClone(getAdventureEventOutcomeEffects(outcome)) };
}
export function canonicalEventExchange(): EventExchange { return { format: "arkenfall-events", version: 2, events: Object.values(ADVENTURE_EVENTS).map((event) => structuredClone(event)) }; }
export function normalizeEventExchange(exchange: EventExchange): EventExchange {
  return {
    format: "arkenfall-events",
    version: 2,
    events: (exchange.events ?? []).map((event) => ({
      ...event,
      choices: event.choices.map((choice) => ({ ...choice, success: normalizeOutcome(choice.success), failure: normalizeOutcome(choice.failure) })),
    })),
  };
}
export function blankChoice(index: number): AdventureEventChoice { return { id: makeId("choice"), label: `Choice ${index}`, description: "", stat: "strength", threshold: 60, success: { ...EMPTY_OUTCOME, text: "Success." }, failure: { ...EMPTY_OUTCOME, text: "Failure." } }; }

export type OutcomePolarity = "positive" | "negative";
export const POSITIVE_OUTCOME_OPTIONS: Array<{ type: AdventureEventOutcomeEffect["type"]; label: string }> = [
  { type: "heal", label: "Heal" },
  { type: "playerNextCombatBuff", label: "Start next combat with buff" },
  { type: "gainGold", label: "Gain gold" },
  { type: "gainItem", label: "Gain item" },
  { type: "gainExperience", label: "Gain experience" },
  { type: "gainTalentPoints", label: "Gain Talent Points" },
  { type: "gainAttributePoints", label: "Gain Attribute Points" },
  { type: "enemiesNextCombatDebuff", label: "Enemies start next combat with debuff" },
];
export const NEGATIVE_OUTCOME_OPTIONS: Array<{ type: AdventureEventOutcomeEffect["type"]; label: string }> = [
  { type: "loseHealth", label: "Lose Health" },
  { type: "loseGold", label: "Lose gold" },
  { type: "playerNextCombatDebuff", label: "Start next combat with debuff" },
  { type: "loseExperience", label: "Lose experience" },
  { type: "enemiesNextCombatBuff", label: "Enemies start next combat with buff" },
  { type: "immediateEncounter", label: "Encounter enemies immediately" },
];
export const BUFF_OPTIONS = Object.values(STATUS_EFFECTS).filter((status) => status.kind === "buff");
export const DEBUFF_OPTIONS = Object.values(STATUS_EFFECTS).filter((status) => status.kind === "debuff");

export function blankOutcomeEffect(type: AdventureEventOutcomeEffect["type"]): AdventureEventOutcomeEffect {
  switch (type) {
    case "gainItem": return { type, itemId: ITEMS[0]?.id ?? "" };
    case "playerNextCombatBuff":
    case "enemiesNextCombatBuff": return { type, status: BUFF_OPTIONS[0]?.id ?? "strengthened", stacks: 1 };
    case "playerNextCombatDebuff":
    case "enemiesNextCombatDebuff": return { type, status: DEBUFF_OPTIONS[0]?.id ?? "poison", stacks: 1 };
    case "immediateEncounter": return { type, enemyId: Object.keys(ENEMIES).find((id) => id !== "dummy") ?? "dummy", count: 1, experience: 0, gold: 0 };
    default: return { type, amount: 1 };
  }
}

export function OutcomeEffectFields({ effect, polarity, enemies, onChange, onRemove }: {
  effect: AdventureEventOutcomeEffect;
  polarity: OutcomePolarity;
  enemies: Array<{ id: string; name: string }>;
  onChange: (effect: AdventureEventOutcomeEffect) => void;
  onRemove: () => void;
}) {
  const options = polarity === "positive" ? POSITIVE_OUTCOME_OPTIONS : NEGATIVE_OUTCOME_OPTIONS;
  const isStatus = effect.type === "playerNextCombatBuff" || effect.type === "playerNextCombatDebuff" || effect.type === "enemiesNextCombatBuff" || effect.type === "enemiesNextCombatDebuff";
  const statusOptions = effect.type === "playerNextCombatBuff" || effect.type === "enemiesNextCombatBuff" ? BUFF_OPTIONS : DEBUFF_OPTIONS;
  const isAmount = "amount" in effect;
  return <article className="outcome-effect-editor">
    <header><strong>Outcome effect</strong><button type="button" onClick={onRemove}><Trash2 size={13} /> Remove</button></header>
    <div className="outcome-effect-grid">
      <label><span>Effect</span><select value={effect.type} onChange={(event) => onChange(blankOutcomeEffect(event.target.value as AdventureEventOutcomeEffect["type"]))}>{options.map((option) => <option key={option.type} value={option.type}>{option.label}</option>)}</select></label>
      {isAmount && <NumberField label="Amount" value={effect.amount} min={0} onChange={(amount) => onChange({ ...effect, amount })} />}
      {effect.type === "gainItem" && <label><span>Item</span><select value={effect.itemId} onChange={(event) => onChange({ ...effect, itemId: event.target.value })}>{ITEMS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      {isStatus && <><label><span>Status</span><select value={effect.status} onChange={(event) => onChange({ ...effect, status: event.target.value as StatusEffectId })}>{statusOptions.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}</select></label><NumberField label="Stacks / amount" value={effect.stacks} min={1} onChange={(stacks) => onChange({ ...effect, stacks })} /></>}
      {effect.type === "immediateEncounter" && <><label><span>Enemy</span><select value={effect.enemyId} onChange={(event) => onChange({ ...effect, enemyId: event.target.value })}>{enemies.map((enemy) => <option key={enemy.id} value={enemy.id}>{enemy.name}</option>)}</select></label><NumberField label="Enemy count" value={effect.count} min={1} onChange={(count) => onChange({ ...effect, count })} /><NumberField label="Victory XP" value={effect.experience} min={0} onChange={(experience) => onChange({ ...effect, experience })} /><NumberField label="Victory gold" value={effect.gold} min={0} onChange={(gold) => onChange({ ...effect, gold })} /></>}
    </div>
  </article>;
}

export function OutcomeFields({ title, polarity, outcome, enemies, onChange }: { title: string; polarity: OutcomePolarity; outcome: AdventureEventOutcome; enemies: Array<{ id: string; name: string }>; onChange: (outcome: AdventureEventOutcome) => void }) {
  const effects = outcome.effects ?? [];
  const defaultType = polarity === "positive" ? "heal" : "loseHealth";
  return <fieldset className="outcome-fields"><legend>{title}</legend><TextField label="Outcome text" value={outcome.text} onChange={(text) => onChange({ ...outcome, text })} textarea />
    <div className="outcome-effect-list">{effects.map((effect, index) => <OutcomeEffectFields key={`${effect.type}-${index}`} effect={effect} polarity={polarity} enemies={enemies} onChange={(nextEffect) => onChange({ ...outcome, effects: effects.map((candidate, effectIndex) => effectIndex === index ? nextEffect : candidate) })} onRemove={() => onChange({ ...outcome, effects: effects.filter((_, effectIndex) => effectIndex !== index) })} />)}</div>
    <button type="button" className="secondary-editor-button add-outcome-effect" onClick={() => onChange({ ...outcome, effects: [...effects, blankOutcomeEffect(defaultType)] })}><Plus size={14} /> Add {polarity} outcome</button>
  </fieldset>;
}

export function EventDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<EventExchange>(EVENT_DRAFT_STORAGE_KEY, canonicalEventExchange(), normalizeEventExchange);
  const enemies = useMemo(localEnemies, []);
  const [selectedId, setSelectedId] = useState(store.draft.events[0]?.id ?? "");
  const selected = store.draft.events.find((event) => event.id === selectedId) ?? store.draft.events[0];
  const update = (change: Partial<AdventureEventDefinition>) => store.setDraft((draft) => ({ ...draft, events: draft.events.map((event) => event.id === selected?.id ? { ...event, ...change } : event) }));
  const updateChoice = (choiceId: string, change: Partial<AdventureEventChoice>) => update({ choices: selected.choices.map((choice) => choice.id === choiceId ? { ...choice, ...change } : choice) });
  const add = () => { const id = makeId("event"); const next = { id, name: "New Event", eyebrow: "Unknown Event", description: "Describe the scenario.", choices: [blankChoice(1), blankChoice(2)] }; store.setDraft((draft) => ({ ...draft, events: [...draft.events, next] })); setSelectedId(id); };
  const remove = () => { if (!selected) return; store.setDraft((draft) => ({ ...draft, events: draft.events.filter((event) => event.id !== selected.id) })); setSelectedId(store.draft.events.find((event) => event.id !== selected.id)?.id ?? ""); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const save = async () => { try { window.localStorage.setItem(EVENT_DRAFT_STORAGE_KEY, JSON.stringify(store.draft)); store.setMessage("Writing events to live source…"); await saveLiveCatalog("events", store.draft); store.setMessage("Events saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Events could not be saved to the live game"); } };
  return <EditorShell title="Event Manager" description="Create two- or three-choice events resolved by d100 plus a selected attribute." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-events.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New event</button>{store.draft.events.map((event) => <button className={event.id === selected?.id ? "selected" : ""} key={event.id} onClick={() => setSelectedId(event.id)}><strong>{event.name}</strong><small>{event.choices.length} choices</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Event Definition</p><h2>{selected.name}</h2></div><button className="danger-icon-button" onClick={remove}><Trash2 size={15} /> Delete</button></div><div className="content-form-grid"><TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><TextField label="Eyebrow" value={selected.eyebrow} onChange={(eyebrow) => update({ eyebrow })} /><TextField label="Scenario" value={selected.description} onChange={(description) => update({ description })} textarea /></div>
        <div className="choice-editor-list">{selected.choices.map((choice, index) => <article className="choice-editor" key={choice.id}><header><strong>Choice {index + 1}</strong>{selected.choices.length > 2 && <button onClick={() => update({ choices: selected.choices.filter((item) => item.id !== choice.id) })}><Trash2 size={14} /> Remove</button>}</header><div className="content-form-grid"><TextField label="Choice ID" value={choice.id} onChange={(id) => updateChoice(choice.id, { id })} /><TextField label="Button label" value={choice.label} onChange={(label) => updateChoice(choice.id, { label })} /><TextField label="Choice description" value={choice.description} onChange={(description) => updateChoice(choice.id, { description })} textarea /><label><span>Attribute</span><select value={choice.stat} onChange={(event) => updateChoice(choice.id, { stat: event.target.value as StatName })}>{STAT_OPTIONS.map((stat) => <option key={stat.id} value={stat.id}>{stat.label}</option>)}</select></label><NumberField label="Success threshold" value={choice.threshold} min={1} onChange={(threshold) => updateChoice(choice.id, { threshold })} /></div><div className="choice-outcomes"><OutcomeFields title="Positive outcome" polarity="positive" outcome={choice.success} enemies={enemies} onChange={(success) => updateChoice(choice.id, { success })} /><OutcomeFields title="Negative outcome" polarity="negative" outcome={choice.failure} enemies={enemies} onChange={(failure) => updateChoice(choice.id, { failure })} /></div></article>)}</div>
        {selected.choices.length < 3 && <button className="secondary-editor-button" onClick={() => update({ choices: [...selected.choices, blankChoice(selected.choices.length + 1)] })}><Plus size={14} /> Add third choice</button>}
      </section>}
    </div>
  </EditorShell>;
}
