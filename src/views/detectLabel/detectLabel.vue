<template>
<div class="app-container">
    <el-row type="flex" style="margin-bottom: -20px">
        <el-col :span="3" v-loading="listLoading" element-loading-text="数据加载中...">
            <div>
                <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText">
                </el-input>

                <el-tree class="filter-tree" :expand-on-click-node="false" :highlight-current="true" :data="data" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="clickNode" ref="tree">
                </el-tree>
            </div>
        </el-col>
        <el-col :span="21" v-loading="imgLoading" element-loading-text="拼命加载中...">
            <el-row type="flex" :gutter="10" justify="center" style="height:40px" v-show="showPic">
                <el-col :span="10"></el-col>
                <el-col :span="12">
                    <div class="grid-content bg-purple">
                        <el-button-group>
                            <el-button :disabled="disabled" size="mini" @click="markerSave()">保存</el-button>
                            <el-button size="mini" @click="markerclear()">清除</el-button>
                        </el-button-group>
                    </div>
                </el-col>
                <el-col :span="4"> </el-col>
            </el-row>
            <el-container class="center">
                <div class="video-wrapper" :style="videoclass" v-show="showVideo">
                    <video ref="videoElement" muted controls width="100%" height="100%"></video>
                </div>
                <ui-marker v-if="showPic" ref="aiPanel-editor" class="ai-observer" :ratio="4/3" :imgUrl="imgUrl" :readOnly="readOnly" @vmarker:onAnnoAdded="onAnnoAdded">
                </ui-marker>
            </el-container>
        </el-col>
    </el-row>
</div>
</template>

<script>
import flvjs from "flv.js";
//参考文档https://vmarker.sagocloud.com/doc/
import {
    AIMarker
} from 'Vue-Picture-BD-Marker'
export default {
    components: {
        'ui-marker': AIMarker
    },
    data() {
        return {
            filterText: '',
            listLoading: false, //数据加载等待动画
            imgLoading: false, //数据加载等待动画
            showPic: false,
            imgUrl: "",
            disabled: false, //按钮是否禁用
            readOnly: false, //矩形框标注是否可编辑
            // 显示视频播放
            showVideo: false,
            videoclass: "padding-bottom: 58.25%; position: relative; margin: 0px auto; overflow: hidden;",
            cameraId: null,
            data: [],
            defaultProps: {
                children: 'children',
                label: 'name',
                level: 'level'
            }
        };
    },
    created() {
        this.getList();
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },

    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        getList() {
            //查询列表
            if (!this.hasPerm("videoLive:list")) {
                return;
            }
            this.listLoading = true;
            this.api({
                url: "/detectLabel/listVideoCamera",
                method: "get",
            }).then((data) => {
                this.listLoading = false;
                this.data = data;
            });
        },
        clickNode(data, node, obj) {
            if (data.level && data.id) {
                this.cameraId = data.id;
                this.showVideo = true;
                this.showPic = true;
                this.imgLoading = true;
                this.api({
                    url: "/detectLabel/startVideoLive",
                    method: "get",
                    params: {
                        id: data.id
                    },
                }).then((data) => {
                    if (flvjs.isSupported()) {
                        const videoElement = this.$refs.videoElement;
                        this.flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            // enableWorker: true, //浏览器端开启flv.js的worker,多进程运行flv.js
                            // isLive: true, //直播模式
                            // hasAudio: true, //开启音频
                            // hasVideo: true,
                            // stashInitialSize: 128,
                            // enableStashBuffer: false, //播放flv时，设置是否启用播放缓存，只在直播起作用。
                            url: data.httpUrl
                        });
                        this.flvPlayer.attachMediaElement(videoElement);
                        try {
                            this.flvPlayer.load();
                            this.flvPlayer.play();
                        } catch (error) {
                            console.log(error);
                        }
                        videoElement.currentTime = 5 //必须设置视频当前时长，要不然会黑屏
                        const output = document.getElementById("output");
                        // 创建画布准备截图
                        const canvas = document.createElement('canvas')

                        videoElement.setAttribute('crossOrigin', 'anonymous')
                        // 设置画布的宽高
                        canvas.width = videoElement.clientWidth
                        canvas.height = videoElement.clientHeight
                        // 图片绘制
                        videoElement.onloadeddata = (() => {
                            canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height)
                            const dataURL = canvas.toDataURL('image/jpeg');
                            this.imgUrl = dataURL;

                            this.showVideo = false;
                            this.imgLoading = false;
                            // console.log(img)
                            this.destoryVideo(this.flvPlayer);
                        })

                    }
                });
            }
        },
        markerclear() {
            if (!this.readOnly) {
                this.$refs['aiPanel-editor'].getMarker().clearData();
            } else {
                this.$alert('标注框已保存不能清除！', '提示', {
                    confirmButtonText: '确定'
                });
            }

        },
        markerSave() {
            if (!this.disabled) {
                this.readOnly = true;
                let list = this.$refs['aiPanel-editor'].getMarker().getData();
                console.log(list[0]);
                this.api({
                    url: "/detectLabel/saveRectangle",
                    method: "post",
                    data: {
                        cameraId: this.cameraId,
                        x: list[0].position.x,
                        y: list[0].position.y,
                        x1: list[0].position.x1,
                        y1: list[0].position.y1
                    }
                }).then(() => {
                    this.disabled = true;
                    this.$alert('保存成功', '提示', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.$message({
                                type: 'success',
                                message: `保存成功！`
                            });
                        }
                    });
                })
            }

        },
        //当画完一个标注框时回调
        onAnnoAdded() {

            this.$refs['aiPanel-editor'].getMarker().setTag({
                tagName: "入侵检测区域",
                tag: "0x0001"
            });
        },
        destoryVideo(flvPlayer) {
            if (flvPlayer) {
                console.log("close flvPlayer......");
                flvPlayer.pause();
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
                flvPlayer = null;
            }
        }
    }
};
</script>
