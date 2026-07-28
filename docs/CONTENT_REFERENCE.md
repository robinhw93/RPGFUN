# Content reference

This is a snapshot of content currently defined under `src/game/content/` and in `src/game/statusEffects.ts`. The stable `src/game/data.ts` facade re-exports those catalogs. This document distinguishes playable content from definitions that exist for future expansion.

## Abilities

Cooldowns are measured in player turns. **None** means the ability can be repeated in the same turn as long as Energy and targeting requirements allow it.

Every ability is classified as **Melee** or **Ranged**. The current obtainable Ranged abilities are Poison Cloud, Contagion, Neurotoxin, Toxic Explosion, Venomborn, Pandemic, Cull the Weak, Epidemic, Divine Smite, Consecrated Ground, Beacon of Light, and every Arcanist ability from Arcane Bolt through Elemental Fury. All other obtainable Brute and Shadow abilities are Melee. Of the definitions outside the live tree, Essence Siphon is Ranged; Crushing Blow, Ground Slam, Sever, and Venom Edge are Melee. Ranged attacks never use the normal melee lunge. Bolts and launched spells travel to the target, beams connect caster and target, while detonations, weather, freezes, and other target-bound effects resolve in place. Poison abilities use the generic **Spell Damage** classification rather than Arcane; it scales from Spell Power and is resisted by Magic Resistance.

### Core and currently obtainable abilities

| Ability | Energy | Cooldown | Target | Effect |
| --- | ---: | ---: | --- | --- |
| Quick Slash | 1 | None | Enemy | Deals 50% Physical Power as Physical damage. |
| Twin Strike | 2 | 1 | Enemy | Hits twice for 50% Physical Power per hit. Each hit rolls and triggers on-hit effects separately. |
| Poison Stab | 3 | None | Enemy | Deals 50% Physical Power as Physical damage and applies 1 Poison. |
| Poison Cloud | 3 | 2 | All enemies | Applies 2 Poison to every target simultaneously without direct damage. |
| Contagion | 2 | 3 | Poisoned enemy | Copies all Poison stacks to another random living enemy without removing them from the selected enemy. |
| Stealth | 2 | 3 | Self | Cannot be targeted until the end of the holder's next turn. |
| Evasion | 2 | 3 | Self | Grants +60% Dodge Chance until the next player turn. |
| Neurotoxin | 3 | 2 | Poisoned enemy | Consumes all Poison and applies Stunned. |
| Venomous Strike | 4 | 3 | Enemy | Deals 100% Physical Power, applies 2 Poison, and deals double direct damage if the target was already Poisoned. |
| Flurry | 4 | 2 | Random enemies | Makes five attacks for 40% Physical Power each. Every hit independently selects a valid random enemy and triggers on-hit effects. |
| Ambush | 2 | None | Enemy | Requires Stealth. Deals 150% Physical Power with +50% Critical Strike Chance. |
| Toxic Explosion | 5 | 2 | Poisoned enemy | Deals the target's remaining Poison duration immediately and removes Poison. |
| Venomborn | 2 | 6 | Poisoned enemy | Consumes Poison and heals the player for 50% of three turns of that Poison's current damage. |
| Lightning Strike | 4 | 4 | Enemy | Deals 50% Physical Power as Physical damage plus 50% Spell Power as Lightning damage, then applies Electrified for three turns. |
| Focus | 1 | 6 | Self | Resets every other ability cooldown. Focus keeps its own cooldown. |
| Recuperate | 1 | 4 | Self | Restores 50% of Max Energy after paying its Energy cost. |
| Sharpened Blade | 2 | 1 | Enemy | Deals 100% Physical Power and ignores Guard and Barrier. |
| Slowing Venom | 2 | None | Poisoned enemy | Deals 75% Physical Power, consumes 50% of Poison, and applies Slowed. |
| Weakening Venom | 2 | None | Poisoned enemy | Deals 60% Physical Power, consumes 50% of Poison, and applies Vulnerable and Weaken. |
| Rabid Venom | 3 | 1 | Poisoned enemy | Deals 75% Physical Power, consumes 50% of Poison, and applies Reckless. |
| Pinpoint Slice | 3 | 2 | Enemy | Deals 75% Physical Power; the next damaging ability is guaranteed to critically strike. |
| Traumatic Puncture | 3 | 1 | Enemy | Deals 75% Physical Power; a critical strike applies Weaken and 2 Bleed. |
| Slice and Dice | 5 | 2 | Enemy | Hits six times for 15% Physical Power. Critical hits apply Exhausted and each hit triggers on-hit effects. |
| Cheap Shot | 4 | 1 | Enemy | Requires Stealth. Applies Stunned and 5 Bleed without direct damage. |
| Pandemic | 4 | 3 | Enemy | Copies every debuff on the target to all other living, targetable enemies. |
| Light Speed | 6 | 5 | Enemy | Deals 50% Physical Power as Physical damage plus 100% Spell Power as Lightning damage, applies Electrified, ends the current turn, and immediately begins a new player turn. |
| Chain Assassination | 5 | 3 | Enemy | Deals 125% Physical Power and gains +25% Critical Strike Chance while Stealthed. A kill refunds the Energy actually spent and resets its cooldown. |
| Cull the Weak | 5 | 3 | Enemy | Deals 25% Physical Power as Physical damage plus 25% Spell Power as Spell Damage. Both components gain 20% damage per unique debuff on the target. |
| Epidemic | 3 (2 with Efficient Spread) | 10 | All enemies | Applies 4 Poison to every living, targetable enemy and grants Stealth until the end of the player's next turn. |
| Voltage Stab | 0 | 2 (1 with New Current) | Enemy | Deals 35% Spell Power as Lightning damage. Against an Electrified target, restores 2% of Max Health and grants +2 Energy regeneration next turn. |
| Bash | 1 | 1 | Enemy | Deals 75% Physical Power as Physical damage and has a 30% chance to grant +1 Energy regeneration next turn. Granted by the Brute class node. |
| Searing Strike | 3 | 3 | Enemy | Deals 90% Physical Power as Physical damage and applies 1 Burn; Fiery Weapon increases this to 2 Burn. Imbued Weapon changes the scaling to Spell Power, lowers the cost to 2, lowers the cooldown to 1, and applies 2 Burn. |
| Wounding Strike | 2 | 2 | Enemy | Deals 40% Physical Power as Physical damage and applies 1 Bleed. |
| Swift Blade | 0 | 2 | Enemy | Deals 50% Physical Power as Physical damage and grants +1 Energy regeneration next turn; Light Metal increases this to +2. |
| Flame Cleave | 4 | 3 | All enemies | Simultaneously deals 60% Physical Power as Physical damage and applies 1 Burn. Scorching Sweep applies 2 Burn to targets already Burning; Wildfire Cleave adds 20% damage per living Burning enemy. |
| Shield Bash | 2 (1 with Quick Guard) | 2 | Enemy | Deals 60% Physical Power as Physical damage and grants Guard equal to 10% of Armor until the start of the player's next turn. Concussive Bash adds a 5% Stun chance plus 0.1 percentage points per Armor. |
| Bloodletting | 3 | 2 | Enemy | Deals 75% Physical Power as Physical damage and applies 1 Bleed per 3 existing Bleed, or per 2 with Bloodier-Letting. Hemorrhage immediately triggers Bleed damage when at least 3 stacks are applied. |
| Holy Strike | 2 | 2 | Enemy | Deals 50% Physical Power as Physical damage plus 50% Spell Power as Arcane damage, then restores 8% Max Health. Improved Holy Strike adds a 10% chance to apply Smite. |
| Unbreakable | 3 | 5 | Self | Grants Guard equal to 100% of Armor until the start of the player's next turn. Counter also grants +2 Energy regeneration next turn. |
| Blood Barrier | 2 | 3 | Bleeding enemy | Consumes up to 5 Bleed and grants Guard equal to 10% Max Health per stack until the start of the player's next turn. Thick Blood calculates the same Guard without consuming Bleed. |
| Burning Guard | 2 | 4 | Self | Grants Guard equal to 50% Physical Power until the start of the player's next turn. If that Guard is destroyed, applies 3 Burn to the attacker. Magical Fires adds 50% Spell Power to the Guard amount. |
| Lay on Hands | 5 | 5 | Self | Restores 10% Max Health and grants Barrier equal to the Health actually restored. Cleansing Hands also removes every debuff from the player. |
| Shield Charge | 4 | 3 | Enemy | Deals Physical damage equal to 25% Physical Power plus 50% Armor. Applies Stunned if the player has Guard when the hit resolves. |
| Bloodbath | 4 | 2 | Random enemies | Strikes five times. Each hit independently chooses a living enemy, deals 50% Physical Power as Physical damage, and applies 1 Bleed. |
| Furnace Breaker | 4 | 3 | Enemy | Deals 100% Physical Power as Physical damage and immediately triggers the target's Burn damage once without removing Burn. |
| Divine Smite | 5 | 5 | Enemy | A target-bound Ranged strike dealing 100% Spell Power as Magic damage and applying Smite for 3 turns. |
| Blood Frenzy | 5 | 3 | Enemy | Strikes four times for 35% Physical Power and applies 1 Bleed per hit. Fierce increases the cast to six hits. |
| Crushing Impact | 4 | 3 | Enemy | Deals Physical damage based on the player's current Guard and removes every buff from the target. |
| Explosive Strike | 4 | 2 | Enemy | Deals 50% Physical Power as Physical damage, increased by 5% per Burn on the target, then consumes that Burn and deals its remaining damage to every other enemy. |
| Consecrated Ground | 6 | 4 | All enemies | A target-bound Ranged field that simultaneously deals 80% Spell Power as Magic damage. Each enemy independently has a 20% chance to gain Smite, and the player gains Regenerate. |
| Guard (Brute) | 1 | None | Self | Grants Guard equal to 5% of Armor. |
| Vampirism | 2 | None | Enemy | Deals 10% Physical Power as Physical damage and restores 2 Health per Bleed on the target. |
| Fire Eater | 4 | 4 | Burning self and enemy | Consumes all Burn on the player, restores Health equal to its remaining damage, and transfers the consumed Burn to the selected enemy. |
| Beacon of Light | 6 | 6 | All enemies and self | A target-bound Ranged effect that applies Smite to every enemy simultaneously and grants Regenerate to the player for 3 turns. |
| Arcane Bolt | 1 | 1 | Enemy | Deals 75% Spell Power as Arcane damage. Granted by the Arcanist class node. |
| Frostbolt | 3 | 1 | Enemy | Deals 50% Spell Power as Frost damage and has a 50% base chance, plus Luck's chance-effect bonus, to apply Slowed. |
| Arcane Blast | 1 | None | Enemy | Deals 20% Spell Power as Arcane damage plus an additional 10% Spell Power per existing Arcane Wound, then applies 1 Arcane Wound. Arcane Knowledge raises the per-stack scaling to 15% Spell Power. Costs 0 Energy against a target marked by Arcane Charge, then consumes that marker. |
| Fireball | 4 | 2 | Enemy | Deals 100% Spell Power as Fire damage and applies 2 Burn. |
| Lightning Beam | 3 | 2 | Random enemies | Hits four times for 20% Spell Power as Lightning damage. Every hit independently selects a valid random enemy and has a 20% base chance, plus Luck's chance-effect bonus, to apply Electrified. |
| Thunderstorm | 5 | 3 | Random enemies | Hits six times for 30% Spell Power as Lightning damage. Each hit independently chooses a living enemy and deals 50% more damage if that enemy is Electrified. |
| Deep Freeze | 4 | 4 | Enemy | Deals 75% Spell Power as Frost damage. Applies Slowed, or Stunned instead if the target was already Slowed. |
| Arcane Overload | 3 | 3 | Enemy | Deals 50% Spell Power as Arcane damage, applies 3 Arcane Wounds, and applies Arcane Charge for the next Arcane Blast against that target. |
| Combustion | 4 | 3 | Burning enemy | Consumes Burn and deals its remaining-duration damage immediately. If the detonation kills, half the consumed stacks, rounded up, spread to every other living enemy. |
| Arcane Combustion | 4 | 3 | Enemy with Arcane Wound | Consumes all Arcane Wounds, deals 50% Spell Power as Fire damage per consumed stack, and applies the same number of Burn stacks. |
| Thundersnow | 5 | 3 | All enemies | Simultaneously deals a combined 60% Spell Power per enemy, split evenly between Frost and Lightning, applies Slowed to every target, and applies Electrified to one random target. |
| Self Immolation | 1 | 5 | Enemy | Simultaneously applies 5 Burn to the player and selected enemy. Feel the Burn heals for the self-Burn's full remaining damage before application; Refreshing Fires grants +2 Energy regeneration next turn. |
| Arcane Barrier | 1 | 5 | Self | Gains Barrier equal to 50% Spell Power for 3 turns; Improved Barrier raises this to 75%. A persistent shimmer pulses when Barrier absorbs damage. |
| Frozen Path | 1 | 5 | Self | Gains +30% Dodge Chance for 3 turns; Barbed Boots raises this to +40%, still subject to the 50% Dodge cap. |
| Conductor | 1 | 5 | All enemies and self | Stuns every enemy and the player, ending the current player turn and skipping every affected combatant's next turn. Electrified Hug also applies Electrified to every enemy. |
| Firestorm | 5 | 3 | All enemies and self | Simultaneously deals 25% Spell Power as Fire damage to every enemy, then applies 2 Burn to every enemy and the player. |
| Mana Fracture | 1 | 3 | Enemy with Arcane Wound | Consumes all Arcane Wounds and restores 1 Energy per 2 stacks consumed at impact, up to maximum Energy. |
| Rapid Fire | 2 | 4 | Random enemies | Hits three times for 30% Spell Power as Fire damage with +20% Critical Strike Chance; hits six times while Burning. |
| Focused Blast | 4 | 2 | Enemy with 6 Arcane Wounds | Deals Arcane damage equal to current Barrier and consumes 3 Arcane Wounds. Focus Harder changes the requirement to 5 and consumption to 2. |
| Absolute Zero | 3 | 4 | Enemy | Deals 50% Spell Power as Frost damage. A Slowed target becomes Frozen; otherwise applies Slowed and Exhausted. |
| Blizzard | 5 | 3 | All enemies | Simultaneously deals 50% Spell Power as Frost damage. Each target independently rolls 50% Slowed, 50% Exhausted, and 10% Frozen. |
| Ride the Lightning | 1 | 6 | All enemies | Consumes Electrified from every enemy, restores 1 Energy per affected enemy, and immediately begins a new turn. |
| Charge | 4 | 6 | All enemies | Consumes Electrified from every enemy; each affected enemy restores 1 Energy and reduces every cooldown by 1, then all enemies take 100% Spell Power as Lightning damage. Electricity first arcs from affected enemies to the player, then returns from the player as each damage hit resolves. |
| Elemental Fury | 3 | 6 | Enemy | Deals 50% Spell Power as Arcane damage. Against a target with no debuffs, applies 2 Burn, Electrified, Slowed, Exhausted, and 2 Arcane Wounds. Otherwise, deals 50% more damage per unique debuff already on the target. |

