import sizes from 'virtual:asset-manifest';

const BASE = import.meta.env.BASE_URL;

const asset = (path, label) => ({
	path,
	label,
	url: BASE + path,
	size: sizes[path] ?? 0,
});

// Every file the scene needs before it can be shown. They are downloaded by
// the loading screen (with byte-level progress) and handed to the 3D engine
// from memory, so nothing is fetched twice.
export const MODEL = asset('assets/model.glb', 'laptop model');
export const ENVIRONMENT = asset('assets/city_env.hdr', 'environment light');
export const FONT = asset('ShareTechMono-Regular.woff', 'typeface');
export const DRACO_WRAPPER = asset('draco/draco_wasm_wrapper.js', 'mesh decoder');
export const DRACO_WASM = asset('draco/draco_decoder.wasm', 'mesh decoder (wasm)');

export const DRACO_PATH = BASE + 'draco/';

export const ASSETS = [MODEL, ENVIRONMENT, DRACO_WASM, DRACO_WRAPPER, FONT];

