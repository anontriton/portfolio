// All site content lives here. Add a project or job by adding an entry to the
// matching array; pages render from this file. Blog posts are Markdown files
// in src/posts/ (see src/blog.ts).

export const profile = {
  name: 'Iverson Lai',
  handle: 'iversonlai',
  host: 'archlinux', // i use arch, btw
  title: 'software engineer',
  focus: 'c/c++, systems, machine learning',
  pitch:
    "Hey! I'm a software engineer who likes learning by doing. Many of my projects start with something I want to understand, and lately that's meant a lot of experimenting with machine learning and systems programming. Most recently, I built a neural network library from scratch in C.",
  location: 'san diego, ca',
  timezone: 'America/Los_Angeles',
  degree: 'm.s. computer science, tufts university, 2026',
  degreeShort: 'm.s. computer science, tufts 2026', // fits beside the portrait
  status: 'open to swe roles',
  email: 'hello@iversonlai.dev',
  github: 'https://github.com/anontriton',
  linkedin: 'https://www.linkedin.com/in/iversonlai',
  monkeytype: 'https://monkeytype.com/profile/iversonlai0',
  resume: '/resume.pdf',
  // Photo for the ASCII portrait in the hero. Drop it in public/images/ and
  // set the path; a cut-out PNG (transparent background) reads best.
  // null shows the IL logo instead.
  portrait: '/images/iverson-ascii.png' as null | string,
  // Shown under "building" in the hero and tl;dr. Set to null to hide.
  current: null as null | { name: string; note: string; href?: string },
  sourceRepo: 'https://github.com/anontriton/portfolio',
}

// Months since a YYYY-MM start, as neofetch-style "3 years, 4 months".
// Computed when the page loads, so it never needs updating by hand.
function uptime(start: string) {
  const [y, m] = start.split('-').map(Number)
  const now = new Date()
  const months = (now.getFullYear() - y) * 12 + now.getMonth() + 1 - m
  const plural = (n: number, unit: string) => (n ? `${n} ${unit}${n === 1 ? '' : 's'}` : '')
  return [plural(Math.floor(months / 12), 'year'), plural(months % 12, 'month')].filter(Boolean).join(', ') || 'just booted'
}

// The hero's neofetch readout, top to bottom. `accent` colours the value.
// Lines that repeat profile facts read them from `profile`, so each value is
// edited in one place.
export const neofetch: { key: string; value: string; accent?: string }[] = [
  { key: 'role', value: profile.title.toLowerCase() },
  { key: 'focus', value: profile.focus.toLowerCase() },
  { key: 'kernel', value: 'coffee', accent: 'text-orange' },
  { key: 'uptime', value: uptime('2023-06') }, // started CS in June 2023
  { key: 'editor', value: 'neovim, zed' },
  { key: 'education', value: profile.degreeShort },
  { key: 'background', value: 'biology, environmental science' },
  { key: 'interests', value: 'ai/ml, biotech, game dev, open source' },
  { key: 'location', value: profile.location },
  { key: 'status', value: profile.status, accent: 'text-green' },
]

export const about = [
  "Howdy. I'm a software engineer with a background in life sciences, a love for storytelling, and an inconvenient habit of wanting to understand how everything works.",
  "My journey into software wasn't exactly conventional. I studied environmental science at UC San Diego before earning my master's in computer science at Tufts University. Along the way, I worked in scientific research, from using underwater acoustic sensors to track marine life (hence the sharks!) to evaluating biomedical blood-testing devices. Those experiences gave me an appreciation for how technology can help us better understand the world and solve meaningful problems.",
  "These days, I'm especially curious about artificial intelligence, machine learning, and the systems that make them work. I enjoy getting under the hood of complex systems, whether that's building a neural network library from scratch or figuring out how to make something faster and more efficient. Sometimes, a simple \"Wait, how does that actually work?\" turns into a project that takes a little longer than expected, but that's half the fun. I like to think my interdisciplinary background and curiosity bring a fresh perspective to the problems I tackle.",
  "Outside of programming, you'll usually find me gaming, writing, painting, or getting lost in a good book. I've always been drawn to the intersection of art and technology, and game development has been one way for me to bring those interests together. I even dedicated my master's capstone project to building a retro-inspired tactical RPG, complete with an original story and characters. That creative side also shapes how I approach engineering: exchanging ideas, exploring possibilities, bringing a vision to life, repeat. At the end of the day, I just really enjoy making things.",
]

