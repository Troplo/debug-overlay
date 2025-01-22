<template>
  <DevDialog
    :title="props.title"
    @close="
      dialog.active = false;
      _handleChange();
    "
  >
    <template #header> {{ title }} </template>
    <slot />
  </DevDialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import DevDialog from "./DevDialog.vue";
import { useDebugStore } from "../store";
import { _handleChange } from "../index";

const props = defineProps({
  title: String,
});
const store = useDebugStore();

const dialog = computed(() =>
  store.dialogs.value.find((d) => d.title === props.title),
);
</script>
