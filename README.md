# starkow.dev monorepo

this is monorepo of starkow.dev and other subdomain websites.

- [fwd.starkow.dev](./apps/fwd.starkow.dev/README.md)
- [starkow.dev](./apps/starkow.dev/README.md)

## shoutbox reactions

the shoutbox reactions are pre-rendered from apple color emoji so everyone sees the same glyphs.
each entry in `ALLOWED_REACTIONS` is mapped to its unicode codepoints, rendered at 128×128 against a local apple color emoji font,
and written to `apps/starkow.dev/public/reactions/`. the frontend loads the png and falls back to the native emoji on error.

## where is the server-side?

server-side is not exposed in this repository. it **might** be at some point, but currently - no, it's not there.

actually, this repository is not even the origin; the origin is located
at [git.nova.tokyo/alice/starkow.dev](https://git.nova.tokyo/alice/starkow.dev) which you don't have access to.
it exposes server-side and all hidden folders/files, but then there's this `scripts/mirror-to-github.sh` script that
i run every time i push to [git.nova.tokyo](https://git.nova.tokyo/alice/starkow.dev) which edits commits and hides
everything that i chose to hide. 😈😈😈

---

<div align='center'>

<b>made by [starkow](https://starkow.dev)</b>

</div>