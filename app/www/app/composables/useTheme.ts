import { defu } from "defu";
import { useLocalStorage } from "@vueuse/core";
import { themeIcons, cssVariableDefaults } from "../utils/theme";
import { omit } from "#ui/utils";
import colors from "tailwindcss/colors";

function readLocalStorage<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useTheme() {
  const appConfig = useAppConfig();
  const colorMode = useColorMode();

  const aiThemeExtras = useState<Record<string, any>>("sse-ui-ai-theme", () =>
    readLocalStorage("sse-ui-ai-theme", {}),
  );

  const customColorsData = useState<Record<string, Record<string, string>>>(
    "sse-ui-custom-colors",
    () => readLocalStorage("sse-ui-custom-colors", {}),
  );

  const cssVariablesData = useState<{
    light?: Record<string, string>;
    dark?: Record<string, string>;
  }>("sse-ui-css-variables", () =>
    readLocalStorage("sse-ui-css-variables", {}),
  );

  const _radius = useLocalStorage("sse-ui-radius", 0.25);
  const _font = useLocalStorage("sse-ui-font", "Public Sans");
  const _iconSet = useLocalStorage("sse-ui-icons", "lucide");
  const _blackAsPrimary = useLocalStorage("sse-ui-black-as-primary", false);

  const neutralColors = [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "taupe",
    "mauve",
    "mist",
    "olive",
  ];

  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral;
    },
    set(option) {
      appConfig.ui.colors.neutral = option;
      window.localStorage.setItem(
        "sse-ui-neutral",
        appConfig.ui.colors.neutral,
      );
    },
  });

  const colorsToOmit = [
    "inherit",
    "current",
    "transparent",
    "black",
    "white",
    ...neutralColors,
  ];

  const primaryColors = Object.keys(omit(colors, colorsToOmit as any));
  const primary = computed({
    get() {
      return appConfig.ui.colors.primary;
    },
    set(option) {
      appConfig.ui.colors.primary = option;
      window.localStorage.setItem(
        "sse-ui-primary",
        appConfig.ui.colors.primary,
      );
      setBlackAsPrimary(false);
    },
  });

  const radiuses = [0, 0.125, 0.25, 0.375, 0.5];
  const radius = computed({
    get() {
      return _radius.value;
    },
    set(option) {
      _radius.value = option;
    },
  });

  const fonts = [
    "Public Sans",
    "DM Sans",
    "Geist",
    "Inter",
    "Poppins",
    "Outfit",
    "Raleway",
  ];

  const font = computed({
    get() {
      return _font.value;
    },
    set(option) {
      _font.value = option;
    },
  });

  const icons = [
    {
      label: "Lucide",
      icon: "i-lucide-feather",
      value: "lucide",
    },
    {
      label: "Phosphor",
      icon: "i-ph-phosphor-logo",
      value: "phosphor",
    },
    {
      label: "Tabler",
      icon: "i-tabler-brand-tabler",
      value: "tabler",
    },
  ];

  const icon = computed({
    get() {
      return _iconSet.value;
    },
    set(option) {
      _iconSet.value = option;
      appConfig.ui.icons = themeIcons[option as keyof typeof themeIcons] as any;
    },
  });

  const modes = computed(() => [
    { label: "light", icon: appConfig.ui.icons.light },
    { label: "dark", icon: appConfig.ui.icons.dark },
    { label: "system", icon: appConfig.ui.icons.system },
  ]);

  const mode = computed({
    get() {
      return colorMode.value;
    },
    set(option) {
      colorMode.preference = option;
    },
  });

  const blackAsPrimary = computed(() => _blackAsPrimary.value);

  function setBlackAsPrimary(value: boolean) {
    _blackAsPrimary.value = value;
  }

  const hasCustomColors = computed(
    () => Object.keys(customColorsData.value).length > 0,
  );

  const hasCSSVariables = computed(
    () =>
      Object.keys(cssVariablesData.value.light || {}).length > 0 ||
      Object.keys(cssVariablesData.value.dark || {}).length > 0,
  );

  const radiusStyle = computed(
    () => `:root { --ui-radius: ${_radius.value}rem; }`,
  );

  const blackAsPrimaryStyle = computed(() =>
    _blackAsPrimary.value
      ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }`
      : ":root {}",
  );

  const fontStyle = computed(
    () => `:root { --font-sans: '${_font.value}', sans-serif; }`,
  );

  const customColorsStyle = computed(() => {
    const entries = Object.entries(customColorsData.value);
    if (!entries.length) return "";
    const vars = entries.flatMap(([name, shades]) =>
      Object.entries(shades).map(
        ([shade, hex]) => `--color-${name}-${shade}: ${hex};`,
      ),
    );
    return `:root { ${vars.join(" ")} }`;
  });

  const cssVariablesStyle = computed(() => {
    const data = cssVariablesData.value;
    const parts: string[] = [];
    if (Object.keys(data.light || {}).length) {
      const full = { ...cssVariableDefaults.light, ...data.light };
      parts.push(
        `.light { ${Object.entries(full)
          .map(([k, v]) => `${k}: ${v};`)
          .join(" ")} }`,
      );
    }

    if (Object.keys(data.dark || {}).length) {
      const full = { ...cssVariableDefaults.dark, ...data.dark };
      parts.push(
        `.dark { ${Object.entries(full)
          .map(([k, v]) => `${k}: ${v};`)
          .join(" ")} }`,
      );
    }
    return parts.join(" ");
  });

  const link = computed(() => {
    const name = _font.value;
    if (name === "Public Sans") return [];
    return [
      {
        rel: "stylesheet" as const,
        href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;500;600;700&display=swap`,
        id: `font-${name.toLowerCase().replace(/\s+/g, "-")}`,
      },
    ];
  });

  const style = [
    { innerHTML: radiusStyle, id: "sse-ui-radius", tagPriority: -2 },
    {
      innerHTML: blackAsPrimaryStyle,
      id: "sse-ui-black-as-primary",
      tagPriority: -2,
    },
    { innerHTML: fontStyle, id: "sse-ui-font", tagPriority: -2 },
    { innerHTML: customColorsStyle, id: "chat-custom-colors", tagPriority: -2 },
    { innerHTML: cssVariablesStyle, id: "chat-css-variables", tagPriority: -2 },
  ];

  const hasCSSChanges = computed(() => {
    return (
      _radius.value !== 0.25 ||
      _blackAsPrimary.value ||
      _font.value !== "Public Sans" ||
      hasCustomColors.value ||
      hasCSSVariables.value
    );
  });

  const hasConfigChanges = computed(() => {
    return (
      appConfig.ui.colors.primary !== "green" ||
      appConfig.ui.colors.neutral !== "slate" ||
      _iconSet.value !== "lucide" ||
      !!aiThemeExtras.value.colors ||
      !!aiThemeExtras.value.ui
    );
  });

  function injectCustomColors(
    customColors: Record<string, Record<string, string>>,
  ) {
    const merged = { ...customColorsData.value, ...customColors };
    customColorsData.value = merged;
    window.localStorage.setItem("sse-ui-custom-colors", JSON.stringify(merged));
  }

  function injectCSSVariables(cssVariables: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
  }) {
    const merged = {
      light: { ...cssVariablesData.value.light, ...cssVariables.light },
      dark: { ...cssVariablesData.value.dark, ...cssVariables.dark },
    };
    cssVariablesData.value = merged;
    window.localStorage.setItem("sse-ui-css-variables", JSON.stringify(merged));
  }

  function applyThemeSettings(settings: Record<string, any>) {
    if (settings.customColors && typeof settings.customColors === "object") {
      injectCustomColors(settings.customColors);
    }

    if (settings.cssVariables && typeof settings.cssVariables === "object") {
      injectCSSVariables(settings.cssVariables);
    }

    if (settings.primary) primary.value = settings.primary;
    if (settings.neutral) neutral.value = settings.neutral;
    if (settings.radius !== undefined) radius.value = settings.radius;
    if (settings.font) font.value = settings.font;
    if (settings.icons && settings.icons in themeIcons)
      icon.value = settings.icons;
    if (settings.blackAsPrimary !== undefined)
      setBlackAsPrimary(!!settings.blackAsPrimary);

    const colorKeys = [
      "secondary",
      "success",
      "info",
      "warning",
      "error",
    ] as const;

    const savedExtras: Record<string, any> = { ...aiThemeExtras.value };

    for (const color of colorKeys) {
      if (settings[color]) {
        (appConfig.ui.colors as any)[color] = settings[color];
        savedExtras.colors = savedExtras.colors || {};
        savedExtras.colors[color] = settings[color];
      }
    }

    if (settings.ui) {
      savedExtras.ui = savedExtras.ui || {};
      for (const [key, value] of Object.entries(settings.ui)) {
        if (key === "colors") continue;

        const merged = defu(
          value as Record<string, any>,
          (appConfig.ui as any)[key] || {},
          savedExtras.ui[key] || {},
        );
        (appConfig.ui as any)[key] = merged;
        savedExtras.ui[key] = merged;
      }
    }

    aiThemeExtras.value = savedExtras;
    window.localStorage.setItem("sse-ui-ai-theme", JSON.stringify(savedExtras));
  }

  function resetTheme() {
    appConfig.ui.colors.primary = "green";
    window.localStorage.removeItem("sse-ui-primary");

    appConfig.ui.colors.neutral = "slate";
    window.localStorage.removeItem("sse-ui-neutral");

    _radius.value = 0.25;
    _font.value = "Public Sans";
    _iconSet.value = "lucide";
    appConfig.ui.icons = themeIcons.lucide as any;
    _blackAsPrimary.value = false;

    const defaultColors: Record<string, string> = {
      secondary: "blue",
      success: "green",
      info: "blue",
      warning: "yellow",
      error: "red",
    };

    const extras = aiThemeExtras.value;
    if (extras.colors) {
      for (const key of Object.keys(extras.colors)) {
        (appConfig.ui.colors as any)[key] =
          defaultColors[key] || (appConfig.ui.colors as any)[key];
      }
    }

    if (extras.ui) {
      for (const key of Object.keys(extras.ui)) {
        if (key === "colors" || key === "icons") continue;
        (appConfig.ui as any)[key] = undefined;
      }
    }

    window.localStorage.removeItem("sse-ui-ai-theme");
    window.localStorage.removeItem("sse-ui-custom-colors");
    window.localStorage.removeItem("sse-ui-css-variables");
    aiThemeExtras.value = {};
    customColorsData.value = {};
    cssVariablesData.value = {};

    if (import.meta.client) {
      document.getElementById("chat-css-variables")?.replaceChildren();
      document.getElementById("chat-custom-colors")?.replaceChildren();
    }
  }

  return {
    style,
    link,
    neutralColors,
    neutral,
    primaryColors,
    primary,
    blackAsPrimary,
    setBlackAsPrimary,
    radiuses,
    radius,
    fonts,
    font,
    icon,
    icons,
    modes,
    mode,
    hasCSSChanges,
    hasConfigChanges,
    applyThemeSettings,
    resetTheme,
  };
}
