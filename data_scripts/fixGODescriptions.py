import gzip
import sys

if len(sys.argv) < 4:
	print("refernce-go-descriptions.txt.gz input.txt.gz output.txt.gz")
	sys.exit(0)

ref = sys.argv[1]
inp = sys.argv[2]
out = sys.argv[3]

gomap = {}
fh = gzip.open(ref,'rt')
for line in fh:
	elems = line.strip().split("\t")
	if len(elems) > 1:
		go = elems[0]
		desc = elems[1]
		gomap[go] = desc
fh.close()

fh  = gzip.open(inp,'rt')
fho = gzip.open(out,'wt')
for line in fh:
	elems = line.strip().split("\t")
	go = elems[0]
	desc = gomap.get(go)
	if desc is not None:
		elems[1] = desc
	else:
		elems[1] = go+"-NoDescription"
		print("ERROR: no description for "+go)
	fho.write("\t".join(elems)+"\n")
fho.close()
fh.close()
