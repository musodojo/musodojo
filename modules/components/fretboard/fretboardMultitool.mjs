import { FretboardMenu } from "./fretboardMenu.mjs";
import { Fretboard } from "./fretboard.mjs";
import { FRETBOARD_INSTRUMENTS_PROPS } from "../../data/fretboardInstrumentsProps.mjs";
import { NOTE_NAMES, getIndexFromName } from "../../data/noteNames.mjs";
import { NOTE_SEQUENCES } from "../../data/noteSequences.mjs";
import { NOTE_LABELS } from "../../data/noteLabels.mjs";
import { NOTE_COLORS } from "../../data/noteColors.mjs";
import { COLOR_THEMES } from "../../data/colorThemes.mjs";
import { MenuButton } from "../buttons/menuButton.mjs";
import { PlusButton } from "../buttons/plusButton.mjs";
import { MinusButton } from "../buttons/minusButton.mjs";
import { ResizeButton } from "../buttons/resizeButton.mjs";

class FretboardMultitool {
  constructor(props = {}) {
    const PROPS = { ...FRETBOARD_INSTRUMENTS_PROPS.defaults, ...props };

    this.fretboardMultitool = document.createElement("div");
    this.fretboardMultitool.style.display = "flex";
    this.fretboardMultitool.style.flexDirection = "column";
    this.fretboardMultitool.style.gap = "0.5em";
    this.fretboardMultitool.style.backgroundColor = PROPS.colorTheme.background;

    this.fretboardMenu = new FretboardMenu(PROPS);
    this.fretboardMultitool.appendChild(this.fretboardMenu.fretboardMenu);

    this.fretboard = new Fretboard(PROPS);
    this.fretboardMultitool.appendChild(this.fretboard.fretboard);

    // catch a pointer down/up event that happens in the FretboardMultitool
    // push/clear that pointer id if it hasn't been pushed/cleared by Fretboard
    // which will happen if it happens outside of the Fretboard but
    // inside of the FretboardMultitool
    // Don't add id to list if down was on SELECT
    // this was causing Chrome-based browsers to play notes hovered over
    // after selecting a select item that's already selected
    this.fretboardMultitool.addEventListener(
      "pointerdown",
      (event) => {
        try {
          if (event.target.nodeName !== "SELECT") {
            const INDEX = this.fretboard.state.pointerDownIds.indexOf(
              event.pointerId
            );
            // if id was not found, push it
            if (INDEX < 0) {
              this.fretboard.state.pointerDownIds.push(event.pointerId);
              event.target.releasePointerCapture(event.pointerId);
            }
          }
        } catch (err) {
          console.error(err);
        }
      },
      false
    );
    this.fretboardMultitool.addEventListener(
      "pointerup",
      (event) => {
        try {
          const INDEX = this.fretboard.state.pointerDownIds.indexOf(
            event.pointerId
          );
          // if id was found, it wasn't cleared by Fretboard
          if (INDEX >= 0) {
            this.fretboard.state.pointerDownIds.splice(INDEX, 1);
          }
        } catch (err) {
          console.error(err);
        }
      },
      false
    );

    // clear the pointer id when you leave the
    // multitool's area with pointer down
    this.fretboardMultitool.addEventListener(
      "pointerleave",
      (event) => {
        try {
          const INDEX = this.fretboard.state.pointerDownIds.indexOf(
            event.pointerId
          );
          if (INDEX >= 0) {
            this.fretboard.state.pointerDownIds.splice(INDEX, 1);
          }
        } catch (err) {
          console.error(err);
        }
      },
      false
    );

    this.fretboardMenu.instrumentSelect.addEventListener("change", (event) => {
      this.fretboard.props = {
        ...this.fretboard.props,
        ...FRETBOARD_INSTRUMENTS_PROPS.instruments.find(
          (instrument) => instrument.name === event.target.value
        ),
        // ...FRETBOARD_INSTRUMENTS_PROPS.instruments[event.target.value],
      };
      this.fretboard.reset();
      // update the fret number selects
      this.fretboardMenu.fromFretSelect.value = this.fretboard.props.fromFret;
      this.fretboardMenu.toFretSelect.value = this.fretboard.props.toFret;
    });

    this.fretboardMenu.rootNoteSelect.addEventListener("change", (event) => {
      this.fretboard.props.rootNote = getIndexFromName(event.target.value);
      this.fretboard.reset();
    });

    this.fretboardMenu.noteSequenceSelect.addEventListener("change", () => {
      this.sequenceAndLabelsUpdate();
      this.fretboard.reset();
    });

    this.fretboardMenu.fromFretSelect.addEventListener("change", (event) => {
      this.fretboard.props.fromFret = parseInt(event.target.value);
      this.fretboard.reset();
    });

    this.fretboardMenu.toFretSelect.addEventListener("change", (event) => {
      this.fretboard.props.toFret = parseInt(event.target.value);
      this.fretboard.reset();
    });

    this.fretboardMenu.modeSelect.addEventListener("change", (event) => {
      this.fretboard.props.mode = event.target.value;
    });

    this.fretboardMenu.handSelect.addEventListener("change", (event) => {
      this.fretboard.props.hand = event.target.value;
      this.fretboard.update();
    });

    this.fretboardMenu.noteLabelsSelect.addEventListener("change", () => {
      this.sequenceAndLabelsUpdate();
      this.fretboard.update();
    });

    this.fretboardMenu.noteColorsSelect.addEventListener("change", (event) => {
      this.fretboard.props.noteColors = NOTE_COLORS[event.target.value];
      this.fretboard.update();
    });

    // reset the index to the first option, which is the title i.e. "Note Size"
    // this is so a change event will fire even if you re-select an option
    // this will set all notes to the option size when their size has been edited
    // but the select still says their original size
    this.fretboardMenu.noteSizeSelect.addEventListener("pointerdown", () => {
      this.fretboardMenu.noteSizeSelect.selectedIndex = "0";
    });

    // change event could fire on selecting same option because selectedIndex
    // is reset to "0" in pointerdown listener
    // this means we must check which noteSize is bigger and set that
    // to first or second based on option choice, even if it's the same as
    // the previous option choice
    // this also works for selecting same value with keyboard shortcuts "k" and "l"
    // which dispatch a change event, even if the same
    this.fretboardMenu.noteSizeSelect.addEventListener("change", () => {
      let largeValue, smallValue;
      // check if first value is bigger than second
      if (
        parseInt(this.fretboard.props.noteSizes.first) >
        parseInt(this.fretboard.props.noteSizes.second)
      ) {
        largeValue = this.fretboard.props.noteSizes.first;
        smallValue = this.fretboard.props.noteSizes.second;
      } else {
        largeValue = this.fretboard.props.noteSizes.second;
        smallValue = this.fretboard.props.noteSizes.first;
      }
      // set Fretboard.props.noteSizes
      if (this.fretboardMenu.noteSizeSelect.value === "Large") {
        this.fretboard.props.noteSizes = {
          first: largeValue,
          second: smallValue,
        };
      } else if (this.fretboardMenu.noteSizeSelect.value === "Small") {
        this.fretboard.props.noteSizes = {
          first: smallValue,
          second: largeValue,
        };
      }
      // passing true means note sizes will be reset to
      // Fretboard.props.noteSizes.first
      this.fretboard.update(true);
    });

    this.fretboardMenu.noteDurationSelect.addEventListener(
      "change",
      (event) => {
        this.fretboard.props.noteDuration = parseFloat(event.target.value);
        this.fretboard.update();
      }
    );

    this.fretboardMenu.colorThemeSelect.addEventListener("change", (event) => {
      this.fretboardMultitool.style.backgroundColor =
        COLOR_THEMES[event.target.value].background;
      this.fretboard.props.colorTheme = COLOR_THEMES[event.target.value];
      this.fretboard.setColorThemeStyles();
      this.fretboard.update();
      this.menuButton.setColorTheme(
        COLOR_THEMES[event.target.value].foreground
      );
      this.plusButton.setColorTheme(
        COLOR_THEMES[event.target.value].foreground
      );
      this.minusButton.setColorTheme(
        COLOR_THEMES[event.target.value].foreground
      );
      this.resizeButton.setColorTheme(
        COLOR_THEMES[event.target.value].foreground
      );
    });

    this.fretboardMultitool.addEventListener("fretboardResized", (event) => {
      this.fretboardMenu.fretboardMenu.style.width = `${event.detail.width}px`;
    });

    const BUTTONS_DIV = document.createElement("div");
    BUTTONS_DIV.style.display = "flex";
    BUTTONS_DIV.style.flexFlow = "row wrap";
    BUTTONS_DIV.style.gap = "1em";
    this.fretboardMultitool.appendChild(BUTTONS_DIV);

    this.menuButton = new MenuButton(PROPS.colorTheme.foreground);
    this.menuButton.menuButton.addEventListener("pointerdown", () => {
      if (this.fretboardMenu.fretboardMenu.style.display === "none") {
        this.fretboardMenu.fretboardMenu.style.display = "block";
        setTimeout(() => {
          this.fretboardMenu.fretboardMenu.style.transform = "scaleY(1)";
        }, 20);
      } else {
        this.fretboardMenu.fretboardMenu.style.transform = "scaleY(0)";
        setTimeout(() => {
          this.fretboardMenu.fretboardMenu.style.display = "none";
        }, 200);
      }
    });
    BUTTONS_DIV.appendChild(this.menuButton.menuButton);

    this.plusButton = new PlusButton(PROPS.colorTheme.foreground);
    this.plusButton.plusButton.addEventListener("pointerdown", () => {
      this.fretboardMultitool.dispatchEvent(
        new CustomEvent("addtool", {
          detail: this.fretboard.props,
          bubbles: true,
        })
      );
    });
    BUTTONS_DIV.appendChild(this.plusButton.plusButton);

    this.minusButton = new MinusButton(PROPS.colorTheme.foreground);
    this.minusButton.minusButton.addEventListener("pointerdown", () => {
      this.fretboardMultitool.dispatchEvent(
        new Event("removetool", { bubbles: true })
      );
    });
    BUTTONS_DIV.appendChild(this.minusButton.minusButton);

    this.resizeButton = new ResizeButton(PROPS.colorTheme.foreground);
    this.resizeButton.resizeButton.addEventListener("pointerdown", () => {
      this.fretboard.toggleResize();
    });
    BUTTONS_DIV.appendChild(this.resizeButton.resizeButton);

    this.addKeyboardShortcuts();
  }

