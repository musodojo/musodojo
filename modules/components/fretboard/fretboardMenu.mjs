import {
  FRETBOARD_INSTRUMENTS_PROPS,
  getFretboardInstrumentSelect,
} from "../../data/fretboardInstrumentsProps.mjs";
import { NOTE_NAMES, getNoteNamesSelect } from "../../data/noteNames.mjs";
import { getNoteSequenceSelect } from "../../data/noteSequences.mjs";
import { getNoteLabelsSelect } from "../../data/noteLabels.mjs";
import {
  getNoteColorsNameFromValue,
  getNoteColorsSelect,
} from "../../data/noteColors.mjs";
import {
  COLOR_THEMES,
  getColorThemeNameFromValue,
  getColorThemeSelect,
} from "../../data/colorThemes.mjs";

class FretboardMenu {
  constructor(props = {}) {
    // don't need to store this.props in this class
    const PROPS = {
      ...FRETBOARD_INSTRUMENTS_PROPS.defaults,
      ...props,
    };

    this.fretboardMenu = document.createElement("div");
    this.fretboardMenu.style.display = "flex";
    this.fretboardMenu.style.flexFlow = "row wrap";
    this.fretboardMenu.style.gap = "0.4em";
    this.fretboardMenu.style.backgroundColor = PROPS.colorTheme.background;
    this.fretboardMenu.style.width = `${PROPS.width}px`;
    // for hiding the menu
    this.fretboardMenu.style.transition = "transform 0.2s";
    this.fretboardMenu.style.transformOrigin = "0 0";

    // a general style for a HTML <select>
    const SELECT_STYLE = {
      "font-size": "1em",
      "background-color": PROPS.colorTheme.background,
      color: PROPS.colorTheme.foreground,
      "border-radius": "0.2em",
    };

    // Instrument Select
    this.instrumentSelect = getFretboardInstrumentSelect(PROPS.name);
    Object.assign(this.instrumentSelect.style, SELECT_STYLE);
    this.fretboardMenu.appendChild(this.instrumentSelect);

    // Root Note Select
    this.rootNoteSelect = getNoteNamesSelect(NOTE_NAMES[PROPS.rootNote]);
    Object.assign(this.rootNoteSelect.style, SELECT_STYLE);
    this.fretboardMenu.appendChild(this.rootNoteSelect);

    // Note Sequence Select
    this.noteSequenceSelect = getNoteSequenceSelect(PROPS.sequenceName);
    Object.assign(this.noteSequenceSelect.style, SELECT_STYLE);
    this.fretboardMenu.appendChild(this.noteSequenceSelect);

    // From Fret Select
    this.fromFretSelect = document.createElement("select");
    Object.assign(this.fromFretSelect.style, SELECT_STYLE);
    const FROM_FRET_LABEL = document.createElement("option");
    FROM_FRET_LABEL.text = "From";
    FROM_FRET_LABEL.disabled = "disabled";
    this.fromFretSelect.add(FROM_FRET_LABEL);
    for (let i = 0; i <= 24; i++) {
      const FROM_FRET_OPTION = document.createElement("option");
      FROM_FRET_OPTION.text = i;
      this.fromFretSelect.add(FROM_FRET_OPTION);
      if (i === PROPS.fromFret) {
        FROM_FRET_OPTION.selected = true;
      }
    }
    this.fromFretSelect.addEventListener("change", () => {
      const FROM_FRET = parseInt(this.fromFretSelect.value);
      const TO_FRET = parseInt(this.toFretSelect.value);
      this.fromFretSelect.value = FROM_FRET > TO_FRET ? TO_FRET : FROM_FRET;
    });
    this.fretboardMenu.appendChild(this.fromFretSelect);

    // To Fret Select
    this.toFretSelect = document.createElement("select");
    Object.assign(this.toFretSelect.style, SELECT_STYLE);
    const TO_FRET_LABEL = document.createElement("option");
    TO_FRET_LABEL.text = "To";
    TO_FRET_LABEL.disabled = "disabled";
    this.toFretSelect.add(TO_FRET_LABEL);
    for (let i = 0; i <= 24; i++) {
      const TO_FRET_OPTION = document.createElement("option");
      TO_FRET_OPTION.text = i;
      this.toFretSelect.add(TO_FRET_OPTION);
      if (i === PROPS.toFret) {
        TO_FRET_OPTION.selected = true;
      }
    }
    this.toFretSelect.addEventListener("change", () => {
      const FROM_FRET = parseInt(this.fromFretSelect.value);
      const TO_FRET = parseInt(this.toFretSelect.value);
      this.toFretSelect.value = TO_FRET < FROM_FRET ? FROM_FRET : TO_FRET;
    });
    this.fretboardMenu.appendChild(this.toFretSelect);

    // Mode Select
    this.modeSelect = document.createElement("select");
    Object.assign(this.modeSelect.style, SELECT_STYLE);
    const MODE_LABEL = document.createElement("option");
    MODE_LABEL.text = "Mode";
    MODE_LABEL.disabled = "disabled";
    this.modeSelect.add(MODE_LABEL);
    const MODE_PLAY_OPTION = document.createElement("option");
    MODE_PLAY_OPTION.text = "Play";
    this.modeSelect.add(MODE_PLAY_OPTION);
    const MODE_EDITONE_OPTION = document.createElement("option");
    MODE_EDITONE_OPTION.text = "Edit One";
    this.modeSelect.add(MODE_EDITONE_OPTION);
    const MODE_EDITALL_OPTION = document.createElement("option");
    MODE_EDITALL_OPTION.text = "Edit All";
    this.modeSelect.add(MODE_EDITALL_OPTION);
    this.modeSelect.value = PROPS.mode;
    this.fretboardMenu.appendChild(this.modeSelect);

    // Hand Select
    this.handSelect = document.createElement("select");
    Object.assign(this.handSelect.style, SELECT_STYLE);
    const HAND_LABEL = document.createElement("option");
    HAND_LABEL.text = "Hand";
    HAND_LABEL.disabled = "disabled";
    this.handSelect.add(HAND_LABEL);
    const HAND_LEFT_OPTION = document.createElement("option");
    HAND_LEFT_OPTION.text = "Left";
    this.handSelect.add(HAND_LEFT_OPTION);
    const HAND_RIGHT_OPTION = document.createElement("option");
    HAND_RIGHT_OPTION.text = "Right";
    this.handSelect.add(HAND_RIGHT_OPTION);
    this.handSelect.value = PROPS.hand;
    this.fretboardMenu.appendChild(this.handSelect);

    // Note Labels Select
    this.noteLabelsSelect = getNoteLabelsSelect(PROPS.noteLabelsName);
    Object.assign(this.noteLabelsSelect.style, SELECT_STYLE);
    this.fretboardMenu.appendChild(this.noteLabelsSelect);

    // Note Colors/Colours Select
    this.noteColorsSelect = getNoteColorsSelect(
      getNoteColorsNameFromValue(PROPS.noteColors)
    );
    Object.assign(this.noteColorsSelect.style, SELECT_STYLE);
    this.fretboardMenu.appendChild(this.noteColorsSelect);

    // Note Size Select
    this.noteSizeSelect = document.createElement("select");
    Object.assign(this.noteSizeSelect.style, SELECT_STYLE);
    const NOTE_SIZE_LABEL = document.createElement("option");
    NOTE_SIZE_LABEL.text = "Note Size";
    NOTE_SIZE_LABEL.disabled = "disabled";
    this.noteSizeSelect.add(NOTE_SIZE_LABEL);
    const NOTE_SIZE_LARGE_OPTION = document.createElement("option");
    NOTE_SIZE_LARGE_OPTION.text = "Large";
    this.noteSizeSelect.add(NOTE_SIZE_LARGE_OPTION);
    const NOTE_SIZE_SMALL_OPTION = document.createElement("option");
    NOTE_SIZE_SMALL_OPTION.text = "Small";
    this.noteSizeSelect.add(NOTE_SIZE_SMALL_OPTION);
    this.noteSizeSelect.value =
      parseInt(PROPS.noteSizes.first) > parseInt(PROPS.noteSizes.second)
        ? "Large"
        : "Small";
    this.fretboardMenu.appendChild(this.noteSizeSelect);

    // Note Duration Select
    this.noteDurationSelect = document.createElement("select");
    Object.assign(this.noteDurationSelect.style, SELECT_STYLE);
    const NOTE_DURATION_LABEL = document.createElement("option");
    NOTE_DURATION_LABEL.text = "Duration";
    NOTE_DURATION_LABEL.disabled = "disabled";
    this.noteDurationSelect.add(NOTE_DURATION_LABEL);
    // Touch sensitive
    const NOTE_DURATION_TOUCH_OPTION = document.createElement("option");
    NOTE_DURATION_TOUCH_OPTION.text = "Touch";
    NOTE_DURATION_TOUCH_OPTION.value = "0";
    this.noteDurationSelect.add(NOTE_DURATION_TOUCH_OPTION);
    // 0.5 seconds
    const NOTE_DURATION_05_OPTION = document.createElement("option");
    NOTE_DURATION_05_OPTION.text = "0.5 s";
    NOTE_DURATION_05_OPTION.value = "0.5";
    this.noteDurationSelect.add(NOTE_DURATION_05_OPTION);
    // 1 seconds
    const NOTE_DURATION_1_OPTION = document.createElement("option");
    NOTE_DURATION_1_OPTION.text = "1 s";
    NOTE_DURATION_1_OPTION.value = "1";
    this.noteDurationSelect.add(NOTE_DURATION_1_OPTION);
    // 2 seconds
    const NOTE_DURATION_2_OPTION = document.createElement("option");
    NOTE_DURATION_2_OPTION.text = "2 s";
    NOTE_DURATION_2_OPTION.value = "2";
    this.noteDurationSelect.add(NOTE_DURATION_2_OPTION);
    // 3 seconds
    const NOTE_DURATION_3_OPTION = document.createElement("option");
    NOTE_DURATION_3_OPTION.text = "3 s";
    NOTE_DURATION_3_OPTION.value = "3";
    this.noteDurationSelect.add(NOTE_DURATION_3_OPTION);
    // ∞ seconds
    const NOTE_DURATION_INFIN_OPTION = document.createElement("option");
    NOTE_DURATION_INFIN_OPTION.text = "∞ s";
    NOTE_DURATION_INFIN_OPTION.value = "-1";
    this.noteDurationSelect.add(NOTE_DURATION_INFIN_OPTION);
    // set the default
    this.noteDurationSelect.value = PROPS.noteDuration;
    this.fretboardMenu.appendChild(this.noteDurationSelect);

    // Color Theme Select
    this.colorThemeSelect = getColorThemeSelect(
      getColorThemeNameFromValue(PROPS.colorTheme)
    );
    Object.assign(this.colorThemeSelect.style, SELECT_STYLE);
    this.colorThemeSelect.addEventListener("change", (event) => {
      const COLOR_THEME = COLOR_THEMES[event.target.value];
      const CHILD_NODES = this.fretboardMenu.childNodes;
      CHILD_NODES.forEach((node) => {
        node.style.backgroundColor = COLOR_THEME.background;
        node.style.color = COLOR_THEME.foreground;
      });
      this.fretboardMenu.style.backgroundColor = COLOR_THEME.background;
    });
    this.fretboardMenu.appendChild(this.colorThemeSelect);
  }
}

export { FretboardMenu };
