name: Agony
size: Large
type: Monstrosity
note_type: Welterbeast
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
saves: Con, Wis, Cha
skills: Athletics +9, Intimidation +8
resistances: Psychic
immunities: Necrotic, Poison; Charmed, Exhaustion, Frightened, Poisoned
senses: Darkvision 300 ft.
languages: Abyssal; telepathy 300 ft. (only with other welterbeasts)
cr: 8
settings: Orobis
tags: Welterbeast
flavor: Agony is the manifestation of human suffering, born of one man's despair and his ultimate sacrifice in a futile attempt to become something greater than he is. If left to its own devices, it will certainly go on to share, or rather inflict, its suffering upon thousands of others.

traits:
- trait_1: Aura of Affliction
  description: *Constitution Saving Throw:* DC 16, any creature that starts its turn in a 10-foot Emanation originating from Agony. *Failure:* 9 (2d8) Necrotic damage, and the target has Disadvantage on D20 Tests until the start of its next turn.
- trait_2: Legendary Resistance (3/Day)
  description: If Agony fails a saving throw, it can choose to succeed instead.
- trait_3: Pain Sense
  description: Agony has Advantage on attack rolls against any creature that is Bloodied.

  In addition, Agony always knows the location of any Bloodied creature within 300 feet of it, but only while the two of them are on the same plane of existence. A Bloodied creature can't become hidden from Agony, and if it has the Invisible condition, it gains no benefit from that condition against Agony.

actions:
- action_1: Multiattack
  description: Agony makes two attacks, using Sanguine Sword or Torment Spike in any combination, and uses Mark of the Scourge if available.
- action_2: Sanguine Sword
  description: *Melee Attack Roll:* +9, reach 10 ft. *Hit:* 13 (2d6 + 6) Slashing damage plus 11 (2d10) Necrotic damage, and the target has the Poisoned condition until the start of Agony's next turn. While Poisoned, the target can't regain Hit Points.
- action_3: Torment Spike
  description: *Ranged Attack Roll:* +9, range 150 ft. *Hit:* 24 (4d8 + 6) Psychic damage, and the target has the Frightened condition until the start of Agony's next turn.
- action_4: Mark of the Scourge (3/Day)
  description: Agony marks one creature it can see within 60 feet of itself. Until Agony loses Concentration (as if concentrating on a spell), the target has Vulnerability to Necrotic and Psychic damage.

