import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import data from './data';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data: scannedData }) => {
    setScanned(true);
    setText(scannedData);
  
    // Find the box based on the scanned data (ID)
    const selectedBox = data.boxes.find((box) => box.books.includes(parseInt(scannedData)));
  
    if (selectedBox) {
      setSelectedBox(selectedBox);
  
      // Find the book based on the box's book ID
      const selectedBook = data.books.find((book) => book.id === parseInt(scannedData));
  
      if (selectedBook) {
        setSelectedBook(selectedBook);
      }
    }
  
    console.log('Type: ' + type + '\nData: ' + scannedData);
  };

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>
    );
  }

  if (selectedBox && selectedBook) {
    return (
      <View style={styles.container}>
        <Text>Box: {selectedBox.location}</Text>
        <Text>Title: {selectedBook.title}</Text>
        <Text>Author: {selectedBook.author}</Text>
        <Button title={'Scan again?'} onPress={() => setScanned(false)} color="tomato" />
      </View>
    );
  }

  // Return the default scanner view
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>

      {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color="tomato" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato',
  },
});
