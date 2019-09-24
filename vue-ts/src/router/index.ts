import Vue from "vue";
import Router from "vue-router";
import routes from "./router";
import Cookies from "js-cookie";

Vue.use(Router);

const router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");
  if (token) {
    // 如果token不为空字符串或者undefined，说明登录了
    if (to.path === "/login") {
      // 如果登录了然后访问login页，不做跳转，从哪来回哪去
      next(from);
    } else {
      // 否则顺利跳转
      next();
    }
  } else {
    // 否则是没登录
    if (to.path === "/login") {
      // 如果没登录而且乖乖的到登录页去，轻松放行
      next();
    } else {
      // 如果没登录还想去登录后的页面，打回登录页
      next("/login");
    }
  }
});

export default router;
