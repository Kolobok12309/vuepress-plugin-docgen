<template>
  <button>
    <!--
      @slot The text of the button
    -->
    <slot>
      {{ text }}
    </slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface HardType {
  foo: number;
  bar?: Date;
}

/**
 * The only true button.
 * @displayName Best Button
 */
export default defineComponent({
  name: 'MyButton',

  props: {
    /**
     * Model value
     * @model
     */
    value: String,

    /**
     * Some hard type
     */
    obj: {
      type: Object as PropType<HardType>,
      default: () => ({}),
    },

    /**
     * The color for the button.
     */
    color: {
      type: String,
      default: '#333'
    },
    /**
     * The size of the button
     * @values 'small', 'normal', 'large'
     */
    size: {
      type: String,
      default: 'normal'
    },
    /**
     * Gets called when the user clicks on the button
     */
    onClick: {
      type: Function,
      default: event => {
        console.log('You have clicked me!', event.target)
      }
    }
  }
});
</script>
