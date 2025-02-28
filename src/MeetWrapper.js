/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-invalid-this */

'use strict';

class MeetWrapper { // eslint-disable-line
  #currentRoom;
  #hasBeenActivated = false;

  #ROOM_NAMES = {
    lobby: 'lobby',
    greenRoom: 'greenRoom',
    meeting: 'meeting',
    exitHall: 'exitHall',
  };

  #streamDeck;

  /**
   * Constructor
   *
   * @param {HIDDevice} streamDeck
   */
  constructor(streamDeck) {
    this.#streamDeck = streamDeck;
    this.#streamDeck.addEventListener('keydown', (evt) => {
      this.#handleStreamDeckPress(evt.detail.buttonId);
    });

//    window.addEventListener('fullscreenchange', () => {
//      this.#drawFullScreenButton();
//    });

    window.addEventListener('click', () => {
      if (this.#hasBeenActivated || !navigator.userActivation.isActive) {
        return;
      }
      this.#hasBeenActivated = true;
//      this.#drawFullScreenButton();
    });

    // Watch for room changes
    const pathname = window.location.pathname;
    if (pathname === '/' || pathname === '/landing') {
      this.#enterLobby();
      return;
    }

    const bodyObserver = new MutationObserver(() => {
      if (document.querySelector('div[data-second-screen]')) {
        this.#enterMeeting();
      } else if (document.querySelector('[jscontroller=dyDNGc]')) {
        this.#enterGreenRoom();
      } else if (document.querySelector('[jsname=r4nke]')) {
        this.#enterExitHall();
      }
    });
    bodyObserver.observe(document.body, {attributes: true, childList: true});
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Methods for setting up the rooms.
   *
   */

  /**
   * Set up buttons for the lobby.
   */
  #enterLobby() {
    if (this.#currentRoom === this.#ROOM_NAMES.lobby) {
      return;
    }
    this.#currentRoom = this.#ROOM_NAMES.lobby;
    console.log('*SD-Meet*', 'Room:', this.#currentRoom);

    this.#resetButtons();
//    this.#drawFullScreenButton();
    this.#drawButton(`start-next`);
    this.#drawButton(`start-instant`);
  }

  /**
   * Set up buttons for the green room.
   */
  #enterGreenRoom() {
    if (this.#currentRoom === this.#ROOM_NAMES.greenRoom) {
      return;
    }
    this.#currentRoom = this.#ROOM_NAMES.greenRoom;
    console.log('*SD-Meet*', 'Room:', this.#currentRoom);

    this.#resetButtons();
//    this.#drawFullScreenButton();
    this.#drawButton(`enter-meeting`);
    this.#drawButton(`home`);

    // The timeout is there to make sure the elements have drawn on
    // screen. I should probably use a mutation observer to see when they
    // drawn, then render them, but I'm feeling kinda lazy today.
    setTimeout(() => {
      this.#setupGreenRoomMicButton();
      this.#setupGreenRoomCamButton();
    }, 500);
  }

  /**
   * Set up buttons for the meeting room.
   */
  #enterMeeting() {
    if (this.#currentRoom === this.#ROOM_NAMES.meeting) {
      return;
    }
    this.#currentRoom = this.#ROOM_NAMES.meeting;
    console.log('*SD-Meet*', 'Room:', this.#currentRoom);

    this.#resetButtons();
//    this.#drawFullScreenButton();
    this.#drawButton(`end-call`);
    this.#drawButton('heart');
    this.#drawButton('thumbUp');
    this.#drawButton('partyPopper');
    this.#drawButton('clap');
    this.#drawButton('joy');
    this.#drawButton('astonish');
    this.#drawButton('cry');
    this.#drawButton('think');
    this.#drawButton('thumbDown');
    this.#drawButton('plus');
    this.#drawButton('crab');

    // The timeout is there to make sure the elements have drawn on
    // screen. I should probably use a mutation observer to see when they
    // drawn, then render them, but I'm feeling kinda lazy today.
    setTimeout(() => {
      this.#setupMicButton();
      this.#setupCamButton();
      this.#setupCCButton();
      this.#setupHandButton();
      this.#setupInfoButton();
      this.#setupPeopleButton();
      this.#setupChatButton();
      this.#setupActivitiesButton();
      this.#setupPresentingButton();
      this.#setupReactionButton();
    }, 500);

    // If it was an instant meeting, automatically close
    // the info dialog after 10 seconds.
    setTimeout(() => {
      this.#tapCloseInfoDialog();
    }, 10 * 1000);
  }

  /**
   * Set up buttons for the exit hall.
   */
  #enterExitHall() {
    if (this.#currentRoom === this.#ROOM_NAMES.exitHall) {
      return;
    }
    this.#currentRoom = this.#ROOM_NAMES.exitHall;
    console.log('*SD-Meet*', 'Room:', this.#currentRoom);

    this.#resetButtons();
//    this.#drawFullScreenButton();
    this.#drawButton(`rejoin`);
    this.#drawButton(`home`);
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Methods for interacting with the Stream Deck.
   *
   */

  /**
   * Handle called when a button is pressed.
   *
   * @param {number} buttonId Button ID of the button that was pressed.
   */
  #handleStreamDeckPress(buttonId) {
    console.log('*SD-Meet*', 'Button Pressed', buttonId);

    // Toggle full screen, used in all rooms.
//    if (buttonId === this.#streamDeck.buttonNameToId('fullscreen-on')) {
//      this.#toggleFullScreen();
//      return;
//    }

    // Available while in the lobby.
    if (this.#currentRoom === this.#ROOM_NAMES.lobby) {
      if (buttonId === this.#streamDeck.buttonNameToId('start-next')) {
        this.#tapStartNextMeeting();
      } else if (buttonId === this.#streamDeck.buttonNameToId('start-instant')) { // eslint-disable-line
        this.#tapStartInstantMeeting();
      }
      return;
    }

    // Available while in the green room.
    if (this.#currentRoom === this.#ROOM_NAMES.greenRoom) {
      if (buttonId === this.#streamDeck.buttonNameToId('enter-meeting')) {
        this.#tapEnterMeeting();
      } else if (buttonId === this.#streamDeck.buttonNameToId('mic')) {
        this.#tapGreenRoomMic();
      } else if (buttonId === this.#streamDeck.buttonNameToId('cam')) {
        this.#tapGreenRoomCam();
      } else if (buttonId === this.#streamDeck.buttonNameToId('home')) {
        this.#resetButtons();
        window.history.back();
      }
      return;
    }

    // Available while in the meeting room.
    if (this.#currentRoom === this.#ROOM_NAMES.meeting) {
      if (buttonId === this.#streamDeck.buttonNameToId('reaction')) {
        this.#tapReactions();
      } else if (buttonId === this.#streamDeck.buttonNameToId('info')) {
        this.#tapInfo();
      } else if (buttonId === this.#streamDeck.buttonNameToId('users')) {
        this.#tapUsers();
      } else if (buttonId === this.#streamDeck.buttonNameToId('chat')) {
        this.#tapChat();
      } else if (buttonId === this.#streamDeck.buttonNameToId('activities')) {
        this.#tapActivities();
      } else if (buttonId === this.#streamDeck.buttonNameToId('present-stop')) {
        this.#tapStopPresenting();
      } else if (buttonId === this.#streamDeck.buttonNameToId('mic')) {
        this.#tapMic();
      } else if (buttonId === this.#streamDeck.buttonNameToId('cam')) {
        this.#tapCam();
      } else if (buttonId === this.#streamDeck.buttonNameToId('hand')) {
        this.#tapHand();
      } else if (buttonId === this.#streamDeck.buttonNameToId('cc')) {
        this.#tapCC();
      } else if (buttonId === this.#streamDeck.buttonNameToId('end-call')) {
        this.#tapHangUp();

      } else if (buttonId === this.#streamDeck.buttonNameToId('heart')) {
        this.#tapHeart();
      }  else if (buttonId === this.#streamDeck.buttonNameToId('thumbUp')) {
         this.#tapThumbUp();
      } else if (buttonId === this.#streamDeck.buttonNameToId('partyPopper')) {
         this.#tapPartyPopper();
      } else if (buttonId === this.#streamDeck.buttonNameToId('clap')) {
         this.#tapClap();
      } else if (buttonId === this.#streamDeck.buttonNameToId('joy')) {
       this.#tapJoy();
     }  else if (buttonId === this.#streamDeck.buttonNameToId('astonish')) {
        this.#tapAstonish();
     } else if (buttonId === this.#streamDeck.buttonNameToId('cry')) {
        this.#tapCry();
     } else if (buttonId === this.#streamDeck.buttonNameToId('think')) {
        this.#tapThink();
     } else if (buttonId === this.#streamDeck.buttonNameToId('thumbDown')) {
      this.#tapThumbDown();
    }  else if (buttonId === this.#streamDeck.buttonNameToId('plus')) {
       this.#tapPlus();
    } else if (buttonId === this.#streamDeck.buttonNameToId('crab')) {
       this.#tapCrab();
    }
      return;
    }

    // Available while in the exit hall.
    if (this.#currentRoom === this.#ROOM_NAMES.exitHall) {
      if (buttonId === this.#streamDeck.buttonNameToId('rejoin')) {
        this.#tapRejoin();
      } else if (buttonId === this.#streamDeck.buttonNameToId('home')) {
        this.#tapHome();
      }
      return;
    }
  }

  /**
   * Draw an icon on the StreamDeck. Uses the current configuration to
   * determine which button to use based on the icon name.
   *
   * @param {string} iconName Name of icon to draw
   */
  #drawButton(iconName) {
    if (!this.#streamDeck?.isConnected) {
      return;
    }
    const buttonId = this.#streamDeck.buttonNameToId(iconName);
