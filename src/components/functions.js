import * as _ from 'lodash';
import * as d3 from "d3";
import * as math from "mathjs";

function parseTransform(transform) {
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

export function axis(element, data, scaling){
    // axis
    element
        .selectAll('#x_axis')
        .data(data)
        .join('line')
        .attr("id", "x_axis")
        .attr('y1', -this.height * 10)
        .attr('y2', this.height * 10)
        .attr('stroke', 'rgb(211,211,211)')
        .attr('stroke-width', 2);

    element
        .selectAll('#y_axis')
        .data(data)
        .join('line')
        .attr("id", "y_axis")
        .attr('x1', -this.width * 10)
        .attr('x2', this.width * 10)
        .attr('stroke', 'rgb(211,211,211)')
        .attr('stroke-width', 2);

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
                .attr('stroke-width', 1)
                .attr('fill', 'none'),
            update => update.transition().duration(d => d.duration)
                .attr('rx', d => d * scaling * Math.sqrt(eigen[0].value) * 50)
                .attr('ry', d => d * scaling * Math.sqrt(eigen[1].value) * 50)
                .attr("transform", d => `rotate(${angle})`)
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

export function circle(tag, data, element, scaling) {
    let tag_type = "class"
    if (!Array.isArray(data)) {
        tag_type = "id";
        data = [data]
    }

    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(enter => enter.append('circle')
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

export function ellipse(tag, data, element, scaling) {
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
        .attr('transform', d => `rotate(
                ${parseTransform(element.select('#std_dev').select("ellipse").attr('transform')).rotate + (d.rotation_bias * 180)})`)


    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .join(
            enter => enter.append('g')
                .attr(tag_type, "std_dev")
                .attr('transform', d => `translate(${d.center[0] * scaling * 200} ${-d.center[1] * scaling * 200})`)
                .append('ellipse')
                .attr('transform', d => `rotate(${-d.rotation_angle})`)
                .attr('rx', d => Math.sqrt(Math.sqrt(d.eigen[0].value)) * scaling * 200)
                .attr('ry', d => Math.sqrt(Math.sqrt(d.eigen[1].value)) * scaling * 200)
                .attr('fill', 'none')
                .attr('stroke', '#ea580c')
                .attr('stroke-width', 2),
            update => update.transition().duration(d => d.duration)
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
                })
                .select("ellipse")
                .attr('transform', d => `rotate(${-d.rotation_angle})`)
                .attr('rx', d => Math.sqrt(Math.sqrt(d.eigen[0].value)) * scaling * 200)
                .attr('ry', d => Math.sqrt(Math.sqrt(d.eigen[1].value)) * scaling * 200)
        )


    // remove rotation bias (not sure whether this is necessary, maybe test it)
    element.selectAll((tag_type === "id" ? "#" : ".") + tag)
        .data(data)
        .select("ellipse")
        .attr('transform', d => `rotate(${-d.rotation_angle})`)
}