import * as math from "mathjs";
import parentAnimation from "../parentAnimation.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class OnePlusOneCMAES extends parentAnimation {

    start_state = {
        highlight_row: 0,
        latex: [
            {class: "", string: "0. \\ \\textbf{while} \\ \\textit{stopping criterion not met} \\ \\textbf{do}"},
            {class: "", string: "1. \\quad z \\sim \\mathcal{N}(0, C) \\ , \\  x = m + \\sigma \\cdot z"},
            {class: "", string: "2. \\quad \\textbf{if} \\ f(x) \\leq f(m) \\ \\textbf{then}"},
            {class: "", string: "3. \\qquad m \\gets x"},
            {class: "", string: "4. \\qquad\\sigma \\gets \\sigma \\cdot e^{\\frac{1}{2}}"},
            {class: "", string: "5. \\qquad C \\gets \\frac{4}{5} \\cdot C + \\frac{1}{5} \\cdot zz^T"},
            {class: "", string: "6. \\quad \\textbf{else}"},
            {class: "", string: "7. \\qquad\\sigma \\gets \\sigma \\cdot e^{\\text{-}\\frac{1}{9}}"},
        ]
    }

    steps = [
        prev_state => {
            let distribution = MultivariateNormal([0, 0], prev_state.C);

            let z = distribution.sample()
            let x = math.add(prev_state.m, math.multiply(prev_state.sigma, z))

            return {
                z,
                population: [{delay: 0, r: 5, color: "gray", coords: x}],
                highlight_row: 1,
            }
        },
        (prev_state) => {
            return {
                highlight_row: 2,
                population: [{
                    delay: 0,
                    r: 5,
                    color: this.fitness(prev_state.population[0].coords) > this.fitness(prev_state.m) ? "red" : "green",
                    coords: prev_state.population[0].coords
                }]
            }
        },
        (prev_state) => {
            if (this.fitness(prev_state.population[0].coords) <= this.fitness(prev_state.m)) {
                return {highlight_row: 3, m: prev_state.population[0].coords}
            } else {
                return {highlight_row: 6}
            }

        },
        (prev_state) => {
            if (this.fitness(prev_state.population[0].coords) <= this.fitness(prev_state.m)) {
                // case success
                return {highlight_row: 4, sigma: prev_state.sigma * Math.pow(Math.E, 1 / 2)}

            } else {
                // case no success
                return {highlight_row: 7, sigma: prev_state.sigma * (1 / Math.pow(Math.E, 1 / 9))}
            }

        },
        (prev_state) => {
            if (this.fitness(prev_state.population[0].coords) <= this.fitness(prev_state.m)) {
                let outer = math.multiply(math.transpose([prev_state.z]), [prev_state.z]);

                let C = math.add(math.multiply(0.8, prev_state.C), math.multiply(0.2, outer))

                // case success
                return {highlight_row: 5, C}

            } else {
                // case no success
                return {}
            }

        },
    ]
}
