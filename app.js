// app.js：渲染结果
import { maskOf, diffsOf, filledOf } from "./sparse.js";
import { step, close } from "./sparserun.js";

export function render(spec) {
  const events = spec.events || [];
  const half = Math.ceil(events.length / 2);
  const first = step(spec);
  const closed = close(Object.assign({}, spec, { state: first.state }));
  const r1 = step(Object.assign({}, spec, { events: events.slice(0, half) }));
  const r2 = step(Object.assign({}, spec, { state: r1.state, events: events.slice(half) }));
  const closedTwo = close(Object.assign({}, spec, { state: r2.state }));
  const replay = step(Object.assign({}, spec, { state: closed.state }));
  const wide = step(Object.assign({}, spec, { budget: spec.budget + 2 }));
  const full = step(Object.assign({}, spec, { events: events, budget: events.length + 2 }));
  const fullClosed = close(Object.assign({}, spec, { state: full.state }));
  const totalDiffs = function (state) {
    let sum = 0;
    for (const pack of state.packs) {
      sum += pack[1].length;
    }
    return sum;
  };
  const fingerprint = function (state) {
    return JSON.stringify({
      packs: state.packs, unpacks: state.unpacks, diffs: totalDiffs(state),
      ledger: state.ledger, applied: state.applied.length
    });
  };
  return { packs: closed.state.packs.map(function (pack) {
             return [pack[0], pack[1].map(function (pair) { return [pair[0], pair[1]]; })];
           }),
           unpacks: closed.state.unpacks.map(function (row) { return [row[0], row[1].slice()]; }),
           diffs: totalDiffs(closed.state),
           same: closed.state.packs.filter(function (pack) { return pack[0] === 0; }).length,
           served_first: first.served, served_wide: wide.served,
           pair_differs: first.served !== wide.served,
           ledger_before: first.ledger_before, ledger: first.ledger,
           catchup: closed.catchup, ledger_after: closed.state.ledger.length,
           mid_differs: fingerprint(r2.state) !== fingerprint(first.state),
           closed_equal: fingerprint(closedTwo.state) === fingerprint(closed.state),
           replay_new: replay.served, judged: first.judged, judged_bound: first.judged_bound,
           full_diff: fingerprint(closed.state) === fingerprint(fullClosed.state) ? 0 : 1,
           count_events: events.length,
           tail: maskOf([["a", 1], ["b", 2]], [1, 5]) + diffsOf([["a", 1], ["b", 2]], [1, 5]).length
             + filledOf([["a", 1], ["b", 2]], 2, [["b", 5]]).length };
}
