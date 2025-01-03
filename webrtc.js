let localStream;
let remoteStream;
let peerConnection;
const config = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

async function startPatient() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("localVideo").srcObject = localStream;

    // Simulate patient waiting for doctor to connect
    setupConnection();
}

async function startDoctor() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("localVideo").srcObject = localStream;

    // Doctor will connect to a patient when they click on a name
}

function setupConnection() {
    peerConnection = new RTCPeerConnection(config);
    peerConnection.addEventListener("icecandidate", event => {
        if (event.candidate) {
            sendToServer({
                type: "new-ice-candidate",
                candidate: event.candidate,
            });
        }
    });

    peerConnection.addEventListener("track", event => {
        const [remoteStream] = event.streams;
        document.getElementById("remoteVideo").srcObject = remoteStream;
    });

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    if (isPatient()) {
        createOffer();
    }
}

function isPatient() {
    return window.location.pathname.includes("patienttelemedicine.html");
}

function createOffer() {
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => sendToServer({ type: "offer", sdp: peerConnection.localDescription }));
}

function createAnswer() {
    peerConnection.createAnswer()
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => sendToServer({ type: "answer", sdp: peerConnection.localDescription }));
}

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    createAnswer();
}

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleNewICECandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

function sendToServer(message) {
    // Implement server communication (e.g., WebSocket, signaling server)
    console.log("Sending message to server:", message);
}

function connectToPatient(patientId) {
    setupConnection();
    // Implement logic to connect to a specific patient (e.g., signaling server)
    console.log("Connecting to patient:", patientId);
}