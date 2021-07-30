<!--suppress ALL -->
<template>
  <div class="wrap">
    <el-container>
      <el-header>
        <span class="header-wrap">视频监控中心</span>
      </el-header>

      <el-container>
        <!-- <el-aside width="200px">左标题 -->
        <el-aside>
          <el-card class="box-card">
            <div  slot="header" class="clearfix">
              <span class="title_style"> 违规分布</span>
            </div>
            <!-- <div v-for="o in 4" :key="o" class="text item">
            {{'列表内容 ' + o }}
          </div> -->
            
            <el-row>
              <el-col :span="8">
                <span class="content_style">吸烟违规</span>
              </el-col>
              <el-col :span="16">
                <el-progress :text-inside="true" :percentage="20" :stroke-width="14"  ></el-progress>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span class="content_style">未带安全帽</span>
              </el-col>
              <el-col :span="16">
                <el-progress :text-inside="true" :percentage="40" :stroke-width="14" ></el-progress>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span class="content_style">打电话违规</span>
              </el-col>
              <el-col :span="16">
                <el-progress :text-inside="true" :percentage="30" :stroke-width="14" ></el-progress>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span class="content_style">抽油机故障</span>
              </el-col>
              <el-col :span="16">
                <el-progress :text-inside="true" :percentage="50" :stroke-width="14" ></el-progress>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span class="content_style">漏油</span>
              </el-col>
              <el-col :span="16">
                <el-progress :text-inside="true" :percentage="10" :stroke-width="14" ></el-progress>
              </el-col>
            </el-row>
          </el-card>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="title_style">违规情况统计</span>
            </div>
            <!-- <div v-for="o in 4" :key="o" class="text item">
            {{'列表内容 ' + o }}
          </div> -->
            <!-- <div id="lineCharts" > -->
            <div id="echarts_box" style="height: 150px"></div>
            <!-- </div>  -->
          </el-card>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="title_style">违规详情</span>
            </div>
            <el-alert title="转油5站检测到抽烟人员" type="success" class="background_color"></el-alert>
            <el-alert title="转油3站检测漏油发生" type="info"  class="background_color"> </el-alert>
            <el-alert title="集油间发现施工人员未带安全帽" type="warning"  class="background_color"> </el-alert>
            <el-alert title="第5联合站发现人员入侵" type="error"  class="background_color"> </el-alert>
          </el-card>
        </el-aside>
        <el-main>
          <div id="container"></div>
        </el-main>
        <el-aside>
          <!-- 右标题 -->
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="title_style">各场所违规分布</span>
            </div>
            <div class="tag-group">
              <div
                v-for="item in [
                  { type: '#409EFF', label: '联合站',percent:'80',sum:'50' },
                  { type: '#67C23A', label: '转油站',percent:'26',sum:'60' },
                  { type: '#909399', label: '配水间',percent:'18',sum:'40' },
                  { type: '#F56C6C', label: '集油间',percent:'63',sum:'20' },
                  { type: '#E6A23C', label: '抽油机',percent:'37',sum:'30' },
                ]"
                :key="item.label"
              >
                <el-row>
                  <el-col :span="6">
                    <el-tag :color="item.type" effect="dark">
                      {{ item.label }}
                    </el-tag>
                  </el-col>
                  <el-col :span="14" >
                    <el-progress
                      :percentage="item.percent"
                      :stroke-width="30"
                      :color="item.type"
                      :text-inside="true"
                    ></el-progress>
                  </el-col>
                  <el-col span="4">
                    <el-tag color="rgb(3, 20, 52)" effect="dark">
                      {{ item.sum }}
                    </el-tag>
                  </el-col>
                </el-row>
              </div>
            </div>

            
          </el-card>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="title_style">运行状态</span>
            </div>
            <div class="pie-bar">
              <div id="pieBar1" style="height: 150px"></div>
              <span style="color:#00ffff">联合站</span>
            </div>
            <div class="pie-bar">
              <div id="pieBar2" style="height: 150px"></div>
              <span style="color:#00ffff">转油站</span>
            </div>
            <div class="pie-bar">
              <div id="pieBar3" style="height: 150px"></div>
              <span style="color:#00ffff">配水间</span>
            </div>
          </el-card>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span class="title_style">整体违规风险评估</span>
            </div>
            <!-- <div v-for="o in 4" :key="o" class="text item">
              {{ "列表内容 " + o }}
            </div> -->
            <div id="radarCharts" style="height: 200px"></div>
          </el-card>
        </el-aside>
      </el-container>
    </el-container>


  </div>
