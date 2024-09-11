export const defaultDefaults = {
    duration: "inherit",
    delay: "inherit"
}
export const defaultValues = [
    // Equations
    {path: "equations.*", defaults: {rotation: 0, x: 0, y: 0, scaling: 1, transition: "replace"}},
    {path: "equations.*.x", defaults: defaultDefaults},
    {path: "equations.*.y", defaults: defaultDefaults},
    {path: "equations.*.rotation", defaults: defaultDefaults},
    {path: "equations.*.scaling", defaults: defaultDefaults},

    // Graphics
    {path: "graphics.*", defaults: {rotation: 0, x: 0, y: 0, scaling: 1}},
    {path: "graphics.*.x", defaults: defaultDefaults},
    {path: "graphics.*.y", defaults: defaultDefaults},
    {path: "graphics.*.rotation", defaults: defaultDefaults},
    {path: "graphics.*.scaling", defaults: defaultDefaults},

    // Viewbox
    {path: "viewbox.x", defaults: defaultDefaults},
    {path: "viewbox.y", defaults: defaultDefaults},
    {path: "viewbox.zoom", defaults: defaultDefaults},
    {path: "viewbox.graph_rotation", defaults: defaultDefaults},
    {path: "viewbox.algorithm_rotation", defaults: defaultDefaults},
    {path: "viewbox.scaling", defaults: defaultDefaults},
]