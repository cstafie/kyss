use std::{
    cmp,
    collections::{HashMap, HashSet},
    hash::Hash,
    str,
};

#[derive(Debug, PartialEq)]
enum Direction {
    Across,
    Down,
}

#[derive(Clone, Debug)]
struct XWord {
    pub grid: Vec<Vec<char>>,
    pub width: usize,
    pub height: usize,
}

#[derive(Debug)]
struct XWordEntry {
    row: usize,
    col: usize,
    direction: Direction,
    length: usize,
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

        for (col, row) in blocks {
            grid[col][row] = '#';
        }

        Self {
            grid,
            width,
            height,
        }
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
            .trim()
            .to_string()
    }
    fn get_down(&self, row: usize, col: usize, length: usize) -> String {
        (row..row + length)
            .map(|i| self.grid[i][col])
            .collect::<String>()
            .trim()
            .to_string()
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

    // pub fn get_first_empty(&self) -> Option<(usize, usize)> {
    //     for row in 0..SIZE {
    //         for col in 0..SIZE {
    //             if self.grid[row][col] == ' ' {
    //                 return Some((row, col));
    //             }
    //         }
    //     }

    //     None
    // }

    // pub fn to_string(&self) -> String {
    //     (0..SIZE).fold(String::new(), |acc: String, row| {
    //         acc + &self.get_across(row, 0).join("") + "\n"
    //     })
    // }
}

fn get_word_data(
    min_word_len: usize,
    max_word_len: usize,
) -> HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>> {
    let file_path = "../xwords_data/1976_to_2018.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();

    let mut word_frequency: HashMap<String, i32> = HashMap::new();

    let mut longest_word = 0;

    for result in results.records() {
        let record = result.expect("a CSV record");

        let word = record[2].to_string();

        let is_good_len = min_word_len <= word.len() && word.len() <= max_word_len;
        let is_ascii_alphabetic = word.chars().all(|c| c.is_ascii_alphabetic());

        if is_good_len && is_ascii_alphabetic {
            word_frequency
                .entry(word.to_ascii_uppercase())
                .and_modify(|count| *count += 1)
                .or_insert(1);
            longest_word = cmp::max(longest_word, word.len());
        }
    }

    let mut word_frequency_vector: Vec<(String, i32)> = word_frequency.into_iter().collect();
    word_frequency_vector.sort_by(|(word_a, _), (word_b, _)| word_a.cmp(word_b));

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

    for (word, frequency) in word_frequency_vector.into_iter() {
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

        // words_map
        //     .entry(word.len())
        //     .and_modify(|position_map| {
        //         for position in 0..word.len() {
        //             position_map
        //                 .entry(position)
        //                 .and_modify(|char_map| char_map)
        //                 .or_insert(HashMap::new())
        //         }
        //     })
        //     .or_insert(HashMap::from());

        // words_map
        //     .entry(word.len())
        //     .and_modify(|word_vec| word_vec.push((word.clone(), frequency)))
        //     .or_insert(vec![(word, frequency)]);
    }

    // let num = 5;

    // // sort by freq for learning
    // words_map
    //     .get_mut(&num)
    //     .unwrap()
    //     .sort_by(|(_, freq_a), (_, freq_b)| freq_a.cmp(&freq_b));

    // println!("{:?}", words_map.get(&num));

    // print words_map

    words_map
}

fn get_xword_entries_across(xword: &XWord, entries: &mut Vec<XWordEntry>, row: usize) {
    // last row is xword.height - 1
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
        });
    }
}

