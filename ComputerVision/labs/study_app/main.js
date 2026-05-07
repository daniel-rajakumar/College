import { topics, examSamples } from './content.js';

const navLinks = document.getElementById('nav-links');
const mainContent = document.getElementById('main-content');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchTrigger = document.getElementById('search-trigger');

// ── Build nav links ──
// Add Cheat Sheet tab first
const csLink = document.createElement('a');
csLink.href = "#cheatsheet";
csLink.textContent = "🚀 Cheat Sheet";
csLink.onclick = (e) => {
    e.preventDefault();
    renderCheatSheet();
};
navLinks.appendChild(csLink);

topics.forEach(t => {
    const a = document.createElement('a');
    a.href = `#${t.id}`;
    a.textContent = t.badge;
    a.onclick = (e) => {
        e.preventDefault();
        renderTab(t.id);
    };
    navLinks.appendChild(a);
});

// ── Render Cheat Sheet Tab ──
function renderCheatSheet() {
    document.getElementById('cheatsheet-section').style.display = 'block';
    mainContent.innerHTML = '';
    
    document.querySelectorAll('#nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#cheatsheet');
    });
}

// ── Render single lab/project tab ──
function renderTab(topicId) {
    const t = topics.find(topic => topic.id === topicId);
    if (!t) return;
    const exam = examSamples[t.id];

    // Hide cheat sheet
    document.getElementById('cheatsheet-section').style.display = 'none';

    // Update active state in nav
    document.querySelectorAll('#nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${t.id}`);
    });

    mainContent.innerHTML = `
        <section class="topic-section open" id="${t.id}">
            <div class="topic-header">
                <div class="topic-header-left">
                    <span class="topic-badge ${t.isProject ? 'project' : ''}">${t.badge}</span>
                    <span class="topic-title">${t.title}</span>
                </div>
            </div>
            <div class="topic-body" style="display:block;">
                <div class="qr-row">
                    <div class="qr-box">
                        <h4>Key Concepts</h4>
                        <ul>${t.concepts.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                    <div class="qr-box">
                        <h4>Operations</h4>
                        <div>${t.operations.map(o => `<span class="tag">${o}</span>`).join('')}</div>
                    </div>
                </div>
                
                <div class="qr-row">
                    <div class="qr-box" style="border-left: 3px solid var(--cyan);">
                        <h4 style="color: var(--cyan);">🌍 Real World Example</h4>
                        <p style="font-size: 0.85rem; color: var(--text); padding-top: 0.4rem;">${t.realWorld}</p>
                    </div>
                    <div class="qr-box" style="border-left: 3px solid var(--red);">
                        <h4 style="color: var(--red);">⚠️ Exam Gotcha</h4>
                        <p style="font-size: 0.85rem; color: var(--text); padding-top: 0.4rem;">${t.gotcha}</p>
                    </div>
                </div>

                ${renderPictureExample(t.id)}

                <div class="code-section">
                    <h4>Your Code</h4>
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        <pre><code class="language-python">${escapeHtml(t.code)}</code></pre>
                    </div>
                </div>
                ${exam ? renderExamSample(exam) : ''}
                <div class="note-box">
                    <strong>Quick Notes:</strong> ${t.notes}
                </div>
            </div>
        </section>
    `;

    if (window.Prism) {
        Prism.highlightAll();
    }
}

function renderPictureExample(topicId) {
    const examples = getPictureExamples();
    const example = examples[topicId];
    if (!example) return '';

    return `
        <div class="picture-card">
            <div class="picture-heading">
                <span>Picture Example</span>
                <small>${example.note}</small>
            </div>
            <div class="picture-grid">
                <figure class="picture-frame">
                    <figcaption>${example.beforeLabel}</figcaption>
                    ${example.before}
                </figure>
                <figure class="picture-frame">
                    <figcaption>${example.afterLabel}</figcaption>
                    ${example.after}
                </figure>
            </div>
        </div>
    `;
}

