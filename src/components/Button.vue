<template>
  <button
    :class="buttonClasses"
    @click="$emit('click')"
    :style="computedStyles"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  icon: Boolean,
});

const buttonClasses = computed(() => ({
  "material-button": true,
  "material-button--icon": props.icon,
}));
const computedStyles = computed(() => ({
  borderRadius: props.icon ? "9999px" : "4px",
}));
</script>

<style scoped>
.material-button {
  background: transparent;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(4, 4, 4, 0.1);
}

.material-button:hover {
  background-color: rgba(4, 4, 4, 0.1);
}

/* Icon style */
.material-button--icon {
  width: 40px;
  height: 40px;
  padding: 0;
}
</style>
