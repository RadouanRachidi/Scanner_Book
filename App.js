import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet, Button, Dimensions, Image, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import MapView, { Marker } from 'react-native-maps';
import data from './data';

const Stack = createStackNavigator();

const LOGIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Bienvenue sur SpotiBook</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Scanner')}>
                <View style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function ScannerScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [text, setText] = useState('Non encore scanné');
    const [selectedBox, setSelectedBox] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [lastLoginTime, setLastLoginTime] = useState(null);

    const askForCameraPermission = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    useEffect(() => {
        askForCameraPermission();
    }, []);

    useEffect(() => {
        if (loggedIn) {
            setLastLoginTime(Date.now());
        }
    }, [loggedIn]);

    const handleBarCodeScanned = ({ data: scannedData }) => {
        if (!loggedIn && scannedData === '1234567891012345') {
            setLoggedIn(true);
            setUser({ firstName: 'Tom', lastName: 'Gérard' });
            setScanned(false);
            setText('Connexion réussie !');
        } else if (loggedIn && selectedBox && !selectedBook) {
            const bookId = parseInt(scannedData);
            const selectedBook = selectedBox.books.find((book) => book.id === bookId);

            if (selectedBook) {
                setSelectedBook(selectedBook);
                selectedBox.books = selectedBox.books.filter((book) => book.id !== bookId);
                setScanned(false);
                setText('Livre sélectionné ! Scannez un autre livre ou déposez le livre actuel.');
            } else {
                setScanned(false);
                setText('ID de livre invalide. Veuillez scanner un autre livre.');
            }
        }
    };

    const handleBookTake = () => {
        if (selectedBox && selectedBook) {
            setSelectedBook(null);
            setText('Livre pris avec succès !');
            // Vérifier le délai de connexion
            if (lastLoginTime && Date.now() - lastLoginTime > LOGIN_TIMEOUT) {
                // Si le délai de connexion est dépassé, réinitialiser l'état de connexion
                setLoggedIn(false);
                setUser(null);
                setLastLoginTime(null);
            } else {
                // Réinitialiser l'état de la boîte sélectionnée pour revenir à la sélection sur la carte
                setSelectedBox(null);
            }
        }
    };

    const handleBookDeposit = () => {
        if (selectedBox && selectedBook) {
            selectedBox.books.push(selectedBook);
            setSelectedBook(null);
            setText('Livre déposé avec succès !');
        }
    };

    const renderBooks = () => {
        return (
            <View>
                <Text style={styles.instruction}>Liste des livres :</Text>
                {selectedBox.books.map((book) => (
                    <View key={book.id} style={styles.bookContainer}>
                        <Text style={styles.bookId}>ID : {book.id}</Text>
                        <View>
                            <Text style={styles.bookTitle}>Titre : {book.title}</Text>
                            <Text style={styles.bookAuthor}>Auteur : {book.author}</Text>
                            <Image source={book.image} style={styles.bookImage} />
                            <Text style={styles.bookSynopsis}>Synopsis : {book.synopsis}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.instruction}>Demande de permission pour la caméra...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.instruction}>Pas d'accès à la caméra</Text>
                <Button title={'Autoriser la caméra'} onPress={() => askForCameraPermission()} />
            </View>
        );
    }

    if (!loggedIn) {
        return (
            <View style={styles.container}>
                <Text style={styles.instruction}>Veuillez scanner le code QR pour vous connecter</Text>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={styles.scanner}
                />
                {scanned && (
                    <Button
                        title={'Scanner à nouveau ?'}
                        onPress={() => {
                            setScanned(false);
                            setText('Non encore scanné');
                        }}
                        color="tomato"
                    />
                )}
                <Text style={styles.text}>{text}</Text>
            </View>
        );
    }

    if (loggedIn && !selectedBox) {
        return (
            <View style={styles.container}>
                <MapView style={styles.map} initialRegion={{ latitude: 48.8566, longitude: 2.3522, latitudeDelta: 8, longitudeDelta: 8 }}>
                    {data.boxes.map((box) => (
                        <Marker
                            key={box.id}
                            coordinate={{ latitude: box.latitude, longitude: box.longitude }}
                            onPress={() => setSelectedBox(box)}
                        />
                    ))}
                </MapView>
                <Text style={styles.instruction}>Bienvenue, {user.firstName} {user.lastName} !</Text>
                <Text style={styles.instruction}>Sélectionnez une boîte pour voir ses livres</Text>
                <Text style={styles.text}>{text}</Text>
            </View>
        );
    }

    if (loggedIn && selectedBox && !selectedBook) {
        return (
            <View style={styles.container}>
                <Text style={styles.instruction}>Boîte : {selectedBox.location}</Text>
                {renderBooks()}
                <Text style={styles.instruction}>Sélectionnez un livre en scannant son code QR</Text>
                <Button
                    title={'Emprunter un livre'}
                    onPress={() => navigation.navigate('Scanner')}
                />
                <Text style={styles.text}>{text}</Text>
            </View>
        );
    }

    if (loggedIn && selectedBox && selectedBook) {
        return (
            <View style={styles.container}>
                <Text style={styles.instruction}>Boîte : {selectedBox.location}</Text>
                <Text style={styles.instruction}>Titre : {selectedBook.title}</Text>
                <Text style={styles.instruction}>ID : {selectedBook.id}</Text>
                <Button
                    title={'Scanner un autre livre ?'}
                    onPress={() => {
                        setSelectedBook(null);
                        setText('Non encore scanné');
                    }}
                    color="tomato"
                />
                <Button title={'Prendre le livre'} onPress={handleBookTake} color="green" />
                <Button title={'Déposer le livre'} onPress={handleBookDeposit} color="blue" />
                <Text style={styles.text}>{text}</Text>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 24,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
    },
    instruction: {
        fontSize: 20,
        marginBottom: 10,
    },
    scanner: {
        width: Dimensions.get('window').width - 20,
        height: Dimensions.get('window').height / 2,
        marginBottom: 10,
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    text: {
        fontSize: 18,
        marginTop: 10,
    },

    bookContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookId: {
        fontSize: 16,
        color: 'gray',
        marginRight: 10,
        width: 40,
    },
    bookTitle: {
        fontSize: 16,
        marginLeft: 10,
    },
});

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Scanner" component={ScannerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
