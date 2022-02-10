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

all_words = {}
for line in open("all_words.txt"):
    word = line.strip().upper()
    if len(word) < 3 or len(word) > 7:
        continue
    all_words[word] = 1

with open("../src/all_words.js", "w") as f:
    f.write("let data =\n")
    f.write(json.dumps(all_words))
    f.write(";\n")
    f.write("export default data;")
