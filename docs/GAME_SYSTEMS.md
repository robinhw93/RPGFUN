# Game systems

This document describes the rules currently implemented in Arkenfall. Percentages are written as player-facing percentages even though the code stores them as decimals.

## Core loop

1. Create and name a character, then choose one of ten appearances.
2. Review equipment, allocate earned attribute points, choose talents, and prepare up to six active abilities.
3. Begin **Windsong Forest**.
4. Resolve its weighted combat and event stages while carrying remaining Health between stages.
5. After each victory, receive experience and gold on the score screen.
6. Adjust the build between fights.
7. Defeat the Forest Spirit and its two Wisps to complete the current adventure.

Death is permanent. When combat reaches defeat, the browser save is deleted. The defeat screen returns the player to character creation, and the previous character, equipment, talents, and adventure progress cannot be recovered through the game UI.

### Shadow Proving Grounds

The adventure screen also offers a separate endless testing route for developing and validating Shadow builds:

- Every fight contains a newly randomized group of two or three DUMMIES.
- Each DUMMY has 100 Health, no defense or Dodge, and a 95% Hit Chance training attack with 1 base Physical damage.
- Every victory awards exactly two complete levels, including six attribute points and two talent points.
- Training victories award no gold.
- Health is restored to the character's current maximum before the next training fight.
- Talent nodes can be unlocked for free while this testing route is active. Requirements between nodes and the active-combat lock still apply, and the character's saved talent-point total is not reduced.
- The victory screen links directly to Character and Talents so the player can allocate points, unlock talents, and change the six equipped abilities before continuing.
- Training can be left safely from the victory screen without losing the character or earned progression.
- The route has no final encounter; its fight counter continues until the character dies or another adventure is started.

## Character creation and starting state

Character creation requires a non-empty name and an appearance. Appearance has no mechanical effect.

Every new character starts with:

- Level 1 and 0 experience.
- 18 gold.
- 3 talent points.
- No unspent attribute points.
- Wayfarer's Spark unlocked.
- Strike and Guard equipped.
- Strength 5, Agility 5, Intelligence 5, Vitality 5, and Luck 5.
- No equipped gear and an empty inventory.

## Attributes

Attributes are whole numbers. Equipment and flat talent bonuses are added to base attributes, percentage attribute bonuses are then combined additively and applied, and the result is rounded before derived stats are calculated.

| Attribute | Current effects |
| --- | --- |
| Strength | +1 Physical Power per point and +1% Guard gained per point. |
| Agility | +0.3 Physical Power, +0.5% raw Hit Chance, +0.4% Dodge Chance, and +0.5 Initiative per point. |
| Intelligence | +1 Spell Power and +0.25 Initiative per point. |
| Vitality | +10 Max Health and +0.5% healing received per point. |
| Luck | +0.75% Critical Strike Chance, +1% loot-rarity bonus, and +0.25% to explicitly chance-based combat triggers per point. |

Luck does not turn guaranteed effects into random effects. Its special-effect bonus is only added to triggers that already define a chance.

## Derived stats

All displayed stats are rounded to whole numbers. Percentage values are displayed as rounded whole percentages.

| Stat | Current rule |
| --- | --- |
| Max Health | `Vitality × 10` |
| Max Energy | `10 + flat bonuses` |
| Energy Regeneration | `2 + flat bonuses` at the start of the player's turn. |
| Physical Power | `(Strength + Agility × 0.3 + gear/talent Physical Power) × (100% + Physical Power bonuses)` |
| Spell Power | `(Intelligence + gear/talent Spell Power) × (100% + Spell Power bonuses)` |
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
- Temporary Dodge effects are added before the 50% Dodge cap. Evasion therefore reduces a 95% Hit Chance enemy to 45% final Hit Chance while active.
- Blind multiplies the afflicted combatant's raw Hit Chance by 25% before Dodge is subtracted. The normal 20% minimum final Hit Chance still applies.

### Critical strikes

Direct attacks roll Critical Strike Chance after a successful hit. A critical strike multiplies the pre-status direct-damage value by 1.6. Critical Strike Chance itself is uncapped, so a value of 100% or more always critically strikes.

