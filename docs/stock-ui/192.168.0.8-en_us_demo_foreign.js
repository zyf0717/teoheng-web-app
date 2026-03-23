var showPage = 'mainmenu' //定义为全局变量
// adam目的为了处理youtube预览全局变量：记录当前播放的歌曲信息
var currentPlayingSong = null;
//主菜单点击
function OnMainMenuClick(index) {
  $('#home').show()
  $('#back').show()
  // adam 关闭swiper bannner
  document.getElementById('bannerswiper').style.display = 'none'
  //  var showPage = "mainmenu";

  switch (index) {
    case 1: //搜索
      $('#home_title').text('song')
      //清除条件

      SetSearchParams('', '', '', '')
      showPage = 'search-page'
      OnSearchClick()
      break
    case 2:
      $('#home_title').text('singer')
      //指定swiper初始位置
      $('.swiper-slide').removeClass('on')
      $('#singertype_all').addClass('on')
      swiper_singer.slideTo(0, 1000, false)
      mSingerId = 'singertype_all' //默认选中全部歌星
      //清除条件
      genderType = 0
      mTopSinger = ''
      showPage = 'singer-search'
      OnSingerSearchClick()
      break
    case 3:
      $('#home_title').text('ranking')
      showPage = 'top-search'
      break
    case 4:
      showPage = 'lang-search'
      break
    case 5:
      $('#home_title').text('type') /////
      showPage = 'song-type'
      break
    case 6:
      showPage = 'disk-search'
      ToSearchDiskSong(0)
      break
    //    case 7:
    //      showPage = 'collect-search'
    //      ToSearchCollectSong(0)
    //      break
  }

  ShowNextPage('mainmenu', showPage)
}

//---------------------------底部菜单操作------------------------------------

//底部菜单点击
function OnNavMenuClick(index) {
  document.getElementById('bannerswiper').style.display = 'none'
  switch (index) {
    case 1:
      OnHistoryBack() //先执行页面返回

      $('#home_title').text('selected')
      if (PageList.length > 0) {
        var currPage = PageList.pop()
        PageList.push(currPage)
        ShowNextPage(currPage, 'select-search')
      } else {
        $('#home').show()
        $('#back').show()

        ShowNextPage('mainmenu', 'select-search')
      }
      mSelectType = 1 //记录已点
      TopSelectListSearch(2)
      break
    case 2:
      OnHistoryBack() //先执行页面返回

      $('#home_title').text('sung')
      if (PageList.length > 0) {
        var currPage = PageList.pop()
        PageList.push(currPage)
        ShowNextPage(currPage, 'select-sung-search')
      } else {
        $('#home').show()
        $('#back').show()

        ShowNextPage('mainmenu', 'select-sung-search')
      }
      mSelectType = 2 //记录已唱
      TopSelectListSearch(2)
      break
    case 3:
      OnHomePage()
      break
    case 4:
      OnHistoryBack() //先执行页面返回

      $('#home_title').text('like')
      if (PageList.length > 0) {
        var currPage = PageList.pop()
        PageList.push(currPage)
        ShowNextPage(currPage, 'collect-search')
      } else {
        $('#home').show()
        $('#back').show()

        ShowNextPage('mainmenu', 'collect-search')
      }
      mSelectType = 3 //记录已点
      TopSelectListSearch(3)
      break
  }
}
function SendCommand(cmd, cmdValue, cloud) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'CommandServlet', //请求的url地址
    data: { cmd: cmd, cmdValue: cmdValue }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnCommandSucc(data, cloud)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}
//发送指令
function SendCommandYb(cmd, cmdValue, cloud, vid, songname, singer) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'CommandServlet', //请求的url地址
    data: { cmd: cmd, cmdValue: cmdValue, vid: vid, songname: songname, singer: singer }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnCommandSucc(data, cloud)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}

//--------------------------------已点查找-----------------------------------

//请求返回处理
function OnCommandSucc(data, cloud) {
  var cmd = data.cmd
  if (cmd == 'Skip') {
    ShowTips('Next', 1000)
  } else if (cmd == 'Add1' || cmd == 'Add') {
    if (cloud == '1') {
      ShowTips('Downloading', 1000)
    } else {
      ShowTips('Selected', 1000)
    }
  } else if (cmd == 'Pro1' || cmd == 'Pro2') {
    if (cloud == '1') {
      ShowTips('Downloading', 1000)
    } else {
      ShowTips('Top', 1000)
    }
  } else if (cmd == 'Del1') {
    ShowTips('Del', 1000)
  } else if (cmd == 'SelReplay') {
    ShowTips('Repeat', 1000)
  } else if (cmd == 'Reset') {
    ShowTips('Repeat', 1000)
  } else if (cmd == 'Play') {
    ShowTips('Pause', 1000)
  } else if (cmd == 'MuOr') {
    ShowTips('Vocals', 1000)
  }
  //ShowTips("操作成功!", 1000);
}

