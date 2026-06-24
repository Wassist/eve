# Releasing `@wassist/eve`

The package lives in the monorepo at `packages/eve/` but ships from its own dedicated GitHub repo (`github.com/Wassist/eve`) — same pattern as [`@wassist/sdk`](../sdk/RELEASING.md) and [`@wassist/cli`](../cli/).

## One-time setup

These steps only need to happen once per package; subsequent releases just use the normal flow below.

### 1. Create the dedicated GitHub repo

Create an empty public repo at https://github.com/Wassist/eve (no README, no LICENSE — we'll push those in).

### 2. Wire the local git remote

From the monorepo root:

```bash
git remote add eve git@github.com:Wassist/eve.git
```

### 3. First subtree push

```bash
npm --prefix packages/eve run push
```

This is equivalent to:

```bash
git subtree push --prefix=packages/eve git@github.com:Wassist/eve.git main
```

It splits out a synthetic history containing only `packages/eve/**` and pushes it to the `main` branch of `Wassist/eve`. After this push the Deploy-to-Vercel button in the README starts working.

### 4. Add the npm token secret

In **Wassist/eve → Settings → Secrets and variables → Actions**, add a secret named `NPM_TOKEN` set to an npm automation token with **publish** access to the `@wassist` org. The `publish.yml` workflow consumes it as `${{ secrets.NPM_TOKEN }}`.

> Already have `NPM_TOKEN` set for the CLI or SDK? It's the same token — just add it to the eve repo too.

### 5. Reserve the package name on npm

The first publish will create `@wassist/eve` on the npm registry under your org. Make sure the `@wassist` org exists and that the npm token has access to it.

## Cutting a release

1. Bump `version` in `packages/eve/package.json` and update `CHANGELOG.md`.
2. Commit and merge to `main`.
3. Push the subtree:

   ```bash
   npm --prefix packages/eve run push
   ```

4. On `github.com/Wassist/eve`, create a GitHub release tagged `vX.Y.Z`. The `publish.yml` workflow picks up the release event and runs:

   ```bash
   npm ci
   npm run build
   npm publish --provenance --access public
   ```

5. Confirm the release at https://www.npmjs.com/package/@wassist/eve.

## Local sanity checks before releasing

```bash
cd packages/eve
npm run typecheck                  # tsc --noEmit
npm run build                      # tsup → dist/{index.js,index.cjs,index.d.ts,index.d.cts}
node --input-type=module -e "import { wassistChannel } from './dist/index.js'; console.log(typeof wassistChannel)"
node -e "const { wassistChannel } = require('./dist/index.cjs'); console.log(typeof wassistChannel)"
```

Both invocations should print `function`.

## CI

`ci.yml` runs `typecheck` and `build` on Node 18, 20, and 22 for every PR and push to `main`.

## Updating the public package from the monorepo

The canonical source of truth is the monorepo. Always make changes in `packages/eve/` here and use `git subtree push` (above) to publish them to `Wassist/eve`.

Do **not** commit directly to the `Wassist/eve` repo — those commits won't make it back into the monorepo, and the next subtree push will conflict.
