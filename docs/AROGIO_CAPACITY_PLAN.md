# Capacity target: 3 million simultaneous users

Confirmed by the user on 10 November 2026. This is a design target, not supported capacity. Existing NestJS, PostgreSQL and single-process throttle/pool settings do not prove this target.

## Explicit workload assumptions, requiring measurement

3,000,000 connected/foreground sessions are not 3,000,000 requests per second. At one request every 30 seconds the mean demand is 100,000 RPS; at 60 seconds it is 50,000 RPS. The current signed-in wellness refresh interval alone could approach 50,000 RPS if all three million sessions own an account and are active. Five initial public requests per session over a five-minute arrival window add 50,000 RPS before retries. These are arithmetic scenarios, not predictions.

Use measured session mix, authenticated fraction, geography, search rate, payload sizes and burst distribution. Set separate budgets for public reads, private reads/writes, health sync uploads, auth and AI. AI must have explicit per-user quotas and global admission controls. Do not fund inference at unrestricted directory traffic rates.

## Required architecture and acceptance work

1. Serve immutable media from object storage/CDN. Cache only approved public catalogs at the edge with explicit invalidation/review expiry. Never cache private profile/health data publicly.
2. Put stateless API replicas behind a load balancer with bounded concurrency, timeout and retry budgets. Use distributed, identity-aware rate limits; the current in-memory IP throttle is neither cross-replica consistent nor safe evidence for shared NAT traffic.
3. Load-test query plans/indexes with realistic record counts. Bound database connections through a pooler; size replicas from measured throughput and latency. Add read replicas/search infrastructure only where measured bottlenecks justify them. Avoid opening one DB connection per mobile session.
4. Replace unconditional private polling with measured foreground/freshness policy, jitter and conditional responses; invalidate after writes. Protect reconnect bursts with backoff and server admission control. Offline clients must not retry in a tight loop.
5. Queue notifications/imports/exports and cap worker concurrency. Jobs must be idempotent and observable. Keep public source corrections separate from sensitive-health pipelines.
6. Track p50/p95/p99 latency, error/429 rates, DB pool wait/saturation, CPU/memory, queue age, edge hit ratio and costs by endpoint. Redact PHI/tokens/search terms.
7. Test phased arrival-rate loads in isolated staging: smoke, endpoint capacity, realistic mixed workloads, bursts/reconnects, dependency failure and soak. Use distributed generators for million-session simulation. Verify generator saturation separately.

scripts/care-load.js in the backend currently runs only 10-50 virtual users and refuses production. It is a smoke check, not a three-million-concurrent test, and has NOT been run. Do not simply change its target to three million. A controlled infrastructure plan and an approved staging environment are prerequisites.

Acceptance must define traffic mix, sustained duration, latency/error SLOs, recovery behavior and monthly cost budget before provisioning. No production load is authorized by the request to redesign the app or build an APK.
