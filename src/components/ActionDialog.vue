<template>
  <!-- The Action Dialog is a built in dialog component to access other registered dialogs -->
  <DevDialog
    :title="actionDialog.title"
    @close="
      actionDialog.active = false;
      _handleChange();
    "
  >
    <template #header> Developer Actions </template>
    <div class="d-flex flex-column ga-2">
      <p class="mt-3">You found the secret menu! (CTRL + ALT + M)</p>
      <div v-for="item in categories">
        <overline position="center" class="mt-n1"> {{ item.title }} </overline>
        <div class="d-flex flex-wrap ga-2 justify-center">
          <button
            v-for="dialog in item.dialogs || []"
            :key="dialog.title"
            @click="
              dialog.active = !dialog.active;
              _handleChange();
            "
            type="button"
            class="v-btn v-theme--dark text-white v-btn--density-default v-btn--size-default v-btn--variant-tonal"
          >
            <span class="v-btn__overlay"></span
            ><span class="v-btn__underlay"></span>
            <span class="v-btn__content" data-no-activator="">
              {{ dialog.title }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <small v-if="store && store.platform" class="mt-2">
      @troplo/debug-overlay: v{{ store.platform.devOverlay }}<br />
      Platform: {{ store.platform.name }}<br />
      Version: {{ store.platform.version }}<br />
      Environment: {{ store.platform.environment }}<br />
    </small>
  </DevDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import DevDialog from "./DevDialog.vue";
import { useDebugStore } from "../store";
import { _handleChange } from "../index";
import Button from "./Button.vue";
import Overline from "./Overline.vue";

const route = ref("");

const store = useDebugStore();

const actionDialog = computed(() =>
  store.dialogs.value.find((d) => d.title === "Action Dialog")
);

const categories = computed(() => {
  const values = store.dialogs.value.reduce((acc, dialog) => {
    const category = dialog.category || "Default";
    console.log(category);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dialog);
    return acc;
  }, {});
  return Object.keys(values).map((key) => ({
    title: key,
    dialogs: values[key],
  }));
});
</script>
