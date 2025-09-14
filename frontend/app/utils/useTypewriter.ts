import { useState, useEffect } from 'react';

/**
 * A custom hook for creating a typewriter effect on a string.
 * @param text The text to be typed out.
 * @param speed The speed in milliseconds at which the text should be typed.
 * @returns The currently typed out string.
 */
export function useTypewriter(text: string, speed: number = 50) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let i = 0;
        // Reset the display text when the input text changes
        setDisplayText('');
        if (text) {
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    setDisplayText(prevText => prevText + text.charAt(i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, speed);

            // Cleanup interval on component unmount or text change
            return () => {
                clearInterval(typingInterval);
            };
        }
    }, [text, speed]);

    return displayText;
}
