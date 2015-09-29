var exp = module.exports

exp.zeroMatrix = function(n) {
    var m = []
    for (var i = 0; i < n; i++) {
        m.push([])
        for (var j = 0; j < n; j++) {
            m[i].push(0)
        }
    }
    return m
}
