import m from "mithril";
import { FileInfo } from "../../shared";
import { localDateTime } from "../services/local-date-time";

export type CellDisplayFn<T> = (item: T, index: number) => string | number | boolean | m.Vnode<any, any> | null | undefined;

const columns: { label: string, display: CellDisplayFn<FileInfo> }[] = [
  {
    label: "",
    display: f => {
      return m("i.text-center.text-hint", {
        class: f.isDir ? "fas fa-folder" : "fas fa-file",
      });
    }
  },
  {
    label: "Name",
    display: f => {
      return m("span.block.truncate", { style: "max-width: 500px;" }, f.filename);
    }
  },
  {
    label: "Modified",
    display: f => {
      const date = new Date(Math.max(f.changed, f.modified));
      return localDateTime(date);
    }
  },
  {
    label: "Type",
    display: f => {
      let type = "File";
      if (f.isDir) type = "Folder";
      if (f.mimeType) type = f.mimeType;
      return m("span.block.truncate", { style: "max-width: 200px;" }, type);
    },
  },
  { label: "Size", display: f => f.isDir ? "" : `${f.size} B` },
];

export const FileListTable: m.Component<{
  /** Used for loading, "select location" message, etc. */
  message?: string,
  files: FileInfo[],
  selected?: FileInfo[],

  // columns
  // sort

  click: (file: FileInfo, index: number) => any,
  ctrlclick: (file: FileInfo, index: number) => any,
  shiftclick: (file: FileInfo, index: number) => any,
  dblclick: (file: FileInfo, index: number) => any,

  class?: string,
  style?: string,
}, {}> = {

  view({ attrs }) {

    return m("table.table-auto.select-none", {
      class: attrs.class,
      style: attrs.style,
    }, [

      m("thead", [
        m("tr", [
          columns.map(col => {
            return m("th.font-semibold", [
              col.label,
            ]);
          }),
        ]),
      ]),

      m("tbody", [

        attrs.message ? [

          m("tr", [
            m("td.text-center.text-hint", {
              colspan: columns.length,
            }, attrs.message),
          ])

        ] : [

          attrs.files.map((item, index) => {
            const isSelected = (attrs.selected ?? []).includes(item);
            return m("tr.cursor-pointer", {
              class: `${isSelected ? "bg-highlight/20 hover:bg-highlight/30" : "hover:bg-highlight/10"}`,
              onclick: (ev: MouseEvent) => {
                if (ev.shiftKey) {
                  attrs.shiftclick(item, index);
                } else if (ev.ctrlKey) {
                  attrs.ctrlclick(item, index);
                } else {
                  attrs.click(item, index);
                }
              },
              ondblclick: () => attrs.dblclick(item, index),
            }, [
              columns.map((col, index) => {
                return m("td.px-1.whitespace-nowrap", [
                  col.display?.(item, index),
                ]);
              }),
            ]);
          }),

        ],

      ]),

    ]);

  }

};
