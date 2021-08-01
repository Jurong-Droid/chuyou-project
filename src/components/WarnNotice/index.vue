<template>
<el-badge :value="options.length" :hidden="hidden" class="item">
    <el-dropdown trigger="click" @command="handle">
        <div>
            <svg-icon icon-class="notice" />
        </div>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item of options" :key="item.id" :command="item">
                <a style='color:rgb(186 63 103);'>{{item.promptInfo }}>>>> </a>
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</el-badge>
</template>

<script>
import store from '@/store';
export default {
    data() {
        return {
            options: [],
            hidden: true,
        }
    },
    watch: {
        options() {
            if (this.options.length === 0) {
                this.hidden = true;
            } else {
                this.hidden = false;
            }
        }
    },
    created() {
        this.getList();
        this.initWebSocket();
    },
    // 页面注销时候调用 避免连接错误
    destroyed() {
        this.closeWebSocket();
    },
    methods: {
        getList() {
            if (!this.hasPerm('abnormalInfo:start')) {
                return
            }
            //查询列表
            this.api({
                url: "/infoNotice/listOpenPromptMessage",
                method: "get",
            }).then(data => {
                this.options = data;
            })
        },
        initWebSocket() {
            if (!this.hasPerm('abnormalInfo:start')) {
                return
            }
            const that = this;
            if (typeof (WebSocket) == 'undefined') {
                this.$notify({
                    title: '提示',
                    message: '当前浏览器无法接收实时报警信息，请使用谷歌浏览器！',
                    type: 'warning',
                    duration: 0
                });
            } else {
                // 获取token保存到vuex中的用户信息，此处仅适用于本项目，注意删除或修改
                // 实例化socket，这里我把用户名传给了后台，使后台能判断要把消息发给哪个用户，其实也可以后台直接获取用户IP来判断并推送
                const baseUrl = process.env.NODE_ENV === 'production' ? window.location.host : process.env.ORIGIN_URL;
                const socketUrl = 'ws://' + baseUrl + '/websocket/' + store.getters.userId;
                this.socket = new WebSocket(socketUrl);
                // 监听socket打开
                this.socket.onopen = function () {
                    console.log('浏览器WebSocket已打开');
                };
                // 监听socket消息接收
                this.socket.onmessage = function (msg) {
                    // 转换为json对象
                    const data = JSON.parse(msg.data);
                    if (data.status === 'open') {
                        that.options.push(data);
                        that.instance = that.$notify({
                            title: '异常警告',
                            dangerouslyUseHTMLString: true,
                            // 这里也可以把返回信息加入到message中显示
                            message: `<a style='color:rgb(186 63 103);text-decoration: underline;'>${data.promptInfo}>>>></a>`,
                            type: 'warning',
                            duration: 0,
                            onClick: () => {
                                that.handle(data);
                                that.instance.close();
                            }
                        })
                    } else if (data.status === 'close') {
                        that.options = that.options.filter((item) => {
                            return item.id != data.id
                        });
                    }

                };
                // 监听socket错误
                this.socket.onerror = function () {
                    that.$notify({
                        title: '错误',
                        message: '服务器错误，无法接收实时报警信息',
                        type: 'error',
                        duration: 0
                    });
                };
                // 监听socket关闭
                this.socket.onclose = function () {
                    console.log('WebSocket已关闭');
                }
                // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
                this.socket.onbeforeunload = function () {
                    this.closeWebSocket();
                    console.log('监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常');
                }
            }
        },
        handle(item) {
            this.$router.push({
                name: item.jumpPath,
                params: {
                    'id': item.foreignKey
                }
            });
        }, // 关闭WebSocket连接
        closeWebSocket() {
            this.socket.close();
        },

    }

}
</script>

<style scoped>
a:link {
    text-decoration: none;
}

a:visited {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

a:active {
    text-decoration: underline;
}
</style>
