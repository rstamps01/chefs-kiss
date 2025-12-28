# Restaurant Resource Planner: MVP Feature Set & LLM Integration Strategy

**Stakeholder Presentation**  
**Date:** December 26, 2025  
**Version:** 1.0

---

## Slide 1: Executive Summary

### Restaurant Resource Planner
**Intelligent Operations Platform for Data-Driven Restaurant Management**

**Mission:** Empower restaurants to optimize operations, reduce waste, and increase profitability through AI-powered analytics and predictive planning.

**Target Market:** Independent restaurants and small chains (1-5 locations) currently underserved by expensive enterprise solutions.

**Key Differentiator:** First platform to combine POS data analysis, weather intelligence, and LLM-powered insights at an accessible price point.

---

## Slide 2: The Problem

### Current Pain Points for Restaurant Operators

**Operational Challenges:**
- **15-20% food waste** due to inaccurate prep planning
- **Labor costs 30-35%** of revenue, often poorly optimized
- **Manual forecasting** based on gut feel, not data
- **Fragmented tools** requiring multiple subscriptions
- **No actionable insights** from existing POS systems

**Market Gap:**
- Enterprise solutions ($200-500/month) too expensive for independents
- Mid-market tools ($100-200/month) lack analytical depth
- No solution integrates weather, events, and AI-powered recommendations
- Restaurant owners lack time and expertise for data analysis

**Financial Impact:**
- Average restaurant loses $50,000-100,000 annually to preventable waste and inefficiency
- 60% of restaurants fail within 3 years, often due to poor operational management

---

## Slide 3: The Solution

### Intelligent Operations Platform

**Core Value Proposition:**
Transform raw operational data into actionable intelligence that restaurant operators can understand and act on immediately.

**Key Capabilities:**

1. **Data Integration** - Automatically import and normalize POS data from any system
2. **Predictive Analytics** - Forecast sales based on historical patterns and weather
3. **AI-Powered Insights** - Natural language explanations and recommendations
4. **Prep Planning** - Convert forecasts into specific ingredient quantities
5. **Professional Reporting** - Stakeholder-ready operational analysis

**Competitive Advantages:**
- ✅ Weather and events integration (no competitor does this comprehensively)
- ✅ Ingredient-level forecasting (unique in market)
- ✅ LLM-powered conversational analytics (cutting-edge)
- ✅ Accessible pricing ($79-149/month vs $200-500/month)
- ✅ Single-location focus with enterprise capabilities

---

## Slide 4: MVP Feature Set

### Phase 1 Deliverables (3-4 Months)

**Core Features:**

| Feature | Description | User Benefit |
|---------|-------------|--------------|
| **POS Data Import** | CSV upload with automatic field mapping | Works with any POS system |
| **Sales Dashboard** | Interactive charts (daily/weekly/monthly) | Visualize performance at a glance |
| **Weather Integration** | OpenWeather API (historical + forecast) | Understand weather impact on sales |
| **Sales Forecasting** | AI-powered predictions with confidence scores | Plan ahead with data-driven forecasts |
| **Recipe Management** | Define menu items and ingredients | Track what goes into each dish |
| **Prep Planning** | Ingredient-level daily prep lists | Reduce waste, avoid stockouts |
| **LLM Analytics** | Conversational insights and recommendations | Get answers in plain language |
| **PDF Reports** | Professional operational analysis | Share with stakeholders/investors |
| **User Management** | Role-based access (admin/manager) | Secure, multi-user platform |

**Architecture:** Progressive Web App (PWA) - installs on Windows/Mac/mobile, works offline, auto-updates

---

## Slide 5: LLM Integration - The Intelligence Layer

### AI-Powered Features (Key Differentiator)

**1. Automated Daily Insights**
- AI analyzes yesterday's performance every morning
- Identifies factors affecting sales (weather, trends, anomalies)
- Provides one actionable recommendation for today
- *Example: "Sales exceeded forecast by 18% due to sunny weather and weekend traffic. Prep 25% more lunch items today."*

**2. Conversational Analytics ("Ask Your Data")**
- Natural language interface for any operational question
- *Example queries:*
  - "Why were sales low last Tuesday?"
  - "What should I prep for this weekend?"
  - "How does rain affect my dinner sales?"
- Instant answers with specific data and recommendations

