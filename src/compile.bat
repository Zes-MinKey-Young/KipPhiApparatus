cmd /k tsc easing.ts ui.ts util.ts operation.ts jumparray.ts settings.ts sideEditor.ts selectionManager.ts eventCurveEditor.ts notesEditor.ts editor.ts note.ts judgeline.ts chart.ts  event.ts audio.ts images.ts player.ts time.ts main.ts --target ES2016 --lib dom,ES2016 --outFile ../dist/index.js
tsc -p src/testc.json
node --enable-source-maps dist/test.js