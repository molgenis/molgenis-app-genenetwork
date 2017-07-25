module.exports.api = {

    maxNumEntries: 100, // how many entries to return at max (genes/pathways), overrides other limits
    prioritizationMaxNumEntries: 100, //56439 // max for /prioritization
    maxNumGenesCofunction: 1000, // calculate cofunctionality for how many given genes at max

    numPathwaysLimit: 20, // how many pathways to give by default when no specific db given
    predictedNumGenesToSend: 20,

    numGenesLimit: 20,
    numGenesMax: 1000,
    defaultCoregulationZScoreThreshold: 5,
    defaultCoregulationCorrelationThreshold: 0.3,
    defaultCofunctionCorrelationThreshold: 0.3,
    includeGeneZScoresInCoregulationNetwork: false, // Z-scores from a Wilcoxon test: for each gene: test correlations of network genes vs. correlations of the rest of (protein-coding) genes

    // TODO is this actually used
    pathwayAnalysisTestType: 'wilcoxonr', // wilcoxonr : data are ranks, t : welch's t-test
}
