set -e
set -u

go_C_n=575
go_F_n=225
go_P_n=150
kegg_n=500
reactome_n=700
hpo_n=1000
### 2020-03-23-goa_human_C ###
#mkdir -p /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/
#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b GO_C \
#  -t 11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt
### 2020-03-23-goa_human_F ###
#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b GO_F \
#  -t 11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt
### 2020-03-23-goa_human_P ###
#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b GO_P \
#  -t 11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt


### 2020-03-28-c2.cp.kegg.v7.0 ###
#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b KEGG \
#  -t 11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt

#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b REACTOME \
#  -t 11_ImportToWebsite/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt

### 2020-03-28-HPO-phenotype-to-genes ###
#bash data_scripts/populate_geneset.sh \
#  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
#  -b HPO \
#  -t 11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt \
#  -i 11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.matrix_gnInputFormat.txt \
#  -z 11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt \
#  -a 11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt


bash data_scripts/populate_geneDB_and_coregulation.sh \
  -d /Users/NPK/UMCG/projects/biogen/cohorts/joined_analysis/2019-11-06-freeze2dot1/2020-02-28-MetaBrainNetwork/molgenis-app-genenetwork/metabrainnetwork/data/ \
  -g 11_ImportToWebsite/2020-05-06-list_of_genes.txt \
  -e 11_ImportToWebsite/ensembl_to_hgnc_biotype_etc.v98.filteredOnMetabrainGenes.txt \
  -c 11_ImportToWebsite/MetaBrain.1000_eigenvectors.columnsRowsCenterScaled.correlation.txt.gz \
  -n 1000
