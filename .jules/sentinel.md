## 2025-10-26 - [Unprotected Debug Endpoint in Production]
**Vulnerability:** Found `apps/web/app/api/inspect-system-messages/route.ts` which exposes internal database table content without authentication.
**Learning:** Debug endpoints created during development often get left behind and deployed if not flagged or excluded. They provide easy information gathering vectors for attackers.
**Prevention:**
1. Use distinct file naming conventions for debug scripts (e.g., `_debug.ts`) and exclude them from build/deploy.
2. Ensure all API routes have explicit authentication checks, even if they seem harmless.
3. Regularly audit `app/api` folder for unrecognized endpoints.
