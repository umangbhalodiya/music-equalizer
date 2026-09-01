You are working on an existing React + TypeScript music player application.

I want you to add a professional music Equalizer / Sound Effects panel to the existing music player.

IMPORTANT:

- Do NOT rebuild or replace the existing music player.
- Do NOT change the existing music player functionality.
- Reuse the existing music player, audio element, state management, styling conventions, and components wherever possible.
- Tone.js is ALREADY INSTALLED in the project. Use the existing Tone.js installation for all audio processing.
- Do NOT install another audio-processing/equalizer library.
- First inspect the existing project structure and understand how the current music player works.
- Then integrate the equalizer cleanly into the existing architecture.

REFERENCE DESIGN:
Use the uploaded reference image as the visual inspiration for the equalizer controls.

The reference has:

1. Circular rotary/dial controls
2. Dark purple circular background
3. Yellow/orange indicator/knob
4. Tick marks around the rotary control
5. Large circular center
6. Label above/below the control
7. Current value displayed underneath
8. A clean, modern music/audio-processing interface

==================================================

1. # EQUALIZER ENTRY POINT

When a music track is selected and is ready to play in the music player:

Show an additional button:

"Equalizer"

The Equalizer button should appear near the existing music player controls.

Before a track is selected/loaded:

- Equalizer can be hidden or disabled.

After a track is loaded:

- Equalizer button becomes available.

When the user clicks "Equalizer":

Expand an additional Equalizer section directly UNDER the music player.

Clicking it again should collapse the section.

Use a smooth expand/collapse animation.

================================================== 2. EQUALIZER PANEL LAYOUT
==================================================

Create a dedicated component:

EqualizerPanel.tsx

Suggested structure:

---

              Equalizer

---

[ Sound Profiles ]

[ Rock ] [ Concert Hall ] [ Hip Hop ]
[ Classic ] [ Dance ] [ Reverb ]
[ Pop ] [ Jazz ] [ Lo-Fi ]
[ Bass Boost ] [ Vocal ] [ Acoustic ]

---

             Sound Controls

     Rotary Control    Rotary Control
     Speed + Pitch     Post-Pitch

     [dial]             [dial]

       85%             -1 semitone


     Rotary Control    Rotary Control    Rotary Control

       Reverb          Bass Boost          Lo-Fi

       [dial]            [dial]             [dial]

      Handful             Off                Off

---

Use the reference image as the visual direction.

================================================== 3. SOUND PROFILE PRESETS
==================================================

Provide multiple ready-made sound profiles.

At minimum:

- Original
- Rock
- Pop
- Hip Hop
- Classic
- Dance
- Concert Hall
- Reverb
- Jazz
- Acoustic
- Bass Boost
- Vocal
- Lo-Fi
- Party

The profile buttons should be visually selectable.

The currently active profile must be clearly highlighted.

When the user selects a profile:

1. Update the Tone.js audio processing chain.
2. Update all rotary control values.
3. Update the UI immediately.
4. Apply the effect without restarting the song.
5. Preserve the current playback position.
6. Do not reload the audio file.

"Original" must completely bypass/reset the additional effects and return the audio to its original sound.

================================================== 4. FIVE MAIN ROTARY SOUND CONTROLS
==================================================

Create exactly 5 primary rotary controls inspired by the reference image.

Control 1:
Speed + Pitch

Range:
50% - 150%

Default:
100%

Behavior:

- Changes playback speed.
- Speed and pitch should change together when this control is adjusted.
- Use Tone.js-compatible audio processing.
- Do not create clicks/pops when changing the value.

Display:
"Speed + Pitch"

Example value:
"85%"

Dial:
50% on left
100% at top
150% on right

---

Control 2:
Post-Pitch

Range:
-6 to +6 semitones

Default:
0 semitones

Behavior:

- Apply pitch shifting after the speed/pitch processing.
- Use Tone.js PitchShift or the appropriate Tone.js node.
- Negative values lower pitch.
- Positive values increase pitch.

Display examples:

-1 semitone
0 semitones
+3 semitones

Dial:
-6 on left
0 at top
+6 on right

---

Control 3:
Reverb

Range:
0% - 100%

Default:
0%

Behavior:

