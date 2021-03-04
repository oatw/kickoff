luda.component('hollowHeader')
.include({
  adjust: function(){
    this.toggleBackground(this.scrollTop() > 0)
  }
})
.protect({
  scrollTop: function(){
    return this.html.get(0).scrollTop || window.scrollY
  },
  toggleBackground: function(show){
    this.root.toggleClass('hollow-header-show-background', show)
  }
})
.help({
  create: function(){
    this.adjust()
  },
  listen: function(){
    return [['scroll', function(){
      luda.hollowHeader().adjust()
    }]]
  }
});



(function(){
  var docNavScrollTop = 0
  luda(document).on('turbolinks:before-visit', function(e){
    var $container = luda('#doc-nav').get(0)
    docNavScrollTop = $container ? $container.scrollTop : 0
  }).on('turbolinks:render', function(e){
    var $container = luda('#doc-nav').get(0)
    if($container){
      $container.scrollTop = docNavScrollTop
    }
  })
})();