var mSelectType = 1
//已点歌曲查找
function TopSelectListSearch(click) {
  if (mSelectType == 1) {
    //是否在当时界面
    var onSelectPage = $('#select-search').is(':visible')

    $.ajax({
      type: 'GET', //请求方式
      url: 'PlaylistServlet', //请求的url地址
      data: { onSelectPage: onSelectPage, click: click, type: mSelectType }, //参数值
      dataType: 'jsonp', //返回格式为json
      jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
      success: function (data) {
        OnSelectListSucc(data)
      },
    })
  } else {
    TopSelectSungListSearch(click)
  }
}

//已唱歌曲查找
function TopSelectSungListSearch(click) {
  //是否在当时界面
  var onSelectPage = $('#select-sung-search').is(':visible')

  $.ajax({
    type: 'GET', //请求方式
    url: 'PlaylistServlet', //请求的url地址
    data: { onSelectPage: onSelectPage, click: click, type: mSelectType }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnSelectSungListSucc(data)
    },
  })
}

//已点歌曲数据返回
function OnSelectListSucc(jsonData) {
  $('#play-size').text('已点(' + jsonData.number + ')')

  //是否在当时界面
  var stayHere = $('#select-search').is(':visible')

  //不做修改
  if (!(stayHere && jsonData.hasChange == 'true')) {
    return
  }

  //div节点
  var div_parent = $('#select-list')

  //移除所有
  var li_item = div_parent.find('li')[0]
  div_parent.empty()
  div_parent.append(li_item)

  var SongPlayList = eval(jsonData.songList)

  //加入显示列表
  for (var index in SongPlayList) {
    var Song = SongPlayList[index]

    //替换模板
    var strText = $('#select-item').html()
    strText = strText.replace('1.SongName', '' + Song.sONGNAME)
    strText = strText.replace('1.Singer', '' + Song.sINGER)
    strText = strText.replace(
      'DelSongInList(id)',
      "SendCommand('Del1', '" + Song.xH + "')"
    )
    strText = strText.replace(
      'SetToNextPlay(id)',
      "SendCommand('Pro2', '" + Song.xH + "')"
    )

    //添加新的基
    div_parent.append('<li>' + strText + '</li>')
  }
}

//已唱歌曲数据返回
function OnSelectSungListSucc(jsonData) {
  $('#play-size').text('已唱(' + jsonData.number + ')')

  //是否在当时界面
  var stayHere = $('#select-sung-search').is(':visible')

  //不做修改
  if (!(stayHere && jsonData.hasChange == 'true')) {
    return
  }

  //div节点
  var div_parent = $('#select-sung-list')

  //移除所有
  var li_item = div_parent.find('li')[0]
  div_parent.empty()
  div_parent.append(li_item)

  var SongPlayList = eval(jsonData.songList)

  //加入显示列表
  for (var index in SongPlayList) {
    var Song = SongPlayList[index]

    //替换模板
    var strText = $('#select-sung-item').html()
    strText = strText.replace('1.SongName', '' + Song.sONGNAME)
    strText = strText.replace('1.Singer', '' + Song.sINGER)
    strText = strText.replace(
      'SungReplay(id)',
      "SendCommand('SelReplay', '" + Song.xH + "')"
    )

    //添加新的基
    div_parent.append('<li>' + strText + '</li>')
  }
}

//--------------------------------歌曲查找-----------------------------------

//分页数据
var mSearchPage = 0,
  mSearchMaxPage = 0
//搜索条件
var mSinger = '',
  mSongType = '',
  mSongLang = ''
var mSortType = ''

//设置歌曲语种
function SetSongLang(index) {
  mSongLang = index
  OnSearchClick()
}

//重置搜索条件
function SetSearchParams(singer, songType, songLang, sortType) {
  mSinger = singer
  mSongType = songType
  mSongLang = songLang
  mSortType = sortType

  mSearchPage = 0
  mSearchMaxPage = 0
}

//点击搜索
function OnSearchClick() {
  //搜索条件
  var songName = $('#search-input').val()

  //搜索前初始化为0
  mSearchPage = 0
  mSearchMaxPage = 0
  ToSearchSong(songName, mSearchPage)
}

//根据歌手进行查找
function SearchBySinger(singer) {
  $('#home_title').text('' + singer)
  showPage = 'search-page' //记录当前显示的是歌曲页面
  SetSearchParams(singer, '', '', '')
  ToSearchSong('', 0)
}

//根据类别查找
function SearchBySongType(typeId, songType) {
  //alert($("#"+typeId).html());
  $('#home_title').text('' + $('#' + typeId).html())
  SetSearchParams('', songType, '', '')
  ToSearchSong('', 0)
}

//根据语种进行查找
function SearchBySongLang(songLang) {
  $('#home_title').text('' + songLang)
  SetSearchParams('', '', songLang)
  ToSearchSong('', 0)
}

