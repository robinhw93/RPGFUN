import {
  ChevronRight,
  Gem,
  Shield,
  UserRound
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GearSlotIcon } from "../../components/GearSlotIcon";
import { getCharacterAvatar } from "../../game/avatars";
import { getDerivedStats } from "../../game/character";
import { GEAR_SET_BONUSES } from "../../game/data";
import { canEquipItemInSlot, getGearCategoryLabel, getWeaponEquipType, isEquipmentSlotLocked, slotForItem } from "../../game/gear";
import { experienceToNextLevel, MAX_LEVEL } from "../../game/progression";
import type { CharacterState, GearItem, GearSlot, StatName } from "../../game/types";

import { ATTRIBUTE_SUMMARIES, ATTRIBUTE_TOOLTIPS, EQUIPMENT_SLOT_ORDER, formatStat, getDerivedStatRows, INVENTORY_GEAR_FILTERS, itemMatchesInventoryFilter, RARITY_SORT_WEIGHT, SLOT_LABELS, STAT_LABELS, StatIcon, type CharacterSection, type InventoryGearFilter, type InventorySort, type StatIconName } from "../../ui/gameUi";

export function CharacterLoadingScreen() {
  return (
    <section className="character-loading-screen" role="status" aria-live="polite">
      <span className="character-loading-sigil"><Shield /></span>
      <p className="eyebrow">Preparing Character</p>
      <h1>Preparing your character…</h1>
    </section>
  );
}

export function waitForRenderedImage(image: HTMLImageElement): Promise<void> {
  const loaded = image.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  return loaded.then(() => typeof image.decode === "function" ? image.decode().catch(() => undefined) : undefined);
}

export function CharacterAssetBoundary({ preloaded, assetKey, children }: {
  preloaded: boolean;
  assetKey: string;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [renderedAssetsReady, setRenderedAssetsReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    let revealFrame = 0;
    setRenderedAssetsReady(false);
    if (!preloaded || !contentRef.current) return () => { cancelled = true; };

    const images = [...contentRef.current.querySelectorAll<HTMLImageElement>("img")];
    Promise.all(images.map(waitForRenderedImage)).then(() => {
      revealFrame = window.requestAnimationFrame(() => {
        if (!cancelled) setRenderedAssetsReady(true);
      });
    });

    return () => {
      cancelled = true;
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
    };
  }, [preloaded, assetKey]);

  return (
    <div className="character-asset-boundary">
      <div ref={contentRef} className={`character-assets-stage ${renderedAssetsReady ? "ready" : "loading"}`} aria-hidden={!renderedAssetsReady}>
        {children}
      </div>
      {!renderedAssetsReady && <CharacterLoadingScreen />}
    </div>
  );
}

