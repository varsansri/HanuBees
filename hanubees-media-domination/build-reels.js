const path=require("path"),C=require("./config.js"),{makeReel}=require("./lib/make-video.js");
const POSTS=require("./content/posts.js");
const slugs=["nvidia","tesla","apple","amazon","microsoft","meta"];
(async()=>{
 for(const slug of slugs){
   const p=POSTS.find(x=>x.slug===slug);
   const dir=path.join(C.ROOT,"assets/prepared",slug),logo=path.join(dir,"logo_badge.png");
   const slides=p.slides.map((s,i)=>({...s,person:path.join(dir,`person_s${i+1}.png`),logo}));
   slides.push({role:"agency"});
   const post={id:slug,outDir:path.join(C.ROOT,"out",slug),slides};
   const out=path.join(C.ROOT,"out",slug,`${slug}_reel.mp4`);
   try{ await makeReel(post,out,"/tmp/rays_bg.mp4"); console.log("REEL ok",slug); }
   catch(e){ console.log("REEL FAIL",slug,e.message); }
 }
 console.log("ALL REELS DONE");
})();
