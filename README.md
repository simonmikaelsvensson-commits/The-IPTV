# The-IPTV
IPTV

db:
image: postgres:15
restart: always
environment:
POSTGRES_USER: Svesse
POSTGRES_PASSWORD: 12345678
POSTGRES_DB: theiptv
volumes:
- db-data:/var/lib/postgresql/data
healthcheck:
test: ["CMD-SHELL", "pg_isready -U theiptv -d theiptv"]
interval: 10s
timeout: 5s
retries: 5

backend:
build: ./backend
restart: always
env_file: ./backend/.env
ports:
- "3000:3000"
depends_on:
db:
condition: service_healthy
volumes:
- ./backend/logs:/usr/src/app/logs

migrate:
build: ./backend
command: ["node", "scripts/run_migrations.js"]
env_file: ./backend/.env
depends_on:
db:
condition: service_healthy
restart: "no"

volumes:
db-data:







healthcheck:
test: ["CMD-SHELL", "pg\_isready -U theiptv -d theiptv"]
interval: 10s
timeout: 5s
retries: 5

