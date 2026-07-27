import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ENEMIES } from "../../game/data";
import type { AbilityRange, EnemyBehaviorKind } from "../../game/types";
import { copyJson, downloadJson, DropTableEditor, EditorShell, ENEMY_DRAFT_STORAGE_KEY, finiteNumber, JsonObjectField, localItems, makeId, NumberField, saveLiveCatalog, TextField, useLocalDraft, type EnemyAbilityDraft, type EnemyDraft, type EnemyEditableStats, type EnemyExchange } from "./shared";

const ENEMY_DRAFT_CATALOG_SIGNATURE_KEY = `${ENEMY_DRAFT_STORAGE_KEY}.live-catalog-signature`;
const ENEMY_DRAFT_CATALOG_REVISION = "tactical-enemy-ai-v2";
const CANONICAL_REFRESH_DROP_TABLE_ENEMY_IDS = new Set([
  "enemy-mrxiut2a-k4kgv",
  "enemy-mrxj4o6o-o45ia",
  "enemy-mrxk609z-n04fq",
  "enemy-mrxkar5z-g9o5d",
  "enemy-mrxkjqs3-g7g5i",
  "enemy-ms2vrqbb-8r5ux",
  "enemy-ms2w17p6-txpmq",
  "enemy-ms2w93yt-v817a",
  "enemy-ms2wk1ul-6ol9b",
  "enemy-ms2wuk5j-1ddqa",
  "enemy-ms2xaper-z7o3g",
]);

export function canonicalEnemyExchange(): EnemyExchange {
  return {
    format: "arkenfall-enemies",
    version: 3,
    enemies: Object.values(ENEMIES).map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      title: enemy.title,
      imageUrl: enemy.imageUrl,
      portraitUrl: enemy.portraitUrl,
      maxHp: enemy.maxHp,
      physicalPower: enemy.physicalPower,
      spellPower: enemy.spellPower,
      armor: enemy.armor,
      magicResistance: enemy.magicResistance,
      hitChance: enemy.hitChance * 100,
      dodgeChance: enemy.dodgeChance * 100,
      critChance: enemy.critChance * 100,
      energyRegen: enemy.energyRegen,
      maxEnergy: enemy.maxEnergy,
      startingEnergy: Math.min(enemy.maxEnergy, Math.max(0, Math.round(enemy.startingEnergy ?? enemy.maxEnergy))),
      dropTable: structuredClone(enemy.dropTable ?? []),
      abilities: enemy.abilities.map(({ description, ...ability }) => ({ ...structuredClone(ability), effect: description })),
      behaviorNotes: enemy.behaviorNotes,
      behavior: enemy.behavior,
      ai: structuredClone(enemy.ai),
      maxActionsPerTurn: enemy.maxActionsPerTurn,
      healOnAllyDeath: structuredClone(enemy.healOnAllyDeath),
      accent: enemy.accent,
    })),
  };
}

export function mergeEnemyDraftWithCanonical(draft: EnemyExchange, canonical: EnemyExchange = canonicalEnemyExchange()): EnemyExchange {
  const draftEnemyIds = new Set((draft.enemies ?? []).map((enemy) => enemy.id));
  return {
    ...draft,
    enemies: [...(draft.enemies ?? []), ...canonical.enemies.filter((enemy) => !draftEnemyIds.has(enemy.id)).map((enemy) => structuredClone(enemy))],
  };
}

export function synchronizeEnemyDraftWithCanonical(draft: EnemyExchange, canonical: EnemyExchange = canonicalEnemyExchange()): EnemyExchange {
  const merged = mergeEnemyDraftWithCanonical(draft, canonical);
  const canonicalEnemies = new Map(canonical.enemies.map((enemy) => [enemy.id, enemy]));
  return {
    ...merged,
    enemies: merged.enemies.map((enemy) => {
      const liveEnemy = canonicalEnemies.get(enemy.id);
      return {
        ...enemy,
        ...(liveEnemy?.ai ? {
          abilities: structuredClone(liveEnemy.abilities),
          behaviorNotes: liveEnemy.behaviorNotes,
          behavior: liveEnemy.behavior,
          ai: structuredClone(liveEnemy.ai),
          maxActionsPerTurn: liveEnemy.maxActionsPerTurn,
        } : {}),
        ...(liveEnemy && CANONICAL_REFRESH_DROP_TABLE_ENEMY_IDS.has(enemy.id) ? { dropTable: structuredClone(liveEnemy.dropTable) } : {}),
      };
    }),
  };
}

