import {
  BookOpen,
  ChevronRight, CircleDot,
  Droplets,
  Flame, FlaskConical, Footprints, Gem,
  Heart, HeartPulse,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FloatingCombatText } from "../../components/FloatingCombatText";
import { GearSlotIcon } from "../../components/GearSlotIcon";
import { getAdventureDefinition, getAdventureNode } from "../../game/adventures";
import { getCharacterAvatar } from "../../game/avatars";
import { getDerivedStats } from "../../game/character";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers } from "../../game/combatFeatures";
import { eventRevealsPlayerTurn, getCombatEventDurationMs, isCombatSequencePending, isHiddenDamageEvent, isHiddenPlayerAbilityEvent } from "../../game/combatSequence";
import { ABILITIES, ADVENTURE_EVENTS, ADVENTURES, ENEMIES } from "../../game/data";
import { getGearCategoryLabel } from "../../game/gear";
import { experienceProgressAfterGain, MAX_LEVEL } from "../../game/progression";
import { COMBAT_TIMING } from "../../game/timing";
import type { AdventureMode, AdventureStageDefinition, CombatLogEntry, CombatReward, GameState, InspectableInfo, StatusEffectId } from "../../game/types";
import { projectCombatActionQueue, type QueuedCombatAction } from "../../hooks/useCombatActionQueue";

import { AbilityImpactEffect, AbilityProjectileEffect, BarrierShimmer, BleedApplicationEffect, BlizzardFieldEffect, CombatantBeamEffect, CombatantPathEffect, ConductorFieldEffect, DiminishingReturnsApplicationEffect, EpidemicEffect, FocusCastEffect, FrozenApplicationEffect, LingeringChargeSiphonEffects, LingeringThunderstormEffects, NeurotoxinEffect, PandemicSpreadEffect, PoisonApplicationEffect, PoisonCloudEffect, PoisonTransferAnimation, RecuperateCastEffect, SmiteApplicationEffect, ToxicExplosionEffect, VenombornHealingEffect, VenombornTransferAnimation } from "../combat/CombatEffects";

import { ElectrifiedApplicationEffect, EnemyStatsModal, EnergySegments, HealthBar, HoldAbilityButton, InspectInfoModal, PassiveProcFloats, PlayerAttributesModal, StatusBadge } from "../combat/CombatHud";

import { InitiativeRoll, TurnOrderBar } from "../combat/InitiativePresentation";

import { GoldIcon, preloadImage } from "../../ui/gameUi";

