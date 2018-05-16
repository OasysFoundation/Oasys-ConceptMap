

//uuid ->       id
//concept -->   label
//
const formatNodes = function(nodes) {
    const ns = [];
    nodes.forEach(n => ns.push({id: n.uuid, label: n.concept}))
    return ns
}

const getObjByProp = function(arr, prop, values) {
    console.log("value  ", values)
    if (values.length) {
        return arr.filter(e => values.includes(e[prop]))
    }
    else {
        return arr.filter(e => e[prop] == values)[0] || []
    }
}

export {formatNodes, getObjByProp}