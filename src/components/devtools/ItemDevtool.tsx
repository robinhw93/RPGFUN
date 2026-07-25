import { FlaskConical, Gem, Package, Plus, Shield, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { GEAR_SETS, ITEMS } from "../../game/data";
import { getItemGoldCost, isConsumableItem, isGearItem, isMiscItem } from "../../game/items";
import { getItemIconUrl, ITEM_ARTWORK_URLS } from "../../game/itemIcons";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import { getArkenfallVendor, getItemCraftingRecipe } from "../../game/town";
import type { ArkenfallVendorId, ConsumableEffect, ConsumableItem, ConsumableTarget, GearItem, GearSetDefinition, GearType, InventoryItem, ItemCraftingRecipe, ItemRarity, MiscItem, PassiveBonuses, StatName, StatusEffectId, WeaponEquipType, WeaponKind } from "../../game/types";
import { GEAR_ICON_URLS, resolveGearIconUrl } from "../GearSlotIcon";
import { copyJson, downloadJson, EditorShell, ensureInternalId, ITEM_DRAFT_STORAGE_KEY, makeId, NumberField, saveLiveCatalog, TextField, useLocalDraft, type ItemExchange } from "./shared";

type ItemEditorTab = "gear" | "sets" | "consumables" | "misc";
const RARITIES: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
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
const ARKENFALL_VENDORS: Array<{ id: ArkenfallVendorId; shop: string; crafting: string }> = [
  { id: "blacksmith", shop: "Blacksmith — Brunhilde von Trott", crafting: "Blacksmith — Crafting" },
  { id: "alchemist", shop: "Alchemist — Ray Charlston", crafting: "Alchemist — Brew" },
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
    const idPrefix = isConsumableItem(item) ? "consumable" : isMiscItem(item) ? "item" : "gear";
    const id = ensureInternalId(item.id, idPrefix, used, item.name);
    const itemWithId = { ...item, id } as InventoryItem;
    const arkenfallVendor = getArkenfallVendor(itemWithId);
    const rawRecipe = getItemCraftingRecipe(itemWithId);
    const craftingRecipe = rawRecipe ? { ...rawRecipe, ingredients: rawRecipe.ingredients.map((ingredient) => ({ ...ingredient, quantity: Math.max(1, Math.round(ingredient.quantity || 1)) })) } : null;
    if (isConsumableItem(item)) return { ...item, id, goldCost: getItemGoldCost(item), effects: item.effects ?? [], arkenfallVendor, craftingRecipe };
    if (isMiscItem(item)) return { ...item, kind: "misc" as const, id, goldCost: getItemGoldCost(item), arkenfallVendor, craftingRecipe };
    const set = item.set ? setById.get(item.set) : undefined;
    return { ...item, kind: "gear" as const, id, goldCost: getItemGoldCost(item), stats: item.stats ?? {}, set: set?.id, setName: set?.name, arkenfallVendor, craftingRecipe };
  });
  return { format: "arkenfall-items", version: 1, items, sets };
}

function blankGear(): GearItem {
  return { kind: "gear", id: makeId("gear"), name: "New Gear", goldCost: 12, slot: "head", armorMaterial: "cloth", rarity: "common", description: "", iconUrl: GEAR_ICON_URLS[0], stats: {}, arkenfallVendor: null, craftingRecipe: null };
}
function blankSet(): GearSetDefinition { return { id: makeId("set"), name: "New Gear Set", pieceCount: 2, bonuses: [{ requiredPieces: 2, description: "+1 Strength.", passive: { stats: { strength: 1 } } }] }; }
function blankConsumable(): ConsumableItem { return { kind: "consumable", id: makeId("consumable"), name: "New Consumable", goldCost: 8, rarity: "common", description: "", iconUrl: ITEM_ARTWORK_URLS[0], effects: [{ type: "heal", amount: 10 }], arkenfallVendor: null, craftingRecipe: null }; }
function blankMiscItem(): MiscItem { return { kind: "misc", id: makeId("item"), name: "New Item", goldCost: 0, rarity: "common", description: "", iconUrl: ITEM_ARTWORK_URLS[0], arkenfallVendor: null, craftingRecipe: null }; }
function blankEffect(type: ConsumableEffect["type"]): ConsumableEffect {
  if (type === "apply_status") return { type, target: "self", status: "strengthened", stacks: 1, duration: 3 };
  if (type === "damage") return { type, target: "target", amount: 5 };
  return { type, amount: type === "change_energy" || type === "change_next_turn_energy_regen" ? -1 : 1 };
}

