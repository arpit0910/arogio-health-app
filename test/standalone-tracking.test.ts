import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

type Element = { type: unknown; props: Record<string, unknown> };
function medicineForm(allowed: boolean) {
  const saves: { path: string; body: Record<string, unknown> }[] = [];
  const feedback: unknown[][] = [];
  const draft = {
    id: "fixture-medicine",
    name: "Saved medicine",
    notes: "",
    enabled: true,
    doses: [{ time: "08:00", amount: "1 tablet" }],
  };
  let state = 0;
  const component = (props: Record<string, unknown>) => props;
  const jsx = (type: unknown, props: Record<string, unknown>) => ({
    type,
    props,
  });
  const dependencies: Record<string, unknown> = {
    react: {
      useState: (initial: unknown) => [
        state++ === 0 ? draft : initial,
        () => {},
      ],
    },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { Text: component, View: component },
    "expo-crypto": { randomUUID: () => "fixture" },
    "../../components/app/AppScreen": { AppScreen: component },
    "../../components/app/CareUI": { useCareStyles: () => ({}) },
    "../../components/ui/Button": { Button: component },
    "./TrackingVisuals": { TrackingIntro: component },
    "./TrackingFeedback": {
      TrackingFeedback: component,
      useTrackingFeedback: () => ({
        feedback: null,
        setFeedback: (...args: unknown[]) => feedback.push(args),
      }),
    },
    "../../components/app/AppIcon": { AppIcon: component },
    "./WellnessContext": {
      useWellness: () => ({
        data: { medicines: [] },
        loading: false,
        busy: false,
        notice: null,
        save: async (path: string, body: Record<string, unknown>) => {
          saves.push({ path, body });
          return true;
        },
      }),
    },
    "./TrackingUI": {
      Check: component,
      Field: component,
      Group: component,
      TrackingStatus: component,
      confirmDelete: () => {},
      useTrackingStyles: () => ({}),
    },
    "./TimeField": { TimeField: component },
    "./notifications": { requestReminderPermission: async () => allowed },
    "../../lib/time": { formatClock: (value: string) => value },
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(
    readFileSync(
      new URL("../src/features/wellness/MedicineScreen.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    require: (name: string) => {
      if (!(name in dependencies))
        throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  const root = (
    module.exports as { MedicineScreen: () => Element }
  ).MedicineScreen();
  function find(value: unknown): Element | null {
    if (Array.isArray(value)) {
      for (const child of value) {
        const result = find(child);
        if (result) return result;
      }
      return null;
    }
    if (!value || typeof value !== "object" || !("props" in value)) return null;
    const element = value as Element;
    return element.props.title === "Save medicine"
      ? element
      : find(element.props.children);
  }
  const save = find(root);
  assert.ok(save, "Medicine form exposes a Save action");
  return {
    saves,
    feedback,
    submit: async () => {
      (save.props.onPress as () => void)();
      await new Promise<void>((resolve) => setImmediate(resolve));
    },
  };
}
describe("Medicine saving without notification permission", () => {
  it("keeps the medicine and dose times when notifications are declined", async () => {
    const form = medicineForm(false);
    await form.submit();
    assert.equal(form.saves.length, 1);
    assert.equal(form.saves[0].path, "medicines/fixture-medicine");
    assert.equal(form.saves[0].body.enabled, false);
    assert.equal(form.saves[0].body.name, "Saved medicine");
    assert.equal(
      (form.saves[0].body.doses as { time: string }[])[0].time,
      "08:00",
    );
    assert.match(
      String(form.feedback[0][0]),
      /Medicine saved.*Notifications are off/,
    );
  });
  it("retains reminder opt-in when device permission is granted", async () => {
    const form = medicineForm(true);
    await form.submit();
    assert.equal(form.saves[0].body.enabled, true);
  });
});
