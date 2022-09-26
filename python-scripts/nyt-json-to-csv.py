import json
import csv
import pandas as pd
import glob

def generate_json_paths(year_str):

    year_paths = 'nyt_xwords/'+str(year_str)+'*'
    year_paths = glob.glob(year_paths)
    json_paths = []
    for year_path in year_paths:
        year_path = str(year_path)+"/*"
        month_paths = glob.glob(year_path)
        
        for month_path in month_paths:
            print(month_path)
            # loop on all files of the folder and build a list of files paths
            json_paths += glob.glob(month_path+'/*.json')

    return json_paths

json_paths = generate_json_paths("20")
answers=[]
clues=[]

for json_path in json_paths:
    print(json_path)
    #critian insists to add long proper names
    f = open(json_path)
    crossword_data = json.load(f) 

    answers += crossword_data['answers']['across'] + crossword_data['answers']['down']
    clues += crossword_data['clues']['across'] + crossword_data['clues']['down']

    f.close()

#remove the clues numbers: "01. cristian is bad" -> "cristian is bad"
clues = list(map(lambda x: x.split(". ", 1)[1], clues))

df = pd.DataFrame()
df['words'] = answers
df['clues'] = clues

csv_data = df.to_csv("xwords_data/2000.csv")