  // if the sequence updates, the labels must update
  // (unless labels are all empty, which is not accounted for)
  // and if the labels update, we need to get the sequence anyway
  // to check for overwrites on the defaults labels
  // so combine their updates into one function
  sequenceAndLabelsUpdate() {
    const SEQUENCE_NAME = this.fretboardMenu.noteSequenceSelect.value;
    const SEQUENCE =
      NOTE_SEQUENCES[
        this.fretboardMenu.noteSequenceSelect.querySelector("option:checked")
          .parentElement.label
      ][SEQUENCE_NAME];
    this.fretboard.props.sequenceName = SEQUENCE_NAME;
    this.fretboard.props.sequence = SEQUENCE.sequence;

    const NOTE_LABELS_NAME = this.fretboardMenu.noteLabelsSelect.value;
    // spread NOTE_LABELS[NOTE_LABELS_NAME] so it is a copy
    // because values can be overwritten below
    let labels = [...NOTE_LABELS[NOTE_LABELS_NAME]];
    // check if sequence specific labels exist
    // if they do exist, check if the specific type exists
    // if both of these are true, overwrite the default labels
    // with the sequence specific ones
    if (SEQUENCE.labels && SEQUENCE.labels[NOTE_LABELS_NAME]) {
      Object.entries(SEQUENCE.labels[NOTE_LABELS_NAME]).forEach(
        ([integer, name]) => {
          labels[parseInt(integer)] = name;
        }
      );
    }
    // set Fretboard.props to the copy of labels
    this.fretboard.props.noteLabelsName = NOTE_LABELS_NAME;
    this.fretboard.props.noteLabels = labels;
  }

