// Shim cross-fetch to use native browser fetch
export const fetch = globalThis.fetch;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
export default globalThis.fetch;