### Defined but not currently connected to the live talent tree

These definitions are executable, but a normal new character cannot unlock or equip them through the current tree.

| Ability | Energy | Cooldown | Effect |
| --- | ---: | ---: | --- |
| Crushing Blow | 4 | None | Physical attack with 12 Flat Damage plus Physical Power; applies Vulnerable. |
| Ground Slam | 6 | None | Physical area attack with 7 Flat Damage plus Physical Power; each target has a base 45% Stun chance plus Luck's chance-effect bonus. |
| Sever | 3 | None | Shadow attack with 7 Flat Damage plus Physical Power; applies Bleed. |
| Venom Edge | 4 | None | Shadow attack with 5 Flat Damage plus Physical Power; applies Poison. |
| Essence Siphon | 4 | None | Arcane attack with 7 Flat Damage plus Spell Power; restores 2 Energy after use. |

## Talent tree

The live tree has 263 nodes: the origin, four first-direction class nodes, 86 later Shadow nodes, 86 later Arcanist nodes, and 86 later Brute nodes. Branch counts are Shadow 87, Arcanist 87, Brute 87, and Cultist 1; the Talent Editor displays these values live. Every listed node currently costs 1 point except Wayfarer's Spark, which is free and starts unlocked. During character introduction, choosing Arcanist, Brute, or Shadow directly grants that class node without consuming the character's separate starting Talent Point; Cultist is displayed as Coming Soon and cannot be selected.

Connections are bidirectional: unlocking either end can make the node at the other end available. Each edge is declared only once in the data. Every node uses **Any**, so one adjacent unlocked node is always enough.

Unlocking the first non-origin class node locks the other class nodes until level 10. From level 10 onward, additional class nodes use their normal connection and Talent Point requirements.

| ID | Talent | Type | Declared connection(s) | Rule | Effect |
| --- | --- | --- | --- | --- | --- |
| origin | Wayfarer's Spark | Class | None | — | Starting node. |
| brute_1 | Brute | Class | Wayfarer's Spark | Any | +2 Strength and unlocks Bash. |
| shadow_1 | Shadow | Class | Wayfarer's Spark | Any | +2 Agility and unlocks Quick Slash. |
| arcanist_1 | Arcanist | Class | Wayfarer's Spark | Any | +2 Intelligence and unlocks Arcane Bolt. |
| cultist_1 | Cultist | Class | Wayfarer's Spark | Any | Unlocks the Cultist path. |
| talent_1 | Immaculate Timing | Passive | Shadow | Any | +2 Agility, +5 Initiative, and +1 Energy regeneration. |
| talent_2 | Twin Strike | Ability | Immaculate Timing | Any | Unlocks Twin Strike. |
| talent_3 | Poison Stab | Ability | Immaculate Timing | Any | Unlocks Poison Stab. |
| talent_4 | Honed Skills | Passive | Twin Strike | Any | +3% Critical Strike Chance. |
| talent_5 | Precision | Passive | Poison Stab | Any | +3% Hit Chance. |
| talent_6 | Elusiveness | Passive | Honed Skills | Any | +3% Dodge Chance. |
| talent_7 | Stamina | Passive | Honed Skills | Any | +1 Max Energy. |
| talent_8 | Setup | Passive | Precision | Any | +4 Initiative. |
| talent_9 | Spell Dodger | Passive | Precision | Any | +2 Magic Resistance. |
| talent_10 | Poison Cloud | Ability | Spell Dodger or Recuperate | Any | Unlocks Poison Cloud. |
| talent_11 | Stealth | Ability | Stamina or Recuperate | Any | Unlocks Stealth. |
| talent_12 | Poison Coating | Passive | Setup | Any | Every hit has a 50% chance, plus Luck's chance-effect bonus, to apply 1 Poison. |
| talent_13 | Adrenaline | Passive | Elusiveness | Any | Every hit has a 10% chance, plus Luck's chance-effect bonus, to restore 1 Energy. |
| talent_14 | Evasion | Ability | Adrenaline | Any | Unlocks Evasion. |
| talent_15 | Neurotoxin | Ability | Poison Coating | Any | Unlocks Neurotoxin. |
| talent_16 | Opportunist | Passive | Stealth | Any | Deals 50% more damage while attacking from Stealth. |
| talent_17 | Blisters | Passive | Poison Cloud | Any | Deals 20% more Physical damage to Poisoned enemies. |
| talent_18 | Agile | Passive | Evasion (ability) | Any | +2 Agility. |
| talent_19 | Smarts | Passive | Neurotoxin | Any | +2 Intelligence. |
| talent_20 | Venomous Strike | Ability | Smarts | Any | Unlocks Venomous Strike. |
| talent_21 | Toxicology | Passive | Smarts | Any | Player-applied Poison deals 10% more damage and grants +1 Energy regeneration. |
| talent_22 | Virulence | Passive | Blisters | Any | Player-applied Poison deals 10% more damage. Toxicology and Virulence combine additively for +20%. |
| talent_23 | Electrified | Passive | Agile | Any | Every hit has a 20% chance, plus Luck's chance-effect bonus, to apply Electrified; also grants +1 Energy regeneration. |
| talent_24 | Flurry | Ability | Agile | Any | Unlocks Flurry. |
| talent_25 | Energized | Passive | Opportunist | Any | +1 Energy regenerated at the start of the player's turn. |
| talent_26 | Ambush | Ability | Energized | Any | Unlocks Ambush. |
| talent_27 | Toxic Explosion | Ability | Virulence | Any | Unlocks Toxic Explosion. |
| talent_28 | Longevity | Passive | Toxic Explosion | Any | Toxic Explosion retains half of the consumed Poison stacks, rounded up. |
| talent_29 | Maneuvers | Passive | Ambush | Any | Ambush can be used without Stealth at 100% Physical Power, but gains no bonus Critical Strike Chance unless the player is Stealthed. |
| talent_30 | Reapply | Passive | Neurotoxin | Any | After Neurotoxin consumes Poison, it applies 2 new Poison. |
| talent_31 | Enduring Evasion | Passive | Evasion (ability) | Any | Evasion grants +40% Dodge instead of +60%, but lasts one additional turn. |
| talent_32 | Self Medicate | Passive | Venomous Strike | Any | Start combat with 2 Poison. An enemy that directly damages the player gains 1 Poison. |
| talent_33 | Shock Stabs | Passive | Flurry | Any | Hits against Electrified enemies have a 5% chance, plus Luck's chance-effect bonus, to Stun. |
| talent_34 | Recuperate | Ability | Connections are declared by Stealth and Poison Cloud | Any | Restores 50% of Max Energy. |
| talent_35 | Venomborn | Ability | Self Medicate | Any | Unlocks Venomborn. |
| talent_36 | Lightning Strike | Ability | Shock Stabs | Any | Unlocks Lightning Strike. |
| talent_37 | Focus | Ability | Toxic Explosion or Ambush | Any | Unlocks Focus. |
| talent_38 | Contagion | Ability | Poison Stab | Any | Unlocks Contagion. |
| talent_39 | Sharpened Blade | Ability | Twin Strike | Any | Unlocks Sharpened Blade. |
| talent_40 | Resistance | Passive | Venomborn | Any | Makes the player immune to Poison and grants +10 Spell Power. |
| talent_41 | Thunderstruck | Passive | Lightning Strike | Any | Makes the player immune to Electrified and grants +20 Spell Power. |
| talent_42 | Perfected Formula | Passive | Focus | Any | Player-applied Poison gains 1 additional stack. |
| talent_43 | Distraction | Passive | Focus | Any | Kills grant Stealth until the end of the next player turn and make the next ability cost 0 Energy. |
| talent_44 | Extra Dose | Passive | Poison Coating | Any | Critical strikes apply 2 Poison. |
| talent_45 | Flow | Passive | Adrenaline | Any | Critical strikes restore 1 Energy. |
| talent_46 | Slowing Venom | Ability | Extra Dose | Any | Unlocks Slowing Venom. |
| talent_47 | Weakening Venom | Ability | Extra Dose | Any | Unlocks Weakening Venom. |
| talent_48 | Rabid Venom | Ability | Extra Dose | Any | Unlocks Rabid Venom. |
| talent_49 | Precise Incisions | Passive | Any venom ability | Any | The three venom abilities consume 25% of Poison instead of 50%. |
| talent_50 | Pinpoint Slice | Ability | Flow | Any | Unlocks Pinpoint Slice. |
| talent_51 | Traumatic Puncture | Ability | Flow | Any | Unlocks Traumatic Puncture. |
| talent_52 | Slice and Dice | Ability | Flow | Any | Unlocks Slice and Dice. |
| talent_53 | Taste for Blood | Passive | Any of the three critical-strike abilities | Any | Critical strikes restore 1% of Max Health. |
| talent_54 | Leech | Passive | Venomborn | Any | Restores Health equal to 5% of player-applied Poison tick and detonation damage, rounded up. |
| talent_55 | Sweaty Aftermath | Passive | Lightning Strike | Any | Applying Electrified also applies Wet. |
| talent_56 | Cheap Shot | Ability | Distraction or Perfected Formula | Any | Unlocks Cheap Shot. |
| talent_57 | Pandemic | Ability | Resistance or Perfected Formula | Any | Unlocks Pandemic. |
| talent_58 | Light Speed | Ability | Distraction or Thunderstruck | Any | Unlocks Light Speed. |
| talent_59 | Chain Assassination | Ability | Distraction | Any | Unlocks Chain Assassination. |
| talent_60 | Cull the Weak | Ability | Perfected Formula | Any | Unlocks Cull the Weak. |
| talent_61 | Hit and Run | Passive | Cheap Shot | Any | Damage dealt has a 2% base chance to grant Stealth until the end of the next player turn. |
| talent_62 | Spot Weakness | Passive | Pandemic | Any | Deals 5% more damage per unique debuff on the target. |
| talent_63 | Avoidance | Passive | Light Speed | Any | +1 Max Energy and 3% less incoming damage per unspent Energy. |
| talent_64 | Epidemic | Ability | Spot Weakness | Any | Unlocks Epidemic. |
| talent_65 | Panic | Passive | Hit and Run | Any | The first lethal hit each combat restores 20% of Max Health and grants Stealth until the end of the next turn. |
| talent_66 | Voltage Stab | Ability | Avoidance | Any | Unlocks Voltage Stab. |
| talent_67 | Recovery | Passive | Enduring Evasion | Any | Enemy misses have a 50% base chance to restore 1 Energy. |
| talent_68 | Fleetfooted | Passive | Recovery | Any | +2% Dodge Chance. |
| talent_69 | Spotting Opportunity | Passive | Fleetfooted | Any | An enemy that misses the player gains Vulnerable. |
| talent_70 | Untouchable | Passive | Spotting Opportunity | Any | +2% Dodge Chance. |
| talent_71 | Biding Time | Passive | Untouchable | Any | Enemy misses grant Fierce for 1 turn. |
| talent_72 | Precise Strikes | Passive | Reapply | Any | +2% Hit Chance. |
| talent_73 | Break | Passive | Precise Strikes | Any | Stunning an enemy restores 2% of Max Health. |
| talent_74 | Calculated Strikes | Passive | Break | Any | +2% Hit Chance. |
| talent_75 | Mischief | Passive | Calculated Strikes | Any | Stunning an enemy deals damage equal to 10% of its current Health. |
| talent_76 | Regenerating Toxin | Passive | Mischief | Any | Neurotoxin consumes only 50% of the target's Poison. |
| talent_77 | New Current | Passive | Voltage Stab | Any | Reduces Voltage Stab's cooldown by 1 turn. |
| talent_78 | Efficient Spread | Passive | Epidemic | Any | Reduces Epidemic's Energy cost by 1. |
| talent_79 | Arcane Mind | Passive | Arcanist | Any | +2 Intelligence, +3 Magic Resistance, and +1 Energy regeneration. |
| talent_80 | Frostbolt | Ability | Arcane Mind | Any | Unlocks Frostbolt. |
| talent_81 | Arcane Blast | Ability | Arcane Mind | Any | Unlocks Arcane Blast. |
| talent_82 | Fireball | Ability | Arcane Mind | Any | Unlocks Fireball. |
| talent_83 | Lightning Beam | Ability | Arcane Mind | Any | Unlocks Lightning Beam. |
| talent_84 | Critical Burn | Passive | Fireball | Any | +2% Critical Strike Chance. |
| talent_85 | Aimed Spells | Passive | Arcane Blast | Any | +2% Hit Chance. |
| talent_86 | Frozen Armor | Passive | Frostbolt | Any | +2 Armor. |
| talent_87 | Lightning Fast | Passive | Lightning Beam | Any | +2 Initiative. |
| talent_88 | Kindled Precision | Passive | Critical Burn | Any | +2% Critical Strike Chance. |
| talent_89 | Fire Within | Passive | Critical Burn | Any | +1 Max Energy. |
| talent_90 | Charged Reflexes | Passive | Lightning Fast | Any | +2 Initiative and 15% more damage while first in initiative order. |
| talent_91 | Increased Voltage | Passive | Lightning Fast | Any | +1 Max Energy. |
| talent_92 | Arcane Accuracy | Passive | Aimed Spells | Any | +2% Hit Chance. |
| talent_93 | Glacial Plating | Passive | Frozen Armor | Any | +2 Armor. |
| talent_94 | Engulf | Passive | Kindled Precision | Any | Critical strikes with Arcanist spells apply 1 Burn. |
| talent_95 | Elemental Surprise | Passive | Charged Reflexes | Any | Deals 20% more damage until the player first takes damage each combat. |
| talent_96 | Invigorate | Passive | Aimed Spells | Any | Hits against an enemy with Arcane Wound have a 20% base chance to restore 2 Energy. |
| talent_97 | Comparative Momentum | Passive | Frozen Armor | Any | Applying Slowed has a 30% base chance to restore 1 Energy. |
| talent_98 | Confidence | Passive | Arcane Accuracy | Any | Deals 20% more damage until the player's first miss each combat. |
| talent_99 | Weight of Frost | Passive | Glacial Plating | Any | −10 Initiative; direct hits gain flat damage equal to 5% of Armor, rounded up. |

