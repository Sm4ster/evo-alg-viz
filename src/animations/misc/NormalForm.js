import * as math from "mathjs";
import {decimals} from "../lib/functions.js";
import parentAnimation from "../lib/StateGenerator.js";
import ConvexQuadratic2D from "../../modules/ConvexQuadratic2D/module.js";
import EvolutionStrategies from "../../modules/EvolutionStrategies/module.js"

export default class NormalForm extends parentAnimation {

    modules = [
        new ConvexQuadratic2D,
        new EvolutionStrategies
    ]

    start_state = {
        ConvexQuadratic: {
            display: {
                levelsets: false,
            },
        },
        EvolutionStrategies: {

        }
    }

    steps = [


    ]
}
