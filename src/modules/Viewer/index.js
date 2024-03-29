import {
  Scene,
  PerspectiveCamera,
  AxesHelper,
  WebGLRenderer,
  Camera,
  // SRGBColorSpace,
  AmbientLight,
  Raycaster,
  Vector2
} from 'three';
import * as THREE from 'three';
import mitt, { Emitter } from 'mitt';
import Events from './Events.ts';
import { throttle } from 'lodash-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import SkyBoxs from '../SkyBoxs/index.js';

// export  Animate = {
//   fun: (arg) => {},
//   content,
// }

export default class Viewer {
  id;
  viewerDom;
  scene;
  camera;
  renderer;
  controlss;
  skyboxs;
  animateEventList = [];
  statsControls;
  raycaster; //在three.js，可以利用THREE.Raycaster来达到点击与交互，即选择物体的操作。
  mouse;
  emitter;
  mouseEvent;
  raycasterObjects = [];
  isDestroy = false;

  constructor(id) {
    this.id = id;
    this.initViewer();
  }
  /**坐标轴辅助 */
  addAxis() {
    const axis = new AxesHelper(1.5);
    this.scene.add(axis);
  }

  addAnimate(animate) {
    this.animateEventList.push(animate);
  }
  /**
  * 添加性能状态监测
  */
  addStats() {
    if (!this.statsControls) this.statsControls = new Stats();
    this.statsControls.dom.style.position = 'absolute';
    this.viewerDom.appendChild(this.statsControls.dom);

    // 添加到动画
    this.addAnimate({
      fun: this.statsUpdate,
      content: this.statsControls,
    });
  }

  /**注册鼠标事件监听 */
  initRaycaster() {
    this.raycaster = new Raycaster();
    //HTMLElementEventMap 是一个接口，它在 TypeScript 中定义了由 HTML 元素可以触发的事件的名称和类型。
    const initRaycasterEvent = (eventName) => {
      const funWrap = throttle( //节流函数（throttle）,会稀释函数的执行频率
        (event) => {
          this.mouseEvent = event;
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
          // @ts-expect-error
          this.emitter.emit(Events[eventName].raycaster, this.getRaycasterIntersectObjects());//emit(type, [evt])来派发事件，根据 type 找到对应的事件处理数组并依次执行，传入参数 evt(对象最好，传多个参数只会取到第一个)
        },
        50
      );
      this.viewerDom.addEventListener(eventName, funWrap, false);  //事件--事件处理函数--seCapture为false（默认）时，事件处理采取事件冒泡的原则
    };

    initRaycasterEvent('click');
    initRaycasterEvent('dblclick');
    initRaycasterEvent('mousemove');
  }

  /**销毁场景 */
  destroy() {
    this.scene.traverse((child) => {
      if (child.material) {
        child.material.dispose();
      }
      if (child.geometry) {
        child.geometry.dispose();
      }
      child = null;
    });
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.scene.clear();

    this.isDestroy = true;
  }

  statsUpdate(statsControls) {
    statsControls.update();
  }


  initViewer() {
    this.emitter = mitt();

    this.initRenderer();
    this.initScene();
    this.initLight();
    this.initCamera();
    this.initControl();
    this.initSkybox();

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    const animate = () => {
      if (this.isDestroy) return;
      requestAnimationFrame(animate);
      //window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
      // 回调函数执行次数通常是每秒60次，但在大多数遵循W3C建议的浏览器中，回调函数执行次数通常与浏览器屏幕刷新次数相匹配。
      this.updateDom();
      this.readerDom();
      // 全局的公共动画函数，添加函数可同步执行
      this.animateEventList.forEach(event => {
        // event.fun && event.content && event.fun(event.content);
        if (event.fun && event.content) {
          event.fun(event.content);
        }
      });
    };
    animate();
  }
  initRenderer() {
    // 获取画布dom
    this.viewerDom = document.getElementById(this.id);
    // 初始化渲染器
    this.renderer = new WebGLRenderer({
      logarithmicDepthBuffer: true, //是否使用对数深度缓存
      antialias: true, // true/false表示是否开启反锯齿
      alpha: true, // true/false 表示是否可以设置背景色透明
      precision: 'mediump', // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
      // preserveDrawingBuffer: false, // true/false 表示是否保存绘图缓冲
      // physicallyCorrectLights: true, // true/false 表示是否开启物理光照
    });
    this.renderer.clearDepth();

    this.renderer.shadowMap.enabled = true; //开启渲染气阴影效果--阴影效果比较突出，并且阴影的分辨率也比较高
    // this.renderer.outputColorSpace = SRGBColorSpace; // 可以看到更亮的材质，同时这也影响到环境贴图。
    this.viewerDom.appendChild(this.renderer.domElement);
  }
  initScene() {
    this.scene = new Scene();
  }
  initLight() {
    const ambient = new AmbientLight(0xffffff, 0.6);//环境光
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 200, 100);
    light.castShadow = true;//控制光源是否产生阴影

