const { Vector3, Quaternion } = require('three');

function get2dRotationQuaternion(normal, destNormal = new Vector3(0, 0, 1)) {
  /**
   * Do math I don't understand:
   *
   * https://stackoverflow.com/questions/6264664/transform-3d-points-to-2d
   * and
   * https://stackoverflow.com/questions/19211815/rotating-arbitrary-plane-to-be-z-axis-aligned?rq=1
   */
  const axis = normal
    .clone()
    .normalize()
    .cross(destNormal)
    .normalize();
  const angle = Math.acos(
    normal
      .clone()
      .normalize()
      .dot(destNormal)
  );
  const quat = new Quaternion().setFromAxisAngle(axis, angle);
  return quat;
}

export { get2dRotationQuaternion };
