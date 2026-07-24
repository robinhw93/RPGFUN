import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ENEMIES } from "../../game/data";
import type { AbilityRange } from "../../game/types";
import { copyJson, downloadJson, EditorShell, ENEMY_DRAFT_STORAGE_KEY, finiteNumber, makeId, NumberField, TextField, useLocalDraft, type EnemyAbilityDraft, type EnemyDraft, type EnemyEditableStats, type EnemyExchange } from "./shared";

export function canonicalEnemyExchange(): EnemyExchange {
  return {
    format: "arkenfall-enemies",
    version: 3,
    enemies: Object.values(ENEMIES).map((enemy) => ({
      id: enemy.id,
      name: enemy.name,
      title: enemy.title,
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
      abilities: enemy.abilities.map((ability) => ({
        id: ability.id,
        name: ability.name,
        energyCost: ability.energyCost,
        cooldownTurns: ability.cooldownTurns,
        range: ability.range,
        effect: ability.description,
      })),
      behaviorNotes: enemy.behaviorNotes,
      accent: enemy.accent,
    })),
  };
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
      const fallbackAbilities: EnemyAbilityDraft[] = (fallback?.abilities ?? []).map((ability) => ({
        id: ability.id,
        name: ability.name,
        energyCost: ability.energyCost,
        cooldownTurns: ability.cooldownTurns,
        range: ability.range,
        effect: ability.description,
      }));
      const rawAbilities: Array<Partial<EnemyAbilityDraft> & { description?: string }> = Array.isArray(legacy.abilities) ? legacy.abilities : fallbackAbilities;
      const abilities = rawAbilities.map((ability, index) => {
        const raw = ability as Partial<EnemyAbilityDraft> & { description?: string };
        const fallbackAbility = fallbackAbilities.find((candidate) => candidate.id === raw.id);
        return {
          id: raw.id ?? makeId("enemy-ability"),
          name: raw.name ?? `Ability ${index + 1}`,
          energyCost: finiteNumber(raw.energyCost, 0),
          cooldownTurns: finiteNumber(raw.cooldownTurns, 0),
          range: (raw.range === "ranged" ? "ranged" : raw.range === "melee" ? "melee" : fallbackAbility?.range ?? "melee") as AbilityRange,
          effect: raw.effect ?? raw.description ?? "",
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
      });
      return {
        id: legacy.id ?? makeId("enemy"),
        name: legacy.name ?? "New Enemy",
        title: legacy.title ?? "Creature",
        maxHp: finiteNumber(legacy.maxHp, fallback?.maxHp ?? 30),
        physicalPower: finiteNumber(legacy.physicalPower, fallback?.physicalPower ?? (legacy.damageType === "physical" ? legacyPower : 0)),
        spellPower: finiteNumber(legacy.spellPower, fallback?.spellPower ?? (legacy.damageType && legacy.damageType !== "physical" ? legacyPower : 0)),
        armor: finiteNumber(legacy.armor, fallback?.armor ?? 0),
        magicResistance: finiteNumber(legacy.magicResistance, fallback?.magicResistance ?? 0),
        hitChance: finiteNumber(legacy.hitChance, fallback ? fallback.hitChance * 100 : 95),
        dodgeChance: finiteNumber(legacy.dodgeChance, fallback ? fallback.dodgeChance * 100 : 5),
        critChance: finiteNumber(legacy.critChance, fallback ? fallback.critChance * 100 : 5),
        energyRegen: finiteNumber(legacy.energyRegen, fallback?.energyRegen ?? 1),
        maxEnergy: finiteNumber(legacy.maxEnergy, fallback?.maxEnergy ?? 10),
        abilities,
        behaviorNotes: legacy.behaviorNotes ?? fallback?.behaviorNotes ?? "",
        accent: legacy.accent ?? fallback?.accent ?? "#79a86d",
      };
    }),
  };
}

