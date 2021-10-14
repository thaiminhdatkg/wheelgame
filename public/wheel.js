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

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

socket.on('usernames', (data) => {
    console.log(data)
})

const app = angular.module('myApp', [])
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

app.controller('mainController', function ($scope, $timeout) {
    $scope.gameMessage = 'Quay đi'
    $scope.isWheelRunning = false
    $scope.showResult = false
    $scope.username = localStorage.getItem(USERNAME_CACHED)
    $scope.chatList = []
    $scope.lastResult = {
        user: null,
        result: null
    }

    $scope.requestSendMessage = () => {
        socket.emit('send-message', $scope.chatMessage);
        $scope.chatMessage = ''
        toastr.info('Là sao')
    }
    $scope.requestAnotherUser = () => {
        localStorage.removeItem(USERNAME_CACHED)
        location.reload()
    }

    socket.on('new-message', (data) => {
        console.log(data)
        // $scope.chatList.push(data)
        // $scope.$apply()
        toastr.info(data.message, data.nickname)
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
            'callbackFinished' : (data) => {
                $scope.isWheelRunning = false
                wheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
                wheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
                wheel.draw();                // Call draw to render changes to the wheel.
                drawTriangle()
                //
                $scope.showResult = true
                $scope.wheelMessage = data.text
                $scope.$apply()
                $timeout(() => {
                    $scope.gameMessage = `${$scope.lastResult.user} đã quy vào ô ${data.text}`
                    $scope.showResult = false
                }, 2000)
            },  // Function to call whent the spinning has stopped.
            'callbackAfter': drawTriangle,
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
    drawTriangle();

    wheel.animation.spins = 10;

    $scope.startWheel = function () {
        if ($scope.isWheelRunning === true) return
        socket.emit('get-new-wheel-result')
    }
    //
    socket.emit('get-new-wheel-list')
    socket.on('set-new-wheel-list', (list) => {
        for (let i = 0; i < wheel.segments.length; i++) {
            wheel.deleteSegment()
        }
        list.map((v, i) => {
            wheel.addSegment({
                fillStyle: colorArray[i],
                text: v.text.split(' ').join('\n')
            })
        })
        wheel.draw()
        //
        drawTriangle()
    })
    socket.on('set-new-wheel-result', ({result, user}) => {
        $scope.$apply(() => {
            $scope.isWheelRunning = true
            $scope.gameMessage = `${user} đang quay, vui lòng đợi kết quả`
            $scope.lastResult = {
                user, result
            }
        })
        let stopAngle = wheel.getRandomForSegment(result)
        wheel.animation.stopAngle = stopAngle;
        wheel.startAnimation()
    })
    //
    $('#wheelcanvas').click(function () {
        $scope.startWheel()
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
    // if (indicatedSegment.text == 'LOOSE TURN') {
    //     alert('Sorry but you loose a turn.');
    // } else if (indicatedSegment.text == 'BANKRUPT') {
    //     alert('Oh no, you have gone BANKRUPT!');
    // } else {
    //     alert("You have won " + indicatedSegment.text);
    // }
    //
    //
    

    wheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    wheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    wheel.draw();                // Call draw to render changes to the wheel.
    drawTriangle()
}

    
 
    function drawTriangle()
    {
        // Get the canvas context the wheel uses.
        let ctx = wheel.ctx;
 
        ctx.strokeStyle = 'navy';     // Set line colour.
        ctx.fillStyle   = 'aqua';     // Set fill colour.
        ctx.lineWidth   = 2;
        ctx.beginPath();              // Begin path.
        ctx.moveTo(350, 5);           // Move to initial position.
        ctx.lineTo(450, 5);           // Draw lines to make the shape.
        ctx.lineTo(400, 60);
        ctx.lineTo(350, 5);
        ctx.stroke();                 // Complete the path by stroking (draw lines).
        ctx.fill();                   // Then fill.
    }