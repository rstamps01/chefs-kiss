# Decision Log

**Chef's Kiss - Restaurant Resource Planning Platform**

**Last Updated:** December 28, 2024

---

## Purpose

This document records significant architectural, technical, and product decisions made during the development of Chef's Kiss. Each entry includes the context, decision, rationale, alternatives considered, and consequences.

**Format:**
- **Decision ID:** Unique identifier (DEC-XXX)
- **Date:** When the decision was made
- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Context:** What prompted this decision
- **Decision:** What was decided
- **Rationale:** Why this decision was made
- **Alternatives:** Other options considered
- **Consequences:** Trade-offs and implications
- **Related:** Links to other decisions

---

## Decisions

### DEC-001: Use tRPC for API Layer

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose an API architecture for communication between React frontend and Express backend. Options include REST, GraphQL, and tRPC.

**Decision:**
Use tRPC for all API endpoints.

**Rationale:**
1. **End-to-end type safety** - Types flow automatically from server to client
2. **No code generation** - Unlike GraphQL, no build step for types
3. **Developer experience** - Autocomplete and type checking in IDE
4. **Smaller bundle** - No runtime schema validation on client
5. **Simpler than GraphQL** - No schema definition language to learn
6. **Perfect for TypeScript monorepo** - Server and client in same repo

**Alternatives Considered:**
1. **REST API** - Rejected because:
   - Requires manual type definitions on client
   - No automatic type safety
   - More boilerplate (controllers, routes, validation)

2. **GraphQL** - Rejected because:
   - Overkill for this use case (no complex data fetching needs)
   - Requires code generation step
   - Larger bundle size
   - Steeper learning curve

**Consequences:**
- ✅ Faster development with type safety
- ✅ Fewer bugs from type mismatches
- ✅ Better IDE support
- ❌ Tied to TypeScript (not a concern for this project)
- ❌ Less suitable for public API (not needed)

**Related:** DEC-002 (Drizzle ORM)

---

### DEC-002: Use Drizzle ORM for Database

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose an ORM for MySQL database access. Options include Prisma, Drizzle, TypeORM, and raw SQL.

**Decision:**
Use Drizzle ORM for all database operations.

**Rationale:**
1. **Type-safe queries** - Full TypeScript support
2. **Lightweight** - Smaller than Prisma, faster than TypeORM
3. **SQL-like syntax** - Easy to learn for SQL developers
4. **No code generation** - Schema is TypeScript code
5. **Better performance** - Closer to raw SQL than Prisma
6. **Flexible** - Can drop to raw SQL when needed

**Alternatives Considered:**
1. **Prisma** - Rejected because:
   - Slower query performance
   - Requires code generation step
   - Heavier runtime
   - Less flexible for complex queries

2. **TypeORM** - Rejected because:
   - Active Record pattern (less functional)
   - Heavier and slower
   - More complex configuration

3. **Raw SQL** - Rejected because:
   - No type safety
   - More boilerplate
   - Harder to maintain

**Consequences:**
- ✅ Fast query performance
- ✅ Type-safe database access
- ✅ Easy to write complex queries
- ❌ Smaller community than Prisma
- ❌ Fewer learning resources

**Related:** DEC-001 (tRPC)

---

### DEC-003: Single-Location MVP, Multi-Location Architecture

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
Need to decide whether to build multi-location support in MVP or defer to Phase 2. Initial target market is single-location restaurants, but some customers will have multiple locations.

**Decision:**
Build database schema and architecture to support multiple locations, but only expose single-location UI in MVP.

**Rationale:**
1. **Easier to add UI later** - Schema changes are harder than UI changes
2. **Avoid migration pain** - Retrofitting multi-location is complex
3. **Faster MVP** - Don't build location switcher UI yet
4. **Target market** - 80% of initial customers have 1 location
5. **Future-proof** - Ready for expansion when needed

**Alternatives Considered:**
1. **Single-location only** - Rejected because:
   - Would require major schema refactor later
   - Would lose early multi-location customers
   - Migration would be painful

2. **Full multi-location in MVP** - Rejected because:
   - Adds 2-3 weeks to MVP timeline
   - Complicates UI for most users
   - Not needed for initial validation

**Consequences:**
- ✅ Database ready for multi-location
- ✅ Faster MVP delivery
- ✅ Easy to add UI later
- ❌ Can't onboard multi-location customers in MVP
- ❌ Some code assumes single location

**Related:** None

---

### DEC-004: Weather Integration as MVP Feature

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
Weather-based forecasting is a key differentiator, but adds complexity. Should it be in MVP or Phase 2?

