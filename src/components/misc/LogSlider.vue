<template>
  <span class="mr-2 text-gray-900 text-xs">{{logValue.toFixed(2)}}x</span>
  <input   id="default-range"
           type="range"
           :min="minRange"
           :max="maxRange"
           v-model="sliderValue"
           @input="updateLogValue"
         class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">

</template>

<script>
export default {
  name: "Slider",
  props: {
    modelValue: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      sliderValue: 50, // Initial slider value
      minRange: 0, // Linear slider range (0 to 100)
      maxRange: 100,
      minLogValue: Math.log(1 / 5), // Logarithmic min
      maxLogValue: Math.log(5), // Logarithmic max
      logValue: this.modelValue  // Initial logarithmic value
    };
  },
  watch: {
    // When parent updates the modelValue, update the slider position
    modelValue(newVal) {
      this.sliderValue = this.linearValueFromLog(newVal);
      this.logValue = newVal;
    }
  },
  methods: {
    updateLogValue(event) {
      // Get the slider's linear value
      this.sliderValue = event.target.value;

      // Map the linear slider value to the logarithmic scale
      const normalizedValue = this.sliderValue / this.maxRange;
      const logRange = this.maxLogValue - this.minLogValue;
      const logValue = Math.exp(this.minLogValue + normalizedValue * logRange);

      // Emit the new logarithmic value for v-model
      this.$emit('update:modelValue', logValue);
      this.logValue = logValue; // Update the internal display
    },
    // Convert log value to linear slider value
    linearValueFromLog(logValue) {
      const logRange = this.maxLogValue - this.minLogValue;
      const normalizedLogValue = (Math.log(logValue) - this.minLogValue) / logRange;
      return normalizedLogValue * this.maxRange;
    }
  },
}
</script>