- Control reverb wet/dry amount.
- Use Tone.js Reverb.
- Higher value should create a larger/more ambient sound.

Display examples:

Off
25%
50%
75%
100%

Also allow profile presets to set this value.

---

Control 4:
Bass Boost

Range:
0% - 100%

Default:
0%

Behavior:
Use Tone.js EQ/filter processing to boost low frequencies.

Suggested implementation:

- Tone.EQ3 or Tone.Filter
- Boost frequencies around approximately 80–150 Hz
- Map the UI percentage to an appropriate dB range.

Display examples:

Off
25%
50%
75%
100%

---

Control 5:
Lo-Fi

Range:
0% - 100%

Default:
0%

Behavior:
Create a lo-fi / degraded audio effect using Tone.js effects.

You may combine appropriate Tone.js nodes such as:

- BitCrusher
- Distortion
- Filter
- AutoFilter
- Chebyshev

Keep the effect musical and subtle.

Display examples:

Off
25%
50%
75%
100%

================================================== 5. TONE.JS AUDIO SIGNAL CHAIN
==================================================

Use Tone.js as the actual DSP/audio engine.

Do NOT implement fake UI-only equalizer controls.

The controls must actually affect the sound.

Create a reusable audio effects chain similar to:

Audio Source
↓
Speed / Pitch processing
↓
Post Pitch
↓
EQ / Bass
↓
Lo-Fi
↓
Reverb
↓
Destination

The exact Tone.js architecture can be adjusted depending on how the existing music player is implemented.

IMPORTANT:

Inspect the current audio implementation first.

If the project currently uses:

HTMLAudioElement
<video>
React audio player
Web Audio API
another existing audio abstraction

integrate Tone.js with that existing source instead of replacing the player.

Avoid creating multiple AudioContexts unnecessarily.

Create the Tone.js audio nodes once and reuse them.

Dispose Tone.js nodes correctly when the component/player is unmounted.

================================================== 6. ROTARY DIAL UI
==================================================

Create a reusable component:

RotaryKnob.tsx

Props should be something like:

interface RotaryKnobProps {
label: string;
value: number;
min: number;
max: number;
step?: number;
unit?: string;
onChange: (value: number) => void;
formatter?: (value: number) => string;
}

The rotary control should visually resemble the reference image.

Design:

- Outer circular dial
- Dark purple/near-black circular body
- Orange/yellow indicator
- Orange/yellow center circle
- Small tick marks around the circumference
- Indicator position should rotate according to the value
- Value should appear below the dial
- Label should appear above/below depending on layout
- Smooth interaction

Interaction:

Support:

- Mouse drag
- Vertical drag
- Click
- Touch drag if practical
- Keyboard accessibility

For example:

Dragging upward:
increase value

Dragging downward:
decrease value

Also allow clicking the dial.

Use pointer events instead of separate mouse/touch implementations where possible.

Prevent text selection while dragging.

================================================== 7. DIAL ANGLE
==================================================

Use approximately a 270-degree rotary range.

Example:

Minimum:
-135 degrees

Maximum:
+135 degrees

The top position represents the default/center value where appropriate.

For example:

Speed + Pitch:

50% 100% 150%
\ | /
\ | /
--------●--------

Post-Pitch:

-6 0 +6
\ | /
\ | /
--------●--------

Generate tick marks programmatically.

Do not manually hard-code every tick.

================================================== 8. SOUND PROFILE BOX
==================================================

Create a dedicated "Sound Profiles" section.

The profiles should be presented as buttons/cards.

Example:

┌──────────────────────────────────────────┐
│ Sound Profiles │
│ │
│ [Original] [Rock] [Pop] [Hip Hop] │
│ [Classic] [Dance] [Concert Hall] │
│ [Jazz] [Acoustic] [Party] │
│ [Reverb] [Bass Boost] [Lo-Fi] │
└──────────────────────────────────────────┘

When a profile is selected:

The five rotary controls automatically move/update to the preset values.

Example:

ROCK:

Speed + Pitch: 100%
Post-Pitch: 0
Reverb: 15%
Bass Boost: 65%
Lo-Fi: 0%

CONCERT HALL:

Speed + Pitch: 100%
Post-Pitch: 0
Reverb: 80%
Bass Boost: 10%
Lo-Fi: 0%

