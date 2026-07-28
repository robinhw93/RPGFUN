# Game systems

This document describes the rules currently implemented in Arkenfall. Percentages are written as player-facing percentages even though the code stores them as decimals.

## Core loop

1. Create and name a character, then choose one of ten appearances.
2. Review equipment, allocate earned attribute points, choose talents, and prepare up to six active abilities.
3. Begin **Windsong Forest**.
4. Travel through nine ordered stages containing fixed combats, weighted encounters, narrative events, and a Wandering Merchant while carrying remaining Health between stages.
5. After combat victories, receive experience, gold, and any successful item drops on the score screen.
6. Adjust the build between fights and events.
7. Defeat the Forest Spirit and its two Wisps to complete the current adventure.

Death is permanent. When combat reaches defeat, the browser save is deleted. The defeat screen returns the player to character creation, and the previous character, equipment, talents, and adventure progress cannot be recovered through the game UI.

## Character creation and starting state

Character creation requires a non-empty name and an appearance. Appearance has no mechanical effect. The selected appearance supplies both the full Character-screen figure and the cropped head portrait shown on the player's combat card. Combat portraits use a compact clipped square image with clearance above the Health bar; enemies always use a thin dark-red portrait frame. Clicking the player's portrait opens the character's five current Attributes plus combat-adjusted stats such as Spell Power, Hit Chance, Critical Strike Chance, defenses, Initiative, and Energy. Temporary statuses are included there through the same rules used by combat, so Fierce raises the displayed Critical Strike Chance while Blind, Shatter, Slowed, Evasion, and Exhausted adjust their corresponding values. Clicking an enemy portrait opens the enemy's equally icon-led, combat-adjusted information.

After creation, a new character follows a saved three-step introduction. The first step presents Arcanist, Brute, Shadow, and Cultist with their class bonus, combat identity, and signature ability. Arcanist, Brute, and Shadow can be selected; Cultist is shown as **Coming Soon** and cannot yet be chosen. Choosing a class directly unlocks its canonical class node, applies its passive bonus, and equips its granted ability without consuming the separate starting Talent Point. The second step opens the Talent tree centered on the chosen class node, where the available connected node pulses with a gold glow until the starting Talent Point is spent. **Next** then appears. The third step opens the Character stats page and reveals **Next** after both starting Attribute Points are assigned. **Next** then opens Arkenfall Town. The Town **Shops** destination remains highlighted with a starting-item recommendation until the character equips an item for the first time. Buying an item is recommended but never required, so Adventures and every other Town destination remain available.

Every new character starts with:

- Level 1 and 0 experience.
- 18 gold.
- 1 talent point to spend after choosing a class.
- 2 unspent attribute points assigned during the third introduction step.
- Wayfarer's Spark and the chosen class node unlocked.
- The chosen class node's signature ability equipped.
- Strength 5, Agility 5, Intelligence 5, Vitality 5, and Luck 5.
- No equipped gear and an empty inventory.

## Attributes

Attributes are whole numbers. Equipment and flat talent bonuses are added to base attributes, percentage attribute bonuses are then combined additively and applied, and the result is rounded before derived stats are calculated.

| Attribute | Current effects |
| --- | --- |
| Strength | +0.5 Physical Power per point and +1% Guard gained per point. |
| Agility | +0.25 Physical Power, +0.5% raw Hit Chance, +0.4% Dodge Chance, and +0.5 Initiative per point. |
| Intelligence | +0.5 Spell Power and +0.25 Initiative per point. |
| Vitality | +10 Max Health and +0.5% healing received per point. |
| Luck | +0.75% Critical Strike Chance, +1% loot-rarity bonus, and +0.25% to explicitly chance-based combat triggers per point. |

Spending an Attribute Point on Vitality also restores Health equal to the Max Health gained. The character therefore keeps the same amount of missing Health instead of gaining an empty section of the Health bar.

Luck does not turn guaranteed effects into random effects. Its special-effect bonus is only added to triggers that already define a chance.

## Derived stats

All displayed stats are rounded to whole numbers. Percentage values are displayed as rounded whole percentages.

| Stat | Current rule |
| --- | --- |
| Max Health | `Vitality × 10` |
| Max Energy | `7 + flat bonuses` |
| Energy Regeneration | `2 + flat bonuses` at the start of the player's turn. |
| Physical Power | `(Strength × 0.5 + Agility × 0.25 + gear/talent Physical Power) × (100% + Physical Power bonuses)` |
| Spell Power | `(Intelligence × 0.5 + gear/talent Spell Power) × (100% + Spell Power bonuses)` |
| Armor | Sum of equipped item, set, and talent Armor. Shatter can halve the effective value. |
| Magic Resistance | Sum of equipped item, set, and talent Magic Resistance. |
| Critical Strike Chance | `5% + Luck × 0.75% + bonuses` |
| Hit Chance | `95% + Agility × 0.5% + bonuses` |
| Dodge Chance | `2% + Agility × 0.4% + bonuses`, capped at 50%. |
| Initiative bonus | `Agility × 0.5 + Intelligence × 0.25 + bonuses` |
| Guard multiplier | `100% + Strength × 1% + bonuses` |
| Healing received | `100% + Vitality × 0.5% + bonuses` |
| Loot-rarity bonus | `Luck × 1% + bonuses` |
| Chance-effect bonus | `Luck × 0.25% + bonuses` |

Raw Hit Chance and Critical Strike Chance have no maximum cap. Dodge Chance is capped at 50%.

Permanent Energy Regeneration bonuses from talents add together through the shared derived-stat pipeline. The current tree contains ten +1 sources: Immaculate Timing, Toxicology, Electrified, Energized, Arcane Mind, Feedback, Reflective Barrier, Ice Spikes, Smoke, and Brute Force. Recklessness is an additional +3 source paired with -5 Max Energy.

## Ability types

Every player ability exposes one or more types from the same damage schools used by combat: Physical, Shadow, Arcane, Fire, Frost, and Lightning. Mixed abilities list each relevant type. The first type is the ability's primary presentation type and controls its subtle action-bar color and icon. Long-press tooltips, talent details, and the loadout picker show the resolved type text. Damage modifiers such as Wet continue to use the actual damage type of each damage component.

### Hit versus Dodge

The final chance to hit is:

```text
raw Hit Chance - capped target Dodge Chance
```

The final opposed result is clamped between 20% and 100%. This means:

- An attack always has at least a 20% chance to hit.
- The final chance can never exceed 100%.
- Raw Hit Chance can exceed 100% and can cancel high Dodge. For example, 155% Hit against 40% Dodge resolves to 115%, then becomes 100%.
- A new character with 5 Agility has 97.5% raw Hit Chance. Against a Windsong Wolf with 10% Dodge, the final chance is 87.5%, or an average of one miss per eight attacks.
- Temporary Dodge effects are added before the 50% Dodge cap. Evasion therefore reduces a 95% Hit Chance enemy to 45% final Hit Chance while active.
- Blind multiplies the afflicted combatant's raw Hit Chance by 25% before Dodge is subtracted. The normal 20% minimum final Hit Chance still applies.

### Critical strikes

Direct attacks roll Critical Strike Chance after a successful hit. A critical strike multiplies the pre-status direct-damage value by 1.6. Critical Strike Chance itself is uncapped, so a value of 100% or more always critically strikes.

## Damage types and defenses

The implemented damage types are Physical, Spell Damage, Arcane, Shadow, Fire, Frost, and Lightning. Spell Damage is generic magic that is not tied to an element; Poison uses it instead of Arcane.

| Damage type | Offensive power | Defense |
| --- | --- | --- |
| Physical | Physical Power | Armor |
| Spell Damage | Spell Power | Magic Resistance |
| Arcane | Spell Power | Magic Resistance |
| Fire | Spell Power | Magic Resistance |
| Frost | Spell Power | Magic Resistance |
| Lightning | Spell Power | Magic Resistance |
| Shadow | Physical Power in the current engine | Magic Resistance |

Shadow's mixed rule is the current implementation, not a general design promise for future content.

