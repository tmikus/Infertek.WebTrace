//Infertek.WebTrace v0.1.0 | (c) 2012 Tomasz Mikuś | http://www.opensource.org/licenses/mit-license
(function(window, undefined) {
if (!window.Infertek)
    window.Infertek = {};
if (!window.Infertek.WebTrace)
    window.Infertek.WebTrace = {};

window.Infertek.WebTrace.applicationStartTime = +new Date();
window.Infertek.WebTrace.eventsList = [];
window.Infertek.WebTrace.collectEventsAsArchive = function () {
    /// <summary>
    /// Collects events reported by application as JSON string and then compresses
    /// it using DEFLATE algorithm.
    /// </summary>
    /// <returns type="String">String containing compressed events from application.</returns>
    
    return Base64.toBase64(RawDeflate.deflate(Base64.utob(JSON.stringify(window.Infertek.WebTrace.eventsList))))
};

var lastMouseMoveTimes = [];
var nodeIdentifier = 0;
var infertek_webtrace_nodeid = "infertek_webtrace_nodeid";
var infertek_webtrace_eventhandlersbound = "infertek_webtrace_eventhandlersbound";

var nodeAppendChild = Node.prototype.appendChild;
var nodeInsertBefore = Node.prototype.insertBefore;
var nodeReplaceChild = Node.prototype.replaceChild;

var bindEventHandlers = function (node) {
    /// <summary>
    /// Binds event handlers to specified node.
    /// </summary>
    /// <param name="node" type="Element">Node to which bind event handlers.</param>
    
    if (node[infertek_webtrace_eventhandlersbound])
        return;
    
    node[infertek_webtrace_eventhandlersbound] = true;
    
    $(node).on({
        click: reportEvent,
        dblclick: reportEvent,
        mousedown: reportEvent,
        mouseup: reportEvent,
        mouseover: reportEvent,
        mousemove: reportEvent,
        mouseout: reportEvent,
        keydown: reportEvent,
        keypress: reportEvent,
        keyup: reportEvent,
        load: reportEvent,
        unload: reportEvent,
        abort: reportEvent,
        error: reportEvent,
        resize: reportEvent,
        scroll: reportEvent,
        select: reportEvent,
        change: reportEvent,
        submit: reportEvent,
        reset: reportEvent,
        focus: reportEvent,
        blur: reportEvent,
        focusin: reportEvent,
        focusout: reportEvent,
    });  
};

var generateNodeIdentifier = function (node) {
    /// <summary>
    /// Generates identifier for specified node.
    /// </summary>
    /// <param name="node" type="Element">Node to be generated.</param>
    
    if (!node[infertek_webtrace_nodeid])
        node[infertek_webtrace_nodeid] = nodeIdentifier++;
};
    
var reportEvent = function (event) {
    var dateTimeNow = +new Date();
    
    // Filter events to remove fast repeating events such as mousemove...
    if (event.type == "mousemove") {
        if (lastMouseMoveTimes[this[infertek_webtrace_nodeid]] && dateTimeNow - lastMouseMoveTimes[this[infertek_webtrace_nodeid]] < 36)
            return;
    
        lastMouseMoveTimes[this[infertek_webtrace_nodeid]] = dateTimeNow;   
    }
        
    window.Infertek.WebTrace.eventsList.push({
        event: {
            altKey: event.altKey,
            attrChange: event.attrChange,
            attrName: event.attrName,
            bubbles: event.bubbles,
            button: event.button,
            buttons: event.buttons,
            cancelable: event.cancelable,
            clientX: event.clientX,
            clientY: event.clientY,
            ctrlKey: event.ctrlKey,
            data: event.data,
            eventPhase: event.eventPhase,
            metaKey: event.metaKey,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            pageX: event.pageX,
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY,
            shiftKey: event.shiftKey,
            type: event.type,
            which: event.which
        },
        nodeID: this[infertek_webtrace_nodeid],
        timeFromApplicationStart: dateTimeNow - window.Infertek.WebTrace.applicationStartTime
    });
};

Node.prototype.appendChild = function (node) {
    generateNodeIdentifier(node);
    bindEventHandlers(node);
    return nodeAppendChild.apply(this, arguments);
};

Node.prototype.insertBefore = function (newNode, referenceNode) {
    generateNodeIdentifier(newNode);
    bindEventHandlers(newNode);
    return nodeInsertBefore.apply(this, arguments);
};

Node.prototype.replaceChild = function (newNode, oldNode) {
    generateNodeIdentifier(newNode);
    bindEventHandlers(newNode);
    return nodeReplaceChild.apply(this, arguments);
};

$(function () {
    $("*").each(function (index, node) {
        generateNodeIdentifier(node);
        bindEventHandlers(node);
    });
});})(window, undefined);