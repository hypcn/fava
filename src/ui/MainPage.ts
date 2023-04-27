import m from "mithril";
import { Footer } from "./common/Footer";

export const MainPage: m.Component<{}> = {

  view() {
    return m(".h-full.min-h-screen.max-h-screen.flex.flex-col", [

      m(".flex.items-stretch.bg-light.border.border-b-border", [
        m("button.btn-menu", "File"),
        m("button.btn-menu", "Edit"),
        m("button.btn-menu", "Help"),
      ]),

      m("main.flex-1", [

        m("h1", "Fava"),
        
        m("p", ""),
        m("p", "list locations"),
        m("p", `"current" folder view`),
        m("p", `another folder panel?`),
        m("p", `preview for selected files?`),




      ]),

      m(Footer),

    ]);
  }

};