| talent_100 | Thunderstorm | Ability | Increased Voltage | Any | Unlocks Thunderstorm. |
| talent_101 | Deep Freeze | Ability | Comparative Momentum | Any | Unlocks Deep Freeze. |
| talent_102 | Arcane Overload | Ability | Invigorate | Any | Unlocks Arcane Overload. |
| talent_103 | Combustion | Ability | Fire Within | Any | Unlocks Combustion. |
| talent_104 | Arcane Combustion | Ability | Fire Within or Invigorate | Any | Unlocks Arcane Combustion. |
| talent_105 | Thundersnow | Ability | Increased Voltage or Comparative Momentum | Any | Unlocks Thundersnow. |
| talent_106 | Arcane Knowledge | Passive | Arcane Overload | Any | +2 Intelligence; each Arcane Wound adds 15% Spell Power to Arcane Blast instead of 10%. |
| talent_107 | Lower Temperature | Passive | Deep Freeze | Any | Frostbolt has a 50% base chance to apply Exhausted. |
| talent_108 | Rain | Passive | Thundersnow | Any | Thundersnow applies Wet to every enemy instead of Slowed. |
| talent_109 | Intense Beam | Passive | Thunderstorm | Any | All four Lightning Beam hits strike the selected target. |
| talent_110 | Feedback | Passive | Arcane Combustion | Any | +1 Energy regeneration. |
| talent_111 | Charring Fires | Passive | Combustion | Any | Burn deals 10% more damage. |
| talent_112 | Self Immolation | Ability | Charring Fires | Any | Unlocks Self Immolation. |
| talent_113 | Arcane Barrier | Ability | Arcane Knowledge or Charring Fires | Any | Unlocks Arcane Barrier. |
| talent_114 | Frozen Path | Ability | Lower Temperature or Intense Beam | Any | Unlocks Frozen Path. |
| talent_115 | Conductor | Ability | Intense Beam | Any | Unlocks Conductor. |
| talent_116 | Improved Barrier | Passive | Arcane Barrier | Any | Arcane Barrier scales at 75% Spell Power. |
| talent_117 | Reflective Barrier | Passive | Improved Barrier | Any | Reflects 20% of damage absorbed specifically by Barrier and grants +1 Energy regeneration. |
| talent_118 | Barbed Boots | Passive | Frozen Path | Any | Frozen Path grants +40% Dodge Chance. |
| talent_119 | Ice Spikes | Passive | Barbed Boots | Any | An enemy that misses takes 20% Spell Power as Frost damage; also grants +1 Energy regeneration. |
| talent_120 | Feel the Burn | Passive | Self Immolation | Any | Self Immolation heals for the self-Burn's full remaining damage before applying it. |
| talent_121 | Refreshing Fires | Passive | Feel the Burn | Any | Self Immolation grants +2 Energy regeneration next turn. |
| talent_122 | Electrified Hug | Passive | Conductor | Any | Conductor also Electrifies all enemies. |
| talent_123 | Shell Shocked | Passive | Electrified Hug | Any | While Stunned, the player takes only 20% damage from all sources. |
| talent_124 | Blinding Light | Passive | Conductor | Any | Applying Electrified has a 20% base chance, plus Luck's bonus to chance-based effects, to also apply Blind. |
| talent_125 | Brittle | Passive | Frozen Path | Any | Enemies that are both Slowed and Exhausted take 15% more direct damage. |
| talent_126 | Arcane Reservoir | Passive | Arcane Barrier | Any | Player-applied Arcane Wounds last 1 additional turn. |
| talent_127 | Pyromania | Passive | Self Immolation | Any | While Burning, deals 10% more direct Arcane, Fire, Frost, and Lightning damage. |
| talent_128 | Living Furnace | Passive | Pyromania | Any | Player-applied Burn deals 5% more damage to enemies while the player is Burning. |
| talent_129 | Greater Pyromania | Passive | Living Furnace | Any | While Burning, deals an additional 10% more direct Arcane, Fire, Frost, and Lightning damage. |
| talent_130 | Greater Living Furnace | Passive | Greater Pyromania | Any | Player-applied Burn deals an additional 10% more damage to enemies while the player is Burning, and Fireball also applies Charred. |
| talent_131 | Firestorm | Ability | Greater Living Furnace | Any | Unlocks Firestorm. |
| talent_132 | Heat Transfer | Passive | Firestorm | Any | Restores 1 Energy whenever Burn deals Health damage to the player. |
| talent_133 | Resonance | Passive | Arcane Reservoir | Any | Reapplying Arcane Wound restores 1% Max Health. |
| talent_134 | Mana Fracture | Ability | Arcane Reservoir | Any | Unlocks Mana Fracture. |
| talent_135 | Rapid Fire | Ability | Pyromania | Any | Unlocks Rapid Fire. |
| talent_136 | Arcane Shell | Passive | Resonance | Any | Consumed or expired Arcane Wounds grant Barrier equal to 10% Spell Power. |
| talent_137 | Arcane Retaliation | Passive | Arcane Shell | Any | A destroyed Barrier applies 2 Arcane Wounds to its attacker. |
| talent_138 | Focused Blast | Ability | Arcane Retaliation | Any | Unlocks Focused Blast. |
| talent_139 | Treacherous Ground | Passive | Brittle | Any | While Frozen Path is active, enemies that miss become Slowed. |
| talent_140 | Cold Snap | Passive | Treacherous Ground | Any | Applying Slowed reduces one random cooldown by 1. |
| talent_141 | Greater Brittle | Passive | Cold Snap | Any | Adds another multiplicative 15% direct-damage bonus against Slowed and Exhausted enemies. |
| talent_142 | Absolute Zero | Ability | Greater Brittle | Any | Unlocks Absolute Zero. |
| talent_143 | Blizzard | Ability | Brittle | Any | Unlocks Blizzard. |
| talent_144 | Focus Harder | Passive | Focused Blast | Any | Focused Blast requires 5 Arcane Wounds and consumes 2. |
| talent_145 | Chill Recovery | Passive | Absolute Zero | Any | Applying Slowed or Exhausted restores 1 Energy; Stunned or Frozen restores 2. |
| talent_146 | Static Charge | Passive | Blinding Light | Any | Hits against Electrified enemies build charges; 5 charges restore 2 Energy. |
| talent_147 | Chain Reaction | Passive | Static Charge | Any | Reapplying Electrified deals 20% Spell Power as Lightning damage to another random enemy. |
| talent_148 | Rapid Discharge | Passive | Chain Reaction | Any | Every fourth hit in one turn reduces a random cooldown by 1. |
| talent_149 | Ride the Lightning | Ability | Rapid Discharge | Any | Unlocks Ride the Lightning. |
| talent_150 | Smoke | Passive | Ride the Lightning | Any | Ride the Lightning grants Stealth until the end of the next turn and grants +1 Energy regeneration. |
| talent_151 | Charge | Ability | Blinding Light | Any | Unlocks Charge. |
| talent_152 | Phoenix Heart | Passive | Rapid Fire | Any | The first lethal hit each combat while Burning consumes the player's Burn and restores Health equal to its remaining damage. |
| talent_153 | Charged Up | Passive | Charge | Any | Applying Electrified grants +2 Initiative until combat ends. |
| talent_154 | Perfect Calculation | Passive | Focused Blast | Any | Cannot miss enemies with at least 3 Arcane Wounds. |
| talent_155 | Deep Chill | Passive | Absolute Zero | Any | Every enemy attack, hit or miss, has a 3% chance to apply Frozen to its attacker. |
| talent_156 | Elemental Fury | Ability | Perfect Calculation or Deep Chill | Any | Unlocks Elemental Fury. |
| talent_157 | Brute Force | Passive | Brute | Any | +2 Strength, +2 Vitality, and +1 Energy regeneration. |
| talent_158 | Searing Strike | Ability | Brute Force | Any | Unlocks Searing Strike. |
| talent_159 | Wounding Strike | Ability | Brute Force | Any | Unlocks Wounding Strike. |
| talent_160 | Swift Blade | Ability | Brute Force | Any | Unlocks Swift Blade. |
| talent_161 | Armored | Passive | Swift Blade | Any | +2 Armor. |
| talent_162 | Armored | Passive | Wounding Strike | Any | +2 Armor. |
| talent_163 | Armored | Passive | Searing Strike | Any | +2 Armor. |
| talent_164 | Open Wounds | Passive | Armored (Wounding) or Armored (Swift) | Any | Damaging attacks against Bleeding enemies have a 20% chance to apply 1 Bleed. |
| talent_165 | Heavy Plating | Passive | Armored (Wounding) or Armored (Searing) | Any | Adds Armor equal to 10% Strength, rounded up. |
| talent_166 | Burning Momentum | Passive | Armored (Searing) | Any | Player Burn damage against enemies grants +1 Initiative until combat ends. |
| talent_167 | Divine Vigor | Passive | Armored (Swift) | Any | +2 Vitality; restoring Health has a 50% chance to restore 1 Energy. |
| talent_168 | Flame Cleave | Ability | Burning Momentum | Any | Unlocks Flame Cleave. |
| talent_169 | Shield Bash | Ability | Heavy Plating | Any | Unlocks Shield Bash. |
| talent_170 | Bloodletting | Ability | Open Wounds | Any | Unlocks Bloodletting. |
| talent_171 | Holy Strike | Ability | Divine Vigor | Any | Unlocks Holy Strike: 50% Physical Power plus 50% Spell Power damage and 8% Max Health restoration. |
| talent_172 | Sacred Vigor | Passive | Holy Strike | Any | Restoring Health grants Strengthened for 1 turn. |
| talent_173 | Scorching Sweep | Passive | Flame Cleave | Any | Flame Cleave applies 2 Burn to already Burning targets. |
| talent_174 | Wildfire Cleave | Passive | Scorching Sweep | Any | Flame Cleave deals 20% more damage per living Burning enemy. |
| talent_175 | Improved Holy Strike | Passive | Sacred Vigor | Any | Holy Strike has a 10% chance to apply Smite. |
| talent_176 | Concussive Bash | Passive | Shield Bash | Any | Shield Bash gains a 5% Stun chance plus 0.1 percentage points per Armor. |
| talent_177 | Hemorrhage | Passive | Bloodletting | Any | Applying at least 3 Bleed with Bloodletting immediately triggers Bleed damage once. |
| talent_178 | Quick Guard | Passive | Concussive Bash | Any | Shield Bash costs 1 less Energy. |
| talent_179 | Bloodier-Letting | Passive | Hemorrhage or Bloodlust | Any | Bloodletting applies 1 Bleed per 2 existing stacks instead of per 3. |
| talent_180 | Light Metal | Passive | Holy Strike | Any | Swift Blade grants +2 Energy regeneration next turn instead of +1. |
| talent_181 | Bloodlust | Passive | Bloodletting | Any | Deals 15% more damage against Bleeding targets. |
| talent_182 | Readiness | Passive | Shield Bash or Quick Guard | Any | Once per turn, gaining Guard grants +1 Energy regeneration next turn. |
| talent_183 | Fiery Weapon | Passive | Flame Cleave | Any | Searing Strike applies 2 Burn instead of 1. |
| talent_184 | Unbreakable | Ability | Readiness | Any | Unlocks Unbreakable. |
| talent_185 | Blood Barrier | Ability | Bloodlust | Any | Unlocks Blood Barrier. |
| talent_186 | Burning Guard | Ability | Fiery Weapon | Any | Unlocks Burning Guard. |
| talent_187 | Lay on Hands | Ability | Light Metal | Any | Unlocks Lay on Hands. |
| talent_188 | Thick Blood | Passive | Blood Barrier | Any | Blood Barrier no longer consumes Bleed. |
| talent_189 | Counter | Passive | Unbreakable | Any | Unbreakable grants +2 Energy regeneration next turn. |
| talent_190 | Magical Fires | Passive | Burning Guard | Any | Burning Guard also gains Guard equal to 50% Spell Power. |
| talent_191 | Cleansing Hands | Passive | Lay on Hands | Any | Lay on Hands removes every debuff from the player and grants +10% Spell Power. |
| talent_192 | Fortified | Passive | Unbreakable | Any | Grants 10% more Armor after flat and Strength-derived Armor. |
| talent_193 | Eye for an Eye | Passive | Blood Barrier | Any | Whenever an enemy applies Bleed to the player, applies 1 Bleed to that enemy. |
| talent_194 | Critical Judgement | Passive | Cleansing Hands | Any | Critical strikes apply Vulnerable. |
| talent_195 | Scorched Wounds | Passive | Magical Fires | Any | Applies 1 Burn on critical strikes and grants +10 Spell Power. |
| talent_196 | Shield Charge | Ability | Fortified | Any | Unlocks Shield Charge. |
| talent_197 | Bloodbath | Ability | Eye for an Eye | Any | Unlocks Bloodbath. |
| talent_198 | Furnace Breaker | Ability | Scorched Wounds | Any | Unlocks Furnace Breaker. |
| talent_199 | Divine Smite | Ability | Critical Judgement | Any | Unlocks Divine Smite. |
| talent_200 | Critical Burns | Passive | Furnace Breaker | Any | +2% Critical Strike Chance. |
| talent_201 | Super Critical Burns | Passive | Critical Burns | Any | +2% Critical Strike Chance; applying Burn also applies Charred. |
| talent_202 | Guided | Passive | Divine Smite | Any | +2% Critical Strike Chance. |
| talent_203 | Word Above | Passive | Guided | Any | +2% Critical Strike Chance; critical strikes have a 20% chance to apply Smite. |
| talent_204 | Shatter Armor | Passive | Shield Charge | Any | Stunning an enemy also applies Shatter. |
| talent_205 | Molten Metal | Passive | Shatter Armor or Burning Guard | Any | Dealing direct or status damage while Guarded applies 1 Burn. |
| talent_206 | Berserk | Passive | Bloodbath | Any | Taking a Critical Strike grants Fierce for 3 turns. |
| talent_207 | Cannibal | Passive | Berserk or Lay on Hands | Any | Player-applied Bleed damage has a 20% chance to restore 20% of the damage dealt. |
| talent_208 | Blood Frenzy | Ability | Berserk | Any | Unlocks Blood Frenzy. |
| talent_209 | Crushing Impact | Ability | Shatter Armor | Any | Unlocks Crushing Impact. |
| talent_210 | Explosive Strike | Ability | Critical Burns | Any | Unlocks Explosive Strike. |
| talent_211 | Consecrated Ground | Ability | Guided | Any | Unlocks Consecrated Ground. |
| talent_212 | Renewal | Passive | Consecrated Ground | Any | Restoring Health has a 50% chance to reduce one random ability cooldown by 1 turn. |
| talent_213 | Flameborn | Passive | Explosive Strike | Any | Burn damage grants Barrier equal to 50% of the damage taken. |
| talent_214 | Swift Wounding Strike | Passive | Berserk | Any | Wounding Strike no longer has a cooldown. |
| talent_215 | Stronger Shield | Passive | Shatter Armor | Any | Shield Bash gains damage equal to 10% of Armor. |
| talent_216 | Stronger Bash | Passive | Stronger Shield | Any | Shield Bash gains 20% additional Physical Power scaling. |
| talent_217 | Perfected Wounding Strike | Passive | Swift Wounding Strike or Stronger Bash | Any | Wounding Strike applies 2 Bleed. |
| talent_218 | Imbued Weapon | Passive | Super Critical Burns | Any | Searing Strike scales with Spell Power, costs 2 Energy, has a 1-turn cooldown, and applies 2 Burn. |
| talent_219 | Divine Blade | Passive | Word Above | Any | Swift Blade gains +20% Critical Strike Chance and a 20% chance to apply Smite. |
| talent_220 | Anger | Passive | Swift Wounding Strike | Any | Starts combat with Fierce. |
| talent_221 | Prepared | Passive | Stronger Shield | Any | Starts combat with Guard equal to 3% Max Health. |
| talent_222 | Flameheart | Passive | Furnace Breaker | Any | +2 Max Energy. |
| talent_223 | Heavenly Protection | Passive | Divine Smite | Any | Starts combat with Barrier equal to 3% Max Health. |
| talent_224 | Recklessness | Passive | Armored (`talent_162`) | Any | -5 Max Energy and +3 Energy regeneration. |
| talent_225 | Martyrdom | Passive | Heavenly Protection | Any | Starting combat at full Health sacrifices 20% Max Health, ignoring Guard and Barrier. |
| talent_226 | Fire Within | Passive | Flameheart | Any | Starts combat with 1 Burn on the player. |
| talent_227 | Light the Fuse | Passive | Searing Strike | Any | Burn damage to the player restores 1 Energy. |
| talent_228 | Time to Breathe | Passive | Swift Blade | Any | The first drop below 40% Health each combat grants Regenerate. |
| talent_229 | Guard | Ability | Prepared | Any | Unlocks the Brute Guard ability. |
| talent_230 | Defensive Maneuvers | Passive | Quick Guard | Any | Gaining Guard deals 50% Armor as Physical damage to a random enemy. |
| talent_231 | Infected Wounds | Passive | Hemorrhage | Any | Applying Bleed has a 20% chance to also apply Poison. |
| talent_232 | Vampirism | Ability | Anger | Any | Unlocks Vampirism. |
| talent_233 | Fire Eater | Ability | Flameheart | Any | Unlocks Fire Eater. |
| talent_234 | Beacon of Light | Ability | Heavenly Protection | Any | Unlocks Beacon of Light. |
| talent_235 | Oath 1 | Passive | Divine Smite | Any | +5% Spell Power. |
| talent_236 | Oath 2 | Passive | Oath 1 | Any | +5% Spell Power. |
| talent_237 | Oath 3 | Passive | Oath 2 | Any | +10% Spell Power. |
| talent_238 | Oath 4 | Passive | Oath 3 | Any | +15% Spell Power. |
| talent_239 | Emberfused 1 | Passive | Furnace Breaker | Any | +5 Spell Power and +2% Physical Power. |
| talent_240 | Emberfused 2 | Passive | Emberfused 1 | Any | +5 Spell Power and +2% Physical Power. |
| talent_241 | Emberfused 3 | Passive | Emberfused 2 | Any | +10 Spell Power and +4% Physical Power. |
| talent_242 | Emberfused 4 | Passive | Emberfused 3 | Any | +15 Spell Power and +5% Physical Power. |
| talent_243 | Mystic Power 1 | Passive | Arcane Blast or Frostbolt | Any | +5 Spell Power. |
| talent_244 | Mystic Power 2 | Passive | Mystic Power 1 | Any | +5 Spell Power. |
| talent_245 | Mystic Power 3 | Passive | Mystic Power 2 | Any | +5 Spell Power. |
| talent_246 | Mystic Power 4 | Passive | Mystic Power 3, Lower Temperature, or Arcane Knowledge | Any | +10% Spell Power. |
| talent_247 | Sharpened Intellect 1 | Passive | Greater Pyromania | Any | +5 Intelligence. |
| talent_248 | Sharpened Intellect 2 | Passive | Sharpened Intellect 1 | Any | +10% Intelligence. |
| talent_249 | Spellslinger 1 | Passive | Chain Reaction | Any | +3% Hit Chance. |
| talent_250 | Spellslinger 2 | Passive | Spellslinger 1 | Any | +3% Hit Chance and +3% Critical Strike Chance. |
| talent_251 | Powerful 1 | Passive | Recuperate | Any | +5 Physical Power. |
| talent_252 | Powerful 2 | Passive | Powerful 1 | Any | +5 Physical Power. |
| talent_253 | Powerful 3 | Passive | Powerful 2 | Any | +10% Physical Power. |
| talent_254 | Nimble 1 | Passive | Immaculate Timing | Any | +2 Initiative and +2 Agility. |
| talent_255 | Nimble 2 | Passive | Nimble 1 | Any | +2 Initiative and +2 Agility. |
| talent_256 | Nimble 3 | Passive | Nimble 2 | Any | +2 Initiative and +10% Agility. |
| talent_257 | Spellblade | Passive | Thunderstruck | Any | +20% Spell Power. |
| talent_258 | Study | Passive | Resistance | Any | +10% Spell Power and +5 Intelligence. |

