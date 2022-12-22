export async function getDevicesList(operationSystem) {
	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	})
	let result = []
	try {
		const devices = await navigator.mediaDevices.enumerateDevices()
		if (operationSystem === 'Android') result = getAndroidDevices(devices)
		else if (operationSystem === 'iOS') result = getIOSDevices(devices)
		if (!result.length) result = getDefaultDevices(devices)
	} catch (err) {
		console.log(err.name + ': ' + err.message)
	}
	stopStream(stream)
	return result
}

function stopStream(stream) {
	const tracks = stream.getTracks()
	tracks.forEach((track) => track.stop())
}

function getAndroidDevices(devices) {
	const result = []
	for (const device of devices) {
		const labelArray = device.label.split(' ')
		if (device.kind === 'videoinput') {
			const cameraNumber = labelArray[1][0]
			if (cameraNumber === '0' || cameraNumber === '1') {
				if (labelArray[3] === 'front') result[1] = device.deviceId
				else if (labelArray[3] === 'back') result[0] = device.deviceId
			}
		}
	}
	return result
}

function getIOSDevices(devices) {
	const result = []
	for (const device of devices) {
		if (device.kind === 'videoinput') {
			const labelArray = device.label.split(' ')
			if (labelArray.length === 2) {
				const cameraLabel = labelArray[0]
				if (cameraLabel === 'Front') result[1] = device.deviceId
				else if (cameraLabel === 'Back') result[0] = device.deviceId
			} else {
				const cameraLabel = labelArray[2]
				if (cameraLabel === 'передней') result[1] = device.deviceId
				else if (cameraLabel === 'задней') result[0] = device.deviceId
			}
		}
	}
	return result
}

function getDefaultDevices(devices) {
	const result = []
	for (const device of devices) {
		if (device.kind === 'videoinput') result.push(device.deviceId)
	}
	return result
}
