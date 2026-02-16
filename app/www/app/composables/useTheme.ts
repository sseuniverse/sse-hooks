import { themeIcons } from "../utils/theme";
import { omit } from "#ui/utils";
import colors from "tailwindcss/colors";

export function useTheme() {
  const appConfig = useAppConfig();
  const colorMode = useColorMode();

  const neutralColors = ["slate", "gray", "zinc", "neutral", "stone"];
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
      return appConfig.theme.radius;
    },
    set(option) {
      appConfig.theme.radius = option;
      window.localStorage.setItem(
        "sse-ui-radius",
        String(appConfig.theme.radius),
      );
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
      return appConfig.theme.font;
    },
    set(option) {
      appConfig.theme.font = option;
      window.localStorage.setItem("sse-ui-font", appConfig.theme.font);
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
      return appConfig.theme.icons;
    },
    set(option) {
      appConfig.theme.icons = option;
      appConfig.ui.icons = themeIcons[option as keyof typeof themeIcons] as any;
      window.localStorage.setItem("sse-ui-icons", appConfig.theme.icons);
    },
  });

  const modes = [
    { label: "light", icon: appConfig.ui.icons.light },
    { label: "dark", icon: appConfig.ui.icons.dark },
    { label: "system", icon: appConfig.ui.icons.system },
  ];
  const mode = computed({
    get() {
      return colorMode.value;
    },
    set(option) {
      colorMode.preference = option;
    },
  });

  function setBlackAsPrimary(value: boolean) {
    appConfig.theme.blackAsPrimary = value;
    window.localStorage.setItem("sse-ui-black-as-primary", String(value));
  }

  const hasCSSChanges = computed(() => {
    return (
      appConfig.theme.radius !== 0.25 ||
      appConfig.theme.blackAsPrimary ||
      appConfig.theme.font !== "Public Sans"
    );
  });

  const hasAppConfigChanges = computed(() => {
    return (
      appConfig.ui.colors.primary !== "green" ||
      appConfig.ui.colors.neutral !== "slate" ||
      appConfig.theme.icons !== "lucide"
    );
  });

  function resetTheme() {
    // Reset without triggering individual tracking events
    appConfig.ui.colors.primary = "green";
    window.localStorage.removeItem("sse-ui-primary");

    appConfig.ui.colors.neutral = "slate";
    window.localStorage.removeItem("sse-ui-neutral");

    appConfig.theme.radius = 0.25;
    window.localStorage.removeItem("sse-ui-radius");

    appConfig.theme.font = "Public Sans";
    window.localStorage.removeItem("sse-ui-font");

    appConfig.theme.icons = "lucide";
    appConfig.ui.icons = themeIcons.lucide as any;
    window.localStorage.removeItem("sse-ui-icons");

    appConfig.theme.blackAsPrimary = false;
    window.localStorage.removeItem("sse-ui-black-as-primary");
  }

  return {
    neutralColors,
    neutral,
    primaryColors,
    primary,
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
    hasAppConfigChanges,
    resetTheme,
  };
}
