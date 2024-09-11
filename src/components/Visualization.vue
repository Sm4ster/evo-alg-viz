<template>
  <div class="relative">
    <svg class="bg-black h-full z-10" ref="svg"
         :width="base_width"
         :height="base_height"
         :viewBox="`${0} ${0} ${width} ${height}`"
    >
      <g id="viewbox_x" :transform="`translate(${-x.value} 0)`">
        <g id="viewbox_y" :transform="`translate(0 ${-y.value})`">
          <g id="container" :transform="`translate(${width/2} ${height/2})`">
            <g id="modules"></g>
            <g id="equations"></g>
            <g id="graphics"></g>
          </g>
        </g>
      </g>
    </svg>
    <TransitionRoot as="template" :show="show.settings">
      <Dialog class="relative z-10" @close="show.settings = false">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                         leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
        </TransitionChild>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300"
                             enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                             enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                             leave-from="opacity-100 translate-y-0 sm:scale-100"
                             leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel
                  class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8  sm:p-6">

                <div class="flex flex-col space-y-6 border border-indigo-600 rounded p-5 bg-white">
                  <div class="">
                    <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">examples</h3>
                    <RadioSelect :options="algorithms" :selected_id="state_generator_id"
                                 @update="state_generator_id = $event"></RadioSelect>

                  </div>
                  <div class="flex flex-col justify-between">
                    <div class="pb-8">
                      <div class="flex flex-col space-y-4">
                        <div class="flex justify-center space-x-5">
                          <span class="text-sm text-gray-500">automatic animation on/off</span>
                          <Toggle v-model="loop.on"></Toggle>
                        </div>
                        <div class="flex justify-center">
                          <button
                              v-for="start_state_option in ['manual', 'random', 'prev_state']"
                              @click="start_state=start_state_option"
                              :class="[
                            start_state === start_state_option ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-600' ,
                            start_state_option === 0 ? ' border-l rounded-l' : '',
                            start_state_option === 2 ? ' rounded-r border-r' : '',
                            'border-y border-indigo-600 py-0.5 px-3 h-8']">
                            {{ start_state_option }}
                          </button>
                        </div>
                      </div>
                      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">loop settings</h3>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <div v-if="show.steps" class="absolute bottom-0 right-0 bg-black">
      <div class="flex justify-center">
        <button
            v-for="i in $_.range(steps.length)"
            @click="current_step=i"
            :class="[
                            current_step === i ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-600' ,
                            i === 0 ? ' border-l rounded-l' : '',
                            i === steps.length-1 ? ' rounded-r border-r' : '',
                            'border-y border-indigo-600 py-0.5 px-3 h-8']">
          {{ i }}
        </button>
      </div>
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1 bg-black">steps</h3>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import katex from "katex";
import {ref} from 'vue'

import OnePlusOneES from "../animations/algorithms/1+1-ES.js";
import OnePlusOneCMAES from "../animations/algorithms/1+1-CMA-ES.js";
import NormalForm from "../animations/misc/NormalForm.js";
import NormalDistribution from "../animations/misc/NormalDistribution.js";
import Scene1 from "../animations/IntroductionToES/Scene1.js";
import Test from "../animations/Test.js"

import ParameterButton from "./misc/ParameterButton.vue";
import Toggle from "./misc/Toggle.vue";
import RadioSelect from "./misc/RadioSelect.vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from '@headlessui/vue'
import {graphics, equations, viewBox} from "./GraphicUtils.js";


const algorithms = [
  {id: 0, name: "1+1-ES", class: new OnePlusOneES()},
  {id: 1, name: "1+1-CMA-ES", class: new OnePlusOneCMAES()},
  {id: 2, name: "CMA-ES Normalform", class: new NormalForm()},
  {id: 3, name: "Normal Distribution", class: new NormalDistribution()},
  {id: 4, name: "Scene 1", class: new Scene1()},
  {id: 5, name: "Test", class: new Test()},
]