</template>
<script>
import * as echarts from "echarts";

import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
// import MTLLoader from  'three-mtl-loader';
// import OBJLoader from  'three-obj-loader';
import { CSS2DRenderer, CSS2DObject } from "three-css2drender";

const OrbitControls = require("three-orbit-controls")(THREE);
export default {
  name: "threeMap",
  data() {
    return {
      scene: "",
      labelRenderer: "",
      light: "",
      camera: "",
      controls: "",
      renderer: "",
      geometry: "",
      material: "",
      cube: "",
      fov: 45,
      biaozhudiv: "",
      img: "",
      biaozhuLabel: "",
      
    };
  },
  mounted() {
    this.init();

    this.addObj();
    //this.initGrid();
    this.animate();

    this.createEchart();
    this.createEchartPie();
    this.createEchartRadar();
  },
  // destroyed(){
  //   console.log("实例已经被销毁");
  // },
  methods: {
    init() {
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0x999999)); //环境光
      this.light = new THREE.DirectionalLight(0xdfebff, 0.45); //从正上方（不是位置）照射过来的平行光，0.45的强度
      this.light.position.set(50, 200, 100);
      this.light.position.multiplyScalar(0.3);
      this.scene.add(this.light);
      //初始化相机
      // this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera = new THREE.PerspectiveCamera(
        this.fov,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      //this.camera.position.set(10, 90, 65);
      this.camera.position.set(10, 90, 65);
      this.camera.lookAt(this.scene.position);

      //渲染
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
      }); //会在body里面生成一个canvas标签,
      this.renderer.setPixelRatio(window.devicePixelRatio); //为了兼容高清屏幕
      this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight);

      const container = document.getElementById("container");
      container.appendChild(this.renderer.domElement);

      // console.log("子节点：", container.childNodes[0])
      //初始化控制器
      this.controls = new OrbitControls(this.camera, container);
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 80;
      this.controls.maxDistance = 400;
      this.controls.maxPolarAngle = Math.PI / 3;
      this.controls.update();

      //标注渲染
      this.labelRenderer = new CSS2DRenderer();
      this.labelRenderer.setSize(window.innerWidth * 0.6, window.innerHeight);
      this.labelRenderer.domElement.style.position = "absolute";
      // this.labelRenderer.domElement.style.position = 'relative';
      this.labelRenderer.domElement.style.top = 0;
      container.appendChild(this.labelRenderer.domElement);
      // window.addEventListener('resize', this.onWindowResize, false);//添加窗口监听事件（resize-onresize即窗口或框架被重新调整大小）
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
      this.labelRenderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    },
    initGrid() {
      // 网格的边长是1000，100小格子
      var helper = new THREE.GridHelper(200, 20, 0x0000ff, 0x808080);
      //helper.setColors( 0x0000ff, 0x808080 );
      this.scene.add(helper);
    },
    addObj() {
      //包含材质
      new MTLLoader()
        .setPath("/static/model/modelFirst/")
        .load("modelFirst.mtl", (materials) => {
          console.log("materials", materials);
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/modelFirst/")
            .load("modelFirst.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              // obj.position.set(-40, -50, 10);
              obj.position.set(-40, -50, 10);
              // this.addSprite(-95, -55, -110, '/static/image/shoop.png', -70, '12号', obj, function () {
              // });
              // this.addSprite(-80, -65, -90, '/static/image/cloth.png', -52, '13号', obj, function () {
              // });
              // this.addSprite(-100, -45, -80, '/static/image/apple.png', -63, '14号', obj, function () {
              // });

              // this.addSprite(-95, -55, -110, '/static/image/shoop.png', -70, '12号', obj, function () {
              // });
              // this.addSprite(-80, -65, -90, '/static/image/cloth.png', -52, '13号', obj, function () {
              // });
              // this.addSprite(-100, -45, -80, '/static/image/apple.png', -63, '14号', obj, function () {
              // });

              this.addSprite(
                -95,
                -55,
                -110,
                "/static/image/shoop.png",
                -70,
                "1号联合站",
                obj,
                function () {}
              );
              this.addSprite(
                -80,
                -65,
                -90,
                "/static/image/cloth.png",
                -52,
                "2号联合站",
                obj,
                function () {}
              );
              this.addSprite(
                -100,
                -45,
                -80,
                "/static/image/apple.png",
                -63,
                "1号转油站",
                obj,
                function () {}
              );

              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/VANS/")
        .load("VANS.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/VANS/")
            .load("VANS.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              //this.addSprite(-165, -55, -170, '/static/image/vans.png', -58, '15号', obj, () => {
              this.addSprite(
                -165,
                -55,
                -170,
                "/static/image/vans.png",
                -58,
                "",
                obj,
                () => {
                  this.viewDetailModel();
                }
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/LEVIS/")
        .load("LEVIS.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/LEVIS/")
            .load("LEVIS.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              //this.addSprite(-170, -40, -100, '/static/image/television.png', -64, '16号', obj, function () {
              this.addSprite(
                -170,
                -40,
                -100,
                "/static/image/television.png",
                -64,
                "",
                obj,
                function () {}
              );
              //this.addSprite(-170, -35, -120, '/static/image/jac.png', -100, '17号', obj, function () {
              this.addSprite(
                -170,
                -35,
                -120,
                "/static/image/jac.png",
                -100,
                "",
                obj,
                function () {}
              );
              //this.addSprite(-170, -40, -140, '/static/image/clo.png', -47, '18号', obj, function () {
              this.addSprite(
                -170,
                -40,
                -140,
                "/static/image/clo.png",
                -47,
                "",
                obj,
                function () {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/sanxing/")
        .load("sanxing.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/sanxing/")
            .load("sanxing.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                -125,
                -40,
                -98,
                "/static/image/phone.png",
                -50,
                "1号配水间",
                obj,
                function () {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/CA/")
        .load("CA.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/CA/")
            .load("CA.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                -130,
                -35,
                -60,
                "/static/image/car.png",
                -37,
                "2号配水间",
                obj,
                function () {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/SHOES/")
        .load("SHOES.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/SHOES/")
            .load("SHOES.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                -90,
                -50,
                -155,
                "/static/image/shoes.png",
                -70,
                "1号集油间",
                obj,
                function () {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/square/")
        .load("zhengfangxing.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/square/")
            .load("zhengfangxing.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                -90,
                -50,
                -55,
                "/static/image/sensor.png",
                -95,
                "1号监控",
                obj,
                () => {
                  this.alarmDetail();
                }
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/LOHO/")
        .load("LOHO.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/LOHO/")
            .load("LOHO.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              //this.addSprite(-30, -55, -180, '/static/image/lv.png', -67, '11号抽油机', obj, () => {
              this.addSprite(
                -30,
                -55,
                -180,
                "/static/image/lv.png",
                -67,
                "",
                obj,
                () => {}
              );
              this.addSprite(
                -30,
                -55,
                -160,
                "/static/image/card.png",
                -68,
                "2号集油间",
                obj,
                () => {}
              );
              this.addSprite(
                50,
                -55,
                -160,
                "/static/image/liangshi.png",
                -79,
                "1号抽油机",
                obj,
                () => {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/TWICE/")
        .load("TWICE.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/TWICE/")
            .load("TWICE.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                -20,
                -55,
                -110,
                "/static/image/demand.png",
                -71,
                "2号抽油机",
                obj,
                () => {}
              );
              this.addSprite(
                -20,
                -55,
                -90,
                "/static/image/lifang.png",
                -64,
                "3号抽油机",
                obj,
                () => {}
              );
              // this.addSprite(-20, -55, -70, '/static/image/dance.png', -69, '8号抽油机', obj, () => {
              // });
              this.addSprite(
                -20,
                -55,
                -70,
                "/static/image/dance.png",
                -69,
                "4号抽油机",
                obj,
                () => {}
              );
              this.addSprite(
                30,
                -55,
                -120,
                "/static/image/sleep.png",
                -80,
                "5号抽油机",
                obj,
                () => {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/manji/")
        .load("manji.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/manji/")
            .load("manji.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                30,
                -55,
                -70,
                "/static/image/candy.png",
                -79,
                "6号抽油机",
                obj,
                () => {}
              );

              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/REPUBLIC/")
        .load("REPUBLIC.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/REPUBLIC/")
            .load("REPUBLIC.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                90,
                -45,
                -70,
                "/static/image/puhblic.png",
                -126,
                "7号抽油机",
                obj,
                () => {}
              );
              this.addSprite(
                70,
                -70,
                -70,
                "/static/image/humbar.png",
                -66,
                "8号抽油机",
                obj,
                () => {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/JUSTCAVALLI/")
        .load("JUSTCAVALLI.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/JUSTCAVALLI/")
            .load("JUSTCAVALLI.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                140,
                -45,
                -80,
                "/static/image/juice.png",
                -126,
                "9号抽油机",
                obj,
                () => {}
              );
              this.scene.add(obj);
            });
        });
      new MTLLoader()
        .setPath("/static/model/taizhuolong/")
        .load("taizhuolong.mtl", (materials) => {
          materials.preload();
          new OBJLoader()
            .setMaterials(materials)
            .setPath("/static/model/taizhuolong/")
            .load("taizhuolong.obj", (obj) => {
              obj.scale.set(0.8, 0.8, 0.8);
              obj.position.set(-40, -50, 10);
              this.addSprite(
                120,
                -45,
                -120,
                "/static/image/long.png",
                -73,
                "10号抽油机",
                obj,
                () => {}
              );
              this.scene.add(obj);
            });
        });
    },
    addSprite(x, y, z, image, loc, text, Mash, callback) {
      //添加div标签
      this.biaozhudiv = document.createElement("div");
      //添加图标标签
      // this.img = document.createElement('img');
      // this.img.src = image;
      // this.img.style.marginLeft = loc + 'px';
      this.biaozhudiv.className = "lable";
      //两者的执行顺序
      this.biaozhudiv.textContent = text;
      //this.biaozhudiv.appendChild(this.img);
      //标注的样式
      this.biaozhudiv.id = "biaozhu";
      this.biaozhudiv.style.color = "rgb(" + 0 + "," + 0 + "," + 0 + ")";
      this.biaozhudiv.style.fontSize = 15 + "px";
      this.biaozhudiv.style.fontFamily = "Georgia,serif";
      this.biaozhudiv.style.cursor = "pointer";
      this.biaozhudiv.onclick = function () {
        callback(Mash);
      };
      this.biaozhuLabel = new CSS2DObject(this.biaozhudiv);
      this.biaozhuLabel.position.set(x, y, z);
      Mash.add(this.biaozhuLabel);
    },
    //传感器详情界面
    alarmDetail() {
      // this.$router.push("alarmPage");
      // console.log("跳转到监控界面");
      let routeUrl = this.$router.resolve({
                path: "/alarmPage",//路由的名称
                
            });
      window.open(routeUrl.href, '_blank');
    },
    //点击模块查看信息的3D界面
    viewDetailModel() {
      // this.fov = 80;
      // //改变相机
      // this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 1, 1000);
      // this.camera.position.set(-20, 20, 35);
      // this.camera.lookAt(this.scene.position);
      // //控制器
      // this.controls = new OrbitControls(this.camera);
      // this.controls.target.set(0, 0, 0);
      // this.controls.minDistance = 80;
      // this.controls.maxDistance = 400;
      // this.controls.maxPolarAngle = Math.PI / 3;
      // this.controls.update();
      console.log("清除场景");
    },
    createEchart() {
      // 1. 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById("echarts_box"));
      // 2. 发起请求，获取数据
      // const { data: res } = await this.$http.get('reports/type/1')
      // if (res.meta.status !== 200) {
      //    return this.$message.error('获取折线图数据失败！')
      // }
      var lineData = [6, 15, 10, 17, 10, 16, 12];
      var max = 0;

      for (var i = 0; i < lineData.length; i++) {
        if (max < lineData[i]) {
          max = lineData[i];
        }
      }
      if (max % 10 == 0) {
        max += 10;
      } else {
        max = Math.ceil(max / 10) * 10;
      }

      var optionL = {
        color: ["#2fffff"],
        // color: ['#000000'],
        tooltip: {
          formatter: function (params) {
            return params.value;
          },
        },
        grid: {
          left: "3%",
          right: "5%",
          bottom: "3%",
          top: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: ["20/1", "20/2", "20/3", "20/4", "20/5", "20/6", "20/7"],
            axisLine: {
              lineStyle: {
                // color: '#6b6e86'
                //color: "#000000",
                color: "#ffffff",
              },
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              fontSize: 12,
              textStyle: {
                color: '#ffffff'
                // color: "#000000",
              },
            },
          },
          {
            type: "category",
            axisLine: {
              lineStyle: {
                // color: '#6b6e86'
                // color: "#000000",
                color: "#ffffff",
              },
              onZero: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            max: max,
            axisLine: {
              lineStyle: {
                // color: '#6b6e86'
                // color: "#000000",
                color: "#ffffff",
              },
              show: true,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              fontSize: 12,
              textStyle: {
                color: '#ffffff'
                // color: "#000000",
              },
            },
            splitLine: {
              show: false,
            },
          },
          {
            type: "value",
            axisLine: {
              lineStyle: {
                // color: '#6b6e86'
                // color: "#000000",
                color: "#ffffff",
              },
              onZero: false,
              show: true,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            data: lineData,
            type: "line",
            smooth: true,
            itemStyle: {
              emphasis: {
                // borderColor: '#e60012'
                borderColor: "#000000",
              },
            },
          },
        ],
      };

      // 3. 使用刚指定的配置项和数据，显示图表
      myChart.setOption(optionL);
    },
    createEchartPie() {
      var pieList = [80, 70, 60];
      var pieBar1 = echarts.init(document.getElementById("pieBar1"));
      var optionp1 = {
        grid: {
          top: "3%",
          bottom: "3%",
        },
        series: [
          {
            name: "valueOfMarket",
            type: "pie",
            center: ["50%", "40%"], // 饼图的圆心坐标
            radius: ["50%", "60%"],
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
              //  饼图图形上的文本标签
              normal: {
                // normal 是图形在默认状态下的样式
                show: true,
                position: "center",
                formatter: "{c}%",
              },
            },
            data: [
              {
                value: pieList[0],
                name: "name",
                itemStyle: {
                  color: "#FF6A6A",
                },
                label: {
                  // color: "#000000",
                  color: "#ffffff",
                },
              },
              {
                value: 100 - pieList[0],
                name: "",
                itemStyle: {
                  color: "#4EEE94",
                },
              },
            ],
          },
        ],
      };

      pieBar1.setOption(optionp1);

      var pieBar2 = echarts.init(document.getElementById("pieBar2"));
      var optionp2 = {
        grid: {
          top: "3%",
          bottom: "3%",
        },
        series: [
          {
            name: "valueOfMarket",
            type: "pie",
            center: ["50%", "40%"], // 饼图的圆心坐标
            radius: ["50%", "60%"],
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
              //  饼图图形上的文本标签
              normal: {
                // normal 是图形在默认状态下的样式
                show: true,
                position: "center",
                formatter: "{c}%",
              },
            },

            data: [
              {
                value: pieList[1],
                name: "name",
                itemStyle: {
                  color: "#1E90FF",
                },
                label: {
                  color: "#ffffff",
                },
              },
              {
                value: 100 - pieList[1],
                name: "",
                itemStyle: {
                  color: "#9932CC",
                },
              },
            ],
          },
        ],
      };

      pieBar2.setOption(optionp2);

      var pieBar3 = echarts.init(document.getElementById("pieBar3"));
      var optionp3 = {
        grid: {
          top: "3%",
          bottom: "3%",
        },
        series: [
          {
            name: "valueOfMarket",
            type: "pie",
            center: ["50%", "40%"], // 饼图的圆心坐标
            radius: ["50%", "60%"],
            avoidLabelOverlap: false,
            hoverAnimation: false,
            label: {
              //  饼图图形上的文本标签
              normal: {
                // normal 是图形在默认状态下的样式
                show: true,
                position: "center",
                formatter: "{c}%",
              },
            },
            data: [
              {
                value: pieList[2],
                name: "name",
                itemStyle: {
                  color: "#2effff",
                },
                label: {
                  color: "#ffffff",
                },
              },
              {
                value: 100 - pieList[2],
                name: "",
                itemStyle: {
                  color: "#0f5058",
                },
              },
            ],
          },
        ],
      };

      pieBar3.setOption(optionp3);
    },
    createEchartRadar(){
      var radarCharts = echarts.init(document.getElementById('radarCharts'));

      var optionR = {
        color: ['#58ffff', '#fff100', '#007aff'],
        tooltip: {},
        radar: {
          name: {
            textStyle: {
              // color: '#000',
              color: '#00ffff',
              fontSize: 12
            }
          },
          splitArea: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#212527'
            }
          },
          radius: "48%",
          indicator: [{
              name: '正常运行状态',
              max: 24
            },
            {
              name: '警戒状态',
              max: 16
            },
            {
              name: '紧急状态',
              max: 30
            },
            {
              name: '异常状态',
              max: 38
            },
            {
              name: '恢复状态',
              max: 52
            },
            {
              name: '系统状态',
              max: 25
            }
          ]
        },
        series: [{
          name: '故障占比',
          type: 'radar',
          data: [{
              value: [18, 15, 28, 35, 50, 24],
              name: '类型一'
            },
            {
              value: [8, 8, 28, 31, 42, 21],
              name: '类型二'
            },
            {
              value: [4, 3, 10, 11, 12, 23],
              name: '类型三'
            }
          ]
        }]
      };

      radarCharts.setOption(optionR)
    }
  },
};
</script>

<style scoped>
.wrap {
  position: relative;
  height: 100%;
/*  background: url('../images/bg.png') no-repeat;*/
  background-size: 100% 100%;
  background-color: rgb(3, 20, 52);
  /* background:-webkit-linear-gradient(); */
}

.header-wrap {
  /* position: absolute; */
  position: absolute;
  top: 10;
  left: 0;
  right: 0;
  margin-left: 24px;
  height: 80px;
  background-size: auto 70%;
  z-index: 222;
  text-align: center;
  line-height: 80px;
  font-size: 60px;
  /* color: #fff; */
  font-weight: bold;
  background-image:-webkit-linear-gradient(left,rgb(0,121,255),rgb(0,255,255),rgb(0,121,255)); 
  -webkit-background-clip:text; 
  -webkit-text-fill-color:transparent; 

}
.box-card{
  background-color: rgb(3, 20, 52);
  /* border-color: rgb(2, 19, 49);  */
  border: 1px solid rgb(56,98,145);
  color: #fff;
  border-radius:10px;
}
.title_style{
  text-align: center; 
  display: block;
  color:#00ffff;
  font-size: 30px;
}
.content_style{
  text-align: center; 
  display: block;
  color:#00ffff;
  
}
/* .progressBar >>> .el-progress-bar__outer {
  background-color: #386291;
}  */
.el-progress--line >>> .el-progress-bar__outer {
  background-color: rgb(56,98,145);
}
.box-card /deep/ .el-card__header {
    border-bottom: 1px solid rgb(56,98,145);
  }
.el-progress-circle__track {
  stroke: #386291;
}
/* .el-progress-bar__outer {
  stroke: #386291;
} */
/* .el-card__header{
  border-bottom: 1px solid rgb(56,98,145);
} */
.el-font-color{
  color: #fff;
}
.background_color{
   background-color: rgb(3, 20, 52);
}
.el-header {
  height: 10%;
}
.el-container {
  /*设置内部填充为0，几个布局元素之间没有间距*/
  padding: 0px;
  /*外部间距也是如此设置*/
  margin: 0px;
  /*统一设置高度为100%*/
  height: 100%;
  width: 100%;
}
.el-aside {
  width: 10%;
  padding: 0px;
  /*外部间距也是如此设置*/
  margin: 0px;
}
.box-card {
  height: 32%;
}
/* .el-row{
    background-color: coral;
    
  }
  .el-col{
    background-color: cornflowerblue;
    color: #ffffff;
    padding: 10px 0;
  } */
.pie-bar {
  float: left;
  position: relative;
  width: 33%;
  height: 100%;
}
.pie-bar span {
  position: absolute;
  left: 50%;
  bottom: 10%;
  /* color: #0a0a0a; */
  color: #ffffff;
  font-size: 12px;
  transform: translateX(-50%);
}
.wrap-item-1 {
  position: relative;
  padding: 0 24px;
  height: 30%;
}
.item-title {
  height: 50px;
  line-height: 50px;
  color: #000000;
  font-size: 20px;
}
.item-box {
  position: absolute;
  top: 56px;
  left: 24px;
  right: 24px;
  bottom: 0;
}
.fault-box {
  height: 100%;
}
.fault-box li .fault-icon {
  float: left;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  color: #00ffff;
  background: #053336;
}
/* 左上角进度条样式 */
.fault-name .block-bar {
  float: right;
  margin-top: 4px;
  width: 55%;
}
</style>
