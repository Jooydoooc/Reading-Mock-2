# Reading-Mock-2

## Vercel deployment notes

This project now sends submitted test answers to Telegram through a Vercel serverless endpoint:

- Front-end sends submission payload to `POST /api/telegram-results`
- API route forwards it to Telegram Bot API `sendMessage`

### Required environment variables (Vercel)

- `TELEGRAM_BOT_TOKEN` — your Telegram bot token
- `TELEGRAM_CHAT_ID` — target group/chat ID

Without these variables, Telegram delivery will fail on the server route.
