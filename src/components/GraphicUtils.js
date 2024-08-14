import * as _ from 'lodash';
import * as d3 from "d3";
import * as math from "mathjs";

export function parseTransform(transform) {
    const translate = /translate\(([^)]+)\)/.exec(transform);
    const rotate = /rotate\(([^)]+)\)/.exec(transform);

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

    return result;
}

function get_angles(startX, startY, endX, endY) {
    return {
        startAngle: Math.atan2(startY, startX),
        endAngle: Math.atan2(endY, endX),
        radius: Math.sqrt(Math.pow(endX, 2) + Math.pow(endY, 2))
    }

}

export function viewBox(data, variable) {

    const interpolate = d3.interpolate(variable.value, data.value);
    d3.transition()
        .duration(data.duration)
        .delay(data.delay)
        .tween("dataTween", () => {
            return (t) => {
                variable.value = interpolate(t);
            };
        });
}

export function equations(element, data) {

    element.selectAll("g")
        .data(data, d => d.id)
        .join(
            enter => {
                let el = enter.append("g")
                    .attr("id", d => d.id)
                    .attr("transform", d => `scale(${1 ?? 1}) rotate(${d.rotation ?? 0}) translate(${d.position[0]} ${d.position[1]})`)
                    .append("foreignObject")
                    .attr("class", "bg-black text-white whitespace-nowrap bg-opacity-[0.7]")
                    .html(d => katex.renderToString(d.value))
                    .each(function(d) {
                        let bbox = this.firstElementChild

                        console.log(d, this,this.firstElementChild.getBoundingClientRect(), getComputedStyle(this.firstElementChild))
                    })
                    .transition()
                    .attr("opacity", 1)

                // let bbox = el.node().firstElementChild.getBoundingClientRect()
                // console.log(el.node())
                // console.log(bbox)
                // enter.select(d => `g#${d.id}`)
                //     .attr("width", d => bbox.width / d.scaling.value)
                //     .attr("height", d => bbox.height / d.scaling.value)
            },
            update => {
                let el = update.transition()
                    .duration(d => d.duration)
                    .delay(d => d.delay)
                    .attr("transform", d => `scale(${d.scaling ?? 1}) rotate(${d.rotation ?? 0}) translate(${d.position[0]} ${d.position[1]})`)


                const interpolateNumber = NumberInterpolator("f(5.1)", "f(10)");
                update.select("foreignObject").transition()
                    .duration(1000)
                    .tween("dataTween", function (d) {
                        const element = this;
                        return (t) => {
                            const interpolatedString = interpolateNumber(t);
                            element.innerHTML = katex.renderToString(String(interpolatedString));
                        };
                    });

                // update.select("foreignObject")
                // .transition()
                // .duration(500) // Fade in duration
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
            })
}

export function graphics(element, data) {
    element.selectAll("g.graphic")
        .data(data, d => d.id)
        .join(
            enter => enter.append("g")
                .attr("class", "graphic")
                .attr("transform", d => `scale(${d.scaling ?? 1}) translate(${d.position[0]} ${d.position[1]})`)
                .append("g")
                .attr("transform", d => `rotate(${d.rotation ?? 0}, 50, 50)`)
                .html(d => d.data)
                .transition()
                .attr("opacity", 1),
            update => {
                update
                    .transition()
                    .attr("transform", d => `scale(${d.scaling ?? 1}) translate(${d.position[0]} ${d.position[1]})`);
                update.select("g")
                    // .html(d => d.data)
                    .transition()
                    .duration(2000)
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


    // density
    const grid = [];
    const step = 8;
    for (let x = -1000; x <= 1000; x += step) {
        for (let y = -1000; y <= 1000; y += step) {
            const density = gaussianDensity([x, y], [0, 0], math.multiply(variance * 40000, covariance)) * 100;
            if (density > 1e-4) grid.push({x, y, density});
        }
    }

    // Create the hexbin layout
    const hexbin = d3hb.hexbin()
        .extent([[-12, -12], [12, 12]])
        .radius((step + 2) * Math.sqrt(2) / 2);

    const bins = hexbin(grid.map(d => [d.x, d.y, d.density]));

    // Create a color scale
    const extent = d3.extent(bins, d => d3.mean(d, p => p[2]));
    // const color = d3.scaleSequential(extent, d3.interpolateBlues)
    const color = d3.scaleLinear(extent, ["black", "#4f46e5"])

    // d3.select('#density').transition()
    //     .attr("transform",`translate(${center[0] * 200},${-(center[1] * 200)})`)

    d3.select('#density')
        .selectAll(".hexagon")
        .data(bins)
        .join(
            enter => enter.append("path")
                .attr("class", "hexagon")
                .attr("d", hexbin.hexagon())
                .attr("transform", d => `translate(${d.x},${-(d.y)})`)
                .attr("stroke", d => {
                    return color(d3.mean(d, p => p[2]))
                })
                .attr("stroke-width", 1)
                .attr("fill", d => {
                    return color(d3.mean(d, p => p[2]))
                }),
            update => update
                .attr("transform", d => `translate(${d.x},${-(d.y)})`)
                .attr("stroke", d => {
                    return color(d3.mean(d, p => p[2]))
                })
                .attr("fill", d => {
                    return color(d3.mean(d, p => p[2]))
                }),
            exit => exit.transition()
                .attr("opacity", 0)
        )

}

export function gaussianDensity(point, mean, covariance) {
    // Destructure the point and the mean
    const [x, y] = point;
    const [muX, muY] = mean;

    // Destructure the covariance matrix
    const [[sigmaXX, sigmaXY], [sigmaYX, sigmaYY]] = covariance;

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

    // Compute the vector (x - mu)
    const diffX = x - muX;
    const diffY = y - muY;

    // Compute the quadratic form (x - mu)^T * Sigma^{-1} * (x - mu)
    const quadraticForm = diffX * (inverseSigma[0][0] * diffX + inverseSigma[0][1] * diffY) +
        diffY * (inverseSigma[1][0] * diffX + inverseSigma[1][1] * diffY);

    // Compute the density using the Gaussian density formula
    const coefficient = 1 / (2 * Math.PI * Math.sqrt(detSigma));
    const exponent = -0.5 * quadraticForm;

    return coefficient * Math.exp(exponent);
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