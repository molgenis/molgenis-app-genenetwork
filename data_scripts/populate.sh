#!/usr/bin/env bash

set -e
set -u
thisdir=$(dirname "$0")

# initialize variables that will be filled from command line
# database base dir, e.g. "/data/genenetwork/"
database_base_dir=
# file with newline separated list of genes that should be included
gene_list_file=
# file with ensembl -> hgnc mapping
ensg_hncg_mapping=
# database name
dbname=
# file with terms, website, description
term_file=
# z-score matrix with prediction z-scores
zscore_matrix=
# table with p-values and AUC
auc_table=
# identity matrix file with 1 if gene in geneset, 0 if not
identity_matrix=
# correlation matrix over eigenvectors, filtered on only relevant number of eigenvectors (e.g. for genenetwork.nl 1588)
eigenvector_cormatrix=
# number of eigenvectors used
n_eigenvectors=
main(){
  parse_commandline "$@"
  mkdir -p ${database_base_dir}
#	populate_genes_to_geneDB ${database_base_dir} ${gene_list_file} ${ensg_hncg_mapping}
  populate_geneset_dbtxt ${database_base_dir} ${dbname} ${term_file} ${zscore_matrix} ${auc_table} ${identity_matrix}
  populate_coregulation_DBTXT ${eigenvector_cormatrix} ${database_base_dir} ${n_eigenvectors}
  if [ "$4" = "HPO" ];
  then
    mkdir -p ${database_base_dir}/files/new/
    cd ${database_base_dir}/files/new/
    if [ ! -f hp.obo ];
    then
        wget https://raw.githubusercontent.com/obophenotype/human-phenotype-ontology/master/hp.obo
    fi
    cd -
	node data_scripts/parseHpoOboToElastic.js
  fi
}

populate_genes_to_geneDB(){
	# $1 = database base dir, e.g. "/data/genenetwork/"
	# $2 = file with newline separated list of genes that should be included
	# $3 = Table with at least 3 columns. first column ensembl gene ID,
	#																			second column doesn't matter what it is, can be empty,
	#																			third column HGNC name
  mkdir -p $1/level/new/dbgenes_uint16be
  node $thisdir/populateGenesToGeneDB.js \
	  $1/level/new/dbgenes_uint16be \
	  $2 \
      $3
}

populate_geneset_dbtxt(){
	# $1 = database base dir, e.g. "/data/genenetwork/"
	# $2 = database name, e.g. "GO_P"
	# $3 = Table with 3 columns. First column term ID (e.g. HP:0000002),
	#														 second column website link for the term (e.g. http://www.human-phenotype-ontology.org/hpoweb/showterm?id=HP:0000002)
	#														 third column description (e.g. Abnormality of body height)
	# $4 = Matrix of z-score predictions with on rows the IDs (e.g. GO IDs), and columns the genes
	# $5 = Table with 4 columns. First column term ID (e.g. HP:0000002), second column p-value,
	#														 third column AUC, fourth column number of genes
	# $6 = Identity matrix with 1 if a gene is in a geneset, 0 if it is not in the geneset, with on the columns IDs (e.g. GO IDs)
  mkdir -p $1/level/new/dbexternal_uint16be
  node $thisdir/populateGenesetDBTXT.js \
	    $1/level/new/dbgenes_uint16be \
	    $1/level/new/dbexternal_uint16be \
	    $2 \
	    $3 \
	    $4 \
	    $5 \
	    $6

}

populate_geneset_dbtxt(){
	# $1 = database base dir, e.g. "/data/genenetwork/"
	# $2 = database name, e.g. "GO_P"
	# $3 = Table with 3 columns. First column term ID (e.g. HP:0000002),
	#														 second column website link for the term (e.g. http://www.human-phenotype-ontology.org/hpoweb/showterm?id=HP:0000002)
	#														 third column description (e.g. Abnormality of body height)
	# $4 = Matrix of z-score predictions with on rows the IDs (e.g. GO IDs), and columns the genes
    mkdir -p $1/level/new/dbexternalranks
	node $thisdir/rankPathwaysFromDataFileTXT.js \
		$1/level/new/dbexternalranks \
		$2 \
		$3 \
		$4
}

