export interface SystemDesignPatternCard {
  id: string;
  title: string;
  problem: string;
  pattern: string;
  tradeOffs: {
    consistency: string;
    latency: string;
    cost: string;
    operationalComplexity: string;
  };
  whenToUse: string[];
  whenNotToUse: string[];
  concreteImplementation: {
    tier0Local: string;
    tier1CloudVM: string;
    tier2Scaled: string;
    tier3Hyperscale: string;
  };
  sources: string[];
}

export const SYSTEM_DESIGN_PATTERNS: SystemDesignPatternCard[] = [
  {
    id: 'hybrid-fanout',
    title: 'Hybrid Fan-Out for Feeds and Timelines',
    problem: 'When high-follower accounts post, writing to millions of follower inboxes creates an unbearable write burst (Fan-Out on Write). Conversely, querying all followed accounts on every feed load creates high read latency (Fan-Out on Read).',
    pattern: 'Use Fan-Out on Write for standard users (<25k followers) into a fast key-value cache. For celebrity or verified accounts (>25k followers), do not fan-out on write; instead, fetch celebrity posts at read time (Fan-Out on Read) and merge with the cached inbox.',
    tradeOffs: {
      consistency: 'Eventually consistent (inboxes update within 1-2 seconds).',
      latency: 'Sub-50ms feed reads for 99% of requests.',
      cost: 'Moderate RAM usage for timeline caches; drastically lowers database write IOPS.',
      operationalComplexity: 'Requires an async background worker queue to manage inbox fan-out.'
    },
    whenToUse: [
      'Social feeds, activity streams, notification systems, photo/video sharing apps with uneven follower distributions.'
    ],
    whenNotToUse: [
      'Applications where every user has identical engagement (e.g. 5-person private team chat: simple query is better).'
    ],
    concreteImplementation: {
      tier0Local: 'SQLite index on (user_id, created_at) with in-memory array merge.',
      tier1CloudVM: 'PostgreSQL with indexed timeline table + Redis sorted set (ZADD/ZREVRANGEBYSCORE).',
      tier2Scaled: 'Redis Cluster / AWS ElastiCache for timelines + SQS/Celery worker queue for background distribution.',
      tier3Hyperscale: 'Apache Kafka event stream + distributed in-memory timeline store (RocksDB/Cassandra) with dynamic celebrity thresholding.'
    },
    sources: ['awesome-scalability (Twitter timeline, Instagram architecture)', 'ByteByteGo 101']
  },
  {
    id: 'sharded-distributed-counters',
    title: 'Sharded Counters for Write-Heavy Metrics',
    problem: 'Single-row database updates for likes, views, or upvotes become catastrophic bottlenecks under viral spikes (row-level locking, deadlocks, and connection pool starvation).',
    pattern: 'Distribute counter increments across N slots (e.g., 10 to 100 slots). Each write hits slot = hash(user_id) % N or random slot. Total count is obtained by aggregating SUM(slots). For UI responsiveness, apply optimistic UI locally while writes batch in the background.',
    tradeOffs: {
      consistency: 'Eventually consistent read aggregation; instantaneous write acceptance.',
      latency: 'Write latency <5ms (no row locking); aggregate read latency <10ms.',
      cost: 'Negligible extra storage (N integer rows per post).',
      operationalComplexity: 'Low; requires a simple trigger or periodic materialized roll-up.'
    },
    whenToUse: [
      'Viral video/photo likes, live stream view counters, high-traffic upvotes, voting polls.'
    ],
    whenNotToUse: [
      'Financial ledgers, inventory checkout where strict ACID point-in-time balance is mandatory.'
    ],
    concreteImplementation: {
      tier0Local: 'In-memory counter map flushed to SQLite every 5 seconds.',
      tier1CloudVM: 'Redis INCRBY buffer flushed in periodic batches to PostgreSQL.',
      tier2Scaled: 'Distributed Redis counter with write-behind queue to Aurora PostgreSQL.',
      tier3Hyperscale: 'Sharded DynamoDB / Cassandra counters with Apache Flink streaming roll-up.'
    },
    sources: ['system-design-primer (Distributed Counters)', 'ByteByteGo 101']
  },
  {
    id: 'cache-aside-write-through',
    title: 'Cache-Aside with TTL & Write-Through Invalidation',
    problem: 'Direct database queries on high-traffic read paths saturate connection pools and increase p99 latency beyond 500ms.',
    pattern: 'Application queries the cache first. If cache miss occurs, fetch from database, populate cache with a jittered TTL, and return. On write/update, invalidate or update the cache key immediately to prevent stale reads.',
    tradeOffs: {
      consistency: 'Possible brief inconsistency window during cache propagation.',
      latency: 'p95 latency drops from ~120ms to ~3ms.',
      cost: 'Cost of in-memory caching instance (Redis / Memcached).',
      operationalComplexity: 'Requires handling cache stampedes (mutex/singleflight) and cache penetration (null object caching).'
    },
    whenToUse: [
      'Read-heavy workloads (>80% reads), user profiles, product catalogs, public content.'
    ],
    whenNotToUse: [
      'Write-heavy workloads with near-zero repeat reads.'
    ],
    concreteImplementation: {
      tier0Local: 'In-memory LRU cache (`lru-cache` npm package) with 60s TTL.',
      tier1CloudVM: 'Single Redis instance on localhost (127.0.0.1:6379) or managed Redis.',
      tier2Scaled: 'AWS ElastiCache Redis replication group with read replicas and auto-failover.',
      tier3Hyperscale: 'Multi-region Redis active-active with CloudFront edge caching.'
    },
    sources: ['system-design-primer', 'karanpratapsingh-system-design']
  },
  {
    id: 'token-bucket-rate-limiter',
    title: 'Distributed Token Bucket Rate Limiter',
    problem: 'Sudden burst traffic, malicious bots, or infinite client retry loops can saturate application compute and cause cascading failure.',
    pattern: 'Maintain a token bucket per client IP/API key. Each request consumes 1 token. Tokens refill at a steady rate. If bucket is empty, return HTTP 429 Too Many Requests with a Retry-After header. Protects both edge and internal microservices.',
    tradeOffs: {
      consistency: 'Strong consistency per rate-limit window.',
      latency: '<1ms overhead using atomic Redis Lua scripts.',
      cost: 'Minimal memory footprint (~50 bytes per active client).',
      operationalComplexity: 'Low; standard middleware pattern.'
    },
    whenToUse: [
      'Public APIs, login endpoints, video/image upload routes, search endpoints.'
    ],
    whenNotToUse: [
      'High-throughput internal RPCs between trusted microservices on private VPC networks.'
    ],
    concreteImplementation: {
      tier0Local: 'In-memory sliding window rate limiter in Express/Fastify middleware.',
      tier1CloudVM: 'Nginx `limit_req_zone` or Redis sliding-log middleware.',
      tier2Scaled: 'Cloudflare / AWS WAF edge rate limiting + Redis cluster rate limiter.',
      tier3Hyperscale: 'Global edge rate limiting (Cloudflare Workers / AWS API Gateway) with tiered quotas.'
    },
    sources: ['karanpratapsingh-system-design', 'ByteByteGo 101']
  }
];