**Decision:**
Include weather integration in MVP.

**Rationale:**
1. **Core differentiator** - Main competitive advantage
2. **Proven value** - Sushi Confidential analysis showed 15-20% sales impact
3. **Simple integration** - OpenWeather API is straightforward
4. **Customer expectation** - "Smart forecasting" implies weather
5. **Marketing value** - Strong demo feature

**Alternatives Considered:**
1. **Defer to Phase 2** - Rejected because:
   - Loses main competitive advantage
   - Forecasts would be less accurate
   - Harder to sell without this feature

2. **Manual weather entry** - Rejected because:
   - Poor user experience
   - Unlikely to be used consistently
   - Defeats "automation" value prop

**Consequences:**
- ✅ Strong competitive differentiation
- ✅ More accurate forecasts
- ✅ Better marketing story
- ❌ Adds 5-6 days to MVP timeline
- ❌ Requires API key from users
- ❌ Ongoing API costs (minimal)

**Related:** DEC-005 (LLM Analytics)

---

### DEC-005: LLM Analytics as MVP Feature

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
AI-powered insights are trendy and valuable, but add complexity. Should LLM analytics be in MVP?

**Decision:**
Include LLM-powered analytics in MVP.

**Rationale:**
1. **Market expectation** - AI is expected in 2024 products
2. **Unique value** - Explains "why" not just "what"
3. **Easy integration** - Manus platform provides LLM access
4. **Low cost** - $2-5/month per customer
5. **Competitive advantage** - Most competitors don't have this

**Alternatives Considered:**
1. **Rule-based insights only** - Rejected because:
   - Less flexible
   - Requires hardcoding all scenarios
   - Less impressive to customers

2. **Defer to Phase 2** - Rejected because:
   - Loses competitive advantage
   - Harder to add later (affects all features)
   - Market expects AI in new products

**Consequences:**
- ✅ Strong differentiation
- ✅ Better user experience
- ✅ Flexible insights
- ❌ Adds 4-5 days to MVP timeline
- ❌ Ongoing API costs
- ❌ Quality depends on prompt engineering

**Related:** DEC-004 (Weather Integration)

---

### DEC-006: PDF Reports as MVP Feature

**Date:** December 28, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
PDF report generation is valuable but complex. Should it be in MVP or Phase 2?

**Decision:**
Include PDF report generation in MVP.

**Rationale:**
1. **Proven demand** - Sushi Confidential report was well-received
2. **Professional credibility** - Polished reports build trust
3. **Shareability** - Easy to share with stakeholders
4. **Differentiation** - Most competitors don't offer this
5. **Use case** - Managers want reports for owners/investors

**Alternatives Considered:**
1. **Dashboard exports only** - Rejected because:
   - Less professional
   - Harder to share
   - No narrative/insights

2. **Defer to Phase 2** - Rejected because:
   - Key differentiator
   - Sushi Confidential report proves value
   - Harder to add later (affects data collection)

**Consequences:**
- ✅ Professional deliverable
- ✅ Easy to share with stakeholders
- ✅ Strong marketing asset
- ❌ Adds 5-6 days to MVP timeline
- ❌ Complex to implement (charts in PDF)
- ❌ S3 storage costs

**Related:** DEC-005 (LLM Analytics)

---

### DEC-007: React 19 + Tailwind 4

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose frontend framework and styling approach.

**Decision:**
Use React 19 with Tailwind CSS 4.

**Rationale:**
1. **React 19** - Latest version with better performance
2. **Tailwind 4** - Faster build, better DX
3. **Proven stack** - Widely used and supported
4. **Developer experience** - Fast development with utility classes
5. **Component library** - shadcn/ui works perfectly with this stack

**Alternatives Considered:**
1. **Next.js** - Rejected because:
   - Overkill for this app (no SSR needed)
   - More complex deployment
   - Heavier framework

2. **Vue or Svelte** - Rejected because:
   - Smaller ecosystem
   - Team more familiar with React
   - Fewer component libraries

3. **CSS Modules or Styled Components** - Rejected because:
   - Slower development
   - More boilerplate
   - Tailwind is faster

**Consequences:**
- ✅ Fast development
- ✅ Modern, performant UI
- ✅ Great developer experience
- ❌ Tailwind learning curve for new developers
- ❌ Larger HTML (utility classes)

**Related:** DEC-008 (shadcn/ui)

---

### DEC-008: Use shadcn/ui Component Library

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose a component library for UI consistency and faster development.

