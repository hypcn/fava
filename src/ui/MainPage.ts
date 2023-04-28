import m, { redraw } from "mithril";
import { Footer } from "./components/Footer";
import { ListView } from "../client";
import { fava } from "./fava";
import { FavaLocation, FileInfo } from "../shared";
import { redrawAfter } from "./services/redraw-after";
import { FileListTable } from "./components/FileListTable";

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

      m("main.flex-1.flex.flex-col.overflow-auto", [

        m("h1", "Fava"),

        m("p", ""),
        m("p", "list locations"),
        m("p", `"current" folder view`),
        m("p", `another folder panel?`),
        m("p", `preview for selected files?`),

        m("hr"),

        // Main stuff
        m(".flex-1.flex.items-stretch.overflow-auto", [

          m(".flex.flex-col.shrink-0.border-r.border-border", {
            class: "p-2",
            style: `width: 200px;`,
          }, [

            m("span.font-semibold", "Locations:"),

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

          m(".flex-1.flex.flex-col.items-stretch.overflow-auto", [

            m("span.font-semibold", `Current Path: ${listView.path}`),

            m(FileListTable, {
              message: (listView.location === undefined) ? "Select a location" :
                (listView.files === undefined) ? "Loading files..." :
                  (listView.files.length === 0) ? "This directory is empty" :
                undefined,
              files: listView.files ?? [],
              selected: listView.selection,

              click: (file, index) => listView.select(file),
              ctrlclick: (file, index) => listView.toggleSelected(file),
              shiftclick: (file, index) => listView.selectTo(file),
              dblclick: (file, index) => {
                if (file.isDir) {
                  redrawAfter(listView.navitageTo(file.fullpath));
                } else {
                  console.log(`open/preview file: ${file.filename}`);
                }
              },
            }),

          ]),

          m(".flex.flex-col.items-stretch.shrink-0.border-l.border-border", {
            class: "p-2",
            style: `width: 200px;`,
          }, [

            m("span.font-semibold", "Details"),

            m("span", "details of selected"),

          ]),

        ]),

      ]),

      m(Footer),

    ]);
  }

};

const FileListItem: m.Component<{
  fileInfo: FileInfo,
  click: () => any,
  check: () => any,
  uncheck: () => any,
}> = {
  view({ attrs }) {

    return m(".flex", {}, [
      m(".w-12", "icon"),
      m(".flex-1", "icon"),
    ]);

  }
};