function getEnemyCatalogSignature(exchange: EnemyExchange): string {
  const refreshedDropTables = exchange.enemies
    .filter((enemy) => CANONICAL_REFRESH_DROP_TABLE_ENEMY_IDS.has(enemy.id))
    .map((enemy) => `${enemy.id}:${enemy.dropTable.map((drop) => `${drop.itemId}@${drop.chance}`).join(",")}`)
    .join("|");
  return `${ENEMY_DRAFT_CATALOG_REVISION}::${exchange.enemies.map((enemy) => enemy.id).join("|")}::${refreshedDropTables}`;
}

export function normalizeEnemyExchange(exchange: EnemyExchange): EnemyExchange {
  const fallbackById = ENEMIES;
  return {
    format: "arkenfall-enemies",
    version: 3,
    enemies: (Array.isArray(exchange?.enemies) ? exchange.enemies : []).map((enemy) => {
      const legacy = enemy as Partial<EnemyDraft> & { power?: number; damageType?: string; energyCost?: number; intentText?: string; attackDescription?: string; abilitiesNotes?: string };
      const fallback = legacy.id ? fallbackById[legacy.id] : undefined;
      const legacyPower = finiteNumber(legacy.power, 0);
      const fallbackAbilities: EnemyAbilityDraft[] = (fallback?.abilities ?? []).map(({ description, ...ability }) => ({ ...structuredClone(ability), effect: description }));
      const rawAbilities: Array<Partial<EnemyAbilityDraft> & { description?: string }> = Array.isArray(legacy.abilities) ? legacy.abilities : fallbackAbilities;
      const abilities = rawAbilities.map((ability, index) => {
        const raw = ability as Partial<EnemyAbilityDraft> & { description?: string };
        const fallbackAbility = fallbackAbilities.find((candidate) => candidate.id === raw.id);
        return {
          ...fallbackAbility,
          ...raw,
          id: raw.id ?? makeId("enemy-ability"),
          name: raw.name ?? `Ability ${index + 1}`,
          energyCost: finiteNumber(raw.energyCost, 0),
          cooldownTurns: finiteNumber(raw.cooldownTurns, 0),
          range: (raw.range === "ranged" ? "ranged" : raw.range === "melee" ? "melee" : fallbackAbility?.range ?? "melee") as AbilityRange,
          effect: raw.effect ?? raw.description ?? "",
          vfx: raw.vfx ?? fallbackAbility?.vfx ?? "enemy_training_strike",
        };
      });
      if (legacy.abilitiesNotes && abilities.length === 1) abilities[0] = { ...abilities[0], effect: legacy.abilitiesNotes };
      const legacyEffect = legacy.abilitiesNotes ?? legacy.attackDescription;
      if (legacyEffect && abilities.length === 0) abilities.push({
        id: makeId("enemy-ability"),
        name: legacy.intentText?.split(" · ")[0] || "New Ability",
        energyCost: finiteNumber(legacy.energyCost, 0),
        cooldownTurns: 0,
        range: "melee",
        effect: legacyEffect,
        vfx: "enemy_training_strike",
      });
      const maxEnergy = finiteNumber(legacy.maxEnergy, fallback?.maxEnergy ?? 10);
      const startingEnergy = Math.min(maxEnergy, Math.max(0, Math.round(finiteNumber(legacy.startingEnergy, fallback?.startingEnergy ?? fallback?.maxEnergy ?? maxEnergy))));
      return {
        id: legacy.id ?? makeId("enemy"),
        name: legacy.name ?? "New Enemy",
        title: legacy.title ?? "Creature",
        imageUrl: legacy.imageUrl ?? fallback?.imageUrl ?? "/assets/enemies/full/dummy.webp",
        portraitUrl: legacy.portraitUrl ?? fallback?.portraitUrl ?? "/assets/enemies/portraits/dummy.webp",
        maxHp: finiteNumber(legacy.maxHp, fallback?.maxHp ?? 30),
        physicalPower: finiteNumber(legacy.physicalPower, fallback?.physicalPower ?? (legacy.damageType === "physical" ? legacyPower : 0)),
        spellPower: finiteNumber(legacy.spellPower, fallback?.spellPower ?? (legacy.damageType && legacy.damageType !== "physical" ? legacyPower : 0)),
        armor: finiteNumber(legacy.armor, fallback?.armor ?? 0),
        magicResistance: finiteNumber(legacy.magicResistance, fallback?.magicResistance ?? 0),
        hitChance: finiteNumber(legacy.hitChance, fallback ? fallback.hitChance * 100 : 95),
        dodgeChance: finiteNumber(legacy.dodgeChance, fallback ? fallback.dodgeChance * 100 : 5),
        critChance: finiteNumber(legacy.critChance, fallback ? fallback.critChance * 100 : 5),
        energyRegen: finiteNumber(legacy.energyRegen, fallback?.energyRegen ?? 1),
        maxEnergy,
        startingEnergy,
        dropTable: Array.isArray(legacy.dropTable)
          ? legacy.dropTable.flatMap((drop) => typeof drop?.itemId === "string" ? [{ itemId: drop.itemId, chance: Math.min(100, Math.max(0, finiteNumber(drop.chance, 0))) }] : [])
          : structuredClone(fallback?.dropTable ?? []),
        abilities,
        behaviorNotes: legacy.behaviorNotes ?? fallback?.behaviorNotes ?? "",
        behavior: legacy.behavior ?? fallback?.behavior ?? "priority",
        ai: legacy.ai ?? fallback?.ai,
        maxActionsPerTurn: Math.max(1, Math.round(finiteNumber(legacy.maxActionsPerTurn, fallback?.maxActionsPerTurn ?? 1))),
        healOnAllyDeath: legacy.healOnAllyDeath ?? fallback?.healOnAllyDeath,
        accent: legacy.accent ?? fallback?.accent ?? "#79a86d",
      };
    }),
  };
}

