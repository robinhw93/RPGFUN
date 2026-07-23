# Content reference

This is a snapshot of content currently defined in `src/game/data.ts` and `src/game/statusEffects.ts`. It distinguishes playable content from definitions that exist for future expansion.

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
| Stealth | 2 | 3 | Self | Enemies cannot target the player until the end of the player's next turn. |
| Evasion | 2 | 3 | Self | Grants +60% Dodge Chance until the next player turn. |
| Neurotoxin | 3 | 2 | Poisoned enemy | Consumes all Poison and applies Stunned. |
| Venomous Strike | 4 | 3 | Enemy | Deals 100% Physical Power, applies 2 Poison, and deals double direct damage if the target was already Poisoned. |
| Flurry | 4 | 2 | Random enemies | Makes five attacks for 40% Physical Power each. Every hit independently selects a valid random enemy and triggers on-hit effects. |
| Ambush | 2 | None | Enemy | Requires Stealth. Deals 150% Physical Power with +50% Critical Strike Chance. |
| Toxic Explosion | 5 | 2 | Poisoned enemy | Deals the target's remaining Poison duration immediately and removes Poison. |
| Venomborn | 2 | 6 | Poisoned enemy | Consumes Poison and heals the player for three turns of that Poison's current damage. |
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
| Epidemic | 3 (2 with Efficient Spread) | 10 | All enemies | Applies 10 Poison to every living, targetable enemy and grants Stealth until the end of the player's next turn. |
| Voltage Stab | 0 | 2 (1 with New Current) | Enemy | Deals 35% Spell Power as Lightning damage. Against an Electrified target, restores 2% of Max Health and grants +2 Energy regeneration next turn. |
| Bash | 1 | 1 | Enemy | Deals 60% Physical Power as Physical damage and has a 30% chance to grant +1 Energy regeneration next turn. Granted by the Brute class node. |
| Searing Strike | 3 | 3 | Enemy | Deals 90% Physical Power as Physical damage and applies 1 Burn; Fiery Weapon increases this to 2 Burn. Imbued Weapon changes the scaling to Spell Power, lowers the cost to 2, lowers the cooldown to 1, and applies 2 Burn. |
| Wounding Strike | 2 | 2 | Enemy | Deals 40% Physical Power as Physical damage and applies 1 Bleed. |
| Swift Blade | 0 | 2 | Enemy | Deals 40% Physical Power as Physical damage and grants +1 Energy regeneration next turn; Light Metal increases this to +2. |
| Flame Cleave | 4 | 3 | All enemies | Simultaneously deals 60% Physical Power as Physical damage and applies 1 Burn. Scorching Sweep applies 2 Burn to targets already Burning; Wildfire Cleave adds 20% damage per living Burning enemy. |
| Shield Bash | 2 (1 with Quick Guard) | 2 | Enemy | Deals 60% Physical Power as Physical damage and grants Guard equal to 10% of Armor. Concussive Bash adds a 5% Stun chance plus 0.1 percentage points per Armor. |
| Bloodletting | 3 | 2 | Enemy | Deals 75% Physical Power as Physical damage and applies 1 Bleed per 3 existing Bleed, or per 2 with Bloodier-Letting. Hemorrhage immediately triggers Bleed damage when at least 3 stacks are applied. |
| Holy Strike | 2 | 2 | Enemy | Deals 75% Physical Power as Physical damage and restores 2% Max Health. Improved Holy Strike increases the healing to 3% and adds a 10% chance to apply Smite. |
| Unbreakable | 3 | 5 | Self | Grants Guard equal to 100% of Armor. Counter also grants +2 Energy regeneration next turn. |
| Blood Barrier | 2 | 3 | Bleeding enemy | Consumes up to 5 Bleed and grants Guard equal to 10% Max Health per stack. Thick Blood calculates the same Guard without consuming Bleed. |
| Burning Guard | 2 | 4 | Self | Grants Guard equal to 50% Physical Power for 1 turn. If that Guard is destroyed, applies 3 Burn to the attacker. Magical Fires adds 50% Spell Power to the Guard amount. |
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
| Arcane Blast | 1 | None | Enemy | Deals 20% Spell Power as Arcane damage and then applies 1 Arcane Wound. Each existing stack increases Arcane Blast's direct damage by 10%. Costs 0 Energy against a target marked by Arcane Charge, then consumes that marker. |
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
| Mana Fracture | 1 | 3 | Enemy with Arcane Wound | Consumes all Arcane Wounds and restores 1 Energy per 2 stacks consumed. |
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
| Crushing Blow | 4 | None | Physical attack with 12 flat power plus Physical Power; applies Vulnerable. |
| Ground Slam | 6 | None | Physical area attack with 7 flat power plus Physical Power; each target has a base 45% Stun chance plus Luck's chance-effect bonus. |
| Sever | 3 | None | Shadow attack with 7 flat power plus Physical Power; applies Bleed. |
| Venom Edge | 4 | None | Shadow attack with 5 flat power plus Physical Power; applies Poison. |
| Essence Siphon | 4 | None | Arcane attack with 7 flat power plus Spell Power; restores 2 Energy after use. |

