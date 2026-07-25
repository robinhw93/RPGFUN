import { ArrowLeft, BedDouble, Check, FlaskConical, Hammer, HeartPulse, Package, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ItemIcon } from "../ItemIcon";
import { ITEMS } from "../../game/data";
import { getGearCategoryLabel } from "../../game/gear";
import { describeConsumableEffect, getItemGoldCost, isConsumableItem, isGearItem } from "../../game/items";
import { canCraftTownItem, getInventoryItemCount, getItemCraftingRecipe, getTownCraftingCatalog, getTownVendorStock, type TownActionResult } from "../../game/town";
import type { ArkenfallVendorId, GameState, InventoryItem } from "../../game/types";
import { GoldIcon } from "../../ui/gameUi";

type TownLocation = "square" | "blacksmith" | "alchemist" | "tavern";
type VendorTab = "shop" | "craft";

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

function itemSubtitle(item: InventoryItem): string {
  if (isGearItem(item)) return getGearCategoryLabel(item);
  if (isConsumableItem(item)) return "Consumable";
  return "Crafting Material";
}

function TownItemDetails({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);
  return (
    <div className="town-item-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={`town-item-modal rarity-${item.rarity}`} role="dialog" aria-modal="true" aria-labelledby="town-item-title">
        <button type="button" className="town-modal-close" onClick={onClose} aria-label="Close item details"><X /></button>
        <div className="town-item-modal-heading"><ItemIcon item={item} /><div><p className="eyebrow">{item.rarity} {itemSubtitle(item)}</p><h2 id="town-item-title">{item.name}</h2></div></div>
        <p>{item.description || "No description has been written for this item yet."}</p>
        {isConsumableItem(item) && <ul>{item.effects.map((effect, index) => <li key={index}>{describeConsumableEffect(effect)}</li>)}</ul>}
        {isGearItem(item) && <div className="town-item-stat-list">
          {Object.entries(item.stats).filter(([, value]) => value).map(([stat, value]) => <span key={stat}><strong>+{value}</strong> {stat}</span>)}
          {item.armor ? <span><strong>+{item.armor}</strong> Armor</span> : null}
          {item.magicResistance ? <span><strong>+{item.magicResistance}</strong> Magic Resistance</span> : null}
          {item.physicalPower ? <span><strong>+{item.physicalPower}</strong> Physical Power</span> : null}
          {item.magicalPower ? <span><strong>+{item.magicalPower}</strong> Spell Power</span> : null}
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
  const craftable = canCraftTownItem(game.character.inventory, item, station);
  return (
    <article className={`town-item-card rarity-${item.rarity} ${actionItemId === item.id ? "item-acquired" : ""}`}>
      <button type="button" className="town-item-inspect" onClick={onInspect} aria-label={`Inspect ${item.name}`}><ItemIcon item={item} /></button>
      <div className="town-item-copy"><p className="eyebrow">{item.rarity} · {itemSubtitle(item)}</p><h3>{item.name}</h3><p>{item.description || "A useful item from Arkenfall."}</p></div>
      {mode === "craft" && recipe && <div className="town-recipe-list">{recipe.ingredients.map((ingredient) => {
        const material = ITEM_BY_ID.get(ingredient.itemId);
        const owned = getInventoryItemCount(game.character.inventory, ingredient.itemId);
        return <span className={owned >= ingredient.quantity ? "ready" : "missing"} key={ingredient.itemId}>{material?.name ?? ingredient.itemId} <strong>{owned}/{ingredient.quantity}</strong></span>;
      })}</div>}
      <button type="button" className="town-item-action" disabled={mode === "shop" ? !affordable : !craftable} onClick={onAction}>
        {mode === "shop" ? <><ShoppingBag /> Buy <span><GoldIcon /> {getItemGoldCost(item)}</span></> : station === "alchemist" ? <><FlaskConical /> Brew</> : <><Hammer /> Craft</>}
      </button>
      {actionItemId === item.id && <span className="town-item-acquired-mark" aria-hidden="true"><Check /></span>}
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
  const [inspected, setInspected] = useState<InventoryItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  const stock = useMemo(() => tab === "shop" ? getTownVendorStock(vendor) : getTownCraftingCatalog(vendor), [tab, vendor]);
  const isAlchemist = vendor === "alchemist";
  const runAction = (item: InventoryItem) => {
    const result = tab === "shop" ? onBuy(vendor, item.id) : onCraft(vendor, item.id);
    setFeedback(result.message);
    if (result.success) {
      setActionItemId(item.id);
      window.setTimeout(() => setActionItemId((current) => current === item.id ? null : current), 900);
    }
  };
  return (
    <section className={`town-location town-${vendor}`}>
      <div className="town-ambient-layer" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <header className="town-location-header">
        <button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button>
        <div><p className="eyebrow">{isAlchemist ? "Alchemist" : "Blacksmith"}</p><h1>{isAlchemist ? "Ray Charlston" : "Brunhilde von Trott"}</h1><p>{isAlchemist ? "“Every remedy begins with the right ingredients.”" : "“Good steel remembers the hands that shaped it.”"}</p></div>
        <span className="town-gold"><GoldIcon /> {game.character.gold}</span>
      </header>
      <div className="town-vendor-panel">
        <nav className="town-vendor-tabs" aria-label={`${isAlchemist ? "Alchemist" : "Blacksmith"} services`}>
          <button type="button" className={tab === "shop" ? "active" : ""} onClick={() => { setTab("shop"); setFeedback(null); }}><ShoppingBag /> Shop</button>
          <button type="button" className={tab === "craft" ? "active" : ""} onClick={() => { setTab("craft"); setFeedback(null); }}>{isAlchemist ? <FlaskConical /> : <Hammer />} {isAlchemist ? "Brew" : "Crafting"}</button>
        </nav>
        {feedback && <div className="town-feedback" role="status">{feedback}</div>}
        {stock.length > 0 ? <div className="town-item-grid">{stock.map((item) => <VendorItemCard key={item.id} item={item} mode={tab} game={game} station={vendor} actionItemId={actionItemId} onInspect={() => setInspected(item)} onAction={() => runAction(item)} />)}</div> : <div className="town-empty-stock"><Package /><h2>{tab === "shop" ? "Nothing on the shelves yet" : isAlchemist ? "No recipes to brew yet" : "No designs to craft yet"}</h2><p>Items assigned here in the Item Editor will appear automatically.</p></div>}
      </div>
      {inspected && <TownItemDetails item={inspected} onClose={() => setInspected(null)} />}
    </section>
  );
}

export function TownView({ game, maxHp, onExit, onBuy, onCraft, onRest }: {
  game: GameState;
  maxHp: number;
  onExit: () => void;
  onBuy: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onCraft: (station: ArkenfallVendorId, itemId: string) => TownActionResult;
  onRest: () => TownActionResult;
}) {
  const [location, setLocation] = useState<TownLocation>("square");
  const [restFeedback, setRestFeedback] = useState<string | null>(null);
  const currentHp = Math.min(maxHp, game.adventure.carryHp ?? maxHp);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  if (location === "blacksmith" || location === "alchemist") return <VendorView vendor={location} game={game} onBack={() => setLocation("square")} onBuy={onBuy} onCraft={onCraft} />;
  if (location === "tavern") return (
    <section className="town-location town-tavern">
      <div className="town-hearth-glow" aria-hidden="true" />
      <header className="town-location-header"><button type="button" className="town-back-button" onClick={() => setLocation("square")}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">Tavern and Inn</p><h1>The Resting Hart</h1><p>Warm food, clean sheets, and a hearth that never seems to die.</p></div></header>
      <div className="tavern-rest-card"><span className="tavern-heart"><HeartPulse /></span><p className="eyebrow">Rest between adventures</p><h2>{currentHp >= maxHp ? "You are fully rested" : "Let the road wait until morning"}</h2><div className="town-health-meter"><span style={{ width: `${maxHp > 0 ? currentHp / maxHp * 100 : 0}%` }} /><strong>{currentHp} / {maxHp} Health</strong></div><p>Your Health carries over between adventures. Resting at the tavern restores it completely.</p><button type="button" className="primary-button" disabled={currentHp >= maxHp} onClick={() => { const result = onRest(); setRestFeedback(result.message); }}>{currentHp >= maxHp ? "Already Fully Rested" : "Rest by the Hearth"}</button>{restFeedback && <div className="town-feedback" role="status">{restFeedback}</div>}</div>
    </section>
  );
  return (
    <section className="town-location town-square">
      <div className="town-square-light" aria-hidden="true" />
      <header className="town-square-header"><button type="button" className="town-back-button" onClick={onExit}><ArrowLeft /> Adventures</button><p className="eyebrow">Safe Haven</p><h1>Arkenfall</h1><p>Forge steel, replenish your supplies, and rest before the road calls again.</p><div className="town-square-resources"><span><GoldIcon /> {game.character.gold} Gold</span><span><HeartPulse /> {currentHp} / {maxHp} Health</span></div></header>
      <div className="town-destination-grid">
        <button type="button" className="town-destination blacksmith" onClick={() => setLocation("blacksmith")}><span><Hammer /></span><div><p className="eyebrow">Forge and Armory</p><h2>Brunhilde von Trott</h2><p>Buy equipment or turn hard-won materials into arms and armor.</p></div><Sparkles /></button>
        <button type="button" className="town-destination alchemist" onClick={() => setLocation("alchemist")}><span><FlaskConical /></span><div><p className="eyebrow">Tonics and Remedies</p><h2>Ray Charlston</h2><p>Shop for alchemical supplies or brew potions from gathered ingredients.</p></div><Sparkles /></button>
        <button type="button" className="town-destination tavern" onClick={() => setLocation("tavern")}><span><BedDouble /></span><div><p className="eyebrow">Tavern and Inn</p><h2>The Resting Hart</h2><p>Recover all Health before setting out on another adventure.</p></div><Sparkles /></button>
      </div>
    </section>
  );
}
