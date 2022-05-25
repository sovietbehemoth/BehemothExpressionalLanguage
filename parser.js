


/*
print "hello world"

*/


function parser(buffer) {

    const tree = [];

    for (let i = 0; i < buffer.length; i++) {
        const node = buffer[i];

        switch (node.type) {
            case "parenthesis":
            case "string":
                tree.push({
                    type: node.type,
                    object: parser(node.object)
                });
                break;

            case "identifier":
                const conv = parseFloat(node.id);

                if (!isNaN(conv)) {
                    tree.push({
                        type: "number",
                        value: conv
                    });
                } else {
                    tree.push({
                        type: "identifier",
                        value: node.id
                    });
                }
                break;

            default: tree.push(node); break;
        }
    }

    return tree;
}

export default parser;