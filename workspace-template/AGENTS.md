---
framework_version: 1.1.0
---

# RolPusula agent guidelines

This workspace is structured to manage job search activities, scraper tools, CVs, cover letters, and interview preparation.

## Thin-Pointer Design (Single Source of Truth)

To prevent duplication and configuration drift across different AI agent frameworks (Claude Code, Google Antigravity, Codex, Cursor, Gemini CLI, etc.), this workspace uses a unified thin-pointer design. All agent runtimes should load the canonical specifications and candidate profiles from the files and directories below:

Before reading candidate data, read `.rolpusula-provider.json`. It names the AI
runtime the user selected; it never contains an API key. State whether that
runtime is cloud-based or local. Do not silently invoke a second provider.

1. **Personal Candidate Profile:**
   - The candidate profile, contact details, education, and target preferences are defined in [CLAUDE.md](CLAUDE.md) and the individual profile methodology files under [.claude/skills/job-application-assistant/](.claude/skills/job-application-assistant/) (specifically `01-*.md` etc.).
2. **Canonical Workflow Specifications:**
   - The step-by-step instructions and triggers for tasks (setup, scrape, rank, apply, upskill, interview) are defined in the [.claude/](.claude/) directory (specifically under `.claude/skills/` and `.claude/commands/`).
   - Do not duplicate these rules or specifications. Treat `.claude/` files as the single source of truth.
3. **Portal Search Skills:**
   - Job-portal search CLIs live under [.agents/skills/](.agents/skills/) in the portable Agent Skills format (with a `SKILL.md` per portal). Codex and Antigravity discover these automatically; the `/scrape` workflow in [.claude/skills/job-scraper/](.claude/skills/job-scraper/) orchestrates them.

## Runtime commands

- Claude Code: `/setup`, `/scrape`, `/apply`, `/apply-local`.
- Codex or Codex with local Ollama: `$rolpusula setup`, `$rolpusula scrape`,
  `$rolpusula apply <URL or text>`, `$rolpusula apply-local <UUID>`.
- Gemini CLI: the matching `/setup`, `/scrape`, `/apply`, `/apply-local`
  commands are defined under `.gemini/commands/`.

If the runtime lacks a separate subagent mechanism, perform the reviewer step as
a fresh, explicitly separated second pass. Do not call it an independent model.
Never submit an application without a separate explicit user request.
