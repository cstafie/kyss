use rand::distributions::{Alphanumeric, DistString};
use rand::seq::IteratorRandom;
use serde::{Deserialize, Serialize};
// use serde_json::Result;
use chrono::prelude::*;
use regex::RegexSet;
use std::{
    cmp,
    collections::{HashMap, HashSet},
    error::Error,
    fs,
    fs::File,
    io::prelude::*,
    path::Path,
    str,
};

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
enum Direction {
    Across,
    Down,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct XWord {
    pub grid: Vec<Vec<char>>,
    pub width: usize,
    pub height: usize,
    pub entries: Vec<XWordEntry>,
}

// TODO: impl new
#[derive(Serialize, Deserialize, Debug, Clone)]
struct XWordEntry {
    row: usize,
    col: usize,
    direction: Direction,
    length: usize,
    number: i32,
    clue: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ClueAnswer {
    clue: String,
    answer: String,
}

impl XWordEntry {
    pub fn intersects(&self, other: &XWordEntry) -> bool {
        // we don't want to intersect with ourselves or anyone going the same direction
        if self.direction == other.direction {
            return false;
        }

        let (self_max_row, self_max_col) = match self.direction {
            Direction::Across => (self.row, self.col + self.length - 1),
            Direction::Down => (self.row + self.length - 1, self.col),
        };

        let (other_max_row, other_max_col) = match other.direction {
            Direction::Across => (other.row, other.col + other.length - 1),
            Direction::Down => (other.row + other.length - 1, other.col),
        };

        // is self above other? or is other above self?
        if self_max_row < other.row || other_max_row < self.row {
            return false;
        }

        // is self left of other? or is other left of self?
        if self_max_col < other.col || other_max_col < self.col {
            return false;
        }

        // then the two must intersect
        true
    }
}

impl XWord {
    pub fn new(width: usize, height: usize, blocks: Vec<(usize, usize)>) -> Self {
        let mut grid = vec![vec![' '; width]; height];

        for (row, col) in blocks {
            grid[col][row] = '#';
        }

        Self {
            grid,
            width,
            height,
            entries: Vec::new(),
        }
    }

    // TODO: this feels a bit gross, maybe we can just keep
    // track of tiles filled in constant space / time?
    // but that might be over engineering
    pub fn is_filled(&self) -> bool {
        for col in 0..self.width {
            for row in 0..self.height {
                if self.grid[col][row] == ' ' {
                    return false;
                }
            }
        }

        return true;
    }

    pub fn get_entry(&self, entry: &XWordEntry) -> String {
        match entry.direction {
            Direction::Across => self.get_across(entry.row, entry.col, entry.length),
            Direction::Down => self.get_down(entry.row, entry.col, entry.length),
        }
    }
    fn get_across(&self, row: usize, col: usize, length: usize) -> String {
        (col..col + length)
            .map(|i| self.grid[row][i])
            .collect::<String>()
    }
    fn get_down(&self, row: usize, col: usize, length: usize) -> String {
        (row..row + length)
            .map(|i| self.grid[i][col])
            .collect::<String>()
    }

    pub fn set_entry(&mut self, entry: &XWordEntry, s: &str) {
        match entry.direction {
            Direction::Across => self.set_across(entry.row, entry.col, entry.length, s),
            Direction::Down => self.set_down(entry.row, entry.col, entry.length, s),
        }
    }
    fn set_across(&mut self, row: usize, col: usize, length: usize, word: &str) {
        for i in 0..length {
            self.grid[row][col + i] = word.chars().nth(i).unwrap_or(' ')
        }
    }
    fn set_down(&mut self, row: usize, col: usize, length: usize, word: &str) {
        for i in 0..length {
            self.grid[row + i][col] = word.chars().nth(i).unwrap_or(' ');
        }
    }

