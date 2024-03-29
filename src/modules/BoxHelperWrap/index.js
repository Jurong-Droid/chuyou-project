import {
  BoxHelper,
  Color,
  Object3D
} from 'three';
// import type Viewer from '../Viewer';
//模型轮廓辅助线  [通过 BoxHelper 可以实现简单的鼠标选中的特效。][也可以通过 OutlinePass 实现发光的特效。] https://blog.csdn.net/Ed7zgeE9X/article/details/130895733
//这里有一篇关于 threejs 中轮廓线、边框线、选中效果实现的N种方法以及性能评估的文章：zhuanlan.zhihu.com/p/462329055
export default class BoxHelperWrap {
  viewer;
  boxHelper;//用于展示对象世界轴心对齐的包围盒的辅助对象. 注意:要想能正常运行,目标对象必须包含 Geometry 或 BufferGeometry , 所以当目标对象是精灵 Sprites 时将不能正常运行.

  constructor (viewer, color) {
    this.viewer = viewer;
    const boxColor = color === undefined ? 0x00ffff : color;
    this.boxHelper = new BoxHelper(new Object3D(), new Color(boxColor));
    // // @ts-expect-error
    // this.boxHelper.material.depthTest = false;

    this.initBoxHelperWrap();
  }

  initBoxHelperWrap () {
    this.viewer.scene.add(this.boxHelper);
  }

  setVisible (visible) {
    this.boxHelper.visible = visible;
  }

  attach (obj) {
    this.boxHelper.setFromObject(obj);//obj - 用于创建辅助对象的目标 Object3D 对象.
    this.setVisible(true);
  }

  dispose () {
    const parent = this.boxHelper.parent;
    if (parent !== null) {
      parent.remove(this.boxHelper);
    }

    Object.keys(this).forEach(key => {
      // @ts-expect-error
      this[key] = null;
    });
  }
}