**3. Intelligent Forecast Explanations**
- Every forecast includes AI-generated explanation
- Breaks down contributing factors (weather, trends, patterns)
- Confidence scoring with reasoning
- *Example: "Forecast: $3,200 (85% confidence). Factors: Saturday pattern (+$500), rain forecast (-$200), recent uptrend (+$100)."*

**4. Smart Prep Recommendations**
- AI explains why each ingredient quantity is recommended
- Highlights adjustments from baseline prep
- Waste prevention tips based on forecast
- *Example: "Prep 30% less tuna today - rain forecast typically reduces sushi sales by 25-35%."*

**5. Professional Report Narratives**
- AI-generated executive summaries for PDF reports
- Key findings and strategic recommendations
- Written for owners/investors, not data scientists
- *Example: "Revenue increased 12% this quarter driven by improved prep efficiency and weather-optimized operations."*

**6. Anomaly Detection & Alerts**
- Automatic detection of unusual patterns
- AI explains likely causes and suggests actions
- Proactive notifications before issues escalate
- *Example: "Sales 30% below forecast today. Likely cause: unexpected rain. Recommendation: Reduce dinner prep by 20%."*

---

## Slide 6: Technical Architecture

### Technology Stack

**Frontend:**
- React 19 + TypeScript (type-safe, modern)
- Progressive Web App (PWA) - native-like experience
- Recharts for data visualization
- Responsive design (mobile, tablet, desktop)

**Backend:**
- Node.js + Express + tRPC (type-safe API)
- PostgreSQL database (scalable, reliable)
- Redis caching (performance optimization)
- Celery for background jobs (forecasting, reports)

**AI/ML:**
- GPT-4 Turbo via Manus LLM API
- Pre-configured infrastructure (no API key management)
- Response caching for cost optimization
- Fallback to rule-based insights if API unavailable

**External APIs:**
- OpenWeather API (historical + forecast weather)
- PredictHQ API (events intelligence - Phase 2)
- S3 for file storage (reports, uploads)

**Deployment:**
- Cloud-hosted (Azure/AWS)
- Auto-scaling infrastructure
- 99.9% uptime SLA
- Automatic backups and disaster recovery

---

## Slide 7: LLM Integration Strategy

### Intelligent, Cost-Effective, Reliable

**Model Selection:**
- **Primary:** GPT-4 Turbo (128K context, function calling)
- **Access:** Pre-configured Manus infrastructure
- **Cost:** ~$2-5 per location per month

**Use Cases & Frequency:**
- Daily insights: 1 API call/day = 30/month
- User queries: ~100/month (on-demand)
- Forecast explanations: ~50/month (cached)
- PDF reports: ~10/month
- Anomaly detection: ~20/month (automated)
- **Total:** ~210 API calls/month per location

**Cost Optimization:**
- **Caching:** 24-hour TTL for identical queries (60%+ hit rate)
- **Batch processing:** Multiple insights in single API call
- **Prompt optimization:** Concise, structured prompts
- **Selective invocation:** Only for high-value operations
- **Fallback system:** Rule-based insights if API fails

**Quality Assurance:**
- Response validation (length, content, structure)
- User feedback tracking (thumbs up/down)
- Continuous prompt refinement based on feedback
- A/B testing of prompt variations

**Security & Privacy:**
- No PII sent to LLM (only aggregated metrics)
- Data minimization principle
- Encrypted data transmission
- GDPR/CCPA compliant

---

## Slide 8: User Experience Flow

### Typical Daily Workflow

**Morning (8:00 AM):**
1. Manager logs in to dashboard
2. **AI Daily Insight** appears: *"Yesterday's sales: $2,850 (+12% vs forecast). Strong performance driven by sunny weather. Prep 15% more for lunch today."*
3. Reviews **Prep Plan** with AI recommendations
4. Adjusts quantities if needed, prints prep list for kitchen

**Midday (12:00 PM):**
1. Checks **Real-Time Dashboard** to see lunch performance
2. Asks AI: *"Are we on track for dinner forecast?"*
3. AI responds: *"Yes, lunch sales 8% above forecast. Dinner forecast remains $1,200 with 82% confidence. No prep adjustments needed."*

**Evening (6:00 PM):**
1. Reviews **7-Day Forecast** for upcoming week
2. Clicks "Why this forecast?" on Saturday
3. AI explains: *"Saturday forecast: $3,500 (90% confidence). Factors: Weekend pattern (+$800), sunny weather forecast (+$200), recent uptrend (+$150). Recommend prepping 40% more than weekday baseline."*