export function AdventureView({ game, derived, queuedActions, onBegin, onSelectEnemy, onAbility, onEndTurn, onEnemyTurn, onCombatEvent, onCombatSequenceComplete, onPlayerTurnReady, onInitiativeComplete, onContinue, onLeaveTraining, onEvent, onPermadeath, onTalents, onCharacter, rewardPresentationPlayed, onRewardPresentationStart }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  queuedActions: QueuedCombatAction[];
  onBegin: (mode: AdventureMode, adventureId?: string) => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onEndTurn: () => void;
  onEnemyTurn: (actorId: string) => void;
  onCombatEvent: (eventId: number, eventIndex: number) => void;
  onCombatSequenceComplete: (eventId: number) => void;
  onPlayerTurnReady: (eventId: number) => void;
  onInitiativeComplete: () => void;
  onContinue: () => void;
  onLeaveTraining: () => void;
  onEvent: (choiceId: string) => void;
  onPermadeath: () => void;
  onTalents: () => void;
  onCharacter: () => void;
  rewardPresentationPlayed: boolean;
  onRewardPresentationStart: (rewardId: string) => void;
}) {
  const adventure = game.adventure;
  const [logOpen, setLogOpen] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState<InspectableInfo | null>(null);
  const [inspectedEnemyId, setInspectedEnemyId] = useState<string | null>(null);
  const [playerAttributesOpen, setPlayerAttributesOpen] = useState(false);
  const [targetFeedback, setTargetFeedback] = useState<{ id: number; text: string } | null>(null);
  const nextTargetFeedbackId = useRef(0);
  const inspectedEnemy = adventure.combat?.enemies.find((enemy) => enemy.instanceId === inspectedEnemyId) ?? null;
  const enemyVisualKey = adventure.combat?.enemies.map((enemy) => enemy.id).join("|") ?? "";
  const combatEventId = adventure.combat?.eventId ?? 0;
  const initiativePlaying = Boolean(adventure.combat && adventure.combat.outcome === "active" && !adventure.combat.initiativeRevealed);
  const sequencePending = Boolean(adventure.combat && isCombatSequencePending(adventure.combat));
  const activeActor = adventure.combat?.turnOrder?.[adventure.combat.activeTurnIndex];

  useEffect(() => {
    setLogOpen(false);
    setInspectedInfo(null);
    setInspectedEnemyId(null);
    setPlayerAttributesOpen(false);
    setTargetFeedback(null);
  }, [adventure.nodeIndex]);
  useEffect(() => {
    if (!enemyVisualKey) return;
    [...new Set(enemyVisualKey.split("|"))].forEach((enemyId) => {
      const enemy = ENEMIES[enemyId];
      if (!enemy) return;
      void preloadImage(enemy.portraitUrl);
      void preloadImage(enemy.imageUrl);
    });
  }, [enemyVisualKey]);
  useEffect(() => {
    if (!adventure.combat || adventure.combat.outcome !== "active" || initiativePlaying || sequencePending || logOpen || inspectedInfo || inspectedEnemy || playerAttributesOpen || activeActor?.kind !== "enemy") return;
    const timer = window.setTimeout(() => onEnemyTurn(activeActor.actorId), 250);
    return () => window.clearTimeout(timer);
  }, [activeActor?.actorId, activeActor?.kind, adventure.combat?.outcome, combatEventId, initiativePlaying, inspectedEnemy, inspectedInfo, logOpen, onEnemyTurn, playerAttributesOpen, sequencePending]);

  if (adventure.completed) {
    const completedAdventure = getAdventureDefinition(adventure.adventureId);
    return (
      <section className="page narrow-page completion-page">
        <div className="boss-emblem"><Trophy size={34} /></div>
        <p className="eyebrow">Adventure Complete</p>
        <h1>{completedAdventure.completionTitle}</h1>
        <p>{completedAdventure.completionDescription}</p>
        <div className="reward-strip">
          <span><strong>{game.character.level}</strong> Level</span><span><strong>{game.character.talentPoints}</strong> Talent Points</span><span><strong className="reward-value-with-icon"><GoldIcon />{game.character.gold}</strong> Gold</span>
        </div>
        <button className="primary-button" onClick={() => onBegin("story", completedAdventure.id)}>Venture Forth Again <ChevronRight size={17} /></button>
        <button className="text-button" onClick={() => onBegin("endless")}>Enter Shadow Proving Grounds</button>
        <button className="text-button" onClick={onTalents}>Spend talent points</button>
      </section>
    );
  }

  if (!adventure.active) {
    const featuredAdventure = ADVENTURES[0];
    const locked = Boolean(featuredAdventure.prerequisiteAdventureId && !game.character.completedAdventureIds.includes(featuredAdventure.prerequisiteAdventureId));
    return (
      <section className="page adventure-home">
        <div className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Available Adventure</p>
            <h1>{featuredAdventure.name}</h1>
            <p>{featuredAdventure.description}</p>
            <div className="adventure-tags"><span>Recommended Level {featuredAdventure.recommendedLevel}</span><span>{featuredAdventure.stages.length} Stages</span><span>Dynamic Encounters</span></div>
            <button className="primary-button" disabled={locked} onClick={() => onBegin("story", featuredAdventure.id)}>{locked ? "Locked" : "Begin Journey"} <ChevronRight size={18} /></button>
          </div>
        </div>
        {ADVENTURES.length > 1 && <div className="story-adventure-list">{ADVENTURES.slice(1).map((definition) => { const prerequisiteMet = !definition.prerequisiteAdventureId || game.character.completedAdventureIds.includes(definition.prerequisiteAdventureId); return <article key={definition.id}><div><p className="eyebrow">Story Adventure</p><h2>{definition.name}</h2><p>{definition.description}</p><div className="adventure-tags"><span>Level {definition.recommendedLevel}</span><span>{definition.stages.length} Stages</span>{definition.prerequisiteAdventureId && <span>{prerequisiteMet ? "Unlocked" : `Requires ${getAdventureDefinition(definition.prerequisiteAdventureId).name}`}</span>}</div></div><button className="secondary-button" disabled={!prerequisiteMet} onClick={() => onBegin("story", definition.id)}>{prerequisiteMet ? "Begin Journey" : "Locked"} <ChevronRight size={17} /></button></article>; })}</div>}
        <div className="training-adventure-card">
          <div>
            <p className="eyebrow">Testing Adventure</p>
            <h2>Shadow Proving Grounds</h2>
            <p>An endless training route built for testing talents, abilities, and Shadow builds.</p>
            <div className="adventure-tags"><span>2–3 DUMMIES</span><span>100 Health</span><span>+2 Levels per Victory</span></div>
          </div>
          <button className="secondary-button" onClick={() => onBegin("endless")}>Begin Testing <ChevronRight size={18} /></button>
        </div>
        <div className="section-heading"><div><p className="eyebrow">Route Preview</p><h2>What lies ahead</h2></div><span className="muted">Progress saves automatically</span></div>
        <div className="route-grid">
          {featuredAdventure.stages.map((stage, index) => <StageCard key={stage.id} stage={stage} index={index} />)}
        </div>
      </section>
    );
  }

  const node = getAdventureNode(adventure);
  if (node.type === "event") {
    const eventDefinition = node.eventId ? ADVENTURE_EVENTS[node.eventId] : undefined;
    const rollResult = adventure.eventRollResult;
    return (
      <section className="page narrow-page event-page">
        <ProgressHeader index={adventure.nodeIndex} mode={adventure.mode} adventureId={adventure.adventureId} />
        <div className="event-sigil">♢</div>
        <p className="eyebrow">{node.eyebrow}</p>
        <h1>{node.title}</h1>
        <p>{node.description}</p>
        {!adventure.eventResolved ? (
          <div className="event-choices">{eventDefinition?.choices.map((choice) => <button className="choice-card" key={choice.id} onClick={() => onEvent(choice.id)}><Sparkles /><span><strong>{choice.label}</strong><small>{choice.description}</small><em>d100 + {choice.stat} · {choice.threshold} to succeed</em></span><ChevronRight /></button>)}</div>
        ) : (
          <div className={`outcome-panel event-roll-outcome ${rollResult?.success ? "success" : "failure"}`}><strong>{rollResult?.success ? "Success" : "Failure"}</strong><div className="event-roll-math"><span>d100 <b>{rollResult?.dieRoll}</b></span><span>{rollResult?.stat} <b>+{rollResult?.statBonus}</b></span><span>Total <b>{rollResult?.total}</b> / {rollResult?.threshold}</span></div><p>{rollResult?.outcomeText}</p><button className="primary-button" onClick={onContinue}>{adventure.eventEncounter ? "Face Encounter" : "Continue Journey"} <ChevronRight size={17} /></button></div>
        )}
      </section>
    );
  }

  const combat = adventure.combat!;
  const damagedTargets = combat.damagedTargets ?? [];
  const missedTargets = combat.missedTargets ?? [];
  const passiveAnimations = combat.passiveAnimations ?? [];
  const poisonAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "poison");
  const bleedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "bleed");
  const electrifiedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "electrified");
  const frozenAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "frozen");
  const smiteAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "smite");
  const diminishingReturnsAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "diminishingReturns");
  const electrifiedPulseTargets = new Set(electrifiedAnimations.map((animation) => animation.targetId));
  const abilityAnimations = combat.abilityAnimations ?? [];
  const barrierPulseTargets = new Set(abilityAnimations.filter((animation) => animation.kind === "barrier_absorb").flatMap((animation) => animation.targetId ? [animation.targetId] : []));
  const poisonCloudAnimations = abilityAnimations.filter((animation) => animation.kind === "poison_cloud");
  const contagionAnimations = abilityAnimations.filter((animation) => animation.kind === "contagion" && animation.targetId && animation.sourceTargetId);
  const neurotoxinAnimations = abilityAnimations.filter((animation) => animation.kind === "neurotoxin");
  const toxicExplosionAnimations = abilityAnimations.filter((animation) => animation.kind === "toxic_explosion");
  const venombornAnimations = abilityAnimations.filter((animation) => animation.kind === "venomborn");
  const evasionAnimations = abilityAnimations.filter((animation) => animation.kind === "evasion" && animation.targetId === "player");
  const focusAnimations = abilityAnimations.filter((animation) => animation.kind === "focus" && animation.targetId === "player");
  const recuperateAnimations = abilityAnimations.filter((animation) => animation.kind === "recuperate" && animation.targetId === "player");
  const epidemicAnimations = abilityAnimations.filter((animation) => animation.kind === "epidemic");
  const pandemicAnimations = abilityAnimations.filter((animation) => animation.kind === "pandemic");
  const lightSpeedAnimations = abilityAnimations.filter((animation) => animation.kind === "light_speed");
  const voltageSiphonAnimations = abilityAnimations.filter((animation) => animation.kind === "voltage_siphon");
  const combustionSpreadAnimations = abilityAnimations.filter((animation) => animation.kind === "combustion_spread");
  const conductorAnimations = abilityAnimations.filter((animation) => animation.kind === "conductor" && !animation.targetId);
  const manaFractureAnimations = abilityAnimations.filter((animation) => animation.kind === "mana_fracture" && animation.targetId && animation.sourceTargetId);
  const essenceSiphonAnimations = abilityAnimations.filter((animation) => animation.kind === "essence_siphon" && animation.targetId && animation.sourceTargetId);
  const rideTheLightningAnimations = abilityAnimations.filter((animation) => animation.kind === "ride_the_lightning");
  const blizzardAnimation = abilityAnimations.find((animation) => animation.kind === "blizzard");
  const chargeReturnAnimations = abilityAnimations.filter((animation) => animation.kind === "charge" && animation.targetId && animation.sourceTargetId);
  const bloodBarrierAnimations = abilityAnimations.filter((animation) => animation.kind === "blood_barrier" && animation.targetId && animation.sourceTargetId);
  const vampirismDrainAnimations = abilityAnimations.filter((animation) => animation.kind === "vampirism_drain" && animation.targetId && animation.sourceTargetId);
  const fireEaterTransferAnimations = abilityAnimations.filter((animation) => animation.kind === "fire_eater_transfer" && animation.targetId && animation.sourceTargetId);
  const projectileAnimations = combat.projectileAnimations ?? [];
  const playerStealthed = combat.playerStatuses.some((status) => status.id === "stealth");
  const forcedTargetId = combat.enemies.find((enemy) => enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth") && enemy.statuses.some((status) => status.id === "taunt"))?.instanceId ?? null;
  const isPlayerTurn = activeActor?.kind === "player";
  const playerIncapacitated = combat.playerStatuses.some((status) => status.id === "stunned" || status.id === "sleep" || status.id === "frozen");
  const abilityInputUnavailable = initiativePlaying || playerIncapacitated;
  const combatAvatar = getCharacterAvatar(game.character.avatarId);
  const handleCombatEventShown = (eventId: number, eventIndex: number) => {
    if (eventRevealsPlayerTurn(combat, eventIndex)) onPlayerTurnReady(eventId);
    onCombatEvent(eventId, eventIndex);
  };
  const showStealthTargetFeedback = () => {
    nextTargetFeedbackId.current += 1;
    setTargetFeedback({ id: nextTargetFeedbackId.current, text: "You cannot target enemies with stealth." });
  };
  const queueProjection = projectCombatActionQueue(combat, game.character, queuedActions);
  const queuedEndTurnPosition = queuedActions.findIndex((action) => action.type === "end_turn") + 1;
  return (
    <section className={`combat-page compact-combat ${adventure.mode === "story" && getAdventureDefinition(adventure.adventureId).theme === "windsong_forest" ? "windsong-forest-combat" : ""} ${inspectedInfo || inspectedEnemy || playerAttributesOpen ? "inspect-info-open" : ""}`}>
      <button type="button" className="combat-log-button combat-log-corner" onClick={() => setLogOpen(true)} aria-label="Open Combat Log"><BookOpen size={15} /></button>
      <ProgressHeader index={adventure.nodeIndex} mode={adventure.mode} adventureId={adventure.adventureId} />
      <TurnOrderBar combat={combat} />
      {initiativePlaying && <InitiativeRoll key={`${adventure.nodeIndex}-${combat.eventId}`} combat={combat} onComplete={onInitiativeComplete} />}
      {targetFeedback && <div key={targetFeedback.id} className="combat-target-feedback" role="status" aria-live="polite">{targetFeedback.text}</div>}
      <div className="compact-arena">
        <article
          key="player"
          data-combatant-id="player"
          className={`compact-combatant player-combatant ${activeActor?.kind === "player" ? "active-turn" : ""} ${damagedTargets.includes("player") ? "damaged" : ""} ${combat.attackingActorId === "player" ? `attacking-right attack-cycle-${combat.attackAnimationId % 2}` : ""} ${playerStealthed ? "stealthed" : ""} ${combat.playerStatuses.some((status) => status.id === "frozen") ? "is-frozen" : ""} ${evasionAnimations.length > 0 ? "evasion-cast" : ""} ${focusAnimations.length > 0 ? "focus-cast" : ""} ${recuperateAnimations.length > 0 ? "recuperate-cast" : ""}`}
        >
          {(combat.playerStatuses.some((status) => status.id === "barrier") || barrierPulseTargets.has("player")) && <BarrierShimmer pulsing={barrierPulseTargets.has("player")} />}
          {poisonAnimations.filter((animation) => animation.targetId === "player").map((animation) => <PoisonApplicationEffect key={animation.id} />)}
          {bleedAnimations.filter((animation) => animation.targetId === "player").map((animation) => <BleedApplicationEffect key={animation.id} />)}
          {electrifiedPulseTargets.has("player") && <ElectrifiedApplicationEffect />}
          {frozenAnimations.some((animation) => animation.targetId === "player") && <FrozenApplicationEffect />}
          {smiteAnimations.filter((animation) => animation.targetId === "player").map((animation) => <SmiteApplicationEffect key={animation.id} />)}
          {diminishingReturnsAnimations.filter((animation) => animation.targetId === "player").map((animation) => <DiminishingReturnsApplicationEffect key={animation.id} />)}
          {venombornAnimations.filter((animation) => animation.targetId === "player").map((animation) => <VenombornHealingEffect key={animation.id} />)}
          {focusAnimations.map((animation) => <FocusCastEffect key={animation.id} />)}
          {recuperateAnimations.map((animation) => <RecuperateCastEffect key={animation.id} />)}
          {abilityAnimations.filter((animation) => animation.targetId === "player").map((animation) => <AbilityImpactEffect key={`player-${animation.id}`} kind={animation.kind} />)}
          {playerStealthed && <span className="stealth-smoke stealth-smoke-one" aria-hidden="true" />}
          {playerStealthed && <span className="stealth-smoke stealth-smoke-two" aria-hidden="true" />}
          <PassiveProcFloats animations={passiveAnimations.filter((animation) => animation.targetId === "player")} />
          <button type="button" className="combatant-portrait player-combatant-portrait" aria-label="View your character stats" onClick={() => setPlayerAttributesOpen(true)}><img src={combatAvatar.portraitUrl} alt="" draggable={false} /></button>
          <h2>{game.character.name}</h2>
          <div className="compact-resource-label"><span>Health</span><b>{combat.playerHp}/{combat.playerMaxHp}</b></div>
          <HealthBar value={combat.playerHp} max={combat.playerMaxHp} damageAmount={combat.damageAmounts?.player} damageSource={combat.damageSourceLabels?.player} missed={missedTargets.includes("player")} />
          <div className="compact-status-row">
            {combat.playerStatuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} duration={status.duration} permanent={status.permanent} kind={status.kind} owner="player" onInspect={() => setInspectedInfo({ title: status.name, description: status.description, category: "status" })} />)}
          </div>
          <div className="compact-resource-label energy-label"><span>Energy</span><b>{combat.energy}/{combat.maxEnergy}</b></div>
          <EnergySegments value={combat.energy} max={combat.maxEnergy} regen={derived.energyRegen + (combat.nextTurnEnergyRegenBonus ?? 0)} showGain />
        </article>

        <div className={`compact-enemy-stack count-${combat.enemies.length}`}>
          {poisonCloudAnimations.map((animation) => <PoisonCloudEffect key={animation.id} />)}
          {epidemicAnimations.map((animation) => <EpidemicEffect key={animation.id} />)}
          {conductorAnimations.map((animation) => <ConductorFieldEffect key={animation.id} />)}
          {rideTheLightningAnimations.map((animation) => <span key={animation.id} className="ride-lightning-field" aria-hidden="true"><Zap /><i /><i /><i /><i /><i /></span>)}
          {blizzardAnimation && <BlizzardFieldEffect key={blizzardAnimation.id} />}
          {combat.enemies.map((enemy) => {
            const stealthed = enemy.statuses.some((status) => status.id === "stealth");
            const targetable = enemy.hp > 0 && !stealthed && (!forcedTargetId || forcedTargetId === enemy.instanceId);
            const neurotoxinEffects = neurotoxinAnimations.filter((animation) => animation.targetId === enemy.instanceId);
            const toxicExplosionEffects = toxicExplosionAnimations.filter((animation) => animation.targetId === enemy.instanceId);
            const utilityCastShake = abilityAnimations.some((animation) => animation.shakeSource && animation.sourceTargetId === enemy.instanceId);
            return (
            <article
              key={enemy.instanceId}
              data-combatant-id={enemy.instanceId}
              role="button"
              tabIndex={enemy.hp > 0 ? 0 : -1}
              aria-disabled={!targetable && !stealthed}
              aria-label={stealthed ? `${enemy.name} cannot be targeted while in stealth` : `Target ${enemy.name}`}
              className={`compact-combatant enemy-combatant ${activeActor?.actorId === enemy.instanceId ? "active-turn" : ""} ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""} ${!targetable && enemy.hp > 0 ? "untargetable" : ""} ${stealthed ? "stealthed" : ""} ${enemy.statuses.some((status) => status.id === "stunned") ? "is-stunned" : ""} ${enemy.statuses.some((status) => status.id === "frozen") ? "is-frozen" : ""} ${damagedTargets.includes(enemy.instanceId) ? "damaged" : ""} ${combat.attackingActorId === enemy.instanceId ? `attacking-left attack-cycle-${combat.attackAnimationId % 2}` : ""} ${utilityCastShake ? `utility-cast-shake cast-cycle-${combat.eventId % 2}` : ""} ${neurotoxinEffects.length > 0 ? "neurotoxin-hit" : ""}`}
              style={{ "--enemy-accent": enemy.accent } as React.CSSProperties}
              onClick={() => {
                if (stealthed && enemy.hp > 0) showStealthTargetFeedback();
                else if (targetable) onSelectEnemy(enemy.instanceId);
              }}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  if (stealthed && enemy.hp > 0) showStealthTargetFeedback();
                  else if (targetable) onSelectEnemy(enemy.instanceId);
                }
              }}
            >
              {(enemy.statuses.some((status) => status.id === "barrier") || barrierPulseTargets.has(enemy.instanceId)) && <BarrierShimmer pulsing={barrierPulseTargets.has(enemy.instanceId)} />}
              {poisonAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <PoisonApplicationEffect key={animation.id} />)}
              {bleedAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <BleedApplicationEffect key={animation.id} />)}
              {electrifiedPulseTargets.has(enemy.instanceId) && <ElectrifiedApplicationEffect />}
              {frozenAnimations.some((animation) => animation.targetId === enemy.instanceId) && <FrozenApplicationEffect />}
              {smiteAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <SmiteApplicationEffect key={animation.id} />)}
              {diminishingReturnsAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <DiminishingReturnsApplicationEffect key={animation.id} />)}
              {neurotoxinEffects.map((animation) => <NeurotoxinEffect key={animation.id} />)}
              {toxicExplosionEffects.map((animation) => <ToxicExplosionEffect key={animation.id} />)}
              {abilityAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <AbilityImpactEffect key={`${enemy.instanceId}-${animation.id}`} kind={animation.kind} />)}
              {stealthed && <span className="stealth-smoke stealth-smoke-one" aria-hidden="true" />}
              {stealthed && <span className="stealth-smoke stealth-smoke-two" aria-hidden="true" />}
              <PassiveProcFloats animations={passiveAnimations.filter((animation) => animation.targetId === enemy.instanceId)} />
              <button
                type="button"
                className="combatant-portrait enemy-combatant-portrait"
                aria-label={`View ${enemy.name} stats`}
                onClick={(event) => { event.stopPropagation(); setInspectedEnemyId(enemy.instanceId); }}
                onKeyDown={(event) => event.stopPropagation()}
              ><img src={enemy.portraitUrl} alt="" draggable={false} /></button>
              <h2>{enemy.name}</h2>
              <div className="compact-resource-label">
                <span>Health</span>
                <b>{enemy.hp}/{enemy.maxHp}</b>
              </div>
              <HealthBar value={enemy.hp} max={enemy.maxHp} damageAmount={combat.damageAmounts?.[enemy.instanceId]} damageSource={combat.damageSourceLabels?.[enemy.instanceId]} missed={missedTargets.includes(enemy.instanceId)} />
              <div className="compact-status-row">
                {enemy.hp <= 0 ? <span className="no-status">Defeated</span> : enemy.statuses.length === 0 && <span className="no-status">No effects</span>}
                {enemy.statuses.map((status) => <StatusBadge key={status.id} id={status.id} name={status.name} stacks={status.stacks} duration={status.duration} permanent={status.permanent} kind={status.kind} owner="enemy" onInspect={() => setInspectedInfo({ title: status.name, description: status.id === "stealth" ? "Cannot be targeted until the end of their next turn." : status.description, category: "status" })} />)}
              </div>
              <div className="compact-resource-label energy-label"><span>Energy</span><b>{enemy.energy}/{enemy.maxEnergy}</b></div>
              <EnergySegments value={enemy.energy} max={enemy.maxEnergy} regen={enemy.energyRegen} />
            </article>
          );})}
        </div>
      </div>

      {poisonAnimations.filter((animation) => animation.sourceTargetId).map((animation) => <PoisonTransferAnimation key={animation.id} animation={animation} />)}
      {contagionAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path contagion-path"><FlaskConical /><i /><i /></CombatantPathEffect>)}
      {venombornAnimations.map((animation) => <VenombornTransferAnimation key={animation.id} animation={animation} />)}
      {pandemicAnimations.map((animation) => <PandemicSpreadEffect key={animation.id} animation={animation} statusIds={combat.enemies.find((enemy) => enemy.instanceId === animation.sourceTargetId)?.statuses.filter((status) => status.kind === "debuff").map((status) => status.id) ?? []} />)}
      {lightSpeedAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="light-speed-path"><Zap /><i /><i /></CombatantPathEffect>)}
      {voltageSiphonAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="voltage-siphon-path"><Zap /><HeartPulse /><i /></CombatantPathEffect>)}
      {combustionSpreadAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="combustion-spread-path"><Flame /><i /><i /></CombatantPathEffect>)}
      {manaFractureAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path mana-fracture-path"><CircleDot /><i /><i /></CombatantPathEffect>)}
      {essenceSiphonAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="ability-projectile-path essence-siphon-path"><CircleDot /><i /><i /><b /><b /></CombatantPathEffect>)}
      <LingeringThunderstormEffects animations={abilityAnimations} />
      <LingeringChargeSiphonEffects animations={abilityAnimations} />
      {chargeReturnAnimations.map((animation) => <CombatantBeamEffect key={animation.id} animation={animation} durationMs={COMBAT_TIMING.attackDurationMs} className="charge-lightning-path charge-return-path"><i /><i /><i /><b /></CombatantBeamEffect>)}
      {bloodBarrierAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="blood-barrier-path"><Droplets /><i /><i /><i /></CombatantPathEffect>)}
      {vampirismDrainAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="vampirism-drain-path"><Droplets /><Heart /><i /><i /><i /></CombatantPathEffect>)}
      {fireEaterTransferAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="fire-eater-transfer-path"><Flame /><i /><i /><i /><b /></CombatantPathEffect>)}
      {projectileAnimations.map((animation) => <AbilityProjectileEffect key={animation.id} animation={animation} />)}

      {sequencePending && <FloatingCombatText key={combat.eventId} eventId={combat.eventId} events={combat.floatingEvents} eventDurationsMs={combat.floatingEvents.map((_, eventIndex) => getCombatEventDurationMs(combat, eventIndex))} hiddenEventIndexes={combat.floatingEvents.flatMap((_, eventIndex) => isHiddenDamageEvent(combat, eventIndex) || isHiddenPlayerAbilityEvent(combat, eventIndex) ? [eventIndex] : [])} onEventShown={handleCombatEventShown} onSequenceComplete={onCombatSequenceComplete} />}

      <div className="compact-ability-grid">
        {game.character.equippedAbilities.map((id) => {
          const ability = ABILITIES[id];
          const cooldown = combat.abilityCooldowns?.[id] ?? 0;
          const selectedTarget = combat.enemies.find((enemy) => enemy.instanceId === combat.selectedEnemyId);
          const projectedTargetStatuses = queueProjection.targetStatusIds.get(combat.selectedEnemyId) ?? new Set<StatusEffectId>();
          const targetRequirementMet = !ability.requiredTargetStatus || projectedTargetStatuses.has(ability.requiredTargetStatus);
          const requiredStackMinimum = getCharacterAbilityModifiers(game.character, ability.id).find((modifier) => modifier.requiredTargetStatusStacksMinimum !== undefined)?.requiredTargetStatusStacksMinimum ?? ability.requiredTargetStatusStacks?.minimum;
          const targetStackRequirementMet = !ability.requiredTargetStatusStacks || (queueProjection.targetStatusStacks.get(combat.selectedEnemyId)?.get(ability.requiredTargetStatusStacks.status) ?? 0) >= (requiredStackMinimum ?? 0);
          const spreadTargetAvailable = !ability.spreadTargetStatus || combat.enemies.some((enemy) => (
            enemy.hp > 0
            && enemy.instanceId !== selectedTarget?.instanceId
            && !enemy.statuses.some((status) => status.id === "stealth")
          ));
          const selfRequirementMet = !ability.requiredSelfStatus
            || queueProjection.playerStatusIds.has(ability.requiredSelfStatus)
            || getCharacterAbilityModifiers(game.character, ability.id).some((modifier) => modifier.allowWithoutRequiredSelfStatus);
          const modifiedEnergyCost = getCharacterAbilityEnergyCostForTarget(game.character, ability, projectedTargetStatuses);
          const effectiveEnergyCost = queueProjection.nextAbilityIsFree ? 0 : modifiedEnergyCost;
          const effectiveCooldownTurns = getCharacterAbilityCooldownTurns(game.character, ability);
          const queuedCount = queuedActions.filter((action) => action.type === "ability" && action.abilityId === id).length;
          return <HoldAbilityButton key={id} ability={ability} description={getCharacterAbilityDescription(game.character, ability)} energyCost={effectiveEnergyCost} baseCooldown={effectiveCooldownTurns} cooldown={cooldown} queuedCount={queuedCount} disabled={abilityInputUnavailable || !isPlayerTurn || queueProjection.closed || cooldown > 0 || queueProjection.cooldownAbilityIds.has(id) || combat.outcome !== "active" || effectiveEnergyCost > queueProjection.energy || !targetRequirementMet || !targetStackRequirementMet || !spreadTargetAvailable || !selfRequirementMet} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <div className="combat-footer-controls">
        <button className={`end-turn-button ${queuedEndTurnPosition > 0 ? "queued" : ""}`} disabled={initiativePlaying || !isPlayerTurn || combat.outcome !== "active" || queueProjection.closed} onClick={onEndTurn}>
          {queuedEndTurnPosition > 0 ? `End Turn Queued` : isPlayerTurn ? "End Turn" : `${activeActor?.name ?? "Enemy"}'s Turn`} <ChevronRight size={14} />
        </button>
      </div>

      {logOpen && (
        <div className="combat-log-modal" role="dialog" aria-modal="true" aria-label="Combat Log">
          <div className="combat-log-sheet">
            <div className="combat-log-title"><span><BookOpen size={16} /> Combat Log</span><button onClick={() => setLogOpen(false)} aria-label="Close combat log">×</button></div>
            <div>{combat.log.map((entry, index) => {
              const item: CombatLogEntry = typeof entry === "string"
                ? { id: `legacy-${index}`, text: entry }
                : entry;
              if (!item.info) return <p key={item.id} className={index === 0 ? "latest" : ""}>{item.text}</p>;
              const termIndex = item.text.toLocaleLowerCase().indexOf(item.info.title.toLocaleLowerCase());
              if (termIndex < 0) return <p key={item.id} className={index === 0 ? "latest" : ""}>{item.text}</p>;
              const termEnd = termIndex + item.info.title.length;
              return (
                <p key={item.id} className={`combat-log-entry ${index === 0 ? "latest" : ""}`}>
                  {item.text.slice(0, termIndex)}
                  <button type="button" className="combat-log-term" onClick={() => setInspectedInfo(item.info ?? null)}>
                    {item.text.slice(termIndex, termEnd)}
                  </button>
                  {item.text.slice(termEnd)}
                </p>
              );
            })}</div>
          </div>
        </div>
      )}

      {inspectedInfo && <InspectInfoModal info={inspectedInfo} onClose={() => setInspectedInfo(null)} />}
      {inspectedEnemy && <EnemyStatsModal enemy={inspectedEnemy} onClose={() => setInspectedEnemyId(null)} />}
      {playerAttributesOpen && <PlayerAttributesModal name={game.character.name} derived={derived} onClose={() => setPlayerAttributesOpen(false)} />}

      {combat.outcome === "victory" && !sequencePending && adventure.pendingReward && (
        <VictoryScoreScreen
          reward={adventure.pendingReward}
          encounterTitle={node.title}
          onCharacter={onCharacter}
          onContinue={onContinue}
          onLeaveTraining={onLeaveTraining}
          finalEncounter={adventure.mode === "story" && adventure.nodeIndex === getAdventureDefinition(adventure.adventureId).stages.length - 1}
          endless={adventure.mode === "endless"}
          presentationPlayed={rewardPresentationPlayed}
          hasUnspentCharacterPoints={game.character.unspentStatPoints > 0 || game.character.talentPoints > 0}
          onPresentationStart={onRewardPresentationStart}
        />
      )}
      {combat.outcome === "defeat" && !sequencePending && (
        <div className="compact-outcome defeat">
          <div className="compact-outcome-card">
            <Skull />
            <p className="eyebrow">Combat defeat</p>
            <h2>{game.character.name} has fallen</h2>
            <p>This chronicle ends here. All progress, equipment, and talents are lost.</p>
            <button className="primary-button" onClick={onPermadeath}>Create New Character <ChevronRight size={17} /></button>
          </div>
        </div>
      )}
    </section>
  );
}

export function VictoryScoreScreen({ reward, encounterTitle, onCharacter, onContinue, onLeaveTraining, finalEncounter, endless, presentationPlayed, hasUnspentCharacterPoints, onPresentationStart }: {
  reward: CombatReward;
  encounterTitle: string;
  onCharacter: () => void;
  onContinue: () => void;
  onLeaveTraining: () => void;
  finalEncounter: boolean;
  endless: boolean;
  presentationPlayed: boolean;
  hasUnspentCharacterPoints: boolean;
  onPresentationStart: (rewardId: string) => void;
}) {
  const [displayedExperience, setDisplayedExperience] = useState(() => presentationPlayed ? reward.experience : 0);
  const displayedProgress = experienceProgressAfterGain(reward.levelBefore, reward.xpBefore, displayedExperience);
  const reachedMaxLevel = displayedProgress.level >= MAX_LEVEL;
  const leveledUp = reward.levelsGained > 0;
  const levelUpPending = leveledUp && hasUnspentCharacterPoints;

  useEffect(() => {
    if (presentationPlayed) {
      setDisplayedExperience(reward.experience);
      return;
    }

    onPresentationStart(reward.id);
    setDisplayedExperience(0);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayedExperience(reward.experience);
      return;
    }

    let frame = 0;
    const delay = window.setTimeout(() => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1700);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedExperience(Math.round(reward.experience * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    }, 450);

    return () => {
      window.clearTimeout(delay);
      window.cancelAnimationFrame(frame);
    };
  }, [onPresentationStart, presentationPlayed, reward.id, reward.experience]);

  return (
    <div className="victory-score-screen" role="dialog" aria-modal="true" aria-label="Combat rewards">
      <section className="victory-score-card">
        <header className="victory-score-heading">
          <span className="score-trophy"><Trophy size={25} /></span>
          <div><p className="eyebrow">Encounter Complete</p><h2>{encounterTitle}</h2></div>
        </header>

        <div className={`score-reward-totals ${reward.gold === 0 ? "single" : ""}`}>
          <span><Sparkles size={15} /><strong>+{reward.experience}</strong><small>Experience</small></span>
          {reward.gold > 0 && <span><GoldIcon /><strong>+{reward.gold}</strong><small>Gold</small></span>}
        </div>

        <div className="score-experience-panel">
          <div className="score-experience-meta"><strong>Level {displayedProgress.level}</strong><span>{reachedMaxLevel ? "Max Level" : `${displayedProgress.xp} / ${displayedProgress.required} XP`}</span></div>
          <div className="score-experience-track" role="progressbar" aria-label="Experience progress" aria-valuemin={0} aria-valuemax={reachedMaxLevel ? 100 : displayedProgress.required} aria-valuenow={reachedMaxLevel ? 100 : displayedProgress.xp}>
            <i style={{ width: reachedMaxLevel ? "100%" : `${Math.min(100, (displayedProgress.xp / displayedProgress.required) * 100)}%` }} />
          </div>
          <small className="score-xp-count">+{displayedExperience} XP</small>
        </div>

        {reward.loot && (
          <div className={`score-loot-card ${reward.loot.rarity}`}>
            <span className="score-loot-glyph"><GearSlotIcon slot={reward.loot.slot} item={reward.loot} size={24} /></span>
            <span><small>{reward.loot.rarity} · {getGearCategoryLabel(reward.loot)}</small><strong>{reward.loot.name}</strong><em>{reward.loot.description}</em></span>
          </div>
        )}

        <div className="victory-score-actions">
          <button className={`score-character-button ${levelUpPending ? "level-up" : ""}`} onClick={onCharacter}>{levelUpPending ? <Sparkles size={16} /> : <UserRound size={16} />} {levelUpPending ? "Level up!" : "View Character"}</button>
          <button className="primary-button" onClick={onContinue}>{endless ? "Continue Training" : finalEncounter ? "Complete Adventure" : "Continue Journey"}<ChevronRight size={16} /></button>
        </div>
        {endless && <button className="text-button score-leave-training" onClick={onLeaveTraining}>Leave Training</button>}
      </section>
    </div>
  );
}

