import m from "mithril";

export const Toolbar: m.Component<{}> = {
  view({ children }) {
    return m(".flex.items-stretch.bg-light", [
      children,
    ]);
  }
};
