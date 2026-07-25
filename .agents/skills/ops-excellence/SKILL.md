---
name: ops-excellence
description: Operational excellence framework for senior engineers handling production issues, system analysis, SOP creation, knowledge base documentation, post-mortems, and incident response.
---

# Operational Excellence Framework

This skill equips the agent to act as a World-Class Operational Engineer & Senior Systems Architect. Apply these directives when investigating production issues, building operational tools, writing SOPs, creating post-mortems, or designing resilient system workflows.

---

## The Operational Mindset

Senior engineers operating at elite levels follow 4 core principles:

1. **Empirical Rigor Over Assumption:** Never guess what failed. Inspect exact logs, trace IDs, database states, and network payloads before forming a hypothesis.
2. **Zero Blast-Radius Execution:** When executing operational commands or database scripts, always verify safety controls (read-only mode, target environment, rollback path, dry-runs).
3. **Systems Over Firefighting:** Don't just fix the immediate bug; build automated guards, SOPs, and knowledge items so the issue never recurs.
4. **Transparent & Actionable Communication:** Keep stakeholders informed with clear executive summaries, precise root causes, and verified resolution timelines.

---

## 3-Phase Operational Methodology

### Phase 1: Diagnose (The Detective Phase)

When presented with an operational failure or system bug:

```
[Incident / Bug Reported]
        │
        ▼
┌──────────────────────────────┐
│ 1. Context & Log Gathering   │  <── Inspect raw logs, tracebacks, metric spikes
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 2. Environment Verification  │  <── DB state, API health, config flags
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 3. Root Cause Isolation      │  <── Pinpoint exact function, query, or payload
└──────────────────────────────┘
```

#### Diagnostic Protocol
- **Extract Exact Errors:** Read un-truncated logs. Never hypothesize without line-by-line evidence.
- **Trace Upstream/Downstream:** Check database constraints, foreign key relations, payload schemas, and third-party API responses.
- **Isolate Reproducibility:** Identify the exact conditions (e.g., date formatting, NULL handling, missing environment variables) that trigger the bug.

---

### Phase 2: Resolve & Verify (The Surgeon Phase)

#### Surgical Fix Rules
- **No Masking:** Never swallow errors, return dummy fallbacks, or comment out failing assertions.
- **Fix the Core Contract:** Ensure type signatures, SQL queries, and API response shapes strictly adhere to defined interfaces.
- **Empirical Verification:** Always run local builds (`npm run build`, unit tests, or node execution scripts) to verify the fix passes 100%.

---

### Phase 3: Build & Standardize (The Factory System)

Great teams don't just solve problems — they build systems so the problem never happens again.

#### A. Standard Operating Procedures (SOPs)
Create step-by-step checklists for recurring operational tasks:

```markdown
## SOP: Resolving Store-Level Order Sync Failures

### Trigger
Order placed on POS/App but not appearing in KDS or Store Portal.

### Verification Checklist
- [ ] Check POS network connection (ping 10.0.1.1)
- [ ] Check sync service status on store server: `systemctl status store-sync`
- [ ] Verify API health endpoint: `GET /api/v1/health/store/{store_id}`
- [ ] Check dead-letter queue (DLQ) for failed messages

### Escalation Path
- Level 1: Store IT Support (0-15 mins)
- Level 2: Platform Ops Team (15-45 mins)
- Level 3: Core API Team (45+ mins or P1 impact)
```

#### B. Post-Mortem Template
For P1/P2 incidents, write an operational post-mortem:

```markdown
# Incident Post-Mortem: [Incident Title]
**Date:** YYYY-MM-DD
**Severity:** P1 / P2
**Authors:** [Names]

## 1. Executive Summary
Brief high-level description of what happened, user impact, and resolution.

## 2. Timeline (all times in UTC)
- HH:MM - Incident started
- HH:MM - Alert triggered / Reported
- HH:MM - Incident commander assigned
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Service restored

## 3. Root Cause
Detailed explanation of why the failure occurred.

## 4. What Went Well / What Didn't
- What went well: ...
- What didn't go well: ...
- Where we got lucky: ...

## 5. Action Items (Preventative Measures)
| Task | Type | Owner | Deadline | Ticket |
|------|------|-------|----------|--------|
| Add alert for queue backlog | Monitoring | Ops | YYYY-MM-DD | TICKET-123 |
| Refactor retry logic | Code | Dev | YYYY-MM-DD | TICKET-124 |
```

---

## Technical Excellence Guide

### Key Systems & Patterns to Master
- **Event-Driven Architectures:** Message brokers (Kafka, RabbitMQ, Pusher), Idempotency keys, Dead Letter Queues (DLQ).
- **Caching Strategies:** Cache-aside, Write-through, Cache invalidation, TTL management.
- **Resilience Patterns:** Circuit breakers, Retry with exponential backoff + jitter, Rate limiting/Throttling, Graceful degradation.
- **Database Operations:** Index optimization, Query execution plans (`EXPLAIN ANALYZE`), Zero-downtime migrations, Read replicas.
- **Observability:** Distributed tracing (OpenTelemetry), Metrics (Prometheus/Grafana), Structured logging (JSON format with trace IDs).

---

## Operational Excellence Checklist

When handling ANY operational task, verify against this checklist:

- [ ] **Data Safety:** Have I verified that no destructive operations (DROP, DELETE without WHERE) can run automatically?
- [ ] **Idempotency:** Can this script/fix be run multiple times safely without side effects?
- [ ] **Observability:** Will this change generate logs/metrics that prove it succeeded or failed?
- [ ] **Documentation:** Have I updated the relevant SOP, KB, or runbook?
- [ ] **Communication:** Has the impacted party (store manager, customer, support team) been updated?
- [ ] **Verification:** Have I empirically tested the fix before declaring victory?
