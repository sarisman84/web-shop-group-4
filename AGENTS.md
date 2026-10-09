<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Environment gotcha: SWC native binding

On this machine `/home` is owned by another user, so SWC's default cache
root (`~/.cache`) fails its security check. `npm run dev` / `npm run build`
then die with `Failed to load next.config.ts` → `Failed to load native
binding` / `ERR_SWC_NATIVE_CACHE`.

Fix (idempotent, run after a fresh `npm install` if that error appears):

```sh
npm run fix:swc
```

It materializes the binding into a safe cache root and copies it into
`node_modules/@swc/core/`. Manual fallback:
`SWC_NATIVE_BINDING_CACHE=/swc-cache npm run dev`.
