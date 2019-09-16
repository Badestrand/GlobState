const HtmlWebPackPlugin = require('html-webpack-plugin')



module.exports = {
	entry: ['./app.jsx'],
	module: {
		rules: [{
			loader: 'babel-loader',
			test: /\.jsx?$/,
			exclude: /node_modules/,
			query: {
				presets: ['@babel/react']
			}
		}, {
			test: /\.html$/,
			use: [{
				loader: 'html-loader'
			}]
		}]
	},
	plugins: [
		new HtmlWebPackPlugin()
	]
}