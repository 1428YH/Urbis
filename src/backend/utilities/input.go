package utilities

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func ReadInput(msg string) (string, error) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print(msg + " ")
	res, err := reader.ReadString('\n')
	if err != nil {
		return  "", err
	}

	return strings.TrimSpace(res), nil
}

func ReadInt(msg string) (int, error) {
	s, err := ReadInput(msg)
	if err != nil {
		return 0, nil
	}

	return strconv.Atoi(s)
}

func ReadFloat(msg string) (float64, error) {
	s, err := ReadInput(msg)
	if err != nil {
		return 0, nil
	}

	return strconv.ParseFloat(s, 64)
}