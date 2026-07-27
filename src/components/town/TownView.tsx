import { ArrowLeft, BedDouble, Check, Crosshair, Dumbbell, FlaskConical, Gem, Hammer, HeartPulse, Package, Scissors, Shield, ShoppingBag, Sparkles, Utensils, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ItemIcon } from "../ItemIcon";
import { ItemDetailModal } from "../character/CharacterView";
import { ITEMS } from "../../game/data";
import { getGearCategoryLabel } from "../../game/gear";
import { describeConsumableEffect, getItemGoldCost, isConsumableItem, isGearItem } from "../../game/items";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import { canCraftTownItem, getInventoryItemCount, getItemCraftingRecipe, getTavernRestCost, getTownCraftingCatalog, getTownVendorStock, hasPreparedTavernMeal, TAVERN_MEALS, type TavernMealId, type TownActionResult } from "../../game/town";
import type { ArkenfallVendorId, CharacterState, GameState, InventoryItem } from "../../game/types";
import { formatSignedItemStatValue, getItemNameClass, getItemStatLines, GoldIcon, RARITY_SORT_WEIGHT } from "../../ui/gameUi";

type TownLocation = "square" | "tavern" | ArkenfallVendorId;
type VendorTab = "shop" | "craft";
type VendorSort = "type" | "rarity" | "cost-asc" | "cost-desc" | "name-asc" | "name-desc";

const VENDOR_PRESENTATION: Record<ArkenfallVendorId, {
  profession: string;
  name: string;
  quote: string;
  destinationEyebrow: string;
  destinationDescription: string;
  craftLabel: string;
  emptyCraftTitle: string;
}> = {
  blacksmith: {
    profession: "Blacksmith",
    name: "Brunhilde von Trott",
    quote: "“Good steel remembers the hands that shaped it.”",
    destinationEyebrow: "Forge and Armory",
    destinationDescription: "Buy equipment or turn hard-won materials into arms and armor.",
    craftLabel: "Crafting",
    emptyCraftTitle: "No designs to craft yet",
  },
  alchemist: {
    profession: "Alchemist",
    name: "Ray Charlston",
    quote: "“Every remedy begins with the right ingredients.”",
    destinationEyebrow: "Tonics and Remedies",
    destinationDescription: "Shop for alchemical supplies or brew potions from gathered ingredients.",
    craftLabel: "Brew",
    emptyCraftTitle: "No recipes to brew yet",
  },
  tailor: {
    profession: "Tailor",
    name: "Mirelle Threadgold",
    quote: "“A proper cut can turn cloth into confidence.”",
    destinationEyebrow: "Cloth and Finery",
    destinationDescription: "Browse fine garments or stitch gathered fabrics into new equipment.",
    craftLabel: "Tailoring",
    emptyCraftTitle: "No patterns to tailor yet",
  },
  leatherworker: {
    profession: "Leatherworker",
    name: "Torren Hidehand",
    quote: "“Good leather bends when you need it and holds when you don't.”",
    destinationEyebrow: "Hides and Leather",
    destinationDescription: "Buy rugged gear or shape hides into flexible armor and fieldwear.",
    craftLabel: "Leatherworking",
    emptyCraftTitle: "No patterns to work yet",
  },
  jeweler: {
    profession: "Jeweler",
    name: "Celestine Veyra",
    quote: "“Every stone hides a light. My work is to reveal it.”",
    destinationEyebrow: "Gems and Adornments",
    destinationDescription: "Purchase precious pieces or craft gems and metals into enchanted jewelry.",
    craftLabel: "Jewelcrafting",
    emptyCraftTitle: "No designs to jewelcraft yet",
  },
};

function VendorIcon({ vendor }: { vendor: ArkenfallVendorId }) {
  if (vendor === "alchemist") return <FlaskConical />;
  if (vendor === "tailor") return <Scissors />;
  if (vendor === "leatherworker") return <Shield />;
  if (vendor === "jeweler") return <Gem />;
  return <Hammer />;
}

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

function useTownToast<T>() {
  const [toast, setToast] = useState<{ id: number; value: T } | null>(null);
  const nextToastId = useRef(0);
  const toastTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);
  const showToast = (value: T) => {
    const nextToast = { id: nextToastId.current + 1, value };
    nextToastId.current = nextToast.id;
    setToast(nextToast);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast((current) => current?.id === nextToast.id ? null : current);
      toastTimer.current = null;
    }, 1900);
  };
  return { toast, showToast };
}

function itemSubtitle(item: InventoryItem): string {
  if (isGearItem(item)) return getGearCategoryLabel(item);
  if (isConsumableItem(item)) return "Consumable";
  return "Crafting Material";
}

