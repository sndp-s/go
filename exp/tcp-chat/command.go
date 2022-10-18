package chat

type commandID int

const (
	CMD_NICK commandID = iota
	CMD_JOIN
	CMD_ROOMS
	CMD_MSG
	CMD_QUIT
)

type name struct {
	id     commandID
	client *client
	args[string]
}