//排行查找
function SearchBySortType(typeId, sortType) {
  $('#home_title').text('' + $('#' + typeId).html())
  SetSearchParams('', '', '', sortType)
  ToSearchSong('', 0)
}

//新歌排行
function SearchBySortNewSong(title, sortType) {
  // adam 关闭swiper bannner
  document.getElementById('bannerswiper').style.display = 'none'
  document.getElementById('song-navbar').style.display = 'none'
  $('#home_title').text(title)
  SetSearchParams('', '', '', sortType)
  ToSearchSong('', 0)
  //showPage = "search-page"; OnSearchClick();
  ShowNextPage('mainmenu', 'search-page')
}
function OnSearchYoutubeClick(title, sortType) {
  document.getElementById('bannerswiper').style.display = 'none'
  document.getElementById('song-navbar').style.display = 'none'
  mSearchPage = 0
  mSearchMaxPage = 0
  HandlerPaging('#search-paging', mSearchPage, mSearchMaxPage)
  $('#home_title').text(title)
  SetSearchParams('', '', '', sortType)
  //    ToSearchSong("", 0);
  //showPage = "search-page"; OnSearchClick();
  // ADAM设置默认搜索词
  var defaultSearchTerm = 'popular songs';
  $('#search-input').val(defaultSearchTerm);
  ShowNextPage('mainmenu', 'search-page')
  // 触发搜索
  OnSearchYbClick();
}

function OnLoginClick() {
  //搜索条件
  var username = $('#username').val()
  var password = $('#password').val()
  if (username != '' && password != '') {
    //    ShowTips(password, 500)
    //    OnNavMenuClick(4)
    $.ajax({
      type: 'GET', //请求方式
      url: 'LoginServlet', //请求的url地址
      data: { username: username, password: password }, //参数值
      dataType: 'jsonp', //返回格式为json
      jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
      success: function (data) {
        if (data.success) {
          // 登录成功，关闭模态框
          //          $('#loginModal').hide()
          document.getElementById('loginModal').style.display = 'none'
          loginUserName = username
          loginPassWord = password
          ShowTips('Login successful', 500)
          OnHomePage()
        } else {
          $('#loginMessage').text(data.message)
        }
      },
      error: function (xhr, status, error) {
        // 请求失败，显示错误信息-->
        $('#loginMessage').text(error)
      },
    })
  }
}

var loginUserName = ''
var loginPassWord = ''
// adam弹出登录窗口，验证成功后给出用户名，方便拿用户名去查询收藏歌曲，弹出模态框
function SearchByCollectSong(title, sortType) {

  // adam 关闭swiper bannner
  if (loginUserName === '') {
    ShowTips("Please log in first!", 1000);
  } else {
    document.getElementById('bannerswiper').style.display = 'none'
    document.getElementById('song-navbar').style.display = 'none'
    document.getElementById('search-item').style.display = 'none'
    $('#home_title').text(title)
    SetSearchParams('', '', '', sortType)
    ToSearchSongCollect();
    //showPage = "search-page"; OnSearchClick();
    ShowNextPage('mainmenu', 'search-page')
  }
}

function ToSearchSongCollect(songName, page) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'SearchServletCollect', //请求的url地址
    data: {
      username: loginUserName,
      password: loginPassWord,
    }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnSearchSucc(data)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}
//adam banner 滚动图片查询
function SearchBySortBanner(title, songType) {
  document.getElementById('bannerswiper').style.display = 'none'
  document.getElementById('song-navbar').style.display = 'none'
  document.getElementById('search-item').style.display = 'none'
  // adam 关闭swiper bannner
  // alert($("#"+title).html());
  $('#home_title').text(title)
  // $("#home_title").text(title);
  // SetSearchParams("", "", "", sortType); ToSearchSong("", 0);
  SetSearchParams('', '', '', '')
  ToSearchSongBanner(songType, 0)
  //showPage = "search-page"; OnSearchClick();
  ShowNextPage('mainmenu', 'search-page')
}
function ToSearchSongBanner(songType, page) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'SearchServletBanner', //请求的url地址
    data: {
      songType: songType,
      page: page,
    }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnSearchSucc(data)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}
//adam 收藏歌曲



//点击搜索
function ToSearchSong(songName, page) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'SearchServlet', //请求的url地址
    data: {
      songName: songName,
      songType: mSongType,
      singer: mSinger,
      lang: mSongLang,
      sortType: mSortType,
      page: page,
    }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnSearchSucc(data)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}
//点击搜索

function ToSearchSongYb(songName, page) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'SearchServletYb', //请求的url地址
    data: {
      songName: songName,
    }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnSearchSuccYb(data)
    },
    error: function (data, status, code) {
      //请求出错处理
      ShowTips('Network anomaly', 500)
    },
  })
}
//收藏歌曲搜索
//点击搜索

