# Telegram Bot for Student Management

This project is a Telegram bot designed to assist students with managing their academic activities. The bot provides features such as schedule notifications, grade tracking, news updates, and attendance check-ins.

## Features

- **Login and Authentication**: Securely log in using student credentials.
- **Daily Schedule Notifications**: Receive daily updates about your schedule.
- **Grade Tracking**: View academic performance summaries and detailed grades.
- **News Updates**: Stay informed with the latest news and announcements.
- **Attendance Check-in**: Easily check in for classes using location and codes.
- **Personal Information**: View detailed student information.
- **Reminders**: Get notified about important reminders and tasks.

## Prerequisites

- Bun
- SQLite3
- Docker with the Compose plugin (optional, for containerized deployment)
- Telegram Bot Token (from [BotFather](https://core.telegram.org/bots#botfather))
- Environment variables configured in a `.env` file (see `.env.example` for reference)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/telegram-bot.git
   cd telegram-bot
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure the environment variables:

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in the required values in the `.env` file.

4. Initialize the database:
   - The bot will automatically create the necessary SQLite tables on startup.

## Usage

### Development

Start the bot in development mode with hot-reloading:

```bash
bun run dev
```

### Production

1. Start the bot:

```bash
bun run start
```

### Docker

The repository ships a two-stage `Dockerfile` (Bun 1) and a `docker-compose.yml` that reads its configuration straight from `.env`.

```bash
docker compose up -d --build   # build and start in the background
docker compose logs -f         # follow the bot log
docker compose down            # stop
docker compose up -d --build   # rebuild after a code change
```

Images are also built on GitHub: [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) runs on every push to `main`, on every `v*` tag, and on manual dispatch, then publishes to the GitHub Container Registry as `ghcr.io/realldz/huce-bot:latest` (plus `main`, `v1.2.3` and `sha-<commit>` tags). It needs no repository secrets — it authenticates with the built-in `GITHUB_TOKEN`, and `.env` plus `*.db` stay out of the image because of `.dockerignore`.

To deploy a server from the published image instead of building from source:

```bash
docker compose pull
docker compose up -d --no-build
```

A package is private when first published, so an unauthenticated `docker compose pull` fails with `denied`. Either change it under *Packages → huce-bot → Package settings → Change visibility*, or log in with a classic PAT that has the `read:packages` scope:

```bash
echo $CR_PAT | docker login ghcr.io -u realldz --password-stdin
```

Notes:

- `.env` is listed in `.dockerignore`, so secrets are injected at runtime and never baked into the image. Compose also strips the quotes around `DEBUG='telegraf:main'` for you.
- `./users.db` is bind-mounted at the path `DB_PATH` points to, and `./logs` is mounted so `logs/bot.log` stays readable from the host. Keep `DB_PATH=users.db` in `.env` so it matches the mount, and make sure `./users.db` exists before the first `up` — otherwise Docker creates a *directory* with that name and sqlite3 fails to start.
- If SQLite on a Windows bind mount reports `database is locked`, switch to the named-volume alternative commented at the bottom of `docker-compose.yml` and set `DB_PATH=/data/users.db` in `.env`.
- `TZ=Asia/Ho_Chi_Minh` is set in the compose file because `node-schedule` evaluates the cron expressions in the container's local time, which is UTC by default.
- Long polling is the default (`WEBHOOK_DOMAIN` empty), so no port is published. For webhook mode, uncomment `EXPOSE 3000` in the `Dockerfile`, set `WEBHOOK_DOMAIN` and `PORT` in `.env`, uncomment the `ports` block in `docker-compose.yml`, and put the bot behind an HTTPS reverse proxy.

## Commands

Send **`/help`** for available commands.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [Telegraf](https://telegraf.js.org/) for the Telegram bot framework.
- [SQLite](https://www.sqlite.org/) for lightweight database management.
- [Winston](https://github.com/winstonjs/winston) for logging.
