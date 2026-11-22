/*
  Quest data for the Quest Log (Claude Code).
  Quests are added one chapter at a time, at the start of that chapter.

  Each check is a function that gets the helper object "h" (see quest-log.js)
  and returns { pass, wanted, got }, or an array of them.

  Names used across Chapter 1 (keep these exact in every quest):
    #armory               <main>     already in index.html
    #character-card       <section>  the card, inside #armory
    #character-name       <h2>       name and surname
    #character-level      <p>        level
    #character-race       <p>        race
    #character-class      <p>        class
    #character-details    <div>      the details box, inside #character-card
    #character-region     <p>        region, inside #character-details
    #character-professions <p>       professions, inside #character-details
    #details-toggle       <button>   shows/hides #character-details
*/
window.QL_DATA = {
  chapters: [
    { number: 1, title: "The Character Card" },
  ],

  quests: [
    {
      id: "1-1",
      chapter: 1,
      title: "Build the card frame",
      ticket:
        "Give the armory an empty character card in index.html. The card has a spot for the name, level, race and class. Leave every spot empty: in the next quests, script.js fills them in.",
      acceptance: [
        'Inside <main id="armory">, a <section> with id "character-card"',
        'Inside #character-card, an <h2> with id "character-name"',
        'Inside #character-card, three <p> elements with ids "character-level", "character-race" and "character-class"',
        "All four of those elements are empty in index.html (no text between the tags)",
      ],
      concepts: ["HTML elements", "id attribute", "nesting"],
      zone: "Copy",
      mdn: [
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section",
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id",
      ],
      checks: [
        (h) => h.exists("character-card"),
        (h) => h.isTag("character-card", "section"),
        (h) => h.isInside("character-card", "armory"),
        (h) => h.isTag("character-name", "h2"),
        (h) => h.isInside("character-name", "character-card"),
        (h) => h.isTag("character-level", "p"),
        (h) => h.isInside("character-level", "character-card"),
        (h) => h.isTag("character-race", "p"),
        (h) => h.isInside("character-race", "character-card"),
        (h) => h.isTag("character-class", "p"),
        (h) => h.isInside("character-class", "character-card"),
        (h) => h.emptyInFile("character-name"),
        (h) => h.emptyInFile("character-level"),
        (h) => h.emptyInFile("character-race"),
        (h) => h.emptyInFile("character-class"),
      ],
    },

    {
      id: "1-2",
      chapter: 1,
      title: "Name on the card",
      ticket:
        "When the page loads, script.js writes your character's name and surname into the card's heading. The heading stays empty in index.html: JavaScript is what fills it in.",
      acceptance: [
        "#character-name shows your character's name and surname, with one space between them",
        "#character-name is still empty in index.html",
      ],
      concepts: ["document.querySelector", "textContent"],
      zone: "Think",
      mdn: [
        "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector",
        "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
      ],
      checks: [
        (h) => h.hasText("character-name"),
        (h) => h.wordCount("character-name", 2),
        (h) => h.emptyInFile("character-name"),
      ],
    },

    {
      id: "1-3",
      chapter: 1,
      title: "Level, race and class",
      ticket:
        "script.js fills in the rest of the card: your level, race and class. Store each value in its own variable first, then write it onto the page.",
      acceptance: [
        "#character-level shows your level as a number (for example: Level 36)",
        '#character-race shows text that includes "Tauren"',
        '#character-class shows text that includes "Druid"',
        "All three are still empty in index.html",
      ],
      concepts: ["const", "document.querySelector", "textContent"],
      zone: "Think",
      mdn: [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const",
        "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
      ],
      checks: [
        (h) => h.textHasNumber("character-level"),
        (h) => h.textIncludes("character-race", "Tauren"),
        (h) => h.textIncludes("character-class", "Druid"),
        (h) => h.emptyInFile("character-level"),
        (h) => h.emptyInFile("character-race"),
        (h) => h.emptyInFile("character-class"),
      ],
    },

    {
      id: "1-4",
      chapter: 1,
      title: "The details box",
      ticket:
        "Add a details box to the card for extra facts: your region and your professions. Like the rest of the card, the box's spots are empty in index.html and script.js fills them in.",
      acceptance: [
        'Inside #character-card, a <div> with id "character-details"',
        'Inside #character-details, a <p> with id "character-region" that shows your region',
        'Inside #character-details, a <p> with id "character-professions" that shows text including "Skinning" and "Leatherworking"',
        "#character-region and #character-professions are empty in index.html",
      ],
      concepts: ["HTML nesting", "document.querySelector", "textContent"],
      zone: "Think",
      mdn: [
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div",
        "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent",
      ],
      checks: [
        (h) => h.isTag("character-details", "div"),
        (h) => h.isInside("character-details", "character-card"),
        (h) => h.isTag("character-region", "p"),
        (h) => h.isInside("character-region", "character-details"),
        (h) => h.hasText("character-region"),
        (h) => h.isTag("character-professions", "p"),
        (h) => h.isInside("character-professions", "character-details"),
        (h) => h.textIncludes("character-professions", "Skinning"),
        (h) => h.textIncludes("character-professions", "Leatherworking"),
        (h) => h.emptyInFile("character-region"),
        (h) => h.emptyInFile("character-professions"),
      ],
    },

    {
      id: "1-5",
      chapter: 1,
      title: "Show and hide the details",
      ticket:
        'Add a button to the card that shows and hides the details box. When the page loads, the details are hidden and the button says "Show details". Each click flips the box, and the button text always says what the next click will do.',
      acceptance: [
        'Inside #character-card, a <button> with id "details-toggle"',
        "When the page loads, #character-details is hidden",
        'When the page loads, #details-toggle shows exactly "Show details"',
        'After one click, #character-details is shown and the button shows exactly "Hide details"',
        'After a second click, #character-details is hidden again and the button shows exactly "Show details"',
      ],
      concepts: ["addEventListener", "click event", "hidden", "if...else"],
      zone: "Think",
      mdn: [
        "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
        "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/hidden",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
      ],
      checks: [
        (h) => h.isTag("details-toggle", "button"),
        (h) => h.isInside("details-toggle", "character-card"),

        (h) => {
          const wanted = "When the page loads, #character-details is hidden";
          const snap = h.atLoad("character-details");
          if (!snap) return h.result(false, wanted, 'There was no element with id "character-details" when the page loaded');
          return h.result(snap.hidden, wanted, snap.hidden ? "It was hidden at page load" : "It was showing at page load");
        },

        (h) => {
          const wanted = 'When the page loads, #details-toggle shows exactly "Show details"';
          const snap = h.atLoad("details-toggle");
          if (!snap) return h.result(false, wanted, 'There was no element with id "details-toggle" when the page loaded');
          return h.result(snap.text === "Show details", wanted, "At page load it showed " + h.quote(snap.text));
        },

        // Clicks the button twice (so the page ends where it started) and
        // reports what changed after each click.
        async (h) => {
          const button = h.el("details-toggle");
          const details = h.el("character-details");
          if (!button || !details) {
            return h.result(false, "#details-toggle and #character-details both exist, so the clicks can be tested",
              (button ? "" : 'No element with id "details-toggle". ') + (details ? "" : 'No element with id "character-details".'));
          }

          const rows = [];
          for (const clickNumber of [1, 2]) {
            const before = h.isHidden(details);
            const { error } = await h.click(button);
            const after = h.isHidden(details);
            const label = clickNumber === 1 ? "After one click" : "After a second click";
            const state = (hidden) => (hidden ? "hidden" : "shown");

            rows.push(h.result(
              before !== after,
              label + ", #character-details switches from " + state(before) + " to " + state(!before),
              (error ? "Your click code threw an error: " + error + ". " : "") +
                (before === after ? "It stayed " + state(after) : "It switched to " + state(after))
            ));

            const expectedText = after ? "Show details" : "Hide details";
            const text = button.textContent.trim();
            rows.push(h.result(
              text === expectedText,
              label + ', with #character-details ' + state(after) + ', the button shows exactly "' + expectedText + '"',
              "The button shows " + h.quote(text)
            ));
          }
          return rows;
        },
      ],
    },
  ],
};
