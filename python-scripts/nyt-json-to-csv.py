import json
import csv
import pandas as pd
import glob

def generate_json_paths(year):
    year_path = 'nyt_xwords/'+str(year)+'/*'
    month_paths = glob.glob(year_path)

    json_paths = []
    for month_path in month_paths:
        
        # loop on all files of the folder and build a list of files paths
        json_paths += glob.glob(month_path+'/*.json')
    return json_paths

json_paths = generate_json_paths(2017)
answers=[]
clues=[]

for json_path in json_paths:
    #critian says has to add long proper names
    f = open(json_path)
    crossword_data = json.load(f) 

    answers += crossword_data['answers']['across'] + crossword_data['answers']['down']
    clues += crossword_data['clues']['across'] + crossword_data['clues']['down']
    
    f.close()

#remove the clues numbers "01. cristian is bad" -> "cristian is bad"
clues = list(map(lambda x: x.split(". ", 1)[1], clues))

df = pd.DataFrame()
df['words'] = answers
df['clues'] = clues

csv_data = df.to_csv("xwords_data/2017.csv")