//上一页
function OnPrevPageClick() {
  ToSearchNextPage(mSearchPage, mSearchMaxPage, false, true)

  ToSingerNextPage(mSingerPage, mSingerMaxPage, false, true)

  ToDiskNextPage(mDiskPage, mDiskMaxPage, false, true)
}

//下一页
function OnNextPageClick() {
  ToSearchNextPage(mSearchPage, mSearchMaxPage, true, true)

  ToSingerNextPage(mSingerPage, mSingerMaxPage, true, true)

  ToDiskNextPage(mDiskPage, mDiskMaxPage, true, true)
}

//搜索上一页下一页
function ToSearchNextPage(currPage, maxPage, showNext, showLoading) {
  //是否在搜索页
  if (!$('#search-page').is(':visible')) return

  var nextPage = showNext ? currPage + 1 : currPage - 1

  if (nextPage >= 0 && nextPage < maxPage) {
    if (showLoading) {
       $.mobile.loading('show', {
        text: '',
        textVisible: false,
        theme: 'a',
        html: '<div class="simple-loader"></div>'
      })
    }

    //搜索条件
    var songName = $('#search-input').val()

    ToSearchSong(songName, nextPage)
  }
}

//搜索成功
function OnSearchSucc(jsonData) {
  var currPage = PageList.pop()
  PageList.push(currPage)
  ShowNextPage(currPage, 'search-page')

  var div_parent = $('#listview')

  //移除所有
  var liitem = div_parent.find('li')[0]
  div_parent.empty()
  div_parent.append(liitem)

  mSearchPage = parseInt(jsonData.page)
  mSearchMaxPage = parseInt(jsonData.maxPage)

  //处理分页
  HandlerPaging('#search-paging', mSearchPage, mSearchMaxPage)

  //显示歌曲列表数据
  var starIndex = mSearchPage * parseInt(jsonData.number) + 1
  var SongList = eval(jsonData.songList)

  for (var index in SongList) {
    var Song = SongList[index]

    //替换模板
    var strText = $('#listitem').html()
    strText = strText.replace('1.SongName', '' + Song.sONGNAME)
    if (Song.cLOUD == '1') {
      strText = strText.replace('1.CLOUD', '(云)')
    } else {
      strText = strText.replace('1.CLOUD', '')
    }
    strText = strText.replace('1.Singer', '' + Song.sINGER)
    strText = strText.replace(
      /AddToPlayList\(id\)/g,
      "SendCommand('Add1', '" + Song.sONGBM + "', '" + Song.cLOUD + "')"
    )
    strText = strText.replace(
      'SetToNextPlay(id)',
      "SendCommand('Pro1', '" + Song.sONGBM + "', '" + Song.cLOUD + "')"
    )
    //strText = strText.replace(
    //  "openPlayWindow('{songBM}')",
    //  "openPlayWindow('"+ Song.sONGBM+ "', '" +Song.sONGNAME+ "', '" +Song.sINGER+ "')"
    //);

    //    if (Song.cLOUD == '1') {
    //        ShowTips("准备下载歌曲!")
    //        SendCommand('Add1',   Song.sONGBM ,  Song.cLOUD );
    //    }else{
    strText = strText.replace(
      "openPlayWindow('{songBM}')",
      "openPlayWindow('" + Song.sONGBM + "', '" + Song.sONGNAME + "', '" + Song.sINGER + "', '" + Song.cLOUD + "')");
    //    }

    // 添加歌手图片处理逻辑

    // 修改这里：使用 Song.picture 值替换默认图片
  // ... existing code ...
    // 添加歌手图片处理逻辑

    // 获取基础URL
    var baseUrl = window.location.origin;
  
    // 修改这里：使用 Song.picture 值替换默认图片
    if (Song.picture && Song.picture !== '') {
      strText = strText.replace('singer/singer_photo.png', Song.picture)
    } else if (Song.sINGERPIC && Song.sINGERPIC !== '') {
      var singerPhotoPath = baseUrl + '/singer/'  + encodeURIComponent(Song.sINGERPIC);
      strText = strText.replace('singer/singer_photo.png', singerPhotoPath)
    } else {
      // 如果没有sINGERPIC，则随机选择一张默认图片（使用完整URL路径）
      var randomIndex = Math.floor(Math.random() * 10);
      var randomImagePath = baseUrl + '/singer/singer_photo' + randomIndex + '.png';
      strText = strText.replace('singer/singer_photo.png', randomImagePath);
    }

  

// ... existing code ...
    //添加新的基
    div_parent.append('<li>' + strText + '</li>')
  }

  Topfun()

  $.mobile.loading('hide')
}
//搜索成功
function OnSearchSuccYb(jsonData) {
  var currPage = PageList.pop()
  PageList.push(currPage)
  ShowNextPage(currPage, 'search-page')

  var div_parent = $('#listview')

  //移除所有
  var liitem = div_parent.find('li')[0]
  div_parent.empty()
  div_parent.append(liitem)

  mSearchPage = parseInt(jsonData.page)
  mSearchMaxPage = parseInt(jsonData.maxPage)

  //处理分页
  HandlerPaging('#search-paging', mSearchPage, mSearchMaxPage)

  //显示歌曲列表数据
  var starIndex = mSearchPage * parseInt(jsonData.number) + 1
  var SongList = eval(jsonData.songList)

  for (var index in SongList) {
    var Song = SongList[index]

    //替换模板
    var strText = $('#listitem').html()
    strText = strText.replace('1.SongName', '' + Song.sONGNAME)
    if (Song.cLOUD == '1') {
      strText = strText.replace('1.CLOUD', '(CLOUD)')
    } else {
      strText = strText.replace('1.CLOUD', '')
    }
    strText = strText.replace('1.Singer', '' + Song.sINGER)
    strText = strText.replace(
      /AddToPlayList\(id\)/g,
      "SendCommandYb('Add1', '" + Song.sONGBM + "', '" + Song.cLOUD + "', '" + Song.sONGVID + "', '" + Song.sONGNAME + "', '" + Song.sINGER + "')"
    )
    strText = strText.replace(
      'SetToNextPlay(id)',
      "SendCommandYb('Pro1', '" + Song.sONGBM + "', '" + Song.cLOUD + "', '" + Song.sONGVID + "', '" + Song.sONGNAME + "', '" + Song.sINGER + "')"
    )
  // 修改openPlayWindow调用，添加sONGVID参数
    strText = strText.replace(
      "openPlayWindow('{songBM}')",
      "openPlayWindow('" + Song.sONGBM + "', '" + Song.sONGNAME + "', '" + Song.sINGER + "', '" + Song.cLOUD + "', '" + Song.sONGVID + "')"
    );
 // 添加歌手图片处理逻辑，确保图片标签显示"SINGERPIC"
     // 优化代码，直接使用sINGERPIC字段作为图片src值
    if (Song.sINGERPIC && Song.sINGERPIC !== '') {
      strText = strText.replace('src="singer/singer_photo.png"', 'src="' + Song.sINGERPIC + '" alt="SINGERPIC"')
    } else {
      // 如果没有sINGERPIC字段，则使用默认图片但添加alt标签
      strText = strText.replace('src="singer/singer_photo.png"', 'src="singer/singer_photo.png" alt="SINGERPIC"')
    }


    //添加新的基
    div_parent.append('<li>' + strText + '</li>')
  }

  Topfun()

  $.mobile.loading('hide')
}
//处理分页
function HandlerPaging(pagename, currPage, maxPage) {
  var paging = $(pagename)

  if (maxPage > 0) {
    paging.show()
  } else {
    paging.hide()
  }

  var parent = pagename.replace('paging', '')

  $(parent + 'currpage').text('' + (currPage + 1))
  $(parent + 'maxpage').text(' / ' + maxPage + '      ')

  paging.find('div').removeClass('ui-state-disabled')
  paging.find('div').addClass('ui-state-disabled')

  if (currPage > 0) {
    $(parent + 'prevpage')
      .find('div')
      .removeClass('ui-state-disabled')
  }

  if (currPage < maxPage - 1) {
    $(parent + 'nextpage')
      .find('div')
      .removeClass('ui-state-disabled')
  }
}