**End of Week:**
1. Generates **Weekly Report** (PDF)
2. AI summary: *"Strong week with 15% revenue growth. Weather-optimized prep reduced waste by $180. Recommend continuing current prep strategy."*
3. Shares report with owner/investors

---

## Slide 9: Business Model & Pricing

### Accessible, Scalable, Value-Driven

**Pricing Tiers:**

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Starter** | $79/month | Single location | All core features, 1 location, 2 users |
| **Professional** | $149/month | 2-5 locations | Multi-location, unlimited users, priority support |
| **Enterprise** | Custom | 6+ locations | Custom integrations, dedicated support, SLA |

**Free Trial:** 30 days, no credit card required

**ROI Calculation:**
- Average restaurant saves $500-1,000/month through:
  - Reduced food waste (10-15% reduction = $300-500/month)
  - Optimized labor (5-10% improvement = $200-400/month)
  - Better inventory management ($100-200/month)
- **Payback period:** < 1 month
- **Annual ROI:** 600-1,500%

**Revenue Projections (Conservative):**
- Year 1: 100 locations × $100 avg = $120K ARR
- Year 2: 500 locations × $100 avg = $600K ARR
- Year 3: 2,000 locations × $110 avg = $2.6M ARR

**Market Opportunity:**
- 660,000 restaurants in US
- Target: 560,000 independent/small chains
- TAM: $7.9B annually
- SAM: $6.7B annually
- Conservative 0.5% penetration = $3.4M ARR

---

## Slide 10: Competitive Landscape

### Market Positioning

**Enterprise Solutions:**
- **Players:** Crunchtime, Restaurant365, Oracle
- **Pricing:** $200-500/month per location
- **Strengths:** Comprehensive features, multi-location
- **Weaknesses:** Expensive, complex, overkill for independents
- **Our Advantage:** 50-75% lower cost, easier to use, AI-powered

**Mid-Market Solutions:**
- **Players:** Lineup.ai, 7shifts, When I Work
- **Pricing:** $100-200/month
- **Strengths:** Affordable, user-friendly
- **Weaknesses:** Limited analytics, no ingredient-level forecasting, basic weather integration
- **Our Advantage:** Deeper analytics, LLM insights, prep planning

**Point Solutions:**
- **Players:** MarketMan (inventory), meez (recipes), xtraChef (invoices)
- **Pricing:** $50-150/month each
- **Strengths:** Deep domain expertise
- **Weaknesses:** Fragmented, no integration, no forecasting
- **Our Advantage:** Unified platform, AI-powered, lower total cost

**Key Differentiators:**
1. ✅ **Only solution** with ingredient-level weather-based forecasting
2. ✅ **Only solution** with LLM-powered conversational analytics
3. ✅ **Only solution** with comprehensive weather-sales correlation
4. ✅ **Best pricing** for independent restaurants
5. ✅ **Professional reporting** included (competitors charge extra)

---

## Slide 11: Go-to-Market Strategy

### Customer Acquisition Plan

**Phase 1: Launch (Months 1-6)**
- **Target:** 10-20 beta customers
- **Channels:** Direct outreach, restaurant owner networks
- **Focus:** Product validation, case study development
- **Pricing:** 50% discount for beta participants

**Phase 2: Early Adoption (Months 7-12)**
- **Target:** 100 paying customers
- **Channels:** Content marketing, SEO, POS partnerships
- **Focus:** Referral program, testimonials, ROI case studies
- **Pricing:** Standard pricing with 30-day free trial

**Phase 3: Scale (Months 13-24)**
- **Target:** 500-1,000 customers
- **Channels:** Paid advertising, trade shows, industry publications
- **Focus:** Market leadership, feature expansion, enterprise tier
- **Pricing:** Tiered pricing with volume discounts

**Marketing Tactics:**
1. **Content Marketing:** Blog posts, guides, webinars on restaurant operations
2. **SEO:** Target keywords like "restaurant forecasting," "prep planning software"
3. **Partnerships:** Integrate with POS providers (Toast, Square, Clover)
4. **Case Studies:** Showcase ROI from beta customers (e.g., "Sushi Confidential saved $12K annually")
5. **Referral Program:** $50 credit for each referral
6. **Trade Shows:** National Restaurant Association Show, regional events

