function render_puzzle(puzzle: Puzzle): HTMLElement {
  let x, y: number;
  let table = create_element("table");
  for (y = 0; y < puzzle.size; y ++) {
    let tr = create_element("tr");
    for (x = 0; x < puzzle.size; x ++) {
      let td = create_element("td");
      td.onclick = interact_space(x, y);
      // star
      if (points_include(puzzle.stars, [x, y]))
        td.classList.add("star");
      // left edge
      if (0 < x && puzzle.edges.get([x - 0.5, y]))
        td.classList.add("edge-left");
      // right edge
      if (x < puzzle.size && puzzle.edges.get([x + 0.5, y]))
        td.classList.add("edge-right");
      // top edge
      if (0 < y && puzzle.edges.get([x, y - 0.5]))
        td.classList.add("edge-top");
      // bottom edge
      if (y < puzzle.size && puzzle.edges.get([x, y + 0.5]))
        td.classList.add("edge-bottom");
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table
}

function interact_space(x, y): any {
  return (event) => {
    event.target.classList.toggle("marked");
  }
}
