import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned')

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data)
    console.log('Type: ' + type + '\nData: ' + data)
  };

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>)
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }

  // Return the View
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }} />
      </View>
      <Text style={styles.maintext}>{text}</Text>

      {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />}
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
    backgroundColor: 'tomato'
  }
});

// Importer les dépendances
const express = require('express');
const mongoose = require('mongoose');

// Créer une instance de l'application Express
const app = express();

// Configuration de la connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Définition du modèle de données pour une boîte à livres
const boxSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }]
});

const Box = mongoose.model('Box', boxSchema);

// Définition du modèle de données pour un livre
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
});

const Book = mongoose.model('Book', bookSchema);

// Middleware pour parser les données JSON
app.use(express.json());

// Endpoint pour créer une nouvelle boîte à livres
app.post('/boxes', async (req, res) => {
  try {
    const { location, books } = req.body;

    const box = new Box({
      location,
      books
    });

    await box.save();

    res.status(201).json(box);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a new box' });
  }
});

// Endpoint pour récupérer toutes les boîtes à livres
app.get('/boxes', async (req, res) => {
  try {
    const boxes = await Box.find().populate('books');

    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boxes' });
  }
});

// Endpoint pour créer un nouveau livre
app.post('/books', async (req, res) => {
  try {
    const { title, author } = req.body;

    const book = new Book({
      title,
      author
    });

    await book.save();

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a new book' });
  }
});

// Endpoint pour récupérer tous les livres
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
