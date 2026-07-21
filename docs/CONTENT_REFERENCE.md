# Content reference

This is a snapshot of content currently defined in `src/game/data.ts` and `src/game/statusEffects.ts`. It distinguishes playable content from definitions that exist for future expansion.

## Abilities

Cooldowns are measured in player turns. **None** means the ability can be repeated in the same turn as long as Energy and targeting requirements allow it.

### Core and currently obtainable abilities

| Ability | Energy | Cooldown | Target | Effect |
| --- | ---: | ---: | --- | --- |
| Strike | 0 | 1 | Enemy | Deals `5 + 100% Physical Power` as Physical damage. |
| Guard | 2 | None | Self | Grants base 6 Guard, multiplied by Guard generation, until the next turn. |
| Quick Slash | 1 | None | Enemy | Deals 50% Physical Power as Physical damage. |
| Twin Strike | 3 | 1 | Enemy | Hits twice for 50% Physical Power per hit. Each hit rolls and triggers on-hit effects separately. |
| Poison Stab | 3 | None | Enemy | Deals 50% Physical Power as Physical damage and applies 1 Poison. |
| Poison Cloud | 3 | 2 | All enemies | Applies 1 Poison without direct damage. |
| Contagion | 2 | 3 | Poisoned enemy | Copies all Poison stacks to another random living enemy without removing them from the selected enemy. |
| Stealth | 2 | 3 | Self | Enemies cannot target the player until the end of the player's next turn. |
| Evasion | 2 | 3 | Self | Grants +60% Dodge Chance until the next player turn. |
| Neurotoxin | 3 | 2 | Poisoned enemy | Consumes all Poison and applies Stunned. |
| Venomous Strike | 4 | 3 | Enemy | Deals 100% Physical Power, applies 2 Poison, and deals double direct damage if the target was already Poisoned. |
| Flurry | 4 | 2 | Random enemies | Makes five attacks for 50% Physical Power each. Every hit independently selects a valid random enemy and triggers on-hit effects. |
| Ambush | 2 | None | Enemy | Requires Stealth. Deals 150% Physical Power with +50% Critical Strike Chance. |
| Toxic Explosion | 5 | 2 | Poisoned enemy | Deals three turns of the target's current Poison damage immediately and removes Poison. |
| Venomborn | 2 | 6 | Poisoned enemy | Consumes Poison and heals the player for three turns of that Poison's current damage. |
| Lightning Strike | 5 | 4 | Enemy | Deals 50% Physical Power as Physical damage plus 50% Magical Power as Lightning damage, then applies Electrified for three turns. |
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
| Light Speed | 6 | 5 | Enemy | Deals 50% Physical Power as Physical damage plus 100% Magical Power as Lightning damage, applies Electrified, ends the current turn, and immediately begins a new player turn. |
| Chain Assassination | 5 | 3 | Enemy | Deals 125% Physical Power and gains +25% Critical Strike Chance while Stealthed. A kill refunds the Energy actually spent and resets its cooldown. |
| Cull the Weak | 5 | 3 | Enemy | Deals 25% Physical Power plus 25% Magical Power. Both components gain 20% damage per unique debuff on the target. |
| Epidemic | 3 | 10 | All enemies | Applies 10 Poison to every living, targetable enemy and grants Stealth until the end of the player's next turn. |
| Voltage Stab | 0 | 2 | Enemy | Deals 35% Magical Power as Lightning damage. Against an Electrified target, restores 2% of Max Health and grants +2 Energy regeneration next turn. |

### Defined but not currently connected to the live talent tree

These definitions are executable, but a normal new character cannot unlock or equip them through the current tree.

| Ability | Energy | Cooldown | Effect |
| --- | ---: | ---: | --- |
| Crushing Blow | 4 | None | Physical attack with 12 flat power plus Physical Power; applies Vulnerable. |
| Ground Slam | 6 | None | Physical area attack with 7 flat power plus Physical Power; each target has a base 45% Stun chance plus Luck's chance-effect bonus. |
| Sever | 3 | None | Shadow attack with 7 flat power plus Physical Power; applies Bleed. |
| Venom Edge | 4 | None | Shadow attack with 5 flat power plus Physical Power; applies Poison. |
| Arcane Bolt | 3 | None | Arcane attack with 9 flat power plus Magical Power. |
| Essence Siphon | 4 | None | Arcane attack with 7 flat power plus Magical Power; restores 2 Energy after use. |

## Talent tree

The live tree has 70 nodes: the origin, three first-direction class nodes, and 66 later Shadow nodes. Branch counts are Shadow 67, Arcanist 1, and Brute 1; the Talent Editor displays these values live. Every listed node currently costs 1 point except Wayfarer's Spark, which is free and starts unlocked.

Connections are bidirectional: unlocking either end can make the node at the other end available. Each edge is declared only once in the data. Every node uses **Any**, so one adjacent unlocked node is always enough.

