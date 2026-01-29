// popup.js

document.addEventListener('DOMContentLoaded', async () => {
    const countDisplay = document.getElementById('count-display');
    const goalDisplay = document.getElementById('goal-display');
    const addBtn = document.getElementById('add-btn');
    const glassBtns = document.querySelectorAll('.quantity-btn');
    const nextAlarmDisplay = document.getElementById('next-alarm');
    const overlay = document.getElementById('overlay');

    let selectedAmount = 1;

    // Load initial data
    const data = await chrome.storage.local.get(['waterCount', 'waterGoal', 'lastResetDate']);
    const today = new Date().toDateString();

    let count = data.waterCount || 0;
    const goal = data.waterGoal || 8;

    // Reset daily if needed
    if (data.lastResetDate !== today) {
        count = 0;
        await chrome.storage.local.set({ waterCount: 0, lastResetDate: today });
    }

    countDisplay.textContent = count;
    goalDisplay.textContent = goal;

    // Handle glass selection
    glassBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            glassBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAmount = parseInt(btn.dataset.amount);
        });
    });

    // Handle add water
    addBtn.addEventListener('click', async () => {
        count += selectedAmount;
        countDisplay.textContent = count;

        await chrome.storage.local.set({ waterCount: count });

        // Show success animation
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000);

        // Notify background
        chrome.runtime.sendMessage({ type: 'WATER_ADDED', count: count });
    });

    // Update timer
    async function updateTimer() {
        const alarms = await chrome.alarms.getAll();
        if (alarms.length > 0) {
            const nextAlarm = alarms[0].scheduledTime;
            const diff = nextAlarm - Date.now();
            if (diff > 0) {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                nextAlarmDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            } else {
                nextAlarmDisplay.textContent = "¡Cualquier momento!";
            }
        } else {
            nextAlarmDisplay.textContent = "--:--";
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
});
