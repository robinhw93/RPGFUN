import { ArrowDown, ArrowUp, BookOpen, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ADVENTURES, ENEMIES, ITEMS, QUESTLINES, QUESTS } from "../../game/data";
import type { QuestDefinition, QuestObjective, QuestRewardItem, QuestlineDefinition } from "../../game/types";
import { copyJson, downloadJson, EditorShell, ensureInternalId, finiteNumber, makeId, NumberField, QUEST_DRAFT_STORAGE_KEY, saveLiveCatalog, TextField, useLocalDraft, type QuestExchange } from "./shared";

type QuestEditorTab = "quests" | "questlines";

const enemyOptions = Object.values(ENEMIES).sort((left, right) => left.name.localeCompare(right.name));
const itemOptions = [...ITEMS].sort((left, right) => left.name.localeCompare(right.name));
const adventureOptions = [...ADVENTURES].sort((left, right) => left.name.localeCompare(right.name));

export function canonicalQuestExchange(): QuestExchange {
  return {
    format: "arkenfall-quests",
    version: 1,
    quests: QUESTS.map((quest) => structuredClone(quest)),
    questlines: QUESTLINES.map((questline) => structuredClone(questline)),
  };
}

export function normalizeQuestExchange(exchange: QuestExchange): QuestExchange {
  const usedIds = new Set<string>();
  const remappedQuestIds = new Map<string, string>();
  const quests = (exchange.quests ?? []).map((quest) => {
    const id = ensureInternalId(quest.id, "quest", usedIds, quest.title);
    if (typeof quest.id === "string") remappedQuestIds.set(quest.id, id);
    let objective: QuestObjective;
    const quantity = Math.max(1, Math.round(finiteNumber(quest.objective?.quantity, 1)));
    if (quest.objective?.type === "collect_item") {
      const itemId = quest.objective.itemId;
      objective = { type: "collect_item", itemId: ITEMS.some((item) => item.id === itemId) ? itemId : itemOptions[0]?.id ?? "", quantity };
    } else if (quest.objective?.type === "complete_adventure") {
      const adventureId = quest.objective.adventureId;
      objective = { type: "complete_adventure", adventureId: ADVENTURES.some((adventure) => adventure.id === adventureId) ? adventureId : adventureOptions[0]?.id ?? "", quantity };
    } else {
      const enemyId = quest.objective?.type === "kill_enemy" ? quest.objective.enemyId : enemyOptions[0]?.id ?? "";
      objective = { type: "kill_enemy", enemyId: ENEMIES[enemyId] ? enemyId : enemyOptions[0]?.id ?? "", quantity };
    }
    const rewardIds = new Set<string>();
    const rewardItems = (quest.reward?.items ?? []).flatMap((reward): QuestRewardItem[] => {
      if (!ITEMS.some((item) => item.id === reward.itemId) || rewardIds.has(reward.itemId)) return [];
      rewardIds.add(reward.itemId);
      return [{ itemId: reward.itemId, quantity: Math.max(1, Math.round(finiteNumber(reward.quantity, 1))) }];
    });
    return {
      id,
      title: typeof quest.title === "string" ? quest.title : "New Quest",
      description: typeof quest.description === "string" ? quest.description : "Describe this quest.",
      objective,
      reward: { experience: Math.max(0, Math.round(finiteNumber(quest.reward?.experience, 0))), items: rewardItems },
    };
  });
  const questIds = new Set(quests.map((quest) => quest.id));
  const assignedQuestIds = new Set<string>();
  const questlines = (exchange.questlines ?? []).map((questline) => {
    const seen = new Set<string>();
    const orderedQuestIds = (questline.questIds ?? []).flatMap((rawId) => {
      const id = remappedQuestIds.get(rawId) ?? rawId;
      if (!questIds.has(id) || seen.has(id) || assignedQuestIds.has(id)) return [];
      seen.add(id);
      assignedQuestIds.add(id);
      return [id];
    });
    return {
      id: ensureInternalId(questline.id, "questline", usedIds, questline.title),
      title: typeof questline.title === "string" ? questline.title : "New Questline",
      description: typeof questline.description === "string" ? questline.description : "Describe this questline.",
      questIds: orderedQuestIds,
    };
  });
  return { format: "arkenfall-quests", version: 1, quests, questlines };
}

