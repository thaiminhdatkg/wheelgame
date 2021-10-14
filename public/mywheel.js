(function () {
    let moduleName = 'crln.components.crwheel'
    let directiveName = 'crwheel'
    let module
    try {
        module = angular.module(moduleName)
    } catch (err) {
        module = angular.module(moduleName, [])
    }
    module.directive(directiveName, function () {
        return {
            restrict: 'E',
            template: '',
            scope: {
                canvasId: '@?',
                centerX: '=?', centerY: '=?',
                outerRadius: '=?', innerRadius: '=?',
                numSegments: '=?', 
                drawMode: '=?',
                rotationAngle: '=?',
                textFontFamily: '=?', textFontSize: '=?', textFontWeight: '=?', textOrientation: '=?',
                textAlignment: '=?', textDirection: '=?', textMargin: '=?', textFillStyle: '=?',
                textStrokeStyle: '=?',
                textLineWidth: '=?',
                fillStyle: '=?',
                strokeStyle: '=?',
                lineWidth: '=?',
                clearTheCanvas: '=?',
                imageOverlay: '=?',
                drawText: '=?',
                pointerAngle: '=?',
                wheelImage: '=?',
                imageDirection: '=?',
                responsive: '=?',
                scaleFactor: '=?',
                segments: '=?',
                animation: '=?',
                pointerGuide: '=?',
                Pins: '=?'
            },
            compile: function (element, attrs) {
                const defaultOpts = {
                    canvasId: 'canvas',
                    centerX: null, centerY: null,
                    outerRadius: null, innerRadius: 0,
                    numSegments: 1, 
                    drawMode: 'code', /* code | image | segmentImage */
                    rotationAngle: 0,
                    textFontFamily: 'Arial', textFontSize: 20, 
                    textFontWeight: 'bold', 
                    textOrientation: 'horizontal', /* horizontal | vertical | curved */
                    textAlignment: 'center', 
                    textDirection: 'normal', 
                    textMargin: null, textFillStyle: 'black',
                    textStrokeStyle: null,
                    textLineWidth: 1,
                    fillStyle: 'sliver',
                    strokeStyle: 'black',
                    lineWidth: 1,
                    clearTheCanvas: true,
                    imageOverlay: false,
                    drawText: true, /* true for code wheels, false for image wheels */
                    pointerAngle: 0, /* so at the top / 12 o'clock position */
                    wheelImage: null,
                    imageDirection: 'N', /* N, S, E, W */
                    responsive: false, /* starts at 1 */
                    scaleFactor: 1.0,
                    segments: '=?',
                    animation: '=?',
                    pointerGuide: '=?',
                    Pins: '=?',
                    control: '=?'
                }
            },
            link: function(scope, element, attrs) {
                scope.internalControl = scope.control || {}
                const mcanvas = angular.element(`<canvas id='${scope.canvasId}'></canvas>`)
                element.append(mcanvas)
                let theWheel = new Winwheel({
                })
            }
        }
    })
})();