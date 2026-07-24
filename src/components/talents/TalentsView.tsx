import {
  ChevronRight,
  Shield,
  Sparkles,
  Swords,
  ZoomIn, ZoomOut
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCost } from "../../game/combatFeatures";
import { ABILITIES, TALENT_TREE_CANVAS, TALENTS } from "../../game/data";
import { areTalentRequirementsMet, getTalentConnectionIds, isAdditionalClassTalentLocked } from "../../game/talentRequirements";
import type { CharacterState } from "../../game/types";

import { AbilityTypeIcon, getAbilityTypeLabel, getAvailableCharacterAbilities } from "../../ui/gameUi";

export const RUNTIME_TALENT_MIN_ZOOM = 0.2;
export const RUNTIME_TALENT_MAX_ZOOM = 1.6;
export const RUNTIME_TALENT_DEFAULT_ZOOM = 0.65;
export const RUNTIME_TALENT_MOBILE_ZOOM_STEP = 0.2;
export const RUNTIME_TALENT_SCREEN_GUTTER = 80;

export type RuntimeTalentPointer = { clientX: number; clientY: number };
export type RuntimeTalentGesture = {
  primaryPointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  candidateTalentId: string | null;
  moved: boolean;
};

export function TalentDetailModal({ talent, character, locked, freeUnlocks, onClose, onUnlock, onToggleAbility }: {
  talent: (typeof TALENTS)[number];
  character: CharacterState;
  locked: boolean;
  freeUnlocks: boolean;
  onClose: () => void;
  onUnlock: (id: string) => void;
  onToggleAbility: (id: string) => void;
}) {
  const ability = talent.abilityId ? ABILITIES[talent.abilityId] : null;
  const abilityDescription = ability ? getCharacterAbilityDescription(character, ability) : null;
  const abilityEnergyCost = ability ? getCharacterAbilityEnergyCost(character, ability) : 0;
  const abilityCooldownTurns = ability ? getCharacterAbilityCooldownTurns(character, ability) : 0;
  const unlocked = character.unlockedTalents.includes(talent.id);
  const requirementsMet = areTalentRequirementsMet(talent, character.unlockedTalents, TALENTS);
  const classLevelLocked = isAdditionalClassTalentLocked(talent, character.unlockedTalents, character.level, TALENTS);
  const available = requirementsMet && !classLevelLocked;
  const abilityEquipped = Boolean(ability && character.equippedAbilities.includes(ability.id));
  const loadoutFull = character.equippedAbilities.length >= 6;
  const classBonus = talent.kind === "class" ? talent.description.replace(/\s*Unlocks?[^.]*\.?$/i, "").trim() : talent.description;
  const requiredNames = getTalentConnectionIds(talent.id, TALENTS)
    .filter((id) => !character.unlockedTalents.includes(id))
    .map((id) => TALENTS.find((candidate) => candidate.id === id)?.name ?? id);
  const canUnlock = !locked && available && (freeUnlocks || character.talentPoints >= talent.cost) && !unlocked;
  const typeLabel = talent.kind === "ability" ? "Ability" : talent.kind === "passive" ? "Passive" : "Class";

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    const previousOverflow = document.documentElement.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const unlockLabel = locked
    ? "Locked during combat"
    : classLevelLocked
      ? "Requires Level 10"
    : !requirementsMet
      ? `Requires one of: ${requiredNames.join(", ")}`
      : freeUnlocks
        ? "Unlock for Free"
        : character.talentPoints < talent.cost
        ? `Requires ${talent.cost} Talent Point${talent.cost === 1 ? "" : "s"}`
        : `Unlock for ${talent.cost} Talent Point${talent.cost === 1 ? "" : "s"}`;

  return (
    <div className="talent-detail-modal" role="dialog" aria-modal="true" aria-label={`${talent.name} details`} onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={`talent-detail-card ${talent.branch}`}>
        <button type="button" className="talent-detail-x" onClick={onClose} aria-label="Close talent details">×</button>
        <div className="talent-detail-heading">
          <div><p className="eyebrow">{typeLabel}</p><h2>{talent.name}</h2></div>
          {(talent.id === "origin" || unlocked || !available) && <span className={`talent-detail-state ${unlocked ? "unlocked" : "locked"}`}>{talent.id === "origin" ? "Starting Node" : unlocked ? "Unlocked" : "Locked"}</span>}
        </div>
        {ability ? (
          <>
            {talent.kind === "class" && (
              <div className="talent-ability-grant">
                <small>Ability Granted</small>
                <strong><span aria-hidden="true">{ability.icon}</span>{ability.name}</strong>
                <p>Unlocking this class node permanently adds this ability to your available loadout.</p>
              </div>
            )}
            <div className="talent-ability-metrics">
              <span><small>Type</small><strong>{getAbilityTypeLabel(ability)}</strong></span>
              <span><small>Energy</small><strong>{abilityEnergyCost}</strong></span>
              <span><small>Cooldown</small><strong>{abilityCooldownTurns ? `${abilityCooldownTurns} ${abilityCooldownTurns === 1 ? "turn" : "turns"}` : "None"}</strong></span>
              <span><small>Range</small><strong>{ability.range === "ranged" ? "Ranged" : "Melee"}</strong></span>
            </div>
            <div className="talent-detail-effect"><small>Ability Effect</small><p>{abilityDescription}</p></div>
            {talent.kind === "class" && <div className="talent-detail-effect"><small>Passive Bonus</small><p>{classBonus}</p></div>}
          </>
        ) : <div className="talent-detail-effect"><small>{talent.kind === "class" ? "Passive Bonus" : "Effect"}</small><p>{talent.description}</p></div>}
        {classLevelLocked && <p className="talent-class-level-lock">You need to be lvl 10 before you can unlock another Class Node.</p>}
        <div className="talent-detail-actions">
          {talent.id !== "origin" && !unlocked && <button type="button" className="talent-detail-primary" disabled={!canUnlock} onClick={() => onUnlock(talent.id)}>{unlockLabel}</button>}
          {unlocked && ability && <button type="button" className="talent-detail-primary" disabled={locked || (!abilityEquipped && loadoutFull)} onClick={() => onToggleAbility(ability.id)}>{abilityEquipped ? "Unequip Ability" : loadoutFull ? "Loadout Full" : "Equip Ability"}</button>}
        </div>
      </article>
    </div>
  );
}

