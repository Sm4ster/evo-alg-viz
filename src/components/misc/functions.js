import * as d3 from "d3";

export function decimals(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function linear_transition_y(d, attr_y) {
    const i = d3.interpolateNumber(+this.getAttribute(attr_y), -d.m[1] * 200);
    return function (t) {
        return i(t);
    };
}



export function get_axis(axis_data, value) {
    const entries = Object.entries(axis_data);
    for (const [key, val] of entries) {
        if (val === value) {
            return key;
        }
    }
    return null; // Return null if the value is not found
}


function bilinear_interpolation(values, x1, y1, x2, y2, x, y) {
    let q11 = (((x2 - x) * (y2 - y)) / ((x2 - x1) * (y2 - y1))) * values["x1y1"]
    let q21 = (((x - x1) * (y2 - y)) / ((x2 - x1) * (y2 - y1))) * values["x2y1"]
    let q12 = (((x2 - x) * (y - y1)) / ((x2 - x1) * (y2 - y1))) * values["x1y2"]
    let q22 = (((x - x1) * (y - y1)) / ((x2 - x1) * (y2 - y1))) * values["x2y2"]
    return q11 + q21 + q12 + q22
}

function findNextHighestAndLowest(arr, value) {
    // Sort the array
    arr.sort((a, b) => a - b);

    let nextHighest = d3.max(arr);
    let nextLowest = d3.min(arr);

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < value) {
            nextLowest = arr[i];
        } else if (arr[i] > value && nextHighest === null) {
            nextHighest = arr[i];
        }
    }
    const nextLowestIdx = arr.findIndex(e => e === nextLowest)
    const nextHighestIdx = arr.findIndex(e => e === nextHighest)

    return {nextLowest, nextHighest, nextLowestIdx, nextHighestIdx};
}

export function stable_kappa(data, alpha, sigma) {
    const {
        nextLowest: x1,
        nextHighest: x2,
        nextLowestIdx: x1_idx,
        nextHighestIdx: x2_idx
    } = findNextHighestAndLowest(data.stable_kappa.sequences.find(e => e.name === "alpha").sequence, alpha)
    const {
        nextLowest: y1,
        nextHighest: y2,
        nextLowestIdx: y1_idx,
        nextHighestIdx: y2_idx
    } = findNextHighestAndLowest(data.stable_kappa.sequences.find(e => e.name === "sigma").sequence, sigma)

    const values = {
        x1y1: data.stable_kappa.values[x1_idx][y1_idx],
        x2y1: data.stable_kappa.values[x2_idx][y1_idx],
        x1y2: data.stable_kappa.values[x1_idx][y2_idx],
        x2y2: data.stable_kappa.values[x2_idx][y2_idx]
    };

    return bilinear_interpolation(values, x1, y1, x2, y2, alpha, sigma)
}

export function stable_sigma(data, alpha, kappa) {
    const {
        nextLowest: x1,
        nextHighest: x2,
        nextLowestIdx: x1_idx,
        nextHighestIdx: x2_idx
    } = findNextHighestAndLowest(data.stable_sigma.sequences.find(e => e.name === "alpha").sequence, alpha)
    const {
        nextLowest: y1,
        nextHighest: y2,
        nextLowestIdx: y1_idx,
        nextHighestIdx: y2_idx
    } = findNextHighestAndLowest(data.stable_sigma.sequences.find(e => e.name === "kappa").sequence, kappa)

    const values = {
        x1y1: data.stable_sigma.values[x1_idx][y1_idx],
        x2y1: data.stable_sigma.values[x2_idx][y1_idx],
        x1y2: data.stable_sigma.values[x1_idx][y2_idx],
        x2y2: data.stable_sigma.values[x2_idx][y2_idx]
    };

    return bilinear_interpolation(values, x1, y1, x2, y2, alpha, kappa)
}

export function log_tick_format(offset = 0, distance = 9) {
    return function (d, i) {
        if ((i + offset) % distance === 0) return d3.format(".0e")(d)
    }

}

export function linear_tick_format(offset = 0, distance = 9) {
    return function (d, i) {
        if (i % 2) return d3.format("d")(d)
        else return " "
    }
}


export function get_axis_label(value) {
    if (value === "alpha") return "α"
    if (value === "kappa") return "κ"
    if (value === "sigma") return "σ"
}


const serializeSVG = (svgElement) => {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement.node());
};

export function downloadSVG(svgElement, fileName = 'download.svg') {
    // Serialize SVG
    const svgString = serializeSVG(svgElement);

    // Create a Blob with the SVG
    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});

    // Generate a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Set the file name for the download
    document.body.appendChild(a); // Append anchor to body
    a.click(); // Trigger the download

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Release the object URL
}

// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
export function Legend(color, {
    title,
    tickSize = 6,
    tickFontSize = 20,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues,
    titleSize,
    titleMarginLeft,
} = {}) {

    function ramp(color, n = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color(i / (n - 1));
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    }

    const g = d3.create("g")

    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    if (color.interpolate) {
        const n = Math.min(color.domain().length, color.range().length);

        x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

        g.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }

    // Sequential
    else if (color.interpolator) {
        x = Object.assign(color.copy()
                .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
            {
                range() {
                    return [marginLeft, width - marginRight];
                }
            });

        g.append("image")
            .attr("x", marginLeft)
            .attr("y", marginTop)
            .attr("width", width - marginLeft - marginRight)
            .attr("height", height - marginTop - marginBottom)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", ramp(color.interpolator()).toDataURL());

        // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
        if (!x.ticks) {
            if (tickValues === undefined) {
                const n = Math.round(ticks + 1);
                tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
            }
            if (typeof tickFormat !== "function") {
                tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
            }
        }
    }

    // Threshold
    else if (color.invertExtent) {
        const thresholds
            = color.thresholds ? color.thresholds() // scaleQuantize
            : color.quantiles ? color.quantiles() // scaleQuantile
                : color.domain(); // scaleThreshold

        const thresholdFormat
            = tickFormat === undefined ? d => d
            : typeof tickFormat === "string" ? d3.format(tickFormat)
                : tickFormat;

        x = d3.scaleLinear()
            .domain([-1, color.range().length - 1])
            .rangeRound([marginLeft, width - marginRight]);

        g.append("g")
            .selectAll("rect")
            .data(color.range())
            .join("rect")
            .attr("x", (d, i) => x(i - 1))
            .attr("y", marginTop)
            .attr("width", (d, i) => x(i) - x(i - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", d => d);

        tickValues = d3.range(thresholds.length);
        tickFormat = i => thresholdFormat(thresholds[i], i);
    }

    // Ordinal
    else {
        x = d3.scaleBand()
            .domain(color.domain())
            .rangeRound([marginLeft, width - marginRight]);

        g.append("g")
            .selectAll("rect")
            .data(color.domain())
            .join("rect")
            .attr("x", x)
            .attr("y", marginTop)
            .attr("width", Math.max(0, x.bandwidth() - 1))
            .attr("height", height - marginTop - marginBottom)
            .attr("fill", color);

        tickAdjust = () => {
        };
    }

    g.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
        .call(tickAdjust)
        .attr("font-size", tickFontSize + "px")
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", marginLeft + titleMarginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("class", "title")
            .attr("font-size", titleSize)
            .text(title));

    return g;
}