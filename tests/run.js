import assert from "node:assert";
import { maskOf, diffsOf, filledOf } from "../sparse.js";
import { step, close } from "../sparserun.js";
import { render } from "../app.js";

const base = {
  budget: 1,
  fields: [["a", 1], ["b", 2]],
  state: { packs: [], unpacks: [], ledger: [], applied: [] },
  events: [{ id: 1, kind: "pack", values: [1, 5] }],
  bad_values_code: "E_BAD_VALUES", bad_index_code: "E_BAD_INDEX",
  no_pack_code: "E_NO_PACK", event_error_code: "E_BAD_EVENT"
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("maskOf returns a number", () => {
  assert.strictEqual(typeof maskOf([["a", 1]], [4]), "number");
});

check("diffsOf returns a list", () => {
  assert.ok(Array.isArray(diffsOf([["a", 1]], [4])));
});

check("filledOf returns a list", () => {
  assert.ok(Array.isArray(filledOf([["a", 1]], 1, [["a", 4]])));
});

check("step returns a state", () => {
  assert.strictEqual(typeof step(base).state, "object");
});

check("render counts events", () => {
  assert.strictEqual(typeof render(base).count_events, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
