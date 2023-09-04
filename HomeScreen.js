import React from 'react';
import { View, Text, StyleSheet, Button, ImageBackground } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <ImageBackground
            source={require('/backgroundImage.jpg')} 
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <Text style={styles.welcomeText}>Bienvenue sur SpotiBook</Text>
                <Button
                    title="Se connecter"
                    onPress={() => navigation.navigate('Scanner')}
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        color: 'white',
        marginBottom: 20,
    },
});

export default HomeScreen;
