# xword game

## bot

- how strong should the bot be?

  - bot could play every 1-3, 4-6, 10-12 seconds (vary this with difficulty)
    - maybe this can change based on % of the board filled
  - bot could play incorrectly %30, %15, %0

    - maybe this can change based on % of the board filled

  - ui

## todo

- cleaner container deployment
- write docker commands corresponding to the docker compose (may also need to edit image export ports)
- domain
- setup ssl and whatnot
- tests?
- redo socket comms

### game

- remove duplicate words

### overall

- fix user connected to multiple games issue

- think about whole system holistically and rename / redesign parts for it to be more maintainable

- address todos in code
- design and implement a routing strategy

- env variables
- auto deploy?

- filter out bad clues

### front-end

- add mobile view

### back-end

- setup a db
- store generated xwords in db
- store word / clue data in db
- transfer existing systems to query db
