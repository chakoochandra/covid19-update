const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            /* style and css loader */
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            /* images loader */
            {
                test: /\.(ico|png|svg|jpg|gif|jpe?g)$/,
                use: [
                    {
                        options: {
                            name: "[name].[ext]",
                            outputPath: "images/"
                        },
                        loader: "file-loader"
                    }
                ]
            }
        ],
    },
    /* plugin */
    plugins: [
        /* HTML Webpack Plugin */
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html"
        }),
        new HtmlWebpackPlugin({
            template: "./src/konversi.html",
            filename: "konversi.html"
        }),
        new HtmlWebpackPlugin({
            template: "./src/about.html",
            filename: "about.html"
        }),
    ]
}