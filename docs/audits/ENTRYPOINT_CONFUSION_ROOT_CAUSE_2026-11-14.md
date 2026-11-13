# Why the app entry-point decision became confusing

Audit completed: 14 November 2026 (Asia/Saigon), covering the 13 November integration history. Workspace: `E:\test`.
Audited revision: `71dfdc6acbcffbed46d88ceafb3b0a21f6f2289e` on `agent-a/api`.
Scope: the screenshot's startup choices, their Git history, product scope, implementation boundaries, build configuration, documentation, and evidence provenance.

## Conclusion

The confusion comes from two independently developed application architectures being combined without a single reconciled application contract. The entry-point question exposes that conflict; changing the startup import cannot resolve it.

One line of work implements a connected laptop adviser with M3 Expressive components, a flat retailer catalog, AsyncStorage, and local AI or FastAPI advice. Another implements the requested Phone / Tablet / PC selection journey, a richer ranked profile, SQLite reference catalogs, signed catalog updates, and a different native AI module. Both call their result the current adviser. They share a package identity, folder, output names, and even a default server port, while their contracts differ.

The merge at `71dfdc6` restores the connected laptop entry points, retains the full-category source and its current-system documentation, removes dependencies needed by that retained source, and changes the declared framework versions. Existing passing checks exercise only part of this combination. This is an integration and release-definition problem with concrete reproducibility defects.

Severity here describes engineering impact: High blocks or materially changes the intended journey or its reproduction; Medium creates misleading decisions or evidence. These findings do not establish a deployed production incident.

## 1. What changed since the first audit

The first audit inspected `061c0b2`; `dd3d3ee` was unavailable then. The current reflog records an external fast-forward from `061c0b2` to `71dfdc6` at 23:54:03 +07:00. The current checkout now contains the screenshot's commit and the later merge. This audit did not perform that pull.

The first audit's statements about unavailable files were accurate for its inspected revision but are superseded by the current checkout. This report directly examines the now-available commits. Remote GitHub freshness remains unverified; the earlier network check failed DNS resolution.

## 2. Git reconstruction

The merge base of `dd3d3ee` and `9e34b83` is `43e2833`.

```text
43e2833  shared ancestor
  |-- 4d4b3ba -- 061c0b2 -- dd3d3ee -----+
  |                                     |-- 71dfdc6
  +-- main history -------- 9e34b83 ------+
```

| Revision | Relevant change | Startup behavior |
|---|---|---|
| `de6b0d8` / subsequent connected work | Entry points select the connected adviser | `AdviserApp` |
| `061c0b2` | Connected laptop improvements, M3 work, governance/evaluation code and 0.4.0 artifact | `AdviserApp` |
| `9e34b83` | FastAPI/PostgreSQL backend, API client helpers, default endpoint and advice fallback | `AdviserApp` |
| `dd3d3ee` | Adds full-category system and changes both startup imports | `DemoLauncher`, initially `DeviceAdvisorApp` |
| `71dfdc6` | Merges `dd3d3ee` and `9e34b83`; selects connected startup and retains other system files | `AdviserApp`; no route to the retained launcher |

On 13 November, `9e34b83` was committed at 23:07:30 +07:00; `dd3d3ee` has author time 23:06:52 and commit time 23:25:05; the merge was committed at 23:47:51. Author time alone would misorder the commits. File changes and parent relationships establish the sequence used here.

The screenshot accurately describes the entry-point change introduced by `dd3d3ee`. It describes a historical branch state, rather than the final merged entry points.

Reproduce:

```powershell
git show dd3d3ee -- apps/adviser/index.js apps/adviser/src/main.web.tsx
git diff dd3d3ee 71dfdc6 -- apps/adviser/index.js apps/adviser/src/main.web.tsx apps/adviser/app.json apps/adviser/package.json
git show -s --format=fuller dd3d3ee 9e34b83 71dfdc6
git merge-base dd3d3ee 9e34b83
```

## 3. The competing systems

