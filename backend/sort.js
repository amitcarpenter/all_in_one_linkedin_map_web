// data = [-10, -20, 90, 100, 30, 120, 70];

// function sortarray(arr) {
//   for (let i = 0; i < arr.length; i++) {
//     for (let j = 0; j < arr.length - 1 - i; j++) {
//       if (arr[j] > arr[j + 1]) {
//         temp = arr[j];
//         arr[j] = arr[j + 1];
//         arr[j + 1] = temp;
//       }
//     }
//   }
// }

// sortarray(data);
// // console.log(data);

// let array = [123, [23, 46], 4, 5, [5, 6, 7, [87, [123, 2], 6]]];

// function recursion(arr) {
//   arr.flatMap((a) => {
//     if (Array.isArray(a)) {
//       recursion(arr);
//     }
//     return a;
//   });
// }
// // recursion(array);
// // console.log(array);

const array = [123, [23, 46], 4, 5, [5, 6, 7, [87, 6]]];

// Recursive function to flatten the array
function flattenArray(arr) {
  return arr.reduce((flatArray, element) => {
    console.log(element);
    // console.log(flatArray);
    return flatArray.concat(
      Array.isArray(element) ? flattenArray(element) : element
    );
  }, []);
}

// Flatten the array
const flatArray = flattenArray(array);

// Find the lowest value
const lowestValue = Math.min(...flatArray);

console.log("Flattened Array:", flatArray);
console.log("Lowest Value:", lowestValue);