    // pub fn to_string(&self) -> String {
    //     (0..SIZE).fold(String::new(), |acc: String, row| {
    //         acc + &self.get_across(row, 0).join("") + "\n"
    //     })
    // }
}

fn get_clue_answers(path: &str) -> Result<Vec<ClueAnswer>, Box<dyn Error>> {
    if !Path::new(path).exists() {
        return Ok(Vec::new());
    }

    let data = fs::read_to_string(path)?;
    let clue_answers: Vec<ClueAnswer> = serde_json::from_str(&data)?;

    return Ok(clue_answers);
}

// fn is_clue_good(clue: &str) -> bool {
//     let bad_clues = [
//         r"(?i)\[see note\]",
//         r"(?i)-across",
//         r"(?i)-down",
//         r"$\*",
//         r"$-^",
//     ];

//     println!("{:?}", clue);

//     for bad_clue in bad_clues {
//         // TODO: building the same regex over and over again is inefficient
//         // but it doesn't really matter since this code rarely runs
//         let re = Regex::new(bad_clue).unwrap();

//         if re.is_match(clue) {
//             return false;
//         }
//     }

//     return true;
// }

fn get_answers_clues_map(
    min_word_len: usize,
    max_word_len: usize,
) -> HashMap<String, HashSet<String>> {
    let mut clue_answers = Vec::new();

    let bad_clues = RegexSet::new(&[
        r"(?i)\[see note\]",
        r"(?i)-across",
        r"(?i)-down",
        r"^\*", // should not start with *
        r"\*$", // should not end with *
        r"puzzle",
        r"starred clues",
        r"or a hint",
        r"shaded",
        r"circled",
        r"starred",
        r"clue",
    ])
    .unwrap();

    for year in 2017..=2023 {
        for month in 1..=12 {
            for day in 1..31 {
                // let's skip THU and SUN to lower the chance of bad/weird words/clues
                let dt_option = NaiveDate::from_ymd_opt(year, month, day);

                match dt_option {
                    Some(dt) => {
                        let weekday = dt.weekday();
                        if weekday.eq(&Weekday::Thu)
                            || weekday.eq(&Weekday::Sun)
                            || weekday.eq(&Weekday::Fri)
                            || weekday.eq(&Weekday::Sat)
                        {
                            continue;
                        }
                    }
                    None => continue,
                }

                let path = format!(
                    "../js_scripts/xword_info_scraper/scraped_xwords/{}/{:0>2}/{:0>2}.json",
                    year, month, day
                );

                match get_clue_answers(&path) {
                    Ok(mut result) => clue_answers.append(&mut result),
                    Err(err) => println!("{:?}", err),
                }
            }
        }
    }

    println!("raw clue/answer count: {:?}", clue_answers.len());

    let mut answers_clues: HashMap<String, HashSet<String>> = HashMap::new();

    for clue_answer in clue_answers {
        let ClueAnswer {
            mut clue,
            mut answer,
        } = clue_answer;

        clue = clue.trim().to_string();
        answer = answer.trim().to_ascii_uppercase().to_string();

        let is_clue_bad = bad_clues.matches(&clue).matched_any();

        if is_clue_bad {
            continue;
        }

        // TODO: is clue good?
        let is_good_len = min_word_len <= answer.len() && answer.len() <= max_word_len;
        let is_ascii_alphabetic = answer.chars().all(|c| c.is_ascii_alphabetic());

        if !(is_good_len && is_ascii_alphabetic) {
            continue;
        }

        println!("{:?}", clue);

        answers_clues
            .entry(answer.to_ascii_uppercase())
            .and_modify(|clues| {
                clues.insert(clue.clone());
            })
            .or_insert(HashSet::from([clue]));
    }

    println!("cleaned up count: {:?}", answers_clues.keys().len());

    answers_clues
}

fn get_word_data(
    words_clues: &HashMap<String, HashSet<String>>,
) -> HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>> {
    let mut word_frequency_vector: Vec<(String, HashSet<String>)> =
        words_clues.clone().into_iter().collect();

    word_frequency_vector.sort_by(|(word_a, _), (word_b, _)| word_a.cmp(word_b));

    let longest_word: usize = word_frequency_vector
        .iter()
        .fold(0, |longest, (word, _clues)| {
            std::cmp::max(longest, word.len())
        });

    // words_map: word_length -> position -> character (A-Z) -> Vec<Str>
    let mut words_map: HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>> =
        HashMap::new();

    for word_len in 1..=longest_word {
        let mut position_map = HashMap::new();

        for position in 0..word_len {
            let mut character_map = HashMap::new();

            for character in 'A'..='Z' {
                character_map.insert(character, HashSet::new());
            }

            position_map.insert(position, character_map);
        }

        words_map.insert(word_len, position_map);
    }

    for (word, _frequency) in word_frequency_vector.into_iter() {
        for (position, character) in word.chars().enumerate() {
            words_map
                .get_mut(&word.len())
                .unwrap()
                .get_mut(&position)
                .unwrap()
                .get_mut(&character)
                .unwrap()
                .insert(word.clone());
        }
    }

    words_map
}

fn get_xword_entries_across(xword: &XWord, entries: &mut Vec<XWordEntry>, row: usize) {
    // last row is xWord.height - 1
    if row >= xword.height {
        return;
    }

    let mut starting_col = 0;

    for col in 0..xword.width {
        if xword.grid[row][col] == '#' {
            if starting_col < col {
                entries.push(XWordEntry {
                    row,
                    col: starting_col,
                    direction: Direction::Across,
                    length: col - starting_col,
                    number: 0,
                    clue: "".to_string(),
                });
            }

            starting_col = col + 1;
        }
    }

    if starting_col < xword.width {
        entries.push(XWordEntry {
            row,
            col: starting_col,
            direction: Direction::Across,
            length: xword.width - starting_col,
            number: 0,
            clue: "".to_string(),
        });
    }
}

fn get_xword_entries_down(xword: &XWord, entries: &mut Vec<XWordEntry>, col: usize) {
    // last col is xWord.width - 1
    if col >= xword.width {
        return;
    }

    let mut starting_row = 0;

    for row in 0..xword.height {
        if xword.grid[row][col] == '#' {
            if starting_row < row {
                entries.push(XWordEntry {
                    row: starting_row,
                    col,
                    direction: Direction::Down,
                    length: row - starting_row,
                    number: 0,
                    clue: "".to_string(),
                });
            }

            starting_row = row + 1;
        }
    }

    if starting_row < xword.height {
        entries.push(XWordEntry {
            row: starting_row,
            col,
            direction: Direction::Down,
            length: xword.height - starting_row,
            number: 0,
            clue: "".to_string(),
        });
    }
}

fn get_xword_entries(xword: &XWord) -> Vec<XWordEntry> {
    let mut entries = vec![];

    for i in 0..cmp::max(xword.width, xword.height) {
        get_xword_entries_across(xword, &mut entries, i);
        get_xword_entries_down(xword, &mut entries, i);
    }

    entries
}

fn get_matching_words<'a>(
    position_map: &'a HashMap<usize, HashMap<char, HashSet<String>>>,
    entry: &String,
) -> HashSet<&'a String> {
    let mut result_word_set: HashSet<&String> = HashSet::new();

