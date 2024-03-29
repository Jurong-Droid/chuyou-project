import * as THREE from 'three';
// import type Viewer from '../Viewer';
import { Sky } from '../type.js';

/** 场景天空盒*/
export default class SkyBoxs {
   viewer;
  
  constructor (viewer) {
    this.viewer = viewer;
  }

  /**
   * 添加雾效果
   * @param color 颜色
   */
   addFog (color = 0xa0a0a0, near = 500, far = 2000) {
    this.viewer.scene.fog = new THREE.Fog(new THREE.Color(color), near, far);
  }

  /**
   * 移除雾效果
   */
   removeFog () {
    this.viewer.scene.fog = null;
  }

  /**
   * 添加默认天空盒
   * @param skyType
   */
   addSkybox (skyType) {
    const path = `/skybox/${Sky[skyType]}/`; // 设置路径
    const format = '.jpg'; // 设定格式
    this.setSkybox(path, format);
  }

  /**
   * 自定义添加天空盒
   * @param path 天空盒地址
   * @param format 图片后缀名
   */
   setSkybox (path, format) {
    const loaderbox = new THREE.CubeTextureLoader();
    const cubeTexture = loaderbox.load([
      path + 'posx' + format, //left
      path + 'negx' + format, //right
      path + 'posy' + format, //up
      path + 'negy' + format, //down
      path + 'posz' + format,  //front
      path + 'negz' + format, //back
    ]);
    // 需要把色彩空间编码改一下
    // cubeTexture.encoding = THREE.sRGBEncoding;
    cubeTexture.encoding = THREE.sRGBEncoding;
    this.viewer.scene.background = cubeTexture;
  }
}
