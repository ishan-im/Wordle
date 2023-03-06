import React, {useState, useEffect,Fragment} from 'react';

import {Text, View, ScrollView, Alert, ActivityIndicator} from 'react-native';

import {colors, CLEAR, ENTER, colorsToEmoji} from './../../constants';

import Keyboard from './../Keyboard/Keyboard';

import Clipboard from '@react-native-clipboard/clipboard';

import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Game.styles';

import Animated, {SlideInLeft,ZoomIn,FlipInEasyY} from 'react-native-reanimated';

const NUMBER_OF_TRIES = 6;

import {copyArr, getDayOfTheYear, getDayKey} from './../../utils';

import EndScreen from '../EndScreen/EndScreen';

const key = getDayKey();

const Game = () => {

  AsyncStorage.removeItem('gameState');

  const word = 'hello';

  const letters = word.split('');

  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill('')),
  );

  const [currentRow, setCurrentRow] = useState(0);

  const [currentColumn, setCurrentColumn] = useState(0);

  const [gameState, setGameState] = useState('Playing');

  const [loaded, setLoaded] = useState(false);

  const persistState = async () => {
    const dataForToday = {
      rows,
      currentRow,
      currentColumn,
      gameState,
    };

    try {
      const existingStateString = await AsyncStorage.getItem('gameState');

      const existingState = existingStateString
        ? JSON.parse(existingStateString)
        : {};

      existingState[key] = dataForToday;

      const dataToSave = JSON.stringify(existingState);

      console.log('dataToSave', dataToSave);

      await AsyncStorage.setItem('gameState', dataToSave);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (loaded) {
      persistState();
    }
  }, [rows, currentRow, currentColumn, gameState]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('gameState');

      console.log('value', value);

      if (value !== null) {
        // value previously stored

        const data = JSON.parse(value);

        const day = data[key];

        console.log('data', data);

        setRows(day.rows);
        setCurrentRow(day.currentRow);
        setCurrentColumn(day.currentColumn);
        setGameState(day.gameState);
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }

    setLoaded(true);
  };

  const onKeyPress = key => {
    if (gameState !== 'Playing') {
      return;
    }

    const updatedRows = copyArr(rows);

    if (key === CLEAR) {
      const prevCol = currentColumn - 1;
      if (prevCol >= 0) {
        updatedRows[currentRow][prevCol] = '';
        setRows(updatedRows);
        setCurrentColumn(prevCol);
      }

      return;
    }

    if (key === ENTER) {
      if (currentColumn == rows[0].length) {
        setCurrentRow(currentRow + 1);
        setCurrentColumn(0);
      }

      return;
    }

    if (currentColumn < rows[0].length) {
      updatedRows[currentRow][currentColumn] = key;

      setRows(updatedRows);

      setCurrentColumn(currentColumn + 1);
    }
  };

  const isCellActive = (row, column) => {
    return row === currentRow && column === currentColumn;
  };

  const getCellBGCOlor = (row, column) => {
    const letter = rows[row][column];

    if (row >= currentRow) return colors.black;

    if (letter === letters[column]) return colors.primary;

    if (letters.includes(letter)) return colors.secondary;

    return colors.darkgrey;
  };

  const getCapsWithColor = color => {
    return rows?.flatMap((row, i) =>
      row?.filter((cell, j) => getCellBGCOlor(i, j) === color),
    );
  };

  const greenCaps = getCapsWithColor(colors.primary);
  const yellowCaps = getCapsWithColor(colors.secondary);
  const blackCaps = getCapsWithColor(colors.black);

  const checkIfWon = () => {
    const row = rows[currentRow - 1];

    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return !checkIfWon() && currentRow === rows.length;
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState !== 'Won') {
      setGameState('Won');
    } else if (checkIfLost() && gameState !== 'Lost') {
      setGameState('Lost');
    }
  };

  useEffect(() => {
    if (currentRow > 0) {
      checkGameState();
    }
  }, [currentRow]);

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

  const getCellColor = (id, idx) => [
    styles.cell,
    {
      borderColor: isCellActive(id, idx) ? colors.lightgrey : colors.darkgrey,

      backgroundColor: getCellBGCOlor(id, idx),
    },
  ];

  if (!loaded) {
    return <ActivityIndicator />;
  }

  if (gameState !== 'Playing') {
    return (
      <EndScreen
        won={gameState === 'Won'}
        rows={rows}
        getCellBGCOlor={getCellBGCOlor}
      />
    );
  }

  return (
    <>
      <ScrollView style={styles.map}>
        {rows?.map((row, id) => (
          <Animated.View
            entering={SlideInLeft.delay(id * 50)}
            style={styles.row}
            key={`row - ${id}`}>
            {row?.map((cell, idx) => (
              <Fragment key={id + idx}>
                {id < currentRow && (
                  <Animated.View entering={FlipInEasyY.delay(idx * 150)} style={getCellColor(id, idx)} key={`cell-color-${id}-${idx}`}>
                    <Text  style={styles.cellText}>{cell.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {id === currentRow && !!cell && (
                  <Animated.View entering={ZoomIn} style={getCellColor(id, idx)} key={`cell-active-${id}-${idx}`}>
                    <Text style={styles.cellText}>{cell.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {!cell && (
                  <View style={getCellColor(id, idx)} key={`cell-${id}-${idx}`}>
                    <Text style={styles.cellText}>{cell.toUpperCase()}</Text>
                  </View>
                )}
              </Fragment>
            ))}
          </Animated.View>
        ))}
      </ScrollView>

      <Keyboard
        onKeyPressed={onKeyPress}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={blackCaps}
      />
    </>
  );
};

export default Game;
