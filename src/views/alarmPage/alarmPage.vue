<template>
  <div class="videoPlayer">
    <video id="youchang" class="centeredVideo" controls muted></video>
  </div>
</template>

<script>
import flvjs from "flv.js";
//import "video.js/dist/video-js.css";
//import "videojs-flash";

export default {
  name: "VideoPlayer",
  props: {
    options: {
      id: String,
      type: Object,
      url: String,
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
    this.$nextTick(() => {
      var videoElement = document.getElementById("youchang");
      //console.log(this.$refs.videoPlayer);
      //this.player = this.$refs.videoPlayer;
      this.player = flvjs.createPlayer({
        // type: "flv",
        // isLive: true,
        // hasAudio: false,
        // url: "http://192.168.110.121/live?port=1935&app=myapp&stream=test"
        type: "flv",
        isLive: true,
        hasAudio: false,
        url: "http://58.155.47.80:9090/live?port=1935&app=myapp&stream=youchang1"
      });
      this.player.attachMediaElement(videoElement);

      this.player.load();
      //this.player.pause();
      this.player.play();
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
};
</script>
<style scoped>
.videoPlayer {
  width: 100%;
  height: 100%;
}
.mainContainer {
  display: block;
  width: 1024px;
  margin-left: auto;
  margin-right: auto;
}

.urlInput {
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8px;
  margin-bottom: 8px;
}

.centeredVideo {
  display: block;
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: auto;
}

.controls {
  display: block;
  width: 100%;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
</style>