**Customer Success:**
- Onboarding: 1-hour training session, video tutorials
- Support: Email, chat, knowledge base
- Retention: Quarterly business reviews, feature updates
- Expansion: Upsell multi-location, premium features

---

## Slide 12: Development Roadmap

### Phased Approach to Market

**Phase 1: MVP (Months 1-4)**
- Core features: POS import, dashboard, forecasting, prep planning
- Weather integration (OpenWeather)
- LLM analytics (daily insights, Q&A, forecast explanations)
- PDF reports
- Single location support
- **Milestone:** Beta launch with 10 customers

**Phase 2: Enhancement (Months 5-8)**
- Multi-location management UI
- Events integration (PredictHQ)
- Advanced forecasting (event impact, menu mix optimization)
- Mobile app (iOS/Android)
- API for third-party integrations
- **Milestone:** 100 paying customers, $10K MRR

**Phase 3: Scale (Months 9-12)**
- Advanced AI recommendations (menu engineering, hours optimization)
- Inventory management integration
- Supplier integration (auto-ordering)
- Custom reporting templates
- White-label option for POS providers
- **Milestone:** 500 customers, $50K MRR

**Phase 4: Enterprise (Year 2)**
- Multi-brand support
- Franchise management features
- Advanced analytics (cohort analysis, customer segmentation)
- Predictive maintenance (equipment failure prediction)
- Fine-tuned LLM models (location-specific)
- **Milestone:** 2,000 customers, $200K MRR

---

## Slide 13: Success Metrics & KPIs

### How We Measure Success

**Product Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Forecast Accuracy | > 85% | MAPE (Mean Absolute Percentage Error) |
| Waste Reduction | 10-15% | Customer-reported savings |
| LLM Insight Helpfulness | > 75% | User feedback (thumbs up/down) |
| Feature Adoption | > 60% | Weekly active users of AI features |
| Report Generation | > 80% | Users generating monthly reports |

**Business Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Customer Acquisition Cost | < $500 | Total marketing spend / new customers |
| Monthly Recurring Revenue | $10K (Month 6) | Sum of active subscriptions |
| Churn Rate | < 5% | Monthly cancellations / total customers |
| Net Promoter Score | > 50 | Customer survey |
| Customer Lifetime Value | > $3,000 | Avg subscription length × monthly price |

**Technical Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | > 99.9% | Monitoring tools |
| Page Load Time | < 2 seconds | P95 latency |
| LLM Response Time | < 3 seconds | P95 latency |
| API Success Rate | > 99.5% | Successful requests / total |

---

## Slide 14: Team & Resources

### Execution Plan

**Development Team (MVP Phase):**
- 1 Full-Stack Developer (Backend + Frontend)
- 1 Data Scientist / ML Engineer (Forecasting + LLM integration)
- 1 UI/UX Designer (Part-time)
- 1 Product Manager (Part-time)

**Estimated Costs:**
- Development: $90K-155K (outsourced) or $200K-300K (in-house)
- Infrastructure: $1.5K-4K/month (scales with users)
- APIs: $500-1,500/month (OpenWeather, LLM)
- Marketing: $10K-20K (Phase 1)
- **Total MVP Budget:** $110K-180K

**Timeline:**
- Month 1-2: Database schema, backend API, POS import
- Month 2-3: Dashboard, charts, weather integration
- Month 3-4: Forecasting engine, LLM integration, prep planning
- Month 4: PDF reports, testing, beta launch
- **Total:** 4 months to beta launch

**Post-MVP Resources:**
- Customer Success Manager (Month 6)
- Sales/Marketing Lead (Month 9)
- Additional developers (Month 12)

---

## Slide 15: Risk Mitigation

### Potential Challenges & Solutions

**Technical Risks:**

| Risk | Mitigation |
|------|-----------|
| LLM API costs exceed budget | Aggressive caching (60%+ hit rate), batch processing, prompt optimization |
| Weather API rate limits | Cache historical data, use forecast API sparingly, consider backup provider |
| POS integration complexity | Start with CSV import (universal), add direct integrations incrementally |
| Forecast accuracy concerns | Track accuracy metrics, continuous model refinement, confidence scoring |
| Database performance at scale | PostgreSQL optimization, read replicas, caching layer (Redis) |

**Business Risks:**

