# AGENTS.md — CobblERP Footwear Manufacturing ERP

Welcome to **CobblERP**, an enterprise Resource Planning (ERP) and Manufacturing Execution System (MES) purpose-built for **Footwear Manufacturing**.

This document outlines the domain model, architecture, design system requirements, toolchains, and strict rules that all AI and human contributors must follow when developing, refactoring, or extending this codebase.

---

## 👞 1. Domain Context: Footwear Manufacturing ERP

CobblERP manages the end-to-end lifecycle of footwear production—from raw leather hide procurement to finished boxed shoe dispatch.

### Core Footwear Manufacturing Pipeline:
1. **Product / Style Specifications & BOM**:
   - Shoe styles, construction methods (**Goodyear Welted**, **Blake Stitched**, **Cemented / Cupsole**, **Stitchdown**, **Norwegian / Storm Welt**).
   - Last profiles, size runs (EU 38–48, UK 5–13, US 6–14 with width fittings D, E, EE).
   - Multi-level Bill of Materials (BOM): Upper leather (calf, suede, cordovan, pull-up), lining leather, toe puffs, heel stiffeners, insoles, welting strips, cork filler, midsoles, outsoles (Vibram lugs, leather, rubber commando), eyelets, laces, threads, and eco-adhesives.
2. **Clicking & Cutting (Stage 1)**:
   - Leather hide inspection, grade sorting, direction of stretch, cutting dies, automated laser/waterjet cutting, and hide utilization yield optimization.
3. **Closing & Stitching (Stage 2)**:
   - Skiving edges, edge inking/burnishing, upper stitching, lining attachment, counter reinforcement, and eyelet punching.
4. **Lasting & Bottoming (Stage 3)**:
   - Insole tacking, toe/side/waist lasting, heat setting, bottom filling (cork layer + steel shank), welt sewing (for Goodyear welted footwear).
5. **Assembly & Soling (Stage 4)**:
   - Sole cementing/stitching, heel attaching, channel closing, edge trimming, sole bottom staining, and burnishing.
6. **Finishing, QC Inspection & Packing (Stage 5)**:
   - De-lasting, sock-lining insertion, cream polishing, burnishing, final AQL 1.5/2.5 quality control inspection, barcode/QR tagging, and shoe box packaging.
7. **Inventory & Warehouse Management**:
   - Raw material stock (square footage of leather hides, rolls of lining, sole pairs, hardware counts, adhesives in liters).
   - Work-In-Progress (WIP) tracking across production floor lines and batch lots.
   - Finished goods dispatch and distributor order fulfillment.

---

## 🎨 2. Design System: IBM Carbon Design System

The official UI design system across the entire CobblERP platform is the **IBM Carbon Design System**.

### ⚠️ MANDATORY DESIGN SYSTEM & MOBILE RULES

> [!IMPORTANT]
> 1. **Carbon Does Not Support Expo**: The IBM Carbon Design System does NOT provide native support for Expo managed workflows and will only work with **standard (bare) React Native**.
> 2. **Mobile Implementation (`apps/mobile`)**: The mobile app is strictly implemented using **standard React Native** (`react-native` CLI / bare React Native 0.76+). Do **NOT** convert the mobile app to a managed Expo project.
> 3. **Expo Updates Exception**: The only tools from Expo allowed in `apps/mobile` are packages strictly required for pushing over-the-air (OTA) updates (`expo-updates` and `expo-modules-core`). No other Expo managed libraries should be introduced.
> 4. **Web Implementation (`apps/web`)**: Next.js 15 uses official `@carbon/react`, `@carbon/icons-react`, and Carbon SCSS styling (`@use '@carbon/react';`).
> 5. **Mobile Styling**: `apps/mobile` implements the Carbon Design System tokens directly via [`src/theme/carbon.ts`](file:///Users/shoaibkn/Documents/lumin8/cobblERP/apps/mobile/src/theme/carbon.ts) (Gray 100/90 dark shop-floor palette, `#0f62fe` Carbon blue interactive tokens, Carbon typography scale, spacing units, and tile/status styling).
> 6. **Carbon MCP Integration**: Always query `carbon-mcp` tools (`code_search`, `docs_search`, `code_audit`, `get_charts`) before adding or modifying Carbon components, icons, or design patterns.

---

## 🏛️ 3. Monorepo Architecture

CobblERP is structured as a **Turborepo** monorepo managed with **pnpm**:

```
cobblERP/
├── apps/
│   ├── web/                    # Next.js 15 (App Router, React 19, Carbon Design System, SCSS)
│   ├── api/                    # NestJS 11 (Modular REST API, Drizzle ORM integration, CORS)
│   └── mobile/                 # Standard React Native 0.76+ (Carbon Design Tokens + expo-updates)
├── packages/
│   ├── db/                     # Drizzle ORM schemas, Neon Serverless client, migrations & types
│   ├── typescript-config/      # Presets: base.json, nextjs.json, nestjs.json, react-native.json
│   └── eslint-config/          # Shared ESLint configuration
├── .env.example                # Template for environment variables
├── pnpm-workspace.yaml         # Monorepo workspaces definition
└── turbo.json                  # Turborepo task pipeline
```

### Workspaces Overview:
- **`apps/web`**: Web portal for factory managers, production planners, inventory supervisors, and executive dashboards.
- **`apps/mobile`**: Mobile application for shop-floor operators, line supervisors, leather cutting inspectors, and barcode scanning stations.
- **`apps/api`**: High-throughput NestJS REST backend providing authentication, work order management, inventory operations, and production tracking.
- **`packages/db`**: Database package configured with **Drizzle ORM** connecting to **Neon Serverless PostgreSQL** via `@neondatabase/serverless` HTTP driver. Pre-compiled to `dist/` CommonJS to prevent runtime ESM directory resolution issues.

---

## 🛠️ 4. Development & Build Commands

All scripts are orchestrated through Turborepo from the repository root:

```bash
# Run all applications concurrently in development mode
pnpm dev

# Check TypeScript types across all 6 workspaces
pnpm check-types

# Build production artifacts (Next.js, NestJS, and packages/db)
pnpm build

# Generate Drizzle migration files from schemas
pnpm db:generate

# Push schema directly to Neon Postgres
pnpm db:push

# Launch Drizzle Studio web GUI
pnpm db:studio
```

---

## 📋 5. Guidelines for Future AI Agents

1. **Maintain Bare React Native**: When modifying `apps/mobile`, do not introduce managed Expo configuration (`app.config.js`, `expo-router`, etc.). Keep `AppRegistry.registerComponent` in [`index.js`](file:///Users/shoaibkn/Documents/lumin8/cobblERP/apps/mobile/index.js) and preserve the bare `metro.config.js` and `babel.config.js`.
2. **OTA Update Safety**: Use `Updates.checkForUpdateAsync()` and `Updates.fetchUpdateAsync()` from `expo-updates` with `__DEV__` guard checks so local simulator development continues unimpeded.
3. **Database Schema Centralization**: All schema changes must happen in [`packages/db/src/schema/`](file:///Users/shoaibkn/Documents/lumin8/cobblERP/packages/db/src/schema/). After modifying schema, run `pnpm --filter @repo/db build` and `pnpm db:generate`.
4. **Carbon Design Compliance**:
   - Web styles must import `@use '@carbon/react';`.
   - Never use non-Carbon styling patterns or unthemed raw CSS where Carbon components/tokens exist.
   - Use `carbon-mcp` to verify exact icon and component exports before writing imports.
5. **Environment Configuration**: Always keep `.env.example` in sync when introducing new configuration variables. Never commit `.env` or production credentials.
