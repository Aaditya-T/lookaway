# Look Away - VS Code Extension

A simple VS Code extension that reminds you to follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.

## Features

- ⏰ Automatic reminders at configurable intervals (default: 20 minutes)
- 👀 Countdown timer showing remaining seconds to look away (default: 20 seconds)
- ⏸️ Pause/Resume functionality
- ⏭️ Skip current reminder
- ⚙️ Fully configurable via VS Code settings

## Configuration

You can configure the extension in VS Code settings:

- `lookaway.intervalMinutes`: Interval in minutes between reminders (default: 20, range: 1-120)
- `lookaway.durationSeconds`: Duration in seconds to look away (default: 20, range: 5-300)
- `lookaway.enabled`: Enable or disable the reminders (default: true)

## Commands

- `Look Away: Skip Current Reminder` - Skip the current reminder
- `Look Away: Pause Reminders` - Pause all reminders
- `Look Away: Resume Reminders` - Resume paused reminders

## How to Use

1. Install the extension
2. The extension will automatically start when VS Code launches
3. You'll receive a notification every 20 minutes (or your configured interval)
4. When the reminder appears, look away from your screen for 20 seconds (or your configured duration)
5. A countdown timer will appear in the status bar

## Development

```bash
npm install
npm run compile
```

Press F5 to run the extension in a new Extension Development Host window.

## License

MIT

