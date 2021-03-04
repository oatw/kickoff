require 'yaml'



module UriHelpers

  def download_uri(ext = 'tgz')
    conf = YAML::load_file(File.join __dir__, '../data/kickoff.yml')
    "#{conf['repo']}/raw/v#{conf['version']}/release/kickoff-#{conf['version']}.#{ext}"
  end

end
