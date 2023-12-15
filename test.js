
function lilysHomework(arr) {
  // Write your code here
  let count = 0;
  let min = 1000;
  let minIndex = 0;
  
  console.log(arr)

  for (let k = 1; k < arr.length; k++){
    // console.log(arr[k - 1], ">", arr[k])
      if (arr[k - 1] > arr[k]){

          for (let i = 0; i < arr.length; i++){
             if (arr[i] < min) {
                  min = arr[i];
                  minIndex = i;
              }
          }

          let temp = arr[count];
          arr[count] = arr[minIndex];
          arr[minIndex] = temp;
          count++;
          k = count + 1;

      }   

    console.log(arr)

  }

  return count;
  
}

// console.log(lilysHomework([2, 5, 3, 1]))
console.log(lilysHomework([3, 4, 2, 5, 1]))
// 3, 4, 2, 5, 1
// 1, 4, 2, 5, 3
// 1, 2, 4, 5, 3
// 1, 2, 3, 5, 4
// 1, 2, 3, 4, 5