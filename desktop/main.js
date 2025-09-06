import { app, BrowserWindow, Menu } from "electron/main";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: true
        }
    });

    // window.loadFile("https://firecrafter28.github.io/Neurdle/src/index.html");
    window.loadFile(path.join(__dirname, "..", "src", "index.html"));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        window.webContents.once('dom-ready', () => {
            window.webContents.openDevTools();
        });
    }

    // Add some debugging info
    window.webContents.on('did-finish-load', () => {
        console.log('Window loaded successfully');
    });

    window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Window failed to load:', errorCode, errorDescription);
    });

    return window;
}

app.whenReady().then(() => {
    createWindow();

    // Create and set the application menu after the app is ready
    const template = [
        {
            label: "Neurdle",
            submenu: [
                {
                    role: "reload",
                    click: () => {
                        location.reload();
                    }
                },
                { role: "quit" }
            ]
        },
        {
            label: "Options",
            submenu: [
                {
                    label: "Settings",
                    click: () => {
                        // TODO: Implement settings functionality
                        console.log("Settings clicked");
                    }
                },
                { type: "separator" },
                {
                    label: "Random",
                    click: () => {
                        // TODO: Implement random functionality
                        console.log("Random clicked");
                    }
                },
                {
                    label: "Daily",
                    click: () => {
                        // TODO: Implement daily functionality
                        console.log("Daily clicked");
                    }
                }
            ]
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "Documentation",
                    click: () => {
                        // TODO: Open documentation
                        console.log("Documentation clicked");
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

const isMac = process.platform === "darwin";

app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});
