<template>
  <div class="Button">
    <button class="button" :style="{ color: color, fontSize: fontSize }" @click.prevent="onClick">
      <!-- @slot Content of button -->
      <slot></slot>
    </button>
  </div>
</template>

<script
  src="./index.ts"
  lang="ts"
></script>

<style
  src="./index.css"
  scoped
></style>
