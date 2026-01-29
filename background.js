// background.js

const ALARM_NAME = 'water-reminder';

const notificationTexts = {
    en: {
        title: "Time to drink water! 💧",
        message: "Don't forget to stay hydrated. Drink a glass of water now."
    },
    es: {
        title: "¡Hora de beber agua! 💧",
        message: "No olvides mantenerte hidratado. Bebe un vaso de agua ahora."
    }
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['reminderInterval', 'waterGoal'], (data) => {
        const interval = data.reminderInterval || 60;
        const goal = data.waterGoal || 8;
        if (!data.reminderInterval || !data.waterGoal) {
            chrome.storage.local.set({ reminderInterval: interval, waterGoal: goal });
        }
        setupAlarm(interval);
    });
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['reminderInterval'], (data) => {
        setupAlarm(data.reminderInterval || 60);
    });
});

function setupAlarm(intervalMinutes) {
    chrome.alarms.clear(ALARM_NAME, () => {
        chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: parseFloat(intervalMinutes),
            periodInMinutes: parseFloat(intervalMinutes)
        });
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        showNotification();
    }
});

async function showNotification() {
    const data = await chrome.storage.local.get(['language']);
    const lang = data.language || 'en';
    const texts = notificationTexts[lang] || notificationTexts.en;

    // Show In-Page Toast on ALL active tabs across ALL windows
    chrome.tabs.query({ active: true }, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url && tab.url.startsWith('http')) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (injectedTexts, iconUrl) => {
                        const existing = document.getElementById('water-tracker-toast-simple');
                        if (existing) existing.remove();

                        const toast = document.createElement('div');
                        toast.id = 'water-tracker-toast-simple';

                        Object.assign(toast.style, {
                            position: 'fixed',
                            top: '30px',
                            right: '30px',
                            zIndex: '2147483647',
                            padding: '16px 24px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid #0ea5e9',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            opacity: '0',
                            transform: 'translateX(50px) scale(0.9)',
                            userSelect: 'none'
                        });

                        toast.innerHTML = `
                            <img src="${iconUrl}" style="width: 48px; height: 48px; pointer-events: none;">
                            <div style="font-family: -apple-system, system-ui, sans-serif; pointer-events: none; border-left: 1px solid #f1f5f9; padding-left: 16px;">
                                <div style="font-weight: 800; font-size: 18px; color: #0369a1; margin: 0; line-height: 1.2;">${injectedTexts.title}</div>
                                <div style="font-size: 14px; color: #64748b; margin-top: 4px;">${injectedTexts.message}</div>
                            </div>
                        `;

                        document.body.appendChild(toast);
                        toast.offsetHeight;
                        toast.style.opacity = '1';
                        toast.style.transform = 'translateX(0) scale(1)';

                        toast.onclick = () => {
                            toast.style.opacity = '0';
                            toast.style.transform = 'translateX(50px) scale(0.95)';
                            setTimeout(() => toast.remove(), 400);
                        };
                    },
                    args: [texts, chrome.runtime.getURL('icons/glass.png')]
                }).catch(err => console.log('Injection failed on tab:', tab.id));
            }
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SETTINGS_UPDATED') {
        setupAlarm(message.interval);
    } else if (message.type === 'TEST_NOTIFICATION') {
        showNotification();
    }
});