The three Brute Armor nodes intentionally share the player-facing name Armored. Internal IDs remain stable for save compatibility.

## Status effects

The duration is the default duration created by the status library. Ability or talent modifiers can override it. Stackable statuses add stacks when reapplied; other statuses refresh without adding stacks.

### Buffs

| Status | Duration | Stackable | Effect |
| --- | ---: | --- | --- |
| Guard | Until next turn start | Yes | Absorbs incoming damage before Health. Player talents or gear may explicitly extend it; enemy Guard always expires at the start of that enemy's next turn. |
| Barrier | 3 turns | Yes | Absorbs incoming damage before Health. Its displayed amount is reduced by absorbed damage and it disappears at zero. |
| Strengthened | 3 turns | No | Deals 20% more Physical damage. |
| Enlightened | 3 turns | No | Deals 20% more Arcane, Fire, Frost, and Lightning damage. |
| Fierce | 3 turns | No | +20% Critical Strike Chance. |
| Shielded | 3 turns | No | Takes 25% less damage. |
| Regenerate | 3 turns | No | Heals at turn start for `3 + 20% source Spell Power` per stack, then applies healing-received modifiers. |
| Taunt | Permanent | No | Forces the player to target this living, visible enemy with single-target attacks. |
| Stealth | Until the end of the holder's next turn | No | Cannot be targeted. An enemy that applies Stealth during its round-1 turn remains Stealthed through its round-2 turn, then loses Stealth at that turn's end. The status tooltip says “your next turn” for the player and “their next turn” for an enemy. Reapplication refreshes duration but never adds stacks, and longer explicit or legacy durations are normalized. |
| Evasion | 1 turn | No | +60% Dodge Chance until the next turn by default, subject to the 50% Dodge cap; Enduring Evasion changes magnitude and duration. |
| Distraction | Until consumed | No | The next ability costs 0 Energy. Removed when an ability is used. |
| Pinpoint | Until consumed | No | The next damaging ability is guaranteed to critically strike. Removed when that ability is used. |
| Frozen Path | 3 turns | No | Grants +30% Dodge Chance by default, subject to the 50% Dodge cap. |
| Static Charge | Until 5 charges | Yes | At 5 charges, all charges are removed and 2 Energy is restored. |
| Charged Up | Until combat ends | Yes | Each stack grants +2 Initiative. |
| Burning Momentum | Until combat ends | Yes | Each stack grants +1 Initiative. |
| Diminishing Returns | 3 turns | No | Granted immediately when Stunned ends. Prevents every new Stunned application. |

### Debuffs

| Status | Duration | Stackable | Effect |
| --- | ---: | --- | --- |
| Poison | 3 turns | Yes | At turn end, takes Spell Damage per stack equal to `1 + 11.25% source Spell Power`; Magic Resistance is 50% effective against the combined tick. |
| Bleed | 3 turns | Yes | After using an ability/attack, takes Physical damage per stack equal to `1 + 7.5% source Physical Power`; Armor is 50% effective against the combined trigger. |
| Burn | 3 turns | Yes | At turn start, takes Fire damage per stack equal to `1 + 10% source Spell Power`; Magic Resistance is 50% effective against the combined tick. |
| Weaken | 3 turns | No | Deals 25% less damage. |
| Shatter | 3 turns | No | Effective Armor is reduced by 50%. |
| Vulnerable | 3 turns | No | Takes 25% more damage from all sources. |
| Chained | 2 turns | No | Cannot flee. Enemy attack abilities in recommended-level-6-and-higher story encounters have one 10% chance to apply it when at least one hit lands. |
| Stunned | 1 turn | No | Skips the next turn, then grants Diminishing Returns for 3 turns. On the player, breaks when damage leaves them below 30% Health. |
| Exhausted | 1 turn | No | Energy regeneration is limited to 1 on the next turn. |
| Slowed | 1 turn | No | Sets Initiative to 0 until the end of the affected combatant's next turn. It cannot grant another action in the current round. |
| Reckless | 3 turns | No | Takes damage equal to 50% of direct damage it deals, rounded with a minimum of 1. |
| Wet | 3 turns | No | Takes 50% more Lightning damage and 50% less Fire damage. |
| Electrified | 3 turns | No | Has a 10% chance at turn start to become Stunned and skip that turn. |
| Cold | 3 turns | No | Takes 50% more Frost damage and 50% less Lightning damage. |
| Charred | 3 turns | No | Takes 50% more Fire damage and 50% less Frost damage. |
| Frozen | 1 turn | No | Cannot act and skips the next turn. Enemies thaw upon taking damage; the player breaks free when damage leaves them below 30% Health. |
| Blind | 3 turns | No | Raw Hit Chance is reduced by 75% before the target's Dodge Chance and the global 20% minimum final Hit Chance are applied. |
| Nullify | Until the end of your next turn | No | Spell Power is reduced by 90%. |
| Disarm | Until the end of your next turn | No | Physical Power is reduced by 90%. |
| Arcane Wound | 3 turns | Yes | Each existing stack adds 10% of the caster's Spell Power to Arcane Blast against the afflicted target; Arcane Knowledge raises this to 15%. |
| Arcane Charge | 3 turns or until consumed | No | The next Arcane Blast used against the afflicted target costs 0 Energy, then removes Arcane Charge. |
| Smite | 3 turns | No | Whenever the player restores Health, takes Magic damage equal to 50% of the Health actually restored. |
| Sleep | 3 turns | No | Cannot act and has a 20% chance to wake at turn start. Enemies wake upon taking damage; the player wakes when damage leaves them below 30% Health. |

For the player only, crossing below 30% Health while affected by Stunned, Frozen, or Sleep removes all three action-blocking controls and starts a survival window. The player remains at a minimum of 1 Health and cannot receive another action-blocking control until using an ability or consumable, or ending the turn. The same window starts when one of these effects actually skips the player's turn. Enemies receive neither the low-Health control break nor the survival window.

## Enemies

Enemy Physical Power, Spell Power, Starting Energy, Max Energy, Energy Regeneration, and Critical Strike Chance are configured per template. Starting Energy defaults to Max Energy for current definitions that omit a separate value. Attacks are implemented as explicit abilities rather than an implicit default attack. Every enemy template owns a full bestiary illustration and a head portrait cropped from the same design. The portrait appears on its combat card and opens the full illustration together with the complete stat and defense summary when pressed. Enemies with more than one action per turn resolve and present each ability separately.

