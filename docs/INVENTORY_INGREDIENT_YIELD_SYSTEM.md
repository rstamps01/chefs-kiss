# Inventory-to-Ingredient Conversion and Yield Management System

## Executive Summary

This document provides comprehensive recommendations for implementing inventory-to-ingredient conversion tracking, yield management, waste monitoring, and accurate recipe costing in Chef's Kiss. The system addresses the critical gap between **raw inventory** (what you purchase) and **usable ingredients** (what actually goes into recipes), enabling accurate cost calculation and waste reduction.

**Key Problem**: Current systems track inventory at purchase price (AP cost) but recipes use ingredients at actual usable cost (EP cost). Research shows the difference can be **20-50% or higher**, leading to significant underestimation of true food costs and menu pricing errors.

**Solution**: Implement a three-layer system that tracks (1) inventory purchases, (2) yield conversions to ingredients, and (3) waste events, providing accurate edible portion costs for recipe costing.

---

## The Cost Gap Problem

### Real-World Example: Whole Salmon

**Current System (Inaccurate)**:
- Purchase: Whole salmon, 10 lbs @ $12/lb = $120
- Recipe uses: 6 oz salmon fillet
- Calculated cost: $12/lb × 0.375 lb = **$4.50**

**Accurate System (With Yield)**:
- Purchase: Whole salmon, 10 lbs @ $12/lb = $120
- After filleting: 6.5 lbs usable fillets (65% yield)
- True cost: $120 ÷ 6.5 lbs = $18.46/lb
- Recipe uses: 6 oz salmon fillet
- Actual cost: $18.46/lb × 0.375 lb = **$6.92**

**Impact**: **54% cost underestimation** leads to menu underpricing and profit erosion.

### Industry Data

According to culinary management research, yield percentages vary significantly by product category:

| **Product Category** | **Typical Yield Range** | **Cost Impact** |
|----------------------|-------------------------|-----------------|
| Whole fish | 45-65% | 55-120% cost increase |
| Shellfish (shell-on) | 50-60% | 67-100% cost increase |
| Whole poultry | 65-75% | 33-54% cost increase |
| Bone-in meats | 70-80% | 25-43% cost increase |
| Root vegetables | 80-90% | 11-25% cost increase |
| Leafy greens | 75-85% | 18-33% cost increase |
| Avocados | 65-75% | 33-54% cost increase |

The Natural Resources Defense Council (NRDC) reports that **4-10% of food purchased by restaurants becomes pre-consumer waste** before reaching customers, representing direct profit loss that must be tracked and minimized.

---

## System Architecture

### Three-Layer Data Model

```
Layer 1: INVENTORY (As-Purchased)
    ↓ (yield conversion)
Layer 2: INGREDIENTS (Edible Portion)
    ↓ (recipe usage)
Layer 3: RECIPES (Menu Items)
```

**Cross-Cutting**: WASTE LOG tracks losses at all layers

---

## Layer 1: Inventory Management (As-Purchased)

### Data Structure

**Inventory Item Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `inventory_id` | UUID | Unique identifier | `inv_001` |
| `item_name` | String | Name as purchased | "Avocado 60 ct case" |
| `category` | Enum | Inventory category | "Produce" |
| `vendor_id` | UUID | Supplier reference | `vend_123` |
| `purchase_unit` | Enum | Unit of purchase | "case", "lb", "each" |
| `purchase_quantity` | Decimal | Quantity per order unit | 60.0 |
| `ap_cost` | Decimal | As-Purchased cost | $45.00 |
| `ap_cost_per_base_unit` | Decimal | Cost per smallest unit | $0.75/each |
| `last_purchase_date` | Date | Most recent purchase | 2026-02-10 |
| `average_weight_per_unit` | Decimal | For "each" items | 6 oz |

**Key Concept**: This layer captures exactly what you buy and what you pay, without any processing or yield adjustments.

---

## Layer 2: Ingredient Management (Edible Portion)

### Data Structure

