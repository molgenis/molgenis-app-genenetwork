// most code taken and adapted from the Colt Java library cern.jet.stat http://dst.lbl.gov/ACSSoftware/colt/
// in which code taken and adapted from the Java 2D Graph Package 2.4 http://www.sci.usq.edu.au/staff/leighb/graph/Top.html
// which in turn is a port from the Cephes 2.2 Math Library (C) http://people.ne.mediaone.net/moshier/index.html#Cephes
//
// some code (error, complementaryError) taken and adapted from JSci http://jsci.sourceforge.net/
// in which code based on C code from Sun Microsystems
// error and complementaryError from JSci is used instead of the Colt implementation because the latter lacks precision for high Z-scores (>8.x), giving zero p-values

var gamma = require('./gamma')
var polynomial = require('./polynomial')

var SQRT2 = 1.4142135623730950488016887242096980785696718753769
var SQRTH = 7.07106781186547524401e-1
var MAXLOG = 7.09782712893383996732e2;

/* approximation for 0 <= |y - 0.5| <= 3/8 */
var P0 = [-5.99633501014107895267E1,
    9.80010754185999661536E1, -5.66762857469070293439E1,
    1.39312609387279679503E1, -1.23916583867381258016E0,
];
var Q0 = [
    /* 1.00000000000000000000E0,*/
    1.95448858338141759834E0,
    4.67627912898881538453E0,
    8.63602421390890590575E1, -2.25462687854119370527E2,
    2.00260212380060660359E2, -8.20372256168333339912E1,
    1.59056225126211695515E1, -1.18331621121330003142E0,
];


/* Approximation for interval z = sqrt(-2 log y ) between 2 and 8
 * i.e., y between exp(-2) = .135 and exp(-32) = 1.27e-14.
 */
var P1 = [
    4.05544892305962419923E0,
    3.15251094599893866154E1,
    5.71628192246421288162E1,
    4.40805073893200834700E1,
    1.46849561928858024014E1,
    2.18663306850790267539E0, -1.40256079171354495875E-1, -3.50424626827848203418E-2, -8.57456785154685413611E-4,
];
var Q1 = [
    /*  1.00000000000000000000E0,*/
    1.57799883256466749731E1,
    4.53907635128879210584E1,
    4.13172038254672030440E1,
    1.50425385692907503408E1,
    2.50464946208309415979E0, -1.42182922854787788574E-1, -3.80806407691578277194E-2, -9.33259480895457427372E-4,
];

/* Approximation for interval z = sqrt(-2 log y ) between 8 and 64
 * i.e., y between exp(-32) = 1.27e-14 and exp(-2048) = 3.67e-890.
 */
var P2 = [
    3.23774891776946035970E0,
    6.91522889068984211695E0,
    3.93881025292474443415E0,
    1.33303460815807542389E0,
    2.01485389549179081538E-1,
    1.23716634817820021358E-2,
    3.01581553508235416007E-4,
    2.65806974686737550832E-6,
    6.23974539184983293730E-9,
];
var Q2 = [
    6.02427039364742014255E0,
    3.67983563856160859403E0,
    1.37702099489081330271E0,
    2.16236993594496635890E-1,
    1.34204006088543189037E-2,
    3.28014464682127739104E-4,
    2.89247864745380683936E-6,
    6.79019408009981274425E-9,
];

var exp = module.exports

exp.corrToP = function(correlation, numSamples) {

    var t = correlation / (Math.sqrt((1 - correlation * correlation) / (numSamples - 2)));
    if (t < 0) {
        return this.studentTCDF(numSamples, t)
    } else {
        return this.studentTCDF(numSamples, -t)
    }
}

exp.corrToZ = function(correlation, numSamples) {

    var p = this.corrToP(correlation, numSamples)
    if (p < Number.MIN_VALUE) {
	p = Number.MIN_VALUE
    }
    if (correlation < 0) {
        return this.normalInverse(p)
    } else {
        return -this.normalInverse(p)
    }
}

exp.zToP = function(z) {

    return this.complementaryError(-Math.abs(z)*SQRT2/2)
}

exp.pToZ = function(p) {

    return -this.normalInverse(p)
}

exp.normal = function(a) {

    var x, y, z;

    x = a * SQRTH;
    z = Math.abs(x);

    if (z < SQRTH) y = 0.5 + 0.5 * this.errorFunction(x);
    else {
        y = 0.5 * this.errorFunctionComplemented(z);
        if (x > 0) y = 1.0 - y;
    }

    return y;
}

