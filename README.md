# xword game

## alpha release

1. domain and SSL
2. refactor server (server / game manager and event driven)
3. polish bot
4. add tap to play interface for mobile (will probably work on web too)
5. instructions on how to play (potentially in a menu)
6. destroy stale games logic

---

6. modal for game name / settings

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
