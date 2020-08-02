var puzzle: Puzzle;
var puzzle_container: HTMLElement = document.getElementById("puzzle_container");
var puzzle_element: HTMLElement;
var input_puzzle_size: HTMLInputElement = document.getElementById("input_puzzle_size") as HTMLInputElement;
var puzzle_status: HTMLElement = document.getElementById("puzzle_status");

var attempt: point[] = [];

function generate_puzzle() {
  puzzle = new Puzzle(parseInt(input_puzzle_size.value));
  puzzle.generate();

  if (puzzle_element) puzzle_container.removeChild(puzzle_element);
  puzzle_element = render_puzzle(puzzle);
  puzzle_container.appendChild(puzzle_element);

  puzzle_status.innerText = "";
  attempt = [];
}

window.onload = () => {
  generate_puzzle();
}

function interact_space(x, y): any {
  return (event) => {
    let element = event.target;
    if (event.shiftKey) {
      element.classList.toggle("marked");
    } else {
      element.classList.toggle("starred");
      // add to attempt
      if (element.classList.contains("starred")) attempt.push([x, y]);
      // remove from attempt
      else attempt = attempt.filter(p => !point_eq(p, [x, y]));
    }
  }
}

/*
  Solution Conditions:
  - each row has exactly one star
  - each column has exactly one star
  - each component has exactly one star
*/
function check_puzzle() {
  let failure_messages: string[] = [];
  let success = true;

  function check(b, msg) {
    if (!b) {
      success = false;
      failure_messages.push(msg);
    }
  }

  console.log("attempt", attempt);

  // rows and columns

  let row_counts = Array.from(Array(puzzle.size).keys()).map(x => 0);
  let col_counts = Array.from(Array(puzzle.size).keys()).map(x => 0);
  attempt.forEach(p => {
    row_counts[p[0]] ++;
    col_counts[p[1]] ++;
  });

  console.log("row_counts", row_counts);
  console.log("col_counts", col_counts);

  let empty_rows = 0;
  let empty_cols = 0;
  let colliding_rows = 0;
  let colliding_cols = 0;

  row_counts.forEach((count, i) => {
    if (count < 1) empty_rows ++;
    if (count > 1) colliding_rows ++;
  });
  col_counts.forEach((count, i) => {
    if (count < 1) empty_cols ++;
    if (count > 1) colliding_cols ++;
  });

  check(empty_rows == 0,
      `empty rows x${empty_rows}`);
  check(empty_cols == 0,
      `empty columnss x${empty_cols}`);
  check(colliding_rows == 0,
      `colliding rows x${colliding_rows}`);
  check(colliding_cols == 0,
      `colliding columns x${colliding_cols}`);


  // components

  let empty_components = 0;
  let colliding_components = 0;

    puzzle.components.components.forEach((comp, i) => {
      let count: number;
      if (attempt.length > 0)
        count = attempt
                  .map<number>(p => points_include(comp, p) ? 1 : 0)
                  .reduce((a, b) => a + b);
      else
        count = 0;
      if (count < 1) empty_components ++;
      if (count > 1) colliding_components ++;
    });

  check(empty_components == 0,
    `empty components x${empty_components}`);
  check(colliding_components == 0,
    `colliding components x${colliding_components}`);

  if (success) {
    puzzle_status.innerText = "success!";
    puzzle_status.style.color = "lime";
  } else {
    puzzle_status.innerHTML = failure_messages.join(",<br>")+".";
    puzzle_status.style.color = "red";
  }
}

function solve_puzzle() {
  let stars = document.getElementsByClassName("star");
  let i: number;
  for (i = 0; i < stars.length; i ++) {
    stars[i].classList.toggle("star-highlight");
  }
}
