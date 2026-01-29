// popup.js

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const mainView = document.getElementById('main-view');
    const settingsView = document.getElementById('settings-view');
    const openSettingsBtn = document.getElementById('open-settings');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');

    const countDisplay = document.getElementById('count-display');
    const goalDisplay = document.getElementById('goal-display');
    const addBtn = document.getElementById('add-btn');
    const glassBtns = document.querySelectorAll('.quantity-btn');
    const nextAlarmDisplay = document.getElementById('next-alarm');
    const overlay = document.getElementById('overlay');

    const langSelect = document.getElementById('lang-select');
    const intervalInput = document.getElementById('interval-input');
    const goalInput = document.getElementById('goal-input');

    let selectedAmount = 1;

    // Load initial data
    const data = await chrome.storage.local.get([
        'waterCount',
        'waterGoal',
        'lastResetDate',
        'language',
        'reminderInterval'
    ]);

    const today = new Date().toDateString();
    let count = data.waterCount || 0;
    let goal = data.waterGoal || 8;
    let language = data.language || (navigator.language.startsWith('es') ? 'es' : 'en');
    let interval = data.reminderInterval || 60;

    // Reset daily if needed
    if (data.lastResetDate !== today) {
        count = 0;
        await chrome.storage.local.set({ waterCount: 0, lastResetDate: today });
    }

    // Apply Translations
    function applyTranslations() {
        const texts = translations[language];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                el.textContent = texts[key];
            }
        });
    }

    // UI Setup
    countDisplay.textContent = count;
    goalDisplay.textContent = goal;
    langSelect.value = language;
    intervalInput.value = interval;
    goalInput.value = goal;
    applyTranslations();

    // Glass Selection
    glassBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            glassBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAmount = parseInt(btn.dataset.amount);
        });
    });

    // Log Water
    addBtn.addEventListener('click', async () => {
        count += selectedAmount;
        countDisplay.textContent = count;
        await chrome.storage.local.set({ waterCount: count });

        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000);

        chrome.runtime.sendMessage({ type: 'WATER_ADDED', count: count });
    });

    // Settings Logic
    openSettingsBtn.addEventListener('click', () => {
        mainView.classList.add('hidden');
        settingsView.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });

    saveSettingsBtn.addEventListener('click', async () => {
        const newLang = langSelect.value;
        const newInterval = parseInt(intervalInput.value);
        const newGoal = parseInt(goalInput.value);

        language = newLang;
        interval = newInterval;
        goal = newGoal;

        await chrome.storage.local.set({
            language: language,
            reminderInterval: interval,
            waterGoal: goal
        });

        goalDisplay.textContent = goal;
        applyTranslations();

        // Notify background for alarm change
        chrome.runtime.sendMessage({
            type: 'SETTINGS_UPDATED',
            interval: interval
        });

        settingsView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });

    const testNotifBtn = document.getElementById('test-notif');
    testNotifBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' });
    });

    // Timer Update
    async function updateTimer() {
        const alarms = await chrome.alarms.getAll();
        const texts = translations[language];
        if (alarms.length > 0) {
            const nextAlarm = alarms[0].scheduledTime;
            const diff = nextAlarm - Date.now();
            if (diff > 0) {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                nextAlarmDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            } else {
                nextAlarmDisplay.textContent = texts.anyTime || "¡Cualquier momento!";
            }
        } else {
            nextAlarmDisplay.textContent = "--:--";
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
});
