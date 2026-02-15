# Historical Price Tracking & Supplier Cost Analysis System

## Executive Summary

This document provides comprehensive recommendations for implementing historical price tracking, supplier cost analysis, and price trend monitoring in Chef's Kiss. The system addresses the reality that inventory costs fluctuate throughout the year due to seasonal variations, market conditions, and supplier pricing strategies, enabling data-driven purchasing decisions and accurate historical cost analysis.

**Key Problem**: Current systems track only the most recent purchase price, losing valuable historical data that reveals cost trends, seasonal patterns, and supplier performance differences. This makes it impossible to answer critical questions like "How much did salmon cost last July?" or "Which supplier consistently offers better pricing?"

**Solution**: Implement a comprehensive price history system that automatically logs every purchase price, tracks supplier performance, analyzes trends, and provides alerts for significant price changes.

---

## The Price Volatility Problem

### Real-World Price Fluctuations

Restaurant inventory costs are highly volatile, influenced by multiple factors that create significant price swings throughout the year.

**Seasonal Variation Examples**:

| **Item** | **Peak Season Price** | **Off-Season Price** | **Variance** | **Peak Months** |
|----------|----------------------|---------------------|--------------|-----------------|
| Tomatoes | $1.20/lb | $2.80/lb | +133% | Dec-Feb |
| Romaine Lettuce | $1.50/lb | $3.20/lb | +113% | Jun-Aug (heat) |
| Salmon (wild) | $18.00/lb | $28.00/lb | +56% | Oct-Mar (off-season) |
| Avocados | $0.60/each | $1.40/each | +133% | Jul-Sep |
| Strawberries | $2.50/lb | $5.00/lb | +100% | Nov-Mar |
| Asparagus | $2.00/lb | $4.50/lb | +125% | Sep-Feb |

**Market Condition Impacts**:

Weather events, supply chain disruptions, fuel costs, and labor shortages can cause sudden price spikes of **20-50% or more** that persist for weeks or months. For example, a freeze in California can double the price of lettuce overnight, while a hurricane in the Gulf can triple shrimp prices for months.

**Supplier Pricing Differences**:

Different suppliers often have **10-30% price differences** for identical items due to their sourcing strategies, volume discounts, delivery costs, and business models. Without historical tracking, it's impossible to identify which supplier consistently offers better value.

---

## System Architecture

### Four-Component Data Model

```
Component 1: SUPPLIERS
    ↓ (provides inventory)
Component 2: INVENTORY ITEMS
    ↓ (purchase events)
Component 3: PRICE HISTORY
    ↓ (analysis)
Component 4: PRICE ANALYTICS & ALERTS
```

**Integration**: Connects with existing yield management system to provide complete cost picture (historical AP costs + yield % = historical EP costs)

---

## Component 1: Supplier Management

### Supplier Data Structure

**Suppliers Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `supplier_id` | UUID | Unique identifier | `supp_001` |
| `supplier_name` | String | Business name | "Pacific Seafood Co." |
| `supplier_code` | String | Short code for reports | "PSC" |
| `contact_name` | String | Primary contact | "John Smith" |
| `contact_email` | String | Email address | "john@pacificseafood.com" |
| `contact_phone` | String | Phone number | "(555) 123-4567" |
| `address` | Text | Full address | "123 Harbor St, Seattle, WA" |
| `payment_terms` | String | Payment terms | "Net 30" |
| `delivery_days` | JSON | Days they deliver | ["Monday", "Thursday"] |
| `minimum_order` | Decimal | Minimum order amount | $250.00 |
| `delivery_fee` | Decimal | Delivery charge | $25.00 |
| `account_number` | String | Your account # | "CUST-12345" |
| `tax_id` | String | Supplier tax ID | "12-3456789" |
| `is_active` | Boolean | Currently using | true |
| `preferred_rank` | Integer | Preference order (1=best) | 1 |
| `notes` | Text | General notes | "Best for fresh fish" |
| `created_at` | Timestamp | Record created | 2026-01-15 |
| `updated_at` | Timestamp | Last modified | 2026-02-15 |

**Supplier Categories** (many-to-many relationship):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `supplier_category_id` | UUID | Unique identifier | `sc_001` |
| `supplier_id` | UUID | Links to supplier | `supp_001` |
| `category` | Enum | Product category | "Seafood", "Produce", "Dry Goods" |
| `is_primary` | Boolean | Primary for this category | true |

**Key Concept**: Suppliers are tracked independently from inventory items, allowing one item to be sourced from multiple suppliers with different prices and terms.

---

## Component 2: Enhanced Inventory Management

### Updated Inventory Item Structure

