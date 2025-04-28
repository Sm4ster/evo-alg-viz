import * as _ from 'lodash'
import {defaultValues} from "../components/defaults.js";

export default class {
    base_defaults = {
        duration: 1000,
        delay: 0,
        transition: "linear", // linear, rotation
        rotation_bias: false,
    }

    modules = []
    _modules = []

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
    step_cache = []

    init() {
        for (let module of this.modules) {
            let module_alias;
            if (_.isPlainObject(module)) {
                module_alias = Object.keys(module)[0]
                module = module[Object.keys(module)[0]]
            } else module_alias = module.name

            module.parent_animation = this
            this._modules.push({alias: module_alias, module: module})
        }
    }

    fill_step_cache() {
        this.step_cache = [];

        // add default values to create a complete cur_state
        let cur_state= _.merge({}, this._start_state, this.start_state)

        for (const {module, alias} of this._modules) {
            cur_state[alias] = _.merge(_.cloneDeep(module.start_state), _.cloneDeep(cur_state[alias]))
        }


        let exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.base_defaults, defaultValues)

        for (const {module, alias} of this._modules) {
            exp_state[alias] = applyDefaultValues(_.merge(module.start_state, cur_state[alias]), this.base_defaults, module.defaults)
        }

        this.step_cache.push(_.cloneDeep(exp_state))

        for (let cur_step = 0; cur_step < this.steps.length; cur_step++) {
            // update the cur_state
            this.steps[cur_step](cur_state)

            // expand everything with its defaults
            exp_state = applyDefaultValues(_.cloneDeep(cur_state), this.base_defaults, defaultValues)

            for (const {module, alias} of this._modules) {
                exp_state[alias] =
                    applyDefaultValues(cur_state[alias], this.base_defaults, module.defaults)
            }

            this.step_cache.push(_.cloneDeep(exp_state))
        }

        return this.step_cache
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