export function CharacterView({ mode, character, locked, onEquip, onUnequip, onAllocateStat }: {
  mode: Exclude<CharacterSection, "talents">;
  character: CharacterState;
  locked: boolean;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  onUnequip: (slot: GearSlot) => void;
  onAllocateStat: (stat: StatName) => void;
}) {
  const [inspectedItem, setInspectedItem] = useState<{ item: GearItem; equippedSlot?: GearSlot; preferredSlot?: GearSlot } | null>(null);
  const [selectedGearSlot, setSelectedGearSlot] = useState<GearSlot | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryGearFilter>("all");
  const [inventorySort, setInventorySort] = useState<InventorySort>("rarity");
  const modalOpen = Boolean(inspectedItem || selectedGearSlot);
  useEffect(() => {
    if (!modalOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const previousRootOverflow = root.style.overflow;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      body.style.paddingRight = previousBody.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [modalOpen]);
  const derived = getDerivedStats(character);
  const avatar = getCharacterAvatar(character.avatarId);
  const requiredExperience = experienceToNextLevel(character.level);
  const reachedMaxLevel = character.level >= MAX_LEVEL;
  const visibleInventory = character.inventory
    .filter((item) => itemMatchesInventoryFilter(item, inventoryFilter))
    .sort((left, right) => inventorySort === "name"
      ? left.name.localeCompare(right.name)
      : RARITY_SORT_WEIGHT[right.rarity] - RARITY_SORT_WEIGHT[left.rarity] || left.name.localeCompare(right.name));
  const activeInventoryFilter = INVENTORY_GEAR_FILTERS.find((filter) => filter.id === inventoryFilter)!;
  return (
    <section className="page character-page">
      {mode === "overview" ? <>
        <div className="page-title"><div><p className="eyebrow">Level {character.level} Wayfarer</p><h1>{character.name}</h1><div className="character-xp"><span><i style={{ width: reachedMaxLevel ? "100%" : `${Math.min(100, (character.xp / requiredExperience) * 100)}%` }} /></span><small>{reachedMaxLevel ? "Max Level" : `${character.xp} / ${requiredExperience} XP`}</small></div></div></div>
        <div className="character-layout character-overview-layout">
        <div className="paper-panel">
          <div className="panel-title"><span><UserRound size={17} /> Attributes</span>{character.unspentStatPoints > 0 && <strong className="stat-points-available unspent-points-indicator">{character.unspentStatPoints} Points Available</strong>}</div>
          <div className="stats-list">
            {STAT_LABELS.map((stat) => <div key={stat.key} data-game-tooltip={ATTRIBUTE_TOOLTIPS[stat.key]}><span className="stat-rune"><StatIcon stat={stat.key} /></span><span><strong>{stat.label}</strong><small>{ATTRIBUTE_SUMMARIES[stat.key]}</small></span><span className="stat-value-actions"><b>{formatStat(derived[stat.key])}</b>{character.unspentStatPoints > 0 && <button type="button" className="allocate-stat-button" disabled={locked} onClick={() => onAllocateStat(stat.key)} aria-label={`Add one point to ${stat.label}`}>+</button>}</span></div>)}
          </div>
          <div className="derived-grid">
            {getDerivedStatRows(derived).map((stat) => <span key={stat.label} data-game-tooltip={stat.tooltip}><StatIcon stat={stat.icon} /> <small>{stat.label}</small><strong>{stat.value}</strong></span>)}
          </div>
        </div>
        </div>
      </> : <>
      <div className="page-title"><div><p className="eyebrow">Character Loadout</p><h1>Equipment and Inventory</h1><p>Prepare your gear and organize the items gathered on your journey.</p></div></div>
      <div className="character-layout equipment-layout">
        <div className="paper-panel equipment-panel">
          <div className="panel-title"><span><Shield size={17} /> Equipment</span></div>
          <div className="equipment-paper-doll">
            <div className="character-silhouette" aria-hidden="true">
              <img src={avatar.imageUrl} alt="" draggable={false} decoding="sync" />
            </div>
            {EQUIPMENT_SLOT_ORDER.map((slot) => {
              const item = character.equipment[slot];
              const slotLocked = isEquipmentSlotLocked(slot, character.equipment);
              return (
                <button
                  type="button"
                  className={`paper-doll-slot slot-${slot} ${item ? item.rarity : "empty"}${slotLocked ? " locked" : ""}`}
                  key={slot}
                  onClick={() => setSelectedGearSlot(slot)}
                  aria-label={`Choose equipment for ${SLOT_LABELS[slot]}${item ? `, currently ${item.name}` : slotLocked ? ", slot locked" : ", currently empty"}`}
                >
                  <small>{SLOT_LABELS[slot]}</small>
                  <span className="paper-doll-slot-glyph"><GearSlotIcon slot={slot} item={item} /></span>
                  <strong>{slotLocked ? "Locked" : item?.name ?? "Empty"}</strong>
                  {slotLocked && <em>Two-Hand weapon equipped</em>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-heading inventory-heading"><div><h2>Inventory</h2></div><span className={locked ? "lock-note" : "muted"}>{locked ? "Equipment is locked during combat" : "Tap an item to view its details"}</span></div>
      <div className="inventory-controls">
        <div className="inventory-tabs" role="tablist" aria-label="Filter inventory by gear slot">
          {INVENTORY_GEAR_FILTERS.map((filter) => {
            const count = character.inventory.filter((item) => itemMatchesInventoryFilter(item, filter.id)).length;
            return <button type="button" role="tab" aria-selected={inventoryFilter === filter.id} className={inventoryFilter === filter.id ? "selected" : ""} key={filter.id} onClick={() => setInventoryFilter(filter.id)}><span>{filter.label}</span><small>{count}</small></button>;
          })}
        </div>
        <div className="inventory-sort" role="group" aria-label="Sort inventory">
          <span>Sort</span>
          <button type="button" className={inventorySort === "rarity" ? "selected" : ""} aria-pressed={inventorySort === "rarity"} onClick={() => setInventorySort("rarity")}>Rarity</button>
          <button type="button" className={inventorySort === "name" ? "selected" : ""} aria-pressed={inventorySort === "name"} onClick={() => setInventorySort("name")}>Name</button>
        </div>
      </div>
      <div className="inventory-grid">
        {visibleInventory.length ? visibleInventory.map((item, index) => <button key={`${item.id}-${index}`} className={`item-card ${item.rarity}`} onClick={() => setInspectedItem({ item })}><span className="item-glyph"><GearSlotIcon slot={item.slot} item={item} size={25} /></span><span className="rarity">{item.rarity} · {getGearCategoryLabel(item)}</span><strong>{item.name}</strong><p>{item.description}</p><span className="equip-cta">View Details <ChevronRight size={14} /></span></button>) : <div className="empty-inventory">{character.inventory.length ? `No ${activeInventoryFilter.label.toLowerCase()} items in your inventory.` : "Your pack is empty. Adventure awaits."}</div>}
      </div>
      </>}
      {selectedGearSlot && (
        <GearSlotPickerModal
          slot={selectedGearSlot}
          character={character}
          locked={locked}
          onClose={() => setSelectedGearSlot(null)}
          onInspect={(item, equippedSlot) => {
            setSelectedGearSlot(null);
            setInspectedItem({ item, equippedSlot, preferredSlot: equippedSlot ? undefined : selectedGearSlot });
          }}
        />
      )}
      {inspectedItem && (
        <ItemDetailModal
          item={inspectedItem.item}
          equippedSlot={inspectedItem.equippedSlot}
          preferredSlot={inspectedItem.preferredSlot}
          character={character}
          locked={locked}
          onClose={() => setInspectedItem(null)}
          onEquip={(item, slot) => { onEquip(item, slot); setInspectedItem(null); }}
          onUnequip={(slot) => { onUnequip(slot); setInspectedItem(null); }}
        />
      )}
    </section>
  );
}

export function GearSlotPickerModal({ slot, character, locked, onClose, onInspect }: {
  slot: GearSlot;
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onInspect: (item: GearItem, equippedSlot?: GearSlot) => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const equippedItem = character.equipment[slot];
  const compatibleItems = character.inventory.filter((item) => canEquipItemInSlot(item, slot));
  const slotLocked = isEquipmentSlotLocked(slot, character.equipment);

  const itemRow = (item: GearItem, current = false) => (
    <button type="button" className={`gear-choice-row ${item.rarity}`} key={`${current ? "equipped" : "inventory"}-${item.id}`} onClick={() => onInspect(item, current ? slot : undefined)}>
      <span className="gear-choice-icon"><GearSlotIcon slot={item.slot} item={item} size={34} /></span>
      <span><small>{item.rarity} · {getGearCategoryLabel(item)}</small><strong>{item.name}</strong><em>{item.description}</em></span>
      <span className="gear-choice-action">{current ? "View Equipped" : locked || slotLocked ? "View Details" : "Select"}<ChevronRight size={15} /></span>
    </button>
  );

  return (
    <div className="item-detail-backdrop" role="dialog" aria-modal="true" aria-label={`${SLOT_LABELS[slot]} equipment`} onClick={onClose}>
      <article className="gear-slot-picker" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="item-detail-close" onClick={onClose} aria-label="Close equipment list">×</button>
        <header className="gear-slot-picker-header">
          <div><h2>Equipment Slot - {SLOT_LABELS[slot]}</h2><p>Choose an item from your inventory.</p></div>
        </header>
        {slotLocked && <p className="item-action-lock"><Shield size={14} /> Unequip your Two-Hand weapon before using this slot.</p>}
        {equippedItem && <section className="gear-choice-section"><h3>Currently Equipped</h3>{itemRow(equippedItem, true)}</section>}
        <section className="gear-choice-section">
          <h3>Available Items <small>{compatibleItems.length}</small></h3>
          <div className="gear-choice-list">{compatibleItems.length > 0 ? compatibleItems.map((item) => itemRow(item)) : <p className="gear-choice-empty">You have no items that can be equipped in this slot.</p>}</div>
        </section>
      </article>
    </div>
  );
}

export const ITEM_STAT_LABELS: Record<StatName, string> = {
  strength: "Strength",
  agility: "Agility",
  intelligence: "Intelligence",
  vitality: "Vitality",
  luck: "Luck",
};

export type ItemStatLine = { label: string; value: number; icon?: StatIconName };

export function getItemStatLines(item: GearItem): ItemStatLine[] {
  const lines: ItemStatLine[] = (Object.entries(item.stats) as Array<[StatName, number | undefined]>).flatMap(([stat, value]) => value ? [{ label: ITEM_STAT_LABELS[stat], value, icon: stat }] : []);
  if (item.armor) lines.push({ label: "Armor", value: item.armor, icon: "armor" });
  if (item.magicResistance) lines.push({ label: "Magic Resistance", value: item.magicResistance, icon: "magicResistance" });
  if (item.physicalPower) lines.push({ label: "Physical Power", value: item.physicalPower, icon: "physicalPower" });
  if (item.magicalPower) lines.push({ label: "Spell Power", value: item.magicalPower, icon: "magicalPower" });
  if (item.power) lines.push({ label: "Power", value: item.power, icon: "physicalPower" });
  return lines.sort((left, right) => left.label.localeCompare(right.label));
}

export function getItemComparisonLines(current: GearItem, candidate: GearItem): Array<{ label: string; current: number; candidate: number; difference: number; icon?: StatIconName }> {
  const currentLines = getItemStatLines(current);
  const candidateLines = getItemStatLines(candidate);
  const currentStats = new Map(currentLines.map((stat) => [stat.label, stat.value]));
  const candidateStats = new Map(candidateLines.map((stat) => [stat.label, stat.value]));
  const icons = new Map([...currentLines, ...candidateLines].map((stat) => [stat.label, stat.icon]));
  const labels = [...new Set([...currentStats.keys(), ...candidateStats.keys()])];
  return labels.map((label) => {
    const currentValue = currentStats.get(label) ?? 0;
    const candidateValue = candidateStats.get(label) ?? 0;
    return { label, current: currentValue, candidate: candidateValue, difference: candidateValue - currentValue, icon: icons.get(label) };
  });
}

export function ItemDetailModal({ item, equippedSlot, preferredSlot, character, locked, onClose, onEquip, onUnequip }: {
  item: GearItem;
  equippedSlot?: GearSlot;
  preferredSlot?: GearSlot;
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  onUnequip: (slot: GearSlot) => void;
}) {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const stats = getItemStatLines(item);
  const equippedEntries = Object.entries(character.equipment) as Array<[GearSlot, GearItem]>;
  const setBonuses = item.set ? GEAR_SET_BONUSES.filter((bonus) => bonus.setId === item.set) : [];
  const equippedSetPieces = item.set ? equippedEntries.filter(([, equipped]) => equipped.set === item.set).length : 0;
  const equipType = getWeaponEquipType(item);
  const offHandLocked = isEquipmentSlotLocked("offHand", character.equipment);
  const actionLocked = locked || (preferredSlot ? isEquipmentSlotLocked(preferredSlot, character.equipment) : equipType === "offHand" && offHandLocked);
  const comparisonSlot = preferredSlot ?? slotForItem(item, character.equipment);
  const comparisonItem = equippedSlot ? undefined : character.equipment[comparisonSlot];
  const comparisonLines = comparisonItem ? getItemComparisonLines(comparisonItem, item) : [];

  return (
    <div className="item-detail-backdrop" role="dialog" aria-modal="true" aria-label={`${item.name} details`} onClick={onClose}>
      <article className="item-detail-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="item-detail-close" onClick={onClose} aria-label="Close item details">×</button>
        <header className="item-detail-header">
          <span className={`item-detail-icon ${item.rarity}`}><GearSlotIcon slot={item.slot} item={item} size={58} /></span>
          <span>
            <small>{item.rarity} · {getGearCategoryLabel(item)}</small>
            <h2 className={`item-name-${item.rarity}`}>{item.name}</h2>
            <p>{item.description}</p>
          </span>
        </header>

        <section className="item-detail-section">
          <h3>Item Stats</h3>
          {stats.length ? <div className="item-stat-grid">{stats.map((stat) => <span key={stat.label}><small className="item-stat-label">{stat.icon && <StatIcon stat={stat.icon} />}{stat.label}</small><strong>+{stat.value}</strong></span>)}</div> : <p className="item-detail-muted">This item grants no direct stat bonuses.</p>}
        </section>

        {item.set && (
          <section className="item-detail-section item-set-section">
            <div className="item-set-title"><Gem size={16} /><strong>{item.setName ?? item.set} Set</strong></div>
            {setBonuses.length > 0 && <div className="item-set-bonuses">{setBonuses.map((bonus) => <span className={equippedSetPieces >= bonus.requiredPieces ? "unlocked" : "locked"} key={bonus.requiredPieces}><strong>{bonus.requiredPieces} Pieces:</strong><em>{bonus.description}</em></span>)}</div>}
          </section>
        )}

        {comparisonOpen && comparisonItem && (
          <section className="item-comparison" aria-label={`Compare ${item.name} with ${comparisonItem.name}`}>
            <h3>Item Comparison</h3>
            <div className="comparison-items">
              <div><small>Currently Equipped</small><span><GearSlotIcon slot={comparisonItem.slot} item={comparisonItem} size={34} /><strong className={`item-name-${comparisonItem.rarity}`}>{comparisonItem.name}</strong></span></div>
              <div><small>New Item</small><span><GearSlotIcon slot={item.slot} item={item} size={34} /><strong className={`item-name-${item.rarity}`}>{item.name}</strong></span></div>
            </div>
            <div className="comparison-stats">
              {comparisonLines.length > 0 ? comparisonLines.map((stat) => (
                <div key={stat.label}>
                  <strong className="comparison-stat-label">{stat.icon && <StatIcon stat={stat.icon} />}{stat.label}</strong>
                  <span>{stat.current} <i>→</i> {stat.candidate}</span>
                  <em className={stat.difference > 0 ? "positive" : stat.difference < 0 ? "negative" : "neutral"}>{stat.difference > 0 ? `+${stat.difference}` : stat.difference < 0 ? stat.difference : "—"}</em>
                </div>
              )) : <p className="item-detail-muted">These items grant no direct stat bonuses.</p>}
            </div>
          </section>
        )}

        {locked && <p className="item-action-lock"><Shield size={14} /> Equipment cannot be changed during combat.</p>}
        <div className="item-detail-actions">
          {comparisonItem && <button type="button" className="item-compare-button" aria-expanded={comparisonOpen} onClick={() => setComparisonOpen((open) => !open)}>{comparisonOpen ? "Close Comparison" : "Compare"}</button>}
          {equippedSlot ? (
            <button type="button" className="item-unequip-button" disabled={locked} onClick={() => onUnequip(equippedSlot)}>Unequip</button>
          ) : preferredSlot ? (
            <button type="button" disabled={actionLocked} onClick={() => onEquip(item, preferredSlot)}>{actionLocked && !locked ? `${SLOT_LABELS[preferredSlot]} Locked` : `Equip in ${SLOT_LABELS[preferredSlot]}`}</button>
          ) : equipType === "oneHand" ? (
            <>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "mainHand")}>Equip Main Hand</button>
              <button type="button" disabled={locked || offHandLocked} onClick={() => onEquip(item, "offHand")}>{offHandLocked ? "Off Hand Locked" : "Equip Off Hand"}</button>
            </>
          ) : item.slot === "ring" ? (
            <>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "ring1")}>Equip Ring I</button>
              <button type="button" disabled={locked} onClick={() => onEquip(item, "ring2")}>Equip Ring II</button>
            </>
          ) : (
            <button type="button" disabled={actionLocked} onClick={() => onEquip(item)}>{offHandLocked && equipType === "offHand" ? "Off Hand Locked" : "Equip"}</button>
          )}
        </div>
      </article>
    </div>
  );
}