| Enemy | Health | Physical / Spell Power | Armor / Magic Resistance | Hit / Dodge / Crit | Start / Regen / Max Energy | Abilities |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| DUMMY | 100 | 1 / 0 | 0 / 0 | 95% / 0% / 0% | 10 / 1 / 10 | Training Strike (1 Energy, Melee): 1 base Physical damage. |
| Rabid Rat | 11 | 1 / 0 | 0 / 0 | 95% / 5% / 10% | 3 / 1 / 3 | Bite (2, Melee): 100% Physical Power. Scurry (0, self): +1 Energy next turn. Rabid Bite (3, Melee): 100% Physical Power and 1 Poison. |
| Windsong Wolf | 20 | 2 / 0 | 0 / 0 | 95% / 10% / 10% | 6 / 1 / 6 | Howl (0, Ranged): Vulnerable. Bite and Claw (2, Melee): two 50% Physical Power hits, each with 20% Bleed chance. |
| Forest Wisp | 9 | 0 / 2 | 0 / 1 | 95% / 5% / 5% | 4 / 1 / 4 | Wisp Blast (1, Ranged): random 50–100% Spell Power as Arcane damage and 10% Weaken chance; repeats until Energy is spent, then Stuns itself for its next turn. |
| Brown Bear | 30 | 3 / 0 | 5 / 0 | 85% / 5% / 5% | 6 / 0 / 6 | Maul (3, Melee): 100% Physical Power and 1 Bleed. Hibernate (0, self): Sleep and +6 Energy next turn. Roar (3, Ranged): Weaken and Vulnerable. |
| The Forest Spirit | 40 | 0 / 8 | 1 / 1 | 95% / 10% / 10% | 10 / 2 / 10 | Fade Out (3, self): Stealth until the end of its next turn and +2 Energy next turn. Burning Glare (2, Ranged beam): 75% Spell Power as Fire damage and 1 Burn. Nature's Beam (3, Ranged beam): 100% Spell Power as Arcane damage and Weaken. Shimmer (0, self): full Energy next turn. |
| Goblin Longseer | 30 | 5 / 0 | 1 / 1 | 95% / 8% / 5% | 1 / 1 / 5 | Bow Shot (0, Ranged): 100% Physical Power. Snipe (5, Ranged): 200% Physical Power and Vulnerable. Replaces Bow Shot with Snipe at full Energy. |
| Goblin Quickstabber | 24 | 6 / 0 | 1 / 0 | 95% / 10% / 10% | 5 / 1 / 5 | Stealth (0, self): Stealth until the end of its next turn. Shiv (2, Melee): 100% Physical Power and 1 Poison. Uses every ready ability, separately, up to two actions. |
| Goblin Woundfixer | 28 | 2 / 6 | 0 / 3 | 95% / 5% / 5% | 10 / 2 / 10 | Heal (3, Ranged): restores 100% Spell Power to the most wounded living ally, including itself. Hex (1, Melee): 50% Spell Power as Spell damage and Slowed. |
| Goblin Biggrown | 40 | 6 / 0 | 4 / 0 | 95% / 0% / 5% | 3 / 1 / 5 | Protect (1, group): grants 5 Guard to every other living enemy. Heavy Cleave (5, Melee): 250% Physical Power and 1 Bleed. |
| Striz, Goblin Chieftain | 80 | 10 / 6 | 4 / 4 | 95% / 5% / 5% | 10 / 1 / 10 | Rally (1, group): Fierce for every living enemy. Skewer (1, Melee): 100% Physical Power and 1 Bleed. Impale (3, Melee): charges for one turn, then deals 150% Physical Power and applies 2 Bleed. Spear Poke (2, Melee): 75% Physical Power. Can resolve several ready abilities separately. |
| Hill Troll | 98 | 10 / 0 | 2 / 2 | 90% / 5% / 5% | 10 / 1 / 10 | Club Smash (10, Melee): charges for one turn, then deals 250% Physical Power. Nap (1, self): restores 15% maximum Health, gains Sleep, and gains +10 Energy regeneration next turn. |
| Mountain Troll | 121 | 10 / 0 | 4 / 1 | 80% / 0% / 5% | 10 / 1 / 10 | Heavy Fists (5, Melee): four 80% Physical Power hits. Roar (2, self): Fierce. Nap (0, self): restores 15% maximum Health, gains Sleep, and gains +10 Energy regeneration next turn. |
| Hill Troll Shaman | 79 | 6 / 10 | 1 / 4 | 95% / 5% / 5% | 10 / 1 / 10 | Heal (2, Ranged): restores 200% Spell Power to the most wounded ally. Regeneration (2, Ranged): Regenerate on the most wounded other enemy. Greater Hex (1, Ranged): 150% Spell Power, Weaken, and Slowed. Nap (0, self): restores 15% maximum Health and gains Sleep. |
| Highfall Bandit Enforcer | 54 | 8 / 0 | 4 / 1 | 95% / 5% / 5% | 5 / 1 / 10 | Steal (1, Melee): 100% Physical Power and steals up to 10 Gold. Stealth (1, self): Stealth and restores 10 Energy. Poisoned Stab (6, Melee): 50% Physical Power and 3 Poison. Can resolve up to two ready abilities separately. |
| Highfall Loot Goblin | 40 | 0 / 0 | 0 / 0 | 95% / 10% / 5% | 5 / 1 / 10 | Flee (10, self): escapes combat with all of its loot. |
| Highfall Bandit Trapper | 46 | 10 / 0 | 2 / 1 | 95% / 5% / 5% | 10 / 1 / 10 | Bow Shot (2, Ranged): 80% Physical Power. Fire Trap (2, Ranged): 1 Burn. Snipe (2, Ranged): 200% Physical Power. |
| Troll Bandit King, Klaus | 198 | 15 / 0 | 0 / 0 | 95% / 0% / 5% | 0 / 2 / 10 | Patience (0, self): 10 Guard. No Patience (10, Melee): 150% Physical Power and permanently changes behavior. Toying (1, Melee): 50% Physical Power and 20% Vulnerable chance. |

The Forest Spirit always enters with two Forest Wisps and restores 25% of maximum Health whenever one of those allies dies.

The five goblins use role-specific Highlands artwork set on open green plains rather than forest scenery. Their combat portraits are dedicated square crops from the same designs. Bow Shot and Snipe use distinct arrow/crosshair projectiles, friendly healing travels between combatants, group buffs resolve simultaneously on their recipients, and Striz visibly continues shaking while Impale is charged.

The seven Highfall enemies use dedicated full illustrations and matching combat portraits. Bandits, trolls, the Loot Goblin, and Klaus are staged on a steep mountain path. Their abilities reuse distinct impact, projectile, healing, status, charge, and escape VFX; a Loot Goblin that successfully flees is removed from combat and awards neither its item drops nor enemy-defeat quest progress.

Each enemy drop-table row rolls independently for each defeated instance. Repeating the same item on several rows creates separate chances for additional copies.

| Enemy | Live drop-table rows |
| --- | --- |
| DUMMY | None. |
| Rabid Rat | Rats Tail 80%; Galehide Striders 1%; Wolfstep Loop 1%. |
| Windsong Wolf | Wolf Fang 20%; Fur 60%; Galehide Jerkin 4%; Bramblefang 3%. |
| Forest Wisp | Wisp Essence 50%; Wispwoven Leggings 0.8%; Wispwoven Band 0.8%; Moondrop Wand 0.8%; Whisperbloom Tonic 2%. |
| Brown Bear | Bear Claw 50%; Thornbark Visor 8%; Thornbark Buckler 8%. |
| The Forest Spirit | Windsong Staff 100%; Windsong Sword 100%; Windsong Dagger 100%; Wisp Essence 80%; Thornbark Visor 2%; Thornbark Buckler 2%. |
| Goblin Longseer | Metal Scrap 30%; Linen Scraps 80% twice; Goblin Scavanger Hood 20%. |
| Goblin Quickstabber | Metal Scrap 30%; Minor Healing Potion 10%; Linen Scraps 100%, 80%, and 60%; each Goblin Scavanger set piece 10%. |
| Goblin Woundfixer | Metal Scrap 20%; Yumberries 5%; Hexcaster Staff 18%; Linen Scraps 80%; Hexcaster Hood 10%. |
| Goblin Biggrown | Metal Scrap 100%; Linen Scraps 80% twice; each Goblin Scavanger set piece 20%. |
| Striz, Goblin Chieftain | Minor Healing Potion 60%; Metal Scrap 100%, 100%, and 60%; Linen Scraps 100%; each Goblin Scavanger set piece 20%. |
| Hill Troll | Bear Claw 10%; Simple Plate Pantaloons 10%; Spider Silk Thread 10%; Metal Scrap 10%; Trollbane 4%; Trollforged Greathelm 5%; Trollforged Warboots 5%; Highfall Frostroot 18%. |
| Mountain Troll | Simple Plate Boots 10%; Metal Scrap 10%; Healing Potion 5%; Spider Silk Thread 20%; Small Bloodberry 50%; Trollbane 5%; Trollforged Breastplate 5%; Trollforged Legguards 5%. |
| Hill Troll Shaman | Hexcaster Staff 5%; Spider Silk Thread 10%; Metal Scrap 10%; Healing Potion 10%; Trollbane 4%; Mountain Staff 8%; Runewoven Cowl 5%; Runewoven Boots 5%; Highfall Frostroot 30%; Stonebloom Draught 8%. |
| Highfall Bandit Enforcer | Spider Silk Thread 10%; Metal Scrap 10%; Bandits Kiss 6%; Nightveil Cowl 5%; Nightveil Jerkin 5%. |
| Highfall Loot Goblin | Every Goblin Scavanger and Platemonger piece 20%; Hexcaster Robes and Hood 20%; Hexcaster Staff 10%. All rows are lost if it flees. |
| Highfall Bandit Trapper | Bear Claw 10%; Spider Silk Thread 10%; Bandits Kiss 5%; Nightveil Legwraps 5%; Nightveil Treads 5%. |
| Troll Bandit King, Klaus | Trollbane 7%; Bandits Kiss 7%; Runewoven Robes 5%; Runewoven Leggings 5%. |

## Arkenfall Town

The town hub is listed above adventures and contains eight illustrated service destinations across its main menu and Shops submenu. Each of the five item vendors buys one Inventory copy at a time for 25% of its Gold Cost, rounded down, with a minimum return of 1 Gold for a positive-value item.

| Destination | Services | Live default catalog |
| --- | --- | --- |
| Blacksmith — Brunhilde von Trott | Repeatable Shop purchases, material-based Crafting, and Inventory selling. | Sells Metal Scrap. Crafts the three original Windsong weapons, Thornbark Visor, Thornbark Buckler, Bramblefang, and the four Simple Plate pieces. |
| Alchemist — Ray Charlston | Repeatable Shop purchases, potion Brewing, and Inventory selling. | Sells Minor Healing Potion. Brews Minor Healing Potion and Whisperbloom Tonic. |
| Tailor — Mirelle Threadgold | Repeatable Shop purchases, material-based Tailoring, and Inventory selling. | Sells Spider Silk Thread after Windsong Forest is completed. Crafts Wispwoven Leggings immediately and Hexcaster Robes and Hood after that completion. |
| Leatherworker — Torren Hidehand | Repeatable Shop purchases, material-based Leatherworking, and Inventory selling. | Crafts Galehide Jerkin and Galehide Striders. |
| Jeweler — Celestine Veyra | Repeatable Shop purchases, material-based Jewelcrafting, and Inventory selling. | Crafts Wispwoven Band, Moondrop Wand, and Wolfstep Loop. |
| The Resting Hart | Paid recovery, next-combat meals, and The Gilded Dice. | Rest costs 1 Gold per 5 missing Health, rounded up. Ironpot Stew costs 5 Gold and grants Strengthened; Peppercrust Boar costs 8 Gold and grants Fierce; Hartroot Broth costs 10 Gold and grants Regenerate. Each meal benefit is applied when the next combat begins and may be prepared once at a time. The Gilded Dice offers 5, 10, and 25 Gold Luck wagers; its hidden difficulty rises after each roll and resets on adventure completion. |
| Quest Board | Accepting, tracking, inspecting rewards, and turning in quests and questlines. | Uses dedicated generated town artwork. Rewards are withheld until a ready quest is turned in at the board. |
| Grand Arena | One safe ten-turn damage trial when each story adventure is completed for the first time, XP equal to 20% of damage dealt rounded down, and a personal top-ten leaderboard. Replays grant no attempt. | Arena Champion: 1,000,000 Health, 0 Armor, 0 Magic Resistance; Contemptuous Tap deals 1 base Physical damage. Arena Health is temporary, prepared meals are preserved, and arena defeat does not delete the character. |

### Adventure shop progression

Every first completion immediately and permanently adds the following two entries to each listed shop. Earlier stock remains available. The nine matching-name artisan pairs are two-piece sets; every Jeweler entry is a ring wearable by any class with a distinct executable build effect.

