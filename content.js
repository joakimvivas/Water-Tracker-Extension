// content.js
console.log('Water Tracker content script loaded!');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_WATER_TOAST') {
        createWaterToast(message.texts);
    }
});

function createWaterToast(texts) {
    // Remove existing toast if any
    const existing = document.getElementById('water-tracker-toast');
    if (existing) existing.remove();

    // Create toast container
    const toast = document.createElement('div');
    toast.id = 'water-tracker-toast';

    // Inline styles for high isolation
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '2147483647', // Maximum possible z-index
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: 'translateX(120%)',
        cursor: 'pointer'
    });

    // Icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/glass.png');
    icon.style.width = '40px';
    icon.style.height = '40px';

    // Content
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';

    const title = document.createElement('div');
    title.innerText = texts.title;
    title.style.fontWeight = '800';
    title.style.fontSize = '16px';
    title.style.color = '#0284c7';

    const subtitle = document.createElement('div');
    subtitle.innerText = texts.message;
    subtitle.style.fontSize = '13px';
    subtitle.style.color = '#64748b';

    content.appendChild(title);
    content.appendChild(subtitle);
    toast.appendChild(icon);
    toast.appendChild(content);

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Close logic
    const closeToast = () => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 500);
    };

    toast.onclick = closeToast;
}
