//旋转的函数
function rotate (obj,angle) {
	obj.style["webkitTransform"]="rotate("+angle+"rad)";
	obj.style["mozTransform"]="rotate("+angle+"rad)";
	obj.style["0Transform"]="rotate("+angle+"rad)";
	obj.style["msTransform"]="rotate("+angle+"rad)";
	obj.style["transform"]="rotate("+angle+"rad)";
}
//检测是否碰撞
function hit (obj1,obj2) {
	//obj1  多物体
	//obj2  单物体
	for (var i=0; i<obj1.length; i++) {
		var l1=$(obj1[i]).position().left;
		var t1=$(obj1[i]).position().top;
		var r1=l1+$(obj1[i]).width();
		var b1=t1+$(obj1[i]).height();
        
		var l2=obj2.position().left;
		var t2=obj2.position().top;
		var r2=l2+obj2.width();
		var b2=t2+obj2.height();
		if(!(l2>r1||t2>b1||r2<l1||b2<t1)){
		   return $(obj1[i]);
		}
	}
	return false;
}
//创建进度条
function createbar (obj,obj1,imgArr,callback) {
 var num=0;
 for (var i=0; i<imgArr.length; i++) {
	(function  (i) {
      var imgObj=new Image();
	  imgObj.onload=function  () {
		  num++;
		  obj.style.width=(100*(num/imgArr.length))+"%";
		  obj1.style.left=(100*(num/imgArr.length))+"%";
		  if(num==imgArr.length){
		  callback();
		  }
	  }
	  imgObj.src=imgArr[i];
	})(i)
 }
}

//运行我坦克的主函数
function myTankRun(scene,bosswalls,boss,tank,tankhead,trees,dtankarr){
    //1.键盘控制方向
	  var isrun=true;
	  $(document).bind("keydown",function  (event) {
		  switch (event.keyCode) {
		  case 65:
		   tank.data("tankdir","l");
		   tank.data("tankAngle",-90*Math.PI/180);
		   rotate(tank[0],tank.data("tankAngle"));
		   break;
		   case 87:
		   tank.data("tankdir","t");
		   tank.data("tankAngle",0*Math.PI/180);
		   rotate(tank[0],tank.data("tankAngle"));
		   break;
		   case 68:
		   tank.data("tankdir","r");
		   tank.data("tankAngle",90*Math.PI/180);
		   rotate(tank[0],tank.data("tankAngle"));
		   break;
		   case 83:
		   tank.data("tankdir","b");
		   tank.data("tankAngle",180*Math.PI/180);
		   rotate(tank[0],tank.data("tankAngle"));
		   break;
		   default:
           tank.data("tankdir","");
		  }
		  if(isrun){
			  isrun=false;
		      checkrun(scene,tank,trees,bosswalls)
		  }
	  })
	 $(document).bind("keyup",function  () {
        isrun=true;
        clearInterval(dtankarr.t1);
	 })
	//2坦克管旋转
	 tankHeadRotate(tankhead,tank);

	//3发射炮弹
	$(".mask").bind("click",function  (event) {
      if(tank.data("fire")){
	      tank.data("fire",false);
		  var shell=$("<div>").css({
		  width:13,height:13,background:"url(img/shell.png)",position:"absolute",
		  top:tank.position().top+16,
		  left:tank.position().left+16,
		  "z-index":0
		  }).appendTo(scene);
		  shell.data({
		    shellAngle:0,
			shellSpeed:15
		  })
          var lx=event.originalEvent.layerX;
		  var ly=event.originalEvent.layerY;
		  var nx=tank.position().left;   
		  var ny=tank.position().top;
		  shell.data("shellAngle",Math.atan2((lx-nx),(ny-ly)));
          sendShell(scene,bosswalls,boss,tank,trees,shell,dtankarr);
	  }
	})
}
//本坦克子弹运行以及检测
function  sendShell(scene,bosswalls,boss,tank,trees,shell,dtankarr) {
	var sceneW=scene.width();
	var sceneH=scene.height();
	var hits;
	//炮弹运行
	dtankarr.t2=setInterval(function(){
		if(shell){
		 shell.css("left",function  () {
			 var lefts=shell.position().left;
			 lefts+=Math.sin(shell.data("shellAngle"))*shell.data("shellSpeed");
			 return lefts;
		 }).css("top",function  () {
			 return shell.position().top-=Math.cos(shell.data("shellAngle"))*shell.data("shellSpeed");
		 })
	   }
	},80)
   
	  //炮弹检测
     dtankarr.t3=setInterval(function(){
       //检测炮弹和树木的碰撞
	     if(hit(trees,shell)){
             clearInterval(dtankarr.t3)
			 var t;
			 clearTimeout(t);
		   var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
		   t=setTimeout(function (){
		     fires.remove();
			 fires=null;
              clearTimeout(t);
		   },200)
			   //检测炮弹和边界
		 }else	if(shell.position().left<0||shell.position().left>sceneW-13||shell.position().top<0||shell.position().top>sceneH-13){
		   clearInterval(dtankarr.t3);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
		  }else	if((hits=hit(dtankarr,shell))&&dtankarr.length>0){//检测敌坦克
		     clearInterval(dtankarr.t3);
			 //创建敌坦克的时候，要给每一个坦克加以个标记
			 for (var i=0; i<dtankarr.length; i++) {
               if(hits.data("index")==dtankarr[i].data("index")){
			     dtankarr.splice(i,1);
				 break;
			   }
			 }
			 //next 是用来检测敌坦克时候全部生成
            if(dtankarr.next){
			 if(dtankarr.length==0){
			   next();
			 }
			}
			//删除敌坦克的子弹以及本身
			if(hits){
			  hits.data("shell").remove();
			  hits.data("shell",null);
			  hits.remove();
              hits=null;
			}
			var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			clearTimeout(t);
		   },200)
		  }else	if(hits=hit(bosswalls,shell)){//检测一下boss墙
		     clearInterval(dtankarr.t3);
			 var num=hits.data("hits");
			 hits.data("hits",++num);
			 if(hits.data("hits")<3){
			  hits.css("background","url(img/dbosswall.png)");
			 }else{
			  hits.remove();
			  hits=null
			 }
             var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			clearTimeout(t);
		   },200)
		   }else	if(hits=hit(boss,shell)){//boss
		     clearInterval(dtankarr.t3);
			 var num=hits.data("hits");
			 hits.data("hits",++num);
			 if(hits.data("hits")<3){
			   hits.css("background","url(img/dboss.png)");
			 }else{
			   hits.remove();
			   hits=null;
			   var bossfires=$("<div>").css({
			   width:104,height:64,background:"url(img/bossfire.png)",
			   position:"absolute",top:420,left:330,"z-index":5
			   }).appendTo(scene);

			   replay();
			 }
                 var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			if(bossfires){
			  bossfires.remove();
			  bossfires=null;
			}
			clearTimeout(t);
		   },200)

		   }
		  
	 },80)
}

