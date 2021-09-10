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
        <el-col :span="21" v-loading="imgLoading" element-loading-text="正在截取直播画面...">
            <el-row type="flex" :gutter="10" justify="center" style="height: 5%" v-show="showPic" v-if="hasPerm('detectLabel:operate')">
                <el-col :span="5"></el-col>
                <el-col :span="8">
                    <div class="grid-content bg-purple">
                        <el-button-group>
                            <el-button size="mini" :plain='true' :disabled="disabled" @click="markerSave()">保存</el-button>
                            <el-button size="mini" :plain='true' :disabled="!disabled" @click="markerEdit()">修改</el-button>
                            <el-button size="mini" :plain='true' @click="markerclear()">全部清除</el-button>
                        </el-button-group>
                    </div>
                </el-col>
                <el-col :span="8"> 
                    <div class="detectFunc" v-show="showSelect">
                        请选择检查方法：
                        <el-select size="mini" v-model="value" placeholder="请选择" @change="selectChange(value)">
                            <el-option v-for="item in options" :key="item.id" :label="item.detectFuncName" :value="item">
                            </el-option>
                        </el-select>
                    </div>

                </el-col>
            </el-row>
            <el-container class="center">
                <div class="video-wrapper" :style="videoclass" v-show="showVideo">
                    <video ref="videoElement" muted controls width="100%" height="100%"></video>
                </div>
                <ui-marker v-if="showPic" ref="aiPanel-editor" class="ai-observer" :ratio="4/3" :imgUrl="imgUrl" :readOnly="readOnly" @vmarker:onAnnoAdded="onAnnoAdded" @vmarker:onAnnoRemoved="onAnnoRemoved" @vmarker:onAnnoSelected="onAnnoSelected">
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
} from "Vue-Picture-BD-Marker";
export default {
    components: {
        "ui-marker": AIMarker,
    },
    data() {
        return {
            filterText: "",
            listLoading: false, //数据加载等待动画
            imgLoading: false, //数据加载等待动画
            showPic: false,
            imgUrl: "",
            disabled: false, //按钮是否禁用
            readOnly: false, //矩形框标注是否可编辑
            maxNum: 5, //可标记的矩形框最大个数
            tagNum: 0, //可标记的矩形框当前数量
            newDataNum: 0, //新数据的数量 若存在新数据则可以保存
            makerManage: null, //maker操作对象
            // 显示视频播放
            showVideo: false,
            videoclass: "padding-bottom: 58.25%; position: relative; margin: 0px auto; overflow: hidden;",
            cameraId: null,
            data: [],
            defaultProps: {
                children: "children",
                label: "name",
                level: "level",
            },
            options: [],
            detectTypeIdList: [],
            value: '',
            showSelect: false
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
            if (!this.hasPerm("detectLabel:list")) {
                return;
            }
            this.listLoading = true;
            this.api({
                url: "/common/getAllCameras",
                method: "get",
            }).then((data) => {
                this.listLoading = false;
                this.data = data;
            });
        },
        clickNode(data, node, obj) {
            this.getDetectFuncList();
            if (data.level === '2' && data.id) {
                this.cameraId = data.id;
                this.showVideo = true;
                this.showPic = true;
                this.imgLoading = true;
                this.api({
                    url: "/detectLabel/cameraLiveStart",
                    method: "get",
                    params: {
                        id: data.id,
                    },
                }).then((data) => {
                    if (flvjs.isSupported()) {
                        const videoElement = this.$refs.videoElement;
                        this.flvPlayer = flvjs.createPlayer({
                            type: "flv",
                            // enableWorker: true, //浏览器端开启flv.js的worker,多进程运行flv.js
                            // isLive: true, //直播模式
                            // hasAudio: true, //开启音频
                            // hasVideo: true,
                            // stashInitialSize: 128,
                            // enableStashBuffer: false, //播放flv时，设置是否启用播放缓存，只在直播起作用。
                            url: data.httpUrl,
                        });
                        this.flvPlayer.attachMediaElement(videoElement);
                        try {
                            this.flvPlayer.load();
                            this.flvPlayer.play();
                        } catch (error) {
                            console.error(error);
                        }
                        videoElement.currentTime = 5; //必须设置视频当前时长，要不然会黑屏
                        const output = document.getElementById("output");
                        // 创建画布准备截图
                        const canvas = document.createElement("canvas");

                        videoElement.setAttribute("crossOrigin", "anonymous");
                        // 设置画布的宽高
                        canvas.width = videoElement.clientWidth;
                        canvas.height = videoElement.clientHeight;
                        // 图片绘制
                        videoElement.onloadeddata = () => {
                            canvas.getContext("2d").drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                            const dataURL = canvas.toDataURL("image/jpeg");
                            this.imgUrl = dataURL;

                            this.showVideo = false;
                            this.imgLoading = false;

                            this.destoryVideo(this.flvPlayer);
                            //查询该摄像头是否原来有标注矩形框
                            this.listRectangle();
                        };
                    }
                });
            }
        },
        destoryVideo(flvPlayer) {
            if (flvPlayer) {
                try {
                    console.log("close flvPlayer......");
                    flvPlayer.pause();
                    flvPlayer.unload();
                    flvPlayer.detachMediaElement();
                    flvPlayer.destroy();
                    flvPlayer = null;
                } catch (error) {
                    console.error(error);
                    flvPlayer = null;
                }
            }
        },
        listRectangle() {
            this.tagNum = 0;
            this.makerManage = this.$refs["aiPanel-editor"].getMarker();
            this.makerManage.clearData();
            this.api({
                url: "/detectLabel/listRectangle",
                method: "get",
                params: {
                    cameraId: this.cameraId,
                },
            }).then((data) => {
                if (data.length > 0) {
                    //加载原有标记框数据
                    this.makerManage.renderData(data);
                    //给标记框赋上对应的颜色
                    this.setTagColor('annotation', data);
                    this.disabled = true;
                    this.readOnly = true;
                } else {
                    this.disabled = false;
                    this.readOnly = false;
                }
            });
        },
        getDetectFuncList() {
            this.api({
                url: "/detectFunc/listDetectFuncAll",
                method: "get"

            }).then((data) => {
                this.options = data;
                for (let i = 0; i < data.length; i++) {
                    this.detectTypeIdList.push(data[i].id);
                }
            });
        },
        selectChange(item) {
            this.makerManage.setTag({
                tagName: item.detectFuncName,
                tag: item.id
            });
            this.$message.warning('确定类型成功，请保存！');
            this.value = "";
            this.showSelect = false;
            //给标记框赋上对应的颜色
            this.setTagColor('selected', [item]);
        },
        markerSave() {
            if (!this.disabled) {
                let list = this.makerManage.getData();
                if (list.length == 0) {
                    this.$alert("无数据可保存！", "提示", {
                        confirmButtonText: "确定",
                    });
                    return;
                }
                for (let i = 0; i < list.length; i++) {
                    if (this.detectTypeIdList.indexOf(parseInt(list[i].tag)) < 0) {
                        this.$alert("请确认所有标注框已选择检测方法！", "提示", {
                            confirmButtonText: "确定",
                            type: "warning"
                        });
                        return;
                    }
                    list[i].cameraId = this.cameraId;
                }
                this.api({
                    url: "/detectLabel/saveRectangle",
                    method: "post",
                    data: list,
                }).then(() => {
                    this.newDataNum = 0;
                    //删除原有的，重新从后端查询数据再渲染矩形框
                    this.makerManage.clearData();
                    this.listRectangle();
                    this.$message.success('保存成功！');
                });
            }
        },
        markerEdit() {
            this.readOnly = false;
            this.disabled = false;
        },
        markerclear() {
            this.$confirm("此操作将删除所有标注, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.api({
                    url: "/detectLabel/removeRectangleAll",
                    method: "post",
                    data: {
                        cameraId: this.cameraId,
                    },
                }).then((data) => {
                    this.makerManage.clearData();
                    this.tagNum = 0;
                    this.newDataNum = 0;
                    this.readOnly = false;
                    this.disabled = false;
                    this.$message.success('删除成功！');

                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        //监听事件 当画完一个标注框时回调
        //Bug setTag方法在监听方法onAnnoAdded中会导致 再怎么调整大小或者位置 .getData() 就都只能是画框原始数据 onAnnoUpdated方法不触发
        onAnnoAdded(annoData) {
            this.tagNum++;
            if (this.tagNum > this.maxNum) {
                this.$alert(
                    "已超过最大限制，当前可支持最大标注数量为" + this.maxNum + "个！", "提示", {
                        confirmButtonText: "确定",
                        type: "warning",
                    }
                );
                //目前未找到删除单个方法，故将标注框先删除，再加载删除最后新画的List数据
                let list = this.makerManage.getData();
                list.pop();
                this.makerManage.clearData();
                this.tagNum = 0;
                this.makerManage.renderData(list);
                //给标记框赋上对应的颜色
                this.setTagColor('annotation', list);
                if (this.newDataNum == 0) {
                    this.readOnly = true;
                    this.disabled = true;
                }

                return;
            }
            if (!annoData.id) {
                this.newDataNum++;
            }
        },
        //删除单个标注时触发的事件
        onAnnoRemoved(annoData) {
            this.$confirm("此操作将删该标注, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                if (annoData.id) {
                    this.api({
                        url: "/detectLabel/removeRectangleById",
                        method: "post",
                        data: {
                            cameraId: this.cameraId,
                            id: annoData.id,
                        },
                    }).then((data) => {
                        this.tagNum--;
                        if (this.newDataNum == 0 && this.tagNum > 0) {
                            this.readOnly = true;
                            this.disabled = true;
                        }
                        this.$message.success('删除成功！');
                    });
                } else {
                    this.tagNum--;
                    this.newDataNum--;
                }

            }).catch(() => {
                this.$message.info('已取消删除');
                //若取消删除则添加回去
                let list = this.makerManage.getData();
                list.push(annoData);
                this.makerManage.clearData();
                this.tagNum = 0;
                this.makerManage.renderData(list);
                //给标记框赋上对应的颜色
                this.setTagColor('annotation', list);
            });
        },
        //单机标注框时触发的事件
        onAnnoSelected(annoData) {
            this.showSelect = true;

        },
        //给标注框添加检测方法对应的颜色  cls 选择的Class名称  list 标注信息数据
        setTagColor(cls, list) {
            let divList = this.makerManage.marker.layer.querySelectorAll(`.` + cls);
            for (let i = 0; i < divList.length; i++) {
                if (list[i].tagColor) {
                    divList[i].style.background = list[i].tagColor;
                    divList[i].style.opacity = list[i].opacity;
                }
            }
        }
    }
};
</script>

<style scoped>
.detectFunc {
    font-size: 12px;
}
</style>>
