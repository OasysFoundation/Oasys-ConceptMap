import {DataSet, Network} from 'vis/index-network'
import 'vis/dist/vis-network.min.css'
import {formatNodes, getObjByProp} from './mUtils'
import graphData from "./physics.json"
import {nodes as exampleNodes, edges as exampleEdges} from "./exampleData"

const DATA = graphData.data;
console.log(DATA.nodes);
let myNodes = formatNodes(DATA.nodes);

//dirty hack to have textPadding
myNodes.forEach(m => {
    m.label = " " + m.label + " "
})

const links = DATA.links;
const hasInOut = function(nodeId, links) {
    return (links.filter(e => e.from == nodeId).length > 0 && links.filter(e=> e.to==nodeId).length > 0)
}

const mainNodes = myNodes.filter(n => hasInOut(n.id, links))
//give them styling
mainNodes.map(n => n.group = "main");
const mainIDs = mainNodes.map(n => n.id);

//make dynamic with VisJS add /remove functions
const mainN = window.mainN =  new DataSet(mainNodes)
const edges = new DataSet(links)


console.log("mainnodes   " , mainNodes);


// create a network
const container = document.getElementById('container');
const data = {
    nodes: mainN,
    edges: edges
};
const options = {
    interaction: {
        navigationButtons: true
    },
    autoResize: true,
    nodes: {
        shape: 'dot',
        size: 30,
        // color: "white",
        font: {
            size: 14,
            color: '#ffe8e8',
            background: "#444444"
        },
       color: {
           highlight: {
               background: "#ff8647",
               border: "#ff4f48"
           }
       },

        borderWidth: 6
    },
    edges: {
        width: 2,
        arrows: {
            to: true
        }
    },
    groups: {
        "minor" :{
            shape: "diamond",
            size: 15,
            color: {
                border: "#9092ff",
                background: "#ffcef9"
            },
        },
        "main": {
            shape: "diamond",
            color: {
                background: "#7ba8ff",
                border: "#595959"
            },
        }
    },
    physics: {
        "barnesHut": {
            "centralGravity": 0.2,
            "springConstant": 0.12
        },
        "minVelocity": 0.75
    }
};

let network = window.network = new Network(container, data, options);
//place the start node on the left
const netNodes =  window.netNodes = network.nodesHandler.body.nodes; //htmlcollection --> array

network.redraw();

const metaText = document.getElementById("metadata")

let zoomInCount =0;
let zoomOutCount =0;

const minorNodes = myNodes.filter(m => !mainIDs.includes(m.id) );
minorNodes.map(m => m.group = "minor");

let minorCopy = minorNodes.slice();
let minorsInside = [];

console.log("minor  ", minorNodes);

network.on('zoom', function(event){
    if (event.direction === "+" && network.getScale() > 0.8) {
        zoomInCount++;
        if (zoomInCount % 5 === 0 && minorNodes.length > 1) {
            const minor = minorCopy.pop();
            if (typeof minor === "object") {
                minorsInside.push(minor);
                mainN.add(minor)
            }
        }
    }
    else if (event.direction === "-" && network.getScale() < 1){
        zoomOutCount++;
        if (zoomOutCount % 3 === 0) {
            //remove node and put in memory for adding it later
            const minor = minorsInside.pop();
            if (typeof minor === "object") {
                minorCopy.push(minor)
                mainN.remove(minor.id)
            }
        }
    }
})

network.on('click', function(event){
    const id = event.nodes[0];

    if (!id) {return}
    //go from the clickedNode to the actual node in Data
    const node = getObjByProp(DATA.nodes, "uuid", id)[0]
    console.log('node  ', node)
    metaText.childNodes.forEach(c => {
        metaText.innerHTML = ""
    })
    //get the contents the node is pointing to
    if (node.metadata) {
        if (node.metadata.contents) {
            const contents = node.metadata.contents
            if (contents.length < 1) {
                contents[0] = "no content"
            }
            console.log(contents)

            //display contents on the right of the graph
            const titles = contents.map(c => c.title)


            titles.forEach(t => {
                const button = document.createElement('button');
                button.classList.add("buttonX");
                button.textContent = t;
                metaText.appendChild(button)})
        }
    }

});

