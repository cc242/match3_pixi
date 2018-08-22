
## Start project for One C and Celtra  

**Installation**

    npm install
**Running locally**

    yarn start
**Build**

    yarn build
This will create a build folder and also a zip for deploying on One Creative.

**Different build configurations**
When local development is complete, replace the contents of

    /node_modules/react-scripts/config/webpack.config.prod.js
with one of the different configurations in 

    src/webpack_configs/

There are currently 3 variations:
1. All external CSS and images
2. All inline CSS and images (css and images will be converted and bundled into main.js)
3. Inline images and external CSS