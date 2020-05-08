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
# correlation matrix over eigenvectors, filtered on only relevant number of eigenvectors (e.g. for genenetwork.nl 1588)
eigenvector_cormatrix=
# number of eigenvectors used
n_eigenvectors=
main(){
  parse_commandline "$@"
  mkdir -p ${database_base_dir}
	populate_genes_to_geneDB ${database_base_dir} ${ensg_hncg_mapping} ${gene_list_file}
    populate_coregulation_DBTXT ${eigenvector_cormatrix} ${database_base_dir} ${n_eigenvectors}
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
	echo "usage: $programname -d database_dir -g gene_list_file -e ensg_hncg_mapping"
	echo "                    -c eigenvector_cormatrix -n n_eigenvectors"
	echo "  -d      database base dir, e.g. /data/genenetwork/"
	echo "  -g      file with newline separated list of genes that should be included"
	echo "  -e      file with ensembl -> hgnc mapping"
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
