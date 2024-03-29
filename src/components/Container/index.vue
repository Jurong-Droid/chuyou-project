<template>
  <!-- <div id="container"></div> -->
  <div id="three" style="width: 100%; height: 100%; position: absolute; z-index: 1;"></div>
</template>

<script>
import Viewer from "@/modules/Viewer/index.js";
import ModelLoader from "@/modules/ModelLoder/index.js";
import gsap from "gsap";
import * as THREE from "three";
import Event from "@/modules/Viewer/Events.ts";
import BoxHelperWrap from "@/modules/BoxHelperWrap/index.js";
import { checkNameIncludes, findParent } from "@/utils/object.js";

const OrbitControls = require("three-orbit-controls")(THREE);

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default {
  data() {
    return {
      scene: null,
      viewer: null,
      modelLoader: null,
      boxHelperWrap: null,

      popoverRef: null,
      popoverTop: 0,
      popoverLeft: 0,
      popoverData: {},

      office: null,
      oldOffice: null,
      modelSelect: ["zuo0", "zuo1", "zuo2", "zuo3", "zuo4", "zuo5"],
      modelSelectName: "",
      modelMoveName: "",
      isModelSelectName: false,
    };
  },
  mounted() {
    this.init();
    this.initModel();

    this.viewer.scene.traverse((item) => {
    console.log(item, '0000000000');//Scene-6个Children（AmbientLight，DirectionalLight,AxesHelper,BoxHelper,Group-plane,Group-机房）
  });
  },
  methods: {
    init() {
      this.viewer = new Viewer("three");
      this.viewer.addAxis();
      this.viewer.addStats();
      this.viewer.initRaycaster(); /**注册鼠标事件监听 */

      this.modelLoader = new ModelLoader(this.viewer);
      // const floors = new Floors(viewer);
      // floors.addGird();

      this.boxHelperWrap = new BoxHelperWrap(this.viewer);
      //on(type, handler)定义函数 on来注册事件，以type为属性，[handler]为属性值，存储在 all 中，属性值为数组的原因是可能存在监听一个事件，多个处理程序
      // this.viewer.emitter.on(Event.dblclick.raycaster, (list) => {
      //   onMouseClick(list);
      // });

      // this.viewer.emitter.on(Event.mousemove.raycaster, (list) => {
      //   onMouseMove(list);
      // });
    },
    initModel() {
      this.modelLoader.loadModelToScene("../../../public/glb/plane.glb", (baseModel) => {
        //baseModel是一个函数
        const model = baseModel.gltf.scene;
        model.scale.set(0.0001 * 5, 0.0001 * 5, 0.0001 * 5);
        model.position.set(0, 0, 0);
        model.name = "一号加热炉";
        baseModel.openCastShadow();

        const texture = baseModel.object.children[0].material.map;
        console.log(texture, "texture-------");
        // const fnOnj = planeAnimate(texture);
        // this.viewer.addAnimate(fnOnj);
      });

      this.modelLoader.loadModelToScene("../../../public/glb/jiarelu.glb", (baseModel) => {
        //baseModel是一个函数
        const model = baseModel.gltf.scene;
        model.scale.set(0.0001 * 5, 0.0001 * 5, 0.0001 * 5);
        model.position.set(0, 0, 0);
        model.name = "一号加热炉";
        baseModel.openCastShadow();

        const texture = baseModel.object.children[0].material.map;
        console.log(texture, "texture-------");
        // const fnOnj = planeAnimate(texture);
        // this.viewer.addAnimate(fnOnj);
      });

      this.modelLoader.loadModelToScene("../../../public/glb/datacenter.glb", (baseModel) => {
        baseModel.setScalc(0.2); //设置模型比例
        const model = baseModel.gltf.scene;
        model.position.set(0, 0, 0);
        model.name = "机房";
        baseModel.openCastShadow();

        const texture = baseModel.object.children[0].material.map;
        console.log(texture, "texture-------");
        // const fnOnj = planeAnimate(texture);
        // this.viewer.addAnimate(fnOnj);
      });


    }, 
  },
};
</script>

<style scoped lang="scss">
#container {
  position: absolute;
}
</style>