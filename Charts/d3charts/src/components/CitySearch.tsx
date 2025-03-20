import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import L from "leaflet";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "./CitySearch.css";

const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
});

interface City {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface Country {
  name: string;
  code2: string;
  states: { code: string; name: string }[];
}

const CitySearch: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cityData, setCityData] = useState<City | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [stateList, setStateList] = useState<{ code: string; name: string }[]>([]);
  const [isStateInputFocused, setIsStateInputFocused] = useState<boolean>(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/countries");
        console.log("Fetched countries:", response.data);
        setCountryList(response.data);
      } catch (err: any) {
        console.error("Error fetching country list:", err.response ? err.response.data : err.message);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim().toLowerCase();
    setCountry(input);
    setState("");
    setStateCode("");

    console.log("User input:", input);
    const exactMatch = countryList.find((c) => c.name.toLowerCase() === input);
    if (exactMatch) {
      setCountryCode(exactMatch.code2);
      setStateList(exactMatch.states || []);
      return;
    }

    const filtered = countryList.filter((c) => c.name.toLowerCase().includes(input));
    setFilteredCountries(filtered);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setState(input);
    const selectedState = stateList.find(
      (s) => s.name.toLowerCase() === input.toLowerCase()
    );
    if (selectedState) {
      setStateCode(selectedState.code);
    } else {
      setStateCode("");
    }
  };
  const handleStateFocus = () => {
    if (countryCode && stateList.length > 0) {
      setIsStateInputFocused(true);
    }
  };

  const handleStateBlur = () => {
    setTimeout(() => setIsStateInputFocused(false), 200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!countryCode) {
      setError("Please select a valid country from suggestions.");
      setLoading(false);
      return;
    }

    try {
      let apiUrl = `https://country-state-city-search-rest-api.p.rapidapi.com/cities-by-countrycode?countrycode=${countryCode}`;
      if (stateCode) {
        apiUrl = `https://country-state-city-search-rest-api.p.rapidapi.com/cities-by-countrycode-and-statecode?countrycode=${countryCode}&statecode=${stateCode}`;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          "x-rapidapi-key": "4ffc1232e4msh3069bd38b31b17cp177db3jsn7055c39b2cea",
          "x-rapidapi-host": "country-state-city-search-rest-api.p.rapidapi.com",
        },
      });
      setCities(response.data);
    } catch (err) {
      setError("Error fetching cities. Please check your API.");
      console.error(err);
    }
    setLoading(false);
  };
  const handleCityClick = async (cityName: string) => {
    setError(null);
    setCityData(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/cities/${cityName}`);

      if (response.data && response.data.location) {
        console.log("Using cached city data from MongoDB.");
        setCityData({
          name: response.data.name,
          location: {
            latitude: response.data.location.lat,
            longitude: response.data.location.lon,
          },
        });
        setShowMap(true);
        return;
      }
    } catch (err) {
      console.log("City not found in MongoDB. Fetching from OpenStreetMap...");
    }
    if (!navigator.onLine) {
      setError("You're offline, and city data is not cached.");
      return;
    }

    try {
      const osmResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          cityName
        )}&format=json&limit=1`
      );

      if (!osmResponse.data || osmResponse.data.length === 0) {
        setError("City not found in OpenStreetMap.");
        return;
      }

      const bestMatch = osmResponse.data[0];
      const { lat, lon } = bestMatch;

      const saveResponse = await axios.post("http://localhost:5000/api/cities", {
        name: cityName,
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      });

      if (saveResponse.status === 201 || saveResponse.status === 200) {
        setCityData({
          name: cityName,
          location: { latitude: parseFloat(lat), longitude: parseFloat(lon) },
        });
        setShowMap(true);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (osmError) {
      setError("Error fetching city from OpenStreetMap.");
      console.error(osmError);
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setCityData(null);
    if (mapInstance) {
      mapInstance.remove();
      setMapInstance(null);
    }
  };

  useEffect(() => {
    if (cityData && showMap) {
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.remove();
        }
        const newMap = L.map("map", {
          center: [cityData.location.latitude, cityData.location.longitude],
          zoom: 10,
          maxZoom: 18,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(newMap);

        L.marker([cityData.location.latitude, cityData.location.longitude])
          .addTo(newMap)
          .bindPopup(cityData.name)
          .openPopup();

        setMapInstance(newMap);
      }, 500);
    }
  }, [cityData, showMap]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">City Search</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-5 position-relative">
            <input
              type="text"
              className="form-control"
              value={country}
              onChange={handleCountryChange}
              placeholder="Select Country"
            />
            {filteredCountries.length > 0 && country && (
              <ul className="list-group position-absolute w-100">
                {filteredCountries.slice(0, 5).map((c) => (
                  <li
                    key={c.code2}
                    className="list-group-item list-group-item-action"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCountry(c.name);
                      setCountryCode(c.code2);
                      setFilteredCountries([]);  
                      setStateList(c.states || []);
                      console.log(c.states);
                    }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-md-5 position-relative">
            <input
              type="text"
              className="form-control"
              value={state}
              onChange={handleStateChange}
              placeholder="Select State (Optional)"
              onClick={handleStateFocus}
              onBlur={handleStateBlur}
            />
            {stateList.length > 0 && isStateInputFocused && (
              <ul className="list-group position-absolute w-100">
                {stateList
                  .filter((s) => s.name.toLowerCase().includes(state.toLowerCase()))
                  .slice(0, 5)
                  .map((s) => (
                    <li
                      key={s.code}
                      className="list-group-item list-group-item-action"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setState(s.name);
                        setStateCode(s.code);
                        setIsStateInputFocused(false);
                      }}
                    >
                      {s.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className={`city-map-container ${showMap ? "map-open" : ""}`}>
        <div className="city-list">
          {cities.length > 0 ? (
            cities.map((city, index) => (
              <div className="city-card" key={index} onClick={() => handleCityClick(city.name)}>
                <h5>{city.name}</h5>
              </div>
            ))
          ) : (
            <p className="text-muted text-center">No cities found.</p>
          )}
        </div>
        {showMap && (
          <div className="map-panel">
            <button className="close-btn" onClick={handleCloseMap}>✖</button>
            <div id="map" className="map-container"></div>
          </div>
        )}
      </div>
    </div>
  );

};

export default CitySearch;