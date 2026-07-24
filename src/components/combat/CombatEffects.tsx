import {
  BatteryLow,
  CircleDot, Crosshair, Droplets,
  EyeOff, Flame, FlaskConical, Footprints,
  Hand, Heart, HeartPulse,
  Megaphone, Moon,
  Shield,
  ShieldCheck, ShieldOff, ShieldPlus, Skull,
  Snowflake, Sparkles, Sun, Swords, Target,
  Zap
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { COMBAT_TIMING } from "../../game/timing";
import type { CombatAbilityAnimation, CombatAbilityVfxKind, CombatProjectileAnimation, CombatStatusAnimation, StatusEffectId } from "../../game/types";

import { STATUS_ICONS } from "../../ui/gameUi";

export function PoisonApplicationEffect() {
  return <span className="poison-application-effect" aria-hidden="true" />;
}

export function BleedApplicationEffect() {
  return (
    <span className="bleed-application-effect" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <i key={index} style={{ "--blood-left": `${8 + index * 14}%`, "--blood-delay": `${index * 38}ms`, "--blood-distance": `${100 + (index % 3) * 24}px` } as React.CSSProperties} />
      ))}
    </span>
  );
}

export function PoisonCloudEffect() {
  return (
    <span className="poison-cloud-effect" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--smoke-left": `${3 + index * 13}%`, "--smoke-delay": `${index * 45}ms` } as React.CSSProperties} />)}
    </span>
  );
}

