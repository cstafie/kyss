use csv;

use std::{collections::HashSet, default};

const SIZE: usize = 5;

#[derive(Clone)]
struct XWord {
    grid: [[char; SIZE]; SIZE],
}

impl XWord {
    pub fn new() -> Self {
        Self {
            grid: [[' '; SIZE]; SIZE],
        }
    }

    pub fn get_across(&self, row: usize, col: usize) -> Vec<char> {
        let mut result = vec![];

        for i in col..SIZE {
            result.push(self.grid[row][i]);
        }

        result
    }

    pub fn get_first_empty(&self) -> Option<(usize, usize)> {
        for row in 0..SIZE {
            for col in 0..SIZE {
                if self.grid[row][col] == ' ' {
                    return Some((row, col));
                }
            }
        }

        None
    }
}

fn get_words() -> HashSet<String> {
    let file_path = "../xwords_data/2007_to_2018.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();
    let mut words = HashSet::new();

    for result in results.records() {
        let record = result.expect("a CSV record");
        let word = record[2].to_string();

        if word.len() == SIZE && word.chars().all(char::is_alphabetic) {
            words.insert(word.to_ascii_uppercase());
        }
    }

    words
}

fn insert_horizontal(xword: &mut XWord) -> bool {
    true
}

// returns true if it succeeded false if not
fn generate_xword(original_xword: &mut XWord) -> Option<XWord> {
    let xword = original_xword.clone();

    Some(xword)

    // for i in 0..SIZE {
    //     // insert horizontal

    //     // insert vertical
    // }

    // get the first empty position
    // get what is at that position across eg. _ _ B _ _
    // find list of words that would fit there
}

fn main() {
    let words = get_words();
    println!("{:?}", words);

    let mut xWord = XWord::new();

    generate_xword(&mut xWord);

    return ();
}