export function EnemyDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<EnemyExchange>(ENEMY_DRAFT_STORAGE_KEY, canonicalEnemyExchange(), normalizeEnemyExchange);
  const [selectedId, setSelectedId] = useState(store.draft.enemies[0]?.id ?? "");
  const sourceSyncTimer = useRef<number | null>(null);
  const pendingSourceStats = useRef(new Map<string, Partial<EnemyEditableStats>>());
  const selected = store.draft.enemies.find((enemy) => enemy.id === selectedId) ?? store.draft.enemies[0];
  const update = (change: Partial<EnemyDraft>) => store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.map((enemy) => enemy.id === selected?.id ? { ...enemy, ...change } : enemy) }));
  useEffect(() => () => { if (sourceSyncTimer.current !== null) window.clearTimeout(sourceSyncTimer.current); }, []);
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
        store.setMessage("Stats written to src/game/data.ts");
      } catch (error) {
        store.setMessage(error instanceof Error ? error.message : "Source sync is only available on the local dev server.");
      }
    }, 450);
  };
  const updateAbility = (abilityId: string, change: Partial<EnemyAbilityDraft>) => update({ abilities: selected.abilities.map((ability) => ability.id === abilityId ? { ...ability, ...change } : ability) });
  const addAbility = () => update({ abilities: [...selected.abilities, { id: makeId("enemy-ability"), name: "New Ability", energyCost: 0, cooldownTurns: 0, range: "melee", effect: "" }] });
  const add = () => {
    const id = makeId("enemy");
    const enemy: EnemyDraft = { id, name: "New Enemy", title: "Creature", maxHp: 30, physicalPower: 6, spellPower: 0, armor: 0, magicResistance: 0, hitChance: 95, dodgeChance: 5, critChance: 5, energyRegen: 1, maxEnergy: 10, abilities: [], behaviorNotes: "", accent: "#79a86d" };
    store.setDraft((draft) => ({ ...draft, enemies: [...draft.enemies, enemy] })); setSelectedId(id);
  };
  const remove = () => { if (!selected) return; store.setDraft((draft) => ({ ...draft, enemies: draft.enemies.filter((enemy) => enemy.id !== selected.id) })); setSelectedId(store.draft.enemies.find((enemy) => enemy.id !== selected.id)?.id ?? ""); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  return <EditorShell title="Create Enemy" description="Build enemy stat blocks and describe their abilities and combat priorities." message={store.message} onSave={store.save} onCopy={copy} onExport={() => { downloadJson("arkenfall-enemies.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New enemy</button>{store.draft.enemies.map((enemy) => <button className={enemy.id === selected?.id ? "selected" : ""} key={enemy.id} onClick={() => setSelectedId(enemy.id)}><strong>{enemy.name}</strong><small>{enemy.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Enemy Definition</p><h2>{selected.name}</h2></div><button className="danger-icon-button" onClick={remove}><Trash2 size={15} /> Delete</button></div><p className="enemy-source-sync-note">Existing enemy stats write directly to the live source file. Ability rules remain draft-only until implemented.</p><div className="content-form-grid">
        <TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><TextField label="Title" value={selected.title} onChange={(title) => update({ title })} /><TextField label="Accent color" value={selected.accent} onChange={(accent) => update({ accent })} />
        <NumberField label="Health" value={selected.maxHp} min={1} onChange={(maxHp) => updateStats({ maxHp })} /><NumberField label="Physical Power" value={selected.physicalPower} min={0} onChange={(physicalPower) => updateStats({ physicalPower })} /><NumberField label="Spell Power" value={selected.spellPower} min={0} onChange={(spellPower) => updateStats({ spellPower })} /><NumberField label="Armor" value={selected.armor} min={0} onChange={(armor) => updateStats({ armor })} /><NumberField label="Magic Resistance" value={selected.magicResistance} min={0} onChange={(magicResistance) => updateStats({ magicResistance })} />
        <NumberField label="Hit Chance %" value={selected.hitChance} step={0.1} onChange={(hitChance) => updateStats({ hitChance })} /><NumberField label="Dodge Chance %" value={selected.dodgeChance} step={0.1} onChange={(dodgeChance) => updateStats({ dodgeChance })} /><NumberField label="Crit Chance %" value={selected.critChance} step={0.1} onChange={(critChance) => updateStats({ critChance })} /><NumberField label="Energy Regeneration" value={selected.energyRegen} min={0} onChange={(energyRegen) => updateStats({ energyRegen })} />
        <NumberField label="Max Energy" value={selected.maxEnergy} min={1} onChange={(maxEnergy) => updateStats({ maxEnergy })} />
        <div className="enemy-ability-editor-list wide-field"><div className="enemy-ability-editor-heading"><div><span>Abilities</span><small>Add every ability this enemy can use.</small></div><button type="button" className="secondary-editor-button" onClick={addAbility}><Plus size={14} /> Add ability</button></div>
          {selected.abilities.length === 0 && <p className="empty-editor-copy">No abilities added yet.</p>}
          {selected.abilities.map((ability, index) => <article className="enemy-ability-editor" key={ability.id}><header><strong>Ability {index + 1}</strong><button type="button" onClick={() => update({ abilities: selected.abilities.filter((item) => item.id !== ability.id) })}><Trash2 size={14} /> Remove</button></header><div className="content-form-grid"><TextField label="Name" value={ability.name} onChange={(name) => updateAbility(ability.id, { name })} /><NumberField label="Energy Cost" value={ability.energyCost} min={0} onChange={(energyCost) => updateAbility(ability.id, { energyCost })} /><NumberField label="Cooldown" value={ability.cooldownTurns} min={0} onChange={(cooldownTurns) => updateAbility(ability.id, { cooldownTurns })} /><label><span>Attack Type</span><select value={ability.range} onChange={(event) => updateAbility(ability.id, { range: event.target.value as AbilityRange })}><option value="melee">Melee</option><option value="ranged">Ranged</option></select></label><TextField label="Effect" value={ability.effect} onChange={(effect) => updateAbility(ability.id, { effect })} textarea /></div></article>)}
        </div>
        <TextField label="How they use their abilities" value={selected.behaviorNotes} onChange={(behaviorNotes) => update({ behaviorNotes })} textarea />
      </div></section>}
    </div>
  </EditorShell>;
}
