<template>
  <div class="app-container">
    <div>
      <el-table
        :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row
      >
        <el-table-column align="center" label="序号" width="80">
          <template slot-scope="scope">
            <span v-text="getIndex(scope.$index)"> </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="区域" style="width: 40px">
          <template slot-scope="scope">
            <span>{{ scope.row.areaName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备名" style="width: 60px">
          <template slot-scope="scope">
            <span>{{ scope.row.cameraName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" width="170">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center"  label="管理"  width="200" v-if="hasPerm('videoLive:start')">
          <template slot-scope="scope"> 
            <el-button @click="playMv(scope.row)"><svg-icon icon-class="play"/> </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
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
    <div class="video_con" v-show="showVideo">
      <video ref="videoElement" muted controls width="98%" height="98%"></video>
      <div class="mask" @click="closeMv"></div>
    </div>
  </div>
</template>
<script>
import flvjs from "flv.js";
export default {
  data() {
    return {
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        name: "",
      },
      //FLV参数
      options : [],
      // 显示视频播放
      showVideo: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      //查询列表
      if (!this.hasPerm("videoLive:list")) {
        return;
      }
      this.listLoading = true;
      this.api({
        url: "/videoLive/listVideoLive",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.totalCount;
      });
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
    playMv(record) {
       
      if (record.sourceUrl) {
        this.showVideo = true;
         this.api({
        url: "/videoLive/startVideoLive",
        method: "get",
        params: {id : record.id},
      }).then((data) => {
        if (flvjs.isSupported()) {
          const videoElement = this.$refs.videoElement;
          this.flvPlayer = flvjs.createPlayer({
            type: 'flv',
            // enableWorker: true, //浏览器端开启flv.js的worker,多进程运行flv.js
            // isLive: true, //直播模式
            // hasAudio: true, //开启音频
            // hasVideo: true,
            // stashInitialSize: 128,
            // enableStashBuffer: false, //播放flv时，设置是否启用播放缓存，只在直播起作用。
            url: data.httpUrl
          });
          this.flvPlayer.attachMediaElement(videoElement);
          try {
            this.flvPlayer.load();
            this.flvPlayer.play();
          } catch (error) {
            console.log(error);
          }
        }
      });
       
      
      }
    },
    //关闭mv界面
    closeMv() {
      this.showVideo = false;
      // this.$refs.video.pause();
    },
  },
};
</script>
<style scoped>
.video_con video {
  position: fixed;
  width: 800px;
  height: 546px;
  left: 50%;
  top: 50%;
  margin-top: -273px;
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
</style>
