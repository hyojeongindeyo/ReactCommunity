import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Weather = ({ latitude, longitude, city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat: latitude,
            lon: longitude,
            appid: '310d6435914f791b7072eff94e9b67c3', // OpenWeatherMap API 키
            units: 'metric',
            lang: 'kr'
          }
        });
        setWeather(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Error fetching weather');
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (!weather) {
    return <Text>No weather data available</Text>;
  }

  // 날씨 상태에 따라 이모지를 추가하는 조건
  let emoji = '';
  if (weather.weather[0].description.includes('비')) {
    emoji = '☔️';
  } else if (weather.weather[0].description.includes('맑음')) {
    emoji = '☀️';
  } else if (weather.weather[0].description.includes('흐림')) {
    emoji = '☁️';
  } else if (weather.weather[0].description.includes('눈')) {
    emoji = '❄️';
  } else if (weather.weather[0].description.includes('박무')) {
    emoji = '🌫️';
  }
  

  return (
    <View style={styles.container}>
      <Text>{emoji} {weather.main.temp}°C, {weather.weather[0].description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default Weather;
