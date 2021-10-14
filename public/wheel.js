const socket = io()
const inputMessage = document.getElementById('input-message')
const buttonSend = document.getElementById('btn-send')
const USERNAME_CACHED = 'WHEEL_USERNAME_CACHED'

var username = localStorage.getItem(USERNAME_CACHED)

if (username === null) {
    username = prompt('Please type your name:')
    localStorage.setItem(USERNAME_CACHED, username)
}

socket.emit('new-user', {name: username})

socket.on('usernames', (data) => {
    console.log(data)
})

const app = angular.module('app', [])
var wheel = null

var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

app.controller('MainController', function ($scope) {
    $scope.username = localStorage.getItem(USERNAME_CACHED)
    $scope.chatList = []

    $scope.requestSendMessage = () => {
        socket.emit('send-message', $scope.chatMessage);
        $scope.chatMessage = ''
    }
    $scope.requestAnotherUser = () => {
        localStorage.removeItem(USERNAME_CACHED)
        location.reload()
    }

    socket.on('new-message', (data) => {
        $scope.chatList.push(data)
        $scope.$apply()
    })
    //
    //
    wheel = new Winwheel({
        canvasId: 'wheelcanvas',
        'outerRadius'     : 256,        // Set outer radius so wheel fits inside the background.
        'innerRadius'     : 75,         // Make wheel hollow so segments dont go all way to center.
        'textFontSize'    : 16,         // Set default font size for the segments.
        'textAlignment'   : 'center',    // Align text to outside of wheel.
        'textOrientation'   : 'curved', /* horizontal | vertical | curved */
        'numSegments'     : 0,         // Specify number of segments.
        'segments'        : [],
        'animation' :           // Specify the animation to use.
        {
            'type'     : 'spinToStop',
            'duration' : 10,
            'spins'    : 3,
            'callbackFinished' : alertPrize,  // Function to call whent the spinning has stopped.
            //'callbackSound'    : playSound,   // Called when the tick sound is to be played.
            'soundTrigger'     : 'pin'        // Specify pins are to trigger the sound.
        },
        'pins' :                // Turn pins on.
        {
            'number'     : 24,
            'fillStyle'  : 'silver',
            'outerRadius': 4,
        }
    })

    wheel.animation.spins = 10;

    $scope.startWheel = function () {
        //let stopAngle = wheel.getRandomForSegment(6)
        //wheel.animation.stopAngle = stopAngle;
        //wheel.startAnimation()
        socket.emit('get-new-wheel-result')
    }
    //
    console.log(wheel.segments)
    //
    socket.emit('get-new-wheel-list')
    socket.on('set-new-wheel-list', (list) => {
        //wheel.numSegments = list.length
        list.map((v, i) => {
            wheel.addSegment({
                fillStyle: colorArray[i],
                text: v.text.split(' ').join('\n')
            })
        })
        wheel.draw()
    })
    socket.on('set-new-wheel-result', (data) => {
        let stopAngle = wheel.getRandomForSegment(data)
        wheel.animation.stopAngle = stopAngle;
        wheel.startAnimation()
    })
})

app.directive('chatrun', function () {
    return {
        restrict: 'E',
        template: '<span style="font-weight: bold;">{{::nickname}}</span>:&nbsp;<span style="margin-left: 8px;">{{::message}}</span>',
        scope: {
            nickname: '@',
            message: '@'
        },
    }
})

function alertPrize(indicatedSegment) {
    // Display different message if win/lose/backrupt.
    if (indicatedSegment.text == 'LOOSE TURN') {
        alert('Sorry but you loose a turn.');
    } else if (indicatedSegment.text == 'BANKRUPT') {
        alert('Oh no, you have gone BANKRUPT!');
    } else {
        alert("You have won " + indicatedSegment.text);
    }
    //
    //
    wheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    wheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    wheel.draw();                // Call draw to render changes to the wheel.
}