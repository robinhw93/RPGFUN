import { ArrowLeft, BookOpen, Flame, Hammer, LockKeyhole, Shield, Skull, Sparkles, Trophy } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { CHARACTER_AVATARS } from "../../game/avatars";
import { ADVENTURES, ENEMIES, GEAR_SETS, ITEMS } from "../../game/data";
import { loadFallenHeroes } from "../../game/fallenHeroes";
import { groupInventoryItems, isGearItem } from "../../game/items";
import { getReforgeCost, getReforgeableSetItems, getSalvageYield } from "../../game/salvage";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import { ECHO_TOWER_UNLOCK_ADVENTURE_ID, getEchoTowerCheckpoint, isEchoTowerUnlocked } from "../../game/tower";
import type { GameState } from "../../game/types";
import { getItemNameClass, GoldIcon } from "../../ui/gameUi";
import { ItemIcon } from "../ItemIcon";

function LocationHeader({ eyebrow, title, description, onBack, resource }: { eyebrow: string; title: string; description: string; onBack: () => void; resource?: ReactNode }) {
  return <header className="town-location-header"><button type="button" className="town-back-button" onClick={onBack}><ArrowLeft /> Arkenfall</button><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{resource}</header>;
}

export function EchoTowerView({ game, onBack, onStart }: { game: GameState; onBack: () => void; onStart: () => void }) {
  const unlocked = isEchoTowerUnlocked(game);
  const unlockName = ADVENTURES.find((adventure) => adventure.id === ECHO_TOWER_UNLOCK_ADVENTURE_ID)?.name ?? "the final adventure";
  return <section className="town-location progression-view echo-tower-view">
    <LocationHeader eyebrow="Endless Challenge" title="Tower of Echoes" description="Climb an endless chain of increasingly dangerous echoes." onBack={onBack} resource={<span className="town-gold"><Sparkles /> {game.character.salvageEssence} Essence</span>} />
    <div className="progression-hero-card"><Trophy /><div><p className="eyebrow">Personal record</p><h2>Floor {game.character.echoTowerBestFloor || 0}</h2><p>Begin at Floor {getEchoTowerCheckpoint(game.character.echoTowerBestFloor)}. Every fifth floor is a checkpoint and fully restores Health.</p></div></div>
    {!unlocked ? <div className="progression-locked"><LockKeyhole /><h2>The tower remains silent</h2><p>Complete {unlockName} to awaken it.</p></div> : <button type="button" className="progression-primary" onClick={onStart}><Flame /> Enter the Tower</button>}
    <section className="progression-list"><h2>Recent Expeditions</h2>{game.character.echoTowerRuns.length === 0 ? <p className="progression-empty">No expeditions recorded.</p> : game.character.echoTowerRuns.map((run) => <article key={run.id}><strong>Floor {run.floorReached}</strong><span>{run.essenceEarned} Essence</span><small>{new Date(run.completedAt).toLocaleDateString()}</small></article>)}</section>
  </section>;
}

type CodexTab = "enemies" | "items" | "sets" | "statuses";
export function CodexView({ game, onBack }: { game: GameState; onBack: () => void }) {
  const [tab, setTab] = useState<CodexTab>("enemies");
  const discoveredEnemies = new Set(game.character.discoveredEnemyIds ?? []);
  const discoveredItems = new Set(game.character.discoveredItemIds ?? []);
  const enemies = Object.values(ENEMIES).filter((enemy) => enemy.id !== "dummy");
  return <section className="town-location progression-view codex-view">
    <LocationHeader eyebrow="Lore and Collection" title="Arkenfall Codex" description="Every foe faced and treasure found leaves a mark." onBack={onBack} resource={<span className="town-gold"><BookOpen /> {discoveredItems.size + discoveredEnemies.size} Found</span>} />
    <nav className="progression-tabs" aria-label="Codex sections">{(["enemies", "items", "sets", "statuses"] as CodexTab[]).map((name) => <button type="button" className={tab === name ? "active" : ""} onClick={() => setTab(name)} key={name}>{name}</button>)}</nav>
    <div className="codex-grid">
      {tab === "enemies" && enemies.map((enemy) => discoveredEnemies.has(enemy.id) ? <article className="codex-entry" key={enemy.id}><img src={enemy.portraitUrl} alt="" /><div><p className="eyebrow">Level varies</p><h3>{enemy.name}</h3><p>{enemy.title}</p><small>{enemy.maxHp} base Health · {enemy.abilities.length} {enemy.abilities.length === 1 ? "ability" : "abilities"}</small></div></article> : <article className="codex-entry locked" key={enemy.id}><Skull /><div><h3>Unknown Foe</h3><p>Encounter this enemy to reveal it.</p></div></article>)}
      {tab === "items" && ITEMS.map((item) => discoveredItems.has(item.id) ? <article className="codex-entry" key={item.id}><ItemIcon item={item} size={42} /><div><p className="eyebrow">{item.rarity}</p><h3 className={getItemNameClass(item)}>{item.name}</h3><p>{item.description}</p></div></article> : <article className="codex-entry locked" key={item.id}><LockKeyhole /><div><h3>Unknown Item</h3><p>Find this item to reveal it.</p></div></article>)}
      {tab === "sets" && GEAR_SETS.map((set) => {
        const pieces = ITEMS.filter((item) => isGearItem(item) && item.set === set.id);
        const found = pieces.filter((item) => discoveredItems.has(item.id)).length;
        return <article className="codex-entry codex-set" key={set.id}><Shield /><div><p className="eyebrow">{found} / {pieces.length || set.pieceCount} pieces found</p><h3>{found > 0 ? set.name : "Unknown Set"}</h3>{found > 0 && set.bonuses.map((bonus) => <small key={bonus.requiredPieces}>{bonus.requiredPieces} pieces: {bonus.description}</small>)}</div></article>;
      })}
      {tab === "statuses" && Object.values(STATUS_EFFECTS).map((status) => <article className="codex-entry" key={status.id}><Sparkles /><div><p className="eyebrow">{status.kind}</p><h3>{status.name}</h3><p>{status.description}</p></div></article>)}
    </div>
  </section>;
}

