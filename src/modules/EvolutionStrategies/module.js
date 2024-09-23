import {defaultDefaults} from "../../components/defaults.js";
import {parseTransform} from "../../components/GraphicUtils.js";
import * as math from "mathjs";
import * as d3 from 'd3'

export default class {
    name = "EvolutionStrategies"

    options = {
        rotation: 0,
        scaling: 1,
        display: {
            m_dot: true,
            m_line: true,
            ellipse: true,
            density: true,
            population: true
        },

        state: {
            // data
            m: [1, 1],
            C: [[1, 0], [0, 1]],
            sigma: 1,
            population: [],
        }
    }

    defaults = [
        {path: "scaling", defaults: defaultDefaults},
        {path: "display.m_line", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
        {path: "display.m_dot", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
        {path: "display.ellipse", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
        {path: "display.density", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
    ]

    init(svg) {
        // Algorithm state
        const algorithm = svg.append("g").attr("id", "#algorithm").attr("transform", "rotate(0)")
        algorithm.append("g").attr("id", "#density")
        algorithm.append("g").attr("id", "#population")
    }

    update(element, data, metadata) {
        let base_element = element

        // rotation of the algorithm
        base_element.transition()
            .duration(data.rotation.duration)
            .delay(data.rotation.delay)
            .attr("transform", `rotate(${data.rotation.value})`);


        // algorithm state
        //if (data.display.density.value) {
        //    gaussian_density(
        //        data.state.m,
        //       data.state.sigma,
        //        data.state.C
        //    );
        //}

        if (data.display.m_line.value) {
            console.log("datastate:", data.display)
            line(
                base_element,
                {
                    duration: data.display.m_line.duration,
                    delay: data.display.m_line.delay,
                    transition: data.display.m_line.transition,
                    x: [0, data.state.m[0]],
                    y: [0, data.state.m[1]],
                    color: '#ea580c',
                    width: 2
                },
                'm_line',
                data.scaling.value
            ) // Connection line between 0,0 and the distribution center
        }


        // circle(
        //     base_element,
        //     data.display.m_dot.value ? {
        //         duration: data.display.m_dot.duration,
        //         delay: data.display.m_dot.delay,
        //         transition: data.display.m_dot.transition,
        //         coords: data.state.m,
        //         r: 2,
        //         color: '#ea580c'
        //     } : {},
        //     'm_dot',
        //     data.scaling.value
        // )
        //
        //
        // ellipse(
        //     base_element,
        //     data.display.ellipse.value ?
        //         {
        //             duration: data.display.ellipse.duration,
        //             rotation_bias: data.display.ellipse.rotation_bias,
        //             transition: data.display.ellipse.transition,
        //             center: data.state.m,
        //             matrix: math.multiply(data.state.sigma, data.state.C)
        //         } : {},
        //     'std_dev',
        //     data.scaling.value
        // )
        //
        // if (data.state.population) {
        //     circle(
        //         d3.select('#population'),
        //
        //         data.state.population.map(d => {
        //             return {
        //                 duration: data.duration,
        //                 transition: data.transition,
        //                 scaling: data.scaling,
        //                 ...d
        //             }
        //         }),
        //         'population',
        //         data.scaling.value
        //     )
        // }
    }

    set_random_start() {
        this.params.A = this.$_.random(0.1, 10)
        this.params.C = this.$_.random(0.1, 10)

        const upperBound = Math.sqrt(this.params.A * this.params.C);
        // Generate a uniformly distributed random number between 0 and 1
        const u = this.$_.random(0, 1, true);
        // Transform it to be denser towards the edges
        const t = Math.sin(Math.PI * u);
        // Scale and shift to the range [-sqrt(AC), sqrt(AC)]
        this.params.B = (2 * t - 1) * upperBound;

        this.params.m[0] = this.$_.random(0, 2, true)
        this.params.m[1] = this.$_.random(0, 2, true)
        this.params.sigma = this.$_.random(1, 5, true)
    }
}




function line(element, data, tag, scaling) {
    let tag_type = "class"
    if (!Array.isArray(data)) {
        tag_type = "id";
        data = [data]
    }

    console.log("line_data", data)

    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(
            enter => enter.append('line')
                .attr(tag_type, tag)
                .attr('x1', d => d.x[0] * scaling * 200)
                .attr('x2', d => d.x[1] * scaling * 200)
                .attr('y1', d => -d.y[0] * scaling * 200)
                .attr('y2', d => -d.y[1] * scaling * 200)
                .attr('stroke', d => d.color)
                .attr('stroke-width', d => d.width)
            ,
            update => update
                .transition().duration(d => d.duration).delay(d => d.delay)
                .attrTween('x1', (d, e, f) => {
                    console.log("update of the line", d.transition)
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('x1'), +f[e].getAttribute('y1'),
                            d.x[1] * scaling * 200, -d.y[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.cos(angle);
                        };
                    } else {
                        console.log("update of the line", d.transition)
                        const i = d3.interpolateNumber(+f[e].getAttribute('x1'), d.x[0] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                })
                .attrTween('x2', (d, e, f) => {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('x2'), +f[e].getAttribute('y2'),
                            d.x[1] * scaling * 200, -d.y[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.cos(angle);
                        };
                    } else {
                        const i = d3.interpolateNumber(+f[e].getAttribute('x2'), d.x[1] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                })
                .attrTween('y1', (d, e, f) => {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('x1'), +f[e].getAttribute('y1'),
                            d.x[1] * scaling * 200, -d.y[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.sin(angle);
                        };
                    } else {
                        const i = d3.interpolateNumber(+f[e].getAttribute('y1'), -d.y[0] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                })
                .attrTween('y2', (d, e, f) => {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('x2'), +f[e].getAttribute('y2'),
                            d.x[1] * scaling * 200, -d.y[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.sin(angle);
                        };
                    } else {
                        const i = d3.interpolateNumber(+f[e].getAttribute('y2'), -d.y[1] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                })
        )
}

function circle(element, data, tag, scaling) {
    let tag_type = "class"
    if (!Array.isArray(data)) {
        tag_type = "id";
        data = [data]
    }


    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(
            enter => enter.append('circle')
                .attr(tag_type, tag)
                .attr('cx', d => d.coords[0] * scaling * 200)
                .attr('cy', d => -d.coords[1] * scaling * 200)
                .transition()
                .delay((d, i) => d.delay)
                .attr('r', d => d.r)
                .attr('fill', d => d.color)
                .attr('stroke', d => d.color)
                .attr('stroke-width', 1),

            update => update
                .transition().duration(d => d.duration)
                .attr('fill', d => d.color)
                .attr('stroke', d => d.color)
                .attr('r', d => d.r)
                .attrTween('cx', (d, e, f) => {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('cx'), +f[e].getAttribute('cy'),
                            d.coords[0] * scaling * 200, -d.coords[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.cos(angle);
                        };
                    } else {
                        const i = d3.interpolateNumber(+f[e].getAttribute('cx'), d.coords[0] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                })
                .attrTween('cy', (d, e, f) => {
                    if (d.transition === 'rotation' || d.transition === '-rotation') {
                        let {startAngle, endAngle, radius} = get_angles(
                            +f[e].getAttribute('cx'), +f[e].getAttribute('cy'),
                            d.coords[0] * scaling * 200, -d.coords[1] * scaling * 200
                        )
                        return function (t) {
                            let angle = startAngle + t * (endAngle - startAngle);
                            if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                            return radius * Math.sin(angle);
                        };
                    } else {
                        const i = d3.interpolateNumber(+f[e].getAttribute('cy'), -d.coords[1] * scaling * 200);
                        return function (t) {
                            return i(t);
                        };
                    }
                }),
            exit => exit.transition()
                .delay((d, i) => d.delay)
                .attr('r', 0)
                .attr('fill', 'lightgray')
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 0)
                .remove()
        )
}

function ellipse(element, data, tag, scaling) {
    let tag_type = "class"
    if (!Array.isArray(data)) {
        tag_type = "id";
        data = [data]
    }

    data = data.map(e => {
        let rotation_bias = e.rotation_bias ? e.rotation_bias : 0;
        let eigen = math.eigs(e.matrix).eigenvectors;
        let rotation_angle = Math.atan(eigen[0].vector[1] / eigen[0].vector[0]) * (180 / Math.PI);
        return {...e, eigen, rotation_angle, rotation_bias}
    })


    // in case the rotation needs to be done from the other side, rotate 180 deg
    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .select("ellipse")
        // .attr("transform", d => "rotate(33)")
        .attr('transform', d => `rotate(${parseTransform(element.select('#std_dev').select("ellipse").attr('transform')).rotate + (d.rotation_bias * 180)})`)


    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(
            enter => enter.append('g')
                .attr(tag_type, "std_dev")
                .attr('transform', d => `translate(${d.center[0] * scaling * 200} ${-d.center[1] * scaling * 200})`)
                .append('ellipse')
                .attr('id', 'ellipse')
                .attr('transform', d => `rotate(${-d.rotation_angle})`)
                .attr('rx', d => Math.sqrt(d.eigen[0].value) * scaling * 200)
                .attr('ry', d => Math.sqrt(d.eigen[1].value) * scaling * 200)
                .attr('fill', 'none')
                .attr('stroke', '#ea580c')
                .attr('stroke-width', 2),
            update => {
                update.transition().duration(d => d.duration)
                    .attrTween('transform', (d, e, f) => {
                        if (d.transition === 'rotation' || d.transition === '-rotation') {
                            const result = parseTransform(f[e].getAttribute('transform'))
                            const startX = result.translateX;
                            const startY = result.translateY;

                            const endX = d.center[0] * scaling * 200;
                            const endY = -d.center[1] * scaling * 200;

                            const radius = Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2));

                            const startAngle = Math.atan2(startY, startX);
                            let endAngle = Math.atan2(endY, endX);

                            return function (t) {
                                let angle = startAngle + t * (endAngle - startAngle);
                                if (d.transition === '-rotation') angle = startAngle - t * (endAngle - startAngle);
                                const x = radius * Math.cos(angle);
                                const y = radius * Math.sin(angle);
                                return `translate(${x} ${y})`;
                            };
                        } else {
                            const result = parseTransform(f[e].getAttribute('transform'))
                            const x = d3.interpolateNumber(result.translateX, d.center[0] * scaling * 200);
                            const y = d3.interpolateNumber(result.translateY, -d.center[1] * scaling * 200);
                            return function (t) {
                                return `translate(${x(t)} ${y(t)})`;
                            };
                        }
                    });
                update.select("ellipse")
                    .transition().duration(d => d.duration)
                    .attr('transform', d => `rotate(${-d.rotation_angle})`)
                    .attr('rx', d => Math.sqrt(d.eigen[0].value) * scaling * 200)
                    .attr('ry', d => Math.sqrt(d.eigen[1].value) * scaling * 200)

                return update;
            }
        )


    // remove rotation bias (not sure whether this is necessary, maybe test it)
    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .select("ellipse")
        .transition().duration(0).delay(d => d.delay + d.duration)
        .attr('transform', d => `rotate(${-d.rotation_angle})`)
}

import * as d3hb from 'd3-hexbin'
import katex from "katex";

// THIS NEEDS MORE WORK. It is not performant, maybe using a canvas as a background picture works better
function gaussian_density(center, variance, covariance) {
    const canvasSize = 1000;
    console.log(covariance)


    // Function to check if a point (x, y) is within the ellipse
    function isPointInEllipse(x, y, cx, cy, a, b, theta) {
        const translatedX = x - cx;
        const translatedY = y - cy;

        // Rotate point back using the inverse rotation matrix
        const cosTheta = Math.cos(-theta);
        const sinTheta = Math.sin(-theta);

        const xRot = translatedX * cosTheta - translatedY * sinTheta;
        const yRot = translatedX * sinTheta + translatedY * cosTheta;

        // Apply the standard ellipse equation to the rotated coordinates
        return (xRot ** 2) / (a ** 2) + (yRot ** 2) / (b ** 2) <= 1;
    }

    // Generate all points in the grid
    const rows = 2000
    const cols = 2000
    const points = new Array(rows * cols);
    // const x_values = new Int32Array(rows * cols);
    // const y_values = new Int32Array(rows * cols);

    performance.mark("before-grid-eval")

    // Destructure the covariance matrix
    const [[sigmaXX, sigmaXY], [sigmaYX, sigmaYY]] = math.multiply(variance * 40000, [[1, -0.5], [-0.5, 1]]);

    // Calculate the determinant of the covariance matrix
    const detSigma = sigmaXX * sigmaYY - sigmaXY * sigmaYX;

    // Calculate the inverse of the covariance matrix if the determinant is not zero
    if (detSigma === 0) {
        throw new Error("The covariance matrix is singular and cannot be inverted.");
    }

    const inverseSigma = [
        [sigmaYY / detSigma, -sigmaXY / detSigma],
        [-sigmaYX / detSigma, sigmaXX / detSigma]
    ];

    const coefficient = 1 / (2 * Math.PI * Math.sqrt(detSigma));

    for (let x_i = 0; x_i < cols; x_i++) {
        for (let y_i = 0; y_i < rows; y_i++) {
            const [x, y] = [x_i - rows / 2, y_i - cols / 2]
            if (isPointInEllipse(x, y, 0, 0, 550, 550, 0)) {
                // Compute the quadratic form (x - mu)^T * Sigma^{-1} * (x - mu)
                const quadraticForm =
                    x * (inverseSigma[0][0] * x + inverseSigma[0][1] * y) +
                    y * (inverseSigma[1][0] * x + inverseSigma[1][1] * x);

                // Compute the density using the Gaussian density formula
                const exponent = -0.5 * quadraticForm;

                points[x_i * y_i] = [x, y, coefficient * Math.exp(exponent) * 100];
            }
        }
    }


    performance.mark("after-grid-eval")
    performance.measure("preparation", "before-grid-eval", "after-grid-eval")
    console.log(performance.getEntriesByName('preparation')[0].duration)

    // Create the hexbin layout
    const hexbin = d3hb.hexbin()
        .radius(5 * Math.sqrt(2) / 2);


    const bins = hexbin(points.filter(d => d));


    // Create a color scale
    const extent = d3.extent(bins, d => d3.mean(d, p => p[2]));
    // const color = d3.scaleSequential(extent, d3.interpolateBlues)
    const color = d3.scaleLinear(extent, ["transparent", "#4f46e5"])

    // d3.select('#density').transition()
    //     .attr("transform",`translate(${center[0] * 200},${-(center[1] * 200)})`)

    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d');

    // Draw the hexbin on the canvas
    context.clearRect(-2000, -2000, 2000, 2000);
    // const opacity_scale = d3.scalePow(extent, [0, 1]).exponent(2);
    // const opacity_scale = d3.scaleSqrt(extent, [0, 1]);
    const opacity_scale = d3.scaleLog(extent, [0, 1]);

    // Draw the hexbin on the canvas
    // bins.forEach(function (d) {
    //     // Set the fill and stroke styles
    //     context.fillStyle = color(d3.mean(d, p => p[2])).replace("rgb", "rgba").replace(")", "," + opacity_scale(d3.mean(d, p => p[2])) + ")");
    //     let p = new Path2D(`M${d.x + 500},${-d.y + 500}${hexbin.hexagon()}`);
    //     context.fill(p);
    // });


    // Convert the canvas content to a data URL
    // const dataUrl = canvas.toDataURL("image/png");

    // d3.select('#density')
    //     .selectAll("image")
    //     .data([dataUrl])
    //     .join(
    //         enter => enter.append("image")
    //             .attr("width", 1000)
    //             .attr("height", 1000)
    //             .attr("transform", `translate(${center[0] * 200 - 500}, ${-(center[1] * 200 + 500)})`)
    //             .attr("xlink:href", d => d),
    //
    //         update => update
    //             .attr("xlink:href", d => d)
    //             .transition()
    //             .duration(1000)
    //             .attr("transform", `translate(${center[0] * 200 - 500}, ${-(center[1] * 200 + 500)})`)
    //
    //     )
    performance.mark("after-canvas-draw")

    const color2 = d3.scaleLinear(extent, ["black", "orange"])
    d3.select('#density')
        .selectAll(".hexagon")
        .data(bins)
        .join(
            enter => enter.append("path")
                .attr("class", "hexagon")
                .attr("d", hexbin.hexagon([3.533]))
                .attr("transform", d => `translate(${d.x},${-(d.y)})`)
                .attr("stroke", d => {
                    return color(d3.mean(d, p => p[2]))
                })
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 0)
                .attr("fill", d => {
                    return color(d3.mean(d, p => p[2]))
                }),
            // .attr("opacity", d => opacity_scale(d3.mean(d, p => p[2]))),
            update => update
                .attr("transform", d => `translate(${d.x},${-(d.y)})`)
                .attr("stroke", d => {
                    return color(d3.mean(d, p => p[2]))
                })
                .attr("fill", d => {
                    return color(d3.mean(d, p => p[2]))
                }),
            // .attr("opacity", d => opacity_scale(d3.mean(d, p => p[2]))),
            exit => exit.transition()
                .attr("opacity", 0)
        )

    performance.mark("after-svg-draw")


    performance.measure("canvas", "after-grid-eval", "after-canvas-draw")
    performance.measure("svg", "after-canvas-draw", "after-svg-draw")


    console.log(performance.getEntriesByName('canvas')[0].duration)
    console.log(performance.getEntriesByName('svg')[0].duration)

    performance.clearMarks('before-grid-eval');
    performance.clearMarks('after-grid-eval');
    performance.clearMarks('after-canvas-draw');
    performance.clearMarks('after-svg-draw"');
    performance.clearMeasures('preparation');
    performance.clearMeasures('canvas');
    performance.clearMeasures('svg');

}

/**
 * Compute the Gaussian density for a set of points.
 * @param {Array} points - An array of points (each a 2-element array).
 * @param {Array} covariance - The 2x2 covariance matrix.
 * @returns {Array} - An array of density values corresponding to each point.
 */

function gaussianDensity(points, covariance) {


    return points.map(point => {
        const [x, y] = point;

        // Compute the quadratic form (x - mu)^T * Sigma^{-1} * (x - mu)
        const quadraticForm = x * (inverseSigma[0][0] * x + inverseSigma[0][1] * y) +
            y * (inverseSigma[1][0] * x + inverseSigma[1][1] * x);

        // Compute the density using the Gaussian density formula
        const exponent = -0.5 * quadraticForm;

        return coefficient * Math.exp(exponent) * 100;
    });


}

