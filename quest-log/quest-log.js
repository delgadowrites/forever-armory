/*
  Quest Log for Forever Armory
  ----------------------------
  The lesson panel and the check runner. Built by Claude Code; not part of
  the armory. To remove it, delete its <script> tag in index.html.

  How it stays out of the way:
  - The panel lives inside a Shadow DOM, so the page's CSS can't restyle it,
    and document.querySelector() on the armory never finds the panel's parts.
  - It loads its own CSS (quest-log.css) and quest data (quests.js) itself,
    so index.html needs only one <script> tag.
  - Progress is saved in localStorage under one key: "ql-progress".
*/
(function () {
  "use strict";

  const STORAGE_KEY = "ql-progress";
  const scriptUrl = document.currentScript
    ? document.currentScript.src
    : new URL("quest-log/quest-log.js", document.baseURI).href;
  const folderUrl = new URL(".", scriptUrl);

  /* ---------- Progress (localStorage) ---------- */

  function loadProgress() {
    const fresh = { completed: [], open: true, selected: null };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fresh;
      const saved = JSON.parse(raw);
      return {
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        open: saved.open !== false,
        selected: typeof saved.selected === "string" ? saved.selected : null,
      };
    } catch (err) {
      return fresh;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      /* Storage blocked (private window etc.): progress lasts until refresh. */
    }
  }

  /* ---------- Page snapshot at load ---------- */
  // Taken right after script.js has run, so checks can ask
  // "what did the page look like when it loaded?"

  const atLoad = {};
  function takeSnapshot() {
    document.querySelectorAll("[id]").forEach((node) => {
      if (node.id && !(node.id in atLoad)) {
        atLoad[node.id] = { text: node.textContent.trim(), hidden: isHidden(node) };
      }
    });
  }

  /* ---------- Check helpers (passed to every check as "h") ---------- */

  function isHidden(node) {
    if (!node || !node.isConnected) return true;
    if (node.getClientRects().length === 0) return true; // display:none, hidden attribute, or inside one
    return getComputedStyle(node).visibility === "hidden";
  }

  function quote(text) {
    if (text === "") return "nothing (empty)";
    const short = text.length > 80 ? text.slice(0, 77) + "..." : text;
    return '"' + short + '"';
  }

  function result(pass, wanted, got) {
    return { pass: Boolean(pass), wanted: String(wanted), got: String(got) };
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function missing(id) {
    return 'No element with id "' + id + '" on the page';
  }

  let fileDocPromise = null;
  function loadFileDoc() {
    if (!fileDocPromise) {
      fileDocPromise = (async () => {
        if (location.protocol === "file:") {
          return { error: "The page is open as a file (the address starts with file://), so the Quest Log can't read index.html" };
        }
        try {
          const response = await fetch(new URL("index.html", document.baseURI), { cache: "no-store" });
          if (!response.ok) return { error: "Reading index.html failed (status " + response.status + ")" };
          const html = await response.text();
          return { doc: new DOMParser().parseFromString(html, "text/html") };
        } catch (err) {
          return { error: "Reading index.html failed: " + err.message };
        }
      })();
    }
    return fileDocPromise;
  }

  const h = {
    result,
    isHidden,
    quote,
    el: byId,
    atLoad: (id) => atLoad[id] || null,
    nextFrame: () => new Promise((resolve) => requestAnimationFrame(() => resolve())),

    exists(id) {
      const wanted = 'Exactly one element with id "' + id + '" on the page';
      const count = document.querySelectorAll('[id="' + id + '"]').length;
      if (count === 0) return result(false, wanted, missing(id));
      if (count > 1) return result(false, wanted, count + ' elements share the id "' + id + '" (ids must be unique)');
      return result(true, wanted, 'Found <' + byId(id).tagName.toLowerCase() + ' id="' + id + '">');
    },

    isTag(id, tag) {
      const article = (name) => (/^(h\d|[aeiou])/.test(name) ? "an" : "a");
      const wanted = 'The element with id "' + id + '" is ' + article(tag) + " <" + tag + "> element";
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const actual = node.tagName.toLowerCase();
      return result(actual === tag, wanted, "It is " + article(actual) + " <" + actual + "> element");
    },

    isInside(childId, parentId) {
      const wanted = 'The element with id "' + childId + '" is inside the element with id "' + parentId + '"';
      const child = byId(childId);
      const parent = byId(parentId);
      if (!child) return result(false, wanted, missing(childId));
      if (!parent) return result(false, wanted, missing(parentId));
      const inside = child !== parent && parent.contains(child);
      return result(inside, wanted, inside
        ? '"' + childId + '" is inside "' + parentId + '"'
        : '"' + childId + '" is outside "' + parentId + '"');
    },

    async emptyInFile(id) {
      const wanted = 'In the index.html file, the element with id "' + id + '" is empty (JavaScript fills it in)';
      const file = await loadFileDoc();
      if (file.error) return result(false, wanted + ". Open the page with Live Server.", file.error);
      const node = file.doc.getElementById(id);
      if (!node) return result(false, wanted, 'index.html has no element with id "' + id + '"');
      const text = node.textContent.trim();
      return result(text === "", wanted, text === ""
        ? "In index.html it is empty"
        : "In index.html it already contains " + quote(text));
    },

    hasText(id) {
      const wanted = 'The element with id "' + id + '" shows some text on the page';
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const text = node.textContent.trim();
      return result(text !== "", wanted, "It shows " + quote(text));
    },

    textIncludes(id, part) {
      const wanted = 'The element with id "' + id + '" shows text that includes "' + part + '"';
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const text = node.textContent.trim();
      return result(text.includes(part), wanted, "It shows " + quote(text));
    },

    textEquals(id, exact) {
      const wanted = 'The element with id "' + id + '" shows exactly "' + exact + '"';
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const text = node.textContent.trim();
      return result(text === exact, wanted, "It shows " + quote(text));
    },

    wordCount(id, count) {
      const wanted = 'The element with id "' + id + '" shows ' + count + " words with one space between them";
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const text = node.textContent.trim();
      const words = text === "" ? [] : text.split(/\s+/);
      return result(words.length === count, wanted, "It shows " + quote(text) + " (" + words.length + (words.length === 1 ? " word)" : " words)"));
    },

    textHasNumber(id) {
      const wanted = 'The element with id "' + id + '" shows text that includes a number';
      const node = byId(id);
      if (!node) return result(false, wanted, missing(id));
      const text = node.textContent.trim();
      return result(/\d/.test(text), wanted, "It shows " + quote(text));
    },

    // Clicks an element the way a person would and reports any error
    // thrown by the page's click code.
    async click(node) {
      let error = null;
      const onError = (event) => { error = event.message || String(event.error); };
      window.addEventListener("error", onError);
      try {
        node.click();
      } finally {
        window.removeEventListener("error", onError);
      }
      await h.nextFrame();
      return { error };
    },
  };

  /* ---------- Quest data ---------- */

  let chapters = [];
  let quests = [];
  let progress = loadProgress();

  function isDone(quest) {
    return progress.completed.includes(quest.id);
  }

  function isUnlocked(quest) {
    const index = quests.indexOf(quest);
    return quests.slice(0, index).every(isDone);
  }

  function currentQuest() {
    return quests.find((quest) => !isDone(quest)) || null;
  }

  function selectedQuest() {
    const chosen = quests.find((quest) => quest.id === progress.selected);
    if (chosen && isUnlocked(chosen)) return chosen;
    return currentQuest() || quests[quests.length - 1] || null;
  }

  function chapterTitle(number) {
    const chapter = chapters.find((c) => c.number === number);
    return chapter ? "Chapter " + number + ": " + chapter.title : "Chapter " + number;
  }

  /* ---------- Building the panel ---------- */

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  let ui = null;

  function buildPanel() {
    const host = document.createElement("div");
    host.id = "ql-host";
    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("quest-log.css", folderUrl).href;
    shadow.appendChild(style);

    const root = make("div", "ql-root");
    root.hidden = true; // shown once the CSS has loaded, so it never flashes unstyled
    style.addEventListener("load", () => { root.hidden = false; });
    style.addEventListener("error", () => { root.hidden = false; });

    const toggle = make("button", "ql-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "ql-panel");
    toggle.append(make("span", "ql-toggle-icon", "📜"), make("span", "ql-toggle-label", "Quest Log"));

    const panel = make("aside", "ql-panel");
    panel.id = "ql-panel";
    panel.setAttribute("aria-label", "Quest Log");

    const header = make("header", "ql-header");
    const eyebrow = make("p", "ql-eyebrow", "Quest Log");
    const chapterHeading = make("h2", "ql-chapter");
    header.append(eyebrow, chapterHeading);

    const body = make("div", "ql-body");
    const questBox = make("section", "ql-quest");
    const results = make("section", "ql-results");
    results.setAttribute("aria-live", "polite");
    const listBox = make("nav", "ql-list");
    listBox.setAttribute("aria-label", "Chapter quests");
    body.append(questBox, results, listBox);

    panel.append(header, body);
    root.append(toggle, panel);
    shadow.appendChild(root);
    document.body.appendChild(host);

    toggle.addEventListener("click", () => {
      progress.open = !progress.open;
      saveProgress();
      renderOpenState();
    });

    ui = { root, toggle, panel, chapterHeading, questBox, results, listBox };
  }

  function renderOpenState() {
    ui.root.classList.toggle("ql-is-open", progress.open);
    ui.toggle.setAttribute("aria-expanded", String(progress.open));
    ui.toggle.title = progress.open ? "Hide the Quest Log" : "Show the Quest Log";
    ui.panel.inert = !progress.open;
  }

  function linkLabel(url) {
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean);
      const docs = parts.indexOf("docs");
      const tail = docs >= 0 ? parts.slice(docs + 1) : parts;
      return "MDN: " + tail.slice(-2).join(" / ").replace(/_/g, " ");
    } catch (err) {
      return url;
    }
  }

  function renderQuest(quest) {
    const box = ui.questBox;
    box.replaceChildren();

    if (!quest) {
      box.append(make("p", "ql-empty", "No quests yet. Quests for the next chapter are added when it starts."));
      return;
    }

    const top = make("div", "ql-quest-top");
    top.append(make("span", "ql-quest-id", "Quest " + quest.id));
    const zone = make("span", "ql-zone ql-zone-" + String(quest.zone).toLowerCase(), quest.zone + " zone");
    zone.title = quest.zone === "Copy"
      ? "Copy zone: boilerplate you may copy from MDN or your notes."
      : "Think zone: work this one out yourself.";
    top.append(zone);
    if (isDone(quest)) top.append(make("span", "ql-done-badge", "✅ Complete"));
    box.append(top);

    box.append(make("h3", "ql-quest-title", quest.title));

    box.append(make("h4", "ql-label", "Ticket"));
    box.append(make("p", "ql-ticket", quest.ticket));

    box.append(make("h4", "ql-label", "Acceptance criteria"));
    const criteria = make("ul", "ql-criteria");
    quest.acceptance.forEach((line) => criteria.append(make("li", "", line)));
    box.append(criteria);

    if (quest.concepts && quest.concepts.length) {
      box.append(make("h4", "ql-label", "Concepts"));
      const chips = make("ul", "ql-chips");
      quest.concepts.forEach((concept) => chips.append(make("li", "ql-chip", concept)));
      box.append(chips);
    }

    if (quest.mdn && quest.mdn.length) {
      box.append(make("h4", "ql-label", "Read on MDN"));
      const links = make("ul", "ql-links");
      quest.mdn.forEach((url) => {
        const item = make("li");
        const link = make("a", "", linkLabel(url));
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        item.append(link);
        links.append(item);
      });
      box.append(links);
    }

    const checkButton = make("button", "ql-check", "Check quest");
    checkButton.type = "button";
    checkButton.addEventListener("click", () => runChecks(quest, checkButton));
    box.append(checkButton);
  }

  function renderList(quest) {
    const box = ui.listBox;
    box.replaceChildren();
    if (!quest) return;

    const chapterNumbers = [...new Set(quests.map((q) => q.chapter))];
    if (chapterNumbers.length > 1) {
      const label = make("label", "ql-chapter-pick");
      label.append(make("span", "", "Chapter "));
      const select = make("select");
      chapterNumbers.forEach((number) => {
        const option = make("option", "", chapterTitle(number));
        option.value = String(number);
        option.selected = number === quest.chapter;
        option.disabled = !isUnlocked(quests.find((q) => q.chapter === number));
        select.append(option);
      });
      select.addEventListener("change", () => {
        const first = quests.find((q) => q.chapter === Number(select.value));
        if (first) selectQuest(first.id);
      });
      label.append(select);
      box.append(label);
    }

    box.append(make("h4", "ql-label", "Quests in this chapter"));
    const list = make("ol", "ql-quest-list");
    quests.filter((q) => q.chapter === quest.chapter).forEach((q) => {
      const item = make("li");
      const unlocked = isUnlocked(q);
      const button = make("button", "ql-quest-link");
      button.type = "button";
      button.disabled = !unlocked;
      if (q === quest) {
        button.classList.add("ql-is-selected");
        button.setAttribute("aria-current", "step");
      }
      button.append(
        make("span", "ql-mark", isDone(q) ? "✅" : "⬜"),
        make("span", "ql-quest-link-id", q.id),
        make("span", "ql-quest-link-title", q.title + (unlocked ? "" : " (locked)"))
      );
      button.addEventListener("click", () => selectQuest(q.id));
      item.append(button);
      list.append(item);
    });
    box.append(list);
  }

  function render() {
    const quest = selectedQuest();
    ui.chapterHeading.textContent = quest ? chapterTitle(quest.chapter) : "No chapter loaded";
    renderQuest(quest);
    renderList(quest);
    renderOpenState();
  }

  function selectQuest(id) {
    progress.selected = id;
    saveProgress();
    ui.results.replaceChildren();
    render();
  }

  /* ---------- Check runner ---------- */

  async function runOneCheck(check) {
    try {
      const outcome = await check(h);
      const list = Array.isArray(outcome) ? outcome : [outcome];
      return list.map((r) => (r && typeof r === "object" ? result(r.pass, r.wanted, r.got) : result(false, "A check result", "The check gave back nothing")));
    } catch (err) {
      return [result(false, "The check runs without crashing", "The check crashed: " + err.message)];
    }
  }

  async function runChecks(quest, button) {
    button.disabled = true;
    button.textContent = "Checking...";
    fileDocPromise = null; // re-read index.html on every run, so edits count

    const rows = [];
    for (const check of quest.checks) {
      rows.push(...(await runOneCheck(check)));
    }

    const passed = rows.filter((r) => r.pass).length;
    const allPassed = rows.length > 0 && passed === rows.length;
    const wasDone = isDone(quest);
    if (allPassed && !wasDone) {
      progress.completed.push(quest.id);
      saveProgress();
    }

    render();
    showResults(quest, rows, passed, allPassed && !wasDone);
  }

  function showResults(quest, rows, passed, justCompleted) {
    const box = ui.results;
    box.replaceChildren();

    const allPassed = passed === rows.length && rows.length > 0;
    const summary = make("p", "ql-summary " + (allPassed ? "ql-summary-pass" : "ql-summary-fail"),
      (allPassed ? "✅ " : "❌ ") + passed + " of " + rows.length + " checks passed");
    box.append(summary);

    const list = make("ul", "ql-rows");
    rows.forEach((r) => {
      const item = make("li", "ql-row " + (r.pass ? "ql-row-pass" : "ql-row-fail"));
      item.append(make("span", "ql-row-mark", r.pass ? "✅" : "❌"));
      const text = make("div", "ql-row-text");
      const wanted = make("p", "ql-row-line");
      wanted.append(make("strong", "", "Wanted: "), document.createTextNode(r.wanted));
      const got = make("p", "ql-row-line");
      got.append(make("strong", "", "Got: "), document.createTextNode(r.got));
      text.append(wanted, got);
      item.append(text);
      list.append(item);
    });
    box.append(list);

    if (justCompleted) {
      const next = currentQuest();
      const done = make("div", "ql-complete");
      done.append(make("p", "ql-complete-title", "Quest " + quest.id + " complete!"));
      if (next) {
        done.append(make("p", "", "Next quest unlocked: " + next.id + " " + next.title));
        const go = make("button", "ql-next", "Go to quest " + next.id);
        go.type = "button";
        go.addEventListener("click", () => selectQuest(next.id));
        done.append(go);
      } else {
        done.append(make("p", "", "That's every quest written so far. The next chapter's quests arrive when it starts."));
      }
      box.append(done);
    }
  }

  /* ---------- Start ---------- */

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(tag);
    });
  }

  async function start() {
    takeSnapshot();
    buildPanel();
    try {
      await loadScript(new URL("quests.js", folderUrl).href);
      const data = window.QL_DATA || {};
      chapters = Array.isArray(data.chapters) ? data.chapters : [];
      quests = Array.isArray(data.quests) ? data.quests : [];
    } catch (err) {
      ui.questBox.append(make("p", "ql-empty", "The quest list (quest-log/quests.js) didn't load: " + err.message));
      renderOpenState();
      return;
    }
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
