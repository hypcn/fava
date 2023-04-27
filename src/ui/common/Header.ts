import m from "mithril";
import { ROUTES } from "../routes";

export const Header: m.Component<{}> = {

  view() {

    // const homeCls = m.route.get() === ROUTES.home ? "border-primary" : "border-transparent";

    return m("header", [

      m(m.route.Link, {
        href: ROUTES.home,
        class: `mx-2 h-8 my-1 w-8 bg-white p-1 rounded-full`, // border ${homeCls}
      }, [
        m("img.object-contain", { src: "https://www.hypericon.co.uk/static/images/hypericon-favicon-100.png" }),
      ]),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.project) ? "active" : "",
      //   href: ROUTES.project,
      // }, "Project"),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.messages) ? "active" : "",
      //   href: ROUTES.messages,
      // }, "Messages"),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.protocols) ? "active" : "",
      //   href: ROUTES.protocols,
      // }, "Protocols"),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.devices) ? "active" : "",
      //   href: ROUTES.devices,
      // }, "Devices"),

      m(".flex-1"),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.dev) ? "active" : "",
      //   href: ROUTES.dev,
      // }, "DEV"),

      // m(m.route.Link, {
      //   class: m.route.get().startsWith(ROUTES.cloud) ? "active" : "",
      //   href: ROUTES.cloud,
      // }, "Cloud"),

    ]);

  }

};
