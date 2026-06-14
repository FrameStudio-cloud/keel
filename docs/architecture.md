# Keel + Mini-Catalogue Architecture

## 1. Project Overview

Two React apps share one Supabase project (`yphyvahluvxddkwhevwl`):

| App | Stack | Purpose |
|---|---|---|
| **Keel** (`keel/`) | React 19, Tailwind v4, motion, react-router | Dashboard for shop owners — inventory, sales, settings, website management |
| **Mini-Catalogue** (`mini-catalogue-electricals/`) | React 19, Tailwind v4, motion, react-router | Public-facing site with product listings, chat widget, admin panel |

---

## 2. Database Tables

```mermaid
erDiagram
    shops ||--o{ store_settings : has
    shops ||--o{ products : has
    shops ||--o{ catalogue : has
    shops ||--o{ banners : has
    shops ||--o{ sales : has
    shops ||--o{ payments : has
    shops ||--o{ posts : has
    shops ||--o{ stock_movements : has
    shops ||--o{ page_views : has
    shops ||--o{ chat_config : has
    shops ||--o{ chat_faqs : has
    shops ||--o{ chat_messages : has
    shops ||--o{ users : has

    shops {
        string id PK
        string name
        string slug
        string business_category
        datetime created_at
    }

    store_settings {
        string shop_id FK
        string store_name
        string store_phone
        string store_address
        string currency_symbol
        int low_stock_threshold
        string default_payment
        string receipt_footer
        string theme
        string website_url
        string whatsapp
        string business_hours
    }

    products {
        string id PK
        string shop_id FK
        string name
        string category
        float price
        int stock
        string variants
    }

    catalogue {
        string id PK
        string shop_id FK
        string name
        string type
        string category
        float price
        string image
        bool available
        bool featured
        string variants
        string specs
        string includes
        string price_label
    }

    banners {
        string id PK
        string shop_id FK
        string type
        string title
        string subtitle
        string message
        string image_url
        bool active
        int sort_order
    }

    sales {
        string id PK
        string shop_id FK
        string product_id
        string product_name
        float amount
        int quantity
        string method
        datetime created_at
    }

    payments {
        string id PK
        string shop_id FK
        string invoice_id
        string provider
        float amount
        string status
    }

    posts {
        string id PK
        string shop_id FK
        string platform
        string caption
        string status
        datetime scheduled_at
    }

    stock_movements {
        string id PK
        string shop_id FK
        string product_id
        string product_name
        int change
        string reason
    }

    page_views {
        string id PK
        string shop_id FK
        string page
        string product_name
        string referrer
        string user_agent
    }

    users {
        string id PK
        string auth_user_id FK
        string shop_id FK
        string name
        string email
    }

    chat_config {
        string shop_id PK FK
        bool enabled
        string welcome_message
        string widget_color
        string position
        string whatsapp_number
    }

    chat_faqs {
        string id PK
        string shop_id FK
        string question
        string answer
        int sort_order
    }

    chat_messages {
        int id PK
        string shop_id FK
        string question
        string answer
        string customer_name
        string status
        string feedback
        datetime created_at
    }
```

---

## 3. Keel Dashboard — App Shell & Auth

```mermaid
flowchart LR
    subgraph Entry["Entry"]
        MAIN["main.jsx"] --> APP["<b>App.jsx</b><br/>AuthProvider → SettingsProvider<br/>→ BrowserRouter → Routes"]
    end

    subgraph Providers["Context Providers"]
        AUTH["<b>AuthContext</b><br/>user, session, loading<br/>login(), logout()<br/>supabase.auth.signInWithPassword()"]
        SETTINGS["<b>SettingsProvider</b><br/>(fetched once on mount)<br/>getShopId() → shops.business_category<br/>→ store_settings.*<br/>Side effects:<br/>• setCurrency() → format.js<br/>• setPaymentConfig()<br/>• toggle .dark class"]
    end

    subgraph Lib["Library Singletons"]
        SID["shop.js<br/><b>getShopId()</b><br/>users → shop_id<br/>(cached after first call)<br/><b>withShop()</b><br/>appends shop_id to payload"]
        FMT["format.js<br/><b>formatPrice()</b><br/><b>setCurrency()</b><br/><b>getCurrency()</b>"]
        PCFG["paymentConfig.js<br/><b>getPaymentMethods()</b><br/><b>setPaymentConfig()</b><br/><b>getDefaultPayment()</b>"]
        CONST["constants.js<br/>CRITICAL_STOCK_THRESHOLD = 2"]
    end

    APP --> AUTH
    APP --> SETTINGS
    SETTINGS --> SID
    SETTINGS --> FMT
    SETTINGS --> PCFG

    SID -->|"auth_user_id"| DB_USERS["users table"]
```

