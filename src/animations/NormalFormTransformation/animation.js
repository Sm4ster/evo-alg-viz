import * as math from "mathjs";
import parentAnimation from "../parentAnimation.js";
import ConvexQuadratic2D from "../../modules/ConvexQuadratic2D/module.js";
import EvolutionStrategies from "../../modules/EvolutionStrategies/module.js"

export default class NormalForm extends parentAnimation {

    modules = [
        {landscape: new ConvexQuadratic2D},
        {algorithm: new EvolutionStrategies}
    ]

    start_state = {
        // graph:
        //     {
        //         x_axis: {line: true, ticks: false},
        //         y_axis: {line: true, ticks: false}
        //     },
        algorithm: {
            state: {
                C: [[2,0.5],[0.5,1]]
            }
        },
        // highlight_row: 0,
        // equations: [
        //     {
        //         class: "",
        //         string: "0. \\ A \\leftarrow [v_1 \\, v_2] \\textit{ where } \\quad C v_i = \\lambda_i v_i, \\quad v_i = \\frac{v_i}{\\|v_i\\|} \\text{Eigendecomposition} \\;"
        //     },
        //     {class: "", string: "1. C \\gets A^T C A"},
        //     {class: "", string: "2. m \\gets A^T m"},
        //     {class: "", string: "3. m_{(1)} < 0"},
        //     {
        //         class: "",
        //         string: "4. m \\gets \\begin{pmatrix}\\scalebox{0.4}[1.0]{\\( - \\)}1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\cdot m"
        //     },
        //     {class: "", string: "3. m_{(2)} < 0"},
        //     {
        //         class: "",
        //         string: "4. m \\gets \\begin{pmatrix}1 & 0 \\\\ 0 & \\scalebox{0.4}[1.0]{\\( - \\)}1 \\end{pmatrix} \\cdot m"
        //     },
        //     {class: "", string: "3. \\m_{(1)} < 0"},
        //     {
        //         class: "",
        //         string: "4. \\m \\gets \\begin{pmatrix}\\scalebox{0.4}[1.0]{\\( - \\)}1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\cdot m"
        //     },
        //     {class: "", string: "5. \\m \\gets \\frac{m}{|m|}"},
        //     {class: "", string: "6. \\qquad m_{t+1} \\leftarrow m_t"},
        //     {class: "", string: "7. \\qquad \\sigma_{t+1} \\leftarrow \\sigma_t \\cdot \\alpha^{-1/4}"},
        // ]
    }

    steps = [
        ({algorithm, landscape}) => {

            let eigen = math.eigs(algorithm.state.C).eigenvectors

            if (algorithm.state.C[0][0] > algorithm.state.C[1][1]) eigen = eigen.reverse()
            let rotation_angle =
                Math.atan2(
                    eigen[0].value * eigen[0].vector[1],
                    eigen[0].value * eigen[0].vector[0])
                * 180 / Math.PI;

            console.log(rotation_angle)
            landscape.rotation = rotation_angle
            algorithm.rotation = rotation_angle
        },
        ({algorithm, landscape}) => {

            let eigen = math.eigs(algorithm.state.C).eigenvectors
            if (algorithm.state.C[0][0] > algorithm.state.C[1][1]) eigen = eigen.reverse()
            let A = [
                [eigen[0].vector[0], eigen[1].vector[0]],
                [eigen[0].vector[1], eigen[1].vector[1]]
            ]

            let m = math.multiply(A, algorithm.state.m)
            let C = math.multiply(math.multiply(math.transpose(A), algorithm.state.C), A)

            let rotation_bias = -1;

            if (C[0][1] >= 0 && C[0][0] > C[1][1]) rotation_bias = false

            algorithm.state.m = {m, transition:"rotation"}
            algorithm.state.C = C
            algorithm.rotation = 0
            console.log(algorithm)
            landscape.rotation = 0
            // return {algorithm: {m, C, transition: "rotation", rotation_bias}, graph: {rotation: 0}}
        },
        // function (prev_state) {
        //     if (prev_state.m[0] < 0 && prev_state.m[1] < 0) {
        //         return {rotation: 180}
        //     }
        //     if (prev_state.m[0] < 0 && prev_state.m[1] >= 0) {
        //         return {rotation: 90}
        //
        //     }
        //     if (prev_state.m[0] >= 0 && prev_state.m[1] < 0) {
        //         return {rotation: -90}
        //     }
        // },
        // function (prev_state) {
        //     let A = [[1, 0], [0, 1]];
        //     let transition = "rotation"
        //     let rotation_bias = -1
        //
        //     if (prev_state.m[0] < 0 && prev_state.m[1] < 0) {
        //         A = [[-1, 0], [0, -1]]
        //         transition = "-rotation"
        //         rotation_bias = false
        //     }
        //     if (prev_state.m[0] < 0 && prev_state.m[1] >= 0) {
        //         //90
        //         A = [[0, 1], [-1, 0]]
        //
        //     }
        //     if (prev_state.m[0] >= 0 && prev_state.m[1] < 0) {
        //         //-90
        //         A = [[0, -1], [1, 0]]
        //     }
        //
        //     let m = math.multiply(A, prev_state.m)
        //     let C = math.multiply(math.multiply(math.transpose(A), prev_state.C), A)
        //
        //
        //     if (prev_state.m[0] < 0 && prev_state.m[1] < 0 && prev_state.C[0][0] > prev_state.C[1][1]) rotation_bias = false
        //     if (prev_state.m[0] >= 0 && prev_state.m[1] < 0 && C[0][0] > C[1][1]) rotation_bias = false
        //
        //
        //     return {m, C, transition, rotation: 0, rotation_bias, duration: 2000}
        // },
        // function (prev_state) {
        //     let factor = Math.sqrt(math.det(prev_state.C))
        //
        //     let C = [[(1 / factor) * prev_state.C[0][0], 0], [0, (1 / factor) * prev_state.C[1][1]]]
        //     let sigma = prev_state.sigma * Math.sqrt(factor)
        //
        //     return {C, sigma}
        // },
        // function (prev_state) {
        //     return {one_level: true}
        // },
        //
        // function (prev_state) {
        //     let q = math.norm(prev_state.m)
        //
        //     let m = [prev_state.m[0] / q, prev_state.m[1] / q]
        //     let sigma = prev_state.sigma / q
        //
        //     return {m, sigma, scaling: q}
        // },
        // function (prev_state) {
        //     return {scaling: 1}
        // },
        // function (prev_state) {
        //     let m = prev_state.m
        //     let C = prev_state.C
        //
        //     if (C[0][0] < 1) {
        //         let axis_swap = [[0, 1], [1, 0]]
        //         m = math.multiply(axis_swap, m)
        //         C = math.multiply(math.multiply(axis_swap, C), math.transpose(axis_swap))
        //     }
        //
        //     return {
        //         m, C, population: {delay: 200, points: [[1.1, 0.9], [1, 1], [1.1, 1], [0.9, 1], [0.9, 1.1]]},
        //         latex: [{
        //             class: "", string:
        //                 `\\alpha = ${decimals(Math.acos(m[0]))} \\quad \\kappa = ${decimals(C[0][0])} \\quad \\sigma = ${decimals(prev_state.sigma)}`
        //         },
        //         ]
        //     }
        // },
    ]
}
