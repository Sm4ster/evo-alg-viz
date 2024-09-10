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

export function viewBox(element, data, base_width, base_height, vars) {

    //TODO set on end the right values to vuejs

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
            }
        ).on("end", function () {
        vars.x.value = data.x.value
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
        })
        .on("end", function () {
            vars.y.value = -data.y.value
        });

    //transition zoom (width and height)
    element.transition()
        .duration(data.zoom.duration)
        .delay(data.zoom.delay)
        .attrTween("viewBox", function () {
            // Initial values captured at the start of the transition
            let initialViewBox = element.node().getAttribute("viewBox").split(" ").map(Number);
            let [initialX, initialY, initialWidth, initialHeight] = initialViewBox;

            // Interpolators for width and height
            const widthInterpolator = d3.interpolateNumber(initialWidth, data.zoom.value * base_width);
            const heightInterpolator = d3.interpolateNumber(initialHeight, data.zoom.value * base_height);

            return (t) => {
                // Return the updated viewBox string
                return `0 0 ${widthInterpolator(t)} ${heightInterpolator(t)}`;
            };
        }).on("end", function () {
        vars.zoom.value = data.zoom.value
    });

    element.select("#container").transition()
        .duration(data.zoom.duration)
        .delay(data.zoom.delay)
        .attrTween("transform", function () {
            let initialValue = parseTransform(element.select("#viewbox_y").node().getAttribute("transform"))

            // Interpolators for width and height
            const interpolatorWidth = d3.interpolateNumber(initialValue.translateX, (base_width * data.zoom.value) / 2);
            const interpolatorHeight = d3.interpolateNumber(initialValue.translateY, (base_height * data.zoom.value) / 2);

            return (t) => {
                return `translate(${interpolatorWidth(t)} ${interpolatorHeight(t)})`;
            };
        });

}

export function equations(element, data) {
    element.selectAll("g.equation")
        .data(data)
        .join(
            enter => {
                enter.append("g")
                    .attr("class", "equation text-white")
                    .append("g")
                    .attr("class", "position_x")
                    .attr("transform", d => `translate(${d.x.value} 0)`)
                    .append("g")
                    .attr("class", "position_y")
                    .attr("transform", d => `translate(0 ${d.y.value})`)
                    .append("g")
                    .attr("class", "scaling")
                    .attr("transform", d => `scale(${d.scaling.value})`)
                    .append("g")
                    .attr("class", "rotation")
                    .attr("transform", d => `rotate(${d.rotation.value})`)
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
                update.select("g.position_x").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(${d.x.value} 0)`);
                update.select("g.position_y").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `translate(0 ${d.y.value})`);
                update.select("g.scaling").transition().duration(d => d.duration).delay(d => d.delay).attr("transform", d => `scale(${d.scaling.value})`);
                update.select("g.rotation").transition().duration(d => d.rotation.duration).delay(d => d.rotation.delay).attr("transform", d => `rotate(${d.rotation.value})`);

                if (data.transition === "interpolate") {
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
                }

                if (data.transition === "replace") {
                    update.select("foreignObject")
                        .transition().duration(d => d.duration).delay(d => d.delay) // Fade in duration
                        .style("opacity", 0)
                        .each(function (d) {
                            const element = this;
                            setTimeout(() => {
                                element.innerHTML = katex.renderToString(d.text);
                                d3.select(element)
                                    .transition()
                                    .duration(200) // Fade in duration
                                    .style("opacity", 1);
                            }, 500)
                        })
                }

                return update;
            },
            exit => exit.remove() // Make sure to remove elements on exit
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