function getPictureExamples() {
    return {
        lab1: {
            note: 'color image becomes brightness numbers',
            beforeLabel: 'Input RGB',
            afterLabel: 'Grayscale',
            before: pixelSvg([
                ['#ef4444', '#22c55e', '#3b82f6'],
                ['#f59e0b', '#d946ef', '#06b6d4'],
                ['#f8fafc', '#64748b', '#020617']
            ]),
            after: pixelSvg([
                ['#4b5563', '#9ca3af', '#374151'],
                ['#9ca3af', '#9ca3af', '#94a3b8'],
                ['#f8fafc', '#64748b', '#020617']
            ])
        },
        lab2: {
            note: 'dark pixels are stretched brighter',
            beforeLabel: 'Dark',
            afterLabel: 'Saved output image',
            before: gradientSvg(['#050505', '#171717', '#262626', '#3f3f46', '#52525b']),
            after: imageAsset('/examples/lab2-output.png', 'Lab 2 saved output image')
        },
        lab3: {
            note: 'real lab input and revealed output',
            beforeLabel: 'Input image',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab3-input.png', 'Lab 3 input image'),
            after: imageAsset('/examples/lab3-output.png', 'Lab 3 output image')
        },
        lab4: {
            note: 'real blurred input and filter output',
            beforeLabel: 'Input image',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab4-input.png', 'Lab 4 input image'),
            after: imageAsset('/examples/lab4-output.png', 'Lab 4 output image')
        },
        lab5: {
            note: 'real noisy input and saved result',
            beforeLabel: 'Noisy input',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab5-input.png', 'Lab 5 noisy input image'),
            after: imageAsset('/examples/lab5-output.png', 'Lab 5 output image')
        },
        lab6: {
            note: 'real cat input and boundary output',
            beforeLabel: 'Input image',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab6-input.jpg', 'Lab 6 input image'),
            after: imageAsset('/examples/lab6-output.png', 'Lab 6 output image')
        },
        lab7: {
            note: 'lane pipeline keeps the road lines',
            beforeLabel: 'Road image',
            afterLabel: 'Saved output image',
            before: roadSvg(false),
            after: imageAsset('/examples/lab7-output.png', 'Lab 7 output image')
        },
        lab8: {
            note: 'real saved result from the from-scratch pipeline',
            beforeLabel: 'Noisy patch idea',
            afterLabel: 'Saved output image',
            before: pixelSvg([
                ['#111827', '#111827', '#111827'],
                ['#111827', '#f8fafc', '#111827'],
                ['#111827', '#111827', '#111827']
            ]),
            after: imageAsset('/examples/lab8-output.png', 'Lab 8 output image')
        },
        lab9: {
            note: 'real corn input and watershed output',
            beforeLabel: 'Input image',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab9-input.jpg', 'Lab 9 input image'),
            after: imageAsset('/examples/lab9-output.png', 'Lab 9 output image')
        },
        lab10: {
            note: 'face boxes give center points for tracking',
            beforeLabel: 'Face frame',
            afterLabel: 'Box + trail',
            before: faceSvg(false),
            after: faceSvg(true)
        },
        lab11: {
            note: 'CNNs classify small image patterns',
            beforeLabel: 'Digit image',
            afterLabel: 'Prediction',
            before: digitSvg(false),
            after: digitSvg(true)
        },
        lab12: {
            note: 'sigmoid output becomes yes/no',
            beforeLabel: 'Face crop',
            afterLabel: 'Smile = 1',
            before: smileSvg(false),
            after: smileSvg(true)
        },
        lab13: {
            note: 'real search image and template-match output',
            beforeLabel: 'Input image',
            afterLabel: 'Output image',
            before: imageAsset('/examples/lab13-input.png', 'Lab 13 input image'),
            after: imageAsset('/examples/lab13-output.png', 'Lab 13 output image')
        },
        lab14: {
            note: 'corners have strong change in two directions',
            beforeLabel: 'Corner image',
            afterLabel: 'Corner points',
            before: cornerSvg(false),
            after: cornerSvg(true)
        },
        proj1: {
            note: 'real project images from the detector work',
            beforeLabel: 'Input example',
            afterLabel: 'Output example',
            before: imageAsset('/examples/proj1-input.jpg', 'Project 1 input image'),
            after: imageAsset('/examples/proj1-output.png', 'Project 1 output image')
        },
        proj2: {
            note: 'real dataset and training-output screenshots',
            beforeLabel: 'Dataset samples',
            afterLabel: 'Training output',
            before: imageAsset('/examples/proj2-input.png', 'Project 2 dataset sample image'),
            after: imageAsset('/examples/proj2-output.png', 'Project 2 training output image')
        }
    };
}

function imageAsset(src, alt) {
    return `<img class="picture-img" src="${src}" alt="${alt}" loading="lazy">`;
}

function pictureSvg(body) {
    return `<svg class="picture-svg" viewBox="0 0 180 120" role="img" aria-hidden="true">${body}</svg>`;
}

function pixelSvg(rows) {
    const size = 28;
    const startX = 90 - (rows[0].length * size) / 2;
    const startY = 60 - (rows.length * size) / 2;
    const rects = rows.flatMap((row, y) => row.map((color, x) =>
        `<rect x="${startX + x * size}" y="${startY + y * size}" width="${size}" height="${size}" fill="${color}" stroke="#111827" stroke-width="2"/>`
    )).join('');
    return pictureSvg(`<rect width="180" height="120" fill="#020617"/>${rects}`);
}

