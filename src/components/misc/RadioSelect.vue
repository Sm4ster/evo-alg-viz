<script>
export default {
  name: "RadioSelect",
  props: {
    "options": Array,
    "selected_id": Number,
  },
  emits: ['update'],
  watch: {

  }
}
</script>
<template>
  <fieldset class="p-5">
    <div class="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
      <div v-for="(option, sideIdx) in options" :key="sideIdx" class="relative flex items-start py-4 " @click="$emit('update', option.id);">
        <div class="min-w-0 flex-1 text-sm leading-6" >
          <label class="select-none font-medium text-gray-900">{{ option.name }}</label>
        </div>
        <div class="ml-3 flex h-6 items-center">
          <input name="plan" type="radio" :checked="option.id === selected_id" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>

</style>