---

## 4. Keel Dashboard — Routes & Pages

```mermaid
flowchart LR
    subgraph ProtectedRoutes["Protected Routes (React.lazy)"]
        direction TB
        ROOT["<b>/ → Overview.jsx</b><br/>eager import<br/>StatCards, WeeklySalesChart,<br/>TopProducts, SlowMovingStock,<br/>PageViewsChart (mock), TourGuide"]
        INV["<b>/inventory → Inventory.jsx</b><br/>Product CRUD, search,<br/>publish/unpublish,<br/>stock adjust modal"]
        SALES["<b>/sales → Sales.jsx</b><br/>Sales list, search,<br/>log sale, receipt modal"]
        SOC["<b>/social → Social.jsx</b><br/>Post scheduler,<br/>Instagram stats"]
        BOTS["<b>/bots → Bots.jsx</b><br/>WA + Telegram cards<br/>(static)"]
        WEB["<b>/website → Website.jsx</b><br/>Tabbed container"]
        SET["<b>/settings → Settings.jsx</b><br/>All store settings,<br/>theme, export"]
        PROF["<b>/profile → Profile.jsx</b><br/>Info display, logout"]
        STOCK["<b>/stock-history → StockHistory.jsx</b><br/>Stock movement log"]
    end

    subgraph PublicRoutes["Public Routes"]
        LOGIN["<b>/login → Login.jsx</b><br/>Login + signup flow<br/>Signup creates: shop + settings + users row"]
        SETUP["<b>/setup → SetupWizard.jsx</b><br/>Onboarding: category →<br/>store → currency →<br/>payment → threshold"]
    end

    subgraph Layout["Layout (PageLayout)"]
        SB["Sidebar<br/>Nav links, low stock badge,<br/>store name initial"]
        TB["Topbar<br/>Search, bell notifications,<br/>profile dropdown, logout"]
    end

    Layout --> ProtectedRoutes
    ProtectedRoutes -->|"every query"| SID["shop.js<br/>getShopId()"]
    PublicRoutes -.->|"no layout"| LOGIN
    PublicRoutes -.->|"no layout"| SETUP
```

---

## 5. Keel Dashboard — Website Tab Components

```mermaid
flowchart LR
    subgraph Tabs["Website Tab Components"]
        LIST["<b>ListingsTab</b><br/>Catalogue CRUD<br/>Image upload (storage)<br/>→ catalogue table"]
        BAN["<b>BannersTab</b><br/>Hero/sale/info/alert CRUD<br/>Reorder (sort_order)<br/>→ banners table"]
        BUS["<b>BusinessTab</b><br/>Business hours editor<br/>7-day grid, toggle<br/>→ store_settings"]
        GAL["<b>GalleryTab</b><br/>Image grid from catalogue<br/>→ catalogue (image not null)"]
        CHAT_TAB["<b>ChatWidgetTab</b><br/>Config toggle + styling<br/>FAQs CRUD + reorder<br/>Unanswered messages inbox<br/>Embed code snippet<br/>→ chat_config, chat_faqs, chat_messages"]
    end

    subgraph ChatTables["Chat Tables (Supabase)"]
        CFG["chat_config<br/>enabled, welcome_message,<br/>widget_color, position,<br/>whatsapp_number"]
        FAQS["chat_faqs<br/>question, answer,<br/>sort_order"]
        MSGS["chat_messages<br/>question, answer,<br/>status, feedback<br/>→ viewed in ChatWidgetTab"]
    end

    INFO["store_settings<br/>business_hours, whatsapp"]

    LIST --> DB_CAT["catalogue"]
    BAN --> DB_BAN["banners"]
    BUS --> INFO
    GAL --> DB_CAT
    CHAT_TAB --> CFG
    CHAT_TAB --> FAQS
    CHAT_TAB --> MSGS
    CHAT_TAB --> INFO
```

---

