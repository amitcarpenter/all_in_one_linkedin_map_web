function test(item, kya) {
    this.same = "ehel"
  console.log(`${item}!  hello ${this.name} `);
}



const hello = { name: "amit" };

console.log(test.prototype)

const testreturn = test.bind(hello, "Good Mornign ");
testreturn();
