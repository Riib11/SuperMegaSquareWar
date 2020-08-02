var puzzle;
var puzzle_container = document.getElementById("puzzle_container");
var puzzle_element;
var input_puzzle_size = document.getElementById("input_puzzle_size");
var puzzle_status = document.getElementById("puzzle_status");
var attempt = [];
function generate_puzzle() {
    puzzle = new Puzzle(parseInt(input_puzzle_size.value));
    puzzle.generate();
    if (puzzle_element)
        puzzle_container.removeChild(puzzle_element);
    puzzle_element = render_puzzle(puzzle);
    puzzle_container.appendChild(puzzle_element);
    puzzle_status.innerText = "";
    attempt = [];
}
window.onload = () => {
    generate_puzzle();
};
function interact_space(x, y) {
    return (event) => {
        let element = event.target;
        if (event.shiftKey) {
            element.classList.toggle("marked");
        }
        else {
            element.classList.toggle("starred");
            // add to attempt
            if (element.classList.contains("starred"))
                attempt.push([x, y]);
            // remove from attempt
            else
                attempt = attempt.filter(p => !point_eq(p, [x, y]));
        }
    };
}
/*
  Solution Conditions:
  - each row has exactly one star
  - each column has exactly one star
  - each component has exactly one star
*/
function check_puzzle() {
    let failure_messages = [];
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
        row_counts[p[0]]++;
        col_counts[p[1]]++;
    });
    console.log("row_counts", row_counts);
    console.log("col_counts", col_counts);
    let empty_rows = 0;
    let empty_cols = 0;
    let colliding_rows = 0;
    let colliding_cols = 0;
    row_counts.forEach((count, i) => {
        if (count < 1)
            empty_rows++;
        if (count > 1)
            colliding_rows++;
    });
    col_counts.forEach((count, i) => {
        if (count < 1)
            empty_cols++;
        if (count > 1)
            colliding_cols++;
    });
    check(empty_rows == 0, `empty rows x${empty_rows}`);
    check(empty_cols == 0, `empty cols x${empty_cols}`);
    check(colliding_rows == 0, `colliding rows x${colliding_rows}`);
    check(colliding_cols == 0, `colliding cols x${colliding_cols}`);
    // components
    let empty_components = 0;
    let colliding_components = 0;
    puzzle.components.components.forEach((comp, i) => {
        let count;
        if (attempt.length > 0)
            count = attempt
                .map(p => points_include(comp, p) ? 1 : 0)
                .reduce((a, b) => a + b);
        else
            count = 0;
        if (count < 1)
            empty_components++;
        if (count > 1)
            colliding_components++;
    });
    check(empty_components == 0, `empty components x${empty_components}`);
    check(colliding_components == 0, `colliding components x${colliding_components}`);
    if (success) {
        puzzle_status.innerText = "success!";
        puzzle_status.style.color = "lime";
    }
    else {
        failure_messages = failure_messages.map(msg => `<li>${msg}</li>`);
        puzzle_status.innerHTML = "<ul>" + failure_messages.join("") + "<ul>";
        puzzle_status.style.color = "red";
    }
}
function solve_puzzle() {
    let stars = document.getElementsByClassName("star");
    let i;
    for (i = 0; i < stars.length; i++) {
        stars[i].classList.toggle("star-highlight");
    }
}
function point_eq(p, q) {
    return p[0] == q[0] && p[1] == q[1];
}
function points_include(comp, p) {
    return comp.some(q => point_eq(p, q));
}
class Puzzle {
    constructor(size) {
        this.size = size;
        // initialize edges
        this.edges = new EdgesManager(size);
        // initialize stars
        this.stars = [];
        let options_x = shuffle(Array.from(Array(size).keys()));
        let options_y = shuffle(Array.from(Array(size).keys()));
        zip(options_x, options_y).forEach(p => this.stars.push(p));
        // initialize components
        this.components = new ComponentsManager(size, this.stars);
    }
    /*
      Remove random edges until every space
      is a member of some component.
    */
    generate() {
        // the remaining edges' points
        let es = this.edges.ps.map(p => p);
        while (es.length > 0) {
            // console.log("------------------")
            // console.log("components");
            // this.components.components.forEach(comp => console.log("", comp));
            // pick a random remaining edge's point, and remove it if safe
            this.safely_remove_edge(pop_random(es));
        }
        // console.log("final edges", this.edges.values);
    }
    // remove edge and update components
    // returns success status
    safely_remove_edge(e) {
        // check if the adjacent spaces of an edge
        // are part of different components
        let adj_ps = this.edges.get_adjacent_spaces(e);
        let p0 = adj_ps[0];
        let p1 = adj_ps[1];
        // console.log("considering removing edge");
        // console.log("", "e", e);
        // console.log("", "p0", p0);
        // console.log("", "p1", p1);
        // already in same component, so remove edge
        // (don't need to merge components)
        if (this.components.connected(p0, p1)) {
            // console.log("already connected");
            this.edges.set(e, false);
            return true;
        }
        // not already in same component
        else {
            // both points are in components with stars, so do not remove edge
            if (this.components.has_star(p0) && this.components.has_star(p1)) {
                // console.log("unsafe, so no merge");
                return false;
            }
            // at least one component doesn't have a star, so remove edeg
            else {
                // console.log("safe, so merge");
                this.edges.set(e, false);
                this.components.merge(p0, p1);
                return true;
            }
        }
    }
}
/*
  ComponentsManager
*/
class ComponentsManager {
    constructor(size, stars) {
        this.size = size;
        this.stars = stars;
        this.components = [];
        let i, j;
        for (j = 0; j < size; j++) {
            for (i = 0; i < size; i++) {
                this.components.push([[i, j]]);
            }
        }
    }
    get(p) {
        let i;
        for (i = 0; i < this.components.length; i++) {
            let comp = this.components[i];
            if (points_include(comp, p))
                return comp;
        }
        return undefined;
    }
    merge(p0, p1) {
        let comp0 = this.get(p0);
        let comp1 = this.get(p1);
        // console.log("merged", comp0);
        // console.log("merged", comp1);
        let comps = [];
        this.components.forEach(comp => {
            if (points_include(comp, p0)) { }
            else if (points_include(comp, p1)) {
                comps.push(comp0.concat(comp1));
            }
            else {
                comps.push(comp);
            }
        });
        this.components = comps;
        return this.components;
    }
    // are both points in the same component?
    connected(p0, p1) {
        return points_include(this.get(p0), p1);
    }
    // point's component has a star
    has_star(p) {
        let comp = this.get(p);
        return this.stars.some(p_star => points_include(comp, p_star));
    }
    // number of spaces that are in a component with a star
    get_star_spaces_count() {
        let spaces_count = 0;
        this.components.forEach(comp => {
            if (comp.some(p => points_include(this.stars, p)))
                spaces_count += comp.length;
        });
        return spaces_count;
    }
}
/*
  EdgesManager
*/
class EdgesManager {
    constructor(size) {
        this.size = size;
        this.values = [];
        this.ps = [];
        let i, j;
        for (j = 0; j < 2 * size; j++) {
            let row = [];
            for (i = 0; i < 2 * size; i++) {
                if (i == 2 * size - 1 || j == 2 * size - 1)
                    row.push(null);
                else if ((is_even(i) && is_odd(j)) || (is_odd(i) && is_even(j))) {
                    row.push(true);
                    this.ps.push([i / 2, j / 2]);
                }
                // else if (is_even(ix) && is_even(j))
                //   row.push("point");
                else
                    row.push(null);
            }
            this.values.push(row);
        }
        // console.log("values", this.values);
    }
    get(e) {
        return this.values[e[1] * 2][e[0] * 2];
    }
    set(e, v) {
        this.values[e[1] * 2][e[0] * 2] = v;
    }
    get_adjacent_spaces(e) {
        // console.log("get_adjacent_spaces", e);
        // horizontal edge
        if (Math.floor(e[1]) != e[1]) {
            return [[Math.floor(e[0]), e[1] - 0.5],
                [Math.floor(e[0]), e[1] + 0.5]];
        }
        // vertical edge
        else if (Math.floor(e[0]) != e[0]) {
            return [[e[0] - 0.5, Math.floor(e[1])],
                [e[0] + 0.5, Math.floor(e[1])]];
        }
    }
}
function render_puzzle(puzzle) {
    let x, y;
    let table = create_element("table");
    for (y = 0; y < puzzle.size; y++) {
        let tr = create_element("tr");
        for (x = 0; x < puzzle.size; x++) {
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
    return table;
}
// random x in [a, b)
function random_int_range(a, b) {
    return a + Math.floor(Math.random() * (b - a));
}
function sample(a) {
    return a[random_int_range(0, a.length)];
}
// shuffle a list in place;
function shuffle(a) {
    let i, j, k;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        let x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
function zip(a1, a2) {
    return a1.map((x, i) => [x, a2[i]]);
}
function pop_random(a) {
    return a.splice(Math.floor(Math.random() * a.length), 1)[0];
}
function create_element(element_type, options) {
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
