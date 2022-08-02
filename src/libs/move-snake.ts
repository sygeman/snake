import { Direction } from "../types/direction";

export const moveSnake = (
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