## 6. Keel Dashboard — Signup & Setup Flow

```mermaid
flowchart TD
    START(["User visits /login"]) --> FORM["Signup form<br/>email + password + store name"]
    FORM --> AUTH["supabase.auth.signUp()"]
    AUTH -->|"Auth user created"| SHOP["INSERT shops<br/>name, slug (name + random 4 chars),<br/>business_category: 'general'"]
    SHOP --> SETT["INSERT store_settings<br/>shop_id, store_name, theme: 'light'"]
    SETT --> USER["INSERT users<br/>auth_user_id, shop_id, name, email"]
    USER --> REDIR["Redirect to /setup"]

    subgraph SetupWizard["Setup Wizard (/setup) 5 steps"]
        S1["1. Business Category<br/>clothing / electronics /<br/>electricals / general"]
        S2["2. Store Name<br/>→ store_settings.store_name"]
        S3["3. Phone & Address<br/>→ store_settings.store_phone<br/>→ store_settings.store_address"]
        S4["4. Currency<br/>→ setCurrency()<br/>→ store_settings.currency_symbol"]
        S5["5. Payment & Threshold<br/>→ setPaymentConfig()<br/>→ store_settings.low_stock_threshold"]
    end

    REDIR --> S1 --> S2 --> S3 --> S4 --> S5
    S5 --> DONE["Redirect to /<br/>Dashboard ready"]
    DONE --> APP["SettingsProvider re-mounts<br/>Fetches fresh settings"]
```

---

## 7. Mini-Catalogue — Public Site Components

```mermaid
flowchart LR
    subgraph SupaDB["Supabase Tables"]
        S_BAN["banners"]
        S_CAT["catalogue"]
        S_SET["store_settings"]
        S_PV["page_views"]
        S_CFG["chat_config"]
        S_FAQ["chat_faqs"]
        S_MSG["chat_messages"]
    end

    subgraph Public["Public Site (/) All stacked in div"]
        NAV["<b>Navbar</b><br/>Banner rotation (5s cycle)<br/>Logo, nav links, WhatsApp CTA<br/>→ banners table"]
        HERO["<b>Hero</b><br/>Hero banner, headline, CTAs<br/>→ banners (type=hero, limit=1)"]
        TRUST["<b>TrustBar</b><br/>Static marquee (ERC, Hikvision, etc.)"]
        CAT["<b>Catalogue</b><br/>Grid, search, filter, modal<br/>→ catalogue (available=true)<br/>fallback: config/catalogue.js"]
        GAL["<b>Gallery</b><br/>Image grid + lightbox<br/>→ catalogue (image not null)<br/>fallback: config/gallery.js"]
        SOC["<b>SocialFeed</b><br/>Instagram + TikTok cards<br/>(static config)"]
        LOC["<b>LocationMap</b><br/>Address, hours, embed<br/>(static config)"]
        FOOT["<b>Footer</b><br/>Socials, links, hours<br/>→ store_settings (whatsapp, hours)"]
        WHA["<b>WhatsAppFloat</b><br/>Floating WA button<br/>(scroll>300px)<br/>(static config.whatsapp)"]
        CHAT["<b>ChatWidget</b><br/>FAQ + product search bot<br/>→ see ChatWidget section below"]
        BTT["<b>BackToTop</b><br/>Scroll to top (scroll>400px)"]
    end

    subgraph Tracking["Tracking"]
        PV["usePageTracking()<br/>→ page_views table"]
    end

    S_BAN --> NAV
    S_BAN --> HERO
    S_CAT --> CAT
    S_CAT --> GAL
    S_SET --> FOOT
    S_CFG --> CHAT
    S_FAQ --> CHAT
    S_CAT --> CHAT
    S_SET --> CHAT
    S_MSG --> CHAT
    PV --> S_PV
    CAT -->|"on modal"| PV
```

---

## 8. ChatWidget — Intent Pipeline (Rule-Based, No AI)

