function generateColorGradient(startColor, endColor, steps) {
    function interpolateColor(color1, color2, factor) {
        if (arguments.length < 3) {
            factor = 0.5;
        }
        var result = color1.slice();
        for (var i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return result;
    };

    function intToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    var gradient = [];
    var startRGB = parseInt(startColor.slice(1), 16);
    var startR = (startRGB >> 16) & 0xff;
    var startG = (startRGB >>  8) & 0xff;
    var startB =  startRGB        & 0xff;

    var endRGB = parseInt(endColor.slice(1), 16);
    var endR = (endRGB >> 16) & 0xff;
    var endG = (endRGB >>  8) & 0xff;
    var endB =  endRGB        & 0xff;

    for (var i = 0; i < steps; i++) {
        var factor = i / (steps - 1);
        var color = interpolateColor([startR, startG, startB], [endR, endG, endB], factor);
        gradient.push('#' + intToHex(color[0]) + intToHex(color[1]) + intToHex(color[2]));
    }

    return gradient;
}

function setupGraph(selectedApp = null) {
    // Function to generate graph
    function generateGraphs(selectedApp) {
        var nodes = [];
        var edges = [];
        var maxDepth = 0; // Track maximum depth for color gradient adjustment

        function addNodesAndEdges(app, depth) {
            if (!nodes.some(node => node.id === app)) {
                if (depth > maxDepth) {
                    maxDepth = depth;
                }
                nodes.push({ id: app, label: app, depth: depth });
                if (items[app]) {
                    items[app].forEach(function(dep) {
                        edges.push({ from: app, to: dep });
                        addNodesAndEdges(dep, depth + 1);
                    });
                }
            }
        }

        addNodesAndEdges(selectedApp, 0);

        // Update levelColors based on maxDepth
        var startColor = '#33FF57'; // Light green
        var endColor = '#FF5733'; // Red
        levelColors = generateColorGradient(startColor, endColor, maxDepth + 1);

        // Common data for both graphs
        var data = {
            nodes: nodes.map(node => ({
                ...node,
                color: { background: levelColors[node.depth], border: '#2B7CE9' },
                label: `${node.label}\n(Level ${node.depth + 1})`
            })),
            edges: edges
        };

        // Options for bubble graph
        var bubbleOptions = {
            nodes: {
                // shape: 'dot',
                // size: 30,
            },
            physics: {
                enabled: true
            },
            edges: {
                smooth: true,
                arrows: { to: true },
            },
        };

        // Options for control flow graph
        var cfgOptions = {
            layout: {
                hierarchical: {
                    direction: 'UD',
                    sortMethod: 'directed'
                }
            },
            nodes: {
                shape: 'box'
            },
            physics: {
                hierarchicalRepulsion: {
                    centralGravity: 0.0
                },
                solver: 'hierarchicalRepulsion'
            }
        };

        // Initialize bubble graph
        new vis.Network(document.getElementById('bubbleGraph'), data, bubbleOptions);

        // // Initialize control flow graph
        new vis.Network(document.getElementById('controlFlowGraph'), data, cfgOptions);

        // Generate legend based on levelColors
        generateLegend(maxDepth, levelColors);
    }

    // Function to generate the legend, now accepts maxDepth and levelColors
    function generateLegend(maxDepth, levelColors) {
        var legendContainer = document.getElementById('legend');
        legendContainer.innerHTML = ''; // Clear existing legend content
        var title = document.createElement('h4');
        title.textContent = 'Dependency Levels';
        legendContainer.appendChild(title);

        // Loop over the levelColors array up to the maximum depth encountered in the graph
        for (var i = 0; i <= maxDepth; i++) {
            var color = levelColors[i]; // Get the color for the current depth level
            var legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.marginBottom = '5px';

            var colorBox = document.createElement('div');
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.backgroundColor = color;
            colorBox.style.marginRight = '10px';

            var label = document.createElement('span');
            label.textContent = `${i + 1} level deep`;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        }
    }

    // Check if selectedApp is provided and valid
    if (selectedApp && items[selectedApp]) {
        generateGraphs(selectedApp);
    } else {
        // Listen for selection changes if no initial app is provided or found
        document.getElementById("appSelect").addEventListener("change", function() {
            var selectedApp = this.value;
            if (!selectedApp) return;
            generateGraphs(selectedApp);
        });
    }

}

// Execute setupGraph based on URL path or wait for selection
window.onload = function() {
    // Extract app ID from the URL path, if present
    var pathAppId = window.location.pathname.split('/')[1];
    if (pathAppId) {
        setupGraph(pathAppId);
    } else {
        setupGraph();
    }
};
