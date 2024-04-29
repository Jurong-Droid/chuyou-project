<template>
  <div style="overflow: hidden">
    <el-container class="center">
      <el-main
        v-loading.body="listLoading"
        element-loading-text="拼命加载中"
        style="overflow-y: hidden; padding: 0"
      >
        <div id="container_max">
          <el-row :gutter="10" style="margin: 0 !important">
            <el-col
              v-for="(n, index) in forNum"
              :xs="24"
              :sm="24"
              :md="cloNum"
              :lg="cloNum"
              :xl="cloNum"
              :class="videoClass"
              :key="index"
              style="padding: 0"
            >
              <div
                class="player-wrapper"
                element-loading-text="加载中..."
                element-loading-background="#000"
              >
                <div class="video-wrapper" :style="videoClass">
                  <el-button
                    v-if="seReplace == index"
                    style="
                      position: absolute;
                      z-index: 1002;
                      left: 20px;
                      font-size: 25px;
                    "
                    type="text"
                    circle
                    @click="replaceVideo(index)"
                    icon="el-icon-success"
                  ></el-button>
                  <el-button
                    v-else
                    style="
                      position: absolute;
                      z-index: 1002;
                      left: 20px;
                      font-size: 25px;
                    "
                    type="text"
                    circle
                    @click="replaceVideo(index)"
                    icon="el-icon-circle-check"
                  ></el-button>
                  <el-button
                    id="demo"
                    style="position: absolute; z-index: 1002; right: 20px"
                    type="text"
                    circle
                    @click="sClosePlayer(index)"
                    >×</el-button
                  >
                  <div class="video-inner live hide-waiting">
                    <video
                      :id="`videoId${n}`"
                      ref="videoElement"
                      muted
                      controls
                      width="100%"
                      height="100%"
                      style="object-fit: fill"
                    ></video>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import _ from "lodash";
import flvJs from "mpegts.js";
import screenfull from "screenfull";