//坦克管旋转	 
function tankHeadRotate (tankhead,tank) {
  $(".mask").bind("mousemove",function  (event) {
	  var lx=event.originalEvent.layerX;
	 
	  var ly=event.originalEvent.layerY;

	  var nx=tank.position().left;
	  	   
	  var ny=tank.position().top;
	  tankhead.data("tankHeadAngle",Math.atan2((lx-nx),(ny-ly)));
	  rotate(tankhead[0],tankhead.data("tankHeadAngle")-tank.data("tankAngle"));
  })
}
//坦克行动函数
function checkrun (scene,tank,trees,bosswalls) {
	var sceneW=scene.width();
	var sceneH=scene.height();
	dtankarr.t1=setInterval(function(){
	  var left=tank.position().left;
	  var top=tank.position().top;
	  switch (tank.data("tankdir")) {
	  case "l":
			left-=tank.data("tankspeedx");
	  break;
	  case "r":
			left+=tank.data("tankspeedx");
	  break;
	  case "t":
			top-=tank.data("tankspeedy");
	  break;
	  case "b":
			top+=tank.data("tankspeedy");
	  break;
	  }
	  if(left<=0){
	    left=0;
	  }else	if(left>=sceneW-45){
	    left=sceneW-45;
	  }

	  if(top<=0){
	    top=0;
	  }else	if(top>=sceneH-45){
	     top=sceneH-45
	  }	 
	  tank.css("left",left).css("top",top);
	  if(hit(trees,tank)||hit(bosswalls,tank)){
	    switch (tank.data("tankdir")) {
	    case "l":
	    tank.css("left",left+tank.data("tankspeedx"));
		break;
		case "r":
	    tank.css("left",left-tank.data("tankspeedx"));
		break;
		case "t":
	    tank.css("top",top+tank.data("tankspeedy"));
		break;
		case "b":
	    tank.css("top",top-tank.data("tankspeedy"));
		break;
	    }
	  }
	},80)
}

	//敌坦克运行主函数
