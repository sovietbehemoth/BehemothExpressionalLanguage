

function literal(node) {
    switch (node.type) {
        case "operator": return node.literal;
        case "identifier": return node.value;
        case "number": return `${node.value}`;
        default: return "";
    }
}

function add(lval, rval) {

    if (lval.type === "identifier" || rval.type === "identifier") {
        return {
            type: "identifier",
            id: `${literal(lval)}${literal(rval)}`
        };
    } else if (lval.type === "string" || rval.type === "string") {
        return {
            type: "string",
            object: `${literal(lval)}${literal(rval)}`,
        };
    } else if (lval.type === "number" && rval.type === "number") {
        return {
            type: "number",
            value: lval.value + rval.value
        };
    } else if (lval.type === "none" || rval.type === "none") {
        if (lval.type === "none" && rval.type === "none") {
            return {
                type: "none"
            };
        }
        return {
            type: "number",
            value: lval.type === "none" ? rval.value : lval.value
        };
    } else return {
        type: "none"
    };
}

function pow(lval, rval) {

    if (lval.type === "number" && rval.type === "number") {
        return {
            type: "number",
            value: Math.pow(lval.value, rval.value)
        };
    } else {
        console.error(`Error: ${lval.type} and ${rval.type} are incompatible in exponential expression.`);
        Deno.exit(1);
    }
}

function arithmetic(evaluator, operation) {
    let expr = []

    const preassert = (i, op) => {
        if (evaluator[i]?.literal === op) {
            console.error(`Error: ${op} operator expects left-hand operand.`);
            Deno.exit(1);
        }
    }

    const postassert = (i, rval) => {
        if (evaluator[i+2]?.type === "operator") {
            console.error(`Error: unexpected ${evaluator[i+2]?.literal}.`);
            Deno.exit(1);
        } else if (!rval) {
            console.error(`Error: ${operation} operator expects right-hand operand.`);
            Deno.exit(1);
        }
    }


    for (let i = 0; i < evaluator.length; i++) {
        const node = evaluator[i+1];

        if (i === 0) preassert(i, operation);

        if (!node) {
            expr.push(evaluator[i]);
            continue;
        }
    
        if (node.type === "operator" && node.literal === operation) {
            const lval = evaluator[i];
            const rval = evaluator[i+2];

            postassert(i, rval);

            let res;

            switch (operation) {
                case "+": res = add(lval, rval); break;
                case "^": res = pow(lval, rval); break;
            }

            expr.push(res);
            i += 2;
        } else expr.push(evaluator[i]);
    }
    

    return expr;
}

function execute(tree) {
    if (tree.length === 0) {
        return [{
            type: "none"
        }];
    }

    let evaluator = tree;
    let paren = [];

    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.type === "parenthesis") {
            paren.push(execute(node.object)[0]);
        } else paren.push(node);
    } evaluator = paren;

    evaluator = arithmetic(evaluator, "^"); 
    evaluator = arithmetic(evaluator, "+");

    if (evaluator.length > 1) {
        return execute(evaluator);
    }

    return evaluator;
}

export default execute;