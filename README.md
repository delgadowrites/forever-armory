# Forever Armory

My personal armory for **World of Warcraft: Forever**: my character, gear, professions, auction house prices and, later, a profession optimizer.

I'm building it while I learn JavaScript. Each new concept adds a feature to the page.

## My character

| Field | Value |
|---|---|
| Class | Druid |
| Race | Tauren (Horde) |
| Level | 36 |
| Professions | Skinning, Leatherworking |

## How to open it

1. Open this folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.

Use Live Server, not double-clicking the file. Some quest checks read `index.html` to prove JavaScript filled in the page, and that only works when the page has an `http://` address.

## Which files are mine

| File | Who writes it |
|---|---|
| `index.html` (everything inside `<main id="armory">`) | Me |
| `styles.css` | Me |
| `script.js` | Me |
| `data/` (from Chapter 5) | Me |
| `quest-log/` | Claude Code |

## The Quest Log

The panel on the right side of the page (bottom of the screen on a phone) is the **Quest Log**. It gives me one quest at a time, like a work ticket:

- **Ticket:** what the page should do when the quest is done.
- **Acceptance criteria:** the exact things the checks look for.
- **Zone:** *Copy* means boilerplate I may copy. *Think* means I work it out myself.
- **Check quest:** runs the checks. Each row shows ✅ or ❌, what was **Wanted** and what it **Got**.

When every check passes, the quest is complete and the next one unlocks.

Good to know:

- Progress is saved in the browser under the key `ql-progress`. Running `localStorage.clear()` erases it.
- Checks that click buttons click them twice, so the page ends where it started.
- To remove the Quest Log, delete this line from `index.html`. The armory keeps working without it:

  ```html
  <script src="quest-log/quest-log.js"></script>
  ```

## Roadmap

| Chapter | What I learn | What the armory gains |
|---|---|---|
| 1 | Selecting elements, `textContent`, click events | Character card with a show/hide details button |
| 2 | Objects, arrays, loops, `createElement` | Gear list with quality colors |
| 3 | Functions, `filter`, `sort` | Skinning and Leatherworking panel, mats shopping list |
| 4 | `localStorage`, JSON | Profession goals and notes that survive a refresh |
| 5 | `fetch`, `async` / `await` | My data moved into `data/*.json` files |
| 6 | Server function, secrets, tokens | Live character card and gear from Battle.net |
| 7 | Large data, caching, scheduled jobs | Auction house prices for my leathers and mats |
| 8 | Combining data, calculations | Profession optimizer: craft or sell? |
| 9 | OAuth sign-in | Sign in with Battle.net and pick a character |

## Notes

- No Blizzard logos or artwork in the design. Item icons and character images come from the API at runtime (Chapter 6+).
- Secrets (like the Battle.net client secret) never go in this repo.
