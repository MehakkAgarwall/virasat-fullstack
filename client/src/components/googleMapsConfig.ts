// Keep the live-map loader bounded, but retry one missed map-initialization callback after a cold proxy load.
export const GOOGLE_MAP_READY_TIMEOUT_MS = 9_000;
export const GOOGLE_MAP_INITIALIZATION_ATTEMPTS = 2;
export const GOOGLE_MAP_NAMESPACE_GRACE_MS = 6_000;
