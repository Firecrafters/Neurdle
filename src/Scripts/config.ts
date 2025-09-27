/**
 * @fileoverview Game configuration constants for Neurdle
 * Contains timing and game rule constants used throughout the application
 */

/** Duration in milliseconds for tile flip animation when revealing letter status */
const FLIP_MS = 600;

/** Delay in milliseconds between each tile's animation to create staggered effect */
const STAGGER_MS = 240;

/** Maximum number of guess attempts allowed per game */
const MAX_ROWS = 6;

export { FLIP_MS, STAGGER_MS, MAX_ROWS }
