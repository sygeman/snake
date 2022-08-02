export const toId = (item: [number, number]) => `${item[0]}:${item[1]}`;
export const toIds = (arr: [number, number][]): string[] => arr.map(toId);
