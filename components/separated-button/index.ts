/**
 * The only true button.
 */
export default {
  name: 'Button',
  props: {
    /**
     * The color for the button.
     */
    color: {
      type: String,
      default: '#333'
    },
    /**
     * The size of the button
     * @values small, normal, large
     */
    size: {
      type: String,
      default: 'normal'
    },
    /**
     * Array of options
     *
     * @type {Array<string | number | { [key: string | number]: any }>}
     *
     * @see https://vue-select.org/api/props.html#options
     */
    options: {
      type: Array,
      default: () => [],
    },
    /**
     * Gets called when the user clicks on the button
     * @ignore
     */
    onClick: {
      type: Function,
      default: event => {
        console.log('You have clicked me!', event.target)
      }
    }
  },
  computed: {
    fontSize() {
      let size
      switch (this.size) {
        case 'small':
          size = '10px'
          break
        case 'normal':
          size = '14px'
          break
        case 'large':
          size = '18px'
          break
      }
      return size
    }
  }
}