```mermaid
flowchart TD
    Q["User types a question"] --> NORM["normalize()<br/>→ lowercase, strip non-alpha,<br/>→ extractKeywords() filter stop words"]

    NORM --> LOC{"1. Location?<br/>where / located / address<br/>/ direction / find / near"}

    LOC -->|YES + store_address exists| LOC_R["Reply: 'You can find us at {address}'"]
    LOC -->|NO| CONT{"2. Contact?<br/>contact / call / phone<br/>/ whatsapp / talk"}

    CONT -->|YES + whatsapp_number| CONT_R1["Reply: 'WhatsApp at +{number}'"]
    CONT -->|YES + store_phone| CONT_R2["Reply: 'Call us at {phone}'"]
    CONT -->|NO| HOURS{"3. Hours?<br/>open / close / hour / time<br/>/ when / today"}

    HOURS -->|YES| HOURS_R["Reply: 'Mon-Fri 8am-6pm, Sat 9am-4pm'"]
    HOURS -->|NO| CAT_M{"4. Category?<br/>getCategoryMatches()<br/>→ Levenshtein on category name"}

    CAT_M -->|YES + 'show/view' + items| CAT_R["Reply: formatted list of items<br/>+ 3 product cards"]
    CAT_M -->|NO or weak match| PROD{"5. Product search?<br/>findBestProducts()<br/>→ scoreProduct() algorithm:"}

    subgraph Score["Product Scoring (top 5)"]
        direction TB
        S1["• Exact name match: +100"]
        S2["• Name contains query: +50"]
        S3["• Category contains query: +30"]
        S4["• Description contains query: +20"]
        S5["• Per keyword: name +15, cat +10, desc +5"]
        S6["• Levenshtein distance ≤ 2: +8 - (dist * 3)"]
    end

    PROD -->|"score > 0"| PROD_1{"Single match?"}

    PROD_1 -->|YES| PROD_1R["Reply: 'Here's {name}'<br/>+ rich product card<br/>→ setContext(product_detail)"]
    PROD_1 -->|"NO (multi)"| PROD_MR["Reply: numbered list<br/>+ up to 5 compact product cards<br/>→ setContext(product_ids)"]

    PROD -->|"score = 0"| FAQ{"6. FAQ match?<br/>normalized question includes query<br/>OR query includes normalized question<br/>OR keywords intersect"}

    FAQ -->|YES| FAQ_R["Reply: faq.answer"]
    FAQ -->|NO| FALLBACK["7. Fallback<br/>• INSERT chat_messages (unanswered)<br/>• Show popular items (badge items)<br/>• 'Contact us on WhatsApp'"]

    FALLBACK --> FB_POP{"Any badge items?"}

    FB_POP -->|YES| FB_R["Reply: 'Here are popular items'<br/>+ up to 3 product cards"]
    FB_POP -->|NO| FB_FINAL["Reply: 'Not sure, browse or WhatsApp'"]
```

---

## 9. Mini-Catalogue — Admin Panel

```mermaid
flowchart LR
    subgraph Admin["Admin Routes"]
        ADMIN_LOGIN["<b>/admin → AdminLogin.jsx</b><br/>Email + password<br/>supabase.auth.signInWithPassword()"]
        PROTECT["<b>ProtectedRoute</b><br/>Checks supabase.auth.getSession()<br/>Redirects to /admin if none"]
        DASH["<b>/admin/dashboard → AdminDashboard.jsx</b><br/>Stats bar, filter buttons,<br/>catalogue table, add/edit modal,<br/>availability toggle, delete"]
    end

    subgraph Actions["Dashboard Actions"]
        A_ADD["Add Item<br/>type, category, name,<br/>description, image URL,<br/>price, badge, status,<br/>specs/includes"]
        A_EDIT["Edit Item<br/>pre-filled form"]
        A_TOGGLE["Toggle Status<br/>Available ↔ Hidden"]
        A_DELETE["Delete<br/>with confirm"]
    end

    ADMIN_LOGIN -->|"success"| PROTECT --> DASH
    DASH --> A_ADD
    DASH --> A_EDIT
    DASH --> A_TOGGLE
    DASH --> A_DELETE
    A_ADD -->|"INSERT"| DB_CAT["catalogue"]
    A_EDIT -->|"UPDATE"| DB_CAT
    A_TOGGLE -->|"UPDATE available"| DB_CAT
    A_DELETE -->|"DELETE"| DB_CAT
```

---

## 10. Data Flow Summary

