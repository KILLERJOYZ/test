# Vietnam-first AI device adviser: research package

Prepared 10 November 2026. Initial platforms: Windows desktop and Android. Initial market: Vietnam; architecture should support later country expansion.

This is a research and planning package. It does not represent a built app, a tested recommendation model, acquired data licenses, retailer integrations, or verified live purchasing offers.

A separate [frontend review demo](../apps/adviser/README.md) is now available with synthetic data. It demonstrates a subset of the planned flow in a browser and does not establish completion of the native or live-AI gates.

Current planning package, 11 November 2026: BRD/traceability v2.3; companion implementation plan retains its own version.

- [Business requirements document](../docs/planning/BRD.md): complete user/admin journeys, admin necessity and needs-rule analysis, detailed acceptance cases, lifecycle/price/evidence policies, operating roles, metric definitions and scope decisions.
- [Demo-first implementation plan](../docs/planning/IMPLEMENTATION_PLAN.md): gated native demo, work-package subtasks, state/API/AI contracts, verification evidence, release/rollback procedures and production transition.
- [Traceability register](../docs/planning/project-traceability.json): 37 documented journeys, 77 acceptance criteria, business-rule/nonfunctional mappings and work-package dependencies; partial browser evidence is tracked separately. U19 adds a planned contextual chatbot invitation and has no source spreadsheet row or delivery-stage assignment yet; picker additions and native/production acceptance remain pending.

- [Laptop picker research](./laptop-picker-research.md): reference capabilities, evidence limits, current frontend gaps and the U01/A06/A07 extension.
- [Research and product strategy](./project-research.md): competitor findings, opportunities, Vietnam pricing, recommendation design, PC configuration logic, and business implications.
- [Technical and design blueprint](./technical-blueprint.md): React Native feasibility, native WinUI 3 and Material 3 Expressive integration, shared components, system/data architecture, and performance budgets.
- [Delivery and validation plan](./delivery-plan.md): staged roadmap, backlog, research experiments, launch gates, and unresolved decisions.
- [Project scope](./project-scope.md): recommended first-release boundary, data operations, platform dependencies, and later expansion.
- [First demo implementation plan](./demo-implementation-plan.md): runnable Android/Windows demo, native feasibility gate, sample data, screen flows, implementation backlog, and completion criteria.
- [Source register](./sources.md): primary sources, what each supports, and access limitations.
- [Differentiation strategy](./differentiation-strategy.md): signature experiences, development priorities, and an evidence-driven path to defensibility.
- [Buyer needs and master feature inventory](./business-needs-and-feature-inventory.md): buying signals, buyer segments, 72 suggested capabilities, and validation priorities; also available as [structured JSON](./feature-inventory.json).
- [Mobile interface strategy](./mobile-interface-strategy.md): structured discovery with contextual AI, mobile navigation, creative interactions, and a validation plan.
- [Onboarding questionnaire research](./onboarding-questionnaire-research.md): sourced guidance, common questions, device/workload branches, and a [28-question protocol](./onboarding-question-bank.json).

Recommended first milestone: prove native UI integration and one complete sample-data buying journey on both platforms, then add bounded real AI assistance and review the demo. A small permitted, audited laptop catalog and real-offer operations follow the demo decision before production pilot implementation. The earlier 72-capability inventory is historical research; use the consolidated BRD and live journey backlog when planning current scope.
