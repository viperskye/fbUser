const ACCESS_TOKEN = 'Token here';
const FANPAGE_LINK = 'Fanpage link';
const NUMBER_POST = '5';

const SEND_MESSAGE = false; // Set true if you want to enable auto send message
const MESSAGE_TAG = 'hanoi'; //User who have this TAG will recieve your messages
const TIME_DELAY = 3; // Time delay of each message
const MESSAGE_TEXT = `Hello, bla bla bla`  // Content of message you want to send


const REMOVE_OLD = false; // WARNING:  default is false, set true if you want to delete all old data;

module.exports = {
    ACCESS_TOKEN,
    FANPAGE_LINK,
    NUMBER_POST,
    REMOVE_OLD,
    MESSAGE_TAG,
    TIME_DELAY,
    SEND_MESSAGE,
    MESSAGE_TEXT,
}