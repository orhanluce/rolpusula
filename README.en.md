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

For AI workflows install Node 22+, Claude Code with your own account, Bun for portal
search, Python 3.10+/pypdf, and a TeX distribution with LuaLaTeX and XeLaTeX.

    node bin/rolpusula.mjs doctor
    node bin/rolpusula.mjs init ../my-applications
    node bin/rolpusula.mjs import "/downloads/package.rpjob.json" ../my-applications

Open Claude in your private workspace, run /setup, then the /apply-local command
printed by import. You can also use /scrape and /apply with a job URL.
The canonical workflow evaluates fit, drafts a tailored CV/cover letter, runs a
reviewer agent, then compiles and checks PDFs. Applications are not auto-submitted.

**Privacy boundary:** the extension vault is encrypted, but exported job packages
and private-workspace documents are plaintext. Claude processes provided context
through Anthropic, not offline inference. Keyword percentages are not ATS scores.
See [Privacy](PRIVACY.md), [Installation](docs/INSTALL.md), and [Testing](docs/TESTING.md).

    npm test
    npm run check
    npm run build

MIT. Based on [AI Job Search by Mads Lorentzen](https://github.com/MadsLorentzen/ai-job-search).
Upstream attribution and SIL OFL font licenses are included.
