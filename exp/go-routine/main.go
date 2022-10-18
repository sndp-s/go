package main

import (
	"fmt"
	"time"
)

func spinner(delay time.Duration) {
	for {
		for _, x := range `-\|/` {
			fmt.Println("\r%C", x)
			time.Sleep(delay)
		}
	}
}

func main() {
	go spinner(100 * time.Millisecond)
}