## Talent tree

The live tree has 263 nodes: the origin, four first-direction class nodes, 86 later Shadow nodes, 86 later Arcanist nodes, and 86 later Brute nodes. Branch counts are Shadow 87, Arcanist 87, Brute 87, and Cultist 1; the Talent Editor displays these values live. Every listed node currently costs 1 point except Wayfarer's Spark, which is free and starts unlocked.

Connections are bidirectional: unlocking either end can make the node at the other end available. Each edge is declared only once in the data. Every node uses **Any**, so one adjacent unlocked node is always enough.

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
| talent_65 | Panic | Passive | Hit and Run | Any | The first lethal hit each combat restores 20% of Max Health and grants Stealth for 2 turns. |
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
| talent_106 | Arcane Knowledge | Passive | Arcane Overload | Any | +2 Intelligence; Arcane Wounds grant Arcane Blast 15% damage per stack. |
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
| talent_171 | Holy Strike | Ability | Divine Vigor | Any | Unlocks Holy Strike. |
| talent_172 | Sacred Vigor | Passive | Holy Strike | Any | Restoring Health grants Strengthened for 1 turn. |
| talent_173 | Scorching Sweep | Passive | Flame Cleave | Any | Flame Cleave applies 2 Burn to already Burning targets. |
| talent_174 | Wildfire Cleave | Passive | Scorching Sweep | Any | Flame Cleave deals 20% more damage per living Burning enemy. |
| talent_175 | Improved Holy Strike | Passive | Sacred Vigor | Any | Holy Strike restores 3% Max Health and has a 10% chance to apply Smite. |
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
| Guard | 1 turn | Yes | Absorbs incoming damage before Health and normally expires at the owner's next turn start. |
| Barrier | 3 turns | Yes | Absorbs incoming damage before Health. Its displayed amount is reduced by absorbed damage and it disappears at zero. |
| Strengthened | 3 turns | No | Deals 20% more Physical damage. |
| Enlightened | 3 turns | No | Deals 20% more Arcane, Fire, Frost, and Lightning damage. |
| Fierce | 3 turns | No | +20% Critical Strike Chance. |
| Shielded | 3 turns | No | Takes 25% less damage. |
| Regenerate | 3 turns | No | Heals at turn start for `3 + 20% source Spell Power` per stack, then applies healing-received modifiers. |
| Taunt | Permanent | No | Forces the player to target this living, visible enemy with single-target attacks. |
| Stealth | Until the end of your next turn | No | Cannot be targeted by enemies. Reapplication refreshes duration but never adds stacks. |
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
| Poison | 3 turns | Yes | At turn end, takes Spell Damage per stack equal to `1 + 15% source Spell Power`; Magic Resistance is 50% effective against the combined tick. |
| Bleed | 3 turns | Yes | After using an ability/attack, takes Physical damage per stack equal to `1 + 10% source Physical Power`; Armor is 50% effective against the combined trigger. |
| Burn | 3 turns | Yes | At turn start, takes Fire damage per stack equal to `1 + 20% source Spell Power`; Magic Resistance is 50% effective against the combined tick. |
| Weaken | 3 turns | No | Deals 25% less damage. |
| Shatter | 3 turns | No | Effective Armor is reduced by 50%. |
| Vulnerable | 3 turns | No | Takes 25% more damage from all sources. |
| Stunned | 1 turn | No | Skips the next turn, then grants Diminishing Returns for 3 turns. |
| Exhausted | 1 turn | No | Energy regeneration is limited to 1 on the next turn. |
| Slowed | 1 turn | No | Sets Initiative to 0 until the end of the affected combatant's next turn. It cannot grant another action in the current round. |
| Reckless | 3 turns | No | Takes damage equal to 50% of direct damage it deals, rounded with a minimum of 1. |
| Wet | 3 turns | No | Takes 50% more Lightning damage and 50% less Fire damage. |
| Electrified | 3 turns | No | Has a 10% chance at turn start to become Stunned and skip that turn. |
| Cold | 3 turns | No | Takes 50% more Frost damage and 50% less Lightning damage. |
| Charred | 3 turns | No | Takes 50% more Fire damage and 50% less Frost damage. |
| Frozen | 1 turn | No | Cannot act and skips the next turn; ends immediately when damage is taken. |
| Blind | 3 turns | No | Raw Hit Chance is reduced by 75% before the target's Dodge Chance and the global 20% minimum final Hit Chance are applied. |
| Arcane Wound | 3 turns | Yes | Each stack increases Arcane Blast damage against the afflicted target by 10%. |
| Arcane Charge | 3 turns or until consumed | No | The next Arcane Blast used against the afflicted target costs 0 Energy, then removes Arcane Charge. |
| Smite | 3 turns | No | Whenever the player restores Health, takes Magic damage equal to 50% of the Health actually restored. |
| Sleep | 3 turns | No | Cannot act; has a 20% chance to wake at turn start and wakes immediately when taking damage. |

