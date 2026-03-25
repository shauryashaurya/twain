import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

// -- KEYBOARD LAYOUTS --
const LAYOUTS = {
  qwerty: {
    name: "QWERTY",
    rows: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
      ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
    ],
    fingerMap: {
      "`": "L4", "1": "L4", "2": "L3", "3": "L2", "4": "L1", "5": "L1", "6": "R1", "7": "R1", "8": "R2", "9": "R3", "0": "R4", "-": "R4", "=": "R4",
      q: "L4", w: "L3", e: "L2", r: "L1", t: "L1", y: "R1", u: "R1", i: "R2", o: "R3", p: "R4", "[": "R4", "]": "R4", "\\": "R4",
      a: "L4", s: "L3", d: "L2", f: "L1", g: "L1", h: "R1", j: "R1", k: "R2", l: "R3", ";": "R4", "'": "R4",
      z: "L4", x: "L3", c: "L2", v: "L1", b: "L1", n: "R1", m: "R1", ",": "R2", ".": "R3", "/": "R4", " ": "T0"
    }
  },
  dvorak: {
    name: "Dvorak",
    rows: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]"],
      ["'", ",", ".", "p", "y", "f", "g", "c", "r", "l", "/", "=", "\\"],
      ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s", "-"],
      [";", "q", "j", "k", "x", "b", "m", "w", "v", "z"]
    ],
    fingerMap: {
      "`": "L4", "1": "L4", "2": "L3", "3": "L2", "4": "L1", "5": "L1", "6": "R1", "7": "R1", "8": "R2", "9": "R3", "0": "R4", "[": "R4", "]": "R4",
      "'": "L4", ",": "L3", ".": "L2", p: "L1", y: "L1", f: "R1", g: "R1", c: "R2", r: "R3", l: "R4", "/": "R4", "=": "R4", "\\": "R4",
      a: "L4", o: "L3", e: "L2", u: "L1", i: "L1", d: "R1", h: "R1", t: "R2", n: "R3", s: "R4", "-": "R4",
      ";": "L4", q: "L3", j: "L2", k: "L1", x: "L1", b: "R1", m: "R1", w: "R2", v: "R3", z: "R4", " ": "T0"
    }
  },
  colemak: {
    name: "Colemak",
    rows: [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["q", "w", "f", "p", "g", "j", "l", "u", "y", ";", "[", "]", "\\"],
      ["a", "r", "s", "t", "d", "h", "n", "e", "i", "o", "'"],
      ["z", "x", "c", "v", "b", "k", "m", ",", ".", "/"]
    ],
    fingerMap: {
      "`": "L4", "1": "L4", "2": "L3", "3": "L2", "4": "L1", "5": "L1", "6": "R1", "7": "R1", "8": "R2", "9": "R3", "0": "R4", "-": "R4", "=": "R4",
      q: "L4", w: "L3", f: "L2", p: "L1", g: "L1", j: "R1", l: "R1", u: "R2", y: "R3", ";": "R4", "[": "R4", "]": "R4", "\\": "R4",
      a: "L4", r: "L3", s: "L2", t: "L1", d: "L1", h: "R1", n: "R1", e: "R2", i: "R3", o: "R4", "'": "R4",
      z: "L4", x: "L3", c: "L2", v: "L1", b: "L1", k: "R1", m: "R1", ",": "R2", ".": "R3", "/": "R4", " ": "T0"
    }
  }
};

// -- WORD LISTS --
const WORD_LISTS = {
  "English (UK)": "the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us great between need large under never should very through world still must before found here thing many right being another much three number water question always each national important different something thought possible together children without development government community problem system programme company information technology experience change performance understanding significant environment management production research education international following particular everything available political economic application organisation responsibility traditional breakfast strength beautiful practice structure establish challenge knowledge previous character situation demonstrate recognise themselves behaviour colour favour labour neighbour honour endeavour analyse catalogue centre fibre litre metre theatre defence licence offence pretence advise organise specialise realise emphasise apologise characterise summarise criticise advertise compromise exercise surprise otherwise enterprise promise purpose course source force service office notice evidence silence distance importance difference conference reference influence presence independence audience consequence intelligence science patience existence instance assistance appearance insurance resistance assurance circumstance maintenance accordance significance surveillance grievance tolerance substance endurance ignorance compliance acceptance admittance abundance reluctance attendance resemblance interference perseverance acquaintance inheritance temperance furtherance utterance disturbance forbearance remembrance observance continuance".split(" "),
  "French": "le la de un une et est il elle que ne pas en au du des les dans pour qui ce sur se son tout avec mais comme aussi que leur bien lui sans fait plus deux peut meme alors nous rien encore tous quand pendant dire cela moins depuis avec savoir venir homme monde temps vie main jour femme pays bon grand petit nouveau faire aller voir vouloir donner prendre trouver parler entre premier chose fois dernier long peu jeune beau vieux haut noir blanc gros fort droit ancien seul propre ici rien toujours tant assez chaque jamais vers point loin dessus vraiment tard trop ensemble penser comprendre devenir croire mettre sentir ouvrir montrer garder tomber revenir entendre passer partir suivre tenir porter rester perdre lever finir poser servir paraitre sembler commencer jouer sortir vivre ecrire entrer lire manger dormir courir mourir".split(" "),
  "German": "der die das und in den von zu ist nicht ein mit auf sich des dem er es an werden aus einer hat auch als dass wie noch oder sein sind war bei nach schon nur so einem seine haben machen sehr dann wo aber diesem denn ganz diese wenn durch weil mehr immer wurde zwei bis gerade gegen einmal lassen alle etwas wissen wenig finden gut gross neu hier alt lang kurz schnell viel kommen gehen stehen bleiben leben sehen denken halten nehmen bringen sprechen lesen schreiben kennen sagen wollen brauchen arbeiten heissen spielen fahren laufen liegen schlafen tragen fallen wachsen ziehen reisen lernen kaufen suchen zeigen hoeren essen trinken beginnen verstehen helfen bekommen".split(" "),
  "Spanish": "de la que el en y a los del se las por un una con no es al lo como mas pero sus le ya sobre este si muy ser todo entre cuando hay fue tan poco esta nada sus tiempo antes fue hombre mejor dia dos nuestro bien ella ahi eso ese algo primera vez decir pues estar muy gran parte mismo hacer poder tener dar solo haber otro deber creer hablar llevar dejar seguir encontrar llamar venir pensar salir volver tomar conocer vivir sentir parecer contar querer pasar deber saber poner decir donde casa vida mundo trabajo agua lado noche pueblo punto cierto pais gobierno mujer pueblo fin caso palabra forma problema gente lugar persona mano cosa padre madre hijo ojo cabeza mano cuerpo hombre tierra ciudad calle puerta camino".split(" "),
  "Portuguese": "de a o que e do da em um para com nao uma os no se na por mais as dos como mas ao ele das tem seu sua ou quando muito nos ja eu tambem so pelo pela ate isso ela entre depois sem mesmo aos seus quem nas meu esse eles voce essa num nem suas minha ter sido tinha eram muito depois anos governo dia tempo alguns vez conta pode parte sobre ser fazer grande ainda casa mundo homem estado forma novo fim grupo pais caso coisa cada cidade porque ano pessoa trabalho vezes problema durante sempre dizer dar bem mesmo outro aqui onde ficar ir vir querer poder dever saber ver deixar parecer passar chegar levar seguir encontrar falar pensar olhar perguntar".split(" ")
};

