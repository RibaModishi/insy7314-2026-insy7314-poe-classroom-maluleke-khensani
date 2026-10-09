# HustleHub Part 2 Rubric Checklist

This is a source review against the Part 2 rubric in the assignment brief. “Implemented” confirms relevant code/documentation exists; it does not replace live test results or submission evidence. No mark estimate is implied.

| Item | Marks | Status | Checklist / remaining evidence |
|---|---:|---|---|
| Application functionality | 20 | Implemented; live flow needs proof | Auth, gig CRUD, browsing, booking, transaction/refund, booking status, and freelancer income are present. Run the complete journey on a replica-set MongoDB and record it. |
| RBAC enforcement | 15 | Implemented; test evidence pending | Roles and ownership checks protect actions and records; RBAC denial collection is present. Run `npm run test:rbac` and save results. |
| API security: JWT, validation, sanitisation | 15 | Implemented with a sanitisation caveat | JWT, role/ownership checks, validation, trimming, length/type checks, ID checks, safe errors, and gig-field whitelisting are present. A standalone HTML sanitiser is not used; verify the marker’s expectation and show invalid input denials. |
| Rate limiting | 10 | Implemented; test evidence pending | General API, login, registration, and booking limits return useful JSON 429 responses. Run the Newman collection and capture results. |
| Security headers: Helmet + CSP | 10 | Implemented; response evidence pending | Helmet and restrictive API CSP are configured. Capture header checks in Postman/Newman. |
| React frontend | 10 | Implemented | The client connects to the API and includes auth, browsing, role-based views, gig publishing, booking, dashboard, and error feedback. Demonstrate both user roles. |
| Backend testing: Postman + Newman | 10 | Collections present; successful run not evidenced | Run `npm test` and `npm run test:rbac` from `api/` with the team database configured; retain reports/screenshots. |
| Frontend testing | 5 | Checked: 2 tests pass and production build succeeds | Save/capture the terminal output for submission. |
| README | 5 | Present | Setup, roles, architecture, routes, RBAC, security, and testing are documented in `README.md`. Include it in GitHub submission. |
| GitHub deduction | up to -5 | Not done in this local folder | There are no commits or configured remote in this copy. Push to the group repository and ensure contribution/commit evidence is visible. |

## Final hand-in evidence

- [x] Client tests (2 passed) and production build (succeeded); save/capture the terminal output.
- [ ] Successful full-flow and RBAC Newman reports/screenshots.
- [ ] Demo video: register/sign in, freelancer publishes a gig, client browses and books, transaction appears, freelancer sees income, and one unauthorised action is denied.
- [ ] Required application screenshots.
- [ ] Group GitHub repository with README and visible team contribution history.

## Basic Part 2 feature check

- [x] Client and freelancer registration/login with hashed passwords and JWT authentication.
- [x] Freelancer creates, updates, and deletes owned service gigs; clients can browse and book them.
- [x] Booking and simulated payment are recorded together; cancellation records a refund.
- [x] Client/freelancer booking views, permitted status transitions, transaction views, and freelancer income totals.
- [x] Role/ownership enforcement, input validation, API security headers/CSP, and rate limiting.
- [ ] Execute Newman collections against the group database and retain results.
- [x] Run frontend render/search tests and production build.
- [ ] Record the demo and submit GitHub/evidence items above.

**Database note:** Booking/payment and cancellation/refund writes use MongoDB transactions, so the database must support replica sets. A standalone local MongoDB installation will not run those flows correctly.

**Part 3 scope:** Tax estimates, containers, CI/CD, monitoring/logging, and extended security are listed for Part 3, not counted as missing Part 2 features here.
