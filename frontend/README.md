# RepoChat Frontend

React + TypeScript + Vite + Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (New York style).

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests use the Vite proxy (`/api` → backend on port 8000) unless `VITE_API_BASE_URL` is set.

## shadcn/ui

Configuration lives in `components.json`. UI primitives are under `src/components/ui/`. Add more components with:

```bash
npx shadcn@latest add dialog textarea badge
```

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Development server |
| `npm run build`| Production build   |
| `npm run preview` | Preview build   |