export function AbilitySlotPicker({ slotIndex, character, onClose, onSetSlot }: {
  slotIndex: number;
  character: CharacterState;
  onClose: () => void;
  onSetSlot: (slotIndex: number, abilityId: string | null) => void;
}) {
  const currentAbilityId = character.equippedAbilities[slotIndex] ?? null;
  const abilities = getAvailableCharacterAbilities(character);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const previousRootOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="ability-slot-picker" role="dialog" aria-modal="true" aria-label={`Choose Ability for Slot ${slotIndex + 1}`} onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className="ability-slot-picker-card">
        <div className="ability-slot-picker-heading">
          <div><p className="eyebrow">Equipped Ability Slot {slotIndex + 1}</p><h2>Choose Ability</h2></div>
          <button type="button" onClick={onClose} aria-label="Close ability picker">Close</button>
        </div>
        <p className="ability-slot-picker-copy">Choose an unlocked ability for this combat slot.</p>
        <div className="ability-slot-picker-list">
          {abilities.map((ability) => {
            const abilityDescription = getCharacterAbilityDescription(character, ability);
            const energyCost = getCharacterAbilityEnergyCost(character, ability);
            const cooldownTurns = getCharacterAbilityCooldownTurns(character, ability);
            const equippedSlot = character.equippedAbilities.indexOf(ability.id);
            const equippedHere = equippedSlot === slotIndex;
            const occupiedTarget = currentAbilityId !== null;
            const unavailableForEmptySlot = !occupiedTarget && equippedSlot >= 0;
            const slotLabel = equippedHere
              ? "Equipped here"
              : equippedSlot >= 0
                ? occupiedTarget ? `Swap with Slot ${equippedSlot + 1}` : `Equipped in Slot ${equippedSlot + 1}`
                : "Equip here";
            return (
              <button
                type="button"
                key={ability.id}
                className={`ability-slot-picker-option ${ability.branch} ${equippedHere ? "current" : ""}`}
                disabled={equippedHere || unavailableForEmptySlot}
                onClick={() => { onSetSlot(slotIndex, ability.id); onClose(); }}
              >
                <span className="ability-slot-picker-icon" aria-hidden="true"><AbilityTypeIcon ability={ability} /></span>
                <span className="ability-slot-picker-info"><strong>{ability.name}</strong><small>{abilityDescription}</small></span>
                <span className="ability-slot-picker-metrics"><small>{getAbilityTypeLabel(ability)}</small><small>{energyCost} Energy</small><small>{cooldownTurns} CD · {ability.range === "ranged" ? "Ranged" : "Melee"}</small><em>{slotLabel}</em></span>
              </button>
            );
          })}
        </div>
        <div className="ability-slot-picker-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          {currentAbilityId && <button type="button" className="unequip" onClick={() => { onSetSlot(slotIndex, null); onClose(); }}>Unequip Slot</button>}
        </div>
      </article>
    </div>
  );
}

