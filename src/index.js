// Entry point. Kept deliberately tiny (no React / three.js) so the loading
// screen becomes interactive immediately. Asset downloads and the 3D engine
// chunk are fetched in parallel.
import './loader.css';
import { ASSETS } from './assets.js';
import { preloadAssets } from './preloader.js';

const $ = (id) => document.getElementById(id);
const loader = $('loader');
const percentEl = $('loader-percent');
const fillEl = $('loader-fill');
const bytesEl = $('loader-bytes');
const listEl = $('loader-list');
const statusEl = $('loader-status');
const retryEl = $('loader-retry');

const formatBytes = (bytes) =>
	bytes >= 1024 * 1024
		? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
		: `${Math.round(bytes / 1024)} KB`;

// One row per asset, plus two non-download steps.
const rows = new Map();
const addRow = (key, label, size) => {
	const li = document.createElement('li');
	li.innerHTML = '<span class="loader__mark"></span><span class="loader__label"></span><span class="loader__size"></span>';
	li.querySelector('.loader__label').textContent = label;
	li.querySelector('.loader__size').textContent = size ? formatBytes(size) : '';
	listEl.appendChild(li);
	rows.set(key, li);
};
const setRow = (key, mark, done = false) => {
	const li = rows.get(key);
	li.querySelector('.loader__mark').textContent = mark;
	li.classList.toggle('is-done', done);
};

ASSETS.forEach((a) => addRow(a.url, a.label, a.size));
addRow('engine', '3d engine');
addRow('scene', 'scene setup');
setRow('engine', '[ .. ]');
setRow('scene', '[ .. ]');

// Progress rendering is batched to one DOM update per animation frame.
let latest = null;
let frameQueued = false;
const render = () => {
	frameQueued = false;
	let loaded = 0;
	let total = 0;
	for (const item of latest) {
		const size = Math.max(item.size, item.loaded, 1);
		loaded += Math.min(item.loaded, size);
		total += size;
		const pct = item.done ? 100 : Math.floor((item.loaded / size) * 100);
		setRow(item.url, item.done ? '[ ok ]' : `[${String(pct).padStart(3, ' ')}%]`, item.done);
	}
	const fraction = total ? loaded / total : 0;
	const pct = Math.floor(fraction * 100);
	percentEl.textContent = pct;
	fillEl.style.transform = `scaleX(${fraction})`;
	bytesEl.textContent = `${formatBytes(loaded)} / ${formatBytes(total)}`;
	loader.setAttribute('aria-valuenow', String(pct));
};
const onProgress = (state) => {
	latest = state;
	if (!frameQueued) {
		frameQueued = true;
		requestAnimationFrame(render);
	}
};

const fail = (error) => {
	console.error(error);
	loader.classList.add('is-error');
	statusEl.textContent = `error: ${error?.message || error}`;
	retryEl.hidden = false;
};
retryEl.addEventListener('click', () => window.location.reload());

const hideLoader = () => {
	if (loader.classList.contains('is-done')) return;
	setRow('scene', '[ ok ]', true);
	statusEl.textContent = 'ready.';
	loader.classList.add('is-done');
	loader.addEventListener('transitionend', (e) => {
		if (e.target === loader) loader.remove();
	});
	// Fallback in case transitions are disabled.
	setTimeout(() => loader.remove(), 1500);
};

const enginePromise = import('./app.jsx').then((mod) => {
	setRow('engine', '[ ok ]', true);
	return mod;
});

const assetsPromise = preloadAssets(ASSETS, onProgress).then((files) => {
	if (!rows.get('engine').classList.contains('is-done')) {
		statusEl.textContent = 'starting 3d engine…';
	}
	return files;
});

Promise.all([enginePromise, assetsPromise])
	.then(([app, files]) => {
		statusEl.textContent = 'building scene…';
		app.mount($('root'), files, { onReady: hideLoader, onError: fail });
	})
	.catch(fail);