## Damage types and defenses

The implemented damage types are Physical, Arcane, Shadow, Fire, Frost, and Lightning.

| Damage type | Offensive power | Defense |
| --- | --- | --- |
| Physical | Physical Power | Armor |
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

Each enemy ability defines flat damage plus Physical Power and/or Spell Power scaling. Enemy abilities use a lighter defense reduction:

```text
ability damage + enemy Physical Power × physical scaling + enemy Spell Power × spell scaling
  - floor(player defense × 0.35)
```

The result has a minimum of 1 before critical and status modifiers. Guard then absorbs damage before Health is lost. Every enemy ability also declares whether it is Melee or Ranged. Melee attacks use the combat lunge; Ranged attacks use a flavor-specific projectile, beam, or target effect.

## Combat flow

### Combat start

- The player enters with carried Health, limited to current Max Health.
- Player Energy starts full.
- Every enemy starts at its configured Max Energy.
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

The initiative UI rapidly cycles random values, locks the raw rolls, applies bonuses, then animates the final cards into the turn-order row. The current timing values are documented in [Architecture](../ARCHITECTURE.md#initiative-presentation).

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

Using an ability never ends the turn automatically. The player presses **End Turn** when finished.

If the player becomes Stunned, Frozen, or Sleeping during their own active turn, further abilities are blocked but **End Turn** remains available. This lets self-control effects such as Conductor finish the current turn normally; the status still skips the next turn according to its usual rules.

When Stunned ends for either the player or an enemy, that combatant immediately gains Diminishing Returns for 3 turns. Diminishing Returns prevents every new Stunned application, including ability effects, passive procs, copied debuffs, and Electrified's turn-start chance. Its full three-turn duration begins after Stunned is removed, so the turn that consumed Stunned does not also consume a Diminishing Returns turn.

Ability input remains available while an earlier ability is animating. Further ability presses are added to a first-in, first-out queue and execute as soon as each preceding combat sequence and return animation finishes. The queue reserves Energy and cooldown availability before accepting each press, shows the queued count on affected ability buttons, and remembers the selected target for each cast. **End Turn** can also be queued; it executes after every ability already ahead of it and prevents later actions from being added.

Abilities are classified as **Melee** or **Ranged**. Direct Melee attacks use the player's normal movement toward the target. Ranged attacks leave the player in place and use ability-specific presentation: launched bolts use projectiles, focused magic uses beams, transferred effects travel between their actual source and destination, and detonations, weather, freezes, and fields resolve directly at their targets. Damage, misses, and impact VFX still appear at the shared impact timing. Range is shown in ability details and can be set on ability nodes in the Talent Editor.

Queue projection also tracks target statuses. This allows a queued Arcane Overload to enable a queued free Arcane Blast against the same target, lets status-consuming abilities become available after an earlier queued cast applies their requirement, and previews Elemental Fury's no-debuff applications for later queued casts. Arcane Charge belongs to its target, so changing targets does not transfer the free cast.

Distraction makes the next ability cost 0 Energy and is consumed when that ability is used. Pinpoint guarantees critical strikes for every hit of the next damaging ability and is consumed when that ability begins. Both persist until consumed or combat ends.

Light Speed performs a complete player turn transition without allowing enemies to act between the two turns. End-of-turn Poison and duration changes resolve, then start-of-turn Burn, Regenerate, Energy regeneration, and cooldown reduction resolve before control returns to the player.

Voltage Stab deals Lightning damage from Spell Power. If the target was already Electrified when the hit landed, it restores 2% of Max Health and adds 2 to the player's next Energy-regeneration event. The temporary regeneration bonus stacks if another source grants the same effect, is previewed by the segmented Energy bar, and is consumed when the next player turn begins. Exhausted still limits the final regeneration to 1.

Epidemic applies 10 Poison to every living, targetable enemy and then grants Stealth until the end of the player's next turn.

New Current reduces Voltage Stab's cooldown from 2 turns to 1. Efficient Spread reduces Epidemic's Energy cost from 3 to 2. Ability cost and cooldown modifiers are additive, use whole numbers, and cannot reduce either value below zero.

Firestorm simultaneously deals 25% Spell Power as Fire damage to every enemy and applies 2 Burn to every enemy and the player. While the player is Burning, Pyromania and Greater Pyromania each increase direct Arcane, Fire, Frost, and Lightning damage by 10%; the two multiplicative bonuses combine to 21%. Living Furnace and Greater Living Furnace add a combined 15% to player-applied Burn damage against enemies while the player is Burning, and Greater Living Furnace also makes Fireball apply Charred. Heat Transfer restores 1 Energy whenever the player's own Burn deals Health damage to them.

The extended Arcanist tree adds Arcane Wound consumption and Barrier interactions, Slowed-and-Exhausted frost combinations, Electrified charge chains, and Elemental Fury. Mana Fracture, Focused Blast, Absolute Zero, Blizzard, Ride the Lightning, Charge, Rapid Fire, and Elemental Fury are all Ranged. Rapid Fire deals Fire damage. Their mechanics resolve at beam or field impact while their VFX remain non-blocking. Queue projection includes their status-stack requirements, consumed statuses, conditional applications, Energy restoration, and cooldown changes.

The extended Brute section adds twenty-four active abilities across Fire, Bleed, Armor/Guard, and holy paths. Bash is granted by the Brute class node. Divine Smite, Consecrated Ground, and Beacon of Light are Ranged target-bound holy effects; the other Brute abilities are Melee or self-targeted and use distinct, non-blocking VFX. Its reusable mechanics include Armor from Strength and percentage Armor, Burn-driven permanent Initiative, combat-start statuses and absorption, Health-restoration and Guard triggers, Guard-derived damage, buff removal, Burn detonation and transfer, Bleed-damage healing, conditional hit counts, guaranteed and chance-based companion status applications, Guard derived from Armor, Physical Power, Spell Power, Max Health, and consumed status stacks, conditional Stun while Guarded, debuff cleansing, critical-strike status applications, immediate Burn/Bleed damage, and random multi-hit attacks.

The latest Brute paths extend beyond Furnace Breaker, Bloodbath, Shield Charge, and Divine Smite. Super Critical Burns makes every player-applied Burn also apply Charred. Word Above can apply Smite on critical strikes, Shatter Armor follows player-applied Stuns with Shatter, and Molten Metal applies Burn whenever the player deals direct or status damage while Guarded. Berserk grants Fierce after an enemy Critical Strike, Cannibal can heal from player-applied Bleed damage, and Renewal can reduce a random active cooldown whenever Health is actually restored. Further paths add Burn-reactive Barrier and Energy, combat-start Fierce, Guard, Barrier, Burn, and Martyrdom, Armor-scaling retaliation, Poison from Bleed, and the Guard, Vampirism, Fire Eater, and Beacon of Light abilities. Oath and Emberfused now extend the Spell Power and hybrid Power routes beyond Divine Smite and Furnace Breaker. Time to Breathe can trigger only once per combat when Health first crosses below 40%.

Smite is a three-turn debuff. Whenever the player actually restores Health, including through Phoenix Heart or Panic, every living enemy with Smite takes Magic damage based on 50% of that restored amount at the same presentation event. Overhealing does not increase Smite damage.

Phoenix Heart prevents the first lethal hit in a combat only while the player is Burning, removes that Burn, and restores Health equal to the Burn's remaining damage. Charged Up grants a permanent combat stack worth +2 effective Initiative whenever the player applies Electrified, and turn order is recalculated when the stack becomes visible. Perfect Calculation bypasses the hit roll against enemies with at least 3 Arcane Wounds. Deep Chill rolls once per enemy attack, including misses and attacks fully absorbed by Guard or Barrier, for a 3% chance to Freeze the attacker; self-inflicted damage is not an attack. Elemental Fury deals 50% Spell Power as Arcane damage, then either seeds a clean target with its five configured debuffs or gains 50% damage per unique debuff already present.

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
- Enemy turns do not add a separate floating turn announcement; the turn-order highlight advances with the preceding action's final event.

Bleed resolves after the enemy uses its attack. Poison resolves at the end of the enemy's turn, then durations decrease. If Stunned expires, its icon is replaced by Diminishing Returns at that same event. Status icons retain their pre-turn state while those events are queued; the duration ring updates or the icon disappears only when the final status event is shown and resolved.

### Targeting

- Dead enemies remain visible but cannot be targeted.
- Dead enemies immediately lose all displayed status effects.
- Stealthed enemies cannot be targeted.
- A living, visible enemy with Taunt forces all single-target attacks to that enemy.
- The selected enemy is marked with a target icon and highlighted frame in the initiative row.
- Area abilities target all living enemies that are not Stealthed.
- Non-damaging area status abilities such as Poison Cloud apply to every target in one shared event, producing one floating status message and simultaneous status feedback on all affected enemies.
- Flurry chooses a new valid random enemy independently for every hit.
- Passives and on-hit effects create small local proc labels over the combatant they affect. Multiple passives affecting the same target at the same moment are combined into one label. Concurrent and rapidly following local labels fan upward along left, center, and right paths so they remain readable. These labels animate independently, never add sequence time, and never lock player input. The combat log records separate inspectable entries for the trigger and its results.

### Damage, status, and turn presentation

Combat calculations can prepare future results, but visible HP, status, and active-turn changes are delayed until their corresponding floating combat message is shown. Direct attacks start their lunge animation with the damage message and apply damage at the configured impact frame.

Damage events do not render central floating sentences. Damage is communicated by the large number over the affected Health bar, the Health-bar movement, and the combatant's impact reaction. Normal attacks show only the number, while damage originating from Poison, Bleed, Burn, or Reckless appends the source in parentheses. A failed attack displays **Missed!** over the defender instead of a damage number, for both player and enemy attacks. The hidden sequencing event remains responsible for attack timing and state application; non-attack damage slots last only as long as the damage-number animation.

Player ability-use announcements such as **You use Strike** are also hidden. The selected ability remains recorded as an inspectable combat-log entry, while visible outcome messages such as gained statuses, healing, Energy, turn changes, and Victory remain in the central presentation. Enemy ability announcements remain visible.

Every hit of a multi-hit ability receives its own lunge and impact reaction. Animation speed is multiplied by the number of hits, so two hits animate at twice normal speed and the total motion time remains equal to one standard attack animation. Direct-hit floating messages use the same shortened slots, causing the hit animations to run consecutively without normal floating-text pauses between them.

This sequencing guarantees that:

- Damage appears when the attack lands.
- HP bars animate from the old value to the new value.
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
- Frozen applications flash with an ice seal, and Frozen combatants retain a clear blue treatment until the control ends or damage breaks it.
- A combatant flashes yellow with visible lightning when Electrified is applied. This local effect does not add sequence time or delay the next action.
- Contagion animates a copied Poison icon from its selected source enemy to the random destination enemy.
- The turn-order highlight moves when the turn message is shown.
- Victory waits for the final death result and the **Victory.** message before the score screen appears.

### Victory and defeat

- Victory grants the current node's reward once and opens the score screen after all queued combat presentation is complete.
- The score screen animates experience, shows gold, and allows access to the Character screen before continuing.
- Panic prevents the first defeat in each combat: lethal damage is shown first, then the queued Panic event restores 20% of Max Health and grants Stealth for 2 turns. Later lethal damage in the same combat causes defeat normally.
- Defeat clears the save immediately and presents the permadeath screen.

## Energy and cooldowns

- Default Max Energy: 10.
- Default player Energy regeneration: 2 at the start of the player's own turn.
- Enemy Energy regeneration and Max Energy come from that enemy's definition.
- Energy cannot exceed Max Energy and cannot be spent below zero.
- A cooldown is measured in player turns and decreases only when the next player turn begins. The visible counter updates with **Your turn.**, never during the final enemy action.
- Focus clears every other cooldown, then keeps its own six-turn cooldown.
- Recuperate presents its cast and Energy restoration as one `You gain X Energy.` combat message.

The segmented Energy bar previews Energy that will be available after the next regeneration.

## Damage absorption

Guard is a temporary, stackable absorption status. The Guard ability grants a base of 6 Guard multiplied by the character's Guard multiplier. Incoming damage removes Guard first; only the remainder reduces Health. Normal Guard expires when its owner's next turn begins.

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
- Stealth always expires at the end of the player's next turn. Ending a turn now reconciles duration changes even when no damage or status message was queued, preventing buffs from retaining their old duration in visible combat state.

Detailed status definitions and formulas are in [Content reference](CONTENT_REFERENCE.md#status-effects).

### Damage-over-time formulas

All status damage is rounded to a whole number after multiplying by stacks.

```text
Bleed per stack  = 1 + source Physical Power × 0.10
Poison per stack = 1 + source Spell Power × 0.15
Burn per stack   = 1 + source Spell Power × 0.20
```

- Bleed triggers whenever the afflicted combatant uses an ability or enemy attack.
- Poison triggers at the end of each afflicted combatant's turn.
- Burn triggers at the start of each afflicted combatant's turn.
- Bleed is Physical damage, Poison is Arcane damage, and Burn is Fire damage.
- Armor is 50% effective against each combined Bleed trigger. Magic Resistance is 50% effective against each combined Poison or Burn tick.
- The status stores the applier's power when applied; later stat changes do not rewrite an existing status's source power.
- Player Poison damage can be modified by talent bonuses such as Toxicology and Virulence.
- Leech restores Health equal to 5% of actual Health damage dealt by player-applied Poison ticks or detonations, rounded up and limited by missing Health.

Regenerate uses:

```text
healing per stack = 3 + source Spell Power × 0.20
```

The result is then multiplied by the target's healing-received multiplier and limited by missing Health.

## Adventures and events

The current story adventure is **Windsong Forest**, containing four ordered stages. Each stage may contain any number of combat, boss, or event possibilities with configured percentage weights. The selected possibility is stored in adventure progress, so refreshing cannot reroll the active stage. See the live stage table in [Content reference](CONTENT_REFERENCE.md#adventure-windsong-forest).

Remaining Health carries from one stage to the next. Between stages, the game shows an animated travel transition followed by the selected encounter or event announcement. Completed adventure IDs are stored on the character and can satisfy another adventure's prerequisite.

Events contain two or three choices. Every choice specifies an attribute and success threshold. Choosing it rolls `d100 + selected derived attribute`. A total equal to or above the threshold applies the configured success outcome; a lower total applies the configured failure outcome. The result panel shows the die, attribute bonus, total, threshold, and narrative result.

Event outcomes can change carried Health, gold, experience, talent points, and unspent attribute points. Health remains between 1 and Max Health, and spendable currencies cannot fall below zero.

## Experience and levels

Experience required for the next level is:

```text
100 + (current level - 1) × 50
```

Excess experience carries into later levels, and one reward can grant multiple levels. Each gained level awards:

- 3 attribute points.
- 1 talent point.

Level 50 is the maximum level. Characters at level 50 no longer accumulate experience, and older saves above the cap are normalized to level 50 when loaded.

Attribute points can be assigned one at a time to any of the five base attributes from the Character screen. Attribute allocation, talent changes, ability loadout changes, and equipment changes are locked during active combat.

## Talents and ability loadout

The talent tree is classless. Wayfarer's Spark begins at the center, and the first four directions are Brute, Shadow, Arcanist, and Cultist. The live tree currently has 263 nodes: Shadow, Arcanist, and Brute each have 87 including their class node, and Cultist has 1. Shadow is the first complete branch. Arcanist extends from Arcane Mind into Fire, Frost, Lightning, Arcane, Spell Power, Intelligence, Hit Chance, and Critical Strike paths. Brute extends through Fire, Bleed, Armor/Guard, holy-vigor, Spell Power, and hybrid Power paths. Shadow also includes new Physical Power, Agility, Intelligence, and Spell Power routes.

### Unlock rules

- A node costs its configured number of talent points in normal adventures. Shadow Proving Grounds temporarily makes valid unlocks free without changing the character's stored points.
- Talent connections are bidirectional. If either node stores the connection, unlocking either end can make the node at the other end available.
- Any one connected node is always enough; there is no alternate requirement mode.
- Unlocking is permanent for the current character; there is no respec UI.
- Unlocking an ability talent automatically equips the ability if fewer than six abilities are equipped.

### Loadout

- The combat loadout has six slots.
- Strike and Guard are permanently unlocked core abilities. They can be equipped or unequipped from Wayfarer's Spark like other available abilities.
- Other unlocked abilities can be equipped or removed outside combat.
- Selecting any equipped or empty loadout slot opens the in-game ability picker. An occupied slot can replace or swap its ability with another equipped slot, while **Unequip Slot** removes its current ability.
- Ability descriptions are resolved from the character's unlocked talents. Combat tooltips, talent details, the loadout picker, and new combat-log entries therefore describe the modified effect rather than the ability's original base effect.
- Enemy misses, newly applied statuses, and newly applied Stuns are reusable passive-trigger events. Recovery, Spotting Opportunity, Biding Time, Break, Mischief, and Comparative Momentum attach their results to the triggering combat moment without slowing the event sequence.
- Combat tracks whether the player has taken damage or missed since combat began. Elemental Surprise and Confidence read those combat-scoped flags rather than checking talent IDs in the engine.
- Weight of Frost uses the shared passive-stat pipeline to add 5% of current Armor, rounded up, as flat damage to each direct hit.
- Talent nodes show only name and type on the map; selecting a node opens its full information and unlock controls.
- Circular passive nodes are 25% smaller than square class/ability nodes. Unlocked nodes receive a gold outer outline, and the connection layer is masked beneath every node so lines cannot show through transparent locked nodes.
- The player can pan, zoom, and fit the talent tree on desktop and mobile.

The complete current tree is listed in [Content reference](CONTENT_REFERENCE.md#talent-tree).

## Equipment and inventory

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

### Armor materials and weapon kinds

Armor can be Plate, Leather, or Cloth. Weapons currently support Sword, Axe, Mace, Dagger, Wand, Shield, Tome, Staff, and Polearm icon/category variants.

### Item presentation

- Rarity levels are Common, Uncommon, Rare, and Epic.
- Item names use their rarity color in inventory, equipment, details, and comparison.
- Item cards show identity and flavor, while all mechanical stats appear in the item details modal.
- Stats are sorted alphabetically and use stat icons.
- A compatible equipment slot opens a filtered list of equippable inventory items.
- Compare shows the equipped and candidate items with green positive and red negative differences.
- Item and equipment modals lock background scrolling.
- Inventory can be filtered by gear category and sorted by rarity or name.

### Gear sets

Set items show all thresholds for their own set. Fulfilled thresholds are green; unfulfilled thresholds are gray. Items without a set show no set section. Only equipped pieces count toward active set bonuses.

The current Ashborn Warplate thresholds are in [Content reference](CONTENT_REFERENCE.md#gear-set-bonuses).

## Loot and gold

Adventure combat rewards define experience and gold only. Automatic gear drops are disabled until enemy-owned loot tables are implemented; Adventure definitions and the Adventure Editor do not control loot.

Gold is stored on the character and displayed in the top bar and reward screens. There is no shop or gold-spending system yet.

## Saving and reset behavior

- The game automatically writes the full `GameState` to browser `localStorage` under the legacy compatibility key `emberfall-save-v1` after state changes.
- Refreshing or reopening the same site origin restores the character and in-progress adventure.
- Saves are local to the browser profile and exact site origin; they are not cloud-synced.
- The reset button uses a game-owned confirmation dialog and deletes the save.
- Defeat deletes the save without retaining a recoverable character.
- Loading migrates older avatar, equipment metadata, removed talent refunds, two-hand/off-hand conflicts, ability loadouts, and reward state where possible.

Developer Talent, Enemy, Event, and Adventure Editor drafts use separate local-storage keys and are not deleted by the normal game-save reset.
