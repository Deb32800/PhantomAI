"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowController = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
/**
 * Window Controller - Manage desktop windows
 */
class WindowController {
    /**
     * Get all open windows
     */
    async getWindows() {
        if (process.platform === 'darwin') {
            return this.getMacWindows();
        }
        else if (process.platform === 'win32') {
            return this.getWindowsWindows();
        }
        return [];
    }
    /**
     * Get windows on macOS
     */
    async getMacWindows() {
        return new Promise((resolve) => {
            const script = `
        tell application "System Events"
          set windowList to {}
          repeat with theProcess in (every process whose background only is false)
            try
              repeat with theWindow in (every window of theProcess)
                set end of windowList to {name of theWindow, name of theProcess, position of theWindow, size of theWindow}
              end repeat
            end try
          end repeat
          return windowList
        end tell
      `;
            (0, child_process_1.exec)(`osascript -e '${script}'`, (error, stdout) => {
                if (error) {
                    resolve([]);
                    return;
                }
                // Parse the output (simplified)
                const windows = [];
                // Implementation would parse AppleScript output
                resolve(windows);
            });
        });
    }
    /**
     * Get windows on Windows
     */
    async getWindowsWindows() {
        // Would use Windows API or PowerShell
        return [];
    }
    /**
     * Focus a window by name
     */
    async focusWindow(windowName) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "System Events"
            set frontmost of process "${windowName}" to true
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Minimize a window
     */
    async minimizeWindow(owner) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              set miniaturized of window 1 to true
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Maximize/zoom a window
     */
    async maximizeWindow(owner) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              set zoomed of window 1 to true
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Close a window
     */
    async closeWindow(owner) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              close window 1
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Move window to position
     */
    async moveWindow(owner, x, y) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              set position of window 1 to {${x}, ${y}}
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Resize window
     */
    async resizeWindow(owner, width, height) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              set size of window 1 to {${width}, ${height}}
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Tile windows left/right
     */
    async tileWindow(owner, position) {
        const display = electron_1.screen.getPrimaryDisplay();
        const { width, height } = display.workAreaSize;
        const { x: offsetX, y: offsetY } = display.workArea;
        const newX = position === 'left' ? offsetX : offsetX + width / 2;
        const newWidth = width / 2;
        await this.moveWindow(owner, newX, offsetY);
        await this.resizeWindow(owner, newWidth, height);
        return true;
    }
    /**
     * Get active/focused window
     */
    async getActiveWindow() {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "System Events"
            set frontApp to name of first process whose frontmost is true
          end tell
          return frontApp
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error, stdout) => {
                    if (error) {
                        resolve(null);
                        return;
                    }
                    resolve(stdout.trim());
                });
            });
        }
        return null;
    }
    /**
     * Get window bounds
     */
    async getWindowBounds(owner) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                const script = `
          tell application "${owner}"
            try
              set {x, y} to position of window 1
              set {w, h} to size of window 1
              return "" & x & "," & y & "," & w & "," & h
            end try
          end tell
        `;
                (0, child_process_1.exec)(`osascript -e '${script}'`, (error, stdout) => {
                    if (error) {
                        resolve(null);
                        return;
                    }
                    const [x, y, width, height] = stdout.trim().split(',').map(Number);
                    resolve({ x, y, width, height });
                });
            });
        }
        return null;
    }
    /**
     * Center window on screen
     */
    async centerWindow(owner) {
        const bounds = await this.getWindowBounds(owner);
        if (!bounds)
            return false;
        const display = electron_1.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;
        const { x: offsetX, y: offsetY } = display.workArea;
        const newX = offsetX + (screenWidth - bounds.width) / 2;
        const newY = offsetY + (screenHeight - bounds.height) / 2;
        return this.moveWindow(owner, Math.round(newX), Math.round(newY));
    }
    /**
     * Get screen information
     */
    getScreenInfo() {
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const allDisplays = electron_1.screen.getAllDisplays();
        return {
            primary: primaryDisplay.size,
            workArea: primaryDisplay.workArea,
            displays: allDisplays.length,
        };
    }
}
exports.WindowController = WindowController;
//# sourceMappingURL=window-manager.js.map