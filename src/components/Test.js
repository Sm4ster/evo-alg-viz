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
    }

    steps = [
        (prev_state) => {

            return {
                formula: [
                    {
                        id: "vec_x",
                        position: [0,0],
                        scaling: 10,
                        duration:0,
                        delay: 0,
                        text: "\\vec{x}"
                    }
                ]
            }
        },
        (prev_state) => {
            return {
                formula: [
                    {
                        id: "vec_x",
                        position: [0,0],
                        scaling: 10,
                        duration: 0,
                        delay: 1000                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ,
                        text: "\\vec{t}"
                    },

                    {
                        id: "eq_y",
                        position: [-50,0],
                        scaling: 8,
                        duration: 1000,
                        delay: 0,
                        text: "= y"
                    }
                ]
            }
        }
    ]
}
