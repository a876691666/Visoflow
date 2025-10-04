import { updateState } from 'src/utils/reactivity';

const createItem = (x: number, y: number) => {
  return {
    x,
    y
  };
};

// Although we don't normally test third party libraries,
// this is useful to explore the behaviour of reactivity
describe('Tests reactivity', () => {
  test('Array equivalence without updateState', () => {
    const arr = [createItem(0, 0), createItem(1, 1)];
    const newArr = [createItem(0, 0), createItem(2, 2)];

    expect(arr[0]).not.toBe(newArr[0]);
  });

  test('Array equivalence with updateState', () => {
    const arr = [createItem(0, 0), createItem(1, 1)];
    const newArr = updateState(arr, (draft) => {
      draft[1] = createItem(2, 2);
    });

    expect(arr[0]).toBe(newArr[0]);
  });
});
