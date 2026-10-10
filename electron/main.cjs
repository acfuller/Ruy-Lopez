const {app,BrowserWindow,Menu,shell,session}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
// Fixed per-user storage location, separate from source and executable updates.
const data=process.env.RUY_TEST_PROFILE||path.join(process.env.LOCALAPPDATA||app.getPath('appData'),'RuyLopezTrainerData');
fs.mkdirSync(data,{recursive:true});app.setPath('userData',data);
app.setAppUserModelId('local.ruylopez.trainer');
const allowedHosts=new Set(['en.wikipedia.org','en.wikibooks.org','www.pgnmentor.com']);
function external(url){try{const u=new URL(url);if(u.protocol==='https:'&&allowedHosts.has(u.hostname))shell.openExternal(u.href);}catch{}}
let window;
const lock=app.requestSingleInstanceLock();
if(!lock)app.quit();else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
 app.whenReady().then(()=>{
  session.defaultSession.setPermissionRequestHandler((_w,_p,callback)=>callback(false));
  session.defaultSession.setPermissionCheckHandler(()=>false);
  // No remote application content, telemetry, fonts or APIs. Links open in your browser.
  session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
  window=new BrowserWindow({width:1360,height:980,minWidth:380,minHeight:600,show:false,backgroundColor:'#f5f3ec',title:'Ruy López Chess Trainer',icon:path.join(__dirname,'icon.png'),webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  window.webContents.setWindowOpenHandler(({url})=>{external(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{event.preventDefault();external(url);});
  window.once('ready-to-show',()=>window.show());
  window.loadFile(path.join(__dirname,'../dist/index.html'));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
   {label:'File',submenu:[{label:'Print current page',accelerator:'Ctrl+P',click:()=>window.webContents.print({printBackground:true})},{type:'separator'},{role:'quit'}]},
   {label:'View',submenu:[{role:'reload'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]},
   {label:'Help',submenu:[{label:'Opening reference',click:()=>external('https://en.wikipedia.org/wiki/Ruy_Lopez')},{label:'Game database',click:()=>external('https://www.pgnmentor.com/files.html')}]}]));
 });
 app.on('window-all-closed',()=>app.quit());
}