| Risk | Mitigation |
|------|-----------|
| Low customer adoption | Free trial, ROI calculator, case studies, referral program |
| High churn rate | Strong onboarding, proactive support, quarterly business reviews |
| Competition from incumbents | Focus on underserved market (independents), faster innovation, better pricing |
| Difficulty acquiring beta customers | Leverage existing network, offer steep discounts, provide white-glove service |
| Regulatory/compliance issues | GDPR/CCPA compliance from day one, regular security audits |

**Market Risks:**

| Risk | Mitigation |
|------|-----------|
| Economic downturn affecting restaurants | Position as cost-saving tool (reduces waste/labor), not luxury |
| Slow POS integration adoption | CSV import works with any system, no integration required |
| Weather API provider changes | Abstract weather API behind interface, easy to swap providers |

---

## Slide 16: Case Study - Sushi Confidential

### Proof of Concept

**Background:**
- Independent sushi restaurant in Campbell, CA
- Commissioned comprehensive operational analysis
- Manual analysis took 40+ hours, cost $5,000+

**Analysis Performed:**
- Historical sales data (18 months)
- Weather correlation analysis
- Day-of-week patterns
- Ingredient-level prep recommendations
- Strategic hours of operation analysis

**Key Findings:**
- Weather impact: Rain reduced sales by 25-30%
- Optimal prep quantities identified for each ingredient
- Recommended staffing adjustments saved $15K annually
- Identified unprofitable operating hours

**Results:**
- Projected annual savings: $50K+ (waste reduction + labor optimization)
- ROI of analysis: 10x in first year

**Restaurant Resource Planner Value:**
- **Automates this entire analysis**
- **Delivers insights daily, not once**
- **Costs $948/year vs $5,000 one-time**
- **Continuous improvement vs static report**

**This is the problem we're solving:** Making this level of analysis accessible to every restaurant, every day, automatically.

---

## Slide 17: Next Steps

### Path to Launch

**Immediate Actions (Next 30 Days):**
1. ✅ Finalize MVP feature set (complete)
2. ✅ Complete LLM integration specification (complete)
3. ⏳ Begin database schema design
4. ⏳ Set up development environment and GitHub repository
5. ⏳ Create wireframes and UI mockups
6. ⏳ Identify 5-10 potential beta customers

**Short-Term Milestones (Months 2-4):**
- Month 2: Core backend complete, POS import working
- Month 3: Dashboard and forecasting functional
- Month 4: LLM integration complete, PDF reports working
- **Beta Launch:** Month 4, target 10 beta customers

**Medium-Term Goals (Months 5-12):**
- Month 6: 100 paying customers, $10K MRR
- Month 9: Multi-location support, events integration
- Month 12: 500 customers, $50K MRR, break-even

**Decision Points:**
- **Proceed with development?** Approve MVP budget and timeline
- **Beta customer recruitment?** Leverage existing networks or hire sales lead?
- **Funding strategy?** Bootstrap, angel investment, or VC?

---

## Slide 18: Investment Ask (Optional)

### Funding Requirements

**Seeking:** $250K Seed Round

**Use of Funds:**
- Development: $150K (4 months MVP + 6 months enhancements)
- Marketing: $50K (customer acquisition, content, partnerships)
- Operations: $30K (infrastructure, APIs, tools)
- Legal/Admin: $20K (incorporation, contracts, compliance)

**Milestones:**
- Month 4: Beta launch (10 customers)
- Month 6: Product-market fit (100 customers, $10K MRR)
- Month 12: Scale (500 customers, $50K MRR)
- Month 18: Series A readiness (2,000 customers, $200K MRR)

**Projected Returns:**
- Year 1: $120K ARR
- Year 2: $600K ARR
- Year 3: $2.6M ARR
- Year 5: $10M+ ARR (5,000 customers)

**Exit Opportunities:**
- Acquisition by POS provider (Toast, Square, Clover)
- Acquisition by restaurant management platform (Crunchtime, Restaurant365)
- Acquisition by food service distributor (Sysco, US Foods)
- Strategic acquirer (Oracle, SAP, Microsoft)

**Comparable Exits:**
- Lineup.ai → TimeForge (2024, undisclosed)
- Avero → Agilysys ($50M, 2021)
- Upserve → Lightspeed ($430M, 2020)

---

## Slide 19: Why Now?

### Market Timing & Opportunity

**Technology Enablers:**
- **LLM Revolution:** GPT-4 makes sophisticated AI accessible and affordable
- **Cloud Infrastructure:** Scalable, reliable platforms (AWS, Azure) at low cost
- **API Economy:** Easy integration with POS, weather, events data
- **PWA Maturity:** Native-like web apps work on any device

