<template>
  <div class="app-container">
    <div
      v-if="showImage"
      style="
        width: 50%;
        height: 55%;
        margin-left: 10%;
        position: fixed;
        top: 10%;
        z-index: 9900;
      "
    >
      <el-button type="danger" @click="showImage = false">关闭</el-button>
      <img class="img" :src="ImageUrl" />
    </div>
    <div
      v-if="setImage"
      style="
        width: 69%;
        height: 70%;
        margin-left: 10%;
        position: fixed;
        top: 10%;
        z-index: 9900;
        zoom: 1.25;
      "
    >
      <el-button type="danger" @click="setImage = false">关闭</el-button>
      <el-button type="primary" @click="saveImage">保存</el-button>
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
        />
      </el-select>
      <ui-marker
        ref="aiPanel-editor"
        class="ai-observer"
        :imgUrl="ImageUrl"
      ></ui-marker>
    </div>
    <!--    <div v-if="this.ModuleTypes[0].status!=-1">-->
    <el-select
      v-model="moduleType"
      placeholder="选择模型类型"
      :popper-append-to-body="false"
    >
      <el-option
        v-for="item in ModuleTypes"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    <el-button
      size="mini"
      :plain="true"
      type="primary"
      style="font-size: 18px"
      @click="toEdge()"
      >上传</el-button
    >
    <el-button
      size="mini"
      :plain="true"
      type="primary"
      style="font-size: 18px"
      @click="toTrain()"
      >训练</el-button
    >
    <el-button
      size="mini"
      :plain="true"
      type="primary"
      style="font-size: 18px"
      @click="download()"
      >下载</el-button
    >
    <el-button
      size="mini"
      :plain="true"
      type="primary"
      style="font-size: 18px"
      @click=""
      >转化</el-button
    >
    <!--    </div>-->
    <br />&nbsp;
    <el-table
      :data="abnormalList"
      element-loading-text="拼命加载中"
      border
      fit
      :header-cell-style="{ background: '#f5f7fa', color: '#409EFF' }"
    >
      <el-table-column align="center" label="模型类型" min-width="8"
        >工装检测</el-table-column
      >
      <el-table-column align="center" label="状态" min-width="8">
        <template v-slot="scope">
          <div v-if="scope.row.moduleTypeStatus == 2">未转化</div>
          <div v-if="scope.row.moduleTypeStatus == 1">未训练</div>
          <div v-if="scope.row.moduleTypeStatus == 0">未上传</div>
          <div v-if="scope.row.moduleTypeStatus == -1">处理中</div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="标签类别"
        prop="tagName"
        min-width="8"
      />
      <el-table-column
        align="center"
        label="标注框数量"
        prop="tagNum"
        min-width="8"
      />
      <el-table-column align="center" label="操作" min-width="8">
        <template v-slot="scope">
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            style="font-size: 18px"
            @click="openDimension(scope.$index)"
            >标注</el-button
          >
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            style="font-size: 18px"
            @click="openImage(scope.$index)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import DatePicker from "@/components/DatePicker";
