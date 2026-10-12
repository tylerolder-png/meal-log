# Meal Log

A grocery list and recipe box that work together: add a recipe's ingredients to
the list with one tap, dedupe against what's already there, and check things
off at the store. No accounts, no backend — everything lives in your browser's
`localStorage`.

Companion app to [The Log](https://github.com/tylerolder-png/lift-log-template).

**Live:** https://meal-log-gamma.vercel.app

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints.

```bash
npm run check    # typecheck + lint + tests
npm run build    # production build
```

## Importing recipes

Settings → Import recipes accepts pasted JSON (one recipe or an array). The
schema, with a full example, is in [`RECIPE_FORMAT.md`](./RECIPE_FORMAT.md) —
hand that file to Claude (or any LLM) when asking it to write a new recipe for
you.

## Working on this with Claude Code

`CLAUDE.md` holds the architecture, data model, domain rules, and design
direction. Read it before making changes.
