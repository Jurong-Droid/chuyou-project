<template>
  <div class="login-container">
    <el-form
      autoComplete="on"
      :model="loginForm"
      :rules="loginRules"
      ref="loginForm"
      label-position="left"
      label-width="0px"
      class="card-box login-form"
    >
      <h3 class="title">原油库风险智能分析及预警管控系统</h3>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input v-model="loginForm.username" autoComplete="on" />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"></svg-icon>
        </span>
        <el-input
          type="password"
          @keyup.enter.native="handleLogin"
          v-model="loginForm.password"
          autoComplete="on"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%"
          :loading="loading"
          @click.native.prevent="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import loginApi from "@/api/login";

// OpenLayers.js
import "ol/ol.css";
import { Map, View } from "ol";
import Projection from "ol/proj/Projection";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import SrcXYZ from "ol/source/XYZ";
import { Vector as VectorSource } from "ol/source"; // 这个有问题
import {
  defaults as InteractionDefaults,
  DragRotateAndZoom,
} from "ol/interaction";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import Point from "ol/geom/Point";
import { LineString } from "ol/geom";

export default {
  name: "login",
  data() {
    return {
      loginForm: {
        username: "wangliangze",
        password: "wangliangze123",
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            message: "请输入用户名",
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "请输入密码",
          },
        ],
      },
      loading: false,
    };
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          // rbp登陆接口
          let data = {
            userType: "1", // 用户登录类型（1管理用户，2公众用户）
            loginMode: "0", // 登陆模式（0用户名，1微信公众号，2微信小程序，3QQ，4微信，5微博）
            loginName: this.loginForm.username, // 用户名
            password: this.loginForm.password, // 密码
            client: "PC", // 客户端：app，微信小程序(wxamp)、微信公众号(wxcms)、PC
            clientVersion: "0", // 客户端版本号
            versionCode: "0", // 版本代码
          };
          loginApi
            .login(data)
            .then(async (res) => {
              let { ok, errmsg } = res;
              if (ok) {
                let { token, userInfo } = res.result,
                  userToken = {
                    token,
                    id: userInfo.id,
                    expirationTime: userInfo.expirationTime,
                  };
                userInfo.token = token;
                localStorage.setItem("7ty-token", token);
                console.log("rbt的token存储");
                
                this.$store
                  .dispatch("Login", this.loginForm)
                  .then((data) => {
                    this.loading = false;
                    this.$router.push({
                      path: "/",
                    });
                  })
                  .catch((e) => {
                    this.loading = false;
                    console.error(e);
                  });
              } else {
                console.error(errmsg);
              }
            })
            .catch((err) => {
              console.error("登录失败：", err);
            });
        } else {
          return false;
        }
      });
    },
  },
  mounted() {
    console.log(process.env.VUE_APP_BASE_URL);

    console.log(Map, View);
  },
};
</script>

<style lang="scss">
@import "../../styles/mixin.scss";
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  @include relative;
  height: 100vh;
  background-image: url("../../assets/images/youkuBg.jpg");
  background-size: 100%;
  background: -webkit-linear-gradient();

  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px #293444 inset !important;
    box-shadow: 0 0 0px 1000px #293444 inset !important;
    -webkit-text-fill-color: #fff !important;
  }

  input {
    background: transparent;
    border: 0px;
    -webkit-appearance: none;
    border-radius: 0px;
    padding: 12px 5px 12px 15px;
    height: 47px;
  }

  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;

    &_login {
      font-size: 20px;
    }
  }

  .title {
    font-size: 20px;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
    color: #606266;
  }

  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 400px;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.19),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    cursor: pointer;
  }

  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
