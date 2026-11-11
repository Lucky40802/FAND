const {chromium}=require('../pw.js');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+path.resolve('site/chargen.html'));await p.waitForTimeout(2000);
console.log(await p.evaluate(async()=>{for(let i=0;i<60&&!SP.length;i++)await new Promise(r=>setTimeout(r,100));const out=[];
 for(const [cls,race] of [['Wizard','High Elf'],['Sorcerer','Tiefling of Dispater'],['Cleric','Dark Elf'],['Bard','Human'],['Warlock','Tiefling'],['Fighter','Tiefling of Dispater'],['Druid','Forest Gnome']]){const c=genFill({cls,race,level:1}).c;out.push(cls+'/'+race+': cantrips='+JSON.stringify((c.spells||{})[0]||[])+' lv1='+((c.spells||{})[1]||[]).length)}
 return out.join('\n')}));await b.close()})();
