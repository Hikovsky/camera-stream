class CameraStream extends HTMLElement {
	constructor() {
		super()
		const shadowRoot = this.attachShadow({ mode: 'open' })
		shadowRoot.innerHTML = this.getInnerHtml()
	}

	connectedCallback() {
		this.shadowRoot
			.getElementById('mirror')
			.addEventListener('click', () => this.toggleMirror())
		this.shadowRoot.getElementById('switch').addEventListener('click', () => {
			if (this.stream) {
				const deviceId = this.stream.getVideoTracks()[0].getSettings().deviceId
				const deviceIndex = this.devices.indexOf(deviceId)
				const device =
					deviceIndex === this.devices.length - 1
						? this.devices[0]
						: this.devices[deviceIndex + 1]
				this.setStream(device)
			}
		})
		this.setup()
	}

	async setup() {
		await this.setDevicesList()
		const device =
			this.hasAttribute('default-camera') &&
			this.getAttribute('default-camera') === 'back'
				? this.devices[0]
				: this.devices[1]
		await this.setStream(device)
	}

	disconnectedCallback() {
		console.log('CameraStream is disconnected from web page')
	}

	static get observedAttributes() {
		return ['srcObject', 'default-camera']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log(
			`${name} attribute changed from ${oldValue} to ${newValue} if CameraSwitch web component`
		)
	}

	adoptedCallback() {
		console.log('document.adoptNode called for CameraSwitch web component')
	}

	setOperationSystem() {
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

		this.operationSystem = operationSystem
	}

	async setDevicesList() {
		await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false,
		})
		this.setOperationSystem()
		let result = []
		try {
			const devices = await navigator.mediaDevices.enumerateDevices()
			if (this.operationSystem === 'Android')
				result = this.getAndroidDevices(devices)
			else if (this.operationSystem === 'iOS')
				result = this.getIOSDevices(devices)
			if (!result.length) result = this.getDefaultDevices(devices)
		} catch (err) {
			console.log(err.name + ': ' + err.message)
		}
		this.stopStream()
		this.devices = result
	}

	getAndroidDevices(devices) {
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

	getIOSDevices(devices) {
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
				// iOS videoinput device labels
				// Камера на передней панели
				// Камера на задней панели
				// Front camera
				// Back camera
			}
		}
		return result
	}

	getDefaultDevices(devices) {
		const result = []
		for (const device of devices) {
			if (device.kind === 'videoinput') result.push(device.deviceId)
		}
		return result
	}

	toggleMirror(camera = null) {
		const videoElement = this.shadowRoot.getElementById('video')
		const className = videoElement.className
		if (camera === 'front') videoElement.className = 'mirror'
		else if (camera === 'back') videoElement.className = ''
		else {
			if (className === '') videoElement.className = 'mirror'
			else videoElement.className = ''
		}
	}

	async setStream(deviceId = null) {
		this.stopStream()
		const constraints = {
			video: {
				deviceId: deviceId,
			},
			audio: false,
		}
		if (!deviceId) constraints.video = true
		this.stream = await navigator.mediaDevices.getUserMedia(constraints)
		const videoElement = this.shadowRoot.getElementById('video')
		this.srcObject = this.stream
		videoElement.srcObject = this.stream
		if (['Android', 'iOS'].includes(this.operationSystem)) {
			const deviceIndex = this.devices.indexOf(
				this.stream.getVideoTracks()[0].getSettings().deviceId
			)
			if (deviceIndex === 0) this.toggleMirror('back')
			else if (deviceIndex === 1) this.toggleMirror('front')
		} else this.toggleMirror('front')
	}

	stopStream() {
		const videoElement = this.shadowRoot.getElementById('video')
		if (videoElement.srcObject) {
			const tracks = videoElement.srcObject.getTracks()
			tracks.forEach((track) => track.stop())
			this.srcObject = null
			videoElement.srcObject = null
		}
	}

	getMirrorSVG() {
		return `
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
        <g>
          <g>
            <g>
              <path d="M203.307,275.54L32.64,168.873C18.431,159.993,0,170.208,0,186.964v213.333c0,16.756,18.431,26.971,32.64,18.091
                l170.667-106.667C216.676,303.366,216.676,283.895,203.307,275.54z M42.667,361.807V225.454l109.082,68.176L42.667,361.807z"/>
              <path d="M479.36,168.873L308.693,275.54c-13.369,8.356-13.369,27.826,0,36.181L479.36,418.388
                c14.209,8.881,32.64-1.335,32.64-18.091V186.964C512,170.208,493.569,159.993,479.36,168.873z M469.333,361.807l-109.082-68.176
                l109.082-68.176V361.807z"/>
              <path d="M256,165.631c-11.782,0-21.333,9.551-21.333,21.333v21.333c0,11.782,9.551,21.333,21.333,21.333
                s21.333-9.551,21.333-21.333v-21.333C277.333,175.182,267.782,165.631,256,165.631z"/>
              <path d="M256,378.964c-11.782,0-21.333,9.551-21.333,21.333v21.333c0,11.782,9.551,21.333,21.333,21.333
                s21.333-9.551,21.333-21.333v-21.333C277.333,388.515,267.782,378.964,256,378.964z"/>
              <path d="M256,272.297c-11.782,0-21.333,9.551-21.333,21.333v21.333c0,11.782,9.551,21.333,21.333,21.333
                s21.333-9.551,21.333-21.333v-21.333C277.333,281.848,267.782,272.297,256,272.297z"/>
              <path d="M207.085,138.049c34.049-34.049,83.885-35.279,116.582-2.581l8.83,8.83h-8.827c-11.782,0-21.333,9.551-21.333,21.333
                c0,11.782,9.551,21.333,21.333,21.333H384c0.703,0,1.405-0.037,2.105-0.106c0.315-0.031,0.621-0.09,0.932-0.135
                c0.378-0.054,0.756-0.098,1.13-0.173c0.358-0.071,0.704-0.169,1.055-0.258c0.324-0.081,0.649-0.152,0.969-0.249
                c0.344-0.104,0.677-0.233,1.013-0.354c0.32-0.115,0.642-0.22,0.957-0.35c0.315-0.131,0.617-0.284,0.924-0.429
                c0.324-0.153,0.65-0.296,0.968-0.466c0.295-0.158,0.575-0.338,0.861-0.509c0.311-0.186,0.626-0.362,0.929-0.565
                c0.316-0.212,0.614-0.447,0.918-0.675c0.253-0.19,0.512-0.365,0.759-0.567c1.087-0.892,2.085-1.889,2.977-2.977
                c0.202-0.246,0.377-0.505,0.566-0.757c0.228-0.305,0.464-0.603,0.676-0.919c0.203-0.303,0.378-0.617,0.564-0.928
                c0.171-0.287,0.351-0.567,0.51-0.862c0.169-0.317,0.313-0.642,0.465-0.965c0.146-0.308,0.299-0.611,0.43-0.927
                c0.13-0.313,0.234-0.633,0.348-0.951c0.122-0.339,0.252-0.673,0.356-1.019c0.096-0.318,0.167-0.641,0.248-0.963
                c0.089-0.353,0.188-0.702,0.259-1.061c0.074-0.372,0.117-0.747,0.171-1.122c0.045-0.314,0.105-0.623,0.136-0.941
                c0.069-0.699,0.106-1.401,0.106-2.104c0,0,0-0.001,0-0.001V105.3c0-11.782-9.551-21.333-21.333-21.333
                c-11.782,0-21.333,9.551-21.333,21.333v8.827l-8.83-8.83c-49.702-49.702-126.535-47.806-176.922,2.581
                c-8.331,8.331-8.331,21.839,0,30.17S198.754,146.38,207.085,138.049z"/>
            </g>
          </g>
        </g>
      </svg>
    `
	}

	getSwitchSVG() {
		return `
      <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm.64 4.53a5.5 5.5 0 0 1 6.187 8.92L13.75 12.6h1.749l.001-.1a3.5 3.5 0 0 0-4.928-3.196L9.64 7.53zm4.677 9.96a5.5 5.5 0 0 1-6.18-8.905L10.25 12.5H8.5a3.5 3.5 0 0 0 4.886 3.215l.931 1.774z"/>
        </g>
      </svg>

    `
	}

	getInnerHtml() {
		return `
    <style>
      .video {
        width: 100%;
        height: 100%;
        position: relative;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
      .controls {
        position: absolute;
        right: 0;
        top: 0;
        z-index: 999999;
      }
      .icon {
        padding: 5px 10px;
        width: auto;
        height: auto;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.4);;
        border: none;
        border-radius: 10px;
        outline: none;
      }
      .icon svg {
        width: 32px;
        height: 32px;
      }
      .mirror {
        transform: scaleX(-1);
      }
    </style>
    <div class='video'>
      <video class='' id='video' autoplay playsinline></video>
      <div class='controls'>
        <button class='icon' id='mirror'>${this.getMirrorSVG()}</button>
        <button class='icon' id='switch'>${this.getSwitchSVG()}</button>
      </div>
    </div>`
	}
}

customElements.define('camera-stream', CameraStream)
