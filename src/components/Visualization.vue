<template>
  <div class="relative">
    <svg :class="[dark ? 'bg-black' : 'bg-white', ' h-full z-10']" ref="svg"
         :width="base_width"
         :height="base_height"
         :viewBox="`${0} ${0} ${width} ${height}`"
    >
      <g id="viewbox_x" :transform="`translate(${-x.value} 0)`">
        <g id="viewbox_y" :transform="`translate(0 ${-y.value})`">
          <g id="container" :transform="`translate(${width/2} ${height/2})`">
            <g id="modules"></g>
            <g id="equations" :class="[dark ? 'text-white': 'text-black', invert ? 'inverted' : '']"></g>
            <g id="graphics"></g>
          </g>
        </g>
      </g>
    </svg>
    <TransitionRoot as="template" :show="show_settings">
      <Dialog class="relative z-10" @close="show_settings = false">
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

                <div class="flex space-x-12 border border-indigo-600 rounded p-5 bg-white">
                  <div class="w-96">
                    <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">Animations</h3>
                    <RadioSelect :options="algorithms" :selected_id="animation_id"
                                 @update="animation_id = $event"></RadioSelect>

                  </div>
                  <div class="flex flex-col w-96 justify-between bg-stone-100">
                    <div class="pb-8">
                      <div class="flex flex-col space-y-4">
                        <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">General Options</h3>
                        <div class="flex justify-between mx-5">
                          <span class="text-sm text-gray-500">Dark Background</span>
                          <Toggle v-model="dark"></Toggle>
                        </div>
                        <div class="flex justify-between mx-5">
                          <span class="text-sm text-gray-500">Invert Colors</span>
                          <Toggle v-model="invert"></Toggle>
                        </div>
                        <div class="flex justify-between mx-5">
                          <span class="text-sm text-gray-500">Loop Animation</span>
                          <Toggle v-model="loop"></Toggle>
                        </div>
                        <div class="flex justify-between mx-5">
                          <span class="text-sm text-gray-500">Automatic Animation</span>
                          <div class="flex items-center space-x-2">
                            <input type="number" min="0" class="border-indigo-600 rounded border h-6 w-16 text-sm px-1"
                                   v-model="delay">
                            <div class="text-xs">ms</div>
                            <Toggle v-model="auto"></Toggle>
                          </div>

                        </div>
                        <div class="flex justify-between mx-5 text-center">
                          <span class="text-sm text-gray-500">Animation Speed <button @click="speed = 1"
                                                                                      class="text-indigo-600 text-xs">Reset</button></span>

                          <div class="flex items-center">
                            <LogSlider v-model="speed"/>
                          </div>
                        </div>
                      </div>
                      <div v-for="module in animation._modules">
                        <h3 class="my-5 text-xs text-stone-500 font-semibold w-full text-center">
                          {{ module.module.name }} Module Options</h3>
                        <component :is="module.module.name + 'Configuration'"
                                   :data="module.module.start_state"
                                   :options="module.module.options"
                                   @change="module.module.configuration.handler($event)"/>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <div v-if="show_steps" class="absolute bottom-0 right-0 bg-transparent mr-10 mb-5">
      <div class="flex justify-center">
        <button
            v-for="i in $_.range(steps.length)"
            @click="current_step=i"
            @dblclick="reset_animation();current_step=i;update(steps[i])"
            :class="[
                            current_step === i ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-600' ,
                            i === 0 ? ' border-l rounded-l' : '',
                            i === steps.length-1 ? ' rounded-r border-r' : '',
                            'border-y border-indigo-600 py-0.5 px-3 h-8']">
          {{ i }}
        </button>
      </div>
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">steps</h3>
    </div>
  </div>
</template>

<style>
.inverted {
  filter: invert(1);
}
</style>

<script>
import * as d3 from 'd3'
import katex from "katex";
import {ref} from 'vue'

import ParameterButton from "./misc/ParameterButton.vue";
import Toggle from "./misc/Toggle.vue";
import LogSlider from "./misc/LogSlider.vue"
import RadioSelect from "./misc/RadioSelect.vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from '@headlessui/vue'
import {graphics, equations, viewBox} from "./GraphicUtils.js";
import {findMaxDurationDelaySum, multiplyDurationAndDelay} from "./functions.js"