export function EnemyDevtool({ onExit }: { onExit: () => void }) {
  const canonical = canonicalEnemyExchange();
  const canonicalSignature = getEnemyCatalogSignature(canonical);
  const store = useLocalDraft<EnemyExchange>(ENEMY_DRAFT_STORAGE_KEY, canonical, normalizeEnemyExchange);
  const [selectedId, setSelectedId] = useState(store.draft.enemies[0]?.id ?? "");
  const sourceSyncTimer = useRef<number | null>(null);
  const dropSourceSyncTimer = useRef<number | null>(null);
  const pendingSourceStats = useRef(new Map<string, Partial<EnemyEditableStats>>());
  const pendingSourceDropTables = useRef(new Map<string, EnemyDraft["dropTable"]>());
  const selected = store.draft.enemies.find((enemy) => enemy.id === selectedId) ?? store.draft.enemies[0];
  const items = useMemo(localItems, []);
  const update = (change: Partial<EnemyDraft>) => store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.map((enemy) => enemy.id === selected?.id ? { ...enemy, ...change } : enemy) }));
  useEffect(() => {
    if (window.localStorage.getItem(ENEMY_DRAFT_CATALOG_SIGNATURE_KEY) === canonicalSignature) return;
    store.setDraft((draft) => normalizeEnemyExchange(synchronizeEnemyDraftWithCanonical(draft, canonical)));
    window.localStorage.setItem(ENEMY_DRAFT_CATALOG_SIGNATURE_KEY, canonicalSignature);
    store.setMessage("New live enemies and updated drop tables were synced to this browser draft");
  }, [canonicalSignature]);
  useEffect(() => () => {
    if (sourceSyncTimer.current !== null) window.clearTimeout(sourceSyncTimer.current);
    if (dropSourceSyncTimer.current !== null) window.clearTimeout(dropSourceSyncTimer.current);
  }, []);
  const updateStats = (change: Partial<EnemyEditableStats>) => {
    if (!selected) return;
    const next = { ...selected, ...change };
    update(change);
    if (!ENEMIES[next.id]) {
      store.setMessage("Draft updated locally. New enemies still need a Codex implementation.");
      return;
    }
    pendingSourceStats.current.set(next.id, { ...pendingSourceStats.current.get(next.id), ...change });
    if (sourceSyncTimer.current !== null) window.clearTimeout(sourceSyncTimer.current);
    store.setMessage("Updating live enemy stats...");
    sourceSyncTimer.current = window.setTimeout(async () => {
      try {
        const pendingEntries = [...pendingSourceStats.current.entries()];
        pendingSourceStats.current.clear();
        for (const [enemyId, pendingChange] of pendingEntries) {
          const sourceStats = Object.fromEntries(Object.entries(pendingChange).map(([field, value]) => [
            field,
            field === "hitChance" || field === "dodgeChance" || field === "critChance" ? value / 100 : value,
          ]));
          const response = await fetch("/__arkenfall/enemy-stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: enemyId, stats: sourceStats }),
          });
          if (!response.headers.get("content-type")?.includes("application/json")) {
            throw new Error("Source sync is only available on the local development server.");
          }
          const result = await response.json() as { ok?: boolean; error?: string };
          if (!response.ok || !result.ok) throw new Error(result.error ?? "Source sync failed.");
        }
        store.setMessage("Stats written to src/game/content/enemies.ts");
      } catch (error) {
        store.setMessage(error instanceof Error ? error.message : "Source sync is only available on the local dev server.");
      }
    }, 450);
  };
  const updateDropTable = (dropTable: EnemyDraft["dropTable"]) => {
    if (!selected) return;
    update({ dropTable });
    if (!ENEMIES[selected.id]) {
      store.setMessage("Drop table saved in the draft. New enemies still need a Codex implementation.");
      return;
    }
    pendingSourceDropTables.current.set(selected.id, structuredClone(dropTable));
    if (dropSourceSyncTimer.current !== null) window.clearTimeout(dropSourceSyncTimer.current);
    store.setMessage("Updating live enemy drop table...");
    dropSourceSyncTimer.current = window.setTimeout(async () => {
      try {
        const pendingEntries = [...pendingSourceDropTables.current.entries()];
        pendingSourceDropTables.current.clear();
        for (const [enemyId, pendingDropTable] of pendingEntries) {
          const response = await fetch("/__arkenfall/enemy-drop-table", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: enemyId, dropTable: pendingDropTable }),
          });
          if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Source sync is only available on the local development server.");
          const result = await response.json() as { ok?: boolean; error?: string };
          if (!response.ok || !result.ok) throw new Error(result.error ?? "Source sync failed.");
        }
        store.setMessage("Drop table written to the live enemy catalog");
      } catch (error) {
        store.setMessage(error instanceof Error ? error.message : "Source sync is only available on the local dev server.");
      }
    }, 450);
  };
  const updateAbility = (abilityId: string, change: Partial<EnemyAbilityDraft>) => update({ abilities: selected.abilities.map((ability) => ability.id === abilityId ? { ...ability, ...change } : ability) });
  const addAbility = () => update({ abilities: [...selected.abilities, { id: makeId("enemy-ability"), name: "New Ability", energyCost: 0, cooldownTurns: 0, range: "melee", effect: "", vfx: "enemy_training_strike" }] });
  const add = () => {
    const id = makeId("enemy");
    const enemy: EnemyDraft = { id, name: "New Enemy", title: "Creature", imageUrl: "/assets/enemies/full/dummy.webp", portraitUrl: "/assets/enemies/portraits/dummy.webp", maxHp: 30, physicalPower: 6, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 95, dodgeChance: 5, critChance: 5, energyRegen: 1, maxEnergy: 10, startingEnergy: 10, dropTable: [], abilities: [], behaviorNotes: "", behavior: "priority", maxActionsPerTurn: 1, accent: "#79a86d" };
    store.setDraft((draft) => ({ ...draft, enemies: [...draft.enemies, enemy] })); setSelectedId(id);
  };
  const save = async () => { try { const exchange = normalizeEnemyExchange(store.draft); store.setDraft(exchange); store.setMessage("Writing enemies to live source..."); await saveLiveCatalog("enemies", exchange); store.setMessage("Enemies saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Enemies could not be saved to the live game"); } };
  const remove = () => { if (!selected) return; store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.filter((enemy) => enemy.id !== selected.id) })); setSelectedId(store.draft.enemies.find((enemy) => enemy.id !== selected.id)?.id ?? ""); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  return <EditorShell title="Create Enemy" description="Build complete executable enemies, abilities, artwork and combat priorities." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-enemies.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New enemy</button>{store.draft.enemies.map((enemy) => <button className={enemy.id === selected?.id ? "selected" : ""} key={enemy.id} onClick={() => setSelectedId(enemy.id)}><strong>{enemy.name}</strong><small>{enemy.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Enemy Definition</p><h2>{selected.name}</h2></div><button className="danger-icon-button" onClick={remove}><Trash2 size={15} /> Delete</button></div><p className="enemy-source-sync-note">Save validates and writes the complete enemy catalog. Existing numeric stats and drop tables also keep their short live-write behavior.</p><div className="content-form-grid">
        <TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><TextField label="Title" value={selected.title} onChange={(title) => update({ title })} /><TextField label="Full artwork URL" value={selected.imageUrl} onChange={(imageUrl) => update({ imageUrl })} /><TextField label="Portrait URL" value={selected.portraitUrl} onChange={(portraitUrl) => update({ portraitUrl })} /><TextField label="Accent color" value={selected.accent} onChange={(accent) => update({ accent })} />
        <NumberField label="Health" value={selected.maxHp} min={1} onChange={(maxHp) => updateStats({ maxHp })} /><NumberField label="Physical Power" value={selected.physicalPower} min={0} onChange={(physicalPower) => updateStats({ physicalPower })} /><NumberField label="Spell Power" value={selected.spellPower} min={0} onChange={(spellPower) => updateStats({ spellPower })} /><NumberField label="Armor" value={selected.armor} min={0} onChange={(armor) => updateStats({ armor })} /><NumberField label="Magic Resistance" value={selected.magicResistance} min={0} onChange={(magicResistance) => updateStats({ magicResistance })} />
        <NumberField label="Hit Chance %" value={selected.hitChance} step={0.1} onChange={(hitChance) => updateStats({ hitChance })} /><NumberField label="Dodge Chance %" value={selected.dodgeChance} step={0.1} onChange={(dodgeChance) => updateStats({ dodgeChance })} /><NumberField label="Crit Chance %" value={selected.critChance} step={0.1} onChange={(critChance) => updateStats({ critChance })} /><NumberField label="Energy Regeneration" value={selected.energyRegen} min={0} onChange={(energyRegen) => updateStats({ energyRegen })} />
        <NumberField label="Max Energy" value={selected.maxEnergy} min={1} onChange={(maxEnergy) => updateStats({ maxEnergy, startingEnergy: Math.min(selected.startingEnergy, maxEnergy) })} />
        <NumberField label="Starting Energy" value={selected.startingEnergy} min={0} max={selected.maxEnergy} onChange={(startingEnergy) => updateStats({ startingEnergy: Math.min(selected.maxEnergy, Math.max(0, Math.round(startingEnergy))) })} />
        <DropTableEditor entries={selected.dropTable} items={items} onChange={updateDropTable} title="Enemy drop table" allowDuplicateItems />
        <div className="enemy-ability-editor-list wide-field"><div className="enemy-ability-editor-heading"><div><span>Abilities</span><small>Add every ability this enemy can use.</small></div><button type="button" className="secondary-editor-button" onClick={addAbility}><Plus size={14} /> Add ability</button></div>
          {selected.abilities.length === 0 && <p className="empty-editor-copy">No abilities added yet.</p>}
          {selected.abilities.map((ability, index) => { const { id: _id, name: _name, energyCost: _energyCost, cooldownTurns: _cooldownTurns, range: _range, effect: _effect, ...advanced } = ability; return <article className="enemy-ability-editor" key={ability.id}><header><strong>Ability {index + 1}</strong><button type="button" onClick={() => update({ abilities: selected.abilities.filter((item) => item.id !== ability.id) })}><Trash2 size={14} /> Remove</button></header><div className="content-form-grid"><TextField label="Name" value={ability.name} onChange={(name) => updateAbility(ability.id, { name })} /><NumberField label="Energy Cost" value={ability.energyCost} min={0} onChange={(energyCost) => updateAbility(ability.id, { energyCost })} /><NumberField label="Cooldown" value={ability.cooldownTurns} min={0} onChange={(cooldownTurns) => updateAbility(ability.id, { cooldownTurns })} /><label><span>Attack Type</span><select value={ability.range} onChange={(event) => updateAbility(ability.id, { range: event.target.value as AbilityRange })}><option value="melee">Melee</option><option value="ranged">Ranged</option></select></label><TextField label="Effect" value={ability.effect} onChange={(effect) => updateAbility(ability.id, { effect })} textarea /><JsonObjectField label="Advanced executable ability fields (JSON)" value={advanced} onCommit={(fields) => updateAbility(ability.id, fields as Partial<EnemyAbilityDraft>)} /></div></article>; })}
        </div>
        <label><span>Behavior</span><select value={selected.behavior} onChange={(event) => update({ behavior: event.target.value as EnemyBehaviorKind })}><option value="priority">Data-owned tactics / priority</option><option value="single">Single ability</option><option value="rabid_rat">Rabid Rat</option><option value="brown_bear">Brown Bear</option><option value="forest_spirit">Forest Spirit</option><option value="goblin_longseer">Goblin Longseer</option><option value="goblin_woundfixer">Goblin Woundfixer</option><option value="goblin_biggrown">Goblin Biggrown</option><option value="goblin_chieftain">Goblin Chieftain</option><option value="hill_troll">Hill Troll</option><option value="mountain_troll">Mountain Troll</option><option value="troll_shaman">Troll Shaman</option><option value="bandit_enforcer">Bandit Enforcer</option><option value="loot_goblin">Loot Goblin</option><option value="bandit_trapper">Bandit Trapper</option><option value="troll_bandit_king">Troll Bandit King</option></select></label><NumberField label="Maximum actions per turn" value={selected.maxActionsPerTurn} min={1} onChange={(maxActionsPerTurn) => update({ maxActionsPerTurn: Math.max(1, Math.round(maxActionsPerTurn)) })} /><JsonObjectField label="Advanced enemy fields and tactical AI (JSON)" value={{ ...(selected.ai ? { ai: selected.ai } : {}), ...(selected.healOnAllyDeath ? { healOnAllyDeath: selected.healOnAllyDeath } : {}) }} onCommit={(fields) => update({ ai: fields.ai as EnemyDraft["ai"], healOnAllyDeath: fields.healOnAllyDeath as EnemyDraft["healOnAllyDeath"] })} /><TextField label="How they use their abilities" value={selected.behaviorNotes} onChange={(behaviorNotes) => update({ behaviorNotes })} textarea />
      </div></section>}
    </div>
  </EditorShell>;
}