function ArkenfallAvailabilityFields({ item, allItems, onChange }: {
  item: InventoryItem;
  allItems: InventoryItem[];
  onChange: (change: { arkenfallVendor?: ArkenfallVendorId | null; craftingRecipe?: ItemCraftingRecipe | null }) => void;
}) {
  const vendor = getArkenfallVendor(item);
  const recipe = getItemCraftingRecipe(item);
  const ingredients = allItems.filter((candidate) => candidate.id !== item.id);
  const defaultIngredientId = ingredients[0]?.id ?? "";
  const updateRecipe = (change: Partial<ItemCraftingRecipe>) => {
    if (!recipe) return;
    onChange({ craftingRecipe: { ...recipe, ...change } });
  };
  return (
    <fieldset className="item-editor-section arkenfall-item-settings">
      <legend>Arkenfall availability</legend>
      <div className="content-form-grid">
        <label className="content-checkbox-field">
          <input type="checkbox" checked={vendor !== null} onChange={(event) => onChange({ arkenfallVendor: event.target.checked ? (isConsumableItem(item) ? "alchemist" : "blacksmith") : null })} />
          <span>Sold in Arkenfall</span>
        </label>
        {vendor && <label><span>Vendor</span><select value={vendor} onChange={(event) => onChange({ arkenfallVendor: event.target.value as ArkenfallVendorId })}>{ARKENFALL_VENDORS.map((option) => <option value={option.id} key={option.id}>{option.shop}</option>)}</select></label>}
        <label className="content-checkbox-field">
          <input type="checkbox" checked={recipe !== null} disabled={!defaultIngredientId && !recipe} onChange={(event) => onChange({ craftingRecipe: event.target.checked ? { station: isConsumableItem(item) ? "alchemist" : "blacksmith", ingredients: defaultIngredientId ? [{ itemId: defaultIngredientId, quantity: 1 }] : [] } : null })} />
          <span>Craftable</span>
        </label>
        {recipe && <label><span>Crafting location</span><select value={recipe.station} onChange={(event) => updateRecipe({ station: event.target.value as ArkenfallVendorId })}>{ARKENFALL_VENDORS.map((option) => <option value={option.id} key={option.id}>{option.crafting}</option>)}</select></label>}
      </div>
      {recipe && <div className="crafting-recipe-editor">
        <p>Required items</p>
        {recipe.ingredients.map((ingredient, index) => <div className="crafting-ingredient-row" key={`${ingredient.itemId}-${index}`}>
          <label><span>Item</span><select value={ingredient.itemId} onChange={(event) => updateRecipe({ ingredients: recipe.ingredients.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, itemId: event.target.value } : candidate) })}>{ingredients.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.name}</option>)}</select></label>
          <NumberField label="Quantity" value={ingredient.quantity} min={1} onChange={(quantity) => updateRecipe({ ingredients: recipe.ingredients.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, quantity: Math.max(1, Math.round(quantity)) } : candidate) })} />
          <button type="button" aria-label="Remove ingredient" onClick={() => updateRecipe({ ingredients: recipe.ingredients.filter((_, candidateIndex) => candidateIndex !== index) })}><Trash2 size={14} /></button>
        </div>)}
        <button type="button" className="secondary-editor-button" disabled={!defaultIngredientId} onClick={() => updateRecipe({ ingredients: [...recipe.ingredients, { itemId: defaultIngredientId, quantity: 1 }] })}><Plus size={14} /> Add required item</button>
      </div>}
    </fieldset>
  );
}

