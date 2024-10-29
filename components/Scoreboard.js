import { useState, useEffect } from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import Footer from './Footer';
import { SCORE_BOARD_KEY } from '../constants/Game';
import styles from '../style/style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MAX_DISPLAYED_SCORES = 7; 

const Scoreboard = () => {
    const navigation = useNavigation();
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        });
        return unsubscribe;
    }, [navigation]);

    const getScoreboardData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCORE_BOARD_KEY);
            if (jsonValue !== null) {
                const tmpScores = JSON.parse(jsonValue);
                tmpScores.sort((a, b) => b.points - a.points);
                setScores(tmpScores.slice(0, MAX_DISPLAYED_SCORES));
                console.log('Scoreboard: Read successful. Number of scores: ' + tmpScores.length);
            }
        } catch (e) {
            console.log('Read error: ' + e);
        }
    };

    const clearScoreboard = async () => {
        try {
            await AsyncStorage.removeItem(SCORE_BOARD_KEY);
            setScores([]);
        } catch (e) {
            console.log('Scoreboard: Clear error: ' + e);
        }
    };

    return (
        <>
            <Header />
            <View style={styles.scoreboardContainer}>
                <Text style={styles.title}>Mini-Yahtzee</Text>
                <MaterialCommunityIcons name="clipboard-list" style={styles.clipboardIcon} />
                <Text style={styles.subtitle}>Top Seven</Text>
                <ScrollView style={styles.scoreList}>
                    {scores.length === 0 ? (
                        <Text style={styles.noScoresText}>No scores available.</Text>
                    ) : (
                        scores.map((score, index) => (
                            <View key={index} style={styles.scoreItem}>
                                <Text style={styles.scoreText}>{`${index + 1}. ${score.name}`}</Text>
                                <Text style={styles.scoreDetails}>
                                    {`${score.date} ${score.time} `}
                                    <Text style={styles.scorePoints}>{score.points}</Text>
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
                <Pressable style={styles.clearButton} onPress={clearScoreboard}>
                    <Text style={styles.clearButtonText}>CLEAR SCOREBOARD</Text>
                </Pressable>
            </View>
            <Footer />
        </>
    );
};

export default Scoreboard;
