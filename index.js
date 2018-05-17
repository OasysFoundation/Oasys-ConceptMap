import SVG from "svg.js"
import {DataSet, Network} from 'vis/index-network'
import 'vis/dist/vis-network.min.css'
import {formatNodes, getObjByProp} from './mUtils'
import dat from "./physics.json"
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
let myNodes = formatNodes(dat.nodes);

myNodes.forEach(m => {
    const rnd =m.label.split(" ").length;
    if (rnd == 2) {
        m.group = 2;
    }
    else if (rnd == 1) {
        m.group = 1
    }
    else {m.group = 0}
})

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
            shape: "triangle",
            color: "purple"
        },
        1: {
            shape: "diamond",
            color: "yellow"
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

    //go from the clickedNode to the actual node in Data
    const node = getObjByProp(dat.nodes, "uuid", id)[0]
    console.log(node)

    //get the contents the node is pointing to
    const contents = getObjByProp(dat.allContents, "uuid", node.contents)
    if (contents.length < 1) {
        contents[0] = "no content"
    }
    console.log(contents)

    //display contents on the right of the graph
    const titles = contents.map(c => c.title)
    metaText.innerHTML = makeDiv(titles)
});

