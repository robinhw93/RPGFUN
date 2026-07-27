import { Award, Backpack, ChevronRight, Coins, FlaskConical, HeartPulse, Sparkles, Store, Swords } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ItemIcon } from "../ItemIcon";
import { ItemDetailModal } from "../character/CharacterView";
import { ENEMIES, ITEMS } from "../../game/data";
import { getAdventureEventOutcomeEffects, getInitialEventPresentationPhase } from "../../game/eventOutcomes";
import { getItemGoldCost, getItemSellValue, isGearItem } from "../../game/items";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import type { AdventureEventAppliedEffect, AdventureEventChoice, AdventureEventDefinition, AdventureEventOutcomeEffect, AdventureEventRollResult, CharacterState, GearItem, InventoryItem } from "../../game/types";
import { ADVENTURE_EVENT_TIMING } from "../../game/timing";
import { getItemNameClass, GoldIcon, SLOT_LABELS } from "../../ui/gameUi";

type EventPresentationPhase = "title" | "description" | "choices" | "direct" | "rolling" | "raw" | "bonus" | "outcome" | "merchant";

function choiceOpensMerchant(definition: AdventureEventDefinition | undefined, choiceId: string) {
  const choice = definition?.choices.find((candidate) => candidate.id === choiceId);
  const outcome = choice?.resolution === "direct" ? (choice.outcome ?? choice.success) : undefined;
  return outcome?.effects.some((effect) => effect.type === "openMerchant") ?? false;
}

