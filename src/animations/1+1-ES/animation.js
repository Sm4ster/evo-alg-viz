import * as math from "mathjs";
import parentAnimation from "../parentAnimation.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";
import EvolutionStrategies from "../../modules/EvolutionStrategies/module.js"
import ConvexQuadratic2D from "../../modules/ConvexQuadratic2D/module.js"

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class OnePlusOneES extends parentAnimation {

    modules = [
        {landscape: new ConvexQuadratic2D},
        {algorithm: new EvolutionStrategies}
    ]


    app_defaults = {
        start_state: "prev_state"
    }

    start_state = {
        viewbox: {
            zoom: 1,
            x: 0,
            y: 0,
        },

        equations: [
            {
                innerClass: "bg-black",
                class: "text-indigo-700",
                scaling: 1,
                x: 500,
                y: -550,
                value: "0. \\ \\textbf{for} \\ t=1,2,..., \\textit{until satisfied} \\ \\textbf{do}"
            },
            {
                innerClass: "bg-black",
                x: 500,
                y: -520,
                scaling: 1,
                value: "1. \\quad x_t \\sim m_t + \\sigma_t \\cdot \\mathcal{N}(0, I)"
            },
            {
                innerClass: "bg-black",
                x: 500,
                y: -490,
                scaling: 1,
                class: "",
                value: "2. \\quad \\textbf{if} \\ f(x_t) \\leq f(m_t) \\ \\textbf{then}"
            },
            {
                innerClass: "bg-black",
                x: 500,
                y: -460,
                scaling: 1,
                class: "",
                value: "3. \\qquad m_{t+1} \\leftarrow x_t"
            },
            {
                innerClass: "bg-black",
                x: 500,
                y: -430,
                scaling: 1,
                class: "",
                value: "4. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha"
            },
            {
                innerClass: "",
                x: 500,
                y: -400,
                scaling: 1,
                class: "",
                value: "5. \\quad \\textbf{else}"
            },
            {
                innerClass: "",
                x: 500,
                y: -370,
                scaling: 1,
                class: "",
                value: "6. \\qquad m_{t+1} \\leftarrow m_t"
            },
            {
                innerClass: "",
                x: 500,
                y: -340,
                scaling: 1,
                class: "",
                value: "7. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha^{-1/4}"
            },
        ],
    }

    steps = [
        ({algorithm, equations}) => {
            let distribution = MultivariateNormal(algorithm.state.m, math.multiply(algorithm.state.sigma, algorithm.state.C));

            algorithm.state.population = [{r: 5, color: "gray", coords: distribution.sample()}]

            // move to the second equation
            equations[0].class = ""
            equations[1].class = "text-indigo-700"
        },
        ({algorithm, landscape}) => {
            algorithm.state.population = [{
                r: 5,
                color: landscape.fitness(algorithm.state.population[0].coords) > landscape.fitness(algorithm.state.m) ? "red" : "green",
                coords: algorithm.state.population[0].coords
            }]

        },
        ({algorithm, landscape, equations}) => {
            if (landscape.fitness(algorithm.state.population[0].coords) <= landscape.fitness(algorithm.state.m)) {
                algorithm.state.m = algorithm.state.population[0].coords;
                algorithm.state.population[0].r = 0;
            } else {
                equations[6].class = "text-indigo-700"
            }

        },
        ({algorithm, landscape}) => {
            let alpha = 3 / 2;
            if (landscape.fitness(algorithm.state.population[0].coords) <= landscape.fitness(algorithm.state.m)) {
                algorithm.state.sigma = algorithm.state.sigma * alpha
            } else {
                algorithm.state.sigma = algorithm.state.sigma * (1 / Math.pow(alpha, 1 / 4))
                {
                    highlight_row: 4
                }
            }

        },
    ]
}
