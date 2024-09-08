const defaultDefaults = {
    duration: "inherit",
    delay: "inherit"
}
export const defaultValues = [
    //Equations
    {path: "equations.*", defaults: {rotation: 0, x: 0, y: 0, scaling: 1, transition: "replace"}},
    {path: "equations.*.x", defaults: defaultDefaults},
    {path: "equations.*.y", defaults: defaultDefaults},
    {path: "equations.*.rotation", defaults: defaultDefaults},
    {path: "equations.*.scaling", defaults: defaultDefaults},
    {path: "graphics.*", defaults: {rotation: 0, x: 0, y: 0, scaling: 1}},
    {path: "graphics.*.x", defaults: defaultDefaults},
    {path: "graphics.*.y", defaults: defaultDefaults},
    {path: "graphics.*.rotation", defaults: defaultDefaults},
    {path: "graphics.*.scaling", defaults: defaultDefaults},
    //Viewbox
    {path: "viewbox.x", defaults: defaultDefaults},
    {path: "viewbox.y", defaults: defaultDefaults},
    {path: "viewbox.zoom", defaults: defaultDefaults},
    // {path: "viewbox.graph_rotation", defaults: defaultDefaults},
    // {path: "viewbox.algorithm_rotation", defaults: defaultDefaults},
    // {path: "viewbox.scaling", defaults: defaultDefaults},
    // //Canvas
    // {path: "canvas.m_line", defaults: defaultDefaults},
    // {path: "canvas.m_dot", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
    // {path: "canvas.ellipse", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
    // {path: "canvas.density", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
    // {path: "canvas.centerpoint", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}},
    // {path: "canvas.levelsets", defaults: {...defaultDefaults}},
    // {path: "canvas.one_level", defaults: {...defaultDefaults}},
    // {path: "canvas.state_overlay", defaults: {...defaultDefaults}},
    // {path: "canvas.algorithm_overlay", defaults: {...defaultDefaults}},
    // {path: "canvas.x_axis.line", defaults: {...defaultDefaults}},
    // {path: "canvas.x_axis.ticks", defaults: {...defaultDefaults}},
    // {path: "canvas.x_axis.tick_numbers", defaults: {...defaultDefaults}},
    // {path: "canvas.y_axis.line", defaults: {...defaultDefaults}},
    // {path: "canvas.y_axis.ticks", defaults: {...defaultDefaults}},
    // {path: "canvas.y_axis.tick_numbers", defaults: {...defaultDefaults}}
]