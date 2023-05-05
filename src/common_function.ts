export type SimResult = [ number[], number[] ];

export const clickEventType = (window.ontouchstart === undefined)
    ? "mousedown" : "touchstart";


export function makeTable(elem: HTMLTableElement,
                          header: string[],
                          contents: string[][]) {
    // clear table
    elem.innerText = "";

    let thead = document.createElement("thead");
    let headtr = document.createElement("tr");
    let tbody = document.createElement("tbody");

    // header
    elem.appendChild(thead);
    thead.appendChild(headtr);
    header.forEach((cell) => {
        const th = document.createElement("th");
        th.textContent = cell;
        headtr.appendChild(th);
    });

    // contents
    elem.appendChild(tbody);
    contents.forEach((row) => {
        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
    });
}

