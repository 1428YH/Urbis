package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const uploadDir = "./uploaded_img"

func UploadImageHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(20 << 20)
		if err != nil {
			http.Error(w, fmt.Sprintf("invalid multipart form: %v", err), http.StatusBadRequest)
			return
		}

		file, fileHeader, err := r.FormFile("file")
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to receive file: %v", err), http.StatusBadRequest)
			return
		}
		defer file.Close()

		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			http.Error(w, fmt.Sprintf("failed to prepare upload directory: %v", err), http.StatusInternalServerError)
			return
		}

		ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if ext == "" {
			ext = ".jpg"
		}

		filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		dstPath := filepath.Join(uploadDir, filename)

		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to create file: %v", err), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err = io.Copy(dst, file); err != nil {
			http.Error(w, fmt.Sprintf("failed to save file: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"image_url": "/uploaded_img/" + filename,
		})
	}
}
