const { Vector3 } = require('three');

function toVector3(arraylike: any) {
  if (arraylike.isVector3) return arraylike;
  return new Vector3(arraylike[0], arraylike[1], arraylike[2]);
}

export { toVector3 };