| Aspect | Connected adviser | Full-category Device Advisor | Legacy demo |
|---|---|---|---|
| Main component | `src/AdviserApp.tsx` | `src/DeviceAdvisorApp.tsx` and `ReferenceExplorer.tsx` | `src/AndroidApp.tsx` |
| Reachable from current startup | Yes, native and web | No route from current root | No route from current root |
| Selection contract | Budget, RAM, storage, OS, laptop task list | Phone / Tablet / PC; exactly three ranked purposes and three ranked priorities; category-specific questions and review | Historical synthetic laptop picker |
| Domain and data | `catalog.ts`, `real-catalog.json` | `device-profile.ts`, `advisor-engine.ts`, `reference.ts`, `reference-seed.json` | `domain.ts`, `picker.ts`, fixture data |
| Persistence | AsyncStorage, `lua-connected-adviser-v1` | SQLite; `device-advisor-v1` draft/confirmed/settings keys | AsyncStorage, `lua-android-v2` and old migration keys |
| Catalog protocol | `/v1/catalog`, plain catalog response | `/advisor/v1/manifest` and signed versioned bundle | Embedded fixtures |
| Native AI interface | `NativeModules.AdviserLocalAi` | Expo module `DeviceAdvisorNative` | Historical demo AI client |
| Principal documentation | Root README, connected-service README, frontend status | App README opening, `DEVICE_ADVISOR_SYSTEM.md`, BRD opening contract | Historical portions of app README and demo history |

`DemoTwo.tsx` is a fourth retained intermediate flow, with `lua-integration-demo2-v1` storage. Its name does not mean it is the component currently used for the full-category Demo 2. `App.tsx` is also retained as a historical browser prototype. File presence and a shared product name do not establish that these implementations are integrated.

## 4. Findings and causal evidence

### F01 — High: the selected runtime and the documented current scope disagree

`index.js:2` and `src/main.web.tsx:3` select `AdviserApp`. `brd.md:14` records the later full-category Demo 2 contract. `apps/adviser/README.md:3` and `DEVICE_ADVISOR_SYSTEM.md:5` describe the installed/current experience as the full-category reference flow. The current root has no route to that flow.

Consequence: a reviewer can follow the current documentation and launch a different product journey. Restoring the connected root also makes full-category work appear to have disappeared despite its source remaining present.

Cause: runtime selection and scope documentation were merged independently. The merge message promises M3 and FastAPI preservation but does not specify how the full-category contract is fulfilled.

### F02 — High: retained Device Advisor code is missing required dependencies

`src/demo-storage.ts:1` and `catalog-database.ts:1` import `expo-sqlite`; it is absent from current package dependencies, lockfile and installed modules. `scripts/test-device-system.mjs:6` imports `react-test-renderer`, which is also absent. The diff from `dd3d3ee` to the merge explicitly removes both dependencies and `expo-build-properties` while retaining the Device Advisor files and test commands.

Observed failure: `npm run test:device-system` exits 1 with `ERR_MODULE_NOT_FOUND` for `react-test-renderer`. SQLite's native runtime absence follows directly from the imports and dependency inventory; a native Device Advisor launch was not attempted.

`src/expo-sqlite.d.ts` supplies a TypeScript module declaration. It allows type checking without supplying the actual runtime library. This explains one reason `npm run check` can pass while this integration is incomplete.

### F03 — High: the full-category native implementation was omitted from Git

`modules/device-advisor/expo-module.config.json` names `expo.modules.deviceadvisor.DeviceAdvisorNativeModule`, and the recorded manifest lists a Kotlin implementation and Android build file. Neither exists in this checkout or in the Git tree for `dd3d3ee`; that module tree contains only its configuration file.

`git check-ignore -v --no-index` identifies `apps/adviser/.gitignore:11`, the unanchored `android/` rule, as excluding both:

- `modules/device-advisor/android/src/main/java/expo/modules/deviceadvisor/DeviceAdvisorNativeModule.kt`
- `modules/device-advisor/android/build.gradle`

This defect already exists in the committed `dd3d3ee` tree; it should not be attributed solely to the merge. Historical evidence describes a working local uncommitted tree in `C:/Users/luken/test`. The available evidence supports a local-to-Git handoff gap: locally present native files could be tested but then omitted from the committed source.

The connected app's separate `native/adviser/LocalAiModule.kt` is tracked. Preserving it does not provide the differently named Expo module or its signature API.

### F04 — High: three services compete for one default port with different contracts

