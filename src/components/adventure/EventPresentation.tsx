import { Backpack, ChevronRight, FlaskConical, Package } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GearSlotIcon } from "../GearSlotIcon";
import { ItemDetailModal } from "../character/CharacterView";
import { ITEMS } from "../../game/data";
import { getInitialEventPresentationPhase } from "../../game/eventOutcomes";
import { getItemGoldCost, getItemSellValue, isConsumableItem, isGearItem, isMiscItem } from "../../game/items";
import type { AdventureEventDefinition, AdventureEventRollResult, CharacterState, GearItem, InventoryItem } from "../../game/types";
import { ADVENTURE_EVENT_TIMING } from "../../game/timing";
import { GoldIcon } from "../../ui/gameUi";

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
  const [displayedRoll, setDisplayedRoll] = useState(() => rollResult && rollResult.resolution !== "direct" ? rollResult.dieRoll : randomD100());
  const [merchantMode, setMerchantMode] = useState<"buy" | "sell">("buy");
  const [inspectedGear, setInspectedGear] = useState<GearItem | null>(null);
  const [purchaseAnimationItemId, setPurchaseAnimationItemId] = useState<string | null>(null);
  const purchaseAnimationTimer = useRef<number | null>(null);
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
              <div className={`event-cinematic-outcome ${directResult ? "direct" : checkedResult?.success ? "success" : "failure"}`}>
                <strong>{directResult ? "Outcome" : checkedResult?.success ? "Success" : "Failure"}</strong>
                <p>{rollResult.outcomeText}</p>
                {checkedResult && <small>Required total: {checkedResult.threshold}</small>}
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
                if (purchased && !purchasing) return <div className="event-merchant-sold-out" key={item.id}><strong>Out of Stock</strong></div>;
                return <MerchantItemCard key={item.id} item={item} meta={item.rarity} buttonLabel={`${cost} Gold`} disabled={gold < cost || Boolean(purchaseAnimationItemId)} purchasing={purchasing} onInspect={isGearItem(item) ? () => setInspectedGear(item) : undefined} onAction={() => purchase(item.id)} />;
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

function MerchantItemCard({ item, meta, buttonLabel, disabled, purchasing = false, onInspect, onAction }: {
  item: InventoryItem;
  meta: string;
  buttonLabel: string;
  disabled: boolean;
  purchasing?: boolean;
  onInspect?: () => void;
  onAction: () => void;
}) {
  return <article
    className={`event-merchant-item ${item.rarity} ${onInspect ? "inspectable" : ""} ${purchasing ? "purchasing" : ""}`}
    role={onInspect ? "button" : undefined}
    tabIndex={onInspect ? 0 : undefined}
    onClick={onInspect}
    onKeyDown={onInspect ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onInspect(); } } : undefined}
  >
    <span className="event-merchant-icon">{isConsumableItem(item) ? <FlaskConical /> : isMiscItem(item) ? <Package /> : <GearSlotIcon slot={item.slot} item={item} size={30} />}</span>
    <small>{meta}</small><strong>{item.name}</strong><p>{item.description}</p>
    <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); onAction(); }}><GoldIcon /> {purchasing ? "Purchased!" : buttonLabel}</button>
  </article>;
}
