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

- Node.js (v16 or higher)
- SQLite3
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
   npm install
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
npm run dev
```

### Production

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the bot:
   ```bash
   npm start
   ```

## Commands

Send **`/help`** for available commands.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [Telegraf](https://telegraf.js.org/) for the Telegram bot framework.
- [SQLite](https://www.sqlite.org/) for lightweight database management.
- [Winston](https://github.com/winstonjs/winston) for logging.