//    if (buttonId === undefined || buttonId < 0) {
    if (buttonId === undefined) {
      console.warn('*SD-Meet*', `drawButton failed, unknown icon name: '${iconName}'`);
      return; // Not defined in the current configuration.
    }
    if (buttonId < 0) {
      console.log('*SD-Meet*', `drawButton called on non-placed icon: '${iconName}'`);
      return; // icon not set to be drawn in current config
    }
    const iconURL = chrome.runtime.getURL(`ico-svg/${iconName}.svg`);
    this.#streamDeck.fillURL(buttonId, iconURL, true);
  }

  /**
   * Clear the StreamDeck
   */
  #resetButtons() {
    if (!this.#streamDeck?.isConnected) {
      return;
    }
    this.#streamDeck.clearAllButtons();
  }

  /**
   * Draw buttons for full screen toggle.
   */
//  #drawFullScreenButton() {
//    if (document.fullscreenElement) {
//      this.#drawButton(`fullscreen-on`);
//      return;
//    }
//    if (!navigator.userActivation.isActive) {
//      this.#drawButton(`fullscreen-disabled`);
//      return;
//    }
//    this.#drawButton(`fullscreen-off`);
//  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Set up mutation observers on the buttons in the meeting room.
   *
   */

  /**
   * Setup the meeting room mic button.
   */
  #setupMicButton() {
    const micButton = this.#getMicButton();
    if (!micButton) {
      return;
    }
    const micObserver = new MutationObserver(() => {
      this.#updateMicButton();
    });
    micObserver.observe(micButton, {attributeFilter: ['data-is-muted']});
    this.#updateMicButton();
  }

  /**
   * Setup the meeting room camera button.
   */
  #setupCamButton() {
    const camButton = this.#getCamButton();
    if (!camButton) {
      return;
    }
    const camObserver = new MutationObserver(() => {
      this.#updateCamButton();
    });
    camObserver.observe(camButton, {attributeFilter: ['data-is-muted']});
    this.#updateCamButton();
  }

  /**
   * Setup the meeting room closed caption button.
   */
  #setupCCButton() {
    const ccButton = this.#getCCButton();
    if (!ccButton) {
      return;
    }
    const ccObserver = new MutationObserver(() => {
      this.#updateCCButton();
    });
    ccObserver.observe(ccButton, {attributeFilter: ['aria-pressed']});
    this.#updateCCButton();
  }

  /**
   * Setup the meeting room raise hand button.
   */
  #setupHandButton() {
    const handButton = this.#getHandButton();
    if (!handButton) {
      return;
    }
    const handObserver = new MutationObserver(() => {
      this.#updateHandButton();
    });
    handObserver.observe(handButton, {attributeFilter: ['aria-pressed']});
    this.#updateHandButton();
  }

  /**
   * Setup the meeting room info button.
   */
  #setupInfoButton() {
    const infoButton = this.#getInfoButton();
    if (!infoButton) {
      return;
    }
    const infoObserver = new MutationObserver(() => {
      this.#updateInfoButton();
    });
    infoObserver.observe(infoButton, {attributeFilter: ['aria-pressed']});
    this.#updateInfoButton();
  }

  /**
   * Setup the meeting room people list button.
   */
  #setupPeopleButton() {
    const button = this.#getPeopleButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updatePeopleButton();
    });
    observer.observe(button, {attributeFilter: ['aria-pressed']});
    this.#updatePeopleButton();
  }

  /**
   * Setup the meeting room chat button.
   */
  #setupChatButton() {
    const button = this.#getChatButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updateChatButton();
    });
    observer.observe(button, {attributeFilter: ['aria-pressed']});
    this.#updateChatButton();
  }

  /**
   * Setup the meeting room activities button.
   */
  #setupActivitiesButton() {
    const button = this.#getActivitiesButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updateActivitiesButton();
    });
    observer.observe(button, {attributeFilter: ['aria-pressed']});
    this.#updateActivitiesButton();
  }

  /**
   * Setup the meeting room presenting state button.
   */
  #setupPresentingButton() {
    const presentationBar = this.#getPresentationBar();
    if (!presentationBar) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updatePresentingButton();
    });
    observer.observe(presentationBar, {childList: true});
    this.#updatePresentingButton();
  }

  /**
   * Setup the meeting room send a reaction button.
   */
  #setupReactionButton() {
    const button = this.#getReactionButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updateReactionButton();
    });
    observer.observe(button, {attributeFilter: ['aria-pressed']});
    this.#updateReactionButton();
  }

  /**
   * Setup the green room mic button.
   */
  #setupGreenRoomMicButton() {
    const button = this.#getGreenRoomMicButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updateGreenRoomMicButton();
    });
    observer.observe(button, {attributeFilter: ['data-is-muted']});
    this.#updateGreenRoomMicButton();
  }

  /**
   * Setup the green room camera button.
   */
  #setupGreenRoomCamButton() {
    const button = this.#getGreenRoomCamButton();
    if (!button) {
      return;
    }
    const observer = new MutationObserver(() => {
      this.#updateGreenRoomCamButton();
    });
    observer.observe(button, {attributeFilter: ['data-is-muted']});
    this.#updateGreenRoomCamButton();
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Update the StreamDeck buttons based on current state. Will be
   * called by the mutation observers created above.
   *
   */

  /**
   * Update the StreamDeck mic button to indicate current state.
   */
  #updateMicButton() {
    const button = this.#getMicButton();
    if (!button) {
      return;
    }
    const newVal = button.dataset?.isMuted == 'true';
    const img = newVal ? 'mic-disabled' : 'mic';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck camera button to indicate current state.
   */
  #updateCamButton() {
    const button = this.#getCamButton();
    if (!button) {
      return;
    }
    const newVal = button.dataset?.isMuted == 'true';
    const img = newVal ? 'cam-disabled' : 'cam';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck CC button to indicate current state.
   */
  #updateCCButton() {
    const button = this.#getCCButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'cc-on' : 'cc';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck hand button to indicate current state.
   */
  #updateHandButton() {
    const button = this.#getHandButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'hand-raised' : 'hand';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck info button to indicate current state.
   */
  #updateInfoButton() {
    const button = this.#getInfoButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'info-open' : 'info';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck people button to indicate current state.
   */
  #updatePeopleButton() {
    const button = this.#getPeopleButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'users-open' : 'users';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck chat button to indicate current state.
   */
  #updateChatButton() {
    const button = this.#getChatButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'chat-open' : 'chat';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck activities button to indicate current state.
   */
  #updateActivitiesButton() {
    const button = this.#getActivitiesButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'activities-open' : 'activities';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck stop presenting button to indicate current state.
   */
  #updatePresentingButton() {
    const button = this.#getStopPresentingButton();
    const img = button ? 'present-stop' : 'blank';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck Send a Reaction button to indicate current state.
   */
  #updateReactionButton() {
    const button = this.#getReactionButton();
    if (!button) {
      return;
    }
    const newVal = button.getAttribute('aria-pressed') == 'true';
    const img = newVal ? 'reaction-open' : 'reaction';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck mic button (green room) to indicate current state.
   */
  #updateGreenRoomMicButton() {
    const button = this.#getGreenRoomMicButton();
    if (!button) {
      return;
    }
    const newVal = button.dataset?.isMuted == 'true';
    const img = newVal ? 'mic-disabled' : 'mic';
    this.#drawButton(img);
  }

  /**
   * Update the StreamDeck camera button (green room) to indicate current state.
   */
  #updateGreenRoomCamButton() {
    const button = this.#getGreenRoomCamButton();
    if (!button) {
      return;
    }
    const newVal = button.dataset?.isMuted == 'true';
    const img = newVal ? 'cam-disabled' : 'cam';
    this.#drawButton(img);
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Helpers to get Meet UI elements.
   *
   */

  /**
   * Get the Start Instant Meeting button (lobby).
   *
   * @return {?Element}
   */
  #getStartInstantMeetingButton() {
    return document.querySelector('[jsname=CuSyi]');
  }

  /**
   * Get the Start Next Meeting button (lobby).
   *
   * @return {?Element}
   */
  #getStartNextMeetingButton() {
    return document.querySelector('[data-default-focus=true]');
  }

  /**
   * Get the Join Meeting button (green room).
   *
   * @return {?Element}
   */
  #getEnterMeetingButton() {
    return document.querySelector('[jsname=Qx7uuf]');
  }

  /**
   * Get the Meeting Info dialog shown for instant meetings (meeting).
   *
   * @return {?Element}
   */
  #getMeetingInfoDialog() {
    return document.querySelector('[jscontroller=Cmkwqf]');
  }

  /**
   * Get the close button for the Meeting Info dialog (meeting).
   *
   * @return {?Element}
   */
    #getMeetingInfoDialogCloseButton() {
      const dialog = document.querySelector('[jscontroller=Cmkwqf]');
      if (dialog) {
        return dialog.querySelector('[aria-label=Close]');
      }
    }

  /**
   * Get the presentation bar container (meeting).
   *
   * @return {?Element}
   */
  #getPresentationBar() {
    return document.querySelector('[jscontroller=A5S1ke]');
  }

  /**
   * Get the Mic button in the meeting room.
   *
   * @return {?Element}
   */
  #getMicButton() {
    const sel = '[jsname=Dg9Wp]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Get the Camera button in the meeting room.
   *
   * @return {?Element}
   */
  #getCamButton() {
    const sel = '[jsname=R3GXJb]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Get the CC button in the meeting room.
   *
   * @return {?Element}
   */
  #getCCButton() {
    const sel = '[jscontroller=iBwifb]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Get the Raise Hand button in the meeting room.
   *
   * @return {?Element}
   */
  #getHandButton() {
    const sel = '[jscontroller=LtjzW]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Get the Stop Presenting button in the meeting room.
   *
   * @return {?Element}
   */
  #getStopPresentingButton() {
    const sel = '[jsname=aK5XXd]';
    return document.querySelector(sel);
  }

  /**
   * Get the Info button in the meeting room.
   *
   * @return {?Element}
   */
  #getInfoButton() {
    const sel = 'div.r6xAKc [data-panel-id="5"]';
    return document.querySelector(sel);
  }

  /**
   * Get the People button in the meeting room.
   *
   * @return {?Element}
   */
  #getPeopleButton() {
    const sel = 'div.r6xAKc [data-panel-id="1"]';
    return document.querySelector(sel);
  }

  /**
   * Get the Chat button in the meeting room.
   *
   * @return {?Element}
   */
  #getChatButton() {
    const sel = 'div.r6xAKc [data-panel-id="2"]';
    return document.querySelector(sel);
   }

  /**
   * Get the Activities button in the meeting room.
   *
   * @return {?Element}
   */
  #getActivitiesButton() {
    const sel = 'div.ov7jof [data-panel-id="10"]';
    return document.querySelector(sel);
  }

  /**
   * Gets the Send a reaction button in the meeting room.
   *
   * @return {?Element}
   */
  #getReactionButton() {
    const sel = '[jscontroller=aTG8jc]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Gets the Send a reaction bar in the meeting room.
   *
   * @return {?Element}
   */
  #getReactionBar() {
    const sel = '[jscontroller=tdX73b]';
    return document.querySelector(sel);
  }

  /**
   * heart data-emoji="💖"
   * thumbUp data-emoji="👍"
   * partyPopper data-emoji="🎉"
   * clap data-emoji="👏"
   * joy data-emoji="😂"
   * astonish data-emoji="😮"
   * cry data-emoji="😢"
   * think data-emoji="🤔"
   * thumb_down data-emoji="👎"
   * plus data-emoji="➕"
   * crab data-emoji="🦀"
   */


  #getHeartButton() {
    const sel = 'div.nnCtR [data-emoji="💖"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getThumbUpButton() {
    const sel = 'div.nnCtR [data-emoji="👍"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getPartyPopperButton() {
    const sel = 'div.nnCtR [data-emoji="🎉"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getClapButton() {
    const sel = 'div.nnCtR [data-emoji="👏"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getJoyButton() {
    const sel = 'div.nnCtR [data-emoji="😂"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getAstonishButton() {
    const sel = 'div.nnCtR [data-emoji="😮"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getCryButton() {
    const sel = 'div.nnCtR [data-emoji="😢"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getThinkButton() {
    const sel = 'div.nnCtR [data-emoji="🤔"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getThumbDownButton() {
    const sel = 'div.nnCtR [data-emoji="👎"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getPlusButton() {
    const sel = 'div.nnCtR [data-emoji="➕"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  #getCrabButton() {
    const sel = 'div.nnCtR [data-emoji="🦀"]';
    return document.querySelector(sel)?.querySelector('button');
  }

  /**
   * Gets the send a reaction emoji button in the meeting room.
   *
   * @param {string} emoji Emoji to find
   * @return {?Element}
   */
  #getReactionEmojiButton(emoji) {
    const sel = `[aria-label=${emoji}]`;
    return document.querySelector(sel);
  }

  /**
   * Get the Hang Up button in the meeting room.
   *
   * @return {?Element}
   */
  #getHangupButton() {
    const sel = '[jsname=CQylAd]';
    return document.querySelector(sel);
  }

  /**
   * Get the Mic button in the green room.
   *
   * @return {?Element}
   */
  #getGreenRoomMicButton() {
    const sel = '[jsname=Dg9Wp]';
    return document.querySelector(sel)?.querySelector('[role=button]');
  }

  /**
   * Get the Camera button in the green room.
   *
   * @return {?Element}
   */
  #getGreenRoomCamButton() {
    const sel = '[jsname=R3GXJb]';
    return document.querySelector(sel)?.querySelector('[role=button]');
  }

  /**
   * Get the Rejoin Meeting button in the exit hall.
   *
   * @return {?Element}
   */
  #getRejoinButton() {
    const sel = '[jsname=oI7Fj] button';
    return document.querySelector(sel);
  }

  /**
   * Get the Return to Home button in the exit hall.
   *
   * @return {?Element}
   */
  #getReturnToHomeButton() {
    const sel = '[jsname=WIVZEd] button';
    return document.querySelector(sel);
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * Helpers to interact with Meet UI elements.
   *
   */

  /**
   * Wrapper for clicking on a button with logging if the button cannot be
   * found.
   *
   * @param {Element} button Button to click
   * @param {?String} buttName Name of button (used for logging only)
   */
  #tapButtonWrapper(button, buttName) {
    if (button) {
      button.click();
      return;
    }
    console.warn('*SD-Meet*', `Unable to find/click button '${buttName}'`);
  }

  /**
   * Toggles the tab between full screen and regular.
   */
