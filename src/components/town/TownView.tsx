import { ArrowLeft, BedDouble, BookOpen, Check, CircleCheckBig, ClipboardList, Coins, Crosshair, Dumbbell, Flame, FlaskConical, Footprints, Gem, Gift, Hammer, HeartPulse, LockKeyhole, Medal, Package, Scissors, ScrollText, Shield, ShoppingBag, Skull, Sparkles, Swords, Trophy, Utensils, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ItemIcon } from "../ItemIcon";
import { ItemDetailModal } from "../character/CharacterView";
import { ITEMS, QUESTLINES, QUESTS } from "../../game/data";
import { getArenaExperience } from "../../game/arena";
import { getGearCategoryLabel } from "../../game/gear";
import { getGearRating } from "../../game/itemScaling";
import { describeConsumableEffect, getItemGoldCost, getItemSellValue, groupInventoryItems, isConsumableItem, isGearItem } from "../../game/items";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import { describeQuestObjective, getQuestAvailability, getQuestBoardPostings, getQuestObjectiveProgress, MAX_QUEST_BOARD_POSTINGS, type QuestActionResult } from "../../game/quests";
import { canCraftTownItem, getInventoryItemCount, getItemCraftingRecipe, getTavernRestOffer, getTownCraftingCatalog, getTownVendorStock, hasPreparedTavernMeal, TAVERN_GAMBLING_WAGERS, TAVERN_MEALS, type TavernGamblingResult, type TavernMealId, type TownActionResult } from "../../game/town";
import type { ArkenfallVendorId, CharacterState, GameState, InventoryItem } from "../../game/types";
import { formatSignedItemStatValue, getItemNameClass, getItemStatLines, GoldIcon, RARITY_SORT_WEIGHT } from "../../ui/gameUi";
import { CodexView, EchoTowerView, HallOfFallenView, SalvageView } from "./ProgressionViews";

type TownLocation = "square" | "shops" | "tavern" | "questboard" | "arena" | "tower" | "codex" | "salvage" | "fallen" | ArkenfallVendorId;
type VendorTab = "shop" | "craft" | "sell";
type VendorSort = "type" | "rarity" | "cost-asc" | "cost-desc" | "name-asc" | "name-desc";