function gradientSvg(colors) {
    const w = 180 / colors.length;
    const rects = colors.map((color, i) =>
        `<rect x="${i * w}" y="20" width="${w + 1}" height="80" fill="${color}"/>`
    ).join('');
    return pictureSvg(`<rect width="180" height="120" fill="#020617"/>${rects}`);
}

function roiSvg(cropped) {
    if (cropped) {
        return pixelSvg([
            ['#22c55e', '#84cc16', '#eab308'],
            ['#06b6d4', '#38bdf8', '#f8fafc']
        ]);
    }
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <rect x="24" y="18" width="132" height="84" fill="#1f2937"/>
        <rect x="42" y="30" width="24" height="24" fill="#ef4444"/>
        <rect x="66" y="30" width="24" height="24" fill="#22c55e"/>
        <rect x="90" y="30" width="24" height="24" fill="#84cc16"/>
        <rect x="114" y="30" width="24" height="24" fill="#eab308"/>
        <rect x="42" y="54" width="24" height="24" fill="#64748b"/>
        <rect x="66" y="54" width="24" height="24" fill="#06b6d4"/>
        <rect x="90" y="54" width="24" height="24" fill="#38bdf8"/>
        <rect x="114" y="54" width="24" height="24" fill="#f8fafc"/>
        <rect x="64" y="28" width="76" height="52" fill="none" stroke="#f59e0b" stroke-width="4"/>
    `);
}

function shapeSvg(kind) {
    const fill = kind === 'square' ? '#38bdf8' : 'none';
    const stroke = kind === 'square' ? '#38bdf8' : '#f8fafc';
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <rect x="52" y="26" width="76" height="68" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="5"/>
    `);
}

function roadSvg(maskOnly) {
    return pictureSvg(`
        <rect width="180" height="120" fill="${maskOnly ? '#020617' : '#334155'}"/>
        <polygon points="70,120 88,20 96,20 112,120" fill="${maskOnly ? '#f8fafc' : '#e2e8f0'}"/>
        <polygon points="18,120 76,20 84,20 44,120" fill="${maskOnly ? '#f8fafc' : '#e2e8f0'}"/>
        ${maskOnly ? '' : '<polygon points="0,120 62,20 118,20 180,120" fill="rgba(15,23,42,.45)"/>'}
    `);
}

function blobsSvg(split) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <circle cx="72" cy="60" r="30" fill="${split ? '#38bdf8' : '#94a3b8'}"/>
        <circle cx="108" cy="60" r="30" fill="${split ? '#f59e0b' : '#94a3b8'}"/>
        ${split ? '<line x1="90" y1="30" x2="90" y2="90" stroke="#020617" stroke-width="5"/>' : ''}
    `);
}

function faceSvg(tracked) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <circle cx="90" cy="56" r="30" fill="#fbbf24"/>
        <circle cx="80" cy="50" r="3" fill="#111827"/>
        <circle cx="100" cy="50" r="3" fill="#111827"/>
        <path d="M78 68 Q90 78 102 68" fill="none" stroke="#111827" stroke-width="4"/>
        ${tracked ? '<rect x="55" y="21" width="70" height="70" fill="none" stroke="#22c55e" stroke-width="4"/><polyline points="42,96 62,86 90,56 124,36" fill="none" stroke="#38bdf8" stroke-width="4"/><circle cx="90" cy="56" r="5" fill="#ef4444"/>' : ''}
    `);
}

function digitSvg(predicted) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <text x="70" y="85" fill="#f8fafc" font-size="76" font-family="monospace" font-weight="700">7</text>
        ${predicted ? '<rect x="106" y="34" width="52" height="32" rx="5" fill="#22c55e"/><text x="116" y="56" fill="#020617" font-size="18" font-family="monospace" font-weight="700">7</text>' : ''}
    `);
}

function smileSvg(smile) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <circle cx="90" cy="56" r="31" fill="#fbbf24"/>
        <circle cx="79" cy="50" r="3" fill="#111827"/>
        <circle cx="101" cy="50" r="3" fill="#111827"/>
        <path d="${smile ? 'M74 67 Q90 84 106 67' : 'M76 72 Q90 64 104 72'}" fill="none" stroke="#111827" stroke-width="4"/>
        ${smile ? '<text x="64" y="110" fill="#22c55e" font-size="16" font-family="monospace" font-weight="700">smile: 1</text>' : ''}
    `);
}