| Service | Default bind | Contract/data source |
|---|---|---|
| FastAPI, `backend/config.py:20` | loopback, 8788 | `/v1/catalog`, `/v1/advice`, laptop APIs, PostgreSQL |
| Node connected service, `services/adviser/server.mjs:364` | loopback, 8788 | `/v1/catalog`, reports/governance, repository JSON |
| Signed publisher, `scripts/catalog-server.mjs:98` | loopback, 8788 | `/advisor/v1/manifest`, signed bundles from reference seed |

The connected API and the signed publisher are incompatible wire protocols. Running one does not satisfy the other's client. With default configuration, these service processes also compete for the same address/port; distinct configuration is necessary to run them together.

The app's `service:adviser` script starts Node, whereas the FastAPI work resides under `backend/`. The two connected services overlap in routes but differ in data authority and features. Entering `http://127.0.0.1:8788` does not identify which one is serving.

Consequence: users and developers can see connection failures, wrong data, missing routes, or different AI behavior while believing they followed the right backend instructions. A launcher does not fix this.

### F05 — High: dependency declarations, installed tools and recorded build matrix describe different environments

| Package | Current declared/locked version | Installed during audit |
|---|---|---|
| Expo | `~58.0.25` / `58.0.25` | `54.0.38` |
| React | `19.3.0` | `19.1.0` |
| React Native | `0.88.1` | `0.81.5` |
| expo-modules-core | transitive lock `58.1.0` | `3.0.30` |

The Device Advisor documentation still describes SDK 54 / RN 0.81.5, Kotlin 2.3.21 and Prompt beta5. The active `with-local-ai.cjs` instead configures Kotlin 2.2.10 and Prompt beta4; the full-category plugin configuration was removed from `app.json` by the merge.

These are inspected repository/local facts, not a claim about externally supported package releases. A clean dependency installation was not performed, and the declared SDK stack was not validated. Passing local checks therefore apply to the installed older dependency tree, not a reproduction of the current lockfile.

### F06 — Medium: app variants use separate profile and saved-decision contracts

`AdviserApp` persists its own `Requirements` in AsyncStorage. The full-category app persists ranked `DeviceProfile` data through SQLite. The historical demo and intermediate `DemoTwo` have further keys. No root-level shared profile or migration connects the active connected app to the full-category app.

Consequence: switching entry points can produce apparently missing settings/history, different selection counts and different recommendation behavior. Those observations do not by themselves demonstrate data deletion. Sharing the app package does not make the stores interoperable, and silently converting unordered laptop tasks into confirmed ranked multi-category purposes would be invalid.

### F07 — Medium: “AI” and “connected” have multiple meanings

In the current `AdviserApp.tsx:451`, local native bridge presence selects local advice; server fallback is selected only when the bridge is absent. A present but unsupported bridge does not automatically choose server advice. The full-category app calls a different module. Expo Go, web and a standalone native app can consequently select different behavior.

FastAPI health reports `rules_fallback`, while `backend/services/advice_service.py` constructs deterministic fact-based advice and returns `mode="provider"`. The Node CLI initializes its service with no cloud provider. UI text at `AdviserApp.tsx:1560` labels a server as connected based on a nonempty endpoint, independently of the catalog refresh status.

Consequence: “Fetch API,” “FastAPI,” “AI on device,” “provider,” and “connected” can be mistaken for equivalent capabilities or successful inference. Fetch is the transport mechanism; the response semantics and device capability must be identified separately.

### F08 — Medium: multiple documents retain conflicting present-tense claims

The root README describes the connected laptop 0.4.0 release. The app README opens with the full-category demo, later documents SDK 54 and synthetic fixtures, and at line 103 identifies `AndroidApp.tsx` as the current screens. The implementation plan accumulates progress notes from successive prototype stages. `brd.md:14` records the full-category override while sections 5 and 7.1 still describe laptop-first sequencing and at most two secondary preferences.

The BRD's opening override makes the intended Demo 2 exception more explicit, but readers must infer which old statements are historical and which still govern another release. The problem is incomplete supersession and version scoping, rather than evidence that all historical documents were intended to be active simultaneously.

### F09 — High: release artifacts and verification are not bound to the merged runtime

