var exp = module.exports

exp.colors = {
    gnyellow: '#39aaff', // rgb(255, 225, 0)
    gnred: '#ff3c00', // rgb(255, 60, 0)
    gngreen: '#a0d200',
    gnblue: '#00a0d2',
    gnpurple: '#7a18ec',
    gnorange: '#ffae00',
    gnpink: '#ff52d4',
    gndarkgray: '#4d4d4d',
    gngray: '#999999',
    gnlightgray: '#dcdcdc',
    gnlightergray: '#ededed',
    gnverylightgray: '#f8f8f8',
    gnblack: '#000000',
    gnwhite: '#ffffff',
    gnbluelightgray: '#6ebed7',
    gnredlightgray: '#ee8c6e',
    nodeDefault: '#4d4d4d',
    linkDefault: '#4d4d4d',
    default: '#000000',
    textdefault: '#000000',
    selected: '#ff3c00'
}

exp.group2color = [
    exp.colors.gngreen,
    exp.colors.gnpurple,
    exp.colors.gnblue,
    exp.colors.gnred,
    exp.colors.gnorange,
    exp.colors.gnpink,
    exp.colors.gndarkgray
]    

exp.cluster2color = [
    exp.colors.gnblue,
    exp.colors.gngreen,
    exp.colors.gnpurple,
    exp.colors.gnorange,
    exp.colors.gnpink
]

exp.biotype2color = {
    protein_coding: exp.colors.gndarkgray,
    pseudogene: exp.colors.gnpurple,
    processed_transcript: exp.colors.gngreen,
    antisense: exp.colors.gngreen,
    lincRNA: exp.colors.gngreen,
    polymorphic_pseudogene: exp.colors.gnpurple,
    IG_V_gene: exp.colors.gndarkgray,
    sense_intronic: exp.colors.gngreen,
    TR_V_gene: exp.colors.gngreen,
    misc_RNA: exp.colors.gnpink,
    snRNA: exp.colors.gnpink,
    miRNA: exp.colors.gnpink,
    IG_V_pseudogene: exp.colors.gnpurple,
    snoRNA: exp.colors.gnpink,
    rRNA: exp.colors.gnpink,
    sense_overlapping: exp.colors.gngreen,
    Mt_tRNA: exp.colors.gnpink,
    Mt_rRNA: exp.colors.gnpink,
    IG_C_gene: exp.colors.gndarkgray,
    IG_J_gene: exp.colors.gndarkgray,
    TR_J_gene: exp.colors.gndarkgray,
    TR_C_gene: exp.colors.gndarkgray,
    TR_V_pseudogene: exp.colors.gnpurple,
    TR_J_pseudogene: exp.colors.gnpurple,
    IG_D_gene: exp.colors.gndarkgray,
    IG_C_pseudogene: exp.colors.gnpurple,
    TR_D_gene: exp.colors.gndarkgray,
    IG_J_pseudogene: exp.colors.gnpurple,
    non_coding: exp.colors.gngreen,
    '3prime_overlapping_ncrna': exp.colors.gngreen
}

exp.chr2color = {
    1: exp.colors.gndarkgray,
    2: exp.colors.gndarkgray,
    3: exp.colors.gndarkgray,
    4: exp.colors.gndarkgray,
    5: exp.colors.gndarkgray,
    6: exp.colors.gndarkgray,
    7: exp.colors.gndarkgray,
    8: exp.colors.gndarkgray,
    9: exp.colors.gndarkgray,
    10: exp.colors.gndarkgray,
    11: exp.colors.gndarkgray,
    12: exp.colors.gndarkgray,
    13: exp.colors.gndarkgray,
    14: exp.colors.gndarkgray,
    15: exp.colors.gndarkgray,
    16: exp.colors.gndarkgray,
    17: exp.colors.gndarkgray,
    18: exp.colors.gndarkgray,
    19: exp.colors.gndarkgray,
    20: exp.colors.gndarkgray,
    21: exp.colors.gndarkgray,
    22: exp.colors.gndarkgray,
    'X': exp.colors.gnblue,
    'x': exp.colors.gnblue,
    23: exp.colors.gnblue,
    'Y': exp.colors.gngreen,
    'y': exp.colors.gngreen,
    24: exp.colors.gngreen
}

// http://tools.medialab.sciences-po.fr/iwanthue/
exp.chr2color1 = {
    1: '#B356A2',
    2: '#66D748',
    3: '#D98C2F',
    4: '#75D1CC',
    5: '#3D2F30',
    6: '#648EC1',
    7: '#5D8A3A',
    8: '#D44833',
    9: '#CF9373',
    10: '#587974',
    11: '#786ED0',
    12: '#C3CCA4',
    13: '#802E37',
    14: '#7AD68D',
    15: '#503866',
    16: '#C4DC46',
    17: '#D64279',
    18: '#C07D93',
    19: '#CE52D6',
    20: '#414F27',
    21: '#855326',
    22: '#C9B8D8',
    'X': '#C7B64',
    'x': '#C7B64',
    'Y': '#000000',
    'y': '#000000'
}
