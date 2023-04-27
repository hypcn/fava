import m from "mithril";

export const Footer: m.Component<{}> = {

  view() {
    return m("footer.flex.items-center.px-2.space-x-4", {
      class: `bg-light border border-t-border`,
    }, [

      m(".py-1.text-sm", [
        m("span", "Fava by "),
        m("a.link", {
          href: "https://hypericon.co.uk",
        }, "Hypericon"),
      ]),

      m("a.hover:text-link", {
        href: "https://github.com/hypcn/fava",
      }, m("i.fab.fa-github"))

    ]);
  }

};
