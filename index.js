import {DataSet, Network} from 'vis/index-network'
import 'vis/dist/vis-network.min.css'
import {formatNodes, getObjByProp} from './mUtils'
import graphData from "./physics.json"
import {nodes as exampleNodes, edges as exampleEdges} from "./exampleData"




const makeDiv = function (items) {
    let html = "";
    if (items.length) {
        items.forEach(i => {html += "<span>" + i + " | </span>"})
    }
    return html
}

console.log(graphData.data.nodes);
let myNodes = formatNodes(graphData.data.nodes);

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






//hasIn //hasOut


const links = graphData.data.links;

const getLinksForID = function(id, links) {
    return links.filter(e => (e.from == id || e.to == id));
}

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
        font: {
            size: 14,
            color: '#ffffff'
        },
        borderWidth: 2
    },
    layout: {
        // randomSeed: 475928
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
        },
        "main": {
            color: "orange",
            shape: "diamond"
        }
    }
};

let network = window.network = new Network(container, data, options);
//place the start node on the left
const netNodes =  window.netNodes = network.nodesHandler.body.nodes; //htmlcollection --> array

network.redraw();

//network.focus("3", {scale: 1.5})
// netNodes['0'].x = -container.clientWidth/2
// netNodes[netNodes.length-1].x = container.clientWidth/2

const metaText = document.getElementById("metaData")

let detailedView = false;

network.on('zoom', function(event){
    if ( !detailedView && event.direction === "+" && network.getScale() > 2) {
        // const scale = network.getScale();
        // const position = network.storePositions();
        // network.setOptions({autoResize: false})
        // network.setData({nodes: myNodes, edges: links})


        const leftOverNodes = myNodes.filter(n => mainN.get(n.id) === null)
        console.log("leftover", leftOverNodes)
        leftOverNodes.forEach(n => {
            console.log("NNN",n)
            mainN.add(n)
        })

        detailedView = true;
        // network.moveTo({scale: 2, position, animation: {duration: 1500}})

    }
    // else if ( detailedView && event.direction === "-" && network.getScale()< 0.5){
    //     const scale = network.getScale();
    //     const position = network.storePositions();
    //     network.setData({nodes: mainN, edges: links})
    //     detailedView = false;
    //     network.moveTo({scale: 2, position, animation: {duration: 1500}})
    // }
})

// network.on('click', function(event){
//     const id = event.nodes[0];
//
//     //go from the clickedNode to the actual node in Data
//     const node = getObjByProp(dat.nodes, "uuid", id)[0]
//     console.log(node)
//
//     //get the contents the node is pointing to
//     const contents = getObjByProp(dat.allContents, "uuid", node.contents)
//     if (contents.length < 1) {
//         contents[0] = "no content"
//     }
//     console.log(contents)
//
//     //display contents on the right of the graph
//     const titles = contents.map(c => c.title)
//     metaText.innerHTML = makeDiv(titles)
// });

//split Data
    //main nodes
    //secondary nodes (group 2) --> their own css

//if zoom
    //network.setData(more nodes)


