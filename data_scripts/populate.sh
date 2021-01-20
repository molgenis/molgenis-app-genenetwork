#!/usr/bin/env bash
###
### Genes
###

node populateGenesToGeneDB.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/new/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98FilteredNonChromosomesRemovedDuplicateTranscriptsRemovedFilteredActualGenes.txt.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/new/skewnessSummary.txt

###
### HPO
###

node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	HPO \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/MetaBrain.hpo_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/phenotype_to_genes_V1268_OMIMandORPHA_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	HPO \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/hpo/MetaBrain.hpo_predictions.bonSigOnly_termNames_tranposed_ro.txt
# elasticsearch autocomplete for HPO terms
#node data_scripts/parseHpoOboToElastic.js

###
### Reactome
###

node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	REACTOME \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/MetaBrain.reactome_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/Ensembl2Reactome_All_Levels_2020_07_18_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	REACTOME \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/reactome/MetaBrain.reactome_predictions.bonSigOnly_termNames_tranposed_ro.txt

###
### GO
###

## GO_F
node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	GO_F \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/MetaBrain.go_F_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/goa_human_2020_06_01.gaf_F_2020_06_01_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	GO_F \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_f/MetaBrain.go_F_predictions.bonSigOnly_termNames_tranposed_ro.txt

## GO_P
node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	GO_P \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/MetaBrain.go_P_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/goa_human_2020_06_01.gaf_P_2020_06_01_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	GO_P \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_p/MetaBrain.go_P_predictions.bonSigOnly_termNames_tranposed_ro.txt

## GO_C
node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	GO_C \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/MetaBrain.go_C_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/goa_human_2020_06_01.gaf_C_2020_06_01_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	GO_C \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/go_c/MetaBrain.go_C_predictions.bonSigOnly_termNames_tranposed_ro.txt


###
### KEGG
###

node populateGenesetDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbgenes_uint16be \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternal_uint16be \
	KEGG \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/MetaBrain.kegg_predictions.bonSigOnly_termNames_tranposed_ro.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/predictions_auc_bonf_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/c2.cp.kegg.v7.1.entrez.gmt_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbexternalranks \
	KEGG \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/predictions_auc_fixed_bonf.bonSigTerms_gnInputFormat.txt \
	/Volumes/RoyExtSSD1T/kidneynetwork/files/kegg/MetaBrain.kegg_predictions.bonSigOnly_termNames_tranposed_ro.txt


##
## Coregulation
##
node populateCoregulationDBTXT.js \
	/Volumes/RoyExtSSD1T/kidneynetwork/coregulationKN.txt.gz \
	/Volumes/RoyExtSSD1T/kidneynetwork/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm 335
