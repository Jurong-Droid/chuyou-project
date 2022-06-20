<template>
<div class="app-container">
    <div class="filter-container">
        <el-input size="mini" v-model="listQuery.edgeName" style="width:8%;" @keyup.enter.native="handleFilter" placeholder="边缘端名称" clearable />
        <DatePicker startVaule="开始日期" endValue="结束日期" @sendTimeData="getTime"></DatePicker>
        <el-button size="mini" v-waves type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
        </el-button>
        <el-button size="mini" type="primary" icon="plus" v-permission="'edgeInfo:add'" @click="showCreate">添加</el-button>
    </div>
    <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row style="width: 100%;" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}">
        <el-table-column align="center" label="序号" min-width="5">
            <template slot-scope="scope">
                <span v-text="getIndex(scope.$index)"> </span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="边缘端名称" min-width="15">
            <template slot-scope="scope">
                <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.edgeName }}</span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="边缘端地址" prop="edgeIp" min-width="15"></el-table-column>
        <el-table-column align="center" label="边缘端信息" prop="edgeInfo" min-width="30"></el-table-column>
        <el-table-column align="center" label="角色" min-width="14">
            <template slot-scope="scope">
                <div style="margin-right: 2%;display: inline-block" v-for="i in scope.row.roles" :key="i.roleId">
                    <el-tag type="primary" v-text="i.roleName"></el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" min-width="10"></el-table-column>
        <el-table-column align="center" label="已绑定摄像头" min-width="8">
            <template slot-scope="scope">
                <span>{{scope.row.cameraInfoList.length}}</span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="管理" min-width="20">
            <template slot-scope="scope">
                <el-button size="mini" :plain='true' type="primary" icon="add" @click="showBindCamera(scope.$index)" v-permission="'edgeInfo:add'">绑定摄像头</el-button>
                <el-button size="mini" :plain='true' type="primary" icon="edit" @click="showUpdate(scope.$index)" v-permission="'edgeInfo:update'">修改</el-button>
                <el-button size="mini" :plain='true' type="danger" icon="delete" @click="deleteEdgeInfo(scope.$index)" v-permission="'edgeInfo:delete'">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form class="small-space" :model="tempEdge" label-position="left" label-width="15%">
            <el-form-item label="边缘端名称" required>
                <el-input type="text" v-model="tempEdge.edgeName" style="width: 40%" />
            </el-form-item>
            <el-form-item label="角色" required>
                <el-select v-model="tempEdge.roleIds" multiple placeholder="支持多角色" style="width: 40%">
                    <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="边缘端地址" required>
                <el-input type="text" v-model="tempEdge.edgeIp" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="边缘端信息">
                <el-input type="textarea" autosize v-model="tempEdge.edgeInfo" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="RabbitMQ的队列" required>
                <el-input type="textarea" v-model="tempEdge.mqQueue" placeholder="此边缘节点绑定的RabbitMQ的队列" style="width: 40%">
                </el-input>
            </el-form-item>            
            <!-- <el-form-item label="边缘端ssh的用户名">
                <el-input type="text" autosize v-model="tempEdge.sshUsername" auto-complete="off" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="边缘端ssh的密码">
                <el-input type="password" v-model="tempEdge.sshPassword" auto-complete="new-password" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="ssh访问端口">
                <el-input type="text" v-model="tempEdge.sshHost" style="width: 40%">
                </el-input>
            </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus==='create'" type="success" @click="addEdgeInfo">创 建</el-button>
            <el-button type="primary" v-else @click="updateEdgeInfo">修 改</el-button>
        </div>
    </el-dialog>
    <el-dialog title="绑定摄像头" :visible.sync="dialogCameraVisible">
        <el-form class="small-space" :model="tempCamera" label-position="left" label-width="15%">
            <el-form-item label="摄像头名称" required>
                <el-cascader v-model="tempCamera.cameraIds" :options="options" :props="defaultProps" filterable clearable placeholder="请选择摄像头信息" style="width: 40%" />
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogCameraVisible = false">取 消</el-button>
            <el-button type="success" @click="addCamera">绑 定</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
