import * as d3 from "d3";
import * as math from "mathjs";

let x = d3.scaleLinear([-2, 2], [0, this.width])
let y = d3.scaleLinear([-2, 2], [this.height, 0])
let thresholds = d3.range(0, 20)

let color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateMagma)
// let value = (x, y) =>
//     (1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2))
//     * (30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y ** 2))

let value = (x,y) => math.norm([x,y])

const q = 4; // The level of detail, e.g., sample every 4 pixels in x and y.
const x0 = -q / 2, x1 = this.width + 28 + q;
const y0 = -q / 2, y1 = this.height + q;
const n = Math.ceil((x1 - x0) / q);
const m = Math.ceil((y1 - y0) / q);
const grid = new Array(n * m);
for (let j = 0; j < m; ++j) {
    for (let i = 0; i < n; ++i) {
        grid[j * n + i] = value(x.invert(i * q + x0), y.invert(j * q + y0));
    }
}
grid.x = -q;
grid.y = -q;
grid.k = q;
grid.n = n;
grid.m = m;

// Converts from grid coordinates (indexes) to screen coordinates (pixels).
let transform = ({type, value, coordinates}) => {
    return {
        type, value, coordinates: coordinates.map(rings => {
            return rings.map(points => {
                return points.map(([x, y]) => ([
                    grid.x + grid.k * x,
                    grid.y + grid.k * y
                ]));
            });
        })
    };
}


let contours = d3.contours()
    .size([grid.n, grid.m])
    .thresholds(thresholds)
    (grid)
    .map(transform)


d3.select('#inner_container').select("#levelsets")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-opacity", 0.5)
    .selectAll("path")
    .data(contours)
    .join("path")
    .attr("fill", d => color(d.value))
    .attr("d", d3.geoPath());
