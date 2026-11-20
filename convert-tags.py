import re
from pathlib import Path

# Matches "Group:Sub" where neither side contains commas, brackets, or colons.
PAIR = re.compile(r'([^,\[\]:]+):([^,\[\]:]*[^,\[\]:\s])')

# Matches a whole "tags: ..." line. (?m) makes ^ and $ mean start/end of a line.
TAGS_LINE = re.compile(r'(?m)^(tags:)(.*)$')

def convert(text):
    return TAGS_LINE.sub(
        lambda m: m.group(1) + PAIR.sub(r'\1[\2]', m.group(2)),
        text,
    )

for path in Path('.').glob('*/_entries.md'):
    old = path.read_text(encoding='utf-8')
    new = convert(old)
    if new != old:
        path.write_text(new, encoding='utf-8')
        print('updated', path)
