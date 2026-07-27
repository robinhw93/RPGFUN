import { ChevronRight, LockKeyhole, Sparkles } from "lucide-react";
import { ABILITIES } from "../../game/data";
import { AVAILABLE_STARTING_CLASS_IDS, getStartingClassTalents } from "../../game/characterIntroduction";

const CLASS_INTRODUCTIONS: Record<string, string> = {
  arcanist_1: "Master arcane power and shape fire, frost, and lightning into devastating spells.",
  brute_1: "Meet danger head-on with crushing physical attacks, resilience, and raw strength.",
  shadow_1: "Fight with speed and precision through critical strikes, poison, and elusive defenses.",
  cultist_1: "Draw power from forbidden rites, sacrifice, and forces best left undisturbed.",
};

const CLASS_ORDER = ["arcanist_1", "brute_1", "shadow_1", "cultist_1"];

export function ClassSelection({ onChoose }: { onChoose: (talentId: string) => void }) {
  const startingClasses = getStartingClassTalents();
  const classes = CLASS_ORDER.flatMap((id) => startingClasses.find((talent) => talent.id === id) ?? []);

  return (
    <section className="page class-selection-page">
      <header className="class-selection-heading">
        <span className="class-selection-sigil"><Sparkles size={24} /></span>
        <p className="eyebrow">Getting Started · Step 1 of 2</p>
        <h1>Choose Your Class</h1>
        <p>Your class unlocks its first Talent node, grants its passive bonus, and equips its signature ability. This choice cannot be changed.</p>
      </header>
      <div className="class-selection-grid">
        {classes.map((talent) => {
          const available = AVAILABLE_STARTING_CLASS_IDS.includes(talent.id as typeof AVAILABLE_STARTING_CLASS_IDS[number]);
          const ability = talent.abilityId ? ABILITIES[talent.abilityId] : null;
          return (
            <article className={`class-selection-card ${talent.branch}${available ? "" : " coming-soon"}`} key={talent.id}>
              <span className="class-selection-symbol" aria-hidden="true">{talent.icon}</span>
              <p className="eyebrow">{available ? "Available Class" : "Coming Soon"}</p>
              <h2>{talent.name}</h2>
              <p className="class-selection-fantasy">{CLASS_INTRODUCTIONS[talent.id]}</p>
              <div className="class-selection-benefits">
                <span><small>Class Bonus</small><strong>{talent.description.replace(ability ? ` Unlocks ${ability.name}.` : "", "")}</strong></span>
                {ability && <span><small>Signature Ability · {ability.energyCost} Energy · {ability.cooldownTurns ? `${ability.cooldownTurns} Turn Cooldown` : "No Cooldown"}</small><strong>{ability.name}</strong><em>{ability.description}</em></span>}
                {!ability && <span><small>Class Path</small><strong>Not yet available</strong></span>}
              </div>
              <button type="button" className="primary-button class-selection-button" disabled={!available} onClick={() => onChoose(talent.id)}>
                {available ? <>Choose {talent.name} <ChevronRight size={17} /></> : <><LockKeyhole size={15} /> Coming Soon</>}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
