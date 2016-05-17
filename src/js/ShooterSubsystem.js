var SET_SHOOTER_SPEED_TABLE = "/Parameters/Set Shooter Speed/";
var LEFT_VELOCITY_KEY = SET_SHOOTER_SPEED_TABLE + "left_velocity";
var RIGHT_VELOCITY_KEY = SET_SHOOTER_SPEED_TABLE + "right_velocity";

// Velocity layout
var velocityLayout = {
    xaxis : timeAxis,
    yaxis : {
        title : "Velocity (RPM)"
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

window.onload = function() {
    // Velocity
    var leftVelocityGraph = $("#left-velocity-graph")[0];
    setupPIDGraph(leftVelocityGraph, LEFT_VELOCITY_KEY, leftVelocityLayout);
    var rightVelocityGraph = $("#right-velocity-graph")[0];
    setupPIDGraph(rightVelocityGraph, RIGHT_VELOCITY_KEY, rightVelocityLayout);
};