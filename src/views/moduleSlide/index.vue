<template>
  <div class="app-container">
    <div style="display: flex; justify-content: space-between">
      <div
        class="filter-container"
        :style="{ width: showCameraList ? '75%' : '100%' }"
      >
        <div>
          <el-select
            style="height: 36px"
            size="medium"
            v-model="listQuery.edgeId"
            placeholder="请选择设备"
            clearable
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in edgeList"
              :key="item.id"
              :label="item.edgeName"
              :value="item.id"
            />
          </el-select>
          <el-input
            size="medium"
            v-model="listQuery.moduleName"
            style="width: 10%; height: 36px"
            @keyup.enter.native="handleFilter"
            placeholder="请输入模型名称"
            clearable
          />
          <el-button
            style="margin-left: 14px"
            size="mini"
            v-waves
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
            >搜索</el-button
          >
          <el-button
            size="mini"
            type="primary"
            style="width: 100px"
            v-permission="'analyticsModule:add'"
            icon="el-icon-circle-plus"
            @click="showCreate"
          >
            添加
          </el-button>
        </div>
        <br />
        <el-table
          :data="moduleList"
          border
          :height="700"
          fit
          highlight-current-row
          style="font-size: 16px"
          :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
        >
          <el-table-column
            align="center"
            label="序号"
            prop="id"
            min-width="3"
          ></el-table-column>
          <el-table-column
            align="center"
            label="模型名称"
            prop="moduleName"
            min-width="8"
          ></el-table-column>
          <el-table-column
            align="center"
            label="设备名称"
            prop="edgeName"
            min-width="8"
          ></el-table-column>
          <el-table-column
            align="center"
            label="模型类型"
            prop="moduleType"
            min-width="8"
          ></el-table-column>
          <el-table-column
            align="center"
            label="模型说明"
            prop="description"
            min-width="6"
          ></el-table-column>
          <el-table-column
            v-if="this.edgeType == '0'"
            align="center"
            label="绑定摄像头"
            min-width="8"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                style="font-size: 18px"
                @click="opencameraList(scope.row.id)"
                >摄像头组</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-else
            align="center"
            label="绑定摄像头"
            min-width="8"
            prop="bdCamera"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                style="font-size: 18px"
                @click="opencameraList(scope.row.id)"
                >列表</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="this.edgeType == '0'"
            align="center"
            label="最大摄像头检测量"
            prop="maxCameraNum"
            min-width="6"
          ></el-table-column>
          <el-table-column
            v-if="this.edgeType == '1'"
            align="center"
            label="模型运行时间"
            prop="runningTime"
            min-width="6"
          ></el-table-column>
          <el-table-column align="center" label="状态" min-width="5">
            <template v-slot="scope">
              <el-tag
                v-if="['200', '201'].includes(scope.row.status)"
                type="success"
                style="width: 100%"
                disable-transitions
                >{{ statusMap[scope.row.status] }}</el-tag
              >
              <el-tag
                v-else-if="['6', '7'].includes(scope.row.status)"
                type="danger"
                style="width: 100%"
                disable-transitions
                >{{ statusMap[scope.row.status] }}</el-tag
              >
              <el-tag
                v-else-if="
                  scope.row.status === '4' && scope.row.heartbeatCount > 5
                "
                style="width: 100%"
                type="danger"
                disable-transitions
                >检测失败</el-tag
              >
              <el-tag
                v-else
                type="info"
                style="width: 100%"
                disable-transitions
                >{{ statusMap[scope.row.status] }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="版本"
            prop="version"
            min-width="4"
          ></el-table-column>
          <el-table-column
            align="center"
            label="预处理"
            prop="opencv"
            min-width="5"
          >
            <template slot-scope="scope">
              {{ scope.row.opencv === 0 ? "关闭" : "开启" }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="最近修改时间"
            prop="updateTime"
            min-width="14"
          ></el-table-column>
          <el-table-column align="center" label="管理" min-width="18">
            <template v-slot="scope">
              <template
                v-if="['1', '2', '6', '7', '9'].includes(scope.row.status)"
              >
                <el-button
                  size="mini"
                  :plain="true"
                  type="primary"
                  style="font-size: 18px"
                  @click="showUpdate(scope.$index)"
                  v-permission="'analyticsModule:update'"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  :plain="true"
                  type="primary"
                  style="font-size: 18px"
                  @click="showUpload(scope.$index)"
                  v-permission="'analyticsModule:update'"
                  >上传</el-button
                >
              </template>
              <template v-if="['2', '6'].includes(scope.row.status)">
                <el-button
                  size="mini"
                  :plain="true"
                  type="primary"
                  style="font-size: 18px"
                  v-permission="'analyticsModule:newRelease'"
                  @click="newSyncFile(scope.$index)"
                  >同步</el-button
                >
              </template>
              <template v-else-if="['3', '7', '9'].includes(scope.row.status)">
                <el-button
                  size="mini"
                  :plain="true"
                  type="primary"
                  style="font-size: 18px"
                  @click="commandModule(scope.$index, 'start')"
                  v-permission="'analyticsModule:newRelease'"
                  >发布</el-button
                >
              </template>
              <template v-else-if="['200', '201'].includes(scope.row.status)">
                <el-button
                  size="mini"
                  :plain="true"
                  type="primary"
                  style="font-size: 18px"
                  @click="commandModule(scope.$index, 'close')"
                  v-permission="'analyticsModule:newRelease'"
                  >停止</el-button
                >
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div
        class="filter-container"
        v-show="showCameraList"
        style="width: 25%; margin-top: 55px"
      >
        <el-table
          v-if="this.edgeType == '1'"
          :data="cameraList"
          border
          fit
          :height="700"
          highlight-current-row
          style="font-size: 16px"
          :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
        >
          <el-table-column
            align="center"
            label="摄像头名称"
            prop="cameraName"
          ></el-table-column>
        </el-table>
        <el-table
          v-else
          :data="cameraList"
          border
          fit
          highlight-current-row
          style="font-size: 16px"
          :header-cell-style="{ background: '#f5f7fa', color: '#409EFF' }"
        >
          <el-table-column
            align="center"
            label="摄像头组号"
            prop="cgroupId"
          ></el-table-column>
          <el-table-column align="center" label="摄像头" prop="cameraName">
            <template slot-scope="scope">
              <div v-for="(name, index) in scope.row.cameraName" :key="index">
                <div
                  v-text="name"
                  style="
                    display: inline-block;
                    vertical-align: middle;
                    margin-top: 4%;
                  "
                ></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="摄像头运行时间（秒）"
            prop="runTime"
          ></el-table-column>
          <el-table-column align="center" label="操作">
            <template v-slot="scope">
              <el-button
                size="mini"
                v-waves
                type="primary"
                @click="ShowupdateGroup(scope.$index)"
                >修改</el-button
              >
            </template>
          </el-table-column> </el-table
        ><br />
        <div
          style="display: flex; justify-content: center; align-items: center"
        >
          <el-button size="mini" type="primary" @click="addcameraGroup"
            >添加摄像头组</el-button
          >
          <el-button size="mini" type="primary" @click="openbindcamera"
            >绑定摄像头</el-button
          >
        </div>
      </div>

      <el-dialog title="绑定摄像头" :visible.sync="dialogallCamera">
        <el-table
          :data="allcamera"
          border
          fit
          highlight-current-row
          style="font-size: 16px"
          :header-cell-style="{ background: '#f5f7fa', color: '#409EFF' }"
        >
          <el-table-column
            align="center"
            prop="id"
            label="摄像头ID"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="cameraName"
            label="摄像头名称"
          ></el-table-column>
          <el-table-column align="center" label="绑定">
            <template v-slot="scope">
              <el-button
                size="mini"
                v-if="scope.row.status == '0'"
                v-waves
                type="primary"
                @click="bindcamera(scope.$index)"
                >绑定</el-button
              >
              <el-button
                size="mini"
                v-else
                v-waves
                type="primary"
                @click="unbindcamera(scope.$index)"
                >取消绑定</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="dialogFormVisible"
        width="600px"
      >
        <el-form
          class="small-space"
          :model="tempModule"
          label-position="right"
          label-width="100px"
        >
          <el-form-item label="设备名称" required>
            <el-select
              v-model="tempModule.edgeId"
              placeholder="请选择设备"
            >
              <el-option
                v-for="item in edgeList"
                :key="item.id"
                :label="item.edgeName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模型名称" required>
            <el-input
              type="text"
              v-model="tempModule.moduleName"
            />
          </el-form-item>
          <el-form-item label="模型类型">
            <el-input
              type="text"
              v-model="tempModule.moduleType"
            />
          </el-form-item>
          <el-form-item label="模型说明">
            <el-input
              type="textarea"
              autosize
              v-model="tempModule.description"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="version">
            <el-input
              type="text"
              v-model="tempModule.version"
              placeholder="模型的版本信息"
            >
            </el-input>
          </el-form-item>
          <el-form-item v-if="this.edgeType == '1'" label="模型运行时间">
            <el-input
              type="text"
              v-model="tempModule.runningTime"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="this.edgeType == '0'" label="最大摄像头检测数量">
            <el-input
              type="text"
              v-model="tempModule.maxCameraNum"
            ></el-input>
          </el-form-item>
          <el-form-item label="预处理状态" required>
            <el-select
              v-model="tempModule.opencv"
              placeholder="更改预处理状态"
            >
              <el-option
                v-for="item in opencv"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            v-if="dialogStatus === 'create'"
            type="primary"
            @click="createModule"
            >创 建</el-button
          >
          <el-button type="primary" v-else @click="updateModule"
            >修 改</el-button
          >
        </div>
      </el-dialog>
      <el-dialog title="模型上传" :visible.sync="uploadVisible" width="30%">
        <el-upload
          ref="upload"
          style="width: 40%"
          drag
          multiple
          :auto-upload="false"
          :action="uploadUrl"
          :limit="1"
          :data="uploadData"
          :file-list="fileList"
          :before-upload="handleBeforeUpload"
          :before-remove="beforeRemove"
          :on-error="handleUploadError"
          :on-exceed="handleExceed"
          :on-success="handleUploadSuccess"
        >
          <el-button slot="trigger" size="small" type="primary"
            >选取文件</el-button
          >
          <el-button
            style="margin-left: 56%"
            size="small"
            type="success"
            @click="handleUpload"
            >上传到服务器</el-button
          >
          <div style="white-space: nowrap" slot="tip" class="el-upload__tip">
            只能上传zip文件，且一次文件不超过500MB
          </div>
        </el-upload>

        <span slot="footer" class="dialog-footer">
          <el-button @click="uploadVisible = false">取 消</el-button>
        </span>
      </el-dialog>

      <el-dialog title="修改摄像头组" :visible.sync="dialogCamera" fullscreen>
        <span style="font-size: 20px"> 摄像头组运行时间:</span> &nbsp;<el-input
          type="text"
          v-model="tempCamera.runTime"
          placeholder="摄像头组运行时间"
          style="width: 40%"
        ></el-input>
        <el-button type="success" @click="updateCameraGroup">确 定</el-button>
        <el-button type="danger" @click="dialogCamera = false">关闭</el-button>
        <div style="display: flex">
          <div style="flex: 1">
            <h1 style="text-align: center">
              摄像头组表({{ this.hasNum + "/" + this.maxCameraNum }})
            </h1>
            <el-table
              :data="leftcameraList"
              border
              fit
              highlight-current-row
              style="font-size: 16px"
              :header-cell-style="{ background: '#f5f7fa', color: '#409EFF' }"
            >
              <el-table-column
                align="center"
                label="摄像头名"
                prop="cameraName"
              ></el-table-column>
              <el-table-column align="center" label="操作">
                <template v-slot="scope">
                  <el-button
                    size="mini"
                    v-waves
                    type="primary"
                    @click="deletecamera(scope.$index)"
                    >移出</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div style="flex: 1">
            <h1 style="text-align: center">未添加表</h1>
            <el-table
              :data="rightcameraList"
              border
              fit
              highlight-current-style="font-size: 16px"
              :header-cell-style="{ background: '#f5f7fa', color: '#409EFF' }"
            >
              <el-table-column
                align="center"
                label="摄像头名"
                prop="cameraName"
              ></el-table-column>
              <el-table-column align="center" label="操作">
                <template v-slot="scope">
                  <el-button
                    size="mini"
                    v-waves
                    type="primary"
                    @click="addcamera(scope.$index)"
                    >加入</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import waves from "@/directives/waves/index.js"; // 水波纹指令
export default {
  directives: {
    waves,
  },
  data() {
    return {
      dialogallCamera: false,
      moduleList: [],
      edgeList: [],
      cameraList: [],
      leftcameraList: [],
      rightcameraList: [],
      allcameraList: [],
      allcamera: [],
      tempcameraList: [],
      edgeType: "1",
      showCameraList: false,
      dialogCamera: false,
      maxCameraNum: "",
      opencv: [
        { id: 1, name: "开启" },
        { id: 0, name: "关闭" },
      ],
      hasNum: "",
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        moduleName: null,
        cameraName: null,
        edgeId: null,
        listLoading: false, //数据加载等待动画,
        moduleId: null,
      },
      uploadUrl:
        process.env.NODE_ENV === "production"
          ? "/analyticsModule/upload"
          : process.env.BASE_URL + "/analyticsModule/upload",
      fileList: [],
      uploadVisible: false,
      dialogStatus: "create",
      dialogFormVisible: false,
      tempCamera: {
        moduleId: null,
        cameraId: null,
        cgroupId: null,
        runTime: null,
      },
      tempModule: {
        id: null,
        edgeId: null,
        edgeName: null,
        moduleName: null,
        moduleType: null,
        description: null,
        version: null,
        runningTime: null,
        maxCameraNum: null,
        storagePath: null,
        syncPath: null,
        commandScript: null,
        mqQueue: null,
        opencv: null,
      },
      uploadData: {
        moduleId: null,
      },
      textMap: {
        update: "编辑",
        create: "新建",
      },
      statusMap: {
        1: "创建",
        2: "上传成功",
        3: "同步成功",
        4: "发布中",
        6: "同步失败",
        7: "发布失败",
        8: "停止中",
        9: "停止",
        10: "同步中",
        200: "正常运行",
        201: "无任务运行",
      },
    };
  },

  mounted() {
    document.body.style.zoom = "0.8";
  },
  created() {
    this.getAllEdgeEnds();
  },

  methods: {
    getallCamera(id) {
      this.allcamera = [];
      this.api({
        url: "/cameraInfo/listCamera",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        data.list.forEach((temp) => {
          this.allcamera.push({
            id: temp.id,
            cameraName: temp.cameraName,
            status: "0",
          });
        });
        this.getAllCameraList(id);
      });
    },
    getModuleList() {
      //获取模型
      this.api({
        url: "/analyticsModule/listAnalyticsModule",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        this.moduleList = data.list;
      });
    },
    getAllEdgeEnds() {
      //获取边缘端
      this.api({
        url: "/edgeInfo/listEdgeInfo",
        method: "get",
      }).then((data) => {
        this.edgeList = data.list;
      });
    },
    getAllCameraList(id) {
      //获取模型绑定的全部摄像头
      this.api({
        url: "/analyticsModule/listCameras",
        method: "get",
        params: {
          moduleId: id,
        },
      }).then((data) => {
        data.forEach((temp) => {
          let camera = this.allcamera.find((emp) => emp.id == temp.id);
          if (camera) {
            camera.status = "1";
          }
        });
      });
    },

    opencameraList(id) {
      if (this.showCameraList && id == this.listQuery.moduleId) {
        this.showCameraList = false;
        return;
      } else {
        this.showCameraList = true;
      }
      this.getCameraList(id);
    },
    getCameraList(id) {
      //查询摄像头
      this.listQuery.moduleId = id;
      this.listLoading = true;
      if (this.edgeType == "0") {
        this.api({
          url: "/analyticsModule/listCameras",
          method: "get",
          params: {
            moduleId: id,
          },
        }).then((data) => {
          this.allcameraList = data;
          this.maxCameraNum = this.moduleList.find(
            (temp) => temp.id == id
          ).maxCameraNum;
          this.api({
            url: "/slideDetect/edgelistCameras",
            method: "get",
            params: {
              moduleId: id,
            },
          }).then((data) => {
            this.listLoading = false;
            this.cameraList = data.reduce((result, item) => {
              //按组存入this.cameraLIst进行归纳
              let group = result.find(
                (group) => group.cgroupId === item.cgroupId
              );
              if (group) {
                group.cameraId.push(item.cameraId);
                group.cameraName.push(item.cameraName);
              } else {
                result.push({
                  cgroupId: item.cgroupId,
                  cameraId: [item.cameraId],
                  cameraName: [item.cameraName],
                  moduleId: item.moduleId,
                  runTime: item.runTime,
                });
              }
              return result;
            }, []);
            //将不在该模型内的摄像头存到右表
            this.rightcameraList = this.allcameraList.filter(
              (camera) =>
                !this.cameraList.some((group) =>
                  group.cameraId.includes(camera.id)
                )
            );
            //按组id进行排序
            this.cameraList.sort(function (a, b) {
              return a.cgroupId - b.cgroupId;
            });
          });
        });
      } else {
        this.api({
          url: "/analyticsModule/listCameras",
          method: "get",
          params: {
            moduleId: id,
          },
        }).then((data) => {
          this.cameraList = data;
        });
      }
    },

    ShowupdateGroup($index) {
      this.leftcameraList = [];
      const camera = this.cameraList[$index];
      this.hasNum = camera.cameraId.length;
      for (let i = 0; i < camera.cameraId.length; i++) {
        this.leftcameraList.push({
          moduleId: camera.moduleId,
          cameraId: camera.cameraId[i],
          cameraName: camera.cameraName[i],
          cgroupId: camera.cgroupId,
          runTime: camera.runTime,
        });
      }
      this.tempCamera.cameraId = camera.cameraId;
      this.tempCamera.moduleId = camera.moduleId;
      this.tempCamera.cgroupId = camera.cgroupId;
      this.tempCamera.runTime = camera.runTime;
      this.dialogCamera = true;
    },
    deletecamera($index) {
      const camera = this.leftcameraList[$index];
      this.api({
        url: "/slideDetect/deleteCamera",
        method: "post",
        data: {
          moduleId: camera.moduleId,
          cameraId: camera.cameraId,
          cameraName: camera.cameraName,
          cgroupId: camera.cgroupId,
          runTime: camera.runTime,
        },
      }).then((data) => {
        this.getCameraList(camera.moduleId);
        this.hasNum--;
        console.log("移出成功");
        this.rightcameraList.push({
          id: camera.cameraId,
          cameraName: camera.cameraName,
        });
        this.leftcameraList = this.leftcameraList.filter(
          (temp) => temp != camera
        );
      });
    },
    addcamera($index) {
      const camera = this.rightcameraList[$index];
      if (this.leftcameraList.length >= this.maxCameraNum) {
        this.$message.warning("摄像头组已满");
        console.log("摄像头组已满");
        return;
      }

      this.api({
        url: "/slideDetect/addCamera",
        method: "post",
        data: {
          moduleId: this.tempCamera.moduleId,
          cameraId: camera.id,
          cameraName: camera.cameraName,
          cgroupId: this.tempCamera.cgroupId,
          runTime: this.tempCamera.runTime,
        },
      }).then((data) => {
        this.getCameraList(this.tempCamera.moduleId);
        console.log("添加成功");
        this.hasNum++;
        this.rightcameraList = this.rightcameraList.filter(
          (temp) => temp.id != camera.id
        );
        this.leftcameraList.push({
          moduleId: this.tempCamera.moduleId,
          cameraId: camera.id,
          cameraName: camera.cameraName,
          cgroupId: this.tempCamera.cgroupId,
          runTime: this.tempCamera.runTime,
        });
      });
    },
    updateCameraGroup() {
      //this.getCameraList(this.tempCamera.moduleId);
      this.api({
        url: "/slideDetect/updateGroup",
        method: "post",
        data: {
          moduleId: this.tempCamera.moduleId,
          cgroupId: this.tempCamera.cgroupId,
          runTime: this.tempCamera.runTime,
          cameraId: this.tempCamera.cameraId,
        },
      }).then((data) => {
        this.$message.success("修改运行时间成功");
        this.getCameraList(this.tempCamera.moduleId);
        this.dialogCamera = false;
      });
    },
    addcameraGroup() {
      const camera = this.cameraList[this.cameraList.length - 1];
      this.cameraList.push({
        cgroupId: camera.cgroupId + 1,
        cameraId: [],
        cameraName: [],
        moduleId: camera.moduleId,
        runTime: 60,
      });
    },
    openbindcamera() {
      this.getallCamera(this.listQuery.moduleId);
      this.dialogallCamera = true;
    },
    bindcamera($index) {
      console.log("11");
      console.log(this.listQuery.moduleId);
      const camera = this.allcamera[$index];
      this.api({
        url: "/cameraInfo/bindModule",
        method: "post",
        data: {
          cameraId: camera.id,
          moduleIds: [this.listQuery.moduleId],
        },
      }).then(() => {
        this.$message.success("绑定成功！");
        camera.status = "1";
      });
    },
    unbindcamera($index) {
      const camera = this.allcamera[$index];
      this.api({
        url: "/cameraInfo/deleteBind",
        method: "post",
        data: {
          cameraId: camera.id,
          moduleId: this.listQuery.moduleId,
        },
      }).then(() => {
        this.$message.success("解除绑定成功！");
        camera.status = "0";
      });
    },
    createModule() {
      //添加新模型
      this.api({
        url: "/analyticsModule/addAnalyticsModule",
        method: "post",
        data: this.tempModule,
      }).then(() => {
        this.getModuleList();
        this.dialogFormVisible = false;
        this.$message.success("新增成功！");
      });
    },
    updateModule() {
      //修改模型信息
      console.log(this.tempModule);
      this.api({
        url: "/analyticsModule/updateAnalyticsModule",
        method: "post",
        data: this.tempModule,
      }).then(() => {
        this.$message.success("更新成功！");
        this.dialogFormVisible = false;
        this.getModuleList();
        this.getCameraList(this.tempModule.id);
      });
    },
    handleFilter() {
      //查询事件
      this.getModuleList();
    },
    showCreate() {
      if (this.edgeList.length === 0) {
        this.getAllEdgeEnds();
      }
      //显示新增对话框
      this.tempModule.edgeId = "";
      this.tempModule.edgeName = "";
      this.tempModule.moduleName = "";
      this.tempModule.moduleType = "";
      this.tempModule.description = "";
      this.tempModule.version = "";
      this.tempModule.runningTime = "";
      this.tempModule.maxCameraNum = "";
      this.tempModule.storagePath = "";
      this.tempModule.syncPath = "";
      this.tempModule.commandScript = "";
      this.tempModule.mqQueue = "";
      this.tempModule.opencv = "";
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      //打开修改界面
      let module = this.moduleList[$index];
      this.tempModule.id = module.id;
      this.tempModule.edgeId = module.edgeId;
      this.tempModule.edgeName = module.edgeName;
      this.tempModule.moduleName = module.moduleName;
      this.tempModule.moduleType = module.moduleType;
      this.tempModule.description = module.description;
      this.tempModule.version = module.version;
      this.tempModule.runningTime = module.runningTime;
      this.tempModule.maxCameraNum = module.maxCameraNum;
      this.tempModule.storagePath = module.storagePath;
      this.tempModule.syncPath = module.syncPath;
      this.tempModule.commandScript = module.commandScript;
      this.tempModule.mqQueue = module.mqQueue;
      this.tempModule.opencv = module.opencv;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    showUpload($index) {
      //上传界面
      let module = this.moduleList[$index];
      this.uploadData.moduleId = module.id;
      this.uploadVisible = true;
    },
    newSyncFile($index) {
      let _vue = this;
      let module = _vue.list[$index];
      _vue
        .$confirm("确定同步模型?", "提示", {
          confirmButtonText: "确定",
          showCancelButton: false,
          type: "warning",
        })
        .then(() => {
          _vue.listLoading = true;
          _vue
            .api({
              url: "/analyticsModule/newSyncAnalyticsModule",
              method: "post",
              data: {
                id: module.id,
                edgeId: module.edgeId,
              },
            })
            .then(() => {
              this.$message.success("同步中！");
              _vue.getList();
            })
            .catch(() => {
              _vue.listLoading = false;
            });
        });
    },
    commandModule($index, command) {
      //发布
      let _vue = this;
      let module = _vue.moduleList[$index];
      let tips;
      if (command === "start") {
        tips = "确定发布模型?";
      } else if (command === "close") {
        tips = "确定停止模型?";
      } else {
        return;
      }
      _vue
        .$confirm("确定", "提示", {
          confirmButtonText: "确定",
          showCancelButton: false,
          type: "warning",
        })
        .then(() => {
          _vue.listLoading = true;
          _vue
            .api({
              url: "/analyticsModule/commandAnalyticsModule",
              method: "post",
              data: {
                id: module.id,
                edgeId: module.edgeId,
                commandStatus: command,
              },
            })
            .then(() => {
              _vue.getModuleList();
            })
            .catch(() => {
              _vue.listLoading = false;
            });
        });
    },
    handleSelectChange() {
      this.getModuleList();
      this.cameraList = [];
      if (this.listQuery.edgeId != "")
        this.edgeType = this.edgeList.find(
          (temp) => temp.id == this.listQuery.edgeId
        ).devicetype;
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}?`);
    },
    handleUploadError(error, file) {
      this.$notify.error({
        title: "error",
        message: "上传出错:" + error,
        type: "error",
        position: "bottom-right",
      });
    },
    //上传前的校验 可限制文件的类型和大小
    handleBeforeUpload(file) {
      console.log(file.type);
      const isZip = [
        "application/zip",
        "application/x-zip-compressed",
      ].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 500;
      if (!isZip) {
        this.$message.error("上传文件只能是zip格式的压缩包!");
      }
      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 500MB!");
      }
      return isZip && isLt2M;
    },
    // 文件上传成功时的函数
    handleUploadSuccess(res, file, fileList) {
      if (res.code === "200") {
        this.$message.success("上传成功！");
      } else {
        this.$message.error(res.msg);
      }
      this.$refs.upload.clearFiles();
      this.uploadVisible = false;
      this.getList();
    },
    // 弹窗里面确定按钮处理文件上传的函数
    handleUpload() {
      this.$refs.upload.submit();
    },
    handleDetail(row) {
      this.$router.push({
        name: "moduleDetail",
        params: {
          moduleId: row.id,
        },
      });
    },
  },
};
</script>

