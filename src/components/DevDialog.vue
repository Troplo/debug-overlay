<template>
  <div
    :id="`dev-overlay-${id}`"
    class="dev-overlay"
    :style="{ zIndex }"
    :class="{
      foreground: sortedDialogs.slice().reverse()[0]?.title === title,
    }"
    @click="dialog.lastInteracted = Date.now()"
  >
    <div
      :id="`dev-header-${id}`"
      class="dev-header unselectable d-flex justify-space-between align-center"
    >
      <div class="flex gap-2 items-center">
        <slot name="header"></slot>
      </div>
      <Button
        style="height: 20px; width: 20px"
        class="float-right"
        @click="$emit('close')"
        icon
      >
        <close style="height: 15px" />
      </Button>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useDebugStore } from "../store";
import Button from "./Button.vue";
import Close from "./icons/close.vue";

const id = `tpu-dev-${Math.random().toString(36).substring(2, 10)}`;
const debugStore = useDebugStore();
const props = defineProps<{
  title: string;
}>();
const dialog = computed(() =>
  debugStore.dialogs.value.find((d) => props.title === d.title),
);

onMounted(() => {
  if (!dialog) {
    console.error(`Dialog with title ${props.title} not found`);
    return;
  }
  drag(document.getElementById(`dev-overlay-${id}`));
  dialog.value.lastInteracted = Date.now() + 100;
});

const sortedDialogs = computed(() => {
  return debugStore.dialogs.value
    .slice()
    .sort((a, b) => a.lastInteracted - b.lastInteracted)
    .filter((dialog) => dialog.active);
});

const zIndex = computed(() => {
  return (
    sortedDialogs.value.findIndex((dialog) => dialog.title === props.title) +
    10000
  );
});

function drag(element: any) {
  try {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (document.getElementById(`dev-header-${id}`)) {
      document.getElementById(`dev-header-${id}`).onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
    }

    // eslint-disable-next-line no-inner-declarations
    function dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      dialog.value.lastInteracted = Date.now();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    // eslint-disable-next-line no-inner-declarations
    function elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    }

    // eslint-disable-next-line no-inner-declarations
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  } catch (e) {
    console.log(e);
  }
}
</script>

<style scoped>
.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
