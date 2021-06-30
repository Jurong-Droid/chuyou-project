<template>
<div class="app-container">
    <div class="filter-container">
        <el-form>
            <el-form-item>
                <el-button type="primary" icon="plus" v-permission="'cameraInfo:add'" @click="showCreate">添加
                </el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
        <el-table-column align="center" label="序号" min-width="5">
            <template slot-scope="scope">
                <span v-text="getIndex(scope.$index)"> </span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="摄像头名称" prop="cameraName" min-width="15"></el-table-column>
        <el-table-column align="center" label="区域名称" prop="areaName" min-width="10"></el-table-column>
        <el-table-column align="center" label="ip" prop="ip" min-width="10"></el-table-column>
        <el-table-column align="center" label="rtsp地址" prop="rtsp" min-width="20"></el-table-column>
        <el-table-column align="center" label="角色" min-width="15">
            <template slot-scope="scope">
                <div style="margin-right: 4px;display: inline-block" v-for="i in scope.row.roles" :key="i.roleId">
                    <el-tag type="primary" v-text="i.roleName"></el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column align="center" label="最近修改时间" prop="updateTime" min-width="10"></el-table-column>
        <el-table-column align="center" label="管理" min-width="20">
            <template slot-scope="scope">
                <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)" v-permission="'cameraInfo:update'">修改</el-button>
                <el-button type="danger" icon="delete" @click="removeUser(scope.$index)" v-permission="'cameraInfo:delete'">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form class="small-space" :model="tempCamera" label-position="left" label-width="120px" style='width: 600px; margin-left:50px;'>
            <el-form-item label="摄像头名称" required>
                <el-input type="text" v-model="tempCamera.cameraName">
                </el-input>
            </el-form-item>
            <el-form-item label="区域名称" required>
                <el-select v-model="tempCamera.areaId" placeholder="请选择区域信息" style="width: 300px">
                    <el-option v-for="item in areas" :key="item.id" :label="item.areaName" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="角色" required>
                <el-select v-model="tempCamera.roleIds" multiple placeholder="支持多角色" style="width: 300px">
                    <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="ip地址">
                <el-input type="text" v-model="tempCamera.ip">
                </el-input>
            </el-form-item>
            <el-form-item label="rtsp地址" required>
                <el-input type="textarea" autosize v-model="tempCamera.rtsp" placeholder="摄像头的rtsp直播流源">
                </el-input>
            </el-form-item>
            <el-form-item label="设备访问密码">
                <el-input type="text" v-model="tempCamera.password">
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus==='create'" type="success" @click="createUser">创 建</el-button>
            <el-button type="primary" v-else @click="updateUser">修 改</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNum: 1, //页码
                pageRow: 50, //每页条数
            },
            roles: [], //角色列表
            areas: [], //区域列表
            dialogStatus: 'create',
            dialogFormVisible: false,
            textMap: {
                update: '编辑',
                create: '新建'
            },
            tempCamera: {
                id: null,
                areaId: null,
                areaName: null,
                cameraName: null,
                ip: null,
                rtsp: null,
                password: null,
                roleIds: []
            }
        }
    },
    created() {
        this.getList();
        if (this.hasPerm('cameraInfo:add') || this.hasPerm('cameraInfo:update')) {
            this.getAllRoles();
            this.getAllAreas();
        }
    },
    methods: {
        getAllRoles() {
            this.api({
                url: "/user/getAllRoles",
                method: "get"
            }).then(data => {
                this.roles = data;
            })
        },
        getAllAreas() {
            this.api({
                url: "/cameraInfo/getAllAreas",
                method: "get"
            }).then(data => {
                this.areas = data;
            })
        },
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/cameraInfo/listCamera",
                method: "get",
                params: this.listQuery
            }).then(data => {
                this.listLoading = false;
                this.list = data.list;
                this.totalCount = data.totalCount;
            })
        },
        handleSizeChange(val) {
            //改变每页数量
            this.listQuery.pageRow = val
            this.handleFilter();
        },
        handleCurrentChange(val) {
            //改变页码
            this.listQuery.pageNum = val
            this.getList();
        },
        handleFilter() {
            //查询事件
            this.listQuery.pageNum = 1
            this.getList()
        },
        getIndex($index) {
            //表格序号
            return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        },
        showCreate() {
            //显示新增对话框
            this.tempCamera.areaId = "";
            this.tempCamera.areaName = "";
            this.tempCamera.cameraName = "";
            this.tempCamera.ip = "";
            this.tempCamera.rtsp = "";
            this.tempCamera.password = "";
            this.tempCamera.roleIds = [];
            this.dialogStatus = "create"
            this.dialogFormVisible = true
        },
        showUpdate($index) {
            let camera = this.list[$index];
            this.tempCamera.id = camera.id;
            this.tempCamera.areaId = camera.areaId;
            this.tempCamera.areaName = camera.areaName;
            this.tempCamera.cameraName = camera.cameraName;
            this.tempCamera.ip = camera.ip;
            this.tempCamera.rtsp = camera.rtsp;
            this.tempCamera.password = camera.password;
            this.tempCamera.roleIds = camera.roles.map(x => x.roleId);
            this.dialogStatus = "update"
            this.dialogFormVisible = true
        },
        validate() {
            let u = this.tempCamera
            if (u.areaId.length === 0) {
                this.$message.warning('请选择区域信息')
                return false
            }
            if (u.cameraName.trim().length === 0) {
                this.$message.warning('请填写摄像头名称')
                return false
            }
            if (u.rtsp.trim().length === 0) {
                this.$message.warning('请填rtsp地址')
                return false
            }

            if (u.roleIds.length === 0) {
                this.$message.warning('请选择角色')
                return false
            }
            return true
        },
        createUser() {
            if (!this.validate()) return
            //添加新用户
            this.api({
                url: "/cameraInfo/addCamera",
                method: "post",
                data: this.tempCamera
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false
                this.$message.success('新增成功！');
            })
        },
        updateUser() {
            if (!this.validate()) return
            //修改用户信息
            let _vue = this;
            this.api({
                url: "/cameraInfo/updateCamera",
                method: "post",
                data: this.tempCamera
            }).then(() => {
                this.$message.success('更新成功！');
                this.dialogFormVisible = false;
                _vue.getList();
            })
        },
        removeUser($index) {
            let _vue = this;
            this.$confirm('确定删除此设备?', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning'
            }).then(() => {
                let camera = _vue.list[$index];
                _vue.api({
                    url: "/cameraInfo/deleteCamera",
                    method: "post",
                    data: {
                        id: camera.id
                    }
                }).then(() => {
                    _vue.getList()
                    _vue.$message.success('删除成功!')
                }).catch(() => {
                    _vue.$message.error("删除失败")
                })
            })
        },
    }
}
</script>
