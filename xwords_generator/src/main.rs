use csv;
use std::str;
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
    pub fn set_across(&mut self, row: usize, col: usize, word: &String) {
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
    pub fn set_down(&mut self, row: usize, col: usize, word: &String) {
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

fn insert_vertical(xword: &mut XWord, col: usize, words_trie: &Trie<u8>, words_vec: &Vec<String>) {
    let entry = &xword.get_down(0, col);
    let mut matching_words = Vec::new();
    let words = if entry.is_empty() {
        words_vec
    } else {
        matching_words = get_matching_words(words_trie, entry);
        &matching_words
    };

    for word in words {
        xword.set_down(0, col, &word.chars().collect());

        if col == SIZE - 1 {
            // we found a solution!
            println!("{:?}", xword);

            // reset the xword
            xword.set_down(0, col, entry);

            // there will be no other solution at this point
            break;
        }

        // move to the next iteration
        insert_horizontal(xword, col + 1, words_trie, words_vec);

        // reset the xword
        xword.set_down(0, col, entry);
    }
}

fn insert_horizontal(
    xword: &mut XWord,
    row: usize,
    words_trie: &Trie<u8>,
    words_vec: &Vec<String>,
) {
    let entry = &xword.get_across(row, 0);
    let mut matching_words = Vec::new();
    let words = if entry.is_empty() {
        words_vec
    } else {
        matching_words = get_matching_words(words_trie, entry);
        &matching_words
    };

    for word in words {
        xword.set_across(row, 0, &word.chars().collect());

        insert_vertical(xword, row, words_trie, words_vec);

        // reset the xword
        xword.set_across(row, 0, entry);
    }
}

fn main() {
    let (words_trie, words) = get_words();
    println!("{:?}", words);

    let mut xword = XWord::new();

    insert_horizontal(&mut xword, 0, &words_trie, &words);

    println!("{:?}", xword);
}
