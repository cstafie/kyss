import { TILE_BAR_SIZE, SCORE_INCREASE, SCORE_DECREASE } from "shared";
import Emoji from "@/components/emoji";

function Instructions() {
  return (
    <section className="w-full flex justify-center ">
      <div className="max-w-screen-md px-6">
        <h2 className="py-4">INSTRUCTIONS</h2>
        <p>
          The goal of the game is to fill out the crossword, but there's a
          catch! You can only use the {TILE_BAR_SIZE} letters provided to you in
          your tile bar. Every{" "}
          <strong className="text-green-600">correctly</strong> placed letter is{" "}
          <strong className="text-green-600">+{SCORE_INCREASE}</strong> points,
          and every <strong className="text-red-500">incorrectly</strong> placed
          letter is <strong className="text-red-500"> {SCORE_DECREASE}</strong>{" "}
          points. You can play by yourself, with friends, or with bots!
        </p>
        <h3 className="py-4">CONTROLS</h3>
        <ul>
          <li className="flex justify-between bg-slate-800 p-2 my-2">
            <div>Arrow Keys</div>
            <div className="text-right">Change the currently selected cell</div>
          </li>
          <li className="flex  justify-between bg-slate-800 p-2 my-2">
            <div>Tab</div>
            <div className="text-right">Next clue</div>
          </li>
          <li className="flex  justify-between bg-slate-800 p-2 my-2">
            <div>Shift + Tab</div>
            <div className="text-right">Previous clue</div>
          </li>
          <li className="flex  justify-between bg-slate-800 p-2 my-2">
            <div>Space</div>
            <div className="text-right">Switch between Across and Down</div>
          </li>
        </ul>

        <h3 className="mt-8 mb-2">LETTER ENTRY</h3>
        <p> You can place letters in the puzzle in 3 different ways: </p>
        <ul>
          <li className="p-2">
            <Emoji description="Keyboard">⌨️</Emoji> <strong>Typing:</strong>{" "}
            Type directly into the currently selected cell. It's fast and
            simple; however, it's not supported on mobile.
          </li>
          <li className="p-2">
            <Emoji description="Mouse">🖱️</Emoji>{" "}
            <strong>Drag and Drop:</strong> Drag and drop letters from your tile
            bar onto the crossword.
          </li>{" "}
          <li className="p-2">
            <Emoji description="Up pointing backhand">👆</Emoji>{" "}
            <strong>Tapping / Clicking:</strong> Tap or click a letter from your
            tile bar to select it, then click on a cell in the crossword to
            place it.
          </li>
        </ul>
      </div>
    </section>
  );
}

export default Instructions;
