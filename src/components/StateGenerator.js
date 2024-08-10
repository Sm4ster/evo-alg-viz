import * as math from "mathjs";
import {decimals} from "./misc/functions.js";

export default class {
    _start_state = {
        m: [0, 0],
        C: [[1, 0], [0, 1]],
        sigma: 1,
        population: [],

        // fitness function params
        Q: [[1, 0], [0, 1]],

        formula: [],
        svg: [],

        x: 0,
        y: 0,
        zoom: 1,

        // Visibility
        center: false,
        levelsets: false,
        one_level: false,
        m_line: false,
        m_dot: false,
        ellipse: false,
        x_axis: false,
        y_axis: false,
        alpha: false,
        show_m: false,
        show_C: false,
        show_sigma: false,
        density: false,

        // transition type
        transition: 'rotation',
        rotation: 0,
        scaling: 1,
        duration: 1000,
    }

    fitness(x, Q = false) {
        if (Q === false) {
            Q = this.start_state.Q // [[this.start_state.Q[0][0],  this.start_state.Q[0][1]],[ this.start_state.Q[1][0], this.start_state.Q[1][1]]]
        }
        // console.log(math.transpose(x), math.multiply(math.multiply(math.transpose(x), Q), x))
        return math.multiply(math.multiply(math.transpose(x), Q), x);
    }

    set_fitness_params(params) {
        this.fitness_params = params;
    }

    set_start(state) {
        this.start_state = {...this._start_state, ...this.start_state, ...state}
        return this.fill_step_cache()
    }


    fill_step_cache() {
        let step_cache = [];

        let cur_state = {...this._start_state, ...this.start_state}
        step_cache.push(cur_state)

        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            cur_state = {
                ...cur_state,
                transition: "linear",
                rotation_bias: false,
                rotation_angle: false,
                ...this.steps[cur_step](cur_state),

            }
            step_cache.push(cur_state)
        }

        return step_cache
    }

    start_state = {}
    steps = []
}