| Completed adventure | Blacksmith | Alchemist | Tailor | Leatherworker | Jeweler |
| --- | --- | --- | --- | --- | --- |
| Windsong Forest | Canopy-Forged Shortsword; Barkbound Buckler | Windsong Remedy; Bottled Tailwind | Whisperleaf Hood; Wayfarer's Sash | Briarhide Jerkin; Softstep Boots | Venomcoil Ring; Bulwark Band |
| Arkenfall Highlands | Highland Cleaver; Windscarred Helm | Highland Restorative; Cliffside Courage | Skyweave Robe; Heatherstep Slippers | Galehunter Vest; Galehunter Leggings | Quietstep Signet; Cinder Loop |
| Highfall Mountains | Cragforged Maul; Cragforged Cuirass | Highfall Elixir; Stoneblood Draught | Cloudpeak Cowl; Cloudpeak Robes | Goatpath Leathers; Goatpath Treads | Bloodletter's Seal; Static Fang Ring |
| Mirefen Marsh | Bog-Iron Hatchet; Mireplate Greaves | Mirefen Lifebloom; Purewater Antivenom | Fenweaver Hood; Fenweaver Wraps | Reedstalker Coat; Reedstalker Boots | Rimebound Band; Woundkeeper Ring |
| Ashen Foundry | Ash Tempered Blade; Foundry Wardshield | Foundry Heart-Tonic; Cooling Ember Salve | Sootscribe Mantle; Sootscribe Sandals | Cinderhide Vest; Cinderhide Legguards | Immolator's Loop; Wardweaver Circle |
| Sunken Reliquary | Drowned Temple Spear; Relicguard Helm | Reliquary Panacea; Pearlwater Infusion | Tidecaller's Vestments; Tidecaller's Slippers | Tidestrider Coat; Tidestrider Leggings | Stormcaller's Band; Consecrated Seal |
| Nightglass Citadel | Nightguard Dirk; Nightguard Breastplate | Nightglass Elixir; Bottled Eclipse | Mirror-Silk Hood; Mirror-Silk Robes | Veilrunner Jerkin; Veilrunner Boots | Opportunist's Mark; Furnaceguard Ring |
| Frostbound Expanse | Rimebone Axe; Glacier Bulwark | Frostheart Restorative; Thawing Aurora | Rimeweaver Crown; Rimeweaver Vestments | Whitewind Leathers; Whitewind Treads | Avalanche Signet; Crimson Feast Ring |
| Stormspire Aerie | Stormspire Glaive; Thunderhead Plate | Stormspire Vitality; Condensed Thunder | Tempest-Silk Cowl; Tempest-Silk Robes | Skystrider Harness; Skystrider Legguards | Tempest Circuit; Virulent Promise |
| The Hollow Crown | Crownless Greatsword; Hollowguard Sabatons | Crownless Reprieve; Royal Rejuvenant | Gravecourt Hood; Gravecourt Vestments | Crownstalker Coat; Crownstalker Boots | Crownless Bastion Ring; Elemental Conflux Ring |
| The Astral Scar | Starward Warhammer; Starward Aegis | Astral Renewal; Distilled Starlight | Cometweave Crown; Cometweave Robes | Voidwalker Harness; Voidwalker Leggings | Astral Fracture Ring; Perfect Execution Ring |
| The World Below | Deepforge Cleaver; Rootsteel Cuirass | Worldroot Elixir; Essence of the First Echo | First-Echo Veil; First-Echo Vestments | Abysswalker Leathers; Abysswalker Treads | Worldroot Seal; First Flame Circle |

The specialization-ring effects progress as follows:

| Ring | Supported build | Unique effect |
| --- | --- | --- |
| Venomcoil Ring | Poison | Poison deals 10% more damage. |
| Bulwark Band | Guard | Generates 10% more Guard. |
| Quietstep Signet | Stealth | Deals 12% more damage while Stealthed. |
| Cinder Loop | Fire | Burn deals 12% more damage. |
| Bloodletter's Seal | Bleed | Bleed deals 15% more damage. |
| Static Fang Ring | Shockblade | Electrified lasts 1 additional turn. |
| Rimebound Band | Frost | Deals 14% more Frost damage to Slowed or Frozen enemies. |
| Woundkeeper Ring | Arcane Wound | Arcane Wound lasts 1 additional turn. |
| Immolator's Loop | Self-Immolation | Deals 18% more Fire damage while Burning. |
| Wardweaver Circle | Barrier | Begins combat with Barrier equal to 6% of maximum Health. |
| Stormcaller's Band | Lightning | Applies 1 additional Electrified stack. |
| Consecrated Seal | Smite | Applies 1 additional Smite stack. |
| Opportunist's Mark | Debuff exploitation | Deals 2.5% more damage per unique target debuff. |
| Furnaceguard Ring | Burning Guard | Deals 15% more Fire damage while Guarded. |
| Avalanche Signet | Frost control | Deals 18% more damage to Frozen enemies. |
| Crimson Feast Ring | Vampiric Bleed | Bleed restores Health equal to 10% of its damage. |
| Tempest Circuit | Electrified burst | Deals 20% more Lightning damage to Electrified enemies. |
| Virulent Promise | Venom debilitation | Applying Poison has a 20% chance to also apply Weaken. |
| Crownless Bastion Ring | Fortress | Begins combat with 15% maximum-Health Guard and generates 15% more Guard. |
| Elemental Conflux Ring | Elemental Fury | Deals 3% more damage per unique target debuff. |
| Astral Fracture Ring | Arcane detonation | Deals 25% more Arcane damage to enemies with Arcane Wound. |
| Perfect Execution Ring | Critical execution | The first Critical Strike each turn restores 1 Energy. |
| Worldroot Seal | Undying guardian | The first lethal hit each combat instead restores 20% maximum Health. |
| First Flame Circle | Affliction mastery | Poison, Burn, and Bleed deal 30% more damage. |

### Live quests

The live catalog contains **39 quests** across four ordered questlines. Quest Board projects at most six relevant postings at once and a character may track at most six accepted quests. Required collect-item copies are consumed at turn-in.

**Storehouse Troubles** remains the three-part introduction: defeat 3 Rabid Rats for 35 XP and a Minor Healing Potion, bring 2 Rats Tails for 50 XP, then complete Windsong Forest for 100 XP and a Wisp Essence.

The other three questlines each cover all twelve adventures. Every row below represents one enemy bounty in **The Roadwarden's Ledger**, one material hand-in in **Guild Requisitions**, and one completion report in **The Chronicle of Arkenfall**.

| Adventure | Enemy bounty | Material requisition | Completion report reward |
| --- | --- | --- | --- |
| Windsong Forest | 3 Windsong Wolves; 60 XP and Minor Healing Potion. | 2 Wisp Essence; 75 XP. | 120 XP and 2 Fur. |
| Arkenfall Highlands | 4 Goblin Quickstabbers; 160 XP. | 3 Linen Scraps; 190 XP and Spider Silk Thread. | 350 XP and Spider Silk Thread. |
| Highfall Mountains | 3 Hill Trolls; 300 XP. | 3 Highfall Frostroot; 340 XP and Highfall Restorative. | 650 XP and Stonebloom Draught. |
| Mirefen Marsh | 4 Mirefen Spitters; 600 XP and Mirefen Antivenom. | 3 Venom Sacs; 650 XP and Mirefen Antivenom. | 1,150 XP and 2 Bog Iron. |
| Ashen Foundry | 4 Furnace Acolytes; 850 XP and Cooling Salve. | 3 Ember Core Fragments; 900 XP and Cooling Salve. | 1,650 XP and 2 Cindersteel Ore. |
| Sunken Reliquary | 5 Drowned Acolytes; 1,150 XP and Coagulant Bandage. | 3 Drowned Relic Shards; 1,250 XP and Coagulant Bandage. | 2,300 XP and 2 Abyssal Pearls. |
| Nightglass Citadel | 5 Mirror Stalkers; 1,500 XP and Bloodstone. | 4 Nightglass Shards; 1,650 XP and Umbral Silk. | 3,200 XP and 2 Bloodstones. |
| Frostbound Expanse | 5 Icebound Raiders; 2,000 XP and White Pelt. | 4 Frostheart Crystals; 2,200 XP and 2 White Pelts. | 4,200 XP and 2 Rimebone. |
| Stormspire Aerie | 5 Storm Channelers; 2,700 XP and Cloudfeather. | 4 Condensed Storm Essence; 2,950 XP and 2 Cloudfeathers. | 5,400 XP and 2 Skyiron. |
| The Hollow Crown | 6 Veilbound Executioners; 3,500 XP and Soul Ash. | 4 Crown Shards; 3,800 XP and 2 Soul Ash. | 6,800 XP and 2 Hollowsteel. |
| The Astral Scar | 6 Astral Devourers; 4,300 XP and Comet Silk. | 4 Astral Glass; 4,700 XP and 2 Comet Silk. | 8,000 XP and 2 Star Metal. |
| The World Below | 6 Deep Oracles; 2 Worldroot Heartwood. | 5 First Echoes; 2 Abyssal Hide. | Worldsplitter. |

Explicit item fields are authoritative: `arkenfallVendor: null` means the item is not sold in town, and a missing recipe means it is not craftable. Vendor stock and crafting recipes may independently require completion of a selected story adventure; unmet entries remain completely hidden from the corresponding town tab. Hexcaster Staff currently has no recipe.

| Craftable item | Station | Ingredients | Adventure requirement |
| --- | --- | --- | --- |
| Minor Healing Potion | Alchemist | 2 Small Bloodberries, 1 Rats Tail | None. |
| Windsong Staff | Blacksmith | 2 Wisp Essence, 1 Fur | None. |
| Windsong Sword | Blacksmith | 2 Bear Claws, 1 Fur | None. |
| Windsong Dagger | Blacksmith | 2 Wolf Fangs, 1 Fur | None. |
| Simple Plate Helmet | Blacksmith | 4 Metal Scrap | None. |
| Simple Plate Harness | Blacksmith | 5 Metal Scrap, 1 Fur | None. |
| Simple Plate Boots | Blacksmith | 3 Metal Scrap | None. |
| Simple Plate Pantaloons | Blacksmith | 5 Metal Scrap | None. |
| Hexcaster Robes | Tailor | 6 Linen Scraps, 2 Spider Silk Thread | Windsong Forest completed. |
| Hexcaster Hood | Tailor | 4 Linen Scraps, 1 Spider Silk Thread | Windsong Forest completed. |
| Thornbark Visor | Blacksmith | 1 Bear Claw, 2 Fur | None. |
| Thornbark Buckler | Blacksmith | 1 Bear Claw, 3 Fur | None. |
| Galehide Jerkin | Leatherworker | 3 Fur, 1 Wolf Fang | None. |
| Galehide Striders | Leatherworker | 2 Fur, 2 Rats Tails | None. |
| Wispwoven Leggings | Tailor | 2 Fur, 2 Wisp Essence | None. |
| Wispwoven Band | Jeweler | 2 Wisp Essence, 1 Wolf Fang | None. |
| Bramblefang | Blacksmith | 2 Wolf Fangs, 1 Bear Claw | None. |
| Moondrop Wand | Jeweler | 2 Wisp Essence, 1 Wolf Fang | None. |
| Wolfstep Loop | Jeweler | 2 Wolf Fangs, 1 Rats Tail | None. |
| Whisperbloom Tonic | Alchemist | 1 Rats Tail, 1 Wisp Essence | None. |

## Adventure: Windsong Forest

Windsong Forest uses the travel loading text **“Walking beneath the Windsong canopy”** and follows nine ordered stages. Stages with several possibilities make one weighted roll from the listed chances.

| Stage | Possibility | Chance | Enemies/event | Reward |
| ---: | --- | ---: | --- | --- |
| 1 — Forest Edge | Rustling in the Clover | 100% | Two Rabid Rats | 55 XP, 3 gold; stage roll: Mystical Ring 10%. |
| 2 — Wayfarer's Trail | Prowling Ambush | 100% | Windsong Wolf | 61 XP, 8 gold. |
| 3 — Thick Forest | Stalked by Wolves | 40% | Attribute-check event | Outcome-dependent. |
| 3 — Thick Forest | Brown Bear | 20% | Brown Bear | 78 XP, 8 gold. |
| 3 — Thick Forest | The Bear | 40% | Attribute-check event | Outcome-dependent. |
| 4 — Mossy Cliffs | Skittering Rats | 100% | Three Rabid Rats | 65 XP, 6 gold. |
| 5 — Forest Trail | Wandering Merchant | 100% | Direct-choice merchant event | Outcome-dependent. |
| 6 — Forest Depths | Unwelcome Guest | 100% | Forest Wisp | 49 XP, 5 gold. |
| 7 — Dense Forest | Colorful Berries | 100% | Attribute-check event | Outcome-dependent. |
| 8 — Dark Forest | They see you | 100% | Three Forest Wisps | 63 XP, 13 gold. |
| 9 — The Clearing | The Forest Spirit | 100% | Forest Spirit and two Forest Wisps | 100 XP, 28 gold. |

Event definitions support two or three choices. Each choice can resolve through an attribute check or a direct outcome with no roll. Outcomes contain ordered effect lists that can combine Health, gold, current-level experience, Talent Points, Attribute Points, items, statuses carried into the next combat, immediate rewarded encounters, and Wandering Merchants stocked with selected live items.

The four current event definitions are:

- **Stalked by Wolves:** Agility 29, Strength 31, or Intelligence 34. Success grants 10 XP or Fierce for the next combat; failed physical approaches can immediately encounter two Windsong Wolves for 71 XP and 5 gold, while another failure applies Weaken in the next combat.
- **The Bear:** Strength 40, Agility 40, or Intelligence 40. Successful Strength and Intelligence approaches can grant 10 gold. Failed physical approaches can immediately encounter a Brown Bear for 60 XP and 10 gold; failed Intelligence applies Weaken in the next combat.
- **Colorful Berries:** two Intelligence 10 choices. Success grants Yumberries or restores 10 Health; failure may do nothing or apply Poison in the next combat.
- **Wandering Merchant:** a direct choice with no roll. The merchant stocks Minor Healing Potion, Old Robes, Dusty Boots, Old Armor, Dusty Cowl, and Old Leather Pants.

The ten Uncommon Windsong additions use low, creature-themed enemy drops. Repeated rats and Wisps use 0.8–2% rows per defeated instance, the single Windsong Wolf uses 3–4%, Brown Bear uses 8% for each Thornbark piece because its normal stage appearance is only a 20% possibility, and The Forest Spirit adds a separate 2% chance for each Thornbark piece.

Every Wandering Merchant also buys any gear, consumable, or ordinary item currently in the character's Inventory. One copy is sold per action for 25% of its live Gold Cost, rounded down to whole Gold with a minimum value of 1 Gold for items worth more than zero.

Enemy templates and adventure stages may each define item drop tables. Every configured item chance is rolled independently; enemy tables roll once per defeated instance and the current stage table rolls once per combat victory. Enemy tables may repeat an item on several rows to give each possible copy its own chance. Drop tables may reference any live gear, consumable, or ordinary item.

## Adventure: Arkenfall Highlands

Arkenfall Highlands uses the travel loading text **“Crossing the windswept highlands”**, contains nine ordered stages, and unlocks after Windsong Forest is completed. Its adventure card and combat board use dedicated open-highland artwork with rolling grassland, exposed stone, distant mountains, sparse trees, and far-off travelers.

