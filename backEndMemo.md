monorepo/
├── .dev.vars
├── .gitignore
├── backEndMemo.md
├── bun.lock
├── LICENSE
├── memo.md
├── package.json
├── prompt.md
├── README.md
├── tsconfig.json
├── worker-configuration.d.ts
├── wrangler.toml
├── client/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.tsbuildinfo
│   ├── vite.config.ts
│   ├── dist-types/
│   │   ├── vite.config.d.ts
│   │   └── src/
│   │       ├── App.d.ts
│   │       └── main.d.ts
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── App.css
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── vite-env.d.ts
│       ├── assets/
│       │   └── [static assets…]
│       ├── components/
│       │   ├── common/
│       │   │   ├── popover/
│       │   │   │   ├── GlassPopover.tsx
│       │   │   │   ├── GlassPopover.css
│       │   │   │   └── MenuContent/
│       │   │   │       └── ProfileMenuContent.tsx
│       │   │   └── table/
│       │   │       └── GlassTable.css
│       │   ├── rootlayout/
│       │   │   ├── BackgroundBlobs.tsx
│       │   │   ├── BackgroundBlobs.css
│       │   │   ├── GlassNavbar.tsx
│       │   │   ├── GlassNavbar.css
│       │   │   ├── GlassSidebar.tsx
│       │   │   ├── GlassSidebar.css
│       │   │   ├── GlassSidebarRight.tsx
│       │   │   └── GlassSidebarRight.css
│       │   └── students/
│       │       ├── StudentList.tsx
│       │       └── StudentForm.tsx
│       ├── pages/
│       │   ├── ActivityPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── BridgePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── PerformanceCasesPage.tsx
│       │   ├── SavedPage.tsx
│       │   ├── StatisticPage.tsx
│       │   ├── StudentsPage.tsx
│       │   └── TasksPage.tsx
│       └── stores/
│           ├── authStore.ts
│           ├── studentPageStore.ts
│           └── uiStore.ts
├── server/
│   ├── .env
│   ├── .gitignore
│   ├── bun.lock
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── migrations/
│   │   ├── 0000_minor_luminals.sql
│   │   └── meta/
│   │       └── [migration files…]
│   └── src/
│       ├── api.ts
│       ├── auth.ts
│       ├── db/
│       │   ├── index.ts
│       │   └── schema.ts
│       ├── route/
│       │   ├── problemmanage.ts
│       │   ├── studentmanage.ts
│       │   ├── r2imageupload.ts
│       │   └── 0417.txt
│       └── [other source files…]
└── shared/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.tsbuildinfo
    └── src/
        ├── index.ts
        ├── schemas/
        │   ├── app.schema.ts
        │   └── index.ts
        └── types/
            ├── index.ts
            └── ui.types.ts