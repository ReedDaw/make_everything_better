// ─── Background Service Worker ───────────────────────────────
// Handles alarms and fires notifications even when popup is closed

const MODE_LABELS = {
  animals:      '🐾 Cute Animal Break',
  quotes:       '✨ Inspirational Quote',
  touchgrass:   '🌿 Touch Grass Break',
  movement:     '🏃 Movement Break',
  productivity: '🎯 Focus Check-in',
};

const MODE_BODIES = {
  animals:      'Time for a quick mood boost. Open the extension for a cute animal.',
  quotes:       'A little wisdom is waiting for you.',
  touchgrass:   'Step away from the screen for a moment.',
  movement:     'Your body needs to move. Time for a quick exercise.',
  productivity: 'Check in on your focus goal.',
};

// Re-register alarms on install and browser startup (service workers can be killed)
chrome.runtime.onInstalled.addListener(rescheduleAlarms);
chrome.runtime.onStartup.addListener(rescheduleAlarms);

function rescheduleAlarms() {
  chrome.storage.local.get('reminders', (result) => {
    const reminders = result.reminders || [];
    // Clear all existing alarms first
    chrome.alarms.clearAll(() => {
      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        scheduleAlarm(reminder);
      });
    });
  });
}

function scheduleAlarm(reminder) {
  if (reminder.type === 'interval') {
    // Every N minutes
    chrome.alarms.create(`reminder_${reminder.id}`, {
      delayInMinutes: reminder.intervalMinutes,
      periodInMinutes: reminder.intervalMinutes,
    });
  } else if (reminder.type === 'daily') {
    // Fire at a specific time each day
    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    // If that time already passed today, schedule for tomorrow
    if (next <= now) next.setDate(next.getDate() + 1);
    const delayMinutes = (next - now) / 60000;
    chrome.alarms.create(`reminder_${reminder.id}`, {
      delayInMinutes: delayMinutes,
      periodInMinutes: 24 * 60, // repeat daily
    });
  }
}

// Listen for alarm firing
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('reminder_')) return;
  const reminderId = alarm.name.replace('reminder_', '');

  chrome.storage.local.get('reminders', (result) => {
    const reminders = result.reminders || [];
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder || !reminder.enabled) return;

    const mode = reminder.mode;
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: MODE_LABELS[mode] || 'Make Everything Better',
      message: MODE_BODIES[mode] || 'Time for a break.',
      priority: 1,
    });
  });
});

// Listen for messages from popup (to reschedule when settings change)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'RESCHEDULE_ALARMS') {
    rescheduleAlarms();
  }
});