HIP HOP:

Speed + Pitch: 100%
Post-Pitch: 0
Reverb: 15%
Bass Boost: 80%
Lo-Fi: 5%

CLASSIC:

Speed + Pitch: 100%
Post-Pitch: 0
Reverb: 35%
Bass Boost: 15%
Lo-Fi: 0%

DANCE:

Speed + Pitch: 105%
Post-Pitch: 0
Reverb: 25%
Bass Boost: 70%
Lo-Fi: 0%

You can fine-tune these values after implementation so they sound natural.

================================================== 9. PRESET ARCHITECTURE
==================================================

Do NOT hard-code preset logic inside UI components.

Create a configuration such as:

soundPresets.ts

Example conceptual structure:

const soundPresets = {
original: {
speedPitch: 100,
postPitch: 0,
reverb: 0,
bassBoost: 0,
loFi: 0
},

rock: {
speedPitch: 100,
postPitch: 0,
reverb: 15,
bassBoost: 65,
loFi: 0
},

concertHall: {
speedPitch: 100,
postPitch: 0,
reverb: 80,
bassBoost: 10,
loFi: 0
}

...
};

Use strong TypeScript types.

================================================== 10. STATE MANAGEMENT
==================================================

Maintain equalizer state cleanly.

Example:

interface EqualizerSettings {
speedPitch: number;
postPitch: number;
reverb: number;
bassBoost: number;
loFi: number;
}

Also maintain:

- isEqualizerOpen
- activePreset
- current equalizer settings

When a user manually changes any knob:

Set activePreset to:

"Custom"

unless the resulting settings exactly match an existing preset.

================================================== 11. AUDIO SMOOTHNESS
==================================================

Very important:

Changing controls should NOT cause:

- audio restart
- song restart
- playback position reset
- noticeable clicks
- audio glitches
- multiple Tone.js nodes being created repeatedly
- memory leaks

Use smooth parameter transitions where appropriate.

Use Tone.js ramping methods where suitable.

Do not recreate the entire effects chain every time the user moves a knob.

Update parameters on existing nodes.

================================================== 12. RESPONSIVE DESIGN
==================================================

Desktop:

Display the 5 rotary controls in a horizontal layout.

Example:

        Speed       Pitch       Reverb      Bass      Lo-Fi
        +Pitch      Post        Control     Boost     Control
         ○           ○            ○           ○         ○

Tablet:

Use 2–3 controls per row.

Mobile:

Use a responsive grid:

○ ○
Speed Pitch

○ ○
Reverb Bass

○
Lo-Fi

Sound profile buttons should wrap naturally.

Do not create horizontal overflow.

================================================== 13. VISUAL DESIGN
==================================================

Match the reference image's overall aesthetic:

Primary colors:

- Dark purple / deep charcoal dial
- Yellow/orange dial indicator
- Light background or existing application's background
- Clean typography
- Minimal borders
- Soft shadows

The UI should look like a modern music/audio application.

Do not make it look like a generic HTML form.

Use:

- rounded cards
- subtle shadows
- smooth transitions
- active states
- hover states
- focus states

If the existing project already has a design system, reuse it instead of introducing a conflicting design system.

================================================== 14. ACCESSIBILITY
==================================================

Rotary controls must be accessible.

Use:

role="slider"

Provide:

aria-label
aria-valuemin
aria-valuemax
aria-valuenow

Support keyboard:

Arrow Up → increase
Arrow Down → decrease
Arrow Right → increase
Arrow Left → decrease
Home → minimum
End → maximum

Ensure sufficient contrast.

================================================== 15. COMPONENT STRUCTURE
==================================================

Prefer a structure similar to:

components/
music-player/
MusicPlayer.tsx
EqualizerButton.tsx
EqualizerPanel.tsx
RotaryKnob.tsx
SoundProfiles.tsx

audio/
toneAudioEngine.ts

config/
soundPresets.ts

Adjust this structure to match the existing project's conventions.

================================================== 16. IMPORTANT AUDIO IMPLEMENTATION DETAILS
==================================================

Tone.js is already installed.

Use the existing package.

Potential Tone.js nodes/features:

