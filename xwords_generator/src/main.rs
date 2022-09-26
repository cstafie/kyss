use csv;

fn main() {
    let file_path = "../xwords_data/2017.csv";
    let mut results = csv::Reader::from_path(file_path).unwrap();
    let mut five_letter_words = vec![];

    for result in results.records() {
        let record = result.expect("a CSV record");
        let word = record[2].to_string();

        if word.len() == 5 && !word.contains(" ") {
            println!("{:?}", word);
            five_letter_words.push(word);
        }
    }

    return ();
}
