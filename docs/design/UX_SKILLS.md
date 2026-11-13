# Project UX review skills

Installed on 13 November 2026 from [uxuiprinciples/agent-skills](https://github.com/uxuiprinciples/agent-skills), pinned to commit [`8f14fb5f5ee96a00f5b92c69699008b73fe478f5`](https://github.com/uxuiprinciples/agent-skills/tree/8f14fb5f5ee96a00f5b92c69699008b73fe478f5). The five upstream `SKILL.md` files are unmodified and project-local. The host discovered all five after installation; they are available to subsequent turns.

| Skill | Project file | Use |
|---|---|---|
| uxui-evaluator | [SKILL.md](../../.agents/skills/uxui-evaluator/SKILL.md) | Screen evaluation and prioritized findings |
| interface-auditor | [SKILL.md](../../.agents/skills/interface-auditor/SKILL.md) | Detect observable UX antipatterns |
| ai-interface-reviewer | [SKILL.md](../../.agents/skills/ai-interface-reviewer/SKILL.md) | AI disclosure, user control, recovery and evidence |
| flow-checker | [SKILL.md](../../.agents/skills/flow-checker/SKILL.md) | Preflight/postflight flow assessment |
| vibe-coding-advisor | [SKILL.md](../../.agents/skills/vibe-coding-advisor/SKILL.md) | Constraints for future component implementation |

The first four were applied to the [13 November audit](FRONTEND_DESIGN_AUDIT_2026-11-13.md). The planning follow-up applies `vibe-coding-advisor` to the [first implementation-slice context](FRONTEND_IMPLEMENTATION_CONTEXT.json), alongside the [frontend plan](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) and [motion specification](FRONTEND_MOTION_SPEC.md). These reviews and planning artifacts do not generate or redesign app components.

## Reproducibility and limits

Installation used the system skill-installer helper with `--repo uxuiprinciples/agent-skills --ref 8f14fb5f5ee96a00f5b92c69699008b73fe478f5 --path uxui-evaluator interface-auditor ai-interface-reviewer flow-checker vibe-coding-advisor --dest E:\test\.agents\skills`.

[SHA-256 records](../../apps/adviser/verification/m3-expressive-2026-11-13/source-hashes.json) identify the installed files and reviewed app sources. Upstream's README says the skills are free to use and distribute; retain the upstream author metadata. No additional licensing terms were invented.

`UXUI_API_KEY` was absent in the execution environment. No paid API was called, no key was added, and no app material was sent to that service. All four review artifacts have `api_enriched: false`. The flow skill explicitly permits an internal-knowledge fallback even though its live checklists require a pro key. These artifacts are heuristic reviews, not a completed API audit of all 195 principles.

Use only principle codes actually present in the installed skill; leave unknown codes null and explain this deviation instead of fabricating taxonomy identifiers. The skill text has inconsistent taxonomy counts and a code-format requirement that conflicts with its own examples. Do not repeat its unverified numerical productivity or conversion claims. A count of controls alone is not evidence of cognitive overload, and the 7±2 memory heuristic is not a universal maximum for visible options.

## Project review context

Use lowercase [brd.md](../../brd.md), especially AC-UX01–05. Identify the actual entry point before reviewing: currently both `apps/adviser/index.js` and `src/main.web.tsx` import `AdviserApp.tsx`. `AndroidApp.tsx`, the old purple/lime tokens, and older screenshots do not establish the current implementation's behavior.

Keep structured skill output as JSON, with the human-readable research and evidence report alongside it. Distinguish source inspection, browser preview, native device observations, and unknowns. Use the [Material 3 Expressive research guide](MATERIAL_3_EXPRESSIVE_RESEARCH.md) for system-specific criteria. Preserve unrelated working-tree changes during reviews.
