use std::{
    cmp,
    collections::{HashMap, HashSet, VecDeque},
    str,
};

#[derive(Debug)]
enum Direction {
    Across,
    Down,
}

#[derive(Clone, Debug)]
struct XWord {
    grid: Vec<Vec<char>>,
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

impl XWord {
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            grid: vec![vec![' '; width]; height],
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
            Direction::Across => self.set_across(entry.row, entry.col, s),
            Direction::Down => self.set_down(entry.row, entry.col, s),
        }
    }
    fn set_across(&mut self, row: usize, col: usize, word: &str) {
        for (i, char) in word.chars().enumerate() {
            self.grid[row][col + i] = char;
        }
    }
    fn set_down(&mut self, row: usize, col: usize, word: &str) {
        for (i, char) in word.chars().enumerate() {
            self.grid[row + i][col] = char
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

fn get_words(min_word_len: usize, max_word_len: usize) -> HashMap<usize, Vec<String>> {
    let file_path = "../xwords_data/1976_to_2018.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();
    // let mut words = vec![];
    let mut words_map: HashMap<usize, Vec<String>> = HashMap::new();

    for result in results.records() {
        let record = result.expect("a CSV record");
        let word = record[2].to_string();

        let is_good_len = min_word_len <= word.len() && word.len() <= max_word_len;

        if is_good_len && word.chars().all(|c| c.is_ascii_alphabetic()) {
            if !words_map.contains_key(&word.len()) {
                words_map.insert(word.len(), vec![]);
            }

            let words = words_map.get_mut(&word.len()).unwrap();

            let uppercase_word = word.to_ascii_uppercase();
            if !words.contains(&uppercase_word) {
                words.push(uppercase_word);
                // TODO: super inefficient, but doesn't slow down program
                words.sort();
            }
        }
    }

    // print
    for i in min_word_len..=max_word_len {
        if let Some(words) = words_map.get(&i) {
            println!("{} \t {:?}", i, words.len());
        }
    }

    words_map
}

fn get_matching_words<'a>(words_vec: &'a Vec<String>, entry: &String) -> &'a [String] {
    if entry.is_empty() {
        return words_vec;
    }

    return match words_vec.binary_search(entry) {
        Ok(start) => &words_vec[start..=start],
        Err(start) => {
            let mut end_string = entry.to_string();
            end_string.push('Z');
            return match words_vec.binary_search(&end_string) {
                Ok(end) => &words_vec[start..end],
                Err(end) => &words_vec[start..end],
            };
        }
    };
}

// fn insert_vertical(
//     xword: &mut XWord,
//     col: usize,
//     words_vec: &Vec<String>,
//     used_words: &mut HashSet<String>,
// ) {
//     let entry = &xword.get_down(0, col);
//     let words = get_matching_words(words_vec, entry);

//     if col == xword.width - 1 && !used_words.contains(entry) {
//         if let Ok(_i) = words_vec.binary_search(entry) {
//             // we found a solution!
//             println!("{:?}", xword);
//             return;
//         }
//     }

//     for word in words {
//         if used_words.contains(word) {
//             continue;
//         }

//         let used_word: String = word.chars().collect();
//         xword.set_down(0, col, &used_word);
//         used_words.insert(used_word);

//         // move to the next iteration
//         insert_horizontal(xword, col + 1, words_vec, used_words);

//         // reset the xword
//         xword.set_down(0, col, &format!("{:height$}", entry, height = xword.height));
//         used_words.remove(&word.chars().collect::<String>());
//     }
// }

// fn insert_horizontal(
//     xword: &mut XWord,
//     row: usize,
//     words_vec: &Vec<String>,
//     used_words: &mut HashSet<String>,
// ) {
//     let entry = &xword.get_across(row, 0);
//     let words = get_matching_words(words_vec, entry);

//     for (i, word) in words.iter().enumerate() {
//         if used_words.contains(word) {
//             continue;
//         }

//         if row == 0 {
//             println!("{}% {}", i * 100 / words.len(), word);
//         }

//         let used_word: String = word.chars().collect();
//         xword.set_across(row, 0, &used_word);
//         used_words.insert(used_word);

//         insert_vertical(xword, row, words_vec, used_words);

//         // reset the xword
//         xword.set_across(row, 0, &format!("{:width$}", entry, width = xword.width));
//         used_words.remove(&word.chars().collect::<String>());
//     }
// }

fn get_xword_entries_across(xword: &XWord, entries: &mut Vec<XWordEntry>, row: usize) {
    // last row is xword.height - 1
    if row >= xword.height {
        return;
    }

    entries.push(XWordEntry {
        row,
        col: 0,
        direction: Direction::Across,
        length: xword.width,
    });
}

fn get_xword_entries_down(xword: &XWord, entries: &mut Vec<XWordEntry>, col: usize) {
    // last col is xword.width - 1
    if col >= xword.width {
        return;
    }

    entries.push(XWordEntry {
        row: 0,
        col,
        direction: Direction::Down,
        length: xword.height,
    });
}

fn get_xword_entries(xword: &XWord) -> Vec<XWordEntry> {
    let mut entries = vec![];

    for i in 0..cmp::max(xword.width, xword.height) {
        get_xword_entries_across(xword, &mut entries, i);
        get_xword_entries_down(xword, &mut entries, i);
    }

    entries
}

fn generate_xwords(
    xword: &mut XWord,
    entries: &mut VecDeque<XWordEntry>,
    words_map: &HashMap<usize, Vec<String>>,
    used_words: &mut HashSet<String>,
) {
    if entries.is_empty() {
        // we found a solution?
        println!("{:?}", xword);
        return;
    }

    let entry = entries.pop_front().unwrap();
    let old_entry_string = xword.get_entry(&entry);
    let words_vec = words_map.get(&entry.length).unwrap();
    let matching_words = get_matching_words(words_vec, &old_entry_string);

    for word in matching_words {
        if used_words.contains(word) {
            continue;
        }

        let used_word = word.clone();
        used_words.insert(used_word);

        xword.set_entry(&entry, word);

        generate_xwords(xword, entries, words_map, used_words);

        xword.set_entry(&entry, &old_entry_string);
        used_words.remove(word);
    }
}

fn main() {
    let height = 5;
    let width = 5;

    let words_map = get_words(1, 300);

    // TODO: the empty crossword should be given some kind of grid, for now it's just a width and height
    let mut xword = XWord::new(width, height);

    let mut entries = VecDeque::from(get_xword_entries(&xword));

    println!("{:?}", entries);

    generate_xwords(&mut xword, &mut entries, &words_map, &mut HashSet::new());

    // insert_horizontal(
    //     &mut xword,
    //     0,
    //     words.get(&width).unwrap(),
    //     &mut HashSet::new(),
    // );

    println!("{:?}", xword);
}
