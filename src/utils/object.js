import { Object3D } from 'three';


/**
 * Finding object3D parent(include itself) circularly until callback return true.
 * If don't find the parent match the callback,it will return null.
 * @param  {Object3D} object3d
 * @param  {(obj:Object3D)=>boolean} callback
 * @returns {Object3D|null}
 */
export function findParent (object3d, callback) {
  let parent = object3d;
  while (!callback(parent)) {
    parent = parent.parent;
    if (parent === null) {
      return null;
    }
  }
  return parent;
}

export function findChildren (object3D, callback) {
  const children = [];
  object3D.traverse(obj => children.push(obj));
  const result = children.find(callback);
  if (result !== undefined) {
    return result;
  } else {
    return null;
  }
}

export function checkNameIncludes (obj, str) {
  if (obj.name.includes(str)) {
    return true;
  } else {
    return false;
  }
}