**Decision:**
Use shadcn/ui for all UI components.

**Rationale:**
1. **Copy-paste approach** - Components are in your codebase (not node_modules)
2. **Full customization** - Can modify components as needed
3. **Tailwind-native** - Built for Tailwind CSS
4. **Accessible** - Built on Radix UI primitives
5. **Modern design** - Clean, professional look
6. **No bundle bloat** - Only include components you use

**Alternatives Considered:**
1. **Material UI** - Rejected because:
   - Heavier bundle
   - Harder to customize
   - Not Tailwind-native

2. **Ant Design** - Rejected because:
   - Opinionated design (hard to customize)
   - Larger bundle
   - Not Tailwind-native

3. **Build from scratch** - Rejected because:
   - Slow development
   - Accessibility challenges
   - Reinventing the wheel

**Consequences:**
- ✅ Fast development
- ✅ Full control over components
- ✅ Accessible by default
- ✅ Small bundle size
- ❌ Need to copy-paste components (not a package)
- ❌ Manual updates (not automatic)

**Related:** DEC-007 (React + Tailwind)

---

### DEC-009: Session-Based Auth (Manus OAuth)

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose authentication strategy. Options include JWT, session cookies, or third-party auth.

**Decision:**
Use Manus OAuth with HTTP-only session cookies.

**Rationale:**
1. **Platform integration** - Manus provides OAuth out of the box
2. **Security** - HTTP-only cookies prevent XSS attacks
3. **Simplicity** - No need to manage JWT refresh tokens
4. **User experience** - Single sign-on across Manus apps
5. **No password management** - Manus handles it

**Alternatives Considered:**
1. **JWT tokens** - Rejected because:
   - More complex (refresh token rotation)
   - Vulnerable to XSS if stored in localStorage
   - Harder to revoke

2. **Custom auth** - Rejected because:
   - More work (password hashing, email verification, etc.)
   - Security risk (easy to get wrong)
   - Poor UX (another password to remember)

**Consequences:**
- ✅ Secure by default
- ✅ Simple implementation
- ✅ Good user experience
- ❌ Tied to Manus platform (acceptable trade-off)
- ❌ Can't easily migrate auth to another provider

**Related:** None

---

### DEC-010: MySQL Database (via Manus Platform)

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to choose a database. Options include MySQL, PostgreSQL, MongoDB, and others.

**Decision:**
Use MySQL (provided by Manus platform).

**Rationale:**
1. **Platform integration** - Manus provides MySQL automatically
2. **Relational data** - Perfect for our structured data
3. **Mature ecosystem** - Well-supported, stable
4. **Good performance** - Fast for our use case
5. **No setup needed** - Manus handles provisioning

**Alternatives Considered:**
1. **PostgreSQL** - Rejected because:
   - Not provided by Manus platform
   - Would require external hosting
   - No significant advantage for our use case

2. **MongoDB** - Rejected because:
   - NoSQL not ideal for relational data
   - Harder to enforce data integrity
   - Less mature for analytics queries

**Consequences:**
- ✅ Zero setup
- ✅ Managed by platform
- ✅ Good performance
- ❌ Tied to Manus platform
- ❌ Can't use PostgreSQL-specific features

**Related:** DEC-002 (Drizzle ORM)

---

### DEC-011: CSV Import for POS Data (Not Direct API)

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
Need to decide how users will import POS data. Options include direct API integration or CSV upload.

**Decision:**
Start with CSV upload, add direct API integration in Phase 2.

**Rationale:**
1. **Universal compatibility** - All POS systems can export CSV
2. **Faster MVP** - No need to integrate 5+ POS APIs
3. **User control** - Users can clean data before import
4. **No API keys needed** - Simpler onboarding
5. **Proven approach** - Many tools use CSV import

**Alternatives Considered:**
1. **Direct API integration** - Deferred to Phase 2 because:
   - Requires integrating Toast, Square, Clover, Lightspeed, etc.
   - Each API is different (weeks of work)
   - Requires users to provide API keys
   - Not all POS systems have APIs

2. **Manual data entry** - Rejected because:
   - Too slow and error-prone
   - Poor user experience
   - Not scalable

**Consequences:**
- ✅ Faster MVP
- ✅ Works with any POS system
- ✅ Simpler onboarding
- ❌ Manual step for users
- ❌ Less "automated" than direct API
- ❌ Data may be stale

**Related:** None

---

### DEC-012: Ingredient-Level Prep Planning (Not Recipe-Level)

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
Need to decide granularity of prep planning. Should we plan at recipe level or ingredient level?