**Market Conditions:**
- **Post-Pandemic Recovery:** Restaurants investing in technology to improve margins
- **Labor Shortage:** Automation and optimization critical for survival
- **Rising Costs:** Food and labor inflation driving need for efficiency
- **Digital Transformation:** Restaurants finally adopting modern software

**Competitive Window:**
- **Incumbents are slow:** Enterprise vendors take 12-18 months to add features
- **No direct competitor:** No one offers ingredient-level weather-based forecasting with LLM analytics
- **First-mover advantage:** Establish brand as "AI-powered restaurant analytics"
- **Network effects:** More users = better benchmarks and insights

**Regulatory Trends:**
- **Food waste legislation:** California, NYC requiring waste tracking and reduction
- **Labor regulations:** Predictive scheduling laws require advance planning
- **Sustainability reporting:** ESG requirements driving need for data

**The window is now:** Technology is ready, market is ready, competition is absent. First to market wins.

---

## Slide 20: Vision & Impact

### Long-Term Goals

**5-Year Vision:**
Transform how restaurants operate by making data-driven decision-making accessible to every operator, regardless of size or technical expertise.

**Impact Metrics:**
- **10,000+ restaurants** using the platform
- **$50M+ annual savings** in food waste reduction
- **100,000+ tons** of food waste prevented
- **50,000+ jobs** optimized through better scheduling
- **Industry standard** for restaurant operational analytics

**Product Evolution:**
- Year 1: Sales forecasting and prep planning
- Year 2: Full operations suite (inventory, labor, menu engineering)
- Year 3: Predictive maintenance, supplier optimization, customer analytics
- Year 4: Industry benchmarking, franchise management, white-label platform
- Year 5: AI-powered restaurant "operating system"

**Social Impact:**
- **Sustainability:** Reduce food waste, carbon footprint
- **Economic:** Help restaurants survive and thrive (60% fail within 3 years)
- **Employment:** Optimize jobs, don't eliminate them
- **Community:** Support local restaurants, preserve culinary diversity

**Why This Matters:**
Restaurants are the backbone of communities and culture. By helping them operate more efficiently and profitably, we preserve jobs, reduce waste, and ensure that great food and hospitality remain accessible to everyone.

**This is not just software. This is the future of restaurant operations.**

---

## Appendix: Technical Details

### Database Schema Overview

**Core Tables:**
- `users` - Authentication and roles
- `locations` - Restaurant locations
- `sales_data` - Historical POS data
- `recipes` - Menu items and ingredients
- `ingredients` - Ingredient master list
- `weather_data` - Historical and forecast weather
- `forecasts` - Sales predictions
- `prep_plans` - Daily ingredient quantities
- `reports` - Generated PDF reports
- `llm_insights` - Cached AI-generated insights

### API Endpoints (tRPC)

**Authentication:**
- `auth.me` - Get current user
- `auth.logout` - End session

**Data Import:**
- `data.uploadPOS` - Upload CSV file
- `data.mapFields` - Configure field mapping
- `data.importSales` - Process and import data

**Analytics:**
- `analytics.getDashboard` - Sales metrics and charts
- `analytics.getDailyInsights` - AI-generated insights
- `analytics.askQuestion` - Conversational analytics

**Forecasting:**
- `forecast.generate` - Create sales forecast
- `forecast.getExplanation` - AI explanation of forecast
- `forecast.getAccuracy` - Historical accuracy metrics

**Prep Planning:**
- `prep.generatePlan` - Create daily prep list
- `prep.getRecommendations` - AI prep recommendations
- `prep.recordActuals` - Track actual prep vs plan

**Reporting:**
- `reports.generate` - Create PDF report
- `reports.list` - Get report history
- `reports.download` - Download PDF

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection
- `BUILT_IN_FORGE_API_KEY` - Manus LLM API key
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint
- `OPENWEATHER_API_KEY` - Weather data API key

**Optional:**
- `PREDICTHQ_API_KEY` - Events data (Phase 2)
- `REDIS_URL` - Caching (recommended for production)

---

## Contact & Questions

**For more information:**
- Technical questions: See LLM Integration Specification document
- Business inquiries: [Contact information]
- Demo request: [Scheduling link]

**Thank you for your time and consideration.**

---

**End of Presentation**
