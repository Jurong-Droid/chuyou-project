<template>
<div class="app-container">
    <div>
        <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
            <el-table-column align="center" label="序号" width="80">
                <template slot-scope="scope">
                    <span v-text="getIndex(scope.$index)"> </span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="视频名" prop="name" width="300" />
            <el-table-column align="center" label="摄像头名称" prop="camName" width="200" />
            <el-table-column align="center" label="检测类型" prop="detectType" width="150" />
            <el-table-column align="center" label="异常信息" width="600">
                <template slot-scope="scope">
                    <span style="color:red">{{ scope.row.expInfo }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
            <el-table-column align="center" label="管理" width="265" v-if="hasPerm('abnormalInfo:start')">
                <template slot-scope="scope">
                    <el-button @click="playMv(scope.row)">
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
            this.showVideo = true;
            this.video_url = process.env.BASE_URL + "/abnormalInfo/startAbnormalInfo?id=" + record.id;
        },
        //关闭mv界面
        closeMv() {
            this.showVideo = false;
            this.$refs.video.pause();
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
