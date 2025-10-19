import "./styles/main.css"
import { useDebugStore, type StorePlatform } from "./store";
import { render, type VNode, h, createVNode, ref, type App } from "vue";
import TemplateDialog from "./components/TemplateDialog.vue";
import ActionDialog from "./components/ActionDialog.vue";

const ACTION_DIALOG_NAME = "Action Dialog";
let logToConsole = true;

function handleKeyDown(event: KeyboardEvent) {
  const store = useDebugStore();
  for (const dialog of store.dialogs.value) {
    let ctrlKey = dialog.shortcut?.includes("CTRL");
    let altKey = dialog.shortcut?.includes("ALT");
    let shiftKey = dialog.shortcut?.includes("SHIFT");
    if (
      (ctrlKey && !event.ctrlKey && !event.metaKey) ||
      (altKey && !event.altKey) ||
      (shiftKey && !event.shiftKey)
    ) {
      continue;
    }
    let key = dialog.shortcut?.find(
      (key) => key !== "CTRL" && key !== "ALT" && key !== "SHIFT"
    );
    if (key && key.toUpperCase() && key === event.key.toUpperCase()) {
      if (logToConsole)
        console.log(
          `[Troplo/DebugOverlayFramework] Toggled dialog: ${
            dialog.title
          } to ${!dialog.active}`
        );
      dialog.active = !dialog.active;
      _handleChange();
    }
  }
}

/**
 * Internal function to handle changes in the store.
 * Do not call this function directly.
 * @returns {void}
 */
export function _handleChange(): void {
  for (const dialog of useDebugStore().dialogs.value) {
    if (dialog.active && !dialog.id) {
      // Mount to DOM
      const id = `troplo-debugfw-${Math.random().toString(36).substring(7)}`;
      const container = document.createElement("div");
      container.id = id;
      document.body.appendChild(container);
      delete dialog.vNodeInstance;
      // expose the Vue app instance to the widget
      dialog.vNodeInstance = createVNode(dialog.component);
      dialog.vNodeInstance.appContext = useDebugStore().app._context;
      render(dialog.vNodeInstance, container);
      dialog.id = id;
    } else if (!dialog.active && dialog.id) {
      // Unmount from DOM
      document.getElementById(dialog.id)?.remove();
      dialog.id = null;
    }
  }
}

/**
 * Install and initialize the debug overlay framework
 * @param {boolean} useFramework - Whether to initialize the debug framework
 * @param {boolean} log - Log to console
 * @param {StorePlatform} platform - Platform information
 * @param {App} app - Vue app instance
 * @returns {void}
 * @example
 * install({ useFramework: import.meta.env.DEV, log: true });
 */
export function install({
  useFramework,
  log,
  platform,
  app,
}: {
  useFramework?: boolean;
  log?: boolean;
  platform: StorePlatform;
  app: App;
}): void {
  // Check if SSR
  if (typeof window === "undefined") {
    if (logToConsole)
      console.warn(
        `[Troplo/DebugOverlayFramework] Cannot install in SSR environment.`
      );
    return;
  }
  if (!useFramework) return;
  logToConsole = log ?? false;
  if (!window.__troplo_debug_framework_store)
    window.__troplo_debug_framework_store = {
      dialogs: ref([
        {
          active: false,
          component: h(ActionDialog),
          title: "Action Dialog",
          shortcut: ["CTRL", "ALT", "M"],
          id: null,
          lastInteracted: 0,
          vNodeInstance: null,
        },
      ]),
      platform: {
        version: "0.0.0",
        name: "UNKNOWN",
        devOverlay: "1.0.0",
        environment: "dev",
      },
      app,
    };
  const store = useDebugStore()!;
  window.__troplo_debug_framework_store.platform.name = platform.name;
  window.__troplo_debug_framework_store.platform.version = platform.version;
  window.__troplo_debug_framework_store.platform.environment =
    platform.environment;

  document.body.addEventListener("keydown", handleKeyDown);

  if (logToConsole)
    console.log(
      `[Troplo/DebugOverlayFramework] Installed.\nRegistered:\n${store.dialogs.value
        .map((dialog) => dialog.title)
        .join("\n")}`
    );
}

/**
 * Uninstall the debug overlay framework
 * @returns {void}
 */