- Tone.Player / ToneAudioNode as appropriate
- Tone.Gain
- Tone.EQ3
- Tone.Filter
- Tone.Reverb
- Tone.PitchShift
- Tone.BitCrusher
- Tone.Distortion
- Tone.CrossFade
- Tone.Channel

However, do not blindly use all of them.

Choose the correct nodes based on the existing player architecture.

The most important requirement is:

THE USER MUST HEAR THE EFFECT.

Do not create controls that only change React state.

================================================== 17. ORIGINAL / BYPASS MODE
==================================================

When "Original" is selected:

- Speed = 100%
- Post Pitch = 0
- Reverb = 0
- Bass Boost = 0
- Lo-Fi = 0

The sound should be as close as possible to the original source.

If the architecture allows it, provide a true bypass path for effects.

================================================== 18. EQUALIZER BUTTON BEHAVIOR
==================================================

Before music selection:

Equalizer button:
disabled or hidden.

After music is loaded:

Equalizer button:
enabled.

Click:

Equalizer panel opens.

Click again:

Equalizer panel closes.

The music must continue playing normally while the panel opens/closes.

================================================== 19. DO NOT BREAK EXISTING FEATURES
==================================================

Before modifying code:

Inspect:

- package.json
- existing music player component
- audio source handling
- play/pause logic
- volume
- progress/seek
- track selection
- playlist logic
- existing CSS/theme
- existing state management

Do not rewrite these systems unnecessarily.

The new equalizer must be an additive feature.

================================================== 20. PERFORMANCE
==================================================

Avoid:

- creating Tone.js effects on every render
- creating new AudioContexts repeatedly
- attaching multiple listeners
- recreating audio nodes when slider values change
- memory leaks

Use React refs for persistent Tone.js nodes where appropriate.

Clean up all audio nodes/listeners on unmount.

================================================== 21. FINAL ACCEPTANCE CRITERIA
==================================================

The implementation is complete only when:

✓ Equalizer button appears after music is selected/ready.

✓ Clicking Equalizer opens a section underneath the music player.

✓ Clicking again closes it.

✓ Sound profiles are visible.

✓ Profiles include Rock, Concert Hall, Hip Hop, Classic, Dance, Reverb and several others.

✓ Selecting a profile actually changes the audio.

✓ Five rotary controls are visible.

✓ Rotary controls visually resemble the supplied reference image.

✓ Rotary controls are interactive.

✓ Changing a rotary control actually changes the audio.

✓ Speed + Pitch works.

✓ Post-Pitch works.

✓ Reverb works.

✓ Bass Boost works.

✓ Lo-Fi works.

✓ Presets update all five controls.

✓ Manual changes switch the profile to Custom.

✓ Original resets/bypasses the effects.

✓ Audio does not restart when changing settings.

✓ Current playback position is preserved.

✓ No audio glitches or unnecessary node recreation.

✓ Responsive on desktop, tablet, and mobile.

✓ Keyboard accessible.

✓ TypeScript has no type errors.

✓ Existing music player functionality remains unchanged.

✓ No unnecessary dependencies are installed.

================================================== 22. IMPLEMENTATION PROCESS
==================================================

Follow this workflow:

STEP 1:
Inspect the existing project and identify the music player/audio architecture.

STEP 2:
Explain briefly how the current audio pipeline works and where Tone.js should be integrated.

STEP 3:
Implement the reusable Tone.js audio engine.

STEP 4:
Implement the preset configuration.

STEP 5:
Implement RotaryKnob.

STEP 6:
Implement SoundProfiles.

STEP 7:
Implement EqualizerPanel.

STEP 8:
Integrate EqualizerPanel into the existing music player.

STEP 9:
Test all five controls.

STEP 10:
Test all presets.

STEP 11:
Check TypeScript errors.

STEP 12:
Check responsive layout.

STEP 13:
Check for audio node/listener memory leaks.

Do not stop at creating the UI.

The equalizer must be FUNCTIONAL and must process the actual playing music through Tone.js.

If an existing audio architecture conflicts with the proposed implementation, adapt the implementation to the existing architecture rather than rewriting the entire application.

Finally, provide a concise summary of:

1. Files created
2. Files modified
3. Tone.js effects used
4. Presets added
5. How the audio signal chain works
6. Any assumptions made
