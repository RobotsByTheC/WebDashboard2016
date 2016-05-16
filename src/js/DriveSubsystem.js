var PATH_FOLLOWER_TABLE = "/Parameters/Path Follower/";
var ARCADE_DRIVE_ALGORITHM_TABLE = "/Parameters/Arcade Drive Algorithm/";

var HEADING_PID_KEY = ARCADE_DRIVE_ALGORITHM_TABLE + "debug_pid";

var LEFT_WHEEL_PID_KEY = "/Parameters/left_wheel_pid_debug";
var RIGHT_WHEEL_PID_KEY = "/Parameters/right_wheel_pid_debug";

var TIMES_KEY = PATH_FOLLOWER_TABLE + "times";
var LEFT_POSITIONS_KEY = PATH_FOLLOWER_TABLE + "left_positions";
var RIGHT_POSITIONS_KEY = PATH_FOLLOWER_TABLE + "right_positions";
var LEFT_VELOCITIES_KEY = PATH_FOLLOWER_TABLE + "left_velocities";
var RIGHT_VELOCITIES_KEY = PATH_FOLLOWER_TABLE + "right_velocities";
var HEADINGS_KEY = PATH_FOLLOWER_TABLE + "headings";
var DEBUG_VALUES_KEY = PATH_FOLLOWER_TABLE + "debug_values";

var timeAxis = {
    title : "Time (s)"
};

// Position layout
var positionLayout = {
    xaxis : timeAxis,
    yaxis : {
        title : "Position (m)"
    }
};
var leftPositionLayout = {
    title : "Left Position"
};
$.extend(leftPositionLayout, positionLayout);
var rightPositionLayout = {
    title : "Right Position"
};
$.extend(rightPositionLayout, positionLayout);

// Velocity layout
var velocityLayout = {
    xaxis : timeAxis,
    yaxis : {
        title : "Velocity (m/s)"
    }
};
var leftVelocityLayout = {
    title : "Left Velocity"
};
$.extend(leftVelocityLayout, velocityLayout);
var rightVelocityLayout = {
    title : "Right Velocity"
};
$.extend(rightVelocityLayout, velocityLayout);

// Acceleration
var accelerationLayout = {
    xaxis : timeAxis,
    yaxis : {
        title : "Acceleration (m/s^2)"
    }
};
var leftAccelerationLayout = {
    title : "Left Accleration"
};
$.extend(leftAccelerationLayout, accelerationLayout);
var rightAccelerationLayout = {
    title : "Right Acceleration"
};
$.extend(rightAccelerationLayout, accelerationLayout);

// Heading
var headingLayout = {
    title : "Heading",
    xaxis : timeAxis,
    yaxis : {
        title : "Heading (degrees)",
        range : [ -180, 180 ],
        dtick : 45
    }
};

var traceTemplate = {
    mode : 'lines',
    type : 'scattergl',
    x : [ 0 ],
    y : [ 0 ]
};

var pathFollowerGraphs = [];

var lastTime = 0;

NetworkTables.addKeyListener(DEBUG_VALUES_KEY, function(key, value, isNew) {
    var time = value[0];
    for ( var i in pathFollowerGraphs) {
        var element = pathFollowerGraphs[i];
        if (time < lastTime) {
            element.data[1].x = [];
            element.data[1].y = [];
        }
        element.data[1].x.push(time);
        element.data[1].y.push(value[i]);
        element.update();
    }
    lastTime = time;
});

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

var packer = new JSPack();

function decodeBase64NumberArray(encoded) {
    var decodedStr = window.atob(encoded);
    var decoded = packer.Pack("s".repeat(decodedStr.length), decodedStr);
    var length = decoded.length / 8;
    return packer.Unpack(length + "d", decoded);
}

function setupMotionProfileGraph(element, key, dataIndex, layout) {
    var trace = {
        name : "Profile"
    };
    var dataTrace = {
        name : "Observed"
    };
    element.update = function() {
    }
    $.extend(true, trace, traceTemplate);
    $.extend(true, dataTrace, traceTemplate);
    NetworkTables.addKeyListener(TIMES_KEY, function(key, value, isNew) {
        switch (typeof value) {
        case "string":
            trace.x = decodeBase64NumberArray(value);
            break;
        default:
            trace.x = value;
        }
        element.update();
    }, true);
    NetworkTables.addKeyListener(key, function(key, value, isNew) {
        switch (typeof value) {
        case "string":
            trace.y = decodeBase64NumberArray(value);
            break;
        default:
            trace.y = value;
        }
        element.update();
    }, true);

    Plotly.newPlot(element, [ trace, dataTrace ], layout);
    element.update = function() {
        Plotly.redraw(element);
    }
    pathFollowerGraphs[dataIndex] = element;
}

$(window).resize(function() {
    $(".graph").each(function() {
        Plotly.Plots.resize(this);
    });
});

window.onload = function() {
    // Heading PID
    var headingPIDGraph = $("#heading-pid-graph")[0];
    setupPIDGraph(headingPIDGraph, HEADING_PID_KEY, headingLayout);

    // Wheel velocity PID
    var leftWheelPIDGraph = $("#left-wheel-pid-graph")[0];
    setupPIDGraph(leftWheelPIDGraph, LEFT_WHEEL_PID_KEY, leftVelocityLayout);
    var rightWheelPIDGraph = $("#right-wheel-pid-graph")[0];
    setupPIDGraph(rightWheelPIDGraph, RIGHT_WHEEL_PID_KEY, rightVelocityLayout);

    // Position
    var leftPositionGraph = $("#left-position-graph")[0];
    setupMotionProfileGraph(leftPositionGraph, LEFT_POSITIONS_KEY, 2,
            leftPositionLayout);
    var rightPositionGraph = $("#right-position-graph")[0];
    setupMotionProfileGraph(rightPositionGraph, RIGHT_POSITIONS_KEY, 3,
            rightPositionLayout);

    // Velocity
    var leftVelocityGraph = $("#left-velocity-graph")[0];
    setupMotionProfileGraph(leftVelocityGraph, LEFT_VELOCITIES_KEY, 4,
            leftVelocityLayout);
    var rightVelocityGraph = $("#right-velocity-graph")[0];
    setupMotionProfileGraph(rightVelocityGraph, RIGHT_VELOCITIES_KEY, 5,
            rightVelocityLayout);

    var headingGraph = $("#heading-graph")[0];
    setupMotionProfileGraph(headingGraph, HEADINGS_KEY, 1, headingLayout);
};