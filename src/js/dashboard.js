// Custom HTML attribute name for specifying network table key
var NT_KEY_ATTR = "data-nt-key";

// ==============
// Boolean button
// ==============

// Prototype for button that toggles a boolean
var NTButtonProto = Object.create(HTMLButtonElement.prototype);
NTButtonProto.createdCallback = function() {
    var elem = this;
    $(this).mousedown(function() {
        NetworkTables.putValue(elem.getAttribute(NT_KEY_ATTR), true);
    }).mouseup(function() {
        NetworkTables.putValue(elem.getAttribute(NT_KEY_ATTR), false);
    });
};

// Register element using experimental custom element registry (won't work in
// old browsers)
document.registerElement('nt-button', {
    prototype : NTButtonProto,
    extends : 'button'
});

// ===================================================================
// Input field - text box for number and string, check box for boolean
// ===================================================================

var NTInputProto = Object.create(HTMLInputElement.prototype);
NTInputProto.createdCallback = function() {
    var elem = this;
    this.ntType = "string";
    $(this).change(function(e) {
        var value;
        switch (elem.type) {
        case "checkbox":
            value = elem.checked;
            break;
        case "number":
            value = Number(elem.value);
            break;
        default:
            value = elem.value;
            break;
        }
        NetworkTables.putValue(elem.getAttribute(NT_KEY_ATTR), value);
    });
    NetworkTables.addKeyListener(elem.getAttribute(NT_KEY_ATTR), function(key,
            value, isNew) {
        switch (typeof value) {
        default:
        case "string":
            elem.type = "text"
            break;
        case "number":
            elem.type = "number";
            break;
        case "boolean":
            elem.type = "checkbox";
            elem.checked = value;
            break;
        }
        elem.value = value;
    }, true);
};

document.registerElement('nt-input', {
    prototype : NTInputProto,
    extends : 'input'
});

// ====================
// PID controller graph
// ====================

var timeAxis = {
    title : "Time (s)"
};

var traceTemplate = {
    mode : 'lines',
    type : 'scattergl',
    // Must have some data or it won't initially render
    x : [ 0 ],
    y : [ 0 ]
};

//Prototype for button that toggles a boolean
var NTPIDGraphProto = Object.create(HTMLElement.prototype);
NTPIDGraphProto.createdCallback = function() {
    var element = this;
    var key = element.getAttribute(NT_KEY_ATTR);
    var title = element.getAttribute("title") || key;
    var yLabel = element.getAttribute("data-y-label") || "Units";
    var layout = {
            xaxis : timeAxis,
            yaxis : {
                title : yLabel
            },
            title : title
        };
    setupPIDGraph(element, key, layout);
};

document.registerElement('nt-pid-graph', {
    prototype : NTPIDGraphProto,
});

// Set up a graph for a PID controller on the specified element
function setupPIDGraph(element, key, layout) {
    layout = $.extend(true, {}, layout);
    layout.xaxis.range = [ 0, 0 ]
    var setpointTrace = {
        name : "Setpoint"
    }
    var inputTrace = {
        name : "Input"
    }
    $.extend(true, setpointTrace, traceTemplate);
    $.extend(true, inputTrace, traceTemplate);
    element.update = function() {
    }
    NetworkTables.addKeyListener(key, function(key, value, isNew) {
        inputTrace.x.push(value[0]);
        setpointTrace.x.push(value[0]);

        setpointTrace.y.push(value[1]);
        inputTrace.y.push(value[2]);

        layout.xaxis.range[0] = value[0] - 10;
        layout.xaxis.range[1] = value[0];

        element.update();
    });
    Plotly.newPlot(element, [ setpointTrace, inputTrace ], layout);
    element.update = function() {
        Plotly.redraw(element);
    }
}