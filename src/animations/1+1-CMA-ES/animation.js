import * as math from "mathjs";
import parentAnimation from "../parentAnimation.js";
import numeric from 'numeric';
import MultivariateNormal from "multivariate-normal";
import ConvexQuadratic2D from "../../modules/ConvexQuadratic2D/module.js";
import EvolutionStrategies from "../../modules/EvolutionStrategies/module.js";

// this is necessary for MultivariateNormal to work, do not change!!
window.numeric = numeric;


export default class OnePlusOneCMAES extends parentAnimation {

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
            {class: "", value: "0. \\ \\textbf{while} \\ \\textit{stopping criterion not met} \\ \\textbf{do}"},
            {class: "", value: "1. \\quad z \\sim \\mathcal{N}(0, C) \\ , \\  x = m + \\sigma \\cdot z"},
            {class: "", value: "2. \\quad \\textbf{if} \\ f(x) \\leq f(m) \\ \\textbf{then}"},
            {class: "", value: "3. \\qquad m \\gets x"},
            {class: "", value: "4. \\qquad\\sigma \\gets \\sigma \\cdot e^{\\frac{1}{2}}"},
            {class: "", value: "5. \\qquad C \\gets \\frac{4}{5} \\cdot C + \\frac{1}{5} \\cdot zz^T"},
            {class: "", value: "6. \\quad \\textbf{else}"},
            {class: "", value: "7. \\qquad\\sigma \\gets \\sigma \\cdot e^{\\text{-}\\frac{1}{9}}"},
        ],

    }

    steps = [
        ({algorithm}) => {
            console.log(algorithm)
            let distribution = MultivariateNormal([0, 0], algorithm.state.C);

            let z = distribution.sample()
            let x = math.add(algorithm.state.m, math.multiply(algorithm.state.sigma, z))

            algorithm.state.population =  [{delay: 0, r: 5, color: "gray", coords: x}]
        },
        ({algorithm, landscape}) => {
            algorithm.state.population =[{
                delay: 0,
                r: 5,
                color: landscape.fitness(algorithm.state.population[0].coords) > landscape.fitness(algorithm.state.m) ? "red" : "green",
                coords: algorithm.state.population[0].coords
            }]
        },
        ({algorithm, landscape}) => {
            if (landscape.fitness(algorithm.state.population[0].coords) <= landscape.fitness(algorithm.state.m)) {
                algorithm.state.m = algorithm.state.population[0].coords
                // return {highlight_row: 3, m:}
            } else {
                // return {highlight_row: 6}
            }

        },
        ({algorithm, landscape}) => {
            if (landscape.fitness(algorithm.state.population[0].coords) <= landscape.fitness(algorithm.state.m)) {
                // case success
                algorithm.state.sigma = algorithm.state.sigma * Math.pow(Math.E, 1 / 2)
                // return {highlight_row: 4, sigma: }

            } else {
                // case no success
                algorithm.state.sigma = algorithm.state.sigma * (1 / Math.pow(Math.E, 1 / 9))
                // return {highlight_row: 7, sigma: }
            }

        },
        ({algorithm, landscape}) => {
            if (landscape.fitness(algorithm.state.population[0].coords) <= landscape.fitness(algorithm.state.m)) {
                // case success
                let outer = math.multiply(math.transpose([algorithm.state.z]), [algorithm.state.z]);

                algorithm.state.C = math.add(math.multiply(0.8, algorithm.state.C), math.multiply(0.2, outer))


                //return {highlight_row: 5}

            } else {
                // case no success
                // return {}
            }

        },
    ]
}