export function AbilityLoadoutModal({ character, locked, onClose, onSelectSlot }: {
  character: CharacterState;
  locked: boolean;
  onClose: () => void;
  onSelectSlot: (slotIndex: number) => void;
}) {
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousBody = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const previousRootOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBody.overflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.width = previousBody.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="ability-loadout-dialog" role="dialog" aria-modal="true" aria-label="Equipped Abilities" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className="ability-loadout-card">
        <div className="ability-loadout-heading">
          <div><p className="eyebrow">Active Loadout</p><h2>Equipped Abilities</h2></div>
          <button type="button" onClick={onClose} aria-label="Close equipped abilities">Close</button>
        </div>
        <p className="ability-loadout-copy">Choose an equipped or empty slot to change the abilities available in combat.</p>
        {locked && <div className="lock-banner"><Shield size={15} /> Ability loadouts are locked during combat.</div>}
        <div className="loadout-slots ability-loadout-slots">
          {Array.from({ length: 6 }).map((_, index) => {
            const id = character.equippedAbilities[index];
            const ability = id ? ABILITIES[id] : null;
            return (
              <button key={index} type="button" disabled={locked} className={ability ? ability.branch : "empty"} aria-label={`Ability Slot ${index + 1}: ${ability?.name ?? "Empty"}. Choose ability.`} onClick={() => onSelectSlot(index)} data-game-tooltip="Choose ability">
                {ability ? <><span>{ability.icon}</span><small>{ability.name}</small></> : <><span>+</span><small>Empty</small></>}
              </button>
            );
          })}
        </div>
      </article>
    </div>
  );
}

