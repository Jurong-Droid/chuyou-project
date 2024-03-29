// import type { Object3DExtends } from '@/types';
import * as THREE from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';
// import type Viewer from '../Viewer';
// import type { Animate } from '../Viewer';

export default class BaseModel {
  viewer;
  gltf;
  object;
  /**模型原始材质 */
  originMaterials;
  isSaveMaterial;
  animaIndex;
  mixer; //AnimationMixer--动画混合器是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
  clock;
  animaObject;

  constructor(gltf, viewer) {
    this.gltf = gltf;
    this.viewer = viewer;
    this.object = gltf.scene || gltf;

    this.clock = new THREE.Clock();
  }
  /**
  * 设置模型比例
  * @param x 可以只填写一个参数
  * @param y 纵轴缩放
  * @param z 横轴缩放
  */
  setScalc(x, y, z) {
    this.object.scale.set(x, y || x, z || x);
  }

  getLength() {
    const box = new THREE.Box3();
    box.setFromObject(this.object);
    const size = box.getSize(new THREE.Vector3());
    return size;
  }

  /**
  * 设置模型动画
  * @param i 选择模型动画进行播放
  */
  startAnima(i = 0) {
    this.animaIndex = i;
    if (!this.mixer) this.mixer = new THREE.AnimationMixer(this.object);
    if (this.gltf.animations.length < 1) return;
    this.mixer.clipAction(this.gltf.animations[i]).play();
    // 传入参数需要将函数与函数参数分开，在运行时填入
    this.animaObject = {
      fun: this.updateAnima,
      content: this,
    };
    this.viewer.addAnimate(this.animaObject);
  }

  updateAnima(e) {
    e.mixer.update(e.clock.getDelta());
  }

  /**
   * 克隆模型
   * @param x
   * @param y
   * @param z
   * @returns {*}
   */
  cloneModel([x, y, z]) {
    const newScene = { ...this.gltf };
    const newModel = SkeletonUtils.clone(this.object);
    newModel.position.set(x, y, z);
    this.viewer.scene.add(newModel);
    newScene.scene = newModel;
    return new BaseModel(newScene, this.viewer);
  }

  /**
   * 开启模型阴影 数组中移除阴影
   */
  openCastShadow(names = []) {
    this.gltf.scene.traverse((model) => {
      if (model.isMesh && !names.includes(model.name)) {
        model.frustumCulled = false;
        model.castShadow = true;
      }
    });
  }

  /**设置模型颜色 */
  setColor(color = 'yellow', opacity = 0.5) {
    if (!this.isSaveMaterial) this.originMaterials = [];
    this.gltf.scene.traverse((model) => {
      if (model.isMesh) {
        if (!this.isSaveMaterial) this.originMaterials.push(model.material);
        model.material = new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          depthTest: false,
          depthWrite: true, // 无法被选择，鼠标穿透
          color: new THREE.Color(color),
          opacity: opacity,
        });
      }
    });
    this.isSaveMaterial = true;
  }

  /**设置模型材质 */
  setMaterial(material) {
    if (!this.isSaveMaterial) this.originMaterials = [];
    this.gltf.scene.traverse((model) => {
      if (model.isMesh) {
        if (!this.isSaveMaterial) this.originMaterials.push(model.material);
        model.material = material;
      }
    });
    this.isSaveMaterial = true;
  }

  // 还原模型材质
  setDefault() {
    let i = 0;
    this.gltf.scene.traverse((model) => {
      if (model.isMesh) {
        model.material = this.originMaterials[i];
        i++;
      }
    });
  }
}