```mermaid
flowchart LR
    subgraph KeelSide["Keel Dashboard"]
        SP["<b>SettingsProvider</b><br/>(mount once)"]
        US["<b>useSettings()</b><br/>(context hook)"]
        SH["<b>getShopId()</b><br/>(singleton, cached)"]
        FM["<b>format.js</b><br/>formatPrice()"]
        PC["<b>paymentConfig.js</b><br/>getPaymentMethods()"]
    end

    subgraph MiniSide["Mini-Catalogue"]
        MSH["<b>getShopId()</b><br/>(singleton by slug)"]
        MC["<b>ChatWidget</b><br/>4 parallel queries on mount"]
    end

    subgraph DB["Supabase"]
        SETT["store_settings"]
        SHO["shops"]
    end

    SP -->|"getShopId()"| SH
    SP -->|"stores.*"| SETT
    SP -->|"business_category"| SHO
    SP -->|"side effect"| FM
    SP -->|"side effect"| PC
    SP -->|"side effect"| DARK["⇄ .dark class on &lt;html&gt;"]

    US -->|"lowStockThreshold"| OV["Overview.jsx"]
    US -->|"lowStockThreshold"| INV["Inventory.jsx"]
    US -->|"store_name, address, phone"| REC["ReceiptModal.jsx"]
    US -->|"lowStockThreshold"| SAM["StockAdjustModal.jsx"]

    MSH -->|"VITE_SHOP_SLUG → slug"| SHO
    MC -->|"chat_config"| CFG["chat_config"]
    MC -->|"faqs"| FAQS["chat_faqs"]
    MC -->|"catalogue"| CAT["catalogue"]
    MC -->|"store info"| SETT
    MC -->|"unanswered"| MSG["chat_messages"]
```

---

## 11. Component Dependencies & Imports

```mermaid
graph TB
    APP["App.jsx"] --> AUTH["AuthContext"]
    APP --> SETTINGS_PROV["SettingsProvider"]
    APP --> ROUTER["BrowserRouter"]

    SETTINGS_PROV --> SID["shop.js (getShopId)"]
    SETTINGS_PROV --> FMT["format.js (setCurrency)"]
    SETTINGS_PROV --> PCFG["paymentConfig.js (setPaymentConfig)"]

    INV["Inventory.jsx"] --> APM["AddProductModal"]
    INV --> EPM["EditProductModal"]
    INV --> SAM["StockAdjustModal"]
    INV --> BADGE["Badge"]
    INV --> SETTINGS_CTX["useSettings()"]

    SALES["Sales.jsx"] --> LSM["LogSaleModal"]
    SALES --> RM["ReceiptModal"]
    SALES --> BADGE
    RM --> SETTINGS_CTX
    RM --> FMT
    LSM --> PCFG

    WEB["Website.jsx"] --> LIST["ListingsTab"]
    WEB --> BAN["BannersTab"]
    WEB --> BUS["BusinessTab"]
    WEB --> GAL["GalleryTab"]
    WEB --> CHAT["ChatWidgetTab"]
    LIST --> IMG_UPLD["ImageUploader"]
    LIST --> FMT
    APM --> IMG_UPLD
    EPM --> IMG_UPLD

    OVER["Overview.jsx"] --> SC["StatCard"]
    OVER --> WSC["WeeklySalesChart"]
    OVER --> TP["TopProducts"]
    OVER --> SMS["SlowMovingStock"]
    OVER --> PWC["PageViewsChart"]
    OVER --> MVP["MostViewedPages"]
    OVER --> TS["TrafficSources"]
    OVER --> TG["TourGuide"]
    OVER --> SETTINGS_CTX

    SID["shop.js"] -->|"auth user → shop_id"| USERS["users table"]
```

---

## 12. Full File Tree

