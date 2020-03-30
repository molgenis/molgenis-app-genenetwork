#!/usr/bin/env bash
###
### Genes
###

node populateGenesToGeneDB.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/files/Version2_01_04_2018/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV83FilteredNonChromosomesRemovedDuplicateTranscriptsRemoved.txt

###
### HPO
###

node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    HPO \
    /data/genenetwork/files/Version2_01_04_2018/HPO/hpoTerms_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/HPO/hpo_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/HPO/hpo_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/HPO/ALL_SOURCES_ALL_FREQUENCIES_phenotype_to_genes_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    HPO \
    /data/genenetwork/files/Version2_01_04_2018/HPO/hpoTerms_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/HPO/hpo_predictions_bonSigOnly_termNames_tranposed.txt 
# elasticsearch autocomplete for HPO terms
node data_scripts/parseHpoOboToElastic.js

###
### Reactome
###

node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    REACTOME \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/reactomePathwaysHuman_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/reactome_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/reactome_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/Ensembl2Reactome_All_Levels_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    REACTOME \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/reactomePathwaysHuman_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/Reactome/reactome_predictions_bonSigOnly_termNames_tranposed.txt 

###
### GO
###

## GO_F
node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    GO_F \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/go_F_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/go_F_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/go_F_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/goa_human.gaf_F_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    GO_F \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/go_F_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_F/go_F_predictions_bonSigOnly_termNames_tranposed.txt 

## GO_P
node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    GO_P \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/go_P_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/go_P_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/go_P_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/goa_human.gaf_P_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    GO_P \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/go_P_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_P/go_P_predictions_bonSigOnly_termNames_tranposed.txt 

## GO_C
node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    GO_C \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/go_C_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/go_C_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/go_C_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/goa_human.gaf_C_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    GO_C \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/go_C_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/GO/GO_C/go_C_predictions_bonSigOnly_termNames_tranposed.txt 


###
### KEGG
###

node populateGenesetDBTXT.js \
    /data/genenetwork/level/new/dbgenes_uint16be \
    /data/genenetwork/level/new/dbexternal_uint16be \
    KEGG \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/kegg_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/kegg_predictions_bonSigOnly_termNames_tranposed.txt \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/kegg_predictions_auc_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/c2.cp.kegg.v6.1.entrez.gmt_matrix_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
    /data/genenetwork/level/new/dbexternalranks \
    KEGG \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/kegg_PathwaysClean_bonSigTerms_gnInputFormat.txt \
    /data/genenetwork/files/Version2_01_04_2018/KEGG/kegg_predictions_bonSigOnly_termNames_tranposed.txt 


##
## Coregulation
##
node populateCoregulationDBTXT.js \
    /data/genenetwork/files/Version2_01_04_2018/Gene_Coregulation/eigenvectors_1588_stdNormRows_stdNormCols_correlation.txt.gz \
    /data/genenetwork/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm 1588

