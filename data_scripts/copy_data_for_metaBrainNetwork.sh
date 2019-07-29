datadir=/data/metabrainnetwork/

# nothing needs to be copied to dbgenes_uint16be, but the directory must excist when populateMetaBrainNetwork.sh is run
mkdir -p $datadir/level/new/dbgenes_uint16be/

mkdir -p $datadir/files/Version1_18_07_2019/Gene_Coregulation/

# co-regulation network
if [ ! -f $datadir/files/Version1_18_07_2019/Gene_Coregulation/MetaBrain.deseqNorm.covarCorrected.correlation.filteredOnPathwayGenes.txt.gz ];
then
    rsync -vP \
        umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/6_correlation_matrix/MetaBrain.deseqNorm.covarCorrected.correlation.filteredOnPathwayGenes.txt.gz \
        $datadir/files/Version1_18_07_2019/Gene_Coregulation/
else
    echo "$datadir/files/Version1_18_07_2019/Gene_Coregulation/MetaBrain.deseqNorm.covarCorrected.correlation.filteredOnPathwayGenes.txt.gz already exists, skip"
fi

mkdir -p $datadir/files/Version1_18_07_2019/HPO/
echo "copy HPO"
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/hpo/*" \
    $datadir/files/Version1_18_07_2019/HPO/
echo "DONE"


mkdir -p /data/genenetwork/files/Version1_18_07_2019/reactome/
echo "copy reactome"
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/reactome/*" \
    $datadir/files/Version1_18_07_2019/reactome/
gunzip /data/metabrainnetwork/files/Version1_18_07_2019/reactome/MetaBrain.reactome_predictions.bonSigOnly_termNames_tranposed.txt.gz
echo "Done"

mkdir -p $datadir/files/Version1_18_07_2019/GO/
mkdir -p $datadir/files/Version1_18_07_2019/GO/go_F/
echo "copy go_F"
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/go_F/*" \
    $datadir/files/Version1_18_07_2019/GO/go_F/
echo "done"
mkdir -p $datadir/files/Version1_18_07_2019/GO/go_P/
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/go_P/*" \
    $datadir/files/Version1_18_07_2019/GO/go_P/

mkdir -p $datadir/files/Version1_18_07_2019/GO/go_C/
echo "copy go_C"
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/go_C/*" \
    $datadir/files/Version1_18_07_2019/GO/go_C/
echo "done"

mkdir -p $datadir/files/Version1_18_07_2019/KEGG/
echo "copy kegg"
rsync -vP \
    "umcg-ndeklein@foyer+calculon:/groups/umcg-biogen/tmp04/umcg-ndeklein/GeneNetwork/output/10_GeneNetwork_WebsiteMatrixCreator/ImportToWebsite/kegg/*" \
    $datadir/files/Version1_18_07_2019/KEGG/
gunzip /data/metabrainnetwork/files/Version1_18_07_2019/KEGG/MetaBrain.kegg_predictions.bonSigOnly_termNames_tranposed.txt.gz
echo "done"




rsync -vP foyer+molgenis27:/data/genenetwork/files/new/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV83FilteredNonChromosomesRemovedDuplicateTranscriptsRemoved.txt /data/metabrainnetwork/files/new/
rsync -vP foyer+molgenis27:/data/genenetwork/files/genesToTranscripts.txt /data/metabrainnetwork/files/
rsync -vP foyer+molgenis27:/data/genenetwork/files/new/skewnessSummary.txt /data/metabrainnetwork/files/new
rsync -vP foyer+molgenis27:/data/genenetwork/files/new/mim2gene.txt /data/metabrainnetwork/files/new