exp.normalInverse = function(y0) {

    var x, y, z, y2, x0, x1;
    var code;

    var s2pi = Math.sqrt(2.0 * Math.PI);

    if (y0 <= 0.0) throw {
        name: 'ArgumentError',
        message: 'argument for normalInverse must be ]0...1['
    }
    if (y0 >= 1.0) throw {
        name: 'ArgumentError',
        message: 'argument for normalInverse must be ]0...1['
    }
    code = 1;
    y = y0;
    if (y > (1.0 - 0.13533528323661269189)) { /* 0.135... = exp(-2) */
        y = 1.0 - y;
        code = 0;
    }

    if (y > 0.13533528323661269189) {
        y = y - 0.5;
        y2 = y * y;
        x = y + y * (y2 * polynomial.polevl(y2, P0, 4) / polynomial.p1evl(y2, Q0, 8));
        x = x * s2pi;
        return (x);
    }

    x = Math.sqrt(-2.0 * Math.log(y));
    x0 = x - Math.log(x) / x;

    z = 1.0 / x;
    if (x < 8.0) /* y > exp(-32) = 1.2664165549e-14 */
        x1 = z * polynomial.polevl(z, P1, 8) / polynomial.p1evl(z, Q1, 8);
    else
        x1 = z * polynomial.polevl(z, P2, 8) / polynomial.p1evl(z, Q2, 8);
    x = x0 - x1;
    if (code != 0)
        x = -x;
    return (x);
}

exp.studentTCDF = function(k, t) {

    if (!k || k <= 0) throw {
        name: 'ArgumentError',
        message: 'degrees of freedom for studentTCDF must be positive'
    }
    if (t == 0) return (0.5);

    var cdf = 0.5 * gamma.incompleteBeta(0.5 * k, 0.5, k / (k + t * t));

    if (t >= 0) cdf = 1.0 - cdf;

    return cdf;
}

exp.errorFunction = function(x) {
    var y, z;
    var T = [
        9.60497373987051638749E0,
        9.00260197203842689217E1,
        2.23200534594684319226E3,
        7.00332514112805075473E3,
        5.55923013010394962768E4
    ];
    var U = [
        //1.00000000000000000000E0,
        3.35617141647503099647E1,
        5.21357949780152679795E2,
        4.59432382970980127987E3,
        2.26290000613890934246E4,
        4.92673942608635921086E4
    ];

    if (Math.abs(x) > 1.0) return (1.0 - this.errorFunctionComplemented(x));
    z = x * x;
    y = x * polynomial.polevl(z, T, 4) / polynomial.p1evl(z, U, 5);
    return y;
}

exp.errorFunctionComplemented = function(a) {
    var x, y, z, p, q;

    var P = [
        2.46196981473530512524E-10,
        5.64189564831068821977E-1,
        7.46321056442269912687E0,
        4.86371970985681366614E1,
        1.96520832956077098242E2,
        5.26445194995477358631E2,
        9.34528527171957607540E2,
        1.02755188689515710272E3,
        5.57535335369399327526E2
    ];
    var Q = [
        //1.0
        1.32281951154744992508E1,
        8.67072140885989742329E1,
        3.54937778887819891062E2,
        9.75708501743205489753E2,
        1.82390916687909736289E3,
        2.24633760818710981792E3,
        1.65666309194161350182E3,
        5.57535340817727675546E2
    ];

    var R = [
        5.64189583547755073984E-1,
        1.27536670759978104416E0,
        5.01905042251180477414E0,
        6.16021097993053585195E0,
        7.40974269950448939160E0,
        2.97886665372100240670E0
    ];
    var S = [
        //1.00000000000000000000E0, 
        2.26052863220117276590E0,
        9.39603524938001434673E0,
        1.20489539808096656605E1,
        1.70814450747565897222E1,
        9.60896809063285878198E0,
        3.36907645100081516050E0
    ];

    if (a < 0.0) x = -a;
    else x = a;

    if (x < 1.0) return 1.0 - this.errorFunction(a);

    z = -a * a;

    if (z < -MAXLOG) {
        if (a < 0) return (2.0);
        else return (0.0);
    }

    z = Math.exp(z);

    if (x < 8.0) {
        p = polynomial.polevl(x, P, 8);
        q = polynomial.p1evl(x, Q, 8);
    } else {
        p = polynomial.polevl(x, R, 5);
        q = polynomial.p1evl(x, S, 6);
    }

    y = (z * p) / q;

    if (a < 0) y = 2.0 - y;

    if (y == 0.0) {
        if (a < 0) return 2.0;
        else return (0.0);
    }

    return y;
}

////////// JSci

// Coefficients for approximation to  erf on [0,0.84375]
var e_efx=1.28379167095512586316e-01
//        var efx8=1.02703333676410069053e00;
var ePp=[
    1.28379167095512558561e-01,
        -3.25042107247001499370e-01,
        -2.84817495755985104766e-02,
        -5.77027029648944159157e-03,
        -2.37630166566501626084e-05]
var eQq=[
    3.97917223959155352819e-01,
    6.50222499887672944485e-02,
    5.08130628187576562776e-03,
    1.32494738004321644526e-04,
        -3.96022827877536812320e-06]
