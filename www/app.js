var components=[
    "base/app-layout",
    "base/app-popup",
    "base/app-toolbar",
    "app/reader",
    "app/gallery",
]

function listDir(path) {
    window.resolveLocalFileSystemURL(path,
        function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
                function (entries) {
                    console.log(entries);
                },
                function (err) {
                    console.log(err);
                }
            );
        }, function (err) {
            console.log(err);
        }
    );
}

function readLocalFile(file, callback, error){
    if (window.resolveLocalFileSystemURL){
        window.resolveLocalFileSystemURL(file,function(entry){
             entry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function() {
                        callback(this.result);
                };
                reader.readAsText(file);
                })
             }, error)
    }else if (error){
        error("Can't load file");
    }
}

var  audioEngine = new WebAudio();

var audioId= function(id){
    id = id.toLowerCase()
    id = id.replaceAll('á','a')
    id = id.replaceAll('é','e')
    id = id.replaceAll('í','i')
    id = id.replaceAll('ó','o')
    id = id.replaceAll('ú','u')
    id = id.replaceAll('¿','')
    id = id.replaceAll('!','')
    id = id.replaceAll('?','')
    id = id.replaceAll(',','')
    id = id.replaceAll(':','')
    id = id.replaceAll('.','')
    return id
}

var audioProcs = [];

var playAudio= function(word, callback) {
    var audio1 = audioId(word)
    audioEngine.playFromStart(audio1)
    if (callback){
        var time=audioEngine.duration(audio1)
        var proc=setTimeout(function(){
            callback()
        }, time+50)
        audioProcs.push(proc)
    }
}

var stopSounds= function(){
    for(var idx=audioProcs.length-1; idx>=0; idx--) {
        clearTimeout(audioProcs[idx])
        audioProcs.splice(idx,1)
    }
}

var loadAudios=function(audioList,lang,callback){
    var audios={};
    for(var idx=0; idx< audioList.length; idx++) {
        var audio1 = audioId(audioList[idx])
        var base = ""
        audios[audio1]=base+"audio/"+lang+"/"+audio1+".wav";
    }
    console.log('loading ',Object.keys(audios).join(','), audios);
    audioEngine.loadList(audios, function(result, p1) {
        console.log('loaded ',result, p1)
    }, function(id, error) {
        (console.warn||console.log)('Load error',id,audios[id])
    }, function(){
        if (callback) {
            callback();
        }
    })
}

var playSequence= function (list, itemCallback, endCallback) {
    var time = 50
    console.log('Play sequence', list)
    stopSounds()
    for(var idx=0; idx< list.length; idx++) {
        var audio1 = audioId(list[idx])
        var duration1 = audioEngine.duration(audio1)+0.3;
        console.log('play', audio1, duration1)
        var proc=setTimeout(function(idx,audio,duration){ 
            if (itemCallback) {
                console.log('callback', audio, duration)
                itemCallback(idx,audio,duration)
            } else {
                console.log('playing', audio, duration)
                playAudio(audio)
            }
        },time,idx,audio1,duration1)
        audioProcs.push(proc);
        time+=duration1;
    }
    var proc2=setTimeout(function(){ 
        if (endCallback) {
            endCallback()
        }
    }, time+200)
    audioProcs.push(proc2);
}


var loadData=function(url,callback, error){

    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
            if(req.status == 200){
                callback(req.responseText);
            }
            else{
                if (!window.cordova){
                    if (error) {
                        error("Error loading")
                    }
                    return;
                }
                var file=cordova.file.applicationDirectory+"www/"+url;
                readLocalFile(file,callback,error);
            }
        }
    };
    req.onerror=function(err){
        if (!window.cordova){
            if(error){
                error("Error loading "+url+" "+err);
            }
            return;
        }
        var file=cordova.file.applicationDirectory+"www/"+url;
        readLocalFile(file,callback,error);
    }
    req.send(null)
}
var sass = new Sass();

var vueData={
    el: '#app',
    data: {
        contents : {
            "title" : "Loading"
        },
        appLayout: "",
        debug: false
    },
    created:function(){
        var self=this;
        this.loadComponents(components,function(){
            self.$el.className+=" loaded";
            self.appLayout="app-layout";
        },0)
    },
    mounted:function(){
        console.log("mounted");
    },
    methods: {
        loadComponents:function(list,callback, pos){
            var self = this;
            if (!pos){
                pos=0;
            }
            if (!list[pos]){
                callback(pos);
                return;
            }
            this.loadComponent(list[pos],function(text){
                self.loadComponents(list, callback, pos+1);
            })
        },
        loadComponent:function(id, callback){
            var suffix = '?' + (new Date()).getTime();
            loadData("components/"+id+".html"+suffix,function(text){
                var e=document.createElement("div");
                e.id="component-"+id
                e.innerHTML=text
                var loaded = false
                var scripts=e.querySelectorAll("script[type='text/javascript']");
                var scssStyles=e.querySelectorAll("style[lang='scss']");
                for(var i=0; i<scssStyles.length; i++){
                    var style = scssStyles[i]
                    var scss = style.innerHTML
                    style.parentNode.removeChild(style)
                    sass.compile(scss, function(result) {
                        var st = document.createElement("style")
                        st.id="style-"+id
                        st.innerHTML = result.text
                        document.body.appendChild(st)
                        if (!loaded){
                            callback(text)
                            loaded = true
                        }
                    });
                }
                for(var i=0; i<scripts.length; i++){
                    var script=scripts[i];
                    if (script.src){
                        var sc=document.createElement("SCRIPT");
                        sc.src=script.src;
                        document.body.appendChild(sc);
                    }else{
                        var prefix="";
                        var lines = text.split("\n");
                        for(var i=0; i<lines.length; i++){
                            prefix+="\n"
                            if (lines[i].indexOf("text/javascript")>0) {
                                break;
                            }
                        }
                        eval(prefix+script.innerHTML);
                    }    
                }
                document.body.appendChild(e);
                if (!scssStyles || scssStyles.length==0){
                    callback(text);
                }
            },function(err){
                console.log('load error', err);
            })
        },
        loadView:function(view){
            var self=this;
            console.log("Load view",view);
            loadData("data/"+view+".json?"+Math.random(),function(text){
                var json=JSON.parse(text);
                self.contents=json;
                document.title=json.title;
            })
        }
    }
}

document.addEventListener("deviceready",function(){
  var app = new Vue(vueData);
});

if (!window.cordova && !window.ae){
    var event = new CustomEvent('deviceready');
    document.dispatchEvent(event);   
}

