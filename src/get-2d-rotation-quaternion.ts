import { Vector3, Quaternion } from 'three';

function get2dRotationQuaternion(
  normal: Vector3,
  destNormal: Vector3 = new Vector3(0, 0, 1)
): Quaternion {
  /**
   * Do math I don't understand:
   *
   * https://stackoverflow.com/questions/6264664/transform-3d-points-to-2d
   * and
   * https://stackoverflow.com/questions/19211815/rotating-arbitrary-plane-to-be-z-axis-aligned?rq=1
   */
  const axis: Vector3 = normal
    .clone()
    .normalize()
    .cross(destNormal)
    .normalize();
  const angle: number = Math.acos(
    normal
      .clone()
      .normalize()
      .dot(destNormal)
  );
  const quat: Quaternion = new Quaternion().setFromAxisAngle(axis, angle);
  return quat;
}

export { get2dRotationQuaternion };
