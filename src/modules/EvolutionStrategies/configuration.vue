<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between mx-5">
      <div class="text-sm text-gray-500">On restart</div>
      <div class="flex justify-center text-sm">
        <button
            v-for="start_state_option in ['manual', 'random', 'prev_state']"
            @click="config.restart=start_state_option"
            :class="[
                            config.restart === start_state_option ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-600' ,
                            start_state_option === 0 ? ' border-l rounded-l' : '',
                            start_state_option === 2 ? ' rounded-r border-r' : '',
                            'border-y border-indigo-600 py-0.5 px-3 h-8']">
          {{ start_state_option }}
        </button>
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
  name: "configuration",
  components: {Toggle, ParameterButtonSparse},
  props: ["data", "options"],
  data() {
    return {
      config: {
        restart: 'manual' // manual, random, prev_state
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
  mounted(){
    this.config.restart = this.options.restart
    this.params.A = this.data.state.C[0][0]
    this.params.B = this.data.state.C[1][0]
    this.params.C = this.data.state.C[1][1]
    this.params.m = this.data.state.m
    this.params.sigma = this.data.state.sigma
  },
  watch: {
    config: {
      handler(params) {
        this.$emit("change", {params: this.params, options: this.config});
      },
      deep: true
    },
    params: {
      handler(params) {
        this.$emit("change", {params: this.params, options: this.config});
      },
      deep: true
    }
  },
}
</script>

