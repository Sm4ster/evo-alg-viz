import * as _ from 'lodash';
import * as d3 from "d3";
import * as math from "mathjs";

export function parseTransform(transform) {
    const translate = /translate\(([^)]+)\)/.exec(transform);
    const rotate = /rotate\(([^)]+)\)/.exec(transform);
    const scale = /scale\(([^)]+)\)/.exec(transform);

    const result = {};

    if (translate) {
        const translateValues = translate[1].split(' ').map(Number);
        result.translateX = translateValues[0];
        result.translateY = translateValues.length > 1 ? translateValues[1] : 0;
    }

    if (rotate) {
        const rotateValue = rotate[1].split(' ').map(Number);
        result.rotate = rotateValue[0];
        result.rotateCX = rotateValue.length > 1 ? rotateValue[1] : 0;
        result.rotateCY = rotateValue.length > 2 ? rotateValue[2] : 0;
    }

    if (scale) {
        const scaleValue = rotate[1].split(' ').map(Number);
        result.scale = scaleValue[0];

    }

    return result;
}

function get_angles(startX, startY, endX, endY) {
    return {
        startAngle: Math.atan2(startY, startX),
        endAngle: Math.atan2(endY, endX),
        radius: Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2))
    }

}

export function viewBox(element, data, base_width, base_height) {

    //TODO set on end the right values to vuejs
    console.log("viewbox data:", data)

    // transition x
    element.select("#viewbox_x").transition()
        .duration(data.x.duration)
        .delay(data.x.delay)
        // .ease(d3.easeLinear)
        .attrTween("transform", function () {
            // Initial values captured at the start of the transition
            let initialValue = parseTransform(element.select("#viewbox_x").node().getAttribute("transform")).translateX;

            // Interpolators for width and height
            const interpolator = d3.interpolateNumber(initialValue, data.x.value);

            return (t) => {
                return `translate(${-interpolator(t)} 0)`;
            };
        });

    // transition y
    element.select("#viewbox_y").transition()
        .duration(data.y.duration)
        .delay(data.y.delay)
        // .ease(d3.easeLinear)
        .attrTween("transform", function () {
            // Initial values captured at the start of the transition
            let initialValue = parseTransform(element.select("#viewbox_y").node().getAttribute("transform")).translateY;

            // Interpolators for width and height
            const interpolator = d3.interpolateNumber(initialValue, data.y.value);

            return (t) => {
                return `translate(0 ${interpolator(t)})`;
            };
        });

    //transition zoom (width and height)
    element.transition()
        .duration(data.zoom.duration)
        .delay(data.zoom.delay)
        .attrTween("viewBox", function () {
            // Initial values captured at the start of the transition
            let initialViewBox = element.node().getAttribute("viewBox").split(" ").map(Number);
            let [initialX, initialY, initialWidth, initialHeight] = initialViewBox;

            console.log(initialViewBox)
            // Interpolators for width and height
            const widthInterpolator = d3.interpolateNumber(initialWidth, data.zoom.value * base_width);
            const heightInterpolator = d3.interpolateNumber(initialHeight, data.zoom.value * base_height);

            return (t) => {
                // Return the updated viewBox string
                return `0 0 ${widthInterpolator(t)} ${heightInterpolator(t)}`;
            };
        });
}

export function equations(element, data) {
    element.selectAll("g")
        .data(data, d => d.id)
        .join(
            enter => {
                enter.append("g")
                    .attr("id", d => d.id)
                    .append("g")
                    .attr("class", "position_x")
                    .attr("transform", d => `translate(${d.x.value} 0)`)
                    .append("g")
                    .attr("class", "position_y")
                    .attr("transform", d => `translate(0 ${d.y})`)
                    .append("g")
                    .attr("class", "scaling")
                    .attr("transform", d => `scale(${d.scaling})`)
                    .append("g")
                    .attr("class", "rotation")
                    .attr("transform", d => `rotate(${d.rotation.value})`)
                    .attr("class", `text-white`)
                    .append("foreignObject")
                    .attr("class", d => `overflow-visible whitespace-nowrap ${d.class}`)
                    .attr("width", 1)
                    .attr("height", 1)
                    .html(d => katex.renderToString(d.value))
                    .each(function (d) {
                        d3.select(this.firstElementChild.children[1]).attr("class", `${d.innerClass}`)
                    })
                    .transition()
                    .attr("opacity", 1)
            },
            update => {
                update.select("g.position_x").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(${d.x} 0)`);
                update.select("g.position_y").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(0 ${d.y})`);
                update.select("g.scaling").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `scale(${d.scaling})`);
                update.select("g.rotation").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `scale(${d.rotation})`);

                const interpolateNumber = NumberInterpolator("f(5.1)", "f(10)");
                update.select("foreignObject").transition()
                    .transition().duration(d => d.duration).delay(d => d.delay)
                    .tween("dataTween", function (d) {
                        const element = this;
                        return (t) => {
                            const interpolatedString = interpolateNumber(t);
                            element.innerHTML = katex.renderToString(String(interpolatedString));
                        };
                    });

                // update.select("foreignObject")
                // .transition()
                //.transition().duration(d => d.duration).delay(d => d.delay) // Fade in duration
                // .style("opacity", 0)
                // .each(function (d) {
                //   const element = this;
                //   setTimeout(() => {
                //     element.innerHTML = katex.renderToString(d.text);
                //     d3.select(element)
                //         .transition()
                //         .duration(200) // Fade in duration
                //         .style("opacity", 1);
                //   }, 500)
                // })

                // let bbox = el.node().firstElementChild.getBoundingClientRect()
                // el.attr("width", bbox.width).attr("height", bbox.height)

                return update;
            }
        )


    // console.log(element.node().firstElementChild.firstElementChild.firstElementChild, element.node().firstElementChild.firstElementChild.firstElementChild.getBoundingClientRect());
}