**Ingredient Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ingredient_id` | UUID | Unique identifier | `ing_001` |
| `ingredient_name` | String | Name as used in recipes | "Avocado, diced" |
| `source_inventory_id` | UUID | Links to inventory item | `inv_001` |
| `yield_percentage` | Decimal | Usable portion % | 70.0 |
| `cost_factor` | Decimal | Calculated: 100 ÷ yield % | 1.43 |
| `recipe_unit` | Enum | Unit used in recipes | "oz", "cup", "tbsp" |
| `ep_cost_per_recipe_unit` | Decimal | Edible Portion cost | $0.179/oz |
| `conversion_notes` | Text | Prep instructions | "Remove pit, skin, dice" |
| `prep_time_minutes` | Integer | Labor time per unit | 15 min per case |

**Yield Conversion Table** (for complex items):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `conversion_id` | UUID | Unique identifier | `conv_001` |
| `inventory_id` | UUID | Source inventory | `inv_002` |
| `ingredient_id` | UUID | Resulting ingredient | `ing_005` |
| `yield_percentage` | Decimal | Conversion yield | 52.0 |
| `trim_waste_percentage` | Decimal | Predictable waste | 34.0 |
| `cooking_loss_percentage` | Decimal | If applicable | 14.0 |
| `waste_type` | Enum | Category | "bones", "skin", "fat" |
| `by_product_value` | Decimal | If waste has value | $2.50 (for stock) |

### Calculation Formulas

**1. Cost Factor**:
```
Cost Factor = 100 ÷ Yield Percentage
```

**2. EP Cost per Recipe Unit**:
```
EP Cost = (AP Cost × Cost Factor) ÷ Units per Purchase Quantity
```

**3. Recipe Ingredient Cost**:
```
Recipe Cost = Quantity Used × EP Cost per Recipe Unit
```

### Example Calculations

**Example 1: Avocado (Simple)**

```
Inventory:
- Item: Avocado 60 ct case
- AP Cost: $45.00
- Average weight: 6 oz each
- Total weight: 360 oz

Ingredient:
- Name: Avocado, diced
- Yield: 70% (remove pit, skin)
- Usable weight: 252 oz
- Recipe unit: oz

Calculations:
- Cost Factor: 100 ÷ 70 = 1.43
- AP cost per oz: $45 ÷ 360 = $0.125/oz
- EP cost per oz: $45 ÷ 252 = $0.179/oz
  (or: $0.125 × 1.43 = $0.179/oz)

Recipe uses 2 oz avocado:
- Cost = 2 oz × $0.179 = $0.36
```

**Example 2: Whole Chicken (Complex)**

```
Inventory:
- Item: Whole chicken
- AP Cost: $14.95
- Weight: 5 lbs (80 oz)

Multiple Ingredients:
1. Chicken breast meat
   - Yield: 32.5% of whole (26 oz)
   - EP cost: $14.95 ÷ 26 oz = $0.575/oz

2. Chicken thigh meat
   - Yield: 23.75% of whole (19 oz)
   - EP cost: $14.95 ÷ 19 oz = $0.787/oz

3. Chicken wings
   - Yield: 10% of whole (8 oz)
   - EP cost: $14.95 ÷ 8 oz = $1.869/oz

4. Chicken stock (by-product)
   - From: Bones, skin (27 oz, 33.75%)
   - Value: $3.00 (market value of equivalent stock)
   - Credit back to reduce primary costs

Adjusted costs (with by-product credit):
- Net cost: $14.95 - $3.00 = $11.95
- Breast: $11.95 ÷ 26 oz = $0.460/oz
- Thigh: $11.95 ÷ 19 oz = $0.629/oz
- Wings: $11.95 ÷ 8 oz = $1.494/oz
```

**Example 3: Ground Beef with Cooking Loss**

```
Inventory:
- Item: Ground beef 80/20
- AP Cost: $4.50/lb
- Weight: 10 lbs (raw)

Ingredient (after cooking):
- Name: Ground beef, cooked
- Raw yield: 100%
- Cooking yield: 75% (fat renders)
- Final weight: 7.5 lbs
- Recipe unit: oz (cooked)

