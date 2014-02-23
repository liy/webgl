// Gruntfile.js
module.exports = function(grunt){
  grunt.initConfig({
    // traceur: {
    //   options: {
    //     sourceMaps: true,
    //     experimental:true,  // Turn on all experimental features
    //     blockBinding: true // Turn on support for let and const
    //   },
    //   custom: {
    //     files:{
    //       'build/': ['js/**/*.js']
    //     }
    //   }
    // }
    traceur: {
      build: {
        src: '*.js',
        dest: 'build/build.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-traceur');
}