function compareVendorItems(left: InventoryItem, right: InventoryItem, sort: VendorSort): number {
  const compareNames = () => left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
  const leftCost = getItemGoldCost(left);
  const rightCost = getItemGoldCost(right);
  if (sort === "type") {
    return itemSubtitle(left).localeCompare(itemSubtitle(right))
      || RARITY_SORT_WEIGHT[right.rarity] - RARITY_SORT_WEIGHT[left.rarity]
      || compareNames();
  }
  if (sort === "rarity") {
    return RARITY_SORT_WEIGHT[right.rarity] - RARITY_SORT_WEIGHT[left.rarity]
      || itemSubtitle(left).localeCompare(itemSubtitle(right))
      || compareNames();
  }
  if (sort === "cost-asc") return leftCost - rightCost || compareNames();
  if (sort === "cost-desc") return rightCost - leftCost || compareNames();
  if (sort === "name-desc") return right.name.localeCompare(left.name) || right.id.localeCompare(left.id);
  return compareNames();
}

function TownItemDetails({ item, character, onClose }: { item: InventoryItem; character: CharacterState; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);
  if (isGearItem(item)) return <ItemDetailModal item={item} character={character} locked viewOnly onClose={onClose} />;

  return (
    <div className="town-item-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={`town-item-modal rarity-${item.rarity}`} role="dialog" aria-modal="true" aria-labelledby="town-item-title">
        <button type="button" className="town-modal-close" onClick={onClose} aria-label="Close item details"><X /></button>
        <div className="town-item-modal-heading"><ItemIcon item={item} /><div><p className="eyebrow">{item.rarity} {itemSubtitle(item)}</p><h2 className={getItemNameClass(item)} id="town-item-title">{item.name}</h2></div></div>
        {item.description && <p>{item.description}</p>}
        {isConsumableItem(item) && <ul>{item.effects.map((effect, index) => <li key={index}>{describeConsumableEffect(effect)}</li>)}</ul>}
        {isGearItem(item) && <div className="town-item-stat-list">
          {getItemStatLines(item).map((stat) => <span key={stat.label}><strong>{formatSignedItemStatValue(stat.value, stat.percent)}</strong> {stat.label}</span>)}
        </div>}
        <div className="town-item-modal-value"><GoldIcon /> {getItemGoldCost(item)} Gold</div>
      </article>
    </div>
  );
}

function VendorItemCard({ item, mode, game, station, actionItemId, onInspect, onAction }: {
  item: InventoryItem;
  mode: VendorTab;
  game: GameState;
  station: ArkenfallVendorId;
  actionItemId: string | null;
  onInspect: () => void;
  onAction: () => void;
}) {
  const recipe = getItemCraftingRecipe(item);
  const affordable = game.character.gold >= getItemGoldCost(item);
  const craftable = canCraftTownItem(game.character.inventory, item, station, game.character.completedAdventureIds);
  return (
    <article className={`town-item-card rarity-${item.rarity} ${actionItemId === item.id ? "item-acquired" : ""}`}>
      <button type="button" className="town-item-inspect" onClick={onInspect} aria-label={`Inspect ${item.name}`}><ItemIcon item={item} /></button>
      <div className="town-item-copy"><p className="eyebrow">{item.rarity} · {itemSubtitle(item)}</p><h3 className={getItemNameClass(item)}>{item.name}</h3>{item.description && <p>{item.description}</p>}</div>
      {mode === "craft" && recipe && <div className="town-recipe-list">{recipe.ingredients.map((ingredient) => {
        const material = ITEM_BY_ID.get(ingredient.itemId);
        const owned = getInventoryItemCount(game.character.inventory, ingredient.itemId);
        return <span className={owned >= ingredient.quantity ? "ready" : "missing"} key={ingredient.itemId}>{material ? <em className={getItemNameClass(material)}>{material.name}</em> : ingredient.itemId} <strong>{owned}/{ingredient.quantity}</strong></span>;
      })}</div>}
      <button type="button" className="town-item-action" disabled={mode === "shop" ? !affordable : !craftable} onClick={onAction}>
        {mode === "shop" ? <><ShoppingBag /> Buy <span><GoldIcon /> {getItemGoldCost(item)}</span></> : <><VendorIcon vendor={station} /> {VENDOR_PRESENTATION[station].craftLabel}</>}
      </button>
      {actionItemId === item.id && <span className="town-item-acquired-mark" aria-hidden="true"><span className="town-purchase-seal"><Check /></span><i /><i /><i /><i /></span>}
    </article>
  );
}