export default {
  name: "ParameterGraph",
  components: {RadioSelect, Toggle, ParameterButton, Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot},
  data() {
    return {
      sequence_id: 0,

      steps: [],
      start_state: "manual",
      current_step: 0,

      dragging: false,
      base_width: null,
      base_height: null,


      show: {
        steps: true,
        settings: false,
      },
      interval_id: false,
      loop: {
        on: false,
        duration: 1000,
        delay: 1000,
      },
      update_flag: true,
    }
  },
  watch: {
    sequence_id() {
      this.start_state = this.sequence.app_defaults.start_state;
      this.update({...this.steps[this.current_step], duration: 0});

    },
    current_step: function (step, old_step) {
      if (step === 0) {
        // this.update_flag = false;
        // for(let module of this.sequence.modules){
        //   module.loop()
        // }
        // this.update_flag = true;
      }

      if (step === (old_step + 1)) this.update(this.steps[this.current_step]);
      else this.update({...this.steps[this.current_step], duration: 0})

    },

    loop: {
      handler(params) {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }

        if (this.loop.on) {
          this.intervalId = setInterval(() => {
            this.current_step = (this.current_step + 1) % (this.steps.length);
          }, this.loop.delay + this.loop.duration);
        }
      },
      deep: true
    },

  },
  created() {
    // Define reactive references using ref
    this.x = ref(0);
    this.y = ref(0);
    this.zoom = ref(1);

    this.steps = this.sequence.fill_step_cache()

    // this.start_state = this.sequence.app_defaults.start_state;
    // this.steps = this.sequence.set_start({
    //   m: [...this.params.m],
    //   C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
    //   sigma: this.params.sigma,
    //   Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
    // })
    //
  },
  mounted() {
    document.addEventListener('keydown', this.keydown)
    const parent = this.$refs.svg.parentElement;
    if (parent) {
      this.base_width = parent.offsetWidth;
      this.base_height = parent.offsetHeight;
    }

    const svg = this.$refs.svg;
    svg.addEventListener('wheel', this.wheel);
    svg.addEventListener('mousedown', this.startDrag);
    svg.addEventListener('mouseup', this.stopDrag);
    svg.addEventListener('mousemove', this.drag);

    this.init_sequence();
    this.update(this.steps[this.current_step]);
  },
  beforeUnmounted() {
    document.removeEventListener('keydown', this.keydown)
    const svg = this.$refs.svg;
    svg.removeEventListener('wheel', this.wheel);
    svg.removeEventListener('mousedown', this.startDrag);
    svg.removeEventListener('mouseup', this.stopDrag);
    svg.removeEventListener('mousemove', this.drag);
  },
  computed: {
    sequence() {
      return algorithms[this.sequence_id].class
    },
    algorithms() {
      return algorithms
    },
    katex() {
      return katex
    },
    height() {
      return this.zoom.value * this.base_height
    },
    width() {
      return this.zoom.value * this.base_width
    },

  },
  methods: {
    update(data) {
      console.log("data:", data)

      // viewbox
      viewBox(d3.select(this.$refs.svg), data.viewbox, this.base_width, this.base_height,
          {x: this.x, y: this.y, zoom: this.zoom})

      // graphics and icons
      graphics(d3.select("#graphics"), data.graphics)

      // math and formulas
      equations(d3.select("#equations"), data.equations)

      // let modules update the canvas
      for (let module of this.sequence.modules) {
        console.log(module)
        module.update(d3.select(`#modules #${module.name}`), data[module.name], {
          width: this.width,
          height: this.height
        })
      }

    },
    init_sequence(){
      console.log("asdas", d3.select("#modules"))
      for(let module of this.sequence.modules) {
        module.init(d3.select("#modules").append("g").attr("id", module.name))
      }

    },

    drag(e) {
      if (this.dragging) {
        this.x.value -= this.zoom.value * e.movementX
        this.y.value -= this.zoom.value * e.movementY
      }
    }
    ,
    wheel: function (event) {
      event.preventDefault();
      if (event.wheelDelta > 0) this.zoom.value /= 1.1
      if (event.wheelDelta < 0) this.zoom.value *= 1.1
    }
    ,
    startDrag() {
      this.dragging = true;
    }
    ,
    stopDrag() {
      this.dragging = false;
    }
    ,
    keydown(e) {
      switch (e.key) {
        case "s":
          this.show.settings = !this.show.settings;
          break;
        case "Escape":
          this.show.settings = false;
          break;
        case "w":
          this.show.steps = !this.show.steps;
          break;
        case "ArrowUp":
          this.current_step = this.steps.length;
          e.preventDefault()
          break;
        case "ArrowDown":
          this.current_step = 0;
          e.preventDefault()
          break;
        case "ArrowLeft":
          this.current_step = (this.current_step - 1 + this.steps.length) % (this.steps.length);
          e.preventDefault()
          break;
        case "ArrowRight":
          this.current_step = (this.current_step + 1) % (this.steps.length);
          e.preventDefault()
          break;
        default:
          // Handle other keys
          break;
      }

    }
  }
}
</script>
