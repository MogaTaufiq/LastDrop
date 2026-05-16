import re

with open('js/game.js', 'r') as f:
    content = f.read()

# Find and replace instruction.textContent = '...';
def replacer(m):
    return f"typeWriter(instruction, {m.group(1)}, 30);"

content = re.sub(r"instruction\.textContent\s*=\s*('[^']+');", replacer, content)

with open('js/game.js', 'w') as f:
    f.write(content)
