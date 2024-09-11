import * as math from "mathjs";
import * as _ from 'lodash'
import {defaultValues} from "../../components/defaults.js";

export default class {
    base_defaults = {
        duration: 1000,
        delay: 0,
        transition: "linear", // linear, rotation
        rotation_bias: false,
    }

    _start_state = {
        viewbox: {
            x: 0,
            y: 0,
            zoom: 1
        },
        equations: [],
        graphics: [],
    }

    start_state = {}
    steps = []


    set_start(state) {
        this.start_state.algorithm = {...this._start_state.algorithm, ...this.start_state.algorithm, ...state}
        return this.fill_step_cache()
    }


    fill_step_cache() {
        let step_cache = [];

        // add default values to create a complete cur_state
        let cur_state = _.merge({}, this._start_state, this.start_state)
        for (let module of this.modules) {
            cur_state[module.name] = _.merge(module.options, cur_state[module.name])
        }


        let exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.base_defaults, defaultValues)

        for (let module of this.modules) {
            exp_state[module.name] =
                applyDefaultValues(_.merge(module.options, cur_state[module.name]), this.base_defaults, module.defaults)
        }

        step_cache.push(exp_state)


        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            // update the cur_state
            this.steps[cur_step](cur_state)

            // expand everything with its defaults
            exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.base_defaults, defaultValues)

            for (let module of this.modules) {
                exp_state[module.name] =
                    applyDefaultValues(cur_state[module.name], this.base_defaults, module.defaults)
            }

            step_cache.push(exp_state)
        }

        return step_cache
    }

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
