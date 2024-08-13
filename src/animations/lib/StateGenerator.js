import * as math from "mathjs";
import * as _ from 'lodash'

export default class {
    animation = {
        duration: 1000,
        delay: 0,
        transition: "linear", // linear, rotation
        rotation_bias: false,
    }

    _start_state = {
        viewbox: {
            x: 0,
            y: 0,
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
        },

        equations: [],
        graphics: [],

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
        const attributes = ['duration', 'delay', "transition", "rotation_bias"]
        const exceptions = ["Q", "m", "C", "sigma", "r", "color", "coords"]

        let step_cache = [];

        let cur_state = _.merge({}, this._start_state, this.start_state)
        // console.log("cur_state:", cur_state)
        let exp_state = expandValues(_.cloneDeep(cur_state), [...attributes, ...exceptions])
        // console.log("exp_state:", exp_state)
        exp_state = inheritAttributes(exp_state, this.animation, attributes, exceptions);

        step_cache.push(exp_state)

        // console.log(step_cache)

        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            cur_state = _.merge({}, cur_state, this.steps[cur_step](cur_state));

            // fill everything with delay and duration
            exp_state = expandValues(_.cloneDeep(cur_state), [...attributes, ...exceptions])
            exp_state = inheritAttributes(exp_state, this.animation, attributes, exceptions);

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
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
            if (!Array.isArray(obj[key])) obj[key] = expandValues(obj[key], exceptions)
            else {
                obj[key].map(e => expandValues(e, exceptions))
            }
        } else {
            obj[key] = {value: obj[key]};
        }
    }

    return obj;
}


function inheritAttributes(obj, parentAttrs, attributesToInherit, exceptions) {

    const currentAttrs = {...parentAttrs};
    // Iterate over each key in the current object
    if(typeof obj === 'object' && !Array.isArray(obj)){
        attributesToInherit.forEach(attr => {
            // If the attribute is explicitly set on the current object, update the currentAttrs
            if (obj[attr] !== undefined) {
                currentAttrs[attr] = obj[attr];
            } else {
                // Otherwise, inherit from the parent
                obj[attr] = currentAttrs[attr];
            }
        });
    }

    for (const key in obj) {
        if (key === "value" || exceptions.includes(key)) continue;
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
            // Recursively apply to nested objects, passing down the current attributes
            if (!Array.isArray(obj[key])) {

                // Inherit attributes from parent if not explicitly set on the child
                attributesToInherit.forEach(attr => {
                    // If the attribute is explicitly set on the current object, update the currentAttrs
                    if (obj[key][attr] !== undefined) {
                        currentAttrs[attr] = obj[key][attr];
                    } else if ("value" in obj[key]) {
                        // Otherwise, inherit from the parent
                        obj[key][attr] = currentAttrs[attr];
                    }
                });
                obj[key] = inheritAttributes(obj[key], currentAttrs, attributesToInherit, exceptions);
            } else {
                obj[key] = obj[key].map(e =>  inheritAttributes(e, currentAttrs, attributesToInherit, exceptions));
            }
        }
    }
    return obj;
}

