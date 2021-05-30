<template>
  <div class="videoPlayer">
    <video
      width="320" 
      height="240"
      ref="videoPlayer"
      id="videoElement"
      class="video-js vjs-big-play-centered"
    ></video>
  </div>
</template>

<script>

export default {
  name: "Flvjs",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      player: null
    };
  },
  mounted() {
    if (flvjs.isSupported()) {
      var videoElement = document.getElementById("videoElement");

      // console.log(videoElement.loadstart); //客户端开始请求数据
      // console.log(videoElement.progress); //客户端正在请求数据
      // console.log(videoElement.suspend); //延迟下载
      // console.log(videoElement.abort); //客户端主动终止下载（不是因为错误引起）
      // console.log(videoElement.loadstart); //客户端开始请求数据
      // console.log(videoElement.progress); //客户端正在请求数据
      // console.log(videoElement.suspend); //延迟下载
      // console.log(videoElement.abort); //客户端主动终止下载（不是因为错误引起），
      // console.log(videoElement.error); //请求数据时遇到错误
      // console.log(videoElement.stalled); //网速失速
      // console.log(videoElement.play); //play()和autoplay开始播放时触发
      // console.log(videoElement.pause); //pause()触发
      // console.log(videoElement.loadedmetadata); //成功获取资源长度
      // console.log(videoElement.loadeddata); //
      // console.log(videoElement.waiting); //等待数据，并非错误
      // console.log(videoElement.playing); //开始回放
      // console.log(videoElement.canplay); //可以播放，但中途可能因为加载而暂停
      // console.log(videoElement.canplaythrough); //可以播放，歌曲全部加载完毕
      // console.log(videoElement.seeking); //寻找中
      // console.log(videoElement.seeked); //寻找完毕
      // console.log(videoElement.timeupdate); //播放时间改变
      // console.log(videoElement.ended); //播放结束
      // console.log(videoElement.ratechange); //播放速率改变
      // console.log(videoElement.durationchange); //资源长度改变
      // console.log(videoElement.volumechange); //音量改变

      console.log("flvplayer:" + this.options);
      //console.log(this.$refs.flvPlayer);
      var videos_type = this.options.type;
      //var video_type = this.$refs.videoPlayer.tpye;
      var video_isLive = this.options.isLive;
      var video_hasAudio = this.options.hasAudio;
      var video_url = this.options.url;
      this.flvPlayer = flvjs.createPlayer({
        // type: "flv",
        // isLive: true,
        // hasAudio: false,
        // url: "http://192.168.110.121/live?port=1935&app=myapp&stream=test"
        type: videos_type,
        isLive: video_isLive,
        hasAudio: video_hasAudio,
        url: video_url
      });
      this.flvPlayer.attachMediaElement(videoElement);
      this.flvPlayer.load();
      this.flvPlayer.play();
    }
  },
  methods: {
    play() {
      this.flvPlayer.play();
    }
  }
};
</script>
<style scoped>
.videoPlayer {
  width: 200px;
  height: 200px;
}
</style>