import { AIMarker } from "vue-picture-bd-marker";
export default {
  components: {
    DatePicker,
    "ui-marker": AIMarker,
  },
  data() {
    return {
      moduleType: null,
      ModuleTypes: [],
      annotation: {},
      thetag: "",
      setImage: false,
      abnormalLists: [],
      newDetectType: {
        id: "",
        name: "",
      },
      ImageUrl: null,
      showImage: false,
      abnormalList: [],
      dialogFormVisible: false,
      detectType: "",
      detectTypes: [],
    };
  },
  created() {
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    document.body.style.zoom = "80%";
    this.getModuleType();
    this.getList();
    this.getTag();
  },
  methods: {
    download() {
      if (this.moduleType == null) {
        this.$message.warning("请先选择模型类型");
        return;
      }
      if (this.ModuleTypes[0].status != 2) {
        this.$message.warning("请先完成训练");
        return;
      }
      let file_url = null;
      if (process.env.NODE_ENV !== "production") {
        file_url =
          process.env.BASE_URL +
          "/onlineTrainInfo/getModuleFile?id=" +
          this.moduleType;
      } else {
        file_url =
          window.location.origin +
          "/onlineTrainInfo/getModuleFile?id=" +
          this.moduleType;
      }
      const link = document.createElement("a");
      link.href = file_url;
      link.download = "best.pt"; // 设置下载的文件名
      link.click();
    },

    toTrain() {
      if (this.ModuleTypes[0].status == 0) {
        this.$message.warning("请先进行上传");
        return;
      }
      this.api({
        url: "onlineTrainInfo/toTrain",
        method: "get",
      }).then((data) => {
        this.$message.warning("训练中,稍后请刷新页面");
      });
    },
    toEdge() {
      this.api({
        url: "onlineTrainInfo/toEdge",
        method: "get",
      }).then((data) => {
        this.$message.warning("上传中,稍后请刷新页面");
      });
    },

    getModuleType() {
      this.api({
        url: "onlineTrainInfo/getModuleType",
        method: "get",
      }).then((data) => {
        this.ModuleTypes = data;
        console.log(this.ModuleTypes);
      });
    },

    //将标注好的图片上传到服务器
    saveImage() {
      if (this.thetag == "") {
        this.$message.warning("请选择标签");
        return;
      }

      // 获取标注信息，这取决于你的 ui-marker 组件如何提供这些信息
      const markerDatas = this.$refs["aiPanel-editor"].getMarker().getData();

      markerDatas.forEach((markerData) => {
        // 创建一个新的 Image 对象并加载图片
        console.log(markerData);
        const x = (parseFloat(markerData.position.x) / 100).toFixed(6);
        const y = (parseFloat(markerData.position.y) / 100).toFixed(6);
        const x1 = (parseFloat(markerData.position.x1) / 100).toFixed(6);
        const y1 = (parseFloat(markerData.position.y1) / 100).toFixed(6);

        this.api({
          url: "onlineTrainInfo/addAnnotation",
          method: "post",
          data: {
            id: this.annotation.id,
            tagName: markerData.tagName,
            tag: markerData.tag,
            path: this.annotation.path,
            moduleTypeId: this.annotation.moduleTypeId,
            x: x,
            y: y,
            width: (x1 - x).toFixed(6),
            height: (y1 - y).toFixed(6),
          },
        })
          .then(() => {
            this.$message.success("添加一项标签成功");
            location.reload();
          })
          .catch(() => {
            this.$message.warning("数据上传失败，请重试");
          });
      });
    },

    getFirstTagName(key) {
      return this.abnormalList[key][0].tagName;
    },
    setTag() {
      console.log(this.detectTypes);
      const tag = this.detectTypes.find((item) => item.id == this.thetag);
      this.$refs["aiPanel-editor"].getMarker().setTag({
        tagName: tag.name,
        tag: tag.id,
      });
    },
    getTag() {
      this.api({
        url: "onlineTrainInfo/getTag",
        methods: "get",
      }).then((data) => {
        this.detectTypes = data;
      });
    },
    getList() {
      this.api({
        url: "onlineTrainInfo/getList",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          if (this.abnormalLists != []) {
            const trainData = this.abnormalLists.find(
              (atemp) => atemp[0].id == temp.id
            );
            if (trainData != null) {
              trainData.push(temp);
            } else {
              this.abnormalLists.push([temp]);
            }
          } else {
            this.abnormalLists.push([temp]);
          }
        });

        this.abnormalLists.forEach((emm) => {
          let tagName = [];
          emm.forEach((temp) => tagName.push(temp.tagName + " "));
          const tagNum = tagName.length;
          tagName = [...new Set(tagName)]; //去重

          this.abnormalList.push({
            id: emm[0].id,
            tagName: tagName,
            tagNum: tagNum,
            path: emm[0].path,
            moduleTypeId: emm[0].moduleTypeId,
            moduleTypeStatus: this.ModuleTypes[0].status,
          });
        });
      });
    },

    runOpenImage($index) {
      const adata = this.abnormalList[$index];
      this.api({
        url: "onlineTrainInfo/getImage",
        method: "post",
        data: {
          id: adata.id,
          tagName: adata.tagName[0],
          path: adata.path,
        },
      }).then((data) => {
        this.ImageUrl = "data:image/jpeg;base64," + data;
        const Datas = this.abnormalLists[$index];
        const img = new Image();
        img.onload = () => {
          // 创建一个 canvas 元素并设置其大小
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          // 获取 canvas 的 2D 渲染上下文
          const context = canvas.getContext("2d");
          // 在 canvas 上绘制图片
          context.drawImage(img, 0, 0);
          // 设置画笔颜色为红色
          context.strokeStyle = "red";
          // 遍历标注信息并在对应位置画上红色的框
          Datas.forEach((temp) => {
            const x = temp.x;
            const y = temp.y;
            const width = temp.width;
            const height = temp.height;
            context.strokeRect(
              x * canvas.width,
              y * canvas.height,
              width * canvas.width,
              height * canvas.height
            );
            context.font = "25px Arial";
            context.fillStyle = "red";
            context.fillText(temp.tagName, x * canvas.width, y * canvas.height);
          });

          // 将 canvas 的内容转换为 data URL
          const dataUrl = canvas.toDataURL();
          // 将 data URL 设置为新的图片 URL
          this.ImageUrl = dataUrl;
        };
        img.src = this.ImageUrl;
      });
    },

    openImage($index) {
      this.runOpenImage($index);
      this.showImage = true;
    },
    openDimension($index) {
      this.runOpenImage($index);
      this.annotation = this.abnormalList[$index];
      console.log(this.annotation);
      this.setImage = true;
      //this.dialogFormVisible=true;
    },
  },
};
</script>

<style scoped>
</style>
