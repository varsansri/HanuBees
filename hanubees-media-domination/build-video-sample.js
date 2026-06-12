const path=require("path"),C=require("./config.js"),{makeReel}=require("./lib/make-video.js");
const POSTS=require("./content/posts.js");
const slug=process.argv[2]||"nvidia";
const p=POSTS.find(x=>x.slug===slug);
const dir=path.join(C.ROOT,"assets/prepared",slug);
const logo=path.join(dir,"logo_badge.png");
const slides=p.slides.map((s,i)=>({...s,person:path.join(dir,`person_s${i+1}.png`),logo}));
slides.push({role:"agency"});
const post={id:slug,outDir:path.join(C.ROOT,"out",slug),slides};
(async()=>{
  const out=path.join(C.ROOT,"out",slug,`${slug}_reel.mp4`);
  await makeReel(post,out,"/tmp/rays_bg.mp4");
  console.log("REEL ->",out);
})().catch(e=>{console.error("ERR",e.message);process.exit(1);});
