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
  name: "options",
  components: {ParameterButtonSparse, ParameterButton},
  data() {
    return {
      hessian: {
        A: 1,
        B: 0,
        C: 1,
      },
    }
  },
  watch: {
    hessian: {
      handler(params) {
        this.$emit("change", "asdfasjdfklö")
        // this.steps = this.state_generator.set_start({
        //   m: [...this.params.m],
        //   C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
        //   sigma: this.params.sigma,
        //   Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
        // })
        // this.update({...this.steps[this.current_step], duration: 0});
      },
      deep: true
    },
  },
  methods: {
    loop() {
      if (this.start_state === "random") this.set_random_start();
      if (this.start_state === "prev_state") {
        this.params.m = [...this.steps[this.steps.length - 1].algorithm.m]
        this.params.A = this.steps[this.steps.length - 1].algorithm.C[0][0]
        this.params.B = this.steps[this.steps.length - 1].algorithm.C[1][0]
        this.params.C = this.steps[this.steps.length - 1].algorithm.C[1][1]
        this.params.sigma = this.steps[this.steps.length - 1].algorithm.sigma
      }
      this.steps = this.state_generator.set_start({
        m: [...this.params.m],
        C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
        sigma: this.params.sigma,
        Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
      })
    }
  }
}
</script>

