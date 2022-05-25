import lexer from "./lexer.js";
import parser from "./parser.js";
import execute from "./eval.js";

const lex = lexer(`(6)+(5)`);
const parse = parser(lex);
const evaluator = execute(parse);

//console.log(parse);

for (let i = 0; i < evaluator.length; i++) {
     console.log(evaluator[i]);
}