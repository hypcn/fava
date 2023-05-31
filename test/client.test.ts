import { SimpleLogger } from "@hypericon/axe";
import urljoin from "url-join";
import { Fava } from "../src";
import { FavaClient } from "../src/client";

const testLogger: SimpleLogger = {
  error: (...mgs: any[]) => { /* noop */ },
  debug: (...mgs: any[]) => { /* noop */ },
  log: (...mgs: any[]) => { /* noop */ },
  warn: (...mgs: any[]) => { /* noop */ },
  verbose: (...mgs: any[]) => { /* noop */ },
};

describe("Fava client", () => {

  test("can be created", () => {
    const favaClient = new FavaClient({});
    expect(favaClient).toBeDefined();
  });

  test("can be created with options", () => {
    const origin = "http://example.com";
    const routePrefix = "a/route/prefix";

    const favaClient = new FavaClient({
      origin: "http://example.com",
      routePrefix: "a/route/prefix",
    });

    expect(favaClient).toBeDefined();
    expect(favaClient.apiPrefix).toBe(urljoin(origin, routePrefix, "api"));
  });

  test("calls the Fava HTTP API", async () => {

    const fava = new Fava({
      getLogger: (_) => testLogger,
      http: true,
      locations: [],
    });
    await fava.onReady;

    const favaClient = new FavaClient({
      origin: "http://example.com",
      routePrefix: "a/route/prefix",
    });




    await fava.destroy();
  });

});
