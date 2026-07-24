import {
  Hourglass,
  Sparkles,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDerivedStats } from "../../game/character";
import { STATUS_DURATION_SEGMENTS, STATUS_EFFECTS } from "../../game/statusEffects";
import type { Ability, CombatPassiveAnimation, EnemyState, InspectableInfo, StatusEffect, StatusEffectId } from "../../game/types";

import { AbilityTypeIcon, ATTRIBUTE_SUMMARIES, formatPercent, formatStat, getAbilityTypeLabel, getDerivedStatRows, STAT_LABELS, StatIcon, STATUS_ICONS } from "../../ui/gameUi";

export function HealthBar({ value, max, damageAmount, damageSource, missed = false }: { value: number; max: number; damageAmount?: number; damageSource?: string; missed?: boolean }) {
  const previousValue = useRef(value);
  const [change, setChange] = useState<{ id: number; kind: "damage" | "heal" | "miss"; delta: number; source?: string } | null>(null);

  useEffect(() => {
    const delta = value - previousValue.current;
    previousValue.current = value;
    if (delta !== 0) {
      const displayedDelta = delta < 0 ? -(damageAmount && damageAmount > 0 ? damageAmount : Math.abs(delta)) : delta;
      setChange({ id: Date.now(), kind: delta > 0 ? "heal" : "damage", delta: displayedDelta, source: delta < 0 ? damageSource : undefined });
    } else if (missed) {
      setChange({ id: Date.now(), kind: "miss", delta: 0 });
    }
  }, [damageAmount, damageSource, missed, value]);

  return (
    <div className="health-bar-wrap">
      <div className="health-bar"><i style={{ width: `${Math.max(0, value / max) * 100}%` }} /></div>
      {change && (
        <strong key={change.id} className={`health-change ${change.kind}`} aria-hidden="true">
          {change.kind === "miss" ? "Missed!" : <>{change.delta > 0 ? "+" : "−"}{Math.abs(change.delta)}{change.source && <span className="health-change-source"> ({change.source})</span>}</>}
        </strong>
      )}
    </div>
  );
}

export function PassiveProcFloats({ animations }: { animations: CombatPassiveAnimation[] }) {
  const visible = animations.slice(-3);
  if (visible.length === 0) return null;
  return (
    <div className="passive-proc-floats" aria-hidden="true">
      {visible.map((animation) => {
        const direction = [-1, 0, 1][animation.lane % 3] ?? 0;
        return (
          <strong
            key={animation.id}
            className="passive-proc-float"
            style={{
              "--passive-proc-offset": `${animation.lane * 14}px`,
              "--passive-proc-mid-x": `${direction * 24}px`,
              "--passive-proc-end-x": `${direction * 54}px`,
            } as React.CSSProperties}
          >
            {animation.text}
          </strong>
        );
      })}
    </div>
  );
}

export function ElectrifiedApplicationEffect() {
  return (
    <span className="electrified-application-effect" aria-hidden="true">
      <Zap className="electrified-bolt electrified-bolt-one" />
      <Zap className="electrified-bolt electrified-bolt-two" />
      <Zap className="electrified-bolt electrified-bolt-three" />
    </span>
  );
}

export function EnergySegments({ value, max, regen, showGain = false }: { value: number; max: number; regen: number; showGain?: boolean }) {
  const previousValue = useRef(value);
  const [gain, setGain] = useState<{ id: number; amount: number } | null>(null);
  const segmentCount = Math.max(1, Math.floor(max));
  const filled = Math.max(0, Math.min(segmentCount, Math.floor(value)));
  const projected = Math.min(segmentCount, filled + Math.max(0, Math.floor(regen)));

  useEffect(() => {
    const delta = value - previousValue.current;
    previousValue.current = value;
    if (showGain && delta > 0) setGain({ id: Date.now(), amount: delta });
  }, [showGain, value]);

  return (
    <div className="energy-segments-wrap">
      <div
        className="energy-segments"
        style={{ gridTemplateColumns: `repeat(${segmentCount}, minmax(0, 1fr))` }}
        aria-label={`${filled} of ${segmentCount} Energy. ${projected - filled} Energy will regenerate next round.`}
      >
        {Array.from({ length: segmentCount }, (_, index) => (
          <i key={index} className={index < filled ? "filled" : index < projected ? "projected" : ""} />
        ))}
      </div>
      {gain && <strong key={gain.id} className="energy-change" aria-hidden="true">+{gain.amount} Energy</strong>}
    </div>
  );
}

