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

const moveSnake = (snake: [number, number][], direction: Direction) => {
  switch (direction) {
    case "up":
      return snake.map(([row, col]) => [row - 1, col] as [number, number]);
    case "down":
      return snake.map(([row, col]) => [row + 1, col] as [number, number]);
    case "left":
      return snake.map(([row, col]) => [row, col - 1] as [number, number]);
    case "right":
      return snake.map(([row, col]) => [row, col + 1] as [number, number]);
  }

  return snake;
};

const Gold = () => <div class="flex absolute w-5 h-5 bg-yellow-500" />;
const SnakeHead = () => <div class="flex absolute w-5 h-5 bg-slate-700" />;
const Snake = () => <div class="flex absolute w-5 h-5 bg-slate-800" />;

const App: Component = () => {
  const [fail, setFail] = createSignal<boolean>(false);
  const [direction, setDirection] = createSignal<Direction>("none");
  const [gold, setGold] = createSignal<[number, number] | null>([3, 3]);
  const [snake, setSnake] = createSignal<[number, number][]>([[5, 5]]);

  const goldAsId = createMemo(() => {
    const g = gold();
    return g && toId(g);
  });

  const snakeAsIds = createMemo(() => toIds(snake()));

  createShortcut(["ArrowUp"], () => setDirection("up"));
  createShortcut(["ArrowDown"], () => setDirection("down"));
  createShortcut(["ArrowLeft"], () => setDirection("left"));
  createShortcut(["ArrowRight"], () => setDirection("right"));

  const reset = () => {
    setDirection("none");
    setGold([3, 3]);
    setSnake([[5, 5]]);
    setFail(false);
  };

  const move = () => {
    if (["up", "down", "left", "right"].includes(direction())) {
      setSnake((prev) => moveSnake(prev, direction()));
    }
  };

  const growth = () => {
    setSnake((prev) => {
      const [row, col] = prev[prev.length - 1];
      return [...prev, [row, col + 1]];
    });
  };

  const addGold = () => {
    const candidates = shuffle(
      matrixIds.filter((id) => !toIds(snake()).includes(id))
    );
    const first = candidates[0].split(":").map((s) => parseInt(s, 10)) as [
      number,
      number
    ];

    setGold(first);
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
      reset();
    }
  });

  // Eat
  createEffect(() => {
    const goldPosition = gold();
    const snakeHead = snake()[0];

    if (
      goldPosition &&
      goldPosition[0] === snakeHead[0] &&
      goldPosition[1] === snakeHead[1]
    ) {
      setGold(null);
      growth();
    }
  });

  const interval = setInterval(() => {
    if (!gold()) addGold();
    if (!fail()) move();
  }, 500);

  onCleanup(() => clearInterval(interval));

  return (
    <div class="bg-lime-900 h-screen w-screen absolute inset-0 flex items-center justify-center">
      <div class="w-80 scale-150">
        <div class="text-white/50">{direction}</div>
        <div class="w-80 h-80 bg-lime-800 flex flex-wrap">
          <For each={matrix}>
            {(cols) => (
              <For each={cols}>
                {(col) => (
                  <div class="w-5 h-5 bg-lime-700 flex relative">
                    <Show when={goldAsId() === col}>
                      <Gold />
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
        </div>
      </div>
    </div>
  );
};

export default App;
