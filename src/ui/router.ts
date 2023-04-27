import m from "mithril";
import { Layout } from "./common/Layout";
import { MainPage } from "./MainPage";
import { ROUTES } from "./routes";

const DEFAULT_ROUTE = ROUTES.home;

const routeDefs: m.RouteDefs = {};

routeDefs[ROUTES.home] = { render: () => m(Layout, m(MainPage)) };
// routeDefs[ROUTES.project] = { render: () => m(Layout, m(ProjectPage)) };
// routeDefs[ROUTES.messages] = { render: () => m(Layout, m(MessagesPage)) };
// routeDefs[ROUTES.protocols] = { render: () => m(Layout, m(ProtocolsPage)) };
// routeDefs[ROUTES.devices] = { render: () => m(Layout, m(DevicesPage)) };

// routeDefs[ROUTES.cloud] = { render: () => m(Layout, m(CloudPage)) };
// routeDefs[ROUTES.dev] = { render: () => m(Layout, m(DevPage)) };

const appEl = document.querySelector<HTMLDivElement>('#app')!;
m.route(appEl, DEFAULT_ROUTE, routeDefs);
