// All site content lives here. Add a project, job, or article by adding an
// entry to the matching array; pages render from this file.

export const profile = {
  name: 'Iverson Lai',
  handle: 'iverson',
  title: 'Software Engineer',
  focus: 'C/C++ · Systems · Machine Learning',
  pitch:
    'I build software to understand how it works — from high-performance machine learning inference engines and low-level systems to game AI and full-stack applications.',
  location: 'San Diego, CA',
  timezone: 'America/Los_Angeles',
  degree: 'M.S. Computer Science, Tufts University (2026)',
  status: 'open to entry-level SWE roles',
  email: 'iversonlai@icloud.com',
  github: 'https://github.com/anontriton',
  linkedin: 'https://www.linkedin.com/in/iversonlai',
  resume: '/resume.pdf',
  // Photo for the ASCII portrait in the hero. Drop it in public/images/ and
  // set the path; a cut-out PNG (transparent background) reads best.
  // null shows the IL logo instead.
  portrait: null as null | string,
  // Shown under "building" in the hero and tl;dr. Set to null to hide.
  current: null as null | { name: string; note: string; href?: string },
  learning: 'contributing to large open-source C++ codebases',
  sourceRepo: 'https://github.com/anontriton/portfolio',
}

export const about = [
  "I'm a software engineer with a master's in Computer Science from Tufts and a background in environmental science and scientific research.",
  "My interests are systems programming, performance engineering, machine learning infrastructure, and game development. I like understanding what's happening beneath high-level abstractions — implementing neural networks from scratch, optimizing matrix multiplication in C++, or designing how a game character decides what to do next.",
  'I learn best by building things. My favorite projects recreate complex systems from first principles, then push on their design, performance, and correctness.',
  'Before software, I studied environmental science at UC San Diego and worked on research involving underwater acoustic sensors and biomedical testing. That shaped my interest in software for meaningful scientific and technical problems, particularly in biotechnology and healthcare.',
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
  // image; the image doubles as its poster.
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
      'A grid-based, turn-based tactics game in the tradition of Fire Emblem and Final Fantasy Tactics, and my master’s capstone at Tufts. The build is a vertical slice: one complete chapter running the full game loop, on systems designed to carry a longer campaign.',
    year: '2025',
    tags: ['games'],
    stack: ['Godot 4.4', 'GDScript', 'JSON', 'state machines', 'pathfinding', 'utility AI'],
    featured: true,
    image: {
      src: '/images/regenesis-battle.png',
      alt: 'A battle in Re: Genesis — a selected unit shows blue movement tiles and red attack-range tiles.',
      caption: 'Selecting a unit shows its whole reach: blue for movement, red for every tile it could strike after moving.',
    },
    highlights: [
      'Utility-based enemy AI that ranks move, attack, heal, and buff actions by damage potential, target health, aggression, positional safety, and ally proximity — with fallbacks when the preferred action fails.',
      'Terrain-weighted grid search with movement-cost relaxation, obstacles, and faction-aware occupancy, combined with weapon ranges into tactical overlays.',
      'Combat with movement, attacks, counterattacks, damage calculation, and status effects.',
      'Campaign and battle state machines coordinated with an async UI queue that sequences dialogue, camera, and notifications while blocking input.',
      'Data-driven content in JSON; a complete playable chapter with dialogue, progression, and scripted events.',
      'Distributed builds for Windows and macOS.',
    ],
    links: [
      { label: 'download build', href: 'https://github.com/anontriton/regenesis-builds/releases', primary: true },
      { label: 'builds repo', href: 'https://github.com/anontriton/regenesis-builds' },
    ],
    note: 'Source is private — happy to walk through the code in an interview.',
    sections: [
      {
        heading: 'enemy turn',
        code: `for each enemy unit:
  candidates = reachable_tiles(unit)        # terrain-weighted search
  for tile in candidates:
    for action in [attack, heal, buff, wait]:
      score = w_dmg    * damage_potential
            + w_kill   * (1 - target_hp_ratio)
            + w_aggr   * aggression
            + w_safety * positional_safety(tile)
            + w_ally   * ally_proximity(tile)
  execute(best) or fall back to next-best`,
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
  kind: 'engineering' | 'research'
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
      'Annotated and visualized acoustic tracking data in MATLAB using cross-correlation matrices and trajectory plots.',
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

export type Article = {
  title: string
  date: string // YYYY-MM-DD
  summary: string
  href: string
  tags: string[]
  readTime?: string
}

// Only published articles. Planned: SIMD GEMM optimization, autodiff in C,
// utility AI in Godot, first open-source C++ contribution.
export const writing: Article[] = [
  {
    title: 'Showing Its Work: A GPT-2 Engine Proven Correct at Every Step',
    date: '2026-09-01',
    summary:
      'Building GPT-2 three times — PyTorch, C++, WebAssembly — and how each version was proven to compute the same thing as the one before it.',
    href: 'https://github.com/anontriton/llm-ref-eng/blob/main/docs/writeup.md',
    tags: ['c++', 'ml', 'validation'],
  },
]

export type Contribution = { repo: string; title: string; href: string; status: 'merged' | 'open' }

// Rendered on the homepage only once this has entries.
export const contributions: Contribution[] = []