    if entry.trim().is_empty() {
        for (_, character_map) in position_map {
            for (_, word_set) in character_map {
                word_set.iter().for_each(|word| {
                    result_word_set.insert(word);
                });
            }
        }

        return result_word_set;
    }

    let mut matching_word_sets = Vec::new();

    for (position, character) in entry.chars().enumerate() {
        if character == ' ' {
            continue;
        }

        if let Some(character_map) = position_map.get(&position) {
            if let Some(word_set) = character_map.get(&character) {
                matching_word_sets.push(word_set);
            }
        }
    }

    matching_word_sets.sort_by(|word_set_a, word_set_b| word_set_a.len().cmp(&word_set_b.len()));

    if matching_word_sets.is_empty() {
        return result_word_set;
    }

    let shortest_set = matching_word_sets.get(0).unwrap();

    // we will use the first set since it is the smallest to check against the others

    for word in shortest_set.iter() {
        let mut all_contain_word = true;

        for i in 1..matching_word_sets.len() {
            if !matching_word_sets.get(i).unwrap().contains(word) {
                all_contain_word = false;
                break;
            }
        }

        if all_contain_word {
            result_word_set.insert(word);
        }
    }

    result_word_set
}

fn score(
    xword: &mut XWord,
    word: &String,
    entry: &XWordEntry,
    old_entry_string: &String,
    intersections: &Vec<&XWordEntry>,
    words_map: &HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>>,
) -> i32 {
    // place the word so get_entry works
    xword.set_entry(entry, word);

    let mut total: i32 = 0;

    for intersection_entry in intersections {
        // let intersection_entry = intersections.get(i).unwrap();
        let test_string = xword.get_entry(intersection_entry);
        let words_vec = words_map.get(&intersection_entry.length).unwrap();
        let matches = get_matching_words(words_vec, &test_string);

        if matches.is_empty() {
            total = 0;
            break;
        }

        total += matches.len() as i32;
    }

    // put back the old word
    xword.set_entry(entry, old_entry_string);

    return total;
}

