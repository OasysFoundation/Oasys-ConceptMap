import SVG from "svg.js"
import {DataSet, Network} from 'vis/index-network'
import 'vis/dist/vis-network.min.css'
import {formatNodes, getObjByProp} from './mUtils'
import dat from "./data.json"
import {nodes as exampleNodes, edges as exampleEdges} from "./exampleData"

console.log("SVG", SVG);


const makeDiv = function (items) {
    let html = "";
    if (items.length) {
        items.forEach(i => {html += "<span>" + i + " | </span>"})
    }
    return html
}

console.log(dat.nodes);
const myNodes = formatNodes(dat.nodes);
const links = dat.links;



// create a network
var container = document.getElementById('container');
var data = {
    nodes: myNodes,
    edges: links
};
var options = {
    interaction: {
        navigationButtons: true
    },
    autoResize: true,
    nodes: {
        shape: 'dot',
        size: 30,
        font: {
            size: 14,
            color: '#ffffff'
        },
        borderWidth: 2
    },
    edges: {
        width: 2,
        arrows: {
            to: true
        }
    },
    groups: {
        0: {
            shape: "diamond"
        }
    }
};

var network = window.network = new Network(container, data, options);
//place the start node on the left
const netNodes =  window.netNodes = network.nodesHandler.body.nodes; //htmlcollection --> array
//netNodes is an OBJECT, not an Array
document.getElementById("zoomtest").addEventListener('mousedown',function() {
    network.focus("3", {scale: 1.5})
})
network.redraw();

// netNodes['0'].x = -container.clientWidth/2
// netNodes[netNodes.length-1].x = container.clientWidth/2

const metaText = document.getElementById("metaData")

network.on('click', function(event){
    const id = event.nodes[0];
    const node = getObjByProp(dat.nodes, "uuid", id)[0]
    console.log(node)
    const contents = getObjByProp(dat.allContents, "uuid", node.contents)
    if (contents.length < 1) {
        contents[0] = "no content"
    }
    console.log(contents)
    const titles = contents.map(c => c.title)
    metaText.innerHTML = makeDiv(titles)
})