| ID | Talent | Type | Declared connection(s) | Rule | Effect |
| --- | --- | --- | --- | --- | --- |
| origin | Wayfarer's Spark | Class | None | — | Starting node; unlocks Strike and Guard. |
| brute_1 | Brute | Class | Wayfarer's Spark | Any | +2 Strength. |
| shadow_1 | Shadow | Class | Wayfarer's Spark | Any | +2 Agility and unlocks Quick Slash. |
| arcanist_1 | Arcanist | Class | Wayfarer's Spark | Any | +2 Intelligence. |
| talent_1 | Immaculate Timing | Passive | Shadow | Any | +2 Agility and +5 Initiative. |
| talent_2 | Twin Strike | Ability | Immaculate Timing | Any | Unlocks Twin Strike. |
| talent_3 | Poison Stab | Ability | Immaculate Timing | Any | Unlocks Poison Stab. |
| talent_4 | Honed Skills | Passive | Twin Strike | Any | +2% Critical Strike Chance. |
| talent_5 | Precision | Passive | Poison Stab | Any | +2% Hit Chance. |
| talent_6 | Elusiveness | Passive | Honed Skills | Any | +2% Dodge Chance. |
| talent_7 | Stamina | Passive | Honed Skills | Any | +1 Max Energy. |
| talent_8 | Setup | Passive | Precision | Any | +2 Initiative. |
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
| talent_21 | Toxicology | Passive | Smarts | Any | Player-applied Poison deals 10% more damage. |
| talent_22 | Virulence | Passive | Blisters | Any | Player-applied Poison deals 10% more damage. Toxicology and Virulence combine additively for +20%. |
| talent_23 | Electrified | Passive | Agile | Any | Every hit has a 20% chance, plus Luck's chance-effect bonus, to apply Electrified. |
| talent_24 | Flurry | Ability | Agile | Any | Unlocks Flurry. |
| talent_25 | Energized | Passive | Opportunist | Any | +1 Energy regenerated at the start of the player's turn. |
| talent_26 | Ambush | Ability | Energized | Any | Unlocks Ambush. |
| talent_27 | Toxic Explosion | Ability | Virulence | Any | Unlocks Toxic Explosion. |
| talent_28 | Longevity | Passive | Toxic Explosion | Any | Toxic Explosion retains half of the consumed Poison stacks, rounded up. |
| talent_29 | Maneuvers | Passive | Ambush | Any | Ambush can be used without Stealth at 100% Physical Power; it remains 150% while Stealthed. |
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
| talent_40 | Resistance | Passive | Venomborn | Any | Makes the player immune to Poison. |
| talent_41 | Thunderstruck | Passive | Lightning Strike | Any | Makes the player immune to Electrified. |
| talent_42 | Perfected Formula | Passive | Focus | Any | Player-applied Poison gains 1 additional stack. |
| talent_43 | Distraction | Passive | Focus | Any | Kills grant Stealth and make the next ability cost 0 Energy. |
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
| talent_61 | Hit and Run | Passive | Cheap Shot | Any | Damage dealt has a 2% base chance to grant Stealth. |
| talent_62 | Spot Weakness | Passive | Pandemic | Any | Deals 5% more damage per unique debuff on the target. |
| talent_63 | Avoidance | Passive | Light Speed | Any | +1 Max Energy and 3% less incoming damage per unspent Energy. |
| talent_64 | Epidemic | Ability | Spot Weakness | Any | Unlocks Epidemic. |
| talent_65 | Panic | Passive | Hit and Run | Any | The first lethal hit each combat restores 20% of Max Health and grants Stealth for 2 turns. |
| talent_66 | Voltage Stab | Ability | Avoidance | Any | Unlocks Voltage Stab. |

Every live talent node now has a unique player-facing name. Internal IDs remain stable for save compatibility.

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
| Regenerate | 3 turns | No | Heals at turn start for `3 + 20% source Magical Power` per stack, then applies healing-received modifiers. |
| Taunt | Permanent | No | Forces the player to target this living, visible enemy with single-target attacks. |
| Stealth | 1-turn library default | No | Cannot be targeted by enemies. The Stealth ability supplies its own duration/expiration behavior. |
| Evasion | 1 turn | No | +60% Dodge Chance until the next turn by default; Enduring Evasion changes magnitude and duration. |
| Distraction | Until consumed | No | The next ability costs 0 Energy. Removed when an ability is used. |
| Pinpoint | Until consumed | No | The next damaging ability is guaranteed to critically strike. Removed when that ability is used. |

### Debuffs

| Status | Duration | Stackable | Effect |
| --- | ---: | --- | --- |
| Poison | 3 turns | Yes | At turn end, takes Arcane damage per stack equal to `2 + 15% source Magical Power`. |
| Bleed | 3 turns | Yes | After using an ability/attack, takes Physical damage per stack equal to `2 + 25% source Physical Power`. |
| Burn | 3 turns | Yes | At turn start, takes Fire damage per stack equal to `3 + 30% source Magical Power`. |
| Weaken | 3 turns | No | Deals 25% less damage. |
| Shatter | 3 turns | No | Effective Armor is reduced by 50%. |
| Vulnerable | 3 turns | No | Takes 25% more damage from all sources. |
| Stunned | 1 turn | No | Skips the next turn. |
| Exhausted | 1 turn | No | Energy regeneration is limited to 1 on the next turn. |
| Slowed | 3 turns | No | Acts after combatants that are not Slowed. |
| Reckless | 3 turns | No | Takes damage equal to 50% of direct damage it deals, rounded with a minimum of 1. |
| Wet | 3 turns | No | Takes 50% more Lightning damage and 50% less Fire damage. |
| Electrified | 3 turns | No | Has a 10% chance at turn start to become Stunned and skip that turn. |
| Cold | 3 turns | No | Takes 50% more Frost damage and 50% less Lightning damage. |
| Charred | 3 turns | No | Takes 50% more Fire damage and 50% less Frost damage. |
| Sleep | 3 turns | No | Cannot act; has a 20% chance to wake at turn start and wakes immediately when taking damage. |

