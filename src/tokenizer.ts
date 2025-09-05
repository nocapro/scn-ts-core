import { Tiktoken } from "js-tiktoken/lite";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";
import { logger } from './logger';

let encoder: Tiktoken | null = null;

/**
 * Initializes the tokenizer. This is a lightweight, synchronous operation for the pure JS version.
 * It's safe to call this multiple times.
 * @returns {boolean} - True if initialization was successful, false otherwise.
 */
export function initializeTokenizer(): boolean {
    if (encoder) {
        return true;
    }
    try {
        encoder = new Tiktoken(cl100k_base);
        logger.debug('Tokenizer initialized.');
        return true;
    } catch (e) {
        logger.error("Failed to initialize tokenizer:", e);
        return false;
    }
}

/**
 * Counts the number of tokens in a given text string using the cl100k_base model.
 * The tokenizer will be initialized on the first call if it hasn't been already.
 *
 * @param {string} text - The text to count tokens for.
 * @returns {number} - The number of tokens, or 0 if tokenization fails.
 */
export function countTokens(text: string): number {
    if (!encoder) {
        const success = initializeTokenizer();
        if (!success) {
            return 0;
        }
    }

    if (!text || !encoder) {
        return 0;
    }

    try {
        return encoder.encode(text).length;
    } catch (e) {
        logger.error("Tokenization error:", e);
        return 0;
    }
}