function dTankRun (scene,bosswalls,boss,mytank,trees,dtankarr) {
	//动态获取关卡数
	var guanka=$(window).data("guanka");
	//动态获取难度系数
	var step=$(window).data("step");
	//敌人坦克的数量
	var dnum=$(window).data("dnum")+guanka+step;
	//敌人坦克的速度
	var dspeed=$(window).data("dspeed")+guanka+step;
	//敌人坦克子弹的速度
	var dshellspeed=$(window).data("dshellspeed")+guanka+step;
	//动态创建坦克
	createTank(dnum,dtankarr,scene);
	//检测坦克的运动
	dtankarr.t5=setInterval(function(){
	  if(dtankarr.length==0){
	    return;
	  }
	  $.each(dtankarr,function  (index,obj) {
		  if(!obj){
		    return;
		  }
		  dcheckrun(scene,obj,trees,bosswalls,dspeed,mytank,boss,dshellspeed)//dspeed ->5
	  })
	    
	
	},80)

	//动态监测坦克的随机转向
	var randomtime=5000;
	dtankarr.t6=setInterval(function(){
     if(dtankarr.length==0){
	  return;
	 }
     randomtime=3000+3000*Math.random();
	 dcheckdir(dtankarr[Math.floor(Math.random()*dtankarr.length)]);
	},randomtime)

     //发射敌人炮弹
	dtankarr.t7=setInterval(function(){
	  if(dtankarr.length==0){
	   return;
	  }
	  $.each(dtankarr,function  (index,obj) {
		  if(!obj){
		    return;
		  }
		  if(obj.data("fire")){
		    obj.data("fire",false);
			obj.data("shell",$("<div>").css({
			width:13,height:13,background:"url(img/foeshell.png)",position:"absolute",
			top:obj.position().top+16,
			left:obj.position().left+16,
		    "z-index":0
			}).appendTo(scene));
		  }
		  dsendShell(scene,bosswalls,boss,obj,trees,obj.data("shell"),mytank,dshellspeed);//dshellspeed->10
	      dcheckShell(scene,bosswalls,boss,obj,trees,obj.data("shell"),mytank)
	  })
	},80)

}
//检测敌人弹道
function  dcheckShell(scene,bosswalls,boss,tank,trees,shell,mytank) {
	var sceneW=scene.width();
	var sceneH=scene.height();
	if(!shell){
	  return;
	}
	//检测边界
	if(shell.position().left<0||shell.position().left>sceneW-13||shell.position().top<0||shell.position().top>sceneH-13){
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
		   tank.data("flag",true);
		  }else	if(hits=hit(mytank,shell)){//检测敌坦克
			 hits.css("display","none");
			var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
		   tank.data("flag",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			clearTimeout(t);
		   },200)
			replay();
		  }else	if(hits=hit(bosswalls,shell)){//检测一下boss墙
			 var num=hits.data("hits");
			 hits.data("hits",++num);
			 if(hits.data("hits")<3){
			  hits.css("background","url(img/dbosswall.png)");
			 }else{
			  hits.remove();
			  hits=null
			 }
             var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
		   tank.data("flag",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			clearTimeout(t);
		   },200)
		   }else	if(hits=hit(boss,shell)){//检测boss
			 var num=hits.data("hits");
			 hits.data("hits",++num);
			 if(hits.data("hits")<3){
			   hits.css("background","url(img/dboss.png)");
			 }else{
			   hits.remove();
			   hits=null;
			   var bossfires=$("<div>").css({
			   width:104,height:64,background:"url(img/bossfire.png)",
			   position:"absolute",top:420,left:330,"z-index":5
			   }).appendTo(scene);

			   replay();
			 }
                 var t;
			clearTimeout(t);
			var fires=$("<div>").css({
		   width:20,height:20,background:"url(img/fire.png)",position:"absolute",
		   top:shell.position().top,
		   left:shell.position().left,
		   "z-index":5
		   }).appendTo(scene);
		   shell.remove();
		   shell=null;
		   tank.data("fire",true);
           t=setTimeout(function (){
            fires.remove();
			fires=null;
			if(bossfires){
			  bossfires.remove();
			  bossfires=null;
			}
			clearTimeout(t);
		   },200)

		   }

}
//发射敌人炮弹
function   dsendShell(scene,bosswalls,boss,tank,trees,shell,mytank,dshellspeed) {
	if(tank.data("flag")){
	  tank.data("flag",false);
	  tank.data("tempdir", tank.data("tankdir"));
	}
	if(shell){
        if(tank.data("tempdir")=="l"){
		 shell.css("left",(shell.position().left)-=dshellspeed)
		}else	if(tank.data("tempdir")=="r"){
		 shell.css("left",(shell.position().left)+=dshellspeed)
		 }else	if(tank.data("tempdir")=="t"){
		 shell.css("top",(shell.position().top)-=dshellspeed)
		 }else	if(tank.data("tempdir")=="b"){
		 shell.css("top",(shell.position().top)+=dshellspeed)
		 }
	}
}
//随机改变敌坦克的方向
function dcheckdir (tank) {
	var arr=["l","r","t","b"];
	tank.data("tankdir",arr[Math.floor(Math.random()*4)])
}
//检测敌人坦克运行
function  dcheckrun(scene,tank,trees,bosswalls,dspeed,mytank,boss,dshellspeed) {
  var sceneW=scene.width();
  var sceneH=scene.height();
  var left=tank.position().left;
  var top=tank.position().top;
  switch (tank.data("tankdir")) {
  case "l":
  left-=dspeed;
  rotate(tank[0],1.5707963267948966);
  break;
  case "r":
  left+=dspeed;
  rotate(tank[0],-1.5707963267948966);
  break;
  case "t":
  top-=dspeed;
  rotate(tank[0],3.141592653589793);
  break;
  case "b":
  top+=dspeed;
  rotate(tank[0],0);
  break;
  
  }
  if(left>=sceneW-45){
	tank.data("side",true);
    left=sceneW-45;
  }else	if(left<0){
	tank.data("side",true);
	left=0;
  }

  if(top<0){
	tank.data("side",true);
    top=0;
  }else	if(top>sceneH-45){
   tank.data("side",true);
   top=sceneH-45
  }
   if(tank.data("side")){
     tank.data("side",false);
	 var arr=["l","r","t","b"];
     for (var i=0; i<arr.length; i++) {
		 if(arr[i]==tank.data("tankdir")){
		   arr.splice(i,1);
		   break;
		 }
     }
	 tank.data("tankdir",arr[Math.floor(Math.random()*3)]);
   }
  tank.css("left",left).css("top",top);
  if(hit(trees,tank)||hit(bosswalls,tank)){
    tank.data("side",false);
    switch (tank.data("tankdir")) {
	    case "l":
	    tank.css("left",left+dspeed);
		break;
		case "r":
	    tank.css("left",left-dspeed);
		break;
		case "t":
	    tank.css("top",top+dspeed);
		break;
		case "b":
	    tank.css("top",top-dspeed);
		break;
	    }
		var arr=["l","r","t","b"];
		 for (var i=0; i<arr.length; i++) {
			 if(arr[i]==tank.data("tankdir")){
			   arr.splice(i,1);
			   break;
			 }
		 }
	 tank.data("tankdir",arr[Math.floor(Math.random()*3)]);
  }
}
//创建敌人坦克
function  createTank(dnum,dtankarr,scene) {
   var nums=0;
   dtankarr.t4=setInterval(function(){
	if(dtankarr.length>4){
	  return;
	}
	if(nums==dnum){
	clearInterval(dtankarr.t4);
    dtankarr.next=true;
	}
    var obj=$("<div>").css({
	width:45,height:45,background:"url(img/foetank.png) no-repeat",top:0,
    left:135+490*Math.random(),position:"absolute"
	}).appendTo(scene);
	obj.data({
	//坦克的角度
	tankAngle:0,
	//是否开火
	fire:true,
	//坦克的方向
	tankdir:"b",
	//检测是否是敌坦克
	flag:true,
	//用于碰撞后的标记
	index:nums
	})
		nums++;
    dtankarr.push(obj);
   },6000)
}