## Enemies

Enemy Physical Power, Spell Power, Max Energy, Energy Regeneration, and Critical Strike Chance are configured per template. Attacks are implemented as explicit abilities rather than an implicit default attack. The combat info button beside an enemy's Health opens its complete stat and defense summary. Enemies with more than one action per turn resolve and present each ability separately.

| Enemy | Health | Physical / Spell Power | Armor / Magic Resistance | Hit / Dodge / Crit | Regen / Max | Abilities |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| DUMMY | 100 | 1 / 0 | 0 / 0 | 95% / 0% / 0% | 1 / 10 | Training Strike (1 Energy, Melee): 1 base Physical damage. |
| Rabid Rat | 10 | 5 / 0 | 0 / 0 | 95% / 5% / 10% | 1 / 3 | Bite (2, Melee): 100% Physical Power. Scurry (0, self): +1 Energy next turn. Rabid Bite (3, Melee): 100% Physical Power and 1 Poison. |
| Windsong Wolf | 30 | 7 / 0 | 3 / 0 | 95% / 10% / 10% | 1 / 6 | Howl (0, Ranged): Vulnerable. Bite and Claw (2, Melee): two 50% Physical Power hits, each with 20% Bleed chance. |
| Forest Wisp | 10 | 0 / 10 | 0 / 3 | 95% / 40% / 5% | 2 / 5 | Wisp Blast (1, Ranged): 50% Spell Power as Arcane damage and 10% Weaken chance; repeats until Energy is spent. |
| Brown Bear | 50 | 10 / 0 | 5 / 0 | 85% / 5% / 5% | 0 / 6 | Maul (3, Melee): 100% Physical Power and 1 Bleed. Hibernate (0, self): Sleep and +6 Energy next turn. Roar (3, Ranged): Weaken and Vulnerable. |
| The Forest Spirit | 80 | 0 / 10 | 0 / 5 | 95% / 10% / 10% | 2 / 10 | Fade Out (3, self): Stealth and +2 Energy next turn. Burning Glare (2, Ranged beam): 75% Spell Power as Fire damage and 1 Burn. Nature's Beam (3, Ranged beam): 100% Spell Power as Arcane damage and Weaken. Shimmer (0, self): full Energy next turn. |

The Forest Spirit always enters with two Forest Wisps and restores 25% of maximum Health whenever one of those allies dies.

## Adventure: Windsong Forest

Windsong Forest currently follows six fixed combat stages. Each stage has one 100% encounter.

| Stage | Possibility | Chance | Enemies/event | Reward |
| ---: | --- | ---: | --- | --- |
| 1 | Rustling in the Clover | 100% | Two Rabid Rats | 50 XP, 3 gold. |
| 2 | Prowling Ambush | 100% | Windsong Wolf | 53 XP, 8 gold. |
| 3 | Skittering Rats | 100% | Three Rabid Rats | 73 XP, 6 gold. |
| 4 | Unwelcome Guest | 100% | Forest Wisp | 36 XP, 5 gold. |
| 5 | They see you | 100% | Three Forest Wisps | 68 XP, 10 gold. |
| 6 | The Forest Spirit | 100% | Forest Spirit and two Forest Wisps | 100 XP, 28 gold. |

