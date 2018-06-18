function cmp_rnum(a,b) {
    return a-b
}

function index_map(acc, item, index) {
    acc[item] = index
    return acc
}

module.exports = function(v) {
    var rankindex = v.slice().sort(cmp_rnum).reduce(index_map, Object.create(null));
    return v.map(function(item){ return rankindex[item]+1; });
}
