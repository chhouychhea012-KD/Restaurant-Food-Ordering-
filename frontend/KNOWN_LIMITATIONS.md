# Known Limitations

- The project is still using frontend-only mock persistence via `localStorage`.
- Authentication is demo-session based and is not backed by secure server-issued tokens.
- Milestones 0 and 1 are in good shape, Milestone 2 has working restaurant, branch, verification, suspension, and menu CRUD behavior, and Milestone 3 now has a stronger customer ordering flow, but the full AGENTS scope through Milestone 8 is not complete yet.
- Customer ordering now covers branch-aware cart replacement, voucher handling, loyalty redemption, and checkout revalidation, but later-stage fee engines, promotion eligibility breadth, and deeper pricing rules still need milestone-specific implementation.
- Kitchen, dispatch, rider, analytics, and support workflows are present in demo form but are not yet fully expanded to the complete AGENTS acceptance checklist.
- E2E coverage is still narrow and does not yet cover the full end-to-end order, dispatch, promotion, and analytics stories required by the spec.
- Playwright execution depends on browser binaries being available in the environment.

