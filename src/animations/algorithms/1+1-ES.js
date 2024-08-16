import * as math from "mathjs";
import {decimals} from "../lib/functions.js";
import parentAnimation from "../lib/StateGenerator.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";
import _ from "lodash";

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class OnePlusOneES extends parentAnimation {

    app_defaults = {
        start_state: "prev_state"
    }

    start_state = {
        canvas: {
            m_dot: true,
            ellipse: true,
            x_axis: {
                line: true,
                ticks: false,
                tick_numbers: false
            },
            y_axis: {
                line: true,
                ticks: false,
                tick_numbers: false
            },
            centerpoint: true,
            levelsets: true,
            // density: true,
        },

        equations: [
            {
                class: "text-indigo-700",
                position: [300, -350],
                value: "0. \\ \\textbf{for} \\ t=1,2,..., \\textit{until satisfied} \\ \\textbf{do}"
            },
            {
                class: "text-indigo-700",
                position: [300, -320],
                value: "1. \\quad x_t \\sim m_t + \\sigma_t \\cdot \\mathcal{N}(0, I)"
            },
            {
                position: [300, -290],
                class: "",
                value: "2. \\quad \\textbf{if} \\ f(x_t) \\leq f(m_t) \\ \\textbf{then}"
            },
            {
                position: [300, -260],
                class: "",
                value: "3. \\qquad m_{t+1} \\leftarrow x_t"
            },
            {
                position: [300, -230],
                class: "",
                value: "4. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha"
            },
            {
                position: [300, -200],
                class: "",
                value: "5. \\quad \\textbf{else}"
            },
            {
                position: [300, -170],
                class: "",
                value: "6. \\qquad m_{t+1} \\leftarrow m_t"
            },
            {
                position: [300, -140],
                class: "",
                value: "7. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha^{-1/4}"
            },
        ],
    }

    steps = [
        ({algorithm, equations}) => {
            let distribution = MultivariateNormal(algorithm.m, math.multiply(algorithm.sigma, algorithm.C));

            algorithm.population = [{r: 5, color: "gray", coords: distribution.sample()}]
            equations[1].class="text-indigo-700"
        },
        ({algorithm}) => {
            algorithm.population = [{
                delay: 0,
                r: 5,
                color: this.fitness(algorithm.population[0].coords) > this.fitness(algorithm.m) ? "red" : "green",
                coords: algorithm.population[0].coords
            }]

        },
        ({algorithm}) => {
            if (this.fitness(algorithm.population[0].coords) <= this.fitness(algorithm.m)) {
                algorithm.m = algorithm.population[0].coords;
                algorithm.population[0].r = 0;
            } else {
                {
                    highlight_row: 6
                }
            }

        },
        ({algorithm}) => {
            let alpha = 3 / 2;
            if (this.fitness(algorithm.population[0].coords) <= this.fitness(algorithm.m)) {
                algorithm.sigma = algorithm.sigma * alpha
            } else {
                algorithm.sigma = algorithm.sigma * (1 / Math.pow(alpha, 1 / 4))
                {
                    highlight_row: 4
                }
            }

        },
    ]
}
