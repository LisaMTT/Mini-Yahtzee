import { Text, View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '../style/style';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Container, Row, Col } from 'react-native-flex-grid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    NBR_OF_DICES,
    NBR_OF_THROWS,
    MAX_SPOT,
    SCORE_BOARD_KEY
} from '../constants/Game';

let board = [];

const Gameboard = ({ route, navigation }) => {
    const [turn, setTurn] = useState(1);
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('Throw dices.');
    const [gameEndStatus, setGameEndStatus] = useState(false);
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
    const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0));
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(false));
    const [playerName, setPlayerName] = useState('');
    const [scores, setScores] = useState([]);
    const [isPointsSaved, setIsPointsSaved] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player);
        }
    }, [route.params?.player]);

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
                setScores(tmpScores);
                console.log('Gameboard: Read successful. Number of scores:', tmpScores.length);
            }
        } catch (e) {
            console.log('Gameboard: Read error: ' + e);
        }
    };

    const calculateTurnPoints = (spot) => {
        return diceSpots.reduce((total, value) => (value === spot ? total + value : total), 0);
    };

    const calculateTotalPoints = () => {
        return dicePointsTotal.reduce((total, points) => total + points, 0);
    };

    const savePlayerPoints = async () => {
        if (isPointsSaved) {
            setStatus('Points have already been saved.');
            return;
        }

        const playerPoints = {
            key: scores.length + 1,
            name: playerName,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            points: totalPoints,
        };

        try {
            const newScore = [...scores, playerPoints];
            const jsonValue = JSON.stringify(newScore);
            await AsyncStorage.setItem(SCORE_BOARD_KEY, jsonValue);
            setScores(newScore);
            setIsPointsSaved(true);
            setStatus('Points saved successfully!');
            console.log('Gameboard: save successful', jsonValue);
        } catch (e) {
            console.log('Gameboard: Save error: ' + e);
        }
    };

    const throwDices = () => {
        if (gameEndStatus) {
            setStatus('Game over. Please start a new game.');
            return;
        }

        if (nbrOfThrowsLeft <= 0) {
            setStatus('No throws left for this turn. Select points or start a new turn.');
            return;
        }

        const spots = [...diceSpots];
        for (let i = 0; i < NBR_OF_DICES; i++) {
            if (!selectedDices[i]) {
                const randomNumber = Math.floor(Math.random() * 6) + 1;
                board[i] = `dice-${randomNumber}`;
                spots[i] = randomNumber;
            }
        }

        setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
        setDiceSpots(spots);
        setStatus('Select and throw dices again');
    };

    const chooseDice = (i) => {
        if (nbrOfThrowsLeft < NBR_OF_THROWS && !gameEndStatus) {
            const dices = [...selectedDices];
            dices[i] = !dices[i];
            setSelectedDices(dices);
        } else {
            setStatus('You have to throw dices first.');
        }
    };

    const chooseDicePoints = (spot) => {
        if (nbrOfThrowsLeft > 0) {
            setStatus(`Finish all ${NBR_OF_THROWS} throws before selecting points.`);
            return;
        }

        if (selectedDicePoints[spot]) {
            setStatus(`Points for ${spot + 1} have already been selected.`);
            return;
        }

        const points = calculateTurnPoints(spot + 1);
        const updatedPointsTotal = [...dicePointsTotal];
        const updatedSelectedPoints = [...selectedDicePoints];
        updatedPointsTotal[spot] = points;
        updatedSelectedPoints[spot] = true;

        setDicePointsTotal(updatedPointsTotal);
        setSelectedDicePoints(updatedSelectedPoints);
        setTotalPoints(totalPoints + points);
        setStatus(`Points for ${spot + 1} selected. Total: ${calculateTotalPoints()}`);

        nextTurn();
    };

    const nextTurn = () => {
        if (turn >= 6) {
            setGameEndStatus(true);
            setStatus('Game over! Save your points.');
        } else {
            setTurn(turn + 1);
            setNbrOfThrowsLeft(NBR_OF_THROWS);
            setSelectedDices(new Array(NBR_OF_DICES).fill(false));
            setStatus(`Turn ${turn + 1}: Throw dices.`);
        }
    };

    const resetGame = () => {
        setTurn(1);
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        setDiceSpots(new Array(NBR_OF_DICES).fill(0));
        setSelectedDices(new Array(NBR_OF_DICES).fill(false));
        setDicePointsTotal(new Array(MAX_SPOT).fill(0));
        setSelectedDicePoints(new Array(MAX_SPOT).fill(false));
        setTotalPoints(0);
        setIsPointsSaved(false);
        setGameEndStatus(false);
        setStatus('New game started! Throw dices.');
    };

    const dicesRow = Array.from({ length: NBR_OF_DICES }, (_, i) => (
        <Col key={`dice${i}`}>
            <Pressable onPress={() => chooseDice(i)} style={styles.dicePressable}>
                <MaterialCommunityIcons name={board[i]} size={50} color={selectedDices[i] ? 'black' : '#ff4081'} />
            </Pressable>
        </Col>
    ));

    const pointsRow = Array.from({ length: MAX_SPOT }, (_, i) => (
        <Col key={`pointsRow${i}`} style={styles.col}>
            <Text style={styles.pointsRow}>{dicePointsTotal[i]}</Text>
        </Col>
    ));

    const pointsToSelectRow = Array.from({ length: MAX_SPOT }, (_, i) => (
        <Col key={`buttonsRow${i}`}>
            <Pressable onPress={() => chooseDicePoints(i)} style={styles.pointsPressable}>
                <MaterialCommunityIcons name={`numeric-${i + 1}-circle`} size={35} color={selectedDicePoints[i] ? 'black' : '#ff4081'} />
            </Pressable>
        </Col>
    ));

    return (
        <>
            <Header />
            <View style={styles.gameboard}>
                <Text style={styles.gameinfo}>Turn: {turn} / 6</Text>
                <Text style={styles.gameinfo}>Throws left: {nbrOfThrowsLeft}</Text>
                <Container>
                    <Row>{dicesRow}</Row>
                </Container>
                <Text style={styles.gameinfo}>{status}</Text>
                <Pressable
                    style={styles.throwDice}
                    onPress={throwDices}
                    disabled={gameEndStatus || nbrOfThrowsLeft <= 0}
                >
                    <Text style={styles.buttonText}>THROW DICES</Text>
                </Pressable>
                <Text style={styles.totalPoints}> Total points:{totalPoints}</Text>
                <Container style={styles.pointsRow} >
                    <Row>{pointsRow}</Row>
                </Container>
                <Container style={styles.selectRow}>
                    <Row>{pointsToSelectRow}</Row>
                </Container>
                <Text style={styles.playerName}>Player: {playerName}</Text>
                <Pressable
                    style={[
                        styles.saveButton,
                        isPointsSaved && styles.disabledButton
                    ]}
                    onPress={savePlayerPoints}
                    disabled={!gameEndStatus || isPointsSaved}
                >
                    <Text style={styles.saveButtonText}>
                        {isPointsSaved ? 'Points Saved' : 'Save Player Points'}
                    </Text>
                </Pressable>
                <Pressable style={styles.throwDice} onPress={resetGame}>
                    <Text style={styles.buttonText}>NEW GAME</Text>
                </Pressable>
                <Footer />
            </View>
            
        </>
    );
};

export default Gameboard;
