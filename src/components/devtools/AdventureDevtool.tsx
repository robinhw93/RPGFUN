import { BookOpen, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ADVENTURE_EVENTS, ADVENTURES } from "../../game/data";
import { experienceToNextLevel, MAX_LEVEL } from "../../game/progression";
import type { AdventureDefinition, AdventureStageEntry } from "../../game/types";
import { ADVENTURE_DRAFT_STORAGE_KEY, copyJson, downloadJson, EditorShell, EVENT_DRAFT_STORAGE_KEY, localEnemies, makeId, NumberField, readExchange, saveLiveCatalog, TextField, useLocalDraft, useModalScrollLock, type AdventureExchange, type EventExchange } from "./shared";

export function canonicalAdventureExchange(): AdventureExchange { return { format: "arkenfall-adventures", version: 1, adventures: ADVENTURES.map((adventure) => structuredClone(adventure)) }; }
export function normalizeAdventureExchange(exchange: AdventureExchange): AdventureExchange {
  return {
    ...exchange,
    format: "arkenfall-adventures",
    version: 1,
    adventures: exchange.adventures.map((adventure) => ({
      ...adventure,
      stages: adventure.stages.map((stage) => ({
        ...stage,
        entries: stage.entries.map((entry) => entry.reward ? {
          ...entry,
          reward: { experience: entry.reward.experience, gold: entry.reward.gold },
        } : entry),
      })),
    })),
  };
}
export function localEvents() { const stored = readExchange<EventExchange | null>(EVENT_DRAFT_STORAGE_KEY, null); return [...new Map([...(stored?.events ?? []), ...Object.values(ADVENTURE_EVENTS)].map((event) => [event.id, event])).values()]; }

export const XP_GUIDE_ROWS = Array.from({ length: MAX_LEVEL }, (_, index) => {
  const level = index + 1;
  const xpFromPreviousLevel = level === 1 ? 0 : experienceToNextLevel(level - 1);
  const totalXp = Array.from({ length: level - 1 }, (__, previousLevel) => experienceToNextLevel(previousLevel + 1)).reduce((sum, xp) => sum + xp, 0);
  return { level, xpFromPreviousLevel, totalXp };
});

