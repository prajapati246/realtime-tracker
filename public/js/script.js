// const socket = io();

// let myId = null;

// const map = L.map("map").setView([0, 0], 16);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "Dev"
// }).addTo(map);

// const markers = {};

// socket.on("connect", () => {
//     myId = socket.id;
//     console.log("My socket ID:", myId);


//     if (navigator.geolocation) {
//         navigator.geolocation.watchPosition((position) => {
//             console.log(position)
//             const { latitude, longitude } = position.coords;
//             socket.emit("send-location", { latitude, longitude });
//         }, (error) => {
//             console.error(error)
//         }, {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0
//         })
//     }

// });

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;
//     if (id === myId) {
//         map.setView([latitude, longitude]);
//     }
//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
// })

// socket.on("user-disconnected", (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// })


const socket = io();
let myId = null;
let hasCenteredMap = false;
const markers = {};

const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Dev"
}).addTo(map);

// Wait for socket to connect before starting geolocation
socket.on("connect", () => {
    myId = socket.id;
    console.log("Socket connected with ID:", myId);

    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log("Sending location:", latitude, longitude, accuracy);
                socket.emit("send-location", { latitude, longitude });
            },
            (error) => {
                console.error("Geolocation error:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("Geolocation not supported.");
    }
});

socket.on("receive-location", ({ id, latitude, longitude }) => {
    const isSelf = id === myId;

    if (isSelf && !hasCenteredMap) {
        map.setView([latitude, longitude], 18);
        hasCenteredMap = true;
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(isSelf ? "You are here" : `User: ${id}`);
        markers[id] = marker;
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