// -- SPECIAL CHAR EXERCISES --
const SPECIAL_CHAR_SETS = [
  'price: $49.99 (save 20%) -- limited offer!',
  'email: user@domain.com; cc: admin@host.org',
  'path: /home/user/.config/app.json',
  'array[0] = {key: "value", count: 42};',
  'if (x > 0 && y < 10 || z == 5) { run(); }',
  '2 + 2 = 4; 10 - 3 = 7; 6 * 8 = 48; 100 / 4 = 25',
  '"Hello," she said. "How are you?"',
  'list: [a, b, c]; set: {x, y, z}; map: {k: v}',
  'cmd: ls -la | grep "*.txt" > output.log 2>&1',
  'fn = (a, b) => a + b; // arrow function',
  'SELECT * FROM users WHERE age >= 18 AND status != "banned";',
  'margin: 0 auto; padding: 8px 16px; border: 1px solid #ccc;',
  'https://example.com/api/v2/users?page=1&limit=50',
  '<div class="wrapper" id="main" data-type="primary">',
  'result = (a ** 2) + (b ** 2) - (2 * a * b)',
  "dict = {'name': 'test', 'values': [1, 2, 3]}",
  'chmod 755 script.sh && ./script.sh --verbose',
  'export PATH="$HOME/bin:$PATH"; echo $?',
  'tar -xzf archive.tar.gz -C /opt/app/',
  'git commit -m "fix: resolve #42 -- edge case"',
  'a ? b : c; x ?? y; obj?.prop?.sub',
  'type Fn = (x: number, y: number) => boolean;',
  'pipe: cat input.txt | sort | uniq -c | head -20',
  '@media (min-width: 768px) { .col { width: 50%; } }',
  'assert(result != null, "Expected non-null value");',
  'Math.floor(Math.random() * (max - min + 1)) + min',
  'switch (key) { case "a": break; default: return; }',
  'const re = /^[a-z0-9._%+-]+@[a-z]+\\.[a-z]{2,}$/;',
  'try { await fetch(url); } catch (e) { log(e); }',
  'for (let i = 0; i < arr.length; i++) { sum += arr[i]; }',
  'obj = { ...defaults, ...overrides, id: uuid() };'
];

// -- FALLBACK TEXTS --
const FALLBACK_TEXTS = {
  wikipedia: [
    "The history of computing is longer than the history of computing hardware and modern computing technology and includes the history of methods intended for pen and paper or for chalk and slate, with or without the aid of tables. The timeline of computing presents events in the history of computing organised by year and grouped into six topic areas.",
    "A neural network is a network or circuit of biological neurons, or in a modern sense, an artificial neural network composed of artificial neurons or nodes. Thus a neural network is either a biological neural network, made up of biological neurons, or an artificial neural network used for solving artificial intelligence problems.",
    "The ocean covers approximately seventy percent of the surface of the Earth. It is divided into several principal oceans and smaller seas. More than half of this area is over three thousand metres deep. Average oceanic salinity is around thirty five parts per thousand.",
    "An algorithm is a finite sequence of well-defined instructions, typically used to solve a class of specific problems or to perform a computation. Algorithms are used as specifications for performing calculations and data processing. More advanced algorithms can use conditionals to divert the code execution through various routes and deduce valid inferences.",
    "Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing and letter spacing, as well as adjusting the space between pairs of letters."
  ],
  code: {
    python: 'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\ndef merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result',
    javascript: 'function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}\n\nfunction deepClone(obj) {\n  if (obj === null || typeof obj !== "object") {\n    return obj;\n  }\n  const clone = Array.isArray(obj) ? [] : {};\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key]);\n    }\n  }\n  return clone;\n}\n\nfunction throttle(fn, limit) {\n  let inThrottle = false;\n  return function(...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => { inThrottle = false; }, limit);\n    }\n  };\n}',
    typescript: 'interface TreeNode<T> {\n  value: T;\n  left: TreeNode<T> | null;\n  right: TreeNode<T> | null;\n}\n\nfunction inorder<T>(node: TreeNode<T> | null): T[] {\n  if (!node) return [];\n  return [\n    ...inorder(node.left),\n    node.value,\n    ...inorder(node.right)\n  ];\n}\n\nfunction insert<T>(root: TreeNode<T> | null, val: T): TreeNode<T> {\n  if (!root) return { value: val, left: null, right: null };\n  if (val < root.value) root.left = insert(root.left, val);\n  else root.right = insert(root.right, val);\n  return root;\n}\n\nfunction height<T>(node: TreeNode<T> | null): number {\n  if (!node) return 0;\n  return 1 + Math.max(height(node.left), height(node.right));\n}',
    rust: 'fn fibonacci(n: u32) -> u64 {\n    if n <= 1 {\n        return n as u64;\n    }\n    let mut a: u64 = 0;\n    let mut b: u64 = 1;\n    for _ in 2..=n {\n        let temp = a + b;\n        a = b;\n        b = temp;\n    }\n    b\n}\n\nfn is_prime(n: u64) -> bool {\n    if n < 2 { return false; }\n    if n == 2 || n == 3 { return true; }\n    if n % 2 == 0 || n % 3 == 0 { return false; }\n    let mut i = 5;\n    while i * i <= n {\n        if n % i == 0 || n % (i + 2) == 0 { return false; }\n        i += 6;\n    }\n    true\n}\n\nfn gcd(a: u64, b: u64) -> u64 {\n    if b == 0 { a } else { gcd(b, a % b) }\n}',
    go: 'func mergeSort(arr []int) []int {\n\tif len(arr) <= 1 {\n\t\treturn arr\n\t}\n\tmid := len(arr) / 2\n\tleft := mergeSort(arr[:mid])\n\tright := mergeSort(arr[mid:])\n\treturn merge(left, right)\n}\n\nfunc merge(left, right []int) []int {\n\tresult := make([]int, 0, len(left)+len(right))\n\ti, j := 0, 0\n\tfor i < len(left) && j < len(right) {\n\t\tif left[i] <= right[j] {\n\t\t\tresult = append(result, left[i])\n\t\t\ti++\n\t\t} else {\n\t\t\tresult = append(result, right[j])\n\t\t\tj++\n\t\t}\n\t}\n\tresult = append(result, left[i:]...)\n\tresult = append(result, right[j:]...)\n\treturn result\n}\n\nfunc binarySearch(arr []int, target int) int {\n\tlo, hi := 0, len(arr)-1\n\tfor lo <= hi {\n\t\tmid := (lo + hi) / 2\n\t\tif arr[mid] == target {\n\t\t\treturn mid\n\t\t} else if arr[mid] < target {\n\t\t\tlo = mid + 1\n\t\t} else {\n\t\t\thi = mid - 1\n\t\t}\n\t}\n\treturn -1\n}'
  }
};

// -- TOOLTIP COMPONENT --
function Tip({ text }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ x: r.left, y: r.bottom + 4 });
    }
    setShow(true);
  };
  return (
    <>
      <span ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: "50%", fontSize: 9, fontWeight: 700,
          color: "#6e7681", border: "1px solid #30363d", cursor: "help",
          marginLeft: 4, verticalAlign: "middle", lineHeight: 1, flexShrink: 0
        }}>i</span>
      {show && (
        <div style={{
          position: "fixed", left: Math.min(pos.x, window.innerWidth - 260), top: pos.y,
          zIndex: 9999, background: "#1c2128", border: "1px solid #30363d", borderRadius: 4,
          padding: "6px 10px", fontSize: 11, color: "#c9d1d9", maxWidth: 250,
          lineHeight: 1.4, fontWeight: 400, fontFamily: "'JetBrains Mono', monospace",
          pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
        }}>{text}</div>
      )}
    </>
  );
}

