( function () {
  var anchorDomWrap
  var anchorDom
  var cacheNavHtml = {}

  /**
   * @param {{title:string;slug:string}} nav
   * @param {string} curPath
   */
  function navHtmlTemplate ( nav, curPath ) {
    var isActive = nav.slug === ( '#' + curPath ) ? 'is-active' : ''
    return '<div class="anchor-nav"><a class="' + isActive + '" href="' + nav.slug + '" title="' + nav.title + '">' + nav.title + '</a></div>'
  }

  /**
   * @param {Array<{title:string;slug:string}>} navs 
   * @param {string} curPath
   */
  function getNavHtmlTemplate ( navs, curPath ) {
    if ( cacheNavHtml[ curPath ] ) return cacheNavHtml[ curPath ]
    var html = ''
    navs.forEach( function ( nav ) {
      html += navHtmlTemplate( nav, curPath )
    } )
    cacheNavHtml[ curPath ] = html
    return html
  }

  /**
   * @param {Array<{title:string;slug:string}>} navs 
   * @param {string} curPath
   */
  function updateAnchor ( navs, curPath ) {
    if ( !anchorDom ) init()
    anchorDom.innerHTML = getNavHtmlTemplate( navs, curPath )
  }

  function style () {
    var code = "#anchor-navigation{position:fixed;top:100px;right:0;z-index: 1;font-size: 12px;line-height: 1.8em;padding:40px 15px 10px;max-width:170px;max-height: 350px;overflow-y:auto;} #anchor-navigation a {color: #999;text-decoration: none;transition:color .3s ease-in-out;} .anchor-navigation{position:relative;transition:.3s ease-in-out;width:100%} .anchor-navigation.is-hidden{right:-120%;} #anchor-navigation a.is-active,#anchor-navigation a:hover{color:#333} .anchor-navigation-toggle{position: absolute;width: 30px;height: 30px;top: 0;right: 15px;background: #fff;border: 1px solid #ddd;border-radius: 3px;cursor: pointer;line-height: 28px;text-align: center;font-size: 12px;color: #999;transition:all .3s ease-in-out} .anchor-navigation-toggle:hover{color:#666;border-color:#666} .anchor-nav {white-space: nowrap;overflow: hidden;text-overflow: ellipsis;}"
    Docsify.dom.style( code )
  }

  var init = function () {
    anchorDomWrap = document.createElement( 'div' )
    anchorDom = document.createElement( 'div' )
    var anchorToggle = document.createElement( 'div' )

    anchorDom.classList.add( 'anchor-navigation' )
    anchorDomWrap.setAttribute( 'id', 'anchor-navigation' )
    anchorToggle.classList.add( 'anchor-navigation-toggle' )
    anchorToggle.setAttribute( 'data-expend', true )
    anchorToggle.innerText = '>>'

    anchorDom.addEventListener( 'click', function ( e ) {
      var dom = e.target
      anchorDom.querySelectorAll( 'a' ).forEach( function ( child ) { child.classList.remove( 'is-active' ) } )
      dom.classList.add( 'is-active' )
    }, false )

    anchorToggle.addEventListener( 'click', function () {
      if ( anchorToggle.getAttribute( 'data-expend' ) === 'false' ) {
        anchorToggle.setAttribute( 'data-expend', true )
        anchorToggle.innerText = '>>'
        anchorDom.classList.remove( 'is-hidden' )
      } else {
        anchorToggle.setAttribute( 'data-expend', false )
        anchorToggle.innerText = '<<'
        anchorDom.classList.add( 'is-hidden' )
      }
    }, false )

    window.addEventListener( 'hashchange', handleHashChange )

    anchorDomWrap.appendChild( anchorDom )
    anchorDomWrap.appendChild( anchorToggle )
    document.body.appendChild( anchorDomWrap )
  }

  var handleHashChange = function () {
    var hash = window.location.hash
    anchorDom.querySelectorAll( 'a' ).forEach( function ( child ) {
      if ( child.getAttribute( 'href' ) == hash ) {
        child.classList.add( 'is-active' )
      } else {
        child.classList.remove( 'is-active' )
      }
    } )
  }

  var update = function ( config, vm ) {
    var route = vm.route
    var compiler = vm.compiler
    var curPath = route.path
    var cacheKeys = Object.keys( compiler.cacheTree )
    var curTree
    if ( curPath === '/' ) {
      curTree = compiler.cacheTree[ curPath ]
    } else {
      cacheKeys.map( function ( key ) {
        if ( key.indexOf( curPath ) === 0 ) {
          curTree = compiler.cacheTree[ key ]
          curPath = key
        }
        return
      } )
    }
    if ( !curTree ) return
    updateAnchor( curTree, curPath )
    if ( !curTree.length || curTree.length < config.display ) {
      anchorDomWrap && ( anchorDomWrap.style.display = 'none' )
    } else {
      anchorDomWrap && ( anchorDomWrap.style.display = 'block' )
    }
  }

  var CONFIG = {
    display: 3 // 指定存在多少章节时出现锚点导航
  }

  var install = function ( hook, vm ) {
    var anchorConfig = vm.config.anchor || {}
    var opts = {
      display: anchorConfig.display || CONFIG.display
    }

    hook.init( function () {
      init()
      style()
    } )
    hook.doneEach( function () {
      update( opts, vm )
    } )
    hook.mounted( function () {
      update( opts, vm )
    } )
  }

  $docsify.plugins = [].concat( install, $docsify.plugins );
} )()