## Testing adventure: Shadow Proving Grounds

| Property | Rule |
| --- | --- |
| Length | Endless; the fight counter has no maximum. |
| Encounter | Randomly two or three DUMMIES each fight. |
| Reward | The exact XP required for two complete levels; no gold. |
| Between fights | Restore full Health; Character, Talents, and Leave Training remain available from the score screen. |

## Equipment catalog

### Available items

New characters begin with no equipped gear and an empty inventory. The items below remain the canonical equipment catalog. Drop sources are currently unassigned while enemy-owned loot tables are being designed.

| Item | Slot/category | Rarity | Mechanical stats | Set |
| --- | --- | --- | --- | --- |
| Notched Iron Cleaver | One-Hand Axe | Uncommon | +3 Physical Power, +2 Strength | Ashborn Warplate |
| Embershard Focus | Off-Hand Tome | Rare | +2 Spell Power, +3 Intelligence | — |
| Wanderer's Hood | Leather Head | Common | +1 Armor, +1 Agility | — |
| Ashborn Cuirass | Plate Chest | Rare | +5 Armor, +2 Strength, +2 Vitality | Ashborn Warplate |
| Veilwalker Trousers | Leather Pants | Uncommon | +2 Armor, +2 Agility | Veilwalker's Guile; no set bonuses are currently defined. |
| Dustworn Boots | Leather Boots | Common | +1 Armor, +1 Vitality | — |
| Garnet Signet | Ring | Rare | +1 Strength, +2 Luck | — |
| Moonlit Coil | Ring | Epic | +1 Agility, +2 Intelligence, +1 Luck | — |
| Warden's Broken Crown | Plate Head | Epic | +4 Armor, +2 Strength, +3 Vitality | Ashborn Warplate |
| Forest Spirit Charm | Ring | Epic | +2 Armor, +3 Vitality, +2 Luck | — |
| Cowl of Quiet Sparks | Cloth Head | Uncommon | +2 Magic Resistance, +2 Intelligence | — |
| Nightstitch Vest | Leather Chest | Uncommon | +3 Armor, +2 Agility, +1 Vitality | — |
| Emberweave Robe | Cloth Chest | Rare | +1 Armor, +4 Magic Resistance, +3 Intelligence | — |
| Ashbound Legguards | Plate Pants | Rare | +4 Armor, +1 Strength, +2 Vitality | Ashborn Warplate |
| Runecloth Legwraps | Cloth Pants | Uncommon | +2 Magic Resistance, +2 Intelligence, +1 Luck | — |
| Ironmarch Sabatons | Plate Boots | Rare | +4 Armor, +1 Strength, +2 Vitality | — |
| Softstep Slippers | Cloth Boots | Uncommon | +1 Magic Resistance, +2 Agility, +1 Intelligence | — |
| Wayfarer's Copper Loop | Ring | Common | +1 Vitality, +1 Luck | — |
| Warden's Shortsword | Main-Hand Sword | Uncommon | +4 Physical Power, +2 Strength | — |
| Cinder Pilgrim's Mace | Main-Hand Mace | Rare | +5 Physical Power, +3 Strength, +1 Vitality | — |
| Veilglass Dagger | One-Hand Dagger | Rare | +3 Physical Power, +3 Agility | — |
| Ashen Conduit | One-Hand Wand | Epic | +5 Spell Power, +3 Intelligence, +1 Luck | — |
| Black Gate Buckler | Off-Hand Shield | Uncommon | +3 Armor, +2 Vitality | — |
| Roadcleaver Greatsword | Two-Hand Sword | Rare | +7 Physical Power, +4 Strength | — |
| Ashfall Greataxe | Two-Hand Axe | Epic | +8 Physical Power, +5 Strength, +1 Vitality | — |
| Gatebreaker Maul | Two-Hand Mace | Rare | +7 Physical Power, +4 Strength, +2 Vitality | — |
| Embercaller's Staff | Two-Hand Staff | Epic | +8 Spell Power, +5 Intelligence | — |
| Cinderwatch Polearm | Two-Hand Polearm | Rare | +7 Physical Power, +2 Strength, +3 Agility | — |

### Gear set bonuses

Only equipped pieces count.

| Set | Pieces | Bonus |
| --- | ---: | --- |
| Ashborn Warplate | 2 | +2 Strength. |
| Ashborn Warplate | 3 | Bleed deals 50% less damage to the player. |
| Ashborn Warplate | 4 | +3 Vitality. |
