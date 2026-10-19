# courtbook

A sports court booking app. Venues (courts) in Skopje offer one or more sports (tennis, basketball, football, padel), with a price per hour and opening hours 08:00–23:00. Bookings use fixed 60-minute slots. Customers book with name and email; there are no user accounts. A single host token (header `X-Host-Token`, value from env var `HOST_TOKEN`) protects creating venues and blocking slots.

## General rules

- Commands, code, comments and identifiers are in English.
- Keep code clean and readable: small methods, no duplicated logic.
- Never commit secrets. The database password comes from `DB_PASSWORD`, the host token from `HOST_TOKEN`.
- Do not delete files or write outside `courtbook/`.

## Backend (`backend/`, package `com.example.backend`)

- `model` – JPA entities and their business rules.
- `dto` – request and response Java records.
- `service/application` – use cases; coordinates repositories and maps to DTOs.
- `service/domain` – domain logic over entities, when needed.
- `repository` – Spring Data JPA repositories.
- `web` – thin controllers and `GlobalExceptionHandler`.

Rules:

- Controllers never return entities. Requests and responses are DTO records with validation annotations.
- Double bookings are prevented at the database level by a unique constraint on `(venue_id, start_at)`. Host-blocked slots are bookings of type `BLOCKED`, so the same constraint covers them.

## Frontend (`frontend/`)

- Uses reusable components.
- Sport differences are data (name, color, image), not per-sport code.
