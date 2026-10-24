import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The #app div contains the 3 panes.
app_match = re.search(r'(<div id="app" style="display:none;">)(.*?)(  </div>\n\n  <!-- Error Toast -->)', content, flags=re.DOTALL)
if app_match:
    app_start = app_match.group(1)
    app_inner = app_match.group(2)
    app_end = app_match.group(3)
    
    chat_pane_match = re.search(r'    <!-- ===== MIDDLE PANE: Chat ===== -->.*?    </div>', app_inner, flags=re.DOTALL)
    canvas_pane_match = re.search(r'    <!-- ===== LEFT PANE: Canvas ===== -->.*?    </div>\n    </div>', app_inner, flags=re.DOTALL)
    control_pane_match = re.search(r'    <!-- ===== RIGHT PANE: Controls ===== -->.*?    </div>', app_inner, flags=re.DOTALL)
    
    chat_pane = chat_pane_match.group(0)
    canvas_pane = canvas_pane_match.group(0)
    control_pane = control_pane_match.group(0)
    
    divider = '\n    <!-- Divider -->\n    <div class="pane-divider" id="canvas-chat-divider"></div>\n\n'
    divider2 = '\n    <!-- Divider -->\n    <div class="pane-divider"></div>\n\n'
    
    new_app_inner = "\n" + control_pane + divider + chat_pane + divider2 + canvas_pane + "\n"
    
    new_content = content[:app_match.start(2)] + new_app_inner + content[app_match.end(2):]
    
    # Also update slider default values
    new_content = new_content.replace('<input type="range" id="slider-verbosity" min="1" max="5" value="3" step="1" />', '<input type="range" id="slider-verbosity" min="1" max="5" value="2" step="1" />')
    new_content = new_content.replace('<input type="range" id="slider-tone" min="1" max="5" value="3" step="1" />', '<input type="range" id="slider-tone" min="1" max="5" value="4" step="1" />')
    new_content = new_content.replace('<input type="range" id="slider-self-promotion" min="1" max="5" value="3" step="1" />', '<input type="range" id="slider-self-promotion" min="1" max="5" value="2" step="1" />')
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Done")
else:
    print("Could not find #app")
