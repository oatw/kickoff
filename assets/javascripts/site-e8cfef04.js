luda.component("hollowHeader").include({adjust:function(){this.toggleBackground(this.scrollTop()>0)}}).protect({scrollTop:function(){return this.html.get(0).scrollTop||window.scrollY},toggleBackground:function(o){this.root.toggleClass("hollow-header-show-background",o)}}).help({create:function(){this.adjust()},listen:function(){return[["scroll",function(){luda.hollowHeader().adjust()}]]}}),function(){var o=0;luda(document).on("turbolinks:before-visit",function(){var n=luda("#doc-nav").get(0);o=n?n.scrollTop:0}).on("turbolinks:render",function(){var n=luda("#doc-nav").get(0);n&&(n.scrollTop=o)})}();