<template>
  <div class="relative">
    <svg class="bg-white h-full z-10" ref="svg"
         :width="base_width"
         :height="base_height"
         :viewBox="x + ' ' + y + ' ' + width + ' ' + height"
    >
      <g id="container" :transform="`translate(${width/2} ${height/2})`">
      </g>

      <!--  0,0 point  -->
      <circle :cx='width/2' :cy='height/2' r='1' stroke="black" :stroke-width="height / 600"></circle>


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
                    </div>
                  </div>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <div v-if="show.steps" class="absolute bottom-0 right-0 bg-white">
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
      <h3 class="text-xs text-stone-500 font-semibold w-full text-center mt-1">transformation steps</h3>
    </div>

    <div class="flex space-x-10 bg-white border border-indigo-700 p-5 rounded absolute top-0 left-0">
      <span class="text-xl" v-if="steps[current_step].show_C"
            v-html="katex.renderToString(`C=\\begin{bmatrix} ${decimals(steps[current_step].C[0][0])} & ${decimals(steps[current_step].C[0][1])}  \\\\ ${decimals(steps[current_step].C[1][0])} & ${decimals(steps[current_step].C[1][1])} \\end{bmatrix}`)"/>
      <span class="text-xl" v-if="steps[current_step].show_m"
            v-html="katex.renderToString(`m=\\begin{bmatrix} ${decimals(steps[current_step].m[0])} \\\\ ${decimals(steps[current_step].m[1])} \\end{bmatrix}`)"/>
      <span class="text-xl my-auto" v-if="steps[current_step].show_sigma"
            v-html="katex.renderToString(`\\sigma= ${decimals(steps[current_step].sigma)}`)"/>
    </div>

    <div class="flex flex-col bg-white border border-indigo-700 p-5 rounded absolute top-0 right-0">

      <div v-for="(row, i) in steps[current_step].latex"
           :class="['text-xl p-1', steps[current_step].highlight_row === i ? 'border-2 border-indigo-600': ''] "
      >
        <span v-html="katex.renderToString(row.string)"></span>
      </div>
    </div>
  </div>
</template>

<script>
import * as math from 'mathjs'
import katex from "katex";
import OnePlusOneES from "./1+1-ES.js";
import OnePlusOneCMAES from "./1+1-CMA-ES.js";
import NormalForm from "./NormalForm.js";
import Test from "./Test.js"
import * as d3 from 'd3'
import ParameterButton from "./misc/ParameterButton.vue";
import Toggle from "./misc/Toggle.vue";
import RadioSelect from "./misc/RadioSelect.vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from '@headlessui/vue'

const algorithms = [
  {id: 0, name: "1+1-ES", class: new OnePlusOneES()},
  {id: 1, name: "1+1-CMA-ES", class: new OnePlusOneCMAES()},
  {id: 2, name: "CMA-ES Normalform", class: new NormalForm()},
  {id: 3, name: "Test", class: new Test()},
]

function parseTransform(transform) {
  const translate = /translate\(([^)]+)\)/.exec(transform);
  const rotate = /rotate\(([^)]+)\)/.exec(transform);

  const result = {};

  if (translate) {
    const translateValues = translate[1].split(' ').map(Number);
    result.translateX = translateValues[0];
    result.translateY = translateValues.length > 1 ? translateValues[1] : 0;
  }

  if (rotate) {
    const rotateValue = rotate[1].split(' ').map(Number);
    result.rotate = rotateValue[0];
    result.rotateCX = rotateValue.length > 1 ? rotateValue[1] : 0;
    result.rotateCY = rotateValue.length > 2 ? rotateValue[2] : 0;
  }

  return result;
}