function VendorView({ vendor, game, onBack, onBuy, onCraft }: {
  vendor: ArkenfallVendorId;
  game: GameState;
  onBack: () => void;
  onBuy: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onCraft: (station: ArkenfallVendorId, itemId: string) => TownActionResult;
}) {
  const [tab, setTab] = useState<VendorTab>("shop");
  const [sort, setSort] = useState<VendorSort>("type");
  const [inspected, setInspected] = useState<InventoryItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  const { toast: purchaseToast, showToast: showPurchaseToast } = useTownToast<InventoryItem>();
  const stock = useMemo(() => {
    const items = tab === "shop" ? getTownVendorStock(vendor, game.character.completedAdventureIds) : getTownCraftingCatalog(vendor, game.character.completedAdventureIds);
    return [...items].sort((left, right) => compareVendorItems(left, right, sort));
  }, [game.character.completedAdventureIds, sort, tab, vendor]);
  const presentation = VENDOR_PRESENTATION[vendor];
  const runAction = (item: InventoryItem) => {
    const result = tab === "shop" ? onBuy(vendor, item.id) : onCraft(vendor, item.id);
    if (tab === "shop" && result.success && result.item) {
      setFeedback(null);
      showPurchaseToast(result.item);
    } else {
      setFeedback(result.message);
    }
    if (result.success) {
      setActionItemId(item.id);
      window.setTimeout(() => setActionItemId((current) => current === item.id ? null : current), 1050);
    }
  };
  return (
    <section className={`town-location town-${vendor}`}>
      <div className="town-vendor-background" aria-hidden="true" />
      <div className="town-ambient-layer" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      {purchaseToast && <div key={purchaseToast.id} className="town-action-toast" role="status" aria-live="polite"><strong className={getItemNameClass(purchaseToast.value)}>{purchaseToast.value.name}</strong> added to inventory.</div>}
      <header className="town-location-header">
        <button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button>
        <div><p className="eyebrow">{presentation.profession}</p><h1>{presentation.name}</h1><p>{presentation.quote}</p></div>
        <span className="town-gold"><GoldIcon /> {game.character.gold}</span>
      </header>
      <div className="town-vendor-panel">
        <nav className="town-vendor-tabs" aria-label={`${presentation.profession} services`}>
          <button type="button" className={tab === "shop" ? "active" : ""} onClick={() => { setTab("shop"); setFeedback(null); }}><ShoppingBag /> Shop</button>
          <button type="button" className={tab === "craft" ? "active" : ""} onClick={() => { setTab("craft"); setFeedback(null); }}><VendorIcon vendor={vendor} /> {presentation.craftLabel}</button>
        </nav>
        <label className="town-vendor-sort">
          <span>Sort items</span>
          <select aria-label="Sort vendor items" value={sort} onChange={(event) => setSort(event.target.value as VendorSort)}>
            <option value="type">Item Type</option>
            <option value="rarity">Rarity</option>
            <option value="cost-asc">Cost: Low to High</option>
            <option value="cost-desc">Cost: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </label>
        {feedback && <div className="town-feedback" role="status">{feedback}</div>}
        {stock.length > 0 ? <div className="town-item-grid">{stock.map((item) => <VendorItemCard key={item.id} item={item} mode={tab} game={game} station={vendor} actionItemId={actionItemId} onInspect={() => setInspected(item)} onAction={() => runAction(item)} />)}</div> : <div className="town-empty-stock"><Package /><h2>{tab === "shop" ? "Nothing on the shelves yet" : presentation.emptyCraftTitle}</h2><p>Items assigned here in the Item Editor will appear automatically.</p></div>}
      </div>
      {inspected && <TownItemDetails item={inspected} character={game.character} onClose={() => setInspected(null)} />}
    </section>
  );
}

