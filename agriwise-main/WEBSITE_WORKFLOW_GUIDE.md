# AGRI-WISE (AGROVIA) — COMPLETE END-TO-END WEBSITE WORKFLOW GUIDE

This guide walks through **every single step and interaction** across the entire Agri-Wise platform, explaining how users navigate, what happens behind the scenes, and how data cascades across the 13 modules.

---

## 1. HIGH-LEVEL PLATFORM MAP & WORKFLOW MODES

```
                                  [ LANDING VIEW ]
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
           [ Quick Roles ]        [ Sign In Modal ]       [ Registration ]
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                                 [ JWT SESSION ]
                                         │
        ┌───────────────────┬────────────┴───────┬───────────────────┐
        ▼                   ▼                    ▼                   ▼
    [ FARMER ]          [ BUYER ]             [ FPO ]            [ ADMIN ]
  9 Active Tabs       3 Active Tabs        3 Active Tabs       3 Active Tabs
```

---

## 2. WORKFLOW 1: VISITOR ARRIVAL & AUTHENTICATION (ALL USERS)

### Step 1.1: Landing on the Homepage (`/`)
1. **First Impression:** The visitor arrives at the warm botanical homepage (`#fbfaf6` warm linen with deep forest typography and Fraunces serif headlines).
2. **Value Proposition Hero:**
   - Reads the headline: *"Make the next season a little clearer."*
   - Views key value pillars: *Soil & weather-driven crop recommendations*, *Fast foliage pathogen detection*, *Predictive mandi price corridors*, and *Direct farm-to-buyer contracting*.
3. **Interactive Metric Cards:** Reviews live counter indicators (Active Farm Plots, Metric Tons Pooled, AI Diagnoses, Zero Middleman Commissions).
4. **Interactive Feature Showcase:** Explores the preview tabs for Crop Recommender, Disease Vision Scanner, Weather Intelligence, and Direct Mandi Marketplace.

### Step 1.2: Authentication & Instant Role Switching
The user can authenticate via three pathways:
1. **Path A — 1-Click Role Exploration (Hero & Footer):**
   - In the "Experience Platform Personas" banner, click any instant access card:
     - *Farmer Portal* $\rightarrow$ logs in as Ramesh Patel (`farmer@agriwise.com`).
     - *Buyer Portal* $\rightarrow$ logs in as ITC Agri-Sourcing (`buyer@agriwise.com`).
     - *FPO Leader* $\rightarrow$ logs in as Malwa Farmers Co-Op (`fpo@agriwise.com`).
     - *Administrator* $\rightarrow$ logs in as Chief Agronomist (`admin@agriwise.com`).
2. **Path B — Sign In Modal (Navbar Button):**
   - Click **"Sign In"** in the top navigation.
   - An organic frosted glass modal opens with two tabs: *One-Click Test Login* and *Custom Credentials*.
   - Either click one of the quick test accounts or enter custom email/password.
3. **Path C — New User Registration:**
   - Switch to the *Create Account* tab in the modal.
   - Enter Full Name, Email, Role (Farmer, Buyer, FPO, Admin), and Password.
   - Click *Create Account* $\rightarrow$ FastAPI registers the user in SQLite database, hashes the password via bcrypt, logs an `AUTH_REGISTER` audit event, and returns a signed JWT token.

---

## 3. WORKFLOW 2: THE FARMER JOURNEY (FIELD TO FORK)

When logged in as a **Farmer**, the top navigation bar displays 9 dedicated modules:

```
[ Farm Intelligence ] ─ [ My Farms ] ─ [ Crop Recommender ] ─ [ Disease Scanner ] ─ [ Weather Intel ] 
        ─ [ AI Assistant ] ─ [ Mandi Forecasting ] ─ [ My Produce Listings ] ─ [ Orders & Dispatch ]
```

### Step 2.1: Unified Farm Overview (`overview`)
1. **Signal Stream:** The farmer lands on their cockpit dashboard.
2. **Top Metric Cards:**
   - *Registered Farms:* Count of active plots and total managed acreage.
   - *Active Crops:* Ongoing Kharif/Rabi cultivation batches.
   - *Local Weather:* Current ambient temperature and sky condition.
   - *Logged Expenses:* Cumulative cultivation investment across all plots.
3. **Proactive Agricultural Action Signals:**
   - Displays real-time decision support alerts (e.g., *"Heavy Rainfall Forecast in 36 Hours — Postpone pesticide spray"* or *"Yellow Rust Risk High due to 88% canopy humidity"*).
   - Each signal has an action button that routes directly to the relevant tool (e.g., *"Inspect Weather"* or *"Launch Scanner"*).

