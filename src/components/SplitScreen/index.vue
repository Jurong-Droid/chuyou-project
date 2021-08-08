<template>
<div style="overflow: hidden;">
    <el-row type="flex" :gutter="10" justify="center" v-show="!fullscreen" style="height:20px">
        <el-col :span="8"></el-col>
        <el-col :span="14">
            <div class="grid-content bg-purple">
                <el-button-group>
                    <el-button size="mini" :type="classtype1" @click="splitScreen(1)">单屏</el-button>
                    <el-button size="mini" :type="classtype2" @click="splitScreen(4)">四分屏</el-button>
                    <el-button size="mini" :type="classtype3" @click="splitScreen(9)">九分屏</el-button>
                    <el-button size="mini" :type="classtype4" @click="splitScreen(16)">十六分屏</el-button>
                </el-button-group>
            </div>
        </el-col>
        <el-col :span="4"> </el-col>
    </el-row>

    <el-container class="center">
        <el-main v-loading.body="listLoading" element-loading-text="拼命加载中">
            <el-row :gutter="10">
                <el-col v-for="(n,index) in fornum" :xs="24" :sm="24" :md="clonum" :lg="clonum" :xl="clonum" :class="videoclass" :key="index">
                    <div class="player-wrapper" element-loading-text="加载中..." element-loading-background="#000">
                        <div class="video-wrapper" :style="videoclass">
                            <div class="video-inner live hide-waiting" style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;">
                                <video :id="`videoid${n}`" ref="videoElement" muted controls width="100%" height="100%"></video>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[1, 4, 9, 16]" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </el-main>
    </el-container>
</div>
</template>

<script>
import flvjs from "flv.js";
export default {
    inject: ["searchParam"],
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNum: 1, //页码
                pageRow: 4, //每页条数
                id: null,
                level: ""
            },
            title: '',
            fullscreen: false,
            fornum: 4,
            clonum: 12,
            dialogFormVisible: false,
            videoclass: "padding-bottom: 54.25%; position: relative; margin: 0px auto; overflow: hidden;",
            classtype1: '',
            classtype2: 'primary',
            classtype3: '',
            classtype4: '',
            listObj: [],
            flvPlayerList: []

        }
    },
    computed: {
        param() {
            return this.searchParam();
        }
    },
    watch: {
        listObj: function () {
            this.$nextTick(function () {
                this.initPlayer();
            })
        },
        param: {
            deep: true,
            handler(e) {
                this.listQuery.id = e.id;
                this.listQuery.level = e.level;
                this.getList();
            }
        }

    },
    methods: {
        getList() {
            //视频播放列表
            if (!this.hasPerm("cameraLive:play")) {
                return;
            }
            this.closePlayer();
            this.listLoading = true;
            this.api({
                url: "/cameraLive/listCameraLive",
                method: "get",
                params: this.listQuery,
            }).then((data) => {
                this.listLoading = false;
                this.listObj = data.list;
                this.totalCount = data.totalCount;
            });
        },
        splitScreen(fnum) {
            this.selecttype(fnum);
            this.listQuery.pageRow = fnum;
            this.listQuery.pageNum = 1;
            this.getList();
        },
        selecttype(fnum) {
            this.fornum = fnum;
            if (fnum == 1) {
                this.classtype1 = 'primary'
                this.classtype2 = ''
                this.classtype3 = ''
                this.classtype4 = ''
                this.clonum = 24;
            } else if (fnum == 4) {
                this.classtype1 = ''
                this.classtype2 = 'primary'
                this.classtype3 = ''
                this.classtype4 = ''
                this.clonum = 12;
            } else if (fnum == 9) {
                this.classtype1 = ''
                this.classtype2 = ''
                this.classtype3 = 'primary'
                this.classtype4 = ''
                this.clonum = 8;
            } else if (fnum == 16) {
                this.classtype1 = ''
                this.classtype2 = ''
                this.classtype3 = ''
                this.classtype4 = 'primary'
                this.clonum = 6;
            }

        },
        //加载视频播放
        initPlayer() {
            if (flvjs.isSupported()) {
                const videoElementList = this.$refs.videoElement;
                for (let n = 0; n < this.listObj.length; n++) {
                    const videoElement = videoElementList[n];
                    this.createVideo(videoElement, n);
                    this.flvPlayerList.push(this.flvPlayer);
                }
            }
        },
        createVideo(videoElement, n) {
            this.flvPlayer = flvjs.createPlayer({
                type: 'flv',
                // enableWorker: true, //浏览器端开启flv.js的worker,多进程运行flv.js
                isLive: true, //直播模式
                // hasAudio: true, //开启音频
                // hasVideo: true,
                // stashInitialSize: 128,
                // enableStashBuffer: false, //播放flv时，设置是否启用播放缓存，只在直播起作用。
                url: this.listObj[n].httpUrl
            }, {
                enableWorker: false, //不启用分离线程
                enableStashBuffer: false, //关闭IO隐藏缓冲区
                reuseRedirectedURL: true, //重用301/302重定向url，用于随后的请求，如查找、重新连接等。
                autoCleanupSourceBuffer: true //自动清除缓存
            });
            this.flvPlayer.attachMediaElement(videoElement);
            this.flvPlayer.load();
            if (this.listObj[n] && this.listObj[n].httpUrl !== null && this.listObj[n].httpUrl !== "") {

                this.flvPlayer.play();
            }
            this.flvPlayer.on(flvjs.Events.ERROR, (errType, errDetail) => {
                // alert("网络波动,正在尝试连接中...");
                if (this.flvPlayer) {
                    this.reloadVideo(videoElement, n, this.flvPlayer);
                }
                // errType是 NetworkError时，对应errDetail有：Exception、HttpStatusCodeInvalid、ConnectingTimeout、EarlyEof、UnrecoverableEarlyEof
                // errType是 MediaError时，对应errDetail是MediaMSEError   或MEDIA_SOURCE_ENDED
            });
        },
        reloadVideo(videoElement, n, flvPlayer) {
            this.destoryVideo(flvPlayer);
            this.createVideo(videoElement, n);
        },
        destoryVideo(flvPlayer) {
            try {
                if (flvPlayer) {
                    console.log("close flvPlayer......");
                    flvPlayer.pause();
                    flvPlayer.unload();
                    flvPlayer.detachMediaElement();
                    flvPlayer.destroy();
                    flvPlayer = null;
                }
            } catch (err) {
                console.error(err);
                flvPlayer = null;
            }

        },

        //中断直播播放流
        closePlayer() {
            for (let i in this.flvPlayerList) {
                this.destoryVideo(this.flvPlayerList[i]);
            }
            this.flvPlayerList = [];
        },
        handleSizeChange(val) {
            //改变每页数量
            this.selecttype(val);
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
    }
}
</script>

<style scoped>
.video-wrapper {
    position: relative;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
}

/* 
css 注释： 
只对table td设置左与上边框； 
对table设置右与下边框； 
为了便于截图，我们将css 注释说明换行排版 
*/
.player-wrapper {
    padding-bottom: 10px;
}
</style>
