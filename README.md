# CobblERP — Footwear Manufacturing ERP & MES

Enterprise Resource Planning (ERP) and Manufacturing Execution System (MES) designed specifically for **Footwear Manufacturing**, powered by **Turborepo**, **IBM Carbon Design System**, **Next.js 15 (Web)**, **Standard React Native (Mobile)**, **NestJS (API)**, and **Drizzle ORM** connected to **Neon Serverless PostgreSQL**.

---

## 🏗️ Architecture Overview

```
cobblERP/
├── apps/
│   ├── web/                     # Next.js 15 + IBM Carbon Design System (@carbon/react, SCSS)
│   ├── api/                     # NestJS 11 REST API with Drizzle ORM service & CORS
│   └── mobile/                  # Standard React Native 0.76+ (Carbon Tokens + expo-updates)
├── packages/
│   ├── db/                      # Drizzle ORM footwear schemas, Neon HTTP client & migrations
│   ├── typescript-config/       # Shared tsconfig presets (nextjs, nestjs, react-native, base)
│   └── eslint-config/           # Shared ESLint presets
├── AGENTS.md                    # Core specifications, domain rules & agent directives
├── .env.example                 # Environment variables template
├── pnpm-workspace.yaml          # Monorepo workspaces definition
└── turbo.json                   # Turborepo task pipeline configuration
```

---

## 🎨 Design System: IBM Carbon

- **Web (`apps/web`)**: Implements official `@carbon/react` and `@carbon/icons-react` with `@use '@carbon/react'` SCSS baseline, supporting responsive Carbon Grid, DataTables, UI Shell, and Gray 100 industrial theme.
- **Mobile (`apps/mobile`)**: Built with **standard React Native** using direct IBM Carbon Design System tokens (`src/theme/carbon.ts`) based on Carbon color palettes, Plex typography scales, status tokens, and shop-floor tiles.
- **Expo Tooling Policy**: Carbon Design System does not support Expo managed workflows. The mobile app runs on bare React Native, using only `expo-updates` for pushing OTA bundle updates to factory scanners and tablets.

See [AGENTS.md](file:///Users/shoaibkn/Documents/lumin8/cobblERP/AGENTS.md) for detailed guidelines.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `>= 18` (v20+ or v24 recommended)
- **pnpm**: `>= 9` (`npm install -g pnpm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Database
Copy `.env.example` to `.env` and set your Neon connection string:
```bash
cp .env.example .env
```

---

## 🚀 Development & Build

```bash
# Start all apps concurrently (Web, API, Mobile)
pnpm dev

# Check TypeScript types across all workspaces
pnpm check-types

# Build all applications
pnpm build

# Generate Drizzle migration files
pnpm db:generate

# Push schema directly to Neon DB
pnpm db:push

# Open Drizzle Studio web GUI
pnpm db:studio
```

---

## 👞 Footwear Manufacturing Domain Modules

1. **Shoe Styles & BOM**: Specifications for Goodyear Welted, Blake, Cemented constructions, lasts, and multi-component Bill of Materials.
2. **Clicking & Cutting**: Leather hide grading, pattern nesting, and die cutting.
3. **Closing & Stitching**: Skiving, edge inking, lining seams, and upper assembly.
4. **Lasting & Bottoming**: Toe lasting, welt stitching, and bottom cork filling.
5. **Soling & Assembly**: Vibram lug, leather sole, or cupsole attaching and edge burnishing.
6. **Finishing & QC**: Final AQL audits, cream polishing, box tagging, and warehouse intake.