### Step 2.2: Digital Farm & Plot Profiling (`farms`)
1. **View Plots:** The farmer sees all their registered plots (e.g., *Green Valley Plot A*, 5.5 Acres, Alluvial Loam, Drip Irrigation).
2. **Register a New Farm:**
   - Click **"Register New Farm"**.
   - Input Farm Name, Location (e.g., *Indore, Madhya Pradesh*), Total Area, Unit (Acres/Hectares), Soil Type, and Irrigation Source.
   - Click *Save Farm Record* $\rightarrow$ plot is stored in the database and geocoded.

### Step 2.3: Crop Cultivation Lifecycle & Cost Accounting (`farms`)
1. **Add a Crop Cultivation Batch:**
   - Under the selected farm, click **"Add Crop Record"**.
   - Select Crop (e.g., *Wheat - Sharbati*), Sowing Date, Expected Harvest Date, Season (Rabi), and Current Growth Stage (*Vegetative*).
2. **Log Field Interventions:**
   - As farming progresses, click **"Log Field Activity"**.
   - Select activity type (*Sowing, Irrigation, Fertilizer Application, Pesticide Spray, Weeding, Harvesting*), Date, Operational Cost (₹), and Notes.
3. **Track Cultivation Expenses:**
   - Click **"Record Input Expense"**.
   - Itemize seed costs, fertilizer bags (Urea, DAP), diesel, or labor charges.
   - The system aggregates cumulative plot expenses, providing the true cost of cultivation.

### Step 2.4: Pre-Season Crop Recommendation (`crops-recommend`)
1. **Soil & Climate Parameter Input:**
   - The farmer enters their soil health card measurements:
     - Soil Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$) in kg/ha.
     - Soil pH (e.g., 6.8).
     - Local Temperature, Humidity, and Seasonal Rainfall.
   - *Quick Preset Buttons:* Can click *Alluvial Fertile Plains*, *Semi-Arid Dryland*, or *High-Rainfall Coastal* for instant testing.
2. **Execute Decision Engine:**
   - Click **"Compute Recommended Crop"**.
3. **Result:**
   - Primary crop match is displayed with high-confidence badge (e.g., *Chickpea / Bengal Gram - 95% Match*).
   - Scientific Agronomic Rationale: Explains why the crop fits the soil chemistry (e.g., low moisture tolerance, biological nitrogen fixation).
   - Ranked Alternative Crops: Displays secondary choices with compatibility scores (e.g., *Lentils 88%*, *Mustard 82%*).

### Step 2.5: Foliar Disease Diagnosis (`disease`)
1. **Field Discovery:** The farmer spots yellow spots, powdery mildew, or leaf curl on their foliage.
2. **Image Submission:**
   - Select the crop genus (e.g., *Tomato*).
   - Drop or upload a leaf photo, or click one of the quick test samples (*Tomato Early Blight*, *Potato Late Blight*, *Wheat Yellow Rust*).
3. **Run AI Vision Diagnosis:**
   - Click **"Run Diagnostic Vision Scan"**.
4. **Diagnostic Output (Returned in < 2 seconds):**
   - Condition Identified: e.g., *Early Blight (Alternaria solani)* with 93% model confidence.
   - Severity Rating: Tagged as *Moderate* or *Severe*.
   - Pathological Symptoms: Detailed description of concentric brown lesions.
   - Dual-Path Treatment Protocol:
     - **Organic Biocontrol Tab:** Neem seed kernel extract (5%), *Trichoderma viride* bio-spray, cow-urine fermented decoction.
     - **Chemical Protocol Tab:** Mancozeb 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L with safety intervals.
     - **Cultural Prevention Tab:** Aeration pruning, crop rotation with non-solanaceous crops, drip conversion.

### Step 2.6: Meteorological Intelligence & Action Windows (`weather`)
1. **Hyper-Localized Forecast:** Farmer selects their region (e.g., *Punjab Central*, *Madhya Pradesh Plateau*, *Maharashtra Nashik*).
2. **Current Conditions:** Displays ambient temperature, canopy relative humidity, wind speed, and precipitation.
3. **5-Day Agricultural Outlook:** Displays day-by-day maximum/minimum temperature and precipitation probability.
4. **Agronomic Decision Rules:**
   - *Spray Window Advisory:* Warns if spray will wash off due to impending precipitation.
   - *Evapotranspiration Irrigation Rule:* Suggests adjusting irrigation timers based on soil moisture and humidity.

