use std::{collections::HashSet, str};
use trie_rs::{Trie, TrieBuilder};

const SIZE: usize = 5;

#[derive(Clone, Debug)]
struct XWord {
    grid: [[char; SIZE]; SIZE],
}

impl XWord {
    pub fn new() -> Self {
        Self {
            grid: [[' '; SIZE]; SIZE],
        }
    }

    pub fn get_across(&self, row: usize, col: usize) -> String {
        (col..SIZE)
            .map(|i| self.grid[row][i])
            .collect::<String>()
            .trim()
            .to_string()
    }
    pub fn set_across(&mut self, row: usize, col: usize, word: &str) {
        for (i, char) in word.chars().enumerate() {
            self.grid[row][col + i] = char;
        }
    }

    pub fn get_down(&self, row: usize, col: usize) -> String {
        (row..SIZE)
            .map(|i| self.grid[i][col])
            .collect::<String>()
            .trim()
            .to_string()
    }
    pub fn set_down(&mut self, row: usize, col: usize, word: &str) {
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

fn get_words() -> (Trie<u8>, Vec<String>) {
    let file_path = "../xwords_data/2007_to_2018.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();
    let mut builder = TrieBuilder::new();
    let mut words = vec![];

    for result in results.records() {
        let record = result.expect("a CSV record");
        let word = record[2].to_string();

        if word.len() == SIZE && word.chars().all(|c| c.is_ascii_alphabetic()) {
            builder.push(word.to_ascii_uppercase());

            let uppercase_word = word.to_ascii_uppercase();
            if !words.contains(&uppercase_word) {
                words.push(uppercase_word);
            }
        }
    }

    words.sort();

    (builder.build(), words)
}

// fn check_word_fit(word: &String, entry: &Vec<char>) -> bool {
//     // let mut entry_chars = entry.chars();

//     for (i, char) in word.chars().enumerate() {
//         // if let Some(entry_char) = entry_chars.nth(i) {

//         let entry_char = entry[i];

//         if entry_char != char && entry_char != ' ' {
//             return false;
//         }
//         // }
//     }

//     return true;
// }

fn get_matching_words(words_trie: &Trie<u8>, entry: &String) -> Vec<String> {
    let words_in_u8s: Vec<Vec<u8>> = words_trie.predictive_search(entry);
    let words = words_in_u8s
        .iter()
        .map(|u8s| str::from_utf8(u8s).unwrap().to_string())
        .collect();

    words
}

fn insert_vertical(
    xword: &mut XWord,
    col: usize,
    words_trie: &mut Trie<u8>,
    words_vec: &Vec<String>,
    used_words: &mut HashSet<String>,
) {
    let entry = &xword.get_down(0, col);
    let matching_words;
    let words = if entry.is_empty() {
        words_vec
    } else {
        matching_words = get_matching_words(words_trie, entry);
        &matching_words
    };

    if col == SIZE - 1 && words_trie.exact_match(entry) && !used_words.contains(entry) {
        // we found a solution!
        println!("{:?}", xword);
        return;
    }

    for word in words {
        if used_words.contains(word) {
            continue;
        }

        let used_word: String = word.chars().collect();
        xword.set_down(0, col, &used_word);
        used_words.insert(used_word);

        // move to the next iteration
        insert_horizontal(xword, col + 1, words_trie, words_vec, used_words);

        // reset the xword
        xword.set_down(0, col, &format!("{: <5}", entry));
        used_words.remove(&word.chars().collect::<String>());
    }
}

fn insert_horizontal(
    xword: &mut XWord,
    row: usize,
    words_trie: &mut Trie<u8>,
    words_vec: &Vec<String>,
    used_words: &mut HashSet<String>,
) {
    let entry = &xword.get_across(row, 0);
    let matching_words;
    let words = if entry.is_empty() {
        words_vec
    } else {
        matching_words = get_matching_words(words_trie, entry);
        &matching_words
    };

    for (i, word) in words.iter().enumerate() {
        if used_words.contains(word) {
            continue;
        }

        if row == 0 {
            println!("{}% {}", i * 100 / words.len(), word);
        }

        let used_word: String = word.chars().collect();
        xword.set_across(row, 0, &used_word);
        used_words.insert(used_word);

        insert_vertical(xword, row, words_trie, words_vec, used_words);

        // reset the xword
        xword.set_across(row, 0, &format!("{: <5}", entry));
        used_words.remove(&word.chars().collect::<String>());
    }
}

fn main() {
    let (mut words_trie, words) = get_words();
    println!("{:?}", words.len());

    let mut xword = XWord::new();

    insert_horizontal(&mut xword, 0, &mut words_trie, &words, &mut HashSet::new());

    println!("{:?}", xword);
}
