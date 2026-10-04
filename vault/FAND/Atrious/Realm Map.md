# Realm Map

How the realms of FAND connect, and how travelers get between them. Higher is harder: each realm's Pressure (0–9) is shown in brackets. Rules are in [[FAND/Atrious/Realm Travel|Realm Travel]].

```mermaid
flowchart TB
    PR["Primordial Realm [9]<br/>progenitor and god remains"]
    IV["Inner Void [8]"]
    VO["Void [7]"]
    OU["Outer Realm [6]"]
    IN["Inner Realm [5]<br/>where Laws are anchored"]
    AB["Abyss [4]<br/>layers below Hell"]
    CH["Chaos Realm [3]"]
    HE["Hell [2]"]
    HV["Heaven [2]"]
    FI["Fiend Realm<br/>Hell's border"]
    AS["Astral<br/>space between realms"]
    MY["Mysterious Realm [1]<br/>fey pockets, Mirror Realm, spirit edges"]
    SP["Spirit Realm depths"]
    MO["Mortal Realm [0]<br/>Human"]

    MO -- "thin places, fey rings, mirrors" --> MY
    MY --- AS
    MO -- "Astral crossing" --> AS
    AS -- "gates, invitation, death" --> HV
    AS -- "gates, invitation, death" --> HE
    MO -- "death" --> HE
    MO -- "death" --> HV
    FI --- HE
    MO -- "thin border" --> FI
    HE -- "the Fall, from the Rim" --> AB
    MO -- "rifts from dead gods" --> CH
    CH -- "rifts" --> AB
    MO -- "Law-veins, with a guide" --> IN
    AB -- "the deepest layers" --> IN
    AS -- "beyond the Astral, a week or more" --> OU
    IN -- "the Root touches it" --> VO
    OU -- "Void ritual" --> VO
    VO -- "deeper" --> IV
    MY -- "spirit edges, then down" --> SP
    SP -- "depths" --> PR
    IV -. "god-falls anywhere" .-> PR
```

## Reading the map
- **Solid arrows** are the usual routes, in the direction most travelers take them. Every route also works in reverse, but leaving is often harder than arriving (see "Getting home" in Realm Travel).
- **The Astral** and **the Fiend Realm** are crossing zones, not tiers of their own.
- **God-falls** (dotted) can open onto the Primordial Realm from anywhere an original god died.
- Each god's home realm is in the [[FAND/Atrious/God Roster|God Roster]]; a god's invitation reaches it from anywhere.

## Realm pages
[[Mortal Realm]] · [[Mysterious Realm]] · [[Astral]] · [[Hell]] · [[Fiend Realm]] · [[Heaven]] · [[Chaos Realm]] · [[Abyss]] · [[Inner Realm]] · [[Outer Realm]] · [[Void]] · [[Inner Void]] · [[Spirit Realm]] · [[Primordial Realm]]

## Related
- [[FAND/Atrious/Realm Travel|Realm Travel]] · [[FAND/Atrious/Material Grading|Material Grading]] · [[FAND/Atrious/Material Index|Material Index]]