export function NeurotoxinEffect() {
  return (
    <span className="neurotoxin-effect" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

export function ToxicExplosionEffect() {
  return (
    <span className="toxic-explosion-effect" aria-hidden="true">
      <b>☣</b>
      <i className="toxic-wave" />
      {Array.from({ length: 7 }).map((_, index) => <i className="toxic-particle" key={index} style={{ "--particle-angle": `${index * (360 / 7)}deg`, "--particle-delay": `${index * 18}ms` } as React.CSSProperties} />)}
    </span>
  );
}

export function FocusCastEffect() {
  return (
    <span className="focus-cast-effect" aria-hidden="true">
      <i className="focus-ring focus-ring-outer" />
      <i className="focus-ring focus-ring-inner" />
      <Crosshair />
      <b />
    </span>
  );
}

export function RecuperateCastEffect() {
  return (
    <span className="recuperate-cast-effect" aria-hidden="true">
      <i className="recuperate-wave recuperate-wave-one" />
      <i className="recuperate-wave recuperate-wave-two" />
      <BatteryLow />
      {Array.from({ length: 6 }).map((_, index) => (
        <b key={index} style={{ "--energy-particle-x": `${14 + index * 14}%`, "--energy-particle-delay": `${index * 42}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}

export function FrozenApplicationEffect() {
  return <span className="frozen-application-effect" aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
}

export function SmiteApplicationEffect() {
  return <span className="smite-application-effect" aria-hidden="true"><Sun /><i /><i /><i /><i /></span>;
}

export function DiminishingReturnsApplicationEffect() {
  return <span className="diminishing-returns-application-effect" aria-hidden="true"><ShieldCheck /><i /><i /><i /></span>;
}

export function ConductorFieldEffect() {
  return <span className="conductor-field-effect" aria-hidden="true"><Zap />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--conductor-x": `${5 + index * 15}%`, "--conductor-delay": `${index * 34}ms` } as React.CSSProperties} />)}</span>;
}

export function BlizzardFieldEffect() {
  return (
    <span className="blizzard-field-effect" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, index) => (
        <Snowflake key={index} style={{
          "--blizzard-top": `${-8 + (index % 10) * 11}%`,
          "--blizzard-delay": `${(index % 7) * 48}ms`,
          "--blizzard-duration": `${520 + (index % 5) * 85}ms`,
          "--blizzard-size": `${10 + (index % 4) * 4}px`,
          "--blizzard-drop": `${45 + (index % 6) * 13}px`,
        } as React.CSSProperties} />
      ))}
      {Array.from({ length: 7 }).map((_, index) => <b key={index} style={{ "--gust-top": `${8 + index * 13}%`, "--gust-delay": `${index * 42}ms` } as React.CSSProperties} />)}
    </span>
  );
}

export function BarrierShimmer({ pulsing }: { pulsing: boolean }) {
  return <span className={`barrier-shimmer ${pulsing ? "barrier-shimmer-pulse" : ""}`} aria-hidden="true"><i /><i /><b /></span>;
}

export function AbilityImpactEffect({ kind }: { kind: CombatAbilityVfxKind }) {
  if (kind.startsWith("enemy_")) {
    const icon = kind === "enemy_howl" || kind === "enemy_roar" ? <Megaphone />
      : kind === "enemy_hibernate" ? <Moon />
      : kind === "enemy_scurry" ? <Footprints />
      : kind === "enemy_burning_glare" ? <Flame />
      : kind === "enemy_natures_beam" || kind === "enemy_wisp_blast" || kind === "enemy_shimmer" || kind === "enemy_spirit_heal" ? <Sparkles />
      : kind === "enemy_fade_out" ? <EyeOff />
      : <Swords />;
    return <span className={`ability-impact-effect enemy-ability-impact ${kind.replaceAll("_", "-")}`} aria-hidden="true">{icon}<i /><i /><i /><b /></span>;
  }
  if (kind === "guard") {
    return <span className="ability-impact-effect guard-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /></span>;
  }
  if (kind === "ambush") {
    return <span className="ability-impact-effect ambush-impact" aria-hidden="true"><Moon /><i /><i /><i /></span>;
  }
  if (kind === "venomous_strike" || kind === "slowing_venom" || kind === "weakening_venom" || kind === "rabid_venom") {
    return <span className={`ability-impact-effect venom-impact ${kind}`} aria-hidden="true"><FlaskConical /><i /><i /><i /></span>;
  }
  if (kind === "flurry" || kind === "slice_and_dice") {
    return <span className={`ability-impact-effect slash-storm-impact ${kind}`} aria-hidden="true"><Swords /><i /><i /><i /><i /></span>;
  }
  if (kind === "lightning_strike" || kind === "light_speed") {
    return <span className={`ability-impact-effect lightning-impact ${kind}`} aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "sharpened_blade") {
    return <span className="ability-impact-effect sharpened-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /></span>;
  }
  if (kind === "pinpoint_slice") {
    return <span className="ability-impact-effect pinpoint-impact" aria-hidden="true"><Crosshair /><b /></span>;
  }
  if (kind === "chain_assassination") {
    return <span className="ability-impact-effect chain-impact" aria-hidden="true"><Skull /><i /><i /><i /></span>;
  }
  if (kind === "cull_the_weak") {
    return <span className="ability-impact-effect cull-impact" aria-hidden="true"><Target />{Array.from({ length: 6 }).map((_, index) => <i key={index} style={{ "--cull-angle": `${index * 60}deg` } as React.CSSProperties} />)}</span>;
  }
  if (kind === "voltage_siphon") {
    return <span className="ability-impact-effect voltage-siphon-impact" aria-hidden="true"><Zap /><HeartPulse /><i /></span>;
  }
  if (kind === "light_speed_turn") {
    return <span className="ability-impact-effect light-speed-turn-impact" aria-hidden="true"><Zap /><Sparkles /><i /><i /></span>;
  }
  if (kind === "arcane_bolt") {
    return <span className="ability-impact-effect arcane-bolt-impact" aria-hidden="true"><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "frostbolt") {
    return <span className="ability-impact-effect frostbolt-impact" aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
  }
  if (kind === "arcane_blast") {
    return <span className="ability-impact-effect arcane-blast-impact" aria-hidden="true"><CircleDot /><i /><i /><i /></span>;
  }
  if (kind === "fireball") {
    return <span className="ability-impact-effect fireball-impact" aria-hidden="true"><Flame /><i /><i /><i /><i /></span>;
  }
  if (kind === "lightning_beam") {
    return <span className="ability-impact-effect lightning-beam-impact" aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "thunderstorm") {
    return <span className="ability-impact-effect thunderstorm-impact" aria-hidden="true"><Zap /><i /><i /><i /></span>;
  }
  if (kind === "deep_freeze") {
    return <span className="ability-impact-effect deep-freeze-impact" aria-hidden="true"><Snowflake /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "arcane_overload") {
    return <span className="ability-impact-effect arcane-overload-impact" aria-hidden="true"><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "combustion" || kind === "combustion_spread") {
    return <span className={`ability-impact-effect combustion-impact ${kind}`} aria-hidden="true"><Flame />{Array.from({ length: 6 }).map((_, index) => <i key={index} style={{ "--combustion-angle": `${index * 60}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "arcane_combustion") {
    return <span className="ability-impact-effect arcane-combustion-impact" aria-hidden="true"><CircleDot /><Flame /><i /><i /><i /></span>;
  }
  if (kind === "thundersnow") {
    return <span className="ability-impact-effect thundersnow-impact" aria-hidden="true"><Snowflake /><Zap />{Array.from({ length: 5 }).map((_, index) => <i key={index} style={{ "--thundersnow-x": `${12 + index * 19}%`, "--thundersnow-delay": `${index * 38}ms` } as React.CSSProperties} />)}</span>;
  }
  if (kind === "self_immolation") {
    return <span className="ability-impact-effect self-immolation-impact" aria-hidden="true"><Flame />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--immolation-angle": `${index * 51}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "firestorm") {
    return <span className="ability-impact-effect firestorm-impact" aria-hidden="true"><Flame />{Array.from({ length: 9 }).map((_, index) => <i key={index} style={{ "--firestorm-x": `${5 + index * 11.25}%`, "--firestorm-delay": `${index * 34}ms` } as React.CSSProperties} />)}<b /><b /></span>;
  }
  if (kind === "arcane_barrier") {
    return <span className="ability-impact-effect arcane-barrier-impact" aria-hidden="true"><ShieldPlus /><i /><i /><i /></span>;
  }
  if (kind === "frozen_path") {
    return <span className="ability-impact-effect frozen-path-impact" aria-hidden="true"><Footprints /><Snowflake /><i /><i /><i /></span>;
  }
  if (kind === "conductor") {
    return <span className="ability-impact-effect conductor-impact" aria-hidden="true"><Zap /><i /><i /><i /><i /></span>;
  }
  if (kind === "mana_fracture" || kind === "focused_blast") {
    return <span className={`ability-impact-effect new-arcane-impact ${kind}`} aria-hidden="true"><CircleDot /><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "rapid_fire") {
    return <span className="ability-impact-effect rapid-fire-impact" aria-hidden="true"><Flame /><i /><i /><i /><i /></span>;
  }
  if (kind === "essence_siphon") {
    return <span className="ability-impact-effect essence-siphon-impact" aria-hidden="true"><CircleDot /><Sparkles /><i /><i /><i /></span>;
  }
  if (kind === "absolute_zero") {
    return <span className={`ability-impact-effect new-frost-impact ${kind}`} aria-hidden="true"><Snowflake /><i /><i /><i /><i /></span>;
  }
  if (kind === "blizzard") return null;
  if (kind === "ride_the_lightning" || kind === "charge") {
    return <span className={`ability-impact-effect new-lightning-impact ${kind}`} aria-hidden="true"><Zap /><i /><i /><i /><i /></span>;
  }
  if (kind === "elemental_fury") {
    return <span className="ability-impact-effect elemental-fury-impact" aria-hidden="true"><Flame /><Snowflake /><Zap /><CircleDot />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--elemental-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "phoenix_heart") {
    return <span className="ability-impact-effect phoenix-heart-impact" aria-hidden="true"><Flame /><Heart />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--phoenix-angle": `${index * 51.4}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "searing_strike" || kind === "wounding_strike" || kind === "swift_blade" || kind === "flame_cleave" || kind === "bloodletting") {
    const icon = kind === "searing_strike" || kind === "flame_cleave" ? <Flame /> : <Swords />;
    return <span className={`ability-impact-effect brute-slash-impact ${kind}`} aria-hidden="true">{icon}<i /><i /><i /><b /></span>;
  }
  if (kind === "shield_bash") {
    return <span className="ability-impact-effect shield-bash-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "holy_strike") {
    return <span className="ability-impact-effect holy-strike-impact" aria-hidden="true"><Sparkles /><Heart /><i /><i /><i /><b /></span>;
  }
  if (kind === "unbreakable") {
    return <span className="ability-impact-effect unbreakable-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "blood_barrier") {
    return <span className="ability-impact-effect blood-barrier-impact" aria-hidden="true"><Droplets /><ShieldPlus /><i /><i /><b /></span>;
  }
  if (kind === "burning_guard") {
    return <span className="ability-impact-effect burning-guard-impact" aria-hidden="true"><Shield /><Flame /><i /><i /><i /><b /></span>;
  }
  if (kind === "lay_on_hands") {
    return <span className="ability-impact-effect lay-on-hands-impact" aria-hidden="true"><Hand /><Heart /><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "shield_charge") {
    return <span className="ability-impact-effect shield-charge-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "bloodbath") {
    return <span className="ability-impact-effect bloodbath-impact" aria-hidden="true"><Swords /><Droplets /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "furnace_breaker") {
    return <span className="ability-impact-effect furnace-breaker-impact" aria-hidden="true"><Flame /><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "divine_smite" || kind === "smite_retribution") {
    return <span className={`ability-impact-effect divine-smite-impact ${kind}`} aria-hidden="true"><Sun /><Sparkles /><i /><i /><i /><b /></span>;
  }
  if (kind === "blood_frenzy") {
    return <span className="ability-impact-effect blood-frenzy-impact" aria-hidden="true"><Swords /><Droplets /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "crushing_impact") {
    return <span className="ability-impact-effect crushing-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "explosive_strike" || kind === "explosive_strike_blast") {
    return <span className={`ability-impact-effect explosive-strike-impact ${kind}`} aria-hidden="true"><Flame />{Array.from({ length: 7 }).map((_, index) => <i key={index} style={{ "--explosive-angle": `${index * 51.43}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "consecrated_ground") {
    return <span className="ability-impact-effect consecrated-ground-impact" aria-hidden="true"><Sun /><Sparkles />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--consecrated-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "bash") {
    return <span className="ability-impact-effect bash-impact" aria-hidden="true"><ShieldOff /><i /><i /><i /><b /></span>;
  }
  if (kind === "brute_guard") {
    return <span className="ability-impact-effect brute-guard-impact" aria-hidden="true"><ShieldCheck /><i /><i /><i /><b /></span>;
  }
  if (kind === "defensive_maneuvers") {
    return <span className="ability-impact-effect defensive-maneuvers-impact" aria-hidden="true"><Shield /><Swords /><i /><i /><i /><b /></span>;
  }
  if (kind === "vampirism" || kind === "vampirism_drain") {
    return <span className={`ability-impact-effect vampirism-impact ${kind}`} aria-hidden="true"><Droplets /><Heart /><i /><i /><i /><b /></span>;
  }
  if (kind === "fire_eater" || kind === "fire_eater_transfer") {
    return <span className={`ability-impact-effect fire-eater-impact ${kind}`} aria-hidden="true"><Flame /><i /><i /><i /><i /><b /></span>;
  }
  if (kind === "beacon_of_light") {
    return <span className="ability-impact-effect beacon-of-light-impact" aria-hidden="true"><Sun /><Sparkles />{Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ "--beacon-angle": `${index * 45}deg` } as React.CSSProperties} />)}<b /></span>;
  }
  if (kind === "martyrdom") {
    return <span className="ability-impact-effect martyrdom-impact" aria-hidden="true"><Heart /><Flame /><i /><i /><i /><b /></span>;
  }
  return null;
}

export function EpidemicEffect() {
  return (
    <span className="epidemic-effect" aria-hidden="true">
      <b>☣</b>
      {Array.from({ length: 11 }).map((_, index) => (
        <i key={index} style={{ "--epidemic-left": `${2 + index * 9.4}%`, "--epidemic-delay": `${index * 38}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}

export function CombatantPathEffect({ animation, className, children, durationMs, delayMs = 0 }: { animation: Pick<CombatAbilityAnimation, "id" | "sourceTargetId" | "targetId">; className: string; children: ReactNode; durationMs?: number; delayMs?: number }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 16,
      top: sourceY - 16,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className={`combatant-path-effect ${className}`}
      style={{ left: path.left, top: path.top, animationDelay: `${delayMs}ms`, "--path-x": `${path.x}px`, "--path-y": `${path.y}px`, ...(durationMs ? { "--projectile-flight": `${durationMs}ms` } : {}) } as React.CSSProperties}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function CombatantBeamEffect({ animation, className, children, durationMs }: { animation: Pick<CombatAbilityAnimation, "id" | "sourceTargetId" | "targetId">; className: string; children: ReactNode; durationMs: number }) {
  const [beam, setBeam] = useState<{ left: number; top: number; length: number; angle: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    setBeam({
      left: sourceX,
      top: sourceY,
      length: Math.hypot(targetX - sourceX, targetY - sourceY),
      angle: Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!beam) return null;
  return (
    <span
      className={`combatant-beam-effect ${className}`}
      style={{ left: beam.left, top: beam.top, width: beam.length, "--beam-angle": `${beam.angle}deg`, "--beam-duration": `${durationMs}ms` } as React.CSSProperties}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function useLingeringAbilityAnimations(animations: CombatAbilityAnimation[], kind: CombatAbilityVfxKind, durationMs: number) {
  const [visible, setVisible] = useState<CombatAbilityAnimation[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const incoming = animations.filter((animation) => animation.kind === kind && animation.targetId);
    if (incoming.length === 0) return;
    setVisible((current) => [...current, ...incoming.filter((animation) => !current.some((existing) => existing.id === animation.id))]);
    incoming.forEach((animation) => {
      if (timers.current.has(animation.id)) return;
      const timer = window.setTimeout(() => {
        setVisible((current) => current.filter((existing) => existing.id !== animation.id));
        timers.current.delete(animation.id);
      }, durationMs);
      timers.current.set(animation.id, timer);
    });
  }, [animations, durationMs, kind]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return visible;
}

export function LingeringChargeSiphonEffects({ animations }: { animations: CombatAbilityAnimation[] }) {
  const visible = useLingeringAbilityAnimations(animations, "charge_siphon", COMBAT_TIMING.attackImpactMs);

  return visible.map((animation) => (
    <CombatantBeamEffect key={animation.id} animation={animation} durationMs={COMBAT_TIMING.attackImpactMs} className="charge-lightning-path charge-siphon-path">
      <i /><i /><i /><b />
    </CombatantBeamEffect>
  ));
}

export function LingeringThunderstormEffects({ animations }: { animations: CombatAbilityAnimation[] }) {
  const visible = useLingeringAbilityAnimations(animations, "thunderstorm", COMBAT_TIMING.attackDurationMs);
  return visible.map((animation) => <ScreenLightningStrikeEffect key={animation.id} animation={animation} />);
}

export function ScreenLightningStrikeEffect({ animation }: { animation: Pick<CombatAbilityAnimation, "id" | "targetId"> }) {
  const [strike, setStrike] = useState<{ left: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.targetId) return;
    const target = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")]
      .find((element) => element.dataset.combatantId === animation.targetId);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setStrike({ left: rect.left + rect.width / 2 - 28, height: rect.top + rect.height / 2 });
  }, [animation.id, animation.targetId]);

  if (!strike) return null;
  return (
    <span className="screen-lightning-strike" style={{ left: strike.left, height: strike.height }} aria-hidden="true">
      <i className="screen-lightning-outer" />
      <i className="screen-lightning-core" />
      <i className="screen-lightning-fork screen-lightning-fork-left" />
      <i className="screen-lightning-fork screen-lightning-fork-right" />
      <b />
    </span>
  );
}

export function AbilityProjectileEffect({ animation }: { animation: CombatProjectileAnimation }) {
  const durationMs = COMBAT_TIMING.attackImpactMs * Math.max(0.1, animation.durationMultiplier) / Math.max(1, animation.hitCount);
  const beamDurationMs = COMBAT_TIMING.attackDurationMs * Math.max(0.1, animation.durationMultiplier) / Math.max(1, animation.hitCount);
  const kind = animation.vfx;
  if (kind === "enemy_wisp_blast") {
    return <>{Array.from({ length: animation.hitCount }, (_, index) => <CombatantPathEffect key={`${animation.id}-${index}`} animation={{ ...animation, id: `${animation.id}-${index}` }} durationMs={durationMs} delayMs={index * durationMs * 0.82} className="ability-projectile-path enemy-wisp-blast-path"><Sparkles /><i /><i /><b /></CombatantPathEffect>)}</>;
  }
  if (kind === "enemy_burning_glare") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="enemy-burning-glare-beam"><i /><i /><b /><Flame /></CombatantBeamEffect>;
  }
  if (kind === "enemy_natures_beam") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="enemy-natures-beam"><i /><i /><i /><b /><Sparkles /></CombatantBeamEffect>;
  }
  if (kind === "frostbolt" || kind === "deep_freeze" || (!kind && animation.damageType === "frost")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path frostbolt-path"><Snowflake /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "absolute_zero" || kind === "blizzard") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className={`ability-projectile-path ${kind.replace("_", "-")}-path`}><Snowflake /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "fireball") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path fireball-path"><Flame /><i /><i /><i /><b /><b /><b /><b /></CombatantPathEffect>;
  }
  if (kind === "combustion" || kind === "firestorm" || (!kind && animation.damageType === "fire")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path ember-projectile-path"><Flame /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "lightning_beam") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="charge-lightning-path lightning-beam-charge-path"><i /><i /><i /><b /></CombatantBeamEffect>;
  }
  if (kind === "thunderstorm" || (!kind && animation.damageType === "lightning")) {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path lightning-beam-path"><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "charge" || kind === "ride_the_lightning") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path charge-path"><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "thundersnow") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path thundersnow-path"><Snowflake /><Zap /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "toxic_explosion") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path poison-projectile-path"><FlaskConical /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "cull_the_weak" || animation.damageType === "shadow") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path shadow-projectile-path"><Moon /><i /><i /></CombatantPathEffect>;
  }
  if (!kind && animation.damageType === "physical") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path physical-projectile-path"><Target /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_blast") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="arcane-beam-path"><i /><i /><b /><Sparkles /></CombatantBeamEffect>;
  }
  if (kind === "focused_blast") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="focused-blast-beam-path"><i /><i /><b /><Sparkles /></CombatantBeamEffect>;
  }
  if (kind === "rapid_fire") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="rapid-fire-beam-path"><i /><i /><i /><b /><Flame /></CombatantBeamEffect>;
  }
  if (kind === "mana_fracture") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className={`ability-projectile-path ${kind.replace("_", "-")}-path`}><CircleDot /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_overload") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-overload-path"><Sparkles /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "arcane_combustion") {
    return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-combustion-path"><CircleDot /><Flame /><i /><i /></CombatantPathEffect>;
  }
  if (kind === "elemental_fury") {
    return <CombatantBeamEffect animation={animation} durationMs={beamDurationMs} className="elemental-fury-beam-path"><i /><i /><i /><i /><b /><Flame /><Snowflake /><Zap /><Sparkles /></CombatantBeamEffect>;
  }
  return <CombatantPathEffect animation={animation} durationMs={durationMs} className="ability-projectile-path arcane-bolt-path"><Sparkles /><i /><i /></CombatantPathEffect>;
}

export function PandemicSpreadEffect({ animation, statusIds }: { animation: CombatAbilityAnimation; statusIds: StatusEffectId[] }) {
  const [paths, setPaths] = useState<Array<{ id: string; left: number; top: number; x: number; y: number }>>([]);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    if (!source) return;
    const sourceRect = source.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPaths(combatants
      .filter((element) => element.dataset.combatantId !== "player" && element.dataset.combatantId !== animation.sourceTargetId && !element.classList.contains("dead"))
      .map((target) => {
        const targetRect = target.getBoundingClientRect();
        return {
          id: target.dataset.combatantId ?? `${targetRect.left}-${targetRect.top}`,
          left: sourceX - 15,
          top: sourceY - 15,
          x: targetRect.left + targetRect.width / 2 - sourceX,
          y: targetRect.top + targetRect.height / 2 - sourceY,
        };
      }));
  }, [animation.id, animation.sourceTargetId]);

  return (
    <>
      {paths.map((path, pathIndex) => (
        <span
          key={path.id}
          className="pandemic-flight"
          style={{ left: path.left, top: path.top, "--path-x": `${path.x}px`, "--path-y": `${path.y}px`, "--path-delay": `${pathIndex * 55}ms` } as React.CSSProperties}
          aria-hidden="true"
        >
          {(statusIds.length > 0 ? statusIds.slice(0, 4) : ["poison" as const]).map((statusId, index) => {
            const Icon = STATUS_ICONS[statusId];
            return <Icon key={`${statusId}-${index}`} style={{ "--status-flight-index": index } as React.CSSProperties} />;
          })}
          <i />
        </span>
      ))}
    </>
  );
}

export function VenombornHealingEffect() {
  return (
    <span className="venomborn-healing-effect" aria-hidden="true">
      <HeartPulse />
      <i /><i /><i />
    </span>
  );
}

export function VenombornTransferAnimation({ animation }: { animation: CombatAbilityAnimation }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId || !animation.targetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceAnchor = source.querySelector<HTMLElement>(".status-poison") ?? source.querySelector<HTMLElement>(".compact-status-row") ?? source;
    const targetAnchor = target.querySelector<HTMLElement>(".health-bar-wrap") ?? target;
    const sourceRect = sourceAnchor.getBoundingClientRect();
    const targetRect = targetAnchor.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 14,
      top: sourceY - 14,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className="venomborn-transfer-animation"
      style={{ left: path.left, top: path.top, "--venomborn-x": `${path.x}px`, "--venomborn-y": `${path.y}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <FlaskConical />
      <i /><i /><i />
    </span>
  );
}

export function PoisonTransferAnimation({ animation }: { animation: CombatStatusAnimation }) {
  const [path, setPath] = useState<{ left: number; top: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!animation.sourceTargetId) return;
    const combatants = [...document.querySelectorAll<HTMLElement>("[data-combatant-id]")];
    const source = combatants.find((element) => element.dataset.combatantId === animation.sourceTargetId);
    const target = combatants.find((element) => element.dataset.combatantId === animation.targetId);
    if (!source || !target) return;
    const sourceAnchor = source.querySelector<HTMLElement>(".status-poison") ?? source.querySelector<HTMLElement>(".compact-status-row") ?? source;
    const targetAnchor = target.querySelector<HTMLElement>(".status-poison") ?? target.querySelector<HTMLElement>(".compact-status-row") ?? target;
    const sourceRect = sourceAnchor.getBoundingClientRect();
    const targetRect = targetAnchor.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    setPath({
      left: sourceX - 12,
      top: sourceY - 12,
      x: targetRect.left + targetRect.width / 2 - sourceX,
      y: targetRect.top + targetRect.height / 2 - sourceY,
    });
  }, [animation.id, animation.sourceTargetId, animation.targetId]);

  if (!path) return null;
  return (
    <span
      className="poison-transfer-animation"
      style={{ left: path.left, top: path.top, "--poison-transfer-x": `${path.x}px`, "--poison-transfer-y": `${path.y}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <FlaskConical size={13} />
    </span>
  );
}
