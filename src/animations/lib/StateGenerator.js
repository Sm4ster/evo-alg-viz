import * as math from "mathjs";
import * as _ from 'lodash'
import {defaultValues} from "../../components/defaults.js";

export default class {
    animation = {
        duration: 1000,
        delay: 0,
        transition: "linear", // linear, rotation
        rotation_bias: false,
    }

    _start_state = {
        viewbox: {
            x: -1,
            y: 1,
            zoom: 1,
            graph_rotation: 0,
            algorithm_rotation: 0,
            scaling: 1,
        },

        canvas: {
            // Visibility
            m_line: false,
            m_dot: false,
            ellipse: false,
            density: false,

            x_axis: {
                line: false,
                ticks: false,
                tick_numbers: false
            },
            y_axis: {
                line: false,
                ticks: false,
                tick_numbers: false
            },
            centerpoint: false,
            levelsets: false,
            one_level: false,
            state_overlay: false,
            algorithm_overlay: true
        },

        equations: [],
        graphics: [],

        overlay: [],

        algorithm: {
            // data
            Q: [[1, 0], [0, 1]], // fitness function params
            m: [0, 0],
            C: [[1, 0.5], [0.5, 1]],
            sigma: 1,
            population: [],
        }
    }

    fitness(x, Q = false) {
        if (Q === false) {
            Q = _.merge({}, this._start_state, this.start_state).algorithm.Q
        }
        return math.multiply(math.multiply(math.transpose(x), Q), x);
    }


    set_start(state) {
        this.start_state.algorithm = {...this._start_state.algorithm, ...this.start_state.algorithm, ...state}
        return this.fill_step_cache()
    }


    fill_step_cache() {
        const attributes = ['duration', 'delay', "scaling", "transition", "rotation_bias", "innerClass"]
        const exceptions = ["Q", "m", "C", "sigma", "r", "color", "coords", "overlay", "class"]

        let step_cache = [];

        let cur_state = _.merge({}, this._start_state, this.start_state)

        let exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.animation, defaultValues)

        step_cache.push(exp_state)


        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            cur_state = _.merge({}, cur_state, this.steps[cur_step](cur_state));

            // fill everything with delay and duration
            exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.animation, defaultValues)

            step_cache.push(exp_state)
        }

        return step_cache
    }

    start_state = {}
    steps = []
}


function applyDefaultValues(target, defaultValues, defaultMap) {
    defaultMap.forEach(item => {
        const path = item.path.split('.');
        let defaults = {}

        // Collect default values that need to be inherited
        for (let key in item.defaults) {
            if (item.defaults[key] === "inherit") {
                defaults[key] = defaultValues[key];
            }
        }

        function applyDefaultsRecursively(current, pathIndex) {
            const currentKey = path[pathIndex];

            if (currentKey !== undefined) {
                if (currentKey === '*') {
                    for (let i = 0; i < current.length; i++) {
                        current[i] = applyDefaultsRecursively(current[i], pathIndex + 1);
                    }
                } else current[currentKey] = applyDefaultsRecursively(current[currentKey], pathIndex + 1);
                return current
            } else {
                // Apply defaults to the final property in the path
                if (_.isPlainObject(current)) {
                    return {
                        ...item.defaults,
                        ...defaults,
                        ...current // Merge existing values with defaults
                    };
                } else {
                    return {
                        value: current,
                        ...item.defaults,
                        ...defaults,
                        ...current // Merge existing values with defaults
                    };
                }
            }
        }

        target = applyDefaultsRecursively(target, 0);
    });

    return target
}
