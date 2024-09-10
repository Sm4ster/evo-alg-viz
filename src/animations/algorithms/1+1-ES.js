import * as math from "mathjs";
import {decimals} from "../lib/functions.js";
import parentAnimation from "../lib/StateGenerator.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";
import _ from "lodash";
import EvolutionStrategies from "../../modules/EvolutionStrategies/module.js"

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class OnePlusOneES extends parentAnimation {

    modules = [
        new EvolutionStrategies
    ]


    app_defaults = {
        start_state: "prev_state"
    }

    start_state = {
        viewbox: {
            zoom: 0.2,
            x: 300,
            y: 350,
            graph_rotation: 0,
            algorithm_rotation: 0,
            scaling: 1,
        },

        algorithm: {
            C: [[1, 0.5], [0.5, 1]],
        },

        equations: [
            {
                innerClass: "bg-black",
                class: "text-indigo-700",
                scaling: 1,
                x: 300,
                y: -350,
                value: "0. \\ \\textbf{for} \\ t=1,2,..., \\textit{until satisfied} \\ \\textbf{do}"
            },
            {
                innerClass: "bg-black",
                class: "text-indigo-700",
                x: 300,
                y: -320,
                scaling: 1,
                value: "1. \\quad x_t \\sim m_t + \\sigma_t \\cdot \\mathcal{N}(0, I)"
            },
            {
                innerClass: "bg-black",
                x: 300,
                y: -290,
                scaling: 1,
                class: "",
                value: "2. \\quad \\textbf{if} \\ f(x_t) \\leq f(m_t) \\ \\textbf{then}"
            },
            {
                innerClass: "bg-black",
                x: 300,
                y: -260,
                scaling: 1,
                class: "",
                value: "3. \\qquad m_{t+1} \\leftarrow x_t"
            },
            {
                innerClass: "bg-black",
                x: 300,
                y: -230,
                scaling: 1,
                class: "",
                value: "4. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha"
            },
            {
                innerClass: "",
                x: 300,
                y: -200,
                scaling: 1,
                class: "",
                value: "5. \\quad \\textbf{else}"
            },
            {
                innerClass: "",
                x: 300,
                y: -170,
                scaling: 1,
                class: "",
                value: "6. \\qquad m_{t+1} \\leftarrow m_t"
            },
            {
                innerClass: "",
                x: 300,
                y: -140,
                scaling: 1,
                class: "",
                value: "7. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha^{-1/4}"
            },
        ],
    }

    steps = [
        ({viewbox, equations}) => {
        console.log(equations[0])
            // equations[0].rotation = {value: 45, delay: 200, duration: 2000}

            // viewbox.x = {
            //     delay: 0,
            //     duration: 3000,
            //     value: 250
            // }
            // viewbox.y = {
            //     delay: 1500,
            //     duration: 1500,
            //     value: 125
            // }
            // viewbox.zoom = {
            //     delay: 2000,
            //     duration: 2000,
            //     value: 2
            // }
        },
        // ({algorithm, equations}) => {
        //     let distribution = MultivariateNormal(algorithm.m, math.multiply(algorithm.sigma, algorithm.C));
        //
        //     algorithm.population = [{r: 5, color: "gray", coords: distribution.sample()}]
        //     equations[1].class = "text-indigo-700"
        // },
        // ({algorithm}) => {
        //     algorithm.population = [{
        //         delay: 0,
        //         r: 5,
        //         color: this.fitness(algorithm.population[0].coords) > this.fitness(algorithm.m) ? "red" : "green",
        //         coords: algorithm.population[0].coords
        //     }]
        //
        // },
        // ({algorithm}) => {
        //     if (this.fitness(algorithm.population[0].coords) <= this.fitness(algorithm.m)) {
        //         algorithm.m = algorithm.population[0].coords;
        //         algorithm.population[0].r = 0;
        //     } else {
        //         {
        //             highlight_row: 6
        //         }
        //     }
        //
        // },
        // ({algorithm}) => {
        //     let alpha = 3 / 2;
        //     if (this.fitness(algorithm.population[0].coords) <= this.fitness(algorithm.m)) {
        //         algorithm.sigma = algorithm.sigma * alpha
        //     } else {
        //         algorithm.sigma = algorithm.sigma * (1 / Math.pow(alpha, 1 / 4))
        //         {
        //             highlight_row: 4
        //         }
        //     }
        //
        // },
    ]
}
