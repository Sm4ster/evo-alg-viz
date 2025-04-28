<template>
  <div class="">
    <div class="flex flex-col space-y-1 w-full">
      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">A</div>
        <ParameterButtonSparse v-model="hessian.A" name="A"/>
      </div>
      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">B</div>
        <ParameterButtonSparse v-model="hessian.B" name="A"/>
      </div>
      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">C</div>
        <ParameterButtonSparse v-model="hessian.C" name="A"/>
      </div>
    </div>
  </div>
</template>


<script>
import ParameterButton from "../../components/misc/ParameterButton.vue";
import ParameterButtonSparse from "../../components/misc/ParameterButtonSparse.vue";

export default {
  name: "configuration",
  components: {ParameterButtonSparse, ParameterButton},
  props: ["data", "options"],
  data() {
    return {
      hessian: {
        A: 1,
        B: 0,
        C: 1,
      },
    }
  },
  mounted(){
    this.hessian.A = this.data.hessian[0][0]
    this.hessian.B = this.data.hessian[0][1]
    this.hessian.C = this.data.hessian[1][1]
  },

  watch: {
    hessian: {
      handler(params) {
        this.$emit("change", {hessian: [[params.A, params.B], [params.B, params.C]]})
      },
      deep: true
    },
  },
}
</script>

