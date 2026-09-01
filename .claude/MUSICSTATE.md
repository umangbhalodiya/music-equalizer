resolve the browser console error :

index.ts:20 Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.

redux-persist.js?v=10e25baa:161 Uncaught TypeError: storage.getItem is not a function
at index.ts:31:26

and then implement as per below

I've implemented the redux toolkit and redux persist to keep the selected music, music presets, and music equalizer settings as it is even after reload

- we need to persist the selected presets, music equlizer settings, selected music, and the duration of music to continue from the same after page reload

- use musicSlice to manage states. you can add new states accordingly and use setMusicStates to set the states accordingly