### Step 2.7: AI Mandi Demand & Price Corridor Forecasting (`market`)
1. **Market Planning:** Farmer selects commodity (e.g., *Wheat*, *Rice*, *Soybean*, *Tomato*).
2. **Predictive Analytics Display:**
   - Projected 90-Day Mandi Demand (in Quintals) with growth trend (UP / DOWN / STABLE).
   - Wholesale Price Corridor: Minimum and Maximum projected wholesale price (e.g., ₹24.5 - ₹34.8 /kg).
   - High-contrast bar trajectory comparing **Factual Historical Mandi Transactions** (sage bars) with **Forward AI Forecast Corridors** (amber gradient bars).
   - Farmer identifies the optimal harvest and selling window to avoid market gluts.

### Step 2.8: Listing Produce on the B2B Marketplace (`listings`)
1. **Create Produce Listing:**
   - Navigate to *Produce Listings* and click **"Create New Listing"**.
   - Select Farm Plot, Product Name (e.g., *Premium Sharbati Wheat*), Category (*Grains*), Available Quantity (*150 Quintals*), Asking Price (*₹2,850/Quintal*), Quality Grade (*Grade A*), and Organic Certified checkbox.
2. **Publish Listing:**
   - Click *Publish Listing* $\rightarrow$ instantly published to the open digital Mandi.

### Step 2.9: Receiving Purchase Orders & Dispatch (`orders`)
1. **Order Received:** When a buyer purchases the produce, a notification badge appears in the navbar, and the order appears under *Received Purchase Orders*.
2. **Order Management:**
   - The farmer views the Buyer Name, Delivery Address, Contact, Lot Volume, and Total Contract Value.
   - Step-by-step dispatch status controls:
     - Update from `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.

---

## 4. WORKFLOW 3: THE INSTITUTIONAL BUYER JOURNEY (FMCG / TRADER)

When logged in as a **Buyer** (e.g., food processing company, retail supermarket chain, grain exporter), the navigation adapts:

```
[ Marketplace Directory ] ─ [ My Purchase Orders ] ─ [ Mandi Demand Trends ]
```

### Step 3.1: Sourcing Produce in the B2B Marketplace (`marketplace`)
1. **Catalog Search & Filtering:**
   - Filter by Commodity Category (*All, Grains, Vegetables, Pulses, Fruits, Oilseeds*).
   - Filter by keyword (e.g., *Basmati*, *Tomato*) or toggle *Organic Certified Only*.
2. **Product Lot Inspection:**
   - Buyer views farmer name, location, available inventory, asking price, quality grade, and harvest date.

### Step 3.2: Direct Purchase Order Placement (`marketplace`)
1. **Initiate Purchase:**
   - Click **"Order Produce"** on any active listing.
2. **Contract Modal:**
   - Enter desired Purchase Quantity (validates against maximum available stock).
   - System automatically calculates the Total Order Value in real time.
   - Enter Delivery / Warehouse Destination Address.
   - Optional Notes: Quality testing specifications or packaging instructions.
3. **Execute Contract:**
   - Click **"Confirm & Place Order"**.
   - A legally binding digital contract is generated with a unique Order ID.
   - The available quantity on the farmer's listing automatically decrements.

### Step 3.3: Real-Time Order & Logistics Tracking (`buyer-orders`)
1. **Interactive Milestone Timeline:**
   - Buyer tracks the 5-stage logistics progress bar:
     `1. Order Placed` $\rightarrow$ `2. Confirmed` $\rightarrow$ `3. Packaging & QA` $\rightarrow$ `4. Dispatched` $\rightarrow$ `5. Delivered`.
2. **Order Details:**
   - Displays seller name, contract value, itemized pricing, dispatch status, and delivery confirmation.

### Step 3.4: Sourcing Strategy via Demand Trends (`market`)
1. **Forward Procurement Planning:**
   - Buyer reviews forward wholesale corridors to time their bulk purchase contracts before commodity prices escalate.

---

## 5. WORKFLOW 4: THE FPO COOPERATIVE LEADER JOURNEY

When logged in as an **FPO Leader** (Farmer Producer Organization):

```
[ FPO Management & Analytics ] ─ [ Marketplace Directory ] ─ [ Mandi Demand Trends ]
```

### Step 5.1: Cooperative Overview & Capacity (`fpo`)
1. **Organization Profile:**
   - Displays Cooperative Name (e.g., *Malwa Agro Producer Co. Ltd.*), Registration Number, and District Hub.
2. **Aggregate Metrics:**
   - *Member Farmers:* Number of active smallholders enrolled in the cooperative.
   - *Pooled Acreage:* Cumulative acreage under cooperative management.
   - *Pooled Harvest Lots:* Number of bulk lots assembled for commercial sale.
   - *Total Aggregated Sales Value:* Cumulative revenue generated for member farmers.

### Step 5.2: Pooled Inventory Management (`fpo`)
1. **Bulk Supply Assembly:**
   - View aggregated produce volume pooled from dozens of smallholders (e.g., *1,250 Quintals of Soybean across 42 smallholders*).
   - Benchmark average pricing per unit.
2. **Member Farmers Directory:**
   - Review authorized growers, verification status, contact details, and join date.

### Step 5.3: Commercial Bidding & Institutional Sales (`marketplace`)
1. **Bulk Contracting:**
   - The FPO can list metric-ton lots directly on the marketplace or procure agricultural inputs in bulk for its members at discounted rates.

---

## 6. WORKFLOW 5: THE PLATFORM ADMINISTRATOR JOURNEY

When logged in as an **Admin**:

```
[ Platform Telemetry & Audit ] ─ [ Farms Directory ] ─ [ Listing Moderation ]
```

### Step 6.1: Operational Telemetry & System Health (`admin`)
1. **Platform Metrics:**
   - *Total Registered Users:* Across all 4 roles.
   - *Farms & Acreage:* Geocoded land records across states.
   - *Marketplace Turnover:* Total Gross Merchandise Value (GMV ₹) processed.
   - *AI Model Invocations:* Cumulative count of crop recommendations computed, disease vision scans processed, and RAG queries answered.

### Step 6.2: User Governance & Role RBAC (`admin`)
1. **User Accounts Table:**
   - Displays all users with name, email, current role, and account status (*ACTIVE* / *SUSPENDED*).
2. **Role Modification & Account Suspension:**
   - Modify any user's role on the fly via dropdown.
   - Click **"Suspend"** or **"Activate"** to toggle access credentials.

### Step 6.3: Immutable Security & Transaction Audit Trail (`admin`)
1. **Tamper-Evident Event Ledger:**
   - Inspect every critical platform event:
     - `AUTH_LOGIN` / `AUTH_REGISTER`
     - `CROP_RECOMMENDATION_GENERATED`
     - `DISEASE_VISION_SCAN`
     - `ORDER_CREATED` / `ORDER_STATUS_UPDATED`
     - `USER_ROLE_CHANGED`
   - Every event records Actor Email, Action, Resource Type, Resource ID, Details, and an exact UTC Timestamp.

---

## 7. WORKFLOW 6: CROSS-MODULE SIGNAL CASCADES (WHAT HAPPENS BEHIND THE SCENES)

Here is how actions in one module automatically trigger updates across the rest of the system:

```
[ Farmer creates listing in Module 8 ]
         │
         ├──► Listing instantly appears in Buyer Marketplace (Module 8)
         ├──► Audit Log event logged: LISTING_CREATED (Module 13)
         └──► Aggregated into FPO Pooled Supply (Module 12)