  set tabIndex(index) {
    // helps this div to be keyboard focusable
    this.fretboardMultitool.tabIndex = index;
  }

  addKeyboardShortcuts() {
    this.tabIndex = "-1";
    this.fretboardMultitool.addEventListener("pointerdown", () => {
      this.fretboardMultitool.focus();
    });
    this.fretboardMultitool.addEventListener("keydown", (event) => {
      // ROOT NOTE SHORTCUTS
      switch (event.key) {
        case "z":
        case "Z":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[0];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "s":
        case "S":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[1];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "x":
        case "X":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[2];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "d":
        case "D":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[3];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "c":
        case "C":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[4];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "v":
        case "V":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[5];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "g":
        case "G":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[6];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "b":
        case "B":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[7];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "h":
        case "H":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[8];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "n":
        case "N":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[9];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "j":
        case "J":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[10];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case "m":
        case "M":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[11];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        case ",":
        case "<":
          this.fretboardMenu.rootNoteSelect.value = NOTE_NAMES[0];
          this.fretboardMenu.rootNoteSelect.dispatchEvent(new Event("change"));
          break;
        // NOTE SEQUENCES SHORTCUTS
        case "1":
          this.fretboardMenu.noteSequenceSelect.value = "Ionian / Major";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "2":
          this.fretboardMenu.noteSequenceSelect.value = "Dorian";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "3":
          this.fretboardMenu.noteSequenceSelect.value = "Phrygian";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "4":
          this.fretboardMenu.noteSequenceSelect.value = "Lydian";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "5":
          this.fretboardMenu.noteSequenceSelect.value = "Mixolydian";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "6":
          this.fretboardMenu.noteSequenceSelect.value = "Aeolian / Minor";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "7":
          this.fretboardMenu.noteSequenceSelect.value = "Locrian";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "8":
          this.fretboardMenu.noteSequenceSelect.value = "Root";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "9":
          this.fretboardMenu.noteSequenceSelect.value = "Chromatic";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        case "0":
          this.fretboardMenu.noteSequenceSelect.value = "Blank";
          this.fretboardMenu.noteSequenceSelect.dispatchEvent(
            new Event("change")
          );
          break;
        // MODE SHORTCUTS
        case "p":
        case "P":
          this.fretboardMenu.modeSelect.value = "Play";
          this.fretboardMenu.modeSelect.dispatchEvent(new Event("change"));
          break;
        case "o":
        case "O":
          this.fretboardMenu.modeSelect.value = "Edit One";
          this.fretboardMenu.modeSelect.dispatchEvent(new Event("change"));
          break;
        case "i":
        case "I":
          this.fretboardMenu.modeSelect.value = "Edit All";
          this.fretboardMenu.modeSelect.dispatchEvent(new Event("change"));
          break;
        // NOTE SIZE SHORTCUTS
        case "l":
        case "L":
          this.fretboardMenu.noteSizeSelect.value = "Large";
          this.fretboardMenu.noteSizeSelect.dispatchEvent(new Event("change"));
          break;
        case "k":
        case "K":
          this.fretboardMenu.noteSizeSelect.value = "Small";
          this.fretboardMenu.noteSizeSelect.dispatchEvent(new Event("change"));
          break;
      }
    });
  }
}

export { FretboardMultitool };
