// 数组随机排序
exports.reSort = (arr) => {
  let length = arr.length
  let index
  let temp
  while (length > 0) {
    index = Math.floor(Math.random()*length)
    temp = arr[length-1]
    arr[length-1] = arr[index]
    arr[index] = temp
    length--
  }
  return arr
}
