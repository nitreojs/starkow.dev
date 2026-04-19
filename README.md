# starkow.dev monorepo

this is monorepo of starkow.dev and other subdomain websites.

- [fwd.starkow.dev](./apps/fwd.starkow.dev/README.md)
- [starkow.dev](./apps/starkow.dev/README.md)

## shoutbox reactions

the shoutbox reactions are pre-rendered from apple color emoji so everyone sees the same glyphs. each entry in `ALLOWED_REACTIONS` is mapped to its unicode codepoints, rendered at 128×128 against a local apple color emoji font, and written to `apps/starkow.dev/public/reactions/`. the frontend loads the png and falls back to the native emoji on error.

---

<div align='center'>

<b>made by [starkow](https://starkow.dev)</b>

</div>