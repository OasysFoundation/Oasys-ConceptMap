import SVG from "svg.js"

console.log("SVG", SVG);

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
        children: ['Energy']

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

            },
            siblings: [],
            children: [],
            parents: [],
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
        /*    if (num > this.level) {
                this.level = num;
            }
            else {
                return
            }
            let l = this.level;
            l++;*/

        this[func](num);

        console.log("childs", this.name, this.children)

        /* const isChildrenKnowMe = this.children
             .map(c => c.parents.includes(this))
             .filter(v => v == false).length > 0;*/

        if (this.children.length < 1) {
            return
        }
        this.children.forEach(c => c.allChildDo("setLevel", 1 + num))
    }
};

const nodes = data.map(d => new Node({name: d.name, children: d.children}))

const Graph = class {
    constructor(nodes) {
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
            })
        }
    }
}

const G = new Graph(nodes);
window.G = G;
console.log(G.nodes);
const e = G.getNode('Energy');

const circles = G.nodes.map(d => container.circle(40)
    .attr("cx", d.view.x * window.innerWidth + 100)
    .attr("cy", d.view.y * window.innerHeight))

const texts = G.nodes.map(d => container.text(d.name)
    .attr("x", d.view.x * window.innerWidth + 80)
    .attr("y", d.view.y * window.innerHeight + 15))
// .addClass('circles'));


console.log('Energy', e)