fn get_xword_entries_down(xword: &XWord, entries: &mut Vec<XWordEntry>, col: usize) {
    // last col is xword.width - 1
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

fn slice_to_vec(slice: &[(String, i32)]) -> Vec<(String, i32)> {
    let mut vec = vec![];

    for (word, freq) in slice {
        vec.push((word.clone(), freq.to_owned()));
    }

    vec
}

// fn get_matching_words<'a>(
//     words_vec: &'a Vec<(String, i32)>,
//     entry: &String,
// ) -> &'a [(String, i32)] {
//     if entry.is_empty() {
//         return words_vec;
//     }

//     return match words_vec.binary_search_by(|(word, _)| word.cmp(entry)) {
//         Ok(start) => &words_vec[start..=start],
//         Err(start) => {
//             let mut end_string = entry.to_string();
//             end_string.push('Z');

//             return match words_vec.binary_search_by(|(word, _)| word.cmp(&end_string)) {
//                 Ok(end) => &words_vec[start..end],
//                 Err(end) => &words_vec[start..end],
//             };
//         }
//     };
// }

fn get_matching_words(
    position_map: &HashMap<usize, HashMap<char, HashSet<String>>>,
    entry: &String,
) -> HashSet<String> {
    let mut result_word_set = HashSet::new();

    if entry.is_empty() {
        for (_, character_map) in position_map {
            for (_, word_set) in character_map {
                word_set.iter().for_each(|word| {
                    result_word_set.insert(word.clone());
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
            result_word_set.insert(word.clone());
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

    assert_eq!(intersections.len(), entry.length);

    for i in 0..entry.length {
        let intersection_entry = intersections.get(i).unwrap();
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

    // println!("{:?}", total);

    return total;
}

fn generate_xwords(
    xword: &mut XWord,
    entries: &Vec<XWordEntry>,
    entry_index: usize,
    words_map: &HashMap<usize, HashMap<usize, HashMap<char, HashSet<String>>>>,
    used_words: &mut HashSet<String>,
) {
    let entry = &entries[entry_index];
    let old_entry_string = xword.get_entry(&entry);
    let position_map = words_map.get(&entry.length).unwrap();
    let matching_words = get_matching_words(position_map, &old_entry_string);

    // sort most frequent to least frequent
    // matching_words.sort_by(|(_, freq_a), (_, freq_b)| freq_b.cmp(freq_a));

    let intersections: Vec<&XWordEntry> = entries.iter().filter(|e| entry.intersects(e)).collect();

    let mut scored_matching_words: Vec<(String, i32)> = matching_words
        .into_iter()
        .map(|word| {
            (
                word.clone(),
                score(
                    xword,
                    &word,
                    entry,
                    &old_entry_string,
                    &intersections,
                    words_map,
                ),
            )
        })
        .filter(|(_, score)| *score != 0)
        .collect();

    scored_matching_words.sort_by(|(_, score_a), (_, score_b)| score_b.cmp(score_a));
    // println!("{:?}", matching_words);

    // compute score for each word
    // score = for each letter in the word: score += number of words that could fit across that letter

    for (i, (word, _)) in scored_matching_words.iter().enumerate() {
        if entry_index < 10 {
            println!(
                "{} {}% {}",
                entry_index,
                i * 100 / scored_matching_words.len(),
                word
            );
        }

        if used_words.contains(word) {
            continue;
        } else if entry_index >= entries.len() - 1 {
            // we found a solution!
            println!("{:?}", xword);
            return;
        }

        let used_word = word.clone();

        used_words.insert(used_word);
        xword.set_entry(entry, word);

        generate_xwords(xword, entries, entry_index + 1, words_map, used_words);

        xword.set_entry(entry, &old_entry_string);
        used_words.remove(word);
    }
}

fn main() {
    // right now the longest word is 21 letters, we probably won't need words that long
    let words_map = get_word_data(3, 30);

    // vec![(3, 3)]
    // 11,
    // 11,
    // vec![
    //     (0, 5),
    //     (1, 5),
    //     (3, 3),
    //     (3, 7),
    //     (5, 0),
    //     (5, 1),
    //     (5, 9),
    //     (5, 10),
    //     (7, 3),
    //     (7, 7),
    //     (9, 5),
    //     (10, 5),
    // ],
    let mut xword = XWord::new(
        9,
        9,
        vec![
            (0, 3),
            (1, 3),
            (3, 0),
            (3, 1),
            (3, 5),
            (5, 3),
            (5, 7),
            (5, 8),
            (7, 5),
            (8, 5),
        ],
    );
    let entries = get_xword_entries(&xword);

    println!("entries length: {:?}", entries.len());
    println!("entries: {:?}", entries);

    generate_xwords(&mut xword, &entries, 0, &words_map, &mut HashSet::new());

    println!("xword {:?}", xword);
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
        };

        let entry_b = XWordEntry {
            row: 1,
            col: 3,
            length: 3,
            direction: Direction::Down,
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
        };

        let entry_b = XWordEntry {
            row: 3,
            col: 3,
            length: 3,
            direction: Direction::Down,
        };

        assert!(!entry_a.intersects(&entry_b));
    }

    #[test]
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
        };

        assert_eq!(xword.get_entry(&xword_entry), "");
        xword.set_entry(&xword_entry, "1234");

        // get twice to make sure get is non destructive
        assert_eq!(xword.get_entry(&xword_entry), "1234");
        assert_eq!(xword.get_entry(&xword_entry), "1234");

        xword.set_entry(&xword_entry, "");
        assert_eq!(xword.get_entry(&xword_entry), "");

        xword.set_entry(&xword_entry, "12");
        assert_eq!(xword.get_entry(&xword_entry), "12");
    }

    // #[test]
    // fn it_should_get_and_set_entry_across() {
    //     let direction = Direction::Across;

    //     let width = 3;
    //     let height = 4;
    //     let mut xword = XWord::new(width, height, vec![]);

    //     let xword_entry = XWordEntry {
    //         row: 0,
    //         col: 0,
    //         length: width,
    //         direction,
    //     };

    //     assert_eq!(xword.get_entry(&xword_entry), "");
    //     xword.set_entry(&xword_entry, "123");

    //     // get twice to make sure get is non destructive
    //     assert_eq!(xword.get_entry(&xword_entry), "123");
    //     assert_eq!(xword.get_entry(&xword_entry), "123");
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