function templateSvg(marked) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <rect x="28" y="20" width="124" height="80" fill="#111827"/>
        <rect x="44" y="34" width="18" height="18" fill="#475569"/>
        <rect x="94" y="58" width="28" height="28" fill="#f8fafc"/>
        <rect x="128" y="32" width="14" height="14" fill="#475569"/>
        ${marked ? '<rect x="91" y="55" width="34" height="34" fill="none" stroke="#22c55e" stroke-width="4"/>' : ''}
    `);
}

function cornerSvg(marked) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <rect x="42" y="24" width="96" height="72" fill="#f8fafc"/>
        <rect x="42" y="24" width="48" height="36" fill="#020617"/>
        ${marked ? '<circle cx="90" cy="60" r="7" fill="#ef4444"/><circle cx="42" cy="96" r="5" fill="#ef4444"/><circle cx="138" cy="24" r="5" fill="#ef4444"/>' : ''}
    `);
}

function projectOneSvg(marked) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <circle cx="48" cy="48" r="18" fill="#d1d5db"/>
        <circle cx="92" cy="44" r="14" fill="#d1d5db"/>
        <rect x="106" y="70" width="42" height="20" rx="5" fill="#38bdf8"/>
        <circle cx="116" cy="92" r="5" fill="#111827"/>
        <circle cx="140" cy="92" r="5" fill="#111827"/>
        ${marked ? '<circle cx="48" cy="48" r="22" fill="none" stroke="#22c55e" stroke-width="4"/><circle cx="92" cy="44" r="18" fill="none" stroke="#22c55e" stroke-width="4"/><rect x="101" y="66" width="52" height="31" fill="none" stroke="#f59e0b" stroke-width="4"/>' : ''}
    `);
}

function projectTwoSvg(marked) {
    return pictureSvg(`
        <rect width="180" height="120" fill="#020617"/>
        <circle cx="76" cy="58" r="28" fill="#fbbf24"/>
        <circle cx="67" cy="52" r="3" fill="#111827"/>
        <circle cx="85" cy="52" r="3" fill="#111827"/>
        <path d="M64 68 Q76 76 88 68" fill="none" stroke="#111827" stroke-width="4"/>
        ${marked ? '<rect x="44" y="26" width="64" height="64" fill="none" stroke="#22c55e" stroke-width="4"/><text x="114" y="56" fill="#22c55e" font-size="16" font-family="monospace" font-weight="700">me</text><text x="114" y="78" fill="#94a3b8" font-size="12" font-family="monospace">0.93</text>' : ''}
    `);
}

function renderExamSample(exam) {
    return `
        <div class="exam-card">
            <div class="exam-heading">
                <span>Midterm-Style Sample Question</span>
                <small>from-scratch NumPy answer + output</small>
            </div>
            <p class="exam-question">${exam.question}</p>
            <div class="code-block">
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                <pre><code class="language-python">${escapeHtml(exam.code)}</code></pre>
            </div>
            <div class="output-block">
                <div class="output-label">Output</div>
                <pre><code>${escapeHtml(exam.output)}</code></pre>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Copy button ──
window.copyCode = function(btn) {
    const code = btn.nextElementSibling.textContent;
    navigator.clipboard.writeText(code);
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = 'Copy', 1500);
};

// ── Search ──
function openSearch() {
    searchBar.classList.add('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();
}

function closeSearch() {
    searchBar.classList.remove('open');
}

searchTrigger.addEventListener('click', openSearch);

searchBar.addEventListener('click', e => {
    if (e.target === searchBar) closeSearch();
});

document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    if (e.key === 'Escape') closeSearch();
});

searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) { searchResults.innerHTML = ''; return; }

    const hits = [];
    topics.forEach(t => {
        const exam = examSamples[t.id];
        const examText = exam ? [exam.question, exam.code, exam.output].join(' ') : '';
        const haystack = [t.title, t.notes, t.code, examText, ...t.concepts, ...t.operations].join(' ');
        const idx = haystack.toLowerCase().indexOf(q);
        if (idx >= 0) {
            const start = Math.max(0, idx - 30);
            const snippet = haystack.substring(start, start + 80);
            hits.push({ id: t.id, badge: t.badge, title: t.title, snippet, idx });
        }
    });

    searchResults.innerHTML = hits.length
        ? hits.map(h => `
            <a class="search-result-item" href="#${h.id}" onclick="renderTab('${h.id}'); document.getElementById('search-bar').classList.remove('open');">
                <div class="sr-title">${h.badge}: ${h.title}</div>
                <div class="sr-match">...${h.snippet.replace(new RegExp(`(${searchInput.value})`, 'gi'), '<mark>$1</mark>')}...</div>
            </a>
        `).join('')
        : '<div style="padding:1rem;color:#94a3b8;text-align:center;">No results found</div>';
});

// ── Init ──
window.renderTab = renderTab; // Expose for inline onclick handlers in search
window.renderCheatSheet = renderCheatSheet;
renderCheatSheet(); // Open Cheat Sheet by default