```
keel/
├── src/
│   ├── main.jsx                          # Entry point
│   ├── App.jsx                           # Providers + routing
│   ├── context/
│   │   ├── AuthContext.jsx                # user, session, login, logout
│   │   ├── SettingsProvider.jsx           # Fetch + apply settings
│   │   └── settingsContext.js             # Context definition
│   ├── hooks/
│   │   ├── useSettings.js                 # useContext(SettingsContext)
│   │   └── useDebounce.js                 # Debounce hook
│   ├── lib/
│   │   ├── supabase.js                    # Supabase client
│   │   ├── shop.js                        # getShopId(), withShop()
│   │   ├── format.js                      # formatPrice(), setCurrency()
│   │   ├── constants.js                   # CRITICAL_STOCK_THRESHOLD
│   │   ├── paymentConfig.js               # getPaymentMethods(), setPaymentConfig()
│   │   └── storage.js                     # Image upload/delete
│   ├── payment/
│   │   ├── index.js                       # Re-exports
│   │   ├── IntaSendCheckout.jsx           # M-Pesa checkout
│   │   └── usePayment.js                  # Sale + payment + stock tracking
│   ├── pages/
│   │   ├── Overview.jsx                   # Dashboard KPIs
│   │   ├── Inventory.jsx                  # Products CRUD
│   │   ├── Sales.jsx                      # Sales log
│   │   ├── Social.jsx                     # Post scheduler
│   │   ├── Bots.jsx                       # Bot cards
│   │   ├── Website.jsx                    # Tabbed website mgmt
│   │   ├── Settings.jsx                   # All settings
│   │   ├── Profile.jsx                    # Info display
│   │   ├── Login.jsx                      # Auth + signup
│   │   ├── SetupWizard.jsx                # Onboarding
│   │   └── StockHistory.jsx               # Stock log
│   └── components/
│       ├── layout/
│       │   ├── PageLayout.jsx             # Sidebar + Topbar + content
│       │   ├── Sidebar.jsx                # Navigation
│       │   └── Topbar.jsx                 # Search, notifications, profile
│       ├── website/
│       │   ├── ListingsTab.jsx            # Catalogue CRUD
│       │   ├── BannersTab.jsx             # Banner CRUD
│       │   ├── BusinessTab.jsx            # Hours editor
│       │   ├── GalleryTab.jsx             # Image gallery
│       │   └── ChatWidgetTab.jsx          # Widget config + FAQs + inbox
│       ├── Badge.jsx                      # Stock badge
│       ├── StatCard.jsx                   # KPI card
│       ├── Skeleton.jsx                   # Loading skeleton
│       ├── TopProducts.jsx                # Bar chart
│       ├── WeeklySalesChart.jsx           # Recharts chart
│       ├── SlowMovingStock.jsx            # Slow stock table
│       ├── MostViewedPages.jsx            # Mock analytics
│       ├── PageViewsChart.jsx             # Mock chart
│       ├── TrafficSources.jsx             # Mock sources
│       ├── TourGuide.jsx                  # Onboarding tour
│       ├── AddProductModal.jsx            # Add product form
│       ├── EditProductModal.jsx           # Edit product form
│       ├── StockAdjustModal.jsx           # Adjust stock
│       ├── LogSaleModal.jsx               # Log sale form
│       ├── ReceiptModal.jsx               # Receipt view
│       ├── PlanPostModal.jsx              # Schedule post
│       └── ImageUploader.jsx              # Drag & drop upload
└── docs/
    └── architecture.md                    # This file

mini-catalogue-electricals/
├── src/
│   ├── App.jsx                            # Routes + layout
│   ├── lib/
│   │   ├── supabase.js                    # Supabase client
│   │   └── shop.js                        # getShopId() by slug
│   ├── hooks/
│   │   └── usePageTracking.js             # page_views tracking
│   ├── config/
│   │   ├── shop.js                        # Static shop config
│   │   ├── catalogue.js                   # Fallback products
│   │   └── gallery.js                     # Fallback images
│   ├── admin/
│   │   ├── AdminLogin.jsx                 # Auth form
│   │   ├── ProtectedRoute.jsx             # Session guard
│   │   └── AdminDashboard.jsx             # Catalogue CRUD
│   └── components/
│       ├── Navbar.jsx                     # Header + banners
│       ├── Hero.jsx                       # Hero section
│       ├── TrustBar.jsx                   # Trust badges
│       ├── Catalogue.jsx                  # Product grid
│       ├── CatalogueCard.jsx              # Product card
│       ├── CatalogueModal.jsx             # Product detail
│       ├── SearchBar.jsx                  # Search input
│       ├── Gallery.jsx                    # Image grid
│       ├── SocialFeed.jsx                 # Social cards
│       ├── LocationMap.jsx                # Map + address
│       ├── Footer.jsx                     # Footer
│       ├── WhatsAppFloat.jsx              # Floating WA
│       ├── ChatWidget.jsx                 # Rule-based chat
│       ├── AnnouncementBar.jsx            # Standalone (unused)
│       └── BackToTop.jsx                  # Scroll to top
└── public/
    └── ...
```
