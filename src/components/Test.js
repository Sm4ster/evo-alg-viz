import * as math from "mathjs";
import {decimals} from "./misc/functions.js";
import parentAnimation from "./StateGenerator.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";
import _ from "lodash";
import distribution from "lodash";

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class Test extends parentAnimation {

    start_state = {
        show_C: false,
        highlight_row: 0,
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

    steps = [
        (prev_state) => {
            let distribution = MultivariateNormal(prev_state.m, math.multiply(prev_state.sigma, prev_state.C));
            let population = []

            for(let i = 0; i < 10000; i++) {
                population.push( {delay: 0, r: 2, color: "gray", coords: distribution.sample()});
            }

            return {
                population,
                highlight_row: 1,
            }
        },
        (prev_state) => {
            let population = [];

            for(let e of prev_state.population) {
                population.push({
                    delay: 0,
                    r: 1,
                    color: this.fitness(e.coords) > this.fitness(prev_state.m) ? "red" : "green",
                    coords: e.coords
                });
            }

            return {
                highlight_row: 2,
                population
            }
        }
    ]
}
