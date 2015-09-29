// code taken and adapted from the Colt Java library cern.jet.stat http://dst.lbl.gov/ACSSoftware/colt/

var exp = module.exports

exp.p1evl = function( x, coef, N ) {
    var ans;

    ans = x + coef[0];

    for(var i=1; i<N; i++) { ans = ans*x+coef[i]; }

    return ans;
}

exp.polevl = function( x, coef, N ) {
    var ans;
    ans = coef[0];

    for(var i=1; i<=N; i++) ans = ans*x+coef[i];

    return ans;
}