**Inventory Items Table** (enhanced):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `inventory_id` | UUID | Unique identifier | `inv_001` |
| `item_name` | String | Name as purchased | "Salmon Fillet, Atlantic" |
| `category` | Enum | Inventory category | "Seafood" |
| `sku` | String | Internal SKU | "SALM-ATL-001" |
| `upc_code` | String | UPC/barcode | "012345678901" |
| `purchase_unit` | Enum | Unit of purchase | "lb" |
| `current_supplier_id` | UUID | Current primary supplier | `supp_001` |
| `current_price` | Decimal | Most recent price | $18.50/lb |
| `current_price_date` | Date | When current price set | 2026-02-10 |
| `average_price_30d` | Decimal | 30-day rolling average | $17.80/lb |
| `average_price_90d` | Decimal | 90-day rolling average | $16.50/lb |
| `average_price_365d` | Decimal | 1-year rolling average | $15.20/lb |
| `lowest_price_ever` | Decimal | Historical low | $12.00/lb |
| `lowest_price_date` | Date | When low occurred | 2025-08-15 |
| `highest_price_ever` | Decimal | Historical high | $28.00/lb |
| `highest_price_date` | Date | When high occurred | 2025-12-20 |
| `price_volatility_score` | Decimal | Volatility metric (0-100) | 42.5 |
| `last_purchase_date` | Date | Most recent purchase | 2026-02-10 |
| `created_at` | Timestamp | Record created | 2025-01-01 |
| `updated_at` | Timestamp | Last modified | 2026-02-15 |

**New Fields Explained**:

- **Rolling averages** (30d, 90d, 365d): Automatically calculated to smooth out short-term fluctuations and identify true trends
- **Historical highs/lows**: Track extreme prices to identify unusual market conditions
- **Volatility score**: Calculated metric (0-100) indicating price stability; higher = more volatile
- **Current supplier**: Links to primary supplier, but item can have multiple suppliers in price history

---

## Component 3: Price History Tracking

### Price History Data Structure

**Price History Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `price_history_id` | UUID | Unique identifier | `ph_001` |
| `inventory_id` | UUID | Links to inventory item | `inv_001` |
| `supplier_id` | UUID | Which supplier | `supp_001` |
| `purchase_date` | Date | Date of purchase | 2026-02-10 |
| `price_per_unit` | Decimal | Price paid | $18.50/lb |
| `purchase_unit` | Enum | Unit purchased | "lb" |
| `quantity_purchased` | Decimal | Amount ordered | 50.0 |
| `total_cost` | Decimal | Extended cost | $925.00 |
| `invoice_number` | String | Invoice reference | "INV-2026-0210" |
| `delivery_fee` | Decimal | Delivery charge | $25.00 |
| `discount_amount` | Decimal | Any discount | $0.00 |
| `discount_reason` | String | Why discounted | null |
| `net_price_per_unit` | Decimal | After delivery/discount | $19.00/lb |
| `payment_method` | Enum | How paid | "Account" |
| `payment_date` | Date | When paid | 2026-03-10 |
| `quality_rating` | Integer | 1-5 stars | 5 |
| `quality_notes` | Text | Quality feedback | "Excellent freshness" |
| `delivery_rating` | Integer | 1-5 stars | 4 |
| `delivery_notes` | Text | Delivery feedback | "10 min late" |
| `season` | Enum | Season purchased | "Winter" |
| `week_of_year` | Integer | Week number (1-52) | 6 |
| `created_by` | UUID | Staff who entered | `staff_042` |
| `created_at` | Timestamp | Record created | 2026-02-10 |

**Automatic Data Capture**:

When a purchase is made (via POS integration, manual entry, or invoice import), the system automatically:
1. Creates a price history record
2. Updates inventory item's current price
3. Recalculates rolling averages
4. Updates high/low prices if applicable
5. Checks for significant price changes (triggers alerts)
6. Updates supplier performance metrics

---

### Price Variance Tracking

**Price Variance Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `variance_id` | UUID | Unique identifier | `var_001` |
| `inventory_id` | UUID | Links to inventory item | `inv_001` |
| `supplier_id` | UUID | Which supplier | `supp_001` |
| `variance_date` | Date | When detected | 2026-02-10 |
| `previous_price` | Decimal | Last price | $16.00/lb |
| `new_price` | Decimal | Current price | $18.50/lb |
| `variance_amount` | Decimal | Dollar change | +$2.50/lb |
| `variance_percent` | Decimal | Percent change | +15.6% |
| `variance_type` | Enum | Increase/Decrease | "Increase" |
| `threshold_exceeded` | Boolean | Alert triggered | true |
| `alert_sent` | Boolean | Notification sent | true |
| `alert_sent_to` | UUID | Manager notified | `mgr_001` |
| `reason` | Text | Explanation | "Seasonal shortage" |
| `action_taken` | Text | Response | "Switched to supplier B" |
| `acknowledged_by` | UUID | Who reviewed | `mgr_001` |
| `acknowledged_at` | Timestamp | When reviewed | 2026-02-10 14:30 |

