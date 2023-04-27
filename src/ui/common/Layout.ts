import m from "mithril";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout: m.Component<{}> = {

  view({ children }) {
    // return children;

    return m(".min-h-screen.flex.flex-col.items-stretch", [
      // m(Header),
      // m("main", [
        children,
      // ]),
      // m(Footer),
    ]);
  }

};