const VENDOR_PRESENTATION: Record<ArkenfallVendorId, {
  profession: string;
  name: string;
  quote: string;
  destinationEyebrow: string;
  destinationDescription: string;
  emptyCraftTitle: string;
}> = {
  blacksmith: {
    profession: "Blacksmith",
    name: "Brunhilde von Trott",
    quote: "“Good steel remembers the hands that shaped it.”",
    destinationEyebrow: "Forge and Armory",
    destinationDescription: "Buy equipment or turn hard-won materials into arms and armor.",
    emptyCraftTitle: "No designs to craft yet",
  },
  alchemist: {
    profession: "Alchemist",
    name: "Ray Charlston",
    quote: "“Every remedy begins with the right ingredients.”",
    destinationEyebrow: "Tonics and Remedies",
    destinationDescription: "Shop for alchemical supplies or brew potions from gathered ingredients.",
    emptyCraftTitle: "No recipes to brew yet",
  },
  tailor: {
    profession: "Tailor",
    name: "Mirelle Threadgold",
    quote: "“A proper cut can turn cloth into confidence.”",
    destinationEyebrow: "Cloth and Finery",
    destinationDescription: "Browse fine garments or stitch gathered fabrics into new equipment.",
    emptyCraftTitle: "No patterns to tailor yet",
  },
  leatherworker: {
    profession: "Leatherworker",
    name: "Torren Hidehand",
    quote: "“Good leather bends when you need it and holds when you don't.”",
    destinationEyebrow: "Hides and Leather",
    destinationDescription: "Buy rugged gear or shape hides into flexible armor and fieldwear.",
    emptyCraftTitle: "No patterns to work yet",
  },
  jeweler: {
    profession: "Jeweler",
    name: "Celestine Veyra",
    quote: "“Every stone hides a light. My work is to reveal it.”",
    destinationEyebrow: "Gems and Adornments",
    destinationDescription: "Purchase precious pieces or craft gems and metals into enchanted jewelry.",
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

function compareVendorItems(left: InventoryItem, right: InventoryItem, sort: VendorSort, tab: VendorTab): number {
  const compareNames = () => left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
  const leftCost = tab === "sell" ? getItemSellValue(left) : getItemGoldCost(left);
  const rightCost = tab === "sell" ? getItemSellValue(right) : getItemGoldCost(right);
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

function VendorItemCard({ item, mode, game, station, ownedCount, actionItemId, onInspect, onAction }: {
  item: InventoryItem;
  mode: VendorTab;
  game: GameState;
  station: ArkenfallVendorId;
  ownedCount?: number;
  actionItemId: string | null;
  onInspect: () => void;
  onAction: () => void;
}) {
  const recipe = getItemCraftingRecipe(item);
  const affordable = game.character.gold >= getItemGoldCost(item);
  const craftable = canCraftTownItem(game.character.inventory, item, station, game.character.completedAdventureIds);
  const sellValue = getItemSellValue(item);
  return (
    <article className={`town-item-card rarity-${item.rarity} ${actionItemId === item.id ? "item-acquired" : ""}`}>
      <button type="button" className="town-item-inspect" onClick={onInspect} aria-label={`Inspect ${item.name}`}><ItemIcon item={item} /></button>
      <div className="town-item-copy"><p className="eyebrow">{item.rarity} · {itemSubtitle(item)}{isGearItem(item) ? ` · Rating ${getGearRating(item)}` : ""}{mode === "sell" && ownedCount ? ` · ${ownedCount} owned` : ""}</p><h3 className={getItemNameClass(item)}>{item.name}</h3>{item.description && <p>{item.description}</p>}</div>
      {mode === "craft" && recipe && <div className="town-recipe-list">{recipe.ingredients.map((ingredient) => {
        const material = ITEM_BY_ID.get(ingredient.itemId);
        const owned = getInventoryItemCount(game.character.inventory, ingredient.itemId);
        return <span className={owned >= ingredient.quantity ? "ready" : "missing"} key={ingredient.itemId}>{material ? <em className={getItemNameClass(material)}>{material.name}</em> : ingredient.itemId} <strong>{owned}/{ingredient.quantity}</strong></span>;
      })}</div>}
      <button type="button" className="town-item-action" disabled={mode === "shop" ? !affordable : mode === "craft" ? !craftable : sellValue <= 0} onClick={onAction}>
        {mode === "shop" ? <><ShoppingBag /> Buy <span><GoldIcon /> {getItemGoldCost(item)}</span></> : mode === "craft" ? <><VendorIcon vendor={station} /> Craft</> : <><Coins /> Sell <span><GoldIcon /> {sellValue}</span></>}
      </button>
      {actionItemId === item.id && <span className="town-item-acquired-mark" aria-hidden="true"><span className="town-purchase-seal"><Check /></span><i /><i /><i /><i /></span>}
    </article>
  );
}

function VendorView({ vendor, game, onBack, onBuy, onCraft, onSell }: {
  vendor: ArkenfallVendorId;
  game: GameState;
  onBack: () => void;
  onBuy: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onCraft: (station: ArkenfallVendorId, itemId: string) => TownActionResult;
  onSell: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
}) {
  const [tab, setTab] = useState<VendorTab>("shop");
  const [sort, setSort] = useState<VendorSort>("type");
  const [inspected, setInspected] = useState<InventoryItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  const { toast: actionToast, showToast: showActionToast } = useTownToast<{ item: InventoryItem; message: string }>();
  const listings = useMemo(() => {
    if (tab === "sell") return groupInventoryItems(game.character.inventory)
      .sort((left, right) => compareVendorItems(left.item, right.item, sort, tab));
    const items = tab === "shop" ? getTownVendorStock(vendor, game.character.completedAdventureIds) : getTownCraftingCatalog(vendor, game.character.completedAdventureIds);
    return [...items]
      .sort((left, right) => compareVendorItems(left, right, sort, tab))
      .map((item) => ({ item, count: 0 }));
  }, [game.character.completedAdventureIds, game.character.inventory, sort, tab, vendor]);
  const presentation = VENDOR_PRESENTATION[vendor];
  const runAction = (item: InventoryItem) => {
    const result = tab === "shop" ? onBuy(vendor, item.id) : tab === "craft" ? onCraft(vendor, item.id) : onSell(vendor, item.id);
    if (result.success && result.item) {
      setFeedback(null);
      showActionToast({ item: result.item, message: result.message });
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
      {actionToast && <div key={actionToast.id} className="town-action-toast" role="status" aria-live="polite"><strong className={getItemNameClass(actionToast.value.item)}>{actionToast.value.item.name}</strong>{actionToast.value.message.slice(actionToast.value.item.name.length)}</div>}
      <header className="town-location-header">
        <button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button>
        <div><p className="eyebrow">{presentation.profession}</p><h1>{presentation.name}</h1><p>{presentation.quote}</p></div>
        <span className="town-gold"><GoldIcon /> {game.character.gold}</span>
      </header>
      <div className="town-vendor-panel">
        <nav className="town-vendor-tabs" aria-label={`${presentation.profession} services`}>
          <button type="button" className={tab === "shop" ? "active" : ""} onClick={() => { setTab("shop"); setFeedback(null); }}><ShoppingBag /> Shop</button>
          <button type="button" className={tab === "craft" ? "active" : ""} onClick={() => { setTab("craft"); setFeedback(null); }}><VendorIcon vendor={vendor} /> Craft</button>
          <button type="button" className={tab === "sell" ? "active" : ""} onClick={() => { setTab("sell"); setFeedback(null); }}><Coins /> Sell</button>
        </nav>
        <label className="town-vendor-sort">
          <span>Sort items</span>
          <select aria-label="Sort vendor items" value={sort} onChange={(event) => setSort(event.target.value as VendorSort)}>
            <option value="type">Item Type</option>
            <option value="rarity">Rarity</option>
            <option value="cost-asc">{tab === "sell" ? "Sell Value: Low to High" : "Cost: Low to High"}</option>
            <option value="cost-desc">{tab === "sell" ? "Sell Value: High to Low" : "Cost: High to Low"}</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </label>
        {feedback && <div className="town-feedback" role="status">{feedback}</div>}
        {listings.length > 0 ? <div className="town-item-grid">{listings.map(({ item, count }) => <VendorItemCard key={item.id} item={item} mode={tab} game={game} station={vendor} ownedCount={count} actionItemId={actionItemId} onInspect={() => setInspected(item)} onAction={() => runAction(item)} />)}</div> : <div className="town-empty-stock"><Package /><h2>{tab === "shop" ? "Nothing on the shelves yet" : tab === "craft" ? presentation.emptyCraftTitle : "Your inventory is empty"}</h2><p>{tab === "sell" ? "Return after finding something to sell." : "Items assigned here in the Item Editor will appear automatically."}</p></div>}
      </div>
      {inspected && <TownItemDetails item={inspected} character={game.character} onClose={() => setInspected(null)} />}
    </section>
  );
}

function QuestBoardView({ game, onBack, onAccept, onTurnIn }: {
  game: GameState;
  onBack: () => void;
  onAccept: (questId: string) => QuestActionResult;
  onTurnIn: (questId: string) => QuestActionResult;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inspected, setInspected] = useState<InventoryItem | null>(null);
  const questlineQuestIds = new Set(QUESTLINES.flatMap((questline) => questline.questIds));
  const boardQuests = getQuestBoardPostings(game.character);
  const boardQuestIds = new Set(boardQuests.map((quest) => quest.id));
  const visibleQuestlines = QUESTLINES.flatMap((questline) => {
    const questIds = questline.questIds.filter((questId) => boardQuestIds.has(questId));
    return questIds.length > 0 ? [{ ...questline, questIds }] : [];
  });
  const standaloneQuests = boardQuests.filter((quest) => !questlineQuestIds.has(quest.id));
  const runAction = (questId: string, action: "accept" | "turn-in") => {
    const result = action === "accept" ? onAccept(questId) : onTurnIn(questId);
    setFeedback(result.message);
  };
  const renderQuest = (questId: string) => {
    const quest = QUESTS.find((candidate) => candidate.id === questId);
    if (!quest) return null;
    const status = getQuestAvailability(game.character, quest);
    const progress = status === "accepted" || status === "ready" ? getQuestObjectiveProgress(game.character, quest) : 0;
    const rewardItems = quest.reward.items.flatMap((reward) => {
      const item = ITEM_BY_ID.get(reward.itemId);
      return item ? [{ item, quantity: reward.quantity }] : [];
    });
    return (
      <article className={`quest-card quest-${status}`} key={quest.id}>
        <header><div><p className="eyebrow">{status === "ready" ? "Ready to turn in" : status === "accepted" ? "Active Quest" : status === "completed" ? "Completed" : status === "locked" ? "Quest Locked" : "Available Quest"}</p><h3>{quest.title}</h3></div>{status === "completed" ? <CircleCheckBig /> : status === "locked" ? <LockKeyhole /> : <ScrollText />}</header>
        <p>{quest.description}</p>
        <div className="quest-objective"><strong>Objective</strong><span>{describeQuestObjective(quest)}</span>{(status === "accepted" || status === "ready") && <em>{Math.min(progress, quest.objective.quantity)} / {quest.objective.quantity}</em>}</div>
        <div className="quest-rewards"><strong><Gift /> Rewards</strong><div>{quest.reward.experience > 0 && <span className="quest-xp-reward">+{quest.reward.experience} XP</span>}{rewardItems.map(({ item, quantity }) => <button type="button" className={`quest-item-reward rarity-${item.rarity}`} onClick={() => setInspected(item)} key={item.id}><ItemIcon item={item} size={34} /><span><small>{item.rarity} item{quantity > 1 ? ` · ${quantity}` : ""}</small><b className={getItemNameClass(item)}>{item.name}</b></span></button>)}</div></div>
        {status === "available" && <button type="button" className="quest-action-button" onClick={() => runAction(quest.id, "accept")}>Accept Quest</button>}
        {status === "accepted" && <button type="button" className="quest-action-button" disabled>In Progress</button>}
        {status === "ready" && <button type="button" className="quest-action-button ready" onClick={() => runAction(quest.id, "turn-in")}>Turn In Quest</button>}
        {status === "locked" && <button type="button" className="quest-action-button" disabled>Complete Previous Quest</button>}
        {status === "completed" && <button type="button" className="quest-action-button" disabled>Completed</button>}
      </article>
    );
  };
  return (
    <section className="town-location town-questboard">
      <header className="town-location-header"><button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">Adventurers' Notices</p><h1>Quest Board</h1><p>Take a posting, finish its task, and return here to claim the reward.</p></div><span className="town-gold"><ClipboardList /> {boardQuests.length}/{MAX_QUEST_BOARD_POSTINGS} Posted</span></header>
      <div className="questboard-panel">
        {feedback && <div className="town-feedback" role="status" aria-live="polite">{feedback}</div>}
        {visibleQuestlines.map((questline) => {
          const completeQuestline = QUESTLINES.find((candidate) => candidate.id === questline.id)!;
          return <section className="questline-section" key={questline.id}><header><div><p className="eyebrow">Questline</p><h2>{questline.title}</h2><p>{questline.description}</p></div><span>{completeQuestline.questIds.filter((questId) => game.character.completedQuestIds.includes(questId)).length}/{completeQuestline.questIds.length}</span></header><div className="quest-card-grid">{questline.questIds.map(renderQuest)}</div></section>;
        })}
        {standaloneQuests.length > 0 && <section className="questline-section"><header><div><p className="eyebrow">Open Postings</p><h2>Independent Quests</h2><p>Tasks that do not belong to a longer questline.</p></div></header><div className="quest-card-grid">{standaloneQuests.map((quest) => renderQuest(quest.id))}</div></section>}
        {boardQuests.length === 0 && <div className="town-empty-stock"><ClipboardList /><h2>The board is empty</h2><p>Create quests in the Quest Editor to post them here.</p></div>}
      </div>
      {inspected && <TownItemDetails item={inspected} character={game.character} onClose={() => setInspected(null)} />}
    </section>
  );
}

function ArenaView({ game, onBack, onChallenge }: { game: GameState; onBack: () => void; onChallenge: () => void }) {
  const scores = game.character.arenaScores ?? [];
  const available = game.character.arenaAttemptAvailable;
  return (
    <section className="town-location town-arena">
      <div className="arena-gallery-shade" aria-hidden="true" />
      <header className="town-location-header">
        <button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button>
        <div><p className="eyebrow">Hall of Challengers</p><h1>Arkenfall Grand Arena</h1><p>Ten turns. One champion. Earn Experience equal to 20% of your damage.</p></div>
        <span className={`arena-attempt-badge ${available ? "available" : "spent"}`}><Swords /> {available ? "Attempt Ready" : "Attempt Spent"}</span>
      </header>
      <div className="arena-menu-layout">
        <article className="arena-champion-card">
          <div className="arena-champion-art"><img src="/assets/enemies/full/arena-champion.webp" alt="The gigantic Arena Champion smirking beneath a metal visor" /></div>
          <div className="arena-champion-copy"><p className="eyebrow">The Unbroken Colossus</p><h2>Arena Champion</h2><p>Strike a 1,000,000-Health target for ten turns while he answers each round with a contemptuous one-damage attack.</p><ul><li>Earn XP equal to 20% of damage dealt</li><li>Your ten best attempts are recorded</li><li>A new attempt unlocks the first time you complete each story adventure</li></ul><button type="button" className="arena-challenge-button" disabled={!available} onClick={onChallenge}><Swords /> {available ? "Challenge Arena Champion" : "Complete a New Adventure to Retry"}</button></div>
        </article>
        <section className="arena-leaderboard" aria-labelledby="arena-leaderboard-title">
          <header><span><Trophy /></span><div><p className="eyebrow">Personal Records</p><h2 id="arena-leaderboard-title">Hall of Challengers</h2></div></header>
          {scores.length === 0 ? <div className="arena-empty-scores"><Medal /><strong>No attempts recorded</strong><p>Your first result will be carved here.</p></div> : <ol>{scores.map((score, index) => <li key={score.id}><b>#{index + 1}</b><span><strong>{score.damage.toLocaleString()} Damage</strong><small>Level {score.level} · {score.turns} turn{score.turns === 1 ? "" : "s"}</small></span><em>{getArenaExperience(score.damage).toLocaleString()} XP</em></li>)}</ol>}
        </section>
      </div>
    </section>
  );
}

export function TownView({ game, maxHp, initialLocation = "square", recommendStartingItem = false, onAdventures, onChallengeArena, onStartTower, onSalvage, onReforge, onBuy, onCraft, onSell, onRest, onMeal, onGamble, onAcceptQuest, onTurnInQuest }: {
  game: GameState;
  maxHp: number;
  initialLocation?: Extract<TownLocation, "square" | "tavern" | "arena">;
  recommendStartingItem?: boolean;
  onAdventures: () => void;
  onChallengeArena: () => void;
  onStartTower: () => void;
  onSalvage: (itemId: string) => string;
  onReforge: (itemId: string) => string;
  onBuy: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onCraft: (station: ArkenfallVendorId, itemId: string) => TownActionResult;
  onSell: (vendor: ArkenfallVendorId, itemId: string) => TownActionResult;
  onRest: () => TownActionResult;
  onMeal: (mealId: TavernMealId) => TownActionResult;
  onGamble: (wager: number) => TavernGamblingResult;
  onAcceptQuest: (questId: string) => QuestActionResult;
  onTurnInQuest: (questId: string) => QuestActionResult;
}) {
  const [location, setLocation] = useState<TownLocation>(initialLocation);
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);
  const [gamblingResult, setGamblingResult] = useState<TavernGamblingResult | null>(null);
  const [displayedGamblingRoll, setDisplayedGamblingRoll] = useState<number | null>(null);
  const [gamblingRolling, setGamblingRolling] = useState(false);
  const gamblingTickTimer = useRef<number | null>(null);
  const gamblingResultTimer = useRef<number | null>(null);
  const { toast: mealToast, showToast: showMealToast } = useTownToast<string>();
  const currentHp = Math.min(maxHp, game.adventure.carryHp ?? maxHp);
  const restOffer = getTavernRestOffer(currentHp, maxHp, game.character.gold);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  useEffect(() => () => {
    if (gamblingTickTimer.current !== null) window.clearInterval(gamblingTickTimer.current);
    if (gamblingResultTimer.current !== null) window.clearTimeout(gamblingResultTimer.current);
  }, []);
  const gamble = (wager: number) => {
    if (gamblingRolling) return;
    const result = onGamble(wager);
    if (!result.success || !result.roll) {
      setServiceFeedback(result.message);
      return;
    }
    setServiceFeedback(null);
    setGamblingResult(result);
    setDisplayedGamblingRoll(Math.floor(Math.random() * 100) + 1);
    setGamblingRolling(true);
    gamblingTickTimer.current = window.setInterval(() => setDisplayedGamblingRoll(Math.floor(Math.random() * 100) + 1), 70);
    gamblingResultTimer.current = window.setTimeout(() => {
      if (gamblingTickTimer.current !== null) window.clearInterval(gamblingTickTimer.current);
      gamblingTickTimer.current = null;
      gamblingResultTimer.current = null;
      setDisplayedGamblingRoll(result.roll!.dieRoll);
      setGamblingRolling(false);
    }, 900);
  };
  if (location === "tower") return <EchoTowerView game={game} onBack={() => setLocation("square")} onStart={onStartTower} />;
  if (location === "codex") return <CodexView game={game} onBack={() => setLocation("square")} />;
  if (location === "salvage") return <SalvageView game={game} onBack={() => setLocation("shops")} onSalvage={onSalvage} onReforge={onReforge} />;
  if (location === "fallen") return <HallOfFallenView onBack={() => setLocation("square")} />;
  if (location !== "square" && location !== "shops" && location !== "tavern" && location !== "questboard" && location !== "arena") return <VendorView vendor={location} game={game} onBack={() => setLocation("shops")} onBuy={onBuy} onCraft={onCraft} onSell={onSell} />;
  if (location === "arena") return <ArenaView game={game} onBack={() => setLocation("square")} onChallenge={onChallengeArena} />;
  if (location === "questboard") return <QuestBoardView game={game} onBack={() => setLocation("square")} onAccept={onAcceptQuest} onTurnIn={onTurnInQuest} />;
  if (location === "tavern") return (
    <section className="town-location town-tavern">
      <div className="town-hearth-glow" aria-hidden="true" />
      {mealToast && <div key={mealToast.id} className="town-action-toast" role="status" aria-live="polite">{mealToast.value}</div>}
      <header className="town-location-header"><button type="button" className="town-back-button" onClick={() => setLocation("square")}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">Tavern and Inn</p><h1>The Resting Hart</h1><p>Warm food, clean sheets, and a hearth that never seems to die.</p></div><span className="town-gold"><GoldIcon /> {game.character.gold}</span></header>
      <div className="tavern-services-panel">
        <div className="tavern-services-heading"><Utensils /><div><p className="eyebrow">Food and lodging</p><h2>Tavern Services</h2></div></div>
        {serviceFeedback && <div className="town-feedback" role="status">{serviceFeedback}</div>}
        <div className="tavern-service-layout">
          <article className="tavern-rest-card"><span className="tavern-service-icon"><HeartPulse /></span><p className="eyebrow">Rest between adventures</p><h3>{currentHp >= maxHp ? "You are fully rested" : "A Night by the Hearth"}</h3><div className="town-health-meter"><span style={{ width: `${maxHp > 0 ? currentHp / maxHp * 100 : 0}%` }} /><strong>{currentHp} / {maxHp} Health</strong></div><p>Each Gold restores up to 5 missing Health. If you cannot afford full recovery, you can spend all your Gold to recover as much as possible.</p><button type="button" className="tavern-service-button" disabled={currentHp >= maxHp || restOffer.goldCost <= 0} onClick={() => { const result = onRest(); setServiceFeedback(result.message); }}>{currentHp >= maxHp ? "Already Fully Rested" : restOffer.goldCost <= 0 ? "Need Gold" : <><BedDouble /> Rest +{restOffer.healthRestored} Health <span><GoldIcon /> {restOffer.goldCost}</span></>}</button></article>
          <section className="tavern-meals" aria-labelledby="tavern-meals-heading"><div className="tavern-meals-heading"><div><p className="eyebrow">Fresh from the kitchen</p><h3 id="tavern-meals-heading">Meals</h3></div><small>Benefits are applied when your next combat begins.</small></div><div className="tavern-meal-grid">{TAVERN_MEALS.map((meal) => {
            const prepared = hasPreparedTavernMeal(game, meal);
            const status = STATUS_EFFECTS[meal.status];
            return <article className={`tavern-meal-card meal-${meal.status}`} key={meal.id}><span className="tavern-service-icon">{meal.status === "strengthened" ? <Dumbbell /> : meal.status === "fierce" ? <Crosshair /> : <HeartPulse />}</span><div className="tavern-meal-copy"><p className="eyebrow">Grants {status.name}</p><h4>{meal.name}</h4><p>{meal.description}</p><small>{status.description}</small></div><button type="button" className="tavern-service-button" disabled={prepared || game.character.gold < meal.cost} onClick={() => { const result = onMeal(meal.id); if (result.success) { setServiceFeedback(null); showMealToast(result.message); } else { setServiceFeedback(result.message); } }}>{prepared ? <><Check /> Prepared</> : <><Utensils /> Order <span><GoldIcon /> {meal.cost}</span></>}</button></article>;
          })}</div></section>
        </div>
        <section className="tavern-gambling" aria-labelledby="tavern-gambling-heading">
          <div className="tavern-gambling-copy"><span className="tavern-service-icon"><Coins /></span><div><p className="eyebrow">Try your Luck</p><h3 id="tavern-gambling-heading">The Gilded Dice</h3><p>Choose your stake and test your Luck against the house. Win the check to double your wager.</p></div></div>
          <div className="tavern-gambling-table">
            <div className={`tavern-gambling-die ${gamblingRolling ? "rolling" : ""}`} aria-label={displayedGamblingRoll === null ? "D100 waiting to roll" : `D100 result ${displayedGamblingRoll}`}><span>{displayedGamblingRoll ?? "?"}</span><small>D100</small></div>
            <div className="tavern-gambling-result" aria-live="polite">
              {!gamblingResult && <p>The dice are waiting.</p>}
              {gamblingResult?.roll && gamblingRolling && <p>The bones tumble across the table...</p>}
              {gamblingResult?.roll && !gamblingRolling && <><strong className={gamblingResult.roll.won ? "won" : "lost"}>{gamblingResult.roll.won ? "You win" : "The house wins"}</strong><p>{gamblingResult.roll.dieRoll} + {gamblingResult.roll.luckBonus} Luck = <b>{gamblingResult.roll.total}</b></p><small>{gamblingResult.message}</small></>}
            </div>
            <div className="tavern-gambling-wagers" aria-label="Choose a Gold wager">{TAVERN_GAMBLING_WAGERS.map((wager) => <button type="button" key={wager} disabled={gamblingRolling || game.character.gold < wager} onClick={() => gamble(wager)}><Coins /> Bet {wager} <GoldIcon /></button>)}</div>
          </div>
        </section>
      </div>
    </section>
  );
  if (location === "shops") return (
    <section className="town-location town-shops">
      <div className="town-square-light" aria-hidden="true" />
      <header className="town-location-header"><button type="button" className="town-back-button" onClick={() => setLocation("square")}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">Market District</p><h1>Shops</h1><p>Visit Arkenfall's artisans to buy, sell, brew, and craft.</p></div><span className="town-gold"><GoldIcon /> {game.character.gold}</span></header>
      <div className="town-destination-grid town-shop-grid">
        {(["blacksmith", "alchemist", "tailor", "leatherworker", "jeweler"] as ArkenfallVendorId[]).map((vendor) => {
          const presentation = VENDOR_PRESENTATION[vendor];
          return <button type="button" className={`town-destination ${vendor}`} onClick={() => setLocation(vendor)} key={vendor}><span><VendorIcon vendor={vendor} /></span><div><p className="eyebrow">{presentation.destinationEyebrow}</p><h2>{presentation.name}</h2><p>{presentation.destinationDescription}</p></div><Sparkles /></button>;
        })}
        <button type="button" className="town-destination salvage" onClick={() => setLocation("salvage")}><span><Hammer /></span><div><p className="eyebrow">Salvage and Reforge</p><h2>The Echo Forge</h2><p>Turn spare equipment into Essence and recreate unlocked set pieces.</p></div><Sparkles /></button>
      </div>
    </section>
  );
  return (
    <section className="town-location town-square">
      <div className="town-square-light" aria-hidden="true" />
      <header className="town-square-header"><p className="eyebrow">Safe Haven</p><h1>Arkenfall Town</h1><p>Choose your next destination before the road calls again.</p><div className="town-square-resources"><span><GoldIcon /> {game.character.gold} Gold</span><span><HeartPulse /> {currentHp} / {maxHp} Health</span></div></header>
      <div className="town-destination-grid town-main-menu">
        <button type="button" className="town-destination adventures" onClick={onAdventures}><span><Footprints /></span><div><p className="eyebrow">Beyond the Gates</p><h2>Adventures</h2><p>Choose a story route and begin your next journey.</p></div><Sparkles /></button>
        <button type="button" className={`town-destination shops ${recommendStartingItem ? "starting-item-recommended" : ""}`.trim()} onClick={() => setLocation("shops")}><span><ShoppingBag /></span><div><p className="eyebrow">Market District</p><h2>Shops</h2><p>Visit every vendor, browse their wares, and craft new items.</p>{recommendStartingItem && <small className="starting-item-recommendation">It is recommended that you purchase one starting item before going on an adventure.</small>}</div><Sparkles /></button>
        <button type="button" className="town-destination tavern" onClick={() => setLocation("tavern")}><span><BedDouble /></span><div><p className="eyebrow">Tavern and Inn</p><h2>The Resting Hart</h2><p>Recover all Health before setting out on another adventure.</p></div><Sparkles /></button>
        <button type="button" className="town-destination questboard" onClick={() => setLocation("questboard")}><span><ClipboardList /></span><div><p className="eyebrow">Adventurers' Notices</p><h2>Quest Board</h2><p>Accept quests, follow questlines, and return to claim rewards.</p></div><Sparkles /></button>
        <button type="button" className="town-destination arena" onClick={() => setLocation("arena")}><span><Trophy /></span><div><p className="eyebrow">Ten-Turn Damage Trial</p><h2>Grand Arena</h2><p>Challenge the Arena Champion and turn your damage into Experience.</p></div><Sparkles /></button>
        <button type="button" className="town-destination echo-tower-destination" onClick={() => setLocation("tower")}><span><Flame /></span><div><p className="eyebrow">Endless Challenge</p><h2>Tower of Echoes</h2><p>Climb escalating encounters and gather Echo Essence.</p></div><Sparkles /></button>
        <button type="button" className="town-destination codex" onClick={() => setLocation("codex")}><span><BookOpen /></span><div><p className="eyebrow">Lore and Collection</p><h2>Arkenfall Codex</h2><p>Review discovered enemies, items, sets, and status effects.</p></div><Sparkles /></button>
        <button type="button" className="town-destination fallen" onClick={() => setLocation("fallen")}><span><Skull /></span><div><p className="eyebrow">Memorial</p><h2>Hall of Fallen</h2><p>Remember heroes whose adventures ended beyond the walls.</p></div><Sparkles /></button>
      </div>
    </section>
  );
}