// -- UTILITIES --
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ALPHA_RE = /^[a-z]+$/;

function updateNgramData(prev, text, pos, isError) {
  const updated = { ...prev };
  for (let n = 2; n <= 5; n++) {
    if (pos >= n - 1) {
      const ngram = text.substring(pos - n + 1, pos + 1).toLowerCase();
      if (ngram.includes("\n") || ngram.includes("\t")) continue;
      if (!updated[ngram]) updated[ngram] = { attempts: 0, errors: 0 };
      updated[ngram] = { attempts: updated[ngram].attempts + 1, errors: updated[ngram].errors + (isError ? 1 : 0) };
    }
  }
  return updated;
}

function updateAlphaSpeeds(prev, times) {
  if (times.length < 2) return prev;
  const updated = { ...prev };
  const idx = times.length - 1;
  for (let n = 2; n <= 4; n++) {
    if (idx < n - 1) continue;
    let gram = "";
    let valid = true;
    let totalDelta = 0;
    for (let k = idx - n + 1; k <= idx; k++) {
      const ch = times[k].char.toLowerCase();
      if (!ALPHA_RE.test(ch)) { valid = false; break; }
      gram += ch;
      if (k > idx - n + 1) {
        const d = times[k].time - times[k - 1].time;
        if (d > 2000 || d < 10) { valid = false; break; }
        totalDelta += d;
      }
    }
    if (!valid || gram.length !== n) continue;
    if (!updated[gram]) updated[gram] = { totalMs: 0, count: 0 };
    updated[gram] = { totalMs: updated[gram].totalMs + totalDelta, count: updated[gram].count + 1 };
  }
  return updated;
}