//--------------------------------歌手查找------------------------------------

//默认类型
var genderType = 0,
  areaType = 0,
  mSingerPage = 0,
  mSingerMaxPage = 0
var mSinger = '',
  mSingerType = '',
  mSingerSortType = '',
  mSingerCurrentPage = -1

//设置歌手类型
function SetSingerType(index) {
  genderType = index
  OnSingerSearchClick()
}

//设置区域类型
function SetAreaType(index) {
  areaType = index
  OnSingerSearchClick()
}

//获取搜索类型
function GetSingerType(type1) {
  switch (type1) {
    case 0:
      return '全部'
      break
    case 1:
      return '大陆'
      break
    case 2:
      return '港台'
      break
    case 3:
      return '英语'
      break
    case 4:
      return '日本'
      break
    case 5:
      return '韩国'
      break
    case 6:
      return '越南'
      break
    case 7:
      return '柬埔寨'
      break
    case 8:
      return '印度'
      break
    case 9:
      return '泰国'
      break
    case 10:
      return '菲律宾'
      break
    case 11:
      return '马来西亚'
      break
    case 12:
      return '缅甸'
      break
    case 13:
      return '印尼'
      break
    case 14:
      return '老挝'
      break
    case 15:
      return '俄罗斯'
      break
    case 16:
      return '法国'
      break
    case 17:
      return '其他'
      break
  }
}

//查找歌手列表
function OnSingerSearchClick() {
  ; (mSingerPage = 0), (mSingerMaxPage = 0)

  //搜索条件
  var singer = $('#singer-input').val()
  var singerType = GetSingerType(genderType)
  ToSearchSinger(singer, singerType, mTopSinger, mSingerPage)
}

var mTopSinger = ''