fn generate_xword(
    xword: &mut XWord,
    entries: &Vec<XWordEntry>,
    words_map: &HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>>,
    used_words: &mut HashSet<String>,
    depth: &usize,
    iterations: &mut i32,
) -> bool {
    if *iterations >= 100_000 {
        return false;
    }
    *iterations += 1;

    if xword.is_filled() {
        // we found a solution!
        return true;
    }

    let mut matching_words = HashSet::new();
    let mut shortest = usize::MAX;
    let mut optional_entry = None;

    for entry in entries {
        let entry_string = xword.get_entry(&entry);

        // if entry is filled (has no spaces) continue
        if entry_string.chars().all(|c| c != ' ') {
            continue;
        }

        let entry_matching_words =
            get_matching_words(words_map.get(&entry.length).unwrap(), &entry_string);

        if entry_matching_words.len() < shortest {
            shortest = entry_matching_words.len();
            matching_words = entry_matching_words;
            optional_entry = Some(entry);
        }
    }

    let entry = optional_entry.unwrap();

    // we will try all the words at the entry with the fewest possibilities
    let old_entry_string = xword.get_entry(&entry);

    // get all the entries that intersect with the current entry
    let intersections: Vec<&XWordEntry> = entries.iter().filter(|e| entry.intersects(e)).collect();

    // compute score for each word
    // score = for each intersection with the word the score += the number of words that fit at the intersection
    let scored_matching_words: Vec<(String, i32)> = matching_words
        .into_iter()
        .map(|word| {
            (
                word.clone(),
                score(
                    xword,
                    &word,
                    &entry,
                    &old_entry_string,
                    &intersections,
                    words_map,
                ),
            )
        })
        // filter out 0s, they are dead ends
        .filter(|(_, score)| *score != 0)
        .collect();

    // sort by score high to low (TODO: probably not necessary any more)
    // scored_matching_words.sort_by(|(_, score_a), (_, score_b)| score_b.cmp(score_a));
    // println!("{:?}", matching_words);

    for (_, (word, _)) in scored_matching_words.iter().enumerate() {
        // if *depth < 4 {
        //     println!(
        //         "{} {}% {} {}",
        //         "\t".repeat(*depth),
        //         i * 100 / scored_matching_words.len(),
        //         word,
        //         *iterations
        //     );
        // }

        if used_words.contains(word) {
            continue;
        }

        let used_word = word.clone();

        used_words.insert(used_word);
        xword.set_entry(&entry, &word);

        if generate_xword(
            xword,
            entries,
            words_map,
            used_words,
            &(depth + 1),
            iterations,
        ) {
            return true;
        }

        xword.set_entry(&entry, &old_entry_string);
        used_words.remove(word);
    }

    return false;
}

// TODO: remove unneeded clones and unwraps

fn populate_entries(
    entries: &mut Vec<XWordEntry>,
    xword: &XWord,
    words_clues_map: &HashMap<String, HashSet<String>>,
) {
    for entry in entries {
        let entry_word = xword.get_entry(entry);

        let mut rng = rand::thread_rng();

        entry.clue = words_clues_map
            .get(&entry_word)
            .unwrap()
            .iter()
            .choose(&mut rng)
            .unwrap()
            .clone();
    }
}

fn number_entries(entries: &mut Vec<XWordEntry>) {
    entries.sort_by(|entry_a, entry_b| {
        if entry_a.row == entry_b.row {
            return entry_a.col.cmp(&entry_b.col);
        }

        return entry_a.row.cmp(&entry_b.row);
    });

    let mut number = 0;
    let mut prev_row_col: Option<(usize, usize)> = None;

    for entry in entries.iter_mut() {
        match prev_row_col {
            Some((row, col)) => {
                if entry.row != row || entry.col != col {
                    number += 1;
                    prev_row_col = Some((entry.row, entry.col));
                }
            }
            None => {
                number += 1;
                prev_row_col = Some((entry.row, entry.col));
            }
        }

        entry.number = number;
    }
}

