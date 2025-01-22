import ActionDialog from "../components/ActionDialog.vue";
import { App, Component, h, Ref, ref, render, VNode, watch } from "vue";

export interface StorePlatform {
  version: string;
  name: string;
  hash?: string;
  environment: "prod" | "dev" | "staging";
}

interface Store {
  dialogs: Ref<
    {
      active: boolean;
      component: VNode;
      title: string;
      shortcut?: string[];
      id: string | null;
      lastInteracted?: number;
      vNodeInstance: VNode | null;
    }[]
  >;
  platform: StorePlatform & {
    devOverlay: string;
  };
  app: App;
}

declare global {
  interface Window {
    __troplo_debug_framework_store: Store;
  }
}

export const useDebugStore = () => {
  return window ? window.__troplo_debug_framework_store : null;
};
