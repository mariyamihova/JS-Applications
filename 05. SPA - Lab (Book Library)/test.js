var foo = {n: 1};
console.log(foo);
var bar = foo;
console.log(bar);
foo.x = foo = {n: 2};
console.log(foo);