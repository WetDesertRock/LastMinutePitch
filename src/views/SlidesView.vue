<template>
  <!-- <div>
    <div class="reveal" ref="reveal">
      <div class="slides">
        
      </div>
    </div>
  </div> -->
    <div id="app">
      <div class="reveal">
        <div class="slides">
          <section >
            <h2>{{companyName}}</h2>
            <h4 class="subtitle"><em>a {{companyType}}</em></h4>
          </section>
          <section v-for="(slide, index) in slides" :key="index">
            <h2>{{slide.title}}</h2>
            <div class="container">
              <div class="content" v-html="slide.content"></div>
              <img :src="slide.imageLocation" />
            </div>
          </section>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';

import Reveal from "reveal.js";
// import Markdown from "reveal.js/plugin/markdown/markdown.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";

import { marked } from 'marked';


export default {
  name: "SlidesView",
  methods: {
    createSlides(pitchdeck) {
      const companyName = pitchdeck.companyName;
      const companyType = pitchdeck.companyType;

      const slidesData = [...pitchdeck.slides]

      for (let slide of slidesData) {
        if (slide.imageLocation)
          slide.imageLocation = `${import.meta.env.VITE_BASE_STORAGE_URL}/${slide.imageLocation}`
        
        if (slide.content)
          slide.content = marked.parse(slide.content);
      }

      return slidesData;
    }
  },
  setup() {
    console.log()
    return {
      slides: ref([]),
      companyName: ref(""),
      companyType: ref(""),
    }
  },
  async mounted(){
    const id = this.$route.params.id;

    const response = await fetch(`/api/pitch/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    this.companyName = data.companyName
    this.companyType = data.companyType
    this.slides = this.createSlides(data);
    
    setTimeout(() => {
      Reveal.initialize({
        // plugins: [Markdown],
        // markdown: {
        //   breaks: true,
        //   gfm: true,
        // },
      }, 10);
    })
  }
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  height: 90vh;
}

.container{
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 2fr 1fr;
  grid-gap: 30px;
  text-align: left;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* .subtitle {
  text-colo
} */
</style>
