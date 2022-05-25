function is_pairable_token(op) {
    switch (op) {
        case "(":
        case ")":
        case "{":
        case "}":
        case "[":
        case "]":
        case "\"":
        return true;
    } return false;
}

function derive_object_type(char) {
    switch (char) {
        case "\"": return "string";
        case "{": return "block";
        case "(": return "parenthesis";
        default: return "unknown";
    }
}

function is_pair(t1, t2) {
    let tk;

    switch (t1) {
        case "(": tk = ")"; break;
        case "{": tk = "}"; break;
        case "[": tk = "]"; break;
        case "\"": tk = "\""; break;
        default: return false;
    } return (tk === t2);
}

function is_special(op) {
    switch (op) {
        case "+":
        case "-":
        case "/":
        case "*":
        case "^":
        case " ": return true;
        default: return false;
    }
}






function rm_pair(arr, pos) {
    let n = [];

    for (let i = 0; i < arr.length; i++) {
        if (i !== pos && i !== pos+1) {
            n.push(arr[i]);
        }
    }

    return n;
}

function pair(buffer) {

    let token_stack = [];
    let in_string = false;

    let rcount = 0;
    let lcount = 0;
    let string_instances = 0;

    for (let i = 0; i < buffer.length; i++) {
        const token = buffer[i];

        if (token === '"') {
            in_string = in_string ? false : true;
        } else if (in_string) continue;

        if (is_pairable_token(token)) {

            switch (token) {
                case "(":
                case "{":
                case "[": lcount++; break;
                case "\"": string_instances++; break;
                default: rcount++; break;
            }

            token_stack.push({
                token: token,
                position: i
            });
        }
    }

    if (rcount !== lcount || string_instances % 2 !== 0) {
        console.error("Bad matching.");
        Deno.exit(1);
    }

    let pairs = [];
    let i = 0;

    while (token_stack.length > 0) {
        const token = token_stack[i];
        const next = token_stack[i+1];

        if (!next) {
            i = 0;
            continue;
        } 

        if (is_pair(token.token, next.token)) {
            pairs.push({
                from: token.position,
                to: next.position,
                token: token.token
            });
            token_stack = rm_pair(token_stack, i);
        }

        i++;
    }

    return pairs;
}

function find_pair(target, tokens) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].from === target) {
            return tokens[i].to;
        }
    }
}

function lexer(buffer, string=false) {
    const pairs = pair(buffer);

    let output = [];

    let override = false;

    for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];

        if (is_pairable_token(char) && !string) {
            const object = buffer.substring(i+1, find_pair(i, pairs));
            const derive = derive_object_type(char);

            output.push({
                type: derive,
                object: lexer(object, derive==="string")
            });

            i += object.length+1;
            continue;
        } 


        if (is_special(char) && !string) {
            if (char.trim() === "") {
                override = true;
                continue;
            }

            output.push({
                type: "operator",
                literal: char
            });
        } else {
            const index = output.length > 0 ? output.length-1 : 0;
            const head = output[index];

            if (head?.type === "identifier" && !override) {
                output[index].id += char;
            } else {

                if (override) {
                    override = false;
                }

                output.push({
                    type: "identifier",
                    id: char
                });
            }
        }
    } 

    return output;
}

export default lexer;