    light.shadow.camera.top = 180;      //投影上边界
    light.shadow.camera.bottom = -100;  //投影下边界
    light.shadow.camera.left = -120;  //投影左边界
    light.shadow.camera.right = 400;  //投影右边界
    light.shadow.camera.near = 0.1;   //表示距离光源的哪一个位置开始生成阴影
    light.shadow.camera.far = 400;    //到距离光源的哪一个位置可以生成阴影
    // 设置mapSize属性可以使阴影更清晰，不那么模糊
    light.shadow.mapSize.set(1024, 1024);  // 阴影映射宽度和阴影映射高度。决定了有多少像素用来生成阴影。当阴影具有锯齿状边缘或看起来不光滑时，可以增加这个值。在场景渲染之后无法更改，默认值都为512

    this.scene.add(light);
  }
  initCamera() {
    // 渲染相机
    this.camera = new PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 2000);
    //设置相机位置
    this.camera.position.set(4, 2, -3);
    //设置相机方向
    this.camera.lookAt(0, 0, 0);
  }
  initControl() {
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = false; // 设置是否有阻尼作用（OrbitControls.js旋转时可以添加阻尼作用，这样鼠标或手机操作时会比较灵动）
    this.controls.screenSpacePanning = false; // 定义平移时如何平移相机的位置 控制不上下移动
    // this.controls.minZoom = 1;正投用相机对象设-置缩放范围
    // this.controls.maxZoom = 2;
    //透视投影相机：相机距离目标观察点距离越远显示越小，距离越近显示越大
    this.controls.minDistance = 2;//相机距离观察目标点极小距离——模型最大状态
    this.controls.maxDistance = 50;//相机距离观察目标点极大距离——模型最小状态
    this.controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });
  }
  initSkybox() {
    if (!this.skyboxs) this.skyboxs = new SkyBoxs(this);
    this.skyboxs.addSkybox('night');
    this.skyboxs.addFog();
  }
  updateDom() {
    //Orbit controls（轨道控制器）可以使得相机围绕目标进行轨道运动
    this.controls.update();////controls.update() must be called after any manual changes to the camera's transform
    // 更新参数
    this.camera.aspect = this.viewerDom.clientWidth / this.viewerDom.clientHeight; // 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
    this.camera.updateProjectionMatrix(); // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用,来使得这些改变生效
    this.renderer.setSize(this.viewerDom.clientWidth, this.viewerDom.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比
  }
  // 渲染dom
  readerDom() {
    this.renderer.render(this.scene, this.camera);
  }


  /**自定义鼠标事件触发的范围，给定一个模型组，对给定的模型组鼠标事件才生效 */
  setRaycasterObjects(objList) {
    let i;
    if (this.raycasterObjects.length) {
      for (i in objList) {
        this.raycasterObjects.push(objList[i]);
      }
    }
    else {
      this.raycasterObjects = objList;
    }
  }

  getRaycasterIntersectObjects() {
    if (!this.raycasterObjects.length) return [];
    this.raycaster.setFromCamera(this.mouse, this.camera);//[用照相机的原点和点击的点构成一条直线]camera — 射线起点处的相机，即把射线起点设置在该相机位置处。mouse _ 鼠标的二维坐标，在归一化的设备坐标中，也就是X 和 Y 分量应该介于 -1 和 1 之间。
    return this.raycaster.intersectObjects(this.raycasterObjects, true);//检查射线和物体之间的所有交叉点（包含或不包含后代）。交叉点返回按距离排序，最接近的为第一个。 返回一个交叉点对象数组。
  }
}