export function StageCard({ stage, index }: { stage: AdventureStageDefinition; index: number }) {
  const icons = [<Footprints />, <Gem />, <Swords />, <Trophy />];
  const possibilities = stage.entries.map((entry) => `${entry.chance}% ${entry.type === "event" ? "Event" : entry.type === "boss" ? "Boss" : "Combat"}`).join(" · ");
  return <article className="route-card"><span className="route-number">0{index + 1}</span><span className="route-icon">{icons[index] ?? <Footprints />}</span><p className="eyebrow">Stage {index + 1}</p><h3>{stage.name}</h3><p>{possibilities}</p></article>;
}

export function ProgressHeader({ index, mode, adventureId }: { index: number; mode: AdventureMode; adventureId: string }) {
  if (mode === "endless") {
    return <div className="journey-progress endless"><span>Shadow Proving Grounds</span><div className="journey-progress-track" aria-hidden="true"><i style={{ width: "100%" }} /></div><span>Fight {index + 1}</span></div>;
  }
  const definition = getAdventureDefinition(adventureId);
  const progress = ((index + 1) / definition.stages.length) * 100;
  return <div className="journey-progress"><span>{definition.name}</span><div className="journey-progress-track" role="progressbar" aria-label="Adventure progress" aria-valuemin={0} aria-valuemax={definition.stages.length} aria-valuenow={index + 1}><i style={{ width: `${progress}%` }} /></div><span>{index + 1} / {definition.stages.length}</span></div>;
}