**Variance Detection Rules**:

The system automatically detects and flags price changes that exceed configurable thresholds:

- **Minor variance**: 5-10% change → Log only, no alert
- **Moderate variance**: 10-25% change → Alert manager, review recommended
- **Major variance**: >25% change → Urgent alert, immediate review required
- **Extreme variance**: >50% change → Critical alert, verify data accuracy

---

## Component 4: Price Analytics & Reporting

### Key Metrics and Calculations

**1. Price Trend Analysis**

**Moving Averages**:
```
30-Day MA = Sum(prices last 30 days) ÷ Count(purchases last 30 days)
90-Day MA = Sum(prices last 90 days) ÷ Count(purchases last 90 days)
365-Day MA = Sum(prices last 365 days) ÷ Count(purchases last 365 days)
```

**Trend Direction**:
```
If 30-Day MA > 90-Day MA: Upward trend
If 30-Day MA < 90-Day MA: Downward trend
If 30-Day MA ≈ 90-Day MA (±2%): Stable
```

**2. Price Volatility Score**

**Calculation**:
```
Standard Deviation = √(Σ(price - mean)² ÷ n)
Coefficient of Variation = (Standard Deviation ÷ Mean) × 100
Volatility Score = Min(Coefficient of Variation, 100)
```

**Interpretation**:
- 0-15: Very stable (e.g., dry goods, canned items)
- 16-30: Moderately stable (e.g., dairy, eggs)
- 31-50: Volatile (e.g., produce, some proteins)
- 51-100: Highly volatile (e.g., seafood, seasonal produce)

**3. Supplier Price Comparison**

**Average Price by Supplier** (for same item):
```
Supplier A Average: $18.50/lb (12 purchases)
Supplier B Average: $17.20/lb (8 purchases)
Supplier C Average: $19.80/lb (5 purchases)

Best Value: Supplier B (-7.0% vs. Supplier A, -13.1% vs. Supplier C)
```

**Quality-Adjusted Price**:
```
Quality-Adjusted Price = Price ÷ (Quality Rating ÷ 5)

Example:
Supplier A: $18.50 ÷ (5/5) = $18.50 (excellent quality)
Supplier B: $17.20 ÷ (3.5/5) = $24.57 (lower quality, worse value)
```

**4. Seasonal Price Patterns**

**Average Price by Season**:
```
Spring (Mar-May): $15.20/lb
Summer (Jun-Aug): $14.50/lb (best time to buy)
Fall (Sep-Nov): $17.80/lb
Winter (Dec-Feb): $22.40/lb (worst time to buy)

Seasonal Variance: 54.5% (highly seasonal)
```

**5. Cost Impact on Recipes**

**Historical Recipe Cost**:
```
Recipe: Salmon Poke Bowl
Date: February 15, 2026

Ingredient: Salmon, diced (6 oz)
- Current Price: $18.50/lb × 1.54 (yield factor) = $28.49/lb EP
- Cost: 6 oz × $1.78/oz = $10.68

Historical Comparison:
- 30 days ago: $16.00/lb → Recipe cost: $9.23 (-13.6%)
- 90 days ago: $14.50/lb → Recipe cost: $8.36 (-21.7%)
- 1 year ago: $15.20/lb → Recipe cost: $8.77 (-17.9%)

Trend: Costs increasing, up 21.7% from 90-day average
```

---

## Database Schema Design

### Core Tables

