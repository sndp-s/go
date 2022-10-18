package server

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// AllRooms is the global hashmap for the server
var AllRooms RoomMap

// CreateRoomRequestHandler Create a Room and return roomID
func CreateRoomRequestHandler(w http.ResponseWriter, r *http.Request) {
	/**
	flow:
	- allow reqs from all origins
	- create a new room
	- write json response to ResponseWriter
	*/

	w.Header().Set("Access-Control-Allow-Origin", "*")

	roomID := AllRooms.CreateRoom()

	type resp struct {
		RoomID string `json:"room_id"`
	}

	log.Println(AllRooms.Map)

	json.NewEncoder(w).Encode(resp{RoomID: roomID})
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type broadcastMsg struct {
	Message map[string]interface{}
	RoomID  string
	Client  *websocket.Conn
}

var broadcast = make(chan broadcastMsg)

func broadcaster() {
	/**
	- receive new msgs from the boardcast channel
	- pass it over to all room participants expect the OP
	*/
	for {
		msg := <-broadcast
		for _, client := range AllRooms.Map[msg.RoomID] {
			if client.Conn != msg.Client {
				err := client.Conn.WriteJSON(msg.Message)

				if err != nil {
					log.Fatal(err)
					client.Conn.Close()
				}
			}
		}
	}
}

// JoinRoomRequestHandler Will join the client in a particular way
func JoinRoomRequestHandler(w http.ResponseWriter, r *http.Request) {
	/**
	flow:
	- get roomID from the query parameters
	- upgrade the connection to websocket
	- insert the participant into the room
	- turn on an async broadcaster to read its msg and broadcast to other room participants
	- setup a loop to read JSON from websocket connection and pass the msg to broadcaster via broadcast channel
	*/
	roomID, ok := r.URL.Query()["roomID"]

	if !ok {
		log.Println("roomID missing in URL Parameters")
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("Web Socket Upgrade Error", err)
	}

	AllRooms.InsertIntoRoom(roomID[0], false, ws)

	go broadcaster()

	for {
		var msg broadcastMsg

		err := ws.ReadJSON(&msg.Message)
		if err != nil {
			log.Fatal("Read Error: ", err)
		}

		msg.Client = ws
		msg.RoomID = roomID[0]

		log.Println(msg.Message)

		broadcast <- msg
	}
}
