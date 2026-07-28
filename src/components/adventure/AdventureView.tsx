import {
  ArrowLeft,
  BookOpen,
  CircleCheckBig,
  ChevronRight, CircleDot,
  Droplets,
  Flame, FlaskConical,
  Heart, HeartPulse,
  LogOut,
  Skull,
  Sparkles,
  Trophy,
  UserRound,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FloatingCombatText } from "../../components/FloatingCombatText";
import { GameConfirmDialog } from "../../components/GameConfirmDialog";
import { ItemIcon } from "../../components/ItemIcon";
import { ItemDetailModal } from "../../components/character/CharacterView";
import { getAdventureDefinition, getAdventureNode, getStoryAdventureAvailability } from "../../game/adventures";
import { ARENA_CHAMPION_MAX_HP } from "../../game/arena";
import { getCharacterAvatar } from "../../game/avatars";
import { getDerivedStats } from "../../game/character";
import { getStatusAdjustedCombatStats } from "../../game/combatStats";
import { getCharacterAbilityCooldownTurns, getCharacterAbilityDescription, getCharacterAbilityEnergyCostForTarget, getCharacterAbilityModifiers } from "../../game/combatFeatures";
import { MAX_CONSUMABLES_PER_TURN, MAX_PLAYER_ACTIONS_PER_TURN } from "../../game/combatLimits";
import { consumableRemovesActiveControl } from "../../game/consumables";
import { eventRevealsPlayerTurn, getCombatEventDurationMs, isCombatSequencePending, isHiddenDamageEvent, isHiddenPlayerAbilityEvent } from "../../game/combatSequence";
import { ABILITIES, ADVENTURE_EVENTS, ADVENTURES, ENEMIES } from "../../game/data";
import { getGearCategoryLabel } from "../../game/gear";
import { getGearRating } from "../../game/itemScaling";
import { consumableCount, describeConsumableEffect, groupInventoryItems, isConsumableItem, isGearItem, isMiscItem } from "../../game/items";
import { experienceProgressAfterGain, MAX_LEVEL } from "../../game/progression";
import { COMBAT_TIMING } from "../../game/timing";
import type { CharacterState, CombatLogEntry, CombatReward, CombatState, ConsumableItem, GameState, GearItem, GearSlot, InspectableInfo, StatusEffectId } from "../../game/types";
import { projectCombatActionQueue, type QueuedCombatAction } from "../../hooks/useCombatActionQueue";

import { AbilityImpactEffect, AbilityProjectileEffect, BarrierShimmer, BleedApplicationEffect, BlizzardFieldEffect, ChainedApplicationEffect, CombatantBeamEffect, CombatantPathEffect, ConductorFieldEffect, DiminishingReturnsApplicationEffect, EpidemicEffect, FocusCastEffect, FrozenApplicationEffect, LingeringChargeSiphonEffects, LingeringThunderstormEffects, NeurotoxinEffect, PandemicSpreadEffect, PoisonApplicationEffect, PoisonCloudEffect, PoisonTransferAnimation, PowerSuppressionApplicationEffect, RecuperateCastEffect, SmiteApplicationEffect, ToxicExplosionEffect, VenombornHealingEffect, VenombornTransferAnimation } from "../combat/CombatEffects";

import { ElectrifiedApplicationEffect, EnemyStatsModal, EnergySegments, HealthBar, HoldAbilityButton, InspectInfoModal, PassiveProcFloats, PlayerAttributesModal, StatusBadge } from "../combat/CombatHud";

import { InitiativeRoll, TurnOrderBar } from "../combat/InitiativePresentation";

import { getItemNameClass, GoldIcon, preloadImage } from "../../ui/gameUi";
import { EventPresentation } from "./EventPresentation";

