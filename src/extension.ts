import * as vscode from 'vscode';

let intervalTimer: NodeJS.Timeout | undefined;
let countdownTimer: NodeJS.Timeout | undefined;
let countdownInterval: NodeJS.Timeout | undefined;
let countdownMessage: vscode.Disposable | undefined;
let isPaused = false;
let isShowingReminder = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('Look Away extension is now active!');

    // Start the reminder system
    startReminderSystem();

    // Register commands
    const skipCommand = vscode.commands.registerCommand('lookaway.skip', () => {
        if (isShowingReminder) {
            if (countdownTimer) {
                clearTimeout(countdownTimer);
                countdownTimer = undefined;
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = undefined;
            }
            if (countdownMessage) {
                countdownMessage.dispose();
                countdownMessage = undefined;
            }
            isShowingReminder = false;
            vscode.window.showInformationMessage('Reminder skipped. Next reminder will appear at the scheduled time.');
            scheduleNextReminder();
        }
    });

    const pauseCommand = vscode.commands.registerCommand('lookaway.pause', () => {
        if (!isPaused) {
            isPaused = true;
            if (intervalTimer) {
                clearInterval(intervalTimer);
            }
            vscode.window.showInformationMessage('Look Away reminders paused. Use "Resume Reminders" to start again.');
        }
    });

    const resumeCommand = vscode.commands.registerCommand('lookaway.resume', () => {
        if (isPaused) {
            isPaused = false;
            startReminderSystem();
            vscode.window.showInformationMessage('Look Away reminders resumed.');
        }
    });

    context.subscriptions.push(skipCommand, pauseCommand, resumeCommand);

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('lookaway')) {
                // Restart the reminder system with new settings
                if (intervalTimer) {
                    clearTimeout(intervalTimer);
                    intervalTimer = undefined;
                }
                if (countdownTimer) {
                    clearTimeout(countdownTimer);
                    countdownTimer = undefined;
                }
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = undefined;
                }
                if (countdownMessage) {
                    countdownMessage.dispose();
                    countdownMessage = undefined;
                }
                isShowingReminder = false;
                startReminderSystem();
            }
        })
    );
}

function startReminderSystem() {
    // Just schedule the first reminder
    scheduleNextReminder();
}

function scheduleNextReminder() {
    const config = vscode.workspace.getConfiguration('lookaway');
    const enabled = config.get<boolean>('enabled', true);

    if (!enabled || isPaused) {
        return;
    }

    const intervalMinutes = config.get<number>('intervalMinutes', 20);
    const intervalMs = intervalMinutes * 60 * 1000;

    // Clear any existing timer
    if (intervalTimer) {
        clearTimeout(intervalTimer);
        intervalTimer = undefined;
    }

    // Schedule next reminder
    intervalTimer = setTimeout(() => {
        showLookAwayReminder();
    }, intervalMs);
}

function showLookAwayReminder() {
    if (isShowingReminder || isPaused) {
        // If already showing a reminder, schedule the next one
        scheduleNextReminder();
        return;
    }

    const config = vscode.workspace.getConfiguration('lookaway');
    const durationSeconds = config.get<number>('durationSeconds', 20);

    isShowingReminder = true;

    // Show the reminder notification
    vscode.window.showWarningMessage(
        `👀 Look Away! Look at something 20 feet away for ${durationSeconds} seconds.`,
        'Start Break',
        'Skip'
    ).then(selection => {
        if (selection === 'Skip' || selection === undefined) {
            isShowingReminder = false;
            if (selection === 'Skip') {
                vscode.window.showInformationMessage('Reminder skipped. Next reminder will appear at the scheduled time.');
            }
            // Schedule next reminder after skipping
            scheduleNextReminder();
            return;
        }

        // Start countdown - only if "Start Break" was clicked
        let remainingSeconds = durationSeconds;
        console.log(`Starting countdown for ${durationSeconds} seconds`);
        
        // Clear any existing countdown
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = undefined;
        }
        if (countdownMessage) {
            countdownMessage.dispose();
            countdownMessage = undefined;
        }

        const updateStatusBar = () => {
            if (countdownMessage) {
                countdownMessage.dispose();
            }
            countdownMessage = vscode.window.setStatusBarMessage(
                `👀 Look away! ${remainingSeconds} seconds remaining...`,
                0
            );
        };

        // Show progress notification with countdown (cancellable)
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "👀 Look Away Break",
            cancellable: true
        }, async (progress, token) => {
            return new Promise<void>((resolve) => {
                // Handle cancellation
                token.onCancellationRequested(() => {
                    console.log('Countdown cancelled by user');
                    if (countdownInterval) {
                        clearInterval(countdownInterval);
                        countdownInterval = undefined;
                    }
                    if (countdownMessage) {
                        countdownMessage.dispose();
                        countdownMessage = undefined;
                    }
                    if (countdownTimer) {
                        clearTimeout(countdownTimer);
                        countdownTimer = undefined;
                    }
                    isShowingReminder = false;
                    vscode.window.showInformationMessage('Break cancelled. Next reminder will appear at the scheduled time.');
                    scheduleNextReminder();
                    resolve();
                });

                // Initial status bar display
                updateStatusBar();

                // Initial progress report
                progress.report({
                    increment: 0,
                    message: `${remainingSeconds} seconds remaining...`
                });

                countdownInterval = setInterval(() => {
                    // Check if cancelled
                    if (token.isCancellationRequested) {
                        return;
                    }

                    remainingSeconds--;
                    
                    // Update progress notification (calculate progress correctly)
                    const progressPercent = ((durationSeconds - remainingSeconds) / durationSeconds) * 100;
                    progress.report({
                        increment: 100 / durationSeconds,
                        message: `${remainingSeconds} seconds remaining...`
                    });
                    
                    // Update status bar
                    updateStatusBar();
                    
                    // Check if countdown is complete
                    if (remainingSeconds <= 0) {
                        if (countdownInterval) {
                            clearInterval(countdownInterval);
                            countdownInterval = undefined;
                        }
                        if (countdownMessage) {
                            countdownMessage.dispose();
                            countdownMessage = undefined;
                        }
                        if (countdownTimer) {
                            clearTimeout(countdownTimer);
                            countdownTimer = undefined;
                        }
                        // Complete the progress
                        progress.report({ increment: 100, message: 'Complete!' });
                        vscode.window.showInformationMessage('✅ Break complete!');
                        vscode.window.setStatusBarMessage('✅ Break complete!', 3000);
                        isShowingReminder = false;
                        // Schedule next reminder AFTER break completes
                        scheduleNextReminder();
                        resolve();
                    }
                }, 1000);
            });
        });

        // Backup timer to ensure cleanup (safety net)
        countdownTimer = setTimeout(() => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = undefined;
            }
            if (countdownMessage) {
                countdownMessage.dispose();
                countdownMessage = undefined;
            }
            isShowingReminder = false;
            scheduleNextReminder();
        }, (durationSeconds + 1) * 1000); // Add 1 second buffer
    });
}

export function deactivate() {
    if (intervalTimer) {
        clearInterval(intervalTimer);
    }
    if (countdownTimer) {
        clearTimeout(countdownTimer);
    }
}

