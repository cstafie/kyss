import json
import pandas as pd
import glob

def generate_json_paths(year):
    year_path = 'nyt_xWords/'+str(year)+'/*'
    month_paths = glob.glob(year_path)

    json_paths = []
    for month_path in month_paths:
        
        # loop on all files of the folder and build a list of files paths
        json_paths += glob.glob(month_path+'/*.json')
    return json_paths

start_year = 1976
end_year = 2018

json_paths = []
for year in range(start_year, end_year + 1):
    json_paths += generate_json_paths(year)

answers=[]
clues=[]

for json_path in json_paths:
    # cristian says has to add long proper names
    f = open(json_path)
    crossword_data = json.load(f) 

    answers += crossword_data['answers']['across'] + crossword_data['answers']['down']
    clues += crossword_data['clues']['across'] + crossword_data['clues']['down']
    
    f.close()

# remove the clues numbers "01. cristian is bad" -> "cristian is bad"
clues = list(map(lambda x: x.split(". ", 1)[1], clues))

df = pd.DataFrame()
df['words'] = answers
df['clues'] = clues

csv_data = df.to_csv("xWords_data/{}_to_{}.csv".format(start_year, end_year))