export function StatusBadge({ id, name, stacks, duration, permanent = false, kind, owner, onInspect }: { id: StatusEffectId; name: string; stacks: number; duration: number; permanent?: boolean; kind: StatusEffect["kind"]; owner: "player" | "enemy"; onInspect?: () => void }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const Icon = STATUS_ICONS[id];
  const label = [
    name,
    id === "barrier" || id === "guard"
      ? `${stacks} remaining`
      : STATUS_EFFECTS[id].stackable
        ? `${stacks} ${stacks === 1 ? "stack" : "stacks"}`
        : null,
    id === "stealth"
      ? `Until the end of ${owner === "enemy" ? "their" : "your"} next turn`
      : permanent ? null : `${duration} ${duration === 1 ? "turn" : "turns"} remaining`,
  ].filter(Boolean).join(", ");
  const remainingSegments = Math.max(0, Math.min(STATUS_DURATION_SEGMENTS, Math.floor(duration)));
  const gap = 6;
  const segmentLength = 100 / STATUS_DURATION_SEGMENTS - gap;
  const ring = permanent ? (
    <svg className="status-duration-ring permanent" viewBox="0 0 40 40" aria-hidden="true">
      <circle className="remaining" cx="20" cy="20" r="17" />
    </svg>
  ) : (
    <svg className="status-duration-ring" viewBox="0 0 40 40" aria-hidden="true">
      {Array.from({ length: STATUS_DURATION_SEGMENTS }, (_, index) => (
        <circle
          key={index}
          className={index < remainingSegments ? "remaining" : "expired"}
          cx="20"
          cy="20"
          r="17"
          pathLength="100"
          style={{
            strokeDasharray: `${segmentLength} ${100 - segmentLength}`,
            strokeDashoffset: -(index * 100 / STATUS_DURATION_SEGMENTS + gap / 2),
          }}
        />
      ))}
    </svg>
  );
  const stackCounter = STATUS_EFFECTS[id].stackable ? <b className="status-stack-count" aria-hidden="true">{stacks}</b> : null;

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  if (!onInspect) return <span className={`status-badge status-icon status-${id} ${kind}`} aria-label={label} data-game-tooltip={label}>{ring}<Icon />{stackCounter}</span>;

  const beginHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") return;
    longPressed.current = false;
    holdTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setTooltipOpen(true);
    }, 420);
  };

  const endHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setTooltipOpen(false);
    window.setTimeout(() => { longPressed.current = false; }, 250);
  };

  return (
    <button
      type="button"
      className={`status-badge status-icon status-${id} inspectable ${kind}`}
      aria-label={label}
      data-game-tooltip={label}
      data-tooltip-open={tooltipOpen ? "true" : undefined}
      onPointerDown={beginHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        if (longPressed.current) {
          event.preventDefault();
          return;
        }
        onInspect();
      }}
    >
      {ring}<Icon />{stackCounter}
    </button>
  );
}

