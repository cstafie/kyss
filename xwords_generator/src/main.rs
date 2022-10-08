use std::{
    collections::{HashMap, HashSet},
    str,
};

#[derive(Clone, Debug)]
struct XWord {
    grid: Vec<Vec<char>>,
    pub width: usize,
    pub height: usize,
}

impl XWord {
    pub fn new(width: usize, height: usize) -> Self {
        Self {
            grid: vec![vec![' '; width]; height],
            width,
            height,
        }
    }

    pub fn get_across(&self, row: usize, col: usize) -> String {
        (col..self.width)
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
        (row..self.height)
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

fn insert_vertical(
    xword: &mut XWord,
    col: usize,
    words_vec: &Vec<String>,
    used_words: &mut HashSet<String>,
) {
    let entry = &xword.get_down(0, col);
    let words = get_matching_words(words_vec, entry);

    if col == xword.width - 1 && !used_words.contains(entry) {
        if let Ok(_i) = words_vec.binary_search(entry) {
            // we found a solution!
            println!("{:?}", xword);
            return;
        }
    }

    for word in words {
        if used_words.contains(word) {
            continue;
        }

        let used_word: String = word.chars().collect();
        xword.set_down(0, col, &used_word);
        used_words.insert(used_word);

        // move to the next iteration
        insert_horizontal(xword, col + 1, words_vec, used_words);

        // reset the xword
        xword.set_down(0, col, &format!("{:height$}", entry, height = xword.height));
        used_words.remove(&word.chars().collect::<String>());
    }
}

fn insert_horizontal(
    xword: &mut XWord,
    row: usize,
    words_vec: &Vec<String>,
    used_words: &mut HashSet<String>,
) {
    let entry = &xword.get_across(row, 0);
    let words = get_matching_words(words_vec, entry);

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

        insert_vertical(xword, row, words_vec, used_words);

        // reset the xword
        xword.set_across(row, 0, &format!("{:width$}", entry, width = xword.width));
        used_words.remove(&word.chars().collect::<String>());
    }
}

fn main() {
    let height = 3;
    let width = 3;

    let words = get_words(1, 300);

    let mut xword = XWord::new(width, height);

    insert_horizontal(
        &mut xword,
        0,
        words.get(&width).unwrap(),
        &mut HashSet::new(),
    );

    println!("{:?}", xword);
}
