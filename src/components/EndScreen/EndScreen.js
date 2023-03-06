import {StyleSheet, Text, View, Pressable, Alert,Linking} from 'react-native';
import React, {useState, useEffect} from 'react';

import {colors, colorsToEmoji} from './../../constants';

import Clipboard from '@react-native-clipboard/clipboard';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Animated, {SlideInLeft,SlideInDown, SlideInUp} from 'react-native-reanimated';

const Number = ({number, label}) => (
  <View style={styles.number}>
    <Text style={styles.numberText}>{number}</Text>
    <Text style={styles.numberLabel}>{label}</Text>
  </View>
);

const GuessDistributionLine = ({percentage, position, amount}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    }}>
    <Text style={{color: colors.lightgrey}}>{position}</Text>

    <View
      style={{
        alignSelf: 'stretch',
        backgroundColor: colors.grey,
        margin: 5,
        padding: 5,
        width: `${percentage}%`,
        minWidth: 20,
      }}>
      <Text style={{color: colors.lightgrey}}>{amount}</Text>
    </View>
  </View>
);

const GuessDistribution = ({distribution}) => {
  if (!distribution) return null;

  const sum = distribution.reduce((total, dist) => dist + total, 0);

  return (
    <View style={{padding: 20, width: '100%'}}>
      {distribution.map((dist, index) => (
        <GuessDistributionLine
          key={index}
          position={index + 1}
          amount={dist}
          percentage={(100 * dist) / sum}
        />
      ))}
    </View>
  );
};

const EndScreen = ({won = false, rows, getCellBGCOlor}) => {
  const [secondsTillTomorrow, setSecondsTillTomorrow] = useState(0);
  const [played, setPlayed] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [curStreak, setCurStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [distribution, setDistribution] = useState(null);

  const [tweetContent, setTweetContent] = useState('');

 

  const tweetNow = () => {

    const textShare = rows
      ?.map((row, i) =>
        row?.map((cell, j) => colorsToEmoji[getCellBGCOlor(i, j)]).join(''),
      )
      .filter(row => row)
      .join('\n');

      setTweetContent(textShare)

    let twitterParameters = [];
   
    if (tweetContent)
      twitterParameters.push('text=' + encodeURI(tweetContent));
   
    const url =
      'https://twitter.com/intent/tweet?'
      + twitterParameters.join('&');
    Linking.openURL(url)
      .then((data) => {
        Alert.alert('Twitter Opened');
      })
      .catch(() => {
        Alert.alert('Something went wrong');
      });
  };


  const shareScore = () => {
    const textShare = rows
      ?.map((row, i) =>
        row?.map((cell, j) => colorsToEmoji[getCellBGCOlor(i, j)]).join(''),
      )
      .filter(row => row)
      .join('\n');

    Clipboard.setString(textShare);
    Alert.alert('Copied Successfully!', 'Share it with your friends!');
    console.log(textShare);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      setSecondsTillTomorrow((tomorrow - now) / 1000);
    };

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatSeconds = () => {
    const hours = Math.floor(secondsTillTomorrow / (60 * 60));

    const minutes = Math.floor((secondsTillTomorrow % (60 * 60)) / 60);

    const seconds = Math.floor(secondsTillTomorrow % 60);

    return `${hours}:${minutes}:${seconds}`;
  };

  const readState = async () => {
    const dataString = await AsyncStorage.getItem('gameState');

    let data;

    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.log(e);
    }

    console.log('data : ', data);

    const keys = Object.keys(data);

    const values = Object.values(data);

    console.log(values);

    setPlayed(keys.length);

    const numberOfWins = values.filter(
      value => value.gameState === 'Won',
    ).length;

    setWinRate(Math.floor((numberOfWins / keys.length) * 100));

    let _curStreak = 0;

    let maxStreak = 0;

    let prevDay = 0;

    keys.forEach(key => {
      const day = parseInt(key.split('-')[1]);
      console.log(day);
      if (data[key].gameState === 'Won' && _curStreak === 0) {
        _curStreak += 1;
      } else if (data[key].gameState === 'Won' && prevDay + 1 === day) {
        _curStreak += 1;
      } else {
        if (_curStreak > maxStreak) {
          maxStreak = _curStreak;
        }
        _curStreak = data[key].gameState === 'Won' ? 1 : 0;
      }
      prevDay = day;
    });

    console.log(_curStreak, maxStreak);
    setCurStreak(_curStreak);
    setMaxStreak(maxStreak);

    const dist = [0, 0, 0, 0, 0, 0];

    values.map(value => {
      if (value.gameState === 'Won') {
        const tries = value.rows.filter(row => row[0]).length;

        dist[tries] += 1;
      }
    });

    setDistribution(dist);
  };

  useEffect(() => {
    readState();
  }, []);

  return (
    <View style={{width: '100%', alignItems: 'center'}}>
       <Animated.Text
        entering={SlideInLeft.springify().mass(0.5)}
        style={styles.title}
      >
        {won ? 'Congrats!' : 'Try again tomorrow :('}
      </Animated.Text>

      <Animated.View entering={SlideInLeft.delay(100).springify().mass(0.5)}>
      <Text style={styles.subtitle}>STATISTICS</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 20,
        }}>
        <Number number={played} label="Playing" />
        <Number number={winRate} label="Win%" />
        <Number number={curStreak} label="Curr Streak" />
        <Number number={maxStreak} label="Max Streak" />
      </View>

      </Animated.View>

      <Text style={styles.subtitle}>Guess Distribution</Text>

      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{width: '100%'}}>
        <GuessDistribution distribution={distribution} />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.springify().mass(0.5)} style={{flexDirection: 'row', padding: 10}}>
        <View style={{alignItems: 'center', flex: 1}}>
          <Text style={{color: colors.lightgrey}}>Next Wordle</Text>
          <Text
            style={{color: colors.lightgrey, fontSize: 24, fontWeight: 'bold'}}>
            {formatSeconds()}
          </Text>
        </View>

        <Pressable
          onPress={shareScore}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{color: colors.lightgrey, fontWeight: 'bold'}}>
            Share
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default EndScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  number: {
    alignItems: 'center',
    margin: 10,
  },
  numberText: {
    fontSize: 30,
    color: colors.lightgrey,
    fontWeight: 'bold',
  },
  numberLabel: {
    fontSize: 16,
    color: colors.lightgrey,
  },
});
