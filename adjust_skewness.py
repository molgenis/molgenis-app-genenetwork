import os

gene_order = []
with open('/srv/metabrainnetwork//data/files/new/ENSGToGeneNameHGNCBiotypeChromosomeStartStopStrandAndDescriptionV98.txt') as input_file:
    for line in input_file:
        line = line.strip().split('\t')
        gene_order.append(line[0])

gene_skewness = {}
with open('/srv/metabrainnetwork_v2.0/data/files/new/skewnessSummary.txt') as input_file:
    header = input_file.readline()
    for line in input_file:
        gene_skewness[line.split('\t')[0]] = line


with open('/mnt/d/metabrainnetwork/data/files/new/skewnessSummary.txt','w') as out:
    out.write(header)
    for gene in gene_order:
        if gene in gene_skewness:
            out.write(gene_skewness[gene])
        else:
            out.write(gene+'\t-1\t-1\t-1\n')

