import {defaultDefaults} from "../../components/defaults.js";
import * as _ from "lodash";
import * as math from "mathjs";
import options from "./configuration.vue"


export default class {
    name = "ConvexQuadratic"
    configuration = {
        component: options,
        handler: (data) => {
            this.start_state.hessian = data.hessian;
        }
    }

    start_state = {
        rotation: 0,
        scaling: 1,

        display: {
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
            one_level: false,
        },
        hessian: [[1, 0], [0, 1]], // fitness function params

        // fitness function
        fitness(x) {
            return math.multiply(math.multiply(math.transpose(x),  this.hessian), x);
        }
    }

    defaults = [
        {path: "rotation", defaults: {...defaultDefaults}},
        {path: "scaling", defaults: {...defaultDefaults}},
        {path: "display.centerpoint", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
        {path: "display.levelsets", defaults: {...defaultDefaults}},
        {path: "display.one_level", defaults: {...defaultDefaults}},
        {path: "display.x_axis.line", defaults: {...defaultDefaults}},
        {path: "display.x_axis.ticks", defaults: {...defaultDefaults}},
        {path: "display.x_axis.tick_numbers", defaults: {...defaultDefaults}},
        {path: "display.y_axis.line", defaults: {...defaultDefaults}},
        {path: "display.y_axis.ticks", defaults: {...defaultDefaults}},
        {path: "display.y_axis.tick_numbers", defaults: {...defaultDefaults}}
    ]


    init(svg) {
        // Graph background
        const graph = svg.append("g").attr("id", "graph").attr("transform", "rotate(0)")
        graph.append("g").attr("id", "x_axis")
        graph.append("g").attr("id", "y_axis")
        graph.append("g").attr("id", "levelsets")
    }

    update(element, data, metadata) {
        // get element


        let graph = element.select("#graph")



        // rotation of the graph
        graph.transition()
            .duration(data.rotation.duration)
            .delay(data.rotation.delay)
            .attr("transform", `rotate(${data.rotation.value})`);

        // axis
        x_axis(element.select("#x_axis"), data.display.x_axis, data.scaling.value, metadata.width)
        y_axis(element.select("#y_axis"), data.display.y_axis, data.scaling.value, metadata.height)

        // centerpoint and levelsets
        if (data.display.centerpoint.value) centerpoint(element.select('#levelsets'))
        if (data.display.levelsets.value) levelsets(element.select('#levelsets'), {matrix: data.hessian}, data.scaling.value)
    }
}

function x_axis(element, data, scaling, width) {
    element
        .selectAll('line#line')
        .data(data.line.value ? [true] : [])
        .join(
            enter => enter.append('line')
                .attr('id', 'line')
                .attr('x1', -width * 2)
                .attr('x2', width * 2)
                .attr('stroke', 'rgb(211,211,211)')
                .attr('stroke-width', 2)
                .attr("opacity", 0)
                .transition().duration(data.line.duration).delay(data.line.delay)
                .attr("opacity", 1),
            update => update,
            exit => exit
                .transition().duration(data.line.duration).delay(data.line.delay)
                .attr("opacity", 0).remove());

    element.selectAll('.x_axis_tick')
        .data(data.ticks.value ? _.range(-100, 100) : [])
        .join(
            enter => enter
                .append('line')
                .attr("class", "x_axis_tick")
                .attr('x1', d => d * scaling * 200)
                .attr('x2', d => d * scaling * 200)
                .attr('y1', 10)
                .attr('y2', -10)
                .attr('stroke', 'gray')
                .attr('stroke-width', 1)
                .attr("opacity", 0)
                .transition().duration(data.ticks.duration).delay(data.ticks.delay)
                .attr("opacity", 1),
            update => update
                .transition().duration(data.ticks.duration).delay(data.ticks.delay)
                .attr('x1', d => d * scaling * 200)
                .attr('x2', d => d * scaling * 200)
                .attr('y1', 10)
                .attr('y2', -10),
            exit => exit
                .transition().duration(data.line.duration).delay(data.line.delay)
                .attr("opacity", 0).remove()
        )
}


function y_axis(element, data, scaling, height) {
    element
        .selectAll('line#line')
        .data(data.line.value ? [true] : [])
        .join(
            enter => enter.append('line')
                .attr("id", "line")
                .attr('y1', -height * 10)
                .attr('y2', height * 10)
                .attr('stroke', 'rgb(211,211,211)')
                .attr('stroke-width', 2)
                .attr("opacity", 0)
                .transition().duration(data.line.duration).delay(data.line.delay)
                .attr("opacity", 1),
            update => update,
            exit => exit
                .transition().duration(data.line.duration).delay(data.line.delay)
                .attr("opacity", 0).remove());


    element.selectAll('.y_axis_tick')
        .data(data.ticks.value ? _.range(-100, 100) : [])
        .join(
            enter => enter
                .append('line')
                .attr("class", "y_axis_tick")
                .attr('y1', d => d * scaling * 200)
                .attr('y2', d => d * scaling * 200)
                .attr('x1', 10)
                .attr('x2', -10)
                .attr('stroke', 'gray')
                .attr('stroke-width', 1)
                .attr('fill', 'none').attr("opacity", 0)
                .transition().duration(data.ticks.duration).delay(data.ticks.delay)
                .attr("opacity", 1),
            update => update
                .transition().duration(data.ticks.duration).delay(data.ticks.delay)
                .attr('y1', d => d * scaling * 200)
                .attr('y2', d => d * scaling * 200)
                .attr('x1', 10)
                .attr('x2', -10),
            exit => exit
                .transition().duration(data.ticks.duration).delay(data.ticks.delay)
                .attr("opacity", 0).remove()
        )


}

function centerpoint(element) {
    element
        .selectAll("#centerpoint")
        .data([true])
        .join(
            enter => enter.append("circle")
                .attr("id", "centerpoint")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 1)
                .attr("stroke", "white")
                .attr("stroke-width", 2),
            update => update.transition().attr("r", 1)
        )
}

function single_level(element, level, scaling) {
    // one level
    element
        .selectAll('#one_level')
        .data([level])
        .join(
            enter => enter.append('circle')
                .attr("id", "one_level")
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('r', d => d * scaling * 200),
            update => update.transition().duration(1000)
                .attr('r', d => d * scaling * 200)
        )

}


function levelsets(element, data, scaling) {

    let eigen = math.eigs(data.matrix).eigenvectors;
    let angle = Math.atan2(eigen[0].vector[1], eigen[0].vector[0]) * (180 / Math.PI)

    element.selectAll('.levelset')
        .data(_.range(100))
        .join(
            enter => enter
                .append('ellipse')
                .attr("class", "levelset")
                .attr('rx', d => d * scaling * Math.sqrt(eigen[0].value) * 50)
                .attr('ry', d => d * scaling * Math.sqrt(eigen[1].value) * 50)
                .attr("transform", d => `rotate(${angle})`)
                .attr('stroke', 'gray')
                .attr('stroke-width', 1.5)
                .attr('fill', 'none'),
            update => update.transition().duration(d => d.duration)
                .attr('rx', d => d * scaling * Math.sqrt(eigen[0].value) * 50)
                .attr('ry', d => d * scaling * Math.sqrt(eigen[1].value) * 50)
                .attr("transform", d => `rotate(${angle})`)
        )
}