import { Gauge, Settings, Sparkles, X } from "lucide-react";
import type { GamePreferences } from "../game/preferences";

export function SettingsButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return <button type="button" className={`settings-button ${open ? "active" : ""}`} onClick={onOpen} aria-label="Game settings"><Settings /></button>;
}

export function SettingsDialog({ preferences, onChange, onClose }: { preferences: GamePreferences; onChange: (preferences: GamePreferences) => void; onClose: () => void }) {
  return <div className="game-modal-backdrop settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="game-modal settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button type="button" className="modal-close-button" onClick={onClose} aria-label="Close settings"><X /></button><p className="eyebrow">Accessibility and Pace</p><h2 id="settings-title">Settings</h2><div className="settings-row"><Gauge /><div><strong>Combat Speed</strong><p>Changes combat presentation speed. Game rules stay exactly the same.</p><div className="settings-options">{([1, 1.5, 2] as const).map((speed) => <button type="button" className={preferences.combatSpeed === speed ? "active" : ""} key={speed} onClick={() => onChange({ ...preferences, combatSpeed: speed })}>{speed}×</button>)}</div></div></div><label className="settings-toggle"><Sparkles /><span><strong>Reduced Motion</strong><small>Removes most non-essential movement and flashes.</small></span><input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => onChange({ ...preferences, reducedMotion: event.target.checked })} /></label></section></div>;
}
