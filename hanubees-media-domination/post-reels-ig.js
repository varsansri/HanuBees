const path=require("path");
const {postVideo}=require("./lib/post.js");
const POSTS=require("./content/posts.js");
// IG accounts: hanubees=key1, hanubees.ai=key3, hanubees.biz=key4 (2 reels each)
const igKey={nvidia:"ZERNIO_API_KEY",tesla:"ZERNIO_API_KEY",apple:"ZERNIO_API_KEY_3",
             amazon:"ZERNIO_API_KEY_3",microsoft:"ZERNIO_API_KEY_4",meta:"ZERNIO_API_KEY_4"};
const order=["nvidia","tesla","apple","amazon","microsoft","meta"];
(async()=>{
 for(const slug of order){
   const p=POSTS.find(x=>x.slug===slug);
   const file=path.join("out",slug,`${slug}_reel.mp4`);
   try{
     const r=await postVideo({keyEnv:igKey[slug],file,caption:p.caption,platform:"instagram"});
     console.log(`${slug.padEnd(10)} @${(r.account||"?").padEnd(14)} ${r.ok?"PUBLISHED ✓":"FAIL ✗ "+r.status+" "+r.body}`);
   }catch(e){console.log(`${slug} ERR ${e.message}`);}
 }
})();
