// ==UserScript==
// @name         网易云逆序器初始化
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  将当前歌单的歌曲以逆序加入另一个歌单
// @author       hiroi-sora
// @match        https://music.163.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=163.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("逆序器初始化1：脚本加载")

    // 默认操作间隔时间，毫秒
    var defaultIntervalTime=100;
    // 默认查看消息间隔，毫秒
    var defaultMsgTime=10;
    // 默认查看消息最大次数
    var defaultMsgTimes=100;
    // 默认失败重试起始延时
    const defaultErrWaitTime=15000;
    // 默认失败重试延时增幅
    const defaultErrWaitTimeAdd=5000;
    // 等待元素加载 探测间隔
    const waitLoadInterval=50;
    // 等待元素加载 探测次数
    const waitLoadTimes=200;

    // iframe，动态获取
    var contentFrame;


    // 通过xpath获取节点
    const getNodeXpath=(xpath,document,contextNode=null)=>{
        if(contextNode==null) contextNode=document;
        let xresult=document.evaluate(xpath, contextNode, null, XPathResult.ANY_TYPE, null);
        let xnodes=[],xres;
        while (xres=xresult.iterateNext()) { xnodes.push(xres); }
        return xnodes;
    }

    // 反复执行getFunc直到返回非false，然后执行workFunc
    const tryFunc=(getFunc,workFunc)=>{
        // 执行第一次
        const data=getFunc();
        if(data){ // 空数组是true，因此workFunc内要先将空数组转布尔
            workFunc(data);
            return;
        }
        // 反复尝试执行
        let nowTimes=1; // 尝试次数
        let timer=setInterval(()=>{
            const data=getFunc();
            if(data){
                console.log("    尝试：成功，次数"+nowTimes)
                clearInterval(timer);
                workFunc(data);
            }
            else if(++nowTimes>waitLoadTimes){ // 超过次数
                console.log("    尝试：失败次数超限。"+getFunc)
                clearInterval(timer);
            }
        },waitLoadInterval);
    }

    // 等待xpath元素加载，成功则执行func
    const waitLoadXpath=(xpath,document,func,contextNode=null)=>{
        const getNode=()=>{
            const node=getNodeXpath(xpath,document,contextNode);
            return node.length==0?false:node; // 空数组转布尔
        }
        tryFunc(getNode,func);
    }

    // 初始化
    const init=()=>{
        // 1.尝试获取contentFrame
        const getContentFrame=()=>{
            try {
                return window.frames.contentFrame.document;
            }
            catch(err){
                return false
            }
        }
        const workFunc=(f)=>{
            contentFrame=f;
            console.log("逆序器初始化2：获取contentFrame");
            // 2.尝试获取按钮板
            const btnsWorkFunc=(node)=>{
                console.log("逆序器初始化3：获取按钮板");
                // 3.添加按钮和监听按钮被移除
                const btnsNode=node[0];
                const addMyBtn=()=>{
                    if(getNodeXpath('//*[@id="flag_reverse"]',contentFrame).length!=0){
                        return; // 检查按钮是否已存在，是则不再添加
                    }
                    console.log("逆序器初始化4：添加按钮")
                    let btn=document.createElement("div");
                    btn.innerHTML='<a id="flag_reverse" class="u-btni u-btni-fav u-btni-fav-dis1"><i>逆序</i></a>';
                    btn.onclick=readyReverseSongList;
                    btnsNode.appendChild(btn);
                }
                addMyBtn(); // 添加一次
                // 配置监听按钮板变化，若按钮被移除则再次添加
                btnsNode.addEventListener('DOMSubtreeModified', ()=>addMyBtn(), false);
                readyReverseSongList() // todo:test
            }
            waitLoadXpath('//*[@class="btns f-cb"]',contentFrame,btnsWorkFunc)
        }
        tryFunc(getContentFrame,workFunc);
    }
    init();

    // 前期准备
    const readyReverseSongList=()=>{
        // 1.获取并按下第一首歌的收藏按钮
        const btnsWorkFunc=(node)=>{
            console.log("逆序器准备1：获取第一首歌按钮");
            node[0].click();
            // 2.删除“+新歌单”栏
            const newListNode=getNodeXpath('//div[@class="zcnt"]/div/div[@class="tit j-flag"]',contentFrame)
            if(newListNode.length){
                console.log("逆序器准备1.1：删除“+新歌单”栏");
                newListNode[0].remove();
            }
            const addSongListClickListener=(songListNode)=>{
                console.log("逆序器准备2：为每个歌单栏添加监听器");
                console.log(songListNode);
                // TODO!!!
            }
            waitLoadXpath('//div[@class="zcnt"]/div/div[@class="j-flag"]/ul/li',contentFrame,addSongListClickListener)
        }
        waitLoadXpath("//tbody/tr[1]/td[3]/div/span[1]",contentFrame,btnsWorkFunc)
    }

    return; // 旧===================================================================

    // 执行逆序添加歌曲
    const goReverseSongList=(listIndex)=>{
        // 所有的添加歌单按钮
        const addNodes=getNodeXpath("/html/body/div[3]/div/div[2]/div/div[2]/div/div[1]/table/tbody/tr/td[3]/div/span[1]",window.frames.contentFrame.document);
        if(addNodes.length===0) return;
        const aLen=addNodes.length;

        const inteTime=prompt("将把"+aLen+"首歌曲逆序导入第"+(listIndex+1)+"个歌单，点击“确认”开始任务。\n任务过程中请不要操作页面，耐心等待。\n任务间隔（毫秒）：",defaultIntervalTime)
        if(inteTime==null||isNaN(inteTime)) return; // 点了取消，或数值非数字
        const intervalTime=Number(inteTime);

        var errWaitTime=defaultErrWaitTime; // 每失败一次，等待时间增加

        const findMsg=(songIndex,timers=1)=>{
            if(timers>defaultMsgTimes){
                alert("任务失败，未探测到添加弹窗");
                return;
            }
            const msgNodes=getNodeXpath('//*[@class="sysmsg"]/span/text()',window.frames.contentFrame.document);
            if(msgNodes.length==0){ // 未探测到，继续探测
                setTimeout(()=>{findMsg(songIndex,timers+1)},defaultMsgTime);
            }
            else{
                const msg=msgNodes[0].data;
                if(msg=="收藏成功"||msg=="歌曲已存在！"){
                    console.log("第"+(songIndex+1)+"/"+aLen+"添加成功");
                    errWaitTime=defaultErrWaitTime;
                    setTimeout(()=>{addSong(songIndex+1)},intervalTime); // 添加下一首
                }else{
                    console.log("第"+(songIndex+1)+"/"+aLen+"添加失败，msg："+msg);
                    console.log("    将在"+errWaitTime+"毫秒后重试");
                    setTimeout(()=>{addSong(songIndex)},(intervalTime+errWaitTime)); // 重试添加本首
                    errWaitTime+=defaultErrWaitTimeAdd;
                }
            }
        }

        const addSong=(songIndex)=>{ // 添加歌，传入起始位置
            if(songIndex>aLen-1){
                alert("任务完成。");
                return;
            }
            // 点击添加，点击目标歌单
            addNodes[songIndex].click();
            const goSongListNodes=getNodeXpath("/html/body/div[9]/div[2]/div/div/ul/li",window.frames.contentFrame.document);
            goSongListNodes[listIndex].click();
            // 探测成功与否
            setTimeout(()=>{findMsg(songIndex,1)},defaultMsgTime);
        }
        setTimeout(()=>{addSong(1)},intervalTime);
    }

    // 获取将保存到的歌单
    const getTargetSongList=()=>{
        // 所有歌曲节点
        const songNodes=getNodeXpath("/html/body/div[3]/div/div[2]/div/div[2]/div/div[1]/table/tbody/tr",window.frames.contentFrame.document);
        if(songNodes.length===0) return;
        // const songNodesRE=songNodes.reverse();
        // 点击第一首的收藏
        const favNode=getNodeXpath("td[3]/div/span[1]",window.frames.contentFrame.document,songNodes[0])[0];
        favNode.click();
        // 选歌单面板
        const getSelectList=()=>{
            const selectListNode=getNodeXpath("/html/body/div[9]",window.frames.contentFrame.document);
            if(selectListNode.length>0){ // 获取成功
                // 删除添加新歌单的节点
                const addListNode=getNodeXpath("/html/body/div[9]/div[2]/div/div[1]",window.frames.contentFrame.document)[0];
                if(addListNode.classList.contains('tit')){ addListNode.remove(); }
                // 获取点击的新歌单
                const goSongListNodes=getNodeXpath("/html/body/div[9]/div[2]/div/div/ul/li",window.frames.contentFrame.document);
                const goL=goSongListNodes.length;
                // 添加事件
                for(let i=0;i<goL;i++){
                    goSongListNodes[i].addEventListener("click",goReverseSongList.bind(this,i));
                }
            }
        }
        setTimeout(getSelectList, 50);
    }

    // 等页面加载完后开始执行初始化
    window.onload=function(){
        waitLoadXpath('//*[@class="btns f-cb"]',window.frames.contentFrame.document,testFun);
        // 添加按钮
        const addBtn=()=>{
            // let btnsNode=getNodeXpath("/html/body/div[3]/div/div[2]/div/div[1]/div[1]/div/div[2]/div/div[3]",window.frames.contentFrame.document);
            let btnsNode=getNodeXpath("/html/body/div[3]/div/div[2]/div/div[1]/div[1]/div/div[2]/div/div[2]",window.frames.contentFrame.document);
            if(btnsNode.length===0){
                btnsNode=getNodeXpath("/html/body/div[3]/div[1]/div/div/div[1]/div[2]/div/div[2]",window.frames.contentFrame.document);
            }
            if(btnsNode.length===0) return;
            else btnsNode=btnsNode[0];
            let btn=document.createElement("div");
            btn.innerHTML='<a id="flag_reverse" class="u-btni u-btni-fav u-btni-fav-dis1"><i>逆序</i></a>'; // u-btni u-btni-fav data-res-action="fav"
            btn.onclick=function(event){
                getTargetSongList();
            };
            btnsNode.appendChild(btn);
        };
        addBtn();
    };
})();