<template>
<div class="app-container">
    <div class="filter-container">
        <el-input size="mini" v-model="listQuery.name" style="width:8%;" @keyup.enter.native="handleFilter" placeholder="视频名" clearable />
        <el-cascader size="mini" v-model="listQuery.cameraId" :options="options" :props="defaultProps" filterable clearable placeholder="请选择摄像头信息" />
        <DatePicker startVaule="开始日期" endValue="结束日期" @sendTimeData="getTime"></DatePicker>
        <el-button size="mini" v-waves type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button size="mini" type="danger" icon="plus" v-permission="'abnormalInfo:start'" @click="allConfirmation">一键确认</el-button>
    </div>
    <div>
        <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border fit :row-style="rowstyle" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}">
            <el-table-column align="center" label="序号" min-width="5">
                <template slot-scope="scope">
                    <span v-text="getIndex(scope.$index)"> </span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="视频名" prop="name" min-width="15" />
            <el-table-column align="center" label="摄像头名称" prop="camName" min-width="15" />
            <el-table-column align="center" label="检测类型" prop="detectType" min-width="10" />
            <el-table-column align="center" label="异常信息" min-width="30">
                <template slot-scope="scope">
                    <span v-if="scope.row.closeBy !=null" style="color:red">{{ scope.row.expInfo }}</span>
                    <span v-else>{{ scope.row.expInfo }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="创建时间" prop="createTime" min-width="10" />
            <el-table-column align="center" label="管理" min-width="15" v-if="hasPerm('abnormalInfo:start')">
                <template slot-scope="scope">
                    <el-button size="mini" @click="playMv(scope.row.id)">
                        <svg-icon icon-class="play" />
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>
    <div class="video_con" v-show="showVideo">
        <video ref="video" :src="video_url" controls="controls"></video>
        <div class="mask" @click="closeMv"></div>
    </div>
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
                name: null, //视频名
                cameraId: null, //视频名
                updateTimeFrom: null,
                updateTimeTo: null
            },
            options: [], //摄像头信息列表
            defaultProps: {
                children: "children",
                label: "name",
                value: "id",
                level: "level",
                emitPath: false //在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
            },
            //视频名称
            title: "",
            //播放封面图片地址
            cover_pic: "",
            // 显示视频播放
            showVideo: false,
            // mv地址
            video_url: "",
            video_type: "",
        };
    },
    created() {
        this.getList();
        this.getCameraList();
    },
    methods: {
        getList() {
            //查询列表
            if (!this.hasPerm("abnormalInfo:list")) {
                return;
            }
            this.listLoading = true;
            this.api({
                url: "/abnormalInfo/listAbnormalInfo",
                method: "get",
                params: this.listQuery,
            }).then((data) => {
                this.listLoading = false;
                this.list = data.list;
                this.totalCount = data.totalCount;

                //若是带有参数，则打开播放页面
                let abnormalId = this.$route.params.id;
                if (abnormalId) {
                    this.playMv(abnormalId);
                }
            });
        },
        getCameraList() {
            this.api({
                url: "/common/getAllCameras",
                method: "get"
            }).then(data => {
                this.options = data;
            })
        },
        allConfirmation() {
            let _vue = this;
            _vue.$confirm('确定确认所有异常信息?', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning'
            }).then(() => {
                _vue.api({
                    url: "/abnormalInfo/allConfirmation",
                    method: "post",
                }).then((data) => {
                    this.$message.success('成功确认异常信息' + data + '条！');
                    _vue.getList()
                })
            })
        },
        getTime(date) {
            this.listQuery.updateTimeFrom = date.updateTimeFrom;
            this.listQuery.updateTimeTo = date.updateTimeTo;
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
        playMv(id) {
            this.showVideo = true;
            console.log(window.location.origin);
            if (process.env.NODE_ENV !== 'production') {
                this.video_url = process.env.BASE_URL + "/abnormalInfo/startAbnormalInfo?id=" + id;
            } else {
                this.video_url = window.location.origin + "/abnormalInfo/startAbnormalInfo?id=" + id;
            }
        },
        //关闭mv界面
        closeMv() {
            this.showVideo = false;
            this.$refs.video.pause();
            //router没有提供清空数据的方法 刷新可清楚数据 
            if (this.$route.params.id) {
                location.reload();
            } else {
                this.getList();
            }
        },
        rowstyle({
            row
        }) {
            let stylejson = {};
            if (row.closeBy == null) {
                stylejson.background = "#e0838f"; // 背景颜色
                // 也可以修改文字颜色 
                stylejson.color = 'green';
                return stylejson;
            } else {
                return "";
            }
        },
    },
};
</script>

<style scoped>
.video_con video {
    position: fixed;
    width: 50%;
    height: 60%;
    left: 50%;
    top: 40%;
    margin-top: -10%;
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
