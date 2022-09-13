set -e
set -u
go_C_n=575
go_F_n=225
go_P_n=150
kegg_n=500
reactome_n=700
hpo_n=1000


outdir=/mnt/docker/metabrainnetwork/data/
datadir=/mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/11_ImportToWebsite/
datadirB=/mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/
### 2020-03-23-goa_human_C ###
# mkdir -p /mnt/d/metabrainnetwork/data/

 python3 data_scripts/fixGODescriptions.py \
	$datadir/2022-09-12-goToDesc.txt.gz \
	$datadir/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
	$datadir/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz

 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b GO_C \
   -t $datadir/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz \
   -i $datadir/$go_C_n/2020-03-23-goa_human_C.matrix_gnInputFormat.txt.gz \
   -z $datadir/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$go_C_n/2020-03-23-goa_human_C.${go_C_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

# ### 2020-03-23-goa_human_F ###
 python3 data_scripts/fixGODescriptions.py \
	$datadir/2022-09-12-goToDesc.txt.gz \
	$datadir/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
	$datadir/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz

 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b GO_F \
   -t $datadir/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz \
   -i $datadir/$go_F_n/2020-03-23-goa_human_F.matrix_gnInputFormat.txt.gz \
   -z $datadir/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$go_F_n/2020-03-23-goa_human_F.${go_F_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz
  
# ### 2020-03-23-goa_human_P ###
 python3 data_scripts/fixGODescriptions.py \
	$datadir/2022-09-12-goToDesc.txt.gz \
	$datadir/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
	$datadir/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz

 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b GO_P \
   -t $datadir/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat-fix.txt.gz \
   -i $datadir/$go_P_n/2020-03-23-goa_human_P.matrix_gnInputFormat.txt.gz \
   -z $datadir/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$go_P_n/2020-03-23-goa_human_P.${go_P_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

# exit 0

# ### 2020-03-28-c2.cp.kegg.v7.0 ###
 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b KEGG \
   -t $datadir/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i $datadir/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.matrix_gnInputFormat.txt.gz \
   -z $datadir/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$kegg_n/2020-03-28-c2.cp.kegg.v7.0.${kegg_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b REACTOME \
   -t $datadir/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i $datadir/$reactome_n/2020-03-28-Ensembl2Reactome_All_Levels.matrix_gnInputFormat.txt.gz \
   -z $datadir/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$reactome_n//2020-03-28-Ensembl2Reactome_All_Levels.${reactome_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz

### 2020-03-28-HPO-phenotype-to-genes ###
 bash data_scripts/populate_geneset.sh \
   -d $outdir \
   -b HPO \
   -t $datadir/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonSigTerms_gnInputFormat.txt.gz \
   -i $datadir/$hpo_n/2020-03-28-HPO-phenotype-to-genes.matrix_gnInputFormat.txt.gz \
   -z $datadir/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.bonSigOnly_termNames_tranposed.txt.gz \
   -a $datadir/$hpo_n/2020-03-28-HPO-phenotype-to-genes.${hpo_n}_eigenvectors.predictions.AUC.bonferonni_gnInputFormat.txt.gz


bash data_scripts/populate_geneDB_and_coregulation.sh \
  -d $outdir \
  -g $datadirB/2020-03-01.all-cohorts-kallisto-genes.txt.gz \
  -e $outdir/files/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98.filteredOnMetabrainGenes.txt.gz \
  -c $datadirB/9_eigenvector_correlation_matrix/MetaBrain.1000_eigenvectors.columnsRowsCenterScaled.correlation.txt.gz \
  -n 1000
  
#  -e /mnt/y/metabrainnetwork/2020-02-28-MetaBrainNetwork/output/2020-03-01.all-cohorts-kallisto-genes-tohgnc.txt.gz \