//歌手排行查找
function SearchBySingerTop(sortType) {
  mTopSinger = sortType

  ToSearchSinger('', '', sortType, 0)
}

//歌星查找
function ToSearchSinger(singer, singerType, sortType, page) {
  if (
    mSinger != singer ||
    mSingerType != singerType ||
    sortType != mSortType ||
    page != mSingerCurrentPage
  ) {
    mSinger = singer
    mSingerType = singerType
    mSortType = sortType
    mSingerCurrentPage = page

    $.ajax({
      type: 'GET', //请求方式
      url: 'SingerServlet', //请求的url地址
      data: {
        singer: singer,
        singerType: singerType,
        sortType: sortType,
        page: page,
      }, //参数值
      dataType: 'jsonp', //返回格式为json
      jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
      success: function (data) {
        OnSearchSingerSucc(data)
      },

      error: function (data, status, code) {
        //请求出错处理
        ShowTips('Network anomaly', 500)
      },
    })
  }
}

//搜索下一页歌手
function ToSingerNextPage(currPage, maxPage, showNext, showLoading) {
  //是否在搜索页
  if (!$('#singer-search').is(':visible')) return

  var nextPage = showNext ? currPage + 1 : currPage - 1

  if (nextPage >= 0 && nextPage < maxPage) {
    if (showLoading) {
     $.mobile.loading('show', {
        text: '',
        textVisible: false,
        theme: 'a',
        html: '<div class="simple-loader"></div>'
      })
    }

    //搜索条件
    var singer = $('#singer-input').val()
    var singerType = GetSingerType(genderType)

    ToSearchSinger(singer, singerType, mTopSinger, nextPage)
  }
}

//查找返回
function OnSearchSingerSucc(jsonData) {
  //是否在歌星搜索界面
  var onSingerPage = $('#singer-search').is(':visible')
  if (!onSingerPage) {
    var currPage = PageList.pop()
    PageList.push(currPage)
    ShowNextPage(currPage, 'singer-search')
  }

  //移除所有
  var liitem = $('#singer-gallery').find('li')[0]
  $('#singer-gallery').empty()
  $('#singer-gallery').append(liitem)

  //返回数据处理
  mSingerPage = parseInt(jsonData.page)
  mSingerMaxPage = parseInt(jsonData.maxPage)

  //处理分页
  HandlerPaging('#singer-paging', mSingerPage, mSingerMaxPage)

  //显示歌手列表数据
  var starIndex = mSingerPage * parseInt(jsonData.number) + 1
  var SingerList = eval(jsonData.singerList)

  for (var index in SingerList) {
    var Singer = SingerList[index]

    //替换模板
    var strText = $('#singer-gallery-item').html()
    //      strText = strText.replace("刘天王", (starIndex + parseInt(index)) + "." + Singer.name);
    strText = strText.replace('刘天王', Singer.name)
    strText = strText.replace('SingerName', Singer.name)
    strText = strText.replace('singer_photo.png', Singer.picture)

    $('#singer-gallery').append(
      '<li class="singer-gallery-item">' + strText + '</li>'
    )
  }

  Topfun()

  $.mobile.loading('hide')
}

//---------------------------------U盘歌曲搜索---------------------------------
var mDiskPage = 0,
  mDiskMaxPage = 0

//搜索U盘歌曲
function ToSearchDiskSong(page) {
  $.ajax({
    type: 'GET', //请求方式
    url: 'DiskListServlet', //请求的url地址
    data: { page: page }, //参数值
    dataType: 'jsonp', //返回格式为json
    jsonp: 'jsonpCallback', //服务端用于接收callback调用的function名的参数
    success: function (data) {
      OnDiskSearchSucc(data)
    },
  })
}

//U盘搜索返回
function OnDiskSearchSucc(jsonData) {
  var div_parent = $('#disk-listview')

  //移除所有
  var liitem = div_parent.find('li')[0]
  div_parent.empty()
  div_parent.append(liitem)

  mDiskPage = parseInt(jsonData.page)
  mDiskMaxPage = parseInt(jsonData.maxPage)

  //处理分页
  HandlerPaging('#disk-paging', mDiskPage, mDiskMaxPage)

  //显示歌曲列表数据
  var starIndex = mDiskPage * parseInt(jsonData.number) + 1
  var SongList = eval(jsonData.songList)

  for (var index in SongList) {
    var Song = SongList[index]

    //替换模板
    var strText = $('#disk-listitem').html()
    strText = strText.replace(
      '1.SongName',
      starIndex + parseInt(index) + '.' + Song.sONGNAME
    )
    strText = strText.replace('1.Singer', '' + Song.sINGER)
    strText = strText.replace(
      /AddToPlayList\(id\)/g,
      "SendCommand('Udisk_Add', '" + Song.pATH + "')"
    )
    strText = strText.replace(
      'SetToNextPlay(id)',
      "SendCommand('Udisk_Pro', '" + Song.pATH + "')"
    )

    //添加新的基
    div_parent.append('<li>' + strText + '</li>')
  }

  $.mobile.loading('hide')
}

