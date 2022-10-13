use std::{
    cmp,
    collections::{HashMap, HashSet},
    str,
};

#[derive(Debug)]
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

impl XWord {
    pub fn new(width: usize, height: usize, blocks: Vec<(usize, usize)>) -> Self {
        let mut grid = vec![vec![' '; width]; height];

        for (col, row) in blocks {
            grid[col][row] = '!';
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

fn get_word_data(min_word_len: usize, max_word_len: usize) -> HashMap<usize, Vec<(String, i32)>> {
    let file_path = "../xwords_data/1976_to_2018.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();

    let mut word_frequency: HashMap<String, i32> = HashMap::new();

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
        }
    }

    let mut word_frequency_vector: Vec<(String, i32)> = word_frequency.into_iter().collect();
    word_frequency_vector.sort_by(|(word_a, _), (word_b, _)| word_a.cmp(word_b));

    let mut words_map: HashMap<usize, Vec<(String, i32)>> = HashMap::new();

    for (word, frequency) in word_frequency_vector.into_iter() {
        words_map
            .entry(word.len())
            .and_modify(|word_vec| word_vec.push((word.clone(), frequency)))
            .or_insert(vec![(word, frequency)]);
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
        if xword.grid[row][col] == '!' {
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
        if xword.grid[row][col] == '!' {
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

fn get_matching_words<'a>(
    words_vec: &'a Vec<(String, i32)>,
    entry: &String,
) -> &'a [(String, i32)] {
    if entry.is_empty() {
        return words_vec;
    }

    return match words_vec.binary_search_by(|(word, _)| word.cmp(entry)) {
        Ok(start) => &words_vec[start..=start],
        Err(start) => {
            let mut end_string = entry.to_string();
            end_string.push('Z');
            return match words_vec.binary_search_by(|(word, _)| word.cmp(entry)) {
                Ok(end) => &words_vec[start..end],
                Err(end) => &words_vec[start..end],
            };
        }
    };
}

fn generate_xwords(
    xword: &mut XWord,
    entries: &Vec<XWordEntry>,
    entry_index: usize,
    words_map: &HashMap<usize, Vec<(String, i32)>>,
    used_words: &mut HashSet<String>,
) {
    let entry = &entries[entry_index];
    let old_entry_string = xword.get_entry(&entry);
    let words_vec = words_map.get(&entry.length).unwrap();
    let mut matching_words = slice_to_vec(get_matching_words(words_vec, &old_entry_string));

    matching_words.sort_by(|(_, freq_a), (_, freq_b)| freq_a.cmp(freq_b));

    for (i, (word, _)) in matching_words.iter().enumerate() {
        if entry_index == 0 {
            println!("{}% {}", i * 100 / matching_words.len(), word);
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
    let height = 5;
    let width = 5;

    // rn the longest word is 21 will probably not need words that long
    let words_map = get_word_data(3, 30);

    let height = 7;
    let width = 7;

    let mut xword = XWord::new(width, height, vec![(3, 3)]);

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

    #[test]
    fn it_should_get_and_set_entry_across() {
        let direction = Direction::Across;

        let width = 3;
        let height = 4;
        let mut xword = XWord::new(width, height, vec![]);

        let xword_entry = XWordEntry {
            row: 0,
            col: 0,
            length: width,
            direction,
        };

        assert_eq!(xword.get_entry(&xword_entry), "");
        xword.set_entry(&xword_entry, "123");

        // get twice to make sure get is non destructive
        assert_eq!(xword.get_entry(&xword_entry), "123");
        assert_eq!(xword.get_entry(&xword_entry), "123");
    }

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
