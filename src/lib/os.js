export function getOperationSystem() {
	const userAgent = window.navigator.userAgent
	const platform = window.navigator.platform
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
	const iosPlatforms = ['iPhone', 'iPad', 'iPod']
	let operationSystem = null

	if (macosPlatforms.indexOf(platform) !== -1) {
		operationSystem = 'Mac OS'
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		operationSystem = 'iOS'
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		operationSystem = 'Windows'
	} else if (/Android/.test(userAgent)) {
		operationSystem = 'Android'
	} else if (!os && /Linux/.test(platform)) {
		operationSystem = 'Linux'
	}

	return operationSystem
}