export function TownView({ game, maxHp, initialLocation = "square", onExit, onBuy, onCraft, onRest, onMeal }: {
  game: GameState;
  maxHp: number;
  initialLocation?: Extract<TownLocation, "square" | "tavern">;
  onExit: () => void;
  onBuy: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onCraft: (station: ArkenfallVendorId, itemId: string) => TownActionResult;
  onRest: () => TownActionResult;
  onMeal: (mealId: TavernMealId) => TownActionResult;
}) {
  const [location, setLocation] = useState<TownLocation>(initialLocation);
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);
  const { toast: mealToast, showToast: showMealToast } = useTownToast<string>();
  const currentHp = Math.min(maxHp, game.adventure.carryHp ?? maxHp);
  const restCost = getTavernRestCost(currentHp, maxHp);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  if (location !== "square" && location !== "tavern") return <VendorView vendor={location} game={game} onBack={() => setLocation("square")} onBuy={onBuy} onCraft={onCraft} />;
  if (location === "tavern") return (
    <section className="town-location town-tavern">
      <div className="town-hearth-glow" aria-hidden="true" />
      {mealToast && <div key={mealToast.id} className="town-action-toast" role="status" aria-live="polite">{mealToast.value}</div>}
      <header className="town-location-header"><button type="button" className="town-back-button" onClick={() => setLocation("square")}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">Tavern and Inn</p><h1>The Resting Hart</h1><p>Warm food, clean sheets, and a hearth that never seems to die.</p></div><span className="town-gold"><GoldIcon /> {game.character.gold}</span></header>
      <div className="tavern-services-panel">
        <div className="tavern-services-heading"><Utensils /><div><p className="eyebrow">Food and lodging</p><h2>Tavern Services</h2></div></div>
        {serviceFeedback && <div className="town-feedback" role="status">{serviceFeedback}</div>}
        <div className="tavern-service-layout">
          <article className="tavern-rest-card"><span className="tavern-service-icon"><HeartPulse /></span><p className="eyebrow">Rest between adventures</p><h3>{currentHp >= maxHp ? "You are fully rested" : "A Night by the Hearth"}</h3><div className="town-health-meter"><span style={{ width: `${maxHp > 0 ? currentHp / maxHp * 100 : 0}%` }} /><strong>{currentHp} / {maxHp} Health</strong></div><p>Recover all missing Health. The room costs 1 Gold for every 3 Health restored.</p><button type="button" className="tavern-service-button" disabled={currentHp >= maxHp || game.character.gold < restCost} onClick={() => { const result = onRest(); setServiceFeedback(result.message); }}>{currentHp >= maxHp ? "Already Fully Rested" : <><BedDouble /> Rest <span><GoldIcon /> {restCost}</span></>}</button></article>
          <section className="tavern-meals" aria-labelledby="tavern-meals-heading"><div className="tavern-meals-heading"><div><p className="eyebrow">Fresh from the kitchen</p><h3 id="tavern-meals-heading">Meals</h3></div><small>Benefits are applied when your next combat begins.</small></div><div className="tavern-meal-grid">{TAVERN_MEALS.map((meal) => {
            const prepared = hasPreparedTavernMeal(game, meal);
            const status = STATUS_EFFECTS[meal.status];
            return <article className={`tavern-meal-card meal-${meal.status}`} key={meal.id}><span className="tavern-service-icon">{meal.status === "strengthened" ? <Dumbbell /> : meal.status === "fierce" ? <Crosshair /> : <HeartPulse />}</span><div className="tavern-meal-copy"><p className="eyebrow">Grants {status.name}</p><h4>{meal.name}</h4><p>{meal.description}</p><small>{status.description}</small></div><button type="button" className="tavern-service-button" disabled={prepared || game.character.gold < meal.cost} onClick={() => { const result = onMeal(meal.id); if (result.success) { setServiceFeedback(null); showMealToast(result.message); } else { setServiceFeedback(result.message); } }}>{prepared ? <><Check /> Prepared</> : <><Utensils /> Order <span><GoldIcon /> {meal.cost}</span></>}</button></article>;
          })}</div></section>
        </div>
      </div>
    </section>
  );
  return (
    <section className="town-location town-square">
      <div className="town-square-light" aria-hidden="true" />
      <header className="town-square-header"><button type="button" className="town-back-button" onClick={onExit}><ArrowLeft /> Adventures</button><p className="eyebrow">Safe Haven</p><h1>Arkenfall</h1><p>Trade, craft, replenish your supplies, and rest before the road calls again.</p><div className="town-square-resources"><span><GoldIcon /> {game.character.gold} Gold</span><span><HeartPulse /> {currentHp} / {maxHp} Health</span></div></header>
      <div className="town-destination-grid">
        {(["blacksmith", "alchemist", "tailor", "leatherworker", "jeweler"] as ArkenfallVendorId[]).map((vendor) => {
          const presentation = VENDOR_PRESENTATION[vendor];
          return <button type="button" className={`town-destination ${vendor}`} onClick={() => setLocation(vendor)} key={vendor}><span><VendorIcon vendor={vendor} /></span><div><p className="eyebrow">{presentation.destinationEyebrow}</p><h2>{presentation.name}</h2><p>{presentation.destinationDescription}</p></div><Sparkles /></button>;
        })}
        <button type="button" className="town-destination tavern" onClick={() => setLocation("tavern")}><span><BedDouble /></span><div><p className="eyebrow">Tavern and Inn</p><h2>The Resting Hart</h2><p>Recover all Health before setting out on another adventure.</p></div><Sparkles /></button>
      </div>
    </section>
  );
}
