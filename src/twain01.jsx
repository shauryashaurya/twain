import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

// keyboard layout definitions
const LAYOUTS = {
  qwerty: {
    name: "QWERTY",
    rows: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
      ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
    ],
    fingerMap: {
      q: "L4", w: "L3", e: "L2", r: "L1", t: "L1", y: "R1", u: "R1", i: "R2", o: "R3", p: "R4",
      a: "L4", s: "L3", d: "L2", f: "L1", g: "L1", h: "R1", j: "R1", k: "R2", l: "R3", ";": "R4",
      z: "L4", x: "L3", c: "L2", v: "L1", b: "L1", n: "R1", m: "R1", ",": "R2", ".": "R3", "/": "R4"
    }
  },
  dvorak: {
    name: "Dvorak",
    rows: [
      ["'", ",", ".", "p", "y", "f", "g", "c", "r", "l"],
      ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s"],
      [";", "q", "j", "k", "x", "b", "m", "w", "v", "z"]
    ],
    fingerMap: {
      "'": "L4", ",": "L3", ".": "L2", p: "L1", y: "L1", f: "R1", g: "R1", c: "R2", r: "R3", l: "R4",
      a: "L4", o: "L3", e: "L2", u: "L1", i: "L1", d: "R1", h: "R1", t: "R2", n: "R3", s: "R4",
      ";": "L4", q: "L3", j: "L2", k: "L1", x: "L1", b: "R1", m: "R1", w: "R2", v: "R3", z: "R4"
    }
  },
  colemak: {
    name: "Colemak",
    rows: [
      ["q", "w", "f", "p", "g", "j", "l", "u", "y", ";"],
      ["a", "r", "s", "t", "d", "h", "n", "e", "i", "o"],
      ["z", "x", "c", "v", "b", "k", "m", ",", ".", "/"]
    ],
    fingerMap: {
      q: "L4", w: "L3", f: "L2", p: "L1", g: "L1", j: "R1", l: "R1", u: "R2", y: "R3", ";": "R4",
      a: "L4", r: "L3", s: "L2", t: "L1", d: "L1", h: "R1", n: "R1", e: "R2", i: "R3", o: "R4",
      z: "L4", x: "L3", c: "L2", v: "L1", b: "L1", k: "R1", m: "R1", ",": "R2", ".": "R3", "/": "R4"
    }
  }
};

// common words for adaptive practice generation
const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if",
  "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just",
  "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see",
  "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want",
  "because", "any", "these", "give", "day", "most", "us", "great", "between", "need", "large",
  "under", "never", "should", "very", "through", "world", "still", "must", "before", "found",
  "here", "thing", "many", "right", "being", "another", "much", "three", "number", "water",
  "question", "always", "each", "national", "important", "different", "something", "thought",
  "possible", "together", "children", "without", "development", "government", "community",
  "problem", "system", "program", "company", "information", "technology", "experience", "change",
  "performance", "understanding", "significant", "environment", "management", "production",
  "research", "education", "international", "following", "particular", "everything", "available",
  "political", "economic", "application", "organization", "responsibility", "traditional",
  "breakfast", "strength", "beautiful", "practice", "structure", "establish", "challenge",
  "knowledge", "previous", "character", "situation", "demonstrate", "recognize", "themselves"
];

