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
  const bestFloor = game.character.echoTowerBestFloor || 0;
  const startingFloor = getEchoTowerCheckpoint(bestFloor);
  const nextCheckpoint = Math.max(5, Math.ceil((startingFloor + 1) / 5) * 5);
  return <section className="town-location progression-view echo-tower-view">
    <div className="echo-tower-shade" aria-hidden="true" />
    <LocationHeader eyebrow="Endless Challenge" title="Tower of Echoes" description="Climb an endless chain of increasingly dangerous echoes." onBack={onBack} resource={<span className="town-gold"><Sparkles /> {game.character.salvageEssence} Essence</span>} />
    <div className="echo-tower-panel">
      <header className="echo-tower-panel-heading">
        <span className="echo-tower-panel-icon"><Flame /></span>
        <div><p className="eyebrow">The Endless Ascent</p><h2>Answer the Echo</h2><p>Each victory calls forth a stronger memory of battles past.</p></div>
        <div className="echo-tower-record"><small>Personal Record</small><strong>{bestFloor > 0 ? `Floor ${bestFloor}` : "Unranked"}</strong></div>
      </header>
      <div className="echo-tower-menu-layout">
        <section className="echo-tower-ascent-card">
          <span className="echo-tower-ascent-sigil"><Trophy /></span>
          <p className="eyebrow">Your Next Ascent</p>
          <h3>{unlocked ? `Begin at Floor ${startingFloor}` : "The Stair Is Sealed"}</h3>
          <p>{unlocked ? "Health carries between battles. Reach a fifth-floor checkpoint to recover fully and secure a new starting point." : `Complete ${unlockName} before the tower will answer your challenge.`}</p>
          <div className="echo-tower-rules">
            <span><small>Starting Floor</small><strong>{startingFloor}</strong></span>
            <span><small>Next Checkpoint</small><strong>Floor {nextCheckpoint}</strong></span>
            <span><small>Recovery</small><strong>Every 5 Floors</strong></span>
          </div>
          {unlocked ? <button type="button" className="echo-tower-enter-button" onClick={onStart}><Flame /> Enter the Tower</button> : <div className="echo-tower-lock-notice"><LockKeyhole /><span><strong>The tower remains silent</strong><small>Finish the final story chapter to awaken it.</small></span></div>}
        </section>
        <section className="echo-tower-ledger">
          <header><span><Trophy /></span><div><p className="eyebrow">Expedition Ledger</p><h3>Recent Ascents</h3></div></header>
          {game.character.echoTowerRuns.length === 0 ? <div className="echo-tower-empty"><Flame /><strong>No expeditions recorded</strong><p>Your completed runs will be preserved here.</p></div> : <ol>{game.character.echoTowerRuns.map((run, index) => <li key={run.id}><b>{index + 1}</b><span><strong>Floor {run.floorReached}</strong><small>{new Date(run.completedAt).toLocaleDateString()}</small></span><em>{run.essenceEarned} Essence</em></li>)}</ol>}
        </section>
      </div>
    </div>
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
