#!/usr/bin/env bash
###
### Genes
###
set -e
set -u
# presumably this is not necesarry because it misses an input file
node populateGenesToGeneDB.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/files/Version1_18_07_2019/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV83FilteredNonChromosomesRemovedDuplicateTranscriptsRemoved.txt \
    /data/metabrainnetwork/files/Version1_18_07_2019/GenePredictScores.txt

###
### HPO
###
node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	HPO \
	/data/metabrainnetwork/files/Version1_18_07_2019/HPO/MetaBrain.hpo_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/HPO/MetaBrain.hpo_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/HPO/MetaBrain.hpo_predictions.AUC_gnInputFormat.txt \
    /data/metabrainnetwork/files/Version1_18_07_2019/HPO/ALL_SOURCES_ALL_FREQUENCIES_phenotype_to_genes_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	HPO \
	/data/metabrainnetwork/files/Version1_18_07_2019/HPO/MetaBrain.hpo_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/HPO/MetaBrain.hpo_predictions.bonSigOnly_termNames_tranposed.txt

###
### Reactome
###

node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	REACTOME \
	/data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.AUC.bonSigTerms_gnInputFormat.txt \
    /data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.AUC_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/reactome/Ensembl2Reactome_All_Levels_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	REACTOME \
	/data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.bonSigOnly_termNames_tranposed.txt

###
### GO
###

## GO_F
node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	GO_F \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/MetaBrain.go_F_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/MetaBrain.go_F_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/MetaBrain.go_F_predictions.AUC_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/goa_human.gaf_F_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	GO_F \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/MetaBrain.go_F_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_F/MetaBrain.go_F_predictions.bonSigOnly_termNames_tranposed.txt

## GO_P
node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	GO_P \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/MetaBrain.go_P_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/MetaBrain.go_P_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/MetaBrain.go_P_predictions.AUC_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/goa_human.gaf_P_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	GO_P \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/MetaBrain.go_P_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_P/MetaBrain.go_P_predictions.bonSigOnly_termNames_tranposed.txt

## GO_C
node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	GO_C \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/MetaBrain.go_C_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/MetaBrain.go_C_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/MetaBrain.go_C_predictions.AUC_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/goa_human.gaf_C_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	GO_C \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/MetaBrain.go_C_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/GO/GO_C/MetaBrain.go_C_predictions.bonSigOnly_termNames_tranposed.txt


###
### KEGG
###

node populateGenesetDBTXT.js \
	/data/metabrainnetwork/level/new/dbgenes_uint16be \
	/data/metabrainnetwork/level/new/dbexternal_uint16be \
	KEGG \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.bonSigOnly_termNames_tranposed.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.AUC_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/c2.cp.kegg.v6.1.entrez.gmt_matrix_filteredOnEigenVectorGenes_gnInputFormat.txt

node rankPathwaysFromDataFileTXT.js \
	/data/metabrainnetwork/level/new/dbexternalranks \
	KEGG \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.AUC.bonSigTerms_gnInputFormat.txt \
	/data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.bonSigOnly_termNames_tranposed.txt


##
## Coregulation
##
#node populateCoregulationDBTXT.js \
#    /data/metabrainnetwork/files/Version1_18_07_2019/Gene_Coregulation/MetaBrain.eigenvectors.cronbach_0.9.correlation.txt.gz \
#	/data/metabrainnetwork/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm 526