| Stage | Possibility | Chance | Enemies/event | Reward |
| ---: | --- | ---: | --- | --- |
| 1 — Entering the Highlands | Encounter | 100% | Goblin Longseer + Windsong Wolf | 81 XP, 8 gold. |
| 2 — Stage 2 | New Encounter | 100% | Goblin Quickstabber | 95 XP, 8 gold. |
| 3 — Stage 3 | The Collapsed Watchtower | 100% | Event | Choice-dependent; stage entry lists 50 XP and 8 gold. |
| 4 — Stage 4 | Goblin patrol | 50% | Goblin Longseer + Goblin Woundfixer + Goblin Quickstabber | 121 XP, 16 gold. |
| 4 — Stage 4 | Goblin patrol | 50% | Goblin Biggrown + 2 Goblin Woundfixers | 121 XP, 16 gold. |
| 5 — Stage 5 | Highlands Merchant | 100% | Event | Choice-dependent; stage entry lists 50 XP and 8 gold. |
| 6 — Stage 6 | Encounter | 100% | 2 Goblin Biggrowns | 88 XP, 12 gold. |
| 7 — Stage 7 | Goblin Toll Bridge | 100% | Event | Choice-dependent; stage entry lists 50 XP and 8 gold. |
| 8 — Stage 8 | Large Goblin Patrol | 50% | Event | Choice-dependent; stage entry lists 50 XP and 8 gold. |
| 8 — Stage 8 | Large Goblin Patrol | 25% | 2 Goblin Longseers + Goblin Woundfixer | 111 XP, 16 gold. |
| 8 — Stage 8 | Large Goblin Patrol | 25% | 2 Goblin Woundfixers + Goblin Quickstabber | 111 XP, 16 gold. |
| 9 — Stage 9 | Boss | 100% | Goblin Biggrown + Striz, Goblin Chieftain + Goblin Woundfixer | 215 XP, 85 gold. |

## Adventure: Highfall Mountains

Highfall Mountains uses the travel loading text **“Climbing into the Highfall Mountains”**, contains eleven ordered stages, and unlocks after Arkenfall Highlands is completed. Stages 2 and 6 are recovery-focused events, stage 8 is an ancient cairn event, stage 9 is the Highfall Merchant, and stage 11 is the final boss.

| Stage | Possibility | Chance | Enemies/event | Reward |
| ---: | --- | ---: | --- | --- |
| 1 — The Lower Pass | The Bandit's Toll | 100% | Highfall Bandit Enforcer + Trapper | 145 XP, 22 gold; stage roll: Highfall Frostroot 15%. |
| 2 — The Sheltered Spring | The Sheltered Spring | 100% | Recovery event | Guaranteed 30-Health option; high-chance potion and Frostroot choices. |
| 3 — Troll Country | Troll Country | 100% | Hill Troll | 135 XP, 20 gold; stage roll: Highfall Restorative 8%. |
| 4 — Cliffside Ambush | Cliffside Crossfire | 50% | Highfall Bandit Enforcer + Trapper | 155 XP, 28 gold; stage roll: Highfall Frostroot 20%. |
| 4 — Cliffside Ambush | Tripwire Alley | 50% | 2 Highfall Bandit Trappers | 165 XP, 30 gold; stage roll: Highfall Frostroot 20%. |
| 5 — The Broken Causeway | The Broken Causeway | 90% | Hill Troll | 140 XP, 22 gold; stage roll: Highfall Restorative 10%. |
| 5 — The Broken Causeway | A Goblin and Its Bodyguard | 10% | Hill Troll + Highfall Loot Goblin | 190 XP, 40 gold; stage roll: Highfall Restorative 10%. |
| 6 — Stormbound Camp | Stormbound Camp | 100% | Recovery event | Guaranteed 25-Health option; the medic's crate always awards one Highfall potion. |
| 7 — The High Slopes | The Mountain Stirs | 65% | Mountain Troll | 180 XP, 32 gold; stage roll: Stonebloom Draught 10%. |
| 7 — The High Slopes | Rites of the High Slopes | 35% | Mountain Troll + Hill Troll Shaman | 260 XP, 48 gold; stage roll: Stonebloom Draught 10%. |
| 8 — The Frozen Cairn | The Frozen Cairn | 100% | Rune and offering event | Choice-dependent; can award Cairnkeeper's Loop. |
| 9 — The Last Trading Post | Highfall Merchant | 100% | Direct-choice merchant event | Sells the four new Highfall items and three rare Highfall weapons. |
| 10 — The King's Guard | The King's Trolls | 60% | Mountain Troll + Hill Troll Shaman | 270 XP, 55 gold; stage roll: Cairnkeeper's Loop 5%. |
| 10 — The King's Guard | The King's Cutthroats | 40% | Highfall Bandit Enforcer + 2 Trappers | 250 XP, 60 gold; stage roll: Cairnkeeper's Loop 5%. |
| 11 — The Crown of Highfall | Troll Bandit King, Klaus | 100% | Troll Bandit King, Klaus | 420 XP, 140 gold; stage rolls: Cairnkeeper's Loop 20%, Stonebloom Draught 35%. |

The Highfall events are **The Sheltered Spring**, **Stormbound Camp**, **The Frozen Cairn**, and **Highfall Merchant**. Their choices combine direct recovery, high-probability healing-item finds, attribute checks, next-combat statuses, the Cairnkeeper's Loop reward, and the adventure's dedicated merchant stock.

## Late-campaign adventures

Adventures 4–12 form one linear route after Highfall Mountains. Each has three canonical events: a dangerous shortcut, a forgotten relic, and an abandoned refuge. Every event offers two increasing d100 checks and one safe direct choice. Successful checks award experience, Gold, healing, or local materials; failure can remove Health, apply a next-combat debuff, strengthen enemies, or launch an immediate encounter. Every normal combat, boss, and event-triggered immediate encounter in this route now grants exactly 50% of its original enemy XP, rounded down. For reference, Mirefen's opening combat now grants 150 XP and its boss grants 450 XP; The World Below opens at 430 XP and ends with 1,290 boss XP. Direct event XP and quest rewards are unchanged. The exact choices, thresholds, effects, stages, encounter weights, and rewards are stored in `ADVENTURE_EVENTS` and `ADVENTURES` and are editable through Event Manager and Adventure Editor.

| Adventure | Recommended level | Stages | Main tactics | Final boss |
| --- | ---: | ---: | --- | --- |
| Mirefen Marsh | 13 | 12 | Poison, Bleed, Wet, and Guard. | Vespara, Broodmother: establishes Poison pressure, charges Venomous Broodfall, then exposes a recovery turn. |
| Ashen Foundry | 18 | 13 | Burn, Charred, Guard, and sustained Fire damage. | The Furnace Tyrant: raises furnace pressure, charges Foundry Cataclysm, then vents and becomes punishable. |
| Sunken Reliquary | 23 | 14 | Wet, Electrified, Barrier, and Shatter. | Nhalos, the Drowned Seer: prepares the flooded font, charges Drowned Prophecy, then loses momentum. |
| Nightglass Citadel | 28 | 15 | Stealth, Blind, Bleed, Shatter, Exhausted, rare Reckless, and Evasion. | Lady Noctra, the Last Reflection: vanishes, charges Mirrorfall, then re-forms during a recovery window. |
| Frostbound Expanse | 34 | 16 | Cold, Frozen, Blind, Exhausted, rare Sleep, Guard, and frost control. | Skara, the White Maw: establishes Frozen pressure, charges Whiteout Devour, then recovers in the broken ice. |
| Stormspire Aerie | 40 | 17 | Electrified, Exhausted, rare Reckless, Stunned, Evasion, and Guard. | Vaelith, the Tempest Roc: electrifies the field, charges Tempest Unbound, then lands in a vulnerable recovery state. |
| The Hollow Crown | 46 | 18 | Guard, Burn, Bleed, Exhausted, rare Sleep, Weaken, Vulnerable, Stealth, and Arcane Wound. | Aldren, the Hollow King: marks the party Vulnerable, charges Crownfall, then recovers before repeating the cycle. |
| The Astral Scar | 49 | 20 | Arcane Wound, Blind, Vulnerable, Burn, Slow, Exhausted, rare Reckless, and Weaken. | Seraphel, the Fallen Star: collapses the heavens around the target, charges Starfall Extinction, then restores itself behind Guard. |
| The World Below | 50 | 22 | Guard, Bleed, Blind, Burn, Stealth, Exhausted, rare Sleep, Weaken, and Vulnerable. | Eidolon, the First Hunger: begins to unmake its target, charges The World Devours, then retreats behind ancient defenses. |

The final stage of each late adventure contains its boss plus two role-complementary adds. Every Adventure 4–12 boss has 30% more Max Health than the route's original generated curve, rounded to the nearest whole point. After that curve is applied, every enemy template in Adventures 7–12—including bosses—gains 100 Max Health and then has the resulting total increased by 50%, rounded to the nearest whole point. Every enemy template in Adventures 9–12 also has both its generated Physical Power and Spell Power increased by 30%, rounded to the nearest whole point. Bosses begin with 10 Energy, may resolve two ready actions per turn, and prioritize their setup/charged/recovery sequence. Combat and stage rewards rise with each recommended level. The generated late-campaign enemy roster contains exactly seven templates per biome:

Adventures 5–12 add the following defenses to every enemy template after its generated base stats. The local boss receives twice the listed Armor and Magic Resistance bonus.

| Adventure | Regular-enemy Armor bonus | Regular-enemy Magic Resistance bonus | Boss Armor bonus | Boss Magic Resistance bonus |
| --- | ---: | ---: | ---: | ---: |
| 5 — Ashen Foundry | +10 | +10 | +20 | +20 |
| 6 — Sunken Reliquary | +20 | +15 | +40 | +30 |
| 7 — Nightglass Citadel | +25 | +20 | +50 | +40 |
| 8 — Frostbound Expanse | +30 | +30 | +60 | +60 |
| 9 — Stormspire Aerie | +35 | +35 | +70 | +70 |
| 10 — The Hollow Crown | +10 | +50 | +20 | +100 |
| 11 — The Astral Scar | +50 | +10 | +100 | +20 |
| 12 — The World Below | +100 | +100 | +200 | +200 |

| Adventure | Enemy roster |
| --- | --- |
| Mirefen Marsh | Reed Stalker; Bog Leech; Mirefen Spitter; Drowned Warden; Fen Witch; Brood Guard; Vespara, Broodmother. |
| Ashen Foundry | Ash Hound; Cinder Smith; Slag Elemental; Furnace Acolyte; Ironbound Overseer; Spark Swarm; The Furnace Tyrant. |
| Sunken Reliquary | Brine Crawler; Drowned Acolyte; Relic Sentinel; Vault Shock Eel; Tidebound Knight; Siren Oracle; Nhalos, the Drowned Seer. |
| Nightglass Citadel | Mirror Stalker; Gloom Archer; Bloodbound Knight; Shard Magus; Veil Dancer; Reflection Wraith; Lady Noctra, the Last Reflection. |
| Frostbound Expanse | Rime Wolf; Icebound Raider; Aurora Wisp; Frost Hermit; Glacier Golem; Snowblind Harrier; Skara, the White Maw. |
| Stormspire Aerie | Thunder Talon; Spire Zealot; Storm Channeler; Cloud Djinn; Thunderhead Colossus; Chainwing Matron; Vaelith, the Tempest Roc. |
| The Hollow Crown | Crownless Guard; Ashen Confessor; Veilbound Executioner; Hollow Courtier; Crown Seraph; The Royal Shadow; Aldren, the Hollow King. |
| The Astral Scar | Starved Pilgrim; Glasswing Moth; Fallen Astrologer; Comet Hound; Gravity Warden; Astral Devourer; Seraphel, the Fallen Star. |
| The World Below | Rootless Titan; Pale Burrower; Deep Oracle; Worldvein Elemental; Firstborn Shade; Abyssal Choir; Eidolon, the First Hunger. |

All 63 templates have dedicated full artwork and matching combat portraits. Every ordinary late enemy now has at least three named executable abilities and one of four readable tactical roles: status setup/payoff, defensive stance, evasive ambush, or ally support. The former Savage Strike, Ruinous Bolt, and Relentless Pressure placeholders are no longer used in this route. Every boss has five abilities: its setup, status-amplified charged execution, defensive recovery, unique below-40%-Health phase, and a basic recovery-turn attack. From Adventure 7 onward, exactly one regular enemy per adventure applies one-turn Exhausted: Gloom Archer, Frost Hermit, Storm Channeler, Veilbound Executioner, Gravity Warden, and Deep Oracle. Those adventures also contain exactly one rare Sleep or Reckless source each: Crimson Oath, Zealot's Brand, and Pilgrim's Burden have a 15% chance to apply two-turn Reckless, while Aurora Ray, Courtly Malice, and Unraveling Hymn have a 10% chance to apply one-turn Sleep. Each Adventure 7–12 roster additionally has one Nullify source and one separate Disarm source, both at 25% per successful hit: Shard Magus/Bloodbound Knight, Frost Hermit/Icebound Raider, Storm Channeler/Thunder Talon, Crown Seraph/Crownless Guard, Fallen Astrologer/Gravity Warden, and Deep Oracle/Rootless Titan respectively. Together with the twelve distinct Highlands and Highfall templates, 75 enemies from recommended level 4 onward use editable data-owned tactical AI.

### Late-campaign loot and crafting

Each late adventure contributes three ordinary crafting materials and two weapons. Adventures 4–9 contribute two five-piece sets each; The Hollow Crown, The Astral Scar, and The World Below contribute three sets each. Set pieces and weapons can drop independently from local enemies and stages. The two weapons and each set's ring are craftable after completing that same adventure. All recipes consume the biome's three materials. Adventure 4 gear is Uncommon, Adventures 5–7 gear is Rare, and Epic gear begins with Adventure 8. Legendary set pieces and weapons begin dropping in The Astral Scar and continue in The World Below; both adventures' crafting materials remain Epic.