//查找下一页数据
function ToDiskNextPage(currPage, maxPage, showNext, showLoading) {
  //是否在搜索页
  if (!$('#disk-search').is(':visible')) return

  var nextPage = showNext ? currPage + 1 : currPage - 1

  if (nextPage >= 0 && nextPage < maxPage) {
    if (showLoading) {
     $.mobile.loading('show', {
        text: '',
        textVisible: false,
        theme: 'a',
        html: '<div class="simple-loader"></div>'
      })
    }

    ToSearchDiskSong(nextPage)
  }
}

//---------------------------------界面显示操作--------------------------------

//显示的页面列表
var PageList = new Array()

//显示下一界面
function ShowNextPage(currPage, nextPage) {
  if (PageList.indexOf(nextPage) < 0) {
    $('#' + currPage).hide()
    $('#' + nextPage).show()

    PageList.push(nextPage)

    //返回时，需要重新设置标题
    if (nextPage == 'song-type') {
      $('#home_title').text('type')
    } else if (nextPage == 'top-search') {
      $('#home_title').text('ranking')
    } else if (nextPage == 'singer-search') {
      $('#home_title').text('singer')
      //指定swiper初始位置
      $('.swiper-slide').removeClass('on')
      $('#' + mSingerId).addClass('on')
    } else if (nextPage == 'search-page') {
      //歌曲页面
      //指定swiper初始位置
      $('.swiper-slide').removeClass('on')
      $('#songlang_all').addClass('on')
      swiper_songlang.slideTo(0, 1000, false)
    }
  }
}

//首页
function OnHomePage() {
  $('#home_title').text('首页')
  mSingerCurrentPage = -1 //设置歌星页码为-1，避免再次进入歌星界面不更新数据
  $('#home').show()
  $('#back').hide()
  $('#mainmenu').show()
  // adam 打开swiper banner
  document.getElementById('bannerswiper').style.display = 'block'
  document.getElementById('song-navbar').style.display = 'block'
  document.getElementById('search-item').style.display = 'block'
  //隐藏上一界面
  var topPage = PageList.pop()
  $('#' + topPage).hide()
  PageList.length = 0

  //已点搜索记录
  var divParent = $('#select-list')
  var item0 = divParent.find('li')[0]
  divParent.empty()
  divParent.append(item0)

  //已唱搜索记录
  //  var divParentSung = $("#select-sung-list");
  //  var item0Sung = divParentSung.find("li")[0];
  //  divParentSung.empty(); divParentSung.append(item0Sung);

  //移除之前搜索的记录
  var item1 = $('#listview').find('li')[0]
  $('#listview').empty()
  $('#listview').append(item1)
  $('#search-input').val('')

  //移除之前搜索的记录
  var item2 = $('#singer-gallery').find('li')[0]
  $('#singer-gallery').empty()
  $('#singer-gallery').append(item2)
  $('#singer-input').val('')
}

//点击返回
function OnHistoryBack() {
  mSingerCurrentPage = -1 //设置歌星页码为-1，避免再次进入歌星界面不更新数据
  if (PageList.length > 1) {
    var hidePage = PageList.pop()
    var showPage = PageList.pop()

    ShowNextPage(hidePage, showPage)
  } else {
    OnHomePage()
  }
}

function ShowTips(tips, time) {
  $('#showtip').text(tips)
  $('div.tipClass').fadeIn(500)

  setTimeout(function () {
    $('div.tipClass').fadeOut()
  }, time)
}

//adam修改openPlayWindow，成为直接点播该编号歌曲
function openPlayWindow(songBM, songName, singer, cLOUD, sONGVID) {
  // 直接点播歌曲，不再显示弹窗
  if (sONGVID && sONGVID !== '') {
    // YouTube 视频：使用 SendCommandYb 添加到播放列表
    SendCommandYb('Add1', songBM, cLOUD, sONGVID, songName, singer);
    ShowTips('"' + songName + '" select', 1000);
  } else {
    // 本地歌曲：使用 SendCommand 添加
    SendCommand('Add1', songBM, cLOUD);
    ShowTips('"' + songName + '" select', 1000);
  }
}

// function openPlayWindow(songBM, songName, singer, cLOUD, sONGVID) {
//   // 显示遮罩层和播放窗口
//   document.getElementById('playWindowOverlay').style.display = 'block';
//   document.getElementById('playWindow').style.display = 'block';

//   // 设置歌曲信息
//   document.getElementById('playWindowSongName').textContent = songName;
//   document.getElementById('playWindowSinger').textContent = singer;

//   // 记录当前播放的歌曲信息
//   currentPlayingSong = {
//     songBM: songBM,
//     sONGVID: sONGVID,
//     cLOUD: cLOUD,
//     songName: songName,
//     singer: singer
//   };

