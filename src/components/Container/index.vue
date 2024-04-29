<template>
  <!-- <div id="container"></div> -->
  <div
    id="three"
    style="width: 100%; height: 100%; position: absolute; z-index: 1"
  ></div>
</template>

<script>
import Viewer from "@/modules/Viewer/index.js";
import ModelLoader from "@/modules/ModelLoder/index.js";
import gsap from "gsap";
import * as THREE from "three";
import Event from "@/modules/Viewer/Events.ts";
import BoxHelperWrap from "@/modules/BoxHelperWrap/index.js";
import { checkNameIncludes, findParent } from "@/utils/object.js";

// const OrbitControls = require("three-orbit-controls")(THREE);
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
      console.log(item, "0000000000"); //Scene-6个Children（AmbientLight，DirectionalLight,AxesHelper,BoxHelper,Group-plane,Group-机房）
    });
  },
  methods: {
    init() {
      this.viewer = new Viewer("three");
      this.viewer.addAxis();
      // this.viewer.addStats();
      this.viewer.initRaycaster(); /**注册鼠标事件监听 */

      this.modelLoader = new ModelLoader(this.viewer);
      // const floors = new Floors(viewer);
      // floors.addGird();

      this.boxHelperWrap = new BoxHelperWrap(this.viewer);
      //on(type, handler)定义函数 on来注册事件，以type为属性，[handler]为属性值，存储在 all 中，属性值为数组的原因是可能存在监听一个事件，多个处理程序
      // this.viewer.emitter.on(Event.dblclick.raycaster, (list) => {
      //   this.onMouseClick(list);
      // });

      // this.viewer.emitter.on(Event.mousemove.raycaster, (list) => {
      //   this.onMouseMove(list);
      // });
    },
    initModel() {
      this.modelLoader.loadModelToScene(
        "../../../public/glb/plane.glb",
        (baseModel) => {
          //baseModel是一个函数
          const model = baseModel.gltf.scene;
          model.scale.set(0.0001 * 5, 0.0001 * 5, 0.0001 * 5);
          model.position.set(0, 0, 0);
          model.name = "地板动画";
          baseModel.openCastShadow();

          const texture = baseModel.object.children[0].material.map;
          console.log(texture, "texture-------");
          const fnOnj = this.planeAnimate(texture);
          this.viewer.addAnimate(fnOnj);
        }
      );

      this.modelLoader.loadModelToScene(
        "../../../public/glb/jiarelu.glb",
        (baseModel) => {
          // baseModel是一个函数
          const model = baseModel.gltf.scene;

          model.scale.set(0.0001 * 20, 0.0001 * 20, 0.0001 * 20);
          model.position.set(-6, 0, -0.3);

          model.name = "一号加热炉";
          baseModel.openCastShadow();

          const texture = baseModel.object.children[0].material.map;
          console.log(texture, "texture-------");
          
          model.rotation.y = Math.PI; // Math.PI代表180度
        }
      );

      // this.modelLoader.loadModelToScene(
      //   "../../../public/glb/datacenter.glb",
      //   (baseModel) => {
      //     baseModel.setScalc(0.2); //设置模型比例
      //     const model = baseModel.gltf.scene;
      //     model.position.set(0, 0, 0);
      //     model.name = "机房";
      //     baseModel.openCastShadow();

      //     const texture = baseModel.object.children[0].material.map;
      //     console.log(texture, "texture-------");
      //     // const fnOnj = planeAnimate(texture);
      //     // this.viewer.addAnimate(fnOnj);
      //   }
      // );
    },
    planeAnimate(texture) {
      console.log(texture, "texture");
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      const animateFn = {
        fun: () => {
          const count = texture.repeat.y;
          if (count <= 10) {
            texture.repeat.x += 0.01;
            texture.repeat.y += 0.02;
          } else {
            texture.repeat.x = 0;
            texture.repeat.y = 0;
          }
        },
        content: this.viewer,
      };
      return animateFn;
    },
    onMouseClick(intersects) {
      if (!intersects.length) return;
      const selectedObject = intersects[0].object;

      let selectedObjectName = "";
      const findClickModel = (object) => {
        console.log(object, "object");
        if (object.type === "Group") {
          selectedObjectName = object.name;
        }
        if (object.parent && object.type !== "Scene") {
          findClickModel(object.parent);
        }
      };
      findClickModel(selectedObject);
      console.log(selectedObjectName);
      console.log(selectedObject, "selectedObject");
    },
    onMouseMove(intersects) {
      if (!intersects.length) {
        this.popoverRef.value.setShow(false);
        this.boxHelperWrap.setVisible(false);
        return;
      }
      const selectedObject = intersects[0].object || {};

      let selectedObjectName = "";
      const findClickModel = (object) => {
        if (object.name.includes("rack")) {
          selectedObjectName = object.name;
          return;
        }
        if (object.parent) {
          findClickModel(object.parent);
        }
      };

      findClickModel(selectedObject);

      window.console.log(selectedObjectName, "--selectedObjectName---");
      console.log(selectedObject, "------selectedObject---------");
      const rack = findParent(selectedObject, checkIsRack);
      console.log(rack, "-------rack---------");
      if (rack) {
        this.boxHelperWrap.attach(rack);
        updateRackInfo(rack.name);
      }

      modelSelect.forEach((item) => {
        if (item === selectedObject.parent.name) {
          modelMoveName = item;
          if (modelSelectName === modelMoveName) return;
          office.object.getObjectByName(item).traverse(function (child) {
            if (child.isMesh) {
              child.material = new THREE.MeshPhongMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                depthTest: false,
                depthWrite: true, // 无法被选择，鼠标穿透
                color: "yellow",
                opacity: 0.3,
              });
            }
          });
        } else {
          if (!isModelSelectName && oldOffice) {
            let oldmodel = oldOffice.getObjectByName(item);
            office.object.getObjectByName(item).traverse(function (child) {
              if (child.isMesh) {
                child.material = oldmodel.getObjectByName(child.name).material;
              }
            });
          }
        }
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