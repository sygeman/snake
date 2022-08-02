import { createShortcut } from "@solid-primitives/keyboard";
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { Apple } from "./apple";
import { End } from "./end";
import { Snake } from "./snake";
import { SnakeHead } from "./snake-head";
import { shuffle } from "../utils/shuffle";
import { Direction } from "../types/direction";
import { matrix, matrixIds } from "../libs/matrix";
import { moveSnake } from "../libs/move-snake";
import { toId, toIds } from "../libs/to-id";

const Game: Component = () => {
  const [fail, setFail] = createSignal<boolean>(false);
  const [score, setScore] = createSignal<number>(0);
  const [apple, setApple] = createSignal<[number, number] | null>();
  const [snake, setSnake] = createSignal<[number, number][]>([[7, 7]]);
  const [direction, setDirection] = createSignal<Direction>("none");

  const snakeAsIds = createMemo(() => toIds(snake()));
  const appleAsId = createMemo(() => {
    const g = apple();
    return g && toId(g);
  });

  createShortcut(["ArrowUp"], () => setDirection("up"));
  createShortcut(["ArrowDown"], () => setDirection("down"));
  createShortcut(["ArrowLeft"], () => setDirection("left"));
  createShortcut(["ArrowRight"], () => setDirection("right"));

  const reset = () => {
    setDirection("none");
    setApple([3, 3]);
    setSnake([[5, 5]]);
    setFail(false);
  };

  const move = () => {
    if (["up", "down", "left", "right"].includes(direction())) {
      const applePosition = apple();
      const snakeHead = snake()[0];
      const isEat = !!(
        applePosition &&
        applePosition[0] === snakeHead[0] &&
        applePosition[1] === snakeHead[1]
      );

      setSnake((prev) => moveSnake(prev, direction(), isEat));
      if (isEat) {
        setScore((prev) => prev + 1);
        addApple();
      }
    }
  };

  const addApple = () => {
    const candidates = shuffle(
      matrixIds.filter((id) => !toIds(snake()).includes(id))
    );
    const first = candidates[0].split(":").map((s) => parseInt(s, 10)) as [
      number,
      number
    ];

    setApple(first);
  };

  createEffect(() => {
    const [head, ...tail] = snake();
    const row = head[0];
    const col = head[1];
    const isOutbounds = row < 0 || row > 15 || col < 0 || col > 15;
    const isEatSelf = !!tail.find((pos) => row === pos[0] && col === pos[1]);

    if (isOutbounds || isEatSelf) {
      setFail(true);
    }
  });

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
        <div class="w-80 h-80 bg-lime-800 flex flex-wrap">
          <For each={matrix}>
            {(cols) => (
              <For each={cols}>
                {(col) => (
                  <div class="w-5 h-5 bg-lime-700 flex relative">
                    <Show when={appleAsId() === col}>
                      <Apple />
                    </Show>
                    <Show when={snakeAsIds().includes(col)}>
                      <Show when={snakeAsIds()[0] === col}>
                        <SnakeHead />
                      </Show>
                      <Show when={snakeAsIds()[0] !== col}>
                        <Snake />
                      </Show>
                    </Show>
                  </div>
                )}
              </For>
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
