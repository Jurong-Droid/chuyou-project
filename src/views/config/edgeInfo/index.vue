<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        size="medium"
        v-model="listQuery.edgeName"
        style="width: 8%; height: 36px"
        @keyup.enter.native="handleFilter"
        placeholder="设备名称"
        clearable
      />&nbsp;&nbsp;
      <el-input
        size="medium"
        v-model="listQuery.cameraName"
        style="width: 8%"
        @keyup.enter.native="handleFilter"
        placeholder="摄像头名称"
        clearable
      />&nbsp;&nbsp;
      <DatePicker
        style="height: 36px"
        startVaule="开始日期"
        endValue="结束日期"
        @sendTimeData="getTime"
      ></DatePicker
      >&nbsp;&nbsp;
      <el-button
        size="mini"
        v-waves
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        size="mini"
        type="primary"
        icon="plus"
        v-permission="'edgeInfo:add'"
        @click="showCreate"
        >添加</el-button
      >
      <el-button
        size="mini"
        type="danger"
        icon="plus"
        v-permission="'edgeInfo:list'"
        @click="resetHeartbeat"
        >重置状态检测
      </el-button>
    </div>
    <el-table
      :data="list"
      v-loading="listLoading"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
    >
      <el-table-column align="center" label="序号" min-width="5">
        <template v-slot="props">
          <span v-text="getIndex(props.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备类别" min-width="8">
        <template v-slot="scope">
          <span v-text="showDeviceType(scope.row.devicetype)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备名称" min-width="12">
        <template v-slot="scope">
          <span class="link-type" @click="handleDetail(scope.row)">{{
            scope.row.edgeName
          }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="设备位置" min-width="12">
        <template v-slot="scope">
          <span v-text="showlocation(scope.row.locationid)"></span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="设备信息"
        prop="edgeInfo"
        min-width="10"
      ></el-table-column>
      <el-table-column
        align="center"
        label="设备地址"
        prop="edgeIp"
        min-width="13"
      ></el-table-column>
      <el-table-column align="center" label="状态" min-width="8">
        <template v-slot="props">
          <el-tag
            effect="plain"
            style="width: 80px"
            v-if="props.row.status === '200'"
            type="success"
            disable-transitions
          >
            {{ statusMap[props.row.status] }}
          </el-tag>
          <el-tag
            effect="plain"
            style="width: 80px"
            v-else-if="
              props.row.status === '500' && props.row.heartbeatCount > 5
            "
            type="danger"
            disable-transitions
          >
          </el-tag>
          <el-tag
            effect="plain"
            style="width: 80px"
            v-else
            type="info"
            disable-transitions
            >{{ statusMap[props.row.status] }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限角色" min-width="13">
        <template v-slot="scope">
          <div
            style="display: inline-block"
            v-for="i in scope.row.roles"
            :key="i.roleId"
          >
            <el-tag
              style="margin-right: 6px; margin-bottom: 6px"
              effect="plain"
              size="mini"
              type="primary"
              >{{ i.roleName }}</el-tag
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        min-width="12"
      ></el-table-column>
      <el-table-column align="center" label="摄像头数" min-width="6">
        <template v-slot="scope">
          <span>{{ scope.row.cameraInfoList.length }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="25">
        <template v-slot="scope">
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            icon="add"
            @click="showBindCamera(scope.$index)"
            v-permission="'edgeInfo:add'"
            >绑定摄像头
          </el-button>
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            icon="edit"
            @click="showUpdate(scope.$index)"
            v-permission="'edgeInfo:update'"
            >修改
          </el-button>
          <el-button
            size="mini"
            :plain="true"
            type="danger"
            icon="delete"
            @click="deleteEdgeInfo(scope.$index)"
            v-permission="'edgeInfo:delete'"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="height: 14px;"></div>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageRow"
      :total="totalCount"
      :page-sizes="[10, 20, 50, 100]"
      background
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form
        class="small-space"
        :model="tempEdge"
        label-position="right"
        label-width="130px"
      >
        <el-form-item label="设备名称" required>
          <el-input
            type="text"
            v-model="tempEdge.edgeName"
          />
        </el-form-item>
        <el-form-item label="设备类型" required>
          <el-select
            v-model="tempEdge.devicetype"
            placeholder="请选择设备类型"
          >
            <el-option
              v-for="item in device"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select
            v-model="tempEdge.roleIds"
            multiple
            placeholder="支持多角色"
          >
            <el-option
              v-for="item in roles"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="油田名称" required>
          <el-select
            @change="oilfieldSelectChange()"
            v-model="oilfieldid"
            placeholder="请选择油田"
          >
            <el-option
              v-for="item in oilfieldlist"
              :key="item.id"
              :label="item.oilfield"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采油厂名称" required>
          <el-select
            @change="oilplantSelectChange()"
            v-model="oilplantid"
            placeholder="请选择采油厂"
          >
            <el-option
              v-for="item in tempoilplantlist"
              :key="item.id"
              :label="item.oilplant"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单位名称" required>
          <el-select
            @change="opareaSelectChange()"
            v-model="opareaid"
            placeholder="请选择单位"
          >
            <el-option
              v-for="item in tempoparealist"
              :key="item.id"
              :label="item.oparea"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域名称" required>
          <el-select
            v-model="tempEdge.locationid"
            placeholder="请选择区域"
          >
            <el-option
              v-for="item in templocationlist"
              :key="item.id"
              :label="item.location"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备地址">
          <el-input type="text" v-model="tempEdge.edgeIp">
          </el-input>
        </el-form-item>
        <el-form-item label="设备信息">
          <el-input
            type="textarea"
            autosize
            v-model="tempEdge.edgeInfo"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="RabbitMQ的队列" required>
          <el-input
            type="textarea"
            v-model="tempEdge.mqQueue"
            placeholder="此边缘节点绑定的RabbitMQ的队列"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          @click="addEdgeInfo"
          >创 建</el-button
        >
        <el-button type="primary" v-else @click="updateEdgeInfo"
          >修 改</el-button
        >
      </div>
    </el-dialog>
    <el-dialog title="绑定摄像头" :visible.sync="dialogCameraVisible" width="600px">
      <el-form
        class="small-space"
        :model="tempCamera"
        label-position="right"
        label-width="110px"
      >
        <el-form-item label="摄像头名称" required>
          <el-cascader
            v-model="tempCamera.cameraIds"
            :options="options"
            :props="defaultProps"
            filterable
            clearable
            placeholder="请选择摄像头信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCameraVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCamera">绑 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DatePicker from "@/components/DatePicker";
import waves from "@/directives/waves/index.js"; // 水波纹指令
export default {
  components: {
    DatePicker,
  },
  directives: {
    waves,
  },
  data() {
    return {
      device: [
        {
          id: 1,
          name: "边缘端",
        },
        {
          id: 0,
          name: "服务端",
        },
      ],
      tempoparealist: [],
      tempoilplantlist: [],
      oparea: [],
      oparealist: [],
      oilplantlist: [],
      oilplant: [],
      oilfieldlist: [],
      oilfield: [],
      opareaid: null,
      oilplantid: null,
      oilfieldid: null,
      templocationlist: [],
      location: [],
      locationlist: [],
      tempinfo: {
        oname: 4,
        fid: null,
        name: null,
      },

      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        areaId: null,
        edgeName: null,
        updateTimeFrom: null,
        updateTimeTo: null,
      },
      createTime: [],
      options: [], //摄像头信息列表
      defaultProps: {
        children: "children",
        label: "name",
        value: "id",
        level: "level",
        multiple: true,
        emitPath: false, //在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
      },
      roles: [], //角色列表
      dialogStatus: "create",
      dialogFormVisible: false,
      dialogCameraVisible: false,
      textMap: {
        update: "编辑",
        create: "新建",
      },
      tempEdge: {
        id: null,
        edgeName: null,
        edgeIp: null,
        edgeInfo: null,
        sshHost: null,
        sshUsername: null,
        sshPassword: null,
        mqQueue: null,
        status: null,
        heartbeatCount: null,
        roleIds: [],
        locationid: null,
        devicetype: null,
      },
      tempCamera: {
        edgeId: null,
        cameraIds: [],
      },
      statusMap: {
        200: "在线",
        400: "离线",
        500: "设备异常",
      },
    };
  },
  created() {
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    document.body.style.zoom = "80%";
    this.getoparea();
    this.getoilplant();
    this.getoilfield();
    this.getlocation();
    this.getList();
    if (this.hasPerm("edgeInfo:add") || this.hasPerm("edgeInfo:update")) {
      this.getAllRoles();
    }
  },
  methods: {
    oilfieldSelectChange() {
      (this.oilplantid = null),
        (this.tempoilplantlist = []),
        this.oilplantlist.forEach((temp) => {
          if (temp.fid === this.oilfieldid) {
            this.tempoilplantlist.push(temp);
          }
        });
    },
    oilplantSelectChange() {
      (this.opareaid = null),
        (this.tempoparealist = []),
        this.oparealist.forEach((temp) => {
          if (temp.fid === this.oilplantid) {
            this.tempoparealist.push(temp);
          }
        });
    },
    opareaSelectChange() {
      (this.tempEdge.locationid = null),
        (this.templocationlist = []),
        this.locationlist.forEach((temp) => {
          if (temp.fid === this.opareaid) {
            this.templocationlist.push(temp);
          }
        });
    },
    getoilfield() {
      this.api({
        url: "/organizationInfo/getoilfield",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oilfieldlist.push({
            id: temp.oilfieldId,
            oilfield: temp.oilfieldName,
          });
        });
      });
    },
    getoilplant() {
      this.api({
        url: "/organizationInfo/getoilplant",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oilplantlist.push({
            id: temp.oilplantId,
            fid: temp.oilfieldId,
            oilfield: temp.oilfieldName,
            oilplant: temp.oilplantName,
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
            oilfield: temp.oilfieldName,
            oilplant: temp.oilplantName,
            oparea: temp.opareaName,
          });
        });
        console.log(this.oparealist);
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
            oilfieldid: temp.oilfieldId,
            oilplantid: temp.oilplantId,
            fid: temp.opareaId,
            oilfield: temp.oilfieldName,
            oilplant: temp.oilplantName,
            oparea: temp.opareaName,
            location: temp.locationName,
          });
        });
      });
    },
    showOparea(n) {
      for (const otemp of this.oparealist) {
        if (n == otemp.id) {
          //console.log(otemp.oparea);
          return otemp.oparea;
        }
      }
    },
    showlocation(n) {
      for (const otemp of this.locationlist) {
        if (n == otemp.id) {
          return otemp.location;
        }
      }
    },

    getAllRoles() {
      this.api({
        url: "/common/getUserRoles",
        method: "get",
      }).then((data) => {
        this.roles = data;
      });
    },
    getCameraList() {
      this.api({
        url: "/common/getAllCameras",
        method: "get",
      }).then((data) => {
        console.log(data);
        this.options = data;
      });
    },
    //时间查询组件设置时间方法
    getTime(date) {
      this.listQuery.updateTimeFrom = date.updateTimeFrom;
      this.listQuery.updateTimeTo = date.updateTimeTo;
    },
    getList() {
      //查询列表
      this.listLoading = true;
      this.api({
        url: "/edgeInfo/listEdgeInfo",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        console.log(data);
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.totalCount;
        //若是带有参数，则打开修改页面
        let edgeId = this.$route.params.edgeId;
        if (edgeId) {
          let i;
          for (i = 0; i < this.list.length; i++) {
            if (edgeId === this.list[i].id) {
              break;
            }
          }
          this.showUpdate(i);
        }
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
      //查询事件
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getIndex($index) {
      //表格序号
      return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1;
    },
    showDeviceType(n) {
      if (n == 1) {
        return "边缘端";
      } else {
        return "服务端";
      }
    },
    showCreate() {
      //显示新增对话框
      this.tempEdge.id = "";
      this.tempEdge.edgeName = "";
      this.tempEdge.edgeIp = "";
      this.tempEdge.edgeInfo = "";
      this.tempEdge.sshHost = "22";
      this.tempEdge.sshUsername = "";
      this.tempEdge.sshPassword = "";
      this.tempEdge.mqQueue = "";
      this.tempEdge.roleIds = [];
      (this.tempEdge.locationid = ""),
        (this.tempEdge.devicetype = ""),
        (this.dialogStatus = "create");
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      let edgeInfo = this.list[$index];
      this.tempEdge.id = edgeInfo.id;
      this.tempEdge.edgeName = edgeInfo.edgeName;
      this.tempEdge.edgeIp = edgeInfo.edgeIp;
      this.tempEdge.edgeInfo = edgeInfo.edgeInfo;
      this.tempEdge.sshHost = edgeInfo.sshHost;
      this.tempEdge.sshUsername = edgeInfo.sshUsername;
      this.tempEdge.sshPassword = edgeInfo.sshPassword;
      this.tempEdge.mqQueue = edgeInfo.mqQueue;
      this.tempEdge.roleIds = edgeInfo.roles.map((x) => x.roleId);
      this.tempEdge.locationid = edgeInfo.locationid;
      // this.tempEdge.devicetype=edgeInfo.devicetype;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;

      console.log(this.list);

      this.locationlist.forEach((temp) => {
        if (this.tempEdge.locationid == temp.id) {
          this.oilfieldid = temp.oilfieldid;
          this.oilplantid = temp.oilplantid;
        }
      });
      (this.tempoilplantlist = []),
        this.oilplantlist.forEach((temp) => {
          if (temp.fid === this.oilfieldid) {
            this.tempoilplantlist.push(temp);
          }
        });
      this.oilplantSelectChange();
      this.opareaSelectChange();
    },
    showBindCamera($index) {
      if (this.options.length === 0) {
        this.getCameraList();
      }
      let edgeInfo = this.list[$index];
      this.tempCamera.edgeId = edgeInfo.id;
      this.tempCamera.cameraIds = [];
      this.dialogCameraVisible = true;
    },
    resetHeartbeat() {
      let _vue = this;
      _vue
        .$confirm("确定重置心跳次数?", "提示", {
          confirmButtonText: "确定",
          showCancelButton: false,
          type: "warning",
        })
        .then(() => {
          _vue
            .api({
              url: "/edgeInfo/resetHeartbeat",
              method: "post",
            })
            .then((data) => {
              this.$message.success("成功重置成功" + data + "条！");
              _vue.getList();
            });
        });
    },
    validate() {
      let u = this.tempEdge;
      if (u.devicetype.length === 0) {
        this.$message.warning("请选择设备类型");
        return false;
      }
      if (u.edgeName.trim().length === 0) {
        this.$message.warning("请填写设备名称");
        return false;
      }
      if (u.roleIds.length === 0) {
        this.$message.warning("请选择角色");
        return false;
      }
      const reg =
        /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      if (u.edgeIp.trim().length > 0 && !reg.test(u.edgeIp)) {
        this.$message.warning("请输入正确的IP地址");
        return false;
      }
      return true;
    },
    addEdgeInfo() {
      if (!this.validate()) return;
      //添加新用户
      this.api({
        url: "/edgeInfo/addEdgeInfo",
        method: "post",
        data: this.tempEdge,
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
        this.$message.success("新增成功！");
      });
    },
    updateEdgeInfo() {
      if (!this.validate()) return;
      //修改用户信息
      let _vue = this;
      this.api({
        url: "/edgeInfo/updateEdgeInfo",
        method: "post",
        data: this.tempEdge,
      }).then(() => {
        _vue.$message.success("更新成功！");
        _vue.dialogFormVisible = false;
        //router没有提供清空数据的方法 刷新可清楚数据
        location.reload();
      });
    },
    deleteEdgeInfo($index) {
      let _vue = this;
      //需要使用$createElement来创建 定义含义class的可以 h('i', { class: 'el-icon-question' })
      const h = _vue.$createElement;
      _vue
        .$confirm("提示", {
          title: "提示",
          message: h("div", [
            h("p", "确定删除此设备信息？"),
            h("p", "设备与摄像头的关联关系会被删除！"),
            h("p", "设备上的检测算法模型信息会被删除！"),
          ]),
          showCancelButton: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          let edgeInfo = this.list[$index];
          _vue
            .api({
              url: "/edgeInfo/deleteEdgeInfo",
              method: "post",
              data: {
                keyId: edgeInfo.id,
              },
            })
            .then(() => {
              _vue.getList();
              _vue.$message.success("删除成功!");
            })
            .catch(() => {
              _vue.$message.error("删除失败");
            });
        });
    },
    addCamera() {
      let _vue = this;
      this.api({
        url: "/edgeInfo/bindCamera",
        method: "post",
        data: this.tempCamera,
      }).then(() => {
        _vue.$message.success("绑定成功！");
        _vue.dialogCameraVisible = false;
        _vue.getList();
      });
    },
    handleDetail(row) {
      this.$router.push({
        name: "edgeDetail",
        params: {
          data: row,
        },
      });
    },
  },
};
</script>