export function TalentsView({ character, locked, freeUnlocks, onUnlock, onToggleAbility, onSetAbilitySlot }: { character: CharacterState; locked: boolean; freeUnlocks: boolean; onUnlock: (id: string) => void; onToggleAbility: (id: string) => void; onSetAbilitySlot: (slotIndex: number, abilityId: string | null) => void }) {
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [selectedAbilitySlot, setSelectedAbilitySlot] = useState<number | null>(null);
  const [abilityLoadoutOpen, setAbilityLoadoutOpen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const treeSurfaceRef = useRef<HTMLDivElement>(null);
  const treeCanvasRef = useRef<HTMLDivElement>(null);
  const treeZoomRef = useRef(RUNTIME_TALENT_DEFAULT_ZOOM);
  const treeZoomTargetRef = useRef(RUNTIME_TALENT_DEFAULT_ZOOM);
  const treeZoomFrameRef = useRef<number | null>(null);
  const treeDimensionsRef = useRef({ width: 0, height: 0 });
  const treePointersRef = useRef(new Map<number, RuntimeTalentPointer>());
  const treeGestureRef = useRef<RuntimeTalentGesture | null>(null);
  const closeTalentDetails = useCallback(() => setSelectedTalentId(null), []);
  const closeAbilityLoadout = useCallback(() => setAbilityLoadoutOpen(false), []);
  const padding = 260;
  const xs = TALENTS.map((talent) => talent.position.x / 100 * TALENT_TREE_CANVAS.width);
  const ys = TALENTS.map((talent) => talent.position.y / 100 * TALENT_TREE_CANVAS.height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const treeWidth = Math.max(520, maxX - minX + padding * 2);
  const treeHeight = Math.max(390, maxY - minY + padding * 2);
  treeDimensionsRef.current = { width: treeWidth, height: treeHeight };
  const nodePositions = new Map(TALENTS.map((talent) => [talent.id, {
    x: padding + talent.position.x / 100 * TALENT_TREE_CANVAS.width - minX,
    y: padding + talent.position.y / 100 * TALENT_TREE_CANVAS.height - minY,
  }]));
  const selectedTalent = TALENTS.find((talent) => talent.id === selectedTalentId) ?? null;

  const zoomTreeTo = useCallback((requestedZoom: number, anchorClientX?: number, anchorClientY?: number) => {
    const scroller = treeScrollRef.current;
    const surface = treeSurfaceRef.current;
    const canvas = treeCanvasRef.current;
    const nextZoom = Math.max(RUNTIME_TALENT_MIN_ZOOM, Math.min(RUNTIME_TALENT_MAX_ZOOM, Math.round(requestedZoom * 1000) / 1000));
    if (!scroller || !surface || !canvas || nextZoom === treeZoomRef.current) return;
    const scrollRect = scroller.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const clientX = anchorClientX ?? scrollRect.left + scroller.clientWidth / 2;
    const clientY = anchorClientY ?? scrollRect.top + scroller.clientHeight / 2;
    const anchorX = clientX - scrollRect.left;
    const anchorY = clientY - scrollRect.top;
    const worldX = (clientX - canvasRect.left) / treeZoomRef.current;
    const worldY = (clientY - canvasRect.top) / treeZoomRef.current;
    treeZoomRef.current = nextZoom;
    canvas.style.transform = `scale(${nextZoom})`;
    surface.style.width = `${treeDimensionsRef.current.width * nextZoom + RUNTIME_TALENT_SCREEN_GUTTER * 2}px`;
    surface.style.height = `${treeDimensionsRef.current.height * nextZoom + RUNTIME_TALENT_SCREEN_GUTTER * 2}px`;
    scroller.scrollLeft = RUNTIME_TALENT_SCREEN_GUTTER + worldX * nextZoom - anchorX;
    scroller.scrollTop = RUNTIME_TALENT_SCREEN_GUTTER + worldY * nextZoom - anchorY;
  }, []);

  const animateTreeZoom = useCallback(() => {
    if (treeZoomFrameRef.current !== null) return;
    const step = () => {
      const difference = treeZoomTargetRef.current - treeZoomRef.current;
      if (Math.abs(difference) < 0.001) {
        zoomTreeTo(treeZoomTargetRef.current);
        treeZoomFrameRef.current = null;
        return;
      }
      zoomTreeTo(treeZoomRef.current + difference * 0.24);
      treeZoomFrameRef.current = window.requestAnimationFrame(step);
    };
    treeZoomFrameRef.current = window.requestAnimationFrame(step);
  }, [zoomTreeTo]);

  const stepMobileTreeZoom = useCallback((direction: -1 | 1) => {
    const nextZoom = Math.max(
      RUNTIME_TALENT_MIN_ZOOM,
      Math.min(
        RUNTIME_TALENT_MAX_ZOOM,
        Math.round((treeZoomTargetRef.current + direction * RUNTIME_TALENT_MOBILE_ZOOM_STEP) * 100) / 100,
      ),
    );
    treeZoomTargetRef.current = nextZoom;
    zoomTreeTo(nextZoom);
  }, [zoomTreeTo]);

  useEffect(() => {
    const scroller = treeScrollRef.current;
    if (!scroller) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const normalizedDelta = event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2 ? event.deltaY * scroller.clientHeight : event.deltaY;
      treeZoomTargetRef.current = Math.max(
        RUNTIME_TALENT_MIN_ZOOM,
        Math.min(RUNTIME_TALENT_MAX_ZOOM, treeZoomTargetRef.current * Math.exp(-normalizedDelta * 0.0013)),
      );
      animateTreeZoom();
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", handleWheel);
      if (treeZoomFrameRef.current !== null) window.cancelAnimationFrame(treeZoomFrameRef.current);
      treeZoomFrameRef.current = null;
    };
  }, [animateTreeZoom]);

  useEffect(() => {
    const scroller = treeScrollRef.current;
    const origin = nodePositions.get("origin");
    if (!scroller || !origin) return;
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, RUNTIME_TALENT_SCREEN_GUTTER + origin.x * treeZoomRef.current - scroller.clientWidth / 2);
      scroller.scrollTop = Math.max(0, RUNTIME_TALENT_SCREEN_GUTTER + origin.y * treeZoomRef.current - scroller.clientHeight / 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [treeHeight, treeWidth]);

  const beginTreeGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0 && event.button !== 1) return;
    const scroller = treeScrollRef.current;
    if (!scroller) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    treePointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

    if (!treeGestureRef.current) {
      const candidateNode = event.button === 0
        ? (event.target as HTMLElement).closest<HTMLElement>("[data-talent-id]")
        : null;
      treeGestureRef.current = {
        primaryPointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: scroller.scrollLeft,
        scrollTop: scroller.scrollTop,
        candidateTalentId: candidateNode?.dataset.talentId ?? null,
        moved: event.button === 1,
      };
      if (event.button === 1) setIsPanning(true);
    }

    if (treePointersRef.current.size >= 2) {
      const gesture = treeGestureRef.current;
      gesture.moved = true;
      gesture.candidateTalentId = null;
      setIsPanning(false);
    }
  };

  const moveTreeGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = treeGestureRef.current;
    const scroller = treeScrollRef.current;
    if (!gesture || !treePointersRef.current.has(event.pointerId) || !scroller) return;
    event.preventDefault();
    treePointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

    if (treePointersRef.current.size >= 2) {
      gesture.moved = true;
      return;
    }

    if (event.pointerId !== gesture.primaryPointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.moved && Math.hypot(deltaX, deltaY) >= 6) {
      gesture.moved = true;
      gesture.candidateTalentId = null;
      setIsPanning(true);
    }
    if (!gesture.moved) return;
    scroller.scrollLeft = gesture.scrollLeft - deltaX;
    scroller.scrollTop = gesture.scrollTop - deltaY;
  };

  const endTreeGesture = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = treeGestureRef.current;
    if (!gesture || !treePointersRef.current.has(event.pointerId)) return;
    if (cancelled) gesture.moved = true;
    treePointersRef.current.delete(event.pointerId);

    if (treePointersRef.current.size === 0) {
      const selectedId = !gesture.moved && event.pointerId === gesture.primaryPointerId ? gesture.candidateTalentId : null;
      treeGestureRef.current = null;
      setIsPanning(false);
      if (selectedId) setSelectedTalentId(selectedId);
      return;
    }

    const [remainingId, remainingPointer] = [...treePointersRef.current.entries()][0];
    const scroller = treeScrollRef.current;
    treeGestureRef.current = {
      primaryPointerId: remainingId,
      startX: remainingPointer.clientX,
      startY: remainingPointer.clientY,
      scrollLeft: scroller?.scrollLeft ?? 0,
      scrollTop: scroller?.scrollTop ?? 0,
      candidateTalentId: null,
      moved: true,
    };
  };

  return (
    <section className="page talents-page">
      <div className="talent-loadout-actions">
        <button type="button" className="talent-loadout-trigger" onClick={() => setAbilityLoadoutOpen(true)}>
          <Swords size={18} />
          <span><small>Combat Loadout</small><strong>Equipped Abilities</strong></span>
          <em>{character.equippedAbilities.length} / 6</em>
          <ChevronRight size={17} />
        </button>
      </div>
      {locked && <div className="lock-banner"><Shield size={15} /> Talents and ability loadouts are locked during combat.</div>}
      {freeUnlocks && !locked && <div className="testing-talent-banner"><Sparkles size={15} /> Shadow Proving Grounds: talents unlock for free.</div>}
      <div className="runtime-talent-stage">
        <div ref={treeScrollRef} className="talent-tree runtime-talent-tree" aria-label="Talent tree">
        <div ref={treeSurfaceRef} className="runtime-talent-zoom-surface" style={{ width: treeWidth * RUNTIME_TALENT_DEFAULT_ZOOM + RUNTIME_TALENT_SCREEN_GUTTER * 2, height: treeHeight * RUNTIME_TALENT_DEFAULT_ZOOM + RUNTIME_TALENT_SCREEN_GUTTER * 2 }}>
          <div ref={treeCanvasRef} className={`talent-map runtime-talent-map ${isPanning ? "panning" : ""}`} style={{ width: treeWidth, height: treeHeight, left: RUNTIME_TALENT_SCREEN_GUTTER, top: RUNTIME_TALENT_SCREEN_GUTTER, transform: `scale(${RUNTIME_TALENT_DEFAULT_ZOOM})` }} onPointerDown={beginTreeGesture} onPointerMove={moveTreeGesture} onPointerUp={(event) => endTreeGesture(event)} onPointerCancel={(event) => endTreeGesture(event, true)} onLostPointerCapture={(event) => endTreeGesture(event, true)}>
            <svg className="runtime-talent-connections" viewBox={`0 0 ${treeWidth} ${treeHeight}`} aria-hidden="true">
              <defs>
                <mask id="runtime-talent-connection-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={treeWidth} height={treeHeight}>
                  <rect width={treeWidth} height={treeHeight} fill="white" />
                  {TALENTS.map((talent) => {
                    const position = nodePositions.get(talent.id)!;
                    return talent.shape === "circle"
                      ? <circle key={talent.id} cx={position.x} cy={position.y} r="47" fill="black" />
                      : <rect key={talent.id} x={position.x - 61} y={position.y - 61} width="122" height="122" fill="black" />;
                  })}
                </mask>
              </defs>
              <g mask="url(#runtime-talent-connection-mask)">
                {TALENTS.flatMap((talent) => talent.requires.map((requirement) => {
                  const from = nodePositions.get(requirement);
                  const to = nodePositions.get(talent.id);
                  if (!from || !to) return null;
                  const active = character.unlockedTalents.includes(requirement) && character.unlockedTalents.includes(talent.id);
                  return <line key={`${requirement}-${talent.id}`} className={active ? "active" : ""} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
                }))}
              </g>
            </svg>
            {TALENTS.map((talent) => {
              const unlocked = character.unlockedTalents.includes(talent.id);
              const available = areTalentRequirementsMet(talent, character.unlockedTalents, TALENTS)
                && !isAdditionalClassTalentLocked(talent, character.unlockedTalents, character.level, TALENTS);
              const state = unlocked ? "unlocked" : available ? "available" : "locked";
              const position = nodePositions.get(talent.id)!;
              const typeLabel = talent.kind === "ability" ? "Ability" : talent.kind === "passive" ? "Passive" : "Class";
              return (
                <button type="button" data-talent-id={talent.id} aria-label={`${talent.name}, ${typeLabel}, ${state}`} className={`runtime-talent-node ${talent.branch} ${talent.shape} ${state}`} key={talent.id} style={{ left: position.x, top: position.y }} onClick={(event) => { if (event.detail === 0) setSelectedTalentId(talent.id); }}>
                  <small>{typeLabel}</small>
                  <strong>{talent.name}</strong>
                </button>
              );
            })}
          </div>
        </div>
        </div>
        <div className="mobile-talent-zoom-controls" aria-label="Talent tree zoom">
          <button type="button" aria-label="Zoom out talent tree" data-game-tooltip="Zoom out" onClick={() => stepMobileTreeZoom(-1)}><ZoomOut size={20} /></button>
          <button type="button" aria-label="Zoom in talent tree" data-game-tooltip="Zoom in" onClick={() => stepMobileTreeZoom(1)}><ZoomIn size={20} /></button>
        </div>
        <div className={`talent-points talent-points-overlay ${character.talentPoints > 0 ? "unspent-points-indicator" : ""}`} aria-label={`${character.talentPoints} Talent Points available`}><Sparkles /><span><strong>{character.talentPoints} Points</strong></span></div>
      </div>
      {selectedTalent && <TalentDetailModal
        talent={selectedTalent}
        character={character}
        locked={locked}
        freeUnlocks={freeUnlocks}
        onClose={closeTalentDetails}
        onUnlock={(talentId) => {
          onUnlock(talentId);
          closeTalentDetails();
        }}
        onToggleAbility={onToggleAbility}
      />}
      {abilityLoadoutOpen && <AbilityLoadoutModal character={character} locked={locked} onClose={closeAbilityLoadout} onSelectSlot={setSelectedAbilitySlot} />}
      {selectedAbilitySlot !== null && <AbilitySlotPicker slotIndex={selectedAbilitySlot} character={character} onClose={() => setSelectedAbilitySlot(null)} onSetSlot={onSetAbilitySlot} />}
    </section>
  );
}
