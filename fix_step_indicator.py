import re

with open('js/game.js', 'r') as f:
    content = f.read()

# Replace stepIndicator.textContent = ... with if(stepIndicator) stepIndicator.textContent = ...
def replacer(m):
    return f"if (stepIndicator) {m.group(0)}"

content = re.sub(r"stepIndicator\.textContent\s*=\s*('[^']+');", replacer, content)

with open('js/game.js', 'w') as f:
    f.write(content)
