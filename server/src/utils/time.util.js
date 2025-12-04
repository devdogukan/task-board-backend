/**
 * Converts expiration time string to milliseconds
 * Supports formats: d (days), h (hours), m (minutes), s (seconds)
 * Examples: "15d", "7d", "2h", "30m", "60s"
 *
 * @param {string} expiresIn - JWT expiration string (e.g., "15d", "2h", "30m")
 * @returns {number} - Expiration time in milliseconds
 */
export const parseExpirationToMs = (expiresIn) => {
    if (!expiresIn || typeof expiresIn !== 'string') {
        throw new Error('Invalid expiration format');
    }

    // Match number and unit (d, h, m, s)
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (!match) {
        throw new Error(
            `Invalid expiration format: ${expiresIn}. Expected format: number followed by d/h/m/s (e.g., "15d", "2h", "30m")`,
        );
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
        s: 1000, // seconds to milliseconds
        m: 60 * 1000, // minutes to milliseconds
        h: 60 * 60 * 1000, // hours to milliseconds
        d: 24 * 60 * 60 * 1000, // days to milliseconds
    };

    return value * multipliers[unit];
};
