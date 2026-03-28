# PhoenixClaw Mission Control Execution Plan

## Goal
Build a runnable first-pass PhoenixClaw Mission Control application from a greenfield workspace, while creating and maintaining the canonical EARS-compliant master ledger in the project root.

## Current Phase
- `complete` Planning artifacts and the canonical ledger.
- `complete` Next.js workspace scaffold and dependency installation.
- `complete` Domain model, seeded data, gateway-safe config, and URL resolver.
- `complete` Mission-control shell and primary views.
- `complete` Mockup approval and export pipeline.
- `complete` Gateway-routed control plane, live mission store, and scoped telemetry surfaces.
- `complete` Persisted mission-state storage, route mutations, and major-surface state handling.
- `blocked` Final Giles deployment validation. Local implementation and verification are complete, but Giles is still serving the legacy control surface instead of this app.

## Phases
1. `complete` Planning artifacts and master ledger.
2. `complete` Next.js workspace scaffold and dependency installation.
3. `complete` Domain model, seeded data, gateway-safe config, and URL resolver.
4. `complete` Mission-control shell and primary views.
5. `complete` Mockup approval and export pipeline.
6. `complete` Gateway-routed control plane and live activity layer.
7. `complete` Persisted mission-state storage and major-surface state handling.
8. `complete` Tests, verification, and ledger evidence updates.
9. `blocked` Publish PhoenixClaw behind Giles and rerun the Giles gateway verification.

## Constraints
- User-facing URLs must never expose `localhost`, `127.0.0.1`, or private IPs.
- Giles is the gateway. Nexus is a host/node.
- App must run from any node for development without machine-specific assumptions.
- Brand assets already exist in the workspace and must be integrated.
- Implementation is proceeding before formal mockup signoff by explicit user instruction.

## Verification Targets
- `pnpm test`
- `pnpm lint`
- `pnpm build`

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Windows patch path rejected a large apply_patch batch with `The filename or extension is too long.` | 1 | Split implementation into smaller patch batches by subsystem. |
| `next lint` failed because Next 15 deprecated the internal lint path and `eslint-config-next` flat-config patching was unstable. | 1 | Switched to ESLint CLI, added `.eslintrc.json`, and pinned ESLint 8. |
