#!/usr/bin/env node

import { $p as orElse, A as Number$2, Aa as context, Ac as currentTimeMillis, Af as get, B as String$6, Bf as Prototype, Bi as now, Bo as orElseSucceed, Bp as getOrElse, Ca as catchFilter, Cf as toMinutes, Cs as timeout, Da as catchTags, Df as Service, Do as mapError, Ds as try_, Ea as catchTag, Ef as Reference, Ep as isSuccess, Er as transformEffect, Es as tryPromise, Et as encodeSync, Eu as pretty, F as Record, Fp as flatMapNullishOr, Fs as void_, Gm as hasProperty, Go as provideService, Gp as isNone, H as Struct, Hl as isFailure, Ho as promise, If as make$3, Ii as make$4, Ip as flatten, J as TrueLiterals, Jc as provideMerge, Jf as findFirstIndex, Jm as isNotUndefined, Km as isFunction, La as ensuring, Li as makeUnsafe, Mp as filter, Nf as getOrUndefined$1, Nm as assignProperty, No as never, Np as firstSomeOf, Nt as is, Oa as catch_, Om as format, Op as succeed$2, Po as onError, Qm as isObjectKeyword, Qp as none, Ra as exit, Ro as option, Sf as toMillis, So as logWarning, Ts as timeoutOrElse, Tt as encodeEffect, Uc as merge, Uf as empty, Ul as isSuccess$1, Uo as provide$1, Us as withSpan, W as TaggedError, Wa as filter$1, Wc as mergeAll, Wm as compose, Wo as provideContext, Wp as getOrUndefined, Xd as taggedEnum, Xo as result, Ya as findFirst$1, Yc as succeed$3, Yf as findLast, Z as URLFromString, Za as flatMap$1, Zi as toUtc, Zp as match$1, _ as Finite, _s as tap, a as BooleanLiterals, bs as tapError, bt as decodeUnknownExit, cp as match, d as Duration, dh as dual, do as ignore, ds as sleep, dt as check, em as some, en as makeFilter, eo as fn, fa as as, fn as toCodecStringTree, fs as succeed$1, g as FalseLiterals, gh as pipeArguments, gi as value, gs as sync, ha as cached, hf as millis, hh as pipe, hi as make$2, hl as MinimumLogLevel, ho as isEffect, hs as suspend, ia as acquireUseRelease, if as fromInput, ja as contextWith, ji as formatIso, jp as exists, jt as fromJsonString, k as NullOr, kf as empty$1, ko as match$2, la as annotateLogs, ma as asVoid, ms as succeedSome, n as ArraySchema, no as forEach, nt as Union, oa as all, ph as identity, pn as toEncoded, po as interrupt, ps as succeedNone, qc as provide, qf as findFirst, qo as raceFirst, qp as isSome, r as Boolean$4, ra as acquireRelease, rf as format$1, rn as optional$3, rp as isReadonlyArrayNonEmpty, rt as Unknown, sa as andThen, sp as map$4, ss as scoped, tm as toArray, to as fnUntraced, u as Defect, uo as gen, up as reduce, v as FiniteFromString, va as callback, vo as logDebug, vt as decodeTo, wa as catchIf, wo as map$3, ws as timeoutOption, x as Literal, xa as catchDefect, xt as decodeUnknownOption, y as Int$5, yf as seconds, yp as fail$1, yt as decodeUnknownEffect, z as SchemaError, za as fail, zo as orDie, zp as fromUndefinedOr, zr as InvalidValue } from "./Schema-znhrSbG8.mjs";
import { $l as isVersionExecutable, $m as makeRunMain, Ah as LogLevel$1, An as ServerEnvironmentIdentity, Ar as loadedPolicy, Au as cliReleaseIndexPageUrl, Ax as AuthRelayReadScope, BS as bearerToken, Bh as mapEffect$1, Bi as resolveCliCommand, By as HttpClient, Ci as CLOUD_ENDPOINT_RUNTIME_CONFIG, Cl as fromLenientJson, Cu as make$5, Cx as AuthMcpClientAccess, Dh as Boolean$5, Du as CLI_RELEASE_CHANNELS, Dw as EnvironmentId, Er as ManagedPolicy, FS as filterStatusOk, Fh as Redacted, Fw as PositiveInt, Ga as OtlpHeadersFromString, Gg as DesktopAppActivationErrorCode, Gw as ThreadId, H as ProjectService, Ha as none$1, Hi as resolveHostCliCommand, Ih as String$7, Ii as isAgentActivityPublishingEnabledValue, Ir as knownDriverLabels, Iw as ProjectId, JS as del, Jm as isQuitError, Ka as OtlpProtocol, Kg as DesktopAppActivationResponse, Km as QuitError, Kn as layer$7, Kr as allowsConnect, Kw as TrimmedNonEmptyString, Lh as URL$1, Ln as runServicePreflight, Lp as environmentThemeFileHasColors, Mb as Path, Nh as Port, Nu as releaseAssetUrl, Nx as AuthStandardClientScopes, Oh as ConfigError, Oi as PUBLISH_AGENT_ACTIVITY_SECRET, Op as EnvironmentThemeFile, Or as layer$4, Pc as UNPUBLISHABLE_THEME_IDS, Pu as updateFeedFileName, Pw as PortSchema, Ql as isUnpublishedRelease, Qm as errorReported, Rh as all$1, Rn as managedUpdateMirror, Sl as fromJsonStringPretty, St as layer$8, T_ as RelayOkResponse, Ti as CLOUD_LINK_REVOKED, Tw as CommandId, Ua as resolveSignalEndpoint, Uf as OrchestratorMcpFailure, Uh as schema, Ui as resolveRootCliCommand, Va as load, Vh as option$1, Vi as resolveEntryPath, Vw as RunId, Wa as DEFAULT_SIGNAL_EXPORT, Wh as withDefault$2, Xg as DesktopBackendBootstrap, Xi as layer$5, Xl as ensurePinnedRuntimeInstalled, Xr as refuseConnect, YS as get$1, Yl as PinnedRuntimeInstallError, Ym as Stdio, Zb as ExecutionEnvironmentDescriptor, Zl as generatedWindowsShimTarget, Zm as errorExitCode, Zr as refuseRemoteClients, _m as DATABASE_COMPACTION_RECOMMENDED_BYTES, _s as buildPairingAppLink, a as RelayClient, aa as deriveServerPaths, ai as buildTailscaleHttpsBaseUrl, au as recordPinnedRuntimeLauncher, bl as decodeJsonResult, bx as AuthGrantScope, c as queryWindowsTcpListeners, ca as make$6, co as layer$14, cp as OrchestratorMcpThreadWaitResult, cu as layer$1, dC as FileSystem, dn as make$7, eC as setHeader, en as layer$10, eu as launcherOwnsVersionsDir, fi as readTailscaleStatus, fn as layer$13, fu as isCommandAvailable, g_ as formatConnectReachable, ga as version, gw as AuthSessionId, ha as resolveServiceLauncherMode, hn as sha256, hu as pathSetupCommand, i_ as EnvironmentHttpCommonError, ia as ServerConfig, in as WorkspacePaths, ip as OrchestratorMcpThreadReadResult, iu as prunePinnedRuntimes, jc as BUILT_IN_THEME_IDS, ji as RELAY_URL_SECRET, jn as layer$6, ju as newestCliReleaseVersion, jx as AuthRelayWriteScope, kT as SecureRandom, kh as Int$6, kp as EnvironmentThemeId, kr as load$1, ku as cliReleaseChannelOf, ln as layer$11, mi as WINDOWS_POLICY_KEY, n_ as EnvironmentHttpApi, na as DEFAULT_PORT, nn as layer$12, np as OrchestratorMcpThreadListResult, nu as pinnedRuntimePaths, oC as isHttpClientError, oa as ensureServerDirectories, op as OrchestratorMcpThreadSendResult, ou as windowsShimTarget, pi as WINDOWS_POLICY_GROUPS, qh as fromEnv, qi as ServerSecretStore, qm as Terminal, qr as allowsRemoteClients, ra as RuntimeMode, ru as pinnedRuntimeVersionsDir, s as layerCloudflared, sa as layer$3, si as ensureTailscaleServe, so as NetService, su as ProcessRunner, ta as writeFileStringAtomically, tu as pinnedRuntimeCommand, ua as resolveStaticDir, wi as CLOUD_LINKED_USER_ID, wt as layer$9, wu as ChildProcessSpawner, ya as parsePersistedServerObservabilitySettings, yu as resolveSpawnCommand, zS as schemaBodyJson, zh as map$5, zi as detectCliRunner, zn as managedUpdateRefusal, zu as layer$2 } from "./ManagedEndpointRuntime-DQi_ynBP.mjs";
import { An as take, nr as round, p as decodeText, rt as mkString, tr as Order } from "./mcpResponsePayloads-D8Kjog9U.mjs";
import { $ as APPARMOR_PROFILE_PATH, A as describeServerProcess, An as formatBootServiceProblem, At as EnvironmentAuth, B as MAX_THEME_FILE_BYTES, Bn as UserError, Cn as runRequestedReclaim, Ct as isLoopbackHost, D as readCliDesiredCloudLink, Dn as BootServiceOtherBaseDirError, E as dropRevokedCloudLink, En as BootServiceDowngradeRefusedError, Fn as MissingOption, G as projectMutationOperation, Gn as log, Gt as layerRuntime, H as readPublishedThemes, Hn as isCliError, In as ShowHelp, J as hasCloudPublicConfig, K as acquireServerOwnership, Kn as warn, L as streamTraceFileLines, Ln as UnexpectedArgument, M as writeTriageSession, Mn as DuplicateOption, Nn as InvalidValue$1, O as readCliDesiredLinkMode, On as bootServiceProgramOf, Ot as renderTerminalQrCode, P as buildTriageLaunchPrompt, Pn as MissingArgument, Q as APPARMOR_PROFILE, R as toRotatedTracePaths, Rn as UnknownSubcommand, St as formatHostForUrl, T as clearPersistedCloudLink, Tn as BootService, Tt as isWildcardHost, U as readThemeFileGuarded, Vn as getUserMessage, Wn as error, X as relayUrlConfig, Zt as layerConfig, _t as readPersistedServerRuntimeState, at as SETUP_SUBCOMMAND, bn as layer$16, bt as buildPairingUrl, ct as sandboxBlocked, d as CloudCliAuthorizationError, dn as resolveBaseDir, dt as PeerLinks, et as DEBIAN_PACKAGES, f as CloudCliTokenManager, ft as layer$17, g as layer$18, ht as isProcessAlive, jn as layer$15, jt as INTERNAL_ADMINISTRATIVE_BOOTSTRAP_SUBJECT, k as setCliDesiredCloudLink, kn as formatBootServiceBaseDirOption, kt as resolveHeadlessConnectionString, l as formatReachabilityFailure, ln as expandHomePath, lt as sandboxDisabled, m as deviceAuthorizationLogin, mt as clearPersistedServerRuntimeState, p as CloudCliTokenManagerError, pt as layer$20, r as filterRelayResponse, rt as PreviewBrowserRootError, st as missingLibraries, t as layerHeadlessRelayClient, v as layer$19, w as withRelayClientTracing, wn as BOOT_SERVICE_UNIT_FILE, yn as DatabaseMaintenance, zn as UnrecognizedOption } from "./relayTracing-DgOUBHYk.mjs";
import { a as HomeDirectory, c as InvokedAs, d as Platform, f as UserId, i as ExecutablePath, l as IsExecutable, m as WorkingDirectory, r as Environment, t as Architecture } from "./HostProcess-C0EDOeeI.mjs";
import { o as compareExactServiceVersions, t as SERVICE_ENV_FILE, u as isExactServiceVersion } from "./serviceProtocol-BaG7DJJl.mjs";
import { n as mcpToolSession, r as runAcpMcpCliFastPath } from "./AcpMcpStdioBridge-BkE87Mty.mjs";
import { a as keepOutboundFetchOnHttp1, n as extendConnectionAttemptTimeout } from "./outboundHttp-licDtJv9.mjs";
import { t as runServiceLauncherCli } from "./serviceLauncher-taEa6gP-.mjs";
import { r as runNativeSpeechWorker } from "./native-BNu4qZOv.mjs";
import { n as interactiveStdin } from "./consoleStdin-PpAQ8K53.mjs";
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodeUtil from "node:util";
import * as NodeChildProcess from "node:child_process";
import * as NodeFSP from "node:fs/promises";
import * as NodeNet from "node:net";
import * as NodeReadline from "node:readline";
import * as NodeHttp from "node:http";
import * as NodeReadlinePromises from "node:readline/promises";
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Primitive.js
/**
* Parses raw command-line strings into typed values.
*
* A `Primitive<A>` receives one string and returns an `Effect` that either
* produces an `A` or fails with a parser message. `Argument` and `Flag` build
* on these primitives to add names, aliases, defaults, prompts, configuration
* fallbacks, repetition, and help metadata. Primitive parsers cover common
* scalar values, paths, files, structured config files, schema-decoded input,
* redacted values, and key-value pairs.
*
* @stability unstable
* @since 4.0.0
*/
const Proto$2 = { ["~effect/cli/Primitive"]: { _A: identity } };
/**
* @internal
*/
const isTrueLiteral = /*#__PURE__*/ is(TrueLiterals);
/**
* @internal
*/
const isFalseLiteral = /*#__PURE__*/ is(FalseLiterals);
/**
* @internal
*/
const isBoolean = (p) => p._tag === "Boolean";
const makePrimitive = (tag, parse) => Object.assign(Object.create(Proto$2), {
	_tag: tag,
	parse
});
const makeSchemaPrimitive = (tag, schema) => {
	const toCodecStringTree$1 = toCodecStringTree(schema);
	const decode = decodeUnknownEffect(toCodecStringTree$1);
	return makePrimitive(tag, (value) => mapError(decode(value), (error) => error.message));
};
/**
* Creates a primitive that parses boolean values from string input.
*
* **Details**
*
* Recognizes various forms of true/false values:
* - True values: "true", "1", "y", "yes", "on"
* - False values: "false", "0", "n", "no", "off"
*
* **Example** (Parsing boolean values)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Primitive } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const parseBoolean = Effect.all([
*   Primitive.Boolean.parse("true"),
*   Primitive.Boolean.parse("yes"),
*   Primitive.Boolean.parse("false"),
*   Primitive.Boolean.parse("0")
* ])
*
* await Effect.runPromise(parseBoolean.pipe(Effect.provide(CliTestLayer))) // => [true, true, false, false]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Boolean$3 = /*#__PURE__*/ makeSchemaPrimitive("Boolean", BooleanLiterals);
/**
* Creates a primitive that parses integer numbers from string input.
*
* **Example** (Parsing integer values)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Primitive } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const parseInteger = Effect.all([
*   Primitive.Int.parse("42"),
*   Primitive.Int.parse("-123"),
*   Primitive.Int.parse("0")
* ])
*
* await Effect.runPromise(parseInteger.pipe(Effect.provide(CliTestLayer))) // => [42, -123, 0]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Int$4 = /*#__PURE__*/ makeSchemaPrimitive("Int", Int$5);
/**
* Creates a primitive that accepts any string value without validation.
*
* **Example** (Parsing string values)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Primitive } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const parseString = Effect.all([
*   Primitive.String.parse("hello world"),
*   Primitive.String.parse(""),
*   Primitive.String.parse("123")
* ])
*
* await Effect.runPromise(parseString.pipe(Effect.provide(CliTestLayer))) // => ["hello world", "", "123"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const String$5 = /*#__PURE__*/ makePrimitive("String", (value) => succeed$1(value));
/**
* Creates a primitive that accepts only specific choice values mapped to custom types.
*
* **Example** (Parsing choices)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Primitive } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* type LogLevel = "debug" | "info" | "warn" | "error"
*
* const logLevelPrimitive = Primitive.Choice<LogLevel>([
*   ["debug", "debug"],
*   ["info", "info"],
*   ["warn", "warn"],
*   ["error", "error"]
* ])
*
* const parseLogLevel = Effect.all([
*   logLevelPrimitive.parse("info"),
*   logLevelPrimitive.parse("debug")
* ])
*
* await Effect.runPromise(parseLogLevel.pipe(Effect.provide(CliTestLayer))) // => ["info", "debug"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Choice = (choices) => {
	const choiceMap = new Map(choices);
	const validChoices = choices.map(([key]) => format(key)).join(" | ");
	const primitive = makePrimitive("Choice", (value) => {
		if (choiceMap.has(value)) return succeed$1(choiceMap.get(value));
		return fail(validChoices);
	});
	return Object.assign(primitive, { choiceKeys: choices.map(([key]) => key) });
};
/**
* Gets a human-readable type name for a primitive.
*
* **When to use**
*
* Use when you need the display type name for a `Primitive`, such as when
* generating CLI help documentation.
*
* **Example** (Getting primitive type names)
*
* ```ts import.meta.vitest
* import { Primitive } from "effect/cli"
*
* Primitive.getTypeName(Primitive.String) // => "string"
* Primitive.getTypeName(Primitive.Int) // => "integer"
* Primitive.getTypeName(Primitive.Boolean) // => "boolean"
* Primitive.getTypeName(Primitive.Date) // => "date"
* Primitive.getTypeName(Primitive.KeyValuePair) // => "key=value"
*
* const logLevelChoice = Primitive.Choice([
*   ["debug", "debug"],
*   ["info", "info"]
* ])
* Primitive.getTypeName(logLevelChoice) // => "choice"
* ```
*
* @stability unstable
* @category getters
* @since 4.0.0
*/
const getTypeName = (primitive) => {
	switch (primitive._tag) {
		case "Boolean": return "boolean";
		case "String": return "string";
		case "Int": return "integer";
		case "Finite": return "number";
		case "Date": return "date";
		case "Path": return "path";
		case "Choice": return "choice";
		case "Redacted": return "string";
		case "FileText": return "file";
		case "FileParse": return "file";
		case "FileSchema": return "file";
		case "KeyValuePair": return "key=value";
		case "Never": return "none";
		default: return "value";
	}
};
/**
* @internal
*/
const getChoiceKeys = (primitive) => primitive._tag === "Choice" ? primitive.choiceKeys : void 0;
/**
* @internal
*/
const getPathType = (primitive) => primitive._tag === "Path" ? primitive.pathType : void 0;
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/ansi.js
/**
* Internal ANSI escape sequence helpers used by the unstable CLI rendering
* implementation. This module centralizes the control codes for text styling,
* cursor movement, line erasing, and terminal notifications so renderers can
* compose terminal output without scattering raw escape sequences throughout
* the CLI internals.
*
* The helpers deliberately work with plain strings because terminal rendering
* is sensitive to ordering: style codes must be reset after annotated text,
* cursor operations must account for one-based terminal coordinates, and line
* clearing usually needs to preserve the cursor position expected by the next
* frame.
*/
const ESC = "\x1B[";
const SEP = ";";
/**
* @internal
*/
const reset = `${ESC}0m`;
/**
* @internal
*/
const bold = `${ESC}1m`;
/**
* @internal
*/
const italicized = `${ESC}3m`;
/**
* @internal
*/
const underlined = `${ESC}4m`;
/**
* @internal
*/
const strikethrough = `${ESC}9m`;
/**
* @internal
*/
const cursorShow = `${ESC}?25h`;
/**
* @internal
*/
const cursorHide = `${ESC}?25l`;
/**
* @internal
*/
const eraseLine = `${ESC}2K`;
/**
* @internal
*/
const red = `${ESC}31m`;
/**
* @internal
*/
const green = `${ESC}32m`;
/**
* @internal
*/
const magenta = `${ESC}35m`;
/**
* @internal
*/
const white = `${ESC}37m`;
/**
* @internal
*/
const blackBright = `${ESC}90m`;
/**
* @internal
*/
const cyanBright = `${ESC}96m`;
/**
* Wraps `text` in the given styles followed by a reset. When `colors` is
* `false` the text is returned unchanged, so callers gate color and style
* escapes in one place while cursor and erase controls stay untouched.
*
* @internal
*/
const annotate = (colors, text, ...styles) => {
	if (!colors) return text;
	return `${styles.flat().join("")}${text}${reset}`;
};
/**
* Detects whether CLI output should use color and style escapes: stdout must
* be a TTY and `NO_COLOR` must be unset or empty.
*
* @internal
*/
const detectColors = () => {
	const globalProcess = globalThis.process;
	return typeof globalProcess === "object" && globalProcess !== null && typeof globalProcess.stdout === "object" && globalProcess.stdout !== null && globalProcess.stdout.isTTY === true && !globalProcess.env?.NO_COLOR;
};
const combine = (...styles) => styles;
/**
* @internal
*/
const cursorTo = (column, row) => {
	if (row === void 0) return `${ESC}${Math.max(column + 1, 0)}G`;
	return `${ESC}${row + 1}${SEP}${Math.max(column + 1, 0)}H`;
};
/**
* @internal
*/
const cursorDown = (lines = 1) => {
	return `${ESC}${lines}B`;
};
/**
* @internal
*/
const cursorMove = (column, row = 0) => {
	let command = "";
	if (row < 0) command += `${ESC}${-row}A`;
	if (row > 0) command += `${ESC}${row}B`;
	if (column > 0) command += `${ESC}${column}C`;
	if (column < 0) command += `${ESC}${-column}D`;
	return command;
};
/**
* @internal
*/
const eraseLines = (rows) => {
	let command = "";
	for (let i = 0; i < rows; i++) command += `${ESC}2K` + (i < rows - 1 ? `${ESC}1A` : "");
	if (rows > 0) command += `${ESC}G`;
	return command;
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Prompt.js
/**
* Builds interactive terminal prompts for CLI applications.
*
* A `Prompt<A>` describes a small terminal UI that renders frames, reads
* keyboard input, validates responses, and eventually produces an `A`. Prompts
* can ask for simple values, selections, lists, files, hidden text, or custom
* interactions. This module includes prompt constructors, tools for combining
* and transforming prompt output, and support for running prompts through the
* `Terminal` service.
*
* @stability unstable
* @since 4.0.0
*/
const TypeId$2 = "~effect/cli/Prompt";
const defaultTheme = {
	prefix: "?",
	arrowUp: "↑",
	arrowDown: "↓",
	checkboxOn: "☒",
	checkboxOff: "☐",
	tick: "✔",
	ellipsis: "…",
	pointerSmall: "›",
	pointer: "❯",
	descriptionSeparator: "- ",
	passwordMask: "*",
	toggleSeparator: "/",
	primaryColor: cyanBright,
	mutedColor: blackBright,
	successColor: green,
	errorColor: red,
	submittedColor: white
};
const windowsTheme = {
	...defaultTheme,
	checkboxOn: "[*]",
	checkboxOff: "[ ]",
	tick: "√",
	ellipsis: "...",
	pointerSmall: "»",
	pointer: ">"
};
/**
* Creates a prompt theme using the current platform defaults.
*
* **Details**
*
* Unless `colors` is provided, it is detected when the theme is created:
* colors are enabled when stdout is a TTY and `NO_COLOR` is unset or empty.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const makeTheme = (options) => ({
	...process.platform === "win32" ? windowsTheme : defaultTheme,
	...options,
	colors: options?.colors ?? detectColors()
});
/**
* Context reference for the theme used by built-in prompts.
*
* **Details**
*
* Provide this reference once to theme every prompt in an application. A
* prompt's `theme` option takes precedence over the context value. The
* command wizard also reads `colors` from this reference, so provide a theme
* with `colors: false` to disable wizard styling.
*
* The default value is created with `makeTheme` the first time it is read,
* so color detection runs once per process. Changes to `NO_COLOR` after the
* first prompt do not affect the default theme.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const Theme = /*#__PURE__*/ Reference("effect/cli/Prompt/Theme", { defaultValue: makeTheme });
const getTheme = (options) => map$3(Theme, (theme) => ({
	...theme,
	...options.theme
}));
const annotateErrorLine = (theme, line) => annotate(theme.colors, line, combine(italicized, theme.errorColor));
const annotateSymbol = (theme, symbol, ...styles) => symbol.length === 0 ? "" : annotate(theme.colors, symbol, ...styles);
const separateSymbol = (symbol, text) => symbol.length === 0 ? text : symbol + " " + text;
const renderPagingPrefix = (theme, showArrowUp, showArrowDown) => {
	const width = Math.max(theme.arrowUp.length, theme.arrowDown.length);
	if (showArrowUp) return theme.arrowUp.padEnd(width);
	if (showArrowDown) return theme.arrowDown.padEnd(width);
	return " ".repeat(width);
};
/**
* Creates a confirmation prompt that asks the user to choose a boolean yes/no
* value.
*
* **When to use**
*
* Use to ask for a yes/no answer that can be submitted directly.
*
* **Details**
*
* `initial` defaults to `false`. Enter submits the current default, yes-style
* input submits `true`, no-style input submits `false`, and other input beeps.
*
* @see {@link Toggle} for an interactive switch-before-submit boolean prompt
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Confirm = (options) => {
	const opts = {
		initial: false,
		...options,
		label: {
			confirm: "yes",
			deny: "no",
			...options.label
		},
		placeholder: {
			defaultConfirm: "(Y/n)",
			defaultDeny: "(y/N)",
			...options.placeholder
		}
	};
	const initialState = { value: opts.initial };
	return Custom(initialState, {
		render: handleConfirmRender(opts),
		process: (input) => handleConfirmProcess(input, opts.initial),
		clear: handleConfirmClear(opts)
	});
};
/**
* Creates a custom `Prompt` from the specified initial state and handlers.
*
* **Details**
*
* The initial state can either be a pure value or an `Effect`. This is
* particularly useful when the initial state of the `Prompt` must be computed
* by performing an effectful computation, such as reading data from the file
* system. A `Prompt` runs as a render loop: `render` returns ANSI output for
* the current frame, the `Terminal` obtains user input, `process` returns the
* next prompt action, and `clear` returns ANSI output used to clear the previous
* frame.
*
* Optionally, an external `events` dequeue can be provided as the third
* argument. When present, the render loop will race user input against events
* from the dequeue, allowing background events to trigger re-renders without
* waiting for a keypress. When an event is received from the dequeue, the
* `receive` handler is called instead of `process`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Custom = (initialState, ...args) => {
	const [events, handlers] = args.length === 1 ? [void 0, args[0]] : [args[0], args[1]];
	const op = Object.create(proto);
	op._tag = "Loop";
	op.initialState = initialState;
	op.render = handlers.render;
	op.process = handlers.process;
	op.clear = handlers.clear;
	op.events = events;
	return op;
};
/**
* Creates a date prompt that lets the user edit a formatted date value and
* validates the final `Date` before submission.
*
* **Details**
*
* `initial` defaults to the current `Date`, `dateMask` defaults to
* `YYYY-MM-DD HH:mm:ss`, mask parsing creates editable date parts plus literal
* tokens, `locales` customizes month and weekday labels, and `validate` runs on
* submission.
*
* **Gotchas**
*
* A supplied `initial` `Date` is edited in place during prompt interaction.
* Date edits use JavaScript `Date` setters, so out-of-range typed values can
* normalize before validation. If the prompt is meant to be editable,
* `dateMask` should contain at least one editable date token.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Date$1 = (options) => {
	const opts = {
		initial: new globalThis.Date(),
		dateMask: "YYYY-MM-DD HH:mm:ss",
		validate: succeed$1,
		...options,
		locales: {
			...defaultLocales,
			...options.locales
		}
	};
	const dateParts = makeDateParts(opts.dateMask, opts.initial, opts.locales);
	const initialState = {
		dateParts,
		typed: "",
		cursor: dateParts.findIndex((part) => !part.isToken()),
		value: opts.initial,
		error: none()
	};
	return Custom(initialState, {
		render: handleDateRender(opts),
		process: handleDateProcess(opts),
		clear: handleDateClear(opts)
	});
};
/**
* Composes prompts by using the output of this prompt to create the next prompt.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const flatMap = /*#__PURE__*/ dual(2, (self, f) => {
	const op = Object.create(proto);
	op._tag = "OnSuccess";
	op.prompt = self;
	op.onSuccess = f;
	return op;
});
/**
* Creates a floating-point number prompt.
*
* **Details**
*
* The prompt supports minimum and maximum bounds, keyboard step sizes, display
* precision, and additional validation before submission.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Number$1 = (options) => {
	const opts = {
		default: 0,
		min: globalThis.Number.NEGATIVE_INFINITY,
		max: globalThis.Number.POSITIVE_INFINITY,
		incrementBy: 1,
		decrementBy: 1,
		precision: 2,
		validate: (n) => {
			if (n < opts.min) return fail(`${n} must be greater than or equal to ${opts.min}`);
			if (n > opts.max) return fail(`${n} must be less than or equal to ${opts.max}`);
			return succeed$1(n);
		},
		...options
	};
	const initialValue = options.default === void 0 ? "" : `${opts.default}`;
	const initialState = {
		cursor: initialValue.length,
		value: initialValue,
		error: none()
	};
	return Custom(initialState, {
		render: handleRenderFloat(opts),
		process: handleProcessFloat(opts),
		clear: handleNumberClear(opts)
	});
};
/**
* Creates an integer prompt.
*
* **Details**
*
* The prompt supports minimum and maximum bounds, keyboard step sizes, and
* additional validation before submission.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Int$3 = (options) => {
	const opts = {
		default: 0,
		min: globalThis.Number.NEGATIVE_INFINITY,
		max: globalThis.Number.POSITIVE_INFINITY,
		incrementBy: 1,
		decrementBy: 1,
		validate: (n) => {
			if (n < opts.min) return fail(`${n} must be greater than or equal to ${opts.min}`);
			if (n > opts.max) return fail(`${n} must be less than or equal to ${opts.max}`);
			return succeed$1(n);
		},
		...options
	};
	const initialValue = options.default === void 0 ? "" : `${opts.default}`;
	const initialState = {
		cursor: initialValue.length,
		value: initialValue,
		error: none()
	};
	return Custom(initialState, {
		render: handleRenderInteger(opts),
		process: handleProcessInteger(opts),
		clear: handleNumberClear(opts)
	});
};
/**
* Transforms the output value produced by a prompt.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const map$2 = /*#__PURE__*/ dual(2, (self, f) => flatMap(self, (a) => succeed(f(a))));
/**
* Creates a password prompt that masks typed input and returns the submitted
* value wrapped in `Redacted`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Password = (options) => basePrompt(options, "password").pipe(map$2(make$2));
/**
* Runs a prompt by reading terminal input and rendering prompt frames until the
* prompt submits a value.
*
* **Gotchas**
*
* The returned effect may fail with `Terminal.QuitError` if terminal input ends
* or the prompt is quit.
*
* @stability unstable
* @category running
* @since 4.0.0
*/
const run$3 = /*#__PURE__*/ fnUntraced(function* (self) {
	const terminal = yield* Terminal;
	const input = yield* cached(terminal.readInput);
	return yield* runWithInput(self, terminal, input);
}, /*#__PURE__*/ mapError(() => new QuitError({})), scoped);
const getSelectInitialIndex = (choices) => {
	let initialIndex = 0;
	let seenSelected = -1;
	for (let i = 0; i < choices.length; i++) if (choices[i].selected === true) {
		if (seenSelected !== -1) throw new Error("InvalidArgumentException: only a single choice can be selected by default for Prompt.Select");
		seenSelected = i;
	}
	if (seenSelected !== -1) initialIndex = seenSelected;
	return initialIndex;
};
/**
* Creates a prompt that lets the user select a single value from a list of
* choices.
*
* **Gotchas**
*
* At most one choice may be marked as selected by default.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Select = (options) => {
	const opts = {
		maxPerPage: 10,
		...options
	};
	const initialIndex = getSelectInitialIndex(opts.choices);
	return Custom(initialIndex, {
		render: handleSelectRender(opts),
		process: handleSelectProcess(opts),
		clear: handleSelectClear(opts)
	});
};
/**
* Creates a prompt that lets the user select multiple choices and returns their
* values as an array.
*
* **Details**
*
* The prompt supports default selected choices, bulk-selection commands, and
* minimum or maximum selection counts.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const MultiSelect = (options) => {
	const opts = {
		maxPerPage: 10,
		...options
	};
	const initialSelected = /* @__PURE__ */ new Set();
	for (let i = 0; i < opts.choices.length; i++) {
		const choice = opts.choices[i];
		if (choice.selected === true && !choice.disabled) initialSelected.add(i);
	}
	const initialState = {
		index: 0,
		selectedIndices: initialSelected,
		error: none()
	};
	return Custom(initialState, {
		render: handleMultiSelectRender(opts),
		process: handleMultiSelectProcess(opts),
		clear: handleMultiSelectClear(opts)
	});
};
/**
* Creates a `Prompt` which immediately succeeds with the specified value.
*
* **Details**
*
* This prompt does not attempt to obtain user input or render anything to the
* screen.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const succeed = (value) => {
	const op = Object.create(proto);
	op._tag = "Succeed";
	op.value = value;
	return op;
};
/**
* Creates a text-entry prompt that echoes input and returns the submitted
* string after validation.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const String$4 = (options) => basePrompt(options, "text");
/**
* Creates a toggle prompt that lets the user switch between active and inactive
* states and returns the selected boolean value.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Toggle = (options) => {
	const opts = {
		initial: false,
		active: "on",
		inactive: "off",
		...options
	};
	return Custom(opts.initial, {
		render: handleToggleRender(opts),
		process: handleToggleProcess,
		clear: () => handleToggleClear(opts)
	});
};
const proto = {
	.../*#__PURE__*/ Prototype({
		label: "Prompt",
		evaluate() {
			return run$3(this);
		}
	}),
	[TypeId$2]: { _Output: (_) => _ }
};
const runWithInput = (prompt, terminal, input) => suspend(() => {
	const op = prompt;
	switch (op._tag) {
		case "Loop": return flatMap$1(input, (queue) => runLoop(op, terminal, queue));
		case "OnSuccess": return flatMap$1(runWithInput(op.prompt, terminal, input), (a) => runWithInput(op.onSuccess(a), terminal, input));
		case "Succeed": return succeed$1(op.value);
	}
});
const runLoop = /*#__PURE__*/ fnUntraced(function* (loop, terminal, input) {
	let state = isEffect(loop.initialState) ? yield* loop.initialState : loop.initialState;
	let action = Action$1.NextFrame({ state });
	let clear = "";
	while (true) {
		const msg = yield* loop.render(state, action);
		yield* orDie(terminal.display(clear + msg));
		clear = "";
		if (loop.events) {
			const takeInput = take(input).pipe(map$3((input) => ({
				_tag: "Input",
				input
			})));
			const result = yield* raceFirst(takeInput, take(loop.events).pipe(map$3((value) => ({
				_tag: "Event",
				value
			}))));
			action = yield* loop.process(result, state);
		} else {
			const result = yield* take(input);
			action = yield* loop.process(result, state);
		}
		switch (action._tag) {
			case "Beep": continue;
			case "NextFrame":
				clear = yield* loop.clear(state, action);
				state = action.state;
				continue;
			case "Submit": {
				clear = yield* loop.clear(state, action);
				const msg = yield* loop.render(state, action);
				yield* orDie(terminal.display(clear + msg));
				return action.value;
			}
		}
	}
}, (effect, _, terminal) => ensuring(effect, orDie(terminal.display(cursorShow))));
const Action$1 = /*#__PURE__*/ taggedEnum();
/**
* Clears all lines taken up by the specified `text`.
*/
const eraseText = (text, columns) => {
	if (columns === 0) return eraseLine + cursorTo(0);
	let rows = 0;
	const lines = text.split(NEWLINE_REGEXP);
	for (const line of lines) rows += 1 + Math.floor(Math.max(line.length - 1, 0) / columns);
	return eraseLines(rows);
};
const lines = (prompt, columns) => {
	const lines = prompt.split(NEWLINE_REGEXP);
	return columns === 0 ? lines.length : pipe(map$4(lines, (line) => Math.ceil(line.length / columns)), reduce(0, (left, right) => left + right));
};
const clearOutputWithError = (outputText, columns, errorText) => {
	if (errorText !== void 0 && errorText.length > 0) return cursorDown(lines(errorText, columns)) + eraseText(`\n${errorText}`, columns) + eraseText(outputText, columns);
	return eraseText(outputText, columns);
};
const renderBeep = "\x07";
const NEWLINE_REGEXP = /\r?\n/;
const handleConfirmClear = (options) => {
	return fnUntraced(function* (state, _) {
		const columns = yield* (yield* Terminal).columns;
		const figures = yield* getTheme(options);
		const confirmMessage = state.value ? options.placeholder.defaultConfirm : options.placeholder.defaultDeny;
		const promptText = renderPrompt(confirmMessage, options.message, figures.prefix, figures.pointerSmall, figures, { plain: true });
		return eraseText(promptText, columns) + (eraseLine + "\x1B[G");
	});
};
const renderConfirmNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const confirmMessage = state.value ? options.placeholder.defaultConfirm : options.placeholder.defaultDeny;
	const confirm = annotate(figures.colors, confirmMessage, figures.mutedColor);
	const promptMsg = renderPrompt(confirm, options.message, leadingSymbol, trailingSymbol, figures);
	return cursorHide + promptMsg;
});
const renderConfirmSubmission = /*#__PURE__*/ fnUntraced(function* (value, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	const confirmMessage = value ? options.label.confirm : options.label.deny;
	return renderPrompt(confirmMessage, options.message, leadingSymbol, trailingSymbol, figures) + "\n";
});
const handleConfirmRender = (options) => {
	return (_, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderConfirmNextFrame(state, options),
			Submit: ({ value }) => renderConfirmSubmission(value, options)
		});
	};
};
const TRUE_VALUE_REGEXP = /^y|t$/;
const FALSE_VALUE_REGEXP = /^n|f$/;
const handleConfirmProcess = (input, defaultValue) => {
	const value = getOrElse(input.input, () => "");
	if (input.key.name === "enter" || input.key.name === "return") return succeed$1(Action$1.Submit({ value: defaultValue }));
	if (TRUE_VALUE_REGEXP.test(value.toLowerCase())) return succeed$1(Action$1.Submit({ value: true }));
	if (FALSE_VALUE_REGEXP.test(value.toLowerCase())) return succeed$1(Action$1.Submit({ value: false }));
	return succeed$1(Action$1.Beep());
};
const handleDateClear = (options) => {
	return fnUntraced(function* (state, _) {
		const columns = yield* (yield* Terminal).columns;
		const figures = yield* getTheme(options);
		const resetCurrentLine = eraseLine + "\x1B[G";
		const parts = reduce(state.dateParts, "", (doc, part) => doc + part.toString());
		const promptText = renderPrompt(parts, options.message, figures.prefix, figures.pointerSmall, figures, { plain: true });
		const errorText = isSome(state.error) ? match(state.error.value.split(NEWLINE_REGEXP), {
			onEmpty: () => "",
			onNonEmpty: (errorLines) => separateSymbol(figures.pointerSmall, errorLines.join("\n"))
		}) : "";
		return clearOutputWithError(promptText, columns, errorText) + resetCurrentLine;
	});
};
const renderDateError = (state, pointer, theme) => {
	if (isSome(state.error)) {
		const errorLines = state.error.value.split(NEWLINE_REGEXP);
		if (isReadonlyArrayNonEmpty(errorLines)) {
			const prefix = annotateSymbol(theme, pointer, theme.errorColor);
			const lines = map$4(errorLines, (str) => annotateErrorLine(theme, str));
			return "\x1B[s\n" + separateSymbol(prefix, lines.join("\n")) + "\x1B[u";
		}
	}
	return "";
};
const renderParts = (state, theme, submitted = false) => {
	return reduce(state.dateParts, "", (doc, part, currentIndex) => {
		const partDoc = part.toString();
		if (currentIndex === state.cursor && !submitted) {
			const annotation = combine(underlined, theme.primaryColor);
			return doc + annotate(theme.colors, partDoc, annotation);
		}
		return doc + partDoc;
	});
};
const renderDateNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const parts = renderParts(state, figures);
	const promptMsg = renderPrompt(parts, options.message, leadingSymbol, trailingSymbol, figures);
	const errorMsg = renderDateError(state, figures.pointerSmall, figures);
	return cursorHide + promptMsg + errorMsg;
});
const renderDateSubmission = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	const parts = renderParts(state, figures, true);
	return renderPrompt(parts, options.message, leadingSymbol, trailingSymbol, figures) + "\n";
});
const processUp = (state) => {
	state.dateParts[state.cursor].increment();
	return Action$1.NextFrame({ state: {
		...state,
		typed: ""
	} });
};
const processDown = (state) => {
	state.dateParts[state.cursor].decrement();
	return Action$1.NextFrame({ state: {
		...state,
		typed: ""
	} });
};
const processDateCursorLeft = (state) => {
	const previous = state.dateParts[state.cursor].previousPart();
	if (isSome(previous)) return Action$1.NextFrame({ state: {
		...state,
		typed: "",
		cursor: state.dateParts.indexOf(previous.value)
	} });
	return Action$1.Beep();
};
const processDateCursorRight = (state) => {
	const next = state.dateParts[state.cursor].nextPart();
	if (isSome(next)) return Action$1.NextFrame({ state: {
		...state,
		typed: "",
		cursor: state.dateParts.indexOf(next.value)
	} });
	return Action$1.Beep();
};
const processDateNext = (state) => {
	const next = state.dateParts[state.cursor].nextPart();
	const cursor = match$1(next, {
		onNone: () => state.dateParts.findIndex((part) => !part.isToken()),
		onSome: (next) => state.dateParts.indexOf(next)
	});
	return Action$1.NextFrame({ state: {
		...state,
		typed: "",
		cursor
	} });
};
const defaultDateProcessor = (value, state) => {
	if (/\d/.test(value)) {
		const typed = state.typed + value;
		state.dateParts[state.cursor].setValue(typed);
		return Action$1.NextFrame({ state: {
			...state,
			typed
		} });
	}
	return Action$1.Beep();
};
const defaultLocales = {
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	monthsShort: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	],
	weekdays: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	weekdaysShort: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	]
};
const handleDateRender = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderDateNextFrame(state, options),
			Submit: () => renderDateSubmission(state, options)
		});
	};
};
const handleDateProcess = (options) => {
	return (input, state) => {
		switch (input.key.name) {
			case "left": return succeed$1(processDateCursorLeft(state));
			case "right": return succeed$1(processDateCursorRight(state));
			case "k":
			case "up": return succeed$1(processUp(state));
			case "j":
			case "down": return succeed$1(processDown(state));
			case "tab": return succeed$1(processDateNext(state));
			case "enter":
			case "return": return match$2(options.validate(state.value), {
				onFailure: (error) => Action$1.NextFrame({ state: {
					...state,
					error: some(error)
				} }),
				onSuccess: (value) => Action$1.Submit({ value })
			});
			default: return succeed$1(defaultDateProcessor(getOrElse(input.input, () => ""), state));
		}
	};
};
const DATE_PART_REGEXP = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
const regExpGroups = {
	1: ({ token, ...opts }) => new Token({
		token: token.replace(/\\(.)/g, "$1"),
		...opts
	}),
	2: (opts) => new Day(opts),
	3: (opts) => new Month(opts),
	4: (opts) => new Year(opts),
	5: (opts) => new Meridiem(opts),
	6: (opts) => new Hours(opts),
	7: (opts) => new Minutes(opts),
	8: (opts) => new Seconds(opts),
	9: (opts) => new Milliseconds(opts)
};
const makeDateParts = (dateMask, date, locales) => {
	const parts = [];
	let result = null;
	while (result = DATE_PART_REGEXP.exec(dateMask)) {
		const match = result.shift();
		const index = result.findIndex((group) => group !== void 0);
		if (index in regExpGroups) {
			const token = result[index] || match;
			parts.push(regExpGroups[index]({
				token,
				date,
				parts,
				locales
			}));
		} else parts.push(new Token({
			token: result[index] || match,
			date,
			parts,
			locales
		}));
	}
	const orderedParts = parts.reduce((array, element) => {
		const lastElement = array[array.length - 1];
		if (element.isToken() && lastElement !== void 0 && lastElement.isToken()) lastElement.setValue(element.token);
		else array.push(element);
		return array;
	}, empty());
	parts.splice(0, parts.length, ...orderedParts);
	return parts;
};
var DatePart = class {
	token;
	date;
	parts;
	locales;
	constructor(params) {
		this.token = params.token;
		this.locales = params.locales;
		this.date = params.date || new globalThis.Date();
		this.parts = params.parts || [this];
	}
	/**
	* Returns `true` if this `DatePart` is a `Token`, `false` otherwise.
	*/
	isToken() {
		return false;
	}
	/**
	* Retrieves the next date part in the list of parts.
	*/
	nextPart() {
		const currentPartIndex = getOrElse(findFirstIndex(this.parts, (part) => part === this), () => 0);
		return findFirst(this.parts.slice(currentPartIndex + 1), (part) => !part.isToken());
	}
	/**
	* Retrieves the previous date part in the list of parts.
	*/
	previousPart() {
		const currentPartIndex = findFirstIndex(this.parts, (part) => part === this);
		if (isSome(currentPartIndex)) return findLast(this.parts.slice(0, currentPartIndex.value), (part) => !part.isToken());
		return none();
	}
	toString() {
		return globalThis.String(this.date);
	}
};
var Token = class extends DatePart {
	increment() {}
	decrement() {}
	setValue(value) {
		this.token = this.token + value;
	}
	isToken() {
		return true;
	}
	toString() {
		return this.token;
	}
};
var Milliseconds = class extends DatePart {
	increment() {
		this.date.setMilliseconds(this.date.getMilliseconds() + 1);
	}
	decrement() {
		this.date.setMilliseconds(this.date.getMilliseconds() - 1);
	}
	setValue(value) {
		this.date.setMilliseconds(globalThis.Number.parseInt(value.slice(-this.token.length)));
	}
	toString() {
		return `${this.date.getMilliseconds()}`.padStart(4, "0").substring(0, this.token.length);
	}
};
var Seconds = class extends DatePart {
	increment() {
		this.date.setSeconds(this.date.getSeconds() + 1);
	}
	decrement() {
		this.date.setSeconds(this.date.getSeconds() - 1);
	}
	setValue(value) {
		this.date.setSeconds(globalThis.Number.parseInt(value.slice(-2)));
	}
	toString() {
		const seconds = `${this.date.getSeconds()}`;
		return this.token.length > 1 ? seconds.padStart(2, "0") : seconds;
	}
};
var Minutes = class extends DatePart {
	increment() {
		this.date.setMinutes(this.date.getMinutes() + 1);
	}
	decrement() {
		this.date.setMinutes(this.date.getMinutes() - 1);
	}
	setValue(value) {
		this.date.setMinutes(globalThis.Number.parseInt(value.slice(-2)));
	}
	toString() {
		const minutes = `${this.date.getMinutes()}`;
		return this.token.length > 1 ? minutes.padStart(2, "0") : minutes;
	}
};
var Hours = class extends DatePart {
	increment() {
		this.date.setHours(this.date.getHours() + 1);
	}
	decrement() {
		this.date.setHours(this.date.getHours() - 1);
	}
	setValue(value) {
		this.date.setHours(globalThis.Number.parseInt(value.slice(-2)));
	}
	toString() {
		const hours = /h/.test(this.token) ? this.date.getHours() % 12 || 12 : this.date.getHours();
		return this.token.length > 1 ? `${hours}`.padStart(2, "0") : `${hours}`;
	}
};
var Day = class extends DatePart {
	increment() {
		this.date.setDate(this.date.getDate() + 1);
	}
	decrement() {
		this.date.setDate(this.date.getDate() - 1);
	}
	setValue(value) {
		this.date.setDate(globalThis.Number.parseInt(value.slice(-2)));
	}
	toString() {
		const date = this.date.getDate();
		const day = this.date.getDay();
		switch (this.token) {
			case "DD": return `${date}`.padStart(2, "0");
			case "Do": return `${date}${this.ordinalIndicator(date)}`;
			case "d": return `${day + 1}`;
			case "ddd": return this.locales.weekdaysShort[day];
			case "dddd": return this.locales.weekdays[day];
			default: return `${date}`;
		}
	}
	ordinalIndicator(day) {
		if (day >= 11 && day <= 13) return "th";
		switch (day % 10) {
			case 1: return "st";
			case 2: return "nd";
			case 3: return "rd";
			default: return "th";
		}
	}
};
var Month = class extends DatePart {
	increment() {
		this.date.setMonth(this.date.getMonth() + 1);
	}
	decrement() {
		this.date.setMonth(this.date.getMonth() - 1);
	}
	setValue(value) {
		const month = globalThis.Number.parseInt(value.slice(-2)) - 1;
		this.date.setMonth(month < 0 ? 0 : month);
	}
	toString() {
		const month = this.date.getMonth();
		switch (this.token.length) {
			case 2: return `${month + 1}`.padStart(2, "0");
			case 3: return this.locales.monthsShort[month];
			case 4: return this.locales.months[month];
			default: return `${month + 1}`;
		}
	}
};
var Year = class extends DatePart {
	increment() {
		this.date.setFullYear(this.date.getFullYear() + 1);
	}
	decrement() {
		this.date.setFullYear(this.date.getFullYear() - 1);
	}
	setValue(value) {
		this.date.setFullYear(globalThis.Number.parseInt(value.slice(-4)));
	}
	toString() {
		const year = `${this.date.getFullYear()}`.padStart(4, "0");
		return this.token.length === 2 ? year.slice(-2) : year;
	}
};
var Meridiem = class extends DatePart {
	increment() {
		this.date.setHours((this.date.getHours() + 12) % 24);
	}
	decrement() {
		this.increment();
	}
	setValue(_value) {}
	toString() {
		const meridiem = this.date.getHours() >= 12 ? "pm" : "am";
		return /A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
	}
};
const renderPrompt = (confirm, message, leadingSymbol, trailingSymbol, theme, options) => {
	const prefix = leadingSymbol.length === 0 ? "" : leadingSymbol + " ";
	const renderLine = (line) => {
		let output = prefix + line;
		if (trailingSymbol.length > 0) output += " " + trailingSymbol;
		if (confirm.length > 0) output += " " + confirm;
		else if (trailingSymbol.length > 0) output += " ";
		return output;
	};
	return match(message.split(NEWLINE_REGEXP), {
		onEmpty: () => renderLine(""),
		onNonEmpty: (promptLines) => {
			const lines = options?.plain === true ? promptLines : map$4(promptLines, (line) => annotate(theme.colors, line, bold));
			return renderLine(lines.join("\n"));
		}
	});
};
const renderMultiSelectError = (state, pointer, theme, renderOptions) => {
	if (isSome(state.error)) return match(state.error.value.split(NEWLINE_REGEXP), {
		onEmpty: () => "",
		onNonEmpty: (errorLines) => {
			if (renderOptions?.plain === true) return separateSymbol(pointer, errorLines.join("\n"));
			const prefix = annotateSymbol(theme, pointer, theme.errorColor);
			const lines = map$4(errorLines, (str) => annotateErrorLine(theme, str));
			return "\x1B[s\n" + separateSymbol(prefix, lines.join("\n")) + "\x1B[u";
		}
	});
	return "";
};
const renderChoiceDescription = (choice, isActive, theme, renderOptions) => {
	if (!choice.disabled && choice.description && isActive) {
		const text = theme.descriptionSeparator + choice.description;
		return renderOptions?.plain === true ? text : annotate(theme.colors, text, theme.mutedColor);
	}
	return "";
};
const metaOptionsCount = 2;
const renderMultiSelectTitle = (title, isHighlighted, theme, renderOptions) => {
	if (renderOptions?.plain === true || !isHighlighted) return title;
	return annotate(theme.colors, title, combine(underlined, theme.primaryColor));
};
const renderMultiSelectChoices = (state, options, figures, renderOptions) => {
	const choices = options.choices;
	const checkboxWidth = Math.max(figures.checkboxOn.length, figures.checkboxOff.length);
	const selectableCount = choices.filter((choice) => !choice.disabled).length;
	const selectAllText = Array.from(state.selectedIndices).filter((index) => !choices[index].disabled).length === selectableCount ? options?.selectNone ?? "Select None" : options?.selectAll ?? "Select All";
	const inverseSelectionText = options?.inverseSelection ?? "Inverse Selection";
	const metaOptions = [{ title: selectAllText }, { title: inverseSelectionText }];
	const allChoices = [...metaOptions, ...choices];
	const toDisplay = entriesToDisplay(state.index, allChoices.length, options.maxPerPage);
	const documents = [];
	for (let index = toDisplay.startIndex; index < toDisplay.endIndex; index++) {
		const choice = allChoices[index];
		const isHighlighted = state.index === index;
		const prefix = renderPagingPrefix(figures, index === toDisplay.startIndex && toDisplay.startIndex > 0, index === toDisplay.endIndex - 1 && toDisplay.endIndex < allChoices.length);
		if (index < metaOptions.length) {
			const title = renderMultiSelectTitle(choice.title, isHighlighted, figures, renderOptions);
			documents.push(prefix + (prefix.length === 0 ? "" : " ") + title);
		} else {
			const choiceIndex = index - metaOptions.length;
			const checkbox = state.selectedIndices.has(choiceIndex) ? figures.checkboxOn : figures.checkboxOff;
			const annotatedCheckbox = isHighlighted && renderOptions?.plain !== true ? annotate(figures.colors, checkbox, figures.primaryColor) : checkbox;
			const selectChoice = choice;
			const title = renderChoiceTitle(selectChoice, isHighlighted, figures, renderOptions);
			const description = renderChoiceDescription(selectChoice, isHighlighted, figures, renderOptions);
			const checkboxPrefix = checkboxWidth === 0 ? "" : annotatedCheckbox + " ".repeat(checkboxWidth - checkbox.length + 1);
			documents.push(prefix + (prefix.length === 0 ? "" : " ") + checkboxPrefix + title + " " + description);
		}
	}
	return documents.join("\n");
};
const renderMultiSelectNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const choices = renderMultiSelectChoices(state, options, figures);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const promptMsg = renderSelectOutput(leadingSymbol, trailingSymbol, options, figures);
	const error = renderMultiSelectError(state, figures.pointer, figures);
	return cursorHide + withSelectHeader(promptMsg, choices) + error;
});
const renderMultiSelectSubmission = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const selectedText = Array.from(state.selectedIndices).sort(Order).map((index) => options.choices[index].title).join(", ");
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	return (renderSelectOutput(leadingSymbol, trailingSymbol, options, figures) ?? leadingSymbol) + " " + annotate(figures.colors, selectedText, figures.submittedColor) + "\n";
});
const processMultiSelectCursorUp = (state, totalChoices) => {
	const newIndex = state.index === 0 ? totalChoices - 1 : state.index - 1;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		index: newIndex
	} }));
};
const processMultiSelectCursorDown = (state, totalChoices) => {
	const newIndex = (state.index + 1) % totalChoices;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		index: newIndex
	} }));
};
const processSpace = (state, options) => {
	const selectedIndices = new Set(state.selectedIndices);
	if (state.index === 0) {
		const selectableCount = options.choices.filter((choice) => !choice.disabled).length;
		if (Array.from(state.selectedIndices).filter((index) => !options.choices[index].disabled).length === selectableCount) selectedIndices.clear();
		else for (let i = 0; i < options.choices.length; i++) if (!options.choices[i].disabled) selectedIndices.add(i);
	} else if (state.index === 1) for (let i = 0; i < options.choices.length; i++) if (options.choices[i].disabled || state.selectedIndices.has(i)) selectedIndices.delete(i);
	else selectedIndices.add(i);
	else {
		const choiceIndex = state.index - metaOptionsCount;
		if (options.choices[choiceIndex].disabled) return succeed$1(Action$1.Beep());
		else if (selectedIndices.has(choiceIndex)) selectedIndices.delete(choiceIndex);
		else selectedIndices.add(choiceIndex);
	}
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		selectedIndices
	} }));
};
const handleMultiSelectClear = (options) => fnUntraced(function* (state, _) {
	const columns = yield* (yield* Terminal).columns;
	const figures = yield* getTheme(options);
	const clearPrompt = eraseLine + "\x1B[G";
	const promptText = renderSelectOutput(figures.prefix, figures.pointerSmall, options, figures, { plain: true });
	const choicesText = renderMultiSelectChoices(state, options, figures, { plain: true });
	const errorText = renderMultiSelectError(state, figures.pointer, figures, { plain: true });
	return clearOutputWithError(withSelectHeader(promptText, choicesText), columns, errorText) + clearPrompt;
});
const handleMultiSelectProcess = (options) => {
	return (input, state) => {
		const totalChoices = options.choices.length + metaOptionsCount;
		switch (input.key.name) {
			case "k":
			case "up": return processMultiSelectCursorUp({
				...state,
				error: none()
			}, totalChoices);
			case "j":
			case "down":
			case "tab": return processMultiSelectCursorDown({
				...state,
				error: none()
			}, totalChoices);
			case "space": return processSpace(state, options);
			case "enter":
			case "return": {
				const selectedIndices = Array.from(state.selectedIndices).filter((index) => !options.choices[index].disabled);
				const selectedCount = selectedIndices.length;
				if (options.min !== void 0 && selectedCount < options.min) return succeed$1(Action$1.NextFrame({ state: {
					...state,
					error: some(`At least ${options.min} are required`)
				} }));
				if (options.max !== void 0 && selectedCount > options.max) return succeed$1(Action$1.NextFrame({ state: {
					...state,
					error: some(`At most ${options.max} choices are allowed`)
				} }));
				const selectedValues = selectedIndices.sort(Order).map((index) => options.choices[index].value);
				return succeed$1(Action$1.Submit({ value: selectedValues }));
			}
			default: return succeed$1(Action$1.Beep());
		}
	};
};
const handleMultiSelectRender = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderMultiSelectNextFrame(state, options),
			Submit: () => renderMultiSelectSubmission(state, options)
		});
	};
};
const handleNumberClear = (options) => {
	return fnUntraced(function* (state, _) {
		const columns = yield* (yield* Terminal).columns;
		const figures = yield* getTheme(options);
		const resetCurrentLine = eraseLine + "\x1B[G";
		const errorText = renderNumberError(state, figures.pointerSmall, figures, { plain: true });
		const promptText = renderNumberOutput(state, figures.prefix, figures.pointerSmall, options, figures, { plain: true });
		return clearOutputWithError(promptText, columns, errorText) + resetCurrentLine;
	});
};
const renderNumberInput = (state, submitted, theme, renderOptions) => {
	const value = state.value === "" ? "" : `${state.value}`;
	if (submitted || renderOptions?.plain === true) return value;
	const annotation = isSome(state.error) ? theme.errorColor : combine(underlined, theme.primaryColor);
	return annotate(theme.colors, value, annotation);
};
const renderNumberError = (state, pointer, theme, renderOptions) => {
	if (isSome(state.error)) return match(state.error.value.split(NEWLINE_REGEXP), {
		onEmpty: () => "",
		onNonEmpty: (errorLines) => {
			if (renderOptions?.plain === true) return separateSymbol(pointer, errorLines.join("\n"));
			const prefix = annotateSymbol(theme, pointer, theme.errorColor);
			const lines = map$4(errorLines, (str) => annotateErrorLine(theme, str));
			return "\x1B[s\n" + separateSymbol(prefix, lines.join("\n")) + "\x1B[u";
		}
	});
	return "";
};
const renderNumberOutput = (state, leadingSymbol, trailingSymbol, options, theme, renderOptions, submitted = false) => {
	const value = renderNumberInput(state, submitted, theme, renderOptions);
	return renderPrompt(value, options.message, leadingSymbol, trailingSymbol, theme, renderOptions);
};
const renderNumberNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const errorMsg = renderNumberError(state, figures.pointerSmall, figures);
	return renderNumberOutput(state, leadingSymbol, trailingSymbol, options, figures) + errorMsg;
});
const renderNumberSubmission = /*#__PURE__*/ fnUntraced(function* (nextState, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	return renderNumberOutput(nextState, leadingSymbol, trailingSymbol, options, figures, void 0, true) + "\n";
});
const processNumberBackspace = (state) => {
	if (state.value.length <= 0) return succeed$1(Action$1.Beep());
	const value = state.value.slice(0, state.value.length - 1);
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value,
		error: none()
	} }));
};
const processNumberClear = (state) => succeed$1(Action$1.NextFrame({ state: {
	...state,
	cursor: 0,
	value: "",
	error: none()
} }));
const defaultIntProcessor = (input, state) => {
	if (state.value.length === 0 && input === "-") return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value: "-",
		error: none()
	} }));
	const parsed = globalThis.Number.parseInt(state.value + input);
	if (globalThis.Number.isNaN(parsed)) return succeed$1(Action$1.Beep());
	else return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value: `${parsed}`,
		error: none()
	} }));
};
const defaultFloatProcessor = (input, state) => {
	if (input === "." && state.value.includes(".")) return succeed$1(Action$1.Beep());
	if (state.value.length === 0 && input === "-") return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value: "-",
		error: none()
	} }));
	const parsed = globalThis.Number.parseFloat(state.value + input);
	if (globalThis.Number.isNaN(parsed)) return succeed$1(Action$1.Beep());
	else return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value: input === "." ? `${parsed}.` : state.value.includes(".") && /^\d$/.test(input) ? state.value + input : `${parsed}`,
		error: none()
	} }));
};
const handleRenderInteger = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderNumberNextFrame(state, options),
			Submit: () => renderNumberSubmission(state, options)
		});
	};
};
const handleProcessInteger = (options) => {
	return (input, state) => {
		if (input.key.ctrl && input.key.name === "u") return processNumberClear(state);
		switch (input.key.name) {
			case "backspace": return processNumberBackspace(state);
			case "k":
			case "up": return succeed$1(Action$1.NextFrame({ state: {
				...state,
				value: state.value === "" || state.value === "-" ? `${options.incrementBy}` : `${globalThis.Number.parseInt(state.value) + options.incrementBy}`,
				error: none()
			} }));
			case "j":
			case "down": return succeed$1(Action$1.NextFrame({ state: {
				...state,
				value: state.value === "" || state.value === "-" ? `-${options.decrementBy}` : `${globalThis.Number.parseInt(state.value) - options.decrementBy}`,
				error: none()
			} }));
			case "enter":
			case "return": {
				const parsed = globalThis.Number.parseInt(state.value);
				if (globalThis.Number.isNaN(parsed)) return succeed$1(Action$1.NextFrame({ state: {
					...state,
					error: some("Must provide an integer value")
				} }));
				else return match$2(options.validate(parsed), {
					onFailure: (error) => Action$1.NextFrame({ state: {
						...state,
						error: some(error)
					} }),
					onSuccess: (value) => Action$1.Submit({ value })
				});
			}
			default: return defaultIntProcessor(getOrElse(input.input, () => ""), state);
		}
	};
};
const handleRenderFloat = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderNumberNextFrame(state, options),
			Submit: () => renderNumberSubmission(state, options)
		});
	};
};
const handleProcessFloat = (options) => {
	return (input, state) => {
		if (input.key.ctrl && input.key.name === "u") return processNumberClear(state);
		switch (input.key.name) {
			case "backspace": return processNumberBackspace(state);
			case "k":
			case "up": return succeed$1(Action$1.NextFrame({ state: {
				...state,
				value: state.value === "" || state.value === "-" ? `${options.incrementBy}` : `${globalThis.Number.parseFloat(state.value) + options.incrementBy}`,
				error: none()
			} }));
			case "j":
			case "down": return succeed$1(Action$1.NextFrame({ state: {
				...state,
				value: state.value === "" || state.value === "-" ? `-${options.decrementBy}` : `${globalThis.Number.parseFloat(state.value) - options.decrementBy}`,
				error: none()
			} }));
			case "enter":
			case "return": {
				const parsed = globalThis.Number.parseFloat(state.value);
				if (globalThis.Number.isNaN(parsed)) return succeed$1(Action$1.NextFrame({ state: {
					...state,
					error: some("Must provide a floating point value")
				} }));
				else return flatMap$1(sync(() => round(parsed, options.precision)), (rounded) => match$2(options.validate(rounded), {
					onFailure: (error) => Action$1.NextFrame({ state: {
						...state,
						error: some(error)
					} }),
					onSuccess: (value) => Action$1.Submit({ value })
				}));
			}
			default: return defaultFloatProcessor(getOrElse(input.input, () => ""), state);
		}
	};
};
const renderSelectOutput = (leadingSymbol, trailingSymbol, options, theme, renderOptions) => options.message === void 0 ? void 0 : renderPrompt("", options.message, leadingSymbol, trailingSymbol, theme, renderOptions);
const withSelectHeader = (header, body) => header === void 0 ? body : header + "\n" + body;
const renderChoicePrefix = (state, choices, toDisplay, currentIndex, figures, renderOptions) => {
	const prefix = renderPagingPrefix(figures, currentIndex === toDisplay.startIndex && toDisplay.startIndex > 0, currentIndex === toDisplay.endIndex - 1 && toDisplay.endIndex < choices.length);
	if (renderOptions?.plain === true) return state === currentIndex ? figures.pointer + prefix : prefix + " ".repeat(figures.pointer.length);
	if (choices[currentIndex].disabled) {
		const annotation = combine(bold, figures.mutedColor);
		return state === currentIndex ? annotateSymbol(figures, figures.pointer, annotation) + prefix : prefix + " ".repeat(figures.pointer.length);
	}
	return state === currentIndex ? annotateSymbol(figures, figures.pointer, figures.primaryColor) + prefix : prefix + " ".repeat(figures.pointer.length);
};
const renderChoiceTitle = (choice, isSelected, theme, renderOptions) => {
	if (renderOptions?.plain === true) return choice.title;
	const title = choice.title;
	if (isSelected) return choice.disabled ? annotate(theme.colors, title, combine(underlined, theme.mutedColor)) : annotate(theme.colors, title, combine(underlined, theme.primaryColor));
	return choice.disabled ? annotate(theme.colors, title, combine(strikethrough, theme.mutedColor)) : title;
};
const renderSelectChoices = (state, options, figures, renderOptions) => {
	const choices = options.choices;
	const toDisplay = entriesToDisplay(state, choices.length, options.maxPerPage);
	const documents = [];
	for (let index = toDisplay.startIndex; index < toDisplay.endIndex; index++) {
		const choice = choices[index];
		const isSelected = state === index;
		const prefix = renderChoicePrefix(state, choices, toDisplay, index, figures, renderOptions);
		const title = renderChoiceTitle(choice, isSelected, figures, renderOptions);
		const description = renderChoiceDescription(choice, isSelected, figures, renderOptions);
		documents.push(prefix + title + " " + description);
	}
	return documents.join("\n");
};
const renderSelectNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const choices = renderSelectChoices(state, options, figures);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const promptMsg = renderSelectOutput(leadingSymbol, trailingSymbol, options, figures);
	return cursorHide + withSelectHeader(promptMsg, choices);
});
const renderSelectSubmission = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const selected = options.choices[state].title;
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	return (renderSelectOutput(leadingSymbol, trailingSymbol, options, figures) ?? leadingSymbol) + " " + annotate(figures.colors, selected, figures.submittedColor) + "\n";
});
const processSelectCursorUp = (state, choices) => {
	if (state === 0) return succeed$1(Action$1.NextFrame({ state: choices.length - 1 }));
	return succeed$1(Action$1.NextFrame({ state: state - 1 }));
};
const processSelectCursorDown = (state, choices) => {
	if (state === choices.length - 1) return succeed$1(Action$1.NextFrame({ state: 0 }));
	return succeed$1(Action$1.NextFrame({ state: state + 1 }));
};
const processSelectNext = (state, choices) => {
	return succeed$1(Action$1.NextFrame({ state: (state + 1) % choices.length }));
};
const handleSelectRender = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderSelectNextFrame(state, options),
			Submit: () => renderSelectSubmission(state, options)
		});
	};
};
const handleSelectClear = (options) => fnUntraced(function* (state, _) {
	const columns = yield* (yield* Terminal).columns;
	const figures = yield* getTheme(options);
	const clearPrompt = eraseLine + "\x1B[G";
	const promptText = renderSelectOutput(figures.prefix, figures.pointerSmall, options, figures, { plain: true });
	const choicesText = renderSelectChoices(state, options, figures, { plain: true });
	return eraseText(withSelectHeader(promptText, choicesText), columns) + clearPrompt;
});
const handleSelectProcess = (options) => {
	return (input, state) => {
		switch (input.key.name) {
			case "k":
			case "up": return processSelectCursorUp(state, options.choices);
			case "j":
			case "down": return processSelectCursorDown(state, options.choices);
			case "tab": return processSelectNext(state, options.choices);
			case "enter":
			case "return": {
				const selected = options.choices[state];
				if (selected.disabled) return succeed$1(Action$1.Beep());
				return succeed$1(Action$1.Submit({ value: selected.value }));
			}
			default: return succeed$1(Action$1.Beep());
		}
	};
};
const renderClearScreen = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const columns = yield* (yield* Terminal).columns;
	const figures = yield* getTheme(options);
	const resetCurrentLine = eraseLine + "\x1B[G";
	const errorText = renderTextError(state, figures.pointerSmall, figures, { plain: true });
	return clearOutputWithError(renderTextOutput(state, figures.prefix, figures.pointerSmall, options, figures, { plain: true }), columns, errorText) + resetCurrentLine;
});
const renderTextInput = (nextState, options, theme, submitted, renderOptions) => {
	const text = nextState.value;
	if (renderOptions?.plain === true) switch (options.type) {
		case "hidden": return "";
		case "password": return theme.passwordMask.repeat(text.length);
		case "text": return text;
	}
	if (text.length === 0) return "";
	const annotation = isSome(nextState.error) ? theme.errorColor : submitted ? theme.submittedColor : combine(underlined, theme.primaryColor);
	switch (options.type) {
		case "hidden": return "";
		case "password": return annotateSymbol(theme, theme.passwordMask.repeat(text.length), annotation);
		case "text": return annotate(theme.colors, text, annotation);
	}
};
const renderTextError = (nextState, pointer, theme, renderOptions) => {
	if (isSome(nextState.error)) return match(nextState.error.value.split(NEWLINE_REGEXP), {
		onEmpty: () => "",
		onNonEmpty: (errorLines) => {
			if (renderOptions?.plain === true) return separateSymbol(pointer, errorLines.join("\n"));
			const prefix = annotateSymbol(theme, pointer, theme.errorColor);
			const lines = map$4(errorLines, (str) => annotateErrorLine(theme, str));
			return "\x1B[s\n" + separateSymbol(prefix, lines.join("\n")) + "\x1B[u";
		}
	});
	return "";
};
const renderTextOutput = (nextState, leadingSymbol, trailingSymbol, options, theme, renderOptions, submitted = false) => {
	const value = renderTextInput(nextState, options, theme, submitted, renderOptions);
	return renderPrompt(value, options.message, leadingSymbol, trailingSymbol, theme, renderOptions);
};
const renderTextNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const promptMsg = renderTextOutput(state, leadingSymbol, trailingSymbol, options, figures);
	const errorMsg = renderTextError(state, figures.pointerSmall, figures);
	const cursorWidth = options.type === "password" ? figures.passwordMask.length : 1;
	const offset = (state.cursor - state.value.length) * cursorWidth;
	return promptMsg + errorMsg + cursorMove(offset);
});
const renderTextSubmission = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	return renderTextOutput(state, leadingSymbol, trailingSymbol, options, figures, void 0, true) + "\n";
});
const processTextBackspace = (state) => {
	if (state.cursor <= 0) return succeed$1(Action$1.Beep());
	const beforeCursor = state.value.slice(0, state.cursor - 1);
	const afterCursor = state.value.slice(state.cursor);
	const cursor = state.cursor - 1;
	const value = `${beforeCursor}${afterCursor}`;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		cursor,
		value,
		error: none()
	} }));
};
const processTextClear = (state) => succeed$1(Action$1.NextFrame({ state: {
	...state,
	cursor: 0,
	value: "",
	error: none()
} }));
const processTextCursorLeft = (state) => {
	if (state.cursor <= 0) return succeed$1(Action$1.Beep());
	const cursor = state.cursor - 1;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		cursor,
		error: none()
	} }));
};
const processTextCursorRight = (state) => {
	if (state.cursor >= state.value.length) return succeed$1(Action$1.Beep());
	const cursor = Math.min(state.cursor + 1, state.value.length);
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		cursor,
		error: none()
	} }));
};
const processTextCursorStart = (state) => succeed$1(Action$1.NextFrame({ state: {
	...state,
	cursor: 0,
	error: none()
} }));
const processTextCursorEnd = (state) => succeed$1(Action$1.NextFrame({ state: {
	...state,
	cursor: state.value.length,
	error: none()
} }));
const processTab = (state, options) => {
	if (state.value === options.default) return succeed$1(Action$1.Beep());
	const value = state.value.length === 0 ? options.default : state.value;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		value,
		cursor: value.length,
		error: none()
	} }));
};
const defaultTextProcessor = (input, state) => {
	const value = `${state.value.slice(0, state.cursor)}${input}${state.value.slice(state.cursor)}`;
	const cursor = state.cursor + input.length;
	return succeed$1(Action$1.NextFrame({ state: {
		...state,
		cursor,
		value,
		error: none()
	} }));
};
const handleTextRender = (options) => {
	return (state, action) => {
		return Action$1.$match(action, {
			Beep: () => succeed$1(renderBeep),
			NextFrame: ({ state }) => renderTextNextFrame(state, options),
			Submit: () => renderTextSubmission(state, options)
		});
	};
};
const handleTextProcess = (options) => {
	return (input, state) => {
		if (input.key.ctrl) switch (input.key.name) {
			case "u": return processTextClear(state);
			case "a": return processTextCursorStart(state);
			case "e": return processTextCursorEnd(state);
			default: return succeed$1(Action$1.Beep());
		}
		switch (input.key.name) {
			case "backspace": return processTextBackspace(state);
			case "left": return processTextCursorLeft(state);
			case "right": return processTextCursorRight(state);
			case "home": return processTextCursorStart(state);
			case "end": return processTextCursorEnd(state);
			case "enter":
			case "return": {
				const value = state.value;
				return match$2(options.validate(value), {
					onFailure: (error) => Action$1.NextFrame({ state: {
						...state,
						value,
						error: some(error)
					} }),
					onSuccess: (value) => Action$1.Submit({ value })
				});
			}
			case "tab": return processTab(state, options);
			default: return defaultTextProcessor(getOrElse(input.input, () => ""), state);
		}
	};
};
const handleTextClear = (options) => {
	return (state, _) => {
		return renderClearScreen(state, options);
	};
};
const basePrompt = (options, type) => {
	const opts = {
		default: "",
		type,
		validate: succeed$1,
		...options
	};
	const initialState = {
		cursor: opts.default.length,
		value: opts.default,
		error: none()
	};
	return Custom(initialState, {
		render: handleTextRender(opts),
		process: handleTextProcess(opts),
		clear: handleTextClear(opts)
	});
};
const handleToggleClear = /*#__PURE__*/ fnUntraced(function* (options) {
	const columns = yield* (yield* Terminal).columns;
	const figures = yield* getTheme(options);
	const clearPrompt = eraseLine + "\x1B[G";
	const toggleText = options.active + " " + separateSymbol(figures.toggleSeparator, options.inactive);
	const promptText = renderPrompt(toggleText, options.message, figures.prefix, figures.pointerSmall, figures, { plain: true });
	return eraseText(promptText, columns) + clearPrompt;
});
const renderToggle = (value, options, theme, submitted = false) => {
	const separator = annotateSymbol(theme, theme.toggleSeparator, theme.mutedColor);
	const selectedAnnotation = combine(underlined, submitted ? theme.submittedColor : theme.primaryColor);
	const inactive = value ? options.inactive : annotate(theme.colors, options.inactive, selectedAnnotation);
	return (value ? annotate(theme.colors, options.active, selectedAnnotation) : options.active) + " " + separateSymbol(separator, inactive);
};
const renderToggleNextFrame = /*#__PURE__*/ fnUntraced(function* (state, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.prefix, figures.primaryColor);
	const trailingSymbol = annotateSymbol(figures, figures.pointerSmall, figures.mutedColor);
	const toggle = renderToggle(state, options, figures);
	const promptMsg = renderPrompt(toggle, options.message, leadingSymbol, trailingSymbol, figures);
	return cursorHide + promptMsg;
});
const renderToggleSubmission = /*#__PURE__*/ fnUntraced(function* (value, options) {
	const figures = yield* getTheme(options);
	const leadingSymbol = annotateSymbol(figures, figures.tick, figures.successColor);
	const trailingSymbol = annotateSymbol(figures, figures.ellipsis, figures.mutedColor);
	const toggle = renderToggle(value, options, figures, true);
	return renderPrompt(toggle, options.message, leadingSymbol, trailingSymbol, figures) + "\n";
});
const activate = /*#__PURE__*/ succeed$1(/*#__PURE__*/ Action$1.NextFrame({ state: true }));
const deactivate = /*#__PURE__*/ succeed$1(/*#__PURE__*/ Action$1.NextFrame({ state: false }));
const handleToggleRender = (options) => {
	return (state, action) => {
		switch (action._tag) {
			case "Beep": return succeed$1(renderBeep);
			case "NextFrame": return renderToggleNextFrame(state, options);
			case "Submit": return renderToggleSubmission(state, options);
		}
	};
};
const handleToggleProcess = (input, state) => {
	switch (input.key.name) {
		case "0":
		case "j":
		case "delete":
		case "right":
		case "down": return deactivate;
		case "1":
		case "k":
		case "left":
		case "up": return activate;
		case " ":
		case "tab": return state ? deactivate : activate;
		case "enter":
		case "return": return succeed$1(Action$1.Submit({ value: state }));
		default: return succeed$1(Action$1.Beep());
	}
};
const entriesToDisplay = (cursor, total, maxVisible) => {
	const max = maxVisible === void 0 ? total : maxVisible;
	let startIndex = Math.min(total - max, cursor - Math.floor(max / 2));
	if (startIndex < 0) startIndex = 0;
	const endIndex = Math.min(startIndex + max, total);
	return {
		startIndex,
		endIndex
	};
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/TerminalCapabilities.js
/**
* Reference to the terminal capabilities of the current process.
*
* **When to use**
*
* Use when application output should share the built-in help, version, and
* error output's answer. Provide `layer` to detect through
* `ConfigProvider` and `Stdio`, or provide a value to override detection.
*
* **Details**
*
* The default is detected from the current process the first time it is
* read, so later changes to the environment do not affect it. Without a
* `process` global, every flag is `false`.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const TerminalCapabilities = /*#__PURE__*/ Reference("effect/cli/TerminalCapabilities", { defaultValue: () => fromProcess() });
const isPresent = (value) => value !== void 0 && value.length > 0;
const isForcingColor = (value) => isPresent(value) && value !== "0" && value.toLowerCase() !== "false";
const detect = (input) => {
	if (input.term === "dumb") return {
		canColor: false,
		canAnimate: false,
		canPrompt: false
	};
	return {
		canColor: !isPresent(input.noColor) && (isForcingColor(input.forceColor) || input.stdoutIsTerminal),
		canAnimate: input.stdoutIsTerminal,
		canPrompt: input.stdinIsTerminal && input.stdoutIsTerminal
	};
};
const fromProcess = () => {
	const process = globalThis.process;
	return detect({
		noColor: process?.env?.NO_COLOR,
		forceColor: process?.env?.FORCE_COLOR,
		term: process?.env?.TERM,
		stdinIsTerminal: process?.stdin?.isTTY === true,
		stdoutIsTerminal: process?.stdout?.isTTY === true
	});
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Param.js
const TypeId$1 = "~effect/cli/Param";
/**
* Defines the kind discriminator for positional argument parameters.
*
* **When to use**
*
* Use to build low-level `Param` constructors or type positions for positional
* argument parameters.
*
* @see {@link flagKind} for the named flag parameter discriminator
* @see {@link ParamKind} for the full parameter kind union
*
* @stability unstable
* @category constants
* @since 4.0.0
*/
const argumentKind = "argument";
/**
* Defines the kind discriminator for flag parameters.
*
* **When to use**
*
* Use to build low-level `Param` constructors or type positions for named flag
* parameters.
*
* @see {@link argumentKind} for the positional argument parameter discriminator
*
* @stability unstable
* @category constants
* @since 4.0.0
*/
const flagKind = "flag";
const Proto$1 = {
	[TypeId$1]: { _A: identity },
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Type guard to check if a value is a Param.
*
* **Example** (Checking for params)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const maybeParam = Param.String(Param.flagKind, "name")
*
* Param.isParam(maybeParam) // => true
* ```
*
* @stability unstable
* @category guards
* @since 4.0.0
*/
const isParam = (u) => hasProperty(u, TypeId$1);
/**
* Type guard to check if a Single param is a flag (not an argument).
*
* @internal
*/
const isFlagParam = (single) => single.kind === "flag";
/**
* Constructs a leaf `Single` parameter from its kind, name, primitive parser,
* and optional help metadata.
*
* **Details**
*
* The returned parser reads either one positional argument or the named flag,
* depending on `kind`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const makeSingle = (params) => {
	const parse = (args) => params.kind === "argument" ? parsePositional(params.name, params.primitiveType, args) : parseFlag(params.name, params.primitiveType, args);
	return Object.setPrototypeOf({
		_tag: "Single",
		...params,
		description: params.description ?? none(),
		aliases: params.aliases ?? [],
		hidden: params.hidden ?? false,
		parse
	}, Proto$1);
};
/**
* Creates a string parameter.
*
* **Example** (Creating string parameters)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Create a string flag
* const nameFlag = Param.String(Param.flagKind, "name")
*
* // Create a string argument
* const fileArg = Param.String(Param.argumentKind, "file")
*
* // Usage in CLI: --name "John Doe" or as positional argument
* const kinds = [nameFlag.kind, fileArg.kind] // => ["flag", "argument"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const String$3 = (kind, name) => makeSingle({
	name,
	primitiveType: String$5,
	kind
});
/**
* Creates a boolean parameter.
*
* **Example** (Creating boolean parameters)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Create a boolean flag
* const verboseFlag = Param.Boolean(Param.flagKind, "verbose")
*
* // Create a boolean argument
* const enableArg = Param.Boolean(Param.argumentKind, "enable")
*
* // Usage in CLI: --verbose (true) or --no-verbose (false).
* // The flag is required unless made optional or given a fallback.
* // Boolean positional arguments accept true/false.
* const kinds = [verboseFlag.kind, enableArg.kind] // => ["flag", "argument"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Boolean$2 = (kind, name) => makeSingle({
	name,
	primitiveType: Boolean$3,
	kind
});
/**
* Creates an integer parameter.
*
* **Example** (Creating integer parameters)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Create an integer flag
* const portFlag = Param.Int(Param.flagKind, "port")
*
* // Create an integer argument
* const countArg = Param.Int(Param.argumentKind, "count")
*
* // Usage in CLI: --port 8080 or as positional argument: 42
* const kinds = [portFlag.kind, countArg.kind] // => ["flag", "argument"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Int$2 = (kind, name) => makeSingle({
	name,
	primitiveType: Int$4,
	kind
});
/**
* Constructs command-line params that represent a choice between several
* inputs. The input will be mapped to it's associated value during parsing.
*
* **Example** (Creating valued choices)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* type Animal = Dog | Cat
*
* interface Dog {
*   readonly _tag: "Dog"
* }
*
* interface Cat {
*   readonly _tag: "Cat"
* }
*
* const animal = Param.ChoiceWithValue(Param.flagKind, "animal", [
*   ["dog", { _tag: "Dog" }],
*   ["cat", { _tag: "Cat" }]
* ])
* animal.kind // => "flag"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const ChoiceWithValue$1 = (kind, name, choices) => makeSingle({
	name,
	primitiveType: Choice(choices),
	kind
});
/**
* Constructs command-line params that represent a choice between several
* string inputs.
*
* **Example** (Creating string choices)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const logLevel = Param.Literals(Param.flagKind, "log-level", [
*   "debug",
*   "info",
*   "warn",
*   "error"
* ])
* logLevel.kind // => "flag"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Literals$2 = (kind, name, choices) => {
	const mappedChoices = choices.map((value) => [value, value]);
	return ChoiceWithValue$1(kind, name, mappedChoices);
};
const FLAG_DASH_REGEXP = /^-+/;
/**
* Adds an alias to an option.
*
* **When to use**
*
* Use when you need a CLI parameter to accept an alternate name, such as "-f"
* for "--force".
*
* **Details**
*
* This works on any param structure by recursively finding the underlying
* `Single` node and applying the alias there.
*
* **Example** (Adding parameter aliases)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const force = Param.Boolean(Param.flagKind, "force").pipe(
*   Param.withAlias("-f"),
*   Param.withAlias("-F")
* )
*
* // Also works on composed params:
* const count = Param.Int(Param.flagKind, "count").pipe(
*   Param.optional,
*   Param.withAlias("-c") // finds the underlying Single and adds alias
* )
* const kinds = [force.kind, count.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withAlias$1 = /*#__PURE__*/ dual(2, (self, alias) => {
	return transformSingle(self, (single) => makeSingle({
		...single,
		aliases: [...single.aliases, alias.replace(FLAG_DASH_REGEXP, "")]
	}));
});
/**
* Adds a description to an option for help text.
*
* **Details**
*
* Descriptions provide users with information about what the option does
* when they view help documentation.
*
* **Example** (Adding help descriptions)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const verbose = Param.Boolean(Param.flagKind, "verbose").pipe(
*   Param.withAlias("-v"),
*   Param.withDescription("Enable verbose output")
* )
* verbose.kind // => "flag"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withDescription$3 = /*#__PURE__*/ dual(2, (self, description) => {
	return transformSingle(self, (single) => makeSingle({
		...single,
		description: some(description)
	}));
});
/**
* Transforms the parsed value of an option using a mapping function.
*
* **Example** (Mapping parsed values)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const port = Param.Int(Param.flagKind, "port").pipe(
*   Param.map((n) => ({ port: n, url: `http://localhost:${n}` }))
* )
* port.kind // => "flag"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const map$1 = /*#__PURE__*/ dual(2, (self, f) => {
	const parse = (args) => map$3(self.parse(args), ([operands, value]) => [operands, f(value)]);
	return Object.assign(Object.create(Proto$1), {
		_tag: "Map",
		kind: self.kind,
		param: self,
		f,
		parse
	});
});
const transform = (self, f, alternatives = []) => {
	const alternativeParsers = alternatives.map((alternative) => () => alternative().parse);
	return Object.assign(Object.create(Proto$1), {
		_tag: "Transform",
		kind: self.kind,
		param: self,
		alternatives,
		f,
		parse: f(self.parse, alternativeParsers)
	});
};
/**
* Transforms the parsed value of an option using an effectful mapping function.
*
* **Example** (Mapping parsed values effectfully)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { CliError, Param } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const validatedEmail = Param.String(Param.flagKind, "email").pipe(
*   Param.mapEffect((email) =>
*     email.includes("@")
*       ? Effect.succeed(email)
*       : Effect.fail(
*         new CliError.InvalidValue({
*           option: "email",
*           value: email,
*           expected: "valid email format",
*           kind: "flag"
*         })
*       )
*   )
* )
*
* const [, value] = await Effect.runPromise(
*   validatedEmail.parse({
*     arguments: [],
*     flags: { email: ["alice@example.com"] }
*   }).pipe(Effect.provide(CliTestLayer))
* )
* value // => "alice@example.com"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const mapEffect = /*#__PURE__*/ dual(2, (self, f) => transform(self, (parse) => (args) => flatMap$1(parse(args), ([leftover, a]) => f(a).pipe(map$3((b) => [leftover, b])))));
/**
* Makes a flag or positional argument optional.
*
* **Details**
*
* When the parameter is absent, parsing succeeds with `Option.none()` instead
* of failing with a missing option or missing argument error. When present, the
* parsed value is wrapped in `Option.some()`.
*
* **Example** (Making parameters optional)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Create an optional port option
* // - When not provided: returns Option.none()
* // - When provided: returns Option.some(parsedValue)
* const port = Param.optional(Param.Int(Param.flagKind, "port"))
* port.kind // => "flag"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const optional$2 = (param) => {
	const parse = (args) => param.parse(args).pipe(map$3(([leftover, value]) => [leftover, some(value)]), catchTags({
		MissingOption: () => succeed$1([args.arguments, none()]),
		MissingArgument: () => succeed$1([args.arguments, none()])
	}));
	return Object.assign(Object.create(Proto$1), {
		_tag: "Optional",
		kind: param.kind,
		param,
		parse
	});
};
/**
* Makes a flag or positional argument optional by supplying a fallback value.
*
* **Details**
*
* The fallback may be a pure value or an effect. It is used only when the
* parameter is absent; provided values are parsed normally.
*
* **Example** (Providing default values)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Using the pipe operator to make an option optional
* const port = Param.Int(Param.flagKind, "port").pipe(
*   Param.withDefault(8080)
* )
*
* // Can also be used with other combinators
* const verbose = Param.Boolean(Param.flagKind, "verbose").pipe(
*   Param.withAlias("-v"),
*   Param.withDescription("Enable verbose output"),
*   Param.withDefault(false)
* )
* const kinds = [port.kind, verbose.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withDefault$1 = /*#__PURE__*/ dual(2, (self, defaultValue) => {
	if (!isEffect(defaultValue)) return map$1(optional$2(self), getOrElse(() => defaultValue));
	return mapEffect(optional$2(self), match$1({
		onNone: () => defaultValue,
		onSome: succeed$1
	}));
});
/**
* Creates a variadic parameter that can be specified multiple times.
*
* **Details**
*
* This is the base combinator for creating parameters that accept multiple values.
* The `min` and `max` parameters are optional. When they are not provided, the
* parameter can be specified any number of times, from 0 to infinity.
*
* **Example** (Accepting multiple values)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Basic variadic parameter (0 to infinity)
* const tags = Param.variadic(Param.String(Param.flagKind, "tag"))
*
* // Variadic with minimum count
* const inputs = Param.variadic(
*   Param.String(Param.flagKind, "input"),
*   { min: 1 } // at least 1 required
* )
*
* // Variadic with both min and max
* const limited = Param.variadic(Param.String(Param.flagKind, "item"), {
*   min: 2, // at least 2 times
*   max: 2 // at most 2 times
* })
* const kinds = [tags.kind, inputs.kind, limited.kind] // => ["flag", "flag", "flag"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const variadic$1 = (self, options) => {
	const single = getUnderlyingSingleOrThrow(self);
	const parse = (args) => {
		if (single.kind === "argument") return parsePositionalVariadic(self, single, args, options);
		else return parseOptionVariadic(self, single, args, options);
	};
	return Object.assign(Object.create(Proto$1), {
		_tag: "Variadic",
		kind: self.kind,
		param: self,
		min: fromUndefinedOr(options?.min),
		max: fromUndefinedOr(options?.max),
		parse
	});
};
/**
* Wraps an option to require it to be specified at least `min` times.
*
* **Details**
*
* This combinator transforms an option to accept at least `min`
* occurrences on the command line, returning an array of all provided values.
*
* **Example** (Requiring repeated values)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* // Require at least 2 input files
* const inputs = Param.String(Param.flagKind, "input").pipe(
*   Param.atLeast(2),
*   Param.withAlias("-i")
* )
*
* // Parse: --input file1.txt --input file2.txt --input file3.txt
* // Result: ["file1.txt", "file2.txt", "file3.txt"]
* inputs.kind // => "flag"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const atLeast$1 = /*#__PURE__*/ dual(2, (self, min) => {
	if (min < 0) throw new Error("atLeast: min must be non-negative");
	return variadic$1(self, { min });
});
/**
* Sets a custom metavar (placeholder name) for the param in help documentation.
*
* **Details**
*
* The metavar is displayed in usage text to indicate what value the user should provide.
* For example, `--output FILE` shows `FILE` as the metavar.
*
* **Example** (Setting metavars)
*
* ```ts import.meta.vitest
* import { Param } from "effect/cli"
*
* const port = Param.Int(Param.flagKind, "port").pipe(
*   Param.withMetavar("PORT"),
*   Param.filter(
*     (p) => p >= 1 && p <= 65535,
*     () => "Port must be between 1 and 65535"
*   )
* )
* port.kind // => "flag"
* ```
*
* @stability unstable
* @category metadata
* @since 4.0.0
*/
const withMetavar$1 = /*#__PURE__*/ dual(2, (self, metavar) => transformSingle(self, (single) => makeSingle({
	...single,
	typeName: metavar
})));
/**
* Validates parsed values against a Schema, providing detailed error messages.
*
* **Example** (Validating with schemas)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
* import { Param } from "effect/cli"
* const isEmail = Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
*
* const Email = Schema.String.pipe(
*   Schema.check(isEmail)
* )
*
* const email = Param.String(Param.flagKind, "email").pipe(
*   Param.withSchema(Email)
* )
* email.kind // => "flag"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withSchema$2 = /*#__PURE__*/ dual(2, (self, schema) => {
	const decodeParam = decodeUnknownEffect(schema);
	return mapEffect(self, (value) => mapError(decodeParam(value), (error) => {
		const single = getUnderlyingSingleOrThrow(self);
		return new InvalidValue$1({
			option: single.name,
			value: globalThis.String(value),
			expected: `Schema validation failed: ${error.message}`,
			kind: single.kind
		});
	}));
});
const parsePositional = /*#__PURE__*/ fnUntraced(function* (name, primitiveType, args) {
	if (args.arguments.length === 0) return yield* new MissingArgument({ argument: name });
	const arg = args.arguments[0];
	const value = yield* mapError(primitiveType.parse(arg), (error) => new InvalidValue$1({
		option: name,
		value: arg,
		expected: error,
		kind: "argument"
	}));
	return [args.arguments.slice(1), value];
});
const parseFlag = /*#__PURE__*/ fnUntraced(function* (name, primitiveType, args) {
	const providedValues = args.flags[name];
	if (providedValues === void 0 || providedValues.length === 0) return yield* new MissingOption({ option: name });
	if (providedValues.length > 1) return yield* new InvalidValue$1({
		option: name,
		value: `${providedValues.length} occurrences`,
		expected: "at most 1 value",
		kind: "flag"
	});
	const arg = providedValues[0];
	const value = yield* mapError(primitiveType.parse(arg), (error) => new InvalidValue$1({
		option: name,
		value: arg,
		expected: error,
		kind: "flag"
	}));
	return [args.arguments, value];
});
const parsePositionalVariadic = /*#__PURE__*/ fnUntraced(function* (self, single, args, options) {
	const results = [];
	const minValue = options?.min ?? 0;
	const maxValue = options?.max ?? Number.POSITIVE_INFINITY;
	let count = 0;
	let currentArgs = args.arguments;
	while (currentArgs.length > 0 && count < maxValue) {
		const [remainingArgs, value] = yield* self.parse({
			flags: args.flags,
			arguments: currentArgs
		});
		results.push(value);
		currentArgs = remainingArgs;
		count++;
	}
	if (count < minValue) return yield* count === 0 ? new MissingArgument({ argument: single.name }) : new InvalidValue$1({
		option: single.name,
		value: `${count} values`,
		expected: `at least ${minValue} value${minValue === 1 ? "" : "s"}`,
		kind: single.kind
	});
	return [currentArgs, results];
});
const parseOptionVariadic = /*#__PURE__*/ fnUntraced(function* (self, single, args, options) {
	const results = [];
	const values = [single.name, ...single.aliases].flatMap((name) => args.flags[name] ?? []);
	const count = values.length;
	if (isNotUndefined(options?.min) && count < options.min) return yield* count === 0 ? new MissingOption({ option: single.name }) : new InvalidValue$1({
		option: single.name,
		value: `${count} occurrences`,
		expected: `at least ${options.min} value${options.min === 1 ? "" : "s"}`,
		kind: single.kind
	});
	if (isNotUndefined(options?.max) && count > options.max) return yield* new InvalidValue$1({
		option: single.name,
		value: `${count} occurrences`,
		expected: `at most ${options.max} value${options.max === 1 ? "" : "s"}`,
		kind: single.kind
	});
	for (const value of values) {
		const [, parsedValue] = yield* self.parse({
			flags: { [single.name]: [value] },
			arguments: []
		});
		results.push(parsedValue);
	}
	return [args.arguments, results];
});
/**
* Type-safe param matcher that handles the unsafe casting internally.
* This provides a clean API for pattern matching on param types while
* maintaining type safety at the call site.
*/
const matchParam = (param, patterns) => {
	const p = param;
	switch (p._tag) {
		case "Single": return patterns.Single(p);
		case "Map": return patterns.Map(p);
		case "Transform": return patterns.Transform(p);
		case "Optional": return patterns.Optional(p);
		case "Variadic": return patterns.Variadic(p);
	}
};
/**
* Recursively transforms a param by applying a function to any `Single` nodes.
* This is used internally by combinators like `withAlias` to traverse the param tree.
*/
const transformSingle = (param, f) => {
	return matchParam(param, {
		Single: (single) => f(single),
		Map: (mapped) => map$1(transformSingle(mapped.param, f), mapped.f),
		Transform: (mapped) => transform(transformSingle(mapped.param, f), mapped.f, mapped.alternatives.map((alternative) => () => transformSingle(alternative(), f))),
		Optional: (p) => optional$2(transformSingle(p.param, f)),
		Variadic: (p) => variadic$1(transformSingle(p.param, f), {
			min: getOrUndefined(p.min),
			max: getOrUndefined(p.max)
		})
	});
};
/**
* Extracts all Single params from a potentially nested param structure.
* This handles all param combinators including Map, Transform, Optional, and Variadic.
*
* @internal
*/
const extractSingleParams = (param) => {
	return matchParam(param, {
		Single: (single) => [single],
		Map: (mapped) => extractSingleParams(mapped.param),
		Transform: (mapped) => [...extractSingleParams(mapped.param), ...mapped.alternatives.flatMap((alternative) => extractSingleParams(alternative()))],
		Optional: (optional) => extractSingleParams(optional.param),
		Variadic: (variadic) => extractSingleParams(variadic.param)
	});
};
/**
* Gets the underlying Single param from a potentially nested param structure.
* Throws an error if there are no singles or multiple singles found.
*
* @internal
*/
const getUnderlyingSingleOrThrow = (param) => {
	const singles = extractSingleParams(param);
	if (singles.length === 0) throw new Error("No Single param found in param structure");
	if (singles.length > 1) throw new Error(`Multiple Single params found: ${singles.map((s) => s.name).join(", ")}`);
	return singles[0];
};
/**
* Gets param metadata by traversing the structure.
*
* @internal
*/
const getParamMetadata = (param) => {
	return matchParam(param, {
		Single: () => ({
			isOptional: false,
			isVariadic: false,
			variadicMin: none(),
			variadicMax: none()
		}),
		Map: (mapped) => getParamMetadata(mapped.param),
		Transform: (mapped) => getParamMetadata(mapped.param),
		Optional: (optional) => ({
			...getParamMetadata(optional.param),
			isOptional: true
		}),
		Variadic: (variadic) => ({
			...getParamMetadata(variadic.param),
			isVariadic: true,
			variadicMin: variadic.min,
			variadicMax: variadic.max
		})
	});
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Argument.js
/**
* Creates a positional string argument.
*
* **Example** (Creating a string argument)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* const filename = Argument.String("filename")
* filename.kind // => "argument"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const String$2 = (name) => String$3(argumentKind, name);
/**
* Creates a positional integer argument.
*
* **Example** (Creating an integer argument)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* const count = Argument.Int("count")
* count.kind // => "argument"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Int$1 = (name) => Int$2(argumentKind, name);
/**
* Creates a positional choice argument.
*
* **Example** (Creating a choice argument)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* const environment = Argument.Literals("environment", ["dev", "staging", "prod"])
* environment.kind // => "argument"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Literals$1 = (name, choices) => Literals$2(argumentKind, name, choices);
/**
* Makes a positional argument optional.
*
* **Example** (Making an argument optional)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* const optionalVersion = Argument.String("version").pipe(Argument.optional)
* optionalVersion.kind // => "argument"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const optional$1 = (arg) => optional$2(arg);
/**
* Adds a description to a positional argument.
*
* **Example** (Adding an argument description)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* const filename = Argument.String("filename").pipe(
*   Argument.withDescription("The input file to process")
* )
* filename.kind // => "argument"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withDescription$2 = /*#__PURE__*/ dual(2, (self, description) => withDescription$3(self, description));
/**
* Creates a variadic positional argument that accepts multiple values.
*
* **Example** (Accepting multiple values)
*
* ```ts import.meta.vitest
* import { Argument } from "effect/cli"
*
* // Accept any number of files
* const anyFiles = Argument.String("files").pipe(Argument.variadic)
*
* // Accept at least 1 file
* const atLeastOneFile = Argument.String("files").pipe(
*   Argument.variadic({ min: 1 })
* )
*
* // Accept between 1 and 5 files
* const limitedFiles = Argument.String("files").pipe(
*   Argument.variadic({ min: 1, max: 5 })
* )
*
* const kinds = [anyFiles.kind, atLeastOneFile.kind, limitedFiles.kind] // => ["argument", "argument", "argument"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const variadic = /*#__PURE__*/ dual((args) => isParam(args[0]), (self, options) => variadic$1(self, options));
/**
* Validates parsed values against a Schema.
*
* **Example** (Validating parsed values with a schema)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
* import { Argument } from "effect/cli"
*
* const input = Argument.String("input").pipe(
*   Argument.withSchema(Schema.NonEmptyString)
* )
* input.kind // => "argument"
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withSchema$1 = /*#__PURE__*/ dual(2, (self, schema) => withSchema$2(self, schema));
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/CliOutput.js
/**
* Formats and presents CLI help, errors, and version information.
*
* The `Formatter` service turns help documents, errors, and version
* information into strings. The `Presenter` service decides where the built-in
* help, version, and invalid-invocation output of `Command.runWith` is written,
* and can be replaced to suppress or redirect it.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Service reference for the CLI output formatter. Provides a default implementation
* that can be overridden for custom formatting or testing.
*
* **Example** (Accessing the output formatter)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* import { CliOutput } from "effect/cli"
*
* // Access the formatter service
* const program = Effect.gen(function*() {
*   const formatter = yield* CliOutput.Formatter
*
*   // Format version information
*   return formatter.formatVersion("my-cli", "2.1.0")
* })
*
* // Run with default formatter
* await Effect.runPromise(program.pipe(
*   Effect.provide(CliOutput.layer(CliOutput.defaultFormatter({ colors: false })))
* )) // => "my-cli v2.1.0"
* ```
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const Formatter = /*#__PURE__*/ Reference("effect/cli/CliOutput", { defaultValue: () => defaultFormatter() });
/**
* Default presenter that renders events with the current `Formatter` and
* writes them with `Console`.
*
* **Details**
*
* Help and version output goes to `Console.log`. Invalid invocations write
* help to `Console.log` and errors to `Console.error`. When no `Formatter` is
* installed, the default formatter colors output when `TerminalCapabilities`
* says it can.
*
* @see {@link Presenter} for replacing the default output
* @stability unstable
* @category defaults
* @since 4.0.0
*/
const defaultPresenter = { present: /*#__PURE__*/ fnUntraced(function* (event) {
	const context$1 = yield* context();
	const formatter = getOrUndefined$1(context$1, Formatter) ?? defaultFormatter({ colors: get(context$1, TerminalCapabilities).canColor });
	switch (event._tag) {
		case "Help": return yield* log(formatter.formatHelpDoc(event.helpDoc));
		case "InvalidInvocation":
			yield* log(formatter.formatHelpDoc(event.helpDoc));
			return yield* error(formatter.formatErrors(event.errors));
		case "Version": return yield* log(formatter.formatVersion(event.name, event.version));
	}
}) };
/**
* Service reference for the CLI output presenter. Defaults to
* `defaultPresenter`.
*
* @see {@link layerPresenter} for providing a custom presenter
* @stability unstable
* @category services
* @since 4.0.0
*/
const Presenter = /*#__PURE__*/ Reference("effect/cli/CliOutput/Presenter", { defaultValue: () => defaultPresenter });
const escapeControlCharacters = (text) => text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, (character) => `\\x${character.charCodeAt(0).toString(16).padStart(2, "0")}`);
/**
* Creates a default formatter with configurable options.
*
* **Details**
*
* - `colors`: force ANSI colors on or off. Defaults to terminal detection.
* - `inheritedFlags`: how subcommand help renders flags inherited from
*   ancestor commands. `"full"` (default) lists them under `INHERITED FLAGS`,
*   `"summary"` replaces the section with a pointer to the parent command's
*   help, and `"none"` omits it.
* - `globalFlags`: the same choice for `GLOBAL FLAGS`, with the summary
*   pointing at the help of the nearest command that declares global flags
*   (the root command for built-in flags). Commands that declare global flags
*   always list them in full.
*
* **Gotchas**
*
* Per-flag filtering in a custom formatter matches names, not flag identities.
* Renaming a flag without updating the filter silently stops it from matching.
*
* **Example** (Creating default formatters)
*
* ```ts import.meta.vitest
* import { CliError, CliOutput } from "effect/cli"
*
* // Create a formatter without colors for tests or CI environments
* const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
*
* // Create a formatter with colors forced on
* const colorFormatter = CliOutput.defaultFormatter({ colors: true })
*
* // Auto-detect colors based on terminal support (default behavior)
* const autoFormatter = CliOutput.defaultFormatter()
*
* // Point subcommand help at the declaring scope for global flags
* const compactFormatter = CliOutput.defaultFormatter({ globalFlags: "summary" })
*
* const error = new CliError.InvalidValue({
*   option: "foo",
*   value: "bar",
*   expected: "baz",
*   kind: "flag"
* })
*
* noColorFormatter.formatError(error).includes("Invalid value") // => true
* colorFormatter.formatVersion("my-tool", "1.2.3").includes("my-tool") // => true
* autoFormatter.formatVersion("my-tool", "1.2.3").includes("1.2.3") // => true
* compactFormatter.formatVersion("my-tool", "1.2.3").includes("my-tool") // => true
* ```
*
* **Example** (Hiding one inherited flag)
*
* Filter only `inheritedFlags` to keep `--profile` visible on its declaring
* command while hiding it on descendants. Other inherited flags still render.
*
* ```ts import.meta.vitest
* import { Context, Effect, Option } from "effect"
* import { CliOutput } from "effect/cli"
*
* const base = CliOutput.defaultFormatter({ colors: false })
* const formatter: CliOutput.Formatter = {
*   ...base,
*   formatHelpDoc: (doc) =>
*     base.formatHelpDoc({
*       ...doc,
*       inheritedFlags: doc.inheritedFlags?.filter((flag) => flag.name !== "profile")
*     })
* }
*
* const program = Effect.gen(function*() {
*   const output = yield* CliOutput.Formatter
*   return output.formatHelpDoc({
*     description: "Deploy the application",
*     usage: "app deploy",
*     annotations: Context.empty(),
*     flags: [],
*     inheritedFlags: ["profile", "region"].map((name) => ({
*       name,
*       aliases: [],
*       type: "string",
*       description: Option.none(),
*       required: false
*     }))
*   })
* }).pipe(Effect.provide(CliOutput.layer(formatter)))
*
* const help = await Effect.runPromise(program)
* help.includes("--profile") // => false
* help.includes("--region") // => true
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const defaultFormatter = (options) => {
	const useColor = options?.colors ?? detectColors();
	const helpOptions = {
		inheritedFlags: options?.inheritedFlags ?? "full",
		globalFlags: options?.globalFlags ?? "full"
	};
	const colors = useColor ? {
		bold: (text) => `\x1b[1m${text}\x1b[0m`,
		dim: (text) => `\x1b[2m${text}\x1b[0m`,
		cyan: (text) => `\x1b[36m${text}\x1b[0m`,
		green: (text) => `\x1b[32m${text}\x1b[0m`,
		blue: (text) => `\x1b[34m${text}\x1b[0m`,
		yellow: (text) => `\x1b[33m${text}\x1b[0m`,
		magenta: (text) => `\x1b[35m${text}\x1b[0m`
	} : {
		bold: (text) => text,
		dim: (text) => text,
		cyan: (text) => text,
		green: (text) => text,
		blue: (text) => text,
		yellow: (text) => text,
		magenta: (text) => text
	};
	const reset = useColor ? "\x1B[0m" : "";
	const red = useColor ? "\x1B[31m" : "";
	const bold = useColor ? "\x1B[1m" : "";
	return {
		formatHelpDoc: (doc) => formatHelpDocImpl(doc, colors, helpOptions),
		formatCliError: (error) => escapeControlCharacters(error.message),
		formatError: (error) => {
			return `\n${bold}${red}ERROR${reset}\n  ${escapeControlCharacters(error.message)}${reset}`;
		},
		formatErrors: (errors) => {
			if (errors.length === 0) return "";
			if (errors.length === 1) return `\n${bold}${red}ERROR${reset}\n  ${escapeControlCharacters(errors[0].message)}${reset}`;
			const grouped = /* @__PURE__ */ new Map();
			for (const error of errors) {
				const tag = error._tag ?? "Error";
				const group = grouped.get(tag) ?? [];
				group.push(error);
				grouped.set(tag, group);
			}
			const sections = [];
			sections.push(`\n${bold}${red}ERRORS${reset}`);
			for (const [, group] of grouped) for (const error of group) sections.push(`  ${escapeControlCharacters(error.message)}${reset}`);
			return sections.join("\n");
		},
		formatVersion: (name, version) => `${colors.bold(name)} ${colors.dim("v")}${colors.bold(version)}`
	};
};
/**
* Strips ANSI escape codes from a string to calculate visual width.
* @internal
*/
const stripAnsi = (text) => {
	return text.replace(/\u001B\[[0-9;]*m/g, "");
};
/**
* Segments text into grapheme clusters.
* @internal
*/
const graphemeSegmenter = /*#__PURE__*/ new Intl.Segmenter(void 0, { granularity: "grapheme" });
const zeroWidthCodePoints = /[\p{Mark}\p{Control}\p{Default_Ignorable_Code_Point}]/gu;
const emojiPresentation = /\p{Emoji_Presentation}/u;
const isFullWidthCodePoint = (codePoint) => {
	if (codePoint < 4352) return false;
	return codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || codePoint >= 11904 && codePoint <= 12350 || codePoint >= 12352 && codePoint <= 42191 || codePoint >= 44032 && codePoint <= 55203 || codePoint >= 63744 && codePoint <= 64255 || codePoint >= 65040 && codePoint <= 65049 || codePoint >= 65072 && codePoint <= 65135 || codePoint >= 65280 && codePoint <= 65376 || codePoint >= 65504 && codePoint <= 65510 || codePoint >= 110592 && codePoint <= 111359 || codePoint >= 127488 && codePoint <= 127569 || codePoint >= 131072 && codePoint <= 262141;
};
const graphemeWidth = (grapheme) => {
	const visible = grapheme.replace(zeroWidthCodePoints, "");
	if (visible.length === 0) return 0;
	if (emojiPresentation.test(grapheme) || grapheme.includes("️")) return 2;
	return isFullWidthCodePoint(visible.codePointAt(0)) ? 2 : 1;
};
/**
* Measures the number of terminal cells a string occupies.
*
* **Details**
*
* Uses the same measurement as built-in help and table rendering. ANSI styling
* is stripped before measuring graphemes: zero-width graphemes count as `0`,
* emoji presentation sequences and fullwidth characters as `2`, and other
* graphemes as `1`.
*
* **Example** (Measuring terminal-cell widths)
*
* ```ts import.meta.vitest
* import { CliOutput } from "effect/cli"
*
* CliOutput.displayWidth("file") // => 4
* CliOutput.displayWidth("ファイル") // => 8
* CliOutput.displayWidth("é") // => 1
* CliOutput.displayWidth("1️⃣") // => 2
* CliOutput.displayWidth("\u001B[1mbold\u001B[0m") // => 4
* ```
*
* @stability unstable
* @category measuring
* @since 4.0.3
*/
const displayWidth = (text) => {
	let length = 0;
	for (const { segment } of graphemeSegmenter.segment(stripAnsi(text))) length += graphemeWidth(segment);
	return length;
};
/**
* Helper function to pad strings to a specified width.
* @internal
*/
const pad = (s, width) => {
	const actualLength = displayWidth(s);
	const padding = Math.max(0, width - actualLength);
	return s + " ".repeat(padding);
};
/**
* Renders a table with aligned columns.
* @internal
*/
const renderTable = (rows, widthCap) => {
	const maxColumn = Math.max(...rows.map((r) => displayWidth(r.left))) + 4;
	const col = widthCap === void 0 ? maxColumn : Math.min(maxColumn, widthCap);
	return rows.map(({ left, right }) => `  ${pad(left, Math.max(col, displayWidth(left) + 1))}${right}`).join("\n");
};
const formatSubcommandName = (name, alias) => alias ? `${name}, ${alias}` : name;
/**
* Internal implementation of help formatting that accepts configurable color functions.
* @internal
*/
const formatHelpDocImpl = (doc, colors, options) => {
	const sections = [];
	if (doc.description) {
		sections.push(colors.bold("DESCRIPTION"));
		sections.push(`  ${doc.description}`);
		sections.push("");
	}
	sections.push(colors.bold("USAGE"));
	sections.push(`  ${colors.cyan(doc.usage)}`);
	sections.push("");
	if (doc.args && doc.args.length > 0) {
		sections.push(colors.bold("ARGUMENTS"));
		const argRows = doc.args.map((arg) => {
			let name = arg.name;
			if (arg.variadic) name += "...";
			const nameType = `${colors.green(name)} ${colors.dim(arg.type)}`;
			const optionalSuffix = arg.required ? "" : colors.dim(" (optional)");
			return {
				left: nameType,
				right: getOrElse(arg.description, () => "") + optionalSuffix
			};
		});
		sections.push(renderTable(argRows, 25));
		sections.push("");
	}
	const renderFlags = (title, flags) => {
		sections.push(colors.bold(title));
		sections.push(renderTable(flags.map((flag) => {
			return {
				left: [`--${flag.name}`, ...flag.aliases].map(colors.green).join(", ") + (flag.type !== "boolean" ? ` ${colors.dim(flag.type)}` : ""),
				right: getOrElse(flag.description, () => "")
			};
		})));
		sections.push("");
	};
	const summaries = [];
	const renderFlagSection = (title, flags, mode, summaryPath) => {
		if (!flags || flags.length === 0 || mode === "none") return;
		if (mode === "summary" && summaryPath && summaryPath.length > 0) summaries.push(`Run '${summaryPath.join(" ")} --help' for ${title.toLowerCase()}`);
		else renderFlags(title, flags);
	};
	if (doc.flags.length > 0) renderFlags("FLAGS", doc.flags);
	const commandPath = doc.commandPath;
	renderFlagSection("INHERITED FLAGS", doc.inheritedFlags, options.inheritedFlags, commandPath?.slice(0, -1));
	const globalFlagsScope = doc.globalFlagsScope ?? commandPath?.slice(0, 1);
	const declaresGlobalFlags = commandPath === void 0 || globalFlagsScope?.length === commandPath.length;
	renderFlagSection("GLOBAL FLAGS", doc.globalFlags, declaresGlobalFlags ? "full" : options.globalFlags, globalFlagsScope);
	if (summaries.length > 0) sections.push(...summaries, "");
	if (doc.subcommands && doc.subcommands.length > 0) {
		const ungrouped = doc.subcommands.find((group) => group.group === void 0);
		if (ungrouped) {
			sections.push(colors.bold("SUBCOMMANDS"));
			sections.push(renderTable(ungrouped.commands.map((sub) => ({
				left: colors.cyan(formatSubcommandName(sub.name, sub.alias)),
				right: sub.shortDescription ?? sub.description
			})), 20));
			if (doc.subcommands.length > 1) sections.push("");
		}
		for (const group of doc.subcommands) {
			if (group.group === void 0) continue;
			sections.push(colors.bold(`${group.group}:`));
			sections.push(renderTable(group.commands.map((sub) => ({
				left: colors.cyan(formatSubcommandName(sub.name, sub.alias)),
				right: sub.shortDescription ?? sub.description
			})), 20));
			sections.push("");
		}
	}
	if (doc.examples && doc.examples.length > 0) {
		sections.push(colors.bold("EXAMPLES"));
		let first = true;
		let previousHadDescription = false;
		for (const example of doc.examples) {
			if (example.description) {
				if (!first) sections.push("");
				sections.push(`  ${colors.dim(`# ${example.description}`)}`);
			} else if (previousHadDescription) sections.push("");
			sections.push(`  ${colors.cyan(example.command)}`);
			first = false;
			previousHadDescription = !!example.description;
		}
		sections.push("");
	}
	if (sections[sections.length - 1] === "") sections.pop();
	return sections.join("\n");
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/config.js
/**
* Config Internal
* ================
*
* The processed internal representation of a Command.Config declaration.
* Separates the user's declared config shape from the flat parsing representation.
*
* Key concepts:
* - ConfigInternal: The full processed form (flags, arguments, tree)
* - ConfigInternal.Tree: Maps declaration keys to nodes
* - ConfigInternal.Node: Param reference, Array, or Nested subtree
*
* Example transformation from Command.Config to Command.Config.Internal:
*
* ```ts
* // User declares:
* const config = {
*   verbose: Flag.Boolean("verbose").pipe(Flag.withDefault(false)),
*   server: {
*     host: Flag.String("host"),
*     port: Flag.Int("port")
*   },
*   files: Argument.String("files").pipe(Argument.variadic)
* }
*
* // Becomes Config.Internal:
* {
*   arguments: [filesParam],           // Flat array of arguments
*   flags: [verboseParam, hostParam, portParam],  // Flat array of flags
*   orderedParams: [verboseParam, hostParam, portParam, filesParam],
*   tree: {                            // Preserves nested structure
*     verbose: { _tag: "Param", index: 0 },
*     server: {
*       _tag: "Nested",
*       tree: {
*         host: { _tag: "Param", index: 1 },
*         port: { _tag: "Param", index: 2 }
*       }
*     },
*     files: { _tag: "Param", index: 3 }
*   }
* }
* ```
*
* This separation allows:
* 1. Flat iteration over all params for parsing/validation
* 2. Reconstruction of original nested shape for handler input
*/
const ConfigInternalTypeId = "~effect/cli/Command/Config/Internal";
/**
* Parses a Command.Config into a ConfigInternal.
*
* Walks the config structure and:
* 1. Extracts all Params into flat arrays (flags, arguments, orderedParams)
* 2. Builds a tree that remembers the original nested structure
* 3. Assigns each Param an index to link parsed values back
*
* @internal
*/
const parseConfig = (config) => {
	const orderedParams = [];
	const flags = [];
	const args = [];
	function parse(config) {
		const tree = Object.create(null);
		for (const key of Object.keys(config)) tree[key] = parseValue(config[key]);
		return tree;
	}
	function parseValue(value) {
		if (Array.isArray(value)) return {
			_tag: "Array",
			children: value.map((v) => parseValue(v))
		};
		else if (isParam(value)) {
			const index = orderedParams.length;
			orderedParams.push(value);
			if (value.kind === "argument") args.push(value);
			else flags.push(value);
			return {
				_tag: "Param",
				index
			};
		} else return {
			_tag: "Nested",
			tree: parse(value)
		};
	}
	return {
		[ConfigInternalTypeId]: ConfigInternalTypeId,
		flags,
		arguments: args,
		orderedParams,
		tree: parse(config)
	};
};
/**
* @internal
*/
const emptyConfig = /*#__PURE__*/ parseConfig({});
/**
* Reconstructs the original nested config shape from parsed values.
*
* Uses the tree as a blueprint to place each parsed value back into
* its original position in the nested structure.
*
* @internal
*/
const reconstructTree = (tree, results) => {
	const output = {};
	for (const key of Object.keys(tree)) assignProperty(output, key, nodeValue(tree[key]));
	return output;
	function nodeValue(node) {
		switch (node._tag) {
			case "Param": return results[node.index];
			case "Array": return node.children.map((child) => nodeValue(child));
			case "Nested": return reconstructTree(node.tree, results);
		}
	}
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/command.js
/**
* Command Implementation
* ======================
*
* Internal implementation details for CLI commands.
* Public API is in ../Command.ts
*/
const TypeId = "~effect/cli/Command";
/**
* Casts a Command to its internal implementation.
* For use by internal modules that need access to config, parse, handle, etc.
*/
const toImpl = (self) => self;
const Proto = { .../*#__PURE__*/ Prototype({
	label: "Command",
	evaluate() {
		return toImpl(this).service;
	}
}) };
/**
* Internal command constructor. Only accepts already-parsed ConfigInternal.
*/
const makeCommand = (options) => {
	const config = options.config;
	const contextConfig = options.contextConfig ?? emptyConfig;
	const service = options.service ?? Service(`~effect/cli/Command/${options.name}`);
	const annotations = options.annotations ?? empty$1();
	const globalFlags = options.globalFlags ?? [];
	const subcommands = options.subcommands ?? [];
	const resolveExamples = options.resolveExamples ?? noExamples;
	const handle = (input, commandPath) => isNotUndefined(options.handle) ? options.handle(input, commandPath) : fail(new ShowHelp({
		commandPath,
		errors: []
	}));
	const parse = options.parse ?? makeParser(config);
	const parseContext = options.parseContext ?? makeParser(contextConfig, { allowLeftovers: true });
	const buildHelpDoc = (commandPath) => {
		const args = [];
		const flags = [];
		for (const arg of config.arguments) {
			const singles = extractSingleParams(arg);
			const metadata = getParamMetadata(arg);
			for (const single of singles) args.push({
				name: single.name,
				type: single.typeName ?? getTypeName(single.primitiveType),
				description: single.description,
				required: !metadata.isOptional && (!metadata.isVariadic || exists(metadata.variadicMin, (min) => min > 0)),
				variadic: metadata.isVariadic
			});
		}
		let usage = commandPath.length > 0 ? commandPath.join(" ") : options.name;
		if (subcommands.some((group) => group.commands.some((c) => !c.unlisted))) usage += " <subcommand>";
		usage += " [flags]";
		for (const arg of args) {
			const argName = arg.variadic ? `<${arg.name}...>` : `<${arg.name}>`;
			usage += ` ${arg.required ? argName : `[${argName}]`}`;
		}
		for (const option of config.flags) {
			const singles = extractSingleParams(option);
			const metadata = getParamMetadata(option);
			for (const single of singles) {
				if (single.hidden) continue;
				flags.push(toFlagDoc(single, metadata));
			}
		}
		const subcommandDocs = [];
		for (const group of subcommands) {
			const visible = group.commands.filter((c) => !c.unlisted);
			if (visible.length === 0) continue;
			subcommandDocs.push({
				group: group.group,
				commands: map$4(visible, (subcommand) => ({
					name: subcommand.name,
					alias: subcommand.alias,
					shortDescription: subcommand.shortDescription,
					description: subcommand.description ?? ""
				}))
			});
		}
		const examples = resolveExamples(commandPath);
		return {
			description: options.description ?? "",
			usage,
			flags,
			annotations,
			...args.length > 0 && { args },
			...subcommandDocs.length > 0 && { subcommands: subcommandDocs },
			...examples.length > 0 && { examples }
		};
	};
	return Object.assign(Object.create(Proto), {
		[TypeId]: TypeId,
		name: options.name,
		examples: resolveExamples([options.name]),
		resolveExamples,
		annotations,
		globalFlags,
		subcommands,
		unlisted: options.unlisted ?? false,
		config,
		contextConfig,
		service,
		parse,
		parseContext,
		handle,
		buildHelpDoc,
		...isNotUndefined(options.description) ? { description: options.description } : {},
		...isNotUndefined(options.shortDescription) ? { shortDescription: options.shortDescription } : {},
		...isNotUndefined(options.alias) ? { alias: options.alias } : {}
	});
};
const noExamples = () => [];
/**
* Converts a single flag param into a FlagDoc for help display.
*
* @internal
*/
const toFlagDoc = (single, metadata) => {
	const formattedAliases = single.aliases.map((alias) => alias.length === 1 ? `-${alias}` : `--${alias}`);
	const type = single.typeName ?? getTypeName(single.primitiveType);
	return {
		name: single.name,
		aliases: formattedAliases,
		type: single.optionalValue === void 0 ? type : `[=${type}]`,
		description: appendChoiceKeys(single.description, getChoiceKeys(single.primitiveType)),
		required: single.primitiveType._tag !== "Boolean" && !metadata.isOptional
	};
};
const appendChoiceKeys = (description, choiceKeys) => {
	if (choiceKeys === void 0 || choiceKeys.length === 0) return description;
	const choiceSuffix = `(choices: ${choiceKeys.join(", ")})`;
	return match$1(description, {
		onNone: () => some(choiceSuffix),
		onSome: (value) => some(`${value} ${choiceSuffix}`)
	});
};
/**
* Creates a parser for a given config. Used as the default for both `parse`
* and `parseContext`, and also by `withSharedFlags` to avoid constructing a
* full throwaway command.
*/
const makeParser = (cfg, options) => fnUntraced(function* (input) {
	const parsedArgs = {
		flags: input.flags,
		arguments: input.arguments
	};
	const [remainingArguments, values] = yield* parseParams(parsedArgs, cfg.orderedParams);
	if (options?.allowLeftovers !== true && remainingArguments.length > 0) return yield* new UnexpectedArgument({ arguments: remainingArguments });
	return reconstructTree(cfg.tree, values);
});
/**
* Parses param values from parsed command arguments into their typed
* representations.
*/
const parseParams = /*#__PURE__*/ fnUntraced(function* (parsedArgs, params) {
	const results = [];
	let currentArguments = parsedArgs.arguments;
	for (const option of params) {
		const [remainingArguments, parsed] = yield* option.parse({
			flags: parsedArgs.flags,
			arguments: currentArguments
		});
		results.push(parsed);
		currentArguments = remainingArguments;
	}
	return [currentArguments, results];
});
/**
* Checks that inherited parent context flags do not reuse names declared by
* child command flags.
*
* When `contextConfig` is supplied, it is used as the inherited flag set;
* otherwise the parent's current context config is checked.
*/
const checkForDuplicateFlags = (parent, subcommands, options) => {
	const parentImpl = toImpl(parent);
	const parentOptionNames = /* @__PURE__ */ new Set();
	const extractNames = (flags) => {
		for (const option of flags) {
			const singles = extractSingleParams(option);
			for (const single of singles) parentOptionNames.add(single.name);
		}
	};
	extractNames((options?.contextConfig ?? parentImpl.contextConfig).flags);
	for (const subcommand of subcommands) {
		const subImpl = toImpl(subcommand);
		for (const option of subImpl.config.flags) {
			const singles = extractSingleParams(option);
			for (const single of singles) if (parentOptionNames.has(single.name)) throw new DuplicateOption({
				option: single.name,
				parentCommand: parent.name,
				childCommand: subcommand.name
			});
		}
	}
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/completions/descriptor.js
/**
* CommandDescriptor — pure-data representation of a command tree for
* shell completion generation.
*
* @internal
*/
const toFlagType = (single) => {
	switch (single.primitiveType._tag) {
		case "Boolean": return { _tag: "Boolean" };
		case "Int": return { _tag: "Int" };
		case "Finite": return { _tag: "Finite" };
		case "Date": return { _tag: "Date" };
		case "Choice": return {
			_tag: "Choice",
			values: getChoiceKeys(single.primitiveType) ?? []
		};
		case "Path": return {
			_tag: "Path",
			pathType: getPathType(single.primitiveType) ?? "either"
		};
		case "FileText":
		case "FileParse":
		case "FileSchema": return {
			_tag: "Path",
			pathType: "file"
		};
		default: return { _tag: "String" };
	}
};
const toArgumentType = (single) => {
	switch (single.primitiveType._tag) {
		case "Int": return { _tag: "Int" };
		case "Finite": return { _tag: "Finite" };
		case "Date": return { _tag: "Date" };
		case "Choice": return {
			_tag: "Choice",
			values: getChoiceKeys(single.primitiveType) ?? []
		};
		case "Path": return {
			_tag: "Path",
			pathType: getPathType(single.primitiveType) ?? "either"
		};
		case "FileText":
		case "FileParse":
		case "FileSchema": return {
			_tag: "Path",
			pathType: "file"
		};
		default: return { _tag: "String" };
	}
};
/**
* @internal
*/
const fromCommand$1 = (cmd, inheritedFlags = []) => {
	const impl = toImpl(cmd);
	const config = impl.config;
	const flags = [];
	const seen = /* @__PURE__ */ new Set();
	for (const [index, flag] of [...config.flags, ...inheritedFlags].entries()) {
		const singles = extractSingleParams(flag);
		for (const single of singles) {
			if (single.kind !== "flag") continue;
			if (single.hidden) continue;
			if (index >= config.flags.length && seen.has(single.name)) continue;
			seen.add(single.name);
			flags.push({
				name: single.name,
				aliases: single.aliases,
				description: getOrUndefined(single.description),
				type: toFlagType(single),
				optionalValue: single.optionalValue !== void 0,
				negation: single.negation
			});
		}
	}
	const args = [];
	for (const arg of config.arguments) {
		const singles = extractSingleParams(arg);
		const metadata = getParamMetadata(arg);
		for (const single of singles) {
			if (single.kind !== "argument") continue;
			args.push({
				name: single.name,
				description: getOrUndefined(single.description),
				required: !metadata.isOptional,
				variadic: metadata.isVariadic,
				type: toArgumentType(single)
			});
		}
	}
	const subcommands = [];
	const sharedFlags = [...inheritedFlags, ...impl.contextConfig.flags];
	for (const group of cmd.subcommands) for (const subcommand of group.commands) {
		if (subcommand.unlisted) continue;
		const descriptor = fromCommand$1(subcommand, sharedFlags);
		subcommands.push(descriptor);
		if (subcommand.alias && subcommand.alias !== subcommand.name) subcommands.push({
			...descriptor,
			name: subcommand.alias
		});
	}
	return {
		name: cmd.name,
		description: cmd.shortDescription ?? cmd.description,
		flags,
		arguments: args,
		subcommands
	};
};
/**
* Whether the flag reads its value from the next word.
*
* @internal
*/
const takesSeparateValue = (flag) => flag.type._tag !== "Boolean" && flag.optionalValue !== true;
/**
* Long name that sets a boolean flag to `false`, or `undefined` when the flag
* has no negated form.
*
* @internal
*/
const negatedName$1 = (flag) => flag.type._tag !== "Boolean" || flag.negation === false ? void 0 : flag.negation ?? `no-${flag.name}`;
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/completions/bash.js
const escapeForBash = (s) => s.replace(/'/g, "'\\''");
const sanitizeFunctionName = (s) => s.replace(/[^a-zA-Z0-9_]/g, "_");
const flagNamesForWordlist = (flag) => {
	const names = [`--${flag.name}`];
	for (const alias of flag.aliases) names.push(alias.length === 1 ? `-${alias}` : `--${alias}`);
	const negation = negatedName$1(flag);
	if (negation !== void 0) names.push(`--${negation}`);
	return names;
};
/** Emit a Bash 3.2-compatible used-flag filter. */
const buildFlagGroupDeclarations = (flags, lines) => {
	if (flags.length === 0) return;
	const groups = flags.map(flagNamesForWordlist);
	lines.push(`  local ${groups.map((_, index) => `_used_${index}=""`).join(" ")}`);
	lines.push(`  for ((i = 1; i < cword; i++)); do`);
	lines.push(`    case "\${words[i]%%=*}" in`);
	groups.forEach((forms, index) => {
		lines.push(`      ${forms.join("|")}) _used_${index}=1 ;;`);
	});
	lines.push(`    esac`);
	lines.push(`  done`);
	lines.push(`  local _filtered_flags=""`);
	groups.forEach((forms, index) => {
		lines.push(`  [[ -n "$_used_${index}" ]] || _filtered_flags+=" ${forms.join(" ")}"`);
	});
	lines.push(``);
};
const removeQuotes = (variable) => [
	`\\\\`,
	`\\"`,
	`\\'`
].map((quote) => `${variable}=\${${variable}//${quote}/}`).join("; ");
/**
* Complete choices without `compgen -W`, which reparses quoted values. Escape
* only the portion readline replaces for the active quote context.
*
* `!` cannot be escaped inside a user-opened double quote without changing the
* resulting argument.
*/
const choicesHelper = (helperName, lines) => {
	lines.push(`${helperName}()`);
	lines.push(`{`);
	lines.push(`  local _cur="$1" _word="$2"; shift 2`);
	lines.push(``);
	lines.push(`  local _head="\${_cur%"$_word"}"`);
	lines.push(`  local _open=""`);
	lines.push(`  case "$_head" in`);
	lines.push(`    *\\') _open="'" ;;`);
	lines.push(`    *\\") _open='"' ;;`);
	lines.push(`  esac`);
	lines.push(``);
	lines.push(`  local _prefix="$_cur" _committed="$_head"`);
	lines.push(`  ${removeQuotes("_prefix")}`);
	lines.push(`  ${removeQuotes("_committed")}`);
	lines.push(``);
	lines.push(`  COMPREPLY=()`);
	lines.push(`  local _choice _rest _match`);
	lines.push(`  for _choice in "$@"; do`);
	lines.push(`    [[ "$_choice" == "$_prefix"* ]] || continue`);
	lines.push(`    _rest="\${_choice#"$_committed"}"`);
	lines.push(`    case "$_open" in`);
	lines.push(`      "'")`);
	lines.push(`        if [[ "$_head" == "'" ]]; then`);
	lines.push(`          _match=\${_rest//\\'/\\'\\\\\\'\\'}`);
	lines.push(`        else`);
	lines.push(`          [[ "$_rest" == *\\'* ]] && continue`);
	lines.push(`          _match="$_rest"`);
	lines.push(`        fi`);
	lines.push(`        ;;`);
	lines.push(`      '"')`);
	lines.push(`        _match="\${_rest//\\\\/\\\\\\\\}"`);
	lines.push(`        _match="\${_match//\\$/\\\\$}"`);
	lines.push("        _match=\"${_match//\\`/\\\\\\`}\"");
	lines.push(`        _match="\${_match//\\"/\\\\\\"}"`);
	lines.push(`        ;;`);
	lines.push(`      *)`);
	lines.push(`        printf -v _match '%q' "$_rest"`);
	lines.push(`        [[ -z "$_head" && "$_match" == '~'* ]] && _match="\\\\$_match"`);
	lines.push(`        ;;`);
	lines.push(`    esac`);
	lines.push(`    [[ -n "$_open" && "$_match" == *"$_open" ]] && _match+="$_open"`);
	lines.push(`    COMPREPLY+=("$_match")`);
	lines.push(`  done`);
	lines.push(`}`);
	lines.push(``);
};
/**
* Complete paths through the choice helper, one `compgen` line per candidate.
* The typed directory is kept as written so expansions in it still apply; only
* the completed name is quoted.
*/
const pathsHelper = (helpers, lines) => {
	lines.push(`${helpers.paths}()`);
	lines.push(`{`);
	lines.push(`  local _kind="$1" _cur="$2" _word="$3"`);
	lines.push(``);
	lines.push(`  local _prefix="$_cur" _committed="\${_cur%"$_word"}"`);
	lines.push(`  ${removeQuotes("_prefix")}`);
	lines.push(`  ${removeQuotes("_committed")}`);
	lines.push(``);
	lines.push(`  local _typed="" _dir="$_committed" _open="" _i`);
	lines.push(`  if [[ "$_word" == */* ]]; then`);
	lines.push(`    _typed="\${_word%/*}/"`);
	lines.push(`    _dir="\${_prefix%/*}/"`);
	lines.push(`    if [[ "$_cur" == "$_word" ]]; then`);
	lines.push(`      for ((_i = 0; _i < \${#_typed}; _i++)); do`);
	lines.push(`        case "$_open\${_typed:_i:1}" in`);
	lines.push(`          \\\\|\\"\\\\) ((_i += 1)) ;;`);
	lines.push(`          \\"|\\') _open="\${_typed:_i:1}" ;;`);
	lines.push(`          \\"\\"|\\'\\') _open="" ;;`);
	lines.push(`        esac`);
	lines.push(`      done`);
	lines.push(`    fi`);
	lines.push(`  fi`);
	lines.push(``);
	lines.push(`  local _path _names=() _rest="\${_word#"$_typed"}"`);
	lines.push(`  while IFS= read -r _path; do`);
	lines.push(`    if [[ "$_path" == "$_dir"* ]]; then`);
	lines.push(`      _names+=("$_committed\${_path#"$_dir"}")`);
	lines.push(`    elif [[ -z "$_committed" ]]; then`);
	lines.push(`      _names+=("$_path")`);
	lines.push(`      _typed="" _rest="" _open=""`);
	lines.push(`    fi`);
	lines.push(`  done < <(compgen "$_kind" -- "$_prefix")`);
	lines.push(`  if [[ -n "$_open" ]]; then`);
	lines.push(`    _typed+="$_open"`);
	lines.push(`    _rest="\${_prefix##*/}"`);
	lines.push(`  fi`);
	lines.push(``);
	lines.push(`  ${helpers.choices} "\${_cur%"$_word"}$_rest" "$_rest" "\${_names[@]}"`);
	lines.push(`  for ((_i = 0; _i < \${#COMPREPLY[@]}; _i++)); do`);
	lines.push(`    COMPREPLY[_i]="$_typed\${COMPREPLY[_i]}"`);
	lines.push(`  done`);
	lines.push(`}`);
	lines.push(``);
};
const valueCompletion = (type, helpers) => {
	switch (type._tag) {
		case "Choice": {
			const values = type.values.map((value) => `'${escapeForBash(value)}'`).join(" ");
			return `${helpers.choices} "$cur" "$_comp_word" ${values}`;
		}
		case "Path": return `${helpers.paths} ${type.pathType === "directory" ? "-d" : "-f"} "$cur" "$_comp_word"`;
		default: return;
	}
};
const generateFunction$1 = (descriptor, parentPath, lines, helpers) => {
	const currentPath = [...parentPath, descriptor.name];
	const funcName = `_${currentPath.map(sanitizeFunctionName).join("_")}`;
	lines.push(`${funcName}()`);
	lines.push(`{`);
	lines.push(`  local cur prev words cword i`);
	lines.push(parentPath.length === 0 ? `  local _command_index=0` : `  local _command_index="$1"`);
	lines.push(`  _init_completion -n "$COMP_WORDBREAKS" || return`);
	if (parentPath.length === 0) lines.push(`  local _comp_word="$2"`);
	lines.push(``);
	const flagsWithValues = descriptor.flags.filter(takesSeparateValue);
	if (flagsWithValues.length > 0) {
		lines.push(`  # Flag value completions`);
		lines.push(`  case "$prev" in`);
		for (const flag of flagsWithValues) {
			const longNames = [`--${flag.name}`];
			for (const alias of flag.aliases) longNames.push(alias.length === 1 ? `-${alias}` : `--${alias}`);
			const completion = valueCompletion(flag.type, helpers);
			if (completion) {
				lines.push(`    ${longNames.join("|")})`);
				lines.push(`      ${completion}`);
				lines.push(`      return`);
				lines.push(`      ;;`);
			}
		}
		lines.push(`  esac`);
		lines.push(``);
	}
	if (descriptor.subcommands.length > 0) {
		lines.push(`  # Subcommand dispatch`);
		lines.push(`  local cmd _skip_next=0`);
		lines.push(`  for ((i = _command_index + 1; i < cword; i++)); do`);
		lines.push(`    if (( _skip_next )); then`);
		lines.push(`      _skip_next=0`);
		lines.push(`      continue`);
		lines.push(`    fi`);
		lines.push(`    case "\${words[i]}" in`);
		for (const flag of descriptor.flags) {
			if (!takesSeparateValue(flag)) continue;
			const forms = flagNamesForWordlist(flag);
			lines.push(`      ${forms.join("|")}) _skip_next=1 ;;`);
			lines.push(`      ${forms.map((form) => `${form}=*`).join("|")}) ;;`);
		}
		for (const sub of descriptor.subcommands) {
			const subFuncName = `_${[...currentPath, sub.name].map(sanitizeFunctionName).join("_")}`;
			lines.push(`      ${sub.name})`);
			lines.push(`        ${subFuncName} "$i"`);
			lines.push(`        return`);
			lines.push(`        ;;`);
		}
		lines.push(`    esac`);
		lines.push(`  done`);
		lines.push(``);
	}
	buildFlagGroupDeclarations(descriptor.flags, lines);
	if (descriptor.flags.length > 0 || descriptor.subcommands.length > 0) {
		lines.push(`  # Complete flags (filtered) and subcommands`);
		lines.push(`  if [[ "$cur" == -* ]]; then`);
		if (descriptor.flags.length > 0) lines.push(`    COMPREPLY=( $(compgen -W "$_filtered_flags" -- "$cur") )`);
		lines.push(`    return`);
		lines.push(`  fi`);
		lines.push(``);
	}
	const argsWithCompletions = descriptor.arguments.flatMap((argument, index) => {
		const completion = valueCompletion(argument.type, helpers);
		return completion === void 0 ? [] : [{
			argument,
			completion,
			index
		}];
	});
	if (argsWithCompletions.length > 0) {
		lines.push(`  # Positional argument completions`);
		lines.push(`  local _position=0 _skip_next=0 _end_of_options=0`);
		lines.push(`  for ((i = _command_index + 1; i < cword; i++)); do`);
		lines.push(`    if (( _skip_next )); then`);
		lines.push(`      _skip_next=0`);
		lines.push(`      continue`);
		lines.push(`    fi`);
		lines.push(`    if (( _end_of_options )); then`);
		lines.push(`      ((_position += 1))`);
		lines.push(`      continue`);
		lines.push(`    fi`);
		lines.push(`    case "\${words[i]}" in`);
		lines.push(`      --) _end_of_options=1 ;;`);
		for (const flag of descriptor.flags) {
			const forms = flagNamesForWordlist(flag);
			if (!takesSeparateValue(flag)) lines.push(`      ${forms.join("|")}) ;;`);
			else {
				lines.push(`      ${forms.join("|")}) _skip_next=1 ;;`);
				lines.push(`      ${forms.map((form) => `${form}=*`).join("|")}) ;;`);
			}
		}
		lines.push(`      -*) ;;`);
		lines.push(`      *) ((_position += 1)) ;;`);
		lines.push(`    esac`);
		lines.push(`  done`);
		lines.push(`  case "$_position" in`);
		for (const { argument, completion, index } of argsWithCompletions) {
			if (argument.variadic) continue;
			lines.push(`    ${index})`);
			lines.push(`      ${completion}`);
			lines.push(`      return`);
			lines.push(`      ;;`);
		}
		lines.push(`  esac`);
		const variadic = argsWithCompletions.find(({ argument }) => argument.variadic);
		if (variadic !== void 0) {
			lines.push(`  if (( _position >= ${variadic.index} )); then`);
			lines.push(`    ${variadic.completion}`);
			lines.push(`    return`);
			lines.push(`  fi`);
		}
	} else if (descriptor.subcommands.length > 0) {
		const subNames = descriptor.subcommands.map((s) => s.name);
		lines.push(`  COMPREPLY=( $(compgen -W '${subNames.join(" ")}' -- "$cur") )`);
	}
	lines.push(`}`);
	lines.push(``);
	for (const sub of descriptor.subcommands) generateFunction$1(sub, currentPath, lines, helpers);
};
/**
* @internal
*/
const generate$4 = (executableName, descriptor) => {
	const lines = [];
	const safeName = sanitizeFunctionName(executableName);
	const helpers = {
		choices: `_${safeName}--choices`,
		paths: `_${safeName}--paths`
	};
	lines.push(`###-begin-${escapeForBash(executableName)}-completions-###`);
	lines.push(`#`);
	lines.push(`# Static completion script for Bash`);
	lines.push(`#`);
	lines.push(`# Installation:`);
	lines.push(`#   ${escapeForBash(executableName)} --completions bash >> ~/.bashrc`);
	lines.push(`#`);
	lines.push(``);
	lines.push(`if ! type _init_completion &>/dev/null; then`);
	lines.push(`  _init_completion()`);
	lines.push(`  {`);
	lines.push(`    COMPREPLY=()`);
	lines.push(`    local _i _j=0 _piece _line="$COMP_LINE"`);
	lines.push(`    words=("\${COMP_WORDS[0]}")`);
	lines.push(`    cword=0`);
	lines.push(`    _line="\${_line#*"\${COMP_WORDS[0]}"}"`);
	lines.push(`    for ((_i = 1; _i < \${#COMP_WORDS[@]}; _i++)); do`);
	lines.push(`      _piece="\${COMP_WORDS[_i]}"`);
	lines.push(`      if [[ "$_line" == [[:blank:]]* ]]; then`);
	lines.push(`        ((_j++))`);
	lines.push(`        words[_j]="$_piece"`);
	lines.push(`      else`);
	lines.push(`        words[_j]="\${words[_j]}$_piece"`);
	lines.push(`      fi`);
	lines.push(`      ((_i == COMP_CWORD)) && cword=$_j`);
	lines.push(`      _line="\${_line#*"$_piece"}"`);
	lines.push(`    done`);
	lines.push(`    cur="\${words[cword]}"`);
	lines.push(`    prev=""`);
	lines.push(`    ((cword > 0)) && prev="\${words[cword-1]}"`);
	lines.push(`    return 0`);
	lines.push(`  }`);
	lines.push(`fi`);
	lines.push(``);
	choicesHelper(helpers.choices, lines);
	pathsHelper(helpers, lines);
	generateFunction$1(descriptor, [], lines, helpers);
	lines.push(`complete -F _${safeName} ${escapeForBash(executableName)}`);
	lines.push(`###-end-${escapeForBash(executableName)}-completions-###`);
	return lines.join("\n");
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/completions/fish.js
const escapeFishString = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
/** Escape choices for Fish's second expansion of `complete -a`. */
const escapeFishChoice = (s) => escapeFishString(s.replace(/[^A-Za-z0-9_.,/@%+-]/gu, "\\$&"));
/**
* Build a Fish condition that checks the current subcommand context.
*
* For root-level completions with subcommands: `__fish_use_subcommand`
* For nested commands: verify the full parent path is active AND none of its
* child subcommands have been entered yet.
*/
const subcommandCondition = (parentPath, childSubcommandNames) => {
	if (parentPath.length === 0) {
		if (childSubcommandNames.length > 0) return `__fish_use_subcommand`;
		return ``;
	}
	const parentCondition = parentPath.map((parent) => `__fish_seen_subcommand_from ${parent}`).join("; and ");
	if (childSubcommandNames.length > 0) return `${parentCondition}; and not __fish_seen_subcommand_from ${childSubcommandNames.join(" ")}`;
	return parentCondition;
};
/**
* Build a __fish_contains_opt condition that checks whether any form of this
* flag has already been typed. Returns the condition string without wrapping
* quotes (the caller adds those).
*/
const flagContainsOptCondition = (flag) => {
	const optArgs = [];
	for (const alias of flag.aliases) if (alias.length === 1) optArgs.push(`-s ${alias}`);
	optArgs.push(flag.name);
	for (const alias of flag.aliases) if (alias.length > 1) optArgs.push(alias);
	const negation = negatedName$1(flag);
	if (negation !== void 0) optArgs.push(negation);
	return `not __fish_contains_opt ${optArgs.join(" ")}`;
};
/** Hide used value flags without suppressing their value completions. */
const valueFlagDedupCondition = (flag) => {
	const forms = [`--${flag.name}`];
	for (const alias of flag.aliases) forms.push(alias.length === 1 ? `-${alias}` : `--${alias}`);
	return `begin; ${flagContainsOptCondition(flag)}; or contains -- (commandline -poc)[-1] ${forms.join(" ")}; end`;
};
const flagCompletionArgs = (flag) => {
	const args = [`-l ${flag.name}`];
	for (const alias of flag.aliases) if (alias.length === 1) args.push(`-s ${alias}`);
	else args.push(`-l ${alias}`);
	if (flag.description) args.push(`-d '${escapeFishString(flag.description)}'`);
	const valueArgs = takesSeparateValue(flag) ? flagValueArgs(flag.type) : void 0;
	if (valueArgs) args.push(valueArgs);
	return args;
};
const flagValueArgs = (type) => {
	switch (type._tag) {
		case "Boolean": return;
		case "Choice": return `-r -f -a '${type.values.map(escapeFishChoice).join(" ")}'`;
		case "Path":
			if (type.pathType === "directory") return `-r -F`;
			return `-r -F`;
		default: return `-r -f`;
	}
};
const argValueArgs = (type) => {
	switch (type._tag) {
		case "Choice": return `-r -f -a '${type.values.map(escapeFishChoice).join(" ")}'`;
		case "Path": return `-r -F`;
		default: return;
	}
};
const generateCompletions = (executableName, descriptor, parentPath, lines) => {
	const allSubNames = descriptor.subcommands.map((s) => s.name);
	const condition = subcommandCondition(parentPath, allSubNames);
	const conditionArg = condition ? `-n '${condition}'` : ``;
	if (!descriptor.arguments.some((a) => a.type._tag === "Path")) {
		const parts = [`complete -c ${executableName}`];
		if (conditionArg) parts.push(conditionArg);
		parts.push(`-f`);
		lines.push(parts.join(" "));
	}
	for (const sub of descriptor.subcommands) {
		const parts = [`complete -c ${executableName}`];
		if (conditionArg) parts.push(conditionArg);
		parts.push(`-f -a '${escapeFishString(sub.name)}'`);
		if (sub.description) parts.push(`-d '${escapeFishString(sub.description)}'`);
		lines.push(parts.join(" "));
	}
	for (const flag of descriptor.flags) {
		const dedup = takesSeparateValue(flag) ? valueFlagDedupCondition(flag) : flagContainsOptCondition(flag);
		const flagCondition = condition ? `${condition}; and ${dedup}` : dedup;
		const flagCondArg = flagCondition ? `-n '${flagCondition}'` : ``;
		const parts = [`complete -c ${executableName}`];
		if (flagCondArg) parts.push(flagCondArg);
		parts.push(...flagCompletionArgs(flag));
		lines.push(parts.join(" "));
		const negation = negatedName$1(flag);
		if (negation !== void 0) {
			const negParts = [`complete -c ${executableName}`];
			if (flagCondArg) negParts.push(flagCondArg);
			negParts.push(`-l ${negation}`);
			if (flag.description) negParts.push(`-d '${escapeFishString(`Disable ${flag.name}`)}'`);
			lines.push(negParts.join(" "));
		}
	}
	if (descriptor.flags.length > 0) {
		const notDash = `not string match -q -- "-*" (commandline -ct)`;
		const bareBase = condition ? `${condition}; and ${notDash}` : notDash;
		for (const flag of descriptor.flags) {
			const bareCondition = `${bareBase}; and ${flagContainsOptCondition(flag)}`;
			const negation = negatedName$1(flag);
			const parts = [`complete -c ${executableName}`];
			parts.push(`-n '${bareCondition}'`);
			parts.push(`-f -a '--${flag.name}'`);
			if (flag.description) parts.push(`-d '${escapeFishString(flag.description)}'`);
			lines.push(parts.join(" "));
			if (negation !== void 0) {
				const negParts = [`complete -c ${executableName}`];
				negParts.push(`-n '${bareCondition}'`);
				negParts.push(`-f -a '--${negation}'`);
				if (flag.description) negParts.push(`-d '${escapeFishString(`Disable ${flag.name}`)}'`);
				lines.push(negParts.join(" "));
			}
		}
	}
	for (const arg of descriptor.arguments) {
		const valueArg = argValueArgs(arg.type);
		if (valueArg) {
			const parts = [`complete -c ${executableName}`];
			if (conditionArg) parts.push(conditionArg);
			parts.push(valueArg);
			if (arg.description) parts.push(`-d '${escapeFishString(arg.description)}'`);
			lines.push(parts.join(" "));
		}
	}
	for (const sub of descriptor.subcommands) generateCompletions(executableName, sub, [...parentPath, sub.name], lines);
};
/**
* @internal
*/
const generate$3 = (executableName, descriptor) => {
	const lines = [];
	lines.push(`###-begin-${executableName}-completions-###`);
	lines.push(`#`);
	lines.push(`# Static completion script for Fish`);
	lines.push(`#`);
	lines.push(`# Installation:`);
	lines.push(`#   ${executableName} --completions fish > ~/.config/fish/completions/${executableName}.fish`);
	lines.push(`#`);
	lines.push(``);
	generateCompletions(executableName, descriptor, [], lines);
	lines.push(``);
	lines.push(`###-end-${executableName}-completions-###`);
	return lines.join("\n");
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/completions/powershell.js
/**
* Encode non-ASCII and control characters as `[char]` code units. Windows
* PowerShell 5.1 can misread BOM-less UTF-8 as ANSI, turning some bytes into
* PowerShell quote delimiters.
*/
const quotePs = (s) => {
	const parts = [];
	let literal = "";
	for (let i = 0; i < s.length; i++) {
		const code = s.charCodeAt(i);
		if (code >= 32 && code < 128) {
			literal += s[i] === "'" ? "''" : s[i];
			continue;
		}
		if (literal !== "" || parts.length === 0) parts.push(`'${literal}'`);
		literal = "";
		parts.push(`[char]0x${code.toString(16).toUpperCase().padStart(4, "0")}`);
	}
	if (literal !== "" || parts.length === 0) parts.push(`'${literal}'`);
	return parts.length === 1 ? parts[0] : `(${parts.join(" + ")})`;
};
const psArray = (items) => `@(${items.map(quotePs).join(", ")})`;
const psOptional = (s) => s ? quotePs(s) : "$null";
const sanitize$1 = (s) => s.replace(/[^a-zA-Z0-9_]/g, "_");
const flagForms = (flag) => [`--${flag.name}`, ...flag.aliases.map((alias) => alias.length === 1 ? `-${alias}` : `--${alias}`)];
const valueFields = (type) => `values = ${psArray(type._tag === "Choice" ? type.values : [])}; pathType = ${type._tag === "Path" ? quotePs(type.pathType) : "$null"}`;
const flagEntry = (flag) => {
	const negation = negatedName$1(flag);
	return `@{ name = ${quotePs(flag.name)}; forms = ${psArray(flagForms(flag))}; takesValue = $${flag.type._tag !== "Boolean"}; ` + (negation === void 0 ? "" : `negation = ${quotePs(`--${negation}`)}; `) + (flag.optionalValue === true ? `optionalValue = $true; ` : "") + `${valueFields(flag.type)}; description = ${psOptional(flag.description)} }`;
};
const argumentEntry = (argument) => `@{ name = ${quotePs(argument.name)}; variadic = $${argument.variadic}; ${valueFields(argument.type)}; description = ${psOptional(argument.description)} }`;
const pushList = (lines, field, entries) => {
	if (entries.length === 0) {
		lines.push(`  ${field} = @()`);
		return;
	}
	lines.push(`  ${field} = @(`);
	for (const entry of entries) lines.push(`    ${entry}`);
	lines.push(`  )`);
};
/**
* Emit one context per subcommand path. Subcommands are case-sensitive, so
* contexts go in an ordinal hashtable instead of a hash literal, whose keys
* ignore case.
*/
const generateContexts = (dataName, descriptor, path, lines, seen) => {
	const key = path.join(" ");
	if (seen.has(key)) return;
	seen.add(key);
	lines.push(`${dataName}[${quotePs(key)}] = @{`);
	pushList(lines, "subcommands", descriptor.subcommands.map((sub) => `@{ name = ${quotePs(sub.name)}; description = ${psOptional(sub.description)} }`));
	pushList(lines, "flags", descriptor.flags.map(flagEntry));
	pushList(lines, "arguments", descriptor.arguments.map(argumentEntry));
	lines.push(`}`);
	for (const sub of descriptor.subcommands) generateContexts(dataName, sub, [...path, sub.name], lines, seen);
};
/**
* Replay the committed words with the CLI lexer and parser rules: `--`, short
* flag clusters, inline values, boolean literals, negative numbers, and
* subcommand selection by the first value only.
*/
const completer = (dataName) => String.raw`  param($wordToComplete, $commandAst, $cursorPosition)

  $spec = ${dataName}
  $results = [System.Collections.Generic.List[System.Management.Automation.CompletionResult]]::new()
  $booleanLiterals = @('true', 'yes', 'on', '1', 'y', 'false', 'no', 'off', '0', 'n')

  $index = {
    param($context)
    $lookup = [hashtable]::new([System.StringComparer]::Ordinal)
    foreach ($flag in $context.flags) {
      foreach ($form in $flag.forms) { $lookup[$form] = $flag }
    }
    $lookup
  }

  $add = {
    param([string]$value, [string]$type, $tooltip, [string]$typed, [string]$textPrefix)
    if (-not $value.StartsWith($typed, [System.StringComparison]::OrdinalIgnoreCase)) { return }
    $text = $value
    if ($value -notmatch '^[\w./:%+=\\-]+$') { $text = "'" + ($value -replace "['\u2018-\u201b]", '$0$0') + "'" }
    $text = $textPrefix + $text
    $label = $value
    if (-not $label) { $label = $text }
    if (-not $tooltip) { $tooltip = $label }
    $results.Add([System.Management.Automation.CompletionResult]::new($text, $label, $type, $tooltip))
  }

  $addValues = {
    param($entry, [string]$typed, [string]$textPrefix)
    foreach ($value in $entry.values) {
      if ($textPrefix -eq '' -and (& $optionLike $value)) { continue }
      & $add $value 'ParameterValue' $entry.description $typed $textPrefix
    }
    if ($entry.pathType) {
      foreach ($file in [System.Management.Automation.CompletionCompleters]::CompleteFilename($typed)) {
        if ($entry.pathType -eq 'directory' -and $file.ResultType -ne 'ProviderContainer') { continue }
        $results.Add([System.Management.Automation.CompletionResult]::new($textPrefix + $file.CompletionText, $file.ListItemText, $file.ResultType, $file.ToolTip))
      }
    }
  }

  $addFlags = {
    param([string]$typed)
    foreach ($flag in $context.flags) {
      if ($used.ContainsKey($flag.name)) { continue }
      foreach ($form in $flag.forms) {
        & $add $form 'ParameterName' $flag.description $typed ''
      }
      if ($flag.negation) {
        $tooltip = $null
        if ($flag.description) { $tooltip = 'Disable ' + $flag.name }
        & $add $flag.negation 'ParameterName' $tooltip $typed ''
      }
    }
  }

  # As in the CLI lexer, nothing after '--' is an option, and negative numbers
  # and a lone '-' are values.
  $optionLike = {
    param([string]$word)
    -not $endOfOptions -and $word -match '^-.' -and $word -notmatch '^-(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$'
  }

  # A typed value that has no candidates completes to itself, so the engine
  # does not fall back to listing files.
  $keepTyped = {
    if ($results.Count -eq 0 -and $current) {
      $results.Add([System.Management.Automation.CompletionResult]::new($current, $current, 'ParameterValue', $current))
    }
  }

  $path = ''
  $context = $spec[$path]
  $lookup = & $index $context
  $used = [hashtable]::new([System.StringComparer]::Ordinal)
  $pending = $null
  $endOfOptions = $false
  $position = 0

  # The engine strips the quotes from a quoted word.
  $typed = [string]$wordToComplete
  if ($typed -match '^([''"])(.*?)\1?$') { $typed = $Matches[2] }
  $current = $null

  $elements = $commandAst.CommandElements
  for ($i = 1; $i -lt $elements.Count; $i++) {
    $element = $elements[$i]
    $word = $element.Extent.Text
    if ($element -is [System.Management.Automation.Language.StringConstantExpressionAst]) { $word = $element.Value }
    if ($element.Extent.EndOffset -ge $cursorPosition) {
      if ($element -is [System.Management.Automation.Language.ConstantExpressionAst] -and $element.Extent.StartOffset -le $cursorPosition) {
        $current = $element.Extent.Text
        if ($element.Extent.EndOffset -eq $cursorPosition) { $typed = $word }
      }
      break
    }

    # A flag takes the next word as its value unless it is an option or '--';
    # a boolean flag only takes a boolean literal.
    $isOption = & $optionLike $word
    if ($null -ne $pending) {
      $flag = $pending
      $pending = $null
      if ($flag.takesValue) {
        if (-not $isOption) { continue }
      } elseif ($booleanLiterals -ccontains $word) { continue }
    }
    if ($endOfOptions) { $position++; continue }
    if ($word -ceq '--') { $endOfOptions = $true; continue }

    if ($isOption) {
      $hasValue = $word.Contains('=')
      if ($hasValue) {
        $forms = @($word.Substring(0, $word.IndexOf('=')))
      } elseif ($word.StartsWith('--')) {
        $forms = @($word)
      } else {
        $forms = @(foreach ($char in $word.Substring(1).ToCharArray()) { '-' + $char })
      }
      foreach ($form in $forms) {
        $pending = $null
        $flag = $lookup[$form]
        # As in the CLI parser, a negation wins over an alias but not over a
        # canonical name.
        if ($null -eq $flag -or $form -cne ('--' + $flag.name)) {
          $negated = $null
          foreach ($candidate in $context.flags) {
            if ($candidate.negation -ceq $form) { $negated = $candidate }
          }
          if ($null -ne $negated) {
            $used[$negated.name] = $true
            continue
          }
        }
        if ($null -eq $flag) { continue }
        $used[$flag.name] = $true
        # A flag with an optional value only takes a value attached with '='.
        if (-not $hasValue -and -not $flag.optionalValue) { $pending = $flag }
      }
      continue
    }

    if ($position -eq 0 -and $context.subcommands.name -ccontains $word) {
      if ($path) { $path = $path + ' ' + $word } else { $path = $word }
      $context = $spec[$path]
      $lookup = & $index $context
      $used = [hashtable]::new([System.StringComparer]::Ordinal)
      continue
    }
    $position++
  }

  $typedIsOption = & $optionLike $typed
  if ($null -ne $pending -and $pending.takesValue -and -not $typedIsOption) {
    & $addValues $pending $typed ''
    & $keepTyped
    return $results
  }

  if ($typedIsOption) {
    if ($typed -match '^(-[^=]+)=(.*)$') {
      $form = $Matches[1]
      $flag = $lookup[$form]
      if ($null -ne $flag -and $flag.takesValue) {
        & $addValues $flag $Matches[2] ($form + '=')
        & $keepTyped
      }
    } else {
      & $addFlags $typed
    }
    return $results
  }

  if (-not $endOfOptions -and $position -eq 0) {
    foreach ($sub in $context.subcommands) {
      & $add $sub.name 'Command' $sub.description $typed ''
    }
  }

  $arguments = $context.arguments
  if ($position -lt $arguments.Count) {
    & $addValues $arguments[$position] $typed ''
  } elseif ($arguments.Count -gt 0 -and $arguments[-1].variadic) {
    & $addValues $arguments[-1] $typed ''
  }

  if (-not $endOfOptions) {
    & $addFlags $typed
  }
  return $results`;
/** @internal */
const generate$2 = (executableName, descriptor) => {
	const dataName = `$global:_${sanitize$1(executableName)}_Completions`;
	const lines = [];
	lines.push(`###-begin-${executableName}-completions-###`);
	lines.push(`#`);
	lines.push(`# Static completion script for PowerShell`);
	lines.push(`#`);
	lines.push(`# Installation:`);
	lines.push(`#   ${executableName} --completions powershell > ${executableName}-completion.ps1`);
	lines.push(`#   then add this line to your $PROFILE (use the full path to the file):`);
	lines.push(`#   . <PATH>\\${executableName}-completion.ps1`);
	lines.push(`#`);
	lines.push(``);
	lines.push(`${dataName} = [hashtable]::new([System.StringComparer]::Ordinal)`);
	generateContexts(dataName, descriptor, [], lines, /* @__PURE__ */ new Set());
	lines.push(``);
	lines.push(`Register-ArgumentCompleter -Native -CommandName ${quotePs(executableName)} -ScriptBlock {`);
	lines.push(completer(dataName));
	lines.push(`}`);
	lines.push(``);
	lines.push(`###-end-${executableName}-completions-###`);
	return lines.join("\n");
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/completions/zsh.js
const escapeZsh = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "'\\''").replace(/:/g, "\\:");
const escapeZshExplanation = (s) => escapeZsh(s).replace(/]/g, "\\]");
/** Escape choices for the second parse of a Zsh `_arguments` action. */
const escapeZshChoice = (s) => s.replace(/[^A-Za-z0-9_.,/@%+-]/gu, "\\$&").replace(/'/g, "'\\''");
const sanitize = (s) => s.replace(/[^a-zA-Z0-9_]/g, "_");
/**
* All forms of a flag (--name, -alias, negation) for the exclusion group.
*/
const allForms = (flag) => {
	const forms = [`--${flag.name}`];
	for (const alias of flag.aliases) forms.push(alias.length === 1 ? `-${alias}` : `--${alias}`);
	const negation = negatedName$1(flag);
	if (negation !== void 0) forms.push(`--${negation}`);
	return forms;
};
const valueAction = (type) => {
	switch (type._tag) {
		case "Boolean": return "";
		case "Choice": return `:value:(${type.values.map(escapeZshChoice).join(" ")})`;
		case "Path": return type.pathType === "directory" ? `:directory:_directories` : `:file:_files`;
		case "Int": return `:integer:`;
		case "Finite": return `:float:`;
		case "Date": return `:date:`;
		default: return `:value:`;
	}
};
const argAction = (type) => {
	switch (type._tag) {
		case "Choice": return `(${type.values.map(escapeZshChoice).join(" ")})`;
		case "Path": return type.pathType === "directory" ? `_directories` : `_files`;
		default: return ``;
	}
};
/**
* Produce _arguments optspecs for a single flag. Each spec is a complete,
* single-quoted string — no brace expansion, no line continuations.
*/
const flagSpecs = (flag) => {
	const specs = [];
	const desc = flag.description ? `[${escapeZshExplanation(flag.description)}]` : "";
	const optional = flag.optionalValue === true && flag.type._tag !== "Boolean";
	const valueSuffix = optional ? "=-" : "";
	const action = optional ? `:${valueAction(flag.type)}` : valueAction(flag.type);
	const excl = `(${allForms(flag).join(" ")})`;
	specs.push(`'${excl}--${flag.name}${valueSuffix}${desc}${action}'`);
	for (const alias of flag.aliases) {
		const prefix = alias.length === 1 ? "-" : "--";
		specs.push(`'${excl}${prefix}${alias}${valueSuffix}${desc}${action}'`);
	}
	const negation = negatedName$1(flag);
	if (negation !== void 0) {
		const negDesc = flag.description ? `[${escapeZshExplanation(`Disable ${flag.name}`)}]` : "";
		specs.push(`'${excl}--${negation}${negDesc}'`);
	}
	return specs;
};
const argSpec = (arg) => {
	const desc = arg.description ? escapeZsh(arg.description) : arg.name;
	const action = argAction(arg.type);
	return `'${arg.variadic ? "*" : ""}:${desc}:${action}'`;
};
const generateFunction = (descriptor, parentPath, lines) => {
	const currentPath = [...parentPath, descriptor.name];
	const funcName = `_${currentPath.map(sanitize).join("_")}`;
	lines.push(`${funcName}() {`);
	if (descriptor.subcommands.length > 0) {
		lines.push(`  local context state state_descr line`);
		lines.push(`  typeset -A opt_args`);
		lines.push(``);
		lines.push(`  local -a commands`);
		lines.push(`  commands=(`);
		for (const sub of descriptor.subcommands) {
			const desc = sub.description ? escapeZsh(sub.description) : "";
			lines.push(`    '${sub.name}:${desc}'`);
		}
		lines.push(`  )`);
		lines.push(``);
		lines.push(`  local -a specs`);
		lines.push(`  specs=(`);
		for (const flag of descriptor.flags) for (const spec of flagSpecs(flag)) lines.push(`    ${spec}`);
		if (descriptor.arguments.length > 0) {
			lines.push(`    -`);
			lines.push(`    parent-arguments`);
			for (const arg of descriptor.arguments) lines.push(`    ${argSpec(arg)}`);
			lines.push(`    -`);
			lines.push(`    subcommands`);
		}
		lines.push(`    '1:command:->command'`);
		lines.push(`    '*::arg:->args'`);
		lines.push(`  )`);
		lines.push(``);
		lines.push(`  _arguments -C "\${specs[@]}"`);
		lines.push(``);
		lines.push(`  case "$state" in`);
		lines.push(`    command)`);
		lines.push(`      _describe -t commands 'commands' commands`);
		lines.push(`      ;;`);
		lines.push(`    args)`);
		lines.push(`      case "$words[1]" in`);
		for (const sub of descriptor.subcommands) {
			const subFunc = `_${[...currentPath, sub.name].map(sanitize).join("_")}`;
			lines.push(`        ${sub.name})`);
			lines.push(`          ${subFunc}`);
			lines.push(`          ;;`);
		}
		lines.push(`      esac`);
		lines.push(`      ;;`);
		lines.push(`  esac`);
	} else {
		const allSpecs = [];
		for (const flag of descriptor.flags) allSpecs.push(...flagSpecs(flag));
		for (const arg of descriptor.arguments) allSpecs.push(argSpec(arg));
		if (allSpecs.length > 0) {
			lines.push(`  local -a specs`);
			lines.push(`  specs=(`);
			for (const spec of allSpecs) lines.push(`    ${spec}`);
			lines.push(`  )`);
			lines.push(`  _arguments "\${specs[@]}"`);
		}
	}
	lines.push(`}`);
	lines.push(``);
	for (const sub of descriptor.subcommands) generateFunction(sub, currentPath, lines);
};
/**
* @internal
*/
const generate$1 = (executableName, descriptor) => {
	const lines = [];
	const safeName = sanitize(executableName);
	lines.push(`#compdef ${executableName}`);
	lines.push(`###-begin-${executableName}-completions-###`);
	lines.push(`#`);
	lines.push(`# Static completion script for Zsh`);
	lines.push(`#`);
	lines.push(`# Installation:`);
	lines.push(`#   ${executableName} --completions zsh > ~/.zsh/completions/_${executableName}`);
	lines.push(`#   then add ~/.zsh/completions to your fpath`);
	lines.push(`#`);
	lines.push(``);
	generateFunction(descriptor, [], lines);
	lines.push(`# Handle both direct invocation and autoload`);
	lines.push(`if [[ "\${zsh_eval_context[-1]}" == "loadautofunc" ]]; then`);
	lines.push(`  _${safeName} "$@"`);
	lines.push(`else`);
	lines.push(`  compdef _${safeName} ${executableName}`);
	lines.push(`fi`);
	lines.push(`###-end-${executableName}-completions-###`);
	return lines.join("\n");
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Completions.js
/**
* Converts a command tree into a `CommandDescriptor` for completion script
* generation.
*
* **When to use**
*
* Use when you need to generate a completion script from an existing
* `Command`, for example in a build step, without running the CLI or
* capturing the output of the built-in `--completions` flag.
*
* **Details**
*
* Reads the command's flags, arguments, and subcommands, including flags
* shared with subcommands and aliases. Hidden flags and unlisted subcommands
* are omitted, matching `--help`. Command handlers are never run.
*
* **Example** (Generating a Zsh completion script at build time)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* import { Command, Completions, Flag } from "effect/cli"
*
* const start = Command.make(
*   "start",
*   { port: Flag.Int("port") },
*   ({ port }) => Effect.log(`Listening on ${port}`)
* )
*
* const cli = Command.make("server").pipe(
*   Command.withSubcommands([start])
* )
*
* const script = Completions.generate(
*   "server",
*   "zsh",
*   Completions.fromCommand(cli)
* )
*
* script.startsWith("#compdef server") // => true
* ```
*
* @see {@link generate} for turning the descriptor into a shell script
*
* @stability unstable
* @category constructors
* @since 4.0.7
*/
const fromCommand = (command) => fromCommand$1(command);
/**
* Generates a shell completion script for a command descriptor.
*
* **When to use**
*
* Use when you need an installable completion script from an existing
* `CommandDescriptor`.
*
* **Details**
*
* Dispatches by `shell` to Bash, Zsh, Fish, or PowerShell generation and
* returns a static script string for `executableName`.
*
* @see {@link Shell} for supported shell names
* @see {@link CommandDescriptor} for the command shape used by completion generation
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const generate = (executableName, shell, descriptor) => {
	switch (shell) {
		case "bash": return generate$4(executableName, descriptor);
		case "zsh": return generate$1(executableName, descriptor);
		case "fish": return generate$3(executableName, descriptor);
		case "powershell": return generate$2(executableName, descriptor);
	}
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Flag.js
/**
* Creates a string flag that accepts text input.
*
* **Example** (Creating string flags)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const nameFlag = Flag.String("name")
* // Usage: --name "John Doe"
* nameFlag.kind // => "flag"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const String$1 = (name) => String$3(flagKind, name);
/**
* Creates a boolean flag that can be enabled or disabled.
*
* **Example** (Creating boolean flags)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const verboseFlag = Flag.Boolean("verbose")
* // Usage: --verbose (true) or --no-verbose (false)
* // Omission fails unless the flag is made optional or given a fallback.
* verboseFlag.kind // => "flag"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Boolean$1 = (name) => Boolean$2(flagKind, name);
/**
* Creates an integer flag that accepts whole number input.
*
* **Example** (Creating integer flags)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const portFlag = Flag.Int("port")
* // Usage: --port 8080
* portFlag.kind // => "flag"
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Int = (name) => Int$2(flagKind, name);
/**
* Constructs option parameters that represent a choice between several inputs.
* Each tuple maps a string flag value to an associated typed value.
*
* **Example** (Creating flag choices with values)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* // simple enum like choice mapping directly to string union
* const color = Flag.Literals("color", ["red", "green", "blue"])
*
* // choice with custom value mapping
* const logLevel = Flag.ChoiceWithValue("log-level", [
*   ["debug", "Debug" as const],
*   ["info", "Info" as const],
*   ["error", "Error" as const]
* ])
* const kinds = [color.kind, logLevel.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const ChoiceWithValue = (name, choices) => ChoiceWithValue$1(flagKind, name, choices);
/**
* Accepts one of the provided strings. An empty array rejects all input.
*
* @see {@link ChoiceWithValue} for mapping accepted strings to different typed values
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Literals = (name, literals) => Literals$2(flagKind, name, literals);
/**
* Adds an alias to a flag, allowing it to be referenced by multiple names.
*
* **Example** (Adding flag aliases)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* // Flag can be used as both --verbose and -v
* const verboseFlag = Flag.Boolean("verbose").pipe(
*   Flag.withAlias("v")
* )
*
* // Multiple aliases can be chained
* const helpFlag = Flag.Boolean("help").pipe(
*   Flag.withAlias("h"),
*   Flag.withAlias("?")
* )
* const kinds = [verboseFlag.kind, helpFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category aliasing
* @since 4.0.0
*/
const withAlias = /*#__PURE__*/ dual(2, (self, alias) => withAlias$1(self, alias));
/**
* Adds a description to a flag for help documentation.
*
* **Example** (Adding help descriptions)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const portFlag = Flag.Int("port").pipe(
*   Flag.withDescription("The port number to listen on")
* )
*
* const configFlag = Flag.File("config").pipe(
*   Flag.withDescription("Path to the configuration file")
* )
* const kinds = [portFlag.kind, configFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category metadata
* @since 4.0.0
*/
const withDescription$1 = /*#__PURE__*/ dual(2, (self, description) => withDescription$3(self, description));
/**
* Sets a custom metavar (placeholder name) for the flag in help documentation.
*
* **Details**
*
* The metavar is displayed in usage text to indicate what value the user should
* provide. For example, `--output FILE` shows `FILE` as the metavar.
*
* **Example** (Setting metavars)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const databaseFlag = Flag.String("database-url").pipe(
*   Flag.withMetavar("URL"),
*   Flag.withDescription("Database connection URL")
* )
* // In help: --database-url URL
*
* const timeoutFlag = Flag.Int("timeout").pipe(
*   Flag.withMetavar("SECONDS")
* )
* // In help: --timeout SECONDS
* const kinds = [databaseFlag.kind, timeoutFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category metadata
* @since 4.0.0
*/
const withMetavar = /*#__PURE__*/ dual(2, (self, metavar) => withMetavar$1(self, metavar));
/**
* Makes a flag optional, returning an Option type that can be None if not provided.
*
* **Example** (Making flags optional)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Option, Path, Stdio, Terminal } from "effect"
* import { Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const optionalPort = Flag.optional(Flag.Int("port"))
*
* const program = Effect.gen(function*() {
*   const [, port] = yield* optionalPort.parse({
*     arguments: [],
*     flags: { "port": ["4000"] }
*   })
*   return port
* })
*
* await Effect.runPromise(program.pipe(Effect.provide(CliTestLayer))) // => Option.some(4000)
* ```
*
* @stability unstable
* @category optionality
* @since 4.0.0
*/
const optional = (param) => optional$2(param);
/**
* Provides a default value for a flag when it's not specified.
*
* **Example** (Providing default values)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const portFlag = Flag.Int("port").pipe(
*   Flag.withDefault(8080)
* )
* // If --port is not provided, defaults to 8080
*
* const hostFlag = Flag.String("host").pipe(
*   Flag.withDefault("localhost")
* )
* // If --host is not provided, defaults to "localhost"
* const kinds = [portFlag.kind, hostFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category optionality
* @since 4.0.0
*/
const withDefault = withDefault$1;
/**
* Transforms the parsed value of a flag using a mapping function.
*
* **Example** (Mapping parsed values)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* // Convert string to uppercase
* const nameFlag = Flag.String("name").pipe(
*   Flag.map((name) => name.toUpperCase())
* )
*
* // Convert port to URL
* const urlFlag = Flag.Int("port").pipe(
*   Flag.map((port) => `http://localhost:${port}`)
* )
* const kinds = [nameFlag.kind, urlFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category mapping
* @since 4.0.0
*/
const map = /*#__PURE__*/ dual(2, (self, f) => map$1(self, f));
/**
* Ensures a flag is specified at least a minimum number of times.
*
* **Example** (Requiring repeated values)
*
* ```ts import.meta.vitest
* import { Flag } from "effect/cli"
*
* const sourceFlag = Flag.atLeast(Flag.File("source"), 2)
* // Requires at least 2 source files
* // Usage: --source file1.ts --source file2.ts
*
* const tagFlag = Flag.String("tag").pipe(
*   Flag.atLeast(1)
* )
* // Requires at least 1 tag
* const kinds = [sourceFlag.kind, tagFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category repetition
* @since 4.0.0
*/
const atLeast = /*#__PURE__*/ dual(2, (self, min) => atLeast$1(self, min));
/**
* Validates and transforms a flag value using a Schema codec.
*
* **Example** (Validating with schemas)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
* import { Flag } from "effect/cli"
*
* const isEmail = Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
*   message: "Must be a valid email address"
* })
*
* // Parse and validate email with custom schema
* const EmailSchema = Schema.String.pipe(
*   Schema.check(isEmail)
* )
*
* const emailFlag = Flag.String("email").pipe(
*   Flag.withSchema(EmailSchema)
* )
*
* // Parse JSON configuration with schema validation
* const ConfigSchema = Schema.Struct({
*   port: Schema.Number,
*   host: Schema.String,
*   ssl: Schema.optional(Schema.Boolean)
* }).pipe(Schema.fromJsonString)
*
* const configFlag = Flag.String("config").pipe(
*   Flag.withSchema(ConfigSchema)
* )
* const kinds = [emailFlag.kind, configFlag.kind] // => ["flag", "flag"]
* ```
*
* @stability unstable
* @category schemas
* @since 4.0.0
*/
const withSchema = /*#__PURE__*/ dual(2, (self, schema) => withSchema$2(self, schema));
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/help.js
/**
* Help Documentation
* ================
*
* Internal helpers for generating help documentation.
* Extracted from command.ts to avoid circular dependencies.
*/
const dedupeGlobalFlags = (flags) => {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const flag of flags) {
		if (seen.has(flag)) continue;
		seen.add(flag);
		deduped.push(flag);
	}
	return deduped;
};
/**
* Returns the resolved command lineage for the provided path.
* Includes the root command as the first element.
*/
const getCommandsForCommandPath = (command, commandPath) => {
	const commands = [command];
	let currentCommand = command;
	for (let i = 1; i < commandPath.length; i++) {
		const subcommandName = commandPath[i];
		let subcommand = void 0;
		for (const group of currentCommand.subcommands) {
			subcommand = group.commands.find((sub) => sub.name === subcommandName);
			if (subcommand) break;
		}
		if (!subcommand) break;
		commands.push(subcommand);
		currentCommand = subcommand;
	}
	return commands;
};
/**
* Returns active global flags for a command path.
* Built-ins are prepended and declarations are collected root -> leaf.
*/
const getGlobalFlagsForCommandPath = (command, commandPath, builtIns) => {
	const declared = getCommandsForCommandPath(command, commandPath).flatMap((current) => toImpl(current).globalFlags);
	return dedupeGlobalFlags([...builtIns, ...declared]);
};
const collectDeclaredGlobalFlags = (command) => {
	const collected = [];
	const visit = (current) => {
		const impl = toImpl(current);
		for (const flag of impl.globalFlags) collected.push(flag);
		for (const group of current.subcommands) for (const subcommand of group.commands) visit(subcommand);
	};
	visit(command);
	return dedupeGlobalFlags(collected);
};
const getInheritedFlagsForCommandPath = (commands, currentFlags) => {
	if (commands.length <= 1) return [];
	const seen = new Set(currentFlags.map((flag) => flag.name));
	const inheritedFlags = [];
	for (const ancestor of commands.slice(0, -1)) {
		const ancestorImpl = toImpl(ancestor);
		for (const flag of ancestorImpl.contextConfig.flags) {
			const singles = extractSingleParams(flag);
			const metadata = getParamMetadata(flag);
			for (const single of singles) {
				if (seen.has(single.name)) continue;
				if (single.hidden) continue;
				seen.add(single.name);
				inheritedFlags.push(toFlagDoc(single, metadata));
			}
		}
	}
	return inheritedFlags;
};
/**
* Returns all global flags declared in a command tree.
* Built-ins are prepended and command declarations are deduplicated by identity.
*/
const getGlobalFlagsForCommandTree = (command, builtIns) => dedupeGlobalFlags([...builtIns, ...collectDeclaredGlobalFlags(command)]);
/**
* Helper function to get help documentation for a specific command path.
* Navigates through the command hierarchy to find the right command.
* Reads active global flags for the path and includes them in the help doc.
*/
const getHelpForCommandPath = (command, commandPath, builtIns) => gen(function* () {
	const commands = getCommandsForCommandPath(command, commandPath);
	const currentCommand = commands.length > 0 ? commands[commands.length - 1] : command;
	const baseDoc = toImpl(currentCommand).buildHelpDoc(commandPath);
	const inheritedFlags = getInheritedFlagsForCommandPath(commands, baseDoc.flags);
	const flags = getGlobalFlagsForCommandPath(command, commandPath, builtIns);
	const globalFlagDocs = [];
	for (const flag of flags) {
		const singles = extractSingleParams(flag.flag);
		const metadata = getParamMetadata(flag.flag);
		for (const single of singles) {
			if (single.hidden) continue;
			globalFlagDocs.push({
				...toFlagDoc(single, metadata),
				required: false
			});
		}
	}
	let scopeLength = 1;
	for (let i = commands.length - 1; i > 0; i--) if (toImpl(commands[i]).globalFlags.length > 0) {
		scopeLength = i + 1;
		break;
	}
	return {
		...baseDoc,
		inheritedFlags,
		globalFlags: globalFlagDocs,
		globalFlagsScope: commandPath.slice(0, scopeLength),
		commandPath
	};
});
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/GlobalFlag.js
/**
* Global flags for Effect CLI command trees. Global flags are parsed outside a
* single command's local flags and can apply to a command and its descendants.
*
* This module defines two kinds of global flags: action flags, which run an
* effect and stop normal command execution, and setting flags, which provide a
* parsed value to the command handler through the Effect context. It also
* defines the built-in help, version, wizard, shell-completion, and log-level flags
* used by `Command.run` and `Command.runWith`.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Creates an Action flag that performs a side effect and exits.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Action = (options) => ({
	_tag: "Action",
	flag: options.flag,
	run: options.run
});
/**
* Creates a Setting flag that configures the command handler's environment.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const Setting = (id) => (options) => {
	settingIdCounter += 1;
	const ref = Service(`effect/cli/GlobalFlag/${id}/${settingIdCounter}`);
	return Object.assign(ref, {
		_tag: "Setting",
		id,
		flag: options.flag
	});
};
let settingIdCounter = 0;
/**
* Defines the `--help` / `-h` global flag, which shows help documentation for the
* active command path.
*
* @see {@link BuiltIns} for the default list containing this flag
* @see {@link Action} for defining custom action global flags
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const Help = /*#__PURE__*/ Action({
	flag: /*#__PURE__*/ Boolean$1("help").pipe(/*#__PURE__*/ withAlias("h"), /*#__PURE__*/ withDescription$1("Show help information"), /*#__PURE__*/ withDefault(false)),
	run: /*#__PURE__*/ fnUntraced(function* (_, { builtIns, command, commandPath }) {
		const presenter = yield* Presenter;
		const helpDoc = yield* getHelpForCommandPath(command, commandPath, builtIns);
		yield* presenter.present({
			_tag: "Help",
			reason: "Requested",
			commandPath,
			helpDoc
		});
	})
});
/**
* Defines the global action flag for showing command version information.
*
* **When to use**
*
* Use to add a built-in `--version / -v` flag to a command runner.
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const Version = /*#__PURE__*/ Action({
	flag: /*#__PURE__*/ Boolean$1("version").pipe(/*#__PURE__*/ withAlias("v"), /*#__PURE__*/ withDescription$1("Show version information"), /*#__PURE__*/ withDefault(false)),
	run: /*#__PURE__*/ fnUntraced(function* (_, { command, version }) {
		yield* (yield* Presenter).present({
			_tag: "Version",
			name: command.name,
			version
		});
	})
});
/**
* Defines the global action flag for starting interactive wizard mode.
*
* **Details**
*
* `Command.run` and `Command.runWith` handle this action specially so the
* generated arguments can be passed back through the command parser.
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const Wizard = /*#__PURE__*/ Action({
	flag: /*#__PURE__*/ Boolean$1("wizard").pipe(/*#__PURE__*/ withDescription$1("Start wizard mode for a command"), /*#__PURE__*/ withDefault(false)),
	run: () => void_
});
/**
* Defines the `--completions` global flag, which prints a shell completion script for
* the given shell.
*
* **Details**
*
* Accepted values are `bash`, `zsh`, `fish`, `powershell`, `sh`, and `pwsh`;
* `sh` is normalized to `bash` and `pwsh` to `powershell`.
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const Completions = /*#__PURE__*/ Action({
	flag: /*#__PURE__*/ ChoiceWithValue("completions", [
		["bash", "bash"],
		["zsh", "zsh"],
		["fish", "fish"],
		["powershell", "powershell"],
		["sh", "bash"],
		["pwsh", "powershell"]
	]).pipe(optional, /*#__PURE__*/ withMetavar("<bash|zsh|fish|powershell|sh|pwsh>"), /*#__PURE__*/ withDescription$1("Print shell completion script")),
	run: /*#__PURE__*/ fnUntraced(function* (shell, { command }) {
		if (isNone(shell)) return;
		const descriptor = fromCommand(command);
		yield* log(generate(command.name, shell.value, descriptor));
	})
});
/**
* Defines the global setting flag for command log level.
*
* **When to use**
*
* Use to add a built-in `--log-level` option that configures the minimum log
* level for the command.
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const LogLevel = /*#__PURE__*/ Setting("log-level")({ flag: /*#__PURE__*/ ChoiceWithValue("log-level", [
	["all", "All"],
	["trace", "Trace"],
	["debug", "Debug"],
	["info", "Info"],
	["warn", "Warn"],
	["warning", "Warn"],
	["error", "Error"],
	["fatal", "Fatal"],
	["none", "None"]
]).pipe(optional, /*#__PURE__*/ withDescription$1("Sets the minimum log level"), /*#__PURE__*/ withMetavar("<all|trace|debug|info|warn|warning|error|fatal|none>")) });
/**
* Built-in global flags in default precedence order.
*
* **When to use**
*
* Use when extending or inspecting the default global-flag set that
* `Command.runWith` prepends before user-defined global flags.
*
* **Details**
*
* The built-ins are `Help`, `Version`, `Wizard`, `Completions`, and `LogLevel`.
* `Command.runWith` prepends these built-ins when collecting and parsing global
* flags.
*
* **Gotchas**
*
* Action flags are processed in active flag order and the first present action
* exits, so this array controls built-in action precedence.
*
* @see {@link Help} for the help action flag
* @see {@link Version} for the version action flag
* @see {@link Completions} for the shell-completions action flag
* @see {@link LogLevel} for the built-in log-level setting flag
*
* @stability unstable
* @category references
* @since 4.0.0
*/
const BuiltIns = [
	Help,
	Version,
	Wizard,
	Completions,
	LogLevel
];
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/CliConfig.js
/**
* Configuration for Effect CLI command execution.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Context reference for configuration shared by CLI parsing, help generation,
* and command execution.
*
* **When to use**
*
* Use when you need to customize runner-wide CLI behavior, such as which
* built-in global flags are available.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
var CliConfig = class extends (/*#__PURE__*/ Reference("effect/cli/CliConfig", { defaultValue: () => defaults })) {};
/**
* Default CLI configuration containing every built-in global flag.
*
* @stability unstable
* @category defaults
* @since 4.0.0
*/
const defaults = { builtIns: BuiltIns };
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/formatter.js
/**
* The formatter for built-in command output. An installed `CliOutput.Formatter`
* wins, otherwise the default formatter colors when `TerminalCapabilities`
* says it can.
*
* @internal
*/
const resolveFormatter = /*#__PURE__*/ contextWith((context) => succeed$1(getOrUndefined$1(context, Formatter) ?? defaultFormatter({ colors: get(context, TerminalCapabilities).canColor })));
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/lexer.js
/**
* @internal
*/
function lex(argv) {
	const endIndex = argv.indexOf("--");
	if (endIndex === -1) return {
		tokens: lexTokens(argv),
		trailingOperands: []
	};
	return {
		tokens: lexTokens(argv.slice(0, endIndex)),
		trailingOperands: argv.slice(endIndex + 1)
	};
}
const negativeNumberRegex = /^-(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
const lexTokens = (args) => {
	const tokens = [];
	for (const arg of args) if (!arg.startsWith("-") || negativeNumberRegex.test(arg)) tokens.push({
		_tag: "Value",
		value: arg
	});
	else if (arg.startsWith("--")) {
		const equalIndex = arg.indexOf("=");
		if (equalIndex !== -1) {
			const name = arg.slice(2, equalIndex);
			if (name === "") tokens.push({
				_tag: "Value",
				value: arg
			});
			else {
				const value = arg.slice(equalIndex + 1);
				tokens.push({
					_tag: "LongOption",
					name,
					raw: arg,
					value
				});
			}
		} else tokens.push({
			_tag: "LongOption",
			name: arg.slice(2),
			raw: arg
		});
	} else if (arg.length > 1) {
		const flags = arg.slice(1);
		const equalIndex = flags.indexOf("=");
		if (equalIndex !== -1) {
			const chars = Array.from(flags.slice(0, equalIndex));
			const flag = chars.pop() ?? "";
			for (const ch of chars) tokens.push({
				_tag: "ShortOption",
				flag: ch,
				raw: `-${ch}`
			});
			tokens.push({
				_tag: "ShortOption",
				flag,
				raw: `-${flag}`,
				value: flags.slice(equalIndex + 1)
			});
		} else for (const ch of flags) tokens.push({
			_tag: "ShortOption",
			flag: ch,
			raw: `-${ch}`
		});
	} else tokens.push({
		_tag: "Value",
		value: arg
	});
	return tokens;
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/auto-suggest.js
/**
* Simple Levenshtein distance implementation (small N, no perf worries)
*/
const levenshtein = (a, b) => {
	const m = a.length;
	const n = b.length;
	const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
		const cost = a[i - 1] === b[j - 1] ? 0 : 1;
		dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
	}
	return dp[m][n];
};
/**
* Return suggestions with minimum distance found, up to distance 2.
*
* @internal
*/
const suggest = (input, candidates) => {
	const distances = candidates.map((c) => [levenshtein(input, c), c]).filter(([d]) => d <= 2).sort(([a], [b]) => a - b);
	if (distances.length === 0) return [];
	const minDistance = distances[0][0];
	return distances.filter(([d]) => d === minDistance).map(([, c]) => c);
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/parser.js
/**
* Parsing Pipeline for CLI Commands
* ==================================
*
* The parser transforms raw argv tokens into structured command input through
* three main phases:
*
* 1. **Lexer** (external): Converts argv strings into typed tokens
*    - LongOption: --name or --name=value
*    - ShortOption: -n or -n=value (also handles -abc as three flags)
*    - Value: positional arguments
*
* 2. **Built-in Extraction**: Peels off built-in flags (help/version/completions)
*    before command-specific parsing begins.
*
* 3. **Command Parsing**: Recursively processes command levels:
*    - Collects flags defined at this level
*    - Detects subcommand from first value token
*    - Forwards remaining tokens to child command
*
* Key Behaviors
* -------------
* - Inherited parent flags may appear before OR after the subcommand name (npm-style)
* - Only the first Value token can open a subcommand
* - Errors accumulate rather than throwing exceptions
*/
/**
* @internal
*/
const getCommandPath = (parsedInput) => match$1(parsedInput.subcommand, {
	onNone: () => [],
	onSome: (subcommand) => [subcommand.name, ...getCommandPath(subcommand.parsedInput)]
});
/**
* @internal
*/
const parseArgs = (lexResult, command, commandPath = []) => gen(function* () {
	const { tokens, trailingOperands: afterEndOfOptions } = lexResult;
	const newCommandPath = [...commandPath, command.name];
	const commandImpl = toImpl(command);
	const flagParams = commandImpl.config.flags.flatMap(extractSingleParams).filter(isFlagParam);
	const flagRegistry = createFlagRegistry(flagParams);
	const inheritedFlagParams = commandImpl.contextConfig.flags.flatMap(extractSingleParams).filter(isFlagParam);
	const inheritedFlagRegistry = createFlagRegistry(inheritedFlagParams);
	const inheritedNames = new Set(inheritedFlagParams.map((param) => param.name));
	const context = {
		command,
		commandPath: newCommandPath,
		flagRegistry,
		inheritedFlagRegistry,
		localFlagNames: flagParams.filter((param) => !inheritedNames.has(param.name)).map((param) => param.name)
	};
	const result = scanCommandLevel(tokens, context);
	if (result._tag === "Leaf") return {
		flags: result.flags,
		arguments: [...result.arguments, ...afterEndOfOptions],
		subcommand: none(),
		...result.errors.length > 0 && { errors: result.errors }
	};
	const subLex = {
		tokens: result.childTokens,
		trailingOperands: afterEndOfOptions
	};
	const subParsed = yield* parseArgs(subLex, result.sub, newCommandPath);
	const allErrors = [...result.errors, ...subParsed.errors ?? []];
	return {
		flags: result.flags,
		arguments: [],
		subcommand: some({
			name: result.sub.name,
			parsedInput: subParsed
		}),
		...allErrors.length > 0 && { errors: allErrors }
	};
});
const makeCursor = (tokens) => {
	let i = 0;
	return {
		peek: () => tokens[i],
		take: () => tokens[i++],
		rest: () => tokens.slice(i)
	};
};
/**
* Long name that sets a boolean flag to `false`, or `undefined` when the flag
* has no negated form.
*/
const negatedName = (param) => !isBoolean(param.primitiveType) || param.negation === false ? void 0 : param.negation ?? `no-${param.name}`;
/**
* Creates a registry for O(1) flag lookup by name or alias.
* @internal
*/
const createFlagRegistry = (params) => {
	const index = /* @__PURE__ */ new Map();
	const negations = /* @__PURE__ */ new Map();
	for (const param of params) {
		if (index.has(param.name)) throw new Error(`Duplicate flag name "${param.name}" in command definition`);
		index.set(param.name, param);
		for (const alias of param.aliases) {
			if (index.has(alias)) throw new Error(`Duplicate flag/alias "${alias}" in command definition (conflicts with "${index.get(alias).name}")`);
			index.set(alias, param);
		}
		const negation = negatedName(param);
		if (negation !== void 0) {
			if (negations.has(negation)) throw new Error(`Duplicate negation "${negation}" in command definition (conflicts with "${negations.get(negation).name}")`);
			negations.set(negation, param);
		}
	}
	return {
		params,
		index,
		negations
	};
};
const buildSubcommandIndex = (subcommands) => {
	const index = /* @__PURE__ */ new Map();
	const setKey = (key, command) => {
		const existing = index.get(key);
		if (existing && existing !== command) throw new Error(`Duplicate subcommand name/alias "${key}" in command definition (conflicts with "${existing.name}")`);
		index.set(key, command);
	};
	for (const group of subcommands) for (const subcommand of group.commands) {
		setKey(subcommand.name, subcommand);
		if (subcommand.alias && subcommand.alias !== subcommand.name) setKey(subcommand.alias, subcommand);
	}
	return index;
};
/** Creates an empty flag map with all known flag names initialized to [].
* @internal
*/
const createEmptyFlagMap = (params) => Object.fromEntries(params.map((p) => [p.name, []]));
/**
* Creates a mutable accumulator for collecting flag values.
* Pre-initializes empty arrays for all known flags.
*/
const createFlagAccumulator = (params) => {
	const map = createEmptyFlagMap(params);
	return {
		add: (name, raw) => {
			if (raw !== void 0) map[name].push(raw);
		},
		merge: (from) => {
			for (const key in from) {
				const values = from[key];
				if (values?.length) for (let i = 0; i < values.length; i++) map[key].push(values[i]);
			}
		},
		snapshot: () => map
	};
};
const isFlagToken = (t) => t._tag === "LongOption" || t._tag === "ShortOption";
const getFlagName = (t) => t._tag === "LongOption" ? t.name : t.flag;
const resolveFlag = (token, registry) => {
	const tokenName = getFlagName(token);
	const direct = registry.index.get(tokenName);
	if (direct && direct.name === tokenName) return {
		param: direct,
		negated: false
	};
	const negated = token._tag === "LongOption" ? registry.negations.get(token.name) : void 0;
	if (negated) return {
		param: negated,
		negated: true
	};
	if (direct) return {
		param: direct,
		negated: false
	};
};
const invalidNegatedFlagValue = (token, spec, value) => new InvalidValue$1({
	option: spec.name,
	value,
	expected: `omit the value and use ${token.raw} by itself to set --${spec.name} to false`,
	kind: "flag"
});
const missingFlagValue = (spec) => {
	const choices = getChoiceKeys(spec.primitiveType);
	return new InvalidValue$1({
		option: spec.name,
		value: "",
		expected: choices === void 0 ? spec.typeName ?? getTypeName(spec.primitiveType) : choices.join(" | "),
		kind: "flag"
	});
};
/**
* Checks whether a token is a boolean literal value.
* Recognizes: true/false, yes/no, on/off, 1/0
*/
const asBooleanLiteral = (token) => token?._tag === "Value" && (isTrueLiteral(token.value) || isFalseLiteral(token.value)) ? token.value : void 0;
/**
* Reads a flag's value from the token stream.
*
* Value resolution order:
* 1. Inline value: --flag=value or -f=value
* 2. Optional value: the flag's configured value, without consuming a token
* 3. Boolean special case: implicit "true" or explicit boolean literal
* 4. Next token: consume following Value token if present
*/
const consumeFlagValue = (cursor, token, spec, negated = false) => {
	const consumed = consumeFlagValueWithTokens(cursor, token, spec, negated);
	switch (consumed._tag) {
		case "Value": return {
			_tag: "Value",
			value: consumed.value
		};
		case "Error": return {
			_tag: "Error",
			error: consumed.error
		};
	}
};
const consumeFlagValueWithTokens = (cursor, token, spec, negated = false) => {
	if (negated) {
		if (token.value !== void 0) return {
			_tag: "Error",
			error: invalidNegatedFlagValue(token, spec, token.value),
			tokens: []
		};
		const literal = spec.optionalValue === void 0 ? asBooleanLiteral(cursor.peek()) : void 0;
		if (literal !== void 0) {
			const literalToken = cursor.take();
			return {
				_tag: "Error",
				error: invalidNegatedFlagValue(token, spec, literal),
				tokens: literalToken === void 0 ? [] : [literalToken]
			};
		}
		return {
			_tag: "Value",
			value: "false",
			tokens: []
		};
	}
	if (token.value !== void 0) return {
		_tag: "Value",
		value: token.value,
		tokens: []
	};
	if (spec.optionalValue !== void 0) return {
		_tag: "Value",
		value: spec.optionalValue,
		tokens: []
	};
	if (isBoolean(spec.primitiveType)) {
		const literal = asBooleanLiteral(cursor.peek());
		const literalToken = literal !== void 0 ? cursor.take() : void 0;
		return {
			_tag: "Value",
			value: literal ?? "true",
			tokens: literalToken === void 0 ? [] : [literalToken]
		};
	}
	const next = cursor.peek();
	if (next?._tag === "Value") {
		const valueToken = cursor.take();
		return {
			_tag: "Value",
			value: next.value,
			tokens: valueToken === void 0 ? [] : [valueToken]
		};
	}
	return {
		_tag: "Error",
		error: missingFlagValue(spec),
		tokens: []
	};
};
/**
* Consumes known flags from a token stream.
* Unrecognized tokens are passed through to remainder.
* Used for both global flag extraction and npm-style parent flag collection.
* @internal
*/
const consumeKnownFlags = (tokens, registry) => {
	const flagMap = createEmptyFlagMap(registry.params);
	const remainder = [];
	const errors = [];
	const cursor = makeCursor(tokens);
	for (let t = cursor.take(); t; t = cursor.take()) {
		if (!isFlagToken(t)) {
			remainder.push(t);
			continue;
		}
		const resolved = resolveFlag(t, registry);
		if (!resolved) {
			remainder.push(t);
			continue;
		}
		const consumed = consumeFlagValue(cursor, t, resolved.param, resolved.negated);
		if (consumed._tag === "Error") {
			errors.push(consumed.error);
			continue;
		}
		if (consumed.value !== void 0) flagMap[resolved.param.name].push(consumed.value);
	}
	return {
		flagMap,
		remainder,
		errors
	};
};
const extractFlagParams = (command) => {
	return toImpl(command).config.flags.flatMap(extractSingleParams).filter(isFlagParam);
};
const extractContextFlagParams = (command) => {
	return toImpl(command).contextConfig.flags.flatMap(extractSingleParams).filter(isFlagParam);
};
const resolveFromRegistries = (token, registries) => {
	for (const registry of registries) {
		const resolved = resolveFlag(token, registry);
		if (resolved !== void 0) return resolved;
	}
};
const preserveFlag = (remainder, cursor, token, resolved) => {
	remainder.push(token);
	const consumed = consumeFlagValueWithTokens(cursor, token, resolved.param, resolved.negated);
	remainder.push(...consumed.tokens);
};
const localFlagWouldPrecedeSubcommand = (token, remainingTokens, resolved, subIndex, registries) => {
	const cursor = makeCursor(remainingTokens);
	consumeFlagValueWithTokens(cursor, token, resolved.param, resolved.negated);
	for (let token = cursor.take(); token; token = cursor.take()) {
		if (isFlagToken(token)) {
			const known = resolveFromRegistries(token, registries);
			if (known !== void 0) consumeFlagValueWithTokens(cursor, token, known.param, known.negated);
			continue;
		}
		if (token._tag === "Value") return subIndex.has(token.value);
	}
	return false;
};
/**
* Consumes global flags while walking the command tree.
*
* Command-local flags take precedence over global flags at the selected command
* level. This lets commands reuse a global flag name, for example a subcommand
* with its own `--version <value>` flag overriding the built-in global
* `--version` action.
* @internal
*/
const consumeGlobalFlags = (tokens, command, registry) => {
	const flagMap = createEmptyFlagMap(registry.params);
	const errors = [];
	const consumeLevel = (tokens, command, ignoredRegistries) => {
		const localRegistry = createFlagRegistry(extractFlagParams(command));
		const inheritedRegistry = createFlagRegistry(extractContextFlagParams(command));
		const subIndex = buildSubcommandIndex(command.subcommands);
		const cursor = makeCursor(tokens);
		const remainder = [];
		let awaitingFirstValue = true;
		for (let token = cursor.take(); token; token = cursor.take()) {
			if (isFlagToken(token)) {
				const ignored = resolveFromRegistries(token, ignoredRegistries);
				if (ignored !== void 0) {
					preserveFlag(remainder, cursor, token, ignored);
					continue;
				}
				const inherited = resolveFlag(token, inheritedRegistry);
				if (inherited !== void 0) {
					preserveFlag(remainder, cursor, token, inherited);
					continue;
				}
				const local = resolveFlag(token, localRegistry);
				const global = resolveFlag(token, registry);
				if (local !== void 0) {
					if (global === void 0 || !awaitingFirstValue || !localFlagWouldPrecedeSubcommand(token, cursor.rest(), local, subIndex, [
						localRegistry,
						inheritedRegistry,
						registry
					])) {
						preserveFlag(remainder, cursor, token, local);
						continue;
					}
				}
				if (global !== void 0) {
					const consumed = consumeFlagValueWithTokens(cursor, token, global.param, global.negated);
					if (consumed._tag === "Error") {
						errors.push(consumed.error);
						continue;
					}
					if (consumed.value !== void 0) flagMap[global.param.name].push(consumed.value);
					continue;
				}
				remainder.push(token);
				continue;
			}
			if (token._tag === "Value" && awaitingFirstValue) {
				const sub = subIndex.get(token.value);
				if (sub !== void 0) {
					remainder.push(token);
					remainder.push(...consumeLevel(cursor.rest(), sub, [...ignoredRegistries, inheritedRegistry]));
					return remainder;
				}
				awaitingFirstValue = false;
			}
			remainder.push(token);
		}
		return remainder;
	};
	return {
		flagMap,
		remainder: consumeLevel(tokens, command, []),
		errors
	};
};
const createUnrecognizedFlagError = (token, params, commandPath) => {
	const printable = token._tag === "LongOption" ? `--${token.name}` : `-${token.flag}`;
	const validNames = [];
	for (const p of params) {
		if (p.hidden) continue;
		validNames.push(p.name);
		const negation = negatedName(p);
		if (negation !== void 0) validNames.push(negation);
		for (const alias of p.aliases) validNames.push(alias);
	}
	const suggestions = suggest(getFlagName(token), validNames).map((n) => n.length === 1 ? `-${n}` : `--${n}`);
	return new UnrecognizedOption({
		option: printable,
		suggestions,
		command: commandPath
	});
};
const createParseState = (registry) => ({
	flags: createFlagAccumulator(registry.params),
	arguments: [],
	errors: [],
	mode: { _tag: "AwaitingFirstValue" }
});
const toLeafResult = (state) => ({
	_tag: "Leaf",
	flags: state.flags.snapshot(),
	arguments: state.arguments,
	errors: state.errors
});
/**
* Determines how to handle the first value token.
*
* If it matches a known subcommand:
* - Collect inherited parent flags from remaining tokens (npm-style)
* - Return SubcommandResult with child tokens
*
* Otherwise:
* - Return Argument to treat it as a positional argument
* - Report error if command expects subcommand but got unknown value
*/
const resolveFirstValue = (value, cursor, context, state) => {
	const { command, commandPath, inheritedFlagRegistry, localFlagNames } = context;
	const subIndex = buildSubcommandIndex(command.subcommands);
	const sub = subIndex.get(value);
	if (sub) {
		const selectedPath = [...commandPath, sub.name];
		const parentFlags = state.flags.snapshot();
		for (const localFlagName of localFlagNames) {
			const values = parentFlags[localFlagName];
			if (values !== void 0 && values.length > 0) state.errors.push(new UnrecognizedOption({
				option: `--${localFlagName}`,
				suggestions: [],
				command: selectedPath
			}));
		}
		const tail = consumeKnownFlags(cursor.rest(), inheritedFlagRegistry);
		state.flags.merge(tail.flagMap);
		state.errors.push(...tail.errors);
		return {
			_tag: "Subcommand",
			result: {
				_tag: "Sub",
				flags: state.flags.snapshot(),
				sub,
				childTokens: tail.remainder,
				errors: state.errors
			}
		};
	}
	if (!(toImpl(command).config.arguments.length > 0) && subIndex.size > 0) {
		const visibleKeys = [];
		for (const [key, sub] of subIndex) if (!sub.unlisted) visibleKeys.push(key);
		const suggestions = suggest(value, visibleKeys);
		state.errors.push(new UnknownSubcommand({
			subcommand: value,
			parent: commandPath,
			suggestions
		}));
	}
	return { _tag: "Argument" };
};
/**
* Processes a flag token: looks up in registry, consumes value, records it.
* Reports unrecognized flags as errors.
*/
const processFlag = (token, cursor, context, state) => {
	const { commandPath, flagRegistry } = context;
	const resolved = resolveFlag(token, flagRegistry);
	if (!resolved) {
		state.errors.push(createUnrecognizedFlagError(token, flagRegistry.params, commandPath));
		return;
	}
	const consumed = consumeFlagValue(cursor, token, resolved.param, resolved.negated);
	if (consumed._tag === "Error") {
		state.errors.push(consumed.error);
		return;
	}
	state.flags.add(resolved.param.name, consumed.value);
};
/**
* Processes a value token based on current parsing mode.
*
* In AwaitingFirstValue mode:
* - Check if value is a subcommand
* - If so, return SubcommandResult to exit scanning
* - If not, switch to CollectingArguments mode
*
* In CollectingArguments mode:
* - Simply add value to arguments list
*/
const processValue = (value, cursor, context, state) => {
	if (state.mode._tag === "AwaitingFirstValue") {
		const result = resolveFirstValue(value, cursor, context, state);
		if (result._tag === "Subcommand") return result.result;
		state.mode = { _tag: "CollectingArguments" };
	}
	state.arguments.push(value);
};
/**
* Scans a single command level, processing all tokens.
*
* For each token:
* - Flags: Look up, consume value, record in accumulator
* - Values: Check for subcommand (first value only), then collect as arguments
*
* Returns LeafResult if no subcommand detected, SubcommandResult otherwise.
*/
const scanCommandLevel = (tokens, context) => {
	const cursor = makeCursor(tokens);
	const state = createParseState(context.flagRegistry);
	for (let token = cursor.take(); token; token = cursor.take()) {
		if (isFlagToken(token)) {
			processFlag(token, cursor, context, state);
			continue;
		}
		if (token._tag === "Value") {
			const subResult = processValue(token.value, cursor, context, state);
			if (subResult) return subResult;
		}
	}
	return toLeafResult(state);
};
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/internal/wizard.js
const run$2 = /*#__PURE__*/ fnUntraced(function* (command, options) {
	const commandPath = options?.commandPath ?? [command.name];
	const selected = getCommandAtPath(command, commandPath);
	const commandLine = (options?.prefix ?? commandPath).map((value) => commandLineArg(value));
	const { colors } = yield* Theme;
	yield* logCurrentCommand(commandLine, colors);
	yield* promptCommand(selected, commandLine, selected === command ? "ROOT" : selected.name, colors);
	return {
		args: commandLine.map((arg) => arg.value),
		displayArgs: commandLine.map((arg) => arg.displayValue)
	};
});
const getCommandAtPath = (command, commandPath) => {
	let current = command;
	for (const name of commandPath.slice(1)) {
		const child = current.subcommands.flatMap((group) => group.commands).find((candidate) => candidate.name === name || candidate.alias === name);
		if (child === void 0) break;
		current = child;
	}
	return current;
};
const promptCommand = /*#__PURE__*/ fnUntraced(function* (command, commandLine, sectionName, colors) {
	const impl = toImpl(command);
	const visibleSubcommands = command.subcommands.flatMap((group) => group.commands.filter((child) => !child.unlisted));
	const config = visibleSubcommands.length === 0 ? impl.config : impl.contextConfig;
	if (config.flags.length > 0) {
		yield* log(renderSection(sectionName, "FLAGS", colors));
		for (const param of config.flags) commandLine.push(...yield* promptParam(param));
		if (config.arguments.length > 0 || visibleSubcommands.length > 0) yield* logCurrentCommand(commandLine, colors);
	}
	if (config.arguments.length > 0) {
		yield* log(renderSection(sectionName, "ARGUMENTS", colors));
		for (const param of config.arguments) commandLine.push(...yield* promptParam(param));
		if (visibleSubcommands.length > 0) yield* logCurrentCommand(commandLine, colors);
	}
	if (visibleSubcommands.length === 0) return;
	const child = yield* run$3(Select({
		message: "Command",
		choices: visibleSubcommands.map((command) => ({
			title: command.name,
			value: command,
			...command.shortDescription !== void 0 ? { description: command.shortDescription } : command.description !== void 0 ? { description: command.description } : {}
		}))
	}));
	yield* log();
	commandLine.push(commandLineArg(child.name));
	if (hasWizardSteps(child)) yield* logCurrentCommand(commandLine, colors);
	yield* promptCommand(child, commandLine, child.name, colors);
});
const hasWizardSteps = (command) => {
	return command.subcommands.some((group) => group.commands.some((child) => !child.unlisted)) || toImpl(command).config.orderedParams.length > 0;
};
const promptParam = /*#__PURE__*/ fnUntraced(function* (param) {
	const single = getUnderlyingSingleOrThrow(param);
	const metadata = getParamMetadata(param);
	if (metadata.isOptional) {
		if (!(yield* run$3(Confirm({
			message: `Set ${renderParamLabel(single)}?`,
			initial: false
		})))) {
			yield* log();
			return [];
		}
	}
	const count = !metadata.isVariadic ? 1 : yield* run$3(Int$3({
		message: `${renderParamLabel(single)} count`,
		default: getOrElse(metadata.variadicMin, () => 0),
		min: getOrElse(metadata.variadicMin, () => 0),
		...isSome(metadata.variadicMax) ? { max: metadata.variadicMax.value } : {}
	}));
	const values = [];
	for (let i = 0; i < count; i++) values.push(yield* promptSingle(single));
	const parsed = single.kind === "flag" ? {
		flags: { [single.name]: values.map((arg) => arg.value) },
		arguments: []
	} : {
		flags: {},
		arguments: values.map((arg) => arg.value)
	};
	yield* param.parse(parsed);
	yield* log();
	if (single.kind === "argument") return values;
	return values.flatMap((value) => single.optionalValue !== void 0 || value.value.startsWith("-") && value.value.length > 1 ? [commandLineArg(`--${single.name}=${value.value}`, `--${single.name}=${value.displayValue}`)] : [commandLineArg(`--${single.name}`), value]);
});
const promptSingle = (single) => {
	const message = renderParamMessage(single);
	switch (single.primitiveType._tag) {
		case "Boolean": return map$3(run$3(Confirm({
			message,
			label: {
				confirm: "true",
				deny: "false"
			},
			placeholder: {
				defaultConfirm: "(T/f)",
				defaultDeny: "(t/F)"
			}
		})), (value) => commandLineArg(String(value)));
		case "Choice": {
			const choices = getChoiceKeys(single.primitiveType) ?? [];
			return map$3(run$3(Select({
				message,
				choices: choices.map((choice) => ({
					title: choice,
					value: choice
				}))
			})), commandLineArg);
		}
		case "Date": return map$3(run$3(Date$1({ message })), (date) => commandLineArg(date.toISOString()));
		case "Finite": return map$3(run$3(Number$1({ message })), (value) => commandLineArg(String(value)));
		case "Int": return map$3(run$3(Int$3({ message })), (value) => commandLineArg(String(value)));
		case "Redacted": return map$3(run$3(Password({ message })), (value$1) => commandLineArg(value(value$1), "<redacted>"));
		default: return map$3(run$3(String$4({ message })), commandLineArg);
	}
};
const commandLineArg = (value, displayValue = value) => ({
	value,
	displayValue
});
const formatName = (single) => single.kind === "flag" ? `--${single.name}` : single.name;
const renderParamMessage = (single) => renderParamLabel(single);
const renderParamLabel = (single) => {
	const description = getOrUndefined(single.description)?.trim();
	const label = single.kind === "flag" && description !== void 0 && description.length <= 32 ? description : humanize(single.name);
	return single.kind === "flag" ? `${label} (${formatName(single)})` : label;
};
const humanize = (name) => {
	const words = name.split(/[-_]+/).filter((word) => word.length > 0);
	if (words.length === 0) return name;
	return [words[0][0].toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
};
const logCurrentCommand = (commandLine, colors) => log(renderCommandBlock("Current command", commandLine.map((arg) => arg.displayValue), colors, magenta));
const renderSection = (commandName, section, colors) => `${annotate(colors, commandName.toUpperCase(), bold, cyanBright)} ${annotate(colors, "·", blackBright)} ${annotate(colors, section, bold, white)}`;
const renderIntroduction = (name, version, summary, colors) => {
	return [
		`${annotate(colors, name, bold, cyanBright)} ${annotate(colors, `v${version}`, white)} ${annotate(colors, "· Command wizard", bold, white)}`,
		...summary === void 0 || summary.length === 0 ? [] : [summary],
		annotate(colors, "Build a command interactively. Press Ctrl+C to cancel.", blackBright),
		""
	].join("\n");
};
const renderCompletion = (commandLine, colors) => renderCommandBlock("Command ready", commandLine, colors, cyanBright, green);
const renderQuit = (colors) => `\n${annotate(colors, "Wizard cancelled.", red)}`;
const renderCommandBlock = (label, commandLine, colors, commandColor, labelColor = white) => {
	const lines = wrapCommand(commandLine);
	return [
		annotate(colors, label, bold, labelColor),
		...lines.map((line) => annotate(colors, line, commandColor)),
		""
	].join("\n");
};
const wrapCommand = (commandLine) => {
	const width = 88;
	const firstIndent = "  $ ";
	const continuationIndent = "    ";
	const args = commandLine.map(formatShellArg);
	const lines = [];
	let current = firstIndent;
	for (const arg of args) {
		const separator = current === firstIndent || current === continuationIndent ? "" : " ";
		if (current.length + separator.length + arg.length > width && current !== firstIndent) {
			lines.push(`${current} \\`);
			current = `${continuationIndent}${arg}`;
		} else current += `${separator}${arg}`;
	}
	if (current !== firstIndent) lines.push(current);
	return lines;
};
const formatShellArg = (arg) => /^[A-Za-z0-9_./:@%+=,-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", `'"'"'`)}'`;
// ../../node_modules/.pnpm/effect@4.1.2/node_modules/effect/dist/cli/Command.js
/**
* Returns `true` if the provided value is a `Command`.
*
* **Gotchas**
*
* This checks for the `Command` type-id property; it does not validate the full
* command shape.
*
* @stability unstable
* @category guards
* @since 4.0.0
*/
const isCommand = (u) => hasProperty(u, TypeId);
/**
* Creates a `Command` from a name, an optional configuration, and an optional
* handler.
*
* **Details**
*
* Use `withDescription` and related metadata combinators to add help text. The
* overloads support simple commands, configured commands, and commands with
* effectful handlers.
*
* **Example** (Creating commands)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Argument, Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* // Simple command with no configuration
* const version = Command.make("version")
*
* // Command with simple flags
* const greet = Command.make("greet", {
*   name: Flag.String("name"),
*   count: Flag.Int("count").pipe(Flag.withDefault(1))
* })
*
* // Command with nested configuration
* const deploy = Command.make("deploy", {
*   environment: Flag.String("env").pipe(
*     Flag.withDescription("Target environment")
*   ),
*   server: {
*     host: Flag.String("host").pipe(Flag.withDefault("localhost")),
*     port: Flag.Int("port").pipe(Flag.withDefault(3000))
*   },
*   files: Argument.String("files").pipe(Argument.variadic),
*   force: Flag.Boolean("force").pipe(
*     Flag.withDescription("Force deployment"),
*     Flag.withDefault(false)
*   )
* })
*
* // Command with handler
* const output: Array<string> = []
* const deployWithHandler = Command.make("deploy", {
*   environment: Flag.String("env"),
*   force: Flag.Boolean("force").pipe(Flag.withDefault(false))
* }, (config) =>
*   Effect.gen(function*() {
*     yield* Effect.sync(() => output.push(`Starting deployment to ${config.environment}`))
*
*     if (!config.force && config.environment === "production") {
*       return yield* Effect.fail("Production deployments require --force flag")
*     }
*
*     yield* Effect.sync(() => output.push("Deployment completed successfully"))
*   }))
*
* await Effect.runPromise(
*   Command.runWith(deployWithHandler, { version: "1.0.0" })([
*     "--env",
*     "staging",
*     "--force"
*   ]).pipe(Effect.provide(CliTestLayer))
* )
* output // => ["Starting deployment to staging", "Deployment completed successfully"]
* ```
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const make$1 = (name, config, handler) => {
	const parsedConfig = parseConfig(config ?? {});
	return makeCommand({
		name,
		config: parsedConfig,
		...isNotUndefined(handler) ? { handle: handler } : {}
	});
};
/**
* Adds or replaces the handler for a command.
*
* **Example** (Adding command handlers)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* // Command without initial handler
* const greet = Command.make("greet", {
*   name: Flag.String("name")
* })
*
* // Add handler later
* const output: Array<string> = []
* const greetWithHandler = greet.pipe(
*   Command.withHandler((config: { readonly name: string }) =>
*     Effect.sync(() => output.push(`Hello, ${config.name}!`)).pipe(Effect.asVoid)
*   )
* )
*
* await Effect.runPromise(
*   Command.runWith(greetWithHandler, { version: "1.0.0" })(["--name", "Alice"]).pipe(
*     Effect.provide(CliTestLayer)
*   )
* )
* output // => ["Hello, Alice!"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withHandler = /*#__PURE__*/ dual(2, (self, handler) => makeCommand({
	...toImpl(self),
	handle: handler
}));
const normalizeSubcommandEntries = (entries) => {
	const flat = [];
	const grouped = /* @__PURE__ */ new Map();
	const addToGroup = (group, command) => {
		flat.push(command);
		const existing = grouped.get(group);
		if (existing) existing.push(command);
		else grouped.set(group, [command]);
	};
	for (const entry of entries) {
		if (isCommand(entry)) {
			addToGroup(void 0, entry);
			continue;
		}
		for (const command of entry.commands) addToGroup(entry.group, command);
	}
	const groups = [];
	const ungroupedCommands = grouped.get(void 0);
	if (ungroupedCommands && ungroupedCommands.length > 0) groups.push({
		group: void 0,
		commands: ungroupedCommands
	});
	for (const [group, commands] of grouped) {
		if (group === void 0) continue;
		groups.push({
			group,
			commands
		});
	}
	return {
		flat,
		groups
	};
};
/**
* Adds subcommands to a command, creating a hierarchical command structure.
*
* **Details**
*
* Subcommands can access their parent's parsed configuration by yielding the parent
* command within their handler. This enables shared parent flags that affect
* all subcommands.
*
* **Example** (Adding subcommands)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* // Parent command with shared flags
* const git = Command.make("git").pipe(
*   Command.withSharedFlags({
*     verbose: Flag.Boolean("verbose").pipe(Flag.withDefault(false))
*   })
* )
*
* // Subcommand that accesses parent config
* const output: Array<string> = []
* const clone = Command.make("clone", {
*   repository: Flag.String("repo")
* }, (config) =>
*   Effect.gen(function*() {
*     const parent = yield* git // Access parent's parsed config
*     if (parent.verbose) {
*       yield* Effect.sync(() => output.push("Verbose mode enabled"))
*     }
*     yield* Effect.sync(() => output.push(`Cloning ${config.repository}`))
*   }))
*
* const app = git.pipe(Command.withSubcommands([clone]))
*
* await Effect.runPromise(
*   Command.runWith(app, { version: "1.0.0" })([
*     "--verbose",
*     "clone",
*     "--repo",
*     "github.com/foo/bar"
*   ]).pipe(Effect.provide(CliTestLayer))
* )
* output // => ["Verbose mode enabled", "Cloning github.com/foo/bar"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withSubcommands = /*#__PURE__*/ dual(2, (self, subcommands) => {
	const normalized = normalizeSubcommandEntries(subcommands);
	checkForDuplicateFlags(self, normalized.flat);
	const impl = toImpl(self);
	const byName = new Map(normalized.flat.map((s) => [s.name, toImpl(s)]));
	const SubcommandStateSymbol = Symbol("effect/cli/SubcommandState");
	const parse = fnUntraced(function* (raw) {
		if (isNone(raw.subcommand)) return yield* impl.parse(raw);
		const sub = byName.get(raw.subcommand.value.name);
		if (!sub) return yield* impl.parse(raw);
		const context = yield* impl.parseContext(raw);
		const result = yield* sub.parse(raw.subcommand.value.parsedInput);
		return {
			...context,
			[SubcommandStateSymbol]: {
				name: sub.name,
				result
			}
		};
	});
	const handle = fnUntraced(function* (input, path) {
		const selectedSubcommand = input[SubcommandStateSymbol];
		if (selectedSubcommand) {
			const child = byName.get(selectedSubcommand.name);
			if (!child) return yield* new ShowHelp({
				commandPath: path,
				errors: []
			});
			return yield* child.handle(selectedSubcommand.result, [...path, child.name]).pipe(provideService(impl.service, input));
		}
		return yield* impl.handle(input, path);
	});
	return makeCommand({
		name: impl.name,
		config: impl.config,
		contextConfig: impl.contextConfig,
		description: impl.description,
		shortDescription: impl.shortDescription,
		alias: impl.alias,
		unlisted: impl.unlisted,
		annotations: impl.annotations,
		globalFlags: impl.globalFlags,
		resolveExamples: impl.resolveExamples,
		service: impl.service,
		subcommands: normalized.groups,
		parse,
		parseContext: impl.parseContext,
		handle
	});
});
/**
* Sets the description for a command.
*
* **Details**
*
* Descriptions provide users with information about what the command does
* when they view help documentation.
*
* **Example** (Setting descriptions)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const output: Array<string> = []
* const deploy = Command.make("deploy", {
*   environment: Flag.String("env")
* }, (config) =>
*   Effect.gen(function*() {
*     yield* Effect.sync(() => output.push(`Deploying to ${config.environment}`))
*   })).pipe(
*     Command.withDescription("Deploy the application to a specified environment")
*   )
*
* await Effect.runPromise(
*   Command.runWith(deploy, { version: "1.0.0" })(["--env", "staging"]).pipe(Effect.provide(CliTestLayer))
* )
* output // => ["Deploying to staging"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withDescription = /*#__PURE__*/ dual(2, (self, description) => makeCommand({
	...toImpl(self),
	description
}));
/**
* Sets a short description for a command.
*
* **Details**
*
* Short descriptions are used when listing subcommands in help output and
* shell completions. If no short description is provided, the full
* `description` is used as a fallback.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withShortDescription = /*#__PURE__*/ dual(2, (self, shortDescription) => makeCommand({
	...toImpl(self),
	shortDescription
}));
/**
* Omits a subcommand from parent help output, shell completions, and
* "did you mean?" suggestions while keeping it fully invocable by exact name.
*
* **When to use**
*
* Use when experimental or internal subcommands should be accepted but not advertised on
* the public CLI surface.
*
* **Example** (Unlisting a subcommand)
*
* ```ts import.meta.vitest
* import { Command } from "effect/cli"
*
* // `experimental` still runs when invoked as `mycli experimental`,
* // but it does not appear under SUBCOMMANDS in `mycli --help`.
* const experimental = Command.make("experimental").pipe(
*   Command.unlisted
* )
*
* const root = Command.make("mycli").pipe(
*   Command.withSubcommands([experimental])
* )
*
* root.subcommands[0].commands[0].unlisted // => true
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const unlisted = (self) => makeCommand({
	...toImpl(self),
	unlisted: true
});
/**
* Sets usage examples for a command.
*
* **Details**
*
* Examples are exposed in structured `HelpDoc` data and rendered by the
* default formatter in an `EXAMPLES` section.
*
* Pass a function to build examples from the `commandPath` shown in help, so
* they stay correct wherever the command is mounted. The `examples` field
* resolves the function with the command's own name as the path.
*
* **Example** (Adding usage examples)
*
* ```ts import.meta.vitest
* import { Command } from "effect/cli"
*
* const login = Command.make("login").pipe(
*   Command.withExamples([
*     { command: "myapp login", description: "Log in with browser OAuth" },
*     { command: "myapp login --token sbp_abc123", description: "Log in with a token" }
*   ])
* )
*
* login.examples.map((example) => example.command) // => ["myapp login", "myapp login --token sbp_abc123"]
* ```
*
* **Example** (Deriving examples from the command path)
*
* ```ts import.meta.vitest
* import { Command } from "effect/cli"
*
* const deploy = Command.make("deploy").pipe(
*   Command.withExamples(({ commandPath }) => [
*     { command: `${commandPath.join(" ")} --yes`, description: "Take every default" }
*   ])
* )
*
* deploy.examples.map((example) => example.command) // => ["deploy --yes"]
* ```
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const withExamples = /*#__PURE__*/ dual(2, (self, examples) => makeCommand({
	...toImpl(self),
	resolveExamples: isFunction(examples) ? (commandPath) => examples({ commandPath }) : () => examples
}));
const getOutOfScopeGlobalFlagErrors = (allFlags, activeFlags, flagMap, commandPath) => {
	const activeSet = new Set(activeFlags);
	const errors = [];
	const seen = /* @__PURE__ */ new Set();
	for (const flag of allFlags) {
		if (activeSet.has(flag)) continue;
		const singles = extractSingleParams(flag.flag);
		for (const single of singles) {
			const entries = flagMap[single.name];
			if (!entries || entries.length === 0) continue;
			const option = `--${single.name}`;
			if (seen.has(option)) continue;
			seen.add(option);
			errors.push(new UnrecognizedOption({
				option,
				suggestions: [],
				command: commandPath
			}));
		}
	}
	return errors;
};
const showHelp = (command, error, renderErrors) => gen(function* () {
	const { builtIns } = yield* CliConfig;
	const presenter = yield* Presenter;
	const { commandPath, errors } = error;
	const helpDoc = yield* getHelpForCommandPath(command, commandPath, builtIns);
	yield* presenter.present(renderErrors && errors.length > 0 ? {
		_tag: "InvalidInvocation",
		commandPath,
		helpDoc,
		errors
	} : {
		_tag: "Help",
		reason: "Implicit",
		commandPath,
		helpDoc
	});
});
const showUserError = (error$3, userMessage) => gen(function* () {
	const formatter = yield* resolveFormatter;
	const rendered = error$3 instanceof UserError ? error$3 : new UserError({
		cause: error$3,
		userMessage
	});
	yield* error(formatter.formatError(rendered));
	Object.assign(error$3, { [errorReported]: false });
});
/**
* Runs a command using the arguments supplied by the `Stdio` service.
*
* **When to use**
*
* Use when command-line arguments should come from `Stdio` at the application
* entry point.
*
* Help, version, and parse error output is written through
* `CliOutput.Presenter`. Help documents are always presented. By default,
* parse error details are also presented, and handler failures annotated with
* `CliError.userMessage`, including `CliError.UserError`, are rendered with the
* installed `CliOutput.Formatter` before the error is rethrown. Set
* `renderErrors` to `false` when the host application owns error rendering.
*
* **Example** (Running commands with standard input)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({
*     args: Effect.succeed(["--name", "Alice"])
*   }),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const output: Array<string> = []
* const greetCommand = Command.make("greet", {
*   name: Flag.String("name")
* }, (config) =>
*   Effect.gen(function*() {
*     yield* Effect.sync(() => output.push(`Hello, ${config.name}!`))
*   }))
*
* // Automatically gets args from the Stdio service
* const program = Command.run(greetCommand, {
*   version: "1.0.0"
* })
*
* await Effect.runPromise(program.pipe(Effect.provide(CliTestLayer)))
* output // => ["Hello, Alice!"]
* ```
*
* @see {@link runWith} for running a command with an explicit argument array
*
* @stability unstable
* @category running
* @since 4.0.0
*/
const run$1 = /*#__PURE__*/ dual(2, (command, config) => Stdio.use(({ args }) => flatMap$1(args, (args) => runWith(command, config)(args))));
/**
* Runs a command with explicitly provided arguments instead of using arguments from `Stdio`.
*
* **When to use**
*
* Use when you need to test CLI applications or programmatically execute
* commands with specific arguments.
*
* Help, version, and parse error output is written through
* `CliOutput.Presenter`. Help documents are always presented. By default,
* parse error details are also presented, and handler failures annotated with
* `CliError.userMessage`, including `CliError.UserError`, are rendered with the
* installed `CliOutput.Formatter` before the error is rethrown. Set
* `renderErrors` to `false` when the host application owns error rendering.
*
* **Example** (Running commands with explicit arguments)
*
* ```ts import.meta.vitest
* import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
* import { Command, Flag } from "effect/cli"
* import { ChildProcessSpawner } from "effect/process"
*
* const CliTestLayer = Layer.mergeAll(
*   FileSystem.layerNoop({}),
*   Path.layer,
*   Stdio.layerTest({}),
*   Layer.succeed(Terminal.Terminal, Terminal.make({
*     columns: Effect.succeed(80),
*     rows: Effect.succeed(24),
*     size: Effect.die("unused"),
*     readInput: Effect.die("unused"),
*     readLine: Effect.die("unused"),
*     display: () => Effect.void
*   })),
*   Layer.succeed(
*     ChildProcessSpawner.ChildProcessSpawner,
*     ChildProcessSpawner.make(() => Effect.die("unused"))
*   )
* )
*
* const output: Array<string> = []
* const greet = Command.make("greet", {
*   name: Flag.String("name"),
*   count: Flag.Int("count").pipe(Flag.withDefault(1))
* }, (config) =>
*   Effect.gen(function*() {
*     for (let i = 0; i < config.count; i++) {
*       yield* Effect.sync(() => output.push(`Hello, ${config.name}!`))
*     }
*   }))
*
* // Test with specific arguments
* const testProgram = Effect.gen(function*() {
*   const runCommand = Command.runWith(greet, { version: "1.0.0" })
*
*   yield* runCommand(["--name", "Alice", "--count", "2"])
* })
*
* await Effect.runPromise(testProgram.pipe(Effect.provide(CliTestLayer)))
* output // => ["Hello, Alice!", "Hello, Alice!"]
* ```
*
* @stability unstable
* @category running
* @since 4.0.0
*/
const runWith = (command, config) => {
	const commandImpl = toImpl(command);
	return fnUntraced(function* (args) {
		const { builtIns } = yield* CliConfig;
		const { tokens, trailingOperands } = lex(args);
		const allFlags = getGlobalFlagsForCommandTree(command, builtIns);
		const allFlagParams = allFlags.flatMap((f) => extractSingleParams(f.flag));
		const globalRegistry = createFlagRegistry(allFlagParams.filter(isFlagParam));
		const { flagMap, remainder, errors: globalFlagErrors } = consumeGlobalFlags(tokens, command, globalRegistry);
		const emptyArgs = {
			flags: flagMap,
			arguments: []
		};
		const parsedArgs = yield* parseArgs({
			tokens: remainder,
			trailingOperands
		}, command);
		const commandPath = [command.name, ...getCommandPath(parsedArgs)];
		const toShowHelp = mapError((error) => error._tag === "ShowHelp" ? error : new ShowHelp({
			commandPath,
			errors: [error]
		}));
		const handlerCtx = {
			builtIns,
			command,
			commandPath,
			version: config.version
		};
		const activeFlags = getGlobalFlagsForCommandPath(command, commandPath, builtIns);
		const outOfScopeErrors = getOutOfScopeGlobalFlagErrors(allFlags, activeFlags, flagMap, commandPath);
		if (outOfScopeErrors.length > 0 || globalFlagErrors.length > 0) {
			const parseErrors = parsedArgs.errors ?? [];
			return yield* new ShowHelp({
				commandPath,
				errors: [
					...globalFlagErrors,
					...outOfScopeErrors,
					...parseErrors
				]
			});
		}
		for (const flag of activeFlags) {
			if (flag._tag !== "Action") continue;
			if (!extractSingleParams(flag.flag).some((s) => {
				const entries = flagMap[s.name];
				return entries !== void 0 && entries.length > 0;
			})) continue;
			const [, value] = yield* flag.flag.parse(emptyArgs).pipe(toShowHelp);
			if (flag === Wizard) {
				const { colors } = yield* Theme;
				return yield* gen(function* () {
					yield* log(renderIntroduction(command.name, config.version, command.description, colors));
					const prefix = [command.name, ...args.filter((arg) => arg !== "--wizard" && !arg.startsWith("--wizard="))];
					const wizardResult = yield* run$2(command, {
						commandPath,
						prefix
					});
					yield* log(renderCompletion(wizardResult.displayArgs, colors));
					if (yield* run$3(Toggle({
						message: "Run this command?",
						initial: true,
						active: "yes",
						inactive: "no"
					}))) {
						yield* log();
						yield* runWith(command, {
							...config,
							renderErrors: false
						})(wizardResult.args.slice(1));
					}
				}).pipe(catchTag("QuitError", () => log(renderQuit(colors))));
			}
			yield* flag.run(value, handlerCtx);
			return;
		}
		if (parsedArgs.errors && parsedArgs.errors.length > 0) return yield* new ShowHelp({
			commandPath,
			errors: parsedArgs.errors
		});
		const input = yield* commandImpl.parse(parsedArgs).pipe(toShowHelp);
		let program = commandImpl.handle(input, [command.name]);
		const logLevel = activeFlags.includes(LogLevel) ? (yield* LogLevel.flag.parse(emptyArgs).pipe(toShowHelp))[1] : none();
		program = provideService(program, LogLevel, logLevel);
		for (const flag of activeFlags) {
			if (flag._tag !== "Setting" || flag === LogLevel) continue;
			const [, value] = yield* flag.flag.parse(emptyArgs).pipe(toShowHelp);
			program = provideService(program, flag, value);
		}
		const services = match$1(logLevel, {
			onNone: () => empty$1(),
			onSome: (level) => make$3(MinimumLogLevel, level)
		});
		yield* provideContext(program, services);
	}, catchFilter((error) => isCliError(error) && error._tag === "ShowHelp" ? succeed$2(error) : fail$1(error), (error) => andThen(showHelp(command, error, config.renderErrors !== false), fail(error))), catchFilter((error) => {
		if (config.renderErrors === false || !isObjectKeyword(error)) return fail$1(error);
		const userMessage = getUserMessage(error);
		return userMessage === void 0 ? fail$1(error) : succeed$2({
			error,
			userMessage
		});
	}, ({ error, userMessage }) => andThen(showUserError(error, userMessage), fail(error))), catchFilter((e) => isQuitError(e) ? succeed$2(e) : fail$1(e), (_) => interrupt));
};
// src/bootstrap.ts
var BootstrapFdStatError = class extends TaggedError()("BootstrapFdStatError", {
	fd: Number$2,
	cause: Defect()
}) {
	get message() {
		return `Failed to stat bootstrap file descriptor ${this.fd}.`;
	}
};
var BootstrapInputStreamOpenError = class extends TaggedError()("BootstrapInputStreamOpenError", {
	fd: Number$2,
	platform: String$6,
	fdPath: optional$3(String$6),
	cause: Defect()
}) {
	get message() {
		const path = this.fdPath === void 0 ? "" : ` via '${this.fdPath}'`;
		return `Failed to open bootstrap input stream for file descriptor ${this.fd}${path} on '${this.platform}'.`;
	}
};
var BootstrapEnvelopeReadError = class extends TaggedError()("BootstrapEnvelopeReadError", {
	fd: Number$2,
	cause: Defect()
}) {
	get message() {
		return `Failed to read bootstrap envelope from file descriptor ${this.fd}.`;
	}
};
var BootstrapEnvelopeDecodeError = class extends TaggedError()("BootstrapEnvelopeDecodeError", {
	fd: Number$2,
	cause: Defect()
}) {
	get message() {
		return `Failed to decode bootstrap envelope from file descriptor ${this.fd}.`;
	}
};
Union([
	BootstrapFdStatError,
	BootstrapInputStreamOpenError,
	BootstrapEnvelopeReadError,
	BootstrapEnvelopeDecodeError
]);
const readBootstrapEnvelope = fn("readBootstrapEnvelope")(function* (schema, fd, options) {
	if (!(yield* isFdReady(fd))) return none();
	const stream = yield* makeBootstrapInputStream(fd);
	const timeoutMs = options?.timeoutMs ?? 1e3;
	return yield* callback((resume) => {
		const input = NodeReadline.createInterface({
			input: stream,
			crlfDelay: Infinity
		});
		const cleanup = () => {
			stream.removeListener("error", handleError);
			input.removeListener("line", handleLine);
			input.removeListener("close", handleClose);
			input.close();
			stream.destroy();
		};
		const handleError = (error) => {
			if (isUnavailableBootstrapFdError(error)) {
				resume(succeedNone);
				return;
			}
			resume(fail(new BootstrapEnvelopeReadError({
				fd,
				cause: error
			})));
		};
		const handleLine = (line) => {
			const parsed = decodeJsonResult(schema)(line);
			if (isSuccess(parsed)) resume(succeedSome(parsed.success));
			else resume(fail(new BootstrapEnvelopeDecodeError({
				fd,
				cause: parsed.failure
			})));
		};
		const handleClose = () => {
			resume(succeedNone);
		};
		stream.once("error", handleError);
		input.once("line", handleLine);
		input.once("close", handleClose);
		return sync(cleanup);
	}).pipe(timeoutOption(timeoutMs), map$3(flatten));
});
const isUnavailableBootstrapFdError = compose(hasProperty("code"), (_) => _.code === "EBADF" || _.code === "ENOENT");
const isFdReady = (fd) => try_({
	try: () => NodeFS.fstatSync(fd),
	catch: (error) => new BootstrapFdStatError({
		fd,
		cause: error
	})
}).pipe(as(true), catchTags({ BootstrapFdStatError: (error) => isUnavailableBootstrapFdError(error.cause) ? succeed$1(false) : fail(error) }));
const makeBootstrapInputStream = fn("bootstrap.makeBootstrapInputStream")(function* (fd) {
	const platform = yield* Platform;
	const fdPath = resolveFdPath(fd, platform);
	return yield* try_({
		try: () => {
			if (fdPath === void 0) return makeDirectBootstrapStream(fd);
			let streamFd;
			try {
				streamFd = NodeFS.openSync(fdPath, "r");
				return NodeFS.createReadStream("", {
					fd: streamFd,
					encoding: "utf8",
					autoClose: true
				});
			} catch (error) {
				if (isBootstrapFdPathDuplicationError(error)) {
					if (streamFd !== void 0) NodeFS.closeSync(streamFd);
					return makeDirectBootstrapStream(fd);
				}
				throw error;
			}
		},
		catch: (error) => new BootstrapInputStreamOpenError({
			fd,
			platform,
			...fdPath === void 0 ? {} : { fdPath },
			cause: error
		})
	});
});
const makeDirectBootstrapStream = (fd) => {
	try {
		return NodeFS.createReadStream("", {
			fd,
			encoding: "utf8",
			autoClose: true
		});
	} catch {
		const stream = new NodeNet.Socket({
			fd,
			readable: true,
			writable: false
		});
		stream.setEncoding("utf8");
		return stream;
	}
};
const isBootstrapFdPathDuplicationError = compose(hasProperty("code"), (_) => _.code === "ENXIO" || _.code === "EINVAL" || _.code === "EPERM" || _.code === "EACCES");
function resolveFdPath(fd, platform) {
	if (platform === "linux") return `/proc/self/fd/${fd}`;
	if (platform === "win32") return;
	return `/dev/fd/${fd}`;
}
// src/cli/config.ts
const modeFlag = Literals("mode", RuntimeMode.literals).pipe(withDescription$1("Runtime mode. `desktop` keeps loopback defaults unless overridden."), optional);
const portFlag = Int("port").pipe(withSchema(PortSchema), withDescription$1("Port for the HTTP/WebSocket server."), optional);
const hostFlag = String$1("host").pipe(withDescription$1("Host/interface to bind (for example 127.0.0.1, 0.0.0.0, or a Tailnet IP)."), optional);
const baseDirFlag = String$1("base-dir").pipe(withDescription$1("Explicit T3 Code data directory; runtime state is stored under userdata (equivalent to T3CODE_HOME)."), optional);
const devUrlFlag = String$1("dev-url").pipe(withSchema(URLFromString), withDescription$1("Dev web URL to proxy/redirect to (equivalent to VITE_DEV_SERVER_URL)."), optional);
const noBrowserFlag = Boolean$1("no-browser").pipe(withDescription$1("Disable automatic browser opening."), optional);
const bootstrapFdFlag = Int("bootstrap-fd").pipe(withSchema(Int$5), withDescription$1("Read one-time bootstrap secrets from the given file descriptor."), optional);
const autoBootstrapProjectFromCwdFlag = Boolean$1("auto-bootstrap-project-from-cwd").pipe(withDescription$1("Create a project for the current working directory on startup when missing."), optional);
const logWebSocketEventsFlag = Boolean$1("log-websocket-events").pipe(withDescription$1("Emit server-side logs for outbound WebSocket push traffic (equivalent to T3CODE_LOG_WS_EVENTS)."), withAlias("log-ws-events"), optional);
const tailscaleServeFlag = Boolean$1("tailscale-serve").pipe(withDescription$1("Configure Tailscale Serve to expose this backend over HTTPS on the Tailnet."), optional);
const tailscaleServePortFlag$1 = Int("tailscale-serve-port").pipe(withSchema(PortSchema), withDescription$1("HTTPS port for Tailscale Serve when --tailscale-serve is enabled."), optional);
const lanFlag = Boolean$1("lan").pipe(withDescription$1("Accept connections from your local network and tailnet, not only this machine (equivalent to T3CODE_LAN)."), optional);
const traceFileConfig = String$7("T3CODE_TRACE_FILE").pipe(option$1, map$5(getOrUndefined));
const traceMaxFilesConfig = Int$6("T3CODE_TRACE_MAX_FILES").pipe(withDefault$2(10));
const EnvServerConfig = all$1({
	logLevel: LogLevel$1("T3CODE_LOG_LEVEL").pipe(withDefault$2("Info")),
	traceMinLevel: LogLevel$1("T3CODE_TRACE_MIN_LEVEL").pipe(withDefault$2("Info")),
	traceTimingEnabled: Boolean$5("T3CODE_TRACE_TIMING_ENABLED").pipe(withDefault$2(true)),
	traceFile: traceFileConfig,
	traceMaxBytes: Int$6("T3CODE_TRACE_MAX_BYTES").pipe(withDefault$2(10485760)),
	traceMaxFiles: traceMaxFilesConfig,
	traceBatchWindowMs: Int$6("T3CODE_TRACE_BATCH_WINDOW_MS").pipe(withDefault$2(1e3)),
	otlpTracesUrl: String$7("T3CODE_OTLP_TRACES_URL").pipe(option$1, map$5(getOrUndefined)),
	otlpMetricsUrl: String$7("T3CODE_OTLP_METRICS_URL").pipe(option$1, map$5(getOrUndefined)),
	otlpLogsUrl: String$7("T3CODE_OTLP_LOGS_URL").pipe(option$1, map$5(getOrUndefined)),
	otlpExportIntervalMs: Int$6("T3CODE_OTLP_EXPORT_INTERVAL_MS").pipe(withDefault$2(1e4)),
	otlpHeaders: schema(OtlpHeadersFromString, "T3CODE_OTLP_HEADERS").pipe(option$1, map$5(getOrUndefined)),
	otlpProtocol: schema(OtlpProtocol, "T3CODE_OTLP_PROTOCOL").pipe(withDefault$2("http/json")),
	mode: schema(RuntimeMode, "T3CODE_MODE").pipe(option$1, map$5(getOrUndefined)),
	port: Port("T3CODE_PORT").pipe(option$1, map$5(getOrUndefined)),
	host: String$7("T3CODE_HOST").pipe(option$1, map$5(getOrUndefined)),
	t3Home: String$7("T3CODE_HOME").pipe(option$1, map$5(getOrUndefined)),
	devUrl: URL$1("VITE_DEV_SERVER_URL").pipe(option$1, map$5(getOrUndefined)),
	devAllowedOrigins: String$7("T3CODE_DEV_ALLOWED_ORIGINS").pipe(withDefault$2(""), map$5((value) => value.split(",").map((entry) => entry.trim()).filter((entry) => entry.length > 0))),
	noBrowser: Boolean$5("T3CODE_NO_BROWSER").pipe(option$1, map$5(getOrUndefined)),
	bootstrapFd: Int$6("T3CODE_BOOTSTRAP_FD").pipe(option$1, map$5(getOrUndefined)),
	autoBootstrapProjectFromCwd: Boolean$5("T3CODE_AUTO_BOOTSTRAP_PROJECT_FROM_CWD").pipe(option$1, map$5(getOrUndefined)),
	logWebSocketEvents: Boolean$5("T3CODE_LOG_WS_EVENTS").pipe(option$1, map$5(getOrUndefined)),
	tailscaleServeEnabled: Boolean$5("T3CODE_TAILSCALE_SERVE").pipe(option$1, map$5(getOrUndefined)),
	tailscaleServePort: Port("T3CODE_TAILSCALE_SERVE_PORT").pipe(option$1, map$5(getOrUndefined)),
	lan: Boolean$5("T3CODE_LAN").pipe(option$1, map$5(getOrUndefined))
});
const DevAuthTokenConfig = Redacted("T3CODE_DEV_AUTH_TOKEN").pipe(map$5((token) => make$2(value(token).trim())), mapEffect$1((token) => value(token).length === 0 || value(token).length >= 32 ? succeed$1(token) : fail(new ConfigError(new SchemaError(new InvalidValue({ message: "T3CODE_DEV_AUTH_TOKEN must contain at least 32 characters." }))))), option$1, map$5(filter((token) => value(token).length > 0)), map$5(getOrUndefined));
const authLocationFlags = {
	baseDir: baseDirFlag,
	devUrl: devUrlFlag
};
const projectLocationFlags = { baseDir: baseDirFlag };
const sharedServerCommandFlags = {
	mode: modeFlag,
	port: portFlag,
	host: hostFlag,
	baseDir: baseDirFlag,
	cwd: String$2("cwd").pipe(withDescription$2("Working directory for provider sessions (defaults to the current directory)."), optional$1),
	devUrl: devUrlFlag,
	noBrowser: noBrowserFlag,
	bootstrapFd: bootstrapFdFlag,
	autoBootstrapProjectFromCwd: autoBootstrapProjectFromCwdFlag,
	logWebSocketEvents: logWebSocketEventsFlag,
	tailscaleServeEnabled: tailscaleServeFlag,
	tailscaleServePort: tailscaleServePortFlag$1,
	lan: lanFlag
};
const resolveOptionPrecedence = (...values) => firstSomeOf(values);
const loadPersistedObservabilitySettings = fn(function* (settingsPath) {
	const fs = yield* FileSystem;
	if (!(yield* fs.exists(settingsPath).pipe(orElseSucceed(() => false)))) return {
		otlpTracesUrl: void 0,
		otlpMetricsUrl: void 0,
		otlpLogsUrl: void 0
	};
	const raw = yield* fs.readFileString(settingsPath).pipe(orElseSucceed(() => ""));
	return parsePersistedServerObservabilitySettings(raw);
});
const resolveServerConfig = fn("config.resolveServerConfig")(function* (flags, cliLogLevel, options) {
	const { findAvailablePort } = yield* NetService;
	const selectAutomaticPort = options?.selectAutomaticPort ?? findAvailablePort;
	const path = yield* Path;
	const fs = yield* FileSystem;
	const env = yield* EnvServerConfig;
	const normalizedFlags = {
		mode: flags.mode ?? none(),
		port: flags.port ?? none(),
		host: flags.host ?? none(),
		baseDir: flags.baseDir ?? none(),
		cwd: flags.cwd ?? none(),
		devUrl: flags.devUrl ?? none(),
		noBrowser: flags.noBrowser ?? none(),
		bootstrapFd: flags.bootstrapFd ?? none(),
		autoBootstrapProjectFromCwd: flags.autoBootstrapProjectFromCwd ?? none(),
		logWebSocketEvents: flags.logWebSocketEvents ?? none(),
		tailscaleServeEnabled: flags.tailscaleServeEnabled ?? none(),
		tailscaleServePort: flags.tailscaleServePort ?? none(),
		lan: flags.lan ?? none()
	};
	const bootstrapFd = getOrUndefined(normalizedFlags.bootstrapFd) ?? env.bootstrapFd;
	const bootstrapEnvelope = bootstrapFd !== void 0 ? yield* readBootstrapEnvelope(DesktopBackendBootstrap, bootstrapFd) : none();
	const bootstrap = getOrUndefined(bootstrapEnvelope);
	const mode = getOrElse(resolveOptionPrecedence(normalizedFlags.mode, fromUndefinedOr(env.mode), fromUndefinedOr(bootstrap?.mode)), () => "web");
	const port = yield* match$1(resolveOptionPrecedence(normalizedFlags.port, fromUndefinedOr(env.port), fromUndefinedOr(bootstrap?.port)), {
		onSome: (value) => succeed$1(value),
		onNone: () => {
			if (mode === "desktop") return succeed$1(DEFAULT_PORT);
			return selectAutomaticPort(DEFAULT_PORT);
		}
	});
	const devUrl = getOrElse(resolveOptionPrecedence(normalizedFlags.devUrl, fromUndefinedOr(env.devUrl)), () => void 0);
	const devAuthToken = mode === "web" && devUrl !== void 0 ? yield* DevAuthTokenConfig : void 0;
	const explicitBaseDir = resolveOptionPrecedence(normalizedFlags.baseDir, fromUndefinedOr(env.t3Home)).pipe(filter((value) => value.trim().length > 0));
	const baseDir = yield* resolveBaseDir(getOrUndefined(resolveOptionPrecedence(explicitBaseDir, fromUndefinedOr(bootstrap?.t3Home))));
	const rawCwd = getOrElse(normalizedFlags.cwd, () => process.cwd());
	const cwd = path.resolve(yield* expandHomePath(rawCwd.trim()));
	const derivedPaths = yield* deriveServerPaths(baseDir, devUrl, { baseDirIsExplicit: isSome(explicitBaseDir) });
	if (options?.rejectRunningServer && mode === "web") {
		const runtime = yield* readPersistedServerRuntimeState(derivedPaths.serverRuntimeStatePath);
		if (isSome(runtime) && runtime.value.pid > 0 && runtime.value.pid !== process.pid && isProcessAlive(runtime.value.pid)) return yield* new UserError({ cause: `A T3 Code server is already running for ${baseDir} (pid ${runtime.value.pid}, ${runtime.value.origin}). Connect to that server, stop it before starting another, or use a different --base-dir.` });
	}
	yield* fs.makeDirectory(cwd, { recursive: true });
	yield* ensureServerDirectories(derivedPaths);
	const persistedObservabilitySettings = yield* loadPersistedObservabilitySettings(derivedPaths.settingsPath);
	const serverTracePath = env.traceFile ?? derivedPaths.serverTracePath;
	yield* fs.makeDirectory(path.dirname(serverTracePath), { recursive: true });
	const startupPresentation = options?.startupPresentation ?? "browser";
	const isHeadlessStartup = startupPresentation === "headless";
	const noBrowser = getOrElse(resolveOptionPrecedence(isHeadlessStartup ? some(true) : none(), normalizedFlags.noBrowser, fromUndefinedOr(env.noBrowser), fromUndefinedOr(bootstrap?.noBrowser)), () => mode === "desktop");
	const desktopBootstrapToken = bootstrap?.desktopBootstrapToken;
	const desktopBootstrapSecret = bootstrap?.desktopBootstrapSecret;
	const shellEnvironmentPrepared = bootstrap?.shellEnvironmentPrepared;
	const desktopTelemetryFd = bootstrap?.desktopTelemetryFd;
	const desktopTelemetryControlFd = bootstrap?.desktopTelemetryControlFd;
	const desktopBrowserFd = bootstrap?.desktopBrowserFd;
	const desktopBrowserControlFd = bootstrap?.desktopBrowserControlFd;
	const resourceMonitorPath = bootstrap?.resourceMonitorPath;
	const autoBootstrapProjectFromCwd = getOrElse(resolveOptionPrecedence(fromUndefinedOr(options?.forceAutoBootstrapProjectFromCwd), isHeadlessStartup ? some(false) : none(), normalizedFlags.autoBootstrapProjectFromCwd, fromUndefinedOr(env.autoBootstrapProjectFromCwd)), () => mode === "web");
	const logWebSocketEvents = getOrElse(resolveOptionPrecedence(normalizedFlags.logWebSocketEvents, fromUndefinedOr(env.logWebSocketEvents)), () => Boolean(devUrl));
	const tailscaleServeEnabled = getOrElse(resolveOptionPrecedence(normalizedFlags.tailscaleServeEnabled, fromUndefinedOr(env.tailscaleServeEnabled), fromUndefinedOr(bootstrap?.tailscaleServeEnabled)), () => false);
	const tailscaleServePort = getOrElse(resolveOptionPrecedence(normalizedFlags.tailscaleServePort, fromUndefinedOr(env.tailscaleServePort), fromUndefinedOr(bootstrap?.tailscaleServePort)), () => 443);
	const staticDir = devUrl ? void 0 : yield* resolveStaticDir();
	const explicitHost = resolveOptionPrecedence(normalizedFlags.host, fromUndefinedOr(env.host), fromUndefinedOr(bootstrap?.host));
	const lan = resolveOptionPrecedence(normalizedFlags.lan, fromUndefinedOr(env.lan));
	const privateNetworkOnly = isNone(explicitHost) && mode === "web" && (isSome(lan) ? lan.value : yield* resolveServiceLauncherMode().pipe(map$3((launcher) => launcher.managed), orElseSucceed(() => false)));
	const host = getOrElse(explicitHost, () => privateNetworkOnly ? "0.0.0.0" : mode === "desktop" ? "127.0.0.1" : void 0);
	const logLevel = getOrElse(cliLogLevel, () => env.logLevel);
	const otel = yield* load;
	const signalExport = {
		protocol: env.otlpProtocol,
		headers: env.otlpHeaders,
		exportIntervalMs: env.otlpExportIntervalMs
	};
	const traces = resolveSignalEndpoint(otel, "traces", {
		url: env.otlpTracesUrl,
		export: signalExport
	}, {
		bootstrapUrl: bootstrap?.otlpTracesUrl,
		settingsUrl: persistedObservabilitySettings.otlpTracesUrl
	});
	const metrics = resolveSignalEndpoint(otel, "metrics", {
		url: env.otlpMetricsUrl,
		export: signalExport
	}, {
		bootstrapUrl: bootstrap?.otlpMetricsUrl,
		settingsUrl: persistedObservabilitySettings.otlpMetricsUrl
	});
	const logs = resolveSignalEndpoint(otel, "logs", {
		url: env.otlpLogsUrl,
		export: signalExport
	}, {
		bootstrapUrl: bootstrap?.otlpLogsUrl,
		settingsUrl: persistedObservabilitySettings.otlpLogsUrl
	});
	return {
		logLevel,
		traceMinLevel: env.traceMinLevel,
		traceTimingEnabled: env.traceTimingEnabled,
		traceBatchWindowMs: env.traceBatchWindowMs,
		traceMaxBytes: env.traceMaxBytes,
		traceMaxFiles: env.traceMaxFiles,
		otlpTracesUrl: traces?.url,
		otlpMetricsUrl: metrics?.url,
		otlpLogsUrl: logs?.url,
		otlpTracesExport: traces?.export ?? signalExport,
		otlpMetricsExport: metrics?.export ?? signalExport,
		otlpLogsExport: logs?.export ?? signalExport,
		...traces !== void 0 ? { otlpTracesSource: traces.source } : {},
		...traces?.variable !== void 0 ? { otlpTracesVariable: traces.variable } : {},
		...metrics !== void 0 ? { otlpMetricsSource: metrics.source } : {},
		...metrics?.variable !== void 0 ? { otlpMetricsVariable: metrics.variable } : {},
		...logs !== void 0 ? { otlpLogsSource: logs.source } : {},
		...logs?.variable !== void 0 ? { otlpLogsVariable: logs.variable } : {},
		otelEnvironment: otel,
		mode,
		port,
		cwd,
		baseDir,
		...derivedPaths,
		serverTracePath,
		host,
		...privateNetworkOnly ? { privateNetworkOnly } : {},
		staticDir,
		devUrl,
		...devAuthToken === void 0 ? {} : { devAuthToken },
		devAllowedOrigins: env.devAllowedOrigins,
		noBrowser,
		startupPresentation,
		desktopBootstrapToken,
		...desktopBootstrapSecret === void 0 ? {} : { desktopBootstrapSecret },
		...shellEnvironmentPrepared === void 0 ? {} : { shellEnvironmentPrepared },
		desktopTelemetryFd,
		desktopTelemetryControlFd,
		desktopBrowserFd,
		desktopBrowserControlFd,
		resourceMonitorPath,
		autoBootstrapProjectFromCwd,
		logWebSocketEvents,
		tailscaleServeEnabled,
		tailscaleServePort
	};
});
const resolveCliAuthConfig = (flags, cliLogLevel, options) => {
	const resolved = resolveServerConfig({
		mode: none(),
		port: none(),
		host: none(),
		baseDir: flags.baseDir,
		cwd: none(),
		devUrl: flags.devUrl ?? none(),
		noBrowser: none(),
		bootstrapFd: none(),
		autoBootstrapProjectFromCwd: none(),
		logWebSocketEvents: none(),
		tailscaleServeEnabled: none(),
		tailscaleServePort: none(),
		lan: none()
	}, cliLogLevel);
	return options?.quietLogs === true ? resolved.pipe(provideService(MinimumLogLevel, "Error")) : resolved;
};
const DurationShorthandPattern = /^(?<value>\d+)(?<unit>ms|s|m|h|d|w)$/i;
const parseDurationInput = (value) => {
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	const shorthand = DurationShorthandPattern.exec(trimmed);
	const normalizedInput = shorthand?.groups ? (() => {
		const amountText = shorthand.groups.value;
		const unitText = shorthand.groups.unit;
		if (typeof amountText !== "string" || typeof unitText !== "string") return null;
		const amount = Number.parseInt(amountText, 10);
		if (!Number.isFinite(amount)) return null;
		switch (unitText.toLowerCase()) {
			case "ms": return `${amount} millis`;
			case "s": return `${amount} seconds`;
			case "m": return `${amount} minutes`;
			case "h": return `${amount} hours`;
			case "d": return `${amount} days`;
			case "w": return `${amount} weeks`;
			default: return null;
		}
	})() : trimmed;
	if (normalizedInput === null) return null;
	const decoded = fromInput(normalizedInput);
	return isSome(decoded) ? decoded.value : null;
};
const DurationFromString = String$6.pipe(decodeTo(Duration, transformEffect({
	decode: (value) => {
		const duration = parseDurationInput(value);
		if (duration !== null) return succeed$1(duration);
		return fail(new InvalidValue({ message: "Invalid duration. Use values like 5m, 1h, 30d, or 15 minutes." }));
	},
	encode: (duration) => succeed$1(format$1(duration))
})));
// src/cloud/serviceProtection.ts
const PROTECT_DROP_IN = "90-t3code-protect.conf";
const SYSTEM_UNIT_DIR = "/etc/systemd/system";
const REMOTE_ACCESS_UNITS = [
	"tailscaled.service",
	"ssh.service",
	"sshd.service"
];
const USER_CHAIN_LOW = "MemoryLow=2G";
const PROTECTED_OOM_SCORE = "OOMScoreAdjust=-900";
const dropIn = (directory, unit, section, properties, shared = false) => ({
	unit,
	path: `${directory}/${unit}.d/${PROTECT_DROP_IN}`,
	contents: [
		`[${section}]`,
		...properties,
		""
	].join("\n"),
	...shared ? { shared } : {}
});
/**
* Memory protection only reaches the server when every ancestor cgroup grants
* it, and only root can grant it on user.slice and the user manager.
*/
function protectionPlan(input) {
	const manager = `user@${input.uid}.service`;
	const remote = input.remoteAccessUnits;
	const systemUnitDir = input.systemUnitDir ?? SYSTEM_UNIT_DIR;
	const system = (unit, section, properties) => dropIn(systemUnitDir, unit, section, properties);
	const shared = (unit, section, properties) => dropIn(systemUnitDir, unit, section, properties, true);
	const user = (unit, section, properties) => dropIn(input.userUnitDir, unit, section, properties);
	return {
		systemUnitDir,
		system: [
			shared("user.slice", "Slice", [USER_CHAIN_LOW]),
			system(`user-${input.uid}.slice`, "Slice", [USER_CHAIN_LOW]),
			system(manager, "Service", [USER_CHAIN_LOW, PROTECTED_OOM_SCORE]),
			...remote.length > 0 ? [shared("system.slice", "Slice", ["MemoryLow=512M"])] : [],
			...remote.map((unit) => shared(unit, "Service", ["MemoryLow=256M", PROTECTED_OOM_SCORE]))
		],
		managerDefaults: {
			unit: "user.conf",
			path: `${input.userUnitDir.replace(/\/user$/, "")}/user.conf.d/${PROTECT_DROP_IN}`,
			contents: "[Manager]\nDefaultOOMScoreAdjust=200\n"
		},
		user: [
			user("app.slice", "Slice", ["MemoryLow=1536M"]),
			user("init.scope", "Scope", ["MemoryLow=256M"]),
			user(BOOT_SERVICE_UNIT_FILE, "Service", [PROTECTED_OOM_SCORE])
		],
		oomUnits: [manager, ...remote]
	};
}
const quoteShell = (value) => `'${value.replaceAll("'", `'\\''`)}'`;
const directoryOf = (file) => file.slice(0, file.lastIndexOf("/"));
function renderPrivilegedScript(plan, mode) {
	const lines = ["set -e"];
	const remove = (dropIns, indent = "") => {
		for (const { path } of dropIns) lines.push(`${indent}rm -f ${quoteShell(path)}`, `${indent}rmdir ${quoteShell(directoryOf(path))} 2>/dev/null || true`);
	};
	if (mode === "apply") for (const { path, contents } of plan.system) lines.push(`mkdir -p ${quoteShell(directoryOf(path))}`, `cat >${quoteShell(path)} <<'T3CODE_PROTECT'`, contents.trimEnd(), "T3CODE_PROTECT");
	else {
		remove(plan.system.filter((dropIn) => dropIn.shared !== true));
		const otherUsers = `${quoteShell(plan.systemUnitDir)}/user@*.service.d/${PROTECT_DROP_IN}`;
		lines.push(`set -- ${otherUsers}`, "if [ ! -e \"$1\" ]; then");
		remove(plan.system.filter((dropIn) => dropIn.shared === true), "  ");
		lines.push("fi");
	}
	lines.push("systemctl daemon-reload", `for unit in ${plan.oomUnits.map(quoteShell).join(" ")}; do`, "  pid=$(systemctl show --property=MainPID --value \"$unit\")", "  if [ \"${pid:-0}\" -gt 0 ]; then", "    systemctl show --property=OOMScoreAdjust --value \"$unit\" >\"/proc/$pid/oom_score_adj\" || true", "  fi", "done", "");
	return lines.join("\n");
}
var ServiceProtectionError = class extends TaggedError()("ServiceProtectionError", {
	step: String$6,
	exitCode: optional$3(Number$2),
	cause: optional$3(Defect())
}) {
	get message() {
		return this.exitCode === void 0 ? `Could not ${this.step}.` : `Could not ${this.step} (exit code ${this.exitCode}).`;
	}
};
function parseUnits(text) {
	return text.split(/\n\s*\n/).map((block) => new Map(block.split("\n").filter((line) => line.includes("=")).map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]))).filter((values) => values.size > 0);
}
/** Loaded remote-access units by canonical name, so an alias such as sshd.service counts once. */
function loadedRemoteAccessUnits(systemctlShow) {
	const units = parseUnits(systemctlShow).filter((values) => values.get("LoadState") === "loaded").map((values) => values.get("Id") ?? "").filter((id) => REMOTE_ACCESS_UNITS.includes(id));
	return [...new Set(units)];
}
const run = fn("ServiceProtection.run")(function* (step, command, args) {
	const result = yield* (yield* ProcessRunner).run({
		command,
		args,
		timeout: "30 seconds"
	}).pipe(mapError((cause) => new ServiceProtectionError({
		step,
		cause
	})));
	if (result.code !== 0) return yield* new ServiceProtectionError({
		step,
		exitCode: Number(result.code)
	});
	return result.stdout;
});
const userSettingsError = (cause) => new ServiceProtectionError({
	step: "change systemd user settings",
	cause
});
/** Undefined when there is no systemd system manager to ask. */
const detectRemoteAccessUnits = run("list remote-access services", "systemctl", [
	"show",
	"--property=Id,LoadState",
	...REMOTE_ACCESS_UNITS
]).pipe(map$3(loadedRemoteAccessUnits), option, map$3(getOrUndefined), withSpan("ServiceProtection.detectRemoteAccessUnits"));
const reloadUserManager = run("reload systemd user units", "systemctl", ["--user", "daemon-reload"]);
const writeDropIns = fn("ServiceProtection.writeDropIns")(function* (dropIns) {
	const fs = yield* FileSystem;
	for (const { path, contents } of dropIns) {
		yield* fs.makeDirectory(directoryOf(path), { recursive: true });
		yield* fs.writeFileString(path, contents);
	}
}, mapError(userSettingsError));
const removeDropIns = fn("ServiceProtection.removeDropIns")(function* (dropIns) {
	const fs = yield* FileSystem;
	for (const { path } of dropIns) {
		yield* fs.remove(path, { force: true });
		yield* fs.remove(directoryOf(path)).pipe(ignore);
	}
}, mapError(userSettingsError));
const runPrivileged = fn("ServiceProtection.runPrivileged")(function* (script) {
	const step = "change the system's service settings";
	const exitCode = yield* (yield* ChildProcessSpawner).exitCode(make$5("sudo", [
		"/bin/sh",
		"-c",
		script
	], {
		detached: false,
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit"
	})).pipe(mapError((cause) => new ServiceProtectionError({
		step,
		cause
	})));
	if (exitCode !== 0) return yield* new ServiceProtectionError({
		step,
		exitCode: Number(exitCode)
	});
});
const applyProtection = fn("ServiceProtection.apply")(function* (plan) {
	const fs = yield* FileSystem;
	const hadManagerDefaults = yield* fs.exists(plan.managerDefaults.path).pipe(orElseSucceed(() => false));
	yield* writeDropIns([plan.managerDefaults]);
	const manager = plan.system.find(({ unit }) => unit.startsWith("user@"));
	const rollBack = gen(function* () {
		if (hadManagerDefaults) return;
		if (manager !== void 0 && (yield* fs.exists(manager.path))) return;
		yield* removeDropIns([plan.managerDefaults]);
	}).pipe(ignore);
	yield* runPrivileged(renderPrivilegedScript(plan, "apply")).pipe(tapError(() => rollBack));
	yield* writeDropIns(plan.user);
	yield* reloadUserManager;
});
const removeProtection = fn("ServiceProtection.remove")(function* (plan) {
	yield* removeDropIns(plan.user);
	yield* reloadUserManager;
	if (plan.system.length > 0) yield* runPrivileged(renderPrivilegedScript(plan, "undo"));
	yield* removeDropIns([plan.managerDefaults]);
	yield* reloadUserManager;
});
/** The plan narrowed to drop-ins that exist, for undo. */
const installedProtection = fn("ServiceProtection.installed")(function* (plan) {
	const fs = yield* FileSystem;
	const exists = (dropIn) => fs.exists(dropIn.path).pipe(orElseSucceed(() => false));
	const system = yield* filter$1(plan.system, exists);
	const user = yield* filter$1(plan.user, exists);
	const managerDefaults = yield* exists(plan.managerDefaults);
	return system.length + user.length === 0 && !managerDefaults ? void 0 : {
		...plan,
		system,
		user
	};
});
/** Reads what the kernel applies to the running service, whoever configured it. */
const readProtection = fn("ServiceProtection.read")(function* (userUnitDir) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const shown = yield* run("read the service's cgroup", "systemctl", [
		"--user",
		"show",
		BOOT_SERVICE_UNIT_FILE,
		"--property=ControlGroup,MainPID"
	]).pipe(option);
	if (isNone(shown)) return void 0;
	const values = parseUnits(shown.value)[0] ?? /* @__PURE__ */ new Map();
	const controlGroup = (values.get("ControlGroup") ?? "").split("/").filter(Boolean);
	if (controlGroup.length === 0) return void 0;
	const read = (file) => fs.readFileString(file).pipe(map$3((text) => text.trim()), orElseSucceed(() => ""));
	let unprotected;
	const grants = (value) => value !== "" && value !== "0";
	for (let depth = 1; depth <= controlGroup.length && unprotected === void 0; depth++) {
		const directory = path.join("/sys/fs/cgroup", ...controlGroup.slice(0, depth));
		const low = yield* read(path.join(directory, "memory.low"));
		const min = yield* read(path.join(directory, "memory.min"));
		if (!grants(low) && !grants(min)) unprotected = controlGroup[depth - 1];
	}
	const pid = Number(values.get("MainPID") ?? 0);
	const score = pid > 0 ? yield* read(`/proc/${pid}/oom_score_adj`) : "";
	return {
		unprotected,
		oomScoreAdj: score === "" ? void 0 : Number(score),
		setByProtect: yield* fs.exists(path.join(userUnitDir, `${BOOT_SERVICE_UNIT_FILE}.d`, PROTECT_DROP_IN)).pipe(orElseSucceed(() => false))
	};
});
// src/cli/service.ts
const layer = (config) => layer$15({
	baseDir: config.baseDir,
	logsDir: config.logsDir,
	cliVersion: version
}).pipe(provide(layer$1), provide(layer$2));
const SERVICE_ENV_KEY = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/u;
/**
* Sets or removes (`undefined`) entries in `service.env` text and keeps every
* other line, including comments, as the user wrote it.
*/
const upsertServiceEnv = (contents, entries) => {
	const written = /* @__PURE__ */ new Set();
	const lines = contents.split("\n").flatMap((line) => {
		const key = SERVICE_ENV_KEY.exec(line)?.[1];
		if (key === void 0 || !Object.hasOwn(entries, key)) return [line];
		const value = entries[key];
		if (value === void 0 || written.has(key)) return [];
		written.add(key);
		return [`${key}=${value}`];
	});
	while (lines.at(-1) === "") lines.pop();
	for (const [key, value] of Object.entries(entries)) if (value !== void 0 && !written.has(key)) lines.push(`${key}=${value}`);
	return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
};
/** `service.env` under `baseDir`, parsed as the service launcher parses it. */
const readServiceEnv = fn("cli.service.read_env")(function* (baseDir) {
	const fs = yield* FileSystem;
	const path = (yield* Path).join(baseDir, SERVICE_ENV_FILE);
	const contents = (yield* fs.exists(path)) ? yield* fs.readFileString(path) : "";
	const entries = Object.entries(NodeUtil.parseEnv(contents)).flatMap(([key, value]) => value === void 0 ? [] : [[key, value]]);
	return {
		path,
		contents,
		entries: Object.fromEntries(entries)
	};
});
const writeServiceEnv = fn("cli.service.write_env")(function* (baseDir, entries) {
	const fs = yield* FileSystem;
	const current = yield* readServiceEnv(baseDir);
	const next = upsertServiceEnv(current.contents, entries);
	if (next === current.contents) return;
	yield* fs.makeDirectory(baseDir, { recursive: true });
	yield* fs.writeFileString(current.path, next);
});
const reconcileService = fn("cli.service.reconcile")(function* (options) {
	const { baseDir } = yield* ServerConfig;
	const service = yield* BootService;
	const status = yield* service.status;
	if (status.otherBaseDir !== void 0) return yield* new BootServiceOtherBaseDirError({
		installedBaseDir: status.otherBaseDir,
		baseDir
	});
	if (status.installed && status.current) return {
		changed: false,
		status
	};
	if (status.supported && !status.installed) {
		const { entries } = yield* readServiceEnv(baseDir);
		if (entries.T3CODE_LAN === void 0 && entries.T3CODE_HOST === void 0) yield* writeServiceEnv(baseDir, { T3CODE_LAN: "false" });
	}
	if (status.installedVersion !== void 0 && options?.allowDowngrade !== true && compareExactServiceVersions(version, status.installedVersion) < 0) return yield* new BootServiceDowngradeRefusedError({
		installedVersion: status.installedVersion,
		targetVersion: version
	});
	const plan = yield* service.install(options);
	return {
		changed: true,
		previouslyInstalled: status.installed,
		plan
	};
});
function formatServiceChange(result) {
	if (result.plan.handedOff === true) return `Service update to t3@${version} queued. This session will disconnect.\nLog: ${result.plan.logPath}`;
	return `Service ${result.previouslyInstalled ? "updated" : "installed"} · t3@${version}\nLog: ${result.plan.logPath}`;
}
function formatProtection(protection) {
	if (protection === void 0) return [];
	return [protection.unprotected === void 0 ? `  Memory protection: on${protection.setByProtect ? " (t3 service protect)" : ""}` : `  Memory protection: off, ${protection.unprotected} grants none. Run \`t3 service protect\`.`, ...protection.oomScoreAdj === void 0 ? [] : [`  OOM score: ${protection.oomScoreAdj}`]];
}
function formatServiceStatus(status, cliVersion, protection) {
	if (!status.supported) return "T3 Code service\n  Status: unavailable on this machine\n  Supported on: Linux with systemd, macOS with launchd";
	if (!status.installed) return "T3 Code service\n  Status: not installed\n  Next: Run `t3 service install`.";
	if (status.otherBaseDir !== void 0) return [
		"T3 Code service",
		"  Status: installed for another T3 home",
		`  Base dir: ${status.otherBaseDir}`,
		`  Next: Pass \`${formatBootServiceBaseDirOption(status.otherBaseDir)}\` to manage it.`
	].join("\n");
	const installedVersion = status.installedVersion ?? cliVersion;
	const problems = (status.problems ?? []).map((problem) => `  [${problem}] ${formatBootServiceProblem(problem)}`);
	if (!status.current && status.installedVersion !== void 0 && compareExactServiceVersions(status.installedVersion, cliVersion) > 0) return [
		"T3 Code service",
		`  Status: installed · t3@${installedVersion} (newer than this t3@${cliVersion} CLI)`,
		`  Unit: ${status.unitPath}`,
		`  Logs: ${status.logPath}`,
		...formatProtection(protection),
		...problems,
		`  Next: Run \`t3 update ${installedVersion}\` to match it, or pass \`--allow-downgrade\` to \`t3 service install\` explicitly.`
	].join("\n");
	return [
		"T3 Code service",
		`  Status: ${status.current ? `installed · t3@${installedVersion}` : "needs an update or repair"}`,
		`  Unit: ${status.unitPath}`,
		`  Logs: ${status.logPath}`,
		...formatProtection(protection),
		...problems,
		...status.current ? [] : ["  Next: Run `t3 service install` to repair it."]
	].join("\n");
}
const runServiceCommand = fn("cli.service.run")(function* (flags, run) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	return yield* run.pipe(provide$1(merge(layer(config), layer$3(config))));
});
const serviceReconcileFlags = {
	...projectLocationFlags,
	allowDowngrade: Boolean$1("allow-downgrade").pipe(withDescription$1("Allow replacing a newer installed service with this older CLI version."), withDefault(false))
};
const serviceInstallCommand = make$1("install", serviceReconcileFlags).pipe(withDescription("Install T3 Code as a background service for this user. `t3 up` also chooses how your other devices reach it."), withHandler((flags) => runServiceCommand(flags, gen(function* () {
	const result = yield* reconcileService({ allowDowngrade: flags.allowDowngrade });
	if (!result.changed) {
		yield* log(`T3 Code service is already installed with t3@${version} (${yield* resolveEntryPath}).`);
		return;
	}
	yield* log(formatServiceChange(result));
	if (!result.previouslyInstalled) yield* log("Run `t3 up` to choose how your other devices reach it.");
}))));
const serviceUpdateCommand = make$1("update", serviceReconcileFlags).pipe(withDescription("Deprecated. Run `t3 update` to move to a newer release."), unlisted, withHandler((flags) => runServiceCommand(flags, gen(function* () {
	yield* log("`t3 service update` is deprecated: run `t3 update` to move to a newer release, or `t3 service install` to repair the service. Repairing now.");
	const result = yield* reconcileService({ allowDowngrade: flags.allowDowngrade });
	if (!result.changed) {
		yield* log(`T3 Code service is already using t3@${version} (${yield* resolveEntryPath}).`);
		return;
	}
	yield* log(formatServiceChange(result));
}))));
const serviceRestartCommand = make$1("restart", projectLocationFlags).pipe(withDescription("Restart the background service. Picks up a version installed by `t3 update` that was not restarted at the time."), withHandler((flags) => runServiceCommand(flags, gen(function* () {
	const service = yield* BootService;
	const status = yield* service.status;
	const outcome = yield* service.restart;
	const onVersion = status.installedVersion === void 0 ? "" : ` on t3@${status.installedVersion}`;
	yield* log(outcome === "restarted" ? `Restarted the T3 Code service${onVersion}.` : outcome === "queued" ? `Queued a restart of the T3 Code service${onVersion}. This session runs inside the service and disconnects when it goes down.\nLogs: ${status.logPath}` : status.otherBaseDir !== void 0 ? `The T3 Code service serves ${status.otherBaseDir}, so it was not restarted. Pass \`${formatBootServiceBaseDirOption(status.otherBaseDir)}\` to restart it.` : "T3 Code service is not installed.");
}))));
const serviceUninstallCommand = make$1("uninstall", projectLocationFlags).pipe(withDescription("Stop and remove the T3 Code background service."), withHandler((flags) => runServiceCommand(flags, gen(function* () {
	const service = yield* BootService;
	const path = yield* Path;
	const { baseDir } = yield* ServerConfig;
	const installedBaseDir = yield* service.status.pipe(map$3((status) => status.installedBaseDir), orElseSucceed(() => void 0));
	if (installedBaseDir !== void 0 && path.resolve(installedBaseDir) !== path.resolve(baseDir)) {
		yield* log(`The T3 Code service serves ${installedBaseDir}, so it was not removed. Pass \`${formatBootServiceBaseDirOption(installedBaseDir)}\` to remove it.`);
		return;
	}
	const removed = yield* service.uninstall;
	yield* log(removed ? "Removed the T3 Code service." : "T3 Code service is not installed.");
}))));
const serviceStatusCommand = make$1("status", projectLocationFlags).pipe(withDescription("Show whether the T3 Code background service is installed."), withHandler((flags) => runServiceCommand(flags, gen(function* () {
	const service = yield* BootService;
	const path = yield* Path;
	const status = yield* service.status;
	const protection = status.installed && (yield* Platform) === "linux" ? yield* readProtection(path.dirname(status.unitPath)).pipe(provide$1(layer$1)) : void 0;
	yield* log(formatServiceStatus(status, version, protection));
}))));
const formatDropIns = (dropIns) => dropIns.map(({ path, contents }) => `  ${path}: ${contents.trimEnd().split("\n").slice(1).join(" ")}`);
const confirm = (yes, message) => yes ? succeed$1(true) : run$3(Confirm({
	message,
	initial: false
}));
const serviceProtectCommand = make$1("protect", {
	...projectLocationFlags,
	undo: Boolean$1("undo").pipe(withDescription$1("Remove the protection this command set up."), withDefault(false)),
	yes: Boolean$1("yes").pipe(withDescription$1("Answer yes to every question, including SSH and Tailscale."), withDefault(false))
}).pipe(withDescription("Protect the T3 Code server from agents under memory pressure (Linux with systemd). Asks for sudo."), withHandler((flags) => gen(function* () {
	const unsupported = "Service protection needs Linux with systemd.";
	if ((yield* Platform) !== "linux") return yield* log(unsupported);
	if ((yield* UserId) === 0) return yield* log("Run `t3 service protect` as the user that runs T3 Code, without sudo. It asks for sudo when it needs root.");
	return yield* runServiceCommand(flags, gen(function* () {
		const uid = yield* UserId;
		const remote = yield* detectRemoteAccessUnits;
		const { unitPath } = yield* (yield* BootService).status;
		if (uid === void 0 || remote === void 0 || unitPath === "") return yield* log(unsupported);
		const userUnitDir = (yield* Path).dirname(unitPath);
		if (flags.undo) {
			const installed = yield* installedProtection(protectionPlan({
				uid,
				userUnitDir,
				remoteAccessUnits: REMOTE_ACCESS_UNITS
			}));
			if (installed === void 0) return yield* log("T3 Code service protection is not set up.");
			yield* log(["Removes:", ...[
				...installed.system,
				...installed.user,
				installed.managerDefaults
			].map(({ path, shared }) => `  ${path}${shared === true ? " (kept while another user is protected)" : ""}`)].join("\n"));
			if (!(yield* confirm(flags.yes, "Remove T3 Code service protection?"))) return;
			yield* removeProtection(installed);
			return yield* log("Removed T3 Code service protection. The server's OOM score returns to normal after `t3 service restart`.");
		}
		yield* log([
			"Keeps T3 Code running when agents fill this machine's memory:",
			"  - reserves memory for the T3 Code server, so the kernel takes memory from agents first",
			"  - makes the out-of-memory killer pick agents before the server",
			"It adds systemd drop-in files and changes nothing else. Undo with `t3 service protect --undo`."
		].join("\n"));
		const names = remote.map((unit) => unit.replace(/\.service$/, "")).join(" and ");
		const plan = protectionPlan({
			uid,
			userUnitDir,
			remoteAccessUnits: remote.length > 0 && (yield* confirm(flags.yes, `Also protect ${names} so you can still reach this machine under memory pressure?`)) ? remote : []
		});
		yield* log([
			"Drop-ins it writes, as root through sudo:",
			...formatDropIns(plan.system),
			"As you:",
			...formatDropIns([plan.managerDefaults, ...plan.user])
		].join("\n"));
		if (!(yield* confirm(flags.yes, "Apply these settings?"))) return;
		yield* applyProtection(plan);
		yield* log("Protected T3 Code. Memory protection applies now; the server takes its OOM score after `t3 service restart`. Undo with `t3 service protect --undo`.");
	}).pipe(provide$1(layer$1)));
})));
const serviceCommand = make$1("service").pipe(withDescription("Manage the T3 Code background service."), withSubcommands([
	serviceInstallCommand,
	serviceRestartCommand,
	serviceUninstallCommand,
	serviceStatusCommand,
	serviceProtectCommand,
	serviceUpdateCommand
]));
// src/cli/doctor.ts
const formatBytes = (bytes) => bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GiB` : bytes >= 1024 ** 2 ? `${(bytes / 1024 ** 2).toFixed(1)} MiB` : `${Math.ceil(bytes / 1024)} KiB`;
const runDoctor = fn("runDoctor")(function* (databasePath, options) {
	const maintenance = yield* DatabaseMaintenance;
	const status = yield* maintenance.inspect(databasePath);
	yield* log(`Database: ${formatBytes(status.databaseBytes)}, ${formatBytes(status.reclaimableBytes)} reclaimable.`);
	if (status.legacyDatabaseBytes !== null) yield* log(`Database from before 0.1.0: ${formatBytes(status.legacyDatabaseBytes)}, kept for rolling back.`);
	const repairs = [...status.incrementalVacuumEnabled && status.reclaimableBytes === 0 ? [] : [{
		id: "database",
		title: "Reclaim database space",
		description: `${status.incrementalVacuumEnabled ? "Returns unused space to disk." : "Returns unused space to disk and turns on automatic shrinking."}\n  Pauses the background service, if installed, while it runs and may need temporary disk space.`,
		recommended: !status.incrementalVacuumEnabled || status.reclaimableBytes >= DATABASE_COMPACTION_RECOMMENDED_BYTES
	}], ...status.legacyDatabaseBytes === null ? [] : [{
		id: "legacy",
		title: "Delete the database from before 0.1.0",
		description: `Frees ${formatBytes(status.legacyDatabaseBytes)}. Your threads and settings are already in the current database.\n  Warning: after this, a T3 Code version before 0.1.0 starts with no threads or settings, so you can no longer roll back.`,
		recommended: false
	}]];
	if (repairs.length === 0) {
		yield* log("Nothing to repair.");
		return;
	}
	for (const repair of repairs) yield* log(`\n${repair.title}${repair.recommended ? " (recommended)" : ""}\n  ${repair.description}`);
	if (options.dryRun) {
		yield* log("\nDry run: nothing changed.");
		return;
	}
	const interactive = options.interactive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);
	if (!options.fix && !interactive) {
		yield* log("\nRun in a terminal to choose repairs, or pass --fix for the recommended ones.");
		return;
	}
	const selected = options.fix ? repairs.filter((repair) => repair.recommended).map((repair) => repair.id) : yield* run$3(MultiSelect({
		message: "Choose repairs to run",
		choices: repairs.map((repair) => ({
			title: repair.title + (repair.recommended ? " (recommended)" : ""),
			value: repair.id,
			selected: repair.recommended
		}))
	})).pipe(catchTags({ QuitError: () => succeed$1([]) }));
	if (selected.length === 0) {
		yield* log(options.fix ? "No recommended repairs; nothing changed." : "No repairs selected; nothing changed.");
		return;
	}
	if (selected.includes("database")) {
		const service = yield* BootService;
		yield* log("\nReclaiming database space. This can take several minutes...");
		yield* service.withStopped(maintenance.compact(databasePath).pipe(tap((result) => log(`Done: ${formatBytes(result.beforeBytes)} -> ${formatBytes(result.afterBytes)}, ${result.deletedEventCount} superseded events removed.`))));
	}
	if (selected.includes("legacy")) {
		yield* maintenance.removeLegacyDatabase(databasePath);
		yield* log("\nDeleted the database from before 0.1.0.");
	}
});
const doctorCommand = make$1("doctor", {
	...projectLocationFlags,
	fix: Boolean$1("fix").pipe(withDescription$1("Apply the recommended repairs without prompting."), withDefault(false)),
	dryRun: Boolean$1("dry-run").pipe(withDescription$1("Show the repairs without changing anything, even with --fix."), withDefault(false))
}).pipe(withDescription("Inspect this T3 Code data directory and repair it. Pauses and restarts the background service as needed."), withHandler((flags) => gen(function* () {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	yield* runDoctor(config.dbPath, {
		fix: flags.fix,
		dryRun: flags.dryRun
	}).pipe(provide$1(merge(layer$16, layer(config))));
})));
// src/policy/policyTemplates.ts
const RUNTIME_MODES = [
	{
		value: "approval-required",
		label: "Supervised"
	},
	{
		value: "auto-accept-edits",
		label: "Auto-accept edits"
	},
	{
		value: "auto",
		label: "Auto"
	},
	{
		value: "full-access",
		label: "Full access"
	}
];
const policies = () => [
	{
		id: "Organization",
		title: "Organization",
		help: "Required whenever any other T3 Code policy is set: T3 Code will not start with policies that do not name an organization.\n\nUsers see the name as \"Managed by <organization>\" beside every control the policy locks. The support URL is optional.",
		elements: [{
			kind: "text",
			name: "Organization",
			label: "Organization name"
		}, {
			kind: "text",
			name: "SupportUrl",
			label: "Support URL (optional)"
		}]
	},
	{
		id: "MaxRuntimeMode",
		title: "Broadest permission mode",
		help: "The broadest permission mode any thread may use, including threads agents and scheduled tasks start.\n\nA thread already above it cannot run another turn until someone lowers its mode. Under this limit, each provider's launch settings (binary path, launch arguments, environment variables) come only from the policy.\n\nDisabled or Not Configured: no restriction.",
		elements: [{
			kind: "enum",
			name: "MaxRuntimeMode",
			label: "Broadest permission mode",
			items: RUNTIME_MODES,
			defaultItem: 1
		}]
	},
	{
		id: "Clients",
		title: "Allowed clients",
		help: "What may connect to T3 Code on this machine.\n\nWithout Remote, T3 Code only listens on this machine, does not create pairing links, signs out devices that paired earlier, and turns T3 Connect off. Check at least one client.\n\nDisabled or Not Configured: no restriction.",
		elements: [
			{
				kind: "checkbox",
				list: "Clients",
				name: "desktop",
				label: "Desktop app on this machine",
				defaultChecked: true
			},
			{
				kind: "checkbox",
				list: "Clients",
				name: "local-browser",
				label: "A browser on this machine",
				defaultChecked: true
			},
			{
				kind: "checkbox",
				list: "Clients",
				name: "remote",
				label: "Remote: phones, other computers, app.t3.codes",
				defaultChecked: false
			}
		]
	},
	{
		id: "Connect",
		title: "Allow T3 Connect",
		help: "Disabled turns T3 Connect off and unlinks this machine. Other remote access still follows Allowed clients.\n\nEnabled or Not Configured leaves T3 Connect available.",
		toggle: "Connect"
	},
	{
		id: "WebhookTasks",
		title: "Allow webhook tasks",
		help: "Disabled stops scheduled tasks from using webhook triggers. Existing webhook tasks are kept but do not run.",
		toggle: "WebhookTasks"
	},
	{
		id: "BrowserCookieImport",
		title: "Allow importing browser cookies",
		help: "Disabled stops users from importing cookies from another browser into T3 Code's browser.",
		toggle: "BrowserCookieImport"
	},
	{
		id: "Telemetry",
		title: "Allow usage data",
		help: "Disabled stops T3 Code from sending product usage data and relay connection traces. Enabled cannot turn them on for a user who turned them off.",
		toggle: "Telemetry"
	},
	{
		id: "AllowedDrivers",
		title: "Allowed providers",
		help: "Only the checked providers may run. Threads on other providers stay, marked unavailable.\n\nDisabled or Not Configured: no restriction.",
		elements: knownDriverLabels().map(({ driver, label }) => ({
			kind: "checkbox",
			list: "AllowedDrivers",
			name: driver,
			label,
			defaultChecked: driver === "codex" || driver === "claudeAgent"
		}))
	},
	{
		id: "Updates",
		title: "Updates",
		help: "Off stops T3 Code from checking for updates, for machines that receive T3 Code through device management.\n\nA feed URL makes the desktop app update from your own mirror of the release feed instead of GitHub; it must be https. Unchecking nightly makes the nightly channel unavailable.\n\nDisabled or Not Configured: no restriction.",
		elements: [
			{
				kind: "enum",
				name: "UpdatesMode",
				label: "Updates",
				items: [{
					value: "auto",
					label: "Automatic"
				}, {
					value: "off",
					label: "Off"
				}],
				defaultItem: 0
			},
			{
				kind: "text",
				name: "UpdatesFeedUrl",
				label: "Feed URL (optional)"
			},
			{
				kind: "checkbox",
				name: "AllowNightly",
				label: "Allow the nightly channel",
				defaultChecked: true
			}
		]
	},
	{
		id: "Settings",
		title: "Managed settings (JSON)",
		help: "Defaults and locks for server settings, as the \"settings\" object of a T3 Code policy. Each key is a setting path; each value is {\"value\": ..., \"locked\": true|false}.\n\nExample: {\"enableAgentBrowserAccess\": {\"value\": false, \"locked\": true}}\n\nRun \"t3 policy check\" on a policy file with the same object to validate it first.",
		elements: [{
			kind: "text",
			name: "Settings",
			label: "Settings JSON",
			json: true
		}]
	},
	{
		id: "ProviderInstances",
		title: "Provider settings (JSON)",
		help: "Fields set on every instance of a provider, as the \"limits.providers.instances\" object of a T3 Code policy: environment variables, binaryPath, launchArgs.\n\nExample: {\"claudeAgent\": {\"locked\": true, \"environment\": [{\"name\": \"CLAUDE_CODE_USE_BEDROCK\", \"value\": \"1\"}]}}\n\nEvery user on the machine can read this value, so do not put credentials in it.",
		elements: [{
			kind: "text",
			name: "ProviderInstances",
			label: "Provider settings JSON",
			json: true
		}]
	}
];
const escapeXml = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
const ADMX_KEY = WINDOWS_POLICY_KEY.replace(/^HKLM\\/, "");
const elementId = (element) => element.kind === "checkbox" && element.list !== void 0 ? `${element.list}_${element.name}` : element.name;
const admxElement = (element) => {
	const id = elementId(element);
	switch (element.kind) {
		case "text": return `<text id="${id}" valueName="${element.name}"${element.name === "Organization" ? " required=\"true\"" : ""}${element.json ? " maxLength=\"32767\"" : ""} />`;
		case "enum": return [
			`<enum id="${id}" valueName="${element.name}" required="true">`,
			...element.items.map((item) => `  <item displayName="$(string.${id}_${item.value})"><value><string>${item.value}</string></value></item>`),
			"</enum>"
		].join("\n          ");
		case "checkbox": return `<boolean id="${id}"${element.list === void 0 ? "" : ` key="${ADMX_KEY}\\${element.list}"`} valueName="${escapeXml(element.name)}"><trueValue><decimal value="1" /></trueValue><falseValue><decimal value="0" /></falseValue></boolean>`;
	}
};
/** The language-neutral Group Policy template. */
function windowsAdmx() {
	return `<?xml version="1.0" encoding="utf-8"?>
<policyDefinitions xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" revision="1.0" schemaVersion="1.0" xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions">
  <policyNamespaces>
    <target prefix="t3code" namespace="T3Tools.Policies.T3Code" />
  </policyNamespaces>
  <resources minRequiredRevision="1.0" />
  <supportedOn>
    <definitions>
      <definition name="SUPPORTED_T3Code" displayName="$(string.SUPPORTED_T3Code)" />
    </definitions>
  </supportedOn>
  <categories>
    <category name="T3Code" displayName="$(string.T3Code)" />
  </categories>
  <policies>
${policies().map((policy) => {
		const head = `<policy name="${policy.id}" class="Machine" displayName="$(string.${policy.id})" explainText="$(string.${policy.id}_Help)" key="${ADMX_KEY}"`;
		const common = `<parentCategory ref="T3Code" />\n      <supportedOn ref="SUPPORTED_T3Code" />`;
		if (policy.toggle !== void 0) return `    ${head} valueName="${policy.toggle}">
      ${common}
      <enabledValue><decimal value="1" /></enabledValue>
      <disabledValue><decimal value="0" /></disabledValue>
    </policy>`;
		const grouped = Object.hasOwn(WINDOWS_POLICY_GROUPS, policy.id);
		return `    ${head}${grouped ? ` valueName="${policy.id}"` : ""} presentation="$(presentation.${policy.id})">
      ${common}${grouped ? "\n      <enabledValue><decimal value=\"1\" /></enabledValue>\n      <disabledValue><decimal value=\"0\" /></disabledValue>" : ""}
      <elements>
        ${(policy.elements ?? []).map(admxElement).join("\n        ")}
      </elements>
    </policy>`;
	}).join("\n")}
  </policies>
</policyDefinitions>
`;
}
const presentationElement = (element) => {
	const id = elementId(element);
	switch (element.kind) {
		case "text": return `<textBox refId="${id}"><label>${escapeXml(element.label)}</label></textBox>`;
		case "enum": return `<dropdownList refId="${id}" noSort="true" defaultItem="${element.defaultItem}">${escapeXml(element.label)}</dropdownList>`;
		case "checkbox": return `<checkBox refId="${id}" defaultChecked="${element.defaultChecked}">${escapeXml(element.label)}</checkBox>`;
	}
};
/** The en-US strings and dialog layouts for `windowsAdmx`. */
function windowsAdml() {
	const strings = [["T3Code", "T3 Code"], ["SUPPORTED_T3Code", "T3 Code with managed policy support"]];
	const presentations = [];
	for (const policy of policies()) {
		strings.push([policy.id, policy.title], [`${policy.id}_Help`, policy.help]);
		for (const element of policy.elements ?? []) if (element.kind === "enum") for (const item of element.items) strings.push([`${elementId(element)}_${item.value}`, item.label]);
		if (policy.elements !== void 0) presentations.push(`      <presentation id="${policy.id}">\n        ${policy.elements.map(presentationElement).join("\n        ")}\n      </presentation>`);
	}
	return `<?xml version="1.0" encoding="utf-8"?>
<policyDefinitionResources xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" revision="1.0" schemaVersion="1.0" xmlns="http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions">
  <displayName>T3 Code</displayName>
  <description>Policies for T3 Code</description>
  <resources>
    <stringTable>
${strings.map(([id, text]) => `      <string id="${id}">${escapeXml(text)}</string>`).join("\n")}
    </stringTable>
    <presentationTable>
${presentations.join("\n")}
    </presentationTable>
  </resources>
</policyDefinitionResources>
`;
}
const plistValue = (value, indent) => {
	const inner = `${indent}  `;
	if (typeof value === "string") return `${indent}<string>${escapeXml(value)}</string>`;
	if (typeof value === "boolean") return `${indent}<${value} />`;
	if (typeof value === "number") return Number.isInteger(value) ? `${indent}<integer>${value}</integer>` : `${indent}<real>${value}</real>`;
	if (Array.isArray(value)) return `${indent}<array>\n${value.map((item) => plistValue(item, inner)).join("\n")}\n${indent}</array>`;
	return `${indent}<dict>\n${Object.entries(value).map(([key, item]) => `${inner}<key>${escapeXml(key)}</key>\n${plistValue(item, inner)}`).join("\n")}\n${indent}</dict>`;
};
/** Where `value` holds a `null`, as path segments, or undefined when it holds none. */
const nullPath = (value, path) => {
	if (value === null) return path;
	if (typeof value !== "object") return void 0;
	for (const [key, item] of Object.entries(value)) {
		const found = nullPath(item, [...path, key]);
		if (found !== void 0) return found;
	}
};
/** A device configuration profile that installs `document` for `com.t3tools.t3code`. */
function macosProfile(document, uuids) {
	const empty = nullPath(document, []);
	if (empty !== void 0) return {
		_tag: "Invalid",
		reason: `${(empty[0] === "settings" && empty.at(-1) === "value" ? empty.slice(0, -1) : empty).join(".")} is null, which a configuration profile cannot hold; deploy this policy as a file.`
	};
	const profile = {
		PayloadContent: [{
			PayloadDisplayName: "T3 Code policy",
			PayloadIdentifier: `com.t3tools.t3code.policy.${uuids.payload}`,
			PayloadType: "com.t3tools.t3code",
			PayloadUUID: uuids.payload,
			PayloadVersion: 1,
			...document
		}],
		PayloadDescription: "Configures T3 Code for every user on this Mac.",
		PayloadDisplayName: `T3 Code policy for ${document.organization}`,
		PayloadIdentifier: `com.t3tools.t3code.policy`,
		PayloadOrganization: document.organization,
		PayloadScope: "System",
		PayloadType: "Configuration",
		PayloadUUID: uuids.profile,
		PayloadVersion: 1
	};
	return {
		_tag: "Valid",
		profile: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${plistValue(profile, "")}
</plist>
`
	};
}
// src/cli/policy.ts
const describePolicy = (policy, loaded) => {
	const { document } = policy;
	if (document === void 0 || loaded === null) return "No managed policy on this machine. Every setting belongs to the user.\n";
	const settings = Object.entries(document.settings ?? {});
	const lines = [
		`Managed by ${document.organization} (${policy.path}, fingerprint ${loaded.fingerprint}).`,
		...document.supportUrl === void 0 ? [] : [`Support: ${document.supportUrl}`],
		"",
		settings.length === 0 ? "No managed settings." : "Settings:",
		...settings.map(([path, setting]) => `  ${path} = ${JSON.stringify(setting.value)} (${setting.locked ? "locked" : "default"})`)
	];
	if (document.limits !== void 0) lines.push("", "Limits:", JSON.stringify(document.limits, null, 2));
	return `${lines.join("\n")}\n`;
};
/** Whether the server running from this T3 home loaded the installed policy, which waits for a restart. */
const describeRunningServer = fn("cli.policy.describeRunningServer")(function* (statePath, installed) {
	const state = yield* readPersistedServerRuntimeState(statePath);
	if (isNone(state) || !isProcessAlive(state.value.pid)) return "No T3 Code server is running from this T3 home. The installed policy applies when one starts.";
	const { pid, startedAt, managedPolicy: loaded } = state.value;
	const server = `The running server (pid ${pid}, started ${startedAt})`;
	if (loaded === void 0) return `${server} does not report which policy it loaded. Restart it to apply the installed policy.`;
	if ((loaded?.fingerprint ?? null) === (installed?.fingerprint ?? null)) return loaded === null ? `${server} runs without a policy, as installed.` : `${server} loaded this policy.`;
	return `${server} loaded ${loaded === null ? "no policy" : `${loaded.organization}'s policy from ${loaded.source} (fingerprint ${loaded.fingerprint})`}. Restart T3 Code to apply the installed policy.`;
});
const showCommand = make$1("show", projectLocationFlags).pipe(withDescription("Show the policy installed on this machine, and whether the running server loaded it."), withHandler(fn("cli.policy.show")(function* (flags) {
	const policy = yield* ManagedPolicy.pipe(provide$1(layer$4.pipe(provide(succeed$3(MinimumLogLevel, "Warn")))));
	const installed = yield* loadedPolicy(policy);
	yield* log(describePolicy(policy, installed));
	const config = yield* resolveCliAuthConfig(flags, yield* LogLevel);
	yield* log(yield* describeRunningServer(config.serverRuntimeStatePath, installed));
})));
const checkCommand = make$1("check", { file: String$2("file").pipe(withDescription$2("Policy file to validate.")) }).pipe(withDescription("Validate a policy file before deploying it."), withHandler(fn("cli.policy.check")(function* ({ file }) {
	if (!(yield* (yield* FileSystem).exists(file))) return yield* new UserError({
		cause: file,
		userMessage: `No policy file at ${file}.`
	});
	const policy = yield* load$1(file);
	yield* log(describePolicy(policy, yield* loadedPolicy(policy)));
})));
const SAMPLE_POLICY = {
	schemaVersion: 1,
	organization: "Example Corp",
	limits: {
		maxRuntimeMode: "auto-accept-edits",
		clients: ["desktop"],
		telemetry: false
	}
};
const templatesCommand = make$1("templates", {
	directory: String$2("directory").pipe(withDescription$2("Directory to write the templates to.")),
	policy: String$1("policy").pipe(withDescription$1("Policy file to put in the macOS profile. Default: a small sample."), optional)
}).pipe(withDescription("Write the Windows Group Policy template and a macOS configuration profile."), withHandler(fn("cli.policy.templates")(function* ({ directory, policy }) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	let document = SAMPLE_POLICY;
	if (isSome(policy)) {
		if (!(yield* fs.exists(policy.value))) return yield* new UserError({
			cause: policy.value,
			userMessage: `No policy file at ${policy.value}.`
		});
		const loaded = (yield* load$1(policy.value)).document;
		if (loaded !== void 0) document = loaded;
	}
	const random = yield* SecureRandom;
	const profile = macosProfile(document, {
		profile: yield* random.uuidV4().pipe(orDie),
		payload: yield* random.uuidV4().pipe(orDie)
	});
	if (profile._tag === "Invalid") return yield* new UserError({
		cause: document,
		userMessage: profile.reason
	});
	const files = [
		[path.join(directory, "windows", "t3code.admx"), windowsAdmx()],
		[path.join(directory, "windows", "en-US", "t3code.adml"), windowsAdml()],
		[path.join(directory, "macos", "t3code.mobileconfig"), profile.profile]
	];
	for (const [file, contents] of files) {
		yield* fs.makeDirectory(path.dirname(file), { recursive: true });
		yield* fs.writeFileString(file, contents);
		yield* log(file);
	}
})));
const policyCommand = make$1("policy").pipe(withDescription("Inspect the administrator's managed policy."), withSubcommands([
	showCommand,
	checkCommand,
	templatesCommand
]));
// ../../node_modules/.pnpm/@effect+platform-node@4.1.2_bufferutil@4.1.0_effect@4.1.2_redis@6.2.1_utf-8-validate@6.0.6/node_modules/@effect/platform-node/dist/NodeRuntime.js
/**
* Node.js process runner for Effect programs.
*
* This module exports `runMain`, which runs one Effect as the main process
* fiber in Node.js. It reuses the shared Node runtime runner, including its
* error reporting, `SIGINT` / `SIGTERM` interruption, and optional teardown
* behavior.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Helps you run a main effect with built-in error handling, logging, and signal management.
*
* **When to use**
*
* Use to run a Node.js application's main Effect with structured error
* handling, log management, interrupt support, or advanced teardown
* capabilities.
*
* **Details**
*
* This function launches an Effect as the main entry point, setting exit codes
* based on success or failure, handling interrupts (e.g., Ctrl+C), and optionally
* logging errors. By default, it logs errors and uses a "pretty" format, but both
* behaviors can be turned off. You can also provide custom teardown logic to
* finalize resources or produce different exit codes.
*
* The optional configuration object can include:
* - `disableErrorReporting`: Turn off automatic error logging.
* - `teardown`: Provide custom finalization logic.
*
* @stability unstable
* @category running
* @since 4.0.0
*/
const runMain = /* @__PURE__ */ makeRunMain(({ fiber, teardown }) => {
	let receivedSignal = false;
	fiber.addObserver((exit) => {
		process.removeListener("SIGINT", onSigint);
		process.removeListener("SIGTERM", onSigint);
		teardown(exit, (code) => {
			if (receivedSignal || code !== 0) process.exit(code);
		});
	});
	function onSigint() {
		receivedSignal = true;
		fiber.interruptUnsafe(fiber.id);
	}
	process.on("SIGINT", onSigint);
	process.on("SIGTERM", onSigint);
});
// src/cli/acpMcpBridge.ts
/** The credential stays in the environment, never on the command line. */
const acpMcpBridgeCommand = make$1("acp-mcp-bridge").pipe(withDescription("Bridge T3 Code's MCP endpoint to stdio for ACP agents."), unlisted, withHandler(() => promise(() => runAcpMcpCliFastPath("acp-mcp-bridge", []))));
const acpMcpCallCommand = make$1("acp-mcp-call", {
	tool: String$2("tool"),
	argumentsJson: String$2("arguments-json")
}).pipe(withDescription("Call one T3 Code MCP tool from an ACP agent terminal."), unlisted, withHandler(({ tool, argumentsJson }) => promise(() => runAcpMcpCliFastPath("acp-mcp-call", [tool, argumentsJson]))));
// src/cliAuthFormat.ts
const newline = "\n";
function serializeOptionalFields(values) {
	return values.filter((value) => typeof value === "string" && value.length > 0);
}
function formatClientMetadata(metadata) {
	const details = serializeOptionalFields([
		metadata.label,
		metadata.deviceType !== "unknown" ? metadata.deviceType : void 0,
		metadata.os,
		metadata.browser,
		metadata.ipAddress
	]);
	return details.length > 0 ? details.join(" | ") : "unlabeled client";
}
function toIsoString(value) {
	return formatIso(toUtc(value));
}
function formatIssuedPairingCredential(credential, options) {
	const pairUrl = options?.baseUrl != null && options.baseUrl.length > 0 ? (() => {
		const url = new URL("/pair", options.baseUrl);
		url.searchParams.delete("token");
		url.hash = new URLSearchParams([["token", credential.credential]]).toString();
		return url.toString();
	})() : void 0;
	if (options?.json) return `${JSON.stringify({
		id: credential.id,
		credential: credential.credential,
		...credential.label ? { label: credential.label } : {},
		scopes: credential.scopes,
		expiresAt: toIsoString(credential.expiresAt),
		...pairUrl ? { pairUrl } : {}
	}, null, 2)}${newline}`;
	return [
		`Issued client pairing token ${credential.id}.`,
		`Token: ${credential.credential}`,
		...pairUrl ? [`Pair URL: ${pairUrl}`] : [],
		`Expires at: ${toIsoString(credential.expiresAt)}`
	].join(newline) + newline;
}
function formatPairingCredentialList(credentials, options) {
	if (options?.json) return `${JSON.stringify(credentials.map((credential) => ({
		id: credential.id,
		...credential.label ? { label: credential.label } : {},
		scopes: credential.permissions ?? credential.scopes,
		createdAt: toIsoString(credential.createdAt),
		expiresAt: toIsoString(credential.expiresAt)
	})), null, 2)}${newline}`;
	if (credentials.length === 0) return `No active pairing credentials.${newline}`;
	return credentials.map((credential) => [
		`${credential.id}${credential.label ? ` (${credential.label})` : ""}`,
		`  scopes: ${(credential.permissions ?? credential.scopes).join(" ")}`,
		`  created: ${toIsoString(credential.createdAt)}`,
		`  expires: ${toIsoString(credential.expiresAt)}`
	].join(newline)).join(`${newline}${newline}`) + newline;
}
function formatIssuedSession(session, options) {
	if (options?.tokenOnly) return `${session.token}${newline}`;
	if (options?.json) return `${JSON.stringify({
		sessionId: session.sessionId,
		token: session.token,
		method: session.method,
		scopes: session.scopes,
		subject: session.subject,
		client: session.client,
		expiresAt: toIsoString(session.expiresAt)
	}, null, 2)}${newline}`;
	return [
		`Issued bearer access token ${session.sessionId}.`,
		`Scopes: ${session.scopes.join(" ")}`,
		`Token: ${session.token}`,
		`Subject: ${session.subject}`,
		`Client: ${formatClientMetadata(session.client)}`,
		`Expires at: ${toIsoString(session.expiresAt)}`
	].join(newline) + newline;
}
function formatSessionList(sessions, options) {
	if (options?.json) return `${JSON.stringify(sessions.map((session) => ({
		sessionId: session.sessionId,
		method: session.method,
		scopes: session.scopes,
		subject: session.subject,
		client: session.client,
		connected: session.connected,
		issuedAt: toIsoString(session.issuedAt),
		expiresAt: toIsoString(session.expiresAt),
		lastConnectedAt: session.lastConnectedAt ? toIsoString(session.lastConnectedAt) : null
	})), null, 2)}${newline}`;
	if (sessions.length === 0) return `No active sessions.${newline}`;
	return sessions.map((session) => [
		`${session.sessionId}${session.connected ? " connected" : ""}`,
		`  scopes: ${session.scopes.join(" ")}`,
		`  method: ${session.method}`,
		`  subject: ${session.subject}`,
		`  client: ${formatClientMetadata(session.client)}`,
		`  issued: ${toIsoString(session.issuedAt)}`,
		`  last connected: ${session.lastConnectedAt ? toIsoString(session.lastConnectedAt) : "never"}`,
		`  expires: ${toIsoString(session.expiresAt)}`
	].join(newline)).join(`${newline}${newline}`) + newline;
}
// src/cli/authScopes.ts
const authScopesFlag = (defaults) => Literals("scope", AuthGrantScope.literals).pipe(withDescription$1(`Authorization scope to grant. Repeat for multiple scopes; replaces the default set: ${defaults.join(", ")}.`), atLeast(0), map((scopes) => [...new Set(scopes.length > 0 ? scopes : defaults)]));
// src/cli/auth.ts
const runWithEnvironmentAuth = fn("auth.runWithEnvironmentAuth")(function* (flags, run, options) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel, options);
	const minimumLogLevel = options?.quietLogs ? "Error" : config.logLevel;
	return yield* gen(function* () {
		return yield* run(yield* EnvironmentAuth);
	}).pipe(provide$1(mergeAll(layerRuntime).pipe(provide(layer$3(config)), provide(succeed$3(MinimumLogLevel, minimumLogLevel)))));
});
const ttlFlag$1 = String$1("ttl").pipe(withSchema(DurationFromString), withDescription$1("TTL, for example `5m`, `1h`, `30d`, or `15 minutes`."), optional);
const jsonFlag$3 = Boolean$1("json").pipe(withDescription$1("Emit JSON instead of human-readable output."), withDefault(false));
const labelFlag$1 = String$1("label").pipe(withDescription$1("Optional human-readable label."), optional);
const subjectFlag = String$1("subject").pipe(withDescription$1("Optional session subject."), optional);
const baseUrlFlag = String$1("base-url").pipe(withSchema(URLFromString.pipe(check(makeFilter((url) => url.protocol === "http:" || url.protocol === "https:", { expected: "an http:// or https:// URL" })))), withDescription$1("Optional public base URL used to print a ready `/pair#token=...` link."), optional);
const tokenOnlyFlag = Boolean$1("token-only").pipe(withDescription$1("Print only the issued bearer token."), withDefault(false));
const pairingCreateCommand = make$1("create", {
	...authLocationFlags,
	scopes: authScopesFlag(AuthStandardClientScopes),
	ttl: ttlFlag$1,
	label: labelFlag$1,
	baseUrl: baseUrlFlag,
	json: jsonFlag$3
}).pipe(withDescription("Issue a new client pairing token."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const output = formatIssuedPairingCredential(yield* environmentAuth.createPairingLink({
		scopes: flags.scopes,
		subject: "one-time-token",
		...isSome(flags.ttl) ? { ttl: flags.ttl.value } : {},
		...isSome(flags.label) ? { label: flags.label.value } : {}
	}), {
		json: flags.json,
		...isSome(flags.baseUrl) ? { baseUrl: flags.baseUrl.value.href } : {}
	});
	yield* log(output);
}), { quietLogs: flags.json })));
const pairingListCommand = make$1("list", {
	...authLocationFlags,
	json: jsonFlag$3
}).pipe(withDescription("List active client pairing tokens without revealing their secrets."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const pairingLinks = yield* environmentAuth.listPairingLinks({ excludeSubjects: [INTERNAL_ADMINISTRATIVE_BOOTSTRAP_SUBJECT] });
	yield* log(formatPairingCredentialList(pairingLinks, { json: flags.json }));
}), { quietLogs: flags.json })));
const pairingRevokeCommand = make$1("revoke", {
	...authLocationFlags,
	id: String$2("id").pipe(withDescription$2("Pairing credential id to revoke."))
}).pipe(withDescription("Revoke an active client pairing token."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const revoked = yield* environmentAuth.revokePairingLink(flags.id);
	yield* log(revoked ? `Revoked pairing credential ${flags.id}.\n` : `No active pairing credential found for ${flags.id}.\n`);
}))));
const pairingCommand = make$1("pairing").pipe(withDescription("Manage one-time client pairing tokens."), withSubcommands([
	pairingCreateCommand,
	pairingListCommand,
	pairingRevokeCommand
]));
const sessionIssueCommand = make$1("issue", {
	...authLocationFlags,
	scopes: authScopesFlag(AuthStandardClientScopes),
	ttl: ttlFlag$1,
	label: labelFlag$1,
	subject: subjectFlag,
	tokenOnly: tokenOnlyFlag,
	json: jsonFlag$3
}).pipe(withDescription("Issue a scoped bearer access token for headless or remote clients."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const issued = yield* environmentAuth.issueSession({
		scopes: flags.scopes,
		...isSome(flags.ttl) ? { ttl: flags.ttl.value } : {},
		...isSome(flags.label) ? { label: flags.label.value } : {},
		...isSome(flags.subject) ? { subject: flags.subject.value } : {}
	});
	yield* log(formatIssuedSession(issued, {
		json: flags.json,
		tokenOnly: flags.tokenOnly
	}));
}), { quietLogs: flags.json || flags.tokenOnly })));
const sessionListCommand = make$1("list", {
	...authLocationFlags,
	json: jsonFlag$3
}).pipe(withDescription("List active sessions without revealing bearer tokens."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const sessions = yield* environmentAuth.listSessions();
	yield* log(formatSessionList(sessions, { json: flags.json }));
}), { quietLogs: flags.json })));
const sessionRevokeCommand = make$1("revoke", {
	...authLocationFlags,
	sessionId: String$2("session-id").pipe(withDescription$2("Session id to revoke."), withSchema$1(AuthSessionId))
}).pipe(withDescription("Revoke an active session."), withHandler((flags) => runWithEnvironmentAuth(flags, (environmentAuth) => gen(function* () {
	const revoked = yield* environmentAuth.revokeSession(flags.sessionId);
	yield* log(revoked ? `Revoked session ${flags.sessionId}.\n` : `No active session found for ${flags.sessionId}.\n`);
}))));
const sessionCommand = make$1("session").pipe(withDescription("Manage bearer sessions."), withSubcommands([
	sessionIssueCommand,
	sessionListCommand,
	sessionRevokeCommand
]));
const authCommand = make$1("auth").pipe(withDescription("Manage the local auth control plane for headless deployments."), withSubcommands([pairingCommand, sessionCommand]));
// src/cli/environment.ts
/**
* Links live in this environment's database and secret store, so these
* commands work whether or not its server is running.
*/
const runWithPeerLinks = fn("environment.runWithPeerLinks")(function* (flags, run, options) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel, options);
	return yield* PeerLinks.pipe(flatMap$1(run), provide$1(layer$17.pipe(provide(mergeAll(layer$5, layerConfig, layer$2)), provide(layer$6.pipe(provide(layer$5))), provide(layer$7.pipe(provide(mergeAll(layer$5, layerConfig, layer$4)))), provide(layer$3(config)), provide(succeed$3(MinimumLogLevel, options?.quietLogs ? "Error" : config.logLevel)))));
});
const jsonFlag$2 = Boolean$1("json").pipe(withDescription$1("Emit JSON instead of human-readable output."), withDefault(false));
const encodeLinks = encodeEffect(fromJsonString(ArraySchema(toEncoded(Unknown))));
const formatLinks = (links) => links.length === 0 ? "No linked environments.\n" : `${links.map((link) => `${link.label} (${link.environmentId})\n  ${link.status}, access ${link.access}, expires ${formatIso(link.expiresAt)}\n  ${link.urls.join(", ")}${link.lastError === null ? "" : `\n  last error: ${link.lastError}`}`).join("\n\n")}\n`;
const environmentLinkCommand = make$1("link", {
	...authLocationFlags,
	url: String$2("url").pipe(withDescription$2("Where the other environment answers: its T3 Connect, Tailscale, LAN or loopback address.")),
	alternateUrl: String$1("url").pipe(withDescription$1("Another address for the same environment, tried after the first."), atLeast(0)),
	pairingCode: String$1("pairing-code").pipe(withDescription$1("A pairing code from the other environment (`t3 pair` there).")),
	access: Literals("access", AuthMcpClientAccess.literals).pipe(withDescription$1("What this environment's agents may do there: read-only, or the broadest runtime mode."), withDefault("approval-required"))
}).pipe(withDescription("Link another T3 Code environment, so agents here can work there. It shows up there under Settings → Connections, where it can be revoked."), withHandler((flags) => runWithPeerLinks(flags, (links) => gen(function* () {
	const linked = yield* links.link({
		url: flags.url,
		alternateUrls: flags.alternateUrl,
		pairingCode: flags.pairingCode,
		access: flags.access
	});
	yield* log(`Linked ${linked.label} (${linked.environmentId}) with ${linked.access} access, until ${formatIso(linked.expiresAt)}.\n`);
}))));
const environmentListCommand = make$1("list", {
	...authLocationFlags,
	json: jsonFlag$2
}).pipe(withDescription("List linked environments and whether each answers now."), withHandler((flags) => runWithPeerLinks(flags, (links) => gen(function* () {
	const listed = yield* links.list;
	yield* log(flags.json ? `${yield* encodeLinks(listed)}\n` : formatLinks(listed));
}), { quietLogs: flags.json })));
const environmentUnlinkCommand = make$1("unlink", {
	...authLocationFlags,
	environmentId: String$2("environment-id").pipe(withDescription$2("The linked environment's id, from `t3 environment list`."))
}).pipe(withDescription("Forget a linked environment here. Revoke it in that environment's Connections to end its session there too."), withHandler((flags) => runWithPeerLinks(flags, (links) => gen(function* () {
	const removed = yield* links.unlink(EnvironmentId.make(flags.environmentId));
	yield* log(removed ? `Forgot ${flags.environmentId}. Revoke it in that environment's Connections to end its session there.\n` : `No linked environment ${flags.environmentId}.\n`);
}))));
const environmentCommand = make$1("environment").pipe(withDescription("Link other T3 Code environments, so agents here can work there."), withSubcommands([
	environmentLinkCommand,
	environmentListCommand,
	environmentUnlinkCommand
]));
// ../../packages/shared/src/desktopAppControl.ts
function shortHash(value) {
	return Array.from(sha256(new TextEncoder().encode(value)).slice(0, 12), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
/** Hash state directories to stay within Unix socket path limits. */
function resolveDesktopAppControlAddress(input) {
	const stateHash = shortHash(input.stateDir);
	if (input.platform === "win32") return {
		address: `\\\\.\\pipe\\t3code-app-${stateHash}`,
		directory: null
	};
	const userKey = input.userId === void 0 ? shortHash(input.stateDir).slice(0, 12) : input.userId;
	const socketName = `${stateHash}.sock`;
	const maxPathBytes = input.platform === "linux" ? 107 : 103;
	let directory = input.joinPath(input.tempDir, `t3code-${userKey}`);
	if (new TextEncoder().encode(input.joinPath(directory, socketName)).byteLength > maxPathBytes) directory = input.joinPath("/tmp", `t3code-${userKey}`);
	return {
		address: input.joinPath(directory, socketName),
		directory
	};
}
// src/cli/app.ts
const CLI_RESPONSE_TIMEOUT_MS = 17e3;
const MAX_RESPONSE_BYTES = 65536;
const isDesktopAppActivationResponse = is(DesktopAppActivationResponse);
var DesktopAppSshUnsupportedError = class extends TaggedError()("DesktopAppSshUnsupportedError", {}) {
	get message() {
		return "`t3 app` only controls a desktop app on the same machine. It cannot run over SSH.";
	}
};
var DesktopAppPlatformUnsupportedError = class extends TaggedError()("DesktopAppPlatformUnsupportedError", { platform: String$6 }) {
	get message() {
		return `\`t3 app\` is not supported on ${this.platform}.`;
	}
};
var DesktopAppUnreachableError = class extends TaggedError()("DesktopAppUnreachableError", {
	candidateAddresses: ArraySchema(String$6),
	requestId: String$6,
	workspaceRoot: String$6,
	cause: Defect()
}) {
	get message() {
		return "Could not reach the T3 Code desktop app. Start or update the desktop app on this machine, then run `t3 app` again. A running T3 Code server is not enough.";
	}
};
var DesktopAppRequestFailedError = class extends TaggedError()("DesktopAppRequestFailedError", {
	code: DesktopAppActivationErrorCode,
	requestId: String$6,
	workspaceRoot: String$6,
	cause: Defect()
}) {
	get message() {
		return `T3 Code could not open ${this.workspaceRoot} (${this.code}).`;
	}
};
function isDesktopPlatform(platform) {
	return platform === "darwin" || platform === "linux" || platform === "win32";
}
async function sendDesktopAppActivationRequest(input) {
	if (input.address.directory !== null) {
		const stat = await NodeFSP.lstat(input.address.directory);
		if (!stat.isDirectory() || input.userId === void 0 || stat.uid !== input.userId || (stat.mode & 63) !== 0) throw new Error("The desktop app socket directory is not private or owned by this user.");
	}
	return new Promise((resolve, reject) => {
		const socket = NodeNet.createConnection(input.address.address);
		socket.setEncoding("utf8");
		let buffer = "";
		let settled = false;
		let connected = false;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			socket.destroy();
			if (result.type === "success") resolve(result.response);
			else reject(result.error);
		};
		const timeout = setTimeout(() => {
			finish({
				type: "failure",
				error: /* @__PURE__ */ new Error("The desktop app did not respond in time.")
			});
		}, input.timeoutMs ?? CLI_RESPONSE_TIMEOUT_MS);
		socket.once("connect", () => {
			connected = true;
			socket.write(`${JSON.stringify(input.request)}\n`);
		});
		socket.on("data", (chunk) => {
			buffer += chunk;
			if (Buffer.byteLength(buffer, "utf8") > MAX_RESPONSE_BYTES) {
				finish({
					type: "failure",
					error: /* @__PURE__ */ new Error("The desktop app response is too large.")
				});
				return;
			}
			const newline = buffer.indexOf("\n");
			if (newline === -1) return;
			let parsed;
			try {
				parsed = JSON.parse(buffer.slice(0, newline));
			} catch {
				finish({
					type: "failure",
					error: /* @__PURE__ */ new Error("The desktop app response is not valid JSON.")
				});
				return;
			}
			if (!isDesktopAppActivationResponse(parsed)) {
				finish({
					type: "failure",
					error: /* @__PURE__ */ new Error("The desktop app response is invalid.")
				});
				return;
			}
			if (parsed.requestId !== input.request.requestId) {
				finish({
					type: "failure",
					error: /* @__PURE__ */ new Error("The desktop app response did not match this request.")
				});
				return;
			}
			finish({
				type: "success",
				response: parsed
			});
		});
		socket.once("error", (error) => {
			if (!settled && !connected && input.fallbackAddress !== void 0 && (error.code === "ENOENT" || error.code === "ECONNREFUSED")) {
				settled = true;
				clearTimeout(timeout);
				socket.destroy();
				resolve(sendDesktopAppActivationRequest({
					address: input.fallbackAddress,
					userId: input.userId,
					request: input.request,
					...input.timeoutMs === void 0 ? {} : { timeoutMs: input.timeoutMs }
				}));
				return;
			}
			finish({
				type: "failure",
				error
			});
		});
		socket.once("end", () => {
			finish({
				type: "failure",
				error: /* @__PURE__ */ new Error("The desktop app closed the connection.")
			});
		});
	});
}
const appEnvironment = all$1({
	t3Home: String$7("T3CODE_HOME").pipe(option$1, map$5(getOrUndefined)),
	sshConnection: String$7("SSH_CONNECTION").pipe(option$1),
	sshTty: String$7("SSH_TTY").pipe(option$1)
});
const runAppCommand = fn("cli.app")(function* (flags) {
	const environment = yield* appEnvironment;
	const hostPlatform = yield* Platform;
	if (isSome(environment.sshConnection) || isSome(environment.sshTty)) return yield* new DesktopAppSshUnsupportedError({});
	if (!isDesktopPlatform(hostPlatform)) return yield* new DesktopAppPlatformUnsupportedError({ platform: hostPlatform });
	const path = yield* Path;
	const configuredBaseDir = getOrUndefined(flags.baseDir) ?? environment.t3Home;
	const baseDir = yield* resolveBaseDir(configuredBaseDir);
	const allowDevFallback = isNone(flags.baseDir) && !environment.t3Home?.trim();
	const rawWorkspaceRoot = getOrUndefined(flags.workspaceRoot) ?? (yield* WorkingDirectory);
	const workspaceRoot = path.resolve(yield* expandHomePath(rawWorkspaceRoot));
	const userId = yield* UserId;
	const resolveAddress = (stateSubdirectory) => resolveDesktopAppControlAddress({
		stateDir: path.join(baseDir, stateSubdirectory),
		platform: hostPlatform,
		tempDir: NodeOS.tmpdir(),
		userId,
		joinPath: path.join
	});
	const request = {
		version: 1,
		requestId: yield* (yield* SecureRandom).uuidV4(),
		type: "open-workspace",
		workspaceRoot,
		platform: hostPlatform
	};
	const address = resolveAddress("userdata");
	const fallbackAddress = allowDevFallback ? resolveAddress("dev") : void 0;
	const response = yield* tryPromise({
		try: () => sendDesktopAppActivationRequest({
			address,
			userId,
			...fallbackAddress === void 0 ? {} : { fallbackAddress },
			request
		}),
		catch: (cause) => new DesktopAppUnreachableError({
			candidateAddresses: fallbackAddress === void 0 ? [address.address] : [address.address, fallbackAddress.address],
			requestId: request.requestId,
			workspaceRoot,
			cause
		})
	});
	if (!response.ok) return yield* new DesktopAppRequestFailedError({
		code: response.code,
		requestId: response.requestId,
		workspaceRoot,
		cause: response
	});
	yield* log(`Opened ${workspaceRoot} in T3 Code.`);
});
const appCommand = make$1("app", {
	baseDir: baseDirFlag,
	workspaceRoot: String$2("path").pipe(withDescription$2("Project directory. Default: current directory."), optional$1)
}).pipe(withDescription("Open a project in the running T3 Code desktop app."), withHandler(runAppCommand));
// src/cli/browser.ts
var BrowserSetupStepError = class extends TaggedError()("BrowserSetupStepError", {
	step: String$6,
	detail: String$6
}) {
	get message() {
		return `Could not ${this.step}: ${this.detail}`;
	}
};
const runStep = fn("browserSetup.runStep")(function* (step, command, args) {
	const exitCode = yield* (yield* ChildProcessSpawner).exitCode(make$5(command, args, {
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit"
	})).pipe(mapError((cause) => new BrowserSetupStepError({
		step,
		detail: String(cause)
	})));
	if (exitCode !== 0) return yield* new BrowserSetupStepError({
		step,
		detail: `${command} exited with ${exitCode}`
	});
});
/** Under sudo, an unspecified home uses the invoking user's ~/.t3. */
const setupBaseDir = fn("browserSetup.baseDir")(function* (explicit) {
	const env = yield* Environment;
	const raw = getOrUndefined(explicit) ?? env.T3CODE_HOME;
	if (raw !== void 0 || env.SUDO_USER === void 0) return yield* resolveBaseDir(raw);
	const home = (yield* (yield* ChildProcessSpawner).string(make$5("getent", ["passwd", env.SUDO_USER], {
		stdin: "ignore",
		stderr: "ignore"
	})).pipe(orElseSucceed(() => ""))).trim().split(":")[5];
	const path = yield* Path;
	return home ? path.join(home, ".t3") : yield* resolveBaseDir(void 0);
});
const aptOffers = fn("browserSetup.aptOffers")(function* (name) {
	const policy = yield* (yield* ChildProcessSpawner).string(make$5("apt-cache", ["policy", name], {
		stdin: "ignore",
		stderr: "ignore"
	})).pipe(orElseSucceed(() => ""));
	const candidate = /Candidate:\s*(\S+)/.exec(policy)?.[1];
	return candidate !== void 0 && candidate !== "(none)";
});
const installedBrowser = fn("browserSetup.installedBrowser")(function* (baseDir) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const root = path.join(baseDir, "tools", "chrome-headless-shell");
	for (const platform of yield* fs.readDirectory(root).pipe(orElseSucceed(() => []))) for (const version of yield* fs.readDirectory(path.join(root, platform)).pipe(orElseSucceed(() => []))) {
		const executable = path.join(root, platform, version, "chrome-headless-shell");
		if (yield* fs.exists(executable).pipe(orElseSucceed(() => false))) return some(executable);
	}
	return none();
});
/**
* Chrome starts without fonts, but pages then render no text. Without
* fontconfig there is no `fc-match` at all, which counts as no font.
*/
const fontAvailable = gen(function* () {
	return (yield* (yield* ChildProcessSpawner).string(make$5("fc-match", ["--format=%{file}", "sans-serif"], {
		stdin: "ignore",
		stderr: "ignore"
	})).pipe(timeout("5 seconds"), orElseSucceed(() => ""))).trim() !== "";
}).pipe(withSpan("browserSetup.fontAvailable"));
const FONT_PACKAGES = ["fontconfig", "fonts-liberation"];
const browserSetupCommand = make$1("setup", { baseDir: baseDirFlag }).pipe(withDescription("Set up this Linux host for T3's browser: allow Chrome's sandbox and install its libraries and fonts."), withHandler(({ baseDir }) => gen(function* () {
	if ((yield* Platform) !== "linux") return yield* log("Nothing to set up: T3's browser runs as is on this system.");
	const fs = yield* FileSystem;
	const isRoot = (yield* UserId) === 0;
	const env = yield* Environment;
	const baseDirPath = yield* setupBaseDir(baseDir);
	const setupCommand = yield* resolveRootCliCommand(SETUP_SUBCOMMAND, isSome(baseDir) || env.T3CODE_HOME !== void 0 ? ["--base-dir", baseDirPath] : []);
	const rootWarning = isRoot && (env.SUDO_USER ?? "root") === "root" && !sandboxDisabled(env) ? new PreviewBrowserRootError().message : void 0;
	const needsProfile = yield* sandboxBlocked;
	const browser = yield* installedBrowser(baseDirPath);
	const missing = isSome(browser) ? yield* missingLibraries(browser.value) : [];
	const needsFonts = !(yield* fontAvailable);
	const hasApt = yield* fs.exists("/usr/bin/apt-get").pipe(orElseSucceed(() => false));
	if (!needsProfile && missing.length === 0 && !needsFonts) return yield* log(rootWarning ?? (isSome(browser) ? "This host is ready for T3's browser." : "Chrome's sandbox is allowed here. T3's browser installs on first use; if it then reports missing libraries, run this again."));
	if (!isRoot) {
		if (needsProfile) yield* log(`This host blocks the sandbox T3's browser runs in. Setup installs an AppArmor profile at ${APPARMOR_PROFILE_PATH} that allows it.`);
		if (missing.length > 0) yield* log(`T3's browser is missing ${missing.join(", ")}; setup installs them.`);
		if (needsFonts) yield* log("T3's browser needs fontconfig and system fonts; setup installs them.");
		return yield* log(`\nThis needs root. Run:\n\n  ${setupCommand}\n`);
	}
	if (needsProfile) {
		yield* fs.writeFileString(APPARMOR_PROFILE_PATH, APPARMOR_PROFILE).pipe(mapError((cause) => new BrowserSetupStepError({
			step: `write ${APPARMOR_PROFILE_PATH}`,
			detail: cause.message
		})));
		yield* runStep("load the AppArmor profile", "apparmor_parser", ["-r", APPARMOR_PROFILE_PATH]);
		yield* log("Allowed Chrome's sandbox for T3's browser.");
	}
	if ((missing.length > 0 || needsFonts) && !hasApt) {
		if (missing.length > 0) yield* log(`T3's browser is missing ${missing.join(", ")}. Install them with your package manager, then run this again.`);
		if (needsFonts) yield* log("T3's browser needs fontconfig and system fonts. Install them with your package manager, then run this again.");
		return;
	}
	if (missing.length > 0 || needsFonts) yield* runStep("refresh the package lists", "apt-get", ["update"]);
	if (missing.length > 0) {
		const packages = yield* forEach(DEBIAN_PACKAGES, (names) => findFirst$1(names, aptOffers).pipe(map$3(getOrElse(() => names[0]))));
		yield* runStep("install the browser's libraries", "apt-get", [
			"install",
			"-y",
			"--no-install-recommends",
			...packages
		]);
		yield* log("Installed the browser's libraries.");
	}
	if (needsFonts) {
		yield* runStep("install the browser's fonts", "apt-get", [
			"install",
			"-y",
			"--no-install-recommends",
			...FONT_PACKAGES
		]);
		if (!(yield* fontAvailable)) return yield* log("Font packages are installed, but Fontconfig still finds no system font. Check its configuration and run setup again.");
		yield* log("Installed the browser's fonts. Restart the T3 server if browser tabs were already open.");
	}
	yield* log(rootWarning ?? "This host is ready for T3's browser.");
})));
const browserCommand = make$1("browser").pipe(withDescription("Manage T3's headless browser on this host."), withSubcommands([browserSetupCommand]));
// ../../packages/shared/src/devHome.ts
/** Worktrees use isolated .t3 state; ambient T3CODE_HOME could otherwise select the live userdata database. */
const pointsAtLinkedWorktree = (gitFileContents, path) => {
	const gitdir = gitFileContents.split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith("gitdir:"))?.slice(7).trim();
	if (gitdir === void 0 || gitdir.length === 0) return false;
	const segments = path.normalize(gitdir.replaceAll("\\", "/")).split(/[/\\]/).filter((segment) => segment.length > 0);
	return segments.length >= 3 && segments.at(-2) === "worktrees";
};
const resolveGitWorktreePath = fn("devHome.resolveGitWorktreePath")(function* (cwd) {
	const fileSystem = yield* FileSystem;
	const path = yield* Path;
	let directory = path.resolve(cwd);
	for (;;) {
		const gitPath = path.join(directory, ".git");
		const info = yield* fileSystem.stat(gitPath).pipe(option);
		if (isSome(info)) {
			if (info.value.type !== "File") return;
			const contents = yield* fileSystem.readFileString(gitPath).pipe(orElseSucceed(() => ""));
			return pointsAtLinkedWorktree(contents, path) ? directory : void 0;
		}
		const parent = path.dirname(directory);
		if (parent === directory) return;
		directory = parent;
	}
});
/**
* Deliberately does not require the directory to exist yet: falling back
* because it is missing would send callers at the shared home.
*/
const resolveWorktreeT3Home = fn("devHome.resolveWorktreeT3Home")(function* (cwd) {
	const worktreePath = yield* resolveGitWorktreePath(cwd);
	if (worktreePath === void 0) return;
	return (yield* Path).join(worktreePath, ".t3");
});
// src/cli/pair.ts
const WELL_KNOWN_ENVIRONMENT_PATH = "/.well-known/t3/environment";
const PAIR_PROBE_TIMEOUT = millis(2500);
const TAILSCALE_PROBE_ATTEMPTS = 5;
const TAILSCALE_PROBE_RETRY_DELAY = seconds(1);
const DEV_VARIANT_PLACEHOLDER_URL = new URL("http://localhost");
var NoRunningServerError = class extends TaggedError()("NoRunningServerError", {
	checkedStatePaths: ArraySchema(String$6),
	inLinkedWorktree: Boolean$4,
	serveCommand: String$6,
	connectCommand: String$6
}) {
	get message() {
		return [
			"No running T3 Code server found.",
			...this.checkedStatePaths.map((statePath) => `  checked ${statePath}`),
			...this.inLinkedWorktree ? ["In a linked worktree, pass --base-dir to pair with a server outside it."] : [],
			`Start one with \`${this.serveCommand}\`, or connect this machine with T3 Connect: \`${this.connectCommand}\`.`
		].join("\n");
	}
};
var IncompatibleServerProtocolError = class extends TaggedError()("IncompatibleServerProtocolError", {
	serverVersion: String$6,
	serverProtocolVersion: Number$2
}) {
	get message() {
		return [`The running T3 Code server (${this.serverVersion}) speaks orchestration protocol ${String(this.serverProtocolVersion)}, but this CLI speaks protocol ${String(2)}.`, `Pair with the matching CLI instead: \`npx t3@${this.serverVersion} pair\`.`].join("\n");
	}
};
var TailscaleUnavailableError = class extends TaggedError()("TailscaleUnavailableError", { cause: Defect() }) {
	get message() {
		return "Could not talk to Tailscale. Is tailscaled running? Try `tailscale status`.";
	}
};
var MagicDnsNameMissingError = class extends TaggedError()("MagicDnsNameMissingError", {}) {
	get message() {
		return "This machine has no MagicDNS name. Run `tailscale up` and enable MagicDNS.";
	}
};
var TailscaleServeNotEnabledError = class extends TaggedError()("TailscaleServeNotEnabledError", {}) {
	get message() {
		return "Tailscale Serve is not enabled on your tailnet. Enable HTTPS certificates at https://login.tailscale.com/admin/dns, then run this command again.";
	}
};
var ServesOtherEnvironmentError = class extends TaggedError()("ServesOtherEnvironmentError", { servePort: Number$2 }) {
	get message() {
		return `Tailscale Serve on HTTPS port ${String(this.servePort)} already fronts a different T3 Code server. Pass --tailscale-serve-port to publish this one on another port.`;
	}
};
var TailscaleServeFailedError = class extends TaggedError()("TailscaleServeFailedError", {
	servePort: Number$2,
	cause: Defect()
}) {
	get message() {
		return `tailscale serve failed for HTTPS port ${String(this.servePort)}. Run \`tailscale serve --https=${String(this.servePort)} --bg <local-url>\` by hand to see why.`;
	}
};
var ServePortOccupiedError = class extends TaggedError()("ServePortOccupiedError", { servePort: Number$2 }) {
	get message() {
		return `HTTPS port ${String(this.servePort)} on the tailnet already serves something that is not a T3 Code server. Pass --tailscale-serve-port to publish this one on another port.`;
	}
};
const resolveDirectPairingBaseUrl = (state) => state.devUrl ?? resolveHeadlessConnectionString(state.host, state.port, { privateNetworkOnly: state.privateNetworkOnly });
var DevServerNotProxiableError = class extends TaggedError()("DevServerNotProxiableError", { devUrl: String$6 }) {
	get message() {
		return `Tailscale Serve can only proxy plain-HTTP local targets, and this dev server runs at ${this.devUrl}. Pair without --tailscale instead.`;
	}
};
const isDevServerNotProxiableError = is(DevServerNotProxiableError);
/** Publish the single-origin web dev port, which proxies the backend. Serve requires HTTP targets. */
const resolveTailscaleLocalTarget = (state) => {
	if (state.devUrl !== void 0) {
		const devUrl = new URL(state.devUrl);
		if (devUrl.protocol !== "http:") return new DevServerNotProxiableError({ devUrl: state.devUrl });
		const localPort = devUrl.port.length > 0 ? Number.parseInt(devUrl.port, 10) : 80;
		return isLoopbackHost(devUrl.hostname) ? { localPort } : {
			localPort,
			localHost: devUrl.hostname
		};
	}
	if (state.host !== void 0 && !isWildcardHost(state.host)) return {
		localPort: state.port,
		localHost: formatHostForUrl(state.host)
	};
	return { localPort: state.port };
};
const formatPairOutput = (input) => [
	`Pairing with ${input.serverLabel} (${input.origin}).`,
	"",
	renderTerminalQrCode(input.pairingUrl),
	"",
	`Pairing URL: ${input.pairingUrl}`,
	`App link: ${buildPairingAppLink(input.pairingUrl)}`,
	`Token: ${input.token}`,
	`Expires: ${formatIso(input.expiresAt)}`,
	...input.notes.flatMap((note) => ["", `Note: ${note}`]),
	""
].join("\n");
const probeEnvironmentDescriptor = fn("pair.probeEnvironmentDescriptor")(function* (baseUrl) {
	const client = yield* HttpClient;
	const request = get$1(new URL(WELL_KNOWN_ENVIRONMENT_PATH, baseUrl).toString());
	const response = yield* client.execute(request).pipe(timeout(PAIR_PROBE_TIMEOUT), mapError(() => ({ _tag: "unreachable" })));
	if (response.status === 502 || response.status === 503 || response.status === 504) return { _tag: "unreachable" };
	return {
		_tag: "descriptor",
		descriptor: yield* filterStatusOk(response).pipe(flatMap$1(schemaBodyJson(ExecutionEnvironmentDescriptor)), mapError(() => ({ _tag: "not-a-t3-server" })))
	};
}, catch_((outcome) => succeed$1(outcome)));
const discoverPairTarget = fn("pair.discoverPairTarget")(function* (explicitBaseDir) {
	const bases = [];
	let inLinkedWorktree = false;
	const hasExplicitBaseDir = explicitBaseDir !== void 0 && explicitBaseDir.trim().length > 0;
	if (hasExplicitBaseDir) bases.push(yield* resolveBaseDir(explicitBaseDir));
	else {
		const worktreeHome = yield* resolveWorktreeT3Home(yield* WorkingDirectory);
		if (worktreeHome !== void 0) {
			bases.push(worktreeHome);
			inLinkedWorktree = true;
		} else {
			const envHome = yield* String$7("T3CODE_HOME").pipe(option$1);
			bases.push(yield* resolveBaseDir(getOrUndefined(envHome)));
		}
	}
	const checkedStatePaths = [];
	for (const baseDir of new Set(bases)) for (const variant of ["userdata", "dev"]) {
		const statePath = (yield* deriveServerPaths(baseDir, variant === "dev" ? DEV_VARIANT_PLACEHOLDER_URL : void 0, {})).serverRuntimeStatePath;
		checkedStatePaths.push(statePath);
		const state = yield* readPersistedServerRuntimeState(statePath);
		if (isNone(state)) continue;
		if (!isProcessAlive(state.value.pid)) continue;
		const probed = yield* probeEnvironmentDescriptor(state.value.origin);
		if (probed._tag !== "descriptor") continue;
		return {
			baseDir,
			variant,
			state: state.value,
			descriptor: probed.descriptor
		};
	}
	const baseDirArgs = hasExplicitBaseDir ? ["--base-dir", explicitBaseDir] : [];
	return yield* new NoRunningServerError({
		checkedStatePaths,
		inLinkedWorktree,
		serveCommand: (yield* resolveHostCliCommand("serve", baseDirArgs)).command,
		connectCommand: (yield* resolveHostCliCommand("connect", baseDirArgs)).command
	});
});
/** Use the discovered state directory, independent of ambient config variables. */
const makePairServerConfig = fn(function* (input) {
	const { baseDir, variant, state } = input.target;
	const devUrl = state.devUrl !== void 0 ? new URL(state.devUrl) : void 0;
	const derivedPaths = yield* deriveServerPaths(baseDir, variant === "dev" ? DEV_VARIANT_PLACEHOLDER_URL : void 0, {});
	return make$6({
		logLevel: input.logLevel,
		traceMinLevel: "Info",
		traceTimingEnabled: false,
		traceBatchWindowMs: 1e3,
		traceMaxBytes: 10485760,
		traceMaxFiles: 10,
		otlpTracesUrl: void 0,
		otlpMetricsUrl: void 0,
		otlpLogsUrl: void 0,
		otlpTracesExport: DEFAULT_SIGNAL_EXPORT,
		otlpMetricsExport: DEFAULT_SIGNAL_EXPORT,
		otlpLogsExport: DEFAULT_SIGNAL_EXPORT,
		otelEnvironment: none$1,
		mode: "web",
		port: state.port,
		host: state.host,
		cwd: process.cwd(),
		baseDir,
		...derivedPaths,
		staticDir: void 0,
		devUrl,
		devAllowedOrigins: [],
		noBrowser: true,
		startupPresentation: "headless",
		desktopBootstrapToken: void 0,
		desktopTelemetryFd: void 0,
		desktopBrowserFd: void 0,
		desktopBrowserControlFd: void 0,
		desktopTelemetryControlFd: void 0,
		resourceMonitorPath: void 0,
		autoBootstrapProjectFromCwd: false,
		logWebSocketEvents: false,
		tailscaleServeEnabled: false,
		tailscaleServePort: 443
	});
});
const awaitEnvironmentDescriptor = fn(function* (baseUrl) {
	let last = { _tag: "unreachable" };
	for (let attempt = 0; attempt < TAILSCALE_PROBE_ATTEMPTS; attempt += 1) {
		last = yield* probeEnvironmentDescriptor(baseUrl);
		if (last._tag === "descriptor") return last;
		yield* sleep(TAILSCALE_PROBE_RETRY_DELAY);
	}
	return last;
});
const resolveTailscalePairingBase = fn("pair.resolveTailscalePairingBase")(function* (input) {
	const notes = [];
	const status = yield* readTailscaleStatus.pipe(mapError((cause) => new TailscaleUnavailableError({ cause })));
	if (status.magicDnsName === null) return yield* new MagicDnsNameMissingError();
	if (status.httpsServeEnabled === false) return yield* new TailscaleServeNotEnabledError();
	const baseUrl = buildTailscaleHttpsBaseUrl({
		magicDnsName: status.magicDnsName,
		servePort: input.servePort
	});
	const existing = yield* probeEnvironmentDescriptor(baseUrl);
	if (existing._tag === "descriptor") {
		if (existing.descriptor.environmentId !== input.target.descriptor.environmentId) return yield* new ServesOtherEnvironmentError({ servePort: input.servePort });
		if (input.target.state.devUrl === void 0) return {
			baseUrl,
			notes
		};
	}
	if (existing._tag === "not-a-t3-server") return yield* new ServePortOccupiedError({ servePort: input.servePort });
	const localTarget = resolveTailscaleLocalTarget(input.target.state);
	if (isDevServerNotProxiableError(localTarget)) return yield* localTarget;
	yield* ensureTailscaleServe({
		localPort: localTarget.localPort,
		servePort: input.servePort,
		...localTarget.localHost !== void 0 ? { localHost: localTarget.localHost } : {}
	}).pipe(mapError((cause) => new TailscaleServeFailedError({
		servePort: input.servePort,
		cause
	})));
	notes.push(`Tailscale Serve now maps ${baseUrl} to this server and persists across restarts. Remove it with \`tailscale serve --https=${String(input.servePort)} --set-path=/ off\`.`);
	const probed = yield* awaitEnvironmentDescriptor(baseUrl);
	if (probed._tag === "descriptor") {
		if (probed.descriptor.environmentId !== input.target.descriptor.environmentId) return yield* new ServesOtherEnvironmentError({ servePort: input.servePort });
	} else notes.push("The HTTPS endpoint has not answered yet. First use can take a moment while Tailscale provisions certificates.");
	return {
		baseUrl,
		notes
	};
});
const mintPairingLink = fn("pair.mintPairingLink")(function* (input) {
	return yield* gen(function* () {
		return yield* (yield* EnvironmentAuth).createPairingLink({
			scopes: input.scopes,
			subject: "one-time-token",
			label: getOrElse(input.label, () => "t3 pair"),
			...isSome(input.ttl) ? { ttl: input.ttl.value } : {}
		});
	}).pipe(provide$1(layerRuntime.pipe(provide(layer$3(input.config)), provide(succeed$3(MinimumLogLevel, input.config.logLevel)))));
});
const ttlFlag = String$1("ttl").pipe(withSchema(DurationFromString), withDescription$1("Token TTL, for example `5m`, `1h`, or `15 minutes`. Defaults to 5 minutes."), optional);
const labelFlag = String$1("label").pipe(withDescription$1("Optional label shown in the server's connections list."), optional);
const tailscaleFlag = Boolean$1("tailscale").pipe(withDescription$1("Publish the server over Tailscale Serve HTTPS and pair through the tailnet URL."), withDefault(false));
const tailscaleServePortFlag = Int("tailscale-serve-port").pipe(withSchema(PortSchema), withDescription$1("HTTPS port for Tailscale Serve when --tailscale is enabled."), withDefault(443));
const pairCommand = make$1("pair", {
	baseDir: baseDirFlag,
	scopes: authScopesFlag(AuthStandardClientScopes),
	ttl: ttlFlag,
	label: labelFlag,
	tailscale: tailscaleFlag,
	tailscaleServePort: tailscaleServePortFlag
}).pipe(withDescription("Mint a pairing token for a running T3 Code server and print it as a QR code."), withHandler((flags) => gen(function* () {
	const cliLogLevel = yield* LogLevel;
	const logLevel = getOrElse(cliLogLevel, () => "Warn");
	const target = yield* discoverPairTarget(getOrUndefined(flags.baseDir));
	const serverProtocolVersion = target.descriptor.orchestrationProtocolVersion ?? 1;
	if (serverProtocolVersion !== 2) return yield* new IncompatibleServerProtocolError({
		serverVersion: target.descriptor.serverVersion,
		serverProtocolVersion
	});
	const notes = [];
	let pairingBaseUrl;
	if (flags.tailscale) {
		const policy = yield* ManagedPolicy.pipe(provide$1(layer$4));
		if (!allowsRemoteClients(policy)) return yield* refuseRemoteClients(policy, "so Tailscale Serve cannot be turned on");
		const resolved = yield* resolveTailscalePairingBase({
			target,
			servePort: flags.tailscaleServePort
		});
		pairingBaseUrl = resolved.baseUrl;
		notes.push(...resolved.notes);
	} else {
		pairingBaseUrl = resolveDirectPairingBaseUrl(target.state);
		if (isLoopbackHost(new URL(pairingBaseUrl).hostname)) notes.push("This URL is only reachable from this machine. To reach it from your other devices, run `t3 up`, or re-run with --tailscale.");
		else if (target.state.privateNetworkOnly) notes.push("This URL works only from this machine's local network. From elsewhere, re-run with --tailscale or use T3 Connect.");
		if (target.variant === "dev" && target.state.devUrl === void 0) notes.push("This dev server did not record its web URL; restart it so pairing can go through the web origin.");
	}
	const config = yield* makePairServerConfig({
		target,
		logLevel
	});
	const issued = yield* mintPairingLink({
		config,
		scopes: flags.scopes,
		ttl: flags.ttl,
		label: flags.label
	});
	const pairingUrl = buildPairingUrl(pairingBaseUrl, issued.credential);
	yield* log(formatPairOutput({
		serverLabel: target.descriptor.label,
		origin: target.state.origin,
		pairingUrl,
		token: issued.credential,
		expiresAt: issued.expiresAt,
		notes
	}));
}).pipe(provide$1(layer$2))));
// src/cli/project.ts
const isEnvironmentHttpCommonError = is(EnvironmentHttpCommonError);
var ProjectCommandIdGenerationError = class extends TaggedError()("ProjectCommandIdGenerationError", {
	operation: Literal("generateProjectCommandId"),
	cause: Defect()
}) {
	get message() {
		return "Failed to generate a project command identifier.";
	}
};
var ProjectLiveServerDeclaredResponseError = class extends TaggedError()("ProjectLiveServerDeclaredResponseError", {
	operation: Literal("callLiveServer"),
	code: String$6,
	traceId: String$6,
	cause: Defect()
}) {
	get message() {
		return `Server request failed (${this.code}, trace ${this.traceId}).`;
	}
};
var ProjectLiveServerUndeclaredStatusError = class extends TaggedError()("ProjectLiveServerUndeclaredStatusError", {
	operation: Literal("callLiveServer"),
	status: Int$5,
	cause: Defect()
}) {
	get message() {
		return `Server request failed with undeclared status ${this.status}.`;
	}
};
var ProjectLiveServerRequestError = class extends TaggedError()("ProjectLiveServerRequestError", {
	operation: Literal("callLiveServer"),
	cause: Defect()
}) {
	get message() {
		return "Failed to call the running server.";
	}
};
var ProjectTitleEmptyError = class extends TaggedError()("ProjectTitleEmptyError", {
	operation: Literal("validateProjectTitle"),
	title: String$6
}) {
	get message() {
		return "Project title cannot be empty.";
	}
};
var ProjectIdentifierEmptyError = class extends TaggedError()("ProjectIdentifierEmptyError", {
	operation: Literal("resolveProjectTarget"),
	identifier: String$6
}) {
	get message() {
		return "Project identifier cannot be empty.";
	}
};
var ProjectNotFoundError = class extends TaggedError()("ProjectNotFoundError", {
	operation: Literal("resolveProjectTarget"),
	identifier: String$6,
	normalizedWorkspaceRoot: optional$3(String$6),
	activeProjectCount: Number$2,
	cause: optional$3(Defect())
}) {
	get message() {
		return `No active project found for '${this.identifier}'.`;
	}
};
var ProjectAlreadyExistsError = class extends TaggedError()("ProjectAlreadyExistsError", {
	operation: Literal("addProject"),
	projectId: ProjectId,
	workspaceRoot: String$6
}) {
	get message() {
		return `An active project already exists for '${this.workspaceRoot}'.`;
	}
};
Union([
	ProjectCommandIdGenerationError,
	ProjectLiveServerDeclaredResponseError,
	ProjectLiveServerUndeclaredStatusError,
	ProjectLiveServerRequestError,
	ProjectTitleEmptyError,
	ProjectIdentifierEmptyError,
	ProjectNotFoundError,
	ProjectAlreadyExistsError
]);
function projectCommandErrorFromLiveServerRequest(cause) {
	if (isEnvironmentHttpCommonError(cause)) return new ProjectLiveServerDeclaredResponseError({
		operation: "callLiveServer",
		code: cause.code,
		traceId: cause.traceId,
		cause
	});
	if (isHttpClientError(cause) && cause.response !== void 0) return new ProjectLiveServerUndeclaredStatusError({
		operation: "callLiveServer",
		status: cause.response.status,
		cause
	});
	return new ProjectLiveServerRequestError({
		operation: "callLiveServer",
		cause
	});
}
const projectCommandUuid = SecureRandom.pipe(flatMap$1((random) => random.uuidV4()), mapError((cause) => new ProjectCommandIdGenerationError({
	operation: "generateProjectCommandId",
	cause
})));
const makeProjectCliRuntimeLayer = (layerProjectService) => layerProjectService.pipe(provideMerge(layer$8), provideMerge(layer$9), provideMerge(layer$10.pipe(provide(layer$11), provide(layer$12))), provideMerge(layer$11), provideMerge(layer$7.pipe(provide(merge(layer$5, layer$4)))), provideMerge(layerConfig));
const PROJECT_CLI_LIVE_SERVER_PROBE_TIMEOUT = seconds(1);
const PROJECT_CLI_LIVE_SERVER_REQUEST_TIMEOUT = seconds(10);
const withProjectCliSessionToken = (environmentAuth, run) => acquireUseRelease(environmentAuth.issueSession({
	scopes: AuthStandardClientScopes,
	label: "t3 project cli"
}), (issued) => run(issued.token), (issued) => environmentAuth.revokeSession(issued.sessionId).pipe(ignore({ log: true })));
const makeLiveServerClient = (origin) => make$7(EnvironmentHttpApi, { baseUrl: origin });
const normalizeWorkspaceRootForProjectCommand = fn("normalizeWorkspaceRootForProjectCommand")(function* (workspaceRoot) {
	return yield* (yield* WorkspacePaths).normalizeWorkspaceRoot(workspaceRoot);
});
const resolveProjectTitle = fn("resolveProjectTitle")(function* (workspaceRoot, explicitTitle) {
	if (explicitTitle !== void 0) {
		const trimmed = explicitTitle.trim();
		if (trimmed.length > 0) return trimmed;
		return yield* new ProjectTitleEmptyError({
			operation: "validateProjectTitle",
			title: explicitTitle
		});
	}
	const basename = (yield* Path).basename(workspaceRoot).trim();
	return basename.length > 0 ? basename : "project";
});
const findActiveProjectTarget = fn("findActiveProjectTarget")(function* (input) {
	const trimmedIdentifier = input.identifier.trim();
	if (trimmedIdentifier.length === 0) return yield* new ProjectIdentifierEmptyError({
		operation: "resolveProjectTarget",
		identifier: input.identifier
	});
	const activeProjects = input.snapshot.projects.filter((project) => project.deletedAt === null);
	const exactIdMatch = activeProjects.find((project) => project.id === trimmedIdentifier);
	if (exactIdMatch) return {
		id: exactIdMatch.id,
		title: exactIdMatch.title,
		workspaceRoot: exactIdMatch.workspaceRoot
	};
	const normalizedWorkspaceRootResult = yield* result(normalizeWorkspaceRootForProjectCommand(trimmedIdentifier));
	const normalizedWorkspaceRoot = normalizedWorkspaceRootResult._tag === "Success" ? normalizedWorkspaceRootResult.success : normalizedWorkspaceRootResult.failure.normalizedWorkspaceRoot;
	const resolved = activeProjects.find((project) => project.workspaceRoot === normalizedWorkspaceRoot);
	if (!resolved) return yield* new ProjectNotFoundError({
		operation: "resolveProjectTarget",
		identifier: trimmedIdentifier,
		activeProjectCount: activeProjects.length,
		normalizedWorkspaceRoot,
		...normalizedWorkspaceRootResult._tag === "Failure" ? { cause: normalizedWorkspaceRootResult.failure } : {}
	});
	return {
		id: resolved.id,
		title: resolved.title,
		workspaceRoot: resolved.workspaceRoot
	};
});
const fetchLiveOrchestrationSnapshot = fn("project.fetchLiveOrchestrationSnapshot")(function* (origin, bearerToken, _timeout) {
	return yield* (yield* makeLiveServerClient(origin)).projects.snapshot({ headers: { authorization: `Bearer ${bearerToken}` } });
}, (effect, _origin, _bearerToken, timeout$1 = PROJECT_CLI_LIVE_SERVER_REQUEST_TIMEOUT) => effect.pipe(timeout(timeout$1), mapError(projectCommandErrorFromLiveServerRequest)));
const dispatchLiveOrchestrationCommand = fn("project.dispatchLiveOrchestrationCommand")(function* (origin, bearerToken, command) {
	yield* (yield* makeLiveServerClient(origin)).projects.mutate({
		headers: { authorization: `Bearer ${bearerToken}` },
		payload: command
	});
}, (effect, _origin, _bearerToken, _command) => effect.pipe(timeout(PROJECT_CLI_LIVE_SERVER_REQUEST_TIMEOUT), mapError(projectCommandErrorFromLiveServerRequest)));
const getOfflineSnapshot = fn("getOfflineSnapshot")(function* () {
	return yield* (yield* ProjectService).snapshot;
});
const tryResolveLiveProjectExecutionMode = fn("tryResolveLiveProjectExecutionMode")(function* (environmentAuth, config) {
	const runtimeState = yield* readPersistedServerRuntimeState(config.serverRuntimeStatePath);
	if (isNone(runtimeState)) return none();
	const attempt = withProjectCliSessionToken(environmentAuth, (token) => fetchLiveOrchestrationSnapshot(runtimeState.value.origin, token, PROJECT_CLI_LIVE_SERVER_PROBE_TIMEOUT).pipe(as({ origin: runtimeState.value.origin })));
	const attempted = yield* result(attempt);
	if (attempted._tag === "Success") return some(attempted.success);
	yield* logDebug("Failed to connect to the persisted project CLI server.", {
		origin: runtimeState.value.origin,
		cause: attempted.failure
	});
	return none();
});
const runProjectMutation = fn("runProjectMutation")(function* (flags, run) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	const minimumLogLevel = config.logLevel;
	return yield* gen(function* () {
		const environmentAuth = yield* EnvironmentAuth;
		const liveMode = yield* tryResolveLiveProjectExecutionMode(environmentAuth, config);
		if (isSome(liveMode)) return yield* withProjectCliSessionToken(environmentAuth, (token) => gen(function* () {
			const output = yield* run({
				snapshot: yield* fetchLiveOrchestrationSnapshot(liveMode.value.origin, token),
				dispatch: (command) => dispatchLiveOrchestrationCommand(liveMode.value.origin, token, command),
				mode: "live"
			});
			yield* log(output);
		}));
		const { layerProjectService } = yield* promise(() => import("./runtimeLayer-ddMPZoEh.mjs"));
		const layerOfflineRuntime = makeProjectCliRuntimeLayer(layerProjectService).pipe(provide(layer$3(config)), provide(succeed$3(MinimumLogLevel, minimumLogLevel)));
		yield* acquireServerOwnership(config.serverRuntimeStatePath).pipe(provide$1(layer$1));
		yield* clearPersistedServerRuntimeState(config.serverRuntimeStatePath);
		return yield* gen(function* () {
			const snapshot = yield* getOfflineSnapshot();
			const projects = yield* ProjectService;
			const output = yield* run({
				snapshot,
				dispatch: (command) => projectMutationOperation(projects, command).pipe(asVoid),
				mode: "offline"
			});
			yield* log(output);
		}).pipe(provide$1(layerOfflineRuntime));
	}).pipe(scoped, provide$1(mergeAll(layerRuntime, layer$11).pipe(provideMerge(layer$2), provide(layer$3(config)), provide(succeed$3(MinimumLogLevel, minimumLogLevel)))));
});
const projectAddCommand = make$1("add", {
	...projectLocationFlags,
	workspaceRoot: String$2("path").pipe(withDescription$2("Workspace root to add as a project.")),
	title: String$1("title").pipe(withDescription$1("Optional project title."), optional)
}).pipe(withDescription("Add a project."), withHandler((flags) => runProjectMutation(flags, fn("projectAddMutation")(function* ({ snapshot, dispatch }) {
	const workspaceRoot = yield* normalizeWorkspaceRootForProjectCommand(flags.workspaceRoot);
	const existingProject = snapshot.projects.find((project) => project.deletedAt === null && project.workspaceRoot === workspaceRoot);
	if (existingProject) return yield* new ProjectAlreadyExistsError({
		operation: "addProject",
		projectId: existingProject.id,
		workspaceRoot
	});
	const title = yield* resolveProjectTitle(workspaceRoot, getOrUndefined(flags.title));
	const projectId = ProjectId.make(yield* projectCommandUuid);
	yield* dispatch({
		type: "project.create",
		commandId: CommandId.make(yield* projectCommandUuid),
		projectId,
		title,
		workspaceRoot
	});
	return `Added project ${projectId} (${title}) at ${workspaceRoot}.`;
}))));
const projectRemoveCommand = make$1("remove", {
	...projectLocationFlags,
	project: String$2("project").pipe(withDescription$2("Project id or workspace root to remove.")),
	force: Boolean$1("force").pipe(withDescription$1("Delete the project and all of its threads."), withDefault(false))
}).pipe(withDescription("Remove a project."), withHandler((flags) => runProjectMutation(flags, fn("projectRemoveMutation")(function* ({ snapshot, dispatch }) {
	const project = yield* findActiveProjectTarget({
		snapshot,
		identifier: flags.project
	});
	yield* dispatch({
		type: "project.delete",
		commandId: CommandId.make(yield* projectCommandUuid),
		projectId: project.id,
		force: flags.force
	});
	return `Removed project ${project.id} (${project.title}).`;
}))));
const projectRenameCommand = make$1("rename", {
	...projectLocationFlags,
	project: String$2("project").pipe(withDescription$2("Project id or workspace root to rename.")),
	title: String$2("title").pipe(withDescription$2("New project title."))
}).pipe(withDescription("Rename a project."), withHandler((flags) => runProjectMutation(flags, fn("projectRenameMutation")(function* ({ snapshot, dispatch }) {
	const project = yield* findActiveProjectTarget({
		snapshot,
		identifier: flags.project
	});
	const nextTitle = yield* resolveProjectTitle(project.workspaceRoot, flags.title);
	if (nextTitle === project.title) return `Project ${project.id} is already named ${nextTitle}.`;
	yield* dispatch({
		type: "project.update",
		commandId: CommandId.make(yield* projectCommandUuid),
		projectId: project.id,
		title: nextTitle
	});
	return `Renamed project ${project.id} to ${nextTitle}.`;
}))));
const projectCommand = make$1("project").pipe(withDescription("Manage projects."), withSubcommands([
	projectAddCommand,
	projectRemoveCommand,
	projectRenameCommand
]));
// src/cli/thread.ts
/**
* Short enough that a run which stops to ask the user something is noticed
* soon, since `t3_thread_wait` only returns on a terminal run.
*/
const WAIT_SLICE_MS = 15e3;
const READ_PAGE_LIMIT = 100;
const TITLE_MAX_CHARS = 80;
var ThreadServerNotRunningError = class extends TaggedError()("ThreadServerNotRunningError", { baseDir: String$6 }) {
	[errorReported] = false;
	get message() {
		return `No running T3 Code server uses ${this.baseDir}. Start T3 Code, then retry.`;
	}
};
var ThreadServerUnreachableError = class extends TaggedError()("ThreadServerUnreachableError", {
	origin: String$6,
	cause: Defect()
}) {
	[errorReported] = false;
	get message() {
		const reason = this.cause instanceof Error ? ` ${this.cause.message}` : "";
		return `Could not reach the T3 Code server at ${this.origin}.${reason}`;
	}
};
var ThreadToolFailedError = class extends TaggedError()("ThreadToolFailedError", {
	tool: String$6,
	detail: String$6
}) {
	[errorReported] = false;
	get message() {
		return this.detail;
	}
};
var ThreadUsageError = class extends TaggedError()("ThreadUsageError", { detail: String$6 }) {
	[errorReported] = false;
	get message() {
		return this.detail;
	}
};
var ThreadProjectNotFoundError = class extends TaggedError()("ThreadProjectNotFoundError", { identifier: String$6 }) {
	[errorReported] = false;
	get message() {
		return `No T3 Code project matches '${this.identifier}'. Pass a project id or a path inside a project.`;
	}
};
/** Exit code 2 lets a script tell "needs a human" apart from a failed run. */
var ThreadNeedsInputError = class extends TaggedError()("ThreadNeedsInputError", { threadId: ThreadId }) {
	[errorReported] = false;
	[errorExitCode] = 2;
	get message() {
		return `Thread ${this.threadId} is waiting for an answer. Open it in T3 Code to respond.`;
	}
};
var ThreadRunEndedError = class extends TaggedError()("ThreadRunEndedError", {
	threadId: ThreadId,
	status: String$6,
	error: optional$3(String$6)
}) {
	[errorReported] = false;
	get message() {
		const reason = this.error === void 0 ? "." : `: ${this.error}`;
		return `Thread ${this.threadId} stopped with status ${this.status}${reason}`;
	}
};
const ThreadCliError = Union([
	ThreadServerNotRunningError,
	ThreadServerUnreachableError,
	ThreadToolFailedError,
	ThreadUsageError,
	ThreadProjectNotFoundError,
	ThreadNeedsInputError,
	ThreadRunEndedError
]);
const isThreadCliError = is(ThreadCliError);
/**
* These errors are expected outcomes for a script, so they print as one line
* on stderr instead of the runtime's logged stack trace.
*/
const reportThreadErrors = (effect) => effect.pipe(tapError((error$2) => isThreadCliError(error$2) ? error(error$2.message) : void_));
const decodeFailureText = decodeUnknownOption(fromJsonString(OrchestratorMcpFailure));
const encodeJson = encodeSync(fromJsonString(Unknown));
const printJson = (value) => log(encodeJson(value));
const ToolResult = Struct({
	isError: optional$3(Boolean$4),
	structuredContent: optional$3(Unknown),
	content: optional$3(ArraySchema(Struct({
		type: String$6,
		text: optional$3(String$6)
	})))
});
const decodeToolResult = decodeUnknownEffect(ToolResult);
const ProjectListResult = Struct({
	projects: ArraySchema(Struct({
		id: ProjectId,
		title: String$6,
		workspaceRoot: String$6
	})),
	nextCursor: NullOr(Int$5)
});
const ThreadLaunchResult = Struct({
	threadId: ThreadId,
	projectId: ProjectId,
	runId: NullOr(RunId)
});
const toolFailureDetail = (result) => {
	const text = result.content?.find((part) => part.text !== void 0)?.text ?? "";
	return match$1(decodeFailureText(text), {
		onNone: () => text || "The tool call failed.",
		onSome: (failure) => failure.message
	});
};
const makeThreadTools = (session, origin) => {
	const unexpected = (tool) => new ThreadToolFailedError({
		tool,
		detail: `The server sent an unexpected ${tool} result. Update the t3 CLI to match the server.`
	});
	return { call: fn("cli.thread.callTool")(function* (tool, args, schema) {
		const raw = yield* session.call(tool, args).pipe(mapError((cause) => new ThreadServerUnreachableError({
			origin,
			cause
		})));
		const result = yield* decodeToolResult(raw).pipe(mapError(() => unexpected(tool)));
		if (result.isError === true) return yield* new ThreadToolFailedError({
			tool,
			detail: toolFailureDetail(result)
		});
		return yield* decodeUnknownEffect(schema)(result.structuredContent).pipe(mapError(() => unexpected(tool)));
	}) };
};
/**
* Signs in as a short-lived MCP client of the running server, the same way an
* outside agent does, and revokes that session when the command ends.
*/
const withThreadTools = fn("cli.thread.withThreadTools")(function* (flags, run) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	return yield* gen(function* () {
		const runtimeState = yield* readPersistedServerRuntimeState(config.serverRuntimeStatePath);
		if (isNone(runtimeState)) return yield* new ThreadServerNotRunningError({ baseDir: config.baseDir });
		const origin = runtimeState.value.origin;
		const environmentAuth = yield* EnvironmentAuth;
		const issued = yield* acquireRelease(environmentAuth.issueMcpClientSession({
			label: "t3 thread cli",
			access: "full-access",
			peerLink: false,
			client: { deviceType: "bot" }
		}), (session) => environmentAuth.revokeSession(session.sessionId).pipe(ignore({ log: true })));
		const session = yield* mcpToolSession({
			endpoint: new URL("/mcp", origin).href,
			authorization: `Bearer ${issued.token}`,
			clientName: "t3-thread-cli"
		}).pipe(mapError((cause) => new ThreadServerUnreachableError({
			origin,
			cause
		})));
		return yield* run(makeThreadTools(session, origin));
	}).pipe(scoped, provide$1(layerRuntime.pipe(provide(layer$3(config)), provide(succeed$3(MinimumLogLevel, config.logLevel)))));
});
const readMessageArgument = fn("cli.thread.readMessage")(function* (argument) {
	const text = argument === "-" ? yield* Stdio.pipe(flatMap$1((stdio) => stdio.stdin.pipe(decodeText(), mkString))) : argument;
	if (text.trim().length === 0) return yield* new ThreadUsageError({ detail: "The message is empty." });
	return text;
});
const listAllProjects = fn("cli.thread.listAllProjects")(function* (tools) {
	const projects = [];
	let cursor = 0;
	while (cursor !== null) {
		const page = yield* tools.call("t3_project_list", {
			cursor,
			limit: 100
		}, ProjectListResult);
		projects.push(...page.projects);
		cursor = page.nextCursor;
	}
	return projects;
});
/** A project id, or a path inside a project's folder (deepest project wins). */
const resolveProject = fn("cli.thread.resolveProject")(function* (tools, identifier) {
	const projects = yield* listAllProjects(tools);
	const byId = projects.find((project) => project.id === identifier);
	if (byId !== void 0) return byId;
	const path = yield* Path;
	const fileSystem = yield* FileSystem;
	const realPath = (value) => fileSystem.realPath(value).pipe(orElseSucceed(() => value));
	const target = yield* realPath(path.resolve(yield* WorkingDirectory, yield* expandHomePath(identifier)));
	const containing = (yield* forEach(projects, (project) => map$3(realPath(project.workspaceRoot), (root) => ({
		project,
		root
	})))).filter(({ root }) => {
		const relative = path.relative(root, target);
		return relative === "" || relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
	}).toSorted((left, right) => right.root.length - left.root.length)[0];
	if (containing === void 0) return yield* new ThreadProjectNotFoundError({ identifier });
	return containing.project;
});
/** Every item on a timeline view, oldest first. */
const readTimeline = fn("cli.thread.readTimeline")(function* (tools, threadId, view) {
	const items = [];
	let afterPosition;
	let page;
	do {
		page = yield* tools.call("t3_thread_read", {
			threadId,
			view,
			limit: READ_PAGE_LIMIT,
			runLimit: 1,
			...afterPosition === void 0 ? {} : { afterPosition }
		}, OrchestratorMcpThreadReadResult);
		items.push(...page.items);
		afterPosition = page.nextPosition ?? void 0;
	} while (page.hasMore && afterPosition !== void 0);
	return {
		thread: page.thread,
		items
	};
});
/**
* The latest `count` user and assistant messages, oldest first. Positions
* count every timeline item, so the read starts near the end and widens
* backward only while tool and plan items leave too few messages.
*/
const readLatestMessages = fn("cli.thread.readLatestMessages")(function* (tools, threadId, count) {
	let { thread } = yield* tools.call("t3_thread_read", {
		threadId,
		limit: 1,
		runLimit: 1
	}, OrchestratorMcpThreadReadResult);
	let messages = [];
	let before;
	let start = thread.itemCount;
	let span = Math.max(count, READ_PAGE_LIMIT);
	do {
		const end = before;
		start = Math.max(0, start - span);
		const window = [];
		let afterPosition = start - 1;
		let page;
		do {
			page = yield* tools.call("t3_thread_read", {
				threadId,
				view: "messages",
				limit: READ_PAGE_LIMIT,
				runLimit: 1,
				...afterPosition < 0 ? {} : { afterPosition }
			}, OrchestratorMcpThreadReadResult);
			window.push(...page.items.filter((item) => (item.type === "user_message" || item.type === "assistant_message") && (end === void 0 || item.position < end)));
			afterPosition = page.nextPosition ?? Number.POSITIVE_INFINITY;
		} while (page.hasMore && afterPosition < (end ?? Number.POSITIVE_INFINITY) - 1);
		thread = page.thread;
		messages = window.concat(messages);
		before = start;
		span *= 2;
	} while (messages.length < count && start > 0);
	return {
		thread,
		messages: messages.slice(Math.max(0, messages.length - count))
	};
});
/** Item text past the read's per-item cap. */
const readFullText = fn("cli.thread.readFullText")(function* (tools, threadId, item) {
	let text = item.text ?? "";
	let nextTextOffset = item.textTruncated ? item.nextTextOffset ?? null : null;
	while (nextTextOffset !== null) {
		const chunk = (yield* tools.call("t3_thread_read", {
			threadId,
			itemId: item.itemId,
			textOffset: nextTextOffset,
			runLimit: 1
		}, OrchestratorMcpThreadReadResult)).items.find((candidate) => candidate.itemId === item.itemId);
		if (chunk === void 0) break;
		text += chunk.text ?? "";
		nextTextOffset = chunk.textTruncated ? chunk.nextTextOffset ?? null : null;
	}
	return text;
});
/** The run's last assistant message, or its last error when it did not complete. */
const runResultText = fn("cli.thread.runResultText")(function* (tools, threadId, runId, type) {
	const { items } = yield* readTimeline(tools, threadId, type === "assistant_message" ? "messages" : "activity");
	const item = items.findLast((candidate) => candidate.runId === runId && candidate.type === type);
	return item === void 0 ? null : yield* readFullText(tools, threadId, item);
});
/**
* Waits for this exact run, following a restart to its continuation, so a
* message another client sends meanwhile cannot stand in for its result.
*/
const waitForRun = fn("cli.thread.waitForRun")(function* (tools, threadId, runId) {
	const waitSlice = (timeoutMs) => tools.call("t3_thread_wait", {
		threadId,
		runId,
		timeoutMs
	}, OrchestratorMcpThreadWaitResult);
	const ended = (waited) => ({
		type: "ended",
		runId: waited.runId,
		status: waited.status
	});
	while (true) {
		const waited = yield* waitSlice(WAIT_SLICE_MS);
		if (!waited.timedOut) return ended(waited);
		const { thread } = yield* tools.call("t3_thread_read", {
			threadId,
			limit: 1,
			runLimit: 1
		}, OrchestratorMcpThreadReadResult);
		if (thread.pendingRequestCount > 0) {
			const recheck = yield* waitSlice(1);
			return recheck.timedOut ? { type: "needs_input" } : ended(recheck);
		}
	}
});
/**
* With --json the result always reaches stdout, so a script keeps the thread
* id even when the run fails.
*/
const finishRun = fn("cli.thread.finishRun")(function* (tools, input) {
	const outcome = yield* waitForRun(tools, input.threadId, input.runId);
	const runId = outcome.type === "ended" ? outcome.runId ?? input.runId : input.runId;
	const status = outcome.type === "ended" ? outcome.status : "waiting";
	const reply = status === "completed" ? yield* runResultText(tools, input.threadId, runId, "assistant_message") : null;
	const error = status === "completed" || status === "waiting" ? null : yield* runResultText(tools, input.threadId, runId, "error");
	if (input.json) yield* printJson({
		threadId: input.threadId,
		runId,
		status,
		reply,
		error
	});
	else if (reply !== null) yield* log(reply);
	if (outcome.type === "needs_input") return yield* new ThreadNeedsInputError({ threadId: input.threadId });
	if (status !== "completed") return yield* new ThreadRunEndedError({
		threadId: input.threadId,
		status,
		...error === null ? {} : { error }
	});
});
const titleFromMessage = (message) => {
	const firstLine = message.trim().split("\n")[0]?.trim() ?? "";
	if (firstLine.length <= TITLE_MAX_CHARS) return firstLine;
	let end = 79;
	const previous = firstLine.charCodeAt(end - 1);
	const next = firstLine.charCodeAt(end);
	if (previous >= 55296 && previous <= 56319 && next >= 56320 && next <= 57343) end -= 1;
	return `${firstLine.slice(0, end).trimEnd()}…`;
};
const launchWorkspaceStrategy = (input) => match$1(input.worktree, {
	onNone: () => isSome(input.branch) ? fail(new ThreadUsageError({ detail: "--branch needs --worktree <base-ref>." })) : void_,
	onSome: (baseRef) => succeed$1({
		type: "worktree",
		baseRef,
		...match$1(input.branch, {
			onNone: () => ({}),
			onSome: (branch) => ({ branch })
		})
	})
});
const jsonFlag$1 = Boolean$1("json").pipe(withDescription$1("Print JSON instead of text."), withDefault(false));
const waitFlag = Boolean$1("wait").pipe(withDescription$1("Wait for the agent to finish and print its reply. Exits 1 if the run fails and 2 if it waits for an answer."), withDefault(false));
const messageArgument = String$2("message").pipe(withDescription$2("Message for the agent, or - to read it from stdin."));
const threadArgument = String$2("thread").pipe(withDescription$2("Thread id."));
const decodeThreadIdValue = decodeUnknownEffect(ThreadId);
const decodeTitle = decodeUnknownEffect(TrimmedNonEmptyString);
const decodeThreadId = (value) => decodeThreadIdValue(value.trim()).pipe(mapError(() => new ThreadUsageError({ detail: `'${value}' is not a thread id.` })));
const threadListCommand = make$1("list", {
	...projectLocationFlags,
	project: String$1("project").pipe(withDescription$1("Project id or a path inside the project. Defaults to this directory."), withDefault(".")),
	json: jsonFlag$1
}).pipe(withDescription("List a project's threads, newest first."), withHandler((flags) => withThreadTools(flags, fn("cli.thread.list")(function* (tools) {
	const project = yield* resolveProject(tools, flags.project);
	const threads = [];
	let cursor = 0;
	while (cursor !== null) {
		const page = yield* tools.call("t3_thread_list", {
			projectId: project.id,
			includeSubagents: false,
			limit: 100,
			cursor
		}, OrchestratorMcpThreadListResult);
		threads.push(...page.threads);
		cursor = page.nextCursor;
	}
	if (flags.json) return yield* printJson(threads);
	for (const thread of threads) yield* log(`${thread.threadId}  ${thread.status.padEnd(11)}  ${thread.title}`);
})).pipe(reportThreadErrors)));
const threadStartCommand = make$1("start", {
	...projectLocationFlags,
	project: String$2("project").pipe(withDescription$2("Project id or a path inside the project, such as .")),
	message: messageArgument,
	title: String$1("title").pipe(withDescription$1("Thread title. Defaults to the message's first line."), optional),
	provider: String$1("provider").pipe(withDescription$1("Provider instance id. Pass with --model."), optional),
	model: String$1("model").pipe(withDescription$1("Model slug. Defaults to the project's default model."), optional),
	worktree: String$1("worktree").pipe(withDescription$1("Run in a new git worktree based on this branch, tag, or commit, instead of the project folder."), optional),
	branch: String$1("branch").pipe(withDescription$1("Branch name for the new worktree."), optional),
	wait: waitFlag,
	json: jsonFlag$1
}).pipe(withDescription("Start a thread in a project and print its id."), withHandler((flags) => gen(function* () {
	const message = yield* readMessageArgument(flags.message);
	const workspaceStrategy = yield* launchWorkspaceStrategy(flags);
	if (isSome(flags.provider) !== isSome(flags.model)) return yield* new ThreadUsageError({ detail: "--provider and --model go together." });
	const title = yield* decodeTitle(getOrElse(flags.title, () => titleFromMessage(message))).pipe(mapError(() => new ThreadUsageError({ detail: "The title is empty." })));
	yield* withThreadTools(flags, fn("cli.thread.start")(function* (tools) {
		const project = yield* resolveProject(tools, flags.project);
		const launched = yield* tools.call("t3_thread_launch", {
			projectId: project.id,
			title,
			message,
			...workspaceStrategy === void 0 ? {} : { workspaceStrategy },
			...isSome(flags.provider) && isSome(flags.model) ? { modelSelection: {
				instanceId: flags.provider.value,
				model: flags.model.value
			} } : {}
		}, ThreadLaunchResult);
		if (flags.wait && launched.runId !== null) {
			if (!flags.json) yield* error(`Thread ${launched.threadId}`);
			return yield* finishRun(tools, {
				threadId: launched.threadId,
				runId: launched.runId,
				json: flags.json
			});
		}
		yield* flags.json ? printJson(launched) : log(launched.threadId);
	}));
}).pipe(reportThreadErrors)));
const threadSendCommand = make$1("send", {
	...projectLocationFlags,
	thread: threadArgument,
	message: messageArgument,
	wait: waitFlag,
	json: jsonFlag$1
}).pipe(withDescription("Send a message to a thread. A busy thread gets it as its next turn; nothing is interrupted."), withHandler((flags) => gen(function* () {
	const threadId = yield* decodeThreadId(flags.thread);
	const message = yield* readMessageArgument(flags.message);
	yield* withThreadTools(flags, fn("cli.thread.send")(function* (tools) {
		const sent = yield* tools.call("t3_thread_send", {
			threadId,
			message,
			mode: "queue"
		}, OrchestratorMcpThreadSendResult);
		if (flags.wait) return yield* finishRun(tools, {
			threadId,
			runId: sent.runId,
			json: flags.json
		});
		yield* flags.json ? printJson(sent) : log(sent.delivery === "queued" ? "Queued." : "Sent.");
	}));
}).pipe(reportThreadErrors)));
const threadShowCommand = make$1("show", {
	...projectLocationFlags,
	thread: threadArgument,
	messages: Int("messages").pipe(withDescription$1("How many of the latest messages to print."), withDefault(10)),
	json: jsonFlag$1
}).pipe(withDescription("Show a thread's state and its latest messages."), withHandler((flags) => gen(function* () {
	const threadId = yield* decodeThreadId(flags.thread);
	yield* withThreadTools(flags, fn("cli.thread.show")(function* (tools) {
		const { thread, messages: latest } = yield* readLatestMessages(tools, threadId, flags.messages);
		const messages = yield* forEach(latest, (item) => readFullText(tools, threadId, item).pipe(map$3((text) => ({
			role: item.type === "user_message" ? "user" : "assistant",
			runId: item.runId,
			text
		}))));
		if (flags.json) return yield* printJson({
			thread,
			messages
		});
		yield* log(thread.title);
		yield* log([
			thread.threadId,
			thread.status,
			`${thread.providerInstanceId}/${thread.model}`
		].join("  "));
		if (thread.worktreePath !== null) yield* log(`${thread.branch ?? "(no branch)"}  ${thread.worktreePath}`);
		if (thread.pendingRequestCount > 0) yield* log(`Waiting for ${thread.pendingRequestCount} answer(s).`);
		for (const entry of messages) yield* log(`\n[${entry.role}]\n${entry.text}`);
	}));
}).pipe(reportThreadErrors)));
const threadCommand = make$1("thread").pipe(withDescription("Start, message, and read threads on the running server."), withSubcommands([
	threadListCommand,
	threadStartCommand,
	threadSendCommand,
	threadShowCommand
]));
// src/launcherWatch.ts
const DEFAULT_POLL_INTERVAL = seconds(2);
const startupParentPid = process.ppid;
/**
* Any parent change signals launcher loss, including adoption by a Linux subreaper;
* otherwise an orphan backend keeps its ownership lock and blocks replacement launches.
* Skip init-launched backends and Windows, which retains the exited parent's id.
*/
const awaitLauncherLoss = fn("launcherWatch.awaitLauncherLoss")(function* (options) {
	const platform = yield* Platform;
	const launcherPid = options?.launcherPid ?? startupParentPid;
	const getParentPid = options?.getParentPid ?? (() => process.ppid);
	const interval = options?.interval ?? DEFAULT_POLL_INTERVAL;
	if (platform === "win32" || launcherPid <= 1) return yield* never;
	const poll = suspend(() => {
		const parentPid = getParentPid();
		return parentPid === launcherPid ? flatMap$1(sleep(interval), () => poll) : logWarning("desktop launcher is gone; shutting down the backend", {
			launcherPid,
			parentPid
		});
	});
	return yield* poll;
});
// src/cli/automaticPort.ts
const KERNEL_RELEASE_PATH = "/proc/sys/kernel/osrelease";
const WINDOWS_NETSTAT_PATH = String.raw`C:\Windows\System32\netstat.exe`;
const FALLBACK_ATTEMPTS = 8;
/**
* Picks the startup port when none was configured. Under WSL's default NAT networking, Windows
* reaches the server through localhost forwarding, which fails for a port a Windows process
* already listens on even though WSL can bind it.
*/
const make = gen(function* () {
	const net = yield* NetService;
	const fs = yield* FileSystem;
	const processRunner = yield* ProcessRunner;
	const isWsl = fs.readFileString(KERNEL_RELEASE_PATH).pipe(map$3((release) => release.toLowerCase().includes("microsoft")), orElseSucceed(() => false));
	const readWindowsHostListeners = gen(function* () {
		const netstat = yield* processRunner.run({
			command: "wslpath",
			args: ["-u", WINDOWS_NETSTAT_PATH],
			timeout: seconds(5)
		});
		const netstatPath = netstat.stdout.trim();
		if (netstat.code !== null && netstat.code !== 0 || netstatPath.length === 0) return null;
		const listeners = yield* queryWindowsTcpListeners(processRunner, netstatPath);
		if (listeners === null) return null;
		return new Set(listeners.map((listener) => listener.port));
	}).pipe(orElseSucceed(() => null));
	return fn("automaticPort.select")(function* (preferred) {
		if (!(yield* isWsl)) return yield* net.findAvailablePort(preferred);
		const windows = yield* readWindowsHostListeners;
		if (windows === null) {
			yield* logWarning("Could not list Windows TCP listeners from WSL; Windows may be unable to reach the selected port. Pass --port to choose one.");
			return yield* net.findAvailablePort(preferred);
		}
		if (!windows.has(preferred) && (yield* net.isPortAvailableOnLoopback(preferred))) return preferred;
		for (let attempt = 0; attempt < FALLBACK_ATTEMPTS; attempt += 1) {
			const port = yield* net.reserveLoopbackPort();
			if (!windows.has(port)) return port;
		}
		return yield* new UserError({ cause: "Windows is already using every port T3 Code tried. Pass --port or set T3CODE_PORT to a port Windows is not using." });
	});
});
// src/cli/server.ts
const encodeCommand = encodeEffect(fromJsonString(String$6));
function ignoreClosedLauncherPipe(error) {
	if (error.code !== "EPIPE" && error.code !== "ERR_STREAM_DESTROYED") throw error;
}
const runServerCommand = fn("server.runServerCommand")(function* (flags, options) {
	const { runServer } = yield* promise(() => import("./server-suoPy1qn.mjs"));
	const logLevel = yield* LogLevel;
	const selectAutomaticPort = yield* make.pipe(provide$1(layer$1));
	const config = yield* resolveServerConfig(flags, logLevel, {
		...options,
		selectAutomaticPort
	});
	const run = runServer.pipe(provideService(ServerConfig, config), ensuring(runRequestedReclaim(config.dbPath).pipe(provide$1(layer$16))));
	if (config.mode !== "desktop" || config.desktopBootstrapToken === void 0) return yield* run;
	yield* sync(() => {
		process.stdout.on("error", ignoreClosedLauncherPipe);
		process.stderr.on("error", ignoreClosedLauncherPipe);
	});
	return yield* raceFirst(run, awaitLauncherLoss().pipe(andThen(interrupt)));
});
const runDefaultServerCommand = fn("server.runDefaultServerCommand")(function* (flags) {
	if (isSome(flags.cwd)) {
		const cwd = flags.cwd.value.trim();
		const fs = yield* FileSystem;
		const platform = yield* Platform;
		if (!(cwd === "." || cwd === ".." || cwd === "~" || /[/\\]/.test(cwd) || platform === "win32" && /^[a-z]:/i.test(cwd)) && (!(yield* fs.exists(cwd)) || (yield* fs.stat(cwd)).type !== "Directory")) return yield* new UserError({
			cause: cwd,
			userMessage: `Unknown command ${yield* encodeCommand(cwd)}. Use "t3 --help" for commands or an explicit path such as "t3 ./my-project" for a new directory.`
		});
	}
	return yield* runServerCommand(flags, { rejectRunningServer: true });
});
const startCommand = make$1("start", { ...sharedServerCommandFlags }).pipe(withDescription("Same as `t3`."), unlisted, withHandler((flags) => runServerCommand(flags, { rejectRunningServer: true })));
const serveCommand = make$1("serve", { ...sharedServerCommandFlags }).pipe(withShortDescription("Run T3 Code in this terminal, with no browser."), withDescription("Run T3 Code in this terminal without opening a browser, and print pairing details. The background service runs this. To set up access from your other devices, run `t3 up`."), withHandler((flags) => runServerCommand(flags, {
	startupPresentation: "headless",
	forceAutoBootstrapProjectFromCwd: false
})));
// src/cli/updateProgress.ts
function createUpdateProgress(output = process.stderr) {
	const interactive = output.isTTY && process.env.TERM !== "dumb";
	const color = interactive && !process.env.NO_COLOR;
	const style = (code, text) => color ? `\x1b[${code}m${text}\x1b[0m` : text;
	let stage;
	let lastDraw = -Infinity;
	let lineOpen = false;
	let downloadLine = false;
	const finish = () => {
		if (lineOpen) output.write(downloadLine ? "\n" : "\r\x1B[2K");
		lineOpen = false;
	};
	const status = (message) => {
		finish();
		let line = `  ${message}`;
		if (interactive) line = line.slice(0, Math.max(0, (output.columns || 80) - 1));
		output.write(interactive ? `\r\x1b[2K${style(2, line)}` : `${line}\n`);
		lineOpen = Boolean(interactive);
		downloadLine = false;
	};
	return {
		finish,
		status,
		heading(message, detail = "") {
			finish();
			output.write(`  ${style(2, message)}${detail ? ` ${style(1, detail)}` : ""}\n\n`);
		},
		success(message) {
			finish();
			output.write(`  ${style(32, message)}\n\n`);
		},
		report(progress) {
			if (progress.stage !== stage) {
				stage = progress.stage;
				status({
					download: "Downloading...",
					verify: "Verifying the download...",
					extract: "Extracting T3 Code...",
					validate: "Checking the new executable...",
					cached: "Using the downloaded release..."
				}[stage]);
			}
			if (progress.stage !== "download" || !interactive) return;
			const now = performance.now();
			if (now - lastDraw < 100 && progress.received !== progress.total) return;
			lastDraw = now;
			const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
			const { received, total } = progress;
			const columns = output.columns || 80;
			let line = columns >= 32 ? `  ${style(2, "Downloading")}  ${mb(received)} MB` : `  ${mb(received)} MB`.slice(0, Math.max(0, columns - 1));
			if (total !== void 0 && total > 0 && columns >= 9) {
				const percent = Math.min(100, Math.floor(received / total * 100));
				const width = Math.max(1, Math.min(32, columns - 10));
				const filled = Math.floor(percent * width / 100);
				line = `  ${style(94, "■".repeat(filled))}${style(2, "·".repeat(width - filled))} ${String(percent).padStart(3)}%`;
				if (columns >= 68) line += `  ${style(2, `${mb(received)} / ${mb(total)} MB`)}`;
			}
			output.write(`\r\x1b[2K${line}`);
			lineOpen = true;
			downloadLine = true;
		}
	};
}
// src/cli/update.ts
var CliUpdateError = class extends TaggedError()("CliUpdateError", { reason: String$6 }) {
	get message() {
		return this.reason;
	}
};
const ReleaseIndex = ArraySchema(Struct({
	tag_name: String$6,
	draft: optional$3(Boolean$4)
}));
const decodeReleaseIndex = decodeUnknownEffect(fromJsonString(ReleaseIndex));
const RELEASE_INDEX_TIMEOUT = seconds(30);
const RELEASE_INDEX_MAX_PAGES = 10;
const resolveNewestVersion = fn("cli.update.resolve_newest")(function* (channel) {
	const httpClient = yield* HttpClient;
	const environment = yield* Environment;
	const githubToken = environment.GH_TOKEN?.trim() || environment.GITHUB_TOKEN?.trim() || void 0;
	for (let page = 1; page <= RELEASE_INDEX_MAX_PAGES; page += 1) {
		const request = get$1(cliReleaseIndexPageUrl(page)).pipe(setHeader("Accept", "application/vnd.github+json"));
		const authenticatedRequest = githubToken === void 0 ? request : setHeader(request, "Authorization", `Bearer ${githubToken}`);
		const body = yield* httpClient.execute(authenticatedRequest).pipe(flatMap$1(filterStatusOk), flatMap$1((response) => response.text), mapError(() => new CliUpdateError({ reason: "Could not list t3 releases." })), timeoutOrElse({
			duration: RELEASE_INDEX_TIMEOUT,
			orElse: () => fail(new CliUpdateError({ reason: "Timed out listing t3 releases." }))
		}));
		const releases = yield* decodeReleaseIndex(body).pipe(mapError(() => new CliUpdateError({ reason: "The t3 release index had an unexpected shape." })));
		const version = newestCliReleaseVersion(releases, channel);
		if (version !== void 0) return version;
		if (releases.length === 0) break;
	}
	return yield* new CliUpdateError({ reason: `No published ${channel} release was found.` });
});
/** The version an update mirror's feed file for this platform offers on `channel`. */
const resolveMirrorVersion = fn("cli.update.resolve_mirror")(function* (mirror, channel) {
	if (channel === "preview") return yield* new CliUpdateError({ reason: `${mirror.organization}'s update mirror has no preview builds.` });
	const httpClient = yield* HttpClient;
	const fileName = updateFeedFileName(channel === "nightly" ? "nightly" : "latest", yield* Platform, yield* Architecture);
	const url = releaseAssetUrl(mirror.feedUrl, fileName);
	const unreadable = new CliUpdateError({ reason: `Could not read ${fileName} from ${mirror.organization}'s update mirror.` });
	const body = yield* httpClient.get(url).pipe(flatMap$1(filterStatusOk), flatMap$1((response) => response.text), mapError(() => unreadable), timeoutOrElse({
		duration: RELEASE_INDEX_TIMEOUT,
		orElse: () => fail(unreadable)
	}));
	const version = /^version:\s*["']?([^"'\s]+)/m.exec(body)?.[1];
	if (version === void 0 || !isExactServiceVersion(version) || cliReleaseChannelOf(version) !== channel) return yield* unreadable;
	return version;
});
/**
* Only a launcher that already points into this home's `runtime/versions` tree is touched; a
* plain copy of the executable, or a launcher for some other install, is left alone. It is
* recorded before it moves, so prune never meets a repointed launcher it does not know about.
*/
const repointLauncher = fn("cli.update.repoint_launcher")(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const platform = yield* Platform;
	if (input.launchedAs === void 0) return none();
	const versionsDir = pinnedRuntimeVersionsDir(path, input.baseDir);
	const ownsTarget = (candidate) => launcherOwnsVersionsDir(path, versionsDir, candidate);
	const remember = (launcher) => recordPinnedRuntimeLauncher({
		baseDir: input.baseDir,
		launcher
	}).pipe(mapError(() => new CliUpdateError({ reason: `Could not record the t3 launcher at ${launcher}.` })));
	if (platform === "win32") {
		const shimPath = yield* findWindowsShim(input.launchedAs);
		if (shimPath === void 0) return none();
		const current = yield* fs.readFileString(shimPath).pipe(option);
		const quoted = isSome(current) ? windowsShimTarget(current.value) : void 0;
		if (quoted === void 0 || !ownsTarget(quoted)) return none();
		yield* remember(shimPath);
		yield* fs.writeFileString(shimPath, `@echo off\r\n"${input.targetEntryPath}" %*`).pipe(mapError(() => new CliUpdateError({ reason: `Could not rewrite the t3 launcher at ${shimPath}.` })));
		return some(shimPath);
	}
	const linkTarget = yield* fs.readLink(input.launchedAs).pipe(option);
	if (isNone(linkTarget)) return none();
	if (!ownsTarget(path.resolve(path.dirname(input.launchedAs), linkTarget.value))) return none();
	yield* remember(input.launchedAs);
	const tempLink = `${input.launchedAs}.${process.pid}.tmp`;
	yield* fs.symlink(input.targetEntryPath, tempLink).pipe(andThen(fs.rename(tempLink, input.launchedAs)), mapError(() => new CliUpdateError({ reason: `Could not repoint the t3 launcher at ${input.launchedAs}.` })));
	return some(input.launchedAs);
});
/** Node preserves argv0's spelling; resolve bare names on PATH to find the launcher symlink. */
const resolveLauncherPath = gen(function* () {
	const path = yield* Path;
	const fs = yield* FileSystem;
	const invokedAs = yield* InvokedAs;
	const cwd = yield* WorkingDirectory;
	const environment = yield* Environment;
	const platform = yield* Platform;
	if (invokedAs.includes("/") || invokedAs.includes("\\")) return path.resolve(cwd, invokedAs);
	const delimiter = platform === "win32" ? ";" : ":";
	for (const directory of (environment["PATH"] ?? "").split(delimiter)) {
		if (directory.length === 0) continue;
		const candidate = path.join(directory, invokedAs);
		if (yield* fs.exists(candidate).pipe(orElseSucceed(() => false))) return candidate;
	}
});
/** Windows executables see their own path, so find the installer shim by matching t3.cmd targets on PATH. */
const findWindowsShim = fn("cli.update.find_windows_shim")(function* (executablePath) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const environment = yield* Environment;
	const candidates = [...environment["T3CODE_INSTALL_BIN_DIR"] ? [environment["T3CODE_INSTALL_BIN_DIR"]] : [], ...(environment["PATH"] ?? environment["Path"] ?? "").split(";")].filter((entry) => entry.trim().length > 0);
	for (const directory of candidates) {
		const shimPath = path.join(directory, "t3.cmd");
		const contents = yield* fs.readFileString(shimPath).pipe(option);
		if (isNone(contents)) continue;
		const target = windowsShimTarget(contents.value);
		if (target !== void 0 && path.resolve(target).toLowerCase() === path.resolve(executablePath).toLowerCase()) return shimPath;
	}
});
const updateFlags = {
	...projectLocationFlags,
	channel: Literals("channel", CLI_RELEASE_CHANNELS).pipe(withDescription$1("Release channel to follow. Defaults to the channel this t3 was published on."), optional),
	allowDowngrade: Boolean$1("allow-downgrade").pipe(withDescription$1("Allow moving to an older version than the one running."), withDefault(false)),
	yes: Boolean$1("yes").pipe(withAlias("y"), withDescription$1("Restart the background service without asking. Required to restart it from a script, where there is no prompt."), withDefault(false))
};
const versionArgument = String$2("version").pipe(withDescription$2("Exact version to install. Defaults to the newest release on the channel."), optional$1);
const updateCommand = make$1("update", {
	...updateFlags,
	version: versionArgument
}).pipe(withDescription("Download a newer t3 and switch this machine to it, including the background service when one is installed."), withHandler((flags) => gen(function* () {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	return yield* runUpdate({
		baseDir: config.baseDir,
		logsDir: config.logsDir,
		serverRuntimeStatePath: config.serverRuntimeStatePath,
		channel: getOrUndefined(flags.channel),
		requestedVersion: getOrUndefined(flags.version),
		allowDowngrade: flags.allowDowngrade,
		assumeYes: flags.yes
	}).pipe(provide$1(mergeAll(layer(config), layer$1, layer$2, layer$4)));
})));
const findForegroundServer = fn("cli.update.find_foreground_server")(function* (input) {
	const state = yield* readPersistedServerRuntimeState(input.serverRuntimeStatePath);
	if (isNone(state) || state.value.serviceManaged || !isProcessAlive(state.value.pid)) return;
	if (input.serviceInstalled && (yield* belongsToBootService(state.value.pid))) return void 0;
	return state.value;
});
const belongsToBootService = fn("cli.update.belongs_to_boot_service")(function* (pid) {
	const platform = yield* Platform;
	const fs = yield* FileSystem;
	const runner = yield* ProcessRunner;
	if (platform === "linux") {
		const cgroup = yield* fs.readFileString(`/proc/${pid}/cgroup`).pipe(option);
		return isSome(cgroup) && cgroup.value.includes("/t3code.service");
	}
	if (platform === "darwin") {
		const parent = yield* runner.run({
			command: "ps",
			args: [
				"-o",
				"ppid=",
				"-p",
				String(pid)
			],
			timeout: seconds(5)
		}).pipe(option);
		const ppid = isSome(parent) && parent.value.code === 0 ? parent.value.stdout.trim() : "";
		if (!/^\d+$/.test(ppid)) return false;
		const command = yield* runner.run({
			command: "ps",
			args: [
				"-o",
				"command=",
				"-p",
				ppid
			],
			timeout: seconds(5)
		}).pipe(map$3((result) => result.code === 0 ? result.stdout : ""), orElseSucceed(() => ""));
		return /__service-launcher/.test(command);
	}
	return false;
});
const runUpdate = fn("cli.update.run")(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const runner = yield* ProcessRunner;
	const platform = yield* Platform;
	const arch = yield* Architecture;
	const environment = yield* Environment;
	const httpClient = yield* HttpClient;
	const service = yield* BootService;
	const policy = yield* ManagedPolicy;
	const mirror = managedUpdateMirror(policy.document);
	const currentVersion = version;
	const channel = input.channel ?? cliReleaseChannelOf(currentVersion);
	const refusal = managedUpdateRefusal(policy.document, input.requestedVersion === void 0 ? channel : cliReleaseChannelOf(input.requestedVersion));
	if (refusal !== void 0) return yield* new CliUpdateError({ reason: refusal });
	if (input.requestedVersion !== void 0 && !isExactServiceVersion(input.requestedVersion)) return yield* new CliUpdateError({ reason: `'${input.requestedVersion}' is not an exact t3 version.` });
	const progress = createUpdateProgress();
	progress.status("Checking for updates...");
	const targetVersion = yield* (input.requestedVersion !== void 0 ? succeed$1(input.requestedVersion) : mirror === void 0 ? resolveNewestVersion(channel) : resolveMirrorVersion(mirror, channel)).pipe(ensuring(sync(progress.finish)));
	const targetChannel = cliReleaseChannelOf(targetVersion);
	const currentChannel = cliReleaseChannelOf(currentVersion);
	if (targetChannel === "preview" && currentChannel !== "preview") {
		yield* log([
			`t3@${targetVersion} is a preview build.`,
			"  Preview builds are cut by maintainers from unreleased branches to exercise the release",
			"  pipeline. They can be broken, receive no fixes, and are never offered as updates; you",
			`  will have to switch back to ${currentChannel} yourself with \`t3 update --channel ${currentChannel} --allow-downgrade\`.`
		].join("\n"));
		if (!(process.stdin.isTTY && process.stdout.isTTY)) return yield* new CliUpdateError({ reason: "Refusing to install a preview build without confirmation. Run this from a terminal to confirm, or pass --channel preview from an interactive shell." });
		if (!(yield* run$3(Confirm({
			message: "Install the preview build anyway?",
			initial: false
		})).pipe(catchTags({ QuitError: () => succeed$1(false) })))) {
			yield* log("Left as is.");
			return;
		}
	}
	const status = yield* service.status;
	const servesThisHome = status.installedBaseDir !== void 0 && path.resolve(status.installedBaseDir) === path.resolve(input.baseDir);
	const serviceInstalled = status.supported && status.installed && servesThisHome;
	const foreground = yield* findForegroundServer({
		serverRuntimeStatePath: input.serverRuntimeStatePath,
		serviceInstalled
	});
	const serviceVersion = serviceInstalled ? status.installedVersion : void 0;
	const executableCurrent = targetVersion === currentVersion;
	const restartPending = status.problems?.includes("restart-pending") === true;
	const serviceCurrent = !serviceInstalled || serviceVersion === targetVersion && (executableCurrent ? status.current : (status.problems ?? []).length === 0);
	const newestInstalled = serviceVersion !== void 0 && compareExactServiceVersions(serviceVersion, currentVersion) > 0 ? serviceVersion : currentVersion;
	if (executableCurrent && serviceCurrent) {
		yield* log(serviceVersion !== void 0 ? `t3 and its background service are already on ${targetVersion} (${targetChannel}).` : `t3 is already on ${targetVersion} (${targetChannel}).`);
		return;
	}
	if (!input.allowDowngrade && compareExactServiceVersions(targetVersion, newestInstalled) < 0) return yield* new CliUpdateError({ reason: `t3@${targetVersion} is older than the installed ${newestInstalled}. Pass --allow-downgrade to install it anyway.` });
	const alreadyOnDisk = yield* fs.readFileString(pinnedRuntimePaths(path, input.baseDir, targetVersion, platform).sentinelPath).pipe(map$3((sentinel) => sentinel.trim() === targetVersion), orElseSucceed(() => false));
	progress.heading(executableCurrent && restartPending ? `The background service is still running the version before ${targetVersion} (${targetChannel}).` : executableCurrent ? `Updating the background service ${serviceVersion ?? "(unknown version)"} -> ${targetVersion} (${targetChannel}).` : alreadyOnDisk ? "Switching T3 Code" : "Updating T3 Code", executableCurrent ? "" : `${currentVersion} → ${targetVersion}${targetChannel === "stable" ? "" : ` (${targetChannel})`}`);
	let restartService = false;
	if (serviceInstalled && !serviceCurrent) {
		yield* log("  A background service is installed for this T3 home. Restarting it interrupts anything running in it: agent turns, terminals, remote clients.");
		if (input.assumeYes) restartService = true;
		else if (process.stdin.isTTY && process.stdout.isTTY) restartService = yield* run$3(Confirm({
			message: "Restart the background service once the download is verified?",
			initial: true
		})).pipe(catchTags({ QuitError: () => succeed$1(false) }));
		else yield* log("  Not a terminal, so the service keeps running its current version. Rerun with --yes to restart it now, or run `t3 service restart` later.");
	}
	const runtime = yield* ensurePinnedRuntimeInstalled({
		onProgress: progress.report,
		baseDir: input.baseDir,
		version: targetVersion,
		fs,
		path,
		runner,
		httpClient,
		platform,
		arch,
		releaseBaseUrl: mirror?.feedUrl ?? (environment["T3CODE_RELEASE_BASE_URL"]?.trim() || void 0),
		requirePublishedRelease: mirror !== void 0,
		validate: (paths) => runner.run({
			command: pinnedRuntimeCommand(paths).command,
			args: [...pinnedRuntimeCommand(paths).args, "--version"],
			timeout: seconds(30)
		}).pipe(mapError((cause) => new PinnedRuntimeInstallError({
			step: "verifying the downloaded t3",
			cause
		})), flatMap$1((result) => result.code === 0 && /\bv(\S+)\s*$/.exec(result.stdout)?.[1] === targetVersion ? void_ : fail(new PinnedRuntimeInstallError({
			step: "verifying the downloaded t3",
			exitCode: Number(result.code)
		}))))
	}).pipe(ensuring(sync(progress.finish)), catchIf(isUnpublishedRelease, () => fail(new CliUpdateError({ reason: mirror === void 0 ? `No release archive was published for t3@${targetVersion}.` : `${mirror.organization}'s update mirror has no t3@${targetVersion} for this machine.` }))));
	const launchedAs = (yield* IsExecutable) ? yield* resolveLauncherPath : void 0;
	const repointed = yield* repointLauncher({
		launchedAs,
		baseDir: input.baseDir,
		targetEntryPath: runtime.entryPath
	});
	let servicePlan;
	if (serviceInstalled && !serviceCurrent) {
		yield* log(restartService ? "Restarting the background service..." : "Updating the background service...");
		servicePlan = yield* BootService.pipe(flatMap$1((target) => target.install({
			allowDowngrade: input.allowDowngrade,
			start: restartService
		})), provide$1(layer$15({
			baseDir: input.baseDir,
			logsDir: input.logsDir,
			cliVersion: targetVersion
		})), mapError((error) => new CliUpdateError({ reason: `t3@${targetVersion} is installed but the background service could not be ${restartService ? "updated" : "pointed at it"}: ${error.message}` })));
	}
	if (servicePlan?.handedOff !== true) {
		const unit = yield* fs.readFileString(status.unitPath).pipe(option);
		yield* prunePinnedRuntimes({
			baseDir: input.baseDir,
			keep: [currentVersion, targetVersion],
			references: toArray(flatMapNullishOr(unit, bootServiceProgramOf))
		});
	}
	progress.success(`Installed T3 Code ${targetVersion}`);
	if (isSome(repointed)) yield* log("  Run t3 to get started.\n");
	else yield* log(`  Run ${runtime.entryPath}\n`);
	if (servicePlan?.handedOff === true) yield* log(`  Background service switching to ${targetVersion} from a separate systemd unit, since this session runs inside it and disconnects when it restarts. Result: ${servicePlan.logPath}`);
	else if (servicePlan !== void 0 && restartService) yield* log(`  Background service restarted on ${targetVersion}`);
	else if (serviceInstalled && serviceCurrent) yield* log(`  Background service already on ${targetVersion}`);
	else if (serviceInstalled) {
		const running = serviceVersion === void 0 ? "an unknown version" : restartPending ? `the version before ${serviceVersion}` : serviceVersion;
		yield* log(`  Background service still running ${running}. Run \`t3 service restart\` when you are ready to switch it to ${targetVersion}.`);
	} else if (status.installed && !servesThisHome) yield* log(`  The background service serves ${status.installedBaseDir ?? "another T3 home"} and was left unchanged.`);
	if (foreground !== void 0) yield* log(`  A server started by hand is still running at ${foreground.origin} (pid ${foreground.pid}). Stop it and start it again to pick up ${targetVersion}.`);
});
// src/cli/install.ts
var CliInstallError = class extends TaggedError()("CliInstallError", {
	reason: String$6,
	cause: optional$3(Defect())
}) {
	get message() {
		return this.reason;
	}
};
/** `<T3 home>/runtime/versions/<version>/t3`: the layout the install scripts and npm launcher share. */
const standaloneRuntime = gen(function* () {
	const path = yield* Path;
	if (!(yield* IsExecutable)) return none();
	const executable = yield* ExecutablePath;
	const versionsDir = path.dirname(path.dirname(executable));
	const runtimeDir = path.dirname(versionsDir);
	if (path.basename(versionsDir) !== "versions" || path.basename(runtimeDir) !== "runtime") return none();
	return some({
		executable,
		versionsDir,
		runtimeDir
	});
});
/** Links this runtime as the `t3` command the way the install scripts do, replacing only our own link. */
const installCli = fn("cli.install.install")(function* () {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const platform = yield* Platform;
	const environment = yield* Environment;
	const home = yield* HomeDirectory;
	const runtime = yield* standaloneRuntime;
	const windows = platform === "win32";
	if (isNone(runtime)) return yield* new CliInstallError({ reason: `Only the standalone t3 can install itself. Use \`${windows ? "irm https://t3.codes/install.ps1 | iex" : "curl -fsSL https://t3.codes/install.sh | sh"}\`, or Settings in the desktop app.` });
	const { executable, versionsDir, runtimeDir } = runtime.value;
	if (windows && /[%\u0080-\uffff]/.test(executable)) return yield* new CliInstallError({ reason: `A t3.cmd cannot run ${executable}, because the path has % or non-ASCII characters. Keep using npx t3.` });
	const binDir = path.resolve(environment.T3CODE_INSTALL_BIN_DIR?.trim() || path.join(home, ".local", "bin"));
	const name = windows ? "t3.cmd" : "t3";
	const link = path.join(binDir, name);
	const failed = (reason) => (cause) => new CliInstallError({
		reason,
		cause
	});
	const realVersionsDir = yield* fs.realPath(versionsDir).pipe(orElseSucceed(() => versionsDir));
	const current = windows ? yield* fs.readFileString(link).pipe(map$3(generatedWindowsShimTarget), option) : yield* fs.readLink(link).pipe(flatMap$1((target) => fs.realPath(link).pipe(orElseSucceed(() => path.resolve(binDir, target)))), option);
	const occupied = isSome(current) || (yield* fs.exists(link)) || isSome(yield* fs.readLink(link).pipe(option));
	if (occupied && !(isSome(current) && current.value !== void 0 && (isVersionExecutable(path, versionsDir, current.value) || isVersionExecutable(path, realVersionsDir, current.value) || current.value === path.join(path.dirname(runtimeDir), "bin", name)))) return yield* new CliInstallError({ reason: `Another t3 is already at ${link}. Remove it, then run this again.` });
	yield* fs.makeDirectory(binDir, { recursive: true }).pipe(mapError(failed(`Could not create ${binDir}.`)));
	if (windows) yield* fs.writeFileString(link, `@echo off\r\n"${executable}" %*`, occupied ? {} : { flag: "wx" }).pipe(mapError(failed(`Could not write ${link}.`)));
	else if (!occupied) yield* fs.symlink(executable, link).pipe(mapError(failed(`Could not link ${link}.`)));
	else {
		const staging = `${link}.${process.pid}.tmp`;
		yield* fs.symlink(executable, staging).pipe(andThen(fs.rename(staging, link).pipe(tapError(() => fs.remove(staging, { force: true }).pipe(ignore)))), mapError(failed(`Could not link ${link}.`)));
	}
	const recorded = path.join(yield* fs.realPath(binDir).pipe(orElseSucceed(() => binDir)), name);
	yield* recordPinnedRuntimeLauncher({
		baseDir: path.dirname(runtimeDir),
		launcher: recorded
	}).pipe(catch_(() => error(`Warning: could not record ${recorded} in ${path.join(runtimeDir, "launchers")}. Cleanup may remove the version it runs.`)));
	const normalize = (value) => windows ? path.resolve(value).toLowerCase() : path.resolve(value);
	const same = (entry) => entry !== "" && normalize(entry) === normalize(binDir);
	const entries = (environment.PATH ?? environment.Path ?? "").split(windows ? ";" : ":");
	const onPath = entries.some(same);
	const shadowedBy = yield* gen(function* () {
		for (const entry of entries) {
			if (same(entry)) return void 0;
			if (!path.isAbsolute(entry) || detectCliRunner(`${entry}/`) !== null) continue;
			for (const name of windows ? ["t3.cmd", "t3.exe"] : ["t3"]) {
				const candidate = path.join(entry, name);
				if (yield* fs.exists(candidate).pipe(orElseSucceed(() => false))) return candidate;
			}
		}
	});
	return {
		link,
		onPath: onPath && shadowedBy === void 0,
		shadowedBy,
		pathCommand: onPath || shadowedBy !== void 0 ? void 0 : windows ? binDir.includes(";") ? void 0 : `$env:Path += ';${binDir.replaceAll("'", "''")}'` : pathSetupCommand({
			directory: binDir,
			home,
			shell: environment.SHELL,
			platform,
			configHome: environment.XDG_CONFIG_HOME,
			zdotdir: environment.ZDOTDIR
		}),
		binDir
	};
});
const reportInstalled = fn("cli.install.report")(function* (installed) {
	yield* log(`Installed t3 ${version} at ${installed.link}.`);
	if (installed.shadowedBy !== void 0) return yield* log(`Another t3 at ${installed.shadowedBy} runs first, so run ${installed.link} to use this one.`);
	if (installed.onPath) return yield* log("Run `t3` to get started.");
	if (installed.pathCommand === void 0) return yield* log(`Add ${installed.binDir} to your PATH, then run \`t3\`.`);
	if ((yield* Platform) === "win32") {
		yield* log(`${installed.binDir} is not on your PATH yet. In this PowerShell window, run:`);
		yield* log(`  ${installed.pathCommand}`);
		return yield* log("Then run `t3`. For new windows, add the folder to your PATH.");
	}
	yield* log(`${installed.binDir} is not on your PATH yet. Add it with:`);
	yield* log(`  ${installed.pathCommand}`);
	yield* log("Then open a new terminal and run `t3`.");
});
const installCommand = make$1("install").pipe(withDescription("Install this version as the `t3` command."), withHandler(() => installCli().pipe(flatMap$1(reportInstalled))));
/** Saying no lasts until the next minor release: `0.2` covers `0.2.5` and `0.2.6-nightly.…`. */
const minorRelease = (version) => version.split(".").slice(0, 2).join(".");
const SKIPPED_ARGUMENTS = /* @__PURE__ */ new Set([
	"help",
	"--help",
	"-h",
	"--version",
	"-v",
	"--completions",
	"--json",
	"--yes",
	"-y"
]);
/** The subcommand, past global flags that may come first (two take a value). */
const topLevelCommand = (args) => {
	for (let index = 0; index < args.length; index++) {
		const arg = args[index];
		if (arg === "--log-level" || arg === "--completions") index++;
		else if (!arg.startsWith("-")) return arg;
	}
};
/** Agents can run commands in a terminal that nobody answers; no answer counts as no. */
const PROMPT_TIMEOUT = seconds(30);
/** `/proc/<pid>/stat` fields after the parenthesized command name: state ppid pgrp session tty_nr tpgid. */
const isForegroundProcStat = (stat) => {
	const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
	return fields[2] !== void 0 && fields[2] !== "" && fields[2] === fields[5];
};
/** Output of `ps -o tpgid=,pgid=`; tpgid is -1 without a controlling terminal. */
const isForegroundPs = (output) => {
	const [tpgid, pgid] = output.trim().split(/\s+/);
	return tpgid !== void 0 && tpgid !== "" && tpgid === pgid;
};
/**
* A background job (`npx t3 serve &`) that reads the terminal is stopped by the shell, so only
* the terminal's foreground process group may prompt. Unknown counts as background.
*/
const inTerminalForeground = gen(function* () {
	const fs = yield* FileSystem;
	const platform = yield* Platform;
	if (platform === "win32") return true;
	if (platform === "linux") return isForegroundProcStat(yield* fs.readFileString("/proc/self/stat").pipe(orElseSucceed(() => "")));
	const spawner = yield* ChildProcessSpawner;
	return isForegroundPs(yield* spawner.string(make$5("/bin/ps", [
		"-o",
		"tpgid=,pgid=",
		"-p",
		String(process.pid)
	], {
		stdin: "ignore",
		stderr: "ignore"
	})).pipe(orElseSucceed(() => "")));
});
/**
* Before a command run through npx, pnpm dlx, or bunx at a terminal, asks to install the `t3`
* command. Yes is the default. No, no answer, or a failed install is saved in the T3 home until
* the next minor release. Returns false when the user quits the prompt, so the command does not run.
*/
const offerCliInstall = fn("cli.install.offer")(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const platform = yield* Platform;
	const environment = yield* Environment;
	if (!input.interactive || environment.CI || environment.SUDO_USER) return true;
	if (environment.TERM === "dumb") return true;
	if (environment.npm_config_yes === "true") return true;
	if (input.args.some((arg) => SKIPPED_ARGUMENTS.has(arg.split("=")[0]))) return true;
	const command = topLevelCommand(input.args);
	if (command === "install" || command === "uninstall") return true;
	if (detectCliRunner(yield* resolveEntryPath) === null) return true;
	const runtime = yield* standaloneRuntime;
	if (isNone(runtime)) return true;
	const { runtimeDir } = runtime.value;
	const windows = platform === "win32";
	const names = windows ? ["t3.cmd", "t3.exe"] : ["t3"];
	const candidates = [
		...(yield* fs.readFileString(path.join(runtimeDir, "launchers")).pipe(orElseSucceed(() => ""))).split(/\r?\n/).filter(Boolean),
		path.join(path.dirname(runtimeDir), "bin", windows ? "t3.cmd" : "t3"),
		...(environment.PATH ?? environment.Path ?? "").split(windows ? ";" : ":").filter((directory) => path.isAbsolute(directory) && detectCliRunner(`${directory}/`) === null).flatMap((directory) => names.map((name) => path.join(directory, name)))
	];
	for (const candidate of candidates) if (yield* fs.exists(candidate).pipe(orElseSucceed(() => false))) return true;
	const declinedFile = path.join(runtimeDir, "install-prompt-declined");
	const declined = yield* fs.readFileString(declinedFile).pipe(orElseSucceed(() => ""));
	const minor = minorRelease(version);
	if (declined.trim() === minor) return true;
	if (!(yield* input.foreground)) return true;
	const installHint = `Run \`${yield* resolveCliCommand("install")}\` any time.`;
	const saveDecline = fs.writeFileString(declinedFile, `${minor}\n`).pipe(ignore);
	const answer = yield* input.confirm.pipe(timeoutOption(PROMPT_TIMEOUT));
	if (isNone(answer)) {
		yield* saveDecline;
		yield* log(`\nNo answer, so t3 was not installed. ${installHint}\n`);
		return true;
	}
	if (answer.value === void 0) return false;
	if (!answer.value) {
		yield* saveDecline;
		yield* log(`Skipped. ${installHint}\n`);
		return true;
	}
	yield* installCli().pipe(flatMap$1(reportInstalled), catch_((error$1) => andThen(saveDecline, error(`Could not install t3: ${error$1.message}`))));
	yield* log("");
	return true;
});
const confirmCliInstall = run$3(Confirm({
	message: "Install the t3 command? Then you can run `t3` directly.",
	initial: true
})).pipe(catchTags({ QuitError: () => void_ }));
// src/cli/uninstall.ts
var CliUninstallError = class extends TaggedError()("CliUninstallError", { reason: String$6 }) {
	get message() {
		return this.reason;
	}
};
/** Delete only launchers targeting this home's runtime/versions. */
const findOwnedLauncher = fn("cli.uninstall.find_launcher")(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const platform = yield* Platform;
	if (input.launchedAs === void 0) return void 0;
	if (platform === "win32") {
		const shimPath = yield* findWindowsShim(input.launchedAs);
		if (shimPath === void 0) return void 0;
		const contents = yield* fs.readFileString(shimPath).pipe(option);
		const target = isSome(contents) ? generatedWindowsShimTarget(contents.value) : void 0;
		return target !== void 0 && isVersionExecutable(path, input.versionsDir, target) ? shimPath : void 0;
	}
	const linkTarget = yield* fs.readLink(input.launchedAs).pipe(option);
	if (isNone(linkTarget)) return void 0;
	const resolved = path.resolve(path.dirname(input.launchedAs), linkTarget.value);
	return isVersionExecutable(path, input.versionsDir, resolved) ? input.launchedAs : void 0;
});
/** Whether `launcher` is a link or unedited `t3.cmd` into this home's runtime/versions. */
const ownsLauncher = fn("cli.uninstall.owns_launcher")(function* (launcher, versionsDir) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const platform = yield* Platform;
	const realVersionsDir = yield* fs.realPath(versionsDir).pipe(orElseSucceed(() => versionsDir));
	return (platform === "win32" ? [yield* fs.readFileString(launcher).pipe(map$3(generatedWindowsShimTarget), orElseSucceed(() => void 0))] : [yield* fs.readLink(launcher).pipe(map$3((link) => path.resolve(path.dirname(launcher), link)), orElseSucceed(() => void 0)), yield* fs.realPath(launcher).pipe(orElseSucceed(() => void 0))]).some((target) => target !== void 0 && (isVersionExecutable(path, versionsDir, target) || isVersionExecutable(path, realVersionsDir, target)));
});
/**
* Launchers recorded in `runtime/launchers` by the install scripts and `t3 install` that still
* point into this home's runtime/versions. npx can run a different version than the installed
* one, so the launcher this process started from does not always name them.
*/
const findRecordedLaunchers = fn("cli.uninstall.find_recorded_launchers")(function* (versionsDir) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const recorded = yield* fs.readFileString(path.join(path.dirname(versionsDir), "launchers")).pipe(orElseSucceed(() => ""));
	const owned = [];
	for (const launcher of recorded.split(/\r?\n/).filter(Boolean)) if (yield* ownsLauncher(launcher, versionsDir)) owned.push(launcher);
	return owned;
});
function spawnWindowsRemoval(comspec, dir) {
	return NodeChildProcess.spawn(comspec, [
		"/d",
		"/v:off",
		"/s",
		"/c",
		"\"ping -n 3 127.0.0.1 >nul & rmdir /s /q \"%T3_UNINSTALL_RUNTIME%\"\""
	], {
		env: {
			...process.env,
			T3_UNINSTALL_RUNTIME: dir
		},
		windowsVerbatimArguments: true,
		detached: true,
		stdio: "ignore",
		windowsHide: true
	});
}
const planUninstall = fn("cli.uninstall.plan")(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const status = yield* (yield* BootService).status;
	const servesThisHome = status.installedBaseDir !== void 0 && path.resolve(status.installedBaseDir) === path.resolve(input.baseDir);
	const versionsDir = pinnedRuntimeVersionsDir(path, input.baseDir);
	const runtimeDir = path.dirname(versionsDir);
	const launchedAs = (yield* IsExecutable) ? yield* resolveLauncherPath : void 0;
	const launchedFrom = yield* findOwnedLauncher({
		launchedAs,
		versionsDir
	});
	return {
		service: status.supported && status.installed && servesThisHome,
		versionsDir,
		launchers: [.../* @__PURE__ */ new Set([...launchedFrom === void 0 ? [] : [launchedFrom], ...yield* findRecordedLaunchers(versionsDir)])],
		runtimeDir: (yield* fs.exists(runtimeDir).pipe(orElseSucceed(() => false))) ? runtimeDir : void 0,
		userdataDir: path.join(input.baseDir, "userdata")
	};
});
const uninstallCommand = make$1("uninstall", {
	...projectLocationFlags,
	yes: Boolean$1("yes").pipe(withAlias("y"), withDescription$1("Remove everything without asking. Required from a script, where there is no prompt."), withDefault(false))
}).pipe(withDescription("Remove t3 from this machine: the background service, the launcher, and every downloaded version. Your projects and threads are kept."), withHandler((flags) => gen(function* () {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel);
	return yield* runUninstall({
		baseDir: config.baseDir,
		assumeYes: flags.yes
	}).pipe(provide$1(layer(config)));
})));
const runUninstall = fn("cli.uninstall.run")(function* (input) {
	const fs = yield* FileSystem;
	const platform = yield* Platform;
	const environment = yield* Environment;
	const service = yield* BootService;
	const plan = yield* planUninstall({ baseDir: input.baseDir });
	if (!plan.service && plan.launchers.length === 0 && plan.runtimeDir === void 0) {
		yield* log(`Nothing to remove: t3 is not installed for ${input.baseDir}.`);
		if (!(yield* IsExecutable)) yield* log("  This t3 runs from a Node script, so it was installed by npm or built from source. Remove it the same way (`npm uninstall -g t3`, or delete the checkout).");
		return;
	}
	yield* log("This will remove:");
	if (plan.service) yield* log("  the background service (stopping it first)");
	for (const launcher of plan.launchers) yield* log(`  the launcher at ${launcher}`);
	if (plan.runtimeDir !== void 0) yield* log(`  every downloaded version under ${plan.runtimeDir}`);
	yield* log(`Your projects, threads, and settings under ${plan.userdataDir} are kept. Delete that directory yourself if you want them gone too.`);
	if (!input.assumeYes) {
		if (!(process.stdin.isTTY && process.stdout.isTTY)) return yield* new CliUninstallError({ reason: "Not a terminal, so nothing was removed. Rerun with --yes to confirm from a script." });
		if (!(yield* run$3(Confirm({
			message: "Remove t3 from this machine?",
			initial: false
		})).pipe(catchTags({ QuitError: () => succeed$1(false) })))) {
			yield* log("Left as is.");
			return;
		}
	}
	if (plan.service) {
		yield* service.uninstall;
		yield* log("Removed the background service.");
	}
	for (const launcher of plan.launchers) {
		if (!(yield* ownsLauncher(launcher, plan.versionsDir))) {
			yield* log(`Left ${launcher}: it no longer runs this t3.`);
			continue;
		}
		yield* fs.remove(launcher, { force: true }).pipe(mapError(() => new CliUninstallError({ reason: `Could not remove the launcher at ${launcher}.` })));
		yield* log(`Removed ${launcher}.`);
	}
	if (plan.runtimeDir !== void 0) {
		if (platform === "win32") {
			const runtimeDir = plan.runtimeDir;
			const comspec = environment["ComSpec"] ?? environment["COMSPEC"] ?? "cmd.exe";
			yield* try_({
				try: () => spawnWindowsRemoval(comspec, runtimeDir).unref(),
				catch: () => new CliUninstallError({ reason: `Could not schedule removal of ${runtimeDir}. Delete it yourself once this window is closed.` })
			});
			yield* log(`${runtimeDir} will be removed once t3 exits.`);
		} else {
			yield* fs.remove(plan.runtimeDir, {
				recursive: true,
				force: true
			}).pipe(mapError(() => new CliUninstallError({ reason: `Could not remove ${plan.runtimeDir}.` })));
			yield* log(`Removed ${plan.runtimeDir}.`);
		}
	}
	yield* log("");
	yield* log("t3 is uninstalled. Thanks for trying T3 Code.");
});
// src/cli/speechWorker.ts
const speechWorkerCommand = make$1("__speech-worker", {
	mode: Literals$1("mode", ["discover", "model"]),
	moduleUrl: String$2("module-url").pipe(optional$1)
}).pipe(unlisted, withHandler(({ mode, moduleUrl }) => promise(() => runNativeSpeechWorker(mode, moduleUrl._tag === "Some" ? moduleUrl.value : void 0))));
// src/cli/claudeHistory.ts
/** Single-executable builds lack Node, so they use this subcommand instead of claudeHistoryWorker.mjs. */
const claudeHistoryCommand = make$1("__claude-history", {
	method: String$2("method"),
	sessionId: String$2("session-id"),
	options: String$2("options").pipe(optional$1)
}).pipe(unlisted, withHandler(({ method, sessionId, options }) => promise(() => import("./claudeHistoryWorker-D0Wcf2VJ.mjs")).pipe(flatMap$1(({ runClaudeHistoryWorker }) => promise(() => runClaudeHistoryWorker(method, sessionId, options._tag === "Some" ? options.value : void 0))))));
// src/cli/sshHelper.ts
const canBind = (port) => new Promise((resolve) => {
	const server = NodeNet.createServer();
	server.unref();
	server.once("error", () => resolve(false));
	server.listen(port, "127.0.0.1", () => {
		server.close((error) => resolve(!error));
	});
});
const answersOnLoopback = (port) => new Promise((resolve) => {
	const socket = NodeNet.connect({
		port,
		host: "127.0.0.1"
	});
	socket.setTimeout(1e3);
	socket.once("connect", () => {
		socket.destroy();
		resolve(true);
	});
	socket.once("timeout", () => {
		socket.destroy();
		resolve(true);
	});
	socket.once("error", () => resolve(false));
});
const pickPort = make$1("pick-port", {
	portFile: String$2("port-file"),
	defaultPort: Int$1("default-port"),
	scanWindow: Int$1("scan-window")
}).pipe(withHandler(({ portFile, defaultPort, scanWindow }) => promise(async () => {
	const raw = NodeFS.existsSync(portFile) ? NodeFS.readFileSync(portFile, "utf8").trim() : "";
	const preferred = Number.parseInt(raw, 10);
	const start = Number.isInteger(preferred) ? preferred : defaultPort;
	for (let port = start; port < start + scanWindow; port += 1) if (await canBind(port) && !await answersOnLoopback(port)) {
		process.stdout.write(String(port));
		return;
	}
	process.exitCode = 1;
})));
const probe = (port, probeTimeoutMs) => new Promise((resolve) => {
	const request = NodeHttp.get({
		hostname: "127.0.0.1",
		port,
		path: "/",
		timeout: probeTimeoutMs
	}, (response) => {
		response.resume();
		response.once("end", () => {
			const status = response.statusCode ?? 0;
			resolve(status >= 200 && status < 300);
		});
	});
	request.once("timeout", () => {
		request.destroy();
		resolve(false);
	});
	request.once("error", () => resolve(false));
});
const waitReady = make$1("wait-ready", {
	port: Int$1("port"),
	timeoutMs: Int$1("timeout-ms"),
	probeTimeoutMs: Int$1("probe-timeout-ms")
}).pipe(withHandler(({ port, timeoutMs, probeTimeoutMs }) => promise(async () => {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (await probe(port, probeTimeoutMs)) return;
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	process.exitCode = 1;
})));
/** Prints `<pid> <port>` for a live default-home server, or exits 1. */
const runtimePort = make$1("runtime-port", { runtimeFile: String$2("runtime-file") }).pipe(withHandler(({ runtimeFile }) => sync(() => {
	try {
		const runtime = JSON.parse(NodeFS.readFileSync(runtimeFile, "utf8"));
		const pid = Number(runtime.pid);
		const port = Number(runtime.port);
		if (!Number.isInteger(pid) || pid <= 0 || !Number.isInteger(port)) {
			process.exitCode = 1;
			return;
		}
		const origin = new URL(String(runtime.origin ?? ""));
		if (origin.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(origin.hostname)) {
			process.exitCode = 1;
			return;
		}
		process.kill(pid, 0);
		process.stdout.write(`${pid} ${port}`);
	} catch {
		process.exitCode = 1;
	}
})));
const sshHelperCommand = make$1("__ssh-helper").pipe(unlisted, withSubcommands([
	pickPort,
	waitReady,
	runtimePort
]));
// src/cli/servicePreflight.ts
const servicePreflightCommand = make$1("__service-preflight", {
	databasePath: String$1("database-path"),
	launcherProtocol: Int("launcher-protocol")
}).pipe(unlisted, withHandler(({ databasePath, launcherProtocol }) => log(JSON.stringify(runServicePreflight({
	databasePath,
	launcherProtocol
}))).pipe(asVoid)));
// src/cli/theme.ts
const SparseSettings = Record(String$6, Unknown);
const decodeSettingsJson = decodeUnknownEffect(fromLenientJson(SparseSettings));
const encodeSettingsJson = encodeEffect(fromJsonStringPretty(SparseSettings));
const decodeThemeFileJsonExit = decodeUnknownExit(fromJsonString(EnvironmentThemeFile));
const isEnvironmentThemeId = is(EnvironmentThemeId);
var ThemeSettingsUnreadableError = class extends TaggedError()("ThemeSettingsUnreadableError", {
	settingsPath: String$6,
	cause: Defect()
}) {
	get message() {
		return `Could not read ${this.settingsPath}. Fix its permissions, then run this again.`;
	}
};
var ThemeSettingsMalformedError = class extends TaggedError()("ThemeSettingsMalformedError", {
	settingsPath: String$6,
	cause: Defect()
}) {
	get message() {
		return `${this.settingsPath} is not a JSON object. Fix or remove it, then run this again.`;
	}
};
var ThemeSettingsBusyError = class extends TaggedError()("ThemeSettingsBusyError", {
	settingsPath: String$6,
	attempts: Number$2
}) {
	get message() {
		return `${this.settingsPath} kept changing while writing (gave up after ${this.attempts} attempts). Try again.`;
	}
};
var ThemeSettingsWriteError = class extends TaggedError()("ThemeSettingsWriteError", {
	settingsPath: String$6,
	cause: Defect()
}) {
	get message() {
		return `Could not write ${this.settingsPath}.`;
	}
};
var ThemeFileUnreadableError = class extends TaggedError()("ThemeFileUnreadableError", {
	filePath: String$6,
	cause: optional$3(Defect())
}) {
	get message() {
		return `Could not read ${this.filePath}.`;
	}
};
var ThemeFileInvalidError = class extends TaggedError()("ThemeFileInvalidError", {
	filePath: String$6,
	cause: Defect()
}) {
	get message() {
		return `${this.filePath} is not a valid theme file. Use a theme exported from T3 Code, or a seeded file with name, appearance, canvas, and accent.`;
	}
};
var ThemeFileTooLargeError = class extends TaggedError()("ThemeFileTooLargeError", {
	filePath: String$6,
	limit: Number$2
}) {
	get message() {
		return `${this.filePath} is larger than ${this.limit} bytes, which is more than a theme can publish.`;
	}
};
var ThemeFileColorlessError = class extends TaggedError()("ThemeFileColorlessError", { filePath: String$6 }) {
	get message() {
		return `${this.filePath} has no colors to publish.`;
	}
};
var ThemePublishError = class extends TaggedError()("ThemePublishError", {
	themesDir: String$6,
	cause: Defect()
}) {
	get message() {
		return `Could not publish the theme into ${this.themesDir}.`;
	}
};
const INVALID_THEME_ID_REASON = "is not a valid theme id (lowercase letters, digits, and hyphens; not an appearance keyword)";
var ThemeIdUnknownError = class extends TaggedError()("ThemeIdUnknownError", {
	themeId: String$6,
	known: ArraySchema(String$6)
}) {
	get message() {
		return `No theme named "${this.themeId}". Available: ${this.known.join(", ")}. Publish one by passing a theme file instead of an id.`;
	}
};
var ThemeIdInvalidError = class extends TaggedError()("ThemeIdInvalidError", { themeId: String$6 }) {
	get message() {
		return `"${this.themeId}" ${INVALID_THEME_ID_REASON}.`;
	}
};
var ThemeFileIdInvalidError = class extends TaggedError()("ThemeFileIdInvalidError", {
	themeId: String$6,
	filePath: String$6
}) {
	get message() {
		return `"${this.themeId}" ${INVALID_THEME_ID_REASON}. Pass one with --id.`;
	}
};
var ThemeTargetMissingError = class extends TaggedError()("ThemeTargetMissingError", {}) {
	get message() {
		return "Provide a theme id or file, or run `t3 theme clear` to remove the theme.";
	}
};
const envT3Home = String$7("T3CODE_HOME").pipe(option$1);
const resolveThemePaths = fn(function* (explicitBaseDir) {
	const envHome = filter(yield* envT3Home, (value) => value.trim().length > 0);
	const configuredBaseDir = orElse(explicitBaseDir, () => envHome);
	const baseDir = yield* resolveBaseDir(getOrUndefined(configuredBaseDir));
	const derivedPaths = yield* deriveServerPaths(baseDir, void 0, { baseDirIsExplicit: isSome(configuredBaseDir) });
	return {
		settingsPath: derivedPaths.settingsPath,
		themesDir: derivedPaths.environmentThemesDir
	};
});
/** Propagate read errors to avoid overwriting unread settings with a sparse file. */
const readSettingsObject = fn(function* (settingsPath) {
	const fs = yield* FileSystem;
	if (!(yield* fs.exists(settingsPath).pipe(mapError((cause) => new ThemeSettingsUnreadableError({
		settingsPath,
		cause
	}))))) return {
		raw: "",
		settings: {}
	};
	const raw = yield* fs.readFileString(settingsPath).pipe(mapError((cause) => new ThemeSettingsUnreadableError({
		settingsPath,
		cause
	})));
	if (raw.trim().length === 0) return {
		raw,
		settings: {}
	};
	return {
		raw,
		settings: yield* decodeSettingsJson(raw).pipe(mapError((cause) => new ThemeSettingsMalformedError({
			settingsPath,
			cause
		})))
	};
});
/** The server's in-process semaphore cannot serialize writes from this process. */
const CONCURRENT_WRITE_ATTEMPTS = 5;
const writeDefaultTheme = fn(function* (input) {
	const fs = yield* FileSystem;
	for (let attempt = 1;; attempt++) {
		const { raw, settings } = yield* readSettingsObject(input.settingsPath);
		const setAt = formatIso(yield* now);
		const next = input.themeId.length > 0 ? {
			...settings,
			defaultTheme: input.themeId,
			defaultThemeSetAt: setAt
		} : Object.fromEntries(Object.entries(settings).filter(([key]) => key !== "defaultTheme" && key !== "defaultThemeSetAt"));
		const contents = yield* encodeSettingsJson(next);
		if ((yield* fs.readFileString(input.settingsPath).pipe(orElseSucceed(() => ""))) !== raw) {
			if (attempt >= CONCURRENT_WRITE_ATTEMPTS) return yield* new ThemeSettingsBusyError({
				settingsPath: input.settingsPath,
				attempts: CONCURRENT_WRITE_ATTEMPTS
			});
			continue;
		}
		yield* writeFileStringAtomically({
			filePath: input.settingsPath,
			contents: `${contents}\n`
		}).pipe(mapError((cause) => new ThemeSettingsWriteError({
			settingsPath: input.settingsPath,
			cause
		})));
		return;
	}
});
const publishThemeFile = fn(function* (input) {
	const fs = yield* FileSystem;
	const path = yield* Path;
	const info = yield* fs.stat(input.filePath).pipe(mapError((cause) => new ThemeFileUnreadableError({
		filePath: input.filePath,
		cause
	})));
	if (info.type !== "File") return yield* new ThemeFileUnreadableError({ filePath: input.filePath });
	if (Number(info.size) > 32768) return yield* new ThemeFileTooLargeError({
		filePath: input.filePath,
		limit: MAX_THEME_FILE_BYTES
	});
	const resolvedSource = yield* fs.realPath(input.filePath).pipe(mapError((cause) => new ThemeFileUnreadableError({
		filePath: input.filePath,
		cause
	})));
	const raw = readThemeFileGuarded(resolvedSource, MAX_THEME_FILE_BYTES);
	if (raw === null) return yield* new ThemeFileUnreadableError({ filePath: input.filePath });
	const decoded = decodeThemeFileJsonExit(raw);
	if (decoded._tag === "Failure") return yield* new ThemeFileInvalidError({
		filePath: input.filePath,
		cause: decoded.cause
	});
	if (!environmentThemeFileHasColors(decoded.value)) return yield* new ThemeFileColorlessError({ filePath: input.filePath });
	const fileBasename = path.basename(input.filePath, ".json");
	const themeId = getOrElse(input.explicitId, () => fileBasename);
	if (!isEnvironmentThemeId(themeId) || UNPUBLISHABLE_THEME_IDS.has(themeId)) return yield* new ThemeFileIdInvalidError({
		themeId,
		filePath: input.filePath
	});
	const destinationPath = path.join(input.themesDir, `${themeId}.json`);
	const backupPath = `${destinationPath}.rollback-${process.pid}`;
	const stagingPath = `${destinationPath}.staging-${process.pid}`;
	yield* fs.makeDirectory(input.themesDir, { recursive: true }).pipe(mapError((cause) => new ThemePublishError({
		themesDir: input.themesDir,
		cause
	})));
	const publishFailure = (cause) => new ThemePublishError({
		themesDir: input.themesDir,
		cause
	});
	const stagedIno = yield* try_({
		try: () => {
			try {
				NodeFS.unlinkSync(stagingPath);
			} catch {}
			const fd = NodeFS.openSync(stagingPath, NodeFS.constants.O_WRONLY | NodeFS.constants.O_CREAT | NodeFS.constants.O_EXCL, 420);
			try {
				NodeFS.writeFileSync(fd, raw);
				return NodeFS.fstatSync(fd).ino;
			} finally {
				NodeFS.closeSync(fd);
			}
		},
		catch: publishFailure
	});
	const hadPrevious = yield* try_({
		try: () => {
			try {
				NodeFS.renameSync(destinationPath, backupPath);
				return true;
			} catch (error) {
				if (error.code === "ENOENT") return false;
				throw error;
			}
		},
		catch: publishFailure
	});
	const revert = sync(() => {
		try {
			NodeFS.unlinkSync(stagingPath);
		} catch {}
		try {
			const destinationIno = (() => {
				try {
					return NodeFS.lstatSync(destinationPath).ino;
				} catch {
					return null;
				}
			})();
			if (hadPrevious) {
				if (destinationIno === null || destinationIno === stagedIno) NodeFS.renameSync(backupPath, destinationPath);
				else NodeFS.unlinkSync(backupPath);
			} else if (destinationIno === stagedIno) NodeFS.unlinkSync(destinationPath);
		} catch {}
	});
	const cleanup = sync(() => {
		try {
			if (hadPrevious) NodeFS.unlinkSync(backupPath);
		} catch {}
	});
	yield* try_({
		try: () => NodeFS.renameSync(stagingPath, destinationPath),
		catch: publishFailure
	}).pipe(onError(() => revert));
	return {
		themeId,
		revert,
		cleanup
	};
});
/** Web and desktop cannot resolve the mobile default, and mobile does not follow this setting. */
const resolvableThemeIds = fn(function* (themesDir) {
	const published = yield* readPublishedThemes(themesDir);
	return [...BUILT_IN_THEME_IDS, ...published.map((theme) => theme.id)].toSorted();
});
const themeSetCommand = make$1("set", {
	baseDir: baseDirFlag,
	id: String$1("id").pipe(withDescription$1("Theme id to publish a file under, instead of its filename."), optional),
	theme: String$2("theme").pipe(withDescription$2("A theme id (a built-in, or one this machine publishes, where themes/nightfall.json is \"nightfall\"), or a path to a theme JSON file to publish and set in one step."))
}).pipe(withDescription("Set the environment's theme; connected clients switch to it."), withHandler((flags) => gen(function* () {
	const fs = yield* FileSystem;
	const target = yield* expandHomePath(flags.theme.trim());
	if (target.length === 0) return yield* new ThemeTargetMissingError();
	const paths = yield* resolveThemePaths(flags.baseDir);
	const looksLikePath = target.endsWith(".json") || target.includes("/") || target.includes("\\") || target.startsWith("~");
	const targetIsFile = looksLikePath && (yield* fs.exists(target).pipe(orElseSucceed(() => false)));
	let themeId;
	let revertPublish = void_;
	let cleanupPublish = void_;
	if (targetIsFile) {
		yield* readSettingsObject(paths.settingsPath);
		const published = yield* publishThemeFile({
			themesDir: paths.themesDir,
			filePath: target,
			explicitId: flags.id
		});
		themeId = published.themeId;
		revertPublish = published.revert;
		cleanupPublish = published.cleanup;
	} else if (looksLikePath) return yield* new ThemeFileUnreadableError({ filePath: target });
	else if (isEnvironmentThemeId(target)) {
		const known = yield* resolvableThemeIds(paths.themesDir);
		if (!known.includes(target)) return yield* new ThemeIdUnknownError({
			themeId: target,
			known
		});
		themeId = target;
	} else return yield* new ThemeIdInvalidError({ themeId: target });
	yield* writeDefaultTheme({
		settingsPath: paths.settingsPath,
		themeId
	}).pipe(onError(() => revertPublish));
	yield* cleanupPublish;
	yield* log(targetIsFile ? `Published ${target} as "${themeId}" and set it as the environment theme.\n` : `Environment theme set to "${themeId}" in ${paths.settingsPath}.\n`);
})));
const themeClearCommand = make$1("clear", { baseDir: baseDirFlag }).pipe(withDescription("Remove the environment's theme; clients keep what they have."), withHandler((flags) => gen(function* () {
	const paths = yield* resolveThemePaths(flags.baseDir);
	yield* writeDefaultTheme({
		settingsPath: paths.settingsPath,
		themeId: ""
	});
	yield* log(`Environment theme cleared in ${paths.settingsPath}.\n`);
})));
const themeShowCommand = make$1("show", { baseDir: baseDirFlag }).pipe(withDescription("Show the environment's theme and its published themes."), withHandler((flags) => gen(function* () {
	const paths = yield* resolveThemePaths(flags.baseDir);
	const { settings } = yield* readSettingsObject(paths.settingsPath);
	const defaultTheme = typeof settings.defaultTheme === "string" && settings.defaultTheme.length > 0 ? settings.defaultTheme : null;
	const published = (yield* readPublishedThemes(paths.themesDir)).map((theme) => theme.id).toSorted();
	yield* log(defaultTheme === null ? "Environment theme: not set.\n" : `Environment theme: "${defaultTheme}".\n`);
	yield* log(published.length === 0 ? `Published themes: none (publish into ${paths.themesDir}).\n` : `Published themes: ${published.join(", ")}.\n`);
})));
const themeCommand = make$1("theme").pipe(withDescription("Inspect and set environment-wide theme defaults."), withSubcommands([
	themeSetCommand,
	themeClearCommand,
	themeShowCommand
]));
// src/cli/trace.ts
const decodeTraceSpanLine = decodeUnknownOption(fromJsonString(Struct({
	name: String$6,
	durationMs: Finite,
	endTimeUnixNano: FiniteFromString,
	exit: optional$3(Struct({ _tag: String$6 })),
	status: optional$3(Struct({
		code: optional$3(String$6),
		message: optional$3(String$6)
	})),
	attributes: optional$3(Struct({ "effect.fiber.interrupted": optional$3(Unknown) }))
})));
function makeTraceSpanSummary(sinceMs = -Infinity) {
	const byName = /* @__PURE__ */ new Map();
	let spanCount = 0;
	let skippedLineCount = 0;
	let firstEndMs = Infinity;
	let lastEndMs = -Infinity;
	const addLine = (line) => {
		if (line.trim().length === 0) return;
		const span = getOrUndefined(decodeTraceSpanLine(line));
		if (span === void 0) {
			skippedLineCount += 1;
			return;
		}
		const endMs = span.endTimeUnixNano / 1e6;
		if (isNone(make$4(endMs))) {
			skippedLineCount += 1;
			return;
		}
		if (endMs < sinceMs) return;
		spanCount += 1;
		firstEndMs = Math.min(firstEndMs, endMs);
		lastEndMs = Math.max(lastEndMs, endMs);
		const stats = byName.get(span.name) ?? {
			durations: [],
			interrupted: 0,
			failures: 0
		};
		stats.durations.push(span.durationMs);
		if (span.exit?._tag === "Interrupted" || span.attributes?.["effect.fiber.interrupted"] === true || span.status?.message === "Interrupted") stats.interrupted += 1;
		if (span.exit?._tag === "Failure" || span.status?.code === "2") stats.failures += 1;
		byName.set(span.name, stats);
	};
	const finish = () => {
		const minutes = (lastEndMs - firstEndMs) / 6e4;
		const spans = [...byName].map(([name, { durations, interrupted, failures }]) => {
			const sorted = durations.toSorted((left, right) => left - right);
			const percentile = (p) => sorted[Math.ceil(p * sorted.length) - 1];
			return {
				name,
				count: sorted.length,
				perMinute: minutes > 0 ? sorted.length / minutes : void 0,
				p50Ms: percentile(.5),
				p90Ms: percentile(.9),
				maxMs: sorted[sorted.length - 1],
				interrupted,
				failures
			};
		}).toSorted((left, right) => right.count - left.count || left.name.localeCompare(right.name));
		return {
			spanCount,
			skippedLineCount,
			firstEndMs,
			lastEndMs,
			minutes,
			spans
		};
	};
	return {
		addLine,
		finish
	};
}
const formatMs = (ms) => Math.round(ms) < 1e3 ? `${Math.round(ms)}ms` : `${Math.round(ms / 100) / 10}s`;
function formatTraceSummary(summary, limit) {
	const header = [
		"span",
		"count",
		"/min",
		"p50",
		"p90",
		"max",
		"interrupted",
		"failed"
	];
	const table = [header, ...summary.spans.slice(0, limit).map((span) => [
		span.name,
		String(span.count),
		span.perMinute === void 0 ? "-" : span.perMinute < .1 ? "<0.1" : span.perMinute.toFixed(1),
		formatMs(span.p50Ms),
		formatMs(span.p90Ms),
		formatMs(span.maxMs),
		String(span.interrupted),
		String(span.failures)
	])];
	const widths = header.map((_, column) => Math.max(...table.map((row) => row[column].length)));
	const formatIso$1 = (ms) => formatIso(makeUnsafe(ms));
	return [
		`${summary.spanCount} spans ended from ${formatIso$1(summary.firstEndMs)} to ${formatIso$1(summary.lastEndMs)} (${summary.minutes.toFixed(1).replace(/\.0+$/, "")} min).`,
		...summary.skippedLineCount > 0 ? [`Skipped ${summary.skippedLineCount} lines that are not spans.`] : [],
		"",
		...table.map((row) => row.map((cell, column) => column === 0 ? cell.padEnd(widths[column]) : cell.padStart(widths[column])).join("  ")),
		...summary.spans.length > limit ? ["", `${summary.spans.length - limit} more span names. Use --limit to show more.`] : []
	].join("\n");
}
const traceSummaryCommand = make$1("summary", {
	baseDir: baseDirFlag,
	since: String$1("since").pipe(withSchema(DurationFromString), withDescription$1("Only count spans that ended in this window, for example 30m or 2h."), optional),
	limit: Int("limit").pipe(withSchema(PositiveInt), withDescription$1("Number of span names to show, busiest first."), withDefault(25))
}).pipe(withDescription("Summarize the local server trace file: counts, rates, and latency."), withHandler(fn("cli.trace.summary")(function* (flags) {
	const fs = yield* FileSystem;
	const envHome = yield* String$7("T3CODE_HOME").pipe(option$1);
	const baseDir = yield* resolveBaseDir(getOrUndefined(orElse(flags.baseDir, () => envHome)));
	const traceFilePath = (yield* traceFileConfig) ?? (yield* deriveServerPaths(baseDir, void 0)).serverTracePath;
	const sinceMs = isSome(flags.since) ? (yield* currentTimeMillis) - toMillis(flags.since.value) : void 0;
	const summarizer = makeTraceSpanSummary(sinceMs);
	yield* forEach(toRotatedTracePaths(traceFilePath, yield* traceMaxFilesConfig), (path) => streamTraceFileLines(fs, path, summarizer.addLine), { discard: true });
	const summary = summarizer.finish();
	yield* log(summary.spanCount === 0 ? `No spans found in ${traceFilePath} or its rotated files${sinceMs === void 0 ? "" : " in that window"}.${summary.skippedLineCount > 0 ? ` Skipped ${summary.skippedLineCount} lines that are not spans.` : ""}` : formatTraceSummary(summary, flags.limit));
})));
const traceCommand = make$1("trace").pipe(withDescription("Inspect the local server trace file."), withSubcommands([traceSummaryCommand]));
// src/cli/triage.ts
const TRIAGE_AGENTS = [{
	id: "claude",
	command: "claude",
	label: "Claude Code"
}, {
	id: "codex",
	command: "codex",
	label: "Codex"
}];
var TriageAgentUnavailableError = class extends TaggedError()("TriageAgentUnavailableError", { agent: String$6 }) {
	get message() {
		return `\`${this.agent}\` is not installed or was not found on PATH.`;
	}
};
var TriageAgentChoiceRequiredError = class extends TaggedError()("TriageAgentChoiceRequiredError", {}) {
	get message() {
		return "Both claude and codex are installed and there is no terminal to ask which to use. Re-run with --agent claude or --agent codex.";
	}
};
var TriageAgentSpawnError = class extends TaggedError()("TriageAgentSpawnError", {
	command: String$6,
	cause: Defect()
}) {
	get message() {
		return `Could not start \`${this.command}\`.`;
	}
};
const pickAgent = (agents) => promise(async () => {
	const readline = NodeReadlinePromises.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	try {
		const menu = agents.map((agent, index) => `  [${String(index + 1)}] ${agent.label}`).join("\n");
		for (;;) {
			const answer = (await readline.question(`Run triage with:\n${menu}\n> `)).trim();
			const byNumber = agents[Number.parseInt(answer, 10) - 1];
			if (byNumber !== void 0) return byNumber;
			const byId = agents.find((agent) => agent.id === answer.toLowerCase());
			if (byId !== void 0) return byId;
		}
	} finally {
		readline.close();
	}
});
const runInteractiveSession = (input) => callback((resume) => {
	const child = NodeChildProcess.spawn(input.command, [...input.args], {
		cwd: input.cwd,
		stdio: [
			interactiveStdin(),
			"inherit",
			"inherit"
		],
		shell: input.shell
	});
	child.once("error", (cause) => resume(fail(new TriageAgentSpawnError({
		command: input.command,
		cause
	}))));
	child.once("exit", (code, signal) => resume(succeed$1(code ?? (signal === null ? 0 : 1))));
});
const triageCommand = make$1("triage", {
	baseDir: baseDirFlag,
	agent: Literals("agent", ["claude", "codex"]).pipe(withDescription$1("Agent CLI to use. Default: ask when both are installed."), optional),
	model: String$1("model").pipe(withDescription$1("Model passed through to the agent CLI. Default: the agent's default."), optional)
}).pipe(withDescription("Investigate a T3 Code problem on this machine with claude or codex, and help file a good issue."), withHandler((flags) => gen(function* () {
	const explicitBaseDir = getOrUndefined(flags.baseDir);
	const envHome = yield* String$7("T3CODE_HOME").pipe(option$1);
	const baseDir = yield* resolveBaseDir(explicitBaseDir ?? getOrUndefined(envHome));
	const paths = yield* deriveServerPaths(baseDir, void 0, {});
	const session = yield* writeTriageSession({
		baseDir,
		paths,
		entry: {
			kind: "cli",
			cliVersion: version,
			launchedAs: yield* resolveCliCommand("triage")
		},
		server: yield* describeServerProcess(paths.serverRuntimeStatePath)
	});
	const installed = [];
	for (const agent of TRIAGE_AGENTS) if (yield* isCommandAvailable(agent.command)) installed.push(agent);
	const requested = getOrUndefined(flags.agent);
	let selected;
	if (requested !== void 0) {
		selected = installed.find((agent) => agent.id === requested);
		if (selected === void 0) return yield* new TriageAgentUnavailableError({ agent: requested });
	} else if (installed.length === 1) selected = installed[0];
	else if (installed.length > 1) {
		if (!process.stdin.isTTY || !process.stdout.isTTY) return yield* new TriageAgentChoiceRequiredError();
		selected = yield* pickAgent(installed);
	}
	const { sessionDir, promptFilePath, contextFilePath } = session;
	if (selected === void 0) {
		yield* log([
			"No supported agent CLI (claude, codex) was found on this machine.",
			"",
			"The triage prompt and machine context were written to:",
			`  ${promptFilePath}`,
			`  ${contextFilePath}`,
			"",
			"Paste the prompt file into any coding agent to run triage by hand."
		].join("\n"));
		return;
	}
	const model = getOrUndefined(flags.model);
	const spawnSpec = yield* resolveSpawnCommand(selected.command, [...model === void 0 ? [] : ["--model", model], buildTriageLaunchPrompt(promptFilePath)]);
	yield* log(`Starting ${selected.label}. It will ask what went wrong.\n`);
	const exitCode = yield* runInteractiveSession({
		...spawnSpec,
		cwd: sessionDir
	});
	if (exitCode !== 0) process.exitCode = exitCode;
})));
// src/cli/connect.ts
const jsonFlag = Boolean$1("json").pipe(withDescription$1("Emit JSON instead of human-readable output."), withDefault(false));
const isCloudCliTokenManagerError = is(CloudCliTokenManagerError);
const headlessFlag = Boolean$1("headless").pipe(withDescription$1("Sign in with a URL and code on any device. Automatic without a terminal or over SSH."), withDefault(false));
/**
* Inside an SSH session there is no local browser to complete the loopback
* OAuth callback, so the device authorization grant is the only flow that
* can work.
*/
const headlessSessionConfig = all$1({
	sshConnection: String$7("SSH_CONNECTION").pipe(option$1),
	sshTty: String$7("SSH_TTY").pipe(option$1)
}).pipe(map$5(({ sshConnection, sshTty }) => isSome(sshConnection) || isSome(sshTty)));
const showDeviceAuthorizationPrompt = (prompt) => log(formatDeviceAuthorizationPrompt(prompt));
function formatDeviceAuthorizationPrompt(prompt) {
	const minutes = Math.max(1, Math.round(toMinutes(prompt.expiresIn)));
	return [
		"Sign in to T3 Connect. Open on any device:",
		`  ${prompt.verificationUriComplete ?? prompt.verificationUri}`,
		`Code: ${prompt.userCode}`,
		`Waiting for approval. Expires in ${minutes} min. Ctrl+C cancels.`
	].join("\n");
}
const authorizeCli = fn("cloud.cli.authorize")(function* (options) {
	const tokens = yield* CloudCliTokenManager;
	if (!(options.headless || (yield* headlessSessionConfig) || !(process.stdin.isTTY && process.stdout.isTTY))) {
		const authorization = yield* tokens.get;
		if (authorization._tag === "Authorized") return authorization.token.identity ?? null;
	}
	const existing = yield* tokens.getExisting.pipe(catchTags({ CloudCliCredentialRefreshError: () => log("T3 Connect sign-in expired. Sign in again.").pipe(as(none())) }));
	if (isSome(existing)) return existing.value.identity ?? null;
	const { token, identity } = yield* deviceAuthorizationLogin(showDeviceAuthorizationPrompt).pipe(mapError((cause) => isCloudCliTokenManagerError(cause) ? cause : new CloudCliAuthorizationError({ cause })));
	yield* tokens.store(token);
	return identity;
});
function bytesToString(value) {
	return new TextDecoder().decode(value);
}
function stringToBytes(value) {
	return new TextEncoder().encode(value);
}
function formatRelayClientStatus(executable) {
	switch (executable.status) {
		case "available": return [
			`  Relay client: available via ${executable.source === "path" ? "PATH" : executable.source === "managed" ? "managed install" : "configured override"}`,
			`    Path: ${executable.executablePath}`,
			`    Version: ${executable.version}`
		];
		case "missing": return ["  Relay client: not installed"];
		case "unsupported": return [`  Relay client: unsupported on ${executable.platform}-${executable.arch}`, `    Managed version: ${executable.version}`];
	}
}
function formatCloudStatus(status, options) {
	if (options?.json) return JSON.stringify(status, null, 2);
	const provisioned = status.revoked ? "removed from T3 Connect" : status.linked ? "provisioned" : status.desired && status.authenticated ? "pending server startup" : "not provisioned";
	const nextStep = !status.authenticated ? "Run `t3 connect link` to authorize and enable T3 Connect." : status.revoked ? "Run `t3 connect link` to link this environment again." : !status.desired ? "Run `t3 connect link` to enable T3 Connect." : !status.linked ? "Start T3 to provision the environment link and launch its managed tunnel." : void 0;
	return [
		"T3 Connect",
		`  Exposure: ${status.desired ? "enabled" : "disabled"}`,
		`  Authorization: ${status.authenticated ? "stored credential" : "missing"}`,
		`  Environment link: ${provisioned}`,
		`  Relay: ${status.relayUrl ?? "not provisioned"}`,
		`  Publish agent activity: ${status.publishAgentActivity ? "enabled" : "disabled"}`,
		...formatRelayClientStatus(status.relayClient),
		...!status.desired || status.linkMode !== "managed" ? [] : status.reachability === null ? ["", "No running server answered, so reachability was not checked. Check the background service with `t3 service status`."] : status.reachability.status === "reachable" ? ["", `✓ Other devices can reach this machine · ${formatConnectReachable(status.reachability)}`] : ["", formatReachabilityFailure(status.reachability)],
		...nextStep ? ["", `Next: ${nextStep}`] : []
	].join("\n");
}
const CLOUD_CLI_LIVE_SERVER_TIMEOUT = seconds(5);
const confirmRelayClientInstall = (version) => run$3(Confirm({
	message: `The T3 relay client is required for T3 Connect. Download and install version ${version}?`,
	initial: false
}));
function relayClientInstallProgressMessage(stage) {
	switch (stage) {
		case "checking": return "Checking existing installation";
		case "waiting_for_lock": return "Waiting for installation lock";
		case "downloading": return "Downloading";
		case "verifying": return "Verifying download";
		case "installing": return "Installing";
		case "validating": return "Validating executable";
		case "activating": return "Activating installation";
	}
}
const reportRelayClientInstallProgress = (event) => event.type === "progress" ? log(`Relay client: ${relayClientInstallProgressMessage(event.stage)}...`) : void_;
const acquireRelayClientForLink = fn("cloud.cli.acquire_relay_client_for_link")(function* (relayClient, confirmInstall, reportProgress) {
	const executable = yield* relayClient.resolve;
	if (executable.status === "available") return some(executable);
	if (executable.status === "unsupported") return some(yield* relayClient.installWithProgress(reportProgress));
	if (!(yield* confirmInstall(executable.version))) return none();
	return some(yield* relayClient.installWithProgress(reportProgress));
});
const withCloudCliSessionToken = (environmentAuth, scope, run) => acquireUseRelease(environmentAuth.issueSession({
	scopes: [scope],
	subject: "cloud-cli",
	label: "t3 connect cli"
}), (issued) => run(issued.token), (issued) => environmentAuth.revokeSession(issued.sessionId).pipe(ignore({ log: true })));
const runLiveCloudUnlink = fn("cloud.cli.run_live_unlink")(function* () {
	const config = yield* ServerConfig;
	const runtimeState = yield* readPersistedServerRuntimeState(config.serverRuntimeStatePath);
	if (isNone(runtimeState)) return { status: "not-running" };
	if (!isProcessAlive(runtimeState.value.pid)) return { status: "server-gone" };
	const environmentAuth = yield* EnvironmentAuth;
	const result = yield* exit(withCloudCliSessionToken(environmentAuth, AuthRelayWriteScope, (token) => make$7(EnvironmentHttpApi, { baseUrl: runtimeState.value.origin }).pipe(flatMap$1((client) => client.connect.unlink({ headers: { authorization: `Bearer ${token}` } })), timeout(CLOUD_CLI_LIVE_SERVER_TIMEOUT))));
	return isSuccess$1(result) ? { status: "succeeded" } : {
		status: "failed",
		cause: result.cause
	};
});
const CLOUD_CLI_REACHABILITY_TIMEOUT = seconds(30);
const CLOUD_CLI_REACHABILITY_WAIT = seconds(60);
const CLOUD_CLI_REACHABILITY_RETRY = seconds(5);
/** Asks the running server to check T3 Connect now. `null` when no server answers. */
const checkLiveReachability = fn("cloud.cli.check_live_reachability")(function* () {
	const config = yield* ServerConfig;
	const runtimeState = yield* readPersistedServerRuntimeState(config.serverRuntimeStatePath);
	if (isNone(runtimeState)) return null;
	const environmentAuth = yield* EnvironmentAuth;
	return yield* withCloudCliSessionToken(environmentAuth, AuthRelayReadScope, (token) => make$7(EnvironmentHttpApi, { baseUrl: runtimeState.value.origin }).pipe(flatMap$1((client) => client.connect.checkReachability({ headers: { authorization: `Bearer ${token}` } })), timeout(CLOUD_CLI_REACHABILITY_TIMEOUT))).pipe(orElseSucceed(() => null));
});
function formatAlertBox(text) {
	const lines = text.split("\n");
	const width = Math.max(...lines.map((line) => line.length));
	const color = process.stdout.isTTY === true && !process.env.NO_COLOR;
	const red = (line) => color ? `\x1b[1;31m${line}\x1b[0m` : line;
	return [
		`┌${"─".repeat(width + 2)}┐`,
		...lines.map((line) => `│ ${line.padEnd(width)} │`),
		`└${"─".repeat(width + 2)}┘`
	].map(red).join("\n");
}
/**
* Waits for the server that `t3 connect` just started to prove other devices
* can reach it, so a broken tunnel fails setup instead of looking green.
*/
const waitForReachability = fn("cloud.cli.wait_for_reachability")(function* () {
	yield* log("Checking T3 Connect...");
	const deadline = (yield* currentTimeMillis) + toMillis(CLOUD_CLI_REACHABILITY_WAIT);
	let last = null;
	while (true) {
		last = (yield* checkLiveReachability()) ?? last;
		if (last?.status === "reachable") {
			yield* log("✓ T3 Connect is reachable.");
			return;
		}
		if ((yield* currentTimeMillis) >= deadline) break;
		yield* sleep(CLOUD_CLI_REACHABILITY_RETRY);
	}
	yield* error(formatAlertBox(last === null ? "✕ Could not check T3 Connect\n  The T3 server on this machine did not answer.\n  Fix: run `t3 service status`, then `t3 connect status`." : formatReachabilityFailure(last)));
	yield* sync(() => {
		process.exitCode = 1;
	});
});
const logCloudDisconnectFailure = (operation, clearAuthorization, cause) => logWarning("T3 Connect disconnect operation failed.").pipe(annotateLogs({
	operation,
	clearAuthorization,
	cause: pretty(cause)
}));
const unlinkRelayEnvironment = fn("cloud.cli.unlink_relay_environment")(function* () {
	const token = yield* (yield* CloudCliTokenManager).getExisting;
	if (isNone(token)) return { status: "not-authenticated" };
	const environmentId = yield* (yield* ServerEnvironmentIdentity).getEnvironmentId;
	const relayUrl = yield* relayUrlConfig;
	const httpClient = yield* HttpClient;
	return (yield* del(`${relayUrl}/v1/client/environment-links/${encodeURIComponent(environmentId)}`).pipe(bearerToken(token.value.accessToken), httpClient.execute, flatMap$1(filterRelayResponse), flatMap$1(schemaBodyJson(RelayOkResponse)), withRelayClientTracing)).ok ? { status: "revoked" } : { status: "not-linked" };
});
/**
* Prints the local disconnect outcome, then whether the relay record was revoked.
* A missing CLI login or a failed relay DELETE leaves that record registered, so
* those outcomes warn to deregister it from the T3 Connect account page.
*/
const reportCloudDisconnectResults = fn("cloud.cli.report_disconnect_results")(function* (input) {
	if (input.liveResult.status === "failed") {
		yield* logCloudDisconnectFailure("live-server-unlink", input.clearAuthorization, input.liveResult.cause);
		yield* warn("T3 Connect is disabled, but the running server could not stop its tunnel.\nRestart that server to stop the connector.");
	} else {
		yield* log("T3 Connect is disabled locally.");
		if (input.liveResult.status === "server-gone") yield* warn("The server that ran T3 Connect is gone, but its cloudflared process may still be running.\nStop that process if it is.");
	}
	if (isFailure(input.relayResult)) {
		yield* logCloudDisconnectFailure("relay-environment-unlink", input.clearAuthorization, input.relayResult.cause);
		yield* warn(input.clearAuthorization ? "Could not revoke the relay-side environment record before signing out.\nThe stored CLI authorization was still removed locally." : "Could not revoke the relay-side environment record yet.\nRun `t3 connect unlink` again when the relay is reachable, or deregister it from the T3 Connect page of your T3 account.");
	} else if (input.relayResult.value.status === "not-authenticated") yield* warn("The relay-side environment record was not revoked.\nDeregister it from the T3 Connect page of your T3 account, or run `t3 connect login` and retry.");
	else if (input.relayResult.value.status === "revoked") yield* log("Revoked the relay-side environment record.");
});
const disconnectCloud = fn("cloud.cli.disconnect")(function* (options) {
	yield* setCliDesiredCloudLink(false);
	const liveResult = yield* runLiveCloudUnlink();
	const relayResult = yield* exit(unlinkRelayEnvironment());
	yield* clearPersistedCloudLink;
	if (options.clearAuthorization) yield* (yield* CloudCliTokenManager).clear;
	yield* reportCloudDisconnectResults({
		clearAuthorization: options.clearAuthorization,
		liveResult,
		relayResult
	});
	if (options.clearAuthorization) yield* log("Signed out of T3 Connect locally.\nThe background service is managed separately with `t3 service`.");
	return liveResult;
});
const runCloudCommand = fn("cloud.cli.run_cloud_command")(function* (flags, run, options) {
	const logLevel = yield* LogLevel;
	const config = yield* resolveCliAuthConfig(flags, logLevel, options);
	const minimumLogLevel = options?.quietLogs ? "Error" : config.logLevel;
	const layerRuntime$1 = mergeAll(layer$5, layer$18.pipe(provide(layer$5), provide(layer$19)), layerCloudflared({ baseDir: config.baseDir }), layerRuntime, layer(config), layerHeadlessRelayClient.pipe(provide(layer$4))).pipe(provideMerge(layer$2), provideMerge(layer$3(config)), provide(succeed$3(MinimumLogLevel, minimumLogLevel)));
	return yield* run.pipe(provide$1(layerRuntime$1));
});
/** Status, unlink, and logout stay available so a machine can leave Connect the policy turned off. */
const requireConnectAllowed = gen(function* () {
	const policy = yield* ManagedPolicy;
	if (!allowsConnect(policy)) return yield* refuseConnect(policy);
});
const connectedAs = (identity) => identity ? ` as ${identity}` : "";
function formatRelayClientReady(version) {
	return `✓ Relay client ready · cloudflared ${version}`;
}
const linkEnvironmentForConnect = fn("cloud.cli.link_environment")(function* (options) {
	const publishOnly = options.publishOnly ?? false;
	if (!publishOnly) {
		const relayClient = yield* RelayClient;
		const installed = yield* acquireRelayClientForLink(relayClient, options.installRelayClient === true ? () => succeed$1(true) : confirmRelayClientInstall, options.installRelayClient === true ? (event) => event.type === "progress" && event.stage === "downloading" ? log("Installing the T3 Connect relay client...") : void_ : reportRelayClientInstallProgress);
		if (isNone(installed)) {
			yield* log("T3 Connect setup cancelled. The relay client was not installed.");
			return null;
		}
		if (options.installRelayClient !== true) yield* log(formatRelayClientReady(installed.value.version));
	}
	const identity = yield* authorizeCli(options);
	yield* setCliDesiredCloudLink(true, publishOnly ? "publish_only" : "managed");
	if (yield* dropRevokedCloudLink) yield* log("Replacing the link T3 Connect revoked.");
	if (publishOnly) yield* (yield* ServerSecretStore).set(PUBLISH_AGENT_ACTIVITY_SECRET, stringToBytes("true"));
	return { identity };
});
const connectLoginCommand = make$1("login", {
	...projectLocationFlags,
	headless: headlessFlag
}).pipe(withDescription("Authorize the T3 Connect CLI without enabling remote access."), withHandler((flags) => runCloudCommand(flags, gen(function* () {
	yield* requireConnectAllowed;
	yield* log("T3 Connect\n");
	const identity = yield* authorizeCli(flags);
	yield* log(`✓ Signed in${connectedAs(identity)}`);
}))));
const connectLinkCommand = make$1("link", {
	...projectLocationFlags,
	headless: headlessFlag,
	publishOnly: Boolean$1("publish-only").pipe(withDescription$1("Link to publish agent activity only, with no managed tunnel. Reach this environment out of band (e.g. Tailscale)."), withDefault(false))
}).pipe(withDescription("Authorize this environment for T3 Connect on next start."), withHandler((flags) => runCloudCommand(flags, gen(function* () {
	yield* requireConnectAllowed;
	yield* log("T3 Connect\n");
	const linked = yield* linkEnvironmentForConnect(flags);
	if (linked) {
		const serveCommand = yield* resolveCliCommand("serve");
		yield* log(flags.publishOnly ? `✓ Authorized${connectedAs(linked.identity)}\n\nNext\n  Start T3 to publish agent activity (no managed tunnel).` : `✓ Authorized${connectedAs(linked.identity)}\n\nNext\n  Start the server with \`${serveCommand}\` to make this machine reachable.`);
	}
}))));
const connectStatusCommand = make$1("status", {
	...projectLocationFlags,
	json: jsonFlag
}).pipe(withDescription("Show T3 Connect setup and check that other devices can reach this machine."), withHandler((flags) => runCloudCommand(flags, gen(function* () {
	const secrets = yield* ServerSecretStore;
	const relayClient = yield* RelayClient;
	const tokens = yield* CloudCliTokenManager;
	const [desired, authenticated, cloudUserId, relayUrl, publishAgentActivity, revoked, executable, linkMode] = yield* all([
		readCliDesiredCloudLink,
		tokens.hasCredential,
		secrets.get(CLOUD_LINKED_USER_ID),
		secrets.get(RELAY_URL_SECRET),
		secrets.get(PUBLISH_AGENT_ACTIVITY_SECRET),
		secrets.get(CLOUD_LINK_REVOKED),
		relayClient.resolve,
		readCliDesiredLinkMode
	], { concurrency: "unbounded" });
	const reachability = desired && linkMode === "managed" ? yield* checkLiveReachability() : null;
	const status = {
		desired,
		authenticated,
		linked: isSome(cloudUserId),
		revoked: isSome(cloudUserId) && isSome(revoked),
		cloudUserId: isSome(cloudUserId) ? bytesToString(cloudUserId.value) : null,
		relayUrl: isSome(relayUrl) ? bytesToString(relayUrl.value) : null,
		publishAgentActivity: isAgentActivityPublishingEnabledValue(isSome(publishAgentActivity) ? bytesToString(publishAgentActivity.value) : null),
		relayClient: executable,
		linkMode,
		reachability
	};
	yield* log(formatCloudStatus(status, { json: flags.json }));
}), { quietLogs: flags.json })));
const connectSubcommands = [
	connectLoginCommand,
	connectLinkCommand,
	make$1("publish", {
		...projectLocationFlags,
		disable: Boolean$1("disable").pipe(withDescription$1("Stop publishing agent activity to your mobile clients."), withDefault(false))
	}).pipe(withDescription("Toggle publishing agent activity (push notifications and Live Activities) to your mobile clients."), withHandler((flags) => runCloudCommand(flags, gen(function* () {
		const secrets = yield* ServerSecretStore;
		const tokens = yield* CloudCliTokenManager;
		const enabled = !flags.disable;
		if (enabled) yield* requireConnectAllowed;
		yield* secrets.set(PUBLISH_AGENT_ACTIVITY_SECRET, stringToBytes(enabled ? "true" : "false"));
		if (!enabled) {
			if (!isSome(yield* secrets.get("cloud-linked-user-id")) && (yield* readCliDesiredLinkMode) === "publish_only") {
				yield* setCliDesiredCloudLink(false);
				yield* log("Cancelled the pending publish-only T3 Connect link.");
			}
			yield* log("Publishing agent activity disabled.");
			return;
		}
		yield* log("Publishing agent activity enabled.");
		if (isSome(yield* secrets.get("cloud-linked-user-id"))) return;
		if (!(yield* tokens.hasCredential)) {
			yield* log("Run `t3 connect login` first so this environment can be authorized to publish.");
			return;
		}
		if (yield* readCliDesiredCloudLink) {
			yield* log("A T3 Connect link is already pending. Start T3 to finish provisioning it; publishing starts once it links.");
			return;
		}
		yield* setCliDesiredCloudLink(true, "publish_only");
		yield* log("Restart T3 to finish authorizing this environment to publish (no managed tunnel is created).");
	})))),
	connectStatusCommand,
	make$1("unlink", { ...projectLocationFlags }).pipe(withDescription("Disable T3 Connect while retaining the stored authorization."), withHandler((flags) => runCloudCommand(flags, disconnectCloud({ clearAuthorization: false })))),
	make$1("logout", { ...projectLocationFlags }).pipe(withDescription("Disable T3 Connect and clear the stored CLI authorization."), withHandler((flags) => runCloudCommand(flags, disconnectCloud({ clearAuthorization: true }))))
];
// src/cli/up.ts
/**
* T3 Connect is on when this CLI asked for a managed link, or when the desktop or
* web app made one: that saves the tunnel config but no CLI marker. Revoked is off.
*/
const connectEnabled = (link) => !link.revoked && (link.cliDesired ? link.cliMode === "managed" : link.managedTunnel);
const readSetup = fn("cli.up.read_setup")(function* () {
	const { baseDir } = yield* ServerConfig;
	const service = yield* (yield* BootService).status;
	const { entries } = yield* readServiceEnv(baseDir);
	const lan = yield* Boolean$5("T3CODE_LAN").pipe(option$1).parse(fromEnv({ env: entries }));
	const secrets = yield* ServerSecretStore;
	const connectRevoked = hasCloudPublicConfig && isSome(yield* secrets.get("cloud-link-revoked"));
	const connect = hasCloudPublicConfig ? connectEnabled({
		cliDesired: yield* readCliDesiredCloudLink,
		cliMode: yield* readCliDesiredLinkMode,
		managedTunnel: isSome(yield* secrets.get(CLOUD_ENDPOINT_RUNTIME_CONFIG)),
		revoked: connectRevoked
	}) : null;
	const servesThisHome = service.installed && service.otherBaseDir === void 0;
	return {
		service,
		connect,
		connectRevoked,
		lan: getOrElse(lan, () => servesThisHome),
		lanFromOldDefault: isNone(lan) && servesThisHome,
		host: entries.T3CODE_HOST
	};
});
/**
* The routes `t3 up` starts from. With no route flag it asks about every
* route, starting a machine with no service from T3 Connect. Any route flag
* means it asks nothing and keeps the routes not named as they are.
*/
const planRoutes = (setup, flags) => {
	const ask = isNone(flags.connect) && isNone(flags.lan);
	const start = {
		connect: setup.connect === true || ask && !setup.installed && setup.connect !== null,
		lan: setup.lan
	};
	return {
		routes: {
			connect: getOrElse(flags.connect, () => start.connect),
			lan: getOrElse(flags.lan, () => start.lan)
		},
		ask: ask ? ["connect", "lan"].filter((r) => r !== "connect" || setup.connect !== null) : []
	};
};
/** A running service reads T3CODE_LAN and its T3 Connect link only when it starts. */
const needsRestart = (before, after) => after.lan !== before.lan || after.connect && !before.connect;
const CHOICES = {
	connect: {
		title: "T3 Connect",
		description: "Creates a tunnel to control your PC."
	},
	lan: {
		title: "Local network",
		description: "LAN and tailnet. Pairing code required."
	}
};
const formatSetup = (setup) => {
	const { service } = setup;
	if (service.otherBaseDir !== void 0) return [
		`  ${"Service".padEnd(15)}installed for another T3 home · ${service.otherBaseDir}`,
		"",
		`Pass \`${formatBootServiceBaseDirOption(service.otherBaseDir)}\` to manage it.`
	].join("\n");
	const rows = [
		["Service", !service.supported ? "unavailable" : service.installed ? `installed · t3@${service.installedVersion ?? version}` : "not installed"],
		...setup.connect === null ? [] : [["T3 Connect", setup.connect ? "on · your T3 account" : setup.connectRevoked ? "off · link revoked. Run `t3 connect`." : "off"]],
		["Local network", setup.host !== void 0 ? `overridden · T3CODE_HOST=${setup.host}` : setup.lanFromOldDefault ? "on · kept from an older install" : setup.lan ? "on · pairing code only" : "off"]
	];
	const notes = [...setup.host === void 0 && setup.lan ? ["Anyone on your LAN or tailnet can reach the port. A pairing code is the only lock."] : [], ...setup.lanFromOldDefault ? ["Older installs keep LAN access on. Turn it off: `t3 up --no-lan`."] : []];
	return [...rows.map(([label, value]) => `  ${label.padEnd(15)}${value}`), ...notes.length === 0 ? [] : ["", ...notes]].join("\n");
};
const formatNextSteps = (routes, serviceInstalled, pairCommand) => [
	...routes.connect ? ["On your other device, sign in to T3 Connect with the same account."] : [],
	...routes.lan ? [`Run \`${pairCommand}\`. Use the code on your other device.`] : [],
	...routes.connect || routes.lan ? [] : [serviceInstalled ? "Remote access is off. T3 Code still runs here in the background." : "Remote access is off. Run `t3` to use T3 Code here."]
].join("\n");
const interactiveTerminal = () => Boolean(process.stdin.isTTY && process.stdout.isTTY);
const setUp = fn("cli.up")(function* (flags) {
	const { baseDir } = yield* ServerConfig;
	const service = yield* BootService;
	const baseDirArgs = match$1(flags.baseDir, {
		onNone: () => [],
		onSome: (dir) => ["--base-dir", dir]
	});
	const { command: pairCommand } = yield* resolveHostCliCommand("pair", baseDirArgs);
	const before = yield* readSetup();
	if (before.service.otherBaseDir !== void 0) return yield* new BootServiceOtherBaseDirError({
		installedBaseDir: before.service.otherBaseDir,
		baseDir
	});
	if (before.connect === null && getOrElse(flags.connect, () => false)) return yield* new UserError({
		cause: "connect",
		userMessage: "T3 Connect is unavailable in this build."
	});
	const current = {
		connect: before.connect === true,
		lan: before.lan
	};
	const priorPublishOnly = hasCloudPublicConfig && (yield* readCliDesiredCloudLink) && (yield* readCliDesiredLinkMode) === "publish_only";
	const plan = planRoutes({
		...before,
		installed: before.service.installed
	}, flags);
	const interactive = !flags.yes && interactiveTerminal();
	let routes = plan.routes;
	if (plan.ask.length > 0 && interactive) {
		if (before.service.installed) yield* log(`Current setup\n${formatSetup(before)}\n`);
		const picked = yield* run$3(MultiSelect({
			message: "Allow connections through:",
			selectAll: "Select all",
			selectNone: "Clear all",
			inverseSelection: "Invert selection",
			choices: plan.ask.map((route) => ({
				...CHOICES[route],
				value: route,
				selected: plan.routes[route]
			}))
		})).pipe(catchTags({ QuitError: () => succeed$1(null) }));
		if (picked === null) return yield* log("Nothing changed.");
		routes = {
			connect: picked.includes("connect"),
			lan: picked.includes("lan")
		};
	} else if (plan.ask.length > 0 && !flags.yes && !before.service.installed) return yield* new UserError({
		cause: "routes",
		userMessage: `No terminal. Choose access with ${before.connect === null ? "--lan" : "--connect or --lan"}, or use --yes for the default. See \`t3 up --help\`.`
	});
	if (routes.connect && !current.connect) yield* requireConnectAllowed;
	if (routes.lan && !current.lan) {
		const policy = yield* ManagedPolicy;
		if (!allowsRemoteClients(policy)) return yield* refuseRemoteClients(policy);
	}
	if (!before.service.installed && !routes.connect && !routes.lan) {
		if (current.connect || before.connectRevoked) yield* disconnectCloud({ clearAuthorization: false });
		if (current.lan) yield* writeServiceEnv(baseDir, { T3CODE_LAN: "false" });
		return yield* log(formatNextSteps(routes, false, pairCommand));
	}
	const { installedVersion } = before.service;
	const newer = installedVersion !== void 0 && compareExactServiceVersions(installedVersion, version) > 0;
	const stopped = before.service.problems?.includes("service-stopped") === true;
	const restart = before.service.installed && (before.service.current || newer) && (needsRestart(current, routes) || stopped);
	const update = before.service.installed && !before.service.current && !newer && !stopped;
	if ((restart || update) && interactive && !stopped) {
		if (!(yield* run$3(Confirm({
			message: update ? "Update and restart T3 Code? Running agent turns will stop." : "Apply changes and restart? Running agent turns will stop.",
			initial: true
		})).pipe(catchTags({ QuitError: () => succeed$1(false) })))) return yield* log("Nothing changed.");
	}
	if (routes.connect && !current.connect) {
		const linked = yield* linkEnvironmentForConnect({
			headless: flags.headless,
			installRelayClient: true
		});
		if (linked === null) return;
		yield* log(`✓ Signed in to T3 Connect${linked.identity ? ` as ${linked.identity}` : ""}`);
	}
	const unlinkFailed = !routes.connect && (current.connect || before.connectRevoked) ? (yield* disconnectCloud({ clearAuthorization: false })).status === "failed" : false;
	const previousLan = (yield* readServiceEnv(baseDir)).entries.T3CODE_LAN;
	yield* writeServiceEnv(baseDir, { T3CODE_LAN: String(routes.lan) });
	const restoreServiceEnv = before.service.installed ? writeServiceEnv(baseDir, { T3CODE_LAN: previousLan }).pipe(andThen(!routes.connect || current.connect ? void_ : priorPublishOnly ? setCliDesiredCloudLink(true, "publish_only") : disconnectCloud({ clearAuthorization: false }).pipe(asVoid))) : void_;
	const rollBack = before.service.installed ? restoreServiceEnv.pipe(andThen(service.restart.pipe(ignore))) : void_;
	if (before.host !== void 0) yield* warn(`T3CODE_HOST=${before.host} in service.env overrides the network choice. Remove it to apply it.`);
	const printServeCommand = fn(function* (reason) {
		const { command } = yield* resolveHostCliCommand("serve", [...baseDirArgs, routes.lan ? "--lan" : "--no-lan"]);
		yield* log(`${reason} Keep this command running:\n  ${command}`);
		const shellHost = (yield* Environment).T3CODE_HOST;
		if (shellHost !== void 0) yield* warn(`T3CODE_HOST=${shellHost} in this shell overrides that choice. Unset it before you run the command.`);
	});
	let started = false;
	if (!before.service.supported) yield* printServeCommand("Background service unavailable.");
	else {
		if (newer) yield* log(`Keeping installed service version t3@${installedVersion}.`);
		if (update && !interactive) yield* log("Updating T3 Code. Running agent turns will stop.");
		const result = newer ? { changed: false } : yield* reconcileService().pipe(catchTags({
			BootServicePrerequisiteError: (error) => succeed$1({ failed: error.message }),
			BootServiceUnsupportedError: (error) => succeed$1({ failed: error.message })
		}), tapError(() => rollBack));
		if ("failed" in result && before.service.installed) {
			yield* restoreServiceEnv;
			const { command } = yield* resolveHostCliCommand("up", baseDirArgs);
			yield* log(`Service setup failed: ${result.failed} Fix that, then run \`${command}\` again.`);
		} else if ("failed" in result) yield* printServeCommand(`Service setup failed: ${result.failed}`);
		else if (result.changed) {
			yield* log(formatServiceChange(result));
			started = true;
		} else if (restart || unlinkFailed && before.service.installed) {
			if (!(restart || !interactive || (yield* run$3(Confirm({
				message: "The running service still has T3 Connect on. Restart it? Running agent turns will stop.",
				initial: true
			})).pipe(catchTags({ QuitError: () => succeed$1(false) }))))) {
				const { command } = yield* resolveHostCliCommand("service restart", baseDirArgs);
				yield* log(`Run \`${command}\` to turn T3 Connect off.`);
			} else {
				if (!interactive && !stopped) yield* log("Restarting T3 Code. Running agent turns will stop.");
				const outcome = yield* service.restart.pipe(tapError(() => rollBack));
				if (outcome === "queued") yield* log("Restart queued. This session will disconnect.");
				if (outcome === "skipped") yield* log("The installed service was not restarted. Run `t3 service status` to see why.");
				started = outcome === "restarted";
			}
		}
	}
	if (started && routes.connect && !current.connect) yield* waitForReachability();
	const after = yield* readSetup();
	yield* log(`\nThis machine\n${formatSetup(after)}\n\n${formatNextSteps({
		connect: after.connect === true,
		lan: after.lan
	}, after.service.installed, pairCommand)}`);
});
const upCommand = make$1("up", {
	...projectLocationFlags,
	connect: Boolean$1("connect").pipe(withDescription$1("Allow access through T3 Connect with your T3 account. Turn off with --no-connect."), optional),
	lan: Boolean$1("lan").pipe(withDescription$1("Allow LAN and tailnet connections. Anyone there can reach the port; a pairing code is the only lock. Turn off with --no-lan."), optional),
	yes: Boolean$1("yes").pipe(withDescription$1("Ask nothing. Keep the access settings; a new machine gets T3 Connect. A restart stops running agent turns."), withDefault(false)),
	headless: headlessFlag
}).pipe(withShortDescription("Set up remote access and the T3 Code background service."), withDescription("Set up remote access and the T3 Code background service. Access flags skip the question, and routes not named keep their settings. Without a terminal, a needed restart runs without asking and stops running agent turns."), withExamples([
	{
		command: "t3 up",
		description: "Choose remote access."
	},
	{
		command: "t3 up --connect",
		description: "Turn on T3 Connect. Keep other settings."
	},
	{
		command: "t3 up --lan",
		description: "Allow LAN access with pairing codes."
	},
	{
		command: "t3 up --no-lan",
		description: "Stop LAN access."
	},
	{
		command: "t3 up --yes",
		description: "Take the defaults with no questions."
	},
	{
		command: "t3 status --json",
		description: "Read the settings from a script."
	}
]), withHandler((flags) => runCloudCommand(flags, setUp(flags), { quietLogs: true })));
const connectCommand = make$1("connect", {
	...projectLocationFlags,
	headless: headlessFlag
}).pipe(withDescription("Set up T3 Connect for this machine. Same as `t3 up --connect`."), withHandler((flags) => runCloudCommand(flags, setUp({
	...flags,
	connect: some(true),
	lan: none(),
	yes: false
}), { quietLogs: true })), withSubcommands(connectSubcommands));
/** `t3 status --json`, for scripts and agents. */
const setupJson = (setup) => JSON.stringify({
	service: {
		supported: setup.service.supported,
		installed: setup.service.installed,
		installedVersion: setup.service.installedVersion ?? null,
		otherBaseDir: setup.service.otherBaseDir ?? null
	},
	connect: setup.connect === null ? null : {
		enabled: setup.connect,
		revoked: setup.connectRevoked
	},
	lan: {
		enabled: setup.lan,
		inheritedDefault: setup.lanFromOldDefault,
		hostOverride: setup.host ?? null
	}
}, null, 2);
const statusCommand = make$1("status", {
	...projectLocationFlags,
	json: Boolean$1("json").pipe(withDescription$1("Print the settings as JSON. Does not test connections."), withDefault(false))
}).pipe(withDescription("Show service setup and remote access settings."), withExamples([{
	command: "t3 status",
	description: "Show the settings."
}, {
	command: "t3 status --json",
	description: "Print them for scripts and agents."
}]), withHandler(fn("cli.status")(function* (flags) {
	const config = yield* resolveCliAuthConfig(flags, yield* LogLevel, { quietLogs: flags.json });
	const setup = yield* readSetup().pipe(provide$1(merge(layer(config), layer$5).pipe(provideMerge(layer$3(config)))));
	yield* log(flags.json ? setupJson(setup) : setup.service.otherBaseDir !== void 0 ? `This machine\n${formatSetup(setup)}` : `This machine\n${formatSetup(setup)}\n\nChange access: \`t3 up\`.`);
})));
// src/binCli.ts
const layerCliRuntime = mergeAll(layer$13, layer$20, layer$14);
const connectPublicConfigMissingMessage = "T3 Connect commands are unavailable: this build is missing T3 Connect public configuration.";
var ConnectPublicConfigMissingError = class extends UserError {
	get message() {
		return connectPublicConfigMissingMessage;
	}
};
const connectUnavailableCommand = make$1("connect", { command: String$2("command").pipe(variadic) }).pipe(withDescription("T3 Connect is unavailable in builds without public configuration."), unlisted, withHandler(() => fail(new ShowHelp({
	commandPath: ["t3", "connect"],
	errors: [new ConnectPublicConfigMissingError({ cause: connectPublicConfigMissingMessage })]
}))));
const makeCli = ({ cloudEnabled = hasCloudPublicConfig } = {}) => make$1("t3", { ...sharedServerCommandFlags }).pipe(withDescription("Run T3 Code in this terminal and open it in your browser. To use it from your other devices, run `t3 up`."), withHandler(runDefaultServerCommand), withSubcommands([
	make$1("help").pipe(withDescription("Show command help."), withHandler(() => fail(new ShowHelp({
		commandPath: ["t3"],
		errors: []
	})))),
	acpMcpBridgeCommand,
	acpMcpCallCommand,
	startCommand,
	serveCommand,
	appCommand,
	pairCommand,
	authCommand,
	environmentCommand,
	browserCommand,
	projectCommand,
	threadCommand,
	upCommand,
	statusCommand,
	serviceCommand,
	updateCommand,
	installCommand,
	uninstallCommand,
	make$1("__service-launcher").pipe(unlisted, withHandler(() => sync(() => void runServiceLauncherCli()))),
	claudeHistoryCommand,
	speechWorkerCommand,
	sshHelperCommand,
	servicePreflightCommand,
	themeCommand,
	traceCommand,
	doctorCommand,
	policyCommand,
	triageCommand,
	cloudEnabled ? connectCommand : connectUnavailableCommand
]));
const cli = makeCli();
function runCli() {
	extendConnectionAttemptTimeout();
	keepOutboundFetchOnHttp1();
	offerCliInstall({
		args: process.argv.slice(2),
		interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY) && process.send === void 0,
		foreground: inTerminalForeground,
		confirm: confirmCliInstall
	}).pipe(catchDefect(() => succeed$1(true)), flatMap$1((proceed) => proceed ? run$1(cli, { version }) : sync(() => {
		process.exitCode = 130;
	})), scoped, provide$1(layerCliRuntime), runMain);
}
export { runCli };

//# sourceMappingURL=binCli-DCAsE3D4.mjs.map