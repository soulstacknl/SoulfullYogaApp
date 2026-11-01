// Web: the browser's own localStorage; undefined while rendering static HTML on the server.
export const authStorage = typeof window === 'undefined' ? undefined : window.localStorage;
