<script>
export default {
  name: "ParameterButton",
  props: {
    "modelValue": Number,
    "name": String,
    "stepsize": {type: Number, default: 0.1}
  },
  emits: ['update:modelValue'],
  methods: {
    decimals(value, decimals = 2) {
      return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
    },
  }
}
</script>

<template>
  <div class="flex justify-between">
    <button
        @click="$emit('update:modelValue', modelValue-stepsize)"
        class="text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold border border-indigo-600 py-0.5 px-3 rounded-l">
      -
    </button>
    <div
        class="w-full border-y border-indigo-600 text-sm text-white bg-indigo-600 flex justify-center items-center">
                <span class="">
                        <span v-if="name">{{ name }} = </span>{{ decimals(modelValue) }}</span>
    </div>
    <button @click="$emit('update:modelValue', modelValue+stepsize)"
            class="text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold border border-indigo-600 py-0.5 px-3 rounded-r">
      +
    </button>
  </div>

</template>

<style scoped>

</style>