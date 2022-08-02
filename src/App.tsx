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
import { shuffle } from "./shuffle";

type Direction = "up" | "down" | "left" | "right" | "none";

const toId = (item: [number, number]) => `${item[0]}:${item[1]}`;
const toIds = (arr: [number, number][]): string[] => arr.map(toId);

const array16 = Array.from(new Array(16));

const createMatrix = () =>
  array16.map((_row, rowIndex) =>
    array16.map((_col, colIndex) => `${rowIndex}:${colIndex}`)
  );

const matrix = createMatrix();
let matrixIds: string[] = [];
matrix.forEach((cols) => cols.forEach((col) => matrixIds.push(col)));

const moveSnake = (
  snake: [number, number][],
  direction: Direction,
  growth: boolean
) => {
  const [head] = snake;
  let newSnake: [number, number][] = [];

  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      switch (direction) {
        case "up":
          newSnake.push([head[0] - 1, head[1]]);
          break;
        case "down":
          newSnake.push([head[0] + 1, head[1]]);
          break;
        case "left":
          newSnake.push([head[0], head[1] - 1]);
          break;
        case "right":
          newSnake.push([head[0], head[1] + 1]);
          break;
      }
    } else {
      newSnake.push(snake[i - 1]);
    }
  }

  if (growth) {
    newSnake.push(snake[snake.length - 1]);
  }

  return newSnake;
};

const Apple = () => (
  <div class="flex absolute w-5 h-5 bg-red-500/90 rounded-lg" />
);
const SnakeHead = () => (
  <div class="flex absolute w-5 h-5 bg-lime-500 rounded-sm" />
);
const Snake = () => (
  <div class="flex absolute w-5 h-5 bg-lime-600 rounded-sm" />
);

const App: Component = () => {
  const [fail, setFail] = createSignal<boolean>(false);
  const [score, setScore] = createSignal<number>(0);
  const [direction, setDirection] = createSignal<Direction>("none");
  const [apple, setApple] = createSignal<[number, number] | null>();
  const [snake, setSnake] = createSignal<[number, number][]>([[7, 7]]);

  const appleAsId = createMemo(() => {
    const g = apple();
    return g && toId(g);
  });

  const snakeAsIds = createMemo(() => toIds(snake()));

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

  // Validate snake position
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
            <div class="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-lime-800 text-white/50 font-medium">
              <div class="text-xl text-white">Nice try!</div>
              <div class="mt-1">Score: {score}</div>
              <button
                class="bg-lime-700 hover:bg-lime-600 text-white/80 rounded mt-2 px-2"
                onClick={() => reset()}
              >
                Retry
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default App;
