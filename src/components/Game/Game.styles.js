import {
    StyleSheet,
   
  } from 'react-native';
  
  import {colors,} from './../../constants';

export default styles = StyleSheet.create({
    map: {
      alignSelf: 'stretch',
      height: 100,
      marginVertical: 20,
    },
    row: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    cell: {
      flex: 1,
      borderWidth: 3,
      borderCOlor: colors.darkgrey,
      aspectRatio: 1,
      margin: 3,
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 70,
    },
    cellText: {
      color: colors.lightgrey,
      fontSize: 32,
      fontWeight: 'bold',
    },
  });