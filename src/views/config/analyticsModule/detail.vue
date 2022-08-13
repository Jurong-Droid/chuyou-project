<template>
  <div class="app-container">
    <el-page-header @back="callback" content="检测模型信息详情">
    </el-page-header>
    <div style="margin:20px 0 5px 20px">
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-monitor"></i>
            所在边缘端名称
          </template>
          {{ tempModule.edgeName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            模型名称
          </template>
          {{ tempModule.moduleName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            模型类型
          </template>
          {{ tempModule.moduleType }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            模型状态
          </template>
          {{ statusMap[tempModule.status] }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-info"></i>
            模型说明
          </template>
          {{ tempModule.description }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            模型版本
          </template>
          {{ tempModule.version }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-upload"></i>
            上传存储路径
          </template>
          {{ tempModule.storagePath }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-date"></i>
            创建时间
          </template>
          {{ tempModule.createTime }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-date"></i>
            修改时间
          </template>
          {{ tempModule.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-warning"></i>
            尝试连接模型次数
          </template>
          {{ tempModule.heartbeatCount }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider></el-divider>
    <div>
      <el-row type="flex">
        <el-col :span="24">
          <div class="grid-content bg-purple-light">
            <p>检测模型关联的摄像头信息列表</p>
          </div>
        </el-col>
      </el-row>
      <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border style="width: 100%">
        <el-table-column align="center" label="序号" type="index" min-width="5">
        </el-table-column>
        <el-table-column align="center" label="摄像头名称" min-width="15">
          <template v-slot="scope">
            <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.cameraName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="ip" prop="ip" min-width="10"></el-table-column>
        <el-table-column align="center" label="视频流地址" prop="rtsp" min-width="20"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tempModule: {
        id: null,
        areaId: null,
        areaName: null,
        cameraName: null,
        ip: null,
        rtsp: null,
        password: null,
        alertStep: null,
        roles: []
      },
      statusMap: {
        1: '创建',
        2: '上传成功',
        3: '同步成功',
        4: '发布中',
        5: '发布成功',
        6: '同步失败',
        7: '发布失败',
        200: '正常运行',
        201: '无任务运行'
      },
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
    }

  },
  created() {
    let moduleId = this.$route.params.moduleId;
    if (moduleId) {
      this.getDetail(moduleId);
    }

  },
  methods: {
    getDetail(moduleId) {
      this.api({
        url: "/analyticsModule/detailAnalyticsModule",
        method: "get",
        params: {
          'moduleId': moduleId
        }
      }).then(data => {
        this.tempModule = data;
        this.getList();
      })
    },
    getList() {
      //查询列表
      console.log(this.tempModule.id)
      this.listLoading = true;
      this.api({
        url: "/analyticsModule/listCameras",
        method: "get",
        params: {
          'moduleId': this.tempModule.id
        }
      }).then(data => {
        this.listLoading = false;
        this.list = data;
      })
    },
    callback() {
      this.$router.push({
        name: 'analyticsModule',
      });
    },
    handleDetail(row) {
      this.$router.push({
        name: 'cameraDetail',
        params: {
          'data': row
        }
      });
    }
  }
}
</script>

<style>

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

p {
  padding: 10px 0;
}
</style>
