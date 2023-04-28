import m, { redraw } from "mithril";
import { Footer } from "./components/Footer";
import { ListView } from "../client";
import { fava } from "./fava";
import { FavaLocation } from "../shared";
import { redrawAfter } from "./services/redraw-after";

let locations: FavaLocation[] = [];
const listView = new ListView(fava, undefined);

export const MainPage: m.Component<{}> = {

  oninit() {
    fava.getLocations().then(res => {
      locations = res.locations;
      redraw();
    });
  },

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

        m("hr"),

        // Left
        m(".flex.items-stretch", [

          m(".flex.flex-col", {
            style: `width: 200px;`,
          }, [
            m("span", "Locations:"),
            locations.length === 0 ? [
              m("span.text-hint", "No locations"),
            ] : [
              locations.map(loc => {
                return m("button.text-left.hover:text-link", {
                  onclick: () => redrawAfter(listView.selectLocation(loc)),
                }, [
                  `${loc.type} ${loc.id} ${loc.name}`,
                ])
              }),
            ],
          ]),

          m(".flex-1.flex.flex-col.items-stretch", [
            m("span", `Current Path: ${listView.path}`),

            listView.files === undefined ? [
              m("span.text-hint", "Loading files..."),
            ] : [
              listView.files.length === 0 ? [
                m("span.text-hint", "This directory is empty"),
              ] : [
                listView.files.map(fileInfo => {
                  return m(".flex", [
                    fileInfo.filename,
                  ]);
                }),
              ],
            ],

          ]),

          m("", {
            style: `width: 200px;`,
          }, [
            "details of selected",
          ]),

        ]),




      ]),

      m(Footer),

    ]);
  }

};