// dynamic imports of everything in the folder @/src/animations
const scripts = import.meta.glob('../animations/**/animation.js', {eager: true});
const algorithms = Object.entries(scripts).map(([path, module], id) => {
  const parts = path.split('/');
  const module_name = '/' + parts[parts.length - 2] + '/';

  return {id, name: module_name.slice(1, -1), class: new module.default()}
});

export default {
  name: "ParameterGraph",
  components: {
    RadioSelect,
    Toggle,
    ParameterButton,
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    LogSlider
  },
  data() {
    return {
      animation_id: 3,

      steps: [],
      current_step: 0,

      dragging: false,
      base_width: null,
      base_height: null,


      show_steps: true,
      show_settings: false,


      //settings
      dark: false,
      invert: false,
      loop: true,
      auto: false,
      delay: 1000,
      speed: 1,

      auto_timeout_id: null,
      update_flag: true,
    }
  },
  watch: {
    animation_id() {
      this.update(this.steps[this.current_step]);
    },
    current_step: function (step, old_step) {
      if (step === 0 && old_step === this.steps.length - 1) {
        this.reset_animation();
      }
      this.update(this.steps[this.current_step])
    },
    show_settings(open) {
      if (!open) {
        this.steps = this.animation.fill_step_cache();
        this.current_step = 0;
        this.update(this.steps[this.current_step]);
      }
    },

    auto(params) {
      if (this.auto) {
        const scheduleNextStep = () => {
          return window.setTimeout(() => {
            this.next_step();
            // Schedule the next timeout after this step
            this.auto_timeout_id = scheduleNextStep();
          }, this.next_step_duration() + this.delay); // Set delay dynamically if needed
        };

        // Start the recursive timeout calls
        this.auto_timeout_id = scheduleNextStep();
      } else {
        clearTimeout(this.auto_timeout_id);
        this.auto_timeout_id = null; // Reset the timeout ID
      }
    }
  },
  created() {
    // Define reactive references using ref
    this.x = ref(0);
    this.y = ref(0);
    this.zoom = ref(1);
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

    this.init_animation();
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
    animation() {
      return algorithms[this.animation_id].class
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

      // insert multiplier for speed and delay
      multiplyDurationAndDelay(data, this.speed)

      // viewbox
      viewBox(d3.select(this.$refs.svg), data.viewbox, this.base_width, this.base_height,
          {x: this.x, y: this.y, zoom: this.zoom})

      // graphics and icons
      graphics(d3.select("#graphics"), data.graphics)

      // math and formulas
      equations(d3.select("#equations"), data.equations, this.dark, this.invert)

      // let modules update the canvas
      for (const {module, alias} of this.animation._modules) {
        module.update(d3.select(`#modules #${alias}`), data[alias], {
          width: this.width,
          height: this.height
        })
      }

    },
    init_animation() {
      this.animation.init()

      for (let module of this.animation._modules) {
        module.module.init(d3.select("#modules").append("g").attr("id", module.alias))
        if (module.module.configuration) this.$.components[module.module.name + "Configuration"] = module.module.configuration.component
      }

      this.steps = this.animation.fill_step_cache()
    },
    reset_animation() {
      if ('on_reset' in this.animation) this.animation.on_reset(this.steps);
      for (let module of this.animation._modules) {
        if ('on_reset' in module.module) module.module.on_reset(this.steps.map(e => e[module.alias]))
      }
      this.steps = this.animation.fill_step_cache();
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
    },
    next_step_duration() {
      const next_step_id = (this.current_step + 1) % (this.steps.length)
      return findMaxDurationDelaySum(this.steps[next_step_id])
    },
    next_step() {
      this.current_step = (this.current_step + 1) % (this.steps.length);

    },
    prev_step() {
      this.current_step = (this.current_step - 1 + this.steps.length) % (this.steps.length);
    },
    keydown(e) {
      switch (e.key) {
        case "s":
          this.show_settings = !this.show_settings;
          break;
        case "Escape":
          this.show_settings = false;
          break;
        case "w":
          this.show_steps = !this.show_steps;
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
          this.prev_step();
          e.preventDefault()
          break;
        case "ArrowRight":
          this.next_step();
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
