export interface MouseOptions {
    smooth?: boolean;
    duration?: number;
}
export type MouseButton = 'left' | 'right' | 'middle';
/**
 * Mouse Controller - Control mouse movement and clicks
 */
export declare class MouseController {
    private currentPosition;
    private robot;
    constructor();
    private initializeRobot;
    /**
     * Move mouse to absolute position
     */
    move(x: number, y: number, options?: MouseOptions): Promise<void>;
    /**
     * Move mouse smoothly with animation
     */
    private smoothMove;
    /**
     * Instant move without animation
     */
    private instantMove;
    /**
     * Click at current position
     */
    click(button?: MouseButton): Promise<void>;
    /**
     * Double click at current position
     */
    doubleClick(): Promise<void>;
    /**
     * Triple click (select line/paragraph)
     */
    tripleClick(): Promise<void>;
    /**
     * Click at specific position
     */
    clickAt(x: number, y: number, button?: MouseButton): Promise<void>;
    /**
     * Scroll wheel
     */
    scroll(direction: 'up' | 'down' | 'left' | 'right', amount?: number): Promise<void>;
    /**
     * Drag from one point to another
     */
    drag(startX: number, startY: number, endX: number, endY: number, options?: {
        button?: MouseButton;
        duration?: number;
    }): Promise<void>;
    /**
     * Hold mouse button
     */
    hold(button?: MouseButton): Promise<void>;
    /**
     * Release mouse button
     */
    release(button?: MouseButton): Promise<void>;
    /**
     * Get current mouse position
     */
    getPosition(): {
        x: number;
        y: number;
    };
    /**
     * Move relative to current position
     */
    moveRelative(deltaX: number, deltaY: number, options?: MouseOptions): Promise<void>;
    /**
     * Hover over element (move and wait)
     */
    hover(x: number, y: number, duration?: number): Promise<void>;
    private sleep;
}
//# sourceMappingURL=mouse.d.ts.map