fn main() -> std::io::Result<()> {
    // right now the longest word is 21 letters, we probably won't need words that long
    let answers_clues_map = get_answers_clues_map(3, 30);
    let words_map = get_word_data(&answers_clues_map);

    // println!("{:?}", words_clues_map);

    // for i in 0..999 {
    let mut xword = XWord::new(
        7,
        7,
        vec![
            (0, 0),
            (0, 1),
            (0, 5),
            (0, 6),
            (1, 0),
            (1, 6),
            (3, 3),
            (5, 0),
            (5, 6),
            (6, 0),
            (6, 1),
            (6, 5),
            (6, 6),
        ],
    );

    let mut entries = get_xword_entries(&xword);

    // println!("entries length: {:?}", entries.len());
    // println!("entries: {:?}", entries);

    let mut iterations = 0;

    if generate_xword(
        &mut xword,
        &entries,
        &words_map,
        &mut HashSet::new(),
        &0,
        &mut iterations,
    ) {
        // println!("{}\t found after {:?} iterations", i, iterations);
        // println!("xWord {:?}", xword);

        populate_entries(&mut entries, &xword, &answers_clues_map);
        number_entries(&mut entries);

        xword.entries = entries;

        let xword_json = serde_json::to_string(&xword).unwrap();

        let random_string = Alphanumeric.sample_string(&mut rand::thread_rng(), 4);
        let file_name: String = format!("generated_xWords/{}.json", random_string);

        let mut file = File::create(&file_name[..])?;
        file.write_all(xword_json.as_bytes())?;
        // }

        // println!("xWord {:?}", xword);
    }

    Ok(())
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn it_should_intersect() {
        let entry_a = XWordEntry {
            row: 1,
            col: 1,
            length: 5,
            direction: Direction::Across,
            number: 0,
            clue: "".to_string(),
        };

        let entry_b = XWordEntry {
            row: 1,
            col: 3,
            length: 3,
            direction: Direction::Down,
            number: 0,
            clue: "".to_string(),
        };

        assert!(entry_a.intersects(&entry_b));
    }

    #[test]
    fn it_should_not_intersect() {
        let entry_a = XWordEntry {
            row: 1,
            col: 1,
            length: 5,
            direction: Direction::Across,
            number: 0,
            clue: "".to_string(),
        };

        let entry_b = XWordEntry {
            row: 3,
            col: 3,
            length: 3,
            direction: Direction::Down,
            number: 0,
            clue: "".to_string(),
        };

        assert!(!entry_a.intersects(&entry_b));
    }

    // #[test]
    // fn it_should_get_matching_words() {
    //     // NOTE: upper case  (unfortunately) really matters
    //     let words_vec = vec![
    //         ("APIAN".to_string(), 3),
    //         ("APPLE".to_string(), 2),
    //         ("STUFF".to_string(), 1),
    //     ];

    //     let matching_words = get_matching_words(&words_vec, &"AP".to_string());

    //     assert_eq!(matching_words.len(), 2);
    // }
    #[test]
    fn it_should_get_and_set_entry_down() {
        let direction = Direction::Down;

        let width = 3;
        let height = 4;
        let mut xword = XWord::new(width, height, vec![]);

        let xword_entry = XWordEntry {
            row: 0,
            col: 0,
            length: height,
            direction,
            number: 0,
            clue: "".to_string(),
        };

        assert_eq!(xword.get_entry(&xword_entry), "    ");
        xword.set_entry(&xword_entry, "1234");

        // get twice to make sure get is non destructive
        assert_eq!(xword.get_entry(&xword_entry), "1234");
        assert_eq!(xword.get_entry(&xword_entry), "1234");

        xword.set_entry(&xword_entry, "");
        assert_eq!(xword.get_entry(&xword_entry), "    ");

        xword.set_entry(&xword_entry, "12");
        assert_eq!(xword.get_entry(&xword_entry), "12  ");
    }

    // #[test]
    // fn it_should_get_and_set_entry_across() {
    //     let direction = Direction::Across;

    //     let width = 3;
    //     let height = 4;
    //     let mut xWord = XWord::new(width, height, vec![]);

    //     let xWord_entry = XWordEntry {
    //         row: 0,
    //         col: 0,
    //         length: width,
    //         direction,
    //     };

    //     assert_eq!(xWord.get_entry(&xWord_entry), "");
    //     xWord.set_entry(&xWord_entry, "123");

    //     // get twice to make sure get is non destructive
    //     assert_eq!(xWord.get_entry(&xWord_entry), "123");
    //     assert_eq!(xWord.get_entry(&xWord_entry), "123");
    // }

    #[test]
    fn it_should_create_a_xword() {
        let width = 3;
        let height = 4;
        let xword = XWord::new(width, height, vec![]);

        assert_eq!(xword.grid.len(), height);

        for row in xword.grid {
            assert_eq!(row.len(), width);
        }

        assert_eq!(xword.height, height);
        assert_eq!(xword.width, width);
    }
}
