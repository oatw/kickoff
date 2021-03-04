var coffee = require('rollup-plugin-coffee-script')
var banner = require('./banner_coffee')

module.exports = [{
  context: 'this',
  plugins: [ coffee() ],
  output: {
    format: 'umd',
    banner: banner
  }
}]
