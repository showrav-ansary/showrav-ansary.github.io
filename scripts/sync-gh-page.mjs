import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

console.log('🔄 Syncing public/portfolio to gh-page branch...');

try {
	// Ensure working tree on current branch is clean or stash
	const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
	if (status && !status.includes('public/portfolio')) {
		console.warn('⚠️  Working tree has uncommitted changes. Stashing before branch switch...');
	}

	const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

	// Read current files from public/portfolio
	const indexHtml = readFileSync(resolve('public/portfolio/index.html'));
	const styleCss = readFileSync(resolve('public/portfolio/css/style.css'));
	const resumePdf = readFileSync(resolve('public/portfolio/resume.pdf'));
	const meJpg = readFileSync(resolve('public/portfolio/img/me.jpg'));

	// Read optional .well-known/discord if present
	const discordPath = resolve('.well-known/discord');
	const discordContent = existsSync(discordPath) ? readFileSync(discordPath) : null;

	// Switch to gh-page branch
	execSync('git checkout gh-page', { stdio: 'inherit' });

	// Write files to root of gh-page
	writeFileSync(resolve('index.html'), indexHtml);
	writeFileSync(resolve('css/style.css'), styleCss);
	writeFileSync(resolve('resume.pdf'), resumePdf);
	writeFileSync(resolve('img/me.jpg'), meJpg);
	writeFileSync(resolve('.nojekyll'), '');

	if (discordContent) {
		const targetDiscordDir = resolve('.well-known');
		if (!existsSync(targetDiscordDir)) mkdirSync(targetDiscordDir, { recursive: true });
		writeFileSync(resolve('.well-known/discord'), discordContent);
	}

	// Ensure package.json exists with engines: { node: "26.x" } for Vercel compatibility
	const packageJson = JSON.stringify(
		{
			name: 'showrav-ansary-portfolio',
			private: true,
			version: '1.0.0',
			description: 'Static portfolio for A. A. Noman Ansary',
			engines: {
				node: '26.x',
			},
		},
		null,
		2
	) + '\n';
	writeFileSync(resolve('package.json'), packageJson);

	execSync('git add index.html css/style.css resume.pdf img/me.jpg .nojekyll package.json' + (discordContent ? ' .well-known/discord' : ''), { stdio: 'inherit' });
	const diff = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
	if (diff) {
		execSync('git commit -m "Auto-sync modern static site from main public/portfolio"', { stdio: 'inherit' });
		console.log('✅ gh-page branch updated with latest changes!');
	} else {
		console.log('✨ gh-page branch is already up to date!');
	}

	// Switch back to original branch
	execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });
	console.log(`🔙 Switched back to ${currentBranch}`);
} catch (error) {
	console.error('❌ Sync failed:', error.message);
	process.exit(1);
}