## Enemies

All current enemies start combat with 10 Max Energy and regenerate 1 Energy on their own turns.

| Enemy | Health | Power | Armor | Magic Resistance | Hit | Dodge | Cost | Attack |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Ash Hound | 28 | 7 | 1 | 0 | 95% | 8% | 3 | Raking Claws; Physical and applies Bleed when it deals Health damage. |
| Cinder Cultist | 34 | 9 | 2 | 2 | 96% | 3% | 4 | Searing Brand; Arcane. |
| Ember Wisp | 22 | 6 | 0 | 3 | 98% | 12% | 3 | Scorch; Arcane. |
| The Ashen Warden | 92 | 12 | 4 | 4 | 100% | 5% | 5 | Cinder Cleave; Physical. |

## Adventure: The Ashen Road

| Step | Type | Node | Enemies/event | Reward |
| ---: | --- | --- | --- | --- |
| 1 | Combat | Smoke on the Road | Two Ash Hounds | 55 XP, 9 gold, loot roll. |
| 2 | Event | The Forgotten Shrine | Rest for 24 Health, or lose 10 Health and gain 1 talent point. | Choice result only. |
| 3 | Combat | The Charred Pilgrims | Cinder Cultist and Ember Wisp | 75 XP, 14 gold, loot roll. |
| 4 | Boss | The Black Gate | The Ashen Warden | 125 XP, 32 gold, Warden's Broken Crown. |

## Equipment catalog

### Starting equipment and inventory

The first eight items below are equipped on a new character. Every item from Warden's Broken Crown onward is placed in the new character's inventory to support gear, slot, and comparison testing.

| Item | Slot/category | Rarity | Mechanical stats | Set |
| --- | --- | --- | --- | --- |
| Notched Iron Cleaver | One-Hand Axe | Uncommon | +3 Physical Power, +2 Strength | Ashborn Warplate |
| Embershard Focus | Off-Hand Tome | Rare | +2 Magical Power, +3 Intelligence | — |
| Wanderer's Hood | Leather Head | Common | +1 Armor, +1 Agility | — |
| Ashborn Cuirass | Plate Chest | Rare | +5 Armor, +2 Strength, +2 Vitality | Ashborn Warplate |
| Veilwalker Trousers | Leather Pants | Uncommon | +2 Armor, +2 Agility | Veilwalker's Guile; no set bonuses are currently defined. |
| Dustworn Boots | Leather Boots | Common | +1 Armor, +1 Vitality | — |
| Garnet Signet | Ring | Rare | +1 Strength, +2 Luck | — |
| Moonlit Coil | Ring | Epic | +1 Agility, +2 Intelligence, +1 Luck | — |
| Warden's Broken Crown | Plate Head | Epic | +4 Armor, +2 Strength, +3 Vitality | Ashborn Warplate |
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
| Ashen Conduit | One-Hand Wand | Epic | +5 Magical Power, +3 Intelligence, +1 Luck | — |
| Black Gate Buckler | Off-Hand Shield | Uncommon | +3 Armor, +2 Vitality | — |
| Roadcleaver Greatsword | Two-Hand Sword | Rare | +7 Physical Power, +4 Strength | — |
| Ashfall Greataxe | Two-Hand Axe | Epic | +8 Physical Power, +5 Strength, +1 Vitality | — |
| Gatebreaker Maul | Two-Hand Mace | Rare | +7 Physical Power, +4 Strength, +2 Vitality | — |
| Embercaller's Staff | Two-Hand Staff | Epic | +8 Magical Power, +5 Intelligence | — |
| Cinderwatch Polearm | Two-Hand Polearm | Rare | +7 Physical Power, +2 Strength, +3 Agility | — |

### Gear set bonuses

Only equipped pieces count.

| Set | Pieces | Bonus |
| --- | ---: | --- |
| Ashborn Warplate | 2 | +2 Strength. |
| Ashborn Warplate | 3 | Bleed deals 50% less damage to the player. |
| Ashborn Warplate | 4 | +3 Vitality. |

## Reward loot pool

Regular combat loot selects from these seven templates:

- Embershard Focus
- Wanderer's Hood
- Ashborn Cuirass
- Veilwalker Trousers
- Dustworn Boots
- Garnet Signet
- Moonlit Coil

The boss bypasses the random pool and awards Warden's Broken Crown. Reward instances receive a unique runtime ID before entering inventory.
