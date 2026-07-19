
## Pre-Deployment Rule
Before committing and pushing ANY code to the production main branch, the agent MUST execute the `./scripts/pre_deploy.sh` script and verify that it passes 100%. If it fails, the agent MUST fix the errors before pushing. This guarantees zero downtime for the restaurant business.
