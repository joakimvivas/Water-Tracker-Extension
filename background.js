// background.js

const ALARM_NAME = 'water-reminder';
const INTERVAL_MINUTES = 60; // Recordatorio cada hora

chrome.runtime.onInstalled.addListener(() => {
    console.log('Water Tracker Extension Installed');
    setupAlarm();

    // Set default goal if not exists
    chrome.storage.local.get(['waterGoal'], (data) => {
        if (!data.waterGoal) {
            chrome.storage.local.set({ waterGoal: 8 });
        }
    });
});

function setupAlarm() {
    chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: INTERVAL_MINUTES,
        periodInMinutes: INTERVAL_MINUTES
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        showNotification();
    }
});

function showNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '¡Hora de beber agua! 💧',
        message: 'No olvides mantenerte hidratado. Bebe un vaso de agua ahora.',
        priority: 2
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WATER_ADDED') {
        // We could reset the alarm timer here if we want to wait another hour from the last sip
        // setupAlarm(); 
        console.log('Water added:', message.count);
    }
});