The full-category verification manifest names workspace `C:/Users/luken/test`, an uncommitted shared tree, SDK 54 and `lua-device-advisor-full.apk`. That APK is absent in this checkout. The manifest remains useful historical evidence but cannot establish the current merged app's behavior.

The present `lua-adviser-demo.apk` matches its recorded SHA-256:

```text
560ff20ae8fa60e3b0e6aedf25cd1100a1e508e8b78d1b7be18355d063f559b5
```

Its manifest records packaging at 21:16:54 +07:00 on 13 November, before `dd3d3ee` and the 23:47 merge. The artifact is therefore not evidence of a build of the merged revision. `package-android.ps1` records a hash/version and generic scope but no commit or entry-point identity.

The same `vn.lua.adviser` package and common demo artifact name span different experiences. The separate full-category app config used version 0.3.0/code 1, while the connected app and merge use 0.4.0/code 2. These identities make it easy to compare source, screenshots and APKs from different states without noticing.

### F10 — Medium: green checks do not cover the startup decision

The unit suite validates domains, clients and stores, not a complete root-selected Android build. The component suite explicitly bundles `DeviceAdvisorApp` directly with native/storage mocks; it does not assert that `index.js` or `main.web.tsx` reaches it. Catalog tests replace the Expo SQLite adapter and native cryptography with controlled implementations. These are useful bounded tests but cannot detect every packaging or native-source omission.

The current CI workflow includes the component command that fails locally, so there is an intended opportunity to catch part of the issue. Its actual remote execution/status was not inspected. The listed workflow has no Android build step or check that binds documentation, root route and released APK to one scope.

## 5. Why the screenshot's choices are misleading

| Choice | Assessment |
|---|---|
| 1. Keep `AdviserApp` as recommended main screen | Reasonable only for an explicitly selected connected laptop release. It does not fulfill the documented full-category flow and does not establish a working FastAPI connection. |
| 2. Use launcher and add `AdviserApp` | Useful as a development comparison tool after repairing dependencies/native packaging. It preserves multiple implementations but does not unify their profile, data, UI or protocol contracts. |
| 3. Default to `DemoLauncher / DeviceAdvisorApp` | Matches `dd3d3ee`'s startup and full-category selection direction, but that committed source has native handoff gaps and the merged dependency configuration is incomplete. |

The launcher itself starts with `useState(2)`, so it opens Device Advisor immediately rather than initially showing a choice screen. It has only Demo 1 and Demo 2; it does not import `AdviserApp`. Demo 1 receives no exit callback. Thus the proposed three-way switch and symmetric return behavior require implementation.

The prompt conflates at least six decisions: product scope, default route, component design system, catalog authority/protocol, persistence/migration, and AI routing. Its recommended label favors a particular implementation before resolving those decisions. The screenshot does not provide enough evidence to infer the author's reasoning or any user's submitted answer.

## 6. Root causes and contributing factors

1. **Two architectures owned overlapping product responsibilities.** Both introduced their own needs model, catalog path, persistence and AI interfaces under the same app folder.
2. **The merge reconciled files more completely than behavior.** Startup and configuration selected one architecture; retained source, tests and current-system documents still described the other.
3. **Local verification was not equivalent to a reproducible committed handoff.** The full-category native source was hidden by a broad ignore rule; its historical evidence came from another uncommitted checkout.
4. **Checks were bounded to components and installed dependencies.** Domain passes and a web build did not prove the unselected native flow or current lockfile stack.
5. **Documentation and release identity lacked an enforced scope/version binding.** Old and new flows share product labels, package identity and familiar output paths.

These conclusions concern observable repository behavior. They do not assign blame or establish which contributor made an unrecorded product decision.

## 7. Recommended resolution

The latest recorded full-category Demo 2 contract should remain the scope reference unless the user explicitly changes it. The connected laptop app is a useful integration source; selecting it as the root alone does not complete that contract.

