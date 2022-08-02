import { createShortcut } from "@solid-primitives/keyboard";
import {
  For,
  Show,
  Component,
  createEffect,
  createSignal,
  onCleanup,
  createMemo,
} from "solid-js";
import { End } from "./end";
import { shuffle } from "../utils/shuffle";
import { Direction } from "../types/direction";
import { matrixAsArray } from "../libs/matrix";
import { moveSnake } from "../libs/move-snake";
import { isArrayIncludesArray, isArraysEqual } from "../utils/array";
import { exclude } from "../utils/exclude";

const Game: Component = () => {
  const [fail, setFail] = createSignal<boolean>(false);
  const [score, setScore] = createSignal<number>(0);
  const [apple, setApple] = createSignal<[number, number] | null>();
  const [snake, setSnake] = createSignal<[number, number][]>([[7, 7]]);
  const [direction, setDirection] = createSignal<Direction>("none");

  const snakeHead = createMemo(() => snake()[0]);

  createShortcut(["ArrowUp"], () => setDirection("up"));
  createShortcut(["ArrowDown"], () => setDirection("down"));
  createShortcut(["ArrowLeft"], () => setDirection("left"));
  createShortcut(["ArrowRight"], () => setDirection("right"));

  const reset = () => {
    setDirection("none");
    setApple(null);
    setSnake([[5, 5]]);
    setFail(false);
  };

  const addApple = () => {
    const candidates = shuffle(exclude(matrixAsArray, snake()));
    setApple(candidates[0]);
  };

  const move = () => {
    if (direction() === "none") return;

    const isEat = isArraysEqual(apple(), snakeHead());

    setSnake((prev) => moveSnake(prev, direction(), isEat));

    if (isEat) {
      setScore((prev) => prev + 1);
      addApple();
    }
  };

  createEffect(() => {
    const [head, ...tail] = snake();
    const [row, col] = head;
    const isOutbounds = row < 0 || row > 15 || col < 0 || col > 15;
    const isEatSelf = isArrayIncludesArray(tail, head);
    if (isOutbounds || isEatSelf) setFail(true);
  });

  const getCellClass = (cell: [number, number]) => {
    if (isArrayIncludesArray(snake(), cell)) {
      if (isArraysEqual(snakeHead(), cell)) return "bg-lime-500 rounded-sm";
      return "bg-lime-600 rounded-sm";
    }
    if (isArraysEqual(apple(), cell)) return "bg-red-500/90 rounded-lg";
    return "bg-lime-700";
  };

  const interval = setInterval(() => {
    if (!apple()) addApple();
    if (!fail()) move();
  }, 400);

  onCleanup(() => clearInterval(interval));

  return (
    <div class="bg-lime-900 h-screen w-screen absolute inset-0 flex items-center justify-center">
      <div class="w-80 scale-150 relative rounded overflow-hidden">
        <div class="flex w-full justify-between text-white/50">
          <div>Snake</div>
          <div>{score()}</div>
        </div>
        <div class="w-80 h-80 bg-lime-700 flex flex-wrap">
          <For each={matrixAsArray}>
            {(cell) => (
              <div class={`w-5 h-5 flex relative ${getCellClass(cell)}`} />
            )}
          </For>
          <Show when={fail()}>
            <End score={score()} reset={reset} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Game;