populate_coregulation_DBTXT(){
	# $1 = correlation matrix over eigenvectors, filtered on only relevant number of eigenvectors (e.g. for genenetwork.nl 1588)
	# $2 = database base dir, e.g. "/data/genenetwork/"
	# $3 = number of eigenvectors selected (e.g. for genenetwork.nl = 1588)
    mkdir -p $2/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm
	node $thisdir/populateCoregulationDBTXT.js \
		$1 \
		$2/level/new/dbpccorrelationzscores_uint16be_genescompsstdnorm \
		$3
}


usage(){
	# print the usage of the programme
	programname=$0
	echo "usage: $programname -d database_dir -g gene_list_file -e ensg_hncg_mapping -b dbname"
	echo "                    -t term_file -i identity_matrix -z zscore_matrix -a auc_table"
	echo "                    -c eigenvector_cormatrix -n n_eigenvectors"
	echo "  -d      database base dir, e.g. /data/genenetwork/"
	echo "  -g      file with newline separated list of genes that should be included"
	echo "  -e      file with ensembl -> hgnc mapping"
	echo "  -b      database name"
	echo "  -t      file with terms, website, description"
	echo "  -i      identity matrix file with 1 if gene in geneset, 0 if not"
	echo "  -z      z-score matrix with prediction z-scores"
	echo "  -a      table with p-values and AUC"
	echo "  -c      correlation matrix over eigenvectors, filtered on only relevant number of eigenvectors (e.g. for genenetwork.nl 1588)"
	echo "  -n      number of eigenvectors used"
	echo "  -h      display help"
	exit 1
}

parse_commandline(){
	# Check to see if at least one argument is given
	if [ $# -eq 0 ]
	then
		echo "ERROR: No arguments supplied"
		usage
		exit 1;
	fi

	while [[ $# -ge 1 ]]; do
		case $1 in
			-d | --database_dir )     				shift
																				database_base_dir="$1"
																				;;
			-g | --gene_list_file )     			shift
																				gene_list_file="$1"
																				;;
			-e | --ensg_hncg_mapping )     		shift
																				ensg_hncg_mapping="$1"
																				;;
			-b | --dbname )     							shift
																				dbname="$1"
																				;;
			-t | --term_file )     						shift
																				term_file="$1"
																				;;
			-i | --identity_matrix )  				shift
																				identity_matrix="$1"
																				;;
			-z | --zscore_matrix )    				shift
																				zscore_matrix="$1"
																				;;
			-a | --auc_table )     						shift
																			 	auc_table="$1"
																				;;
			-c | --eigenvector_cormatrix )    shift
																				eigenvector_cormatrix="$1"
																				;;
			-n | --n_eigenvectors )     			shift
																				n_eigenvectors="$1"
																				;;

		  -h | --help )             				usage
																				exit
																				;;
		  * )                       				echo "ERROR: Undexpected argument: $1"
																				usage
																				exit 1
		esac
		shift
	done

	# if -z tests if variable is empty. Make sure the relevant variables are set
  if [ -z "$database_base_dir" ];
  then
      echo "ERROR: -d/--database_dir not set!"
      usage
			exit 1;
  fi
	if [ -z "$gene_list_file" ];
  then
      echo "ERROR: -g/--gene_list_file not set!"
      usage
			exit 1;
  fi
	if [ -z "$ensg_hncg_mapping" ];
  then
      echo "ERROR: -e/--ensg_hncg_mapping not set!"
      usage
			exit 1;
  fi
	if [ -z "$dbname" ];
  then
      echo "ERROR: -b/--dbname not set!"
      usage
			exit 1;
  fi
	if [ -z "$term_file" ];
  then
      echo "ERROR: -t/--term_file not set!"
      usage
			exit 1;
  fi
	if [ -z "$identity_matrix" ];
  then
      echo "ERROR: -i/--identity_matrix not set!"
      usage
			exit 1;
  fi
	if [ -z "$zscore_matrix" ];
  then
      echo "ERROR: -z/--zscore_matrix not set!"
      usage
			exit 1;
  fi
	if [ -z "$auc_table" ];
  then
      echo "ERROR: -a/--auc_table not set!"
      usage
			exit 1;
  fi
	if [ -z "$eigenvector_cormatrix" ];
  then
      echo "ERROR: -c/--eigenvector_cormatrix not set!"
      usage
			exit 1;
  fi
	if [ -z "$n_eigenvectors" ];
  then
      echo "ERROR: -n/--n_eigenvectors not set!"
      usage
			exit 1;
  fi
}

# $@ as the command line arguments, which are sent to main
main "$@";