export function SalvageView({ game, onBack, onSalvage, onReforge }: { game: GameState; onBack: () => void; onSalvage: (itemId: string) => string; onReforge: (itemId: string) => string }) {
  const [tab, setTab] = useState<"salvage" | "reforge">("salvage");
  const [feedback, setFeedback] = useState<string | null>(null);
  const inventory = useMemo(() => groupInventoryItems(game.character.inventory.filter(isGearItem)), [game.character.inventory]);
  const reforgeable = useMemo(() => getReforgeableSetItems(game.character), [game.character]);
  return <section className="town-location progression-view salvage-view">
    <LocationHeader eyebrow="Relic Craft" title="The Echo Forge" description="Break unwanted equipment into Echo Essence, then reforge known set relics." onBack={onBack} resource={<span className="town-gold"><Sparkles /> {game.character.salvageEssence} Essence</span>} />
    <nav className="progression-tabs"><button type="button" className={tab === "salvage" ? "active" : ""} onClick={() => setTab("salvage")}>Salvage</button><button type="button" className={tab === "reforge" ? "active" : ""} onClick={() => setTab("reforge")}>Reforge Sets</button></nav>
    {feedback && <div className="town-feedback" role="status">{feedback}</div>}
    <div className="forge-grid">{tab === "salvage" ? inventory.map(({ item, count }) => <article key={item.id}><ItemIcon item={item} size={44} /><div><h3 className={getItemNameClass(item)}>{item.name} {count > 1 && `×${count}`}</h3><p>{item.description}</p></div><button type="button" onClick={() => setFeedback(onSalvage(item.id))}><Hammer /> +{getSalvageYield(item)} Essence</button></article>) : reforgeable.map((item) => { const cost = getReforgeCost(item); return <article key={item.id}><ItemIcon item={item} size={44} /><div><h3 className={getItemNameClass(item)}>{item.name}</h3><p>{item.description}</p></div><button type="button" disabled={game.character.salvageEssence < cost.essence || game.character.gold < cost.gold} onClick={() => setFeedback(onReforge(item.id))}><Hammer /> {cost.essence} Essence · <GoldIcon /> {cost.gold}</button></article>; })}</div>
    {(tab === "salvage" ? inventory : reforgeable).length === 0 && <p className="progression-empty">Nothing is available here yet.</p>}
  </section>;
}

export function HallOfFallenView({ onBack }: { onBack: () => void }) {
  const records = useMemo(() => loadFallenHeroes(), []);
  return <section className="town-location progression-view fallen-view">
    <LocationHeader eyebrow="Memorial" title="Hall of Fallen" description="The names of lost heroes endure even when their journeys do not." onBack={onBack} />
    <div className="fallen-grid">{records.map((record) => { const avatar = CHARACTER_AVATARS.find((candidate) => candidate.id === record.avatarId); return <article key={record.id}><img src={avatar?.portraitUrl} alt="" /><div><p className="eyebrow">Level {record.level} · {record.location}</p><h2>{record.name}</h2><p>Fell to {record.defeatedBy}</p><small>Arena {record.arenaBest.toLocaleString()} · Tower Floor {record.towerBest}</small>{record.equipment.length > 0 && <p className="fallen-equipment">{record.equipment.join(" · ")}</p>}</div></article>; })}</div>
    {records.length === 0 && <div className="progression-locked"><Skull /><h2>No names are carved here</h2><p>May it remain that way.</p></div>}
  </section>;
}
