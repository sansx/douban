<template>
  <v-layout v-scroll="onScroll" row>
    <v-flex xs12 sm6 offset-sm3>
      <v-container id="scroll-target" class="scroll-y">
        <v-card>
          <v-list two-line>
            <v-subheader>top500</v-subheader>
            <template v-for="(item, index) in arrBox">
              <v-list-tile v-if="typeof item === 'number'" :key="item">{{index+1}} is loading</v-list-tile>
              <v-list-tile v-else :key="item.title" avatar @click="openWindow(item.url)">
                <v-list-tile-avatar>
                  <img
                    :src="'https://www.gravatar.com/avatar/'+getMd5(item.by)+'?d=identicon&s=180'"
                  />
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.by"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.title"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider inset :key="index"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-container>

      <v-layout align-center justify-center row>
        <v-btn v-if="!this.loading" color="success" @click="getLoading">click to load</v-btn>
        <v-progress-circular
          v-if="this.loading"
          :rotate="-90"
          :size="50"
          :width="6"
          :value="getLoadVal"
          color="primary"
        >{{ getLoadVal }}</v-progress-circular>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch, Mixins } from "vue-property-decorator";
import { watch, promises } from "fs";
import MyMixin from "@/Mixin";
import md5 from "js-md5";

@Component
export default class TopList extends Mixins(MyMixin) {
  @Prop({
    type: Array,
    required: true
  })
  public topArr!: number[];

  public totalArr!: number[];

  public arrBox: any[] = [];

  public offsetTop: string | number = 0;

  public loading: boolean = false;

  public getLoadVal: number = 0;

  created() {}

  @Watch("topArr")
  onArrChange(val: [], old: []) {
    if (val.length > 0) {
      this.totalArr = [...val];
      this.arrBox = this.totalArr.splice(0, 5);
      this.changeArr();
    }
  }

  changeArr() {
    this.arrBox.forEach((re: number, index: number): void => {
      this.apis.items.itemget(re).then(res => {
        this.$set(this.arrBox, index, res);
      });
    });
  }

  openWindow(url: string) {
    window.open(url);
  }

  getMd5(str: string) {
    return md5(str);
  }

  onScroll(e: any) {
    const el = e.target.scrollingElement;
    this.offsetTop = el.scrollTop;
    if (
      el.scrollHeight - (el.clientHeight + el.scrollTop) < 100 &&
      !this.loading
    ) {
      console.log(el.scrollHeight - (el.clientHeight + el.scrollTop));
      this.getLoading()
    }
  }

  getLoading() {
    this.loading = true;
    if (this.totalArr.length) {
      const target = this.totalArr.splice(0, 10);
      let res: any = [];
      target.forEach(el => {
        res.push(
          new Promise(resolve => {
            this.apis.items.itemget(el).then(res => {
              this.getLoadVal += 10;
              resolve(res);
            });
          })
        );
      });
      Promise.all(res).then(re => {
        this.arrBox = this.arrBox.concat(re);
        this.loading = false;
        this.getLoadVal = 0;
      });
    }
  }
}
</script>

