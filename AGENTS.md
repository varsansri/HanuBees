<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design Library continuity

Before doing any work on the HanuBees Design Library, read these files in full:

- `PROJECT_STATE.md`
- `docs/DESIGN_LIBRARY_REQUEST_LOG.md`
- `docs/DESIGN_LIBRARY_REFERENCE_QUEUE.md`

Treat them as the durable handoff between sessions. Update `PROJECT_STATE.md` after every meaningful implementation, verification, packaging, deployment, or decision. Preserve the user's requests in the request log. Work through the reference queue one design at a time, and do not begin the next design until the user explicitly gives permission.
