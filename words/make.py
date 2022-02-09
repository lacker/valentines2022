#!/usr/bin/env python

import json

anagrams = []
for line in open("anagrams.txt"):
    anagrams.append(line.strip().upper().split("_"))

with open("../src/anagrams.js", "w") as f:
    f.write("let data =\n")
    f.write(json.dumps(anagrams))
    f.write(";\n")
    f.write("export default data;")
