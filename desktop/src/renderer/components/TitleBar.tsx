import React from 'react';

export function TitleBar() {
    const handleClose = () => window.phantom?.closeWindow();
    const handleMinimize = () => window.phantom?.minimizeWindow();
    const handleMaximize = () => window.phantom?.maximizeWindow();

    return (
        <header className="title-bar">
            <div className="title-bar-left">
                <div className="traffic-lights">
                    <button
                        className="traffic-light close"
                        onClick={handleClose}
                        aria-label="Close"
                    />
                    <button
                        className="traffic-light minimize"
                        onClick={handleMinimize}
                        aria-label="Minimize"
                    />
                    <button
                        className="traffic-light maximize"
                        onClick={handleMaximize}
                        aria-label="Maximize"
                    />
                </div>
            </div>

            <div className="title-bar-center">
                Phantom AI
            </div>

            <div className="title-bar-right">
                {/* Could add status indicators here */}
            </div>
        </header>
    );
}