//   // 判断是否为YouTube视频
//   if (sONGVID && sONGVID !== '') {
//     const youtubeUrl = 'https://www.youtube.com/embed/' + sONGVID + '?autoplay=1&rel=0';
//     document.getElementById('songFrame').src = youtubeUrl;
//     document.getElementById('songFrame').setAttribute('allowfullscreen', 'true');
//     document.getElementById('songFrame').setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
//   } else {
//     if (cLOUD == '1') {
//       SendCommand('Add1', songBM, cLOUD);
//       closePlayWindow();
//       return;
//     }
//     const baseUrl = window.location.origin + window.location.pathname;
//     const playUrl = baseUrl + 'songs/' + songBM + '.mp4';
//     document.getElementById('songFrame').src = playUrl;
//   }
// }
// 关闭播放窗口
function closePlayWindow() {
  document.getElementById('playWindowOverlay').style.display = 'none';
  document.getElementById('playWindow').style.display = 'none';
  document.getElementById('songFrame').src = ''; // 停止播放
  var video = document.getElementById('songFrame');
  if (video) {
    video.pause();
    video.src = '';
  }
}
$(document).ready(function () {
  //    $("#search-input").keyup(OnSearchClick);
  $('#search-input').keyup(function () {
    // 判断当前显示的页面是否为YouTube页面（通过标题判断，也可根据实际页面标识调整）
    if ($('#home_title').text() !== 'youtube') {
      OnSearchClick()
    }
  })
  // 为搜索图标绑定点击事件，添加YouTube页面判断
  $('.img-click-seach').click(function () {
    // 判断当前页面是否为YouTube页面（标题为"youtube"）
    if ($('#home_title').text() === 'youtube') {
      OnSearchYbClick() // 仅在YouTube页面触发搜索
    }
    // 其他页面点击不执行任何操作
  })
  $('#singer-input').keyup(OnSingerSearchClick)

  //每两秒执行一次
  var runId = setInterval(TopSelectListSearch, 3000)

  $('body').on('swipeleft', OnNextPageClick)

  $('body').on('swiperight', OnPrevPageClick)

  //尝试禁止UC左右滑动
  try {
    navigator.control.gesture(false)
  } catch (e) { }
})

Array.prototype.indexOf = function (item) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == item) return i
  }
  return -1
}

//页面置顶
var four
function Topfun() {
  four = setInterval(FourscrollBy, 10)
}
function FourscrollBy(eachHeight) {
  if (document.documentElement && document.documentElement.scrollTop) {
    //IE
    if (document.documentElement.scrollTop <= 0) {
      clearInterval(four)
    } else {
      window.scrollBy(0, -30)
    }
  } else {
    //Chrome不支持documentElement.scrollTop
    if (document.body.scrollTop <= 0) {
      clearInterval(four)
    } else {
      window.scrollBy(0, -30)
    }
  }
}
function orderSong() {
  if (!currentPlayingSong) {
    ShowTips('No song is currently playing', 500);
    return;
  }

  const { songBM, sONGVID, cLOUD } = currentPlayingSong;

  if (sONGVID && sONGVID !== '') {
    // YouTube 视频：使用 SendCommandYb 添加到播放列表
    SendCommandYb('Add1', songBM, cLOUD, sONGVID, currentPlayingSong.songName, currentPlayingSong.singer);
    ShowTips('"' + currentPlayingSong.songName + '" select', 1000);
  } else {
    // 本地歌曲：使用 SendCommand 添加
    SendCommand('Add1', songBM, cLOUD);
    ShowTips('"' + currentPlayingSong.songName + '" select', 1000);
  }
}
 // 为control-set2和control-set3添加触摸选中效果
    $(document).ready(function() {
      $('.set-menu-sound li a').on('touchstart', function() {
        $(this).addClass('active');
      }).on('touchend touchcancel', function() {
        $(this).removeClass('active');
      });
    });
       //查找歌曲字幕
function SearchBySortNewSongText(title, sortType) {
  // adam 关闭swiper bannner
  document.getElementById('bannerswiper').style.display = 'none'
  document.getElementById('song-navbar').style.display = 'none'
  $('#home_title').text(title)
  SetSearchParams('', sortType, '', '')
  ToSearchSong('', 0)
  //showPage = "search-page"; OnSearchClick();
  ShowNextPage('mainmenu', 'search-page')
}
//adam搜索youtube
function OnSearchYbClick() {
  // 搜索条件
  var songName = $('#search-input').val()
  
  // 如果搜索词为空，则使用默认搜索词
  if (!songName || songName.trim() === '') {
    songName = ''
    // 同时更新搜索框的值
    $('#search-input').val(songName)
  }
  $('#search-input').val('')
   
 
  // 搜索前初始化为0
  mSearchPage = 0
  mSearchMaxPage = 0
  document.getElementById('song-navbar').style.display = 'none'
  ToSearchSongYb(songName, mSearchPage)
  $('#search-input').val('');
}