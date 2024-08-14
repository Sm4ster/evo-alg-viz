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
            density: true,
        },

        equations: [
            {
                scaling: 1.5,
                position: [100, -280],
                value: "0. \\ \\textbf{for} \\ t=1,2,..., \\textit{until satisfied} \\ \\textbf{do}"
            },
            {
                class: "text-indigo-700",
                scaling: 1.5,
                position: [100, -250],
                value: "1. \\quad x_t \\sim m_t + \\sigma_t \\cdot \\mathcal{N}(0, I)"
            }
        ],


        overlay: [
            {
                position: [0, 0],
                latex: [
                    {class: "", string: "0. \\ \\textbf{for} \\ t=1,2,..., \\textit{until satisfied} \\ \\textbf{do}"},
                    {class: "", string: "1. \\quad x_t \\sim m_t + \\sigma_t \\cdot \\mathcal{N}(0, I)"},
                    {class: "", string: "2. \\quad \\textbf{if} \\ f(x_t) \\leq f(m_t) \\ \\textbf{then}"},
                    {class: "", string: "3. \\qquad m_{t+1} \\leftarrow x_t"},
                    {class: "", string: "4. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha"},
                    {class: "", string: "5. \\quad \\textbf{else}"},
                    {class: "", string: "6. \\qquad m_{t+1} \\leftarrow m_t"},
                    {class: "", string: "7. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha^{-1/4}"},
                ]
            }
        ]
    }

    steps = [
        ({algorithm}) => {
            let distribution = MultivariateNormal(algorithm.m, math.multiply(algorithm.sigma, algorithm.C));

            algorithm.population = [{r: 5, color: "gray", coords: distribution.sample()}]
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
