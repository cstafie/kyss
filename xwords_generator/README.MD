# Crossword Generator

takes crossword data from `xwords_data` directory and tries to generate crosswords

## TODO

- fill in grids of all shapes and sizes (Q: where do we get those grids?)
- load words of all lengths

## Possible Optimizations

- rewrite `get_matching_words` to use binary search (think I prefer this since we can continue to use String)
- OR
- use Vec<u8> instead of String and continue with tries
