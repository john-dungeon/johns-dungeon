name: Agony
size: Large
type: Monstrosity
alignment: Chaotic Evil
ac: 15
hp: 147 (14d10 + 70)
speed: 40 ft.
str: 23
dex: 13
con: 21
int: 10
wis: 9
cha: 15
skills: Athletics +9, Intimidation +8
resistances: Psychic
immunities: Necrotic, Poison; Charmed, Exhaustion, Frightened, Poisoned
senses: Darkvision 120 ft.
languages: Abyssal; telepathy 300 ft. (only with other welterbeasts)
cr: 8
settings: Orobis
tags: Welterbeast
flavor: Agony is the manifestation of human suffering, born of one man's despair and his ultimate sacrifice in a futile attempt to become something greater than he is. If left to its own devices, it will certainly go on to share, or rather inflict, its suffering upon thousands of others.
traits:
- trait_1: Aura of Rot
  description: *Constitution Saving Throw:* DC 16, any creature that starts its turn in a 10-foot Emanation originating from Agony. Failure: 9 (2d8) Necrotic damage, and the target has Disadvantage on D20 Tests until the start of its next turn.
- trait_2: Legendary Resistance (3/Day)
  description: If Agony fails a saving throw, it can choose to succeed instead.
- trait_3: Pain Sense
  description: Agony has Advantage on attack rolls against any creature that is Bloodied. In addition, Agony always knows the location of any Bloodied creature within 300 feet of it, but only while the two of them are on the same plane of existence. A Bloodied creature can't become hidden from Agony, and if it has the Invisible condition, it gains no benefit from that condition against Agony.
actions:
- action_1: Multiattack
  description: Agony makes two attacks, using Sanguine Sword or Torment Spike in any combination, and uses Mark of the Scourge if available.
- action_2: Sanguine Sword
  description: *Melee Attack Roll:* +8, reach 10 ft. *Hit:* 13 (2d6 + 6) Slashing damage plus 11 (2d10) Necrotic damage, and the target has the Poisoned condition until the start of Agony's next turn. While Poisoned, the target can't regain Hit Points.
- action_3: Torment Spike
  description: *Ranged Attack Roll:* +8, range 150 ft. *Hit:* 24 (4d8 + 6) Psychic damage, and the target has the Frightened condition until the start of Agony's next turn.
- action_4: Mark of the Scourge (3/Day)
  description: Agony marks one creature it can see within 60 feet of itself. Until Agony loses Concentration (as if concentrating on a spell), the target has Vulnerability to Necrotic and Psychic damage.
intro_charged_actions: At the end of each of its turns, Agony can take one of the following actions.
charged_actions:
- charged_action_1: Placeholder
  description: Placeholder
intro_legendary_actions: Legendary Action Uses: 3. Immediately after another creature’s turn, Agony can expend a use to take one of the following actions. Agony regains all expended uses at the start of each of its turns.
legendary_actions:
- legendary_action_1: Chains of Punishment
  description: *Strength Saving Throw:* DC 16, up to three creatures within 60 feet. *Failure:* 10 (3d6) Necrotic damage, and the target is pulled straight toward Agony to the nearest unoccupied space within 5 feet of it. *Success:* Half damage, and the target is pulled only up to 15 feet.
- legendary_action_2: Lunge
  description: Agony moves up to half its Speed, and it makes one Sanguine Sword attack.
regional_effects:
- regional_effect_1: Text
  description: Text
  
---

name: Autonomous Mech
size: Medium
type: Construct
alignment: Unaligned
ac: equals the AC offered by the augmented armor 
hp: 67 (9d8 + 27)
speed: 30 ft.
str: 18
dex: 14
con: 17
int: 4
wis: 10
cha: 6
skills: Athletics +6
immunities: Poison, Psychic; Charmed, Exhaustion, Frightened, Poisoned
languages: Understands the languages you know
cr: 4
traits:
- trait_1: Bound
  description: The mech is magically bound to the [[items:Autonomous Mech Core]] that created it, as well as the creature attuned to the augmented armor; that creature is considered the mech’s pilot. While the mech and pilot are on the same plane of existence, the pilot can telepathically call the mech to travel to it, and the mech knows the distance and direction to the pilot.
- trait_2: Magic Resistance
  description: The mech has Advantage on saving throws against spells and other magical effects.
actions:
- action_1: Multiattack
  description: The mech makes two Force Slam attacks.
- action_2: Force Slam
  description: *Melee Attack Roll:* +6, reach 5 ft. *Hit:* 8 (2d6 + 4) Force damage. If the target is a Medium or smaller creature, it has the Prone condition.
reactions:
- reaction_1: Bodily Interception
  description: *Trigger:* A creature the mech can see within 15 feet of itself is targeted by an attack roll. *Response:* The mech moves up to half its Speed without provoking Opportunity Attacks toward the triggering attack’s target. If it ends its movement within 5 feet of the target and within the reach or range of the attack, the mech can become the target of the attack roll instead.

---

name: Blue Slime
size: Small
type: Ooze
alignment: Unaligned
ac: 8
hp: 13 (2d6 + 6)
speed: 30 ft., Swim 30 ft.
str: 12
dex: 6
con: 16
int: 1
wis: 6
cha: 2
vulnerabilities: Fire
resistances: Acid, Bludgeoning
immunities: Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Prone, Restrained
senses: Blindsight 60 ft.
languages: None
cr: 0.125
settings: Erisia
tags: Slime
flavor: Unlike other slimes, blue slimes bounce instead of crawl, making them significantly faster. Many find this bouncy nature cute, but for the slimes themselves, it is a means of survival. They typically live on mountains and hills where they can leap off cliffs and roll down inclines at breakneck speeds, fleeing from threats in pathetic but effective fashion.
traits:
- trait_1: Amorphous
  description: The slime can move through a space as narrow as 1 inch without expending extra movement to do so.
