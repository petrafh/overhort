# Overhørt

En mobilførst sosial app for de tingene vennene dine ikke lar deg glemme. Bygget med React, Vite, TypeScript, Neon/Postgres og Tailwind CSS.

## Kjør lokalt

```bash
npm install
npm run dev
```

Webappen starter med lokale demodata, så grensesnittet kan prøves uten databaseoppsett. `npm run dev` starter både Vite på `http://127.0.0.1:5174` og API-et på port 3001.

## Koble til Neon

1. Opprett et Neon-prosjekt.
2. Åpne Neon SQL Editor og kjør `database/schema.sql`.
3. Kopier `.env.example` til `.env`.
4. Lim inn en pooled Neon connection string som `DATABASE_URL`, og sett en lang tilfeldig `JWT_SECRET`.
5. Kjør `npm run db:migrate` for å opprette tabellene. Bruk `npm run db:check` for en skrivebeskyttet kontroll.

`DATABASE_URL` brukes kun i Express-API-et og eksponeres aldri med `VITE_`-prefiks. API-et bruker parameteriserte Neon-spørringer, bcrypt-hashing av passord og JWT for autentisering. Vennekontroll utføres i SQL før sitater kan opprettes eller hentes.

Profiloppretting, brukersøk og venneforespørsler bruker API-et direkte. Produksjonsversjonen inneholder ingen eksempelbrukere.

## Netlify

`netlify.toml` bygger Vite-appen og publiserer Express-API-et som en Netlify Function. Legg inn `DATABASE_URL`, `JWT_SECRET` og `CLIENT_ORIGIN` under Netlify → Project configuration → Environment variables. `CLIENT_ORIGIN` skal være den publiserte Netlify-adressen, for eksempel `https://ditt-domene.netlify.app`.

## Scripts

- `npm run dev` – lokal utviklingsserver
- `npm run dev:web` – bare Vite-grensesnittet
- `npm run dev:api` – bare Neon-API-et
- `npm run build` – TypeScript-sjekk og produksjonsbygg
- `npm run preview` – forhåndsvis produksjonsbygget
