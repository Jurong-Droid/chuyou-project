<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        size="medium"
        v-model="listQuery.name"
        style="width: 8%"
        @keyup.enter.native="handleFilter"
        placeholder="视频名"
        clearable
      />
      <el-input
        size="medium"
        v-model="listQuery.areaName"
        style="width: 8%"
        @keyup.enter.native="handleFilter"
        placeholder="位置"
        clearable
      />
      <el-cascader
        size="medium"
        v-model="listQuery.cameraId"
        :options="options"
        :props="defaultProps"
        filterable
        clearable
        placeholder="请选择摄像头信息"
      />
      <DatePicker
        style="height: 36px"
        startVaule="异常开始日期"
        endValue="异常结束日期"
        @sendTimeData="getTime"
      ></DatePicker>
      <el-button
        style="margin-left: 10px"
        size="mini"
        v-waves
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >搜索</el-button
      >
      <el-button
        size="mini"
        type="danger"
        icon="plus"
        v-permission="'abnormalInfo:start'"
        @click="allConfirmation"
        >一键确认</el-button
      >
    </div>

    <div
      v-if="ismaker"
      style="
        width: 50%;
        height: 50%;
        margin-left: 25%;
        position: fixed;
        top: 15%;
        left: 0;
        z-index: 9900;
        display: inline-block;
        zoom: 1.25;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: column;
          position: absolute;
          margin-left: 90%;
          z-index: 9900;
          left: 20%;
          height: 30%;
          justify-content: space-around;
          width: 15%;
        "
      >
        <el-button type="danger" @click="ismaker = false" style="width: 80%"
          >关闭</el-button
        >
        <el-button
          type="primary"
          @click="saveImage"
          style="width: 80%; margin-left: 0px"
          >保存</el-button
        >
        <el-button
          size="mini"
          icon="el-icon-zoom-out"
          @click="zoomOut"
          style="width: 80%; margin-left: 0px"
          >缩小</el-button
        >
        <el-button
          size="mini"
          icon="el-icon-zoom-in"
          @click="zoomIn"
          style="width: 80%; margin-left: 0px"
          >放大</el-button
        >
        <el-select
          v-model="thetag"
          placeholder="选择标签"
          @change="setTag"
          :popper-append-to-body="false"
        >
          <el-option
            v-for="item in detectTypes"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            style="margin-left: 30%; width: 80%"
          />
        </el-select>
        <el-select
          v-model="theType"
          placeholder="选择模型类型"
          @change="setMoType"
          :popper-append-to-body="false"
        >
          <el-option
            v-for="item in moduleTypes"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            style="margin-left: 30%; width: 80%"
          />
        </el-select>
      </div>
      <ui-marker
        id="marker"
        style="transform: scale(1); transition: transform 0.2s"
        ref="aiPanel-editor"
        class="ai-observer"
        :ratio="4 / 3"
        :imgUrl="imgUrl"
      ></ui-marker>
    </div>

    <div>
      <el-table
        :data="list"
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        height="700"
        border
        fit
        :cell-style="cellStyle"
        :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
      >
        <el-table-column align="center" label="序号" min-width="5">
          <template v-slot="scope">
            <span v-text="getIndex(scope.$index)"> </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="单位"
          prop="unit"
          min-width="8"
        />
        <el-table-column
          align="center"
          label="区域"
          prop="location"
          min-width="8"
        />
        <el-table-column
          align="center"
          label="报警类别"
          prop="name"
          min-width="15"
        />
        <el-table-column align="center" label="报警信息" min-width="27">
          <template v-slot="scope">
            <span> {{ scope.row.expInfo }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="报警时间时间"
          prop="expTime"
          min-width="13"
        />

        <el-table-column align="center" label="处理情况" min-width="15">
          <template v-slot="scope">
            <span v-if="scope.row.closeBy != null" style="color: #67c23a"
              >已处置</span
            >
            <span v-else>未处置</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="处理信息" min-width="10">
          <template v-slot="scope">
            <span v-if="scope.row.dispose == -1" style="color: #409eff"
              >未处理</span
            >
            <span v-else-if="scope.row.dispose == 0" style="color: #f56c6c"
              >误报</span
            >
            <span v-else-if="scope.row.dispose == 1" style="color: #67c23a"
              >实报</span
            >
          </template>
        </el-table-column>
        <el-table-column align="center" label="标注情况" min-width="10">
          <template v-slot="scope">
            <span v-if="scope.row.isTag == 1" style="color: #409eff"
              >已标注</span
            >
            <span v-else style="color: #f56c6c">未标注</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          min-width="15"
          v-permission="'abnormalInfo:start'"
        >
          <template v-slot="scope">
            <el-button
              size="mini"
              type="warning"
              v-if="scope.row.closeBy == null"
              @click="playMv(scope.row)"
            >
              <svg-icon icon-class="play" />
            </el-button>
            <el-button size="mini" v-else @click="playMv(scope.row)">
              <svg-icon icon-class="play" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="height: 14px"></div>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.pageNum"
        :page-size="listQuery.pageRow"
        :total="totalCount"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination>
    </div>
    <div>
      <div class="video_con" v-show="showVideo">
        <video
          ref="video"
          :src="video_url"
          controls="controls"
          controlsList="nodownload"
        ></video>
        <div class="mask" align="center">
          <div style="margin-top: 100px">
            <el-button type="danger" @click="closeMv(0)">误报</el-button
            >&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button type="primary" @click="closeMv(1)">确认</el-button
            >&nbsp;&nbsp;&nbsp;&nbsp;
            <el-button type="warning" @click="closeMv(2)">取消</el-button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <el-button type="primary" @click="openMarker">标注</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from "@/components/DatePicker";
import waves from "@/directives/waves/index.js";
import { AIMarker } from "vue-picture-bd-marker";
import flvjs from "flv.js";
import api from "@/utils/api"; // 水波纹指令
export default {
  components: {
    DatePicker,
    "ui-marker": AIMarker,
  },
  directives: {
    waves,
  },
  data() {
    return {
      scale: 1, // 初始缩放比例
      camId: "",
      theType: "",
      moduleTypes: [
        {
          name: "工装检测",
          id: 1,
        },
      ],
      thetag: "",
      detectTypes: [],
      imageNum: null,
      imageInfo: [], // 存储图片原始信息
      imgck: {
        width: "",
        height: "",
      },
      imgUrl: "",
      ismaker: false,
      oparealist: [],
      locationlist: [],
      clist: [],
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        name: null, //视频名
        cameraId: null, //视频名
        updateTimeFrom: null,
        updateTimeTo: null,
        areaName: null,
      },
      options: [], //摄像头信息列表
      defaultProps: {
        children: "children",
        label: "name",
        value: "id",
        level: "level",
        emitPath: false, //在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
      },
      //视频名称
      title: "",
      //播放封面图片地址
      cover_pic: "",
      // 显示视频播放
      showVideo: false,
      // mv地址
      video_url: "",
      video_type: "",
      disposeid: "",
    };
  },
  created() {
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    document.body.style.zoom = "80%";
    this.getTag();
    this.getTrainNum();
    this.getlocation();
    this.getList();
    this.getCameraList();
  },
  methods: {
    zoomIn() {
      // 点击放大按钮，增加缩放比例
      this.scale += 0.1;
      this.updateDatePickerScale();
    },
    zoomOut() {
      // 点击缩小按钮，减小缩放比例
      this.scale -= 0.1;
      this.updateDatePickerScale();
    },
    updateDatePickerScale() {
      // 更新DatePicker的样式，实现放大缩小效果
      const datePickerContainer = document.getElementById("marker");
      datePickerContainer.style.transform = `scale(${this.scale})`;
    },
    setMoType() {
      console.log(this.theType);
    },
    getTag() {
      this.api({
        url: "onlineTrainInfo/getTag",
        methods: "get",
      }).then((data) => {
        this.detectTypes = data;
      });
    },
    getTrainNum() {
      this.api({
        url: "onlineTrainInfo/getList",
        method: "get",
      }).then((data) => {
        this.imageNum = data.length;
      });
    },
    setTag() {
      console.log(this.detectTypes);
      const tag = this.detectTypes.find((item) => item.id == this.thetag);
      this.$refs["aiPanel-editor"].getMarker().setTag({
        tagName: tag.name,
        tag: tag.id,
      });
    },

    //将标注好的图片上传到服务器
    saveImage() {
      if (this.thetag == "") {
        this.$message.warning("请选择标签");
        return;
      }
      if (this.theType == "") {
        this.$message.warning("请选择模型类型");
        return;
      }
      // 获取标注信息，这取决于你的 ui-marker 组件如何提供这些信息
      const marker = this.$refs["aiPanel-editor"].getMarker();
      console.log(marker.getData());
      // 创建一个新的 Image 对象并加载图片
      const img = new Image();
      img.onload = () => {
        let imageBlob = dataURLtoBlob(this.imgUrl);
        let formData = new FormData();
        formData.append("image", imageBlob, ++this.imageNum + ".jpg");
        formData.append("marker", JSON.stringify(marker.getData()));
        formData.append("id", JSON.stringify(this.imageNum));
        formData.append("moduleType", JSON.stringify(this.theType));
        formData.append("camId", JSON.stringify(this.camId));
        this.api({
          url: "/abnormalInfo/saveImage",
          method: "post",
          data: formData,
        })
          .then(() => {
            console.log("图片上传成功");
            this.$message.success("数据保存成功");
          })
          .catch(() => {
            console.log("图片上传失败");
            this.$message.warning("数据保存失败，请重试");
          });
      };
      img.src = this.imgUrl;

      const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(","),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };
      //将标签重新置为空
      this.thetag = "";
    },

    //将视频截图放到marker面板上
    openMarker() {
      this.ismaker = true;
      const video = document.createElement("video");
      video.src = this.video_url;

      video.addEventListener("loadeddata", () => {
        console.log(video.duration / 2);
        video.currentTime = video.duration / 2;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        this.imgck.width = canvas.width;
        this.imgck.height = canvas.width;
        const context = canvas.getContext("2d");
        context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height);

        const imgUrl = canvas.toDataURL("image/jpeg", 0.9);
        this.imgUrl = imgUrl;

        // 清除video和canvas元素
        video.src = "";
        video.load();

        canvas.remove();
        this.closeMv(2);
      });
    },

    getlocation() {
      this.api({
        url: "/organizationInfo/getlocation",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.locationlist.push({
            id: temp.locationId,
            fid: temp.opareaId,
            oparea: temp.opareaName,
            location: temp.locationName,
          });
        });
      });
    },

    getoparea() {
      this.api({
        url: "/organizationInfo/getoparea",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oparealist.push({
            id: temp.opareaId,
            fid: temp.oilplantId,
            oparea: temp.opareaName,
          });
        });
      });
    },

    getList() {
      //查询列表
      if (!this.hasPerm("abnormalInfo:list")) {
        return;
      }
      (this.list = []), (this.listLoading = true);
      this.api({
        url: "/abnormalInfo/listAbnormalInfo",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        this.listLoading = false;
        data.list.forEach((temp) => {
          let uni = null;
          this.locationlist.forEach((emp) => {
            if (temp.areaName == emp.location) {
              uni = emp.oparea;
            }
          });
          this.list.push({
            unit: uni,
            location: temp.areaName,
            camId: temp.camId,
            name: temp.name,
            detectType: temp.detectType,
            expTime: temp.expTime,
            expInfo: temp.expInfo,
            id: temp.id,
            modelId: temp.modelId,
            closeBy: temp.closeBy,
            createTime: temp.createTime,
            updateTime: temp.updateTime,
            videoPath: temp.videoPath,
            picPath: temp.picPath,
            dispose: temp.dispose,
            isTag: temp.isTag,
          });
        });
        this.totalCount = data.totalCount;

        //若是带有参数，则打开播放页面
        let abnormalId = this.$route.params.id;
        if (abnormalId) {
          this.playMv(abnormalId);
        }
      });
    },
    adispose(n) {
      this.api({
        url: "/abnormalInfo/updateDispose",
        method: "post",
        data: {
          id: this.disposeid,
          dispose: n,
        },
      }).then(() => {});
    },
    getCameraList() {
      this.api({
        url: "/common/getAllCameras",
        method: "get",
      }).then((data) => {
        this.options = data;
      });
    },
    allConfirmation() {
      let _vue = this;
      _vue
        .$confirm("确定确认所有异常信息?", "提示", {
          confirmButtonText: "确定",
          showCancelButton: false,
          type: "warning",
        })
        .then(() => {
          _vue
            .api({
              url: "/abnormalInfo/allConfirmation",
              method: "post",
            })
            .then((data) => {
              this.$message.success("成功确认异常信息" + data + "条！");
              _vue.getList();
            });
        });
    },
    getTime(date) {
      this.listQuery.expTimeFrom = date.updateTimeFrom;
      this.listQuery.expTimeTo = date.updateTimeTo;
    },
    handleSizeChange(val) {
      //改变每页数量
      this.listQuery.pageRow = val;
      this.handleFilter();
    },
    handleCurrentChange(val) {
      //改变页码
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleFilter() {
      //改变了查询条件,从第一页开始查询
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1;
    },
    playMv(info) {
      console.log(info);
      this.camId = info.id;
      this.disposeid = info.id;
      this.showVideo = true;
      if (process.env.NODE_ENV !== "production") {
        this.video_url =
          process.env.BASE_URL +
          "/abnormalInfo/startAbnormalInfo?id=" +
          info.id;
      } else {
        this.video_url =
          window.location.origin +
          "/abnormalInfo/startAbnormalInfo?id=" +
          info.id;
      }
      console.log(this.video_url);
    },
    //关闭mv界面
    closeMv(n) {
      if (n == 3) {
        this.$refs.video.pause();
        return;
      }
      if (n == 2) {
        this.showVideo = false;
        this.$refs.video.pause();
        return;
      }
      this.adispose(n);
      this.showVideo = false;
      this.$refs.video.pause();
      //router没有提供清空数据的方法 刷新可清除数据
      if (this.$route.params.id) {
        location.reload();
      } else {
        this.list = [];
        this.getList();
      }
    },

    cellStyle({ row, column, rowIndex, columnIndex }) {
      let styleJson = {};
      if (row.closeBy == null) {
        if (columnIndex === 6) {
          styleJson.color = "red";
        } // 背景颜色
        // 也可以修改文字颜色
        return styleJson;
      } else {
        return "";
      }
    },
  },
};
</script>

<style scoped>
.video_con video {
  position: fixed;
  width: 50%;
  height: 60%;
  left: 50%;
  top: 40%;
  margin-top: -10%;
  transform: translateX(-50%);
  z-index: 990;
}

.video_con .mask {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 980;
  background-color: rgba(0, 0, 0, 0.8);
}

.filter-container {
  margin-bottom: 10px;
}
</style>
