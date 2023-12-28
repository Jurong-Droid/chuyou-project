<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button
            :plain="true"
            type="primary"
            icon="plus"
            v-permission="'role:add'"
            @click="showCreate"
            >添加角色
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="list"
      v-loading="listLoading"
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
        label="角色"
        prop="roleName"
        min-width="8"
      ></el-table-column>
      <el-table-column align="center" label="用户" min-width="10">
        <template slot-scope="scope">
          <div v-for="user in scope.row.users" :key="user.userId">
            <div
              v-text="user.username"
              style="
                display: inline-block;
                vertical-align: middle;
                margin-top: 4%;
              "
            ></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="菜单&权限" min-width="46">
        <template slot-scope="scope">
          <el-tag
            style="width: 100px; margin-left: -34%; text-align: center"
            v-if="scope.row.roleName === adminName"
            type="success"
            effect="plain"
            >全部</el-tag
          >
          <div v-else>
            <div
              v-for="menu in scope.row.menus"
              :key="menu.menuCode"
              style="text-align: left; margin-top: 1%"
            >
              <span
                style="width: 25%; display: inline-block; text-align: right"
                >{{ menu.menuName }}</span
              >
              <el-tag
                v-for="perm in menu.permissions"
                :key="perm.permissionName"
                style="text-align: center; margin-right: 2%; width: 97px"
                type="primary"
                effect="plain"
                size="small"
                >{{ perm.permissionName }}</el-tag
              >
            </div>
          </div>
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
      <el-table-column align="center" label="管理" min-width="14">
        <template slot-scope="scope">
          <div v-if="scope.row.roleName !== '管理员'">
            <el-button
              size="mini"
              :plain="true"
              type="primary"
              icon="edit"
              @click="showUpdate(scope.$index)"
              v-permission="'role:update'"
              >修改
            </el-button>
            <el-button
              size="mini"
              :plain="true"
              type="danger"
              icon="delete"
              @click="removeRole(scope.$index)"
              v-permission="'role:delete'"
              >删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        class="small-space"
        :model="tempRole"
        label-position="left"
        label-width="auto"
      >
        <el-form-item label="角色名称" required>
          <el-input type="text" v-model="tempRole.roleName" style="width: 40%">
          </el-input>
        </el-form-item>
        <el-form-item label="菜单&权限" required>
          <div v-for="(menu, _index) in allPermission" :key="menu.menuName">
            <span style="display: inline-block; margin-right: 10px">
              <el-button
                :type="
                  isMenuNone(_index)
                    ? ''
                    : isMenuAll(_index)
                    ? 'success'
                    : 'primary'
                "
                @click="checkAll(_index)"
                >{{ menu.menuName }}</el-button
              >
            </span>
            <div style="display: inline-block">
              <el-checkbox-group v-model="tempRole.permissionIds">
                <el-checkbox
                  v-for="perm in menu.permissions"
                  :label="perm.permissionId"
                  @change="checkRequired(perm, _index)"
                  :key="perm.permissionId"
                >
                  <span :class="{ requiredPerm: perm.requiredPerm === 1 }">{{
                    perm.permissionName
                  }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <p style="color: #848484">说明:红色权限为对应菜单内的必选权限</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="dialogStatus === 'create'"
          type="primary"
          @click="createRole"
          >创 建</el-button
        >
        <el-button type="primary" v-else @click="updateRole">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [], //表格的数据
      allPermission: [],
      listLoading: false, //数据加载等待动画
      dialogStatus: "create",
      dialogFormVisible: false,
      textMap: {
        update: "编辑",
        create: "新建角色",
      },
      tempRole: {
        roleName: "",
        roleId: "",
        permissionIds: [],
      },
      adminName: "管理员",
    };
  },
  created() {
    document.body.style.zoom = "80%";
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    this.getList();
    this.getAllPermisson();
  },
  methods: {
    getAllPermisson() {
      //查询所有权限
      this.api({
        url: "/role/listAllPermission",
        method: "get",
      }).then((data) => {
        this.allPermission = data;
      });
    },
    getList() {
      //查询列表
      this.listLoading = true;
      this.api({
        url: "/role/listRole",
        method: "get",
      }).then((data) => {
        this.listLoading = false;
        this.list = data;
      });
    },
    getIndex($index) {
      //表格序号
      return $index + 1;
    },
    showCreate() {
      //显示新增对话框
      this.tempRole.roleName = "";
      this.tempRole.roleId = "";
      this.tempRole.permissionIds = [];
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    showUpdate($index) {
      let role = this.list[$index];
      this.tempRole.roleName = role.roleName;
      this.tempRole.roleId = role.roleId;
      this.tempRole.permissionIds = [];
      for (let i = 0; i < role.menus.length; i++) {
        let perm = role.menus[i].permissions;
        for (let j = 0; j < perm.length; j++) {
          this.tempRole.permissionIds.push(perm[j].permissionId);
        }
      }
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    createRole() {
      if (!this.checkRoleNameUnique()) {
        return;
      }
      if (!this.checkPermissionNum()) {
        return;
      }
      //添加新角色
      this.api({
        url: "/role/addRole",
        method: "post",
        data: this.tempRole,
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
        this.$message.success("新增成功！");
      });
    },
    updateRole() {
      if (!this.checkRoleNameUnique(this.tempRole.roleId)) {
        return;
      }
      if (!this.checkPermissionNum()) {
        return;
      }
      //修改角色
      this.api({
        url: "/role/updateRole",
        method: "post",
        data: this.tempRole,
      }).then(() => {
        this.getList();
        this.dialogFormVisible = false;
        this.$message.success("更新成功！");
      });
    },
    checkPermissionNum() {
      //校验至少有一种权限
      if (this.tempRole.permissionIds.length === 0) {
        this.$message.error("请至少选择一种权限");
        return false;
      }
      return true;
    },
    checkRoleNameUnique(roleId) {
      //校验名称重复
      let roleName = this.tempRole.roleName;
      if (!roleName) {
        this.$message.error("请填写角色名称");
        return false;
      }
      let roles = this.list;
      let result = true;
      for (let j = 0; j < roles.length; j++) {
        if (
          roles[j].roleName === roleName &&
          (!roleId || roles[j].roleId !== roleId)
        ) {
          this.$message.error("角色名称已存在");
          result = false;
          break;
        }
      }
      return result;
    },
    removeRole($index) {
      let _vue = this;
      this.$confirm("确定删除此角色?", "提示", {
        confirmButtonText: "确定",
        showCancelButton: false,
        type: "warning",
      }).then(() => {
        let role = _vue.list[$index];
        _vue
          .api({
            url: "/role/deleteRole",
            method: "post",
            data: {
              roleId: role.roleId,
            },
          })
          .then(() => {
            _vue.getList();
            _vue.$message.success("删除成功!");
          })
          .catch((e) => {});
      });
    },
    isMenuNone(_index) {
      //判断本级菜单内的权限是否一个都没选
      let menu = this.allPermission[_index].permissions;
      let result = true;
      for (let j = 0; j < menu.length; j++) {
        if (this.tempRole.permissionIds.indexOf(menu[j].permissionId) > -1) {
          result = false;
          break;
        }
      }
      return result;
    },
    isMenuAll(_index) {
      //判断本级菜单内的权限是否全选了
      let menu = this.allPermission[_index].permissions;
      let result = true;
      for (let j = 0; j < menu.length; j++) {
        if (this.tempRole.permissionIds.indexOf(menu[j].permissionId) < 0) {
          result = false;
          break;
        }
      }
      return result;
    },
    checkAll(_index) {
      //点击菜单   相当于全选按钮
      let v = this;
      if (v.isMenuAll(_index)) {
        //如果已经全选了,则全部取消
        v.noPerm(_index);
      } else {
        //如果尚未全选,则全选
        v.allPerm(_index);
      }
    },
    allPerm(_index) {
      //全部选中
      let menu = this.allPermission[_index].permissions;
      for (let j = 0; j < menu.length; j++) {
        this.addUnique(menu[j].permissionId, this.tempRole.permissionIds);
      }
    },
    noPerm(_index) {
      //全部取消选中
      let menu = this.allPermission[_index].permissions;
      for (let j = 0; j < menu.length; j++) {
        let idIndex = this.tempRole.permissionIds.indexOf(menu[j].permissionId);
        if (idIndex > -1) {
          this.tempRole.permissionIds.splice(idIndex, 1);
        }
      }
    },
    addUnique(val, arr) {
      //数组内防重复地添加元素
      let _index = arr.indexOf(val);
      if (_index < 0) {
        arr.push(val);
      }
    },
    checkRequired(_perm, _index) {
      //本方法会在勾选状态改变之后触发
      let permId = _perm.permissionId;
      if (this.tempRole.permissionIds.indexOf(permId) > -1) {
        //选中事件
        //如果之前未勾选本权限,现在勾选完之后,tempRole里就会包含本id
        //那么就要将必选的权限勾上
        this.makeReuqiredPermissionChecked(_index);
      } else {
        //取消选中事件
        if (_perm.requiredPerm === 1) {
          //如果是必勾权限,就把本菜单的权限全部移出
          //(其实也可以提示用户本权限是菜单里的必选,请先取消勾选另外几个权限,交互太麻烦,此处就直接全部取消选中了)
          this.noPerm(_index);
        }
      }
    },
    makeReuqiredPermissionChecked(_index) {
      //将本菜单必选的权限勾上
      let menu = this.allPermission[_index].permissions;
      for (let j = 0; j < menu.length; j++) {
        let perm = menu[j];
        if (perm.requiredPerm === 1) {
          //找到本菜单的必选权限,将其勾上
          this.addUnique(perm.permissionId, this.tempRole.permissionIds);
        }
      }
    },
  },
};
</script>

<style scoped>
.requiredPerm {
  color: #ff0e13;
}
</style>
