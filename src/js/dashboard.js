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