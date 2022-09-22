import json
import pandas

f = open("nyt_crosswords/2018/03/09.json")


# returns JSON object as 
# a dictionary
crossword_data = json.load(f)
  
# Iterating through the json
# list

d = {}

for i in range(len(crossword_data['answers']['across'])): 
    d["clue"]







for i in crossword_data['answers']:
    print(crossword_data['answers'][i][0])
  
# Closing file
f.close()