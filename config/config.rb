set :build_dir, '../public'
set :data_dir, '../site/data'
set :helpers_dir, '../site/helpers'
set :source, '../site/source'
set :js_dir, 'assets/javascripts'
set :css_dir, 'assets/stylesheets'
set :fonts_dir, 'assets/fonts'
set :images_dir, 'assets/images'

set :markdown_engine, :kramdown
set :markdown, {
  auto_ids: false,
  hard_wrap: false,
  input: 'GFM'
}

# Per-page layout changes:
page '/docs/*.html', layout: :doc
page '/404.html', directory_index: false
page '/unsupported_browser.html', layout: false



activate :syntax, {
  css_class: 'code'
}
activate :directory_indexes
activate :automatic_image_sizes

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

# Build-specific configuration
configure :build do
  set :http_prefix, '/kickoff'
  activate :minify_html
  activate :minify_css, ignore: /kickoff/
  activate :minify_javascript, ignore: /kickoff/
  activate :gzip
  activate :asset_hash
end