export function XpGuideDialog({ onClose }: { onClose: () => void }) {
  useModalScrollLock();
  return <div className="xp-guide-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="xp-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="xp-guide-title">
      <header className="xp-guide-header"><div><p className="eyebrow">Adventure Rewards</p><h2 id="xp-guide-title">XP Guide</h2><p>Level 50 is the maximum level. Total XP is counted from the start of level 1.</p></div><button type="button" className="xp-guide-close" onClick={onClose} aria-label="Close XP guide"><X size={17} /></button></header>
      <div className="xp-guide-table-wrap"><table className="xp-guide-table"><thead><tr><th>Level</th><th>XP from previous level</th><th>Total XP</th></tr></thead><tbody>{XP_GUIDE_ROWS.map((row) => <tr key={row.level} className={row.level === MAX_LEVEL ? "max-level" : ""}><th scope="row">{row.level}</th><td>{row.level === 1 ? "Starting level" : row.xpFromPreviousLevel.toLocaleString("en-US")}</td><td>{row.totalXp.toLocaleString("en-US")}{row.level === MAX_LEVEL ? " · Max Level" : ""}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}

export function AdventureDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<AdventureExchange>(ADVENTURE_DRAFT_STORAGE_KEY, canonicalAdventureExchange(), normalizeAdventureExchange);
  const [xpGuideOpen, setXpGuideOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(store.draft.adventures[0]?.id ?? "");
  const selected = store.draft.adventures.find((adventure) => adventure.id === selectedId) ?? store.draft.adventures[0];
  const enemies = useMemo(localEnemies, []); const events = useMemo(localEvents, []);
  const update = (change: Partial<AdventureDefinition>) => store.setDraft((draft) => ({ ...draft, adventures: draft.adventures.map((adventure) => adventure.id === selected?.id ? { ...adventure, ...change } : adventure) }));
  const updateStage = (stageId: string, change: Partial<AdventureDefinition["stages"][number]>) => update({ stages: selected.stages.map((stage) => stage.id === stageId ? { ...stage, ...change } : stage) });
  const updateEntry = (stageId: string, entryId: string, change: Partial<AdventureStageEntry>) => updateStage(stageId, { entries: selected.stages.find((stage) => stage.id === stageId)!.entries.map((entry) => entry.id === entryId ? { ...entry, ...change } : entry) });
  const add = () => { const id = makeId("adventure"); const adventure: AdventureDefinition = { id, name: "New Adventure", description: "", recommendedLevel: 1, theme: "windsong_forest", stages: [{ id: makeId("stage"), name: "Stage 1", entries: [] }], completionTitle: "Adventure Complete", completionDescription: "" }; store.setDraft((draft) => ({ ...draft, adventures: [...draft.adventures, adventure] })); setSelectedId(id); };
  const addEntry = (stageId: string) => { const entry: AdventureStageEntry = { id: makeId("entry"), type: "combat", chance: 100, eyebrow: "Encounter", title: "New Encounter", description: "", enemyIds: [], reward: { experience: 50, gold: 8 } }; const stage = selected.stages.find((item) => item.id === stageId)!; updateStage(stageId, { entries: [...stage.entries, entry] }); };
  const copy = async () => { try { await copyJson(store.draft); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const save = async () => { try { window.localStorage.setItem(ADVENTURE_DRAFT_STORAGE_KEY, JSON.stringify(store.draft)); store.setMessage("Writing adventures to live source…"); await saveLiveCatalog("adventures", store.draft); store.setMessage("Adventures saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Adventures could not be saved to the live game"); } };
  return <EditorShell title="Adventure Editor" description="Build adventures from stages with unlimited weighted combat and event possibilities." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-adventures.json", store.draft); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New adventure</button>{store.draft.adventures.map((adventure) => <button className={adventure.id === selected?.id ? "selected" : ""} key={adventure.id} onClick={() => setSelectedId(adventure.id)}><strong>{adventure.name}</strong><small>{adventure.stages.length} stages</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Adventure Definition</p><h2>{selected.name}</h2></div><button type="button" className="secondary-editor-button xp-guide-button" onClick={() => setXpGuideOpen(true)}><BookOpen size={15} /> XP Guide</button></div><div className="content-form-grid"><TextField label="ID" value={selected.id} onChange={(id) => { update({ id }); setSelectedId(id); }} /><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><NumberField label="Recommended level" value={selected.recommendedLevel} min={1} onChange={(recommendedLevel) => update({ recommendedLevel })} /><label><span>Required completed adventure</span><select value={selected.prerequisiteAdventureId ?? ""} onChange={(event) => update({ prerequisiteAdventureId: event.target.value || undefined })}><option value="">None</option>{store.draft.adventures.filter((adventure) => adventure.id !== selected.id).map((adventure) => <option value={adventure.id} key={adventure.id}>{adventure.name}</option>)}</select></label><TextField label="Description" value={selected.description} onChange={(description) => update({ description })} textarea /><TextField label="Completion title" value={selected.completionTitle} onChange={(completionTitle) => update({ completionTitle })} /><TextField label="Completion description" value={selected.completionDescription} onChange={(completionDescription) => update({ completionDescription })} textarea /></div>
        <div className="stage-editor-list">{selected.stages.map((stage, stageIndex) => { const chanceTotal = stage.entries.reduce((sum, entry) => sum + entry.chance, 0); return <article className="stage-editor" key={stage.id}><header><div><small>Stage {stageIndex + 1}</small><input value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} /></div><span className={chanceTotal === 100 ? "valid" : "warning"}>{chanceTotal}% total</span><button onClick={() => update({ stages: selected.stages.filter((item) => item.id !== stage.id) })} disabled={selected.stages.length === 1}><Trash2 size={14} /> Remove stage</button></header>
          <div className="stage-entry-list">{stage.entries.map((entry) => <section className="stage-entry" key={entry.id}><div className="stage-entry-heading"><strong>{entry.title}</strong><button onClick={() => updateStage(stage.id, { entries: stage.entries.filter((item) => item.id !== entry.id) })}><Trash2 size={13} /></button></div><div className="content-form-grid"><TextField label="Entry ID" value={entry.id} onChange={(id) => updateEntry(stage.id, entry.id, { id })} /><label><span>Type</span><select value={entry.type} onChange={(event) => updateEntry(stage.id, entry.id, { type: event.target.value as AdventureStageEntry["type"], eventId: event.target.value === "event" ? events[0]?.id : undefined, enemyIds: event.target.value === "event" ? undefined : [] })}><option value="combat">Combat</option><option value="event">Event</option><option value="boss">Boss</option></select></label><NumberField label="Chance %" value={entry.chance} min={0} onChange={(chance) => updateEntry(stage.id, entry.id, { chance })} /><TextField label="Title" value={entry.title} onChange={(title) => updateEntry(stage.id, entry.id, { title })} /><TextField label="Eyebrow" value={entry.eyebrow} onChange={(eyebrow) => updateEntry(stage.id, entry.id, { eyebrow })} /><TextField label="Description" value={entry.description} onChange={(description) => updateEntry(stage.id, entry.id, { description })} textarea />
            {entry.type === "event" ? <label className="wide-field"><span>Event</span><select value={entry.eventId ?? ""} onChange={(event) => updateEntry(stage.id, entry.id, { eventId: event.target.value })}>{events.map((event) => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label> : <>
              <fieldset className="enemy-picker wide-field"><legend>Enemies</legend>{enemies.map((enemy) => { const count = entry.enemyIds?.filter((id) => id === enemy.id).length ?? 0; return <label key={enemy.id}><span>{enemy.name}</span><input type="number" min={0} value={count} aria-label={`${enemy.name} count`} onChange={(event) => { const nextCount = Math.max(0, Math.floor(Number(event.target.value))); const withoutEnemy = (entry.enemyIds ?? []).filter((id) => id !== enemy.id); updateEntry(stage.id, entry.id, { enemyIds: [...withoutEnemy, ...Array.from({ length: nextCount }, () => enemy.id)] }); }} /></label>; })}</fieldset>
              <fieldset className="encounter-reward-fields wide-field"><legend>Victory reward</legend><NumberField label="Experience" value={entry.reward?.experience ?? 0} min={0} onChange={(experience) => updateEntry(stage.id, entry.id, { reward: { experience, gold: entry.reward?.gold ?? 0 } })} /><NumberField label="Gold" value={entry.reward?.gold ?? 0} min={0} onChange={(gold) => updateEntry(stage.id, entry.id, { reward: { experience: entry.reward?.experience ?? 0, gold } })} /></fieldset>
            </>}
          </div></section>)}</div><button className="secondary-editor-button" onClick={() => addEntry(stage.id)}><Plus size={14} /> Add stage possibility</button>
        </article>; })}</div><button className="secondary-editor-button add-stage-button" onClick={() => update({ stages: [...selected.stages, { id: makeId("stage"), name: `Stage ${selected.stages.length + 1}`, entries: [] }] })}><Plus size={14} /> Add stage</button>
      </section>}
    </div>
    {xpGuideOpen && <XpGuideDialog onClose={() => setXpGuideOpen(false)} />}
  </EditorShell>;
}
