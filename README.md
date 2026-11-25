# Golden Wok — Dapur Kilat

A fast, original wok-kitchen game. You are the chef of a small warung kitchen:
grab ingredients, chop them, wok them, plate the dish, and serve it before the
customer loses patience. Orders pile up, the rush hour hits, and combos pay.

## Play

Serve it locally with any static server from the repo root, for example:

```
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in desktop Chrome.

## Controls

- Move: WASD or arrow keys (or click the floor to walk there)
- Interact: E or Space (pick up, chop, cook, plate, serve)
- Press E repeatedly at a chopping board to chop
- Click a station while standing next to it to interact with it
- P pause, M mute, R restart after game over

## Rules

- Every order lists the dish and its patience bar. Serve the right dish before
  the bar runs out.
- Some ingredients must be chopped before the wok, some cook in the wok, and
  sauce and chilli go straight on the plate.
- Food left in the wok too long burns. Throw it in the trash and start again.
- Serve dishes in a row to build a combo and earn bigger tips.
- The shift lasts 3 minutes. The last minute is rush hour: orders come faster
  and patience runs shorter.
- Lose all 3 hearts (expired orders) and the shift ends early.
