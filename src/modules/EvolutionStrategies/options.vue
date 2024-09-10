<template>
  <div class="flex space-x-3">
    <div class="h-full flex flex-col justify-end">
      <div class="flex space-x-3">
        <div class="flex flex-col space-y-1">
          <ParameterButton class="w-40" v-model="params.A" name="A"/>
          <ParameterButton class="w-40" v-model="params.B" name="B"/>
          <ParameterButton class="w-40" v-model="params.C" name="C"/>
        </div>
        <div class="flex flex-col space-y-1">
          <ParameterButton class="w-40" v-model="params.m[0]" name="m0"/>
          <ParameterButton class="w-40" v-model="params.m[1]" name="m1"/>
          <ParameterButton class="w-40" v-model="params.sigma" name="sigma"/>
        </div>
      </div>
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">algorithm
        parameters</h3>
    </div>

    <div class="h-full flex flex-col justify-end">
      <div class="flex space-x-3">
        <div class="flex flex-col space-y-1">
          <ParameterButton class="w-40" v-model="hessian.A" name="A"/>
          <ParameterButton class="w-40" v-model="hessian.B" name="B"/>
          <ParameterButton class="w-40" v-model="hessian.C" name="C"/>
        </div>
      </div>
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">fitness
        parameters</h3>
    </div>
  </div>
</template>



<script>
import ParameterButton from "../../components/misc/ParameterButton.vue";

export default {
  name: "options",
  components: {ParameterButton},
  data(){
    return {
      options: {

      },
      hessian: {
        A: 1,
        B: 0,
        C: 1,
      },

      params: {
        A: 1,
        B: 0,
        C: 1,
        m: [1, -1],
        sigma: 1
      },
    }
  },
  watch: {
    hessian: {
      handler(params) {
        this.steps = this.state_generator.set_start({
          m: [...this.params.m],
          C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
          sigma: this.params.sigma,
          Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
        })
        this.update({...this.steps[this.current_step], duration: 0});
      },
      deep: true
    },
    params: {
      handler(params) {
        if (this.update_flag) {
          this.steps = this.state_generator.set_start({
            m: [...this.params.m],
            C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
            sigma: this.params.sigma,
            Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
          })
          this.update({...this.steps[this.current_step], duration: 0});
        }
      },
      deep: true
    }
  },
  methods: {
    loop(){
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

