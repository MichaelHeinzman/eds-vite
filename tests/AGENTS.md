# Test Instructions

- Keep unit and component tests deterministic; mock network boundaries rather than real Adobe services.
- Put browser journeys in `e2e/` and run them against the production preview server.
- Every responsive E2E route must assert that the document has no horizontal overflow.
- Cover pending, success, and failure feedback when adding or changing async actions.