export const skills: { group: string; items: string[] }[] = [
  { group: 'languages', items: ['C', 'C++', 'Python', 'TypeScript', 'JavaScript', 'GDScript', 'MATLAB'] },
  {
    group: 'systems',
    items: ['Linux', 'memory management', 'multithreading', 'SIMD/AVX2', 'WebAssembly', 'INT8 quantization', 'profiling'],
  },
  {
    group: 'ml',
    items: ['PyTorch', 'neural networks', 'autodiff', 'transformer inference', 'model evaluation'],
  },
  { group: 'web', items: ['Angular', 'Node.js', 'Express', 'REST APIs', 'MongoDB', 'AWS', 'nginx'] },
  { group: 'tools', items: ['Git', 'CMake', 'Make', 'GDB', 'Valgrind', 'GitHub Actions'] },
  { group: 'gamedev', items: ['Godot 4', 'state machines', 'pathfinding', 'utility AI'] },
]

export type Link = { label: string; href: string; primary?: boolean }
export type Stat = { value: string; label: string; detail?: string }
export type Section = { heading: string; body?: string[]; bullets?: string[]; code?: string }

export type Project = {
  slug: string
  name: string
  file: string // shown as the terminal-style file name
  tagline: string
  description: string
  year: string
  tags: ('systems' | 'ml' | 'games' | 'web')[]
  stack: string[]
  featured: boolean
  stats?: Stat[]
  highlights: string[]
  links: Link[]
  image?: { src: string; alt: string; caption?: string }
  // Short muted loop (public/videos/*.mp4) shown on the card in place of the
  // image and at the top of the project page; the image doubles as its poster.
  video?: string
  gallery?: { src: string; alt: string; caption?: string }[]
  sections?: Section[]
  note?: string
}

