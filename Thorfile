require 'yaml'
require 'json'
require 'listen'
require 'zip'



class Lint < Thor
  include Thor::Actions

  desc "sass", "lint .sass files"
  def sass
    command  = 'yarn sass-lint '
    command += '--config config/.sasslint "src/sass/**/*.sass" '
    command += '--verbose --no-exit'
    run command
  end

  desc "coffee", "lint .coffee files"
  def coffee
    command  = 'yarn coffeelint '
    command += '--file config/.coffeelint src/coffee --cache'
    run command
  end

  desc "markdown", "lint .md files"
  def markdown
    command  = 'yarn markdownlint '
    command += '--config config/.markdownlint "site/source/**/*.md"'
    run command
  end

  desc "all", "lint .sass, .coffee and .md files"
  def all
    sass and coffee and markdown
  end
end



class Compile < Thor
  include Thor::Actions

  class Banner < Thor
    desc "sass", "create the sass banner file"
    def sass
      banner_path = './config/banner_sass.sass'
      File.write banner_path, banner_content
    end

    desc "coffee", "create the coffee banner file"
    def coffee
      banner_path = './config/banner_coffee.js'
      File.write banner_path, "module.exports = '#{banner_content}'"
    end

    private

    def banner_content
      pkg = JSON.parse File.read('./package.json')
      b  = "/*! Kickoff #{pkg['version']} | #{pkg['repository']} | "
      b += "MIT license */"
    end
  end

  desc "sass", "compile .sass files to .css files"
  def sass
    invoke 'compile:banner:sass'
    command  = 'yarn sass '
    command += 'src/sass/index.sass '
    command += 'site/source/assets/stylesheets/kickoff/kickoff.css '
    command += '--embed-sources'
    run command
  end

  desc "coffee", "compile .coffee files to .js files"
  def coffee
    invoke 'compile:banner:coffee'
    command  = 'yarn rollup '
    command += '--input src/coffee/index.coffee '
    command += '--file site/source/assets/javascripts/kickoff/kickoff.js '
    command += '--config config/config.js '
    command += '--sourcemap'
    run command
  end

  desc "all", "compile .sass and .coffee files"
  def all
    sass and coffee
  end
end



class Minify < Thor
  include Thor::Actions

  desc "css", "minify .css files"
  def css
    command  = 'yarn cleancss '
    command += '--output site/source/assets/stylesheets/kickoff/kickoff.min.css '
    command += 'site/source/assets/stylesheets/kickoff/kickoff.css '
    command += '--level 2 --format breaksWith=lf '
    command += '--source-map --source-map-inline-sources'
    run command
  end

  desc "js", "minify .js files"
  def js
    command  = 'yarn terser '
    command += 'site/source/assets/javascripts/kickoff/kickoff.js '
    command += '--output site/source/assets/javascripts/kickoff/kickoff.min.js '
    command += '--comments "/^!/" '
    command += '--source-map "content=\'site/source/assets/javascripts/kickoff/kickoff.js.map\'" '
    command += '--source-map includeSources --source-map "url=\'kickoff.min.js.map\'"'
    run command
  end

  desc "all", "minify .css and .js files"
  def all
    css and js
  end
end



