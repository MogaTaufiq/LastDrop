import re

with open('js/game.js', 'r') as f:
    content = f.read()

# 1. Add typeWriter utility at the top (after GameState or Audio, before SceneManager)
typewriter_code = """
// ============================================
// UTILITIES
// ============================================
function typeWriter(element, text, speed = 50, callback) {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, speed);
}
"""

content = content.replace("// ============================================\n// SCENE MANAGER", typewriter_code + "\n// ============================================\n// SCENE MANAGER")


# 2. Remove scene labels and <em> tags from cinematicSlides
def replace_slide(m):
    # Remove `scene: '...',` entirely
    block = m.group(0)
    block = re.sub(r"scene:\s*'[^']*',\s*", "", block)
    # Remove <em> and </em> from text
    block = block.replace("<em>", "").replace("</em>", "")
    return block

content = re.sub(r"const cinematicSlides = \[.*?\];", lambda m: replace_slide(m), content, flags=re.DOTALL)


# 3. Update renderSlide
old_render_slide = """function renderSlide(index) {
    const container = document.getElementById('cinematic-slides-container');
    container.innerHTML = '';

    const slide = cinematicSlides[index];
    const div = document.createElement('div');
    div.className = 'cinematic-slide active';
    div.innerHTML = `
        <div class="cin-illustration">${getCinematicBg(slide.type)}</div>
        <div class="cinematic-overlay"></div>
        <div class="cinematic-text">
            <div class="cinematic-scene-label">${slide.scene}</div>
            <h2>${slide.text}</h2>
        </div>
    `;
    container.appendChild(div);

    // Update next button
    const btn = document.getElementById('cin-next-btn');
    btn.textContent = slide.isLast ? 'Begin Mission →' : 'Next →';
}"""

new_render_slide = """function renderSlide(index) {
    const container = document.getElementById('cinematic-slides-container');
    container.innerHTML = '';

    const slide = cinematicSlides[index];
    const div = document.createElement('div');
    div.className = 'cinematic-slide active';
    div.innerHTML = `
        <div class="cin-illustration">${getCinematicBg(slide.type)}</div>
        <div class="cinematic-overlay"></div>
        <div class="cinematic-text">
            <h2 id="slide-text"></h2>
        </div>
    `;
    container.appendChild(div);

    typeWriter(document.getElementById('slide-text'), slide.text, 50);

    // Update next button
    const btn = document.getElementById('cin-next-btn');
    btn.textContent = slide.isLast ? 'Begin Mission →' : 'Next →';
}"""

content = content.replace(old_render_slide, new_render_slide)

# 4. Add typeWriter calls to initTaskX
tasks = {
    'initTask1': ("t1-instruction", "Click the turtle to free it from plastic entanglement"),
    'initTask2': ("t2-instruction", "Click each trash item to collect it"),
    'initTask3': ("t3-instruction", "Click the broken pipe to seal the leak"),
    'initTask4': ("t4-instruction", "Choose a method to clean up the oil spill"),
    'initAgriTask1': ("agri1-instruction", "Scan the farm area to find the source of pollution."),
    'initAgriTask2': ("agri2-instruction", "Plant vegetation along the river to filter runoff."),
    'initIndTask1': ("ind1-instruction", "Locate the source of industrial wastewater."),
    'initIndTask2': ("ind2-instruction", "Fix the leaking pipe joint. Drag missing bolts and tighten all."),
    'initIndTask3': ("ind3-instruction", "Choose a method to treat the remaining wastewater.")
}

for func_name, (el_id, text) in tasks.items():
    pattern = rf"function {func_name}\(\) {{\n    if \(GameState\.phase !== '[^']+'\) return;\n"
    replacement = f"function {func_name}() {{\n    if (GameState.phase !== '{func_name.replace('init', '').replace('Task', 'task').replace('Agri', 'agri').replace('Ind', 'ind')}') return;\n\n    const instructionEl = document.getElementById('{el_id}');\n    if(instructionEl) typeWriter(instructionEl, '{text}', 40);\n"
    
    # Needs to match exactly the GameState check string
    # Actually, we can just find "function initTask1() {" and insert after the GameState.phase check
    def replacer(m):
        header = m.group(0)
        return header + f"    const instructionEl = document.getElementById('{el_id}');\n    if(instructionEl) typeWriter(instructionEl, '{text}', 40);\n"
        
    content = re.sub(rf"function {func_name}\(\) {{\n    if \(GameState\.phase !== '[^']+'\) return;\n", replacer, content)

with open('js/game.js', 'w') as f:
    f.write(content)