- trait_2: Bouncy Form
  description: When the slime falls, it takes no damage from the fall.

  When an attacker hits the slime with a melee attack roll, the slime is pushed 10 feet away from the attacker.
- trait_3: Pack Tactics
  description: The slime has Advantage on an attack roll against a creature if at least one of the slime’s allies is within 5 feet of the creature and the ally doesn’t have the Incapacitated condition.
- trait_4: Standing Leap
  description: The slime's Long Jump is up to 20 feet and its High Jump is up to 10 feet with or without a running start.
actions:
- action_1: Bouncy Pseudopod
  description: *Melee Attack Roll:* +3, reach 5 ft. *Hit:* 3 (1d4 + 1) Bludgeoning damage. If the target is Medium or larger, the slime is pushed 5 feet away from the target.

---

name: Stone Sentinel
size: Large
type: Construct
alignment: Lawful Neutral
ac: 18
hp: 114 (12d10 + 48)
speed: 40 ft., Can't Swim
str: 20
dex: 16
con: 19
int: 8
wis: 10
cha: 6
resistances: Piercing, Slashing
immunities: Poison, Psychic; Charmed, Deafened, Exhaustion, Frightened, Paralyzed, Petrified, Restrained
senses: Tremorsense 40 ft.; always Blinded
languages: Common; telepathy 300 ft. (only with **[[Stone Warden|Stone Wardens]]** and other **Stone Sentinels**)
cr: 6
settings: Jingyu City
tags: Stone Lion
flavor: Stone lions guard the gates of ancient temples with unwavering vigilance. However, due to the primitive magic that animates them, there are many ways to circumvent their watch. The simplest method is simply to stay out of their range of Tremorsense, since they are completely blind beyond that.
traits:
- trait_1: Immutable Form
  description: The stone lion can't shape-shift.
- trait_2: Pack Tactics
  description: The stone lion has Advantage on an attack roll against a creature if at least one of the stone lion's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.
actions:
- action_1: Multiattack
  description: The stone lion makes one Rend attack and one Stone Cudgel attack.
- action_2: Rend
  description: *Melee Attack Roll:* +8, reach 5 ft. *Hit:* 16 (2d10 + 5) Bludgeoning damage.
- action_3: Stone Cudgel
  description: *Melee or Ranged Attack Roll:* +8, reach 5 ft. or range 30/90 ft. *Hit:* 18 (3d8 + 5) Bludgeoning damage, and the target has the Prone condition. If the target already has the Prone condition, the attack deals an extra 9 (2d8) Bludgeoning damage. *Hit or Miss:* The cudgel magically returns to the stone lion's mouth immediately after a ranged attack.
- action_4: Deadly Leap
  description: The stone lion spends 5 feet of movement to jump to a space within 15 feet that contains one or more Large or smaller creatures. *Dexterity Saving Throw:* DC 16, each creature in the stone lion’s destination space. *Failure:* 19 (3d12) Bludgeoning damage, and the target has the Prone condition. *Success:* Half damage, and the target is pushed 5 feet straight away from the stone lion.

---

name: Stone Warden
size: Large
type: Construct
alignment: Lawful Neutral
ac: 20
hp: 123 (13d10 + 52)
speed: 40 ft., Can't Swim
str: 17
dex: 14
con: 19
int: 14
wis: 20
cha: 6
skills: Perception +8
resistances: Piercing, Slashing
immunities: Poison, Psychic; Charmed, Deafened, Exhaustion, Frightened, Paralyzed, Petrified, Restrained
senses: Tremorsense 120 ft.; always Blinded
languages: Common; telepathy 300 ft. (only with **[[Stone Sentinel|Stone Sentinels]]** and other **Stone Wardens**)
cr: 8
settings: Jingyu City
tags: Stone Lion
flavor: Stone lions guard the gates of ancient temples with unwavering vigilance. However, due to the primitive magic that animates them, there are many ways to circumvent their watch. The simplest method is simply to stay out of their range of Tremorsense, since they are completely blind beyond that.
traits:
- trait_1: Immutable Form
  description: The stone lion can't shape-shift.
- trait_2: Magic Resistance
  description: The stone lion has Advantage on saving throws against spells and other magical effects.
- trait_3: Pack Tactics
  description: The stone lion has Advantage on an attack roll against a creature if at least one of the stone lion's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.
actions:
- action_1: Multiattack
  description: The stone lion makes two attacks, using Castigation Ray or Rend in any combination.
- action_2: Castigation Ray
  description: *Ranged Attack Roll:* +8, range 90 ft. *Hit:* 32 (6d8 + 5) Force damage, and the target's Speed is halved until the end of its next turn.
- action_3: Rend
  description: *Melee Attack Roll:* +8, reach 5 ft. *Hit:* 16 (2d10 + 5) Bludgeoning damage plus 9 (2d8) Force damage.
- action_4: Spellcasting
  description: The stone lion casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 16):
  
**At Will:** *Elementalism*, *Mage Hand*, *Mending*

**1/Day Each:** *Disintegrate* (no sight required; the stone lion only needs to detect the target with its senses), *Move Earth*, *Stone Shape*

---
