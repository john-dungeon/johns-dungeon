---
title: Item Data
nav_exclude: true
search_exclude: true
has_toc: false
table:
  noun: items
  popup_facts: false
  marker:
    symbol: "✦"
    tag: Magic Item
    color_by: rarity
    label: Magic Item
  default_sort: name
  default_dir: asc
  columns:
    - key: name
      label: Name
    - key: type
      label: Type
    - key: rarity
      label: Rarity
      type: rank
      order: [Varies, Common, Uncommon, Rare, Very Rare, Legendary, Artifact]
    - key: cost
      label: Cost
      type: number
      suffix: " GP"
    - key: weight
      label: Weight
      type: number
      suffix: " lb."
entries:

  - name: Potion of Health
    type: Potion
    rarity: Varies
    cost: Varies
    weight: 0.5
    tags: [Consumable, Healing, Magic Item]
    description: |
      *Potion, Rarity Varies (See table)*\
      *Cost Varies (See table), 1/2 lb.*

      This potion’s red liquid glimmers when agitated.

      As a Utilize action or a Bonus Action, you can drink the potion or administer it to another creature within 5 feet of yourself. The creature that consumes the magical red fluid in this vial regains a fixed number of Hit Points (from a Utilize action) or a rolled number of Hit Points (from a Bonus Action).

      The potion’s rarity and purchase cost, and the number of Hit Points it restores are shown in the table below.

      | Potency | Rarity | Fixed HP Regained | Rolled HP Regained | Cost |
      | --- | --- | --- | --- | --- |
      | +1 | Common | 10 | 2d4 + 2 | 50 GP |
      | +2 | Uncommon | 20 | 4d4 + 4 | 200 GP |
      | +3 | Rare | 40 | 8d4 + 8 | 2,000 GP |
      | +4 | Very Rare | 60 | 10d4 + 20 | 20,000 GP |
      | +5 | Legendary | 100 | 14d4 + 44 | 100,000 GP |
      {: .catalog }
  
  - name: Potion of Mana
    type: Potion
    rarity: Varies
    cost: Varies
    weight: 0.5
    tags: [Consumable, Magic Item]
    description: |
      *Potion, Rarity Varies (See table)*\
      *Cost Varies (See table), 1/2 lb.*

      This potion's blue liquid crackles and sparks when agitated.

      As a Utilize action or a Bonus Action, you can drink the potion or administer it to another creature within 5 feet of yourself. The creature that consumes the magical blue fluid in this vial gains a spell slot of a certain level. Any spell slot a creature gains from a Potion of Mana vanishes when it finishes a Long Rest.

      After a creature drinks a Potion of Mana, it gains 1 Exhaustion level each time it drinks another one before it finishes a Long Rest.

      The potion’s rarity and purchase cost, and the level of the spell slot it restores are shown in the table below.

      | Potency | Rarity | Spell Slot Level | Cost |
      | --- | --- | --- | --- |
      | +1 | Common | 1 | 75 GP |
      | +2 | Uncommon | 3 | 300 GP |
      | +3 | Rare | 5 | 3,000 GP |
      | +4 | Very Rare | 7 | 30,000 GP |
      | +5 | Legendary | 9 | 150,000 GP |
      {: .catalog }
---