function blankQuest(): QuestDefinition {
  return {
    id: makeId("quest"),
    title: "New Quest",
    description: "Describe what the adventurer is being asked to do.",
    objective: { type: "kill_enemy", enemyId: enemyOptions[0]?.id ?? "", quantity: 1 },
    reward: { experience: 25, items: [] },
  };
}

function blankQuestline(): QuestlineDefinition {
  return { id: makeId("questline"), title: "New Questline", description: "Describe the story that connects these quests.", questIds: [] };
}

function objectiveForType(type: QuestObjective["type"]): QuestObjective {
  if (type === "collect_item") return { type, itemId: itemOptions[0]?.id ?? "", quantity: 1 };
  if (type === "complete_adventure") return { type, adventureId: adventureOptions[0]?.id ?? "", quantity: 1 };
  return { type, enemyId: enemyOptions[0]?.id ?? "", quantity: 1 };
}

function QuestFields({ quest, questlines, onChange, onAssign }: {
  quest: QuestDefinition;
  questlines: QuestlineDefinition[];
  onChange: (change: Partial<QuestDefinition>) => void;
  onAssign: (questlineId: string) => void;
}) {
  const assignedQuestline = questlines.find((questline) => questline.questIds.includes(quest.id));
  const requiredQuantity = quest.objective.quantity;
  const availableRewardItem = itemOptions.find((item) => !quest.reward.items.some((reward) => reward.itemId === item.id));
  const updateRewardItem = (index: number, change: Partial<QuestRewardItem>) => onChange({ reward: { ...quest.reward, items: quest.reward.items.map((reward, rewardIndex) => rewardIndex === index ? { ...reward, ...change } : reward) } });
  return <>
    <div className="content-form-grid">
      <TextField label="Title" value={quest.title} onChange={(title) => onChange({ title })} />
      <label><span>Questline</span><select value={assignedQuestline?.id ?? ""} onChange={(event) => onAssign(event.target.value)}><option value="">Standalone quest</option>{questlines.map((questline) => <option key={questline.id} value={questline.id}>{questline.title}</option>)}</select></label>
      <TextField label="Description" value={quest.description} onChange={(description) => onChange({ description })} textarea />
    </div>
    <fieldset className="item-editor-section"><legend>Quest goal</legend><div className="content-form-grid">
      <label><span>Goal type</span><select value={quest.objective.type} onChange={(event) => onChange({ objective: objectiveForType(event.target.value as QuestObjective["type"]) })}><option value="kill_enemy">Defeat enemies</option><option value="collect_item">Find items</option><option value="complete_adventure">Complete adventures</option></select></label>
      {quest.objective.type === "kill_enemy" && <label><span>Enemy</span><select value={quest.objective.enemyId} onChange={(event) => onChange({ objective: { type: "kill_enemy", enemyId: event.target.value, quantity: requiredQuantity } })}>{enemyOptions.map((enemy) => <option key={enemy.id} value={enemy.id}>{enemy.name}</option>)}</select></label>}
      {quest.objective.type === "collect_item" && <label><span>Item</span><select value={quest.objective.itemId} onChange={(event) => onChange({ objective: { type: "collect_item", itemId: event.target.value, quantity: requiredQuantity } })}>{itemOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      {quest.objective.type === "complete_adventure" && <label><span>Adventure</span><select value={quest.objective.adventureId} onChange={(event) => onChange({ objective: { type: "complete_adventure", adventureId: event.target.value, quantity: requiredQuantity } })}>{adventureOptions.map((adventure) => <option key={adventure.id} value={adventure.id}>{adventure.name}</option>)}</select></label>}
      <NumberField label="Required amount" value={quest.objective.quantity} min={1} onChange={(quantity) => onChange({ objective: { ...quest.objective, quantity: Math.max(1, Math.round(quantity)) } })} />
    </div></fieldset>
    <fieldset className="item-editor-section"><legend>Rewards</legend><div className="content-form-grid"><NumberField label="Experience" value={quest.reward.experience} min={0} onChange={(experience) => onChange({ reward: { ...quest.reward, experience: Math.max(0, Math.round(experience)) } })} /></div>
      <div className="quest-reward-editor">{quest.reward.items.map((reward, index) => <article key={`${reward.itemId}-${index}`}><label><span>Reward item</span><select value={reward.itemId} onChange={(event) => updateRewardItem(index, { itemId: event.target.value })}>{itemOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><NumberField label="Quantity" value={reward.quantity} min={1} onChange={(quantity) => updateRewardItem(index, { quantity: Math.max(1, Math.round(quantity)) })} /><button type="button" className="danger-icon-button" aria-label="Remove reward item" onClick={() => onChange({ reward: { ...quest.reward, items: quest.reward.items.filter((_, rewardIndex) => rewardIndex !== index) } })}><Trash2 size={14} /></button></article>)}</div>
      <button type="button" className="secondary-editor-button" disabled={!availableRewardItem} onClick={() => availableRewardItem && onChange({ reward: { ...quest.reward, items: [...quest.reward.items, { itemId: availableRewardItem.id, quantity: 1 }] } })}><Plus size={14} /> Add reward item</button>
    </fieldset>
  </>;
}

function QuestlineFields({ questline, questlines, quests, onChange }: { questline: QuestlineDefinition; questlines: QuestlineDefinition[]; quests: QuestDefinition[]; onChange: (change: Partial<QuestlineDefinition>) => void }) {
  const questById = new Map(quests.map((quest) => [quest.id, quest]));
  const assignedElsewhere = new Set(questlines.filter((candidate) => candidate.id !== questline.id).flatMap((candidate) => candidate.questIds));
  const available = quests.filter((quest) => !questline.questIds.includes(quest.id) && !assignedElsewhere.has(quest.id));
  const move = (index: number, offset: number) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= questline.questIds.length) return;
    const questIds = [...questline.questIds];
    [questIds[index], questIds[nextIndex]] = [questIds[nextIndex], questIds[index]];
    onChange({ questIds });
  };
  return <>
    <div className="content-form-grid"><TextField label="Title" value={questline.title} onChange={(title) => onChange({ title })} /><TextField label="Description" value={questline.description} onChange={(description) => onChange({ description })} textarea /></div>
    <fieldset className="item-editor-section"><legend>Quest order</legend><div className="questline-order-list">{questline.questIds.map((questId, index) => <article key={questId}><span><strong>{index + 1}. {questById.get(questId)?.title ?? "Missing quest"}</strong><small>Each quest unlocks after the previous one is turned in.</small></span><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move quest up"><ArrowUp size={14} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === questline.questIds.length - 1} aria-label="Move quest down"><ArrowDown size={14} /></button><button type="button" className="danger-icon-button" onClick={() => onChange({ questIds: questline.questIds.filter((id) => id !== questId) })} aria-label="Remove quest from questline"><Trash2 size={14} /></button></article>)}</div>
      {available.length > 0 && <label className="questline-add-select"><span>Add quest</span><select value="" onChange={(event) => { if (event.target.value) onChange({ questIds: [...questline.questIds, event.target.value] }); }}><option value="">Choose a quest…</option>{available.map((quest) => <option key={quest.id} value={quest.id}>{quest.title}</option>)}</select></label>}
    </fieldset>
  </>;
}

export function QuestDevtool({ onExit }: { onExit: () => void }) {
  const store = useLocalDraft<QuestExchange>(QUEST_DRAFT_STORAGE_KEY, canonicalQuestExchange(), normalizeQuestExchange);
  const [tab, setTab] = useState<QuestEditorTab>("quests");
  const [selectedId, setSelectedId] = useState(store.draft.quests[0]?.id ?? "");
  const entries = useMemo(() => tab === "quests" ? store.draft.quests : store.draft.questlines, [store.draft, tab]);
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const chooseTab = (next: QuestEditorTab) => { setTab(next); setSelectedId((next === "quests" ? store.draft.quests : store.draft.questlines)[0]?.id ?? ""); };
  const prepare = () => { const normalized = normalizeQuestExchange(store.draft); store.setDraft(normalized); window.localStorage.setItem(QUEST_DRAFT_STORAGE_KEY, JSON.stringify(normalized)); return normalized; };
  const save = async () => { try { const exchange = prepare(); store.setMessage("Writing quests to live source…"); await saveLiveCatalog("quests", exchange); store.setMessage("Quests and questlines saved permanently to the live game"); } catch (error) { store.setMessage(error instanceof Error ? error.message : "Quests could not be saved to the live game"); } };
  const copy = async () => { try { await copyJson(prepare()); store.setMessage("Quest JSON copied"); } catch { store.setMessage("Clipboard blocked. Use Export JSON instead."); } };
  const add = () => { const entry = tab === "quests" ? blankQuest() : blankQuestline(); store.setDraft((draft) => tab === "quests" ? { ...draft, quests: [...draft.quests, entry as QuestDefinition] } : { ...draft, questlines: [...draft.questlines, entry as QuestlineDefinition] }); setSelectedId(entry.id); };
  const remove = () => { if (!selected) return; if (tab === "quests") store.setDraft((draft) => ({ ...draft, quests: draft.quests.filter((quest) => quest.id !== selected.id), questlines: draft.questlines.map((questline) => ({ ...questline, questIds: questline.questIds.filter((id) => id !== selected.id) })) })); else store.setDraft((draft) => ({ ...draft, questlines: draft.questlines.filter((questline) => questline.id !== selected.id) })); setSelectedId(entries.find((entry) => entry.id !== selected.id)?.id ?? ""); };
  const updateSelected = (change: object) => { if (!selected) return; if (tab === "quests") store.setDraft((draft) => ({ ...draft, quests: draft.quests.map((quest) => quest.id === selected.id ? { ...quest, ...change } : quest) })); else store.setDraft((draft) => ({ ...draft, questlines: draft.questlines.map((questline) => questline.id === selected.id ? { ...questline, ...change } : questline) })); };
  const assignQuest = (questId: string, questlineId: string) => store.setDraft((draft) => ({ ...draft, questlines: draft.questlines.map((questline) => ({ ...questline, questIds: questline.id === questlineId ? [...questline.questIds.filter((id) => id !== questId), questId] : questline.questIds.filter((id) => id !== questId) })) }));
  return <EditorShell title="Quest Editor" description="Create quests, choose goals and rewards, then arrange quests into ordered questlines. Save writes the complete catalog directly to the live game." message={store.message} onSave={save} onCopy={copy} onExport={() => { downloadJson("arkenfall-quests.json", prepare()); store.setMessage("Quest JSON exported"); }} onExit={onExit}>
    <div className="item-editor-tabs"><button className={tab === "quests" ? "active" : ""} onClick={() => chooseTab("quests")}><ClipboardList size={14} /> Quests</button><button className={tab === "questlines" ? "active" : ""} onClick={() => chooseTab("questlines")}><BookOpen size={14} /> Questlines</button></div>
    <div className="content-devtool-layout"><aside className="content-devtool-list"><button className="add-content-button" onClick={add}><Plus size={14} /> New {tab === "quests" ? "quest" : "questline"}</button>{entries.map((entry) => <button className={entry.id === selected?.id ? "selected" : ""} key={entry.id} onClick={() => setSelectedId(entry.id)}><strong>{entry.title}</strong><small>{entry.id}</small></button>)}</aside>
      {selected && <section className="content-devtool-inspector"><div className="content-editor-heading"><div><p className="eyebrow">{tab === "quests" ? "Quest" : "Questline"}</p><h2>{selected.title}</h2></div><button type="button" className="danger-icon-button" onClick={remove}><Trash2 size={14} /> Delete</button></div>{tab === "quests" ? <QuestFields quest={selected as QuestDefinition} questlines={store.draft.questlines} onChange={updateSelected} onAssign={(questlineId) => assignQuest(selected.id, questlineId)} /> : <QuestlineFields questline={selected as QuestlineDefinition} questlines={store.draft.questlines} quests={store.draft.quests} onChange={updateSelected} />}</section>}
    </div>
  </EditorShell>;
}
