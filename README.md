# Water Tracker Extension 💧

A Chrome/Brave extension designed to help you stay hydrated through timely reminders and a simple water intake logging system.

## 🚀 Features
- **Automatic Reminders**: Configurable notifications every hour (or your preferred time interval).
- **Quick Quantity Selector**: Log 1, 2, or 3 glasses of water at once.
- **Automatic Daily Reset**: The counter resets to 0 at the start of each day.
- **"Glassmorphism" Interface**: Modern, clean, and minimalist design.
- **Total Privacy**: All data is stored locally within your browser.

## 🛠️ Application Logic

### Storage
The extension uses `chrome.storage.local` to persist data. The saved fields are:
- `waterCount`: Number of glasses consumed today.
- `waterGoal`: Daily goal (default set to 8 glasses).
- `lastResetDate`: The date of the last logged consumption, used for the daily reset check.

### Daily Reset
Every time the popup is opened:
1. It compares the current date with `lastResetDate`.
2. If they differ (meaning it's past midnight), it sets `waterCount` to `0` and updates `lastResetDate` to today's date.

### Alarm System
- **Background Service Worker**: Manages the timing and triggers notifications in the background.
- **Time Configuration**: The frequency is defined in `background.js` via the `INTERVAL_MINUTES` constant. By default, it is set to 60 minutes.

## 📖 Installation Instructions
1. Open your browser (Chrome or Brave) and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `pocs-pinitos/water-tracker-extension` folder.

## 📂 Project Structure
- `manifest.json`: Main extension configuration.
- `background.js`: Background logic and hourly notifications.
- `popup.html`: Extension visual interface.
- `popup.js`: Interaction logic (adding glasses, date checking, timer).
- `style.css`: Visual styling with a modern glassmorphism aesthetic.
- `icons/`: Contains visual assets (`glass.png` for the icon and selector, `drinking.png` for the success screen).

## 💡 Customization
If you want to change the notification frequency, edit `background.js`:
```javascript
const INTERVAL_MINUTES = 60; // Change this value to your preferred minutes
```