intro_charged_actions: *At the end of each of its turns, Agony can take one of the following actions.*
charged_actions:
- charged_action_1: Graveyard of Blades
  description: Agony summons a rain of crimson swords at three different points it can see within 120 feet. *Dexterity Saving Throw (start of Agony's next turn):* DC 16, each creature in a 15-foot-radius, 60-foot-high Cylinder centered on each point. *Failure:* 42 (12d6) Necrotic damage. *Success:* Half damage. A creature in the area of more than one Cylinder is affected only once.
- charged_action_2: Penance
  description: Agony stabs its own sword through its chest to unleash a wave of pure agony from its body. Immediately after this action takes effect, Agony dies. *Constitution Saving Throw (start of Agony's next turn):* DC 16, each creature in a 120-foot Emanation originating from Agony. *Failure:* 78 (12d12) Necrotic damage. *Success:* Half damage.

intro_legendary_actions: *Legendary Action Uses: 3. Immediately after another creature’s turn, Agony can expend a use to take one of the following actions. Agony regains all expended uses at the start of each of its turns.*
legendary_actions:
- legendary_action_1: Chains of Punishment
  description: *Strength Saving Throw:* DC 16, up to three creatures within 30 feet. *Failure:* 10 (3d6) Necrotic damage, and the target is pulled straight toward Agony to the nearest unoccupied space within 5 feet of it. *Success:* Half damage, and the target is pulled only up to 15 feet.
- legendary_action_2: Lunge
  description: Agony moves up to half its Speed, and it makes one Sanguine Sword attack.
  
---

name: Anxiety
size: Large
type: Monstrosity
note_type: Welterbeast
alignment: Chaotic Evil
ac: 15
hp: 102 (12d10 + 36)
speed: 5 ft., Fly 20 ft. (hover)
str: 14
dex: 8
con: 16
int: 10
wis: 17
cha: 5
immunities: Poison, Psychic; Charmed, Exhaustion, Frightened, Poisoned
senses: Darkvision 120 ft.
languages: Abyssal; telepathy 120 ft. (only with other welterbeasts)
cr: 5
settings: Orobis
tags: Welterbeast
flavor: Welterbeasts are anomalous creatures that embody negative emotions, spawning from the ruins of lost civilizations and flocking to sites of immense suffering. It was once said that the sight of them would spell the end of times, but now hordes of them roam the lands. They march tirelessly, devouring anything in their path, perhaps to prepare Orobis for a new aeon.

traits:
- trait_1: Fear Sense
  description: The welterbeast has Advantage on attack rolls against any creature with the Frightened condition.

  In addition, the welterbeast always knows the location of any Frightened creature within 120 feet of it, but only while the two of them are on the same plane of existence. A Frightened creature can't become hidden from the welterbeast, and if it has the Invisible condition, it gains no benefit from that condition against the welterbeast.

actions:
- action_1: Multiattack
  description: The welterbeast makes two Dread Burst attacks. It can replace one attack with a use of Insidious Dread.
- action_2: Dread Burst
  description: *Melee or Ranged Attack Roll:* +6, reach 5 ft. or range 120 ft. *Hit:* 13 (3d6 + 3) Psychic damage, and the target has the Frightened condition until the end of its next turn.
- action_3: Insidious Dread
  description: *Wisdom Saving Throw:* DC 14, one creature the welterbeast can see within 60 feet. *Failure:* The target has the Frightened condition. At the end of each of its turns, the target takes 5 (1d10) Psychic damage and repeats the save, ending the effect on itself on a success. After 1 minute, it succeeds automatically. *Success:* The target is immune to this welterbeast's Insidious Dread for 24 hours.

---

name: Atar the Elder Skith
size: Gargantuan
type: Monstrosity
note_type: Skith
alignment: Unaligned
ac: 13
hp: 101 (7d20 + 28)
speed: 50 ft., Climb 50 ft.
str: 25
dex: 13
con: 19
int: 3
wis: 14
cha: 9
saves: Str, Con, Wis
skills: Perception +5
resistances: Poison
immunities: Cold, Fire; Charmed, Frightened
senses: Blindsight 60 ft., Darkvision 120 ft.
languages: None
cr: 8
settings: Big Blue
tags: Skith
flavor: Born in the depths of a submarine volcano, Atar the Elder Skith is an enormous scorpion-like leviathan that can harness the power of primordial fire, shooting flaming lasers out of her eyes and wielding a stinger that melts through steel. As a mature leviathan, Atar is also the broodmother of a massive army of skiths. They rip through the oceans like a swarm of locusts, and thus, they must remain itinerant or risk famine.

traits:
- trait_1: Amphibious
  description: Atar can breathe air and water.
- trait_2: Fire Aura (Awakened only)
  description: At the end of each of Atar's turns, each creature of Atar's choice in a 15-foot Emanation originating from Atar takes 7 (2d6) Fire damage. In addition, Atar emits Bright Light in a 30-foot radius and Dim Light for an additional 30 feet.

  This trait doesn't function while Atar is completely underwater.
- trait_3: Legendary Awakening (1/Day)
  description: When Atar is reduced to 0 Hit Points, she can regain all her Hit Points and enter an Awakened state that lasts for 8 hours. The Awakened state grants Atar access to new abilities in her stat block.
- trait_4: Legendary Resistance (3/Day, or 4/Day in Lair)
  description: If Atar fails a saving throw, she can choose to succeed instead.

actions:
- action_1: Multiattack
  description: Atar makes two attacks, using Searing Pincer or Flaming Ray in any combination, and one Inferno Stinger attack.
- action_2: Searing Pincer
  description: *Melee Attack Roll:* +10, reach 10 ft. *Hit:* 12 (1d10 + 7) Bludgeoning damage plus 11 (2d10) Fire damage. If the target is a Huge or smaller creature, it has the Grappled condition (escape DC 18) from one of two claws.
- action_3: Flaming Ray
  description: *Ranged Attack Roll:* +10, range 120 ft. *Hit:* 25 (4d8 + 7) Fire damage.
- action_4: Inferno Stinger
  description: *Melee Attack Roll:* +10 (with Advantage if the target is Grappled by Atar), reach 15 ft. *Hit:* 20 (2d12 + 7) Piercing damage plus 11 (2d10) Fire damage.
- action_5: Deadly Leap (Awakened only)
  description: Atar spends 15 feet of movement to jump to a space within 40 feet that contains one or more Gargantuan or smaller creatures. *Dexterity Saving Throw:* DC 18, each creature in Atar’s destination space. *Failure:* 19 (3d12) Bludgeoning damage plus 19 (3d12) Fire damage, and the target has the Prone condition. *Success:* Half damage, and the target is pushed to the nearest unoccupied space outside of Atar's space.

intro_charged_actions: *At the end of each of her turns, Atar can take one of the following actions.*
charged_actions:
- charged_action_1: Leviathan Slam
  description: *Strength Saving Throw (start of Atar's next turn):* DC 18, each creature Grappled by Atar. *Failure:* 42 (12d6) Bludgeoning damage. *Success:* Half damage. *Failure or Success:* The target has the Prone condition.
- charged_action_2: Sweeping Inferno (Awakened only)
  description: Atar fires a concentrated beam of fire from her eyes, maintaining it until the start of her next turn, then sweeps it across a large area. Until the start of her next turn, Atar can't make Flaming Ray attacks. *Dexterity Saving Throw (immediately):* DC 18, each creature in a 120-foot-long, 5-foot-wide Line. *Failure:* 38 (11d6) Fire damage. *Success:* Half damage.

  *Dexterity Saving Throw (start of Atar's next turn):* DC 18, each creature in a 120-foot Cone (one edge must line up with the Line). *Failure:* 31 (9d6) Fire damage. *Success:* Half damage.

intro_legendary_actions: *Legendary Action Uses: 3 (4 in Lair). Immediately after another creature’s turn, Atar can expend a use to take one of the following actions. Atar regains all expended uses at the start of each of her turns.*
legendary_actions:
- legendary_action_1: Hellfire
  description: Atar makes one Searing Pincer or Flaming Ray attack.
- legendary_action_2: Skith Skyfall (Awakened only)
  description: Atar uses Deadly Leap. Atar can't take this action again until the start of her next turn.
- legendary_action_3: Summon Hatchling (Awakened only)
  description: Atar launches an egg to an unoccupied space within 30 feet of her, causing one **[[monsters:Hellfire Skith]]** to appear in that space. Atar can't take this action again until the start of her next turn.

intro_regional_effects: The region containing Atar's lair is warped by her presence, creating the following effects:
regional_effects:
- regional_effect_1: Burning Heat
  description: The area within 1 mile of the lair is an area of extreme heat. A burning creature or object takes an additional 1d4 Fire damage at the start of each of its turns.
- regional_effect_2: Foul Water
  description: Water sources within 1 mile of the lair are supernaturally fouled. Creatures other than Atar and her allies that drink such water must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 1 hour.
outro_regional_effects: If Atar dies or moves her lair elsewhere, these effects end immediately.

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
traits:
- trait_1: Bound
  description: The mech is magically bound to the [[items:Autonomous Mech Core]] that created it, as well as the creature attuned to the augmented armor; that creature is considered the mech’s pilot. While the mech and pilot are on the same plane of existence, the pilot can telepathically call the mech to travel to it, and the mech knows the distance and direction to the pilot.
- trait_2: Magic Resistance
  description: The mech has Advantage on saving throws against spells and other magical effects.
actions:
- action_1: Multiattack
  description: The mech makes two Force Slam attacks.
- action_2: Force Slam
  description: *Melee Attack Roll:* +6, reach 5 ft. *Hit:* 11 (2d6 + 4) Force damage. If the target is a Medium or smaller creature, it has the Prone condition.
reactions:
- reaction_1: Bodily Interception
  description: *Trigger:* A creature the mech can see within 15 feet of itself is targeted by an attack roll. *Response:* The mech moves up to half its Speed without provoking Opportunity Attacks toward the triggering attack’s target. If it ends its movement within 5 feet of the target and within the reach or range of the attack, the mech can become the target of the attack roll instead.

---

name: Blue Slime
size: Small
type: Ooze
note_type: Slime
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
note_type: Stone Lion
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
note_type: Stone Lion
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
  description: *Melee Attack Roll:* +6, reach 5 ft. *Hit:* 14 (2d10 + 3) Bludgeoning damage plus 9 (2d8) Force damage.
- action_4: Spellcasting
  description: The stone lion casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 16):
  
**At Will:** *Elementalism*, *Mage Hand*, *Mending*

**1/Day Each:** *Disintegrate* (no sight required; the stone lion only needs to detect the target with its senses), *Move Earth*, *Stone Shape*

---
