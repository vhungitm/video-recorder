let mediaRecorder;
let recordedBlobs;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const playButton = document.querySelector('button#play');
const downloadButton = document.querySelector('button#download');

function handleSuccess(stream) {
	recordButton.disabled = false;
	window.stream = stream;
	const gumVideo = document.querySelector('video#gum');
	gumVideo.srcObject = stream;
}

async function init(constraints) {
	try {
		const stream = await navigator.mediaDevices.getUserMedia(constraints);

		handleSuccess(stream);
	} catch (error) {
		console.log(error);
	}
}

document.querySelector('button#start').addEventListener('click', async function () {
	const hasEchoCancellation = document.querySelector('#echoCancellation').checked;

	const constraints = {
		audio: {
			echoCancellation: { exact: hasEchoCancellation }
		},
		video: {
			width: 1280,
			height: 720
		}
	};

	console.log('Using media constraints: ', constraints);
	await init(constraints);
});

function handleDataAvailable(event) {
	if (event.data && event.data.size > 0) {
		recordedBlobs.push(event.data);
	}
}

function startRecording() {
	recordedBlobs = [];

	let options = {
		mimeType: 'video/webm; codecs=vp9,opus'
	};

	try {
		mediaRecorder = new MediaRecorder(window.stream, options);
	} catch (error) {
		console.log(error);
	}

	recordButton.textContent = 'Stop Recording';
	playButton.disabled = true;
	downloadButton.disabled = true;

	mediaRecorder.stop = function (event) {
		console.log('Recording is stopped');
	};

	mediaRecorder.ondataavailable = handleDataAvailable;

	mediaRecorder.start();
}

function stopRecording() {
	mediaRecorder.stop();
}

recordButton.addEventListener('click', function () {
	if (recordButton.textContent === 'Record') {
		startRecording();
	} else {
		stopRecording();
		recordButton.textContent = 'Record';
		playButton.disabled = false;
		downloadButton.disabled = false;
	}
});

playButton.addEventListener('click', function () {
	const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });

	recordedVideo.src = null;
	recordedVideo.srcObject = null;
	recordedVideo.src = window.URL.createObjectURL(superBuffer);

	recordedVideo.play();
});

downloadButton.addEventListener('click', function () {
	const blob = new Blob(recordedBlobs, { type: 'video/mp4' });
	const url = wndow.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'test.mp4';
	document.body.appendChild(a);
	a.click();
	setTimeout(
		function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		},
		[100]
	);
});
