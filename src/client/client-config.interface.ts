
export interface FavaClientConfig {

  /**
   * 
   * @default "http://localhost:6131"
   */
  origin?: string,

  routePrefix?: string,

  // TODO: auth?

  // /**
  //  * Provide an implementation for `fetch()` when using the client on the server
  //  * 
  //  * E.g.: https://github.com/node-fetch/node-fetch
  //  */
  // fetch?: typeof fetch,

}
