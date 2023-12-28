<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button
            :plain="true"
            type="primary"
            icon="plus"
            v-permission="'user:add'"
            @click="showCreate"
            >添加用户</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
    >
      <el-table-column align="center" label="序号" min-width="5">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="用户名"
        prop="username"
        min-width="10"
      ></el-table-column>
      <el-table-column
        align="center"
        label="手机号码"
        prop="phone"
        min-width="10"
      ></el-table-column>
      <el-table-column
        align="center"
        label="电子邮箱"
        prop="email"
        min-width="15"
      ></el-table-column>
      <el-table-column label="角色" min-width="15">
        <template slot-scope="scope">
          <div
            style="margin-right: 2%; display: inline-block"
            v-for="i in scope.row.roles"
            :key="i.roleId"
          >
            <el-tag
              effect="plain"
              type="primary"
              size="small"
              v-if="i.roleId === 1"
              >{{ i.roleName }}</el-tag
            >
            <el-tag effect="plain" type="primary" size="small" v-else>{{
              i.roleName
            }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="所在单位" min-width="20">
        <template v-slot="scope">
          <span v-text="showOparea(scope.row.oparea)"></span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        min-width="12"
      ></el-table-column>
      <el-table-column
        align="center"
        label="最近修改时间"
        prop="updateTime"
        min-width="12"
      ></el-table-column>
      <el-table-column align="center" label="管理" min-width="16">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :plain="true"
            type="primary"
            icon="edit"
            @click="showUpdate(scope.$index)"
            v-permission="'user:update'"
            >修改</el-button
          >
          <el-button
            size="mini"
            :plain="true"
            type="danger"
            icon="delete"
            @click="removeUser(scope.$index)"
            v-permission="'user:delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div style="height: 16px"></div>
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
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      width="600px"
    >
      <el-form
        class="small-space"
        :model="tempUser"
        label-position="left"
        label-width="auto"
      >
        <el-form-item label="用户名" v-if="dialogStatus === 'create'" required>
          <el-input type="text" v-model="tempUser.username" />
        </el-form-item>
        <el-form-item label="密码" v-if="dialogStatus === 'create'" required>
          <el-input type="password" v-model="tempUser.password" />
        </el-form-item>
        <el-form-item label="新密码" v-else>
          <el-input
            type="password"
            v-model="tempUser.password"
            placeholder="不填则表示不修改"
          />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select
            v-model="tempUser.roleIds"
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

        <el-form-item label="所属采油厂">
          <el-select
            v-model="oilplant"
            placeholder="选择采油厂"
            @change="selectoparea()"
          >
            <el-option
              v-for="item in oilplantlist"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="所属单位">
          <el-select
            v-model="oparea"
            placeholder="选择单位"
            @change="updateoparea()"
          >
            <el-option
              v-for="item in oparealist"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" required>
          <el-input type="text" v-model="tempUser.phone" style="width: 40%" />
        </el-form-item>
        <el-form-item label="电子邮箱" required>
          <el-input type="text" v-model="tempUser.email" style="width: 40%" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          @click="createUser"
          >创 建</el-button
        >
        <el-button type="primary" v-else @click="updateUser">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      oilplant: "",
      oparea: "",
      oparealist: [],
      foparealist: [],
      oilplantlist: [],
      totalCount: 0, //分页组件--数据总条数
      list: [], //表格的数据
      listLoading: false, //数据加载等待动画
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
      },
      roles: [], //角色列表
      dialogStatus: "create",
      dialogFormVisible: false,
      textMap: {
        update: "编辑",
        create: "新建用户",
      },
      tempUser: {
        username: null,
        password: null,
        phone: null,
        email: null,
        oparea: null,
        avatar: null,
        roleIds: [],
        userId: null,
      },
    };
  },
  created() {
    document.body.style.zoom = "80%";
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    this.getoilplant();
    this.getoparea();
    this.getList();
    if (this.hasPerm("user:add") || this.hasPerm("user:update")) {
      this.getAllRoles();
    }
  },
  computed: {
    ...mapGetters(["userId"]),
  },
  methods: {
    updateoparea() {
      this.tempUser.oparea = this.oparea;
    },
    showOparea(n) {
      if (n == 0) return "全部";
      for (const otemp of this.foparealist) {
        if (n == otemp.value) {
          return otemp.label;
        }
      }
    },
    selectoparea() {
      this.oparealist = this.foparealist.filter(
        (temp) => temp.fid == this.oilplant
      );
      this.oparealist.push({
        value: 0,
        label: "全部",
      });
      this.oparea = "";
    },
    getoilplant() {
      this.api({
        url: "/organizationInfo/getoilplant",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oilplantlist.push({
            value: temp.oilplantId,
            label: temp.oilplantName,
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
          this.foparealist.push({
            value: temp.opareaId,
            fid: temp.oilplantId,
            fname: temp.oilplantName,
            label: temp.opareaName,
          });
        });
        this.oparealist = this.foparealist;
      });
    },
    getAllRoles() {
      this.api({
        url: "/common/getUserRoles",
        method: "get",
      }).then((data) => {
        this.roles = data;
      });
    },
    getList() {
      //查询列表
      this.listLoading = true;
      this.api({
        url: "/user/list",
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
      this.tempUser.username = null;
      this.tempUser.password = null;
      this.tempUser.phone = null;
      this.tempUser.email = null;
      this.tempUser.roleIds = [];
      this.tempUser.userId = null;
      this.tempUser.oparea = null;
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.oparea = null;
      this.oilplant = null;
    },
    showUpdate($index) {
      let user = this.list[$index];
      this.tempUser.username = user.username;
      this.tempUser.phone = user.phone;
      this.tempUser.email = user.email;
      this.tempUser.roleIds = user.roles.map((x) => x.roleId);
      this.tempUser.userId = user.userId;
      this.tempUser.oparea = user.oparea;
      this.tempUser.password = null;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;

      this.foparealist.forEach((temp) => {
        if (temp.value == user.oparea) {
          this.oparea = temp.label;
          this.oilplantlist.forEach((otemp) => {
            if (otemp.value == temp.fid) {
              this.oilplant = otemp.label;
            }
          });
        }
      });
      if (!this.oparealist.find((temp) => temp.value == 0)) {
        this.oparealist.push({
          value: 0,
          label: "全部",
        });
      }
    },
    validate(isCreate) {
      let u = this.tempUser;
      if (isCreate && u.username.trim().length === 0) {
        this.$message.warning("请填写用户名");
        return false;
      }
      if (isCreate && u.password.length === 0) {
        this.$message.warning("请填写密码");
        return false;
      }
      if (u.phone.trim().length === 0) {
        this.$message.warning("请填写手机号码");
        return false;
      }
      if (u.email.trim().length === 0) {
        this.$message.warning("请填写邮箱");
        return false;
      }
      if (u.roleIds.length === 0) {
        this.$message.warning("请选择角色");
        return false;
      }
      return true;
    },
    createUser() {
      if (!this.validate(true)) return;
      //添加新用户
      this.api({
        url: "/user/addUser",
        method: "post",
        data: this.tempUser,
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
        this.$message.success("新增成功！");
      });
    },
    updateUser() {
      if (!this.validate(false)) return;
      //修改用户信息
      let _vue = this;
      this.api({
        url: "/user/updateUser",
        method: "post",
        data: this.tempUser,
      }).then(() => {
        this.$message.success("更新成功！");
        this.dialogFormVisible = false;
        _vue.getList();
      });
    },
    removeUser($index) {
      let _vue = this;
      this.$confirm("确定删除此用户?", "提示", {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: "warning",
      }).then(() => {
        let user = _vue.list[$index];
        _vue
          .api({
            url: "/user/deleteUser",
            method: "post",
            data: {
              keyId: user.userId,
            },
          })
          .then(() => {
            _vue.getList();
            _vue.$message.success("删除成功!");
          });
      });
    },
  },
};
</script>
