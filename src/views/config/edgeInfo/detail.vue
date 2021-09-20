<template>
<div class="app-container">
    <el-page-header @back="callback" content="边缘端详情">
    </el-page-header>
    <div style="margin:20px 0 5px 20px">
        <el-descriptions class="margin-top" :column="2" border>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-tickets"></i>
                    边缘端服务器名称
                </template>
                {{tempEdge.edgeName}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-location-outline"></i>
                    边缘端服务器地址
                </template>
                {{tempEdge.edgeIp}}
            </el-descriptions-item>
            <el-descriptions-item :span="2">
                <template slot="label">
                    <i class="el-icon-info"></i>
                    边缘端信息
                </template>
                {{tempEdge.edgeInfo}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-position"></i>
                    边缘端ssh的用户名
                </template>
                {{tempEdge.sshUsername}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-position"></i>
                    ssh访问端口
                </template>
                {{tempEdge.sshHost}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    创建时间
                </template>
                {{tempEdge.createTime}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    修改时间
                </template>
                {{tempEdge.updateTime}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-user-solid"></i>
                    角色
                </template>
                <div style="margin-right: 2%;display: inline-block" v-for="i in tempEdge.roles" :key="i.roleId">
                    <el-tag type="primary" v-text="i.roleName"></el-tag>
                </div>
            </el-descriptions-item>
        </el-descriptions>
    </div>
    <el-divider></el-divider>
    <div>
        <el-row type="flex">
            <el-col :span="24">
                <div class="grid-content bg-purple-light">
                    <p>边缘端绑定的摄像头信息列表</p>
                </div>
            </el-col>
        </el-row>
        <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border style="width: 100%">
            <el-table-column align="center" label="序号" type="index" min-width="5">
            </el-table-column>
            <el-table-column align="center" label="摄像头名称" min-width="15">
                <template slot-scope="scope">
                    <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.cameraName }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="ip" prop="ip" min-width="10"></el-table-column>
            <el-table-column align="center" label="视频流地址" prop="rtsp" min-width="20"></el-table-column>
            <el-table-column align="center" label="管理" min-width="15">
                <template slot-scope="scope">
                    <el-button size="mini" :plain='true' type="danger" icon="delete" @click="deleteBind(scope.row)" v-permission="'edgeInfo:delete'">解除绑定</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            tempEdge: {
                id: null,
                edgeName: null,
                edgeIp: null,
                edgeInfo: null,
                sshHost: null,
                sshUsername: null,
                sshPassword: null,
                createTime: null,
                updateTime: null,
                cameraInfoList: [],
                roles: []
            },
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
        }

    },
    created() {
        let data = this.$route.params.data;
        if (data) {
            this.tempEdge = data;
            this.getList();
        }
    },
    methods: {
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/edgeInfo/listEdgeCamera",
                method: "get",
                params: {
                    edgeId: this.tempEdge.id
                }
            }).then(data => {
                this.listLoading = false;
                this.list = data;
            })
        },
        deleteBind(row) {
            let _vue = this;
            this.api({
                url: "/edgeInfo/deleteBind",
                method: "post",
                data: {
                    edgeId: this.tempEdge.id,
                    cameraId: row.id
                }
            }).then(() => {
                _vue.$message.success('解除绑定成功！');
                _vue.getList()
            })
        },
        callback() {
            this.$router.push({
                name: 'edgeInfo',
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
.el-col {
    border-radius: 4px;
}

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