// Coefficients for approximation to  erf  in [0.84375,1.25]
var ePa=[
        -2.36211856075265944077e-03,
    4.14856118683748331666e-01,
        -3.72207876035701323847e-01,
    3.18346619901161753674e-01,
        -1.10894694282396677476e-01,
    3.54783043256182359371e-02,
        -2.16637559486879084300e-03]
var eQa=[
    1.06420880400844228286e-01,
    5.40397917702171048937e-01,
    7.18286544141962662868e-02,
    1.26171219808761642112e-01,
    1.36370839120290507362e-02,
    1.19844998467991074170e-02]
var e_erx=8.45062911510467529297e-01

        /**
        * Error function.
        * Based on C-code for the error function developed at Sun Microsystems.
        * @author Jaco van Kooten
        */
exp.error = function(x) {
    var P,Q,s,retval
    var abs_x = (x >= 0.0 ? x : -x)
    if ( abs_x < 0.84375 ) {                               // 0 < |x| < 0.84375
        if (abs_x < 3.7252902984619141e-9 )     // |x| < 2**-28
            retval = abs_x + abs_x*e_efx
        else {
            s = x*x
            P = ePp[0]+s*(ePp[1]+s*(ePp[2]+s*(ePp[3]+s*ePp[4])))
            Q = 1.0+s*(eQq[0]+s*(eQq[1]+s*(eQq[2]+s*(eQq[3]+s*eQq[4]))))
            retval = abs_x + abs_x*(P/Q)
        }
    } else if (abs_x < 1.25) {                             // 0.84375 < |x| < 1.25
        s = abs_x-1.0
        P = ePa[0]+s*(ePa[1]+s*(ePa[2]+s*(ePa[3]+s*(ePa[4]+s*(ePa[5]+s*ePa[6])))))
        Q = 1.0+s*(eQa[0]+s*(eQa[1]+s*(eQa[2]+s*(eQa[3]+s*(eQa[4]+s*eQa[5])))))
        retval = e_erx + P/Q
    } else if (abs_x >= 6.0)
        retval = 1.0
    else                                                    // 1.25 < |x| < 6.0
        retval = 1.0-exp.complementaryError(abs_x)
    return (x >= 0.0) ? retval : -retval
}

// Coefficients for approximation to  erfc in [1.25,1/.35]
var eRa=[
        -9.86494403484714822705e-03,
        -6.93858572707181764372e-01,
        -1.05586262253232909814e01,
        -6.23753324503260060396e01,
        -1.62396669462573470355e02,
        -1.84605092906711035994e02,
        -8.12874355063065934246e01,
        -9.81432934416914548592e00]
var eSa=[
    1.96512716674392571292e01,
    1.37657754143519042600e02,
    4.34565877475229228821e02,
    6.45387271733267880336e02,
    4.29008140027567833386e02,
    1.08635005541779435134e02,
    6.57024977031928170135e00,
        -6.04244152148580987438e-02]
// Coefficients for approximation to  erfc in [1/.35,28]
var eRb=[
        -9.86494292470009928597e-03,
        -7.99283237680523006574e-01,
        -1.77579549177547519889e01,
        -1.60636384855821916062e02,
        -6.37566443368389627722e02,
        -1.02509513161107724954e03,
        -4.83519191608651397019e02]
var eSb=[
    3.03380607434824582924e01,
    3.25792512996573918826e02,
    1.53672958608443695994e03,
    3.19985821950859553908e03,
    2.55305040643316442583e03,
    4.74528541206955367215e02,
        -2.24409524465858183362e01]

// WARNING only works with negative x, precision issues
exp.complementaryError = function(x) {
    var s,retval,R,S
    var abs_x =(x>=0.0 ? x : -x)
    if (abs_x < 1.25)
        retval = 1.0-exp.error(abs_x)
    else if (abs_x > 28.0)
        retval=0.0
    else {                                          // 1.25 < |x| < 28
        s = 1.0/(abs_x*abs_x)
        if (abs_x < 2.8571428) {                // ( |x| < 1/0.35 )
            R=eRa[0]+s*(eRa[1]+s*(eRa[2]+s*(eRa[3]+s*(eRa[4]+s*(eRa[5]+s*(eRa[6]+s*eRa[7]))))))
            S=1.0+s*(eSa[0]+s*(eSa[1]+s*(eSa[2]+s*(eSa[3]+s*(eSa[4]+s*(eSa[5]+s*(eSa[6]+s*eSa[7])))))))
        } else {                                        // ( |x| > 1/0.35 )
            R=eRb[0]+s*(eRb[1]+s*(eRb[2]+s*(eRb[3]+s*(eRb[4]+s*(eRb[5]+s*eRb[6])))))
            S=1.0+s*(eSb[0]+s*(eSb[1]+s*(eSb[2]+s*(eSb[3]+s*(eSb[4]+s*(eSb[5]+s*eSb[6]))))))
        }
        retval =  Math.exp(-x*x - 0.5625 + R/S)/abs_x
    }
    return retval
    // return (x >= 0.0) ? retval : 2.0-retval
}
