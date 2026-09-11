# RolPusula

An open-source, local-first job application workspace with a Chromium extension.
The distribution contains **blank templates only**, never a real candidate's resume.

Download the source ZIP from GitHub. Enable developer mode on chrome://extensions
or edge://extensions, choose **Load unpacked**, and select the extension directory.
Comet supports most Chrome extensions; this build still needs Comet-specific testing.
There is no Chrome Web Store or Edge Add-ons listing yet.

The extension saves user-selected postings in a passphrase-encrypted vault, compares
user-defined keywords, and exports one reviewed job package. It has no network
requests, telemetry, background crawling, sync storage or AI account access.

For AI workflows install Node 22+ and choose Claude Code, OpenAI Codex, Gemini CLI,
or Codex CLI backed by a local Ollama model. Bun is used for portal search; Python
3.10+/pypdf and LuaLaTeX/XeLaTeX are used for PDF production and checks.

    node bin/rolpusula.mjs providers
    node bin/rolpusula.mjs init ../my-applications --provider codex
    node bin/rolpusula.mjs doctor ../my-applications
    node bin/rolpusula.mjs launch ../my-applications
    node bin/rolpusula.mjs import "/downloads/package.rpjob.json" ../my-applications

Claude and Gemini use `/setup`; Codex and local Ollama use `$rolpusula setup`.
Run the provider-specific apply-local instruction printed by import. You can switch
providers later without moving candidate files:

    node bin/rolpusula.mjs provider set ../my-applications gemini
    node bin/rolpusula.mjs provider set ../my-applications ollama --model qwen3:8b
The canonical workflow evaluates fit, drafts a tailored CV/cover letter, runs a
reviewer agent, then compiles and checks PDFs. Applications are not auto-submitted.

**Privacy boundary:** the extension vault is encrypted, but exported job packages
and private-workspace documents are plaintext. Claude, Codex, and Gemini process
provided context through their respective cloud providers. Ollama inference is
local, but separately approved web research can still use the network. RolPusula
stores no API key. Keyword percentages are not ATS scores.
See [Privacy](PRIVACY.md), [Installation](docs/INSTALL.md), and [Testing](docs/TESTING.md).

    npm test
    npm run check
    npm run build

MIT. Based on [AI Job Search by Mads Lorentzen](https://github.com/MadsLorentzen/ai-job-search).
Upstream attribution and SIL OFL font licenses are included.
