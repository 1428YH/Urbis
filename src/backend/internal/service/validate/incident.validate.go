package validate

import (
	"errors"
	"urbis/src/backend/internal/model"
)

func Incident(i *model.IncidentRequest) error {
	if i.Title == "" {
		return errors.New("ERROR_TITLE_EMPTY")
	}

	if i.Lvl < 1 || i.Lvl > 3 {
		return errors.New("ERROR_LVL_INVALID")
	}

	if i.Lat < -90.0 || i.Lat > 90.0 {
		return errors.New("ERROR_LAT_INVALID")
	}

	if i.Lng < -180.0 || i.Lng > 180.0 {
		return errors.New("ERROR_LNG_INVALID")
	}

	return nil
}