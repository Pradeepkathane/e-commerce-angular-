module.exports=function({tests:o="browserify test.js",farm:t="browserstack",notunnel:i=!1,runner:f="mocha",browsers:l=[],globals:h="",port:g=1945,watch:c=".",opts:m={},timeout:p,ripple:r}={}){const q=debounce(p=p||+env.POPPER_TIMEOUT||2e4)(function $(){log("no updates received for",p/1e3,"seconds. timing out.."),process.exit(1)});return r=(r||rijs)(extend({dir,port:g})(m)),resdir(r,dir),l=l.map(canonical(t)).filter(Boolean),r("results",{},{from:function j(e){return"RERUN"==e.data.type?v(e.data.value):"SAVE"==e.data.type&&function w(e,s){const{uid:a}=e,u=r("results"),y=a in u?u[a].retries:0;log("received result from",a),s.platform=e,s.retries=y,update(a,s)(r("results")),function I(){const e=values(r("results"));r("totals",{tests:str(e.map(key("stats.tests")).filter(Boolean).pop()||"?"),browsers:str(e.length),passing:str(e.map(key("stats.failures")).filter(is(0)).length||"0")})}(),function E(e){if(!isCI||e.stats.running)return;const s=l.filter(d=>!(d._name&&d._name!==e.platform.name||d._version&&d._version!==e.platform.version||d._os&&d._os!==e.platform.os.name||d._os_version&&d._os_version!==e.platform.os.version)).pop();if(!s)return log("result not in matrix".red,e.platform.uid);if(s.passed_by=e.platform.uid,s.passed=!e.stats.failures,s.passed?log("browser passed:",e.platform.uid.green.bold):err("browser failed:",e.platform.uid.red.bold),!s.passed&&e.retries<3)return log("retrying".yellow,e.platform.uid,++e.retries,"/",str(3).grey),v(e.platform.uid);farms[t].status&&farms[t].status(s,e.platform);const a=l.length,u=l.filter(by("passed")).length,y=l.filter(by("passed_by")).length;log("ci targets",str(u).green.bold,"/",str(a).grey),a===u?time(3e3,d=>process.exit(0)):a===y?time(3e3,d=>!env.POPPER_TIMEOUT&&process.exit(1)):q()}(s)}(e.socket.platform,e.data.value)}}),r("totals",{}),!isCI&&c&&(log("watching",c),chokidar.watch(c,{ignored:[/^\.(.*)[^\/\\]/,/[\/\\]\./,/node_modules(.+)popper/],ignoreInitial:!0,usePolling:!1,depth:5}).on("change",debounce(_))),r(require("browser-icons")),r.to=limit(r.to),r.server.on("connected",function P(e){e.platform=parse(e),e.type="/dashboard"==e.handshake.url?"dashboard":"agent",log("connected",e.platform.uid.green,e.type.grey),e.on("global err",(s,a,u)=>err("Global error: ",e.platform.uid.bold,s,a,u)),debug&&e.on("console",function(){log(e.platform.uid.bold,"says:","",arguments[0],to.arr(arguments[1]).map(str).join(" "))})}),r.server.express.use(compression()).use("/utilise.min.js",send(local("utilise","utilise.min.js"))).use("/utilise.js",send(local("utilise","utilise.js"))).use("/mocha.css",send(local("mocha","mocha.css"))).use("/mocha.js",send(local("mocha","mocha.js"))).use("/chai.js",send(local("chai","chai.js"))).use("/dashboard/:id",send(local(`./client/${f}/logs.html`))).use("/dashboard",send(local("./client/dashboard.html"))).use("/",serve(local("./client"))).use("/",function x(){const e=is.arr(h)?h.join("\n"):h,s=file(local(`./client/${f}/index.html`)).replace("\x3c!-- { extra scripts } --\x3e",e||"");return(a,u)=>u.send(s)}()),_(),function R(){r.server.once("listening").then(()=>{log("running on port",r.server.http.address().port),!i&&require("ngrok").connect(r.server.http.address().port,(e,s)=>(log("tunnelling",s&&s.magenta),e?err("error setting up reverse tunnel",e.stack):l.map(boot(t)(s))))})}(),r;function _(){log("generating tests");const e=write(local("./client/tests.js")),s=is.fn(o)?o():run("sh",["-c",o],{stdio:"pipe"});s.stderr&&s.stderr.pipe(process.stderr),((s.stdout||s).on("end",debounce(500)(v)).pipe(e).flow||noop)()}function v(e){const s=e?[e]:r.server.ws.sockets.map(u=>u.platform.uid);s.map(u=>update(`${u}.stats.running`,!0)(r("results")));const a=r.server.ws.sockets.filter(not(by("handshake.url","/dashboard"))).filter(by("platform.uid",is.in(s))).map(emitReload).length;log("reloading",str(a).cyan,"agents",e||"")}};const{values,key,str,not,by,grep,lo,is,debounce,extend,falsy,send,file,noop,update,identity,time,includes}=require("utilise/pure"),write=require("fs").createWriteStream,run=require("child_process").spawn,{stringify}=require("cryonic"),{resolve}=require("path"),compression=require("compression"),browserify=require("browserify"),platform=require("platform"),chokidar=require("chokidar"),express=require("express"),resdir=require("rijs.resdir"),serve=require("serve-static"),farms=require("./farms"),wd=require("wd"),rijs=n=>require("rijs.npm")(require("rijs")(n)),log=require("utilise/log")("[popper]"),err=require("utilise/err")("[popper]"),old=grep(console,"log",/^(?!.*\[ri\/)/),env=process.env,dir=__dirname,isCI="true"===env.CI,debug="debug"==lo(env.NODE_ENV),heartbeat=n=>setInterval(o=>n.eval("",t=>{t&&console.error(t)}),3e4),canonical=n=>o=>is.str(o)?farms[n].browsers[o]:o,local=(n,o)=>{const t=o?require.resolve(n):__dirname;return resolve(t,o?"../"+o:n)},emitReload=n=>n.send(stringify({data:{exec:()=>location.reload()}})),parse=n=>{const t=platform.parse(n.handshake.headers["user-agent"]),i={name:lo(t.name),version:major(t.version),os:{name:lo(t.os.family.split(" ").shift()),version:major(t.os.version,t.os.family)}};return"os"==i.os.name&&(i.os.name="osx"),"chrome mobile"==i.name&&(i.name="chrome"),"microsoft edge"==i.name&&(i.name="ie"),i.uid=i.name+"-"+i.version+"-"+i.os.name+"-"+i.os.version,i},major=(n,o)=>n?n.split(".").shift():includes("xp")(lo(o))?"xp":"?",limit=n=>(o,t)=>"/dashboard"==t.handshake.url&&n(o,t),boot=n=>o=>t=>{const{_name:i="?",_version:f="?",_os:l="?"}=t,{connect:h,parse:g=identity}=farms[n],c=`${i.cyan} ${f.cyan} on ${l}`,m=t.vm=h(wd);m||(err("failed to connect to "+n),process.exit(1)),log(`booting up ${c}`),m.init(g(t),p=>{if(p)return err(p,c);log("initialised",c),m.get(o,r=>{if(r)return err(r,c);log("opened to test page",c.cyan),heartbeat(m)})})};