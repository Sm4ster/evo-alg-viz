<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between mx-5">
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">on restart</h3>
      <div class="flex justify-center">
<!--        <button-->
<!--            v-for="start_state_option in ['manual', 'random', 'prev_state']"-->
<!--            @click="start_state=start_state_option"-->
<!--            :class="[-->
<!--                            start_state === start_state_option ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-600' ,-->
<!--                            start_state_option === 0 ? ' border-l rounded-l' : '',-->
<!--                            start_state_option === 2 ? ' rounded-r border-r' : '',-->
<!--                            'border-y border-indigo-600 py-0.5 px-3 h-8']">-->
<!--          {{ start_state_option }}-->
<!--        </button>-->
      </div>
    </div>
    <div class="flex flex-col space-y-1 w-full">

      <div class="flex justify-between mx-5 items-center">
        <div class="text-sm text-gray-500">A</div>
        <ParameterButtonSparse v-model="params.A" name="A"/>
      </div>

      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">B</div>
        <ParameterButtonSparse class="w-40" v-model="params.B" name="B"/>
      </div>

      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">C</div>
        <ParameterButtonSparse class="w-40" v-model="params.C" name="C"/>
      </div>

      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">m0</div>
        <ParameterButtonSparse class="w-40" v-model="params.m[0]" name="m0"/>
      </div>

      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">m1</div>
        <ParameterButtonSparse class="w-40" v-model="params.m[1]" name="m1"/>
      </div>

      <div class="flex justify-between mx-5">
        <div class="text-sm text-gray-500">sigma</div>
        <ParameterButtonSparse class="w-40" v-model="params.sigma" name="sigma"/>
      </div>
    </div>
  </div>
</template>


<script>
import ParameterButtonSparse from "../../components/misc/ParameterButtonSparse.vue";
import Toggle from "../../components/misc/Toggle.vue";

export default {
  name: "options",
  components: {Toggle, ParameterButtonSparse},
  data() {
    return {
      options: {},
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
    params: {
      handler(params) {
        this.$emit("change", params);
        // if (this.update_flag) {
        //   this.steps = this.state_generator.set_start({
        //     m: [...this.params.m],
        //     C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
        //     sigma: this.params.sigma,
        //     Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
        //   })
        //   this.update({...this.steps[this.current_step], duration: 0});
        // }
      },
      deep: true
    }
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

