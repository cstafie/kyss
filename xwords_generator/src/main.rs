use csv;

use std::collections::HashSet;

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

    pub fn get_across(&self, row: usize, col: usize) -> Vec<char> {
        (col..SIZE).map(|i| self.grid[row][i]).collect()
    }
    pub fn set_across(&mut self, row: usize, col: usize, word: Vec<char>) {
        for i in 0..word.len() {
            self.grid[row][col + i] = word[i];
        }
    }

    pub fn get_down(&self, row: usize, col: usize) -> Vec<char> {
        (row..SIZE).map(|i| self.grid[i][col]).collect()
    }
    pub fn set_down(&mut self, row: usize, col: usize, word: Vec<char>) {
        for i in 0..word.len() {
            self.grid[row + i][col] = word[i];
        }
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

    // pub fn to_string(&self) -> String {
    //     (0..SIZE).fold(String::new(), |acc: String, row| {
    //         acc + &self.get_across(row, 0).join("") + "\n"
    //     })
    // }
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

fn check_word_fit(word: &String, entry: &Vec<char>) -> bool {
    // let mut entry_chars = entry.chars();

    for (i, char) in word.chars().enumerate() {
        // if let Some(entry_char) = entry_chars.nth(i) {

        let entry_char = entry[i];

        if entry_char != char && entry_char != ' ' {
            return false;
        }
        // }
    }

    return true;
}

fn insert_vertical(xword: &mut XWord, col: usize, words: &HashSet<String>) {
    for word in words {
        let entry = xword.get_down(0, col);

        if check_word_fit(&word, &entry) {
            xword.set_down(0, col, word.chars().collect());

            if (col == SIZE - 1) {
                // we found a solution!
                println!("{:?}", xword);

                // reset the xword
                xword.set_down(0, col, entry);

                // there will be no other solution at this point
                break;
            }

            // move to the next iteration
            insert_horizontal(xword, col + 1, words);

            // reset the xword
            xword.set_down(0, col, entry);
        }
    }
}

fn insert_horizontal(xword: &mut XWord, row: usize, words: &HashSet<String>) {
    for word in words {
        let entry = xword.get_across(row, 0);

        if check_word_fit(&word, &entry) {
            xword.set_across(row, 0, word.chars().collect());

            insert_vertical(xword, row, words);

            // reset the xword
            xword.set_across(row, 0, entry);
        }
    }
}

fn main() {
    let words = get_words();
    // println!("{:?}", words);

    let mut xword = XWord::new();

    insert_horizontal(&mut xword, 0, &words);

    println!("{:?}", xword);
}