**1. suppliers**
```sql
CREATE TABLE suppliers (
  supplier_id UUID PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_code VARCHAR(50) UNIQUE,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  delivery_days JSON,
  minimum_order DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  account_number VARCHAR(100),
  tax_id VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  preferred_rank INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. price_history**
```sql
CREATE TABLE price_history (
  price_history_id UUID PRIMARY KEY,
  inventory_id UUID REFERENCES inventory_items(inventory_id),
  supplier_id UUID REFERENCES suppliers(supplier_id),
  purchase_date DATE NOT NULL,
  price_per_unit DECIMAL(10,4) NOT NULL,
  purchase_unit VARCHAR(50) NOT NULL,
  quantity_purchased DECIMAL(10,3),
  total_cost DECIMAL(10,2),
  invoice_number VARCHAR(100),
  delivery_fee DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  discount_reason TEXT,
  net_price_per_unit DECIMAL(10,4) GENERATED ALWAYS AS (
    (total_cost + COALESCE(delivery_fee, 0) - COALESCE(discount_amount, 0)) / quantity_purchased
  ) STORED,
  payment_method VARCHAR(50),
  payment_date DATE,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  quality_notes TEXT,
  delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
  delivery_notes TEXT,
  season VARCHAR(20),
  week_of_year INTEGER,
  created_by UUID REFERENCES staff(staff_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inventory_date (inventory_id, purchase_date),
  INDEX idx_supplier_date (supplier_id, purchase_date)
);
```

**3. price_variances**
```sql
CREATE TABLE price_variances (
  variance_id UUID PRIMARY KEY,
  inventory_id UUID REFERENCES inventory_items(inventory_id),
  supplier_id UUID REFERENCES suppliers(supplier_id),
  variance_date DATE NOT NULL,
  previous_price DECIMAL(10,4),
  new_price DECIMAL(10,4),
  variance_amount DECIMAL(10,4) GENERATED ALWAYS AS (new_price - previous_price) STORED,
  variance_percent DECIMAL(6,2) GENERATED ALWAYS AS (
    ((new_price - previous_price) / previous_price) * 100
  ) STORED,
  variance_type VARCHAR(20),
  threshold_exceeded BOOLEAN,
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_to UUID REFERENCES staff(staff_id),
  reason TEXT,
  action_taken TEXT,
  acknowledged_by UUID REFERENCES staff(staff_id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calculated Views

**View: current_prices**
```sql
CREATE VIEW current_prices AS
SELECT 
  i.inventory_id,
  i.item_name,
  i.current_supplier_id,
  s.supplier_name,
  i.current_price,
  i.current_price_date,
  i.average_price_30d,
  i.average_price_90d,
  i.average_price_365d,
  CASE 
    WHEN i.current_price > i.average_price_30d * 1.10 THEN 'Above Average'
    WHEN i.current_price < i.average_price_30d * 0.90 THEN 'Below Average'
    ELSE 'Normal'
  END AS price_status,
  i.price_volatility_score,
  CASE
    WHEN i.price_volatility_score < 15 THEN 'Very Stable'
    WHEN i.price_volatility_score < 30 THEN 'Stable'
    WHEN i.price_volatility_score < 50 THEN 'Volatile'
    ELSE 'Highly Volatile'
  END AS volatility_category
FROM inventory_items i
LEFT JOIN suppliers s ON i.current_supplier_id = s.supplier_id;
```

**View: supplier_performance**
```sql
CREATE VIEW supplier_performance AS
SELECT 
  s.supplier_id,
  s.supplier_name,
  COUNT(DISTINCT ph.inventory_id) AS items_supplied,
  COUNT(ph.price_history_id) AS total_purchases,
  SUM(ph.total_cost) AS total_spend,
  AVG(ph.quality_rating) AS avg_quality_rating,
  AVG(ph.delivery_rating) AS avg_delivery_rating,
  MIN(ph.purchase_date) AS first_purchase,
  MAX(ph.purchase_date) AS last_purchase
FROM suppliers s
LEFT JOIN price_history ph ON s.supplier_id = ph.supplier_id
GROUP BY s.supplier_id, s.supplier_name;
```

**View: price_trends**
```sql
CREATE VIEW price_trends AS
SELECT 
  i.inventory_id,
  i.item_name,
  i.current_price,
  i.average_price_30d,
  i.average_price_90d,
  i.average_price_365d,
  CASE
    WHEN i.average_price_30d > i.average_price_90d * 1.05 THEN 'Rising'
    WHEN i.average_price_30d < i.average_price_90d * 0.95 THEN 'Falling'
    ELSE 'Stable'
  END AS trend_direction,
  ((i.average_price_30d - i.average_price_90d) / i.average_price_90d * 100) AS trend_percent,
  i.lowest_price_ever,
  i.highest_price_ever,
  ((i.current_price - i.lowest_price_ever) / i.lowest_price_ever * 100) AS pct_above_low,
  ((i.highest_price_ever - i.current_price) / i.highest_price_ever * 100) AS pct_below_high
FROM inventory_items i;
```

---

## User Interface Recommendations

### 1. Supplier Management Dashboard

**Supplier List View**:

| Supplier | Category | Items | Total Spend (YTD) | Avg Quality | Avg Delivery | Status | Actions |
|----------|----------|-------|-------------------|-------------|--------------|--------|---------|
| Pacific Seafood | Seafood | 12 | $45,230 | ⭐⭐⭐⭐⭐ 4.8 | ⭐⭐⭐⭐ 4.2 | Active | [Edit] [View] |
| Fresh Farms | Produce | 28 | $32,150 | ⭐⭐⭐⭐ 4.5 | ⭐⭐⭐⭐⭐ 4.9 | Active | [Edit] [View] |
| Sysco | Multi | 45 | $78,900 | ⭐⭐⭐ 3.8 | ⭐⭐⭐⭐ 4.1 | Active | [Edit] [View] |

**Quick Actions**:
- [+ Add Supplier]
- [Import Supplier List]
- [Export Supplier Report]
- [Compare Suppliers]

---

### 2. Price History View

**Item Price History** (for specific inventory item):

**Salmon Fillet, Atlantic - Price History**

**Summary Cards**:
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Current Price   │  │ 30-Day Avg      │  │ 90-Day Avg      │  │ 1-Year Avg      │
│ $18.50/lb       │  │ $17.80/lb       │  │ $16.50/lb       │  │ $15.20/lb       │
│ ↑ +15.6%        │  │ ↑ +7.9%         │  │ ↑ +12.1%        │  │ ↑ +21.7%        │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Price Trend Chart** (line chart):
- X-axis: Last 12 months
- Y-axis: Price per lb
- Lines: Actual prices (dots), 30-day MA, 90-day MA
- Shaded areas: Seasonal patterns
- Annotations: Major price changes with reasons

**Purchase History Table**:

| Date | Supplier | Price | Qty | Total | Net Price | Quality | Delivery | Invoice |
|------|----------|-------|-----|-------|-----------|---------|----------|---------|
| 2/10/26 | Pacific Seafood | $18.50 | 50 lb | $925 | $19.00 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | INV-0210 |
| 1/28/26 | Pacific Seafood | $17.00 | 40 lb | $680 | $17.63 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | INV-0128 |
| 1/15/26 | Ocean Fresh | $16.50 | 35 lb | $578 | $17.36 | ⭐⭐⭐⭐ | ⭐⭐⭐ | INV-0115 |

---

### 3. Supplier Cost Comparison

**Compare Suppliers for: Salmon Fillet, Atlantic**

| Metric | Pacific Seafood | Ocean Fresh | Sysco |
|--------|-----------------|-------------|-------|
| **Avg Price** | $17.80/lb | $16.90/lb ✓ | $18.20/lb |
| **Purchases** | 12 | 8 | 5 |
| **Total Spend** | $10,680 | $5,408 | $4,550 |
| **Avg Quality** | ⭐⭐⭐⭐⭐ 4.8 ✓ | ⭐⭐⭐⭐ 4.2 | ⭐⭐⭐ 3.6 |
| **Avg Delivery** | ⭐⭐⭐⭐ 4.2 | ⭐⭐⭐⭐⭐ 4.7 ✓ | ⭐⭐⭐⭐ 4.0 |
| **Quality-Adj Price** | $18.54/lb | $20.24/lb | $25.28/lb |
| **Best Value** | ✓ Yes | No | No |

**Recommendation**: Pacific Seafood offers the best overall value with excellent quality at competitive pricing. Ocean Fresh has lower raw price but quality-adjusted cost is higher.

---

### 4. Price Variance Alerts Dashboard

**Recent Price Changes** (requires attention):

| Item | Supplier | Old Price | New Price | Change | Status | Action |
|------|----------|-----------|-----------|--------|--------|--------|
| Romaine Lettuce | Fresh Farms | $1.50/lb | $3.20/lb | +113% 🔴 | Critical | [Review] |
| Salmon Fillet | Pacific Seafood | $16.00/lb | $18.50/lb | +15.6% 🟡 | Moderate | [Review] |
| Avocados | Fresh Farms | $0.80/ea | $1.10/ea | +37.5% 🟠 | Major | [Review] |

**Alert Actions**:
- [Review] - Opens variance details with reason and action options
- [Acknowledge] - Marks as reviewed
- [Switch Supplier] - Compare alternatives
- [Adjust Menu Prices] - Update recipe costs and menu prices

---

### 5. Historical Cost Analysis

**Recipe Cost Over Time**:

**Salmon Poke Bowl - Historical Cost Analysis**

**Cost Breakdown by Date**:

| Date | Salmon Cost | Avocado Cost | Lettuce Cost | Other | Total | Menu Price | Food Cost % |
|------|-------------|--------------|--------------|-------|-------|------------|-------------|
| Feb 2026 | $10.68 | $0.39 | $0.78 | $2.50 | $14.35 | $29.95 | 47.9% 🔴 |
| Jan 2026 | $9.23 | $0.32 | $0.62 | $2.50 | $12.67 | $29.95 | 42.3% 🟡 |
| Dec 2025 | $12.40 | $0.45 | $0.95 | $2.50 | $16.30 | $29.95 | 54.4% 🔴 |
| Nov 2025 | $8.77 | $0.28 | $0.58 | $2.50 | $12.13 | $29.95 | 40.5% ✓ |

**Trend**: Food cost % fluctuating significantly (40.5% - 54.4%) due to ingredient price volatility. Current 47.9% is above target of 30-35%.

**Recommendations**:
1. Increase menu price to $34.95 to maintain 41% food cost
2. Reduce portion sizes (salmon from 6 oz to 5 oz)
3. Substitute ingredients during high-cost periods
4. Implement seasonal menu pricing

---

## Automated Price Tracking Workflows

### Workflow 1: Purchase Entry

**Manual Entry**:
1. User enters purchase details (item, supplier, quantity, price, invoice #)
2. System creates price_history record
3. System updates inventory_items current price and averages
4. System checks for price variance (compares to previous purchase)
5. If variance > threshold, create price_variance record and send alert
6. System updates supplier performance metrics

**Automated Import** (from invoice/POS):
1. System receives invoice data (CSV, API, email parsing)
2. System matches items to inventory_items by SKU/name
3. System matches supplier by name/code
4. System creates price_history records for all items
5. System performs variance checks and sends alerts
6. User reviews and approves imported data

---

### Workflow 2: Price Variance Alert

**Trigger**: Price change exceeds threshold (e.g., >10%)

**Alert Notification**:
```
🔔 Price Alert: Romaine Lettuce

Old Price: $1.50/lb (Fresh Farms)
New Price: $3.20/lb
Change: +$1.70/lb (+113%)

Reason: Seasonal shortage (heat wave)
Impact: 28 recipes affected
Estimated Cost Increase: $45/day

Actions:
- [Review Variance]
- [Compare Suppliers]
- [Adjust Recipes]
- [Update Menu Prices]
```

**Manager Review Process**:
1. Click [Review Variance]
2. View detailed variance information
3. Check supplier comparison (are others cheaper?)
4. Review recipe impact (which dishes affected?)
5. Decide action:
   - Accept new price (acknowledge)
   - Switch to alternative supplier
   - Adjust recipe (reduce portion, substitute)
   - Increase menu price
6. Document decision in variance record

---

### Workflow 3: Supplier Performance Review

**Monthly Supplier Scorecard**:

**Pacific Seafood - February 2026 Performance**

| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| **Average Quality** | 4.8/5 | >4.0 | ✓ Excellent |
| **Average Delivery** | 4.2/5 | >4.0 | ✓ Good |
| **Price Competitiveness** | 92/100 | >80 | ✓ Competitive |
| **On-Time Delivery** | 95% | >90% | ✓ Excellent |
| **Order Accuracy** | 98% | >95% | ✓ Excellent |
| **Invoice Accuracy** | 100% | >98% | ✓ Perfect |
| **Overall Score** | 95/100 | >85 | ✓ Excellent |

**Recommendation**: Continue as primary seafood supplier. Excellent performance across all metrics.

---

## Integration with Yield Management System

### Combined Cost Analysis

The price history system integrates seamlessly with the yield management system to provide complete historical cost analysis.

**Example: Historical EP Cost Calculation**

```
Item: Whole Salmon
Date: February 15, 2026

Price History:
- AP Cost: $18.50/lb (from price_history table)

Yield Data:
- Yield %: 65% (from yield_conversions table)
- Cost Factor: 1.54

Historical EP Cost:
- EP Cost: $18.50 × 1.54 = $28.49/lb
- EP Cost per oz: $28.49 ÷ 16 = $1.78/oz

Recipe uses 6 oz:
- Recipe Cost (Feb 2026): 6 oz × $1.78 = $10.68

Historical Comparison:
- Jan 2026: $16.00 AP × 1.54 = $24.64 EP → $9.23 recipe cost
- Dec 2025: $22.00 AP × 1.54 = $33.88 EP → $12.69 recipe cost
- Nov 2025: $15.20 AP × 1.54 = $23.41 EP → $8.77 recipe cost
```

**Combined View: Historical Recipe Costs**

This allows you to answer questions like:
- "What did this recipe cost to make last July?"
- "How has our food cost % changed over the past year?"
- "Which recipes have the most volatile costs?"
- "When is the best time to feature this dish on the menu?"

---

## Reporting and Analytics

### Standard Reports

**1. Price Trend Report**

Shows price trends for all items or selected categories over a specified time period.

**Filters**:
- Date range (last 30/90/365 days, custom)
- Category (Seafood, Produce, etc.)
- Supplier
- Volatility level

**Output**:
- Line chart showing price trends
- Table with current vs. average prices
- Trend direction indicators
- Volatility scores

**2. Supplier Comparison Report**

Compares multiple suppliers for the same items.

**Metrics**:
- Average price by supplier
- Quality ratings
- Delivery ratings
- Quality-adjusted price
- Total spend by supplier

**Output**:
- Side-by-side comparison table
- Best value recommendations
- Supplier scorecards

**3. Cost Impact Report**

Shows how price changes affect recipe costs and menu profitability.

**Analysis**:
- Recipe cost changes over time
- Food cost % trends
- Menu items most affected by price volatility
- Recommended menu price adjustments

**Output**:
- Recipe cost history table
- Food cost % trend chart
- Price adjustment recommendations

**4. Seasonal Pattern Report**

Identifies seasonal price patterns for better purchasing decisions.

**Analysis**:
- Average price by season (Spring/Summer/Fall/Winter)
- Average price by month
- Best and worst times to buy
- Seasonal variance percentage

**Output**:
- Seasonal price chart
- Month-by-month comparison table
- Purchasing calendar (when to buy)

**5. Price Variance Report**

Lists all significant price changes and variance alerts.

**Filters**:
- Date range
- Variance threshold (>10%, >25%, etc.)
- Acknowledged vs. unacknowledged
- Item or supplier

**Output**:
- Variance summary table
- Alert history
- Actions taken
- Outstanding variances requiring review

---

## Implementation Recommendations

### Phase 1: Foundation (Months 1-2)

**Objective**: Establish supplier database and begin price tracking

**Actions**:
1. Create suppliers table and enter all current suppliers
2. Add supplier_id field to inventory_items
3. Link each inventory item to current primary supplier
4. Create price_history table
5. Begin logging all purchases (manual entry initially)
6. Set up basic price variance alerts (>25% threshold)

**Deliverables**:
- Complete supplier database
- 2 months of price history data
- Basic variance alerting operational

---

### Phase 2: Automation (Months 2-4)

**Objective**: Automate price tracking and implement analytics

**Actions**:
1. Implement invoice import (CSV, email parsing, or API)
2. Set up automatic price_history record creation
3. Implement rolling average calculations
4. Build price trend dashboard
5. Create supplier comparison reports
6. Configure variance alert thresholds (10%, 25%, 50%)

**Deliverables**:
- Automated price tracking from invoices
- Real-time price analytics dashboard
- Supplier performance scorecards
- Variance alert system operational

---

### Phase 3: Advanced Analytics (Months 4-6)

**Objective**: Implement historical cost analysis and predictive features

**Actions**:
1. Integrate with yield management system
2. Build historical recipe cost calculator
3. Implement seasonal pattern recognition
4. Create cost impact reports
5. Build purchasing calendar (best times to buy)
6. Implement price forecasting (basic trend projection)

**Deliverables**:
- Historical recipe cost analysis
- Seasonal purchasing recommendations
- Predictive price alerts
- Complete reporting suite

---

### Phase 4: Optimization (Months 6+)

**Objective**: Optimize purchasing and supplier management

**Actions**:
1. Implement supplier auto-switching recommendations
2. Build menu pricing optimization tool
3. Create contract pricing tracking (for negotiated rates)
4. Implement bulk purchase opportunity alerts
5. Build supplier negotiation support tools

**Deliverables**:
- Automated purchasing recommendations
- Menu pricing optimization
- Supplier negotiation insights
- ROI tracking and reporting

---

## Success Metrics

### Key Performance Indicators

**Price Tracking Coverage**:
- % of inventory items with price history: Target 95%+
- % of purchases logged: Target 100%
- Average data points per item: Target 12+ per year

**Cost Savings**:
- Supplier switching savings: Track $ saved by switching to lower-cost suppliers
- Seasonal purchasing savings: Track $ saved by buying at optimal times
- Contract negotiation savings: Track $ saved from data-driven negotiations

**Operational Efficiency**:
- Time to identify price changes: Target <24 hours
- Variance alert response time: Target <48 hours
- Supplier performance review frequency: Monthly

**Decision Quality**:
- % of variances with documented actions: Target 100%
- % of supplier switches with positive ROI: Target >80%
- % of menu prices updated based on cost data: Target >90%

---

### Expected Outcomes

**Year 1**:
- Complete price history: 12+ months of data for all items
- Cost savings: 3-5% of food purchases through better supplier selection
- Improved forecasting: Accurate seasonal price predictions
- Better negotiations: Data-driven supplier contracts

**Year 2+**:
- Predictive purchasing: Automated recommendations for when to buy
- Optimized menu pricing: Dynamic pricing based on cost trends
- Supplier optimization: Best-in-class supplier mix
- ROI: 400-600% (cost savings vs. implementation cost)

---

## Appendix A: Sample Supplier Scorecard

```
SUPPLIER PERFORMANCE SCORECARD

Supplier: Pacific Seafood Co.
Review Period: February 2026
Account Manager: John Smith

QUALITY METRICS
┌─────────────────────────────┬─────────┬────────┬────────┐
│ Metric                      │ Score   │ Target │ Status │
├─────────────────────────────┼─────────┼────────┼────────┤
│ Product Quality Rating      │ 4.8/5   │ >4.0   │ ✓      │
│ Consistency                 │ 95%     │ >90%   │ ✓      │
│ Freshness                   │ 4.9/5   │ >4.5   │ ✓      │
│ Packaging Quality           │ 4.6/5   │ >4.0   │ ✓      │
└─────────────────────────────┴─────────┴────────┴────────┘

DELIVERY METRICS
┌─────────────────────────────┬─────────┬────────┬────────┐
│ Metric                      │ Score   │ Target │ Status │
├─────────────────────────────┼─────────┼────────┼────────┤
│ On-Time Delivery            │ 95%     │ >90%   │ ✓      │
│ Order Accuracy              │ 98%     │ >95%   │ ✓      │
│ Delivery Rating             │ 4.2/5   │ >4.0   │ ✓      │
│ Damage/Shortage Rate        │ 2%      │ <5%    │ ✓      │
└─────────────────────────────┴─────────┴────────┴────────┘

PRICING METRICS
┌─────────────────────────────┬─────────┬────────┬────────┐
│ Metric                      │ Score   │ Target │ Status │
├─────────────────────────────┼─────────┼────────┼────────┤
│ Price Competitiveness       │ 92/100  │ >80    │ ✓      │
│ Price Stability             │ 88/100  │ >75    │ ✓      │
│ Invoice Accuracy            │ 100%    │ >98%   │ ✓      │
│ Payment Terms               │ Net 30  │ Net 30 │ ✓      │
└─────────────────────────────┴─────────┴────────┴────────┘

OVERALL PERFORMANCE
┌─────────────────────────────┬─────────┬────────┬────────┐
│ Category                    │ Score   │ Weight │ Total  │
├─────────────────────────────┼─────────┼────────┼────────┤
│ Quality                     │ 96/100  │ 40%    │ 38.4   │
│ Delivery                    │ 94/100  │ 30%    │ 28.2   │
│ Pricing                     │ 95/100  │ 30%    │ 28.5   │
├─────────────────────────────┼─────────┼────────┼────────┤
│ OVERALL SCORE               │         │        │ 95.1   │
└─────────────────────────────┴─────────┴────────┴────────┘

Rating: ⭐⭐⭐⭐⭐ EXCELLENT (95.1/100)

RECOMMENDATION: Continue as primary seafood supplier
NOTES: Exceptional performance across all metrics
ACTION ITEMS: None - maintain current relationship
```

---

## Appendix B: Price Variance Alert Template

```
🔔 PRICE VARIANCE ALERT

Item: Romaine Lettuce, 24 ct case
Supplier: Fresh Farms Produce
Alert Level: 🔴 CRITICAL
Date: February 15, 2026

PRICE CHANGE
Previous Price: $1.50/lb (January 28, 2026)
New Price: $3.20/lb
Change: +$1.70/lb (+113.3%)

CONTEXT
30-Day Average: $1.65/lb
90-Day Average: $1.58/lb
1-Year Average: $1.72/lb
Historical Low: $1.20/lb (August 2025)
Historical High: $3.50/lb (July 2025)

IMPACT ANALYSIS
Recipes Affected: 28
Daily Usage: 15 lbs
Daily Cost Increase: $25.50
Monthly Cost Increase: $765.00
Annual Cost Impact: $9,180.00

REASON
Seasonal shortage due to heat wave in California
Expected Duration: 2-4 weeks
Market-wide issue: All suppliers affected

ALTERNATIVE SUPPLIERS
Fresh Farms: $3.20/lb (current)
Sysco: $3.40/lb (+6.3%)
US Foods: $3.15/lb (-1.6%) ✓ Best Alternative

RECOMMENDED ACTIONS
☐ Switch to US Foods temporarily (-$0.05/lb savings)
☐ Reduce portion sizes in affected recipes
☐ Substitute with iceberg or spring mix where possible
☐ Increase menu prices on salad items (+$1.00)
☐ Feature non-lettuce dishes on specials board

APPROVAL REQUIRED
Manager: ___________  Date: ___________
Action Taken: _________________________________
Expected Savings: $_________
```

---

## Conclusion

Implementing a comprehensive price history tracking and supplier cost analysis system is essential for managing the significant cost volatility inherent in restaurant operations. Inventory prices can fluctuate **20-50% or more** throughout the year due to seasonal variations, market conditions, and supplier differences, making historical tracking critical for accurate cost analysis and informed purchasing decisions.

By implementing this system, Chef's Kiss will enable restaurant operators to:

1. **Track complete price history** for every inventory item with automatic logging from purchases
2. **Compare supplier performance** using quality-adjusted pricing and comprehensive scorecards
3. **Identify cost trends** with rolling averages, seasonal patterns, and volatility metrics
4. **Receive timely alerts** for significant price changes requiring management attention
5. **Analyze historical recipe costs** by integrating with the yield management system
6. **Make data-driven decisions** for supplier selection, menu pricing, and purchasing timing

The phased implementation approach allows for gradual adoption over 6-12 months, starting with basic supplier tracking and price logging, then expanding to automated analytics and predictive features. Expected outcomes include **3-5% cost savings** in Year 1 through better supplier selection and seasonal purchasing, with sustained improvements and **400-600% ROI** in subsequent years.

When combined with the yield management system, Chef's Kiss will provide the most comprehensive and accurate food cost tracking available, giving restaurant operators complete visibility into their true costs from purchase through preparation to final menu pricing.

---

**Document Version**: 1.0  
**Date**: February 15, 2026  
**Author**: Manus AI  
**Status**: Recommendation for Implementation
