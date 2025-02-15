<template>
  <div class="date-separator" style="font-size: 14px; display: flex">
    <slot name="start" />
    <div
      v-if="position === 'center' || position === 'end'"
      class="date-separator-line"
    ></div>
    <p class="date-separator-block unselectable">
      <slot />
    </p>
    <div
      v-if="position === 'start' || position === 'center'"
      class="date-separator-line"
    ></div>
    <div v-if="$slots.end" class="date-separator-block">
      <slot name="end" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ position: "start" | "center" | "end" }>();
</script>

<style scoped>
.date-separator {
  margin: 5px 8px 5px 8px;
  display: flex;
  justify-content: center;
}

.date-separator-line {
  height: 12px;
  border-bottom: 1px solid #383838;
  mix-blend-mode: difference;
  width: 100%;
}

.date-separator-block {
  padding: 0 8px;
  white-space: nowrap;
  color: #575757;
  mix-blend-mode: difference;
  filter: brightness(150%);
}

.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
