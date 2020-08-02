type point = [number, number];

function point_eq(p: point, q: point): boolean {
  return p[0] == q[0] && p[1] == q[1];
}

function points_include(comp: point[], p: point): boolean {
  return comp.some(q => point_eq(p, q));
}

class Puzzle {
  // size of space grid
  size: number;

  // star_i => point of star
  stars: point[];

  // manages edges, which have a special
  // representation to aid indexing relative
  // to grid indices
  edges: EdgesManager;

  // manages components, which are
  // the groups of spaces that are
  // consecutively connected
  // i.e. not disconnected by edges
  components: ComponentsManager;

  constructor(size) {
    this.size = size;

    // initialize edges
    this.edges = new EdgesManager(size);

    // initialize stars
    this.stars = new Array();
    let options_x: Array<number> = shuffle(Array.from(Array(size).keys()));
    let options_y: Array<number> = shuffle(Array.from(Array(size).keys()));
    zip(options_x, options_y).forEach(p => this.stars.push(p));

    // initialize components
    this.components = new ComponentsManager(size, this.stars);
  }

  /*
    Remove random edges until every space
    is a member of some component.
  */
  generate(): void {
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
  safely_remove_edge(e: point): boolean {
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
  size: number;
  stars: point[];
  components_spaces: point[][];
  components: point[][];

  constructor(size, stars) {
    this.size = size;
    this.stars = stars;

    this.components = [];
    let i, j: number;
    for (j = 0; j < size; j ++) {
      for (i = 0; i < size; i ++) {
        this.components.push([[i, j]]);
      }
    }
  }

  get(p: point): point[] {
    let i: number;
    for (i = 0; i < this.components.length; i ++) {
      let comp = this.components[i];
      if (points_include(comp, p)) return comp;
    }
    return undefined;
  }

  merge(p0: point, p1: point): point[][] {
    let comp0 = this.get(p0);
    let comp1 = this.get(p1);

    // console.log("merged", comp0);
    // console.log("merged", comp1);

    let comps = [];
    this.components.forEach(comp => {
      if (points_include(comp, p0))
        { }
      else if (points_include(comp, p1))
        { comps.push(comp0.concat(comp1)); }
      else
        { comps.push(comp); }
    })
    this.components = comps;
    return this.components;
  }

  // are both points in the same component?
  connected(p0: point, p1: point): boolean {
    return points_include(this.get(p0), p1);
  }

  // point's component has a star
  has_star(p: point): boolean {
    let comp = this.get(p);
    return this.stars.some(p_star => points_include(comp, p_star));
  }

  // number of spaces that are in a component with a star
  get_star_spaces_count(): number {
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
  size: number;
  values: (boolean | null)[][];
  ps: point[];

  constructor(size) {
    this.size = size;
    this.values = [];
    this.ps = [];

    let i, j: number;
    for (j = 0; j < 2*size; j ++) {
      let row = [];
      for (i = 0; i < 2*size; i ++) {
        if (i == 2*size - 1 || j == 2 * size - 1)
          row.push(null);
        else if ((is_even(i) && is_odd(j)) || (is_odd(i) && is_even(j)))
          { row.push(true); this.ps.push([i/2, j/2]); }
        // else if (is_even(ix) && is_even(j))
        //   row.push("point");
        else row.push(null);
      }
      this.values.push(row);
    }
    // console.log("values", this.values);
  }

  get(e: point): boolean {
    return this.values[e[1] * 2][e[0] * 2];
  }

  set(e: point, v: boolean): void {
    this.values[e[1] * 2][e[0] * 2] = v;
  }

  get_adjacent_spaces(e: point): [point, point] {
    // console.log("get_adjacent_spaces", e);
    // horizontal edge
    if (Math.floor(e[1]) != e[1]) {
      return [ [Math.floor(e[0]), e[1] - 0.5],
               [Math.floor(e[0]), e[1] + 0.5] ];
    }
    // vertical edge
    else if (Math.floor(e[0]) != e[0]) {
      return [ [e[0] - 0.5, Math.floor(e[1])],
               [e[0] + 0.5, Math.floor(e[1])] ];
    }
  }
}
