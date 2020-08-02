var container: HTMLElement = document.getElementById("container");
var puzzle: Puzzle;
var puzzle_element: HTMLElement;
var input_puzzle_size: HTMLInputElement = document.getElementById("input_puzzle_size") as HTMLInputElement;

function generate_puzzle() {
  puzzle = new Puzzle(parseInt(input_puzzle_size.value));
  puzzle.generate();

  if (puzzle_element) container.removeChild(puzzle_element);
  puzzle_element = render_puzzle(puzzle);
  container.appendChild(puzzle_element);
}

window.onload = () => {
  generate_puzzle();
}

function check_puzzle() {
  console.log("TODO");
}
