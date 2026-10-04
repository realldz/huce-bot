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

Images are also built on GitHub: [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) runs on every push to `main`, on every `v*` tag, and on manual dispatch, then publishes to the GitHub Container Registry as `ghcr.io/realldz/huce-bot:latest` (plus `main`, `v1.2.3` and `sha-<commit>` tags). The image is multi-arch — `linux/amd64` and `linux/arm64` — so it also runs on ARM servers, and Docker picks the right one automatically. It needs no repository secrets — it authenticates with the built-in `GITHUB_TOKEN`, and `.env`, `*.db`, `data/` and `logs/` stay out of the image because of `.dockerignore`.

To deploy a server from the published image instead of building from source:

```bash
docker compose pull
docker compose up -d --no-build
```

The published package is publicly readable, so `docker compose pull` needs no login. If you ever switch it to private under *Packages → huce-bot → Package settings → Change visibility*, authenticate first with a classic PAT that has the `read:packages` scope:

```bash
echo $CR_PAT | docker login ghcr.io -u realldz --password-stdin
```

Notes:

- `.env` is listed in `.dockerignore`, so secrets are injected at runtime and never baked into the image. Compose also strips the quotes around `DEBUG='telegraf:main'` for you.
- SQLite lives in `./data` on the host and is mounted at `/data`; the real file is `./data/users.db`, so the data survives `docker compose down`. Compose also sets `DB_PATH=/data/users.db` in the service environment, which outranks `env_file` — that way a stale `.env` on a server cannot silently put the database inside the container filesystem, where recreating the container would wipe it. Docker creates `./data` on its own, and since a directory mount expects a directory, the old trap is gone: a missing `./users.db` used to be auto-created as an *empty directory*, which made sqlite3 fail with `SQLITE_CANTOPEN`. Host runs (`bun run dev`) read `DB_PATH` from `.env`, which points at the same `./data/users.db`.
- If SQLite over a Windows bind mount reports `database is locked`, replace the `./data:/data` mount with a named volume (`huce-bot-data:/data`) and declare a top-level `volumes:` key.
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
