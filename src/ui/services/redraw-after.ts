import m from "mithril";

export async function redrawAfter<T = any>(promise: Promise<T>): Promise<T> {
  return promise.then(res => {
    m.redraw();
    return res;
  }).catch(err => {
    m.redraw();
    throw err;
  });
}
