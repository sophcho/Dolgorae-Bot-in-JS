const child_process = require('child_process');

// Add your files here

const start_files = [
	'./deploy-commands.js',
	'./index.js',
];

// Don't edit below this line

console.log(`[Loader]Loading ${start_files.length} files`);

function runfile(name) {
	return new Promise((resolve) => {
		const working_dir = name.split('/').slice(0, -1).join('/');
		const file = name.split('/')[name.split('/').length - 1];

		console.log(`[Loader]Installing dependencies in directory ${working_dir}`);

		child_process.spawn('npm', [ 'install', '--build-from-resource', '--no-bin-links', '--cache', '/tmp/.npm-global', '--update-notifier', 'false', '--prefix', `/home/minecraft/multicraft/servers/server${process.env.SERVER_ID}/${working_dir}` ], {
			cwd: working_dir,
		}).on('exit', () => {
			console.log(`[Loader]Opening file ${name}`);

			child_process.spawn(process.execPath, [ file ], {
				cwd: working_dir,
				stdio: 'inherit',
			}).on('exit', resolve);
		});
	});
}

for (const f of start_files) {
	runfile(f).then(() => console.log(`[Loader]File ${f} stopped`));
}