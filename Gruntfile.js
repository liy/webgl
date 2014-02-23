// var glob = require('glob');

module.exports = function(grunt){
  // var includeList = [];

  // function getModules(){
  //     glob("**/*.js", {cwd: './src'}, function(err, files){
  //       files.forEach(function(file){
  //         includeList.push(file.replace(/\.js$/, ''));
  //       });
  //     });
  // };
  // getModules();

  grunt.initConfig({
    meta: {
      banner: '/*use strict*/'
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'src',
          optimize: 'none',
          mainConfigFile: "src/main.js",
          name: "main",
          out: "dist/release.js"
        }
      },
    },

    watch: {
      files: ['src/**/*.js'],
      tasks: ['requirejs']
    },

  });

  grunt.loadNpmTasks('grunt-contrib-watch');  
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['requirejs', 'watch']);
}