export default {
  inject: ["searchParam"],
  data() {
    return {
      initOp: 0,
      selectOpen: 0, //是否单个播放器刷新
      seReplace: -1, //指定位置播放器替换
      closeNum: 0, //关闭指定播放器
      totalCount: 0, //分页组件--数据总条数
      listLoading: false, //数据加载等待动画
      url: "",
      listQuery: {
        pageNum: 1, //页码
        pageRow: 4, //每页条数
        id: [1],
        level: "1",
      },
      title: "",
      fullscreen: false,
      forNum: 4,
      cloNum: 12,
      dialogFormVisible: false,
      videoClass:
        "padding-bottom: 54.25%; position: relative; margin: 0px auto; overflow: hidden;",
      classtype1: "",
      classtype2: "primary",
      classtype3: "",
      classtype4: "",
      listObj: [],
      listVideo: [],
      flvPlayerList: [],
      videoElementList: [],
    };
  },
  created() {
    document.body.style.zoom = "80%";
  },
  mounted() {},
  computed: {
    param() {
      return this.searchParam();
    },
  },
  //监听器
  watch: {
    listObj: function () {
      this.$nextTick(function () {
        this.initPlayer();
      });
    },
    param: {
      deep: true,
      handler(e) {
        const nid = Array.from(new Set(e.id));
        this.listQuery.id = Array.from(new Set(this.listQuery.id));
        this.selectOpen = 0;
        const addid = this.findExtraElement(nid, this.listQuery.id);
        if (
          this.seReplace != -1 ||
          this.listQuery.id.length == 4 ||
          this.listQuery.id.length == 9
        ) {
          if (
            this.seReplace != -1 ||
            (nid.length == 5 && this.forNum == 4) ||
            (nid.length == 10 && this.forNum == 9)
          ) {
            const id = addid;
            if (id == "") {
              //选中时执行删除
              this.seReplace = -1;
              return;
            }
            //替换
            this.selectOpen = 1;
            this.listQuery.id = nid;
            this.listQuery.level = e.level;
            this.fillVideo(id);
            return;
          }
        }
        const dropid = this.findExtraElement(this.listQuery.id, nid);
        console.log("新家+" + addid);
        console.log("键+" + dropid);
        //单条添加方法
        let id = 0,
          op;
        if (dropid == "" && addid == "") return;
        if (dropid != "" && dropid != 1) {
          this.seReplace = -1;
          op = 0;
          id = dropid;
        }
        if (addid != "") {
          this.seReplace = -1;
          op = 1;
          id = addid;
        }
        this.selectOpen = 1;
        this.listQuery.id = nid;
        this.listQuery.level = e.level;
        this.addWithDrop(id, op);
        //this.fillVideo(id)
      },
    },
  },

  methods: {
    screenfullFn() {
      const element = document.getElementById("container_max"); //指定全屏区域元素
      if (screenfull.isEnabled) {
        screenfull.request(element);
      }
    },
    replaceVideo(n) {
      if (this.seReplace == n) {
        this.seReplace = -1;
        return;
      }
      this.seReplace = n;
    },
    findExtraElement(eId, listQueryId) {
      // 将两个数组转换为集合(Set)以便进行比较
      const eIdSet = new Set(eId);
      const listQueryIdSet = new Set(listQueryId);
      // 使用差集操作来找出eId中多出的元素
      const extraElements = Array.from(eIdSet).filter(
        (element) => !listQueryIdSet.has(element)
      );
      return extraElements;
    },
    reload(n) {
      this.destoryVideo(this.flvPlayerList[n]);
      this.getList();
    },
    addWithDrop(id, op) {
      if (op == 0) {
        //减操作
        console.log("减操作执行");
        this.closeVideo(id);
        this.initOp--;
        return;
      }

      let location = this.initOp++;
      console.log("加操作执行位置：" + location);
      this.api({
        url: "/cameraLive/alistCameraLive",
        method: "post",
        data: {
          id: id,
          level: 2,
          pageNum: 1,
          pageRow: 4,
        },
      }).then((data) => {
        this.listObj[location] = data[0];
        const videoElementList = this.$refs.videoElement;
        const videoElement = videoElementList[location];
        this.createVideo(videoElement, location);
        this.flvPlayerList.push(this.flvPlayer);
      });
    },
    fillVideo(id) {
      let closeNum = 0;
      if (this.closeNum > 3) {
        this.closeNum = 0;
      }

      if (this.seReplace !== -1) {
        closeNum = this.seReplace;
        this.seReplace = -1;
      } else {
        closeNum = this.closeNum;
      }

      this.sClosePlayer(closeNum);
      console.log("替换位置：" + closeNum);
      this.api({
        url: "/cameraLive/alistCameraLive",
        method: "post",
        data: {
          id: id,
          level: 2,
          pageNum: 1,
          pageRow: 4,
        },
      }).then((data) => {
        this.listObj[closeNum] = data[0];
        const videoElementList = this.$refs.videoElement;
        const videoElement = videoElementList[closeNum];
        this.createVideo(videoElement, closeNum);
        this.closeNum = this.closeNum + 1;
        this.flvPlayerList.push(this.flvPlayer);
      });
    },

    getList: _.debounce(function () {
      //  防止点击过快
      if (this.listQuery.id == 0) return;
      this.closePlayer();
      this.listLoading = true;
      this.api({
        url: "/cameraLive/alistCameraLive",
        method: "post",
        data: this.listQuery,
      }).then((data) => {
        if (this.listQuery.id.length == 0) return;
        this.listLoading = false;
        this.listObj = data;
        if (this.listQuery.id.length == 1 && this.listQuery.id == 1) {
          this.listQuery.id = [];
          data.forEach((temp) => {
            this.listQuery.id.push(temp.id);
            this.closeTree([1, temp.id]);
          });
        }
        this.totalCount = data.length;
      });
    }, 700),

    splitScreen(fnum) {
      this.selectType(fnum);
      this.listQuery.pageRow = fnum;
      this.listQuery.pageNum = 1;
      this.getList();
    },

    selectType(fnum) {
      this.forNum = fnum;
      if (fnum == 1) {
        this.classtype1 = "primary";
        this.classtype2 = "";
        this.classtype3 = "";
        this.classtype4 = "";
        this.cloNum = 24;
      } else if (fnum == 4) {
        this.classtype1 = "";
        this.classtype2 = "primary";
        this.classtype3 = "";
        this.classtype4 = "";
        this.cloNum = 12;
      } else if (fnum == 9) {
        this.classtype1 = "";
        this.classtype2 = "";
        this.classtype3 = "primary";
        this.classtype4 = "";
        this.cloNum = 8;
      } else if (fnum == 16) {
        this.classtype1 = "";
        this.classtype2 = "";
        this.classtype3 = "";
        this.classtype4 = "primary";
        this.cloNum = 6;
      }
    },
    CloseCameraLive() {
      this.api({
        url: "/cameraLive/closeCameraLive",
        method: "get",
      }).then((data) => {
        this.getList();
        console.log("关闭成功");
      });
    },

    flvUnload() {
      this.flvPlayer.unload();
      this.flvPlayer.detachMediaElement();
      this.flvPlayer.destroy();
      this.flvPlayer = null;
    },

    //加载视频播放
    initPlayer() {
      if (flvJs.isSupported()) {
        const videoElementList = this.$refs.videoElement;
        for (let n = 0; n < this.listObj.length; n++) {
          const videoElement = videoElementList[n];
          this.createVideo(videoElement, n);
          this.flvPlayerList.push(this.flvPlayer);
        }
      }
    },
    createVideo(videoElement, n) {

      this.flvPlayer = flvJs.createPlayer(
        {
          type: "mse",
          url: this.listObj[n].httpUrl,
          isLive: true, // 直播模式
          hasAudio: false,
          enableWorker: false,
          enableStashBuffer: false, // 启用数据缓存机制，提高视频的流畅度和稳定性。
          stashInitialSize: 32 * 1024, // 初始缓存大小。单位：字节。建议针对直播：调整为1024kb
          stashInitialTime: 0.2, // 缓存初始时间。单位：秒。建议针对直播：调整为200毫秒
          seekType: "range", // 建议将其设置为“range”模式，以便更快地加载视频数据，提高视频的实时性。
          lazyLoad: false, //关闭懒加载模式，从而提高视频的实时性。建议针对直播：调整为false
          lazyLoadMaxDuration: 0.2, // 懒加载的最大时长。单位：秒。建议针对直播：调整为200毫秒
          deferLoadAfterSourceOpen: false,
        },
        {
          accurateSeek: false, // 精确查找任何帧，加载会变慢
          autoCleanupSourceBuffer: true, // 自动清理缓存
          autoCleanupMinBackwardDuration: 60, // 指示进行自动清除时为反向缓冲区保留的持续时间（以秒为单位）。
          rangeLoadZeroStart: true, // Range: bytes=0-如果使用范围查找，则发送首次负载
          fixAudioTimestampGap: false, //false
          reuseRedirectedURL: true,
        }
      );

      this.flvPlayer.attachMediaElement(videoElement);
      this.flvPlayer.load();
      if (
        this.listObj[n] &&
        this.listObj[n].httpUrl !== null &&
        this.listObj[n].httpUrl !== ""
      ) {
        this.flvPlayer.play();
      }

      this.flvPlayer.on(flvJs.Events.ERROR, (errType, errDetail) => {
        console.log(errType, errDetail);
        if (errType === flvJs.ErrorTypes.NETWORK_ERROR) {
          // this.reloadVideo(videoElement, n, this.flvPlayer);
        }
        // errType是 NetworkError时，对应errDetail有：Exception、HttpStatusCodeInvalid、ConnectingTimeout、EarlyEof、UnrecoverableEarlyEof
        // errType是 MediaError时，对应errDetail是MediaMSEError   或MEDIA_SOURCE_ENDED
      });
    },
    reloadVideo(videoElement, n, flvPlayer) {
      videoElement.src = "";
      this.destoryVideo(flvPlayer);
      this.createVideo(videoElement, n);
    },
    destoryVideo(flvPlayer) {
      try {
        if (flvPlayer) {
          console.log("close flvPlayer......");
          flvPlayer.pause();
          flvPlayer.unload();
          flvPlayer.detachMediaElement();
          flvPlayer.destroy();
          flvPlayer = null;
        }
      } catch (err) {
        console.error(err);
        flvPlayer = null;
      }
    },

    //中断直播播放流
    closePlayer() {
      for (let i in this.flvPlayerList) {
        // console.log(i);
        this.destoryVideo(this.flvPlayerList[i]);
      }
      this.flvPlayerList = [];
    },

    closeTree(id) {
      this.$emit("custom-event", id);
    },

    //中断直播播放流
    closeVideo(id) {
      let video = this.listObj.find((temp) => temp.id == id);
      let location = this.listObj.indexOf(video);
      this.destoryVideo(this.flvPlayerList[location]);
      console.log("我执行了id：" + id + " 位置：" + location);
    },
    sClosePlayer(n) {
      console.log("我执行啦");
      this.closeTree([0, this.listObj[n].id]);
    },

    sClosePlayer2(n) {
      // this.closeTree(this.listObj[n].id);
      for (let i in this.flvPlayerList) {
        if (n == i) {
          this.destoryVideo(this.flvPlayerList[i]);
        }
      }
      let obj = [];
      for (let j = 0; j < this.listObj.length; j++) {
        if (j == n) {
          this.api({
            url: "/cameraLive/scloseCameraLive",
            method: "post",
            data: {
              id: this.listObj[n].id,
            },
          }).then((data) => {
            this.listQuery.id = this.listQuery.id.filter(
              (item) => item != this.listObj[n].id
            );
            this.getList();
          });
        }
      }
    },

    handleSizeChange(val) {
      //改变每页数量
      this.selectType(val);
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
  },
};
</script>

<style scoped lang="scss">
.video-inner {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  margin-bottom: -5px;
}
.video-wrapper {
  position: relative;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  /*border: none;*/
}

/*
css 注释：
只对table td设置左与上边框；
对table设置右与下边框；
为了便于截图，我们将css 注释说明换行排版
*/
.player-wrapper {
  padding: 0px;
  /*border: #000000 3px solid;*/
}
</style>