function getWeakNgrams(ngramData, minAttempts, limit) {
  return Object.entries(ngramData)
    .filter(([_, d]) => d.attempts >= (minAttempts || 3))
    .map(([ngram, d]) => ({ ngram, ...d, rate: d.errors / d.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit || 15);
}

function generateAdaptiveText(ngramData) {
  const weakNgrams = getWeakNgrams(ngramData, 3, 10);
  if (weakNgrams.length === 0) return "Keep practising to build your weakness profile. The system needs more typing data to generate targeted exercises for you. Try Wikipedia or Common Words mode first.";
  const allWords = WORD_LISTS["English (UK)"];
  const practiceWords = [];
  for (const { ngram } of weakNgrams) {
    const matching = allWords.filter(w => w.includes(ngram));
    practiceWords.push(...matching.slice(0, 4));
  }
  if (practiceWords.length === 0) return shuffle(weakNgrams.map(w => w.ngram)).join(" ").repeat(5).trim();
  const unique = [...new Set(practiceWords)];
  shuffle(unique);
  let text = "";
  let i = 0;
  while (text.length < 600) { text += unique[i % unique.length] + " "; i++; if (i > 400) break; }
  return text.trim();
}

function wrapToLines(text, charsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    if (current.length > 0 && current.length + 1 + w.length > charsPerLine) {
      lines.push(current);
      current = w;
    } else {
      current = current.length > 0 ? current + " " + w : w;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function generateCommonWordsText(language, count, lineCount) {
  const words = WORD_LISTS[language] || WORD_LISTS["English (UK)"];
  const pool = words.slice(0, Math.min(count, words.length));
  const needed = lineCount * 12;
  const selected = [];
  for (let i = 0; i < needed; i++) selected.push(pool[Math.floor(Math.random() * pool.length)]);
  const lines = wrapToLines(selected.join(" "), 65);
  return lines.slice(0, lineCount).join("\n");
}

function generateSpecialCharText(lineCount) {
  const pool = [...SPECIAL_CHAR_SETS];
  const result = [];
  while (result.length < lineCount) {
    shuffle(pool);
    for (const s of pool) {
      result.push(s);
      if (result.length >= lineCount) break;
    }
  }
  return result.slice(0, lineCount).join("\n");
}

// fetch multiple wikipedia summaries until we have enough lines
async function fetchWikipediaLines(targetLines) {
  const collected = [];
  const maxFetches = Math.min(Math.ceil(targetLines / 3), 8);
  let fallbackIdx = 0;

  for (let attempt = 0; attempt < maxFetches; attempt++) {
    try {
      const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const extract = (data.extract || "").trim();
      if (extract.length >= 40) collected.push(extract);
    } catch {
      if (fallbackIdx < FALLBACK_TEXTS.wikipedia.length) {
        collected.push(FALLBACK_TEXTS.wikipedia[fallbackIdx]);
        fallbackIdx++;
      }
    }
    const currentLines = wrapToLines(collected.join(" "), 65);
    if (currentLines.length >= targetLines) break;
  }

  if (collected.length === 0) collected.push(FALLBACK_TEXTS.wikipedia[0]);
  const lines = wrapToLines(collected.join(" "), 65);
  return lines.slice(0, targetLines).join("\n");
}

// fetch github code, aiming for at least targetLines
async function fetchGithubCodeLines(language, targetLines) {
  const ext = { python: "py", javascript: "js", typescript: "ts", rust: "rs", go: "go" };
  const fileExt = ext[language] || "py";

  try {
    const r1 = await fetch(`https://api.github.com/search/repositories?q=language:${language}+stars:>500&sort=stars&per_page=10`);
    if (!r1.ok) throw new Error("search");
    const d1 = await r1.json();
    if (!d1.items || d1.items.length === 0) throw new Error("empty");

    const collectedLines = [];
    const triedRepos = new Set();

    for (let attempt = 0; attempt < 4 && collectedLines.length < targetLines; attempt++) {
      const repo = d1.items[Math.floor(Math.random() * d1.items.length)];
      if (triedRepos.has(repo.full_name)) continue;
      triedRepos.add(repo.full_name);

      try {
        const r2 = await fetch(`https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`);
        if (!r2.ok) continue;
        const d2 = await r2.json();
        const files = (d2.tree || []).filter(f => f.type === "blob" && f.path.endsWith("." + fileExt) && f.size > 200 && f.size < 15000);
        if (files.length === 0) continue;

        shuffle(files);
        for (const file of files.slice(0, 3)) {
          if (collectedLines.length >= targetLines) break;
          try {
            const r3 = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`);
            if (!r3.ok) continue;
            const d3 = await r3.json();
            const decoded = atob(d3.content.replace(/\n/g, ""));
            const fileLines = decoded.split("\n");
            if (collectedLines.length > 0) collectedLines.push("");
            collectedLines.push("// " + file.path);
            collectedLines.push(...fileLines);
          } catch { continue; }
        }
      } catch { continue; }
    }

    if (collectedLines.length === 0) throw new Error("nodata");
    const source = triedRepos.size > 0 ? [...triedRepos][0] : "github";
    return { text: collectedLines.slice(0, targetLines).join("\n"), source };
  } catch {
    const code = FALLBACK_TEXTS.code[language] || FALLBACK_TEXTS.code.python;
    const lines = code.split("\n");
    while (lines.length < targetLines) {
      lines.push("");
      const extra = (FALLBACK_TEXTS.code[language] || FALLBACK_TEXTS.code.python).split("\n");
      lines.push(...extra);
    }
    return { text: lines.slice(0, targetLines).join("\n"), source: "fallback" };
  }
}

// -- ANALYTICS --
const FINGER_LABELS = { L4: "L Pinky", L3: "L Ring", L2: "L Middle", L1: "L Index", R1: "R Index", R2: "R Middle", R3: "R Ring", R4: "R Pinky", T0: "Thumb" };

function computeFingerStats(ca, layout) {
  const fm = LAYOUTS[layout].fingerMap;
  const s = {};
  for (const [ch, d] of Object.entries(ca)) {
    const f = fm[ch.toLowerCase()] || fm[ch];
    if (!f) continue;
    if (!s[f]) s[f] = { correct: 0, total: 0 };
    s[f].correct += d.correct;
    s[f].total += d.total;
  }
  return s;
}

function computeHandStats(fs) {
  const h = { Left: { correct: 0, total: 0 }, Right: { correct: 0, total: 0 } };
  for (const [f, d] of Object.entries(fs)) {
    if (f === "T0") continue;
    const side = f.startsWith("L") ? "Left" : "Right";
    h[side].correct += d.correct;
    h[side].total += d.total;
  }
  return h;
}

function computeRowStats(ca, layout) {
  const rows = LAYOUTS[layout].rows;
  const labels = ["Number", "Top", "Home", "Bottom"];
  const s = {};
  for (const l of labels) s[l] = { correct: 0, total: 0 };
  for (const [ch, data] of Object.entries(ca)) {
    const lower = ch.toLowerCase();
    let ri = -1;
    for (let i = 0; i < rows.length; i++) { if (rows[i].includes(lower)) { ri = i; break; } }
    if (ri >= 0 && ri < labels.length) { s[labels[ri]].correct += data.correct; s[labels[ri]].total += data.total; }
  }
  return s;
}

function getKeyErrorRates(ngramData) {
  const kd = {};
  for (const [ngram, d] of Object.entries(ngramData)) {
    if (ngram.length !== 2) continue;
    const ch = ngram[1];
    if (!kd[ch]) kd[ch] = { attempts: 0, errors: 0 };
    kd[ch].attempts += d.attempts;
    kd[ch].errors += d.errors;
  }
  return kd;
}

function getSlowestAlphaNgrams(alphaSpeeds, n, limit) {
  return Object.entries(alphaSpeeds)
    .filter(([g, d]) => g.length === n && d.count >= 3)
    .map(([g, d]) => ({ gram: g, avg: Math.round(d.totalMs / d.count), count: d.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit || 8);
}

// -- SUB-COMPONENTS --
function KeyboardHeatmap({ layout, ngramData }) {
  const ld = LAYOUTS[layout];
  const ke = getKeyErrorRates(ngramData);
  const kc = (key) => {
    const d = ke[key];
    if (!d || d.attempts < 2) return "rgba(255,255,255,0.06)";
    const r = d.errors / d.attempts;
    if (r > 0.4) return "rgba(248,81,73,0.6)";
    if (r > 0.2) return "rgba(248,81,73,0.35)";
    if (r > 0.1) return "rgba(210,153,34,0.35)";
    return "rgba(63,185,80,0.25)";
  };
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, color: "#8b949e", marginBottom: 5, letterSpacing: "0.06em", display: "flex", alignItems: "center" }}>
        KEY ACCURACY ({ld.name})<Tip text="Heatmap of per-key error rates based on 2-gram data. Green = above 90% accuracy. Yellow = 80-90%. Red = below 80%. Grey = insufficient data (fewer than 2 attempts)." />
      </div>
      {ld.rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 2, marginBottom: 2, paddingLeft: ri * 8 }}>
          {row.map((k) => (
            <div key={k} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: "#c9d1d9", background: kc(k), border: "1px solid rgba(255,255,255,0.06)" }}>{k}</div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 5, fontSize: 9, color: "#6e7681" }}>
        <span><span style={{ display: "inline-block", width: 7, height: 7, background: "rgba(63,185,80,0.25)", borderRadius: 1, marginRight: 2, verticalAlign: "middle" }} />good</span>
        <span><span style={{ display: "inline-block", width: 7, height: 7, background: "rgba(210,153,34,0.35)", borderRadius: 1, marginRight: 2, verticalAlign: "middle" }} />weak</span>
        <span><span style={{ display: "inline-block", width: 7, height: 7, background: "rgba(248,81,73,0.5)", borderRadius: 1, marginRight: 2, verticalAlign: "middle" }} />poor</span>
      </div>
    </div>
  );
}

function LivePanel({ keystrokes, errors, startTime, cursorPos, text, currentStreak, bestStreak, wpmHistory, sessionHistory }) {
  const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsed > 0 ? Math.round((cursorPos / 5) / elapsed) : 0;
  const rawWpm = elapsed > 0 ? Math.round((keystrokes / 5) / elapsed) : 0;
  const accuracy = keystrokes > 0 ? ((keystrokes - errors) / keystrokes * 100).toFixed(1) : "100.0";
  const progress = text.length > 0 ? (cursorPos / text.length * 100).toFixed(0) : 0;
  const L = { fontSize: 10, color: "#8b949e", letterSpacing: "0.05em", display: "flex", alignItems: "center" };
  const V = { fontSize: 22, fontWeight: 700, color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 };
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={L}>WPM<Tip text="Words per minute. Calculated as (characters typed / 5) / minutes elapsed. Only counts characters at or before the cursor position, so backspaced characters reduce this." /></div>
        <div style={V}>{wpm}</div>
        <div style={{ fontSize: 10, color: "#6e7681" }}>raw: {rawWpm}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={L}>ACCURACY<Tip text="Percentage of keystrokes that matched the target character. Formula: (total keystrokes - errors) / total keystrokes. Backspace does not count as a keystroke." /></div>
        <div style={{ ...V, color: parseFloat(accuracy) > 95 ? "#3fb950" : parseFloat(accuracy) > 85 ? "#d29922" : "#f85149" }}>{accuracy}%</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={L}>ERRORS<Tip text="Total number of keystrokes where the typed character did not match the expected character." /></div>
        <div style={{ ...V, fontSize: 16 }}>{errors}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={L}>STREAK<Tip text="Current consecutive correct keystrokes. Resets to zero on any error. Best streak is the longest run across the current page session." /></div>
        <div style={{ ...V, fontSize: 16 }}>{currentStreak}</div>
        <div style={{ fontSize: 10, color: "#6e7681" }}>best: {bestStreak}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={L}>PROGRESS<Tip text="How far through the current text. Characters typed / total characters." /></div>
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 4 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#58a6ff", borderRadius: 2, transition: "width 0.15s" }} />
        </div>
        <div style={{ fontSize: 10, color: "#6e7681" }}>{cursorPos}/{text.length}</div>
      </div>
      {wpmHistory.length > 3 && (
        <div style={{ marginTop: 6 }}>
          <div style={L}>WPM TREND<Tip text="WPM sampled every 2 seconds during the current text." /></div>
          <div style={{ height: 42, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wpmHistory}><YAxis hide domain={["dataMin - 5", "dataMax + 5"]} /><Line type="monotone" dataKey="wpm" stroke="#58a6ff" strokeWidth={1.5} dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {sessionHistory.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ ...L, marginBottom: 4 }}>SESSION LOG<Tip text="History of completed texts in this page session. Persists across auto-loads. Can be saved to JSON and reloaded later." /></div>
          {sessionHistory.slice(-6).reverse().map((s, i) => (
            <div key={i} style={{ fontSize: 10, color: "#6e7681", marginBottom: 2 }}>{s.time} / {s.mode} / {s.wpm}wpm / {s.accuracy}% / {s.chars}ch</div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeakPanel({ ngramData, wordErrors }) {
  const wn = getWeakNgrams(ngramData, 3, 10);
  const ww = Object.entries(wordErrors).filter(([_, d]) => d.attempts >= 2).map(([w, d]) => ({ w, ...d, rate: d.errors / d.attempts })).sort((a, b) => b.rate - a.rate).slice(0, 8);
  if (wn.length === 0 && ww.length === 0) return <div style={{ fontSize: 11, color: "#6e7681" }}>Weakness data appears as you type. Persists across texts.</div>;
  const HL = { fontSize: 10, color: "#8b949e", marginBottom: 4, letterSpacing: "0.05em", display: "flex", alignItems: "center" };
  return (
    <div>
      {wn.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={HL}>WEAK SEQUENCES<Tip text="N-grams (2-5 characters) with the highest error rates. Minimum 3 attempts to appear. Underscore represents space. This data persists across texts and can be used by Adaptive Practice mode." /></div>
          {wn.map(({ ngram, rate, attempts, errors }) => (
            <div key={ngram} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 11 }}>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)", padding: "0 4px", borderRadius: 2, color: "#e6edf3", fontSize: 11 }}>{ngram.replace(/ /g, "_")}</code>
              <span style={{ color: rate > 0.3 ? "#f85149" : "#d29922", fontSize: 10 }}>{(rate * 100).toFixed(0)}% ({errors}/{attempts})</span>
            </div>
          ))}
        </div>
      )}
      {ww.length > 0 && (
        <div>
          <div style={HL}>WEAK WORDS<Tip text="Words where at least one character was mistyped. Sorted by error rate. Minimum 2 attempts to appear." /></div>
          {ww.map(({ w, rate, attempts, errors }) => (
            <div key={w} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 11 }}>
              <span style={{ color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace" }}>{w}</span>
              <span style={{ color: rate > 0.3 ? "#f85149" : "#d29922", fontSize: 10 }}>{(rate * 100).toFixed(0)}% ({errors}/{attempts})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ charAccuracy, keystrokeTimes, wpmHistory, layout, alphaSpeeds }) {
  const fingerStats = computeFingerStats(charAccuracy, layout);
  const handStats = computeHandStats(fingerStats);
  const rowStats = computeRowStats(charAccuracy, layout);
  const worstChars = Object.entries(charAccuracy).filter(([_, d]) => d.total >= 3).map(([ch, d]) => ({ ch, rate: d.correct / d.total, total: d.total })).sort((a, b) => a.rate - b.rate).slice(0, 8);
  const slowAlpha2 = getSlowestAlphaNgrams(alphaSpeeds, 2, 8);
  const slowAlpha3 = getSlowestAlphaNgrams(alphaSpeeds, 3, 6);
  const slowAlpha4 = getSlowestAlphaNgrams(alphaSpeeds, 4, 5);

  const consistency = wpmHistory.length > 3 ? (() => {
    const v = wpmHistory.map(h => h.wpm);
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
    return { mean: m.toFixed(0), sd: sd.toFixed(1), cv: m > 0 ? (sd / m * 100).toFixed(0) : "0" };
  })() : null;

  const hasData = Object.keys(fingerStats).length > 0 || worstChars.length > 0 || slowAlpha2.length > 0;
  if (!hasData) return <div style={{ fontSize: 11, color: "#6e7681" }}>Detailed analytics appear after typing begins.</div>;

  const pct = (c, t) => t > 0 ? (c / t * 100).toFixed(1) + "%" : "n/a";
  const pc = (c, t) => { if (t === 0) return "#6e7681"; const r = c / t; return r > 0.95 ? "#3fb950" : r > 0.85 ? "#d29922" : "#f85149"; };
  const HL = { fontSize: 10, color: "#8b949e", marginBottom: 4, letterSpacing: "0.05em", display: "flex", alignItems: "center" };
  const SR = { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 };
  const SM = { marginBottom: 12 };
  const mc = (ms) => ms > 400 ? "#f85149" : ms > 250 ? "#d29922" : "#3fb950";
  const gc = { fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)", padding: "0 4px", borderRadius: 2, color: "#e6edf3" };

  return (
    <div>
      {Object.keys(handStats).length > 0 && (
        <div style={SM}><div style={HL}>PER HAND<Tip text="Accuracy broken down by left vs right hand, based on which finger is assigned to each key in the selected layout." /></div>
          {Object.entries(handStats).map(([h, d]) => (<div key={h} style={SR}><span style={{ color: "#c9d1d9" }}>{h}</span><span style={{ color: pc(d.correct, d.total) }}>{pct(d.correct, d.total)} ({d.total})</span></div>))}
        </div>
      )}
      {Object.keys(fingerStats).length > 0 && (
        <div style={SM}><div style={HL}>PER FINGER<Tip text="Accuracy per finger. L4 = left pinky, R1 = right index, etc. Based on the standard touch-typing finger assignments for the selected layout." /></div>
          {["L4", "L3", "L2", "L1", "R1", "R2", "R3", "R4"].map(f => { const d = fingerStats[f]; if (!d) return null; return <div key={f} style={SR}><span style={{ color: "#c9d1d9" }}>{FINGER_LABELS[f]}</span><span style={{ color: pc(d.correct, d.total) }}>{pct(d.correct, d.total)} ({d.total})</span></div>; })}
        </div>
      )}
      {Object.entries(rowStats).some(([_, d]) => d.total > 0) && (
        <div style={SM}><div style={HL}>PER ROW<Tip text="Accuracy per keyboard row. Number row is the top, then Top (QWERTY), Home (ASDF), Bottom (ZXCV)." /></div>
          {Object.entries(rowStats).filter(([_, d]) => d.total > 0).map(([r, d]) => (<div key={r} style={SR}><span style={{ color: "#c9d1d9" }}>{r}</span><span style={{ color: pc(d.correct, d.total) }}>{pct(d.correct, d.total)} ({d.total})</span></div>))}
        </div>
      )}
      {worstChars.length > 0 && (
        <div style={SM}><div style={HL}>WEAKEST CHARACTERS<Tip text="Individual characters with the lowest accuracy. Minimum 3 attempts to appear. Includes letters, numbers, and symbols." /></div>
          {worstChars.map(({ ch, rate, total }) => (<div key={ch} style={SR}><code style={gc}>{ch === " " ? "space" : ch}</code><span style={{ color: pc(rate, 1) }}>{(rate * 100).toFixed(0)}% ({total})</span></div>))}
        </div>
      )}
      {slowAlpha2.length > 0 && (
        <div style={SM}><div style={HL}>SLOWEST ALPHA 2-GRAMS<Tip text="Slowest letter-only bigrams by average inter-key time in milliseconds. Only a-z characters. Excludes numbers, symbols, space. Minimum 3 occurrences. This isolates pure typing fluency from symbol-reaching overhead." /></div>
          {slowAlpha2.map(({ gram, avg, count }) => (<div key={gram} style={SR}><code style={gc}>{gram}</code><span style={{ color: mc(avg) }}>{avg}ms <span style={{ color: "#6e7681" }}>({count})</span></span></div>))}
        </div>
      )}
      {slowAlpha3.length > 0 && (
        <div style={SM}><div style={HL}>SLOWEST ALPHA 3-GRAMS<Tip text="Slowest 3-letter sequences. Total time from first to last character. Only a-z. Helps identify awkward hand transitions and finger rolls." /></div>
          {slowAlpha3.map(({ gram, avg, count }) => (<div key={gram} style={SR}><code style={gc}>{gram}</code><span style={{ color: mc(avg) }}>{avg}ms <span style={{ color: "#6e7681" }}>({count})</span></span></div>))}
        </div>
      )}
      {slowAlpha4.length > 0 && (
        <div style={SM}><div style={HL}>SLOWEST ALPHA 4-GRAMS<Tip text="Slowest 4-letter sequences. Useful for spotting problematic word fragments and common suffixes (-tion, -ness, -ment) that slow you down." /></div>
          {slowAlpha4.map(({ gram, avg, count }) => (<div key={gram} style={SR}><code style={gc}>{gram}</code><span style={{ color: mc(avg) }}>{avg}ms <span style={{ color: "#6e7681" }}>({count})</span></span></div>))}
        </div>
      )}
      {consistency && (
        <div style={SM}><div style={HL}>CONSISTENCY<Tip text="Statistical consistency of your WPM over the current text. Lower CV (coefficient of variation) means more consistent speed. CV below 15% is very consistent." /></div>
          <div style={{ fontSize: 11, color: "#c9d1d9" }}>Mean: {consistency.mean} wpm</div>
          <div style={{ fontSize: 11, color: "#c9d1d9" }}>Std dev: {consistency.sd}</div>
          <div style={{ fontSize: 11, color: "#c9d1d9" }}>CV: {consistency.cv}%</div>
        </div>
      )}
    </div>
  );
}

// -- MAIN --
export default function MarkTwain() {
  const [mode, setMode] = useState("wikipedia");
  const [layout, setLayout] = useState("qwerty");
  const [codeLang, setCodeLang] = useState("python");
  const [wordsLang, setWordsLang] = useState("English (UK)");
  const [wordsCount, setWordsCount] = useState(100);
  const [lineCount, setLineCount] = useState(10);
  const [autoLoad, setAutoLoad] = useState(false);
  const [text, setText] = useState("");
  const [charStates, setCharStates] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [ngramData, setNgramData] = useState({});
  const [wordErrors, setWordErrors] = useState({});
  const [charAccuracy, setCharAccuracy] = useState({});
  const [alphaSpeeds, setAlphaSpeeds] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [codeSource, setCodeSource] = useState("");
  const [customText, setCustomText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [sideTab, setSideTab] = useState("live");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [lastRunStats, setLastRunStats] = useState(null);
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const wpmIntervalRef = useRef(null);
  const wordErrRef = useRef(false);
  const ksTimesRef = useRef([]);
  const cursorPosRef = useRef(0);
  const fileInputRef = useRef(null);
  const loadTextRef = useRef(null);
  const autoLoadTimerRef = useRef(null);

  useEffect(() => { cursorPosRef.current = cursorPos; }, [cursorPos]);

  const doLoadText = useCallback(async (forceMode, lc, ml, wl, wc, cl, ct, nd) => {
    const m = forceMode || ml;
    setLoading(true);
    setIsComplete(false);
    setCursorPos(0);
    setKeystrokes(0);
    setErrors(0);
    setCurrentStreak(0);
    setStartTime(null);
    setWpmHistory([]);
    setCodeSource("");
    ksTimesRef.current = [];
    wordErrRef.current = false;

    let newText = "";
    if (m === "wikipedia") {
      newText = await fetchWikipediaLines(lc);
    } else if (m === "github") {
      const r = await fetchGithubCodeLines(cl, lc);
      newText = r.text;
      setCodeSource(r.source);
    } else if (m === "adaptive") {
      const raw = generateAdaptiveText(nd);
      const lines = wrapToLines(raw, 65);
      newText = lines.slice(0, lc).join("\n");
    } else if (m === "custom") {
      const raw = ct || "Type your custom text here.";
      const lines = raw.split("\n");
      newText = lines.slice(0, lc).join("\n");
    } else if (m === "common-words") {
      newText = generateCommonWordsText(wl, wc, lc);
    } else if (m === "special-chars") {
      newText = generateSpecialCharText(lc);
    }

    newText = newText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (m !== "github") newText = newText.replace(/\t/g, "    ");
    setText(newText);
    setCharStates(new Array(newText.length).fill("untyped"));
    setLoading(false);
  }, []);

  // wrapper that captures current state for doLoadText
  const loadText = useCallback((forceMode) => {
    return doLoadText(forceMode, lineCount, mode, wordsLang, wordsCount, codeLang, customText, ngramData);
  }, [doLoadText, lineCount, mode, wordsLang, wordsCount, codeLang, customText, ngramData]);

  // keep a ref to loadText for auto-load timer
  useEffect(() => { loadTextRef.current = loadText; }, [loadText]);

  useEffect(() => { loadText(); }, []);
  useEffect(() => { if (cursorRef.current) cursorRef.current.scrollIntoView({ block: "center", behavior: "smooth" }); }, [cursorPos]);

  useEffect(() => {
    if (startTime && !isComplete) {
      wpmIntervalRef.current = setInterval(() => {
        const el = (Date.now() - startTime) / 60000;
        if (el > 0) setWpmHistory(prev => [...prev, { t: prev.length, wpm: Math.round((cursorPosRef.current / 5) / el) }]);
      }, 2000);
    }
    return () => clearInterval(wpmIntervalRef.current);
  }, [startTime, isComplete]);

  // auto-load: uses ref to avoid stale closure / effect cancellation
  useEffect(() => {
    if (isComplete && autoLoad) {
      autoLoadTimerRef.current = setTimeout(() => {
        if (loadTextRef.current) loadTextRef.current();
      }, 2200);
    }
    return () => { if (autoLoadTimerRef.current) clearTimeout(autoLoadTimerRef.current); };
  }, [isComplete, autoLoad]);

  const getCurrentWord = useCallback((pos) => {
    if (pos <= 0 || pos > text.length) return null;
    let start = pos - 1;
    while (start > 0 && /\S/.test(text[start - 1])) start--;
    return text.substring(start, pos).toLowerCase().replace(/[^a-z]/g, "");
  }, [text]);

  const handleSave = useCallback(() => {
    const data = {
      version: 2,
      savedAt: new DateTime().toISOString(),
      ngramData, wordErrors, charAccuracy, alphaSpeeds, sessionHistory, bestStreak, layout,
      settings: { mode, codeLang, wordsLang, wordsCount, lineCount, autoLoad }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // a.download = "shauryashaurya-twain-typing-session-" + new Date().toISOString().slice(0, 10) + ".json";
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
    a.download = "Shaurya_Mark_Twain_Typing_Run_" + date + "_" + time + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, [ngramData, wordErrors, charAccuracy, alphaSpeeds, sessionHistory, bestStreak, layout, mode, codeLang, wordsLang, wordsCount, lineCount, autoLoad]);

  const handleFileLoad = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.ngramData) setNgramData(d.ngramData);
        if (d.wordErrors) setWordErrors(d.wordErrors);
        if (d.charAccuracy) setCharAccuracy(d.charAccuracy);
        if (d.alphaSpeeds) setAlphaSpeeds(d.alphaSpeeds);
        if (d.sessionHistory) setSessionHistory(d.sessionHistory);
        if (d.bestStreak) setBestStreak(d.bestStreak);
        if (d.layout) setLayout(d.layout);
        if (d.settings) {
          if (d.settings.mode) setMode(d.settings.mode);
          if (d.settings.codeLang) setCodeLang(d.settings.codeLang);
          if (d.settings.wordsLang) setWordsLang(d.settings.wordsLang);
          if (d.settings.wordsCount) setWordsCount(d.settings.wordsCount);
          if (d.settings.lineCount) setLineCount(d.settings.lineCount);
          if (d.settings.autoLoad !== undefined) setAutoLoad(d.settings.autoLoad);
        }
      } catch { /* ignore bad files */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (isComplete || loading || text.length === 0) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (cursorPos > 0) { const np = cursorPos - 1; setCursorPos(np); setCharStates(prev => { const n = [...prev]; n[np] = "untyped"; return n; }); }
      return;
    }
    let inputChar = null;
    if (e.key === "Enter") { e.preventDefault(); inputChar = "\n"; }
    else if (e.key === "Tab") { e.preventDefault(); inputChar = (mode === "github" && cursorPos < text.length && text[cursorPos] === "\t") ? "\t" : " "; }
    else if (e.key.length === 1) { e.preventDefault(); inputChar = e.key; }
    if (inputChar === null) return;
    if (startTime === null) setStartTime(Date.now());

    const target = text[cursorPos];
    const ok = inputChar === target;
    ksTimesRef.current.push({ char: inputChar, time: Date.now() });
    setKeystrokes(prev => prev + 1);
    setCharAccuracy(prev => { const ex = prev[target] || { correct: 0, total: 0 }; return { ...prev, [target]: { correct: ex.correct + (ok ? 1 : 0), total: ex.total + 1 } }; });
    setAlphaSpeeds(prev => updateAlphaSpeeds(prev, ksTimesRef.current));

    if (!ok) { setErrors(prev => prev + 1); wordErrRef.current = true; setCurrentStreak(0); }
    else { setCurrentStreak(prev => { const n = prev + 1; setBestStreak(b => Math.max(b, n)); return n; }); }

    setCharStates(prev => { const n = [...prev]; n[cursorPos] = ok ? "correct" : "incorrect"; return n; });
    setNgramData(prev => updateNgramData(prev, text, cursorPos, !ok));

    const np = cursorPos + 1;
    if ((np >= text.length || /\s/.test(text[np])) && /\S/.test(target)) {
      const w = getCurrentWord(np);
      if (w && w.length >= 2) {
        setWordErrors(prev => { const ex = prev[w] || { attempts: 0, errors: 0 }; return { ...prev, [w]: { attempts: ex.attempts + 1, errors: ex.errors + (wordErrRef.current ? 1 : 0) } }; });
        wordErrRef.current = false;
      }
    }
    if (cursorPos > 0 && /\s/.test(text[cursorPos - 1]) && /\S/.test(target)) wordErrRef.current = false;

    setCursorPos(np);
    if (np >= text.length) {
      setIsComplete(true);
      const el = (Date.now() - (startTime || Date.now())) / 60000;
      const fwpm = el > 0 ? Math.round((text.length / 5) / el) : 0;
      const totalKs = keystrokes + 1;
      const totalErr = errors + (ok ? 0 : 1);
      const facc = totalKs > 0 ? ((totalKs - totalErr) / totalKs * 100).toFixed(1) : "100.0";
      const entry = { wpm: fwpm, accuracy: facc, mode, time: new Date().toLocaleTimeString(), chars: text.length, elapsed: el.toFixed(1), errors: totalErr };
      setLastRunStats(entry);
      setSessionHistory(prev => [...prev, entry]);
    }
  }, [cursorPos, text, isComplete, loading, startTime, mode, getCurrentWord, keystrokes, errors]);

  useEffect(() => { if (containerRef.current) containerRef.current.focus(); }, [text, loading]);

  const renderText = useMemo(() => {
    if (text.length === 0) return null;
    const lines = []; let cur = [];
    for (let i = 0; i < text.length; i++) { cur.push(i); if (text[i] === "\n") { lines.push([...cur]); cur = []; } }
    if (cur.length > 0) lines.push(cur);
    return lines.map((lc, li) => (
      <div key={li} style={{ minHeight: "1.6em" }}>
        {lc.map(i => {
          const ch = text[i]; const st = charStates[i] || "untyped"; const ic = i === cursorPos;
          let col = "#3d4450"; if (st === "correct") col = "#e6edf3"; if (st === "incorrect") col = "#f85149";
          const dc = ch === "\n" ? " " : ch === " " ? "\u00A0" : ch;
          return (<span key={i} ref={ic ? cursorRef : null} style={{ color: col, background: st === "incorrect" ? "rgba(248,81,73,0.15)" : "transparent", borderLeft: ic ? "2px solid #58a6ff" : "2px solid transparent", paddingLeft: 1, transition: "color 0.05s" }}>{dc}</span>);
        })}
      </div>
    ));
  }, [text, charStates, cursorPos]);

  const isCode = mode === "github" || mode === "special-chars";
  const tabSt = (a) => ({ padding: "4px 0", fontSize: 10, letterSpacing: "0.05em", cursor: "pointer", color: a ? "#58a6ff" : "#6e7681", background: "none", border: "none", borderBottom: a ? "1px solid #58a6ff" : "1px solid transparent", fontFamily: "inherit" });

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0d1117", color: "#c9d1d9", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        .ts{background:#161b22;color:#c9d1d9;border:1px solid #30363d;border-radius:3px;padding:3px 6px;font-size:11px;font-family:inherit;outline:none;cursor:pointer}
        .ts:focus{border-color:#58a6ff}
        .tb{background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:3px;padding:4px 10px;font-size:11px;font-family:inherit;cursor:pointer;transition:background 0.15s}
        .tb:hover{background:#30363d}
        .tp{background:#1f6feb;border-color:#1f6feb;color:#fff}
        .tp:hover{background:#388bfd}
        .tta{background:#0d1117;color:#c9d1d9;border:1px solid #30363d;border-radius:3px;padding:6px;font-size:12px;font-family:inherit;outline:none;resize:vertical;width:100%}
        .tta:focus{border-color:#58a6ff}
        .tsp{background:#161b22;color:#c9d1d9;border:1px solid #30363d;border-radius:3px;padding:3px 4px;font-size:11px;font-family:inherit;outline:none;width:48px;text-align:center}
        .tsp:focus{border-color:#58a6ff}
        *::-webkit-scrollbar{width:6px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
      `}</style>

      <input type="file" ref={fileInputRef} accept=".json" style={{ display: "none" }} onChange={handleFileLoad} />

      {/* row 1 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderBottom: "1px solid #161b22", flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginRight: 4 }}>MARK TWAIN</span>
        <Tip text="Typing practice tool. Pick a mode, set line count, and start typing. Text appears dim; correct keystrokes turn white, errors turn red. Backspace to correct. All analytics persist across texts in a session." />
        <select className="ts" value={mode} onChange={e => { setMode(e.target.value); if (e.target.value === "custom") setShowCustomInput(true); }}>
          <option value="wikipedia">Wikipedia</option>
          <option value="github">Code (GitHub)</option>
          <option value="common-words">Common Words</option>
          <option value="special-chars">Special Characters</option>
          <option value="adaptive">Adaptive Practice</option>
          <option value="custom">Custom Text</option>
        </select>
        <Tip text="Wikipedia: random article summaries (multiple fetched to fill lines). Code: files from popular GitHub repos. Common Words: frequent words in 5 languages. Special Characters: punctuation and symbol drills. Adaptive: words targeting your weakest n-grams. Custom: paste your own text." />
        {mode === "github" && (
          <select className="ts" value={codeLang} onChange={e => setCodeLang(e.target.value)}>
            <option value="python">Python</option><option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option><option value="rust">Rust</option><option value="go">Go</option>
          </select>
        )}
        {mode === "common-words" && (
          <>
            <select className="ts" value={wordsLang} onChange={e => setWordsLang(e.target.value)}>
              {Object.keys(WORD_LISTS).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className="ts" value={wordsCount} onChange={e => setWordsCount(Number(e.target.value))}>
              <option value={50}>Top 50</option><option value={100}>Top 100</option><option value={200}>Top 200</option><option value={500}>Top 500</option>
            </select>
          </>
        )}
        <select className="ts" value={layout} onChange={e => setLayout(e.target.value)}>
          <option value="qwerty">QWERTY</option><option value="dvorak">Dvorak</option><option value="colemak">Colemak</option>
        </select>
        <Tip text="Keyboard layout affects finger/hand/row analytics and the heatmap. Does not change what you type, only how stats are attributed." />
      </div>

      {/* row 2 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderBottom: "1px solid #21262d", flexShrink: 0, flexWrap: "wrap" }}>
        <label style={{ fontSize: 11, color: "#8b949e", display: "flex", alignItems: "center", gap: 4 }}>
          Lines: <input type="number" className="tsp" min={1} max={100} value={lineCount} onChange={e => { const v = parseInt(e.target.value, 10); if (v > 0 && v <= 100) setLineCount(v); }} />
        </label>
        <Tip text="Target number of lines to load. For Wikipedia, multiple summaries are fetched to reach this count. For GitHub, multiple files may be concatenated. Range: 1 to 100." />
        <label style={{ fontSize: 11, color: "#8b949e", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <input type="checkbox" checked={autoLoad} onChange={e => setAutoLoad(e.target.checked)} style={{ accentColor: "#58a6ff", width: 13, height: 13, cursor: "pointer" }} />
          Auto-load
        </label>
        <Tip text="When enabled, a new text loads automatically 2 seconds after you finish the current one. Stats for each completed text are logged to the session history. N-gram, word, and character data persists across auto-loads." />
        <div style={{ borderLeft: "1px solid #30363d", height: 16, margin: "0 2px" }} />
        <button className="tb tp" onClick={() => { setShowCustomInput(false); loadText(); }}>{loading ? "Loading..." : "New Text"}</button>
        {mode === "adaptive" && <button className="tb" onClick={() => loadText("adaptive")}>Refresh</button>}
        {mode === "custom" && <button className="tb" onClick={() => setShowCustomInput(!showCustomInput)}>{showCustomInput ? "Hide" : "Edit"}</button>}
        <div style={{ borderLeft: "1px solid #30363d", height: 16, margin: "0 2px" }} />
        <button className="tb" onClick={handleSave}>Save</button>
        <Tip text="Download all session data as a JSON file: n-gram stats, word errors, character accuracy, alpha speed data, session history, and current settings." />
        <button className="tb" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Load</button>
        <Tip text="Load a previously saved JSON session file. Restores all analytics and settings. Does not clear existing data, it overwrites with the file contents." />
      </div>

      {showCustomInput && mode === "custom" && (
        <div style={{ padding: "6px 12px", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
          <textarea className="tta" rows={3} value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Paste or type custom text..." />
          <div style={{ marginTop: 4 }}><button className="tb tp" onClick={() => { setShowCustomInput(false); loadText("custom"); }}>Start</button></div>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} style={{
          flex: 1, padding: "20px 28px", overflowY: "auto", outline: "none",
          fontSize: isCode ? 13 : 17, lineHeight: 1.7, cursor: "text",
          whiteSpace: isCode ? "pre" : "pre-wrap", wordBreak: isCode ? "normal" : "break-word", position: "relative"
        }}>
          {loading && <div style={{ color: "#6e7681", fontSize: 13 }}>Loading content...</div>}
          {!loading && text.length === 0 && <div style={{ color: "#6e7681", fontSize: 13 }}>Click "New Text" to begin.</div>}
          {!loading && text.length > 0 && !isComplete && renderText}
          {isComplete && lastRunStats && (
            <div style={{ maxWidth: 480 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e6edf3", marginBottom: 16 }}>
                {autoLoad ? "Run Complete" : "Session Complete"}
                {autoLoad && <span style={{ fontSize: 12, fontWeight: 400, color: "#6e7681", marginLeft: 12 }}>Next text in 2s...</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div><div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em" }}>FINAL WPM</div><div style={{ fontSize: 30, fontWeight: 700, color: "#58a6ff", fontFamily: "'JetBrains Mono', monospace" }}>{lastRunStats.wpm}</div></div>
                <div><div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em" }}>ACCURACY</div><div style={{ fontSize: 30, fontWeight: 700, color: parseFloat(lastRunStats.accuracy) > 95 ? "#3fb950" : "#d29922", fontFamily: "'JetBrains Mono', monospace" }}>{lastRunStats.accuracy}%</div></div>
                <div><div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em" }}>ERRORS</div><div style={{ fontSize: 20, fontWeight: 700, color: lastRunStats.errors > 0 ? "#f85149" : "#3fb950", fontFamily: "'JetBrains Mono', monospace" }}>{lastRunStats.errors}</div></div>
                <div><div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em" }}>TIME</div><div style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace" }}>{lastRunStats.elapsed}m</div></div>
              </div>
              {wpmHistory.length > 3 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em", marginBottom: 6 }}>WPM OVER SESSION</div>
                  <div style={{ height: 60 }}>
                    <ResponsiveContainer width="100%" height="100%"><LineChart data={wpmHistory}><YAxis hide domain={["dataMin - 5", "dataMax + 5"]} /><Line type="monotone" dataKey="wpm" stroke="#58a6ff" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                  </div>
                </div>
              )}
              {sessionHistory.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "0.05em", marginBottom: 6 }}>RECENT RUNS</div>
                  {sessionHistory.slice(-6).reverse().map((s, i) => (
                    <div key={i} style={{ fontSize: 10, color: i === 0 ? "#e6edf3" : "#6e7681", marginBottom: 2, fontWeight: i === 0 ? 500 : 400 }}>{s.time} / {s.mode} / {s.wpm}wpm / {s.accuracy}% / {s.chars}ch / {s.elapsed}m</div>
                  ))}
                </div>
              )}
              {!autoLoad && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="tb tp" onClick={() => loadText()}>New Text</button>
                  <button className="tb" onClick={() => loadText("adaptive")}>Practice Weaknesses</button>
                </div>
              )}
            </div>
          )}
          {!loading && text.length > 0 && !isComplete && cursorPos === 0 && (
            <div style={{ position: "absolute", bottom: 12, left: 28, right: 28, fontSize: 11, color: "#484f58", textAlign: "center" }}>Click here and start typing. Backspace to correct.</div>
          )}
          {codeSource && codeSource !== "fallback" && <div style={{ position: "absolute", bottom: 6, right: 12, fontSize: 10, color: "#30363d" }}>{codeSource}</div>}
        </div>

        <div style={{ width: 240, borderLeft: "1px solid #21262d", display: "flex", flexDirection: "column", flexShrink: 0, background: "#0d1117" }}>
          <div style={{ display: "flex", gap: 12, padding: "8px 12px", borderBottom: "1px solid #21262d" }}>
            <button style={tabSt(sideTab === "live")} onClick={() => setSideTab("live")}>LIVE</button>
            <button style={tabSt(sideTab === "weak")} onClick={() => setSideTab("weak")}>WEAK</button>
            <button style={tabSt(sideTab === "detail")} onClick={() => setSideTab("detail")}>DETAIL</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
            {sideTab === "live" && <LivePanel keystrokes={keystrokes} errors={errors} startTime={startTime} cursorPos={cursorPos} text={text} currentStreak={currentStreak} bestStreak={bestStreak} wpmHistory={wpmHistory} sessionHistory={sessionHistory} />}
            {sideTab === "weak" && <><WeakPanel ngramData={ngramData} wordErrors={wordErrors} /><KeyboardHeatmap layout={layout} ngramData={ngramData} /></>}
            {sideTab === "detail" && <DetailPanel charAccuracy={charAccuracy} keystrokeTimes={ksTimesRef.current} wpmHistory={wpmHistory} layout={layout} alphaSpeeds={alphaSpeeds} />}
          </div>
        </div>
      </div>
    </div>
  );
}
