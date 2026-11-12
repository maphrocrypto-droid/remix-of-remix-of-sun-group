<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- All pages share one bilingual copy file (`src/lib/sungroup-content.ts`); pages never hardcode copy, so FA/EN and content edits stay in sync.
- Brand colors live as semantic tokens in `:root` of `src/styles.css`; components only use token utilities so the palette can change in one place.
- Every page wraps its content in `SiteShell` (`src/components/site/`) for the shared header, nav, language toggle and footer, so navigation stays consistent.
- Shared mobile navigation uses a width-constrained grid of visible links instead of a horizontal scroller, keeping every section accessible without overflow in either language.
- Retired sample URLs (`/sun`, `/holding`, `/global`) are kept as redirects to `/` so old shared links keep working.
- Language is carried in the `?lang=en` search param (Persian/RTL is the default); pages use logical spacing (and the `rtl:` variant follows the nearest `dir`) (`ps/pe/start/end`) so both directions work.
- The home intro (`IntroSplash`) is pure CSS on one shared timeline with the hero (`--intro` offset) and plays once per full page load, so it starts before hydration and never replays on in-app navigation.
