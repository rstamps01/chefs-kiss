# Chef's Kiss Documentation

**Restaurant Resource Planning Platform**

**Version:** 0.1.0 (MVP)  
**Last Updated:** December 28, 2024

---

## Welcome

This directory contains comprehensive documentation for the Chef's Kiss platform. Whether you're continuing development in Manus, switching to Cursor, or onboarding a new team member, these documents provide all the context you need.

---

## Quick Start

**New to the project?** Read these in order:
1. [README.md](../README.md) - Project overview and setup
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and technology choices
3. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Coding standards and workflows
4. [FEATURE_STATUS.md](./FEATURE_STATUS.md) - Current implementation status

**Resuming development?** Read these:
1. [HANDOFF_20251228.md](./HANDOFF_20251228.md) - Latest session handoff
2. [FEATURE_STATUS.md](./FEATURE_STATUS.md) - What's done and what's next
3. [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Active bugs and workarounds

**Need API details?**
1. [API_REFERENCE.md](./API_REFERENCE.md) - Complete tRPC and database reference

**Understanding decisions?**
1. [DECISION_LOG.md](./DECISION_LOG.md) - Why we made key choices

---

## Documentation Index

### Core Documentation

#### [ARCHITECTURE.md](./ARCHITECTURE.md)
**System design, technology choices, and architectural decisions**

**Contents:**
- High-level system architecture
- Technology stack rationale (React, tRPC, Drizzle, MySQL)
- Frontend architecture (components, routing, state management)
- Backend architecture (tRPC procedures, database queries)
- Database schema design
- External integrations (Weather API, LLM, S3 storage)
- Security architecture
- Deployment architecture
- Scalability considerations
- Future architecture plans

**When to read:**
- Starting development
- Making architectural decisions
- Understanding system design
- Evaluating technology choices

**Length:** ~7,500 words

---

#### [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
**Coding standards, patterns, testing requirements, and workflows**

**Contents:**
- Development environment setup
- Project structure and file organization
- Coding standards (TypeScript, React, CSS)
- Design patterns and best practices
- Database development workflow
- API development workflow
- Frontend development workflow
- Testing strategy and requirements
- Git workflow and branching strategy
- Code review checklist
- Common pitfalls and how to avoid them

**When to read:**
- Writing code
- Reviewing code
- Setting up development environment
- Understanding project conventions

**Length:** ~6,000 words

---

#### [API_REFERENCE.md](./API_REFERENCE.md)
**Complete inventory of tRPC procedures, database schema, and external integrations**

**Contents:**
- tRPC API endpoints (all procedures)
- Request/response types
- Database schema (all 15 tables)
- Table relationships and foreign keys
- External API integrations (Weather, LLM, S3)
- Error handling
- Authentication requirements
- Rate limiting
- API usage examples

**When to read:**
- Calling API endpoints
- Understanding database schema
- Integrating external services
- Debugging API issues

**Length:** ~5,500 words

---

#### [FEATURE_STATUS.md](./FEATURE_STATUS.md)
**Current implementation status, in-progress work, and prioritized next steps**

**Contents:**
- MVP feature checklist (what's done, what's not)
- Phase 2 features (planned)
- Phase 3 features (future)
- Current sprint status
- In-progress work
- Blocked items
- Prioritized next steps (Top 3 + upcoming)
- Feature dependencies
- Estimated completion timeline

**When to read:**
- Planning work
- Understanding project status
- Prioritizing features
- Reporting progress

**Length:** ~4,000 words

---

#### [DECISION_LOG.md](./DECISION_LOG.md)
**Record of key decisions, trade-offs, and why alternatives were rejected**

**Contents:**
- 14 documented decisions (tRPC, Drizzle, React, etc.)
- Context for each decision
- Rationale and trade-offs
- Alternatives considered and why rejected
- Consequences (pros and cons)
- Related decisions
- Decision-making process

**When to read:**
- Understanding why things are built a certain way
- Making new architectural decisions
- Evaluating whether to change a decision
- Onboarding new team members

**Length:** ~5,000 words

---

#### [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
**Active bugs, limitations, technical debt, and workarounds**

**Contents:**
- 11 active issues (with severity, workarounds, and fixes)
- 4 feature limitations (by design)
- 4 technical debt items
- Resolved issues
- Issue reporting process
- Prioritization criteria

**When to read:**
- Debugging issues
- Understanding limitations
- Planning bug fixes
- Avoiding known pitfalls

**Length:** ~4,000 words

---

### Session Handoffs

#### [HANDOFF_TEMPLATE.md](./HANDOFF_TEMPLATE.md)
**Template for ending sessions and resuming work**

**Purpose:**
Ensures smooth transitions between development sessions (Manus ↔ Manus or Manus ↔ Cursor).

**Contents:**
- Pre-handoff checklist
- Session summary template
- Next steps format
- Environment state capture
- Critical information checklist
- Testing verification
- Handoff verification checklist

**When to use:**
- At the end of every development session
- Before switching between Manus and Cursor
- When pausing work for extended period

**Length:** ~2,000 words

---

#### [HANDOFF_20251228.md](./HANDOFF_20251228.md)
**Session handoff for December 28, 2024**

**Purpose:**
Complete handoff document for the current session. Serves as both a real handoff and an example of how to use the template.

**Contents:**
- Session accomplishments (20+ items)
- Work in progress
- Technical decisions made
- Prioritized next steps (Top 3)
- Environment state
- Critical information
- File modifications (30+ files)
- Testing commands
- Recommendations for next session

**When to read:**
- Starting next development session
- Understanding what was built today
- Continuing from current state

**Length:** ~3,000 words

---

### Product Documentation

#### [Restaurant_Resource_Planning_Tool_PRD.md](./Restaurant_Resource_Planning_Tool_PRD.md)
**Product Requirements Document**

**Purpose:**
Defines product vision, features, and requirements.

**Contents:**
- Product overview and goals
- Target audience
- Feature specifications (MVP + future)
- Non-functional requirements
- Success metrics
- Competitive analysis
- Go-to-market strategy

**When to read:**
- Understanding product vision
- Planning features
- Making product decisions

**Length:** ~8,000 words

---

#### [MVP_Stakeholder_Presentation.md](./MVP_Stakeholder_Presentation.md)
**Stakeholder presentation slide deck**

**Purpose:**
High-level overview for stakeholders (investors, partners, etc.).

**Contents:**
- Executive summary
- Problem and solution
- MVP feature set
- LLM integration strategy
- Business model
- Competitive landscape
- Go-to-market strategy
- Financial projections

**When to read:**
- Presenting to stakeholders
- Understanding business strategy
- Explaining product vision

**Length:** ~4,000 words (20 slides)

---

#### [LLM_Integration_Specification.md](./LLM_Integration_Specification.md)
**Technical specification for LLM integration**

**Purpose:**
Detailed technical guide for implementing AI-powered features.

**Contents:**
- Model selection and infrastructure
- 6 AI-powered features with code examples
- Prompt engineering best practices
- Cost optimization strategies
- Error handling and fallbacks
- Security and privacy guidelines
- Testing strategy
- Future enhancements

**When to read:**
- Implementing LLM features
- Understanding AI integration
- Optimizing LLM costs
- Debugging LLM issues

**Length:** ~6,000 words

---

## Documentation Workflow

### For Manus Sessions

**Starting a session:**
1. Read latest `HANDOFF_*.md` file
2. Review `FEATURE_STATUS.md` for current priorities
3. Check `KNOWN_ISSUES.md` for active bugs
4. Run health check commands from handoff

**During session:**
1. Update `todo.md` as you complete tasks
2. Add new decisions to `DECISION_LOG.md`
3. Document new issues in `KNOWN_ISSUES.md`
4. Update `FEATURE_STATUS.md` when features are completed

**Ending session:**
1. Copy `HANDOFF_TEMPLATE.md` to `HANDOFF_[DATE].md`
2. Fill in all sections with session details
3. Update all relevant documentation
4. Run tests and verify changes
5. Commit everything to GitHub
6. Push to remote repository

---

### For Cursor Sessions

**Starting a session:**
1. Clone repository (if first time)
2. Read latest `HANDOFF_*.md` file
3. Review `ARCHITECTURE.md` and `DEVELOPMENT_GUIDE.md`
4. Set up environment per `README.md`
5. Run health check commands

**During session:**
1. Follow coding standards from `DEVELOPMENT_GUIDE.md`
2. Reference `API_REFERENCE.md` for API details
3. Update documentation as you work
4. Add tests per `DEVELOPMENT_GUIDE.md`

**Ending session:**
1. Create new `HANDOFF_[DATE].md` from template
2. Update all relevant documentation
3. Run tests and verify changes
4. Commit and push to GitHub

---

### For Manus ↔ Cursor Transitions

**Manus → Cursor:**
1. Complete Manus handoff process (above)
2. Ensure all code is committed and pushed
3. Cursor developer reads handoff document
4. Cursor developer follows "Starting a session" steps

**Cursor → Manus:**
1. Complete Cursor handoff process (above)
2. Ensure all code is committed and pushed
3. Manus reads handoff document
4. Manus follows "Starting a session" steps

---

## Documentation Maintenance

### Update Frequency

**After every session:**
- `HANDOFF_[DATE].md` - Create new handoff
- `FEATURE_STATUS.md` - Update completion status
- `todo.md` - Mark completed tasks

**When making decisions:**
- `DECISION_LOG.md` - Add new decision entry

**When discovering issues:**
- `KNOWN_ISSUES.md` - Add new issue entry

**When changing architecture:**
- `ARCHITECTURE.md` - Update relevant sections

**When adding APIs:**
- `API_REFERENCE.md` - Document new endpoints

**When changing workflows:**
- `DEVELOPMENT_GUIDE.md` - Update procedures

### Review Schedule

**Weekly:**
- Review `KNOWN_ISSUES.md` and prioritize fixes
- Review `FEATURE_STATUS.md` and update timeline
- Review recent `HANDOFF_*.md` files for patterns

**Monthly:**
- Review `ARCHITECTURE.md` for accuracy
- Review `DECISION_LOG.md` and validate decisions
- Review `DEVELOPMENT_GUIDE.md` for updates

**Quarterly:**
- Full documentation audit
- Remove outdated information
- Reorganize if needed

---

## Documentation Standards

### Writing Style

**Be concise:**
- Use short sentences
- Use bullet points
- Avoid jargon

**Be specific:**
- Provide examples
- Include code snippets
- Link to related docs

**Be actionable:**
- Tell readers what to do
- Provide commands to run
- Include troubleshooting steps

### Formatting

**Use consistent headings:**
- `#` for document title
- `##` for major sections
- `###` for subsections
- `####` for details

**Use emphasis:**
- **Bold** for important terms
- *Italic* for emphasis
- `Code` for technical terms

**Use lists:**
- Bullet points for unordered items
- Numbered lists for steps
- Checkboxes for tasks

### Code Examples

**Always include:**
- Language identifier for syntax highlighting
- Comments explaining non-obvious code
- Full context (imports, etc.)

**Example:**
```typescript
// Good: Full context with comments
import { trpc } from '@/lib/trpc';

// Fetch all recipes with their ingredients
const { data: recipes } = trpc.recipes.list.useQuery();
```

---

## Getting Help

**Can't find what you need?**

1. **Search the docs** - Use Cmd+F / Ctrl+F to search
2. **Check the handoff** - Latest `HANDOFF_*.md` has recent context
3. **Read the code** - Code is the ultimate documentation
4. **Ask the team** - Someone may know the answer

**Found a documentation issue?**

1. Fix it immediately (if minor)
2. Add to `KNOWN_ISSUES.md` (if major)
3. Create a task in `todo.md`

---

## Contributing to Documentation

**Everyone should update docs:**
- Developers update technical docs
- Product team updates PRD and feature status
- Anyone can update handoffs

**Documentation is code:**
- Commit docs with code changes
- Review docs in code reviews
- Test docs by following them

**Keep docs up-to-date:**
- Update docs when code changes
- Don't let docs drift from reality
- Outdated docs are worse than no docs

---

## Document History

**Version 0.1.0** (December 28, 2024)
- Initial documentation structure created
- 7 core documents written
- 2 handoff documents created
- 3 product documents added

---

**Questions? Issues? Improvements?**

Update this README or create a handoff note with your feedback.

---

**Last Updated:** December 28, 2024  
**Next Review:** January 5, 2025