| Order | Concrete deliverable | Completion evidence |
|---|---|---|
| 1 | One short application contract identifying the intended release journey, default route, catalog authority, offline behavior, AI routing and retained legacy demos | Every active document links to that contract; historical descriptions identify their scope |
| 2 | Reproducible dependency/native handoff | Restore required runtime/test packages with one compatible SDK matrix; track custom native source; use an anchored ignore rule for generated host files; clean installation and native build pass |
| 3 | Explicit service contracts | Choose one catalog authority or implement a named adapter; separate ports if services coexist; distinguish Node, FastAPI and signed publisher commands; identify service kind/version in health/status |
| 4 | A coherent full-category application | Reuse the M3 components and connected capabilities within the full-category journey; declare data coverage and unsupported category operations; define explicit profile/history migrations where justified |
| 5 | Verification of actual startup and failure paths | Test native/web roots, three-category review flow, correct server protocol, offline operation, absent/unsupported model behavior and saved-decision preservation |
| 6 | One new release manifest and artifact | Include commit, dirty-state status, selected entry, category scope, catalog/rule versions, dependency matrix and APK hash; build after integration and install that exact APK |

A comparison launcher can be retained for development, with clear names and return controls. It should not substitute for deciding which application fulfills the release contract. There is no need to discard either implementation to make that decision reviewable.

## 8. Verification performed for this report

| Check | Observed result | Boundary |
|---|---|---|
| Git graph, merge parents, relevant diffs and reflog | Inspected directly | Local refs; current remote freshness not established |
| `npm run check` | Passed | Installed dependency tree, not clean current lockfile installation |
| `npm test` | 104 passed, 0 failed | Unit/domain/client/store coverage |
| `npm run test:device-system` | Failed: missing `react-test-renderer` | Fails before component assertions |
| `npm run build` | Passed, generated self-contained web preview | Current `AdviserApp` graph; warnings for ignored module directives and large chunk; no browser journey or Android validation |
| Declared, locked and installed dependency inventory | Mismatches confirmed; SQLite and test renderer absent | Local package files inspected directly |
| Git native-module inventory and ignore diagnosis | Full-category Android implementation absent and excluded | Confirmed in current and `dd3d3ee` trees |
| APK existence and hash | Connected artifact matches manifest; full-category APK absent | No APK installed or rebuilt during audit |

No dependency installation, backend database test, cloud/model call, Android build, deployment, or application behavior change was performed. Running the existing web build refreshed generated preview output; Git remained clean before adding this report. Successful older emulator records are treated as historical evidence, not as verification of `71dfdc6`.

## 9. Primary evidence locations

- Startup: `apps/adviser/index.js:2`, `apps/adviser/src/main.web.tsx:3`, `apps/adviser/src/DemoLauncher.tsx:6`.
- Scope: `brd.md:14`, `brd.md:70`, `brd.md:98`, `apps/adviser/README.md:3`, `apps/adviser/README.md:103`, `apps/adviser/DEVICE_ADVISOR_SYSTEM.md:5`.
- Dependency/runtime split: `apps/adviser/package.json:33`, `apps/adviser/package-lock.json`, `apps/adviser/src/expo-sqlite.d.ts:1`, `apps/adviser/src/demo-storage.ts:1`, `apps/adviser/scripts/test-device-system.mjs:6`.
- Native handoff: `apps/adviser/.gitignore:11`, `apps/adviser/modules/device-advisor/expo-module.config.json`, `apps/adviser/src/device-ai.ts:19`, `apps/adviser/plugins/with-local-ai.cjs`.
- Services: `backend/config.py:20`, `backend/main.py`, `services/adviser/server.mjs:364`, `apps/adviser/scripts/catalog-server.mjs:98`, `apps/adviser/src/catalog-sync.ts:39`, `apps/adviser/src/adviser-client.ts`.
- Runtime AI/status: `apps/adviser/src/AdviserApp.tsx:451`, `apps/adviser/src/AdviserApp.tsx:1560`, `backend/services/advice_service.py:166`.
- Release evidence: `apps/adviser/scripts/package-android.ps1`, `apps/adviser/artifacts/lua-adviser-demo.manifest.json`, `apps/adviser/verification/device-system-build.json`.
- Coverage: `.github/workflows/device-advisor.yml`, `apps/adviser/scripts/test-device-system.mjs:19`, `apps/adviser/scripts/test-catalog-system.mjs:10`.

The numbered source locations and Git revisions above are the evidence for the findings. Statements about historical acceptance remain limited to what the recorded artifacts support.
