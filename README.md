# Overhørt

En mobilførst sosial app for de tingene vennene dine ikke lar deg glemme. Bygget med React, Vite, TypeScript, Neon/Postgres og Tailwind CSS.

## Kjør lokalt

```bash
npm install
npm run dev
```

Webappen starter med lokale demodata, så grensesnittet kan prøves uten databaseoppsett. `npm run dev` starter både Vite på port 5173 og API-et på port 3001.

## Koble til Neon

1. Opprett et Neon-prosjekt.
2. Åpne Neon SQL Editor og kjør `database/schema.sql`.
3. Kopier `.env.example` til `.env`.
4. Lim inn en pooled Neon connection string som `DATABASE_URL`, og sett en lang tilfeldig `JWT_SECRET`.

`DATABASE_URL` brukes kun i Express-API-et og eksponeres aldri med `VITE_`-prefiks. API-et bruker parameteriserte Neon-spørringer, bcrypt-hashing av passord og JWT for autentisering. Vennekontroll utføres i SQL før sitater kan opprettes eller hentes.

I neste integrasjonssteg kan UI-et byttes fra `src/data.ts` til funksjonene i `src/api.ts`; demodataene er beholdt med vilje for at designprototypen skal være umiddelbart kjørbar.

## Scripts

- `npm run dev` – lokal utviklingsserver
- `npm run dev:web` – bare Vite-grensesnittet
- `npm run dev:api` – bare Neon-API-et
- `npm run build` – TypeScript-sjekk og produksjonsbygg
- `npm run preview` – forhåndsvis produksjonsbygget
