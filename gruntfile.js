module.exports = function(grunt) {

	grunt.initConfig({
        less: {
            all: {
                options: {
                    compress: false,
                },
                files: '',
            },
        },
        watch: {
            all: {
                files: [
                        'css/**/*.less',
                ],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            }
        }       

	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.event.on('watch', function(action, filepath) {

	grunt.config(['less', 'all', 'files'], [{
		expand: true,
		src: filepath,
		ext: '.css',
		}]);
	});

    grunt.registerTask('default', ['less','watch']);

};