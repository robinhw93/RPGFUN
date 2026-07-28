import { BookOpen, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ADVENTURE_EVENTS, ADVENTURES } from "../../game/data";
import { getAdventureDefaultTravelText, getAdventureTravelText } from "../../game/adventures";
import { experienceToNextLevel, MAX_LEVEL } from "../../game/progression";
import type { AdventureDefinition, AdventureStageDefinition, AdventureStageEntry, AdventureTheme } from "../../game/types";
import { ADVENTURE_DRAFT_STORAGE_KEY, copyJson, downloadJson, DropTableEditor, EditorShell, ensureInternalId, EVENT_DRAFT_STORAGE_KEY, localEnemies, localItems, makeId, NumberField, readExchange, saveLiveCatalog, TextField, useLocalDraft, useModalScrollLock, type AdventureExchange, type EventExchange } from "./shared";

const ADVENTURE_DRAFT_CATALOG_SIGNATURE_KEY = `${ADVENTURE_DRAFT_STORAGE_KEY}.live-catalog-signature`;
const ADVENTURE_DRAFT_CATALOG_REVISION = "highfall-mountains-v1";

export function canonicalAdventureExchange(): AdventureExchange { return { format: "arkenfall-adventures", version: 1, adventures: ADVENTURES.map((adventure) => structuredClone(adventure)) }; }
export function mergeAdventureDraftWithCanonical(draft: AdventureExchange, canonical: AdventureExchange = canonicalAdventureExchange()): AdventureExchange {
  const draftAdventureIds = new Set((draft.adventures ?? []).map((adventure) => adventure.id));
  return {
    ...draft,
    adventures: [...(draft.adventures ?? []), ...canonical.adventures.filter((adventure) => !draftAdventureIds.has(adventure.id)).map((adventure) => structuredClone(adventure))],
  };
}
function getAdventureCatalogSignature(exchange: AdventureExchange): string {
  return `${ADVENTURE_DRAFT_CATALOG_REVISION}::${exchange.adventures.map((adventure) => adventure.id).join("|")}`;
}
export function moveAdventureStage(stages: AdventureStageDefinition[], stageId: string, direction: -1 | 1): AdventureStageDefinition[] {
  const currentIndex = stages.findIndex((stage) => stage.id === stageId);
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= stages.length) return stages;
  const reordered = [...stages];
  const [stage] = reordered.splice(currentIndex, 1);
  reordered.splice(nextIndex, 0, stage);
  return reordered;
}
export function normalizeAdventureExchange(exchange: AdventureExchange): AdventureExchange {
  const usedAdventureIds = new Set<string>();
  const adventures = exchange.adventures ?? [];
  const normalizedAdventureIds = adventures.map((adventure) => ensureInternalId(adventure.id, "adventure", usedAdventureIds, adventure.name));
  const repairedAdventureIds = new Map<string, string>();
  adventures.forEach((adventure, index) => {
    if (typeof adventure.id === "string" && adventure.id && !repairedAdventureIds.has(adventure.id)) repairedAdventureIds.set(adventure.id, normalizedAdventureIds[index]);
  });
  return {
    ...exchange,
    format: "arkenfall-adventures",
    version: 1,
    adventures: adventures.map((adventure, adventureIndex) => {
      const usedStageIds = new Set<string>();
      return {
        ...adventure,
        id: normalizedAdventureIds[adventureIndex],
        travelText: getAdventureTravelText(adventure),
        ...(adventure.prerequisiteAdventureId
          ? { prerequisiteAdventureId: repairedAdventureIds.get(adventure.prerequisiteAdventureId) ?? adventure.prerequisiteAdventureId }
          : { prerequisiteAdventureId: undefined }),
        stages: (adventure.stages ?? []).map((stage) => {
          const usedEntryIds = new Set<string>();
          return {
            ...stage,
            id: ensureInternalId(stage.id, "stage", usedStageIds, stage.name),
            dropTable: Array.isArray(stage.dropTable)
              ? stage.dropTable.flatMap((drop) => typeof drop?.itemId === "string" ? [{ itemId: drop.itemId, chance: Math.min(100, Math.max(0, Number.isFinite(drop.chance) ? drop.chance : 0)) }] : [])
              : [],
            entries: (stage.entries ?? []).map((entry) => ({
              ...entry,
              id: ensureInternalId(entry.id, "entry", usedEntryIds, entry.title),
              ...(entry.reward ? { reward: { experience: entry.reward.experience, gold: entry.reward.gold } } : {}),
            })),
          };
        }),
      };
    }),
  };
}
export function localEvents() { const stored = readExchange<EventExchange | null>(EVENT_DRAFT_STORAGE_KEY, null); const normalized = stored ? normalizeStoredEvents(stored) : null; return [...new Map([...(normalized?.events ?? []), ...Object.values(ADVENTURE_EVENTS)].map((event) => [event.id, event])).values()]; }
function normalizeStoredEvents(exchange: EventExchange): EventExchange {
  const usedEventIds = new Set<string>();
  return {
    ...exchange,
    events: (exchange.events ?? []).map((event) => ({
      ...event,
      id: ensureInternalId(event.id, "event", usedEventIds, event.name),
    })),
  };
}

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
      <header className="xp-guide-header"><div><p className="eyebrow">Adventure Rewards</p><h2 id="xp-guide-title">XP Guide</h2><p>Level 70 is the maximum level. Total XP is counted from the start of level 1.</p></div><button type="button" className="xp-guide-close" onClick={onClose} aria-label="Close XP guide"><X size={17} /></button></header>
      <div className="xp-guide-table-wrap"><table className="xp-guide-table"><thead><tr><th>Level</th><th>XP from previous level</th><th>Total XP</th></tr></thead><tbody>{XP_GUIDE_ROWS.map((row) => <tr key={row.level} className={row.level === MAX_LEVEL ? "max-level" : ""}><th scope="row">{row.level}</th><td>{row.level === 1 ? "Starting level" : row.xpFromPreviousLevel.toLocaleString("en-US")}</td><td>{row.totalXp.toLocaleString("en-US")}{row.level === MAX_LEVEL ? " · Max Level" : ""}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}

export function AdventureDevtool({ onExit }: { onExit: () => void }) {
  const canonical = canonicalAdventureExchange();
  const canonicalSignature = getAdventureCatalogSignature(canonical);
  const store = useLocalDraft<AdventureExchange>(ADVENTURE_DRAFT_STORAGE_KEY, canonical, normalizeAdventureExchange);
  const [xpGuideOpen, setXpGuideOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(store.draft.adventures[0]?.id ?? "");
  const [selectedStageId, setSelectedStageId] = useState(store.draft.adventures[0]?.stages[0]?.id ?? "");
  useEffect(() => {
    if (window.localStorage.getItem(ADVENTURE_DRAFT_CATALOG_SIGNATURE_KEY) === canonicalSignature) return;
    store.setDraft((draft) => normalizeAdventureExchange(mergeAdventureDraftWithCanonical(draft, canonical)));
    window.localStorage.setItem(ADVENTURE_DRAFT_CATALOG_SIGNATURE_KEY, canonicalSignature);
    store.setMessage("New live adventures were synced to this browser draft");
  }, [canonicalSignature]);
  const stageRefs = useRef(new Map<string, HTMLElement>());
  const selected = store.draft.adventures.find((adventure) => adventure.id === selectedId) ?? store.draft.adventures[0];
  const activeStageId = selected?.stages.some((stage) => stage.id === selectedStageId) ? selectedStageId : selected?.stages[0]?.id ?? "";
  const enemies = useMemo(localEnemies, []); const events = useMemo(localEvents, []); const items = useMemo(localItems, []);
  const update = (change: Partial<AdventureDefinition>) => store.setDraft((draft) => ({ ...draft, adventures: draft.adventures.map((adventure) => adventure.id === selected?.id ? { ...adventure, ...change } : adventure) }));
  const updateStage = (stageId: string, change: Partial<AdventureDefinition["stages"][number]>) => update({ stages: selected.stages.map((stage) => stage.id === stageId ? { ...stage, ...change } : stage) });
  const updateEntry = (stageId: string, entryId: string, change: Partial<AdventureStageEntry>) => updateStage(stageId, { entries: selected.stages.find((stage) => stage.id === stageId)!.entries.map((entry) => entry.id === entryId ? { ...entry, ...change } : entry) });
  const selectAdventure = (adventure: AdventureDefinition) => { setSelectedId(adventure.id); setSelectedStageId(adventure.stages[0]?.id ?? ""); };
  const selectStage = (stageId: string) => {
    setSelectedStageId(stageId);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => stageRefs.current.get(stageId)?.scrollIntoView({ behavior: "smooth", block: "start" })));
  };
  const reorderStage = (stageId: string, direction: -1 | 1) => {
    update({ stages: moveAdventureStage(selected.stages, stageId, direction) });
    setSelectedStageId(stageId);
  };
  const removeStage = (stageId: string) => {
    const currentIndex = selected.stages.findIndex((stage) => stage.id === stageId);
    const stages = selected.stages.filter((stage) => stage.id !== stageId);
    update({ stages });
    if (activeStageId === stageId) setSelectedStageId(stages[Math.min(currentIndex, stages.length - 1)]?.id ?? "");
  };
  const add = () => { const id = makeId("adventure"); const stageId = makeId("stage"); const adventure: AdventureDefinition = { id, name: "New Adventure", description: "", recommendedLevel: 1, theme: "windsong_forest", travelText: "Traveling through Arkenfall", stages: [{ id: stageId, name: "Stage 1", dropTable: [], entries: [] }], completionTitle: "Adventure Complete", completionDescription: "" }; store.setDraft((draft) => ({ ...draft, adventures: [...draft.adventures, adventure] })); setSelectedId(id); setSelectedStageId(stageId); };
  const addStage = () => {
    const stage: AdventureStageDefinition = { id: makeId("stage"), name: `Stage ${selected.stages.length + 1}`, dropTable: [], entries: [] };
    update({ stages: [...selected.stages, stage] });
    selectStage(stage.id);
  };
  const addEntry = (stageId: string) => { const entry: AdventureStageEntry = { id: makeId("entry"), type: "combat", chance: 100, eyebrow: "Encounter", title: "New Encounter", description: "", enemyIds: [], reward: { experience: 50, gold: 8 } }; const stage = selected.stages.find((item) => item.id === stageId)!; updateStage(stageId, { entries: [...stage.entries, entry] }); };
  const updateTheme = (theme: AdventureTheme) => {
    const currentDefault = getAdventureDefaultTravelText(selected.theme);
    const travelText = !selected.travelText?.trim() || selected.travelText === currentDefault
      ? getAdventureDefaultTravelText(theme)
      : selected.travelText;
    update({ theme, travelText });
  };
  const prepareDraft = () => { const prepared = normalizeAdventureExchange(store.draft); store.setDraft(prepared); window.localStorage.setItem(ADVENTURE_DRAFT_STORAGE_KEY, JSON.stringify(prepared)); return prepared; };
  const copy = async () => { try { await copyJson(prepareDraft()); store.setMessage("JSON copied — paste it into Codex"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const save = async () => { try { const prepared = prepareDraft(); store.setMessage("Writing adventures to live source…"); await saveLiveCatalog("adventures", prepared); store.setMessage("Adventures saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Adventures could not be saved to the live game"); } };
  return <EditorShell title="Adventure Editor" description="Build adventures from stages with unlimited weighted combat and event possibilities. Internal IDs are handled automatically." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-adventures.json", prepareDraft()); store.setMessage("JSON exported"); }} onExit={onExit}>
    <div className="content-devtool-layout"><aside className="content-devtool-list adventure-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New adventure</button>{store.draft.adventures.map((adventure) => { const isSelected = adventure.id === selected?.id; return <div className={`adventure-nav-group${isSelected ? " selected" : ""}`} key={adventure.id}><button type="button" className={`adventure-nav-button${isSelected ? " selected" : ""}`} onClick={() => selectAdventure(adventure)} aria-expanded={isSelected}><strong>{adventure.name}</strong><small>{adventure.stages.length} stages</small></button>{isSelected && <div className="adventure-stage-tabs" aria-label={`${adventure.name} stages`}>{adventure.stages.map((stage, stageIndex) => <div className={`adventure-stage-tab${stage.id === activeStageId ? " selected" : ""}`} key={stage.id}><button type="button" className="adventure-stage-link" onClick={() => selectStage(stage.id)}><small>Stage {stageIndex + 1}</small><strong>{stage.name}</strong></button><div className="adventure-stage-order"><button type="button" onClick={() => reorderStage(stage.id, -1)} disabled={stageIndex === 0} aria-label={`Move ${stage.name} up`}><ChevronUp size={13} /></button><button type="button" onClick={() => reorderStage(stage.id, 1)} disabled={stageIndex === adventure.stages.length - 1} aria-label={`Move ${stage.name} down`}><ChevronDown size={13} /></button></div></div>)}</div>}</div>; })}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">Adventure Definition</p><h2>{selected.name}</h2></div><button type="button" className="secondary-editor-button xp-guide-button" onClick={() => setXpGuideOpen(true)}><BookOpen size={15} /> XP Guide</button></div><div className="content-form-grid"><TextField label="Name" value={selected.name} onChange={(name) => update({ name })} /><NumberField label="Recommended level" value={selected.recommendedLevel} min={1} onChange={(recommendedLevel) => update({ recommendedLevel })} /><label><span>Theme</span><select value={selected.theme} onChange={(event) => updateTheme(event.target.value as AdventureTheme)}><option value="windsong_forest">Windsong Forest</option><option value="arkenfall_highlands">Arkenfall Highlands</option><option value="highfall_mountains">Highfall Mountains</option><option value="custom">Custom artwork</option></select></label><label><span>Required completed adventure</span><select value={selected.prerequisiteAdventureId ?? ""} onChange={(event) => update({ prerequisiteAdventureId: event.target.value || undefined })}><option value="">None</option>{store.draft.adventures.filter((adventure) => adventure.id !== selected.id).map((adventure) => <option value={adventure.id} key={adventure.id}>{adventure.name}</option>)}</select></label><TextField label="Adventure card image URL" value={selected.cardImageUrl ?? ""} onChange={(cardImageUrl) => update({ cardImageUrl: cardImageUrl || undefined })} /><TextField label="Combat background image URL" value={selected.combatBackgroundUrl ?? ""} onChange={(combatBackgroundUrl) => update({ combatBackgroundUrl: combatBackgroundUrl || undefined })} /><TextField label="Description" value={selected.description} onChange={(description) => update({ description })} textarea /><TextField label="Travel loading text" value={selected.travelText ?? getAdventureTravelText(selected)} onChange={(travelText) => update({ travelText })} /><TextField label="Completion title" value={selected.completionTitle} onChange={(completionTitle) => update({ completionTitle })} /><TextField label="Completion description" value={selected.completionDescription} onChange={(completionDescription) => update({ completionDescription })} textarea /></div>
        <div className="stage-editor-list">{selected.stages.map((stage, stageIndex) => { const chanceTotal = stage.entries.reduce((sum, entry) => sum + entry.chance, 0); return <article className={`stage-editor${stage.id === activeStageId ? " selected" : ""}`} key={stage.id} ref={(element) => { if (element) stageRefs.current.set(stage.id, element); else stageRefs.current.delete(stage.id); }}><header><div><small>Stage {stageIndex + 1}</small><input value={stage.name} onChange={(event) => updateStage(stage.id, { name: event.target.value })} /></div><span className={chanceTotal === 100 ? "valid" : "warning"}>{chanceTotal}% total</span><button onClick={() => removeStage(stage.id)} disabled={selected.stages.length === 1}><Trash2 size={14} /> Remove stage</button></header>
          <div className="content-form-grid stage-drop-table"><DropTableEditor entries={stage.dropTable ?? []} items={items} onChange={(dropTable) => updateStage(stage.id, { dropTable })} title="Stage drop table" /></div>
          <div className="stage-entry-list">{stage.entries.map((entry) => <section className="stage-entry" key={entry.id}><div className="stage-entry-heading"><strong>{entry.title}</strong><button onClick={() => updateStage(stage.id, { entries: stage.entries.filter((item) => item.id !== entry.id) })}><Trash2 size={13} /></button></div><div className="content-form-grid"><label><span>Type</span><select value={entry.type} onChange={(event) => updateEntry(stage.id, entry.id, { type: event.target.value as AdventureStageEntry["type"], eventId: event.target.value === "event" ? events[0]?.id : undefined, enemyIds: event.target.value === "event" ? undefined : [] })}><option value="combat">Combat</option><option value="event">Event</option><option value="boss">Boss</option></select></label><NumberField label="Chance %" value={entry.chance} min={0} onChange={(chance) => updateEntry(stage.id, entry.id, { chance })} /><TextField label="Title" value={entry.title} onChange={(title) => updateEntry(stage.id, entry.id, { title })} /><TextField label="Eyebrow" value={entry.eyebrow} onChange={(eyebrow) => updateEntry(stage.id, entry.id, { eyebrow })} /><TextField label="Description" value={entry.description} onChange={(description) => updateEntry(stage.id, entry.id, { description })} textarea />
            {entry.type === "event" ? <label className="wide-field"><span>Event</span><select value={entry.eventId ?? ""} onChange={(event) => updateEntry(stage.id, entry.id, { eventId: event.target.value })}>{events.map((event) => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label> : <>
              <fieldset className="enemy-picker wide-field"><legend>Enemies</legend>{enemies.map((enemy) => { const count = entry.enemyIds?.filter((id) => id === enemy.id).length ?? 0; return <label key={enemy.id}><span>{enemy.name}</span><input type="number" min={0} value={count} aria-label={`${enemy.name} count`} onChange={(event) => { const nextCount = Math.max(0, Math.floor(Number(event.target.value))); const withoutEnemy = (entry.enemyIds ?? []).filter((id) => id !== enemy.id); updateEntry(stage.id, entry.id, { enemyIds: [...withoutEnemy, ...Array.from({ length: nextCount }, () => enemy.id)] }); }} /></label>; })}</fieldset>
              <fieldset className="encounter-reward-fields wide-field"><legend>Victory reward</legend><NumberField label="Experience" value={entry.reward?.experience ?? 0} min={0} onChange={(experience) => updateEntry(stage.id, entry.id, { reward: { experience, gold: entry.reward?.gold ?? 0 } })} /><NumberField label="Gold" value={entry.reward?.gold ?? 0} min={0} onChange={(gold) => updateEntry(stage.id, entry.id, { reward: { experience: entry.reward?.experience ?? 0, gold } })} /></fieldset>
            </>}
          </div></section>)}</div><button className="secondary-editor-button" onClick={() => addEntry(stage.id)}><Plus size={14} /> Add stage possibility</button>
        </article>; })}</div><button className="secondary-editor-button add-stage-button" onClick={addStage}><Plus size={14} /> Add stage</button>
      </section>}
    </div>
    {xpGuideOpen && <XpGuideDialog onClose={() => setXpGuideOpen(false)} />}
  </EditorShell>;
}
