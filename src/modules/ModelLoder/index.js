import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import BaseModel from '../BaseModel/index.js';
// import type Viewer from '../Viewer';

/**模型加载器 */
export default class ModelLoder {
   viewer;
   gltfLoader;
   dracoLoader;

  constructor(viewer, dracolPath) {
    this.viewer = viewer;
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();

    // 提供一个DracLoader实例来解码压缩网格数据
    // 没有这个会报错 dracolPath 默认放在public文件夹当中
    this.dracoLoader.setDecoderPath(dracolPath);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**模型加载到场景 */  //callback以BaseModel为参数
  loadModelToScene(url, callback) {
    this.loadModel(url, model => {
      this.viewer.scene.add(model.object);
      callback && callback(model);
    });
  }

  loadModel(url, callback) {
    this.gltfLoader.load(url, gltf => {
      const baseModel = new BaseModel(gltf, this.viewer);
      callback && callback(baseModel);
    });
  }
}