| Adventure | Materials | Weapons | Sets |
| --- | --- | --- | --- |
| Mirefen Marsh | Bog Iron; Venom Sac; Mire Reed | Bogcleaver; Witchlight Wand | Fenwarden; Mirestalker |
| Ashen Foundry | Cindersteel Ore; Ember Core Fragment; Sootweave | Foundry Maul; Cinderbrand | Emberforged; Cinderweave |
| Sunken Reliquary | Abyssal Pearl; Drowned Relic Shard; Tideglass | Tidebreaker; Oracle's Tide Tome | Depthguard; Tidecaller |
| Nightglass Citadel | Nightglass Shard; Umbral Silk; Bloodstone | Mirrorfang; Eclipse Staff | Nightglass; Bloodbound |
| Frostbound Expanse | Rimebone; Frostheart Crystal; White Pelt | White Maw Greataxe; Aurora Wand | Rimeguard; Winterweave |
| Stormspire Aerie | Skyiron; Condensed Storm Essence; Cloudfeather | Skybreaker Spear; Stormcaller's Tome | Stormrunner; Tempest Sage |
| The Hollow Crown | Hollowsteel; Crown Shard; Soul Ash | Crown-Sunder; Staff of the Last Oracle | Crownless; Veilborn; Ashen Oracle |
| The Astral Scar | Star Metal; Astral Glass; Comet Silk | Cometfall; Staff of the Last Orrery | Starforged; Voidstrider; Astral Savant |
| The World Below | Worldroot Heartwood; First Echo; Abyssal Hide | Worldsplitter; Voice of the World Below | Worldroot Bastion; Deepstalker; First Tongue |

Every late set has Head, Chest, Pants, Boots, and Ring pieces and thresholds at 2, 3, 4, and 5 equipped pieces. The 2-piece bonus grants the set's primary attribute, the 3-piece bonus grants Physical or Spell Power, and the 4-piece bonus advances the set's status/defense identity. The executable 5-piece specials are:

| Set | Five-piece special |
| --- | --- |
| Fenwarden | Immune to Poison; Bleed deals 20% less damage. |
| Mirestalker | Applies 1 additional Poison stack; Poison deals 25% more damage. |
| Emberforged | Immune to Burn; begins combat with Guard equal to 12% of maximum Health. |
| Cinderweave | Burn deals 35% more damage and restores Health equal to 10% of its damage. |
| Depthguard | Immune to Wet; begins combat with Barrier equal to 15% of maximum Health. |
| Tidecaller | Applying Wet also applies Electrified; Electrified lasts 1 additional turn. |
| Nightglass | Begins combat in Stealth and grants +8% Dodge Chance. |
| Bloodbound | Bleed deals 35% more damage and restores Health equal to 15% of its damage. |
| Rimeguard | Immune to Cold and Frozen; takes 30% less damage while Stunned. |
| Winterweave | Applying Cold has a 15% chance to also Freeze; Cold deals 25% more damage. |
| Stormrunner | Electrified lasts 1 additional turn and grants +10% Dodge Chance. |
| Tempest Sage | Applies 1 additional Electrified stack and grants 12% more Spell Power. |
| Crownless | Begins combat with Guard equal to 20% of maximum Health and generates 25% more Guard. |
| Veilborn | Applies 1 additional Poison stack; Poison restores Health equal to 20% of its damage. |
| Ashen Oracle | Applying Burn also applies Arcane Wound; Burn deals 40% more damage. |
| Starforged | Immune to Arcane Wound; begins combat with Barrier equal to 22% of maximum Health. |
| Voidstrider | Immune to Blind and grants +12% Dodge Chance. |
| Astral Savant | Applies 1 additional Arcane Wound stack and grants 16% more Spell Power. |
| Worldroot Bastion | Begins combat with Guard equal to 25% of maximum Health and generates 35% more Guard. |
| Deepstalker | Bleed deals 45% more damage and restores Health equal to 20% of its damage. |
| First Tongue | Vulnerable lasts 1 additional turn and grants 18% more Spell Power. |

## Item catalog

### Available gear

New characters begin with no equipped gear and an empty inventory. The live catalog contains 354 items: 277 gear, 41 consumables, and 36 ordinary items. Item visuals are a two-part contract: the canonical item definition supplies content and optional source artwork, while the shared item-icon catalog supplies the optimized square icon used across runtime surfaces.

The supported rarity order is Common, Uncommon, Rare, Epic, then Legendary. Legendary gear begins with The Astral Scar. Every live item ID is registered in the shared optimized icon catalog.

| Item | Slot | Rarity | Gold Cost | Bonuses |
| --- | --- | --- | ---: | --- |
| Windsong Staff | Two-Hand weapon | Uncommon | 12 | +1 Intelligence, +1 Vitality, +1 Spell Power. |
| Windsong Sword | Main Hand weapon | Uncommon | 12 | +1 Strength, +1 Vitality. |
| Windsong Dagger | One-Hand weapon | Uncommon | 12 | +1 Agility, +1 Vitality. |
| Dusty Cowl | Head | Common | 10 | +1 Vitality. |
| Dusty Boots | Boots | Common | 8 | +3 Initiative and +1% Dodge Chance. |
| Old Armor | Chest | Common | 12 | +1 Strength. |
| Old Leather Pants | Pants | Common | 8 | +1 Agility. |
| Old Robes | Chest | Common | 12 | +1 Intelligence. |
| Mystical Ring | Head | Uncommon | 12 | +1 Agility, +1 Intelligence, +1 Strength, +1 Vitality, and +1 Luck. |
| Simple Plate Helmet | Head | Common | 12 | +1 Strength, +1 Vitality, and +1 Armor. |
| Simple Plate Harness | Chest | Common | 24 | +1 Strength, +1 Vitality, +1 Armor, and -1 Energy Regeneration. |
| Simple Plate Boots | Boots | Common | 18 | +1 Strength, +1 Vitality, +1 Armor, and -2 Initiative. |
| Simple Plate Pantaloons | Pants | Common | 12 | +1 Strength, +1 Vitality, +1 Armor, and -1% Dodge Chance. |
| Goblin Scavanger Hood | Head, Leather | Uncommon | 24 | +1 Vitality, +1 Agility, and +1 Armor; Goblin Scavanger set. |
| Goblin Scavanger Boots | Boots, Leather | Uncommon | 20 | +1 Agility, +1 Vitality, +1 Armor, +5 Initiative, and +2% Dodge Chance; Goblin Scavanger set. |
| Goblin Scavanger Harness | Chest, Cloth | Uncommon | 30 | +1 Strength, +1 Vitality, +1 Agility, +1 Luck, and +1 Armor; Goblin Scavanger set. |
| Hexcaster Robes | Chest, Cloth | Uncommon | 36 | +1 Vitality, +1 Intelligence, +1 Magic Resistance, and +1 Spell Power; Hexcaster set. |
| Hexcaster Hood | Head, Cloth | Uncommon | 12 | +2 Intelligence, +1 Magic Resistance, and +1% Hit Chance; Hexcaster set. |
| Hexcaster Staff | Two-Hand weapon | Rare | 12 | +1 Intelligence, +2 Vitality, +2 Spell Power, and +1% Hit Chance; Hexcaster set. |
| Nightveil Cowl | Head, Leather | Rare | 130 | +3 Agility, +1 Vitality, +1 Armor, and +2% Critical Strike Chance; Nightveil set. |
| Nightveil Jerkin | Chest, Leather | Rare | 190 | +3 Agility, +2 Vitality, +1 Luck, +2 Armor, and +1% Dodge Chance; Nightveil set. |
| Nightveil Legwraps | Pants, Leather | Rare | 165 | +3 Agility, +1 Vitality, +1 Luck, and +1 Armor; Nightveil set. |
| Nightveil Treads | Boots, Leather | Rare | 150 | +3 Agility, +1 Vitality, +1 Armor, +6 Initiative, and +2% Dodge Chance; Nightveil set. |
| Trollforged Greathelm | Head, Plate | Rare | 160 | +3 Strength, +2 Vitality, and +4 Armor; Trollforged set. |
| Trollforged Breastplate | Chest, Plate | Rare | 230 | +3 Strength, +3 Vitality, and +4 Armor; Trollforged set. |
| Trollforged Legguards | Pants, Plate | Rare | 200 | +2 Strength, +2 Vitality, +1 Luck, and +3 Armor; Trollforged set. |
| Trollforged Warboots | Boots, Plate | Rare | 175 | +2 Strength, +2 Vitality, +3 Armor, +1 Initiative, and +1% Hit Chance; Trollforged set. |
| Runewoven Cowl | Head, Cloth | Rare | 145 | +3 Intelligence, +1 Vitality, +1 Magic Resistance, and +1 Spell Power; Runewoven set. |
| Runewoven Robes | Chest, Cloth | Rare | 210 | +3 Intelligence, +2 Vitality, +1 Magic Resistance, and +1 Spell Power; Runewoven set. |
| Runewoven Leggings | Pants, Cloth | Rare | 185 | +3 Intelligence, +1 Vitality, +1 Luck, +1 Magic Resistance, and +1 Spell Power; Runewoven set. |
| Runewoven Boots | Boots, Cloth | Rare | 170 | +2 Intelligence, +1 Vitality, +1 Luck, +1 Magic Resistance, +1 Spell Power, and +2 Initiative; Runewoven set. |
| Trollbane | Two-Hand weapon | Rare | 120 | +4 Strength, +2 Vitality, and +1 Luck. |
| Bandits Kiss | One-Hand weapon | Rare | 90 | +3 Agility, +2 Vitality, and +2% Critical Strike Chance. |
| Mountain Staff | Two-Hand weapon | Rare | 120 | +2 Intelligence and +5 Vitality. |
| Cairnkeeper's Loop | Ring | Rare | 145 | +2 Intelligence, +1 Vitality, +2 Luck, +1 Magic Resistance, and +2 Initiative. |
| Thornbark Visor | Head, Plate | Uncommon | 38 | +1 Strength and +1 Armor; Thornbark Bulwark set. |
| Thornbark Buckler | Off Hand, Shield | Uncommon | 42 | +1 Strength and +1 Armor; Thornbark Bulwark set. |
| Galehide Jerkin | Chest, Leather | Uncommon | 40 | +1 Agility and +1 Armor; Galehide set. |
| Galehide Striders | Boots, Leather | Uncommon | 34 | +1 Agility and +2 Initiative; Galehide set. |
| Wispwoven Leggings | Pants, Cloth | Uncommon | 44 | +1 Intelligence and +1 Magic Resistance; Wispwoven set. |
| Wispwoven Band | Ring | Uncommon | 46 | +1 Intelligence and +1 Spell Power; Wispwoven set. |
| Bramblefang | One-Hand weapon | Uncommon | 48 | +1 Strength and +1 Physical Power. |
| Moondrop Wand | One-Hand weapon | Uncommon | 48 | +1 Intelligence and +1 Spell Power. |
| Wolfstep Loop | Ring | Uncommon | 36 | +1 Agility and +2 Initiative. |

### Consumables

Consumables use one inventory slot per copy and can be queued from the **Inventory** button during combat without ending the player's turn. Ray Charlston sells Minor Healing Potion in Arkenfall and can brew it from 2 Small Bloodberries and 1 Rats Tail. Event Manager can grant any live item.

| Item | Rarity | Gold Cost | Effects |
| --- | --- | ---: | --- |
| Yumberries | Common | 25 | Applies Regenerate to the player for 3 turns. |
| Minor Healing Potion | Common | 20 | Restores 20 Health. |
| Small Bloodberry | Common | 8 | Restores 5 Health. |
| Highfall Restorative | Uncommon | 55 | Restores 65 Health. |
| Stonebloom Draught | Rare | 60 | Restores 30 Health and applies Regenerate for 3 turns. |
| Whisperbloom Tonic | Uncommon | 30 | Restores 12 Health and 2 Energy. |
| Mirefen Antivenom | Uncommon | 45 | Removes Poison from the player. |
| Cooling Salve | Rare | 60 | Removes Burn from the player. |
| Coagulant Bandage | Rare | 75 | Removes Bleed from the player. |

### Other items

Ordinary items can be carried, granted, dropped, bought, and sold, but cannot be equipped or used in combat.

| Item | Rarity | Gold Cost | Description |
| --- | --- | ---: | --- |
| Fur | Common | 6 | A patch of fur from an animal. |
| Wolf Fang | Common | 4 | The fang of a wolf. |
| Rats Tail | Common | 4 | The tail of a rat. |
| Wisp Essence | Common | 20 | Magical essence that brings Wisps to life. |
| Bear Claw | Common | 10 | A claw as big as your head. |
| Metal Scrap | Common | 6 | A piece of metal. |
| Linen Scraps | Common | 0 | A scrap of cloth. |
| Spider Silk Thread | Uncommon | 15 | — |
| Highfall Frostroot | Uncommon | 18 | A hardy mountain root prized for its restorative properties. |

### Gear set bonuses

Only equipped pieces count toward a set bonus.

| Set | Pieces | Bonuses |
| --- | --- | --- |
| Goblin Scavanger | Hood, Boots, Harness | 2 pieces: +1 Agility. 3 pieces: +5% Critical Strike Chance. |
| Hexcaster | Robes, Hood, Staff | 2 pieces: +2 Spell Power. 3 pieces: +2 Intelligence. |
| Platemonger | Helmet, Chestplate, Sabatons | 2 pieces: +2 Strength. 3 pieces: +2 Vitality and +1 Armor. |
| Nightveil | Cowl, Jerkin, Legwraps, Treads | 2 pieces: +2 Agility. 3 pieces: +6% Critical Strike Chance. 4 pieces: Critical Strikes grant +20% Dodge Chance until the next turn. |
| Trollforged | Greathelm, Breastplate, Legguards, Warboots | 2 pieces: +3 Strength. 3 pieces: +3 Vitality and +2 Armor. 4 pieces: once per turn, taking Health damage grants 3 Guard. |
| Runewoven | Cowl, Robes, Leggings, Boots | 2 pieces: +3 Spell Power. 3 pieces: +3 Intelligence. 4 pieces: once per turn, dealing Magic damage restores 1 Energy. |
| Thornbark Bulwark | Visor, Buckler | 2 pieces: +1 Vitality. |
| Galehide | Jerkin, Striders | 2 pieces: +1 Vitality. |
| Wispwoven | Leggings, Band | 2 pieces: +1 Vitality. |
