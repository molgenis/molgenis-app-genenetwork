set -e
set -u
go_C_n=575
go_F_n=225
go_P_n=150
kegg_n=500
reactome_n=700
hpo_n=1000
### 2020-03-23-goa_human_C ###
mkdir -p /mnt/d/metabrainnetwork/data/
 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b GO_C \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz
# ### 2020-03-23-goa_human_F ###
 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b GO_F \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz
  
# ### 2020-03-23-goa_human_P ###
 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b GO_P \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz


# ### 2020-03-28-c2.cp.kegg.v7.0 ###
 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b KEGG \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b REACTOME \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

### 2020-03-28-HPO-phenotype-to-genes ###
 bash data_scripts/populate_geneset.sh \
   -d /mnt/d/metabrainnetwork/data/ \
   -b HPO \
   -t /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.matrix_gnInputFormat.txt.gz \
   -z /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz


bash data_scripts/populate_geneDB_and_coregulation.sh \
  -d /mnt/d/metabrainnetwork/data/ \
  -g /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/2020-03-01.all-cohorts-kallisto-genes.txt.gz \
  -e /mnt/d/metabrainnetwork/data/files/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98.filteredOnMetabrainGenes.txt.gz \
  -c /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/9_eigenvector_correlation_matrix/MetaBrain.1000_eigenvectors.columnsRowsCenterScaled.correlation.txt.gz \
  -n 1000
  
#  -e /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/2020-03-01.all-cohorts-kallisto-genes-tohgnc.txt.gz \