export const projects: Project[] = [
  {
    slug: 'gpt2-inference-engine',
    name: 'GPT-2 Inference Engine',
    file: 'llm-ref-eng',
    tagline: 'GPT-2 from scratch: PyTorch → C++ → WebAssembly, proven correct at every step.',
    description:
      'A GPT-2 124M inference engine built three times — a hand-written PyTorch reference, a dependency-free C++ engine, and a WebAssembly build that runs in the browser. Every stage is validated against the one before it, and no optimization landed without passing that comparison again.',
    year: '2026',
    tags: ['systems', 'ml'],
    stack: ['C++17', 'Python', 'PyTorch', 'AVX2', 'SIMD', 'multithreading', 'WebAssembly', 'INT8', 'CMake'],
    featured: true,
    stats: [
      { value: '373×', label: 'decode speedup', detail: '0.11 → 42.6 tok/s on an i5-1135G7' },
      { value: '615', label: 'activations validated', detail: 'against the PyTorch reference' },
      { value: '129 MB', label: 'INT8 weights', detail: 'down from 498 MB fp32' },
      { value: '21 ms', label: 'per token in browser', detail: 'wasm SIMD, single thread' },
    ],
    highlights: [
      'Validated 615 intermediate activations across five prompts against a hand-written PyTorch reference; 50 greedy tokens identical.',
      'Accelerated decoding 373× (0.11 → 42.6 tokens/s) with KV caching, cache-blocked GEMM, AVX2 vectorization, and multithreading — each step bit-identical to the last.',
      'Applied per-channel symmetric INT8 quantization, shrinking weights from ~498 MB to 129 MB while keeping 97.4% top-1 agreement with fp32.',
      'Evaluated quantization with perplexity, top-1 agreement, KL divergence, and decisive-disagreement analysis.',
      'Compiled the same C++ to WebAssembly SIMD: ~21 ms/token in Chrome, with a hand-written tokenizer matching Hugging Face token ids exactly.',
      'CI re-runs the full validation and only republishes the live demo when it passes.',
    ],
    links: [
      { label: 'live demo', href: 'https://anontriton.github.io/llm-ref-eng/', primary: true },
      { label: 'write-up', href: 'https://github.com/anontriton/llm-ref-eng/blob/main/docs/writeup.md' },
      { label: 'source', href: 'https://github.com/anontriton/llm-ref-eng' },
    ],
    sections: [
      {
        heading: 'the problem with "it works"',
        body: [
          "Numerical code rarely fails loudly. Transpose a matrix the wrong way, use the exact GELU instead of GPT-2's tanh approximation, or scale attention by 1/√768 instead of 1/√64, and the model still writes readable English — it's just quietly a worse model than the one you meant to build.",
          "So the goal was never an engine that runs. It was an engine that can prove it computes GPT-2, and keeps proving it while it's rewritten for speed, compressed, and moved to a new platform.",
        ],
      },
      {
        heading: 'pipeline',
        code: `pytorch reference (hand-written)
      │   615 activations recorded as the oracle
      ▼
c++ engine, fp32, naive ──────────── must match the oracle
      │
      ▼
kv cache · blocked gemm · avx2 · threads ── bit-identical at every step
      │
      ▼
int8 per-channel weights ─────────── perplexity / top-1 / KL
      │
      ▼
emscripten → wasm simd ───────────── browser demo, CI-gated`,
      },
      {
        heading: 'phases with exit criteria',
        bullets: [
          'foundations — download and checksum-pin weights; write GPT-2 by hand in PyTorch.',
          'oracle — turn the reference into a source of truth other implementations are checked against.',
          'correct c++ — match the oracle layer by layer; no optimization allowed yet.',
          'performance — make it fast, re-validating after every change.',
          'quantization — shrink the weights, and measure what that costs.',
          'webassembly — run the same engine in a browser tab.',
          'documentation — proven by running every documented command in a clean clone.',
        ],
      },
      {
        heading: 'why the order matters',
        body: [
          "Optimizing code that has never been shown correct means you can't tell your own optimization bugs from bugs that were already there. Proving correctness first means each optimization only has to show one thing: that it changed nothing.",
        ],
      },
    ],
  },
  {
    slug: 'ml-library',
    name: 'ML Library in C',
    file: 'ml-library',
    tagline: 'A neural network library from scratch in C — autodiff, arenas, and SGD.',
    description:
      'A small neural network library in C with no dependencies beyond libc and libm: matrix math, reverse-mode automatic differentiation over a computational graph, arena-based memory, and mini-batch SGD. The included example trains an MNIST classifier on a laptop CPU.',
    year: '2026',
    tags: ['systems', 'ml'],
    stack: ['C11', 'Make', 'autodiff', 'memory arenas', 'ASan', 'UBSan'],
    featured: true,
    stats: [
      { value: '~94%', label: 'MNIST test accuracy', detail: '3-layer net with a residual' },
      { value: '~15 s', label: 'training time', detail: 'laptop CPU' },
      { value: '0', label: 'dependencies', detail: 'beyond libc and libm' },
    ],
    highlights: [
      'Matrix operations (including all four matmul transpose variants without copies) and their backward passes, written by hand.',
      'Autograd engine that compiles the graph into flat forward and backward tapes via iterative DFS topological sort.',
      'Hand-derived gradients for ReLU, softmax, and cross-entropy; max-subtracted softmax and clamped loss for numerical stability.',
      'Arena allocators built on virtual memory (mmap/mprotect) with scratch pools — no per-tensor allocations, no fragmentation.',
      'API redesign decoupling graph definition from model compilation, replacing flag-driven side effects with a validated constructor.',
      'Seeded, reproducible runs and debug builds verified clean under AddressSanitizer and UBSan.',
    ],
    links: [{ label: 'source', href: 'https://github.com/anontriton/ml-library', primary: true }],
    sections: [
      {
        heading: 'layout',
        code: `src/
  arena    memory arenas (reserve virtual memory, commit on demand)
  prng     PCG random number generator
  matrix   matrix ops + backward passes
  graph    autograd: nodes, topological sort, forward, backprop
  model    wraps a graph's input / output / cost nodes
  train    mini-batch SGD with a test pass per epoch
examples/mnist/   digit classifier linked against libml.a`,
      },
      {
        heading: 'how it works',
        bullets: [
          'memory — every allocation comes from an arena; nothing is freed individually.',
          'math — row-major f32 matrices: add, matmul, ReLU, softmax, cross-entropy, each with a backward.',
          'autograd — the model is a graph of nodes compiled once into a program; forward walks it front to back, backprop back to front.',
          'training — mini-batch SGD, per-epoch shuffling, Xavier initialization.',
        ],
      },
    ],
  },
  {
    slug: 're-genesis',
    name: 'Re: Genesis',
    file: 're-genesis',
    tagline: 'A tactical RPG with utility-based enemy AI, built solo in Godot 4.',
    description:
      'A grid-based, turn-based tactics game in the tradition of Fire Emblem and Final Fantasy Tactics, and my master’s capstone at Tufts. The build is a vertical slice: one complete chapter running the full game loop, on systems designed to carry a longer campaign. It plays in the browser on desktop, or as a download for Windows and macOS.',
    year: '2025',
    tags: ['games'],
    stack: ['Godot 4.4', 'GDScript', 'JSON', 'state machines', 'pathfinding', 'utility AI'],
    featured: true,
    stats: [
      { value: '~16k', label: 'lines of GDScript', detail: 'with an in-engine test suite' },
      { value: '7', label: 'playable characters', detail: 'each with a distinct role' },
      { value: '20', label: 'abilities', detail: 'plus 12 weapons' },
      { value: 'v0.0.34', label: 'latest build', detail: 'web, Windows, and macOS' },
    ],
    image: {
      src: '/images/regenesis/movement-and-attack-range.jpg',
      alt: 'A battle in Re: Genesis — Thomas is selected, with blue tiles showing where he can move and red tiles showing everything he could attack after moving.',
      caption: 'Selecting a unit shows its whole reach: blue for movement, red for every tile it could strike after moving.',
    },
    // The opening battle from a 4.6-minute playthrough, starting after the
    // title and story scenes, sped up 4× and re-encoded at 720p to keep it small.
    video: '/videos/regenesis-demo.mp4',
    gallery: [
      {
        src: '/images/regenesis/combat-preview.jpg',
        alt: 'The combat forecast: each side’s HP before and after, damage, hit and crit chance.',
        caption: 'Every attack is forecast before you commit: HP after the exchange, hit, crit, and whether the target can counter.',
      },
      {
        src: '/images/regenesis/critical-hit.jpg',
        alt: 'A critical hit in the combat window.',
        caption: 'Crits are scaled by luck — and the enemy gets them too.',
      },
      {
        src: '/images/regenesis/story-dialogue.jpg',
        alt: 'Visual-novel story scene: Lisa speaks while Commander Gallagher listens.',
        caption: 'Story between battles, visual-novel style, with the speaker highlighted.',
      },
      {
        src: '/images/regenesis/your-move-banner.jpg',
        alt: 'The Your Move banner sweeping across the battlefield at the start of the player phase.',
        caption: 'Player and enemy phases alternate, Fire Emblem style.',
      },
    ],
    highlights: [
      'Utility-based enemy AI that scores every action by expected damage, target health, accumulated aggro, positional safety, and ally proximity, with a little noise so a map never replays the same way. It presses when it outnumbers you locally and backs off when isolated; healers triage allies in critical condition.',
      'Cost-aware flood fill over the grid with per-unit terrain costs, obstacles, and faction-aware occupancy, folded together with weapon ranges into one overlay of everything a unit can hit after moving.',
      'Combat math with a physical/special split, damage variance, luck-scaled crits, speed-scaled accuracy, counterattacks, weapon and element triangles, and a forecast that matches what the attack actually does.',
      'A two-layer architecture separating campaign orchestration from battle logic over signals, with an async UI queue that sequences dialogue, camera, and notifications while blocking input.',
      'All content defined in JSON: 7 protagonists, 20 abilities, 12 weapons, and a scripting system that fires popups, reinforcements, camera moves, and objective changes mid-battle.',
      'A polish pass (v0.0.34) added tile-by-tile movement, map HP bars, hit and spell effects, phase banners, and typewriter dialogue. Builds ship for the web, Windows, and macOS.',
    ],
    links: [
      { label: 'live demo', href: 'https://regenesis.iversonlai.dev', primary: true },
      { label: 'download build', href: 'https://github.com/anontriton/regenesis-builds/releases' },
      { label: 'builds repo', href: 'https://github.com/anontriton/regenesis-builds' },
    ],
    note: 'Source is private — happy to walk through the code in an interview.',
    sections: [
      // Code samples match the "Source code" section of the regenesis-builds README.
      {
        heading: 'movement range',
        body: [
          'Movement is a cost-aware flood fill over the 4-way grid. Each step adds the terrain cost for that unit (sand is cheap for one class and expensive for another), impassable tiles and enemy units block, and a tile’s cost is lowered whenever a cheaper route to it is found. The result is every tile the unit can reach, mapped to what it costs to get there. This is what paints the blue tiles.',
        ],
        code: `# battle/grid/grid.gd
func flood_reachable(start: Vector2i, max_cost: int, is_occupied: Callable, terrain_costs: Dictionary = {}) -> Dictionary:
    var open: Array[Vector2i] = [start]
    var cost: Dictionary = { start: 0 }

    while open.size() > 0:
        var cur: Vector2i = open.pop_front()
        var cur_cost: int = cost[cur]

        for n in neighbors(cur):
            # check if terrain is passable
            var terrain_cost = terrain_costs.get(n, 999)
            if terrain_cost >= 999:
                continue

            # check if obstacle blocks movement
            if obstacle and obstacle.get_cell_source_id(n) != -1:
                continue

            # check if another unit occupies this cell (allow starting position)
            if n != start and is_occupied.call(n):
                continue

            # calculate movement cost to reach this neighbor
            var step: int = cur_cost + terrain_cost
            if step > max_cost:
                continue

            # update cost if this is a new cell or we found a cheaper path
            if not cost.has(n) or step < int(cost[n]):
                cost[n] = step
                open.push_back(n)

    return cost`,
      },
      {
        heading: 'attack range',
        body: [
          'Attack and ability ranges are diamonds, measured with Manhattan distance (|dx| + |dy|). The red overlay runs this from every tile in the movement result, so it shows everything a unit could hit after moving.',
        ],
        code: `# battle/utils/range_calculator.gd
static func get_cells_in_range(start_cell: Vector2i, range_value: int) -> Array[Vector2i]:
    var cells: Array[Vector2i] = []
    for dx in range(-range_value, range_value + 1):
        for dy in range(-range_value, range_value + 1):
            if abs(dx) + abs(dy) <= range_value and (dx != 0 or dy != 0):
                cells.append(start_cell + Vector2i(dx, dy))
    return cells`,
      },
      {
        heading: 'what’s next',
        body: [
          'The build is one complete chapter. Still to come: saving, more chapters (the content pipeline handles them; authored maps and story are the bottleneck), full attack animations, escort and seize objectives, and sound.',
        ],
      },
    ],
  },
  {
    slug: 'touchline',
    name: 'Touchline',
    file: 'touchline',
    tagline: 'A Fantasy Premier League decision assistant that shows its working.',
    description:
      "Touchline answers one question each week: what should I do with my team? It projects every player's expected points from underlying stats, minutes, and fixtures, then weighs transfers, captaincy, and chips against those numbers. Every recommendation breaks down into the parts behind it, so you can see why it's suggested and how confident it is. I use it regularly as my own app on my phone; the public demo gives you a random squad to play with on a weekly copy of real data.",
    year: '2026',
    tags: ['web', 'ml'],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'SQLite', 'Drizzle', 'Claude API', 'Tailwind', 'shadcn/ui', 'Recharts', 'Docker', 'Railway'],
    featured: true,
    // Screenshots are from the touchline repo's media/ folder. The video is a
    // scripted tour of the live demo (home → breakdown → transfers → rankings
    // and compare → fixtures → chips and builder → league), played at 1.5×.
    image: {
      src: '/images/touchline/home.png',
      alt: 'Touchline’s home screen: a suggested double transfer worth +10.3 expected points, the captain pick, and the squad on a pitch.',
      caption: 'Home: this week’s suggested move, with “see why” opening the breakdown behind it.',
    },
    video: '/videos/touchline-tour.mp4',
    gallery: [
      {
        src: '/images/touchline/transfers.png',
        alt: 'The transfer advisor’s best move, with the points it must beat and the reasons behind it.',
        caption: 'The best move has to beat the value of saving the transfer, plus a safety margin.',
      },
      {
        src: '/images/touchline/rankings.png',
        alt: 'Player rankings by expected points over the next five gameweeks, with start probability, ownership, and fixtures.',
        caption: 'Rankings over the next five gameweeks, each with the best swap into your squad.',
      },
      {
        src: '/images/touchline/chip-builder.png',
        alt: 'The Wildcard squad builder showing the best 15 within budget and the changes from the current squad.',
        caption: 'The Wildcard / Free Hit builder: the best 15 within budget.',
      },
      {
        src: '/images/touchline/league.png',
        alt: 'The league view comparing captain options and differentials against overall ownership.',
        caption: 'Captaincy risk and differentials against every manager’s ownership.',
      },
    ],
    highlights: [
      'A transparent projection model, written from scratch: team strength from expected goals weighted toward recent form, start and minutes probabilities from match history, and per-90 rates pulled toward position averages so small samples don’t swing wildly.',
      'Every expected-points figure splits into components you can inspect.',
      'Decision tools on one engine: a transfer advisor comparing one- and two-move options against saving the transfer, a multi-week planner, a Wildcard/Free Hit squad builder, chip timing, and a league view of captaincy risk and differentials against overall ownership.',
      'Checks itself: it saves its suggestion before each deadline, then scores it against what was actually done and against real points to measure bias and calibration.',
      'News with sources: reads news feeds, FPL analysis sites, and each club’s official site (respecting robots.txt), sorts items into verified, credible, opinion, and community tiers, and tags European and cup games. Optional Claude summaries must cite the items they draw on.',
      'A Claude chat assistant with read-only tools over the projections and transfer evaluations; any change it suggests needs a tap to confirm.',
      'A sandboxed public demo: each visitor gets their own SQLite database with the shared data attached read-only, so nothing a visitor does can reach outside services or my data. The demo refreshes its own data each week.',
    ],
    links: [{ label: 'live demo', href: 'https://touchline.iversonlai.dev', primary: true }],
    note: 'A personal, non-commercial project, not affiliated with or endorsed by the Premier League or Fantasy Premier League.',
    sections: [
      {
        heading: 'one engine, every decision',
        code: `match history · xG · fixtures · news
      │
      ▼
projection model ─────── expected points, split into components
      │
      ├── transfer advisor   1–2 moves vs. saving the transfer
      ├── planner            multiple gameweeks ahead
      ├── squad builder      wildcard / free hit
      ├── chips · captaincy  timing, risk, differentials
      └── claude assistant   read-only tools, tap to confirm
      │
      ▼
pre-deadline snapshot ── scored against real points`,
      },
    ],
  },
  {
    slug: 'jumbo-file-system',
    name: 'Jumbo File System',
    file: 'file-system',
    tagline: 'A block-based file system in C on a simulated disk, with an interactive shell.',
    description:
      'A working file system built from scratch in C — directories, files, block allocation, and persistent storage — on top of a simulated block device. Everything down to the free-block bitmap is hand-implemented against raw 64-byte block reads and writes.',
    year: '2025',
    tags: ['systems'],
    stack: ['C11', 'Make', 'block storage', 'bitmap allocation'],
    featured: false,
    highlights: [
      'Simulated block device: a 32 KB file of 512 × 64-byte blocks; state survives across runs.',
      'Bitmap free-block allocator in block 0, with freed blocks correctly reused.',
      'Hierarchical directories (mkdir, cd, rmdir, ls) including refusal to remove non-empty directories.',
      'Block-chained files that grow across linked blocks and handle binary data.',
      'Manual byte-level serialization of directory entries and inodes — no structs written to disk.',
      'Distinct error codes for every failure mode, surfaced by the shell.',
    ],
    links: [{ label: 'source', href: 'https://github.com/anontriton/file-system', primary: true }],
    sections: [
      {
        heading: 'layers',
        code: `command_line.c        jfs$ shell
      │
jumbo_file_system.c   files and directories
      │
basic_file_system.c   bitmap block allocator
      │
raw_disk.c            64-byte block device`,
      },
    ],
  },
]

