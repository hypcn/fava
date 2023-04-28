import { FavaClient } from "../client";

const isDev =
  ["localhost", "127.0.0.1"].includes(location.hostname) &&
  ["5173", "5174", "5175"].includes(location.port);

const origin = isDev
  ? "http://localhost:6131"
  : location.origin;

export const fava = new FavaClient({
  // fetch
  origin,
  routePrefix: "",
});