export function AdventureView({ game, derived, queuedActions, onBegin, onTown, onSelectEnemy, onAbility, onConsumable, onEndTurn, onEnemyTurn, onCombatEvent, onCombatSequenceComplete, onPlayerTurnReady, onInitiativeOrderStart, onInitiativeComplete, onContinue, onFlee, onReturnToArkenfall, onEvent, onMerchantPurchase, onMerchantSell, onPermadeath, onCharacter, onInventory, onEquip, rewardPresentationPlayed, onRewardPresentationStart }: {
  game: GameState;
  derived: ReturnType<typeof getDerivedStats>;
  queuedActions: QueuedCombatAction[];
  onBegin: (adventureId?: string) => void;
  onTown: () => void;
  onSelectEnemy: (id: string) => void;
  onAbility: (id: string) => void;
  onConsumable: (id: string) => void;
  onEndTurn: () => void;
  onEnemyTurn: (actorId: string) => void;
  onCombatEvent: (eventId: number, eventIndex: number) => void;
  onCombatSequenceComplete: (eventId: number) => void;
  onPlayerTurnReady: (eventId: number) => void;
  onInitiativeOrderStart: () => void;
  onInitiativeComplete: () => void;
  onContinue: () => void;
  onFlee: () => void;
  onReturnToArkenfall: () => void;
  onEvent: (choiceId: string) => void;
  onMerchantPurchase: (itemId: string) => void;
  onMerchantSell: (itemId: string) => void;
  onPermadeath: () => void;
  onCharacter: () => void;
  onInventory: () => void;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  rewardPresentationPlayed: boolean;
  onRewardPresentationStart: (rewardId: string) => void;
}) {
  const adventure = game.adventure;
  const [logOpen, setLogOpen] = useState(false);
  const [inspectedInfo, setInspectedInfo] = useState<InspectableInfo | null>(null);
  const [inspectedEnemyId, setInspectedEnemyId] = useState<string | null>(null);
  const [playerAttributesOpen, setPlayerAttributesOpen] = useState(false);
  const [combatInventoryOpen, setCombatInventoryOpen] = useState(false);
  const [fleeDialogOpen, setFleeDialogOpen] = useState(false);
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
    setCombatInventoryOpen(false);
    setFleeDialogOpen(false);
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
    if (!adventure.combat || adventure.combat.outcome !== "active" || initiativePlaying || sequencePending || logOpen || inspectedInfo || inspectedEnemy || playerAttributesOpen || combatInventoryOpen || fleeDialogOpen || activeActor?.kind !== "enemy") return;
    const timer = window.setTimeout(() => onEnemyTurn(activeActor.actorId), 250);
    return () => window.clearTimeout(timer);
  }, [activeActor?.actorId, activeActor?.kind, adventure.combat?.outcome, combatEventId, combatInventoryOpen, fleeDialogOpen, initiativePlaying, inspectedEnemy, inspectedInfo, logOpen, onEnemyTurn, playerAttributesOpen, sequencePending]);

  if (adventure.completed) {
    const completedAdventure = getAdventureDefinition(adventure.adventureId);
    return (
      <section className="page narrow-page completion-page">
        <div className="boss-emblem"><Trophy size={34} /></div>
        <p className="eyebrow">Adventure Complete</p>
        <h1>{completedAdventure.completionTitle}</h1>
        <p>{completedAdventure.completionDescription}</p>
        <div className="reward-strip">
          <span><strong>{game.character.level}</strong> Level</span><span><strong className="reward-value-with-icon"><GoldIcon />{game.character.gold}</strong> Gold</span>
        </div>
        <button className="primary-button" onClick={onReturnToArkenfall}>Return to Arkenfall <ChevronRight size={17} /></button>
      </section>
    );
  }

  if (!adventure.active) {
    return (
      <section className="page adventure-home" aria-labelledby="adventures-heading">
        <header className="adventure-entry-header">
          <button type="button" className="town-back-button adventure-town-back" onClick={onTown}><ArrowLeft /> Arkenfall Town</button>
          <div className="adventure-entry-copy"><p className="eyebrow">Beyond the Gates</p><h1 id="adventures-heading">Adventures</h1><p>Choose a path, prepare for the road, and write the next chapter of your story.</p></div>
        </header>
        <div className="adventure-hero-list">{ADVENTURES.map((definition, index) => {
          const availability = getStoryAdventureAvailability(definition, game.character.completedAdventureIds);
          const requirementName = definition.prerequisiteAdventureId ? getAdventureDefinition(definition.prerequisiteAdventureId).name : null;
          return (
            <div
              className={`hero-card adventure-theme-${definition.theme.replaceAll("_", "-")} ${availability === "completed" ? "completed" : ""}`}
              style={{
                "--adventure-card-order": index,
                ...(definition.cardImageUrl ? { backgroundImage: `url("${definition.cardImageUrl}")` } : {}),
              } as CSSProperties}
              key={definition.id}
            >
              <div className="hero-copy">
                {availability === "completed" && <div className="adventure-completed-mark"><CircleCheckBig /><strong>Completed</strong></div>}
                <p className="eyebrow">{availability === "completed" ? "Completed Adventure" : index === 0 ? "Available Adventure" : "Story Adventure"}</p>
                <h1>{definition.name}</h1>
                <p>{definition.description}</p>
                <div className="adventure-tags">
                  <span>Recommended Level {definition.recommendedLevel}</span>
                  <span>{definition.stages.length} Stages</span>
                  <span>{availability === "completed" ? "Replay · 10% XP · 50% Gold" : availability === "locked" && requirementName ? `Requires ${requirementName}` : index === 0 ? "Dynamic Encounters" : "Unlocked"}</span>
                </div>
                <button className="primary-button" disabled={availability === "locked"} onClick={() => onBegin(definition.id)}>{availability === "completed" ? <>Replay Adventure <ChevronRight size={18} /></> : availability === "locked" ? "Locked" : <>Begin Journey <ChevronRight size={18} /></>}</button>
              </div>
            </div>
          );
        })}</div>
      </section>
    );
  }

  const node = getAdventureNode(adventure);
  if (node.type === "event") {
    const eventDefinition = node.eventId ? ADVENTURE_EVENTS[node.eventId] : undefined;
    return (
      <EventPresentation
        key={node.id}
        definition={eventDefinition}
        title={node.title}
        description={node.description}
        rollResult={adventure.eventRollResult}
        hasImmediateEncounter={Boolean(adventure.eventEncounter)}
        merchantItemIds={adventure.eventMerchant?.itemIds ?? []}
        merchantPurchasedItemIds={adventure.eventMerchant?.purchasedItemIds ?? []}
        character={game.character}
        inventory={game.character.inventory}
        gold={game.character.gold}
        onChoose={onEvent}
        onPurchase={onMerchantPurchase}
        onSell={onMerchantSell}
        onInventory={onInventory}
        onContinue={onContinue}
      />
    );
  }

  const combat = adventure.combat!;
  const isArenaChallenge = adventure.mode === "arena";
  const playerChained = combat.playerStatuses.some((status) => status.id === "chained");
  const displayedPlayerStats = getStatusAdjustedCombatStats({
    ...derived,
    maxHp: combat.playerMaxHp,
    energyRegen: derived.energyRegen + (combat.nextTurnEnergyRegenBonus ?? 0),
  }, combat.playerStatuses);
  const damagedTargets = combat.damagedTargets ?? [];
  const missedTargets = combat.missedTargets ?? [];
  const passiveAnimations = combat.passiveAnimations ?? [];
  const poisonAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "poison");
  const bleedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "bleed");
  const electrifiedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "electrified");
  const frozenAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "frozen");
  const smiteAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "smite");
  const diminishingReturnsAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "diminishingReturns");
  const chainedAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "chained");
  const nullifyAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "nullify");
  const disarmAnimations = (combat.statusAnimations ?? []).filter((animation) => animation.statusId === "disarm");
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
  const woundfixerHealAnimations = abilityAnimations.filter((animation) => animation.kind === "enemy_woundfixer_heal" && animation.targetId && animation.sourceTargetId && animation.targetId !== animation.sourceTargetId);
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
    <section
      className={`combat-page compact-combat ${getAdventureDefinition(adventure.adventureId).theme.replaceAll("_", "-")}-combat ${isArenaChallenge ? "arena-combat" : ""} ${inspectedInfo || inspectedEnemy || playerAttributesOpen ? "inspect-info-open" : ""}`}
      style={getAdventureDefinition(adventure.adventureId).combatBackgroundUrl
        ? { "--combat-background-image": `url("${getAdventureDefinition(adventure.adventureId).combatBackgroundUrl}")` } as CSSProperties
        : undefined}
    >
      <button type="button" className="combat-log-button combat-log-corner" onClick={() => setLogOpen(true)} aria-label="Open Combat Log"><BookOpen size={15} /></button>
      {isArenaChallenge ? <ArenaProgressHeader combat={combat} /> : <ProgressHeader index={adventure.nodeIndex} adventureId={adventure.adventureId} />}
      <TurnOrderBar combat={combat} />
      {initiativePlaying && <InitiativeRoll key={`${adventure.nodeIndex}-${combat.eventId}`} combat={combat} onOrderStart={onInitiativeOrderStart} onComplete={onInitiativeComplete} />}
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
          {chainedAnimations.filter((animation) => animation.targetId === "player").map((animation) => <ChainedApplicationEffect key={animation.id} />)}
          {nullifyAnimations.filter((animation) => animation.targetId === "player").map((animation) => <PowerSuppressionApplicationEffect key={animation.id} kind="nullify" />)}
          {disarmAnimations.filter((animation) => animation.targetId === "player").map((animation) => <PowerSuppressionApplicationEffect key={animation.id} kind="disarm" />)}
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
          <EnergySegments value={combat.energy} max={combat.maxEnergy} regen={displayedPlayerStats.energyRegen} showGain />
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
              className={`compact-combatant enemy-combatant ${activeActor?.actorId === enemy.instanceId ? "active-turn" : ""} ${combat.selectedEnemyId === enemy.instanceId ? "selected" : ""} ${enemy.hp <= 0 ? "dead" : ""} ${!targetable && enemy.hp > 0 ? "untargetable" : ""} ${stealthed ? "stealthed" : ""} ${enemy.statuses.some((status) => status.id === "stunned") ? "is-stunned" : ""} ${enemy.statuses.some((status) => status.id === "frozen") ? "is-frozen" : ""} ${damagedTargets.includes(enemy.instanceId) ? "damaged" : ""} ${combat.attackingActorId === enemy.instanceId ? `attacking-left attack-cycle-${combat.attackAnimationId % 2}` : ""} ${utilityCastShake ? `utility-cast-shake cast-cycle-${combat.eventId % 2}` : ""} ${enemy.chargingAbilityId ? "enemy-charging-attack" : ""} ${neurotoxinEffects.length > 0 ? "neurotoxin-hit" : ""}`}
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
              {chainedAnimations.filter((animation) => animation.targetId === enemy.instanceId).map((animation) => <ChainedApplicationEffect key={animation.id} />)}
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
      {woundfixerHealAnimations.map((animation) => <CombatantPathEffect key={animation.id} animation={animation} className="enemy-woundfixer-heal-path"><HeartPulse /><i /><i /><b /></CombatantPathEffect>)}
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
          return <HoldAbilityButton key={id} ability={ability} description={getCharacterAbilityDescription(game.character, ability)} energyCost={effectiveEnergyCost} baseCooldown={effectiveCooldownTurns} cooldown={cooldown} queuedCount={queuedCount} disabled={abilityInputUnavailable || !isPlayerTurn || queueProjection.closed || queueProjection.playerActionsUsed >= MAX_PLAYER_ACTIONS_PER_TURN || cooldown > 0 || queueProjection.cooldownAbilityIds.has(id) || combat.outcome !== "active" || effectiveEnergyCost > queueProjection.energy || !targetRequirementMet || !targetStackRequirementMet || !spreadTargetAvailable || !selfRequirementMet} onUse={() => onAbility(id)} />;
        })}
        {Array.from({ length: Math.max(0, 6 - game.character.equippedAbilities.length) }).map((_, index) => <div className="compact-ability-empty" key={index}>Empty</div>)}
      </div>

      <div className="combat-action-budget" aria-live="polite"><span>Actions <strong>{Math.min(MAX_PLAYER_ACTIONS_PER_TURN, queueProjection.playerActionsUsed)}/{MAX_PLAYER_ACTIONS_PER_TURN}</strong></span><span>Consumable <strong>{Math.min(MAX_CONSUMABLES_PER_TURN, queueProjection.consumablesUsed)}/{MAX_CONSUMABLES_PER_TURN}</strong></span></div>

      <div className="combat-footer-controls">
        <button className="combat-flee-button" data-game-tooltip={!isArenaChallenge && playerChained ? "Chained prevents you from fleeing." : undefined} disabled={initiativePlaying || sequencePending || Boolean(combat.attackingActorId) || queuedActions.length > 0 || combat.outcome !== "active" || (!isArenaChallenge && playerChained)} onClick={() => setFleeDialogOpen(true)}><LogOut size={14} /> {isArenaChallenge ? "End Trial" : playerChained ? "Chained" : "Flee"}</button>
        {!isArenaChallenge && <button className="combat-inventory-button" disabled={initiativePlaying || !isPlayerTurn || combat.outcome !== "active"} onClick={() => setCombatInventoryOpen(true)}><FlaskConical size={14} /> Inventory</button>}
        <button className={`end-turn-button ${queuedEndTurnPosition > 0 ? "queued" : ""}`} disabled={initiativePlaying || !isPlayerTurn || combat.outcome !== "active" || queueProjection.closed} onClick={onEndTurn}>
          {queuedEndTurnPosition > 0 ? `End Turn Queued` : isPlayerTurn ? "End Turn" : `${activeActor?.name ?? "Enemy"}'s Turn`} <ChevronRight size={14} />
        </button>
      </div>

      {fleeDialogOpen && (
        <GameConfirmDialog
          eyebrow={isArenaChallenge ? "Damage Trial" : "Retreat"}
          title={isArenaChallenge ? "End the trial now?" : "Flee combat?"}
          description={isArenaChallenge ? "Your current damage will be recorded and awarded as Experience. This attempt will remain spent." : "If you flee there is a risk that you lose items and gold while running away. Are you sure?"}
          cancelLabel={isArenaChallenge ? "Keep Fighting" : "Fight!"}
          confirmLabel={isArenaChallenge ? "End Trial" : "Flee!"}
          onCancel={() => setFleeDialogOpen(false)}
          onConfirm={() => { setFleeDialogOpen(false); onFlee(); }}
        />
      )}

      {combatInventoryOpen && (
        <CombatInventoryModal
          inventory={game.character.inventory.filter(isConsumableItem)}
          gold={game.character.gold}
          queuedActions={queuedActions}
          availableCounts={queueProjection.consumableCounts}
          selectedTargetAvailable={Boolean(queueProjection.targetStatusIds.get(combat.selectedEnemyId) && !queueProjection.targetStatusIds.get(combat.selectedEnemyId)?.has("stealth"))}
          visibleEnemyAvailable={combat.enemies.some((enemy) => enemy.hp > 0 && !enemy.statuses.some((status) => status.id === "stealth"))}
          activePlayerStatusIds={queueProjection.playerStatusIds}
          disabled={initiativePlaying || !isPlayerTurn || queueProjection.closed || queueProjection.playerActionsUsed >= MAX_PLAYER_ACTIONS_PER_TURN || queueProjection.consumablesUsed >= MAX_CONSUMABLES_PER_TURN || combat.outcome !== "active"}
          onUse={(itemId) => { onConsumable(itemId); setCombatInventoryOpen(false); }}
          onClose={() => setCombatInventoryOpen(false)}
        />
      )}

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
      {playerAttributesOpen && <PlayerAttributesModal name={game.character.name} derived={displayedPlayerStats} onClose={() => setPlayerAttributesOpen(false)} />}

      {isArenaChallenge && combat.outcome !== "active" && !sequencePending && adventure.pendingReward && adventure.arenaResult && (
        <ArenaResultScreen game={game} onCharacter={onCharacter} onReturn={onReturnToArkenfall} />
      )}
      {!isArenaChallenge && combat.outcome === "victory" && !sequencePending && adventure.pendingReward && (
        <VictoryScoreScreen
          reward={adventure.pendingReward}
          character={game.character}
          encounterTitle={node.title}
          onCharacter={onCharacter}
          onEquip={onEquip}
          onContinue={onContinue}
          finalEncounter={adventure.nodeIndex === getAdventureDefinition(adventure.adventureId).stages.length - 1}
          presentationPlayed={rewardPresentationPlayed}
          unspentAttributePoints={game.character.unspentStatPoints}
          unspentTalentPoints={game.character.talentPoints}
          onPresentationStart={onRewardPresentationStart}
        />
      )}
      {!isArenaChallenge && combat.outcome === "defeat" && !sequencePending && (
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

function CombatInventoryModal({ inventory, gold, queuedActions, availableCounts, selectedTargetAvailable, visibleEnemyAvailable, activePlayerStatusIds, disabled, onUse, onClose }: {
  inventory: ConsumableItem[];
  gold: number;
  queuedActions: QueuedCombatAction[];
  availableCounts: Map<string, number>;
  selectedTargetAvailable: boolean;
  visibleEnemyAvailable: boolean;
  activePlayerStatusIds: Set<StatusEffectId>;
  disabled: boolean;
  onUse: (itemId: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const uniqueItems = [...new Map(inventory.map((item) => [item.id, item])).values()];
  return (
    <div className="combat-inventory-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="combat-inventory-dialog" role="dialog" aria-modal="true" aria-labelledby="combat-inventory-title">
        <header><div className="combat-inventory-heading"><h2 id="combat-inventory-title">Inventory</h2><span className="combat-inventory-gold"><GoldIcon /> {gold} Gold</span></div><button type="button" onClick={onClose} aria-label="Close inventory">×</button></header>
        <div className="combat-inventory-list">
          {uniqueItems.length === 0 && <div className="combat-inventory-empty"><FlaskConical /><strong>No consumables</strong><p>Your inventory contains no items that can be used in combat.</p></div>}
          {uniqueItems.map((item) => {
            const count = consumableCount(inventory, item.id);
            const available = availableCounts.get(item.id) ?? count;
            const queued = queuedActions.filter((action) => action.type === "item" && action.itemId === item.id).length;
            const targetUnavailable = item.effects.some((effect) => "target" in effect && effect.target === "target") && !selectedTargetAvailable;
            const groupUnavailable = item.effects.some((effect) => "target" in effect && effect.target === "all_enemies") && !visibleEnemyAvailable;
            const controlUnavailable = !consumableRemovesActiveControl(activePlayerStatusIds, item);
            const unavailable = targetUnavailable || groupUnavailable || controlUnavailable;
            return <article className={`combat-consumable-card ${item.rarity}`} key={item.id}><span className="combat-consumable-icon"><ItemIcon item={item} size={42} /></span><div><small>{item.rarity} · {count} owned{queued > 0 ? ` · ${queued} queued` : ""}</small><strong className={getItemNameClass(item)}>{item.name}</strong><p>{item.description}</p><ul>{item.effects.map((effect, index) => <li key={`${effect.type}-${index}`}>{describeConsumableEffect(effect)}</li>)}</ul>{controlUnavailable ? <em>Your control effect permits only a matching remedy.</em> : (targetUnavailable || groupUnavailable) ? <em>No valid enemy target.</em> : null}</div><button type="button" disabled={disabled || available <= 0 || unavailable} onClick={() => onUse(item.id)}>{available <= 0 ? "Queued" : "Use"}</button></article>;
          })}
        </div>
      </section>
    </div>
  );
}

export interface ScoreGearInspection {
  item: GearItem;
  equippedSlot?: GearSlot;
  canEquip: boolean;
}

export function getScoreGearInspection(item: GearItem, character: CharacterState): ScoreGearInspection {
  const inventoryItem = character.inventory.find((candidate): candidate is GearItem => candidate.id === item.id && isGearItem(candidate));
  if (inventoryItem) return { item: inventoryItem, canEquip: true };
  const equippedEntry = (Object.entries(character.equipment) as Array<[GearSlot, GearItem | undefined]>).find(([, equipped]) => equipped?.id === item.id);
  return { item, equippedSlot: equippedEntry?.[0], canEquip: false };
}

export function VictoryScoreScreen({ reward, character, encounterTitle, onCharacter, onEquip, onContinue, finalEncounter, presentationPlayed, unspentAttributePoints, unspentTalentPoints, onPresentationStart }: {
  reward: CombatReward;
  character: CharacterState;
  encounterTitle: string;
  onCharacter: () => void;
  onEquip: (item: GearItem, preferredSlot?: GearSlot) => void;
  onContinue: () => void;
  finalEncounter: boolean;
  presentationPlayed: boolean;
  unspentAttributePoints: number;
  unspentTalentPoints: number;
  onPresentationStart: (rewardId: string) => void;
}) {
  const [displayedExperience, setDisplayedExperience] = useState(() => presentationPlayed ? reward.experience : 0);
  const displayedProgress = experienceProgressAfterGain(reward.levelBefore, reward.xpBefore, displayedExperience);
  const reachedMaxLevel = displayedProgress.level >= MAX_LEVEL;
  const leveledUp = reward.levelsGained > 0;
  const levelUpPending = leveledUp && (unspentAttributePoints > 0 || unspentTalentPoints > 0);
  const groupedLoot = groupInventoryItems(reward.loot);
  const [inspectedGear, setInspectedGear] = useState<ScoreGearInspection | null>(null);
  const continueTooltip = [
    unspentAttributePoints > 0 ? "You have unspent Attribute Points" : "",
    unspentTalentPoints > 0 ? "You have unspent Talent Points" : "",
  ].filter(Boolean).join("\n");

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

        {reward.loot.length > 0 && <div className="score-loot-list" aria-label="Items found">
          <p className="eyebrow">Items Found</p>
          {groupedLoot.map(({ item, count }) => {
            const content = <>
              <span className="score-loot-glyph"><ItemIcon item={item} size={40} /></span>
              <span><small>{item.rarity} · {isConsumableItem(item) ? "Consumable" : isMiscItem(item) ? "Item" : `${getGearCategoryLabel(item)} · Rating ${getGearRating(item)}`}</small><strong className={getItemNameClass(item)}>{item.name}{count > 1 ? ` x ${count}` : ""}</strong><em>{item.description}</em></span>
            </>;
            return isGearItem(item)
              ? <button type="button" className={`score-loot-card inspectable ${item.rarity}`} key={item.id} onClick={() => setInspectedGear(getScoreGearInspection(item, character))}>{content}</button>
              : <div className={`score-loot-card ${item.rarity}`} key={item.id}>{content}</div>;
          })}
        </div>}

        <div className="victory-score-actions">
          <button className={`score-character-button ${levelUpPending ? "level-up" : ""}`} onClick={onCharacter}>{levelUpPending ? <Sparkles size={16} /> : <UserRound size={16} />} {levelUpPending ? "Level up!" : "View Character"}</button>
          <button className="primary-button score-continue-button" disabled={levelUpPending} data-game-tooltip={levelUpPending ? continueTooltip : undefined} onClick={onContinue}>{finalEncounter ? "Complete Adventure" : "Continue Journey"}<ChevronRight size={16} /></button>
        </div>
      </section>
      {inspectedGear && <ItemDetailModal item={inspectedGear.item} equippedSlot={inspectedGear.equippedSlot} character={character} locked={false} viewOnly={!inspectedGear.canEquip} onClose={() => setInspectedGear(null)} onEquip={(item, slot) => { onEquip(item, slot); setInspectedGear(null); }} />}
    </div>
  );
}

export function ProgressHeader({ index, adventureId }: { index: number; adventureId: string }) {
  const definition = getAdventureDefinition(adventureId);
  const progress = ((index + 1) / definition.stages.length) * 100;
  return <div className="journey-progress"><span>{definition.name}</span><div className="journey-progress-track" role="progressbar" aria-label="Adventure progress" aria-valuemin={0} aria-valuemax={definition.stages.length} aria-valuenow={index + 1}><i style={{ width: `${progress}%` }} /></div><span>{index + 1} / {definition.stages.length}</span></div>;
}

function ArenaProgressHeader({ combat }: { combat: CombatState }) {
  const champion = combat.enemies[0];
  const damage = Math.max(0, (champion?.maxHp ?? ARENA_CHAMPION_MAX_HP) - (champion?.hp ?? ARENA_CHAMPION_MAX_HP));
  const challenge = combat.challenge;
  const currentTurn = Math.max(1, Math.min(challenge?.playerTurnLimit ?? 10, (challenge?.playerTurnsCompleted ?? 0) + (combat.outcome === "active" ? 1 : 0)));
  return <div className="journey-progress arena-trial-progress"><span>Damage Trial</span><strong>{damage.toLocaleString()} Damage</strong><span>Turn {currentTurn} / {challenge?.playerTurnLimit ?? 10}</span></div>;
}

function ArenaResultScreen({ game, onCharacter, onReturn }: { game: GameState; onCharacter: () => void; onReturn: () => void }) {
  const result = game.adventure.arenaResult!;
  const reward = game.adventure.pendingReward!;
  const rank = Math.max(1, (game.character.arenaScores ?? []).findIndex((score) => score.id === result.id) + 1);
  return (
    <div className="compact-outcome arena-result">
      <div className="compact-outcome-card arena-result-card">
        <Trophy />
        <p className="eyebrow">Damage Recorded</p>
        <h2>{result.damage.toLocaleString()} Damage</h2>
        <p>The Arena Champion laughs as the bell rings. You earn Experience equal to 20% of the damage dealt.</p>
        <div className="arena-result-stats"><span><small>Experience</small><strong>+{reward.experience.toLocaleString()} XP</strong></span><span><small>Personal Rank</small><strong>#{rank}</strong></span><span><small>Turns Used</small><strong>{result.turns} / 10</strong></span></div>
        {reward.levelsGained > 0 && <button type="button" className="score-character-button level-up" onClick={onCharacter}><Sparkles size={16} /> Level up!</button>}
        <button className="primary-button" onClick={onReturn}>Return to Grand Arena <ChevronRight size={17} /></button>
      </div>
    </div>
  );
}
