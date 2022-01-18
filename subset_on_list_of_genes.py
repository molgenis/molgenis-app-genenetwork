

with open('list_of_genes.txt') as input_file:
    gene_list = input_file.read().split('\n')

gene_list = [x for x in gene_list if len(x.strip()) > 0]

gene_info = {}
with open('/Users/NPK//Downloads/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98.txt') as input_file:
    for line in input_file:
        gene_info[line.split('\t')[0]] = line


with open('/mnt/d/metabrainnetwork/data/files/new/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98.txt','w') as out:
    for gene in gene_list:
        out.write(gene_info[gene])
