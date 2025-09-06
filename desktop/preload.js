const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld("api", {
    isDesktop: true,
    platform: process.platform,
    // Add a flag to control GTM
    allowAnalytics: true
});

// Legacy support - this might not work with contextIsolation: true
// but keeping it for backward compatibility if you disable context isolation
window.desktop = true;
