#!/usr/bin/env python3
"""One-time converter: Damage:Cold, Damage:Fire  ->  Damage[Cold, Fire].

Usage (from the repo root):  python condense_tags.py */_entries.md
Safe to re-run: lines that already use "[" are skipped.
A group with only one subtag stays as Group:Sub, since that is shorter.
"""
import sys
from pathlib import Path

PREFIX = "tags: "


def condense(tags):
    items = []   # each item is a plain tag (str) or a (group, [subs]) pair
    groups = {}  # group name -> its list of subtags
    for tag in (t.strip() for t in tags.split(",")):
        if not tag:
            continue
        group, colon, sub = tag.partition(":")
        if not colon:
            items.append(tag)
        elif group in groups:
            groups[group].append(sub)
        else:
            groups[group] = [sub]
            items.append((group, groups[group]))  # same list object, so later subs show up

    def show(item):
        if isinstance(item, str):
            return item
        group, subs = item
        if len(subs) == 1:
            return f"{group}:{subs[0]}"
        return f"{group}[{', '.join(subs)}]"

    return ", ".join(show(item) for item in items)


for name in sys.argv[1:]:
    path = Path(name)
    lines = path.read_text(encoding="utf-8").split("\n")
    changed = 0
    for i, line in enumerate(lines):
        if line.startswith(PREFIX) and "[" not in line:
            new = PREFIX + condense(line[len(PREFIX):])
            if new != line:
                lines[i] = new
                changed += 1
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"{name}: {changed} tag lines condensed")