export function graphics(element, data) {
    element.selectAll("g.graphic")
        .data(data, d => d.id)
        .join(
            enter => enter
                .append("g")
                .attr("class", "position_x")
                .attr("transform", d => `translate(${d.position[0]} 0)`)
                .append("g")
                .attr("class", "position_y")
                .attr("transform", d => `translate(0 ${d.position[1]})`)
                .append("g")
                .attr("class", "scaling")
                .attr("transform", d => `scale(${d.scaling})`)
                .append("g")
                .attr("class", "rotation")
                .attr("transform", d => `rotate(${d.rotation}, 50, 50)`)
                .html(d => d.data)
                .transition()
                .attr("opacity", 1),
            update => {
                update.select("g.position_x").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(${d.position[0]} 0)`);
                update.select("g.position_y").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(0 ${d.position[1]})`);
                update.select("g.scaling").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `scale(${d.scaling})`);
                update.select("g.rotation")
                    .transition()
                    .duration(d => d.duration)
                    .delay(d => d.delay)
                    .attrTween("transform", function (d) {
                        const px = 50; // x-coordinate of the arbitrary point
                        const py = 50; // y-coordinate of the arbitrary point

                        const startAngle = 0;
                        const endAngle = d.rotation;
                        return d3.interpolateString(
                            `translate(${px}, ${py}) rotate(${startAngle}) translate(${-px}, ${-py})`,
                            `translate(${px}, ${py}) rotate(${endAngle}) translate(${-px}, ${-py})`
                        );
                    })
                return update;
            }
        )
}

export function x_axis(element, data, scaling, width) {
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


export function y_axis(element, data, scaling, height) {
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

export function centerpoint(element, data) {
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

export function levelsets(element, data, scaling) {

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


export function single_level(element, level, scaling) {
    // one level
    element
        .selectAll('#one_level')
        .data([level])
        .join(
            enter => enter.append('circle')
                .attr("id", "one_level")
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('r', d => d * scaling * 200),
            update => update.transition().duration(1000)
                .attr('r', d => d * scaling * 200)
        )

}


export function line(tag, data, element, scaling) {
    let tag_type = "class"
    if (!Array.isArray(data)) {
        tag_type = "id";
        data = [data]
    }


    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(
            enter => enter.append('line')
                .attr(tag_type, tag)
                .attr('x1', d => d.x[0] * scaling * 200)
                .attr('x2', d => d.x[1] * scaling * 200)
                .attr('y1', d => d.y[0] * scaling * 200)
                .attr('y2', d => d.y[1] * scaling * 200)
                .attr('stroke', d => d.color)
                .attr('stroke-width', d.width)
            ,
            update => update
                .transition().duration(data.duration)
                .attrTween('x1', (d, e, f) => {
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
                        const i = d3.interpolateNumber(+f[e].getAttribute('x1'), d.x[1] * scaling * 200);
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
                        const i = d3.interpolateNumber(+f[e].getAttribute('y1'), -d.y[1] * scaling * 200);
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

export function circle(element, data, tag, scaling) {
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

export function ellipse(element, data, tag, scaling) {
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
export function gaussian_density(center, variance, covariance) {
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

export function gaussianDensity(points, covariance) {


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


export function NumberInterpolator(startString, endString) {
    // Extract the number from the start and end strings using a regex
    const startMatch = startString.match(/-?\d+(\.\d+)?/);
    const endMatch = endString.match(/-?\d+(\.\d+)?/);

    // If matches are not found, return the start string as the interpolated value (edge case)
    if (!startMatch || !endMatch) {
        return () => startString;
    }

    const startNumber = parseFloat(startMatch[0]);
    const endNumber = parseFloat(endMatch[0]);

    // Determine the number of decimal places in the start number
    const decimals = (startMatch[0].split('.')[1] || "").length;

    // Create a D3 interpolator for these numbers
    const numberInterpolator = d3.interpolateNumber(startNumber, endNumber);

    return function (t) {
        // Interpolate the number
        const interpolatedNumber = numberInterpolator(t);

        // Replace the original number in the string with the interpolated value
        return startString.replace(startMatch[0], interpolatedNumber.toFixed(decimals));
    };
}