Damage-over-time defenses are applied once after all stacks for that trigger are combined. Bleed subtracts 50% of effective Armor; Poison and Burn subtract 50% of Magic Resistance. Shatter therefore also weakens Armor against Bleed. Remaining damage is then processed by status multipliers and absorption.

### Player direct damage

Each damage component follows this order:

1. Add the ability's flat power to the relevant derived power multiplied by its scaling.
2. Subtract the target's effective Armor or Magic Resistance.
3. Apply the 1.6 critical multiplier when the hit is critical.
4. Apply data-driven talent/gear damage modifiers.
5. Apply outgoing status modifiers such as Strengthened, Enlightened, or Weaken.
6. Apply incoming status modifiers such as Shielded, Vulnerable, Wet, Cold, or Charred.
7. Round to a whole number, with a minimum of 1 damage for a successful damaging component.

Multi-component abilities calculate each component separately and add the results. Lightning Strike is the current example: one Physical component and one Lightning component.

### Enemy direct damage

Each enemy ability defines flat damage plus Physical Power and/or Spell Power scaling. A definition may instead roll its Power scaling within a configured range once per ability use. Enemy abilities use a lighter defense reduction:

```text
ability damage + enemy Physical Power × physical scaling + enemy Spell Power × spell scaling
  - floor(player defense × 0.35)
```

The result has a minimum of 1 before critical and status modifiers. Guard then absorbs damage before Health is lost. Every enemy ability also declares whether it is Melee or Ranged. Melee attacks use the combat lunge; Ranged attacks use a flavor-specific projectile, beam, or target effect.

Enemy utility abilities can select the most wounded living ally, every living enemy, or every other living enemy. Healing and friendly statuses resolve through the same presentation-event queue as damage, so Health, Guard, Fierce, local text, and VFX appear together rather than changing early. Charged attacks spend their Energy and begin their cooldown when preparation starts, persist visibly between turns, then release before normal ability priorities on the caster's next turn without paying twice.

## Combat flow

### Combat start

- The player enters with carried Health, limited to current Max Health.
- Player Energy starts full.
- Every enemy starts at its configured Starting Energy, limited to 0–Max Energy. Older definitions without a separate value start at Max Energy.
- Starting statuses from talents or gear are added.
- Every combatant rolls initiative.

### Initiative

- The player rolls a whole-number d100 and adds the Initiative bonus.
- Enemies roll a whole-number d100 with no bonus.
- Highest total acts first.
- On an exact player/enemy tie, the player is ordered first.
- Remaining enemy ties are resolved by stable actor ID.
- Slowed sets the affected combatant's Initiative to 0 until the end of its next turn. The displayed value and position update in the turn-order row.
- Combat tracks who has already acted during the round, so changing Initiative never grants a second turn in that round.

