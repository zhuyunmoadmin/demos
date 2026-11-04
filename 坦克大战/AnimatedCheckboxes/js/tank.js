
var dtankarr=[];
$(function  () {
	$(window).data("play",function  () {
	   //初始化界面
	    init();
	  //初始化数据
	    initData();
	  /*
	    获得战场的基本的操作元素
	  */
	  //战场场景
	  var scene=$(".war-scene");
	  //树
	  var trees=$(".tree");
	  //草坪
	  var grasses=$(".grass");
	  //boss墙
      var bosswalls=$(".boss-wall");
      //boss墙受伤的次数
	  bosswalls.data("hits",0);
	  //boss
	  var boss=$(".boss");
	  //boss受伤的次数
	  boss.data("hits",0);  
	  //自己的坦克
	  var mytank=$(".tank");
	      mytank.data({
		  //坦克的速度
		  tankspeedx:6,
		  tankspeedy:6,
		  //坦克当前的方向
		  tankdir:"",
		  tankAngle:0,
		  //是否开火
		  fire:true
		  })
		//坦克筒
		  var tankhead=$(".tankhead");
		  tankhead.data({
		  tankHeadAngle:0
		  })

	    //运行主坦克
		myTankRun(scene,bosswalls,boss,mytank,tankhead,trees,dtankarr);
		//运行敌坦克
		dTankRun(scene,bosswalls,boss,mytank,trees,dtankarr);

		//再来一次
		$(".agianbtn").click(function  () {
             $(".agian").animate({top:-470},500);
			 location.reload();
		})
		//下一关
        $(".nextbtn").click(function  () {
			  $(".backmask").animate({opacity:0},500);
             $(".next").animate({top:-470},500);
			 //运行主坦克
		myTankRun(scene,bosswalls,boss,mytank,tankhead,trees,dtankarr);
		//运行敌坦克
		dTankRun(scene,bosswalls,boss,mytank,trees,dtankarr);
		})
		
    })

	function init () {
		//本坦克归位
		$(".tank").css({
		left:"358px",top:"362px",display:"block"
		});
		$(".boss").css({display:"block"});
		//销毁敌坦克
		if($(".dtank").length!==0){
		  $(".dtank").remove();
		}
	}
	function initData () {
		//获得一下当前的关卡数
		$(window).data("guanka",!$(window).data("guanka")?1:$(window).data("guanka"));
	    //敌坦克的速度
		$(window).data("dspeed",3);
		//敌坦克的数量
		$(window).data("dnum",1);
		//敌坦克子弹的速度
		$(window).data("dshellspeed",10);
		//递增频率
		var level=$(window).data("level");
		if(!$(window).data("step")){
		    if(level=="ease"){
			  $(window).data("step",1);
			}else	if(level=="normal"){
				$(window).data("step",2);
			}else	if(level=="hard"){
			   $(window).data("step",3);
			}
		}
	}
})

function replay () {
	clearInterval(dtankarr.t1);
	clearInterval(dtankarr.t2);
	clearInterval(dtankarr.t3);
	clearInterval(dtankarr.t4);
	clearInterval(dtankarr.t5);
	clearInterval(dtankarr.t6);
	clearInterval(dtankarr.t7);
	$(".backmask").animate({opacity:1},1000);
	$(".agian").css({
	left:($(window).width()-635)/2,
	top:-470,
	display:"block"
	}).animate({top:($(window).height()-470)/2},500);
}

function next () {
    clearInterval(dtankarr.t1);
	clearInterval(dtankarr.t2);
	clearInterval(dtankarr.t3);
	clearInterval(dtankarr.t4);
	clearInterval(dtankarr.t5);
	clearInterval(dtankarr.t6);
	clearInterval(dtankarr.t7);
    $(".backmask").animate({opacity:1},1000);
	for (var i=0; i<dtankarr.length; i++) {
		dtankarr[i].data("shell").remove();
		dtankarr[i].remove;
		dtankarr[i]=null;
	}
	dtankarr.length=0;
	$(".mask").unbind();
	$(document).unbind();
    $(".next").css({
	left:($(window).width()-635)/2,
	top:-470,
	display:"block"
	}).animate({top:($(window).height()-470)/2},500);
	$(window).data("guanka",$(window).data("guanka")+1);
	dtankarr.next=false;
}
