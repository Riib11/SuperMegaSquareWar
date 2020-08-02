// random x in [a, b)
function random_int_range(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a));
}

function sample<A>(a: A[]): A {
  return a[random_int_range(0, a.length)];
}

// shuffle a list in place;
function shuffle<A>(a: A[]): A[] {
  let i, j, k: number;
  for (i = a.length - 1; i > 0; i --) {
    j = Math.floor(Math.random() * (i + 1));
    let x: A = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function zip<A, B>(a1: A[], a2: B[]): Array<[A, B]> {
  return a1.map((x, i) => [x, a2[i]]);
}

function pop_random<A>(a: A[]): A {
  return a.splice(Math.floor(Math.random() * a.length), 1)[0];
}

function create_element(element_type: string, options?: object) {
  let element = document.createElement(element_type);
  if (element) {
    for (var key in options) {
      switch (key) {
        case "classes":
          options["classes"].split(" ").forEach(c => element.classList.add(c));
          break;
        case "children":
          options["children"].forEach(child => element.appendChild(child));
          break;
        case "backgroundColor":
          element.style.backgroundColor = options["backgroundColor"];
        default:
          element[key] = options[key];
          break;
      }
    }
  }
  return element;
}

function is_even(x) { return x % 2 == 0; }
function is_odd(x) { return x % 2 == 1; }
function is_integer(x) { return Math.floor(x) == x; }