The initiative UI rapidly cycles random values while each enemy is introduced in a large illustrated frame using its canonical full artwork. It locks the raw rolls, applies bonuses, then collapses the artwork and animates the final compact cards into the turn-order row. The current timing values are documented in [Architecture](../ARCHITECTURE.md#initiative-presentation).

Every contestant remains in one responsive row throughout the presentation. Cards size themselves for the available viewport before shrinking and flying into their exact turn-order positions.

### Player turn

At the start of the player's turn:

- One-round start-expiring defenses are removed.
- Burn, Regenerate, Sleep, Frozen, Stunned, and Electrified are processed.
- Energy is regenerated, limited by Max Energy.
- Exhausted limits that regeneration to at most 1.
- Ability cooldowns decrease by one player turn.
- The floating **Your turn.** event activates the UI at the same moment the turn state becomes active.

The player may use any number of abilities during the turn as long as:

- It is still the player's turn.
- Enough Energy remains.
- The ability is not on cooldown.
- A valid target exists.
- Any required self or target status is present, unless a talent modifier overrides that requirement.

Using an ability never ends the turn automatically. The player presses **End Turn** when finished. The combat footer divides its available width evenly between **Inventory** and **End Turn**.

If the player becomes Stunned, Frozen, or Sleeping during their own active turn, further abilities are blocked but **End Turn** remains available. This lets self-control effects such as Conductor finish the current turn normally. Stunned and Sleep still skip the next turn according to their usual rules; Frozen instead opens that turn with abilities blocked so the player can use a Frozen-removal consumable or choose **End Turn**.

Stunned, Frozen, and Sleep cannot cause the player to die before receiving another chance to act. When damage would leave a controlled player below 30% maximum Health, every action-blocking control effect is removed immediately; removing Stunned still grants Diminishing Returns. A lethal hit is held at 1 Health, and further damage cannot reduce the player below 1 Health until the player uses an ability or consumable, or ends the turn. The same temporary protection begins if a control effect actually skips the player's turn. New action-blocking control cannot be applied during this window. This is player-only: enemies retain their normal damage, death, Sleep, Frozen, and Stunned behavior.

When Stunned ends for either the player or an enemy, that combatant immediately gains Diminishing Returns for 3 turns. Diminishing Returns prevents every new Stunned application, including ability effects, passive procs, copied debuffs, and Electrified's turn-start chance. Its full three-turn duration begins after Stunned is removed, so the turn that consumed Stunned does not also consume a Diminishing Returns turn.

Ability input remains available while an earlier ability is animating. Further ability presses are added to a first-in, first-out queue and execute as soon as each preceding combat sequence and return animation finishes. The queue reserves Energy, cooldown availability, and the turn's remaining action budget before accepting each press, shows the queued count on affected ability buttons, and remembers the selected target for each cast. A player turn permits at most six actions regardless of available Energy; an ability counts once even when it hits several times. The combat footer shows used actions and consumables. **End Turn** can also be queued; it executes after every ability already ahead of it and prevents later actions from being added.

Abilities are classified as **Melee** or **Ranged**. Direct Melee attacks use the player's normal movement toward the target. Ranged attacks leave the player in place and use ability-specific presentation: launched bolts use projectiles, focused magic uses beams, transferred effects travel between their actual source and destination, and detonations, weather, freezes, and fields resolve directly at their targets. Damage, misses, and impact VFX still appear at the shared impact timing. Range is shown in ability details and can be set on ability nodes in the Talent Editor. Existing ability nodes also expose Flat Damage plus their total Physical Power and Spell Power damage percentages. Flat Damage is added to every direct hit before Critical Strike, damage modifiers, and defense; hybrid and multi-element attacks add it to their primary damage type and preserve their component mix when either Power total changes.

Queue projection also tracks target statuses. This allows a queued Arcane Overload to enable a queued free Arcane Blast against the same target, lets status-consuming abilities become available after an earlier queued cast applies their requirement, and previews Elemental Fury's no-debuff applications for later queued casts. Arcane Charge belongs to its target, so changing targets does not transfer the free cast.

Distraction makes the next ability cost 0 Energy and is consumed when that ability is used. Pinpoint guarantees critical strikes for every hit of the next damaging ability and is consumed when that ability begins. Both persist until consumed or combat ends.

Light Speed performs a complete player turn transition without allowing enemies to act between the two turns. End-of-turn Poison and duration changes resolve, then start-of-turn Burn, Regenerate, Energy regeneration, and cooldown reduction resolve before control returns to the player.

Voltage Stab deals Lightning damage from Spell Power. If the target was already Electrified when the hit landed, it restores 2% of Max Health and adds 2 to the player's next Energy-regeneration event. The temporary regeneration bonus stacks if another source grants the same effect, is previewed by the segmented Energy bar, and is consumed when the next player turn begins. Exhausted still limits the final regeneration to 1.

Epidemic applies 4 Poison to every living, targetable enemy and then grants Stealth until the end of the player's next turn. Venomborn consumes all Poison on its target and restores Health equal to 50% of that Poison's full-duration damage.

New Current reduces Voltage Stab's cooldown from 2 turns to 1. Efficient Spread reduces Epidemic's Energy cost from 3 to 2. Ability cost and cooldown modifiers are additive, use whole numbers, and cannot reduce either value below zero.

Firestorm simultaneously deals 25% Spell Power as Fire damage to every enemy and applies 2 Burn to every enemy and the player. While the player is Burning, Pyromania and Greater Pyromania each increase direct Arcane, Fire, Frost, and Lightning damage by 10%; the two multiplicative bonuses combine to 21%. Living Furnace and Greater Living Furnace add a combined 15% to player-applied Burn damage against enemies while the player is Burning, and Greater Living Furnace also makes Fireball apply Charred. Heat Transfer restores 1 Energy whenever the player's own Burn deals Health damage to them.

The extended Arcanist tree adds Arcane Wound consumption and Barrier interactions, Slowed-and-Exhausted frost combinations, Electrified charge chains, and Elemental Fury. Each Arcane Wound grants its target +2 percentage points of Dodge Chance, subject to the shared 50% Dodge cap. Arcane Blast deals 20% Spell Power plus 10% Spell Power per Arcane Wound already on the target before the hit; Arcane Knowledge raises that per-stack contribution to 15%, and the hit applies its new Arcane Wound only after damage is calculated. Invigorate can restore 2 Energy at most once per player turn. Mana Fracture pays its 1 Energy cost when cast, then visibly restores 1 Energy per 2 consumed Arcane Wounds at impact, capped by maximum Energy. Mana Fracture, Focused Blast, Absolute Zero, Blizzard, Ride the Lightning, Charge, Rapid Fire, and Elemental Fury are all Ranged. Rapid Fire deals Fire damage. Their mechanics resolve at beam or field impact while their VFX remain non-blocking. Queue projection includes their status-stack requirements, consumed statuses, conditional applications, Energy restoration, and cooldown changes.

The extended Brute section adds twenty-four active abilities across Fire, Bleed, Armor/Guard, and holy paths. Bash is granted by the Brute class node. Divine Smite, Consecrated Ground, and Beacon of Light are Ranged target-bound holy effects; the other Brute abilities are Melee or self-targeted and use distinct, non-blocking VFX. Its reusable mechanics include Armor from Strength and percentage Armor, Burn-driven permanent Initiative, combat-start statuses and absorption, Health-restoration and Guard triggers, Guard-derived damage, buff removal, Burn detonation and transfer, Bleed-damage healing, conditional hit counts, guaranteed and chance-based companion status applications, Guard derived from Armor, Physical Power, Spell Power, Max Health, and consumed status stacks, conditional Stun while Guarded, debuff cleansing, critical-strike status applications, immediate Burn/Bleed damage, and random multi-hit attacks.

The latest Brute paths extend beyond Furnace Breaker, Bloodbath, Shield Charge, and Divine Smite. Super Critical Burns makes every player-applied Burn also apply Charred. Word Above can apply Smite on critical strikes, Shatter Armor follows player-applied Stuns with Shatter, and Molten Metal applies Burn whenever the player deals direct or status damage while Guarded. Berserk grants Fierce after an enemy Critical Strike, Cannibal can heal from player-applied Bleed damage, and Renewal can reduce a random active cooldown whenever Health is actually restored. Further paths add Burn-reactive Barrier and Energy, combat-start Fierce, Guard, Barrier, Burn, and Martyrdom, Armor-scaling retaliation, Poison from Bleed, and the Guard, Vampirism, Fire Eater, and Beacon of Light abilities. Oath and Emberfused now extend the Spell Power and hybrid Power routes beyond Divine Smite and Furnace Breaker. Time to Breathe can trigger only once per combat when Health first crosses below 40%.

Smite is a three-turn debuff. Whenever the player actually restores Health, including through combat consumables such as Healing Potions, Phoenix Heart, or Panic, every living enemy with Smite takes Magic damage based on 50% of that restored amount at the same presentation event. Overhealing does not increase Smite damage.

Phoenix Heart prevents the first lethal hit in a combat only while the player is Burning, removes that Burn, and restores Health equal to the Burn's remaining damage. Charged Up grants a permanent combat stack worth +2 effective Initiative whenever the player applies Electrified, and turn order is recalculated when the stack becomes visible. Perfect Calculation bypasses the hit roll against enemies with at least 10 Arcane Wounds. Deep Chill rolls once per enemy attack, including misses and attacks fully absorbed by Guard or Barrier, for a 3% chance to Freeze the attacker; self-inflicted damage is not an attack. Elemental Fury deals 50% Spell Power as Arcane damage, then either seeds a clean target with its five configured debuffs or gains 50% damage per unique debuff already present.

Blinding Light gives every player-applied Electrified effect a 20% base chance, plus Luck's bonus to chance-based effects, to also apply Blind.

At the end of the player's turn, Poison resolves and normal status durations decrease.

Stunned always has one stack. Applying Stunned again can never increase its stack count, and Diminishing Returns blocks the application entirely.

### Enemy turn

At the start of an enemy's turn:

- The same start-of-turn status checks are resolved.
- The enemy regenerates its configured Energy Regeneration, up to its configured Max Energy.
- If it lacks the Energy required by its attack, it gathers Energy instead of attacking.
- If the player is Stealthed, the enemy cannot target the player.
- While Stealthed, the player's combat card becomes lightly translucent and displays animated shadow-smoke until the status expires.
- Otherwise it rolls Hit Chance against the player's capped Dodge Chance, spends Energy, attacks, and applies any on-hit effect.
- Every attack ability used by an enemy in a story encounter with a recommended level of 6 or higher rolls once for a 10% chance to apply Chained after at least one hit lands. Multi-hit attacks still roll only once, complete misses do not roll, and Guard or Barrier absorption does not prevent the application. Chained lasts for two player turns and disables **Flee** for its full duration.
- Enemies configured for several actions resolve each ability separately, including its own text, hit roll, damage, VFX, Energy cost, and Bleed trigger. Start-of-turn regeneration and end-of-turn Poison still happen only once.
- Enemies introduced from Arkenfall Highlands onward use data-owned tactical priorities rather than blindly repeating the first affordable ability. A priority can react to player or enemy Health, Energy, active or missing statuses, wounded allies, group size, and boss phase. When no priority applies, an explicit ordered or cycling fallback keeps the turn useful. Status-combo enemies first establish their condition and then use a payoff that deals its listed bonus damage; supports heal urgent targets before maintaining group protection; tanks and assassins prepare their defensive or evasive stance before their heavy answer.
- Adventure 4–12 bosses open a named setup, convert its status into a charged execution, protect themselves under pressure, and gain a unique low-Health phase below 40% Health. A reliable basic attack fills recovery turns so the boss does not become inert while the tactical sequence is on cooldown.
- Each Adventure 13–17 formation can include one innate Resilient support. Resilient caps cumulative Health loss at 50% of that enemy's maximum Health per initiative round, including direct hits, status damage, recoil, and triggered damage; the allowance resets only when a new initiative round begins. These supports prioritize a dead ally and resurrect it at 100% Health with its starting Energy, innate statuses, and fresh cooldowns before returning to large group heals and player debuffs.
- Enemy templates in Adventures 5–12 receive adventure-specific flat Armor and Magic Resistance bonuses after their generated base defenses. Each adventure's boss receives twice its regular-enemy bonus. The final Armor and Magic Resistance of every Adventure 7–12 enemy is then reduced by 50%; the exact values are listed in the Content reference.
- Forest Wisps repeatedly use Wisp Blast for random 50–100% Spell Power damage. Spending their final Energy applies Stunned through the same impact event, causing them to skip their next turn before gaining Diminishing Returns.
- Enemy turns do not add a separate floating turn announcement; the turn-order highlight advances with the preceding action's final event.

Bleed resolves after the enemy uses its attack. Poison resolves at the end of the enemy's turn, then durations decrease. If Stunned expires, its icon is replaced by Diminishing Returns at that same event. Status icons retain their pre-turn state while those events are queued; the duration ring updates or the icon disappears only when the final status event is shown and resolved.

### Targeting

- Dead enemies remain visible but cannot be targeted.
- Dead enemies immediately lose all displayed status effects.
- A dead enemy may return when an enemy resurrection ability resolves. Its Health, starting Energy, innate statuses, cooldowns, and turn eligibility are restored through the same presentation event.
- Stealthed enemies cannot be targeted. Their combat card uses a crosshair cursor, and clicking, tapping, or keyboard-activating it gives immediate local feedback without adding time to the combat sequence.
- A living, visible enemy with Taunt forces all single-target attacks to that enemy.
- The selected enemy retains the combat card's hover highlight and has a highlighted frame around the card. Its initiative entry also has a highlighted frame and target icon.
- Area abilities target all living enemies that are not Stealthed.
- Non-damaging area status abilities such as Poison Cloud apply to every target in one shared event, producing one floating status message and simultaneous status feedback on all affected enemies.
- Flurry chooses a new valid random enemy independently for every hit.
- Passives and on-hit effects create small local proc labels over the combatant they affect. Multiple passives affecting the same target at the same moment are combined into one label. Concurrent and rapidly following local labels fan upward along left, center, and right paths so they remain readable. These labels animate independently, never add sequence time, and never lock player input. The combat log records separate inspectable entries for the trigger and its results.

### Damage, status, and turn presentation

Combat calculations can prepare future results, but visible HP, status, and active-turn changes are delayed until their corresponding floating combat message is shown. Direct attacks start their lunge animation with the damage message and apply damage at the configured impact frame.

Damage events do not render central floating sentences. Damage is communicated by the large number over the affected Health bar, the Health-bar movement, and the combatant's impact reaction. Health never falls below 0, but a lethal hit still shows its complete calculated damage rather than only the target's remaining Health. This applies to damage dealt by both players and enemies. Normal attacks show only the number, critical attacks append **(Crit)**, and damage originating from Poison, Bleed, Burn, or Reckless appends the source in parentheses. A failed attack displays **Missed!** over the defender instead of a damage number, for both player and enemy attacks. The hidden sequencing event remains responsible for attack timing and state application; non-attack damage slots last only as long as the damage-number animation.

Player ability-use announcements such as **You use Strike** are also hidden. The selected ability remains recorded as an inspectable combat-log entry, while visible outcome messages such as gained statuses, healing, Energy, turn changes, and Victory remain in the central presentation. Enemy ability announcements remain visible.

Every hit of a multi-hit ability receives its own lunge and impact reaction. Animation speed is multiplied by the number of hits, so two hits animate at twice normal speed and the total motion time remains equal to one standard attack animation. Direct-hit floating messages use the same shortened slots, causing the hit animations to run consecutively without normal floating-text pauses between them.

This sequencing guarantees that:

- Damage appears when the attack lands.
- HP bars animate from the old value to the new value.
- Current/maximum Health and Energy values are centered directly above their respective combat bars on both desktop and mobile, while the resource names remain left-aligned.
- Statuses appear with the message that applies them.
- Enemies pulse green once when Poison is applied.
- Refreshing or adding stacks to an existing Poison also restarts that green pulse.
- Poison Cloud sends a fading green smoke burst across the complete enemy side while all affected enemies pulse together.
- Applying Bleed flashes the afflicted combatant red and sends temporary blood drops down across its card.
- Neurotoxin shakes and flashes its target green before the persistent yellow Stunned treatment remains visible.
- Toxic Explosion deals the Poison's remaining-duration damage immediately, then creates a toxic burst on its target at the damage impact.
- Venomborn pulls a Poison icon from its target toward the player and finishes with a green healing effect.
- Thunderstorm repeatedly calls white-cored, yellow-edged lightning from above the screen onto its random targets; Electrified targets take its configured 50% bonus damage.
- Charge removes Electrified with one visible arc from every affected enemy into the player, then sends a second arc from the player to each enemy when that enemy's damage resolves.
- Deep Freeze forms a dense frost seal directly around its target, while an already-Slowed target receives Stunned instead of another Slowed application.
- Arcane Overload uses an expanding violet charge burst and marks its target for a free Arcane Blast.
- Combustion erupts on its target. A lethal detonation sends visible fire trails to every surviving enemy before the copied Burn appears.
- Arcane Combustion collapses Arcane Wounds into a mixed arcane-fire impact, scaling both Fire damage and new Burn stacks from the consumed stack count.
- Lightning Beam reuses Charge's crooked white-hot lightning core and yellow corona, while Rapid Fire launches red, orange, and yellow beams of fire.
- Thundersnow combines frost and lightning feedback on every enemy simultaneously and selects one random target for Electrified.
- Self Immolation erupts simultaneously on caster and target under one shared Burn event; Arcane Barrier forms a violet shield seal; Frozen Path creates a fast icy trail; Conductor fills the enemy side with a synchronized lightning field while shocking the caster. Conductor's self-Stun closes the current turn and also skips the next player turn.
- Firestorm raises its field of flame across every enemy simultaneously and repeats its distinct eruption on the caster when self-Burn is applied.
- Blizzard drives fast snow and wind diagonally across the full enemy side, while Ride the Lightning's yellow field appears with its Stealth application.
- Elemental Fury connects to its target with layered frost, fire, lightning, and arcane beams. Focused Blast uses a deliberately broader, brighter arcane beam and impact flare.
- When an enemy uses a utility ability without an attack movement, its combat card gives a short horizontal casting shake while the ability VFX resolves.
- Charged troll attacks visibly prepare on one turn and strike on the next. Highfall support spells travel to their ally, the Bandit Enforcer's stolen Gold is shown at impact, and the Loot Goblin has a dedicated escape effect when it leaves combat.
- Frozen applications flash with an ice seal, and Frozen combatants retain a clear blue treatment until the control ends or damage breaks it.
- A combatant flashes yellow with visible lightning when Electrified is applied. This local effect does not add sequence time or delay the next action.
- Contagion animates a copied Poison icon from its selected source enemy to the random destination enemy.
- The turn-order highlight moves when the turn message is shown.
- Victory waits for the final death result and the **Victory.** message before the score screen appears.

### Victory and defeat

- Victory grants the current node's reward once and opens the score screen after all queued combat presentation is complete.
- The score screen animates experience once, shows gold, and allows access to the Character screen before continuing. Gear drops open the shared item-detail view; when a copy remains in Inventory, its normal Equip action is available directly from the score screen and follows all ordinary slot, Ring, One-Hand, Two-Hand, and replacement rules. Gear that already filled an empty slot automatically is recognized as equipped instead of exposing a duplicate Equip action. Returning from the Character screen shows the completed experience result immediately instead of replaying it. When the reward grants at least one level and Attribute or Talent Points remain unspent, **View Character** changes to a continuously highlighted **Level up!** button and the journey button remains gray and disabled. **Level up!** opens a focused two-step flow: **Next** remains hidden until all available Talent Points are spent, then the second **Next** remains hidden until all available Attribute Points are spent. Each button animates into view when its step is complete. Completing both steps returns to the same score screen, where the button is once again **View Character** and the journey action is enabled. The awarded-point summary is not duplicated in a separate panel.
- **Flee** is available during stable moments of an active combat unless the player is Chained. While Chained, the control reads **Chained**, explains why escape is unavailable, and the flee transition itself rejects the attempt. Outside that status, the control opens a game-owned warning with **Flee!** and **Fight!** choices. Confirming applies the losses and opens a mandatory result dialog showing the exact Gold amount and percentage lost plus the equipped item lost, or that no equipped item was lost. The character returns to Arkenfall Town only after acknowledging the result with **Okay.** They retain their current Health, abandon all progress in the active adventure, and must restart that adventure from stage one. Fleeing always loses a random whole percentage from 50% through 90% of current Gold, rounded up, and independently has a 50% chance to permanently remove one random equipped item when at least one item is equipped. Adventure-carried statuses, encounters, merchants, loot snapshots, and pending rewards are cleared.
- Panic prevents the first defeat in each combat: lethal damage is shown first, then the queued Panic event restores 20% of Max Health and grants Stealth until the end of the player's next turn. Later lethal damage in the same combat causes defeat normally.
- Defeat clears the save immediately and presents the permadeath screen.

## Energy and cooldowns

- Default Max Energy: 7.
- Default player Energy regeneration: 2 at the start of the player's own turn.
- Enemy Starting Energy, Energy regeneration, and Max Energy come from that enemy's definition.
- Energy cannot exceed Max Energy and cannot be spent below zero.
- A cooldown is measured in player turns and decreases only when the next player turn begins. The visible counter updates with **Your turn.**, never during the final enemy action.
- Remaining player cooldowns carry through events and into the next combat of the same adventure. Starting that encounter counts as the next player turn and reduces each carried cooldown by one. Starting, completing, fleeing, or otherwise leaving an adventure clears the carried cooldowns, so every new adventure begins fully refreshed.
- Focus clears every other cooldown, then keeps its own six-turn cooldown.
- Recuperate presents its cast and Energy restoration as one `You gain X Energy.` combat message.

The segmented Energy bar previews Energy that will be available after the next regeneration.

## Damage absorption

Guard is a temporary, stackable absorption status granted by several talents and abilities. Incoming damage removes Guard first; only the remainder reduces Health. Guard duration counts down at the owner's turn start, so normal Guard always expires when the owner's next turn begins for both players and enemies. An explicit Guard-duration bonus from a player talent or gear can extend it to later turn starts; enemy ability data cannot extend Guard.

Barrier is a visible, stackable absorption buff that lasts three turns. Its stack counter is the remaining Barrier amount, and a persistent shimmer covers the protected combatant. Incoming damage consumes Guard first, then Barrier, then Health; the shimmer pulses whenever Barrier absorbs damage. Barrier protects against both direct and status damage, and its amount changes at the same floating-text event as the damage.

An ability marked to ignore absorption, currently Sharpened Blade, bypasses both Guard and Barrier without consuming either status.

Avoidance reduces all incoming direct and status damage by 3% per currently unspent Energy. The multiplier is recalculated whenever damage resolves, so spending Energy also reduces its protection.

## Status system

Unless specified otherwise, statuses last three turns. The status icon uses a fixed three-segment duration ring: elapsed segments become empty and the remaining segments never stretch to fill the missing space. Stack count is shown separately in the icon.

Applying a status that is already present:

- Adds stacks when the status is stackable.
- Keeps the greater remaining duration instead of adding durations.
- Keeps the greater source power.
- Refreshes the source ID to the latest applier when provided.
- Non-stackable statuses, including Stealth, always retain exactly one stack when reapplied.
- Stealth always expires at the end of its holder's next turn. If an enemy casts Stealth in round 1, it remains protected through that enemy's round-2 turn and loses Stealth when that turn ends. Its status tooltip states that endpoint directly using “your” for the player and “their” for an enemy instead of showing the internal turn counter. Its shared creation, refresh, and turn-end normalization rejects longer explicit or legacy durations, so player and enemy Stealth can never last three turns. Ending a turn reconciles duration changes even when no damage or status message was queued, and a status applied and decremented during the same enemy action is replaced with the authoritative post-turn duration instead of being refreshed back to the larger displayed duration.

- Nullify and Disarm last until the end of the affected player's next turn. Nullify multiplies Spell Power by 0.1, while Disarm multiplies Physical Power by 0.1; both results are rounded to whole Power before abilities, statuses, and triggers resolve.

Detailed status definitions and formulas are in [Content reference](CONTENT_REFERENCE.md#status-effects).

### Damage-over-time formulas

All status damage is rounded to a whole number after multiplying by stacks.

```text
Bleed per stack  = 1 + source Physical Power × 0.075
Poison per stack = 1 + source Spell Power × 0.1125
Burn per stack   = 1 + source Spell Power × 0.10
```

- Bleed triggers whenever the afflicted combatant uses an ability or enemy attack.
- Poison triggers at the end of each afflicted combatant's turn.
- Burn triggers at the start of each afflicted combatant's turn.
- Bleed is Physical damage, Poison is generic Spell Damage, and Burn is Fire damage.
- Armor is 50% effective against each combined Bleed trigger. Magic Resistance is 50% effective against each combined Poison or Burn tick.
- The status stores the applier's power when applied; later stat changes do not rewrite an existing status's source power.
- Player Poison damage can be modified by talent bonuses such as Toxicology and Virulence.
- Leech restores Health equal to 5% of actual Health damage dealt by player-applied Poison ticks or detonations, rounded up and limited by missing Health.

Regenerate uses:

```text
healing per stack = 3 + source Spell Power × 0.20
```

The result is then multiplied by the target's healing-received multiplier and limited by missing Health.

## Arkenfall Town

**Arkenfall Town** is the persistent non-adventure main hub shown after the new-character introduction and whenever no adventure is active. Its five top-level destinations are **Adventures**, **Shops**, **Tavern and Inn**, **Quest Board**, and **Grand Arena**. Adventures opens the story-route list and returns to Town without starting a stage or travel transition. Completing an adventure shows **Return to Arkenfall**, which closes the completed run and returns directly to the Town square rather than the adventure list. Shops opens a second town menu containing all five artisans. Opening Character from Town temporarily preserves the exact Town location, vendor tab, sorting, and page scroll; returning with the Town navigation restores that session rather than sending the player to the square. During an active run the main navigation continues to return to that adventure instead of allowing Town access. The generated town artwork uses crop-safe focal points for desktop and narrow mobile screens. Vendor backgrounds are viewport-locked so changing between Shop, crafting, and Sell tabs cannot alter their zoom: the Blacksmith keeps its tighter crop, the Alchemist keeps its wider crop, and the Tailor, Leatherworker, and Jeweler use centered cover crops. The environment image itself remains still; only separate ambient particles and interface entrances animate, with reduced-motion fallbacks.

The **Grand Arena** contains the safe **Challenge Arena Champion** damage trial. The champion has 1,000,000 Health, no defenses, and answers once per turn with **Contemptuous Tap**, a one-base-damage Physical attack. The trial ends after the player's tenth completed turn or when either combatant reaches zero Health. Ending it early records the current result. Experience equals 20% of the actual Health removed from the champion, rounded down to a whole number, and is granted exactly once. Damage is stored with the character's level and turns used; the arena menu lists the ten highest saved results and their corresponding Experience. The arena starts the character at full Health, does not consume prepared next-combat meal effects, disables combat consumables, restores the pre-trial carried Health when leaving, and never invokes permadeath. A fresh character has no arena attempt. Completing each story adventure for the first time restores one attempt; replaying an already completed adventure never restores it, and attempts do not accumulate beyond one.

- **Blacksmith — Brunhilde von Trott** has **Shop**, **Crafting**, and **Sell** tabs. Shop purchases deduct the item's configured Gold Cost and add a fresh copy to Inventory. Crafting consumes the exact item quantities in the selected recipe and adds one crafted item; every recipe-card action is labelled **Craft**. Successful purchases, crafting, and sales use centered, non-blocking text that rises and fades, with the item name in its rarity color. Errors remain in the vendor's regular feedback panel.
- **Alchemist — Ray Charlston** has **Shop**, **Brew**, and **Sell** tabs. Purchases use the same persistent Inventory/gold rules, while Brew uses recipes assigned to the Alchemist. Selected vendor-service tabs use the shared gold interface treatment at all five vendors.
- **Tailor — Mirelle Threadgold** has **Shop**, **Tailoring**, and **Sell** tabs for editor-assigned cloth goods and recipes.
- **Leatherworker — Torren Hidehand** has **Shop**, **Leatherworking**, and **Sell** tabs for editor-assigned leather goods and recipes.
- **Jeweler — Celestine Veyra** has **Shop**, **Jewelcrafting**, and **Sell** tabs for editor-assigned gems, rings, and recipes.
- **The Resting Hart** tavern sells lodging and meals. Each Gold spent on resting restores up to 5 missing Health. Full recovery costs the missing Health divided by five, rounded up; when the character cannot afford that amount, resting spends all available Gold and restores as much Health as it can. Resting is disabled only at full Health or with no Gold. Ironpot Stew, Peppercrust Boar, and Hartroot Broth respectively queue Strengthened, Fierce, or Regenerate for the next combat. A successful meal order uses the same centered, rising-and-fading confirmation as a vendor purchase instead of the inline feedback panel; errors remain inline. A prepared meal benefit is consumed when that combat begins, persists across an event that occurs before the combat, and cannot be purchased twice while already queued. **The Gilded Dice** accepts wagers of 5, 10, or 25 Gold. It rolls d100 and adds the character's current derived Luck; success returns twice the stake, for a net gain equal to the wager, while failure loses the stake. The internal target begins at 55 and increases by 6 after every resolved wager. Neither the target nor its increase is shown to the player. The attempt count persists through navigation and saving and resets only when any story adventure, including a replay, is completed.

Town vendor stock is repeatable rather than single-stock: unlike a Wandering Merchant, buying an item does not permanently remove its listing. Every Arkenfall vendor's **Sell** tab lists the character's current Inventory, removes one copy per sale, and pays 25% of Gold Cost rounded down, with a minimum of 1 Gold for a positive-value item. Equipped gear is not in Inventory and must be unequipped before it can be sold. Item names use their rarity color in both permanent and Wandering Merchant shops: Common white, Uncommon green, Rare blue, Epic purple, and Legendary orange. Every transaction is saved through the normal `GameState` autosave. Recipe cards show owned and required material counts, and cannot be used until every requirement is met. Items and materials are ordinary Inventory copies, so equipped gear is not consumed as a crafting ingredient.

The illustrated **Quest Board** is a separate town destination. It shows at most six postings: every accepted or ready quest first, each questline's current frontier, and then a limited preview of what follows. Completed postings only return as backfill when no unfinished work can fill the board. A character can track at most six accepted quests at once. A posting shows its title, description, goal, current progress, XP, and every item reward before it is accepted. Reward items are clickable and open the same game-owned item-detail view used elsewhere, including live gear stats, consumable effects, rarity color, and description. Quests are accepted and turned in only at the board. Supported goals are defeating a quantity of one enemy template, carrying a quantity of one item, or completing a selected adventure a number of times. Kill and adventure progress starts after acceptance; item progress reads current Inventory and the requested copies are removed on turn-in. Finishing a goal marks its posting ready but does not grant rewards until **Turn In Quest** is used. XP and independent item copies are granted once. Questlines unlock in their configured order only after the previous quest has been turned in; quests outside a questline are immediately available.

The live catalog contains 49 quests in four questlines. **Storehouse Troubles** remains the introductory Windsong chain. **Guild Requisitions** spans the original twelve adventures. **The Roadwarden's Ledger** and **The Chronicle of Arkenfall** continue through all seventeen adventures with one local enemy bounty and one completion report per chapter. Their quantities and rewards rise with campaign difficulty, and the final Chronicle report awards a Grave Communion set piece.

Items may independently be sold in Arkenfall, craftable, both, or neither. Item Editor selects the Blacksmith, Alchemist, Tailor, Leatherworker, or Jeweler as the vendor and crafting location, together with ingredient items and quantities. Shop stock and recipes each have their own optional completed-adventure requirement, selected by adventure name. A gated item is omitted entirely from its corresponding Shop or crafting list until the character has completed that adventure, and the transaction layer enforces the same requirement. Saving through the local Vite server validates every referenced item, vendor, station, and adventure before replacing the live catalog.

The canonical story route uses that same requirement system as a persistent shop-progression track. Completing any of the twelve story adventures immediately adds exactly two new items to each artisan's Shop: two Blacksmith pieces, two Alchemist consumables, two Tailor pieces, two Leatherworker pieces, and two Jeweler rings. Earlier listings remain available, so a fully progressed character has gained 24 additional choices at every vendor. Stats, prices, rarity, consumable strength, and unique effects rise with the recommended level of the cleared adventure. Nine selected artisan pairs form two-piece sets. The Jeweler track contains 24 rings for the live Shadow, Arcanist, and Brute build families; no ring has a class restriction, but each carries a distinct executable `CombatFeatureBundle` effect that supports a particular specialization. Uncommon stock covers the opening route, Rare stock follows through Nightglass Citadel, Epic stock begins after Frostbound Expanse, and Legendary stock begins after The Astral Scar.

In addition to the two-item-per-vendor core track, the Jeweler sells eight adventure-crafted magical arms after their corresponding Adventures 4, 6, 7, 8, 9, 10, 11, and 12 clears. These Wand, Staff, and Tome upgrades retain their existing Jewelcrafting recipes and give Spell Power builds a visible shop progression.

## Adventures and events

Opening **Adventures** from Arkenfall Town uses a short cinematic curtain reveal, followed by the heading and illustrated adventure cards arriving in a staggered sequence. Narrow mobile layouts retain the same rhythm with a stacked heading, while reduced-motion preferences skip the transition entirely.

The current story route contains seventeen adventures. **Windsong Forest**, **Arkenfall Highlands**, and **Highfall Mountains** form the opening route. Adventures 4–12 then continue through **Mirefen Marsh** (level 13, 12 stages), **Ashen Foundry** (level 18, 13), **Sunken Reliquary** (level 23, 14), **Nightglass Citadel** (level 28, 15), **Frostbound Expanse** (level 34, 16), **Stormspire Aerie** (level 40, 17), **The Hollow Crown** (level 46, 18), **The Astral Scar** (level 49, 20), and **The World Below** (level 50, 22). Adventures 13–17 are five-stage endgame assaults at levels 54, 58, 62, 66, and 70. Each has one event, five dedicated tactical enemies, a boss on stage five, and original card, combat, full-enemy, and portrait art. Every formation heals aggressively and applies player debuffs. One support enemy per chapter begins with Resilient and can resurrect a dead ally at 100% Health. Every biome uses dedicated illustrated selection and combat backgrounds with crop-safe focal points and `cover` sizing so its scene remains readable on desktop and narrow mobile screens. Each stage may contain any number of combat, boss, or event possibilities with configured percentage weights. The selected possibility is stored in adventure progress, so refreshing cannot reroll the active stage. See the live progression tables in [Content reference](CONTENT_REFERENCE.md#late-campaign-adventures).

Remaining Health carries from one stage to the next and remains after an adventure ends. Starting another adventure uses that carried value rather than automatically healing the character; the value is clamped to current Max Health. A fresh character begins at full Health, and the Arkenfall tavern is the normal between-adventure recovery source. Attempting to begin an adventure below full Health opens a game-owned warning showing current and maximum Health. **Yes** continues with the carried Health, while **Go to Tavern** opens The Resting Hart directly; dismissing the warning leaves the player on the adventure list. Starting an adventure and moving between stages both show the animated footsteps transition first, using that adventure's **Travel loading text** from Adventure Editor. A story combat then fades in the selected Adventure Editor entry's Description; if that field is empty, the game falls back to generated enemy-count wording. As initiative begins, that introduction follows one continuous eased movement from the center to its resting position below the roll. It fades out in sync with the initiative cards flying up into the turn-order row. Events do not show a generic discovery announcement after the footsteps. They move directly into their dedicated presentation. An immediate encounter caused by an event outcome skips the footsteps and travel text entirely, but still uses generated enemy-count wording before and during initiative. Completed adventure IDs are stored on the character and can satisfy another adventure's prerequisite. A completed story adventure remains in the adventure list with a large green checkmark and **Completed** and may be replayed. Every positive XP reward during a replay—including combat, immediate encounters, and event outcomes—grants 10% of its original amount, rounded down. Combat gold rewards, including immediate encounters, grant 50% of their original amount, rounded down. Event-outcome gold and item drops are unchanged.

Events use a black full-screen sequence without an event icon, category label, or adventure-progress header. A compact **Inventory & Gear** button remains in the safe top-right corner throughout the event, allowing newly found or purchased gear to be reviewed and equipped before the journey continues. The title fades into the center and moves upward before the scenario fades in. Two or three label-only choice buttons then appear one at a time; they contain neither icons nor advance descriptions or roll requirements. Each choice may use a d100 attribute check or a direct outcome. Checked choices replace the buttons with their description while a d100 counter cycles in the same style as initiative; the raw die locks, the selected derived-attribute bonus is added, and success or failure fades in last. Direct choices skip the die entirely and show the selected action description. The resolved narrative is followed by a bordered **Outcome** panel that lists the exact applied Health, Gold, XP, point, item, automatic-equipment, next-combat status, and immediate-encounter changes before the journey continues.

Event outcomes contain any number of typed effects. Positive outcomes can restore Health, grant gold, items, experience, Talent Points, or Attribute Points, give the player a buff in the next combat, begin the next combat with enemies debuffed, or open a Wandering Merchant with an editor-selected item catalog. A direct merchant choice opens its configured stock immediately; if that outcome also applied non-merchant changes, those changes appear in a compact Outcome panel above the stock. Negative outcomes can remove Health, gold, or current-level experience, give the player a debuff in the next combat, begin it with enemies buffed, or launch an immediate encounter with its own XP and gold reward. Direct outcomes may combine either category. Health remains between 1 and Max Health, gold and current-level experience cannot fall below zero, and losing experience never removes a completed level. The event result persists the applied values rather than only the configured values, so capped Health or Gold loss, replay-adjusted XP, acquired gear and its automatic slot remain accurate after a refresh. Queued statuses persist through intervening events and are consumed when the next combat is created; an immediate event encounter counts as that combat.

## Experience and levels

Experience required for the next level is:

```text
100 + (current level - 1) × 50
```

Excess experience carries into later levels, and one reward can grant multiple levels. Each gained level awards:

- 3 attribute points.
- 1 talent point.

Level 70 is the maximum level. Characters at level 70 no longer accumulate experience, and older saves above the cap are normalized to level 70 when loaded.

Attribute points can be assigned one at a time to any of the five base attributes from the Character screen. Positive unspent Attribute Point and Talent Point counters pulse with a slow gold text glow and a separately faded aura on their respective screens; the score-screen **Level up!** treatment uses the same continuous rhythm without scaling, brightness jumps, or discrete shadow changes. While Talent Points remain, the **Talents & Abilities** Character tab uses the same pulse to direct the player to the tree. The Character hub has separate **Character**, **Equipment and Inventory**, and **Talents & Abilities** submenus. Attribute allocation, talent changes, ability loadout changes, and equipment changes are locked during active combat.

## Talents and ability loadout

The talent tree is classless. Wayfarer's Spark begins at the center, and the first four directions are Brute, Shadow, Arcanist, and Cultist. The live tree currently has 263 nodes: Shadow, Arcanist, and Brute each have 87 including their class node, and Cultist has 1. Shadow is the first complete branch. Arcanist extends from Arcane Mind into Fire, Frost, Lightning, Arcane, Spell Power, Intelligence, Hit Chance, and Critical Strike paths. Brute extends through Fire, Bleed, Armor/Guard, holy-vigor, Spell Power, and hybrid Power paths. Shadow also includes new Physical Power, Agility, Intelligence, and Spell Power routes.

### Unlock rules

- A node costs its configured number of talent points.
- Talent connections are bidirectional. If either node stores the connection, unlocking either end can make the node at the other end available.
- Any one connected node is always enough; there is no alternate requirement mode.
- After one non-origin class node is unlocked, the other class nodes remain locked until character level 10. At level 10, their normal connection and Talent Point requirements apply again.
- Unlocked non-Origin nodes can be refunded outside combat and guided level-up screens when removing them would not disconnect other unlocked nodes from Origin. Respec returns the node's Talent Points, costs Gold, and becomes 100 Gold more expensive after every refunded node.
- Unlocking an ability talent automatically equips the ability if fewer than six abilities are equipped.

### Loadout

- The combat loadout has six slots.
- Abilities become available through unlocked talent nodes and can be equipped or removed outside combat.
- The Talent Tree shows a compact **Equipped Abilities** button instead of permanently displaying all six slots. The button opens the loadout in a game-owned modal. Selecting any equipped or empty slot there opens the in-game ability picker. An occupied slot can replace or swap its ability with another equipped slot, while **Unequip Slot** removes its current ability.
- Ability descriptions are resolved from the character's unlocked talents. Combat tooltips, talent details, the loadout picker, and new combat-log entries therefore describe the modified effect rather than the ability's original base effect.
- Enemy misses, newly applied statuses, and newly applied Stuns are reusable passive-trigger events. Recovery, Spotting Opportunity, Biding Time, Break, Mischief, and Comparative Momentum attach their results to the triggering combat moment without slowing the event sequence.
- Combat tracks whether the player has taken damage or missed since combat began. Elemental Surprise and Confidence read those combat-scoped flags rather than checking talent IDs in the engine.
- Weight of Frost uses the shared passive-stat pipeline to add 5% of current Armor, rounded up, as flat damage to each direct hit.
- Talent nodes show only name and type on the map; selecting a node opens its full information and unlock controls. Outside combat and guided level-up screens, an unlocked node can be refunded for Gold when doing so would not disconnect another unlocked node from Origin. The first refund costs 100 Gold and every refunded node permanently raises the next price by 100 Gold; its Talent Points are returned and a granted equipped ability is removed from the loadout.
- Circular passive nodes are 25% smaller than square class/ability nodes. Unlocked nodes receive a gold outer outline, and the connection layer is masked beneath every node so lines cannot show through transparent locked nodes.
- The **Equipped Abilities** control sits at the top and the tree itself fills the remaining unframed Talents page. Its Talent Point counter is overlaid without an extra label. Desktop wheel input is captured by the tree and eases continuously into zoom around the center of the talent-tree viewport without vertically scrolling the tree or page; left-drag or middle-button drag pans. On touch screens, one-finger drag pans. Pinch zoom is disabled and two icon-only magnifying-glass controls zoom out or in by 20 percentage points around the center of the visible tree; no numerical zoom meter is shown. A generous world-space margin plus a fixed screen-space gutter surrounds every outer node, so all sides remain reachable while panning and the visible edge clearance does not disappear when zooming out. A drag may begin on a node without selecting it, while a stationary click or tap only opens that node. Unlocking always requires a separate press on the button inside Talent Details. Talent details close from the top-right cross.

The complete current tree is listed in [Content reference](CONTENT_REFERENCE.md#talent-tree).

## Equipment and inventory

Equipment and inventory share their own **Equipment and Inventory** submenu inside the Character hub. The Character submenu is reserved for Attributes and derived combat stats.

Item artwork is resolved through the canonical item definition and the shared item-icon catalog. Once an item ID is present in that catalog, the same optimized square WebP follows it through equipped slots, Inventory cards, item details and comparisons, combat consumables, merchants, crafting requirements, and score-screen loot. Adding an item definition alone is not enough: newly authored items must also receive an icon asset and a shared catalog entry, and the item-icon regression test enforces that contract.

Consumables and Other Items can select any generated item artwork in the Item Editor. The selected image is part of the canonical item definition and therefore follows the item through every runtime surface after Save.

Items use five ordered rarities: **Common**, **Uncommon**, **Rare**, **Epic**, and **Legendary**. Every player-facing item name always uses its rarity color: Common white, Uncommon green, Rare blue, Epic purple, and Legendary orange. This is a global presentation rule across score-screen loot, Inventory, equipment, details and comparisons, combat consumables, merchants, and crafting requirements. Legendary is the highest rarity and uses a warm gold-orange presentation wherever item rarity is shown.

### Slots

The character has eight equipment slots:

- Head
- Chest
- Pants
- Boots
- Main Hand
- Off Hand
- Ring I
- Ring II

### Weapon hand rules

| Classification | Equipping rule |
| --- | --- |
| Main Hand | Can only be equipped in Main Hand. |
| One-Hand | Can be equipped in Main Hand or Off Hand. |
| Off Hand | Can only be equipped in Off Hand. |
| Two-Hand | Equips in Main Hand, moves the previous Main Hand and Off Hand items to inventory, and locks Off Hand. |

Equipping a replacement returns the previously equipped item to inventory. Unequipping returns the item to inventory. Rings can be placed in either ring slot.

Whenever gear is newly acquired from loot, a reward, a merchant, crafting, or the developer tools, it automatically fills an empty compatible equipment slot. This never replaces equipped gear. Rings fill Ring I before Ring II, One-Hand weapons fill Main Hand before Off Hand, and Two-Hand weapons equip only when both hands are empty. If no compatible slot is free, the item enters Inventory instead. Consumables and ordinary items always enter Inventory.

### Armor materials and weapon kinds

Armor can be Plate, Leather, or Cloth. Weapons currently support Sword, Axe, Mace, Dagger, Wand, Shield, Tome, Staff, and Polearm icon/category variants.

### Item presentation

- Rarity levels are Common, Uncommon, Rare, Epic, and Legendary.
- Item names use their rarity color in inventory, equipment, details, and comparison.
- Item cards show identity and flavor, while all mechanical stats appear in the item details modal.
- Stats are sorted alphabetically and use stat icons.
- A compatible equipment slot opens a filtered list of equippable inventory items.
- Compare shows the equipped and candidate items with green positive and red negative differences. It remains available when inspecting gear from loot, Wandering Merchants, Arkenfall shops/crafting lists, Sell lists, and quest rewards; those read-only surfaces do not expose Equip actions.
- Item and equipment modals lock background scrolling.
- Inventory can be filtered by item type or gear category and sorted by rarity or name. Gear cards, equipment choices, town stock, loot, and details also show a compact **Rating** derived from the item's direct visible stat budget, so nearby upgrades can be compared without opening every item.
- Every item has an editor-owned Gold Cost used by Wandering Merchants.
- Every item may optionally select an Arkenfall vendor and a crafting recipe. Recipes name the Blacksmith, Alchemist, Tailor, Leatherworker, or Jeweler and require one or more live items with whole-number quantities.
- Ordinary items are carried in Inventory but cannot be equipped or used in combat. They have their own **Other Items** filter and may still be granted, dropped, bought, or sold.

### Combat consumables

During the player's turn, **Inventory** opens a combat-owned consumable list whose compact header also shows the character's current gold. At most one consumable can be used per player turn, and it also spends one of the six player actions. Using an item enters the same FIFO action queue as abilities, removes one copy at resolution, plays local VFX, and does not end the turn. Items may restore Health or Energy, change next-turn Energy regeneration, add or remove Energy, deal fixed damage to the player, selected enemy, or every enemy, apply any existing buff or debuff, or remove one named status from those targets. Selected-enemy effects use the target captured when the item is queued and cannot target Stealthed enemies. Damage, healing, Energy, status application, and status removal become visible together at the item's presentation event. While Frozen, abilities and unrelated items remain blocked, but the turn stays open for **End Turn** or a self-remedy that removes Frozen; this makes Thawing Aurora usable when it is needed. Mirefen Antivenom removes Poison, Cooling Salve removes Burn, and Coagulant Bandage removes Bleed.

### Gear sets

Set items show all thresholds for their own set. Fulfilled thresholds are green; unfulfilled thresholds are gray. Items without a set show no set section. Only equipped pieces count toward active set bonuses.

The Highfall four-piece thresholds use class-shaped combat triggers rather than another static stat increase: Nightveil turns Critical Strikes into temporary Dodge Chance, Trollforged creates a small once-per-turn Guard response after Health damage, and Runewoven restores a limited amount of Energy from Magic damage.

Adventures 4–9 each introduce two five-piece sets, while The Hollow Crown, The Astral Scar, and The World Below introduce three each. Every late set unlocks executable bonuses at 2, 3, 4, and 5 pieces. The final threshold always changes a build interaction such as Poison, Burn, Bleed, Wet/Electrified, Stealth, Frozen, Guard, Vulnerable, or Arcane Wound rather than granting only another flat stat.

Windsong Forest also supplies three introductory two-piece sets. Thornbark Bulwark, Galehide, and Wispwoven each grant +1 Vitality when both pieces are equipped.

The current set catalog is summarized in [Content reference](CONTENT_REFERENCE.md#gear-set-bonuses).

## Loot and gold

Adventure combat rewards always define experience and gold and may additionally award items from two independent sources. Every defeated enemy instance rolls every row in its own drop table, then the current stage rolls every row in its stage drop table once. Each row uses its configured 0–100% chance independently, so a victory can award several items or none. An enemy drop table may contain the same item on several rows; every repeated row receives its own roll and can therefore award another copy. Repeated copies of the same enemy also receive their own complete set of rolls. Enemies that escape rather than being defeated award no enemy loot and do not advance kill quests. Dropped gear immediately fills an empty compatible equipment slot when possible; all other drops enter Inventory. Identical drops are grouped on the score screen as one row with a quantity, including gear that was equipped automatically, and dropped gear can be selected there to open its complete read-only item details. Adventures 4–12 use a 50% lower configured XP curve for every combat, boss, and event-triggered immediate encounter than their original generated values; the reduction is already stored in each live reward and is applied before the separate 10% replay multiplier. Direct event XP and Quest Board rewards are not enemy rewards and remain unchanged. Adventures 4–7 award Uncommon or Rare progression loot; Epic gear and materials begin in Adventure 8. Legendary set pieces and weapons begin dropping in Adventure 11, while its local crafting materials remain Epic.

Each adventure from Mirefen Marsh onward drops three local crafting materials. Its two weapons and the ring from every local five-piece set have typed recipes, and those recipes remain hidden and transaction-blocked until that same adventure has been completed. This makes the first clear the source of crafting access while replay drops support finishing or replacing the crafted loadout.

Gold is stored on the character and displayed in the top bar, the in-combat **Inventory**, reward screens, and Wandering Merchant view. Event outcomes may open a merchant stocked with any live items selected in Event Manager. The merchant's **Buy** tab deducts the item's live Gold Cost and immediately grants its single stocked copy; gear fills an empty compatible equipment slot when possible and otherwise enters Inventory. The purchased card plays a short acquisition animation before its persistent slot becomes **Out of Stock**. Gear in either merchant tab can be selected to open its complete item details. The **Sell** tab lists every item currently in Inventory and removes one copy per sale. Sell value is 25% of the item's Gold Cost, rounded down to whole Gold, with a minimum of 1 Gold for any item whose Gold Cost is above zero. Equipped gear is not part of Inventory and therefore cannot be sold until unequipped.

## Saving and reset behavior

- The game automatically writes the full `GameState` to browser `localStorage` under the legacy compatibility key `emberfall-save-v1` after state changes.
- Refreshing or reopening the same site origin restores the character and in-progress adventure.
- Saves are local to the browser profile and exact site origin; they are not cloud-synced.
- The reset button uses a game-owned confirmation dialog and deletes the save.
- Defeat deletes the save without retaining a recoverable character.
- Loading migrates older avatar, equipment metadata, removed talent refunds, two-hand/off-hand conflicts, ability loadouts, introduction state, and reward state where possible. Saves created before the introduction existed remain complete and are not redirected into it.

Developer Talent, Enemy, Event, Adventure, Item, Quest, and Portrait Editor drafts use separate local-storage keys and are not deleted by the normal game-save reset. The developer launcher can also advance the current character by exactly one normal level, including the normal three Attribute Points and one Talent Point, or add 1–99 copies of any live item directly to the saved Inventory. Level grants are unavailable during active combat and stop at level 70; item grants remain available for consumable testing. Quest Editor creates complete quest and ordered questline catalogs with enemy/item/adventure goals plus XP and item rewards. While the local Vite server is running, Event Manager, Adventure Editor, Item Editor, and Quest Editor Save validate and replace their complete canonical live catalogs. Restricted fields for existing enemies and existing talent/ability pairs use narrower direct writes; enemy ability mechanics still require implementation. Free-form item/set special notes are saved and exported but remain non-executable until implemented. Portrait crops use source-image percentage coordinates so the same selection renders consistently across desktop and mobile editor sizes.
