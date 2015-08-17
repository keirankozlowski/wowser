const Promise = require('promise');
const THREE = require('three');

module.exports = class ADT {

  static cache = {};

  constructor(data) {
    this.geometry = new THREE.Geometry();

    // TODO: Potentially move these calculations and mesh generation to worker

    const faces = this.geometry.faces = [];
    const vertices = this.geometry.vertices = [];

    const size = 33.333333;
    const step = size / 8;

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    for(var cy = 0; cy < 16; ++cy) {
      for(var cx = 0; cx < 16; ++cx) {
        let cindex = cy * 16 + cx;
        let chunk = data.MCNKs[cindex];

        chunk.MCVT.heights.forEach(function(height, index) {
          let y = Math.floor(index / 17);
          let x = index % 17;
          if(x > 8) {
            y += 0.5;
            x -= 8.5;
          }
          const vertex = new THREE.Vector3(cx * size + x * step, cy * size + y * step, chunk.position.z + height);
          vertices.push(vertex);
        });

        let coffset = cindex * 145;
        let index = coffset + 9;
        for(var y = 0; y < 8; ++y) {
          for(var x = 0; x < 8; ++x) {
            faces.push(new THREE.Face3(index, index - 9, index - 8));
            faces.push(new THREE.Face3(index, index - 8, index + 9));
            faces.push(new THREE.Face3(index, index + 9, index + 8));
            faces.push(new THREE.Face3(index, index + 8, index - 9));
            index++;
          }
          index += 9;
        }
      }
    }
  }

  get mesh() {
    const material = new THREE.MeshBasicMaterial({ wireframe: true });
    return new THREE.Mesh(this.geometry, material);
  }

  static load(path) {
    if(!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data))
        });

        worker.postMessage(['ADT', path]);
      });
    }
    return this.cache[path];
  }

};