export default {
  name: "ParameterGraph",
  components: {RadioSelect, Toggle, ParameterButton, Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot},
  data() {
    return {
      state_generator_id: 3,

      steps: [],
      start_state: "manual",
      current_step: 0,
      x: 0,
      y: 0,
      zoom: 1,
      dragging: false,
      base_width: null,
      base_height: null,

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
      show: {
        steps: true,
        settings: true,
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
    state_generator_id() {
      this.steps = this.state_generator.set_start({
        m: [...this.params.m],
        C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
        sigma: this.params.sigma,
        Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
      })
      this.update({...this.steps[this.current_step], duration: 0});
    },
    current_step: function (step, old_step) {
      if (step === 0) {
        this.update_flag = false;
        if (this.start_state === "random") this.set_random_start();
        if (this.start_state === "prev_state") {
          this.params.m = [...this.steps[this.steps.length - 1].m]
          this.params.A = this.steps[this.steps.length - 1].C[0][0]
          this.params.B = this.steps[this.steps.length - 1].C[1][0]
          this.params.C = this.steps[this.steps.length - 1].C[1][1]
          this.params.sigma = this.steps[this.steps.length - 1].sigma
        }
        this.steps = this.state_generator.set_start({
          m: [...this.params.m],
          C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
          sigma: this.params.sigma,
          Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
        })
        this.update_flag = true;
      }

      if (step === (old_step + 1)) this.update(this.steps[this.current_step]);
      else this.update({...this.steps[this.current_step], duration: 0})

    },
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
  created() {
    this.steps = this.state_generator.set_start({
      m: [...this.params.m],
      C: [[this.params.A, this.params.B], [this.params.B, this.params.C]],
      sigma: this.params.sigma,
      Q: [[this.hessian.A, this.hessian.B], [this.hessian.B, this.hessian.C]]
    })
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
    state_generator() {
      return algorithms[this.state_generator_id].class
    },
    algorithms() {
      return algorithms
    },
    katex() {
      return katex
    },
    height() {
      return this.zoom * this.base_height
    },
    width() {
      return this.zoom * this.base_width
    },

  },
  methods: {
    set_random_start() {
      this.params.A = this.$_.random(0.1, 10)
      this.params.C = this.$_.random(0.1, 10)

      const upperBound = Math.sqrt(this.params.A * this.params.C);
      // Generate a uniformly distributed random number between 0 and 1
      const u = this.$_.random(0, 1, true);
      // Transform it to be denser towards the edges
      const t = Math.sin(Math.PI * u);
      // Scale and shift to the range [-sqrt(AC), sqrt(AC)]
      this.params.B = (2 * t - 1) * upperBound;

      this.params.m[0] = this.$_.random(0, 2, true)
      this.params.m[1] = this.$_.random(0, 2, true)
      this.params.sigma = this.$_.random(1, 5, true)
    },
    update(data) {
      d3.select('#container')
          .selectAll("#inner_container")
          .data([data])
          .join(
              enter => enter.append('g')
                  .attr("id", "inner_container")
                  .attr("transform", d => `rotate(${d.rotation})`),
              update => update
                  .transition().duration(data.duration)
                  .attr("transform", d => `rotate(${d.rotation})`)
          )

      // levelsets
      d3.select('#inner_container')
          .selectAll('#levelsets')
          .data([null])
          .join('g').attr("id", "levelsets");


      let hessian_eigen = math.eigs(data.Q).eigenvectors
      let hessian_rotation_angle = Math.atan2(hessian_eigen[0].vector[1], hessian_eigen[0].vector[0]) * (180 / Math.PI);

      d3.select('#inner_container').select("#levelsets")
          .selectAll('.levelset')
          .data(data.levelsets ? this.$_.range(100) : [])
          .join(
              enter => enter
                  .append('ellipse')
                  .attr("class", "levelset")
                  .attr('rx', d => d * data.scaling * Math.sqrt(hessian_eigen[0].value) * 50)
                  .attr('ry', d => d * data.scaling * Math.sqrt(hessian_eigen[1].value) * 50)
                  .attr("transform", d => `rotate(${hessian_rotation_angle})`)
                  .attr('stroke', 'gray')
                  .attr('stroke-width', 1)
                  .attr('fill', 'none'),
              update => update.transition().duration(data.duration)
                  .attr('rx', d => d * data.scaling * Math.sqrt(hessian_eigen[0].value) * 50)
                  .attr('ry', d => d * data.scaling * Math.sqrt(hessian_eigen[1].value) * 50)
                  .attr("transform", d => `rotate(${hessian_rotation_angle})`)
          )

      // axis
      d3.select('#inner_container')
          .selectAll('#x_axis')
          .data(data.x_axis ? [data] : [])
          .join('line')
          .attr("id", "x_axis")
          .attr('y1', -this.height * 10)
          .attr('y2', this.height * 10)
          .attr('stroke', 'rgb(211,211,211)')
          .attr('stroke-width', 2);

      d3.select('#inner_container')
          .selectAll('#y_axis')
          .data(data.y_axis ? [data] : [])
          .join('line')
          .attr("id", "y_axis")
          .attr('x1', -this.width * 10)
          .attr('x2', this.width * 10)
          .attr('stroke', 'rgb(211,211,211)')
          .attr('stroke-width', 2);

      // one level
      d3.select('#inner_container')
          .selectAll('#one_level')
          .data(data.one_level ? [data] : [])
          .join(
              enter => enter.append('circle')
                  .attr("id", "one_level")
                  .attr('stroke', 'black')
                  .attr('stroke-width', 2)
                  .attr('fill', 'none')
                  .attr('r', d => d.scaling * 200),
              update => update.transition().duration(data.duration)
                  .attr('r', d => d.scaling * 200)
          )


      // Connection line between 0,0 and the distribution center
      d3.select('#inner_container')
          .selectAll('#m_line')
          .data(data.m_line ? [data] : [])
          .join(
              enter => enter.append('line')
                  .attr("id", 'm_line')
                  .attr('x2', d => d.m[0] * d.scaling * 200)
                  .attr('y2', d => -d.m[1] * d.scaling * 200)
                  .attr('stroke', '#ea580c')
                  .attr('stroke-width', 2)
              ,
              update => update
                  .transition().duration(data.duration)
                  .attrTween('x2', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('x2');
                      const startY = +this.getAttribute('y2');
                      const endX = d.m[0] * d.scaling * 200;
                      const endY = -d.m[1] * d.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const x = radius * Math.cos(angle);
                        return x;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('x2'), d.m[0] * d.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  })
                  .attrTween('y2', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('x2');
                      const startY = +this.getAttribute('y2');
                      const endX = d.m[0] * d.scaling * 200;
                      const endY = -d.m[1] * d.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const y = radius * Math.sin(angle);
                        return y;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('y2'), -d.m[1] * d.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  })
          )


      // Center of the distribution
      d3.select('#inner_container')
          .selectAll('#m_dot')
          .data(data.m_dot ? [data] : [])
          .join(enter => enter.append('circle')
                  .attr("id", "m_dot")
                  .attr('cx', d => d.m[0] * d.scaling * 200)
                  .attr('cy', d => -d.m[1] * d.scaling * 200)
                  .attr('r', 2)
                  .attr('fill', '#ea580c')
                  .attr('stroke', '#ea580c')
                  .attr('stroke-width', 1),

              update => update
                  .transition().duration(data.duration)
                  .attrTween('cx', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('cx');
                      const startY = +this.getAttribute('cy');
                      const endX = d.m[0] * d.scaling * 200;
                      const endY = -d.m[1] * d.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const x = radius * Math.cos(angle);
                        return x;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('cx'), d.m[0] * d.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  })
                  .attrTween('cy', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('cx');
                      const startY = +this.getAttribute('cy');
                      const endX = d.m[0] * d.scaling * 200;
                      const endY = -d.m[1] * d.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const y = radius * Math.sin(angle);
                        return y;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('cy'), -d.m[1] * d.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  })
          )


      // Center of the distribution
      d3.select('#inner_container')
          .selectAll('.population')
          .data(data.population)
          .join(enter => enter.append('circle')
                  .attr("class", "population")
                  .attr('cx', d => d.coords[0] * data.scaling * 200)
                  .attr('cy', d => -d.coords[1] * data.scaling * 200)
                  .transition()
                  .delay((d, i) => d.delay)
                  .attr('r', d => d.r)
                  .attr('fill', d => d.color)
                  .attr('stroke', d => d.color)
                  .attr('stroke-width', 1),

              update => update
                  .transition().duration(data.duration)
                  .attr('fill', d => d.color)
                  .attr('stroke', d => d.color)
                  .attr('r', d => d.r)
                  .attrTween('cx', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('cx');
                      const startY = +this.getAttribute('cy');
                      const endX = d.coords[0] * data.scaling * 200;
                      const endY = -d.coords[1] * data.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (data.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const x = radius * Math.cos(angle);
                        return x;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('cx'), d.coords[0] * data.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  })
                  .attrTween('cy', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const startX = +this.getAttribute('cx');
                      const startY = +this.getAttribute('cy');
                      const endX = d.coords[0] * data.scaling * 200;
                      const endY = -d.coords[1] * data.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      const endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (data.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const y = radius * Math.sin(angle);
                        return y;
                      };
                    } else {
                      const i = d3.interpolateNumber(+this.getAttribute('cy'), -d.coords[1] * data.scaling * 200);
                      return function (t) {
                        return i(t);
                      };
                    }
                  }),
              exit => exit.transition()
                  .delay((d, i) => d.delay)
                  .attr('r', 0)
                  .attr('fill', 'lightgray')
                  .attr('stroke', 'lightgray')
                  .attr('stroke-width', 0)
                  .remove()
          )


      // Ellipse
      let eigen = math.eigs(data.C).eigenvectors
      let rotation_angle = Math.atan(eigen[0].vector[1] / eigen[0].vector[0]) * (180 / Math.PI);

      if (data.rotation_bias) {
        let prev_rotation_angle = parseTransform(d3.select('#inner_container')
            .select('#std_dev').select("ellipse").attr('transform')).rotate
        d3.select('#inner_container')
            .select('#std_dev')
            .select("ellipse")
            .attr('transform', `rotate(${prev_rotation_angle + (data.rotation_bias * 180)})`)
      }


      d3.select('#inner_container')
          .selectAll('#std_dev')
          .data(data.ellipse ? [data] : [])
          .join(
              enter => enter.append('g')
                  .attr("id", "std_dev")
                  .attr('transform', d => `translate(${d.m[0] * d.scaling * 200} ${-d.m[1] * d.scaling * 200})`)
                  .append('ellipse')
                  .attr('transform', `rotate(${-rotation_angle})`)
                  .attr('rx', d => Math.sqrt(d.sigma * Math.sqrt(eigen[0].value)) * d.scaling * 200)
                  .attr('ry', d => Math.sqrt(d.sigma * Math.sqrt(eigen[1].value)) * d.scaling * 200)
                  .attr('fill', 'none')
                  .attr('stroke', '#ea580c')
                  .attr('stroke-width', 2),
              update => update.transition().duration(data.duration)
                  .attrTween('transform', function (d) {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                      const result = parseTransform(this.getAttribute('transform'))
                      const startX = result.translateX;
                      const startY = result.translateY;

                      const endX = d.m[0] * d.scaling * 200;
                      const endY = -d.m[1] * d.scaling * 200;

                      const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                      const startAngle = Math.atan2(startY, startX);
                      let endAngle = Math.atan2(endY, endX);

                      return function (t) {
                        let angle = startAngle + t * (endAngle - startAngle);
                        if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);
                        return `translate(${x} ${y})`;
                      };
                    } else {
                      const result = parseTransform(this.getAttribute('transform'))
                      const x = d3.interpolateNumber(result.translateX, d.m[0] * d.scaling * 200);
                      const y = d3.interpolateNumber(result.translateY, -d.m[1] * d.scaling * 200);
                      return function (t) {
                        return `translate(${x(t)} ${y(t)})`;
                      };
                    }
                  })
                  .select("ellipse")
                  .attr('transform', `rotate(${-rotation_angle})`)
                  .attr('rx', d => Math.sqrt(d.sigma * Math.sqrt(eigen[0].value)) * d.scaling * 200)
                  .attr('ry', d => Math.sqrt(d.sigma * Math.sqrt(eigen[1].value)) * d.scaling * 200)
          )

      // d3.select('#inner_container')
      //     .selectAll('#eigen_line')
      //     .data([data])
      //     .join(
      //         enter => enter.append("g")
      //             .attr("id", "eigen_line")
      //             .attr('transform', d => `translate(${d.m[0] * d.scaling * 200} ${-d.m[1] * d.scaling * 200})`)
      //             .append("line")
      //             .attr('transform', `rotate(${rotation_angle})`)
      //             .attr("x1", -200)
      //             .attr("y1", 0)
      //             .attr("x2", 200)
      //             .attr("y2", 0)
      //             .attr('stroke', 'green')
      //             .attr('stroke-width', 2),
      //         update => update
      //             .attr('transform', d => `translate(${d.m[0] * d.scaling * 200} ${-d.m[1] * d.scaling * 200})`)
      //             .select("line")
      //             .attr('transform', `rotate(${rotation_angle})`)
      //     )

      if (data.rotation_bias) {
        d3.select('#inner_container')
            .select('#std_dev')
            .select("ellipse")
            .transition()
            .duration(0)
            .delay(data.duration)
            .attr('transform', `rotate(${rotation_angle})`)
      }
    },
    decimals(value, decimals = 2) {
      return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
    },
    drag(e) {
      if (this.dragging) {
        this.x -= this.zoom * e.movementX
        this.y -= this.zoom * e.movementY
      }
    },
    wheel: function (event) {
      event.preventDefault();
      if (event.wheelDelta > 0) this.zoom /= 1.1
      if (event.wheelDelta < 0) this.zoom *= 1.1
    },
    startDrag() {
      this.dragging = true;
    },
    stopDrag() {
      this.dragging = false;
    },
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
