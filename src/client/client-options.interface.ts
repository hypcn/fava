
export interface FavaClientConfig {

  /**
   * Provide an implementation for `fetch()`
   * 
   * E.g.: https://github.com/node-fetch/node-fetch
   */
  fetch: typeof fetch,

  /**
   * 
   * @default "http://localhost:6131"
   */
  origin?: string,

  routePrefix?: string,

  // TODO: auth?

}
