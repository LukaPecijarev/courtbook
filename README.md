courtbook

courtbook is a small booking app for sports courts in Skopje: tennis, basketball, football and padel. You pick a court, choose a free hour and book it with your name and email. There is no login.

What it does

As a visitor you can:

see the courts for each sport
pick a free one-hour slot on a court
book it with your name and email

As a court owner you can:

list your court
add slots
edit the court
remove it

There is also a small chat assistant. It can tell you the next free slot or which courts are free on a day.

How the court owner part works

When you create a court you get a management key. It is shown only once, so save it somewhere safe. You need it to change the court or add slots later.

The key cannot be recovered. If you lose it, the court can't be edited any more.

Run it locally

You need Java 17, Node 22 or newer, and PostgreSQL 17.

First create the database. The app does not create it for you:

psql -U postgres -c "CREATE DATABASE courtbook;"

On pgAdmin you can do the same from the Databases menu.

Backend

Set these environment variables in the same terminal where you start the backend:

DB_PASSWORD: the password of your local PostgreSQL user (by default the app connects as postgres to localhost:5432/courtbook).
HOST_TOKEN: a secret you pick yourself. It protects the host-only endpoints and is sent in the X-Host-Token header. Use the same value in the host page (/host/venues/:id) when you upload a court image.
ANTHROPIC_API_KEY: optional, only needed for the chat. Without it the quick questions still work, and free-text questions get an "unavailable" reply.

On Windows (PowerShell):

$env:DB_PASSWORD = "your-password"
$env:HOST_TOKEN = "any-secret-you-choose"
cd backend
.\mvnw.cmd spring-boot:run

On macOS or Linux:

export DB_PASSWORD="your-password"
export HOST_TOKEN="any-secret-you-choose"
cd backend
./mvnw spring-boot:run

The backend runs on port 8080.

Frontend
cd frontend
npm install
npm run dev

Then open http://localhost:5173.

To run the tests, use ./mvnw test in backend (or .\mvnw.cmd test on Windows).

Tech

The backend is Spring Boot 4 with Java 17 and PostgreSQL. The frontend is React with TypeScript and Vite. The backend is split into thin controllers, application services for the use cases, domain rules, and JPA entities.

Deployment
The database is on Neon.
The backend is on Render. It is built with Docker, with backend as the root folder.
The frontend is on Vercel, with frontend as the root folder. vercel.json sends /api requests to Render.

The free Render instance goes to sleep after a while without traffic. The first request after that can take some time.

AI tools

I used Claude Code to write most of the code. I reviewed what it wrote, ran the tests and made the design decisions myself.

What I would improve with more time
Real image upload with object storage.
Accounts for court owners instead of a one-time key.
Payments.
A proper rate limit that survives restarts. Right now it is kept in memory.
More tests for the frontend.