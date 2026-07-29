import { Activity, HeartPulse, Shield, Sparkles, Swords, X } from "lucide-react";
import { useState } from "react";
import type { CombatReport } from "../../game/types";

export function CombatReportButton({ report }: { report: CombatReport }) {
  const [open, setOpen] = useState(false);
  const sources = Object.entries(report.damageBySource).sort((left, right) => right[1] - left[1]);
  return <>
    <button type="button" className="combat-report-open" onClick={() => setOpen(true)}><Activity /> Combat Report</button>
    {open && <div className="game-modal-backdrop combat-report-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="game-modal combat-report-dialog" role="dialog" aria-modal="true" aria-labelledby="combat-report-title"><button type="button" className="modal-close-button" onClick={() => setOpen(false)} aria-label="Close"><X /></button><p className="eyebrow">Encounter Breakdown</p><h2 id="combat-report-title">Combat Report</h2><div className="combat-report-stats"><article><Swords /><strong>{report.damageDealt.toLocaleString()}</strong><span>Damage Dealt</span></article><article><HeartPulse /><strong>{report.damageTaken.toLocaleString()}</strong><span>Damage Taken</span></article><article><HeartPulse /><strong>{report.healingDone.toLocaleString()}</strong><span>Healing Done</span></article><article><Shield /><strong>{report.absorbedDamage.toLocaleString()}</strong><span>Damage Absorbed</span></article><article><Sparkles /><strong>{report.largestHit.toLocaleString()}</strong><span>Largest Hit</span></article><article><Activity /><strong>{report.playerTurns}</strong><span>Turns Completed</span></article></div><div className="combat-report-details"><span>{report.criticalHits} Critical Hits</span><span>{report.missedAttacks} Misses</span><span>{report.energySpent} Energy Spent</span><span>{report.energyGained} Energy Gained</span></div><section className="combat-report-sources"><h3>Damage by Source</h3>{sources.length === 0 ? <p>No player damage recorded.</p> : sources.map(([source, damage]) => <div key={source}><span>{source}</span><strong>{damage.toLocaleString()}</strong><i style={{ width: `${Math.max(3, damage / Math.max(1, report.damageDealt) * 100)}%` }} /></div>)}</section></section></div>}
  </>;
}
