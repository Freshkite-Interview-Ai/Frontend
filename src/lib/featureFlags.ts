/**
 * Central feature flags.
 *
 * Flip a flag back to `true` to re-enable the feature — no code was removed,
 * every entry point is simply gated on these constants.
 */

/**
 * Recruitment tests (candidate `/recruitment-tests/*` and company `/company/tests/*`).
 * Disabled: hidden from all navigation and blocked at the route level.
 */
export const TESTS_FEATURE_ENABLED = false;
