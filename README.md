# Writing an interpreter in TypeScript

Interpreter for **Monkey** programming language. Based on book "Writing an Interpreter in Go" by Thorsten Ball.

To run tests use command `npm run test`.

To run REPL use command `npm run repl`.

## About

**Monkey** has:

-   C-like syntax
-   variable bindings
-   integers and booleans
-   arithmetic expressions
-   built-in functions
-   first-class and higher-order functions
-   closures
-   a string data structure
-   an array data structure
-   a map data structure

It utilizes JavaScript's garbage collector.

REPL evaluates one line at a time.

### Sample code

Variable binding:

```
let age = 1;
let name = "Monkey";
let result = 10 * (20 / 2);
```

Arrays and maps:

```
let myArray = [1, 2, 3];
let dynamicKey = "country";
let myMap = {"name": "Maciej", "age": 25, dynamicKey: "Poland", 47: [], true: 42};

myArray[0]; // => 1
myMap["name"]; // => "Maciej"
```

Functions:

```
let add = fn(a, b) { return a + b; };

// implicit return
let multiply = fn(a, b) { a * b; };

// calling functions
add(1, 2);

// recursive functions
let fibonacci = fn(x) {
    if (x == 0) {
        0
    } else {
        if (x == 1) {
            1
        } else {
            fibonacci(x - 1) + fibonacci(x - 2);
        }
    }
};

// higher order functions
let twice = fn(f, x) {
    return f(f(x));
}
let addTwo = fn(x) {
    return x + 2;
}

twice(addTwo, 2); // => 6

// closures and functions as first class citizen
let adder = fn(x) { fn(y) { x + y } };
let addThree = adder(3);
addThree(4); // => 7
```

String operations:

```
let a = "hello";
let b = a + " world"; // => "hello world"
let c = "how do you do? " * 2; "how do you do? how do you do? "
```

Comparison:

```
let a = if (5 > 4) { 1 } else { 0 }; // => 1
let b = if (rest([]) != null) { 1 } else { 0 }; // => 0
```

Truthy and falsy values:

```
let testTruthy(v) { if (!!v) { true } else { false }};

testTruthy(1); // => true
testTruthy("hello"); // => true
testTruthy([]); // => true
testTruthy([1, -2, 3]); // => true
testTruthy({}); // => true
testTruthy({"name": "Joe"}); // => true
testTruthy(0); // => false
testTruthy(""); // => false
testTruthy(null); // => false
```

Builtin functions:

```
len(""); // => 0
len("hello"); // => 5
len([]); // => 0
len([1, 2, 3]); // => 3

first([]); // => null
first([1, 2, 3]); // => 1

last([]); // => null
last([1, 2, 3]); // => 3

rest([]); // => null
rest([1]); // => []
rest([1, 2, 3]); // => [2, 3]
rest(rest([1, 2, 3])); // => [3]

// push return a copy of the array with additional element being the last one
let a = push([], 1); // => [1]
let b = push(a, 2); // => [1, 2]

puts("Hello World!"); // prints given argument to the console (and returns null)
```

Cool array functions that are possible:

```
let map = fn(arr, f) {
    let iter = fn(arr, accumulated) {
        if (len(arr) == 0) {
            accumulated;
        } else {
            iter(rest(arr), push(accumulated, f(first(arr))));
        }
    };

    iter(arr, []);
};

let reduce = fn(arr, initial, f) {
    let iter = fn(arr, result) {
        if (len(arr) == 0) {
            result;
        } else {
            iter(rest(arr), f(result, first(arr)));
        }
    };

    iter(arr, initial);
};

let sum = fn(arr) {
    reduce(arr, 0, fn(initial, el) { initial + el });
};
```

## Next steps:

-   Chapter 5 of the book (macros)
-   Implement the interpreter in other languages (Go + more)
-   Write a compiler

## Changes:

Functional changes compared to original implementation from the book:

-   explicit null expression
-   null, 0 and "" as falsy values
-   string multiplication
-   string comparison
