# Endpoints principaux

Base : `/api/v1`

## Sessions

- `POST /sessions/login`
- `POST /sessions/refresh`
- `POST /sessions/logout`
- `POST /sessions/logout-all`
- `GET /auth/me`

## Administration

- `/users`
- `/administrative-areas`
- `/campaigns`

## Collecte

- `/dwellings`
- `/households`
- `/persons`

Chaque ressource de collecte expose les actions `submit`, `validate` et `reject` selon le rôle.

## Pilotage

- `GET /dashboard/campaigns/{campaignId}`
- `GET /audit-logs?page=1&pageSize=50`
- `GET /reports/campaigns/{campaignId}/dwellings.csv`
- `GET /reports/campaigns/{campaignId}/households.csv`
- `GET /reports/campaigns/{campaignId}/persons.csv`
- `GET /system/status`
- `GET /system/database`
- `GET /health`
