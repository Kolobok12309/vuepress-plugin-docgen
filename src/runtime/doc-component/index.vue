<template>
  <div class="doc-component">
    <template v-if="componentDoc.props.length">
      <h2
        id="props"
        tabindex="-1"
      >
        Props
      </h2>

      <template
        v-for="prop in componentDoc.props"
        :key="prop.name"
      >
        <h3
          :id="`prop-${prop.name}`"
          tabindex="-1"
        >
          {{ prop.name }}
        </h3>

        <ul>
          <li>
            type: <code>{{ prop.type.name }}</code>
          </li>

          <li v-if="prop.required">
            required: <code>true</code>
          </li>

          <li v-if="prop.defaultValue">
            default: <code>{{ prop.defaultValue.value }}</code>
          </li>

          <li v-if="prop.values">
            values: <code>{{ prop.values.join(' | ') }}</code>
          </li>
        </ul>

        <p v-if="prop.description">
          {{ prop.description }}
        </p>
      </template>
    </template>
    <pre>
      {{ JSON.stringify(componentDoc, null, 4) }}
    </pre>
  </div>
</template>

<script
  src="./index.ts"
  lang="ts"
></script>

<style
  src="./index.sass"
  lang="sass"
  scoped
></style>