export function uninstall(): void {
  if (!window || !window.__troplo_debug_framework_store) {
    console.warn(`[Troplo/DebugOverlayFramework] Not installed.`);
    return;
  }

  const store = useDebugStore();

  for (const dialog of store.dialogs.value) {
    if (dialog.shortcut) {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }

  if (logToConsole)
    console.log(
      `[Troplo/DebugOverlayFramework] Uninstalled.\nRegistered:\n${store.dialogs.value
        .map((dialog) => dialog.title)
        .join("\n")}`
    );
  window.__troplo_debug_framework_store = null;
}

/**
 * Register a new debug widget/dialog
 * @param {string} title - Title of the widget (must be unique)
 * @param {VNode} component - Vue component to render
 * @param {string[]} [shortcut] - Keyboard shortcut to open the dialog
 * @param {boolean} [active] - Whether the dialog should be active by default
 * @returns {void}
 * @throws {Error} If a widget with the same title is already registered
 * @example
 * registerWidget({
 *  title: "Experiments Manager",
 *  component: h(ExperimentsManager),
 *  shortcut: ["CTRL", "ALT", "Q"],
 *  active: false,
 *  });
 */
export function registerWidget({
  title,
  component,
  shortcut,
  active,
  category,
}: {
  title: string;
  component: VNode;
  shortcut?: string[];
  active?: boolean;
  category?: string;
}): void {
  if (!window || !window.__troplo_debug_framework_store) {
    if (logToConsole)
      console.warn(
        `[Troplo/DebugOverlayFramework] Cannot register widget before installation: ${title}`
      );
    return;
  }
  const existing = useDebugStore().dialogs.value.find(
    (dialog) => dialog.title === title
  );

  if (existing) {
    console.error(
      `[Troplo/DebugOverlayFramework] Widget already registered: ${title}`
    );
    return;
  }

  const store = useDebugStore();

  store.dialogs.value.push({
    active: active ?? false,
    component: h(
      TemplateDialog,
      {
        title,
      },
      {
        default: () => component,
      }
    ),
    title,
    shortcut,
    id: null,
    vNodeInstance: null,
    category,
  });

  if (logToConsole)
    console.log(`[Troplo/DebugOverlayFramework] Registered widget: ${title}`);
}

/**
 * Unregister a debug widget/dialog by title name
 * @param {string} title
 * @returns {void}
 * @example
 * unregisterWidget("Experiments Manager");
 */
export function unregisterWidget(title: string): void {
  if (!window || !window.__troplo_debug_framework_store) {
    console.error(
      `[Troplo/DebugOverlayFramework] Cannot unregister widget before installation: ${title}`
    );
    return;
  }
  if (title === ACTION_DIALOG_NAME) {
    if (logToConsole)
      console.error(
        `[Troplo/DebugOverlayFramework] Cannot unregister widget: ${title}`
      );
    return;
  }
  const store = useDebugStore();

  const index = store.dialogs.value.findIndex(
    (dialog) => dialog.title === title
  );

  if (index !== -1) {
    store.dialogs.value.splice(index, 1);
    if (logToConsole)
      console.log(
        `[Troplo/DebugOverlayFramework] Unregistered widget: ${title}`
      );
  } else if (logToConsole) {
    console.log(`[Troplo/DebugOverlayFramework] Widget not found: ${title}`);
  }
}

/**
 * Open a dialog by title name
 * @param {string} title
 * @returns {void}
 * @example
 * openDialog("Experiments Manager");
 */
export function openWidget(title: string): void {
  if (!window || !window.__troplo_debug_framework_store) {
    if (logToConsole)
      console.error(
        `[Troplo/DebugOverlayFramework] Cannot open dialog before installation: ${title}`
      );
    return;
  }
  const store = useDebugStore();

  const dialog = store.dialogs.value.find((dialog) => dialog.title === title);

  if (dialog) {
    dialog.active = true;
    _handleChange();
  } else if (logToConsole) {
    console.error(`[Troplo/DebugOverlayFramework] Dialog not found: ${title}`);
  }
}

/**
 * Close a dialog by title name
 * @param {string} title
 * @returns {void}
 * @example
 * closeWidget("Experiments Manager");
 */
export function closeWidget(title: string): void {
  if (!window || !window.__troplo_debug_framework_store) {
    if (logToConsole)
      console.error(
        `[Troplo/DebugOverlayFramework] Cannot close dialog before installation: ${title}`
      );
    return;
  }
  const store = useDebugStore();

  const dialog = store.dialogs.value.find((dialog) => dialog.title === title);

  if (dialog) {
    dialog.active = false;
    _handleChange();
  } else if (logToConsole) {
    console.error(`[Troplo/DebugOverlayFramework] Dialog not found: ${title}`);
  }
}

/**
 * Toggle a dialog by title name. Will open if closed and close if open.
 * Use openWidget or closeWidget for explicit control.
 * @param {string} title
 * @returns {void}
 * @example
 * toggleWidget("Experiments Manager");
 */
export function toggleWidget(title: string): void {
  if (!window || !window.__troplo_debug_framework_store) {
    if (logToConsole)
      console.error(
        `[Troplo/DebugOverlayFramework] Cannot toggle dialog before installation: ${title}`
      );
    return;
  }
  const store = useDebugStore();

  const dialog = store.dialogs.value.find((dialog) => dialog.title === title);

  if (dialog) {
    dialog.active = !dialog.active;
    _handleChange();
  } else if (logToConsole) {
    console.error(`[Troplo/DebugOverlayFramework] Dialog not found: ${title}`);
  }
}
