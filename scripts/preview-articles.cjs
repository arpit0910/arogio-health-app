/* global __dirname */
// Renders real library components with reference-only fixtures, without network access.
const fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  ts = require("typescript");
globalThis.__DEV__ = false;
const root = path.resolve(__dirname, ".."),
  resolve = Module._resolveFilename,
  load = Module._load;
const width = Number(process.argv[2] || 390),
  expanded = process.argv.includes("--large-text");
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === "react-native") request = "react-native-web";
  if (request === "react-native-svg")
    request = path.join(
      root,
      "node_modules/react-native-svg/lib/commonjs/ReactNativeSVG.web.js",
    );
  if (
    parent?.filename.includes("react-native-svg") &&
    (request === "./elements" || request === "../elements")
  )
    request += ".web";
  return resolve.call(this, request, parent, ...rest);
};
for (const extension of [".ts", ".tsx"])
  Module._extensions[extension] = (module, file) =>
    module._compile(
      ts.transpileModule(fs.readFileSync(file, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
      file,
    );
for (const extension of [".jpg", ".png"])
  Module._extensions[extension] = (module, file) => {
    module.exports = {
      uri: `data:image/${extension === ".jpg" ? "jpeg" : "png"};base64,${fs.readFileSync(file).toString("base64")}`,
    };
  };
const React = require("react"),
  ReactDOM = require("react-dom/server"),
  { View, Text, AppRegistry } = require("react-native-web");
const { colors, fonts } = require("../src/theme/tokens.ts");
const fixtures = [
  [
    "Vedic Wisdom for Modern Stress: Ashwagandha & Cortisol Balance",
    "Clinical trials meet ancient Rasayana medicine: How Withania somnifera regulates adrenals,...",
    "Ayush Care",
  ],
  [
    "Managing Fasting Blood Sugar: Simple Indian Diet Changes",
    "Replacing polished white rice with sprouted pulses, methi dana infusions,...",
    "Diabetes Care",
  ],
  [
    "The Science of 7-Hour Sleep for Cardiac Longevity",
    "How regular nocturnal REM and deep slow-wave sleep reduce arterial...",
    "Heart Health",
  ],
  [
    "Traditional Kadha Recipes for Seasonal Immunity",
    "Tulsi, black pepper, mulethi, and giloy: The exact temperature ratios and...",
    "Ayush Certified",
  ],
  [
    "Hydration Hacks Beyond Plain Water: Infusions for Daily Life",
    "Natural electrolyte replenishment using sattu water, buttermilk with roasted...",
    "Daily Wellness",
  ],
  [
    "Understanding Thyroid Signals: What Your Blood Tests Mean",
    "Deciphering TSH, Free T3, and Free T4. Identifying early warning flags of...",
    "Diagnostics",
  ],
].map(([title_en, excerpt_en, category], i) => ({
  id: `reference-${i}`,
  title_en,
  title_hi: "",
  excerpt_en,
  excerpt_hi: "",
  category,
  category_hi: "",
  reading_minutes_en: [5, 4, 6, 3, 4, 7][i],
  thumbnail_url: "",
  image_url: "",
  author_name: i === 2 ? "Dr. Rohan Mehta, DM (Cardio)" : "Arogio editorial",
  created_at: "2026-11-15T00:00:00Z",
}));
Module._load = function (request, parent, ...rest) {
  if (request === "react-native")
    return {
      ...load.call(this, request, parent, ...rest),
      useWindowDimensions: () => ({
        width,
        height: 844,
        fontScale: expanded ? 1.3 : 1,
        scale: 1,
      }),
      Text: (props) => {
        const native = load.call(this, request, parent, ...rest);
        const style = native.StyleSheet.flatten(props.style) || {};
        return React.createElement(Text, {
          ...props,
          style: [
            props.style,
            expanded
              ? {
                  fontSize: (style.fontSize || 14) * 1.3,
                  lineHeight: (style.lineHeight || style.fontSize || 14) * 1.5,
                }
              : {},
          ],
        });
      },
    };
  if (request === "expo-secure-store") return {};
  if (request.endsWith("/LanguageProvider"))
    return {
      useTranslation: () => ({
        t: (value) => value || "",
        language: "en",
        locale: "en-IN",
      }),
    };
  if (request.endsWith("/AppearanceProvider"))
    return {
      usePalette: () => colors,
      useAppTheme: () => ({
        ...colors,
        teal: colors.primary,
        white: colors.surface,
        fonts,
      }),
    };
  if (request === "expo-router")
    return { useRouter: () => ({ push() {}, navigate() {} }) };
  if (request === "react-native-safe-area-context")
    return {
      useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
  if (request.endsWith("/care-directory/api")) return { publicApi: {} };
  if (request.endsWith("/configuration/environment"))
    return { env: { apiUrl: "https://example.invalid/api/v1" } };
  if (request === "@tanstack/react-query")
    return {
      useInfiniteQuery: () => ({
        data: { pages: [{ items: fixtures, total: 128 }] },
        isPending: false,
        isRefetching: false,
      }),
      useQuery: (options) => ({
        data:
          options.queryKey[0] === "article-categories"
            ? [
                { name: "Ayush & Ayurveda", name_hi: "", count: 20 },
                { name: "Nutrition", name_hi: "", count: 18 },
              ]
            : [],
        isPending: false,
        isRefetching: false,
      }),
    };
  if (request.endsWith("/AppScreen"))
    return {
      AppScreen: ({ title, action, children }) => {
        const { AppIcon } = require("../src/components/app/AppIcon.tsx");
        const {
          StandaloneAppNavigation,
        } = require("../src/navigation/AppNavigation.tsx");
        return React.createElement(
          View,
          { style: { width, backgroundColor: colors.background } },
          React.createElement(
            View,
            {
              style: {
                height: 64,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              },
            },
            React.createElement(AppIcon, {
              name: "back",
              size: 20,
              color: colors.ink,
            }),
            React.createElement(
              Text,
              {
                style: {
                  flex: 1,
                  fontFamily: fonts.semibold,
                  fontSize: 18,
                  color: colors.ink,
                },
              },
              title,
            ),
            action,
          ),
          children,
          React.createElement(StandaloneAppNavigation, {
            selected: "articles",
          }),
        );
      },
    };
  return load.call(this, request, parent, ...rest);
};
const {
  ArticlesLibraryScreen,
} = require("../src/features/articles/ArticlesLibraryScreen.tsx");
AppRegistry.registerComponent("ArticlesPreview", () => ArticlesLibraryScreen);
const { element, getStyleElement } =
  AppRegistry.getApplication("ArticlesPreview");
const markup = ReactDOM.renderToStaticMarkup(element),
  css = ReactDOM.renderToStaticMarkup(getStyleElement());
const fontCSS = [
  ["dm-sans", "DMSans", "400Regular"],
  ["dm-sans", "DMSans", "500Medium"],
  ["plus-jakarta-sans", "PlusJakartaSans", "600SemiBold"],
  ["plus-jakarta-sans", "PlusJakartaSans", "700Bold"],
]
  .map(
    ([pkg, family, weight]) =>
      `@font-face{font-family:${family}_${weight};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root, `node_modules/@expo-google-fonts/${pkg}/${weight}/${family}_${weight}.ttf`)).toString("base64")})}`,
  )
  .join("");
const out = path.join(root, ".tmp/articles-preview");
fs.mkdirSync(out, { recursive: true });
const filename = path.join(
  out,
  `articles-${width}${expanded ? "-large" : ""}.html`,
);
fs.writeFileSync(
  filename,
  `<!doctype html><html><head><meta charset="utf-8">${css}<style>${fontCSS}html,body{margin:0;width:${width}px;background:${colors.background}}${expanded ? "input{font-size:130%!important;line-height:1.5!important}" : ""}</style></head><body>${markup}</body></html>`,
);
console.log(filename);
