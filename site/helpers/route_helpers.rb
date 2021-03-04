require 'yaml'



module RouteHelpers

  def read_routes(conf = nil)
    routes = []
    conf ||= YAML::load_file(File.join __dir__, '../data/site.yml')['menu']
    conf.each do |item|
      routes << item if item['uri']
      routes += read_routes(item['items']) if item['items']
    end
    routes
  end

  def find_route(path = '')
    read_routes().find do |route|
      route['uri'].end_with?("/#{path}") || route['uri'].end_with?("/#{path}.html")
    end || {}
  end

  def find_route_uri(path = '')
    find_route(path)['uri']
  end

end
