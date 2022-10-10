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
    entries: &Vec<XWordEntry>,
    entry_index: usize,
    words_map: &HashMap<usize, Vec<String>>,
    used_words: &mut HashSet<String>,
) {
    let entry = &entries[entry_index];
    let old_entry_string = xword.get_entry(&entry);
    let words_vec = words_map.get(&entry.length).unwrap();
    let matching_words = get_matching_words(words_vec, &old_entry_string);

    for (i, word) in matching_words.iter().enumerate() {
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

    let words_map = get_words(1, 300);

    // TODO: the empty crossword should be given some kind of grid, for now it's just a width and height
    let mut xword = XWord::new(width, height);

    let entries = get_xword_entries(&xword);

    println!("{:?}", entries);

    generate_xwords(&mut xword, &entries, 0, &words_map, &mut HashSet::new());

    // insert_horizontal(
    //     &mut xword,
    //     0,
    //     words.get(&width).unwrap(),
    //     &mut HashSet::new(),
    // );

    println!("{:?}", xword);
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn it_should_get_and_set_entry_down() {
        let direction = Direction::Down;

        let width = 3;
        let height = 4;
        let mut xword = XWord::new(width, height);

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
        let mut xword = XWord::new(width, height);

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
        let xword = XWord::new(width, height);

        assert_eq!(xword.grid.len(), height);

        for row in xword.grid {
            assert_eq!(row.len(), width);
        }

        assert_eq!(xword.height, height);
        assert_eq!(xword.width, width);
    }
}