Calculations:
- Cost Factor: 100 ÷ 75 = 1.33
- EP cost: $4.50 × 1.33 = $6.00/lb cooked
- EP cost per oz: $6.00 ÷ 16 = $0.375/oz

Recipe uses 4 oz cooked beef:
- Cost = 4 oz × $0.375 = $1.50
```

---

## Layer 3: Waste Tracking System

### Waste Log Data Structure

**Waste Event Table**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `waste_id` | UUID | Unique identifier | `waste_001` |
| `date_time` | Timestamp | When waste occurred | 2026-02-15 14:30 |
| `inventory_id` | UUID | Item wasted | `inv_001` |
| `ingredient_id` | UUID | If processed | `ing_001` |
| `waste_category` | Enum | Type of waste | "spoilage" |
| `waste_subcategory` | Enum | Specific reason | "expired" |
| `quantity_wasted` | Decimal | Amount | 2.5 |
| `unit` | Enum | Unit of measure | "lb" |
| `cost` | Decimal | Dollar value | $8.75 |
| `logged_by` | UUID | Staff member | `staff_042` |
| `reason_notes` | Text | Explanation | "Past use-by date" |
| `location` | Enum | Where occurred | "walk-in cooler" |
| `shift` | Enum | When occurred | "lunch prep" |

### Waste Categories

**Primary Categories**:

1. **Trim Waste** (Predictable)
   - Bones, skin, shells
   - Peels, stems, cores
   - Fat trimming
   - **Note**: Captured by yield percentage, not logged separately unless excessive

2. **Spoilage Waste** (Preventable)
   - Expired inventory
   - Improper storage damage
   - Freezer burn
   - Mold/contamination
   - **Action**: Improve inventory rotation, ordering

3. **Preparation Waste** (Controllable)
   - Over-portioning
   - Spillage during prep
   - Dropped food
   - Over-trimming (beyond normal yield)
   - **Action**: Staff training, process improvement

4. **Cooking Waste** (Operational)
   - Burnt food
   - Overcooked/undercooked
   - Kitchen mistakes
   - **Action**: Training, equipment maintenance

5. **Service Waste** (Operational)
   - Misfires (wrong order made)
   - Remakes (quality issues)
   - Returned plates
   - **Action**: Communication, quality control

6. **Overproduction Waste** (Forecasting)
   - Excess prep that can't be saved
   - Buffet/display food past hold time
   - **Action**: Better forecasting, batch cooking

7. **Theft** (Security)
   - Staff theft
   - Missing inventory
   - **Action**: Security measures, culture

### Waste Tracking Workflow

**Step 1: Real-Time Logging**
- Staff logs waste immediately when it occurs
- Mobile/tablet interface for quick entry
- Required fields: item, quantity, category, reason

**Step 2: Daily Review**
- Manager reviews waste log daily
- Flags unusual patterns
- Follows up on high-value waste

**Step 3: Weekly Analysis**
- Calculate waste $ and % by category
- Compare to targets (target: <3% of purchases)
- Identify trends

**Step 4: Monthly Audit**
- Cross-reference waste log with inventory variance
- Theoretical vs. actual inventory
- Investigate discrepancies

**Step 5: Corrective Actions**
- Address root causes
- Retrain staff
- Adjust ordering/prep procedures
- Update yield percentages if needed

### Waste Metrics and Targets

| **Metric** | **Calculation** | **Target** | **Action Threshold** |
|------------|-----------------|------------|----------------------|
| Total Waste % | (Waste $ ÷ Purchases $) × 100 | <3% | >5% |
| Waste $ per Cover | Waste $ ÷ # Customers | <$0.50 | >$1.00 |
| Spoilage % | (Spoilage $ ÷ Waste $) × 100 | <30% | >50% |
| Prep Waste % | (Prep Waste $ ÷ Waste $) × 100 | <20% | >35% |
| Service Waste % | (Service Waste $ ÷ Waste $) × 100 | <15% | >25% |

---

## Implementation Recommendations

### Phase 1: Foundation (Months 1-2)

**Objective**: Establish yield data for top 20% of inventory (by cost)

**Actions**:
1. Identify high-cost inventory items (Pareto principle: 20% of items = 80% of cost)
2. Conduct yield tests on these items:
   - Weigh as-purchased
   - Process normally
   - Weigh edible portion
   - Calculate yield %
3. Create ingredient records with yield percentages
4. Update recipe costs with EP costs

**Deliverables**:
- Yield library for top 50-100 items
- Updated recipe costs
- Baseline food cost % (accurate)

### Phase 2: Waste Tracking (Months 2-3)

**Objective**: Implement waste logging system

**Actions**:
1. Design waste log interface (mobile-friendly)
2. Train all staff on logging procedures
3. Establish daily/weekly review process
4. Set waste reduction targets

**Deliverables**:
- Waste tracking system operational
- 2 months of baseline waste data
- Waste reduction action plan

### Phase 3: Full Rollout (Months 3-6)

**Objective**: Complete yield library and optimize processes

**Actions**:
1. Conduct yield tests on remaining inventory items
2. Implement by-product tracking and value recovery
3. Integrate waste data with inventory variance reports
4. Establish continuous improvement process

**Deliverables**:
- Complete yield library (all items)
- Waste reduction: target 20-30% reduction
- Accurate food cost reporting

### Phase 4: Advanced Features (Months 6+)

**Objective**: Optimize and automate

**Actions**:
1. Seasonal yield adjustments (produce quality varies)
2. Vendor yield comparison (which supplier has better yields)
3. Predictive waste alerts (items approaching expiration)
4. Staff performance dashboards (waste by employee)

**Deliverables**:
- Automated yield updates
- Vendor scorecards
- Waste reduction: target 40-50% from baseline

---

## Database Schema Design

### Core Tables

**1. inventory_items**
```sql
CREATE TABLE inventory_items (
  inventory_id UUID PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  vendor_id UUID REFERENCES vendors(vendor_id),
  purchase_unit VARCHAR(50),
  purchase_quantity DECIMAL(10,3),
  ap_cost DECIMAL(10,2),
  ap_cost_per_base_unit DECIMAL(10,4),
  average_weight_per_unit DECIMAL(10,3),
  last_purchase_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. ingredients**
```sql
CREATE TABLE ingredients (
  ingredient_id UUID PRIMARY KEY,
  ingredient_name VARCHAR(255) NOT NULL,
  source_inventory_id UUID REFERENCES inventory_items(inventory_id),
  yield_percentage DECIMAL(5,2) NOT NULL,
  cost_factor DECIMAL(6,4) GENERATED ALWAYS AS (100.0 / yield_percentage) STORED,
  recipe_unit VARCHAR(50),
  ep_cost_per_recipe_unit DECIMAL(10,4),
  conversion_notes TEXT,
  prep_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**3. yield_conversions**
```sql
CREATE TABLE yield_conversions (
  conversion_id UUID PRIMARY KEY,
  inventory_id UUID REFERENCES inventory_items(inventory_id),
  ingredient_id UUID REFERENCES ingredients(ingredient_id),
  yield_percentage DECIMAL(5,2),
  trim_waste_percentage DECIMAL(5,2),
  cooking_loss_percentage DECIMAL(5,2),
  waste_type VARCHAR(100),
  by_product_value DECIMAL(10,2),
  notes TEXT,
  test_date DATE,
  tested_by UUID REFERENCES staff(staff_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**4. waste_log**
```sql
CREATE TABLE waste_log (
  waste_id UUID PRIMARY KEY,
  date_time TIMESTAMP NOT NULL,
  inventory_id UUID REFERENCES inventory_items(inventory_id),
  ingredient_id UUID REFERENCES ingredients(ingredient_id),
  waste_category VARCHAR(50) NOT NULL,
  waste_subcategory VARCHAR(50),
  quantity_wasted DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  logged_by UUID REFERENCES staff(staff_id),
  reason_notes TEXT,
  location VARCHAR(100),
  shift VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calculated Views

**View: ingredient_costs_current**
```sql
CREATE VIEW ingredient_costs_current AS
SELECT 
  i.ingredient_id,
  i.ingredient_name,
  inv.item_name AS source_item,
  i.yield_percentage,
  i.cost_factor,
  inv.ap_cost,
  (inv.ap_cost * i.cost_factor) AS ep_cost,
  i.recipe_unit,
  i.ep_cost_per_recipe_unit
FROM ingredients i
JOIN inventory_items inv ON i.source_inventory_id = inv.inventory_id;
```

**View: waste_summary_daily**
```sql
CREATE VIEW waste_summary_daily AS
SELECT 
  DATE(date_time) AS waste_date,
  waste_category,
  COUNT(*) AS event_count,
  SUM(cost) AS total_cost,
  AVG(cost) AS avg_cost_per_event
FROM waste_log
GROUP BY DATE(date_time), waste_category
ORDER BY waste_date DESC, total_cost DESC;
```

---

## User Interface Recommendations

### 1. Yield Management Dashboard

**Key Metrics Display**:
- Total items with yield data: 187 / 207 (90%)
- Average yield across all items: 76.3%
- Items needing yield testing: 20 (flagged in red)
- Last yield test date: 2026-02-10

**Item List View**:
| Item Name | AP Cost | Yield % | EP Cost | Last Test | Actions |
|-----------|---------|---------|---------|-----------|---------|
| Avocado 60 ct | $45.00 | 70% | $64.29 | 2026-01-15 | [Edit] [Retest] |
| Whole Salmon | $12.00/lb | 65% | $18.46/lb | 2026-02-01 | [Edit] [Retest] |

**Quick Actions**:
- [+ Conduct Yield Test] - Wizard for new tests
- [Import Yield Library] - Upload standard yields
- [Export Report] - Download yield data

### 2. Waste Logging Interface

**Mobile-Optimized Entry Form**:
```
┌─────────────────────────────────┐
│ Log Waste Event                 │
├─────────────────────────────────┤
│ Item: [Search/Select ▼]        │
│ Quantity: [____] [oz ▼]        │
│ Category: [Spoilage ▼]         │
│ Reason: [Expired ▼]            │
│ Notes: [________________]       │
│                                 │
│ [Cancel]  [Log Waste]          │
└─────────────────────────────────┘
```

**Recent Waste Log** (for manager review):
| Time | Item | Qty | Category | Cost | Logged By | Reason |
|------|------|-----|----------|------|-----------|--------|
| 14:30 | Romaine | 2 lb | Spoilage | $7.00 | John | Wilted |
| 12:15 | Salmon | 8 oz | Cooking | $12.00 | Maria | Burnt |

### 3. Recipe Costing View (Enhanced)

**Before (Current)**:
```
Caesar Salad - Ingredient Cost
- Romaine lettuce: 4 oz @ $0.047/oz = $0.19
- Parmesan: 1 oz @ $0.25/oz = $0.25
Total: $0.44
```

**After (With Yield)**:
```
Caesar Salad - Ingredient Cost
- Romaine lettuce: 4 oz @ $0.059/oz (EP) = $0.24
  [AP: $0.047/oz | Yield: 80% | Factor: 1.25]
- Parmesan: 1 oz @ $0.31/oz (EP) = $0.31
  [AP: $0.25/oz | Yield: 80% | Factor: 1.25]
Total: $0.55 (+25% accurate cost)
```

**Visual Indicator**:
- Green checkmark: Yield data current
- Yellow warning: Yield data >90 days old
- Red alert: No yield data (using AP cost)

### 4. Waste Analytics Dashboard

**Summary Cards**:
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Today's Waste   │  │ This Week       │  │ This Month      │
│ $47.23          │  │ $312.50         │  │ $1,245.00       │
│ 2.1% of sales   │  │ 2.8% of sales   │  │ 3.2% of sales   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Waste by Category** (pie chart):
- Spoilage: 35% ($436)
- Prep Waste: 28% ($349)
- Service Waste: 22% ($274)
- Cooking Waste: 15% ($186)

**Top Wasted Items** (bar chart):
1. Romaine Lettuce: $127 (18 events)
2. Salmon Fillet: $98 (7 events)
3. Chicken Breast: $76 (12 events)

**Trend Line** (line chart):
- X-axis: Last 30 days
- Y-axis: Waste $ and Waste %
- Target line: 3% threshold

---

## Integration with Existing Chef's Kiss Features

### 1. Inventory Management Module

**Enhancements**:
- Add "Yield %" column to inventory list
- Flag items missing yield data
- Link to ingredient records
- Show EP cost alongside AP cost

**New Reports**:
- Inventory Valuation (EP basis)
- Yield Test Schedule (items due for retesting)
- Vendor Yield Comparison

### 2. Recipe Management Module

**Enhancements**:
- Display both AP and EP costs for ingredients
- Visual indicators for yield data quality
- Automatic cost updates when AP prices change
- Warning when using AP cost (no yield data)

**New Features**:
- Yield impact analysis ("What if yield changes?")
- Cost breakdown showing yield factors
- Historical cost trends (with yield adjustments)

### 3. Prep Planning Module

**Integration Points**:
- Calculate raw quantities needed based on yield
- Example: Need 10 lbs usable chicken breast
  - With 65% yield → order 15.4 lbs whole chicken
- Show both raw and usable quantities on prep lists

### 4. Reporting Module

**New Reports**:
1. **Yield Performance Report**
   - Actual yields vs. standard yields
   - Variance analysis
   - Retest recommendations

2. **Waste Analysis Report**
   - Waste by category, item, time period
   - Waste trends
   - Cost impact

3. **True Food Cost Report**
   - Food cost % using EP costs
   - Waste cost %
   - Combined actual food cost

4. **Vendor Performance Report**
   - Yield comparison by vendor
   - Quality scores
   - True cost per vendor (including yield)

---

## Training and Change Management

### Staff Training Requirements

**Kitchen Staff** (1-2 hours):
- Why yield matters
- How to log waste correctly
- Real-time logging importance
- Using mobile waste log interface

**Management** (3-4 hours):
- Conducting yield tests
- Analyzing waste reports
- Setting targets and goals
- Corrective action planning

**Purchasing** (2-3 hours):
- Understanding EP vs. AP costs
- Vendor yield comparison
- Ordering quantities with yield factors

### Change Management Considerations

**Resistance Points**:
1. "Extra work" - logging waste takes time
2. "We've always done it this way" - cultural resistance
3. "It's not that much waste" - underestimating impact

**Mitigation Strategies**:
1. Show the money - calculate actual waste cost
2. Make it easy - mobile interface, quick entry
3. Gamify - reward waste reduction
4. Lead by example - management logs waste too
5. Share wins - celebrate improvements

---

## Success Metrics

### Key Performance Indicators

**Yield Management**:
- % of inventory items with yield data: Target 95%+
- Average yield test age: Target <90 days
- Recipe cost accuracy: Target ±5% of actual

**Waste Reduction**:
- Total waste %: Target <3% of purchases
- Waste $ per cover: Target <$0.50
- Spoilage waste: Target <30% of total waste
- Waste trend: Target 10% reduction per quarter

**Financial Impact**:
- Food cost % (accurate): Baseline → Target
- Gross profit margin: Track improvement
- Menu price adjustments: Document changes
- ROI: Cost savings vs. implementation cost

### Expected Outcomes

**Year 1**:
- Accurate food costs: 95%+ of recipes
- Waste reduction: 30-40% from baseline
- Cost savings: 2-3% of food purchases
- ROI: 300-500% (typical for waste reduction programs)

**Year 2+**:
- Sustained waste levels: <3% of purchases
- Continuous improvement: 5-10% annual gains
- Cultural shift: Waste reduction embedded in operations

---

## Appendix A: Standard Yield Reference Table

| **Item** | **Yield %** | **Cost Factor** | **Notes** |
|----------|-------------|-----------------|-----------|
| **Produce** |
| Avocados | 70% | 1.43 | Remove pit, skin |
| Bell Peppers | 82% | 1.22 | Remove seeds, stem |
| Broccoli | 65% | 1.54 | Remove stems, use florets |
| Cabbage | 80% | 1.25 | Remove outer leaves, core |
| Carrots (peeled) | 82% | 1.22 | Peel, trim ends |
| Celery | 75% | 1.33 | Trim leaves, ends |
| Cucumber | 85% | 1.18 | Peel, seed if needed |
| Lettuce (romaine) | 78% | 1.28 | Remove outer leaves, core |
| Onions | 88% | 1.14 | Peel, trim ends |
| Tomatoes | 92% | 1.09 | Remove core |
| **Proteins** |
| Chicken, whole | 68% | 1.47 | Remove bones, skin |
| Chicken breast, boneless | 96% | 1.04 | Trim fat only |
| Beef tenderloin | 70% | 1.43 | Remove fat, silverskin |
| Ground beef (cooked) | 75% | 1.33 | Fat renders during cooking |
| Pork loin | 75% | 1.33 | Remove fat, bones |
| **Seafood** |
| Salmon, whole | 60% | 1.67 | Remove head, bones, skin |
| Salmon fillet | 96% | 1.04 | Trim only |
| Shrimp, shell-on | 52% | 1.92 | Peel, devein |
| Shrimp, peeled | 96% | 1.04 | Devein only |
| Tuna, whole | 50% | 2.00 | Remove head, bones, skin, bloodline |

---

## Appendix B: Waste Log Template (Printable)

```
WASTE LOG - Date: ___________  Shift: ___________

| Time | Item Name | Qty | Unit | Category | Reason | Cost | Logged By |
|------|-----------|-----|------|----------|--------|------|-----------|
|      |           |     |      |          |        |      |           |
|      |           |     |      |          |        |      |           |
|      |           |     |      |          |        |      |           |

Categories:
- Spoilage: Expired, moldy, contaminated
- Prep: Dropped, spilled, over-trimmed
- Cooking: Burnt, overcooked, mistakes
- Service: Misfires, remakes, returns
- Overproduction: Excess prep, buffet waste
- Theft: Missing inventory

Manager Review: ___________  Total Waste: $___________
```

---

## Appendix C: Yield Test Worksheet (Printable)

```
YIELD TEST WORKSHEET

Item Name: _________________________  Date: ___________
Vendor: ___________________________  Tested By: ___________

STEP 1: As-Purchased (AP)
- AP Weight/Volume: _________ [unit: _____]
- AP Cost: $_________ per [unit: _____]
- Total AP Cost: $_________

STEP 2: Processing
- Trim/Waste Weight: _________ [unit: _____]
- Trim Description: _________________________________

STEP 3: Edible Portion (EP)
- EP Weight/Volume: _________ [unit: _____]
- EP Weight = AP Weight - Trim Weight

STEP 4: Yield Calculation
- Yield % = (EP Weight ÷ AP Weight) × 100 = _________%
- Cost Factor = 100 ÷ Yield % = _________

STEP 5: EP Cost
- EP Cost per unit = AP Cost × Cost Factor = $_________

STEP 6: Notes
- Processing method: _________________________________
- Prep time: _________ minutes
- By-products (if any): _________________________________
- Quality notes: _________________________________

Manager Approval: ___________  Date Entered: ___________
```

---

## Conclusion

Implementing a comprehensive inventory-to-ingredient conversion and yield management system is essential for accurate food costing and profitability in restaurant operations. The gap between as-purchased costs and edible portion costs can be **20-50% or higher**, leading to significant menu underpricing and profit erosion if not properly tracked.

By implementing the three-layer system (Inventory → Ingredients → Recipes) with integrated waste tracking, Chef's Kiss can provide restaurant operators with:

1. **Accurate recipe costs** based on true usable ingredient costs
2. **Waste visibility** to identify and reduce controllable losses
3. **Data-driven decisions** for menu pricing, vendor selection, and operational improvements
4. **Financial clarity** with true food cost percentages and profit margins

The phased implementation approach allows for gradual adoption, starting with high-impact items and expanding to full coverage over 6-12 months. Expected outcomes include **30-40% waste reduction** and **2-3% food cost savings** in the first year, with sustained improvements thereafter.

---

**Document Version**: 1.0  
**Date**: February 15, 2026  
**Author**: Manus AI  
**Status**: Recommendation for Implementation
