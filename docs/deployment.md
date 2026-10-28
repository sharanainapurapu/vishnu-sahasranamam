# Deployment Guide

This project deploys to **GitHub Pages via GitHub Actions**. Every push to `main`
builds the app and publishes it automatically — there is no manual deploy step.

**Live App:** https://sharanainapurapu.github.io/vsn/

## How it works

- `.github/workflows/deploy.yml` runs on every push to `main`.
- It installs dependencies, runs `npm run build`, and uploads `dist/` as a Pages artifact.
- GitHub Pages serves that artifact. The Pages **Source** must be set to **GitHub Actions**.
- `vite.config.js` sets `base: '/vsn/'` in production so asset URLs resolve under the repo path.

## One-time setup (already done for this repo)

1. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Ensure `vite.config.js` `base` matches the repository name (`/vsn/`).

If you fork this project under a different repo name, update `base` to `/<your-repo-name>/`.

## Releasing a change

```bash
git add <files>
git commit -m "Describe the change"
git push origin main
```

That's it — the Actions workflow builds and deploys. Watch progress in the repo's
**Actions** tab; the live site updates a minute or two after the run turns green.

> Note: the `npm run deploy` script (`gh-pages -d dist`) is **not** used for this project.
> It would push to a `gh-pages` branch, which conflicts with the Actions/Pages source.
> Prefer the push-to-`main` flow above.

## Local verification before pushing

```bash
npm run build      # production build into dist/
npm run preview    # serve the built app locally to sanity-check
```

## Troubleshooting

**Blank page after deploy** — the `base` in `vite.config.js` must match the repo name (`/vsn/`).

**404s on assets** — confirm Pages Source is "GitHub Actions" and the latest workflow run succeeded (Actions tab).

**Audio not loading** — `public/audio/full_slokas.m4a` must be committed; it is served from `/<base>/audio/...`.

**Workflow failed** — open the failed run in the Actions tab and read the step log; most failures are dependency or build errors reproducible locally with `npm install` + `npm run build`.

## Custom domain (optional)

1. Add a `CNAME` file in `public/` containing your domain (e.g. `vsn.example.com`).
2. Add a CNAME DNS record pointing to `sharanainapurapu.github.io`.
3. Push and wait for DNS propagation.

## References

- [Vite static deploy guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages docs](https://docs.github.com/en/pages)
