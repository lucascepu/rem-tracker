/* Regenerate the single public source of truth after REM/INDEC/BCRA updates. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),ctx={window:{},localStorage:{removeItem(){}}};
vm.createContext(ctx);
for(const file of ['data/rem-history.js','data/bands-history.js','data/bands-model.js']){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
}
const {buildFeed}=require('./bands-feed-core.js');
const feed=buildFeed(ctx.window.BANDS_HISTORY,ctx.window.REM_HISTORY,ctx.window.BandsModel);
const output=path.join(root,'data','bandas-bcra.json');
fs.writeFileSync(output,JSON.stringify(feed,null,2)+'\n');
console.log('Built',output,feed.counts,'REM',feed.assumptions.vintage_used);
