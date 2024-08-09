import parentAnimation from "./StateGenerator.js";

import knob from './knob-svgrepo-com.svg?raw'


export default class Scene1 extends parentAnimation {

    start_state = {}

    steps = [
        (prev_state) => {
            return {
                svg: [{
                    id: "knob",
                    position: [-50, -50],
                    rotation: 0,
                    scaling: 1,
                    data: knob
                }],
                scaling: 1
            }
        },
        (prev_state) => {
            return {
                svg: [{
                    id: "knob",
                    position: [-50, -50],
                    rotation: 45,
                    scaling: 1,
                    data: knob
                }],
                scaling: 5
            }
        }
    ]
}