//  async #toggleFullScreen() {
//    try {
//      if (document.fullscreenElement) {
//        await document.exitFullscreen();
//      } else {
//        await document.body.requestFullscreen();
//      }
//    } catch (ex) {
//      // Cannot do fullscreen, disable the button.
//      this.#drawButton(`fullscreen-disabled`);
//    }
//  }

  /**
   * Starts an instant meeting (lobby).
   */
  #tapStartInstantMeeting() {
    const button = this.#getStartInstantMeetingButton();
    this.#tapButtonWrapper(button, 'startInstant');
  }

  /**
   * Starts the next meeting (lobby).
   */
  #tapStartNextMeeting() {
    const button = this.#getStartNextMeetingButton();
    this.#tapButtonWrapper(button, 'startNext');
  }

  /**
   * Taps the mic button, to mute/unmute the mic (green room).
   */
  #tapGreenRoomMic() {
    const button = this.#getGreenRoomMicButton();
    this.#tapButtonWrapper(button, 'greenMic');
  }

  /**
   * Taps the camera button, to mute/unmute the camera (green room).
   */
  #tapGreenRoomCam() {
    const button = this.#getGreenRoomCamButton();
    this.#tapButtonWrapper(button, 'greenCam');
  }

  /**
   * Enter/join meeting (green room).
   */
  #tapEnterMeeting() {
    const button = this.#getEnterMeetingButton();
    this.#tapButtonWrapper(button, 'enterMeeting');
  }

  /**
   * Taps the mic button to mute/unmute (meeting room).
   */
  #tapMic() {
    const button = this.#getMicButton();
    this.#tapButtonWrapper(button, 'micOnOff');
  }

  /**
   * Taps the camera button, to mute/unmute (meeting room).
   */
  #tapCam() {
    const button = this.#getCamButton();
    this.#tapButtonWrapper(button, 'camOnOff');
  }

  /**
   * Taps the handup button, to toggle the hand state (meeting room).
   */
  #tapHand() {
    const button = this.#getHandButton();
    this.#tapButtonWrapper(button, 'hand');
  }

  /**
   * Taps the CC button, to toggle the captions (meeting room).
   */
  #tapCC() {
    const button = this.#getCCButton();
    this.#tapButtonWrapper(button, 'cc');
  }

  /**
   * Taps the Info button, to toggle info panel (meeting room).
   */
  #tapInfo() {
    const button = this.#getInfoButton();
    this.#tapButtonWrapper(button, 'info');
  }

  /**
   * Taps the Users button, to toggle the list of users (meeting room).
   */
  #tapUsers() {
    const button = this.#getPeopleButton();
    this.#tapButtonWrapper(button, 'people');
  }

  /**
   * Taps the Chat button, to toggle the chat panel (meeting room).
   */
  #tapChat() {
    const button = this.#getChatButton();
    this.#tapButtonWrapper(button, 'chat');
  }

  /**
   * Taps the Activities button, to toggle activities panel (meeting room).
   */
  #tapActivities() {
    const button = this.#getActivitiesButton();
    this.#tapButtonWrapper(button, 'activities');
  }

  /**
   * Taps the Send a reaction button, to toggle reaction panel (meeting room).
   */
  #tapReactions() {
    const button = this.#getReactionButton();
    this.#tapButtonWrapper(button, 'reactions');
  }

  #tapHeart() {
    const button = this.#getHeartButton();
    this.#tapButtonWrapper(button, 'heart');
  }

  #tapThumbUp() {
    const button = this.#getThumbUpButton();
    this.#tapButtonWrapper(button, 'thumbUp');
  }

  #tapPartyPopper() {
    const button = this.#getPartyPopperButton();
    this.#tapButtonWrapper(button, 'partyPopper');
  }

  #tapClap() {
    const button = this.#getClapButton();
    this.#tapButtonWrapper(button, 'clap');
  }

  #tapJoy() {
    const button = this.#getJoyButton();
    this.#tapButtonWrapper(button, 'joy');
  }

  #tapAstonish() {
    const button = this.#getAstonishButton();
    this.#tapButtonWrapper(button, 'astonish');
  }

  #tapCry() {
    const button = this.#getCryButton();
    this.#tapButtonWrapper(button, 'cry');
  }

  #tapThink() {
    const button = this.#getThinkButton();
    this.#tapButtonWrapper(button, 'think');
  }

  #tapThumbDown() {
    const button = this.#getThumbDownButton();
    this.#tapButtonWrapper(button, 'thumbDown');
  }

  #tapPlus() {
    const button = this.#getPlusButton();
    this.#tapButtonWrapper(button, 'plus');
  }

  #tapCrab() {
    const button = this.#getCrabButton();
    this.#tapButtonWrapper(button, 'crab');
  }

  /**
   * Taps the stop presenting button (meeting room).
   */
  #tapStopPresenting() {
    const button = this.#getStopPresentingButton();
    this.#tapButtonWrapper(button, 'stopPresenting');
  }

  /**
   * Taps close button on the meeting info dialog (meeting room).
   */
  #tapCloseInfoDialog() {
    const button = this.#getMeetingInfoDialogCloseButton();
    // We most likely don't care if this isn't open, if it is, close it
    // but no need to log that we couldn't find it.
    if (button) {
      button.click();
    }
  }

  /**
   * Taps the Hang Up button, to end the call (meeting room).
   */
  #tapHangUp() {
    const button = this.#getHangupButton();
    this.#tapButtonWrapper(button, 'hangUp');
  }

  /**
   * Taps the Rejoin button (exit hall).
   */
  #tapRejoin() {
    const button = this.#getRejoinButton();
    this.#tapButtonWrapper(button, 'reJoin');
  }

  /**
   * Taps the Return to Home Screen button (exit hall).
   */
  #tapHome() {
    const button = this.#getReturnToHomeButton();
    this.#tapButtonWrapper(button, 'returnToHome');
  }
}
