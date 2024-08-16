const defaultDefaults = {
    duration: "inherit",
    delay: "inherit"
}
export const defaultValues = [
    //Viewbox
    {path: "viewbox.x", defaults: defaultDefaults},
    {path: "viewbox.y", defaults: defaultDefaults},
    {path: "viewbox.zoom", defaults: defaultDefaults},
    {path: "viewbox.graph_rotation", defaults: defaultDefaults},
    {path: "viewbox.algorithm_rotation", defaults: defaultDefaults},
    {path: "viewbox.scaling", defaults: defaultDefaults},
    //Canvas
    {path: "canvas.m_line", defaults: defaultDefaults},
    {path: "canvas.m_dot", defaults: {...defaultDefaults, transition: "linear", rotation_bias: 0}}
]