[ Buyer places order in Module 8/9 ]
         │
         ├──► Digital contract generated (Order #ID)
         ├──► Listing inventory automatically deducted
         ├──► Real-time notification sent to Farmer (Module 11)
         ├──► Order milestone timeline initialized (Module 9)
         ├──► Audit Log event logged: ORDER_CREATED (Module 13)
         └──► GMV turnover updated on Admin Dashboard (Module 13)

[ Farmer updates order to 'SHIPPED' in Module 9 ]
         │
         ├──► Buyer logistics progress bar advances to Step 4 (Module 9)
         ├──► Notification sent to Buyer (Module 11)
         └──► Audit Log event logged: ORDER_STATUS_UPDATED (Module 13)
```

---

## 8. SUMMARY CHEAT SHEET FOR EXPLAINING THE PLATFORM

When explaining Agri-Wise to stakeholders, investors, or evaluators, summarize it in three simple sentences:

1. **"Before the season:** Agri-Wise uses soil chemistry and weather data to scientifically tell the farmer what crop will produce the highest yield and when to plant it."
2. **"During the season:** Agri-Wise monitors weather risks, diagnoses leaf diseases from photos in 2 seconds with organic remedies, and tracks cultivation costs per acre."
3. **"At harvest time:** Agri-Wise forecasts 90-day mandi price peaks so farmers avoid selling during gluts, and connects them directly with institutional buyers on a digital contract marketplace without middleman commissions."
