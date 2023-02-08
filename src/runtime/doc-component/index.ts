import type { ComponentDoc } from 'vue-docgen-api';
import { computed, defineComponent } from 'vue';
import { usePageData } from '@vuepress/client'


export default defineComponent({
  name: 'DocComponent',

  setup() {
    const data = usePageData();
    const componentDoc = computed(() => (data.value as any).componentDoc as ComponentDoc);

    return {
      componentDoc,
    };
  },
});
