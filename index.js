import SVG from "svg.js"

console.log("SVG", SVG);

const PASTELLHEX = ['#a7ff74', '#ffe8e8', '#81b4ff', '#ffa9a9', '#f7ffa6', '#c5bbff', '#69faff', '#ffd29b', '#98ffc0'];

const container = new SVG("container").size(window.innerWidth, window.innerHeight);

const data = [
    {
        name: 'Weights + Energy',
        children: [
            'Force + Motion'
        ]
    },
    {
        name: 'Force + Motion',
        children: ['Energy']
    },
    {
        name: 'Heat',
        children: ['Energy', 'Friction']

    },
    {
        name: 'Energy',
        children: ['Entropy']
    },
    {
        name: 'Entropy',
        children: []
    },
    {
        //parent: 'Visualizing Data',
        name: 'Graphing',
        tag: 'toolbox',
        children: [] //'Plotting in 2D'
    },
    {
        name: "Friction",
        children: ["Entropy"]
    }
]
const Node = class { //saves in object to have memory off variables (assignment by reference)...
    constructor(parameters) {
        const presets = {
            name: 'ABC',
            level: -1,
            tooltip: "you hovered",
            view: {
                x: 200,
                y: 200,
                size: 50,
                normX: 0,
                normY: 0
            },
            siblings: [],
            children: [],
            parents: [],
            paths: 0
        }
        //presets go on this and parameters override presets
        Object.assign(this, presets, parameters)
    }
    setLevel(level) {
        //always pick heighest level --> A => C, A=> B => C ... C ==> level 3 instead of 2
        if (level > this.level) {
            this.level = level;
        }
    }

    addParent(p) {
        if (this.parents.includes(p)) {
            return
        }
        this.parents.push(p);
    }

    allChildDo(func, num) {
        this[func](num);
        console.log("childs", this.name, this.children)

        if (this.children.length < 1) {
            return
        }
        this.children.forEach(c => c.allChildDo("setLevel", 1 + num))
    }
    makePath() {
        const that = this;
        const group = container.group();
        this.children.forEach(function (target) {
            group.path().attr('d', pathRound({from: that.view, to: target.view})) //sigmoidLine({from: node, to: target}))
                .attr('stroke-width', 7)
                .attr('stroke-opacity', 0.8)
                .attr('stroke', `url(#strokeCol)` )
                .attr('fill', 'transparent')

            that.paths++;
            if (that.paths >= that.children.length) {
                return
            }
        })
    }
};

const nodes = data.map(d => new Node({name: d.name, children: d.children}))

const Graph = class {
    constructor(nodes, svg = container) {
        this.svg = svg;
        this.nodes = nodes;
        this.injectDependencies();
    }

    getNode(name) {
        return this.nodes.filter(n => n.name == name)[0] || null;
    }

    injectDependencies() {
        this.nodes.forEach(n => n.children = (n.children.map(nString => this.getNode(nString))));
        this.nodes.forEach(n => n.children.forEach(c => c.addParent(n)));

        this.calcHierachy();
        this.makeLayers();
        this.update()

    }

    update() {
        this.clearPaths();
        this.calcHierachy();
        this.setPositionsRelative();
        this.drawPaths();
    }

    clearPaths() {

    }

    drawPaths() {
        this.nodes.forEach(n=> n.makePath())
    }

    calcHierachy() {
        //set root
        this.nodes.forEach(n => {
            if (n.parents.length < 1) {
                n.setLevel(0)
            }
        })
        const roots = this.nodes.filter(n => n.level == 0)

        roots.forEach(r => r.allChildDo("setLevel", 0))
    }

    makeLayers() {
        this.layers = [[]];
        this.nodes.forEach(n => {
            if (!this.layers[0][n.level]) {
                this.layers[0][n.level] = []
            }
            this.layers[0][n.level].push(n)
        });

        console.log('layers, ', this.layers)

    }

    setPositionsRelative() {
        const that = this;
        const layerCount = this.layers[0].length;
        for (let i = 0; i < this.layers[0].length; i++) {
            this.layers[0][i].forEach((n, j) => {
                n.view.x = i / layerCount;
                const nodesInLayer = that.layers[0][i].length;
                n.view.y = (1 + j) * (1 / (nodesInLayer + 1)); //if 2 els ==> first at 1/3 second at 2/3

                n.view.normX = n.view.x * window.innerWidth + 100;
                n.view.normY = n.view.y * window.innerHeight;
            })
        }
    }
}

const G = new Graph(nodes);
window.G = G;
console.log(G.nodes);
const e = G.getNode('Energy');


const circles = G.nodes.map(d => container.circle(40)
    .attr("cx", d.view.normX)
    .attr("cy", d.view.normY)
    .attr('fill', container.gradient('linear', function (stop) {
        stop.at(0, PASTELLHEX[Math.floor(Math.random() * PASTELLHEX.length)], 1)
        stop.at(1, PASTELLHEX[Math.floor(Math.random() * PASTELLHEX.length)], 1)
    }))
)


const gradBlueDark = container.gradient('linear', function (stop) {
    stop.at(0, '#3193ff', 0.9)
    stop.at(1, 'grey', 0.9)
}).attr('id', "strokeCol")//fuuuuuckkk youuuu


let textBackgrounds = G.nodes
    .map(d => container.rect(Math.sqrt(d.name.length) * 30, 20)
        .attr("x", d.view.normX)
        .attr("y", d.view.normY))

textBackgrounds.map(e => e.fill(gradBlueDark));
textBackgrounds.map(e => e.addClass('textBG'))

let textViews = G.nodes.map(d => {
    let c = container.text(d.name)
        .font(
        {
            family: 'Helvetica',
            size: 12,
            fontWeight: "bold"
        })
        .attr("fill", "white")
        .attr("x", d.view.normX)
        .attr("y", d.view.normY);

    return c;

});

function pathRound(d) {
    const f = Object.assign({}, d.from);
    const t = Object.assign({}, d.to);


    f.x = f.normX;
    f.y = f.normY;

    t.x = t.normX;
    t.y = t.normY;

    console.log("pos", t, f + " " + d)

    const dX = t.x - f.x;
    const dY = t.y - f.y;

    return `M ${f.x} ${f.y} Q ${f.x + dX/4} ${f.y - dX/10}, ${f.x + dX/2} ${f.y} T ${t.x} ${t.y}`

    // return `M ${f.x} ${f.y} Q ${f.x + dX/4} ${f.y - 50}, ${f.x + dX/2} ${f.y} T ${t.x} ${t.y}`
    //https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    //"M10 80 Q 52.5 10, 95 80 T 180 80"
}


console.log('Energy', e)
