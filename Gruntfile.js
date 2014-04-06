module.exports = function (grunt) {
	'use strict';

	var path = require('path');

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				formatter: 'tslint-path-formatter'
			},
			src: ['src/**/*.ts'],
			test: ['test/src/**/*.ts']
		},
		clean: {
			dist: [
				'dist/**/*'
			],
			tmp: [
				'tmp/**/*'
			],
			test: [
				'test/tmp/**/*'
			]
		},
		ts: {
			options: {
				fast: 'never',
				target: 'es5',
				module: 'commonjs',
				sourcemap: true,
				declaration: true,
				comments: true,
				verbose: true
			},
			index: {
				options: {
					noImplicitAny: true
				},
				src: ['src/index.ts'],
				outDir: 'dist/'
			},
			typings: {
				options: {
					fast: 'never',
					noImplicitAny: true
				},
				src: ['typings/**/*.ts'],
				outDir: 'tmp/'
			},
			tester: {
				src: ['test/src/tester.ts'],
				outDir: 'test/tmp/'
			}
		},
		shell: {
			index: {
				command: 'node ./dist/index.js',
				options: {
					failOnError: true,
					stdout: true
				}
			},
			tester: {
				command: 'node ./test/tmp/tester.js',
				options: {
					failOnError: true,
					stdout: true
				}
			}
		},
		typescript_export: {
			module: {
				src: ['dist/*.d.ts'],
				dest: 'dist/index.d.ts'
			}
		},
		wrap: {
			module: {
				expand:  true,
				src: ['index.d.ts'],
				cwd:  'dist/',
				dest: 'dist/',
				options: {
					wrapper: function(filepath, options) {
						return ['declare module \'' + require('./package.json').name + '\' {\n', '\n}\n'];
					}
				}
			},
			index: {
				expand:  true,
				src: ['*.d.ts'],
				cwd:  'dist/',
				dest: 'dist/',
				options: {
					wrapper: function(filepath, options) {
						return ['declare module \'' + path.basename(filepath).replace(/\.d\.ts$/, '') + '\' {\n', '\n}\n'];
					}
				}
			}
		}
	});

	grunt.registerTask('wrap_module', function() {
		var head = require('./dist/index.js');
		var pkg = require('./package.json');
		var code = grunt.file.read('./dist/index.d.ts');

		code = head.serialise(head.fromPackage(pkg)).join('\n') + '\n\n' + code;
		grunt.file.write('./dist/index.d.ts', code);
	});

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:test'
	]);
	grunt.registerTask('build', [
		'prep',
		'ts:index',
		'tslint:src',
		'typescript_export:module',
		'wrap_module'
	]);
	grunt.registerTask('test', [
		'build',
		'ts:tester',
		'tslint:test',
		'shell:index',
		'shell:tester'
	]);
	grunt.registerTask('dev', ['ts:typings']);

	grunt.registerTask('default', ['build']);
};