// fallback texts when API calls fail
const FALLBACK_TEXTS = {
  wikipedia: [
    "The history of computing is longer than the history of computing hardware and modern computing technology and includes the history of methods intended for pen and paper or for chalk and slate, with or without the aid of tables. The timeline of computing presents events in the history of computing organized by year and grouped into six topic areas: predictions and concepts, first use and inventions, hardware systems and processors, operating systems, programming languages, and new application areas.",
    "A neural network is a network or circuit of biological neurons, or in a modern sense, an artificial neural network composed of artificial neurons or nodes. Thus a neural network is either a biological neural network, made up of biological neurons, or an artificial neural network used for solving artificial intelligence problems. The connections of the biological neuron are modeled in artificial neural networks as weights between nodes.",
    "The ocean covers approximately seventy percent of the surface of the Earth. It is divided into several principal oceans and smaller seas. More than half of this area is over three thousand meters deep. Average oceanic salinity is around thirty five parts per thousand, and nearly all seawater has a salinity in the range of thirty to thirty eight parts per thousand. Though generally recognized as several separate oceans, these waters comprise one global interconnected body of salt water."
  ],
  code: {
    python: 'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
    javascript: 'function debounce(fn, delay) {\n  let timer = null;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}\n\nfunction deepClone(obj) {\n  if (obj === null || typeof obj !== "object") {\n    return obj;\n  }\n  const clone = Array.isArray(obj) ? [] : {};\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key]);\n    }\n  }\n  return clone;\n}',
    rust: 'fn fibonacci(n: u32) -> u64 {\n    if n <= 1 {\n        return n as u64;\n    }\n    let mut a: u64 = 0;\n    let mut b: u64 = 1;\n    for _ in 2..=n {\n        let temp = a + b;\n        a = b;\n        b = temp;\n    }\n    b\n}\n\nfn is_prime(n: u64) -> bool {\n    if n < 2 {\n        return false;\n    }\n    if n == 2 || n == 3 {\n        return true;\n    }\n    if n % 2 == 0 || n % 3 == 0 {\n        return false;\n    }\n    let mut i = 5;\n    while i * i <= n {\n        if n % i == 0 || n % (i + 2) == 0 {\n            return false;\n        }\n        i += 6;\n    }\n    true\n}',
    go: 'func mergeSort(arr []int) []int {\n\tif len(arr) <= 1 {\n\t\treturn arr\n\t}\n\tmid := len(arr) / 2\n\tleft := mergeSort(arr[:mid])\n\tright := mergeSort(arr[mid:])\n\treturn merge(left, right)\n}\n\nfunc merge(left, right []int) []int {\n\tresult := make([]int, 0, len(left)+len(right))\n\ti, j := 0, 0\n\tfor i < len(left) && j < len(right) {\n\t\tif left[i] <= right[j] {\n\t\t\tresult = append(result, left[i])\n\t\t\ti++\n\t\t} else {\n\t\t\tresult = append(result, right[j])\n\t\t\tj++\n\t\t}\n\t}\n\tresult = append(result, left[i:]...)\n\tresult = append(result, right[j:]...)\n\treturn result\n}'
  }
};

// utility: shuffle array in place
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// update n-gram weakness data
function updateNgramData(prev, text, pos, isError) {
  const updated = { ...prev };
  for (let n = 2; n <= 5; n++) {
    if (pos >= n - 1) {
      const ngram = text.substring(pos - n + 1, pos + 1).toLowerCase();
      if (ngram.includes("\n") || ngram.includes("\t")) continue;
      if (!updated[ngram]) updated[ngram] = { attempts: 0, errors: 0 };
      updated[ngram] = {
        attempts: updated[ngram].attempts + 1,
        errors: updated[ngram].errors + (isError ? 1 : 0)
      };
    }
  }
  return updated;
}

