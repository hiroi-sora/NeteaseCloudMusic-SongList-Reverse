// ==UserScript==
// @name         网易云歌单逆序
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

    // 通过xpath获取节点
    const getNodeXpath=(xpath,document,contextNode=null)=>{
        if(contextNode==null) contextNode=document;
        let xresult=document.evaluate(xpath, contextNode, null, XPathResult.ANY_TYPE, null);
        let xnodes=[],xres;
        while (xres=xresult.iterateNext()) { xnodes.push(xres); }
        return xnodes;
    }

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
                    console.log("第"+(songIndex+1)+"/"+aLen+"添加成功")
                    errWaitTime=defaultErrWaitTime;
                    setTimeout(()=>{addSong(songIndex+1)},intervalTime); // 添加下一首
                }else{
                    console.log("第"+(songIndex+1)+"/"+aLen+"添加失败，msg："+msg)
                    console.log("    将在"+errWaitTime+"毫秒后重试")
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
        // 添加按钮
        const addBtn=()=>{
            let btnsNode=getNodeXpath("/html/body/div[3]/div/div[2]/div/div[1]/div[1]/div/div[2]/div/div[3]",window.frames.contentFrame.document);
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