import DatePicker from "@/components/DatePicker"
import waves from '@/directives/waves/index.js' // 水波纹指令
export default {
    components: {
        DatePicker,
    },
    directives: {
        waves
    },
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNum: 1, //页码
                pageRow: 50, //每页条数
                areaId: null,
                edgeName: null,
                updateTimeFrom: null,
                updateTimeTo: null
            },
            createTime: [],
            options: [], //摄像头信息列表
            defaultProps: {
                children: "children",
                label: "name",
                value: "id",
                level: "level",
                multiple: true,
                emitPath: false //在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
            },
            roles: [], //角色列表
            dialogStatus: 'create',
            dialogFormVisible: false,
            dialogCameraVisible: false,
            textMap: {
                update: '编辑',
                create: '新建'
            },
            tempEdge: {
                id: null,
                edgeName: null,
                edgeIp: null,
                edgeInfo: null,
                sshHost: null,
                sshUsername: null,
                sshPassword: null,
                mqQueue:null,
                roleIds: []
            },
            tempCamera: {
                edgeId: null,
                cameraIds: []
            },
        }
    },
    created() {
        this.getList();
        if (this.hasPerm('edgeInfo:add') || this.hasPerm('edgeInfo:update')) {
            this.getAllRoles();
        }
    },
    methods: {
        getAllRoles() {
            this.api({
                url: "/common/getUserRoles",
                method: "get"
            }).then(data => {
                this.roles = data;
            })
        },
        getCameraList() {
            this.api({
                url: "/common/getAllCameras",
                method: "get"
            }).then(data => {
                this.options = data;
            })
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
                params: this.listQuery
            }).then(data => {
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
            this.tempEdge.id = "";
            this.tempEdge.edgeName = "";
            this.tempEdge.edgeIp = "";
            this.tempEdge.edgeInfo = "";
            this.tempEdge.sshHost = "22";
            this.tempEdge.sshUsername = "";
            this.tempEdge.sshPassword = "";
            this.tempEdge.mqQueue = "";
            this.tempEdge.roleIds = [];
            this.dialogStatus = "create"
            this.dialogFormVisible = true
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
            this.tempEdge.roleIds = edgeInfo.roles.map(x => x.roleId);
            this.dialogStatus = "update"
            this.dialogFormVisible = true
        },
        showBindCamera($index) {
            if (this.options.length == 0) {
                this.getCameraList();
            }
            let edgeInfo = this.list[$index];
            this.tempCamera.edgeId = edgeInfo.id;
            this.tempCamera.cameraIds = [];
            this.dialogCameraVisible = true;

        },
        validate() {
            let u = this.tempEdge
            if (u.edgeName.trim().length === 0) {
                this.$message.warning('请填写边缘端名称')
                return false
            }
            if (u.roleIds.length === 0) {
                this.$message.warning('请选择角色')
                return false
            }
            const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            if (u.edgeIp.trim().length === 0 || !reg.test(u.edgeIp)) {
                this.$message.warning('请输入正确的IP地址');
                return false
            }
            return true
        },
        addEdgeInfo() {
            if (!this.validate()) return
            //添加新用户
            this.api({
                url: "/edgeInfo/addEdgeInfo",
                method: "post",
                data: this.tempEdge
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false
                this.$message.success('新增成功！');
            })
        },
        updateEdgeInfo() {
            if (!this.validate()) return
            //修改用户信息
            let _vue = this;
            this.api({
                url: "/edgeInfo/updateEdgeInfo",
                method: "post",
                data: this.tempEdge
            }).then(() => {
                this.$message.success('更新成功！');
                this.dialogFormVisible = false;
                //router没有提供清空数据的方法 刷新可清楚数据 
                location.reload();
            })
        },
        deleteEdgeInfo($index) {
            let _vue = this;
            //需要使用$createElement来创建 定义含义class的可以 h('i', { class: 'el-icon-question' })
            const h = _vue.$createElement
            _vue.$confirm(
                '提示', {
                    title: '提示',
                    message: h('div', [
                        h('p', '确定删除此边缘端信息？'),
                        h('p', '边缘端与摄像头的关联关系会被删除！'),
                        h('p', '边缘端上的检测算法模型信息会被删除！')
                    ]),
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(() => {
                let camera = _vue.list[$index];
                _vue.api({
                    url: "/edgeInfo/deleteCamera",
                    method: "post",
                    data: {
                        keyId: camera.id
                    }
                }).then(() => {
                    _vue.getList()
                    _vue.$message.success('删除成功!')
                }).catch(() => {
                    _vue.$message.error("删除失败")
                })
            })

        },
        addCamera() {
            let _vue = this;
            this.api({
                url: "/edgeInfo/bindCamera",
                method: "post",
                data: this.tempCamera
            }).then(() => {
                _vue.$message.success('绑定成功！');
                _vue.dialogCameraVisible = false;
                _vue.getList()
            })
        },
        handleDetail(row) {
            this.$router.push({
                name: 'edgeDetail',
                params: {
                    'data': row
                }
            });
        }
    }
}
</script>

<style scoped>
.el-range-input {
    padding-bottom: 10px;
}
</style>