export type Job = {
  role: string
  org: string
  place: string
  dates: string
  current?: boolean
  // 'other' roles are listed in a collapsed "more experience" group
  kind: 'engineering' | 'research' | 'other'
  bullets: string[]
}

export const experience: Job[] = [
  {
    role: 'Freelance Software Engineer',
    org: 'Ming Long Insurance',
    place: 'Remote',
    dates: 'Sep 2024 – present',
    current: true,
    kind: 'engineering',
    bullets: [
      'Took over engineering for a Medicare insurance agency’s production software: an Angular / Node.js / MongoDB agent portal and public website on AWS behind nginx.',
      'Planned a phased modernization (Angular 14→22, Node 18→24, Express 4→5, Mongoose 6→9), sequencing releases around Medicare open enrollment to minimize production risk.',
      'Restored a frontend build broken for 2.5 years by mixed Angular versions, then cut known dependency vulnerabilities 28% without changing production JavaScript.',
    ],
  },
  {
    role: 'Clinical Development Intern',
    org: 'Truvian Sciences',
    place: 'San Diego, CA',
    dates: 'Jun 2024 – Sep 2024',
    kind: 'research',
    bullets: [
      'Aggregated and validated blood-test results from Truvian, Cobas, and Sysmex analyzers, investigating anomalous measurements before downstream analysis.',
      'Ran daily QC and calibration across 5+ prototype devices, comparing results against industry-standard clinical analyzers.',
      'Worked within a multidisciplinary team on experimental studies and validation workflows.',
    ],
  },
  {
    role: 'Research Intern',
    org: 'Scripps Institution of Oceanography, UC San Diego',
    place: 'La Jolla, CA',
    dates: 'Aug 2021 – Jun 2022',
    kind: 'research',
    bullets: [
      'Supported research using underwater acoustic vector sensors to track humpback whale movement.',
      'Aggregated and visualized acoustic vector sensor data in MATLAB: azimuthal tracks, line histograms, and score matrices.',
      'Helped maintain sensor and hydrophone equipment: soldering, battery voltage testing, and inventory.',
    ],
  },
  {
    role: 'Field Sales',
    org: 'Rivian',
    place: 'San Diego, CA',
    dates: '2024 – 2025',
    kind: 'other',
    bullets: [
      'Collaborated on 15+ outreach events with local businesses, generating 65+ qualified leads in 2024.',
      'Supported vehicle deals totaling over $1.8M across the team in the first two months after the store opened.',
      'Left to focus full-time on my master’s capstone.',
    ],
  },
  {
    role: 'General Manager',
    org: 'Xin Chao Eatery',
    place: 'San Diego, CA',
    dates: '2023 – 2024',
    kind: 'other',
    bullets: [
      'Managed 30+ front-of-house staff: staffing, payroll, tips, training, conflict resolution, inventory, and maintenance.',
      'Overhauled 15+ beverage menu items to improve consistency, workflow, and guest experience.',
    ],
  },
  {
    role: 'Owner & Photographer',
    org: 'ivermino Photography Studio',
    place: 'Self-employed',
    dates: '2021 – present',
    current: true,
    kind: 'other',
    bullets: [
      '100+ client engagements across weddings, couples, graduations, and events.',
      'Run the whole business myself: client conversations, planning, scheduling, shooting, editing, and delivery.',
    ],
  },
  {
    role: 'Server & Lead',
    org: 'Din Tai Fung',
    place: 'San Diego, CA',
    dates: '2020 – 2023',
    kind: 'other',
    bullets: [
      'Worked in a high-volume restaurant doing over $100k in daily food sales.',
      'Trained 10+ new hires and helped manage complex guest and reservation flow.',
    ],
  },
  {
    role: 'Project Coordinator',
    org: 'UCSD HDH Wellness and Engagement',
    place: 'La Jolla, CA',
    dates: '2018 – 2020',
    kind: 'other',
    bullets: [
      'Coordinated 10+ zero-waste events serving 2,000+ students with over 99% landfill diversion.',
      'Developed sustainability approaches adopted by 8+ additional campus events.',
    ],
  },
]

export const education = [
  {
    school: 'Tufts University',
    degree: 'M.S. Computer Science',
    dates: 'May 2026',
    note: 'Systems programming, machine learning, software engineering. Capstone: Re: Genesis.',
  },
  {
    school: 'University of California, San Diego',
    degree: 'B.S. Environmental Science',
    dates: 'Jun 2022',
    note: 'Scientific research, quantitative analysis, computational approaches to real-world problems.',
  },
]

export type Contribution = { repo: string; title: string; href: string; status: 'merged' | 'open' }

// Rendered on the homepage only once this has entries.
export const contributions: Contribution[] = []
