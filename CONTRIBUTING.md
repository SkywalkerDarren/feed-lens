# Contributing

Use Node.js 22+ and Python 3.9+. Run `npm test` and `npm run package` before opening a pull request. There are no npm dependencies to install.

Keep each platform's labels and enabled state independent. New platform adapters must exclude private messages and unpublished editor content, avoid duplicate extraction, and handle virtualized cards. Document new host permissions and data flows in the privacy policy and store declarations.

Use synthetic post fixtures. Never commit API keys, cookies, browser profile data, private posts or screenshots containing personal account information. Report security issues through the private channel described in SECURITY.md.

For DOM/UI changes, record manual checks on supported sites and make clear whether they used fixtures or live pages. Include the Chrome version and reproduction steps without exposing private content.

Contributions are licensed under Apache-2.0, the same license as this project.
