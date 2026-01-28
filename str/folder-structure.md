# Folder Structure (snapshot)

```text
GitHub_PR_Analyzer/
├─ Note.md
├─ README.md
├─ backend/
│  ├─ package.json
│  ├─ test-request.http
│  └─ src/
│     ├─ index.js
│     ├─ config/
│     │  └─ database.js
│     ├─ middleware/
│     │  └─ auth.js
│     ├─ models/
│     │  ├─ Analysis.js
│     │  └─ User.js
│     ├─ routes/
│     │  └─ analyze.js
│     ├─ services/
│     │  ├─ ai.js
│     │  ├─ github.js
│     │  └─ langchain.js
│     └─ utils/
│        └─ taskManager.js
├─ frontend/
│  ├─ components.json
│  ├─ eslint.config.mjs
│  ├─ next-env.d.ts
│  ├─ next.config.ts
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ README.md
│  ├─ tailwind.config.ts
│  ├─ tsconfig.json
│  ├─ app/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  └─ ui/
│  │     ├─ alert.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ input.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ separator.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ sonner.tsx
│  │     └─ tabs.tsx
│  ├─ lib/
│  │  └─ utils.ts
│  ├─ public/
│  └─ src/
│     ├─ middleware.ts
│     ├─ app/
│     │  ├─ (auth)/
│     │  │  ├─ sign-in/
│     │  │  │  └─ [[...sign-in]]/
│     │  │  │     └─ page.tsx
│     │  │  └─ sign-up/
│     │  │     └─ [[...sign-up]]/
│     │  │        └─ page.tsx
│     │  ├─ dashboard/
│     │  │  ├─ layout.tsx
│     │  │  ├─ page.tsx
│     │  │  ├─ analyze/
│     │  │  │  └─ page.tsx
│     │  │  └─ profile/
│     │  │     └─ page.tsx
│     ├─ lib/
│     │  ├─ api.ts
│     │  └─ utils.ts
│     └─ types/
│        └─ index.ts
└─ str/
   └─ folder-structure.md
```
