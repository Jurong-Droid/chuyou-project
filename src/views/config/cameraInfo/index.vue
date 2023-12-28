<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px;">
      <el-input
        size="medium"
        v-model="listQuery.cameraName"
        style="width: 8%; height: 36px"
        @keyup.enter.native="handleFilter"
        placeholder="摄像头名称"
        clearable
      />
      <el-select
        style="height: 36px"
        size="medium"
        v-model="listQuery.cameraType"
        placeholder="请选择摄像头类型"
        clearable
      >
        <el-option
          v-for="item in cameraType"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select
        size="medium"
        v-model="listQuery.areaId"
        style="height: 36px; width: 8%"
        placeholder="区域名称"
        clearable
      >
        <el-option
          v-for="item in areas"
          :key="item.id"
          :label="item.areaName"
          :value="item.id"
        />
      </el-select>
      <DatePicker
        style="height: 36px"
        startVaule="开始日期"
        endValue="结束日期"
        @sendTimeData="getTime"
      ></DatePicker>
      <el-button
        size="mini"
        v-waves
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        style="margin-left: 10px;"
      >
        搜索
      </el-button>
      <el-button
        size="mini"
        type="primary"
        icon="plus"
        v-permission="'cameraInfo:add'"
        @click="showCreate"
        >添加
      </el-button>
    </div>
    <el-table
      :data="list"
      v-loading="listLoading"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
      :height="700"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
    >
      <el-table-column align="center" label="特别关注" min-width="5">
        <template v-slot="scope">
          <el-button
            v-if="scope.row.collectsign == '0'"
            size="mini"
            :plain="true"
            type="primary"
            style="font-size: 43px; background-color: transparent; border: none"
            icon="el-icon-star-on"
            :style="{ color: '#a5a519' }"
            @click="updatesign(1, scope.$index)"
          />
          <el-button
            v-else
            size="mini"
            :plain="true"
            type="primary"
            style="font-size: 35px; background-color: transparent; border: none"
            icon="el-icon-star-off"
            :style="{ color: '#a5a519' }"
            @click="updatesign(0, scope.$index)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="序号" min-width="3">
        <template v-slot="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="单位" min-width="6">
        <template v-slot="scope">
          <span v-text="showOparea(scope.row.opareaid)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="区域" min-width="6">
        <template v-slot="scope">
          <span v-text="showlocation(scope.row.locationid)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="摄像头名称" min-width="6">
        <template v-slot="scope">
          <span class="link-type" @click="handleDetail(scope.row)">{{
            scope.row.cameraName
          }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型" min-width="8">
        <template v-slot="props">
          <el-tag v-if="props.row.cameraType === '1'" disable-transitions
            >源摄像头流</el-tag
          >
          <el-tag
            v-else-if="props.row.cameraType === '2'"
            type="warning"
            disable-transitions
            >检测结果流</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column align="center" label="ip" prop="ip" min-width="8">
        <template slot-scope="scope">
          <div
            style="
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
            :title="scope.row.ip"
          >
            {{ scope.row.ip }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="视频流地址"
        prop="rtsp"
        min-width="8"
      >
        <template slot-scope="scope">
          <div
            style="
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
            :title="scope.row.rtsp"
          >
            {{ scope.row.rtsp }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="报警间隔（秒）"
        prop="alertStep"
        min-width="8"
      ></el-table-column>
      <el-table-column
        align="center"
        label="绑定模型数量"
        prop="modnums"
        min-width="6"
      ></el-table-column>

      <el-table-column align="center" label="在线状态" min-width="6">
        <template slot-scope="scope">
          <!--          {{scope.row.status===0?'离线':'在线'}}-->
          <el-button
            size="mini"
            class="vertical-text"
            style="height: 60%; align-self: center"
            circle
            :type="scope.row.status === 0 ? 'danger' : 'success'"
          ></el-button>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="最近修改时间"
        prop="updateTime"
        min-width="10"
      ></el-table-column>
      <el-table-column
        style="position: relative; display: inline-block; width: 100%"
        align="center"
        label="操作"
        min-width="17"
      >
        <template v-slot="scope">
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            icon="add"
            @click="showBindModule(scope.$index)"
            v-permission="'cameraInfo:add'"
            >绑定模型
          </el-button>
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            icon="edit"
            @click="showUpdate(scope.$index)"
            v-permission="'cameraInfo:update'"
            >修改
          </el-button>
          <el-button
            size="mini"
            :plain="true"
            type="danger"
            icon="delete"
            @click="deleteCamera(scope.$index)"
            v-permission="'cameraInfo:delete'"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form
        class="small-space"
        :model="tempCamera"
        label-position="right"
        label-width="140px"
      >
        <el-form-item label="智能监控页面展示">
          <el-select
            @change="updateUse"
            v-model="tempCamera.userIsHas"
          >
            <el-option
              v-for="item in isHas"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="摄像头名称" required>
          <el-input
            type="text"
            v-model="tempCamera.cameraName"
          />
        </el-form-item>
        <el-form-item label="摄像头类型" required>
          <el-select
            v-model="tempCamera.cameraType"
            placeholder="请选择摄像头类型"
          >
            <el-option
              v-for="item in cameraType"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区域名称" required>
          <el-select
            v-model="tempCamera.areaId"
            placeholder="请选择区域信息"
          >
            <el-option
              v-for="item in areas"
              :key="item.id"
              :label="item.areaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form
          class="small-space"
          :model="tempinfo"
          label-position="right"
          label-width="140px"
        >
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
              v-model="tempCamera.opareaid"
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
          <el-form-item label="位置名称" required>
            <el-select
              v-model="tempCamera.locationid"
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
        </el-form>

        <el-form-item label="角色" required>
          <el-select
            v-model="tempCamera.roleIds"
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
        <el-form-item label="ip地址">
          <el-input
            type="text"
            v-model="tempCamera.ip"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="视频流地址" required>
          <el-input
            type="textarea"
            autosize
            v-model="tempCamera.rtsp"
            placeholder="摄像头的直播流源 (支持RTSP和RTMP)"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="设备访问密码">
          <el-input
            type="password"
            v-model="tempCamera.password"
            autocomplete="new-password"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="报警间隔（秒）" required>
          <el-input
            type="text"
            v-model="tempCamera.alertStep"
            onkeyup="this.value = this.value.replace(/[^\d.]/g,'');"
            maxlength="11"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          @click="addCamera"
          >创 建</el-button
        >
        <el-button type="primary" v-else @click="updateCamera">修 改</el-button>
      </div>
    </el-dialog>

    <el-dialog title="绑定检测算法模型" :visible.sync="dialogModuleVisible" width="600px">
      <el-form
        class="small-space"
        :model="tempModule"
        label-position="right"
        label-width="110px"
      >
        <el-form-item label="检测算法模型" required>
          <el-cascader
            v-model="tempModule.moduleIds"
            :options="options"
            :props="defaultProps"
            filterable
            clearable
            placeholder="请选择算法模型"
            popper-class="example"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogModuleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addModule">绑 定</el-button>
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
      tempoparealist: [],
      tempoilplantlist: [],
      oparea: [],
      oparealist: [],
      oilplantlist: [],
      oilplant: [],
      oilfieldlist: [],
      oilfield: [],
      topareaid: null,
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
      isHas: [
        { id: 1, name: "展示" },
        { id: 0, name: "隐藏" },
      ],
      cameraIds: [],
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        areaId: null,
        cameraName: null,
        cameraType: null,
        updateTimeFrom: null,
        updateTimeTo: null,
      },
      updateValue: [],
      options: [], //模型信息列表
      defaultProps: {
        children: "children",
        label: "name",
        value: "id",
        level: "level",
        multiple: true,
        emitPath: false, //在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
      },
      roles: [], //角色列表
      areas: [], //区域列表
      cameraType: [
        { id: "1", name: "源摄像头流" },
        { id: "2", name: "检测结果流" },
      ],
      dialogStatus: "create",
      dialogFormVisible: false,
      textMap: {
        update: "编辑",
        create: "新建",
      },
      tempCamera: {
        id: null,
        areaId: "1",
        areaName: null,
        cameraName: null,
        cameraType: null,
        ip: null,
        rtsp: null,
        password: null,
        alertStep: null,
        edgeHost: null,
        edgeUsername: null,
        edgePassword: null,
        opareaId: null,
        roleIds: [],
        opareaid: null,
        locationid: null,
        collectsign: null,
        userIsHas: null,
      },
      tempModule: {
        cameraId: null,
        moduleIds: [],
      },
      dialogModuleVisible: false,
    };
  },
  created() {
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    this.getoparea();
    this.getoilplant();
    this.getoilfield();
    this.getlocation();
    this.getList();
    this.getListUser();
    if (this.hasPerm("cameraInfo:add") || this.hasPerm("cameraInfo:update")) {
      this.getAllRoles();
      this.getAllAreas();
    }
  },
  mounted() {
    document.body.style.zoom = "80%";
  },
  methods: {
    getListUser() {
      this.api({
        url: "/cameraInfo/listUserCamera",
        method: "get",
      }).then((data) => {
        this.cameraIds = data;
      });
    },
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
      (this.tempCamera.opareaid = null),
        (this.tempoparealist = []),
        this.oparealist.forEach((temp) => {
          if (temp.fid === this.oilplantid) {
            this.tempoparealist.push(temp);
          }
        });
    },
    opareaSelectChange() {
      (this.tempCamera.locationid = null),
        (this.templocationlist = []),
        this.locationlist.forEach((temp) => {
          if (temp.fid === this.tempCamera.opareaid) {
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

    updateUse() {
      this.api({
        url: "/cameraInfo/updateSign",
        method: "get",
        params: {
          camera: this.tempCamera.id,
          opt: this.tempCamera.userIsHas,
        },
      }).then((data) => {
        this.dialogFormVisible = false;
        if (this.tempCamera.userIsHas == 1) {
          this.cameraIds.push(this.tempCamera.id);
        } else {
          this.cameraIds = this.cameraIds.filter(
            (temp) => temp != this.tempCamera.id
          );
        }

        this.$message.success("修改成功!");
      });
    },

    updatesign(n, $index) {
      let camera = this.list[$index];
      this.tempCamera.id = camera.id;
      this.tempCamera.areaId = camera.areaId;
      this.tempCamera.areaName = camera.areaName;
      this.tempCamera.cameraName = camera.cameraName;
      this.tempCamera.cameraType = camera.cameraType;
      this.tempCamera.ip = camera.ip;
      this.tempCamera.rtsp = camera.rtsp;
      this.tempCamera.password = camera.password;
      this.tempCamera.alertStep = camera.alertStep;
      this.tempCamera.edgeHost = camera.edgeHost;
      this.tempCamera.opareaId = camera.opareaId;
      this.tempCamera.edgeUsername = camera.edgeUsername;
      this.tempCamera.edgePassword = camera.edgePassword;
      this.tempCamera.roleIds = camera.roles.map((x) => x.roleId);
      this.tempCamera.collectsign = n;
      this.updateCamera();
    },

    getAllRoles() {
      this.api({
        url: "/common/getUserRoles",
        method: "get",
      }).then((data) => {
        this.roles = data;
      });
    },
    getAllAreas() {
      this.api({
        url: "/common/getAllAreas",
        method: "get",
      }).then((data) => {
        this.areas = data;
      });
    },
    getAllModules(cameraId) {
      this.api({
        url: "/common/getAllModules",
        method: "get",
        params: { cameraId: cameraId },
      }).then((data) => {
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
        url: "/cameraInfo/listCamera",
        method: "get",
        params: this.listQuery,
      }).then((data) => {
        this.listLoading = false;
        this.list = data.list;
        this.totalCount = data.totalCount;
      });
    },
    showOparea(n) {
      for (const otemp of this.oparealist) {
        if (n == otemp.id) {
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
    deleteCamera($index) {
      let _vue = this;
      this.$confirm("确定删除此设备?", "提示", {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: "warning",
      }).then(() => {
        let camera = _vue.list[$index];
        _vue
          .api({
            url: "/cameraInfo/deleteCamera",
            method: "post",
            data: {
              keyId: camera.id,
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
    handleDetail(row) {
      this.$router.push({
        name: "cameraDetail",
        params: {
          data: row,
        },
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
    showCreate() {
      //显示新增对话框
      this.tempCamera.areaId = "";
      this.tempCamera.areaName = "";
      this.tempCamera.cameraName = "";
      this.tempCamera.ip = "";
      this.tempCamera.rtsp = "";
      this.tempCamera.password = "";
      this.tempCamera.alertStep = "";
      this.tempCamera.edgeHost = "";
      this.tempCamera.edgeUsername = "";
      this.tempCamera.edgePassword = "";
      (this.tempCamera.opareaId = ""),
        (this.tempCamera.opareaid = ""),
        (this.tempCamera.locationid = ""),
        (this.tempCamera.roleIds = []);
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      let camera = this.list[$index];
      this.tempCamera.id = camera.id;
      this.tempCamera.areaId = camera.areaId;
      this.tempCamera.areaName = camera.areaName;
      this.tempCamera.cameraName = camera.cameraName;
      this.tempCamera.cameraType = camera.cameraType;
      this.tempCamera.ip = camera.ip;
      this.tempCamera.rtsp = camera.rtsp;
      this.tempCamera.password = camera.password;
      this.tempCamera.alertStep = camera.alertStep;
      this.tempCamera.edgeHost = camera.edgeHost;
      this.tempCamera.opareaId = camera.opareaId;
      this.tempCamera.edgeUsername = camera.edgeUsername;
      this.tempCamera.edgePassword = camera.edgePassword;
      this.tempCamera.roleIds = camera.roles.map((x) => x.roleId);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.tempCamera.locationid = camera.locationid;
      this.tempCamera.opareaid = camera.opareaid;
      this.locationlist.forEach((temp) => {
        if (this.tempCamera.locationid == temp.id) {
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
      //console.log(this.cameraIds)
      if (this.cameraIds.some((id) => id === camera.id)) {
        this.tempCamera.userIsHas = 1;
      } else {
        this.tempCamera.userIsHas = 0;
      }
    },
    showBindModule($index) {
      let cameraInfo = this.list[$index];
      this.tempModule.cameraId = cameraInfo.id;
      this.tempModule.moduleIds = [];
      this.dialogModuleVisible = true;
      this.getAllModules(cameraInfo.id);
    },
    validate() {
      let u = this.tempCamera;
      if (u.cameraName.trim().length === 0) {
        this.$message.warning("请填写摄像头名称");
        return false;
      }
      if (u.rtsp.trim().length === 0) {
        this.$message.warning("请填rtsp地址");
        return false;
      }

      if (u.roleIds.length === 0) {
        this.$message.warning("请选择角色");
        return false;
      }
      return true;
    },
    updateCamera() {
      if (!this.validate()) return;
      //修改用户信息
      let _vue = this;
      console.log(this.tempCamera);
      this.api({
        url: "/cameraInfo/updateCamera",
        method: "post",
        data: this.tempCamera,
      }).then(() => {
        _vue.$message.success("更新成功！");
        _vue.dialogFormVisible = false;
        //router没有提供清空数据的方法 刷新可清楚数据
        location.reload();
      });
    },

    addModule() {
      let _vue = this;
      this.api({
        url: "/cameraInfo/bindModule",
        method: "post",
        data: this.tempModule,
      }).then(() => {
        _vue.$message.success("绑定成功！");
        _vue.dialogModuleVisible = false;
        _vue.getList();
      });
    },
    addCamera() {
      if (!this.validate()) return;
      //添加新用户
      this.api({
        url: "/cameraInfo/addCamera",
        method: "post",
        data: this.tempCamera,
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
        this.$message.success("新增成功！");
      });
    },
    handleChange(value) {},
  },
};
</script>

<style scoped>
.el-range-input {
  padding-bottom: 10px;
}
</style>

