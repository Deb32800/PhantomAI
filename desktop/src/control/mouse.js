"use strict";
// Note: This uses robotjs or nut.js in production
// For now, we define the interface
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseController = void 0;
/**
 * Mouse Controller - Control mouse movement and clicks
 */
class MouseController {
    currentPosition = { x: 0, y: 0 };
    robot = null;
    constructor() {
        this.initializeRobot();
    }
    async initializeRobot() {
        try {
            // In production, use robotjs or nut.js
            // this.robot = require('robotjs');
            // or
            // const { mouse } = require('@nut-tree/nut-js');
            // this.robot = mouse;
        }
        catch (error) {
            console.warn('Robot module not available, mouse control will be simulated');
        }
    }
    /**
     * Move mouse to absolute position
     */
    async move(x, y, options) {
        if (options?.smooth) {
            await this.smoothMove(x, y, options.duration || 500);
        }
        else {
            this.instantMove(x, y);
        }
        this.currentPosition = { x, y };
    }
    /**
     * Move mouse smoothly with animation
     */
    async smoothMove(targetX, targetY, duration) {
        const startX = this.currentPosition.x;
        const startY = this.currentPosition.y;
        const steps = Math.max(10, Math.floor(duration / 16)); // ~60fps
        const stepDuration = duration / steps;
        for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            const x = startX + (targetX - startX) * eased;
            const y = startY + (targetY - startY) * eased;
            this.instantMove(Math.round(x), Math.round(y));
            await this.sleep(stepDuration);
        }
    }
    /**
     * Instant move without animation
     */
    instantMove(x, y) {
        if (this.robot) {
            this.robot.moveMouse(x, y);
        }
        this.currentPosition = { x, y };
    }
    /**
     * Click at current position
     */
    async click(button = 'left') {
        if (this.robot) {
            this.robot.mouseClick(button);
        }
        await this.sleep(50); // Small delay after click
    }
    /**
     * Double click at current position
     */
    async doubleClick() {
        if (this.robot) {
            this.robot.mouseClick('left', true);
        }
        else {
            await this.click('left');
            await this.sleep(50);
            await this.click('left');
        }
        await this.sleep(50);
    }
    /**
     * Triple click (select line/paragraph)
     */
    async tripleClick() {
        await this.click('left');
        await this.sleep(50);
        await this.click('left');
        await this.sleep(50);
        await this.click('left');
        await this.sleep(50);
    }
    /**
     * Click at specific position
     */
    async clickAt(x, y, button = 'left') {
        await this.move(x, y);
        await this.click(button);
    }
    /**
     * Scroll wheel
     */
    async scroll(direction, amount = 3) {
        if (this.robot) {
            const scrollAmount = direction === 'up' || direction === 'left' ? amount : -amount;
            if (direction === 'up' || direction === 'down') {
                this.robot.scrollMouse(0, scrollAmount);
            }
            else {
                this.robot.scrollMouse(scrollAmount, 0);
            }
        }
        await this.sleep(100);
    }
    /**
     * Drag from one point to another
     */
    async drag(startX, startY, endX, endY, options) {
        const button = options?.button || 'left';
        const duration = options?.duration || 500;
        // Move to start
        await this.move(startX, startY);
        await this.sleep(50);
        // Mouse down
        if (this.robot) {
            this.robot.mouseToggle('down', button);
        }
        await this.sleep(50);
        // Smooth move to end
        await this.smoothMove(endX, endY, duration);
        await this.sleep(50);
        // Mouse up
        if (this.robot) {
            this.robot.mouseToggle('up', button);
        }
    }
    /**
     * Hold mouse button
     */
    async hold(button = 'left') {
        if (this.robot) {
            this.robot.mouseToggle('down', button);
        }
    }
    /**
     * Release mouse button
     */
    async release(button = 'left') {
        if (this.robot) {
            this.robot.mouseToggle('up', button);
        }
    }
    /**
     * Get current mouse position
     */
    getPosition() {
        if (this.robot) {
            const pos = this.robot.getMousePos();
            this.currentPosition = { x: pos.x, y: pos.y };
        }
        return { ...this.currentPosition };
    }
    /**
     * Move relative to current position
     */
    async moveRelative(deltaX, deltaY, options) {
        const current = this.getPosition();
        await this.move(current.x + deltaX, current.y + deltaY, options);
    }
    /**
     * Hover over element (move and wait)
     */
    async hover(x, y, duration = 500) {
        await this.move(x, y, { smooth: true });
        await this.sleep(duration);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.MouseController = MouseController;
//# sourceMappingURL=mouse.js.map