import * as math from "mathjs";
import * as _ from 'lodash'

export default class {
    _start_state = {
        viewbox: {
            x: 0,
            y: 0,
            zoom: 1,
        },

        // transition options
        duration: 1000,
        delay: 0,
        transition: "linear", // linear, rotation
        rotation_bias: false,
        //
        // equations: [],
        // graphics: [],

        graph: {
            // Visibility
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

            //
            rotation: 0,
            scaling: 1,

            // data
            // Q: [[1, 0], [0, 1]], // fitness function params
        },
        algorithm: {
            // Visibility
            m_line: false,
            m_dot: false,
            ellipse: false,
            density: false,

            rotation: 0,
            scaling: 1,

            // data
            m: [0, 0],
            C: [[1, 0.5], [0.5, 1]],
            sigma: 1,
            population: [],
        }
    }

    fitness(x, Q = false) {
        if (Q === false) {
            Q = this.start_state.Q
        }
        return math.multiply(math.multiply(math.transpose(x), Q), x);
    }

    set_fitness_params(params) {
        this.fitness_params = params;
    }

    set_start(state) {
        this._start_state.algorithm.m = state.m
        // this.start_state = {...this._start_state, ...this.start_state, ...state}
        return this.fill_step_cache()
    }


    fill_step_cache() {
        const attributes = ['duration', 'delay', "transition", "rotation_bias"]

        let step_cache = [];

        let cur_state = _.merge({}, this._start_state, this.start_state)
        let exp_state = expandValues(_.cloneDeep(cur_state), attributes)
        exp_state = inheritAttributes(exp_state, {
            rotation_bias: false,
            delay: cur_state.delay,
            duration: cur_state.duration,
            transition: "linear"
        }, attributes);

        step_cache.push(exp_state)

        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            cur_state = _.merge({},
                cur_state,
                {
                    rotation_angle: false
                },
                this.steps[cur_step](cur_state));



            // fill everything with delay and duration
            exp_state = expandValues(_.cloneDeep(cur_state), attributes)
            exp_state = inheritAttributes(exp_state, {
                rotation_bias: false,
                delay: cur_state.delay,
                duration: cur_state.duration,
                transition: "linear"
            }, attributes);

            step_cache.push(exp_state)
        }

        return step_cache
    }

    start_state = {}
    steps = []
}

function expandValues(obj, exceptions) {
    for (const key in obj) {
        if (key === "value" || exceptions.includes(key)) continue;
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            obj[key] = expandValues(obj[key], exceptions)
        } else {
            obj[key] = {value: obj[key]};
        }
    }

    return obj;
}


function inheritAttributes(obj, parentAttrs, attributesToInherit) {
    // Iterate over each key in the current object
    for (const key in obj) {
        if (key === "value") continue;
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            // Inherit attributes from parent if not explicitly set on the child
            const currentAttrs = {...parentAttrs};

            attributesToInherit.forEach(attr => {
                // If the attribute is explicitly set on the current object, update the currentAttrs
                if (obj[key][attr] !== undefined ) {
                    currentAttrs[attr] = obj[key][attr];
                } else if("value" in obj[key]){
                    // Otherwise, inherit from the parent
                    obj[key][attr] = currentAttrs[attr];
                }
            });

            // Recursively apply to nested objects, passing down the current attributes
            inheritAttributes(obj[key], currentAttrs, attributesToInherit);
        }
    }
    return obj;
}