**Decision:**
Generate prep plans at ingredient level (e.g., "2.5 lbs sushi rice") not recipe level (e.g., "20 California Rolls").

**Rationale:**
1. **More actionable** - Chefs prep ingredients, not recipes
2. **Handles shared ingredients** - Rice used in multiple recipes
3. **Reduces waste** - Prep exactly what's needed
4. **Competitive advantage** - Most tools only do recipe-level
5. **Matches workflow** - How chefs actually work

**Alternatives Considered:**
1. **Recipe-level planning** - Rejected because:
   - Less granular
   - Doesn't handle shared ingredients well
   - Less useful for chefs

2. **Both levels** - Rejected for MVP because:
   - More complex
   - Confusing UI
   - Not needed initially

**Consequences:**
- ✅ More accurate prep planning
- ✅ Reduces waste
- ✅ Competitive differentiation
- ❌ Requires recipe-ingredient mapping
- ❌ More complex calculations

**Related:** None

---

### DEC-013: Use Manus Platform for Hosting

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Development Team

**Context:**
Need to decide where to host the application. Options include Manus platform, Vercel, AWS, or other cloud providers.

**Decision:**
Host on Manus platform.

**Rationale:**
1. **Integrated development** - Build and deploy in one place
2. **Zero DevOps** - No need to configure servers, databases, etc.
3. **Built-in services** - Auth, database, storage, LLM all provided
4. **Custom domains** - Can use custom domain (chefskiss.com)
5. **Cost-effective** - All-in-one pricing

**Alternatives Considered:**
1. **Vercel + Supabase** - Rejected because:
   - More services to manage
   - More expensive at scale
   - More complex setup

2. **AWS** - Rejected because:
   - Requires DevOps expertise
   - Complex setup (EC2, RDS, S3, etc.)
   - More expensive

**Consequences:**
- ✅ Fast deployment
- ✅ Zero DevOps
- ✅ All services integrated
- ❌ Tied to Manus platform
- ❌ Less control over infrastructure

**Related:** DEC-009 (Auth), DEC-010 (Database)

---

### DEC-014: Progressive Web App (Not Native Mobile)

**Date:** December 27, 2024  
**Status:** Accepted  
**Decider:** Product Team

**Context:**
Need to decide whether to build native mobile apps or use responsive web app. Target users are restaurant managers who may use tablets in the kitchen.

**Decision:**
Build responsive web app (PWA), not native mobile apps.

**Rationale:**
1. **Single codebase** - Web works on desktop, tablet, mobile
2. **Faster development** - No need to build iOS + Android apps
3. **Instant updates** - No app store approval process
4. **Lower cost** - One team instead of three (web, iOS, Android)
5. **PWA features** - Can install to home screen, work offline

**Alternatives Considered:**
1. **Native iOS + Android apps** - Rejected because:
   - 3x development time
   - 3x maintenance cost
   - App store approval delays
   - Most users will use desktop anyway

2. **React Native** - Rejected because:
   - Still need to maintain two codebases
   - Performance not critical for this app
   - Web is sufficient for use case

**Consequences:**
- ✅ Faster development
- ✅ Lower cost
- ✅ Instant updates
- ❌ No app store presence
- ❌ Limited offline functionality (acceptable)
- ❌ Can't use native device features (not needed)

**Related:** DEC-007 (React + Tailwind)

---

## Decision Process

**How to add a new decision:**

1. **Identify the decision** - What needs to be decided?
2. **Gather context** - Why is this decision needed?
3. **List alternatives** - What are the options?
4. **Evaluate trade-offs** - Pros and cons of each option
5. **Make decision** - Choose the best option
6. **Document** - Add entry to this log using the template
7. **Communicate** - Share with team
8. **Review** - Revisit periodically to validate

**Template:**
```markdown
### DEC-XXX: Decision Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded  
**Decider:** Who made the decision

**Context:**
What prompted this decision?

**Decision:**
What was decided?

**Rationale:**
Why was this decision made?

**Alternatives Considered:**
1. **Option A** - Why rejected
2. **Option B** - Why rejected

**Consequences:**
- ✅ Positive consequence
- ❌ Negative consequence

**Related:** DEC-XXX, DEC-YYY
```

---

**Document Maintenance:**
- Add new decisions as they are made
- Review decisions quarterly
- Mark decisions as deprecated when superseded
- Link related decisions

**Last Reviewed:** December 28, 2024  
**Next Review:** March 28, 2025