function GearFields({ item, sets, allItems, onChange }: { item: GearItem; sets: GearSetDefinition[]; allItems: InventoryItem[]; onChange: (change: Partial<GearItem>) => void }) {
  const updateStat = (stat: StatName, value: number) => onChange({ stats: { ...item.stats, [stat]: value || undefined } });
  const selectedIconUrl = item.iconUrl ?? resolveGearIconUrl(item.slot, item);
  return <>
    <div className="content-form-grid">
      <TextField label="Name" value={item.name} onChange={(name) => onChange({ name })} />
      <label><span>Slot</span><select value={item.slot} onChange={(event) => { const slot = event.target.value as GearType; onChange({ slot, weaponEquipType: slot === "mainHand" ? "oneHand" : slot === "offHand" ? "offHand" : undefined, weaponKind: slot === "mainHand" ? "sword" : slot === "offHand" ? "shield" : undefined, armorMaterial: ["head", "chest", "pants", "boots"].includes(slot) ? (item.armorMaterial ?? "cloth") : undefined }); }} >{GEAR_SLOTS.map((slot) => <option value={slot.id} key={slot.id}>{slot.label}</option>)}</select></label>
      <label><span>Rarity</span><select value={item.rarity} onChange={(event) => onChange({ rarity: event.target.value as ItemRarity })}>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label>
      <NumberField label="Gold cost" value={getItemGoldCost(item)} min={0} onChange={(goldCost) => onChange({ goldCost })} />
      {item.slot === "mainHand" && <><label><span>Weapon grip</span><select value={item.weaponEquipType ?? "oneHand"} onChange={(event) => onChange({ weaponEquipType: event.target.value as WeaponEquipType })}><option value="mainHand">Main hand only</option><option value="oneHand">One hand / either hand</option><option value="twoHand">Two hand</option></select></label><label><span>Weapon kind</span><select value={item.weaponKind ?? "sword"} onChange={(event) => onChange({ weaponKind: event.target.value as WeaponKind })}>{WEAPON_KINDS.filter((kind) => !["shield", "tome"].includes(kind)).map((kind) => <option key={kind}>{kind}</option>)}</select></label></>}
      {item.slot === "offHand" && <label><span>Off-hand kind</span><select value={item.weaponKind ?? "shield"} onChange={(event) => onChange({ weaponKind: event.target.value as WeaponKind })}><option value="shield">Shield</option><option value="tome">Tome / Focus</option><option value="dagger">Dagger</option><option value="wand">Wand</option></select></label>}
      {["head", "chest", "pants", "boots"].includes(item.slot) && <label><span>Armor material</span><select value={item.armorMaterial ?? "cloth"} onChange={(event) => onChange({ armorMaterial: event.target.value as GearItem["armorMaterial"] })}><option value="cloth">Cloth</option><option value="leather">Leather</option><option value="plate">Plate</option></select></label>}
      <label><span>Gear set</span><select value={item.set ?? ""} onChange={(event) => { const set = sets.find((candidate) => candidate.id === event.target.value); onChange({ set: set?.id, setName: set?.name }); }}><option value="">None</option>{sets.map((set) => <option value={set.id} key={set.id}>{set.name}</option>)}</select></label>
      <TextField label="Description" value={item.description} onChange={(description) => onChange({ description })} textarea />
    </div>
    <fieldset className="item-editor-section"><legend>Gear image</legend><div className="gear-image-picker">{GEAR_ICON_URLS.map((url) => <button type="button" className={selectedIconUrl === url ? "selected" : ""} onClick={() => onChange({ iconUrl: url })} key={url}><img src={url} alt="" /><small>{url.split("/").pop()?.replace(".webp", "")}</small></button>)}</div></fieldset>
    <fieldset className="item-editor-section"><legend>Stats</legend><div className="content-form-grid">{STAT_FIELDS.map((field) => <NumberField key={field.id} label={field.label} value={item.stats[field.id] ?? 0} onChange={(value) => updateStat(field.id, value)} />)}<NumberField label="Armor" value={item.armor ?? 0} onChange={(armor) => onChange({ armor: armor || undefined })} /><NumberField label="Magic Resistance" value={item.magicResistance ?? 0} onChange={(magicResistance) => onChange({ magicResistance: magicResistance || undefined })} /><NumberField label="Physical Power" value={item.physicalPower ?? 0} onChange={(physicalPower) => onChange({ physicalPower: physicalPower || undefined })} /><NumberField label="Spell Power" value={item.magicalPower ?? 0} onChange={(magicalPower) => onChange({ magicalPower: magicalPower || undefined })} /></div></fieldset>
    <fieldset className="item-editor-section"><legend>Additional combat stats</legend><div className="content-form-grid">{PASSIVE_FIELDS.filter((field) => !["armor", "magicResistance", "physicalPower", "magicalPower"].includes(field.id)).map((field) => <NumberField key={field.id} label={field.label} value={Number(item.combat?.passive?.[field.id] ?? 0) * (field.percent ? 100 : 1)} onChange={(value) => onChange({ combat: { ...item.combat, passive: { ...item.combat?.passive, [field.id]: (field.percent ? value / 100 : value) || undefined } } })} />)}</div></fieldset>
    <ArkenfallAvailabilityFields item={item} allItems={allItems} onChange={onChange} />
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

function itemArtworkLabel(url: string): string {
  return (url.split("/").pop() ?? "Item artwork").replace(".webp", "").split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function ItemArtworkPicker({ selectedUrl, onChange }: { selectedUrl?: string; onChange: (iconUrl: string) => void }) {
  return <fieldset className="item-editor-section"><legend>Item image</legend><div className="gear-image-picker item-artwork-picker">{ITEM_ARTWORK_URLS.map((url) => {
    const label = itemArtworkLabel(url);
    return <button type="button" aria-label={`Use ${label} image`} className={selectedUrl === url ? "selected" : ""} onClick={() => onChange(url)} key={url}><img src={url} alt="" /><small>{label}</small></button>;
  })}</div></fieldset>;
}

function ConsumableFields({ item, allItems, onChange }: { item: ConsumableItem; allItems: InventoryItem[]; onChange: (change: Partial<ConsumableItem>) => void }) {
  return <><div className="content-form-grid"><TextField label="Name" value={item.name} onChange={(name) => onChange({ name })} /><label><span>Rarity</span><select value={item.rarity} onChange={(event) => onChange({ rarity: event.target.value as ItemRarity })}>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label><NumberField label="Gold cost" value={getItemGoldCost(item)} min={0} onChange={(goldCost) => onChange({ goldCost })} /><TextField label="Description" value={item.description} onChange={(description) => onChange({ description })} textarea /></div><ItemArtworkPicker selectedUrl={item.iconUrl ?? getItemIconUrl(item.id)} onChange={(iconUrl) => onChange({ iconUrl })} /><fieldset className="item-editor-section"><legend>Combat effects</legend><div className="set-bonus-list">{item.effects.map((effect, index) => <EffectFields key={index} effect={effect} onChange={(next) => onChange({ effects: item.effects.map((candidate, candidateIndex) => candidateIndex === index ? next : candidate) })} onRemove={() => onChange({ effects: item.effects.filter((_, candidateIndex) => candidateIndex !== index) })} />)}</div><button type="button" className="secondary-editor-button" onClick={() => onChange({ effects: [...item.effects, blankEffect("heal")] })}><Plus size={14} /> Add effect</button></fieldset><ArkenfallAvailabilityFields item={item} allItems={allItems} onChange={onChange} /><div className="content-form-grid"><TextField label="Special effect notes for Codex" value={item.specialEffectNotes ?? ""} onChange={(specialEffectNotes) => onChange({ specialEffectNotes: specialEffectNotes || undefined })} textarea /></div></>;
}

function MiscItemFields({ item, allItems, onChange }: { item: MiscItem; allItems: InventoryItem[]; onChange: (change: Partial<MiscItem>) => void }) {
  return <><div className="content-form-grid">
    <TextField label="Name" value={item.name} onChange={(name) => onChange({ name })} />
    <label><span>Rarity</span><select value={item.rarity} onChange={(event) => onChange({ rarity: event.target.value as ItemRarity })}>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}</select></label>
    <NumberField label="Gold cost" value={getItemGoldCost(item)} min={0} onChange={(goldCost) => onChange({ goldCost })} />
    <TextField label="Description" value={item.description} onChange={(description) => onChange({ description })} textarea />
    <TextField label="Special effect notes for Codex" value={item.specialEffectNotes ?? ""} onChange={(specialEffectNotes) => onChange({ specialEffectNotes: specialEffectNotes || undefined })} textarea />
  </div><ItemArtworkPicker selectedUrl={item.iconUrl ?? getItemIconUrl(item.id)} onChange={(iconUrl) => onChange({ iconUrl })} /><ArkenfallAvailabilityFields item={item} allItems={allItems} onChange={onChange} /></>;
}

function itemsForTab(items: InventoryItem[], tab: Exclude<ItemEditorTab, "sets">): InventoryItem[] {
  if (tab === "gear") return items.filter(isGearItem);
  if (tab === "consumables") return items.filter(isConsumableItem);
  return items.filter(isMiscItem);
}

export function ItemDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<ItemExchange>(ITEM_DRAFT_STORAGE_KEY, canonicalItemExchange(), normalizeItemExchange);
  const [tab, setTab] = useState<ItemEditorTab>("gear");
  const [selectedId, setSelectedId] = useState(() => store.draft.items.find(isGearItem)?.id ?? "");
  const entries = useMemo(() => tab === "sets" ? store.draft.sets : itemsForTab(store.draft.items, tab), [store.draft, tab]);
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const chooseTab = (next: ItemEditorTab) => { setTab(next); const list = next === "sets" ? store.draft.sets : itemsForTab(store.draft.items, next); setSelectedId(list[0]?.id ?? ""); };
  const prepare = () => { const normalized = normalizeItemExchange(store.draft); store.setDraft(normalized); window.localStorage.setItem(ITEM_DRAFT_STORAGE_KEY, JSON.stringify(normalized)); return normalized; };
  const save = async () => { try { const exchange = prepare(); store.setMessage("Writing items to live source..."); await saveLiveCatalog("items", exchange); store.setMessage("Items and sets saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Items could not be saved to the live game"); } };
  const copy = async () => { try { await copyJson(prepare()); store.setMessage("JSON copied - paste it into Codex for special mechanics"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const add = () => { const entry = tab === "gear" ? blankGear() : tab === "consumables" ? blankConsumable() : tab === "misc" ? blankMiscItem() : blankSet(); if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: [...draft.sets, entry as GearSetDefinition] })); else store.setDraft((draft) => ({ ...draft, items: [...draft.items, entry as InventoryItem] })); setSelectedId(entry.id); };
  const remove = () => { if (!selected) return; if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: draft.sets.filter((entry) => entry.id !== selected.id), items: draft.items.map((item) => isGearItem(item) && item.set === selected.id ? { ...item, set: undefined, setName: undefined } : item) })); else store.setDraft((draft) => ({ ...draft, items: draft.items.filter((entry) => entry.id !== selected.id) })); setSelectedId(entries.find((entry) => entry.id !== selected.id)?.id ?? ""); };
  const updateSelected = (change: object) => { if (!selected) return; if (tab === "sets") store.setDraft((draft) => ({ ...draft, sets: draft.sets.map((entry) => entry.id === selected.id ? { ...entry, ...change } : entry) })); else store.setDraft((draft) => ({ ...draft, items: draft.items.map((entry) => entry.id === selected.id ? { ...entry, ...change } as typeof entry : entry) })); };
  return <EditorShell title="Item Editor" description="Create gear, gear sets, combat consumables and other inventory items. Save writes standard mechanics directly to the live game; special notes are exported for Codex." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-items.json", prepare()); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="item-editor-tabs"><button className={tab === "gear" ? "active" : ""} onClick={() => chooseTab("gear")}><Shield size={14} /> Gear</button><button className={tab === "sets" ? "active" : ""} onClick={() => chooseTab("sets")}><Gem size={14} /> Sets</button><button className={tab === "consumables" ? "active" : ""} onClick={() => chooseTab("consumables")}><FlaskConical size={14} /> Consumables</button><button className={tab === "misc" ? "active" : ""} onClick={() => chooseTab("misc")}><Package size={14} /> Other Items</button></div>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New {tab === "consumables" ? "consumable" : tab === "sets" ? "set" : tab === "misc" ? "item" : "gear"}</button>{entries.map((entry) => <button className={entry.id === selected?.id ? "selected" : ""} key={entry.id} onClick={() => setSelectedId(entry.id)}><strong>{entry.name}</strong><small>{entry.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">{tab === "sets" ? "Gear Set" : tab === "consumables" ? "Consumable Item" : tab === "misc" ? "Other Item" : "Gear Item"}</p><h2>{selected.name}</h2></div><button type="button" className="danger-icon-button" onClick={remove}><Trash2 size={14} /> Delete</button></div>{tab === "gear" ? <GearFields item={selected as GearItem} sets={store.draft.sets} allItems={store.draft.items} onChange={updateSelected} /> : tab === "sets" ? <SetFields set={selected as GearSetDefinition} onChange={updateSelected} /> : tab === "consumables" ? <ConsumableFields item={selected as ConsumableItem} allItems={store.draft.items} onChange={updateSelected} /> : <MiscItemFields item={selected as MiscItem} allItems={store.draft.items} onChange={updateSelected} />}</section>}
    </div>
  </EditorShell>;
}