class Build < Thor
  include Thor::Actions

  class << self
    def exit_on_failure?
      true
    end
  end

  class ZipFileGenerator
    def initialize(input_dir, output_file)
      @input_dir = input_dir
      @output_file = output_file
    end

    def write
      entries = Dir.entries(@input_dir) - %w[. ..]
      ::Zip::File.open(@output_file, ::Zip::File::CREATE) do |zipfile|
        write_entries entries, '', zipfile
      end
    end

    private

    def write_entries(entries, path, zipfile)
      entries.each do |e|
        zipfile_path = path == '' ? e : File.join(path, e)
        disk_file_path = File.join(@input_dir, zipfile_path)

        if File.directory? disk_file_path
          recursively_deflate_directory(disk_file_path, zipfile, zipfile_path)
        else
          put_into_archive(disk_file_path, zipfile, zipfile_path)
        end
      end
    end

    def recursively_deflate_directory(disk_file_path, zipfile, zipfile_path)
      zipfile.mkdir zipfile_path
      subdir = Dir.entries(disk_file_path) - %w[. ..]
      write_entries subdir, zipfile_path, zipfile
    end

    def put_into_archive(disk_file_path, zipfile, zipfile_path)
      zipfile.add(zipfile_path, disk_file_path)
    end
  end

  desc "kickoff", "compile assets and build packages for production release"
  def kickoff
    @msgs = []
    set_version_num
    return unless Lint.new.all and Compile.new.all and Minify.new.all
    pack_dist
    pack_npm_package
    build_site
    @msgs.each do |msg|
      say set_color(msg, :green, :bold)
    end
  end

  private

  def set_version_num
    pkg_path = './package.json'
    pkg_data = JSON.parse File.read(pkg_path)
    version_num = pkg_data['version']
    msg  = "The current version number is #{version_num}. "
    msg += "Press enter to use the current version number "
    msg += "or specify a new version number:"
    new_version_num = ask set_color(msg, :magenta, :bold)
    if new_version_num.empty?
      @version = version_num
      @msgs << "Keep using #{version_num} as the version number."
    else
      @version = new_version_num
      pkg_data['version'] = new_version_num
      File.write pkg_path, JSON.pretty_generate(pkg_data)
      @msgs << "Version number is updated as #{new_version_num} in #{pkg_path}."
      yml_path = './site/data/kickoff.yml'
      site_data = Psych.load_file yml_path
      site_data['version'] = new_version_num
      File.write yml_path, Psych.dump(site_data)
      @msgs << "Version number is updated as #{new_version_num} in #{yml_path}."
    end
  end

  def pack_dist
    FileUtils.cp_r './site/source/assets/stylesheets/kickoff/.', './dist/css'
    FileUtils.cp_r './site/source/assets/javascripts/kickoff/.', './dist/js'
    zip_path = "./release/kickoff-#{@version}.zip"
    FileUtils.rm zip_path, force: true
    ZipFileGenerator.new('./dist', zip_path).write()
    @msgs << "Dist files are packed into #{zip_path}."
  end

  def pack_npm_package
    run 'npm pack'
    tgz_name = "kickoff-#{@version}.tgz"
    FileUtils.mv "./#{tgz_name}", './release', force: true
    @msgs << "Npm package is packed into ./release/#{tgz_name}."
  end

  def build_site
    run "MM_ROOT=#{File.join Dir.pwd, 'config'} middleman build --verbose"
    @msgs << "Site files are built into ./public."
  end
end



class Serve < Thor
  include Thor::Actions

  class << self
    def exit_on_failure?
      false
    end
  end

  desc "kickoff", "compile assets and start the dev server"
  def kickoff
    begin
      return unless Lint.new.all and Compile.new.all
      listen_sass
      listen_coffee
      listen_markdown
      run "MM_ROOT=#{File.join Dir.pwd, 'config'} middleman"
    rescue SystemExit, Interrupt
      @sass_listener.stop if @sass_listener.processing?
      @coffee_listener.stop if @coffee_listener.processing?
      @markdown_listener.stop if @markdown_listener.processing?
    end
  end

  private

  def listen_sass
    @sass_listener = Listen.to('src/sass', only: /.sass$/) do
      Lint.new.sass and Compile.new.sass
    end
    @sass_listener.start
  end

  def listen_coffee
    @coffee_listener = Listen.to('src/coffee', only: /.coffee$/) do
      Lint.new.coffee and Compile.new.coffee
    end
    @coffee_listener.start
  end

  def listen_markdown
    @markdown_listener = Listen.to('site/source', only: /.md$/) do
      Lint.new.markdown
    end
    @markdown_listener.start
  end
end



class Publish < Thor
  include Thor::Actions

  class << self
    def exit_on_failure?
      false
    end
  end

  desc "kickoff", "push code branch and publish site"
  def kickoff
    invoke('publish:code') && invoke('publish:site')
  end

  desc "code", "tag current branch and push the tagged branch to remote"
  def code
    succeed = upload_code
    succeed ? say_publish_succeed('Code') : say_publish_failed('Code')
    succeed
  end

  desc "site", "publish the site to remote server"
  def site
    succeed = upload_site
    succeed ? say_publish_succeed('Site') : say_publish_failed('Site')
    succeed
  end

  private

    def upload_code
      pkg_path = './package.json'
      pkg_data = JSON.parse File.read(pkg_path)
      version_num = pkg_data['version']
      command  = "git tag -a v#{version_num} -m \"Publish v#{version_num}.\" "
      command += "&& git push origin v#{version_num}"
      run command
    end

    def upload_site
      command = "git subtree push --prefix=public origin gh-pages"
      run command
    end

    def say_publish_succeed(name)
      say set_color("#{name} has been published successfully.", :green, :bold)
    end

    def say_publish_failed(name)
      say set_color("#{name} publishing faild!", :red, :bold)
    end
end



# [TODO]
class Test < Thor
end