export function EnemyStatsModal({ enemy, onClose }: { enemy: EnemyState; onClose: () => void }) {
  const stats = [
    ["Max Health", enemy.maxHp],
    ["Physical Power", enemy.physicalPower],
    ["Spell Power", enemy.spellPower],
    ["Armor", enemy.armor],
    ["Magic Resistance", enemy.magicResistance],
    ["Hit Chance", formatPercent(enemy.hitChance)],
    ["Dodge Chance", formatPercent(enemy.dodgeChance)],
    ["Critical Strike Chance", formatPercent(enemy.critChance)],
    ["Energy Regeneration", enemy.energyRegen],
    ["Max Energy", enemy.maxEnergy],
  ] as const;
  return (
    <div className="inspect-info-modal" role="dialog" aria-modal="true" aria-label={`${enemy.name} stats`} onClick={onClose}>
      <div className="inspect-info-card enemy-stats-card" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">Enemy Information</p>
        <h2>{enemy.name}</h2>
        <p className="enemy-title">{enemy.title}</p>
        <div className="enemy-stats-content">
          <figure className="enemy-full-art"><img src={enemy.imageUrl} alt={`${enemy.name}, ${enemy.title}`} draggable={false} /></figure>
          <div className="enemy-stats-grid">
            {stats.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}
          </div>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function PlayerAttributesModal({ name, derived, onClose }: {
  name: string;
  derived: ReturnType<typeof getDerivedStats>;
  onClose: () => void;
}) {
  return (
    <div className="inspect-info-modal" role="dialog" aria-modal="true" aria-label={`${name} character stats`} onClick={onClose}>
      <div className="inspect-info-card player-attributes-card" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">Character Stats</p>
        <h2>{name}</h2>
        <h3 className="player-stats-section-title">Attributes</h3>
        <div className="player-attributes-grid">
          {STAT_LABELS.map((stat) => (
            <span key={stat.key}>
              <StatIcon stat={stat.key} />
              <span><small>{stat.label}</small><em>{ATTRIBUTE_SUMMARIES[stat.key]}</em></span>
              <strong>{formatStat(derived[stat.key])}</strong>
            </span>
          ))}
        </div>
        <h3 className="player-stats-section-title">Combat Stats</h3>
        <div className="player-derived-stats-grid">
          {getDerivedStatRows(derived).map((stat) => (
            <span key={stat.label}>
              <StatIcon stat={stat.icon} />
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
            </span>
          ))}
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function InspectInfoModal({ info, onClose }: { info: InspectableInfo; onClose: () => void }) {
  return (
    <div className="inspect-info-modal" role="dialog" aria-modal="true" aria-label={`${info.title} details`} onClick={onClose}>
      <div className="inspect-info-card" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">{info.category === "ability" ? "Attack" : info.category === "stat" ? "Character Stat" : "Status Effect"}</p>
        <h2>{info.title}</h2>
        <p>{info.description}</p>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function HoldAbilityButton({ ability, description, energyCost, baseCooldown, cooldown, queuedCount, disabled, onUse }: { ability: Ability; description: string; energyCost: number; baseCooldown: number; cooldown: number; queuedCount: number; disabled: boolean; onUse: () => void }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const beginHold = () => {
    longPressed.current = false;
    holdTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      setTooltipOpen(true);
    }, 420);
  };

  const endHold = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setTooltipOpen(false);
    window.setTimeout(() => { longPressed.current = false; }, 250);
  };

  const activate = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (longPressed.current) {
      event.preventDefault();
      return;
    }
    onUse();
  };

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  return (
    <button
      className={`compact-ability ${ability.branch} ${queuedCount > 0 ? "queued" : ""}`}
      data-ability-type={ability.types[0]}
      disabled={disabled}
      onClick={activate}
      onPointerDown={beginHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={`${ability.name}, ${getAbilityTypeLabel(ability)}, ${ability.range === "ranged" ? "Ranged" : "Melee"}, ${energyCost} Energy, ${baseCooldown} turn base cooldown${cooldown > 0 ? `, ${cooldown} remaining` : ""}. Hold for details.`}
    >
      <span className="compact-ability-icon"><AbilityTypeIcon ability={ability} /></span>
      <strong>{ability.name}</strong>
      <span className="compact-ability-cost">{energyCost}<Sparkles size={10} /></span>
      <span className="compact-ability-cooldown-value"><Hourglass size={9} />{baseCooldown}</span>
      {queuedCount > 0 && <span className="compact-ability-queued" aria-hidden="true">Queued{queuedCount > 1 ? ` ×${queuedCount}` : ""}</span>}
      {cooldown > 0 && <span className="compact-ability-cooldown" aria-hidden="true"><Hourglass size={15} /><b>{cooldown}</b></span>}
      <span className={`ability-hold-tooltip ${tooltipOpen ? "force-open" : ""}`}><b>{ability.name}</b><small>{description}</small><em>Type: {getAbilityTypeLabel(ability)}</em><em>{energyCost} Energy · {baseCooldown ? `${baseCooldown} turn cooldown` : "No cooldown"} · {ability.range === "ranged" ? "Ranged" : "Melee"}</em></span>
    </button>
  );
}
