var NT_KEY_ATTR = "data-nt-key";

var NTButtonProto = Object.create(HTMLButtonElement.prototype);
NTButtonProto.createdCallback = function() {
    var elem = this;
    $(this).mousedown(function() {
        NetworkTables.putValue(elem.getAttribute(NT_KEY_ATTR), true);
    }).mouseup(function() {
        NetworkTables.putValue(elem.getAttribute(NT_KEY_ATTR), false);
    });
};

document.registerElement('nt-button', {
    prototype : NTButtonProto,
    extends : 'button'
});

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

var timeAxis = {
    title : "Time (s)"
};

var traceTemplate = {
    mode : 'lines',
    type : 'scattergl',
    x : [ 0 ],
    y : [ 0 ]
};

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