function randomD100() {
  return Math.floor(Math.random() * 100) + 1;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function configuredEffectToAppliedEffect(effect: AdventureEventOutcomeEffect): AdventureEventAppliedEffect | null {
  const amount = "amount" in effect ? Math.max(0, Math.round(effect.amount)) : 0;
  switch (effect.type) {
    case "heal": return { type: "resource", resource: "health", direction: "gain", amount };
    case "loseHealth": return { type: "resource", resource: "health", direction: "lose", amount };
    case "gainGold": return { type: "resource", resource: "gold", direction: "gain", amount };
    case "loseGold": return { type: "resource", resource: "gold", direction: "lose", amount };
    case "gainExperience": return { type: "resource", resource: "experience", direction: "gain", amount };
    case "loseExperience": return { type: "resource", resource: "experience", direction: "lose", amount };
    case "gainTalentPoints": return { type: "resource", resource: "talentPoints", direction: "gain", amount };
    case "gainAttributePoints": return { type: "resource", resource: "attributePoints", direction: "gain", amount };
    case "gainItem": return { type: "item", itemId: effect.itemId, equippedSlot: null };
    case "openMerchant": return { type: "merchant", itemIds: effect.itemIds };
    case "playerNextCombatBuff": return { type: "status", target: "player", disposition: "buff", status: effect.status, stacks: Math.max(1, Math.round(effect.stacks)) };
    case "playerNextCombatDebuff": return { type: "status", target: "player", disposition: "debuff", status: effect.status, stacks: Math.max(1, Math.round(effect.stacks)) };
    case "enemiesNextCombatBuff": return { type: "status", target: "enemies", disposition: "buff", status: effect.status, stacks: Math.max(1, Math.round(effect.stacks)) };
    case "enemiesNextCombatDebuff": return { type: "status", target: "enemies", disposition: "debuff", status: effect.status, stacks: Math.max(1, Math.round(effect.stacks)) };
    case "immediateEncounter": return { type: "encounter", enemyId: effect.enemyId, count: Math.max(1, Math.round(effect.count)), experience: Math.max(0, Math.round(effect.experience)), gold: Math.max(0, Math.round(effect.gold)) };
  }
}

function getChoiceOutcomeEffects(choice: AdventureEventChoice | undefined, rollResult: AdventureEventRollResult | null): AdventureEventAppliedEffect[] {
  if (!choice || !rollResult) return [];
  const outcome = rollResult.resolution === "direct"
    ? (choice.outcome ?? choice.success)
    : rollResult.success ? choice.success : choice.failure;
  return getAdventureEventOutcomeEffects(outcome).flatMap((effect) => {
    const appliedEffect = configuredEffectToAppliedEffect(effect);
    return appliedEffect ? [appliedEffect] : [];
  });
}

function describeResourceEffect(effect: Extract<AdventureEventAppliedEffect, { type: "resource" }>) {
  const label = effect.resource === "health" ? "Health"
    : effect.resource === "gold" ? "Gold"
      : effect.resource === "experience" ? "XP"
        : effect.resource === "talentPoints" ? (effect.amount === 1 ? "Talent Point" : "Talent Points")
          : effect.amount === 1 ? "Attribute Point" : "Attribute Points";
  if (effect.amount === 0) {
    if (effect.resource === "health" && effect.direction === "gain") return "No Health restored";
    return `No ${label} ${effect.direction === "gain" ? "gained" : "lost"}`;
  }
  return `${effect.direction === "gain" ? "+" : "−"}${effect.amount} ${label}`;
}

function EventOutcomeDetails({ effects }: { effects: AdventureEventAppliedEffect[] }) {
  return <section className="event-outcome-details" aria-label="Outcome">
    <header><Sparkles size={15} /><strong>Outcome</strong></header>
    <div className="event-outcome-effect-list">
      {effects.length === 0 && <div className="event-outcome-effect empty"><span><Sparkles size={18} /></span><strong>No immediate changes</strong></div>}
      {effects.map((effect, index) => {
        if (effect.type === "resource") {
          const Icon = effect.resource === "health" ? HeartPulse : effect.resource === "gold" ? Coins : Award;
          return <div className={`event-outcome-effect ${effect.direction === "gain" ? "positive" : "negative"}`} key={`${effect.type}-${effect.resource}-${index}`}><span><Icon size={18} /></span><strong>{describeResourceEffect(effect)}</strong></div>;
        }
        if (effect.type === "item") {
          const item = ITEMS.find((candidate) => candidate.id === effect.itemId);
          if (!item) return null;
          return <div className="event-outcome-effect item positive" key={`${effect.type}-${effect.itemId}-${index}`}><span><ItemIcon item={item} size={34} /></span><div><small>Item acquired</small><strong className={getItemNameClass(item)}>{item.name}</strong>{effect.equippedSlot && <em>Equipped automatically · {SLOT_LABELS[effect.equippedSlot]}</em>}</div></div>;
        }
        if (effect.type === "status") {
          const status = STATUS_EFFECTS[effect.status];
          const positive = effect.target === "player" ? effect.disposition === "buff" : effect.disposition === "debuff";
          const target = effect.target === "player" ? "Next combat" : "Enemies next combat";
          return <div className={`event-outcome-effect ${positive ? "positive" : "negative"}`} key={`${effect.type}-${effect.target}-${effect.status}-${index}`}><span><Sparkles size={18} /></span><div><small>{target}</small><strong>{status.name}{effect.stacks > 1 ? ` ×${effect.stacks}` : ""}</strong></div></div>;
        }
        if (effect.type === "encounter") {
          const enemy = ENEMIES[effect.enemyId];
          if (!enemy) return null;
          return <div className="event-outcome-effect encounter negative" key={`${effect.type}-${effect.enemyId}-${index}`}><span><Swords size={19} /></span><div><small>Immediate encounter</small><strong>{effect.count > 1 ? `${effect.count} × ` : ""}{enemy.name}</strong>{(effect.experience > 0 || effect.gold > 0) && <em>Victory reward · {effect.experience} XP{effect.gold > 0 ? ` · ${effect.gold} Gold` : ""}</em>}</div></div>;
        }
        return <div className="event-outcome-effect merchant" key={`${effect.type}-${index}`}><span><Store size={18} /></span><div><small>Wandering Merchant</small><strong>{effect.itemIds.length} {effect.itemIds.length === 1 ? "item" : "items"} available</strong></div></div>;
      })}
    </div>
  </section>;
}

export function EventPresentation({
  definition,
  title,
  description,
  rollResult,
  hasImmediateEncounter,
  merchantItemIds,
  merchantPurchasedItemIds,
  character,
  inventory,
  gold,
  onChoose,
  onPurchase,
  onSell,
  onInventory,
  onContinue,
}: {
  definition?: AdventureEventDefinition;
  title: string;
  description: string;
  rollResult: AdventureEventRollResult | null;
  hasImmediateEncounter: boolean;
  merchantItemIds: string[];
  merchantPurchasedItemIds: string[];
  character: CharacterState;
  inventory: InventoryItem[];
  gold: number;
  onChoose: (choiceId: string) => void;
  onPurchase: (itemId: string) => void;
  onSell: (itemId: string) => void;
  onInventory: () => void;
  onContinue: () => void;
}) {
  const [phase, setPhase] = useState<EventPresentationPhase>(() => getInitialEventPresentationPhase(rollResult, merchantItemIds.length));
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(() => rollResult?.choiceId ?? null);
  const [displayedRoll, setDisplayedRoll] = useState(() => rollResult && rollResult.resolution !== "direct" ? rollResult.total : randomD100());
  const [merchantMode, setMerchantMode] = useState<"buy" | "sell">("buy");
  const [inspectedGear, setInspectedGear] = useState<GearItem | null>(null);
  const [purchaseAnimationItemId, setPurchaseAnimationItemId] = useState<string | null>(null);
  const purchaseAnimationTimer = useRef<number | null>(null);
  const outcomeRef = useRef<HTMLDivElement | null>(null);
  const selectedChoice = useMemo(
    () => definition?.choices.find((choice) => choice.id === (selectedChoiceId ?? rollResult?.choiceId)),
    [definition, rollResult?.choiceId, selectedChoiceId],
  );
  const merchantItems = useMemo(() => merchantItemIds.flatMap((itemId) => {
    const item = ITEMS.find((candidate) => candidate.id === itemId);
    return item ? [item] : [];
  }), [merchantItemIds]);
  const inventoryItems = useMemo(() => [...new Map(inventory.map((item) => [item.id, item])).values()], [inventory]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => () => {
    if (purchaseAnimationTimer.current !== null) window.clearTimeout(purchaseAnimationTimer.current);
  }, []);

  useEffect(() => {
    if (rollResult) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setPhase("choices");
      return;
    }
    const descriptionTimer = window.setTimeout(() => setPhase("description"), ADVENTURE_EVENT_TIMING.descriptionMs);
    const choicesTimer = window.setTimeout(() => setPhase("choices"), ADVENTURE_EVENT_TIMING.choicesMs);
    return () => {
      window.clearTimeout(descriptionTimer);
      window.clearTimeout(choicesTimer);
    };
  }, [rollResult]);

  useEffect(() => {
    if (!rollResult || selectedChoiceId !== rollResult.choiceId || phase === "outcome" || phase === "merchant") return;
    if (merchantItems.length > 0) {
      setPhase("merchant");
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rollResult.resolution === "direct") {
      if (reducedMotion) {
        setPhase("outcome");
        return;
      }
      const outcomeTimer = window.setTimeout(() => setPhase("outcome"), 650);
      return () => window.clearTimeout(outcomeTimer);
    }
    if (reducedMotion) {
      setDisplayedRoll(rollResult.total);
      setPhase("outcome");
      return;
    }
    const rollTimer = window.setInterval(() => setDisplayedRoll(randomD100()), ADVENTURE_EVENT_TIMING.rollTickMs);
    const rawTimer = window.setTimeout(() => {
      window.clearInterval(rollTimer);
      setDisplayedRoll(rollResult.dieRoll);
      setPhase("raw");
    }, ADVENTURE_EVENT_TIMING.rawRollMs);
    const bonusTimer = window.setTimeout(() => {
      setDisplayedRoll(rollResult.total);
      setPhase("bonus");
    }, ADVENTURE_EVENT_TIMING.bonusMs);
    const outcomeTimer = window.setTimeout(() => setPhase("outcome"), ADVENTURE_EVENT_TIMING.outcomeMs);
    return () => {
      window.clearInterval(rollTimer);
      window.clearTimeout(rawTimer);
      window.clearTimeout(bonusTimer);
      window.clearTimeout(outcomeTimer);
    };
  }, [merchantItems.length, rollResult, selectedChoiceId]);

  useEffect(() => {
    if (phase !== "outcome") return;
    const frame = window.requestAnimationFrame(() => {
      outcomeRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "end" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  const choose = (choiceId: string) => {
    if (selectedChoiceId) return;
    const choice = definition?.choices.find((candidate) => candidate.id === choiceId);
    setSelectedChoiceId(choiceId);
    setDisplayedRoll(randomD100());
    setPhase(choiceOpensMerchant(definition, choiceId) ? "merchant" : choice?.resolution === "direct" ? "direct" : "rolling");
    onChoose(choiceId);
  };
  const purchase = (itemId: string) => {
    if (purchaseAnimationItemId || merchantPurchasedItemIds.includes(itemId)) return;
    setPurchaseAnimationItemId(itemId);
    onPurchase(itemId);
    if (purchaseAnimationTimer.current !== null) window.clearTimeout(purchaseAnimationTimer.current);
    purchaseAnimationTimer.current = window.setTimeout(() => {
      setPurchaseAnimationItemId(null);
      purchaseAnimationTimer.current = null;
    }, 720);
  };
  const introVisible = phase !== "title";
  const rollVisible = phase === "rolling" || phase === "raw" || phase === "bonus" || phase === "outcome";
  const resolutionVisible = phase === "direct" || rollVisible;
  const counterPhase = phase === "rolling" ? "rolling" : phase === "raw" ? "landed" : "bonus";
  const checkedResult = rollResult?.resolution === "direct" ? null : rollResult;
  const directResult = rollResult?.resolution === "direct" ? rollResult : null;
  const appliedEffects = rollResult?.appliedEffects ?? getChoiceOutcomeEffects(selectedChoice, rollResult);
  const merchantOutcomeEffects = appliedEffects.filter((effect) => effect.type !== "merchant");

  return (
    <section className={`event-cinematic phase-${phase}`} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="event-inventory-button" onClick={onInventory}><Backpack size={17} /> Inventory &amp; Gear</button>
      <div className="event-cinematic-stage">
        <h1 className="event-cinematic-title">{title}</h1>
        {introVisible && <p className="event-cinematic-description">{description}</p>}

        {phase === "choices" && (
          <div className="event-cinematic-choices" aria-label="Choose how to respond">
            {definition?.choices.map((choice, index) => (
              <button
                type="button"
                key={choice.id}
                style={{ "--event-choice-delay": `${index * 170}ms` } as React.CSSProperties}
                onClick={() => choose(choice.id)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {resolutionVisible && selectedChoice && rollResult && (
          <div className="event-cinematic-resolution" aria-live="polite">
            <p className="event-choice-description">{selectedChoice.description}</p>
            {checkedResult && <div className="event-roll-display">
              <div className={`initiative-counter ${counterPhase}`} aria-label={`D100 result ${displayedRoll}`}>
                <span>{displayedRoll}</span>
              </div>
              <small className="initiative-counter-label">
                {phase === "rolling" ? "Rolling D100" : phase === "raw" ? "Raw roll" : "Total"}
              </small>
              <div className="event-cinematic-math">
                {phase === "raw" && <span>D100 = {checkedResult.dieRoll}</span>}
                {(phase === "bonus" || phase === "outcome") && (
                  <span>{checkedResult.dieRoll} + {checkedResult.statBonus} {capitalize(checkedResult.stat)} = <strong>{checkedResult.total}</strong></span>
                )}
              </div>
            </div>}
            {phase === "outcome" && (
              <div ref={outcomeRef} className={`event-cinematic-outcome ${directResult ? "direct" : checkedResult?.success ? "success" : "failure"}`}>
                <strong>{directResult ? "Result" : checkedResult?.success ? "Success" : "Failure"}</strong>
                <p>{rollResult.outcomeText}</p>
                {checkedResult && <small>Required total: {checkedResult.threshold}</small>}
                <EventOutcomeDetails effects={appliedEffects} />
                <button type="button" className="primary-button" onClick={() => merchantItems.length > 0 ? setPhase("merchant") : onContinue()}>
                  {merchantItems.length > 0 ? "Visit Merchant" : hasImmediateEncounter ? "Face Encounter" : "Continue Journey"}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "merchant" && (
          <div className="event-merchant" aria-live="polite">
            {rollResult?.outcomeText && <p className="event-merchant-intro">{rollResult.outcomeText}</p>}
            {merchantOutcomeEffects.length > 0 && <EventOutcomeDetails effects={merchantOutcomeEffects} />}
            <div className="event-merchant-heading"><div><p className="eyebrow">Wandering Merchant</p><h2>{merchantMode === "buy" ? "Goods for the road" : "Sell from Inventory"}</h2></div><span className="event-merchant-gold"><GoldIcon /> {gold}</span></div>
            <div className="event-merchant-tabs" role="tablist" aria-label="Merchant actions">
              <button type="button" role="tab" aria-selected={merchantMode === "buy"} className={merchantMode === "buy" ? "active" : ""} onClick={() => setMerchantMode("buy")}>Buy</button>
              <button type="button" role="tab" aria-selected={merchantMode === "sell"} className={merchantMode === "sell" ? "active" : ""} onClick={() => setMerchantMode("sell")}>Sell</button>
            </div>
            {merchantMode === "buy" ? <div className="event-merchant-grid">
              {merchantItems.map((item) => {
                const cost = getItemGoldCost(item);
                const purchased = merchantPurchasedItemIds.includes(item.id);
                const purchasing = purchaseAnimationItemId === item.id;
                return <MerchantItemCard key={item.id} item={item} meta={item.rarity} buttonLabel={`${cost} Gold`} disabled={gold < cost || Boolean(purchaseAnimationItemId)} purchasing={purchasing} soldOut={purchased && !purchasing} onInspect={isGearItem(item) ? () => setInspectedGear(item) : undefined} onAction={() => purchase(item.id)} />;
              })}
            </div> : <>
              {inventoryItems.length === 0 && <div className="event-merchant-empty"><FlaskConical /><strong>Your inventory is empty.</strong><p>Return after finding something to sell.</p></div>}
              {inventoryItems.length > 0 && <div className="event-merchant-grid">
                {inventoryItems.map((item) => {
                  const count = inventory.filter((candidate) => candidate.id === item.id).length;
                  const sellValue = getItemSellValue(item);
                  return <MerchantItemCard key={item.id} item={item} meta={`${item.rarity} · ${count} owned`} buttonLabel={`Sell · ${sellValue} Gold`} disabled={sellValue <= 0} onInspect={isGearItem(item) ? () => setInspectedGear(item) : undefined} onAction={() => onSell(item.id)} />;
                })}
              </div>}
            </>}
            <button type="button" className="primary-button event-merchant-leave" onClick={onContinue}>Leave Merchant <ChevronRight size={17} /></button>
          </div>
        )}
      </div>
      {inspectedGear && <ItemDetailModal item={inspectedGear} character={character} locked viewOnly onClose={() => setInspectedGear(null)} />}
    </section>
  );
}

function MerchantItemCard({ item, meta, buttonLabel, disabled, purchasing = false, soldOut = false, onInspect, onAction }: {
  item: InventoryItem;
  meta: string;
  buttonLabel: string;
  disabled: boolean;
  purchasing?: boolean;
  soldOut?: boolean;
  onInspect?: () => void;
  onAction: () => void;
}) {
  return <article
    className={`event-merchant-item ${item.rarity} ${onInspect && !soldOut ? "inspectable" : ""} ${purchasing ? "purchasing" : ""} ${soldOut ? "sold-out" : ""}`}
    role={onInspect && !soldOut ? "button" : undefined}
    tabIndex={onInspect && !soldOut ? 0 : undefined}
    onClick={soldOut ? undefined : onInspect}
    onKeyDown={onInspect && !soldOut ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onInspect(); } } : undefined}
  >
    <span className="event-merchant-icon"><ItemIcon item={item} size={42} /></span>
    <small>{meta}</small><strong className={getItemNameClass(item)}>{item.name}</strong><p>{item.description}</p>
    <button type="button" disabled={disabled || soldOut} onClick={(event) => { event.stopPropagation(); onAction(); }}><GoldIcon /> {purchasing ? "Purchased!" : buttonLabel}</button>
    {soldOut && <span className="event-merchant-sold-out" aria-label={`${item.name} is out of stock`}><strong>Out of Stock</strong></span>}
  </article>;
}
