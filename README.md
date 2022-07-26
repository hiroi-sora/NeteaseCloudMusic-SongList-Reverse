# 网易云歌单逆序器

这是一个油猴脚本。在网页版网易云音乐中，指定一个源歌单，将其中歌曲逆序加入新歌单。

## 安装方法

1. 您的浏览器需要事先安装好 [油猴（Tampermonkey）](https://www.tampermonkey.net/index.php) 插件。
2. 点击这里安装 [网易云歌单逆序脚本](https://github.com/hiroi-sora/NeteaseCloudMusic-SongList-Reverse/raw/main/%E7%BD%91%E6%98%93%E4%BA%91%E6%AD%8C%E5%8D%95%E9%80%86%E5%BA%8F.user.js) 。
3. 或者[从greasyfork安装](https://greasyfork.org/en/scripts/448475-%E7%BD%91%E6%98%93%E4%BA%91%E6%AD%8C%E5%8D%95%E9%80%86%E5%BA%8F%E5%99%A8)

## 使用方法

1. 假设源歌单 `纯音乐` 想要逆序。先在网易云里创建一个空歌单 `纯音乐-逆序` 。
2. 浏览器 [登陆网易云音乐账号](https://music.163.com/#/login)，然后打开 `纯音乐` 歌单的页面。
可以从[我的音乐](https://music.163.com/#/my/m/music)进入：
![image7efe68d0eaa8ad15.png](https://tupian.li/images/2022/07/25/image7efe68d0eaa8ad15.png)
或者客户端分享→复制链接→粘贴到浏览器：
![image80ca3befc39f8adf.png](https://tupian.li/images/2022/07/26/image80ca3befc39f8adf.png)
由于网易云网页端的限制，非本人创建的歌单只显示前20首歌。若想逆序一个别人的歌单，需要先在客户端，全选其中歌曲→添加到某个自己的歌单，再返回网页操作。
3. 点击“**逆序**”按钮。这个按钮会在页面加载完毕后才出现。
如果一直没有这个按钮，或者切换了歌单，尝试刷新页面。
4. 在弹窗中，选择空歌单 `纯音乐-逆序` 。
![image1ef3fe04c4cb6962.png](https://tupian.li/images/2022/07/26/image1ef3fe04c4cb6962.png)
5. 任务开始，脚本会不断将 `纯音乐` 中的音乐添加到 `纯音乐-逆序` ，请耐心等待。由于网易云的反爬虫限制，每连续自动添加约90首歌后会出现添加失败。脚本会延时后重试，一般60s后可以继续任务。除非网络问题，放着不管它就行，总能跑完。版权爆破无法添加新歌单的歌曲，脚本会跳过。
6. 可以按F12打开控制台查看当前进度。
7. 如果你想中断任务，请刷新或关闭页面。
![image41d76ba175ae03eb.png](https://tupian.li/images/2022/07/25/image41d76ba175ae03eb.png)
