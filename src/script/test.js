/* algebra.js
var Fraction = algebra.Fraction;
var Expression = algebra.Expression;
var Equation = algebra.Equation;

var eq = new Equation(
  algebra.parse("10 * x"),
  algebra.parse("5  * y")
);
console.log("x = " + eq.solveFor("x").toString());
console.log("y = " + eq.solveFor("y").toString());
*/
