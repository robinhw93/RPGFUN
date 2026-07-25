import { FlaskConical, Gem, Plus, Shield, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { GEAR_SETS, ITEMS } from "../../game/data";
import { isConsumableItem, isGearItem } from "../../game/items";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import type { ConsumableEffect, ConsumableItem, ConsumableTarget, GearItem, GearSetDefinition, GearType, ItemRarity, PassiveBonuses, StatName, StatusEffectId, WeaponEquipType, WeaponKind } from "../../game/types";
import { GEAR_ICON_URLS, resolveGearIconUrl } from "../GearSlotIcon";
import { copyJson, downloadJson, EditorShell, ensureInternalId, ITEM_DRAFT_STORAGE_KEY, makeId, NumberField, saveLiveCatalog, TextField, useLocalDraft, type ItemExchange } from "./shared";

type ItemEditorTab = "gear" | "sets" | "consumables";
const RARITIES: ItemRarity[] = ["common", "uncommon", "rare", "epic"];
const GEAR_SLOTS: Array<{ id: GearType; label: string }> = [
  { id: "head", label: "Head" }, { id: "chest", label: "Chest" }, { id: "pants", label: "Pants" }, { id: "boots", label: "Boots" },
  { id: "mainHand", label: "Weapon" }, { id: "offHand", label: "Off-hand" }, { id: "ring", label: "Ring" },
];
const WEAPON_KINDS: WeaponKind[] = ["sword", "axe", "mace", "dagger", "wand", "shield", "tome", "staff", "polearm"];
const STAT_FIELDS: Array<{ id: StatName; label: string }> = [
  { id: "strength", label: "Strength" }, { id: "agility", label: "Agility" }, { id: "intelligence", label: "Intelligence" }, { id: "vitality", label: "Vitality" }, { id: "luck", label: "Luck" },
];
const PASSIVE_FIELDS: Array<{ id: keyof PassiveBonuses; label: string; percent?: boolean }> = [
  { id: "armor", label: "Armor" }, { id: "magicResistance", label: "Magic Resistance" }, { id: "physicalPower", label: "Physical Power" }, { id: "magicalPower", label: "Spell Power" },
  { id: "maxEnergy", label: "Max Energy" }, { id: "energyRegen", label: "Energy Regeneration" }, { id: "hitChance", label: "Hit Chance %", percent: true }, { id: "dodgeChance", label: "Dodge Chance %", percent: true }, { id: "critChance", label: "Critical Strike Chance %", percent: true }, { id: "initiative", label: "Initiative" },
];

export function canonicalItemExchange(): ItemExchange {
  return { format: "arkenfall-items", version: 1, items: ITEMS.map((item) => structuredClone(item)), sets: GEAR_SETS.map((set) => structuredClone(set)) };
}

export function normalizeItemExchange(exchange: ItemExchange): ItemExchange {
  const used = new Set<string>();
  const sets = (exchange.sets ?? []).map((set) => ({
    ...set,
    id: ensureInternalId(set.id, "set", used, set.name),
    pieceCount: Math.max(1, Math.round(set.pieceCount || 1)),
    bonuses: (set.bonuses ?? []).map((bonus) => ({ ...bonus, requiredPieces: Math.max(1, Math.round(bonus.requiredPieces || 1)), passive: bonus.passive ?? {} })),
  }));
  const setById = new Map(sets.map((set) => [set.id, set]));
  const items = (exchange.items ?? []).map((item) => {
    const id = ensureInternalId(item.id, item.kind === "consumable" ? "consumable" : "gear", used, item.name);
    if (isConsumableItem(item)) return { ...item, id, effects: item.effects ?? [] };
    const set = item.set ? setById.get(item.set) : undefined;
    return { ...item, kind: "gear" as const, id, stats: item.stats ?? {}, set: set?.id, setName: set?.name };
  });
  return { format: "arkenfall-items", version: 1, items, sets };
}

function blankGear(): GearItem {
  return { kind: "gear", id: makeId("gear"), name: "New Gear", slot: "head", armorMaterial: "cloth", rarity: "common", description: "", iconUrl: GEAR_ICON_URLS[0], stats: {} };
}
function blankSet(): GearSetDefinition { return { id: makeId("set"), name: "New Gear Set", pieceCount: 2, bonuses: [{ requiredPieces: 2, description: "+1 Strength.", passive: { stats: { strength: 1 } } }] }; }
function blankConsumable(): ConsumableItem { return { kind: "consumable", id: makeId("consumable"), name: "New Consumable", rarity: "common", description: "", effects: [{ type: "heal", amount: 10 }] }; }
function blankEffect(type: ConsumableEffect["type"]): ConsumableEffect {
  if (type === "apply_status") return { type, target: "self", status: "strengthened", stacks: 1, duration: 3 };
  if (type === "damage") return { type, target: "target", amount: 5 };
  return { type, amount: type === "change_energy" || type === "change_next_turn_energy_regen" ? -1 : 1 };
}

function GearFields({ item, sets, onChange }: { item: GearItem; sets: GearSetDefinition[]; onChange: (change: Partial<GearItem>) => void }) {
  const updateStat = (stat: StatName, value: number) => onChange({ stats: { ...item.stats, [stat]: value || undefined } });
  const selectedIconUrl = item.iconUrl ?? resolveGearIconUrl(item.slot, item);
  return <>
    <div className="content-form-grid">
      <TextField label="Name" value={item.name} onChange={(name) => onChange({ name })} />
      <label><span>Slot</span><select value={item.slot} onChange={(event) => { const slot = event.target.value as GearType; onChange({ slot, weaponEquipType: slot === "mainHand" ? "oneHand" : slot === "offHand" ? "offHand" : undefined, weaponKind: slot === "mainHand" ? "sword" : slot === "offHand" ? "shield" : undefined, armorMaterial: ["head", "chest", "pants", "boots"].includes(slot) ? (item.armorMaterial ?? "cloth") : undefined }); }} >{GEAR_SLOTS.map((slot) => <option value={slot.id} key={slot.id}>{slot.label}</option>)}</select></label>
      <label><span>Rarity</span><select value={item.rarity} onChange={(event) => onChange({ rarity: event.target.value as ItemRarity })}>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label>
      {item.slot === "mainHand" && <><label><span>Weapon grip</span><select value={item.weaponEquipType ?? "oneHand"} onChange={(event) => onChange({ weaponEquipType: event.target.value as WeaponEquipType })}><option value="mainHand">Main hand only</option><option value="oneHand">One hand / either hand</option><option value="twoHand">Two hand</option></select></label><label><span>Weapon kind</span><select value={item.weaponKind ?? "sword"} onChange={(event) => onChange({ weaponKind: event.target.value as WeaponKind })}>{WEAPON_KINDS.filter((kind) => !["shield", "tome"].includes(kind)).map((kind) => <option key={kind}>{kind}</option>)}</select></label></>}
      {item.slot === "offHand" && <label><span>Off-hand kind</span><select value={item.weaponKind ?? "shield"} onChange={(event) => onChange({ weaponKind: event.target.value as WeaponKind })}><option value="shield">Shield</option><option value="tome">Tome / Focus</option><option value="dagger">Dagger</option><option value="wand">Wand</option></select></label>}
      {["head", "chest", "pants", "boots"].includes(item.slot) && <label><span>Armor material</span><select value={item.armorMaterial ?? "cloth"} onChange={(event) => onChange({ armorMaterial: event.target.value as GearItem["armorMaterial"] })}><option value="cloth">Cloth</option><option value="leather">Leather</option><option value="plate">Plate</option></select></label>}
      <label><span>Gear set</span><select value={item.set ?? ""} onChange={(event) => { const set = sets.find((candidate) => candidate.id === event.target.value); onChange({ set: set?.id, setName: set?.name }); }}><option value="">None</option>{sets.map((set) => <option value={set.id} key={set.id}>{set.name}</option>)}</select></label>
      <TextField label="Description" value={item.description} onChange={(description) => onChange({ description })} textarea />
    </div>
    <fieldset className="item-editor-section"><legend>Gear image</legend><div className="gear-image-picker">{GEAR_ICON_URLS.map((url) => <button type="button" className={selectedIconUrl === url ? "selected" : ""} onClick={() => onChange({ iconUrl: url })} key={url}><img src={url} alt="" /><small>{url.split("/").pop()?.replace(".webp", "")}</small></button>)}</div></fieldset>
    <fieldset className="item-editor-section"><legend>Stats</legend><div className="content-form-grid">{STAT_FIELDS.map((field) => <NumberField key={field.id} label={field.label} value={item.stats[field.id] ?? 0} onChange={(value) => updateStat(field.id, value)} />)}<NumberField label="Armor" value={item.armor ?? 0} onChange={(armor) => onChange({ armor: armor || undefined })} /><NumberField label="Magic Resistance" value={item.magicResistance ?? 0} onChange={(magicResistance) => onChange({ magicResistance: magicResistance || undefined })} /><NumberField label="Physical Power" value={item.physicalPower ?? 0} onChange={(physicalPower) => onChange({ physicalPower: physicalPower || undefined })} /><NumberField label="Spell Power" value={item.magicalPower ?? 0} onChange={(magicalPower) => onChange({ magicalPower: magicalPower || undefined })} /></div></fieldset>
    <fieldset className="item-editor-section"><legend>Additional combat stats</legend><div className="content-form-grid">{PASSIVE_FIELDS.filter((field) => !["armor", "magicResistance", "physicalPower", "magicalPower"].includes(field.id)).map((field) => <NumberField key={field.id} label={field.label} value={Number(item.combat?.passive?.[field.id] ?? 0) * (field.percent ? 100 : 1)} onChange={(value) => onChange({ combat: { ...item.combat, passive: { ...item.combat?.passive, [field.id]: (field.percent ? value / 100 : value) || undefined } } })} />)}</div></fieldset>
    <div className="content-form-grid"><TextField label="Special / unique bonus notes for Codex" value={item.specialEffectNotes ?? ""} onChange={(specialEffectNotes) => onChange({ specialEffectNotes: specialEffectNotes || undefined })} textarea /></div>
  </>;
}

function SetFields({ set, onChange }: { set: GearSetDefinition; onChange: (change: Partial<GearSetDefinition>) => void }) {
  const updateBonus = (index: number, change: Partial<GearSetDefinition["bonuses"][number]>) => onChange({ bonuses: set.bonuses.map((bonus, candidate) => candidate === index ? { ...bonus, ...change } : bonus) });
  return <><div className="content-form-grid"><TextField label="Set name" value={set.name} onChange={(name) => onChange({ name })} /><NumberField label="Pieces in set" value={set.pieceCount} min={1} onChange={(pieceCount) => onChange({ pieceCount })} /></div>
    <fieldset className="item-editor-section"><legend>Set bonuses</legend><div className="set-bonus-list">{set.bonuses.map((bonus, index) => <article className="item-effect-editor" key={index}><header><strong>{bonus.requiredPieces}-piece bonus</strong><button type="button" onClick={() => onChange({ bonuses: set.bonuses.filter((_, candidate) => candidate !== index) })}><Trash2 size={13} /> Remove</button></header><div className="content-form-grid"><NumberField label="Required pieces" value={bonus.requiredPieces} min={1} onChange={(requiredPieces) => updateBonus(index, { requiredPieces })} /><TextField label="Player-facing description" value={bonus.description} onChange={(description) => updateBonus(index, { description })} textarea />{STAT_FIELDS.map((field) => <NumberField key={field.id} label={field.label} value={bonus.passive?.stats?.[field.id] ?? 0} onChange={(value) => updateBonus(index, { passive: { ...bonus.passive, stats: { ...bonus.passive?.stats, [field.id]: value || undefined } } })} />)}{PASSIVE_FIELDS.map((field) => <NumberField key={field.id} label={field.label} value={Number(bonus.passive?.[field.id] ?? 0) * (field.percent ? 100 : 1)} onChange={(value) => updateBonus(index, { passive: { ...bonus.passive, [field.id]: (field.percent ? value / 100 : value) || undefined } })} />)}<TextField label="Special effect notes for Codex" value={bonus.specialEffectNotes ?? ""} onChange={(specialEffectNotes) => updateBonus(index, { specialEffectNotes: specialEffectNotes || undefined })} textarea /></div></article>)}</div><button type="button" className="secondary-editor-button" onClick={() => onChange({ bonuses: [...set.bonuses, { requiredPieces: Math.min(set.pieceCount, set.bonuses.length + 2), description: "", passive: {} }] })}><Plus size={14} /> Add set bonus</button></fieldset>
  </>;
}

function EffectFields({ effect, onChange, onRemove }: { effect: ConsumableEffect; onChange: (effect: ConsumableEffect) => void; onRemove: () => void }) {
  const hasTarget = effect.type === "damage" || effect.type === "apply_status";
  const statusStackable = effect.type === "apply_status" && STATUS_EFFECTS[effect.status].stackable === true;
  return <article className="item-effect-editor"><header><strong>Consumable effect</strong><button type="button" onClick={onRemove}><Trash2 size={13} /> Remove</button></header><div className="content-form-grid"><label><span>Effect</span><select value={effect.type} onChange={(event) => onChange(blankEffect(event.target.value as ConsumableEffect["type"]))}><option value="heal">Heal self</option><option value="gain_energy">Regain Energy</option><option value="change_next_turn_energy_regen">Change next-turn Energy regeneration</option><option value="change_energy">Gain / lose Energy</option><option value="damage">Deal damage</option><option value="apply_status">Apply buff / debuff</option></select></label>{hasTarget && <label><span>Target</span><select value={effect.target} onChange={(event) => onChange({ ...effect, target: event.target.value as ConsumableTarget })}><option value="self">Self</option><option value="target">Selected enemy</option><option value="all_enemies">All enemies</option></select></label>}{"amount" in effect && <NumberField label={effect.type === "change_energy" || effect.type === "change_next_turn_energy_regen" ? "Amount (negative removes)" : "Amount"} value={effect.amount} onChange={(amount) => onChange({ ...effect, amount })} />}{effect.type === "apply_status" && <><label><span>Status</span><select value={effect.status} onChange={(event) => { const status = event.target.value as StatusEffectId; onChange({ ...effect, status, stacks: STATUS_EFFECTS[status].stackable ? effect.stacks : 1 }); }}>{Object.values(STATUS_EFFECTS).map((status) => <option value={status.id} key={status.id}>{status.name} ({status.kind})</option>)}</select></label>{statusStackable && <NumberField label="Stacks" value={effect.stacks} min={1} onChange={(stacks) => onChange({ ...effect, stacks })} />}<NumberField label="Duration (turns)" value={effect.duration} min={1} onChange={(duration) => onChange({ ...effect, duration })} /></>}</div></article>;
}

function ConsumableFields({ item, onChange }: { item: ConsumableItem; onChange: (change: Partial<ConsumableItem>) => void }) {
  return <><div className="content-form-grid"><TextField label="Name" value={item.name} onChange={(name) => onChange({ name })} /><label><span>Rarity</span><select value={item.rarity} onChange={(event) => onChange({ rarity: event.target.value as ItemRarity })}>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label><TextField label="Description" value={item.description} onChange={(description) => onChange({ description })} textarea /></div><fieldset className="item-editor-section"><legend>Combat effects</legend><div className="set-bonus-list">{item.effects.map((effect, index) => <EffectFields key={index} effect={effect} onChange={(next) => onChange({ effects: item.effects.map((candidate, candidateIndex) => candidateIndex === index ? next : candidate) })} onRemove={() => onChange({ effects: item.effects.filter((_, candidateIndex) => candidateIndex !== index) })} />)}</div><button type="button" className="secondary-editor-button" onClick={() => onChange({ effects: [...item.effects, blankEffect("heal")] })}><Plus size={14} /> Add effect</button></fieldset><div className="content-form-grid"><TextField label="Special effect notes for Codex" value={item.specialEffectNotes ?? ""} onChange={(specialEffectNotes) => onChange({ specialEffectNotes: specialEffectNotes || undefined })} textarea /></div></>;
}

export function ItemDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<ItemExchange>(ITEM_DRAFT_STORAGE_KEY, canonicalItemExchange(), normalizeItemExchange);
  const [tab, setTab] = useState<ItemEditorTab>("gear");
  const [selectedId, setSelectedId] = useState(() => store.draft.items.find(isGearItem)?.id ?? "");
  const entries = useMemo(() => tab === "sets" ? store.draft.sets : store.draft.items.filter(tab === "gear" ? isGearItem : isConsumableItem), [store.draft, tab]);
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const chooseTab = (next: ItemEditorTab) => { setTab(next); const list = next === "sets" ? store.draft.sets : store.draft.items.filter(next === "gear" ? isGearItem : isConsumableItem); setSelectedId(list[0]?.id ?? ""); };
  const prepare = () => { const normalized = normalizeItemExchange(store.draft); store.setDraft(normalized); window.localStorage.setItem(ITEM_DRAFT_STORAGE_KEY, JSON.stringify(normalized)); return normalized; };
  const save = async () => { try { const exchange = prepare(); store.setMessage("Writing items to live source..."); await saveLiveCatalog("items", exchange); store.setMessage("Items and sets saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Items could not be saved to the live game"); } };
  const copy = async () => { try { await copyJson(prepare()); store.setMessage("JSON copied - paste it into Codex for special mechanics"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const add = () => { const entry = tab === "gear" ? blankGear() : tab === "consumables" ? blankConsumable() : blankSet(); if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: [...draft.sets, entry as GearSetDefinition] })); else store.setDraft((draft) => ({ ...draft, items: [...draft.items, entry as GearItem | ConsumableItem] })); setSelectedId(entry.id); };
  const remove = () => { if (!selected) return; if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: draft.sets.filter((entry) => entry.id !== selected.id), items: draft.items.map((item) => isGearItem(item) && item.set === selected.id ? { ...item, set: undefined, setName: undefined } : item) })); else store.setDraft((draft) => ({ ...draft, items: draft.items.filter((entry) => entry.id !== selected.id) })); setSelectedId(entries.find((entry) => entry.id !== selected.id)?.id ?? ""); };
  const updateSelected = (change: object) => { if (!selected) return; if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: draft.sets.map((entry) => entry.id === selected.id ? { ...entry, ...change } : entry) })); else store.setDraft((draft) => ({ ...draft, items: draft.items.map((entry) => entry.id === selected.id ? { ...entry, ...change } as typeof entry : entry) })); };
  return <EditorShell title="Item Editor" description="Create gear, gear sets and combat consumables. Save writes standard mechanics directly to the live game; special notes are exported for Codex." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-items.json", prepare()); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="item-editor-tabs"><button className={tab === "gear" ? "active" : ""} onClick={() => chooseTab("gear")}><Shield size={14} /> Gear</button><button className={tab === "sets" ? "active" : ""} onClick={() => chooseTab("sets")}><Gem size={14} /> Sets</button><button className={tab === "consumables" ? "active" : ""} onClick={() => chooseTab("consumables")}><FlaskConical size={14} /> Consumables</button></div>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New {tab === "consumables" ? "consumable" : tab === "sets" ? "set" : "gear"}</button>{entries.map((entry) => <button className={entry.id === selected?.id ? "selected" : ""} key={entry.id} onClick={() => setSelectedId(entry.id)}><strong>{entry.name}</strong><small>{entry.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">{tab === "sets" ? "Gear Set" : tab === "consumables" ? "Consumable Item" : "Gear Item"}</p><h2>{selected.name}</h2></div><button type="button" className="danger-icon-button" onClick={remove}><Trash2 size={14} /> Delete</button></div>{tab === "gear" ? <GearFields item={selected as GearItem} sets={store.draft.sets} onChange={updateSelected} /> : tab === "sets" ? <SetFields set={selected as GearSetDefinition} onChange={updateSelected} /> : <ConsumableFields item={selected as ConsumableItem} onChange={updateSelected} />}</section>}
    </div>
  </EditorShell>;
}
