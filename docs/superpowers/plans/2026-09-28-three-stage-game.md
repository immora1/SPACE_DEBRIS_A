# Three-stage orbital game implementation plan

User approved: three substantial decisions, no additional content removal.

Goal: Replace six short encounters with conjunction assessment, resource triage, and end-of-life planning.
Architecture: Keep the existing local event/feedback/result/recovery state machine. Use three ordered bilingual events; retain material-derived starting resources and orbit-specific disposal context. Resource values are teaching simulations.
Tech stack: React, local JavaScript data, Node test runner.

1. Rewrite gameData.js event content and selection; preserve three choices with distinct costs and explanations.
2. Set M4 rounds to three at months 1, 6, 12; expose resource costs and educational status. Require a disposal plan as well as viable resources for success.
3. Update event-count tests and orbit-context expectations; exhaustively evaluate choice combinations and localization. Run tests, lint, build and inspect the diff.

Validation: exactly three ordered events, bilingual choices, safe route passes, neglecting disposal fails, resources carry forward, recovery transition remains intact.