// get sorted weaknesses from ngram data
function getWeakNgrams(ngramData, minAttempts = 3, limit = 15) {
  return Object.entries(ngramData)
    .filter(([_, d]) => d.attempts >= minAttempts)
    .map(([ngram, d]) => ({ ngram, ...d, rate: d.errors / d.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);
}

// generate adaptive practice text from weakness data
function generateAdaptiveText(ngramData) {
  const weakNgrams = getWeakNgrams(ngramData, 3, 10);
  if (weakNgrams.length === 0) {
    return "Keep practicing to build your weakness profile. The system needs more data to generate targeted exercises.";
  }
  const practiceWords = [];
  for (const { ngram } of weakNgrams) {
    const matching = COMMON_WORDS.filter(w => w.includes(ngram));
    practiceWords.push(...matching.slice(0, 4));
  }
  if (practiceWords.length === 0) {
    const ngramStrs = weakNgrams.map(w => w.ngram);
    let drillText = "";
    for (let i = 0; i < 5; i++) {
      drillText += shuffle([...ngramStrs]).join(" ") + " ";
    }
    return drillText.trim();
  }
  const unique = [...new Set(practiceWords)];
  shuffle(unique);
  let text = "";
  let i = 0;
  while (text.length < 300) {
    text += unique[i % unique.length] + " ";
    i++;
    if (i > 200) break;
  }
  return text.trim();
}

// fetch wikipedia text
async function fetchWikipedia() {
  try {
    const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
    if (!res.ok) throw new Error("Wikipedia request failed");
    const data = await res.json();
    const text = data.extract || "";
    if (text.length < 80) throw new Error("Text too short");
    return text;
  } catch {
    const idx = Math.floor(Math.random() * FALLBACK_TEXTS.wikipedia.length);
    return FALLBACK_TEXTS.wikipedia[idx];
  }
}

// fetch github code
async function fetchGithubCode(language) {
  try {
    const ext = { python: "py", javascript: "js", rust: "rs", go: "go", typescript: "ts" };
    const fileExt = ext[language] || "py";
    const searchRes = await fetch(
      `https://api.github.com/search/repositories?q=language:${language}+stars:>500&sort=stars&per_page=10`
    );
    if (!searchRes.ok) throw new Error("GitHub search failed");
    const searchData = await searchRes.json();
    const repos = searchData.items || [];
    if (repos.length === 0) throw new Error("No repos found");
    const repo = repos[Math.floor(Math.random() * repos.length)];
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`
    );
    if (!treeRes.ok) throw new Error("Tree fetch failed");
    const treeData = await treeRes.json();
    const files = (treeData.tree || []).filter(
      f => f.type === "blob" && f.path.endsWith("." + fileExt) && f.size > 200 && f.size < 5000
    );
    if (files.length === 0) throw new Error("No matching files");
    const file = files[Math.floor(Math.random() * files.length)];
    const contentRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/${file.path}`
    );
    if (!contentRes.ok) throw new Error("Content fetch failed");
    const contentData = await contentRes.json();
    const decoded = atob(contentData.content.replace(/\n/g, ""));
    const lines = decoded.split("\n").slice(0, 30);
    return { text: lines.join("\n"), source: `${repo.full_name}/${file.path}` };
  } catch {
    const code = FALLBACK_TEXTS.code[language] || FALLBACK_TEXTS.code.python;
    return { text: code, source: "fallback" };
  }
}

// get per-key error data for keyboard heatmap
function getKeyErrorRates(ngramData) {
  const keyData = {};
  for (const [ngram, d] of Object.entries(ngramData)) {
    if (ngram.length !== 2) continue;
    const ch = ngram[1];
    if (!keyData[ch]) keyData[ch] = { attempts: 0, errors: 0 };
    keyData[ch].attempts += d.attempts;
    keyData[ch].errors += d.errors;
  }
  return keyData;
}

// mini keyboard heatmap component
function KeyboardHeatmap({ layout, ngramData }) {
  const layoutData = LAYOUTS[layout];
  const keyErrors = getKeyErrorRates(ngramData);
  const getKeyColor = (key) => {
    const d = keyErrors[key];
    if (!d || d.attempts < 2) return "rgba(255,255,255,0.06)";
    const rate = d.errors / d.attempts;
    if (rate > 0.4) return "rgba(248,81,73,0.6)";
    if (rate > 0.2) return "rgba(248,81,73,0.35)";
    if (rate > 0.1) return "rgba(210,153,34,0.35)";
    return "rgba(63,185,80,0.25)";
  };
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6, fontFamily: "inherit" }}>
        KEY ACCURACY ({layoutData.name})
      </div>
      {layoutData.rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 3, marginBottom: 3, paddingLeft: ri * 14 }}>
          {row.map((key) => (
            <div
              key={key}
              style={{
                width: 24, height: 24, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: 3, fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace", color: "#c9d1d9",
                background: getKeyColor(key), border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// metrics panel
function MetricsPanel({ keystrokes, errors, startTime, cursorPos, text, currentStreak, bestStreak, wpmHistory }) {
  const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm = elapsed > 0 ? Math.round((cursorPos / 5) / elapsed) : 0;
  const rawWpm = elapsed > 0 ? Math.round((keystrokes / 5) / elapsed) : 0;
  const accuracy = keystrokes > 0 ? ((keystrokes - errors) / keystrokes * 100).toFixed(1) : "100.0";
  const progress = text.length > 0 ? (cursorPos / text.length * 100).toFixed(0) : 0;

  const statStyle = { marginBottom: 14 };
  const labelStyle = { fontSize: 11, color: "#8b949e", letterSpacing: "0.05em", fontFamily: "inherit" };
  const valueStyle = { fontSize: 26, fontWeight: 700, color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 };
  const subStyle = { fontSize: 11, color: "#6e7681", fontFamily: "inherit" };

  return (
    <div>
      <div style={statStyle}>
        <div style={labelStyle}>WPM</div>
        <div style={valueStyle}>{wpm}</div>
        <div style={subStyle}>raw: {rawWpm}</div>
      </div>
      <div style={statStyle}>
        <div style={labelStyle}>ACCURACY</div>
        <div style={{ ...valueStyle, color: parseFloat(accuracy) > 95 ? "#3fb950" : parseFloat(accuracy) > 85 ? "#d29922" : "#f85149" }}>
          {accuracy}%
        </div>
      </div>
      <div style={statStyle}>
        <div style={labelStyle}>ERRORS</div>
        <div style={{ ...valueStyle, fontSize: 20 }}>{errors}</div>
      </div>
      <div style={statStyle}>
        <div style={labelStyle}>STREAK</div>
        <div style={{ ...valueStyle, fontSize: 20 }}>{currentStreak}</div>
        <div style={subStyle}>best: {bestStreak}</div>
      </div>
      <div style={statStyle}>
        <div style={labelStyle}>PROGRESS</div>
        <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 4 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#58a6ff", borderRadius: 2, transition: "width 0.2s" }} />
        </div>
        <div style={subStyle}>{cursorPos}/{text.length}</div>
      </div>
      {wpmHistory.length > 3 && (
        <div style={{ marginTop: 8 }}>
          <div style={labelStyle}>WPM TREND</div>
          <div style={{ height: 50, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wpmHistory}>
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Line type="monotone" dataKey="wpm" stroke="#58a6ff" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// weakness panel
function WeaknessPanel({ ngramData, wordErrors }) {
  const weakNgrams = getWeakNgrams(ngramData, 3, 10);
  const weakWords = Object.entries(wordErrors)
    .filter(([_, d]) => d.attempts >= 2)
    .map(([word, d]) => ({ word, ...d, rate: d.errors / d.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  if (weakNgrams.length === 0 && weakWords.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "#6e7681", fontFamily: "inherit" }}>
        Weakness data will appear here as you type. Keep going.
      </div>
    );
  }

  return (
    <div>
      {weakNgrams.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6, letterSpacing: "0.05em" }}>
            WEAK SEQUENCES
          </div>
          {weakNgrams.map(({ ngram, rate, attempts, errors }) => (
            <div key={ngram} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <code style={{
                fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.06)",
                padding: "1px 6px", borderRadius: 3, color: "#e6edf3", fontSize: 12
              }}>
                {ngram.replace(/ /g, "_")}
              </code>
              <span style={{ color: rate > 0.3 ? "#f85149" : "#d29922", fontSize: 11 }}>
                {(rate * 100).toFixed(0)}% err ({errors}/{attempts})
              </span>
            </div>
          ))}
        </div>
      )}
      {weakWords.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6, letterSpacing: "0.05em" }}>
            WEAK WORDS
          </div>
          {weakWords.map(({ word, rate, attempts, errors }) => (
            <div key={word} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <span style={{ color: "#e6edf3", fontFamily: "'JetBrains Mono', monospace" }}>{word}</span>
              <span style={{ color: rate > 0.3 ? "#f85149" : "#d29922", fontSize: 11 }}>
                {(rate * 100).toFixed(0)}% err ({errors}/{attempts})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TypingTutor() {
  const [mode, setMode] = useState("wikipedia");
  const [layout, setLayout] = useState("qwerty");
  const [codeLang, setCodeLang] = useState("python");
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
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [codeSource, setCodeSource] = useState("");
  const [customText, setCustomText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const wpmIntervalRef = useRef(null);
  const currentWordErrorRef = useRef(false);

  // load text based on mode
  const loadText = useCallback(async (forceMode) => {
    const m = forceMode || mode;
    setLoading(true);
    setIsComplete(false);
    setCursorPos(0);
    setKeystrokes(0);
    setErrors(0);
    setCurrentStreak(0);
    setStartTime(null);
    setWpmHistory([]);
    setCodeSource("");
    currentWordErrorRef.current = false;

    let newText = "";
    if (m === "wikipedia") {
      newText = await fetchWikipedia();
    } else if (m === "github") {
      const result = await fetchGithubCode(codeLang);
      newText = result.text;
      setCodeSource(result.source);
    } else if (m === "adaptive") {
      newText = generateAdaptiveText(ngramData);
    } else if (m === "custom") {
      newText = customText || "Type your custom text here.";
    }
    // normalize: replace tabs with 4 spaces for display, normalize line endings
    newText = newText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (m !== "github") {
      newText = newText.replace(/\t/g, "    ");
    }
    setText(newText);
    setCharStates(new Array(newText.length).fill("untyped"));
    setLoading(false);
  }, [mode, codeLang, ngramData, customText]);

  // initial load
  useEffect(() => { loadText(); }, []);

  // scroll cursor into view
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [cursorPos]);

  // wpm tracking interval
  useEffect(() => {
    if (startTime && !isComplete) {
      wpmIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 60000;
        if (elapsed > 0) {
          setWpmHistory(prev => {
            const wpm = Math.round((cursorPos / 5) / elapsed);
            return [...prev, { t: prev.length, wpm }];
          });
        }
      }, 2000);
    }
    return () => clearInterval(wpmIntervalRef.current);
  }, [startTime, isComplete]);

  // extract current word boundaries
  const getCurrentWord = useCallback((pos) => {
    if (pos <= 0 || pos > text.length) return null;
    let end = pos;
    let start = pos - 1;
    while (start > 0 && /\S/.test(text[start - 1])) start--;
    return text.substring(start, end).toLowerCase().replace(/[^a-z]/g, "");
  }, [text]);

  // handle typing
  const handleKeyDown = useCallback((e) => {
    if (isComplete || loading || text.length === 0) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (cursorPos > 0) {
        const newPos = cursorPos - 1;
        setCursorPos(newPos);
        setCharStates(prev => {
          const next = [...prev];
          next[newPos] = "untyped";
          return next;
        });
      }
      return;
    }

    let inputChar = null;
    if (e.key === "Enter") {
      e.preventDefault();
      inputChar = "\n";
    } else if (e.key === "Tab") {
      e.preventDefault();
      // in code mode, match tab characters; otherwise treat as spaces
      if (mode === "github" && cursorPos < text.length && text[cursorPos] === "\t") {
        inputChar = "\t";
      } else {
        inputChar = " ";
      }
    } else if (e.key.length === 1) {
      e.preventDefault();
      inputChar = e.key;
    }

    if (inputChar === null) return;

    if (startTime === null) {
      setStartTime(Date.now());
    }

    const targetChar = text[cursorPos];
    const isCorrect = inputChar === targetChar;

    setKeystrokes(prev => prev + 1);

    if (!isCorrect) {
      setErrors(prev => prev + 1);
      currentWordErrorRef.current = true;
      setCurrentStreak(0);
    } else {
      setCurrentStreak(prev => {
        const next = prev + 1;
        setBestStreak(best => Math.max(best, next));
        return next;
      });
    }

    setCharStates(prev => {
      const next = [...prev];
      next[cursorPos] = isCorrect ? "correct" : "incorrect";
      return next;
    });

    setNgramData(prev => updateNgramData(prev, text, cursorPos, !isCorrect));

    // word completion tracking
    const nextPos = cursorPos + 1;
    const isWordBoundary = nextPos >= text.length || /\s/.test(text[nextPos]);
    const currentCharIsWord = /\S/.test(targetChar);
    if (isWordBoundary && currentCharIsWord) {
      const word = getCurrentWord(nextPos);
      if (word && word.length >= 2) {
        setWordErrors(prev => {
          const existing = prev[word] || { attempts: 0, errors: 0 };
          return {
            ...prev,
            [word]: {
              attempts: existing.attempts + 1,
              errors: existing.errors + (currentWordErrorRef.current ? 1 : 0)
            }
          };
        });
        currentWordErrorRef.current = false;
      }
    }
    // reset word error tracking on word start
    if (cursorPos > 0 && /\s/.test(text[cursorPos - 1]) && /\S/.test(targetChar)) {
      currentWordErrorRef.current = false;
    }

    setCursorPos(nextPos);
    if (nextPos >= text.length) {
      setIsComplete(true);
    }
  }, [cursorPos, text, isComplete, loading, startTime, mode, getCurrentWord]);

  // focus handler
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.focus();
  }, [text, loading]);

  // render characters
  const renderText = useMemo(() => {
    if (text.length === 0) return null;
    const elements = [];
    const lines = [];
    let currentLine = [];
    for (let i = 0; i < text.length; i++) {
      currentLine.push(i);
      if (text[i] === "\n") {
        lines.push([...currentLine]);
        currentLine = [];
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    for (let li = 0; li < lines.length; li++) {
      const lineChars = lines[li];
      const lineSpans = lineChars.map(i => {
        const ch = text[i];
        const state = charStates[i] || "untyped";
        const isCursor = i === cursorPos;
        let color = "#3d4450";
        if (state === "correct") color = "#e6edf3";
        if (state === "incorrect") color = "#f85149";
        const displayChar = ch === "\n" ? " " : ch === " " ? "\u00A0" : ch;
        return (
          <span
            key={i}
            ref={isCursor ? cursorRef : null}
            style={{
              color,
              background: state === "incorrect" ? "rgba(248,81,73,0.15)" : "transparent",
              borderLeft: isCursor ? "2px solid #58a6ff" : "2px solid transparent",
              paddingLeft: 1,
              transition: "color 0.05s"
            }}
          >
            {displayChar}
          </span>
        );
      });
      elements.push(
        <div key={`line-${li}`} style={{ minHeight: "1.6em" }}>
          {lineSpans}
        </div>
      );
    }
    return elements;
  }, [text, charStates, cursorPos]);

  // completion stats
  const completionStats = useMemo(() => {
    if (!isComplete || !startTime) return null;
    const elapsed = (Date.now() - startTime) / 60000;
    const wpm = Math.round((text.length / 5) / elapsed);
    const accuracy = keystrokes > 0 ? ((keystrokes - errors) / keystrokes * 100).toFixed(1) : "100.0";
    return { wpm, accuracy, elapsed: elapsed.toFixed(1), errors };
  }, [isComplete, startTime, text, keystrokes, errors]);

  const isCodeMode = mode === "github";

  return (
    <div
      style={{
        width: "100%", height: "100vh", background: "#0d1117", color: "#c9d1d9",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .tt-select { background: #161b22; color: #c9d1d9; border: 1px solid #30363d; border-radius: 4px; padding: 4px 8px; font-size: 12px; font-family: inherit; outline: none; cursor: pointer; }
        .tt-select:focus { border-color: #58a6ff; }
        .tt-btn { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; border-radius: 4px; padding: 5px 12px; font-size: 12px; font-family: inherit; cursor: pointer; transition: background 0.15s; }
        .tt-btn:hover { background: #30363d; }
        .tt-btn-primary { background: #1f6feb; border-color: #1f6feb; color: #fff; }
        .tt-btn-primary:hover { background: #388bfd; }
        .tt-textarea { background: #0d1117; color: #c9d1d9; border: 1px solid #30363d; border-radius: 4px; padding: 8px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; width: 100%; }
        .tt-textarea:focus { border-color: #58a6ff; }
      `}</style>

      {/* header bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "8px 16px",
        borderBottom: "1px solid #21262d", flexShrink: 0, flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3", marginRight: 8 }}>TYPING TUTOR</span>
        <select className="tt-select" value={mode} onChange={e => { setMode(e.target.value); if (e.target.value === "custom") setShowCustomInput(true); }}>
          <option value="wikipedia">Wikipedia</option>
          <option value="github">Code (GitHub)</option>
          <option value="adaptive">Adaptive Practice</option>
          <option value="custom">Custom Text</option>
        </select>
        {mode === "github" && (
          <select className="tt-select" value={codeLang} onChange={e => setCodeLang(e.target.value)}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
          </select>
        )}
        <select className="tt-select" value={layout} onChange={e => setLayout(e.target.value)}>
          <option value="qwerty">QWERTY</option>
          <option value="dvorak">Dvorak</option>
          <option value="colemak">Colemak</option>
        </select>
        <button className="tt-btn tt-btn-primary" onClick={() => { setShowCustomInput(false); loadText(); }}>
          {loading ? "Loading..." : "New Text"}
        </button>
        {mode === "adaptive" && (
          <button className="tt-btn" onClick={() => loadText("adaptive")}>
            Refresh Practice
          </button>
        )}
        {mode === "custom" && (
          <button className="tt-btn" onClick={() => setShowCustomInput(!showCustomInput)}>
            {showCustomInput ? "Hide Input" : "Edit Text"}
          </button>
        )}
      </div>

      {/* custom text input area */}
      {showCustomInput && mode === "custom" && (
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
          <textarea
            className="tt-textarea"
            rows={4}
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Paste or type your custom practice text here..."
          />
          <div style={{ marginTop: 4 }}>
            <button className="tt-btn tt-btn-primary" onClick={() => { setShowCustomInput(false); loadText("custom"); }}>
              Start Typing
            </button>
          </div>
        </div>
      )}

      {/* main content area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* typing area */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1, padding: "24px 32px", overflowY: "auto", outline: "none",
            fontSize: isCodeMode ? 14 : 18, lineHeight: 1.7, cursor: "text",
            whiteSpace: isCodeMode ? "pre" : "pre-wrap", wordBreak: isCodeMode ? "normal" : "break-word",
            position: "relative"
          }}
        >
          {loading && (
            <div style={{ color: "#6e7681", fontSize: 14 }}>Loading content...</div>
          )}
          {!loading && text.length === 0 && (
            <div style={{ color: "#6e7681", fontSize: 14 }}>Click "New Text" to begin.</div>
          )}
          {!loading && text.length > 0 && !isComplete && renderText}
          {isComplete && completionStats && (
            <div style={{ maxWidth: 480 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", marginBottom: 20 }}>Session Complete</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "0.05em" }}>FINAL WPM</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: "#58a6ff" }}>{completionStats.wpm}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "0.05em" }}>ACCURACY</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: parseFloat(completionStats.accuracy) > 95 ? "#3fb950" : "#d29922" }}>
                    {completionStats.accuracy}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "0.05em" }}>ERRORS</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: completionStats.errors > 0 ? "#f85149" : "#3fb950" }}>
                    {completionStats.errors}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "0.05em" }}>TIME</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#e6edf3" }}>{completionStats.elapsed}m</div>
                </div>
              </div>
              {wpmHistory.length > 3 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "0.05em", marginBottom: 8 }}>WPM OVER SESSION</div>
                  <div style={{ height: 80 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={wpmHistory}>
                        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                        <Line type="monotone" dataKey="wpm" stroke="#58a6ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tt-btn tt-btn-primary" onClick={() => loadText()}>New Text</button>
                <button className="tt-btn" onClick={() => loadText("adaptive")}>Practice Weaknesses</button>
              </div>
            </div>
          )}
          {!loading && text.length > 0 && !isComplete && cursorPos === 0 && (
            <div style={{
              position: "absolute", bottom: 16, left: 32, right: 32,
              fontSize: 12, color: "#484f58", textAlign: "center"
            }}>
              Click here and start typing. Press Backspace to correct errors.
            </div>
          )}
          {codeSource && codeSource !== "fallback" && (
            <div style={{
              position: "absolute", bottom: 8, right: 16, fontSize: 11, color: "#30363d"
            }}>
              {codeSource}
            </div>
          )}
        </div>

        {/* side panel */}
        <div style={{
          width: 220, borderLeft: "1px solid #21262d", padding: "16px 14px",
          overflowY: "auto", flexShrink: 0, background: "#0d1117"
        }}>
          <MetricsPanel
            keystrokes={keystrokes}
            errors={errors}
            startTime={startTime}
            cursorPos={cursorPos}
            text={text}
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            wpmHistory={wpmHistory}
          />
          <div style={{ borderTop: "1px solid #21262d", margin: "16px 0", padding: 0 }} />
          <WeaknessPanel ngramData={ngramData} wordErrors={wordErrors} />
          <KeyboardHeatmap layout={layout} ngramData={ngramData} />
        </div>
      </div>
    </div>
  );
}
