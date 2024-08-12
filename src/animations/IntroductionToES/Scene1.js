import parentAnimation from "../lib/StateGenerator.js";

import knob from './graphics/knob-svgrepo-com.svg?raw'
import machine from './graphics/machinery-svgrepo-com.svg?raw'
import _ from 'lodash';

export default class Scene1 extends parentAnimation {

    start_state = {
        y_axis: true,
        x_axis: true,
    }

    steps = [
        (prev_state) => {
            return {
                equations: [
                    {
                        position: [-32, 12],
                        scaling: 2.5,
                        id: "number",
                        text: "5"
                    }
                ],
                graphics: [
                    {
                        id: "knob",
                        position: [-50, -50],
                        rotation: 0,
                        scaling: 5,
                        data: machine
                    },
                    {
                        id: "knob1",
                        position: [-250, 120],
                        rotation: 0,
                        scaling: 0.7,
                        data: knob
                    },
                    {
                        id: "knob2",
                        position: [-150, 120],
                        rotation: 0,
                        scaling: 0.7,
                        data: knob
                    }
                ],
                scaling: 1
            }
        },
        // (prev_state) => {
        // let svg = _.cloneDeep(prev_state.svg);
        // svg.find(d => d.id === "knob2").rotation = 45
        //     console.log(svg)
        //     return {
        //         formula: [
        //             {
        //                 position: [-45, 12],
        //                 scaling: 2.5,
        //                 id: "number",
        //                 text: "x"
        //             }
        //         ],
        //         zoom: .5,
        //         x: 50,
        //         scaling: 5,
        //         svg: svg
        //     }
        // }
    ]
}
