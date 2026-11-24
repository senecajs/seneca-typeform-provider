# Changes

## 0.3.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was `>=3`). Seneca 3
  users stay on `@seneca/typeform-provider@0.2`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* `@seneca/maintain` is no longer a runtime dependency. It was never used by
  the plugin.
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`). Without credentials the form tests run against a
  local mock of the Typeform API, with a dummy `TYPEFORM_ACCESSTOKEN`; with
  `test/local-config.js` or the environment variable `TYPEFORM_ACCESSTOKEN`
  they call the Typeform API. The form create and update test runs only
  against the mock. Live calls were not tested on Seneca 4.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0` and `seneca-msg-test`
  `^5.0.0`. Removed the unused `node-fetch` and `@seneca/doc`, and
  `test/quick.js`, which needed a package that is not installed.
* README and `package.json` describe the Typeform API instead of Webflow; the
  README has a Seneca 4 install line and loads plugins by full name.
* `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
